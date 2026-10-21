import test from 'node:test';
import assert from 'node:assert/strict';
import unit from '../content/vocabulary/releases/unit-01.js';
import { buildActivity } from '../src/vocabulary/activity-factory.js';
import { buildSupportStep } from '../src/vocabulary/scaffolding.js';
import { unsolvedTileOrder, isSolvedOrder } from '../src/vocabulary/tile-order.js';

// Spelling & Recall → Apply (`spelling_rebuild`): the letter tiles must never be served already spelling the answer.
const itemOf = term => unit.items.find(row => row.term === term);
const occurrenceOf = term => unit.occurrences.find(row => row.vocabularyId === itemOf(term).vocabularyId);
function rebuild(term, seed) {
  const item = itemOf(term); const occurrence = occurrenceOf(term);
  return buildActivity({
    activityType:'spelling_rebuild', occurrence, item, contexts:unit.contexts.filter(row => row.occurrenceId === occurrence.occurrenceId),
    unitItems:unit.items, unitContexts:unit.contexts, unitOccurrences:unit.occurrences, unitActivities:unit.activities,
    mastery:{ status:'building', strandEvidence:{ recognition:2 } }, seed
  });
}
const SEEDS = Array.from({ length: 400 }, (_, index) => `seed-${index}`);

test('the served tile order is never the answer: 4-letter word (deny), every seed', () => {
  for (const seed of SEEDS) {
    const question = rebuild('deny', seed);
    assert.equal(question.type, 'spelling_rebuild');
    assert.deepEqual([...question.tiles].sort(), ['d', 'e', 'n', 'y'], 'the same letters are served');
    assert.notEqual(question.tiles.join(''), 'deny', `solved order served for ${seed}`);
  }
});

test('the served tile order is never the answer: longer word (reasonable), every seed', () => {
  for (const seed of SEEDS) {
    const question = rebuild('reasonable', seed);
    assert.deepEqual([...question.tiles].sort(), Array.from('reasonable').sort());
    assert.notEqual(question.tiles.join(''), 'reasonable');
  }
});

test('every Unit 1 spelling target is unsolved for many seeds, and short words are not mostly solved either', () => {
  for (const item of unit.items) {
    const letters = Array.from(item.term);
    if (new Set(letters).size < 2) continue;
    for (const seed of SEEDS.slice(0, 120)) {
      const tiles = rebuild(item.term, seed).tiles;
      assert.notEqual(tiles.join(''), item.term, `${item.term}/${seed}`);
      if (letters.length >= 4) {
        const inPlace = tiles.filter((tile, index) => tile === letters[index]).length;
        assert.ok(inPlace * 2 <= letters.length, `${item.term}/${seed}: ${tiles.join('')} is nearly solved`);
      }
    }
  }
});

test('the same seed always gives the same tile order (stable, deterministic)', () => {
  for (const seed of SEEDS.slice(0, 40)) {
    assert.deepEqual(rebuild('deny', seed).tiles, rebuild('deny', seed).tiles);
    assert.deepEqual(rebuild('reasonable', seed).tiles, rebuild('reasonable', seed).tiles);
  }
  assert.ok(new Set(SEEDS.map(seed => rebuild('deny', seed).tiles.join(''))).size > 5, 'different seeds still vary the order');
});

test('helper: forces a different order even when the plain shuffle would solve the word', () => {
  // find a seed for which a plain deterministic shuffle is solved, then prove the helper escapes it
  assert.equal(isSolvedOrder(['d', 'e', 'n', 'y'], 'deny'), true);
  assert.equal(isSolvedOrder(['e', 'd', 'n', 'y'], 'deny'), false);
  for (const word of ['deny', 'aid', 'it', 'reasonable', 'ab', 'noon']) {
    for (const seed of SEEDS) assert.notEqual(unsolvedTileOrder(Array.from(word), word, seed).join(''), word, `${word}/${seed}`);
  }
  // an unsolvable set (all letters identical or a single tile) is refused rather than silently served solved
  assert.throws(() => unsolvedTileOrder(['a', 'a', 'a'], 'aaa', 's'), /cannot be arranged/i);
  assert.throws(() => unsolvedTileOrder(['a'], 'a', 's'), /cannot be arranged/i);
});

test('retry / reset path: the supported partial build never lands in the solved order', () => {
  for (const term of ['deny', 'reasonable', 'afford', 'avoid']) {
    for (const seed of SEEDS) {
      const question = rebuild(term, seed);
      const step = buildSupportStep(question, { correct:false });
      assert.equal(step.kind, 'partial_build');
      const rebuilt = [...step.fixedChunks, ...step.remainingTiles].join('');
      assert.notEqual(rebuilt, term, `${term}/${seed}: the retry would show the solved word`);
      assert.deepEqual([...step.fixedChunks, ...step.remainingTiles].sort(), Array.from(term).sort(), 'no tile lost or added');
    }
  }
});

test('retry path: a remainder that would be solved is rearranged (constructed worst case)', () => {
  const activity = { type:'spelling_rebuild', responseMode:'tiles', activityId:'x', tiles:['e', 'd', 'n', 'y'], markingReference:{ acceptedAnswers:['deny', 'd e n y'] } };
  // first correct tile is "d"; the remaining order e,n,y would spell "deny" after the fixed "d"
  const step = buildSupportStep(activity, { correct:false });
  assert.deepEqual(step.fixedChunks, ['d']);
  assert.notEqual(['d', ...step.remainingTiles].join(''), 'deny');
  assert.deepEqual([...step.remainingTiles].sort(), ['e', 'n', 'y']);
});

test('other tile activities keep their exact current retry behaviour', () => {
  const activity = { type:'collocation_builder', responseMode:'tiles', activityId:'c', tiles:['make', 'a', 'decision'], markingReference:{ acceptedAnswers:['make a decision'] } };
  const step = buildSupportStep(activity, { correct:false });
  assert.deepEqual(step.fixedChunks, ['make']);
  assert.deepEqual(step.remainingTiles, ['a', 'decision']);
});
