import test from 'node:test';
import assert from 'node:assert/strict';

import { deriveStudyMilestone, pathwayIdentity, renderStudyIcon } from '../src/vocabulary/study-ui.js';

const EXPECTED = {
  meaning: ['Meaning','Understand the definition','meaning','book'],
  context: ['Context','See the word in a sentence','context','quote'],
  word_families: ['Word Families','Learn related forms','word-families','branch'],
  paraphrasing: ['Paraphrasing','Find different ways to say it','paraphrasing','swap'],
  precision_use: ['Precision & Use','Choose the best word','precision','target'],
  spelling_recall: ['Spelling & Recall','Build and remember the word','spelling','keyboard']
};

test('all six pathways expose stable study identities', () => {
  for (const [id, expected] of Object.entries(EXPECTED)) {
    const identity = pathwayIdentity(id);
    assert.equal(identity.id, id);
    assert.equal(identity.label, expected[0]);
    assert.equal(identity.purpose, expected[1]);
    assert.equal(identity.accent, expected[2]);
    assert.equal(identity.icon, expected[3]);
  }
});

test('unknown pathway IDs fall back to a neutral identity', () => {
  assert.deepEqual(pathwayIdentity('something_else'), {
    id: 'neutral',
    label: 'Vocabulary',
    purpose: 'Build vocabulary step by step',
    accent: 'neutral',
    icon: 'spark'
  });
});

test('decorative study icons render inline SVG and are hidden from assistive technology', () => {
  const html = renderStudyIcon('book', { className:'example-icon' });
  assert.match(html, /^<svg\b/);
  assert.match(html, /class="study-icon example-icon"/);
  assert.match(html, /aria-hidden="true"/);
  assert.doesNotMatch(html, /<img\b/);
});

test('labelled study icons expose accessible text', () => {
  const html = renderStudyIcon('target', { label:'Precision & Use' });
  assert.match(html, /role="img"/);
  assert.match(html, /aria-label="Precision &amp; Use"/);
  assert.doesNotMatch(html, /aria-hidden="true"/);
});

test('unknown icon IDs fail safely to the neutral spark icon', () => {
  const html = renderStudyIcon('does-not-exist');
  assert.match(html, /data-study-icon="spark"/);
  assert.match(html, /<svg\b/);
});

test('unchanged authoritative pathway state produces no milestone', () => {
  assert.equal(deriveStudyMilestone({
    beforePathwayState:{ currentStage:'match', completedStages:['recognise'], mastered:false },
    afterPathwayState:{ currentStage:'match', completedStages:['recognise'], mastered:false },
    term:'leisure', pathwayId:'meaning'
  }), null);
});

test('genuine rung change produces one stage advancement milestone', () => {
  assert.deepEqual(deriveStudyMilestone({
    beforePathwayState:{ currentStage:'match', completedStages:['recognise'], mastered:false },
    afterPathwayState:{ currentStage:'apply', completedStages:['recognise','match'], mastered:false },
    term:'leisure', pathwayId:'meaning'
  }), {
    kind:'stage_advanced',
    pathwayId:'meaning',
    term:'leisure',
    fromStage:'match',
    toStage:'apply'
  });
});

test('mastery milestone is reserved for false to true mastery', () => {
  assert.deepEqual(deriveStudyMilestone({
    beforePathwayState:{ currentStage:'mastery', completedStages:['recognise','match','apply','recall'], mastered:false },
    afterPathwayState:{ currentStage:'mastery', completedStages:['recognise','match','apply','recall','mastery'], mastered:true },
    term:'leisure', pathwayId:'meaning'
  }), {
    kind:'mastered',
    pathwayId:'meaning',
    term:'leisure',
    fromStage:'mastery',
    toStage:'mastery'
  });
});

test('review of already mastered content never creates another milestone', () => {
  assert.equal(deriveStudyMilestone({
    beforePathwayState:{ currentStage:'mastery', completedStages:['recognise','match','apply','recall','mastery'], mastered:true, reviewDue:true },
    afterPathwayState:{ currentStage:'mastery', completedStages:['recognise','match','apply','recall','mastery'], mastered:true, reviewDue:false },
    term:'leisure', pathwayId:'meaning'
  }), null);
});