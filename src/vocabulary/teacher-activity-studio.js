import { escapeHtml } from '../views/html.js';

// Original, locally generated activity drafts. No student names or invented diagnoses enter the task.
const KNOWN = {
  fooled:['The advertisement fooled several customers.','tricked'],
  guaranteed:['The company guaranteed a refund.','promised'],
  harmless:['The insect is harmless to people.','not dangerous'],
  inexpensive:['The museum offers inexpensive tickets.','low-cost'],
  afford:['We cannot afford the expensive tickets.','have enough money to pay for'],
  demand:['There is high demand for the new product.','strong interest in buying'],
  avoid:['Students should avoid sharing passwords.','stay away from'],
  arrange:['We need to arrange the chairs before the meeting.','organise'],
  pressure:['She felt pressure before the examination.','stress'],
  participant:['Each participant received a certificate.','person taking part'],
  majority:['The majority of visitors arrived early.','most'],
  outlet:['The shop opened a new outlet in town.','branch'],
  sprinkled:['The chef sprinkled herbs over the dish.','scattered'],
  considerably:['The price dropped considerably.','by a large amount'],
  depression:['The report discussed depression and its effects on wellbeing.','a mental health condition']
};
export const ACTIVITY_TYPES = [
  {id:'forms',icon:'▣',title:'MS Forms quiz',subtitle:'Multiple choice + marking key',tone:'blue'},
  {id:'reading',icon:'◫',title:'Reading challenge',subtitle:'Text + comprehension',tone:'purple'},
  {id:'gap',icon:'✎',title:'Gap-fill practice',subtitle:'Words in context',tone:'orange'},
  {id:'paraphrase',icon:'⇄',title:'Paraphrasing lab',subtitle:'Meaning preservation',tone:'teal'},
  {id:'errors',icon:'◎',title:'Error detective',subtitle:'Spot and fix errors',tone:'pink'},
  {id:'writing',icon:'✦',title:'Writing challenge',subtitle:'Guided production',tone:'green'}
];
const normalise = s => String(s ?? '').trim().toLowerCase();
const line = (word) => KNOWN[normalise(word)] ?? null;
const rotate = (items,n) => items.length ? items.map((_,i)=>items[(i+n)%items.length]) : [];
function numbered(items){ return items.map((item,i)=>`${i+1}. ${item}`).join('\n\n'); }
export function buildActivity(plan, {type='forms',minutes=10,level='standard',variant=0}={}) {
  const all = [...new Set((plan?.wordBank ?? []).map(normalise).filter(Boolean))];
  const known = rotate(all.filter(w=>line(w)),variant);
  const words = rotate(all,variant);
  const limit = minutes===5?3:minutes===15?6:4;
  const selected = known.slice(0,limit);
  const focus = plan?.focus || 'Vocabulary in context';
  const support = level==='supported' ? 'Support: Use the word bank and underline context clues.\n\n' : level==='challenge' ? 'Challenge: Explain why your answer is correct and why one alternative would change the meaning.\n\n' : '';
  const header = `Vocabulary activity · ${minutes} minutes\nFocus: ${focus}\nTarget words: ${words.join(', ') || 'Choose words from your current unit'}\n\n`;
  const contexts = selected.map(w=>({w,example:line(w)[0],meaning:line(w)[1]}));
  let body='', answers='', note='';
  if(type==='forms') {
    if(contexts.length) {
      body=numbered(contexts.map(({w,example,meaning},i)=>`In this sentence, what does "${w}" mean?\n"${example}"\nA. ${meaning}\nB. the opposite meaning\nC. an unrelated action\nD. not enough information`));
      answers=numbered(contexts.map(({w,meaning})=>`${w}: A — ${meaning}`));
      note='Draft for Microsoft Forms. Review and replace the generic distractor options before assigning; these are not yet publication-ready multiple-choice questions.';
    } else {body='Create context-based questions using the selected vocabulary. Include one sentence, four plausible meanings and one correct answer per question.';note='No vetted example sentences are available for these words. This is a teacher-editable outline, not an auto-marked quiz.';}
  } else if(type==='reading') {
    const bank=words.slice(0,6);
    body=`Read the paragraph and answer the questions.\n\n${contexts.length>=3 ? `A local community centre wanted more people to visit. Staff tried to make activities inexpensive, because some families could not afford costly tickets. They guaranteed that visitors could request a refund if an event was cancelled. The organisers hoped the changes would encourage more people to attend.` : 'Write or paste a short text containing the target vocabulary in natural context before sharing this task.'}\n\n${numbered(['What was the centre trying to improve?','Why did staff consider ticket prices?','What would happen if an event was cancelled?','Find a word or phrase in the text that means “low-cost”.','Summarise the main idea in your own words.'])}`;
    answers='1. Increase attendance.\n2. Some families could not pay for expensive tickets.\n3. Visitors could request a refund.\n4. Inexpensive.\n5. Accept an accurate summary of improving access to activities.';
    if(!contexts.length) {answers='Teacher: supply a passage and prepare an answer key before assigning.';note='Text scaffold requires a teacher-authored passage.';}
    else note='Original sample passage; check whether all vocabulary matches your selected target list before assigning.';
  } else if(type==='gap') {
    body=`Complete the sentences using a word from the bank. Use each word once.\nWord bank: ${selected.join(' · ') || words.join(' · ')}\n\n${numbered(contexts.map(({w,example})=>example.replace(new RegExp(`\\b${w}\\b`,'i'),'________')))`;
    answers=numbered(contexts.map(({w})=>w));
    if(!contexts.length){body='Write context-rich sentences with one missing target word each. Add a word bank above the questions.';answers='Teacher: supply model sentences and keys.';note='No vetted sentences for this selection.';}
  } else if(type==='paraphrase') {
    body=`Rewrite each sentence in different words without changing the meaning.\n\n${numbered(contexts.map(({example})=>example))}\n\nExplain what must remain unchanged in one of your paraphrases.`;
    answers=numbered(contexts.map(({w,meaning})=>`Accept natural alternatives preserving the sentence meaning; "${w}" can mean "${meaning}" in this context.`));
    if(!contexts.length){body='Choose three target words and write accurate sentences. Rewrite each without changing the meaning.';answers='Teacher: check meaning preservation, grammar and context.';note='Teacher needs to supply model sentences.';}
  } else if(type==='errors') {
    body=`Find and correct the vocabulary error in each sentence. Explain your correction.\n\n${numbered(contexts.map(({w,example})=>example.replace(new RegExp(`\\b${w}\\b`,'i'), '________'))}\n\nEach blank represents a missing target word; explain how the context helps you decide.`;
    answers=numbered(contexts.map(({w,meaning})=>`${w} — ${meaning}`));
    note='This is a missing-word correction activity, not a diagnosed misconception. It avoids inventing errors that students have not actually made.';
    if(!contexts.length){body='Write three short sentences with one inaccurate vocabulary choice in each. Ask students to correct and justify it.';answers='Teacher: supply corrections before assigning.';}
  } else {
    body=`Write a short paragraph (80–120 words) about a memorable experience, using at least ${Math.min(3,words.length||3)} target words accurately.\n\nVocabulary: ${words.join(' · ')}\n\nInclude: a clear opening, a reason or example, and a final judgement. Underline the words you used.`;
    answers='Teacher check: accurate meaning in context; sentence clarity; appropriate examples; correct word forms.';
  }
  if(level==='challenge' && type==='writing') body+='\n\nExtension: Include a contrasting viewpoint introduced by however or although.';
  const title=ACTIVITY_TYPES.find(x=>x.id===type)?.title || 'Activity';
  return {title, task:header+support+body,answers,note};
}
export function renderActivityStudio(plan,config={}) {
  const {type='forms',minutes=10,level='standard',variant=0}=config;
  const generated=buildActivity(plan,config);
  const controls=(field,options,selected)=>options.map(([value,label])=>`<button type="button" class="vocab-studio__pill${String(value)===String(selected)?' is-active':''}" data-action="teacher-studio-option" data-field="${field}" data-value="${escapeHtml(value)}" aria-pressed="${String(value)===String(selected)}">${escapeHtml(label)}</button>`).join('');
  const cards=ACTIVITY_TYPES.map(item=>`<button type="button" class="vocab-studio__tile" data-tone="${item.tone}" data-action="teacher-studio-option" data-field="type" data-value="${item.id}" aria-pressed="${item.id===type}"><span class="vocab-studio__tile-icon" aria-hidden="true">${item.icon}</span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.subtitle)}</small><span class="vocab-studio__tile-check" aria-hidden="true">✓</span></button>`).join('');
  return `<section class="vocab-studio" data-activity-studio><header class="vocab-studio__header"><div><span class="vocab-studio__eyebrow">✦ TEACHER ACTIVITY STUDIO</span><h2>Turn vocabulary evidence into <em>practice.</em></h2><p>Pick a format. Preview the task. Copy it into Teams or Forms.</p></div><span class="vocab-studio__sparkle" aria-hidden="true">Aa</span></header><div class="vocab-studio__inner"><div class="vocab-studio__section-heading"><strong>01 · Choose an activity</strong><span>6 formats</span></div><div class="vocab-studio__tiles">${cards}</div><div class="vocab-studio__options"><div><strong>02 · Time</strong><div class="vocab-studio__pills">${controls('minutes',[[5,'5 min'],[10,'10 min'],[15,'15 min']],minutes)}</div></div><div><strong>03 · Level</strong><div class="vocab-studio__pills">${controls('level',[['supported','Supported'],['standard','Standard'],['challenge','Challenge']],level)}</div></div></div><section class="vocab-studio__result" aria-label="Generated teaching resource"><header><div><span class="vocab-studio__eyebrow">YOUR RESOURCE</span><h3>${escapeHtml(generated.title)}</h3></div><button type="button" class="vocab-button vocab-button--quiet" data-action="teacher-studio-regenerate">↻ Another version</button></header><pre class="vocab-studio__task">${escapeHtml(generated.task)}</pre><details class="vocab-studio__answers"><summary>Teacher answer key / guidance</summary><pre>${escapeHtml(generated.answers)}</pre></details>${generated.note?`<p class="vocab-studio__note">${escapeHtml(generated.note)}</p>`:''}<div class="vocab-studio__footer"><button class="vocab-button vocab-button--primary" data-action="teacher-studio-copy" data-copy="task">Copy student task</button><button class="vocab-button vocab-button--secondary" data-action="teacher-studio-copy" data-copy="answers">Copy answer key</button><span data-studio-status role="status" aria-live="polite"></span></div></section></div></section>`;
}
