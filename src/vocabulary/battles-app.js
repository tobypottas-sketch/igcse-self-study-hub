import {getSupabaseClient} from '../supabase.js';
import {escapeHtml} from '../views/html.js';
const root=document.getElementById('battlesApp');
const e=x=>escapeHtml(String(x??''));
const state={client:null,profile:null,classes:[],classId:'',unit:1,opponent:'',lobby:null,board:[],battleId:null,battle:null,busy:false,error:'',flash:'',timer:null};
const button=(label,action,extra='',disabled=false)=>'<button type="button" class="battle-btn" data-battle-act="'+action+'" '+extra+(disabled?' disabled':'')+'>'+label+'</button>';
const title=(eyebrow,heading,copy)=>'<div class="battle-heading"><p>'+e(eyebrow)+'</p><h1>'+e(heading)+'</h1><span>'+e(copy)+'</span></div>';
const panel=(body,klass='')=>'<section class="battle-panel '+klass+'">'+body+'</section>';
const seconds=target=>Math.max(0,Math.ceil((new Date(target).getTime()-Date.now())/1000));
const names=new Map();
async function api(body){
 const {data,error}=await state.client.functions.invoke('vocabulary-battles',{body});
 if(error||data?.error){
  let reason=data?.error;
  if(!reason&&error?.context?.json)try{reason=(await error.context.json())?.error;}catch{}
  throw new Error(reason||'Could not contact the Battle Arena.');
 }
 return data;
}
function header(){
 return '<header class="battle-top"><a href="./vocabulary.html" class="battle-back">← Vocabulary Builder</a><span>⚔️ CLASS BATTLES</span></header>';
}
function draw(){
 if(!root)return;
 const notice=state.error?'<p class="battle-alert" role="alert">'+e(state.error)+'</p>':state.flash?'<p class="battle-alert battle-alert--ok" role="status">'+e(state.flash)+'</p>':'';
 root.innerHTML='<main class="battle-shell">'+header()+notice+(state.battleId?renderMatch():renderLobby())+'</main>';
}
function renderLobby(){
 const lobby=state.lobby;
 const classMenu='<label class="battle-select-label">My class <select data-battle-class>'+state.classes.map(c=>'<option value="'+e(c.id)+'"'+(c.id===state.classId?' selected':'')+'>'+e(c.name)+'</option>').join('')+'</select></label>';
 if(!lobby)return title('THE ARENA','Vocabulary Battles','Loading your class…')+classMenu;
 const others=lobby.students??[];
 const challengers='<div class="battle-duel-grid"><label>Unit<select data-battle-unit><option value="1"'+(state.unit===1?' selected':'')+'>Unit 1 — Sports & Free Time</option><option value="9"'+(state.unit===9?' selected':'')+'>Unit 9 — Communication</option></select></label><label>Challenge a classmate<select data-battle-opponent><option value="">Choose your opponent…</option>'+others.map(row=>'<option value="'+e(row.id)+'"'+(state.opponent===row.id?' selected':'')+'>'+e(row.display_name)+'</option>').join('')+'</select></label></div>';
 const pending=(lobby.pending??[]).map(b=>{
  const received=b.opponent_id===lobby.me,who=names.get(received?b.challenger_id:b.opponent_id)??'Classmate';
  return '<article class="battle-request"><div><strong>'+e(who)+'</strong><small>Unit '+e(b.unit_number)+' · '+(received?'Challenged you':'Invitation sent')+'</small></div><div class="battle-request-actions">'+(received?button('Accept ⚔️','accept','data-id="'+e(b.id)+'"')+button('Decline','decline','data-id="'+e(b.id)+'"'):button('Cancel','cancel','data-id="'+e(b.id)+'"'))+'</div></article>';
 }).join('')||'<p class="battle-empty">No open challenges. Invite someone to start!</p>';
 const active=(lobby.active??[]).map(b=>'<article class="battle-request"><div><strong>Unit '+e(b.unit_number)+' battle</strong><small>Challenge accepted · battle timer is running</small></div>'+button('Enter arena →','enter','data-id="'+e(b.id)+'"')+'</article>').join('');
 const rows=state.board.map((row,i)=>'<tr><td>'+(i+1)+'</td><th scope="row">'+e(row.name)+(row.id===lobby.me?' <span class="battle-you">YOU</span>':'')+'</th><td>'+row.wins+'</td><td>'+row.played+'</td><td>'+row.score+'</td></tr>').join('')||'<tr><td colspan="5">Finish the first battle to start the rankings.</td></tr>';
 return title('WELCOME TO THE ARENA','Vocabulary Battles','Challenge a classmate. Ten shared questions. Sixty seconds. One winner.')
 +'<div class="battle-class-controls">'+classMenu+'<span>⚡ No XP at stake · progress stays untouched</span></div>'
 +panel('<p class="battle-kicker">START A CHALLENGE</p><h2>Choose your opponent</h2>'+challengers+
 '<p class="battle-note">Your opponent must accept before the countdown begins. Both players answer the same questions.</p>'+button('Send challenge ⚔️','challenge','data-primary',!state.opponent||state.busy),'battle-challenge')
 +'<div class="battle-two-column">'+panel('<p class="battle-kicker">CHALLENGES</p><h2>Invitations & active battles</h2>'+active+pending,'battle-invitations')
 +panel('<p class="battle-kicker">LAST 7 DAYS</p><h2>Class leaderboard</h2><div class="battle-table-wrap"><table><thead><tr><th>#</th><th>Classmate</th><th>Wins</th><th>Played</th><th>Points</th></tr></thead><tbody>'+rows+'</tbody></table></div>','battle-leaderboard')+'</div>';
}
function renderMatch(){
 const b=state.battle;
 if(!b)return title('THE ARENA','Preparing battle','Checking your match…');
 const pending=b.status==='pending',starts=b.startsAt?seconds(b.startsAt):0,remaining=b.endsAt?seconds(b.endsAt):0;
 const rival=b.challengerId===state.profile.id?b.opponentName:b.challengerName;
 const matchup='<div class="battle-matchup"><div><small>YOU</small><strong>'+e(state.profile.display_name)+'</strong><b>'+b.score+' pts</b></div><span>VS</span><div><small>CLASSMATE</small><strong>'+e(rival)+'</strong><b>'+(b.finished?b.opponentScore+' pts':b.opponentAnswered+' / '+b.total+' answered')+'</b></div></div>';
 let body='';
 if(pending)body='<h2>Challenge waiting for a reply…</h2><p>Return to the lobby while your classmate decides.</p>';
 else if(b.status==='declined'||b.status==='cancelled')body='<h2>Invitation '+e(b.status)+'</h2>';
 else if(b.finished){
  const desc=b.outcome==='won'?'You won the battle! 🏆':b.outcome==='lost'?'Your classmate takes this round.':'It’s a draw!';
  body='<div class="battle-finish"><p class="battle-kicker">FINAL RESULT</p><h2>'+desc+'</h2><p>Your score: <strong>'+b.score+'</strong> · Classmate: <strong>'+b.opponentScore+'</strong></p><p>Ready for a rematch? Head back to the lobby.</p></div>';
 } else if(starts>0)body='<div class="battle-countdown" role="status"><span>Get ready!</span><strong>'+starts+'</strong><p>Both players receive the same ten questions.</p></div>';
 else if(!remaining)body='<h2>Time is up!</h2><p>Collecting the final scores…</p>';
 else if(b.question)body='<div class="battle-question"><div class="battle-question-meta"><span>Question '+(b.answered+1)+' / '+b.total+'</span><strong data-time-left>'+remaining+'s left</strong></div><h2>'+e(b.question.prompt)+'</h2><div class="battle-options">'+b.question.options.map((option,i)=>button('<span class="battle-option-letter">'+String.fromCharCode(65+i)+'</span>'+e(option),'answer','data-choice="'+i+'"')).join('')+'</div><p>Choose the best answer. +100 points per correct response.</p></div>';
 else body='<h2>All ten answered!</h2><p>Waiting for your classmate or the countdown to finish…</p>';
 return title('BATTLE IN PROGRESS','Word Blitz Duel','Unit '+b.unitNumber+' · '+e(b.className))+matchup+
 panel(body,'battle-play')+'<div class="battle-match-footer">'+button('← Back to challenges','back')+'<small>Correct answers are scored securely by the server. No learning XP is added or removed.</small></div>';
}
async function refresh(){
 if(state.busy)return;
 try{
  if(state.battleId){
   state.battle=await api({action:'status',battleId:state.battleId});
   draw();
  }else if(state.classId){
   const [lobby,board]=await Promise.all([api({action:'lobby',classId:state.classId}),api({action:'leaderboard',classId:state.classId})]);
   state.lobby=lobby;state.board=board.ranking??[];
   for(const p of lobby.students??[])names.set(p.id,p.display_name);
   draw();
  }
 }catch(err){state.error=err.message;draw();}
}
async function act(action,target){
 if(state.busy)return;
 if(action==='back'){state.battleId=null;state.battle=null;await refresh();return;}
 if(action==='enter'){state.battleId=target.dataset.id;state.battle=null;await refresh();return;}
 state.busy=true;state.error='';state.flash='';
 try{
  if(action==='challenge'){
   if(!state.opponent)throw new Error('Choose a classmate.');
   await api({action:'challenge',classId:state.classId,opponentId:state.opponent,unitNumber:state.unit});
   state.flash='Challenge sent! Your classmate can accept it from this screen.';
  }else if(['accept','decline','cancel'].includes(action)){
   await api({action,battleId:target.dataset.id});
   if(action==='accept'){state.battleId=target.dataset.id;state.battle=null;}
  }else if(action==='answer'){
   if(!state.battleId||!state.battle?.question)return;
   const answer=await api({action:'answer',battleId:state.battleId,index:state.battle.answered,choice:Number(target.dataset.choice)});
   state.flash=answer.correct?'Correct! +100 points':'Not quite — next question!';
  }
 }catch(err){state.error=err.message;}
 finally{state.busy=false;}
 await refresh();
}
async function start(){
 try{
  state.client=await getSupabaseClient();
  const {data:{user},error}=await state.client.auth.getUser();
  if(error||!user)throw new Error('Sign in to the Hub to enter the Battle Arena.');
  const {data:profile,error:pe}=await state.client.from('profiles').select('id,display_name,role,active').eq('id',user.id).single();
  if(pe||!profile?.active||profile.role!=='student')throw new Error('Battles are for active student accounts. Staff preview is coming later.');
  state.profile=profile;
  const response=await api({action:'classes'});
  state.classes=response.classes??[];
  if(!state.classes.length)throw new Error('You need a class assignment to battle classmates.');
  state.classId=state.classes[0].id;
  draw();await refresh();
  state.timer=setInterval(()=>{if(!state.busy)void refresh();},3000);
 }catch(err){state.error=err.message;root.innerHTML='<main class="battle-shell">'+header()+title('BATTLE ARENA','Unable to start',state.error)+'</main>';}
}
root?.addEventListener('change',event=>{
 const t=event.target;
 if(t.matches?.('[data-battle-class]')){state.classId=t.value;state.opponent='';state.lobby=null;state.board=[];draw();void refresh();}
 if(t.matches?.('[data-battle-unit]'))state.unit=Number(t.value);
 if(t.matches?.('[data-battle-opponent]')){state.opponent=t.value;const btn=root.querySelector('[data-battle-act="challenge"]');if(btn)btn.disabled=!state.opponent;}
});
root?.addEventListener('click',event=>{const t=event.target.closest?.('[data-battle-act]');if(t){void act(t.dataset.battleAct,t);}});
window.addEventListener('pagehide',()=>{if(state.timer)clearInterval(state.timer);});
void start();
