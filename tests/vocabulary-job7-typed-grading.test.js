// Job 7, Part 6: typed-answer grading audit. Grading must not become generous: only the SAME characters typed differently are folded
// (case, outer/trailing spacing and punctuation, Unicode hyphens and apostrophes). Anything that changes a letter, a word boundary or a
// word form is still wrong. Spelling stays exact. The five-class classifier is deferred (see JOB7 report, class C).
import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeVocabularyAnswer as n } from '../supabase/functions/_shared/vocabulary-engine.js';
import { bank } from './support/vocabulary-contract/bank.js';

const same = (a, b) => assert.equal(n(a), n(b), `${JSON.stringify(a)} should read as ${JSON.stringify(b)}`);
const differ = (a, b) => assert.notEqual(n(a), n(b), `${JSON.stringify(a)} must NOT read as ${JSON.stringify(b)}`);

test('folded: capitalisation, outer whitespace, repeated spaces, trailing . ! ? , ; :', () => {
  same('Avoid', 'avoid'); same('  avoid  ', 'avoid'); same('AVOID', 'avoid'); same('leisure   time', 'leisure time'); same('avoid.', 'avoid'); same('avoid!?', 'avoid');
  same('a wide selection', 'a wide selection');                       // non-breaking space (NFKC)
});
test('folded: the same hyphen / apostrophe typed as a Unicode variant', () => {
  for (const dash of ['‐', '‑', '‒', '–', '—', '―', '−']) same(`goal${dash}oriented`, 'goal-oriented');
  same('don’t', "don't"); same('don‘t', "don't"); same('donʼt', "don't");
});
test('NOT folded (grading stays strict): a missing hyphen, a changed word boundary, plural, inflection, British/US spelling, a one-letter slip, internal punctuation', () => {
  differ('goal oriented', 'goal-oriented'); differ('goaloriented', 'goal-oriented');
  differ('avoids', 'avoid'); differ('avoided', 'avoid'); differ('preferences', 'preference');
  differ('favor', 'favour'); differ('organize', 'organise');
  differ('aviod', 'avoid'); differ('avoidd', 'avoid'); differ('admited', 'admitted');
  differ('leisure, time', 'leisure time'); differ('leisure-time', 'leisure time');
  differ('permit', 'avoid'); differ('', 'avoid');
});
test('bank audit: every accepted typed answer in the live Unit 1 bank is its own normal form (no answer is silently unreachable)', () => {
  const answers = new Set();
  for (const q of bank().questions) if (['typed', 'text'].includes(q.responseMode)) for (const a of q.answers) answers.add(a);
  assert.ok(answers.size > 50);
  for (const a of answers) assert.equal(n(a), n(n(a)), `normalisation is idempotent for ${a}`);
});
test('Unit 1 hyphenated answers can be typed with any Unicode hyphen', () => {
  const hyphenated = new Set();
  for (const q of bank().questions) for (const a of q.answers) if (/-/.test(a)) hyphenated.add(a);
  assert.ok(hyphenated.has('goal-oriented'));
  for (const a of hyphenated) same(a.replace(/-/g, '‑'), a);
});
