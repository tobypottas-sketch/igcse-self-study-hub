import {recognitionQuestion} from '../engine/recognition.js';
import {structureExplore} from './review-structure-recognition.js';

function question(id,prompt,key,choices,format={},version=2){
 return {...recognitionQuestion(id,version,prompt,key,choices),checkedPractice:true,...format};
}

const checked=[
 question('pedagogy-extra-q-1','Which detail best supports the paragraph’s point?','floors',[
  ['entrance','A sign outside points visitors to the main entrance.','This helps people find the building. The point is about finding rooms inside.'],
  ['floors','Signs beside the stairs list the rooms on each floor.','The signs link the rooms to their floors, so visitors know where to go inside.'],
  ['map','A board at reception lists the library’s opening hours.','Opening hours help visitors decide when to come, rather than which floor to visit.']
 ],{context:'Your library review says it is easy to find the right room once you are inside.'}),
 question('pedagogy-extra-q-5','Which plan best answers both questions?','value-show',[
  ['value-show','Cost and programme / captions and sound','The discount and programme help readers judge value. Captions and sound help them judge whether they can follow the actors.'],
  ['evening','Cost and captions / programme and sound','Putting evening captions with the discount makes readers look in two places for information about following the actors.'],
  ['sound','Cost and sound / programme and captions','Clear sound answers a question about the performance. Mixing it with ticket cost makes that point harder to find.']
 ],{context:'You are reviewing a theatre for a school newsletter. Readers want to know what they get for the ticket price and how easily they can follow the actors. The theatre offers discounted tickets, a free programme, captions at evening shows and clear sound.',
 plans:[
  [['Discounted tickets','Free programme'],['Evening captions','Clear sound']],
  [['Discounted tickets','Evening captions'],['Free programme','Clear sound']],
  [['Discounted tickets','Clear sound'],['Free programme','Evening captions']]
 ]}),
 question('pedagogy-extra-q-6','Which plan shows how the tutor helped beginners learn?','learning',[
  ['events','Put the demonstration with the equipment list, then describe what students photographed.','This describes what happened, but the equipment list does not explain what students learned from the tutor.'],
  ['learning','Link the demonstration to taking sharp photos. Put the tutor’s advice with the second attempt.','Each teaching step stays beside the skill or improvement it produced.'],
  ['verdict','Group the tutor’s demonstration and advice. Put both sets of results in a later paragraph about the finished photos.','Both topics are relevant, but separating the teaching from the results makes the effect of each step less clear.']
 ],{context:'For a school website, explain what beginners learned on a photography course. The tutor showed students how to steady the camera before they took sharp photos. After seeing their first pictures, the tutor suggested moving nearer. The subjects were clearer in the second set.'}),
 question('pedagogy-extra-q-7','Where would the lamp detail do the most useful work?','study',[
  ['study','Under “Can I study here in the evening?”','The lamps answer the concern about dim light, alongside the other study conditions.'],
  ['borrow','Under “What can I get at the counter?”','The counter is where readers borrow a lamp, but this separates the solution from the dim-light problem.'],
  ['intro','In the opening, as a reason to choose this café.','It is a useful detail once readers know why the lighting matters. On its own, it does not explain whether they can study comfortably.']
 ],{context:'Students want to know where they can revise after school. Your plan has an evening-study paragraph about quiet seats, sockets and dim light, and a counter-service paragraph about menus and ordering. Café staff also lend reading lamps from the counter.'}),
 question('pedagogy-extra-q-8','Which sentence belongs in the “Cost of the course” paragraph?','price',[
  ['controls','The tutor explained the controls clearly.','This tells readers how the tutor helped the group learn.'],
  ['price','The entrance fee was ¥30.','Put the entrance fee with the cost of borrowing equipment so readers can find the practical costs together.'],
  ['camera','We then managed to operate the camera on our own.','This gives the result of the tutor’s explanation and belongs with the teaching detail.']
 ],{context:'This paragraph explains what students learned on a photography course. A separate paragraph called “Cost of the course” already explains the charge for borrowing a camera.',sentenceSelection:true}),
 question('pedagogy-extra-q-10','Which ending gives a first-time visitor advice that fits both observations?','balanced',[
  ['labels','First-time visitors should go because the labels make it easy to find the right rooms.','The labels help with the displays. That does not tell us how easily visitors can find the rooms.'],
  ['balanced','It is worth visiting for the clear display labels, but ask at reception how to find the rooms you want.','The praise stays with the display labels. Asking for directions answers the separate problem with the map.'],
  ['skip','Go only if you already know the museum. The map makes it hard to learn about the displays.','The map makes rooms hard to find, but this overlooks the useful labels once visitors reach the displays.']
 ],{context:'Your review says the museum labels explain the displays clearly, but the map makes it hard to find the right room.',original:'This makes it ideal for first-time visitors.'})
];

const master=question('pedagogy-q-007','Which plan best answers the magazine brief?','evidence-advice',[
 ['visit-order','Visit in chronological order','This tells the story of the visit, but the cabinets and shop take space from the points new groups need to compare.'],
 ['evidence-advice','Learning and group advice','The plan puts tutor support beside what beginners achieved. It uses cost and the queue to give the intended readers practical advice.'],
 ['price-first','Price and activities','The fee and waiting times are useful, but the ending recommends the workshop without helping beginners choose when to book. Keeping the demonstration beside what beginners made would also show how the tutor helped.']
 ],{
 context:'Your school magazine wants a review of a printmaking workshop for groups of beginners. Explain how well beginners learned, then give useful advice to a group choosing when to book. The tutor demonstrated each step and beginners printed a card by the end. The ¥40 fee covered paper and ink. At midday the group waited twenty minutes for a press; the morning group used a free press straight away. The room also had glass display cabinets and a gift shop.',
 plans:[
  [['Describe the room and the tutor’s demonstration','Tell readers what the group did in order'],['Describe the finished cards and gift shop','Recommend it to groups interested in art']],
  [['Link the tutor’s demonstration to the cards beginners made','Explain what the ¥40 pays for'],['Compare the waits at midday and in the morning','Recommend a morning booking for beginner groups']],
  [['Explain the fee and what it includes','Compare waiting times at midday and in the morning'],['Describe the room and the finished cards','Recommend it to beginners who want to take home their own work']]
 ]
});

const practiceChanges=new Map(checked.map(item=>[item.id,item]));
const writingChanges={
 'pedagogy-task-001':{question:'Write two short paragraphs for a school club. Aim for 35–55 words.\n1. Explain how to get there and why the group should allow time for the booking.\n2. Describe the rehearsal room and explain how the mirrors helped.'},
 'pedagogy-task-002':{
  prompt:'Local aquarium, school newsletter. The aquarium opens at 10:00. Allow fifteen minutes to get from the entrance to the talk. The feeding talk begins at 10:30. Visitors can watch the fish feed and hear a clear explanation.',
  example:'First, explain why visitors should arrive when the aquarium opens. It takes fifteen minutes to reach the talk, which begins at 10:30. Then explain what they get from the talk: they can watch the fish feed and hear how the animals are fed.'
 },
 'pedagogy-task-003':{
  example:'The short beginner sessions let you try VR without committing to a long game. If the game feels overwhelming, you can ask the instructor to pause it during the session, so you have a moment to settle before continuing.',
  checks:['Both facts help a nervous first-time player decide whether to try VR.','I kept the two beginner details together.','I explained why both details could help a first-time player.'],
  checkIds:['criterion-a','criterion-b','criterion-both-benefits']
 },
 'pedagogy-task-005':{
  question:'Write for students preparing a podcast.\n1. In the editor’s note, say which two kinds of information the draft mixes.\n2. Rewrite it in two paragraphs. Keep the booking and recording details, and give advice supported by what you heard. Aim for 45–65 words in the review.',
  modelNote:'The draft mixes booking instructions with what it was like to record.',
  example:'Book the booth online the day before and take your booking email to the main desk to collect the key.\n\nThe microphone picked up my voice clearly, although corridor conversations sometimes carried into the booth. I’d recommend it for a short practice recording.',
  checks:['I named the two kinds of detail the draft mixes.','I grouped the booking steps together and kept both recording observations.','My advice fits what happened during recording.'],
  checkIds:['criterion-a','criterion-access-and-recording','criterion-c']
 }
};
const reviseWriting=task=>writingChanges[task.id]?{...task,...writingChanges[task.id],version:(task.version??1)+1}:task;

export function refineStructureForStaff(course){
 return {...course,analysis:master,practice:course.practice.map(activity=>({...activity,items:activity.items.map(item=>{
  if(item.id==='pedagogy-q-001')return {...item,rationale:'This heading covers booking together, finding the row and getting help from a member of staff.',explanations:[
   'This heading covers booking but misses what happens when the group arrives.',
   'This heading covers booking together, finding the row and getting help from a member of staff.',
   'A member of staff helps the group, but the heading leaves out booking and row signs.'
  ]};
  if(item.id==='pedagogy-q-004')return {...item,prompt:'Start with the sign. Explain where it took the group before saying what they missed.'};
  if(item.id==='pedagogy-extra-q-3')return {...item,prompt:'Put the sentences in order so each idea leads to the next.'};
  return practiceChanges.get(item.id)??item;
 })})),gold:course.gold.map(reviseWriting),apply:course.apply.map(reviseWriting),master:reviseWriting(course.master)};
}

export const optionalStructureExplore = new Set([
 'review-willow-kitchen--paragraph-d','beyond-the-stars--paragraph-d',
 'summer-sound--paragraph-a','pixel-quest--paragraph-d'
]);

export const structureExploreModelTarget=3;
export function finishedStructureModels(questions,done){
 return Object.values(questions).filter(items=>items.filter(item=>!optionalStructureExplore.has(item.id)).every(done)).length;
}

const exploreChanges=[
 question('riverside-cafe--paragraph-b','Which sentence judges what visitors get for their money?','value',[
  ['menu','Located near the school, the café has comfortable seating and a varied menu.','This introduces the café and describes what visitors can find there. It gives no view on the cost.'],
  ['order','We ordered freshly made sandwiches and a generous slice of chocolate cake.','This gives concrete examples of the food. A detail about what the writer ordered is different from a judgement on its cost.'],
  ['value','Both were reasonably priced, which was particularly appealing to us.','“Reasonably priced” gives the writer’s view of the cost after the examples of what they bought.']
 ],{sentenceSelection:true},3),
 question('riverside-cafe--paragraph-d','What two decisions does this ending help friends make?','budget-and-time',[
  ['budget-and-time','Whether it suits their budget and when to go.','The writer names students who want an affordable meeting place and suggests avoiding the busiest hours.'],
  ['food-and-time','What to order and when to go.','There is timing advice, but the ending gives no dish to order.'],
  ['budget-and-speed','Whether it suits their budget and how quickly drinks will arrive.','The ending mentions affordability, but gives no promise about service speed.']
 ],{},3),
 question('review-willow-kitchen--paragraph-b','Which detail supports the idea that the meal was enough after sport?','amount-after-sport',[
  ['amount-after-sport','The bowl satisfied the writer after two hours on court.','The writer links the amount of food to how hungry they were likely to be after sport.'],
  ['share','The chilli sauce came on the side, making the meal easy to share.','This helps explain sharing. It does not say how much food the writer needed after sport.'],
  ['texture','The crunchy cucumber made the dish feel lighter.','This explains how the food felt to eat. It gives no evidence of how filling the meal was.']
 ],{},3),
 question('review-willow-kitchen--paragraph-c','Which heading covers the whole paragraph?','visit-problems',[
  ['wait','Getting a table','This covers the queue but leaves out what happened after the group sat down.'],
  ['visit-problems','Problems during the visit','Both getting a table and talking once seated were difficult. The broader heading includes both drawbacks.'],
  ['noise','Talking over the music','This covers the second drawback but leaves out the queue.']
 ],{},3),
 question('beyond-the-stars--paragraph-b','Why does the writer mention the quiet conversations after praising the relationship?','reason',[
  ['reason','They show the explorers’ fears and ambitions, helping the characters feel real.','The conversations are an example that helps readers understand why the relationship feels believable.'],
  ['plot','They explain what happened when the explorers were separated from the crew.','The plot begins with the separation, but this paragraph explains the relationship rather than what caused the separation.'],
  ['sound','They show how the director makes the scenes sound exciting.','The paragraph describes what the dialogue reveals about people, rather than how the scenes sound.']
 ],{},3),
 question('lost-city--paragraph-b','Select the sentence that gives evidence for the praise of the setting.','setting-evidence',[
  ['verdict','What makes the story memorable is its unusual setting.','This states the opinion. Look for a sentence that explains what makes the setting memorable.'],
  ['setting-evidence','The author describes crowded markets and deserted mountain villages so vividly that I could almost imagine walking beside the main character.','The markets and villages are specific examples. The writer explains the effect they had on her as a reader.'],
  ['characters','However, several minor characters seem rather similar, which occasionally makes the conversations difficult to follow.','This explains a separate drawback about the characters and conversations.']
 ],{sentenceSelection:true},3),
 question('lost-city--paragraph-c','How does the ending make a positive recommendation after this criticism?','balance',[
  ['balance','It accepts the drawback, then uses the short chapters and discoveries to explain why the book still works for adventure readers.','“Despite this weakness” connects back to the problem. The positives then explain why the book still deserves a recommendation.'],
  ['dismiss','It says the short chapters make the characters easy to tell apart.','Short chapters can keep the story moving, but the writer does not say they solve the character problem.'],
  ['opposite','It uses the similar characters as a reason to recommend the book to readers who enjoy complicated stories.','The earlier detail is a criticism. The ending recommends the book for a different reason and a different audience.']
 ],{context:'From the previous paragraph: Several minor characters seem rather similar, which occasionally makes the conversations difficult to follow.'},3),
 question('summer-sound--paragraph-d','Which advice responds directly to the earlier problem?','bottle',[
  ['early','Arrive early to find a comfortable spot.','This is useful advice about where to sit or stand, but it does not directly address waiting for drinking water.'],
  ['bottle','Bring a refillable water bottle.','The bottle advice follows the earlier problem with getting drinking water in the heat.'],
  ['music','Go if you want to support local talent.','This explains who might enjoy the festival. It is unrelated to the earlier wait for water.']
 ],{context:'From the previous paragraph: The queues for drinking water were extremely long, making the afternoon heat rather uncomfortable.'},3),
 question('skyline-adventure-park--paragraph-b','Which detail does the writer link directly to nervous visitors feeling ready to try?','demo',[
  ['small','The group began on a low course.','This tells us where the group started. The writer gives a different detail as the reason for visitors’ confidence.'],
  ['demo','The instructors showed visitors how to do each activity.','The writer says the careful demonstrations gave nervous visitors enough confidence to try.'],
  ['zip','The group tried a large zip line across the lake.','The zip line tells us what the group tried. It does not explain what helped nervous visitors take part.']
 ],{},3),
 question('skyline-adventure-park--paragraph-d','Which advice answers the problem with food prices?','packed',[
  ['morning','Book a morning session.','This tells readers when to go. It does not address the price of food.'],
  ['packed','Bring a packed lunch.','Taking food avoids relying on the café, which has few choices that students can afford.'],
  ['audience','Go with friends who enjoy a physical challenge.','This identifies who would enjoy the activities, rather than what students can do about lunch.']
 ],{context:'From the previous paragraph: The limited café menu offered few affordable options for students.'},3),
 question('pixel-quest--paragraph-c','Why include the example of players repeating unsuccessful actions?','effect',[
  ['effect','It shows why unclear instructions can put new players off.','Repeated failures make the problem concrete. They explain why a clearer tutorial would help inexperienced players.'],
  ['time','It shows that later levels should be made shorter.','The example explains what happens when instructions are unclear. It does not give the length of any level.'],
  ['puzzles','It shows that new players do not enjoy solving puzzles.','The frustration is tied to unclear directions. The writer does not say they dislike the puzzles.']
 ],{},3),
 question('science-discovery-centre--paragraph-c','How does the weekday advice follow from the earlier drawback?','access',[
  ['access','With fewer visitors, there is more chance to try the exhibits yourself.','The earlier problem was getting to use crowded exhibits. The ending gives a practical way to improve the visit.'],
  ['difficulty','The experiments are easier on weekdays.','The advice is about how many people visit. It does not say the experiments change.'],
  ['support','The explanations are clearer when fewer visitors come.','Clear explanations already helped beginners. The problem the advice addresses is access to the exhibits.']
 ],{context:'From the previous paragraph: Some popular exhibits were too crowded to use comfortably.'},3)
];
const exploreById=new Map(exploreChanges.map(item=>[item.id,item]));
export const structureExploreR23=Object.fromEntries(Object.entries(structureExplore).map(([id,items])=>
 [id,items.map(item=>exploreById.get(item.id)??item)]));
