-- Active Learning V2 pilot. Provision independently of either activation gate.
-- Empty by default. Each window is an explicit opt-in for one student.
create table public.active_learning_v2_pilot_windows (
  student_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null default statement_timestamp(),
  ends_at timestamptz,
  primary key (student_id, starts_at),
  check (ends_at is null or ends_at > starts_at)
);
create unique index active_learning_v2_one_open_window
  on public.active_learning_v2_pilot_windows(student_id) where ends_at is null;
alter table public.active_learning_v2_pilot_windows enable row level security;
revoke all on public.active_learning_v2_pilot_windows from public, anon, authenticated, service_role;
grant select on public.active_learning_v2_pilot_windows to authenticated;
grant select, insert, update (ends_at) on public.active_learning_v2_pilot_windows to service_role;
create policy active_learning_v2_pilot_read on public.active_learning_v2_pilot_windows
for select to authenticated using (
  (select private."current_role"()) = 'admin' or
  ((select private."current_role"()) = 'student' and student_id = (select auth.uid())) or
  ((select private."current_role"()) = 'teacher' and
    (select private.teacher_can_access_student(active_learning_v2_pilot_windows.student_id)))
);

create function public.active_learning_v2_pilot_enabled(p_student uuid)
returns boolean language sql stable security invoker set search_path = '' as $$
  select exists (
    select 1 from public.active_learning_v2_pilot_windows w
    join public.profiles p on p.id=w.student_id
    where w.student_id=p_student and p.role='student' and p.active and not p.must_change_password
      and w.starts_at<=statement_timestamp() and (w.ends_at is null or w.ends_at>statement_timestamp())
  );
$$;
revoke all on function public.active_learning_v2_pilot_enabled(uuid) from public, anon;
grant execute on function public.active_learning_v2_pilot_enabled(uuid) to authenticated, service_role;

create table public.active_learning_intervals_v2 (
  student_id uuid not null references public.profiles(id) on delete cascade,
  batch_id uuid not null,
  item_index integer not null check(item_index between 0 and 119),
  class_id uuid references public.classes(id),
  app_key text not null check(app_key = 'vocabulary_paraphrase'),
  unit_id text not null check(unit_id ~ '^[1-9][0-9]{0,8}$'),
  pathway_id text not null check(pathway_id in ('meaning','context','word_families','paraphrasing','precision_use','spelling_recall')),
  activity_id text not null check(length(activity_id) between 1 and 128),
  mode text not null check(mode = 'practice'),
  started_at timestamptz not null, ended_at timestamptz not null,
  received_at timestamptz not null default now(),
  primary key(student_id,batch_id,item_index),
  check(ended_at > started_at and ended_at-started_at <= interval '30 seconds')
);
alter table public.active_learning_intervals_v2 enable row level security;
revoke all on public.active_learning_intervals_v2 from public, anon, authenticated, service_role;
grant select on public.active_learning_intervals_v2 to authenticated;
create policy active_learning_v2_read on public.active_learning_intervals_v2
for select to authenticated using (
  (select private."current_role"()) is not null and (
    student_id=(select auth.uid()) or
    (select private."current_role"())='admin' or
    ((select private."current_role"())='teacher' and
      (select private.teacher_can_access_student(active_learning_intervals_v2.student_id)))
  )
);

create table public.active_learning_batches_v2 (
 student_id uuid not null references public.profiles(id) on delete cascade,
 batch_id uuid not null,
 manifest jsonb not null,
 received_at timestamptz not null default now(),
 primary key(student_id,batch_id)
);
alter table public.active_learning_batches_v2 enable row level security;
revoke all on public.active_learning_batches_v2 from public, anon, authenticated, service_role;
grant select,insert on public.active_learning_batches_v2 to service_role;
create or replace function public.persist_active_learning_v2(
  p_student uuid, p_batch uuid, p_rows jsonb
) returns integer language plpgsql security invoker set search_path='' as $$
declare
  r record; pilot_start timestamptz; pilot_end timestamptz; membership uuid; n integer:=0; manifest jsonb; previous_manifest jsonb;
begin
  if p_student is null or p_batch is null or jsonb_typeof(p_rows) is distinct from 'array' then raise exception 'invalid batch' using errcode='22023'; end if;
  if jsonb_array_length(p_rows) not between 1 and 120 then raise exception 'invalid batch size' using errcode='22023'; end if;
  -- Serialise concurrent writes for this student, including replays.
  perform pg_advisory_xact_lock(hashtextextended(p_student::text,0));
  perform 1 from public.profiles where id=p_student and role='student' and active and not must_change_password for share;
  if not found then raise exception 'not authorised' using errcode='42501'; end if;
  -- Canonicalise ordering, reject repeated/missing indices, then compare the
  -- entire manifest before processing any new intervals.
  if (select count(distinct (v->>'item_index')::integer) from jsonb_array_elements(p_rows) v) <> jsonb_array_length(p_rows)
     or exists(select 1 from jsonb_array_elements(p_rows) v where (v->>'item_index')::integer not between 0 and jsonb_array_length(p_rows)-1)
  then raise exception 'invalid indices' using errcode='22023'; end if;
  select jsonb_agg(v order by (v->>'item_index')::integer) into manifest from jsonb_array_elements(p_rows) v;
  select b.manifest into previous_manifest from public.active_learning_batches_v2 b where b.student_id=p_student and b.batch_id=p_batch;
  if found then
    if previous_manifest is distinct from manifest then raise exception 'conflicting batch replay' using errcode='22023'; end if;
    return 0;
  end if;
  -- Hold the coverage row until ingestion commits, so closing the window
  -- cannot race an accepted batch. Only the currently active enrolment counts.
  select starts_at, ends_at into pilot_start, pilot_end
  from public.active_learning_v2_pilot_windows
  where student_id=p_student and starts_at<=statement_timestamp()
    and (ends_at is null or ends_at>statement_timestamp())
  order by starts_at desc limit 1 for share;
  if not found then raise exception 'pilot access required' using errcode='42501'; end if;
  insert into public.active_learning_batches_v2(student_id,batch_id,manifest) values(p_student,p_batch,manifest);
  for r in select * from jsonb_to_recordset(p_rows) as x(item_index int,app_key text,unit_id text,pathway_id text,activity_id text,mode text,started_at timestamptz,ended_at timestamptz)
  loop
    if r.started_at is null or r.ended_at is null or r.started_at<now()-interval '24 hours' or r.ended_at>now()+interval '2 seconds' or r.ended_at<=r.started_at or r.ended_at-r.started_at>interval '30 seconds' then raise exception 'invalid interval' using errcode='22023'; end if;
    if r.started_at<pilot_start or (pilot_end is not null and r.ended_at>pilot_end)
      then raise exception 'outside pilot window' using errcode='22023'; end if;
    if r.item_index is null or r.item_index not between 0 and 119 or r.activity_id is null or length(r.activity_id) not between 1 and 128 then raise exception 'invalid context' using errcode='22023'; end if;
    -- Half-open membership windows. Ambiguous overlaps and transfer-straddling
    -- intervals keep individual credit and have no class attribution.
    select case when count(*)=1 and bool_and(started_at<=r.started_at and
          (ended_at is null or ended_at>=r.ended_at))
        then (array_agg(class_id))[1] end into membership
      from public.student_class_memberships
      where student_id=p_student and started_at<r.ended_at
        and (ended_at is null or (ended_at>r.started_at and ended_at>started_at));
    insert into public.active_learning_intervals_v2(student_id,batch_id,item_index,class_id,app_key,unit_id,pathway_id,activity_id,mode,started_at,ended_at)
    values(p_student,p_batch,r.item_index,membership,r.app_key,r.unit_id,r.pathway_id,r.activity_id,r.mode,r.started_at,r.ended_at);
    n:=n+1;
  end loop;
  return n;
end $$;
revoke all on function public.persist_active_learning_v2(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.persist_active_learning_v2(uuid,uuid,jsonb) to service_role;
grant select,insert on public.active_learning_intervals_v2 to service_role;
alter table public.active_learning_intervals_v2
  add foreign key(student_id,batch_id)
  references public.active_learning_batches_v2(student_id,batch_id) on delete cascade;
create index active_learning_intervals_student_time_idx
  on public.active_learning_intervals_v2(student_id, started_at);
create index active_learning_intervals_time_idx
  on public.active_learning_intervals_v2(started_at);

-- Clip to the requested half-open window and allocate overlaps once per student.
-- Earliest raw start wins; ties use stable evidence keys. Filter any class,
-- module or pathway only after allocation so subtotals share the same union.
create function public.active_learning_v2_segments(p_from timestamptz, p_to timestamptz, p_student uuid default null)
returns table(student_id uuid, class_id uuid, app_key text, unit_id text, pathway_id text, started_at timestamptz, ended_at timestamptz)
language sql stable security invoker set search_path='' as $$
  with clipped as (
    select i.*, tstzrange(greatest(i.started_at,p_from),least(i.ended_at,p_to),'[)') as span
    from public.active_learning_intervals_v2 i
    where p_from < p_to and p_to - p_from <= interval '93 days'
      and i.started_at > p_from - interval '30 seconds'
      and i.started_at < p_to and i.ended_at > p_from
      and (p_student is null or i.student_id=p_student)
  ), allocated as (
    select c.*, range_agg(span) over (
      partition by c.student_id order by c.started_at, c.app_key, c.unit_id,
        c.pathway_id, c.activity_id, c.batch_id, c.item_index
      rows between unbounded preceding and 1 preceding
    ) as earlier
    from clipped c
  )
  select a.student_id,a.class_id,a.app_key,a.unit_id,a.pathway_id,lower(s.span),upper(s.span)
    from allocated a cross join lateral unnest(
      tstzmultirange(a.span) - coalesce(a.earlier,'{}'::tstzmultirange)) s(span)
$$;
revoke all on function public.active_learning_v2_segments(timestamptz,timestamptz,uuid)
  from public, anon, service_role;
grant execute on function public.active_learning_v2_segments(timestamptz,timestamptz,uuid)
  to authenticated;
