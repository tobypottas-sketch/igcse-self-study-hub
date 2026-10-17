import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSupportStep } from '../src/vocabulary/scaffolding.js';

function baseActivity(overrides = {}) {
  return {
    activityId:'a1',
    type:'same_idea',
    responseMode:'choice',
    prompt:'Which sentence keeps the same meaning?',
    options:['Some students exercise after school.','All students exercise after school.','No students exercise after school.'],
    markingReference:{
      acceptedAnswers:['Some students exercise after school.'],
      meaningInvariants:[{ type:'quantity', value:'some' }],
      distractors:[
        { text:'All students exercise after school.', misconceptionCategory:'quantity_change' },
        { text:'No students exercise after school.', misconceptionCategory:'meaning_confusion' }
      ]
    },
    ...overrides
  };
}

test('first wrong choice response gets one narrower retry using only curated options', () => {
  const activity = baseActivity();
  const step = buildSupportStep(activity, { correct:false, misconceptionCategory:'quantity_change', attemptNumber:1 });
  assert.equal(step.action, 'retry');
  assert.equal(step.supportLevel, 'light');
  assert.equal(step.kind, 'narrow_choices');
  assert.ok(step.options.length >= 2);
  assert.ok(step.options.every(option => activity.options.includes(option)));
  assert.ok(step.options.includes(activity.markingReference.acceptedAnswers[0]));
  assert.equal(step.misconceptionCategory, 'quantity_change');
});

test('first wrong tile response reveals only curated build material rather than inventing a hint', () => {
  const activity = baseActivity({
    type:'build_paraphrase',
    responseMode:'tiles',
    tiles:['a','significant','improvement'],
    markingReference:{ acceptedAnswers:['a significant improvement'] }
  });
  const step = buildSupportStep(activity, { correct:false, attemptNumber:1 });
  assert.equal(step.action, 'retry');
  assert.equal(step.supportLevel, 'light');
  assert.equal(step.kind, 'partial_build');
  assert.ok(step.fixedChunks.length >= 1);
  assert.ok(step.fixedChunks.every(chunk => activity.tiles.includes(chunk)));
  assert.ok(step.remainingTiles.every(chunk => activity.tiles.includes(chunk)));
});

test('first wrong evidence-selection response narrows to curated evidence options', () => {
  const activity = baseActivity({
    type:'find_evidence',
    responseMode:'evidence',
    evidenceOptions:['because it was too expensive','members repaired several machines','before Friday'],
    markingReference:{ acceptedAnswers:['because it was too expensive'] }
  });
  const step = buildSupportStep(activity, { correct:false, attemptNumber:1 });
  assert.equal(step.action, 'retry');
  assert.equal(step.kind, 'narrow_evidence');
  assert.ok(step.options.includes('because it was too expensive'));
  assert.ok(step.options.every(option => activity.evidenceOptions.includes(option)));
});

test('first wrong text response uses only a partial clue derived from a curated accepted answer', () => {
  const activity = baseActivity({
    type:'rewrite_phrase',
    responseMode:'text',
    markingReference:{ acceptedAnswers:['a significant improvement'] }
  });
  const step = buildSupportStep(activity, { correct:false, attemptNumber:1 });
  assert.equal(step.action, 'retry');
  assert.equal(step.supportLevel, 'light');
  assert.equal(step.kind, 'partial_text');
  assert.equal(step.clue, 'a …');
  assert.notEqual(step.clue, activity.markingReference.acceptedAnswers[0]);
});

test('second unsuccessful attempt moves on and schedules recycle instead of allowing endless guessing', () => {
  const step = buildSupportStep(baseActivity(), { correct:false, misconceptionCategory:'quantity_change', attemptNumber:2 });
  assert.deepEqual(step, {
    action:'move_on',
    recycle:true,
    supportLevel:'major',
    misconceptionCategory:'quantity_change'
  });
});

test('correct response needs no support step', () => {
  assert.equal(buildSupportStep(baseActivity(), { correct:true, attemptNumber:1 }), null);
});
