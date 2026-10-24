// Generates tests/db/pathway-sets.parity.sql: random mission-score sequences, with the state after each mission computed by the PURE
// stage-progression.js. Running the file on the local scratch Postgres proves the plpgsql port moves a Set exactly like the JS module.
import { applyMissionResult, newSetState } from '../../src/vocabulary/stage-progression.js';
let seed = 20261024; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const students = ['aaaaaaaa-0000-4000-8000-00000000000'];
const out = ['\\set ON_ERROR_STOP off', "insert into public.profiles(id) select ('aaaaaaaa-0000-4000-8000-0000000000' || lpad(g::text,2,'0'))::uuid from generate_series(1,40) g;", 'create temp table r(label text, ok boolean, detail text);', 'grant all on r to authenticated, anon;'];
out.push(`create or replace function pg_temp.mission(p_student uuid, p_pathway text, p_correct int) returns void language plpgsql as $$
declare j jsonb; m uuid; i int; st text;
begin
  perform set_config('request.jwt.claim.sub', p_student::text, false);
  j := public.start_vocabulary_mission(1,'pathway',p_pathway,'recognise','stage',false,true,null);
  m := (j->>'mission_id')::uuid; st := j->>'pathway_stage';
  for i in 1..10 loop
    insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',
      jsonb_build_object('mission_id',m,'unit_number',1,'occurrence_id','u1_t'||i,'attempt_number',1,'outcome',case when i<=p_correct then 'correct' else 'try_again' end,'mission_kind','pathway','practice_family','recommended','mission_size',10,'pathway_id',p_pathway,'pathway_stage',st));
    if i > p_correct then
      insert into public.activity_events(user_id,app_key,event_type,set_id,metadata) values (p_student,'vocabulary_paraphrase','question_attempt','unit-1',
        jsonb_build_object('mission_id',m,'unit_number',1,'occurrence_id','u1_t'||i,'attempt_number',2,'outcome','try_again','recovery',true,'mission_kind','pathway','practice_family','recommended','mission_size',10,'pathway_id',p_pathway,'pathway_stage',st));
    end if;
  end loop;
  perform public.record_vocabulary_mission(m);
end $$;`);
out.push(`create or replace function pg_temp.sets(p_student uuid) returns text language sql as $$
  select coalesce(string_agg(set_number || ':' || stage || '/' || phase || '/' || status || '/' || jsonb_array_length(advanced_with_support)::text, ' ' order by set_number), '(none)')
  from public.vocabulary_pathway_sets where student_id = p_student and unit_number = 1 and pathway_id = 'precision_use' $$;`);
let checks = 0;
for (let s = 1; s <= 40; s += 1) {
  const id = `aaaaaaaa-0000-4000-8000-0000000000${String(s).padStart(2, '0')}`;
  let state = newSetState(); let guard = 0;
  const weights = [0.15, 0.3, 0.55, 0.75, 0.95][s % 5];                       // learners from struggling to strong
  while (!state.maintain && guard++ < 60) {
    const score = rnd() < weights ? (rnd() < 0.6 ? 10 : 8 + Math.floor(rnd() * 2)) : Math.floor(rnd() * 8);
    const kind = state.phase === 'consolidate' ? 'consolidate' : state.phase === 'recovery' ? 'recovery' : 'stage';
    out.push(`select pg_temp.mission('${id}'::uuid,'precision_use',${score});`);
    state = applyMissionResult(state, { missionId: `m${guard}`, stage: state.stage, kind, size: 10, score, complete: true, missedTargetIds: Array.from({ length: 10 - score }, (_, i) => `u1_t${score + i + 1}`) });
    const expect = `1:${state.stage}/${state.phase}/${state.maintain ? 'maintain' : 'active'}/${state.advancedWithSupport.length}`;
    out.push(`insert into r select 'student ${s} mission ${guard}: ${expect}', pg_temp.sets('${id}'::uuid) = '${expect}', pg_temp.sets('${id}'::uuid);`);
    checks += 1;
  }
}
out.push("select label || ' => ' || case when ok then 'OK' else 'MISMATCH ' || detail end from r where not ok;");
out.push("select 'PARITY CHECKS=' || count(*) || ' FAILED=' || count(*) filter (where not ok) from r;");
import fs from 'node:fs';
fs.writeFileSync(new URL('./pathway-sets.parity.sql', import.meta.url), out.join('\n') + '\n');
console.log('generated', checks, 'checks');
