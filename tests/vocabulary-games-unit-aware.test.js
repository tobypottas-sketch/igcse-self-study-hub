// Games / Connections are unit-aware: content is keyed by unit, and a unit with no authored games never shows or borrows another unit's.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { GAMES_BY_UNIT, gamesFor, availableGames, CONNECTIONS_PUZZLES, BLITZ_CONFUSABLE, BLITZ_MEANING_OPTIONS } from '../src/vocabulary/games/games-data.js';
import { renderGamesEntry, renderLobby, renderConnectionsIntro, renderConnectionsPlay } from '../src/vocabulary/games/games-view.js';
import { createConnections } from '../src/vocabulary/games/connections-engine.js';
import { mountGames } from '../src/vocabulary/games/games-controller.js';
import { renderVocabularyUnit } from '../src/vocabulary/views.js';

const controllerSource = fs.readFileSync(fileURLToPath(new URL('../src/vocabulary/games/games-controller.js', import.meta.url)), 'utf8');
const unitHtml = unitNumber => { const root = { innerHTML:'' }; renderVocabularyUnit(root, { unitNumber, unitTitle:'T', progress:{ mastered:0, total:50, needsAnotherLook:0, reviewDue:0, stages:{} }, pathwayStates:{} }); return root.innerHTML; };

// A minimal element that records innerHTML and ignores listeners (the controller only paints and listens).
function fakeRoot() { return { innerHTML:'', addEventListener() {}, removeEventListener() {}, contains:() => true, querySelector:() => null, scrollTo() {} }; }

test('registry: Unit 1 maps to its existing Blitz data and puzzles; other units have none', () => {
  assert.equal(gamesFor(1).connections.puzzles, CONNECTIONS_PUZZLES);
  assert.equal(gamesFor(1).blitz.confusable, BLITZ_CONFUSABLE);
  assert.equal(gamesFor(1).blitz.meaningOptions, BLITZ_MEANING_OPTIONS);
  assert.deepEqual(availableGames(1), ['blitz', 'connections']);
  for (const unit of [2, 3, 20, 0, NaN, null, undefined]) { assert.equal(gamesFor(unit), null, `unit ${unit}`); assert.deepEqual(availableGames(unit), []); }
  assert.deepEqual(Object.keys(GAMES_BY_UNIT), ['1']);
});

test('registry: availableGames lists only games a unit has authored', () => {
  assert.deepEqual(availableGames(2, { 2:{ connections:{ puzzles:[{}] } } }), ['connections']);
  assert.deepEqual(availableGames(2, { 2:{ blitz:{ confusable:[], meaningOptions:{} } } }), ['blitz']);
  assert.deepEqual(availableGames(2, { 2:{ connections:{ puzzles:[] } } }), []);
});

test('unit screen: Unit 1 shows the Games entry; Unit 2 and later show none', () => {
  const one = unitHtml(1);
  assert.match(one, /data-games-entry/); assert.match(one, /Practise your Unit 1 vocabulary/);
  assert.match(one, /data-game="blitz"/); assert.match(one, /data-game="connections"/);
  for (const unit of [2, 3, 20]) assert.doesNotMatch(unitHtml(unit), /data-games-entry|gm-entry|data-game=/, `unit ${unit}`);
  assert.equal(renderGamesEntry(2), '');
});

test('copy follows the unit and never hardcodes Unit 1', () => {
  assert.match(renderGamesEntry(1), /Unit 1 vocabulary/);
  assert.match(renderLobby(1), /Unit 1/);
  assert.match(renderConnectionsIntro(2), /<b>Unit 2 word<\/b>/);
  assert.doesNotMatch(renderConnectionsIntro(2), /Unit 1/);
  const engine = createConnections({ puzzles:CONNECTIONS_PUZZLES.slice(0, 2) });
  const play = renderConnectionsPlay(engine, 2);
  assert.match(play, /Unit 2 word/); assert.doesNotMatch(play, /Unit 1/);
  assert.doesNotMatch(renderGamesEntry(1), /Name the Unit 1 word/);
});

test('lobby for a unit with no games is a clean unavailable state with no game cards and no Unit 1 content', () => {
  const html = renderLobby(2);
  assert.match(html, /data-games-unavailable/); assert.match(html, /not available for this unit yet/i);
  assert.doesNotMatch(html, /data-game-card|data-game=|blitz|connections/i);
  assert.match(html, /data-game-act="exit-unit"/, 'the student can still leave');
  assert.doesNotMatch(html, /Unit 1/);
});

test('controller: Unit 2 cannot open Unit 1 games even when asked for them directly', () => {
  for (const game of ['blitz', 'connections', 'lobby']) {
    const root = fakeRoot();
    const mounted = mountGames(root, { content:unit1, unitNumber:2, game, onCue() {}, onExit() {} });
    assert.match(root.innerHTML, /data-games-lobby/, `${game} falls back to the lobby`);
    assert.match(root.innerHTML, /data-games-unavailable/);
    assert.doesNotMatch(root.innerHTML, /data-game="(blitz|connections)"|gm-shell--cx/);
    mounted.destroy();
  }
});

test('controller: Unit 1 still opens Word Blitz and Connections', () => {
  for (const [game, marker] of [['blitz', /data-game="blitz"/], ['connections', /data-game="connections"/], ['lobby', /data-games-lobby/]]) {
    const root = fakeRoot();
    const mounted = mountGames(root, { content:unit1, unitNumber:1, game, onCue() {}, onExit() {} });
    assert.match(root.innerHTML, marker, game);
    assert.doesNotMatch(root.innerHTML, /data-games-unavailable/);
    mounted.destroy();
  }
});

test('controller: puzzles and Blitz data come from the unit registry, never straight from the Unit 1 exports', () => {
  assert.match(controllerSource, /gamesFor\(unitNumber\)/);
  assert.match(controllerSource, /unitGames\?\.connections\?\.puzzles/);
  assert.match(controllerSource, /data: unitGames\?\.blitz/);
  assert.doesNotMatch(controllerSource, /CONNECTIONS_PUZZLES/);
});
