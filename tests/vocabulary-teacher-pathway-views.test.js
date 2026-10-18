import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTeacherOverview, renderStudentVocabularyProfile } from '../src/vocabulary/teacher-views.js';

const pathways = {
  meaning:{ currentStage:'apply', mastered:false, needsPractice:false },
  context:{ currentStage:'match', mastered:false, needsPractice:true },
  word_families:{ currentStage:'recognise', mastered:false, needsPractice:false },
  paraphrasing:{ currentStage:'recall', mastered:false, needsPractice:false },
  precision_use:{ currentStage:'apply', mastered:false, needsPractice:false },
  spelling_recall:{ currentStage:'mastery', mastered:true, needsPractice:false }
};
function root() { return { innerHTML:'' }; }

test('teacher class overview shows a compact six-pathway progression summary without percentages', () => {
  const target = root();
  renderTeacherOverview(target, {
    className:'Class 1',
    insights:{
      studentsNeedingAttention:[], mainWeakness:null, difficultWords:[], misconceptionPatterns:[],
      skillProfile:{ skills:{} }, engagement:{ practisedRecently:0, notRecentlyPractised:2 }, trend:{ label:'Stable', improvedCount:0 },
      pathwayAnalytics:{ studentRows:[{ studentId:'s1', displayName:'Student One', pathways },{ studentId:'s2', displayName:'Student Two', pathways }], wordRows:[] }
    }
  });
  assert.match(target.innerHTML,/Vocabulary pathways/);
  for (const text of ['Meaning','Context','Word Families','Paraphrasing','Precision &amp; Use','Spelling &amp; Recall']) assert.match(target.innerHTML,new RegExp(text));
  assert.doesNotMatch(target.innerHTML,/\d+%/);
});

test('student teacher profile shows all six independent pathway stages', () => {
  const target = root();
  renderStudentVocabularyProfile(target, {
    className:'Class 1',
    profile:{ displayName:'Student One', strands:{}, persistentTargets:[], skillProfile:{ skills:{} }, misconceptionPatterns:[], pathways }
  });
  assert.match(target.innerHTML,/Vocabulary pathways/);
  assert.match(target.innerHTML,/data-teacher-pathway="meaning"[^>]*>[\s\S]*Apply/);
  assert.match(target.innerHTML,/data-teacher-pathway="context"[^>]*>[\s\S]*Needs practice/);
  assert.match(target.innerHTML,/data-teacher-pathway="spelling_recall"[^>]*>[\s\S]*Mastery/);
  assert.doesNotMatch(target.innerHTML,/\d+%/);
});
