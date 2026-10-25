// Control-surface audit: what the UI offers must be what startPathwaySession() accepts, for the Set the server holds NOW.
import test from 'node:test';
import assert from 'node:assert/strict';
import { harness } from './vocabulary-app-harness.mjs';
import { dbRow } from './support/set-server.js';

const LIVE = ['meaning', 'context', 'word_families', 'precision_use', 'spelling_recall'];
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
const offered = html => [...html.matchAll(/<button[^>]*data-action="start-practice-choice"[^>]*>/g)]
  .filter(m => !/is-locked|disabled/.test(m[0])).map(m => m[0].match(/data-family="([^"]+)"/)[1]);
const WF_SET_1 = ['preference', 'avoid', 'afford', 'deny', 'arrange', 'recommend', 'threaten', 'resent', 'regret', 'unfamiliar'];   // the real Unit 1 Word Families Set 1
const make = (pathwayId, stage, rows, extra = {}) => harness({ pathwayId, stage, size:10, setRows:rows, ...(pathwayId === 'word_families' ? { terms:WF_SET_1 } : {}), ...extra });
const rowAt = (pathwayId, stage) => dbRow({ pathwayId, setNumber:1, stage });

for (const pathwayId of LIVE) {
  test(`${pathwayId}: a practice sheet opened from stale cached Set rows only offers what the launch accepts`, async () => {
    // Server: the Set has moved on to Match. The unit screen still holds the cached Recognise row.
    const h = make(pathwayId, 'match', [rowAt(pathwayId, 'match')]);
    h.state.setRows = [rowAt(pathwayId, 'recognise')];
    await h.run(`openFreshPracticeSheet(${JSON.stringify(pathwayId)})`);
    const choices = offered(h.sheets.at(-1));
    assert.ok(choices.length > 0, 'the sheet offers at least one activity');
    for (const familyId of choices) {
      const fresh = make(pathwayId, 'match', [rowAt(pathwayId, 'match')]);
      await assert.doesNotReject(fresh.run(`startPathwaySession(${JSON.stringify(pathwayId)}, false, { familyId:${JSON.stringify(familyId)} })`), `${familyId} was offered but the launcher rejected it`);
    }
  });
}

// Picker/launcher agreement with FRESH rows, every live pathway x stage: nothing selectable may be refused by the launcher.
for (const pathwayId of LIVE) for (const stage of STAGES) {
  test(`${pathwayId} @ ${stage}: every selectable activity is accepted by the launcher, every refused one is not selectable`, async () => {
    const rows = [rowAt(pathwayId, stage)];
    const h = make(pathwayId, stage, rows);
    await h.run(`openFreshPracticeSheet(${JSON.stringify(pathwayId)})`);
    const html = h.sheets.at(-1);
    const choices = new Set(offered(html));
    for (const match of html.matchAll(/data-action="start-practice-choice"[^>]*data-family="([^"]+)"/g)) {
      const familyId = match[1];
      const fresh = make(pathwayId, stage, rows);
      const result = await fresh.run(`startPathwaySession(${JSON.stringify(pathwayId)}, false, { familyId:${JSON.stringify(familyId)} })`).then(() => 'accepted', error => error.message);
      if (choices.has(familyId)) assert.equal(result, 'accepted', `${familyId} @ ${stage} is selectable but the launcher said: ${result}`);
    }
  });
}

test('a Set whose words cannot all build a family is not offered that family (default Unit 1 words are not all word-family capable)', async () => {
  const rows = [rowAt('word_families', 'match')];
  const h = harness({ pathwayId:'word_families', stage:'match', size:10, setRows:rows });
  await h.run(`openFreshPracticeSheet('word_families')`);
  assert.deepEqual(offered(h.sheets.at(-1)), [], 'nothing is selectable when the launch would refuse it');
  const again = harness({ pathwayId:'word_families', stage:'match', size:10, setRows:rows });
  await assert.rejects(again.run(`startPathwaySession('word_families', false, { familyId:'word_families:match' })`), /not part of this stage/);
});

// ---- Static wiring map: every rendered data-action has a live handler in the dispatcher that owns that surface. ----
import fs from 'node:fs';
const read = file => fs.readFileSync(new URL(`../src/vocabulary/${file}`, import.meta.url), 'utf8');
const actionsIn = (source, { enabledOnly = true } = {}) => [...source.matchAll(/<(?:button|a)\b[^>]*?data-action="([a-z-]+)"[^>]*>/g)]
  .filter(m => !enabledOnly || !/\bdisabled\b/.test(m[0])).map(m => m[1]);
const handledIn = source => new Set([...source.matchAll(/action === '([a-z-]+)'/g)].map(m => m[1]));

test('every student-facing data-action rendered by the Vocabulary views has a handler in the student dispatcher (or the completion sequence)', () => {
  const rendered = new Set(['views.js', 'match-set-view.js', 'engagement-copy.js', 'games/games-view.js'].flatMap(file => { try { return actionsIn(read(file)); } catch { return []; } }));
  rendered.add('start-mixed-review');                                  // views.js builds the finish CTA from finishModel.nextStep.id
  const handled = new Set([...handledIn(read('app.js')), ...handledIn(read('completion-sequence.js')), 'skip-animation']);
  const studentRendered = [...rendered].filter(action => !action.startsWith('teacher-'));
  assert.ok(studentRendered.length >= 15, 'the scan found the student controls');
  for (const action of studentRendered) assert.ok(handled.has(action), `data-action="${action}" is rendered but no handler exists`);
});
test('the only dynamic finish-screen action id (nextStep.id) is a handled action', () => {
  const ids = [...read('session-finish-model.js').matchAll(/nextStep\s*=\s*[^;]*?id:'([a-z-]+)'/g)].map(m => m[1]).concat([...read('session-finish-model.js').matchAll(/nextStep:[^,]*?id:'([a-z-]+)'/g)].map(m => m[1]));
  assert.ok(ids.length > 0);
  for (const id of ids) assert.ok(handledIn(read('app.js')).has(id), `finish CTA id ${id} has no handler`);
});
test('every teacher-analytics data-action that is enabled has a handler in teacher-app.js (no dead buttons)', () => {
  const rendered = new Set(['teacher-views.js', 'teacher-readiness.js', 'teacher-app.js'].flatMap(file => actionsIn(read(file))));
  const handled = handledIn(read('teacher-app.js'));
  for (const action of rendered) assert.ok(handled.has(action), `data-action="${action}" is rendered enabled but teacher-app.js has no handler`);
});

// A failed Set refresh must never leave potentially stale activity availability on screen.
for (const pathwayId of LIVE) {
  test(`${pathwayId}: when the Set rows cannot be refreshed the sheet exposes no selectable activity, only a friendly retry`, async () => {
    const h = make(pathwayId, 'match', [rowAt(pathwayId, 'match')]);
    h.state.setRows = [rowAt(pathwayId, 'recognise')];                       // stale cache, would offer the Recognise activity
    await h.run(`loadPathwaySets = async () => { throw new Error('offline'); }`);
    await h.run(`openFreshPracticeSheet(${JSON.stringify(pathwayId)})`);
    const html = h.sheets.at(-1);
    assert.deepEqual(offered(html), [], 'no named activity is selectable');
    assert.doesNotMatch(html, /data-action="start-recommended"/, 'Recommended is not offered either: it would fail the same refresh');
    assert.match(html, /data-sheet-offline/);
    assert.match(html, new RegExp(`data-action="open-pathway"[^>]*data-pathway="${pathwayId}"`), 'a retry control re-runs the refresh');
    // Retry once the connection is back: fresh rows, valid activities only.
    await h.run(`loadPathwaySets = async () => ${JSON.stringify([rowAt(pathwayId, 'match')])}`);
    await h.run(`openFreshPracticeSheet(${JSON.stringify(pathwayId)})`);
    const back = h.sheets.at(-1);
    assert.doesNotMatch(back, /data-sheet-offline/);
    for (const familyId of offered(back)) {
      const fresh = make(pathwayId, 'match', [rowAt(pathwayId, 'match')]);
      await assert.doesNotReject(fresh.run(`startPathwaySession(${JSON.stringify(pathwayId)}, false, { familyId:${JSON.stringify(familyId)} })`));
    }
  });
}
