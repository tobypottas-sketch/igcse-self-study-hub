import test from 'node:test';
import assert from 'node:assert/strict';
import { harness, correctAnswer, settle, advanceToRecovery } from './vocabulary-app-harness.mjs';
import { validateVocabularyAttempt, authoritativeSupportLevel } from '../supabase/functions/vocabulary-attempt-action/validation.js';
import { applyEvidence } from '../supabase/functions/_shared/vocabulary-engine.js';
import { applyPathwayAttempt, freshPathwayProgress } from '../supabase/functions/_shared/vocabulary-pathway-progress.js';


test('production shape: Word Families Match → wrong → supported retry → recovery question is accepted by server validation', async () => {
  const h = harness();
  h.run("startPathwaySession('word_families')");
  assert.equal(h.state.pathwayStage, 'match');
  const first = h.state.current; assert.equal(first.question.type, 'word_family_match');

  h.run('handleAnswer(null,"__wrong__")');            // 1. wrong Match answer (first attempt)
  assert.equal(h.state.current, first); assert.equal(h.state.current.retry, true);
  h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);  // 2. supported retry, correct
  const recovery = await advanceToRecovery(h);                    // 3. recovery question served one stage lower
  assert.equal(recovery.recovery, true);
  assert.equal(recovery.pathwayPlan.servedStage, 'recognise', 'support serves the previous stage');
  h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);  // 4. recovery answer, correct
  await settle(h);

  assert.deepEqual(h.rejected.map(row => row.message), [], 'the server must accept every payload the browser sends');
  assert.equal(h.state.attempts.blocked, false);
  assert.equal(h.saved.length, 4, 'wrong, supported retry, the other target (clean), then recovery');
  const ids = h.saved.map(row => row.attemptId); // attemptId is assigned by the controller per answer
  assert.equal(new Set(ids).size, 4, 'each answer has its own stable attempt id');
  const third = h.saved.at(-1);
  assert.equal(third.pathwayStage, 'match'); assert.equal(third.servedPathwayStage, 'recognise');
  assert.notEqual(third.supportLevel, 'none', 'a lower-stage question is declared as support, not hidden');
});

test('support metadata is honest and evidence/progression stay server-authoritative', async () => {
  const h = harness();
  h.run("startPathwaySession('word_families')");
  h.run('handleAnswer(null,"__wrong__")');
  h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);
  await advanceToRecovery(h);
  h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);
  await settle(h);
  const [wrong, retry] = h.saved; const recovery = h.saved.at(-1);
  assert.deepEqual([wrong.firstAttempt, wrong.retryUsed, wrong.supportLevel, wrong.servedPathwayStage], [true, false, 'none', 'match']);
  assert.deepEqual([retry.firstAttempt, retry.retryUsed, retry.servedPathwayStage], [false, true, 'match']);
  assert.notEqual(retry.supportLevel, 'none');
  assert.deepEqual([recovery.pathwayStage, recovery.servedPathwayStage, recovery.recoveredLater], ['match', 'recognise', true]);
  // The server derives the evidence support level itself from the VALIDATED coordinates.
  assert.equal(authoritativeSupportLevel(validateVocabularyAttempt(recovery)), 'light', 'a lower-stage support question is supported evidence, not none');
  assert.equal(authoritativeSupportLevel(validateVocabularyAttempt(wrong)), 'none');
  assert.equal(authoritativeSupportLevel(validateVocabularyAttempt(retry)), 'light');
  assert.equal(h.state.attempts.pending, 0);
});

test('validation still rejects an undeclared lower-stage question (the rule is not weakened)', () => {
  const base = { occurrenceId:'o1', rawAnswer:'x', questionType:'word_family_choice', contentSource:'unit_activity', activityContentId:'a1', pathwayId:'word_families', pathwayStage:'match', servedPathwayStage:'recognise', firstAttempt:true, retryUsed:false, supportLevel:'none' };
  assert.throws(() => validateVocabularyAttempt(base), /requires support/);
  assert.doesNotThrow(() => validateVocabularyAttempt({ ...base, supportLevel:'light' }));
  assert.throws(() => validateVocabularyAttempt({ ...base, servedPathwayStage:'apply' }), /Served pathway stage is invalid/);
});

// ── Evidence semantics of lower-stage support (server-authoritative) ───────────────────────────
const base = { occurrenceId:'o1', rawAnswer:'x', questionType:'word_family_choice', contentSource:'unit_activity', activityContentId:'a1', pathwayId:'word_families', pathwayStage:'match', servedPathwayStage:'recognise', firstAttempt:true, retryUsed:false, supportLevel:'light' };
const sameStage = { ...base, questionType:'word_family_match', servedPathwayStage:'match', supportLevel:'none' };

test('authoritative support: lower-stage served question is at least light; ordinary same-stage stays none', () => {
  assert.equal(authoritativeSupportLevel(validateVocabularyAttempt(base)), 'light');
  assert.equal(authoritativeSupportLevel(validateVocabularyAttempt({ ...base, supportLevel:'major' })), 'major');
  assert.equal(authoritativeSupportLevel(validateVocabularyAttempt(sameStage)), 'none');
  // A client cannot buy a reduced weighting on an ordinary same-stage first attempt by claiming support.
  assert.equal(authoritativeSupportLevel(validateVocabularyAttempt({ ...sameStage, supportLevel:'light' })), 'none');
  assert.equal(authoritativeSupportLevel(validateVocabularyAttempt({ ...sameStage, supportLevel:'major' })), 'none');
  // Existing semantics preserved.
  assert.equal(authoritativeSupportLevel(validateVocabularyAttempt({ ...sameStage, retryUsed:true, firstAttempt:false })), 'light');
  assert.equal(authoritativeSupportLevel(validateVocabularyAttempt({ ...sameStage, retryUsed:true, firstAttempt:false, supportLevel:'major' })), 'major');
  assert.equal(authoritativeSupportLevel(validateVocabularyAttempt({ ...sameStage, repeatedGuess:true })), 'major');
  // No pathway at all (non-pathway modes): unchanged.
  const plain = { occurrenceId:'o1', rawAnswer:'x', questionType:'meaning_match', contentSource:'context', contextId:'c1', firstAttempt:true, retryUsed:false, supportLevel:'light' };
  assert.equal(authoritativeSupportLevel(validateVocabularyAttempt(plain)), 'none');
});

test('lower-stage support earns reduced mastery evidence and no Match-stage progression credit', () => {
  const evidenceFor = payload => ({ strand:'recognition', strands:['recognition'], evidenceStrength:'light', supportLevel:authoritativeSupportLevel(validateVocabularyAttempt(payload)), productive:false, repeatedGuess:false, correct:true, firstAttempt:payload.firstAttempt, retryUsed:payload.retryUsed, recoveredLater:true, review:false, questionType:payload.questionType });
  const now = new Date('2026-01-01T00:00:00Z');
  const supported = applyEvidence({}, evidenceFor(base), now);
  const unassisted = applyEvidence({}, { ...evidenceFor(base), supportLevel:'none' }, now);
  assert.ok(supported.strandEvidence.recognition > 0);
  assert.ok(supported.strandEvidence.recognition < unassisted.strandEvidence.recognition, 'supported evidence is weighted below unassisted evidence');

  // Pathway progression: correct lower-stage support clears needsPractice but earns no Match credit.
  let progress = freshPathwayProgress({ completedStages:['recognise'] });
  progress = { ...progress, supportRequested:true, stages:{ ...progress.stages, match:{ ...progress.stages.match, needsPractice:true, failures:2 } } };
  const after = applyPathwayAttempt(progress, { stageId:'match', servedStageId:'recognise', correct:true, firstAttempt:true, retryUsed:false, supportLevel:authoritativeSupportLevel(validateVocabularyAttempt(base)), contentId:'a1:q', promptKey:'a1:q', activityType:'word_family_choice' });
  assert.equal(after.stages.match.needsPractice, false, 'successful support clears Needs practice as designed');
  assert.equal(after.supportRequested, false);
  for (const field of ['successes', 'cleanSuccesses', 'cleanUnassistedSuccesses']) assert.equal(after.stages.match[field], progress.stages.match[field], `${field} must not grow`);
  assert.deepEqual(after.stages.match.contentIds, progress.stages.match.contentIds);
  assert.deepEqual(after.stages.match.promptKeys, progress.stages.match.promptKeys);
});

test('the Edge Function decides evidence support only through authoritativeSupportLevel', async () => {
  const { readFileSync } = await import('node:fs');
  const index = readFileSync(new URL('../supabase/functions/vocabulary-attempt-action/index.ts', import.meta.url), 'utf8');
  assert.match(index, /import \{[^}]*authoritativeSupportLevel[^}]*\} from '\.\/validation\.js'/);
  assert.match(index, /const supportLevel = authoritativeSupportLevel\(input\)/);
  assert.doesNotMatch(index, /function authoritativeSupport\(/);
});
