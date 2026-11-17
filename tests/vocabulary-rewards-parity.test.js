import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compareRewardsXp,XP_COMPONENTS} from '../src/vocabulary/rewards-xp-parity.js';
const parts=Object.fromEntries(XP_COMPONENTS.map((key,i)=>[key,i*5]));
const total=Object.values(parts).reduce((a,b)=>a+b,0);
const server={ok:true,auditOnly:true,lifetimeXp:total,parts,deterministicComparisons:{timezoneSensitive:false}};
test('matching XP is only a parity observation, never permission to fund wallets',()=>{
  const r=compareRewardsXp({total,parts},server);
  assert.equal(r.status,'match');
  assert.equal(r.canFundWallet,false);
  assert.deepEqual(r.differences,[]);
});
test('a single bonus mismatch is explicit even when totals were accidentally equal',()=>{
  const wrong={...parts,achievements:parts.achievements+25};
  const r=compareRewardsXp({total,parts:wrong},server);
  assert.equal(r.status,'mismatch');
  assert.equal(r.differences[0].part,'achievements');
  assert.equal(r.canFundWallet,false);
});
test('unsigned, incomplete and malformed audit results never pass',()=>{
  assert.equal(compareRewardsXp({total,parts},null).status,'unavailable');
  assert.equal(compareRewardsXp({total,parts},{...server,auditOnly:false}).status,'unavailable');
  assert.equal(compareRewardsXp({total,parts:{missions:10}},server).status,'invalid');
  assert.equal(compareRewardsXp({total:-1,parts},server).status,'invalid');
});
test('the app invokes the audit only after explicit opt-in and does not redeem or write',()=>{
  const src=fs.readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
  const block=src.slice(src.indexOf('async function runRewardsXpParityDiagnostic'),src.indexOf('async function showHome'));
  assert.match(block,/get\('xp-audit'\) !== '1'/);
  assert.match(block,/if \(state.preview/);
  assert.match(block,/client\.functions\.invoke\('vocabulary-reward-xp-audit'/);
  assert.doesNotMatch(block,/redeem_vocabulary_reward|\.update\(|\.insert\(|\.delete\(/);
});
