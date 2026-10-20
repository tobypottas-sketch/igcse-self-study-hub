import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
const helper = name => source.match(new RegExp(`(?:async )?function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n\\}`))[0];

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

test('reopening a unit cannot overwrite a pending save with the old dashboard snapshot', async () => {
  let settleSave, settleContent, saved = false, reads = 0;
  const savedRow = { occurrence_id:'u1', status:'building', contextual_evidence:{ pathwayProgress:{ context:{ currentStage:'match' } } } };
  const state = {
    session:{ completedAttempts:[{ correct:true }] }, preview:false, client:{}, units:[],
    dashboard:{ occurrences:[{ occurrence_id:'u1', vocabulary_id:'v1', unit_number:1 }], global:[], unit:[] },
    persistenceChain:new Promise(resolve => { settleSave = () => { saved = true; resolve(); }; })
  };
  const context = vm.createContext({ state, clearClock:() => {}, renderCurrentUnit:() => {},
    loadVocabularyUnit:() => new Promise(resolve => { settleContent = () => resolve({ occurrences:[], items:[], contexts:[], activities:[] }); }),
    loadStudentMastery:async () => { reads++; assert.equal(saved, true); return { global:[], unit:[savedRow] }; },
    mapBy:(rows,key,transform = row => row) => Object.fromEntries(rows.map(row => [row[key],transform(row)])),
    occurrence:row => row, item:row => row, context:row => row, unitActivity:row => row, mastery:row => row
  });
  vm.runInContext(helper('openUnit'), context);
  const opening = vm.runInContext('openUnit(1)', context);
  assert.equal(reads, 0);
  settleSave();
  await Promise.resolve();
  settleContent();
  await opening;
  assert.equal(reads, 1);
  assert.equal(state.unitMastery.u1.contextualEvidence.pathwayProgress.context.currentStage, 'match');
});
