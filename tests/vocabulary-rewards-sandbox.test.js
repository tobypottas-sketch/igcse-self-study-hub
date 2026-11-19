import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderSandboxShop } from '../src/vocabulary/rewards-sandbox-view.js';

const sql=fs.readFileSync(new URL('../docs/vocabulary-rewards/phase-3-sandbox.sql',import.meta.url),'utf8');
const edge=fs.readFileSync(new URL('../supabase/functions/vocabulary-reward-sandbox/index.ts',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
const sample={sandboxEnabled:true,shopMode:'sandbox',wallet:{granted:100000,spent:600,available:99400},
rewards:[{reward_id:'midnight',name:'Midnight Theme',category:'themes',xp_price:600,description:'Night look',icon:'🌙'},
 {reward_id:'word-explorer',name:'Word Explorer',category:'titles',xp_price:350,description:'Explorer title',icon:'🧭'},
 {reward_id:'aurora-frame',name:'Aurora Frame',category:'frames',xp_price:1800,description:'Frame',icon:'💠'}],
owned:[{reward_id:'midnight',category:'themes',equipped:false}]};

test('isolated sandbox ledger cannot affect real learning XP or real ownership',()=>{
  assert.match(sql,/create table if not exists public\.vocabulary_reward_sandbox_wallets/);
  assert.match(sql,/create table if not exists public\.vocabulary_reward_sandbox_owned/);
  assert.doesNotMatch(sql,/insert into public\.vocabulary_reward_wallets/);
  assert.doesNotMatch(sql,/update public\.vocabulary_reward_wallets/);
  assert.doesNotMatch(sql,/insert into public\.vocabulary_reward_owned/);
  assert.doesNotMatch(sql,/insert into public\.vocabulary_reward_purchases/);
  assert.match(sql,/where student_id=p_student_id and enabled=true for update/);
});
test('sandbox tables have RLS read-only students; RPCs are service-only',()=>{
  for(const t of ['vocabulary_reward_sandbox_wallets','vocabulary_reward_sandbox_owned'])
    assert.match(sql,new RegExp('alter table public\\.'+t+' enable row level security'));
  assert.match(sql,/revoke all on public\.vocabulary_reward_sandbox_wallets,public\.vocabulary_reward_sandbox_owned from anon,authenticated/);
  assert.match(sql,/student_id=\(select auth\.uid\(\)\)/);
  assert.match(sql,/grant execute on function public\.redeem_vocabulary_sandbox_reward\(uuid,text\) to service_role/);
  assert.match(sql,/grant execute on function public\.equip_vocabulary_sandbox_reward\(uuid,text\) to service_role/);
  assert.doesNotMatch(sql,/returns jsonb language plpgsql security definer/);
});
test('sandbox uses server prices, locked wallet, idempotence and ownership-only equip',()=>{
  assert.match(sql,/select xp_price,category into v_price,v_category/);
  assert.match(sql,/primary key\(student_id,reward_id\)/);
  assert.match(sql,/if exists\(select 1 from public\.vocabulary_reward_sandbox_owned/);
  assert.match(sql,/update public\.vocabulary_reward_sandbox_wallets/);
  assert.match(sql,/set spent_xp=spent_xp\+v_price/);
  assert.match(sql,/if v_balance-v_spent < v_price then/);
  assert.match(sql,/create unique index if not exists vocabulary_sandbox_single_equipped/);
  assert.match(sql,/if not found then raise exception 'Reward not owned'/);
});
test('API verifies session and only returns shop for an enabled sandbox',()=>{
  assert.match(edge,/client\.auth\.getUser\(token\)/);
  assert.match(edge,/profile\?\.role!=='student'/);
  assert.match(edge,/if\(!wallet\?\.enabled\)return respond\(\{ok:true,sandboxEnabled:false\}\)/);
  assert.match(edge,/p_student_id:studentId,p_reward_id:rewardId/);
  assert.doesNotMatch(edge,/p_student_id:body|p_price:body|p_xp:body/);
  assert.doesNotMatch(edge,/redeem_vocabulary_reward\b/);
});
test('shop displays server balance, owned/equip states, and price',()=>{
  const root={innerHTML:''};
  renderSandboxShop(root,sample);
  assert.match(root.innerHTML,/99,400 XP/);
  assert.match(root.innerHTML,/data-action="sandbox-equip"/);
  assert.match(root.innerHTML,/data-action="sandbox-buy"/);
  assert.match(root.innerHTML,/1,800 XP/);
  assert.match(root.innerHTML,/TEST XP ONLY/);
  renderSandboxShop(root,{...sample,owned:[{reward_id:'midnight',equipped:true}],wallet:{granted:100000,spent:600,available:99400}});
  assert.match(root.innerHTML,/>Equipped<\/button>/);
});
test('regular students see no sandbox entry unless allowed by server',()=>{
  assert.match(app,/if\(!result\?\.sandboxEnabled\|\|!home\.isConnected\)return/);
  assert.match(app,/loadSandboxShop\(\)/);
  assert.match(app,/if\(state\.preview\|\|sandboxBusy\|\|!sandboxShop\?\.sandboxEnabled\)return/);
  assert.match(app,/action === 'open-sandbox-shop'/);
  assert.match(app,/action === 'sandbox-buy'/);
  assert.match(app,/action === 'sandbox-equip'/);
});
