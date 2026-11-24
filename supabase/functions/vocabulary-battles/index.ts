import {equippedAvatars} from '../_shared/vocabulary-avatar.ts';
import {createClient} from 'npm:@supabase/supabase-js@2.117.3';

/* Class-only, server-scored Vocabulary Battles. No XP or mastery mutations.
   Every participant is checked against ACTIVE current memberships on every action.
   Shared questions and correct answers never leave this server. */
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,apikey,x-client-info,content-type','Access-Control-Allow-Methods':'POST,OPTIONS'};
const respond=(body:unknown,status=200)=>Response.json(body,{status,headers:{...cors,'Cache-Control':'no-store'}});
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LIMIT=10,DURATION=60000;
type Question={id:string;unit:number;prompt:string;options:[string,string,string,string];correct:number};
const BANK:Question[]=[
 {id:'u1-opponent',unit:1,prompt:'An opponent is…',options:['someone you compete against','a referee in a game','a person who cheers you on','the winner of a tournament'],correct:0},
 {id:'u1-tournament',unit:1,prompt:'A tournament is…',options:['a training session','a series of matches to find a winner','a private sports lesson','a single practice drill'],correct:1},
 {id:'u1-patience',unit:1,prompt:'Patience is the ability to…',options:['win every match','change the rules','wait calmly without becoming annoyed','run quickly for a long time'],correct:2},
 {id:'u1-elite',unit:1,prompt:'Which word means among the very best in a group?',options:['casual','ordinary','temporary','elite'],correct:3},
 {id:'u1-criteria',unit:1,prompt:'Criteria are…',options:['standards used to make a judgement','prizes awarded to a winner','people taking part in a race','different kinds of exercises'],correct:0},
 {id:'u1-achievement',unit:1,prompt:'An achievement is…',options:['a rule you must follow','something successful accomplished through effort','an instruction to a teammate','a chance to try later'],correct:1},
 {id:'u1-leisure',unit:1,prompt:'What does leisure time mean?',options:['time spent travelling to work','time spent in exams','free time away from work or duties','time reserved for homework only'],correct:2},
 {id:'u1-competitor',unit:1,prompt:'A competitor is someone who…',options:['watches from the audience','sets the ticket prices','cleans the sports hall','takes part in a competition'],correct:3},
 {id:'u1-intense',unit:1,prompt:'An intense experience is…',options:['very strong or extreme','completely imaginary','quiet and unimportant','easy to forget'],correct:0},
 {id:'u1-discipline',unit:1,prompt:'Self-discipline helps someone…',options:['avoid every challenge','control their behaviour to reach a goal','ignore other people','change their opinion every minute'],correct:1},
 {id:'u1-reputation',unit:1,prompt:'A reputation is…',options:['a personal timetable','a set of rules','what people generally think about someone','a guaranteed award'],correct:2},
 {id:'u1-pastime',unit:1,prompt:'A pastime is…',options:['an official government rule','a compulsory school exam','an unpleasant accident','an activity enjoyed in free time'],correct:3},
 {id:'u9-communication',unit:9,prompt:'Communication is…',options:['sharing ideas or information','avoiding other people','speaking only in public','reading only formal books'],correct:0},
 {id:'u9-audience',unit:9,prompt:'An audience is…',options:['a device used for recording','the people watching or listening','a set of written instructions','a type of message'],correct:1},
 {id:'u9-nonverbal',unit:9,prompt:'Non-verbal communication uses…',options:['only formal grammar','only online messages','gestures, expressions and body language','written essays only'],correct:2},
 {id:'u9-appropriate',unit:9,prompt:'Something appropriate is…',options:['impossible to understand','deliberately offensive','very old-fashioned','suitable for the situation'],correct:3},
 {id:'u9-interactive',unit:9,prompt:'An interactive lesson…',options:['allows students to take part and respond','contains no student participation','uses only silent reading','must happen outdoors'],correct:0},
 {id:'u9-perception',unit:9,prompt:'A perception is…',options:['an official competition','the way someone understands or sees something','a detailed technical instruction','a formal written agreement'],correct:1},
 {id:'u9-conclusion',unit:9,prompt:'A conclusion usually appears…',options:['before the introduction','in every sentence','at the end of a piece of writing','only in spoken English'],correct:2},
 {id:'u9-frustration',unit:9,prompt:'Frustration is…',options:['complete satisfaction','a strong feeling of excitement','the ability to remain calm','annoyance when you cannot achieve what you want'],correct:3},
 {id:'u9-platform',unit:9,prompt:'A digital platform is…',options:['an online service or environment','an old-fashioned paper diary','a type of keyboard','a physical classroom wall'],correct:0},
 {id:'u9-formal',unit:9,prompt:'Formal language is most appropriate for…',options:['a quick message to a close friend','a professional job application','a playful conversation with a sibling','a casual gaming chat'],correct:1},
 {id:'u9-evaluate',unit:9,prompt:'To evaluate something means to…',options:['hide it from view','describe its colour only','judge its quality or effectiveness','repeat it without thinking'],correct:2},
 {id:'u9-virtual',unit:9,prompt:'A virtual meeting takes place…',options:['only outdoors','without any technology','on a sports pitch','online rather than face to face'],correct:3}
];
const map=new Map(BANK.map(q=>[q.id,q]));
const noAnswer=(q:Question)=>({id:q.id,prompt:q.prompt,options:q.options});
const safeId=(x:unknown)=>typeof x==='string'&&UUID.test(x)?x:null;
const keys=(raw:string|undefined)=>{const o=JSON.parse(raw??'{}');return o.default??Object.values(o)[0];};
const date=(x:string)=>new Date(x).getTime();
const now=()=>Date.now();
const shuffle=<T>(rows:T[])=>{const out=rows.slice();for(let i=out.length-1;i>0;i--){const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);const j=bytes[0]%(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;};
const result=(answers:{i:number;choice:number}[],ids:string[])=>answers.reduce((total,a)=>total+(map.get(ids[a.i])?.correct===a.choice?100:0),0);

Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return respond({error:'Method not allowed'},405);
 try{
  const bearer=req.headers.get('Authorization')?.match(/^Bearer (.+)$/)?.[1];
  if(!bearer)return respond({error:'Sign in to play Battles.'},401);
  const url=Deno.env.get('SUPABASE_URL');
  const publicKey=keys(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS'));
  const secretKey=keys(Deno.env.get('SUPABASE_SECRET_KEYS'));
  if(!url||typeof publicKey!=='string'||typeof secretKey!=='string')return respond({error:'Battle service not configured.'},503);
  const auth=createClient(url,publicKey,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:identity,error:authError}=await auth.auth.getUser(bearer);
  if(authError||!identity?.user)return respond({error:'Invalid login session.'},401);
  const uid=identity.user.id;
  const db=createClient(url,secretKey,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:profile,error:pError}=await db.from('profiles').select('id,role,active,display_name').eq('id',uid).single();
  if(pError||profile?.role!=='student'||profile.active!==true)return respond({error:'Active student account required.'},403);
  const {data:memberships,error:mError}=await db.from('student_class_memberships').select('class_id').eq('student_id',uid).is('ended_at',null);
  if(mError)return respond({error:'Could not check your class.'},503);
  const classIds=[...new Set((memberships??[]).map(m=>m.class_id))];
  if(!classIds.length)return respond({error:'You are not assigned to an active class.'},403);
  const {data:classes,error:cError}=await db.from('classes').select('id,class_name,active').in('id',classIds).eq('active',true);
  if(cError)return respond({error:'Class list unavailable.'},503);
  const allowed=new Map((classes??[]).map(c=>[c.id,c.class_name]));
  const input=await req.json().catch(()=>({}));
  const action=String(input?.action??'lobby');
  if(action==='classes')return respond({ok:true,classes:[...allowed].map(([id,name])=>({id,name}))});
  const classId=safeId(input?.classId);
  if(['lobby','challenge','leaderboard'].includes(action)&&!classId)return respond({error:'Select your class.'},400);
  if(classId&&!allowed.has(classId))return respond({error:'Not a member of this class.'},403);
  if(action==='lobby'){
    const {data:classMembers,error:cmError}=await db.from('student_class_memberships').select('student_id').eq('class_id',classId).is('ended_at',null);
    if(cmError)return respond({error:'Class roster unavailable.'},503);
    const ids=[...new Set((classMembers??[]).map(m=>m.student_id))];
    const {data:students,error:sError}=await db.from('profiles').select('id,display_name').in('id',ids).eq('role','student').eq('active',true);
    if(sError)return respond({error:'Students unavailable.'},503);
    const {data:matches,error:bError}=await db.from('vocabulary_battles').select('id,class_id,challenger_id,opponent_id,unit_number,status,created_at,expires_at,challenger_ready_at,opponent_ready_at,starts_at,ends_at')
      .eq('class_id',classId).or(`challenger_id.eq.${uid},opponent_id.eq.${uid}`).order('created_at',{ascending:false}).limit(20);
    if(bError)return respond({error:'Challenges unavailable.'},503);
    const pending=(matches??[]).filter(b=>b.status==='pending'&&date(b.expires_at)>now());
    const active=(matches??[]).filter(b=>b.status==='accepted'&&(!b.ends_at?date(b.expires_at)>now():date(b.ends_at)>now()));
    const avatars=await equippedAvatars(db,(students??[]).map(s=>s.id));
    return respond({ok:true,me:uid,avatarId:avatars.get(uid)??null,className:allowed.get(classId),classes:[...allowed].map(([id,name])=>({id,name})),
      students:(students??[]).filter(s=>s.id!==uid).map(({id,display_name})=>({id,display_name,avatarId:avatars.get(id)??null})).sort((a,b)=>a.display_name.localeCompare(b.display_name)),
      pending,active});
  }
  if(action==='challenge'){
    const opponent=safeId(input?.opponentId);
    const unit=Number(input?.unitNumber??1);
    if(!opponent||opponent===uid)return respond({error:'Choose another student.'},400);
    if(![1,9].includes(unit))return respond({error:'Only Units 1 and 9 are in the first Battle release.'},400);
    const {data:membership}=await db.from('student_class_memberships').select('student_id').eq('student_id',opponent).eq('class_id',classId).is('ended_at',null).maybeSingle();
    const {data:target}=await db.from('profiles').select('id').eq('id',opponent).eq('role','student').eq('active',true).maybeSingle();
    if(!membership||!target)return respond({error:'Challenge only active classmates.'},403);
    const {data:previous}=await db.from('vocabulary_battles').select('id,status,expires_at,ends_at').eq('class_id',classId)
      .or(`challenger_id.eq.${uid},opponent_id.eq.${uid}`).order('created_at',{ascending:false}).limit(20);
    if((previous??[]).filter(b=>b.status==='pending'&&date(b.expires_at)>now()).length>=3)
      return respond({error:'You already have three open challenges. Wait for a response.'},429);
    if((previous??[]).some(b=>b.status==='accepted'&&(!b.ends_at?date(b.expires_at)>now():date(b.ends_at)>now())))
      return respond({error:'Finish your current battle first.'},409);
    const questions=shuffle(BANK.filter(q=>q.unit===unit)).slice(0,LIMIT).map(q=>q.id);
    const {data:created,error:newError}=await db.from('vocabulary_battles').insert({class_id:classId,challenger_id:uid,opponent_id:opponent,unit_number:unit,question_ids:questions}).select('id').single();
    if(newError||!created)return respond({error:'Could not create the challenge.'},503);
    return respond({ok:true,id:created.id});
  }
  if(action==='leaderboard'){
    const since=new Date(now()-7*24*3600000).toISOString();
    const {data:battles,error:error}=await db.from('vocabulary_battles').select('challenger_id,opponent_id,question_ids,challenger_answers,opponent_answers,ends_at')
     .eq('class_id',classId).gte('ends_at',since).lte('ends_at',new Date().toISOString()).order('ends_at',{ascending:false}).limit(300);
    if(error)return respond({error:'Leaderboard unavailable.'},503);
    const totals=new Map<string,{wins:number;played:number;score:number}>();
    for(const b of battles??[]){
      const ids=b.question_ids as string[];
      const sa=result(b.challenger_answers??[],ids),sb=result(b.opponent_answers??[],ids);
      for(const [id,points,won] of [[b.challenger_id,sa,sa>sb],[b.opponent_id,sb,sb>sa]] as [string,number,boolean][]){
        const t=totals.get(id)??{wins:0,played:0,score:0};
        t.played++;t.score+=points;if(won)t.wins++;totals.set(id,t);
      }
    }
    const students=[...totals.keys()];
    const {data:names}=students.length?await db.from('profiles').select('id,display_name').in('id',students).eq('role','student').eq('active',true):{data:[]};
    const nameMap=new Map((names??[]).map(p=>[p.id,p.display_name]));
    const {data:members}=students.length?await db.from('student_class_memberships')
      .select('student_id').eq('class_id',classId).in('student_id',students).is('ended_at',null):{data:[]};
    const currentMembers=new Set((members??[]).map(m=>m.student_id));
    const avatars=await equippedAvatars(db,students.filter(id=>currentMembers.has(id)&&nameMap.has(id)));
    return respond({ok:true,ranking:[...totals].map(([id,t])=>({id,name:nameMap.get(id)??'Classmate',avatarId:avatars.get(id)??null,...t}))
      .sort((a,b)=>b.wins-a.wins||b.score-a.score||a.name.localeCompare(b.name)).slice(0,30)});
  }
  const battleId=safeId(input?.battleId);
  if(!battleId)return respond({error:'Invalid battle.'},400);
  const {data:b,error:getError}=await db.from('vocabulary_battles').select('*').eq('id',battleId).maybeSingle();
  if(getError||!b)return respond({error:'Battle not found.'},404);
  if(!allowed.has(b.class_id)||![b.challenger_id,b.opponent_id].includes(uid))return respond({error:'This is not your battle.'},403);
  const opponentSide=uid===b.opponent_id;
  const other=opponentSide?b.challenger_id:b.opponent_id;
  const {data:otherMember}=await db.from('student_class_memberships').select('student_id').eq('student_id',other).eq('class_id',b.class_id).is('ended_at',null).maybeSingle();
  if(!otherMember)return respond({error:'This battle is unavailable because a student changed classes.'},409);
  if(action==='accept'||action==='decline'||action==='cancel'){
    if(b.status!=='pending'||date(b.expires_at)<=now())return respond({error:'This invitation is no longer available.'},409);
    if(action==='cancel'&&uid!==b.challenger_id)return respond({error:'Only the challenger can cancel.'},403);
    if(action!=='cancel'&&uid!==b.opponent_id)return respond({error:'Only the invited student can reply.'},403);
    const changes=action==='accept'?{status:'accepted',expires_at:new Date(now()+600000).toISOString()}:{status:action==='decline'?'declined':'cancelled'};
    const {data:updated,error:uError}=await db.from('vocabulary_battles').update(changes).eq('id',battleId).eq('status','pending').select('id').maybeSingle();
    if(uError||!updated)return respond({error:'Invitation already handled.'},409);
    return respond({ok:true,status:changes.status});
  }
  if(b.status==='accepted'&&!b.starts_at&&date(b.expires_at)<=now()){
    await db.from('vocabulary_battles').update({status:'cancelled'}).eq('id',battleId).eq('status','accepted').is('starts_at',null);
    return respond({error:'Battle expired while waiting for both players to get ready.'},409);
  }
  if(action==='ready'){
    if(b.status!=='accepted'||b.starts_at)return respond({error:'The countdown has already started, or the invitation is closed.'},409);
    const key=opponentSide?'opponent_ready_at':'challenger_ready_at';
    if(b[key])return respond({ok:true,ready:true});
    const {data:updated,error:readyError}=await db.from('vocabulary_battles')
     .update({[key]:new Date().toISOString()}).eq('id',battleId).eq('status','accepted').is('starts_at',null).is(key,null)
     .select('id').maybeSingle();
    if(readyError||!updated)return respond({error:'Could not confirm readiness. Refresh the battle.'},409);
    return respond({ok:true,ready:true});
  }
  if(action==='status'&&b.status==='accepted'&&!b.starts_at&&b.challenger_ready_at&&b.opponent_ready_at){
    const start=new Date(now()+5000),end=new Date(start.getTime()+DURATION);
    const {data:started}=await db.from('vocabulary_battles').update({starts_at:start.toISOString(),ends_at:end.toISOString()})
      .eq('id',battleId).eq('status','accepted').is('starts_at',null).select('starts_at,ends_at').maybeSingle();
    if(started){b.starts_at=started.starts_at;b.ends_at=started.ends_at;}
    else {
      const {data:fresh}=await db.from('vocabulary_battles').select('starts_at,ends_at').eq('id',battleId).single();
      if(fresh){b.starts_at=fresh.starts_at;b.ends_at=fresh.ends_at;}
    }
  }
  const ids=b.question_ids as string[];
  const field=opponentSide?'opponent_answers':'challenger_answers';
  const own=(b[field]??[]) as {i:number;choice:number}[];
  const otherAnswers=(b[opponentSide?'challenger_answers':'opponent_answers']??[]) as {i:number;choice:number}[];
  const started=Boolean(b.starts_at&&b.ends_at);
  const timedOut=b.status==='accepted'&&started&&date(b.ends_at)<=now();
  const completed=own.length>=ids.length;
  const opponentsDone=otherAnswers.length>=ids.length;
  const settled=b.status==='accepted'&&(timedOut||(completed&&opponentsDone));
  if(action==='answer'){
    if(b.status!=='accepted'||!started||now()<date(b.starts_at)||timedOut||completed)return respond({error:'The battle is not accepting answers.'},409);
    const i=Number(input?.index),choice=Number(input?.choice);
    if(i!==own.length||!Number.isInteger(choice)||choice<0||choice>3)return respond({error:'Answer is out of order. Refresh your battle.'},409);
    const {data:updated,error:uError}=await db.from('vocabulary_battles')
      .update({[field]:[...own,{i,choice}]}).eq('id',battleId).eq('status','accepted').gt('ends_at',new Date().toISOString()).eq(field,JSON.stringify(own))
      .select('id').maybeSingle();
    if(uError||!updated)return respond({error:'Another answer was received. Refresh.'},409);
    return respond({ok:true,correct:map.get(ids[i])?.correct===choice,points:map.get(ids[i])?.correct===choice?100:0});
  }
  if(action!=='status')return respond({error:'Unknown action.'},400);
  const names=await db.from('profiles').select('id,display_name').in('id',[b.challenger_id,b.opponent_id])
   .eq('active',true).eq('role','student');
  if (names.error || names.data?.length!==2) return respond({error:'Battle players unavailable.'},409);
  const avatars=await equippedAvatars(db,[uid,other]);
  const nameMap=new Map((names.data??[]).map(p=>[p.id,p.display_name]));
  const current=ids[own.length]?map.get(ids[own.length]):null;
  return respond({ok:true,id:b.id,status:b.status,unitNumber:b.unit_number,
   classId:b.class_id,className:allowed.get(b.class_id),challengerId:b.challenger_id,
   avatarId:avatars.get(uid)??null,opponentAvatarId:avatars.get(other)??null,
   challengerName:nameMap.get(b.challenger_id),opponentName:nameMap.get(b.opponent_id),
   startsAt:b.starts_at,endsAt:b.ends_at,expiresAt:b.expires_at,
   ready:Boolean(b[opponentSide?'opponent_ready_at':'challenger_ready_at']),
   opponentReady:Boolean(b[opponentSide?'challenger_ready_at':'opponent_ready_at']),
   answered:own.length,opponentAnswered:otherAnswers.length,total:ids.length,
   score:result(own,ids),opponentScore:settled?result(otherAnswers,ids):null,
   question:b.status==='accepted'&&started&&!timedOut&&now()>=date(b.starts_at)&&!completed&&current?noAnswer(current):null,
   finished:settled,
   outcome:settled?(result(own,ids)>result(otherAnswers,ids)?'won':result(own,ids)<result(otherAnswers,ids)?'lost':'draw'):null});
 }catch(error){console.error('Vocabulary Battles request error',error);return respond({error:'Battle request could not be completed.'},503);}
});
