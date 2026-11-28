-- Candidate transaction contract; NOT an applied migration.
-- Invoke only from an authenticated server adapter after validation against
-- the published activity catalogue. Never expose service credentials to browsers.
-- Keep the complete canonical manifest so a reused batch ID cannot append rows.
create table public.active_learning_batches_v2 (
 student_id uuid not null references public.profiles(id),
 batch_id uuid not null,
 manifest jsonb not null,
 received_at timestamptz not null default now(),
 primary key(student_id,batch_id)
);
alter table public.active_learning_batches_v2 enable row level security;
revoke all on public.active_learning_batches_v2 from public, anon, authenticated;
grant select,insert on public.active_learning_batches_v2 to service_role;
create or replace function public.persist_active_learning_v2(
  p_student uuid, p_batch uuid, p_rows jsonb
) returns integer language plpgsql security invoker set search_path='' as $$
declare
  r record; existing record; membership uuid; n integer:=0; manifest jsonb; previous_manifest jsonb;
begin
  if p_student is null or p_batch is null or jsonb_typeof(p_rows) is distinct from 'array' then raise exception 'invalid batch'; end if;
  if jsonb_array_length(p_rows) not between 1 and 120 then raise exception 'invalid batch size'; end if;
  -- Serialise concurrent writes for this student, including replays.
  perform pg_advisory_xact_lock(hashtextextended(p_student::text,0));
  if not exists(select 1 from public.profiles where id=p_student and role='student' and active and not must_change_password) then raise exception 'not authorised'; end if;
  -- Canonicalise ordering, reject repeated/missing indices, then compare the
  -- entire manifest before processing any new intervals.
  if (select count(distinct (v->>'item_index')::integer) from jsonb_array_elements(p_rows) v) <> jsonb_array_length(p_rows)
     or exists(select 1 from jsonb_array_elements(p_rows) v where (v->>'item_index')::integer not between 0 and jsonb_array_length(p_rows)-1)
  then raise exception 'invalid indices'; end if;
  select jsonb_agg(v order by (v->>'item_index')::integer) into manifest from jsonb_array_elements(p_rows) v;
  select b.manifest into previous_manifest from public.active_learning_batches_v2 b where b.student_id=p_student and b.batch_id=p_batch;
  if found then
    if previous_manifest is distinct from manifest then raise exception 'conflicting batch replay'; end if;
    return 0;
  end if;
  insert into public.active_learning_batches_v2(student_id,batch_id,manifest) values(p_student,p_batch,manifest);
  for r in select * from jsonb_to_recordset(p_rows) as x(item_index int,app_key text,unit_id text,pathway_id text,activity_id text,mode text,started_at timestamptz,ended_at timestamptz)
  loop
    if r.started_at is null or r.ended_at is null or r.started_at<now()-interval '24 hours' or r.ended_at>now()+interval '2 seconds' or r.ended_at<=r.started_at or r.ended_at-r.started_at>interval '30 seconds' then raise exception 'invalid interval'; end if;
    if r.item_index is null or r.item_index not between 0 and 119 or r.activity_id is null or length(r.activity_id) not between 1 and 128 then raise exception 'invalid context'; end if;
    select * into existing from public.active_learning_intervals_v2 where student_id=p_student and batch_id=p_batch and item_index=r.item_index;
    if found then
      if row(existing.app_key,existing.unit_id,existing.pathway_id,existing.activity_id,existing.mode,existing.started_at,existing.ended_at) is distinct from row(r.app_key,r.unit_id,r.pathway_id,r.activity_id,r.mode,r.started_at,r.ended_at) then raise exception 'conflicting replay'; end if;
      continue;
    end if;
    -- Attribute only when one membership contains the entire interval.
    -- Transfer-straddling or unassigned intervals retain individual evidence.
    select case when count(*)=1 then (array_agg(class_id))[1] else null end into membership
      from public.student_class_memberships where student_id=p_student and started_at<=r.started_at and (ended_at is null or ended_at>=r.ended_at);
    insert into public.active_learning_intervals_v2(student_id,batch_id,item_index,class_id,app_key,unit_id,pathway_id,activity_id,mode,started_at,ended_at)
    values(p_student,p_batch,r.item_index,membership,r.app_key,r.unit_id,r.pathway_id,r.activity_id,r.mode,r.started_at,r.ended_at);
    n:=n+1;
  end loop;
  return n;
end $$;
revoke all on function public.persist_active_learning_v2(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.persist_active_learning_v2(uuid,uuid,jsonb) to service_role;
grant select,insert on public.active_learning_intervals_v2 to service_role;
-- Still required: isolated PostgreSQL role/concurrency tests, trusted catalogue resolver and authenticated transport.
-- Overlaps remain raw intervals and MUST be unioned by reporting.
