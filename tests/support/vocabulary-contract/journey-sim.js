// Learner-journey simulation for the vocabulary regression suite. Synthetic learners only: no student data.
// It mirrors src/vocabulary/app.js startPathwaySession / buildNextForTarget using the SAME production modules (planner,
// view-model, shared server progress/evidence), because app.js itself is DOM-coupled. tests/...-04 guards the mirror against drift.
import { webcrypto } from 'node:crypto';
import { orderMissionTargets, derivePresentationNonce } from '../../../src/vocabulary/mission-seed.js';
import unit from '../../../content/vocabulary/units/unit-01.js';
import { releasePlannerContent } from '../../../content/vocabulary/readiness-report.js';
import { planPathwayQuestion, eligibleTargetsForPathwayStage } from '../../../src/vocabulary/pathway-planner.js';
import { selectEligiblePriorityTargets } from '../../../src/vocabulary/session-targets.js';
import { targetsForPathwayStage, buildUnitPathwayStates } from '../../../src/vocabulary/pathway-view-model.js';
import { applyEvidence } from '../../../supabase/functions/_shared/vocabulary-engine.js';
import { freshPathwayProgress, applyPathwayAttempt } from '../../../supabase/functions/_shared/vocabulary-pathway-progress.js';

export const content = releasePlannerContent(unit);
const freshMastery = () => ({ status: 'new', strandEvidence: { meaning: 0, recognition: 0, context: 0, paraphrasing: 0, production: 0 }, recentErrorCount: 0, recentErrorPattern: null, reviewDueAt: null, successfulProductions: 0, productionContextIds: [], productionActivityTypes: [], unscaffoldedProductions: 0, recoveryCount: 0, reviewStage: 0, reviewFailureCount: 0 });

export function newLearner(pathwayId, completedStages = []) {
  const unitMastery = {};
  for (const occ of content.occurrences) unitMastery[occ.occurrenceId] = { status: 'new', contextualEvidence: { pathwayProgress: { [pathwayId]: freshPathwayProgress({ completedStages }) } } };
  return { unitMastery, globalMastery: {}, used: new Map(), recent: new Map(), started: new Set() };
}

export function visibleState(pathwayId, learner) {
  return buildUnitPathwayStates({ occurrences: content.occurrences, unitMastery: learner.unitMastery, globalMastery: learner.globalMastery })[pathwayId];
}

// One mission exactly as the app builds it. `accuracy` is the chance each answer is a clean first-attempt success.
export function playMission(pathwayId, learner, rnd, accuracy, { record = true, optionNonce: fixedNonce = null, missionSeed = null } = {}) {
  const state = visibleState(pathwayId, learner);
  if (state.mastered) return { done: 'mastered' };
  const stageId = state.currentStage;
  const stageTargets = targetsForPathwayStage({ pathwayId, stageId, occurrences: content.occurrences, unitMastery: learner.unitMastery, globalMastery: learner.globalMastery });
  const stageIds = new Set(stageTargets.map(t => t.occurrenceId));
  const eligible = eligibleTargetsForPathwayStage({ pathwayId, stageId, content, masteryByVocabularyId: learner.globalMastery, seed: `unit-1:${pathwayId}:${stageId}` }).filter(t => stageIds.has(t.occurrenceId));
  if (!eligible.length) return { done: 'no_targets', stageId };
  const eligibleIds = new Set(eligible.map(t => t.occurrenceId));
  const ranked = selectEligiblePriorityTargets({ content, masteryByVocabularyId: learner.globalMastery, unitMastery: learner.unitMastery, practiceMode: 'adaptive', now: new Date(), limit: Math.max(10, content.occurrences.length) }).filter(t => eligibleIds.has(t.occurrenceId));
  const picked = [...ranked, ...eligible.filter(t => !ranked.some(r => r.occurrenceId === t.occurrenceId))].slice(0, 10);
  // With a server-issued mission seed the ten are ordered by it (what the app does); without one, the legacy priority order.
  const byId = new Map(picked.map(t => [t.occurrenceId, t]));
  const selected = missionSeed ? orderMissionTargets(picked.map(t => t.occurrenceId), missionSeed).map(id => byId.get(id)) : picked;
  const optionNonce = fixedNonce ?? webcrypto.randomUUID();
  const questions = [];
  let score = 0;
  const startedBefore = new Set(learner.started);
  selected.forEach((target, k) => {
    const mastery = learner.globalMastery[target.vocabularyId] ?? freshMastery();
    const used = learner.used.get(target.occurrenceId) ?? []; const recent = learner.recent.get(target.occurrenceId) ?? [];
    let q;
    try { q = planPathwayQuestion({ pathwayId, stageId, content, target, mastery, recentActivities: recent.map(r => r.type), usedContentIds: used, supportState: { recycle: false, struggling: false }, seed: `${target.occurrenceId}:${k}:adaptive`, optionNonce: missionSeed ? derivePresentationNonce({ missionSeed, occurrenceId: target.occurrenceId, slot: k }) : optionNonce, ...(missionSeed ? { missionSeed, slot: k } : {}) }).question; } catch { return; }
    questions.push({ occ: target.occurrenceId, type: q.type, contentId: q.contentId ?? null, prompt: q.prompt, sourceText: q.sourceText ?? null, options: q.options ?? null, matchOptions: q.matchOptions ?? null, tiles: q.tiles ?? null, answers: q.markingReference?.acceptedAnswers ?? [] });
    if (!record) return;
    const ok = rnd() < accuracy; if (ok) score += 1;
    learner.started.add(target.occurrenceId);
    if (q.contentId) learner.used.set(target.occurrenceId, [...new Set([...used, q.contentId])]);
    learner.recent.set(target.occurrenceId, [...recent, { type: q.type }].slice(-5));
    const ev = { strand: q.strands?.[0], strands: q.strands, correct: ok, evidenceStrength: q.evidenceStrength, supportLevel: 'none', productive: q.productive, repeatedGuess: false, firstAttempt: true, retryUsed: false, recoveredLater: false, contextId: q.contextId ?? null, questionType: q.type, activityType: q.type, review: false };
    learner.globalMastery[target.vocabularyId] = applyEvidence(mastery, ev, new Date());
    const row = learner.unitMastery[target.occurrenceId]; const prog = row.contextualEvidence.pathwayProgress[pathwayId];
    row.contextualEvidence.pathwayProgress[pathwayId] = applyPathwayAttempt(prog, { stageId, servedStageId: stageId, correct: ok, firstAttempt: true, retryUsed: false, supportLevel: 'none', contentId: q.contentId, contextId: q.contextId ?? null, operation: q.type, activityType: q.type, contextSensitive: Boolean(q.contextId) });
  });
  return { stageId, served: selected.length, score, selectedIds: selected.map(t => t.occurrenceId), startedBefore, questions };
}

export function lcg(seed = 12345) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }

const STAGE_INDEX = { recognise: 0, match: 1, apply: 2, recall: 3, mastery: 4 };
export function journey({ pathwayId, accuracy, missions, seed = 12345 }) {
  const learner = newLearner(pathwayId); const rnd = lcg(seed); const log = [];
  for (let m = 1; m <= missions; m += 1) {
    const before = visibleState(pathwayId, learner);
    const wordStages = content.occurrences.map(o => buildUnitPathwayStates({ occurrences: [o], unitMastery: learner.unitMastery, globalMastery: learner.globalMastery })[pathwayId]);
    // A started word is "stranded" when it is not mastered, sits below the visible stage, and so can never be served again.
    const stranded = content.occurrences.filter((o, i) => learner.started.has(o.occurrenceId) && !wordStages[i].mastered && STAGE_INDEX[wordStages[i].currentStage] < STAGE_INDEX[before.currentStage]).length;
    const r = playMission(pathwayId, learner, rnd, accuracy);
    if (r.done) { log.push({ mission: m, visibleStage: before.currentStage, note: r.done }); break; }
    log.push({ mission: m, visibleStage: r.stageId, served: r.served, score: r.score, stranded });
  }
  return log;
}
