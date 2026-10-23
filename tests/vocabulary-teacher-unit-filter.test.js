import test from 'node:test';
import assert from 'node:assert/strict';
import { selectedUnit, unitOccurrences, unitOptions } from '../src/vocabulary/teacher-units.js';
import { buildPathwayAnalytics } from '../src/vocabulary/analytics.js';
import { renderTeacherOverview } from '../src/vocabulary/teacher-views.js';

const occurrence = (unit, n) => ({ occurrenceId:`u${unit}_${n}`, vocabularyId:`vocab_${unit}_${n}`, unitNumber:unit, unitTitle:unit === 1 ? 'Sports and Free Time' : 'Digital Life' });
const unit1 = [1, 2, 3].map(n => occurrence(1, n));
const unit2 = [1, 2, 3].map(n => occurrence(2, n));
const students = [{ id:'s1', displayName:'Ana' }];
const classData = (extra = {}) => ({ occurrences:[...unit1, ...unit2], activity:[], ...extra });
const everyStage = ['recognise', 'match', 'apply', 'recall', 'mastery'];
const done = { status:'mastered', contextualEvidence:{ pathwayProgress:Object.fromEntries(['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'].map(id => [id, { currentStage:'mastery', completedStages:everyStage, needsPractice:false }])) } };

test('options list each unit once, and the default is the unit practised most recently', () => {
  const data = classData({ activity:[
    { occurredAt:'2026-10-01T10:00:00Z', metadata:{ unit_number:1 } },
    { occurredAt:'2026-10-20T10:00:00Z', metadata:{ unit_number:2 } }
  ] });
  assert.deepEqual(unitOptions(data).map(row => row.unitNumber), [1, 2]);
  assert.equal(selectedUnit(data).selected, 2);
  assert.equal(selectedUnit(data).selectedTitle, 'Digital Life');
});

test('with no practice yet the first unit is shown; an explicit choice wins; unknown units fall back', () => {
  assert.equal(selectedUnit(classData()).selected, 1);
  assert.equal(selectedUnit(classData({ selectedUnit:2 })).selected, 2);
  assert.equal(selectedUnit(classData({ selectedUnit:'all' })).selected, 'all');
  assert.equal(selectedUnit(classData({ selectedUnit:9 })).selected, 1);
});

test('the pathway table only counts the selected unit, so a new unit cannot make finished work look undone', () => {
  const global = [];
  const unitMastery = unit1.map(row => ({ studentId:'s1', occurrenceId:row.occurrenceId, ...done }));
  const targets = [...unit1, ...unit2].map(row => ({ vocabularyId:row.vocabularyId, term:row.vocabularyId }));
  const run = data => buildPathwayAnalytics({ students, targets, occurrences:unitOccurrences(data), globalMastery:global, unitMastery }).studentRows[0].pathways;
  const unit1Only = run(classData({ selectedUnit:1 }));
  const unit2Only = run(classData({ selectedUnit:2 }));
  const both = run(classData({ selectedUnit:'all' }));
  assert.equal(unit1Only.meaning.currentStage, 'mastery');
  assert.equal(unit2Only.meaning.currentStage, 'recognise');
  assert.notEqual(both.meaning.currentStage, 'mastery', 'all units together is held back by the unstarted unit, which is why it is no longer the default');
});

test('the overview shows the unit chips only when there is more than one unit and marks the selection', () => {
  const root = { innerHTML:'' };
  renderTeacherOverview(root, { className:'11A', units:selectedUnit(classData({ selectedUnit:2 })) });
  assert.match(root.innerHTML, /data-action="teacher-select-unit" data-unit="1"/);
  assert.match(root.innerHTML, /data-unit="2"[^>]*aria-pressed="true"/);
  assert.match(root.innerHTML, /data-unit="all"/);
  assert.match(root.innerHTML, /Showing Unit 2: Digital Life/);
  const single = { innerHTML:'' };
  renderTeacherOverview(single, { className:'11A', units:selectedUnit({ occurrences:unit1, activity:[] }) });
  assert.doesNotMatch(single.innerHTML, /teacher-select-unit/);
});
