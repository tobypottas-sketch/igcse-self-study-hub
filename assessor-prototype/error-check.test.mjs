// A language error may be shown to a student only when it is demonstrable. Default: NOT demonstrable. Every sentence here is fictional.
import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmCorrection } from './error-check.js';

const yes = [
  ['agreement, plural noun', 'the chips was cold', 'the chips were cold'],
  ['agreement after they', 'they was late', 'they were late'],
  ['agreement with he', 'he were late', 'he was late'],
  ['agreement, plural noun with is', 'the exhibits is great', 'the exhibits are great'],
  ['known misspelling', 'we recieve the food', 'we receive the food'],
  ['known misspelling, other word', 'it was definately good', 'it was definitely good'],
  ['capital I', 'and i was happy', 'and I was happy'],
  ['wrong a/an', 'It was a interesting place', 'It was an interesting place'],
  ['repeated function word', 'the the food', 'the food']
];
const no = [
  // the false error that started this work and its close variants
  ['a noun replaced by a pronoun', 'the kitchen should serve hot food', 'they should serve hot food'],
  ['singular made plural', 'the kitchen should serve hot food', 'the kitchens should serve hot food'],
  ['verb form changed', 'the kitchen should serve hot food', 'the kitchen should served hot food'],
  ['a capital added in mid-sentence', 'the kitchen should serve hot food', 'The kitchen should serve hot food', 'but the kitchen should serve hot food'],
  ['an article added before an adjective', 'serve hot food', 'serve a hot food'],
  // word choice, spelling variants and look-alike words
  ['synonym swap', 'a big dog', 'a large dog'], ['a different word two letters away', 'I like it', 'I love it'], ['an added content word', 'the food', 'the hot food'],
  ['British to American spelling', 'the colour red', 'the color red'], ['practise/practice', 'I practise daily', 'I practice daily'], ['regional variant', 'she learned a lot', 'she learnt a lot'],
  ['quite/quiet', 'it was quite', 'it was quiet'], ['bought/brought', 'I bought it', 'I brought it'], ['dessert/desert', 'a sweet dessert', 'a sweet desert'],
  ['verb ending', 'I enjoy it', 'I enjoys it'], ['plural noun', 'the waiter smiled', 'the waiters smiled'],
  // agreement that only looks like an error
  ['wrong direction', 'the sofa is comfortable', 'the sofa are comfortable'], ['I am', 'I am happy', 'I are happy'],
  ['collective noun', 'The staff was kind', 'The staff were kind'], ['collective noun, other way', 'the staff were friendly', 'the staff was friendly'],
  ['-s word that is singular', 'The news is bad', 'The news are bad'], ['maths', 'maths is fun', 'maths are fun'], ['a name ending in s', 'We think James was late', 'We think James were late'],
  ['of-phrase', 'one of the rooms was big', 'one of the rooms were big'], ['number of', 'the number of students is high', 'the number of students are high'],
  ['and-phrase', 'fish and chips is popular', 'fish and chips are popular'], ['measure phrase', 'two hours is enough', 'two hours are enough'],
  ['subjunctive', 'if he were rich', 'if he was rich'], ['there is', 'there is many shops', 'there are many shops'], ['the police', 'the police is here', 'the police are here'],
  // articles and sounds
  ['an hour', 'It took an hour', 'It took a hour'], ['a university', 'She joined a university', 'She joined an university'], ['an MP', 'an MP spoke', 'a MP spoke'],
  ['an article added', 'cats need less than dogs', 'cats need less than the dogs'], ['uncountable', 'I like music', 'I like a music'], ['zero article', 'we go to school', 'we go to a school'],
  // punctuation and capitals are not shown as errors
  ['optional comma', 'the food was good so we left', 'the food was good, so we left'], ['greeting comma', 'Hello Sam', 'Hello, Sam'], ['full stop to exclamation', 'it was good.', 'it was good!'],
  ['capital for a season', 'in spring', 'in Spring'], ['capital removed', 'the Internet', 'the internet'], ['brand', 'iPhone', 'IPhone'],
  // repeated words that are correct
  ['had had', 'she had had enough', 'she had enough'], ['that that', 'I know that that is true', 'I know that is true'], ['very very', 'it was very very good', 'it was very good'],
  // tense is a teacher decision
  ['tense', 'I go there', 'I went there', 'I go there yesterday.'], ['tense marker then', 'Then I go there', 'Then I went there'],
  ['nothing changed', 'the chips were cold', 'the chips were cold'], ['rewritten phrase', 'I recommend visiting with friends', 'I suggest you visit with your friends'],
  ['verb at the start of the quote: subject unknown', 'was cold', 'were cold'],
  // review round 2: correct English that a loose subject guess would 'correct'
  ['irregular plural', 'the children were tired', 'the children was tired'], ['irregular plural with have', 'the children have lunch', 'the children has lunch'], ['men', 'the men were late', 'the men was late'],
  ['adverb before the verb', 'the chips quickly were eaten', 'the chips quickly was eaten'], ['question word', 'where are the books', 'where is the books'], ['why do', 'why do the students leave', 'why does the students leave'],
  ['gerund subject', 'Reading books is fun', 'Reading books are fun'], ['what-clause', 'what she wants is a car', 'what she wants are a car'], ['prepositional phrase', 'the box on the shelves was empty', 'the box on the shelves were empty'],
  ['about-phrase', 'the book about animals is good', 'the book about animals are good'], ['one of, far from the verb', 'One of the really interesting old books is', 'One of the really interesting old books are'],
  ['relative clause', 'the girl who always likes playful cats is', 'the girl who always likes playful cats are'], ['unlisted number', 'fifty dollars is a lot', 'fifty dollars are a lot'],
  ['singular s word', 'the canvas is dry', 'the canvas are dry'], ['singular -ics', 'statistics is hard', 'statistics are hard'], ['singular noun made plural verb', 'the museum was crowded', 'the museum were crowded'],
  ['subjunctive from the surrounding text', 'she were here', 'she was here', 'I wish she were here.'], ['as it were', 'it were', 'it was', 'It was, as it were, a dream.'],
  ['gave her her book', 'I gave her her book', 'I gave her book'], ['told you you', 'I told you you were right', 'I told you were right'], ['is is', 'what it is is a problem', 'what it is a problem'], ['on on', 'the lights went on on Friday', 'the lights went on Friday'],
  ['abbreviation is not a sentence end', 'the park', 'The park', 'Bring snacks, e.g. the park'], ['ellipsis', 'and then', 'And then', 'I waited... and then'], ['quoted speech', 'and ran away', 'And ran away', 'She shouted "Stop!" and ran away'],
  ['a unanimous', 'a unanimous vote', 'an unanimous vote'], ['a ukulele', 'a ukulele', 'an ukulele'], ['letter name', 'an s', 'a s'], ['an herb', 'an herb', 'a herb'], ['an historic', 'an historic day', 'a historic day'],
  ['sentence-start casing kept', 'Recieve the food', 'receive the food'], ['mid-sentence capital via spelling fix', 'we go wich way', 'we go Which way'], ['capital A', 'A apple fell', 'an apple fell'],
  ['august', 'an august school', 'an August school'], ['roman numeral', 'part i of the book', 'part I of the book']
];
for (const [name, quote, correction] of yes) test('demonstrable: ' + name, () => assert.equal(confirmCorrection(quote, correction).confirmed, true));
for (const [name, quote, correction, context] of no) test('not demonstrable: ' + name, () => assert.equal(confirmCorrection(quote, correction, context).confirmed, false));

test('a sentence that begins with a lower-case letter, and days and months', () => {
  assert.equal(confirmCorrection('hello world', 'Hello world', 'I said so. hello world').confirmed, true);
  assert.equal(confirmCorrection('hello world', 'Hello world', 'I said hello world').confirmed, false); // not at a sentence start
  assert.equal(confirmCorrection('we meet on monday', 'we meet on Monday').confirmed, true);
});

test('each confirmed error is explained in plain English that names the actual words', () => {
  const say = (quote, correction, context = '') => confirmCorrection(quote, correction, context).explanation;
  assert.equal(say('the chips was cold', 'the chips were cold'), 'Chips is plural, so use were, not was.');
  assert.equal(say('they was late', 'they were late'), 'After they, use were, not was.');
  assert.equal(say('and i was happy', 'and I was happy'), 'The word I is always written as a capital letter.');
  assert.equal(say('we recieve the food', 'we receive the food'), 'The correct spelling is receive, not recieve.');
  assert.equal(say('It was a interesting place', 'It was an interesting place'), 'Use an before a word that starts with a vowel sound, like interesting.');
  assert.equal(say('the the food', 'the food'), 'The is repeated; use it only once.');
  assert.equal(say('hello world', 'Hello world', 'I said so. hello world'), 'A sentence begins with a capital letter.');
  assert.ok(!/subject|verb agreement|grammar/i.test(say('the chips was cold', 'the chips were cold')), 'no unexplained jargon');
});

test('odd and very long input is handled safely and quickly', () => {
  assert.equal(confirmCorrection(null, undefined).confirmed, false);
  assert.equal(confirmCorrection('​', 'a').confirmed, false);
  const long = Array.from({ length:5000 }, (_, i) => 'w' + i).join(' ');
  const started = Date.now(); assert.equal(confirmCorrection(long, long + ' x').confirmed, false); assert.ok(Date.now() - started < 200);
});
