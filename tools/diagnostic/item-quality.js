// Offline authoring gate only — NEVER import keyed diagnostic items into
// GitHub Pages student assets. These checks are necessary, not sufficient:
// educators must independently review semantic alternatives and CEFR hypotheses.
export const LEVELS=Object.freeze(['A1','A2','B1','B2','C1']);
export const CONSTRUCTS=Object.freeze(['meaning_in_context','precise_meaning','collocation_sense']);
export const DOMAINS=Object.freeze(['daily_life','school','work','travel','society','academic']);
export const OPTION_IDS=Object.freeze(['A','B','C','D']);
export const REVIEW_STATUSES=Object.freeze(['draft','language_reviewed','assessment_reviewed','pilot','approved','retired']);

const words=text=>String(text??'').trim().split(/\s+/u).filter(Boolean);
const normalize=text=>String(text??'').normalize('NFKC').toLocaleLowerCase('en').replace(/[.!?;,:"“”‘’]/gu,'').replace(/\s+/gu,' ').trim();
const tokens=text=>(String(text??'').toLocaleLowerCase('en').match(/[a-z]+(?:'[a-z]+)*/gu)??[]);
const hasText=(value,min=1)=>typeof value==='string'&&value.trim().length>=min;
const validDate=value=>typeof value==='string'&&!Number.isNaN(Date.parse(value))&&/\d{4}-\d{2}-\d{2}T/.test(value);

export function validateDiagnosticItem(item,{forPilot=false}={}){
  const errors=[];const warnings=[];
  const fail=(code,message)=>errors.push({code,message});
  const warn=(code,message)=>warnings.push({code,message});
  if(!item||typeof item!=='object'||Array.isArray(item))return {ok:false,errors:[{code:'ITEM_TYPE',message:'Expected an item object'}],warnings};
  if(!/^diag-[a-z0-9-]{6,80}$/.test(item.itemId??''))fail('ITEM_ID','Stable itemId required: diag-... (6–80 characters after prefix)');
  if(!Number.isInteger(item.version)||item.version<1)fail('VERSION','Item version must be a positive integer');
  if(!hasText(item.formFamily,4))fail('FORM_FAMILY','Common-content family required to prevent repeated variants');
  if(!LEVELS.includes(item.levelHypothesis))fail('LEVEL','A1–C1 authoring hypothesis required');
  if(item.levelReference?.framework!=='CEFR')fail('LEVEL_FRAMEWORK','Explicit CEFR reference framework required');
  if(!['EVP_sense','Oxford_3000_5000','independent_educator','other_permitted'].includes(item.levelReference?.basis))
    fail('LEVEL_BASIS','Record how the level hypothesis was informed');
  if(!hasText(item.levelReference?.referenceNotes,15))fail('LEVEL_REFERENCE','Record the source/descriptor and sense-specific justification');
  if(!['unverified','verified'].includes(item.levelReference?.status))fail('LEVEL_VERIFICATION','Explicit verification state required');
  if(forPilot&&item.levelReference?.status!=='verified')fail('LEVEL_UNVERIFIED','Pilot items require level-reference verification');
  if(forPilot&&(!hasText(item.levelReference?.checkedBy)||!validDate(item.levelReference?.checkedAt)))
    fail('LEVEL_REVIEW_EVIDENCE','Record who verified the CEFR reference, and when');
  if(!CONSTRUCTS.includes(item.construct))fail('CONSTRUCT','Unknown assessment construct');
  if(!DOMAINS.includes(item.domain))fail('DOMAIN','Unknown lexical domain');
  if(!hasText(item.lemma,2))fail('LEMMA','Target lemma required');
  if(!hasText(item.sense,5))fail('SENSE','Specific tested sense required');
  if(!hasText(item.partOfSpeech,2))fail('POS','Part of speech required');
  if(!hasText(item.stem,25))fail('STEM','Self-contained diagnostic stem required');
  if(hasText(item.stem)&&words(item.stem).length>60)warn('READING_LOAD','Stem exceeds 60 words; check reading burden');
  if(!Array.isArray(item.options)||item.options.length!==4){
    fail('OPTION_COUNT','Exactly four options required');
  }else{
    const ids=item.options.map(o=>o?.id);
    if(ids.some((v,i)=>v!==OPTION_IDS[i]))fail('OPTION_IDS','Option IDs must appear A, B, C, D once each');
    const opts=item.options.map(o=>o?.text);
    if(opts.some(s=>!hasText(s,2)))fail('OPTION_TEXT','Every option must contain readable text');
    if(item.options.some(o=>!hasText(o?.rationale,10)))fail('RATIONALES','Each option needs a substantive reviewer rationale');
    if(new Set(opts.map(normalize)).size!==4)fail('DUPLICATE_OPTIONS','Answers differ only cosmetically or repeat');
    if(!OPTION_IDS.includes(item.correctOptionId))fail('ANSWER_ID','Exactly one correct option ID is required');
    else {
      const answer=item.options.find(o=>o?.id===item.correctOptionId)?.text;
      const wrong=opts.filter((_,i)=>ids[i]!==item.correctOptionId);
      if(answer&&wrong.some(w=>normalize(w)===normalize(answer)))fail('DUPLICATE_KEY','A distractor is identical to the correct answer');
      const len=opts.map(s=>words(s).length);
      if(len.every(Number.isFinite)&&len.every(n=>n>0)){
        const correctWords=words(answer).length;
        if(correctWords>=3&&wrong.filter(w=>words(w).length>=2).length<2)fail('LONG_KEY_LEAK','The answer is a long phrase among single words');
        if(Math.max(...len)-Math.min(...len)>4&&Math.max(...len)>=Math.min(...len)*2.5)warn('OPTION_LENGTH','Unbalanced option lengths may reveal an answer');
      }
      const answerTerms=new Set(tokens(answer).filter(w=>w.length>4));
      const stemTerms=new Set(tokens(item.stem).filter(w=>w.length>4));
      const overlap=[...answerTerms].filter(w=>stemTerms.has(w));
      if(overlap.length&&wrong.every(w=>tokens(w).filter(t=>t.length>4&&stemTerms.has(t)).length===0))
        warn('STEM_KEY_OVERLAP','Unique significant-word overlap between stem and correct option; inspect for giveaway');
    }
  }
  const origin=item.source?.origin, rights=item.source?.rightsStatus;
  if(!['original','licensed'].includes(origin))fail('PROVENANCE','Source origin must be original or licensed');
  if(!hasText(item.source?.referenceNotes,12))fail('SOURCE_NOTE','Document where the target/sense hypothesis and original wording came from');
  if(!['author_owned','license_verified','unverified'].includes(rights))fail('RIGHTS','Rights status required');
  if(origin==='licensed'&&!hasText(item.source?.licenseId))fail('LICENSE','Licensed content requires a recorded licence identifier');
  if(forPilot&&rights==='unverified')fail('RIGHTS_UNVERIFIED','Pilot items require verified rights');
  if(!REVIEW_STATUSES.includes(item.review?.status))fail('REVIEW_STATUS','Unknown review stage');
  if(!hasText(item.review?.authorId))fail('AUTHOR','An attributable author is required');
  if(forPilot){
    if(!['pilot','approved'].includes(item.review?.status))fail('NOT_PILOT_APPROVED','Item not approved for pilot');
    if(!hasText(item.review?.languageReviewerId)||!hasText(item.review?.assessmentReviewerId))
      fail('SECOND_REVIEW','Two reviewer identities required');
    const people=[item.review?.authorId,item.review?.languageReviewerId,item.review?.assessmentReviewerId];
    if(people.some((p,i)=>people.indexOf(p)!==i))fail('INDEPENDENT_REVIEW','Author, language reviewer and assessment reviewer must be distinct');
    if(!validDate(item.review?.languageReviewedAt)||!validDate(item.review?.assessmentReviewedAt))fail('REVIEW_DATES','Review timestamps required');
    if(warnings.length)fail('UNRESOLVED_FLAGS','Review each potential clue before pilot (no automatic waiver)');
  }
  return {ok:errors.length===0,errors,warnings};
}

export function auditDiagnosticBank(items,{forPilot=false}={}){
  const failures=[];const warnings=[];const seen=new Set();const families=new Map();
  const byBand=Object.fromEntries(LEVELS.map(level=>[level,0]));
  const byConstruct=Object.fromEntries(CONSTRUCTS.map(type=>[type,0]));
  const byDomain=Object.fromEntries(DOMAINS.map(domain=>[domain,0]));
  for(const [index,item] of (Array.isArray(items)?items:[]).entries()){
    const result=validateDiagnosticItem(item,{forPilot});
    for(const issue of result.errors)failures.push({index,itemId:item?.itemId??null,...issue});
    for(const issue of result.warnings)warnings.push({index,itemId:item?.itemId??null,...issue});
    const key=`${item?.itemId??''}@${item?.version??''}`;
    if(seen.has(key))failures.push({index,itemId:item?.itemId??null,code:'DUPLICATE_VERSION',message:'Duplicate item ID and version'});
    seen.add(key);
    const family=item?.formFamily;
    if(hasText(family)){
      const list=families.get(family)??[];
      list.push(item?.itemId);
      families.set(family,list);
    }
    if(Object.hasOwn(byBand,item?.levelHypothesis))byBand[item.levelHypothesis]++;
    if(Object.hasOwn(byConstruct,item?.construct))byConstruct[item.construct]++;
    if(Object.hasOwn(byDomain,item?.domain))byDomain[item.domain]++;
  }
  return {ok:failures.length===0,total:Array.isArray(items)?items.length:0,failures,warnings,byBand,byConstruct,byDomain,
    sharedFamilies:[...families.entries()].filter(([,ids])=>ids.length>1).map(([family,ids])=>({family,items:ids}))};
}
