import { escapeHtml } from '../views/html.js';

const RETRIEVAL_TYPES = new Set(['replace_phrase','produce_paraphrase','use_target','context_gap_fill']);
const PRACTICE_FOCUSES = Object.freeze([
  { id:'adaptive', label:'Adaptive Mix', description:'A balanced mix that changes as you improve.' },
  { id:'definitions', label:'Definitions', description:'Match words to meanings and distinguish close definitions.' },
  { id:'context', label:'In Context', description:'Work out meaning and choose words from sentences and short texts.' },
  { id:'paraphrasing', label:'Paraphrasing', description:'Practise synonyms, equivalents and question-to-text wording.' },
  { id:'recall', label:'Recall & Use', description:'Retrieve the word yourself and use it accurately.' }
]);
const QUESTION_LABELS = Object.freeze({
  meaning_match:'Definition match',
  paraphrase_match:'Paraphrase match',
  context_inference:'Meaning in context',
  question_text_bridge:'Question ↔ text',
  context_gap_fill:'Context gap fill',
  replace_phrase:'Replace the phrase',
  produce_paraphrase:'Produce a paraphrase',
  use_target:'Recall & use',
  identify_inaccurate_paraphrase:'Spot the bad paraphrase',
  mini_mixed_check:'Mini mixed check'
});

function statusOf(row) { return row?.status ?? 'new'; }
function dueAt(row) { return row?.review_due_at ?? row?.reviewDueAt ?? null; }
function errorPattern(row) { return row?.recent_error_pattern ?? row?.recentErrorPattern ?? null; }
function titleCase(value) {
  const text = String(value ?? '').replaceAll('_',' ');
  return text ? text[0].toUpperCase() + text.slice(1) : '';
}
function focusDefinition(id) { return PRACTICE_FOCUSES.find(focus => focus.id === id) ?? PRACTICE_FOCUSES[0]; }

export function buildUnitProgress({ occurrences = [], unitMastery = {}, globalMastery = {}, now = new Date() } = {}) {
  let mastered = 0;
  let needsAnotherLook = 0;
  let reviewDue = 0;
  const nowMs = new Date(now).getTime();
  for (const occurrence of occurrences) {
    const unit = unitMastery[occurrence.occurrenceId ?? occurrence.occurrence_id];
    const global = globalMastery[occurrence.vocabularyId ?? occurrence.vocabulary_id];
    if (statusOf(unit) === 'mastered') mastered += 1;
    if (statusOf(unit) === 'building' || Boolean(errorPattern(unit))) needsAnotherLook += 1;
    const due = dueAt(global);
    if (due && new Date(due).getTime() <= nowMs) reviewDue += 1;
  }
  return { total:occurrences.length, mastered, needsAnotherLook, reviewDue };
}

export function renderVocabularyHome(root, { displayName = '', units = [] } = {}) {
  const cards = units.length ? units.map(unit => `
    <button class="vocab-unit-card" data-action="open-unit" data-unit="${escapeHtml(unit.unitNumber)}">
      <span class="vocab-unit-card__number">Unit ${escapeHtml(unit.unitNumber)}</span>
      <strong>${escapeHtml(unit.unitTitle)}</strong>
      <span>${escapeHtml(unit.mastered ?? 0)} / ${escapeHtml(unit.total ?? 50)} mastered</span>
      <small>Open unit →</small>
    </button>`).join('') : '<p class="vocab-empty">Your vocabulary units are being prepared. Check back soon.</p>';
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><a href="./" class="vocab-back">← Hub</a><span>Cambridge IGCSE ESL 0511</span></header><section class="vocab-hero"><p class="vocab-kicker">Vocabulary &amp; Paraphrase Builder</p><h1>Choose a unit</h1><p>${displayName ? `Hi ${escapeHtml(displayName)}. ` : ''}Pick what you want to practise. We’ll choose the words that will help you most inside that unit.</p></section><section class="vocab-unit-grid">${cards}</section></main>`;
}

export function renderVocabularyUnit(root, { unitNumber, unitTitle, progress, practiceFocus = 'adaptive' } = {}) {
  const p = progress ?? { mastered:0, total:50, needsAnotherLook:0, reviewDue:0 };
  const selected = focusDefinition(practiceFocus);
  const focusButtons = PRACTICE_FOCUSES.map(focus => `
    <button type="button" class="vocab-focus-card${focus.id === selected.id ? ' is-selected' : ''}" data-action="set-practice-focus" data-practice-focus="${focus.id}" aria-pressed="${focus.id === selected.id ? 'true' : 'false'}">
      <strong>${escapeHtml(focus.label)}</strong><span>${escapeHtml(focus.description)}</span>
    </button>`).join('');
  const startLabel = selected.id === 'adaptive' ? 'Start Adaptive Session' : `Start ${selected.label} Session`;
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><button class="vocab-back" data-action="back-units">← All units</button><span>Unit ${escapeHtml(unitNumber)}</span></header><section class="vocab-unit-hero"><p class="vocab-kicker">Unit ${escapeHtml(unitNumber)}</p><h1>${escapeHtml(unitTitle)}</h1><div class="vocab-progress-row"><strong>${escapeHtml(p.mastered)} / ${escapeHtml(p.total)} mastered</strong><span>${escapeHtml(p.needsAnotherLook)} need another look</span><span>${escapeHtml(p.reviewDue)} ready for review</span></div></section><section class="vocab-practice-picker"><div class="vocab-practice-picker__head"><p class="vocab-kicker">Choose what to practise</p><h2>${escapeHtml(selected.label)}</h2><p>${escapeHtml(selected.description)}</p></div><div class="vocab-focus-grid">${focusButtons}</div></section><section class="vocab-route-grid"><article class="vocab-route-card vocab-route-card--primary"><p class="vocab-kicker">10-word session</p><h2>${escapeHtml(selected.label)}</h2><p>Ten priority words with difficulty adjusted inside this practice area.</p><button class="vocab-button vocab-button--primary" data-action="start-adaptive">${escapeHtml(startLabel)}</button></article><article class="vocab-route-card"><p class="vocab-kicker">Timed practice</p><h2>${escapeHtml(selected.label)}</h2><p>Keep the same practice focus and choose how long you want to train.</p><div class="vocab-time-grid">${[5,10,15,20].map(minutes => `<button class="vocab-button" data-action="start-timed" data-minutes="${minutes}">${minutes} min</button>`).join('')}</div></article></section><button class="vocab-link" data-action="view-all-words">View all 50 words</button></main>`;
}

export function renderVocabularyWords(root, { unitNumber, unitTitle, words = [] } = {}) {
  const rows = words.map(word => {
    const strands = Object.entries(word.strands ?? {}).map(([strand,value]) => `<span class="vocab-word-strand"><small>${escapeHtml(titleCase(strand))}</small><strong>${escapeHtml(value)}</strong></span>`).join('');
    return `<article class="vocab-word-row"><div class="vocab-word-row__head"><div><strong>${escapeHtml(word.term)}</strong><span class="vocab-state-pill" data-state="${escapeHtml(word.status)}">${escapeHtml(titleCase(word.status))}</span></div></div><div class="vocab-word-strands">${strands}</div></article>`;
  }).join('') || '<p class="vocab-empty">No live words are available in this unit yet.</p>';
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><button class="vocab-back" data-action="back-unit">← Unit ${escapeHtml(unitNumber)}</button><span>Vocabulary detail</span></header><section class="vocab-unit-hero"><p class="vocab-kicker">Unit ${escapeHtml(unitNumber)}</p><h1>All 50 words</h1><p>${escapeHtml(unitTitle)}</p><p class="vocab-detail-note">Your states update as you practise. Strand labels stay qualitative so the focus remains on what to do next.</p></section><section class="vocab-word-list">${rows}</section></main>`;
}

function renderAnswerControl(question, feedback, retry) {
  if (feedback?.correct) return '<button type="button" class="vocab-button vocab-button--primary" data-action="next-question">Continue</button>';
  if (question?.responseMode === 'choice') {
    const options = (question.options ?? []).map(option => `<button type="button" class="vocab-choice" data-choice-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join('');
    return `<fieldset class="vocab-choice-fieldset"><legend>${retry ? 'Try it again' : 'Choose your answer'}</legend><div class="vocab-choice-grid">${options}</div></fieldset>`;
  }
  return `<label>${retry ? 'Try it again' : 'Your answer'}<input name="answer" required autocomplete="off" maxlength="500"></label><button class="vocab-button vocab-button--primary" type="submit">${retry ? 'Try again' : 'Check answer'}</button>`;
}

export function renderVocabularyQuestion(root, { unitNumber, unitTitle, question, term, sessionLabel, feedback = null, retry = false } = {}) {
  const feedbackHtml = feedback ? `<div class="vocab-feedback ${feedback.correct ? 'is-positive' : 'is-supportive'}"><strong>${escapeHtml(feedback.message)}</strong>${feedback.detail ? `<p>${escapeHtml(feedback.detail)}</p>` : ''}</div>` : '';
  const targetPill = RETRIEVAL_TYPES.has(question?.type) ? '<div class="vocab-target-pill">Recall &amp; use</div>' : `<div class="vocab-target-pill">${escapeHtml(term ?? '')}</div>`;
  const questionLabel = QUESTION_LABELS[question?.type] ?? 'Practice';
  root.innerHTML = `<main class="vocab-shell vocab-shell--session"><header class="vocab-topbar"><button class="vocab-back" data-action="leave-session">← Unit ${escapeHtml(unitNumber)}</button><span>${escapeHtml(sessionLabel ?? '')}</span></header><section class="vocab-question-card"><p class="vocab-kicker">${escapeHtml(questionLabel)}</p>${targetPill}<h1>${escapeHtml(question?.prompt ?? '')}</h1>${feedbackHtml}<form data-form="vocabulary-answer" class="vocab-answer-form">${renderAnswerControl(question, feedback, retry)}</form></section><p class="vocab-session-unit">Unit ${escapeHtml(unitNumber)} — ${escapeHtml(unitTitle)}</p></main>`;
}

export function supportiveFeedback({ correct, misconceptionCategory, recovery, term, meaning, questionType } = {}) {
  const word = term ? `“${term}”` : 'that word';
  const clearMeaning = String(meaning ?? '').trim();
  if (correct && recovery) return 'Good recovery — that answer works here.';
  if (correct && questionType === 'meaning_match' && clearMeaning) return `Correct — ${word} means ${clearMeaning} here.`;
  if (correct && questionType === 'paraphrase_match') return `Correct — that paraphrase keeps the meaning of ${word}.`;
  if (correct && ['replace_phrase','produce_paraphrase','use_target','context_gap_fill','question_text_bridge','mini_mixed_check'].includes(questionType)) return `Correct — ${word} fits this context.`;
  if (correct) return 'Correct — that meaning fits the context.';
  if (misconceptionCategory === 'related_but_inaccurate') return 'Close — the meaning is related, but it is not precise enough here. Try again.';
  if (misconceptionCategory === 'wrong_form') return 'Right idea — check the word form and try again.';
  if (clearMeaning) return `Not quite. Here, ${word} means ${clearMeaning}. Try again.`;
  return 'Not quite. Read the context again and try once more.';
}

export function renderSessionSummary(root, { durationMinutes = null, summary = {} } = {}) {
  const title = durationMinutes ? `${durationMinutes}-minute session complete` : 'Adaptive session complete';
  root.innerHTML = `<main class="vocab-shell"><section class="vocab-summary-card"><p class="vocab-kicker">Progress made</p><h1>${escapeHtml(title)}</h1><div class="vocab-summary-grid"><div><strong>${escapeHtml(summary.practised ?? 0)}</strong><span>words practised</span></div><div><strong>${escapeHtml(summary.strengthened ?? 0)}</strong><span>strengthened</span></div><div><strong>${escapeHtml(summary.secure ?? 0)}</strong><span>moved to Secure</span></div><div><strong>${escapeHtml(summary.mastered ?? 0)}</strong><span>mastered</span></div></div><p>${escapeHtml(summary.needsAnotherLook ?? 0)} need another look. They’ll come back when they’re useful.</p><button class="vocab-button vocab-button--primary" data-action="back-unit">Back to unit</button></section></main>`;
}

export function renderVocabularyError(root, message) {
  root.innerHTML = `<main class="vocab-shell"><section class="vocab-summary-card"><h1>Unable to continue</h1><p>${escapeHtml(message)}</p><a class="vocab-button" href="./">Back to Hub</a></section></main>`;
}
