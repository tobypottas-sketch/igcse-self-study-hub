import { getSupabaseClient } from '../supabase.js';
import { loadVocabularyDashboard, loadVocabularyUnit, loadStudentMastery, submitVocabularyAttempt } from './data.js';
import { trackVocabularyEvent } from './tracking.js';
import { buildSupportStep } from './scaffolding.js';
import { completeAttempt, createSession, expireSession, isSessionComplete, missionProgress } from './session.js';
import { buildTargetPracticeQuestion, buildTimedMixedQuestion, selectEligiblePriorityTargets } from './session-targets.js';
import { planMixedReviewQuestion } from './mixed-review.js';
import { planPathwayQuestion, eligibleTargetsForPathwayStage } from './pathway-planner.js';
import { buildUnitPathwayStates, buildWordPathwayStates, targetsForPathwayStage } from './pathway-view-model.js';
import { buildSessionFinishModel } from './session-finish-model.js';
import { buildUnitProgress, renderSessionSummary, renderVocabularyError, renderVocabularyHome, renderVocabularyQuestion, renderVocabularyUnit, renderVocabularyWords, supportiveFeedback } from './views.js';
import { deriveLearningStage } from './learning-stage.js';
import { createAttemptPersistence } from './attempt-persistence.js';
import { buildMatchSet, checkMatchSet, finishedMatchState, newMatchState, revealMatchSet, tapMatchItem, pairMatchItems } from './match-set.js';
import { installMatchDrag, matchDragJustEnded } from './match-drag.js';
import { matchKeyTarget, renderMatchSet, repaintMatchSet } from './match-set-view.js';
import { applyEvidence, markCuratedAnswer } from '../../supabase/functions/_shared/vocabulary-engine.js';

const root = document.getElementById('vocabularyApp');
const state = {
  client:null, profile:null, preview:false, dashboard:null, units:[], currentUnitNumber:null, currentUnitTitle:null, content:null,
  globalMastery:{}, unitMastery:{}, session:null, queue:[], current:null, practiceFocus:null, pathwayId:null, pathwayStage:null, mixedReview:false,
  recentActivities:new Map(), usedContentIds:new Map(), recoveryNeeded:new Set(), clock:null, activeSeconds:0, lastInteractionAt:Date.now(), activeTimer:null, timedPreviousActivityType:null,
  finishPending:false, handoffPending:false, unitCache:new Map(), attempts:null, unitRequest:0, loadingUnit:null
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
function attempts() {
  return state.attempts ??= createAttemptPersistence({
    submit:payload => submitVocabularyAttempt(state.client, payload),
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
async function showHome() {
  state.unitRequest += 1; state.loadingUnit = null;
  clearClock(); state.currentUnitNumber = null; state.currentUnitTitle = null; state.content = null; state.practiceFocus = null; state.pathwayId = null; state.pathwayStage = null; state.mixedReview = false;
  state.dashboard = await loadVocabularyDashboard(state.client, { preview:state.preview }); state.units = buildUnits(state.dashboard);
  renderVocabularyHome(root, { displayName:state.profile.display_name, units:state.units }); decoratePreview();
}
function renderCurrentUnit() {
  if (!state.currentUnitNumber) return;
  const cachedOccurrences = (state.dashboard?.occurrences ?? []).filter(row => Number(row.unit_number) === Number(state.currentUnitNumber));
  const occurrences = state.content?.occurrences ?? cachedOccurrences;
  const summary = state.units.find(unit => Number(unit.unitNumber) === Number(state.currentUnitNumber));
  const progress = occurrences.length
    ? buildUnitProgress({ occurrences, unitMastery:state.unitMastery, globalMastery:state.globalMastery })
    : { mastered:summary?.mastered ?? 0, total:summary?.total ?? 50, needsAnotherLook:summary?.needsAnotherLook ?? 0, reviewDue:summary?.reviewDue ?? 0, stages:summary?.stages ?? {} };
  const pathwayStates = buildUnitPathwayStates({ occurrences, unitMastery:state.unitMastery, globalMastery:state.globalMastery });
  renderVocabularyUnit(root, { unitNumber:state.currentUnitNumber, unitTitle:state.currentUnitTitle, progress, pathwayStates, contentReady:Boolean(state.content) }); decoratePreview();
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
  state.practiceFocus = null; state.pathwayId = null; state.pathwayStage = null; state.mixedReview = false;
  const cached = state.unitCache.get(unitNumber);
  if (cached) {
    state.currentUnitNumber = unitNumber;
    state.currentUnitTitle = cached.currentUnitTitle;
    state.content = cached.content;
    state.globalMastery = cached.globalMastery;
    state.unitMastery = cached.unitMastery;
    state.finishPending = false;
    renderCurrentUnit();
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
    const [contentRaw, masteryRaw] = await Promise.all([contentPromise, masteryPromise]);
    if (request !== state.unitRequest) return;
    // Never reset the attempt queue here: an unsaved answer must survive opening or reloading a unit.
    state.finishPending = false;
    const occurrences = contentRaw.occurrences.map(occurrence); const items = contentRaw.items.map(item); const contexts = contentRaw.contexts.map(context); const activities = (contentRaw.activities ?? []).map(unitActivity);
    state.content = { occurrences, items, contexts, activities, itemsById:mapBy(items,'vocabularyId'), contextsByOccurrence:{}, activitiesById:mapBy(activities,'activityContentId') };
    for (const ctx of contexts) (state.content.contextsByOccurrence[ctx.occurrenceId] ??= []).push(ctx);
    state.globalMastery = mapBy(masteryRaw.global, 'vocabulary_id', mastery); state.unitMastery = mapBy(masteryRaw.unit, 'occurrence_id', row => ({ status:row.status, recentErrorPattern:row.recent_error_pattern, contextualEvidence:row.contextual_evidence ?? {} }));
    state.currentUnitNumber = unitNumber;
    state.currentUnitTitle = occurrences[0]?.unitTitle ?? preloadedOccurrences[0]?.unit_title ?? state.units.find(unit => Number(unit.unitNumber) === Number(unitNumber))?.unitTitle ?? `Unit ${unitNumber}`;
    state.unitCache.set(unitNumber, { content:state.content, globalMastery:state.globalMastery, unitMastery:state.unitMastery, currentUnitTitle:state.currentUnitTitle });
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
  const words = state.content.occurrences.slice().sort((a,b) => a.positionInUnit - b.positionInUnit).map(occ => {
    const target = state.content.itemsById[occ.vocabularyId]; const global = state.globalMastery[occ.vocabularyId] ?? freshMastery();
    const linkedContexts = state.content.contextsByOccurrence[occ.occurrenceId] ?? [];
    const dictionaryContext = linkedContexts.find(ctx => ctx.type === 'meaning_context') ?? linkedContexts.find(ctx => ctx.type === 'production_context') ?? linkedContexts.find(ctx => ctx.type === 'paraphrase_context') ?? linkedContexts[0] ?? null;
    return { term:target?.term ?? occ.vocabularyId, partOfSpeech:target?.partOfSpeech ?? '', definition:target?.coreMeaning ?? '', contextSentence:dictionaryContext?.text ?? '', status:global.status ?? 'new', learningStage:deriveLearningStage(global), mastery:global, pathways:buildWordPathwayStates({ occurrence:occ, unitMastery:state.unitMastery, globalMastery:state.globalMastery }), strands:{ meaning:strandLabel(global.strandEvidence?.meaning, global.status), recognition:strandLabel(global.strandEvidence?.recognition, global.status), context:strandLabel(global.strandEvidence?.context, global.status), paraphrasing:strandLabel(global.strandEvidence?.paraphrasing, global.status), production:strandLabel(global.strandEvidence?.production, global.status) } };
  });
  renderVocabularyWords(root, { unitNumber:state.currentUnitNumber, unitTitle:state.currentUnitTitle, words }); decoratePreview();
}
function rankedTargets(limit, practiceMode = state.practiceFocus) {
  return selectEligiblePriorityTargets({ content:state.content, masteryByVocabularyId:state.globalMastery, unitMastery:state.unitMastery, practiceMode, now:new Date(), limit });
}
function resetSessionState(continueHistory = false) {
  // Continue stays in the same unit; explicit activity starts get fresh selection history.
  if (!continueHistory) { state.recentActivities = new Map(); state.usedContentIds = new Map(); }
  state.current = null; state.recoveryNeeded = new Set(); state.timedPreviousActivityType = null; state.finishPending = false;
}
function startPathwaySession(pathwayId, continueHistory = false) {
  if (!state.content) throw new Error('Vocabulary activities are still loading. Please try again.');
  const pathwayStates = buildUnitPathwayStates({ occurrences:state.content.occurrences, unitMastery:state.unitMastery, globalMastery:state.globalMastery });
  const stageId = pathwayStates?.[pathwayId]?.currentStage ?? 'recognise';
  const stageTargets = targetsForPathwayStage({ pathwayId, stageId, occurrences:state.content.occurrences, unitMastery:state.unitMastery, globalMastery:state.globalMastery });
  const stageTargetIds = new Set(stageTargets.map(target => target.occurrenceId));
  const eligible = eligibleTargetsForPathwayStage({ pathwayId, stageId, content:state.content, masteryByVocabularyId:state.globalMastery, seed:`unit-${state.currentUnitNumber}:${pathwayId}:${stageId}` })
    .filter(target => stageTargetIds.has(target.occurrenceId));
  if (!eligible.length) throw new Error('No suitable curated activity is available for this pathway stage yet.');
  const eligibleIds = new Set(eligible.map(target => target.occurrenceId));
  const ranked = rankedTargets(Math.max(10,state.content.occurrences.length),'adaptive').filter(target => eligibleIds.has(target.occurrenceId));
  const selected = [...ranked, ...eligible.filter(target => !ranked.some(row => row.occurrenceId === target.occurrenceId))].slice(0,10);
  state.pathwayId = pathwayId; state.pathwayStage = stageId; state.practiceFocus = null; state.mixedReview = false;
  state.session = createSession({ unitNumber:state.currentUnitNumber, mode:'adaptive', targetIds:selected.map(row => row.occurrenceId), practiceMode:'adaptive', now:new Date() });
  state.queue = [...selected]; resetSessionState(continueHistory);
  if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'section_use', activity_id:`pathway:${pathwayId}:${stageId}`, skill:'vocabulary_mastery', mode:'practice', set_id:`unit-${state.currentUnitNumber}`, metadata:{ unit_number:state.currentUnitNumber, pathway_id:pathwayId, pathway_stage:stageId } }).catch(() => {});
  nextQuestion();
}
function timerMinutes(button) { const minutes = Number(button?.dataset?.minutes); return Number.isFinite(minutes) && minutes > 0 ? minutes : null; }
function startMixedReview(continueHistory = false, durationMinutes = null) {
  if (!state.content) throw new Error('Vocabulary activities are still loading. Please try again.');
  state.pathwayId = null; state.pathwayStage = null; state.mixedReview = true; state.practiceFocus = 'adaptive';
  const timed = Number.isFinite(Number(durationMinutes)) && Number(durationMinutes) > 0;
  const selected = rankedTargets(timed ? Math.max(10, state.content.occurrences.length) : 10,'adaptive');
  if (!selected.length) throw new Error('No unlocked vocabulary is ready for Mixed Practice yet.');
  state.session = createSession({ unitNumber:state.currentUnitNumber, mode:timed ? 'timed' : 'adaptive', durationMinutes:timed ? Number(durationMinutes) : null, targetIds:selected.map(row => row.occurrenceId), practiceMode:'adaptive', now:new Date() });
  state.queue = [...selected]; resetSessionState(continueHistory); if (timed) startClock();
  if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'section_use', activity_id:'session:mixed-review', skill:'vocabulary_mastery', mode:'practice', set_id:`unit-${state.currentUnitNumber}`, metadata:{ unit_number:state.currentUnitNumber, review_only:true, timed_minutes:timed ? Number(durationMinutes) : null } }).catch(() => {});
  nextQuestion();
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
  if (state.pathwayId) { startPathwaySession(state.pathwayId, true); return; }
  if (state.mixedReview) { startMixedReview(true, state.session?.mode === 'timed' ? state.session.durationMinutes : null); return; }
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
  const reviewDue = Boolean(masteryState.reviewDueAt && new Date(masteryState.reviewDueAt).getTime() <= Date.now());
  const common = {
    content:state.content,
    target,
    mastery:masteryState,
    recentActivities:recent,
    supportState:{ recycle:recovery, struggling:recovery },
    reviewDue,
    usedContentIds,
    seed:`${target.occurrenceId}:${state.session.completedAttempts.length}:${state.session.mode}`,
    optionNonce:state.session.optionNonce
  };
  let built;
  if (state.mixedReview) {
    built = planMixedReviewQuestion({ content:state.content, target, unitMastery:state.unitMastery, globalMastery:state.globalMastery, recentActivities:recent.map(entry => entry.type), usedContentIds, seed:common.seed });
  } else if (state.pathwayId) {
    built = planPathwayQuestion({ pathwayId:state.pathwayId, stageId:state.pathwayStage, content:state.content, target, mastery:masteryState, recentActivities:recent.map(entry => entry.type), usedContentIds, supportState:common.supportState, seed:common.seed, optionNonce:common.optionNonce });
  } else {
    built = state.session.mode === 'timed'
      ? buildTimedMixedQuestion({ ...common, previousActivityType:state.timedPreviousActivityType })
      : buildTargetPracticeQuestion({ ...common, practiceMode:state.session.practiceMode ?? state.practiceFocus });
  }
  const targetItem = built.item; const targetContexts = built.contexts; const question = built.question;
  if (state.session.mode === 'timed') state.timedPreviousActivityType = question.type;
  if (question.contentId) {
    // Keep record and operation-specific variant identities in the existing target history.
    const variant = question.activityVariantId == null ? [] : [JSON.stringify([question.contentId, question.type, question.activityVariantId])];
    state.usedContentIds.set(target.occurrenceId, [...new Set([...usedContentIds, question.contentId, ...variant])]);
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
  if (!state.queue.length) { if (state.session.mode === 'timed') state.queue = rankedTargets(Math.min(20, state.content.occurrences.length), 'adaptive'); else { void finishSessionWhenSaved(); return; } }
  let current = null; let guard = state.queue.length;
  while (!current && guard > 0) { const target = state.queue.shift(); guard -= 1; if (!target) break; if (state.session.mode === 'adaptive' && state.session.completedTargetIds.includes(target.occurrenceId) && !state.recoveryNeeded.has(target.occurrenceId)) continue; try { current = buildNextForTarget(target); } catch { state.queue.push(target); } }
  if (!current) { if (state.session.mode === 'timed') { void finishSessionWhenSaved(); return; } if (Number(state.session.summary?.practised) > 0 || state.session.completedTargetIds?.length) { void finishSessionWhenSaved(); return; } throw new Error('No suitable curated activity is available for this practice mode yet.'); }
  state.current = current; renderCurrentQuestion();
}
function renderCurrentQuestion(feedback = null) { if (!state.current) return; const currentMastery = state.globalMastery[state.current.target.vocabularyId] ?? freshMastery(); renderVocabularyQuestion(root, { unitNumber:state.currentUnitNumber, unitTitle:state.current.target.unitTitle, question:state.current.question, term:state.current.item.term, sessionLabel:remainingLabel(), learningStage:deriveLearningStage(currentMastery), feedback, retry:state.current.retry, support:state.current.support, matchSet:state.current.matchSet ?? null, matchState:state.current.matchState ?? null }); decoratePreview(); if (state.attempts?.blocked) renderSyncWarning(); }
function markVocabularyAttemptLocally(current, rawAnswer) {
  const sense = Array.isArray(current.item?.senses) ? current.item.senses.find(candidate => candidate?.senseId === current.target.senseId) : null; if (!sense) throw new Error('This vocabulary question is missing its marking data.');
  const reference = current.question.markingReference ?? {}; const markingContext = { contextId:current.context?.contextId ?? current.question.contentId, activityContentId:current.activityRecord?.activityContentId ?? null, acceptedAnswers:reference.acceptedAnswers ?? [], distractors:reference.distractors ?? [] };
  const marked = markCuratedAnswer({ item:{ vocabularyId:current.item.vocabularyId }, sense, context:markingContext, questionType:current.question.type, rawAnswer });
  return { ...marked, strand:current.question.strands?.[0], strands:current.question.strands ?? marked.evidence?.strands ?? [] };
}
function updatesTargetMastery(current) { if (current.context) return true; return Boolean(current.primaryEvidenceTargetId && current.primaryEvidenceTargetId === current.target.vocabularyId); }
function evidenceFor(current, result, flags) {
  return { strand:result.strand, strands:current.question.strands, correct:result.correct, evidenceStrength:current.question.evidenceStrength, supportLevel:flags.supportLevel, productive:current.question.productive, repeatedGuess:false, firstAttempt:flags.firstAttempt, retryUsed:flags.retryUsed, recoveredLater:flags.recoveredLater, contextId:current.context?.contextId ?? null, activityContentId:current.activityRecord?.activityContentId ?? null, questionType:current.question.type, activityType:current.question.type, review:state.preview ? false : flags.review };
}
function persistVocabularyAttempt(current, rawAnswer, flags, localResult) {
  const contentSource = current.activityRecord ? 'unit_activity' : current.context ? 'context' : 'item';
  const pathwayFields = state.mixedReview && current.pathwayPlan ? { pathwayId:current.pathwayPlan.pathwayId, pathwayStage:current.pathwayPlan.learnerStage, servedPathwayStage:current.pathwayPlan.servedStage ?? current.pathwayPlan.learnerStage } : state.pathwayId ? { pathwayId:state.pathwayId, pathwayStage:state.pathwayStage, servedPathwayStage:current.pathwayPlan?.servedStage ?? state.pathwayStage } : {};
  const payload = { occurrenceId:current.target.occurrenceId, contextId:current.context?.contextId ?? null, activityContentId:current.activityRecord?.activityContentId ?? null, activityVariantId:current.question.activityVariantId ?? null, contentSource, primaryEvidenceTargetId:current.primaryEvidenceTargetId, questionType:current.question.type, rawAnswer, strands:current.question.strands, evidenceStrength:current.question.evidenceStrength, supportLevel:flags.declaredSupportLevel ?? flags.supportLevel, productive:current.question.productive, repeatedGuess:false, firstAttempt:flags.firstAttempt, retryUsed:flags.retryUsed, recoveredLater:flags.recoveredLater, review:flags.review, preview:false, ...pathwayFields };
  return attempts().enqueue({ payload, localCorrect:localResult.correct, context:{ occurrenceId:current.target.occurrenceId, vocabularyId:current.target.vocabularyId } });
}
async function returnToCurrentUnit() {
  // Leaving is independent of saving; keep the queued attempt and its sync guard intact.
  clearClock();
  state.current = null;
  state.session = null;
  state.queue = [];
  state.pathwayId = null; state.pathwayStage = null; state.mixedReview = false; state.practiceFocus = null;
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
  const go = () => { try { start(); } catch (error) { renderVocabularyError(root, error instanceof Error ? error.message : 'Unable to start that activity.'); } };
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
  const previousGlobal = state.globalMastery[current.target.vocabularyId] ?? freshMastery(); const previousGlobalStatus = previousGlobal.status ?? 'new'; const review = Boolean(previousGlobal.reviewDueAt && new Date(previousGlobal.reviewDueAt).getTime() <= Date.now());
  // supportLevel feeds evidence exactly as before. declaredSupportLevel is what the browser tells the server about the question it served: a lower-stage recovery question is temporary support, as the pathway planner declared.
  const retrySupport = current.retry ? (current.support?.supportLevel ?? 'light') : 'none';
  const flags = { firstAttempt:!current.retry, retryUsed:current.retry, recoveredLater:current.recovery, review, supportLevel:retrySupport, declaredSupportLevel:current.retry ? retrySupport : (current.pathwayPlan?.supportLevel ?? 'none') };
  const result = markVocabularyAttemptLocally(current, rawAnswer); const shouldUpdate = updatesTargetMastery(current); const nextGlobal = shouldUpdate ? applyEvidence(previousGlobal, evidenceFor(current, result, flags), new Date()) : previousGlobal;
  if (shouldUpdate) {
    const previousPattern = previousGlobal.recentErrorPattern ?? state.unitMastery[current.target.occurrenceId]?.recentErrorPattern ?? null;
    const nextErrorPattern = result.correct ? (nextGlobal.recentErrorCount > 0 ? previousPattern : null) : (result.misconceptionCategory ?? 'retrieval_failure');
    state.globalMastery[current.target.vocabularyId] = { ...nextGlobal, recentErrorPattern:nextErrorPattern };
    const previousUnit = state.unitMastery[current.target.occurrenceId] ?? { contextualEvidence:{} };
    const previousDetail = previousUnit.contextualEvidence ?? {};
    state.unitMastery[current.target.occurrenceId] = { ...previousUnit, status:nextGlobal.status, recentErrorPattern:nextErrorPattern, contextualEvidence:{ ...previousDetail, strandEvidence:nextGlobal.strandEvidence } };
  }
  const recoverySucceeded = current.recovery && result.correct; if (!state.preview) void persistVocabularyAttempt(current, rawAnswer, flags, result);
  const message = supportiveFeedback({ correct:result.correct, misconceptionCategory:result.misconceptionCategory, recovery:recoverySucceeded, term:current.item.term, meaning:current.item.coreMeaning, questionType:current.question.type });
  if (!result.correct && !current.retry) { current.initialError = true; current.retry = true; current.support = buildSupportStep(current.question, { correct:false, misconceptionCategory:result.misconceptionCategory, attemptNumber:1 }); renderCurrentQuestion({ correct:false, message }); return; }
  current.answered = true;
  recordRecentActivity(current, result); const hadError = current.initialError || !result.correct;
  if (hadError && !current.recovery) { state.recoveryNeeded.add(current.target.occurrenceId); state.queue.push(current.target); } else if (current.recovery) state.recoveryNeeded.delete(current.target.occurrenceId);
  const completeTarget = current.recovery || !hadError;
  state.session = completeAttempt(state.session, { targetId:current.target.occurrenceId, evidence:{ correct:result.correct, recovery:recoverySucceeded, activityType:current.question.type }, completeTarget, strengthened:result.correct, movedToSecure:shouldUpdate && previousGlobalStatus !== 'secure' && nextGlobal.status === 'secure', mastered:shouldUpdate && previousGlobalStatus !== 'mastered' && nextGlobal.status === 'mastered', needsAnotherLook:completeTarget && !result.correct });
  current.support = !result.correct ? buildSupportStep(current.question, { correct:false, misconceptionCategory:result.misconceptionCategory, attemptNumber:2 }) : null;
  if (current.matchSet) current.matchState = result.correct && Object.keys(current.matchState.settled).length === current.matchSet.words.length ? finishedMatchState(current.matchSet, current.matchState) : revealMatchSet(current.matchSet, current.matchState);
  renderCurrentQuestion({ correct:result.correct, message });
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
function finishSession() {
  if (!state.session) return;
  if (state.session.mode === 'timed') state.session = expireSession(state.session, new Date());
  clearClock();
  const finished = state.session;
  const postPathwayState = state.pathwayId && state.content
    ? buildUnitPathwayStates({ occurrences:state.content.occurrences, unitMastery:state.unitMastery, globalMastery:state.globalMastery })?.[state.pathwayId] ?? null
    : null;
  const finishModel = state.pathwayId
    ? buildSessionFinishModel({ summary:finished.summary, pathwayId:state.pathwayId, startStage:state.pathwayStage, postPathwayState, preview:state.preview, fixedMissionSize:10 })
    : null;
  state.current = null;
  if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'exercise_result', activity_id:`session_complete:${finished.mode}:${state.pathwayId ?? (state.mixedReview ? 'mixed-review' : finished.practiceMode ?? 'adaptive')}`, skill:'vocabulary_mastery', mode:'practice', set_id:`unit-${finished.unitNumber}`, score:finished.summary.strengthened, max_score:Math.max(1, finished.summary.practised), metadata:{ unit_number:finished.unitNumber, pathway_id:state.pathwayId, pathway_stage:state.pathwayStage, review_only:state.mixedReview } }).catch(() => {});
  renderSessionSummary(root, { durationMinutes:finished.durationMinutes, summary:finished.summary, practiceMode:finished.practiceMode ?? 'adaptive', pathwayId:state.pathwayId, finishModel });
  decoratePreview();
  root.querySelector?.('[data-session-finish-heading]')?.focus?.();
}
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
root?.addEventListener('click', event => {
  const matchItem = event.target?.closest?.('[data-match-word], [data-match-definition]');
  if (matchItem) { if (!matchDragJustEnded()) handleMatchTap(matchItem); return; }
  const choice = event.target?.closest?.('[data-choice-answer], [data-evidence-answer]');
  if (choice) { const form = choice.closest?.('[data-form="vocabulary-answer"]'); const answer = choice.dataset.choiceAnswer ?? choice.dataset.evidenceAnswer; try { handleAnswer(form, answer); } catch (error) { renderVocabularyError(root, error instanceof Error ? error.message : 'Unable to check that answer.'); } return; }
  const tile = event.target?.closest?.('[data-tile-answer]');
  if (tile) { const form = tile.closest?.('[data-form="vocabulary-answer"]'); const input = form?.querySelector?.('input[name="answer"]'); const build = form?.querySelector?.('[data-tile-build]'); if (!input || tile.disabled) return; const parts = String(input.value ?? '').trim().split(/\s+/).filter(Boolean); parts.push(tile.dataset.tileAnswer); input.value = parts.join(' '); tile.disabled = true; tile.classList.add('is-used'); if (build) build.textContent = parts.join(' '); const notice = form.querySelector?.('[data-tile-validation]'); if (notice) notice.textContent = ''; return; }
  const target = event.target?.closest?.('[data-action]'); const action = target?.dataset?.action; if (!action) return;
  if (action === 'open-unit') openUnit(Number(target.dataset.unit)).catch(error => renderVocabularyError(root, error.message));
  else if (action === 'back-units') showHome().catch(error => renderVocabularyError(root, error.message)); else if (action === 'view-all-words') showAllWords();
  else if (action === 'open-pathway') runAfterSaves(() => startPathwaySession(target.dataset.pathway));
  else if (action === 'start-mixed-review') runAfterSaves(() => startMixedReview(false, timerMinutes(target)));
  else if (action === 'continue-practice') runAfterSaves(() => continuePractice());
  else if (action === 'clear-tile-answer') {
    const form = target.closest?.('[data-form="vocabulary-answer"]'); const input = form?.querySelector?.('input[name="answer"]'); const build = form?.querySelector?.('[data-tile-build]');
    const fixed = String(target.dataset.fixedAnswer ?? '').trim(); if (!form || !input) return;
    for (const tile of form.querySelectorAll?.('.vocab-tile') ?? []) { tile.disabled = false; tile.classList.remove('is-used'); }
    input.value = fixed; if (build) build.textContent = fixed ? '' : 'Choose tiles to build your answer';
  }
  else if (action === 'retry-save') { attempts().retry().then(saved => { if (saved) clearSyncWarning(); }); }
  else if (action === 'next-question') advanceToNextQuestion().catch(error => renderVocabularyError(root, error.message)); else if (action === 'leave-session' || action === 'back-unit') returnToCurrentUnit().catch(error => renderVocabularyError(root, error.message));
});
async function initialise() {
  if (!root) return;
  try {
    state.client = await getSupabaseClient(); const { data:userData, error:userError } = await state.client.auth.getUser(); if (userError || !userData?.user) { window.location.replace('./'); return; }
    const { data:profile, error:profileError } = await state.client.from('profiles').select('id, role, display_name, active').eq('id', userData.user.id).single(); const previewRequested = new URLSearchParams(window.location.search).get('preview') === '1'; const staff = profile?.role === 'teacher' || profile?.role === 'admin';
    if (profileError || !profile?.active || (profile.role !== 'student' && !(staff && previewRequested))) { window.location.replace('./'); return; }
    window.addEventListener('beforeunload', event => { if (attempts().pending) { event.preventDefault(); event.returnValue = ''; } });
    state.profile = profile; state.preview = staff && previewRequested; if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'app_open', mode:'practice' }).catch(() => {}); if (!state.preview) startActiveTime(); await showHome();
  } catch (error) { renderVocabularyError(root, error instanceof Error ? error.message : 'Vocabulary practice is unavailable right now.'); }
}
void initialise();