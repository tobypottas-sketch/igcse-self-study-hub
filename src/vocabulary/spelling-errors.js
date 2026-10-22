// Plausible spelling errors for "choose the correct spelling" questions. A good distractor is something a learner
// might really write (dropped or doubled consonants, ie/ei swaps, vowel confusion in unstressed syllables); never a
// mechanical mutation such as a doubled first letter or two swapped final letters, and never another real word.
import { languageBankForItem } from './language-bank.js';

// Reviewed errors for Unit 1 words that have no language-bank entry yet.
export const SUPPLEMENT_SPELLING_ERRORS = Object.freeze({
  struggle:['strugle','struggel','strugel','struggal','strugal','struggol'],
  minimum:['minimun','minumum','minimom','minimium','miniumum','minnimum'],
  championship:['champianship','champeonship','championshp','championsip','champonship','championchip'],
  competitor:['competator','competiter','competetor','compeditor','competitar','compettitor'],
  relatively:['relativly','relatevely','relativelly','realatively','relativley','relitively'],
  patience:['patients','pasience','patiense','paitence','patiance','pateince'],
  atmosphere:['atmosfere','atmospher','atmoshpere','athmosphere','atmosphear','atmosphire'],
  incredible:['incredable','increadible','incredibal','incridible','incrediable','increedible'],
  criteria:['criterea','critiria','criteriea','cryteria','critera','criterria'],
  historic:['historick','histroic','hystoric','historec','historik','historyc'],
  selection:['selecsion','selektion','selction','selecttion','sellection','selectian'],
  produce:['prodouce','produse','prodduce','prodyce','produsse','producee'],
  craftspeople:['craftspeeple','craftpeople','craftspeaple','craftspeepal','craftspeoples','craftsepople'],
  significant:['signifacant','significent','signficant','signifficant','significat','sinificant'],
  expansion:['expantion','expanshion','expension','expanssion','expandsion','expasion'],
  reputation:['repution','reputaton','reputasion','repetation','reputashun','reputtation'],
  reasonable:['reasonible','resonable','reasonnable','reasonabal','reasenable','reasonble'],
  antiques:['antikes','antiqes','antiqus','anteques','antiquies','antikeys']
});

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

export function pickSpellingErrors(item, surface, count = 3, seed = '') {
  const term = String(item?.term ?? '').trim();
  const target = String(surface ?? term).trim();
  const lower = target.toLocaleLowerCase('en');
  let pool = [];
  const bank = languageBankForItem(item);
  const authored = (Array.isArray(bank?.spellingErrors) && bank.spellingErrors.length ? bank.spellingErrors : SUPPLEMENT_SPELLING_ERRORS[term]) ?? [];
  if (authored.length) {
    if (lower === term.toLocaleLowerCase('en')) pool = [...authored];
    else if (lower.startsWith(term.toLocaleLowerCase('en'))) pool = authored.map(error => error + lower.slice(term.length)); // reviewed error + same ending (avoid -> avoided)
  }
  pool = pool.filter(value => value.toLocaleLowerCase('en') !== lower);
  if (pool.length < count) pool = [...pool, ...ruleBasedSpellingErrors(target).filter(value => !pool.includes(value))];
  return stable([...new Set(pool)], `${seed}:${lower}:spelling-errors`).slice(0, count);
}
