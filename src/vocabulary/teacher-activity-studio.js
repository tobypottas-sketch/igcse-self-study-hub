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
// Curated passages with explicit text-dependent questions and checked keys.
// The selected text must meaningfully overlap the class vocabulary; never pretend to generate a bespoke passage.
const READING_PACKS=[
 {id:'holiday',title:'The Holiday That Wasn’t What It Seemed',words:['fooled','guaranteed','inexpensive','afford','demand'],
 passage:'The Li family booked an inexpensive seaside holiday after seeing photographs of a modern hotel and a large swimming pool. The travel company guaranteed that every room would have a sea view and that all activities were included. However, when the family arrived, the pool was closed and their room faced a busy road. The company had used pictures of a different hotel. Mrs Li felt that the advertisement had fooled them.\n\nThey asked to move, but the receptionist explained that the cheaper rooms were already full. The family could not afford another hotel, so they stayed. During the week, they discovered that the advertised boat trip cost extra. After returning home, Mrs Li posted a detailed review with photographs. Other customers shared similar experiences and demanded refunds. A week later, the company apologised and offered the family part of their money back.',
 easy:[
 ['Where had the family planned to stay?','At a seaside hotel.'],
 ['Name one problem they found on arrival.','The pool was closed / their room faced a busy road.'],
 ['Why did the family stay at the hotel?','They could not afford another hotel.'],
 ['What extra activity did they have to pay for?','The boat trip.'],
 ['What did Mrs Li post after the holiday?','A detailed review with photographs.'],
 ['What did the company eventually offer?','An apology and a partial refund.']],
 standard:[
 ['Give TWO ways the reality differed from the advertisement.','Pool closed; road-facing room instead of sea view; boat trip cost extra (any two).'],
 ['Why was changing hotels not a realistic option for the family?','They did not have enough money for another hotel.'],
 ['What does “fooled” suggest about the advertisement?','It misled the family into believing the hotel was better than it was.'],
 ['What prompted other customers to demand refunds?','Mrs Li posted a review, and other customers recognised similar experiences.'],
 ['Find a word meaning “promised with certainty”.','guaranteed'],
 ['Did the company give the family everything they wanted? Explain.','No. It offered only part of their money back.']],
 hard:[
 ['How might the photographs have influenced the family’s decision?','They created a false expectation of the hotel’s facilities and quality.'],
 ['Explain the difference between “inexpensive” and “good value” using this holiday.','A low price did not make it good value because promised facilities were absent or extra.'],
 ['Why is the word “guaranteed” important to the complaint?','The company made a definite promise that was not honoured.'],
 ['What can you infer about the effect of Mrs Li’s review?','It encouraged others to report similar problems and seek refunds.'],
 ['Rewrite “The advertisement had fooled them” without changing its meaning.','The advertisement had misled / tricked the family.'],
 ['In 25–35 words, explain how the family tried to resolve the problem.','They asked to move hotels, then posted a review describing the problems. Other customers complained, and the company eventually offered a partial refund. (Accept accurate 25–35 word summaries.)']]
 },
 {id:'event',title:'The School Event That Nearly Failed',words:['arrange','participant','majority','pressure','avoid','harmless'],
 passage:'Students at Oakwood School planned a weekend sports event for local families. Maya had to arrange the equipment and make sure every participant knew where to go. Although the majority of volunteers arrived on time, several tables and signs had not been delivered. With parents already gathering outside, Maya began to feel pressure.\n\nHer friend Ben suggested cancelling the first activity, but Maya wanted to avoid disappointing the younger children. The volunteers changed the order of events and borrowed tables from the library. Later, a small insect appeared near the refreshments. Some children were frightened, but a science teacher explained that it was harmless and helped them move it outside safely. By lunchtime, every activity was running again. The organisers learned that flexible planning and clear communication mattered more than following the original timetable exactly.',
 easy:[
 ['What kind of event was the school organising?','A weekend sports event for local families.'],
 ['What equipment had not arrived?','Several tables and signs.'],
 ['Did most volunteers arrive on time?','Yes.'],
 ['Why did Maya not want to cancel?','She did not want to disappoint younger children.'],
 ['Where did the volunteers borrow tables from?','The library.'],
 ['Who explained that the insect was harmless?','A science teacher.']],
 standard:[
 ['Identify TWO problems the organisers faced.','Missing tables/signs; frightened children near the refreshments (any two).'],
 ['What does the word “majority” tell us about the volunteers?','More than half / most arrived on time, but not necessarily all.'],
 ['Why did Maya feel under pressure?','Families were arriving, while essential materials were missing.'],
 ['How did the volunteers change their plan?','They reordered activities and borrowed tables from the library.'],
 ['What does “harmless” mean in the insect incident?','The insect was not dangerous to people.'],
 ['What lesson did the organisers learn?','Adaptability and clear communication matter more than sticking rigidly to a schedule.']],
 hard:[
 ['Explain why Maya’s decision shows flexibility rather than poor planning.','She adapted to unexpected delays to keep the event running.'],
 ['How does the phrase “majority of volunteers” limit what the writer claims?','It means most arrived on time, but leaves open that some did not.'],
 ['Why was the science teacher’s response more effective than simply removing the insect?','The teacher reassured children and explained the risk accurately.'],
 ['What does the story suggest about leadership under pressure?','Successful leaders communicate and adapt instead of abandoning the event.'],
 ['Paraphrase “wanted to avoid disappointing the younger children”.','Did not want to let the younger children down.'],
 ['Summarise the organisers’ main responses to the problems in 25–35 words.','They changed the order of activities, borrowed missing equipment and asked a teacher to reassure children about an insect. The event then continued successfully. (Accept accurate summaries.)']]
 },
 {id:'market',title:'A Small Business Changes Its Plans',words:['demand','outlet','sprinkled','considerably','inexpensive','majority'],
 passage:'When Amina opened a small bakery outlet near the station, she hoped commuters would buy inexpensive snacks on their way to work. At first, sales were slow. The majority of customers bought only drinks, while her homemade cakes remained on the shelves. She asked regular visitors what they wanted and discovered strong demand for smaller portions.\n\nThe following week, Amina began selling mini cakes sprinkled with nuts and offering a choice of toppings. She also displayed the prices more clearly. Sales increased considerably, especially during the morning rush. However, the new products required more preparation, and some customers had allergies to nuts. Amina decided to label ingredients carefully and offer versions without nuts. After a month, she had enough regular customers to consider opening another outlet, but she chose to improve the first shop before expanding.',
 easy:[
 ['Where was the bakery located?','Near the station.'],
 ['What did most customers buy at first?','Drinks.'],
 ['What did customers want instead?','Smaller portions / mini cakes.'],
 ['Name one change Amina made to her cakes.','Smaller cakes / nuts / toppings.'],
 ['Why did she label ingredients carefully?','Some customers had nut allergies.'],
 ['Did she open a second outlet immediately?','No.']],
 standard:[
 ['What information helped Amina decide what to change?','She asked regular customers what they wanted.'],
 ['Explain “demand” in the context of mini cakes.','Many customers wanted to buy smaller portions.'],
 ['Give TWO changes Amina made after listening to customers.','Introduced mini cakes, toppings and clearer prices (any two).'],
 ['Why were nut-free versions important?','To offer safer choices for customers with nut allergies.'],
 ['What does “increased considerably” tell us about sales?','They went up by a large amount.'],
 ['Why did Amina decide against immediate expansion?','She wanted to improve the first bakery before opening another.']],
 hard:[
 ['What assumption did Amina make about commuters that proved incomplete?','She expected them to buy snacks without first checking preferred portion sizes.'],
 ['Explain how customer feedback changed Amina’s business decisions.','She introduced smaller cakes, toppings and clearer prices based on what people wanted.'],
 ['Why could rising sales create new problems?','More products required extra preparation and raised allergy-labelling concerns.'],
 ['How is “demand” different from a single customer’s preference here?','It describes strong interest from multiple customers rather than one person.'],
 ['Rewrite “Sales increased considerably” more simply.','Sales went up a lot / rose substantially.'],
 ['In 25–35 words, summarise the changes Amina made and one decision she postponed.','She introduced smaller cakes, extra toppings and clearer prices, and improved ingredient labelling. Although sales rose, she delayed opening another outlet to improve the original bakery.']]
 }
];
function buildReading(items,minutes,level,variant) {
  const available=READING_PACKS.map(pack=>({...pack, overlap:items.filter(item=>pack.words.includes(item.word)).length})).filter(pack=>pack.overlap>=2)
    .sort((a,b)=>b.overlap-a.overlap);
  if(!available.length) return null;
  const highest=available[0].overlap;
  const shortlist=available.filter(pack=>pack.overlap===highest);
  const chosen=shortlist[variant%shortlist.length];
  const questions=chosen[level==='supported'?'easy':level==='challenge'?'hard':'standard'];
  const limit=minutes===5?3:minutes===15?6:5;
  const selected=questions.slice(0,limit);
  const preface=level==='supported'?'Read the passage. Answer using information from the text. Short answers are fine.':
    level==='challenge'?'Read carefully. Explain implied meaning and support your interpretations with details from the text.':
      'Read the passage and answer the comprehension and vocabulary questions.';
  return {
    instructions:preface,
    task:chosen.title+'\n\n'+chosen.passage+'\n\nQUESTIONS\n'+numberLines(selected.map(pair=>pair[0])),
    key:numberLines(selected.map(pair=>pair[1])),
    note:'Original curated reading passage. Target words used: '+items.filter(item=>chosen.words.includes(item.word)).map(item=>item.word).join(', ')+'.'
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