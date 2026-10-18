import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { buildTimedMixedQuestion, availableActivityTypesForTarget } from '../src/vocabulary/session-targets.js';

function contentFromUnit(unit) {
  const itemsById = Object.fromEntries(unit.items.map(item => [item.vocabularyId, item]));
  const contextsByOccurrence = {};
  for (const context of unit.contexts) (contextsByOccurrence[context.occurrenceId] ??= []).push(context);
  return { ...unit, itemsById, contextsByOccurrence };
}

function widestTarget(content) {
  return content.occurrences
    .map(target => {
      const item = content.itemsById[target.vocabularyId];
      const contexts = content.contextsByOccurrence[target.occurrenceId] ?? [];
      return { target, count:availableActivityTypesForTarget({ content, target, item, contexts }).length };
    })
    .sort((a,b) => b.count - a.count)[0].target;
}

test('timed mixed builder varies eligible activity styles and avoids an immediate repeat when alternatives exist', () => {
  const content = contentFromUnit(unit1);
  const target = widestTarget(content);
  const mastery = {
    status:'mastered',
    strandEvidence:{ meaning:8, recognition:8, context:8, paraphrasing:8, production:8 },
    successfulProductions:3,
    productionContextIds:['a','b'],
    productionActivityTypes:['rewrite_phrase','rewrite_idea'],
    unscaffoldedProductions:2
  };

  const types = new Set();
  for (let index = 0; index < 30; index += 1) {
    const built = buildTimedMixedQuestion({
      content,
      target,
      mastery,
      recentActivities:[],
      supportState:null,
      reviewDue:false,
      usedContentIds:[],
      previousActivityType:null,
      seed:`timed-mix-${index}`
    });
    types.add(built.question.type);
  }
  assert.ok(types.size >= 4, `expected a mixed timed pool, got: ${[...types].join(', ')}`);

  const first = buildTimedMixedQuestion({ content, target, mastery, seed:'repeat-guard' });
  const second = buildTimedMixedQuestion({ content, target, mastery, previousActivityType:first.question.type, seed:'repeat-guard' });
  assert.notEqual(second.question.type, first.question.type);
});

test('timed sessions ignore the selected focus, while adaptive sessions keep it', () => {
  const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  assert.match(app, /const timed = mode === 'timed'/);
  assert.match(app, /rankedTargets\([^\n]*timed \? 'adaptive' : state\.practiceFocus/);
  assert.match(app, /practiceMode:timed \? 'adaptive' : state\.practiceFocus/);
  assert.match(app, /buildTimedMixedQuestion\(/);
  assert.match(app, /previousActivityType:state\.timedPreviousActivityType/);
});
