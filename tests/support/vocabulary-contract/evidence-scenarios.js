// Synthetic attempt sequences for the evidence golden test. No student data: every value is invented.
import { applyEvidence, nextReviewAt, MASTERY_THRESHOLDS } from '../../../supabase/functions/_shared/vocabulary-engine.js';
import { freshPathwayProgress, applyPathwayAttempt, currentPathwayStage } from '../../../supabase/functions/_shared/vocabulary-pathway-progress.js';

const T0 = new Date('2026-01-05T09:00:00.000Z');
const day = n => new Date(T0.getTime() + n * 86400000);
const ev = (o = {}) => ({ strand: 'meaning', strands: ['meaning'], correct: true, evidenceStrength: 'medium', supportLevel: 'none', productive: false, repeatedGuess: false, firstAttempt: true, retryUsed: false, recoveredLater: false, contextId: null, questionType: 'definition_to_word', activityType: 'definition_to_word', review: false, ...o });
const prod = (i, o = {}) => ev({ strand: 'production', strands: ['production'], productive: true, evidenceStrength: 'strong', contextId: `ctx-${i}`, questionType: 'gap_fill_type', activityType: ['type_missing_word', 'type_word_from_definition', 'gloss_in_context_type'][i % 3], ...o });

export const MASTERY_SCENARIOS = {
  'clean_receptive_run': [ev(), ev(), ev(), ev(), ev()],
  'early_failures_then_recovery': [ev({ correct: false }), ev({ correct: false }), ev({ firstAttempt: false, retryUsed: true }), ev(), ev()],
  'assisted_successes': [ev({ supportLevel: 'light' }), ev({ supportLevel: 'light' }), ev({ supportLevel: 'major' }), ev()],
  'productive_with_distinct_contexts': [ev(), ev(), prod(0), prod(1), prod(2), prod(3)],
  'productive_same_context_repeated': [ev(), ev(), prod(0), prod(0), prod(0), prod(0)],
  'repeated_guess': [ev({ repeatedGuess: true }), ev({ repeatedGuess: true, correct: false }), ev()],
  'two_review_failures': [ev(), ev(), prod(0), prod(1), prod(2), ev({ review: true, correct: false }), ev({ review: true, correct: false })]
};
export function runMastery(steps) {
  let m; const trail = [];
  steps.forEach((s, i) => { m = applyEvidence(m ?? {}, s, day(i * 5)); trail.push(JSON.parse(JSON.stringify(m))); });
  return trail;
}

const att = (stageId, o = {}) => ({ stageId, servedStageId: stageId, correct: true, firstAttempt: true, retryUsed: false, supportLevel: 'none', contentId: "c-default", contextId: null, operation: 'op', activityType: 'op', contextSensitive: false, ...o });
const seq = (stageId, n, f) => Array.from({ length: n }, (_, i) => att(stageId, { contentId: `${stageId}-content-${i}`, operation: `${stageId}-op-${i % 2}`, activityType: `${stageId}-op-${i % 2}`, ...f(i) }));
export const PATHWAY_SCENARIOS = {
  recognise_two_clean_two_content: seq('recognise', 2, () => ({})),
  recognise_two_clean_same_content: seq('recognise', 2, () => ({ contentId: 'same' })),
  recognise_one_clean_only: seq('recognise', 1, () => ({})),
  recognise_assisted: seq('recognise', 3, () => ({ supportLevel: 'light' })),
  recognise_with_failure: [...seq('recognise', 1, () => ({})), att('recognise', { correct: false, contentId: 'f' }), ...seq('recognise', 2, i => ({ contentId: `r${i}` }))]
};
// Later stages need earlier stages complete: build prerequisite state with completedStages.
const ORDER = ['recognise', 'match', 'apply', 'recall', 'mastery'];
export const STAGE_THRESHOLD_SCENARIOS = {};
for (const stage of ORDER.slice(1)) {
  const done = ORDER.slice(0, ORDER.indexOf(stage));
  STAGE_THRESHOLD_SCENARIOS[`${stage}_one`] = { completed: done, attempts: seq(stage, 1, () => ({})) };
  STAGE_THRESHOLD_SCENARIOS[`${stage}_two`] = { completed: done, attempts: seq(stage, 2, () => ({})) };
  STAGE_THRESHOLD_SCENARIOS[`${stage}_three`] = { completed: done, attempts: seq(stage, 3, () => ({})) };
  STAGE_THRESHOLD_SCENARIOS[`${stage}_four_ctx`] = { completed: done, attempts: seq(stage, 4, i => ({ contextId: `ctx-${i}`, contextSensitive: true })) };
}
const pick = p => ({ completed: p.stages ? Object.fromEntries(Object.entries(p.stages).map(([k, v]) => [k, v.completed])) : null, current: currentPathwayStage(p), stages: Object.fromEntries(Object.entries(p.stages ?? {}).map(([k, v]) => [k, { completed: v.completed, needsPractice: v.needsPractice, successes: v.successes, cleanSuccesses: v.cleanSuccesses, cleanUnassistedSuccesses: v.cleanUnassistedSuccesses, failures: v.failures, contentIds: v.contentIds, contextIds: v.contextIds, promptKeys: v.promptKeys, operationIds: v.operationIds, distinctPromptCount: v.distinctPromptCount, distinctOperationCount: v.distinctOperationCount }])) });
export function runPathway(attempts, completed = []) { let p = freshPathwayProgress({ completedStages: completed }); for (const a of attempts) p = applyPathwayAttempt(p, a); return pick(p); }

export function buildSnapshot() {
  const snap = { thresholds: { MASTERY_THRESHOLDS, reviewDays: [0,1,2,3,4,5,6,9].map(stage => (new Date(nextReviewAt({ reviewStage: stage }, T0)) - T0) / 86400000), failureReviewDays: (new Date(nextReviewAt({ reviewStage: 3, reviewFailureCount: 1 }, T0)) - T0) / 86400000 }, mastery: {}, pathway: {}, stageThresholds: {} };
  for (const [k, v] of Object.entries(MASTERY_SCENARIOS)) snap.mastery[k] = runMastery(v);
  for (const [k, v] of Object.entries(PATHWAY_SCENARIOS)) snap.pathway[k] = runPathway(v);
  for (const [k, v] of Object.entries(STAGE_THRESHOLD_SCENARIOS)) snap.stageThresholds[k] = runPathway(v.attempts, v.completed);
  return JSON.parse(JSON.stringify(snap));
}
