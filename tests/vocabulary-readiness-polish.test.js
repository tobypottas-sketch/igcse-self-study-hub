import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readinessReasonText, readinessNextSteps, renderReadinessReport } from '../src/vocabulary/teacher-readiness.js';

const view = await readFile(new URL('../src/vocabulary/teacher-readiness.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../vocabulary-readiness-polish.css', import.meta.url), 'utf8');
const html = await readFile(new URL('../vocabulary.html', import.meta.url), 'utf8');

test('readiness shortage copy says exactly what the author needs to add', () => {
  assert.equal(readinessReasonText({
    live:false,
    reason:'stage_below_minimum',
    missing:[{ kind:'stage', stage:'recognise', have:12, need:20 }],
    stageCounts:{ recognise:12 },
    stageMinimums:{ recognise:20 }
  }), 'Recognise needs 8 more items');
});

test('unit readiness returns to the previous class overview when class context exists', () => {
  assert.match(view, /data-action=\\"teacher-back-overview\\">← Back<\\/button>/);
  assert.doesNotMatch(view, /data-action=\\"teacher-back-classes\\">← Classes<\\/button>/);
});

test('readiness is issue first and keeps all technical counts behind a disclosure', () => {
  assert.match(view, /vocab-readiness__metrics/);
  assert.match(view, /vocab-readiness__metric/);
  assert.match(view, /View detailed content checks/);
  assert.doesNotMatch(view, /<details open>/);
  assert.match(view, /What needs attention/);
  assert.match(view, /Already available/);
  assert.match(view, /View detailed content checks/);
  assert.match(view, /Units .* not yet published/);
});

test('readiness polish is isolated, responsive, and cache-versioned', () => {
  assert.match(css, /\.vocab-readiness__metrics/);
  assert.match(css, /\.vocab-readiness__row/);
  assert.match(css, /\.vocab-readiness__audit/);
  assert.match(css, /@media\(max-width:620px\)/);
  assert.match(html, /vocabulary-readiness-polish\.css\?v=readiness-v2/);
});

test('readiness guidance uses eligible word targets, not questions or student scores', () => {
  const steps = readinessNextSteps({
    live:false, rawReason:'stage_below_minimum',
    missing:[{kind:'stage',stage:'recognise',have:12,need:20}]
  });
  assert.deepEqual(steps, ['Review or add eligible Recognise activities for 8 more word targets (12 of 20 required).']);
});

test('held pathways do not imply that topping up counts will publish them', () => {
  const steps = readinessNextSteps({live:false,held:true,rawReason:'editorial_hold',missing:[]});
  assert.match(steps[0], /editorial hold/);
});

test('unit readiness prioritises a blocked pathway before five ready ones', () => {
  const stages = [{id:'recognise',label:'Recognise',have:12,need:20,ok:false}];
  const ready = id => ({pathwayId:id,label:id,live:true,reason:'Live for students',rawReason:null,held:false,stages:[{...stages[0],have:50,ok:true}],notes:[],missing:[]});
  const blocked = {pathwayId:'paraphrasing',label:'Paraphrasing',live:false,reason:'Recognise needs 8 more items',rawReason:'stage_below_minimum',held:false,stages,notes:[],missing:[{kind:'stage',stage:'recognise',have:12,need:20}]};
  const root={innerHTML:''};
  renderReadinessReport(root,{options:[{unitNumber:1}],selected:1,title:'Sports and Free Time',report:{expectedWords:50,publishedWords:50,wordsComplete:true,live:5,rows:[ready('meaning'),ready('context'),blocked,ready('word_families'),ready('precision_use'),ready('spelling_recall')]}});
  const html=root.innerHTML;
  assert.ok(html.indexOf('data-readiness-pathway="paraphrasing"') < html.indexOf('data-readiness-pathway="meaning"'));
  assert.match(html, /8 more needed/);
  assert.match(html, /12 of 20 eligible word targets/);
  assert.match(html, /They are not student scores/);
  assert.doesNotMatch(html, /<details open>/);
  assert.match(html, /data-action="teacher-readiness-unit"/);
});
