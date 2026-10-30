// Unit 2 (Digital Life) · words 31–40 authored. Same contract checks as the words 1–10 test, run through the real readiness evaluator and
// builders. Words 41–50 are intentionally NOT authored and the unit stays a draft.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit2 from '../content/vocabulary/units/unit-02-draft.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import { evaluateUnitReadiness } from '../src/vocabulary/pathway-readiness.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';

const TERMS = ['professional', 'regional', 'commentary', 'educational', 'culture', 'genuine', 'amusing', 'competitive', 'critical', 'impressive'];
const NO_FAMILY = ['regional', 'genuine'];
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
const readiness = evaluateUnitReadiness({ content: releasePlannerContent(unit2) });
const block = unit2.items.slice(30, 40);
const failed = (pathwayId, occurrenceId) => STAGES.filter(stage => (readiness.pathways[pathwayId].stageFailures[stage] ?? []).some(f => f.occurrenceId === occurrenceId));

test('words 31–40 are the agreed targets (no adverbs, so no same-part-of-speech gaps) and the unit is still an unreleased draft', () => {
  assert.deepEqual(block.map(item => item.term), TERMS);
  assert.equal(unit2.status, 'draft');
  assert.ok(!fs.existsSync(new URL('../content/vocabulary/releases/unit-02.js', import.meta.url)), 'Unit 2 must not be released yet');
});

test('every stage is buildable for words 31–40, except Word Families for the two words with no genuine family', () => {
  for (const occurrence of unit2.occurrences.slice(30, 40)) {
    const term = block.find(item => item.vocabularyId === occurrence.vocabularyId).term;
    for (const pathwayId of Object.keys(readiness.pathways)) {
      let expected = [];
      if (pathwayId === 'word_families' && NO_FAMILY.includes(term)) expected = STAGES;
      assert.deepEqual(failed(pathwayId, occurrence.occurrenceId), expected, `${term} / ${pathwayId}`);
    }
  }
});

test('words 31–40 satisfy the strict (approved) content schema; only words 41–50 still fail it', () => {
  const approve = row => ({ ...row, status: 'approved' });
  const strict = { ...unit2, status: 'approved', items: unit2.items.map(approve), occurrences: unit2.occurrences.map(approve), contexts: unit2.contexts.map(approve), activities: unit2.activities.map(approve) };
  const unauthored = new Set(unit2.items.slice(40).map(item => item.term));
  const errors = validateUnit(strict).errors.filter(error => !unauthored.has(error.split(' ')[0]) && ![...unauthored].some(term => error.startsWith(`${term} `)));
  assert.deepEqual(errors, []);
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
