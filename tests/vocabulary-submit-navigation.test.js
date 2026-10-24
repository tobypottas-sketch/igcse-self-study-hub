import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');
const helper = name => source.match(new RegExp(`(?:async )?function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n\\}`))[0];

for (const blocked of [false, true]) {
  test(`leaving a question does not wait for persistence and retires the session (blocked=${blocked})`, async () => {
    const state = { session:{ completedAttempts:[{ correct:true }] }, current:{ answered:true } };
    const attempts = () => ({ blocked, settled:() => new Promise(() => {}) });
    let rendered = false, clockCleared = false;
    const context = vm.createContext({ state, attempts, clearClock:() => { clockCleared = true; }, renderCurrentUnit:() => { rendered = true; }, showSyncWarning:() => {} });
    vm.runInContext(`${helper('returnToCurrentUnit')}; returnToCurrentUnit();`, context);
    await Promise.resolve();
    assert.equal(rendered, true);
    assert.equal(clockCleared, true);
    assert.equal(state.session, null, 'an exited quiz must not keep masquerading as an active session');
    assert.equal(attempts().blocked, blocked);
  });
}

// finishSessionWhenSaved waits for the queue; advanceToNextQuestion only waits when a save is blocked behind a backlog.
const pendingCases = {
  advanceToNextQuestion:resolve => ({ blocked:true, pending:9, settled:() => Promise.resolve(), retry:() => new Promise(done => resolve.set(() => done(true))) }),
  finishSessionWhenSaved:resolve => ({ blocked:false, pending:1, settled:() => new Promise(done => resolve.set(done)), retry:async () => true })
};
for (const action of Object.keys(pendingCases)) {
  test(`a pending ${action} cannot reopen the question after leaving`, async () => {
    const release = { set(fn) { this.fn = fn; } };
    const state = { current:{ answered:true }, session:{ completedAttempts:[{ correct:true }] }, finishPending:false };
    const controller = pendingCases[action](release);
    const attempts = () => controller;
    let unitRenders = 0, sessionRenders = 0;
    const context = vm.createContext({ state, attempts, clearClock:() => {}, showSyncWarning:() => {}, showFinishSaving:() => {}, root:{}, MAX_UNSAVED_WHILE_BLOCKED:3, renderCurrentUnit:() => { unitRenders++; }, nextQuestion:() => { sessionRenders++; }, finishSession:() => { sessionRenders++; } });
    vm.runInContext(`${helper('returnToCurrentUnit')}; ${helper(action)};`, context);
    const pending = vm.runInContext(`${action}()`, context);
    await Promise.resolve();
    await vm.runInContext('returnToCurrentUnit()', context);
    release.fn();
    await pending;
    assert.equal(unitRenders, 1);
    assert.equal(sessionRenders, 0);
  });
}

test('reopening a cached unit is immediate and does not refetch content or mastery', async () => {
  const cachedContent = {
    occurrences:[{ occurrenceId:'u1', vocabularyId:'v1', unitNumber:1, unitTitle:'Sports and Free Time' }],
    items:[], contexts:[], activities:[], itemsById:{}, contextsByOccurrence:{}, activitiesById:{}
  };
  const cachedGlobal = { v1:{ status:'building', strandEvidence:{ context:2 } } };
  const cachedUnit = { u1:{ status:'building', contextualEvidence:{ pathwayProgress:{ context:{ currentStage:'match' } } } } };
  const state = {
    preview:false, client:{}, units:[{ unitNumber:1, unitTitle:'Sports and Free Time' }], currentUnitNumber:null, currentUnitTitle:null,
    content:null, practiceFocus:null, pathwayId:null, pathwayStage:null, mixedReview:false, finishPending:false,
    dashboard:{ occurrences:[{ occurrence_id:'u1', vocabulary_id:'v1', unit_number:1, unit_title:'Sports and Free Time' }], global:[], unit:[] },
    globalMastery:{}, unitMastery:{},
    unitCache:new Map([[1,{ content:cachedContent, globalMastery:cachedGlobal, unitMastery:cachedUnit, currentUnitTitle:'Sports and Free Time' }]])
  };
  let contentReads = 0, masteryReads = 0, renders = 0;
  const context = vm.createContext({
    state,
    attempts:() => ({ blocked:false, retry:async () => true }),
    clearClock:() => {}, refreshSetRows:async () => {}, loadPathwaySets:async () => [],
    renderCurrentUnit:() => { renders++; },
    loadVocabularyUnit:async () => { contentReads++; throw new Error('cached reopen must not reload content'); },
    loadStudentMastery:async () => { masteryReads++; throw new Error('cached reopen must not reload mastery'); },
    mapBy:(rows,key,transform = row => row) => Object.fromEntries(rows.map(row => [row[key],transform(row)])),
    occurrence:row => row, item:row => row, context:row => row, unitActivity:row => row, mastery:row => row
  });
  vm.runInContext(helper('openUnit'), context);
  await vm.runInContext('openUnit(1)', context);
  assert.equal(contentReads, 0);
  assert.equal(masteryReads, 0);
  assert.equal(renders, 1, 'cached Practice Zone must not be replaced by a delayed second render');
  assert.equal(state.content, cachedContent);
  assert.equal(state.globalMastery, cachedGlobal);
  assert.equal(state.unitMastery, cachedUnit);
});
