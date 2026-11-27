import {recognitionQuestion} from '../engine/recognition.js';
import {vocabularyDiscoverR21} from './review-critical-r2-1.js';

function decision(id, version, prompt, key, choices, presentation = {}) {
 return {...recognitionQuestion(id, version, prompt, key, choices), ...presentation};
}

export const expressionDiscover = [
 decision('pedagogy-observation-004', 2, 'What physical benefit does the second sentence describe?', 'support', [
  ['space', 'There was room to stretch out.', 'There is no detail about how much space the seat provided.'],
  ['comfort', 'It felt comfortable in general.', 'General comfort could come from many things. The second sentence says what the seat did for the writer’s body.'],
  ['support', 'The seat held up the writer’s lower back.', 'The second sentence names the part of the body the seat helped support.'],
  ['softness', 'The seat felt soft.', 'A seat can support your back even if it feels firm. The sentence does not describe softness.']
 ]),
 decision('pedagogy-observation-005', 2, 'Who is the second version encouraging to watch the film?', 'mystery', [
  ['everyone', 'Anyone who wants a film they are sure to enjoy.', 'The second version suggests a film to try. It leaves readers to decide how much they enjoy it.'],
  ['fast', 'Readers who prefer a mystery that gets going quickly.', '“Slow-building” describes a mystery that takes time to develop.'],
  ['mystery', 'Readers who like mysteries that develop slowly.', 'The recommendation names the kind of film these readers already enjoy.']
 ]),
 vocabularyDiscoverR21
];

// Each paragraph offers one decision. Asterisked rows are optional.
const investigations = {
 'riverside-cafe': [
  ['*mood', 'What does “cheerful” tell us about the café?', ['The room was bright.', 'It felt lively and positive.', 'The staff served people quickly.'], 1, ['The writer gives no detail about lighting.', 'It describes how the place felt to be in.', 'A friendly welcome gives no service time.']],
  ['fair-price', 'What can students conclude about the price?', ['It was the lowest in the area.', 'It was reduced that day.', 'It seemed fair for what they got.'], 2, ['The writer gives no comparison with nearby cafés.', 'The review mentions no discount.', 'A fair price can still be higher than some alternatives.']],
  ['offset', 'How did the food change the writer’s view of the delay?', ['It made the wait feel worthwhile.', 'It helped the drinks arrive sooner.', 'It made the delay seem like a mistake on the bill.'], 0, ['Enjoying the food helped balance the negative experience.', 'The drinks still took twenty minutes.', 'The complaint concerns time, with no mention of billing.']],
  ['peak', 'When does the writer suggest visiting?', ['When fewer people usually visit.', 'Just before the café closes.', 'When the café changes its menu.'], 0, ['Peak hours are the busiest times. Outside them is usually quieter.', 'A quieter time could be earlier in the day.', 'The advice is about how busy it gets.']]
 ],
 'review-willow-kitchen': [
  ['walk', 'Which version keeps the travel detail?', ['It’s a quick drive from school.', 'You can get there from school in a few minutes on foot.', 'It’s easiest to reach from the sports courts.'], 1, ['The review says walking is quick.', '“On foot” keeps the method of travel and “a few minutes” keeps the idea of proximity.', 'The review gives directions relative to the school.']],
  ['*texture', 'Which description keeps the cucumber’s texture?', ['The cucumber had a crisp bite.', 'The cucumber had a mild flavour.', 'The cucumber was cool when served.'], 0, ['A crisp bite describes the feel of crunchy food.', 'Mild describes taste.', 'Cool describes temperature.']],
  ['main', 'Which revision keeps the writer’s judgement about the wait?', ['One small issue was the wait.', 'The longest part of lunch was the wait.', 'The biggest downside was the wait.'], 2, ['“Small” weakens the judgement.', 'The writer gives the waiting time without comparing it with the length of lunch.', '“Biggest downside” keeps the wait as the most important criticism.']],
  ['lunch', 'Which version keeps both reasons to recommend lunch?', ['You get a good choice at a fair price.', 'You get enough to satisfy your hunger without spending much.', 'You can share a large lunch with friends.'], 1, ['Choice is different from having enough to eat.', 'This keeps both the amount of food and the affordable price.', 'Sharing is a separate benefit and the price is missing.']]
 ],
 'beyond-the-stars': [
  ['early-interest', 'Which line keeps the writer’s first impression without making a claim about the speed of the film?', ['The film moves quickly from the start.', 'I was interested as soon as the film began.', 'The film drew me in once the crew got separated.'], 1, ['Feeling interested does not tell us how fast events happen.', 'This keeps the early interest and leaves the speed of events open.', 'This adds a specific turning point that the writer did not give.']],
  ['*effects', 'What is the reviewer saying about the special effects?', ['They are expensive to make.', 'They appear in nearly every scene.', 'They are impressive to watch.'], 2, ['The review gives no production costs.', 'The review gives no count of the scenes with effects.', '“Spectacular” describes the strong visual impression they make.']],
  ['mild-pace', 'Which revision keeps the strength and scope of the criticism?', ['The middle section feels a little slow.', 'The middle section drags badly.', 'The film is slow from beginning to end.'], 0, ['“A little slow” keeps the criticism moderate and limits it to the middle.', '“Drags badly” makes the same criticism much stronger.', 'This broadens the criticism to the whole film.']],
  ['action', 'Who might prefer another film?', ['Viewers who want a chase in the opening scene.', 'Viewers who want action in one or two fast scenes.', 'Viewers who want action nearly all the way through.'], 2, ['The writer makes no claim about what happens in the opening scene.', 'A few quick scenes can still leave long stretches without action.', '“Constant” describes how much of the film has action.']]
 ],
 'lost-city': [
  ['invitation', 'Which line keeps the invitation to mystery fans?', ['Mystery fans might like to give it a try.', 'Mystery fans will enjoy every chapter.', 'Anyone who wants to study history should read it.'], 0, ['It invites the same readers to try the book and lets them decide.', 'The writer recommends it without promising a reaction to every chapter.', 'The recommendation is for mystery fans.']],
  ['*mental-image', 'Which line keeps the effect of the descriptions?', ['The descriptions explain how people travel between places.', 'The descriptions made me feel as if I were there.', 'The descriptions made me want to visit those places.'], 1, ['Directions are different from picturing the setting.', 'Feeling as if you were there keeps the writer’s original reaction.', 'The writer describes imagining the setting during reading.']],
  ['keep-reading', 'What does “difficult to put down” mean here?', ['The book was difficult to understand in places.', 'The writer found it difficult to carry the book.', 'The writer wanted to keep reading.'], 2, ['Some conversations were hard to follow, but this expression praises the story.', 'The expression is about interest in the story.', 'The short chapters and surprises made the writer want to read on.']]
 ],
 'summer-sound': [
  ['purpose', 'Which opening keeps the reason the writer went?', ['I went with classmates to hear bands I hadn’t heard before.', 'I went with classmates to support bands we already followed.', 'I went with classmates to find out who ran the festival.'], 0, ['Discovering new bands means finding bands they did not already know.', 'Supporting familiar bands gives the visit a different purpose.', 'The writer was interested in hearing bands.']],
  ['energy', 'What does “energetic” tell us about the performances?', ['They were louder than the acoustic songs.', 'They had a lively feel.', 'They all used a fast tempo.'], 1, ['Loudness and energy are separate. The review gives no volume comparison.', '“Energetic” describes the lively quality of the performances.', 'A performance can feel lively at different speeds.']],
  ['*praise', 'Which version keeps both the strength of the praise and its evidence?', ['The band was enjoyable, and its songs got the audience dancing.', 'The band was outstanding because it drew a bigger crowd than the other performers.', 'The band stood out: its own songs got the whole audience dancing.'], 2, ['“Enjoyable” is positive but milder than “outstanding”.', 'The praise is strong, but the review does not compare crowd sizes.', '“Stood out” keeps the strong praise and the dancing explains the judgement.']],
  ['value', 'What is the writer praising with “excellent value”?', ['The benefits of going were well worth the cost.', 'It was cheaper than every other festival.', 'Entry cost nothing for young fans.'], 0, ['Value compares what you get with what you pay.', 'The writer gives no price comparison.', 'The cost of entry is not stated.']]
 ],
 'skyline-adventure-park': [
  ['levels', 'Which line keeps the full claim about who can take part?', ['The courses are mainly for complete beginners.', 'The activities suit people with different amounts of experience.', 'Everyone does a course at the same level.'], 1, ['This leaves out people with more experience.', 'This keeps the idea that the park suits visitors at several levels.', 'The writer says different levels are catered for.']],
  ['confidence', 'What did the demonstrations help nervous visitors do?', ['They stopped feeling nervous altogether.', 'They learned how to teach other visitors.', 'They felt ready enough to try.'], 2, ['Feeling ready to try can include some nervousness.', 'The review describes gaining confidence to take part.', 'The help gave them enough confidence for the next step.']],
  ['afford', 'Which version keeps the problem that affects students’ budgets?', ['The café had few dishes within a student budget.', 'The café had a small menu, and everything was cheap.', 'The café offered no meals students could afford.'], 0, ['This keeps “few” and specifies that the limit concerns price.', 'A small menu alone does not explain the problem with affordable options.', '“No” rules out the few affordable options mentioned.']],
  ['*visit', 'What does “make the most of your visit” mean here?', ['Spend as little time at the park as possible.', 'Get as much as you can out of your time there.', 'Try every single activity before leaving.'], 1, ['The advice is about getting a better experience, rather than finishing quickly.', 'Booking and food advice help visitors get more from the day.', 'The review makes no suggestion that every activity is necessary.']]
 ],
 'pixel-quest': [
  ['increase', 'Which version describes how the difficulty changes?', ['The puzzles stay hard throughout.', 'The hardest puzzles come first.', 'The puzzles get harder as you go.'], 2, ['“Increasingly” signals change.', 'The original says difficulty rises as the game continues.', 'The difficulty rises during play.']],
  ['reward', 'What does “rewarding” say about solving the puzzles?', ['It feels satisfying after the effort.', 'It helps you relax because it takes little effort.', 'It usually earns you a prize in the game.'], 0, ['The writer values the feeling of working things out.', 'A puzzle can be satisfying and still demand effort.', 'The review describes the experience rather than a prize.']],
  ['avoidable', 'Which version keeps both the problem and where it occurs?', ['Some advanced puzzles would be less confusing with fewer steps.', 'Clearer directions could prevent confusion in some advanced challenges.', 'The game needs clearer directions from the very first level.'], 1, ['The criticism concerns the directions, with no suggestion to shorten the puzzles.', 'This keeps both the limited scope and the idea that better directions could prevent confusion.', 'The writer mentions some advanced challenges, without criticising the starting levels.']],
  ['*occasion', 'What kind of play does the ending recommend?', ['Playing every day to improve your score.', 'Playing only if you are new to puzzle games.', 'Picking it up from time to time.'], 2, ['“Occasional” gives no daily schedule.', 'The phrase describes how often to play, rather than how experienced you are.', '“Occasional” means now and then.']]
 ],
 'science-discovery-centre': [
  ['comparison', 'Which version keeps the strength of the comparison?', ['The concepts stayed with me much better than when I studied them from a book.', 'The concepts were slightly easier to remember than when I read about them.', 'The concepts were much easier to learn than any school subject.'], 0, ['“Much better” keeps the strong difference in how well the writer remembered the concepts.', '“Slightly” weakens the difference.', 'The comparison concerns remembering the same ideas, rather than all school subjects.']],
  ['tone', 'Which description keeps both points about the explanations?', ['They were written mainly for young children.', 'They were easy for beginners to follow without talking down to visitors.', 'They used advanced language to keep older visitors interested.'], 1, ['The review specifically says the explanations did not sound childish.', 'This keeps accessibility and the respectful tone.', 'The review praises clarity for beginners.']],
  ['abstract', 'What are “abstract ideas” in this review?', ['The objects visitors can pick up during a demonstration.', 'The instructions visitors read before an experiment.', 'Concepts that the activities help you understand through practical examples.'], 2, ['Objects can help show an idea, but they are different from the idea itself.', 'Instructions show you what to do. The ideas explain what you are learning.', 'An experiment can make an idea easier to understand by showing how it works.']]
 ]
};

export const optionalExpressionExplore = new Set();
export const expressionWritingInvestigation = {
 id:'lost-city--paragraph-b',
 prompt:'Write a shorter sentence for a classroom book display. Keep the idea that the descriptions made you feel as if you were in the setting.',
 example:'The crowded markets and empty mountain villages were described so clearly that I felt I was there.',
 checks:['I named at least one place from the review.', 'I kept the reader’s feeling of being there.', 'I used natural language a classmate could understand.']
};
export const expressionExplore = Object.fromEntries(Object.entries(investigations).map(([model, rows]) => [model,
 rows.map(([name, prompt, alternatives, answer, feedback, context], index) => {
  const id = model+'--paragraph-'+String.fromCharCode(97+index);
  const optional = name.startsWith('*');
  if (optional) optionalExpressionExplore.add(id);
  const choices = alternatives.map((option, n)=>[name.replace(/^\*/, '')+'-'+(n+1), option, feedback[n]]);
  return decision(id, 2, prompt, choices[answer][0], choices, {context});
 })
]));

function practice(id, prompt, key, choices, presentation) {
 return decision(id, 2, prompt, key, choices, {...presentation, checkedPractice:true});
}

const revised = [
 practice('pedagogy-q-009', 'Which word tells readers that the change happened slowly?', 'option-a', [
  ['option-a','Gradual','A gradual change happens little by little over time.'],
  ['option-b','Subtle','A subtle change is hard to notice. It can happen quickly or slowly.'],
  ['option-c','Smooth','A smooth change has no sudden jumps. This alone does not tell us how long it took.']
 ],{context:'The lights took several minutes to dim from bright white to almost nothing.'}),
 practice('pedagogy-q-011', 'Which phrase fits with “the room” as the subject?', 'option-c', [
  ['option-a','packed out','People can pack out a room. With the room as the subject, you could say it was packed out.'],
  ['option-b','built up','A crowd can build up as more people arrive. Here the subject is the space they occupy.'],
  ['option-c','filled up','A room fills up when more and more people enter it.']
 ],{context:'More people came into the room over the next twenty minutes.',gap:['The room gradually ',' with visitors.']}),
 practice('pedagogy-extra-q-13', 'Which expression describes the effect the writer observed throughout the talk?', 'attention', [
  ['tension','The talk built tension.','Tension makes people feel that something important or worrying is about to happen. The observation gives no sign of that.'],
  ['feeling','The talk moved the audience.','This describes a strong emotional effect. The observation tells us about listening and interest.'],
  ['attention','The talk held the audience’s attention.','People continued listening and following the talk from start to finish.']
 ],{context:'The presenter showed how to repair a bicycle. People listened closely from the first step to the last.'}),
 practice('pedagogy-extra-q-14', 'Which phrase shows that the session offered enough for what you paid?', 'worth', [
  ['low','It was low-priced.','A low price tells readers how much it costs compared with similar sessions. It does not tell them what they get for the money.'],
  ['worth','It was worth the price.','This weighs the charge against the equipment and individual help you received.'],
  ['free','It was free to join.','Everyone paid ¥50. Having equipment included does not make entry free.']
 ],{context:'A repair workshop charged everyone ¥50. The fee included tools, spare parts and individual help. You felt the equipment and help justified the charge.'}),
 practice('pedagogy-q-012', 'Which edit keeps the same listening problem?', 'some-lines', [
  ['some-lines','From the back, we could make out some lines, but the quieter ones were hard to hear.','This keeps the listening position and makes clear that the problem affected the quieter lines.'],
  ['most-lines','From the back, we struggled to hear nearly all of the dialogue.','“Nearly all” makes the problem much more widespread.'],
  ['delivery','From the back, we missed some lines because the actors spoke too quickly.','The review does not say the actors spoke too quickly.']
 ],{original:'We could hear some dialogue from the back, but quieter lines were hard to catch.'}),
 practice('pedagogy-q-013', 'Which ending gives readers a friendly reason to try the film?', 'mystery-readers', [
  ['promise','If you like mysteries, you’ll love every minute of this one.','The writer can identify readers who might like the story, but cannot know how they will feel about every scene.'],
  ['mystery-readers','Give it a try if you enjoy piecing together clues as the story unfolds.','It speaks directly to students and matches the film to a specific interest.'],
  ['formal','Viewers with a preference for clue-based narratives are advised to consider this film.','The audience is relevant, but this sounds like formal guidance rather than a classmate’s recommendation.']
 ],{context:'You are writing for classmates. The film gives viewers clues as the mystery develops. You want to recommend it without promising how readers will react.'}),
 practice('pedagogy-extra-q-18', 'Which line helps these readers decide whether they have time for a sit-down lunch?', 'seat-time', [
  ['takeaway','Try the takeaway counter if you’re in a hurry.','The students want to sit together. This also assumes the takeaway counter is quicker.'],
  ['seat-time','If you go at noon, leave time to find a table. We waited ten minutes for one.','This gives the relevant time of day and the actual wait for a table without assigning blame.'],
  ['ordering','Get there at noon and allow ten extra minutes for your food to arrive.','The ten minutes were spent finding a table. The observation gives no time for food to arrive.']
 ],{context:'Your classmates have a short lunch break and want to sit together. When you went at noon, the tables were full and you waited ten minutes for one. Once seated, your group ordered straight away.'}),
 practice('pedagogy-extra-q-19', 'Which recommendation fits the work students will need to do?', 'regular', [
  ['weekend','Give it a go if you prefer to save all your practice for one weekend.','One practice session would miss the requirement to practise on three different evenings.'],
  ['experience','Try it if you have used a camera before and would prefer to practise during class.','Experience can help, but students still need time to practise outside class.'],
  ['regular','Try it if you’d enjoy taking photos and can make time on three evenings each week.','This matches an interest in photography with the actual practice schedule.']
 ],{context:'A photography course welcomes beginners but asks students to take and edit pictures on three evenings each week outside class. You are recommending it in the school newsletter.'}),
 practice('pedagogy-extra-q-20', 'Which edit gives practical advice while keeping the criticism fair?', 'today', [
  ['usual','Drinks usually take fifteen minutes, so leave extra time.','One visit gives no evidence about the usual wait.'],
  ['today','Our drinks took fifteen minutes that day, so I’d allow some extra time if you’re on a tight schedule.','It keeps the time and makes clear it was one visit. The advice helps students with a short break.'],
  ['food','We waited fifteen minutes for our food and drinks, so order as soon as you arrive.','The observation times the drinks only. It gives no waiting time for food.']
 ],{original:'On our visit, the drinks took fifteen minutes to arrive.',context:'Your readers are students planning a quick lunch.'})
];

const master = practice('pedagogy-q-014', 'Which extract would you publish for these readers?', 'caption-and-seats', [
 ['caption-and-seats','The clips have captions, so you can follow the stories. If you need to sit, ask a guide about seating: the back room had just two benches, and both were taken when we went.','It gives readers the benefit they need, makes the seating advice practical and limits the criticism to the room and visit.'],
 ['all-rooms','The captioned clips are easy to follow, but seats fill up quickly in every room. Ask a guide where to sit.','The captions and advice fit, but the notes only describe the two benches in the back room.'],
 ['broad-praise','It’s worth going for the local history. The benches were taken when we visited, so ask about seating if you need to sit.','The seating advice fits. The praise misses the detail these readers need to decide whether they can follow the clips.']
 ],{context:'A student newsletter is reviewing a local history centre for a group that wants to follow the filmed stories without relying on sound. Some group members also need to sit during visits. All clips have captions. The back room had two benches and both were taken during your visit. A guide was available to answer questions.'});

const writing = {
 'pedagogy-task-017': {
  question:'Write 45–65 words for the school newsletter. Explain what students can do and what makes the instructions easy to follow. Describe the crowding exactly as you saw it and give advice based on that observation.',
  example:'Turning a handle to move a model crane made the exhibition fun to try. The labels broke the instructions into short steps. During our afternoon visit, the two displays near the entrance were crowded. If you want to try those displays, check how busy they are when you arrive.',
  checks:['I described the crane and what made the labels easy to follow.','I kept the crowding to two entrance displays during my afternoon visit.','My advice follows from what I observed.'],
  checkIds:['crane-and-labels','crowding-scope','evidence-based-advice']
 },
 'pedagogy-task-007': {
  example:'The staff greeted us warmly when we arrived and found a table for our group. The grilled sandwiches arrived warm, with crisp bread.'
 },
 'pedagogy-task-010': {
  question:'Write for the school website. Aim for 35–55 words in the review itself. The editor’s note is separate from that target.\n1. In the editor’s note, name one misleading expression and explain why it is misleading.\n2. Rewrite the review using the supplied observations. Give a reason to visit, describe the exact problem with the signs and suggest who would enjoy the exhibition.',
  requiredEditorNote:true,
  modelNote:'“Useless” overstates what happened. The problem was reading two signs near the exit in low light.',
  example:'Comparing early cameras with modern ones makes this exhibition a good choice for students interested in photography. The low light made two signs near the exit hard to read during my visit, but I’d still recommend the display to anyone curious about how cameras have changed.',
  checks:['My separate editor’s note explains one misleading expression.','I kept the number, location and low-light problem for the signs.','I recommended the display to readers who would enjoy comparing cameras.'],
  checkIds:['separate-note','sign-details','camera-readers']
 }
};
const byId = new Map(revised.map(item=>[item.id,item]));

export function refineExpressionForStaff(course) {
 const reviseWriting = task => writing[task.id] ? {...task,...writing[task.id],version:task.version+1} : task;
 return {...course,
  practice:course.practice.map(activity=>({...activity,items:activity.items.map(item=>byId.get(item.id)??item)})),
  analysis:master,
  gold:course.gold.map(reviseWriting),
  apply:course.apply.map(reviseWriting),
  master:reviseWriting(course.master)
 };
}
