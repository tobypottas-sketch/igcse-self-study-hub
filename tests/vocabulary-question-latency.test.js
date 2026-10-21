import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openMission } from './helpers/question-latency-harness.mjs';

// Real app.js, views, data.js and attempt queue in headless Chromium; only the Edge Function is simulated, with a
// controllable latency / failure script. "Next" latency is measured in the page from the click to the new question DOM.
const root = fileURLToPath(new URL('..', import.meta.url));
const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
const INSTANT = 100; // ms budget for a local question transition

async function answerAndNext(api) {
  await api.answer(true);
  const state = await api.state();
  assert.equal(state.next, true, 'a correct answer offers Next');
  return api.clickNext(10000);
}

for (const latency of [0, 1000, 4000]) {
  browserTest(`Next Question is instant when each save takes ${latency}ms`, async () => {
    const api = await openMission({ root, server:{ latency } });
    try {
      await api.start();
      const times = [];
      for (let n = 0; n < 4; n += 1) { const r = await answerAndNext(api); assert.equal(r.reason, 'question'); times.push(r.ms); }
      assert.ok(Math.max(...times) < INSTANT, `click -> question DOM took ${times.join(', ')}ms with ${latency}ms saves`);
      const net = await api.net();
      assert.ok(net.length >= 1, 'saving is happening in the background');
      if (latency >= 1000) assert.ok(net.some(call => call.end === null), 'a save is still in flight while the student is already on a later question');
      assert.deepEqual(api.errors(), []);
    } finally { await api.close(); }
  });
}

browserTest('a wrong answer, supported retry and Next never wait on the two attempts being saved', async () => {
  const api = await openMission({ root, server:{ latency:1500 } });
  try {
    await api.start();
    const t0 = Date.now();
    await api.answer(false);
    assert.equal((await api.state()).feedback, 'retry', 'supported retry is offered immediately');
    await api.answer(true);
    const r = await api.clickNext(10000);
    assert.equal(r.reason, 'question');
    assert.ok(r.ms < INSTANT, `retry success -> Next took ${r.ms}ms`);
    assert.ok(Date.now() - t0 < 1500, 'the whole wrong -> retry -> Next interaction finished before the first save returned');
    // Both attempts were queued in order and are saved in order, once each.
    await api.page.waitForFunction(() => window.__server.committed.size === 2, null, { timeout:8000 });
    const order = await api.serverOrder();
    const net = await api.net();
    assert.deepEqual(order, net.map(call => call.attemptId), 'saved in the order answered');
    assert.equal(new Set(order).size, 2);
  } finally { await api.close(); }
});

browserTest('automatic retries with backoff happen in the background: Next is not tied to them, the attempt id never changes', async () => {
  const api = await openMission({ root, server:{ latency:200, failures:['network', 'network'] } });
  try {
    await api.start();
    const r = await answerAndNext(api);
    assert.ok(r.ms < INSTANT, `Next took ${r.ms}ms while the save was failing and backing off`);
    await api.page.waitForFunction(() => window.__server.committed.size === 1, null, { timeout:8000 });
    const net = await api.net();
    assert.equal(net.length, 3, 'two failures then success');
    assert.equal(new Set(net.map(call => call.attemptId)).size, 1, 'same attempt id on every try');
    assert.deepEqual(net.map(call => call.ok), [false, false, true]);
    assert.equal((await api.serverOrder()).length, 1, 'recorded exactly once');
  } finally { await api.close(); }
});

browserTest('a blocked save warns the student but does not freeze Next; Retry then flushes everything in order, once', async () => {
  const api = await openMission({ root, server:{ latency:100, failures:['network', 'network', 'network'] } });
  try {
    await api.start();
    const times = [];
    times.push((await answerAndNext(api)).ms);
    await api.page.waitForSelector('[data-vocab-sync-warning]', { timeout:6000 });    // auto retries exhausted -> blocked, visibly
    times.push((await answerAndNext(api)).ms);                                         // still moving while blocked (2 unsaved, under the cap of 3)
    assert.equal(await api.syncWarning(), true, 'the warning is put back on the next question');
    assert.ok(Math.max(...times) < INSTANT, `Next while blocked: ${times.join(', ')}ms`);
    assert.equal(await api.serverCommitted(), 0, 'nothing has been saved yet and nothing is lost');
    await api.page.click('[data-action="retry-save"]');
    await api.page.waitForFunction(() => window.__server.committed.size === 2 && !document.querySelector('[data-vocab-sync-warning]'), null, { timeout:8000 });
    const net = await api.net();
    const order = await api.serverOrder();
    assert.equal(new Set(order).size, 2, 'each answer saved exactly once');
    assert.equal(order[0], net[0].attemptId, 'the blocked head attempt was saved first, with its original id');
  } finally { await api.close(); }
});

browserTest('only finishing waits: the last Next shows "Saving progress…" until every save lands, then the results appear once', async () => {
  const api = await openMission({ root, server:{ latency:250 } });
  try {
    await api.start();
    for (let n = 0; n < 9; n += 1) { const r = await answerAndNext(api); assert.equal(r.reason, 'question'); assert.ok(r.ms < INSTANT); }
    await api.answer(true);
    await api.page.evaluate(() => document.querySelector('[data-action="next-question"]').click());
    const label = await api.page.evaluate(() => { const b = document.querySelector('[data-action="next-question"]'); return b ? { text:b.textContent.trim(), busy:b.getAttribute('aria-busy'), disabled:b.disabled } : null; });
    assert.ok(label, 'still on the last question while saves finish');
    assert.match(label.text, /Saving progress/);
    assert.equal(label.busy, 'true');
    assert.equal(label.disabled, true);
    await api.page.waitForSelector('.vocab-summary-card, [data-study-completion]', { timeout:10000 });
    assert.equal(await api.serverCommitted(), 10, 'the results screen only appeared after all 10 attempts were saved');
    const order = await api.serverOrder();
    assert.equal(new Set(order).size, 10);
    assert.deepEqual(api.errors(), []);
  } finally { await api.close(); }
});
