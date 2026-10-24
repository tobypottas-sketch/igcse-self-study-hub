import { escapeHtml } from '../views/html.js';

const PATHWAY_IDENTITIES = Object.freeze({
  meaning:Object.freeze({ id:'meaning', label:'Meaning', purpose:'Understand the definition', accent:'meaning', icon:'book' }),
  context:Object.freeze({ id:'context', label:'Context', purpose:'See the word in a sentence', accent:'context', icon:'quote' }),
  word_families:Object.freeze({ id:'word_families', label:'Word Families', purpose:'Learn related forms', accent:'word-families', icon:'branch' }),
  paraphrasing:Object.freeze({ id:'paraphrasing', label:'Paraphrasing', purpose:'Find different ways to say it', accent:'paraphrasing', icon:'swap' }),
  precision_use:Object.freeze({ id:'precision_use', label:'Precision & Use', purpose:'Choose the best word', accent:'precision', icon:'target' }),
  spelling_recall:Object.freeze({ id:'spelling_recall', label:'Spelling & Recall', purpose:'Build and remember the word', accent:'spelling', icon:'keyboard' })
});

const NEUTRAL_IDENTITY = Object.freeze({
  id:'neutral',
  label:'Vocabulary',
  purpose:'Build vocabulary step by step',
  accent:'neutral',
  icon:'spark'
});

const ICON_PATHS = Object.freeze({
  book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21.5z"/>',
  quote:'<path d="M5 6.5h6v5H7.5L5 15v-8.5z"/><path d="M13 6.5h6v5h-3.5L13 15v-8.5z"/>',
  branch:'<circle cx="12" cy="4" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M12 6v5M12 11H7a2 2 0 0 0-2 2v3M12 11h5a2 2 0 0 1 2 2v3"/>',
  swap:'<path d="M4 8h13l-3-3M20 16H7l3 3"/><path d="M17 5l3 3-3 3M7 13l-3 3 3 3"/>',
  target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/><path d="M16 8l4-4M17 4h3v3"/>',
  keyboard:'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M6 10h1M10 10h1M14 10h1M18 10h1M6 14h2M10 14h7M18 14h1"/>',
  spark:'<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"/><path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2zM5.5 15l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6z"/>',
  shuffle:'<path d="M3 7h3.5c2 0 3.2 1 4.3 2.7l2.4 3.6c1.1 1.7 2.3 2.7 4.3 2.7H21M3 17h3.5c2 0 3.2-1 4.3-2.7M13.2 8.7C14.3 7.4 15.4 7 17.5 7H21"/><path d="M18.5 4.5L21 7l-2.5 2.5M18.5 14.5L21 17l-2.5 2.5"/>',
  dictionary:'<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/><path d="M9 8h6M9 11.5h4"/>',
  check:'<path d="M5 12.5l4.2 4.2L19 7"/>',
  arrow:'<path d="M5 12h14M14 7l5 5-5 5"/>',
  lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  trophy:'<path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/><path d="M8 6H5v1a4 4 0 0 0 4 4M16 6h3v1a4 4 0 0 1-4 4M12 12v4M9 20h6M10 16h4v4"/>',
  bulb:'<path d="M9 17h6M10 20h4"/><path d="M8 14a6 6 0 1 1 8 0c-1 .8-1.4 1.6-1.5 3h-5c-.1-1.4-.5-2.2-1.5-3z"/>'
});

const STAGE_ORDER = Object.freeze(['recognise','match','apply','recall','mastery']);
function stageLabel(stageId) {
  const text = String(stageId ?? '');
  return text ? text[0].toUpperCase() + text.slice(1) : '';
}

export function pathwayIdentity(pathwayId) {
  return PATHWAY_IDENTITIES[pathwayId] ?? NEUTRAL_IDENTITY;
}

export function renderStudyIcon(iconId, { label = '', className = '' } = {}) {
  const resolvedIcon = Object.hasOwn(ICON_PATHS,iconId) ? iconId : 'spark';
  const classes = ['study-icon', String(className ?? '').trim()].filter(Boolean).join(' ');
  const accessibility = label
    ? `role="img" aria-label="${escapeHtml(label)}"`
    : 'aria-hidden="true"';
  return `<svg class="${escapeHtml(classes)}" data-study-icon="${escapeHtml(resolvedIcon)}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${accessibility} focusable="false">${ICON_PATHS[resolvedIcon]}</svg>`;
}

export function deriveStudyMilestone({ beforePathwayState, afterPathwayState, term = '', pathwayId = '' } = {}) {
  if (!beforePathwayState || !afterPathwayState || !pathwayId) return null;
  const beforeMastered = Boolean(beforePathwayState.mastered);
  const afterMastered = Boolean(afterPathwayState.mastered);
  const fromStage = STAGE_ORDER.includes(beforePathwayState.currentStage) ? beforePathwayState.currentStage : null;
  const toStage = STAGE_ORDER.includes(afterPathwayState.currentStage) ? afterPathwayState.currentStage : null;
  if (!fromStage || !toStage) return null;
  if (!beforeMastered && afterMastered) {
    const identity = pathwayIdentity(pathwayId);
    const cleanTerm = String(term ?? '').trim();
    return {
      kind:'mastered', pathwayId, term:cleanTerm, fromStage, toStage,
      title:`${identity.label} mastered${cleanTerm ? ` · ${cleanTerm}` : ''}`
    };
  }
  if (beforeMastered || afterMastered) return null;
  const fromIndex = STAGE_ORDER.indexOf(fromStage);
  const toIndex = STAGE_ORDER.indexOf(toStage);
  if (toIndex <= fromIndex) return null;
  return {
    kind:'stage_advanced', pathwayId, term:String(term ?? ''), fromStage, toStage,
    title:`${stageLabel(fromStage)} complete · ${stageLabel(toStage)} unlocked`
  };
}