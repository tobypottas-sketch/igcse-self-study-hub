import { markCuratedAnswer } from '../../supabase/functions/_shared/vocabulary-engine.js';

// Deterministic generation-time guard: a typed/free-response vocabulary question must never show the
// student an answer that the marker would accept. This module only inspects a built activity; it never
// changes marking, evidence or progression.

export const TYPED_RESPONSE_MODES = Object.freeze(new Set(['text','spelling','slots']));
// Student-visible text fields on built activities. Option lists, tiles and ids are deliberately excluded.
const VISIBLE_FIELDS = Object.freeze(['prompt','sourceText','sourcePhrase','sourceIdea','matchCue','cue','hint','clue','exampleText','gloss']);
const MAX_WINDOW_WORDS = 10;

function text(value) { return String(value ?? '').trim(); }
function array(value) { return Array.isArray(value) ? value : []; }

// Case-insensitive; accents, hyphens, apostrophes, quotes and other punctuation never bypass the guard.
export function normalizeForLeak(value) {
  return text(value)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g,'')
    .toLocaleLowerCase('en')
    .replace(/[’‘`´]/g,"'")
    .replace(/'/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}

export function isTypedActivity(activity) { return TYPED_RESPONSE_MODES.has(String(activity?.responseMode ?? '')); }

function senseOf(item, occurrence) {
  const senses = array(item?.senses);
  return senses.find(sense => sense?.senseId === occurrence?.senseId) ?? senses[0] ?? {};
}

// Everything the live marker would accept for this activity, discovered through the marker itself so
// the guard cannot drift from marking: if the marker takes curated paraphrases for this question type
// (for example Recall the Word), those paraphrases count as answers the student must not be shown.
export function acceptedAnswersForActivity(activity, sense = {}) {
  const accepted = array(activity?.markingReference?.acceptedAnswers).map(text).filter(Boolean);
  const paraphrases = array(sense?.acceptedParaphrases).map(text).filter(Boolean);
  const scopedContextId = activity?.contextId ?? activity?.contentId ?? null;
  const scoped = array(sense?.contextDependentParaphrases)
    .filter(row => row?.contextId === scopedContextId)
    .flatMap(row => array(row?.answers).map(text).filter(Boolean));
  const probes = [...paraphrases, ...scoped];
  if (!probes.length) return accepted;
  const markerAccepts = probe => {
    try {
      return markCuratedAnswer({
        item:{},
        sense,
        context:{ contextId:scopedContextId, acceptedAnswers:[] },
        questionType:activity?.type,
        rawAnswer:probe
      }).correct === true;
    } catch { return false; }
  };
  return [...accepted, ...probes.filter(markerAccepts)];
}

function visibleTexts(activity) {
  const rows = VISIBLE_FIELDS.map(field => [field,text(activity?.[field])]).filter(([,value]) => value);
  for (const [index,slot] of array(activity?.slots).entries()) {
    for (const field of ['label','sourceText']) { const value = text(slot?.[field]); if (value) rows.push([`slots[${index}].${field}`,value]); }
  }
  return rows;
}

// Returns null when safe, otherwise { field, answer } describing the first visible field that shows an
// accepted answer verbatim (as a whole word or phrase, ignoring case and punctuation).
export function findAnswerLeak(activity, { item = null, occurrence = null, sense = null } = {}) {
  if (!isTypedActivity(activity)) return null;
  const resolvedSense = sense ?? senseOf(item,occurrence ?? { senseId:activity?.senseId });
  const answers = [...new Set(acceptedAnswersForActivity(activity,resolvedSense).map(normalizeForLeak).filter(Boolean))];
  if (!answers.length) return null;
  const answerSet = new Set(answers);
  const widest = Math.max(MAX_WINDOW_WORDS,...answers.map(answer => answer.split(' ').length));
  for (const [field,value] of visibleTexts(activity)) {
    const words = normalizeForLeak(value).split(' ').filter(Boolean);
    for (let start = 0; start < words.length; start += 1) {
      for (let size = 1; size <= widest && start + size <= words.length; size += 1) {
        const window = words.slice(start,start + size).join(' ');
        if (answerSet.has(window)) return { field, answer:window };
      }
    }
  }
  return null;
}

export class AnswerLeakError extends Error {
  constructor(activityType, leak) {
    super(`Refusing to serve ${activityType}: the answer “${leak?.answer}” is visible in ${leak?.field}.`);
    this.name = 'AnswerLeakError';
    this.activityType = activityType;
    this.leak = leak;
  }
}

export function assertNoAnswerLeak(activity, context = {}) {
  const leak = findAnswerLeak(activity,context);
  if (leak) throw new AnswerLeakError(activity?.type,leak);
  return activity;
}

function escapeRegExp(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

// Regeneration helper for instruction lines that name the headword when the headword is also the answer
// (for example “Use the correct form from the avoid word family” with the answer “avoid”). The instruction
// is rewritten around another member of the same family, so the student still gets a stem word, just not
// the answer. Returns the original text when nothing safe can be substituted.
export function reframeInstructionAroundAnswer(instruction, { answers = [], alternatives = [] } = {}) {
  const line = text(instruction);
  const answerKeys = new Set(array(answers).map(normalizeForLeak).filter(Boolean));
  if (!line || !answerKeys.size) return line;
  const leaking = [...answerKeys].filter(answer => normalizeForLeak(line).split(' ').join(' ').includes(answer) && new RegExp(`(?<![A-Za-z])${escapeRegExp(answer)}(?![A-Za-z])`,'i').test(line));
  if (!leaking.length) return line;
  const replacement = array(alternatives).map(text).filter(Boolean).find(candidate => !answerKeys.has(normalizeForLeak(candidate)));
  if (!replacement) return line;
  let output = line;
  for (const answer of leaking) output = output.replace(new RegExp(`(?<![A-Za-z])${escapeRegExp(answer)}(?![A-Za-z])`,'gi'),replacement);
  return output;
}
