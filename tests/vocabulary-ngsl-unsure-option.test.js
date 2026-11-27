import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
test('the baseline keeps four shuffled meaning choices and a fifth fixed unsure choice',()=>{
 const source=read('src/vocabulary/ngsl-student.js');
 const css=read('vocabulary-diagnostic-student.css');
 assert.match(source,/q\.options\.length!==4/);
 assert.match(source,/const unsure=/);
 assert.match(source,/value="U"/);
 assert.match(source,/I.m not sure/);
 assert.match(source,/options\+unsure/);
 assert.match(source,/\['A','B','C','D','U'\]\.includes\(state\.answer\)/);
 assert.match(source,/\['A','B','C','D','U'\]\.includes\(event\.target\.value\)/);
 assert.match(css,/\.ngsl-unsure-option/);
 assert.match(source,/['correct','correctAnswer','key','rank','ngslRank']/);
});
test('server strictly validates U, saves it as incorrect, and exposes separate count',()=>{
 const edge=read('supabase/functions/vocabulary-diagnostic/index.ts');
 const sql=read('supabase/diagnostic/ngsl_unsure_option_20261120.sql');
 assert.match(edge,/\['A','B','C','D','U'\]\.includes\(payload\.answerId\)/);
 assert.match(sql,/v_selected not in \('A','B','C','D','U'\)/);
 assert.match(sql,/when v_selected='U' then 'U'/);
 assert.match(sql,/v_original=item\.correct_answer/);
 assert.match(sql,/selected_letter='U'/);
 assert.match(sql,/alter table private\.ngsl_baseline_responses/);
 assert.match(sql,/source_letter in \('A','B','C','D','U'\)/);
 assert.doesNotMatch(sql,/drop table|delete from|truncate/i);
});
test('students and teachers see correct / wrong / unsure with no effect on existing results',()=>{
 const student=read('src/vocabulary/ngsl-student.js');
 const report=read('src/vocabulary/ngsl-teacher-report-polished.js');
 const html=read('vocabulary.html'),router=read('src/vocabulary/router.js');
 assert.match(student,/const hasUnsure=/);
 assert.match(student,/50-correct-unsure/);
 assert.match(student,/ngsl-response-breakdown/);
 assert.match(report,/Not sure<\/th>/);
 assert.match(report,/r\.result\?\.unsure\?\?''/);
 assert.match(html,/diagnostic-student\.css\?v=ngsl-legend-width-v5/);
 assert.match(html,/router\.js\?v=ngsl-normal-scroll-v4/);
 assert.match(router,/ngsl-student\.js\?v=ngsl-normal-scroll-v4/);
});

test('NGSL fullscreen root permits vertical touch scrolling and tablet controls remain in flow',()=>{
 const css=read('vocabulary-diagnostic-student.css');
 for(const selector of ['#vocabularyApp:fullscreen','#vocabularyApp:-webkit-full-screen']){
  const rule=css.slice(css.indexOf(selector+'{')).split('}')[0];
  assert.match(rule,/overflow-y:auto/);
  assert.match(rule,/touch-action:pan-y pinch-zoom/);
 }
 assert.match(css,/#vocabularyApp \.ngsl-player \.diag-assessment\{\s*height:auto;\s*max-height:none;\s*overflow:visible/);
 assert.match(css,/@media\(max-height:850px\),\(max-width:1024px\)/);
 assert.match(css,/\.ngsl-player \.diag-option\{min-height:48px/);
});

test('student start never requests fullscreen and normal browser scrolling is restored',()=>{
 const source=read('src/vocabulary/ngsl-student.js'),css=read('vocabulary-diagnostic-student.css');
 assert.doesNotMatch(source,/\.requestFullscreen\(/);
 assert.match(source,/if\(action==='start'\)\{void start\(\);\}/);
 assert.match(css,/html:has\(#vocabularyApp \.ngsl-player\)/);
 assert.match(css,/overflow-y:auto!important/);
 assert.match(css,/\.diag-assessment \.diag-actions\{\s*position:sticky;bottom:0/);
});

 test('NGSL instruction legend is full width independently of fieldset grid sizing',()=>{
  const css=read('vocabulary-diagnostic-student.css');
  const source=read('src/vocabulary/ngsl-student.js');
  const rule=selector=>css.slice(css.indexOf(selector+'{')).split('}')[0];
  assert.match(rule('#vocabularyApp .ngsl-player fieldset.diag-choices'),/display:block;[\s\S]*width:100%;[\s\S]*min-inline-size:0/);
  assert.match(rule('#vocabularyApp .ngsl-player fieldset.diag-choices>legend'),/width:100%;[\s\S]*white-space:normal/);
  assert.match(source,/<fieldset class="diag-choices"><legend>/);
 });
