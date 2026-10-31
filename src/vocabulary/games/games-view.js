// All markup for the Games area. Buttons here use data-game-act (never data-action) so the main controller ignores them.
import { BLITZ, multiplierFor, nextTierAt } from './blitz-engine.js';
import { CONNECTIONS, wordShape } from './connections-engine.js';
import { availableGames } from './games-data.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
export const GAME_LIST = Object.freeze([
  { id: 'blitz', emoji: '⚡', name: 'Word Blitz', kicker: '60 seconds', copy: 'Race the clock. Chain correct answers to build a multiplier.' },
  { id: 'connections', emoji: '🧩', name: 'Connections', kicker: '5 puzzles', copy: 'Clues appear one at a time. Name the word that links them.' }
]);

// `mode` decides which attribute launches a game: the unit screen uses the main controller's data-action, the Games lobby its own.
export function renderGameCards(mode = 'unit', ids = GAME_LIST.map(game => game.id)) {
  return `<div class="gm-cards">${GAME_LIST.filter(game => ids.includes(game.id)).map(game => `<button type="button" class="gm-card" data-game-card="${game.id}" ${mode === 'unit' ? `data-action="open-game" data-game="${game.id}"` : `data-game-act="open" data-game="${game.id}"`}><span class="gm-card__emoji" aria-hidden="true">${game.emoji}</span><span class="gm-card__body"><span class="gm-card__kicker">${esc(game.kicker)}</span><strong>${esc(game.name)}</strong><span class="gm-card__copy">${esc(game.copy)}</span></span><span class="gm-card__play" aria-hidden="true">Play →</span></button>`).join('')}</div>`;
}
// The Games entry on a unit screen: one self-contained section. A unit with no authored games gets none (empty string).
export function renderGamesEntry(unitNumber = 1) {
  const ids = availableGames(unitNumber);
  if (!ids.length) return '';
  return `<section class="gm-entry" data-games-entry aria-labelledby="gmEntryTitle"><div class="gm-entry__head"><h2 id="gmEntryTitle">Bonus Games</h2><p>Practise your Unit ${esc(unitNumber)} vocabulary in a different way.</p><p class="gm-fine">Games don’t affect your pathway progress.</p></div>${renderGameCards('unit', ids)}</section>`;
}

const topbar = (backLabel, backAct, right = '') => `<header class="vocab-topbar vocab-topbar--unit gm-top"><button type="button" class="vocab-back vocab-back--chip" data-game-act="${backAct}"><span class="vocab-back__arrow" aria-hidden="true">←</span> ${esc(backLabel)}</button>${right}</header>`;

export function renderLobby(unitNumber = 1) {
  const ids = availableGames(unitNumber);
  const cards = ids.length ? renderGameCards('lobby', ids) : '<p class="gm-fine" data-games-unavailable>Games are not available for this unit yet.</p>';
  return `<main class="vocab-shell gm-shell" data-games-lobby>${topbar(`Unit ${unitNumber}`, 'exit-unit', '<div class="vocab-unit-id"><span class="vocab-unit-id__badge">Games</span><strong class="vocab-unit-id__title">Bonus practice</strong></div>')}<section class="gm-entry gm-entry--lobby"><div class="gm-entry__head"><h1>Bonus Games</h1><p>Practise your Unit ${esc(unitNumber)} vocabulary in a different way.</p></div>${cards}</section></main>`;
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
export function renderConnectionsIntro(unitNumber = 1) {
  // Same three rules, same wording and values; the points run is shown as steps and the reassurance as a quiet note.
  const steps = CONNECTIONS.points.map((points, index) => `<b class="gm-steps__chip" data-step="${index}">${points}</b>`).join('<span class="gm-steps__arrow" aria-hidden="true">→</span>');
  const shield = '<svg class="gm-rules__icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/><path d="M9 12l2.2 2.2L15.5 10"/></svg>';
  const go = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  return `<main class="vocab-shell gm-shell gm-shell--cx" data-game="connections" data-phase="intro">${topbar('Games', 'lobby')}<section class="gm-panel gm-intro gm-intro--cx"><div class="gm-intro__head"><span class="gm-cx__badge" aria-hidden="true">?</span><div class="gm-intro__title"><p class="gm-tag">🧩 Connections</p><h1>What links the clues?</h1></div></div><div class="gm-intro__body"><ul class="gm-rules"><li>Each puzzle hides one <b>Unit ${esc(unitNumber)} word</b>. You start with one clue.</li><li>Solve it now for <b>${CONNECTIONS.points[0]}</b> points, or reveal another clue. Each extra clue is worth <b>100</b> less. <span class="gm-steps" role="img" aria-label="${CONNECTIONS.points.join(', ')}">${steps}</span></li><li class="gm-rules__note">${shield}<span>Wrong guesses are free and never end the puzzle.</span></li></ul><button type="button" class="gm-go gm-go--teal" data-game-act="cx-start" autofocus><span>Start</span>${go}</button></div></section></main>`;
}
const NUDGES = [
  e => e.canReveal() ? 'Good thinking — try another clue.' : 'Good thinking — you’re getting closer.',
  e => e.canReveal() ? 'You’re getting closer. One more clue should help.' : 'You’re getting closer.',
  e => e.canReveal() ? 'Nearly there — use the next clue if you need it.' : 'Nearly there — pick from the three words if you like.',
  e => e.canHelp() ? 'Nearly there — “Need help?” gives you three words to choose from.' : 'Nearly there. Take your time.'
];
const KIND = { situation: 'Situation', association: 'Association', context: 'In context', synonym: 'Similar word', meaning: 'Meaning', plain: 'In plain English' };
const LOCK = '<svg class="gm-clue__lock" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
// Chrome files typed values under the field's name and offers them back as history. A fixed name ("guess") made earlier answers reappear under the box, so every render gets a fresh opaque name
// and nothing is ever remembered against it. The controller reads the field by id, so the name carries no meaning.
let guessFieldSeq = 0;
const guessFieldName = () => { guessFieldSeq += 1; return `cx${guessFieldSeq.toString(36)}${Math.random().toString(36).slice(2, 8)}`; };
export function renderConnectionsPlay(engine, unitNumber = 1) {
  const s = engine.state; const p = engine.puzzle(); const phase = s.phase; const done = phase !== 'guessing';
  const shown = done ? p.clues.length : s.revealed;
  const stateOf = i => (done ? 'done' : i === shown - 1 ? 'current' : 'past');
  const clues = p.clues.map((c, i) => i < shown ? (`<li class="gm-clue" data-clue="${i + 1}" data-state="${stateOf(i)}"${i === shown - 1 && !done ? ' data-new' : ''}><span class="gm-clue__n">${i + 1}</span><span class="gm-clue__text">${esc(c.text)}</span>${done ? `<em>${esc(KIND[c.kind] ?? '')}</em>` : ''}</li>`) : `<li class="gm-clue gm-clue--hidden" data-state="locked" aria-hidden="true"><span class="gm-clue__n">${i + 1}</span><span class="gm-clue__text">?</span>${LOCK}</li>`).join('');
  const steps = [...CONNECTIONS.points, CONNECTIONS.helpPoints]; const nowAt = s.helpOn ? steps.length - 1 : s.revealed - 1;
  const ladder = steps.map((pt, i) => `<li class="${i < nowAt ? 'is-spent' : i === nowAt ? 'is-now' : 'is-next'}">${pt}</li>`).join('');
  const track = s.puzzles.map((_, j) => `<i class="${j < s.index ? (s.results[j]?.solved ? 'is-solved' : 'is-missed') : j === s.index ? 'is-now' : 'is-next'}"></i>`).join('');
  const last = s.results[s.results.length - 1];
  const shape = wordShape(p, shown);
  const shapeHtml = phase === 'guessing' ? `<p class="gm-shape" data-cx-shape data-stage="${shape.stage}">${shape.wordClass ? `<span class="gm-shape__class" data-cx-class>${esc(shape.wordClass)}</span>` : ''}<span class="gm-shape__len" data-cx-length>${esc(shape.lengthLabel)}</span>${shape.pattern ? `<span class="gm-shape__first gm-shape__pattern" data-cx-first data-cx-pattern aria-label="Spelling pattern: ${esc([...shape.pattern].map(ch => (ch === '_' ? 'blank' : ch === ' ' ? 'space' : ch)).join(', '))}"><b aria-hidden="true">${esc(shape.pattern)}</b></span>` : `<span class="gm-shape__first" data-cx-first aria-label="Starts with ${esc(shape.firstLetter)}"><b aria-hidden="true">${esc(shape.firstLetter)}…</b></span>`}</p>` : '';
  let panel;
  if (phase === 'guessing') {
    const total = s.wrong.length + s.choiceWrong.length;
    const wrong = total ? `<p class="gm-nudge" role="status">${esc(NUDGES[(total - 1) % NUDGES.length](engine))}</p>` : '';
    const choices = s.helpOn ? `<div class="gm-choices" data-cx-choices role="group" aria-label="Choose the answer">${s.choices.map(t => `<button type="button" class="gm-choice" data-game-act="cx-choice" data-term="${esc(t)}"${s.choiceWrong.includes(t) ? ' disabled data-tried' : ''}>${esc(t)}</button>`).join('')}</div>` : '';
    panel = `<div class="gm-answer"><div class="gm-worth"><span>Worth</span><strong data-cx-worth>${engine.potential()}</strong><span>points</span><ol class="gm-ladder" aria-hidden="true">${ladder}</ol></div><form class="gm-guess" data-cx-form autocomplete="off"><label class="vocab-sr-only" for="cxGuess">Your guess</label><input id="cxGuess" name="${esc(guessFieldName())}" type="text" inputmode="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" data-lpignore="true" data-1p-ignore placeholder="Type the Unit ${esc(unitNumber)} word" enterkeyhint="go"><button type="submit" class="gm-go gm-go--teal">Guess</button></form>${wrong}${choices}</div><div class="gm-row gm-row--actions">${engine.canReveal() ? `<button type="button" class="gm-ghost gm-act gm-act--next" data-game-act="cx-reveal">Show next clue</button>` : ''}${engine.canHelp() ? '<button type="button" class="gm-ghost gm-ghost--help gm-act gm-act--help" data-game-act="cx-help">Need help?</button>' : ''}${engine.canGiveUp() ? '<button type="button" class="gm-ghost gm-act gm-act--giveup" data-game-act="cx-giveup">Show the answer</button>' : ''}</div>`;
  } else {
    const solved = phase === 'solved'; const lastPuzzle = s.index + 1 >= s.puzzles.length;
    panel = `<div class="gm-result gm-result--${solved ? 'ok' : 'miss'}" role="status"><p class="gm-result__head"><span class="gm-result__icon" aria-hidden="true">${solved ? '✓' : '→'}</span><span class="gm-result__word">${solved ? esc(p.target) : `The answer was ${esc(p.target)}`}</span><strong>${solved ? `+${last.points}` : '+0'}</strong></p><p class="gm-result__why">${esc(p.why)}</p></div><button type="button" class="gm-go gm-go--teal" data-game-act="cx-next" autofocus>${lastPuzzle ? 'See results' : 'Next puzzle'}</button>`;
  }
  return `<main class="vocab-shell gm-shell gm-shell--cx" data-game="connections" data-phase="play" data-state="${phase}"><header class="gm-hud gm-hud--light"><button type="button" class="gm-quit" data-game-act="lobby" aria-label="Quit to Games">✕</button><div class="gm-progress"><span>Puzzle <strong>${s.index + 1}</strong> of ${s.puzzles.length}</span><i class="gm-cx-track" aria-hidden="true">${track}</i></div><div class="gm-scorebox"><strong data-cx-score>${esc(s.score)}</strong><span>points</span></div></header><section class="gm-panel gm-cx"><div class="gm-cx__head"><span class="gm-cx__badge" aria-hidden="true">?</span><div class="gm-cx__title"><p class="gm-cx__q">Which Unit ${esc(unitNumber)} word connects these?</p>${shapeHtml}</div></div><ol class="gm-clues">${clues}</ol>${panel}</section></main>`;
}
export function renderConnectionsOver(sum) {
  return `<main class="vocab-shell gm-shell gm-shell--cx" data-game="connections" data-phase="over">${topbar('Games', 'lobby')}<section class="gm-panel gm-over"><h1 class="gm-rating gm-rating--light">Puzzles complete</h1><p class="gm-bigscore"><span data-final-score>${esc(sum.score)}</span><small>points</small></p><dl class="gm-stats"><div><dt>Solved</dt><dd>${esc(sum.solved)} / ${esc(sum.total)}</dd></div><div><dt>Average clues used</dt><dd>${esc(sum.avgClues)}</dd></div></dl><div class="gm-actions"><button type="button" class="gm-go gm-go--teal" data-game-act="cx-again" autofocus>Play again</button><button type="button" class="gm-ghost" data-game-act="lobby">Back to Games</button></div></section></main>`;
}
