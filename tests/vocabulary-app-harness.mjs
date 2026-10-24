import fs from 'node:fs';
import vm from 'node:vm';
import unit from '../content/vocabulary/releases/unit-01.js';
import * as sessions from '../src/vocabulary/session.js';
import * as targets from '../src/vocabulary/session-targets.js';
import * as pathways from '../src/vocabulary/pathway-planner.js';
import * as mixedReview from '../src/vocabulary/mixed-review.js';
import * as placement from '../src/vocabulary/pathway-view-model.js';
import * as engine from '../supabase/functions/_shared/vocabulary-engine.js';
import * as matchSetLogic from '../src/vocabulary/match-set.js';
import * as matchSetView from '../src/vocabulary/match-set-view.js';
import { freshPathwayProgress, applyPathwayAttempt } from '../src/vocabulary/pathway-progress.js';
import { deriveLearningStage } from '../src/vocabulary/learning-stage.js';
import { buildSupportStep } from '../src/vocabulary/scaffolding.js';
import { buildSessionFinishModel } from '../src/vocabulary/session-finish-model.js';
import * as engagementCopy from '../src/vocabulary/engagement-copy.js';
import * as engagementModel from '../src/vocabulary/engagement-model.js';
import * as missionSeedLib from '../src/vocabulary/mission-seed.js';
import * as missionCache from '../src/vocabulary/mission-cache.js';
import { acquireMission } from '../src/vocabulary/mission-lifecycle.js';
import { createAttemptPersistence } from '../src/vocabulary/attempt-persistence.js';
import * as setProgress from '../src/vocabulary/set-progress.js';
import { activityFamily } from '../src/vocabulary/activity-families.js';
import { compareSetMembership, MEMBERSHIP, setsFromCoverage as realSetsFromCoverage } from '../src/vocabulary/pathway-sets.js';
import { createSetServer, dbRow } from './support/set-server.js';
import { validateVocabularyAttempt } from '../supabase/functions/vocabulary-attempt-action/validation.js';

// Execute the real controller (app.js) and send every payload through the SERVER's own validation.
const source = fs.readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8')
  .split("root?.addEventListener('submit'")[0]
  .replace(/^import .*;\n/gm,'')
  .replace(/^const root = .*;\n/m,'')
  .replace(/^const state = \{[\s\S]*?^\};\n/m,'');

// Optional latency controls: `submitDelay(payload, index)` returns ms to wait before the fake server answers (real timers),
// `serverCorrect(payload, local)` overrides the server's marking, `deterministic` fixes randomUUID so two runs are comparable.
export function harness({ pathwayId = 'word_families', stage = 'match', size = 2, validate = true, submitDelay = null, serverCorrect = null, deterministic = false, fail = null, missionServer = null, rejectMissionAttempts = null, userKey = 'tester', recordMission = null, setServer = null, setRows = null, terms = ['afford', 'avoid'], setMembers = undefined } = {}) {
  const chosen = terms
    .map(term => unit.items.find(row => row.term === term)).filter(Boolean)
    .map(item => unit.occurrences.find(row => row.vocabularyId === item.vocabularyId));
  const occurrences = [...chosen, ...unit.occurrences.filter(row => !chosen.includes(row))].slice(0, size);
  const content = { ...unit, occurrences, itemsById:Object.fromEntries(unit.items.map(row => [row.vocabularyId,row])), contextsByOccurrence:{}, activitiesById:Object.fromEntries(unit.activities.map(row => [row.activityContentId,row])) };
  for (const row of unit.contexts) (content.contextsByOccurrence[row.occurrenceId] ??= []).push(row);
  const state = { content, currentUnitNumber:1, currentUnitTitle:'Unit 1', preview:false, globalMastery:{}, unitMastery:{}, recentActivities:new Map(), usedContentIds:new Map(), recoveryNeeded:new Set(), queue:[], unitCache:new Map(), setMemberCache:new Map(), units:[], userKey, setRows:[], setStep:null, missionCorrect:new Set(), ...(missionServer || setServer ? { client:{ rpc() {} } } : {}) };
  const stages = ['recognise','match','apply','recall','mastery'];
  // Server-held Set progression: by default Set 1 of this pathway sits at `stage`. `setServer: true` runs a faithful in-memory server (start + record + Set trigger).
  const defaultRows = setRows ?? [dbRow({ pathwayId, setNumber:1, stage })];
  const authored = occurrences.map(row => row.occurrenceId);
  const membersFor = (pathway, setNumber) => (size % 10 === 0 ? realSetsFromCoverage(pathway, { available:true, occurrenceIds:authored }, authored).sets[setNumber - 1] : authored);
  const server = setServer ? (typeof setServer === 'object' ? setServer : createSetServer({ rows:defaultRows, membersFor })) : null;
  const staticRows = defaultRows;
  for (const target of occurrences) {
    state.globalMastery[target.vocabularyId] = { status:'building', strandEvidence:{ meaning:3, recognition:3, context:3, paraphrasing:3 } };
    state.unitMastery[target.occurrenceId] = { status:'building', contextualEvidence:{ pathwayProgress:{ [pathwayId]:freshPathwayProgress({ completedStages:stages.slice(0, stages.indexOf(stage)) }) } } };
  }
  const loadMembersCalls = { n:0 };
  const saved = []; const rejected = []; const served = []; const summaries = []; const requests = []; let counter = 0;
  const testCrypto = deterministic ? { randomUUID:() => `uuid-${++counter}` } : crypto;
  const context = vm.createContext({ state, crypto:testCrypto, Date, Map, Set, console, root:{}, window:{ clearInterval() {}, setInterval() { return 1; } },
    createAttemptPersistence, acquireMission, startVocabularyMission:async (_client, args) => { if (server) return server.start(args); if (!missionServer) throw new Error('no mission service in this harness'); return missionServer(args); }, loadPathwaySets:async () => (server ? server.rows() : staticRows), compareSetMembership, MEMBERSHIP, loadSetMembers:async () => { loadMembersCalls.n += 1; if (setMembers !== undefined) return typeof setMembers === 'function' ? setMembers() : setMembers; if (!(setServer && size % 10 === 0)) return null; const rows = []; for (const pathway of ['meaning','context','word_families','precision_use','spelling_recall']) { for (let n = 1; n <= 12; n += 1) { const members = membersFor(pathway, n); if (!members) break; members.forEach((occurrence_id, i) => rows.push({ pathway_id:pathway, set_number:n, position:i + 1, occurrence_id })); } } return rows; }, MISSION_SIZE:(size % 10 === 0 ? 10 : size), ...setProgress, activityFamily, setsFromCoverage:(pathway, coverage, authored) => (size % 10 === 0 ? realSetsFromCoverage(pathway, coverage, authored) : { pathwayId:pathway, serviceableCount:size, setCount:1, sets:[occurrences.map(row => row.occurrenceId)], setList:[{ setNumber:1, setId:`${pathway}:set-1`, pathwayId:pathway, members:occurrences.map(row => row.occurrenceId) }], heldBack:[], heldBackCount:0, reason:'ready' }), derivePresentationNonce:missionSeedLib.derivePresentationNonce, orderMissionTargets:missionSeedLib.orderMissionTargets, ...missionCache, ...sessions, ...targets, ...pathways, ...mixedReview, ...placement, ...engine, ...matchSetLogic, ...matchSetView, ...engagementCopy, ...engagementModel, VOCABULARY_PATHWAYS:[], servedByAnyLivePathway:() => true, registeredPathwayCoverage:() => null, playCue:() => false, setSoundEnabled:value => value === true, soundEnabled:() => false, loadVocabularyMissions:async () => [], loadMeritAwardCount:async () => null, newAchievements:() => [], markAchievementsSeen() {}, renderAchievementsSheet:() => "", recordVocabularyMission:async (_client, missionId) => (recordMission ? recordMission(missionId) : server ? server.record(missionId, server.allAttempts ?? saved) : null), renderEngagementStrip:() => "", installMatchDrag() {}, playCompletionSequence() {}, loadSeenContent:() => new Map(), saveSeenContent() {}, matchDragJustEnded:() => false, deriveLearningStage, buildSupportStep, buildSessionFinishModel,
    renderVocabularyQuestion(_root, opts) { served.push({ target:state.current?.target?.occurrenceId, type:opts?.question?.type, contentId:opts?.question?.contentId, prompt:opts?.question?.prompt, options:opts?.question?.options ?? null, retry:Boolean(opts?.retry), feedback:Boolean(opts?.feedback), recovery:Boolean(state.current?.recovery) }); },
    renderSessionSummary(_root, opts) { summaries.push(opts); }, renderVocabularyUnit() {}, supportiveFeedback() { return ''; }, trackVocabularyEvent:async () => {},
    submitVocabularyAttempt:async (_client, payload) => {
      requests.push({ attemptId:payload.attemptId, at:Date.now(), missionId:payload.missionId ?? null });
      if (rejectMissionAttempts && payload.missionId) throw Object.assign(new Error('The mission is closed.'), { code:rejectMissionAttempts });
      if (submitDelay) await new Promise(done => setTimeout(done, submitDelay(payload, requests.length)));
      if (fail?.(payload, requests.length)) throw new Error('Failed to fetch');
      if (validate) { try { validateVocabularyAttempt(payload); } catch (error) { rejected.push({ payload, message:error.message }); throw new Error(error.message); } }
      saved.push(payload); if (server) (server.allAttempts ??= []).push(payload);
      const local = payload.rawAnswer !== '__wrong__';
      const correct = serverCorrect ? serverCorrect(payload, local) : local;
      if (!payload.pathwayId) return { correct };
      const progress = state.unitMastery[payload.occurrenceId].contextualEvidence.pathwayProgress[payload.pathwayId];
      const id = payload.activityContentId ?? payload.contextId ?? payload.occurrenceId;
      return { correct, pathwayId:payload.pathwayId, pathwayProgress:applyPathwayAttempt(progress, { stageId:payload.pathwayStage, servedStageId:payload.servedPathwayStage, correct, firstAttempt:payload.firstAttempt, retryUsed:payload.retryUsed, supportLevel:payload.supportLevel, contentId:`${id}:${payload.questionType}`, contextId:payload.contextId ?? payload.activityContentId, promptKey:`${id}:${payload.questionType}`, activityType:payload.questionType, contextSensitive:false }) };
    } });
  vm.runInContext(source, context);
  return { state, saved, rejected, served, summaries, requests, server, loadMembersCalls, run:code => vm.runInContext(code, context) };
}
export const correctAnswer = h => h.state.current.question.markingReference.acceptedAnswers[0];
export async function settle(h) { await h.state.attempts?.settled(); }
// Answer whatever is current correctly and move on, until the recovery question for the missed target is served.
export async function advanceToRecovery(h) {
  for (let guard = 0; guard < 6; guard += 1) {
    await settle(h); await h.run('advanceToNextQuestion()');
    if (h.state.current?.recovery) return h.state.current;
    h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);
  }
  throw new Error('no recovery question was served');
}
