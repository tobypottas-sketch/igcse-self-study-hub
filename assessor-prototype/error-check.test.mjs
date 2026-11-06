// A language error may be shown to a student only when it is demonstrable. Every case here is fictional.
import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmCorrection } from './error-check.js';

const yes = [
  ['subject–verb agreement, plural noun', 'the chips was cold', 'the chips were cold'],
  ['agreement, singular noun', 'the museum were crowded', 'the museum was crowded'],
  ['agreement after a pronoun', 'they was late', 'they were late'],
  ['agreement with these', 'these exhibits is amazing', 'these exhibits are amazing'],
  ['spelling, one letter', 'definately good', 'definitely good'],
  ['spelling, swapped letters', 'we recieve the food', 'we receive the food'],
  ['capital I', 'and i was happy', 'and I was happy'],
  ['capital at the start of a name', 'we visited london', 'we visited London'],
  ['missing comma', 'Dear Sir', 'Dear Sir,'],
  ['repeated word', 'the the food', 'the food'],
  ['missing a before a singular noun', 'I bought apple', 'I bought an apple'],
  ['wrong a/an', 'It was a interesting place', 'It was an interesting place'],
  ['much/many with a plural noun', 'much peoples', 'many people']
];
const no = [
  ['the false error that triggered this work: a noun replaced by a pronoun', 'the kitchen should serve hot food', 'they should serve hot food'],
  ['synonym swap', 'a big dog', 'a large dog'],
  ['an added content word', 'the food', 'the hot food'],
  ['a removed content word', 'it was a nice place', 'it was nice'],
  ['a different word two letters away', 'I like it', 'I love it'],
  ['a correction that makes correct English wrong', 'the sofa is comfortable', 'the sofa are comfortable'],
  ['a collective noun left to the teacher', 'The staff was kind', 'The staff were kind'],
  ['an article added where English may omit it', 'cats need less attention than dogs', 'cats need less attention than the dogs'],
  ['an article added to an uncountable noun', 'I like music', 'I like a music'],
  ['a regional spelling variant', 'she learned a lot', 'she learnt a lot'],
  ['a rewritten phrase', 'I recommend visiting with friends', 'I suggest you visit with your friends'],
  ['no change at all', 'the chips were cold', 'the chips were cold']
];
for (const [name, quote, correction] of yes) test('demonstrable: ' + name, () => assert.equal(confirmCorrection(quote, correction).confirmed, true));
for (const [name, quote, correction] of no) test('not demonstrable: ' + name, () => assert.equal(confirmCorrection(quote, correction).confirmed, false));

test('a tense change is demonstrable only with a matching time marker in the same sentence', () => {
  assert.equal(confirmCorrection('I go there', 'I went there', 'I go there yesterday.').confirmed, true);
  assert.equal(confirmCorrection('She went to school', 'She goes to school', 'She went to school every day.').confirmed, true);
  assert.equal(confirmCorrection('I go there', 'I went there', 'I go there.').confirmed, false);
  assert.equal(confirmCorrection('I go there', 'I went there', 'Last year was fun. I go there.').confirmed, false); // marker belongs to another sentence
});

test('the changed words are reported so the explanation can be checked against them', () => {
  assert.deepEqual(confirmCorrection('the chips was cold', 'the chips were cold').newWords, ['were']);
  assert.deepEqual(confirmCorrection('Dear Sir', 'Dear Sir,').newWords, []);
});

test('each confirmed error is explained in plain English that names the actual words', () => {
  const say = (quote, correction, context = '') => confirmCorrection(quote, correction, context).explanation;
  assert.equal(say('the chips was cold', 'the chips were cold'), 'Chips is plural, so use were, not was.');
  assert.equal(say('The museum were crowded', 'The museum was crowded'), 'Museum is singular, so use was, not were.');
  assert.equal(say('and i was happy', 'and I was happy'), 'The word I is always written as a capital letter.');
  assert.equal(say('we recieve the food', 'we receive the food'), 'The correct spelling is receive, not recieve.');
  assert.equal(say('It was a interesting place', 'It was an interesting place'), 'Use an before a word that starts with a vowel sound, like interesting.');
  assert.equal(say('the the food', 'the food'), 'The is repeated; use it only once.');
  assert.equal(say('Dear Sir', 'Dear Sir,'), 'Add a comma here.');
  assert.equal(say('I go there', 'I went there', 'I go there yesterday.'), 'Yesterday shows this happened in the past, so use went, not go.');
  assert.ok(!/subject|verb agreement|grammar/i.test(say('the chips was cold', 'the chips were cold')), 'no unexplained jargon');
});

test('"an hour" and "a university" are not turned into errors', () => {
  assert.equal(confirmCorrection('It took an hour', 'It took a hour').confirmed, false);
  assert.equal(confirmCorrection('She joined a university', 'She joined an university').confirmed, false);
});
