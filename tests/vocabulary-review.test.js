import test from 'node:test';
import assert from 'node:assert/strict';

async function engine() {
  return import('../supabase/functions/_shared/vocabulary-engine.js');
}

const DAY = 24 * 60 * 60 * 1000;

function mastered(overrides = {}) {
  return {
    status:'mastered',
    strandEvidence:{ meaning:8, recognition:8, context:6, paraphrasing:7, production:7 },
    successfulProductions:2,
    productionContextIds:['ctx-a','ctx-b'],
    productionActivityTypes:['rewrite_phrase'],
    unscaffoldedProductions:1,
    recentErrorCount:0,
    reviewStage:0,
    reviewFailureCount:0,
    reviewDueAt:null,
    ...overrides
  };
}

test('review cadence expands from days to weeks after successful retention', async () => {
  const { nextReviewAt } = await engine();
  const now = new Date('2026-10-17T00:00:00Z');
  const first = new Date(nextReviewAt(mastered({ reviewStage:0 }), now));
  const second = new Date(nextReviewAt(mastered({ reviewStage:1 }), now));
  const third = new Date(nextReviewAt(mastered({ reviewStage:2 }), now));

  assert.ok((first - now) >= 3 * DAY && (first - now) <= 5 * DAY);
  assert.ok((second - now) >= 7 * DAY && (second - now) <= 14 * DAY);
  assert.ok((third - now) >= 21 * DAY && (third - now) <= 28 * DAY);
});

test('one failed mastered review keeps mastered and schedules an earlier review', async () => {
  const { applyEvidence, deriveStatus, nextReviewAt } = await engine();
  const now = new Date('2026-10-17T00:00:00Z');
  const afterFailure = applyEvidence(mastered({ reviewStage:2 }), {
    strand:'production', correct:false, firstAttempt:true, contextId:'ctx-review-1', questionType:'produce_paraphrase', review:true
  }, now);
  assert.equal(afterFailure.reviewFailureCount, 1);
  assert.equal(deriveStatus(afterFailure), 'mastered');
  const due = new Date(nextReviewAt(afterFailure, now));
  assert.ok((due - now) <= 5 * DAY);
});

test('repeated mastered review failures return the word to secure', async () => {
  const { applyEvidence, deriveStatus } = await engine();
  const now = new Date('2026-10-17T00:00:00Z');
  const once = applyEvidence(mastered(), {
    strand:'production', correct:false, firstAttempt:true, contextId:'ctx-review-1', questionType:'produce_paraphrase', review:true
  }, now);
  const twice = applyEvidence(once, {
    strand:'paraphrasing', correct:false, firstAttempt:true, contextId:'ctx-review-2', questionType:'replace_phrase', review:true
  }, new Date(now.getTime() + DAY));
  assert.equal(twice.reviewFailureCount, 2);
  assert.equal(deriveStatus(twice), 'secure');
});

test('isReviewDue compares the hidden due date without changing visible mastery', async () => {
  const { isReviewDue } = await engine();
  const now = new Date('2026-10-17T00:00:00Z');
  assert.equal(isReviewDue(mastered({ reviewDueAt:'2026-10-16T00:00:00.000Z' }), now), true);
  assert.equal(isReviewDue(mastered({ reviewDueAt:'2026-10-18T00:00:00.000Z' }), now), false);
});
