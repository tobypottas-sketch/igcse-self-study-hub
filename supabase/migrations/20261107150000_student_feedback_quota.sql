-- Student writing-feedback quota.
-- STORES COUNTS AND TIMESTAMPS ONLY: never writing, feedback, marks or task text.
-- Student access is OFF until `mode` is changed AND the Worker secret hash is installed (see the runbook at the end of this file).
--
-- WHO MAY CALL THE FUNCTIONS: only the trusted Worker. Both functions require a high-entropy shared secret (`p_secret`) whose SHA-256 hash is
-- kept in private.feedback_worker_secret; the Worker keeps the secret itself as an encrypted Cloudflare secret. A student's browser has the
-- publishable key and its own login but not the secret, so it cannot reserve, finish, refund or clear a reservation. The student's identity is
-- passed as `p_student_id`, which the Worker takes from Supabase's own verification of the student's session (/auth/v1/user), never from the
-- request body. No service-role key is used. With no secret installed, every call is refused.

create table if not exists private.feedback_settings (
  id boolean primary key default true check (id),                         -- single row
  mode text not null default 'off' check (mode in ('off', 'pilot', 'on')),
  daily_limit smallint not null default 3 check (daily_limit between 1 and 50),
  gap_seconds smallint not null default 60 check (gap_seconds between 0 and 3600),
  global_daily_limit integer not null default 20 check (global_daily_limit between 0 and 10000),
  in_flight_seconds smallint not null default 100 check (in_flight_seconds between 30 and 600),
  refunds_per_day smallint not null default 2 check (refunds_per_day between 0 and 10)   -- turns a student can get back per day after platform failures
);
insert into private.feedback_settings default values on conflict do nothing;

create table if not exists private.feedback_pilot_students (
  student_id uuid primary key references public.profiles(id) on delete cascade
);

create table if not exists private.feedback_quota_usage (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  usage_day date not null,                       -- UTC day, matching Cloudflare's daily reset
  used smallint not null default 0 check (used >= 0),
  refunds smallint not null default 0 check (refunds >= 0),
  last_request_at timestamptz,
  in_flight_until timestamptz,
  ticket uuid                                    -- identifies one reservation; needed to give a turn back
);

create table if not exists private.feedback_quota_global (
  usage_day date primary key,
  used integer not null default 0 check (used >= 0)
);

create table if not exists private.feedback_worker_secret (
  id boolean primary key default true check (id),                         -- single row
  hash bytea not null check (octet_length(hash) = 32)                     -- SHA-256 of the Worker's secret; the secret itself is never stored here
);

alter table private.feedback_worker_secret enable row level security;
alter table private.feedback_settings enable row level security;
alter table private.feedback_pilot_students enable row level security;
alter table private.feedback_quota_usage enable row level security;
alter table private.feedback_quota_global enable row level security;
revoke all on private.feedback_settings, private.feedback_pilot_students, private.feedback_quota_usage, private.feedback_quota_global, private.feedback_worker_secret from public, anon, authenticated;

create or replace function private.feedback_secret_ok(p_secret text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(length(p_secret), 0) >= 32
     and exists (select 1 from private.feedback_worker_secret w where w.hash = sha256(convert_to(p_secret, 'UTF8')));
$$;
revoke all on function private.feedback_secret_ok(text) from public, anon, authenticated;

-- Reserves one request for the named student, or explains why not. Atomic: the student's row is locked for the whole
-- decision, and the global counter is a single conditional upsert, so concurrent requests cannot exceed either limit.
create or replace function public.begin_student_feedback(p_secret text, p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := p_student_id;
  v_now timestamptz := now();
  v_day date := (now() at time zone 'utc')::date;
  v_midnight timestamptz := ((now() at time zone 'utc')::date + 1)::timestamp at time zone 'utc';
  s private.feedback_settings%rowtype;
  u private.feedback_quota_usage%rowtype;
  v_global integer;
  v_ticket uuid := gen_random_uuid();
begin
  -- Not the Worker: refuse, with the same answer as "feature off", so nothing is revealed.
  if v_uid is null or not private.feedback_secret_ok(p_secret) then
    return jsonb_build_object('allowed', false, 'reason', 'not_available');
  end if;
  if not exists (
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
  if u.usage_day <> v_day then u.used := 0; u.refunds := 0; end if;

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
  set usage_day = v_day, used = u.used + 1, refunds = u.refunds, last_request_at = v_now,
      in_flight_until = v_now + make_interval(secs => s.in_flight_seconds), ticket = v_ticket
  where student_id = v_uid;
  return jsonb_build_object('allowed', true, 'ticket', v_ticket);
end;
$$;

-- Frees the in-flight slot. With p_refund the turn is given back, at most refunds_per_day times per student per day, and only the Worker asks
-- for it (after an AI platform failure). Callers without the Worker secret change nothing. The ticket stops a stale call from clearing a newer reservation.
create or replace function public.finish_student_feedback(p_secret text, p_student_id uuid, p_ticket uuid, p_refund boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := p_student_id;
  u private.feedback_quota_usage%rowtype;
  s private.feedback_settings%rowtype;
  v_day date := (now() at time zone 'utc')::date;
begin
  if v_uid is null or p_ticket is null or not private.feedback_secret_ok(p_secret) then return jsonb_build_object('ok', true); end if;   -- same answer whoever asks
  select * into u from private.feedback_quota_usage where student_id = v_uid for update;
  if not found or u.ticket is distinct from p_ticket then return jsonb_build_object('ok', true); end if;
  select * into s from private.feedback_settings where id;
  if coalesce(p_refund, false) and u.usage_day = v_day and u.used > 0 and u.refunds < s.refunds_per_day then
    update private.feedback_quota_usage set used = used - 1, refunds = refunds + 1, in_flight_until = null, ticket = null where student_id = v_uid;
    update private.feedback_quota_global set used = greatest(used - 1, 0) where usage_day = v_day;
  else
    update private.feedback_quota_usage set in_flight_until = null, ticket = null where student_id = v_uid;
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.begin_student_feedback(text, uuid) from public, anon, authenticated;
revoke all on function public.finish_student_feedback(text, uuid, uuid, boolean) from public, anon, authenticated;
-- PostgREST needs the call to run as a role it knows. The Worker calls with the publishable key only (role anon); `authenticated` is also granted so the
-- call still works if a student session is attached. In both cases the secret check inside the function is the actual gate.
grant execute on function public.begin_student_feedback(text, uuid) to anon, authenticated;
grant execute on function public.finish_student_feedback(text, uuid, uuid, boolean) to anon, authenticated;

-- RUNBOOK (run by hand in the SQL editor; not part of the migration)
--   Install the Worker secret (the secret is never put in SQL; only its hash):
--     1. On your computer:  S=$(openssl rand -hex 32); printf %s "$S" | sha256sum        -> note the hex hash; keep $S for step 3
--     2. In SQL:            insert into private.feedback_worker_secret (hash) values (decode('<hex hash>', 'hex'))
--                           on conflict (id) do update set hash = excluded.hash;          -- also used to rotate
--     3. In Cloudflare:     add the encrypted Worker secret FEEDBACK_QUOTA_SECRET = $S
--   Controlled pilot:  update private.feedback_settings set mode = 'pilot';
--                      insert into private.feedback_pilot_students select id from public.profiles where school_email in ('student1@…', …);
--   Everyone:          update private.feedback_settings set mode = 'on';
--   Switch off at once: update private.feedback_settings set mode = 'off';     (or: delete from private.feedback_worker_secret;)
--   Change limits:     update private.feedback_settings set daily_limit = 3, gap_seconds = 60, global_daily_limit = 10;
--
-- ROLLBACK (full removal; the migration only adds objects):
--   drop function if exists public.begin_student_feedback(text, uuid);
--   drop function if exists public.finish_student_feedback(text, uuid, uuid, boolean);
--   drop function if exists private.feedback_secret_ok(text);
--   drop table if exists private.feedback_quota_usage, private.feedback_quota_global, private.feedback_pilot_students, private.feedback_settings, private.feedback_worker_secret;
