// A safe visual walkthrough for staff. Synthetic questions only; no live diagnostic data,
// no answer keys and no API calls. The real student player is reused unchanged.
import { initialiseVocabularyDiagnostic } from './diagnostic-student.js?v=provisional-v1';

const SAMPLE = [
  {stem:'The travellers arrived ___ the station just before midday.', options:['on','at','in','to']},
  {stem:'The event was postponed because of bad weather. What happened?', options:['It began earlier than planned.','It moved to a later date.','It was held at another venue.','It finished ahead of schedule.']},
  {stem:'Which response best expresses uncertainty?',options:['I am completely certain.','There can be no doubt.','I cannot yet make a definite judgement.','I have already reached my final decision.']},
  {stem:'The committee sought to reconcile conflicting accounts. What did they aim to do?',options:['Ignore both accounts entirely.','Identify a workable agreement between them.','Publish only the earliest account.','Delay the discussion indefinitely.']}
];
function makeQuestion(position){
  const sample=SAMPLE[position-1];
  if(!sample)return null;
  return {sessionId:'synthetic-session',questionId:'synthetic-'+position,questionVersion:1,
    position,stem:sample.stem,options:sample.options.map((text,i)=>({id:'ABCD'[i],text})),allowUnknown:true};
}
export async function startDiagnosticTeacherPreview(root){
  let position=1;
  const client={functions:{invoke:async (_name,{body})=>{
    if(body.action==='start'){position=1;return {data:{state:'in_progress',question:makeQuestion(position)},error:null};}
    if(body.action==='respond'){
      if(body.payload.position!==position)return {data:{error:'OUT_OF_SEQUENCE'},error:null};
      position++;
      if(position>SAMPLE.length)return {data:{state:'completed',result:{total:SAMPLE.length}},error:null};
      return {data:{state:'in_progress',question:makeQuestion(position)},error:null};
    }
    if(body.action==='pause')return {data:{state:'interrupted'},error:null};
    return {data:{error:'INVALID_REQUEST'},error:null};
  }}};
  return initialiseVocabularyDiagnostic({root,client,assignmentId:'synthetic-assignment',
    previewMode:true,onComplete:()=>window.location.replace('./vocabulary.html')});
}
