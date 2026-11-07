// Worker-side integrity checks for model-written feedback. Nothing here judges writing quality or grammar; each check is narrow, deterministic and fails safe
// (the text is trimmed or left out, never repaired by guessing). Used by staff-assessment.js.

// ---------- Complete sentences ----------
const ABBREVIATION_END = /\b(?:e\.g|i\.e|a\.m|p\.m|etc|vs|mr|mrs|ms|dr|no)\.$/iu;
const TERMINAL = /[.!?]["'’”)\]]*$/u;
// Splits prose into sentences. A full stop after a common abbreviation does not end a sentence.
export function sentencesOf(value) {
  const text = String(value ?? '').replace(/\s+/gu, ' ').trim(); if (!text) return [];
  const parts = []; let start = 0; const boundary = /[.!?]+["'’”)\]]*\s+(?=\S)/gu; let match;
  while ((match = boundary.exec(text))) {
    const end = match.index + match[0].length, piece = text.slice(start, end).trim();
    if (ABBREVIATION_END.test(piece)) continue;
    parts.push(piece); start = end;
  }
  parts.push(text.slice(start).trim()); return parts.filter(Boolean);
}
// A sentence is complete when it ends with sentence punctuation (not an ellipsis) and has at least one word.
export function isCompleteSentence(sentence) {
  const text = String(sentence ?? '').trim();
  return TERMINAL.test(text) && !/(?:…|\.\.\.)\s*["'’”)\]]*$/u.test(text) && (text.match(/[\p{L}\p{N}]+/gu) ?? []).length >= 1;
}

// ---------- Unintended language switching ----------
// A letter from a non-Latin script in model-written advice is accepted only when the student's own text (task or response) contains that same character,
// so a genuine quotation of a word in another language is kept, while a stray 其他 or Cyrillic word is caught.
export function allowedCharacters(source) {
  const set = new Set();
  for (const ch of String(source ?? '')) { set.add(ch); set.add(ch.toLowerCase()); set.add(ch.toUpperCase()); }
  return set;
}
export function hasUnexpectedScript(text, allowed) {
  for (const ch of String(text ?? '')) if (/\p{L}/u.test(ch) && !/\p{Script=Latin}/u.test(ch) && !allowed.has(ch)) return true;   // accented Latin letters are ordinary English names and borrowings
  return false;
}

// ---------- Accuracy of terminology ----------
// A pronoun is never a noun.
export const PRONOUN_AS_NOUN = /\b(?:we|they|you|he|she|it|i)["'’”]?\s+(?:is|are|was|were)\s+(?:a|an|the)?\s*(?:(?:plural|singular|proper|common)\s+)*nouns?\b|\bsubject\s+["'‘“]?(?:we|they|you|he|she|it|i)["'’”]?\s+(?:is|are)\s+(?:a|an)\s+(?:plural|singular)\s+(?:noun|word)\b/iu;
// Absolute claims that details, examples, reasons or explanations are missing. They are contradicted when the response contains reasons, examples,
// numbers or names, so they are not allowed in that case (the model may say "more specific" or "could be developed further" instead).
export const NO_DETAIL_CLAIM = /\b(?:(?:no|lacks?|lacking|missing|absence of)\s+(?:(?:specific|real|clear|further|enough|relevant|supporting|concrete)\s+)+|(?:not any|without any)\s+(?:(?:specific|real|clear|further|enough|relevant|supporting|concrete)\s+)*)(?:details?|examples?|reasons?|explanations?|development)\b(?!\s+(?:of|about|for|on|as to|to show|how|why)\b)/iu;   // a sweeping claim; one scoped to a named idea ("no explanation of how...") can be checked by the teacher
export function responseHasDetail(response, profile) {
  const text = String(response ?? '');
  const names = (text.match(/(?<=[a-z,;]\s)[A-Z][a-z]{2,}/gu) ?? []).length;   // capitalised word in the middle of a sentence
  return (profile?.reasons ?? 0) + (profile?.examples ?? 0) > 0 || /\d/u.test(text) || names >= 2;
}
// Linking words have a fixed function. Praise or advice may not describe a linker with the wrong function.
const LINKERS = [
  ['addition', ['moreover', 'furthermore', 'in addition', 'additionally', 'besides', 'as well as', 'also']],
  ['contrast', ['however', 'but', 'although', 'whereas', 'on the other hand', 'in contrast', 'nevertheless', 'even so', 'instead', 'admittedly', 'on the one hand']],
  ['reason', ['because', 'so that', 'as a result', 'therefore', 'consequently']],
  ['example', ['for example', 'for instance', 'such as']],
  ['order', ['firstly', 'secondly', 'thirdly', 'finally', 'in conclusion', 'to conclude']]
];
const FUNCTION_WORDS = {
  addition: /\b(?:additive|addition|adds?\s+(?:another|a\s+further|more|an\s+extra)|adding\s+(?:another|a\s+further|more)|further\s+point|extra\s+point|another\s+point)\b/iu,
  contrast: /\bcontrast\w*\b|\bopposite\b/iu,
  reason: /\b(?:reasons?|causes?|results?)\b/iu,
  example: /\b(?:examples?|illustrates?)\b/iu,
  order: /\b(?:sequence|in order|conclusion|concludes?|sums? up|order of)\b/iu
};
const linkerPattern = phrase => new RegExp('(?<![\\p{L}\\p{N}])' + phrase.replace(/ /gu, '\\s+') + '(?![\\p{L}\\p{N}])', 'iu');
const LINKER_PATTERNS = LINKERS.flatMap(([type, phrases]) => phrases.map(phrase => [type, linkerPattern(phrase)]));
const ABOUT_LINKING = /\b(?:link\w*|connective|connectives|transition\w*|linker|linkers|phrase|connect\w*|joins?|signals?)\b/iu;
// Only a sentence that is talking about the linking word itself is checked: "Add an example to show how it helps" is advice, not a description of the linker.
export function linkerMismatch(advice, quote) {
  const found = LINKER_PATTERNS.filter(([, pattern]) => pattern.test(quote)); if (!found.length) return false;
  const types = new Set(found.map(([type]) => type));
  return sentencesOf(advice).some(sentence => (ABOUT_LINKING.test(sentence) || found.some(([, pattern]) => pattern.test(sentence))) &&
    Object.entries(FUNCTION_WORDS).some(([type, pattern]) => !types.has(type) && pattern.test(sentence)));
}

// ---------- Optional style versus grammar ----------
// A change that only expands or contracts a contraction, or swaps an informal word for a formal one, is a register choice, not a grammar mistake.
const CONTRACTIONS = new Map(Object.entries({ "don't":'do not', "doesn't":'does not', "didn't":'did not', "can't":'cannot', "won't":'will not', "isn't":'is not', "aren't":'are not', "wasn't":'was not',
  "weren't":'were not', "haven't":'have not', "hasn't":'has not', "it's":'it is', "that's":'that is', "i'm":'i am', "i've":'i have', "i'll":'i will', "we're":'we are', "they're":'they are', "let's":'let us' }));
const INFORMAL = new Set(['kids', 'stuff', 'gonna', 'wanna', 'gotta', 'okay', 'ok', 'lots', 'loads', 'tons', 'guys', 'cool', 'awesome']);
const tokensOf = value => (String(value).toLowerCase().replace(/[‘’]/gu, "'").match(/[\p{L}\p{N}']+/gu) ?? []);
const expand = tokens => tokens.flatMap(token => (CONTRACTIONS.get(token) ?? token).split(' '));
export function isOptionalStyleChange(quote, correction) {
  const before = tokensOf(quote), after = tokensOf(correction);
  if (!before.length || !after.length || before.join(' ') === after.join(' ')) return false;   // a change of capital letters only is a real correction
  if (expand(before).join(' ') === expand(after).join(' ')) return true;                                   // only a contraction was opened or closed
  const kept = new Map(); for (const word of after) kept.set(word, (kept.get(word) ?? 0) + 1);
  const removed = before.filter(word => { const left = kept.get(word) ?? 0; if (left > 0) { kept.set(word, left - 1); return false; } return true; });
  const phrase = before.join(' ');
  return removed.length > 0 && (removed.every(word => INFORMAL.has(word)) || /\ba lot(?: of)?\b/u.test(phrase) && removed.every(word => ['a', 'lot', 'of'].includes(word) || INFORMAL.has(word)));
}

// ---------- Length ----------
export const countWords = text => (String(text ?? '').match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length;
export function wordTarget(task) {
  const text = String(task ?? ''), found = [];
  for (const m of text.matchAll(/\b(\d{2,3})\s*(?:[-\u2013\u2014]|to)\s*(\d{2,3})\s*words?\b/giu)) found.push([Number(m[1]), Number(m[2])]);
  for (const m of text.matchAll(/\bbetween\s+(\d{2,3})\s+and\s+(\d{2,3})\s+words?\b/giu)) found.push([Number(m[1]), Number(m[2])]);
  const ranges = found.filter(([min, max]) => min > 0 && max >= min && max <= 1000).sort((a, b) => b[1] - a[1]);   // the largest range is the length target, not "15-20 words from the text"
  if (ranges.length) return { min:ranges[0][0], max:ranges[0][1] };
  const least = text.match(/\bat least\s+(\d{2,3})\s+words\b/iu);
  return least ? { min:Number(least[1]), max:null } : null;
}
// "Substantially below" means under 85 per cent of the lower limit. The notice is factual and never changes a mark.
export function lengthNotice(task, response) {
  const target = wordTarget(task); if (!target) return null;
  const words = countWords(response);
  if (words >= Math.ceil(target.min * 0.85)) return null;
  const asked = target.max ? target.min + '–' + target.max + ' words' : 'at least ' + target.min + ' words';
  return { wordCount:words, minimum:target.min, maximum:target.max,
    message:'This response has ' + words + ' words. The task asks for ' + asked + '. The word count does not change the marks by itself: the Cambridge descriptors decide them, and a shorter response can limit how fully ideas are developed.',
    suggestion:'Next time, add one reason, example or specific detail to each point in the task until you reach about ' + target.min + ' words.' };
}
// Student-facing text must not turn the length notice into a separate demand.
export const ASKS_FOR_LENGTH = /\b(?:word count|more words|write longer|too short|longer (?:response|answer|text|email|report|review|article)|\d{2,3}\s*(?:[-–]|to)\s*\d{2,3}\s*words)\b/iu;

// ---------- Sentence-level cleaning ----------
// Returns the sentences that pass every rule, without an unfinished last sentence. `flagged` is true when any sentence was removed by a rule
// (so a caller that cannot accept partial text can drop the whole item). `complete:false` skips the finished-sentence requirement.
export function sanitizeProse(value, { source = '', rules = [], complete = true } = {}) {
  const allowed = allowedCharacters(source); let flagged = false; const kept = [];
  for (const sentence of sentencesOf(value)) {
    if (hasUnexpectedScript(sentence, allowed) || rules.some(rule => rule.test(sentence))) { flagged = true; continue; }
    kept.push(sentence);
  }
  if (complete) while (kept.length && !isCompleteSentence(kept[kept.length - 1])) kept.pop();
  return { text:kept.join(' '), flagged };
}

// ---------- Marking explanations ----------
const LANGUAGE_BANDS = [[7, 9, 'wide appropriate vocabulary and structures, high accuracy and effective organisation'], [4, 6, 'some variety, generally accurate and reasonably organised'], [1, 3, 'limited range and organisation, with errors that may impede communication'], [0, 0, 'no creditable language']];
const CONTENT_BANDS = [[5, 6, 'consistent task fulfilment with well-developed ideas'], [3, 4, 'general task fulfilment with generally developed ideas'], [1, 2, 'partial fulfilment with limited development'], [0, 0, 'no creditable content']];
export const bandText = (kind, mark) => (kind === 'language' ? LANGUAGE_BANDS : CONTENT_BANDS).find(([low, high]) => mark >= low && mark <= high)?.[2] ?? '';
// Wording of a band the mark is not in is removed from the reason (the model tends to copy descriptor phrases for every response).
export function bandRules(kind, mark) {
  if (kind === 'language') return mark < 7
    ? [/\bwide(?:\s+appropriate)?\s+(?:range|vocabulary)\b|\bhigh(?:ly)?\s+accura(?:cy|te)\b|\beffective(?:ly)?\s+organis\w+/iu]
    : [/(?<!\bnot\s)(?<!\bno\s)\blimited\s+(?:range|vocabulary|organisation)\b|\b(?:frequent|numerous)\s+errors\b|\berrors?\s+(?:often|frequently|sometimes)\s+imped\w+/iu];
  return mark < 5 ? [/\bconsistently\s+(?:fulfils?|relevant)\b/iu] : [/\bpartial(?:ly)?\s+fulfil\w*/iu];
}
