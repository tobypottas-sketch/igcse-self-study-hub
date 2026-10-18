import { escapeHtml } from '../views/html.js';
import { PRACTICE_MODES, activityDefinition } from './activity-catalogue.js';
import { deriveLearningStage } from './learning-stage.js';

const LEARNING_STAGES = Object.freeze(['emerging','building','developing','secure','mastered']);
const HIDE_TARGET_TYPES = new Set([
  'replace_phrase','produce_paraphrase','use_target','context_gap_fill',
  'complete_paraphrase','rewrite_phrase','rewrite_idea','improve_vocabulary','explain_another_way','word_family_switch',
  'definition_to_word','drag_definition_word','gap_fill_bank','drag_word_sentence','type_missing_word','spell_word','choose_word_sentence','word_family_choice'
]);

function statusOf(row) { return row?.status ?? 'new'; }
function dueAt(row) { return row?.review_due_at ?? row?.reviewDueAt ?? null; }
function errorPattern(row) { return row?.recent_error_pattern ?? row?.recentErrorPattern ?? null; }
function titleCase(value) {
  const text = String(value ?? '').replaceAll('_',' ');
  return text ? text[0].toUpperCase() + text.slice(1) : '';
}
function learningStageLabel(stage) { return titleCase(LEARNING_STAGES.includes(stage) ? stage : 'emerging'); }
function learningStagePosition(stage) { const index = LEARNING_STAGES.indexOf(stage); return (index < 0 ? 0 : index) + 1; }
function focusDefinition(id) { return PRACTICE_MODES.find(focus => focus.id === id) ?? PRACTICE_MODES.find(focus => focus.id === 'adaptive') ?? PRACTICE_MODES[0]; }
function selectedFocus(id) { return PRACTICE_MODES.find(focus => focus.id === id) ?? null; }
function questionSource(question) {
  const candidates = [
    ['sourceText','In context'],
    ['sourceIdea','Original idea'],
    ['sourcePhrase','Original phrase']
  ];
  for (const [key,label] of candidates) {
    const text = String(question?.[key] ?? '').trim();
    if (text) return { text, label };
  }
  return null;
}
function normalizedDisplayText(value) {
  return String(value ?? '').toLocaleLowerCase('en').replace(/[“”‘’'"`]/g, '').replace(/\s+/g, ' ').trim();
}
function visibleQuestionSource(question) {
  const source = questionSource(question);
  if (!source) return null;
  const prompt = String(question?.prompt ?? '').trim();
  if (prompt.endsWith(source.text)) return source;
  const normalizedPrompt = normalizedDisplayText(prompt);
  const normalizedSource = normalizedDisplayText(source.text);
  if (normalizedSource && normalizedPrompt.includes(normalizedSource)) return null;
  return source;
}
function displayPrompt(question) {
  const prompt = String(question?.prompt ?? '').trim();
  const source = questionSource(question)?.text ?? '';
  if (!source || !prompt.endsWith(source)) return prompt;
  return prompt.slice(0, -source.length).trim();
}
function renderLearningProgress(stages = {}) {
  const cells = LEARNING_STAGES.map(stage => `<span class="vocab-learning-progress__stage" data-stage="${stage}"><strong>${escapeHtml(stages?.[stage] ?? 0)}</strong><small>${escapeHtml(learningStageLabel(stage))}</small></span>`).join('');
  return `<div class="vocab-learning-progress" data-learning-progress aria-label="Vocabulary learning progress">${cells}</div>`;
}

export function buildUnitProgress({ occurrences = [], unitMastery = {}, globalMastery = {}, now = new Date() } = {}) {
  let mastered = 0;
  let needsAnotherLook = 0;
  let reviewDue = 0;
  const stages = { emerging:0, building:0, developing:0, secure:0, mastered:0 };
  const nowMs = new Date(now).getTime();
  for (const occurrence of occurrences) {
    const unit = unitMastery[occurrence.occurrenceId ?? occurrence.occurrence_id];
    const global = globalMastery[occurrence.vocabularyId ?? occurrence.vocabulary_id];
    const stage = deriveLearningStage(unit ?? global ?? {});
    stages[stage] += 1;
    if (stage === 'mastered') mastered += 1;
    if (statusOf(unit) === 'building' || Boolean(errorPattern(unit))) needsAnotherLook += 1;
    const due = dueAt(global);
    if (due && new Date(due).getTime() <= nowMs) reviewDue += 1;
  }
  return { total:occurrences.length, mastered, needsAnotherLook, reviewDue, stages };
}

export function renderVocabularyHome(root, { displayName = '', units = [] } = {}) {
  const cards = units.length ? units.map(unit => `
    <button class="vocab-unit-card" data-action="open-unit" data-unit="${escapeHtml(unit.unitNumber)}">
      <span class="vocab-unit-card__number">Unit ${escapeHtml(unit.unitNumber)}</span>
      <strong>${escapeHtml(unit.unitTitle)}</strong>
      <span>${escapeHtml(unit.mastered ?? 0)} / ${escapeHtml(unit.total ?? 50)} mastered</span>
      <small>Open unit →</small>
    </button>`).join('') : '<p class="vocab-empty">Your vocabulary units are being prepared. Check back soon.</p>';
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><a href="./" class="vocab-back">← Hub</a><span>Cambridge IGCSE ESL 0511</span></header><section class="vocab-hero"><p class="vocab-kicker">Vocabulary &amp; Paraphrase Builder</p><h1>Choose a unit</h1><p>${displayName ? `Hi ${escapeHtml(displayName)}. ` : ''}Choose a unit, then choose the exact 0511 skill you want to train.</p></section><section class="vocab-unit-grid">${cards}</section></main>`;
}

export function renderVocabularyUnit(root, { unitNumber, unitTitle, progress, practiceFocus = null, contentReady = true } = {}) {
  const p = progress ?? { mastered:0, total:50, needsAnotherLook:0, reviewDue:0, stages:{} };
  const selected = selectedFocus(practiceFocus);
  const ready = contentReady !== false;
  const focusButtons = PRACTICE_MODES.map(focus => `
    <button type="button" class="vocab-focus-card${focus.id === selected?.id ? ' is-selected' : ''}" data-action="set-practice-focus" data-practice-focus="${focus.id}" aria-pressed="${focus.id === selected?.id ? 'true' : 'false'}">
      <strong>${escapeHtml(focus.label)}</strong><span>${escapeHtml(focus.description)}</span>
    </button>`).join('');
  const pickerTitle = selected?.label ?? 'Choose a skill';
  const pickerDescription = selected?.description ?? 'Select the area you want to practise. Nothing is selected yet.';
  const startLabel = !ready ? 'Loading activities…' : selected ? (selected.id === 'adaptive' ? 'Start Adaptive Session' : `Start ${selected.label}`) : 'Select a skill to start';
  const startDisabled = !ready || !selected;
  const routeTitle = selected?.label ?? 'Choose a skill above';
  const disabledAttr = startDisabled ? ' disabled aria-disabled="true"' : '';
  const timedDisabled = ready ? '' : ' disabled aria-disabled="true"';
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><button class="vocab-back" data-action="back-units">← All units</button><span>Unit ${escapeHtml(unitNumber)}</span></header><section class="vocab-unit-hero"><p class="vocab-kicker">Unit ${escapeHtml(unitNumber)}</p><h1>${escapeHtml(unitTitle)}</h1><div class="vocab-progress-row"><strong>${escapeHtml(p.mastered)} / ${escapeHtml(p.total)} mastered</strong><span>${escapeHtml(p.needsAnotherLook)} need another look</span><span>${escapeHtml(p.reviewDue)} ready for review</span></div>${renderLearningProgress(p.stages)}</section><section class="vocab-practice-picker"><div class="vocab-practice-picker__head"><p class="vocab-kicker">Choose a 0511 skill</p><h2>${escapeHtml(pickerTitle)}</h2><p>${escapeHtml(pickerDescription)}</p></div><div class="vocab-focus-grid vocab-focus-grid--seven">${focusButtons}</div></section><section class="vocab-route-grid"><article class="vocab-route-card vocab-route-card--primary"><p class="vocab-kicker">10-activity session</p><h2>${escapeHtml(routeTitle)}</h2><p>Ten priority activities, with support and difficulty adjusted as you work.</p><button class="vocab-button vocab-button--primary" data-action="start-adaptive"${disabledAttr}>${escapeHtml(startLabel)}</button></article><article class="vocab-route-card vocab-route-card--mixed"><p class="vocab-kicker">Timed practice</p><h2>Mixed practice</h2><p>Mixes eligible activity styles as you work, while still respecting your current readiness and support needs.</p><div class="vocab-time-grid">${[5,10,15,20].map(minutes => `<button class="vocab-button" data-action="start-timed" data-minutes="${minutes}"${timedDisabled}>${minutes} min</button>`).join('')}</div></article></section><button class="vocab-link" data-action="view-all-words"${ready ? '' : ' disabled aria-disabled="true"'}>View all 50 words</button></main>`;
}

export function renderVocabularyWords(root, { unitNumber, unitTitle, words = [] } = {}) {
  const rows = words.map(word => {
    const strands = Object.entries(word.strands ?? {}).map(([strand,value]) => `<span class="vocab-word-strand"><small>${escapeHtml(titleCase(strand))}</small><strong>${escapeHtml(value)}</strong></span>`).join('');
    const stage = word.learningStage ?? deriveLearningStage(word.mastery ?? { status:word.status ?? 'new' });
    return `<article class="vocab-word-row"><div class="vocab-word-row__head"><div><strong>${escapeHtml(word.term)}</strong><span class="vocab-state-pill" data-state="${escapeHtml(stage)}">${escapeHtml(learningStageLabel(stage))}</span></div></div><div class="vocab-word-strands">${strands}</div></article>`;
  }).join('') || '<p class="vocab-empty">No live words are available in this unit yet.</p>';
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><button class="vocab-back" data-action="back-unit">← Unit ${escapeHtml(unitNumber)}</button><span>Vocabulary detail</span></header><section class="vocab-unit-hero"><p class="vocab-kicker">Unit ${escapeHtml(unitNumber)}</p><h1>All 50 words</h1><p>${escapeHtml(unitTitle)}</p><p class="vocab-detail-note">Your stages update as you practise: Emerging → Building → Developing → Secure → Mastered.</p></section><section class="vocab-word-list">${rows}</section></main>`;
}

function supportMessage(support) {
  if (!support || support.action !== 'retry') return '';
  if (support.kind === 'partial_text' && support.clue) return `Hint: start with ${support.clue}`;
  if (support.kind === 'partial_build') return 'One part is fixed for you. Build the rest of the answer.';
  if (support.kind === 'narrow_evidence') return 'Look again at the text. The evidence has been narrowed down.';
  if (support.kind === 'narrow_match' || support.kind === 'narrow_drag_gap') return 'Try again with two choices.';
  if (support.kind === 'narrow_choices') return '';
  return 'Use the extra support and try once more.';
}

function primaryPair(question) {
  const pairs = Array.isArray(question?.pairs) ? question.pairs : [];
  return pairs.find(pair => pair?.vocabularyId === question?.primaryEvidenceTargetId) ?? pairs[0] ?? null;
}
function matchOptions(question, support) {
  if (support?.kind === 'narrow_match') return support.options ?? [];
  const pairs = Array.isArray(question?.pairs) ? question.pairs : [];
  return question?.type === 'drag_definition_word'
    ? pairs.map(pair => pair?.term).filter(Boolean)
    : pairs.map(pair => pair?.definition).filter(Boolean);
}
function renderSelectOptions(options) {
  return `<option value="">Choose…</option>${(options ?? []).map(option => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('')}`;
}

function renderAnswerControl(question, feedback, retry, support) {
  if (feedback?.correct || support?.action === 'move_on') return '<button type="button" class="vocab-button vocab-button--primary" data-action="next-question">Continue</button>';
  const responseMode = question?.responseMode ?? 'text';
  if (responseMode === 'choice') {
    const source = support?.kind === 'narrow_choices' ? support.options : question.options;
    const options = (source ?? []).map(option => `<button type="button" class="vocab-choice" data-choice-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join('');
    return `<fieldset class="vocab-choice-fieldset${retry ? ' is-retry' : ''}"><legend>${retry ? 'Choose from these two' : 'Choose your answer'}</legend><div class="vocab-choice-grid">${options}</div></fieldset>`;
  }
  if (responseMode === 'matching' || responseMode === 'drag_match') {
    const target = primaryPair(question);
    const targetText = question?.type === 'drag_definition_word' ? target?.definition : target?.term;
    const options = matchOptions(question, support);
    const dragItems = responseMode === 'drag_match'
      ? `<div class="vocab-drag-bank" aria-label="Draggable choices">${options.map(option => `<button type="button" class="vocab-drag-token" draggable="true" data-drag-value="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join('')}</div><div class="vocab-drop-zone" data-drop-target data-match-target="${escapeHtml(question?.primaryEvidenceTargetId ?? '')}" tabindex="0" aria-label="Drop your answer here">Drop answer here</div>`
      : '';
    const selectAttr = responseMode === 'drag_match' ? ' data-drag-fallback' : ' data-match-select';
    return `<fieldset class="vocab-match-fieldset${retry ? ' is-retry' : ''}" data-match-target="${escapeHtml(question?.primaryEvidenceTargetId ?? '')}"><legend>${retry ? 'Try the match again' : 'Make the match'}</legend><p class="vocab-match-target">${escapeHtml(targetText ?? '')}</p>${dragItems}<label class="vocab-accessible-fallback">${responseMode === 'drag_match' ? 'Or choose an answer' : 'Choose the matching answer'}<select name="answer" required${selectAttr}>${renderSelectOptions(options)}</select></label><button class="vocab-button vocab-button--primary" type="submit">${retry ? 'Check supported answer' : 'Check answer'}</button></fieldset>`;
  }
  if (responseMode === 'drag_gap') {
    const options = support?.kind === 'narrow_drag_gap' ? support.options : (question.draggables ?? question.wordBank ?? []);
    const tokens = (options ?? []).map(option => `<button type="button" class="vocab-drag-token" draggable="true" data-drag-gap-value="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join('');
    return `<fieldset class="vocab-drag-gap${retry ? ' is-retry' : ''}"><legend>${retry ? 'Try the gap again' : 'Complete the gap'}</legend><div class="vocab-drag-bank">${tokens}</div><div class="vocab-drop-zone" data-gap-drop tabindex="0" aria-label="Drop the missing word here">Drop word here</div><label class="vocab-accessible-fallback">Or choose the missing word<select name="answer" required data-drag-gap-fallback>${renderSelectOptions(options)}</select></label><button class="vocab-button vocab-button--primary" type="submit">${retry ? 'Check supported answer' : 'Check answer'}</button></fieldset>`;
  }
  if (responseMode === 'spelling') {
    return `<div class="vocab-spelling-pattern" aria-label="Spelling clue">${escapeHtml(question?.spellingPattern ?? '')}</div><label>${retry ? 'Try the spelling again' : 'Type the word'}<input name="answer" required autocomplete="off" maxlength="120" spellcheck="false" aria-describedby="vocab-support-hint"></label><button class="vocab-button vocab-button--primary" type="submit">${retry ? 'Check supported answer' : 'Check answer'}</button>`;
  }
  if (responseMode === 'tiles') {
    const fixed = support?.kind === 'partial_build' ? (support.fixedChunks ?? []) : [];
    const fixedAnswer = fixed.join(' ');
    const source = support?.kind === 'partial_build' ? support.remainingTiles : question.tiles;
    const fixedHtml = fixed.length ? `<div class="vocab-build-answer"><span class="vocab-build-fixed">${fixed.map(escapeHtml).join(' ')}</span><span data-tile-build></span></div>` : '<div class="vocab-build-answer" data-tile-build aria-live="polite">Choose tiles to build your answer</div>';
    const tiles = (source ?? []).map(tile => `<button type="button" class="vocab-tile" data-tile-answer="${escapeHtml(tile)}">${escapeHtml(tile)}</button>`).join('');
    return `${fixedHtml}<div class="vocab-tile-bank">${tiles}</div><input type="hidden" name="answer" value="${escapeHtml(fixedAnswer)}"><div class="vocab-answer-actions"><button type="button" class="vocab-button" data-action="clear-tile-answer" data-fixed-answer="${escapeHtml(fixedAnswer)}">Clear answer</button><button class="vocab-button vocab-button--primary" type="submit">${retry ? 'Check supported answer' : 'Check answer'}</button></div>`;
  }
  if (responseMode === 'evidence') {
    const source = support?.kind === 'narrow_evidence' ? support.options : question.evidenceOptions;
    const options = (source ?? []).map(option => `<button type="button" class="vocab-evidence-option" data-evidence-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join('');
    return `<fieldset class="vocab-choice-fieldset${retry ? ' is-retry' : ''}"><legend>${retry ? 'Look again and choose' : 'Select the evidence'}</legend><div class="vocab-evidence-grid">${options}</div></fieldset>`;
  }
  return `<label>${retry ? 'Try your answer again' : 'Your answer'}<input name="answer" required autocomplete="off" maxlength="500" aria-describedby="vocab-support-hint"></label><button class="vocab-button vocab-button--primary" type="submit">${retry ? 'Check supported answer' : 'Check answer'}</button>`;
}

export function renderVocabularyQuestion(root, { unitNumber, unitTitle, question, term, sessionLabel, learningStage = null, feedback = null, retry = false, support = null } = {}) {
  const feedbackHtml = feedback ? `<div class="vocab-feedback ${feedback.correct ? 'is-positive' : 'is-supportive'}"><strong>${escapeHtml(feedback.message)}</strong>${feedback.detail ? `<p>${escapeHtml(feedback.detail)}</p>` : ''}</div>` : '';
  const supportText = supportMessage(support);
  const supportHtml = supportText ? `<p id="vocab-support-hint" class="vocab-support-hint">${escapeHtml(supportText)}</p>` : '';
  const definition = activityDefinition(question?.type);
  const questionLabel = definition?.label ?? titleCase(question?.type ?? 'Practice');
  const source = visibleQuestionSource(question);
  const questionContext = source ? `<aside class="vocab-question-context vocab-source-text"><span>${escapeHtml(source.label)}</span><p>${escapeHtml(source.text)}</p></aside>` : '';
  const targetPill = term && !HIDE_TARGET_TYPES.has(question?.type) ? `<div class="vocab-target-pill">${escapeHtml(term)}</div>` : '';
  const stage = learningStage ?? question?.learningStage ?? null;
  const stageCue = LEARNING_STAGES.includes(stage) ? `<span class="vocab-learning-stage" data-stage="${escapeHtml(stage)}"><strong>${escapeHtml(learningStageLabel(stage))}</strong><small>${learningStagePosition(stage)} of 5</small></span>` : '';
  const answerForm = `<form data-form="vocabulary-answer" class="vocab-answer-form">${renderAnswerControl(question, feedback, retry, support)}</form>`;
  const responseArea = retry && !feedback?.correct
    ? `<section class="vocab-retry-stage">${feedbackHtml}${supportHtml}${answerForm}</section>`
    : `<section class="vocab-response-stage${feedback?.correct ? ' is-correct' : ''}">${feedbackHtml}${supportHtml}${answerForm}</section>`;
  root.innerHTML = `<main class="vocab-shell vocab-shell--session"><header class="vocab-topbar"><button class="vocab-back" data-action="leave-session">← Unit ${escapeHtml(unitNumber)}</button><span>${escapeHtml(sessionLabel ?? '')}</span></header><section class="vocab-question-card"><div class="vocab-question-meta"><p class="vocab-kicker">${escapeHtml(questionLabel)}</p><div class="vocab-question-meta__right"><span>${escapeHtml(definition?.skillFamily ? titleCase(definition.skillFamily) : '')}</span>${stageCue}</div></div>${targetPill}<h1 class="vocab-question-prompt">${escapeHtml(displayPrompt(question))}</h1>${questionContext}${responseArea}</section><p class="vocab-session-unit">Unit ${escapeHtml(unitNumber)} — ${escapeHtml(unitTitle)}</p></main>`;
}

export function supportiveFeedback({ correct, misconceptionCategory, recovery, term, meaning, questionType } = {}) {
  const word = term ? `“${term}”` : 'the language';
  const clearMeaning = String(meaning ?? '').trim();
  if (correct && recovery) return 'Good recovery — you kept the meaning accurately this time.';
  if (correct && questionType === 'meaning_match' && clearMeaning) return `Correct — ${word} means ${clearMeaning} here.`;
  if (correct && ['phrase_match','build_paraphrase','complete_paraphrase','rewrite_phrase'].includes(questionType)) return 'Correct — that version keeps the phrase meaning.';
  if (correct && ['same_idea','build_same_idea','rewrite_idea','spot_meaning_change'].includes(questionType)) return 'Correct — you tracked the whole idea accurately.';
  if (correct && ['question_text_bridge','find_evidence'].includes(questionType)) return 'Correct — that wording points to the same information in the text.';
  if (correct) return 'Correct — that answer fits the meaning and context.';
  const messages = {
    quantity_change:'Not quite — the quantity changed. Keep words such as some, many, most and all precise.',
    degree_change:'Not quite — the strength or certainty changed. Keep the original degree of meaning.',
    time_change:'Not quite — the timing changed. Keep the original time relationship.',
    cause_effect_change:'Not quite — the cause and result relationship changed.',
    contrast_change:'Not quite — the relationship between the ideas changed.',
    added_information:'Not quite — that version adds information that was not in the original.',
    omitted_information:'Not quite — an important part of the original meaning has disappeared.',
    unnatural_collocation:'The idea is close, but that word combination is not natural English.',
    too_vague:'The idea is related, but the wording is too vague to keep the meaning precisely.',
    register_mismatch:'The meaning is close, but the register does not fit this context.',
    related_but_inaccurate:'Close — the meaning is related, but it is not precise enough here.',
    wrong_form:'Right idea — check the word form.'
  };
  if (messages[misconceptionCategory]) return `${messages[misconceptionCategory]} Try once more with support.`;
  if (clearMeaning && questionType === 'meaning_match') return `Not quite. Here, ${word} means ${clearMeaning}. Try once more with support.`;
  return 'Not quite. Check the meaning carefully and try once more with support.';
}

export function renderSessionSummary(root, { durationMinutes = null, summary = {}, practiceMode = 'adaptive', nextPractice = null } = {}) {
  const selected = focusDefinition(practiceMode);
  const title = durationMinutes ? `${durationMinutes}-minute session complete` : `${selected.label} session complete`;
  const next = nextPractice ? `<p class="vocab-next-practice"><strong>Next useful practice:</strong> ${escapeHtml(focusDefinition(nextPractice).label)}</p>` : '';
  const celebration = !durationMinutes && Number(summary.practised ?? 0) >= 10
    ? '<div class="vocab-celebration" aria-hidden="true"><span>✦</span><span>●</span><span>✦</span><span>●</span><span>✦</span><span>●</span><i>✓</i></div>'
    : '';
  root.innerHTML = `<main class="vocab-shell"><section class="vocab-summary-card">${celebration}<p class="vocab-kicker">Progress made</p><h1>${escapeHtml(title)}</h1><div class="vocab-summary-grid"><div><strong>${escapeHtml(summary.practised ?? 0)}</strong><span>activities completed</span></div><div><strong>${escapeHtml(summary.strengthened ?? 0)}</strong><span>successful activities</span></div><div><strong>${escapeHtml(summary.secure ?? 0)}</strong><span>moved to Secure</span></div><div><strong>${escapeHtml(summary.mastered ?? 0)}</strong><span>mastered</span></div></div><p>${escapeHtml(summary.needsAnotherLook ?? 0)} still need another look. They will return in a different form.</p>${next}<button class="vocab-button vocab-button--primary" data-action="back-unit">Back to unit</button></section></main>`;
}

export function renderVocabularyError(root, message) {
  root.innerHTML = `<main class="vocab-shell"><section class="vocab-summary-card"><h1>Unable to continue</h1><p>${escapeHtml(message)}</p><a class="vocab-button" href="./">Back to Hub</a></section></main>`;
}