import fs from 'node:fs';

function replaceExactly(file, before, after) {
  const source = fs.readFileSync(file, 'utf8');
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${file}: expected one patch target, found ${count}`);
  fs.writeFileSync(file, source.replace(before, after));
}

replaceExactly(
  'src/vocabulary/games/games-controller.js',
  "import { playCue } from '../sound.js';\n",
  ''
);
replaceExactly(
  'src/vocabulary/games/games-controller.js',
  "export function mountGames(root, { content, game = 'lobby', onExit = () => {}, rng = Math.random, puzzles = null, history = sharedGameHistory, now = () => Date.now(), setTimer = setTimeout, clearTimer = clearTimeout, setTick = setInterval, clearTick = clearInterval } = {}) {",
  "export function mountGames(root, { content, game = 'lobby', onCue = () => {}, onExit = () => {}, rng = Math.random, puzzles = null, history = sharedGameHistory, now = () => Date.now(), setTimer = setTimeout, clearTimer = clearTimeout, setTick = setInterval, clearTick = clearInterval } = {}) {"
);
for (const [before, after] of [
  ["playCue('blitz-timeout');", "onCue('blitz-timeout');"],
  ["playCue(result.correct ? 'blitz-correct' : 'blitz-wrong', result.correct ? { streak:result.streak, multiplier:result.multiplier } : {});", "onCue(result.correct ? 'blitz-correct' : 'blitz-wrong', result.correct ? { streak:result.streak, multiplier:result.multiplier } : {});"],
  ["playCue(r.correct ? 'correct' : 'incorrect');", "onCue(r.correct ? 'correct' : 'incorrect');"],
  ["else if (act === 'cx-choice') { const r = cx.pick(target.dataset.term); if (r) { playCue(r.correct ? 'correct' : 'incorrect'); showCx(true, r.correct ? null : '[data-cx-choices] .gm-choice:not([disabled])'); } }", "else if (act === 'cx-choice') { const r = cx.pick(target.dataset.term); if (r) { onCue(r.correct ? 'correct' : 'incorrect'); showCx(true, r.correct ? null : '[data-cx-choices] .gm-choice:not([disabled])'); } }"],
]) {
  if (before === "playCue(r.correct ? 'correct' : 'incorrect');") {
    const source = fs.readFileSync('src/vocabulary/games/games-controller.js', 'utf8');
    const count = source.split(before).length - 1;
    if (count !== 1) throw new Error(`Connections typed cue: expected one target, found ${count}`);
    fs.writeFileSync('src/vocabulary/games/games-controller.js', source.replace(before, after));
  } else replaceExactly('src/vocabulary/games/games-controller.js', before, after);
}
replaceExactly(
  'src/vocabulary/app.js',
  "state.games = mountGames(root, { content:state.content, game:target.dataset.game, onExit:() => { state.games = null; renderCurrentUnit(); } });",
  "state.games = mountGames(root, { content:state.content, game:target.dataset.game, onCue:playCue, onExit:() => { state.games = null; renderCurrentUnit(); } });"
);
replaceExactly(
  'tests/vocabulary-games.test.js',
  "assert.match(app, /mountGames\\(root, \\{ content:state\\.content, game:target\\.dataset\\.game, onExit:/, 'only the loaded content and an exit callback are passed');",
  "assert.match(app, /mountGames\\(root, \\{ content:state\\.content, game:target\\.dataset\\.game, onCue:playCue, onExit:/, 'games receive only loaded content, a harmless sound callback and an exit callback');"
);

console.log('Applied games sound isolation fix.');
