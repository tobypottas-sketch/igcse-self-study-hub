// Original Academy practice material.
const option = (text, feedback) => ({text, feedback});
const choice = (prompt, answer, ...alternatives) => ({
 prompt, answer, options: alternatives.map(x => x.text),
 explanations: alternatives.map(x => x.feedback), rationale: alternatives[answer].feedback
});
const lesson = (prompt, before, after, principle) => ({prompt, before, after, principle});
const activity = (id, level, title, items, type = 'choice') => ({id, level, title, items, type});
const writing = (title, prompt, question, example, checks, min = 18) => ({title, prompt, question, example, checks, min});

export const pathways = {
 structure: {
  discover: [
   lesson('What does the second opening help readers understand?', 'The queues were long and the lighting was good. I would visit again.', 'Our photography club visited North Hall’s evening exhibition to try taking portraits indoors.', 'Name the experience and establish the angle. The reader can now judge why the lighting and queues mattered.'),
   lesson('Which detail has moved closer to the judgement it supports?', 'The court hire costs ¥40. The changing rooms are small. Four players can share the court fee.', 'The court hire costs ¥40, which works out at ¥10 each for four players. The small changing rooms are a separate issue.', 'Develop one point before moving on. Group the price and how it is shared under value.'),
   lesson('How does the ending use the evidence about noise?', 'The music was loud at lunch. I’d recommend this café to students.', 'The affordable lunch makes the café a good meeting spot for friends. For quiet revision, I’d go elsewhere during lunch.', 'Make the final judgement follow from the evidence. Introduce, describe, evaluate and recommend are useful moves that can share a paragraph.')
  ],
  practice: [
   activity('structure-focus', 'Bronze', 'Find the paragraph focus', [
    choice('Seats can be booked together online. At the venue, row letters are visible from the entrance, and an usher directs groups to their seats. Which heading fits all three details?', 1,
     option('Choosing and reserving seats in advance', 'Booking explains the first detail only. The signs and usher matter after arrival.'),
     option('Getting a group seated', 'This covers the reader’s experience from booking together to finding the right row.'),
     option('Getting practical help from venue staff', 'This fits the usher, but the booking and signs work independently of staff.')),
    choice('A paragraph argues that beginners can start kayaking without buying equipment. Which detail belongs with that argument?', 0,
     option('Paddle and life jacket hire are included.', 'This connects the cost of entry to what a first-time visitor needs.'),
     option('The coach checks everyone’s paddling technique.', 'This helps explain the quality of coaching, a separate point from equipment cost.'),
     option('The pool has a shallow practice area.', 'This supports a point about confidence or safety when learning.'))
   ]),
   activity('structure-order', 'Bronze', 'Rebuild a paragraph', [{
    prompt: 'Order the sentences so both references have a clear meaning.',
    options: ['That extra time meant we could eat before the next screening.', 'We collected our tickets at the small desk by the entrance.', 'The whole process took two minutes, leaving us twenty minutes to spare.'],
    answer: [1,2,0], rationale: 'Establish the ticket collection first. “The whole process” refers to collecting tickets, and “that extra time” refers to the twenty minutes left over.'
   },{
    prompt: 'Order the sentences so the sign, the mistake and its consequence are introduced in a logical sequence.',
    options: ['As a result, we missed the first five minutes of the tour.', 'At the entrance, a sign pointed to the old meeting room.', 'Following that sign took us to the wrong floor.'],
    answer: [1,2,0], rationale: 'Introduce the sign before referring to it. Give the consequence after explaining the mistake.'
   }], 'order'),
   activity('structure-plan', 'Silver', 'Organise the writer’s notes', [
    choice('Your school review answers two questions: Can we get there after lessons? What will we learn? A gallery is near the bus stop, closes at five, uses student guides and has replica tools you can handle. What grouping answers both questions?', 2,
     option('Bus stop and guides together; closing time and replica tools together.', 'Each paragraph would split a practical detail from the other detail that makes it useful.'),
     option('Bus stop and tools together; closing time and guides together.', 'This mixes travel and learning in the first paragraph, then repeats the mix in the second.'),
     option('Bus stop and closing time together; guides and replica tools together.', 'Readers can first judge whether a visit fits their schedule, then consider what they will learn.'))
   ]),
   activity('structure-diagnose', 'Silver', 'Diagnose the break in flow', [
    choice('“You can borrow a racket at reception. The court lights are bright enough for evening practice. A deposit is returned when you bring the racket back.” Where should the middle sentence go if this paragraph explains how to borrow equipment?', 1,
     option('First, before the reception detail.', 'This separates the borrowing details less, but it still opens the paragraph on a different subject.'),
     option('Into a paragraph about the courts.', 'This keeps collection and return together and puts lighting beside other details about playing.'),
     option('Last, immediately after the deposit detail.', 'It keeps the process together but leaves the paragraph ending on an unrelated point.'))
   ])
  ],
  gold: writing('Edit a weak review', 'The hall is five minutes from the station. I would recommend arriving early. The rehearsal room has mirrors. It took twenty minutes to collect our booking. The mirrors helped our group check our timing.', 'Write two short paragraphs for a school club. Group access and booking together, then evaluate the room. Place the advice beside its reason.', 'The hall is five minutes from the station, but collecting our booking took twenty minutes, so I’d arrive early.\n\nThe rehearsal room suited our group. Its mirrors helped us check our timing as we practised together.', ['I kept the access and booking facts together.', 'I developed the point about the room as another idea.', 'My advice follows from the delay.'], 30),
  apply: [
   writing('Turn notes into a plan', 'Local aquarium. School newsletter. Notes: entry takes fifteen minutes; opens at ten; feeding talk starts at 10:15; clear explanations; you can watch the fish feed.', 'Write a two-part review plan in sentences. Group details by when to arrive and what makes the talk worth attending.', 'First, explain why visitors should arrive as the aquarium opens: entry takes fifteen minutes and the talk starts at 10:15. Then describe what makes the talk worthwhile: the presenter explains the feeding clearly while visitors watch the fish.', ['Each group of notes answers a different reader question.', 'I placed the timing details together.', 'I linked the activity to its value.']),
   writing('Reconnect a paragraph', 'The last bus leaves at seven. The VR centre offers short beginner sessions. During each session you can ask the instructor to pause the game. The centre is beside the bus stop.', 'Write a coherent paragraph evaluating the centre for a nervous first-time player. Keep the two facts that develop this focus.', 'The VR centre makes it easy for beginners to try a short session. You can ask the instructor to pause the game at any point, which gives nervous players time to get used to the controls.', ['Each fact supports the paragraph focus.', 'The two sentences develop one idea.', 'I explained why a feature matters.']),
   writing('Write the final judgement', 'A sports centre offers affordable coaching. Beginners share equipment and may wait for a turn. Your readers are students looking for a low-cost introduction to the sport.', 'Write the final paragraph. Connect your recommendation to the strengths and limitations already discussed.', 'I’d recommend the centre to students who want to try the sport without spending much. The coaching is affordable, though beginners should be prepared to wait for a turn with the equipment.', ['My recommendation follows the supplied evidence.', 'I named the readers who would benefit.', 'I included the relevant limitation.'])
  ],
  analysis: choice('A review of a school theatre includes reserving seats, sightlines, collecting tickets and hearing dialogue. Which split helps readers plan a group visit and judge the experience?', 1,
   option('Reserving seats with hearing dialogue; collecting tickets with sightlines.', 'This separates the two practical steps and splits the details about watching.'),
   option('Reserving seats with collecting tickets; sightlines with hearing dialogue.', 'The first group explains what to do before the show. The second evaluates what students can see and hear.'),
   option('Reserving seats with sightlines; collecting tickets with hearing dialogue.', 'Both paragraphs would switch between organising a visit and watching the show.')),
  master: writing('Reorganise a recording-booth review', 'The microphone picked up my voice clearly. Take your booking email to the main desk for the key. People talking in the corridor could sometimes be heard in the booth. I recommend it for a short practice recording. Book it online the day before.', 'Identify the main organisation problem briefly, then rewrite the review for students preparing a podcast. Use two focused paragraphs and keep every fact.', 'Access instructions and recording conditions are mixed.\n\nBook the booth online the day before and take your booking email to the main desk to collect the key.\n\nThe microphone picked up my voice clearly, although corridor conversations sometimes carried into the booth. I’d recommend it for a short practice recording.', ['I explained the organisational problem.', 'I kept related details together.', 'The final recommendation follows the evidence.'], 35)
 },
 expression: {
  discover: [
   lesson('Which exact aspect of the seat does the revision evaluate?', 'The seat was quite nice.', 'The seat supported my lower back throughout the film.', 'Precise language names what made the experience good. The reader learns about support rather than the appearance or size of the seat.'),
   lesson('What does the second suggestion promise, and what does it leave open?', 'You’ll definitely love the film.', 'If you enjoy slow-building mysteries, this film is worth a look.', 'Match your recommendation to the audience. An engaging school magazine review can sound friendly without claiming that everyone will agree.'),
   lesson('What information would “the café is noisy” lose?', 'The café gets noisy at lunchtime.', 'The café can get rather loud around midday.', 'A rewrite can vary wording and still preserve time, strength and implication. Check the details before choosing a more expressive word.')
  ],
  practice: [
   activity('expression-precision', 'Bronze', 'Choose the precise description', [
    choice('The seat was firm and kept my back upright. Which word most specifically describes that effect?', 2,
     option('Spacious', 'Spacious describes the amount of room. It says little about posture.'),
     option('Comfortable', 'Comfortable describes the overall feeling and could refer to softness or space.'),
     option('Supportive', 'Supportive describes how the seat holds the body in position.')),
    choice('The lights dim slowly from bright white to almost nothing. Which word describes the change itself?', 0,
     option('Gradual', 'Gradual describes a change that happens little by little.'),
     option('Subtle', 'Subtle describes how easily someone notices a change. This change spans a wide range.'),
     option('Smooth', 'Smooth means there are no abrupt jumps. It does not specify the pace.'))
   ]),
   activity('expression-collocation', 'Bronze', 'Find a natural combination', [
    choice('Complete the review sentence with the usual phrase for a performance that affected you emotionally. “It was a ___ moving performance.”', 1,
     option('highly', 'Highly works with judgements such as “highly effective”. “Highly moving” is less idiomatic here.'),
     option('deeply', 'Deeply combines naturally with moving to express the strength of the emotional effect.'),
     option('strongly', 'Strongly often modifies verbs such as “recommend” or “disagree”. It is less natural before “moving”.')),
    choice('The room became busier over twenty minutes. Which verb is the natural choice for the process? “The room gradually ___.”', 2,
     option('packed out', 'People can pack out a room. The room can be packed out, but the active subject here is the room.'),
     option('built up', 'A crowd can build up. The room is the space being occupied.'),
     option('filled up', 'Rooms and other spaces fill up as people arrive.'))
   ]),
   activity('expression-meaning', 'Silver', 'Preserve the original meaning', [
    choice('“We could hear some dialogue from the back, but quieter lines were hard to catch.” Which edit keeps the extent of the problem?', 0,
     option('From the back, softer lines were harder to make out.', 'This keeps the limitation focused on softer lines and preserves the location.'),
     option('From the back, the dialogue was barely audible.', 'This extends the problem to almost all the dialogue.'),
     option('The actors spoke too quietly in several scenes.', 'This assigns a cause to the actors. The original only says what visitors at the back could hear.'))
   ]),
   activity('expression-register', 'Silver', 'Write for a school magazine', [
    choice('Your school magazine addresses students directly in a friendly, measured voice. Which ending best fits that voice while keeping the advice conditional?', 1,
     option('Students seeking a demanding storyline may wish to consider this production.', 'This is measured and conditional, but the impersonal wording feels distant for a student magazine.'),
     option('Give this film a try if you enjoy a story that takes time to piece together.', 'This addresses students directly and gives them a clear condition for the recommendation.'),
     option('You’re going to love figuring out what happens in this film.', 'This is friendly, but it assumes every reader will enjoy the same experience.'))
   ])
  ],
  gold: writing('Rewrite the cinema review', 'The seats were really nice and the sound was nice too. The ticket was ridiculously expensive. Facts: the seats supported your back; every line was audible from your seat; the ticket cost ¥65, ¥15 more than at your usual cinema.', 'Rewrite for a school magazine in two or three sentences. Keep the specific facts and express the price criticism in proportion.', 'The seats gave my back plenty of support, and I could make out every line from my seat. At ¥65, though, the ticket cost ¥15 more than I usually pay.', ['I replaced vague praise with supplied details.', 'I kept the price comparison accurate.', 'The criticism is measured and natural.'], 24),
  apply: [
   writing('Replace vague praise', '“The café was nice and the sandwiches were good.” The staff greeted your group on arrival and found a table for you. The grilled sandwiches arrived warm and the bread was crisp.', 'Write two precise sentences for the school magazine using only observations from the visit.', 'The staff made us feel welcome by greeting us at the door and finding a table for our group. The grilled sandwiches arrived warm, with crisp bread.', ['I described what made the welcome positive.', 'I used a precise food description.', 'I kept the supplied observations.']),
   writing('Measure the criticism', '“The festival was bad because the queues were long, but the music was good.” Three bands drew students onto the dance floor. You waited twenty minutes for water at midday.', 'Rewrite the evaluation. Keep the criticism specific to the water queue at midday and use the observation about the bands.', 'Three bands got students dancing, which gave the festival a lively atmosphere. The main drawback for us was waiting twenty minutes for water at midday.', ['I kept the time and scope of the criticism.', 'I replaced vague praise with an observation.', 'My tone is suitable for a school publication.']),
   writing('Adapt to your readers', '“This game is sick and you guys gotta play it.” It is a puzzle game and each level adds a new rule that changes how you solve it.', 'Make a friendly recommendation for the school website. Explain which students would enjoy it and why.', 'Give this puzzle game a try if you enjoy working out unfamiliar rules. Each level adds a new rule, so you have to adapt your approach as you play.', ['I identified likely readers.', 'My wording is friendly and appropriate.', 'I explained the appeal using the supplied fact.'])
  ],
  analysis: choice('“At peak times, the tour commentary was difficult to hear near the entrance.” Which edit changes the degree of criticism while keeping its scope?', 2,
   option('Near the entrance, it was hard to make out the commentary at busy times.', 'The degree remains similar: “hard to make out” keeps the difficulty without implying silence.'),
   option('Near the entrance, the commentary was hard to hear throughout the day.', 'This widens the time period. The original only mentions peak times.'),
   option('Near the entrance, the commentary was almost inaudible at peak times.', '“Almost inaudible” makes the problem more serious while retaining the location and time.')),
  master: writing('Edit an exhibition review', '“The exhibition was amazing and the signs were honestly useless. You guys should definitely go.” The display let visitors compare early cameras with modern ones. Two signs near the exit were difficult to read in low light. The school website is publishing the review.', 'Name one misleading expression. Rewrite the review extract in 35–55 words, giving accurate praise, measured criticism and a recommendation for a suitable reader.', '“Useless” overstates the problem. The display lets you compare early cameras with modern ones, so I’d recommend it to students interested in photography. Two signs near the exit were difficult to read in the low light.', ['I identified wording that overstated or obscured a fact.', 'I used precise and natural language.', 'My criticism and recommendation match the evidence.'], 30)
 },
 development: {
  discover: [
   lesson('What can the reader picture in the second version?', 'The staff made the climbing session easy to follow.', 'The instructor demonstrated how to clip onto the rope, then watched us try it before we climbed.', 'Evidence gives the reader an observation they can use to judge the opinion.'),
   lesson('What does the second version explain about the visitor’s experience?', 'The game has five-minute levels.', 'Because levels take about five minutes, I could finish a round on the bus without leaving it unfinished.', 'Impact explains why a feature matters. Opinion, reason, evidence and impact are prompts for thinking and can be combined in one sentence.'),
   lesson('Which readers gain most from the feature, and who might prefer another option?', 'It is a good place for anyone to study.', 'The group tables are useful for discussing projects, but the room gets noisy after lessons, so I’d use it for group work rather than quiet revision.', 'A convincing recommendation weighs the evidence against what a reader wants from the experience.')
  ],
  practice: [
   activity('development-support', 'Bronze', 'Support a judgement', [
    choice('You argue that the climbing session made beginners feel safe. Which observation best supports that judgement?', 0,
     option('The instructor checked each beginner’s harness.', 'A personal equipment check directly supports your judgement about safety.'),
     option('The instructor offered two routes with different difficulty levels.', 'This supports choice and progression, but does not show how beginners were kept safe.'),
     option('The instructor explained where to queue for each route.', 'This shows the session was organised. The connection to safety is less direct.'))
   ]),
   activity('development-specific', 'Bronze', 'Find specific evidence', [
    choice('You call the museum layout easy to follow. Which observation best lets the reader check your claim about finding the next room?', 2,
     option('Large labels introduce the main displays in every room.', 'This helps readers imagine the displays but explains what to read inside a room.'),
     option('A large map beside reception shows the layout of all four floors.', 'This is specific, but it describes planning the visit from one spot.'),
     option('Doorway arrows point to the next numbered room.', 'This shows exactly how visitors know where to go as they move through the museum.'))
   ]),
   activity('development-impact', 'Silver', 'Explain the impact', [
    choice('A film club posts the running time and finishing time of each screening. Your readers catch the last bus at different times. Which explanation develops the most relevant impact?', 1,
     option('The running time helps viewers decide if they can concentrate from the opening to the final scene.', 'This is plausible, but it addresses attention rather than arrangements for getting home.'),
     option('Students can compare the finishing time with their own bus schedule and leave time to walk to the stop.', 'This explains how the advertised time helps the intended readers make a practical decision.'),
     option('The timings help students decide how many films they can see in one evening.', 'This follows from the information, but it does not address the stated constraint.'))
   ]),
   activity('development-balance', 'Silver', 'Weigh a strength and drawback', [
    choice('At a festival, the bands kept the crowd dancing, but visitors queued half an hour for water in the midday heat. Which sentence explains a specific impact of both observations?', 2,
     option('The bands kept the crowd dancing through the afternoon, although the half-hour queues for drinking water were disappointing at midday.', 'This illustrates the bands’ impact, but it gives a general reaction to the queues.'),
     option('Despite the half-hour queues for water in the heat, the excellent bands made the festival worthwhile.', 'This gives an overall verdict, but it does not develop the separate impacts.'),
     option('The bands kept us dancing, but we struggled to cool down while queuing for water.', 'This explains how the music affected the crowd and why the wait mattered in the heat.'))
   ])
  ],
  gold: writing('Develop and justify a verdict', 'A repair workshop lends tools and demonstrates each repair before students try it. There are eight workbenches for sixteen visitors, so partners take turns. Your readers are students who want to learn to fix a bike.', 'Write 40–65 words for the school website. Develop an opinion about the workshop, explain the effect of one limitation and recommend it to suitable readers.', 'The workshop is a good introduction to basic repairs because the leader demonstrates each step and lends you the necessary tools. Sharing a bench means you spend some of the session watching your partner. I would still recommend it to beginners who want to try simple repairs before buying tools.', ['I gave a judgement and a relevant observation.', 'I explained a specific effect on a visitor.', 'My recommendation weighs the limitation.'], 32),
  apply: [
   writing('Support your opinion', 'Our meals arrived within ten minutes. We had a thirty-minute lunch break and the walk back to school took five minutes.', 'Develop a judgement about the service for students choosing a place for lunch. Explain how the timing affected your group.', 'The quick service made the café a practical choice during our short lunch break. With our meals arriving within ten minutes, we could finish eating and still allow five minutes for the walk back to school.', ['I stated a clear judgement about the service.', 'I used the observation about waiting time.', 'I explained its practical effect.']),
   writing('Explain a drawback', 'The tutorial explains basic controls. In advanced challenges, it gives no clue that two switches must be pressed together. Players often retry each switch separately.', 'Write two or three sentences explaining why the advanced instructions could frustrate new players.', 'The tutorial is less helpful once the advanced challenges begin. It never explains that the switches work together, so new players can waste time pressing them separately and thinking they have missed a step.', ['I named the specific drawback.', 'I used the example about the switches.', 'I explained the effect on new players.']),
   writing('Build a balanced verdict', 'A free community sports event offers helpful coaching and equipment to borrow. Popular sessions fill up in the first fifteen minutes.', 'Write a short recommendation for beginners. Explain what makes the event accessible and give advice that addresses the drawback.', 'I’d recommend the event to beginners because you can get advice and try a sport without buying equipment. For the popular sessions, arrive as the event opens: places can go within the first fifteen minutes.', ['My recommendation identifies who benefits.', 'I explained how coaching or equipment helps.', 'My advice follows from the booking evidence.'])
  ],
  analysis: choice('A free robotics showcase lends kits. The demonstration starts at 4:30 and the practical session starts at 5:15. Your readers can leave school at four but need to catch a 5:30 bus. Which recommendation weighs the limits of their visit most accurately?', 2,
   option('Go for the practical session because borrowing a kit means you can start without bringing anything.', 'Borrowing a kit is useful, but the late start leaves little time for the session.'),
   option('Go to both parts because the demonstration and practical session each start before your bus leaves.', 'Both start before the bus, but fifteen minutes may not be enough to take part and reach the bus.'),
   option('Go for the demonstration and save the hands-on session for a day when you can stay longer.', 'This gives students a reason to visit while taking account of the time needed for practical work.')),
  master: writing('Evaluate a night market for first-time visitors', 'Stall numbers match a map by the entrance. Menus list common allergens. A live band plays by the gate. At 7 p.m. we waited twenty minutes at the busiest food stall. A second line sold the same snacks with a five-minute wait.', 'Write 40–65 words for students planning a short visit after school. Select useful evidence, explain its effect on their visit and make a justified recommendation.', 'The market is worth a short visit if you use the map by the entrance to find the stalls you want. At seven, we waited twenty minutes at the busiest food stall, but a second line served the same snacks in five minutes. Check both lines before joining a queue.', ['I chose evidence that matters on a short visit.', 'I explained a consequence readers can use.', 'My recommendation follows the observations.'], 32)
 }
};
