import { activityDefinition, isActivityLive } from './activity-catalogue.js';

function text(value) { return String(value ?? '').trim(); }
function array(value) { return Array.isArray(value) ? value : []; }
function uniqueText(values) {
  const seen = new Set();
  const output = [];
  for (const value of values) {
    const candidate = text(value);
    const key = candidate.toLocaleLowerCase('en');
    if (!candidate || seen.has(key)) continue;
    seen.add(key);
    output.push(candidate);
  }
  return output;
}
function hashSeed(seed) {
  let hash = 2166136261;
  for (const char of String(seed ?? '')) { hash ^= char.charCodeAt(0); hash = Math.imul(hash,16777619) >>> 0; }
  return hash >>> 0;
}
function shuffle(values, seed) {
  const output = [...values];
  let state = hashSeed(seed) || 1;
  for (let index = output.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state,1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [output[index],output[swapIndex]] = [output[swapIndex],output[index]];
  }
  return output;
}
function senseFor(item, occurrence = {}) {
  return array(item?.senses).find(sense => sense?.senseId === occurrence?.senseId) ?? array(item?.senses)[0] ?? {};
}
function definitionFor(item, occurrence = {}) {
  const sense = senseFor(item,occurrence);
  return text(sense.meaning) || text(item?.coreMeaning) || text(array(sense.acceptedParaphrases)[0]);
}
function itemContentId({ item, occurrence }) {
  return `item:${item.vocabularyId}:${occurrence?.senseId ?? senseFor(item,occurrence)?.senseId ?? 'sense'}`;
}
function spellingVariants(term) {
  const chars = Array.from(term);
  const variants = [];
  if (chars.length > 1) {
    const swap = [...chars];
    [swap[chars.length - 2],swap[chars.length - 1]] = [swap[chars.length - 1],swap[chars.length - 2]];
    variants.push(swap.join(''));
  }
  if (chars.length > 2) variants.push(chars.filter((_,index) => index !== Math.floor(chars.length / 2)).join(''));
  if (chars.length) variants.push(`${chars[0]}${chars[0]}${chars.slice(1).join('')}`);
  const vowelIndex = chars.findIndex(char => /[aeiou]/i.test(char));
  if (vowelIndex >= 0) {
    const changed = [...chars];
    changed[vowelIndex] = changed[vowelIndex].toLowerCase() === 'e' ? 'a' : 'e';
    variants.push(changed.join(''));
  }
  variants.push(`${term}e`);
  return uniqueText(variants).filter(value => value.toLocaleLowerCase('en') !== term.toLocaleLowerCase('en')).slice(0,3);
}
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function blankableContext({ item, contexts, usedContentIds = [], seed = '' }) {
  const term = text(item?.term).toLocaleLowerCase('en');
  const used = new Set(array(usedContentIds).map(String));
  const candidates = array(contexts).filter(context => {
    const source = text(context?.text);
    const rewrite = text(context?.targetRewrite);
    const accepted = array(context?.acceptedAnswers).map(value => text(value).toLocaleLowerCase('en'));
    return !used.has(String(context?.contextId ?? ''))
      && ['paraphrase_context','production_context'].includes(context?.type)
      && source
      && rewrite
      && source.toLocaleLowerCase('en').includes(rewrite.toLocaleLowerCase('en'))
      && accepted.includes(term);
  });
  if (!candidates.length) throw new Error('No unused curated sentence cue is available for Spelling Recognise.');
  return shuffle(candidates,`${seed}:spelling-choice-context`)[0];
}
function base({ definition, occurrence, contentId, contentSource, prompt, acceptedAnswer, options, extra = {} }) {
  return {
    activityId:`${occurrence?.occurrenceId ?? 'unit'}:${contentId}:${definition.id}`,
    type:definition.id,
    responseMode:definition.responseMode,
    skillFamily:definition.skillFamily,
    family:definition.family,
    strands:[...definition.strands],
    evidenceStrength:definition.evidenceStrength,
    productive:definition.productive,
    vocabularyId:occurrence?.vocabularyId ?? null,
    occurrenceId:occurrence?.occurrenceId ?? null,
    contentId,
    contentSource,
    prompt,
    markingReference:{ acceptedAnswers:[acceptedAnswer] },
    options,
    primaryEvidenceTargetId:occurrence?.vocabularyId ?? null,
    ...extra
  };
}

export function buildSpellingChoiceActivity({ occurrence, item, contexts = [], usedContentIds = [], seed = '' } = {}) {
  if (!occurrence || !item) throw new Error('Vocabulary occurrence and item are required.');
  const definition = activityDefinition('spelling_choice');
  if (!definition || !isActivityLive(definition.id)) throw new Error('Spelling recognition is unavailable.');
  const term = text(item.term);
  const meaning = definitionFor(item,occurrence);
  const wrong = spellingVariants(term);
  if (!term || !meaning || wrong.length < 3) throw new Error('Spelling recognition requires three plausible spelling alternatives.');
  const options = shuffle([term,...wrong],`${seed}:spelling-choice-options`);
  const stableItemId = itemContentId({item,occurrence});
  const used = new Set(array(usedContentIds).map(String));

  if (!used.has(stableItemId)) {
    return base({
      definition,
      occurrence,
      contentId:stableItemId,
      contentSource:'item',
      prompt:`Which is the correct spelling of the word meaning “${meaning}”?`,
      acceptedAnswer:term,
      options
    });
  }

  const context = blankableContext({item,contexts,usedContentIds,seed});
  const sourceText = text(context.text).replace(new RegExp(escapeRegExp(text(context.targetRewrite)),'i'),'____');
  if (!sourceText.includes('____')) throw new Error('Curated spelling sentence could not form a valid blank.');
  return base({
    definition,
    occurrence,
    contentId:context.contextId,
    contentSource:'context',
    prompt:'Which spelling correctly completes this sentence?',
    acceptedAnswer:term,
    options,
    extra:{ sourceText, contextId:context.contextId }
  });
}
