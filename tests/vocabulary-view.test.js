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

test('vocabulary home invites unit choice without intimidating 1000-word totals', () => {
  const target = root();
  renderVocabularyHome(target, { displayName:'Student', units:[{ unitNumber:1, unitTitle:'Sports and Free Time', mastered:12, total:50 }] });
  assert.match(target.innerHTML, /Choose a unit/i);
  assert.match(target.innerHTML, /Unit 1/);
  assert.doesNotMatch(target.innerHTML, /1000|1,000/);
  assert.doesNotMatch(target.innerHTML, /Weak|Failed/);
});

test('unit view exposes adaptive route and exactly 5 10 15 20 minute timed choices', () => {
  const target = root();
  renderVocabularyUnit(target, { unitNumber:7, unitTitle:'Interviews', progress:{ mastered:34, total:50, needsAnotherLook:8, reviewDue:5 } });
  assert.match(target.innerHTML, /Start Adaptive Session/);
  for (const minutes of [5,10,15,20]) assert.match(target.innerHTML, new RegExp(`>${minutes} min<`));
  assert.equal((target.innerHTML.match(/data-minutes=/g) ?? []).length, 4);
  assert.match(target.innerHTML, /34 \/ 50 mastered/);
});

test('wrong-answer feedback stays supportive and recovery-oriented', () => {
  const message = supportiveFeedback({ correct:false, misconceptionCategory:'related_but_inaccurate', term:'significant' });
  assert.doesNotMatch(message, /failed|wrong!|bad/i);
  assert.match(message, /another look|try/i);
  assert.match(supportiveFeedback({ correct:true, recovery:true, term:'significant' }), /recovery|recovered|you got/i);
});

test('session summary emphasizes learning movement rather than a giant score', () => {
  const target = root();
  renderSessionSummary(target, { durationMinutes:10, summary:{ practised:17, strengthened:6, secure:2, mastered:2, needsAnotherLook:3 } });
  assert.match(target.innerHTML, /10-minute session complete/);
  assert.match(target.innerHTML, /<strong>17<\/strong><span>words practised<\/span>/);
  assert.match(target.innerHTML, /<strong>6<\/strong><span>strengthened<\/span>/);
  assert.match(target.innerHTML, /<strong>2<\/strong><span>mastered<\/span>/);
  assert.doesNotMatch(target.innerHTML, /score/i);
});
