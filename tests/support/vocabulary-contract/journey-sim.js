// Learner-journey simulation for the vocabulary regression suite. Synthetic learners only: no student data.
// It mirrors src/vocabulary/app.js startPathwaySession / buildNextForTarget using the SAME production modules (Set selector, server-held
// Set progression, planner, shared server evidence), because app.js itself is DOM-coupled. tests/...-04 guards the mirror against drift.
// The VISIBLE stage comes only from Set progression (the server model); hidden per-word evidence is still recorded exactly as before.
import { webcrypto } from 'node:crypto';
import { orderMissionTargets, derivePresentationNonce } from '../../../src/vocabulary/mission-seed.js';
import unit from '../../../content/vocabulary/units/unit-01.js';
import { releasePlannerContent } from '../../../content/vocabulary/readiness-report.js';
import { planPathwayQuestion } from '../../../src/vocabulary/pathway-planner.js';
import { buildPathwayCoverage } from '../../../src/vocabulary/pathway-coverage.js';
import { setsFromCoverage } from '../../../src/vocabulary/pathway-sets.js';
import { activeSetStep, missionTargetIds } from '../../../src/vocabulary/set-progress.js';
import { applyMissionResult, newSetState } from '../../../src/vocabulary/stage-progression.js';
import { applyEvidence } from '../../../supabase/functions/_shared/vocabulary-engine.js';
import { freshPathwayProgress, applyPathwayAttempt } from '../../../supabase/functions/_shared/vocabulary-pathway-progress.js';

export const content = releasePlannerContent(unit);
const coverageByPathway = buildPathwayCoverage({ content });
const authored = content.occurrences.map(o => o.occurrenceId);
export const setsFor = pathwayId => setsFromCoverage(pathwayId, coverageByPathway[pathwayId], authored);
const freshMastery = () => ({ status: 'new', strandEvidence: { meaning: 0, recognition: 0, context: 0, paraphrasing: 0, production: 0 }, recentErrorCount: 0, recentErrorPattern: null, reviewDueAt: null, successfulProductions: 0, productionContextIds: [], productionActivityTypes: [], unscaffoldedProductions: 0, recoveryCount: 0, reviewStage: 0, reviewFailureCount: 0 });

const STAGE_LIST = ['recognise', 'match', 'apply', 'recall', 'mastery'];

// completedStages = how many stages of Set 1 are already passed (the old fixture parameter); every other Set starts at Recognise.
export function newLearner(pathwayId, completedStages = []) {
  const unitMastery = {};
  for (const occ of content.occurrences) unitMastery[occ.occurrenceId] = { status: 'new', contextualEvidence: { pathwayProgress: { [pathwayId]: freshPathwayProgress({ completedStages }) } } };
  const sets = {};
  if (completedStages.length) sets[1] = { ...newSetState(), stage: STAGE_LIST[Math.min(completedStages.length, 4)] };
  return { pathwayId, unitMastery, globalMastery: {}, used: new Map(), recent: new Map(), started: new Set(), sets, weak: {}, missions: 0 };
}

// The server-held Set state the learner would have, turned into the active step the app reads.
export function visibleState(pathwayId, learner) {
  const rows = {};
  for (const [number, state] of Object.entries(learner.sets)) {
    rows[number] = { stage: state.stage, phase: state.phase, status: state.maintain ? 'maintain' : 'active', completedStages: STAGE_LIST.slice(0, STAGE_LIST.indexOf(state.stage)), weakTargetIds: learner.weak[number] ?? [], supportFlags: state.supportFlags };
  }
  const step = activeSetStep({ sets: setsFor(pathwayId), rowsForPathway: rows });
  return { ...step, currentStage: step.stage, mastered: step.firstPassComplete };
}

// One mission exactly as the app builds it. `accuracy` is the chance each answer is a clean first-attempt success.
export function playMission(pathwayId, learner, rnd, accuracy, { record = true, optionNonce: fixedNonce = null, missionSeed = null } = {}) {
  const step = visibleState(pathwayId, learner);
  if (step.mastered) return { done: 'mastered' };
  if (!step.available) return { done: 'no_targets', stageId: step.stage };
  const stageId = step.stage;
  const byOcc = new Map(content.occurrences.map(t => [t.occurrenceId, t]));
  // A Set is exactly ten words, so a mission is exactly those ten (follow-ups ask the missed words first). A server-issued seed orders a stage mission.
  let ids = missionTargetIds({ step, missionSeed: missionSeed ?? '' });
  const keepOrder = step.missionKind === 'consolidate' || step.missionKind === 'recovery';
  if (missionSeed && !keepOrder) ids = orderMissionTargets(ids, missionSeed);
  const selected = ids.map(id => byOcc.get(id));
  const optionNonce = fixedNonce ?? webcrypto.randomUUID();
  const questions = [];
  let score = 0;
  const missed = [];
  const startedBefore = new Set(learner.started);
  selected.forEach((target, k) => {
    const mastery = learner.globalMastery[target.vocabularyId] ?? freshMastery();
    const used = learner.used.get(target.occurrenceId) ?? []; const recent = learner.recent.get(target.occurrenceId) ?? [];
    const weakRecovery = step.missionKind === 'recovery' && (step.weakTargetIds ?? []).includes(target.occurrenceId);
    let q;
    try { q = planPathwayQuestion({ pathwayId, stageId, content, target, mastery, recentActivities: recent.map(r => r.type), usedContentIds: used, supportState: { recycle: weakRecovery, struggling: weakRecovery }, seed: `${target.occurrenceId}:${k}:adaptive`, optionNonce: missionSeed ? derivePresentationNonce({ missionSeed, occurrenceId: target.occurrenceId, slot: k }) : optionNonce, ...(missionSeed ? { missionSeed, slot: k } : {}) }).question; } catch { return; }
    questions.push({ occ: target.occurrenceId, type: q.type, contentId: q.contentId ?? null, prompt: q.prompt, sourceText: q.sourceText ?? null, options: q.options ?? null, matchOptions: q.matchOptions ?? null, tiles: q.tiles ?? null, answers: q.markingReference?.acceptedAnswers ?? [] });
    if (!record) return;
    const ok = rnd() < accuracy; if (ok) score += 1; else missed.push(target.occurrenceId);
    learner.started.add(target.occurrenceId);
    if (q.contentId) learner.used.set(target.occurrenceId, [...new Set([...used, q.contentId])]);
    learner.recent.set(target.occurrenceId, [...recent, { type: q.type }].slice(-5));
    // Hidden evidence is recorded exactly as before: it no longer decides the visible stage.
    const ev = { strand: q.strands?.[0], strands: q.strands, correct: ok, evidenceStrength: q.evidenceStrength, supportLevel: 'none', productive: q.productive, repeatedGuess: false, firstAttempt: true, retryUsed: false, recoveredLater: false, contextId: q.contextId ?? null, questionType: q.type, activityType: q.type, review: false };
    learner.globalMastery[target.vocabularyId] = applyEvidence(mastery, ev, new Date());
    const row = learner.unitMastery[target.occurrenceId]; const prog = row.contextualEvidence.pathwayProgress[pathwayId];
    row.contextualEvidence.pathwayProgress[pathwayId] = applyPathwayAttempt(prog, { stageId, servedStageId: stageId, correct: ok, firstAttempt: true, retryUsed: false, supportLevel: 'none', contentId: q.contentId, contextId: q.contextId ?? null, operation: q.type, activityType: q.type, contextSensitive: Boolean(q.contextId) });
  });
  if (record && questions.length === selected.length) {
    // The server settles the mission into the Set (the production pure module, same as the SQL trigger).
    const number = step.setNumber; learner.missions += 1;
    const before = learner.sets[number] ?? newSetState();
    const kind = step.missionKind === 'consolidate' ? 'consolidate' : step.missionKind === 'recovery' ? 'recovery' : 'stage';
    const after = applyMissionResult({ ...before, stage: step.stage, phase: step.phase }, { missionId: `sim-${pathwayId}-${learner.missions}`, stage: step.stage, kind, size: 10, score, complete: true, missedTargetIds: missed });
    learner.sets[number] = after;
    learner.weak[number] = after.stage !== step.stage || after.maintain ? [] : (step.phase === 'recovery' ? (learner.weak[number] ?? []) : missed);
  }
  return { stageId, setNumber: step.setNumber, phase: step.phase, served: selected.length, score, selectedIds: selected.map(t => t.occurrenceId), startedBefore, questions };
}

export function lcg(seed = 12345) { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; }

export function journey({ pathwayId, accuracy, missions, seed = 12345 }) {
  const learner = newLearner(pathwayId); const rnd = lcg(seed); const log = [];
  const setOf = new Map(); setsFor(pathwayId).setList.forEach(set => set.members.forEach(id => setOf.set(id, set.setNumber)));
  for (let m = 1; m <= missions; m += 1) {
    const before = visibleState(pathwayId, learner);
    // A started word is "stranded" if it belongs to a Set that is neither finished (Maintain) nor the Set being worked on.
    const stranded = [...learner.started].filter(id => { const n = setOf.get(id); return n != null && n !== before.setNumber && !learner.sets[n]?.maintain; }).length;
    const r = playMission(pathwayId, learner, rnd, accuracy);
    if (r.done) { log.push({ mission: m, visibleStage: before.currentStage, note: r.done }); break; }
    log.push({ mission: m, visibleStage: r.stageId, setNumber: r.setNumber, phase: r.phase, served: r.served, score: r.score, stranded });
  }
  return log;
}
