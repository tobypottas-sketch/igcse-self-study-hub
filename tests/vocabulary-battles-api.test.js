import {equippedAvatars} from '../supabase/functions/_shared/vocabulary-avatar.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripTypeScriptTypes} from 'node:module';

const USER='11111111-1111-4111-8111-111111111111';
const OPP='22222222-2222-4222-8222-222222222222';
const OUT='33333333-3333-4333-8333-333333333333';
const CLASS='44444444-4444-4444-8444-444444444444';
const OTHER='55555555-5555-4555-8555-555555555555';
const MATCH='66666666-6666-4666-8666-666666666666';
const code=stripTypeScriptTypes(readFileSync(new URL('../supabase/functions/vocabulary-battles/index.ts',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');

function createHarness(){
 let actor=USER,handler;
 const matches=[];
 const vocabulary_reward_owned=[USER,OPP,OUT].map((student_id,index)=>({
  student_id,reward_id:['avatar-pixel-bot','avatar-shadow-fox','avatar-aqua-shark'][index],
  category:'avatars',equipped:true,'vocabulary_reward_catalog.enabled':true
 }));
 const memberships=[
   {student_id:USER,class_id:CLASS,ended_at:null},
   {student_id:OPP,class_id:CLASS,ended_at:null},
   {student_id:OUT,class_id:OTHER,ended_at:null}
 ];
 const profiles=[
  {id:USER,role:'student',active:true,display_name:'Alpha'},
  {id:OPP,role:'student',active:true,display_name:'Bravo'},
  {id:OUT,role:'student',active:true,display_name:'Outsider'}
 ];
 const classes=[
  {id:CLASS,class_name:'G9 ESL 4',active:true},
  {id:OTHER,class_name:'G10 ESL 5',active:true}
 ];
 function client(){
  return {
   auth:{getUser:async()=>({data:{user:{id:actor}},error:null})},
   from(table){
    let op='read',payload,filters=[],orText='';
    const q={
     select(){return this;},
     eq(k,v){filters.push(['eq',k,v]);return this;},
     gt(k,v){filters.push(['gt',k,v]);return this;},
     gte(k,v){filters.push(['gte',k,v]);return this;},
     lte(k,v){filters.push(['lte',k,v]);return this;},
     is(k,v){filters.push(['eq',k,v]);return this;},
     in(k,v){filters.push(['in',k,v]);return this;},
     or(v){orText=v;return this;},
     order(){return this;},limit(){return this;},
     insert(v){op='insert';payload=v;return this;},
     update(v){op='update';payload=v;return this;},
     maybeSingle:async()=>run(true),
     single:async()=>run(true),
     then(resolve,reject){return Promise.resolve(run(false)).then(resolve,reject);}
    };
    const sources={profiles,classes,student_class_memberships:memberships,vocabulary_battles:matches,vocabulary_reward_owned};
    if(!sources[table])throw Error('Unexpected table '+table);
    function matchesFilters(item){
      if(orText){
        const pair=orText.split(',').map(x=>x.split('.eq.'));
        if(!pair.some(([key,val])=>String(item[key])===val))return false;
      }
      return filters.every(([type,k,v])=>{
       if(type==='eq')return k.endsWith('_answers')?JSON.stringify(item[k])===v:item[k]===v;
       if(type==='in')return v.includes(item[k]);
       if(type==='gt')return new Date(item[k]).getTime()>new Date(v).getTime();
       if(type==='gte')return new Date(item[k]).getTime()>=new Date(v).getTime();
       if(type==='lte')return new Date(item[k]).getTime()<=new Date(v).getTime();
       return false;
      });
    }
    function run(single){
     if(op==='insert'){
      const row={id:MATCH,status:'pending',created_at:new Date().toISOString(),expires_at:new Date(Date.now()+600000).toISOString(),
        starts_at:null,ends_at:null,challenger_ready_at:null,opponent_ready_at:null,challenger_answers:[],opponent_answers:[],...payload};
      matches.push(row);return {data:single?row:[row],error:null};
     }
     let rows=sources[table].filter(matchesFilters);
     if(op==='update'){
       rows.forEach(row=>Object.assign(row,payload));
     }
     return {data:single?(rows[0]??null):rows.map(row=>({...row})),error:null};
    }
    return q;
   }
  };
 }
 const env={SUPABASE_URL:'https://example.test',SUPABASE_PUBLISHABLE_KEYS:'{"default":"public"}',SUPABASE_SECRET_KEYS:'{"default":"secret"}'};
 const Deno={env:{get:k=>env[k]},serve:fn=>{handler=fn;}};
 new Function('createClient','Deno','equippedAvatars',code)(client,Deno,equippedAvatars);
 async function call(user,body){
  actor=user;
  const response=await handler(new Request('https://example.test',{method:'POST',
   headers:{Authorization:'Bearer test', 'Content-Type':'application/json'},body:JSON.stringify(body)}));
  return {status:response.status,payload:await response.json()};
 }
 return {call,matches};
}

test('class listing contains only the current student own active class',async()=>{
 const h=createHarness();
 const one=await h.call(USER,{action:'classes'});
 assert.equal(one.status,200);
 assert.deepEqual(one.payload.classes,[{id:CLASS,name:'G9 ESL 4'}]);
 const other=await h.call(OUT,{action:'classes'});
 assert.deepEqual(other.payload.classes,[{id:OTHER,name:'G10 ESL 5'}]);
});

test('cross-class challenge cannot create match or change any data',async()=>{
 const h=createHarness();
 const denied=await h.call(USER,{action:'challenge',classId:CLASS,opponentId:OUT,unitNumber:1});
 assert.equal(denied.status,403);
 assert.equal(h.matches.length,0);
 const foreign=await h.call(USER,{action:'lobby',classId:OTHER});
 assert.equal(foreign.status,403);
});

test('two classmates share one server-owned set and cannot double-answer a question',async()=>{
 const h=createHarness();
 const create=await h.call(USER,{action:'challenge',classId:CLASS,opponentId:OPP,unitNumber:1});
 assert.equal(create.status,200);
 assert.equal(h.matches.length,1);
 assert.equal(h.matches[0].question_ids.length,10);
 const forbidden=await h.call(USER,{action:'accept',battleId:MATCH});
 assert.equal(forbidden.status,403,'only the invited student may accept');
 assert.equal(h.matches[0].status,'pending');
 const accept=await h.call(OPP,{action:'accept',battleId:MATCH});
 assert.equal(accept.status,200);assert.equal(accept.payload.status,'accepted');
 const waiting=await h.call(USER,{action:'status',battleId:MATCH});
 assert.equal(waiting.payload.question,null,'players cannot begin until both are ready');
 assert.equal(waiting.payload.startsAt,null);
 assert.equal(waiting.payload.avatarId,'avatar-pixel-bot');
 assert.equal(waiting.payload.opponentAvatarId,'avatar-shadow-fox');
 const early=await h.call(USER,{action:'answer',battleId:MATCH,index:0,choice:0});
 assert.equal(early.status,409,'no answer allowed before both students are ready');
 const readyOne=await h.call(USER,{action:'ready',battleId:MATCH});
 assert.equal(readyOne.status,200);
 const stillWaiting=await h.call(USER,{action:'status',battleId:MATCH});
 assert.equal(stillWaiting.payload.startsAt,null);
 const readyTwo=await h.call(OPP,{action:'ready',battleId:MATCH});
 assert.equal(readyTwo.status,200);
 const started=await h.call(USER,{action:'status',battleId:MATCH});
 assert.ok(started.payload.startsAt,'both Ready flags schedule a shared start');
 assert.ok(started.payload.endsAt,'match deadline is scheduled');
 h.matches[0].starts_at=new Date(Date.now()-3000).toISOString();
 h.matches[0].ends_at=new Date(Date.now()+57000).toISOString();
 const first=await h.call(USER,{action:'status',battleId:MATCH});
 const second=await h.call(OPP,{action:'status',battleId:MATCH});
 assert.deepEqual(first.payload.question,second.payload.question);
 assert.equal('correct' in first.payload.question,false,'correct answer never sent to browser');
 const answer=await h.call(USER,{action:'answer',battleId:MATCH,index:0,choice:0});
 assert.equal(answer.status,200);
 assert.equal(h.matches[0].challenger_answers.length,1);
 const duplicate=await h.call(USER,{action:'answer',battleId:MATCH,index:0,choice:0});
 assert.equal(duplicate.status,409);
 assert.equal(h.matches[0].challenger_answers.length,1);
 const outsider=await h.call(OUT,{action:'status',battleId:MATCH});
 assert.equal(outsider.status,403);
});

test('expired battle blocks score changes even on a previously opened question',async()=>{
 const h=createHarness();
 await h.call(USER,{action:'challenge',classId:CLASS,opponentId:OPP,unitNumber:9});
 await h.call(OPP,{action:'accept',battleId:MATCH});
 await h.call(USER,{action:'ready',battleId:MATCH});
 await h.call(OPP,{action:'ready',battleId:MATCH});
 await h.call(USER,{action:'status',battleId:MATCH});
 h.matches[0].starts_at=new Date(Date.now()-65000).toISOString();
 h.matches[0].ends_at=new Date(Date.now()-5000).toISOString();
 const late=await h.call(USER,{action:'answer',battleId:MATCH,index:0,choice:0});
 assert.equal(late.status,409);
 assert.equal(h.matches[0].challenger_answers.length,0);
});

test('Battle lobby returns only equipped avatars of authorised classmates',async()=>{
 const h=createHarness();
 const {payload}=await h.call(USER,{action:'lobby',classId:CLASS});
 assert.equal(payload.avatarId,'avatar-pixel-bot');
 assert.deepEqual(payload.students,[{id:OPP,display_name:'Bravo',avatarId:'avatar-shadow-fox'}]);
});
