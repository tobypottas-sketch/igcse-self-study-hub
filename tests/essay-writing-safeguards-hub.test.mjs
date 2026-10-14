import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');

test('Essay wrapper sends authenticated user context to the child frame', () => {
  const js = read('src/tracking/essay-writing-wrapper.js');
  assert.doesNotMatch(js, /setHubStaffAccess/);
  assert.doesNotMatch(js, /setHubStorageNamespace/);
  assert.match(js, /storageNamespace:\s*`user-\$\{profile\.id\}`/);
  assert.match(js, /staffAccess:\s*isStaffProfile\(\)/);
  assert.match(js, /type:\s*['"]essay-hub-context['"]/);
  assert.match(js, /postMessage\([\s\S]*window\.location\.origin/);
});

test('Essay wrapper resolves only UUID controlled-task ids from the URL', () => {
  const js = read('src/tracking/essay-writing-wrapper.js');
  assert.match(js, /ctask/);
  assert.match(js, /UUID_RE/);
  assert.match(js, /essay-task-action/);
  assert.match(js, /action:\s*['"]fetch['"]/);
  assert.match(js, /controlledTask/);
});

test('Essay wrapper accepts controlled-task creation only from its iframe and staff', () => {
  const js = read('src/tracking/essay-writing-wrapper.js');
  assert.match(js, /event\.source\s*!==\s*frame\.contentWindow/);
  assert.match(js, /event\.origin\s*!==\s*window\.location\.origin/);
  assert.match(js, /essay-create-controlled-task/);
  assert.match(js, /function\s+isStaffProfile\s*\(/);
  assert.match(js, /return role === 'teacher' \|\| profile\?\.role === 'admin'/);
  assert.match(js, /if \(!isStaffProfile\(\)\)/);
  assert.match(js, /action:\s*['"]create['"]/);
  assert.match(js, /essay-controlled-task-created/);
});

test('Essay wrapper still never reads student written fields', () => {
  const js = read('src/tracking/essay-writing-wrapper.js');
  for (const forbidden of ['draftIntro','draftArg1','draftArg2','draftConc','planQ1','planQ2','teacherNotes','essayPreview']) {
    assert.equal(js.includes(forbidden), false, `wrapper must not access ${forbidden}`);
  }
  assert.equal(/\.value\b/.test(js), false, 'wrapper must not read form values');
});

test('Essay controlled-task table is private from browser roles', () => {
  const sql = read('supabase/migrations/20261014173500_essay_controlled_tasks.sql');
  assert.match(sql, /create table public\.essay_tasks/i);
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /revoke all on public\.essay_tasks from anon, authenticated/i);
  assert.match(sql, /created_by uuid not null references public\.profiles\(id\)/i);
  assert.match(sql, /settings jsonb not null/i);
});

test('Controlled Essay content stays in the URL fragment and never goes to Supabase', () => {
  const wrapper = read('src/tracking/essay-writing-wrapper.js');
  const index = read('supabase/functions/essay-task-action/index.ts');
  const validation = read('supabase/functions/essay-task-action/validation.js');

  assert.match(wrapper, /function\s+encodeControlledSettings\s*\(/);
  assert.match(wrapper, /function\s+decodeControlledSettings\s*\(/);
  assert.match(wrapper, /function\s+hashControlledPayload\s*\(/);
  assert.match(wrapper, /url\.hash\s*=\s*encodedSettings/);
  assert.match(wrapper, /settingsHash/);
  assert.doesNotMatch(wrapper, /body:\s*\{[\s\S]{0,180}action:\s*['"]create['"][\s\S]{0,180}settings:\s*data\.settings/);

  assert.match(index, /callerClient\.auth\.getUser\(\)/);
  assert.match(index, /from\('profiles'\)/);
  assert.match(index, /callerProfile\.role !== 'teacher'.*callerProfile\.role !== 'admin'/s);
  assert.match(index, /settings:\s*\{\s*settingsHash:\s*input\.settingsHash\s*\}/);
  assert.doesNotMatch(index, /settings:\s*input\.settings/);
  assert.match(index, /settingsHash:\s*data\.settings\?\.settingsHash/);

  assert.match(validation, /HASH_RE/);
  assert.match(validation, /settingsHash/);
  for (const forbidden of ['essayQuestion','audience','promptIdeas','successCriteria','opinionPhrases','linkingPhrases','draftIntro','draftArg1','draftArg2','draftConc','planQ1','teacherNotes','studentText','essayText']) {
    assert.equal(validation.includes(forbidden), false, `Edge validation must not accept remote content field ${forbidden}`);
  }
});

test('Controlled Essay settings are verified against the remote fingerprint before use', () => {
  const wrapper = read('src/tracking/essay-writing-wrapper.js');
  assert.match(wrapper, /decodeControlledSettings\(window\.location\.hash\)/);
  assert.match(wrapper, /hashControlledPayload\(encodedSettings\)/);
  assert.match(wrapper, /settingsHash\s*!==\s*task\.settingsHash/);
  assert.match(wrapper, /throw new Error\(['"]Controlled Essay task link has been altered/);
});
