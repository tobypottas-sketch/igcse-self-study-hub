import { getSupabaseClient } from '../supabase.js';
import { unitCheckFor } from '../../content/vocabulary/checks/index.js';
import { feedbackForAttempt, nextCheckState, scoreCheck, scoreSummary } from './unit-check-model.js';
import { loadVocabularyUnitCheckAttempts, recordVocabularyUnitCheckAttempt } from './unit-check-data.js';
import { renderUnitCheckCard, renderUnitCheckReview, renderUnitCheckScreen } from './unit-check-view.js?v=workspace-v5';

const root = document.getElementById('vocabularyApp');
const preview = new URLSearchParams(window.location.search).get('preview') === '1';
const attemptsCache = new Map();
const loadingUnits = new Set();
let unitSnapshot = null;
let active = null;

function visibleUnitNumber() {
  const badge = root?.querySelector?.('.vocab-unit-id__badge');
  const match = badge?.textContent?.match(/Unit\s+(\d+)/i);
  return match ? Number(match[1]) : null;
}

function cardModel(attempts = []) {
  const next = nextCheckState(attempts);
  return { ...next, ...scoreSummary(attempts) };
}

function paintCard(attempts, options = {}) {
  const existing = root?.querySelector?.('[data-unit-check-card]');
  if (!existing) return;
  existing.outerHTML = renderUnitCheckCard({ ...cardModel(attempts), ...options });
}

async function loadAttempts(unitNumber, { force = false } = {}) {
  if (preview) return [];
  if (!force && attemptsCache.has(unitNumber)) return attemptsCache.get(unitNumber);
  const client = await getSupabaseClient();
  const attempts = await loadVocabularyUnitCheckAttempts(client, unitNumber);
  attemptsCache.set(unitNumber, attempts);
  return attempts;
}

async function hydrateCard(unitNumber) {
  if (loadingUnits.has(unitNumber)) return;
  loadingUnits.add(unitNumber);
  try {
    const attempts = await loadAttempts(unitNumber);
    if (visibleUnitNumber() === unitNumber) paintCard(attempts);
  } catch (error) {
    paintCard([], { unavailable:true });
    console.error('Unit Vocabulary Check scores could not be loaded', error);
  } finally {
    loadingUnits.delete(unitNumber);
  }
}

function ensureUnitCheckCard() {
  const unitNumber = visibleUnitNumber();
  if (!root || active || !unitCheckFor(unitNumber)) return;
  if (root.querySelector('[data-unit-check-card]')) return;
  const pathways = root.querySelector('.vocab-pathways');
  if (!pathways) return;
  pathways.insertAdjacentHTML('afterend', renderUnitCheckCard({ loading:!preview }));
  if (preview) paintCard([]);
  else void hydrateCard(unitNumber);
}

function paintActive({ focusHeading = true } = {}) {
  if (!root || !active) return;
  root.innerHTML = renderUnitCheckScreen({
    form:active.form,
    attemptNumber:active.attemptNumber,
    questionIndex:active.questionIndex,
    answers:active.answers,
    saving:active.saving,
    saveError:active.error
  });
  if (focusHeading) root.querySelector?.('[data-unit-check-question] h1')?.focus?.();
}

async function startCheck() {
  const unitNumber = visibleUnitNumber();
  const check = unitCheckFor(unitNumber);
  if (!check) return;
  const attempts = await loadAttempts(unitNumber);
  const next = nextCheckState(attempts);
  if (next.locked) { paintCard(attempts); return; }
  unitSnapshot = root.innerHTML;
  active = {
    unitNumber,
    attemptNumber:next.attemptNumber,
    formId:next.formId,
    form:check.forms[next.formId],
    questionIndex:0,
    answers:{},
    saving:false,
    error:''
  };
  paintActive();
}

function readAnswer(target) {
  if (!active || !target?.dataset?.questionId) return;
  active.answers[target.dataset.questionId] = target.value;
  active.error = '';
  if (target.type === 'radio') paintActive({ focusHeading:false });
}

function missingAnswerIndex() {
  return active.form.questions.findIndex(question => !String(active.answers[question.id] ?? '').trim());
}

function finishSavedAttempt(scored, attempts) {
  active.scored = scored;
  active.feedback = feedbackForAttempt(active.form, scored.results, active.attemptNumber);
  const locked = nextCheckState(attempts).locked;
  root.innerHTML = renderUnitCheckReview({ form:active.form, attemptNumber:active.attemptNumber, scored, feedback:active.feedback, locked });
}

async function submitCheck() {
  if (!active || active.saving) return;
  const missing = missingAnswerIndex();
  if (missing >= 0) {
    active.questionIndex = missing;
    active.error = `Question ${missing + 1} still needs an answer before you submit.`;
    paintActive();
    return;
  }
  const scored = scoreCheck(active.form, active.answers);
  if (preview) {
    const pretend = [{ attempt_number:active.attemptNumber, form_id:active.formId, score:scored.score, max_score:scored.maxScore }];
    finishSavedAttempt(scored, pretend);
    return;
  }

  active.saving = true; active.error = ''; paintActive();
  try {
    const client = await getSupabaseClient();
    const saved = await recordVocabularyUnitCheckAttempt(client, {
      unitNumber:active.unitNumber,
      formId:active.formId,
      attemptNumber:active.attemptNumber,
      score:scored.score,
      maxScore:scored.maxScore
    });
    const attempts = [...(attemptsCache.get(active.unitNumber) ?? []).filter(row => Number(row.attempt_number) !== active.attemptNumber), saved]
      .sort((a,b) => Number(a.attempt_number) - Number(b.attempt_number));
    attemptsCache.set(active.unitNumber, attempts);
    active.saving = false;
    finishSavedAttempt(scored, attempts);
  } catch (error) {
    try {
      const attempts = await loadAttempts(active.unitNumber, { force:true });
      if (attempts.some(row => Number(row.attempt_number) === active.attemptNumber && row.form_id === active.formId)) {
        active.saving = false;
        finishSavedAttempt(scored, attempts);
        return;
      }
    } catch { /* keep the original save error */ }
    active.saving = false;
    active.error = 'Your score was not saved, so this attempt has not been used. Check your connection and submit again.';
    paintActive();
    console.error('Unit Vocabulary Check score could not be saved', error);
  }
}

function backToUnit() {
  if (!root || !active) return;
  const attempts = attemptsCache.get(active.unitNumber) ?? [];
  active = null;
  root.innerHTML = unitSnapshot ?? '';
  unitSnapshot = null;
  paintCard(attempts);
  ensureUnitCheckCard();
}

function onAction(button) {
  const action = button?.dataset?.unitCheckAction;
  if (!action) return;
  if (action === 'start') { void startCheck(); return; }
  if (!active) return;
  if (action === 'leave' || action === 'back-unit') { backToUnit(); return; }
  if (action === 'previous') { active.questionIndex = Math.max(0, active.questionIndex - 1); active.error = ''; paintActive(); return; }
  if (action === 'next') { active.questionIndex = Math.min(active.form.questions.length - 1, active.questionIndex + 1); active.error = ''; paintActive(); return; }
  if (action === 'jump') {
    const index = Number(button.dataset.questionIndex);
    if (Number.isInteger(index) && index >= 0 && index < active.form.questions.length) {
      active.questionIndex = index;
      active.error = '';
      paintActive();
    }
    return;
  }
  if (action === 'submit') { void submitCheck(); return; }
  if (action === 'toggle-passage') {
    const passage = root.querySelector('[data-unit-check-passage]');
    const collapsed = passage?.classList.toggle('is-collapsed');
    button.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }
}

if (root) {
  root.addEventListener('click', event => {
    const button = event.target.closest?.('[data-unit-check-action]');
    if (button) { event.preventDefault(); onAction(button); }
  });
  root.addEventListener('change', event => { if (event.target.matches?.('[data-unit-check-answer]')) readAnswer(event.target); });
  root.addEventListener('input', event => { if (event.target.matches?.('input[type="text"][data-unit-check-answer]')) readAnswer(event.target); });
  new MutationObserver(ensureUnitCheckCard).observe(root, { childList:true, subtree:true });
  ensureUnitCheckCard();
}
