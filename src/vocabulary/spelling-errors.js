// Plausible spelling errors for "choose the correct spelling" questions. A good distractor is something a learner
// might really write (dropped or doubled consonants, ie/ei swaps, vowel confusion in unstressed syllables); never a
// mechanical mutation such as a doubled first letter or two swapped final letters, and never another real word.
import { DISTRACTOR_SOURCE, reviewedSpellingErrors } from './reviewed-content.js';

const VOWELS = 'aeiou';
const SWAPS = { a:['e'], e:['a','i'], i:['e','a'], o:['u','a'], u:['o','a'] };

function stable(values, seed) {
  let h = 2166136261;
  for (const ch of String(seed)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return [...values].map((value, i) => [value, Math.imul(h ^ (i * 2654435761), 2246822519) >>> 0]).sort((a, b) => a[1] - b[1]).map(([v]) => v);
}

// Rule-based plausible errors, used only when no reviewed list exists (new units, inflected surface forms).
export function ruleBasedSpellingErrors(word) {
  const w = String(word ?? '').toLocaleLowerCase('en');
  const chars = Array.from(w);
  const out = [];
  const push = value => { if (value && value !== w) out.push(value); };
  for (let i = 1; i < chars.length - 1; i += 1) {
    const c = chars[i];
    if (c === chars[i - 1] && !VOWELS.includes(c)) push(chars.slice(0, i).concat(chars.slice(i + 1)).join('')); // double -> single
    if (!VOWELS.includes(c) && VOWELS.includes(chars[i - 1]) && VOWELS.includes(chars[i + 1] ?? '') ) push(chars.slice(0, i + 1).join('') + c + chars.slice(i + 1).join('')); // single -> double
    if (VOWELS.includes(c) && SWAPS[c]) for (const alt of SWAPS[c]) if (i > 1) push(chars.slice(0, i).join('') + alt + chars.slice(i + 1).join('')); // unstressed vowel confusion
    if (c === 'i' && chars[i + 1] === 'e') push(chars.slice(0, i).join('') + 'ei' + chars.slice(i + 2).join('')); // ie -> ei
    if (c === 'e' && chars[i + 1] === 'i') push(chars.slice(0, i).join('') + 'ie' + chars.slice(i + 2).join(''));
    if (c === 'c' && 'ei'.includes(chars[i + 1] ?? '')) push(chars.slice(0, i).join('') + 's' + chars.slice(i + 1).join('')); // c/s
  }
  if (/able$/.test(w)) push(w.replace(/able$/, 'ible'));
  if (/ible$/.test(w)) push(w.replace(/ible$/, 'able'));
  if (/ance$/.test(w)) push(w.replace(/ance$/, 'ence'));
  if (/ence$/.test(w)) push(w.replace(/ence$/, 'ance'));
  if (/ant$/.test(w)) push(w.replace(/ant$/, 'ent'));
  if (/ent$/.test(w)) push(w.replace(/ent$/, 'ant'));
  if (/tion$/.test(w)) push(w.replace(/tion$/, 'sion'));
  if (/ly$/.test(w) && w.length > 4) push(w.replace(/ly$/, 'ley'));
  // remove anything that still looks mechanical or unnatural
  return [...new Set(out)].filter(v => v[0] === w[0] && !/(.)\1\1/.test(v) && v.length >= Math.max(3, w.length - 2));
}

// A misspelling that drops or adds a letter changes the word's length, so the correct spelling could be picked (or ruled out) by being the
// longest or shortest card. Same-length errors (a swapped or wrong letter) carry no length information, so they are used first; when a word's
// reviewed list is short of them, the remaining wrong options are chosen so that longer and shorter errors balance each other out.
function lengthBalanced(shuffled, correct, count, seed) {
  const same = shuffled.filter(value => value.length === correct.length);
  const longer = shuffled.filter(value => value.length > correct.length);
  const shorter = shuffled.filter(value => value.length < correct.length);
  const picked = same.slice(0, count);
  let preferLonger = (picked.length + String(seed).length) % 2 === 0;
  while (picked.length < count && (longer.length || shorter.length)) {
    const from = (preferLonger && longer.length) || !shorter.length ? longer : shorter;
    picked.push(from.shift());
    preferLonger = !preferLonger;
  }
  return stable(picked, `${seed}:order`).slice(0, count);
}

// Wrong spellings for a word, plus where they came from: 'reviewed' when the word's own reviewed list supplies all of them,
// otherwise 'generated_safe' (plausible misspellings produced by rule; spelling is the one place generated options are allowed).
export function pickSpellingErrorsDetailed(item, surface, count = 3, seed = '') {
  const term = String(item?.term ?? '').trim();
  const target = String(surface ?? term).trim();
  const lower = target.toLocaleLowerCase('en');
  let pool = [];
  const authored = reviewedSpellingErrors(item);
  if (authored.length) {
    if (lower === term.toLocaleLowerCase('en')) pool = [...authored];
    else if (lower.startsWith(term.toLocaleLowerCase('en'))) pool = authored.map(error => error + lower.slice(term.length)); // reviewed error + same ending (avoid -> avoided)
  }
  pool = pool.filter(value => value.toLocaleLowerCase('en') !== lower);
  const reviewedCount = new Set(pool).size;
  if (pool.length < count) pool = [...pool, ...ruleBasedSpellingErrors(target).filter(value => !pool.includes(value))];
  const errors = lengthBalanced(stable([...new Set(pool)], `${seed}:${lower}:spelling-errors`), lower, count, `${seed}:${lower}:spelling-length`);
  return { errors, source:reviewedCount >= count ? DISTRACTOR_SOURCE.REVIEWED : DISTRACTOR_SOURCE.GENERATED_SAFE };
}

export function pickSpellingErrors(item, surface, count = 3, seed = '') {
  return pickSpellingErrorsDetailed(item, surface, count, seed).errors;
}
