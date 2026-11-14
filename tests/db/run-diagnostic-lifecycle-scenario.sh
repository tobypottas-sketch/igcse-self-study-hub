#!/usr/bin/env bash
# Applies the diagnostic SQL to a THROWAWAY local Postgres and runs the bank-lifecycle scenario.
# Usage: PGHOST=localhost PGPORT=55432 PGUSER=postgres tests/db/run-diagnostic-lifecycle-scenario.sh
# Creates a scratch database and drops it afterwards. Never run it against Supabase.
set -euo pipefail
cd "$(dirname "$0")/../.."
DB=diag_lifecycle_$$
PSQL="psql -X -q -v ON_ERROR_STOP=1 -d $DB"
createdb "$DB"
trap 'dropdb --if-exists "$DB"' EXIT
psql -X -q -d "$DB" -c "do \$\$ begin if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if; if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if; if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if; end \$\$;"
$PSQL <<'SQL'
create schema private;
create type public.user_role as enum ('student','teacher','admin');
create table public.profiles (id uuid primary key, role public.user_role not null default 'student', active boolean not null default true);
create table public.student_class_memberships (student_id uuid, class_id uuid, ended_at timestamptz);
create table public.teacher_classes (teacher_id uuid, class_id uuid);
SQL
for f in pilot_tables pilot_api review_api item_lifecycle_NOT_APPLIED; do
  $PSQL -f "supabase/diagnostic/$f.sql"
done
psql -X -q -t -A -v ON_ERROR_STOP=1 -d "$DB" -f tests/db/diagnostic-bank-lifecycle.scenario.sql
