import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { EXPECTED_WORDS_PER_UNIT, UNIT_REGISTRY, pathwayOverride, unitConfig } from '../content/vocabulary/unit-registry.js';
import { pathwayLivePolicy } from '../src/vocabulary/pathway-live-policy.js';
import { buildPathwayCoverage } from '../src/vocabulary/pathway-coverage.js';
import { validateUnit } from '../content/vocabulary/schema.js';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { VOCABULARY_PATHWAYS } from '../src/vocabulary/pathway-model.js';

test('the registry lists exactly units 1 to 20 with a title and the standard word count', () => {
  assert.deepEqual(Object.keys(UNIT_REGISTRY).map(Number), Array.from({ length:20 }, (_, index) => index + 1));
  for (const unit of Object.values(UNIT_REGISTRY)) {
    assert.ok(unit.title.length > 0);
    assert.equal(unit.expectedWords, EXPECTED_WORDS_PER_UNIT);
  }
  assert.equal(unitConfig(21), null);
  assert.equal(unitConfig('x'), null);
});

test('registry titles match the planned titles in source-status.json and the published Unit 1', () => {
  const status = JSON.parse(fs.readFileSync(new URL('../content/vocabulary/source-status.json', import.meta.url), 'utf8'));
  for (const row of status.units) assert.equal(unitConfig(row.unitNumber).title, row.unitTitle, `Unit ${row.unitNumber}`);
  assert.equal(status.expectedTargetsPerUnit, EXPECTED_WORDS_PER_UNIT);
  assert.equal(unitConfig(unit1.unitNumber).title, unit1.unitTitle);
  assert.equal(unit1.occurrences.length, unitConfig(1).expectedWords);
});

test('no unit carries a manual lock: Unit 1 Paraphrasing is locked by readiness, and a registry hold can only withhold', () => {
  for (const pathway of VOCABULARY_PATHWAYS) {
    assert.equal(pathwayLivePolicy(1, pathway.id), null, pathway.id);
    assert.equal(pathwayLivePolicy(2, pathway.id), null, `unit 2 ${pathway.id}`);
  }
});

test('registry entries cannot be edited at runtime', () => {
  assert.throws(() => { 'use strict'; UNIT_REGISTRY[1].title = 'Changed'; }, TypeError);
  assert.throws(() => { 'use strict'; UNIT_REGISTRY[1].pathwayOverrides.meaning = { available:false }; }, TypeError);
});

test('the content validator uses the registry: Unit 1 still passes and a wrong title is rejected', () => {
  assert.equal(validateUnit(unit1).ok, true);
  const renamed = validateUnit({ ...unit1, unitTitle:'Something else', occurrences:unit1.occurrences.map(row => ({ ...row, unitTitle:'Something else' })) });
  assert.ok(renamed.errors.some(message => /title must match the unit registry/.test(message)));
});
