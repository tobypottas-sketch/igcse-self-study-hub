import { leastRecentFirst } from './games-history.js';
// Connections rules as a small pure state machine over the curated puzzles. No storage, network or progression.
// Scoring: solving at clue 1 = 500, clue 2 = 400, clue 3 = 300, clue 4 = 200; using the 3-choice "Need help?" step = 100; revealing the answer = 0. Wrong guesses never end a puzzle and never cost points.
export const CONNECTIONS = Object.freeze({ puzzleCount: 5, clues: 4, points: Object.freeze([500, 400, 300, 200]), helpPoints: 100 });

const shuffle = (list, rng) => { const a = list.slice(); for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// One normal form for typed answers and for the stored target/aliases: lower case, accents folded, only letters/space/hyphen, single spaces,
// and a hyphen or space compare the same ("goal oriented" = "goal-oriented").
export const normaliseGuess = text => String(text ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[-‐-―]/g, ' ').replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim();
// With a `history` (games-history.js): puzzles never seen come first, then the least recently seen, so the previous round's five are chosen again only
// when the bank is too small to avoid it. The five are then shuffled so the order is never predictable. Without a history it is a plain random pick.
export function pickPuzzles(all, rng = Math.random, count = CONNECTIONS.puzzleCount, history = null) {
  if (!history) return shuffle(all, rng).slice(0, count);
  history.cxRound += 1;
  const picked = shuffle(leastRecentFirst(shuffle(all, rng), p => history.cxSeen.get(p.target) ?? 0).slice(0, count), rng);
  for (const p of picked) history.cxSeen.set(p.target, history.cxRound);
  return picked;
}
// Word-shape scaffold (Connections v2). It is derived ONLY from the canonical target and from how many clues are showing: what the student types never
// changes it, and an accepted alias never changes it. Free: no scoring effect. The word class (from the unit's own item metadata) is shown with the length.
//   clue 1  word class · length · first letter                      "NOUN · 10 letters · P…"
//   clue 2  a stronger prefix: first 2 letters (4–5 letter targets) or first 3 (6+)        "PER_______"
//   clue 3  that prefix plus ONE deterministic internal letter                                "PER____I__"
//   clue 4  a stronger, still incomplete pattern (more internal letters)                      "PER_I_TE__"
// Letters are counted across the words of the canonical target ("leisure time" -> LEI____ _I__); spaces and hyphens stay visible. At least 2 letters stay hidden
// at clue 3 and at least 3 at clue 4 (when the target is long enough), so a short word is never effectively given away and the pattern is never "all but one".
export const PREFIX_SHORT = 2;   // targets of 4–5 letters
export const PREFIX_LONG = 3;    // targets of 6+ letters
// Letters that must stay hidden at each stage. Clue 4 keeps 3 hidden, or 2 for 7-letter words so that they still gain one letter over clue 3 (4-6 letter words never go past clue 3's pattern).
export const MIN_HIDDEN = Object.freeze({ 3: 2, 4: 3 });
const hiddenAt4 = n => (n === 7 ? 2 : MIN_HIDDEN[4]);
const foldTarget = target => String(target ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const prefixLengthFor = letters => (letters <= 3 ? 1 : letters <= 5 ? PREFIX_SHORT : PREFIX_LONG);
// Which letter positions (0-based, across the target's letters) are visible at each clue. Pure and deterministic: a function of the letter count only.
export function revealedIndices(letters, revealed = 1) {
  const n = Math.max(0, letters); if (!n) return [];
  if (revealed <= 1) return [0];
  const prefix = Math.min(prefixLengthFor(n), Math.max(1, n - 2)); const shown = Array.from({ length: prefix }, (_, i) => i);
  if (revealed === 2) return shown;
  // Clue 3: one internal letter, a little past the middle of the hidden part (PER____I__), never the last letter, and always leaving MIN_HIDDEN[3] letters hidden.
  const room3 = n - MIN_HIDDEN[3] - prefix;
  const internal = room3 >= 1 ? Math.min(prefix + Math.floor((n - prefix) / 2) + 1, n - 2) : null;
  if (internal != null) shown.push(internal);
  if (revealed === 3) return shown;
  // Clue 4: more internal letters (about 55% of the word visible), spread out from just after the prefix, never the last letter, leaving MIN_HIDDEN[4] letters hidden.
  const goal = Math.min(Math.max(Math.ceil(n * 0.55), n === 7 ? 5 : 0), n - hiddenAt4(n));
  const candidates = []; for (let i = prefix; i <= n - 2; i += 1) if (!shown.includes(i)) candidates.push(i);
  const ordered = [...candidates.filter(i => (i - prefix) % 2 === 0), ...candidates.filter(i => (i - prefix) % 2 === 1)];
  for (const i of ordered) { if (shown.length >= goal) break; shown.push(i); }
  return shown.sort((x, y) => x - y);
}
const CLASS_LABEL = Object.freeze({ noun: 'NOUN', verb: 'VERB', adjective: 'ADJECTIVE', adverb: 'ADVERB' });
export const wordClassLabel = (partOfSpeech, words = 1) => {
  const pos = String(partOfSpeech ?? '').trim().toLowerCase(); if (!pos) return null;
  return pos === 'noun' && words > 1 ? 'NOUN PHRASE' : (CLASS_LABEL[pos] ?? pos.toUpperCase());
};
export const wordShape = (puzzle, revealed = 1) => {
  const words = normaliseGuess(puzzle.target).split(' ').filter(Boolean); const lengths = words.map(w => w.length); const total = lengths.reduce((a, b) => a + b, 0);
  const lengthLabel = words.length > 1 ? `${words.length} words · ${lengths.join(' + ')} letters` : `${total} letters`;
  const wordClass = wordClassLabel(puzzle.wordClass, words.length);
  const letters = words.join('').toUpperCase(); const visible = new Set(revealedIndices(total, revealed));
  const prefixLength = revealed >= 2 ? Math.min(prefixLengthFor(total), Math.max(1, total - 2)) : 1;
  // The masked pattern keeps the target's own separators (space or hyphen); letters that are not visible are underscores.
  let seen = 0; const masked = [...foldTarget(puzzle.target)].map(ch => (/[a-z]/.test(ch) ? (visible.has(seen++) ? ch.toUpperCase() : '_') : (/[-‐-―]/.test(ch) ? '-' : /\s/.test(ch) ? ' ' : ''))).join('').replace(/\s+/g, ' ').trim();
  return {
    words: words.length, lengths, letters: total, lengthLabel, wordClass,
    label: [wordClass, lengthLabel].filter(Boolean).join(' · '),
    firstLetter: letters[0] ?? null, prefixLength, prefix: revealed >= 2 ? letters.slice(0, prefixLength) : null,
    pattern: revealed >= 2 ? masked : null, shownCount: visible.size, stage: Math.min(4, Math.max(1, revealed))
  };
};
// The word class comes from the unit's own item metadata (the content loaded for the unit), never from a guess: items is [{ term, partOfSpeech }].
export const withWordClasses = (puzzles, items = []) => {
  const byTerm = new Map((items ?? []).map(item => [normaliseGuess(item.term), item.partOfSpeech]));
  return puzzles.map(p => (p.wordClass ? p : { ...p, wordClass: byTerm.get(normaliseGuess(p.target)) ?? null }));
};
export const acceptedForms = puzzle => new Set([puzzle.target, ...(puzzle.accept ?? [])].map(normaliseGuess));

export function createConnections({ puzzles }) {
  const s = { status: 'playing', index: 0, revealed: 1, wrong: [], helpOn: false, choices: [], choiceWrong: [], score: 0, results: [], puzzles, phase: 'guessing' };   // phase: guessing | solved | gaveUp
  const puzzle = () => s.puzzles[s.index];
  const potential = () => s.helpOn ? CONNECTIONS.helpPoints : CONNECTIONS.points[Math.min(s.revealed, puzzle().clues.length) - 1] ?? 0;
  const settle = (solved, points) => { s.results.push({ target: puzzle().target, solved, points, clues: s.revealed, wrong: s.wrong.length + s.choiceWrong.length, help: s.helpOn }); s.score += points; s.phase = solved ? 'solved' : 'gaveUp'; };
  return {
    state: s, puzzle, potential,
    canReveal: () => s.phase === 'guessing' && s.revealed < puzzle().clues.length,
    canHelp: () => s.phase === 'guessing' && !s.helpOn && s.revealed >= puzzle().clues.length,
    // "Need help?": three Unit 1 words (the answer plus two curated distractors) in a stable, answer-not-first order. Worth 100; wrong picks cost nothing.
    help() {
      if (!this.canHelp()) return false;
      const p = puzzle(); const options = [p.target, ...(p.help ?? [])]; const shift = (s.index + 1) % options.length;
      s.choices = options.slice(shift).concat(options.slice(0, shift)); s.helpOn = true; return true;
    },
    pick(term) {
      if (s.phase !== 'guessing' || !s.helpOn || !s.choices.includes(term)) return null;
      if (term === puzzle().target) { const points = potential(); settle(true, points); return { correct: true, points }; }
      if (!s.choiceWrong.includes(term)) s.choiceWrong.push(term);
      return { correct: false, potential: potential() };
    },
    canGiveUp: () => s.phase === 'guessing' && s.revealed >= puzzle().clues.length,
    reveal() { if (s.phase !== 'guessing' || s.revealed >= puzzle().clues.length) return false; s.revealed += 1; return true; },
    // `text` is exactly what the student typed. Wrong guesses are kept as typed (so the screen can show what was received) and de-duplicated by normal form.
    guess(text) {
      if (s.phase !== 'guessing') return null;
      const typed = String(text ?? '').trim(); const key = normaliseGuess(typed); if (!key) return null;
      if (acceptedForms(puzzle()).has(key)) { const points = potential(); settle(true, points); return { correct: true, points }; }
      if (!s.wrong.some(w => normaliseGuess(w) === key)) s.wrong.push(typed);
      return { correct: false, potential: potential() };
    },
    giveUp() { if (!this.canGiveUp()) return false; settle(false, 0); return true; },
    next() {
      if (s.phase === 'guessing') return false;
      if (s.index + 1 >= s.puzzles.length) { s.status = 'over'; return true; }
      s.index += 1; s.revealed = 1; s.wrong = []; s.helpOn = false; s.choices = []; s.choiceWrong = []; s.phase = 'guessing'; return true;
    },
    summary() {
      const solved = s.results.filter(r => r.solved).length;
      const clues = s.results.reduce((sum, r) => sum + r.clues, 0);
      return { score: s.score, solved, total: s.puzzles.length, avgClues: s.results.length ? Math.round((clues / s.results.length) * 10) / 10 : 0 };
    }
  };
}
