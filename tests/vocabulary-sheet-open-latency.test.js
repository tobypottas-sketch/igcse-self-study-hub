// Pathway popup latency: tapping a pathway card must not pay a network round trip to re-read Set rows the server just returned,
// but must still re-read them once anything that can change a Set has happened (or the read is old). The launch guard is untouched.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openEntryPage } from './helpers/activity-entry-harness.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const app = readFileSync(`${root}/src/vocabulary/app.js`, 'utf8');
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
const setReads = result => result.calls.filter(call => /vocabulary_pathway_sets/.test(call.name));

test('structure: freshness is recorded by server reads, cleared by sessions, and the launch guard still refreshes', () => {
  const sheet = app.match(/async function openFreshPracticeSheet\([^)]*\) \{([\s\S]*?)\n\}\n/)?.[1] ?? '';
  assert.match(sheet, /if \(!setRowsAreFresh\(\)\) \{ try \{ await refreshSetRows\(\)/);
  assert.match(app, /async function refreshSetRows\(\) \{[\s\S]*?markSetRowsFresh\(state\.currentUnitNumber\)/);
  assert.match(app, /function beginSession\(request\) \{\n  state\.setRowsFresh = null;/);
  assert.match(app, /function finishSession\(\) \{\n  if \(!state\.session\) return;\n  state\.setRowsFresh = null;/);
  const launch = app.match(/async function startPathwaySession\([^)]*\) \{([\s\S]*?)\n\}\n/)?.[1] ?? '';
  assert.match(launch, /await refreshSetRows\(\)/, 'the launch guard still re-reads Set rows');
  assert.doesNotMatch(launch, /setRowsAreFresh/, 'the launch never trusts the display freshness');
});

browserTest('a pathway tap right after opening the unit makes no Set read and opens within one frame budget of the network', async () => {
  const api = await openEntryPage({ root, netMs:400, pathway:'meaning', stage:'recognise' });
  try {
    await api.openUnit();
    const sheet = await api.openSheet('meaning');
    assert.equal(sheet.reason, 'ok');
    assert.equal(setReads(sheet).length, 0, 'no vocabulary_pathway_sets read');
    assert.ok(sheet.paintMs < 300, `popup opened in ${sheet.paintMs} ms with a 400 ms network`);
    const launch = await api.launch('[data-action="start-recommended"][data-pathway="meaning"]');
    assert.equal(launch.reason, 'ok');
    assert.equal(setReads(launch).length, 1, 'the launch guard still re-reads the Set rows');
    assert.deepEqual(api.errors(), []);
  } finally { await api.close(); }
});

browserTest('after a session the popup re-reads the Set rows again', async () => {
  const api = await openEntryPage({ root, netMs:50, pathway:'meaning', stage:'recognise' });
  try {
    await api.openUnit();
    await api.openSheet('meaning');
    await api.launch('[data-action="start-recommended"][data-pathway="meaning"]');
    await api.leave();
    const again = await api.openSheet('meaning');
    assert.equal(again.reason, 'ok');
    assert.equal(setReads(again).length, 1, 'a session happened, so the rows are re-read');
  } finally { await api.close(); }
});

browserTest('an old read (over 20 s) is re-read', async () => {
  const api = await openEntryPage({ root, netMs:50, pathway:'meaning', stage:'recognise' });
  try {
    await api.openUnit();
    await api.page.evaluate(() => { const now = Date.now.bind(Date); Date.now = () => now() + 30000; });
    const sheet = await api.openSheet('meaning');
    assert.equal(sheet.reason, 'ok');
    assert.equal(setReads(sheet).length, 1);
  } finally { await api.close(); }
});
