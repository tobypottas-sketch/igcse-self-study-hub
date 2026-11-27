import {avatarInitials,renderAvatarArtwork} from './rewards-avatars.js';
// Vocabulary Battles V2 — polished student UI over the existing server-authoritative
// challenge/ready/answer API. No client-side XP, mastery or result settlement.
import {getSupabaseClient} from '../supabase.js';
import {escapeHtml} from '../views/html.js';

const root=document.getElementById('battlesApp');
const e=value=>escapeHtml(String(value??''));
const names=new Map();
const state={
 client:null,profile:null,classes:[],classId:'',unit:1,opponent:'',lobby:null,board:[],
 battleId:null,battle:null,busy:false,polling:false,error:'',flash:'',timer:null,clock:null,
 viewKey:'',requestEpoch:0
};
const seconds=date=>date?Math.max(0,Math.ceil((new Date(date).getTime()-Date.now())/1000)):0;
const avatar=(name,side='a',size='',id=null)=>'<span class="battle-avatar battle-avatar--'+side+(size?' battle-avatar--'+size:'')+'" aria-hidden="true">'+'<span>'+e(avatarInitials(name))+'</span>'+renderAvatarArtwork(id)+'</span>';
const btn=(label,action,extra='',disabled=false)=>'<button type="button" class="battle-btn" data-battle-act="'+action+'" '+extra+(disabled?' disabled':'')+'>'+label+'</button>';
const panel=(body,kind='')=>'<section class="battle-panel '+kind+'">'+body+'</section>';
const heading=(eyebrow,title,subtitle)=>'<header class="battle-heading"><p class="battle-kicker">'+e(eyebrow)+'</p><h1>'+e(title)+'</h1><p class="battle-heading__subtitle">'+e(subtitle)+'</p></header>';

async function api(payload){
 const {data,error}=await state.client.functions.invoke('vocabulary-battles',{body:payload});
 if(error||data?.error){
  let reason=data?.error;
  if(!reason&&error?.context?.json)try{reason=(await error.context.json())?.error;}catch{}
  throw new Error(reason||'Could not contact the Battle Arena.');
 }
 return data;
}
function shell(){
 return '<header class="battle-top"><a href="./vocabulary.html" class="battle-back">← Vocabulary Builder</a><span class="battle-top__brand"><span aria-hidden="true">⚔️</span> CLASS BATTLES <span class="battle-top__edition">V2</span></span></header>';
}
function message(){
 return '<div class="battle-notices" aria-live="polite">'+(state.error?'<p class="battle-alert" role="alert">'+e(state.error)+'</p>':state.flash?'<p class="battle-alert battle-alert--ok" role="status">'+e(state.flash)+'</p>':'')+'</div>';
}
function render(content,viewKey){
 if(!root)return;
 state.viewKey=viewKey;
 root.innerHTML='<main class="battle-shell">'+shell()+message()+content+'</main>';
 updateClock();
}
function pill(label,variant='') {return '<span class="battle-pill '+variant+'">'+e(label)+'</span>';}
function lobbyMarkup(){
 const lobby=state.lobby;
 const classSelect=state.classes.length===1
  ? '<div class="battle-class-static"><span class="battle-class-static__label">MY CLASS</span><span class="battle-class-static__value"><span class="battle-class-static__dot" aria-hidden="true"></span>'+e(state.classes[0].name)+'</span></div>'
  : '<label class="battle-select-label battle-class-select-label">MY CLASS <span class="battle-class-select-wrap"><select data-battle-class aria-label="Choose your class">'+state.classes.map(c=>'<option value="'+e(c.id)+'"'+(c.id===state.classId?' selected':'')+'>'+e(c.name)+'</option>').join('')+'</select><span class="battle-class-select-chevron" aria-hidden="true"></span></span></label>';
 if(!lobby)return heading('CLASS BATTLES','The Battle Arena','Finding your classmates…')+panel(classSelect+'<p class="battle-empty">Loading the Arena…</p>');
 const others=lobby.students??[];
 const selected=others.find(row=>row.id===state.opponent);
 const opponentSelect='<label class="battle-select-label">CHOOSE A CLASSMATE<select data-battle-opponent><option value="">Select your opponent…</option>'+others.map(row=>'<option value="'+e(row.id)+'"'+(row.id===state.opponent?' selected':'')+'>'+e(row.display_name)+'</option>').join('')+'</select></label>';
 const unitSelect='<label class="battle-select-label">VOCABULARY UNIT<select data-battle-unit><option value="1"'+(state.unit===1?' selected':'')+'>Unit 1 · Sports & Free Time</option><option value="9"'+(state.unit===9?' selected':'')+'>Unit 9 · Communication</option></select></label>';
 const choice='<div class="battle-choice-grid">'+unitSelect+opponentSelect+'</div>';
 const versus='<div class="battle-challenge-versus"><div class="battle-challenge-player">'+avatar(state.profile?.display_name,'a','',lobby.avatarId)+'<span><small>YOU</small><strong>'+e(state.profile?.display_name)+'</strong></span></div><span class="battle-vs" aria-label="versus">VS</span><div class="battle-challenge-player">'+avatar(selected?.display_name??'?','b','',selected?.avatarId)+'<span><small>OPPONENT</small><strong data-selected-opponent>'+e(selected?.display_name??'Choose a classmate')+'</strong></span></div></div>';
 const pending=(lobby.pending??[]).map(b=>{
  const received=b.opponent_id===lobby.me;
  const opponent=names.get(received?b.challenger_id:b.opponent_id)??'Classmate';
  const actions=received?btn('Accept challenge','accept','data-id="'+e(b.id)+'" data-primary')+btn('Decline','decline','data-id="'+e(b.id)+'"'):btn('Cancel invite','cancel','data-id="'+e(b.id)+'"');
  return '<article class="battle-request">'+avatar(opponent,received?'b':'a','sm',others.find(row=>row.id===(received?b.challenger_id:b.opponent_id))?.avatarId)+'<div class="battle-request__info"><strong>'+e(opponent)+'</strong><small>Unit '+e(b.unit_number)+' · '+(received?'Invited you to battle':'Waiting for a reply')+'</small></div><div class="battle-request-actions">'+actions+'</div></article>';
 }).join('');
 const active=(lobby.active??[]).map(b=>{
  const rival=names.get(b.challenger_id===lobby.me?b.opponent_id:b.challenger_id)??'Classmate';
  return '<article class="battle-request battle-request--active">'+avatar(rival,'b','sm',others.find(row=>row.id===(b.challenger_id===lobby.me?b.opponent_id:b.challenger_id))?.avatarId)+'<div class="battle-request__info"><strong>'+e(rival)+'</strong><small>Unit '+e(b.unit_number)+' · '+(b.starts_at?'Battle in progress':'Enter the ready room')+'</small></div>'+btn('Enter duel →','enter','data-id="'+e(b.id)+'" data-primary')+'</article>';
 }).join('');
 const invitations=active+pending||'<div class="battle-empty-state"><span aria-hidden="true">📨</span><strong>No challenges yet</strong><p>Invite a classmate to start a battle!</p></div>';
 const podium=state.board.slice(0,3).map((row,index)=>'<div class="battle-podium__entry battle-podium__entry--'+(index+1)+'"><span class="battle-podium__medal">'+['🥇','🥈','🥉'][index]+'</span>'+avatar(row.name,index===0?'gold':'b','sm',row.avatarId)+'<span><strong>'+e(row.name)+'</strong><small>'+row.wins+' win'+(row.wins===1?'':'s')+'</small></span></div>').join('');
 const rows=state.board.map((row,index)=>'<tr'+(row.id===lobby.me?' class="is-you"':'')+'><td><span class="battle-rank">'+(index<3?['🥇','🥈','🥉'][index]:index+1)+'</span></td><th scope="row">'+(row.avatarId?avatar(row.name,'b','sm',row.avatarId):'')+e(row.name)+(row.id===lobby.me?' <span class="battle-you">YOU</span>':'')+'</th><td>'+row.wins+'</td><td>'+row.played+'</td><td>'+row.score.toLocaleString('en')+'</td></tr>').join('')||'<tr><td colspan="5" class="battle-no-ranks">Complete the first duel to claim the top spot!</td></tr>';
 return '<section class="battle-lobby-hero">'+heading('⚔️ CLASS CHALLENGES','Vocabulary Battles','Pick your rival. Ten shared questions. Sixty seconds. One winner.')+'<div class="battle-lobby-hero__info"><span>🎯 10 questions</span><span>⏱ 60 seconds</span><span>🔒 Classmates only</span></div></section>'
 +'<div class="battle-class-controls">'+classSelect+pill('No XP at stake','battle-pill--safe')+'</div>'
 +panel('<div class="battle-panel__head"><span class="battle-kicker">01 · NEW CHALLENGE</span><h2>Choose your opponent</h2><p>Invite someone from your own class to a vocabulary showdown.</p></div>'+versus+choice+'<div class="battle-challenge__footer"><p>Both players press Ready before the clock starts. The question set is identical.</p>'+btn('Send Challenge ⚔️','challenge','data-primary',!state.opponent||state.busy)+'</div>','battle-panel--challenge')
 +'<div class="battle-two-column">'+panel('<div class="battle-panel__head"><span class="battle-kicker">02 · MATCHMAKING</span><h2>Challenges <span class="battle-count-chip">'+((lobby.pending??[]).length+(lobby.active??[]).length)+'</span></h2><p>Invitations and ongoing matches from your class.</p></div><div class="battle-request-list">'+invitations+'</div>','battle-panel--invitations')
 +panel('<div class="battle-panel__head"><span class="battle-kicker">03 · CLASS RANKINGS</span><h2>Weekly Champions <span aria-hidden="true">🏆</span></h2><p>Wins and battle points from the last seven days.</p></div><div class="battle-podium">'+podium+'</div><div class="battle-table-wrap"><table><thead><tr><th>RANK</th><th>CLASSMATE</th><th>WINS</th><th>PLAYED</th><th>POINTS</th></tr></thead><tbody>'+rows+'</tbody></table></div>','battle-panel--leaderboard')+'</div>';
}
function phaseFor(b){
 if(!b)return 'loading';
 if(b.status==='pending')return 'pending';
 if(b.status==='declined'||b.status==='cancelled')return 'closed';
 if(b.finished)return 'finished';
 if(!b.startsAt)return 'ready';
 if(seconds(b.startsAt)>0)return 'countdown';
 if(seconds(b.endsAt)===0)return 'timeout';
 if(b.question)return 'question';
 return 'answered';
}
function matchSignature(b){
 const phase=phaseFor(b);
 // Opponent progress and scores are HUD data, not screen identity: updating them
 // must NEVER replace the active answer buttons or keyboard focus.
 return 'match:'+state.battleId+':'+phase+':'+(b?.answered??0)+':'+(b?.question?.id??'')+':'+(b?.ready??false)+':'+(b?.opponentReady??false)+':'+(b?.outcome??'');
}
function matchup(b){
 const rival=b.challengerId===state.profile.id?b.opponentName:b.challengerName;
 return '<section class="battle-matchup" aria-label="Players and scores"><div class="battle-fighter battle-fighter--self">'+avatar(state.profile.display_name,'a','',b.avatarId)+'<div><small>YOU · PLAYER 1</small><strong>'+e(state.profile.display_name)+'</strong><b data-own-score>'+b.score+' <span>PTS</span></b></div></div><div class="battle-matchup__vs"><span>VS</span><small>UNIT '+e(b.unitNumber)+'</small></div><div class="battle-fighter battle-fighter--rival">'+avatar(rival,'b','',b.opponentAvatarId)+'<div><small>CLASSMATE · PLAYER 2</small><strong>'+e(rival)+'</strong><b data-rival-progress>'+(b.finished?b.opponentScore+' <span>PTS</span>':b.opponentAnswered+' / '+b.total+' <span>DONE</span>')+'</b></div></div></section>';
}
function readyCard(name,ready,side,avatarId){
 return '<div class="battle-ready-card battle-ready-card--'+side+'">'+avatar(name,side,'',avatarId)+'<strong>'+e(name)+'</strong><span class="battle-ready-status '+(ready?'is-ready':'')+'">'+(ready?'✓ READY':'◌ WAITING')+'</span></div>';
}
function battleContent(b,phase){
 const rival=b.challengerId===state.profile.id?b.opponentName:b.challengerName;
 if(phase==='pending')return '<div class="battle-wait"><div class="battle-scene-icon" aria-hidden="true">📨</div><p class="battle-kicker">INVITATION SENT</p><h2>Waiting for a response</h2><p>Your opponent can accept the invitation from the Arena lobby.</p></div>';
 if(phase==='closed')return '<div class="battle-wait"><div class="battle-scene-icon" aria-hidden="true">🛡️</div><h2>Invitation '+e(b.status)+'</h2><p>Head back to the Arena to start another challenge.</p></div>';
 if(phase==='finished'){
  const result=b.outcome==='won'?{icon:'🏆',label:'VICTORY!',message:'You won the duel!',theme:'win'}:b.outcome==='lost'?{icon:'🛡️',label:'GOOD BATTLE',message:'Your classmate takes this round.',theme:'loss'}:{icon:'🤝',label:'A DRAW!',message:'An evenly matched duel!',theme:'draw'};
  return '<div class="battle-finish battle-finish--'+result.theme+'"><div class="battle-finish__trophy" aria-hidden="true">'+result.icon+'</div><p class="battle-kicker">BATTLE RESULTS</p><h2>'+result.label+'</h2><p>'+result.message+'</p><div class="battle-final-scores"><div>'+avatar(state.profile.display_name,'a','',b.avatarId)+'<span>YOUR SCORE</span><strong>'+b.score+'</strong></div><span>VS</span><div>'+avatar(rival,'b','',b.opponentAvatarId)+'<span>OPPONENT</span><strong>'+b.opponentScore+'</strong></div></div>'+btn('Return to Arena →','back','data-primary')+'<p class="battle-finish__note">Every battle is practice. Keep improving and challenge again!</p></div>';
 }
 if(phase==='ready')return '<div class="battle-ready"><p class="battle-kicker">READY ROOM</p><h2>Ready for the showdown?</h2><p>The 60-second clock will only start when <strong>both players</strong> are ready.</p><div class="battle-ready-grid">'+readyCard(state.profile.display_name,b.ready,'a',b.avatarId)+'<span class="battle-vs battle-vs--large">VS</span>'+readyCard(rival,b.opponentReady,'b',b.opponentAvatarId)+'</div>'+(b.ready?'<p class="battle-ready__waiting" role="status">✓ You’re ready! Waiting for your classmate…</p>':btn('I’M READY ⚔️','ready','data-primary'))+'</div>';
 if(phase==='countdown')return '<div class="battle-countdown"><span class="battle-kicker">BATTLE STARTING</span><strong data-countdown>'+seconds(b.startsAt)+'</strong><h2>Get ready!</h2><p>Same questions. Same timer. Give it your best shot!</p></div>';
 if(phase==='timeout')return '<div class="battle-wait"><div class="battle-scene-icon" aria-hidden="true">⏳</div><h2>Time’s up!</h2><p>Checking the final scores…</p></div>';
 if(phase==='answered')return '<div class="battle-wait"><div class="battle-scene-icon" aria-hidden="true">✅</div><h2>All questions answered!</h2><p>Your score is in. Waiting for your opponent or the timer.</p></div>';
 const count=b.answered+1,total=b.total,remaining=seconds(b.endsAt);
 return '<div class="battle-question"><div class="battle-question__top"><div><span class="battle-kicker">LIVE DUEL · QUESTION '+count+' / '+total+'</span><div class="battle-progress" role="progressbar" aria-label="Questions answered" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+b.answered+'"><span style="width:'+(b.answered/total*100)+'%"></span></div></div><div class="battle-timer'+(remaining<=10?' is-urgent':'')+'" data-timer><span>TIME LEFT</span><strong data-time-left>'+remaining+'s</strong></div></div><h2>'+e(b.question.prompt)+'</h2><div class="battle-options">'+b.question.options.map((option,i)=>btn('<span class="battle-option-letter">'+String.fromCharCode(65+i)+'</span><span class="battle-option-text">'+e(option)+'</span><span class="battle-option-arrow" aria-hidden="true">↗</span>','answer','data-choice="'+i+'"')).join('')+'</div><p class="battle-question__tip">Pick the best answer · <strong>100 points</strong> per correct response</p></div>';
}
function matchMarkup(){
 const b=state.battle;
 if(!b)return heading('BATTLE IN PROGRESS','Preparing your duel','Loading match information…');
 const phase=phaseFor(b);
 return '<div class="battle-match-title">'+heading('⚡ LIVE VOCABULARY DUEL','Word Blitz Battle','Unit '+b.unitNumber+' · '+b.className)+pill(phase==='finished'?'FINISHED':phase==='ready'?'READY ROOM':phase==='question'?'LIVE MATCH':'MATCH SETUP','battle-pill--phase')+'</div>'
  +matchup(b)+panel(battleContent(b,phase),'battle-panel--play battle-panel--'+phase)
  +'<footer class="battle-match-footer">'+btn('← Back to challenges','back')+'<small>Private server scoring · No XP gained or lost</small></footer>';
}
function updateClock(){
 if(!root||!state.battle)return;
 const b=state.battle,phase=phaseFor(b);
 const countdown=root.querySelector('[data-countdown]');
 if(countdown)countdown.textContent=String(seconds(b.startsAt));
 const clock=root.querySelector('[data-time-left]');
 if(clock){
  clock.textContent=seconds(b.endsAt)+'s';
  clock.closest('[data-timer]')?.classList.toggle('is-urgent',seconds(b.endsAt)<=10);
 }
 // Request new phase when client clock crosses a phase boundary, without
 // replacing an in-progress question or its answer buttons every tick.
 if((phase==='timeout'||phase==='question'&&root.querySelector('[data-countdown]')||phase==='countdown'&&!root.querySelector('[data-countdown]'))&&!state.polling&&!state.busy){
  void refresh();
 }
}
function patchMatchHud(b){
 const score=root.querySelector('[data-own-score]');
 if(score)score.innerHTML=b.score+' <span>PTS</span>';
 const opp=root.querySelector('[data-rival-progress]');
 if(opp)opp.innerHTML=(b.finished?b.opponentScore+' <span>PTS</span>':b.opponentAnswered+' / '+b.total+' <span>DONE</span>');
 updateClock();
}
function lobbySignature(lobby,board){
 return JSON.stringify({classId:state.classId,
  avatarId:lobby?.avatarId,students:(lobby?.students??[]).map(s=>[s.id,s.display_name,s.avatarId]),
  pending:(lobby?.pending??[]).map(b=>[b.id,b.status,b.opponent_id]),
  active:(lobby?.active??[]).map(b=>[b.id,b.starts_at]),
  board});
}
async function refresh({force=false}={}){
 if(state.busy||state.polling||!state.client)return;
 const epoch=state.requestEpoch;
 state.polling=true;
 try{
  if(state.battleId){
   const id=state.battleId;
   const b=await api({action:'status',battleId:id});
   if(epoch!==state.requestEpoch||id!==state.battleId)return;
   state.battle=b;
   if(b.startsAt || b.finished || b.status!=='accepted') {
    if(state.flash==='You’re ready! Waiting for the other player.')state.flash='';
   }
   const sig=matchSignature(b);
   if(force||state.viewKey!==sig)render(matchMarkup(),sig);
   else patchMatchHud(b);
  }else if(state.classId){
   const classId=state.classId;
   const [lobby,board]=await Promise.all([api({action:'lobby',classId}),api({action:'leaderboard',classId})]);
   if(epoch!==state.requestEpoch||classId!==state.classId||state.battleId)return;
   state.lobby=lobby;state.board=board.ranking??[];
   for(const p of lobby.students??[])names.set(p.id,p.display_name);
   const sig=lobbySignature(lobby,state.board);
   // A teacher may have a student selecting a long name from the dropdown.
   // Never replace the focused select during background polling.
   const usingSelect=root?.querySelector('select:focus');
   if(force||state.viewKey!==sig&&!usingSelect)render(lobbyMarkup(),sig);
  }
 }catch(err){
  if(epoch===state.requestEpoch){state.error=err.message;
   if(!root.querySelector('.battle-alert'))root.querySelector('.battle-notices')?.insertAdjacentHTML('beforeend','<p class="battle-alert" role="alert">'+e(err.message)+'</p>');
  }
 }finally{state.polling=false;}
}
async function act(action,target){
 if(state.busy)return;
 if(action==='back'){state.requestEpoch++;state.battleId=null;state.battle=null;state.viewKey='';render(lobbyMarkup(),'lobby-loading');void refresh({force:true});return;}
 if(action==='enter'){state.requestEpoch++;state.battleId=target.dataset.id;state.battle=null;render(matchMarkup(),'match-loading');void refresh({force:true});return;}
 state.busy=true;state.error='';state.flash='';
 try{
  if(action==='ready'){
   if(!state.battleId)return;
   await api({action:'ready',battleId:state.battleId});
   state.flash='You’re ready! Waiting for the other player.';
  }else if(action==='challenge'){
   if(!state.opponent)throw new Error('Choose a classmate to challenge.');
   await api({action:'challenge',classId:state.classId,opponentId:state.opponent,unitNumber:state.unit});
   state.flash='Challenge sent! Your classmate can accept it from the Arena.';
  }else if(['accept','decline','cancel'].includes(action)){
   await api({action,battleId:target.dataset.id});
   if(action==='accept'){state.requestEpoch++;state.battleId=target.dataset.id;state.battle=null;}
  }else if(action==='answer'){
   if(!state.battleId||!state.battle?.question)return;
   root.querySelectorAll('[data-battle-act="answer"]').forEach(el=>el.disabled=true);
   const result=await api({action:'answer',battleId:state.battleId,index:state.battle.answered,choice:Number(target.dataset.choice)});
   state.flash=result.correct?'Correct! +100 points':'Keep going — next question!';
  }
 }catch(err){state.error=err.message;}
 finally{state.busy=false;}
 state.viewKey='';
 await refresh({force:true});
}
async function start(){
 try{
  state.client=await getSupabaseClient();
  const {data:{user},error}=await state.client.auth.getUser();
  if(error||!user)throw new Error('Sign in to the Hub to enter the Battle Arena.');
  const {data:profile,error:profileError}=await state.client.from('profiles').select('id,display_name,role,active').eq('id',user.id).single();
  if(profileError||!profile?.active||profile.role!=='student')throw new Error('Battles are for active student accounts.');
  state.profile=profile;
  const response=await api({action:'classes'});
  state.classes=response.classes??[];
  if(!state.classes.length)throw new Error('You need an active class assignment to battle classmates.');
  state.classId=state.classes[0].id;
  render(lobbyMarkup(),'lobby-loading');
  await refresh({force:true});
  state.timer=setInterval(()=>void refresh(),3000);
  state.clock=setInterval(updateClock,250);
 }catch(err){
  state.error=err.message;
  render(heading('BATTLE ARENA','Unable to start',err.message),'error');
 }
}
root?.addEventListener('change',event=>{
 const target=event.target;
 if(target.matches?.('[data-battle-class]')){
  state.requestEpoch++;state.classId=target.value;state.opponent='';state.lobby=null;state.board=[];
  render(lobbyMarkup(),'lobby-loading');void refresh({force:true});
 }else if(target.matches?.('[data-battle-unit]'))state.unit=Number(target.value);
 else if(target.matches?.('[data-battle-opponent]')){
  state.opponent=target.value;
  const peer=state.lobby?.students?.find(s=>s.id===state.opponent);
  const label=root.querySelector('[data-selected-opponent]');
  if(label)label.textContent=peer?.display_name??'Choose a classmate';
  const avatarLabel=root.querySelector('.battle-challenge-player:last-child .battle-avatar');
  if(avatarLabel)avatarLabel.outerHTML=avatar(peer?.display_name,'b','',peer?.avatarId);
  const send=root.querySelector('[data-battle-act="challenge"]');
  if(send)send.disabled=!state.opponent;
 }
});
root?.addEventListener('click',event=>{
 const target=event.target.closest?.('[data-battle-act]');
 if(target)void act(target.dataset.battleAct,target);
});
window.addEventListener('pagehide',()=>{
 if(state.timer)clearInterval(state.timer);
 if(state.clock)clearInterval(state.clock);
});
void start();
