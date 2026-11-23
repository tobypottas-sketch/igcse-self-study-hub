import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';
import {renderVocabularyHome} from '../src/vocabulary/views.js';

const src=readFileSync(new URL('../supabase/functions/vocabulary-battles/index.ts',import.meta.url),'utf8');
const ui=readFileSync(new URL('../src/vocabulary/battles-app.js',import.meta.url),'utf8');
const sql=readFileSync(new URL('../supabase/migrations/20261123160000_vocabulary_class_battles.sql',import.meta.url),'utf8');
const html=readFileSync(new URL('../vocabulary-battles.html',import.meta.url),'utf8');
const UUIDS={
 student:'11111111-1111-4111-8111-111111111111',
 opponent:'22222222-2222-4222-8222-222222222222',
 stranger:'33333333-3333-4333-8333-333333333333',
 class:'44444444-4444-4444-8444-444444444444',
 otherClass:'55555555-5555-4555-8555-555555555555',
 match:'66666666-6666-4666-8666-666666666666'
};

test('Battle SQL is private, RLS enabled and disconnected from learning XP',()=>{
 assert.match(sql,/create table if not exists public\.vocabulary_battles/i);
 assert.match(sql,/enable row level security/i);
 assert.match(sql,/revoke all on table public\.vocabulary_battles from public, anon, authenticated/i);
 assert.match(sql,/grant select,insert,update,delete on table public\.vocabulary_battles to service_role/i);
 assert.doesNotMatch(sql,/insert into public\.(vocabulary_reward_wallets|vocabulary_missions|vocabulary_attempts)/i);
});
test('Battle Arena is reachable from genuine student home but not staff preview',()=>{
 const make=preview=>{const root={innerHTML:''};renderVocabularyHome(root,{units:[],preview});return root.innerHTML;};
 assert.match(make(false),/vocabulary-battles\.html/);
 assert.doesNotMatch(make(true),/vocabulary-battles\.html/);
 assert.match(html,/id="battlesApp"/);
 assert.match(ui,/role!=='student'/);
});
test('Battle server alone owns answers and validates every active class membership',()=>{
 assert.match(src,/const BANK:Question\[\]/);
 assert.match(src,/correct:number/);
 assert.doesNotMatch(ui,/correct:number|correct:/);
 assert.match(src,/student_class_memberships/);
 assert.match(src,/\.eq\('class_id',classId\)\.is\('ended_at',null\)/);
 assert.match(src,/\.eq\('role','student'\)\.eq\('active',true\)/);
 assert.match(src,/\[b\.challenger_id,b\.opponent_id\]\.includes\(uid\)/);
 assert.match(src,/DURATION=60000/);
 assert.match(src,/LIMIT=10/);
 assert.match(src,/status:'accepted'/);
 assert.match(src,/action==='answer'/);
 assert.match(src,/ends_at/);
});
test('Battle UI supports invite accept/decline, private answer submission and weekly rankings',()=>{
 for(const action of ['challenge','accept','decline','cancel','answer','status','leaderboard'])assert.match(ui,new RegExp(action));
 assert.match(ui,/classId:state\.classId/);
 assert.match(ui,/index:state\.battle\.answered/);
 assert.match(ui,/No XP at stake/);
 assert.match(ui,/getSupabaseClient/);
 assert.doesNotMatch(ui,/\.from\('vocabulary_battles'\)/);
});
test('Bank holds ten different questions for both launch units and options are unambiguous',()=>{
 const ids=[...src.matchAll(/id:'(u[19]-[^']+)',unit:(1|9),prompt:'([^']*)',options:\['([^']*)','([^']*)','([^']*)','([^']*)'\],correct:(\d)/g)];
 assert.ok(ids.filter(m=>m[2]==='1').length>=10);
 assert.ok(ids.filter(m=>m[2]==='9').length>=10);
 for(const m of ids){assert.equal(new Set(m.slice(4,8).map(x=>x.toLowerCase())).size,4,m[1]);assert.ok(+m[8]>=0&&+m[8]<=3);}
});
