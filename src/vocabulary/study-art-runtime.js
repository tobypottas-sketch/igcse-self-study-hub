import { getLatestUnitPathwayStates } from './pathway-view-model.js';

const root = document.getElementById('vocabularyApp');
const STAGE_LABELS = Object.freeze({ recognise:'Recognise', match:'Match', apply:'Apply', recall:'Recall', mastery:'Mastery' });

function evidenceCopy(evidence) {
  const attempts = Number(evidence?.attempts) || 0;
  const clean = Number(evidence?.cleanSuccesses) || 0;
  const prompts = Number(evidence?.distinctPrompts) || 0;
  if (!attempts && !clean && !prompts) return 'No saved evidence yet';
  const parts = [`${attempts} ${attempts === 1 ? 'attempt' : 'attempts'}`, `${clean} clean`];
  if (prompts) parts.push(`${prompts} ${prompts === 1 ? 'prompt' : 'prompts'}`);
  return parts.join(' · ');
}

function currentStageLabel(card) {
  const current = card.querySelector?.('.vocab-pathway-stage[data-state="current"] small');
  const label = String(current?.textContent ?? '').trim();
  return label || 'Recognise';
}

function ensurePathwayEvidenceShell(card) {
  const existing = card.querySelector?.('[data-pathway-evidence-shell]');
  if (existing) return existing;
  const stageLabel = currentStageLabel(card);
  const wrap = document.createElement('span');
  wrap.className = 'vocab-pathway-card__evidence';
  wrap.dataset.pathwayEvidenceShell = 'true';

  const copy = document.createElement('span');
  copy.className = 'vocab-pathway-card__evidence-copy';
  const title = document.createElement('strong');
  title.textContent = `${stageLabel} evidence`;
  const detail = document.createElement('small');
  detail.textContent = 'No saved evidence yet';
  copy.append(title,detail);

  const meter = document.createElement('span');
  meter.className = 'vocab-pathway-card__evidence-meter';
  meter.setAttribute('role','progressbar');
  meter.setAttribute('aria-label',`${stageLabel} evidence progress`);
  meter.setAttribute('aria-valuemin','0');
  meter.setAttribute('aria-valuemax','100');
  meter.setAttribute('aria-valuenow','0');
  const fill = document.createElement('span');
  fill.className = 'vocab-pathway-card__evidence-fill';
  fill.style.setProperty('--pathway-evidence','0%');
  meter.append(fill);
  wrap.append(copy,meter);

  const ladder = card.querySelector?.('.vocab-pathway-ladder');
  if (ladder?.before) ladder.before(wrap); else card.append(wrap);
  return wrap;
}

function decoratePathwayEvidence(scope) {
  const states = getLatestUnitPathwayStates();
  for (const card of scope.querySelectorAll?.('.vocab-pathway-card[data-pathway]') ?? []) {
    if (card.dataset.pathwayStatus === 'unavailable') continue;
    const wrap = ensurePathwayEvidenceShell(card);
    const state = states?.[card.dataset.pathway];
    const evidence = state?.stageEvidence;
    if (!evidence) continue;

    const stageLabel = STAGE_LABELS[evidence.stageId] ?? currentStageLabel(card);
    const percent = Math.max(0,Math.min(100,Number(evidence.progressPercent) || 0));
    wrap.dataset.pathwayEvidence = evidence.stageId;

    const title = wrap.querySelector?.('.vocab-pathway-card__evidence-copy strong');
    const detail = wrap.querySelector?.('.vocab-pathway-card__evidence-copy small');
    const meter = wrap.querySelector?.('.vocab-pathway-card__evidence-meter');
    const fill = wrap.querySelector?.('.vocab-pathway-card__evidence-fill');
    const nextTitle = `${stageLabel} evidence`;
    const nextDetail = evidenceCopy(evidence);
    if (title && title.textContent !== nextTitle) title.textContent = nextTitle;
    if (detail && detail.textContent !== nextDetail) detail.textContent = nextDetail;
    if (meter) {
      meter.setAttribute('aria-label',`${stageLabel} evidence progress`);
      meter.setAttribute('aria-valuenow',String(percent));
    }
    fill?.style?.setProperty('--pathway-evidence',`${percent}%`);
  }
}

export function enhanceStudyArtwork(scope = root) {
  if (!scope) return;
  // Artwork is rendered into the view HTML (study-art-svg.js) and is never injected here. Only the pathway
  // evidence readout is hydrated after render, into a shell whose size is already reserved by CSS.
  decoratePathwayEvidence(scope);
}

if (root) {
  enhanceStudyArtwork(root);
  const observer = new MutationObserver(() => {
    observer.disconnect();
    try {
      enhanceStudyArtwork(root);
    } finally {
      observer.observe(root,{ childList:true, subtree:true });
    }
  });
  observer.observe(root,{ childList:true, subtree:true });
}
