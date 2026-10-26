// One controller for the Games area. It is handed only the loaded Unit 1 content, a root element and an exit callback:
// it never sees the Supabase client, the app state, mission/Set/XP code or storage. Personal best lives in this module's memory only.
import { createBlitz, BLITZ } from './blitz-engine.js';
import { createConnections, pickPuzzles, CONNECTIONS, normaliseGuess } from './connections-engine.js';
import { CONNECTIONS_PUZZLES } from './games-data.js';
import { sharedGameHistory } from './games-history.js';
import { renderLobby, renderBlitzIntro, renderBlitzPlay, renderBlitzQuestion, renderBlitzOver, comboView, renderConnectionsIntro, renderConnectionsPlay, renderConnectionsOver } from './games-view.js';
import { playCue } from '../sound.js';

let bestBlitz = 0;   // in-memory only, gone on reload (deliberate)
export const resetGamesMemory = () => { bestBlitz = 0; };

export function mountGames(root, { content, game = 'lobby', onExit = () => {}, rng = Math.random, puzzles = null, history = sharedGameHistory, now = () => Date.now(), setTimer = setTimeout, clearTimer = clearTimeout, setTick = setInterval, clearTick = clearInterval } = {}) {
  let blitz = null; let cx = null; let tick = null; let advance = null; let popTimer = null; let alive = true;
  const stop = () => { if (tick) clearTick(tick); if (advance) clearTimer(advance); if (popTimer) clearTimer(popTimer); tick = advance = popTimer = null; };
  const q = selector => root.querySelector(selector);
  const focus = selector => { try { q(selector)?.focus?.({ preventScroll: true }); } catch { /* focus is a convenience only */ } };
  // A repaint is a new screen (scroll to the top) unless `keep` says it is the same puzzle changing in place: then the viewport position is restored,
  // because replacing the markup briefly shortens the page and the browser would otherwise clamp the scroll position upwards.
  const paint = (html, keep = false) => {
    const y = globalThis.scrollY ?? 0; const top = root.scrollTop ?? 0; root.innerHTML = html;
    if (keep) { try { globalThis.scrollTo?.({ left: 0, top: y, behavior: 'instant' }); if (root.scrollTop !== undefined) root.scrollTop = top; } catch { /* ignore */ } return; }
    if (typeof root.scrollTo === 'function') try { root.scrollTo(0, 0); } catch { /* ignore */ } try { globalThis.scrollTo?.(0, 0); } catch { /* ignore */ } };

  // ---- Word Blitz
  const setTime = () => {
    if (!blitz) return;
    const left = blitz.remaining(); const time = q('[data-blitz-time]'); const bar = q('[data-blitz-bar]');
    if (time) time.textContent = String(Math.ceil(left / 1000));
    if (bar) bar.style.width = `${Math.max(0, (left / BLITZ.durationMs) * 100)}%`;
    const shell = q('.gm-shell'); if (shell) shell.toggleAttribute('data-urgent', left <= BLITZ.urgentMs && left > 0);
    if (blitz.tick() === 'over') endBlitz();
  };
  const paintCombo = streak => { const v = comboView(streak); const m = q('[data-blitz-mult]'); if (!m) return; m.textContent = v.mult; q('[data-blitz-streak]').textContent = v.streak; q('[data-blitz-tier]').style.width = `${v.tier}%`; q('[data-blitz-combo]').dataset.mult = v.mult; };
  const pop = (text, kind) => { const el = q('[data-blitz-pop]'); if (!el) return; el.textContent = text; el.dataset.kind = kind; el.classList.remove('is-on'); void el.offsetWidth; el.classList.add('is-on'); if (popTimer) clearTimer(popTimer); popTimer = setTimer(() => { el.classList.remove('is-on'); }, 700); };
  const startBlitz = () => {
    stop(); blitz = createBlitz({ content, rng, now, history }); blitz.start();
    paint(renderBlitzPlay(blitz.state)); paintCombo(0); focus('.gm-option'); tick = setTick(setTime, 100);
  };
  const endBlitz = () => {
    stop(); const sum = blitz.summary(); const isBest = sum.score > bestBlitz && sum.score > 0; if (isBest) bestBlitz = sum.score;
    playCue('blitz-finish', { personalBest:isBest });
    paint(renderBlitzOver(sum, isBest, bestBlitz)); focus('[data-game-act="blitz-again"]'); countUp(sum.score);
  };
  // Cosmetic only: the final score is already in the markup; with motion allowed it counts up from 0 over ~0.9s and always lands on the real value.
  const prefersReducedMotion = () => { try { return Boolean(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches); } catch { return false; } };
  const countUp = target => {
    const el = q('[data-final-score]'); if (!el || target <= 0 || prefersReducedMotion() || typeof performance === 'undefined') return;
    const startedAt = performance.now(); el.textContent = '0';
    tick = setTick(() => { const t = Math.min(1, (performance.now() - startedAt) / 900); el.textContent = String(Math.round(target * (1 - (1 - t) ** 3))); if (t >= 1) { clearTick(tick); tick = null; el.textContent = String(target); } }, 30);
  };
  const answerBlitz = index => {
    if (!blitz) return;
    const result = blitz.answer(index); if (!result) return;
    playCue(result.correct ? 'blitz-correct' : 'blitz-wrong', result.correct ? { streak:result.streak, multiplier:result.multiplier } : {});
    const buttons = [...root.querySelectorAll('.gm-option')];
    buttons.forEach((b, i) => { b.disabled = true; if (i === result.correctIndex) b.dataset.state = 'correct'; else if (i === Number(index)) b.dataset.state = 'wrong'; });
    const scoreEl = q('[data-blitz-score]'); scoreEl.textContent = String(blitz.state.score); if (result.correct) { scoreEl.classList.remove('is-punch'); void scoreEl.offsetWidth; scoreEl.classList.add('is-punch'); } paintCombo(result.streak);
    const tierUp = result.correct && [3, 6, 10].includes(result.streak);
    pop(result.correct ? `+${result.points}${tierUp ? (result.multiplier === 2 ? '  x2 streak' : `  x${result.multiplier} combo`) : ''}` : 'Streak reset', result.correct ? 'ok' : 'miss');
    const live = q('[data-blitz-live]'); if (live) live.textContent = result.correct ? `Correct. ${result.points} points.` : `Not quite. The answer was ${result.term}.`;
    advance = setTimer(() => { advance = null; const nextQ = blitz.next(); if (!nextQ) { endBlitz(); return; } const box = q('[data-blitz-q]'); if (box) box.innerHTML = renderBlitzQuestion(nextQ); focus('.gm-option'); }, result.correct ? 380 : 900);
  };

  // ---- Connections
  const suggestFor = typed => {
    const terms = [...new Set((content?.items ?? []).map(item => item.term))]; const t = normaliseGuess(typed);
    return t.length < 2 ? [] : terms.filter(term => term.toLowerCase().startsWith(t)).slice(0, 5);
  };
  const startConnections = () => { stop(); cx = createConnections({ puzzles: puzzles ?? pickPuzzles(CONNECTIONS_PUZZLES, rng, CONNECTIONS.puzzleCount, history) }); showCx(); };
  const showCx = (keep = false, focusOn = null) => { if (cx.state.status === 'over') { paint(renderConnectionsOver(cx.summary())); focus('[data-game-act="cx-again"]'); return; } paint(renderConnectionsPlay(cx), keep); focus(focusOn ?? (cx.state.phase === 'guessing' ? '#cxGuess' : '[data-game-act="cx-next"]')); };
  const submitGuess = text => {
    if (!cx) return; const r = cx.guess(text); if (!r) return;
    if (r.correct) showCx(true); else { showCx(true); const card = q('.gm-guess'); if (card) card.dataset.shake = 'on'; }
  };

  const show = which => {
    stop(); blitz = blitz && which === 'blitz-keep' ? blitz : null;
    if (which === 'lobby') paint(renderLobby());
    else if (which === 'blitz') paint(renderBlitzIntro(bestBlitz));
    else if (which === 'connections') paint(renderConnectionsIntro());
  };

  const onClick = event => {
    const target = event.target?.closest?.('[data-game-act]'); if (!target || !root.contains(target)) return;
    const act = target.dataset.gameAct;
    if (act === 'exit-unit') { destroy(); onExit(); }
    else if (act === 'lobby') show('lobby');
    else if (act === 'open') show(target.dataset.game);
    else if (act === 'blitz-start' || act === 'blitz-again') startBlitz();
    else if (act === 'blitz-answer') answerBlitz(target.dataset.index);
    else if (act === 'cx-start' || act === 'cx-again') startConnections();
    else if (act === 'cx-reveal') { cx.reveal(); showCx(true, cx.canReveal() ? '[data-game-act="cx-reveal"]' : '#cxGuess'); }
    else if (act === 'cx-help') { cx.help(); showCx(true, '[data-cx-choices] .gm-choice'); }
    else if (act === 'cx-choice') { const r = cx.pick(target.dataset.term); if (r) { showCx(true, r.correct ? null : '[data-cx-choices] .gm-choice:not([disabled])'); } }
    else if (act === 'cx-giveup') { cx.giveUp(); showCx(true); }
    else if (act === 'cx-next') { cx.next(); showCx(); }
    else if (act === 'suggest') { const input = q('#cxGuess'); if (input) { input.value = target.dataset.term; input.focus?.(); } }
  };
  const onSubmit = event => { if (!event.target?.matches?.('[data-cx-form]')) return; event.preventDefault?.(); submitGuess(event.target.elements?.guess?.value ?? q('#cxGuess')?.value ?? ''); };
  const onInput = event => {
    if (event.target?.id !== 'cxGuess') return;
    const list = q('[data-cx-suggest]'); if (!list) return;
    list.innerHTML = suggestFor(event.target.value).map(term => `<li><button type="button" data-game-act="suggest" data-term="${term.replace(/"/g, '&quot;')}">${term.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])}</button></li>`).join('');
  };
  const onKey = event => {
    if (!blitz || blitz.state.status !== 'playing' || event.ctrlKey || event.metaKey || event.altKey) return;
    const n = Number(event.key); if (n >= 1 && n <= 4 && q('.gm-option')) { event.preventDefault?.(); answerBlitz(n - 1); }
  };
  // A picture clue that cannot load falls back to its text clue (error events do not bubble, so listen in the capture phase).
  const onImgError = event => { const img = event.target; if (!img?.matches?.('img[data-cx-img]')) return; img.hidden = true; const fb = img.parentElement?.querySelector?.('[data-cx-img-fallback]'); if (fb) fb.hidden = false; };
  root.addEventListener('error', onImgError, true); root.addEventListener('click', onClick); root.addEventListener('submit', onSubmit); root.addEventListener('input', onInput); globalThis.addEventListener?.('keydown', onKey);
  function destroy() { if (!alive) return; alive = false; stop(); root.removeEventListener('error', onImgError, true); root.removeEventListener('click', onClick); root.removeEventListener('submit', onSubmit); root.removeEventListener('input', onInput); globalThis.removeEventListener?.('keydown', onKey); }

  show(game === 'blitz' || game === 'connections' ? game : 'lobby');
  return { destroy, get blitz() { return blitz; }, get connections() { return cx; } };
}
