import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync(new URL('../docs/vocabulary-rewards/phase-2-wallet-schema.sql',import.meta.url),'utf8');
const model = fs.readFileSync(new URL('../src/vocabulary/engagement-model.js',import.meta.url),'utf8');
const doc = fs.readFileSync(new URL('../docs/vocabulary-rewards/README.md',import.meta.url),'utf8');

test('the wallet and owned items have row-level security and client read-only grants',()=>{
  for(const t of ['vocabulary_reward_catalog','vocabulary_reward_wallets','vocabulary_reward_owned','vocabulary_reward_purchases']){
    assert.match(sql,new RegExp('alter table public\\.'+t+' enable row level security'));
  }
  assert.match(sql,/revoke all on public\.vocabulary_reward_catalog/);
  assert.doesNotMatch(sql,/grant\s+(?:insert|update|delete|all)\s+on\s+public\.vocabulary_reward/i);
  assert.match(sql,/student_id=\(select auth\.uid\(\)\)/);
});
test('redemption is server-priced, serialised, and cannot double-charge an owned reward',()=>{
  assert.match(sql,/function public\.redeem_vocabulary_reward\(p_reward_id text\)/);
  assert.doesNotMatch(sql,/p_(?:price|xp|cost|student_id)\s/);
  assert.match(sql,/where reward_id=p_reward_id and enabled=true/);
  assert.match(sql,/where student_id=v_student for update/);
  assert.match(sql,/if exists\(select 1 from public\.vocabulary_reward_owned/);
  assert.match(sql,/primary key \(student_id,reward_id\)/);
  assert.match(sql,/if v_earned-v_spent < v_price then/);
  assert.match(sql,/set spent_xp=spent_xp\+v_price/);
});
test('equipment is owned-only, one per category and serialised per user',()=>{
  assert.match(sql,/create unique index if not exists vocabulary_reward_single_equipped_category/);
  assert.match(sql,/where equipped;/);
  assert.match(sql,/function public\.equip_vocabulary_reward\(p_reward_id text\)/);
  assert.match(sql,/from public\.vocabulary_reward_owned\s+where student_id=v_student and reward_id=p_reward_id/);
  assert.match(sql,/where student_id=v_student and category=v_category and equipped=true/);
});
test('catalogue is disabled until verified XP credits are implemented',()=>{
  assert.equal((sql.match(/,false\)/g)||[]).length,12);
  assert.match(sql,/enabled boolean not null default false/);
  assert.match(doc,/NOT APPLIED/);
  assert.match(doc,/parity tests/);
  assert.match(model,/dailyMissionCap:80/);
  assert.match(model,/personalBest:5/);
  assert.match(model,/weeklyGoal:15/);
  assert.match(model,/achievement:25/);
  assert.match(model,/stageClear:40/);
  assert.match(model,/pathwayMastery:100/);
  assert.match(model,/unitMastery:200/);
});
