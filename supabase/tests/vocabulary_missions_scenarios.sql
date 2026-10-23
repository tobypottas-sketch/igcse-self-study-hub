-- Scenario checks for record_vocabulary_mission. Run against a scratch database that already has the repo migrations applied
-- (or the minimal stub schema described in the Phase 1 PR). Each block raises an exception if the outcome is not the expected one.
-- Never run against production.
\set ON_ERROR_STOP on
begin;
insert into public.profiles(id) values ('00000000-0000-0000-0000-0000000000a1'),('00000000-0000-0000-0000-0000000000a2') on conflict do nothing;

create or replace function pg_temp.ev(p_user uuid, p_mission uuid, p_occ text, p_attempt int, p_correct boolean, p_recovery boolean,
  p_kind text default 'pathway', p_pathway text default 'meaning', p_stage text default 'recognise', p_size int default 10,
  p_unit int default 1, p_at timestamptz default now()) returns void language sql as $$
  insert into public.activity_events(user_id, app_key, event_type, set_id, occurred_at, metadata)
  values (p_user, 'vocabulary_paraphrase', 'question_attempt', 'unit-' || p_unit, p_at,
    jsonb_strip_nulls(jsonb_build_object(
      'unit_number', p_unit, 'occurrence_id', p_occ, 'attempt_number', p_attempt,
      'outcome', case when p_correct then 'correct' else 'try_again' end, 'recovery', p_recovery,
      'mission_id', p_mission::text, 'mission_size', p_size, 'mission_kind', p_kind,
      'practice_family', case when p_kind = 'mixed' then 'mixed' else 'meaning:recognise' end,
      'pathway_id', case when p_kind = 'pathway' then p_pathway end, 'pathway_stage', case when p_kind = 'pathway' then p_stage end)));
$$;

-- 1. Clean mission: 10 first-try correct answers.
do $$ declare u uuid := '00000000-0000-0000-0000-0000000000a1'; m uuid := gen_random_uuid(); r jsonb; begin
  for i in 1..10 loop perform pg_temp.ev(u, m, 'u1_t' || i, 1, true, false, p_at => now() - (100 - i) * interval '1 second'); end loop;
  perform set_config('app.uid', u::text, true);
  r := public.record_vocabulary_mission(m);
  assert (r->>'score')::int = 10 and (r->>'stars')::int = 3 and (r->>'best_streak')::int = 10 and (r->>'duplicate')::boolean = false, 'clean mission: ' || r::text;
  r := public.record_vocabulary_mission(m);
  assert (r->>'duplicate')::boolean = true, 'second call is a duplicate, not a second row';
  assert (select count(*) from public.vocabulary_missions where mission_id = m) = 1;
end $$;

-- 2. Retry then recovery: t3 wrong, retry correct (still incomplete), later recovery question correct.
do $$ declare u uuid := '00000000-0000-0000-0000-0000000000a1'; m uuid := gen_random_uuid(); r jsonb; begin
  for i in 1..2 loop perform pg_temp.ev(u, m, 'u1_t' || i, 1, true, false, p_at => now() - (100 - i) * interval '1 second'); end loop;
  perform pg_temp.ev(u, m, 'u1_t3', 1, false, false, p_at => now() - 97.5 * interval '1 second');
  perform pg_temp.ev(u, m, 'u1_t3', 2, true, false, p_at => now() - 97.2 * interval '1 second');
  for i in 4..10 loop perform pg_temp.ev(u, m, 'u1_t' || i, 1, true, false, p_at => now() - (100 - i) * interval '1 second'); end loop;
  perform pg_temp.ev(u, m, 'u1_t3', 1, true, true, p_at => now() - 10 * interval '1 second');
  perform set_config('app.uid', u::text, true);
  r := public.record_vocabulary_mission(m);
  assert (r->>'score')::int = 10 and (r->>'best_streak')::int = 8, 'recovery mission: ' || r::text;
end $$;

-- 3. Nine targets only: refused.
do $$ declare u uuid := '00000000-0000-0000-0000-0000000000a1'; m uuid := gen_random_uuid(); begin
  for i in 1..9 loop perform pg_temp.ev(u, m, 'u1_t' || i, 1, true, false); end loop;
  perform set_config('app.uid', u::text, true);
  begin perform public.record_vocabulary_mission(m); raise exception 'should have been refused'; exception when others then assert sqlerrm like 'Mission is not complete%', sqlerrm; end;
end $$;

-- 4. A target left needing recovery (wrong, retried, never re-asked): refused.
do $$ declare u uuid := '00000000-0000-0000-0000-0000000000a1'; m uuid := gen_random_uuid(); begin
  for i in 1..9 loop perform pg_temp.ev(u, m, 'u1_t' || i, 1, true, false); end loop;
  perform pg_temp.ev(u, m, 'u1_t10', 1, false, false); perform pg_temp.ev(u, m, 'u1_t10', 2, true, false);
  perform set_config('app.uid', u::text, true);
  begin perform public.record_vocabulary_mission(m); raise exception 'should have been refused'; exception when others then assert sqlerrm like 'Mission is not complete%', sqlerrm; end;
end $$;

-- 5. Inventing a mission id: no attempts carry it.
do $$ begin
  perform set_config('app.uid', '00000000-0000-0000-0000-0000000000a1', true);
  begin perform public.record_vocabulary_mission(gen_random_uuid()); raise exception 'should have been refused'; exception when others then assert sqlerrm like 'No attempts were found%', sqlerrm; end;
end $$;

-- 6. Another student's mission id cannot be claimed.
do $$ declare m uuid := gen_random_uuid(); begin
  for i in 1..10 loop perform pg_temp.ev('00000000-0000-0000-0000-0000000000a2', m, 'u1_t' || i, 1, true, false); end loop;
  perform set_config('app.uid', '00000000-0000-0000-0000-0000000000a1', true);
  begin perform public.record_vocabulary_mission(m); raise exception 'should have been refused'; exception when others then assert sqlerrm like 'No attempts were found%', sqlerrm; end;
end $$;

-- 7. Mixed mission: pathways may differ per question; one row, no pathway on the row.
do $$ declare u uuid := '00000000-0000-0000-0000-0000000000a1'; m uuid := gen_random_uuid(); r jsonb; begin
  for i in 1..10 loop perform pg_temp.ev(u, m, 'u1_t' || i, 1, i <> 4, false, 'mixed', null, null); end loop;
  perform pg_temp.ev(u, m, 'u1_t4', 2, true, true, 'mixed', null, null);
  perform set_config('app.uid', u::text, true);
  r := public.record_vocabulary_mission(m);
  assert r->>'mission_kind' = 'mixed' and r->>'pathway_id' is null and (r->>'score')::int = 10, 'mixed: ' || r::text;
end $$;

-- 8. Mixed-up attempts (two stages under one mission id): refused.
do $$ declare u uuid := '00000000-0000-0000-0000-0000000000a1'; m uuid := gen_random_uuid(); begin
  for i in 1..9 loop perform pg_temp.ev(u, m, 'u1_t' || i, 1, true, false); end loop;
  perform pg_temp.ev(u, m, 'u1_t10', 1, true, false, 'pathway', 'meaning', 'match');
  perform set_config('app.uid', u::text, true);
  begin perform public.record_vocabulary_mission(m); raise exception 'should have been refused'; exception when others then assert sqlerrm like 'Pathway mission attempts must share%', sqlerrm; end;
end $$;

-- 9. Stale mission: refused.
do $$ declare u uuid := '00000000-0000-0000-0000-0000000000a1'; m uuid := gen_random_uuid(); begin
  for i in 1..10 loop perform pg_temp.ev(u, m, 'u1_t' || i, 1, true, false, p_at => now() - interval '2 days'); end loop;
  perform set_config('app.uid', u::text, true);
  begin perform public.record_vocabulary_mission(m); raise exception 'should have been refused'; exception when others then assert sqlerrm like 'Mission is too old%', sqlerrm; end;
end $$;

-- 10. Students cannot insert question attempts or mission rows directly.
set local role authenticated;
do $$ begin
  perform set_config('app.uid', '00000000-0000-0000-0000-0000000000a1', true);
  begin
    insert into public.activity_events(user_id, app_key, event_type, set_id, metadata)
    values ('00000000-0000-0000-0000-0000000000a1', 'vocabulary_paraphrase', 'question_attempt', 'unit-1', '{}');
    raise exception 'direct attempt insert should have been refused';
  exception when insufficient_privilege or others then assert sqlerrm like '%row-level security%', sqlerrm; end;
  begin
    insert into public.vocabulary_missions(mission_id, student_id, unit_number, mission_kind, practice_family, mission_size, score, stars, best_streak, completed_at)
    values (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1', 1, 'mixed', 'mixed', 10, 10, 3, 10, now());
    raise exception 'direct mission insert should have been refused';
  exception when others then assert sqlerrm like 'permission denied%', sqlerrm; end;
end $$;
reset role;
rollback;
\echo ALL MISSION SCENARIOS PASSED
