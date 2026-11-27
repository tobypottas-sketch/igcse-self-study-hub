import {recognitionQuestion} from '../engine/recognition.js';

function question(id,prompt,key,choices,presentation={}){
 return {...recognitionQuestion(id,2,prompt,key,choices),checkedPractice:true,...presentation};
}

const examples=[
 question('pedagogy-q-005','Which plan answers the two questions in separate paragraphs?','visit-learn',[
  ['travel-guide','Travel and guides / times and tools','This plan mixes a travel detail with something students can learn from.'],
  ['tools-travel','Tools and travel / guides and times','The closing time helps students plan a visit. It does not explain what they will learn.'],
  ['visit-learn','Visit / learning','The bus stop and hours help students plan a visit. The guides and tools show what they can learn.']
 ],{
  context:'Your school magazine wants a gallery review. Readers need to know whether they can visit after school and what they will learn. The gallery is near a bus stop, closes at five, has student guides and lets visitors handle copies of old tools.',
  plans:[
   [['Nearby bus stop','Student guides'],['Closes at five','Handle copies of old tools']],
   [['Handle copies of old tools','Nearby bus stop'],['Student guides','Closes at five']],
   [['Nearby bus stop','Closes at five'],['Student guides','Handle copies of old tools']]
  ]
 }),
 question('pedagogy-q-006','Select the sentence that belongs in a paragraph about the courts instead.','lights',[
  ['collection','You can borrow a racket at reception.','This tells readers where to borrow equipment.'],
  ['lights','The court lights are bright enough for evening practice.','This describes playing conditions. It belongs with the other information about the courts.'],
  ['deposit','You get your deposit back when you return the racket.','This explains the cost and return conditions of borrowing a racket.']
 ],{context:'This paragraph explains how to borrow a racket.',sentenceSelection:true}),
 question('pedagogy-q-010','Which word makes the most natural phrase for a performance that affected you emotionally?','deeply-v2',[
  ['highly-v2','highly','“Highly” often goes with words such as “effective”. Here the reviewer is expressing the depth of an emotional effect.'],
  ['deeply-v2','deeply','“Deeply moving” is a natural way to describe a strong emotional effect.'],
  ['strongly-v2','strongly','“Strongly” often goes with a verb, as in “strongly recommend”. This sentence needs a natural partner for “moving”.']
 ],{gap:['It was a ',' moving performance.']}),
 question('pedagogy-extra-q-15','Which version still says how many exhibits had a problem and when?','same-v2',[
  ['general-v2','Several exhibits are unreliable.','“Several” changes the number and “are unreliable” goes beyond this visit.'],
  ['same-v2','Two exhibits were not working when I visited.','The revision still gives the exact number and limits the observation to this visit.'],
  ['history-v2','Some exhibits have never worked properly.','This drops the number and adds a claim about earlier visits.']
 ],{original:'Two exhibits were out of order during my visit.'}),
 question('cohesion-q-004','Which version uses a full stop and comma correctly to introduce the contrast?','full-stop-v2',[
  ['splice-v2','The centre is popular, however, it is easy to book.','A comma before “however” does not separate the two complete statements.'],
  ['no-comma-v2','The centre is popular. However it is easy to book.','The full stop separates the statements. In this position, a comma also separates “However” from the statement it introduces.'],
  ['full-stop-v2','The centre is popular. However, it is easy to book.','The full stop separates the statements. The comma sets off “However” at the start of the second sentence.']
 ],{original:'The centre is popular, but it is easy to book.'}),
 question('pedagogy-q-015','Which observation most directly supports the claim about safety?','harness-v2',[
  ['harness-v2','The instructor checked each beginner’s harness.','Checking each harness shows what the instructor did to help keep beginners safe.'],
  ['routes-v2','The instructor offered two routes with different difficulty levels.','This shows beginners had a choice of routes. It gives less direct evidence about safety checks.'],
  ['queue-v2','The instructor explained where to queue for each route.','This shows how the session was organised. It does not tell readers what safety checks were made.']
 ],{context:'Your climbing review says the session helped beginners feel safe.'}),
 question('editing-q-003','What should the writer fix first?','repeats-v2',[
  ['tense-v2','Change the tense to present.','The past tense is appropriate because the writer describes a finished visit.'],
  ['repeats-v2','Remove the repetition about the wait.','Both sentences give the same information. Keep the precise wait once.'],
  ['timing-v2','Remove the exact waiting time.','Ten minutes is a useful fact. Removing the number loses detail without necessarily improving the writing.']
 ],{
  context:'We waited ten minutes for a table. The wait for a table took ten minutes.',
  correction:question('editing-q-003-correction','Which edit fixes the repetition and keeps the useful detail?','retain',[
   ['retain','We waited ten minutes for a table.','This keeps the exact time once.'],
   ['vague','We waited a little while for a table.','This removes the repetition but loses the exact waiting time.'],
   ['repeat','There was a ten-minute wait. We got a table after ten minutes.','The wording changes, but both sentences still give the same fact.']
  ],{original:'We waited ten minutes for a table. The wait for a table took ten minutes.'})
 })
];
const byId=new Map(examples.map(item=>[item.id,item]));

const tasksWithEditorNotes=new Set(['cohesion-task-006','editing-task-002','editing-task-005','editing-task-006']);

function separateModelNote(task){
 if(!task || !tasksWithEditorNotes.has(task.id))return task;
 const boundary=task.example.indexOf('\n\n');
 if(boundary<0)throw Error('Missing editor note boundary for '+task.id);
 return {...task,modelNote:task.example.slice(0,boundary),example:task.example.slice(boundary+2)};
}

export function withStaffInteractions(course){
 return {...course,
  gold:Array.isArray(course.gold)?course.gold.map(separateModelNote):separateModelNote(course.gold),
  apply:course.apply.map(separateModelNote),master:separateModelNote(course.master),
  practice:course.practice.map(activity=>({...activity,items:activity.items.map(item=>byId.get(item.id)??item)}))
 };
}
