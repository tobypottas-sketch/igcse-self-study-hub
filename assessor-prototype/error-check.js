// Deterministic check that a proposed correction is a DEMONSTRABLE language error, not a model's preference.
// DEFAULT: NOT demonstrable. A correction is accepted only when EVERY change is one of the narrow, objectively checkable kinds below;
// anything else (word choice, plurals, tense, articles that may be omitted, commas, British/American spelling, collective nouns ...) is left to the teacher.
//   1. the pronoun i written without a capital; a sentence that begins with a lower-case letter; days and months
//   2. a known misspelling from the curated list below -> its correct spelling (no guessing from letter distance)
//   3. a plural subject with a singular be/have/do verb (or he/she/it with a plural one), when the subject is unambiguous
//   4. a / an chosen against the next word's first letter, for plain lower-case words without sound exceptions
//   5. a function word accidentally typed twice (the the)
const TOKEN = /[\p{L}\p{N}]+(?:['’][\p{L}]+)?|[^\s\p{L}\p{N}]/gu;
const MISSPELLINGS = new Map(Object.entries({
  recieve:'receive', recieved:'received', definately:'definitely', definatly:'definitely', seperate:'separate', seperated:'separated', occured:'occurred', occurence:'occurrence',
  untill:'until', wich:'which', becuase:'because', becasue:'because', beacuse:'because', beleive:'believe', belive:'believe', freind:'friend', freinds:'friends',
  tommorow:'tomorrow', tommorrow:'tomorrow', tomorow:'tomorrow', writting:'writing', begining:'beginning', comming:'coming', realy:'really', interessting:'interesting',
  intresting:'interesting', beutiful:'beautiful', beatiful:'beautiful', adress:'address', accomodation:'accommodation', accomodate:'accommodate', embarass:'embarrass', enviroment:'environment',
  goverment:'government', gouvernment:'government', neccessary:'necessary', necesary:'necessary', occassion:'occasion', paralel:'parallel', persue:'pursue', priviledge:'privilege',
  proffesional:'professional', recomend:'recommend', reccomend:'recommend', recommand:'recommend', refered:'referred', relevent:'relevant', restarant:'restaurant', resturant:'restaurant',
  succesful:'successful', sucessful:'successful', suprise:'surprise', surprice:'surprise', tecnology:'technology', thier:'their', truely:'truly', unfortunatly:'unfortunately',
  wierd:'weird', wether:'whether', whereever:'wherever', diffrent:'different', diferent:'different', dissapoint:'disappoint', dissapointed:'disappointed', exciteing:'exciting',
  excellant:'excellent', experiance:'experience', familar:'familiar', finaly:'finally', foriegn:'foreign', guage:'gauge', happend:'happened', immediatly:'immediately', independant:'independent',
  knowlege:'knowledge', libary:'library', lenght:'length', maintainance:'maintenance', mischievious:'mischievous', noticable:'noticeable', peice:'piece', posible:'possible',
  prefered:'preferred', promiss:'promise', publically:'publicly', sincerly:'sincerely', strenght:'strength', studing:'studying', tounge:'tongue', usefull:'useful', wellcome:'welcome'
}));
const DAYS_MONTHS = new Set(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'january', 'february', 'april', 'june', 'july', 'september', 'october', 'november', 'december']); // "may"/"march" are also ordinary words
const DOUBLED_OK = new Set(['the', 'a', 'an', 'to', 'of', 'for', 'and', 'with', 'from', 'by', 'my', 'your', 'our', 'their', 'his']);   // not is/on/in/it/you/her/was: they can be doubled correctly
const PLURAL_SUBJECT_WORDS = new Set(['they', 'we', 'you', 'these', 'those']);
const SINGULAR_SUBJECT_WORDS = new Set(['he', 'she', 'it']);
const SINGULAR_S_WORDS = new Set(['news', 'physics', 'maths', 'mathematics', 'politics', 'economics', 'series', 'species', 'means', 'class', 'bus', 'glass', 'grass', 'lens', 'gas', 'chaos', 'bias', 'axis', 'basis', 'crisis', 'analysis', 'diabetes', 'athletics', 'gymnastics', 'measles', 'headquarters', 'works', 'barracks', 'crossroads', 'billiards', 'darts', 'dominoes', 'lunchtimes']);
const COLLECTIVE_OR_QUANTITY = new Set(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'twenty', 'hundred', 'thousand', 'million', 'of', 'and', 'or', 'nor', 'with', 'who', 'which', 'that', 'each', 'every', 'either', 'neither', 'none', 'some', 'any', 'all', 'both', 'number', 'lot', 'lots', 'couple', 'group', 'kind', 'type', 'family', 'team', 'staff', 'police', 'crowd', 'committee', 'data', 'there', 'here', 'if', 'wish', 'half', 'majority', 'minority', 'plenty', 'rest', 'most', 'more', 'less', 'few', 'many', 'several', 'such', 'people', 'public', 'army', 'band', 'class', 'audience', 'jury', 'government', 'company', 'council', 'club', 'board', 'orchestra', 'choir', 'gang', 'crew', 'cast', 'faculty', 'department', 'section']);
const BE_PAIRS = new Map([['was', 'were'], ['is', 'are'], ['has', 'have'], ['does', 'do'], ["doesn't", "don't"], ["wasn't", "weren't"], ["isn't", "aren't"], ["hasn't", "haven't"]]);
const NO_A_AN_SOUND = /^(?:hour|honest|honou?r|heir|herb|histor|hotel|uni|use|usu|usa|una|uku|ufo|uk|eu|ew|one|once|ubi|ut|ur|x)/u;
const isWord = token => /[\p{L}\p{N}]/u.test(token);
const norm = token => token.replace(/’/gu, "'");
const lower = token => norm(token).toLowerCase();
const cap = word => word.charAt(0).toUpperCase() + word.slice(1);
const isLowerWord = token => /^[a-z]+$/u.test(token);
function regions(a, b) {
  const m = a.length, n = b.length; const table = Array.from({ length:m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i -= 1) for (let j = n - 1; j >= 0; j -= 1) table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
  const out = []; let i = 0, j = 0, current = null;
  const flush = () => { if (current) { out.push(current); current = null; } };
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) { flush(); i += 1; j += 1; continue; }
    current ??= { del:[], ins:[], start:i };
    if (j < n && (i === m || table[i][j + 1] >= table[i + 1][j])) { current.ins.push(b[j]); j += 1; } else { current.del.push(a[i]); i += 1; }
  }
  flush(); return out;
}
// the sentence (from context) that contains the quotation; used to know whether the quotation begins a sentence
function startsSentence(quote, context) {
  const text = String(context), needle = String(quote); let at = text.indexOf(needle), seen = 0;
  if (at < 0) return false;
  while (at >= 0) {
    seen += 1; const before = text.slice(0, at);
    const startOfText = before.trim() === '';
    const afterFullStop = /[a-z]{2,}[.!?]\s+$/iu.test(before) && !/(?:^|\s)(?:mr|mrs|ms|dr|prof|st|no|vs|etc|e\.g|i\.e|p\.m|a\.m)\.\s+$/iu.test(before) && !/\.\.\.\s*$/u.test(before);
    if (!startOfText && !afterFullStop) return false;
    at = text.indexOf(needle, at + 1);
  }
  return seen > 0;
}
// Agreement is demonstrable in only two shapes, both read directly from the quotation:
//   - a personal pronoun immediately before the verb (they/we/you + singular verb, he/she/it + plural verb), or
//   - determiner + regular -s plural noun + verb at the start of a clause: the chips was / these exhibits is.
// Everything else (of-phrases, relative clauses, gerunds, collectives, irregular plurals, names, questions, adverbs) is left to the teacher.
const CLAUSE_STARTERS = new Set(['however', 'but', 'so', 'because', 'when', 'while', 'although', 'then', 'since']);
const NOUN_DETERMINERS = new Set(['the', 'these', 'those', 'my', 'your', 'our', 'their']);
function subjectKind(tokens, verbAt) {
  const subject = tokens[verbAt - 1]; if (!subject || !isWord(subject)) return null;
  const word = lower(subject);
  if (PLURAL_SUBJECT_WORDS.has(word)) return 'plural-pronoun';
  if (SINGULAR_SUBJECT_WORDS.has(word)) return 'singular-pronoun';
  const determiner = tokens[verbAt - 2], before = tokens[verbAt - 3];
  if (!determiner || !NOUN_DETERMINERS.has(lower(determiner))) return null;
  if (before !== undefined && isWord(before) && !CLAUSE_STARTERS.has(lower(before))) return null;                              // an earlier word may make this part of a longer phrase
  if (!/^[a-z]{3,}$/u.test(subject) || SINGULAR_S_WORDS.has(word) || /(?:ss|us|is|as|os|ics)$/u.test(word)) return null;
  return /s$/u.test(word) ? 'plural-noun' : null;
}
// returns an explanation for ONE region, or null when the change is not demonstrable
const SUBJUNCTIVE = /\b(?:if|wish|rather|though|suppose|imagine|as it were|were i)\b/iu;
function explainRegion(region, tokens, original, sentenceStart, wholeText) {
  const { del, ins } = region;
  if (del.length === 1 && ins.length === 1) {
    const from = del[0], to = ins[0], f = lower(from), t = lower(to);
    if (f === t && from !== to) {
      if (f === 'i' && from === 'i' && to === 'I' && !/^(?:part|chapter|section|unit|level|type|grade|phase|volume|vol|war|figure|table|stage|class|group|world|henry|louis|richard)$/u.test(lower(original[region.start - 1] ?? ''))) return 'The word I is always written as a capital letter.';
      if (DAYS_MONTHS.has(f) && from === f && to === cap(f)) return cap(f) + ' is a day or month, so it needs a capital letter.';
      if (region.start === 0 && sentenceStart && from === from.toLowerCase() && to === cap(from)) return 'A sentence begins with a capital letter.';
      return null;
    }
    if (isWord(from) && MISSPELLINGS.has(f) && to === (from[0] === from[0].toLowerCase() ? MISSPELLINGS.get(f) : cap(MISSPELLINGS.get(f))) && from === (from[0] === from[0].toLowerCase() ? f : cap(f))) return 'The correct spelling is ' + to + ', not ' + from + '.';
    if (BE_PAIRS.has(f) || [...BE_PAIRS.values()].includes(f)) {
      const wantPlural = [...BE_PAIRS.values()].includes(t), ok = BE_PAIRS.get(f) === t || BE_PAIRS.get(t) === f;
      if (!ok || from !== from.toLowerCase() || to !== to.toLowerCase() || region.start < 1) return null;
      if (t === 'was' && SUBJUNCTIVE.test(wholeText)) return null;                                                             // if I were, I wish he were: were is correct
      const kind = subjectKind(original, region.start);
      if (!kind || (kind.startsWith('plural') !== wantPlural)) return null;
      const subject = original[region.start - 1];
      return kind.endsWith('pronoun') ? 'After ' + lower(subject) + ', use ' + t + ', not ' + f + '.' : cap(lower(subject)) + ' is ' + (wantPlural ? 'plural' : 'singular') + ', so use ' + t + ', not ' + f + '.';
    }
    if (['a', 'an'].includes(f) && ['a', 'an'].includes(t) && f !== t) {
      const next = original[region.start + 1];
      if (from !== f || to !== t || !next || !isLowerWord(next) || next.length < 4 || NO_A_AN_SOUND.test(next)) return null;
      return (t === 'an') === /^[aeiou]/u.test(next) ? 'Use ' + t + ' before a word that starts with ' + (t === 'an' ? 'a vowel' : 'a consonant') + ' sound, like ' + next + '.' : null;
    }
    return null;
  }
  if (del.length === 1 && ins.length === 0 && DOUBLED_OK.has(lower(del[0])) && (lower(original[region.start - 1] ?? '') === lower(del[0]) || lower(original[region.start + 1] ?? '') === lower(del[0]))) return cap(lower(del[0])) + ' is repeated; use it only once.';
  return null;
}
export function confirmCorrection(quote, correction, context = '') {
  const none = { confirmed:false, newWords:[], explanation:'' };
  const original = (String(quote).match(TOKEN) ?? []).map(norm), fixed = (String(correction).match(TOKEN) ?? []).map(norm);
  if (!original.length || !fixed.length || original.length > 60 || fixed.length > 60) return none;
  const changes = regions(original, fixed);
  if (!changes.length || changes.length > 2) return none;
  const sentenceStart = startsSentence(quote, context);
  const lines = [];
  for (const change of changes) { const text = explainRegion(change, original, original, sentenceStart, String(context) + ' ' + String(quote)); if (!text) return none; lines.push(text); }
  return { confirmed:true, newWords:[...new Set(changes.flatMap(change => change.ins).filter(isWord).map(lower))], explanation:lines.join(' ') };
}
