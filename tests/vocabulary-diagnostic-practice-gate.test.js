import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../supabase/diagnostic/mandatory_practice_gate_NOT_APPLIED.sql',import.meta.url),'utf8');
const status=readFileSync(new URL('../supabase/diagnostic/pilot_api.sql',import.meta.url),'utf8');
const router=readFileSync(new URL('../src/vocabulary/router.js',import.meta.url),'utf8');
const player=readFileSync(new URL('../src/vocabulary/diagnostic-student.js',import.meta.url),'utf8';

test('database gate is default-off and never activated in migration',()=>{
  assert.match(source,/enabled boolean not null default false/);
  assert.match(source,/values\(true,false\)/);
  assert.doesNotMatch(source,/set\s+enabled\s*=\s*true/i);
});
test('guard verifies completed server-side baseline result, not unit mastery',()=>{
  assert.match(source,/private\.vocabulary_diagnostic_results r/);
  assert.match(source,/s\.kind='baseline' and s\.state='completed'/);
  assert.match(source,/VOCAB_DIAGNOSTIC_REQUIRED/);
});
test('all primary student training write surfaces protected in prepared migration',()=>{
  for(const name of [
    'vocabulary_missions','vocabulary_mission_starts',
    'vocabulary_global_mastery','vocabulary_unit_mastery',
    'vocabulary_pathway_sets','vocabulary_unit_check_attempts',
    'vocabulary_unit_pathway_journey','activity_events'
  ]) assert.match(source,new RegExp('on public\\.'+name+';','i'),name);
  assert.match(source,/new\.app_key is distinct from 'vocabulary_paraphrase'/);
});
test('no table access or private gate settings granted to students',()=>{
  assert.match(source,/enable row level security/);
  assert.match(source,/revoke all on private\.vocabulary_diagnostic_gate_settings from public,anon,authenticated/);
  assert.match(source,/revoke all on function private\.vocabulary_diagnostic_enforce_practice_gate\(\)/);
});
test('server status distinguishes baseline completion from reassessment',()=>{
  assert.match(status,/where student_id=p_actor and kind='baseline'/);
  assert.match(status,/'baselineCompleted',exists\(/);
  assert.match(status,/bs\.kind='baseline' and bs\.state='completed'/);
  assert.match(status,/'baselineAssignmentId'/);
});
test('router checks baseline before loading any student practice app',()=>{
  const gate=router.indexOf('if (DIAGNOSTIC_BASELINE_GATE_ENABLED || voluntaryDiagnosticRequested)');
  const practice=router.indexOf("await import('./app.js?v=meaning-recognise-v1');",gate);
  assert.ok(gate>=0&&practice>gate);
  assert.match(router,/initialiseVocabularyDiagnostic/);
  assert.match(router,/onComplete:\(\)=>window\.location\.replace/);
});
test('player uses the authenticated backend and never copies keyed bank',()=>{
  assert.match(player,/functions\.invoke\('vocabulary-diagnostic'/);
  assert.match(player,/crypto\.randomUUID/);
  assert.doesNotMatch(player,/item\.correctOptionId|correct_answer|gradeAnswer\(/);
});
