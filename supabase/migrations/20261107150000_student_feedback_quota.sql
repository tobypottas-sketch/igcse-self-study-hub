-- Student writing-feedback quota.
-- STORES COUNTS AND TIMESTAMPS ONLY: never writing, feedback, marks or task text.
-- Student access is OFF until `mode` is changed (see the runbook at the end of this file).

create table if not exists private.feedback_settings (
  id boolean primary key default true check (id),                         -- single row
  mode text not null default 'off' check (mode in ('off', 'pilot', 'on')),
  daily_limit smallint not null default 3 check (daily_limit between 1 and 50),
  gap_seconds smallint not null default 60 check (gap_seconds between 0 and 3600),
  global_daily_limit integer not null default 20 check (global_daily_limit between 0 and 10000),
  in_flight_seconds smallint not null default 100 check (in_flight_seconds between 30 and 600)
);
insert into private.feedback_settings default values on conflict do nothing;

create table if not exists private.feedback_pilot_students (
  student_id uuid primary key references public.profiles(id) on delete cascade
);

create table if not exists private.feedback_quota_usage (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  usage_day date not null,                       -- UTC day, matching Cloudflare's daily reset
  used smallint not null default 0 check (used >= 0),
  last_request_at timestamptz,
  in_flight_until timestamptz,
  ticket uuid                                    -- known only to the Worker; needed to give a turn back
);

create table if not exists private.feedback_quota_global (
  usage_day date primary key,
  used integer not null default 0 check (used >= 0)
);

alter table private.feedback_settings enable row level security;
alter table private.feedback_pilot_students enable row level security;
alter table private.feedback_quota_usage enable row level security;
alter table private.feedback_quota_global enable row level security;
revoke all on private.feedback_settings, private.feedback_pilot_students, private.feedback_quota_usage, private.feedback_quota_global from public, anon, authenticated;

-- Reserves one request for the calling student, or explains why not. Atomic: the student's row is locked for the whole
-- decision, and the global counter is a single conditional upsert, so concurrent requests cannot exceed either limit.
create or replace function public.begin_student_feedback()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_now timestamptz := now();
  v_day date := (now() at time zone 'utc')::date;
  v_midnight timestamptz := ((now() at time zone 'utc')::date + 1)::timestamp at time zone 'utc';
  s private.feedback_settings%rowtype;
  u private.feedback_quota_usage%rowtype;
  v_global integer;
  v_ticket uuid := gen_random_uuid();
begin
  if v_uid is null or not exists (
    select 1 from public.profiles p
    where p.id = v_uid and p.role = 'student' and p.active and not p.must_change_password
  ) then
    return jsonb_build_object('allowed', false, 'reason', 'not_available');
  end if;

  select * into s from private.feedback_settings where id;
  if s.mode = 'off' or (s.mode = 'pilot' and not exists (
    select 1 from private.feedback_pilot_students f where f.student_id = v_uid
  )) then
    return jsonb_build_object('allowed', false, 'reason', 'not_available');
  end if;

  insert into private.feedback_quota_usage (student_id, usage_day) values (v_uid, v_day) on conflict (student_id) do nothing;
  select * into u from private.feedback_quota_usage where student_id = v_uid for update;   -- serialises this student's requests
  if u.usage_day <> v_day then u.used := 0; end if;

  if u.in_flight_until is not null and u.in_flight_until > v_now then
    return jsonb_build_object('allowed', false, 'reason', 'busy', 'retry_after', ceil(extract(epoch from u.in_flight_until - v_now))::int);
  end if;
  if u.used >= s.daily_limit then
    return jsonb_build_object('allowed', false, 'reason', 'daily_limit', 'retry_after', ceil(extract(epoch from v_midnight - v_now))::int);
  end if;
  if u.last_request_at is not null and u.last_request_at + make_interval(secs => s.gap_seconds) > v_now then
    return jsonb_build_object('allowed', false, 'reason', 'too_soon',
      'retry_after', ceil(extract(epoch from u.last_request_at + make_interval(secs => s.gap_seconds) - v_now))::int);
  end if;

  if s.global_daily_limit < 1 then
    return jsonb_build_object('allowed', false, 'reason', 'global_limit', 'retry_after', ceil(extract(epoch from v_midnight - v_now))::int);
  end if;
  insert into private.feedback_quota_global as g (usage_day, used) values (v_day, 1)
  on conflict (usage_day) do update set used = g.used + 1 where g.used < s.global_daily_limit
  returning g.used into v_global;
  if v_global is null then
    return jsonb_build_object('allowed', false, 'reason', 'global_limit', 'retry_after', ceil(extract(epoch from v_midnight - v_now))::int);
  end if;

  update private.feedback_quota_usage
  set usage_day = v_day, used = u.used + 1, last_request_at = v_now,
      in_flight_until = v_now + make_interval(secs => s.in_flight_seconds), ticket = v_ticket
  where student_id = v_uid;
  return jsonb_build_object('allowed', true, 'ticket', v_ticket);
end;
$$;

-- Frees the in-flight slot. With p_refund the turn is given back (used only when the AI failed and no feedback was produced).
-- Only the caller holding the current ticket can do this, and only the Worker ever sees it.
create or replace function public.finish_student_feedback(p_ticket uuid, p_refund boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  u private.feedback_quota_usage%rowtype;
  v_day date := (now() at time zone 'utc')::date;
begin
  if v_uid is null or p_ticket is null then return jsonb_build_object('ok', true); end if;
  select * into u from private.feedback_quota_usage where student_id = v_uid for update;
  if not found or u.ticket is distinct from p_ticket then return jsonb_build_object('ok', true); end if;
  if coalesce(p_refund, false) and u.usage_day = v_day and u.used > 0 then
    update private.feedback_quota_usage set used = used - 1, in_flight_until = null, ticket = null where student_id = v_uid;
    update private.feedback_quota_global set used = greatest(used - 1, 0) where usage_day = v_day;
  else
    update private.feedback_quota_usage set in_flight_until = null, ticket = null where student_id = v_uid;
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.begin_student_feedback() from public, anon;
revoke all on function public.finish_student_feedback(uuid, boolean) from public, anon;
grant execute on function public.begin_student_feedback() to authenticated;
grant execute on function public.finish_student_feedback(uuid, boolean) to authenticated;

-- RUNBOOK (run by hand in the SQL editor; not part of the migration)
--   Controlled pilot:  update private.feedback_settings set mode = 'pilot';
--                      insert into private.feedback_pilot_students select id from public.profiles where school_email in ('student1@…', …);
--   Everyone:          update private.feedback_settings set mode = 'on';
--   Switch off at once: update private.feedback_settings set mode = 'off';
--   Change limits:     update private.feedback_settings set daily_limit = 3, gap_seconds = 60, global_daily_limit = 20;
