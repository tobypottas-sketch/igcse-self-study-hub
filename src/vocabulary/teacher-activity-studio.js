import { escapeHtml } from '../views/html.js';

// Teacher-authored, reviewed starter material. Never treat a class trend as a diagnosis.
const BANK = {
  fooled: {sentence:'The advertisement fooled several customers.', meaning:'tricked', wrong:['helped','warned','rewarded'], alternative:'The advertisement tricked several customers.'},
  guaranteed:{sentence:'The shop guaranteed a full refund.',meaning:'promised',wrong:['refused','suggested','questioned'],alternative:'The shop promised to give customers all their money back.'},
  harmless:{sentence:'The small insect is harmless to humans.',meaning:'not dangerous',wrong:['very rare','extremely noisy','difficult to find'],alternative:'The small insect will not hurt people.'},
  inexpensive:{sentence:'The museum offers inexpensive tickets.',meaning:'low-cost',wrong:['limited','popular','refundable'],alternative:'The museum sells tickets that do not cost much.'},
  afford:{sentence:'Some families cannot afford the expensive tickets.',meaning:'have enough money to buy',wrong:['find time to use','receive permission for','decide where to buy'],alternative:'Some families do not have enough money for the costly tickets.'},
  demand:{sentence:'There is high demand for the new product.',meaning:'a strong desire to buy',wrong:['a drop in quality','a legal guarantee','a warning about danger'],alternative:'Many people want to buy the new product.'},
  avoid:{sentence:'Students should avoid sharing passwords.',meaning:'stay away from',wrong:['be responsible for','make a habit of','find a way to enjoy'],alternative:'Students should not share passwords.'},
  arrange:{sentence:'We need to arrange the chairs before the meeting.',meaning:'organise',wrong:['replace','decorate','measure'],alternative:'We need to organise the chairs before everyone arrives.'},
  pressure:{sentence:'She felt pressure before the examination.',meaning:'stress',wrong:['excitement','confidence','relief'],alternative:'She felt stressed before the test.'},
  participant:{sentence:'Each participant received a certificate.',meaning:'person taking part',wrong:['person watching','person organising','person judging'],alternative:'Everyone who took part received a certificate.'},
  majority:{sentence:'The majority of visitors arrived early.',meaning:'most',wrong:['exactly half','a few','none'],alternative:'Most visitors arrived early.'},
  outlet:{sentence:'The shop opened a new outlet in town.',meaning:'branch of a business',wrong:['discounted product','advertising campaign','delivery service'],alternative:'The shop opened another branch in town.'},
  sprinkled:{sentence:'The chef sprinkled herbs over the dish.',meaning:'scattered small amounts',wrong:['removed every piece','measured carefully','cooked for hours'],alternative:'The chef scattered a little herb over the food.'},
  considerably:{sentence:'The price dropped considerably.',meaning:'by a large amount',wrong:['for one day','without warning','very slowly'],alternative:'The price fell by a large amount.'},
  depression:{sentence:'The report discussed depression and its effects on wellbeing.',meaning:'a mental health condition',wrong:['a financial reward','a physical exercise','a school achievement'],alternative:'The report explored a mental health condition and its impact on wellbeing.'}
};
export const ACTIVITY_FORMATS = [
  { id:'forms', name:'MS Forms quiz', description:'Choice questions + answers', icon:'▣', color:'blue' },
  { id:'reading', name:'Reading challenge', description:'Short texts + comprehension', icon:'▤', color:'violet' },
  { id:'gap', name:'Gap-fill', description:'Vocabulary in context', icon:'✎', color:'amber' },
  { id:'paraphrase', name:'Paraphrase lab', description:'Keep the meaning', icon:'⇄', color:'teal' },
  { id:'detective', name:'Context detective', description:'Evidence + justification', icon:'◎', color:'coral' },
  { id:'writing', name:'Writing challenge', description:'Guided mini-writing', icon:'✦', color:'green' }
];
const numberLines = lines => lines.map((line,index) => (index+1)+'. '+line).join('\n\n');
const rotate = (items, offset) => items.map((_,index) => items[(index+offset)%items.length]);
function itemsFor(plan, minutes, variant) {
  const words = [...new Set((plan?.wordBank || []).map(w => String(w).toLowerCase().trim()))];
  const known = words.filter(word => Object.hasOwn(BANK,word));
  const maximum = minutes===5 ? 3 : minutes===15 ? 6 : 4;
  return { words, items: rotate(known,variant % Math.max(1,known.length)).slice(0,maximum).map(word => ({word,...BANK[word]})) };
}
function buildForms(items,variant) {
  const questions = items.map((item,index) => {
    const correctAt=(index+variant)%4;
    const choices=[...item.wrong];
    choices.splice(correctAt,0,item.meaning);
    return {item,choices,correctAt};
  });
  return {
    instructions:'Select the best meaning of each underlined word in its sentence.',
    task:numberLines(questions.map(({item,choices}) => item.sentence+'\nWhat does "'+item.word+'" mean here?\n'+choices.map((choice,i)=>'ABCD'[i]+'. '+choice).join('\n'))),
    key:numberLines(questions.map(({item,correctAt}) => item.word+': '+('ABCD'[correctAt])+' — '+item.meaning)),
    note:'Copyable Microsoft Forms questions and an answer key; this does not create a Form automatically.'
  };
}
function buildReading(items) {
  return {
    instructions:'Read the short extracts and use context to understand each highlighted word.',
    task:items.map((item,index) =>
      'Extract '+(index+1)+'\n'+item.sentence+'\n\nA. Explain "'+item.word+'" in your own words.\nB. Which detail in the sentence helps you understand its meaning?'
    ).join('\n\n')+'\n\nFinal question: Choose two extracts and explain how the vocabulary changes the meaning.',
    key:numberLines(items.map(item => item.word+': '+item.meaning+'. Accept a relevant context clue and an accurate explanation.')),
    note:'A short-text reading activity, rather than a fabricated continuous article.'
  };
}
function buildGap(items,variant) {
  const shuffled = rotate(items.map(item=>item.word),variant+1);
  return {
    instructions:'Complete each sentence using the word bank. Use every word once.',
    task:'WORD BANK: '+shuffled.join(' · ')+'\n\n'+numberLines(items.map(item => item.sentence.replace(new RegExp('\\b'+item.word+'\\b','i'),'________'))),
    key:numberLines(items.map(item=>item.word)),
    note:'Each gap is taken from a checked example sentence.'
  };
}
function buildParaphrase(items) {
  return {
    instructions:'Rewrite each sentence in different words without changing the meaning.',
    task:numberLines(items.map(item=>item.sentence))+'\n\nExplain one change you made and why the meaning stayed the same.',
    key:numberLines(items.map(item=>item.alternative))+'\n\nAccept other natural paraphrases that preserve the original meaning.',
    note:'Model alternatives are examples, not the only acceptable answers.'
  };
}
function buildDetective(items) {
  return {
    instructions:'Be a vocabulary detective: explain the word and cite the context clue.',
    task:numberLines(items.map(item=>item.sentence+'\nWhat does "'+item.word+'" mean? Which words in the sentence support your answer?')),
    key:numberLines(items.map(item=>item.word+': '+item.meaning+'. Evidence must come from the sentence.')),
    note:'This checks understanding, not a presumed individual student mistake.'
  };
}
function buildWriting(items,level) {
  const bank=items.map(item=>item.word);
  return {
    instructions:'Write a short paragraph using target vocabulary accurately.',
    task:'Your topic: A new experience, event or product.\n\nUse at least '+Math.min(3,bank.length)+' of these words: '+bank.join(', ')+'.\nWrite 80–120 words. Give your opinion, a reason and a specific example.'+(level==='challenge'?'\n\nChallenge: Include a contrasting point using although or however.':''),
    key:'Teacher checklist: target vocabulary is used naturally and accurately; clear viewpoint; developed reason or example; understandable language.',
    note:'Open-response writing needs teacher review; no automatic marking is implied.'
  };
}
export function generateVocabularyActivity(plan, config={}) {
  const type=config.type || 'forms', minutes=Number(config.minutes)||10;
  const level=config.level || 'standard', variant=Number(config.variant)||0;
  const {words,items}=itemsFor(plan,minutes,variant);
  const chosen=ACTIVITY_FORMATS.find(format=>format.id===type) || ACTIVITY_FORMATS[0];
  if (!items.length) return {
    title:chosen.name, task:'No example sentences are available for these selected words yet. Choose another group of target words or prepare the task manually.',
    key:'No answer key can be generated without verified examples.',
    note:'No made-up definitions or answers are provided.', ready:false
  };
  const maker={forms:()=>buildForms(items,variant),reading:()=>buildReading(items),gap:()=>buildGap(items,variant),
    paraphrase:()=>buildParaphrase(items),detective:()=>buildDetective(items),writing:()=>buildWriting(items,level)};
  const result=maker[chosen.id]();
  const support=level==='supported'?'Support: Underline the clues, use the word bank and check the definitions.\n\n':
    level==='challenge' && type!=='writing'?'Challenge: Justify each answer with evidence or an alternative.\n\n':'';
  return {
    title:chosen.name,
    task:'VOCABULARY PRACTICE  ·  '+minutes+' MINUTES\n\n'+support+result.instructions+'\n\n'+result.task,
    key:result.key, note:result.note, ready:true, count:items.length, words
  };
}
export function renderVocabularyActivityStudio(plan, config={}) {
  const generated=generateVocabularyActivity(plan,config);
  const currentType=config.type||'forms', currentMinutes=Number(config.minutes)||10, currentLevel=config.level||'standard';
  const tiles=ACTIVITY_FORMATS.map(format => [
    '<button type="button" class="vocab-studio-card" data-tone="',format.color,
    '" data-action="teacher-studio-select" data-kind="type" data-value="',format.id,
    '" aria-pressed="',String(currentType===format.id),'">',
    '<span class="vocab-studio-card__icon" aria-hidden="true">',format.icon,'</span>',
    '<strong>',escapeHtml(format.name),'</strong><small>',escapeHtml(format.description),
    '</small><span class="vocab-studio-card__tick" aria-hidden="true">✓</span></button>'
  ].join('')).join('');
  const options=(kind,values,selected)=>values.map(([value,label]) =>
    '<button type="button" class="vocab-studio-pill" data-action="teacher-studio-select" data-kind="'+kind+
    '" data-value="'+escapeHtml(value)+'" aria-pressed="'+String(String(value)===String(selected))+'">'+escapeHtml(label)+'</button>'
  ).join('');
  return [
    '<section class="vocab-studio" data-vocab-studio>',
    '<header class="vocab-studio-hero"><div><span class="vocab-studio-eyebrow">✦ VOCABULARY · TEACHER STUDIO</span>',
    '<h2>Make the next lesson <em>count.</em></h2><p>Choose a format and get a task you can actually use.</p></div>',
    '<span class="vocab-studio-hero__letter" aria-hidden="true">Aa</span></header>',
    '<div class="vocab-studio-content">',
    '<div class="vocab-studio-heading"><strong>01 <span>Choose an activity</span></strong><small>6 formats</small></div>',
    '<div class="vocab-studio-cards">',tiles,'</div>',
    '<div class="vocab-studio-controls"><div><strong>02 <span>Duration</span></strong><div class="vocab-studio-pills">',
    options('minutes',[[5,'5 min'],[10,'10 min'],[15,'15 min']],currentMinutes),'</div></div>',
    '<div><strong>03 <span>Difficulty</span></strong><div class="vocab-studio-pills">',
    options('level',[['supported','Supported'],['standard','Standard'],['challenge','Challenge']],currentLevel),
    '</div></div></div>',
    '<section class="vocab-studio-preview" aria-label="Activity preview"><div class="vocab-studio-preview__head">',
    '<div><span class="vocab-studio-eyebrow">READY TO PREVIEW</span><h3>',escapeHtml(generated.title),
    '</h3></div><button class="vocab-button vocab-button--quiet" type="button" data-action="teacher-studio-refresh">↻ New version</button></div>',
    '<pre class="vocab-studio-preview__task">',escapeHtml(generated.task),'</pre>',
    '<details class="vocab-studio-preview__key"><summary>Teacher answer key / guidance</summary><pre>',escapeHtml(generated.key),'</pre></details>',
    '<p class="vocab-studio-preview__note">',escapeHtml(generated.note),'</p>',
    '<div class="vocab-studio-preview__actions">',
    '<button type="button" class="vocab-button vocab-button--primary" data-action="teacher-studio-copy" data-part="task" ',
    generated.ready?'':'disabled','>Copy student task</button>',
    '<button type="button" class="vocab-button vocab-button--secondary" data-action="teacher-studio-copy" data-part="key" ',
    generated.ready?'':'disabled','>Copy answer key</button>',
    '<span role="status" aria-live="polite" data-vocab-studio-status></span></div></section></div></section>'
  ].join('');
}