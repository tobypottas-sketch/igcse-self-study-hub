import { escapeHtml } from '../views/html.js';

function statusOf(row) { return row?.status ?? 'new'; }
function dueAt(row) { return row?.review_due_at ?? row?.reviewDueAt ?? null; }
function errorPattern(row) { return row?.recent_error_pattern ?? row?.recentErrorPattern ?? null; }

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

export function renderVocabularyUnit(root, { unitNumber, unitTitle, progress } = {}) {
  const p = progress ?? { mastered:0, total:50, needsAnotherLook:0, reviewDue:0 };
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><button class="vocab-back" data-action="back-units">← All units</button><span>Unit ${escapeHtml(unitNumber)}</span></header><section class="vocab-unit-hero"><p class="vocab-kicker">Unit ${escapeHtml(unitNumber)}</p><h1>${escapeHtml(unitTitle)}</h1><div class="vocab-progress-row"><strong>${escapeHtml(p.mastered)} / ${escapeHtml(p.total)} mastered</strong><span>${escapeHtml(p.needsAnotherLook)} need another look</span><span>${escapeHtml(p.reviewDue)} ready for review</span></div></section><section class="vocab-route-grid"><article class="vocab-route-card vocab-route-card--primary"><p class="vocab-kicker">Recommended</p><h2>Adaptive Session</h2><p>10 priority words. Mixed practice. No timer.</p><button class="vocab-button vocab-button--primary" data-action="start-adaptive">Start Adaptive Session</button></article><article class="vocab-route-card"><p class="vocab-kicker">Your choice</p><h2>Timed Practice</h2><p>Same adaptive practice, with a gentle stopping point.</p><div class="vocab-time-grid">${[5,10,15,20].map(minutes => `<button class="vocab-button" data-action="start-timed" data-minutes="${minutes}">${minutes} min</button>`).join('')}</div></article></section><button class="vocab-link" data-action="view-all-words">View all 50 words</button></main>`;
}

export function renderVocabularyQuestion(root, { unitNumber, unitTitle, question, term, sessionLabel, feedback = null, retry = false } = {}) {
  const feedbackHtml = feedback ? `<div class="vocab-feedback ${feedback.correct ? 'is-positive' : 'is-supportive'}"><strong>${escapeHtml(feedback.message)}</strong>${feedback.detail ? `<p>${escapeHtml(feedback.detail)}</p>` : ''}</div>` : '';
  root.innerHTML = `<main class="vocab-shell vocab-shell--session"><header class="vocab-topbar"><button class="vocab-back" data-action="leave-session">← Unit ${escapeHtml(unitNumber)}</button><span>${escapeHtml(sessionLabel ?? '')}</span></header><section class="vocab-question-card"><p class="vocab-kicker">${escapeHtml(question?.type?.replaceAll('_',' ') ?? 'Practice')}</p><div class="vocab-target-pill">${escapeHtml(term ?? '')}</div><h1>${escapeHtml(question?.prompt ?? '')}</h1>${feedbackHtml}<form data-form="vocabulary-answer" class="vocab-answer-form"><label>${retry ? 'Try it again' : 'Your answer'}<input name="answer" required autocomplete="off" maxlength="500" ${feedback?.correct ? 'disabled' : ''}></label>${feedback?.correct ? '<button type="button" class="vocab-button vocab-button--primary" data-action="next-question">Continue</button>' : `<button class="vocab-button vocab-button--primary" type="submit">${retry ? 'Try again' : 'Check answer'}</button>`}</form></section><p class="vocab-session-unit">Unit ${escapeHtml(unitNumber)} — ${escapeHtml(unitTitle)}</p></main>`;
}

export function supportiveFeedback({ correct, misconceptionCategory, recovery, term } = {}) {
  if (correct && recovery) return `Nice recovery — you got ${term || 'that one'}.`;
  if (correct) return `Nice work — ${term || 'that word'} is getting stronger.`;
  if (misconceptionCategory === 'related_but_inaccurate') return 'Close idea. Have another look at the exact meaning and try again.';
  if (misconceptionCategory === 'wrong_form') return 'You have the right idea. Check the word form and try again.';
  return 'Have another look at the context, then try it again.';
}

export function renderSessionSummary(root, { durationMinutes = null, summary = {} } = {}) {
  const title = durationMinutes ? `${durationMinutes}-minute session complete` : 'Adaptive session complete';
  root.innerHTML = `<main class="vocab-shell"><section class="vocab-summary-card"><p class="vocab-kicker">Progress made</p><h1>${escapeHtml(title)}</h1><div class="vocab-summary-grid"><div><strong>${escapeHtml(summary.practised ?? 0)}</strong><span>words practised</span></div><div><strong>${escapeHtml(summary.strengthened ?? 0)}</strong><span>strengthened</span></div><div><strong>${escapeHtml(summary.secure ?? 0)}</strong><span>moved to Secure</span></div><div><strong>${escapeHtml(summary.mastered ?? 0)}</strong><span>mastered</span></div></div><p>${escapeHtml(summary.needsAnotherLook ?? 0)} need another look. They’ll come back when they’re useful.</p><button class="vocab-button vocab-button--primary" data-action="back-unit">Back to unit</button></section></main>`;
}

export function renderVocabularyError(root, message) {
  root.innerHTML = `<main class="vocab-shell"><section class="vocab-summary-card"><h1>Unable to continue</h1><p>${escapeHtml(message)}</p><a class="vocab-button" href="./">Back to Hub</a></section></main>`;
}
