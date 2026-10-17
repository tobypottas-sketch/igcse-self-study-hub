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

test('misconception summary turns semantic categories into teacher-readable patterns', () => {
  const patterns = summarizeMisconceptions(events);
  assert.equal(patterns[0].code, 'quantity_change');
  assert.match(patterns.find(row => row.code === 'quantity_change').label, /quantity/i);
  assert.match(patterns.find(row => row.code === 'degree_change').label, /degree|strength|certainty/i);
  assert.match(patterns.find(row => row.code === 'unnatural_collocation').label, /collocation|word combination/i);
});

test('raw answers and prompts are ignored even if a malformed event contains them', () => {
  const profile = buildVocabularySkillProfile([{ metadata:{ question_type:'rewrite_idea', outcome:'correct', evidence_strength:'very_strong', support_level:'none', raw_answer:'PRIVATE', prompt:'PRIVATE' } }]);
  assert.equal(JSON.stringify(profile).includes('PRIVATE'), false);
});
