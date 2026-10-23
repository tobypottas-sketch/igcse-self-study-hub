import { deriveContentSeed } from './mission-seed.js';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES, derivePathwayPlacement } from './pathway-model.js';
import { currentPathwayStage, isPathwayStageUnlocked } from './pathway-progress.js';
import { planPathwayQuestion } from './pathway-planner.js';
import { coverageServes } from './pathway-coverage-store.js';

const STAGE_IDS = PATHWAY_STAGES.map(stage => stage.id);
const STAGE_INDEX = Object.freeze(Object.fromEntries(STAGE_IDS.map((id,index) => [id,index])));

function contextual(row = {}) { return row?.contextualEvidence ?? row?.contextual_evidence ?? {}; }
function pathwayProgress(row = {}, pathwayId) { return contextual(row)?.pathwayProgress?.[pathwayId] ?? contextual(row)?.pathway_progress?.[pathwayId] ?? null; }
function legacyMastery(unitMastery = {}, globalMastery = {}) {
  const detail = contextual(unitMastery);
  const unitStrands = detail?.strandEvidence ?? detail?.strand_evidence ?? {};
  const globalStrands = globalMastery?.strandEvidence ?? globalMastery?.strand_evidence ?? {};
  return {
    ...globalMastery,
    status:unitMastery?.status ?? globalMastery?.status ?? 'new',
    strandEvidence:Object.keys(unitStrands).length ? unitStrands : globalStrands,
    unscaffoldedProductions:detail?.unscaffoldedProductions ?? globalMastery?.unscaffoldedProductions ?? 0
  };
}
function hashSeed(seed) { let hash=2166136261; for (const char of String(seed ?? '')) { hash ^= char.charCodeAt(0); hash=Math.imul(hash,16777619)>>>0; } return hash>>>0; }
function rotate(values, seed) { if (values.length < 2) return values; const offset=hashSeed(seed)%values.length; return [...values.slice(offset),...values.slice(0,offset)]; }

export function unlockedReviewStages({ pathwayId, unitMastery = {}, globalMastery = {} } = {}) {
  const progress = pathwayProgress(unitMastery,pathwayId);
  if (progress) return STAGE_IDS.filter(stageId => isPathwayStageUnlocked(progress,stageId));
  const placement = derivePathwayPlacement({ pathwayId, legacyMastery:legacyMastery(unitMastery,globalMastery) });
  const index = STAGE_INDEX[placement] ?? 0;
  return STAGE_IDS.slice(0,index + 1);
}

export function planMixedReviewQuestion({
  content,
  target,
  unitMastery = {},
  globalMastery = {},
  recentActivities = [],
  usedContentIds = [],
  seed = '',
  missionSeed = null,
  slot = 0,
  optionNonce = '',
  avoidTileOrders = []
} = {}) {
  // Mission-scoped variation (server-issued missionSeed): the pathway/stage rotation and the content choices all derive from it.
  if (missionSeed) seed = deriveContentSeed({ missionSeed, occurrenceId:target?.occurrenceId ?? target?.occurrence_id, slot, activityType:'_mixed' });
  const unit = unitMastery?.[target?.occurrenceId] ?? unitMastery?.[target?.occurrence_id] ?? {};
  const global = globalMastery?.[target?.vocabularyId] ?? globalMastery?.[target?.vocabulary_id] ?? {};
  const pathways = rotate(VOCABULARY_PATHWAYS,`${seed}:pathways`);
  let lastError = null;
  const unitNumber = target?.unitNumber ?? target?.unit_number ?? null;
  for (const pathway of pathways) {
    // Mixed Practice draws only from live pathways and only for words the pathway can carry. No silent fallback to a locked one.
    if (!coverageServes(unitNumber, pathway.id, target?.occurrenceId ?? target?.occurrence_id)) continue;
    const stages = unlockedReviewStages({ pathwayId:pathway.id, unitMastery:unit, globalMastery:global });
    const higherFirst = [...stages].sort((a,b) => (STAGE_INDEX[b] ?? 0) - (STAGE_INDEX[a] ?? 0));
    for (const stageId of rotate(higherFirst,`${seed}:${pathway.id}`)) {
      try {
        return planPathwayQuestion({
          pathwayId:pathway.id,
          stageId,
          content,
          target,
          mastery:global,
          recentActivities,
          usedContentIds,
          supportState:null,
          seed:`${seed}:${pathway.id}:${stageId}`,
          optionNonce,
          avoidTileOrders,
          ...(missionSeed ? { missionSeed, slot } : {})
        });
      } catch (error) {
        lastError = error;
      }
    }
  }
  throw new Error(`No suitable unlocked vocabulary review activity is available.${lastError ? ` ${lastError.message ?? ''}` : ''}`.trim());
}
