import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PRACTICE_MODES } from '../src/vocabulary/activity-catalogue.js';
import { buildSupportStep } from '../src/vocabulary/scaffolding.js';

const appSource = fs.readFileSync(new URL('../src/vocabulary/app.js', import.meta.url), 'utf8');

test('supported choice retry preserves the original option order instead of putting the correct answer first', () => {
  const activity = {
    responseMode:'choice',
    options:['plausible distractor','correct answer','other distractor','last distractor'],
    markingReference:{ acceptedAnswers:['correct answer'] }
  };
  const support = buildSupportStep(activity, { correct:false, attemptNumber:1 });
  assert.equal(support.kind, 'narrow_choices');
  assert.deepEqual(support.options, ['plausible distractor','correct answer']);
});

test('supported evidence retry also preserves source order', () => {
  const activity = {
    responseMode:'evidence',
    evidenceOptions:['wrong evidence','exact evidence','other evidence','last evidence'],
    markingReference:{ acceptedAnswers:['exact evidence'] }
  };
  const support = buildSupportStep(activity, { correct:false, attemptNumber:1 });
  assert.equal(support.kind, 'narrow_evidence');
  assert.deepEqual(support.options, ['wrong evidence','exact evidence']);
});

test('practice-mode descriptions only promise currently live skill coverage', () => {
  const learn = PRACTICE_MODES.find(mode => mode.id === 'learn');
  const writing = PRACTICE_MODES.find(mode => mode.id === 'writing');
  assert.ok(learn);
  assert.ok(writing);
  assert.doesNotMatch(learn.description, /\busage\b|\bcollocation\b/i);
  assert.doesNotMatch(writing.description, /\bcollocation\b/i);
});

test('live sessions carry used content IDs forward instead of rebuilding with an empty history', () => {
  assert.match(appSource, /usedContentIds:new Map\(\)/);
  assert.match(appSource, /const usedContentIds = state\.usedContentIds\.get\(target\.occurrenceId\) \?\? \[\]/);
  assert.match(appSource, /usedContentIds,/);
  assert.doesNotMatch(appSource, /usedContentIds:\[\]/);
  assert.match(appSource, /state\.usedContentIds\.set\(target\.occurrenceId/);
});
