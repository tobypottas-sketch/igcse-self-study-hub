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

function unitLabel(unitNumber) {
  const number = Math.trunc(Number(unitNumber));
  return Number.isInteger(number) && number > 0 ? `Unit ${number}` : 'Unit';
}

function passageHtml(form, answers = {}, reference = false) {
  const paragraphs = String(form?.passage ?? '').split(/\n\n+/).map(paragraph => {
    const marked = escapeHtml(paragraph).replace(/\[\[([1-6])\]\]/g, (_, rawGapNumber) => {
      const gapNumber = Number(rawGapNumber);
      const questionId = form?.questions?.[gapNumber - 1]?.id;
      const selected = String(questionId ? answers?.[questionId] ?? '' : '').trim();
      const value = selected || '_____';
      const filled = selected ? ' vocab-unit-check-gap--filled' : '';
      return `<mark class="vocab-unit-check-gap${filled}" data-unit-check-gap="${gapNumber}"><span class="vocab-unit-check-gap__number">(${gapNumber})</span> ${escapeHtml(value)}</mark>`;
    });
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

function questionPromptHtml(question) {
  const prompt = escapeHtml(question?.prompt ?? '');
  if (question?.type !== 'word_form') return prompt;
  return prompt.replace(/(correct form of\s+)([A-Za-z-]+)/i, '$1<span class="vocab-unit-check-target-word">$2</span>');
}

function questionNavigator(questions, currentIndex, answers) {
  return `<nav class="vocab-unit-check-question-nav" aria-label="Questions">${questions.map((question,index) => {
    const answered = Boolean(String(answers?.[question.id] ?? '').trim());
    const current = index === currentIndex;
    const classes = ['vocab-unit-check-question-nav__item', answered ? 'is-answered' : '', current ? 'is-current' : ''].filter(Boolean).join(' ');
    const currentAttr = current ? ' aria-current="step"' : '';
    const label = `Question ${index + 1}${answered ? ', answered' : ''}${current ? ', current' : ''}`;
    return `<button type="button" class="${classes}" data-unit-check-action="jump" data-question-index="${index}"${currentAttr} aria-label="${label}">${index + 1}</button>`;
  }).join('')}</nav>`;
}

function resultTone(scored = {}) {
  const score = Number(scored?.score ?? 0);
  const maxScore = Math.max(1, Number(scored?.maxScore ?? 10));
  const ratio = score / maxScore;
  if (ratio === 1) return 'perfect';
  if (ratio >= .8) return 'strong';
  if (ratio >= .6) return 'steady';
  return 'building';
}

function resultTheme(scored = {}) {
  const ratio = Number(scored?.score ?? 0) / Math.max(1, Number(scored?.maxScore ?? 10));
  if (ratio >= .9) return 'gold';
  if (ratio >= .7) return 'teal';
  if (ratio >= .4) return 'amber';
  return 'rose';
}

function resultCopy(tone) {
  if (tone === 'perfect') return { title:'Excellent work', message:'Every answer was correct. That is a complete performance.' };
  if (tone === 'strong') return { title:'Strong result', message:'You have a secure grasp of most of this unit vocabulary.' };
  if (tone === 'steady') return { title:'Good progress', message:'You are close. Use the feedback below to tighten the remaining gaps.' };
  return { title:'Keep building', message:'Use the feedback below, revisit the unit vocabulary, then return for another form.' };
}

function attemptJourney(attemptNumber = 1, locked = false) {
  const current = Math.max(1, Math.min(3, Number(attemptNumber) || 1));
  const steps = [1,2,3].map(number => {
    let state = 'locked';
    let stateLabel = 'Locked';
    if (number <= current) { state = 'complete'; stateLabel = 'Complete'; }
    else if (!locked && number === current + 1) { state = 'next'; stateLabel = 'Available'; }
    return `<span class="vocab-unit-check-journey__step is-${state}"><span class="vocab-unit-check-journey__number">${number <= current ? '✓' : number}</span><span><strong>Attempt ${number}</strong><small>${stateLabel}</small></span></span>`;
  }).join('');
  return `<div class="vocab-unit-check-journey" aria-label="Assessment attempts">${steps}</div>`;
}

export function renderUnitCheckScreen({ unitNumber, form, attemptNumber, questionIndex = 0, answers = {}, saving = false, saveError = '' } = {}) {
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
  const category = question?.type === 'word_form' ? 'Word form' : question?.type === 'precision_mcq' ? 'Precision & use' : question?.type === 'paraphrase_mcq' ? 'Paraphrase' : 'Vocabulary in context';
  return `<main class="vocab-shell vocab-shell--unit-check"><header class="vocab-topbar vocab-unit-check-topbar"><button type="button" class="vocab-back vocab-back--chip" data-unit-check-action="leave"><span class="vocab-back__arrow" aria-hidden="true">←</span> ${unitLabel(unitNumber)}</button><div class="vocab-unit-check-topbar__title"><span class="vocab-unit-check-mode-badge">Formal check</span><strong>Unit Vocabulary Check</strong></div><div class="vocab-unit-check-topbar__meta"><span>Attempt ${escapeHtml(attemptNumber)} of 3</span><span>Question ${number} of ${questions.length}</span><span>${answered}/${questions.length} answered</span></div></header><section class="vocab-unit-check-layout">${passageHtml(form,answers,reference)}<article class="vocab-unit-check-question" data-unit-check-question><span class="vocab-unit-check-question__accent" aria-hidden="true"></span><div class="vocab-unit-check-question__main"><div class="vocab-unit-check-progress"><span>Question ${number} of ${questions.length}</span><span>${answered} answered</span></div><p class="vocab-kicker">${category}</p><h1 tabindex="-1">${questionPromptHtml(question)}</h1>${questionControl(question,answers?.[question?.id] ?? '')}${error}</div><footer class="vocab-unit-check-question__footer">${questionNavigator(questions,index,answers)}<div class="vocab-unit-check-nav">${previous}${next}</div><p class="vocab-unit-check-note">No answers are marked until you submit the whole check.</p></footer></article></section></main>`;
}

export function renderUnitCheckReview({ unitNumber, attemptNumber, scored, feedback, locked = false, saveError = '' } = {}) {
  const items = (feedback?.items ?? []).map(item => {
    const answer = feedback.mode === 'full'
      ? `<p><strong>Your answer:</strong> ${escapeHtml(item.studentAnswer || 'No answer')}</p><p><strong>Correct answer:</strong> ${escapeHtml(item.correctAnswer)}</p><p>${escapeHtml(item.explanation)}</p>`
      : `<p>${escapeHtml(item.diagnostic)}</p>`;
    const state = feedback.mode === 'full' ? ` <span class="vocab-unit-check-review-state">${item.correct ? '✓ Correct' : '✗ Review'}</span>` : '';
    return `<li><strong>Question ${escapeHtml(String(item.questionId).replace(/^\D+/,''))}${state}</strong>${answer}</li>`;
  }).join('');
  const tone = resultTone(scored);
  const copy = resultCopy(tone);
  const perfect = tone === 'perfect';
  const strong = tone === 'perfect' || tone === 'strong';
  const feedbackSection = feedback?.mode === 'full'
    ? `<section class="vocab-unit-check-feedback"><div class="vocab-unit-check-feedback__head"><span>Review</span><h2>Full answer review</h2></div><ol>${items}</ol></section>`
    : perfect
      ? '<section class="vocab-unit-check-perfect"><strong>Clean sweep</strong><span>No review points this time — every response was correct.</span></section>'
      : `<section class="vocab-unit-check-feedback"><div class="vocab-unit-check-feedback__head"><span>Next focus</span><h2>Check these areas</h2></div><ol>${items}</ol></section>`;
  const next = locked
    ? '<p class="vocab-unit-check-complete"><strong>Assessment complete.</strong> All three forms have been used.</p>'
    : '<p class="vocab-unit-check-next"><strong>Next form ready.</strong> When you return, your next attempt uses a different passage and questions.</p>';
  const error = saveError ? `<p class="vocab-unit-check-error" role="alert">${escapeHtml(saveError)}</p>` : '';
  const celebration = strong ? '<div class="vocab-unit-check-celebration" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' : '';
  return `<main class="vocab-shell vocab-shell--unit-check-review vocab-unit-check-result-shell vocab-unit-check-result-shell--${tone}" data-score-theme="${resultTheme(scored)}"><article class="vocab-unit-check-result">${celebration}<header class="vocab-unit-check-result__hero"><div class="vocab-unit-check-result__copy"><p class="vocab-kicker">Attempt ${escapeHtml(attemptNumber)} complete</p><h1>${copy.title}</h1><p>${copy.message}</p></div><div class="vocab-unit-check-score-medallion" aria-label="Score ${escapeHtml(scored?.score ?? 0)} out of ${escapeHtml(scored?.maxScore ?? 10)}"><strong>${escapeHtml(scored?.score ?? 0)}<span>/</span>${escapeHtml(scored?.maxScore ?? 10)}</strong><small>score</small></div></header>${attemptJourney(attemptNumber,locked)}${feedbackSection}${next}${error}<div class="vocab-summary-actions vocab-unit-check-result__actions"><button type="button" class="vocab-button vocab-button--primary" data-unit-check-action="back-unit">Back to ${unitLabel(unitNumber)}</button></div></article></main>`;
}
