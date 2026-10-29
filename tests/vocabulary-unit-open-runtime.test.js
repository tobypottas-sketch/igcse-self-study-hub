import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadVocabularyUnit, loadPathwaySets, coverageFromServerSetMembers } from '../src/vocabulary/data.js';

import { registeredPathwayCoverage, clearPathwayCoverage, coverageServes } from '../src/vocabulary/pathway-coverage-store.js';
import { buildSetPathwayStates } from '../src/vocabulary/set-progress.js';
import { setsFromCoverage, compareSetMembership } from '../src/vocabulary/pathway-sets.js';
import { renderVocabularyUnit } from '../src/vocabulary/views.js';
import release from '../content/vocabulary/releases/unit-01.js';
import { buildPathwayCoverage } from '../src/vocabulary/pathway-coverage.js';
import { releasePlannerContent } from '../content/vocabulary/readiness-report.js';

const dataSource = await readFile(new URL('../src/vocabulary/data.js', import.meta.url), 'utf8');

function occurrences(count = 50) {
  return Array.from({ length:count }, (_, index) => ({ occurrence_id:`occ-${index + 1}` }));
}

function setMembers(pathwayId, setCount) {
  return Array.from({ length:setCount * 10 }, (_, index) => ({
    pathway_id:pathwayId,
    set_number:Math.floor(index / 10) + 1,
    position:(index % 10) + 1,
    occurrence_id:`occ-${index + 1}`
  }));
}

test('student unit loading uses published server Set membership instead of client readiness evaluation', () => {
  assert.match(dataSource, /client\.from\('vocabulary_set_members'\)/);
  assert.match(dataSource, /coverageFromServerSetMembers/);
  assert.doesNotMatch(dataSource, /buildPathwayCoverage/);
});

test('published Set membership builds the student pathway state without unlocking unpublished pathways', () => {
  const rows = [
    ...setMembers('meaning', 4),
    ...setMembers('context', 4),
    ...setMembers('word_families', 2),
    ...setMembers('precision_use', 5),
    ...setMembers('spelling_recall', 5)
  ];
  const coverage = coverageFromServerSetMembers(rows, occurrences());

  assert.deepEqual(
    Object.fromEntries(Object.entries(coverage).map(([id, value]) => [id, { available:value.available, setCount:value.setCount, occurrenceCount:value.occurrenceIds.length }])),
    {
      meaning:{ available:true, setCount:4, occurrenceCount:40 },
      context:{ available:true, setCount:4, occurrenceCount:40 },
      word_families:{ available:true, setCount:2, occurrenceCount:20 },
      paraphrasing:{ available:false, setCount:0, occurrenceCount:0 },
      precision_use:{ available:true, setCount:5, occurrenceCount:50 },
      spelling_recall:{ available:true, setCount:5, occurrenceCount:50 }
    }
  );
  assert.equal(coverage.paraphrasing.reason, 'no_published_sets');
});

test('server membership cannot make unknown or non-live occurrences available to students', () => {
  const rows = [
    ...setMembers('meaning', 1),
    { pathway_id:'meaning', set_number:2, position:1, occurrence_id:'not-live' },
    { pathway_id:'not-a-pathway', set_number:1, position:1, occurrence_id:'occ-1' }
  ];
  const coverage = coverageFromServerSetMembers(rows, occurrences(10));

  assert.equal(coverage.meaning.available, true);
  assert.equal(coverage.meaning.setCount, 1);
  assert.equal(coverage.meaning.occurrenceIds.length, 10);
  assert.equal(coverage.meaning.occurrenceIds.includes('not-live'), false);
});


function fixtureClient(tables, calls = []) {
  return { from(name) {
    calls.push(name);
    assert.ok(Object.hasOwn(tables,name), `Unexpected table ${name}`);
    const query = { select() { return query; }, eq() { return query; }, in() { return query; }, order() { return query; }, then(resolve,reject) { return Promise.resolve({ data:tables[name], error:null }).then(resolve,reject); } };
    return query;
  } };
}

test('first-time Unit 1 open uses published coverage with empty progression and unchanged six-pathway ladder', async t => {
  clearPathwayCoverage(1); t.after(() => clearPathwayCoverage(1));
  const live = occurrences().map((row,index) => ({ ...row, vocabulary_id:`word-${index}`, unit_number:1, status:'live' }));
  const rows = [...setMembers('meaning',4),...setMembers('context',4),...setMembers('word_families',2),...setMembers('precision_use',5),...setMembers('spelling_recall',5)];
  const calls = [];
  const client = fixtureClient({ vocabulary_items:live.map(row => ({ vocabulary_id:row.vocabulary_id, term:'Synthetic word' })), vocabulary_contexts:Array.from({ length:342 },(_,i) => ({ context_id:`context-${i}`, occurrence_id:live[i%50].occurrence_id })), vocabulary_unit_activities:Array.from({ length:490 },(_,i) => ({ activity_content_id:`activity-${i}`, unit_number:1 })), vocabulary_set_members:rows, vocabulary_pathway_sets:[] },calls);
  const [loaded, progression] = await Promise.all([loadVocabularyUnit(client,1,{ occurrences:live }),loadPathwaySets(client,1)]);
  assert.equal(loaded.contexts.length,342); assert.equal(loaded.activities.length,490);
  assert.deepEqual(progression,[]);
  const coverage = registeredPathwayCoverage(1);
  const states = buildSetPathwayStates({ occurrences:live, coverageByPathway:coverage, setRows:progression });
  assert.equal(Object.keys(states).length,6);
  for (const [id,state] of Object.entries(states)) {
    assert.equal(state.available,id !== 'paraphrasing',id);
    assert.equal(state.currentStage,'recognise');
    assert.equal(state.mastered,false);
    assert.deepEqual(state.completedStages,[]);
    if (state.available) {
      const sets = setsFromCoverage(id,coverage[id],live.map(row => row.occurrence_id));
      assert.equal(compareSetMembership({ pathwayId:id,setNumber:1,clientMembers:sets.sets[0],serverRows:rows }).status,'match');
    }
  }
  const root = { innerHTML:'' };
  renderVocabularyUnit(root,{ unitNumber:1, unitTitle:'Synthetic unit', pathwayStates:states, contentReady:true });
  assert.equal((root.innerHTML.match(/data-action="open-pathway"/g) ?? []).length,6);
  assert.equal((root.innerHTML.match(/data-action="open-pathway"[^>]*disabled/g) ?? []).length,1);
  const stages = [...root.innerHTML.matchAll(/data-pathway-stage="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(stages.slice(0,5),['recognise','match','apply','recall','mastery']);
  const saved = buildSetPathwayStates({ occurrences:live,coverageByPathway:coverage,setRows:[{ pathway_id:'meaning',set_number:1,stage:'apply',completed_stages:['recognise','match'],status:'active' }] });
  assert.equal(saved.meaning.currentStage,'apply');
  assert.deepEqual(saved.meaning.completedStages,['recognise','match']);
  assert.equal(calls.filter(name => name === 'vocabulary_set_members').length,1);
});

test('student coverage preserves serviceable remainder practice without changing published Sets', async t => {
  clearPathwayCoverage(1); t.after(() => clearPathwayCoverage(1));
  // Canonical evaluation is offline test preparation, never part of the student loader.
  const expected = buildPathwayCoverage({ content:releasePlannerContent(release) });
  const snake = row => Object.fromEntries(Object.entries(row).map(([key,value]) => [key.replace(/[A-Z]/g,c => '_' + c.toLowerCase()),value]));
  const live = release.occurrences.map(snake);
  const rows = Object.entries(expected).flatMap(([pathway_id,coverage]) => setsFromCoverage(pathway_id,coverage,live.map(row => row.occurrence_id)).setList.flatMap(set => set.members.map((occurrence_id,i) => ({ pathway_id,set_number:set.setNumber,position:i+1,occurrence_id }))));
  await loadVocabularyUnit(fixtureClient({ vocabulary_items:release.items.map(snake),vocabulary_contexts:release.contexts.map(row => ({ ...snake(row),context_type:row.type,prompt_text:row.text })),vocabulary_unit_activities:release.activities.map(snake),vocabulary_set_members:rows }),1,{ occurrences:live });
  const actual = registeredPathwayCoverage(1);
  for (const [pathway,coverage] of Object.entries(expected)) {
    for (const row of live) assert.equal(coverageServes(1,pathway,row.occurrence_id),coverage.occurrenceIds.includes(row.occurrence_id),`${pathway}:${row.occurrence_id}`);
    assert.deepEqual(setsFromCoverage(pathway,actual[pathway],live.map(row => row.occurrence_id)).sets,setsFromCoverage(pathway,coverage,live.map(row => row.occurrence_id)).sets);
  }
});

test('no live occurrences cannot acquire coverage from stale published membership', () => {
  const coverage = coverageFromServerSetMembers(setMembers('meaning',1),[]);
  assert.equal(coverage.meaning.available,false);
});
