import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const attemptSource = fs.readFileSync(new URL('../supabase/functions/vocabulary-attempt-action/index.ts', import.meta.url), 'utf8');
const atomicSql = fs.readFileSync(new URL('../supabase/migrations/20261017055000_atomic_vocabulary_mastery.sql', import.meta.url), 'utf8');
const evidenceSql = fs.readFileSync(new URL('../supabase/migrations/20261017103000_vocabulary_mastery_evidence_strength.sql', import.meta.url), 'utf8');

test('vocabulary attempt Edge Function handles CORS preflight and returns CORS headers', () => {
  assert.match(attemptSource, /Access-Control-Allow-Origin/);
  assert.match(attemptSource, /req\.method === ['"]OPTIONS['"]/);
  assert.match(attemptSource, /headers:\s*CORS/);
});

test('vocabulary attempt function persists global and unit mastery through one atomic RPC', () => {
  assert.match(attemptSource, /\.rpc\(['"]apply_vocabulary_mastery_state['"]/);
  assert.equal(/from\(['"]vocabulary_global_mastery['"]\)\.upsert/.test(attemptSource), false);
  assert.equal(/from\(['"]vocabulary_unit_mastery['"]\)\.upsert/.test(attemptSource), false);
});

test('atomic mastery RPC upserts both mastery tables in a single database function', () => {
  assert.match(atomicSql, /create or replace function public\.apply_vocabulary_mastery_state/i);
  assert.match(atomicSql, /insert into public\.vocabulary_global_mastery/i);
  assert.match(atomicSql, /insert into public\.vocabulary_unit_mastery/i);
  assert.match(atomicSql, /grant execute on function public\.apply_vocabulary_mastery_state/i);
  assert.match(atomicSql, /to service_role/i);
  assert.match(atomicSql, /revoke all on function public\.apply_vocabulary_mastery_state/i);
});

test('additive mastery migration persists productive activity diversity and unscaffolded production count', () => {
  assert.match(evidenceSql, /add column production_activity_types jsonb/i);
  assert.match(evidenceSql, /add column unscaffolded_productions integer/i);
  assert.match(evidenceSql, /p_production_activity_types jsonb/i);
  assert.match(evidenceSql, /p_unscaffolded_productions integer/i);
  assert.match(evidenceSql, /production_activity_types/i);
  assert.match(evidenceSql, /unscaffolded_productions/i);
});

test('raw answer fields are not parameters or columns in either mastery RPC migration', () => {
  for (const forbidden of ['answer_text','typed_answer','raw_answer','student_answer']) {
    assert.equal(atomicSql.toLowerCase().includes(forbidden), false, `legacy rpc: ${forbidden}`);
    assert.equal(evidenceSql.toLowerCase().includes(forbidden), false, `evidence rpc: ${forbidden}`);
  }
});

test('attempt function validates unit activity target relationship before mastery write and preview returns first', () => {
  assert.match(attemptSource, /from\(['"]vocabulary_unit_activities['"]\)/);
  assert.match(attemptSource, /primaryEvidenceTargetId|primary_evidence_target/i);
  assert.match(attemptSource, /linkedVocabularyIds|linked_vocabulary/i);
  assert.match(attemptSource, /input\.preview[\s\S]+return json\(\{ ok:true, preview:true/s);
  const previewIndex = attemptSource.indexOf('if (input.preview)');
  const rpcIndex = attemptSource.indexOf(".rpc('apply_vocabulary_mastery_state'");
  assert.ok(previewIndex >= 0 && rpcIndex > previewIndex);
});
