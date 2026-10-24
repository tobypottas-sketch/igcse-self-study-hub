// Meaning → Apply uses a short curated situation instead of a dictionary-style definition: the student has to read the
// situation and apply what the word means, they are not matching a word to its definition again.
//
// A usable situation is one of the target's own curated contexts of a situation type that never shows the target word
// (or any of its curated forms), so the situation cannot give the answer away.

export const APPLICATION_SITUATION_TYPES = Object.freeze(['production_context', 'paraphrase_context']);

function text(value) { return String(value ?? '').trim(); }
function array(value) { return Array.isArray(value) ? value : []; }
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function targetForms(item, occurrence) {
  const sense = array(item?.senses).find(row => row?.senseId === occurrence?.senseId) ?? array(item?.senses)[0] ?? {};
  const forms = Object.values(sense?.grammarForms && typeof sense.grammarForms === 'object' ? sense.grammarForms : {});
  return [item?.term, ...forms, ...array(item?.wordFamily)].map(value => text(value).toLocaleLowerCase('en')).filter(value => value.length > 1);
}

export function showsTargetWord(situation, item, occurrence) {
  const lowered = text(situation).toLocaleLowerCase('en');
  const term = text(item?.term).toLocaleLowerCase('en');
  if (term && lowered.includes(term)) return true;
  return targetForms(item, occurrence).some(form => new RegExp(`(^|[^a-z])${escapeRegExp(form)}($|[^a-z])`).test(lowered));
}

// Usable situations for a target, in preference order (a fresh situation first, the paraphrase of the original sentence last).
export function applicationSituations(contexts, item, occurrence) {
  return array(contexts)
    .filter(context => APPLICATION_SITUATION_TYPES.includes(context?.type) && text(context?.text) && !showsTargetWord(context.text, item, occurrence))
    .sort((a, b) => APPLICATION_SITUATION_TYPES.indexOf(a.type) - APPLICATION_SITUATION_TYPES.indexOf(b.type));
}
export function hasApplicationSituation(contexts, item, occurrence) {
  return applicationSituations(contexts, item, occurrence).length > 0;
}
