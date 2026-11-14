import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { scanFile, scanRepository, RULES } from '../tools/diagnostic/public-exposure.js';

// Synthetic samples are assembled at runtime so this file never contains a
// literal keyed pattern itself.
const K='correct'+'OptionId';
const rules=(file,text)=>[...new Set(scanFile(file,text).map(f=>f.rule))].sort();

test('every rule has a description',()=>{
  for(const rule of ['PRIVATE_PATH','KEYED_JSON','KEYED_LITERAL','KEYED_SQL_INSERT','KEYED_MARKDOWN','ITEM_MARKDOWN','BROWSER_PRIVATE_FETCH','UNSAFE_LOG'])
    assert.ok(RULES[rule],rule);
});

test('private authoring paths are rejected wherever they appear',()=>{
  for(const file of ['diagnostic-private/bank.json','content/x.diag-private.json','tools/private-bank-v2.json'])
    assert.deepEqual(rules(file,'{}'),['PRIVATE_PATH'],file);
});

test('keyed JSON items are detected at any depth, including proposed keys',()=>{
  const item={stem:'Synthetic stem?',options:[{id:'A',text:'a'},{id:'B',text:'b'}]};
  assert.deepEqual(rules('x.json',JSON.stringify({items:[{...item,[K]:'B'}]})),['KEYED_JSON','KEYED_LITERAL']);
  assert.ok(rules('x.json',JSON.stringify([{...item,['proposed_correct_option_id']:'A'}])).includes('KEYED_JSON'));
  assert.deepEqual(rules('x.json',JSON.stringify(item)),[],'question payload without key is the safe student shape');
});

test('literal key assignments are detected in code and SQL',()=>{
  assert.deepEqual(rules('src/a.js',`const q={${K}:'C'}`),['KEYED_LITERAL']);
  assert.deepEqual(rules('a.sql',`select '{"correct_option`+`_id":"D"}'`),['KEYED_LITERAL']);
  assert.deepEqual(rules('src/a.js',`if(o.id===x.${K})mark()`),[],'comparisons are not keys');
});

test('SQL that seeds the private bank is detected',()=>{
  const ins='insert into '+'private.vocabulary_diagnostic_items (item_id,stem)';
  assert.deepEqual(rules('seed.sql',ins+" values ('diag-x-000001','Synthetic?');"),['KEYED_SQL_INSERT']);
  assert.deepEqual(rules('seed.sql',ins+" select 'diag-x-000001','Synthetic?';"),['KEYED_SQL_INSERT']);
  assert.deepEqual(rules('api.sql',ins+' values (v_id,v_stem);'),[],'parameterised RPC import is the sanctioned path');
});

test('markdown items and keyed options are detected, prose about keys is not',()=>{
  const md=['**Stem:** Synthetic stem?','- A. one','- **B. two (key)**','- C. three','- D. four',''].join('\n');
  assert.deepEqual(rules('doc.md',md),['ITEM_MARKDOWN','KEYED_MARKDOWN']);
  const table=['| Option | Text | Key |','|---|---|---|','| A | one | ✓ |',''].join('\n');
  assert.deepEqual(rules('doc.md',table),['KEYED_MARKDOWN']);
  assert.deepEqual(rules('doc.md','Answer'+' key: B\n'),['KEYED_MARKDOWN']);
  assert.deepEqual(rules('doc.md','Distractors must be plausible; the key must not be the longest option.\n'),[]);
});

test('browser assets may not load bank or editorial files',()=>{
  assert.deepEqual(rules('src/vocabulary/x.js',`fetch('./supabase/diagnostic/editorial/l.json')`),['BROWSER_PRIVATE_FETCH']);
  assert.deepEqual(rules('page.html',`<script src="diagnostic-private/a.js"></script>`),['BROWSER_PRIVATE_FETCH']);
  assert.deepEqual(rules('tests/x.test.js',`readFileSync('supabase/diagnostic/pilot_api.sql')`),[],'tests read SQL source');
});

test('diagnostic runtime code must not log payloads, results or items',()=>{
  const fn='supabase/functions/vocabulary-diagnostic/index.ts';
  assert.deepEqual(rules(fn,`console.log('rpc',payload)`),['UNSAFE_LOG']);
  assert.deepEqual(rules(fn,`console.error(JSON.stringify(result))`),['UNSAFE_LOG']);
  assert.deepEqual(rules('src/vocabulary/diagnostic-student.js',`console.warn(item.stem)`),['UNSAFE_LOG']);
  assert.deepEqual(rules(fn,`console.error('Diagnostic RPC failed:',error.code??'unclassified')`),[]);
  assert.deepEqual(rules(fn,`console.error('payload rejected')`),[],'words inside string literals are fine');
});

test('allowlist exemptions are exact and stale exemptions fail',()=>{
  const files={'tests/a.test.js':`x={${K}:'A'}`,'tests/b.test.js':`y={${K}:'B'}`};
  const allow=[{path:'tests/a.test.js',rules:['KEYED_LITERAL']},{path:'tests/gone.test.js',rules:['KEYED_LITERAL']}];
  const r=scanRepository(Object.keys(files),f=>files[f],allow);
  assert.equal(r.ok,false);
  assert.deepEqual(r.findings.map(f=>f.file),['tests/b.test.js']);
  assert.deepEqual(r.stale,[{path:'tests/gone.test.js',rule:'KEYED_LITERAL'}]);
});

test('allowlist covers synthetic test fixtures only',()=>{
  const {entries}=JSON.parse(readFileSync(new URL('../tools/diagnostic/public-exposure-allowlist.json',import.meta.url),'utf8'));
  for(const e of entries){
    assert.match(e.path,/^tests\//,e.path);
    assert.ok(e.reason&&/synthetic/i.test(e.reason),e.path);
  }
});

test('the tracked repository (everything GitHub Pages serves) passes the exposure scan',()=>{
  const out=execFileSync(process.execPath,['tools/diagnostic/check-public-exposure.mjs'],{encoding:'utf8'});
  assert.match(out,/check: pass/);
});

test('retired editorial files with full items stay out of the public tree',()=>{
  for(const f of ['reconstruction-batch-01-review-ledger.json','reconstruction-batch-01.md','reconstruction-batch-01-lexical-v2.md','a1-rewrite-proposals-001.md'])
    assert.equal(existsSync(new URL('../supabase/diagnostic/editorial/'+f,import.meta.url)),false,f);
});

test('private authoring locations are git-ignored and the offline audit refuses tracked files',()=>{
  const ignore=readFileSync(new URL('../.gitignore',import.meta.url),'utf8');
  for(const p of ['diagnostic-private/','*.diag-private.json','private-bank*.json'])assert.ok(ignore.split('\n').includes(p),p);
  const audit=readFileSync(new URL('../tools/diagnostic/audit-bank.mjs',import.meta.url),'utf8');
  assert.match(audit,/ls-files','--error-unmatch'/);
});

test('exposure guard runs on every pull request',()=>{
  const wf=readFileSync(new URL('../.github/workflows/diagnostic-exposure-guard.yml',import.meta.url),'utf8');
  assert.match(wf,/pull_request:\n/);
  assert.doesNotMatch(wf,/pull_request:\n\s+paths:/);
  assert.match(wf,/check-public-exposure\.mjs/);
});
