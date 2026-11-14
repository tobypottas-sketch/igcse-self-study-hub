// Advisory only. These deterministic signals do not prove an item is valid or invalid.
const words = text => String(text || '').trim().split(/\s+/).filter(Boolean);
const normalise = text => String(text || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
const stop = new Set(['a','an','the','is','are','was','were','to','of','in','on','at','and','or','it','its','for','with','that','this','they','their','be','by','from','as','which','what','would','could','should']);
const tokens = text => new Set(normalise(text).split(' ').filter(w => w.length > 3 && !stop.has(w)));
export function auditDiagnosticItem(item) {
 const options = Array.isArray(item?.options) ? item.options : [];
 const key = item?.correctOptionId ?? item?.correct_option_id;
 const stem = String(item?.stem ?? '');
 const issues = [];
 const add = (code, severity, message) => issues.push({code,severity,message});
 if(options.length !== 4 || new Set(options.map(o=>o.id)).size !== 4 || !options.some(o=>o.id === key)) {
   add('invalid_structure','blocking','Four unique options and a matching answer key are required.');
   return {issues,requiresHumanReview:true,canApprove:false};
 }
 const lengths = options.map(o=>words(o.text).length);
 const correctIndex = options.findIndex(o=>o.id===key);
 const correctLength = lengths[correctIndex];
 const others = lengths.filter((_,i)=>i!==correctIndex);
 const mean = others.reduce((a,b)=>a+b,0)/others.length;
 if(correctLength > Math.max(...others)) add('correct_longest','advisory','The keyed answer is uniquely the longest option.');
 if(correctLength >= mean*1.5 && correctLength >= mean+2) add('length_outlier','review','The keyed answer is at least 50% longer than the average distractor.');
 const texts = options.map(o=>normalise(o.text));
 if(new Set(texts).size!==4) add('duplicate_option','blocking','Two options have the same normalised text.');
 if(options.some(o=>!String(o.text||'').trim())) add('empty_option','blocking','An option has no text.');
 const correctTokens = tokens(options[correctIndex].text);
 const stemTokens = tokens(stem);
 const overlap = [...correctTokens].filter(t=>stemTokens.has(t)).length;
 const otherOverlap = options.map(o=>[...tokens(o.text)].filter(t=>stemTokens.has(t)).length).filter((_,i)=>i!==correctIndex);
 if(overlap>=2 && overlap>=Math.max(...otherOverlap)+2) add('stem_echo','review','The correct answer repeats substantially more stem vocabulary than distractors.');
 const distractorSets = options.filter((_,i)=>i!==correctIndex).map(o=>tokens(o.text));
 const pairwise = distractorSets.flatMap((a,i)=>distractorSets.slice(i+1).map(b=>{
   const union=new Set([...a,...b]);return union.size?[...a].filter(t=>b.has(t)).length/union.size:0;
 }));
 if(pairwise.length && pairwise.every(x=>x<0.1)) add('distractor_topic_divergence','advisory','Distractors share little vocabulary; check whether they are unrelated to the same situation.');
 if(options.some(o=>/\b(all|always|never|every|none|impossible|guarantees)\b/i.test(o.text)) && !/\b(all|always|never|every|none|impossible|guarantees)\b/i.test(options[correctIndex].text)) add('absolute_distractor','advisory','An incorrect option uses absolute language; check for easy elimination.');
 return {issues,requiresHumanReview:true,canApprove:!issues.some(x=>x.severity==='blocking')};
}
