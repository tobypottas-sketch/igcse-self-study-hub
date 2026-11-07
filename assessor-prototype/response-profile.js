// Objective facts about what a response ALREADY contains, computed by the Worker (not by the model).
// They let stage 2 recognise existing features before suggesting additions, and let the Worker reject advice that asks for what is already there.
// This is a small genre-neutral lexicon of linking phrases and layout cues. It is not grammar detection and makes no judgement of quality.
const LINKING = [
  'however', 'moreover', 'furthermore', 'in addition', 'additionally', 'also', 'firstly', 'secondly', 'thirdly', 'finally', 'in conclusion',
  'to conclude', 'on the one hand', 'on the other hand', 'nevertheless', 'therefore', 'consequently', 'although', 'whereas', 'for example',
  'for instance', 'in contrast', 'similarly', 'besides', 'as a result', 'instead', 'admittedly', 'after all', 'overall', 'in the end',
  'even so', 'in particular', 'as well as', 'on the whole', 'because', 'so that', 'such as'
];
const REASON = /\b(?:because|since|so that|as a result|which means|this means|in order to)\b/iu;
const EXAMPLE = /\b(?:for example|for instance|such as|e\.g\.|including)\b/iu;
const METHOD = /(?<![\p{L}\p{N}])(?:counted|surveyed|interviewed|questionnaire|survey|observed|measured|investigated|collected|recorded|timed)(?![\p{L}\p{N}])/giu;
const GREETING = /^\s*(?:dear|hi|hello|hey)\b/iu;
const SIGN_OFF = /(?:^|\n)\s*(?:yours (?:sincerely|faithfully)|best wishes|kind regards|regards|your friend|love|see you soon|thank you for (?:reading|your time|considering))\b/iu;

const escaped = phrase => phrase.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
const LINKING_PATTERNS = LINKING.map(phrase => [phrase, new RegExp('(?<![\\p{L}\\p{N}])' + escaped(phrase).replace(/ /gu, '\\s+') + '(?![\\p{L}\\p{N}])', 'iu')]);

export function profileResponse(response) {
  const text = String(response ?? '');
  const lines = text.split(/\n/u).map(line => line.trim()).filter(Boolean);
  const paragraphs = text.split(/\n\s*\n/u).filter(part => part.trim()).length;
  // A heading is a short line with no sentence punctuation that is not the greeting or sign-off.
  const headings = lines.filter(line => line.split(/\s+/u).length <= 8 && !/[.!?,;:]$/u.test(line) && !GREETING.test(line) && !SIGN_OFF.test(line)).length;
  const linkingPhrases = LINKING_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([phrase]) => phrase);
  return {
    paragraphs, headings, linkingPhrases,
    methodWords: [...new Set((text.match(METHOD) ?? []).map(word => word.toLowerCase()))],
    questions: (text.match(/\?/gu) ?? []).length,
    reasons: (text.match(new RegExp(REASON.source, 'giu')) ?? []).length,
    examples: (text.match(new RegExp(EXAMPLE.source, 'giu')) ?? []).length,
    greeting: GREETING.test(text), signOff: SIGN_OFF.test(text)
  };
}

// Plain-language list for the model: only things that are really there.
export function describeProfile(profile) {
  const facts = [];
  if (profile.linkingPhrases.length) facts.push(`linking words or phrases already used: ${profile.linkingPhrases.join(', ')}`);
  if (profile.questions) facts.push(`${profile.questions} question mark${profile.questions === 1 ? '' : 's'} (the response already asks at least one question)`);
  if (profile.reasons) facts.push(`${profile.reasons} reason marker${profile.reasons === 1 ? '' : 's'} such as because`);
  if (profile.examples) facts.push(`${profile.examples} example marker${profile.examples === 1 ? '' : 's'} such as for example`);
  if (profile.methodWords.length) facts.push(`the response already describes how information was collected (${profile.methodWords.join(', ')})`);
  if (profile.headings) facts.push(`${profile.headings} heading-like line${profile.headings === 1 ? '' : 's'}`);
  if (profile.paragraphs > 1) facts.push(`${profile.paragraphs} paragraphs`);
  if (profile.greeting) facts.push('a greeting');
  if (profile.signOff) facts.push('a closing or sign-off');
  return facts;
}

// Advice that asks the student to ADD something the response already has is redundant. Returns a reason code, or null when the advice is fine.
// Deliberately narrow: only "add / include / use / write ... <thing>" phrasings. Advice about how to use or improve an existing feature is untouched.
const ASK_TO_ADD = String.raw`\b(?:add|adding|include|including|use|using|try|write|writing|put|insert|give|giving|make)\b`;
const RULES = [
  ['linking', new RegExp(ASK_TO_ADD + String.raw`[^.!?]{0,60}\b(?:linking|connecting|transition(?:al)?|connectives?|linkers?|discourse)\b|\bmore\s+(?:linking|connecting|transition(?:al)?)\b`, 'iu'), profile => profile.linkingPhrases.length >= 3],
  ['question', new RegExp(ASK_TO_ADD + String.raw`[^.!?]{0,40}\bquestions?\b|\bask\s+(?:more\s+|some\s+|a\s+|another\s+)?questions?\b`, 'iu'), profile => profile.questions >= 1],
  ['reason', new RegExp(ASK_TO_ADD + String.raw`[^.!?]{0,40}\b(?:a\s+|your\s+|the\s+|some\s+|more\s+)?reasons?\b|\bexplain\s+why\b`, 'iu'), (profile, quote) => REASON.test(quote)],
  ['example', new RegExp(ASK_TO_ADD + String.raw`[^.!?]{0,40}\b(?:an?\s+|some\s+|more\s+)?examples?\b`, 'iu'), (profile, quote) => EXAMPLE.test(quote)],
  ['heading', new RegExp(ASK_TO_ADD + String.raw`[^.!?]{0,40}\b(?:headings?|titles?|sub-?headings?)\b`, 'iu'), profile => profile.headings >= 2],
  ['greeting', new RegExp(ASK_TO_ADD + String.raw`[^.!?]{0,40}\bgreeting\b`, 'iu'), profile => profile.greeting],
  ['sign-off', new RegExp(ASK_TO_ADD + String.raw`[^.!?]{0,40}\b(?:closing|sign-?off|ending phrase)\b`, 'iu'), profile => profile.signOff]
];
export function redundantAddition(advice, profile, quote = '') {
  const text = String(advice ?? '');
  for (const [code, pattern, present] of RULES) if (pattern.test(text) && present(profile, quote)) return code;
  return null;
}

// Student-facing wording the Worker cannot stand behind: error-type labels it cannot demonstrate.
// Verified errors are explained by the Worker's own text, so a model-written label like "tense" is never needed.
export const UNVERIFIED_LABEL = /\b(?:tenses?|verb form|grammar(?:atical)? (?:mistake|error)|subject[- ]verb)\b/iu;

// Claims that something is absent. An optional style suggestion or a writing target must not assert absence: the Worker cannot verify it
// (the idea may be present in another part of the response), so such wording is left out.
export const ABSENCE_CLAIM = /\b(?:missing|absent|lacks?|lacking|forgot(?:ten)?|no mention|never mention(?:s|ed)?|(?:do(?:es)?\s*n[o']t|did\s*not|have\s*not|has\s*not|not)\s+(?:yet\s+)?(?:include|included|mention|mentioned|have|give|gave|say|said|explain|explained|describe|described|state|stated))\b/iu;

// A writing target must be about THIS response: it has to share at least two content words (4+ letters) with the student's text.
const FILLER = new Set('your with that this have from will they them their there what when which would should could about more some into then than also each other your next write writing'.split(' '));
export function namesPartOfResponse(target, response) {
  const words = value => new Set((String(value).toLowerCase().match(/[\p{L}']{4,}/gu) ?? []).filter(word => !FILLER.has(word)));
  const mine = words(response); let shared = 0;
  for (const word of words(target)) if (mine.has(word) || mine.has(word.replace(/s$/u, '')) || mine.has(word + 's')) shared += 1;
  return shared >= 2;
}
