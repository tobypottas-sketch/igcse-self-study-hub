import fs from 'node:fs';

function replaceCount(file, before, after, expected = 1) {
  const source = fs.readFileSync(file, 'utf8');
  const count = source.split(before).length - 1;
  if (count !== expected) throw new Error(`${file}: expected ${expected} patch target(s), found ${count}`);
  fs.writeFileSync(file, source.split(before).join(after));
}

replaceCount(
  'src/vocabulary/games/games-controller.js',
  "import { playCue } from '../sound.js';\n",
  ''
);
replaceCount(
  'src/vocabulary/games/games-controller.js',
  "export function mountGames(root, { content, game = 'lobby', onExit = () => {}, rng = Math.random, puzzles = null, history = sharedGameHistory, now = () => Date.now(), setTimer = setTimeout, clearTimer = clearTimeout, setTick = setInterval, clearTick = clearInterval } = {}) {",
  "export function mountGames(root, { content, game = 'lobby', onCue = () => {}, onExit = () => {}, rng = Math.random, puzzles = null, history = sharedGameHistory, now = () => Date.now(), setTimer = setTimeout, clearTimer = clearTimeout, setTick = setInterval, clearTick = clearInterval } = {}) {"
);
replaceCount('src/vocabulary/games/games-controller.js', "playCue('blitz-timeout');", "onCue('blitz-timeout');");
replaceCount(
  'src/vocabulary/games/games-controller.js',
  "playCue(result.correct ? 'blitz-correct' : 'blitz-wrong', result.correct ? { streak:result.streak, multiplier:result.multiplier } : {});",
  "onCue(result.correct ? 'blitz-correct' : 'blitz-wrong', result.correct ? { streak:result.streak, multiplier:result.multiplier } : {});"
);
replaceCount(
  'src/vocabulary/games/games-controller.js',
  "playCue(r.correct ? 'correct' : 'incorrect');",
  "onCue(r.correct ? 'correct' : 'incorrect');",
  2
);
replaceCount(
  'src/vocabulary/app.js',
  "state.games = mountGames(root, { content:state.content, game:target.dataset.game, onExit:() => { state.games = null; renderCurrentUnit(); } });",
  "state.games = mountGames(root, { content:state.content, game:target.dataset.game, onCue:playCue, onExit:() => { state.games = null; renderCurrentUnit(); } });"
);
replaceCount(
  'tests/vocabulary-games.test.js',
  "assert.match(app, /mountGames\\(root, \\{ content:state\\.content, game:target\\.dataset\\.game, onExit:/, 'only the loaded content and an exit callback are passed');",
  "assert.match(app, /mountGames\\(root, \\{ content:state\\.content, game:target\\.dataset\\.game, onCue:playCue, onExit:/, 'games receive only loaded content, a harmless sound callback and an exit callback');"
);

console.log('Applied games sound isolation fix.');
