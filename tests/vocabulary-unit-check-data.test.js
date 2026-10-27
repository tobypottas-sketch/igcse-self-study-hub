import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadVocabularyUnitCheckAttempts, recordVocabularyUnitCheckAttempt } from '../src/vocabulary/unit-check-data.js';

function fakeClient(rows = []) {
  const calls = [];
  const query = {
    select(columns) { calls.push(['select', columns]); return this; },
    eq(column,value) { calls.push(['eq', column, value]); return this; },
    order(column,options) { calls.push(['order', column, options]); return Promise.resolve({ data:rows, error:null }); },
    insert(payload) { calls.push(['insert', payload]); return this; },
    single() { return Promise.resolve({ data:rows[0] ?? null, error:null }); }
  };
  return { calls, from(table) { calls.push(['from', table]); return query; } };
}

test('formal check persistence loads score summaries for one unit', async () => {
  const client = fakeClient([{ attempt_number:1, form_id:'A', score:7, max_score:10 }]);
  const rows = await loadVocabularyUnitCheckAttempts(client, 1);
  assert.equal(rows.length, 1);
  assert.ok(client.calls.some(call => call[0] === 'from' && call[1] === 'vocabulary_unit_check_attempts'));
  assert.ok(client.calls.some(call => call[0] === 'eq' && call[1] === 'unit_number' && call[2] === 1));
});

test('formal check save persists score metadata only and never raw answers', async () => {
  const client = fakeClient([{ attempt_number:1, form_id:'A', score:8, max_score:10 }]);
  await recordVocabularyUnitCheckAttempt(client, { unitNumber:1, formId:'A', attemptNumber:1, score:8, maxScore:10, answers:{ A1:'unfamiliar' } });
  const insert = client.calls.find(call => call[0] === 'insert')?.[1];
  assert.deepEqual(insert, { unit_number:1, form_id:'A', attempt_number:1, score:8, max_score:10 });
  assert.equal('answers' in insert, false);
});

test('migration enforces three attempts, form mapping, score bounds and student-owned RLS', () => {
  const sql = fs.readFileSync(new URL('../supabase/migrations/20261027130000_vocabulary_unit_checks.sql', import.meta.url), 'utf8').toLowerCase();
  assert.match(sql, /create table public\.vocabulary_unit_check_attempts/);
  assert.match(sql, /unique \(student_id, unit_number, attempt_number\)/);
  assert.match(sql, /attempt_number between 1 and 3/);
  assert.match(sql, /\(attempt_number = 1 and form_id = 'a'\)/);
  assert.match(sql, /\(attempt_number = 2 and form_id = 'b'\)/);
  assert.match(sql, /\(attempt_number = 3 and form_id = 'c'\)/);
  assert.match(sql, /student_id = \(select auth\.uid\(\)\)/);
  assert.doesNotMatch(sql, /raw_answer|answers json|student_answer/);
});
