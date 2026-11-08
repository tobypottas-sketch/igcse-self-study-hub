#!/usr/bin/env bash
# Verifies 20261107150000_student_feedback_quota.sql against a REAL throwaway Postgres (including concurrent callers).
# Usage: PGHOST=/tmp PGPORT=54329 PGUSER=postgres supabase/tests/student_feedback_quota.sh   (creates and drops database "quota_test")
set -u
cd "$(dirname "$0")/../.."
PSQL="psql -X -q -t -A -v ON_ERROR_STOP=1"
$PSQL -d postgres -c "drop database if exists quota_test" -c "create database quota_test" >/dev/null || exit 1
DB="$PSQL -d quota_test"
$DB >/dev/null <<'SQL'
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
create schema auth; create schema private;
create function auth.uid() returns uuid language sql stable as $f$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $f$;
create type public.user_role as enum ('admin','teacher','student');
create table public.profiles (id uuid primary key, role public.user_role not null, active boolean not null default true, must_change_password boolean not null default false);
insert into public.profiles select ('00000000-0000-0000-0000-0000000001'||lpad(n::text,2,'0'))::uuid, 'student', true, false from generate_series(1,30) n;
insert into public.profiles values ('00000000-0000-0000-0000-000000000201','teacher',true,false),('00000000-0000-0000-0000-000000000202','student',false,false),('00000000-0000-0000-0000-000000000203','student',true,true);
grant usage on schema public to anon, authenticated;
SQL
$DB -f supabase/migrations/20261107150000_student_feedback_quota.sql >/dev/null || { echo "MIGRATION FAILED"; exit 1; }
check_default() { :; }
S() { printf '00000000-0000-0000-0000-0000000001%02d' "$1"; }
as() { $DB -c "set role authenticated; set request.jwt.claim.sub = '$1'; $2" | tail -1; }
SECRET=$(python3 -c "import secrets;print(secrets.token_hex(32))"); HASH=$(printf %s "$SECRET" | sha256sum | cut -d' ' -f1)
$DB -c "insert into private.feedback_worker_secret (hash) values (decode('$HASH','hex'))" >/dev/null
# The Worker calls with the publishable key only (role anon), passing the secret and the verified student id.
begin_() { $DB -c "set role anon; select public.begin_student_feedback('$SECRET', '$1')" | tail -1; }
fin() { $DB -c "set role anon; select public.finish_student_feedback('$SECRET', '$1', '$2', $3)" | tail -1; }
fail=0; check() { if [ "$2" = "$3" ]; then echo "ok   $1"; else echo "FAIL $1: expected [$3] got [$2]"; fail=1; fi; }
field() { echo "$1" | python3 -c "import sys,json; print(json.load(sys.stdin).get('$2'))"; }
settings() { $DB -c "update private.feedback_settings set $1"; }
reset() { $DB -c "truncate private.feedback_quota_usage, private.feedback_quota_global, private.feedback_pilot_students" -c "update private.feedback_settings set mode='on', daily_limit=3, gap_seconds=0, global_daily_limit=20, in_flight_seconds=100"; }
U1=$(S 1); U2=$(S 2)

reset; settings "mode='off'"; r=$(begin_ $U1); check "off: students refused" "$(field "$r" reason)" not_available
settings "mode='pilot'"; r=$(begin_ $U1); check "pilot: non-member refused" "$(field "$r" reason)" not_available
$DB -c "insert into private.feedback_pilot_students values ('$U1')"; r=$(begin_ $U1); check "pilot: member allowed" "$(field "$r" allowed)" True
reset
for who in 00000000-0000-0000-0000-000000000201 00000000-0000-0000-0000-000000000202 00000000-0000-0000-0000-000000000203; do r=$(begin_ $who); check "teacher/inactive/must-change refused ($who)" "$(field "$r" reason)" not_available; done
r=$($DB -c "set role authenticated; set request.jwt.claim.sub='$U1'; select * from private.feedback_quota_usage" 2>&1); case "$r" in *"permission denied"*) echo "ok   students cannot read the counter tables";; *) echo "FAIL table access: $r"; fail=1;; esac
r=$($DB -c "set role authenticated; set request.jwt.claim.sub='$U1'; update private.feedback_settings set mode='on'" 2>&1); case "$r" in *"permission denied"*) echo "ok   students cannot change settings";; *) echo "FAIL settings write: $r"; fail=1;; esac

reset; r=$(begin_ $U1); T1=$(field "$r" ticket); check "first request allowed" "$(field "$r" allowed)" True
r=$(begin_ $U1); check "second while first running: busy" "$(field "$r" reason)" busy
fin $U1 "$T1" false >/dev/null
r=$(begin_ $U1); check "after finish: allowed again" "$(field "$r" allowed)" True; T2=$(field "$r" ticket)
fin $U1 "$T2" false >/dev/null
r=$(begin_ $U1); check "third allowed" "$(field "$r" allowed)" True; fin $U1 "$(field "$r" ticket)" false >/dev/null
r=$(begin_ $U1); check "fourth: daily limit" "$(field "$r" reason)" daily_limit
ra=$(field "$r" retry_after); [ "$ra" -gt 0 ] && [ "$ra" -le 86400 ] && echo "ok   retry_after is within a day ($ra s)" || { echo "FAIL retry_after $ra"; fail=1; }
r=$(begin_ $U2); check "other student unaffected" "$(field "$r" allowed)" True

reset; settings "gap_seconds=60"; r=$(begin_ $U1); fin $U1 "$(field "$r" ticket)" false >/dev/null
r=$(begin_ $U1); check "60 s gap enforced" "$(field "$r" reason)" too_soon; ra=$(field "$r" retry_after); [ "$ra" -ge 1 ] && [ "$ra" -le 60 ] && echo "ok   gap retry_after ok ($ra s)" || { echo "FAIL gap retry $ra"; fail=1; }

reset; r=$(begin_ $U1); T=$(field "$r" ticket)
fin $U1 "$(python3 -c 'import uuid;print(uuid.uuid4())')" true >/dev/null
check "wrong ticket cannot refund" "$($DB -c "select used from private.feedback_quota_usage where student_id='$U1'")" 1
fin $U2 "$T" true >/dev/null
check "another student's call cannot refund" "$($DB -c "select used from private.feedback_quota_usage where student_id='$U1'")" 1
fin $U1 "$T" true >/dev/null
check "correct ticket refunds the turn" "$($DB -c "select used from private.feedback_quota_usage where student_id='$U1'")" 0
check "refund also returns the global turn" "$($DB -c "select used from private.feedback_quota_global")" 0
fin $U1 "$T" true >/dev/null
check "ticket is single use (no double refund)" "$($DB -c "select used from private.feedback_quota_global")" 0

reset; $DB -c "insert into private.feedback_quota_usage (student_id, usage_day, used, last_request_at) values ('$U1', current_date - 1, 3, now() - interval '1 day')"
r=$(begin_ $U1); check "new UTC day resets the student's count" "$(field "$r" allowed)" True

reset; settings "daily_limit=50"
for i in 1 2 3 4; do r=$(begin_ $U1); fin $U1 "$(field "$r" ticket)" true >/dev/null; done
check "refunds are capped per student per day (2): used = 2 after 4 refunded attempts" "$($DB -c "select used from private.feedback_quota_usage where student_id='$U1'")" 2
check "global counter matches the capped refunds" "$($DB -c "select used from private.feedback_quota_global")" 2

# ---- Adversarial: a student's browser must not be able to reserve, finish, refund or clear a reservation ----
reset; r=$(begin_ $U1); T=$(field "$r" ticket); check "setup: Worker reserved a turn" "$(field "$r" allowed)" True
used() { $DB -c "select used from private.feedback_quota_usage where student_id='$U1'"; }
attacker() { $DB -c "set role $1; set request.jwt.claim.sub='$U1'; $2" 2>&1 | tr '\n' ' '; }
for role in anon authenticated; do
  for bad in "" "wrong" "$(python3 -c 'print("a"*64)')" "$HASH"; do
    r=$(attacker $role "select public.finish_student_feedback('$bad', '$U1', '$T', true)")
    check "$role with secret [${bad:0:8}] cannot refund" "$(used)" 1
    r=$(attacker $role "select public.begin_student_feedback('$bad', '$U2')"); check "$role with secret [${bad:0:8}] cannot reserve for another student" "$(field "$r" reason)" not_available
  done
  r=$(attacker $role "select public.finish_student_feedback(null, '$U1', '$T', true)"); check "$role null secret cannot refund" "$(used)" 1
  r=$(attacker $role "select public.begin_student_feedback(null, '$U2')"); check "$role null secret cannot reserve" "$(field "$r" reason)" not_available
done
check "attacks left no counter row for the other student" "$($DB -c "select count(*) from private.feedback_quota_usage where student_id='$U2'")" 0
check "attacks did not change the global counter" "$($DB -c "select used from private.feedback_quota_global")" 1
r=$(begin_ $U1); check "reservation is still active after the attacks (cannot be cleared early)" "$(field "$r" reason)" busy
r=$(attacker authenticated "select public.finish_student_feedback('$T', true)"); case "$r" in *"does not exist"*) echo "ok   old unauthenticated signature is gone";; *) echo "FAIL old signature: $r"; fail=1;; esac
r=$(attacker authenticated "select public.begin_student_feedback()"); case "$r" in *"does not exist"*) echo "ok   old begin signature is gone";; *) echo "FAIL old begin: $r"; fail=1;; esac
r=$(attacker authenticated "select private.feedback_secret_ok('$SECRET')"); case "$r" in *"permission denied"*) echo "ok   secret check helper not callable by students";; *) echo "FAIL helper: $r"; fail=1;; esac
for role in anon authenticated; do r=$(attacker $role "select hash from private.feedback_worker_secret"); case "$r" in *"permission denied"*) echo "ok   $role cannot read the secret hash";; *) echo "FAIL hash read: $r"; fail=1;; esac; done
r=$(attacker authenticated "insert into private.feedback_worker_secret (hash) values (decode('$HASH','hex')) on conflict (id) do update set hash = excluded.hash"); case "$r" in *"permission denied"*) echo "ok   students cannot replace the secret";; *) echo "FAIL secret write: $r"; fail=1;; esac
fin $U1 "$T" true >/dev/null; check "the Worker (real secret) can still refund its own ticket" "$(used)" 0
reset; $DB -c "delete from private.feedback_worker_secret" >/dev/null; r=$(begin_ $U1); check "no secret installed: everything refused (fail closed)" "$(field "$r" reason)" not_available
$DB -c "insert into private.feedback_worker_secret (hash) values (decode('$HASH','hex'))" >/dev/null
reset; $DB -c "update private.feedback_settings set mode='off'" >/dev/null; r=$(begin_ $U1); check "valid secret but mode off: refused" "$(field "$r" reason)" not_available


# Concurrency: 12 simultaneous requests from ONE student, and 30 students against a global cap of 7.
reset; settings "daily_limit=50"
for i in $(seq 1 12); do (begin_ $U1 > /tmp/qt_one_$i.txt) & done; wait
check "same student, 12 parallel requests: exactly 1 allowed" "$(cat /tmp/qt_one_*.txt | grep -c '"allowed": true')" 1
reset; settings "global_daily_limit=7"
for i in $(seq 1 30); do (begin_ "$(S $i)" > /tmp/qt_many_$i.txt) & done; wait
check "30 students, global cap 7: exactly 7 allowed" "$(cat /tmp/qt_many_*.txt | grep -c '"allowed": true')" 7
check "global counter never exceeds the cap" "$($DB -c "select used from private.feedback_quota_global")" 7
check "denials are reported as global_limit" "$(cat /tmp/qt_many_*.txt | grep -c global_limit)" 23
reset; settings "global_daily_limit=0"; r=$(begin_ $U1); check "global cap 0 blocks everyone" "$(field "$r" reason)" global_limit

# ---- Rollback SQL (taken verbatim from the migration's ROLLBACK comment) on the scratch database ----
before=$($DB -c "select count(*) from public.profiles")
sed -n '/^-- ROLLBACK/,$p' supabase/migrations/20261107150000_student_feedback_quota.sql | tail -n +2 | sed 's/^--   //' > /tmp/qt_rollback.sql
$DB -f /tmp/qt_rollback.sql >/dev/null || { echo "FAIL rollback SQL errored"; fail=1; }
check "rollback removes every quota table" "$($DB -c "select count(*) from pg_tables where schemaname='private'")" 0
check "rollback removes every quota function" "$($DB -c "select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where p.proname in ('begin_student_feedback','finish_student_feedback','feedback_secret_ok')")" 0
check "rollback leaves existing profiles untouched" "$($DB -c "select count(*) from public.profiles")" "$before"
$DB -f /tmp/qt_rollback.sql >/dev/null && echo "ok   rollback is repeatable (idempotent)" || { echo "FAIL rollback not idempotent"; fail=1; }
$DB -f supabase/migrations/20261107150000_student_feedback_quota.sql >/dev/null && echo "ok   migration can be re-applied after rollback" || { echo "FAIL re-apply"; fail=1; }
check "after re-apply: disabled by default" "$($DB -c "select mode from private.feedback_settings")" off
check "after re-apply: no secret installed" "$($DB -c "select count(*) from private.feedback_worker_secret")" 0
rm -f /tmp/qt_rollback.sql
rm -f /tmp/qt_one_* /tmp/qt_many_*
$PSQL -d postgres -c "drop database quota_test" >/dev/null
[ $fail = 0 ] && echo "ALL QUOTA CHECKS PASSED" || { echo "SOME CHECKS FAILED"; exit 1; }
