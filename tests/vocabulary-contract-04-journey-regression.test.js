// Part 3 (continued): the learner-journey simulation as a permanent regression test. Each old failure is captured explicitly.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { journey } from './support/vocabulary-contract/journey-sim.js';

const STAGE_INDEX = { recognise: 0, match: 1, apply: 2, recall: 3, mastery: 4 };
const perfectMeaning = journey({ pathwayId: 'meaning', accuracy: 1, missions: 16 });
const averageMeaning = journey({ pathwayId: 'meaning', accuracy: 0.75, missions: 12 });
const strugglingMeaning = journey({ pathwayId: 'meaning', accuracy: 0.5, missions: 12 });
const perfectSpelling = journey({ pathwayId: 'spelling_recall', accuracy: 1, missions: 14 });
const fmt = log => log.map(l => `${l.visibleStage}:${l.served ?? '-'}`).join(' ');
const GREEN = 'Visible stage is driven by Set missions (pass at 8/10 advances), missions are always 10 questions drawn from a complete Set, and the stage never regresses';

test('drift guard: the simulation still mirrors app.js startPathwaySession', () => {
  const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  for (const needle of ['activeSetStep(', 'missionTargetIds({ step })', 'MISSION_SIZE', 'loadPathwaySets(', 'setsFromCoverage(', 'step.firstPassComplete']) {
    assert.ok(app.includes(needle), `app.js no longer contains: ${needle} — update tests/support/vocabulary-contract/journey-sim.js`);
  }
  for (const legacy of ['targetsForPathwayStage(', 'eligibleTargetsForPathwayStage(', 'pathwayStates?.[pathwayId]?.currentStage']) {
    assert.ok(!app.includes(legacy), `app.js reads the legacy per-word stage again: ${legacy}`);
  }
});
test('simulation sanity: the perfect learner is mission-sized 10 at the start', () => assert.equal(perfectMeaning[0].served, 10));

test('journey: mission 2 after a 10/10 Recognise mission is not Recognise again (same Set advances to Match)', () => {
  assert.equal(perfectMeaning[0].visibleStage, 'recognise');
  assert.equal(perfectMeaning[1].visibleStage, 'match');
  assert.equal(perfectMeaning[1].setNumber, perfectMeaning[0].setNumber);
});

for (const [label, log] of [['perfect', perfectMeaning], ['average (75%)', averageMeaning], ['struggling (50%)', strugglingMeaning]]) {
  const sizes = log.map(l => l.served).filter(n => n != null);
  test(`journey (${label}): mission size stays 10`, () => assert.ok(sizes.length > 0 && sizes.every(n => n === 10), `sizes: ${sizes.join(',')}`));
}

for (const [label, log] of [['perfect', perfectMeaning], ['average (75%)', averageMeaning]]) {
  test(`journey (${label}): no started word is stranded`, () => assert.equal(Math.max(...log.map(l => l.stranded ?? 0)), 0));
}

test('journey (perfect, Spelling & Recall): the visible stage never regresses inside a Set; a later Set starts at Recognise', () => {
  const top = new Map();
  for (const l of perfectSpelling) {
    const i = STAGE_INDEX[l.visibleStage];
    assert.ok(i >= (top.get(l.setNumber) ?? 0), `Set ${l.setNumber} regressed to ${l.visibleStage} at mission ${l.mission} (${fmt(perfectSpelling)})`);
    top.set(l.setNumber, i);
  }
  const sets = [...new Set(perfectSpelling.map(l => l.setNumber))];
  assert.ok(sets.length >= 2, 'the perfect learner moves on to the next Set');
  for (const n of sets.slice(1)) assert.equal(perfectSpelling.find(l => l.setNumber === n).visibleStage, 'recognise');
});

test('journey: Mastery never returns to Recognise inside the same Set', () => {
  for (const log of [perfectMeaning, averageMeaning, perfectSpelling]) {
    for (let i = 1; i < log.length; i += 1) {
      if (log[i].setNumber === log[i - 1].setNumber) assert.ok(!(log[i - 1].visibleStage === 'mastery' && log[i].visibleStage === 'recognise'), `mastery → recognise at mission ${log[i].mission}`);
    }
  }
});

test('journey (perfect, Meaning): no run of single-question missions', () => {
  let run = 0;
  for (const l of perfectMeaning) { run = l.served === 1 ? run + 1 : 0; assert.ok(run < 1, `a single-question mission at mission ${l.mission}`); }
});
