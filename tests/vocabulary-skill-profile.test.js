import test from 'node:test';
import assert from 'node:assert/strict';
import { buildVocabularySkillProfile, summarizeMisconceptions } from '../src/vocabulary/skill-profile.js';

const events = [
  { metadata:{ question_type:'meaning_in_context', outcome:'correct', evidence_strength:'medium', support_level:'none' } },
  { metadata:{ question_type:'question_text_bridge', outcome:'correct', evidence_strength:'medium', support_level:'none' } },
  { metadata:{ question_type:'phrase_match', outcome:'correct', evidence_strength:'light', support_level:'none' } },
  { metadata:{ question_type:'same_idea', outcome:'try_again', evidence_strength:'medium', support_level:'light', misconception:'quantity_change' } },
  { metadata:{ question_type:'rewrite_idea', outcome:'try_again', evidence_strength:'very_strong', support_level:'none', misconception:'degree_change' } },
  { metadata:{ question_type:'improve_vocabulary', outcome:'correct', evidence_strength:'very_strong', support_level:'none' } },
  { metadata:{ question_type:'collocation_builder', outcome:'try_again', evidence_strength:'strong', support_level:'light', misconception:'unnatural_collocation' } }
];

test('skill profile derives named 0511 skill families from privacy-safe categorical activity metadata', () => {
  const profile = buildVocabularySkillProfile(events);
  assert.equal(profile.skills.meaning_context.label, 'Meaning in context');
  assert.equal(profile.skills.question_text.label, 'Question ↔ Text');
  assert.equal(profile.skills.phrase_paraphrasing.label, 'Phrase paraphrasing');
  assert.equal(profile.skills.idea_paraphrasing.label, 'Idea paraphrasing');
  assert.equal(profile.skills.writing_vocabulary.label, 'Writing vocabulary');
  assert.equal(profile.skills.lexical_production.label, 'Lexical production');
  assert.ok(['Strong','Secure','Developing','Needs attention','Insufficient evidence'].includes(profile.skills.idea_paraphrasing.status));
  assert.equal('percentage' in profile.skills.idea_paraphrasing, false);
});

test('stronger independent evidence counts more than light or supported recognition', () => {
  const profile = buildVocabularySkillProfile([
    { metadata:{ question_type:'phrase_match', outcome:'correct', evidence_strength:'light', support_level:'none' } },
    { metadata:{ question_type:'rewrite_phrase', outcome:'correct', evidence_strength:'very_strong', support_level:'none' } },
    { metadata:{ question_type:'rewrite_phrase', outcome:'correct', evidence_strength:'very_strong', support_level:'major' } }
  ]);
  assert.ok(profile.skills.phrase_paraphrasing.evidenceScore > 0);
  assert.ok(profile.skills.lexical_production.evidenceScore > 0);
  assert.ok(profile.skills.lexical_production.independentStrongCount >= 1);
});

test('Explain Another Way credits phrase or idea paraphrasing according to its authoritative content source', () => {
  const phrase = buildVocabularySkillProfile([
    { metadata:{ question_type:'explain_another_way', content_type:'phrase_set', outcome:'correct', evidence_strength:'very_strong', support_level:'none' } }
  ]);
  assert.equal(phrase.skills.phrase_paraphrasing.evidenceCount, 1);
  assert.equal(phrase.skills.idea_paraphrasing.evidenceCount, 0);
  assert.equal(phrase.skills.lexical_production.evidenceCount, 1);

  const idea = buildVocabularySkillProfile([
    { metadata:{ question_type:'explain_another_way', content_type:'idea_set', outcome:'correct', evidence_strength:'very_strong', support_level:'none' } }
  ]);
  assert.equal(idea.skills.idea_paraphrasing.evidenceCount, 1);
  assert.equal(idea.skills.phrase_paraphrasing.evidenceCount, 0);
  assert.equal(idea.skills.lexical_production.evidenceCount, 1);
});

test('Explain Another Way can recover its authoritative source from server-built activity IDs', () => {
  const phrase = buildVocabularySkillProfile([
    { activity_id:'u1_46_significant:u1_phrase_leisure_time:explain_another_way', metadata:{ question_type:'explain_another_way', outcome:'correct', evidence_strength:'very_strong', support_level:'none' } }
  ]);
  assert.equal(phrase.skills.phrase_paraphrasing.evidenceCount, 1);
  assert.equal(phrase.skills.idea_paraphrasing.evidenceCount, 0);

  const unknown = buildVocabularySkillProfile([
    { activity_id:'legacy:unknown:explain_another_way', metadata:{ question_type:'explain_another_way', outcome:'correct', evidence_strength:'very_strong', support_level:'none' } }
  ]);
  assert.equal(unknown.skills.phrase_paraphrasing.evidenceCount, 0);
  assert.equal(unknown.skills.idea_paraphrasing.evidenceCount, 0);
  assert.equal(unknown.skills.lexical_production.evidenceCount, 1);
});

test('misconception summary turns semantic categories into teacher-readable patterns', () => {
  const patterns = summarizeMisconceptions(events);
  assert.equal(patterns[0].code, 'quantity_change');
  assert.match(patterns.find(row => row.code === 'quantity_change').label, /quantity/i);
  assert.match(patterns.find(row => row.code === 'degree_change').label, /degree|strength|certainty/i);
  assert.match(patterns.find(row => row.code === 'unnatural_collocation').label, /collocation|word combination/i);
});

test('correct responses never count as misconceptions even when legacy metadata carries a misconception code', () => {
  const patterns = summarizeMisconceptions([
    { metadata:{ outcome:'correct', misconception:'degree_change' } },
    { metadata:{ outcome:'try_again', misconception:'degree_change' } },
    { metadata:{ outcome:'correct', misconception:'time_change' } },
    { metadata:{ outcome:'try_again', misconception:'time_change' } }
  ]);
  assert.deepEqual(patterns, [
    { code:'degree_change', label:'Changes degree or certainty', count:1 },
    { code:'time_change', label:'Changes the time relationship', count:1 }
  ]);
});

test('raw answers and prompts are ignored even if a malformed event contains them', () => {
  const profile = buildVocabularySkillProfile([{ metadata:{ question_type:'rewrite_idea', outcome:'correct', evidence_strength:'very_strong', support_level:'none', raw_answer:'PRIVATE', prompt:'PRIVATE' } }]);
  assert.equal(JSON.stringify(profile).includes('PRIVATE'), false);
});
