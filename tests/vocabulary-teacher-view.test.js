import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTeacherOverview, renderProblemArea, renderStudentVocabularyProfile } from '../src/vocabulary/teacher-views.js';

function root() { return { innerHTML:'' }; }

const insights = {
  studentsNeedingAttention:[{ studentId:'s1', displayName:'Student One', targetCount:4 }],
  mainWeakness:{ strand:'production', problemType:'skill', affectedCount:7, summary:'Students understand meanings but cannot reliably produce accurate equivalents.' },
  difficultWords:[{ vocabularyId:'v1', term:'significant', affectedCount:8 },{ vocabularyId:'v2', term:'proficiency', affectedCount:7 }],
  engagement:{ practisedRecently:18, notRecentlyPractised:6 },
  trend:{ label:'Improving', improvedCount:9 }
};

test('teacher overview leads with interpreted signals and quick actions', () => {
  const target = root();
  renderTeacherOverview(target, { className:'11A', insights });
  assert.match(target.innerHTML, /Students needing attention/i);
  assert.match(target.innerHTML, /Main class weakness/i);
  assert.match(target.innerHTML, /production/i);
  assert.match(target.innerHTML, /significant/i);
  assert.match(target.innerHTML, /Recommend Hub Practice/i);
  assert.match(target.innerHTML, /Create Teams Target List/i);
  assert.doesNotMatch(target.innerHTML, /raw answer|student answer/i);
});

test('problem area view answers what why who and action without a raw answer table', () => {
  const target = root();
  renderProblemArea(target, {
    className:'11A',
    drilldown:{ strand:'production', affectedStudents:[{ studentId:'s1', displayName:'Student One' }], words:[{ vocabularyId:'v1', term:'significant', affectedCount:2 }], failureTypes:[{ type:'retrieval_failure', count:2 }] }
  });
  assert.match(target.innerHTML, /Productive|production/i);
  assert.match(target.innerHTML, /Student One/);
  assert.match(target.innerHTML, /retrieval failure/i);
  assert.match(target.innerHTML, /Recommend practice/i);
  assert.doesNotMatch(target.innerHTML, /typed answer|raw answer/i);
});

test('individual student view is a learning profile rather than a percentage wall', () => {
  const target = root();
  renderStudentVocabularyProfile(target, {
    className:'11A',
    profile:{ studentId:'s1', displayName:'Student One', strongestStrand:'meaning', developmentArea:'production', lastPractice:'2026-10-16T10:00:00Z', strands:{ meaning:'Strong', recognition:'Secure', context:'Secure', paraphrasing:'Developing', production:'Needs attention' }, persistentTargets:[{ vocabularyId:'v1', term:'significant', status:'building' }] }
  });
  assert.match(target.innerHTML, /Student One/);
  assert.match(target.innerHTML, /Strongest area/i);
  assert.match(target.innerHTML, /Development area/i);
  assert.match(target.innerHTML, /significant/);
  assert.doesNotMatch(target.innerHTML, /%/);
});
