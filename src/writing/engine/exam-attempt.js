export const practiceMinutes=20;
export const deadlineFor=(now,minutes=practiceMinutes)=>now+minutes*60_000;
export const remainingSeconds=(deadline,now)=>Math.max(0,Math.ceil((deadline-now)/1000));

export function newExamAttempt(){
 return {started:false,deadline:null,overtime:false,notes:'',draft:'',submitted:null,revision:'',reflection:['','',''],checks:new Set()};
}

export function submitExamAttempt(attempt,now){
 if(!attempt.started||attempt.submitted||!attempt.draft.trim())return false;
 attempt.submitted={text:attempt.draft,expired:attempt.deadline!==null&&remainingSeconds(attempt.deadline,now)===0};
 attempt.revision=attempt.submitted.text;
 return true;
}
