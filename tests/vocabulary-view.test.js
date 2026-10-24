import test from 'node:test';
import assert from 'node:assert/strict';
import { buildUnitProgress, renderVocabularyHome, renderVocabularyUnit, renderSessionSummary, supportiveFeedback } from '../src/vocabulary/views.js';

function root() { return { innerHTML:'' }; }

test('unit progress is unit-sized and qualitative rather than whole-course scoring', () => {
  const occurrences = Array.from({ length:50 }, (_,i) => ({ occurrenceId:`u7_${i+1}`, vocabularyId:`v${i+1}` }));
  const unitMastery = Object.fromEntries(occurrences.map((occ,i) => [occ.occurrenceId, { status:i < 34 ? 'mastered' : i < 42 ? 'building' : 'new', recent_error_pattern:i >= 34 && i < 42 ? 'retrieval_failure' : null }]));
  const globalMastery = Object.fromEntries(occurrences.map((occ,i) => [occ.vocabularyId, { status:i < 34 ? 'mastered' : 'building', review_due_at:i >= 42 && i < 47 ? '2026-10-16T00:00:00Z' : null }]));
  const progress = buildUnitProgress({ occurrences, unitMastery, globalMastery, now:new Date('2026-10-17T00:00:00Z') });
  assert.equal(progress.total, 50);
  assert.equal(progress.mastered, 34);
  assert.equal(progress.needsAnotherLook, 8);
  assert.equal(progress.reviewDue, 5);
  assert.equal('courseTotal' in progress, false);
});

test('unit progress aggregates the same five learning stages used by the progression engine', () => {
  const occurrences = [
    { occurrenceId:'u1_1', vocabularyId:'v1' },
    { occurrenceId:'u1_2', vocabularyId:'v2' },
    { occurrenceId:'u1_3', vocabularyId:'v3' },
    { occurrenceId:'u1_4', vocabularyId:'v4' },
    { occurrenceId:'u1_5', vocabularyId:'v5' }
  ];
  const unitMastery = {
    u1_1:{ status:'new', strandEvidence:{} },
    u1_2:{ status:'building', strandEvidence:{ meaning:2, recognition:1 } },
    u1_3:{ status:'building', strandEvidence:{ meaning:3, context:3 } },
    u1_4:{ status:'secure', strandEvidence:{ meaning:5, recognition:4, context:4 } },
    u1_5:{ status:'mastered', strandEvidence:{ meaning:8, recognition:8, context:8, paraphrasing:8, production:8 } }
  };
  const progress = buildUnitProgress({ occurrences, unitMastery, globalMastery:{} });
  assert.deepEqual(progress.stages, { emerging:1, building:1, developing:1, secure:1, mastered:1 });
  assert.equal(progress.mastered, 1);
});

test('vocabulary home invites unit choice without intimidating 1000-word totals', () => {
  const target = root();
  renderVocabularyHome(target, { displayName:'Student', units:[{ unitNumber:1, unitTitle:'Sports and Free Time', mastered:12, total:50 }] });
  assert.match(target.innerHTML, /Choose a unit/i);
  assert.match(target.innerHTML, /Unit 1/);
  assert.doesNotMatch(target.innerHTML, /1000|1,000/);
  assert.doesNotMatch(target.innerHTML, /Weak|Failed/);
});

test('unit view exposes the fixed six-pathway ladder and review-only Mixed Practice', () => {
  const target = root();
  renderVocabularyUnit(target, { unitNumber:7, unitTitle:'Interviews', progress:{ mastered:34, total:50, needsAnotherLook:8, reviewDue:5 }, pathwayStates:{} });
  assert.match(target.innerHTML, /Choose a vocabulary pathway/);
  assert.equal((target.innerHTML.match(/data-action="open-pathway"/g) ?? []).length, 6);
  assert.match(target.innerHTML, /Recognise/);
  assert.match(target.innerHTML, /Match/);
  assert.match(target.innerHTML, /Apply/);
  assert.match(target.innerHTML, /Recall/);
  assert.match(target.innerHTML, /Mastery/);
  assert.match(target.innerHTML, /Mixed Practice/);
  assert.match(target.innerHTML, /Review only/);
  assert.match(target.innerHTML, /34 \/ 50 overall mastered/);
  assert.equal((target.innerHTML.match(/data-action="start-mixed-review" data-minutes="(5|10|15|20)"/g) ?? []).length, 4, 'timed Mixed Practice offers 5/10/15/20 minutes');
  assert.doesNotMatch(target.innerHTML, /start-timed/);
  assert.doesNotMatch(target.innerHTML, /\b\d{1,3}%\b/);
});

test('old adaptive launcher is not student-facing on the unit page', () => {
  const target = root();
  renderVocabularyUnit(target, { unitNumber:7, unitTitle:'Interviews', progress:{ mastered:34, total:50, needsAnotherLook:8, reviewDue:5 }, pathwayStates:{} });
  assert.doesNotMatch(target.innerHTML, /data-practice-focus=/);
  assert.doesNotMatch(target.innerHTML, /Start Adaptive Session/);
  assert.match(target.innerHTML, /data-action="start-mixed-review"/);
});

test('wrong-answer feedback stays supportive and recovery-oriented', () => {
  const message = supportiveFeedback({ correct:false, misconceptionCategory:'related_but_inaccurate', term:'significant' });
  assert.doesNotMatch(message, /failed|wrong!|bad/i);
  assert.match(message, /another look|try/i);
  assert.match(supportiveFeedback({ correct:true, recovery:true, term:'significant' }), /recovery|recovered|you got/i);
});

test('session summary emphasizes completed learning activities rather than a giant score', () => {
  const target = root();
  renderSessionSummary(target, { durationMinutes:10, summary:{ practised:17, strengthened:6, secure:2, mastered:2, needsAnotherLook:3 } });
  assert.match(target.innerHTML, /10-minute session complete/);
  assert.match(target.innerHTML, /<strong>17<\/strong><span>activities completed<\/span>/);
  assert.match(target.innerHTML, /<strong>6<\/strong><span>successful activities<\/span>/);
  assert.match(target.innerHTML, /<strong>2<\/strong><span>mastered<\/span>/);
  assert.doesNotMatch(target.innerHTML, /score/i);
});
