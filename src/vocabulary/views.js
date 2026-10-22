import { escapeHtml } from '../views/html.js';
import { achievementArtSvg, pathwayArtSvg, unitArtSvg } from './study-art-svg.js';
import { PRACTICE_MODES, activityDefinition } from './activity-catalogue.js';
import { deriveLearningStage } from './learning-stage.js';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES } from './pathway-model.js';
import { pathwayIdentity, renderStudyIcon } from './study-ui.js';
import { renderMatchSet } from './match-set-view.js';
import { shippedGraphic } from './graphics-registry.js';

const LEARNING_STAGES = Object.freeze(['emerging','building','developing','secure','mastered']);
const HIDE_TARGET_TYPES = new Set([
  'replace_phrase','produce_paraphrase','use_target','context_gap_fill',
  'complete_paraphrase','rewrite_phrase','rewrite_idea','improve_vocabulary','explain_another_way','word_family_switch',
  'definition_to_word','drag_definition_word','gap_fill_bank','drag_word_sentence','type_missing_word','spell_word','spell_in_context','choose_word_sentence','word_family_choice',
  'type_word_from_definition','context_sentence_match','word_family_match','precision_choice','precision_match','spelling_choice','spelling_cue_match','spelling_rebuild'
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
function embeddedPromptSource(question) {
  const lines = String(question?.prompt ?? '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length < 2) return null;
  return { text:lines.slice(1).join(' '), label:'In context', embedded:true };
}
function questionSource(question) {
  const candidates = [
    ['sourceText','In context'],
    ['sourceIdea','Original idea'],
    ['sourcePhrase','Original phrase']
  ];
  for (const [key,label] of candidates) {
    const text = String(question?.[key] ?? '').trim();
    if (text) return { text, label, embedded:false };
  }
  return embeddedPromptSource(question);
}
function normalizedDisplayText(value) {
  return String(value ?? '').toLocaleLowerCase('en').replace(/[“”‘’'"`]/g, '').replace(/\s+/g, ' ').trim();
}
function visibleQuestionSource(question) {
  const source = questionSource(question);
  if (!source) return null;
  if (source.embedded) return source;
  const prompt = String(question?.prompt ?? '').trim();
  if (prompt.endsWith(source.text)) return source;
  const normalizedPrompt = normalizedDisplayText(prompt);
  const normalizedSource = normalizedDisplayText(source.text);
  if (normalizedSource && normalizedPrompt.includes(normalizedSource)) return null;
  return source;
}
function displayPrompt(question) {
  const prompt = String(question?.prompt ?? '').trim();
  const source = questionSource(question);
  if (!source) return prompt;
  if (source.embedded) return prompt.split(/\r?\n/)[0].trim();
  if (!prompt.endsWith(source.text)) return prompt;
  return prompt.slice(0, -source.text.length).trim();
}
function renderLearningProgress(stages = {}) {
  const cells = LEARNING_STAGES.map(stage => `<span class="vocab-learning-progress__stage" data-stage="${stage}"><strong>${escapeHtml(stages?.[stage] ?? 0)}</strong><small>${escapeHtml(learningStageLabel(stage))}</small></span>`).join('');
  return `<div class="vocab-learning-progress" data-learning-progress aria-label="Vocabulary learning progress">${cells}</div>`;
}
function renderStudyProgress(value, max, label) {
  const safeMax = Math.max(1,Number(max) || 1);
  const safeValue = Math.max(0,Math.min(safeMax,Number(value) || 0));
  const percentage = Math.round((safeValue / safeMax) * 100);
  return `<div class="study-progress" role="progressbar" aria-label="${escapeHtml(label)}" aria-valuemin="0" aria-valuemax="${safeMax}" aria-valuenow="${safeValue}"><span class="study-progress__bar" style="--study-progress:${percentage}%"></span></div>`;
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

// Decorative artwork is rendered into the first HTML at a size the slot owns (see vocabulary-study-art.css),
// so nothing is injected after paint and the artwork can never change layout.
// A shipped PNG is layered over the inline SVG (which stays as the placeholder and the fallback). The slot keeps its size,
// so a PNG can never change layout; graphics-runtime.js reveals it only after it has loaded. Decorative: alt is empty.
function pngLayer(group, key, eager = false) {
  const asset = shippedGraphic(group, key);
  return asset ? { has:true, html:`<img class="study-art__png" data-art-png src="${escapeHtml(asset.src)}" width="${asset.width}" height="${asset.height}" alt="" decoding="async" loading="${eager ? 'eager' : 'lazy'}" draggable="false">` } : { has:false, html:'' };
}
function artSlotAttrs(png) { return png.has ? ' data-art-slot' : ''; }
function unitArtSlot(unitNumber) {
  const svg = unitArtSvg(unitNumber,'vocab-unit-card__art-image'); const png = pngLayer('unit', unitNumber);
  return svg ? `<span class="vocab-unit-card__art${png.has ? ' has-png' : ''}" data-unit-art="${escapeHtml(unitNumber)}"${artSlotAttrs(png)} aria-hidden="true">${svg}${png.html}</span>` : '';
}
function unitHeroArt(unitNumber) {
  const svg = unitArtSvg(unitNumber,'vocab-unit-hero__art-image'); const png = pngLayer('unit', unitNumber, true);
  return svg ? `<figure class="vocab-unit-hero__art${png.has ? ' has-png' : ''}" data-unit-hero-art="${escapeHtml(unitNumber)}"${artSlotAttrs(png)} aria-hidden="true">${svg}${png.html}</figure>` : '';
}
// has-png-art is decided at render time (from the manifest), never from load success, so the banner geometry is fixed from the
// first paint and a PNG that loads late or fails cannot move anything.
function unitHeroClass(unitNumber) { return unitArtSvg(unitNumber) ? `vocab-unit-hero has-study-art${shippedGraphic('unit', unitNumber) ? ' has-png-art' : ''}` : 'vocab-unit-hero'; }
function pathwayArtSlot(pathwayId) {
  const svg = pathwayArtSvg(pathwayId,'vocab-pathway-card__art-image'); const png = pngLayer('pathway', pathwayId);
  return svg ? `<span class="vocab-pathway-card__art${png.has ? ' has-png' : ''}" data-pathway-art="${escapeHtml(pathwayId)}"${artSlotAttrs(png)} aria-hidden="true">${svg}${png.html}</span>` : '';
}
function milestoneArt(kind) {
  const svg = achievementArtSvg(kind,'study-milestone-art__image');
  return svg ? `<span class="study-milestone-art study-milestone-art--${escapeHtml(kind)}" data-study-milestone-art="${escapeHtml(kind)}" aria-hidden="true">${svg}</span>` : '';
}
function completionArt(kind, { rays = true } = {}) {
  const svg = achievementArtSvg(kind,'vocab-completion-art__image');
  const burst = rays ? '<span class="vocab-completion-rays" aria-hidden="true"></span>' : '';
  return svg ? `<div class="vocab-completion-art" data-study-completion-art="${escapeHtml(kind)}" aria-hidden="true">${burst}${svg}</div>` : '';
}

export function renderVocabularyHome(root, { displayName = '', units = [] } = {}) {
  const cards = units.length ? units.map(unit => {
    const mastered = Number(unit.mastered ?? 0);
    const total = Number(unit.total ?? 50);
    return `
    <button class="vocab-unit-card study-enter" data-action="open-unit" data-unit="${escapeHtml(unit.unitNumber)}">
      <span class="vocab-unit-card__number">Unit ${escapeHtml(unit.unitNumber)}</span>
      <strong>${escapeHtml(unit.unitTitle)}</strong>
      <span class="vocab-unit-card__progress-copy">${escapeHtml(mastered)} / ${escapeHtml(total)} mastered</span>
      <span data-study-unit-progress>${renderStudyProgress(mastered,total,`Unit ${unit.unitNumber} mastery`)}</span>
      <small>Open unit ${renderStudyIcon('arrow',{className:'vocab-unit-card__arrow'})}</small>
      ${unitArtSlot(unit.unitNumber)}
    </button>`;
  }).join('') : `<div class="vocab-empty study-milestone-card" data-study-empty>${renderStudyIcon('spark',{className:'study-icon--xl'})}<strong>Your vocabulary units are being prepared.</strong><p>Check back soon.</p></div>`;
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><a href="./" class="vocab-back">← Hub</a><span>Cambridge IGCSE ESL 0511</span></header><section class="vocab-hero"><p class="vocab-kicker">Vocabulary &amp; Paraphrase Builder</p><h1>Choose a unit</h1><p>${displayName ? `Hi ${escapeHtml(displayName)}. ` : ''}Choose a unit, then work upwards through each vocabulary pathway.</p></section><section class="vocab-unit-grid">${cards}</section></main>`;
}

function normalizedPathwayState(pathwayId, pathwayStates = {}) {
  const state = pathwayStates?.[pathwayId] ?? {};
  const currentStage = PATHWAY_STAGES.some(stage => stage.id === state.currentStage) ? state.currentStage : 'recognise';
  const completedStages = new Set(Array.isArray(state.completedStages) ? state.completedStages : []);
  const mastered = state.mastered === true || completedStages.has('mastery');
  const coverageCount = Number.isFinite(Number(state.coverageCount)) ? Number(state.coverageCount) : null;
  const totalCount = Number.isFinite(Number(state.totalCount)) ? Number(state.totalCount) : null;
  return {
    currentStage,
    completedStages,
    needsPractice:state.needsPractice === true,
    mastered,
    available:state.available !== false,
    coverageCount,
    totalCount,
    unavailableReason:state.unavailableReason ?? null,
    stageEvidence:state.stageEvidence ?? null
  };
}
function pathwayEvidenceCopy(evidence) {
  const attempts = Number(evidence?.attempts) || 0;
  const clean = Number(evidence?.cleanSuccesses) || 0;
  const prompts = Number(evidence?.distinctPrompts) || 0;
  if (!attempts && !clean && !prompts) return 'No saved evidence yet';
  const parts = [`${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}`, `${clean} clean`];
  if (prompts) parts.push(`${prompts} ${prompts === 1 ? 'prompt' : 'prompts'}`);
  return parts.join(' · ');
}
// The evidence readout is rendered complete in the card's first HTML from the state the caller already holds.
function pathwayEvidence(state) {
  const evidence = state.stageEvidence;
  const stageId = PATHWAY_STAGES.some(stage => stage.id === evidence?.stageId) ? evidence.stageId : state.currentStage;
  const label = PATHWAY_STAGES.find(stage => stage.id === stageId)?.label ?? 'Recognise';
  const percent = Math.max(0,Math.min(100,Math.round(Number(evidence?.progressPercent) || 0)));
  return `<span class="vocab-pathway-card__evidence" data-pathway-evidence="${escapeHtml(stageId)}"><span class="vocab-pathway-card__evidence-copy"><strong>${escapeHtml(label)} evidence</strong><small>${escapeHtml(pathwayEvidenceCopy(evidence))}</small></span><span class="vocab-pathway-card__evidence-meter" role="progressbar" aria-label="${escapeHtml(label)} evidence progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span class="vocab-pathway-card__evidence-fill" style="--pathway-evidence:${percent}%"></span></span></span>`;
}
function stageVisualState(stageId, state) {
  if (state.completedStages.has(stageId)) return 'complete';
  if (stageId === state.currentStage) return 'current';
  const stageIndex = PATHWAY_STAGES.findIndex(stage => stage.id === stageId);
  const currentIndex = PATHWAY_STAGES.findIndex(stage => stage.id === state.currentStage);
  return stageIndex < currentIndex ? 'complete' : 'locked';
}
function renderPathwayCard(pathway, pathwayStates, ready) {
  const identity = pathwayIdentity(pathway.id);
  const state = normalizedPathwayState(pathway.id, pathwayStates);
  const unavailable = !state.available;
  const status = unavailable ? 'unavailable' : state.mastered ? 'mastered' : state.needsPractice ? 'needs-practice' : 'in-progress';
  const statusLabel = unavailable ? 'Not yet available for this unit' : state.mastered ? 'Mastered' : state.needsPractice ? 'Needs practice' : `Current: ${PATHWAY_STAGES.find(stage => stage.id === state.currentStage)?.label ?? 'Recognise'}`;
  const stages = PATHWAY_STAGES.map(stage => {
    const visualState = unavailable ? 'locked' : stageVisualState(stage.id,state);
    const marker = visualState === 'complete' ? '✓' : visualState === 'current' ? '●' : '○';
    return `<span class="vocab-pathway-stage" data-pathway-stage="${stage.id}" data-state="${visualState}"><i aria-hidden="true">${marker}</i><small>${escapeHtml(stage.label)}</small></span>`;
  }).join('');
  const coverage = !unavailable && state.coverageCount != null && state.totalCount != null && state.coverageCount < state.totalCount
    ? `<span class="vocab-pathway-card__coverage">${escapeHtml(state.coverageCount)} of ${escapeHtml(state.totalCount)} words available</span>`
    : '';
  const disabled = ready && !unavailable ? '' : ' disabled aria-disabled="true"';
  const evidenceShell = unavailable ? '' : pathwayEvidence(state);
  const cta = unavailable ? '' : `${state.mastered ? 'Review pathway' : 'Continue pathway'} →`;
  return `<button type="button" class="vocab-pathway-card has-study-art study-enter" data-action="open-pathway" data-pathway="${pathway.id}" data-pathway-status="${status}" data-study-accent="${escapeHtml(identity.accent)}"${disabled}><span class="vocab-pathway-card__identity"><span class="vocab-pathway-card__icon">${renderStudyIcon(identity.icon,{className:'study-icon--lg'})}</span><span class="vocab-pathway-card__head"><strong>${escapeHtml(identity.label)}</strong><small>${escapeHtml(identity.purpose)}</small></span></span><span class="vocab-pathway-card__status">${escapeHtml(statusLabel)}</span>${coverage}${evidenceShell}<span class="vocab-pathway-ladder" aria-label="${escapeHtml(pathway.label)} progression">${stages}</span><span class="vocab-pathway-card__cta">${escapeHtml(cta)}</span>${pathwayArtSlot(pathway.id)}</button>`;
}

// "How do you want to practise?" sheet. `options` come from pathwayPracticeOptions(); locked ones stay visible with the reason, never hidden.
export function renderPracticeSheet({ pathwayId, options = [], lastFamilyId = null } = {}) {
  const identity = pathwayIdentity(pathwayId);
  const lastUsable = options.find(option => option.family.id === lastFamilyId && option.status !== 'locked');
  const items = options.map(option => {
    const { family, status, hint } = option;
    const locked = status === 'locked';
    const isLast = lastUsable && lastUsable.family.id === family.id;
    const note = hint ? `<span class="vocab-sheet-option__note">${escapeHtml(hint)}</span>` : '';
    const last = isLast ? '<span class="vocab-sheet-option__last">Last time</span>' : '';
    const marker = locked ? renderStudyIcon('lock',{ className:'study-icon' }) : renderStudyIcon('arrow',{ className:'study-icon' });
    return `<li><button type="button" class="vocab-sheet-option${locked ? ' is-locked' : ''}${isLast ? ' is-last' : ''}" data-action="start-practice-choice" data-pathway="${escapeHtml(pathwayId)}" data-family="${escapeHtml(family.id)}"${locked ? ' disabled aria-disabled="true"' : ''}${isLast ? ' data-autofocus' : ''}><span class="vocab-sheet-option__text"><strong>${escapeHtml(family.label)}</strong><small>${escapeHtml(family.description)}</small>${note}</span>${last}<span class="vocab-sheet-option__go" aria-hidden="true">${marker}</span></button></li>`;
  }).join('');
  return `<div class="vocab-sheet-backdrop" data-practice-sheet-backdrop data-pathway="${escapeHtml(pathwayId)}"><section class="vocab-sheet" role="dialog" aria-modal="true" aria-labelledby="vocabSheetTitle" data-practice-sheet data-study-accent="${escapeHtml(identity.accent)}"><header class="vocab-sheet__head"><span class="vocab-sheet__icon">${renderStudyIcon(identity.icon,{ className:'study-icon--lg' })}</span><div><p class="vocab-kicker">${escapeHtml(identity.label)}</p><h2 id="vocabSheetTitle">How do you want to practise?</h2></div><button type="button" class="vocab-sheet__close" data-action="close-practice-sheet" aria-label="Close">${renderStudyIcon('close',{ className:'study-icon' })}</button></header><button type="button" class="vocab-sheet-option vocab-sheet-option--recommended" data-action="start-recommended" data-pathway="${escapeHtml(pathwayId)}"${lastUsable ? '' : ' data-autofocus'}><span class="vocab-sheet-option__text"><strong>Recommended</strong><small>Pick up where you are, with a balanced mix for this stage</small></span><span class="vocab-sheet-option__go" aria-hidden="true">${renderStudyIcon('arrow',{ className:'study-icon' })}</span></button><p class="vocab-sheet__or">Or choose one activity</p><ul class="vocab-sheet__list">${items}</ul></section></div>`;
}

export function renderVocabularyUnit(root, { unitNumber, unitTitle, progress, pathwayStates = {}, contentReady = true } = {}) {
  const p = progress ?? { mastered:0, total:50, needsAnotherLook:0, reviewDue:0, stages:{} };
  const ready = contentReady !== false;
  const pathwayCards = VOCABULARY_PATHWAYS.map(pathway => renderPathwayCard(pathway,pathwayStates,ready)).join('');
  const mixedDisabled = ready ? '' : ' disabled aria-disabled="true"';
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><button class="vocab-back" data-action="back-units">← All units</button><span>Unit ${escapeHtml(unitNumber)}</span></header><section class="${unitHeroClass(unitNumber)}"><p class="vocab-kicker">Unit ${escapeHtml(unitNumber)}</p><h1>${escapeHtml(unitTitle)}</h1><div class="vocab-progress-row"><strong>${escapeHtml(p.mastered)} / ${escapeHtml(p.total)} overall mastered</strong><span>${escapeHtml(p.needsAnotherLook)} need another look</span><span>${escapeHtml(p.reviewDue)} ready for review</span></div>${renderStudyProgress(p.mastered,p.total,'Overall unit mastery')}${renderLearningProgress(p.stages)}${unitHeroArt(unitNumber)}</section><section class="vocab-pathways"><div class="vocab-pathways__head"><p class="vocab-kicker">Build mastery step by step</p><h2>Choose a vocabulary pathway</h2><p>Work upwards through Recognise → Match → Apply → Recall → Mastery. Completed stages stay available for review.</p></div><div class="vocab-pathway-grid">${pathwayCards}</div></section><section class="vocab-route-grid vocab-route-grid--review"><article class="vocab-route-card vocab-route-card--mixed"><p class="vocab-kicker">Review only</p><h2>Mixed Practice</h2><p>Review activities you have already unlocked across the six pathways. Mixed Practice does not skip you ahead.</p><button class="vocab-button" data-action="start-mixed-review"${mixedDisabled}>Start Mixed Practice</button><p class="vocab-kicker">Or beat the clock</p><div class="vocab-time-grid" role="group" aria-label="Timed Mixed Practice">${[5,10,15,20].map(minutes => `<button class="vocab-button" data-action="start-mixed-review" data-minutes="${minutes}"${mixedDisabled}>${minutes} min</button>`).join('')}</div></article></section><button class="vocab-link" data-action="view-all-words"${ready ? '' : ' disabled aria-disabled="true"'}>View all 50 words</button></main>`;
}

export function renderVocabularyWords(root, { unitNumber, unitTitle, words = [] } = {}) {
  const rows = words.map(word => {
    const stage = word.learningStage ?? deriveLearningStage(word.mastery ?? { status:word.status ?? 'new' });
    const pathways = VOCABULARY_PATHWAYS.map(pathway => {
      const identity = pathwayIdentity(pathway.id);
      const state = word.pathways?.[pathway.id] ?? { currentStage:'recognise', needsPractice:false, mastered:false };
      const stageLabel = PATHWAY_STAGES.find(item => item.id === state.currentStage)?.label ?? 'Recognise';
      const visibleStage = state.mastered === true ? 'Mastery' : stageLabel;
      const support = state.needsPractice === true ? '<em>Needs practice</em>' : '';
      const masteryIcon = state.mastered === true ? renderStudyIcon('check',{className:'vocab-word-pathway__mastery'}) : '';
      return `<span class="vocab-word-pathway" data-word-pathway="${escapeHtml(pathway.id)}" data-stage="${escapeHtml(state.currentStage ?? 'recognise')}" data-study-accent="${escapeHtml(identity.accent)}"><small>${renderStudyIcon(identity.icon)}${escapeHtml(pathway.label)}</small><strong>${masteryIcon}${escapeHtml(visibleStage)}</strong>${support}</span>`;
    }).join('');
    const partOfSpeech = String(word.partOfSpeech ?? '').trim();
    const definition = String(word.definition ?? '').trim();
    const contextSentence = String(word.contextSentence ?? '').trim();
    const posHtml = partOfSpeech ? `<em class="vocab-dictionary-entry__pos">${escapeHtml(partOfSpeech)}</em>` : '';
    const definitionHtml = definition ? `<p class="vocab-dictionary-entry__definition">${escapeHtml(definition)}</p>` : '';
    const contextHtml = contextSentence ? `<div class="vocab-dictionary-entry__context"><span>In context</span><p>${escapeHtml(contextSentence)}</p></div>` : '';
    const dictionaryEntry = `<div class="vocab-dictionary-entry"><div class="vocab-dictionary-entry__heading"><strong class="vocab-dictionary-entry__term">${escapeHtml(word.term)}</strong>${posHtml}</div>${definitionHtml}${contextHtml}</div>`;
    return `<article class="vocab-word-row study-enter"><div class="vocab-word-row__head">${dictionaryEntry}<span class="vocab-state-pill" data-state="${escapeHtml(stage)}">${stage === 'mastered' ? renderStudyIcon('check') : ''}${escapeHtml(learningStageLabel(stage))}</span></div><div class="vocab-word-pathways" aria-label="${escapeHtml(word.term)} pathway progress">${pathways}</div></article>`;
  }).join('') || `<div class="vocab-empty study-milestone-card" data-study-empty>${renderStudyIcon('spark',{className:'study-icon--xl'})}<strong>No live words are available in this unit yet.</strong></div>`;
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><button class="vocab-back" data-action="back-unit">← Unit ${escapeHtml(unitNumber)}</button><span>Vocabulary detail</span></header><section class="${unitHeroClass(unitNumber)}"><p class="vocab-kicker">Unit ${escapeHtml(unitNumber)}</p><h1>All 50 words</h1><p>${escapeHtml(unitTitle)}</p><p class="vocab-detail-note">Each word progresses independently through six pathways: Recognise → Match → Apply → Recall → Mastery.</p>${unitHeroArt(unitNumber)}</section><section class="vocab-word-list">${rows}</section></main>`;
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

function matchOptions(question, support) {
  if (support?.kind === 'narrow_match') return support.options ?? [];
  if (Array.isArray(question?.matchOptions) && question.matchOptions.length) return question.matchOptions;
  return [];
}
function renderSelectOptions(options) {
  return `<option value="">Choose…</option>${(options ?? []).map(option => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join('')}`;
}
function renderMatchCards(question, retry, support) {
  const options = matchOptions(question,support);
  const cards = options.map(option => `<button type="button" class="vocab-match-card" data-match-card="${escapeHtml(option)}" aria-pressed="false">${escapeHtml(option)}</button>`).join('');
  return `<fieldset class="vocab-match-card-fieldset${retry ? ' is-retry' : ''}"><legend>${retry ? 'Choose from these two' : 'Choose the match'}</legend><div class="vocab-match-cue">${escapeHtml(question?.matchCue ?? '')}</div><div class="vocab-match-card-grid">${cards}</div><input type="hidden" name="answer" required><button class="vocab-button vocab-button--primary" type="submit">${retry ? 'Try again' : 'Check answer'} ${renderStudyIcon('arrow')}</button></fieldset>`;
}

function renderAnswerControl(question, feedback, retry, support, matchView = null) {
  // Meaning → Match: one visible set of pairs. Finished (all correct, or answers shown after the supported retry) keeps the
  // set on screen, read-only, above Next. The set never renders a dropdown, a drop zone or chips.
  if (matchView?.set) {
    const done = Boolean(feedback?.correct) || support?.action === 'move_on';
    const set = renderMatchSet(matchView.set, matchView.state, { retry, finished:Boolean(feedback?.correct), reveal:!feedback?.correct && support?.action === 'move_on' });
    return done ? `${set}<button type="button" class="vocab-button vocab-button--primary" data-action="next-question">Next question ${renderStudyIcon('arrow')}</button>` : set;
  }
  if (feedback?.correct || support?.action === 'move_on') return `<button type="button" class="vocab-button vocab-button--primary" data-action="next-question">Next question ${renderStudyIcon('arrow')}</button>`;
  const responseMode = question?.responseMode ?? 'text';
  if (responseMode === 'choice') {
    const source = support?.kind === 'narrow_choices' ? support.options : question.options;
    const options = (source ?? []).map((option,index) => `<button type="button" class="vocab-choice vocab-choice-card" data-choice-answer="${escapeHtml(option)}"><span class="vocab-choice-card__key" aria-hidden="true">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(option)}</span></button>`).join('');
    return `<fieldset class="vocab-choice-fieldset${retry ? ' is-retry' : ''}"><legend>${retry ? 'Choose from these two' : 'Choose your answer'}</legend><div class="vocab-choice-grid">${options}</div></fieldset>`;
  }
  if (responseMode === 'matching') {
    // Meaning → Match is only ever the two-sided set above; it has no single-card fallback.
    if (question?.type === 'word_definition_match') throw new Error('Meaning Match needs its set of curated pairs.');
    // Other Stage 2 matches render Match Cards. There is no select, chip or drop-zone fallback for matching.
    const normalizedMatch = String(question?.matchCue ?? '').trim() && Array.isArray(question?.matchOptions) && question.matchOptions.length;
    if (normalizedMatch) return renderMatchCards(question,retry,support);
    throw new Error('This matching activity is missing its match cue.');
  }
  if (responseMode === 'drag_gap') {
    // Tap-to-fill: tap a word and it fills the gap in the sentence. No drop zone, no dropdown, no dragging. The answer is still one word
    // in the hidden `answer` field, so marking, evidence and saving are exactly as before. Check stays disabled until a word is chosen.
    const options = support?.kind === 'narrow_drag_gap' ? support.options : (question.draggables ?? question.wordBank ?? []);
    const chips = (options ?? []).map(option => `<button type="button" class="vocab-gap-chip" data-gap-choice="${escapeHtml(option)}" aria-pressed="false">${escapeHtml(option)}</button>`).join('');
    return `<fieldset class="vocab-drag-gap${retry ? ' is-retry' : ''}" data-gap-fill><legend>${retry ? 'Try the gap again' : 'Drag a word into the gap'}</legend><p class="vocab-gap-hint">Drag a word card onto the gap in the sentence. (Keyboard: focus a word and press Enter.)</p><div class="vocab-gap-bank">${chips}</div><input type="hidden" name="answer" value=""><button class="vocab-button vocab-button--primary" type="submit" data-gap-submit disabled aria-disabled="true">${retry ? 'Check supported answer' : 'Check answer'}</button></fieldset>`;
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
    return `${fixedHtml}<div class="vocab-tile-bank">${tiles}</div><input type="hidden" name="answer" value="${escapeHtml(fixedAnswer)}"><div class="vocab-answer-actions"><button type="button" class="vocab-button" data-action="clear-tile-answer" data-fixed-answer="${escapeHtml(fixedAnswer)}">Clear answer</button><button class="vocab-button vocab-button--primary" type="submit">${retry ? 'Check supported answer' : 'Check answer'}</button></div>${question.type === 'spelling_rebuild' ? '<p class="vocab-inline-validation" data-tile-validation role="alert"></p>' : ''}`;
  }
  if (responseMode === 'evidence') {
    const source = support?.kind === 'narrow_evidence' ? support.options : question.evidenceOptions;
    const options = (source ?? []).map(option => `<button type="button" class="vocab-evidence-option" data-evidence-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join('');
    return `<fieldset class="vocab-choice-fieldset${retry ? ' is-retry' : ''}"><legend>${retry ? 'Look again and choose' : 'Select the evidence'}</legend><div class="vocab-evidence-grid">${options}</div></fieldset>`;
  }
  return `<label>${retry ? 'Try your answer again' : 'Your answer'}<input name="answer" required autocomplete="off" maxlength="500" aria-describedby="vocab-support-hint"></label><button class="vocab-button vocab-button--primary" type="submit">${retry ? 'Check supported answer' : 'Check answer'}</button>`;
}

function renderPathwaySessionProgress(pathwayId, pathwayStage) {
  const pathway = VOCABULARY_PATHWAYS.find(candidate => candidate.id === pathwayId);
  const stageIndex = PATHWAY_STAGES.findIndex(candidate => candidate.id === pathwayStage);
  if (!pathway || stageIndex < 0) return '';
  const identity = pathwayIdentity(pathway.id);
  const position = stageIndex + 1;
  const stageLabel = PATHWAY_STAGES[stageIndex].label;
  const progress = position * 20;
  return `<div class="vocab-pathway-session-progress" data-pathway-session-progress="${escapeHtml(pathway.id)}" data-pathway-stage="${escapeHtml(pathwayStage)}" data-study-accent="${escapeHtml(identity.accent)}"><div class="vocab-pathway-session-progress__copy"><span class="vocab-pathway-session-progress__identity">${renderStudyIcon(identity.icon)}<strong>${escapeHtml(pathway.label)}</strong></span><span>${escapeHtml(stageLabel)} · Stage ${position} of 5</span></div><div class="vocab-pathway-progress" role="progressbar" aria-label="${escapeHtml(pathway.label)} pathway progress: ${escapeHtml(stageLabel)}, stage ${position} of 5" aria-valuemin="1" aria-valuemax="5" aria-valuenow="${position}"><span class="vocab-pathway-progress__fill" style="--pathway-progress:${progress}%"></span></div></div>`;
}

const PARAPHRASE_TYPES = new Set(['phrase_match','build_paraphrase','complete_paraphrase','rewrite_phrase','rewrite_idea','improve_vocabulary','explain_another_way','same_idea','build_same_idea','spot_meaning_change']);
const RECALL_TYPES = new Set(['type_missing_word','spell_word','spell_in_context','type_word_from_definition','spelling_rebuild']);
export function questionLook(question) {
  const type = String(question?.type ?? '');
  if (/word_famil/.test(type)) return 'family';
  if (PARAPHRASE_TYPES.has(type)) return 'paraphrase';
  if (RECALL_TYPES.has(type) || question?.responseMode === 'spelling') return 'recall';
  if (question?.responseMode === 'choice') return 'choose';
  return 'other';
}

let lastQuestionKey = null;
function isFreshQuestion(question, term) {
  const key = [question?.type, question?.prompt, question?.sourceText, question?.sourceIdea, question?.sourcePhrase, term].join('|');
  const fresh = key !== lastQuestionKey;
  lastQuestionKey = key;
  return fresh;
}

export function renderVocabularyQuestion(root, { unitNumber, unitTitle, question, term, sessionLabel, learningStage = null, pathwayId = null, pathwayStage = null, sessionPosition = null, sessionTotal = 10, feedback = null, retry = false, support = null, milestone = null, matchSet = null, matchState = null } = {}) {
  const matchView = matchSet && matchState ? { set:matchSet, state:matchState } : null;
  const fixedPathwayId = pathwayId ?? question?.pathwayId ?? null;
  const fixedPathwayStage = pathwayStage ?? question?.pathwayStage ?? null;
  const identity = pathwayIdentity(fixedPathwayId);
  const feedbackState = feedback?.correct ? 'correct' : feedback ? 'retry' : null;
  const feedbackHtml = feedback ? `<div class="vocab-feedback study-feedback ${feedback.correct ? 'is-positive study-success' : 'is-supportive study-error'}" data-study-feedback="${feedbackState}">${renderStudyIcon(feedback.correct ? 'check' : 'spark',{className:'study-icon--lg'})}<div><strong>${escapeHtml(feedback.message)}</strong>${feedback.momentum ? `<span class="study-momentum" data-study-momentum>${renderStudyIcon('spark')}${escapeHtml(feedback.momentum)}</span>` : ''}${feedback.detail ? `<p>${escapeHtml(feedback.detail)}</p>` : ''}</div></div>` : '';
  const supportText = matchView ? '' : supportMessage(support);
  const supportHtml = supportText ? `<div id="vocab-support-hint" class="vocab-support-hint study-feedback" data-study-support>${renderStudyIcon('bulb')}<span>${escapeHtml(supportText)}</span></div>` : '';
  const definition = activityDefinition(question?.type);
  const questionLabel = definition?.label ?? titleCase(question?.type ?? 'Practice');
  const source = visibleQuestionSource(question);
  const matchCue = String(question?.matchCue ?? '').trim();
  const sourceDuplicatesMatchCue = source && matchCue && normalizedDisplayText(source.text) === normalizedDisplayText(matchCue);
  const sourceHtml = question?.responseMode === 'drag_gap' && source && /_{2,}/.test(source.text)
    ? source.text.replace(/^([\s\S]*?)(_{2,})([\s\S]*)$/, (_, before, gap, after) => `${escapeHtml(before)}<span class="vocab-gap-slot" data-gap-slot aria-label="Gap in the sentence">${escapeHtml(gap)}</span>${escapeHtml(after)}`)
    : (source ? escapeHtml(source.text) : '');
  const questionContext = source && !sourceDuplicatesMatchCue ? `<aside class="vocab-question-context vocab-source-text"><span>${escapeHtml(source.label)}</span><p>${sourceHtml}</p></aside>` : '';
  const targetPill = term && !matchView && !HIDE_TARGET_TYPES.has(question?.type) ? `<div class="vocab-target-pill">${escapeHtml(term)}</div>` : '';
  const pathwayProgress = renderPathwaySessionProgress(fixedPathwayId,fixedPathwayStage);
  const stage = learningStage ?? question?.learningStage ?? null;
  const stageCue = !pathwayProgress && LEARNING_STAGES.includes(stage) ? `<span class="vocab-learning-stage" data-stage="${escapeHtml(stage)}"><strong>${escapeHtml(learningStageLabel(stage))}</strong><small>${learningStagePosition(stage)} of 5</small></span>` : '';
  const skillCue = pathwayProgress || `<span>${escapeHtml(definition?.skillFamily ? titleCase(definition.skillFamily) : '')}</span>${stageCue}`;
  const safeTotal = Math.max(1,Number(sessionTotal) || 10);
  const safePosition = Number.isFinite(Number(sessionPosition)) ? Math.max(1,Math.min(safeTotal,Number(sessionPosition))) : 1;
  const sessionProgress = `<div class="vocab-question-session-progress" data-study-session-progress data-study-accent="${escapeHtml(identity.accent)}"><span>${safePosition} / ${safeTotal}</span>${renderStudyProgress(safePosition,safeTotal,`Question ${safePosition} of ${safeTotal}`)}</div>`;
  const answerForm = `<form data-form="vocabulary-answer" class="vocab-answer-form">${renderAnswerControl(question, feedback, retry, support, matchView)}</form>`;
  const responseArea = retry && !feedback?.correct
    ? `<section class="vocab-retry-stage study-enter">${feedbackHtml}${supportHtml}${answerForm}</section>`
    : `<section class="vocab-response-stage${feedback?.correct ? ' is-correct' : ''}">${feedbackHtml}${supportHtml}${answerForm}</section>`;
  const milestoneHtml = milestone ? `<section class="study-milestone-card study-milestone" data-study-milestone="${escapeHtml(milestone.kind)}">${milestoneArt(milestone.kind)}<strong>${escapeHtml(milestone.title ?? '')}</strong></section>` : '';
  root.innerHTML = `<main class="vocab-shell vocab-shell--session" data-study-accent="${escapeHtml(identity.accent)}"><header class="vocab-topbar"><button class="vocab-back" data-action="leave-session">← Unit ${escapeHtml(unitNumber)}</button><span>${escapeHtml(sessionLabel ?? '')}</span></header><section class="vocab-question-card study-enter" data-study-question data-question-look="${questionLook(question)}"${isFreshQuestion(question,term) ? ' data-question-fresh' : ''}><div class="vocab-study-question-header"><div class="vocab-study-question-header__path">${renderStudyIcon(identity.icon,{className:'study-icon--lg'})}<div><strong>${escapeHtml(identity.label)}</strong><small>${escapeHtml(PATHWAY_STAGES.find(item => item.id === fixedPathwayStage)?.label ?? questionLabel)}</small></div></div>${sessionProgress}</div><div class="vocab-question-meta"><p class="vocab-kicker">${escapeHtml(questionLabel)}</p><div class="vocab-question-meta__right">${skillCue}</div></div>${targetPill}<h1 class="vocab-question-prompt">${escapeHtml(matchView ? 'Match each word with its definition.' : displayPrompt(question))}</h1>${questionContext}${responseArea}${milestoneHtml}</section><p class="vocab-session-unit">Unit ${escapeHtml(unitNumber)} — ${escapeHtml(unitTitle)}</p></main>`;
}

// Controlled variety for correct answers: the explanation stays exactly as before, only the short lead changes. `variant` is any
// integer (the app passes a per-question number); without it the lead is the plain "Correct".
const CORRECT_LEADS = Object.freeze(['Correct','Nice work','Exactly','Strong choice','That’s it','Nailed it']);
export function supportiveFeedback({ correct, misconceptionCategory, recovery, term, meaning, questionType, variant = null } = {}) {
  const lead = correct && Number.isInteger(variant) ? CORRECT_LEADS[Math.abs(variant) % CORRECT_LEADS.length] : 'Correct';
  const word = term ? `“${term}”` : 'the language';
  const clearMeaning = String(meaning ?? '').trim();
  if (correct && recovery) return 'Good recovery — you kept the meaning accurately this time.';
  if (correct && questionType === 'meaning_match' && clearMeaning) return `${lead} — ${word} means ${clearMeaning} here.`;
  if (correct && ['phrase_match','build_paraphrase','complete_paraphrase','rewrite_phrase'].includes(questionType)) return `${lead} — that version keeps the phrase meaning.`;
  if (correct && ['same_idea','build_same_idea','rewrite_idea','spot_meaning_change'].includes(questionType)) return `${lead} — you tracked the whole idea accurately.`;
  if (correct && ['question_text_bridge','find_evidence'].includes(questionType)) return `${lead} — that wording points to the same information in the text.`;
  if (correct) return `${lead} — that answer fits the meaning and context.`;
  const messages = {
    quantity_change:'Not quite — the quantity changed. Keep words such as some, many, most and all precise.',
    degree_change:'Not quite — the strength or certainty changed. Keep the original degree of meaning.',
    time_change:'Not quite — the timing changed. Keep the original time relationship.',
    cause_effect_change:'Not quite — the cause and result relationship changed.',
    contrast_change:'Not quite — the relationship between the ideas changed.',
    added_information:'Not quite — that version adds information that was not in the original.',
    omitted_information:'Not quite — an important part of the original meaning has disappeared.',
    unnatural_collocation:'The idea is close, but that word combination is not natural English.',
    too_vague:'The idea is related, but the wording is too vague to keep the meaning precisely here.',
    register_mismatch:'The meaning is close, but the register does not fit this context.',
    related_but_inaccurate:'Close — the meaning is related, but it is not precise enough here.',
    wrong_form:'Right idea — check the word form.'
  };
  if (messages[misconceptionCategory]) return `${messages[misconceptionCategory]} Try once more with support.`;
  if (clearMeaning && questionType === 'meaning_match') return `Not quite. Here, ${word} means ${clearMeaning}. Try once more with support.`;
  return 'Not quite. Check the meaning carefully and try once more with support.';
}

function renderCompletionRing(score, total) {
  const fraction = total > 0 ? Math.max(0, Math.min(1, score / total)) : 0;
  const circumference = 2 * Math.PI * 54;
  const offset = (circumference * (1 - fraction)).toFixed(2);
  return `<svg class="vocab-finish-ring" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><circle class="vocab-finish-ring__track" cx="60" cy="60" r="54"/><circle class="vocab-finish-ring__fill" cx="60" cy="60" r="54" style="--ring-circumference:${circumference.toFixed(2)};--ring-offset:${offset}"/></svg>`;
}

function renderFinishStars(stars) {
  const count = Number(stars);
  if (!Number.isFinite(count) || count <= 0) return '';
  const glyphs = Array.from({ length:count },() => '<span aria-hidden="true">★</span>').join('');
  return `<div class="vocab-finish-stars" aria-label="${count} out of 3 stars earned">${glyphs}</div>`;
}

function renderFinishLadder(model = {}) {
  const completed = new Set(Array.isArray(model.completedStages) ? model.completedStages : []);
  const activeStage = model.variant === 'stage-complete' ? model.nextStageId : model.stageId;
  return PATHWAY_STAGES.map(stage => {
    let state = 'locked';
    if (model.variant === 'mastered' || completed.has(stage.id) || (model.variant === 'stage-complete' && stage.id === model.stageId)) state = 'complete';
    else if (stage.id === activeStage) state = 'current';
    const marker = state === 'complete' ? '✓' : state === 'current' ? '●' : '○';
    return `<span class="vocab-finish-stage" data-state="${state}" data-stage="${escapeHtml(stage.id)}"><i aria-hidden="true">${marker}</i><small>${escapeHtml(stage.label)}</small></span>`;
  }).join('');
}

export function renderSessionSummary(root, { durationMinutes = null, summary = {}, practiceMode = 'adaptive', nextPractice = null, pathwayId = null, finishModel = null } = {}) {
  if (finishModel && pathwayId) {
    const identity = pathwayIdentity(pathwayId);
    const score = Number(finishModel.score ?? summary.strengthened ?? 0);
    const denominator = Number(finishModel.denominator ?? summary.practised ?? 0);
    const needsAnotherLook = Number(finishModel.needsAnotherLook ?? summary.needsAnotherLook ?? 0);
    const stars = renderFinishStars(finishModel.stars);
    const context = finishModel.pathwayLabel && finishModel.stageLabel
      ? `<div class="vocab-finish-context"><strong>${escapeHtml(finishModel.pathwayLabel)} · ${escapeHtml(finishModel.stageLabel)}</strong><span>Stage ${escapeHtml(finishModel.stageNumber)} of ${PATHWAY_STAGES.length}</span></div>`
      : '';
    const unlock = finishModel.variant === 'stage-complete'
      ? `<div class="vocab-finish-unlock"><span>${escapeHtml(finishModel.kicker)}</span><strong>${escapeHtml(String(finishModel.nextStageLabel ?? '').toUpperCase())} UNLOCKED</strong></div>`
      : finishModel.variant === 'mastered'
        ? `<div class="vocab-finish-unlock vocab-finish-unlock--mastered"><strong>All five stages complete</strong></div>`
        : '';
    const primary = finishModel.primaryAction
      ? `<button class="vocab-button vocab-button--primary" data-action="continue-practice">${escapeHtml(finishModel.primaryAction.label)} ${renderStudyIcon('arrow')}</button>`
      : '';
    root.innerHTML = `<main class="vocab-shell vocab-shell--finish" data-study-accent="${escapeHtml(identity.accent)}"><article class="vocab-summary-card vocab-finish-card study-milestone-card" data-study-completion data-completion-sequence="done" data-finish-variant="${escapeHtml(finishModel.variant)}" aria-label="${escapeHtml(finishModel.accessibleSummary ?? '')}">${completionArt(finishModel.variant === 'mastered' ? 'mastered' : finishModel.variant === 'stage-complete' ? 'stage_advanced' : 'completion')}<div class="vocab-summary-identity">${renderStudyIcon(identity.icon,{className:'study-icon--xl'})}<p class="vocab-kicker">${escapeHtml(finishModel.variant === 'session' ? 'SESSION COMPLETE' : finishModel.kicker)}</p></div><h1 data-session-finish-heading tabindex="-1">${escapeHtml(finishModel.heading)}</h1>${stars}<div class="vocab-finish-score" data-completion-score data-score="${escapeHtml(score)}" data-total="${escapeHtml(denominator)}">${renderCompletionRing(score,denominator)}<div class="vocab-finish-score__text"><strong><span data-count-up>${escapeHtml(score)}</span> / ${escapeHtml(denominator)}</strong><span>correct</span></div></div><p class="vocab-finish-support">${escapeHtml(finishModel.supportCopy)}</p><div class="vocab-finish-evidence"><div><strong>${escapeHtml(score)}</strong><span>words strengthened</span></div><div><strong>${escapeHtml(needsAnotherLook)}</strong><span>need another look</span></div></div>${context}<div class="vocab-finish-ladder" aria-label="${escapeHtml(finishModel.pathwayLabel)} pathway stages">${renderFinishLadder(finishModel)}</div>${unlock}<button type="button" class="vocab-completion-skip" data-action="skip-animation" hidden>Skip animation</button><div class="vocab-summary-actions vocab-finish-actions">${primary}${pathwayId ? `<button class="vocab-button" data-action="choose-practice" data-pathway="${escapeHtml(pathwayId)}">Try another activity</button>` : ''}<button class="vocab-button" data-action="back-unit">Finish for now</button></div></article></main>`;
    return;
  }

  const selected = focusDefinition(practiceMode);
  const identity = pathwayIdentity(pathwayId);
  const practised = Number(summary.practised ?? 0);
  const title = durationMinutes ? `${durationMinutes}-minute session complete` : `${selected.label} session complete`;
  const next = nextPractice ? `<p class="vocab-next-practice"><strong>Next useful practice:</strong> ${escapeHtml(focusDefinition(nextPractice).label)}</p>` : '';
  const mastered = Number(summary.mastered ?? 0);
  const masteredCard = mastered > 0 ? `<div><strong>${escapeHtml(mastered)}</strong><span>mastered</span></div>` : '';
  // Same slot size for every summary; only the ten-activity (untimed) completion gets the celebratory rays.
  const celebration = completionArt('completion', { rays:!durationMinutes && practised >= 10 });
  root.innerHTML = `<main class="vocab-shell" data-study-accent="${escapeHtml(identity.accent)}"><section class="vocab-summary-card study-milestone-card" data-study-completion>${celebration}<div class="vocab-summary-identity">${renderStudyIcon(identity.icon,{className:'study-icon--xl'})}<p class="vocab-kicker">Progress made</p></div><h1>${practised >= 10 ? 'Great work!' : escapeHtml(title)}</h1><p class="vocab-summary-subtitle">${escapeHtml(title)}</p><div class="vocab-summary-grid"><div><strong>${escapeHtml(practised)}</strong><span>activities completed</span></div><div><strong>${escapeHtml(summary.strengthened ?? 0)}</strong><span>successful activities</span></div>${masteredCard}<div><strong>${escapeHtml(summary.secure ?? 0)}</strong><span>moved to Secure</span></div></div><p>${escapeHtml(summary.needsAnotherLook ?? 0)} still need another look. They will return in a different form.</p>${next}<div class="vocab-summary-actions"><button class="vocab-button vocab-button--primary" data-action="continue-practice">Continue practising ${renderStudyIcon('arrow')}</button><button class="vocab-button" data-action="back-unit">Back to unit</button></div></section></main>`;
}

export function renderVocabularyError(root, message) {
  root.innerHTML = `<main class="vocab-shell"><section class="vocab-summary-card study-milestone-card" data-study-error-state>${renderStudyIcon('spark',{className:'study-icon--xl'})}<h1>Unable to continue</h1><p>${escapeHtml(message)}</p><a class="vocab-button" href="./">Back to Hub</a></section></main>`;
}