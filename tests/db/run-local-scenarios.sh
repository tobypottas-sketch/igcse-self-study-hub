#!/usr/bin/env bash
# Applies the Vocabulary mission migrations to a THROWAWAY local Postgres 16 (not Supabase) and runs the behavioural scenarios.
# Usage: PGHOST=/tmp PGPORT=55432 PGUSER=postgres tests/db/run-local-scenarios.sh
# It creates a scratch database, runs everything, prints each scenario's result table, and drops the database. Never run it against Supabase.
set -euo pipefail
cd "$(dirname "$0")/../.."
DB=vocab_scenarios_$$
PSQL="psql -X -q -v ON_ERROR_STOP=1 -d $DB"
createdb "$DB"
trap 'dropdb --if-exists "$DB"' EXIT
psql -X -q -d "$DB" -c "do \$\$ begin if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if; if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if; if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if; end \$\$;"
$PSQL -f tests/db/local-postgres-stubs.sql
$PSQL -c "create or replace function private.activity_metadata_is_safe(value jsonb) returns boolean language sql immutable as \$\$ select true \$\$; grant execute on function private.activity_metadata_is_safe(jsonb) to authenticated, service_role;"
for m in 20261023120000_vocabulary_missions 20261024120000_vocabulary_mission_identity 20261024140000_vocabulary_mission_enforcement 20261024160000_vocabulary_pathway_sets 20261024170000_vocabulary_set_membership 20261029125353_vocabulary_mission_settlement_response; do
  $PSQL -f "supabase/migrations/$m.sql"
done
# Scenarios use short synthetic ids, so they run against synthetic Set membership (the real seed is checked by the unit test and the membership scenario).
$PSQL -f tests/db/set-members.synthetic.sql
for s in "$@"; do
  echo "== $s"; psql -X -q -t -A -d "$DB" -f "$s"
done
