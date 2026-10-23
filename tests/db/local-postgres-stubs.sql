-- Minimal stand-ins for Supabase (auth.uid, profiles, private helpers, activity_events) so the migrations can be exercised on a THROWAWAY local Postgres 16.
-- Not Supabase, not run by `npm test`. Create roles first: anon, authenticated, service_role. Then also create private.activity_metadata_is_safe(jsonb) returning true.
create schema auth; create schema private;
grant usage on schema public, auth, private to anon, authenticated, service_role;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create type public.user_role as enum ('student','teacher','admin');
create table public.profiles (id uuid primary key, role public.user_role not null default 'student');
create function private.current_role() returns public.user_role language sql stable security definer as $$ select role from public.profiles where id = auth.uid() $$;
create function private.teacher_can_access_student(uuid) returns boolean language sql as $$ select false $$;
create table public.activity_events (id uuid primary key default gen_random_uuid(), occurred_at timestamptz not null default now(), set_id text, user_id uuid not null, app_key text not null, event_type text not null, metadata jsonb not null default '{}');
alter table public.activity_events enable row level security;
create policy activity_events_insert_own on public.activity_events for insert to authenticated with check (true);
grant execute on all functions in schema private, auth to authenticated, service_role;
