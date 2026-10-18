import test from 'node:test';
import assert from 'node:assert/strict';

// Contract-first: production stage derivation is intentionally absent in this RED commit.
async function stageModule() {
  try { return await import('../src/vocabulary/learning-stage.js'); }
  catch { return {}; }
}

function mastery(status, strandEvidence = {}) {
  return {
    status,
    strandEvidence:{ meaning:0, recognition:0, context:0, paraphrasing:0, production:0, ...strandEvidence }
  };
}

test('learning stage module exposes the shared five-stage derivation contract', async () => {
  const module = await stageModule();
  assert.equal(typeof module.deriveLearningStage, 'function');
  assert.ok(Array.isArray(module.LEARNING_STAGES));
  assert.deepEqual(module.LEARNING_STAGES.map(stage => stage.id), ['emerging','building','developing','secure','mastered']);
});

test('new mastery is Emerging and early building mastery is Building', async () => {
  const { deriveLearningStage } = await stageModule();
  assert.equal(deriveLearningStage(mastery('new')), 'emerging');
  assert.equal(deriveLearningStage(mastery('building', { meaning:2, recognition:1 })), 'building');
});

test('building mastery becomes Developing only with broad higher-order evidence', async () => {
  const { deriveLearningStage } = await stageModule();
  assert.equal(deriveLearningStage(mastery('building', { meaning:3, context:3 })), 'developing');
  assert.equal(deriveLearningStage(mastery('building', { recognition:3, paraphrasing:3 })), 'developing');
  assert.equal(deriveLearningStage(mastery('building', { meaning:3, recognition:3 })), 'building');
  assert.equal(deriveLearningStage(mastery('building', { context:3, paraphrasing:2 })), 'building');
});

test('secure and mastered persisted states map directly to the same visible stage', async () => {
  const { deriveLearningStage } = await stageModule();
  assert.equal(deriveLearningStage(mastery('secure')), 'secure');
  assert.equal(deriveLearningStage(mastery('mastered')), 'mastered');
});

test('malformed mastery fails safely to a persisted-status-compatible stage', async () => {
  const { deriveLearningStage } = await stageModule();
  assert.equal(deriveLearningStage(), 'emerging');
  assert.equal(deriveLearningStage({ status:'building', strandEvidence:null }), 'building');
  assert.equal(deriveLearningStage({ status:'secure', strandEvidence:{ context:'not-a-number' } }), 'secure');
  assert.equal(deriveLearningStage({ status:'unexpected', strandEvidence:{ context:99, paraphrasing:99 } }), 'emerging');
});
