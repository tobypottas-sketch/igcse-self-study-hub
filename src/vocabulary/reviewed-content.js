// Reviewed (teacher-authored) wrong options for Vocabulary Builder questions, read from the unit's own published data, with
// structural validation. A record only counts as reviewed if it is well formed; a malformed record is reported, never trusted.
//
// Where the data lives (all inside the existing `senses` JSONB, no schema change):
//   sense.situationDistractors  "Which situation fits?" wrong options, with the sense they are near-misses of
//   sense.gapDistractors        [{ contextId, answer, wrong:[...] }] keyed by the stable id of the blanked sentence
//   sense.spellingErrors        reviewed misspellings (lexical: the same list serves every unit that contains the word)
//
// TEMPORARY COMPATIBILITY (removed in the follow-up PR once Unit 1 is republished): a Unit 1 word whose published data does not
// carry the new fields yet falls back to the old engine tables. The fallback is gated on the occurrence being in Unit 1, so it can
// never reach another unit, even for a word with the same text.
import { SITUATION_DISTRACTORS } from './situation-distractors.js';
import { GAPFILL_DISTRACTORS } from './gapfill-distractors.js';
import { LEXICAL_SPELLING_ERRORS } from '../../content/vocabulary/lexical-spelling-errors.js';

export const DISTRACTOR_SOURCE = Object.freeze({
  REVIEWED:'reviewed',
  GENERATED_SAFE:'generated_safe',
  GENERATED_SEMANTIC:'generated_semantic'
});

// Thrown by a builder asked to use reviewed content only, when the word has none that is well formed.
export class UnreviewedContentError extends Error {
  constructor(kind, detail = '') {
    super(`Reviewed ${kind} content is required${detail ? `: ${detail}` : '.'}`);
    this.name = 'UnreviewedContentError';
    this.kind = kind;
  }
}

const MINIMUM_WRONG = 3;
function array(value) { return Array.isArray(value) ? value : []; }
function text(value) { return String(value ?? '').trim(); }
function lower(value) { return text(value).toLocaleLowerCase('en'); }

function unitNumberOf(occurrence = {}) {
  return Number(occurrence?.unitNumber ?? occurrence?.unit_number ?? 0);
}
// Compatibility is for the published Unit 1 only.
function isUnitOne(occurrence) { return unitNumberOf(occurrence) === 1; }

export function senseOf(item = {}, occurrence = {}) {
  const senses = array(item?.senses);
  return senses.find(sense => sense?.senseId && sense.senseId === occurrence?.senseId) ?? senses[0] ?? {};
}

// Basic structural check for a list of wrong options. Returns the cleaned values plus every problem found.
export function checkWrongOptions(raw, { answer = '', term = '', forbidTerm = false, minimum = MINIMUM_WRONG } = {}) {
  const problems = [];
  if (!Array.isArray(raw)) return { values:[], problems:['wrong options are not a list'] };
  const values = [];
  const seen = new Set();
  const answerKey = lower(answer);
  const termKey = lower(term);
  raw.forEach((entry, index) => {
    if (typeof entry !== 'string') { problems.push(`option ${index + 1} is not text`); return; }
    const value = text(entry);
    if (!value) { problems.push(`option ${index + 1} is empty`); return; }
    const key = lower(value);
    if (answerKey && key === answerKey) { problems.push(`option "${value}" is the correct answer`); return; }
    if (seen.has(key)) { problems.push(`option "${value}" is repeated`); return; }
    if (forbidTerm && termKey && key.includes(termKey)) { problems.push(`option "${value}" shows the target word`); return; }
    seen.add(key);
    values.push(value);
  });
  if (values.length < minimum) problems.push(`only ${values.length} usable option${values.length === 1 ? '' : 's'} (need ${minimum})`);
  return { values, problems };
}

// ---- Which situation fits -------------------------------------------------------------------------------------------------
// status: 'absent' (nothing authored), 'valid', or 'malformed' (authored but not trustworthy).
export function situationDistractorRecord({ item, occurrence } = {}) {
  const sense = senseOf(item, occurrence);
  let raw = sense?.situationDistractors;
  let source = 'unit';
  if (raw === undefined && isUnitOne(occurrence)) {
    raw = SITUATION_DISTRACTORS[lower(item?.term)];
    source = 'compat';
  }
  if (raw === undefined || raw === null) return { status:'absent', source:null, values:[], problems:[] };
  const { values, problems } = checkWrongOptions(raw, { term:item?.term, forbidTerm:true });
  return { status:problems.length ? 'malformed' : 'valid', source, values, problems };
}

// ---- Gap-fill ------------------------------------------------------------------------------------------------------------
// `candidates` are the blankable sentences for this occurrence ({ context, sourceText, answer }). The index says, per sentence,
// whether it has a well-formed reviewed row; every row that is malformed or points at nothing is listed in `problems`.
export function gapDistractorIndex({ item, occurrence, contexts = [], candidates = [] } = {}) {
  const sense = senseOf(item, occurrence);
  let rows = sense?.gapDistractors;
  let source = 'unit';
  if (rows === undefined && isUnitOne(occurrence)) {
    source = 'compat';
    rows = candidates
      .map(candidate => {
        const wrong = GAPFILL_DISTRACTORS[`${candidate.sourceText} => ${candidate.answer}`];
        return wrong ? { contextId:candidate.context?.contextId, answer:candidate.answer, wrong } : null;
      })
      .filter(Boolean);
  }
  const byContextId = new Map();
  const problems = [];
  if (rows === undefined || rows === null) return { source:null, byContextId, problems, present:false };
  if (!Array.isArray(rows)) return { source, byContextId, problems:[{ contextId:null, problem:'gap distractors are not a list' }], present:true };

  const ownContextIds = new Set([...array(occurrence?.contextIds), ...array(contexts).map(context => context?.contextId)].filter(Boolean).map(String));
  const candidateById = new Map(candidates.map(candidate => [String(candidate.context?.contextId), candidate]));
  const seen = new Set();
  for (const row of rows) {
    const contextId = text(row?.contextId);
    if (!contextId) { problems.push({ contextId:null, problem:'a reviewed row has no contextId' }); continue; }
    if (seen.has(contextId)) { problems.push({ contextId, problem:'more than one reviewed row for the same sentence' }); byContextId.delete(contextId); continue; }
    seen.add(contextId);
    if (!ownContextIds.has(contextId)) { problems.push({ contextId, problem:'contextId does not belong to this word' }); continue; }
    const candidate = candidateById.get(contextId);
    if (!candidate) { problems.push({ contextId, problem:'sentence cannot be blanked' }); continue; }
    if (lower(row?.answer) !== lower(candidate.answer) || !text(row?.answer)) { problems.push({ contextId, problem:`answer "${text(row?.answer)}" does not match the blanked answer "${candidate.answer}"` }); continue; }
    const checked = checkWrongOptions(row?.wrong, { answer:candidate.answer });
    if (checked.problems.length) { problems.push({ contextId, problem:checked.problems.join('; ') }); continue; }
    byContextId.set(contextId, checked.values);
  }
  return { source, byContextId, problems, present:true };
}

// ---- Authored wrong meanings (sense.misleadingDistractors) -------------------------------------------------------------------
export function curatedMeaningOptions(sense, correct) {
  const { values } = checkWrongOptions(array(sense?.misleadingDistractors).filter(value => typeof value === 'string'), { answer:correct, minimum:0 });
  return values;
}

// ---- Spelling (lexical) ---------------------------------------------------------------------------------------------------
// Reviewed misspellings belong to the word, not to a unit. They are read from the word's published data; until Unit 1 is
// republished the lexical list shipped with the engine fills in.
export function reviewedSpellingErrors(item = {}) {
  const fromData = [...array(item?.spellingErrors), ...array(item?.senses).flatMap(sense => array(sense?.spellingErrors))];
  const source = fromData.length ? fromData : array(LEXICAL_SPELLING_ERRORS[item?.vocabularyId]);
  return checkWrongOptions(source, { answer:item?.term, minimum:0 }).values;
}
