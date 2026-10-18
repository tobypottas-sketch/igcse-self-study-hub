import { getSupabaseClient } from '../supabase.js';
import { loadVocabularyDashboard, loadVocabularyUnit, loadStudentMastery, submitVocabularyAttempt } from './data.js';
import { trackVocabularyEvent } from './tracking.js';
import { buildSupportStep } from './scaffolding.js';
import { completeAttempt, createSession, expireSession, isSessionComplete } from './session.js';
import { buildTargetPracticeQuestion, buildTimedMixedQuestion, selectEligiblePriorityTargets } from './session-targets.js';
import { planPathwayQuestion, eligibleTargetsForPathwayStage } from './pathway-planner.js';
import { buildUnitPathwayStates } from './pathway-view-model.js';
import { buildUnitProgress, renderSessionSummary, renderVocabularyError, renderVocabularyHome, renderVocabularyQuestion, renderVocabularyUnit, renderVocabularyWords, supportiveFeedback } from './views.js';
import { deriveLearningStage } from './learning-stage.js';
import { applyEvidence, markCuratedAnswer } from '../../supabase/functions/_shared/vocabulary-engine.js';

const root = document.getElementById('vocabularyApp');
const state = {
  client:null, profile:null, preview:false, dashboard:null, units:[], currentUnitNumber:null, currentUnitTitle:null, content:null,
  globalMastery:{}, unitMastery:{}, session:null, queue:[], current:null, practiceFocus:null, pathwayId:null, pathwayStage:null, mixedReview:false,
  recentActivities:new Map(), usedContentIds:new Map(), recoveryNeeded:new Set(), clock:null, activeSeconds:0, lastInteractionAt:Date.now(), activeTimer:null, timedPreviousActivityType:null,
  persistenceChain:Promise.resolve(), persistenceBlocked:false, finishPending:false
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
  const shell = root?.querySelector?.('.vocab-shell');
  if (!shell || shell.querySelector?.('[data-vocab-sync-warning]')) return;
  const warning = document.createElement('aside'); warning.className = 'vocab-sync-warning'; warning.dataset.vocabSyncWarning = 'true';
  warning.textContent = 'Your answer was checked, but progress could not be saved. Check your connection before continuing.'; shell.prepend(warning);
}
function buildUnits(dashboard) {
  const grouped = new Map(); const global = mapBy(dashboard.global, 'vocabulary_id'); const unit = mapBy(dashboard.unit, 'occurrence_id');
  for (const row of dashboard.occurrences) { if (!grouped.has(row.unit_number)) grouped.set(row.unit_number, { unitNumber:row.unit_number, unitTitle:row.unit_title, occurrences:[] }); grouped.get(row.unit_number).occurrences.push(row); }
  return [...grouped.values()].sort((a,b) => a.unitNumber - b.unitNumber).map(group => ({ unitNumber:group.unitNumber, unitTitle:group.unitTitle, ...buildUnitProgress({ occurrences:group.occurrences, unitMastery:unit, globalMastery:global }) }));
}
async function showHome() {
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
async function openUnit(unitNumber) {
  clearClock();
  const preloadedOccurrences = (state.dashboard?.occurrences ?? []).filter(row => Number(row.unit_number) === Number(unitNumber));
  const loadOptions = preloadedOccurrences.length ? { occurrences:preloadedOccurrences } : {};
  const occurrenceIds = new Set(preloadedOccurrences.map(row => row.occurrence_id));
  const vocabularyIds = new Set(preloadedOccurrences.map(row => row.vocabulary_id));
  const dashboardMastery = preloadedOccurrences.length && state.dashboard
    ? { global:state.dashboard.global.filter(row => vocabularyIds.has(row.vocabulary_id)), unit:state.dashboard.unit.filter(row => occurrenceIds.has(row.occurrence_id)) }
    : null;
  state.currentUnitNumber = unitNumber;
  state.currentUnitTitle = preloadedOccurrences[0]?.unit_title ?? state.units.find(unit => Number(unit.unitNumber) === Number(unitNumber))?.unitTitle ?? `Unit ${unitNumber}`;
  state.content = null; state.practiceFocus = null; state.pathwayId = null; state.pathwayStage = null; state.mixedReview = false;
  state.globalMastery = mapBy(dashboardMastery?.global ?? [], 'vocabulary_id', mastery);
  state.unitMastery = mapBy(dashboardMastery?.unit ?? [], 'occurrence_id', row => ({ status:row.status, recentErrorPattern:row.recent_error_pattern, contextualEvidence:row.contextual_evidence ?? {} }));
  state.persistenceBlocked = false; state.finishPending = false;
  renderCurrentUnit();
  const contentPromise = loadVocabularyUnit(state.client, unitNumber, loadOptions);
  const masteryPromise = state.preview
    ? Promise.resolve({ global:[], unit:[] })
    : dashboardMastery
      ? Promise.resolve(dashboardMastery)
      : loadStudentMastery(state.client, unitNumber, loadOptions);
  const [contentRaw, masteryRaw] = await Promise.all([contentPromise, masteryPromise]);
  if (Number(state.currentUnitNumber) !== Number(unitNumber)) return;
  const occurrences = contentRaw.occurrences.map(occurrence); const items = contentRaw.items.map(item); const contexts = contentRaw.contexts.map(context); const activities = (contentRaw.activities ?? []).map(unitActivity);
  state.content = { occurrences, items, contexts, activities, itemsById:mapBy(items,'vocabularyId'), contextsByOccurrence:{}, activitiesById:mapBy(activities,'activityContentId') };
  for (const ctx of contexts) (state.content.contextsByOccurrence[ctx.occurrenceId] ??= []).push(ctx);
  state.globalMastery = mapBy(masteryRaw.global, 'vocabulary_id', mastery); state.unitMastery = mapBy(masteryRaw.unit, 'occurrence_id', row => ({ status:row.status, recentErrorPattern:row.recent_error_pattern, contextualEvidence:row.contextual_evidence ?? {} }));
  state.currentUnitTitle = occurrences[0]?.unitTitle ?? state.currentUnitTitle;
  renderCurrentUnit();
}
function strandLabel(value, status) { const score = Number(value ?? 0); if (status === 'mastered' && score >= 3) return 'Secure'; if (score >= 6) return 'Secure'; if (score >= 3) return 'Developing'; return 'Keep practising'; }
function showAllWords() {
  if (!state.content || !state.currentUnitNumber) return;
  const words = state.content.occurrences.slice().sort((a,b) => a.positionInUnit - b.positionInUnit).map(occ => {
    const target = state.content.itemsById[occ.vocabularyId]; const global = state.globalMastery[occ.vocabularyId] ?? freshMastery();
    return { term:target?.term ?? occ.vocabularyId, status:global.status ?? 'new', learningStage:deriveLearningStage(global), mastery:global, strands:{ meaning:strandLabel(global.strandEvidence?.meaning, global.status), recognition:strandLabel(global.strandEvidence?.recognition, global.status), context:strandLabel(global.strandEvidence?.context, global.status), paraphrasing:strandLabel(global.strandEvidence?.paraphrasing, global.status), production:strandLabel(global.strandEvidence?.production, global.status) } };
  });
  renderVocabularyWords(root, { unitNumber:state.currentUnitNumber, unitTitle:state.currentUnitTitle, words }); decoratePreview();
}
function rankedTargets(limit, practiceMode = state.practiceFocus) {
  return selectEligiblePriorityTargets({ content:state.content, masteryByVocabularyId:state.globalMastery, unitMastery:state.unitMastery, practiceMode, now:new Date(), limit });
}
function resetSessionState() {
  state.current = null; state.recentActivities = new Map(); state.usedContentIds = new Map(); state.recoveryNeeded = new Set(); state.timedPreviousActivityType = null; state.finishPending = false;
}
function startPathwaySession(pathwayId) {
  if (!state.content) throw new Error('Vocabulary activities are still loading. Please try again.');
  const pathwayStates = buildUnitPathwayStates({ occurrences:state.content.occurrences, unitMastery:state.unitMastery, globalMastery:state.globalMastery });
  const stageId = pathwayStates?.[pathwayId]?.currentStage ?? 'recognise';
  const eligible = eligibleTargetsForPathwayStage({ pathwayId, stageId, content:state.content, masteryByVocabularyId:state.globalMastery, seed:`unit-${state.currentUnitNumber}:${pathwayId}:${stageId}` });
  if (!eligible.length) throw new Error('No suitable curated activity is available for this pathway stage yet.');
  const eligibleIds = new Set(eligible.map(target => target.occurrenceId));
  const ranked = rankedTargets(Math.max(10,state.content.occurrences.length),'adaptive').filter(target => eligibleIds.has(target.occurrenceId));
  const selected = [...ranked, ...eligible.filter(target => !ranked.some(row => row.occurrenceId === target.occurrenceId))].slice(0,10);
  state.pathwayId = pathwayId; state.pathwayStage = stageId; state.practiceFocus = null; state.mixedReview = false;
  state.session = createSession({ unitNumber:state.currentUnitNumber, mode:'adaptive', targetIds:selected.map(row => row.occurrenceId), practiceMode:'adaptive', now:new Date() });
  state.queue = [...selected]; resetSessionState();
  if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'section_use', activity_id:`pathway:${pathwayId}:${stageId}`, skill:'vocabulary_mastery', mode:'practice', set_id:`unit-${state.currentUnitNumber}`, metadata:{ unit_number:state.currentUnitNumber, pathway_id:pathwayId, pathway_stage:stageId } }).catch(() => {});
  nextQuestion();
}
function startMixedReview() {
  if (!state.content) throw new Error('Vocabulary activities are still loading. Please try again.');
  state.pathwayId = null; state.pathwayStage = null; state.mixedReview = true; state.practiceFocus = 'adaptive';
  const selected = rankedTargets(10,'adaptive');
  if (!selected.length) throw new Error('No unlocked vocabulary is ready for Mixed Practice yet.');
  state.session = createSession({ unitNumber:state.currentUnitNumber, mode:'adaptive', targetIds:selected.map(row => row.occurrenceId), practiceMode:'adaptive', now:new Date() });
  state.queue = [...selected]; resetSessionState();
  if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'section_use', activity_id:'session:mixed-review', skill:'vocabulary_mastery', mode:'practice', set_id:`unit-${state.currentUnitNumber}`, metadata:{ unit_number:state.currentUnitNumber, review_only:true } }).catch(() => {});
  nextQuestion();
}
function startSession(mode, durationMinutes = null) {
  if (!state.content) throw new Error('Vocabulary activities are still loading. Please try again.');
  const timed = mode === 'timed';
  if (!timed && !state.practiceFocus) throw new Error('Choose a 0511 skill before starting.');
  const selected = rankedTargets(timed ? Math.max(10, state.content.occurrences.length) : 10, timed ? 'adaptive' : state.practiceFocus); if (!selected.length) throw new Error('No suitable curated activity is available for this practice mode yet.');
  state.session = createSession({ unitNumber:state.currentUnitNumber, mode, durationMinutes, targetIds:selected.map(row => row.occurrenceId), practiceMode:timed ? 'adaptive' : state.practiceFocus, now:new Date() });
  state.queue = [...selected]; resetSessionState(); if (timed) startClock();
  if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'section_use', activity_id:`session:${mode}:${state.session.practiceMode}`, skill:'vocabulary_mastery', mode:'practice', set_id:`unit-${state.currentUnitNumber}`, metadata:{ unit_number:state.currentUnitNumber, practice_focus:state.session.practiceMode } }).catch(() => {});
  nextQuestion();
}
function remainingLabel() { if (!state.session) return ''; if (state.session.mode === 'adaptive') return `${state.session.completedAttempts.length} / ${state.session.targetIds.length} activities`; const ms = Math.max(0, new Date(state.session.expiresAt).getTime() - Date.now()); const seconds = Math.ceil(ms / 1000); const minutes = Math.floor(seconds / 60); return `${minutes}:${String(seconds % 60).padStart(2,'0')} remaining`; }
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
    seed:`${target.occurrenceId}:${state.session.completedAttempts.length}:${state.session.mode}`
  };
  let built;
  if (state.pathwayId) {
    built = planPathwayQuestion({ pathwayId:state.pathwayId, stageId:state.pathwayStage, content:state.content, target, mastery:masteryState, recentActivities:recent.map(entry => entry.type), usedContentIds, supportState:common.supportState, seed:common.seed });
  } else {
    built = state.session.mode === 'timed'
      ? buildTimedMixedQuestion({ ...common, previousActivityType:state.timedPreviousActivityType })
      : buildTargetPracticeQuestion({ ...common, practiceMode:state.session.practiceMode ?? state.practiceFocus });
  }
  const targetItem = built.item; const targetContexts = built.contexts; const question = built.question;
  if (state.session.mode === 'timed') state.timedPreviousActivityType = question.type;
  if (question.contentId) state.usedContentIds.set(target.occurrenceId, [...new Set([...usedContentIds, question.contentId])]);
  const contextRecord = targetContexts.find(ctx => ctx.contextId === question.contentId) ?? null; const activityRecord = state.content.activitiesById[question.contentId] ?? null;
  const primaryEvidenceTargetId = question.primaryEvidenceTargetId ?? activityRecord?.activityData?.primaryEvidenceTargetId ?? (question.contentSource === 'item' ? target.vocabularyId : null);
  return { target, item:targetItem, context:contextRecord, activityRecord, question, pathwayPlan:built.plan ?? null, recovery, retry:false, support:null, initialError:false, primaryEvidenceTargetId };
}
function nextQuestion() {
  if (!state.session) return; if (isSessionComplete(state.session, new Date())) { void finishSessionWhenSaved(); return; }
  if (!state.queue.length) { if (state.session.mode === 'timed') state.queue = rankedTargets(Math.min(20, state.content.occurrences.length), 'adaptive'); else { finishSession(); return; } }
  let current = null; let guard = state.queue.length;
  while (!current && guard > 0) { const target = state.queue.shift(); guard -= 1; if (!target) break; if (state.session.mode === 'adaptive' && state.session.completedTargetIds.includes(target.occurrenceId) && !state.recoveryNeeded.has(target.occurrenceId)) continue; try { current = buildNextForTarget(target); } catch { state.queue.push(target); } }
  if (!current) { if (state.session.mode === 'timed') { void finishSessionWhenSaved(); return; } throw new Error('No suitable curated activity is available for this practice mode yet.'); }
  state.current = current; renderCurrentQuestion();
}
function renderCurrentQuestion(feedback = null) { if (!state.current) return; const currentMastery = state.globalMastery[state.current.target.vocabularyId] ?? freshMastery(); renderVocabularyQuestion(root, { unitNumber:state.currentUnitNumber, unitTitle:state.current.target.unitTitle, question:state.current.question, term:state.current.item.term, sessionLabel:remainingLabel(), learningStage:deriveLearningStage(currentMastery), feedback, retry:state.current.retry, support:state.current.support }); decoratePreview(); }
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
  const pathwayFields = state.pathwayId ? { pathwayId:state.pathwayId, pathwayStage:state.pathwayStage, servedPathwayStage:current.pathwayPlan?.servedStage ?? state.pathwayStage } : {};
  const payload = { occurrenceId:current.target.occurrenceId, contextId:current.context?.contextId ?? null, activityContentId:current.activityRecord?.activityContentId ?? null, activityVariantId:current.question.activityVariantId ?? null, contentSource, primaryEvidenceTargetId:current.primaryEvidenceTargetId, questionType:current.question.type, rawAnswer, strands:current.question.strands, evidenceStrength:current.question.evidenceStrength, supportLevel:flags.supportLevel, productive:current.question.productive, repeatedGuess:false, firstAttempt:flags.firstAttempt, retryUsed:flags.retryUsed, recoveredLater:flags.recoveredLater, review:flags.review, preview:false, ...pathwayFields };
  state.persistenceChain = state.persistenceChain.then(async () => {
    if (state.persistenceBlocked) return;
    try {
      const result = await submitVocabularyAttempt(state.client, payload); if (result.correct !== localResult.correct) throw new Error('Vocabulary marking mismatch. Please reload before continuing.');
      if (result.globalStatus) {
        const currentGlobal = state.globalMastery[current.target.vocabularyId] ?? freshMastery();
        state.globalMastery[current.target.vocabularyId] = { ...currentGlobal, status:result.globalStatus, reviewDueAt:result.reviewDueAt, recentErrorCount:result.globalRecentErrorPattern ? 1 : 0, recentErrorPattern:result.globalRecentErrorPattern ?? null };
      }
      const previousUnit = state.unitMastery[current.target.occurrenceId] ?? { contextualEvidence:{} };
      if (result.unitStatus) state.unitMastery[current.target.occurrenceId] = { ...previousUnit, status:result.unitStatus, recentErrorPattern:result.unitRecentErrorPattern ?? null };
      if (result.pathwayProgress && result.pathwayId) {
        const latestUnit = state.unitMastery[current.target.occurrenceId] ?? previousUnit;
        const previousDetail = latestUnit.contextualEvidence ?? {};
        state.unitMastery[current.target.occurrenceId] = { ...latestUnit, contextualEvidence:{ ...previousDetail, pathwayProgress:{ ...(previousDetail.pathwayProgress ?? {}), [result.pathwayId]:result.pathwayProgress } } };
      }
    } catch (error) {
      state.persistenceBlocked = true;
      showSyncWarning(error);
    }
  });
  return state.persistenceChain;
}
async function returnToCurrentUnit() {
  await state.persistenceChain;
  if (state.persistenceBlocked) return;
  state.pathwayId = null; state.pathwayStage = null; state.mixedReview = false; state.practiceFocus = null;
  renderCurrentUnit();
}
async function advanceToNextQuestion() {
  await state.persistenceChain;
  if (state.persistenceBlocked) return;
  nextQuestion();
}
function recordRecentActivity(current, result) { const recent = state.recentActivities.get(current.target.occurrenceId) ?? []; const entry = { type:current.question.type, contentId:current.question.contentId, correct:result.correct }; state.recentActivities.set(current.target.occurrenceId, [...recent, entry].slice(-5)); }
function handleAnswer(form, providedAnswer = null) {
  if (!state.current || !state.session) return; if (state.session.mode === 'timed' && isSessionComplete(state.session, new Date())) { void finishSessionWhenSaved(); return; }
  const input = form?.querySelector?.('input[name="answer"], select[name="answer"]'); const rawAnswer = providedAnswer != null ? String(providedAnswer) : (input?.value ?? ''); const current = state.current; if (current.answered) return;
  if (current.question.responseMode === 'tiles' && !form?.querySelector?.('[data-tile-answer].is-used')) {
    const build = form?.querySelector?.('[data-tile-build]');
    if (build) build.textContent = 'Choose at least one tile before checking.';
    return;
  }
  const previousGlobal = state.globalMastery[current.target.vocabularyId] ?? freshMastery(); const previousGlobalStatus = previousGlobal.status ?? 'new'; const review = Boolean(previousGlobal.reviewDueAt && new Date(previousGlobal.reviewDueAt).getTime() <= Date.now());
  const flags = { firstAttempt:!current.retry, retryUsed:current.retry, recoveredLater:current.recovery, review, supportLevel:current.retry ? (current.support?.supportLevel ?? 'light') : 'none' };
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
  current.support = !result.correct ? buildSupportStep(current.question, { correct:false, misconceptionCategory:result.misconceptionCategory, attemptNumber:2 }) : null; renderCurrentQuestion({ correct:result.correct, message });
}
function finishSession() {
  if (!state.session) return; if (state.session.mode === 'timed') state.session = expireSession(state.session, new Date()); clearClock(); const finished = state.session; state.current = null;
  if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'exercise_result', activity_id:`session_complete:${finished.mode}:${state.pathwayId ?? (state.mixedReview ? 'mixed-review' : finished.practiceMode ?? 'adaptive')}`, skill:'vocabulary_mastery', mode:'practice', set_id:`unit-${finished.unitNumber}`, score:finished.summary.strengthened, max_score:Math.max(1, finished.summary.practised), metadata:{ unit_number:finished.unitNumber, pathway_id:state.pathwayId, pathway_stage:state.pathwayStage, review_only:state.mixedReview } }).catch(() => {});
  renderSessionSummary(root, { durationMinutes:finished.durationMinutes, summary:finished.summary, practiceMode:finished.practiceMode ?? 'adaptive' }); decoratePreview();
}
async function finishSessionWhenSaved() {
  if (!state.session || state.finishPending) return;
  state.finishPending = true;
  clearClock();
  await state.persistenceChain;
  if (state.persistenceBlocked) { state.finishPending = false; return; }
  finishSession();
  state.finishPending = false;
}
function startActiveTime() {
  ['pointerdown','keydown','input','touchstart'].forEach(type => document.addEventListener(type, () => { state.lastInteractionAt = Date.now(); }, { passive:true }));
  state.activeTimer = window.setInterval(() => { if (document.visibilityState !== 'visible' || Date.now() - state.lastInteractionAt > 120000) return; state.activeSeconds += 30; if (state.activeSeconds >= 60) { const seconds = state.activeSeconds; state.activeSeconds = 0; if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'active_time', active_seconds:seconds, mode:'practice' }).catch(() => {}); } }, 30000);
}
root?.addEventListener('submit', event => { const form = event.target; if (form?.dataset?.form !== 'vocabulary-answer') return; event.preventDefault(); try { handleAnswer(form); } catch (error) { renderVocabularyError(root, error instanceof Error ? error.message : 'Unable to check that answer.'); } });
root?.addEventListener('click', event => {
  const choice = event.target?.closest?.('[data-choice-answer], [data-evidence-answer]');
  if (choice) { const form = choice.closest?.('[data-form="vocabulary-answer"]'); const answer = choice.dataset.choiceAnswer ?? choice.dataset.evidenceAnswer; try { handleAnswer(form, answer); } catch (error) { renderVocabularyError(root, error instanceof Error ? error.message : 'Unable to check that answer.'); } return; }
  const tile = event.target?.closest?.('[data-tile-answer]');
  if (tile) { const form = tile.closest?.('[data-form="vocabulary-answer"]'); const input = form?.querySelector?.('input[name="answer"]'); const build = form?.querySelector?.('[data-tile-build]'); if (!input || tile.disabled) return; const parts = String(input.value ?? '').trim().split(/\s+/).filter(Boolean); parts.push(tile.dataset.tileAnswer); input.value = parts.join(' '); tile.disabled = true; tile.classList.add('is-used'); if (build) build.textContent = parts.join(' '); return; }
  const target = event.target?.closest?.('[data-action]'); const action = target?.dataset?.action; if (!action) return;
  if (action === 'open-unit') openUnit(Number(target.dataset.unit)).catch(error => renderVocabularyError(root, error.message));
  else if (action === 'back-units') showHome().catch(error => renderVocabularyError(root, error.message)); else if (action === 'view-all-words') showAllWords();
  else if (action === 'open-pathway') { try { startPathwaySession(target.dataset.pathway); } catch (error) { renderVocabularyError(root, error.message); } }
  else if (action === 'start-mixed-review') { try { startMixedReview(); } catch (error) { renderVocabularyError(root, error.message); } }
  else if (action === 'clear-tile-answer') {
    const form = target.closest?.('[data-form="vocabulary-answer"]'); const input = form?.querySelector?.('input[name="answer"]'); const build = form?.querySelector?.('[data-tile-build]');
    const fixed = String(target.dataset.fixedAnswer ?? '').trim(); if (!form || !input) return;
    for (const tile of form.querySelectorAll?.('.vocab-tile') ?? []) { tile.disabled = false; tile.classList.remove('is-used'); }
    input.value = fixed; if (build) build.textContent = fixed ? '' : 'Choose tiles to build your answer';
  }
  else if (action === 'next-question') advanceToNextQuestion().catch(error => renderVocabularyError(root, error.message)); else if (action === 'leave-session' || action === 'back-unit') returnToCurrentUnit().catch(error => renderVocabularyError(root, error.message));
});
async function initialise() {
  if (!root) return;
  try {
    state.client = await getSupabaseClient(); const { data:userData, error:userError } = await state.client.auth.getUser(); if (userError || !userData?.user) { window.location.replace('./'); return; }
    const { data:profile, error:profileError } = await state.client.from('profiles').select('id, role, display_name, active').eq('id', userData.user.id).single(); const previewRequested = new URLSearchParams(window.location.search).get('preview') === '1'; const staff = profile?.role === 'teacher' || profile?.role === 'admin';
    if (profileError || !profile?.active || (profile.role !== 'student' && !(staff && previewRequested))) { window.location.replace('./'); return; }
    state.profile = profile; state.preview = staff && previewRequested; if (!state.preview) await trackVocabularyEvent(state.client, { event_type:'app_open', mode:'practice' }).catch(() => {}); if (!state.preview) startActiveTime(); await showHome();
  } catch (error) { renderVocabularyError(root, error instanceof Error ? error.message : 'Vocabulary practice is unavailable right now.'); }
}
void initialise();