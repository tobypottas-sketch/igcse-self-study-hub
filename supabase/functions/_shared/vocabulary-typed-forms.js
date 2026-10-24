// Surface-form and multi-slot helpers shared by the browser builders and the Edge Function marker, so a typed Mastery
// task is built and marked from the SAME derivation. Nothing here is a heuristic stemmer: a target's accepted surface forms are
// the headword plus the explicit `grammarForms` authored on the sense. No form is invented.
import { encodeSlotAnswer, decodeSlotAnswer, markSlotAnswer } from './vocabulary-engine.js';

function text(value) { return String(value ?? '').trim(); }
function array(value) { return Array.isArray(value) ? value : []; }
function escapeRegExp(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

const GRAMMAR_KEYS = Object.freeze(['thirdPerson','past','pastParticiple','ing','base']);

// Explicit surface forms of a target, longest first (so "struggling" is preferred to "struggle" when both could match).
export function explicitSurfaceForms(item, sense = {}) {
  const forms = [];
  const seen = new Set();
  const push = value => {
    const form = text(value);
    const key = form.toLocaleLowerCase('en');
    if (!form || seen.has(key)) return;
    seen.add(key); forms.push(form);
  };
  const grammar = sense?.grammarForms && typeof sense.grammarForms === 'object' ? sense.grammarForms : {};
  for (const key of GRAMMAR_KEYS) push(grammar[key]);
  push(item?.term);
  return forms.sort((a, b) => b.length - a.length);
}

export function wholeWordMatches(source, candidate) {
  const out = [];
  const re = new RegExp(`(^|[^A-Za-z])(${escapeRegExp(candidate)})(?=$|[^A-Za-z])`, 'gi');
  let match;
  while ((match = re.exec(source)) !== null) {
    out.push({ index: match.index + match[1].length, surface: match[2] });
    if (match.index === re.lastIndex) re.lastIndex += 1;
  }
  return out;
}

// Finds the one place a target appears in a curated sentence. Returns null unless the target appears exactly once, not at the very
// start of the sentence (a capital would give the blank away), and no other explicit form of the target survives elsewhere.
export function blankTargetInSentence(sentence, item, sense = {}) {
  const source = text(sentence);
  if (!source) return null;
  const forms = explicitSurfaceForms(item, sense);
  let hit = null;
  for (const form of forms) {
    const matches = wholeWordMatches(source, form);
    if (matches.length) { hit = { form, ...matches[0], count: matches.length }; break; }
  }
  if (!hit || hit.count !== 1) return null;
  const sourceBefore = source.slice(0, hit.index);
  if (!/[A-Za-z]/.test(sourceBefore)) return null;
  const blanked = `${sourceBefore}____${source.slice(hit.index + hit.surface.length)}`;
  for (const form of forms) if (wholeWordMatches(blanked, form).length) return null;
  return { sourceText: blanked, answer: hit.surface };
}

function words(value) { return text(value).toLocaleLowerCase('en').match(/[a-z]+/g) ?? []; }
// True when a cue (gloss, hint) shows the answer or an obvious derivative of it: a whole answer word, or a shared stem of five or
// more letters. Used to refuse a cue that would hand over the lexical form.
export function cueExposesAnswer(cue, answerOrAnswers) {
  const answers = array(Array.isArray(answerOrAnswers) ? answerOrAnswers : [answerOrAnswers]).map(text).filter(Boolean);
  const cueWords = words(cue);
  const sameWord = (a, c) => a === c || (a.length >= 5 && c.length >= 5 && a.slice(0, Math.min(5, Math.max(a.length, c.length) - 1)) === c.slice(0, Math.min(5, Math.max(a.length, c.length) - 1)));
  for (const answer of answers) {
    const answerWords = words(answer);
    if (!answerWords.length) continue;
    const shown = answerWords.filter(a => cueWords.some(c => sameWord(a, c))).length;
    // A one-word answer is exposed by any shared word or stem. A phrase is exposed when the cue shows more than half of its words
    // (for two words: both), so a generic shared word such as "time" in "leisure time" is tolerated but the phrase itself is not.
    if (answerWords.length === 1 ? shown >= 1 : shown > answerWords.length / 2) return true;
  }
  return false;
}

// Meaning Mastery: one authored mastery sentence for the sense, with the target blanked, plus the authored contextual gloss.
// `answer` is the exact surface form in the sentence; it is the ONLY accepted answer.
export function glossBlank({ item, sense, masteryContext } = {}) {
  const gloss = text(masteryContext?.meaning);
  if (!gloss) return null;
  const blank = blankTargetInSentence(masteryContext?.text, item, sense);
  if (!blank) return null;
  const forms = explicitSurfaceForms(item, sense);
  if (cueExposesAnswer(gloss, [blank.answer, ...forms])) return null;
  return { contextId: text(masteryContext?.contextId), gloss, sourceText: blank.sourceText, answer: blank.answer };
}


// ---- Context Mastery: two authored gap sentences for the SAME target, completed together (type_in_passage) ----
// The pair is a pure function of the first context id, so the browser and the Edge Function agree without sending a second id.
// `contexts` are rows shaped { contextId, text, type }. Only `gap_fill` sentences whose target blanks cleanly are used.
export function blankableGapContexts(contexts, item, sense = {}) {
  return (Array.isArray(contexts) ? contexts : [])
    .filter(context => context?.type === 'gap_fill' || context?.context_type === 'gap_fill')
    .map(context => {
      const contextId = text(context.contextId ?? context.context_id);
      const sentence = context.text ?? context.prompt_text;
      const blank = blankTargetInSentence(sentence, item, sense);
      return blank && contextId ? { contextId, sourceText: blank.sourceText, answer: blank.answer } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.contextId.localeCompare(b.contextId));
}
export function passagePair(contexts, item, sense, firstContextId) {
  const list = blankableGapContexts(contexts, item, sense);
  const index = list.findIndex(row => row.contextId === text(firstContextId));
  if (index < 0 || list.length < 2) return null;
  return [list[index], list[(index + 1) % list.length]];
}

// ---- Context Mastery (Job 9): one authored short passage with ONE gap ----
// sense.masteryPassages = [{ passageId, contextId, text:'... ____ ...', answer }]. The gap is the only place the target (or any explicit
// form of it) appears; the answer is one explicit surface form of the word; the gap never starts a sentence (a capital would show it).
// `contextId` names a live gap_fill context row of the same occurrence, which is what the attempt record points at.
export function passageBlank({ item, sense, passage } = {}) {
  const body = text(passage?.text), answer = text(passage?.answer), contextId = text(passage?.contextId);
  if (!body || !answer || !contextId) return null;
  if ((body.match(/_{2,}/g) ?? []).length !== 1) return null;
  const forms = explicitSurfaceForms(item, sense);
  if (!forms.some(form => form.toLocaleLowerCase('en') === answer.toLocaleLowerCase('en'))) return null;
  const rest = body.replace(/_{2,}/, ' ');
  for (const form of forms) if (wholeWordMatches(rest, form).length) return null;
  if (/(^|[.!?]["'”’)]*\s+)_{2,}/.test(body)) return null;
  return { contextId, passageId: text(passage?.passageId), sourceText: body, answer };
}
export function masteryPassageList(item, sense = {}) {
  return array(sense?.masteryPassages).map(passage => passageBlank({ item, sense, passage })).filter(Boolean).sort((a, b) => a.contextId.localeCompare(b.contextId));
}

// ---- Precision & Use: the weak wording named in an improve_vocabulary prompt, when it really sits in the sentence ----
export function weakPhraseOf(data = {}) {
  const match = /[\u201c"]([^\u201d"]+)[\u201d"]/.exec(text(data.prompt));
  if (!match) return null;
  const phrase = text(match[1]);
  const sentence = text(data.sourceText);
  const hits = wholeWordMatches(sentence, phrase);
  return hits.length === 1 ? { phrase, index: hits[0].index, surface: hits[0].surface } : null;
}
export function improveGapSentence(data = {}) {
  const weak = weakPhraseOf(data);
  if (!weak) return null;
  const sentence = text(data.sourceText);
  // a gap at the very start of a sentence would hide the capital letter the answer needs, so such a record is not used
  if (!/[A-Za-z]/.test(sentence.slice(0, weak.index))) return null;
  return { weak: weak.phrase, sourceText: `${sentence.slice(0, weak.index)}____${sentence.slice(weak.index + weak.surface.length)}` };
}
// Ordered improve_vocabulary records linked to one target (the order both sides use for the Mastery pair index).
export function improveRecordsFor(records, vocabularyId) {
  return (Array.isArray(records) ? records : [])
    .filter(record => (record?.activityData ?? record?.activity_data)?.taskType === 'improve_vocabulary'
      && (((record.activityData ?? record.activity_data)?.linkedVocabularyIds) ?? []).includes(vocabularyId))
    .map(record => ({ id: text(record.activityContentId ?? record.activity_content_id), data: record.activityData ?? record.activity_data }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

// ---- multi-slot answers: defined beside the marker (vocabulary-engine.js) and re-exported here for the builders ----
export { encodeSlotAnswer, decodeSlotAnswer, markSlotAnswer };
