import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const sql=read('supabase/diagnostic/review_api.sql');
const edge=read('supabase/functions/vocabulary-diagnostic/index.ts');
const ui=read('src/vocabulary/diagnostic-review.js');
const html=read('vocabulary-diagnostic-review.html');
const teacher=read('src/vocabulary/teacher-app.js');
const router=read('src/vocabulary/router.js');
const page=read('vocabulary.html');

test('review audit remains private and calls are service-role only',()=>{
 assert.match(sql,/private\.vocabulary_diagnostic_reviews/);
 assert.match(sql,/alter table private\.vocabulary_diagnostic_reviews enable row level security/);
 assert.match(sql,/revoke all on private\.vocabulary_diagnostic_reviews from public,anon,authenticated/);
 assert.match(sql,/revoke all on function public\.vocabulary_diagnostic_review_api\(uuid,text,jsonb\)[\s\S]*from public,anon,authenticated/);
 assert.match(sql,/grant execute on function public\.vocabulary_diagnostic_review_api\(uuid,text,jsonb\) to service_role/);
});
test('review RPC restricts staff, preserves audit and does not activate pilot',()=>{
 assert.match(sql,/v_role not in \('teacher','admin'\)/);
 assert.match(sql,/p_action='list'/);
 assert.match(sql,/p_action in \('detail','decision'\)/);
 assert.match(sql,/insert into private\.vocabulary_diagnostic_reviews/);
 assert.match(sql,/REVIEW_SEQUENCE_REQUIRED/);
 assert.match(sql,/INDEPENDENT_LANGUAGE_REVIEW_REQUIRED/);
 assert.match(sql,/REVISION_REQUIRED/);
 assert.doesNotMatch(sql,/set review_status\s*=\s*'pilot'/);
});
test('trusted Edge validates actor via user JWT and dispatches review actions',()=>{
 assert.match(edge,/auth\.getUser\(match\[1\]\)/);
 assert.match(edge,/p_actor:identity\.user\.id/);
 assert.match(edge,/REVIEW_ACTIONS\.has\(action\)/);
 assert.match(edge,/vocabulary_diagnostic_review_api/);
 assert.match(edge,/review-list/);
 assert.match(edge,/review-detail/);
 assert.match(edge,/review-decision/);
});
test('teacher review page is distinct from student app and escapes keyed content',()=>{
 assert.match(html,/src\/vocabulary\/diagnostic-review\.js/);
 assert.match(ui,/\['teacher','admin'\]\.includes\(profile\.role\)/);
 assert.match(ui,/const e=value=>escapeHtml/);
 assert.match(ui,/correctOptionId/);
 assert.match(ui,/rationale/);
 assert.match(ui,/review-notes/);
 assert.doesNotMatch(page,/diagnostic-review\.js/);
});
test('review is linked only from teacher chooser with cache-safe imports',()=>{
 assert.match(teacher,/href="\.\/vocabulary-diagnostic-review\.html"/);
 assert.match(router,/teacher-app\.js\?v=diagnostic-review-v1/);
 assert.match(page,/router\.js\?v=diagnostic-review-v1/);
});
