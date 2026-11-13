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

// More precise context than the single-sentence meaning samples in BANK.
const GAP_CONTEXT={
 fooled:'The photographs showed a luxurious hotel, but the rooms were dirty. The advertisement ______ customers into expecting something that was not there.',
 guaranteed:'The company promised in writing that guests would get all their money back if the trip was cancelled. It ______ a refund.',
 harmless:'Some children were frightened of the insect, but the science teacher explained that it could not bite or sting. It was ______.',
 inexpensive:'The tickets cost only two pounds, so even families with a small budget could buy them. They were ______.',
 afford:'A second hotel would cost more than the family had saved. They could not ______ to move.',
 demand:'Hundreds of customers wanted the same small cakes, but the bakery could not make enough. There was high ______.',
 avoid:'To keep accounts safe, students were advised not to share passwords. They should ______ giving their details to others.',
 arrange:'The chairs were scattered across the room. The volunteers needed to ______ them into neat rows before the event.',
 pressure:'The event was about to start and several things had gone wrong. Maya felt ______ because everyone was expecting her to solve the problems.',
 participant:'Every person who joined the race received a certificate. Each ______ was congratulated at the finish line.',
 majority:'Out of 30 visitors, 24 arrived before opening time. The ______ were early.',
 outlet:'The company already had a shop in the city centre and opened another branch near the station. The new ______ attracted commuters.',
 sprinkled:'The chef scattered a few herbs across the top of each dish. She ______ them over the food just before serving.',
 considerably:'Last month the shop sold 20 cakes a day; this month it sold 80. Sales increased ______.',
 depression:'The health article explained that persistent low mood and loss of interest can be symptoms of ______, a condition that may need professional care.'
};
function gapItems(items){return items.filter(item=>GAP_CONTEXT[item.word]);}
function buildGap(items,variant,level='standard',minutes=10){
 const candidates=gapItems(items);
 if(!candidates.length)return null;
 const questions=candidates.map(item=>({word:item.word,context:GAP_CONTEXT[item.word]}));
 const missing=(text,word)=>text.replace(new RegExp('\\b'+word+'\\b','i'),'________');
 const key=numberLines(questions.map(item=>item.word));
 if(level==='supported'){
   const lines=questions.map((item,i)=>{
     const alternative=questions.length>1?questions[(i+1)%questions.length].word:BANK[item.word].wrong[0];
     const options=(i+variant)%2 ? [alternative,item.word]:[item.word,alternative];
     return missing(item.context,item.word)+'\nChoose: '+options.join(' / ');
   });
   return {instructions:'Read each situation and choose the word that fits. There are two options per question.',
     task:numberLines(lines),key,note:'Supported: a clear situation and two plausible-looking choices for each answer.'};
 }
 if(level==='challenge'){
   const lines=questions.map(item=>missing(item.context,item.word));
   return {instructions:'No word bank. Infer the missing words from context, not spelling or a memorised list.',
     task:numberLines(lines)+'\n\nChoose TWO answers. Explain why each word fits the context. Write one new sentence using a missing word in a different situation.',
     key:key+'\n\nAccept sensible explanations and accurate original sentences.',
     note:'Challenge: independent retrieval, context-based reasoning and transfer to new use.'};
 }
 const wordBank=rotate(questions.map(item=>item.word),variant+1);
 return {instructions:'Complete the sentences using the word bank. Use each word once.',
   task:'WORD BANK: '+wordBank.join(' · ')+'\n\n'+numberLines(questions.map(item=>missing(item.context,item.word))),
   key,note:'Standard: meaningful contexts, without answer choices or explanations.'};
}

function buildParaphrase(items) {
  return {
    instructions:'Rewrite each sentence in different words without changing the meaning.',
    task:numberLines(items.map(item=>item.sentence))+'\n\nExplain one change you made and why the meaning stayed the same.',
    key:numberLines(items.map(item=>item.alternative))+'\n\nAccept other natural paraphrases that preserve the original meaning.',
    note:'Model alternatives are examples, not the only acceptable answers.'
  };
}
// Genuine contrast, interpretation and accuracy decisions—not invented "context clues".
const DETECTIVE_CASES=[
 {words:['guaranteed','fooled'],title:'A promise or a possibility?',
   text:'A travel website stated: “Every guest is guaranteed a room with a sea view.” After arriving, some guests found rooms facing a car park.',
   supported:'Which is stronger: “guaranteed” or “might receive”? What did the website promise?',
   standard:'A manager says: “The website only suggested a sea view.” Does this accurately represent the original claim? Explain.',
   challenge:'Rewrite the manager’s explanation so it accurately acknowledges the original claim without promising an unverified solution.',
   easyKey:'“Guaranteed” is stronger. Every guest was promised a sea view.',
   key:'No. “Guaranteed” expresses a definite promise, not a suggestion.',
   hardKey:'Accept an accurate acknowledgement, e.g. “We guaranteed sea views, but some guests received rooms facing the car park. We are investigating why.”'},
 {words:['inexpensive','afford'],title:'Cheap for everyone?',
   text:'A museum advertises “inexpensive tickets” at £4 each. A family of six has only £15 available for the visit.',
   supported:'Does inexpensive mean free? Can this family pay for all six tickets?',
   standard:'A reviewer writes: “The tickets are inexpensive, so every family can afford them.” Identify the problem with this conclusion.',
   challenge:'Write a balanced, accurate two-sentence review explaining why the price may be low but not affordable to everyone.',
   easyKey:'No, inexpensive means low-priced. Six tickets cost £24, more than the family’s £15.',
   key:'Low-priced does not mean affordable to everyone. Six tickets would cost £24; this family has £15.',
   hardKey:'Accept a response distinguishing relatively low prices from an individual family’s budget.'},
 {words:['majority'],title:'Most is not all',
   text:'A survey of 40 students found that 31 preferred afternoon sports clubs. Nine preferred morning activities.',
   supported:'Do most students prefer afternoons? Do all students prefer afternoons?',
   standard:'The school newsletter reports: “All students want afternoon clubs.” Correct this claim using the figures.',
   challenge:'Write a precise headline and one sentence summarising the survey without exaggerating the results.',
   easyKey:'Most do (31 of 40), but not all.',
   key:'Incorrect: the majority (31 out of 40) preferred afternoons; nine preferred mornings.',
   hardKey:'Accept “Most students favour afternoon clubs” and accurate figures showing both preferences.'},
 {words:['demand'],title:'A popular product',
   text:'A café made 30 mini cakes. They sold out in 20 minutes, and another 25 customers asked when more would be available.',
   supported:'Is there low or high demand for these cakes? What happened to the cakes?',
   standard:'The owner says: “We should probably make fewer mini cakes tomorrow.” Evaluate this decision using the evidence.',
   challenge:'Recommend a sensible next step for the café, using the word “demand” accurately and acknowledging a possible risk.',
   easyKey:'High demand; they sold out quickly and other customers still wanted them.',
   key:'The evidence suggests strong demand, so producing fewer could disappoint customers.',
   hardKey:'Accept increasing production cautiously, while considering waste, stock and staffing.'},
 {words:['harmless'],title:'Harmless under which conditions?',
   text:'A wildlife sign says: “This species is harmless to people when left undisturbed. Please do not handle it.”',
   supported:'Does the sign say the animal is dangerous when left alone? Does it tell visitors to touch it?',
   standard:'A visitor says: “Harmless means I can pick it up safely.” Explain why this interpretation is wrong.',
   challenge:'Rewrite the sign as advice for younger visitors, preserving both the reassurance and the warning.',
   easyKey:'No. It says harmless when undisturbed; visitors should not touch it.',
   key:'The sign makes a conditional claim and explicitly advises against handling the animal.',
   hardKey:'Accept, e.g. “You do not need to be afraid if you leave the animal alone. Please do not touch or pick it up.”'},
 {words:['pressure','avoid'],title:'Responding to a deadline',
   text:'Maya had to organise an event while volunteers were arriving late. She felt pressure but avoided cancelling by changing the order of activities.',
   supported:'Did Maya cancel the event or find another solution?',
   standard:'Which is more accurate: “Maya ignored the problem” or “Maya adapted her plan”? Use a detail from the situation.',
   challenge:'Explain how “pressure” and “avoided” describe different parts of Maya’s experience.',
   easyKey:'She found another solution: she changed the order.',
   key:'She adapted her plan because she changed the order rather than cancelling.',
   hardKey:'Pressure describes the stress or demands she faced; avoided describes the unwanted action she prevented.'},
 {words:['arrange','participant'],title:'Before the event',
   text:'There are 18 runners registered for a race. Volunteers must arrange the chairs and registration table before participants arrive.',
   supported:'Who are the participants? What must the volunteers organise?',
   standard:'A student writes: “Participants arranged the registration table.” Can you conclude this from the text? Explain.',
   challenge:'Rewrite the event instructions to clearly separate the responsibilities of volunteers and runners.',
   easyKey:'Participants are runners; the volunteers must organise chairs and a registration table.',
   key:'No. The volunteers were responsible for arranging things, while the participants were registered runners.',
   hardKey:'Accept directions with responsibilities correctly assigned to volunteers and runners.'},
 {words:['outlet','considerably'],title:'Growth or exaggeration?',
   text:'A bakery’s first outlet sold about 20 cakes a day in September. In October it sold around 65 a day. The owner has not yet opened a second shop.',
   supported:'Have sales increased? Has a second shop opened?',
   standard:'A report claims: “Sales improved considerably, and the bakery opened another outlet.” Which part is unsupported?',
   challenge:'Rewrite the report as two accurate sentences, retaining “considerably” and “outlet” in context.',
   easyKey:'Yes, sales rose from 20 to 65; no second shop has opened.',
   key:'Sales increased substantially, but opening another outlet is not supported.',
   hardKey:'Accept: “Sales at the first outlet increased considerably. The owner has not opened a second outlet yet.”'},
 {words:['sprinkled'],title:'A small amount',
   text:'The recipe says: “Sprinkle a little cinnamon onto the fruit before serving.” The chef covered every piece of fruit in a thick layer.',
   supported:'Does “sprinkle a little” mean add a small or large amount?',
   standard:'Did the chef follow the instruction accurately? Explain the difference.',
   challenge:'Rewrite the instruction to remove ambiguity about the quantity and method without changing its intended meaning.',
   easyKey:'A small amount, scattered lightly.',
   key:'No. The chef used a thick layer instead of lightly scattering a little cinnamon.',
   hardKey:'Accept a precise instruction, e.g. “Lightly scatter a small pinch of cinnamon over the fruit.”'},
 {words:['depression'],title:'Careful health reporting',
   text:'An article explains that depression can affect mood, sleep and daily life. It says only a qualified professional can assess someone’s symptoms.',
   supported:'Does the article say everyone who feels sad has depression?',
   standard:'A headline says: “Feeling sad means you have depression.” Explain why this is inaccurate.',
   challenge:'Rewrite the headline and a one-sentence introduction to communicate the information accurately without diagnosing anyone.',
   easyKey:'No. The article does not say ordinary sadness automatically means depression.',
   key:'Sadness alone does not establish a diagnosis. A qualified professional must assess symptoms.',
   hardKey:'Accept cautious, accurate statements distinguishing symptoms from diagnosis.'}
];
function buildDetective(items,minutes,level,variant){
  const available=DETECTIVE_CASES.map(c=>({...c,score:c.words.filter(w=>items.some(item=>item.word===w)).length}))
    .filter(c=>c.score>0).sort((a,b)=>b.score-a.score);
  if(!available.length)return null;
  const pool=rotate(available,variant%available.length);
  const maximum=minutes===5?1:minutes===15?4:3;
  const chosen=pool.slice(0,maximum);
  const mode=level==='supported'?'supported':level==='challenge'?'challenge':'standard';
  return {instructions:mode==='supported'?'Read each situation. Choose or explain the accurate interpretation.':
       mode==='challenge'?'Investigate the claims. Write precise, evidence-based alternatives.':
       'Examine the evidence. Identify inaccurate or exaggerated claims and justify your answer.',
    task:chosen.map((c,i)=>'CASE '+(i+1)+' — '+c.title+'\n'+c.text+'\n\n'+c[mode]).join('\n\n'),
    key:chosen.map((c,i)=>(i+1)+'. '+c[mode==='supported'?'easyKey':mode==='challenge'?'hardKey':'key']).join('\n\n'),
    note:'Evidence and semantic precision tasks using authored scenarios, not invented student errors.'};
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