import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p,'utf8');

test('Essay wrapper exists and launches the GitHub Pages app', () => {
  const html = read('essay-writing.html');
  assert.match(html, /igcse-essay-writing\//);
  assert.match(html, /src\/tracking\/essay-writing-wrapper\.js/);
});

test('Essay wrapper sends staff capability only for authenticated staff roles', () => {
  const js = read('src/tracking/essay-writing-wrapper.js');
  assert.match(js, /select\('id, role, active'\)/);
  assert.match(js, /role === 'teacher' \|\| profile\?\.role === 'admin'/);
  assert.match(js, /type: 'essay-hub-context'/);
  assert.match(js, /staffAccess: isStaffProfile\(\)/);
  assert.doesNotMatch(js, /setHubStaffAccess/);
});

test('Essay tracking never reads or sends student free text', () => {
  const js = read('src/tracking/essay-writing-wrapper.js');
  for (const forbidden of ['draftIntro','draftArg1','draftArg2','draftConc','planQ1','teacherNotes','essayPreview']) {
    assert.equal(js.includes(forbidden), false, `wrapper must not access ${forbidden}`);
  }
  assert.equal(/\.value\b/.test(js), false, 'wrapper must not read form values');
});

test('Essay tracking records only safe milestones and word count', () => {
  const js = read('src/tracking/essay-writing-wrapper.js');
  assert.match(js, /event_type: 'app_open'/);
  assert.match(js, /event_type: 'active_time'/);
  assert.match(js, /event_type: 'section_use'/);
  assert.match(js, /metadata: \{ word_count:/);
});

test('Essay app launch migration points the Hub card at the tracked wrapper', () => {
  const sql = read('supabase/migrations/20261014100000_essay_writing_tracked_launch.sql');
  assert.match(sql, /essay_writing/);
  assert.match(sql, /essay-writing\.html/);
});
