import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVITY_TYPES,
  PRACTICE_MODES,
  activityDefinition,
  activitiesForMode,
  activitiesForStage,
  isActivityLive
} from '../src/vocabulary/activity-catalogue.js';

const EXPECTED_ACTIVITIES = [
  'meaning_match',
  'definition_to_word',
  'word_definition_match',
  'drag_word_definition',
  'drag_definition_word',
  'which_situation_fits',
  'type_word_from_definition',
  'gap_fill_bank',
  'drag_word_sentence',
  'type_missing_word',
  'spell_word',
  'spell_in_context',
  'choose_word_sentence',
  'context_sentence_match',
  'word_family_choice',
  'word_family_match',
  'spelling_choice',
  'spelling_cue_match',
  'spelling_rebuild',
  'precision_choice',
  'precision_match',
  'meaning_in_context',
  'correct_usage',
  'collocation_builder',
  'word_family_switch',
  'question_text_bridge',
  'find_evidence',
  'phrase_match',
  'build_paraphrase',
  'complete_paraphrase',
  'rewrite_phrase',
  'same_idea',
  'spot_meaning_change',
  'build_same_idea',
  'rewrite_idea',
  'improve_vocabulary',
  // Job 8 (STAGE_CONTRACT v2) additions, in catalogue order
  'gloss_in_context_type', 'type_in_passage', 'word_family_identify', 'family_multi_form', 'precision_type_cued', 'upgrade_passage', 'spot_the_error',
  'explain_another_way'
];

const EXPECTED_MODES = [
  'learn',
  'context',
  'question_text',
  'phrase_paraphrase',
  'idea_paraphrase',
  'writing',
  'adaptive'
];

const VALID_RESPONSE_MODES = new Set(['choice', 'matching', 'drag_match', 'drag_gap', 'spelling', 'tiles', 'evidence', 'text', 'slots']);
const VALID_STAGES = new Set(['new', 'building', 'secure', 'mastered']);
const VALID_STRENGTHS = new Set(['light', 'medium', 'strong', 'very_strong']);
const VALID_STRANDS = new Set(['meaning', 'recognition', 'context', 'paraphrasing', 'production']);

test('catalogue exposes exactly the approved 0511 vocabulary learning operations', () => {
  assert.deepEqual(ACTIVITY_TYPES.map(activity => activity.id), EXPECTED_ACTIVITIES);
  assert.equal(new Set(ACTIVITY_TYPES.map(activity => activity.id)).size, EXPECTED_ACTIVITIES.length);
});

test('catalogue exposes exactly the seven approved student practice modes', () => {
  assert.deepEqual(PRACTICE_MODES.map(mode => mode.id), EXPECTED_MODES);
  assert.equal(new Set(PRACTICE_MODES.map(mode => mode.id)).size, 7);
});

test('every activity declares a complete deterministic learning contract', () => {
  for (const activity of ACTIVITY_TYPES) {
    assert.equal(activityDefinition(activity.id), activity);
    assert.ok(activity.label?.trim());
    assert.ok(activity.skillFamily?.trim());
    assert.ok(Array.isArray(activity.practiceModes) && activity.practiceModes.length > 0);
    assert.ok(activity.practiceModes.every(mode => EXPECTED_MODES.includes(mode)));
    assert.ok(VALID_RESPONSE_MODES.has(activity.responseMode), `${activity.id}: responseMode`);
    assert.ok(VALID_STAGES.has(activity.minimumStage), `${activity.id}: minimumStage`);
    assert.ok(Array.isArray(activity.strands) && activity.strands.length > 0);
    assert.ok(activity.strands.every(strand => VALID_STRANDS.has(strand)), `${activity.id}: strands`);
    assert.ok(VALID_STRENGTHS.has(activity.evidenceStrength), `${activity.id}: evidenceStrength`);
    assert.equal(typeof activity.productive, 'boolean');
  }
});

test('each focused mode returns only activities belonging to that mode and adaptive can use every live activity', () => {
  for (const mode of EXPECTED_MODES.filter(mode => mode !== 'adaptive')) {
    const activities = activitiesForMode(mode);
    assert.ok(activities.length > 0, mode);
    assert.ok(activities.every(activity => activity.practiceModes.includes(mode)), mode);
  }
  const liveIds = ACTIVITY_TYPES.filter(activity => isActivityLive(activity.id)).map(activity => activity.id);
  assert.deepEqual(activitiesForMode('adaptive').map(activity => activity.id), liveIds);
});

test('stage filtering respects minimum readiness while keeping supported work available', () => {
  const fresh = activitiesForStage('new').map(activity => activity.id);
  assert.ok(fresh.includes('meaning_match'));
  assert.ok(fresh.includes('definition_to_word'));
  assert.ok(fresh.includes('word_definition_match'));
  assert.ok(fresh.includes('drag_word_definition'));
  assert.ok(fresh.includes('drag_definition_word'));
  assert.ok(fresh.includes('phrase_match'));
  assert.ok(fresh.includes('spelling_choice'));
  assert.ok(!fresh.includes('spelling_cue_match'), 'retired by STAGE_CONTRACT v2: off every ladder');
  assert.equal(fresh.includes('rewrite_idea'), false);
  assert.equal(fresh.includes('explain_another_way'), false);

  const building = activitiesForStage('building').map(activity => activity.id);
  assert.ok(building.includes('gap_fill_bank'));
  assert.ok(building.includes('drag_word_sentence'));
  assert.ok(building.includes('type_missing_word'));
  assert.ok(building.includes('spell_word'));
  assert.ok(building.includes('type_word_from_definition'));
  assert.ok(building.includes('spelling_rebuild'));

  const secure = activitiesForStage('secure').map(activity => activity.id);
  assert.ok(secure.includes('rewrite_phrase'));
  assert.ok(secure.includes('build_same_idea'));

  const mastered = activitiesForStage('mastered').map(activity => activity.id);
  assert.ok(mastered.includes('spell_in_context'));
  assert.ok(mastered.includes('explain_another_way'));
});

test('productive catalogue entries are not low-level recognition-only tasks', () => {
  for (const activity of ACTIVITY_TYPES.filter(activity => activity.productive)) {
    assert.ok(['tiles', 'text'].includes(activity.responseMode), activity.id);
    assert.ok(activity.strands.includes('production') || activity.strands.includes('paraphrasing'), activity.id);
  }
});