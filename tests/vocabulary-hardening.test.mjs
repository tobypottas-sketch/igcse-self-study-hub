import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const attemptSource = fs.readFileSync(new URL('../supabase/functions/vocabulary-attempt-action/index.ts', import.meta.url), 'utf8');
const atomicSql = fs.readFileSync(new URL('../supabase/migrations/20261017055000_atomic_vocabulary_mastery.sql', import.meta.url), 'utf8');
const evidenceSql = fs.readFileSync(new URL('../supabase/migrations/20261017103000_vocabulary_mastery_evidence_strength.sql', import.meta.url), 'utf8');
const attemptCommitSql = fs.readFileSync(new URL('../supabase/migrations/20261018121500_atomic_vocabulary_attempt_commit.sql', import.meta.url), 'utf8');

test('vocabulary attempt Edge Function handles CORS preflight and returns CORS headers', () => {
  assert.match(attemptSource, /Access-Control-Allow-Origin/);
  assert.match(attemptSource, /req\.method === ['"]OPTIONS['"]/);
  assert.match(attemptSource, /headers:\s*CORS/);
});

test('vocabulary attempt function commits evidence event and mastery through one atomic RPC', () => {
  assert.match(attemptSource, /\.rpc\(['"]commit_vocabulary_attempt['"]/);
  assert.equal(/\.rpc\(['"]apply_vocabulary_mastery_state['"]/.test(attemptSource), false);
  assert.equal(/from\(['"]activity_events['"]\)\.insert/.test(attemptSource), false);
  assert.equal(/from\(['"]vocabulary_global_mastery['"]\)\.upsert/.test(attemptSource), false);
  assert.equal(/from\(['"]vocabulary_unit_mastery['"]\)\.upsert/.test(attemptSource), false);
});

test('legacy atomic mastery RPC still upserts both mastery tables for compatibility', () => {
  assert.match(atomicSql, /create or replace function public\.apply_vocabulary_mastery_state/i);
  assert.match(atomicSql, /insert into public\.vocabulary_global_mastery/i);
  assert.match(atomicSql, /insert into public\.vocabulary_unit_mastery/i);
  assert.match(atomicSql, /grant execute on function public\.apply_vocabulary_mastery_state/i);
  assert.match(atomicSql, /to service_role/i);
  assert.match(atomicSql, /revoke all on function public\.apply_vocabulary_mastery_state/i);
});

test('atomic attempt commit records the evidence event and both mastery rows in one database transaction', () => {
  assert.match(attemptCommitSql, /create or replace function public\.commit_vocabulary_attempt/i);
  assert.match(attemptCommitSql, /insert into public\.activity_events/i);
  assert.match(attemptCommitSql, /insert into public\.vocabulary_global_mastery/i);
  assert.match(attemptCommitSql, /insert into public\.vocabulary_unit_mastery/i);
  assert.match(attemptCommitSql, /attempt_id uuid/i);
  assert.match(attemptCommitSql, /unique index[\s\S]+attempt_id/i);
  assert.match(attemptCommitSql, /on conflict \(attempt_id\)/i);
  assert.match(attemptCommitSql, /to service_role/i);
  assert.match(attemptCommitSql, /revoke all on function public\.commit_vocabulary_attempt/i);
});

test('additive mastery migration persists productive activity diversity and unscaffolded production count', () => {
  assert.match(evidenceSql, /add column production_activity_types jsonb/i);
  assert.match(evidenceSql, /add column unscaffolded_productions integer/i);
  assert.match(evidenceSql, /p_production_activity_types jsonb/i);
  assert.match(evidenceSql, /p_unscaffolded_productions integer/i);
  assert.match(evidenceSql, /production_activity_types/i);
  assert.match(evidenceSql, /unscaffolded_productions/i);
});

test('raw answer fields are not parameters or columns in mastery or attempt commit migrations', () => {
  for (const forbidden of ['answer_text','typed_answer','raw_answer','student_answer']) {
    assert.equal(atomicSql.toLowerCase().includes(forbidden), false, `legacy rpc: ${forbidden}`);
    assert.equal(evidenceSql.toLowerCase().includes(forbidden), false, `evidence rpc: ${forbidden}`);
    assert.equal(attemptCommitSql.toLowerCase().includes(forbidden), false, `attempt commit rpc: ${forbidden}`);
  }
});

test('attempt function validates unit activity target relationship before atomic commit and preview returns first', () => {
  assert.match(attemptSource, /from\(['"]vocabulary_unit_activities['"]\)/);
  assert.match(attemptSource, /primaryEvidenceTargetId|primary_evidence_target/i);
  assert.match(attemptSource, /linkedVocabularyIds|linked_vocabulary/i);
  assert.match(attemptSource, /input\.preview[\s\S]+return json\(\{ ok:true, preview:true/s);
  const previewIndex = attemptSource.indexOf('if (input.preview)');
  const rpcIndex = attemptSource.indexOf(".rpc('commit_vocabulary_attempt'");
  assert.ok(previewIndex >= 0 && rpcIndex > previewIndex);
});

test('Question ↔ Text Bridge is marked against the curated paraphrased question while Find Evidence stays tied to source evidence', () => {
  assert.match(attemptSource, /function questionTextMarking\([^)]*questionType[^)]*\)/);
  assert.match(attemptSource, /questionType\s*===\s*['"]question_text_bridge['"][\s\S]{0,500}selected\?\.question/);
  assert.match(attemptSource, /selected\?\.evidenceSpans/);
  assert.match(attemptSource, /questionTextMarking\(data,\s*activityVariantId,\s*questionType\)/);
});

test('sentence-choice context activities are marked server-side against the clicked curated sentence, not a short context synonym', () => {
  assert.match(attemptSource, /prompt_text/);
  assert.match(attemptSource, /which_situation_fits/);
  assert.match(attemptSource, /correct_usage/);
  assert.match(attemptSource, /context\.prompt_text/);
  assert.match(attemptSource, /acceptedAnswers:[^\n]*sentence|sentence[^\n]*acceptedAnswers|sentenceAnswerTypes/s);
});
