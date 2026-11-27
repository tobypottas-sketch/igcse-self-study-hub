import {hasWritingAttempt, validateWritingTask, writingComplete, writingEvidence} from '../engine/activities.js?v=5';
import {el, action} from './lesson-shell.js?v=12';

export function newWritingRun() {
 return {draft:'', original:'', revision:'', keepReason:'', checks:new Set()};
}

export function renderResponseWorkshop(host, task, run, onProgress, {plainLanguage=false,staffAssessment=false}={}) {
 validateWritingTask(task);
 host.replaceChildren();
 const source = el(host,'article','wa-apply-source');
 const title = el(source,'h3','wa-apply-title',task.title);
 title.tabIndex = -1;
 el(source,'p','wa-apply-original',task.prompt);
 const editor = el(host,'section','wa-apply-editor');
 const noteExample=staffAssessment?task.modelNote:null;
 if(staffAssessment)el(source,'p','wa-muted','Source or draft supplied for this task');
 let refreshComparison=()=>{};
 if(noteExample){
  const noteLabel=el(editor,'label','wa-apply-instruction','Editor’s note · separate from the review word target');
  const note=el(noteLabel,'textarea','wa-writing-input wa-apply-input');
  note.rows=2;
  note.value=run.editorNote??'';
  note.oninput=()=>{run.editorNote=note.value;refreshComparison();};
 }
 const evidence=staffAssessment?el(editor,'p','wa-muted wa-writing-evidence'):null;
 if(evidence)evidence.setAttribute('role','status');
 function updateEvidence(){
  if(!evidence)return;
  const state=writingEvidence(run,task);
  evidence.textContent={
   'not-attempted':'Not attempted',
   draft:'Draft attempted',
   compared:'Compared with an example',
   'revised-or-retained':'Revised or kept with a reason',
   'self-reviewed':'Self-reviewed'
  }[state];
  evidence.dataset.evidence=state;
 }
 updateEvidence();
 const steps = task.question.split('\n');
 if (steps.length>1) {
  el(editor,'p','wa-apply-instruction',steps[0]);
  const list = el(editor,'ol','wa-writing-steps');
  steps.slice(1).forEach(step=>el(list,'li','',step.replace(/^\d+\. /,'')));
 }
 const label = el(editor,'label','wa-apply-instruction',steps.length>1?'Your draft':task.question);
 el(label,'span','wa-muted',task.plan?' Short notes or bullets are welcome.':' Write at least ' + task.min + ' words before comparing.');
 const draft = el(label,'textarea','wa-writing-input wa-apply-input');
 draft.dataset.reviewDraft='';
 draft.rows = 4;
 draft.value = run.original || run.draft;
 draft.readOnly = !!run.original;
 draft.oninput = () => { run.draft = draft.value; updateEvidence(); };
 const tools = el(editor,'div','wa-apply-tools');
 const status = el(editor,'p','wa-answer wa-apply-status');
 status.setAttribute('role','status');
 function compare() {
  draft.readOnly = true;
  reveal.hidden = true;
  const panel = el(host,'section','wa-apply-comparison');
  const model = el(panel,'article','wa-apply-model');
  const heading = el(model,'h4','wa-apply-eyebrow',task.plan?'One possible plan':'One possible response');
  heading.tabIndex = -1;
  if(noteExample)el(model,'p','wa-muted',noteExample);
  el(model,'p','wa-apply-model-text',task.example);
  el(panel,'p','wa-muted','Compare the approaches. Use the checklist to review your revision. This is self-assessment.');
  const revisionLabel = el(panel,'label','wa-apply-instruction','Revise your response');
  const revision = el(revisionLabel,'textarea','wa-writing-input wa-apply-input');
  revision.rows = 4;
  revision.value = run.revision;
  let reason;
  if(task.allowKeep){
   const label=el(panel,'label','wa-apply-instruction',plainLanguage?'Happy with your first answer? Explain one thing you did well. Use at least 8 words.':'Keeping your draft? Explain how one specific choice meets a checklist criterion (at least 8 words).');
   reason=el(label,'textarea','wa-writing-input wa-apply-input');
   reason.rows=2;
   reason.value=run.keepReason;
   reason.oninput=()=>{run.keepReason=reason.value;sync();};
  }
  const checklist = el(panel,'div','wa-apply-checklist');
  const inputs = task.checks.map((criterion,index) => {
   const row = el(checklist,'label','wa-check wa-apply-check');
   const input = el(row,'input','');
   input.type = 'checkbox';
   input.checked = run.checks.has(index);
   input.onchange = () => {
    if(input.checked) run.checks.add(index);
    else run.checks.delete(index);
    sync();
   };
   el(row,'span','',criterion);
   return input;
  });
  const result = el(panel,'p','wa-answer');
  result.setAttribute('role','status');
  function sync() {
   const complete = writingComplete(run,task);
   const next = plainLanguage
    ? (task.allowKeep?'Make a change or explain what you did well. Then check your work below.':'Make a change to your draft, then check your work below.')
    : (task.allowKeep?'Revise or justify keeping your draft, then review each criterion.':'Make a change to your draft and review each criterion.');
   result.textContent = complete ? 'Writing and reflection complete.'
    : task.requiredEditorNote && !run.editorNote?.trim() ? 'Add your editor’s note to finish.' : next;
   updateEvidence();
   onProgress(complete);
  }
  revision.oninput = () => {
   run.revision = revision.value;
   if(reason){run.keepReason='';reason.value='';}
   run.checks.clear();
   inputs.forEach(input => { input.checked = false; });
   sync();
  };
  refreshComparison=sync;
  sync();
  return heading;
 }
 const reveal = action(tools,'Compare with an example →',() => {
  if(task.requiredEditorNote && !run.editorNote?.trim()){
   status.textContent='Add your editor’s note before comparing.';
   return;
  }
  if(!hasWritingAttempt(run.draft,task.min)) {
   status.textContent = task.plan?'Add a few notes that show what you intend to cover.':'Write at least ' + task.min + ' words using the information above.';
   return;
  }
  run.original = run.draft;
  run.revision = run.original;
  status.textContent = 'Your first draft remains above during this visit.';
  compare().focus();
 },'wa-action wa-apply-reveal');
 if(run.original) compare();
 return title;
}
