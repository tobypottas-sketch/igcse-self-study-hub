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
      stages:PATHWAY_STAGES.map(stage => ({ id:stage.id, label:stage.label, have:row?.stageCounts?.[stage.id] ?? 0, need:row?.stageMinimums?.[stage.id] ?? 0, ok:(row?.stageCounts?.[stage.id] ?? 0) >= (row?.stageMinimums?.[stage.id] ?? 0) })),
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

export function renderReadinessReport(root, { options = [], selected = null, title = '', report = null } = {}) {
  const planned = Object.keys(UNIT_REGISTRY).map(Number).filter(number => !options.some(option => option.unitNumber === number));
  const body = !report
    ? '<p class="vocab-empty-small">No live words have been published yet.</p>'
    : `<p class="vocab-readiness__summary" data-readiness-summary><strong>${escapeHtml(report.publishedWords)} of ${escapeHtml(report.expectedWords)} words published</strong>${report.wordsComplete ? '' : ' · the unit is incomplete'} · <strong>${escapeHtml(report.live)} of ${escapeHtml(report.rows.length)} pathways live</strong></p>
      <div class="vocab-readiness__table" role="table" aria-label="Pathway readiness">${report.rows.map(row => `<article class="vocab-readiness__row" role="row" data-readiness-pathway="${escapeHtml(row.pathwayId)}" data-live="${row.live ? 'true' : 'false'}"><header><strong>${escapeHtml(row.label)}</strong><span class="vocab-readiness__state">${row.live ? 'Live' : 'Locked'}</span></header><p>${escapeHtml(row.reason)}</p><ul class="vocab-readiness__stages" aria-label="Words ready per stage">${row.stages.map(stage => `<li data-ok="${stage.ok ? 'true' : 'false'}">${escapeHtml(stage.label)} <b>${escapeHtml(stage.have)}/${escapeHtml(stage.need)}</b></li>`).join('')}</ul></article>`).join('')}</div>`;
  root.innerHTML = `<main class="vocab-shell"><header class="vocab-topbar"><button class="vocab-back" data-action="teacher-back-classes">← Classes</button><span>Unit readiness</span></header><section class="vocab-teacher-hero"><p class="vocab-kicker">Authoring view, not student analytics</p><h1>${selected ? `Unit ${escapeHtml(selected)}${title ? `: ${escapeHtml(title)}` : ''}` : 'Unit readiness'}</h1>${options.length ? unitChips(options, selected) : ''}</section><section class="vocab-teacher-panel vocab-readiness" data-readiness-report>${body}${planned.length ? `<p class="vocab-empty-small">No live words yet: Units ${escapeHtml(planned.join(', '))}.</p>` : ''}</section></main>`;
}

export function unitTitleFor(unitNumber) { return unitConfig(unitNumber)?.title ?? ''; }
