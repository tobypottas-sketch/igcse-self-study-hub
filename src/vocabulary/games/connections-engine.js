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
// Word-shape scaffold, always derived from the canonical target (never from an accepted alias). Free: no scoring effect.
// Meaning first, spelling support later: length from clue 1; the first 2 letters from clue 3; the first 3 letters as a masked pattern at clue 4 ("STR_____").
// The prefix is the first letters of the canonical target read across its words ("leisure time" -> LE, then LEI____ ____); a hyphen or space stays visible.
export const PREFIX_AT = Object.freeze({ 3: 2, 4: 3 });
export const PATTERN_AT = 4;
export const prefixLengthFor = (revealed, letters) => Math.min(Math.max(0, letters - 1), Object.entries(PREFIX_AT).reduce((n, [clue, length]) => (revealed >= Number(clue) ? length : n), 0));
export const wordShape = (puzzle, revealed = 1) => {
  const words = normaliseGuess(puzzle.target).split(' ').filter(Boolean); const lengths = words.map(w => w.length); const total = lengths.reduce((a, b) => a + b, 0);
  const label = words.length > 1 ? `${words.length} words · ${lengths.join(' + ')} letters` : `${total} letters`;
  const prefixLength = prefixLengthFor(revealed, total);
  const letters = words.join('').toUpperCase(); const prefix = prefixLength ? letters.slice(0, prefixLength) : null;
  // Masked pattern keeps the target's own separators (space or hyphen); letters beyond the prefix are underscores.
  let seen = 0; const pattern = prefixLength && revealed >= PATTERN_AT
    ? [...String(puzzle.target).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()].map(ch => (/[a-z]/.test(ch) ? (seen++ < prefixLength ? ch.toUpperCase() : '_') : (/[-‐-―]/.test(ch) ? '-' : /\s/.test(ch) ? ' ' : '')))
      .join('').replace(/\s+/g, ' ').trim()
    : null;
  return { words: words.length, lengths, letters: total, label, prefixLength, prefix, pattern, firstLetter: prefixLength ? letters[0] : null };
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
