// Part 3 (continued): the learner-journey simulation as a permanent regression test. Each old failure is captured explicitly.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { journey } from './support/vocabulary-contract/journey-sim.js';
import { expectedFailure } from './support/vocabulary-contract/xfail.js';

const STAGE_INDEX = { recognise: 0, match: 1, apply: 2, recall: 3, mastery: 4 };
const perfectMeaning = journey({ pathwayId: 'meaning', accuracy: 1, missions: 16 });
const averageMeaning = journey({ pathwayId: 'meaning', accuracy: 0.75, missions: 12 });
const strugglingMeaning = journey({ pathwayId: 'meaning', accuracy: 0.5, missions: 12 });
const perfectSpelling = journey({ pathwayId: 'spelling_recall', accuracy: 1, missions: 14 });
const fmt = log => log.map(l => `${l.visibleStage}:${l.served ?? '-'}`).join(' ');
const GREEN = 'Visible stage is driven by Set missions (pass at 8/10 advances), missions are always 10 questions drawn from a complete Set, and the stage never regresses';

test('drift guard: the simulation still mirrors app.js startPathwaySession', () => {
  const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
  for (const needle of ['buildUnitPathwayStates(', 'targetsForPathwayStage(', 'eligibleTargetsForPathwayStage(', '.slice(0,10)', "stageId = pathwayStates?.[pathwayId]?.currentStage"]) {
    assert.ok(app.includes(needle) || app.includes(needle.replace(/ /g, '')), `app.js no longer contains: ${needle} — update tests/support/vocabulary-contract/journey-sim.js`);
  }
});
test('simulation sanity: the perfect learner is mission-sized 10 at the start', () => assert.equal(perfectMeaning[0].served, 10));

expectedFailure({
  rule: 'No repeated Recognise after a successful completed mission (the visible stage must advance on a pass)',
  today: `a 10/10 learner is shown Recognise twice (${fmt(perfectMeaning.slice(0, 3))}) because stage completion needs 2 clean successes per word`,
  turnsGreenWhen: GREEN
}, 'journey: mission 2 after a 10/10 Recognise mission is not Recognise again', () => assert.notEqual(perfectMeaning[1].visibleStage, 'recognise'));

for (const [label, log] of [['perfect', perfectMeaning], ['average (75%)', averageMeaning], ['struggling (50%)', strugglingMeaning]]) {
  const sizes = log.map(l => l.served).filter(n => n != null);
  expectedFailure({
    rule: 'Every mission is a full 10-question mission (no shrinking 10 → 5 → 2 → 1)',
    today: `${label} Meaning learner is served ${sizes.join(', ')} questions per mission`,
    turnsGreenWhen: GREEN
  }, `journey (${label}): mission size stays 10`, () => assert.ok(sizes.every(n => n === 10), `sizes: ${sizes.join(',')}`));
}

for (const [label, log] of [['perfect', perfectMeaning], ['average (75%)', averageMeaning]]) {
  const worst = Math.max(...log.map(l => l.stranded ?? 0));
  expectedFailure({
    rule: 'No stranded words: a word that has been started is never left behind the visible stage',
    today: `${label} Meaning learner has up to ${worst} started word(s) stuck below the visible stage and never served again`,
    turnsGreenWhen: GREEN
  }, `journey (${label}): no started word is stranded`, () => assert.equal(worst, 0));
}

expectedFailure({
  rule: 'The visible stage never goes backwards (no return from Mastery to Recognise)',
  today: `Spelling & Recall learner stage sequence: ${fmt(perfectSpelling)}`,
  turnsGreenWhen: GREEN
}, 'journey (perfect, Spelling & Recall): visible stage never regresses', () => {
  let top = 0;
  for (const l of perfectSpelling) { const i = STAGE_INDEX[l.visibleStage]; assert.ok(i >= top, `regressed to ${l.visibleStage} at mission ${l.mission}`); top = i; }
});

expectedFailure({
  rule: 'No perpetual 1-question tail',
  today: `perfect Meaning learner: ${perfectMeaning.filter(l => l.served === 1).length} of ${perfectMeaning.length} missions have a single question (${fmt(perfectMeaning.slice(-4))})`,
  turnsGreenWhen: GREEN
}, 'journey (perfect, Meaning): no run of single-question missions', () => {
  let run = 0;
  for (const l of perfectMeaning) { run = l.served === 1 ? run + 1 : 0; assert.ok(run < 3, `${run} single-question missions in a row at mission ${l.mission}`); }
});
