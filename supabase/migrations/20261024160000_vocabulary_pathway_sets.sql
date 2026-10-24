-- Vocabulary Builder: server-held Sets-of-10 progression (STAGE_CONTRACT v2). The VISIBLE learning journey is owned by the server.
--
-- Per student + unit + pathway + Set, public.vocabulary_pathway_sets holds the visible stage (recognise -> match -> apply -> recall ->
-- mastery, then maintain), the pending phase (stage | consolidate | recovery | fresh), advanced-with-support flags and weak target ids.
-- It holds NO granular evidence: successes, clean successes, prompt keys, mastery status and review stage stay exactly where they were
-- (vocabulary_unit_mastery / vocabulary_global_mastery) and keep being written by the attempt Edge Function. They no longer decide the visible stage.
--
-- 1. The table: RLS, students read their own rows, nobody can write it directly.
-- 2. start_vocabulary_mission gains p_set_progression / p_set_number. With p_set_progression the SERVER decides which Set, stage and phase the
--    mission is for (the caller cannot ask for a later stage, an earlier one, or another Set). Calls that omit them behave exactly as before.
-- 3. An AFTER INSERT trigger on vocabulary_missions applies the server-derived mission outcome to the Set (a port of src/vocabulary/stage-progression.js):
--       stage mission   8-10 pass -> next stage | 6-7 -> Consolidate | 0-5 -> Recovery
--       Consolidate     pass -> next stage      | otherwise -> Recovery
--       Recovery        never advances          -> one fresh full stage mission
--       fresh           advances whatever the score (below 8 = advanced_with_support, weak target ids kept, never blocking)
--       passing Mastery -> the Set is Maintain and never falls back.
--    It runs only for a mission the server issued FOR a Set (an open start row with a set number), once per mission id.
--
-- Apply AFTER 20261024120000_vocabulary_mission_identity.sql AND 20261024140000_vocabulary_mission_enforcement.sql (this file replaces
-- start_vocabulary_mission with the 20261024140000 behaviour plus the two new optional arguments). Additive: no existing column is dropped.

-- 1 ---------------------------------------------------------------------------------------------------------------------
create table if not exists public.vocabulary_pathway_sets (
  student_id uuid not null references public.profiles(id) on delete cascade,
  unit_number integer not null check (unit_number between 1 and 20),
  pathway_id text not null check (pathway_id in ('meaning','context','word_families','paraphrasing','precision_use','spelling_recall')),
  set_number integer not null check (set_number between 1 and 12),
  stage text not null default 'recognise' check (stage in ('recognise','match','apply','recall','mastery')),
  phase text not null default 'stage' check (phase in ('stage','consolidate','recovery','fresh')),
  status text not null default 'active' check (status in ('active','maintain')),
  completed_stages text[] not null default '{}',
  weak_target_ids text[] not null default '{}',
  advanced_with_support jsonb not null default '[]'::jsonb,
  support_flags jsonb not null default '[]'::jsonb,
  history jsonb not null default '[]'::jsonb,
  applied_mission_ids uuid[] not null default '{}',
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (student_id, unit_number, pathway_id, set_number),
  check ((status = 'maintain') = (completed_at is not null)),
  check (status <> 'maintain' or (stage = 'mastery' and phase = 'stage'))
);

alter table public.vocabulary_pathway_sets enable row level security;
revoke all on public.vocabulary_pathway_sets from anon, authenticated;
grant select on public.vocabulary_pathway_sets to authenticated;

drop policy if exists vocabulary_pathway_sets_select on public.vocabulary_pathway_sets;
create policy vocabulary_pathway_sets_select on public.vocabulary_pathway_sets
for select to authenticated
using (
  student_id = (select auth.uid())
  or (select private.current_role()) = 'admin'::public.user_role
  or (
    (select private.current_role()) = 'teacher'::public.user_role
    and (select private.teacher_can_access_student(student_id))
  )
);

-- 2 ---------------------------------------------------------------------------------------------------------------------
alter table public.vocabulary_mission_starts add column if not exists set_number integer check (set_number is null or set_number between 1 and 12);
alter table public.vocabulary_mission_starts add column if not exists set_phase text check (set_phase is null or set_phase in ('stage','consolidate','recovery','fresh'));
alter table public.vocabulary_missions add column if not exists set_number integer check (set_number is null or set_number between 1 and 12);
alter table public.vocabulary_missions add column if not exists set_phase text check (set_phase is null or set_phase in ('stage','consolidate','recovery','fresh'));

-- One open mission per student, unit, kind, pathway, stage AND Set (a free-practice mission has no Set and may coexist with a Set mission).
drop index if exists public.vocabulary_mission_starts_one_open_idx;
create unique index if not exists vocabulary_mission_starts_one_open_idx
on public.vocabulary_mission_starts (student_id, unit_number, mission_kind, coalesce(pathway_id, ''), coalesce(pathway_stage, ''), coalesce(set_number, 0))
where status = 'open';

drop function if exists public.start_vocabulary_mission(integer, text, text, text, text, boolean);
create or replace function public.start_vocabulary_mission(
  p_unit_number integer,
  p_mission_kind text,
  p_pathway_id text default null,
  p_pathway_stage text default null,
  p_mission_phase text default 'stage',
  p_new boolean default false,
  p_set_progression boolean default false,
  p_set_number integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := (select auth.uid());
  v_row public.vocabulary_mission_starts;
  v_set public.vocabulary_pathway_sets;
  v_resumed boolean := false;
  v_progress boolean := coalesce(p_set_progression, false) and p_mission_kind = 'pathway';
  v_stage text := p_pathway_stage;
  v_phase text := coalesce(p_mission_phase, 'stage');
  v_next integer;
begin
  if v_student is null then
    raise exception 'Sign in to start a mission';
  end if;
  if p_unit_number is null or p_unit_number < 1 or p_unit_number > 20 then
    raise exception 'Invalid unit number';
  end if;
  if p_mission_kind not in ('pathway','mixed') then
    raise exception 'Invalid mission kind';
  end if;
  if v_phase not in ('stage','consolidate','recovery') then
    raise exception 'Invalid mission phase';
  end if;
  if p_set_number is not null and (p_set_number < 1 or p_set_number > 12) then
    raise exception 'Invalid Set number';
  end if;
  if p_mission_kind = 'pathway' and p_pathway_id is null then
    raise exception 'A pathway mission needs a pathway';
  end if;
  if p_mission_kind = 'pathway' and not v_progress and p_pathway_stage is null then
    raise exception 'A pathway mission needs a pathway and a stage';
  end if;
  if p_mission_kind = 'mixed' and (p_pathway_id is not null or p_pathway_stage is not null) then
    raise exception 'A mixed mission has no pathway or stage';
  end if;

  -- Serialise starts for one student so two tabs cannot both mint "the" open mission.
  perform pg_advisory_xact_lock(hashtextextended('vocabulary_mission_start:' || v_student::text, 0));

  if v_progress then
    -- The server decides the Set, the stage and the phase. The caller's stage and phase are ignored.
    select * into v_set from public.vocabulary_pathway_sets
    where student_id = v_student and unit_number = p_unit_number and pathway_id = p_pathway_id and status = 'active'
    order by set_number limit 1;
    if not found then
      select coalesce(max(set_number), 0) + 1 into v_next from public.vocabulary_pathway_sets
      where student_id = v_student and unit_number = p_unit_number and pathway_id = p_pathway_id;
      if v_next > 1 and p_set_number is distinct from v_next then
        raise exception 'No further Set is available';          -- every started Set is already in Maintain; only the very next Set may be opened
      end if;
      if v_next > 12 then
        raise exception 'No further Set is available';
      end if;
      insert into public.vocabulary_pathway_sets (student_id, unit_number, pathway_id, set_number)
      values (v_student, p_unit_number, p_pathway_id, v_next)
      returning * into v_set;
    end if;
    v_stage := v_set.stage;
    v_phase := case v_set.phase when 'fresh' then 'stage' else v_set.phase end;

    -- A Set mission that is not exactly the Set's current step (an earlier stage, another Set, another phase) can no longer advance anything.
    update public.vocabulary_mission_starts
    set status = 'abandoned', ended_at = now()
    where student_id = v_student and unit_number = p_unit_number and mission_kind = 'pathway' and pathway_id = p_pathway_id
      and status = 'open' and set_number is not null
      and not (set_number = v_set.set_number and pathway_stage = v_stage and set_phase = v_set.phase);

    select * into v_row from public.vocabulary_mission_starts
    where student_id = v_student and unit_number = p_unit_number and mission_kind = 'pathway' and pathway_id = p_pathway_id
      and status = 'open' and set_number = v_set.set_number and pathway_stage = v_stage and set_phase = v_set.phase;
  else
    select * into v_row from public.vocabulary_mission_starts
    where student_id = v_student and unit_number = p_unit_number and mission_kind = p_mission_kind
      and coalesce(pathway_id, '') = coalesce(p_pathway_id, '') and coalesce(pathway_stage, '') = coalesce(p_pathway_stage, '')
      and set_number is null and status = 'open';
  end if;

  -- A mission nobody has touched for 12 hours is stale: record_vocabulary_mission refuses missions that old, so resuming it would strand
  -- the student's work. It is abandoned and a fresh mission is issued (same rule as an explicit NEW start).
  if found and v_row.last_resumed_at < now() - interval '12 hours' then
    p_new := true;
  end if;

  if found and not coalesce(p_new, false) then
    update public.vocabulary_mission_starts set last_resumed_at = now() where mission_id = v_row.mission_id returning * into v_row;
    v_resumed := true;                       -- same mission_id, same mission_seed
  else
    if found then                            -- an explicit NEW start abandons the open mission
      update public.vocabulary_mission_starts set status = 'abandoned', ended_at = now() where mission_id = v_row.mission_id;
    end if;
    insert into public.vocabulary_mission_starts (student_id, unit_number, mission_kind, pathway_id, pathway_stage, mission_phase, set_number, set_phase)
    values (v_student, p_unit_number, p_mission_kind, p_pathway_id, v_stage, v_phase,
            case when v_progress then v_set.set_number end, case when v_progress then v_set.phase end)
    returning * into v_row;                  -- id and seed come from the column defaults, i.e. from the server
  end if;

  return jsonb_build_object(
    'mission_id', v_row.mission_id, 'mission_seed', v_row.mission_seed, 'resumed', v_resumed,
    'mission_kind', v_row.mission_kind, 'pathway_id', v_row.pathway_id, 'pathway_stage', v_row.pathway_stage,
    'mission_phase', v_row.mission_phase, 'started_at', v_row.started_at,
    'set_number', v_row.set_number, 'set_phase', v_row.set_phase,
    'weak_target_ids', case when v_progress then to_jsonb(v_set.weak_target_ids) else '[]'::jsonb end
  );
end;
$$;

revoke all on function public.start_vocabulary_mission(integer, text, text, text, text, boolean, boolean, integer) from public, anon;
grant execute on function public.start_vocabulary_mission(integer, text, text, text, text, boolean, boolean, integer) to authenticated;

-- 3 ---------------------------------------------------------------------------------------------------------------------
create or replace function private.vocabulary_set_apply_mission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_stages constant text[] := array['recognise','match','apply','recall','mastery'];
  v_start public.vocabulary_mission_starts;
  v_set public.vocabulary_pathway_sets;
  v_outcome text;
  v_index integer;
  v_missed text[];
  v_advance boolean := false;
  v_stage text;
  v_phase text;
  v_status text;
  v_weak text[];
  v_completed text[];
  v_support jsonb;
  v_flags jsonb;
begin
  if new.mission_kind <> 'pathway' then
    return null;
  end if;
  -- Only a mission the server issued FOR a Set, and that is still open at this moment, can move that Set. (This trigger is named so that it runs
  -- before vocabulary_missions_close_start, which closes the start row.)
  select * into v_start from public.vocabulary_mission_starts
  where mission_id = new.mission_id and student_id = new.student_id;
  if not found or v_start.set_number is null or v_start.status <> 'open' then
    return null;
  end if;

  select * into v_set from public.vocabulary_pathway_sets
  where student_id = new.student_id and unit_number = v_start.unit_number and pathway_id = v_start.pathway_id and set_number = v_start.set_number
  for update;
  if not found then
    return null;
  end if;

  update public.vocabulary_missions set set_number = v_start.set_number, set_phase = v_start.set_phase where mission_id = new.mission_id;

  if new.mission_id = any(v_set.applied_mission_ids) then
    return null;                                                    -- a mission settles at most once
  end if;
  -- A replay of a finished Set, a stale step, or a mission whose recorded attempts name another stage is remembered but moves nothing.
  if v_set.status = 'maintain'
     or v_start.pathway_stage <> v_set.stage
     or v_start.set_phase <> v_set.phase
     or new.pathway_stage is distinct from v_start.pathway_stage
     or new.pathway_id is distinct from v_start.pathway_id
     or new.unit_number <> v_start.unit_number then
    update public.vocabulary_pathway_sets
    set applied_mission_ids = applied_mission_ids || new.mission_id, updated_at = now()
    where student_id = v_set.student_id and unit_number = v_set.unit_number and pathway_id = v_set.pathway_id and set_number = v_set.set_number;
    return null;
  end if;

  v_outcome := case when new.score >= 8 then 'pass' when new.score >= 6 then 'consolidate' else 'recovery' end;
  v_index := array_position(v_stages, v_set.stage);
  v_stage := v_set.stage; v_phase := v_set.phase; v_status := v_set.status;
  v_weak := v_set.weak_target_ids; v_completed := v_set.completed_stages;
  v_support := v_set.advanced_with_support; v_flags := v_set.support_flags;

  -- The targets the student did not get right first time in THIS mission (only needed when the mission is not a clean pass).
  if v_outcome <> 'pass' then
    select coalesce(array_agg(occ order by occ), '{}') into v_missed from (
      select ae.metadata->>'occurrence_id' as occ
      from public.activity_events ae
      where ae.user_id = new.student_id and ae.app_key = 'vocabulary_paraphrase' and ae.event_type = 'question_attempt'
        and ae.metadata->>'mission_id' = new.mission_id::text
      group by ae.metadata->>'occurrence_id'
      having not bool_or((ae.metadata->>'attempt_number') = '1' and ae.metadata->>'outcome' = 'correct')
    ) missed;
  else
    v_missed := '{}';
  end if;

  if v_set.phase = 'stage' then
    if v_outcome = 'pass' then v_advance := true;
    else v_phase := case when v_outcome = 'consolidate' then 'consolidate' else 'recovery' end; v_weak := v_missed; end if;
  elsif v_set.phase = 'consolidate' then
    if v_outcome = 'pass' then v_advance := true;
    else v_phase := 'recovery'; v_weak := v_missed; end if;
  elsif v_set.phase = 'recovery' then
    v_phase := 'fresh';                                              -- Recovery itself never advances
  else                                                               -- 'fresh': one fresh full stage mission, then the learner moves on
    v_advance := true;
    if v_outcome <> 'pass' then
      v_support := v_support || jsonb_build_array(jsonb_build_object('stage', v_set.stage, 'missionId', new.mission_id));
      v_flags := v_flags || jsonb_build_array(jsonb_build_object(
        'stage', v_set.stage, 'missionId', new.mission_id, 'targetIds', to_jsonb(v_missed),
        'reason', 'recovery_sequence_not_passed', 'blocksProgression', false));
    end if;
  end if;

  if v_advance then
    v_completed := v_completed || v_set.stage;
    v_weak := '{}';
    v_phase := 'stage';
    if v_index = array_length(v_stages, 1) then
      v_status := 'maintain';                                        -- passing Mastery: the Set is Maintain and never falls back
    else
      v_stage := v_stages[v_index + 1];
    end if;
  end if;

  update public.vocabulary_pathway_sets
  set stage = v_stage, phase = v_phase, status = v_status, weak_target_ids = v_weak, completed_stages = v_completed,
      advanced_with_support = v_support, support_flags = v_flags,
      history = history || jsonb_build_array(jsonb_build_object('missionId', new.mission_id, 'stage', v_set.stage, 'kind', v_set.phase, 'outcome', v_outcome, 'score', new.score)),
      applied_mission_ids = applied_mission_ids || new.mission_id,
      updated_at = now(),
      completed_at = case when v_status = 'maintain' then now() else null end
  where student_id = v_set.student_id and unit_number = v_set.unit_number and pathway_id = v_set.pathway_id and set_number = v_set.set_number;
  return null;
end;
$$;
revoke all on function private.vocabulary_set_apply_mission() from public, anon, authenticated;

-- Named so that it fires BEFORE vocabulary_missions_close_start (same event, alphabetical order).
drop trigger if exists vocabulary_missions_apply_set_progress on public.vocabulary_missions;
create trigger vocabulary_missions_apply_set_progress
after insert on public.vocabulary_missions
for each row execute function private.vocabulary_set_apply_mission();
