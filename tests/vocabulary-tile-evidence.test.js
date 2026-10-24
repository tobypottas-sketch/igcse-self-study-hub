import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { ACTIVITY_TYPES, activityDefinition, isActivityLive } from '../src/vocabulary/activity-catalogue.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';
import { planNextActivity } from '../src/vocabulary/adaptive-planner.js';
import { buildVocabularySkillProfile, skillFamiliesForQuestionType } from '../src/vocabulary/skill-profile.js';
import { applyEvidence, deriveStatus, markCuratedAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';
import { buildStoredAttemptMetadata } from '../supabase/functions/vocabulary-attempt-action/validation.js';

const TILE_TYPES = ['build_paraphrase', 'build_same_idea'];
const TYPED_PRODUCTION_TYPES = ['rewrite_phrase', 'rewrite_idea', 'explain_another_way'];

function source(path) { return fs.readFileSync(new URL(path, import.meta.url), 'utf8'); }

// supabase/functions/vocabulary-attempt-action/index.ts is a Deno file, so read its ACTIVITY_EVIDENCE table from source.
function serverEvidenceTable() {
  const ts = source('../supabase/functions/vocabulary-attempt-action/index.ts');
  const start = ts.indexOf('const ACTIVITY_EVIDENCE');
  const body = ts.slice(start, ts.indexOf('};', start));
  const table = {};
  for (const match of body.matchAll(/(\w+):\{ strands:\[([^\]]*)\], evidenceStrength:'(\w+)', productive:(true|false) \}/g)) {
    table[match[1]] = { strands:match[2].split(',').map(item => item.trim().replace(/'/g, '')).filter(Boolean), evidenceStrength:match[3], productive:match[4] === 'true' };
  }
  return table;
}
const SERVER = serverEvidenceTable();

function fresh(overrides = {}) {
  return { status:'new', strandEvidence:{ meaning:0, recognition:0, context:0, paraphrasing:0, production:0 }, successfulProductions:0, productionContextIds:[], productionActivityTypes:[], unscaffoldedProductions:0, recentErrorCount:0, ...overrides };
}
// Mirrors the evidence object assembled in vocabulary-attempt-action/index.ts from its own contract table.
function serverEvidence(type, { correct = true, supportLevel = 'none', firstAttempt = true, contextId = 'ctx' } = {}) {
  const contract = SERVER[type];
  return { strand:contract.strands[0], strands:contract.strands, evidenceStrength:contract.evidenceStrength, supportLevel, productive:contract.productive, repeatedGuess:false, correct, firstAttempt, retryUsed:!firstAttempt, recoveredLater:false, contextId, activityContentId:null, questionType:type, activityType:type, review:false };
}
function run(steps, start = fresh()) {
  let mastery = start;
  const statuses = [];
  for (const [type, contextId, options = {}] of steps) { mastery = applyEvidence(mastery, serverEvidence(type, { contextId, ...options }), new Date('2026-10-18T10:00:00Z')); statuses.push(mastery.status); }
  return { mastery, statuses };
}
// A target that already satisfies EVERYTHING for "mastered" except the production requirements.
const everythingButProduction = () => fresh({ status:'secure', strandEvidence:{ meaning:9, recognition:9, context:9, paraphrasing:9, production:0 } });

test('every client catalogue activity has an identical server evidence contract', () => {
  for (const activity of ACTIVITY_TYPES) {
    assert.ok(SERVER[activity.id], `${activity.id}: missing server evidence contract`);
    assert.deepEqual(SERVER[activity.id], { strands:activity.strands, evidenceStrength:activity.evidenceStrength, productive:activity.productive }, activity.id);
  }
});

test('tile assembly is defined as scaffolded paraphrasing evidence: positive strand, medium strength, never productive', () => {
  for (const type of TILE_TYPES) {
    const definition = activityDefinition(type);
    assert.equal(definition.responseMode, 'tiles');
    assert.deepEqual(definition.strands, ['paraphrasing'], type);
    assert.equal(definition.evidenceStrength, 'medium', type);
    assert.equal(definition.productive, false, type);
    assert.deepEqual(SERVER[type], { strands:['paraphrasing'], evidenceStrength:'medium', productive:false }, `server ${type}`);
  }
  // Guard for the future: any live tile activity must be non-productive and carry no production strand.
  for (const activity of ACTIVITY_TYPES.filter(row => row.responseMode === 'tiles' && isActivityLive(row.id))) {
    assert.equal(activity.productive, false, activity.id);
    assert.equal(activity.strands.includes('production'), false, activity.id);
  }
});

test('typed productive activities are unchanged and still count as strong independent production', () => {
  for (const type of TYPED_PRODUCTION_TYPES) {
    const definition = activityDefinition(type);
    assert.equal(definition.responseMode, 'text', type);
    assert.equal(definition.productive, true, type);
    assert.ok(['strong', 'very_strong'].includes(definition.evidenceStrength), type);
    assert.equal(SERVER[type].productive, true, `server ${type}`);
  }
  assert.ok(activityDefinition('rewrite_phrase').strands.includes('production'));
  assert.ok(activityDefinition('rewrite_idea').strands.includes('production'));
});

test('engine default strands agree with the catalogue for tile and typed paraphrase activities', () => {
  for (const type of [...TILE_TYPES, 'complete_paraphrase', 'same_idea', 'phrase_match']) {
    const marked = markCuratedAnswer({ item:{}, sense:{}, context:{ contextId:'c', acceptedAnswers:['x'] }, questionType:type, rawAnswer:'x' });
    assert.deepEqual(marked.evidence.strands, activityDefinition(type).strands, type);
  }
});

test('1. tile success contributes positive paraphrasing / meaning evidence', () => {
  for (const type of TILE_TYPES) {
    const result = run([[type,`ctx-${type}`]]).mastery;
    assert.ok(result.strandEvidence.paraphrasing > 0, type);
    assert.ok(result.strandEvidence.meaning > 0, type);
    assert.equal(result.strandEvidence.production, 0, type);
  }
});

test('2. one clean tile success can move a new target to building but not secure/mastered', () => {
  for (const type of TILE_TYPES) {
    const { mastery, statuses } = run([[type,`ctx-${type}`]]);
    assert.equal(statuses[0], 'building', type);
    assert.equal(mastery.status, 'building', type);
  }
});

test('3. repeated tile success alone can never create secure or mastered evidence', () => {
  for (const type of TILE_TYPES) {
    const result = run(Array.from({ length:8 },(_,i)=>[type,`ctx-${i}`])).mastery;
    assert.equal(result.status, 'building', type);
    assert.equal(result.strandEvidence.context, 0, type);
    assert.equal(result.strandEvidence.production, 0, type);
    assert.equal(result.successfulProductions, 0, type);
    assert.equal(result.unscaffoldedProductions, 0, type);
  }
});

test('4. tile success cannot complete Mastered even when all non-production gates are already satisfied', () => {
  for (const type of TILE_TYPES) {
    const result = run([[type,'ctx-tile-a'],[type,'ctx-tile-b']], everythingButProduction()).mastery;
    assert.equal(result.status, 'secure', type);
    assert.equal(result.successfulProductions, 0, type);
    assert.equal(result.unscaffoldedProductions, 0, type);
  }
});

test('5. typed independent production still completes Mastered after scaffolded tile work', () => {
  for (const type of TILE_TYPES) {
    const afterTile = run([[type,'ctx-tile']], everythingButProduction()).mastery;
    const completed = run([
      ['rewrite_phrase','ctx-prod-a'],
      ['rewrite_idea','ctx-prod-b']
    ], afterTile).mastery;
    assert.equal(completed.status, 'mastered', type);
    assert.ok(completed.successfulProductions >= 2, type);
    assert.ok(completed.unscaffoldedProductions >= 1, type);
  }
});

test('6. supported typed production is weaker but still distinct from scaffolded tiles', () => {
  const afterTile = run([['build_paraphrase','ctx-tile']], everythingButProduction()).mastery;
  const supported = run([['rewrite_phrase','ctx-prod',{ supportLevel:'light', firstAttempt:false }]], afterTile).mastery;
  assert.ok(supported.strandEvidence.production > 0);
  assert.equal(supported.unscaffoldedProductions, 0);
  assert.equal(afterTile.strandEvidence.production, 0);
});

test('7. planner support path can choose tile assembly without misclassifying it as production', () => {
  const available = ACTIVITY_TYPES.filter(row => isActivityLive(row.id)).map(row => row.id);
  const plan = planNextActivity({
    practiceMode:'adaptive',
    mastery:fresh({ status:'secure', strandEvidence:{ meaning:8, recognition:8, context:5, paraphrasing:5, production:2 } }),
    recentActivities:[{ type:'rewrite_idea', family:'production', correct:false, contentId:'idea-a' }],
    supportState:{ struggling:true },
    availableContent:available
  });
  const definition = activityDefinition(plan.activityType);
  assert.equal(definition.productive, false);
  assert.equal(definition.strands.includes('production'), false);
});

test('8. skill profile does not interpret tile assembly as lexical production', () => {
  for (const type of TILE_TYPES) {
    assert.equal(skillFamiliesForQuestionType(type).includes('lexical_production'), false, type);
    const profile = buildVocabularySkillProfile([{ metadata:{ question_type:type, outcome:'correct', evidence_strength:'medium', support_level:'none' } }]);
    assert.equal(profile.skills.lexical_production.evidenceCount, 0, type);
  }
});

test('9. stored tile metadata remains privacy-safe and preserves scaffolded evidence classification', () => {
  const metadata = buildStoredAttemptMetadata({
    unitNumber:1, strand:'paraphrasing', questionType:'build_paraphrase', firstAttempt:true, retryUsed:false,
    recoveredLater:false, correct:true, vocabularyId:'v1', occurrenceId:'o1', evidenceStrength:'medium', supportLevel:'none',
    rawAnswer:'PRIVATE ANSWER'
  });
  assert.equal(metadata.question_type, 'build_paraphrase');
  assert.equal(metadata.evidence_strength, 'medium');
  assert.equal(JSON.stringify(metadata).includes('PRIVATE ANSWER'), false);
});

test('10. builder catalogue contract keeps every live tile activity nonproductive', () => {
  const tileDefinitions = ACTIVITY_TYPES.filter(row => row.responseMode === 'tiles' && isActivityLive(row.id));
  assert.ok(tileDefinitions.length >= 2);
  for (const definition of tileDefinitions) {
    assert.equal(definition.productive, false, definition.id);
    assert.equal(definition.strands.includes('production'), false, definition.id);
  }
});
