// Deterministic check that a proposed correction is a DEMONSTRABLE language error, not a model's stylistic preference.
// A correction is accepted only when every change between the student's wording and the correction is one of:
//   - a capital letter or punctuation fix,
//   - a spelling fix (one letter added, dropped or changed, or two letters swapped),
//   - a swap inside a closed set of forms that must agree (was/were, is/are, a/an, much/many, its/it's, go/went ...),
//   - a missing or superfluous article/preposition, or a repeated word.
// Replacing, adding or removing ordinary content words (a noun for a pronoun, "big" for "large") is NEVER demonstrable: those are choices.
const TOKEN = /[\p{L}\p{N}]+(?:['’][\p{L}]+)?|[^\s\p{L}\p{N}]/gu;
const GROUPS = [
  ['am','is','are','was','were','be','been','being'], ['has','have','had','having'], ['do','does','did','done','doing'],
  ["doesn't","don't","didn't"], ["wasn't","weren't"], ["isn't","aren't"], ["hasn't","haven't","hadn't"], ['a','an'], ['this','these'], ['that','those'],
  ['much','many'],
  ['go','goes','went','gone','going'], ['see','sees','saw','seen','seeing'], ['eat','eats','ate','eaten','eating'], ['buy','buys','bought','buying'],
  ['make','makes','made','making'], ['take','takes','took','taken','taking'], ['come','comes','came','coming'], ['get','gets','got','getting'],
  ['give','gives','gave','given','giving'], ['write','writes','wrote','written','writing'], ['say','says','said','saying'], ['tell','tells','told','telling'],
  ['think','thinks','thought','thinking'], ['bring','brings','brought','bringing'], ['begin','begins','began','begun'], ['run','runs','ran','running'],
  ['know','knows','knew','known','knowing'], ['feel','feels','felt','feeling'], ['leave','leaves','left','leaving'], ['meet','meets','met','meeting']
].map(group => new Set(group.map(word => word.replace(/’/gu, "'"))));
const PAST = new Set(['was', 'were', 'had', 'did', 'went', 'saw', 'ate', 'bought', 'made', 'took', 'came', 'got', 'gave', 'wrote', 'said', 'told', 'thought', 'brought', 'began', 'ran', 'knew', 'felt', 'left', 'met', "didn't", "wasn't", "weren't", "hadn't"]);
const PRESENT = new Set(['am', 'is', 'are', 'has', 'have', 'do', 'does', 'go', 'goes', 'see', 'sees', 'eat', 'eats', 'buy', 'buys', 'make', 'makes', 'take', 'takes', 'come', 'comes', 'get', 'gets', 'give', 'gives', 'write', 'writes', 'say', 'says', 'tell', 'tells', 'think', 'thinks', 'bring', 'brings', 'begin', 'begins', 'run', 'runs', 'know', 'knows', 'feel', 'feels', 'leave', 'leaves', 'meet', 'meets', "don't", "doesn't", "isn't", "aren't", "hasn't", "haven't"]);
const PAST_MARKERS = /\b(?:yesterday|ago|last|earlier|previously|once|then|when i was|in (?:19|20)\d\d)\b/iu;
const PRESENT_MARKERS = /\b(?:every|always|usually|often|never|sometimes|daily|today|now|nowadays|these days|each)\b/iu;
const UNCOUNTABLE = new Set(['music', 'water', 'food', 'information', 'advice', 'homework', 'furniture', 'money', 'rice', 'bread', 'news', 'weather', 'luggage', 'equipment', 'traffic', 'knowledge', 'pollution', 'fruit', 'milk', 'tea', 'coffee', 'sugar', 'salt', 'time', 'help', 'fun', 'work', 'research', 'progress', 'happiness', 'health', 'electricity', 'technology', 'education', 'accommodation']);
const DETERMINERS = new Set(['the', 'a', 'an', 'my', 'your', 'his', 'her', 'our', 'their', 'its', 'this', 'that', 'these', 'those', 'some', 'any', 'each', 'every', 'no', 'much', 'many', 'few', 'several', 'one', 'two', 'three']);
const SILENT_OR_SOUND_EXCEPTION = /^(?:hour|honest|honou?r|heir|uni|use|usu|eu|one|once|ubi|ut)/u;   // an hour, a university: spelling and sound disagree, so leave these to the teacher
const isWord = token => /[\p{L}\p{N}]/u.test(token);
const norm = token => token.replace(/’/gu, "'");
const lower = token => norm(token).toLowerCase();
function distance(a, b) {
  const x = [...a], y = [...b]; let row = Array.from({ length:y.length + 1 }, (_, i) => i);
  for (let i = 1; i <= x.length; i += 1) { const next = [i]; for (let j = 1; j <= y.length; j += 1) next[j] = Math.min(row[j] + 1, next[j - 1] + 1, row[j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1)); row = next; }
  return row[y.length];
}
function regions(a, b) {
  const m = a.length, n = b.length; const table = Array.from({ length:m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i -= 1) for (let j = n - 1; j >= 0; j -= 1) table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
  const out = []; let i = 0, j = 0, current = null;
  const flush = next => { if (current) { current.after = next ?? null; out.push(current); current = null; } };
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) { flush(a[i]); i += 1; j += 1; continue; }
    current ??= { del:[], ins:[], before:i > 0 ? a[i - 1] : null, after:null };
    if (j < n && (i === m || table[i][j + 1] >= table[i + 1][j])) { current.ins.push(b[j]); j += 1; } else { current.del.push(a[i]); i += 1; }
  }
  flush(null); return out;
}
// A swap inside a closed set can still turn correct English into wrong English, so agreement swaps must match the words around them.
const SINGULAR = new Set(['is', 'was', 'has', 'does', "doesn't", "wasn't", "isn't", "hasn't", 'this', 'that']);
const PLURAL = new Set(['are', 'were', 'have', 'do', "don't", "weren't", "aren't", "haven't", 'these', 'those']);
const PLURAL_SUBJECTS = new Set(['they', 'we', 'you', 'these', 'those', 'people', 'children', 'men', 'women', 'police', 'friends']);
const SINGULAR_SUBJECTS = new Set(['he', 'she', 'it', 'this', 'that', 'everyone', 'everybody', 'nobody', 'someone', 'one']);
function subjectNumber(word) {
  const w = lower(word ?? '');
  if (PLURAL_SUBJECTS.has(w)) return 'plural';
  if (SINGULAR_SUBJECTS.has(w)) return 'singular';
  if (w === 'i') return 'first';
  if (/^[a-z]{3,}s$/u.test(w) && !/(?:ss|us|is)$/u.test(w)) return 'plural';   // chips, friends, exhibits
  return /^[a-z]{2,}$/u.test(w) && !/s$/u.test(w) ? 'singular' : null;           // kitchen, staff-like words stay unsure only if not a plain word
}
const tenseOf = word => (PAST.has(word) ? 'past' : PRESENT.has(word) ? 'present' : null);
// Changing tense is only demonstrable when the sentence itself carries a time marker that points the same way (yesterday, every day ...).
function pastOrPresentOk(f, t, context) {
  const from = tenseOf(f), to = tenseOf(t);
  if (!from || !to) return true;
  if (from === to) return true;
  return to === 'past' ? PAST_MARKERS.test(context) && !PRESENT_MARKERS.test(context) : PRESENT_MARKERS.test(context) && !PAST_MARKERS.test(context);
}
function agreementOk(from, to, region, context) {
  const f = lower(from), t = lower(to);
  if (['a', 'an'].includes(f) && ['a', 'an'].includes(t)) { const next = lower(region.after ?? ''); return Boolean(next) && !SILENT_OR_SOUND_EXCEPTION.test(next) && (t === 'an') === /^[aeiou]/u.test(next); }
  if (['much', 'many'].includes(f) && ['much', 'many'].includes(t)) { const next = lower(region.after ?? ''); return Boolean(next) && (t === 'many') === (PLURAL_SUBJECTS.has(next) || (/^[a-z]{3,}s$/u.test(next) && !/(?:ss|us|is)$/u.test(next))); }
  if (!pastOrPresentOk(f, t, context)) return false;
  const wasSingular = SINGULAR.has(f), wasPlural = PLURAL.has(f), nowSingular = SINGULAR.has(t), nowPlural = PLURAL.has(t);
  if (!(wasSingular || wasPlural) || !(nowSingular || nowPlural)) return true;    // not an agreement pair (tense, its/it's ...)
  const number = ['these', 'those', 'this', 'that'].includes(t) ? subjectNumber(region.after) : subjectNumber(region.before);
  return (number === 'plural' && nowPlural) || (number === 'singular' && nowSingular);
}
function swapOk(from, to, region, context) {
  if (from === to) return false;
  if (!isWord(from) && !isWord(to)) return true;                      // punctuation swap, e.g. "," for "."
  if (!isWord(from) || !isWord(to)) return false;
  if (lower(from) === lower(to)) return true;                         // capital letter
  if (GROUPS.some(group => group.has(lower(from)) && group.has(lower(to)))) return agreementOk(from, to, region, context);
  // spelling slip: one letter added, dropped or changed in a longer word, or two letters swapped. A different word two letters away (like/love) is a choice, not a slip.
  const f = lower(from), t = lower(to), d = distance(f, t);
  return Math.min([...f].length, [...t].length) >= 5 && (d === 1 || (d === 2 && [...f].sort().join('') === [...t].sort().join('')));
}
function regionOk(region, context) {
  const { del, ins } = region;
  if (del.length === ins.length && del.length >= 1 && del.length <= 3) return del.every((word, index) => swapOk(word, ins[index], { before:index ? ins[index - 1] : region.before, after:index + 1 < ins.length ? ins[index + 1] : region.after }, context));
  if (del.length === 0 && ins.length === 1) {                           // punctuation, or a missing a/an before a singular countable noun
    if (!isWord(ins[0])) return true;
    const word = lower(ins[0]), next = lower(region.after ?? ''), before = lower(region.before ?? '');
    return ['a', 'an'].includes(word) && Boolean(next) && !SILENT_OR_SOUND_EXCEPTION.test(next) && (word === 'an') === /^[aeiou]/u.test(next) && !DETERMINERS.has(next) && !DETERMINERS.has(before) &&
      !UNCOUNTABLE.has(next) && !/^[a-z]{3,}s$/u.test(next);
  }
  if (del.length === 1 && ins.length === 0)                              // punctuation, or a repeated word
    return !isWord(del[0]) || lower(del[0]) === lower(region.before ?? '') || lower(del[0]) === lower(region.after ?? '');
  return false;
}
const cap = word => word.charAt(0).toUpperCase() + word.slice(1);
const PUNCT = { ',':'comma', '.':'full stop', '?':'question mark', '!':'exclamation mark', ';':'semicolon', ':':'colon', "'":'apostrophe', '"':'quotation mark', '-':'hyphen' };
const punct = token => PUNCT[token] ?? 'punctuation mark';
// Worker-written, plain-English learning point for ONE confirmed change. The model's own wording is never used for an error.
function explainSwap(from, to, region, context) {
  const f = lower(from), t = lower(to);
  if (!isWord(from)) return 'Use a ' + punct(to) + ' here, not a ' + punct(from) + '.';
  if (f === t) return t === 'i' ? 'The word I is always written as a capital letter.' : cap(to) + ' needs a capital letter.';
  if (['a', 'an'].includes(f) && ['a', 'an'].includes(t)) return 'Use ' + t + ' before a word that starts with ' + (t === 'an' ? 'a vowel' : 'a consonant') + ' sound, like ' + lower(region.after ?? '') + '.';
  if (['much', 'many'].includes(f) && ['much', 'many'].includes(t)) return 'Use many with plural nouns such as ' + lower(region.after ?? '') + ', and much with uncountable nouns.';
  if (tenseOf(f) && tenseOf(t) && tenseOf(f) !== tenseOf(t)) {
    const marker = (tenseOf(t) === 'past' ? PAST_MARKERS : PRESENT_MARKERS).exec(context)?.[0] ?? 'The time word';
    return cap(marker) + (tenseOf(t) === 'past' ? ' shows this happened in the past' : ' shows a regular habit or a fact') + ', so use ' + t + ', not ' + f + '.';
  }
  if ((SINGULAR.has(f) || PLURAL.has(f)) && (SINGULAR.has(t) || PLURAL.has(t))) {
    const subject = ['these', 'those', 'this', 'that'].includes(t) ? region.after : region.before, number = subjectNumber(subject);
    if (number === 'first') return 'After I, use ' + t + ', not ' + f + '.';
    if (subject && number) return cap(lower(subject)) + ' is ' + number + ', so use ' + t + ', not ' + f + '.';
  }
  return 'The correct spelling is ' + to + ', not ' + from + '.';
}
function explainRegion(region, context) {
  const { del, ins } = region;
  if (del.length === ins.length) return explainSwap(del[0], ins[0], { before:region.before, after:ins.length > 1 ? ins[1] : region.after }, context);
  if (!del.length) return isWord(ins[0]) ? 'A singular noun like ' + lower(region.after ?? '') + ' needs a or an before it: ' + lower(ins[0]) + ' ' + lower(region.after ?? '') + '.' : 'Add a ' + punct(ins[0]) + ' here.';
  return isWord(del[0]) ? cap(lower(del[0])) + ' is repeated; use it only once.' : 'Remove the extra ' + punct(del[0]) + '.';
}
export function confirmCorrection(quote, correction, context = '') {
  const where = String(context).indexOf(String(quote));               // judge tense against the sentence the quotation sits in
  const sentence = where < 0 ? String(quote) : (() => { const from = String(context).slice(0, where).split(/[.!?]\s*/u).pop(); const to = String(context).slice(where).split(/[.!?]/u)[0]; return from + to; })();
  context = sentence;
  const a = (String(quote).match(TOKEN) ?? []).map(norm), b = (String(correction).match(TOKEN) ?? []).map(norm);
  if (!a.length || !b.length) return { confirmed:false, newWords:[], explanation:'' };
  const changes = regions(a, b);
  if (!changes.length || changes.length > 3 || !changes.every(region => regionOk(region, context))) return { confirmed:false, newWords:[], explanation:'' };
  return { confirmed:true, newWords:[...new Set(changes.flatMap(change => change.ins).filter(isWord).map(lower))], explanation:changes.slice(0, 2).map(change => explainRegion(change, context)).join(' ') };
}
