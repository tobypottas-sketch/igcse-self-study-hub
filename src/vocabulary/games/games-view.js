// All markup for the Games area. Buttons here use data-game-act (never data-action) so the main controller ignores them.
import { BLITZ, multiplierFor, nextTierAt } from './blitz-engine.js';
import { CONNECTIONS } from './connections-engine.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
export const GAME_LIST = Object.freeze([
  { id: 'blitz', emoji: '⚡', name: 'Word Blitz', kicker: '60 seconds', copy: 'Race the clock. Chain correct answers to build a multiplier.' },
  { id: 'connections', emoji: '🧩', name: 'Connections', kicker: '5 puzzles', copy: 'Clues appear one at a time. Name the Unit 1 word that links them.' }
]);

// `mode` decides which attribute launches a game: the unit screen uses the main controller's data-action, the Games lobby its own.
export function renderGameCards(mode = 'unit') {
  return `<div class="gm-cards">${GAME_LIST.map(game => `<button type="button" class="gm-card" data-game-card="${game.id}" ${mode === 'unit' ? `data-action="open-game" data-game="${game.id}"` : `data-game-act="open" data-game="${game.id}"`}><span class="gm-card__emoji" aria-hidden="true">${game.emoji}</span><span class="gm-card__body"><span class="gm-card__kicker">${esc(game.kicker)}</span><strong>${esc(game.name)}</strong><span class="gm-card__copy">${esc(game.copy)}</span></span><span class="gm-card__play" aria-hidden="true">Play →</span></button>`).join('')}</div>`;
}
// The temporary Unit 1 entry: one self-contained section, easy to delete.
export function renderGamesEntry() {
  return `<section class="gm-entry" data-games-entry aria-labelledby="gmEntryTitle"><div class="gm-entry__head"><h2 id="gmEntryTitle">Bonus Games</h2><p>Practise your Unit 1 vocabulary in a different way.</p><p class="gm-fine">Games don’t affect your pathway progress.</p></div>${renderGameCards('unit')}</section>`;
}

const topbar = (backLabel, backAct, right = '') => `<header class="vocab-topbar vocab-topbar--unit gm-top"><button type="button" class="vocab-back vocab-back--chip" data-game-act="${backAct}"><span class="vocab-back__arrow" aria-hidden="true">←</span> ${esc(backLabel)}</button>${right}</header>`;

export function renderLobby() {
  return `<main class="vocab-shell gm-shell" data-games-lobby>${topbar('Unit 1', 'exit-unit', '<div class="vocab-unit-id"><span class="vocab-unit-id__badge">Games</span><strong class="vocab-unit-id__title">Bonus practice</strong></div>')}<section class="gm-entry gm-entry--lobby"><div class="gm-entry__head"><h1>Bonus Games</h1><p>Practise your Unit 1 vocabulary in a different way.</p></div>${renderGameCards('lobby')}</section></main>`;
}

// ---------------------------------------------------------------- Word Blitz
export function renderBlitzIntro(best) {
  return `<main class="vocab-shell gm-shell gm-shell--blitz" data-game="blitz" data-phase="intro">${topbar('Games', 'lobby')}<section class="gm-panel gm-panel--dark gm-intro"><p class="gm-tag gm-tag--gold">⚡ Word Blitz</p><h1>60 seconds. How many can you get?</h1><ul class="gm-rules"><li><b>${BLITZ.base}</b> points for each correct answer</li><li>Every <b>3</b> correct in a row lifts your multiplier: <b>x2</b> at 3, <b>x3</b> at 6, <b>x4</b> at 10</li><li>A wrong answer resets the streak, but the clock keeps going.</li></ul>${best ? `<p class="gm-best">Best this visit: <strong>${esc(best)}</strong></p>` : ''}<button type="button" class="gm-go" data-game-act="blitz-start" autofocus>Start</button><p class="gm-hint">Tip: press 1–4 on a keyboard.</p></section></main>`;
}
export function renderBlitzPlay(state) {
  const secs = Math.ceil(BLITZ.durationMs / 1000);
  return `<main class="vocab-shell gm-shell gm-shell--blitz" data-game="blitz" data-phase="play"><header class="gm-hud"><button type="button" class="gm-quit" data-game-act="lobby" aria-label="Quit to Games">✕</button><div class="gm-clock"><span class="gm-clock__num" data-blitz-time>${secs}</span><i class="gm-clock__track" role="presentation"><b data-blitz-bar style="width:100%"></b></i></div><div class="gm-scorebox"><strong data-blitz-score>${esc(state.score)}</strong><span>points</span></div></header><section class="gm-arena"><div class="gm-combo" data-blitz-combo><span class="gm-mult" data-blitz-mult>x1</span><span class="gm-streak" data-blitz-streak>Streak 0</span><i class="gm-combo__track" role="presentation"><b data-blitz-tier style="width:0%"></b></i></div><div data-blitz-q>${renderBlitzQuestion(state.question)}</div><p class="gm-pop" data-blitz-pop aria-hidden="true"></p></section><p class="vocab-sr-only" aria-live="polite" data-blitz-live></p></main>`;
}
export function renderBlitzQuestion(q) {
  if (!q) return '';
  return `<div class="gm-prompt" data-type="${esc(q.type)}"><p class="gm-prompt__label">${esc(q.label)}</p><p class="gm-prompt__text">${q.type === 'para' ? `“${esc(q.prompt)}”` : esc(q.prompt)}</p></div><div class="gm-options" role="group" aria-label="Answers">${q.options.map((option, index) => `<button type="button" class="gm-option" data-game-act="blitz-answer" data-index="${index}"><kbd aria-hidden="true">${index + 1}</kbd><span>${esc(option)}</span></button>`).join('')}</div>`;
}
export function comboView(streak) {
  const next = nextTierAt(streak); const from = [...BLITZ.tiers].reverse().find(([at]) => streak >= at)[0];
  return { mult: `x${multiplierFor(streak)}`, streak: streak ? `Streak ${streak}` : 'Streak 0', tier: next == null ? 100 : Math.round(((streak - from) / (next - from)) * 100) };
}
export function renderBlitzOver(sum, isBest, best) {
  const missed = (sum.missed ?? []).length ? `<section class="gm-missed" aria-label="Worth another look"><p class="gm-missed__head">Worth another look</p><ul>${sum.missed.map(m => `<li><strong>${esc(m.term)}</strong><span>${esc(m.meaning)}</span></li>`).join('')}</ul></section>` : '';
  const burst = Array.from({ length: 16 }, (_, i) => `<i style="--a:${Math.round(i * 360 / 16)}deg;--d:${i % 2 ? 70 : 96}px"></i>`).join('');
  return `<main class="vocab-shell gm-shell gm-shell--blitz" data-game="blitz" data-phase="over" data-rating="${esc(sum.rating)}"${isBest ? ' data-best' : ''}>${topbar('Games', 'lobby')}<section class="gm-panel gm-panel--dark gm-over gm-over--blitz"><div class="gm-medal" aria-hidden="true"><span class="gm-medal__hex"></span><span class="gm-medal__x">x${esc(sum.topMultiplier ?? 1)}</span>${isBest ? `<span class="gm-burst">${burst}</span>` : ''}</div><p class="gm-tag gm-tag--gold">Time’s up</p><h1 class="gm-rating">${esc(sum.rating)}</h1><p class="gm-bigscore"><span data-final-score data-target="${esc(sum.score)}">${esc(sum.score)}</span><small>points</small></p>${isBest ? '<p class="gm-pb">New best this visit</p>' : best ? `<p class="gm-best">Best this visit: <strong>${esc(best)}</strong></p>` : ''}<dl class="gm-stats"><div><dt>Correct</dt><dd>${esc(sum.correct)}</dd></div><div><dt>Accuracy</dt><dd>${esc(sum.accuracy)}%</dd></div><div><dt>Best streak</dt><dd>${esc(sum.bestStreak)}</dd></div><div><dt>Top multiplier</dt><dd>x${esc(sum.topMultiplier ?? 1)}</dd></div></dl>${missed}<div class="gm-actions"><button type="button" class="gm-go" data-game-act="blitz-again" autofocus>Play again</button><button type="button" class="gm-ghost" data-game-act="lobby">Back to Games</button></div></section></main>`;
}

// ---------------------------------------------------------------- Connections
export function renderConnectionsIntro() {
  return `<main class="vocab-shell gm-shell gm-shell--cx" data-game="connections" data-phase="intro">${topbar('Games', 'lobby')}<section class="gm-panel gm-intro"><p class="gm-tag">🧩 Connections</p><h1>What links the clues?</h1><ul class="gm-rules"><li>Each puzzle hides one <b>Unit 1 word</b>. You start with one clue.</li><li>Solve it now for <b>${CONNECTIONS.points[0]}</b> points, or reveal another clue. Each extra clue is worth <b>100</b> less (${CONNECTIONS.points.join(' → ')}).</li><li>Wrong guesses are free and never end the puzzle.</li></ul><button type="button" class="gm-go gm-go--teal" data-game-act="cx-start" autofocus>Start</button></section></main>`;
}
const KIND = { association: 'Association', context: 'In context', synonym: 'Similar word', meaning: 'Meaning' };
export function renderConnectionsPlay(engine) {
  const s = engine.state; const p = engine.puzzle(); const phase = s.phase; const done = phase !== 'guessing';
  const shown = done ? p.clues.length : s.revealed;
  const clues = p.clues.map((c, i) => i < shown ? `<li class="gm-clue" data-clue="${i + 1}"${i === shown - 1 && !done ? ' data-new' : ''}><span class="gm-clue__n">${i + 1}</span><span class="gm-clue__text">${esc(c.text)}</span>${done ? `<em>${esc(KIND[c.kind] ?? '')}</em>` : ''}</li>` : `<li class="gm-clue gm-clue--hidden" aria-hidden="true"><span class="gm-clue__n">${i + 1}</span><span class="gm-clue__text">?</span></li>`).join('');
  const pips = Array.from({ length: p.clues.length }, (_, i) => `<i class="gm-pip${i < s.revealed ? ' is-open' : ''}"></i>`).join('');
  const last = s.results[s.results.length - 1];
  let panel;
  if (phase === 'guessing') {
    const wrong = s.wrong.length ? `<p class="gm-wrong" role="status">Not ${s.wrong.map(w => `“${esc(w)}”`).join(', ')}. Try again${engine.canReveal() ? ', or reveal another clue' : ''}.</p>` : '';
    panel = `<div class="gm-worth"><span>Worth</span><strong data-cx-worth>${engine.potential()}</strong><span>points</span><i class="gm-pips" aria-hidden="true">${pips}</i></div><form class="gm-guess" data-cx-form autocomplete="off"><label class="vocab-sr-only" for="cxGuess">Your guess</label><input id="cxGuess" name="guess" type="text" inputmode="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" data-lpignore="true" data-1p-ignore placeholder="Type the Unit 1 word" enterkeyhint="go"><button type="submit" class="gm-go gm-go--teal">Guess</button></form><ul class="gm-suggest" data-cx-suggest></ul>${wrong}<div class="gm-row">${engine.canReveal() ? `<button type="button" class="gm-ghost" data-game-act="cx-reveal">Reveal clue ${s.revealed + 1} <small>−100</small></button>` : ''}${engine.canGiveUp() ? '<button type="button" class="gm-ghost" data-game-act="cx-giveup">Show the answer <small>0</small></button>' : ''}</div>`;
  } else {
    const solved = phase === 'solved'; const lastPuzzle = s.index + 1 >= s.puzzles.length;
    panel = `<div class="gm-result gm-result--${solved ? 'ok' : 'miss'}" role="status"><p class="gm-result__head">${solved ? `✓ ${esc(p.target)}` : `The answer was ${esc(p.target)}`}<strong>${solved ? `+${last.points}` : '+0'}</strong></p><p class="gm-result__why">${esc(p.why)}</p></div><button type="button" class="gm-go gm-go--teal" data-game-act="cx-next" autofocus>${lastPuzzle ? 'See results' : 'Next puzzle'}</button>`;
  }
  return `<main class="vocab-shell gm-shell gm-shell--cx" data-game="connections" data-phase="play" data-state="${phase}"><header class="gm-hud gm-hud--light"><button type="button" class="gm-quit" data-game-act="lobby" aria-label="Quit to Games">✕</button><div class="gm-progress">Puzzle <strong>${s.index + 1}</strong> of ${s.puzzles.length}</div><div class="gm-scorebox"><strong data-cx-score>${esc(s.score)}</strong><span>points</span></div></header><section class="gm-panel gm-cx"><p class="gm-cx__q">Which Unit 1 word connects these?</p><ol class="gm-clues">${clues}</ol>${panel}</section></main>`;
}
export function renderConnectionsOver(sum) {
  return `<main class="vocab-shell gm-shell gm-shell--cx" data-game="connections" data-phase="over">${topbar('Games', 'lobby')}<section class="gm-panel gm-over"><h1 class="gm-rating gm-rating--light">Puzzles complete</h1><p class="gm-bigscore"><span data-final-score>${esc(sum.score)}</span><small>points</small></p><dl class="gm-stats"><div><dt>Solved</dt><dd>${esc(sum.solved)} / ${esc(sum.total)}</dd></div><div><dt>Average clues used</dt><dd>${esc(sum.avgClues)}</dd></div></dl><div class="gm-actions"><button type="button" class="gm-go gm-go--teal" data-game-act="cx-again" autofocus>Play again</button><button type="button" class="gm-ghost" data-game-act="lobby">Back to Games</button></div></section></main>`;
}
