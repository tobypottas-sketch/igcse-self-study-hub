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
  if (row.reason === 'stage_below_minimum') {
    const shortages = row.missing.filter(item => item.kind === 'stage').map(item => {
      const have = Number(item.have ?? row.stageCounts?.[item.stage] ?? 0);
      const need = Number(item.need ?? row.stageMinimums?.[item.stage] ?? 0);
      const gap = Math.max(0, need - have);
      return `${STAGE_LABEL[item.stage] ?? item.stage} needs ${gap} more item${gap === 1 ? '' : 's'}`;
    });
    return shortages.join(' · ') || 'A required stage needs more items';
  }
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
      rawReason:row?.reason ?? null,
      held:row?.held === true,
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

function stageShortages(row) {
  return row.missing.filter(item => item.kind === 'stage').map(item => {
    const have = Math.max(0, Number(item.have ?? 0));
    const need = Math.max(0, Number(item.need ?? 0));
    return { stage:STAGE_LABEL[item.stage] ?? item.stage, have, need, gap:Math.max(0, need - have) };
  }).filter(item => item.gap > 0);
}

// These actions describe how to address the evaluator's real blocking condition;
// they never imply that a fraction is a student score or an activity count.
export function readinessNextSteps(row) {
  if (row.live) return [];
  const shortages = stageShortages(row);
  const steps = shortages.map(item => `Review or add eligible ${item.stage} activities for ${item.gap} more word target${item.gap === 1 ? '' : 's'} (${item.have} of ${item.need} required).`);
  for (const item of row.missing.filter(item => item.kind === 'full_path')) {
    const gap = Math.max(0, Number(item.need ?? 0) - Number(item.have ?? 0));
    if (gap) steps.push(`Make ${gap} more word target${gap === 1 ? '' : 's'} playable through every stage (${item.have} of ${item.need} required). Check the individual stage eligibility below.`);
  }
  for (const item of row.missing.filter(item => item.kind === 'diversity')) {
    const gap = Math.max(0, Number(item.need ?? 0) - Number(item.have ?? 0));
    if (gap) steps.push(`Add or review ${gap} more eligible word target${gap === 1 ? '' : 's'} with ${item.label} (${item.have} of ${item.need} required).`);
  }
  if (row.rawReason === 'editorial_hold' || row.held) steps.unshift('Review the editorial hold in the unit registry. Content counts alone cannot release this pathway.');
  if (row.rawReason === 'required_rung_withheld') steps.unshift('A required stage has no available activity type. Review the pathway activity configuration before publishing.');
  return steps.length ? steps : ['Review the eligibility and publishing rules for this pathway.'];
}

function readinessDetail(row) {
  const stages = `<ul class="vocab-readiness__stages" aria-label="Eligible word targets by stage">${row.stages.map(stage => `<li data-ok="${stage.ok ? 'true' : 'false'}"><span>${escapeHtml(stage.label)}</span><b>${escapeHtml(stage.have)} of ${escapeHtml(stage.need)}</b></li>`).join('')}</ul>`;
  const notes = row.notes.length ? `<ul class="vocab-readiness__notes" aria-label="Reviewed content">${row.notes.map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul>` : '';
  return `<p class="vocab-readiness__audit-explain">These figures count word targets that can generate a valid question at each stage, compared with the minimum needed to publish. They are not student scores.</p>${stages}${notes}`;
}
function readinessRow(row) {
  const steps = readinessNextSteps(row);
  const head = `<strong>${escapeHtml(row.label)}</strong><span class="vocab-pill vocab-readiness__state" data-tone="${row.live ? 'done' : 'warn'}">${row.live ? 'Available to students' : 'Not available yet'}</span>`;
  if (row.live) {
    return `<article class="vocab-readiness__row vocab-readiness__row--ready" data-readiness-pathway="${escapeHtml(row.pathwayId)}" data-live="true"><div class="vocab-readiness__line">${head}</div><details class="vocab-readiness__audit"><summary>View detailed content checks</summary>${readinessDetail(row)}</details></article>`;
  }
  const stage = stageShortages(row)[0];
  const progress = stage ? `<div class="vocab-readiness__progress"><div class="vocab-readiness__progress-label"><strong>${escapeHtml(stage.stage)}: ${escapeHtml(stage.have)} of ${escapeHtml(stage.need)} eligible word targets</strong><span>${escapeHtml(stage.gap)} more needed</span></div><progress max="${Math.max(1, stage.need)}" value="${Math.min(stage.have, stage.need)}">${Math.min(stage.have, stage.need)} of ${stage.need}</progress></div>` : '';
  return `<article class="vocab-readiness__row vocab-readiness__row--blocked" data-readiness-pathway="${escapeHtml(row.pathwayId)}" data-live="false"><div class="vocab-readiness__line">${head}</div><p class="vocab-readiness__reason">${escapeHtml(row.reason)}. Students cannot access this pathway yet.</p>${progress}<div class="vocab-readiness__action"><strong>What needs to happen</strong><ul>${steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ul></div><details class="vocab-readiness__audit"><summary>View detailed content checks</summary>${readinessDetail(row)}</details></article>`;
}

function plannedUnitsText(planned) {
  if (!planned.length) return '';
  const sorted = [...planned].sort((a,b) => a - b);
  const contiguous = sorted.every((value,index) => index === 0 || value === sorted[index - 1] + 1);
  const label = contiguous && sorted.length > 1 ? `${sorted[0]}–${sorted.at(-1)}` : sorted.join(', ');
  return `Units ${label} not yet published.`;
}

export function renderReadinessReport(root, { options = [], selected = null, title = '', report = null } = {}) {
  const planned = Object.keys(UNIT_REGISTRY).map(Number).filter(number => !options.some(option => option.unitNumber === number));
  const blocked = report?.rows.filter(row => !row.live) ?? [];
  const available = report?.rows.filter(row => row.live) ?? [];
  const body = !report
    ? '<p class="vocab-empty-small">No live words have been published yet.</p>'
    : `<p class="vocab-readiness__intro">This checks whether each learning pathway has enough usable content for students. It does not measure student performance.</p>
      <div class="vocab-readiness__metrics" data-readiness-summary>
        <span class="vocab-readiness__metric" data-ok="${report.wordsComplete ? 'true' : 'false'}"><strong>${escapeHtml(report.publishedWords)} of ${escapeHtml(report.expectedWords)}</strong><small>words published</small></span>
        <span class="vocab-readiness__metric" data-ok="${report.live === report.rows.length ? 'true' : 'false'}"><strong>${escapeHtml(report.live)} of ${escapeHtml(report.rows.length)}</strong><small>pathways available</small></span>
        <span class="vocab-readiness__metric" data-ok="${blocked.length === 0 ? 'true' : 'false'}"><strong>${escapeHtml(blocked.length)}</strong><small>pathways needing attention</small></span>
      </div>
      ${!report.wordsComplete ? `<section class="vocab-readiness__notice"><strong>Word publishing is incomplete</strong><p>${escapeHtml(report.publishedWords)} of ${escapeHtml(report.expectedWords)} expected words are published. Review the missing words before considering the unit complete.</p></section>` : ''}
      <section class="vocab-readiness__section" aria-label="Pathways requiring attention">
        <h2>What needs attention</h2>
        ${blocked.length ? `<p class="vocab-readiness__section-note">These pathways are not available to students. The next steps are based on the existing readiness checks.</p><div class="vocab-readiness__table">${blocked.map(readinessRow).join('')}</div>` : '<p class="vocab-readiness__all-ready">All six pathways have enough eligible content and are available to students.</p>'}
      </section>
      <section class="vocab-readiness__section" aria-label="Available learning pathways">
        <h2>Already available</h2>
        ${available.length ? `<p class="vocab-readiness__section-note">These pathways are live. Expand detailed checks only if you need to audit their content.</p><div class="vocab-readiness__table">${available.map(readinessRow).join('')}</div>` : '<p class="vocab-readiness__section-note">No pathways are available yet.</p>'}
      </section>`;
  root.innerHTML = `<main class="vocab-shell vocab-shell--teacher"><header class="vocab-topbar"><button class="vocab-back" data-action="teacher-back-overview">← Back</button><span>Unit readiness</span></header><section class="vocab-teacher-hero vocab-readiness__hero"><p class="vocab-kicker">Content readiness · Teacher authoring</p><h1>${selected ? `Unit ${escapeHtml(selected)}${title ? `: ${escapeHtml(title)}` : ''}` : 'Unit readiness'}</h1>${options.length ? unitChips(options, selected) : ''}</section><section class="vocab-teacher-panel vocab-readiness" data-readiness-report>${body}${planned.length ? `<p class="vocab-empty-small vocab-readiness__planned">${escapeHtml(plannedUnitsText(planned))}</p>` : ''}</section></main>`;
}

export function unitTitleFor(unitNumber) { return unitConfig(unitNumber)?.title ?? ''; }