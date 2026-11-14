// Private-side scoring helper; called only by the authenticated diagnostic Edge Function.
// The output is a provisional teaching placement, NOT calibrated CEFR certification.
// No keys, cut-score configuration sent to the browser, or raw questions here.
export const VOCABULARY_BANDS=Object.freeze(['A1','A2','B1','B2','C1']);
const PRACTICE=Object.freeze({
 A1:{focus:'Build everyday vocabulary',advice:'Start with Meaning and Context, then practise Spelling & Recall.'},
 A2:{focus:'Grow everyday vocabulary',advice:'Use Meaning and Context, then add Word Families.'},
 B1:{focus:'Strengthen flexible vocabulary',advice:'Focus on Paraphrasing and Word Families alongside Context.'},
 B2:{focus:'Develop precision and range',advice:'Prioritise Precision & Use and challenging Paraphrasing tasks.'},
 C1:{focus:'Extend nuance and accuracy',advice:'Challenge yourself with Precision & Use and advanced Paraphrasing.'}
});
const integer=x=>Number.isInteger(x)&&x>=0;
export function scoreProvisionalDiagnostic(coverage,total) {
 if(!coverage||typeof coverage!=='object'||Array.isArray(coverage) ||
   Object.keys(coverage).length!==VOCABULARY_BANDS.length ||
   Object.keys(coverage).some(k=>!VOCABULARY_BANDS.includes(k)))return null;
 // Require exactly the currently planned 40-item design: 8 questions per band.
 // No ranking from partial, corrupted, old-format, or alternate-length forms.
 const bands={};
 for(const level of VOCABULARY_BANDS){
   const row=coverage[level];
   if(!row||!integer(row.administered)||!integer(row.correct)||!integer(row.unknown)
     ||row.administered!==8||row.correct>8||row.unknown>8||
       row.correct+row.unknown>8)return null;
   bands[level]={administered:8,correct:row.correct,unknown:row.unknown};
 }
 if(total!==40)return null;
 const correct=VOCABULARY_BANDS.reduce((n,k)=>n+bands[k].correct,0);
 const unknown=VOCABULARY_BANDS.reduce((n,k)=>n+bands[k].unknown,0);
 // Conservative, noncompensatory placement:
 // reach a band with >=6/8; all lower bands need >=5/8.
 // This avoids a lucky high-level result overriding fundamental gaps.
 let placement='A1';
 for(let i=0;i<VOCABULARY_BANDS.length;i++){
   const level=VOCABULARY_BANDS[i];
   if(bands[level].correct>=6 &&
     VOCABULARY_BANDS.slice(0,i).every(k=>bands[k].correct>=5))placement=level;
 }
 const weakerBands=VOCABULARY_BANDS.filter(k=>bands[k].correct<=4);
 const foundationGap=VOCABULARY_BANDS.slice(0,VOCABULARY_BANDS.indexOf(placement)+1)
   .some(k=>bands[k].correct<5);
 const needsReview=unknown>=10||foundationGap||weakerBands.length>=3;
 return {
   scoreStatus:'provisional',
   provisionalLevel:placement,
   scoreModel:'band-foundations-v1',
   provisional:true,
   assessedQuestions:40,
   correct,
   unsure:unknown,
   caution:needsReview?'Interpret with extra care: some answers were unsure or showed gaps in foundation knowledge.':'This is an initial learning placement, not a certified CEFR result.',
   practice:PRACTICE[placement],
   nextStep:'Use Vocabulary Builder regularly and complete a later reassessment to check progress.'
 };
}
