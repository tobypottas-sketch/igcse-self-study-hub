// A reproducible sample of generated Unit 1 questions for the live pathways (Paraphrasing is locked for Unit 1).
import { content } from './journey-sim.js';
import { planPathwayQuestion } from '../../../src/vocabulary/pathway-planner.js';

export const LIVE_PATHWAYS = ['meaning', 'context', 'word_families', 'precision_use', 'spelling_recall'];
export const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
export const SEEDS = [0, 1, 2];

export function buildQuestion({ pathwayId, stageId, target, k = 0, nonce = `n${k}`, seed = null, missionSeed = null, used = [] }) {
  const built = planPathwayQuestion({ pathwayId, stageId, content, target, mastery: {}, seed: seed ?? `${target.occurrenceId}:${k}:adaptive`, optionNonce: nonce, reviewPolicy: 'prefer', usedContentIds: used, ...(missionSeed ? { missionSeed, slot: k } : {}) });
  const q = built.question;
  return { pathwayId, stageId, k, occ: target.occurrenceId, term: content.itemsById[target.vocabularyId].term, type: q.type, responseMode: q.responseMode, contentId: q.contentId ?? null, contextId: q.contextId ?? null,
    prompt: q.prompt, sourceText: q.sourceText ?? null, options: q.options ?? null, matchCue: q.matchCue ?? null, matchOptions: q.matchOptions ?? null, pairs: q.pairs ?? null, tiles: q.tiles ?? null,
    answers: q.markingReference?.acceptedAnswers ?? [], distractorSource: q.distractorSource ?? null };
}

const caches = new Map();
// `seeds` widens the sample (Job 9 leakage analysis uses 12 variants per target so a heuristic's rate is not sampling noise).
export function bank(seeds = SEEDS) {
  const key = seeds.join(',');
  if (caches.has(key)) return caches.get(key);
  const questions = []; const unservable = [];
  for (const pathwayId of LIVE_PATHWAYS) for (const stageId of STAGES) for (const target of content.occurrences) for (const k of seeds) {
    try { questions.push(buildQuestion({ pathwayId, stageId, target, k })); } catch (error) { unservable.push({ pathwayId, stageId, occ: target.occurrenceId, k, reason: error.message }); }
  }
  const built = { questions, unservable };
  caches.set(key, built);
  return built;
}
export { content };
