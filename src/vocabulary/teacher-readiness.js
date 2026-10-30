// Teacher readiness report: authoring/admin visibility of which pathways are live for a unit and why. It reads the one canonical
// evaluator's answer; it is not student analytics and it decides nothing itself.
import { escapeHtml } from '../views/html.js';
import { VOCABULARY_PATHWAYS, PATHWAY_STAGES } from './pathway-model.js';
import { unitConfig, UNIT_REGISTRY } from '../../content/vocabulary/unit-registry.js';

const STAGE_LABEL = Object.freeze(Object.fromEntries(PATHWAY_STAGES.map(stage => [stage.id, stage.label])));

export function readinessReasonText(row) {
  if (row.live) return 'Live for students';
  if (row.reason === 'editorial_hold' || row.held) return 'Held back in the unit registry';
  if (row.reason === 'required_rung_withheld') return 'A required stage has no activity type';
  const shortStages = row.missing.filter(item => item.kind === 'stage').map(item => STAGE_LABEL[item.stage]);
  if (row.reason === 'stage_below_minimum') return `Below the word minimum in: ${shortStages.join(', ')}`;
  if (row.reason === 'too_few_full_path_words') { const item = row.missing.find(entry => entry.kind === 'full_path'); return `Only ${item.have} words can run every stage; ${item.need} needed`; }
  if (row.reason === 'diversity_below_minimum') return row.missing.filter(item => item.kind === 'diversity').map(item => `${item.have} ${item.label}; ${item.need} needed`).join('; ');
  return 'Not ready';
}

// Teacher-only detail on reviewed content: what keeps a strict stage short, and how much lenient content is reviewed. Never shown to students.
export function reviewNotes(pathwayId, row, authoring) {
  const notes = [];
  for (const [stageId, review] of Object.entries(row?.stageReview ?? {})) {
    if (review.unreviewed > 0) notes.push(`${STAGE_LABEL[stageId]}: ${review.unreviewed} word${review.unreviewed === 1 ? '' : 's'} still use unreviewed distractors`);
  }
  if (pathwayId === 'context' && authoring) {
    const open = authoring.gapSentences - authoring.gapSentencesReviewed;
    if (open > 0) notes.push(`${open} of ${authoring.gapSentences} gap-fill sentences still use unreviewed distractors`);
    if (authoring.gapMalformed > 0) notes.push(`${authoring.gapMalformed} reviewed gap-fill row${authoring.gapMalformed === 1 ? ' is' : 's are'} malformed and not trusted`);
  }
  if (pathwayId === 'meaning' && authoring) {
    const open = authoring.words - authoring.situationWordsReviewed - authoring.situationWordsMalformed;
    if (open > 0) notes.push(`${open} of ${authoring.words} words have no reviewed wrong situations`);
    if (authoring.situationWordsMalformed > 0) notes.push(`${authoring.situationWordsMalformed} word${authoring.situationWordsMalformed === 1 ? ' has' : 's have'} malformed reviewed situations`);
  }
  if (pathwayId === 'spelling_recall') {
    const stage = row?.stageReview?.recognise;
    if (stage && stage.reviewed + stage.generatedSafe > 0) notes.push(`Spelling choices: ${stage.reviewed} of ${stage.reviewed + stage.generatedSafe} words use reviewed misspellings (the rest use generated ones)`);
  }
  return notes;
}

// One row per pathway, plain data (the view and the release test both use it).
export function buildReadinessReport({ readiness, publishedWords = 0 } = {}) {
  const expectedWords = Number(readiness?.expectedWords ?? 0);
  const rows = VOCABULARY_PATHWAYS.map(pathway => {
    const row = readiness?.pathways?.[pathway.id];
    return {
      pathwayId:pathway.id,
      label:pathway.label,
      live:row?.live === true,
      reason:readinessReasonText(row ?? { live:false, missing:[], reason:null }),
      stages:PATHWAY_STAGES.map(stage => ({ id:stage.id, label:stage.label, have:row?.stageCounts?.[stage.id] ?? 0, need:row?.stageMinimums?.[stage.id] ?? 0, ok:(row?.stageCounts?.[stage.id] ?? 0) >= (row?.stageMinimums?.[stage.id] ?? 0), unreviewed:row?.stageReview?.[stage.id]?.unreviewed ?? 0, reviewed:row?.stageReview?.[stage.id]?.reviewed ?? 0 })),
      notes:reviewNotes(pathway.id, row, readiness?.authoring),
      servedCount:row?.servedCount ?? 0,
      missing:row?.missing ?? []
    };
  });
  const live = rows.filter(row => row.live).length;
  return { expectedWords, publishedWords, wordsComplete:publishedWords >= expectedWords, live, locked:rows.length - live, rows, ready:live === rows.length && publishedWords >= expectedWords };
}

function unitChips(options, selected) {
  return `<nav class="vocab-unit-chips" aria-label="Choose a unit">${options.map(option => `<button type="button" class="vocab-unit-chip" data-action="teacher-readiness-unit" data-unit="${escapeHtml(option.unitNumber)}" aria-pressed="${option.unitNumber === selected ? 'true' : 'false'}">Unit ${escapeHtml(option.unitNumber)}</button>`).join('')}</nav>`;
}

// Healthy pathways collapse to one line; anything locked, short of a stage minimum or carrying review notes opens with its full stage coverage.
function readinessRow(row) {
  const problem = !row.live || row.stages.some(stage => !stage.ok) || row.notes.length > 0;
  const pillTone = row.live ? 'done' : 'warn';
  const stages = `<ul class="vocab-readiness__stages" aria-label="Words ready per stage">${row.stages.map(stage => `<li data-ok="${stage.ok ? 'true' : 'false'}">${escapeHtml(stage.label)} <b>${escapeHtml(stage.have)}/${escapeHtml(stage.need)}</b></li>`).join('')}</ul>`;
  const notes = row.notes.length ? `<ul class="vocab-readiness__notes" aria-label="Reviewed content">${row.notes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul>` : '';
  const head = `<strong>${escapeHtml(row.label)}</strong><span class="vocab-pill vocab-readiness__state" data-tone="${pillTone}">${row.live ? 'Live' : 'Locked'}</span><span class="vocab-readiness__reason">${escapeHtml(row.reason)}</span>`;
  return `<article class="vocab-readiness__row" role="row" data-readiness-pathway="${escapeHtml(row.pathwayId)}" data-live="${row.live ? 'true' : 'false'}" data-expanded="${problem ? 'true' : 'false'}">${problem ? `<details open><summary>${head}</summary>${stages}${notes}</details>` : `<div class="vocab-readiness__line">${head}</div>`}</article>`;
}

export function renderReadinessReport(root, { options = [], selected = null, title = '', report = null } = {}) {
  const planned = Object.keys(UNIT_REGISTRY).map(Number).filter(number => !options.some(option => option.unitNumber === number));
  const body = !report
    ? '<p class="vocab-empty-small">No live words have been published yet.</p>'
    : `<p class="vocab-readiness__summary" data-readiness-summary><strong>${escapeHtml(report.publishedWords)} of ${escapeHtml(report.expectedWords)} words published</strong>${report.wordsComplete ? '' : ' · the unit is incomplete'} · <strong>${escapeHtml(report.live)} of ${escapeHtml(report.rows.length)} pathways live</strong></p>
      <div class="vocab-readiness__table" role="table" aria-label="Pathway readiness">${report.rows.map(readinessRow).join('')}</div>`;
  root.innerHTML = `<main class="vocab-shell vocab-shell--teacher"><header class="vocab-topbar"><button class="vocab-back" data-action="teacher-back-classes">← Classes</button><span>Unit readiness</span></header><section class="vocab-teacher-hero"><p class="vocab-kicker">Authoring view, not student analytics</p><h1>${selected ? `Unit ${escapeHtml(selected)}${title ? `: ${escapeHtml(title)}` : ''}` : 'Unit readiness'}</h1>${options.length ? unitChips(options, selected) : ''}</section><section class="vocab-teacher-panel vocab-readiness" data-readiness-report>${body}${planned.length ? `<p class="vocab-empty-small">No live words yet: Units ${escapeHtml(planned.join(', '))}.</p>` : ''}</section></main>`;
}

export function unitTitleFor(unitNumber) { return unitConfig(unitNumber)?.title ?? ''; }
