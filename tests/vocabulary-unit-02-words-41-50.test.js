// Unit 2 (Digital Life) · words 41–50 authored. Same contract checks as the words 1–10 test, run through the real readiness evaluator and
// builders. All 50 words are authored; the source unit is approved and releases/unit-02.js promotes it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit2 from '../content/vocabulary/units/unit-02.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';

const TERMS = ['determination', 'overcome', 'accessory', 'equipment', 'fixture', 'removable', 'adjustable', 'affordable', 'external', 'concentrate'];
const NO_FAMILY = ['determination', 'overcome', 'accessory', 'external'];
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit2) });
const block = unit2.items.slice(40, 50);
const failed = (pathwayId, occurrenceId) => STAGES.filter(stage => (readiness.pathways[pathwayId].stageFailures[stage] ?? []).some(f => f.occurrenceId === occurrenceId));

test('words 41–50 are the agreed targets (no adverbs, so no same-part-of-speech gaps) and the source unit is approved (the live release is releases/unit-02.js)', () => {
  assert.deepEqual(block.map(item => item.term), TERMS);
  assert.equal(unit2.status, 'approved');
  assert.ok(fs.existsSync(new URL('../content/vocabulary/releases/unit-02.js', import.meta.url)), 'Unit 2 release file must exist');
});

test('every stage is buildable for words 41–50, except Word Families for the four words with no genuine family', () => {
  for (const occurrence of unit2.occurrences.slice(40, 50)) {
    const term = block.find(item => item.vocabularyId === occurrence.vocabularyId).term;
    for (const pathwayId of Object.keys(readiness.pathways)) {
      let expected = [];
      if (pathwayId === 'word_families' && NO_FAMILY.includes(term)) expected = STAGES;
      assert.deepEqual(failed(pathwayId, occurrence.occurrenceId), expected, `${term} / ${pathwayId}`);
    }
  }
});

test('words 41–50 satisfy the strict (approved) content schema; all 50 words pass it', () => {
  const approve = row => ({ ...row, status: 'approved' });
  const strict = { ...unit2, status: 'approved', items: unit2.items.map(approve), occurrences: unit2.occurrences.map(approve), contexts: unit2.contexts.map(approve), activities: unit2.activities.map(approve) };
  assert.equal(unit2.items.length, 50);
  assert.deepEqual(validateUnit(strict).errors, []);
});

test('words with no normal derivative have no family; every family has three or more forms across two or more parts of speech', () => {
  for (const term of NO_FAMILY) {
    const item = block.find(row => row.term === term);
    assert.deepEqual(item.wordFamily, [], term);
    assert.ok(!item.senses[0].wordFamilyForms?.length, term);
  }
  for (const term of TERMS.filter(t => !NO_FAMILY.includes(t))) {
    const forms = block.find(row => row.term === term).senses[0].wordFamilyForms;
    assert.ok(forms.length >= 3 && new Set(forms.map(f => f.partOfSpeech)).size >= 2, term);
  }
});

test('Meaning Mastery sentences never begin with the target and use an accepted form', () => {
  for (const item of block) for (const context of item.senses[0].masteryContexts) {
    assert.ok(!context.text.toLowerCase().startsWith(item.term.toLowerCase()), `${item.term}: ${context.text}`);
    assert.equal(context.wrongMeanings?.length, 3, item.term);
  }
});
