-- Vocabulary Builder: server-issued mission identity + server-derived mission outcome.
--
-- 1. vocabulary_mission_starts: the SERVER mints mission_id and mission_seed. The browser never chooses either.
-- 2. start_vocabulary_mission(...): NEW mission -> new id + new seed; resume -> same id + same seed; an abandoned mission followed by an
--    explicit NEW start -> new id + new seed. It accepts no id, seed or score from the caller.
-- 3. vocabulary_missions.outcome ('pass' | 'consolidate' | 'recovery'): derived by the database from the server-derived score
--    (8-10 / 6-7 / 0-5). A BEFORE INSERT trigger sets it, so record_vocabulary_mission (unchanged) cannot be bypassed or forged.
-- 4. A recorded mission closes its start row.
--
-- The mission seed drives reproducible content variation only. It is never an input to grading: the attempt Edge Function does not read it.
-- NOT enforced here (deliberately, until the app is wired): that attempts / record_vocabulary_mission REQUIRE a server-issued mission.
-- The current client still mints its own mission ids, so enforcing it now would break live practice.

-- 1 ---------------------------------------------------------------------------------------------------------------------
create table if not exists public.vocabulary_mission_starts (
  mission_id uuid primary key default gen_random_uuid(),
  mission_seed text not null default gen_random_uuid()::text check (char_length(mission_seed) between 16 and 64),
  student_id uuid not null references public.profiles(id) on delete cascade,
  unit_number integer not null check (unit_number between 1 and 20),
  mission_kind text not null check (mission_kind in ('pathway','mixed')),
  pathway_id text check (pathway_id is null or pathway_id in ('meaning','context','word_families','paraphrasing','precision_use','spelling_recall')),
  pathway_stage text check (pathway_stage is null or pathway_stage in ('recognise','match','apply','recall','mastery')),
  mission_phase text not null default 'stage' check (mission_phase in ('stage','consolidate','recovery')),
  status text not null default 'open' check (status in ('open','abandoned','completed')),
  started_at timestamptz not null default now(),
  last_resumed_at timestamptz not null default now(),
  ended_at timestamptz,
  check ((mission_kind = 'pathway' and pathway_id is not null and pathway_stage is not null)
      or (mission_kind = 'mixed' and pathway_id is null and pathway_stage is null))
);

-- At most one OPEN mission per student, unit, kind, pathway and stage: that is what makes "resume" unambiguous.
create unique index if not exists vocabulary_mission_starts_one_open_idx
on public.vocabulary_mission_starts (student_id, unit_number, mission_kind, coalesce(pathway_id, ''), coalesce(pathway_stage, ''))
where status = 'open';

create index if not exists vocabulary_mission_starts_student_time_idx
on public.vocabulary_mission_starts (student_id, started_at desc);

alter table public.vocabulary_mission_starts enable row level security;
revoke all on public.vocabulary_mission_starts from anon, authenticated;
grant select on public.vocabulary_mission_starts to authenticated;

drop policy if exists vocabulary_mission_starts_select on public.vocabulary_mission_starts;
create policy vocabulary_mission_starts_select on public.vocabulary_mission_starts
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
create or replace function public.start_vocabulary_mission(
  p_unit_number integer,
  p_mission_kind text,
  p_pathway_id text default null,
  p_pathway_stage text default null,
  p_mission_phase text default 'stage',
  p_new boolean default false
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student uuid := (select auth.uid());
  v_row public.vocabulary_mission_starts;
  v_resumed boolean := false;
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
  if coalesce(p_mission_phase, 'stage') not in ('stage','consolidate','recovery') then
    raise exception 'Invalid mission phase';
  end if;
  if p_mission_kind = 'pathway' and (p_pathway_id is null or p_pathway_stage is null) then
    raise exception 'A pathway mission needs a pathway and a stage';
  end if;
  if p_mission_kind = 'mixed' and (p_pathway_id is not null or p_pathway_stage is not null) then
    raise exception 'A mixed mission has no pathway or stage';
  end if;

  -- Serialise starts for one student so two tabs cannot both mint "the" open mission.
  perform pg_advisory_xact_lock(hashtextextended('vocabulary_mission_start:' || v_student::text, 0));

  select * into v_row from public.vocabulary_mission_starts
  where student_id = v_student and unit_number = p_unit_number and mission_kind = p_mission_kind
    and coalesce(pathway_id, '') = coalesce(p_pathway_id, '') and coalesce(pathway_stage, '') = coalesce(p_pathway_stage, '')
    and status = 'open';

  if found and not coalesce(p_new, false) then
    update public.vocabulary_mission_starts set last_resumed_at = now() where mission_id = v_row.mission_id returning * into v_row;
    v_resumed := true;                       -- same mission_id, same mission_seed
  else
    if found then                            -- an explicit NEW start abandons the open mission
      update public.vocabulary_mission_starts set status = 'abandoned', ended_at = now() where mission_id = v_row.mission_id;
    end if;
    insert into public.vocabulary_mission_starts (student_id, unit_number, mission_kind, pathway_id, pathway_stage, mission_phase)
    values (v_student, p_unit_number, p_mission_kind, p_pathway_id, p_pathway_stage, coalesce(p_mission_phase, 'stage'))
    returning * into v_row;                  -- id and seed come from the column defaults, i.e. from the server
  end if;

  return jsonb_build_object(
    'mission_id', v_row.mission_id, 'mission_seed', v_row.mission_seed, 'resumed', v_resumed,
    'mission_kind', v_row.mission_kind, 'pathway_id', v_row.pathway_id, 'pathway_stage', v_row.pathway_stage,
    'mission_phase', v_row.mission_phase, 'started_at', v_row.started_at
  );
end;
$$;

revoke all on function public.start_vocabulary_mission(integer, text, text, text, text, boolean) from public, anon;
grant execute on function public.start_vocabulary_mission(integer, text, text, text, text, boolean) to authenticated;

-- 3 ---------------------------------------------------------------------------------------------------------------------
alter table public.vocabulary_missions add column if not exists outcome text
  check (outcome is null or outcome in ('pass','consolidate','recovery'));

create or replace function private.vocabulary_mission_derive_outcome()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- The score was derived from the student's own server-graded attempts. Whatever a caller supplied for outcome is discarded.
  new.outcome := case when new.score >= 8 then 'pass' when new.score >= 6 then 'consolidate' else 'recovery' end;
  return new;
end;
$$;
revoke all on function private.vocabulary_mission_derive_outcome() from public, anon, authenticated;

drop trigger if exists vocabulary_missions_derive_outcome on public.vocabulary_missions;
create trigger vocabulary_missions_derive_outcome
before insert on public.vocabulary_missions
for each row execute function private.vocabulary_mission_derive_outcome();

update public.vocabulary_missions
set outcome = case when score >= 8 then 'pass' when score >= 6 then 'consolidate' else 'recovery' end
where outcome is null;

-- 4 ---------------------------------------------------------------------------------------------------------------------
create or replace function private.vocabulary_mission_close_start()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.vocabulary_mission_starts
  set status = 'completed', ended_at = coalesce(ended_at, now())
  where mission_id = new.mission_id and student_id = new.student_id and status = 'open';
  return null;
end;
$$;
revoke all on function private.vocabulary_mission_close_start() from public, anon, authenticated;

drop trigger if exists vocabulary_missions_close_start on public.vocabulary_missions;
create trigger vocabulary_missions_close_start
after insert on public.vocabulary_missions
for each row execute function private.vocabulary_mission_close_start();
