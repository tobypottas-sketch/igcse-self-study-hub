// Part 5: typed-answer classification (Locked Decision 4). Cases run against the reference model always, and against
// production once supabase/functions/_shared/vocabulary-typed-answer.js exists.
import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyTypedAnswer, osaDistance } from './support/vocabulary-contract/reference-typed-answer.js';
import { hook, hookLocation } from './support/vocabulary-contract/production-hooks.js';
import { expectedFailure } from './support/vocabulary-contract/xfail.js';

const AVOID = { expected: 'avoided', forms: ['avoid', 'avoids', 'avoiding', 'avoided'], lexicon: ['permit', 'join', 'encourage', 'prefer', 'preference', 'afford'] };
const PREF = { expected: 'preference', forms: ['preferences'], lexicon: ['prefer', 'permission', 'requirement', 'avoid'] };
// [label, params, expected class, semanticallyCorrect, orthographicallyClean, correct]
const CASES = [
  ['avoided → exact', { ...AVOID, typed: 'avoided' }, 'exact', true, true, true],
  ['case and spacing are ignored', { ...AVOID, typed: '  Avoided ' }, 'exact', true, true, true],
  ['one deletion → spelling slip', { ...AVOID, typed: 'avoidd' }, 'spelling_slip', true, false, true],
  ['one insertion → spelling slip', { ...AVOID, typed: 'avoidedd' }, 'spelling_slip', true, false, true],
  ['avoid for avoided → wrong inflection', { ...AVOID, typed: 'avoid' }, 'wrong_inflection', false, true, false],
  ['avoids for avoided → wrong inflection', { ...AVOID, typed: 'avoids' }, 'wrong_inflection', false, true, false],
  ['unrelated word → wrong lexical', { ...AVOID, typed: 'permit' }, 'wrong_lexical', false, true, false],
  ['empty → wrong lexical', { ...AVOID, typed: '' }, 'wrong_lexical', false, false, false],
  ['preference exact', { ...PREF, typed: 'preference' }, 'exact', true, true, true],
  ['preference one-edit typo → slip', { ...PREF, typed: 'prefrence' }, 'spelling_slip', true, false, true],
  ['preference substitution → slip', { ...PREF, typed: 'preferance' }, 'spelling_slip', true, false, true],
  ['preferences → wrong inflection', { ...PREF, typed: 'preferences' }, 'wrong_inflection', false, true, false],
  ['prefer for preference → wrong lexical', { ...PREF, typed: 'prefer' }, 'wrong_lexical', false, true, false],
  ['transposition aviod is ONE edit (Damerau)', { expected: 'avoid', forms: ['avoids', 'avoided', 'avoiding'], lexicon: [], typed: 'aviod' }, 'spelling_slip', true, false, true],
  ['short word: rise/rose is never a slip', { expected: 'rise', forms: [], lexicon: ['rose'], typed: 'rose' }, 'wrong_lexical', false, true, false],
  ['short word: an unlisted one-edit change of a short word is not accepted', { expected: 'deny', forms: [], lexicon: [], typed: 'denu' }, 'wrong_lexical', false, false, false],
  ['explicit forms beat edit distance: admits for admit', { expected: 'admit', forms: ['admits', 'admitted', 'admitting'], lexicon: [], typed: 'admits' }, 'wrong_inflection', false, true, false],
  ['Spelling pathway: exact counts', { ...AVOID, typed: 'avoided', pathwayId: 'spelling_recall' }, 'exact', true, true, true],
  ['Spelling pathway: a slip is incorrect', { ...AVOID, typed: 'avoidd', pathwayId: 'spelling_recall' }, 'spelling_slip', false, false, false],
  ['Spelling pathway: wrong inflection is incorrect', { ...AVOID, typed: 'avoid', pathwayId: 'spelling_recall' }, 'wrong_inflection', false, true, false]
];

function run(fn, label) {
  for (const [name, params, cls, sem, clean, correct] of CASES) {
    const r = fn(params);
    assert.equal(r.class, cls, `${label}: ${name}: class`);
    assert.equal(r.semanticallyCorrect, sem, `${label}: ${name}: semanticallyCorrect`);
    assert.equal(r.orthographicallyClean, clean, `${label}: ${name}: orthographicallyClean`);
    assert.equal(r.correct, correct, `${label}: ${name}: correct`);
  }
}
test('reference classifier satisfies every approved case', () => run(classifyTypedAnswer, 'reference'));
test('edit distance counts a transposition as one edit and rejects two-letter changes', () => {
  assert.equal(osaDistance('aviod', 'avoid'), 1); assert.equal(osaDistance('avoid', 'avoided'), 2); assert.equal(osaDistance('cat', 'cut'), 1);
});
test('wrong inflection keeps the lexical match so evidence can tell a form error from a wrong word', () => {
  assert.equal(classifyTypedAnswer({ ...AVOID, typed: 'avoid' }).lexicalMatch, true);
  assert.equal(classifyTypedAnswer({ ...AVOID, typed: 'permit' }).lexicalMatch, false);
});
test('documented hazard: WITHOUT an explicit forms list a one-edit inflection reads as a slip, so forms must be supplied', () => {
  assert.equal(classifyTypedAnswer({ expected: 'admit', typed: 'admits', forms: [], lexicon: [] }).class, 'spelling_slip');
});
expectedFailure({
  rule: 'Typed answers outside Spelling are classified exact / spelling slip / wrong inflection / wrong lexical (Locked Decision 4)',
  today: `the server marks typed answers by normalised equality only (normalizeVocabularyAnswer), so "aviod" is simply wrong with no class; no module exports ${hookLocation('classifyTypedAnswer')}`,
  turnsGreenWhen: `${hookLocation('classifyTypedAnswer')} is implemented, fed explicit accepted forms (not a heuristic stemmer), and the attempt records the class and the orthographic-clean flag`
}, 'production classifyTypedAnswer satisfies every approved case', async () => {
  const fn = await hook('classifyTypedAnswer');
  assert.equal(typeof fn, 'function', 'classifyTypedAnswer is not exported');
  run(fn, 'production');
});
