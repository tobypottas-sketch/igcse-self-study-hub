import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalStudentNumber, deriveHubNumber, buildMatchResults } from '../supabase/functions/eh-match/match.js';

const PARITY = [
  ['001234', '1234'], ['1234', '1234'], [1234, '1234'], [' 1234 ', '1234'], ['000123', '123'], ['123456', '123456'],
  ['0012', null], ['000', null], ['0', null], ['', null], ['   ', null], ['1234567', null],
  ['12 34', null], ['12-34', null], ['12.0', null], ['+1234', null], ['1234a', null], ['１２３４', null],
  [null, null], [undefined, null], [{}, null], [[], null], [NaN, null], [12.5, null], [-1234, null]
];

const EMAILS = [
  ['001234@school.example', '1234'], ['001234@SCHOOL.example', '1234'],
  ['a1234@x.example', null], ['001234.x@x.example', null], ['001234', null], ['001234@@x', null],
  ['@x.example', null], ['', null], [null, null]
];

const U = n => `00000000-0000-4000-8000-0000000000${String(n).padStart(2, '0')}`;
const P = (n, email, name = 'Fake Name') => ({ id: U(n), display_name: name, school_email: email });

test('canonicalStudentNumber matches the shared parity table', () => {
  for (const [input, expected] of PARITY) assert.equal(canonicalStudentNumber(input), expected, String(input));
});

test('canonicalStudentNumber rejects non-ASCII digits and non-string types', () => {
  assert.equal(canonicalStudentNumber('١٢٣٤'), null);
  assert.equal(canonicalStudentNumber(true), null);
  assert.equal(canonicalStudentNumber(1234n), null);
});

test('deriveHubNumber matches the email fixtures', () => {
  for (const [input, expected] of EMAILS) assert.equal(deriveHubNumber(input), expected, String(input));
});

test('buildMatchResults returns one candidate for an exact normalised match', () => {
  const out = buildMatchResults(['1234'], [P(1, '001234@school.example', 'A')]);
  assert.deepEqual(out, { 1234: [{ profileId: U(1), displayName: 'A' }] });
});

test('buildMatchResults pads leading zeros consistently (001234 and 1234 resolve together)', () => {
  const out = buildMatchResults(['1234'], [P(1, '001234@s.example'), P(2, '1234@s.example')]);
  assert.equal(out['1234'].length, 2);
});

test('buildMatchResults returns an empty array for an unknown number', () => {
  assert.deepEqual(buildMatchResults(['9999'], [P(1, '001234@s.example')]), { 9999: [] });
});

test('buildMatchResults returns every duplicate candidate so EH can mark ambiguity', () => {
  const out = buildMatchResults(['1234'], [P(2, '001234@s.example'), P(1, '01234@s.example')]);
  assert.deepEqual(out['1234'].map(c => c.profileId), [U(1), U(2)]);
});

test('buildMatchResults caps candidates at 5 and sorts by profileId', () => {
  const profiles = [];
  for (let i = 9; i >= 1; i -= 1) profiles.push(P(i, '001234@s.example'));
  const ids = buildMatchResults(['1234'], profiles)['1234'].map(c => c.profileId);
  assert.equal(ids.length, 5);
  assert.deepEqual(ids, [...ids].sort());
});

test('buildMatchResults skips profiles with malformed or non-numeric emails without throwing', () => {
  const out = buildMatchResults(['1234'], [P(1, 'nope'), P(2, null), P(3, 'abc@x.example'), P(4, '001234@s.example')]);
  assert.equal(out['1234'].length, 1);
});

test('buildMatchResults output objects have exactly the keys profileId and displayName', () => {
  const out = buildMatchResults(['1234'], [P(1, '001234@s.example')]);
  assert.deepEqual(Object.keys(out['1234'][0]).sort(), ['displayName', 'profileId']);
  assert.ok(!JSON.stringify(out).includes('@'));
});

test('buildMatchResults never reads display_name to decide a match', () => {
  const a = buildMatchResults(['1234', '5678'], [P(1, '001234@s.example', 'X'), P(2, '005678@s.example', 'Y')]);
  const b = buildMatchResults(['1234', '5678'], [P(1, '001234@s.example', 'Y'), P(2, '005678@s.example', 'X')]);
  assert.deepEqual(Object.keys(a), Object.keys(b));
  assert.deepEqual(Object.values(a).map(v => v.map(c => c.profileId)), Object.values(b).map(v => v.map(c => c.profileId)));
});
