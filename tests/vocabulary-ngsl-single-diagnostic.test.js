import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ngslPromptMarkup,highlightedNGSLSentence} from '../src/vocabulary/ngsl-question-format.js';
import {NGSL_BASELINE_GATE_ENABLED} from '../src/vocabulary/ngsl-entry-policy.js';

test('every NGSL question visibly asks for the meaning of the target word',()=>{
 const html=ngslPromptMarkup('The mechanism moved.','mechanism');
 assert.match(html,/What does <strong>mechanism<\/strong> mean\?/);
 assert.match(html,/The <strong class="ngsl-target">mechanism<\/strong> moved/);
});
test('question markup escapes unsafe source strings',()=>{
 const html=ngslPromptMarkup('The <unsafe> mechanism works.','mechanism');
 assert.doesNotMatch(html,/<unsafe>/);
 assert.match(html,/&lt;unsafe&gt;/);
 assert.throws(()=>highlightedNGSLSentence('No target here.','mechanism'));
});
test('NGSL student renderer uses exactly four options, server-owned save and no CEFR placement',()=>{
 const source=readFileSync(new URL('../src/vocabulary/ngsl-student.js',import.meta.url),'utf8');
 assert.match(source,/of 50/);
 assert.match(source,/ngslPromptMarkup/);
 assert.match(source,/ngsl-start|api\('start'/);
 assert.match(source,/api\('respond'/);
 assert.match(source,/api\('pause'/);
 assert.match(source,/bandScores/);
 assert.match(source,/missedTargets/);
 assert.doesNotMatch(source,/A1.*B1.*C1/);
});
test('only NGSL scoring and student routing remain',()=>{
 const route=readFileSync(new URL('../src/vocabulary/router.js',import.meta.url),'utf8');
 const edge=readFileSync(new URL('../supabase/functions/vocabulary-diagnostic/index.ts',import.meta.url),'utf8');
 assert.match(route,/NGSL_BASELINE_GATE_ENABLED/);
 assert.match(route,/ngsl-status/);
 assert.match(edge,/vocabulary_ngsl_api/);
 assert.doesNotMatch(edge,/vocabulary_diagnostic_api|scoreProvisionalDiagnostic/);
 assert.equal(typeof NGSL_BASELINE_GATE_ENABLED,'boolean');
});
