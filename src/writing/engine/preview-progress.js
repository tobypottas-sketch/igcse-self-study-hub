import {restoreWritingState,serializeWritingState} from './persistence-state.js';
import {recognitionResult,recognitionRun} from './recognition.js?v=2';
import {scoreItem,shuffledIndexes} from './activities.js';

export const previewStages = ['discover','explore','practise','apply','master'];
const version = 1;
const pathIds = ['structure','expression','development','cohesion','editing','exam'];

export function createPreviewProgress(storage, accountId, {appKey,id,curriculumVersion}) {
  const curriculumKey = [accountId,appKey,id,curriculumVersion].map(encodeURIComponent).join(':');
  const key = pathway => 'writing-academy-preview:'+curriculumKey+':'+pathway;
  const valid = value => value?.version === version && previewStages.includes(value.stage)
    && Array.isArray(value.completed) && value.completed.length <= previewStages.length
    && value.completed.every(stage => previewStages.includes(stage))
    && restoreWritingState(value.workspace).ok;
  return {
    load(pathway) {
      if (!pathIds.includes(pathway)) return null;
      try {
        const value = JSON.parse(storage.getItem(key(pathway)));
        return valid(value) ? value : null;
      } catch { return null; }
    },
    save(pathway, checkpoint) {
      if (!pathIds.includes(pathway) || !valid(checkpoint)) return false;
      try {
        storage.setItem(key(pathway),JSON.stringify(checkpoint));
        return true;
      } catch { return false; }
    }
  };
}

const itemIndex = (items,id) => items.findIndex(item=>item.id===id);
const indexOrZero = (items,id) => Math.max(0,itemIndex(items,id));
const boundedText = text => typeof text === 'string' ? text.slice(0,30000) : '';
const keys = model => model.paragraphIds.map(id=>model.id+'--'+id);
const runContent = (run,task) => ({
  draft:boundedText(run.draft), original:boundedText(run.original), revision:boundedText(run.revision),
  revisionReason:boundedText(run.keepReason), checks:[...run.checks].map(n=>task.checkIds[n]).filter(Boolean)
});

function restoreRun(run,task,saved) {
  if (!saved) return;
  run.draft = boundedText(saved.draft);
  run.original = boundedText(saved.original);
  run.revision = boundedText(saved.revision);
  run.keepReason = boundedText(saved.revisionReason);
  run.checks = new Set((saved.checks??[]).map(id=>task.checkIds.indexOf(id)).filter(n=>n>=0));
}

export function capturePreview(state, content, {stage,completed}) {
  const {discover, models, activities, gold, apply, master, challenges} = content;
  const observations = Object.fromEntries([...state.discoverNotes].map(([n,note])=>[discover[n].id,boundedText(note)]));
  const planning = {discover:discover[state.discoveryIndex].id, model:models[state.model].id,
    paragraph:models[state.model].paragraphIds[state.paragraph], gold:gold[state.goldIndex].id};
  if (apply.length) planning.apply = apply[state.applyIndex].id;
  if (state.active && challenges.includes(state.active)) planning.challenge = state.active;
  const annotations = {};
  for (const [modelIndex, model] of models.entries()) {
    keys(model).forEach((key,n)=>{
      const runtimeKey = modelIndex+':'+n;
      if (state.exploreDrafts.has(runtimeKey)) observations[key] = boundedText(state.exploreDrafts.get(runtimeKey));
      if (state.identified.has(runtimeKey)) annotations[key] = ['reviewed'];
    });
  }
  for (const n of state.discovered) annotations[discover[n].id] = ['reviewed'];
  const objective = {};
  for (const activity of activities) {
    const run = state.attempts.get(activity.id);
    if (!run) continue;
    const questions = Object.fromEntries(activity.items.map((item,n)=>{
      const current = n===run.index;
      const response = current ? (activity.type==='order' ? run.order : run.selected) : run.answered.get(item.id);
      return [item.id,{
        displayOrder:run.displays[n].map(option=>item.optionIds[option]),
        selection:Array.isArray(response) ? response.map(option=>item.optionIds[option])
          : item.optionIds[response]??null,
        checked:current ? run.checked : run.answered.has(item.id)
      }];
    }));
    objective[activity.id] = {questions};
    if (!run.done) objective[activity.id].currentQuestion = activity.items[run.index].id;
  }
  const reflections=Object.fromEntries([...(state.recognition??[])].map(([id,run])=>[id,JSON.stringify(run)]));
  function keepNote(task,run){
    if(run.editorNote)reflections['editor-note-'+task.id]=boundedText(run.editorNote);
  }
  gold.forEach((task,n)=>keepNote(task,state.gold[n]));
  apply.forEach((task,n)=>keepNote(task,state.applications[n]));
  if(master)keepNote(master,state.transfer);
  // Staff-only checked answers fit the existing workspace envelope without changing its schema.
  const snapshot = serializeWritingState({
    observations,annotations,objective,planning,
    ...(Object.keys(reflections).length ? {reflections} : {}),
    gold:Object.fromEntries(gold.map((task,n)=>[task.id,runContent(state.gold[n],task)])),
    apply:Object.fromEntries(apply.map((task,n)=>[task.id,runContent(state.applications[n],task)])),
    master:master?{[master.id]:runContent(state.transfer,master)}:{}
  });
  return snapshot.ok ? {version,stage,completed,workspace:snapshot.data} : null;
}

export function restorePreview(state, content, checkpoint) {
  if (!checkpoint) return;
  const restored = restoreWritingState(checkpoint.workspace);
  if (!restored.ok) return;
  const {discover,models,activities,gold,apply,master,challenges} = content;
  const {observations={},annotations={},objective={},planning={},reflections={},...runs} = restored.data;
  state.discoveryIndex = indexOrZero(discover,planning.discover);
  state.model = indexOrZero(models,planning.model);
  state.paragraph = Math.max(0,models[state.model].paragraphIds.indexOf(planning.paragraph));
  state.goldIndex = indexOrZero(gold,planning.gold);
  state.applyIndex = indexOrZero(apply,planning.apply);
  if (challenges.includes(planning.challenge)) state.active = planning.challenge;
  discover.forEach(({id},n)=>{
    if (Object.hasOwn(observations,id)) state.discoverNotes.set(n,observations[id]);
    if (annotations[id]?.includes('reviewed')) state.discovered.add(n);
  });
  models.forEach((model,j)=>keys(model).forEach((key,n)=>{
    const runtimeKey = j+':'+n;
    if (Object.hasOwn(observations,key)) state.exploreDrafts.set(runtimeKey,observations[key]);
    if (annotations[key]?.includes('reviewed')) state.identified.add(runtimeKey);
  }));
  for (const item of content.recognition??[]) {
    if (!Object.hasOwn(reflections,item.id)) continue;
    try { state.recognition.set(item.id,recognitionRun(item,JSON.parse(reflections[item.id]))); }
    catch { /* A malformed attempt does not affect other saved work. */ }
  }
  for (const activity of activities) {
    let saved = objective[activity.id];
    if (!saved || Object.keys(saved.questions??{}).length!==activity.items.length) continue;
    // Reopen revised items only. Some changed contracts retain the same
    // option meanings, so a legacy quiz result still needs versioned evidence.
    const stale = activity.items.filter(item=>{
      if(!(item.version>1))return false;
      const answer=saved.questions[item.id];
      if(!answer)return false;
      if(answer.displayOrder.some(id=>!item.optionIds.includes(id)))return true;
      if(!item.checkedPractice || (!answer.checked && answer.selection==null))return false;
      return recognitionResult(item,state.recognition?.get(item.id))==='pending'
        || (item.correction && recognitionResult(item.correction,state.recognition?.get(item.correction.id))==='pending');
    });
    if (stale.length) {
      const questions = {...saved.questions};
      for (const item of stale) questions[item.id] = {
        displayOrder:shuffledIndexes(item.optionIds.length).map(index=>item.optionIds[index]),
        selection:null,checked:false
      };
      const currentQuestion = saved.currentQuestion ?? stale[0].id;
      saved = {currentQuestion,questions};
    }
    const displays = activity.items.map(item=>saved.questions[item.id]?.displayOrder.map(id=>item.optionIds.indexOf(id)));
    if (displays.some((display,n)=>!display || display.includes(-1) || display.length!==activity.items[n].optionIds.length)) continue;
    const done = saved.currentQuestion===undefined;
    const index = done ? activity.items.length : itemIndex(activity.items,saved.currentQuestion);
    if (index<0) continue;
    const item = activity.items[index];
    const answer = item ? saved.questions[item.id] : null;
    const responses = activity.items.map(question=>{
      const selection = saved.questions[question.id].selection;
      if (Array.isArray(selection)) return selection.map(id=>question.optionIds.indexOf(id));
      return typeof selection==='string' ? question.optionIds.indexOf(selection) : null;
    });
    const validResponse = (question,n) => {
      const response = responses[n];
      const checked = saved.questions[question.id].checked;
      return activity.type==='order'
        ? (Array.isArray(response) && (!checked || response.length===question.optionIds.length)) || (!checked && response===null)
        : Number.isInteger(response) || (!checked && response===null);
    };
    if (!activity.items.every(validResponse)) continue;
    const answered = new Map();
    let correct = 0;
    activity.items.forEach((question,n)=>{
      if (!saved.questions[question.id].checked) return;
      if (scoreItem(question,responses[n])) correct++;
      if (n!==index) answered.set(question.id,responses[n]);
    });
    if (done !== (answered.size===activity.items.length)) continue;
    const selected = typeof answer?.selection==='string' ? responses[index] : null;
    const order = Array.isArray(answer?.selection) ? responses[index] : [];
    state.attempts.set(activity.id,{index,done,displays,correct,selected,order,checked:!!answer?.checked,answered});
  }
  function restoreWorkshop(run,task,saved){
    restoreRun(run,task,saved);
    const note=reflections['editor-note-'+task.id];
    if(typeof note==='string')run.editorNote=note;
  }
  gold.forEach((task,n)=>restoreWorkshop(state.gold[n],task,runs.gold?.[task.id]));
  apply.forEach((task,n)=>restoreWorkshop(state.applications[n],task,runs.apply?.[task.id]));
  if (master) restoreWorkshop(state.transfer,master,runs.master?.[master.id]);
}
