import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
const helper = name => source.match(new RegExp(`(?:async )?function ${name}\\(\\) \\{[\\s\\S]*?\\n\\}`))[0];

for (const blocked of [false, true]) {
  test(`leaving a question does not wait for persistence (blocked=${blocked})`, async () => {
    const session = { completedAttempts:[{ correct:true }] };
    const state = { session, current:{ answered:true }, persistenceBlocked:blocked, persistenceChain:new Promise(() => {}) };
    let rendered = false, clockCleared = false;
    const context = vm.createContext({ state, clearClock:() => { clockCleared = true; }, renderCurrentUnit:() => { rendered = true; }, showSyncWarning:() => {} });
    vm.runInContext(`${helper('returnToCurrentUnit')}; returnToCurrentUnit();`, context);
    await Promise.resolve();
    assert.equal(rendered, true);
    assert.equal(clockCleared, true);
    assert.equal(state.session, session);
    assert.equal(state.persistenceBlocked, blocked);
  });
}

for (const action of ['advanceToNextQuestion', 'finishSessionWhenSaved']) {
  test(`a pending ${action} cannot reopen the question after leaving`, async () => {
    let resolveSave;
    const state = { current:{ answered:true }, session:{ completedAttempts:[{ correct:true }] }, persistenceChain:new Promise(resolve => { resolveSave = resolve; }) };
    let unitRenders = 0, sessionRenders = 0;
    const context = vm.createContext({ state, clearClock:() => {}, showSyncWarning:() => {}, renderCurrentUnit:() => { unitRenders++; }, nextQuestion:() => { sessionRenders++; }, finishSession:() => { sessionRenders++; } });
    vm.runInContext(`${helper('returnToCurrentUnit')}; ${helper(action)};`, context);
    const pending = vm.runInContext(`${action}()`, context);
    await vm.runInContext('returnToCurrentUnit()', context);
    resolveSave();
    await pending;
    assert.equal(unitRenders, 1);
    assert.equal(sessionRenders, 0);
    assert.equal(state.session.completedAttempts.length, 1);
  });
}
