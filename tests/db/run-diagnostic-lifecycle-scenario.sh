#!/usr/bin/env bash
# Applies the diagnostic SQL to a THROWAWAY local Postgres and runs the bank-lifecycle scenario.
# Usage: PGHOST=localhost PGPORT=55432 PGUSER=postgres tests/db/run-diagnostic-lifecycle-scenario.sh [scenario.sql ...]
# With no arguments it runs tests/db/diagnostic-bank-lifecycle.scenario.sql.
# Creates a scratch database per scenario and drops it afterwards. Never run it against Supabase.
set -euo pipefail
cd "$(dirname "$0")/../.."
run_scenario() {
  local DB=diag_lifecycle_$$_$1
  local PSQL="psql -X -q -v ON_ERROR_STOP=1 -d $DB"
  createdb "$DB"
  trap "dropdb --if-exists $DB" RETURN
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
  echo "== $2"
  psql -X -q -t -A -v ON_ERROR_STOP=1 -d "$DB" -f "$2"
}
# Each scenario gets its own scratch database.
n=0
for s in "${@:-tests/db/diagnostic-bank-lifecycle.scenario.sql}"; do
  n=$((n+1)); run_scenario "$n" "$s"
done
