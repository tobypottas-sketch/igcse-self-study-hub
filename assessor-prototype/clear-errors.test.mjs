import test from 'node:test';
import assert from 'node:assert/strict';
import { findClearErrors, studentCoach } from './clear-errors.js';
import { addCoaching } from './student-feedback.js';

// The fictional email used in the staging test (no real student).
const STAGING_EMAIL = `Hi Maya,

Thanks for inviting me to the concert, I would love to come! I have never been to a school concert before so I am really exited. Saturday is perfect because I dont have any homework that weekend.

Shall we meet outside the main gate at 6 o'clock? The concert starts at 7, so we will have time to find good seats and maybe buy a drink. If you are late, please text me and I will wait for you near the notice board.

I am going to wear my blue jacket and black jeans, because it will probably be cold in the evening. Whats your plan, are you going to wear your costume from the drama club?

Can't wait to see you there!

Best wishes,
[Name]`;
const quotes = list => list.map(item => item.quote);

test('the staging email now gets two accurate corrections and a concrete next step (not praise only)', () => {
  const coach = studentCoach('email', STAGING_EMAIL);
  assert.deepEqual(coach.improvements.map(i => [i.quote, i.suggestion, i.type]), [['dont', "don't", 'error'], ['Whats', "What's", 'error']]);
  assert.match(coach.improvements[0].advice, /apostrophe.*don't \(do not\)/); assert.match(coach.improvements[1].advice, /What's \(what is\)/);
  assert.match(coach.target, /short forms such as “dont” and “Whats”/);
  assert.ok(!findClearErrors(STAGING_EMAIL).some(f => /exited/.test(f.quote)), 'a real word typed in error (exited) is NOT guessed');
});
test('every finding quotes the student verbatim and carries a worker-written explanation', () => {
  for (const text of [STAGING_EMAIL, 'they was late and he dont care. i think its definately wrong, wich is wierd.', 'We is happy. She have a dog. The the cat sat.']) {
    for (const f of findClearErrors(text)) { assert.ok(text.includes(f.quote), f.quote); assert.ok(f.explanation.length > 10 && f.correction && f.correction !== f.quote); }
  }
});
test('clear agreement, misspelling, capital I and contraction slips are found with correct fixes', () => {
  const found = findClearErrors('They was late. He dont know. We is ready. I think that i can come, and it was definately fun. Im sure youre right.');
  const pairs = found.map(f => f.quote + ' => ' + f.correction);
  for (const expected of ['They was => They were', 'dont => don\'t', 'We is => We are', 'i => I', 'definately => definitely', 'Im => I\'m', 'youre => you\'re']) assert.ok(pairs.includes(expected), expected + ' missing from ' + pairs.join(' | '));
  assert.ok(!pairs.some(p => p.startsWith('He dont')), 'dont is reported once, as a short form');
});
test('SAFEGUARDS: correct English and ambiguous cases are never flagged', () => {
  const clean = ["If I were you, I would go.", 'They were late. We are ready. You were right. He has a dog. She was here. I was there.', "I don't know, can't say, and it isn't mine.", "We'll meet at 5 p.m., i.e. after school.",
    'Its colour is red and the wont of the king was strange. Lets go. Ill come. Hes tall.', 'The news is good. The class was quiet. My family is large.', 'The weather were nice? Exited fans cheered.'];
  for (const text of clean) assert.deepEqual(quotes(findClearErrors(text)), [], text);
});
test('a text with nothing to correct still gets a useful, evidence-based target when one exists, and none when everything is already there', () => {
  const noQuestion = 'Hi Sam,\n\nThanks for your message. I can come on Saturday because I am free all day.\n\nMeet me at the gate at six.\n\nBest wishes,\n[Name]';
  assert.deepEqual(studentCoach('email', noQuestion).improvements, []);
  assert.match(studentCoach('email', noQuestion).target, /ask your friend one question/);
  const complete = 'Hi Sam,\n\nThanks for your message, because I was worried. Are you coming too?\n\nBest wishes,\n[Name]';
  assert.equal(studentCoach('email', complete).target, '');
  assert.match(studentCoach('review', 'The cafe was nice. The cake was good.').target, /because|paragraph|recommendation/);
});
test('a pattern of two or more slips of one kind becomes the target; one slip does not repeat itself as the target', () => {
  assert.match(studentCoach('email', 'Hi Sam,\n\nI dont know and I cant come.\n\nAre you well?\n\nBest wishes,\n[Name]').target, /“dont” and “cant”/);
  const single = studentCoach('email', 'Hi Sam,\n\nI dont know because I am busy.\n\nAre you well?\n\nBest wishes,\n[Name]');
  assert.equal(single.improvements.length, 1); assert.doesNotMatch(single.target, /dont/);
});
test('coaching never duplicates a model point and never overrides a model target', () => {
  const view = { partial: false, strengths: [{ quote: 'a', advice: 'Good.' }], improvements: [{ quote: 'I dont have', advice: 'x', type: 'error', suggestion: "I don't have" }], nextStep: 'Add a detail about the concert.', lengthNotice: null };
  const merged = addCoaching(view, { taskType: 'email', response: STAGING_EMAIL });
  assert.deepEqual(quotes(merged.improvements), ['I dont have', 'Whats']); assert.equal(merged.nextStep, 'Add a detail about the concert.'); assert.equal(merged.strengths.length, 1);
});
test('a model-only strengths result gets coaching; a partial result with coaching is no longer an empty apology', () => {
  const praiseOnly = { partial: false, strengths: [{ quote: 'because it will probably be cold', advice: 'Gives a reason.' }], improvements: [], nextStep: '', lengthNotice: null };
  const out = addCoaching(praiseOnly, { taskType: 'email', response: STAGING_EMAIL });
  assert.equal(out.improvements.length, 2); assert.ok(out.nextStep); assert.equal(out.partial, false);
  const partial = addCoaching({ partial: true, strengths: [], improvements: [], nextStep: '', lengthNotice: null }, { taskType: 'email', response: STAGING_EMAIL });
  assert.equal(partial.partial, false); assert.equal(partial.improvements.length, 2);
  const nothing = addCoaching({ partial: true, strengths: [], improvements: [], nextStep: '', lengthNotice: null }, { taskType: 'email', response: 'Hi Sam,\n\nThanks because Are you coming?\n\nBest wishes,\n[Name]' });
  assert.equal(nothing.partial, true);
});
test('student coaching never mentions marks, bands or teacher-only information', () => {
  const text = JSON.stringify([studentCoach('email', STAGING_EMAIL), studentCoach('review', 'I dont like it. i cant say.'), studentCoach('email', 'x')]);
  assert.doesNotMatch(text, /\b(?:marks?|bands?|scores?|grades?|levels?)\b|contentMark|languageMark/i);
});
