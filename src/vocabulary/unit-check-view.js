import { escapeHtml } from '../views/html.js';

function scoreStat(label, value) {
  return `<span class="vocab-unit-check-card__stat"><small>${escapeHtml(label)}</small><strong>${value ? `${escapeHtml(value.score)} / ${escapeHtml(value.maxScore)}` : '—'}</strong></span>`;
}

export function renderUnitCheckCard({ attemptNumber = 1, formId = 'A', attemptsUsed = 0, latest = null, best = null, locked = false, loading = false, unavailable = false } = {}) {
  const remaining = Math.max(0, 3 - Number(attemptsUsed || 0));
  const status = loading ? 'Loading your check…' : unavailable ? 'Score service unavailable' : locked ? 'All 3 attempts complete' : `Attempt ${escapeHtml(attemptNumber)} of 3 · Form ${escapeHtml(formId)}`;
  const action = locked
    ? '<span class="vocab-unit-check-card__locked">Assessment complete</span>'
    : `<button type="button" class="vocab-button vocab-button--primary" data-unit-check-action="start"${loading || unavailable ? ' disabled aria-disabled="true"' : ''}>${attemptsUsed ? 'Start next attempt' : 'Start Unit Check'}</button>`;
  return `<section class="vocab-unit-check-card study-enter" data-unit-check-card aria-labelledby="unitCheckTitle"><div class="vocab-unit-check-card__copy"><p class="vocab-kicker">Formal assessment</p><h2 id="unitCheckTitle">Unit Vocabulary Check</h2><p class="vocab-unit-check-card__course">Cambridge iGCSE ESL 0511</p><p>10 questions · 3 attempts · feedback after submission</p><strong class="vocab-unit-check-card__status">${status}</strong></div><div class="vocab-unit-check-card__scores">${scoreStat('Latest', latest)}${scoreStat('Best', best)}<span class="vocab-unit-check-card__stat"><small>Attempts left</small><strong>${remaining}</strong></span></div><div class="vocab-unit-check-card__action">${action}</div></section>`;
}

function passageHtml(form, reference = false) {
  const paragraphs = String(form?.passage ?? '').split(/\n\n+/).map(paragraph => {
    const marked = escapeHtml(paragraph).replace(/\[\[([1-6])\]\]/g, '<mark class="vocab-unit-check-gap">($1) _____</mark>');
    return `<p>${marked}</p>`;
  }).join('');
  return `<aside class="vocab-unit-check-passage${reference ? ' is-reference' : ''}" data-unit-check-passage><div class="vocab-unit-check-passage__head"><div><p class="vocab-kicker">Reading text</p><h2>${escapeHtml(form?.title ?? '')}</h2></div><button type="button" class="vocab-unit-check-passage__toggle" data-unit-check-action="toggle-passage" aria-expanded="true">Passage</button></div><div class="vocab-unit-check-passage__body" data-unit-check-passage-body>${paragraphs}</div></aside>`;
}

function questionControl(question, savedAnswer = '') {
  if (question?.type === 'word_form') {
    return `<label class="vocab-unit-check-typed"><span>Your answer</span><input type="text" autocomplete="off" spellcheck="false" value="${escapeHtml(savedAnswer)}" data-unit-check-answer data-question-id="${escapeHtml(question.id)}"></label>`;
  }
  const choices = (question?.choices ?? []).map((choice,index) => {
    const checked = String(savedAnswer) === String(choice) ? ' checked' : '';
    return `<label class="vocab-unit-check-choice"><input type="radio" name="unit-check-${escapeHtml(question.id)}" value="${escapeHtml(choice)}" data-unit-check-answer data-question-id="${escapeHtml(question.id)}"${checked}><span><b>${String.fromCharCode(65 + index)}.</b> ${escapeHtml(choice)}</span></label>`;
  }).join('');
  return `<fieldset class="vocab-unit-check-choices"><legend class="vocab-sr-only">Choose one answer</legend>${choices}</fieldset>`;
}

export function renderUnitCheckScreen({ form, attemptNumber, questionIndex = 0, answers = {}, saving = false, saveError = '' } = {}) {
  const questions = form?.questions ?? [];
  const index = Math.max(0, Math.min(questions.length - 1, Number(questionIndex) || 0));
  const question = questions[index];
  const number = index + 1;
  const reference = number > 6;
  const answered = Object.values(answers ?? {}).filter(value => String(value ?? '').trim()).length;
  const previous = index > 0 ? '<button type="button" class="vocab-button" data-unit-check-action="previous">← Previous</button>' : '<span></span>';
  const next = index < questions.length - 1
    ? '<button type="button" class="vocab-button vocab-button--primary" data-unit-check-action="next">Next →</button>'
    : `<button type="button" class="vocab-button vocab-button--primary" data-unit-check-action="submit"${saving ? ' disabled aria-busy="true"' : ''}>${saving ? 'Saving…' : 'Submit all 10 answers'}</button>`;
  const error = saveError ? `<p class="vocab-unit-check-error" role="alert">${escapeHtml(saveError)}</p>` : '';
  return `<main class="vocab-shell vocab-shell--unit-check"><header class="vocab-topbar"><button type="button" class="vocab-back vocab-back--chip" data-unit-check-action="leave"><span class="vocab-back__arrow" aria-hidden="true">←</span> Unit 1</button><span>Unit Vocabulary Check · Attempt ${escapeHtml(attemptNumber)} of 3</span></header><section class="vocab-unit-check-layout">${passageHtml(form,reference)}<article class="vocab-unit-check-question" data-unit-check-question><div class="vocab-unit-check-progress"><span>Question ${number} of ${questions.length}</span><span>${answered} answered</span></div><p class="vocab-kicker">${question?.type === 'word_form' ? 'Word form' : question?.type === 'precision_mcq' ? 'Precision & use' : question?.type === 'paraphrase_mcq' ? 'Paraphrase' : 'Vocabulary in context'}</p><h1 tabindex="-1">${escapeHtml(question?.prompt ?? '')}</h1>${questionControl(question,answers?.[question?.id] ?? '')}${error}<div class="vocab-unit-check-nav">${previous}${next}</div><p class="vocab-unit-check-note">No answers are marked until you submit the whole check.</p></article></section></main>`;
}

export function renderUnitCheckReview({ attemptNumber, scored, feedback, locked = false, saveError = '' } = {}) {
  const items = (feedback?.items ?? []).map(item => {
    const answer = feedback.mode === 'full'
      ? `<p><strong>Your answer:</strong> ${escapeHtml(item.studentAnswer || 'No answer')}</p><p><strong>Correct answer:</strong> ${escapeHtml(item.correctAnswer)}</p><p>${escapeHtml(item.explanation)}</p>`
      : `<p>${escapeHtml(item.diagnostic)}</p>`;
    const state = feedback.mode === 'full' ? ` <span class="vocab-unit-check-review-state">${item.correct ? '✓ Correct' : '✗ Review'}</span>` : '';
    return `<li><strong>Question ${escapeHtml(String(item.questionId).replace(/^\D+/,''))}${state}</strong>${answer}</li>`;
  }).join('');
  const perfect = Number(scored?.score) === Number(scored?.maxScore);
  const feedbackSection = feedback?.mode === 'full'
    ? `<section class="vocab-unit-check-feedback"><h2>Full review</h2><ol>${items}</ol></section>`
    : perfect
      ? '<p class="vocab-unit-check-perfect">Excellent — every answer was correct.</p>'
      : `<section class="vocab-unit-check-feedback"><h2>Check these areas</h2><ol>${items}</ol></section>`;
  const next = locked
    ? '<p class="vocab-unit-check-complete"><strong>Assessment complete</strong> — all three forms have been used.</p>'
    : '<p class="vocab-unit-check-next">Try again with a new form when you are ready. Your next attempt uses a different passage and questions.</p>';
  const error = saveError ? `<p class="vocab-unit-check-error" role="alert">${escapeHtml(saveError)}</p>` : '';
  return `<main class="vocab-shell vocab-shell--unit-check-review"><article class="vocab-unit-check-result"><p class="vocab-kicker">Attempt ${escapeHtml(attemptNumber)} complete</p><h1>Score</h1><div class="vocab-unit-check-score"><strong>${escapeHtml(scored?.score ?? 0)} / ${escapeHtml(scored?.maxScore ?? 10)}</strong></div>${feedbackSection}${next}${error}<div class="vocab-summary-actions"><button type="button" class="vocab-button vocab-button--primary" data-unit-check-action="back-unit">Back to Unit 1</button></div></article></main>`;
}
