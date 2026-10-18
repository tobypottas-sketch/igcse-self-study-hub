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
const TYPED_PRODUCTION_TYPES = ['complete_paraphrase', 'rewrite_phrase', 'rewrite_idea', 'improve_vocabulary', 'explain_another_way', 'word_family_switch'];

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

test('client catalogue and server evidence table are identical for every activity (strands, strength, productive)', () => {
  assert.deepEqual(Object.keys(SERVER).sort(), ACTIVITY_TYPES.map(activity => activity.id).sort());
  for (const activity of ACTIVITY_TYPES) {
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
  assert.ok(activityDefinition('improve_vocabulary').strands.includes('production'));
});

test('engine default strands agree with the catalogue for tile and typed paraphrase activities', () => {
  for (const type of [...TILE_TYPES, 'complete_paraphrase', 'same_idea', 'phrase_match']) {
    const marked = markCuratedAnswer({ item:{}, sense:{}, context:{ contextId:'c', acceptedAnswers:['x'] }, questionType:type, rawAnswer:'x' });
    assert.deepEqual(marked.evidence.strands, activityDefinition(type).strands, type);
  }
});

test('1. tile success contributes positive paraphrasing / meaning evidence', () => {
  for (const type of TILE_TYPES) {
    const { mastery } = run([[type, 'ctx-a']]);
    assert.equal(mastery.strandEvidence.paraphrasing, 2, `${type} paraphrasing`);
    assert.equal(mastery.strandEvidence.recognition, 2, `${type} recognition`);
    assert.equal(mastery.strandEvidence.meaning, 2, `${type} meaning`);
    assert.equal(mastery.strandEvidence.production, 0, `${type} must not build the production strand`);
    const supported = run([[type, 'ctx-a', { supportLevel:'light', firstAttempt:false }]]).mastery;
    assert.ok(supported.strandEvidence.paraphrasing > 0 && supported.strandEvidence.paraphrasing < mastery.strandEvidence.paraphrasing, 'supported success still counts, but for less');
  }
  const wrong = run([['build_paraphrase', 'ctx-a', { correct:false }]]).mastery;
  assert.equal(wrong.strandEvidence.paraphrasing, 0);
  assert.equal(wrong.recentErrorCount, 1);
  // Repeated tile success keeps accumulating useful paraphrasing evidence.
  assert.equal(run([['build_paraphrase', 'a'], ['build_same_idea', 'b'], ['build_paraphrase', 'c']]).mastery.strandEvidence.paraphrasing, 6);
});

test('2. tile success cannot increment unscaffolded (or any) production counters', () => {
  const steps = [];
  for (let index = 0; index < 20; index += 1) for (const type of TILE_TYPES) steps.push([type, `ctx-${index}`, { supportLevel:'none', firstAttempt:true }]);
  const { mastery } = run(steps);
  assert.equal(mastery.unscaffoldedProductions, 0);
  assert.equal(mastery.successfulProductions, 0);
  assert.deepEqual(mastery.productionContextIds, []);
  assert.deepEqual(mastery.productionActivityTypes, []);
  assert.equal(mastery.strandEvidence.production, 0);
  // The same first-attempt success on a typed activity does count (control).
  const typed = run([['rewrite_phrase', 'ctx-typed']]).mastery;
  assert.equal(typed.unscaffoldedProductions, 1);
  assert.equal(typed.successfulProductions, 1);
});

test('3. tile-only success cannot produce "mastered", even from a target that meets every other requirement', () => {
  const steps = [];
  for (let index = 0; index < 25; index += 1) for (const type of TILE_TYPES) steps.push([type, `ctx-${index}`]);
  const { mastery, statuses } = run(steps, everythingButProduction());
  assert.ok(!statuses.includes('mastered'), `status history: ${[...new Set(statuses)].join(',')}`);
  assert.equal(deriveStatus(mastery), 'secure');
  // The exact zero-typing path that used to reach mastered (two context checks + two tile clicks).
  const path = run([['meaning_in_context', 'c1'], ['meaning_in_context', 'c2'], ['build_paraphrase', 'c3'], ['build_same_idea', 'c4']]);
  assert.notEqual(path.mastery.status, 'mastered');
  assert.equal(path.mastery.unscaffoldedProductions, 0);
});

test('a single tile click no longer jumps a fresh target to secure', () => {
  for (const type of TILE_TYPES) assert.equal(run([[type, 'c']]).mastery.status, 'building', type);
});

test('4. genuinely typed productive activities can still reach "mastered" from the same starting point', () => {
  const { mastery } = run([['rewrite_phrase', 'c1'], ['rewrite_idea', 'c2']], everythingButProduction());
  assert.equal(mastery.status, 'mastered');
  assert.equal(mastery.unscaffoldedProductions, 2);
  // A full path from a fresh target that mixes recognition, tiles and typed production still gets there.
  const path = run([['meaning_in_context', 'c1'], ['meaning_in_context', 'c2'], ['build_paraphrase', 'c3'], ['rewrite_phrase', 'c4'], ['rewrite_idea', 'c5']]);
  assert.equal(path.mastery.status, 'mastered');
  assert.deepEqual(path.mastery.productionActivityTypes.sort(), ['rewrite_idea', 'rewrite_phrase']);
  // Tiles interleaved do not interfere with, or substitute for, the typed evidence.
  assert.equal(run([['rewrite_phrase', 'c1'], ['build_same_idea', 'c2']], everythingButProduction()).mastery.status, 'secure');
});

test('the adaptive planner still routes secure targets to typed production, so "mastered" remains reachable', () => {
  const available = ACTIVITY_TYPES.filter(activity => isActivityLive(activity.id)).map(activity => activity.id);
  const mastery = { status:'secure', strandEvidence:{ meaning:9, recognition:9, context:9, paraphrasing:9, production:1 }, recentErrorCount:0 };
  const served = new Set();
  const recent = [];
  for (let step = 0; step < 30; step += 1) {
    const plan = planNextActivity({ practiceMode:'adaptive', mastery, recentActivities:recent, availableContent:available });
    served.add(plan.activityType);
    recent.push({ type:plan.activityType, correct:true });
  }
  assert.ok(TYPED_PRODUCTION_TYPES.some(type => served.has(type)), `only served: ${[...served].join(', ')}`);
});

test('5. Staff Preview and the student flow use the same evidence contract', () => {
  const app = source('../src/vocabulary/app.js');
  assert.equal((app.match(/function evidenceFor\(/g) ?? []).length, 1, 'one client evidence builder shared by preview and students');
  const evidenceForSource = app.slice(app.indexOf('function evidenceFor('), app.indexOf('function persistVocabularyAttempt('));
  for (const field of ['strands:current.question.strands', 'evidenceStrength:current.question.evidenceStrength', 'productive:current.question.productive']) {
    assert.ok(evidenceForSource.includes(field), `evidenceFor must take ${field}`);
  }
  assert.equal((evidenceForSource.match(/state\.preview/g) ?? []).length, 1, 'preview may only change whether the attempt counts as a review');
  assert.match(evidenceForSource, /review:state\.preview \? false : flags\.review/);
  assert.match(app, /if \(!state\.preview\) void persistVocabularyAttempt\(/);
  assert.doesNotMatch(app, /state\.preview[^;\n]{0,60}(productive|evidenceStrength)|(productive|evidenceStrength)[^;\n]{0,60}state\.preview/);

  // Server: authoritative contract comes from its own table, also on the server-side preview branch.
  const server = source('../supabase/functions/vocabulary-attempt-action/index.ts');
  for (const field of ['strands:contract.strands', 'evidenceStrength:contract.evidenceStrength', 'productive:contract.productive']) assert.ok(server.includes(field), `server must take ${field}`);
  assert.doesNotMatch(server, /input\.(productive|strands|evidenceStrength)\b/, 'server must not trust client-supplied evidence fields');
  assert.match(server, /if \(input\.preview\) return json\(\{[^}]*strands:contract\.strands/);
});

test('questions built for preview and students carry the exact server contract, and produce identical mastery outcomes', () => {
  const cases = [
    ['build_paraphrase', unit1.activities.find(row => row.contentType === 'phrase_set')],
    ['build_same_idea', unit1.activities.find(row => row.contentType === 'idea_set')]
  ];
  for (const [type, record] of cases) {
    const vocabularyId = record.activityData.linkedVocabularyIds[0];
    const item = unit1.items.find(row => row.vocabularyId === vocabularyId);
    const occurrence = unit1.occurrences.find(row => row.vocabularyId === vocabularyId);
    const contexts = unit1.contexts.filter(row => row.occurrenceId === occurrence.occurrenceId);
    const question = buildActivity({ activityType:type, occurrence, item, contexts, unitActivities:[record], unitItems:unit1.items, unitContexts:unit1.contexts, unitOccurrences:unit1.occurrences, mastery:{ status:'secure' }, readinessStage:'secure', seed:'tile-evidence' });
    assert.equal(question.responseMode, 'tiles');
    assert.deepEqual({ strands:question.strands, evidenceStrength:question.evidenceStrength, productive:question.productive }, SERVER[type], type);
    // client-side evidenceFor() equivalent vs server evidence assembly
    const clientEvidence = { strand:question.strands[0], strands:question.strands, correct:true, evidenceStrength:question.evidenceStrength, supportLevel:'none', productive:question.productive, repeatedGuess:false, firstAttempt:true, retryUsed:false, recoveredLater:false, contextId:null, activityContentId:record.activityContentId, questionType:type, activityType:type, review:false };
    const serverSide = { ...serverEvidence(type, { contextId:null }), activityContentId:record.activityContentId };
    const now = new Date('2026-10-18T10:00:00Z');
    assert.deepEqual(applyEvidence(fresh(), clientEvidence, now), applyEvidence(fresh(), serverSide, now), type);
  }
});

test('6. historical attempts are not rewritten: stored metadata is preserved and only interpreted when read', () => {
  const stored = buildStoredAttemptMetadata({ unitNumber:1, questionType:'build_paraphrase', correct:true, evidenceStrength:'strong', supportLevel:'none', vocabularyId:'vocab_estimated', occurrenceId:'u1_x', firstAttempt:true });
  assert.equal(stored.evidence_strength, 'strong', 'the write path records exactly what it is given');
  const events = [
    { eventType:'question_attempt', metadata:{ question_type:'build_paraphrase', outcome:'correct', evidence_strength:'strong', support_level:'none' } },
    { eventType:'question_attempt', metadata:{ question_type:'build_same_idea', outcome:'correct', evidence_strength:'strong', support_level:'none' } }
  ];
  const before = JSON.stringify(events);
  buildVocabularySkillProfile(events);
  assert.equal(JSON.stringify(events), before, 'reading history never mutates stored events');
});

test('7. teacher skill profile: tile successes are paraphrasing evidence, not lexical production or independent strong evidence', () => {
  assert.deepEqual(skillFamiliesForQuestionType('build_paraphrase'), ['phrase_paraphrasing']);
  assert.deepEqual(skillFamiliesForQuestionType('build_same_idea'), ['idea_paraphrasing']);
  for (const type of ['complete_paraphrase', 'rewrite_phrase', 'rewrite_idea', 'improve_vocabulary', 'explain_another_way']) {
    assert.ok(skillFamiliesForQuestionType(type).includes('lexical_production'), type);
  }

  // Includes legacy rows stored as 'strong' before the contract changed.
  const tiles = Array.from({ length: 8 }, (_, index) => ({ eventType:'question_attempt', metadata:{ question_type:index % 2 ? 'build_same_idea' : 'build_paraphrase', outcome:'correct', evidence_strength:index < 4 ? 'strong' : 'medium', support_level:'none' } }));
  const tileProfile = buildVocabularySkillProfile(tiles);
  assert.equal(tileProfile.skills.lexical_production.evidenceCount, 0);
  assert.equal(tileProfile.skills.lexical_production.status, 'Insufficient evidence');
  assert.ok(tileProfile.skills.phrase_paraphrasing.evidenceScore > 0);
  assert.ok(tileProfile.skills.idea_paraphrasing.evidenceScore > 0);
  assert.equal(tileProfile.skills.phrase_paraphrasing.independentStrongCount, 0);
  assert.equal(tileProfile.skills.idea_paraphrasing.independentStrongCount, 0);
  assert.equal(tileProfile.skills.phrase_paraphrasing.evidenceScore, 8, '4 tile events x medium (2): the two legacy strong rows are read as medium (uncapped this would be 10)');

  const typed = buildVocabularySkillProfile([{ eventType:'question_attempt', metadata:{ question_type:'rewrite_phrase', outcome:'correct', evidence_strength:'very_strong', support_level:'none' } }]);
  assert.equal(typed.skills.lexical_production.evidenceCount, 1);
  assert.equal(typed.skills.lexical_production.independentStrongCount, 1);
  assert.equal(typed.skills.phrase_paraphrasing.independentStrongCount, 1);
});
