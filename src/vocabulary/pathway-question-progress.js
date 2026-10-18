import { VOCABULARY_PATHWAYS, PATHWAY_STAGES } from './pathway-model.js';

function pathwayLabel(pathwayId) {
  return VOCABULARY_PATHWAYS.find(pathway => pathway.id === pathwayId)?.label ?? '';
}
function stageMeta(stageId) {
  const index = PATHWAY_STAGES.findIndex(stage => stage.id === stageId);
  if (index < 0) return null;
  return { label:PATHWAY_STAGES[index].label, position:index + 1 };
}
function clamp(value,min,max) { return Math.max(min,Math.min(max,Number(value) || 0)); }

export function renderPathwayQuestionProgress({ pathwayId, stageId, current = 1, total = 10 } = {}) {
  const label = pathwayLabel(pathwayId);
  const stage = stageMeta(stageId);
  if (!label || !stage) return '';
  const safeTotal = Math.max(1,Number(total) || 10);
  const safeCurrent = clamp(current,1,safeTotal);
  const stagePercent = stage.position * 20;
  const setPercent = (safeCurrent / safeTotal) * 100;
  return `<div class="vocab-pathway-session-progress" data-pathway-session-progress="${pathwayId}" data-pathway-stage="${stageId}">
    <div class="vocab-pathway-session-progress__copy"><strong>${label}</strong><span>${stage.label} · Stage ${stage.position} of 5</span></div>
    <div class="vocab-pathway-progress" role="progressbar" aria-label="${label} pathway progress: ${stage.label}, stage ${stage.position} of 5" aria-valuemin="1" aria-valuemax="5" aria-valuenow="${stage.position}"><span class="vocab-pathway-progress__fill" style="--pathway-progress:${stagePercent}%"></span></div>
    <div class="vocab-set-progress__copy"><strong>Question ${safeCurrent} of ${safeTotal}</strong><span>Current set</span></div>
    <div class="vocab-set-progress" role="progressbar" aria-label="Question ${safeCurrent} of ${safeTotal}" aria-valuemin="1" aria-valuenow="${safeCurrent}" aria-valuemax="${safeTotal}"><span class="vocab-set-progress__fill" style="--set-progress:${setPercent}%"></span></div>
  </div>`;
}

function selectedStage(card) {
  if (card?.dataset?.pathwayStatus === 'mastered') return 'mastery';
  return card?.querySelector?.('.vocab-pathway-stage[data-state="current"]')?.dataset?.pathwayStage ?? 'recognise';
}
function setPosition(root) {
  const text = root?.querySelector?.('.vocab-topbar span')?.textContent ?? '';
  const match = text.match(/(\d+)\s*\/\s*(\d+)\s*activities/i);
  if (!match) return { current:1, total:10 };
  const completed = Number(match[1]) || 0;
  const total = Math.max(1,Number(match[2]) || 10);
  const hasFeedback = Boolean(root.querySelector?.('.vocab-feedback'));
  const current = hasFeedback ? Math.max(1,completed) : Math.min(total,completed + 1);
  return { current,total };
}

export function setupPathwayQuestionProgress(root = globalThis.document?.getElementById?.('vocabularyApp')) {
  if (!root) return () => {};
  let active = null;

  const capture = event => {
    const card = event.target?.closest?.('[data-action="open-pathway"]');
    if (card) {
      active = { pathwayId:card.dataset.pathway, stageId:selectedStage(card) };
      return;
    }
    if (event.target?.closest?.('[data-action="start-mixed-review"], [data-action="back-units"]')) active = null;
  };
  root.addEventListener('click',capture,true);

  const enhance = () => {
    const meta = root.querySelector?.('.vocab-question-meta__right');
    if (!meta || !active) return;
    const { current,total } = setPosition(root);
    const html = renderPathwayQuestionProgress({ ...active,current,total });
    if (!html) return;
    meta.innerHTML = html;
  };

  const observer = typeof MutationObserver !== 'undefined' ? new MutationObserver(enhance) : null;
  observer?.observe?.(root,{ childList:true,subtree:true });
  enhance();
  return () => {
    root.removeEventListener('click',capture,true);
    observer?.disconnect?.();
  };
}

if (typeof document !== 'undefined') setupPathwayQuestionProgress(document.getElementById('vocabularyApp'));
