import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildXpParityReportText, renderXpParityReport } from '../src/vocabulary/rewards-xp-report.js';

const parts={missions:80,personalBests:10,weeklyGoals:15,achievements:50,stageClears:40,pathwayMasteries:100,unitMasteries:0};
const client={total:295,parts};
const server={lifetimeXp:295,parts};
const matched={status:'match',studentTotal:295,serverTotal:295,timezoneSensitive:false,canFundWallet:false,differences:[]};
test('copyable report contains every component but no student identity',()=>{
  const text=buildXpParityReportText(matched,client,server,'Asia/Shanghai');
  for(const word of ['Mission practice','Personal bests','Weekly goals','Achievements','Passed stages','Pathway mastery','Unit mastery'])assert.ok(text.includes(word));
  assert.ok(text.includes('Asia/Shanghai'));
  assert.ok(text.includes('NOT permission to credit wallets'));
  assert.doesNotMatch(text,/student_id|school_email|display_name|auth\.uid/);
});
test('matching student/server XP displays accessible numeric comparison',()=>{
  const html=renderXpParityReport(matched,client,server);
  assert.match(html,/XP calculations agree/);
  assert.match(html,/<table>/);
  assert.match(html,/<th scope="row">Mission practice<\/th>/);
  assert.equal((html.match(/<tr>/g)||[]).length,9);
  assert.match(html,/copy-xp-audit-report/);
});
test('a mismatch is labelled and timezone sensitivity is visible',()=>{
  const report={...matched,status:'mismatch',serverTotal:280,timezoneSensitive:true};
  const html=renderXpParityReport(report,client,{...server,lifetimeXp:280,parts:{...parts,missions:65}});
  assert.match(html,/XP discrepancy found/);
  assert.match(html,/Different/);
  assert.match(html,/China-time XP results/);
});
test('unavailable comparison never offers a copy button or makes a funding claim',()=>{
  const html=renderXpParityReport({status:'unavailable'},client,null);
  assert.match(html,/XP comparison unavailable/);
  assert.doesNotMatch(html,/data-action="copy-xp-audit-report"/);
  assert.doesNotMatch(html,/<table>/);
});
test('opt-in UI is read-only, and copy excludes student identity',()=>{
  const app=fs.readFileSync(new URL('../src/vocabulary/app.js',import.meta.url),'utf8');
  const code=app.slice(app.indexOf('async function runRewardsXpParityDiagnostic'),app.indexOf('async function showHome'));
  assert.match(code,/get\('xp-audit'\) !== '1'/);
  assert.match(code,/renderXpParityReport/);
  assert.match(code,/buildXpParityReportText/);
  assert.match(app,/action === 'copy-xp-audit-report'/);
  assert.match(app,/navigator\.clipboard\.writeText\(state\.xpAuditReportText\)/);
  assert.doesNotMatch(code,/\.insert\(|\.update\(|\.delete\(|redeem_vocabulary_reward/);
});
