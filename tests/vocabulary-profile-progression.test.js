import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderIdentityShowcase} from '../src/vocabulary/rewards-equipped-home.js';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const rewards=[
 {reward_id:'cyber-legend',category:'titles',name:'Cyber Legend'},
 {reward_id:'neon-hacker-badge',category:'badges',name:'Neon Hacker Badge'},
 {reward_id:'gold-frame',category:'frames',name:'Golden Frame'},
 {reward_id:'electric-pulse',category:'effects',name:'Electric Pulse'}
];
const owned=rewards.map(({reward_id,category})=>({reward_id,category,equipped:true}));
const engagement={level:{level:3,xp:320,floor:250,next:450,progressPercent:35}};
test('profile shows authentic learning progress, 4/5 cosmetics and real sandbox wallet',()=>{
 const html=renderIdentityShowcase({shopMode:'sandbox',sandboxEnabled:true,rewards,owned,wallet:{available:1084550}},'TEST STUDENT',engagement);
 assert.match(html,/TEST STUDENT/);
 assert.match(html,/4 \/ 5 equipped/);
 assert.match(html,/Level 3/);
 assert.match(html,/320 \/ 450 XP/);
 assert.match(html,/aria-valuenow="35"/);
 assert.match(html,/Test XP/);
 assert.match(html,/1,084,550/);
 assert.match(html,/cyber-legend\.png/);
 assert.match(html,/alt="Cyber Legend title artwork"/);
 assert.doesNotMatch(html,/class="vocab-student-identity__title-label"/);
 assert.match(html,/data-real-cosmetics/);
});
test('production uses verified spendable balance, never sandbox numbers',()=>{
 const html=renderIdentityShowcase({shopMode:'production',rewards,owned,wallet:{available:120}},'Student',engagement);
 assert.match(html,/Available XP/);
 assert.match(html,/>120<\/strong>/);
 assert.doesNotMatch(html,/Test XP|1,084,550/);
 assert.match(html,/Learning XP towards next level/);
});
test('unavailable learning progress and wallet do not fabricate levels, 0 XP or a progress bar',()=>{
 const html=renderIdentityShowcase({shopMode:'production',rewards,owned,wallet:null},'Student');
 assert.doesNotMatch(html,/vocab-student-identity__progress|aria-valuenow="0"|Level 1/);
 assert.match(html,/Cyber Legend title artwork/);
});
test('highest level hides nonexistent next level and shows progress complete',()=>{
 const html=renderIdentityShowcase({shopMode:'production',rewards,owned,wallet:{available:0}},'Student',{level:{level:10,xp:2800,floor:2700,next:null,progressPercent:100}});
 assert.match(html,/Top level/);
 assert.match(html,/aria-valuenow="100"/);
 assert.doesNotMatch(html,/Level 11 next/);
});
test('banner uses original avatar and title graphics with responsive 40-percent title increase',()=>{
 const css=read('vocabulary-profile-progression.css'),html=read('vocabulary.html');
 assert.match(css,/max-width:190px; \/\* 136 -> 190: \+39\.7% \*\//);
 assert.match(css,/@media\(max-width:1070px\)/);
 assert.match(css,/@media\(max-width:750px\)/);
 assert.match(css,/@media\(max-width:500px\)/);
 for(const theme of ['forest','ocean','sakura','midnight','neon-district','celestial-realms'])
  assert.ok(css.includes('.vocab-real-theme--'+theme),'Missing contrast support: '+theme);
 assert.match(html,/vocabulary-profile-progression\.css\?v=profile-progression-v1/);
 assert.match(read('src/vocabulary/app.js'),/renderEquippedCosmetics\(root,shop,state\.profile\?\.display_name\?\?'Student',homeEngagement\(\)\)/);
});
