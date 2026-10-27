-- Teacher Activity dashboard: secure, read-only analytics boundary.
-- The function authenticates the caller and derives teacher scope from current class assignments.
-- It returns only teacher-safe progress/score/event metadata; no answer text or private learning text.

create or replace function public.teacher_activity_rows()
returns table(record_type text, payload jsonb)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor_role public.user_role;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  actor_role := (select private.current_role());
  if actor_role is null
     or actor_role not in ('teacher'::public.user_role, 'admin'::public.user_role) then
    raise exception 'Not authorised for teacher Activity' using errcode = '42501';
  end if;

  return query
  with scoped_students as (
    select distinct
      p.id as student_id,
      p.display_name,
      scm.class_id,
      c.class_name
    from public.profiles p
    join public.student_class_memberships scm
      on scm.student_id = p.id
     and scm.ended_at is null
    join public.classes c
      on c.id = scm.class_id
     and c.active = true
    where p.role = 'student'::public.user_role
      and p.active = true
      and (
        actor_role = 'admin'::public.user_role
        or exists (
          select 1
          from public.teacher_classes tc
          where tc.teacher_id = (select auth.uid())
            and tc.class_id = scm.class_id
        )
      )
  ),
  safe_activity as (
    select
      ae.id,
      ae.user_id,
      ae.class_id,
      ae.app_key,
      ae.event_type,
      ae.activity_id,
      ae.skill,
      ae.set_id,
      ae.mode,
      ae.strong,
      ae.score,
      ae.max_score,
      ae.active_seconds,
      ae.occurred_at,
      jsonb_strip_nulls(jsonb_build_object(
        'unit_number', ae.metadata -> 'unit_number',
        'strand', ae.metadata -> 'strand',
        'question_type', ae.metadata -> 'question_type',
        'attempt_number', ae.metadata -> 'attempt_number',
        'outcome', ae.metadata -> 'outcome',
        'retry_used', ae.metadata -> 'retry_used',
        'recovery', ae.metadata -> 'recovery',
        'misconception', ae.metadata -> 'misconception',
        'evidence_strength', ae.metadata -> 'evidence_strength',
        'support_level', ae.metadata -> 'support_level',
        'target_id', ae.metadata -> 'target_id',
        'occurrence_id', ae.metadata -> 'occurrence_id',
        'practice_focus', ae.metadata -> 'practice_focus',
        'skill_family', ae.metadata -> 'skill_family',
        'pathway_id', ae.metadata -> 'pathway_id',
        'pathway_stage', ae.metadata -> 'pathway_stage',
        'served_pathway_stage', ae.metadata -> 'served_pathway_stage'
      )) as metadata
    from public.activity_events ae
    join scoped_students ss on ss.student_id = ae.user_id
  )
  select 'student'::text, jsonb_build_object(
    'student_id', ss.student_id,
    'display_name', ss.display_name,
    'class_id', ss.class_id,
    'class_name', ss.class_name
  )
  from scoped_students ss

  union all
  select 'activity', jsonb_build_object(
    'id', sa.id,
    'student_id', sa.user_id,
    'class_id', sa.class_id,
    'app_key', sa.app_key,
    'event_type', sa.event_type,
    'activity_id', sa.activity_id,
    'skill', sa.skill,
    'set_id', sa.set_id,
    'mode', sa.mode,
    'strong', sa.strong,
    'score', sa.score,
    'max_score', sa.max_score,
    'active_seconds', sa.active_seconds,
    'metadata', sa.metadata,
    'occurred_at', sa.occurred_at
  )
  from safe_activity sa

  union all
  select 'vocabulary_global_mastery', jsonb_build_object(
    'student_id', vgm.student_id,
    'vocabulary_id', vgm.vocabulary_id,
    'status', vgm.status,
    'strand_evidence', vgm.strand_evidence,
    'recent_error_pattern', vgm.recent_error_pattern,
    'last_seen_at', vgm.last_seen_at,
    'updated_at', vgm.updated_at
  )
  from public.vocabulary_global_mastery vgm
  join scoped_students ss on ss.student_id = vgm.student_id

  union all
  select 'vocabulary_unit_mastery', jsonb_build_object(
    'student_id', vum.student_id,
    'occurrence_id', vum.occurrence_id,
    'status', vum.status,
    'contextual_evidence', vum.contextual_evidence,
    'recent_error_pattern', vum.recent_error_pattern,
    'last_seen_at', vum.last_seen_at,
    'updated_at', vum.updated_at
  )
  from public.vocabulary_unit_mastery vum
  join scoped_students ss on ss.student_id = vum.student_id

  union all
  select 'unit_check', jsonb_build_object(
    'id', uca.id,
    'student_id', uca.student_id,
    'unit_number', uca.unit_number,
    'form_id', uca.form_id,
    'attempt_number', uca.attempt_number,
    'score', uca.score,
    'max_score', uca.max_score,
    'completed_at', uca.completed_at
  )
  from public.vocabulary_unit_check_attempts uca
  join scoped_students ss on ss.student_id = uca.student_id

  union all
  select 'merit_award', jsonb_build_object(
    'student_id', vma.student_id,
    'merit_number', vma.merit_number,
    'awarded_by', vma.awarded_by,
    'awarded_at', vma.awarded_at
  )
  from public.vocabulary_merit_awards vma
  join scoped_students ss on ss.student_id = vma.student_id;
end;
$$;

revoke all on function public.teacher_activity_rows() from public, anon;
grant execute on function public.teacher_activity_rows() to authenticated;
