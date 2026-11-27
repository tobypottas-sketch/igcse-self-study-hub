import {PATHWAY_ACTIVITY_MAP} from './vocabulary-pathway-contract.js';
import {assertContextQuestionMatchesContextType,assertUnitActivityQuestionMatchesContentType,assertWritingTaskMatchesQuestionType} from '../vocabulary-attempt-action/validation.js';
const itemTypes=new Set(['definition_to_word','word_definition_match','type_word_from_definition','word_family_identify','family_multi_form','spelling_choice','spot_the_error','spelling_rebuild','spell_word']);
export async function resolveVocabularyTimingContext(c,lookup){
 if(c.module!=='vocabulary_paraphrase'||c.mode!=='practice'||!Number.isInteger(c.unit)||c.unit<1||!c.occurrence||!c.questionType)return null;
 if(!Object.values(PATHWAY_ACTIVITY_MAP[c.pathway]??{}).some(types=>types.includes(c.questionType)))return null;
 const target=await lookup.occurrence(c.occurrence);
 if(!target||target.unit_number!==c.unit||target.status!=='live'||target.active!==true)return null;
 const item=await lookup.item(target.vocabulary_id);
 if(!item||item.status!=='live'||!item.senses?.some(s=>s.senseId===target.sense_id))return null;
 if(c.source==='item'){
  if(!itemTypes.has(c.questionType)||c.activity!==`item:${target.vocabulary_id}:${target.sense_id}`)return null;
 }else if(c.source==='context'){
  const row=await lookup.context(c.activity);
  if(!row||row.status!=='live'||row.occurrence_id!==c.occurrence||row.sense_id!==target.sense_id)return null;
  try{assertContextQuestionMatchesContextType(row.context_type,c.questionType);}catch{return null;}
 }else if(c.source==='unit_activity'){
  const row=await lookup.activity(c.activity);
  if(!row||row.status!=='live'||row.unit_number!==c.unit||!row.activity_data?.linkedVocabularyIds?.includes(target.vocabulary_id))return null;
  try{assertUnitActivityQuestionMatchesContentType(row.content_type,c.questionType);if(row.content_type==='writing_set')assertWritingTaskMatchesQuestionType(row.activity_data.taskType,c.questionType);}catch{return null;}
 }else return null;
 return c;
}
