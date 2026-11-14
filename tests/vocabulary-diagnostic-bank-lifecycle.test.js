import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql=readFileSync(new URL('../supabase/diagnostic/item_lifecycle_NOT_APPLIED.sql',import.meta.url),'utf8');
const body=sql.slice(sql.indexOf('function public.vocabulary_diagnostic_bank_admin'));
const edge=readFileSync(new URL('../supabase/functions/vocabulary-diagnostic/index.ts',import.meta.url),'utf8');
const gate=readFileSync(new URL('../src/vocabulary/diagnostic-entry-gate.js',import.meta.url),'utf8');

test('bank admin RPC is service-role only, definer-safe and admin-only',()=>{
  assert.match(body,/security definer\s+set search_path=''/);
  assert.match(sql,/revoke all on function public\.vocabulary_diagnostic_bank_admin\(uuid,text,jsonb\) from public,anon,authenticated;/);
  assert.match(sql,/grant execute on function public\.vocabulary_diagnostic_bank_admin\(uuid,text,jsonb\) to service_role;/);
  assert.match(body,/v_role is distinct from 'admin' then raise exception 'BANK_ACCESS_DENIED'/);
});

test('bank admin RPC never returns item content',()=>{
  const returns=[...body.matchAll(/return\s+jsonb_build_object\(([\s\S]*?)\);/g)].map(m=>m[1]).join('\n');
  for(const leak of ["'stem'","'options'","'correctOptionId'","'correct_option_id'","'lemma'","'sense'","v_entry->'options'","v_item.stem"])
    assert.ok(!returns.includes(leak),leak);
});

test('audit and new table are private, RLS-on and append-only',()=>{
  assert.match(sql,/alter table private\.vocabulary_diagnostic_item_events enable row level security;/);
  assert.match(sql,/revoke all on private\.vocabulary_diagnostic_item_events from public,anon,authenticated;/);
  assert.match(sql,/before update or delete on private\.vocabulary_diagnostic_item_events/);
});

test('versions are immutable, status only moves forward, retirement is terminal',()=>{
  assert.match(sql,/ITEM_CONTENT_IMMUTABLE/);
  assert.match(sql,/new\.stem,new\.options,new\.correct_option_id/);
  assert.match(sql,/ITEM_STATUS_REGRESSION/);
  assert.match(sql,/ITEM_DELETE_FORBIDDEN/);
  assert.match(sql,/old\.review_status='retired' and new\.review_status<>'retired'/);
  assert.match(body,/coalesce\(max\(version\),0\)\+1/);
  assert.match(body,/CONTENT_REUSE_FORBIDDEN/);
});

test('promotion reuses the existing review chain and needs an independent publisher',()=>{
  assert.match(body,/review_status<>'assessment_reviewed'/);
  assert.match(body,/stage='cefr' and decision='verify'/);
  assert.match(body,/INDEPENDENT_PUBLISHER_REQUIRED/);
  assert.match(body,/decision in \('flag','reject'\)/);
});

test('forms: draft-only membership, release needs releasable items, retired forms terminal',()=>{
  assert.match(sql,/FORM_LOCKED/);
  const guard=sql.slice(sql.indexOf('function private.vocabulary_diagnostic_form_item_guard'),sql.indexOf('drop trigger if exists vocab_diag_form_item_guard'));
  assert.match(guard,/tg_op in \('UPDATE','DELETE'\)[\s\S]*where id=old\.form_id/,'source form checked on update/delete');
  assert.match(guard,/if tg_op='DELETE' then return old; end if;[\s\S]*where id=new\.form_id/,'NEW only used after DELETE returns');
  assert.doesNotMatch(guard,/coalesce\(new/);
  assert.match(sql,/FORM_ITEMS_NOT_RELEASABLE/);
  assert.match(sql,/FORM_RETIRED/);
  assert.match(body,/ITEM_IN_RELEASED_FORM/);
  assert.match(body,/FORM_HAS_OPEN_SESSIONS/);
  assert.match(sql,/before insert or update of form_id on private\.vocabulary_diagnostic_sessions/);
  assert.match(sql,/session_form_guard\(\)[\s\S]*?for share;/,'session start serialises with retire-form');
});

test('lifecycle SQL leaves students, progress and the practice gate untouched',()=>{
  const ddl=sql.replace(/--.*$/gm,'');
  for(const t of ['vocabulary_diagnostic_assignments','vocabulary_diagnostic_responses','vocabulary_diagnostic_results','vocabulary_unit_mastery','vocabulary_missions','activity_events','gate_settings'])
    assert.doesNotMatch(ddl,new RegExp(`(insert into|update|delete from|alter table|truncate)\\s+[a-z_.]*${t}`,'i'),t);
  assert.doesNotMatch(ddl,/\bdrop\s+(table|schema|column)\b/i);
});

test('lifecycle RPC is not wired to the public Edge Function and enforcement stays off',()=>{
  assert.doesNotMatch(edge,/vocabulary_diagnostic_bank_admin/);
  assert.match(gate,/DIAGNOSTIC_BASELINE_GATE_ENABLED=false;/);
});
