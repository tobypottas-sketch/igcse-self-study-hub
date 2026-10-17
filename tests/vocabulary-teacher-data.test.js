import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTeacherVocabularyData } from '../src/vocabulary/teacher-data.js';

const raw = {
  profiles:[{ id:'s1', display_name:'Student One', role:'student' },{ id:'s2', display_name:'Student Two', role:'student' }],
  memberships:[{ student_id:'s1', class_id:'c1', ended_at:null },{ student_id:'s2', class_id:'c2', ended_at:null }],
  classes:[{ id:'c1', class_name:'11A' },{ id:'c2', class_name:'11B' }],
  items:[{ vocabulary_id:'v1', term:'significant' }],
  occurrences:[{ occurrence_id:'u7v1', vocabulary_id:'v1', unit_number:7, unit_title:'Interviews' }],
  mastery:[{ student_id:'s1', vocabulary_id:'v1', status:'building', strand_evidence:{ production:0 }, recent_error_pattern:'retrieval_failure', updated_at:'2026-10-16T10:00:00Z' }],
  activity:[{ user_id:'s1', occurred_at:'2026-10-16T10:00:00Z', event_type:'question_attempt', metadata:{ strand:'production' } }]
};

test('teacher data normalization keeps classes separate and maps only authorized rows supplied by RLS', () => {
  const result = normalizeTeacherVocabularyData(raw);
  assert.equal(result.classes.length, 2);
  const class11A = result.classes.find(row => row.id === 'c1');
  assert.equal(class11A.students.length, 1);
  assert.equal(class11A.students[0].displayName, 'Student One');
  assert.equal(class11A.mastery.length, 1);
  assert.equal(class11A.activity.length, 1);
  const class11B = result.classes.find(row => row.id === 'c2');
  assert.equal(class11B.mastery.length, 0);
});

test('normalized teacher evidence never introduces answer-text fields', () => {
  const result = normalizeTeacherVocabularyData(raw);
  assert.equal(JSON.stringify(result).includes('answer_text'), false);
  assert.equal(JSON.stringify(result).includes('typed_answer'), false);
});
