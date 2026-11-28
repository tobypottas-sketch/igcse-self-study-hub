-- Read only the inputs used by the shared merit policy. No Activity history,
-- contact details, Unit Checks, or unrelated class rows leave the database.
create function public.merit_review_inputs(
  p_all boolean default false, p_student uuid default null, p_catalogue boolean default false
) returns jsonb language plpgsql stable security invoker set search_path = '' set timezone = 'UTC' as $$
declare
  actor uuid := auth.uid();
  actor_role text;
  inputs jsonb;
begin
  select p.role::text into actor_role from public.profiles p
  where p.id = actor and p.active and not p.must_change_password;
  if actor_role is null or actor_role not in ('teacher', 'admin')
     or (p_all and actor_role <> 'admin') then
    raise exception 'Merit review access denied' using errcode = '42501';
  end if;

  inputs := (
    with scoped as materialized (
      select distinct on (p.id) p.id, p.display_name, c.class_name, c.merit_pathways_required
      from public.student_class_memberships m
      join public.profiles p on p.id = m.student_id and p.active and p.role = 'student'
      join public.classes c on c.id = m.class_id and c.active
      where m.ended_at is null and (p_student is null or p.id = p_student)
        and (p_all or exists (
          select 1 from public.teacher_classes tc where tc.teacher_id = actor and tc.class_id = c.id
        ))
      order by p.id, c.id
    ), live as materialized (
      select o.* from public.vocabulary_unit_occurrences o where o.active and o.status = 'live'
    )
    select jsonb_build_object(
      'students', coalesce((select jsonb_agg(to_jsonb(s) order by s.display_name,s.id) from scoped s), '[]'),
      'assignedClassCount', (select count(*) from public.teacher_classes tc
        join public.classes c on c.id = tc.class_id and c.active where tc.teacher_id = actor),
      'missions', coalesce((select jsonb_agg(to_jsonb(m) order by m.student_id,m.unit_number,m.pathway_id,m.pathway_stage,m.set_number nulls first) from (
        select distinct on (v.student_id,v.unit_number,v.pathway_id,v.pathway_stage,coalesce(v.set_number,0))
          v.student_id,v.unit_number,v.pathway_id,v.pathway_stage,v.set_number,v.completed_at,v.mission_kind,v.outcome
        from public.vocabulary_missions v join scoped s on s.id=v.student_id
        where v.outcome='pass' and v.mission_kind='pathway' and v.completed_at is not null
        order by v.student_id,v.unit_number,v.pathway_id,v.pathway_stage,coalesce(v.set_number,0),v.completed_at
      ) m), '[]'),
      'mastery', coalesce((select jsonb_agg(jsonb_build_object('studentId',m.student_id,
           'occurrenceId',m.occurrence_id,'contextualEvidence',jsonb_strip_nulls(jsonb_build_object(
             'pathwayProgress',m.contextual_evidence->'pathwayProgress',
             'pathway_progress',m.contextual_evidence->'pathway_progress'))) order by m.student_id,m.occurrence_id)
        from public.vocabulary_unit_mastery m join scoped s on s.id=m.student_id
        join live o on o.occurrence_id=m.occurrence_id
        where m.contextual_evidence ?| array['pathwayProgress','pathway_progress']), '[]'),
      'awards', coalesce((select jsonb_agg(to_jsonb(a) order by a.student_id) from (
        select v.student_id, max(v.merit_number) as merit_number
        from public.vocabulary_merit_awards v join scoped s on s.id=v.student_id group by v.student_id
      ) a), '[]'),
      'catalogue', case when p_catalogue then jsonb_build_object(
        'occurrences', coalesce((select jsonb_agg(to_jsonb(o) order by o.unit_number,o.position_in_unit,o.occurrence_id) from live o), '[]'),
        'items', coalesce((select jsonb_agg(to_jsonb(i) order by i.vocabulary_id)
          from public.vocabulary_items i where i.status='live'
            and exists (select 1 from live o where o.vocabulary_id=i.vocabulary_id)), '[]'),
        'contexts', coalesce((select jsonb_agg(to_jsonb(c) order by c.context_id)
          from public.vocabulary_contexts c join live o on o.occurrence_id=c.occurrence_id where c.status='live'), '[]'),
        'activities', coalesce((select jsonb_agg(to_jsonb(a) order by a.activity_content_id)
          from public.vocabulary_unit_activities a where a.status='live'
            and exists (select 1 from live o where o.unit_number=a.unit_number)), '[]')
      ) end
    )
  );
  -- Hash the database representation, before any JavaScript normalization.
  if p_student is not null and p_catalogue then
    inputs := inputs || jsonb_build_object('proof',encode(sha256(convert_to(
      (inputs - 'assignedClassCount')::text,'UTF8')),'hex'));
  end if;
  return inputs;
end;
$$;

revoke all on function public.merit_review_inputs(boolean, uuid, boolean) from public, anon;
grant execute on function public.merit_review_inputs(boolean, uuid, boolean) to authenticated, service_role;

-- Only the Edge function calls this after checking the canonical JS eligibility.
-- Serialize awards for this student and recheck live staff scope before insertion.
create function public.confirm_reviewed_merit(p_actor uuid, p_student uuid, p_number integer, p_all boolean, p_proof text)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  highest integer;
  current_proof text;
begin
  if current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'Merit confirmation requires read committed isolation' using errcode='25001';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_student::text, 0));
  perform 1 from public.profiles p
    where p.id=p_actor and p.active and not p.must_change_password
      and p.role in ('teacher','admin') and (not p_all or p.role='admin')
    for share;
  if not found then raise exception 'Merit award access denied' using errcode='42501'; end if;

  perform 1 from public.student_class_memberships m
    join public.classes c on c.id=m.class_id and c.active
    join public.profiles s on s.id=m.student_id and s.active and s.role='student'
    where m.student_id=p_student and m.ended_at is null
      and (p_all or exists (
        select 1 from public.teacher_classes t where t.teacher_id=p_actor and t.class_id=m.class_id for share
      ))
    for share of m,c,s;
  if not found then raise exception 'Student is outside the merit review scope' using errcode='42501'; end if;

  -- Hold evidence writers out only for the final comparison and insert.
  -- NOWAIT avoids queueing a table lock behind existing learning writes.
  lock table public.vocabulary_unit_occurrences, public.vocabulary_items,
    public.vocabulary_contexts, public.vocabulary_unit_activities,
    public.vocabulary_missions, public.vocabulary_unit_mastery in share mode nowait;
  lock table public.vocabulary_merit_awards in share row exclusive mode nowait;
  perform set_config('request.jwt.claim.sub',p_actor::text,true);
  current_proof := public.merit_review_inputs(p_all,p_student,true)->>'proof';
  if current_proof is null or current_proof is distinct from p_proof then
    return jsonb_build_object('changed',true);
  end if;

  select coalesce(max(merit_number), 0) into highest from public.vocabulary_merit_awards
    where student_id=p_student;
  if p_number > highest then
    insert into public.vocabulary_merit_awards(student_id,merit_number,awarded_by)
      values (p_student,p_number,p_actor) on conflict (student_id,merit_number) do nothing;
  end if;
  return (select jsonb_build_object('highestAwarded',max(merit_number),'awardedCount',count(*),
    'recorded',coalesce(bool_or(merit_number=p_number),false))
    from public.vocabulary_merit_awards where student_id=p_student);
end;
$$;

revoke all on function public.confirm_reviewed_merit(uuid, uuid, integer, boolean, text) from public, anon, authenticated;
grant execute on function public.confirm_reviewed_merit(uuid, uuid, integer, boolean, text) to service_role;
