create or replace function public.teacher_activity_classes()
returns table(class_id uuid, class_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.class_name
  from public.classes c
  where c.active = true
    and (
      (select private.current_role()) = 'admin'::public.user_role
      or (
        (select private.current_role()) = 'teacher'::public.user_role
        and exists (
          select 1 from public.teacher_classes tc
          where tc.teacher_id = (select auth.uid()) and tc.class_id = c.id
        )
      )
    )
  order by c.class_name;
$$;

create or replace function public.teacher_activity_overview(p_class_id uuid, p_since timestamptz default null)
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
), visible_events as (
  select ae.*
  from public.activity_events ae
  join roster r on r.student_id = ae.user_id
  cross join caller x
  where (p_since is null or ae.occurred_at >= p_since)
    and (
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
    )
), totals as (
  select
    r.student_id,
    max(ve.occurred_at) as last_active,
    coalesce(sum(ve.active_seconds) filter (where ve.event_type = 'active_time'), 0)::bigint as active_seconds,
    count(*) filter (where ve.event_type = 'question_attempt')::bigint as attempts,
    coalesce(sum(ve.score) filter (where ve.event_type = 'question_attempt' and ve.score is not null and ve.max_score is not null), 0)::bigint as correct_score,
    coalesce(sum(ve.max_score) filter (where ve.event_type = 'question_attempt' and ve.score is not null and ve.max_score is not null), 0)::bigint as valid_max_score,
    coalesce(array_agg(distinct ve.app_key) filter (where ve.app_key is not null), '{}'::text[]) as apps_used
  from roster r
  left join visible_events ve on ve.user_id = r.student_id
  group by r.student_id
), skill_stats as (
  select
    ve.user_id as student_id,
    ve.skill,
    count(*)::bigint as attempt_count,
    sum(ve.score)::numeric / nullif(sum(ve.max_score), 0) as accuracy
  from visible_events ve
  where ve.event_type = 'question_attempt'
    and ve.score is not null
    and ve.max_score is not null
    and ve.skill is not null
  group by ve.user_id, ve.skill
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

create or replace function public.teacher_activity_student_summary(p_student_id uuid, p_since timestamptz default null)
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
), visible_events as (
  select ae.*
  from public.activity_events ae
  cross join access a
  where ae.user_id = p_student_id
    and (p_since is null or ae.occurred_at >= p_since)
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
), authorised as (
  select exists(select 1 from visible_events)
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
    max(occurred_at) as last_active,
    coalesce(sum(active_seconds) filter (where event_type = 'active_time'), 0)::bigint as active_seconds,
    count(*) filter (where event_type = 'question_attempt')::bigint as attempts,
    coalesce(sum(score) filter (where event_type = 'question_attempt' and score is not null and max_score is not null), 0)::bigint as correct_score,
    coalesce(sum(max_score) filter (where event_type = 'question_attempt' and score is not null and max_score is not null), 0)::bigint as valid_max_score,
    coalesce(array_agg(distinct app_key) filter (where app_key is not null), '{}'::text[]) as apps_used
  from visible_events
), apps as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'app_key', app_key,
    'last_active', last_active,
    'active_seconds', active_seconds,
    'attempts', attempts,
    'correct_score', correct_score,
    'valid_max_score', valid_max_score,
    'skills', skills
  ) order by app_key), '[]'::jsonb) as value
  from (
    select app_key,
      max(occurred_at) as last_active,
      coalesce(sum(active_seconds) filter (where event_type = 'active_time'), 0)::bigint as active_seconds,
      count(*) filter (where event_type = 'question_attempt')::bigint as attempts,
      coalesce(sum(score) filter (where event_type = 'question_attempt' and score is not null and max_score is not null), 0)::bigint as correct_score,
      coalesce(sum(max_score) filter (where event_type = 'question_attempt' and score is not null and max_score is not null), 0)::bigint as valid_max_score,
      coalesce(array_agg(distinct skill) filter (where skill is not null), '{}'::text[]) as skills
    from visible_events group by app_key
  ) a
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
    from visible_events
    where event_type = 'question_attempt' and score is not null and max_score is not null and skill is not null
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

create or replace function public.teacher_activity_student_recent(
  p_student_id uuid,
  p_since timestamptz default null,
  p_limit integer default 40
)
returns table(
  occurred_at timestamptz,
  app_key text,
  event_type text,
  skill text,
  score integer,
  max_score integer,
  active_seconds integer,
  outcome text
)
language sql
stable
security definer
set search_path = ''
as $$
with access as (
  select
    private.current_role() as role,
    exists (
      select 1
      from public.student_class_memberships scm
      join public.teacher_classes tc on tc.class_id = scm.class_id
      where scm.student_id = p_student_id and scm.ended_at is null
        and tc.teacher_id = (select auth.uid())
    ) as current_access,
    exists (
      select 1
      from public.student_class_memberships scm
      join public.teacher_classes tc on tc.class_id = scm.class_id
      where scm.student_id = p_student_id and tc.teacher_id = (select auth.uid())
    ) as historical_access
)
select ae.occurred_at, ae.app_key, ae.event_type, ae.skill, ae.score, ae.max_score,
       ae.active_seconds, ae.metadata ->> 'outcome' as outcome
from public.activity_events ae
cross join access a
where ae.user_id = p_student_id
  and (p_since is null or ae.occurred_at >= p_since)
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
order by ae.occurred_at desc
limit greatest(1, least(coalesce(p_limit, 40), 100));
$$;

revoke all on function public.teacher_activity_classes() from public;
revoke all on function public.teacher_activity_overview(uuid, timestamptz) from public;
revoke all on function public.teacher_activity_student_summary(uuid, timestamptz) from public;
revoke all on function public.teacher_activity_student_recent(uuid, timestamptz, integer) from public;
grant execute on function public.teacher_activity_classes() to authenticated;
grant execute on function public.teacher_activity_overview(uuid, timestamptz) to authenticated;
grant execute on function public.teacher_activity_student_summary(uuid, timestamptz) to authenticated;
grant execute on function public.teacher_activity_student_recent(uuid, timestamptz, integer) to authenticated;
