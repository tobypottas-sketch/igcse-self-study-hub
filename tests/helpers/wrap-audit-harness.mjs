// Renders the REAL Vocabulary markup (views.js, games-view.js, match-set-view.js) with the REAL stylesheets (the <link>s in vocabulary.html)
// in headless Chromium and measures how the student-facing text wraps: which text blocks end on a stranded single word, which split a word,
// and which overflow. Content is the reviewed Unit 1 content, never student data.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import unit1 from '../../content/vocabulary/units/unit-01.js';
import { renderVocabularyQuestion, supportiveFeedback } from '../../src/vocabulary/views.js';
import { renderBlitzPlay, renderConnectionsPlay } from '../../src/vocabulary/games/games-view.js';
import { renderMatchSet } from '../../src/vocabulary/match-set-view.js';
import { newMatchState } from '../../src/vocabulary/match-set.js';
import { buildBlitzPool } from '../../src/vocabulary/games/blitz-engine.js';
import { createConnections } from '../../src/vocabulary/games/connections-engine.js';
import { CONNECTIONS_PUZZLES } from '../../src/vocabulary/games/games-data.js';
import { findChromium, loadPlaywright } from './pathway-geometry-harness.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
export const SHEETS = [...read('vocabulary.html').matchAll(/<link rel="stylesheet" href="([^"]+\.css)">/g)].map(m => m[1]).filter(f => fs.existsSync(path.join(root, f)));
export const CSS = SHEETS.map(read).join('\n');
export const WIDTHS = [[1280, 800], [820, 1100], [390, 844], [320, 640]];

// Every student-facing text block this audit covers. `name` is only for reporting.
export const TARGETS = [
  ['question prompt', '.vocab-question-prompt'],
  ['context sentence', '.vocab-question-context p'],
  ['answer choice', '.vocab-choice-card > span:not(.vocab-choice-card__key)'],
  ['match card', '.vocab-match-card'],
  ['feedback', '.study-feedback strong'],
  ['match set item', '.vocab-matchset__text'],
  ['blitz prompt', '.gm-prompt__text'],
  ['blitz answer', '.gm-option span'],
  ['connections question', '.gm-cx__q'],
  ['connections clue', '.gm-clue__text'],
  ['connections help choice', '.gm-choice'],
  ['connections result', '.gm-result__word'],
  ['connections explanation', '.gm-result__why'],
  ['connections nudge', '.gm-nudge']
];

const contexts = unit1.contexts.filter(context => context.text);
const itemsById = new Map(unit1.items.map(item => [item.vocabularyId, item]));

// Real Unit 1 meaning-in-context questions: the sentence plus the reviewed meaning and wrong meanings as the four options.
export function contextQuestions() {
  const out = [];
  for (const item of unit1.items) {
    for (const sense of item.senses ?? []) for (const context of sense.masteryContexts ?? []) {
      if (!context.wrongMeanings?.length || !context.meaning) continue;
      out.push({ type: 'meaning_in_context', responseMode: 'choice', prompt: `What does “${item.term}” mean in this sentence?`, sourceText: context.text, options: [context.meaning, ...context.wrongMeanings].slice(0, 4), term: item.term });
    }
  }
  return out;
}

// Other real Unit 1 question shapes: gap-fill sentence with word options, definition recall (long prompt, typed answer) and paraphrase choice.
export function otherQuestions() {
  const out = [];
  const termsOf = unit1.items.map(item => item.term);
  unit1.contexts.filter(c => c.type === 'gap_fill' && c.text).slice(0, 60).forEach((context, i) => {
    const item = itemsById.get(context.vocabularyId); if (!item) return;
    const others = termsOf.filter(t => t !== item.term).filter((_, j) => (j + i) % 7 === 0).slice(0, 3);
    out.push({ type: 'gap_fill_choice', responseMode: 'choice', prompt: 'Choose the word that completes the sentence.', sourceText: context.text, options: [item.term, ...others], term: item.term });
  });
  for (const item of unit1.items) {
    out.push({ type: 'type_word_from_definition', responseMode: 'text', prompt: `Type the word that means: ${item.coreMeaning}`, term: item.term });
    for (const sense of item.senses ?? []) for (const context of sense.masteryContexts ?? []) {
      if (context.wrongMeanings?.length && context.meaning) out.push({ type: 'choose_paraphrase', responseMode: 'choice', prompt: 'Which meaning is closest to the underlined idea?', sourceIdea: context.text, options: [context.meaning, ...context.wrongMeanings].slice(0, 4), term: item.term });
    }
  }
  return out;
}

// The correct-answer explanation (names the word and its meaning) and the retry nudges, on real questions.
export function feedbackHtml() {
  const out = [];
  const categories = ['quantity_change', 'degree_change', 'cause_effect_change', 'added_information', 'unnatural_collocation', 'related_but_inaccurate', undefined];
  contextQuestions().slice(0, 40).forEach((question, i) => {
    const meaning = question.options[0];
    const good = supportiveFeedback({ correct: true, term: question.term, meaning, questionType: 'meaning_match', variant: i });
    out.push(questionHtml(question, { feedback: { correct: true, message: good } }));
    const bad = supportiveFeedback({ correct: false, misconceptionCategory: categories[i % categories.length], term: question.term, meaning, questionType: 'meaning_match' });
    out.push(questionHtml(question, { feedback: { correct: false, message: bad }, retry: true }));
  });
  return out;
}

// Match Set boards of five real Unit 1 words and meanings (unpaired and fully paired).
export function matchSetHtml() {
  const out = [];
  for (let i = 0; i + 5 <= unit1.items.length; i += 5) {
    const items = unit1.items.slice(i, i + 5);
    const set = { words: items.map((item, j) => ({ id: `w${j}`, text: item.term })), definitions: items.map((item, j) => ({ id: `d${j}`, text: item.coreMeaning })) };
    out.push(renderMatchSet(set, newMatchState()));
    out.push(renderMatchSet(set, { ...newMatchState(), pairs: Object.fromEntries(items.map((_, j) => [`w${j}`, `d${j}`])) }));
  }
  return out;
}

export function questionHtml(question, extra = {}) {
  const holder = { innerHTML: '' };
  renderVocabularyQuestion(holder, { unitNumber: 1, unitTitle: 'Unit 1', question, term: question.term, sessionLabel: 'Meaning · 3 of 10', sessionPosition: 3, sessionTotal: 10, ...extra });
  return holder.innerHTML;
}

export function blitzPool(seed = 7) {
  let s = seed; const rng = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  return buildBlitzPool(unit1, rng);
}
// A pool entry becomes the on-screen question exactly as createBlitz does it: { ...entry, ...entry.build() }.
// Connections: every puzzle with all clues shown + "Need help?" choices, and as the missed-puzzle result card.
export function connectionsHtml() {
  const out = [];
  for (const puzzle of CONNECTIONS_PUZZLES) {
    const game = createConnections({ puzzles: [puzzle] });
    while (game.reveal()) { /* show every clue */ }
    game.help(); game.guess('definitelywrongxx'); out.push(renderConnectionsPlay(game));
    game.giveUp(); out.push(renderConnectionsPlay(game));
  }
  return out;
}
export const blitzHtml = entry => renderBlitzPlay({ score: 0, question: { ...entry, ...entry.build() } });

export const pageHtml = markup => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${CSS}</style></head><body><div id="vocabularyApp">${markup}</div></body></html>`;

// Runs in the page. For each target element: its lines (word rects grouped by top), words on the last line, split words and overflow.
export const MEASURE = targets => {
  const out = [];
  for (const [name, selector] of targets) {
    for (const el of document.querySelectorAll(selector)) {
      if (!el.getClientRects().length) continue;
      const words = [];
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (node.parentElement.closest('[aria-hidden="true"], .vocab-sr-only, kbd')) continue;
        for (const match of node.textContent.matchAll(/\S+/g)) {
          const range = document.createRange(); range.setStart(node, match.index); range.setEnd(node, match.index + match[0].length);
          const rects = [...range.getClientRects()].filter(r => r.width > 0);
          // A hyphenated or slashed compound may break after its hyphen; that is a normal line break, not a split word.
          if (rects.length) words.push({ text: match[0], top: Math.round(rects[0].top), split: rects.length > 1 && !/[-\u2010-\u2014/]/.test(match[0]) });
        }
      }
      if (!words.length) continue;
      const tops = [...new Set(words.map(w => w.top))].sort((a, b) => a - b);
      const last = words.filter(w => w.top === tops[tops.length - 1]);
      const box = el.getBoundingClientRect();
      out.push({ name, text: words.map(w => w.text).join(' '), lines: tops.length, lastLine: last.map(w => w.text).join(' '), lastWords: last.length,
        orphan: tops.length >= 2 && last.length === 1, split: words.filter(w => w.split).map(w => w.text), width: Math.round(box.width),
        overflow: el.scrollWidth > el.clientWidth + 1 || box.right > document.documentElement.clientWidth + 1 });
    }
  }
  return { blocks: out, pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth };
};

export async function launch() {
  const playwright = loadPlaywright(); const executablePath = await findChromium();
  if (!playwright || !executablePath) return null;
  return playwright.chromium.launch({ executablePath });
}

export async function measureAt(browser, [width, height], markups, targets = TARGETS) {
  const page = await browser.newPage({ viewport: { width, height } });
  const results = [];
  try {
    for (const markup of markups) {
      await page.setContent(pageHtml(markup), { waitUntil: 'load' });
      await page.evaluate(() => document.fonts?.ready);
      results.push(await page.evaluate(MEASURE, targets));
    }
  } finally { await page.close(); }
  return results;
}
export { unit1, itemsById, contexts, renderMatchSet, newMatchState };
