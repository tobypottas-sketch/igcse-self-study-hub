alter table public.activity_events
  add column if not exists attempt_id uuid;

create unique index if not exists activity_events_attempt_id_unique
on public.activity_events(attempt_id)
where attempt_id is not null;

create or replace function private.stamp_activity_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid;
  current_class uuid;
begin
  if (select auth.role()) = 'service_role' then
    actor_id := new.user_id;
  else
    actor_id := (select auth.uid());
    new.user_id := actor_id;
  end if;

  if actor_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = actor_id
      and p.active = true
  ) then
    raise exception 'Active Self-Study profile required';
  end if;

  select scm.class_id
    into current_class
  from public.student_class_memberships scm
  where scm.student_id = actor_id
    and scm.ended_at is null
  limit 1;

  new.class_id := current_class;
  return new;
end;
$$;

revoke all on function private.stamp_activity_event() from public;

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
  v_seen_at timestamptz;
  v_global_status text;
  v_unit_status text;
begin
  v_student_id := (p_payload->>'student_id')::uuid;
  v_attempt_id := (p_payload->>'attempt_id')::uuid;
  v_update_mastery := coalesce((p_payload->>'update_mastery')::boolean, false);
  v_seen_at := coalesce((p_payload->>'seen_at')::timestamptz, now());

  if v_student_id is null or v_attempt_id is null then
    raise exception 'Vocabulary attempt identity is required';
  end if;

  if v_update_mastery then
    v_global_status := p_payload->>'global_status';
    v_unit_status := p_payload->>'unit_status';
    if v_global_status not in ('new','building','secure','mastered')
       or v_unit_status not in ('new','building','secure','mastered') then
      raise exception 'Invalid vocabulary mastery status';
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
    return jsonb_build_object('committed', false, 'duplicate', true);
  end if;

  if v_update_mastery then
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
      p_payload->>'vocabulary_id',
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
      v_seen_at
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
      p_payload->>'occurrence_id',
      v_unit_status,
      coalesce(p_payload->'unit_contextual_evidence', '{}'::jsonb),
      nullif(p_payload->>'unit_error_pattern',''),
      v_seen_at,
      v_seen_at
    )
    on conflict (student_id, occurrence_id) do update set
      status = excluded.status,
      contextual_evidence = excluded.contextual_evidence,
      recent_error_pattern = excluded.recent_error_pattern,
      last_seen_at = excluded.last_seen_at,
      updated_at = excluded.updated_at;
  end if;

  return jsonb_build_object('committed', true, 'duplicate', false, 'event_id', v_event_id);
end;
$$;

revoke all on function public.commit_vocabulary_attempt(jsonb) from public, anon, authenticated;
grant execute on function public.commit_vocabulary_attempt(jsonb) to service_role;
