// PROTOTYPE (throwaway). Connections rules as a small pure state machine over the curated puzzles. No storage, network or progression.
export const CONNECTIONS = Object.freeze({ puzzleCount: 5, maxPoints: 500, clueCost: 100, wrongCost: 50, floor: 50 });

const shuffle = (list, rng) => { const a = list.slice(); for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const normaliseGuess = text => String(text ?? '').toLowerCase().replace(/[^a-z\s-]/g, '').replace(/\s+/g, ' ').trim();
export const pickPuzzles = (all, rng = Math.random, count = CONNECTIONS.puzzleCount) => shuffle(all, rng).slice(0, count);

export function createConnections({ puzzles }) {
  const s = { status: 'playing', index: 0, revealed: 1, wrong: [], score: 0, results: [], puzzles };
  const puzzle = () => s.puzzles[s.index];
  const potential = () => Math.max(CONNECTIONS.floor, CONNECTIONS.maxPoints - CONNECTIONS.clueCost * (s.revealed - 1) - CONNECTIONS.wrongCost * s.wrong.length);
  const settle = (solved, points) => { s.results.push({ target: puzzle().target, solved, points, clues: s.revealed, wrong: s.wrong.length }); s.score += points; s.phase = solved ? 'solved' : 'gaveUp'; };
  s.phase = 'guessing';   // guessing | solved | gaveUp
  return {
    state: s, puzzle, potential,
    canReveal: () => s.phase === 'guessing' && s.revealed < puzzle().clues.length,
    canGiveUp: () => s.phase === 'guessing' && s.revealed >= puzzle().clues.length,
    reveal() { if (s.phase !== 'guessing' || s.revealed >= puzzle().clues.length) return false; s.revealed += 1; return true; },
    guess(text) {
      if (s.phase !== 'guessing') return null;
      const guess = normaliseGuess(text); if (!guess) return null;
      const p = puzzle();
      if ([p.target, ...p.accept].includes(guess)) { const points = potential(); settle(true, points); return { correct: true, points }; }
      if (!s.wrong.includes(guess)) s.wrong.push(guess);   // the same wrong guess is never charged twice
      return { correct: false, potential: potential() };
    },
    giveUp() { if (!this.canGiveUp()) return false; settle(false, 0); return true; },
    next() {
      if (s.phase === 'guessing') return false;
      if (s.index + 1 >= s.puzzles.length) { s.status = 'over'; return true; }
      s.index += 1; s.revealed = 1; s.wrong = []; s.phase = 'guessing'; return true;
    },
    summary() {
      const solved = s.results.filter(r => r.solved).length;
      const clues = s.results.reduce((sum, r) => sum + r.clues, 0);
      return { score: s.score, solved, total: s.puzzles.length, avgClues: s.results.length ? Math.round((clues / s.results.length) * 10) / 10 : 0 };
    }
  };
}
