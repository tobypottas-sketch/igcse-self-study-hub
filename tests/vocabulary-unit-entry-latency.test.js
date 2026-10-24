import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderVocabularyUnit } from '../src/vocabulary/views.js';

const app = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

function root() { return { innerHTML:'' }; }

test('opening a unit renders the unit shell before waiting for remote content', () => {
  const helper = app.match(/async function openUnit\(unitNumber\) \{([\s\S]*?)\n\}/);
  assert.ok(helper, 'openUnit helper should exist');
  const immediateRender = helper[1].indexOf('renderCurrentUnit()');
  const awaitContent = helper[1].indexOf('await Promise.all');
  assert.ok(immediateRender >= 0, 'unit shell should render immediately from dashboard data');
  assert.ok(awaitContent > immediateRender, 'remote content must load after the visible unit transition');
});

test('unit opens immediately with the six pathways visible but disabled until content is ready', () => {
  const host = root();
  renderVocabularyUnit(host, {
    unitNumber:1,
    unitTitle:'Sports and Free Time',
    progress:{ mastered:0, total:50, needsAnotherLook:0, reviewDue:0 },
    pathwayStates:{},
    contentReady:false
  });
  assert.match(host.innerHTML, />Choose a vocabulary pathway<\/h2>/);
  assert.equal((host.innerHTML.match(/data-action="open-pathway"/g) ?? []).length, 6);
  assert.equal((host.innerHTML.match(/data-action="open-pathway"[^>]*disabled/g) ?? []).length, 6);
  assert.match(host.innerHTML, /data-action="start-mixed-review"[^>]*disabled/);
  assert.doesNotMatch(host.innerHTML, /data-action="set-practice-focus"/);
});