import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const assembly=source('supabase/diagnostic/assemble_draft_forms.sql');
const readiness=source('supabase/diagnostic/form_readiness_api.sql');
const randomised=source('supabase/diagnostic/randomise_draft_form_options.sql');
const edge=source('supabase/functions/vocabulary-diagnostic/index.ts');
const ui=source('src/vocabulary/diagnostic-review.js');

test('two 40-item draft forms have 8 per proposed CEFR band and no overlap',()=>{
 assert.match(assembly,/DIAG-BASELINE-A-DRAFT/);
 assert.match(assembly,/DIAG-BASELINE-B-DRAFT/);
 assert.match(assembly,/when group_index % 2 = 1 then v_form_a else v_form_b/);
 assert.match(assembly,/v_form_record.total<>40/);
 assert.match(assembly,/count\(\*\) from private\.vocabulary_diagnostic_form_items[\s\S]*<>80/);
});
test('assembly cannot promote unreviewed questions or form status',()=>{
 assert.match(assembly,/review_status<>'draft'/);
 assert.match(assembly,/->>'status'<>'unverified'/);
 assert.match(assembly,/values \('DIAG-BASELINE-A-DRAFT',1,'draft'/);
 assert.match(assembly,/values \('DIAG-BASELINE-B-DRAFT',1,'draft'/);
 assert.doesNotMatch(assembly,/set review_status\s*=\s*'pilot'/);
 assert.doesNotMatch(assembly,/insert into private\.vocabulary_diagnostic_assignments/i);
});
test('private form readiness endpoint is server-only, staff checked, and key-free',()=>{
 assert.match(readiness,/v_role not in \('teacher','admin'\)/);
 assert.match(readiness,/revoke all on function public\.vocabulary_diagnostic_form_readiness\(uuid\)/);
 assert.match(readiness,/grant execute on function public\.vocabulary_diagnostic_form_readiness\(uuid\)[\s\S]*to service_role/);
 assert.doesNotMatch(readiness,/correct_option_id|tested_sense|i2\.stem|i2\.options/);
 assert.match(readiness,/'reviewReady',false/);
});
test('Edge authenticates reviewer and only dispatches server-held RPC',()=>{
 assert.match(edge,/review-forms/);
 assert.match(edge,/vocabulary_diagnostic_form_readiness/);
 assert.match(edge,/p_actor:identity\.user\.id/);
 assert.match(edge,/auth\.getUser\(match\[1\]\)/);
 assert.match(edge,/SUPABASE_SECRET_KEYS/);
});
test('review interface reports progress without copying keyed items into form cards',()=>{
 assert.match(ui,/function formReadinessView/);
 assert.match(ui,/invoke\('forms'/);
 assert.match(ui,/languageApproved/);
 assert.match(ui,/cefrVerified/);
 assert.match(ui,/cannot yet be treated as equivalent/);
});

test('answer positions are privately randomised to exactly ten per slot',()=>{
 assert.match(randomised,/order by gen_random_uuid\(\)/);
 assert.match(randomised,/\(\(shuffled_rank-1\)%4\)\+1/);
 assert.match(randomised,/counts\.n<>10/);
 assert.match(randomised,/FORM_ALREADY_ASSIGNED/);
 assert.match(randomised,/status='draft'/);
 assert.doesNotMatch(randomised,/values\s*\(.*correct_option_id\s*=/);
});
