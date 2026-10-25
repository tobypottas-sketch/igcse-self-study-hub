import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import unit from '../content/vocabulary/releases/unit-01.js';
import { PATHWAY_ACTIVITY_MAP, PATHWAY_STAGE_IDS } from '../supabase/functions/_shared/vocabulary-pathway-contract.js';
import { freshPathwayProgress } from '../supabase/functions/_shared/vocabulary-pathway-progress.js';
import { ACTIVITY_FAMILIES_BY_PATHWAY, activityFamilies } from '../src/vocabulary/activity-families.js';
import { familyTargets, loadLastChoice, pathwayPracticeOptions, saveLastChoice } from '../src/vocabulary/pathway-choice.js';
import { planPathwayQuestion } from '../src/vocabulary/pathway-planner.js';
import { renderPracticeSheet } from '../src/vocabulary/views.js';
import { findChromium, loadPlaywright } from './helpers/pathway-geometry-harness.mjs';
import { openMission } from './helpers/question-latency-harness.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const content = { ...unit, itemsById: Object.fromEntries(unit.items.map(row => [row.vocabularyId, row])), contextsByOccurrence: {}, activitiesById: Object.fromEntries(unit.activities.map(row => [row.activityContentId, row])) };
for (const row of unit.contexts) (content.contextsByOccurrence[row.occurrenceId] ??= []).push(row);
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
function unitMasteryAt(pathwayId, completed) {
  return Object.fromEntries(unit.occurrences.map(occ => [occ.occurrenceId, { contextualEvidence: { pathwayProgress: { [pathwayId]: freshPathwayProgress({ completedStages: completed }) } } }]));
}

test('every pathway stage belongs to exactly one family, every family has classroom wording, and types come from the contract', () => {
  for (const [pathwayId, stages] of Object.entries(PATHWAY_ACTIVITY_MAP)) {
    const families = ACTIVITY_FAMILIES_BY_PATHWAY[pathwayId];
    for (const stageId of PATHWAY_STAGE_IDS) {
      if (!stages[stageId].length) continue;
      const owners = families.filter(family => family.stageIds.includes(stageId));
      assert.equal(owners.length, 1, `${pathwayId}/${stageId} has one family`);
      assert.deepEqual([...owners[0].types].sort(), [...stages[stageId]].sort());
    }
    for (const family of families) {
      assert.ok(family.label && family.description, `${family.id} has a label and description`);
      assert.doesNotMatch(family.label, /_/, 'no backend enum names in student labels');
    }
  }
  assert.deepEqual(activityFamilies('context').find(f => f.label === 'Type the Missing Word').stageIds, ['recall'], 'Context Mastery is its own activity (Complete Both Sentences) now');
});

test('a fresh unit offers only the first stage; later activities are listed as locked with the reason', () => {
  const options = pathwayPracticeOptions({ pathwayId: 'context', content, unitMastery: {}, globalMastery: {} });
  assert.equal(options[0].family.label, 'Choose the Word');
  assert.notEqual(options[0].status, 'locked');
  for (const option of options.slice(1)) {
    assert.equal(option.status, 'locked');
    assert.match(option.hint, /^Unlocks after you clear /);
  }
});

test('words that cleared earlier stages can practise those families again (review) and the current one, never a later one', () => {
  const unitMastery = unitMasteryAt('context', ['recognise']);
  const options = pathwayPracticeOptions({ pathwayId: 'context', content, unitMastery, globalMastery: {} });
  const byLabel = Object.fromEntries(options.map(option => [option.family.label, option]));
  assert.notEqual(byLabel['Choose the Word'].status, 'locked', 'cleared stage stays available for review');
  assert.notEqual(byLabel['Match the Sentence'].status, 'locked', 'current stage');
  assert.equal(byLabel['Fill the Gap'].status, 'locked', 'later stage stays locked');
  const targets = familyTargets({ pathwayId: 'context', family: activityFamilies('context')[0], content, unitMastery, globalMastery: {} });
  assert.ok(targets.length > 0 && targets.every(row => row.stageId === 'recognise'), 'review attempts are recorded against the real, earlier stage');
});

test('a chosen family only ever builds its own question types, and never silently falls back to another format', () => {
  const family = activityFamilies('meaning').find(f => f.label === 'Real Situations');
  const target = unit.occurrences[0];
  const seen = new Set();
  for (let n = 0; n < 12; n += 1) {
    const plan = planPathwayQuestion({ pathwayId: 'meaning', stageId: 'apply', content, target, allowedTypes: ['which_situation_fits'], seed: `s${n}` });
    seen.add(plan.question.type);
  }
  assert.deepEqual([...seen], ['which_situation_fits']);
  assert.ok(family.types.includes('which_situation_fits'));
  assert.throws(() => planPathwayQuestion({ pathwayId: 'meaning', stageId: 'apply', content, target, allowedTypes: ['type_word_from_definition'] }), /No suitable curated activity/);
  // Recovery support is the existing scaffold and keeps its own earlier-stage choices.
  const support = planPathwayQuestion({ pathwayId: 'meaning', stageId: 'apply', content, target, allowedTypes: ['which_situation_fits'], supportState: { recycle: true, struggling: true } });
  assert.equal(support.plan.servedStage, 'match');
});

test('the last practice choice is remembered per pathway in storage only, and storage failures are harmless', () => {
  const store = new Map();
  const storage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value), removeItem: key => store.delete(key) };
  saveLastChoice('context', 'context:apply', storage);
  assert.equal(loadLastChoice('context', storage), 'context:apply');
  assert.equal(loadLastChoice('meaning', storage), null, 'no leak between pathways');
  saveLastChoice('context', null, storage);
  assert.equal(loadLastChoice('context', storage), null);
  const broken = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.equal(loadLastChoice('context', broken), null);
  assert.doesNotThrow(() => saveLastChoice('context', 'x', broken));
});

test('the sheet markup: Recommended first, locked options disabled with a visible reason, selected state not colour-only', () => {
  const options = pathwayPracticeOptions({ pathwayId: 'context', content, unitMastery: {}, globalMastery: {} });
  const html = renderPracticeSheet({ pathwayId: 'context', options, lastFamilyId: 'context:recognise' });
  assert.match(html, /role="dialog"[^>]*aria-modal="true"/);
  assert.ok(html.indexOf('start-recommended') < html.indexOf('start-practice-choice'));
  assert.match(html, /disabled aria-disabled="true"[\s\S]*?Unlocks after you clear Recognise/);
  assert.match(html, /Last time/);
  assert.doesNotMatch(html, /choose_word_sentence|type_missing_word/, 'no enum names shown');
});

const browserTest = loadPlaywright() && await findChromium() ? test : test.skip;
browserTest('browser: a card opens the sheet; Recommended starts as before; a chosen activity serves only that family, with Esc and back working', async () => {
  const api = await openMission({ root, pathway: 'context', stage: 'match' });
  try {
    const page = api.page;
    await page.click('.vocab-pathway-card[data-pathway="context"]');
    await page.waitForSelector('[data-practice-sheet]');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.action), 'start-recommended', 'focus starts on the fast path');
    await page.keyboard.press('Escape');
    assert.equal(await page.$('[data-practice-sheet]'), null, 'Esc closes');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.pathway), 'context', 'focus returns to the card');
    await page.click('.vocab-pathway-card[data-pathway="context"]');
    const rows = await page.$$eval('.vocab-sheet-option[data-family]', nodes => nodes.map(node => ({ label: node.querySelector('strong').textContent, disabled: node.disabled })));
    // Only activities the Set's CURRENT stage (Match) can serve are offered; the cleared Recognise activity is shown but disabled, matching the launch guard.
    assert.deepEqual(rows.filter(row => !row.disabled).map(row => row.label), ['Match the Sentence']);
    assert.ok(rows.filter(row => row.disabled).length >= 2);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 0, 'no horizontal overflow');
    // A chosen activity is the Set's CURRENT step (Match here) limited to that activity: it carries Set identity and is not a separate journey.
    await page.click('[data-family="context:match"]');
    await page.waitForFunction(() => window.__currentQuestion);
    const types = [];
    for (let n = 0; n < 3; n += 1) {
      types.push(await page.evaluate(() => `${window.__currentQuestion.type}@${window.__currentQuestion.pathwayStage}`));
      await api.answer(true); await api.clickNext(8000);
    }
    assert.deepEqual([...new Set(types)], ['context_sentence_match@match']);
    // finish → "Try another activity" is not on a mid-session screen; leaving returns to the unit and the choice is remembered
    await page.click('[data-action="leave-session"]');
    await page.waitForSelector('.vocab-pathway-card[data-pathway="context"]');
    await page.click('.vocab-pathway-card[data-pathway="context"]');
    assert.equal(await page.evaluate(() => document.activeElement.dataset.family), 'context:match', 'last choice is pre-focused');
  } finally { await api.close(); }
});

import { supportiveFeedback } from '../src/vocabulary/views.js';
test('correct feedback varies its lead but keeps its explanation; the default is unchanged', () => {
  assert.equal(supportiveFeedback({ correct: true }), 'Correct — that answer fits the meaning and context.');
  const leads = new Set();
  for (let n = 0; n < 6; n += 1) {
    const text = supportiveFeedback({ correct: true, variant: n });
    assert.match(text, / — that answer fits the meaning and context\.$/);
    leads.add(text.split(' — ')[0]);
  }
  assert.equal(leads.size, 6);
  assert.match(supportiveFeedback({ correct: true, questionType: 'same_idea', variant: 4 }), /^That’s it — you tracked the whole idea accurately\.$/);
  assert.match(supportiveFeedback({ correct: false }), /^Not quite/);
});

browserTest('browser: a streak chip appears from three clean answers in a row and a Halfway chip at 5 of 10; neither blocks Next', async () => {
  const api = await openMission({ root, pathway: 'meaning', stage: 'recognise' });
  try {
    await api.start();
    const chips = [];
    for (let n = 1; n <= 6; n += 1) {
      await api.answer(true);
      chips.push(await api.page.evaluate(() => document.querySelector('[data-study-momentum]')?.textContent.trim() ?? null));
      await api.clickNext(8000);
    }
    assert.equal(chips[0], null); assert.equal(chips[1], null);
    assert.equal(chips[2], '3 in a row');
    assert.equal(chips[3], '4 in a row');
    assert.equal(chips[4], 'Halfway — 5 of 10');
    assert.equal(chips[5], '6 in a row');
  } finally { await api.close(); }
});
