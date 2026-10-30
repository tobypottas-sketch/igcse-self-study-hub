// Multi-slot Mastery tasks (Precision & Use "Upgrade the Passage", Word Families "Use the Whole Family") ask the learner for several typed
// answers in one item. Each slot should add NEW evidence, so two slots must not expect the same answer, nor two trivial inflections of the
// same word. This module classifies a pair of expected answers from the unit's own metadata (headword, authored grammarForms, authored
// word-family strings). It is deliberately not a stemmer: a regular -s/-es/-d/-ed/-ing/-ies variant is only recognised when it is a variant of a
// KNOWN headword of the unit, never of an arbitrary word.
//
//   exact       identical strings
//   normalised  identical after case / punctuation / whitespace
//   inflection  the same headword in a different grammatical form (compete / competed, player / players, can afford / cannot afford)
//   family      the same word family, different derived word (compete / competition) - acceptable only for a word-family task
//   distinct    anything else
export const SLOT_RELATION = Object.freeze({ EXACT:'exact', NORMALISED:'normalised', INFLECTION:'inflection', FAMILY:'family', DISTINCT:'distinct' });

const text = value => String(value ?? '').trim();
const array = value => Array.isArray(value) ? value : [];
export function normaliseAnswer(value) {
  return text(value).toLocaleLowerCase('en').normalize('NFKC').replace(/[’‘`]/g, "'").replace(/[^\p{L}\p{N}'\s-]+/gu, ' ').replace(/[-]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function regularInflections(headword) {
  const w = headword, out = new Set([w, `${w}s`, `${w}es`, `${w}d`, `${w}ed`, `${w}ing`]);
  if (/e$/.test(w)) { out.add(`${w.slice(0, -1)}ing`); }
  if (/y$/.test(w) && !/[aeiou]y$/.test(w)) { out.add(`${w.slice(0, -1)}ies`); out.add(`${w.slice(0, -1)}ied`); }
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(w)) { out.add(`${w}${w.slice(-1)}ed`); out.add(`${w}${w.slice(-1)}ing`); }
  return out;
}
// Index of the unit's own words. Every item contributes "forms of one word": its headword (plus authored grammarForms and regular variants),
// and each authored word-family member (plus its regular variants). Two answers made of forms of the SAME word are inflections of each
// other; two answers made of different words of the same item's family are family members.
const indexCache = new WeakMap();
export function lexemeIndex(items) {
  const list = array(items);
  if (indexCache.has(list)) return indexCache.get(list);
  const entries = [];
  for (const item of list) {
    const id = text(item?.vocabularyId), head = normaliseAnswer(item?.term);
    if (!id || !head) continue;
    const headForms = new Set(regularInflections(head));
    for (const sense of array(item?.senses)) for (const form of Object.values(sense?.grammarForms && typeof sense.grammarForms === 'object' ? sense.grammarForms : {})) headForms.add(normaliseAnswer(form));
    entries.push({ id, key:`${id}|${head}`, forms:headForms });
    const members = new Set(array(item?.wordFamily).map(normaliseAnswer));
    for (const sense of array(item?.senses)) for (const row of array(sense?.wordFamilyForms)) if (row?.form) members.add(normaliseAnswer(row.form));
    // Shortest first, so "avoidances" joins the class of "avoidance" instead of becoming a second family member.
    const own = [];
    for (const member of [...members].filter(member => member && !headForms.has(member)).sort((a, b) => a.length - b.length)) {
      const existing = own.find(entry => entry.forms.has(member));
      if (existing) existing.forms.add(member); else own.push({ id, key:`${id}|${member}`, forms:new Set(regularInflections(member)) });
    }
    entries.push(...own);
  }
  indexCache.set(list, entries);
  return entries;
}
const hasPhrase = (answer, phrase) => phrase && (` ${answer} `).includes(` ${phrase} `);
function lexemesOf(answer, index) {
  const keys = new Set(), ids = new Set();
  for (const entry of index) if ([...entry.forms].some(form => hasPhrase(answer, form))) { keys.add(entry.key); ids.add(entry.id); }
  return { keys, ids };
}
const sameSet = (a, b) => a.size > 0 && a.size === b.size && [...a].every(value => b.has(value));
const overlaps = (a, b) => [...a].some(value => b.has(value));

// Relation of two expected answers (single strings).
export function relateAnswers(first, second, index = []) {
  const a = text(first), b = text(second);
  if (a === b) return SLOT_RELATION.EXACT;
  const na = normaliseAnswer(a), nb = normaliseAnswer(b);
  if (na === nb) return SLOT_RELATION.NORMALISED;
  const la = lexemesOf(na, index), lb = lexemesOf(nb, index);
  if (sameSet(la.keys, lb.keys)) return SLOT_RELATION.INFLECTION;
  if (overlaps(la.ids, lb.ids)) return SLOT_RELATION.FAMILY;
  return SLOT_RELATION.DISTINCT;
}
const ORDER = [SLOT_RELATION.EXACT, SLOT_RELATION.NORMALISED, SLOT_RELATION.INFLECTION, SLOT_RELATION.FAMILY, SLOT_RELATION.DISTINCT];
// Relation of two SLOTS, each a list of accepted answers: the closest relation of any accepted answer in one to any in the other, because
// one typed answer that satisfies both slots is exactly the weakness being avoided.
export function relateSlots(firstAnswers, secondAnswers, index = []) {
  let best = SLOT_RELATION.DISTINCT;
  for (const a of array(firstAnswers)) for (const b of array(secondAnswers)) {
    const relation = relateAnswers(a, b, index);
    if (ORDER.indexOf(relation) < ORDER.indexOf(best)) best = relation;
  }
  return best;
}
// Slot sets are acceptable when every pair is at least `allow` apart. Normal Mastery: only distinct (or a different derived word of the
// family is NOT allowed either). Word-family task: derivational family members are allowed, inflections and duplicates never.
export function slotsAreDistinct(slotAnswerLists, index = [], { allowFamily = false } = {}) {
  for (let i = 0; i < slotAnswerLists.length; i += 1) for (let j = i + 1; j < slotAnswerLists.length; j += 1) {
    const relation = relateSlots(slotAnswerLists[i], slotAnswerLists[j], index);
    if (relation === SLOT_RELATION.DISTINCT) continue;
    if (relation === SLOT_RELATION.FAMILY && allowFamily) continue;
    return false;
  }
  return true;
}
