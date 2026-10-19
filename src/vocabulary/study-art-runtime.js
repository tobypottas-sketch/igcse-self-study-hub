import { achievementArtwork, pathwayArtwork, unitArtwork } from './study-art.js';

const root = document.getElementById('vocabularyApp');

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
