// Student diagnostic player: only safe questions from authenticated backend.
// No item bank, score keys, correctness feedback or CEFR estimates in browser.
import { escapeHtml } from '../views/html.js';

const esc=v=>escapeHtml(String(v??''));
const VALID=new Set(['A','B','C','D','unknown']);
const SAFE_ERROR={
  ASSIGNMENT_UNAVAILABLE:'Your diagnostic is not currently available. Please ask your teacher.',
  SESSION_CLOSED:'This session is closed. Reload to see your updated status.',
  OUT_OF_SEQUENCE:'Your response was not saved in the expected order. Reload to resume safely.',
  OPEN_SESSION_EXISTS:'You already have an unfinished diagnostic. Return to it before starting another.',
  FOLLOWUP_NOT_DUE:'Your next assessment is not due yet.',
  FORM_UNAVAILABLE:'Your teacher has not released an assessment form yet.',
  FORM_INVALID:'This assessment needs checking before it can be used.',
  INVALID_REQUEST:'The response could not be processed. Try again.',
  AUTH_REQUIRED:'Your session has expired. Sign in again.',
  SERVICE_ERROR:'We could not save the response. Try again without changing your answer.'
};

export function diagnosticErrorMessage(code){
  return SAFE_ERROR[code]??'We could not complete that action. Your saved progress has not been reset.';
}
export function validateSafeQuestion(q){
  if(!q||typeof q.sessionId!=='string'||typeof q.questionId!=='string'||
    !Number.isInteger(q.questionVersion)||!Number.isInteger(q.position)||q.position<1||
    typeof q.stem!=='string'||!Array.isArray(q.options)||q.options.length!==4||
    new Set(q.options.map(o=>o?.id)).size!==4||
    q.options.some(o=>!['A','B','C','D'].includes(o?.id)||typeof o?.text!=='string'||
      !o.text.trim())||
    ['correctOptionId','rationale','calibration','levelHypothesis','correct'].some(k=>Object.hasOwn(q,k))||
    q.options.some(o=>Object.hasOwn(o,'rationale')||Object.hasOwn(o,'correct')))
    throw new Error('Invalid question received. Please contact your teacher.');
  return q;
}

export async function initialiseVocabularyDiagnostic({root,client,assignmentId,sessionState=null,onComplete}){
  if(!root||!client)throw new Error('Student diagnostic requires a valid session.');
  const state={question:null,answer:null,busy:false,request:null,error:'',done:false};
  async function invoke(action,payload={}){
    const {data,error}=await client.functions.invoke('vocabulary-diagnostic',{body:{action,payload}});
    if(error){
      let body;
      try{body=await error.context?.json?.()}catch{}
      throw new Error(diagnosticErrorMessage(body?.error));
    }
    if(data?.error)throw new Error(diagnosticErrorMessage(data.error));
    return data;
  }
  function shell(content){
    root.innerHTML='<main class="vocab-shell diag-player"><header class="vocab-topbar">'+
      '<a class="vocab-back" href="./">← Hub</a><span>Vocabulary diagnostic</span></header>'+
      content+'</main>';
  }
  function intro(){
    shell('<section class="diag-hero"><p class="diag-kicker">YOUR STARTING POINT</p>'+
      '<h1>'+(sessionState?'Continue your vocabulary diagnostic':'Vocabulary diagnostic')+'</h1>'+
      '<p>This short assessment helps us understand the vocabulary you recognise. Choose one answer for each question. If you are unsure, you can select <strong>I’m not sure</strong>.</p>'+
      '<p>You won’t see correct answers during the assessment. Your existing Vocabulary Builder progress is safe.</p>'+
      '<div class="diag-actions"><button type="button" class="diag-primary" data-diag="start">'+(sessionState?'Resume assessment':'Begin assessment')+'</button></div>'+
      '</section><p class="diag-message" role="status"></p>');
  }
  function question(){
    const q=validateSafeQuestion(state.question);
    const options=q.options.map(o=>'<label class="diag-option '+(state.answer===o.id?'diag-option--selected':'')+'">'+
      '<input type="radio" name="diagnostic-answer" value="'+esc(o.id)+'" '+(state.answer===o.id?'checked ':'')+(state.busy?'disabled ':'')+'/>'+
      '<span class="diag-option-key">'+esc(o.id)+'</span><span>'+esc(o.text)+'</span></label>').join('');
    shell('<section class="diag-assessment"><div class="diag-meta"><span>Question '+esc(q.position)+'</span><span>No marks shown during the assessment</span></div>'+
      '<h1 class="diag-prompt">'+esc(q.stem)+'</h1><fieldset class="diag-choices"><legend>Choose one answer</legend>'+options+
      '<label class="diag-option diag-unsure '+(state.answer==='unknown'?'diag-option--selected':'')+'">'+
      '<input type="radio" name="diagnostic-answer" value="unknown" '+(state.answer==='unknown'?'checked ':'')+(state.busy?'disabled ':'')+'/>'+
      '<span>I’m not sure</span></label></fieldset>'+
      '<div class="diag-actions"><button type="button" class="diag-secondary" data-diag="pause" '+(state.busy?'disabled':'')+'>Save & exit</button>'+
      '<button type="button" class="diag-primary" data-diag="submit" '+(!state.answer||state.busy?'disabled':'')+'>'+
      (state.busy?'Saving…':'Next question')+'</button></div>'+
      '<p class="diag-message" role="status">'+esc(state.error)+'</p></section>');
  }
  function finished(result){
    state.done=true;
    const totals=Number(result?.total)||0;
    shell('<section class="diag-hero"><p class="diag-kicker">ASSESSMENT COMPLETE</p>'+
      '<h1>Your first diagnostic is saved</h1><p>You answered '+esc(totals)+' questions. Your teacher can use your results to understand your vocabulary starting point.</p>'+
      '<p>We are not awarding a CEFR level while this assessment is being validated.</p>'+
      '<div class="diag-actions"><button class="diag-primary" type="button" data-diag="finish">Continue to Vocabulary Builder</button></div></section>');
  }
  async function start(){
    if(state.busy)return;
    state.busy=true;setMessage('Opening your assessment…');
    try{
      const data=await invoke('start',{assignmentId});
      state.question=validateSafeQuestion(data?.question);
      state.answer=null;state.request=null;state.error='';
      question();
    }catch(err){state.busy=false;setMessage(err.message);return}
    state.busy=false;question();
  }
  async function submit(){
    if(state.busy||!state.question||!VALID.has(state.answer))return;
    state.busy=true;state.error='';question();
    try{
      // Keep the same idempotency token and original answer until accepted,
      // including after a network failure or button retry.
      if(!state.request)state.request={
        sessionId:state.question.sessionId,
        questionId:state.question.questionId,
        questionVersion:state.question.questionVersion,
        position:state.question.position,
        answerId:state.answer,
        requestId:crypto.randomUUID()
      };
      const data=await invoke('respond',state.request);
      if(data.state==='completed'){
        // A network retry after successful completion returns a duplicate
        // acknowledgement without result details. Recover from own history.
        let result=data.result;
        if(!result){
          const history=await invoke('history',{});
          result=(history?.results??[]).find(row=>row.sessionId===state.question.sessionId);
          if(!result)throw new Error('Your result is saved, but we could not retrieve its summary. Please reload.');
        }
        state.request=null;finished(result);return;
      }
      state.question=validateSafeQuestion(data.question);
      state.answer=null;state.request=null;state.error='';
    }catch(err){state.error=err.message}
    finally{state.busy=false; if(!state.done)question()}
  }
  async function pause(){
    if(state.busy||!state.question)return;
    state.busy=true;setMessage('Saving your place…');
    try{
      await invoke('pause',{sessionId:state.question.sessionId});
      shell('<section class="diag-hero"><h1>Assessment paused</h1><p>Your answers so far are saved. You can return to finish later.</p>'+
        '<a class="diag-primary diag-link" href="./">Back to Hub</a></section>');
    }catch(err){state.busy=false;state.error=err.message;question();return}
    state.busy=false;
  }
  function setMessage(value){
    const status=root.querySelector('.diag-message');
    if(status)status.textContent=value;
  }
  root.addEventListener('change',event=>{
    if(event.target?.name!=='diagnostic-answer'||state.busy||state.done)return;
    if(state.request)return; // pending immutable retry after a network failure
    const value=event.target.value;
    if(!VALID.has(value))return;
    state.answer=value;question();
  });
  root.addEventListener('click',event=>{
    const action=event.target?.closest?.('[data-diag]')?.dataset?.diag;
    if(action==='start')void start();
    else if(action==='submit')void submit();
    else if(action==='pause')void pause();
    else if(action==='finish'&&state.done)void onComplete?.();
  });
  intro();
}
