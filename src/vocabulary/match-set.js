import { shuffleAnswerOptions } from './answer-option-shuffle.js';

// Meaning → Match as one real matching exercise: several words on the left, their shuffled definitions on the right.
//
// This module is pure (no DOM, no network). It owns three things:
//   1. the layout of a set (which words, which shuffled definitions, the answer key),
//   2. the pairing state machine (select, pair, release, check, reopen),
//   3. the mapping from a checked set to the ONE answer the existing attempt model already accepts.
//
// Evidence model (unchanged): one visible set is one activity for one primary evidence target. It is persisted with
// the existing single-answer payload (`rawAnswer`) for that target, at most twice (first attempt, supported retry),
// exactly like every other activity. The other pairs are the activity's curated distractors; they are checked here for
// feedback only and never carry evidence, so a set can never count as four or five mission activities.

// Meaning → Match only. Meaning → Apply (drag_word_definition, drag_definition_word, which_situation_fits) is deliberately a
// different, harder task (apply a meaning to a situation) and must never render this word ↔ definition set.
export const MATCH_SET_TYPES = Object.freeze(['word_definition_match']);
export const MIN_MATCH_PAIRS = 3;
export const MAX_MATCH_PAIRS = 5;

function text(value) { return String(value ?? '').trim(); }
function array(value) { return Array.isArray(value) ? value : []; }
function foldKey(value) { return text(value).toLocaleLowerCase('en').replace(/\s+/g, ' '); }

// Curated pairs for the set: unique words, unique definitions, capped to the 4–5 the layout is designed for.
export function matchSetPairs(question) {
  const seenTerms = new Set(); const seenDefinitions = new Set(); const pairs = [];
  for (const pair of array(question?.pairs)) {
    const term = text(pair?.term); const definition = text(pair?.definition);
    if (!term || !definition) continue;
    const termKey = foldKey(term); const definitionKey = foldKey(definition);
    if (seenTerms.has(termKey) || seenDefinitions.has(definitionKey)) continue;
    seenTerms.add(termKey); seenDefinitions.add(definitionKey);
    pairs.push({ vocabularyId:pair?.vocabularyId ?? null, term, definition });
    if (pairs.length >= MAX_MATCH_PAIRS) break;
  }
  return pairs;
}

export function usesMatchSet(question) {
  if (!MATCH_SET_TYPES.includes(question?.type)) return false;
  const pairs = matchSetPairs(question);
  if (pairs.length < MIN_MATCH_PAIRS) return false;
  return pairs.some(pair => pair.vocabularyId != null && pair.vocabularyId === question?.primaryEvidenceTargetId);
}

// Deterministic for one question (stable across re-renders), shuffled, and never leaves a definition in the row of its
// own word, so the layout itself gives nothing away.
function shuffledDefinitionOrder(definitions, seed) {
  const count = definitions.length;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const order = shuffleAnswerOptions(definitions.map((_, index) => index), `${seed}:${attempt}`, 'match-set');
    if (order.every((original, row) => original !== row)) return order;
  }
  return definitions.map((_, index) => (index + 1) % count);   // a rotation is always a derangement
}

export function buildMatchSet(question) {
  if (!usesMatchSet(question)) return null;
  const pairs = matchSetPairs(question);
  const seed = `${question?.activityId ?? question?.contentId ?? 'match'}:${question?.activityVariantId ?? ''}:${pairs.map(pair => pair.vocabularyId ?? pair.term).join('|')}`;
  const order = shuffledDefinitionOrder(pairs.map(pair => pair.definition), seed);   // order[row] = index of the pair whose definition sits in that row
  const words = pairs.map((pair, index) => ({ id:`w${index + 1}`, text:pair.term, vocabularyId:pair.vocabularyId }));
  const definitions = order.map((pairIndex, row) => ({ id:`d${row + 1}`, text:pairs[pairIndex].definition }));
  const key = {};
  order.forEach((pairIndex, row) => { key[words[pairIndex].id] = definitions[row].id; });
  const primaryIndex = pairs.findIndex(pair => pair.vocabularyId != null && pair.vocabularyId === question.primaryEvidenceTargetId);
  return {
    words, definitions, key,
    primaryWordId:words[primaryIndex].id,
    primaryDefinitionId:key[words[primaryIndex].id]
  };
}

// ── State ─────────────────────────────────────────────────────────────────────────────────────────────────────
// pairs:   wordId -> definitionId for pairs the student has made and not yet checked
// settled: wordId -> definitionId for pairs confirmed correct (permanently locked)
// selected:{ side:'word'|'definition', id } | null
// flash:   what changed in the last action, used once for animation (never read for logic)
export function newMatchState() { return { pairs:{}, settled:{}, selected:null, checks:0, flash:{ paired:[], correct:[], incorrect:[], incorrectDefinitions:[] }, revealed:false }; }

const takenWords = state => new Set([...Object.keys(state.pairs), ...Object.keys(state.settled)]);
const takenDefinitions = state => new Set([...Object.values(state.pairs), ...Object.values(state.settled)]);
const clone = state => ({ ...state, pairs:{ ...state.pairs }, settled:{ ...state.settled }, selected:state.selected ? { ...state.selected } : null, flash:{ paired:[], correct:[], incorrect:[], incorrectDefinitions:[] } });
const known = (set, side, id) => (side === 'word' ? set.words : set.definitions).some(row => row.id === id);

// A tap on a word or a definition. Returns the next state (the input is never mutated).
//  - a settled (checked-correct) item never moves again;
//  - tapping a free item selects it (replacing a selection on the same side);
//  - tapping a free item on the opposite side of the selection makes the pair;
//  - tapping an item that is in an unchecked pair releases that pair and selects the item, so a pair can be changed.
export function tapMatchItem(set, state, side, id) {
  if (!set || state.revealed || !known(set, side, id)) return state;
  const next = clone(state);
  const settled = side === 'word' ? Boolean(next.settled[id]) : Object.values(next.settled).includes(id);
  if (settled) return next;
  const pairedWord = side === 'word' ? (next.pairs[id] ? id : null) : (Object.keys(next.pairs).find(word => next.pairs[word] === id) ?? null);
  if (pairedWord) {
    delete next.pairs[pairedWord];
    next.selected = { side, id };
    return next;
  }
  if (next.selected && next.selected.side !== side) {
    const wordId = side === 'word' ? id : next.selected.id;
    const definitionId = side === 'definition' ? id : next.selected.id;
    next.pairs[wordId] = definitionId;
    next.selected = null;
    next.flash.paired = [wordId];
    return next;
  }
  next.selected = next.selected && next.selected.side === side && next.selected.id === id ? null : { side, id };
  return next;
}

// Drag-and-drop pairing: drop a word on a definition (or a definition on a word). Replaces any pairing either item already had.
export function pairMatchItems(set, state, wordId, definitionId) {
  if (!set || state.revealed || !known(set, 'word', wordId) || !known(set, 'definition', definitionId)) return state;
  if (state.settled[wordId] || Object.values(state.settled).includes(definitionId)) return state;
  const next = clone(state);
  for (const word of Object.keys(next.pairs)) if (word === wordId || next.pairs[word] === definitionId) delete next.pairs[word];
  next.pairs[wordId] = definitionId;
  next.selected = null;
  next.flash.paired = [wordId];
  return next;
}

export function isMatchSetComplete(set, state) {
  return Boolean(set) && set.words.every(word => state.pairs[word.id] || state.settled[word.id]);
}
export function matchSetProgress(set, state) {
  const total = set?.words?.length ?? 0;
  const paired = set ? set.words.filter(word => state.pairs[word.id] || state.settled[word.id]).length : 0;
  return { paired, total, remaining:total - paired };
}

// Evaluates the whole set at once. Correct pairs become settled; incorrect pairs are released so they can be matched
// again. `primaryCorrect` is what the existing attempt model records; `allCorrect` is what ends the exercise.
export function checkMatchSet(set, state) {
  if (!set || !isMatchSetComplete(set, state)) return { complete:false, state, results:{}, allCorrect:false, primaryCorrect:false, incorrectCount:0, rawAnswer:null };
  const next = clone(state);
  const results = {};
  for (const word of set.words) {
    if (next.settled[word.id]) { results[word.id] = 'correct'; continue; }
    const chosen = next.pairs[word.id];
    results[word.id] = chosen === set.key[word.id] ? 'correct' : 'incorrect';
  }
  const chosenFor = word => state.settled[word] ?? state.pairs[word];
  const rawAnswer = primaryRawAnswer(set, chosenFor);
  for (const word of set.words) {
    if (results[word.id] === 'correct') { next.settled[word.id] = set.key[word.id]; delete next.pairs[word.id]; next.flash.correct.push(word.id); }
    else { next.flash.incorrectDefinitions.push(next.pairs[word.id]); delete next.pairs[word.id]; next.flash.incorrect.push(word.id); }
  }
  next.selected = null;
  next.checks += 1;
  next.lastCheck = { right:set.words.length - next.flash.incorrect.length, total:set.words.length };
  const incorrectCount = next.flash.incorrect.length;
  return { complete:true, state:next, results, allCorrect:incorrectCount === 0, primaryCorrect:results[set.primaryWordId] === 'correct', incorrectCount, rawAnswer };
}

// The answer string the existing single-answer payload expects for the primary evidence target:
//  - the definition the student attached to the primary word (word → definition).
function primaryRawAnswer(set, chosenFor) {
  const definitionId = chosenFor(set.primaryWordId);
  return set.definitions.find(definition => definition.id === definitionId)?.text ?? null;
}

// Terminal states for the exercise: show the finished set (all pairs correct), or reveal the key after the supported
// retry has also missed the primary pair.
export function revealMatchSet(set, state) {
  const next = clone(state);
  next.settled = { ...set.key }; next.pairs = {}; next.selected = null; next.revealed = true;
  next.flash = { paired:[], correct:[], incorrect:[], incorrectDefinitions:[] };
  return next;
}
export function finishedMatchState(set, state) {
  const next = clone(state);
  next.revealed = true; next.selected = null; next.flash = { paired:[], correct:[], incorrect:[], incorrectDefinitions:[] };
  return next;
}
