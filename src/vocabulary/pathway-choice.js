// Practice-type choice inside a pathway. Pure logic (no DOM): which words can practise a chosen activity family right now, and what
// the picker should show. Progression is never bypassed: a word can practise a family only at a stage it has already unlocked (its
// current stage or an earlier, cleared one), and every attempt is still recorded against that real stage by the existing machinery.
import { PATHWAY_STAGES } from './pathway-model.js';
import { buildWordPathwayStates } from './pathway-view-model.js';
import { planPathwayQuestion } from './pathway-planner.js';
import { activityFamilies } from './activity-families.js';
import { registeredPathwayCoverage } from './pathway-coverage-store.js';

export const FULL_MISSION = 10;
export const MIN_SHORT_MISSION = 4;
const STAGE_IDS = PATHWAY_STAGES.map(stage => stage.id);
const idx = stageId => STAGE_IDS.indexOf(stageId);

// The family's stage for this word: the highest stage of the family the word has unlocked, or null when none is unlocked yet.
export function familyStageForWord(family, wordState) {
  const wordIndex = wordState?.mastered ? STAGE_IDS.length - 1 : idx(wordState?.currentStage ?? 'recognise');
  let chosen = null;
  for (const stageId of family.stageIds) if (idx(stageId) <= wordIndex) chosen = stageId;
  return chosen;
}

function coverageAllows(content, pathwayId, target) {
  const unit = target?.unitNumber ?? target?.unit_number ?? content?.occurrences?.[0]?.unitNumber ?? content?.occurrences?.[0]?.unit_number ?? null;
  const coverage = unit == null ? null : registeredPathwayCoverage(unit)?.[pathwayId] ?? null;
  if (!coverage) return true;
  if (coverage.available === false) return false;
  return new Set((coverage.occurrenceIds ?? []).map(String)).has(String(target?.occurrenceId ?? target?.occurrence_id));
}

// Words that can practise `family` now, each with the stage its attempts will be recorded against.
export function familyTargets({ pathwayId, family, content, unitMastery = {}, globalMastery = {}, seed = '' } = {}) {
  const found = [];
  for (const target of content?.occurrences ?? []) {
    if (!coverageAllows(content, pathwayId, target)) continue;
    const word = buildWordPathwayStates({ occurrence: target, unitMastery, globalMastery })?.[pathwayId];
    const stageId = familyStageForWord(family, word);
    if (!stageId) continue;
    try {
      planPathwayQuestion({
        pathwayId, stageId, content, target, mastery: globalMastery[target?.vocabularyId] ?? {},
        allowedTypes: family.types, seed: `${seed}:${target?.occurrenceId ?? ''}`
      });
      found.push({ target, stageId });
    } catch { /* this word cannot build the chosen activity: it is skipped, never swapped for another format */ }
  }
  return found;
}

// Picker rows for a pathway: every family, with how many words can play it and a plain-language status.
export function pathwayPracticeOptions({ pathwayId, content, unitMastery, globalMastery, seed = '' } = {}) {
  return activityFamilies(pathwayId).map(family => {
    const targets = familyTargets({ pathwayId, family, content, unitMastery, globalMastery, seed });
    const count = targets.length;
    const status = count >= FULL_MISSION ? 'ready' : count >= MIN_SHORT_MISSION ? 'short' : 'locked';
    const firstStage = family.stageIds[0];
    const locked = status === 'locked';
    const anyUnlocked = (content?.occurrences ?? []).some(target => familyStageForWord(family, buildWordPathwayStates({ occurrence: target, unitMastery, globalMastery })?.[pathwayId]));
    const before = idx(firstStage) > 0 ? stageLabel(STAGE_IDS[idx(firstStage) - 1]) : null;
    const hint = !locked ? (status === 'short' ? `Short set: ${count} words` : null)
      : anyUnlocked ? 'Not enough words for this yet' : `Unlocks after you clear ${before ?? 'earlier stages'}`;
    return { family, count, status, hint, targets };
  });
}
function stageLabel(stageId) { return PATHWAY_STAGES.find(stage => stage.id === stageId)?.label ?? 'earlier stages'; }

// Last choice per pathway: browser storage only (a convenience, never required, never sent anywhere).
const KEY = pathwayId => `vocab.practiceChoice.${pathwayId}`;
export function loadLastChoice(pathwayId, storage = globalThis.localStorage) {
  try { return storage?.getItem(KEY(pathwayId)) || null; } catch { return null; }
}
export function saveLastChoice(pathwayId, familyId, storage = globalThis.localStorage) {
  try { if (familyId) storage?.setItem(KEY(pathwayId), familyId); else storage?.removeItem(KEY(pathwayId)); } catch { /* storage may be unavailable */ }
}
