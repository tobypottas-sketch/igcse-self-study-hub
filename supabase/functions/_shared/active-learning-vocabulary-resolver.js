import {PATHWAY_ACTIVITY_MAP} from './vocabulary-pathway-contract.js';
import {assertContextQuestionMatchesContextType,assertUnitActivityQuestionMatchesContentType,assertWritingTaskMatchesQuestionType,isItemQuestionType} from '../vocabulary-attempt-action/validation.js';
export async function resolveVocabularyTimingContext(c,lookup){
 if(c.module!=='vocabulary_paraphrase'||c.mode!=='practice'||!Number.isInteger(c.unit)||c.unit<1||!c.occurrence||!c.questionType)return null;
 if(!Object.hasOwn(PATHWAY_ACTIVITY_MAP,c.pathway)||!Object.values(PATHWAY_ACTIVITY_MAP[c.pathway]).some(types=>types.includes(c.questionType)))return null;
 // Published Set membership is the runtime release authority. Initially only
 // published members are accepted; remainder/free practice needs full eligibility.
 if(!await lookup.publishedMember(c.unit,c.pathway,c.occurrence))return null;
 const target=await lookup.occurrence(c.occurrence);
 if(!target||target.unit_number!==c.unit||target.status!=='live'||target.active!==true)return null;
 const item=await lookup.item(target.vocabulary_id);
 if(!item||item.status!=='live'||!item.senses?.some(s=>s.senseId===target.sense_id))return null;
 if(c.source==='item'){
  const activity=`item:${target.vocabulary_id}:${target.sense_id}`;
  const familyVariant=c.questionType==='family_multi_form'&&c.activity.startsWith(activity+':family:')&&/^[1-9][0-9]{0,2}$/.test(c.activity.slice(activity.length+8));
  if(!isItemQuestionType(c.questionType)||(c.activity!==activity&&!familyVariant))return null;
  return {...c,activity};
 }else if(c.source==='context'){
  const row=await lookup.context(c.activity);
  if(!row||row.status!=='live'||row.occurrence_id!==c.occurrence||row.sense_id!==target.sense_id)return null;
  try{assertContextQuestionMatchesContextType(row.context_type,c.questionType);}catch{return null;}
 }else if(c.source==='unit_activity'){
  const row=await lookup.activity(c.activity);
  if(!row||row.status!=='live'||row.unit_number!==c.unit||!Array.isArray(row.activity_data?.linkedVocabularyIds)||
     !row.activity_data.linkedVocabularyIds.includes(target.vocabulary_id)||
     (row.activity_data.primaryEvidenceTargetId&&row.activity_data.primaryEvidenceTargetId!==target.vocabulary_id))return null;
  try{assertUnitActivityQuestionMatchesContentType(row.content_type,c.questionType);if(row.content_type==='writing_set')assertWritingTaskMatchesQuestionType(row.activity_data.taskType,c.questionType);}catch{return null;}
 }else return null;
 return c;
}
