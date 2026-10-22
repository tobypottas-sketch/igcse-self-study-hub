import { escapeHtml } from '../views/html.js';
import { isMatchSetComplete, matchSetProgress } from './match-set.js';

// Markup + in-place repaint for the Meaning → Match set. Pure string rendering (testable in Node); the only DOM
// access is `repaintMatchSet`, which swaps the set's own markup so a tap never re-renders the whole question.
//
// Pairing is shown three ways that do not depend on colour alone: a pair number badge on both items, the same accent
// tone on both items, and a "↔ partner" label on the definition. Rows on the two sides are deliberately NOT aligned
// pairs (the definitions are shuffled), so position never implies a pairing.

const TONES = 5;

function wordIndex(set, wordId) { return Math.max(0, set.words.findIndex(word => word.id === wordId)); }
function partnerWordId(set, state, definitionId) {
  const fromSettled = Object.keys(state.settled).find(word => state.settled[word] === definitionId);
  return fromSettled ?? Object.keys(state.pairs).find(word => state.pairs[word] === definitionId) ?? null;
}

export function matchStatusText(set, state, { finished = false, reveal = false } = {}) {
  const { paired, total, remaining } = matchSetProgress(set, state);
  if (reveal) return 'These are the correct matches.';
  if (finished) return `All ${total} matches are correct.`;
  const last = state.lastCheck;
  if (last && last.right < last.total && state.flash.incorrect.length) {
    const left = last.total - last.right;
    return `${last.right} of ${last.total} matched correctly. Match the other ${left} again.`;
  }
  if (state.selected) {
    const side = state.selected.side === 'word' ? 'definition' : 'word';
    return `Selected. Now choose its ${side}.`;
  }
  if (!paired) return 'Drag a word onto its definition.';
  if (remaining) return `${paired} of ${total} paired. ${remaining} to go.`;
  return `All ${total} paired. Check your answers.`;
}

function itemMarkup(set, state, side, item, { finished, reveal }) {
  const isWord = side === 'word';
  const settledWord = isWord ? (state.settled[item.id] ? item.id : null) : (Object.keys(state.settled).find(word => state.settled[word] === item.id) ?? null);
  const pairedWord = isWord ? (state.pairs[item.id] ? item.id : null) : (Object.keys(state.pairs).find(word => state.pairs[word] === item.id) ?? null);
  const partnerWord = settledWord ?? pairedWord;
  const partnerDefinition = partnerWord ? (state.settled[partnerWord] ?? state.pairs[partnerWord]) : null;
  const selected = state.selected?.side === side && state.selected.id === item.id;
  const tone = partnerWord ? (wordIndex(set, partnerWord) % TONES) + 1 : 0;
  const number = partnerWord ? wordIndex(set, partnerWord) + 1 : 0;
  const flash = state.flash ?? { paired:[], correct:[], incorrect:[] };
  const wasJustPaired = partnerWord && flash.paired.includes(partnerWord);
  const wasCorrect = settledWord && flash.correct.includes(settledWord);
  const wasIncorrect = isWord ? flash.incorrect.includes(item.id) : (flash.incorrectDefinitions ?? []).includes(item.id);
  const classes = ['vocab-matchset__item', `vocab-matchset__item--${side}`];
  if (selected) classes.push('is-selected');
  if (pairedWord) classes.push('is-paired');
  if (settledWord) classes.push('is-settled');
  if (partnerWord) classes.push(`tone-${tone}`);
  if (wasJustPaired) classes.push('is-snap');
  if (wasCorrect) classes.push('is-ticked');
  if (wasIncorrect) classes.push('is-shake');
  const locked = Boolean(settledWord) || finished || reveal;
  const partnerText = partnerWord
    ? (isWord ? set.definitions.find(definition => definition.id === partnerDefinition)?.text : set.words.find(word => word.id === partnerWord)?.text)
    : '';
  const stateText = settledWord ? (finished || reveal ? '' : ', correct') : pairedWord ? `, paired with ${partnerText}` : selected ? ', selected' : '';
  const tick = '<svg viewBox="0 0 16 16" width="12" height="12" focusable="false"><path d="M3.2 8.4l3 3 6.6-6.8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const badge = partnerWord ? `<span class="vocab-matchset__badge" aria-hidden="true">${settledWord ? tick : number}</span>` : '<span class="vocab-matchset__badge vocab-matchset__badge--empty" aria-hidden="true"></span>';
  const partner = !isWord && partnerWord ? `<span class="vocab-matchset__partner" aria-hidden="true">↔ ${escapeHtml(set.words.find(word => word.id === partnerWord)?.text ?? '')}</span>` : '';
  const row = isWord ? wordIndex(set, item.id) + 1 : set.definitions.findIndex(definition => definition.id === item.id) + 1;
  const dataAttr = isWord ? `data-match-word="${escapeHtml(item.id)}"` : `data-match-definition="${escapeHtml(item.id)}"`;
  return `<button type="button" class="${classes.join(' ')}" ${dataAttr} style="grid-row:${row}" aria-pressed="${selected ? 'true' : 'false'}"${locked ? ' disabled' : ''}>${badge}<span class="vocab-matchset__text">${escapeHtml(item.text)}${partner}</span><span class="vocab-sr-only">${escapeHtml(stateText)}</span></button>`;
}

export function renderMatchSet(set, state, { retry = false, finished = false, reveal = false } = {}) {
  const complete = isMatchSetComplete(set, state) && !finished && !reveal;
  const settledCount = Object.keys(state.settled).length;
  const legend = retry && settledCount < set.words.length && state.lastCheck ? 'Match the remaining pairs' : 'Match each word with its definition';
  const status = matchStatusText(set, state, { finished, reveal });
  const words = set.words.map(word => itemMarkup(set, state, 'word', word, { finished, reveal })).join('');
  const definitions = set.definitions.map(definition => itemMarkup(set, state, 'definition', definition, { finished, reveal })).join('');
  const check = finished || reveal ? '' : `<button class="vocab-button vocab-button--primary vocab-matchset__check" type="submit" data-match-check aria-disabled="${complete ? 'false' : 'true'}">Check answers</button>`;
  return `<fieldset class="vocab-matchset${retry ? ' is-retry' : ''}${finished || reveal ? ' is-finished' : ''}" data-match-set data-match-count="${set.words.length}"><legend class="vocab-sr-only">${legend}</legend>${finished || reveal ? '' : '<p class="vocab-matchset__hint">Drag each word onto its definition. (You can also tap a word, then tap its definition.) Tap a pair again to change it. Nothing is marked until you check.</p>'}<div class="vocab-matchset__board"><div class="vocab-matchset__group vocab-matchset__group--words" role="group" aria-label="Words">${words}</div><div class="vocab-matchset__group vocab-matchset__group--definitions" role="group" aria-label="Definitions">${definitions}</div></div><p class="vocab-matchset__status" role="status" aria-live="polite" data-match-status>${escapeHtml(status)}</p><input type="hidden" name="answer" value="">${check}</fieldset>`;
}

// Replaces the set's markup in place (no full-question re-render) and keeps keyboard focus where the student was.
export function repaintMatchSet(container, html, focusSelector = null) {
  const current = container?.querySelector?.('[data-match-set]');
  if (!current) return false;
  const active = focusSelector ?? (container.ownerDocument?.activeElement?.closest?.('[data-match-word],[data-match-definition]') ? selectorFor(container.ownerDocument.activeElement.closest('[data-match-word],[data-match-definition]')) : null);
  current.outerHTML = html;
  if (active) container.querySelector?.(active)?.focus?.({ preventScroll:true });
  return true;
}
function selectorFor(node) {
  if (node.dataset.matchWord) return `[data-match-word="${node.dataset.matchWord}"]`;
  if (node.dataset.matchDefinition) return `[data-match-definition="${node.dataset.matchDefinition}"]`;
  return null;
}

// Arrow keys move focus inside the board; Enter / Space already activate the buttons natively.
export function matchKeyTarget(set, side, id, key) {
  const column = side === 'word' ? set.words : set.definitions;
  const index = column.findIndex(item => item.id === id);
  if (index < 0) return null;
  if (key === 'ArrowDown') return { side, id:column[Math.min(column.length - 1, index + 1)].id };
  if (key === 'ArrowUp') return { side, id:column[Math.max(0, index - 1)].id };
  if (key === 'ArrowRight' && side === 'word') return { side:'definition', id:set.definitions[Math.min(index, set.definitions.length - 1)].id };
  if (key === 'ArrowLeft' && side === 'definition') return { side:'word', id:set.words[Math.min(index, set.words.length - 1)].id };
  if (key === 'Home') return { side, id:column[0].id };
  if (key === 'End') return { side, id:column[column.length - 1].id };
  return null;
}
