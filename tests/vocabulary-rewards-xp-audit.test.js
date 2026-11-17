import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { computeXp, XP_RULES } from '../src/vocabulary/engagement-model.js';

const edge=fs.readFileSync(new URL('../supabase/functions/vocabulary-reward-xp-audit/index.ts',import.meta.url),'utf8');
const mission=(i,{score=6,streak=1,kind='pathway',unit=1,stage='recognise',pathway='meaning'}={})=>({
  mission_id:`00000000-0000-4000-8000-${String(i).padStart(12,'0')}`,
  unit_number:unit,mission_kind:kind,pathway_id:kind==='mixed'?null:pathway,
  pathway_stage:kind==='mixed'?null:stage,practice_family:'standard',
  mission_size:10,score,stars:0,best_streak:streak,
  completed_at:`2026-11-16T10:${String(i).padStart(2,'0')}:00Z`
});
const empty={passedStages:0,masteredPathwayCount:0,masteredPathways:new Set(),unitsMastered:0};

test('repeated same-bucket missions taper and only genuine personal bests earn XP',()=>{
  const missions=[
    mission(1,{score:6,streak:1}),mission(2,{score:7,streak:2}),
    mission(3,{score:9,streak:3}),mission(4,{score:9,streak:4})
  ];
  const result=computeXp({missions,snapshot:empty});
  // Mission XP: 10+15+10+10; three improving personal bests; week 4+ missions;
  // first_steps plus steady_week unlock when the fourth mission is recorded.
  assert.deepEqual(result.parts,{
    missions:45,personalBests:15,weeklyGoals:15,achievements:50,
    stageClears:0,pathwayMasteries:0,unitMasteries:0
  });
  assert.equal(result.total,125);
});

test('daily mission cap is not bypassed by switching mission buckets',()=>{
  const missions=Array.from({length:6},(_,i)=>mission(i+1,{score:9,streak:2,kind:'mixed',unit:i+1}));
  const result=computeXp({missions,snapshot:empty});
  assert.equal(result.parts.missions,XP_RULES.dailyMissionCap);
  assert.equal(result.parts.personalBests,0);
  assert.equal(result.parts.weeklyGoals,15);
  assert.equal(result.parts.achievements,50);
  assert.equal(result.total,145);
});

test('mastery bonuses belong to lifetime XP, even though they are not mission scores',()=>{
  const result=computeXp({missions:[],snapshot:{
    passedStages:2,masteredPathwayCount:1,masteredPathways:new Set(['meaning']),unitsMastered:0
  }});
  assert.equal(result.parts.stageClears,80);
  assert.equal(result.parts.pathwayMasteries,100);
  // stage_climber requires 5, but meaning_maker awards an achievement for mastery.
  assert.equal(result.parts.achievements,25);
  assert.equal(result.total,205);
});

test('server audit is read-only, uses authenticated data and the canonical computation',()=>{
  assert.match(edge,/client\.auth\.getUser\(token\)/);
  assert.match(edge,/profile\?\.role !== 'student'/);
  assert.match(edge,/calculateXp\(\{missions,snapshot\}\)/);
  assert.match(edge,/import \{ computeXp, progressSnapshot \}/);
  assert.match(edge,/coverageFromServerSetMembers\(members,rows\)/);
  assert.match(edge,/fetchAllRows\(/);
  assert.match(edge,/auditOnly:true/);
  assert.doesNotMatch(edge,/\.insert\(|\.update\(|\.delete\(|redeem_vocabulary_reward|verified_earned_xp\s*=/);
});

test('explicit China calendar avoids UTC daily-cap boundary miscount',()=>{
  // Both timestamps are November 17 UTC, but some are November 18
  // in Wuxi. Two distinct local days must not share one daily XP cap.
  const rows=[1,2,3,4,5].map((i)=>({
    ...mission(i,{score:9,unit:i,kind:'mixed'}),
    completed_at:i<=2?`2026-11-17T15:${i===1?'40':'50'}:00Z`:`2026-11-17T16:${String(i).padStart(2,'0')}:00Z`
  }));
  const utc=computeXp({missions:rows,snapshot:empty,timeZone:'UTC'});
  const shanghai=computeXp({missions:rows,snapshot:empty,timeZone:'Asia/Shanghai'});
  assert.equal(utc.parts.missions,70);
  assert.equal(shanghai.parts.missions,90);
  assert.equal(shanghai.parts.missions-utc.parts.missions,20);
});

test('explicit timezone splits missions across the Monday weekly-goal boundary',()=>{
  const rows=[1,2,3,4].map(i=>({
    ...mission(i,{score:6,unit:i,kind:'mixed'}),
    completed_at:i<=2?`2026-11-15T15:${i===1?'40':'50'}:00Z`:
      `2026-11-15T16:${String(i).padStart(2,'0')}:00Z`
  }));
  const shanghai=computeXp({missions:rows,snapshot:empty,timeZone:'Asia/Shanghai'});
  const utc=computeXp({missions:rows,snapshot:empty,timeZone:'UTC'});
  // UTC: 4 on Sunday in a single week. China: 2 on Sunday, 2 on Monday.
  assert.equal(shanghai.parts.weeklyGoals,0);
  assert.equal(utc.parts.weeklyGoals,15);
});

test('XP audit cannot authorize funding and identifies timezone sensitivity',()=>{
  assert.match(edge,/readyForWalletFunding:false/);
  assert.match(edge,/timeZone:'Asia\/Shanghai'/);
  assert.match(edge,/timeZone:'UTC'/);
  assert.match(edge,/timezoneSensitive:shanghai.total!==utc.total/);
});
