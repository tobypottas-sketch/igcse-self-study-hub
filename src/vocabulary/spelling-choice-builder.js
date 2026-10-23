import { shuffleAnswerOptions } from './answer-option-shuffle.js';
import { activityDefinition, isActivityLive } from './activity-catalogue.js';
import { grammaticalBlankCandidates } from './foundational-activity-builder.js';
import { pickSpellingErrorsDetailed } from './spelling-errors.js';

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
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
function blankableContext({ item, occurrence, contexts, usedContentIds = [], seed = '' }) {
  const candidates = grammaticalBlankCandidates({ item, occurrence, contexts });
  const used = new Set(array(usedContentIds).map(String));
  const unused = candidates.filter(candidate => !used.has(String(candidate.context.contextId)));
  return shuffle(unused.length ? unused : candidates,`${seed}:spelling-choice-context`)[0] ?? null;
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

export function buildSpellingChoiceActivity({ occurrence, item, contexts = [], usedContentIds = [], seed = '', optionNonce = '' } = {}) {
  if (!occurrence || !item) throw new Error('Vocabulary occurrence and item are required.');
  const definition = activityDefinition('spelling_choice');
  if (!definition || !isActivityLive(definition.id)) throw new Error('Spelling recognition is unavailable.');
  const term = text(item.term);
  const meaning = definitionFor(item,occurrence);
  const spelled = pickSpellingErrorsDetailed(item,term,3,seed);
  const wrong = spelled.errors;
  if (!term || !meaning || wrong.length < 3) throw new Error('Spelling recognition requires three plausible spelling alternatives.');
  const options = shuffleAnswerOptions([term,...wrong],`${seed}:spelling-choice-options`,optionNonce);
  const stableItemId = itemContentId({item,occurrence});
  const used = new Set(array(usedContentIds).map(String));

  const picked = used.has(stableItemId) ? blankableContext({item,occurrence,contexts,usedContentIds,seed}) : null;
  if (!picked) {
    return base({
      definition,
      occurrence,
      contentId:stableItemId,
      contentSource:'item',
      prompt:`Which is the correct spelling of the word meaning “${meaning}”?`,
      acceptedAnswer:term,
      options,
      extra:{ distractorSource:spelled.source }
    });
  }

  const { context, sourceText, surface } = picked;
  const surfaceSpelled = pickSpellingErrorsDetailed(item,surface,3,seed);
  const surfaceWrong = surfaceSpelled.errors;
  if (surfaceWrong.length < 3) throw new Error('Spelling recognition requires three plausible spelling alternatives.');
  return base({
    definition,
    occurrence,
    contentId:context.contextId,
    contentSource:'context',
    prompt:'Which spelling correctly completes this sentence?',
    acceptedAnswer:surface,
    options:shuffleAnswerOptions([surface,...surfaceWrong],`${seed}:spelling-choice-options:${context.contextId}`,optionNonce),
    extra:{ sourceText, contextId:context.contextId, distractorSource:surfaceSpelled.source }
  });
}
