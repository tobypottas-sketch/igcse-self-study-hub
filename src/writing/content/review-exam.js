import {editing,editingModels} from './review-editing.js';

const pair=(before,after,prompt,principle)=>({before,after,prompt,principle});
const q=(prompt,answer,options,explanations)=>({prompt,answer,options,explanations,rationale:explanations[answer]});
const card=(id,level,title,items)=>({id:'exam-'+id,level,title,type:'choice',items});
const prompt=(context,requirements)=>context+' '+requirements+' Write 120–160 words.';
const review=(id,title,context,requirements,example)=>({id,title,prompt:prompt(context,requirements),example});
const planChecks=['I identified the audience and purpose.','My notes cover the required content with relevant ideas.','I planned two judgements with evidence and a supported recommendation.','The sequence is manageable in 120–160 words.'];
const plan=(title,context,requirements,example)=>({title,prompt:prompt(context,requirements),question:'Use short notes or bullets. Identify the audience and purpose, plan two judgements with evidence, then outline your recommendation and the order of ideas.',example,min:8,plan:true,allowKeep:true,checks:planChecks});

const cafe=review('cafe','A café near school','Your school magazine wants reviews of places to eat after lessons. You visited a café near school.','Describe the food and seating, evaluate value, and recommend it to suitable readers.',
`I tried Cedar Café after lessons on Friday with two friends. It is close to the school gate, so we reached it easily without taking a bus. There are shared tables inside and a few seats by the window for smaller groups.

I ordered a grilled vegetable wrap and a bowl of soup. The wrap was crisp and generously filled, and the soup made it a satisfying meal. At ¥34 together, they cost less than two separate dishes at the café near the station. Our table was near the queue, though, and it was hard to hear each other when people were ordering.

I would recommend Cedar Café to students looking for a filling meal after school. If you want a quiet place to talk, try the window seats away from the counter.`);
const film=review('film','An unexpected film','Your school website is featuring films that teenagers might enjoy. Review a film you recently watched.','Describe its premise without giving away the ending, evaluate two aspects and explain who would enjoy it.',
`In The Last Ferry, a teenager misses the final boat home and spends an unexpected night helping a stranger return a lost suitcase. The story begins with a simple mistake, but it gradually becomes a mystery about why the suitcase matters.

The strongest feature is the acting. The two leads initially seem uncomfortable together, and their growing trust feels believable because we see it develop through small decisions. The pace is uneven, however. In the middle, several scenes repeat the same clue without moving the story forward. The quiet soundtrack works better, particularly when the pair reach the empty ferry terminal.

I would recommend the film to students who enjoy mysteries that reveal clues gradually. Viewers looking for constant action may find it slow, but anyone interested in believable characters should give it a try.`);
const museum=review('museum','A museum worth visiting','Your school magazine is collecting ideas for weekend visits. Review a museum or exhibition you visited.','Describe what teenagers can do, evaluate how easy it is to learn there, and explain whether you would recommend it.',
`I spent Saturday morning at the Harbour Museum, where displays show how ships and cargo once moved through the city. The most interesting room contains a model harbour that visitors can operate using a set of switches.

I learned more from moving the model cranes than from reading the labels, because I could see why ships had to wait for a clear space at the dock. The instructions beside the switches were short and easy to follow. However, the room became crowded when a tour group arrived, so some visitors only had time to watch before moving on.

I would recommend the museum to teenagers who like finding out how things work. If you go with friends, allow extra time for the model harbour so everyone gets a chance to use the controls.`);

export const examMocks=[
 review('food-market','A food market for teenagers','Your school blog wants reviews of places to eat with friends at the weekend. Review a food market you visited.','Describe what visitors can eat, evaluate the choice and prices, and say who would enjoy the market.',
 `I visited the weekend food market by the river with two friends. Stalls sold everything from hand-pulled noodles to fruit pancakes, so we could each choose something different and still eat together at the shared tables.

The noodle stall offered the best value. A bowl cost ¥25 and the portion was large enough for lunch. Some drinks cost almost as much as the food, so I would bring water if you are trying to save money. I appreciated the signs that listed ingredients clearly, although finding a seat was difficult at midday.

I would recommend the market to groups of students with different tastes. Each person can decide how much to spend, and nobody has to agree on a single menu. Go earlier than we did if you want to sit together.`),
 review('performance','A live performance','Your school newsletter is reviewing local entertainment. Review a live performance you attended.','Describe the event, evaluate what worked well and what could improve, and recommend it to a suitable audience.',
 `Last Friday I saw a youth theatre group perform a short comedy about neighbours who accidentally swap their shopping bags. The story was easy to follow, and the small stage made it feel as if the actors were speaking directly to us.

The actors’ timing was the best part. They left enough silence after each misunderstanding for the audience to work out the joke. However, the music between scenes was much louder than the dialogue, which made the changes feel abrupt. A lower volume would have kept the attention on the story.

I would recommend the performance to students who want a relaxed evening with friends. It lasts just over an hour, and you can enjoy the jokes even if you have never seen a play before. Sit away from the speakers if you can.`),
 review('game','A game to play with friends','Your student magazine is featuring games for small groups. Review a game you have played.','Explain how it works, evaluate how well it suits a group, and say who would get the most from it.',
 `In Bridge Builders, each team uses a small set of cards to connect two islands. Players take turns placing a card, but they have to agree on a route before they can finish the bridge. The rules are short enough to explain while everyone is getting ready.

The game works well with friends because each player notices different routes. In one round, a teammate spotted a shortcut that saved our last card. However, with five players, quieter people sometimes waited a long time to speak. Our second round worked better when we invited everyone to suggest an idea before deciding.

I would recommend it to small groups who enjoy solving problems together. It is particularly good when you have half an hour and want a game that everyone can learn quickly.`),
 review('workshop','Learning a new skill','Your school magazine is featuring interesting activities for teenagers. Review a workshop where you learned a new skill.','Describe what you did, evaluate how useful and enjoyable it was, and say who would benefit.',
 `I joined a weekend bike repair workshop at our community centre. We began by taking a wheel off a spare bike and finding a puncture with a bowl of water. Then we worked in pairs to repair an inner tube with a patch.

The workshop was useful because the instructor demonstrated each step before asking us to repeat it. When my patch lifted at the edge, she showed me how to press it down firmly, so I could finish the repair myself. Working in pairs also made it enjoyable, although there were too few pumps and we had to wait to test our wheels.

I would recommend the workshop to teenagers who cycle regularly and want to fix simple problems without going to a shop. You can use the workshop bikes, so beginners do not need to bring their own.`)
];

const examInvestigations={
  "Riverside Café": [
    [
      "How does the opening establish a reason for visiting that matters to student readers?",
      "The birthday context establishes a social visit, so atmosphere and welcome matter alongside food."
    ],
    [
      "Which part of the brief does the menu and price information address? Explain how it serves students.",
      "The food description and reasonable prices address the café and its food, with affordability relevant to students."
    ],
    [
      "How does the writer answer what impressed or disappointed them without making the evaluation one-sided?",
      "The crowded room and drinks delay are qualified by polite service, enjoyable food and a quiet corner."
    ],
    [
      "How does the recommendation answer the brief more precisely than simply saying yes?",
      "It identifies students seeking an affordable meeting place and gives timing advice linked to crowding."
    ]
  ],
  "Willow Kitchen": [
    [
      "How does this opening establish the situation in the brief and the relevance of price?",
      "The visit after badminton with friends fits the scenario; distance and meals under forty yuan help student readers."
    ],
    [
      "Which two food details develop the evaluation rather than merely naming a dish?",
      "Juicy chicken, crunchy cucumber and a filling portion explain the experience; the separate sauce adds another relevant observation."
    ],
    [
      "How do the waiting time and music help readers decide whether to visit?",
      "The twenty-minute queue and difficulty talking establish limitations for students with limited time or wanting conversation."
    ],
    [
      "How does the ending use the writer's earlier evaluation to help different readers?",
      "The affordable filling lunch suits hungry students; visiting before the rush addresses the desire for quiet conversation."
    ]
  ],
  "Beyond the Stars": [
    [
      "How much of the film's story does the opening tell, and why is that enough for the task?",
      "It identifies two explorers separated from their crew and gives an initial judgement without retelling the plot."
    ],
    [
      "How does this paragraph meet the requirement to evaluate a strength?",
      "Realistic arguments and quiet conversations show how believable characters are developed."
    ],
    [
      "Which evidence supports the criticism, and which detail prevents it from becoming a blanket judgement?",
      "The abandoned-station sequence supports the pacing criticism; the soundtrack creates tension later."
    ],
    [
      "How does the ending address both suitable and less suitable viewers?",
      "It recommends believable character stories to students and qualifies the verdict for action fans."
    ]
  ],
  "The Lost City": [
    [
      "How does the opening describe the story without spending too many words on plot?",
      "The photographer, hidden map and summer investigation establish the premise while leaving room for evaluation."
    ],
    [
      "How does the writer address likes and dislikes with specific evidence?",
      "The vivid markets and villages support praise of setting, while similar minor characters explain the difficulty following conversations."
    ],
    [
      "How does the last paragraph answer who would enjoy the book while taking account of its weakness?",
      "Short chapters and discoveries support the recommendation to students interested in accessible adventure fiction."
    ]
  ],
  "Summer Sound": [
    [
      "How does the opening establish the event and its relevance to the school magazine?",
      "It identifies a local festival featuring young musicians and a visit with classmates."
    ],
    [
      "Which details answer the requirement to describe the festival without becoming a long list?",
      "The three stages, range of music and between-concert activities establish what visitors can do."
    ],
    [
      "How does the writer evaluate the experience rather than simply report events?",
      "Audience dancing supports praise, while the water queues explain discomfort in the heat."
    ],
    [
      "Is the value judgement fully supported by the review? What would strengthen it?",
      "The music and activities support enjoyment, but a price or included-cost detail would better support excellent value. The practical advice addresses crowding and water."
    ]
  ],
  "Skyline Adventure Park": [
    [
      "How does the opening establish both the subject and the needs of a youth-website reader?",
      "The question addresses young readers seeking an outing, and the range of challenges establishes the attraction."
    ],
    [
      "How does the paragraph combine description of facilities with evaluation?",
      "The low course and zip line describe facilities; careful demonstrations explain why nervous visitors could participate."
    ],
    [
      "How do the cost and café details help fulfil the evaluation requirement?",
      "Included equipment and attempts qualify the expensive entry, while limited affordable food matters to young visitors."
    ],
    [
      "How does the recommendation respond to the visit rather than give generic advice?",
      "It targets adventurous friends and suggests a packed lunch in response to café prices; morning booking is extra practical advice."
    ]
  ],
  "Pixel Quest": [
    [
      "How does the opening address the gameplay requirement without overexplaining rules?",
      "The robot, laboratories, tools and puzzles give enough premise to understand the later evaluation."
    ],
    [
      "How does the example of magnets and platforms support the judgement about design?",
      "The example illustrates how combining previously learned skills makes solving puzzles rewarding."
    ],
    [
      "How does this criticism help students judge the game's suitability?",
      "Unclear advanced instructions may cause inexperienced players to repeat unsuccessful actions, a specific rather than general weakness."
    ],
    [
      "How does the ending answer the recommendation requirement for distinct student interests?",
      "It targets problem-solvers rather than high-score competitors and mentions short levels for occasional play."
    ]
  ],
  "The Science Discovery Centre": [
    [
      "How does the opening establish a judgement about learning, as required by the task?",
      "The comparison between experiments and textbook reading provides an evaluative focus for the visit."
    ],
    [
      "Which examples explain what students can learn, and how does the writer qualify the evaluation?",
      "Bridge building, light experiments and programming illustrate hands-on learning; clear explanations aid beginners but crowding limits access."
    ],
    [
      "How does the final advice follow from the learning evaluation?",
      "It recommends the centre to students who find science difficult and suggests a weekday to gain more independent experiment time."
    ]
  ]
};
export const examModels=Object.fromEntries(Object.entries(editingModels).map(([title,notes])=>[title,notes.map((note,index)=>({phrase:note.phrase,min:6,prompt:examInvestigations[title][index][0],rationale:examInvestigations[title][index][1]}))]));

export const modelContext={
 'Riverside Café':['Students looking for somewhere to meet','School magazine'],
 'Willow Kitchen':['Students choosing lunch near school','School magazine'],
 'Beyond the Stars':['Students choosing a film','School magazine'],
 'The Lost City':['Students interested in fiction','School website'],
 'Summer Sound':['Young music fans','School magazine'],
 'Skyline Adventure Park':['Students choosing an outing','Youth website'],
 'Pixel Quest':['Students choosing a game','School website'],
 'The Science Discovery Centre':['Students considering a museum visit','School magazine']
};

export const exam={
 title:'Exam Mastery',number:'06',
 passes:editing.passes,
 companions:[
  ['Understand the task','Identify the subject, reader and required judgements.','Check which details the reader needs.'],
  ['Read like an examiner','Compare the whole review with the task.','Trace the evidence and the effect of language separately.'],
  ['Make every idea count','Select evidence for your judgements.','Give every planned idea a purpose.'],
  ['Build independence','Draft independently before comparing your work.','Try the reduced support as you move through the workshops.'],
  ['Show what you can do','Plan briefly, write independently and submit your own review.','Review the response after submitting.']
 ],
 discover:[
  pair('Task: Review a climbing workshop for the school website. Opening: Our area has many places to play sport.','Task: Review a climbing workshop for the school website. Opening: I tried a beginner climbing workshop, and the coaching made the first climb feel manageable.','Which opening prepares the reader for the required review, and why?','The second names the experience and signals an evaluation. The first introduces sport generally without establishing the subject.'),
  pair('Task: Describe the food and evaluate value. The noodles were served hot and the vegetables stayed crisp.','Task: Describe the food and evaluate value. The noodles arrived hot and crisp vegetables added texture. At ¥28 for a generous bowl, it was a filling lunch at a reasonable price.','Which requirement does the shorter extract leave out?','Both describe the food clearly. Only the second relates price and portion to a judgement about value.'),
  pair('The venue has screens, sofas, tables and charging points.','The charging points beside the sofas meant we could wait for our train without running down our phones.','Which gives the reader a stronger reason to visit?','The specific detail becomes useful when the writer explains its effect. A list supplies breadth but leaves the judgement to the reader.'),
  pair('The course costs ¥180. The equipment and individual support make it worthwhile.','The course costs ¥180. It could be worth saving for if you want individual coaching, especially since equipment is included.','How does the second version take student readers into account?','It acknowledges the expense and identifies who would benefit enough to pay it. Audience changes the judgement as well as the tone.'),
  pair('The acoustical attributes, notwithstanding certain positional limitations, were extraordinarily advantageous to the viewing experience.','Although the back seats had a limited view, I could still hear every line clearly.','Which version communicates a more usable judgement and how?','The second uses contrast and precise observations with clear scope. Range works best when it serves meaning and stays under control.')
 ],
 practice:[
  card('decode','Bronze','Decode the question',[
   q('School website: Review a holiday sports workshop. Describe the activities, evaluate coaching and explain who would benefit. Which plan covers the task?',1,['List the activities, describe the venue and recommend it to everyone.','Describe the activities, evaluate the coaching and identify suitable participants.','Explain whether the sport is popular, evaluate facilities and suggest another workshop.'],['The venue can be relevant, but coaching and a suitable audience are missing.','This covers all three requirements without dictating a paragraph structure.','This shifts attention away from the workshop and its coaching.']),
   q('School magazine: Review a film and explain whether it suits younger viewers. Which reader need should drive the judgement?',2,['How it compares with the director’s other films.','How much money the film made on release.','How easily younger viewers can follow and enjoy it.'],['A comparison might help another brief, but it does not directly answer suitability.','Popularity does not establish suitability.','The judgement should address the specified audience.']),
   q('School blog: Review a café for students meeting after lessons. Identify the purpose most closely.',0,['Help students decide whether it suits a meetup.','Persuade the café owner to change its menu.','Tell families how to prepare the food at home.'],['The review helps its readers decide whether to visit.','This would be closer to a letter of feedback.','Recipes do not fulfil the review task.']),
   q('Review an adventure game. Describe its gameplay and evaluate how suitable it is for beginners. What must the response include?',2,['A full account of the ending and final level.','A ranking against every similar game.','A judgement about how new players get started.'],['The ending is unnecessary for assessing accessibility.','A ranking is not requested and takes space.','The learning curve directly addresses the suitability criterion.'])
  ]),
  card('evidence','Bronze','Select relevant evidence',[
   q('Which evidence best supports good value for teenage museum visitors?',1,['The entrance sign is large and the café opens early.','The ¥40 entry includes several hours of hands-on experiments.','The museum has three floors and stands beside a bus stop.'],['These facts help with finding the site and planning arrival.','Price and included activities give a basis for evaluating value.','Location and size do not establish what the price buys.']),
   q('Which observation best supports a claim that a workshop helps beginners?',0,['The tutor demonstrated the first step and checked each practice attempt.','The workshop took place on Saturday and ended before lunch.','The room held six tables and had a noticeboard near the door.'],['Demonstration and feedback support a judgement about learning.','Timing is useful for planning, but does not show teaching quality.','Room details do not establish support for beginners.']),
   q('Which evidence is strongest for a review of a film’s pace?',2,['The cinema was nearly full at the Saturday screening.','The two main characters wore contrasting costumes.','The middle scenes repeated one clue without advancing the search.'],['Attendance is separate from the pace of the story.','Costume may support a visual judgement.','The repeated clue explains where momentum slowed.']),
   q('Which detail best supports recommending a café to students with short breaks?',1,['There were posters from local artists on the walls.','The takeaway lunch set was served in five minutes.','The café changed its menu at the start of each month.'],['Décor could support atmosphere but not speed.','The observed five-minute wait relates directly to a short break.','Menu variety does not establish quick service.'])
  ]),
  card('plans','Silver','Evaluate competing plans',[
   q('Review a film for the school website. Outline the premise, evaluate acting and pace, and identify suitable viewers. Which plan is most manageable?',0,['Brief premise; an acting detail and one slow scene; recommend to character-focused viewers.','Describe the plot in order; mention acting; recommend to everyone who likes films.','Explain the opening in detail; assess pace; rank the film against two other releases.'],['It covers both evaluations with room for evidence and ties the verdict to the audience.','Retelling takes space and leaves pace and audience underdeveloped.','It omits acting and spends space on rankings outside the brief.']),
   q('Review a market. Describe available food, evaluate cost and recommend it to suitable visitors. Which plan supports the verdict?',2,['Describe the busiest stall and list prices; say the market is worth visiting.','List all the stalls and opening times; suggest everyone arrives early.','Compare two meal prices and portions; explain which option suits students on a budget.'],['Prices need a comparison or consequence before they support the verdict.','A list does not evaluate cost.','Price and portion support a value judgement and a recommendation for a defined reader.']),
   q('Review an outdoor event. Explain what you did, evaluate organisation and recommend it. Which plan best connects evaluation to advice?',1,['Describe all activities; mention the signs; recommend it to all visitors.','Describe one activity; explain how signs affected queues; advise when to arrive.','Focus on ticket design; list every queue; recommend whichever event costs least.'],['The signs need a clear effect and the verdict needs a reason.','The advice follows from what the writer observed about organisation.','Design and an unsupported price comparison distract from the brief.']),
   q('Review a book for classmates. Describe its subject, evaluate its accessibility and say who might enjoy it. Which plan uses the word range wisely?',0,['Brief subject; show how short chapters helped reading; name readers who would benefit.','Explain every chapter; praise the style; repeat the title in the final sentence.','Give the author’s biography; compare covers; recommend it as a gift.'],['Each point serves a task requirement and leaves room to develop a judgement.','Summary crowds out evaluation and recommendation.','The planned evidence does not address accessibility.'])
  ]),
  card('decisions','Silver','Make examination decisions',[
   q('Your 135-word review covers activities and facilities, but the task also asks who would benefit. What should you do with little time left?',2,['Replace several everyday adjectives with longer ones.','Repeat the task wording in a new introductory sentence.','Add a concise recommendation tied to your evidence.'],['Vocabulary polish does not address the missing requirement.','Repeating the task uses time without answering it.','This fills the most important gap using evidence already developed.']),
   q('You are at 174 words. Your review repeats a description of the café and includes one unique detail that supports its value. What is the best cut?',0,['Trim the repeated description and retain the value detail.','Remove the value detail and keep both descriptions.','Delete the recommendation and the intended reader.'],['This reduces length while protecting evidence needed by the task.','It sacrifices a useful reason while leaving duplication.','The cut would weaken an essential part of the response.']),
   q('Your ending says the film suits teenagers, but you have time to make one edit. The review explains the short running time and simple mystery. Which edit is most useful?',1,['Add a stronger synonym for excellent to the opening.','Identify viewers who want a short, easy-to-follow mystery.','Add a list of the actors and the director.'],['The adjective leaves the broad recommendation unchanged.','It supports a specific verdict with evidence already in the review.','Credits are less useful than improving the recommendation.']),
   q('You have a complete draft, but two long sentences make its main evaluation difficult to follow. What should you prioritise?',2,['Add another example before revising the evaluation.','Rewrite the introduction in a more elaborate style.','Clarify the sentence boundaries in the evaluation.'],['More content may make the passage harder to follow.','The main difficulty is in the evaluation.','The reader can follow your judgement once its sentence boundaries are clear.'])
  ])
 ],
 goldTitle:'Plan independently',
 gold:[
  plan('Technology exhibition','Your school newsletter is reviewing technology exhibitions. Review an exhibition you visited.','Describe one activity, evaluate how well visitors could learn and decide who would benefit.','Readers: students choosing a visit\nPurpose: judge learning value\nStart: robot controls\nUseful: demonstration before practice\nDrawback: shared equipment, short turns\nVerdict: beginners with time to wait'),
  plan('School holiday course','Your school website is featuring holiday courses for teenagers. Review a course you attended.','Describe the sessions, evaluate the quality of instruction and value, and recommend it to suitable readers.','Readers: teenagers choosing courses\nPurpose: judge tuition and value\nStart: three drawing sessions\nSupport: tutor demonstrated shading\nValue: price includes materials\nVerdict: beginners without equipment')
 ],
 apply:[{...cafe,guided:true},film,{...museum,timer:true}],
 analysis:[
  q('A student website asks you to review a holiday art course, evaluate teaching and recommend it. Which content must your plan include?',1,['An art history summary and a list of materials.','A judgement on the teaching and who should attend.','A comparison of prices for unrelated holiday activities.'],['Background cannot replace evaluation.','Both requested decisions are covered.','Other activities do not address the course itself.']),
  q('Which observation best supports saying the art course suits beginners?',2,['The building opened ten years ago.','The class was on the second floor.','The tutor showed each step before students tried it.'],['The building’s age does not describe teaching.','Location does not show suitability.','A clear demonstration supports a judgement about learning.']),
  q('The draft already describes the art course, but ends “Everyone should try it.” What first edit best fulfils the task?',0,['Name a suitable group and connect that advice to the teaching.','Replace “try” with a more impressive verb.','Add a sentence describing the classroom windows.'],['A specific reader and reason make the recommendation useful.','Word choice alone leaves the advice overbroad.','The windows do not establish who would benefit.'])
 ]
};
