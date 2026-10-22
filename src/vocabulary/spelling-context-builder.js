import { activityDefinition, isActivityLive } from './activity-catalogue.js';
import { grammaticalBlankCandidates } from './foundational-activity-builder.js';

function text(value) { return String(value ?? '').trim(); }
function array(value) { return Array.isArray(value) ? value : []; }
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
function escapeRegExp(value) { return value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }

export function buildSpellInContextActivity({ occurrence, item, contexts = [], usedContentIds = [], seed = '' } = {}) {
  if (!occurrence || !item) throw new Error('Vocabulary occurrence and item are required.');
  const definition = activityDefinition('spell_in_context');
  if (!definition || !isActivityLive(definition.id)) throw new Error('Spelling Mastery is unavailable.');

  const candidates = grammaticalBlankCandidates({ item, occurrence, contexts });
  if (!candidates.length) throw new Error('No curated context is available for Spelling Mastery.');
  const used = new Set(array(usedContentIds).map(String));
  const unused = candidates.filter(candidate => !used.has(String(candidate.context.contextId ?? '')));
  const pool = unused.length ? unused : candidates;
  const { context, sourceText, surface } = shuffle(pool,`${seed}:spell-in-context`)[0];
  if (!surface || !sourceText.includes('____')) throw new Error('Spelling Mastery requires a valid curated sentence cue.');

  return {
    activityId:`${occurrence.occurrenceId}:${context.contextId}:${definition.id}`,
    type:definition.id,
    responseMode:definition.responseMode,
    skillFamily:definition.skillFamily,
    family:definition.family,
    strands:[...definition.strands],
    evidenceStrength:definition.evidenceStrength,
    productive:definition.productive,
    vocabularyId:occurrence.vocabularyId,
    occurrenceId:occurrence.occurrenceId,
    contentId:context.contextId,
    contentSource:'context',
    prompt:'Complete the sentence by spelling the missing word.',
    markingReference:{ acceptedAnswers:[surface] },
    sourceText,
    contextId:context.contextId,
    primaryEvidenceTargetId:item.vocabularyId
  };
}
