import { getSupabaseClient } from '../supabase.js';
import { loadVocabularyDashboard, loadVocabularyUnit, loadStudentMastery, submitVocabularyAttempt } from './data.js';
import { trackVocabularyEvent } from './tracking.js';
import { selectPriorityTargets } from './selector.js';
import { buildQuestion } from './questions.js';
import { completeAttempt, createSession, expireSession, isSessionComplete } from './session.js';
import { buildUnitProgress, renderSessionSummary, renderVocabularyError, renderVocabularyHome, renderVocabularyQuestion, renderVocabularyUnit, renderVocabularyWords, supportiveFeedback } from './views.js';
import { applyEvidence } from '../../supabase/functions/_shared/vocabulary-engine.js';

const root = document.getElementById('vocabularyApp');
const state = {
  client:null, profile:null, preview:false, dashboard:null, units:[], currentUnitNumber:null, currentUnitTitle:null, content:null,
  globalMastery:{}, unitMastery:{}, session:null, queue:[], current:null,
  usedContexts:new Map(), previousTypes:new Map(), recoveryNeeded:new Set(), clock:null,
  activeSeconds:0, lastInteractionAt:Date.now(), activeTimer:null
};

function occurrence(row) {
  return { occurrenceId:row.occurrence_id, vocabularyId:row.vocabulary_id, unitNumber:row.unit_number, unitTitle:row.unit_title, setNumber:row.set_number, positionInUnit:row.position_in_unit, senseId:row.sense_id };
}
function item(row) {
  return { vocabularyId:row.vocabulary_id, term:row.term, partOfSpeech:row.part_of_speech, coreMeaning:row.core_meaning, senses:row.senses ?? [], wordFamily:row.word_family ?? [], collocations:row.collocations ?? [] };
}
function context(row) {
  return { contextId:row.context_id, vocabularyId:row.vocabulary_id, occurrenceId:row.occurrence_id, senseId:row.sense_id, type:row.context_type, text:row.prompt_text, targetRewrite:row.target_rewrite, acceptedAnswers:row.accepted_answers ?? [], misconceptionCategory:row.misconception_category };
}
function mastery(row) {
  return {
    status:row?.status ?? 'new', strandEvidence:row?.strand_evidence ?? {}, recentErrorCount:row?.recent_error_pattern ? 1 : 0,
    recentErrorPattern:row?.recent_error_pattern ?? null, reviewDueAt:row?.review_due_at ?? null,
    successfulProductions:row?.successful_productions ?? 0, productionContextIds:row?.production_context_ids ?? []
  };
}
function freshMastery() {
  return { status:'new', strandEvidence:{ meaning:0, recognition:0, context:0, paraphrasing:0, production:0 }, recentErrorCount:0, recentErrorPattern:null, reviewDueAt:null, successfulProductions:0, productionContextIds:[], recoveryCount:0, reviewStage:0, reviewFailureCount:0 };
}
function mapBy(rows, key, transform = value => value) { return Object.fromEntries(rows.map(row => [row[key], transform(row)])); }

function decoratePreview() {
  if (!state.preview || !root) return;
  const shell = root.querySelector?.('.vocab-shell');
  if (!shell || shell.querySelector?.('[data-staff-preview-banner]')) return;
  const topbar = shell.querySelector?.('.vocab-topbar');
  const banner = document.createElement('aside');
  banner.className = 'vocab-preview-banner';
  banner.dataset.staffPreviewBanner = 'true';
  banner.innerHTML = '<div><strong>STAFF PREVIEW</strong><span>Results are not recorded and will not affect student analytics.</span></div><a class="vocab-button" href="./vocabulary.html">Back to teacher analytics</a>';
  if (topbar?.after) topbar.after(banner);
  else shell.prepend(banner);
}

function buildUnits(dashboard) {
  const grouped = new Map();
  const global = mapBy(dashboard.global, 'vocabulary_id');
  const unit = mapBy(dashboard.unit, 'occurrence_id');
  for (const row of dashboard.occurrences) {
    if (!grouped.has(row.unit_number)) grouped.set(row.unit_number, { unitNumber:row.unit_number, unitTitle:row.unit_title, occurrences:[] });
    grouped.get(row.unit_number).occurrences.push(row);
  }
  return [...grouped.values()].sort((a,b) => a.unitNumber - b.unitNumber).map(group => ({
    unitNumber:group.unitNumber,
    unitTitle:group.unitTitle,
    ...buildUnitProgress({ occurrences:group.occurrences, unitMastery:unit, globalMastery:global })
  }));
}

async function showHome() {
  clearClock();
  state.currentUnitNumber = null;
  state.currentUnitTitle = null;
  state.dashboard = await loadVocabularyDashboard(state.client, { preview:state.preview });
  state.units = buildUnits(state.dashboard);
  renderVocabularyHome(root, { displayName:state.profile.display_name, units:state.units });
  decoratePreview();
}

async function openUnit(unitNumber) {
  clearClock();
  const contentPromise = loadVocabularyUnit(state.client, unitNumber);
  const masteryPromise = state.preview ? Promise.resolve({ global:[], unit:[] }) : loadStudentMastery(state.client, unitNumber);
  const [contentRaw, masteryRaw] = await Promise.all([contentPromise, masteryPromise]);
  const occurrences = contentRaw.occurrences.map(occurrence);
  const items = contentRaw.items.map(item);
  const contexts = contentRaw.contexts.map(context);
  state.currentUnitNumber = unitNumber;
  state.content = { occurrences, items, contexts, itemsById:mapBy(items,'vocabularyId'), contextsByOccurrence:{} };
  for (const ctx of contexts) (state.content.contextsByOccurrence[ctx.occurrenceId] ??= []).push(ctx);
  state.globalMastery = mapBy(masteryRaw.global, 'vocabulary_id', mastery);
  state.unitMastery = mapBy(masteryRaw.unit, 'occurrence_id', row => ({ status:row.status, recentErrorPattern:row.recent_error_pattern, contextualEvidence:row.contextual_evidence ?? {} }));
  const progress = buildUnitProgress({ occurrences, unitMastery:state.unitMastery, globalMastery:state.globalMastery });
  state.currentUnitTitle = occurrences[0]?.unitTitle ?? state.units.find(unit => unit.unitNumber === unitNumber)?.unitTitle ?? `Unit ${unitNumber}`;
  renderVocabularyUnit(root, { unitNumber, unitTitle:state.currentUnitTitle, progress });
  decoratePreview();
}

function strandLabel(value, status) {
  const score = Number(value ?? 0);
  if (status === 'mastered' && score >= 3) return 'Secure';
  if (score >= 6) return 'Secure';
  if (score >= 3) return 'Developing';
  return 'Keep practising';
}

function showAllWords() {
  if (!state.content || !state.currentUnitNumber) return;
  const words = state.content.occurrences
    .slice()
    .sort((a,b) => a.positionInUnit - b.positionInUnit)
    .map(occ => {
      const target = state.content.itemsById[occ.vocabularyId];
      const global = state.globalMastery[occ.vocabularyId] ?? { status:'new', strandEvidence:{} };
      return {
        term:target?.term ?? occ.vocabularyId,
        status:global.status ?? 'new',
        strands:{
          meaning:strandLabel(global.strandEvidence?.meaning, global.status),
          recognition:strandLabel(global.strandEvidence?.recognition, global.status),
          context:strandLabel(global.strandEvidence?.context, global.status),
          paraphrasing:strandLabel(global.strandEvidence?.paraphrasing, global.status),
          production:strandLabel(global.strandEvidence?.production, global.status)
        }
      };
    });
  renderVocabularyWords(root, { unitNumber:state.currentUnitNumber, unitTitle:state.currentUnitTitle, words });
  decoratePreview();
}

function rankedTargets(limit) {
  return selectPriorityTargets({ occurrences:state.content.occurrences, masteryByVocabularyId:state.globalMastery, unitMastery:state.unitMastery, now:new Date(), limit });
}

function startSession(mode, durationMinutes = null) {
  const selected = rankedTargets(mode === 'adaptive' ? 10 : Math.max(10, state.content.occurrences.length));
  if (!selected.length) throw new Error('This unit has no live vocabulary targets yet.');
  state.session = createSession({ unitNumber:state.currentUnitNumber, mode, durationMinutes, targetIds:selected.map(row => row.occurrenceId), now:new Date() });
  state.queue = [...selected];
  state.current = null;
  state.usedContexts = new Map();
  state.previousTypes = new Map();
  state.recoveryNeeded = new Set();
  if (mode === 'timed') startClock();
  if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'section_use', activity_id:`session:${mode}`, skill:'vocabulary_mastery', mode:'practice', set_id:`unit-${state.currentUnitNumber}`, metadata:{ unit_number:state.currentUnitNumber } }).catch(() => {});
  nextQuestion();
}

function remainingLabel() {
  if (!state.session) return '';
  if (state.session.mode === 'adaptive') return `${state.session.completedTargetIds.length} / ${state.session.targetIds.length} words`;
  const ms = Math.max(0, new Date(state.session.expiresAt).getTime() - Date.now());
  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2,'0')} remaining`;
}

function startClock() {
  clearClock();
  state.clock = window.setInterval(() => {
    const label = root.querySelector?.('.vocab-topbar span');
    if (label) label.textContent = remainingLabel();
    if (state.session && isSessionComplete(state.session, new Date())) finishSession();
  }, 1000);
}
function clearClock() { if (state.clock) { window.clearInterval(state.clock); state.clock = null; } }

function nextQuestion() {
  if (!state.session) return;
  if (isSessionComplete(state.session, new Date())) { finishSession(); return; }
  if (!state.queue.length) {
    if (state.session.mode === 'timed') state.queue = rankedTargets(Math.min(10, state.content.occurrences.length));
    else { finishSession(); return; }
  }
  let target = state.queue.shift();
  while (target && state.session.mode === 'adaptive' && state.session.completedTargetIds.includes(target.occurrenceId)) target = state.queue.shift();
  if (!target) { if (state.session.mode === 'timed') { state.queue = rankedTargets(10); target = state.queue.shift(); } else { finishSession(); return; } }

  const targetItem = state.content.itemsById[target.vocabularyId];
  const targetContexts = state.content.contextsByOccurrence[target.occurrenceId] ?? [];
  const used = state.usedContexts.get(target.occurrenceId) ?? [];
  const previousType = state.previousTypes.get(target.occurrenceId) ?? null;
  const recovery = state.recoveryNeeded.has(target.occurrenceId);
  const question = buildQuestion({ occurrence:target, item:targetItem, contexts:targetContexts, mastery:state.globalMastery[target.vocabularyId] ?? freshMastery(), usedContextIds:used, previousQuestionType:previousType, recycle:recovery, now:new Date() });
  state.usedContexts.set(target.occurrenceId, [...used, question.contextId]);
  state.previousTypes.set(target.occurrenceId, question.type);
  state.current = { target, item:targetItem, question, recovery, retry:false };
  renderCurrentQuestion();
}

function renderCurrentQuestion(feedback = null) {
  if (!state.current) return;
  renderVocabularyQuestion(root, {
    unitNumber:state.currentUnitNumber,
    unitTitle:state.current.target.unitTitle,
    question:state.current.question,
    term:state.current.item.term,
    sessionLabel:remainingLabel(),
    feedback,
    retry:state.current.retry
  });
  decoratePreview();
}

async function handleAnswer(form, providedAnswer = null) {
  if (!state.current || !state.session) return;
  if (state.session.mode === 'timed' && isSessionComplete(state.session, new Date())) { finishSession(); return; }
  const input = form?.querySelector?.('input[name="answer"]');
  const rawAnswer = providedAnswer != null ? String(providedAnswer) : (input?.value ?? '');
  const current = state.current;
  const result = await submitVocabularyAttempt(state.client, {
    occurrenceId:current.target.occurrenceId,
    contextId:current.question.contextId,
    questionType:current.question.type,
    rawAnswer,
    firstAttempt:!current.retry,
    retryUsed:current.retry,
    recoveredLater:current.recovery,
    review:Boolean(state.globalMastery[current.target.vocabularyId]?.reviewDueAt && new Date(state.globalMastery[current.target.vocabularyId].reviewDueAt).getTime() <= Date.now()),
    preview:state.preview
  });
  const previousGlobal = state.globalMastery[current.target.vocabularyId] ?? freshMastery();
  const previousGlobalStatus = previousGlobal.status ?? 'new';
  let nextGlobalStatus = result.globalStatus;
  let nextUnitStatus = result.unitStatus;
  let recoverySucceeded = result.recovery;

  if (state.preview) {
    const nextGlobal = applyEvidence(previousGlobal, {
      strand:result.strand,
      correct:result.correct,
      firstAttempt:!current.retry,
      retryUsed:current.retry,
      recoveredLater:current.recovery,
      contextId:current.question.contextId,
      questionType:current.question.type,
      review:false
    }, new Date());
    state.globalMastery[current.target.vocabularyId] = nextGlobal;
    state.unitMastery[current.target.occurrenceId] = { status:nextGlobal.status, recentErrorPattern:result.correct ? null : (result.misconceptionCategory ?? 'retrieval_failure'), contextualEvidence:{ strandEvidence:nextGlobal.strandEvidence } };
    nextGlobalStatus = nextGlobal.status;
    nextUnitStatus = nextGlobal.status;
    recoverySucceeded = current.recovery && result.correct;
  } else {
    state.globalMastery[current.target.vocabularyId] = { ...previousGlobal, status:result.globalStatus, reviewDueAt:result.reviewDueAt, recentErrorCount:result.correct ? 0 : 1 };
    state.unitMastery[current.target.occurrenceId] = { ...state.unitMastery[current.target.occurrenceId], status:result.unitStatus, recentErrorPattern:result.correct ? null : (result.misconceptionCategory ?? 'retrieval_failure') };
  }
  const message = supportiveFeedback({ correct:result.correct, misconceptionCategory:result.misconceptionCategory, recovery:recoverySucceeded, term:current.item.term });

  if (!result.correct && !current.retry && !current.recovery) {
    current.retry = true;
    renderCurrentQuestion({ correct:false, message });
    return;
  }

  const needsRecovery = current.retry && !current.recovery;
  if (needsRecovery) {
    state.recoveryNeeded.add(current.target.occurrenceId);
    state.queue.push(current.target);
  }
  if (current.recovery) state.recoveryNeeded.delete(current.target.occurrenceId);
  const completeTarget = !needsRecovery;
  state.session = completeAttempt(state.session, {
    targetId:current.target.occurrenceId,
    evidence:{ correct:result.correct, recovery:recoverySucceeded },
    completeTarget,
    strengthened:result.correct,
    movedToSecure:previousGlobalStatus !== 'secure' && nextGlobalStatus === 'secure',
    mastered:previousGlobalStatus !== 'mastered' && nextGlobalStatus === 'mastered',
    needsAnotherLook:completeTarget && !result.correct
  });
  void nextUnitStatus;
  renderCurrentQuestion({ correct:result.correct, message });
  if (!result.correct) {
    const formAfter = root.querySelector?.('[data-form="vocabulary-answer"]');
    if (formAfter) formAfter.innerHTML = '<button type="button" class="vocab-button vocab-button--primary" data-action="next-question">Continue</button>';
  }
}

function finishSession() {
  if (!state.session) return;
  if (state.session.mode === 'timed') state.session = expireSession(state.session, new Date());
  clearClock();
  const finished = state.session;
  state.current = null;
  if (!state.preview) void trackVocabularyEvent(state.client, {
    event_type:'exercise_result', activity_id:`session_complete:${finished.mode}`, skill:'vocabulary_mastery', mode:'practice', set_id:`unit-${finished.unitNumber}`,
    score:finished.summary.strengthened, max_score:Math.max(1, finished.summary.practised), metadata:{ unit_number:finished.unitNumber }
  }).catch(() => {});
  renderSessionSummary(root, { durationMinutes:finished.durationMinutes, summary:finished.summary });
  decoratePreview();
}

function startActiveTime() {
  ['pointerdown','keydown','input','touchstart'].forEach(type => document.addEventListener(type, () => { state.lastInteractionAt = Date.now(); }, { passive:true }));
  state.activeTimer = window.setInterval(() => {
    if (document.visibilityState !== 'visible' || Date.now() - state.lastInteractionAt > 120000) return;
    state.activeSeconds += 30;
    if (state.activeSeconds >= 60) {
      const seconds = state.activeSeconds; state.activeSeconds = 0;
      if (!state.preview) void trackVocabularyEvent(state.client, { event_type:'active_time', active_seconds:seconds, mode:'practice' }).catch(() => {});
    }
  }, 30000);
}

root?.addEventListener('submit', event => {
  const form = event.target;
  if (form?.dataset?.form !== 'vocabulary-answer') return;
  event.preventDefault();
  const button = form.querySelector('button[type="submit"]');
  if (button) button.disabled = true;
  handleAnswer(form).catch(error => renderVocabularyError(root, error instanceof Error ? error.message : 'Unable to check that answer.')).finally(() => { if (button?.isConnected) button.disabled = false; });
});

root?.addEventListener('click', event => {
  const choice = event.target?.closest?.('[data-choice-answer]');
  if (choice) {
    const form = choice.closest?.('[data-form="vocabulary-answer"]');
    const buttons = form?.querySelectorAll?.('[data-choice-answer]') ?? [];
    buttons.forEach(button => { button.disabled = true; });
    void handleAnswer(form, choice.dataset.choiceAnswer)
      .catch(error => renderVocabularyError(root, error instanceof Error ? error.message : 'Unable to check that answer.'));
    return;
  }
  const target = event.target?.closest?.('[data-action]');
  const action = target?.dataset?.action;
  if (!action) return;
  if (action === 'open-unit') openUnit(Number(target.dataset.unit)).catch(error => renderVocabularyError(root, error.message));
  else if (action === 'back-units') showHome().catch(error => renderVocabularyError(root, error.message));
  else if (action === 'view-all-words') showAllWords();
  else if (action === 'start-adaptive') { try { startSession('adaptive'); } catch (error) { renderVocabularyError(root, error.message); } }
  else if (action === 'start-timed') { try { startSession('timed', Number(target.dataset.minutes)); } catch (error) { renderVocabularyError(root, error.message); } }
  else if (action === 'next-question') nextQuestion();
  else if (action === 'leave-session' || action === 'back-unit') openUnit(state.currentUnitNumber).catch(error => renderVocabularyError(root, error.message));
});

async function initialise() {
  if (!root) return;
  try {
    state.client = await getSupabaseClient();
    const { data:userData, error:userError } = await state.client.auth.getUser();
    if (userError || !userData?.user) { window.location.replace('./'); return; }
    const { data:profile, error:profileError } = await state.client.from('profiles').select('id, role, display_name, active').eq('id', userData.user.id).single();
    const previewRequested = new URLSearchParams(window.location.search).get('preview') === '1';
    const staff = profile?.role === 'teacher' || profile?.role === 'admin';
    if (profileError || !profile?.active || (profile.role !== 'student' && !(staff && previewRequested))) { window.location.replace('./'); return; }
    state.profile = profile;
    state.preview = staff && previewRequested;
    if (!state.preview) await trackVocabularyEvent(state.client, { event_type:'app_open', mode:'practice' }).catch(() => {});
    if (!state.preview) startActiveTime();
    await showHome();
  } catch (error) {
    renderVocabularyError(root, error instanceof Error ? error.message : 'Vocabulary practice is unavailable right now.');
  }
}

void initialise();