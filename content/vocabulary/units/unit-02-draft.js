// UNIT 2 – DIGITAL LIFE: authoring skeleton. Source: 0511 key words UNIT 2 (50 targets, coursebook order).
// Every entry is a bare term + part of speech; meanings, sentences and wrong options are still to be authored and reviewed.
// Check: node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-02-draft.js
// Rename to unit-02.js only when ready to publish (the release tooling ignores this draft name).
//
// "afford" is also a Unit 1 target. It has its own id here (idKey 'afford_2' -> vocab_afford_2) so publishing Unit 2 can never overwrite
// Unit 1's vocab_afford row. Its spelling list is the shared lexical one for "afford", aliased below.
import { buildCuratedUnit } from '../build-unit.js';
import { LEXICAL_SPELLING_ERRORS } from '../lexical-spelling-errors.js';

const UNIT_NUMBER = 2;
const status = 'draft';

const e = (term, partOfSpeech, extras = {}) => ({ term, partOfSpeech, ...extras });

const entries = [
  e('entertainment', 'noun'),
  e('access', 'noun'),
  e('device', 'noun'),
  e('digital', 'adjective'),
  e('streaming', 'noun'),
  e('relevant', 'adjective'),
  e('educator', 'noun'),
  e('afford', 'verb', { idKey:'afford_2' }),
  e('essential', 'adjective'),
  e('current affairs', 'noun'),
  e('apparently', 'adverb'),
  e('supposedly', 'adverb'),
  e('celebrity', 'noun'),
  e('informed', 'adjective'),
  e('admit', 'verb'),
  e('communicate', 'verb'),
  e('remotely', 'adverb'),
  e('transform', 'verb'),
  e('percentage', 'noun'),
  e('impression', 'noun'),
  e('remote control', 'noun'),
  e('feature', 'noun'),
  e('function', 'noun'),
  e('interactive', 'adjective'),
  e('widespread', 'adjective'),
  e('availability', 'noun'),
  e('high-performance', 'adjective'),
  e('stabilising', 'adjective'),
  e('multi-task', 'verb'),
  e('predictable', 'adjective'),
  e('professional', 'adjective'),
  e('regional', 'adjective'),
  e('commentary', 'noun'),
  e('educational', 'adjective'),
  e('culture', 'noun'),
  e('genuine', 'adjective'),
  e('amusing', 'adjective'),
  e('competitive', 'adjective'),
  e('critical', 'adjective'),
  e('impressive', 'adjective'),
  e('determination', 'noun'),
  e('overcome', 'verb'),
  e('accessory', 'noun'),
  e('equipment', 'noun'),
  e('fixture', 'noun'),
  e('removable', 'adjective'),
  e('adjustable', 'adjective'),
  e('affordable', 'adjective'),
  e('external', 'adjective'),
  e('concentrate', 'verb'),
];

export default buildCuratedUnit({
  unitNumber:UNIT_NUMBER,
  unitTitle:'Digital Life',
  status,
  source:'0511 key words UNIT 2 – DIGITAL LIFE',
  entries,
  activities:[],
  // One shared list per word: Unit 2's "afford" reuses Unit 1's reviewed misspellings.
  lexicalSpelling:{ ...LEXICAL_SPELLING_ERRORS, vocab_afford_2:LEXICAL_SPELLING_ERRORS.vocab_afford }
});
