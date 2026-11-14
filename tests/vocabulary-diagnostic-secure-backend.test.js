import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const read=relative=>readFileSync(new URL(relative,root),'utf8');
const tables=read('supabase/diagnostic/pilot_tables.sql');
const api=read('supabase/diagnostic/pilot_api.sql');
const edge=read('supabase/functions/vocabulary-diagnostic/index.ts');

test('diagnostic tables are private with no direct anon/authenticated grants',()=>{
  assert.match(tables,/private\.vocabulary_diagnostic_items/);
  for(const name of ['items','forms','form_items','assignments','sessions','responses','results'])
    assert.match(tables,new RegExp('alter table private\\.vocabulary_diagnostic_'+name+' enable row level security','i'));
  assert.match(tables,/revoke all on private\.vocabulary_diagnostic_items,[\s\S]*from public, anon, authenticated/i);
  assert.doesNotMatch(tables,/grant\s+(?:select|all)\s+on\s+private\.vocabulary_diagnostic_items\s+to\s+authenticated/i);
});
test('only service role has API execute privilege',()=>{
  assert.match(api,/security definer[\s\S]*set search_path\s*=\s*''/);
  assert.match(api,/revoke all on function public\.vocabulary_diagnostic_api\(uuid,text,jsonb\)[\s\S]*from public,anon,authenticated/);
  assert.match(api,/grant execute on function public\.vocabulary_diagnostic_api\(uuid,text,jsonb\)[\s\S]*to service_role/);
});
test('all question delivery uses the safe whitelist, never scoring metadata',()=>{
  const projection=api.slice(api.indexOf('create or replace function private.vocabulary_diagnostic_safe_question'),api.indexOf('create or replace function public.vocabulary_diagnostic_api'));
  for(const key of ["'sessionId'","'questionId'","'questionVersion'","'position'","'stem'","'options'","'allowUnknown'"])
    assert.ok(projection.includes(key),key);
  for(const leak of ["'correctOptionId'","'correct_option_id'","'rationale'","'levelHypothesis'","'calibration'"])
    assert.equal(projection.includes(leak),false,leak);
});
test('backend has atomic progression, idempotency and a closed pilot score',()=>{
  assert.match(api,/for update/);
  assert.match(api,/request_hash/);
  assert.match(api,/REPLAY_CONFLICT/);
  assert.match(api,/state='completed'/);
  assert.match(api,/'levelEstimate',null/);
  assert.match(tables,/score_status text not null default 'uncalibrated'/);
  assert.match(tables,/level_estimate text check\(level_estimate is null\)/);
});
test('authenticated Edge layer validates JWT and never uses client-supplied actor ID',()=>{
  assert.match(edge,/auth\.getUser\(match\[1\]\)/);
  assert.match(edge,/p_actor:identity\.user\.id/);
  assert.match(edge,/SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(edge,/MAX_BODY_BYTES=4000/);
  assert.match(edge,/verify_jwt/i); // Documentation comment: deployed flag must be true.
  assert.doesNotMatch(edge,/p_actor:request\./);
});
test('pilot starts only from staff assignments, with pause/resume',()=>{
  assert.match(api,/p_action='assign'/);
  assert.match(api,/m\.ended_at is null[\s\S]*tc\.teacher_id=p_actor/);
  assert.match(api,/p_action='start'/);
  assert.match(api,/p_action='pause'/);
  assert.match(edge,/action==='pause'/);
  assert.match(api,/FOLLOWUP_NOT_DUE/);
});
