import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import unit1 from '../content/vocabulary/units/unit-01.js';
import { activityDefinition } from '../src/vocabulary/activity-catalogue.js';
import { buildActivity } from '../src/vocabulary/activity-builder.js';
import { buildVocabularySkillProfile, skillFamiliesForQuestionType } from '../src/vocabulary/skill-profile.js';
import { applyEvidence, markCuratedAnswer } from '../supabase/functions/_shared/vocabulary-engine.js';

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
function fresh() {
  return { status:'secure', strandEvidence:{ meaning:9, recognition:9, context:9, paraphrasing:9, production:0 }, successfulProductions:0, productionContextIds:[], productionActivityTypes:[], unscaffoldedProductions:0, recentErrorCount:0 };
}
function evidence(type, contextId = 'ctx') {
  const contract = SERVER[type];
  return { strand:contract.strands[0], strands:contract.strands, evidenceStrength:contract.evidenceStrength, supportLevel:'none', productive:contract.productive, repeatedGuess:false, correct:true, firstAttempt:true, retryUsed:false, recoveredLater:false, contextId, activityContentId:null, questionType:type, activityType:type, review:false };
}

test('Complete the Paraphrase only asks for the final curated chunk, with the rest supplied as a stem', () => {
  const record = unit1.activities.find(row => row.contentType === 'phrase_set' && Array.isArray(row.activityData?.chunks) && row.activityData.chunks.length > 1);
  assert.ok(record, 'Unit 1 needs a phrase_set with multiple chunks');
  const vocabularyId = record.activityData.linkedVocabularyIds[0];
  const item = unit1.items.find(row => row.vocabularyId === vocabularyId);
  const occurrence = unit1.occurrences.find(row => row.vocabularyId === vocabularyId);
  const question = buildActivity({ activityType:'complete_paraphrase', occurrence, item, contexts:unit1.contexts.filter(row => row.occurrenceId === occurrence.occurrenceId), unitActivities:[record], unitItems:unit1.items, unitContexts:unit1.contexts, unitOccurrences:unit1.occurrences, mastery:{ status:'secure' }, readinessStage:'secure', seed:'complete-paraphrase-audit' });
  const chunks = record.activityData.chunks.map(value => String(value).trim()).filter(Boolean);
  assert.equal(question.responseMode, 'text');
  assert.deepEqual(question.markingReference.acceptedAnswers, [chunks.at(-1)]);
  assert.ok(question.prompt.includes(`${chunks.slice(0, -1).join(' ')} ___`));
  assert.notEqual(question.markingReference.acceptedAnswers[0], record.activityData.equivalentPhrase, 'student is not independently producing the full paraphrase');
});

test('Complete the Paraphrase is medium scaffolded paraphrasing evidence, not productive evidence', () => {
  const definition = activityDefinition('complete_paraphrase');
  assert.deepEqual(definition.strands, ['paraphrasing']);
  assert.equal(definition.evidenceStrength, 'medium');
  assert.equal(definition.productive, false);
  assert.deepEqual(SERVER.complete_paraphrase, { strands:['paraphrasing'], evidenceStrength:'medium', productive:false });
});

test('engine fallback strands agree: Complete the Paraphrase carries no production strand', () => {
  const marked = markCuratedAnswer({ item:{}, sense:{}, context:{ contextId:'c', acceptedAnswers:['final chunk'] }, questionType:'complete_paraphrase', rawAnswer:'final chunk' });
  assert.deepEqual(marked.evidence.strands, ['paraphrasing']);
});

test('Complete the Paraphrase cannot increment production counters or satisfy independent production mastery', () => {
  let mastery = fresh();
  mastery = applyEvidence(mastery, evidence('complete_paraphrase', 'c1'), new Date('2026-10-18T10:00:00Z'));
  mastery = applyEvidence(mastery, evidence('complete_paraphrase', 'c2'), new Date('2026-10-18T10:01:00Z'));
  assert.equal(mastery.successfulProductions, 0);
  assert.equal(mastery.unscaffoldedProductions, 0);
  assert.deepEqual(mastery.productionContextIds, []);
  assert.deepEqual(mastery.productionActivityTypes, []);
  assert.equal(mastery.strandEvidence.production, 0);
  assert.notEqual(mastery.status, 'mastered');

  const control = applyEvidence(fresh(), evidence('rewrite_phrase', 'typed'), new Date('2026-10-18T10:02:00Z'));
  assert.equal(control.successfulProductions, 1);
  assert.equal(control.unscaffoldedProductions, 1);
});

test('teacher profile treats current and legacy Complete the Paraphrase attempts as scaffolded phrase-paraphrasing evidence only', () => {
  assert.deepEqual(skillFamiliesForQuestionType('complete_paraphrase'), ['phrase_paraphrasing']);
  const events = [
    { eventType:'question_attempt', metadata:{ question_type:'complete_paraphrase', outcome:'correct', evidence_strength:'strong', support_level:'none' } },
    { eventType:'question_attempt', metadata:{ question_type:'complete_paraphrase', outcome:'correct', evidence_strength:'medium', support_level:'none' } }
  ];
  const before = JSON.stringify(events);
  const profile = buildVocabularySkillProfile(events);
  assert.equal(JSON.stringify(events), before, 'history read must not rewrite stored events');
  assert.equal(profile.skills.lexical_production.evidenceCount, 0);
  assert.equal(profile.skills.phrase_paraphrasing.evidenceCount, 2);
  assert.equal(profile.skills.phrase_paraphrasing.independentStrongCount, 0);
  assert.equal(profile.skills.phrase_paraphrasing.evidenceScore, 4, 'legacy strong evidence is capped to medium when read');
});
