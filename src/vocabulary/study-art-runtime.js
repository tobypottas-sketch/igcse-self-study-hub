import { achievementArtwork, pathwayArtwork, unitArtwork } from './study-art.js';
import { getLatestUnitPathwayStates } from './pathway-view-model.js';

const root = document.getElementById('vocabularyApp');
const STAGE_LABELS = Object.freeze({ recognise:'Recognise', match:'Match', apply:'Apply', recall:'Recall', mastery:'Mastery' });

function imageElement(art, className) {
  const img = document.createElement('img');
  img.src = art.src;
  img.alt = art.alt;
  img.className = className;
  img.loading = 'eager';
  img.decoding = 'async';
  return img;
}

function decorateUnitCards(scope) {
  for (const card of scope.querySelectorAll?.('.vocab-unit-card[data-unit]') ?? []) {
    if (card.querySelector?.('[data-unit-art]')) continue;
    const art = unitArtwork(card.dataset.unit);
    if (!art) continue;
    const visual = document.createElement('span');
    visual.className = 'vocab-unit-card__art';
    visual.dataset.unitArt = String(card.dataset.unit);
    visual.setAttribute('aria-hidden','true');
    const image = imageElement({ ...art, alt:'' }, 'vocab-unit-card__art-image');
    visual.append(image);
    card.append(visual);
  }
}

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

function decoratePathwayCards(scope) {
  for (const card of scope.querySelectorAll?.('.vocab-pathway-card[data-pathway]') ?? []) {
    if (card.querySelector?.('[data-pathway-art]')) continue;
    const art = pathwayArtwork(card.dataset.pathway);
    if (!art) continue;
    const visual = document.createElement('span');
    visual.className = 'vocab-pathway-card__art';
    visual.dataset.pathwayArt = String(card.dataset.pathway);
    visual.setAttribute('aria-hidden','true');
    visual.append(imageElement({ ...art, alt:'' }, 'vocab-pathway-card__art-image'));
    card.append(visual);
    card.classList.add('has-study-art');
  }
}

function decorateUnitHero(scope) {
  for (const hero of scope.querySelectorAll?.('.vocab-unit-hero') ?? []) {
    if (hero.querySelector?.('[data-unit-hero-art]')) continue;
    const kicker = hero.querySelector?.('.vocab-kicker')?.textContent ?? '';
    const match = kicker.match(/Unit\s+(\d+)/i);
    if (!match) continue;
    const art = unitArtwork(Number(match[1]));
    if (!art) continue;
    const figure = document.createElement('figure');
    figure.className = 'vocab-unit-hero__art';
    figure.dataset.unitHeroArt = match[1];
    figure.append(imageElement(art,'vocab-unit-hero__art-image'));
    hero.append(figure);
    hero.classList.add('has-study-art');
  }
}

function decorateCompletion(scope) {
  for (const card of scope.querySelectorAll?.('[data-study-completion]') ?? []) {
    if (card.querySelector?.('[data-study-completion-art]')) continue;
    const art = achievementArtwork('completion');
    if (!art) continue;
    const wrap = document.createElement('div');
    wrap.className = 'vocab-completion-art';
    wrap.dataset.studyCompletionArt = 'trophy';
    const rays = document.createElement('span');
    rays.className = 'vocab-completion-rays';
    rays.setAttribute('aria-hidden','true');
    wrap.append(rays,imageElement(art,'vocab-completion-art__image'));
    const celebration = card.querySelector?.('.vocab-celebration');
    if (celebration) celebration.replaceWith(wrap); else card.prepend(wrap);
  }
}

function decorateMilestones(scope) {
  for (const milestone of scope.querySelectorAll?.('[data-study-milestone]') ?? []) {
    if (milestone.querySelector?.('[data-study-milestone-art]')) continue;
    const kind = milestone.dataset.studyMilestone;
    const art = achievementArtwork(kind);
    if (!art) continue;
    const figure = document.createElement('span');
    figure.className = `study-milestone-art study-milestone-art--${kind}`;
    figure.dataset.studyMilestoneArt = kind;
    figure.append(imageElement(art,'study-milestone-art__image'));
    milestone.prepend(figure);
  }
}

export function enhanceStudyArtwork(scope = root) {
  if (!scope) return;
  decorateUnitCards(scope);
  decoratePathwayEvidence(scope);
  decoratePathwayCards(scope);
  decorateUnitHero(scope);
  decorateCompletion(scope);
  decorateMilestones(scope);
}

if (root) {
  enhanceStudyArtwork(root);
  const observer = new MutationObserver(() => enhanceStudyArtwork(root));
  observer.observe(root,{ childList:true, subtree:true });
}
