export function wordCount(text){return String(text??'').trim().split(/\s+/).filter(Boolean).length;}
export function wordStatus(text,min=120,max=160){const count=wordCount(text);return {count,status:count<min?'below':count>max?'above':'within'};}
const fields=['audience','reason','feature1','feature2','recommendation'];
export function newDraft(){return {mode:'Bronze',stage:'Plan',notes:Object.fromEntries(fields.map(k=>[k,''])),answer:'',original:null};}
export function createDraftStore(storage,accountId,task){
 if(typeof accountId!=='string'||!accountId.trim())throw Error('Account required');
 const key='writing-academy:preview:v1:'+encodeURIComponent(accountId)+':'+encodeURIComponent(task.id)+':'+task.version;
 return {load(){const base=newDraft();try{const d=JSON.parse(storage.getItem(key));if(!d)return base;return {...base,mode:['Bronze','Silver','Gold'].includes(d.mode)?d.mode:base.mode,stage:['Plan','Write','Review'].includes(d.stage)?d.stage:base.stage,notes:Object.fromEntries(fields.map(k=>[k,typeof d.notes?.[k]==='string'?d.notes[k]:''])),answer:typeof d.answer==='string'?d.answer:'',original:typeof d.original==='string'?d.original:null};}catch{return base;}},save(d){try{storage.setItem(key,JSON.stringify(d));return true;}catch{return false;}},clear(){try{storage.removeItem(key);return true;}catch{return false;}}};
}
