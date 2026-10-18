import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { activityDefinition } from '../src/vocabulary/activity-catalogue.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';
import { buildVocabularySkillProfile, skillFamiliesForQuestionType } from '../src/vocabulary/skill-profile.js';
import { applyEvidence, markCuratedAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';

const TYPES = ['word_family_switch','improve_vocabulary'];

function source(path) { return fs.readFileSync(new URL(path, import.meta.url), 'utf8'); }
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
  return { status:'secure', strandEvidence:{ meaning:9, recognition:9, context:9, paraphrasing:9, production:0 }, successfulProductions:0, productionContextIds:[], productionActivityTypes:[], unscaffoldedProductions:0, recentErrorCount:0, ...overrides };
}
function evidence(type, activityContentId) {
  const contract = SERVER[type];
  return { correct:true, strand:contract.strands[0], strands:contract.strands, evidenceStrength:contract.evidenceStrength, supportLevel:'none', productive:contract.productive, repeatedGuess:false, firstAttempt:true, retryUsed:false, recoveredLater:false, contextId:null, activityContentId, questionType:type, activityType:type, review:false };
}
function buildFromRecord(type, record, status) {
  const vocabularyId = record.activityData.linkedVocabularyIds[0];
  const item = unit1.items.find(row => row.vocabularyId === vocabularyId);
  const occurrence = unit1.occurrences.find(row => row.vocabularyId === vocabularyId);
  return buildActivity({ activityType:type, occurrence, item, contexts:unit1.contexts.filter(row => row.occurrenceId === occurrence.occurrenceId), unitActivities:[record], unitItems:unit1.items, unitContexts:unit1.contexts, unitOccurrences:unit1.occurrences, mastery:{ status }, seed:`scaffolded-writing:${type}` });
}

test('controlled writing activities are medium contextual/recognition evidence, never independent production', () => {
  for (const type of TYPES) {
    const definition = activityDefinition(type);
    assert.deepEqual(definition.strands, ['context','recognition'], type);
    assert.equal(definition.evidenceStrength, 'medium', type);
    assert.equal(definition.productive, false, type);
    assert.deepEqual(SERVER[type], { strands:['context','recognition'], evidenceStrength:'medium', productive:false }, `server ${type}`);
  }
});

test('real Unit 1 Word Family Switch is a constrained one-word completion', () => {
  const record = unit1.activities.find(row => row.contentType === 'writing_set' && row.activityData.taskType === 'word_family');
  assert.ok(record);
  const question = buildFromRecord('word_family_switch', record, 'building');
  assert.equal(question.responseMode, 'text');
  assert.match(question.sourceText, /____/);
  assert.ok(question.markingReference.acceptedAnswers.every(answer => String(answer).trim().split(/\s+/).length === 1));
});

test('real Unit 1 Improve the Vocabulary can be a constrained blank/replacement task', () => {
  const record = unit1.activities.find(row => row.contentType === 'writing_set' && row.activityData.taskType === 'collocation');
  assert.ok(record);
  const question = buildFromRecord('improve_vocabulary', record, 'secure');
  assert.equal(question.responseMode, 'text');
  assert.match(question.sourceText, /____/);
  assert.ok(question.markingReference.acceptedAnswers.every(answer => String(answer).trim().split(/\s+/).length <= 3));
});

test('controlled writing success cannot increment production counters or satisfy Mastered', () => {
  let mastery = fresh();
  for (let i = 0; i < 12; i += 1) {
    for (const type of TYPES) mastery = applyEvidence(mastery, evidence(type, `${type}-${i}`), new Date('2026-10-18T10:00:00Z'));
  }
  assert.equal(mastery.successfulProductions, 0);
  assert.equal(mastery.unscaffoldedProductions, 0);
  assert.deepEqual(mastery.productionActivityTypes, []);
  assert.equal(mastery.strandEvidence.production, 0);
  assert.equal(mastery.status, 'secure');

  const genuine = activityDefinition('rewrite_idea');
  const afterGenuine = applyEvidence(fresh(), { correct:true, strand:genuine.strands[0], strands:genuine.strands, evidenceStrength:genuine.evidenceStrength, supportLevel:'none', productive:genuine.productive, firstAttempt:true, retryUsed:false, repeatedGuess:false, recoveredLater:false, activityContentId:'idea-1', questionType:'rewrite_idea', activityType:'rewrite_idea', review:false }, new Date('2026-10-18T10:00:00Z'));
  assert.equal(afterGenuine.successfulProductions, 1);
  assert.equal(afterGenuine.unscaffoldedProductions, 1);
});

test('engine default strands agree with the controlled-writing contract', () => {
  for (const type of TYPES) {
    const marked = markCuratedAnswer({ item:{}, sense:{}, context:{ contextId:'c', acceptedAnswers:['x'] }, questionType:type, rawAnswer:'x' });
    assert.deepEqual(marked.evidence.strands, ['context','recognition'], type);
  }
});

test('teacher profile keeps controlled writing in Writing vocabulary and out of Lexical production', () => {
  for (const type of TYPES) assert.deepEqual(skillFamiliesForQuestionType(type), ['writing_vocabulary'], type);
  const events = TYPES.map(type => ({ metadata:{ question_type:type, outcome:'correct', evidence_strength:'very_strong', support_level:'none' } }));
  const before = JSON.stringify(events);
  const profile = buildVocabularySkillProfile(events);
  assert.equal(profile.skills.lexical_production.evidenceCount, 0);
  assert.equal(profile.skills.writing_vocabulary.independentStrongCount, 0, 'legacy over-strong controlled writing should be capped on read');
  assert.equal(JSON.stringify(events), before, 'history must not be rewritten');
});
