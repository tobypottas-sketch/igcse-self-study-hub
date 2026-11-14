import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const ui=readFileSync(new URL('../src/vocabulary/diagnostic-review.js',import.meta.url),'utf8');
test('bank audit remains read-only and uses private staff list and detail endpoints',()=>{
 const section=ui.slice(ui.indexOf('async function runBankAudit()'),ui.indexOf('async function detail(id,version)'));
 assert.match(section,/invoke\('list'/);
 assert.match(section,/invoke\('detail'/);
 assert.match(section,/auditDiagnosticItem\(result\.item\)/);
 assert.doesNotMatch(section,/invoke\('decision'/);
 assert.match(section,/rows\.length<total/);
});
test('audit has priority filtering and drilldown',()=>{
 assert.match(ui,/data-action="audit-filter"/);
 assert.match(ui,/state\.auditFilter/);
 assert.match(ui,/data-action="open"/);
 assert.match(ui,/No review decisions were changed/);
});
