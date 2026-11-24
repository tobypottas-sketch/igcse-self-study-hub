import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=x=>fs.readFileSync(new URL('../'+x,import.meta.url),'utf8');
const student=read('src/vocabulary/ngsl-student.js');
const teacher=read('src/vocabulary/ngsl-teacher-results.js');
const edge=read('supabase/functions/vocabulary-diagnostic/index.ts');
const sql=read('supabase/diagnostic/ngsl_integrity_monitor_v1.sql');
test('the student is informed of monitoring before starting without forced fullscreen',()=>{
 assert.match(student,/During this assessment, leaving the tab is recorded/);
 assert.match(student,/You can scroll normally in your browser/);
 assert.doesNotMatch(student,/root\.requestFullscreen\(/);
 assert.match(student,/if\(action==='start'\)\{void start\(\);\}/);
});
test('focus, visibility and fullscreen exits are logged as advisory signals',()=>{
 for(const term of ['visibilitychange','fullscreenchange',"'blur'","'tab_hidden'","'window_blur'","'fullscreen_exit'","'focus_return'"])
  assert.ok(student.includes(term),term);
 assert.match(student,/now-state\.lastFocusAt<1200/);
 assert.match(student,/api\('integrity-event'/);
 assert.match(student,/crypto\.randomUUID\(\)/);
 assert.match(student,/data-integrity-notice/);
 assert.doesNotMatch(student,/document\.onkeydown|event\.preventDefault\(\)|auto.?fail|auto.?submit/i);
});
test('assessment scoring and pause are unaffected by focus monitoring',()=>{
 assert.match(student,/api\('respond',state\.pending\)/);
 assert.match(student,/api\('pause'/);
 assert.match(student,/stopMonitoring\(\)/);
 assert.match(student,/if\(!state\.monitoring\|\|!q\|\|state\.complete/);
});
test('edge rejects arbitrary event fields and requires verified user identity',()=>{
 assert.match(edge,/ngsl-integrity-event/);
 assert.match(edge,/Object\.keys\(payload\)\.length===4/);
 assert.match(edge,/validUuid\(payload\.eventId\)/);
 assert.match(edge,/vocabulary_ngsl_integrity_event/);
 assert.match(edge,/vocabulary_ngsl_integrity_report/);
 assert.match(edge,/auth\.getUser\(match\[1\]\)/);
});
test('server logs are in private schema with RLS, ownership and idempotency',()=>{
 assert.match(sql,/create table if not exists private\.ngsl_integrity_events/);
 assert.match(sql,/alter table private\.ngsl_integrity_events enable row level security/);
 assert.match(sql,/revoke all on private\.ngsl_integrity_events from public,anon,authenticated/);
 assert.match(sql,/where id=p_session_id and student_id=p_actor/);
 assert.match(sql,/unique\(session_id,event_id\)/);
 assert.match(sql,/on conflict\(session_id,event_id\) do nothing/);
 assert.match(sql,/occurred_at timestamptz not null default now\(\)/);
 assert.doesNotMatch(sql,/auto.?fail|set correct|update private\.ngsl_baseline_results/i);
});
test('teacher reports are scoped to owned classes or administrator',()=>{
 assert.match(sql,/join public\.teacher_classes tc on tc\.class_id=m\.class_id/);
 assert.match(sql,/tc\.teacher_id=p_actor/);
 assert.match(sql,/m\.ended_at is null/);
 assert.match(sql,/p\.role::text='admin'/);
 assert.match(teacher,/permitted\.has\(entry\.studentId\)/);
 assert.match(teacher,/Focus events \(review only\)/);
 assert.match(teacher,/do not prove cheating/);
});
