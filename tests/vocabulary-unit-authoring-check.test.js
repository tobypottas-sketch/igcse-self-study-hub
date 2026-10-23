import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import unit1 from '../content/vocabulary/units/unit-01.js';
import template from '../content/vocabulary/units/unit-template.js';
import { buildCuratedUnit } from '../content/vocabulary/build-unit.js';
import { checkUnitAuthoring, renderAuthoringReport } from '../content/vocabulary/authoring-check.js';
import { validateUnit } from '../content/vocabulary/schema.js';

const FIELDS = ['situationDistractors','gapDistractors','spellingErrors'];
const strip = item => ({ ...item, senses:item.senses.map(sense => Object.fromEntries(Object.entries(sense).filter(([key]) => !FIELDS.includes(key)))) });
const bare = { ...unit1, items:unit1.items.map(strip), activities:unit1.activities.filter(a => a.activityData?.taskType !== 'language_bank_context') };
const pathway = (report, id) => report.pathways.find(row => row.pathwayId === id);

test('Unit 1 passes the authoring check: structure valid, five pathways live, Paraphrasing short of idea records', () => {
  const report = checkUnitAuthoring(unit1);
  assert.equal(report.publishable, true);
  assert.deepEqual(report.pathways.filter(row => row.live).map(row => row.pathwayId), ['meaning','context','word_families','precision_use','spelling_recall']);
  const paraphrasing = pathway(report, 'paraphrasing');
  assert.equal(paraphrasing.live, false);
  assert.deepEqual(paraphrasing.diversity.map(entry => [entry.have, entry.need, entry.shortBy]), [[0, 10, 10]]);
  assert.equal(paraphrasing.atLeastMoreWords, 10);
});

test('without published reviewed content the check names exactly what each strict stage lacks', () => {
  const report = checkUnitAuthoring(bare);
  const meaningApply = pathway(report, 'meaning').stages.find(stage => stage.stage === 'apply');
  assert.equal(meaningApply.have, 0);
  assert.equal(meaningApply.blockers[0].words, 50);
  assert.match(meaningApply.blockers[0].need, /situationDistractors/);
  const contextApply = pathway(report, 'context').stages.find(stage => stage.stage === 'apply');
  assert.match(contextApply.blockers.map(entry => entry.need).join(' '), /gapDistractors/);
  assert.match(renderAuthoringReport(report), /LOCKED Meaning/);
});

test('the spelling shortfall is calculated from the real words, not a fixed quota', () => {
  const report = checkUnitAuthoring(bare);
  const spelling = pathway(report, 'spelling_recall');
  const recognise = spelling.stages.find(stage => stage.stage === 'recognise');
  // 90% of 50 = 45 words must be ready; the generator covers 42, so 3 more are needed even though 8 words lack coverage.
  assert.equal(recognise.need, 45);
  assert.equal(recognise.shortBy, 45 - recognise.have);
  const lacking = recognise.blockers.reduce((total, entry) => total + entry.words, 0);
  assert.ok(lacking > recognise.shortBy, 'more words lack coverage than the minimum requires');
  assert.equal(spelling.atLeastMoreWords, recognise.shortBy);

  // Author reviewed spellings for words it named, and the requirement shrinks by exactly that many, down to none.
  const named = recognise.blockers.flatMap(entry => entry.terms);
  const withSpellings = count => ({
    ...bare,
    items:bare.items.map(item => named.slice(0, count).includes(item.term)
      ? { ...item, senses:item.senses.map(sense => ({ ...sense, spellingErrors:['zxqa one', 'zxqa two', 'zxqa three'].map(value => value.replace(' ', item.term.slice(0, 2))) })) }
      : item)
  });
  const after = n => pathway(checkUnitAuthoring(withSpellings(n)), 'spelling_recall');
  assert.equal(after(1).stages.find(stage => stage.stage === 'recognise').shortBy, recognise.shortBy - 1);
  assert.equal(after(recognise.shortBy).live, true);
  assert.equal(after(recognise.shortBy).atLeastMoreWords, 0);
});

test('a malformed reviewed row is reported and blocks that word instead of being trusted', () => {
  const items = unit1.items.map(item => {
    if (item.term !== 'permit') return item;
    const rows = item.senses[0].gapDistractors;
    return { ...item, senses:[{ ...item.senses[0], gapDistractors:[{ ...rows[0], wrong:[rows[0].answer, 'x', 'y'] }, ...rows.slice(1)] }] };
  });
  const report = checkUnitAuthoring({ ...unit1, items, activities:unit1.activities.filter(a => a.activityData?.taskType !== 'language_bank_context') });
  assert.equal(report.authoring.gapMalformed, 1);
  const recognise = pathway(report, 'context').stages.find(stage => stage.stage === 'recognise');
  assert.ok(recognise.blockers.some(entry => entry.terms.includes('permit') && /gapDistractors/.test(entry.need)));
});

test('a reviewed gap row that points at no sentence is a build error, not a silent skip', () => {
  assert.throws(() => buildCuratedUnit({
    unitNumber:2, unitTitle:'X', entries:[{
      term:'avoid', partOfSpeech:'verb', meaning:'to stay away from', paraphrases:['stay away'], distractors:['join','permit','urge'],
      meaningSentence:'He avoids training outdoors.', paraphrase:{ source:'stays away from', sentence:'He stays away from training outdoors.' }, production:{ source:'stay away', sentence:'Athletes stay away from unsafe areas.' },
      gapDistractors:[{ id:'nope', answer:'avoid', wrong:['a','b','c'] }]
    }]
  }), /not one of its gap-fill sentences/);
});

test('the template builds, is structurally valid, and is never picked up as a release', () => {
  assert.equal(validateUnit(template).ok, true, validateUnit(template).errors.join('; '));
  const report = checkUnitAuthoring(template);
  assert.equal(report.publishable, true);
  assert.equal(report.authoring.gapMalformed, 0);
  assert.equal(report.authoring.situationWordsReviewed, 2);
  const releaseFilter = /^unit-\d{2}\.(json|js)$/i; // the discovery rule in scripts/validate-vocabulary-content.mjs
  assert.equal(releaseFilter.test('unit-template.js'), false);
  assert.ok(fs.readFileSync(new URL('../scripts/validate-vocabulary-content.mjs', import.meta.url), 'utf8').includes('unit-\\d{2}'));
});

test('the command line exits non-zero when a required pathway would not be live', () => {
  const run = extra => spawnSync(process.execPath, ['scripts/check-unit-authoring.mjs', 'content/vocabulary/units/unit-01.js', ...extra], { cwd:new URL('..', import.meta.url), encoding:'utf8' });
  assert.equal(run([]).status, 0);
  assert.equal(run(['--require-live','meaning,context,spelling_recall']).status, 0);
  const failing = run(['--require-live','paraphrasing']);
  assert.equal(failing.status, 1);
  assert.match(failing.stderr, /Not live but required: paraphrasing/);
});
