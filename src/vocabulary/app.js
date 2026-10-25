import { getSupabaseClient } from '../supabase.js';
import { loadVocabularyDashboard, loadMeritAwardCount, loadVocabularyMissions, loadVocabularyUnit, loadStudentMastery, loadPathwaySets, loadSetMembers, recordVocabularyMission, startVocabularyMission, submitVocabularyAttempt } from './data.js';
import { achievements as buildAchievements, bestAndAim, computeXp, describeEngagement, evaluateMission, levelFor, meritProgress, nextChallenge, progressSnapshot, weeklyGoal } from './engagement-model.js';
import { markAchievementsSeen, newAchievements } from './achievements-seen.js';
import { trackVocabularyEvent } from './tracking.js';
import { buildSupportStep } from './scaffolding.js';
import { streakMomentum } from './engagement-copy.js';
import { completeAttempt, createSession, expireSession, isSessionComplete, missionProgress } from './session.js';
import { buildTargetPracticeQuestion, buildTimedMixedQuestion, selectEligiblePriorityTargets } from './session-targets.js';
import { planMixedReviewQuestion } from './mixed-review.js';
import { planPathwayQuestion } from './pathway-planner.js';
import { buildUnitPathwayStates } from './pathway-view-model.js';
import { setsFromCoverage, compareSetMembership, MEMBERSHIP } from './pathway-sets.js';
import { activeSetStep, buildSetPathwayStates, buildWordSetStates, describeNext, groupSetRows, missionTargetIds, projectSettlement } from './set-progress.js';
import { MISSION_SIZE } from './stage-progression.js';
import { VOCABULARY_PATHWAYS } from './pathway-model.js';
import { registeredPathwayCoverage, servedByAnyLivePathway } from './pathway-coverage-store.js';
import { buildSessionFinishModel } from './session-finish-model.js';
import { mountGames } from './games/games-controller.js';
import { buildUnitProgress, renderAchievementsSheet, renderEngagementStrip, renderSessionSummary, renderVocabularyError, renderPracticeSheet, renderVocabularyHome, renderVocabularyQuestion, renderVocabularyUnit, renderVocabularyWords, supportiveFeedback } from './views.js';
import { deriveLearningStage } from './learning-stage.js';
import { createAttemptPersistence } from './attempt-persistence.js';
import { buildMatchSet, checkMatchSet, finishedMatchState, newMatchState, revealMatchSet, tapMatchItem, pairMatchItems } from './match-set.js';
import { installMatchDrag, matchDragJustEnded } from './match-drag.js';
import { activityFamily } from './activity-families.js';
import { MIN_SHORT_MISSION, familyTargets, loadLastChoice, pathwayPracticeOptions, restrictOptionsToStep, saveLastChoice } from './pathway-choice.js';
import { loadSeenContent, saveSeenContent } from './seen-content.js';
import { derivePresentationNonce, orderMissionTargets } from './mission-seed.js';
import { clearMission, loadMission, markTargetComplete, saveMission, usedFromObject, usedToObject } from './mission-cache.js';
import { acquireMission } from './mission-lifecycle.js';
import { playCompletionSequence } from './completion-sequence.js';
import { playCue, setSoundEnabled, soundEnabled } from './sound.js';
import { matchKeyTarget, renderMatchSet, repaintMatchSet } from './match-set-view.js';
import { applyEvidence, markCuratedAnswer, encodeSlotAnswer } from '../../supabase/functions/_shared/vocabulary-engine.js';

const root = document.getElementById('vocabularyApp');
const state = {
  client:null, profile:null, preview:false, dashboard:null, units:[], currentUnitNumber:null, currentUnitTitle:null, content:null,
  globalMastery:{}, unitMastery:{}, session:null, queue:[], current:null, practiceFocus:null, pathwayId:null, pathwayStage:null, pathwayChoice:null, mixedReview:false, missions:[], meritAwarded:null, engagementSnapshot:null,
  recentActivities:new Map(), usedContentIds:new Map(), recoveryNeeded:new Set(), clock:null, activeSeconds:0, lastInteractionAt:Date.now(), activeTimer:null, timedPreviousActivityType:null,
  setRows:[], setStep:null, missionCorrect:new Set(), userKey:null, finishPending:false, handoffPending:false, unitCache:new Map(), setMemberCache:new Map(), attempts:null, unitRequest:0, loadingUnit:null
};

function occurrence(row) { return { occurrenceId:row.occurrence_id, vocabularyId:row.vocabulary_id, unitNumber:row.unit_number, unitTitle:row.unit_title, setNumber:row.set_number, positionInUnit:row.position_in_unit, senseId:row.sense_id }; }
function item(row) { return { vocabularyId:row.vocabulary_id, term:row.term, partOfSpeech:row.part_of_speech, coreMeaning:row.core_meaning, senses:row.senses ?? [], wordFamily:row.word_family ?? [], collocations:row.collocations ?? [] }; }
function context(row) { return { contextId:row.context_id, vocabularyId:row.vocabulary_id, occurrenceId:row.occurrence_id, senseId:row.sense_id, type:row.context_type, text:row.prompt_text, targetRewrite:row.target_rewrite, acceptedAnswers:row.accepted_answers ?? [], misconceptionCategory:row.misconception_category }; }
function unitActivity(row) { return { activityContentId:row.activity_content_id, unitNumber:row.unit_number, contentType:row.content_type, activityData:row.activity_data ?? {}, status:row.status }; }
function mastery(row) {
  return {
    status:row?.status ?? 'new', strandEvidence:row?.strand_evidence ?? {}, recentErrorCount:row?.recent_error_pattern ? 1 : 0,
    recentErrorPattern:row?.recent_error_pattern ?? null, reviewDueAt:row?.review_due_at ?? null,
    successfulProductions:row?.successful_productions ?? 0, productionContextIds:row?.production_context_ids ?? [],
    productionActivityTypes:row?.production_activity_types ?? [], unscaffoldedProductions:row?.unscaffolded_productions ?? 0,
    recoveryCount:0, reviewStage:row?.review_stage ?? 0, reviewFailureCount:row?.review_failure_count ?? 0
  };
}
function freshMastery() {
  return {
    status:'new', strandEvidence:{ meaning:0, recognition:0, context:0, paraphrasing:0, production:0 }, recentErrorCount:0,
    recentErrorPattern:null, reviewDueAt:null, successfulProductions:0, productionContextIds:[], productionActivityTypes:[],
    unscaffoldedProductions:0, recoveryCount:0, reviewStage:0, reviewFailureCount:0
  };
}
function mapBy(rows, key, transform = value => value) { return Object.fromEntries(rows.map(row => [row[key], transform(row)])); }
// ---- Server-held Sets-of-10 progression -------------------------------------------------------------------------------------------
// The VISIBLE journey (which Set, which stage, which kind of mission comes next) is read from public.vocabulary_pathway_sets and nowhere
// else. Per-word evidence (globalMastery / unitMastery) keeps being updated and recorded exactly as before, but never picks a stage.
function unitCoverage() { return registeredPathwayCoverage(state.currentUnitNumber) ?? {}; }
function setPathwayStates(occurrences = state.content?.occurrences ?? []) { return buildSetPathwayStates({ occurrences, coverageByPathway:unitCoverage(), setRows:state.setRows }); }
function pathwaySets(pathwayId) {
  const authored = (state.content?.occurrences ?? []).map(row => row.occurrenceId);
  return setsFromCoverage(pathwayId, unitCoverage()[pathwayId] ?? { available:true, occurrenceIds:authored }, authored);
}
function pathwayStep(pathwayId) { return activeSetStep({ sets:pathwaySets(pathwayId), rowsForPathway:groupSetRows(state.setRows)[pathwayId] ?? {} }); }
function occurrencesByIds(ids) { const byId = new Map((state.content?.occurrences ?? []).map(row => [row.occurrenceId, row])); return ids.map(id => byId.get(id)).filter(Boolean); }
async function refreshSetRows() {
  if (state.preview || !state.currentUnitNumber) return;
  state.setRows = await loadPathwaySets(state.client, state.currentUnitNumber);
  const cached = state.unitCache.get(state.currentUnitNumber); if (cached) cached.setRows = state.setRows;
}
function wordSetStatesFor(pathwayId) { return buildWordSetStates({ occurrences:state.content?.occurrences ?? [], coverageByPathway:unitCoverage(), setRows:state.setRows })[pathwayId] ?? {}; }

function decoratePreview() {
  if (!state.preview || !root) return;
  const shell = root.querySelector?.('.vocab-shell');
  if (!shell || shell.querySelector?.('[data-staff-preview-banner]')) return;
  const topbar = shell.querySelector?.('.vocab-topbar');
  const banner = document.createElement('aside');
  banner.className = 'vocab-preview-banner'; banner.dataset.staffPreviewBanner = 'true';
  banner.innerHTML = '<div><strong>STAFF PREVIEW</strong><span>Results are not recorded and will not affect student analytics.</span></div><a class="vocab-button" href="./vocabulary.html">Back to teacher analytics</a>';
  if (topbar?.after) topbar.after(banner); else shell.prepend(banner);
}
function showSyncWarning(error) {
  console.error('Vocabulary progress sync failed', error);
  renderSyncWarning();
}
// Every screen render replaces the root, so while a save is blocked the warning is put back on each new question.
function renderSyncWarning() {
  const shell = root?.querySelector?.('.vocab-shell');
  if (!shell || shell.querySelector?.('[data-vocab-sync-warning]')) return;
  const warning = document.createElement('aside'); warning.className = 'vocab-sync-warning'; warning.dataset.vocabSyncWarning = 'true'; warning.setAttribute('role', 'status');
  warning.innerHTML = '<span>Your answer was checked, but progress could not be saved yet. Your place is kept.</span> <button type="button" class="vocab-link" data-action="retry-save">Try saving again</button>'; shell.prepend(warning);
}
function clearSyncWarning() { root?.querySelectorAll?.('[data-vocab-sync-warning]')?.forEach?.(node => node.remove()); }
// Apply only what the server reports. Progression is never advanced client-side for an unsaved answer.
function applyServerAttemptResult(entry, result) {
  const { occurrenceId, vocabularyId } = entry.context;
  if (result.globalStatus) {
    const currentGlobal = state.globalMastery[vocabularyId] ?? freshMastery();
    state.globalMastery[vocabularyId] = { ...currentGlobal, status:result.globalStatus, reviewDueAt:result.reviewDueAt, recentErrorCount:result.globalRecentErrorPattern ? 1 : 0, recentErrorPattern:result.globalRecentErrorPattern ?? null };
  }
  const previousUnit = state.unitMastery[occurrenceId] ?? { contextualEvidence:{} };
  if (result.unitStatus) state.unitMastery[occurrenceId] = { ...previousUnit, status:result.unitStatus, recentErrorPattern:result.unitRecentErrorPattern ?? null };
  if (result.pathwayProgress && result.pathwayId) {
    const latestUnit = state.unitMastery[occurrenceId] ?? previousUnit;
    const previousDetail = latestUnit.contextualEvidence ?? {};
    state.unitMastery[occurrenceId] = { ...latestUnit, contextualEvidence:{ ...previousDetail, pathwayProgress:{ ...(previousDetail.pathwayProgress ?? {}), [result.pathwayId]:result.pathwayProgress } } };
  }
}
// The server refuses attempts that name a mission it did not issue to this student or that is no longer open (another device started a new
// one, the mission went stale, ...). The student's answer is still real evidence, so the SAME attempt id is re-sent as ordinary practice with no
// mission fields: it is saved, the queue is not blocked, and it simply cannot count towards that mission.
async function submitAttempt(payload) {
  try { return await submitVocabularyAttempt(state.client, payload); }
  catch (error) {
    if (payload.missionId && (error?.code === 'mission_not_open' || error?.code === 'mission_not_issued')) {
      state.missionLost = payload.missionId;
      const { missionId, missionSize, missionKind, practiceFamily, ...ordinary } = payload;
      return submitVocabularyAttempt(state.client, ordinary);
    }
    throw error;
  }
}
function attempts() {
  return state.attempts ??= createAttemptPersistence({
    submit:submitAttempt,
    apply:applyServerAttemptResult,
    onBlocked:showSyncWarning,
    onRecovered:clearSyncWarning,
    onMismatch:(entry, result) => console.warn('Vocabulary marking differed from the local check; the server result was kept.', { local:entry.localCorrect, server:result?.correct })
  });
}
function buildUnits(dashboard) {
  const grouped = new Map(); const global = mapBy(dashboard.global, 'vocabulary_id'); const unit = mapBy(dashboard.unit, 'occurrence_id');
  for (const row of dashboard.occurrences) { if (!grouped.has(row.unit_number)) grouped.set(row.unit_number, { unitNumber:row.unit_number, unitTitle:row.unit_title, occurrences:[] }); grouped.get(row.unit_number).occurrences.push(row); }
  return [...grouped.values()].sort((a,b) => a.unitNumber - b.unitNumber).map(group => ({ unitNumber:group.unitNumber, unitTitle:group.unitTitle, ...buildUnitProgress({ occurrences:group.occurrences, unitMastery:unit, globalMastery:global }) }));
}
// Level, weekly goal, merit progress and achievements, all derived from mission rows plus the pathway progress already loaded.
function engagementData(missions = state.missions ?? []) {
  const dashboard = state.dashboard;
  const snapshot = dashboard ? progressSnapshot({ occurrences:dashboard.occurrences ?? [], unitMastery:mapBy(dashboard.unit ?? [], 'occurrence_id'), globalMastery:mapBy(dashboard.global ?? [], 'vocabulary_id') }) : null;
  state.engagementSnapshot = snapshot;
  return { snapshot, xp:computeXp({ missions, snapshot }), list:buildAchievements({ missions, snapshot }) };
}
function homeEngagement() {
  if (state.preview || !state.dashboard) return null;
  const { snapshot, xp, list } = engagementData();
  return { level:xp, weekly:weeklyGoal(state.missions ?? []), merit:meritProgress(snapshot?.passedStages ?? 0, state.meritAwarded), achievementsUnlocked:list.filter(item => item.unlocked).length, achievementsTotal:list.length, newCount:newAchievements(list, state.userKey).length };
}
function openAchievements() {
  if (root?.querySelector?.('[data-achievements-backdrop]')) return;
  const { list } = engagementData();
  state.achievementsReturn = root.querySelector?.('[data-action="open-achievements"]') ?? null;
  root.insertAdjacentHTML('beforeend', renderAchievementsSheet(list));
  markAchievementsSeen(list, state.userKey);
  root.querySelector?.('[data-achievements-badge], .vocab-engage-home__new')?.remove?.();
  root.querySelector?.('[data-achievements-sheet] [data-autofocus]')?.focus?.();
}
function closeAchievements() {
  const sheet = root?.querySelector?.('[data-achievements-backdrop]'); if (!sheet) return;
  sheet.remove(); state.achievementsReturn?.focus?.();
}
// Unit Mastery needs to know that all six pathways are live. Only a unit that already looks fully mastered needs its readiness
// evaluated before the home screen computes rewards; every other unit cannot be fully mastered whatever its readiness is.
async function evaluateUnitsThatLookMastered(dashboard) {
  if (state.preview || !dashboard) return;
  const unitMastery = mapBy(dashboard.unit ?? [], 'occurrence_id'); const globalMastery = mapBy(dashboard.global ?? [], 'vocabulary_id');
  const byUnit = new Map();
  for (const row of dashboard.occurrences ?? []) { if (!byUnit.has(row.unit_number)) byUnit.set(row.unit_number, []); byUnit.get(row.unit_number).push(row); }
  for (const [unitNumber, rows] of byUnit.entries()) {
    if (registeredPathwayCoverage(unitNumber)) continue;
    const states = buildUnitPathwayStates({ occurrences:rows.map(row => ({ ...row, occurrenceId:row.occurrence_id, vocabularyId:row.vocabulary_id, unitNumber:row.unit_number })), unitMastery, globalMastery, coverageByPathway:{} });
    if (!Object.values(states).every(pathwayState => pathwayState?.mastered === true)) continue;
    try { await loadVocabularyUnit(state.client, unitNumber, { occurrences:dashboard.occurrences }); } catch { /* readiness unknown: Unit Mastery simply waits */ }
  }
}
async function showHome() {
  state.unitRequest += 1; state.loadingUnit = null;
  clearClock(); state.currentUnitNumber = null; state.currentUnitTitle = null; state.content = null; state.practiceFocus = null; state.pathwayId = null; state.pathwayStage = null; state.pathwayChoice = null; state.mixedReview = false; state.setStep = null;
  const [dashboard, missions, meritAwarded] = await Promise.all([loadVocabularyDashboard(state.client, { preview:state.preview }), loadVocabularyMissions(state.client, { preview:state.preview }), loadMeritAwardCount(state.client, { preview:state.preview })]);
  state.dashboard = dashboard; state.missions = missions; state.meritAwarded = meritAwarded; state.units = buildUnits(state.dashboard);
  await evaluateUnitsThatLookMastered(dashboard);
  renderVocabularyHome(root, { displayName:state.profile.display_name, units:state.units, engagement:homeEngagement(), soundOn:soundEnabled() }); decoratePreview();
}
function renderCurrentUnit() {
  if (!state.currentUnitNumber) return;
  const cachedOccurrences = (state.dashboard?.occurrences ?? []).filter(row => Number(row.unit_number) === Number(state.currentUnitNumber));
  const occurrences = state.content?.occurrences ?? cachedOccurrences;
  const summary = state.units.find(unit => Number(unit.unitNumber) === Number(state.currentUnitNumber));
  const progress = occurrences.length
    ? buildUnitProgress({ occurrences, unitMastery:state.unitMastery, globalMastery:state.globalMastery })
    : { mastered:summary?.mastered ?? 0, total:summary?.total ?? 50, needsAnotherLook:summary?.needsAnotherLook ?? 0, reviewDue:summary?.reviewDue ?? 0, stages:summary?.stages ?? {} };
  const pathwayStates = setPathwayStates(occurrences);
  // Only meaningful once the unit's readiness is known (its content has loaded); until then no completion claim is made.
  const completion = state.content ? progressSnapshot({ occurrences, unitMastery:state.unitMastery, globalMastery:state.globalMastery }).units?.[state.currentUnitNumber] ?? null : null;
  renderVocabularyUnit(root, { unitNumber:state.currentUnitNumber, unitTitle:state.currentUnitTitle, progress, pathwayStates, contentReady:Boolean(state.content), completion }); decoratePreview();
}
// A cold unit open renders the unit screen exactly once, after its content and mastery have loaded. While it
// loads, the Home screen stays mounted (no placeholder unit DOM, no second render) and only the clicked card is
// marked busy. `state.unitRequest` is a request token: a load that is no longer the latest navigation never renders.
function setUnitLoading(unitNumber, loading) {
  const card = root?.querySelector?.(`.vocab-unit-card[data-unit="${unitNumber}"]`);
  if (!card) return;
  if (loading) { card.dataset.loading = 'true'; card.setAttribute('aria-busy', 'true'); }
  else { delete card.dataset.loading; card.removeAttribute('aria-busy'); }
}
async function openUnit(unitNumber) {
  if (state.loadingUnit === unitNumber) return;
  clearClock();
  const request = state.unitRequest += 1;
  if (state.loadingUnit != null) setUnitLoading(state.loadingUnit, false);
  state.loadingUnit = null;
  state.practiceFocus = null; state.pathwayId = null; state.pathwayStage = null; state.pathwayChoice = null; state.mixedReview = false; state.setStep = null;
  const cached = state.unitCache.get(unitNumber);
  if (cached) {
    state.currentUnitNumber = unitNumber;
    state.currentUnitTitle = cached.currentUnitTitle;
    state.content = cached.content;
    state.globalMastery = cached.globalMastery;
    state.unitMastery = cached.unitMastery;
    state.setRows = cached.setRows ?? [];
    state.finishPending = false;
    renderCurrentUnit();
    // A cached unit paints at once from the Set progression this browser last read; the server's current state replaces it as soon as it arrives.
    const shown = JSON.stringify(state.setRows);
    refreshSetRows().then(() => {
      if (request === state.unitRequest && state.currentUnitNumber === unitNumber && !state.session && JSON.stringify(state.setRows) !== shown) renderCurrentUnit();
    }).catch(() => { /* keep the last server rows this browser read; the next start re-reads them */ });
    if (attempts().blocked) showSyncWarning(new Error('Vocabulary progress is still unsaved.'));
    return;
  }
  state.loadingUnit = unitNumber;
  setUnitLoading(unitNumber, true);
  try {
    const preloadedOccurrences = (state.dashboard?.occurrences ?? []).filter(row => Number(row.unit_number) === Number(unitNumber));
    const loadOptions = preloadedOccurrences.length ? { occurrences:preloadedOccurrences } : {};
    const occurrenceIds = new Set(preloadedOccurrences.map(row => row.occurrence_id));
    const vocabularyIds = new Set(preloadedOccurrences.map(row => row.vocabulary_id));
    const dashboardMastery = preloadedOccurrences.length && state.dashboard
      ? { global:state.dashboard.global.filter(row => vocabularyIds.has(row.vocabulary_id)), unit:state.dashboard.unit.filter(row => occurrenceIds.has(row.occurrence_id)) }
      : null;
    if (attempts().blocked) await attempts().retry();
    const contentPromise = loadVocabularyUnit(state.client, unitNumber, loadOptions);
    const masteryPromise = state.preview
      ? Promise.resolve({ global:[], unit:[] })
      : dashboardMastery
        ? Promise.resolve(dashboardMastery)
        : loadStudentMastery(state.client, unitNumber, loadOptions);
    const [contentRaw, masteryRaw, setRowsRaw] = await Promise.all([contentPromise, masteryPromise, loadPathwaySets(state.client, unitNumber, { preview:state.preview })]);
    state.setRows = setRowsRaw;
    if (request !== state.unitRequest) return;
    // Never reset the attempt queue here: an unsaved answer must survive opening or reloading a unit.
    state.finishPending = false;
    const occurrences = contentRaw.occurrences.map(occurrence); const items = contentRaw.items.map(item); const contexts = contentRaw.contexts.map(context); const activities = (contentRaw.activities ?? []).map(unitActivity);
    state.content = { occurrences, items, contexts, activities, itemsById:mapBy(items,'vocabularyId'), contextsByOccurrence:{}, activitiesById:mapBy(activities,'activityContentId') };
    for (const ctx of contexts) (state.content.contextsByOccurrence[ctx.occurrenceId] ??= []).push(ctx);
    state.globalMastery = mapBy(masteryRaw.global, 'vocabulary_id', mastery); state.unitMastery = mapBy(masteryRaw.unit, 'occurrence_id', row => ({ status:row.status, recentErrorPattern:row.recent_error_pattern, contextualEvidence:row.contextual_evidence ?? {} }));
    state.currentUnitNumber = unitNumber;
    state.currentUnitTitle = occurrences[0]?.unitTitle ?? preloadedOccurrences[0]?.unit_title ?? state.units.find(unit => Number(unit.unitNumber) === Number(unitNumber))?.unitTitle ?? `Unit ${unitNumber}`;
    state.unitCache.set(unitNumber, { content:state.content, globalMastery:state.globalMastery, unitMastery:state.unitMastery, currentUnitTitle:state.currentUnitTitle, setRows:state.setRows });
    state.loadingUnit = null;
    renderCurrentUnit();
    if (attempts().blocked) showSyncWarning(new Error('Vocabulary progress is still unsaved.'));
  } catch (error) {
    // A superseded request must not paint an error over the screen the student moved on to.
    if (request === state.unitRequest) throw error;
  } finally {
    if (state.loadingUnit === unitNumber && request === state.unitRequest) state.loadingUnit = null;
    setUnitLoading(unitNumber, false);
  }
}
function strandLabel(value, status) { const score = Number(value ?? 0); if (status === 'mastered' && score >= 3) return 'Secure'; if (score >= 6) return 'Secure'; if (score >= 3) return 'Developing'; return 'Keep practising'; }
function showAllWords() {
  if (!state.content || !state.currentUnitNumber) return;
  const setWordStates = buildWordSetStates({ occurrences:state.content.occurrences, coverageByPathway:unitCoverage(), setRows:state.setRows });
  const words = state.content.occurrences.slice().sort((a,b) => a.positionInUnit - b.positionInUnit).map(occ => {
    const target = state.content.itemsById[occ.vocabularyId]; const global = state.globalMastery[occ.vocabularyId] ?? freshMastery();
    const linkedContexts = state.content.contextsByOccurrence[occ.occurrenceId] ?? [];
    const dictionaryContext = linkedContexts.find(ctx => ctx.type === 'meaning_context') ?? linkedContexts.find(ctx => ctx.type === 'production_context') ?? linkedContexts.find(ctx => ctx.type === 'paraphrase_context') ?? linkedContexts[0] ?? null;
    return { term:target?.term ?? occ.vocabularyId, partOfSpeech:target?.partOfSpeech ?? '', definition:target?.coreMeaning ?? '', contextSentence:dictionaryContext?.text ?? '', status:global.status ?? 'new', learningStage:deriveLearningStage(global), mastery:global, pathways:Object.fromEntries(VOCABULARY_PATHWAYS.map(pathway => [pathway.id, setWordStates[pathway.id]?.[occ.occurrenceId] ?? { currentStage:'recognise', needsPractice:false, mastered:false }])), strands:{ meaning:strandLabel(global.strandEvidence?.meaning, global.status), recognition:strandLabel(global.strandEvidence?.recognition, global.status), context:strandLabel(global.strandEvidence?.context, global.status), paraphrasing:strandLabel(global.strandEvidence?.paraphrasing, global.status), production:strandLabel(global.strandEvidence?.production, global.status) } };
  });
  renderVocabularyWords(root, { unitNumber:state.currentUnitNumber, unitTitle:state.currentUnitTitle, words }); decoratePreview();
  // The page was scrolled down on the unit screen: the dictionary always opens at its top (instant, overriding smooth scrolling).
  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') window.scrollTo({ top:0, left:0, behavior:'instant' });
}
// Mixed Practice only uses words that at least one live pathway can carry; a locked pathway never contributes a word.
function liveMixedTargets(targets) {
  const ids = VOCABULARY_PATHWAYS.map(pathway => pathway.id);
  return targets.filter(target => servedByAnyLivePathway(target.unitNumber ?? target.unit_number, target.occurrenceId, ids));
}
function rankedTargets(limit, practiceMode = state.practiceFocus) {
  return selectEligiblePriorityTargets({ content:state.content, masteryByVocabularyId:state.globalMastery, unitMastery:state.unitMastery, practiceMode, now:new Date(), limit });
}
function resetSessionState(continueHistory = false) {
  state.streak = 0;
  // Continue stays in the same unit; explicit activity starts get fresh selection history.
  if (!continueHistory) { state.recentActivities = new Map(); state.usedContentIds = loadSeenContent(state.userKey); }
  state.current = null; state.recoveryNeeded = new Set(); state.timedPreviousActivityType = null; state.finishPending = false;
}
// A pathway session. The server owns the journey: it says which Set, which stage and which kind of mission (stage / Consolidate /
// Recovery / fresh) comes next, and the browser reads that, asks the server to start exactly that mission, and builds its ten questions.
// The student-chosen activity ("How do you want to practise?") is FREE practice: it is recorded as evidence but never moves a Set.
async function startPathwaySession(pathwayId, continueHistory = false, choice = null, forceNew = false) {
  if (!state.content) throw new Error('Vocabulary activities are still loading. Please try again.');
  // A mission that has just finished is settled on the server before the next step is read, so Continue can never start the old step again.
  await state.settling;
  if (!state.preview) await refreshSetRows();
  // A locked pathway (no Sets) can never start a session, whatever asked for it.
  const step = pathwayStep(pathwayId);
  if (!step.available) throw new Error('That pathway is coming soon for this unit.');
  let selected; let pathwayChoice = null;
  // Continue studying after the Set moved on (a new stage) follows the Set: the earlier chosen activity belongs to the stage just finished.
  if (continueHistory && choice?.familyId) {
    const carried = activityFamily(pathwayId, choice.familyId);
    if (!carried || (step.phase === 'stage' && !carried.stageIds.includes(step.stage))) choice = null;
  }
  if (choice?.familyId) {
    // A student-chosen activity is NOT a separate, Set-less journey: it is the Set's CURRENT step (the server-held Set, stage and phase), with
    // the ten questions limited to the chosen activity type. It therefore carries Set identity, settles through the Set trigger, and Continue
    // follows the Set. A chosen activity this stage cannot serve for all ten words is refused, never swapped for another format.
    const family = activityFamily(pathwayId, choice.familyId);
    if (!family) throw new Error('That activity is not available in this pathway.');
    if (step.firstPassComplete) throw new Error('Every Set in this pathway is in Maintain. Mixed Practice keeps them sharp.');
    const notOffered = new Error('That activity is not part of this stage of your Set yet. Choose Recommended or another activity.');
    if (step.phase === 'stage' && !family.stageIds.includes(step.stage)) throw notOffered;
    const members = occurrencesByIds(missionTargetIds({ step }));
    if (members.length !== MISSION_SIZE) throw new Error('No suitable curated activity is available for this pathway stage yet.');
    for (const target of members) {
      try { planPathwayQuestion({ pathwayId, stageId:step.stage, content:state.content, target, mastery:state.globalMastery[target.vocabularyId] ?? {}, allowedTypes:[...family.types], seed:`unit-${state.currentUnitNumber}:${family.id}:${target.occurrenceId}` }); }
      catch { throw notOffered; }
    }
    pathwayChoice = { familyId:family.id, types:[...family.types], stageByOccurrence:null };
  }
  if (step.firstPassComplete) throw new Error('Every Set in this pathway is in Maintain. Mixed Practice keeps them sharp.');
  // Fail safe on membership drift: never start a mission the server would not count for this Set.
  if (!state.preview) {
    state.setMemberCache ??= new Map();
    if (!state.setMemberCache.has(state.currentUnitNumber)) state.setMemberCache.set(state.currentUnitNumber, await loadSetMembers(state.client, state.currentUnitNumber));
    const drift = compareSetMembership({ pathwayId, setNumber:step.setNumber, clientMembers:step.members, serverRows:state.setMemberCache.get(state.currentUnitNumber) });
    if (drift.status === MEMBERSHIP.MISMATCH) {
      state.setMemberCache.delete(state.currentUnitNumber);
      throw new Error('This Set is being updated and cannot be started right now. Your progress is safe. Please tell your teacher.');
    }
  }
  // A Set is exactly ten words, so a normal mission is exactly those ten: no tail, no padding, no duplicates.
  selected = occurrencesByIds(missionTargetIds({ step }));
  if (selected.length !== MISSION_SIZE) throw new Error('No suitable curated activity is available for this pathway stage yet.');
  return beginSession(pathwayRequest({ pathwayId, stageId:step.stage, pathwayChoice, selected, setStep:step, forceNew, continueHistory }));
}
function pathwayRequest({ pathwayId, stageId, pathwayChoice, selected, setStep, forceNew, continueHistory }) {
  return {
    kind:'pathway', pathwayId, stageId, familyId:pathwayChoice?.familyId ?? null, selected, setStep, forceNew, continueHistory, mode:'adaptive', durationMinutes:null,
    keepOrder:setStep?.missionKind === 'consolidate' || setStep?.missionKind === 'recovery',          // follow-ups ask the words the student missed first
    prepare:req => { state.pathwayId = pathwayId; state.pathwayStage = req.stageId; state.pathwayChoice = pathwayChoice; state.practiceFocus = null; state.mixedReview = false; state.setStep = req.setStep ?? null; },
    announce:req => {
  if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'section_use', activity_id:`pathway:${pathwayId}:${req.stageId}`, skill:'vocabulary_mastery', mode:'practice', set_id:`unit-${state.currentUnitNumber}`, metadata:{ unit_number:state.currentUnitNumber, pathway_id:pathwayId, pathway_stage:req.stageId, ...(pathwayChoice ? { practice_family:pathwayChoice.familyId } : {}) } }).catch(() => {});
    } };
}
// The server's Set / stage / phase for a mission is authoritative. When it differs from what this browser last read (another tab or device
// moved the Set, or an unsettled mission was settled just now), the mission is rebuilt for the server's step instead of the stale one.
function reconcileWithServer(request, acquired) {
  const info = acquired?.server;
  const step = request.setStep;
  if (!step || !info || info.setNumber == null) return request;
  if (info.setNumber === step.setNumber && info.pathwayStage === step.stage && info.setPhase === step.phase) return request;
  const sets = pathwaySets(request.pathwayId);
  const members = sets.sets[info.setNumber - 1];
  if (!members || !info.pathwayStage) throw new Error('Your progress changed somewhere else. Open the pathway again to carry on.');
  const next = { ...step, setNumber:info.setNumber, stage:info.pathwayStage, phase:info.setPhase, missionKind:info.setPhase === 'consolidate' ? 'consolidate' : info.setPhase === 'recovery' ? 'recovery' : 'stage', members, weakTargetIds:info.weakTargetIds ?? [], askNextSet:null, completedStages:step.completedStages };
  const selected = occurrencesByIds(missionTargetIds({ step:next }));
  if (selected.length !== MISSION_SIZE) throw new Error('Your progress changed somewhere else. Open the pathway again to carry on.');
  return { ...request, stageId:info.pathwayStage, setStep:next, selected, keepOrder:next.missionKind !== 'stage' };
}
function missionSlotFor(request) {
  const step = request.setStep;
  return { unitNumber:state.currentUnitNumber, kind:request.kind, pathwayId:request.pathwayId ?? null, stageId:request.stageId ?? null, ...(step ? { setNumber:step.setNumber, phase:step.phase } : {}) };
}
// Every mission-backed session starts here. The server issues (or resumes) the mission; the client only ever receives its id and seed.
// A session that cannot have a server mission (preview, no connection object, fewer than ten targets, timed) keeps the legacy
// seeding and sends no mission fields. A mission-eligible session whose RPC fails does NOT start and never makes a second mission:
// the learner sees a plain "try again" message, or resumes the cached open mission with the same id.
function beginSession(request) {
  const { kind, familyId = null, selected, forceNew = false, mode } = request;
  // A normal Set-based pathway mission must carry Set identity. Only a student-chosen activity (familyId) is free practice without a Set; a
  // pathway mission with neither can never start, so Continue cannot silently fall back to a null-Set (legacy, evidence-derived) mission.
  if (kind === 'pathway' && !request.setStep && !familyId) throw new Error('This pathway mission has no Set. Open the pathway again to carry on.');
  const eligible = !state.preview && mode === 'adaptive' && selected.length === 10 && typeof state.client?.rpc === 'function';
  if (!eligible) return commitSession(request, null, null);
  const slot = missionSlotFor(request);
  // Fail closed: a Set-based mission whose server answer carries no Set identity (an out-of-date function, a mismatched deploy) must never
  // run as a legacy, evidence-derived mission. It does not start, and the student sees the plain "try again" message.
  const startMission = ask => Promise.resolve(startVocabularyMission(state.client, { unitNumber:ask.unitNumber, kind:ask.kind, pathwayId:ask.pathwayId, pathwayStage:ask.stageId, phase:'stage', forceNew:ask.forceNew, ...(request.setStep ? { setProgression:true, setNumber:request.setStep.askNextSet ?? null } : {}) }))
    .then(issued => { if (request.setStep && issued?.setNumber == null) throw Object.assign(new Error('The server returned a mission without a Set.'), { code:'no_set_identity' }); return issued; });
  const unavailable = acquired => {
    const message = String(acquired?.error?.serverMessage ?? '');
    if (/No further Set/i.test(message)) return new Error('Every Set in this pathway is in Maintain. Mixed Practice keeps them sharp.');
    return new Error('We could not start this mission just now. Check your connection and try again; nothing has been lost.');
  };
  const finish = (acquired, req, atSlot) => commitSession(req, acquired, atSlot);
  // A mission that has just finished is still open on the server until its settlement returns; starting the next one waits for that, so
  // "Continue" can never resume the mission the student has only just completed.
  return Promise.resolve(state.settling).then(() => acquireMission({ start:startMission, userKey:state.userKey, slot, familyId, forceNew }))
    .then(acquired => {
      if (acquired.status !== 'ready') throw unavailable(acquired);
      // A cached mission whose ten targets are all finished was never settled (the page closed or the request failed). It is settled once
      // here and then replaced, so a settlement that can never succeed cannot trap the student on a finished mission.
      const cached = acquired.extras && acquired.extras.missionId === acquired.missionId ? acquired.extras : null;
      // Version drift: an open mission cached by an older release holds ten words that are no longer this Set's ten (the Set's membership
      // changed in between). Resuming it would play a mission the server cannot count, so it is replaced by a mission for the current Set.
      if (cached && request.setStep && request.setStep.missionKind === 'stage' && !request.forceNew && !request.familyId) {
        const wanted = new Set(selected.map(row => row.occurrenceId));
        if (cached.targetIds.length !== wanted.size || !cached.targetIds.every(id => wanted.has(id))) {
          clearMission(state.userKey, slot);
          return acquireMission({ start:startMission, userKey:state.userKey, slot, familyId, forceNew:true }).then(next => {
            if (next.status !== 'ready') throw unavailable(next);
            const req = reconcileWithServer(request, next);
            return finish(next, req, missionSlotFor(req));
          });
        }
      }
      if (cached && cached.targetIds.length === 10 && cached.targetIds.every(id => cached.completedTargetIds.includes(id))) {
        return Promise.resolve(recordVocabularyMission(state.client, acquired.missionId)).catch(() => null).then(() => {
          clearMission(state.userKey, slot);
          return Promise.resolve(request.setStep ? refreshSetRows().catch(() => {}) : null).then(() => acquireMission({ start:startMission, userKey:state.userKey, slot, familyId, forceNew:true }));
        }).then(next => {
          if (next.status !== 'ready') throw unavailable(next);
          const req = reconcileWithServer(request, next);
          return finish(next, req, missionSlotFor(req));
        });
      }
      const req = reconcileWithServer(request, acquired);
      return finish(acquired, req, req === request ? slot : missionSlotFor(req));
    });
}
function commitSession(request, acquired, slot) {
  const { familyId = null, selected, continueHistory = false, mode, durationMinutes, prepare, announce, keepOrder = false } = request;
  prepare(request);
  const resumed = acquired?.extras && acquired.extras.missionId === acquired.missionId ? acquired.extras : null;
  let ordered = selected;
  if (acquired) {
    const byId = new Map([...selected, ...(state.content?.occurrences ?? [])].map(row => [row.occurrenceId, row]));
    const seeded = () => orderMissionTargets(selected.map(row => row.occurrenceId), acquired.missionSeed);
    const ids = resumed ? resumed.targetIds : keepOrder ? selected.map(row => row.occurrenceId) : seeded();
    ordered = ids.map(id => byId.get(id)).filter(Boolean);
    if (ordered.length !== ids.length) ordered = (keepOrder ? selected.map(row => row.occurrenceId) : seeded()).map(id => byId.get(id));
  }
  const orderedIds = ordered.map(row => row.occurrenceId);
  const nonceSeed = acquired?.missionSeed ?? null;
  state.session = createSession({ unitNumber:state.currentUnitNumber, mode, durationMinutes, targetIds:orderedIds, practiceMode:'adaptive', now:new Date(), ...(nonceSeed ? { optionNonce:derivePresentationNonce({ missionSeed:nonceSeed, occurrenceId:'session', slot:0 }) } : {}) });
  if (acquired) state.session = { ...state.session, missionId:acquired.missionId, missionSeed:acquired.missionSeed };
  state.queue = [...ordered]; resetSessionState(continueHistory);
  state.asks = new Map(); state.lastTiles = new Map(); state.missionLost = null; state.missionSlot = acquired ? slot : null; state.missionCorrect = new Set();
  if (acquired) {
    if (resumed) {
      state.usedContentIds = usedFromObject(resumed.usedAtStart);
      state.asks = new Map(Object.entries(resumed.asks ?? {}).map(([id, count]) => [id, Number(count) || 0]));
      state.missionCorrect = new Set((resumed.correctTargetIds ?? []).filter(id => orderedIds.includes(id)));
      const done = (resumed.completedTargetIds ?? []).filter(id => orderedIds.includes(id));
      state.session = { ...state.session, completedTargetIds:done };
      state.queue = state.queue.filter(row => !done.includes(row.occurrenceId));
    } else {
      saveMission(state.userKey, slot, { missionId:acquired.missionId, missionSeed:acquired.missionSeed, familyId, targetIds:orderedIds, completedTargetIds:[], correctTargetIds:[], usedAtStart:usedToObject(state.usedContentIds), asks:{} });
    }
  }
  announce(request);
  nextQuestion();
}
// Practice-type sheet: a short "How do you want to practise?" choice opened from a pathway card or the finish screen.
function closePracticeSheet(returnFocus = true) {
  const sheet = root?.querySelector?.('[data-practice-sheet-backdrop]'); if (!sheet) return;
  const pathwayId = sheet.dataset.pathway; sheet.remove();
  if (returnFocus) root.querySelector?.(`.vocab-pathway-card[data-pathway="${pathwayId}"]`)?.focus?.();
}
function openPracticeSheet(pathwayId, { known = true } = {}) {
  if (!state.content) throw new Error('Vocabulary activities are still loading. Please try again.');
  closePracticeSheet(false);
  if (!known) { root.insertAdjacentHTML('beforeend', renderPracticeSheet({ pathwayId, offline:true })); root.querySelector?.('[data-practice-sheet] [data-autofocus]')?.focus?.(); return; }
  const wordStates = wordSetStatesFor(pathwayId);
  const step = pathwayStep(pathwayId);
  // What the sheet offers must be what the launch accepts: only activities of the Set's current stage (see startPathwaySession).
  const options = restrictOptionsToStep(pathwayPracticeOptions({ pathwayId, content:state.content, unitMastery:state.unitMastery, globalMastery:state.globalMastery, seed:`unit-${state.currentUnitNumber}:${pathwayId}`, wordStateFor:target => wordStates[target.occurrenceId] ?? null }), step);
  const currentStage = step.stage ?? 'recognise';
  const recommended = bestAndAim(state.missions ?? [], { unitNumber:state.currentUnitNumber, kind:'pathway', pathwayId, stage:currentStage, family:'recommended' });
  root.insertAdjacentHTML('beforeend', renderPracticeSheet({ pathwayId, options, lastFamilyId:loadLastChoice(pathwayId), bestAim:recommended.best ? recommended.copy : null }));
  root.querySelector?.('[data-practice-sheet] [data-autofocus]')?.focus?.();
}
// Entry point for every control that opens the practice sheet. The launcher settles any pending mission and re-reads the
// server's Set rows before it validates, so the sheet must be built from those same rows: cached rows can be a stage behind
// (unit opened from cache, or Choose practice tapped before the finished mission is recorded) and would offer an activity the launch then rejects.
async function openFreshPracticeSheet(pathwayId) {
  await state.settling;
  // If the Set rows cannot be refreshed we do NOT know the Set's current stage, so we do not guess from the cache: the sheet shows a retry state instead.
  let known = true;
  try { await refreshSetRows(); } catch { known = false; }
  openPracticeSheet(pathwayId, { known });
}
function timerMinutes(button) { const minutes = Number(button?.dataset?.minutes); return Number.isFinite(minutes) && minutes > 0 ? minutes : null; }
function startMixedReview(continueHistory = false, durationMinutes = null, forceNew = false) {
  if (!state.content) throw new Error('Vocabulary activities are still loading. Please try again.');
  state.pathwayId = null; state.pathwayStage = null; state.pathwayChoice = null; state.mixedReview = true; state.practiceFocus = 'adaptive'; state.setStep = null;
  const timed = Number.isFinite(Number(durationMinutes)) && Number(durationMinutes) > 0;
  const selected = liveMixedTargets(rankedTargets(timed ? Math.max(10, state.content.occurrences.length) : 10,'adaptive'));
  if (!selected.length) throw new Error('No unlocked vocabulary is ready for Mixed Practice yet.');
  const announce = () => {
    if (timed) startClock();
    if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'section_use', activity_id:'session:mixed-review', skill:'vocabulary_mastery', mode:'practice', set_id:`unit-${state.currentUnitNumber}`, metadata:{ unit_number:state.currentUnitNumber, review_only:true, timed_minutes:timed ? Number(durationMinutes) : null } }).catch(() => {});
  };
  return beginSession({ kind:'mixed', selected, forceNew, continueHistory, mode:timed ? 'timed' : 'adaptive', durationMinutes:timed ? Number(durationMinutes) : null, prepare:() => {}, announce });
}
function startSession(mode, durationMinutes = null, continueHistory = false) {
  if (!state.content) throw new Error('Vocabulary activities are still loading. Please try again.');
  const timed = mode === 'timed';
  if (!timed && !state.practiceFocus) throw new Error('Choose a 0511 skill before starting.');
  const selected = rankedTargets(timed ? Math.max(10, state.content.occurrences.length) : 10, timed ? 'adaptive' : state.practiceFocus); if (!selected.length) throw new Error('No suitable curated activity is available for this practice mode yet.');
  state.session = createSession({ unitNumber:state.currentUnitNumber, mode, durationMinutes, targetIds:selected.map(row => row.occurrenceId), practiceMode:timed ? 'adaptive' : state.practiceFocus, now:new Date() });
  state.queue = [...selected]; resetSessionState(continueHistory); if (timed) startClock();
  if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'section_use', activity_id:`session:${mode}:${state.session.practiceMode}`, skill:'vocabulary_mastery', mode:'practice', set_id:`unit-${state.currentUnitNumber}`, metadata:{ unit_number:state.currentUnitNumber, practice_focus:state.session.practiceMode } }).catch(() => {});
  nextQuestion();
}
function continuePractice() {
  if (state.pathwayId) return startPathwaySession(state.pathwayId, true, state.pathwayChoice);
  if (state.mixedReview) return startMixedReview(true, state.session?.mode === 'timed' ? state.session.durationMinutes : null);
  if (state.session?.mode === 'timed') { startSession('timed', state.session.durationMinutes, true); return; }
  if (state.practiceFocus) { startSession('adaptive', null, true); return; }
  throw new Error('No practice route is available to continue.');
}
function remainingLabel() { if (!state.session) return ''; if (state.session.mode === 'adaptive') { const { done, total } = missionProgress(state.session); return `${done} / ${total} activities`; } const ms = Math.max(0, new Date(state.session.expiresAt).getTime() - Date.now()); const seconds = Math.ceil(ms / 1000); const minutes = Math.floor(seconds / 60); return `${minutes}:${String(seconds % 60).padStart(2,'0')} remaining`; }
function startClock() { clearClock(); state.clock = window.setInterval(() => { const label = root.querySelector?.('.vocab-topbar span'); if (label) label.textContent = remainingLabel(); if (state.session && isSessionComplete(state.session, new Date())) void finishSessionWhenSaved(); }, 1000); }
function clearClock() { if (state.clock) { window.clearInterval(state.clock); state.clock = null; } }
function buildNextForTarget(target) {
  const masteryState = state.globalMastery[target.vocabularyId] ?? freshMastery();
  const recent = state.recentActivities.get(target.occurrenceId) ?? []; const recovery = state.recoveryNeeded.has(target.occurrenceId);
  const usedContentIds = state.usedContentIds.get(target.occurrenceId) ?? [];
  // A Recovery mission rebuilds the words the student missed with the planner's existing temporary one-stage support (Locked: scaffolded, same stage).
  const recoveryMissionWord = state.setStep?.missionKind === 'recovery' && (state.setStep.weakTargetIds ?? []).includes(target.occurrenceId);
  const reviewDue = Boolean(masteryState.reviewDueAt && new Date(masteryState.reviewDueAt).getTime() <= Date.now());
  const common = {
    content:state.content,
    target,
    mastery:masteryState,
    recentActivities:recent,
    supportState:{ recycle:recovery || recoveryMissionWord, struggling:recovery || recoveryMissionWord },
    reviewDue,
    usedContentIds,
    seed:`${target.occurrenceId}:${state.session.completedAttempts.length}:${state.session.mode}`,
    optionNonce:state.session.optionNonce
  };
  // Server-issued mission: content comes from H(missionSeed, occurrence, slot, activity type) and presentation from a separate nonce.
  // slot = the target's place in the mission + 10 per earlier finished ask of it, so recovery re-asks differ and a resume repeats exactly.
  const missionSeed = state.session.missionSeed ?? null;
  const placed = state.session.targetIds.indexOf(target.occurrenceId);
  const slot = Math.max(0, placed) + 10 * (state.asks?.get(target.occurrenceId) ?? 0);
  const avoidTileOrders = state.lastTiles?.get(target.occurrenceId) ?? [];
  if (missionSeed) common.optionNonce = derivePresentationNonce({ missionSeed, occurrenceId:target.occurrenceId, slot });
  let built;
  if (state.mixedReview) {
    built = planMixedReviewQuestion({ content:state.content, target, unitMastery:state.unitMastery, globalMastery:state.globalMastery, recentActivities:recent.map(entry => entry.type), usedContentIds, seed:common.seed, missionSeed, slot, optionNonce:common.optionNonce, avoidTileOrders });
  } else if (state.pathwayId) {
    built = planPathwayQuestion({ pathwayId:state.pathwayId, stageId:state.pathwayChoice?.stageByOccurrence?.get(target.occurrenceId) ?? state.pathwayStage, allowedTypes:state.pathwayChoice?.types ?? null, content:state.content, target, mastery:masteryState, recentActivities:recent.map(entry => entry.type), usedContentIds, supportState:common.supportState, seed:common.seed, optionNonce:common.optionNonce, missionSeed, slot, avoidTileOrders });
  } else {
    built = state.session.mode === 'timed'
      ? buildTimedMixedQuestion({ ...common, previousActivityType:state.timedPreviousActivityType })
      : buildTargetPracticeQuestion({ ...common, practiceMode:state.session.practiceMode ?? state.practiceFocus });
  }
  const targetItem = built.item; const targetContexts = built.contexts; const question = built.question;
  if (Array.isArray(question.tiles)) state.lastTiles?.set(target.occurrenceId, [...(state.lastTiles.get(target.occurrenceId) ?? []).slice(-3), question.tiles.join('')]);
  if (state.session.mode === 'timed') state.timedPreviousActivityType = question.type;
  if (question.contentId) {
    // Keep record and operation-specific variant identities in the existing target history.
    const variant = question.activityVariantId == null ? [] : [JSON.stringify([question.contentId, question.type, question.activityVariantId])];
    state.usedContentIds.set(target.occurrenceId, [...new Set([...usedContentIds, question.contentId, ...variant])]);
    saveSeenContent(state.userKey, target.occurrenceId, [question.contentId, ...variant]);
  }
  const contextRecord = targetContexts.find(ctx => ctx.contextId === question.contentId) ?? null; const activityRecord = state.content.activitiesById[question.contentId] ?? null;
  const primaryEvidenceTargetId = question.primaryEvidenceTargetId ?? activityRecord?.activityData?.primaryEvidenceTargetId ?? (question.contentSource === 'item' ? target.vocabularyId : null);
  // Meaning → Match: one visible set of pairs is still ONE activity (one primary evidence target, one answer payload).
  const matchSet = buildMatchSet({ ...question, primaryEvidenceTargetId });
  if (question.type === 'word_definition_match' && !matchSet) throw new Error('Meaning Match needs at least three curated pairs.');
  return { target, item:targetItem, context:contextRecord, activityRecord, question, pathwayPlan:built.plan ?? null, recovery, retry:false, support:null, initialError:false, primaryEvidenceTargetId, matchSet, matchState:matchSet ? newMatchState() : null };
}
function nextQuestion() {
  if (!state.session) return; if (isSessionComplete(state.session, new Date())) { void finishSessionWhenSaved(); return; }
  if (!state.queue.length) { if (state.session.mode === 'timed') { const refill = rankedTargets(Math.min(20, state.content.occurrences.length), 'adaptive'); state.queue = state.mixedReview ? liveMixedTargets(refill) : refill; } else { void finishSessionWhenSaved(); return; } }
  let current = null; let guard = state.queue.length;
  while (!current && guard > 0) { const target = state.queue.shift(); guard -= 1; if (!target) break; if (state.session.mode === 'adaptive' && state.session.completedTargetIds.includes(target.occurrenceId) && !state.recoveryNeeded.has(target.occurrenceId)) continue; try { current = buildNextForTarget(target); } catch { state.queue.push(target); } }
  if (!current) { if (state.session.mode === 'timed') { void finishSessionWhenSaved(); return; } if (Number(state.session.summary?.practised) > 0 || state.session.completedTargetIds?.length) { void finishSessionWhenSaved(); return; } throw new Error('No suitable curated activity is available for this practice mode yet.'); }
  state.current = current; renderCurrentQuestion();
}
function renderCurrentQuestion(feedback = null) { if (!state.current) return; const currentMastery = state.globalMastery[state.current.target.vocabularyId] ?? freshMastery(); renderVocabularyQuestion(root, { unitNumber:state.currentUnitNumber, unitTitle:state.current.target.unitTitle, question:state.current.question, term:state.current.item.term, sessionLabel:remainingLabel(), learningStage:deriveLearningStage(currentMastery), feedback, retry:state.current.retry, support:state.current.support, matchSet:state.current.matchSet ?? null, matchState:state.current.matchState ?? null, streak:state.streak ?? 0, sessionScore:state.session?.summary?.strengthened ?? 0, missionSize:state.session?.mode === 'adaptive' ? missionProgress(state.session).total : null }); decoratePreview(); if (state.attempts?.blocked) renderSyncWarning(); }
function markVocabularyAttemptLocally(current, rawAnswer) {
  const sense = Array.isArray(current.item?.senses) ? current.item.senses.find(candidate => candidate?.senseId === current.target.senseId) : null; if (!sense) throw new Error('This vocabulary question is missing its marking data.');
  const reference = current.question.markingReference ?? {}; const markingContext = { contextId:current.context?.contextId ?? current.question.contentId, activityContentId:current.activityRecord?.activityContentId ?? null, acceptedAnswers:reference.acceptedAnswers ?? [], distractors:reference.distractors ?? [], ...(Array.isArray(reference.slotAnswers) ? { slotAnswers:reference.slotAnswers } : {}) };
  const marked = markCuratedAnswer({ item:{ vocabularyId:current.item.vocabularyId }, sense, context:markingContext, questionType:current.question.type, rawAnswer });
  return { ...marked, strand:current.question.strands?.[0], strands:current.question.strands ?? marked.evidence?.strands ?? [] };
}
function updatesTargetMastery(current) { if (current.context) return true; return Boolean(current.primaryEvidenceTargetId && current.primaryEvidenceTargetId === current.target.vocabularyId); }
function evidenceFor(current, result, flags) {
  return { strand:result.strand, strands:current.question.strands, correct:result.correct, evidenceStrength:current.question.evidenceStrength, supportLevel:flags.supportLevel, productive:current.question.productive, repeatedGuess:false, firstAttempt:flags.firstAttempt, retryUsed:flags.retryUsed, recoveredLater:flags.recoveredLater, contextId:current.context?.contextId ?? null, activityContentId:current.activityRecord?.activityContentId ?? null, questionType:current.question.type, activityType:current.question.type, review:state.preview ? false : flags.review };
}
// A mission is an untimed ten-activity pathway or Mixed Practice session. Its id is created once per session and rides on every
// attempt so the server can rebuild the mission from its own graded attempts; it never carries a score, streak or star count.
function missionFields() {
  const id = state.session?.missionId;
  if (!id || state.missionLost === id || state.preview || state.session.mode !== 'adaptive' || state.session.targetIds.length !== 10) return {};
  if (state.mixedReview) return { missionId:id, missionSize:10, missionKind:'mixed', practiceFamily:'mixed' };
  if (state.pathwayId) return { missionId:id, missionSize:10, missionKind:'pathway', practiceFamily:state.pathwayChoice?.familyId ?? 'recommended' };
  return {};
}
function persistVocabularyAttempt(current, rawAnswer, flags, localResult) {
  const contentSource = current.activityRecord ? 'unit_activity' : current.context ? 'context' : 'item';
  const pathwayFields = state.mixedReview && current.pathwayPlan ? { pathwayId:current.pathwayPlan.pathwayId, pathwayStage:current.pathwayPlan.learnerStage, servedPathwayStage:current.pathwayPlan.servedStage ?? current.pathwayPlan.learnerStage } : state.pathwayId ? { pathwayId:state.pathwayId, pathwayStage:current.pathwayPlan?.learnerStage ?? state.pathwayStage, servedPathwayStage:current.pathwayPlan?.servedStage ?? state.pathwayStage } : {};
  const payload = { occurrenceId:current.target.occurrenceId, contextId:current.context?.contextId ?? null, activityContentId:current.activityRecord?.activityContentId ?? null, activityVariantId:current.question.activityVariantId ?? null, contentSource, primaryEvidenceTargetId:current.primaryEvidenceTargetId, questionType:current.question.type, rawAnswer, strands:current.question.strands, evidenceStrength:current.question.evidenceStrength, supportLevel:flags.declaredSupportLevel ?? flags.supportLevel, productive:current.question.productive, repeatedGuess:false, firstAttempt:flags.firstAttempt, retryUsed:flags.retryUsed, recoveredLater:flags.recoveredLater, review:flags.review, preview:false, ...pathwayFields, ...missionFields() };
  return attempts().enqueue({ payload, localCorrect:localResult.correct, context:{ occurrenceId:current.target.occurrenceId, vocabularyId:current.target.vocabularyId } });
}
async function returnToCurrentUnit() {
  // Leaving is independent of saving; keep the queued attempt and its sync guard intact.
  clearClock();
  state.current = null;
  state.session = null;
  state.queue = [];
  state.pathwayId = null; state.pathwayStage = null; state.pathwayChoice = null; state.mixedReview = false; state.setStep = null; state.practiceFocus = null;
  renderCurrentUnit();
  if (attempts().blocked) showSyncWarning(new Error('Vocabulary progress is still unsaved.'));
}
// Question-to-question navigation never waits for the network. Everything nextQuestion() reads is local session
// state (queue, recovery set, recent activity, mission progress) plus globalMastery, which handleAnswer has already
// updated with the same shared engine the server runs; server-applied pathway progression is only consumed when a
// session finishes or a new one starts, and both of those wait for the queue. Saving continues in order, in the
// background, with stable attempt ids. Only when a save is blocked AND several answers are already waiting behind
// it does Next try to recover first, so the unsaved backlog stays small.
const MAX_UNSAVED_WHILE_BLOCKED = 3;
async function advanceToNextQuestion() {
  const current = state.current;
  if (!current) return;
  if (attempts().blocked && attempts().pending >= MAX_UNSAVED_WHILE_BLOCKED && !await attempts().retry()) return;
  if (state.current !== current) return;
  nextQuestion();
}
// Starting a session reads server-applied pathway progression, so a new pathway / Mixed Practice / Continue session may
// start only once every earlier answer is actually saved. Nothing pending (the common case) starts synchronously.
// Otherwise: wait for the queue; if it ended blocked, try once more; if it is still not clear, do NOT start, keep the
// learner where they are, show the sync warning with its retry control, and leave every queued attempt untouched.
function runAfterSaves(start) {
  const fail = error => renderVocabularyError(root, error instanceof Error ? error.message : 'Unable to start that activity.');
  const go = () => { try { const started = start(); if (started && typeof started.then === 'function') started.catch(fail); } catch (error) { fail(error); } };
  const queue = attempts();
  if (!queue.pending && !queue.blocked) { go(); return; }
  if (state.handoffPending) return;                       // one hand-off at a time: a second click cannot start a second session
  state.handoffPending = true;
  void (async () => {
    try {
      let clear = await queue.settled();
      if (!clear) clear = await queue.retry() && !queue.pending && !queue.blocked;
      if (!clear) { renderSyncWarning(); return; }
    } catch (error) { renderSyncWarning(); return; } finally { state.handoffPending = false; }
    go();
  })();
}
function recordRecentActivity(current, result) { const recent = state.recentActivities.get(current.target.occurrenceId) ?? []; const entry = { type:current.question.type, contentId:current.question.contentId, correct:result.correct }; state.recentActivities.set(current.target.occurrenceId, [...recent, entry].slice(-5)); }
function handleAnswer(form, providedAnswer = null) {
  if (!state.current || !state.session) return; if (state.session.mode === 'timed' && isSessionComplete(state.session, new Date())) { void finishSessionWhenSaved(); return; }
  const input = form?.querySelector?.('input[name="answer"], select[name="answer"]'); const current = state.current; if (current.answered) return;
  if (current.matchSet && providedAnswer == null) {
    // Whole-set check. Nothing is marked until every word is paired. Correct pairs lock; wrong pairs reopen. The existing
    // single-answer attempt is recorded only when it would be anyway: the primary pair was wrong (first attempt → supported
    // retry → move on), or every pair is right. Primary right but other pairs wrong is formative: no attempt, no counters.
    const checked = checkMatchSet(current.matchSet, current.matchState);
    if (!checked.complete) { paintMatchSet(current, null, 'Pair every word with a definition, then check.'); return; }
    current.matchState = checked.state;
    if (checked.primaryCorrect && !checked.allCorrect) { paintMatchSet(current); return; }
    providedAnswer = checked.rawAnswer;
  }
  if (current.question.responseMode === 'slots' && providedAnswer == null) {
    // Multi-slot typed Mastery: every box must be filled, then the boxes travel as ONE answer. No partial credit exists downstream.
    const boxes = [...(form?.querySelectorAll?.('[data-slot-input]') ?? [])].map(box => String(box.value ?? '').trim());
    if (!boxes.length || boxes.some(value => !value)) { const notice = form?.querySelector?.('[data-slot-notice]'); if (notice) notice.textContent = 'Type an answer in every gap before checking.'; return; }
    const canonical = Array.isArray(current.question.slotCanonicalIndex) ? boxes.reduce((out, value, index) => { out[current.question.slotCanonicalIndex[index]] = value; return out; }, []) : boxes;
    providedAnswer = encodeSlotAnswer(canonical);
  }
  const rawAnswer = providedAnswer != null ? String(providedAnswer) : (input?.value ?? '');
  if (current.question.responseMode === 'tiles' && !form?.querySelector?.('[data-tile-answer].is-used')) {
    // Spelling & Recall: validation only. Nothing is marked, saved or counted; the message sits in an alert region that the
    // first tile selection empties again. Other tile activities keep their existing wording.
    const notice = current.question.type === 'spelling_rebuild' ? form?.querySelector?.('[data-tile-validation]') : null;
    if (notice) { notice.textContent = 'Choose at least one letter before checking your answer.'; return; }
    const build = form?.querySelector?.('[data-tile-build]');
    if (build) build.textContent = 'Choose at least one tile before checking.';
    return;
  }
  if (current.question.stageVariant === 'missing-letters' && providedAnswer == null && !String(input?.value ?? '').trim()) { const notice = form?.querySelector?.('[data-tile-validation]'); if (notice) notice.textContent = 'Fill every missing letter before checking your answer.'; return; }
  const previousGlobal = state.globalMastery[current.target.vocabularyId] ?? freshMastery(); const previousGlobalStatus = previousGlobal.status ?? 'new'; const review = Boolean(previousGlobal.reviewDueAt && new Date(previousGlobal.reviewDueAt).getTime() <= Date.now());
  // supportLevel feeds evidence exactly as before. declaredSupportLevel is what the browser tells the server about the question it served: a lower-stage recovery question is temporary support, as the pathway planner declared.
  const retrySupport = current.retry ? (current.support?.supportLevel ?? 'light') : 'none';
  const flags = { firstAttempt:!current.retry, retryUsed:current.retry, recoveredLater:current.recovery, review, supportLevel:retrySupport, declaredSupportLevel:current.retry ? retrySupport : (current.pathwayPlan?.supportLevel ?? 'none') };
  const result = markVocabularyAttemptLocally(current, rawAnswer); if (result.correct) playCue('correct'); const shouldUpdate = updatesTargetMastery(current); const nextGlobal = shouldUpdate ? applyEvidence(previousGlobal, evidenceFor(current, result, flags), new Date()) : previousGlobal;
  if (shouldUpdate) {
    const previousPattern = previousGlobal.recentErrorPattern ?? state.unitMastery[current.target.occurrenceId]?.recentErrorPattern ?? null;
    const nextErrorPattern = result.correct ? (nextGlobal.recentErrorCount > 0 ? previousPattern : null) : (result.misconceptionCategory ?? 'retrieval_failure');
    state.globalMastery[current.target.vocabularyId] = { ...nextGlobal, recentErrorPattern:nextErrorPattern };
    const previousUnit = state.unitMastery[current.target.occurrenceId] ?? { contextualEvidence:{} };
    const previousDetail = previousUnit.contextualEvidence ?? {};
    state.unitMastery[current.target.occurrenceId] = { ...previousUnit, status:nextGlobal.status, recentErrorPattern:nextErrorPattern, contextualEvidence:{ ...previousDetail, strandEvidence:nextGlobal.strandEvidence } };
  }
  const recoverySucceeded = current.recovery && result.correct; if (!state.preview) void persistVocabularyAttempt(current, rawAnswer, flags, result);
  const message = supportiveFeedback({ correct:result.correct, misconceptionCategory:result.misconceptionCategory, recovery:recoverySucceeded, term:current.item.term, meaning:current.item.coreMeaning, questionType:current.question.type, variant:state.session.completedAttempts.length + [...String(current.target.occurrenceId)].reduce((sum, char) => sum + char.charCodeAt(0), 0) });
  if (!result.correct && !current.retry) { current.initialError = true; current.retry = true; current.support = buildSupportStep(current.question, { correct:false, misconceptionCategory:result.misconceptionCategory, attemptNumber:1 }); renderCurrentQuestion({ correct:false, message }); return; }
  current.answered = true;
  recordRecentActivity(current, result); const hadError = current.initialError || !result.correct;
  if (hadError && !current.recovery) { state.recoveryNeeded.add(current.target.occurrenceId); state.queue.push(current.target); } else if (current.recovery) state.recoveryNeeded.delete(current.target.occurrenceId);
  const completeTarget = current.recovery || !hadError;
  if (completeTarget && result.correct) state.missionCorrect.add(current.target.occurrenceId);   // the server scores a mission by the targets that finished correct
  state.session = completeAttempt(state.session, { targetId:current.target.occurrenceId, evidence:{ correct:result.correct, recovery:recoverySucceeded, activityType:current.question.type }, completeTarget, strengthened:result.correct, movedToSecure:shouldUpdate && previousGlobalStatus !== 'secure' && nextGlobal.status === 'secure', mastered:shouldUpdate && previousGlobalStatus !== 'mastered' && nextGlobal.status === 'mastered', needsAnotherLook:completeTarget && !result.correct });
  if (state.missionSlot && state.session.missionId) {
    if (hadError && !current.recovery) { state.asks.set(current.target.occurrenceId, (state.asks.get(current.target.occurrenceId) ?? 0) + 1); const cached = loadMission(state.userKey, state.missionSlot); if (cached) saveMission(state.userKey, state.missionSlot, { ...cached, asks:Object.fromEntries(state.asks) }); }
    if (completeTarget) markTargetComplete(state.userKey, state.missionSlot, current.target.occurrenceId, { correct:result.correct });
  }
  current.support = !result.correct ? buildSupportStep(current.question, { correct:false, misconceptionCategory:result.misconceptionCategory, attemptNumber:2 }) : null;
  if (current.matchSet) current.matchState = result.correct && Object.keys(current.matchState.settled).length === current.matchSet.words.length ? finishedMatchState(current.matchSet, current.matchState) : revealMatchSet(current.matchSet, current.matchState);
  state.streak = result.correct && !hadError ? (state.streak ?? 0) + 1 : 0;
  const { done, total } = missionProgress(state.session);
  const momentum = total >= 6 && done === Math.floor(total / 2) && completeTarget ? `Halfway — ${done} of ${total}` : streakMomentum(state.streak);
  renderCurrentQuestion({ correct:result.correct, message, momentum, filledAnswer:result.correct ? String(rawAnswer ?? '').trim() : '' });
}
// Meaning → Match interaction. Taps only change the pairing state and repaint the set in place (focus is kept), so a tap
// never re-renders the question, never touches the attempt queue, and never changes session counters.
function paintMatchSet(current, focusSelector = null, message = null) {
  if (!current?.matchSet || !root) return;
  repaintMatchSet(root, renderMatchSet(current.matchSet, current.matchState, { retry:current.retry }), focusSelector);
  if (message) { const status = root.querySelector?.('[data-match-status]'); if (status) status.textContent = message; }
}
function handleMatchTap(node) {
  const current = state.current;
  if (!current?.matchSet || current.answered) return;
  const side = node.dataset.matchWord ? 'word' : 'definition'; const id = node.dataset.matchWord ?? node.dataset.matchDefinition;
  current.matchState = tapMatchItem(current.matchSet, current.matchState, side, id);
  paintMatchSet(current, `[data-match-${side}="${id}"]`);
}
function handleMatchDrop(wordId, definitionId, side, id) {
  const current = state.current;
  if (!current?.matchSet || current.answered) return;
  current.matchState = pairMatchItems(current.matchSet, current.matchState, wordId, definitionId);
  paintMatchSet(current, `[data-match-${side}="${id}"]`);
}
if (root) installMatchDrag(root, { canDrag: () => Boolean(state.current?.matchSet && !state.current.answered), onPair: handleMatchDrop });
function toggleSound(button) {
  const on = setSoundEnabled(!soundEnabled());
  button.setAttribute?.('aria-pressed', on ? 'true' : 'false');
  button.textContent = `Sound: ${on ? 'on' : 'off'}`;
  if (on) playCue('correct');
}
// What the completion screen shows. For a mission that belongs to a Set the numbers are the ones the SERVER will derive (targets that
// finished correct) and the next step is the pure progression applied to the Set's server-held state; hidden word evidence is not read.
function setFinishContext(finished) {
  const step = state.setStep;
  if (!step || !state.pathwayId) return null;
  const missed = step.members.filter(id => !state.missionCorrect.has(id));
  const score = step.members.length - missed.length;
  const credited = !state.preview && finished.mode === 'adaptive' && Boolean(finished.missionId) && state.missionLost !== finished.missionId;
  const projection = credited ? projectSettlement({ step, missionId:finished.missionId, score, missedTargetIds:missed }) : null;
  return { step, score, missed, projection };
}
function finishModelForSet(context, finished, projection = context.projection) {
  const { step, score } = context;
  return buildSessionFinishModel({ summary:finished.summary, pathwayId:state.pathwayId, startStage:step.stage, preview:state.preview, fixedMissionSize:10,
    setInfo:{ setNumber:step.setNumber, setCount:step.setCount, score, completedStages:step.completedStages, next:describeNext({ step, projection }) } });
}
function finishSession() {
  if (!state.session) return;
  if (state.session.mode === 'timed') state.session = expireSession(state.session, new Date());
  clearClock();
  const finished = state.session;
  const setContext = setFinishContext(finished);
  // Free practice (a chosen activity) never moves a Set, so its screen makes no stage claim at all.
  const finishModel = state.pathwayId
    ? (setContext
      ? finishModelForSet(setContext, finished)
      : buildSessionFinishModel({ summary:finished.summary, pathwayId:state.pathwayId, startStage:state.pathwayStage, preview:state.preview, fixedMissionSize:10, setInfo:{ setNumber:null, setCount:null, score:null, completedStages:[], next:null } }))
    : null;
  state.current = null;
  if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'exercise_result', activity_id:`session_complete:${finished.mode}:${state.pathwayId ?? (state.mixedReview ? 'mixed-review' : finished.practiceMode ?? 'adaptive')}`, skill:'vocabulary_mastery', mode:'practice', set_id:`unit-${finished.unitNumber}`, score:finished.summary.strengthened, max_score:Math.max(1, finished.summary.practised), metadata:{ unit_number:finished.unitNumber, pathway_id:state.pathwayId, pathway_stage:state.pathwayStage, review_only:state.mixedReview } }).catch(() => {});
  const missionId = !state.preview && (state.pathwayId || state.mixedReview) && finished.mode === 'adaptive' && state.missionLost !== finished.missionId ? finished.missionId ?? null : null;
  const summaryArgs = { durationMinutes:finished.durationMinutes, summary:finished.summary, practiceMode:finished.practiceMode ?? 'adaptive', pathwayId:state.pathwayId, engagementPending:Boolean(missionId) };
  renderSessionSummary(root, { ...summaryArgs, finishModel });
  decoratePreview();
  if (missionId) state.settling = settleMission(missionId, { finishModel, setContext, finished, summaryArgs }).catch(() => {}).finally(() => { state.settling = null; });
  root.querySelector?.('[data-session-finish-heading]')?.focus?.();
  playCompletionSequence(root);
  playCue('finish');
}
// The server rebuilds the finished mission from its own graded attempts and returns the facts; everything shown here is derived from those rows.
async function settleMission(missionId, { finishModel = null, setContext = null, finished = null, summaryArgs = null } = {}) {
  // Settlement never depends on the screen: the Set must advance even if the results screen has been left or has no engagement slot.
  let slot = root?.querySelector?.('[data-engagement-slot]') ?? null;
  const row = await recordVocabularyMission(state.client, missionId);
  if (row && state.missionSlot) clearMission(state.userKey, state.missionSlot);
  // The server has now applied (or refused) the mission to the Set. Read the authoritative state; if it disagrees with the projection the
  // screen was painted from, the screen is repainted from the server's state before anything else is added to it.
  let shownModel = finishModel;
  if (row && setContext) {
    try { await refreshSetRows(); } catch { /* the next start re-reads the server state */ }
    const settled = serverSetProjection(setContext);
    if (settled && !sameProjection(settled, setContext.projection) && slot && root?.contains?.(slot)) {
      shownModel = finishModelForSet(setContext, finished, settled);
      renderSessionSummary(root, { ...summaryArgs, finishModel:shownModel });
      slot = root.querySelector?.('[data-engagement-slot]');
      root.querySelector?.('[data-session-finish-heading]')?.focus?.();
    }
  }
  if (!slot || !root?.contains?.(slot)) return;
  if (!row) { slot.remove(); return; }
  state.missions = [...(state.missions ?? []).filter(existing => existing.mission_id !== row.mission_id), row];
  const evaluation = evaluateMission(state.missions, row.mission_id);
  const challenge = nextChallenge({ evaluation, stageId:shownModel?.nextStageId ?? shownModel?.stageId ?? null, answersToClear:null, stageCleared:shownModel?.variant === 'stage-complete' || shownModel?.variant === 'set-complete', mastered:shownModel?.variant === 'mastered' });
  const before = engagementData(state.missions.filter(existing => existing.mission_id !== row.mission_id));
  const after = engagementData(state.missions);
  const unlocked = newAchievements(after.list, state.userKey);
  markAchievementsSeen(after.list, state.userKey);
  const info = describeEngagement(evaluation, challenge, { xpGained:Math.max(0, after.xp.total - before.xp.total), level:after.xp.level, levelUp:after.xp.level > before.xp.level, unlocked });
  if (!info) { slot.remove(); return; }
  slot.innerHTML = renderEngagementStrip(info);
  slot.dataset.engagement = 'ready'; slot.dataset.personalBest = String(info.isPersonalBest); slot.removeAttribute('aria-busy');
}
// The Set the mission was played in, as the server now holds it, in the same shape projectSettlement() returns.
function serverSetProjection(context) {
  const row = groupSetRows(state.setRows)[state.pathwayId]?.[context.step.setNumber];
  if (!row) return null;
  const maintain = row.status === 'maintain';
  return { stage:row.stage, phase:row.phase, maintain, advanced:maintain || row.stage !== context.step.stage, advancedWithSupport:(row.advancedWithSupport ?? []).length > (context.step.advancedWithSupportCount ?? 0) };
}
function sameProjection(a, b) { return Boolean(a && b) && a.stage === b.stage && a.phase === b.phase && a.maintain === b.maintain; }
// The results screen reads server-applied pathway progression, so finishing is the one place that must wait for the
// save queue. With nothing pending it finishes synchronously; otherwise the button shows a short "Saving progress…".
function showFinishSaving(saving) {
  const button = root?.querySelector?.('[data-action="next-question"]');
  if (!button) return;
  if (saving) {
    if (button.dataset.savingOriginal != null) return;
    button.dataset.savingOriginal = button.firstChild?.nodeValue ?? ''; button.disabled = true; button.setAttribute('aria-busy', 'true');
    if (button.firstChild?.nodeType === 3) button.firstChild.nodeValue = 'Saving progress… ';
  } else if (button.dataset.savingOriginal != null) {
    if (button.firstChild?.nodeType === 3) button.firstChild.nodeValue = button.dataset.savingOriginal;
    delete button.dataset.savingOriginal; button.disabled = false; button.removeAttribute('aria-busy');
  }
}
async function finishSessionWhenSaved() {
  if (!state.session || state.finishPending) return;
  state.finishPending = true;
  const session = state.session;
  const current = state.current;
  clearClock();
  if (attempts().pending || attempts().blocked) {
    showFinishSaving(true);
    await attempts().settled();
    if (attempts().blocked && !await attempts().retry()) { state.finishPending = false; showFinishSaving(false); return; }
    if (state.session !== session || (current && state.current !== current)) { state.finishPending = false; return; }
  }
  finishSession();
  state.finishPending = false;
}
function startActiveTime() {
  ['pointerdown','keydown','input','touchstart'].forEach(type => document.addEventListener(type, () => { state.lastInteractionAt = Date.now(); }, { passive:true }));
  state.activeTimer = window.setInterval(() => { if (document.visibilityState !== 'visible' || Date.now() - state.lastInteractionAt > 120000) return; state.activeSeconds += 30; if (state.activeSeconds >= 60) { const seconds = state.activeSeconds; state.activeSeconds = 0; if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'active_time', active_seconds:seconds, mode:'practice' }).catch(() => {}); } }, 30000);
}
root?.addEventListener('submit', event => { const form = event.target; if (form?.dataset?.form !== 'vocabulary-answer') return; event.preventDefault(); try { handleAnswer(form); } catch (error) { renderVocabularyError(root, error instanceof Error ? error.message : 'Unable to check that answer.'); } });
root?.addEventListener('keydown', event => {
  const item = event.target?.closest?.('[data-match-word], [data-match-definition]'); const current = state.current;
  if (!item || !current?.matchSet) return;
  const target = matchKeyTarget(current.matchSet, item.dataset.matchWord ? 'word' : 'definition', item.dataset.matchWord ?? item.dataset.matchDefinition, event.key);
  if (!target) return;
  event.preventDefault();
  root.querySelector?.(`[data-match-${target.side}="${target.id}"]`)?.focus?.();
});
root?.addEventListener('keydown', event => {
  if (event.key === 'Escape' && root.querySelector?.('[data-achievements-backdrop]')) { event.preventDefault(); closeAchievements(); return; }
  const sheet = root.querySelector?.('[data-practice-sheet]'); if (!sheet) return;
  if (event.key === 'Escape') { event.preventDefault(); closePracticeSheet(); return; }
  if (event.key !== 'Tab') return;
  const focusable = [...sheet.querySelectorAll('button:not([disabled])')]; if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length - 1], active = document.activeElement;
  if (event.shiftKey && (active === first || !sheet.contains(active))) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && (active === last || !sheet.contains(active))) { event.preventDefault(); first.focus(); }
});
root?.addEventListener('click', event => {
  if (event.target?.matches?.('[data-practice-sheet-backdrop]')) { closePracticeSheet(); return; }
  const matchItem = event.target?.closest?.('[data-match-word], [data-match-definition]');
  if (matchItem) { if (!matchDragJustEnded()) handleMatchTap(matchItem); return; }
  const choice = event.target?.closest?.('[data-choice-answer], [data-evidence-answer]');
  if (choice) { const form = choice.closest?.('[data-form="vocabulary-answer"]'); const answer = choice.dataset.choiceAnswer ?? choice.dataset.evidenceAnswer; try { handleAnswer(form, answer); } catch (error) { renderVocabularyError(root, error instanceof Error ? error.message : 'Unable to check that answer.'); } return; }
  const tile = event.target?.closest?.('[data-tile-answer]');
  if (tile) { const form = tile.closest?.('[data-form="vocabulary-answer"]'); const input = form?.querySelector?.('input[name="answer"]'); const build = form?.querySelector?.('[data-tile-build]'); if (!input || tile.disabled) return; if (build?.dataset?.missingTemplate) { const template = JSON.parse(build.dataset.missingTemplate); const filled = JSON.parse(build.dataset.filled || '[]'); if (filled.length >= template.filter(letter => letter == null).length) return; filled.push(tile.dataset.tileAnswer); build.dataset.filled = JSON.stringify(filled); let next = 0; const word = template.map(letter => letter ?? filled[next++] ?? null); input.value = word.every(letter => letter != null) ? word.join(' ') : ''; build.textContent = word.map(letter => letter ?? '_').join(' '); tile.disabled = true; tile.classList.add('is-used'); const notice = form.querySelector?.('[data-tile-validation]'); if (notice) notice.textContent = ''; return; } const parts = String(input.value ?? '').trim().split(/\s+/).filter(Boolean); parts.push(tile.dataset.tileAnswer); input.value = parts.join(' '); tile.disabled = true; tile.classList.add('is-used'); if (build) build.textContent = parts.join(' '); const notice = form.querySelector?.('[data-tile-validation]'); if (notice) notice.textContent = ''; return; }
  const target = event.target?.closest?.('[data-action]'); const action = target?.dataset?.action; if (!action) return;
  if (action === 'open-unit') openUnit(Number(target.dataset.unit)).catch(error => renderVocabularyError(root, error.message));
  else if (action === 'open-game') { if (!state.content) return; state.games?.destroy?.(); state.games = mountGames(root, { content:state.content, game:target.dataset.game, onExit:() => { state.games = null; renderCurrentUnit(); } }); } /* PROTOTYPE games: isolated, no state or client passed */
  else if (action === 'back-units') showHome().catch(error => renderVocabularyError(root, error.message)); else if (action === 'view-all-words') showAllWords();
  else if (action === 'open-pathway') { openFreshPracticeSheet(target.dataset.pathway).catch(error => renderVocabularyError(root, error.message)); }
  else if (action === 'start-recommended') { const pathwayId = target.dataset.pathway; saveLastChoice(pathwayId, null); closePracticeSheet(false); runAfterSaves(() => startPathwaySession(pathwayId)); }
  else if (action === 'start-practice-choice') { const pathwayId = target.dataset.pathway; saveLastChoice(pathwayId, target.dataset.family); closePracticeSheet(false); runAfterSaves(() => startPathwaySession(pathwayId, false, { familyId:target.dataset.family })); }
  else if (action === 'close-practice-sheet') closePracticeSheet();
  else if (action === 'open-achievements') openAchievements();
  else if (action === 'toggle-sound') toggleSound(target);
  else if (action === 'close-achievements') closeAchievements();
  else if (action === 'choose-practice') { const pathwayId = target.dataset.pathway; returnToCurrentUnit().then(() => openFreshPracticeSheet(pathwayId)).catch(error => renderVocabularyError(root, error.message)); }
  else if (action === 'start-mixed-review') runAfterSaves(() => startMixedReview(false, timerMinutes(target)));
  else if (action === 'continue-practice') runAfterSaves(() => continuePractice());
  else if (action === 'clear-tile-answer') {
    const form = target.closest?.('[data-form="vocabulary-answer"]'); const input = form?.querySelector?.('input[name="answer"]'); const build = form?.querySelector?.('[data-tile-build]');
    const fixed = String(target.dataset.fixedAnswer ?? '').trim(); if (!form || !input) return;
    for (const tile of form.querySelectorAll?.('.vocab-tile') ?? []) { tile.disabled = false; tile.classList.remove('is-used'); }
    input.value = fixed;
    if (build?.dataset?.missingTemplate) { build.dataset.filled = '[]'; build.textContent = JSON.parse(build.dataset.missingTemplate).map(letter => letter ?? '_').join(' '); }
    else if (build) build.textContent = fixed ? '' : 'Choose tiles to build your answer';
  }
  else if (action === 'retry-save') { attempts().retry().then(saved => { if (saved) clearSyncWarning(); }); }
  else if (action === 'next-question') advanceToNextQuestion().catch(error => renderVocabularyError(root, error.message)); else if (action === 'leave-session' || action === 'back-unit') returnToCurrentUnit().catch(error => renderVocabularyError(root, error.message));
});
async function initialise() {
  if (!root) return;
  try {
    state.client = await getSupabaseClient(); const { data:userData, error:userError } = await state.client.auth.getUser(); if (userError || !userData?.user) { window.location.replace('./'); return; } state.userKey = userData.user.id;
    const { data:profile, error:profileError } = await state.client.from('profiles').select('id, role, display_name, active').eq('id', userData.user.id).single(); const previewRequested = new URLSearchParams(window.location.search).get('preview') === '1'; const staff = profile?.role === 'teacher' || profile?.role === 'admin';
    if (profileError || !profile?.active || (profile.role !== 'student' && !(staff && previewRequested))) { window.location.replace('./'); return; }
    window.addEventListener('beforeunload', event => { if (attempts().pending) { event.preventDefault(); event.returnValue = ''; } });
    state.profile = profile; state.preview = staff && previewRequested; if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'app_open', mode:'practice' }).catch(() => {}); if (!state.preview) startActiveTime(); await showHome();
  } catch (error) { renderVocabularyError(root, error instanceof Error ? error.message : 'Vocabulary practice is unavailable right now.'); }
}
void initialise();