import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {scoreStatus,safeCsv,fetchNGSLPolishedResults} from '../src/vocabulary/ngsl-teacher-report-polished.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('missing score is not automatically treated as Not started',()=>{
 assert.equal(scoreStatus({result:null,progress:{state:'in_progress',answered:8}}),'progress');
 assert.equal(scoreStatus({result:null,progress:{state:'interrupted',answered:20}}),'progress');
 assert.equal(scoreStatus({result:null,progress:null}),'notstarted');
 assert.equal(scoreStatus({result:null,progress:{state:'completed',answered:50}}),'pending');
 assert.equal(scoreStatus({result:{correct:32}}),'completed');
});
test('CSV safeguards spreadsheet formula injection and commas',()=>{
 assert.equal(safeCsv('=1+1'),'"\'=1+1"');
 assert.equal(safeCsv('Jane, Doe'),'"Jane, Doe"');
 assert.equal(safeCsv('Line\nname'),'"Line name"');
 assert.equal(safeCsv('"hi"'), '"""hi"""');
});
test('teacher report source includes safe filters, action summary, browser event panel and NGSL/CEFR limitations',()=>{
 const code=read('src/vocabulary/ngsl-teacher-report-polished.js');
 for(const phrase of ['data-ngsl-search','data-ngsl-tab','data-ngsl-sort','data-ngsl-export','data-ngsl-dialog','ngsl-p-weak','In progress','Not a CEFR placement test'])assert.ok(code.includes(phrase),phrase);
 assert.match(code,/data-ngsl-quick/);
 assert.match(code,/not proof of cheating/);
 assert.match(code,/Object\.hasOwn\(TYPES,item\.type\)/);
 assert.match(code,/Array\.isArray\(incident\?\.timeline\)/);
});
test('progress RPC returns teacher-scoped session counts and no question content',()=>{
 const sql=read('supabase/sql/ngsl-teacher-progress-report.sql');
 assert.match(sql,/from private\.ngsl_baseline_sessions/);
 assert.match(sql,/join public\.teacher_classes/);
 assert.match(sql,/m\.ended_at is null/);
 assert.match(sql,/role::text in \('teacher','admin'\)/);
 assert.match(sql,/revoke all on function public\.vocabulary_ngsl_teacher_progress\(uuid\) from public,anon,authenticated/);
 assert.match(sql,/grant execute on function public\.vocabulary_ngsl_teacher_progress\(uuid\) to service_role/);
 assert.doesNotMatch(sql,/question_order|answer_orders|selected_letter|correct_answer|missed_targets/);
});
test('Edge API includes teacher progress in allowlist but still derives verified JWT identity',()=>{
 const src=read('supabase/functions/vocabulary-diagnostic/index.ts');
 assert.match(src,/ngsl-teacher-progress/);
 assert.match(src,/vocabulary_ngsl_teacher_progress/);
 assert.match(src,/getUser\(match\[1\]\)/);
 assert.match(src,/p_actor:identity\.user\.id/);
});
test('student activity modules and NGSL question bank remain untouched by report routing',()=>{
 const src=read('src/vocabulary/teacher-app.js');
 assert.match(src,/fetchNGSLPolishedResults/);
 assert.match(src,/renderNGSLPolishedReport/);
 const html=read('vocabulary.html');
 assert.match(html,/vocabulary-ngsl-teacher-polished\.css/);
});

test('student results are initially grouped, capped at 12 rows, and have navigation',()=>{
 const src=read('src/vocabulary/ngsl-teacher-report-polished.js');
 assert.match(src,/let filter='completed',sort='low',query='',page=0/);
 assert.match(src,/const PAGE_SIZE=12/);
 assert.match(src,/matches\.slice\(page\*PAGE_SIZE,\(page\+1\)\*PAGE_SIZE\)/);
 for(const action of ['data-ngsl-tab="completed"','data-ngsl-tab="progress"','data-ngsl-tab="notstarted"',
 'data-ngsl-tab="incomplete"','data-ngsl-tab="review"','data-ngsl-tab="all"','data-ngsl-prev','data-ngsl-next'])
  assert.ok(src.includes(action),action);
 assert.match(src,/page=0;draw\(\)/);
 assert.match(src,/const records=displayed\(\)\.map/); // export includes all matches rather than only current page
});
