-- Vocabulary Builder: turn on server enforcement of mission identity (the app now starts missions through start_vocabulary_mission).
--
-- 1. start_vocabulary_mission: a mission untouched for 12 hours is abandoned and replaced (record_vocabulary_mission refuses missions older
--    than 12 hours, so resuming one would strand the student's work). Otherwise unchanged.
-- 2. A mission can only be RECORDED if the server issued it to that student and it is still open. This is a BEFORE INSERT check on
--    vocabulary_missions, so record_vocabulary_mission itself (and its anti-tamper rules) is untouched, and a forged, client-minted,
--    other-student, abandoned or already-closed mission id cannot produce a mission row.
-- 3. The attempt Edge Function applies the same rule to attempts (see vocabulary-attempt-action). Attempts with NO mission id are unaffected.
--
-- Apply AFTER 20261024120000_vocabulary_mission_identity.sql and AFTER deploying the app + Edge Function that send server-issued ids.

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

create or replace function private.vocabulary_mission_derive_outcome()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.vocabulary_mission_starts s
    where s.mission_id = new.mission_id and s.student_id = new.student_id and s.status = 'open'
  ) then
    raise exception 'Mission was not issued by the server';
  end if;
  -- The score was derived from the student's own server-graded attempts. Whatever a caller supplied for outcome is discarded.
  new.outcome := case when new.score >= 8 then 'pass' when new.score >= 6 then 'consolidate' else 'recovery' end;
  return new;
end;
$$;
revoke all on function private.vocabulary_mission_derive_outcome() from public, anon, authenticated;
