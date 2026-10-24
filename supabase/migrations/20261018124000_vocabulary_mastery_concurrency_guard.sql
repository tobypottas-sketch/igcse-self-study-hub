create or replace function public.commit_vocabulary_attempt(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_attempt_id uuid;
  v_update_mastery boolean;
  v_event_id uuid;
  v_existing_event_id uuid;
  v_seen_at timestamptz;
  v_commit_at timestamptz;
  v_global_status text;
  v_unit_status text;
  v_vocabulary_id text;
  v_occurrence_id text;
  v_expected_global_exists boolean;
  v_expected_unit_exists boolean;
  v_expected_global_updated_at timestamptz;
  v_expected_unit_updated_at timestamptz;
  v_actual_global_exists boolean := false;
  v_actual_unit_exists boolean := false;
  v_actual_global_updated_at timestamptz;
  v_actual_unit_updated_at timestamptz;
begin
  v_student_id := (p_payload->>'student_id')::uuid;
  v_attempt_id := (p_payload->>'attempt_id')::uuid;
  v_update_mastery := coalesce((p_payload->>'update_mastery')::boolean, false);
  v_seen_at := coalesce((p_payload->>'seen_at')::timestamptz, now());

  if v_student_id is null or v_attempt_id is null then
    raise exception 'Vocabulary attempt identity is required';
  end if;

  select ae.id
    into v_existing_event_id
  from public.activity_events ae
  where ae.attempt_id = v_attempt_id;

  if v_existing_event_id is not null then
    return jsonb_build_object('committed', false, 'duplicate', true, 'conflict', false);
  end if;

  if v_update_mastery then
    v_vocabulary_id := p_payload->>'vocabulary_id';
    v_occurrence_id := p_payload->>'occurrence_id';
    v_global_status := p_payload->>'global_status';
    v_unit_status := p_payload->>'unit_status';
    v_expected_global_exists := coalesce((p_payload->>'expected_global_exists')::boolean, false);
    v_expected_unit_exists := coalesce((p_payload->>'expected_unit_exists')::boolean, false);
    v_expected_global_updated_at := nullif(p_payload->>'expected_global_updated_at','')::timestamptz;
    v_expected_unit_updated_at := nullif(p_payload->>'expected_unit_updated_at','')::timestamptz;

    if v_global_status not in ('new','building','secure','mastered')
       or v_unit_status not in ('new','building','secure','mastered') then
      raise exception 'Invalid vocabulary mastery status';
    end if;

    if v_vocabulary_id is null or v_occurrence_id is null then
      raise exception 'Vocabulary mastery target is required';
    end if;

    -- Serialize the full compare-and-commit phase for this student + vocabulary target.
    perform pg_advisory_xact_lock(hashtextextended(v_student_id::text || ':' || v_vocabulary_id, 0));

    select true, gm.updated_at
      into v_actual_global_exists, v_actual_global_updated_at
    from public.vocabulary_global_mastery gm
    where gm.student_id = v_student_id
      and gm.vocabulary_id = v_vocabulary_id
    for update;
    if not found then
      v_actual_global_exists := false;
      v_actual_global_updated_at := null;
    end if;

    select true, um.updated_at
      into v_actual_unit_exists, v_actual_unit_updated_at
    from public.vocabulary_unit_mastery um
    where um.student_id = v_student_id
      and um.occurrence_id = v_occurrence_id
    for update;
    if not found then
      v_actual_unit_exists := false;
      v_actual_unit_updated_at := null;
    end if;

    if v_expected_global_exists is distinct from v_actual_global_exists
       or v_expected_unit_exists is distinct from v_actual_unit_exists
       or (v_expected_global_exists and v_expected_global_updated_at is distinct from v_actual_global_updated_at)
       or (v_expected_unit_exists and v_expected_unit_updated_at is distinct from v_actual_unit_updated_at) then
      return jsonb_build_object(
        'committed', false,
        'duplicate', false,
        'conflict', true,
        'reason', 'mastery_conflict'
      );
    end if;
  end if;

  insert into public.activity_events (
    attempt_id,
    user_id,
    app_key,
    event_type,
    activity_id,
    skill,
    set_id,
    mode,
    strong,
    score,
    max_score,
    metadata,
    occurred_at
  ) values (
    v_attempt_id,
    v_student_id,
    p_payload->>'app_key',
    p_payload->>'event_type',
    p_payload->>'activity_id',
    p_payload->>'skill',
    p_payload->>'set_id',
    p_payload->>'mode',
    coalesce((p_payload->>'strong')::boolean, false),
    (p_payload->>'score')::integer,
    (p_payload->>'max_score')::integer,
    coalesce(p_payload->'metadata', '{}'::jsonb),
    v_seen_at
  )
  on conflict (attempt_id) where attempt_id is not null do nothing
  returning id into v_event_id;

  if v_event_id is null then
    return jsonb_build_object('committed', false, 'duplicate', true, 'conflict', false);
  end if;

  if v_update_mastery then
    v_commit_at := clock_timestamp();

    insert into public.vocabulary_global_mastery (
      student_id,
      vocabulary_id,
      status,
      strand_evidence,
      successful_productions,
      production_context_ids,
      production_activity_types,
      unscaffolded_productions,
      review_stage,
      review_due_at,
      review_failure_count,
      recent_error_pattern,
      last_seen_at,
      updated_at
    ) values (
      v_student_id,
      v_vocabulary_id,
      v_global_status,
      coalesce(p_payload->'global_strand_evidence', '{}'::jsonb),
      greatest(coalesce((p_payload->>'successful_productions')::integer, 0), 0),
      coalesce(p_payload->'production_context_ids', '[]'::jsonb),
      coalesce(p_payload->'production_activity_types', '[]'::jsonb),
      greatest(coalesce((p_payload->>'unscaffolded_productions')::integer, 0), 0),
      greatest(coalesce((p_payload->>'review_stage')::integer, 0), 0),
      (p_payload->>'review_due_at')::timestamptz,
      greatest(coalesce((p_payload->>'review_failure_count')::integer, 0), 0),
      nullif(p_payload->>'global_error_pattern',''),
      v_seen_at,
      v_commit_at
    )
    on conflict (student_id, vocabulary_id) do update set
      status = excluded.status,
      strand_evidence = excluded.strand_evidence,
      successful_productions = excluded.successful_productions,
      production_context_ids = excluded.production_context_ids,
      production_activity_types = excluded.production_activity_types,
      unscaffolded_productions = excluded.unscaffolded_productions,
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
      v_student_id,
      v_occurrence_id,
      v_unit_status,
      coalesce(p_payload->'unit_contextual_evidence', '{}'::jsonb),
      nullif(p_payload->>'unit_error_pattern',''),
      v_seen_at,
      v_commit_at
    )
    on conflict (student_id, occurrence_id) do update set
      status = excluded.status,
      contextual_evidence = excluded.contextual_evidence,
      recent_error_pattern = excluded.recent_error_pattern,
      last_seen_at = excluded.last_seen_at,
      updated_at = excluded.updated_at;
  end if;

  return jsonb_build_object('committed', true, 'duplicate', false, 'conflict', false, 'event_id', v_event_id);
end;
$$;

revoke all on function public.commit_vocabulary_attempt(jsonb) from public, anon, authenticated;
grant execute on function public.commit_vocabulary_attempt(jsonb) to service_role;
