import test from 'node:test';
import assert from 'node:assert/strict';
import { renderTeacherOverview, renderProblemArea, renderStudentVocabularyProfile } from '../src/vocabulary/teacher-views.js';

function root() { return { innerHTML:'' }; }

const skillProfile = {
  skills:{
    meaning_context:{ label:'Meaning in context', status:'Secure', evidenceCount:5 },
    question_text:{ label:'Question ↔ Text', status:'Strong', evidenceCount:4 },
    phrase_paraphrasing:{ label:'Phrase paraphrasing', status:'Secure', evidenceCount:4 },
    idea_paraphrasing:{ label:'Idea paraphrasing', status:'Needs attention', evidenceCount:3 },
    writing_vocabulary:{ label:'Writing vocabulary', status:'Developing', evidenceCount:3 },
    lexical_production:{ label:'Lexical production', status:'Developing', evidenceCount:4 }
  },
  strongestSkill:'question_text',
  developmentSkill:'idea_paraphrasing'
};

const insights = {
  studentsNeedingAttention:[{ studentId:'s1', displayName:'Student One', targetCount:4 }],
  mainWeakness:{ strand:'idea_paraphrasing', skillId:'idea_paraphrasing', problemType:'0511_skill', affectedCount:7, summary:'Students are changing meaning when they paraphrase whole ideas.' },
  skillProfile,
  misconceptionPatterns:[{ code:'quantity_change', label:'Changes quantities while paraphrasing', count:4 },{ code:'unnatural_collocation', label:'Uses unnatural collocations or word combinations', count:2 }],
  difficultWords:[{ vocabularyId:'v1', term:'significant', affectedCount:8 },{ vocabularyId:'v2', term:'proficiency', affectedCount:7 }],
  engagement:{ practisedRecently:18, notRecentlyPractised:6 },
  trend:{ label:'Improving', improvedCount:9 }
};

test('teacher overview leads with interpreted 0511 signals and quick actions', () => {
  const target = root();
  renderTeacherOverview(target, { className:'11A', insights });
  assert.match(target.innerHTML, /Students needing attention/i);
  assert.match(target.innerHTML, /Main class weakness/i);
  assert.match(target.innerHTML, /Idea paraphrasing/i);
  assert.match(target.innerHTML, /Question ↔ Text|Question &harr; Text/i);
  assert.match(target.innerHTML, /Changes quantities/i);
  assert.match(target.innerHTML, /significant/i);
  assert.match(target.innerHTML, /Recommend Hub Practice/i);
  assert.match(target.innerHTML, /Create Teams Target List/i);
  assert.doesNotMatch(target.innerHTML, /raw answer|student answer/i);
  assert.doesNotMatch(target.innerHTML, /%/);
});

test('problem area view answers what why who and action without a raw answer table', () => {
  const target = root();
  renderProblemArea(target, {
    className:'11A',
    drilldown:{ skillId:'idea_paraphrasing', affectedStudents:[{ studentId:'s1', displayName:'Student One' }], words:[{ vocabularyId:'v1', term:'significant', affectedCount:2 }], failureTypes:[{ type:'quantity_change', label:'Changes quantities while paraphrasing', count:2 }] }
  });
  assert.match(target.innerHTML, /Idea paraphrasing/i);
  assert.match(target.innerHTML, /Student One/);
  assert.match(target.innerHTML, /Changes quantities/i);
  assert.match(target.innerHTML, /Recommend practice/i);
  assert.doesNotMatch(target.innerHTML, /typed answer|raw answer/i);
});

test('individual student view is a qualitative 0511 learning profile rather than a percentage wall', () => {
  const target = root();
  renderStudentVocabularyProfile(target, {
    className:'11A',
    profile:{
      studentId:'s1', displayName:'Student One', strongestStrand:'meaning', developmentArea:'production',
      strongestSkill:'question_text', developmentSkill:'idea_paraphrasing', skillProfile,
      misconceptionPatterns:[{ code:'quantity_change', label:'Changes quantities while paraphrasing', count:2 }],
      lastPractice:'2026-10-16T10:00:00Z',
      strands:{ meaning:'Strong', recognition:'Secure', context:'Secure', paraphrasing:'Developing', production:'Needs attention' },
      persistentTargets:[{ vocabularyId:'v1', term:'significant', status:'building' }]
    }
  });
  assert.match(target.innerHTML, /Student One/);
  assert.match(target.innerHTML, /Question ↔ Text|Question &harr; Text/i);
  assert.match(target.innerHTML, /Idea paraphrasing/i);
  assert.match(target.innerHTML, /Changes quantities/i);
  assert.match(target.innerHTML, /significant/);
  assert.doesNotMatch(target.innerHTML, /%/);
});
