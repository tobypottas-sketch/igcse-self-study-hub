create or replace function public.apply_vocabulary_mastery_state(
  p_student_id uuid,
  p_vocabulary_id text,
  p_occurrence_id text,
  p_global_status text,
  p_global_strand_evidence jsonb,
  p_successful_productions integer,
  p_production_context_ids jsonb,
  p_review_stage integer,
  p_review_due_at timestamptz,
  p_review_failure_count integer,
  p_global_error_pattern text,
  p_unit_status text,
  p_unit_contextual_evidence jsonb,
  p_unit_error_pattern text,
  p_seen_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_global_status not in ('new','building','secure','mastered')
     or p_unit_status not in ('new','building','secure','mastered') then
    raise exception 'Invalid vocabulary mastery status';
  end if;

  insert into public.vocabulary_global_mastery (
    student_id,
    vocabulary_id,
    status,
    strand_evidence,
    successful_productions,
    production_context_ids,
    review_stage,
    review_due_at,
    review_failure_count,
    recent_error_pattern,
    last_seen_at,
    updated_at
  ) values (
    p_student_id,
    p_vocabulary_id,
    p_global_status,
    coalesce(p_global_strand_evidence, '{}'::jsonb),
    greatest(coalesce(p_successful_productions, 0), 0),
    coalesce(p_production_context_ids, '[]'::jsonb),
    greatest(coalesce(p_review_stage, 0), 0),
    p_review_due_at,
    greatest(coalesce(p_review_failure_count, 0), 0),
    p_global_error_pattern,
    p_seen_at,
    p_seen_at
  )
  on conflict (student_id, vocabulary_id) do update set
    status = excluded.status,
    strand_evidence = excluded.strand_evidence,
    successful_productions = excluded.successful_productions,
    production_context_ids = excluded.production_context_ids,
    review_stage = excluded.review_stage,
    review_due_at = excluded.review_due_at,
    review_failure_count = excluded.review_failure_count,
    recent_error_pattern = excluded.recent_error_pattern,
    last_seen_at = excluded.last_seen_at,
    updated_at = excluded.updated_at;

  insert into public.vocabulary_unit_mastery (
    student_id,
    occurrence_id,
    status,
    contextual_evidence,
    recent_error_pattern,
    last_seen_at,
    updated_at
  ) values (
    p_student_id,
    p_occurrence_id,
    p_unit_status,
    coalesce(p_unit_contextual_evidence, '{}'::jsonb),
    p_unit_error_pattern,
    p_seen_at,
    p_seen_at
  )
  on conflict (student_id, occurrence_id) do update set
    status = excluded.status,
    contextual_evidence = excluded.contextual_evidence,
    recent_error_pattern = excluded.recent_error_pattern,
    last_seen_at = excluded.last_seen_at,
    updated_at = excluded.updated_at;
end;
$$;

revoke all on function public.apply_vocabulary_mastery_state(
  uuid, text, text, text, jsonb, integer, jsonb, integer, timestamptz, integer,
  text, text, jsonb, text, timestamptz
) from public, anon, authenticated;

grant execute on function public.apply_vocabulary_mastery_state(
  uuid, text, text, text, jsonb, integer, jsonb, integer, timestamptz, integer,
  text, text, jsonb, text, timestamptz
) to service_role;
