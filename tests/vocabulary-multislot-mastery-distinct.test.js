// Multi-slot typed Mastery tasks must ask for DIFFERENT answers: each slot is extra evidence, not the same question twice.
// Covers the classifier, the generator's selection (synthetic content with a better pair available) and the real Unit 1 pool (audit + tracked content debt).
import test from 'node:test';
import assert from 'node:assert/strict';
import { normaliseAnswer, lexemeIndex, relateAnswers, relateSlots, slotsAreDistinct, SLOT_RELATION as R } from '../src/vocabulary/slot-distinctness.js';
import { planPathwayQuestion } from '../src/vocabulary/pathway-planner.js';
import { UNIT, plannerFor, poolAudit, servedAudit } from './helpers/mastery-slot-audit.mjs';
import { expectedFailure } from './support/vocabulary-contract/xfail.js';

const items = [
  { vocabularyId:'v_compete', term:'compete', senses:[{ grammarForms:{ base:'compete', past:'competed', ing:'competing' } }], wordFamily:['competition', 'competitive'] },
  { vocabularyId:'v_player', term:'player', senses:[{}], wordFamily:[] },
  { vocabularyId:'v_tournament', term:'tournament', senses:[{}], wordFamily:[] },
  { vocabularyId:'v_spectator', term:'spectator', senses:[{}], wordFamily:[] },
  { vocabularyId:'v_afford', term:'afford', senses:[{ grammarForms:{ thirdPerson:'affords' } }], wordFamily:['affordable'] }
];
const index = lexemeIndex(items);

// ── Classifier ───────────────────────────────────────────────────────────────────
test('A exact duplicate and B normalised duplicate are recognised', () => {
  assert.equal(relateAnswers('tournament', 'tournament', index), R.EXACT);
  assert.equal(relateAnswers('Tournament', ' tournament. ', index), R.NORMALISED);
  assert.equal(relateAnswers('leisure  time', 'Leisure time!', index), R.NORMALISED);
  assert.equal(normaliseAnswer('  Goal-oriented. '), 'goal oriented');
});
test('C trivial inflections of one word are recognised, from metadata and regular variants of known headwords', () => {
  assert.equal(relateAnswers('compete', 'competed', index), R.INFLECTION);
  assert.equal(relateAnswers('player', 'players', index), R.INFLECTION);
  assert.equal(relateAnswers('spectator', 'spectators', index), R.INFLECTION);
  assert.equal(relateAnswers('can afford', 'cannot afford', index), R.INFLECTION);
  assert.equal(relateAnswers('afford', 'affords', index), R.INFLECTION);
});
test('D different derived words of one family are family members, E unrelated words are distinct', () => {
  assert.equal(relateAnswers('compete', 'competition', index), R.FAMILY);
  assert.equal(relateAnswers('compete', 'competitive', index), R.FAMILY);
  assert.equal(relateAnswers('competition', 'competitions', index), R.INFLECTION);
  assert.equal(relateAnswers('tournament', 'spectator', index), R.DISTINCT);
  assert.equal(relateAnswers('tournament', 'player', index), R.DISTINCT);
});
test('slots compare all accepted answers: one typed answer that satisfies both slots is a duplicate', () => {
  assert.equal(relateSlots(['intense', 'fierce'], ['severe', 'fierce'], index), R.EXACT);
  assert.equal(relateSlots(['tournament'], ['spectator', 'player'], index), R.DISTINCT);
});
test('word-family exception: derived forms may share a task, inflections and duplicates never may', () => {
  assert.equal(slotsAreDistinct([['compete'], ['competition']], index, { allowFamily:true }), true);
  assert.equal(slotsAreDistinct([['compete'], ['competition']], index), false, 'a normal Mastery task does not want two forms of one word');
  assert.equal(slotsAreDistinct([['compete'], ['competed']], index, { allowFamily:true }), false);
  assert.equal(slotsAreDistinct([['competition'], ['competition']], index, { allowFamily:true }), false);
  assert.equal(slotsAreDistinct([['tournament'], ['spectator'], ['player']], index), true);
});

// ── Generator selection (synthetic content, real builders) ───────────────────────
const clone = () => structuredClone(UNIT);
function withPrecisionRecords(vocabularyId, answers) {
  const content = clone();
  content.activities = content.activities.filter(row => !(row.activityData?.taskType === 'improve_vocabulary' && row.activityData.linkedVocabularyIds?.includes(vocabularyId)));
  answers.forEach((answer, i) => content.activities.push({ activityContentId:`zz_test_${vocabularyId}_${i}`, unitNumber:1, contentType:'writing_set', status:'live',
    activityData:{ taskType:'improve_vocabulary', prompt:`Replace “very good” in sentence ${i}.`, sourceText:`The very good result number ${i} pleased the whole team.`, acceptedAnswers:[answer], linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId } }));
  return content;
}
function precisionPairs(content, vocabularyId, seeds = 60) {
  const planner = plannerFor(content), target = planner.occurrences.find(row => row.vocabularyId === vocabularyId), out = [];
  for (let s = 0; s < seeds; s += 1) out.push(planPathwayQuestion({ pathwayId:'precision_use', stageId:'mastery', content:planner, target, mastery:{}, seed:`distinct:${s}` }).question.markingReference.slotAnswers.map(list => list[0]));
  return out;
}
test('Precision Mastery pairs sentences with DIFFERENT answers whenever the content offers a different one', () => {
  const content = withPrecisionRecords('vocab_tournament', ['tournament', 'tournament', 'championship']);
  const pairs = precisionPairs(content, 'vocab_tournament');
  for (const pair of pairs) assert.notEqual(pair[0], pair[1], `never the same answer twice: ${pair}`);
  assert.ok(pairs.some(pair => pair.includes('championship')), 'the distinct sentence is used');
});
test('Precision Mastery prefers a different word over an inflection over a repeat, and a trivial inflection is never chosen over a different word', () => {
  const content = withPrecisionRecords('vocab_avoid', ['avoid', 'avoids', 'steer clear of', 'avoid']);
  const planner = plannerFor(content), idx = lexemeIndex(planner.items);
  for (const pair of precisionPairs(content, 'vocab_avoid')) assert.equal(relateSlots([pair[0]], [pair[1]], idx), R.DISTINCT, `unexpected pair ${pair}`);
  const only = withPrecisionRecords('vocab_avoid', ['avoid', 'avoid', 'avoids']);
  for (const pair of precisionPairs(only, 'vocab_avoid')) if (pair.includes('avoids')) assert.deepEqual(new Set(pair), new Set(['avoid', 'avoids']), 'when no different word exists the inflection pair is preferred to repeating the same answer');
});
test('Precision Mastery selection is deterministic for a seed', () => {
  const content = withPrecisionRecords('vocab_tournament', ['tournament', 'tournament', 'championship']);
  assert.deepEqual(precisionPairs(content, 'vocab_tournament', 20), precisionPairs(content, 'vocab_tournament', 20));
});
test('Word Families Mastery never asks two inflections of one form when a better set exists, and still builds when none does', () => {
  const build = forms => {
    const content = clone(), item = content.items.find(row => row.vocabularyId === 'vocab_avoid');
    item.senses[0].wordFamilyForms = [item.senses[0].wordFamilyForms[0], ...forms];
    return plannerFor(content);
  };
  const row = (form, partOfSpeech, example) => ({ form, partOfSpeech, example, pedagogicallyUseful:true });
  const three = build([row('avoidance', 'noun', 'Injury avoidance matters for every athlete.'), row('avoidances', 'noun', 'Two avoidances were noted by the coach.'), row('unavoidable', 'adjective', 'Some delays are unavoidable.')]);
  const target = three.occurrences.find(r => r.vocabularyId === 'vocab_avoid'), idx = lexemeIndex(three.items);
  for (let s = 0; s < 60; s += 1) {
    const answers = planPathwayQuestion({ pathwayId:'word_families', stageId:'mastery', content:three, target, mastery:{}, seed:`wf:${s}` }).question.markingReference.slotAnswers.map(list => list[0]);
    assert.ok(slotsAreDistinct(answers.map(a => [a]), idx, { allowFamily:true }), `bad family set ${answers}`);
  }
  const two = build([row('avoidance', 'noun', 'Injury avoidance matters for every athlete.'), row('avoidances', 'noun', 'Two avoidances were noted by the coach.')]);
  // Only inflections are left: the word is still served (so Sets and readiness are unchanged) and is reported as content debt below.
  assert.ok(planPathwayQuestion({ pathwayId:'word_families', stageId:'mastery', content:two, target:two.occurrences.find(r => r.vocabularyId === 'vocab_avoid'), mastery:{}, seed:'wf' }).question.markingReference.slotAnswers.length === 2);
});

// ── Real Unit 1 pool ─────────────────────────────────────────────────────────────
test('Unit 1 Word Families Mastery: the pool holds derived-form pairs, and no exact or normalised duplicate exists', () => {
  const { family, familyWordsWithoutCleanSet } = poolAudit();
  assert.deepEqual([family.exact, family.normalised, family.distinct], [0, 0, 0]);
  assert.ok(family[R.FAMILY] > 50, 'the pool holds genuine derived-form pairs (the acceptable word-family case)');
  assert.ok(family.inflection <= 4 && familyWordsWithoutCleanSet.length <= 1, `tracked content debt cannot grow: ${JSON.stringify(familyWordsWithoutCleanSet)}`);
});
test('Unit 1 Word Families Mastery: seeded served tasks use an inflection-free set for every word that has one', () => {
  const { served, built, inflectionTerms } = servedAudit({ seeds:20 });
  assert.ok(built.word_families > 300);
  assert.equal(served.word_families.exact + served.word_families.normalised, 0);
  const { familyWordsWithoutCleanSet } = poolAudit();
  for (const term of inflectionTerms.word_families) assert.ok(familyWordsWithoutCleanSet.includes(term), `${term} was served an inflection pair although a clean set exists`);
});
test('Unit 1 Precision Mastery: duplicate/inflection pairs never exceed the audited content debt (they cannot grow)', () => {
  const { precision, wordsWithoutDistinctPair } = poolAudit();
  assert.ok(precision.exact <= 74 && precision.inflection <= 26 && precision.normalised === 0, `pool pairs ${JSON.stringify(precision)}`);
  assert.ok(wordsWithoutDistinctPair.length <= 50);
  const { served, built } = servedAudit({ seeds:10 });
  assert.equal(built.precision_use, 500, 'every word still gets a Precision Mastery task');
  assert.equal(served.precision_use.normalised, 0);
});
expectedFailure({
  rule: 'Within one multi-slot Mastery item the expected answers are meaningfully distinct (no exact duplicate, no trivial inflection)',
  today: 'every Unit 1 word has exactly two authored Precision sentences and they expect the same word (37 words) or two inflections of it (13 words), so 0 words have a distinct pair; Word Families "expansion" offers only expand + expanding',
  turnsGreenWhen: 'each Unit 1 word has at least one authored Precision sentence pair whose expected answers are different words, and every eligible Word Families word has a set of forms with no inflection pair; the generator already prefers them (see the tests above)'
}, 'Unit 1 Precision Mastery pool has a distinct answer pair for every word', () => {
  const { wordsWithoutDistinctPair, familyWordsWithoutCleanSet } = poolAudit();
  assert.deepEqual([...wordsWithoutDistinctPair, ...familyWordsWithoutCleanSet], []);
});
