import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWeeklyUsage, MAX_WEEKS_BACK } from '../src/vocabulary/weekly-usage.js';
import { weeklyUsagePanel, renderTeacherOverview } from '../src/vocabulary/teacher-views.js';
import { readFileSync } from 'node:fs';

const students = [{id:'a'}, {id:'b'}, {id:'c'}];
const at = (studentId, date, eventType = 'question_attempt') => ({studentId, occurredAt:date, eventType});
const now = new Date(2026, 10, 12, 16); // Thursday, local time

test('weekly usage includes Monday to Sunday, deduplicates each student per day and ignores irrelevant events', () => {
  const usage = buildWeeklyUsage({ students, now, activity:[
    at('a','2026-11-09T02:00:00'), at('a','2026-11-09T04:00:00'),
    at('b','2026-11-10T02:00:00'), at('a','2026-11-10T03:00:00'),
    at('c','2026-11-12T01:00:00'),
    at('outside','2026-11-12T01:00:00'), at('c','2026-11-11T01:00:00','page_view'),
    at('a','2026-11-16T01:00:00'), at('b','not-a-date')
  ] });
  assert.equal(usage.days.length, 7);
  assert.deepEqual(usage.days.map(d => d.day), ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']);
  assert.deepEqual(usage.days.map(d => d.activeStudents), [1,2,0,1,0,0,0]);
  assert.equal(usage.activeStudents, 3);
  assert.equal(usage.busiestDay, 'Tue');
  assert.equal(usage.dailyAverage, 1);
  assert.equal(usage.canNext, false);
  assert.equal(usage.canPrevious, true);
});
test('previous week navigation uses historical data and excludes current week', () => {
  const activity = [at('a','2026-11-02T01:00:00'),at('b','2026-11-02T02:00:00'),at('c','2026-11-08T02:00:00'),at('a','2026-11-09T01:00:00')];
  const usage = buildWeeklyUsage({ students, activity, now, weeksAgo:1 });
  assert.deepEqual(usage.days.map(d => d.activeStudents), [2,0,0,0,0,0,1]);
  assert.equal(usage.activeStudents,3);
  assert.equal(usage.canNext,true);
});
test('empty weeks retain seven zeroes and report no busiest day', () => {
  const usage = buildWeeklyUsage({students,now,activity:[],weeksAgo:4});
  assert.deepEqual(usage.days.map(d => d.activeStudents), [0,0,0,0,0,0,0]);
  assert.equal(usage.busiestDay,'None');
  assert.equal(usage.dailyAverage,0);
});
test('navigation bounds respect the 90-day source history', () => {
  assert.equal(buildWeeklyUsage({now,weeksAgo:-99}).weeksAgo,0);
  const atLimit=buildWeeklyUsage({now,weeksAgo:999});
  assert.equal(atLimit.weeksAgo,MAX_WEEKS_BACK);
  assert.equal(atLimit.canPrevious,false);
  assert.equal(atLimit.canNext,true);
});
test('weekly panel is a real SVG line chart with accessible day points, arrows and statistics', () => {
  const html=weeklyUsagePanel(buildWeeklyUsage({students,now,activity:[at('a','2026-11-09T02:00:00')]}));
  assert.match(html, /data-weekly-activity/);
  assert.match(html, /<polyline/);
  assert.equal((html.match(/<circle /g) || []).length,4); // Thu current week; future dates are not plotted
  assert.match(html,/Previous week/);
  assert.match(html,/Next week/);
  assert.match(html,/Average students active per day/);
  assert.match(html,/1\.0 students/);
  assert.match(html,/Activity only — not evidence of mastery/);
  assert.match(html,/data-action="teacher-week-previous"/);
});
test('weekly chart is placed above the existing monthly chart without replacing it', () => {
  const root={innerHTML:''};
  renderTeacherOverview(root,{weeklyUsage:buildWeeklyUsage({students,now}),habits:{monthlyUsage:null},insights:null});
  assert.ok(root.innerHTML.indexOf('data-weekly-activity') < root.innerHTML.indexOf('class="vocab-teacher-grid"'));
  const app=readFileSync(new URL('../src/vocabulary/teacher-app.js',import.meta.url),'utf8');
  assert.match(app,/changeWeeklyWeek\(1\)/);
  assert.match(app,/changeWeeklyWeek\(-1\)/);
  assert.match(app,/panel\.outerHTML = weeklyUsagePanel/);
  const html=readFileSync(new URL('../vocabulary.html',import.meta.url),'utf8');
  assert.match(html,/vocabulary-weekly-activity\.css/);
});
