import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateEditorialPackage,buildEditorialRevisionSql} from '../tools/diagnostic/editorial-package.js';

const LETTERS=['A','B','C','D'];
const migration=readFileSync(new URL('../supabase/diagnostic/editorial_revisions_NOT_APPLIED.sql',import.meta.url),'utf8');
const synthetic=(n,form='A')=>({form,item_id:`diag-candidate-${String(n).padStart(3,'0')}`,provisional_level:'B1',
  target_lemma:`lemma-${n}`,stem:`Synthetic placeholder stem ${n}`,
  options:LETTERS.map(id=>({id,text:`placeholder ${n}${id}`})),correct_option_id:LETTERS[n%4],editorial_rationale:'synthetic'});
const pkg=list=>({package_version:'synthetic-v1',proposed_replacements:list});

test('accepts a well-formed synthetic package', ()=>{
  assert.deepEqual(validateEditorialPackage(pkg([synthetic(1),synthetic(2,'B')])).errors,[]);
});

test('rejects malformed replacements', ()=>{
  const bad=[
    {...synthetic(1),item_id:'diag-example-1'},
    {...synthetic(2),form:'C'},
    {...synthetic(3),provisional_level:'C2'},
    {...synthetic(4),options:synthetic(4).options.slice(0,3)},
    {...synthetic(5),options:synthetic(5).options.map(o=>({...o,text:'same'}))},
    {...synthetic(6),correct_option_id:'E'},
    {...synthetic(7),stem:'  '},
    {...synthetic(8),expected_current_version:0},
    synthetic(9),synthetic(9)
  ];
  const {errors}=validateEditorialPackage(pkg(bad));
  for(const fragment of ['diag-candidate-NNN','form must be A or B','A1–C1','exactly A, B, C, D','duplicate option text',
    'correct_option_id must be A–D','stem missing','expected_current_version','duplicate item_id'])
    assert.ok(errors.some(e=>e.includes(fragment)),fragment);
  assert.ok(validateEditorialPackage(pkg([])).errors.length);
});

test('builds one transactional private script around the content-free migration', ()=>{
  const {sql,summary,sha256}=buildEditorialRevisionSql(pkg([synthetic(1),synthetic(2,'B')]),migration);
  assert.match(sql,/^-- PRIVATE:/);
  assert.match(sql,/\nbegin;\n/);
  assert.ok(sql.includes(migration.trim()));
  assert.ok(sql.indexOf('create or replace function pg_temp.diag_apply_editorial_revisions')<sql.indexOf('select * from pg_temp.diag_apply_editorial_revisions()'));
  assert.match(sql,/commit;\n$/);
  assert.equal(summary.length,2);
  assert.match(sha256,/^[0-9a-f]{64}$/);
  assert.throws(()=>buildEditorialRevisionSql(pkg([{...synthetic(1),form:'X'}]),migration),/Invalid editorial package/);
});

test('package text cannot terminate the dollar quote', ()=>{
  const tricky={...synthetic(1),stem:'Synthetic $pkg_$ $$ stem'};
  const {sql}=buildEditorialRevisionSql(pkg([tricky]),migration);
  const tag=sql.match(/values \((\$pkg_[0-9a-f]{12}\$)/)[1];
  assert.equal(sql.split(tag).length,3);
});

test('committed migration is content-free and never publishes or touches scoring', ()=>{
  assert.doesNotMatch(migration,/insert\s+into\s+private\.vocabulary_diagnostic_items\b[^;]*?\b(values\s*\(\s*'|select\s+')/i);
  assert.doesNotMatch(migration,/status\s*=\s*'(pilot|approved)'/i);
  assert.doesNotMatch(migration,/\bdelete\s+from\b|\bdrop\s+table\b|\btruncate\b/i);
  assert.match(migration,/FORMS_NOT_BOTH_DRAFT/);
  assert.match(migration,/KEY_SLOT_BALANCE_CHANGED/);
});
