import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { streakMomentum, starPipsFor } from '../src/vocabulary/engagement-copy.js';
import { buildSessionFinishModel } from '../src/vocabulary/session-finish-model.js';
import { buildUnitPathwayStates } from '../src/vocabulary/pathway-view-model.js';

test('streak milestones are named at 5, 8 and 10 and absent below 3', () => {
  assert.equal(streakMomentum(2),null);
  assert.equal(streakMomentum(3),'3 in a row');
  assert.equal(streakMomentum(4),'4 in a row');
  assert.equal(streakMomentum(5),'5 in a row — strong run');
  assert.equal(streakMomentum(8),'8 in a row — nearly perfect');
  assert.equal(streakMomentum(10),'10 in a row — perfect run');
});

test('star pips light at 5 / 7 / 9 correct and only for a ten-activity mission', () => {
  assert.equal(starPipsFor(4,10).lit,0);
  assert.equal(starPipsFor(5,10).lit,1);
  assert.equal(starPipsFor(7,10).lit,2);
  assert.equal(starPipsFor(9,10).lit,3);
  assert.equal(starPipsFor(9,6),null);
  assert.match(starPipsFor(7,10).label,/2 of 3 stars/);
});

test('pip thresholds match the finish-screen star thresholds', () => {
  for (let score = 0; score <= 10; score += 1) {
    const model = buildSessionFinishModel({ summary:{ practised:10, strengthened:score }, pathwayId:'meaning', startStage:'recognise' });
    assert.equal(starPipsFor(score,10).lit,model.stars,`score ${score}`);
  }
});

test('mastered finish points at Mixed Practice without forcing Continue, and says so for screen readers', () => {
  const model = buildSessionFinishModel({ summary:{ practised:10, strengthened:10 }, pathwayId:'meaning', startStage:'mastery', postPathwayState:{ currentStage:'mastery', mastered:true, completedStages:['recognise','match','apply','recall','mastery'] } });
  assert.equal(model.primaryAction,null);
  assert.equal(model.nextStep.id,'start-mixed-review');
  assert.equal(model.celebration,'mastered');
  assert.match(model.accessibleSummary,/Next step: Mixed Practice/);
});

test('pathway card reports the real clean answers still needed for the stage', () => {
  const occ = id => ({ occurrenceId:id, vocabularyId:`v${id}`, unitNumber:1 });
  const row = (clean, content) => ({ contextualEvidence:{ pathwayProgress:{ meaning:{ stages:{ recognise:{ cleanSuccesses:clean, successes:clean, contentIds:content } } } } } });
  const states = buildUnitPathwayStates({
    occurrences:[occ('a'),occ('b')],
    unitMastery:{ a:row(1,['x']), b:row(0,[]) },
    globalMastery:{}
  });
  assert.equal(states.meaning.currentStage,'recognise');
  assert.equal(states.meaning.stageEvidence.answersToClear,1 + 2);
});

test('flair slot is CSS-only, reduced-motion safe and does not use animation libraries', () => {
  const css = readFileSync(new URL('../vocabulary-completion.css',import.meta.url),'utf8');
  assert.match(css,/prefers-reduced-motion:reduce\)\{\.vocab-burst\{display:none/);
  assert.match(css,/prefers-reduced-motion:reduce\)\{\.vocab-star-pip\.is-lit\{animation:none/);
});
