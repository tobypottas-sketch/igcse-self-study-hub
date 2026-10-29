import test from 'node:test';
import assert from 'node:assert/strict';
import { harness, correctAnswer } from './vocabulary-app-harness.mjs';

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}
async function finishedMission() {
  const gate = deferred();
  const h = harness({ pathwayId:'context', stage:'recognise', size:10, setServer:true, userKey:'synthetic-continue-latency' });
  const record = h.server.record;
  h.server.record = async (...args) => { await gate.promise; return record(...args); };
  await h.run("startPathwaySession('context')");
  for (let guard = 0; guard < 30 && h.state.current; guard += 1) {
    h.run(`handleAnswer(null,${JSON.stringify(correctAnswer(h))})`);
    await h.state.attempts.settled();
    await h.run('advanceToNextQuestion()');
  }
  assert.equal(h.summaries.length,1);
  assert.ok(h.state.settling);
  // Count the actual controller's calls to the server-held progression reader.
  h.run('globalThis.reads = 0; const realLoad = loadPathwaySets; loadPathwaySets = async (...args) => { reads += 1; return realLoad(...args); };');
  return { h,gate };
}

test('Continue waiting for settlement reuses its successful authoritative Set read', async () => {
  const { h,gate } = await finishedMission();
  const previousTargets = [...h.state.session.targetIds].sort();
  const next = h.run('continuePractice()');
  assert.equal(h.run('reads'),0,'no pre-settlement progression read');
  gate.resolve();
  await next;
  assert.equal(h.run('reads'),1,'settlement and waiting Continue need one authoritative read, not two sequential round trips');
  assert.equal(h.state.pathwayStage,'match');
  assert.equal(h.state.setStep.setNumber,1);
  assert.deepEqual([...h.state.session.targetIds].sort(),previousTargets);
});

test('Continue still reads fresh Set rows if settlement could not refresh them', async () => {
  const { h,gate } = await finishedMission();
  h.run("const countedLoad = loadPathwaySets; loadPathwaySets = async (...args) => { if (reads === 0) { reads += 1; throw new Error('Synthetic read failure'); } return countedLoad(...args); };");
  const next = h.run('continuePractice()');
  gate.resolve();
  await next;
  assert.equal(h.run('reads'),2,'a failed settlement read is never reused');
  assert.equal(h.state.pathwayStage,'match');
});

test('a later launch after settlement completes still refreshes current server state', async () => {
  const { h,gate } = await finishedMission();
  gate.resolve(); await h.state.settling;
  await new Promise(done => setImmediate(done));
  assert.equal(h.state.settling,null);
  await h.run('continuePractice()');
  assert.equal(h.run('reads'),2,'a previous completed settlement is not a reusable indefinite cache');
  assert.equal(h.state.pathwayStage,'match');
});

test('Continue does not reuse a settlement snapshot replaced by intervening navigation', async () => {
  const { h,gate } = await finishedMission();
  const settling = h.state.settling;
  h.state.settling = settling.then(result => {
    h.state.setRows = [...h.state.setRows];
    return result;
  });
  const next = h.run('continuePractice()');
  gate.resolve(); await next;
  assert.equal(h.run('reads'),2,'a different snapshot must be refreshed before launch');
  assert.equal(h.state.pathwayStage,'match');
});
