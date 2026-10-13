create or replace function private.teacher_activity_overview(p_class_id uuid, p_since timestamptz default null)
returns table(
  student_id uuid,
  display_name text,
  class_id uuid,
  class_name text,
  last_active timestamptz,
  active_seconds bigint,
  attempts bigint,
  correct_score bigint,
  valid_max_score bigint,
  apps_used text[],
  weakest_skill text
)
language sql
stable
security definer
set search_path = ''
as $$
with caller as (
  select private.current_role() as role
), authorised_class as (
  select c.id, c.class_name
  from public.classes c, caller x
  where c.id = p_class_id
    and (
      x.role = 'admin'::public.user_role
      or (x.role = 'teacher'::public.user_role and exists (
        select 1 from public.teacher_classes tc
        where tc.teacher_id = (select auth.uid()) and tc.class_id = c.id
      ))
    )
), roster as (
  select distinct scm.student_id
  from public.student_class_memberships scm
  join authorised_class ac on ac.id = scm.class_id
), authorised_events as (
  select ae.*
  from public.activity_events ae
  join roster r on r.student_id = ae.user_id
  cross join caller x
  where
    x.role = 'admin'::public.user_role
    or (
      x.role = 'teacher'::public.user_role
      and (
        exists (
          select 1
          from public.student_class_memberships current_scm
          join public.teacher_classes current_tc on current_tc.class_id = current_scm.class_id
          where current_scm.student_id = ae.user_id
            and current_scm.ended_at is null
            and current_tc.teacher_id = (select auth.uid())
        )
        or exists (
          select 1
          from public.student_class_memberships scm
          where scm.student_id = ae.user_id
            and scm.class_id = p_class_id
            and ae.occurred_at >= scm.started_at
            and (scm.ended_at is null or ae.occurred_at < scm.ended_at)
        )
      )
    )
), visible_events as (
  select *
  from authorised_events
  where p_since is null or occurred_at >= p_since
), ranked_attempts as (
  select
    ae.*,
    row_number() over (
      partition by ae.user_id, ae.app_key, coalesce(ae.activity_id, ae.id::text)
      order by ae.occurred_at, ae.id
    ) as attempt_rank
  from authorised_events ae
  where ae.event_type = 'question_attempt'
    and ae.score is not null
    and ae.max_score is not null
), first_attempts as (
  select *
  from ranked_attempts
  where attempt_rank = 1
    and (p_since is null or occurred_at >= p_since)
), attempt_totals as (
  select
    user_id,
    count(*)::bigint as attempts,
    coalesce(sum(score), 0)::bigint as correct_score,
    coalesce(sum(max_score), 0)::bigint as valid_max_score
  from first_attempts
  group by user_id
), totals as (
  select
    r.student_id,
    max(ve.occurred_at) as last_active,
    coalesce(sum(ve.active_seconds) filter (where ve.event_type = 'active_time'), 0)::bigint as active_seconds,
    coalesce(at.attempts, 0)::bigint as attempts,
    coalesce(at.correct_score, 0)::bigint as correct_score,
    coalesce(at.valid_max_score, 0)::bigint as valid_max_score,
    coalesce(array_agg(distinct ve.app_key) filter (where ve.app_key is not null), '{}'::text[]) as apps_used
  from roster r
  left join visible_events ve on ve.user_id = r.student_id
  left join attempt_totals at on at.user_id = r.student_id
  group by r.student_id, at.attempts, at.correct_score, at.valid_max_score
), skill_stats as (
  select
    user_id as student_id,
    skill,
    count(*)::bigint as attempt_count,
    sum(score)::numeric / nullif(sum(max_score), 0) as accuracy
  from first_attempts
  where skill is not null
  group by user_id, skill
  having count(*) >= 2
), weakest as (
  select distinct on (student_id) student_id, skill
  from skill_stats
  order by student_id, accuracy asc nulls last, attempt_count desc, skill
)
select
  p.id,
  p.display_name,
  ac.id,
  ac.class_name,
  t.last_active,
  t.active_seconds,
  t.attempts,
  t.correct_score,
  t.valid_max_score,
  t.apps_used,
  w.skill
from totals t
join public.profiles p on p.id = t.student_id and p.role = 'student'::public.user_role and p.active = true
cross join authorised_class ac
left join weakest w on w.student_id = t.student_id
order by p.display_name;
$$;

create or replace function private.teacher_activity_student_summary(p_student_id uuid, p_since timestamptz default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
with caller as (
  select private.current_role() as role
), access as (
  select
    x.role,
    exists (
      select 1
      from public.student_class_memberships scm
      join public.teacher_classes tc on tc.class_id = scm.class_id
      where scm.student_id = p_student_id
        and scm.ended_at is null
        and tc.teacher_id = (select auth.uid())
    ) as current_access,
    exists (
      select 1
      from public.student_class_memberships scm
      join public.teacher_classes tc on tc.class_id = scm.class_id
      where scm.student_id = p_student_id
        and tc.teacher_id = (select auth.uid())
    ) as historical_access
  from caller x
), authorised_events as (
  select ae.*
  from public.activity_events ae
  cross join access a
  where ae.user_id = p_student_id
    and (
      a.role = 'admin'::public.user_role
      or (a.role = 'teacher'::public.user_role and a.current_access)
      or (
        a.role = 'teacher'::public.user_role and a.historical_access
        and exists (
          select 1
          from public.student_class_memberships scm
          join public.teacher_classes tc on tc.class_id = scm.class_id
          where scm.student_id = ae.user_id
            and tc.teacher_id = (select auth.uid())
            and ae.occurred_at >= scm.started_at
            and (scm.ended_at is null or ae.occurred_at < scm.ended_at)
        )
      )
    )
), visible_events as (
  select *
  from authorised_events
  where p_since is null or occurred_at >= p_since
), ranked_attempts as (
  select
    ae.*,
    row_number() over (
      partition by ae.user_id, ae.app_key, coalesce(ae.activity_id, ae.id::text)
      order by ae.occurred_at, ae.id
    ) as attempt_rank
  from authorised_events ae
  where ae.event_type = 'question_attempt'
    and ae.score is not null
    and ae.max_score is not null
), first_attempts as (
  select *
  from ranked_attempts
  where attempt_rank = 1
    and (p_since is null or occurred_at >= p_since)
), authorised as (
  select exists(select 1 from authorised_events)
      or exists (
        select 1 from access a
        where a.role = 'admin'::public.user_role
           or (a.role = 'teacher'::public.user_role and (a.current_access or a.historical_access))
      ) as ok
), current_class as (
  select c.id, c.class_name
  from public.student_class_memberships scm
  join public.classes c on c.id = scm.class_id
  where scm.student_id = p_student_id and scm.ended_at is null
  limit 1
), totals as (
  select
    (select max(occurred_at) from visible_events) as last_active,
    coalesce((select sum(active_seconds) from visible_events where event_type = 'active_time'), 0)::bigint as active_seconds,
    coalesce((select count(*) from first_attempts), 0)::bigint as attempts,
    coalesce((select sum(score) from first_attempts), 0)::bigint as correct_score,
    coalesce((select sum(max_score) from first_attempts), 0)::bigint as valid_max_score,
    coalesce((select array_agg(distinct app_key) from visible_events where app_key is not null), '{}'::text[]) as apps_used
), app_activity as (
  select
    app_key,
    max(occurred_at) as last_active,
    coalesce(sum(active_seconds) filter (where event_type = 'active_time'), 0)::bigint as active_seconds,
    coalesce(array_agg(distinct skill) filter (where skill is not null), '{}'::text[]) as skills
  from visible_events
  group by app_key
), app_attempts as (
  select
    app_key,
    count(*)::bigint as attempts,
    coalesce(sum(score), 0)::bigint as correct_score,
    coalesce(sum(max_score), 0)::bigint as valid_max_score
  from first_attempts
  group by app_key
), apps as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'app_key', aa.app_key,
    'last_active', aa.last_active,
    'active_seconds', aa.active_seconds,
    'attempts', coalesce(ap.attempts, 0),
    'correct_score', coalesce(ap.correct_score, 0),
    'valid_max_score', coalesce(ap.valid_max_score, 0),
    'skills', aa.skills
  ) order by aa.app_key), '[]'::jsonb) as value
  from app_activity aa
  left join app_attempts ap on ap.app_key = aa.app_key
), skills as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'skill', skill,
    'attempts', attempts,
    'correct_score', correct_score,
    'valid_max_score', valid_max_score
  ) order by skill), '[]'::jsonb) as value
  from (
    select skill,
      count(*)::bigint as attempts,
      coalesce(sum(score), 0)::bigint as correct_score,
      coalesce(sum(max_score), 0)::bigint as valid_max_score
    from first_attempts
    where skill is not null
    group by skill
  ) s
), exercise_results as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'occurred_at', occurred_at,
    'app_key', app_key,
    'skill', skill,
    'score', score,
    'max_score', max_score
  ) order by occurred_at desc), '[]'::jsonb) as value
  from visible_events
  where event_type = 'exercise_result'
)
select case when (select ok from authorised) then jsonb_build_object(
  'student_id', p.id,
  'display_name', p.display_name,
  'class_id', cc.id,
  'class_name', cc.class_name,
  'last_active', t.last_active,
  'active_seconds', t.active_seconds,
  'attempts', t.attempts,
  'correct_score', t.correct_score,
  'valid_max_score', t.valid_max_score,
  'apps_used', t.apps_used,
  'apps', a.value,
  'skills', s.value,
  'exercise_results', er.value
) else null end
from public.profiles p
cross join totals t
cross join apps a
cross join skills s
cross join exercise_results er
left join current_class cc on true
where p.id = p_student_id and p.role = 'student'::public.user_role;
$$;
