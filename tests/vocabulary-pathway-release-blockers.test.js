import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { planPathwayQuestion } from '../src/vocabulary/pathway-planner.js';
import { activityDefinition } from '../src/vocabulary/activity-catalogue.js';
import { PATHWAY_ACTIVITY_MAP } from '../supabase/functions/_shared/vocabulary-pathway-contract.js';

function contentForPlanner(unit) {
  const content = {
    occurrences:unit.occurrences,
    items:unit.items,
    contexts:unit.contexts,
    activities:unit.activities,
    itemsById:Object.fromEntries(unit.items.map(item => [item.vocabularyId,item])),
    contextsByOccurrence:{}
  };
  for (const context of unit.contexts) {
    (content.contextsByOccurrence[context.occurrenceId] ??= []).push(context);
  }
  return content;
}

const content = contentForPlanner(unit1);

test('Paraphrasing fails closed for a target with no linked paraphrase material', () => {
  const linked = new Set(
    unit1.activities
      .filter(row => ['phrase_set','idea_set'].includes(row.contentType))
      .flatMap(row => row.activityData?.linkedVocabularyIds ?? [])
  );
  const target = unit1.occurrences.find(row => !linked.has(row.vocabularyId));
  assert.ok(target, 'fixture needs a Unit 1 word with no linked paraphrase material');

  assert.throws(() => planPathwayQuestion({
    pathwayId:'paraphrasing',
    stageId:'recognise',
    content,
    target,
    seed:'release-blocker:unlinked-paraphrase'
  }), /No suitable curated activity|linked|available/i);
});

test('fixed-pathway planner does not hard-code every rung to building readiness', () => {
  const source = fs.readFileSync(new URL('../src/vocabulary/pathway-planner.js', import.meta.url),'utf8');
  assert.doesNotMatch(source, /readinessStage\s*:\s*['"]building['"]/);
});

test('Precision & Use Mastery never borrows a non-precision skill', () => {
  const masteryTypes = PATHWAY_ACTIVITY_MAP.precision_use.mastery;
  assert.ok(!masteryTypes.includes('explain_another_way'), 'communication-repair/paraphrase work must not count as Precision mastery');
  for (const type of masteryTypes) {
    const definition = activityDefinition(type);
    assert.ok(definition, `missing catalogue definition for ${type}`);
    assert.equal(definition.skillFamily,'writing_vocabulary', `${type} is not Precision & Use evidence`);
  }
});

test('item-backed pathway diversity is never derived from the attempt id', () => {
  const source = fs.readFileSync(new URL('../supabase/functions/vocabulary-attempt-action/index.ts', import.meta.url),'utf8');
  assert.doesNotMatch(
    source,
    /questionIdentity\s*=\s*input\.contentSource\s*===\s*['"]item['"]\s*\?\s*attemptId/,
    'repeating the same item question with a new attempt id must not count as new content diversity'
  );
});
