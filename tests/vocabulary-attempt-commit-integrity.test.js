import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateVocabularyAttempt } from '../supabase/functions/vocabulary-attempt-action/validation.js';

const validAttempt = {
  attemptId:'11111111-1111-4111-8111-111111111111',
  occurrenceId:'u1_01_leisure',
  contextId:'u1_01_leisure_meaning',
  contentSource:'context',
  questionType:'meaning_match',
  rawAnswer:'free time'
};

test('attempt submissions preserve valid idempotency IDs and tolerate legacy clients', () => {
  const parsed = validateVocabularyAttempt(validAttempt);
  assert.equal(parsed.attemptId, validAttempt.attemptId);
  assert.equal(validateVocabularyAttempt({ ...validAttempt, attemptId:null }).attemptId, null);
  assert.throws(
    () => validateVocabularyAttempt({ ...validAttempt, attemptId:'not-a-uuid' }),
    /Attempt ID is invalid/i
  );
});

test('edge function commits activity event and mastery through one atomic RPC', () => {
  const source = fs.readFileSync(new URL('../supabase/functions/vocabulary-attempt-action/index.ts', import.meta.url), 'utf8');
  assert.match(source, /input\.attemptId\s*\?\?\s*crypto\.randomUUID\(\)/);
  assert.match(source, /rpc\(['\"]commit_vocabulary_attempt['\"]/);
  assert.doesNotMatch(source, /\.from\(['\"]activity_events['\"]\)\.insert/);
  assert.doesNotMatch(source, /rpc\(['\"]apply_vocabulary_mastery_state['\"]/);
});
