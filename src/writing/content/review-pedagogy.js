// Original Academy practice material.
const option = (text, feedback) => ({text, feedback});
const choice = (id, optionIds, prompt, answer, ...alternatives) => ({id, optionIds,
 prompt, answer, options: alternatives.map(x => x.text),
 explanations: alternatives.map(x => x.feedback), rationale: alternatives[answer].feedback
});
const lesson = (id, prompt, before, after, principle) => ({id, prompt, before, after, principle});
const activity = (id, level, title, items, type = 'choice') => ({id, level, title, items, type});
const writing = (id, title, prompt, question, example, checkIds, checks, min = 18) => ({id, version:1, title, prompt, question, example, checkIds, checks, min, allowKeep:true});

export const pathways = {
 structure: {
  discover: [
   lesson("pedagogy-observation-001", 'What does the second opening help readers understand?', 'The queues were long and the lighting was good. I would visit again.', 'Our photography club visited North Hall’s evening exhibition to try taking portraits indoors.', 'Name the experience and establish the angle. The reader can now judge why the lighting and queues mattered.'),
   lesson("pedagogy-observation-002", 'Which detail has moved closer to the judgement it supports?', 'The court hire costs ¥40. The changing rooms are small. Four players can share the court fee.', 'The court hire costs ¥40, which works out at ¥10 each for four players. The small changing rooms are a separate issue.', 'Develop one point before moving on. Group the price and how it is shared under value.'),
   lesson("pedagogy-observation-003", 'How does the ending use the evidence about noise?', 'The music was loud at lunch. I’d recommend this café to students.', 'The affordable lunch makes the café a good meeting spot for friends. For quiet revision, I’d go elsewhere during lunch.', 'Make the final judgement follow from the evidence. Introduce, describe, evaluate and recommend are useful moves that can share a paragraph.')
  ],
  practice: [
   activity('structure-focus', 'Bronze', 'Find the paragraph focus', [
    choice("pedagogy-q-001", ["option-a","option-b","option-c"], 'Seats can be booked together online. At the venue, row letters are visible from the entrance, and an usher directs groups to their seats. Which heading fits all three details?', 1,
     option('Choosing and reserving seats in advance', 'Booking explains the first detail only. The signs and usher matter after arrival.'),
     option('Getting a group seated', 'This covers the reader’s experience from booking together to finding the right row.'),
     option('Getting practical help from venue staff', 'This fits the usher, but the booking and signs work independently of staff.')),
    choice("pedagogy-q-002", ["option-a","option-b","option-c"], 'A paragraph argues that beginners can start kayaking without buying equipment. Which detail belongs with that argument?', 0,
     option('Paddle and life jacket hire are included.', 'This connects the cost of entry to what a first-time visitor needs.'),
     option('The coach checks everyone’s paddling technique.', 'This helps explain the quality of coaching, a separate point from equipment cost.'),
     option('The pool has a shallow practice area.', 'This supports a point about confidence or safety when learning.'))
   ]),
   activity('structure-order', 'Bronze', 'Rebuild a paragraph', [{id:"pedagogy-q-003", optionIds:["option-a","option-b","option-c"],
    prompt: 'Order the sentences so both references have a clear meaning.',
    options: ['That extra time meant we could eat before the next screening.', 'We collected our tickets at the small desk by the entrance.', 'The whole process took two minutes, leaving us twenty minutes to spare.'],
    answer: [1,2,0], rationale: 'Establish the ticket collection first. “The whole process” refers to collecting tickets, and “that extra time” refers to the twenty minutes left over.'
   },{id:"pedagogy-q-004", optionIds:["option-a","option-b","option-c"],
    prompt: 'Order the sentences so the sign, the mistake and its consequence are introduced in a logical sequence.',
    options: ['As a result, we missed the first five minutes of the tour.', 'At the entrance, a sign pointed to the old meeting room.', 'Following that sign took us to the wrong floor.'],
    answer: [1,2,0], rationale: 'Introduce the sign before referring to it. Give the consequence after explaining the mistake.'
   }], 'order'),
   activity('structure-plan', 'Silver', 'Organise the writer’s notes', [
    choice("pedagogy-q-005", ["option-a","option-b","option-c"], 'Your school review answers two questions: Can we get there after lessons? What will we learn? A gallery is near the bus stop, closes at five, uses student guides and has replica tools you can handle. What grouping answers both questions?', 2,
     option('Bus stop and guides together; closing time and replica tools together.', 'Each paragraph would split a practical detail from the other detail that makes it useful.'),
     option('Bus stop and tools together; closing time and guides together.', 'This mixes travel and learning in the first paragraph, then repeats the mix in the second.'),
     option('Bus stop and closing time together; guides and replica tools together.', 'Readers can first judge whether a visit fits their schedule, then consider what they will learn.'))
   ]),
   activity('structure-diagnose', 'Silver', 'Diagnose the break in flow', [
    choice("pedagogy-q-006", ["option-a","option-b","option-c"], '“You can borrow a racket at reception. The court lights are bright enough for evening practice. A deposit is returned when you bring the racket back.” Where should the middle sentence go if this paragraph explains how to borrow equipment?', 1,
     option('First, before the reception detail.', 'This separates the borrowing details less, but it still opens the paragraph on a different subject.'),
     option('Into a paragraph about the courts.', 'This keeps collection and return together and puts lighting beside other details about playing.'),
     option('Last, immediately after the deposit detail.', 'It keeps the process together but leaves the paragraph ending on an unrelated point.'))
   ])
  ],
  gold: writing("pedagogy-task-001", 'Edit a weak review', 'The hall is five minutes from the station. I would recommend arriving early. The rehearsal room has mirrors. It took twenty minutes to collect our booking. The mirrors helped our group check our timing.', 'Write two short paragraphs for a school club. Group access and booking together, then evaluate the room. Place the advice beside its reason.', 'The hall is five minutes from the station, but collecting our booking took twenty minutes, so I’d arrive early.\n\nThe rehearsal room suited our group. Its mirrors helped us check our timing as we practised together.', ["criterion-a","criterion-b","criterion-c"], ['I kept the access and booking facts together.', 'I developed the point about the room as another idea.', 'My advice follows from the delay.'], 30),
  apply: [
   writing("pedagogy-task-002", 'Turn notes into a plan', 'Local aquarium. School newsletter. Notes: entry takes fifteen minutes; opens at ten; feeding talk starts at 10:15; clear explanations; you can watch the fish feed.', 'Write a two-part review plan in sentences. Group details by when to arrive and what makes the talk worth attending.', 'First, explain why visitors should arrive as the aquarium opens: entry takes fifteen minutes and the talk starts at 10:15. Then describe what makes the talk worthwhile: the presenter explains the feeding clearly while visitors watch the fish.', ["criterion-a","criterion-b","criterion-c"], ['Each group of notes answers a different reader question.', 'I placed the timing details together.', 'I linked the activity to its value.']),
   writing("pedagogy-task-003", 'Reconnect a paragraph', 'The last bus leaves at seven. The VR centre offers short beginner sessions. During each session you can ask the instructor to pause the game. The centre is beside the bus stop.', 'Write a coherent paragraph evaluating the centre for a nervous first-time player. Keep the two facts that develop this focus.', 'The VR centre makes it easy for beginners to try a short session. You can ask the instructor to pause the game at any point, which gives nervous players time to get used to the controls.', ["criterion-a","criterion-b","criterion-c"], ['Each fact supports the paragraph focus.', 'The two sentences develop one idea.', 'I explained why a feature matters.']),
   writing("pedagogy-task-004", 'Write the final judgement', 'A sports centre offers affordable coaching. Beginners share equipment and may wait for a turn. Your readers are students looking for a low-cost introduction to the sport.', 'Write the final paragraph. Connect your recommendation to the strengths and limitations already discussed.', 'I’d recommend the centre to students who want to try the sport without spending much. The coaching is affordable, though beginners should be prepared to wait for a turn with the equipment.', ["criterion-a","criterion-b","criterion-c"], ['My recommendation follows the supplied evidence.', 'I named the readers who would benefit.', 'I included the relevant limitation.'])
  ],
  analysis: choice("pedagogy-q-007", ["option-a","option-b","option-c"], 'A review of a school theatre includes reserving seats, sightlines, collecting tickets and hearing dialogue. Which split helps readers plan a group visit and judge the experience?', 1,
   option('Reserving seats with hearing dialogue; collecting tickets with sightlines.', 'This separates the two practical steps and splits the details about watching.'),
   option('Reserving seats with collecting tickets; sightlines with hearing dialogue.', 'The first group explains what to do before the show. The second evaluates what students can see and hear.'),
   option('Reserving seats with sightlines; collecting tickets with hearing dialogue.', 'Both paragraphs would switch between organising a visit and watching the show.')),
  master: writing("pedagogy-task-005", 'Reorganise a recording-booth review', 'The microphone picked up my voice clearly. Take your booking email to the main desk for the key. People talking in the corridor could sometimes be heard in the booth. I recommend it for a short practice recording. Book it online the day before.', 'Identify the main organisation problem briefly, then rewrite the review for students preparing a podcast. Use two focused paragraphs and keep every fact.', 'Access instructions and recording conditions are mixed.\n\nBook the booth online the day before and take your booking email to the main desk to collect the key.\n\nThe microphone picked up my voice clearly, although corridor conversations sometimes carried into the booth. I’d recommend it for a short practice recording.', ["criterion-a","criterion-b","criterion-c"], ['I explained the organisational problem.', 'I kept related details together.', 'The final recommendation follows the evidence.'], 35)
 },
 expression: {
  discover: [
   lesson("pedagogy-observation-004", 'Which exact aspect of the seat does the revision evaluate?', 'The seat was quite nice.', 'The seat supported my lower back throughout the film.', 'Precise language names what made the experience good. The reader learns about support rather than the appearance or size of the seat.'),
   lesson("pedagogy-observation-005", 'What does the second suggestion promise, and what does it leave open?', 'You’ll definitely love the film.', 'If you enjoy slow-building mysteries, this film is worth a look.', 'Match your recommendation to the audience. An engaging school magazine review can sound friendly without claiming that everyone will agree.'),
   lesson("pedagogy-observation-006", 'What information would “the café is noisy” lose?', 'The café gets noisy at lunchtime.', 'The café can get rather loud around midday.', 'A rewrite can vary wording and still preserve time, strength and implication. Check the details before choosing a more expressive word.')
  ],
  practice: [
   activity('expression-precision', 'Bronze', 'Choose the precise description', [
    choice("pedagogy-q-008", ["option-a","option-b","option-c"], 'The seat was firm and kept my back upright. Which word most specifically describes that effect?', 2,
     option('Spacious', 'Spacious describes the amount of room. It says little about posture.'),
     option('Comfortable', 'Comfortable describes the overall feeling and could refer to softness or space.'),
     option('Supportive', 'Supportive describes how the seat holds the body in position.')),
    choice("pedagogy-q-009", ["option-a","option-b","option-c"], 'The lights dim slowly from bright white to almost nothing. Which word describes the change itself?', 0,
     option('Gradual', 'Gradual describes a change that happens little by little.'),
     option('Subtle', 'Subtle describes how easily someone notices a change. This change spans a wide range.'),
     option('Smooth', 'Smooth means there are no abrupt jumps. It does not specify the pace.'))
   ]),
   activity('expression-collocation', 'Bronze', 'Find a natural combination', [
    choice("pedagogy-q-010", ["option-a","option-b","option-c"], 'Complete the review sentence with the usual phrase for a performance that affected you emotionally. “It was a ___ moving performance.”', 1,
     option('highly', 'Highly works with judgements such as “highly effective”. “Highly moving” is less idiomatic here.'),
     option('deeply', 'Deeply combines naturally with moving to express the strength of the emotional effect.'),
     option('strongly', 'Strongly often modifies verbs such as “recommend” or “disagree”. It is less natural before “moving”.')),
    choice("pedagogy-q-011", ["option-a","option-b","option-c"], 'The room became busier over twenty minutes. Which verb is the natural choice for the process? “The room gradually ___.”', 2,
     option('packed out', 'People can pack out a room. The room can be packed out, but the active subject here is the room.'),
     option('built up', 'A crowd can build up. The room is the space being occupied.'),
     option('filled up', 'Rooms and other spaces fill up as people arrive.'))
   ]),
   activity('expression-meaning', 'Silver', 'Preserve the original meaning', [
    choice("pedagogy-q-012", ["option-a","option-b","option-c"], '“We could hear some dialogue from the back, but quieter lines were hard to catch.” Which edit keeps the extent of the problem?', 0,
     option('From the back, softer lines were harder to make out.', 'This keeps the limitation focused on softer lines and preserves the location.'),
     option('From the back, the dialogue was barely audible.', 'This extends the problem to almost all the dialogue.'),
     option('The actors spoke too quietly in several scenes.', 'This assigns a cause to the actors. The original only says what visitors at the back could hear.'))
   ]),
   activity('expression-register', 'Silver', 'Write for a school magazine', [
    choice("pedagogy-q-013", ["option-a","option-b","option-c"], 'Your school magazine addresses students directly in a friendly, measured voice. Which ending best fits that voice while keeping the advice conditional?', 1,
     option('Students seeking a demanding storyline may wish to consider this production.', 'This is measured and conditional, but the impersonal wording feels distant for a student magazine.'),
     option('Give this film a try if you enjoy a story that takes time to piece together.', 'This addresses students directly and gives them a clear condition for the recommendation.'),
     option('You’re going to love figuring out what happens in this film.', 'This is friendly, but it assumes every reader will enjoy the same experience.'))
   ])
  ],
  gold: writing("pedagogy-task-006", 'Rewrite the cinema review', 'The seats were really nice and the sound was nice too. The ticket was ridiculously expensive. Facts: the seats supported your back; every line was audible from your seat; the ticket cost ¥65, ¥15 more than at your usual cinema.', 'Rewrite for a school magazine in two or three sentences. Keep the specific facts and express the price criticism in proportion.', 'The seats gave my back plenty of support, and I could make out every line from my seat. At ¥65, though, the ticket cost ¥15 more than I usually pay.', ["criterion-a","criterion-b","criterion-c"], ['I replaced vague praise with supplied details.', 'I kept the price comparison accurate.', 'The criticism is measured and natural.'], 24),
  apply: [
   writing("pedagogy-task-007", 'Replace vague praise', '“The café was nice and the sandwiches were good.” The staff greeted your group on arrival and found a table for you. The grilled sandwiches arrived warm and the bread was crisp.', 'Write two precise sentences for the school magazine using only observations from the visit.', 'The staff made us feel welcome by greeting us at the door and finding a table for our group. The grilled sandwiches arrived warm, with crisp bread.', ["criterion-a","criterion-b","criterion-c"], ['I described what made the welcome positive.', 'I used a precise food description.', 'I kept the supplied observations.']),
   writing("pedagogy-task-008", 'Measure the criticism', '“The festival was bad because the queues were long, but the music was good.” Three bands drew students onto the dance floor. You waited twenty minutes for water at midday.', 'Rewrite the evaluation. Keep the criticism specific to the water queue at midday and use the observation about the bands.', 'Three bands got students dancing, which gave the festival a lively atmosphere. The main drawback for us was waiting twenty minutes for water at midday.', ["criterion-a","criterion-b","criterion-c"], ['I kept the time and scope of the criticism.', 'I replaced vague praise with an observation.', 'My tone is suitable for a school publication.']),
   writing("pedagogy-task-009", 'Adapt to your readers', '“This game is sick and you guys gotta play it.” It is a puzzle game and each level adds a new rule that changes how you solve it.', 'Make a friendly recommendation for the school website. Explain which students would enjoy it and why.', 'Give this puzzle game a try if you enjoy working out unfamiliar rules. Each level adds a new rule, so you have to adapt your approach as you play.', ["criterion-a","criterion-b","criterion-c"], ['I identified likely readers.', 'My wording is friendly and appropriate.', 'I explained the appeal using the supplied fact.'])
  ],
  analysis: choice("pedagogy-q-014", ["option-a","option-b","option-c"], '“At peak times, the tour commentary was difficult to hear near the entrance.” Which edit changes the degree of criticism while keeping its scope?', 2,
   option('Near the entrance, it was hard to make out the commentary at busy times.', 'The degree remains similar: “hard to make out” keeps the difficulty without implying silence.'),
   option('Near the entrance, the commentary was hard to hear throughout the day.', 'This widens the time period. The original only mentions peak times.'),
   option('Near the entrance, the commentary was almost inaudible at peak times.', '“Almost inaudible” makes the problem more serious while retaining the location and time.')),
  master: writing("pedagogy-task-010", 'Edit an exhibition review', '“The exhibition was amazing and the signs were honestly useless. You guys should definitely go.” The display let visitors compare early cameras with modern ones. Two signs near the exit were difficult to read in low light. The school website is publishing the review.', 'Name one misleading expression. Rewrite the review extract in 35–55 words, giving accurate praise, measured criticism and a recommendation for a suitable reader.', '“Useless” overstates the problem. The display lets you compare early cameras with modern ones, so I’d recommend it to students interested in photography. Two signs near the exit were difficult to read in the low light.', ["criterion-a","criterion-b","criterion-c"], ['I identified wording that overstated or obscured a fact.', 'I used precise and natural language.', 'My criticism and recommendation match the evidence.'], 30)
 },
 development: {
  discover: [
   lesson("pedagogy-observation-007", 'What can the reader picture in the second version?', 'The staff made the climbing session easy to follow.', 'The instructor demonstrated how to clip onto the rope, then watched us try it before we climbed.', 'Evidence gives the reader an observation they can use to judge the opinion.'),
   lesson("pedagogy-observation-008", 'What does the second version explain about the visitor’s experience?', 'The game has five-minute levels.', 'Because levels take about five minutes, I could finish a round on the bus without leaving it unfinished.', 'Impact explains why a feature matters. Opinion, reason, evidence and impact are prompts for thinking and can be combined in one sentence.'),
   lesson("pedagogy-observation-009", 'Which readers gain most from the feature, and who might prefer another option?', 'It is a good place for anyone to study.', 'The group tables are useful for discussing projects, but the room gets noisy after lessons, so I’d use it for group work rather than quiet revision.', 'A convincing recommendation weighs the evidence against what a reader wants from the experience.')
  ],
  practice: [
   activity('development-support', 'Bronze', 'Support a judgement', [
    choice("pedagogy-q-015", ["option-a","option-b","option-c"], 'You argue that the climbing session made beginners feel safe. Which observation best supports that judgement?', 0,
     option('The instructor checked each beginner’s harness.', 'A personal equipment check directly supports your judgement about safety.'),
     option('The instructor offered two routes with different difficulty levels.', 'This supports choice and progression, but does not show how beginners were kept safe.'),
     option('The instructor explained where to queue for each route.', 'This shows the session was organised. The connection to safety is less direct.'))
   ]),
   activity('development-specific', 'Bronze', 'Find specific evidence', [
    choice("pedagogy-q-016", ["option-a","option-b","option-c"], 'You call the museum layout easy to follow. Which observation best lets the reader check your claim about finding the next room?', 2,
     option('Large labels introduce the main displays in every room.', 'This helps readers imagine the displays but explains what to read inside a room.'),
     option('A large map beside reception shows the layout of all four floors.', 'This is specific, but it describes planning the visit from one spot.'),
     option('Doorway arrows point to the next numbered room.', 'This shows exactly how visitors know where to go as they move through the museum.'))
   ]),
   activity('development-impact', 'Silver', 'Explain the impact', [
    choice("pedagogy-q-017", ["option-a","option-b","option-c"], 'A film club posts the running time and finishing time of each screening. Your readers catch the last bus at different times. Which explanation develops the most relevant impact?', 1,
     option('The running time helps viewers decide if they can concentrate from the opening to the final scene.', 'This is plausible, but it addresses attention rather than arrangements for getting home.'),
     option('Students can compare the finishing time with their own bus schedule and leave time to walk to the stop.', 'This explains how the advertised time helps the intended readers make a practical decision.'),
     option('The timings help students decide how many films they can see in one evening.', 'This follows from the information, but it does not address the stated constraint.'))
   ]),
   activity('development-balance', 'Silver', 'Weigh a strength and drawback', [
    choice("pedagogy-q-018", ["option-a","option-b","option-c"], 'At a festival, the bands kept the crowd dancing, but visitors queued half an hour for water in the midday heat. Which sentence explains a specific impact of both observations?', 2,
     option('The bands kept the crowd dancing through the afternoon, although the half-hour queues for drinking water were disappointing at midday.', 'This illustrates the bands’ impact, but it gives a general reaction to the queues.'),
     option('Despite the half-hour queues for water in the heat, the excellent bands made the festival worthwhile.', 'This gives an overall verdict, but it does not develop the separate impacts.'),
     option('The bands kept us dancing, but we struggled to cool down while queuing for water.', 'This explains how the music affected the crowd and why the wait mattered in the heat.'))
   ])
  ],
  gold: writing("pedagogy-task-011", 'Develop and justify a verdict', 'A repair workshop lends tools and demonstrates each repair before students try it. There are eight workbenches for sixteen visitors, so partners take turns. Your readers are students who want to learn to fix a bike.', 'Write 40–65 words for the school website. Develop an opinion about the workshop, explain the effect of one limitation and recommend it to suitable readers.', 'The workshop is a good introduction to basic repairs because the leader demonstrates each step and lends you the necessary tools. Sharing a bench means you spend some of the session watching your partner. I would still recommend it to beginners who want to try simple repairs before buying tools.', ["criterion-a","criterion-b","criterion-c"], ['I gave a judgement and a relevant observation.', 'I explained a specific effect on a visitor.', 'My recommendation weighs the limitation.'], 32),
  apply: [
   writing("pedagogy-task-012", 'Support your opinion', 'Our meals arrived within ten minutes. We had a thirty-minute lunch break and the walk back to school took five minutes.', 'Develop a judgement about the service for students choosing a place for lunch. Explain how the timing affected your group.', 'The quick service made the café a practical choice during our short lunch break. With our meals arriving within ten minutes, we could finish eating and still allow five minutes for the walk back to school.', ["criterion-a","criterion-b","criterion-c"], ['I stated a clear judgement about the service.', 'I used the observation about waiting time.', 'I explained its practical effect.']),
   writing("pedagogy-task-013", 'Explain a drawback', 'The tutorial explains basic controls. In advanced challenges, it gives no clue that two switches must be pressed together. Players often retry each switch separately.', 'Write two or three sentences explaining why the advanced instructions could frustrate new players.', 'The tutorial is less helpful once the advanced challenges begin. It never explains that the switches work together, so new players can waste time pressing them separately and thinking they have missed a step.', ["criterion-a","criterion-b","criterion-c"], ['I named the specific drawback.', 'I used the example about the switches.', 'I explained the effect on new players.']),
   writing("pedagogy-task-014", 'Build a balanced verdict', 'A free community sports event offers helpful coaching and equipment to borrow. Popular sessions fill up in the first fifteen minutes.', 'Write a short recommendation for beginners. Explain what makes the event accessible and give advice that addresses the drawback.', 'I’d recommend the event to beginners because you can get advice and try a sport without buying equipment. For the popular sessions, arrive as the event opens: places can go within the first fifteen minutes.', ["criterion-a","criterion-b","criterion-c"], ['My recommendation identifies who benefits.', 'I explained how coaching or equipment helps.', 'My advice follows from the booking evidence.'])
  ],
  analysis: choice("pedagogy-q-019", ["option-a","option-b","option-c"], 'A free robotics showcase lends kits. The demonstration starts at 4:30 and the practical session starts at 5:15. Your readers can leave school at four but need to catch a 5:30 bus. Which recommendation weighs the limits of their visit most accurately?', 2,
   option('Go for the practical session because borrowing a kit means you can start without bringing anything.', 'Borrowing a kit is useful, but the late start leaves little time for the session.'),
   option('Go to both parts because the demonstration and practical session each start before your bus leaves.', 'Both start before the bus, but fifteen minutes may not be enough to take part and reach the bus.'),
   option('Go for the demonstration and save the hands-on session for a day when you can stay longer.', 'This gives students a reason to visit while taking account of the time needed for practical work.')),
  master: writing("pedagogy-task-015", 'Evaluate a night market for first-time visitors', 'Stall numbers match a map by the entrance. Menus list common allergens. A live band plays by the gate. At 7 p.m. we waited twenty minutes at the busiest food stall. A second line sold the same snacks with a five-minute wait.', 'Write 40–65 words for students planning a short visit after school. Select useful evidence, explain its effect on their visit and make a justified recommendation.', 'The market is worth a short visit if you use the map by the entrance to find the stalls you want. At seven, we waited twenty minutes at the busiest food stall, but a second line served the same snacks in five minutes. Check both lines before joining a queue.', ["criterion-a","criterion-b","criterion-c"], ['I chose evidence that matters on a short visit.', 'I explained a consequence readers can use.', 'My recommendation follows the observations.'], 32)
 }
};

// Additional original practice: preserve existing challenge IDs and answer identities.
const extraPractice = {
  "structure-focus": [
    {id:"pedagogy-extra-q-1", optionIds:["option-a","option-b","option-c"],
      "prompt": "The paragraph evaluates how easily visitors can find their way around a library. Which detail belongs with that focus?",
      "answer": 1,
      "options": [
        "The library lends laptops for two hours.",
        "Colour-coded signs lead to each floor.",
        "The reading desks have adjustable lamps."
      ],
      "explanations": [
        "Laptop loans support a point about resources.",
        "The signs directly help readers navigate.",
        "Lighting supports a point about study conditions."
      ],
      "rationale": "The signs directly help readers navigate."
    },
    {id:"pedagogy-extra-q-2", optionIds:["option-a","option-b","option-c"],
      "prompt": "A review paragraph explains how the sports club helps nervous beginners. Which topic sentence covers a demonstration, a short practice and individual advice?",
      "answer": 0,
      "options": [
        "The coaching helps newcomers build confidence.",
        "The club provides a range of equipment for newcomers.",
        "The sessions suit people who prefer individual sports."
      ],
      "explanations": [
        "It covers all three coaching methods and their shared purpose.",
        "Equipment is not the focus of these details.",
        "Individual advice does not establish that the sport is individual."
      ],
      "rationale": "It covers all three coaching methods and their shared purpose."
    }
  ],
  "structure-order": [
    {id:"pedagogy-extra-q-3", optionIds:["option-a","option-b","option-c"],
      "prompt": "Arrange these observations so the reference and consequence are clear.",
      "options": [
        "This meant we could compare our answers immediately.",
        "The guide gave each pair a worksheet.",
        "After completing it, we discussed our results with another pair."
      ],
      "answer": [
        1,
        2,
        0
      ],
      "rationale": "Introduce the worksheet before referring to it, then explain the result of the discussion."
    },
    {id:"pedagogy-extra-q-4", optionIds:["option-a","option-b","option-c"],
      "prompt": "Order the sentences so the contrast and recommendation follow the evidence.",
      "options": [
        "For that reason, I would choose an earlier session.",
        "The climbing course was easy to book online.",
        "However, the afternoon session was so crowded that we had little practice time."
      ],
      "answer": [
        1,
        2,
        0
      ],
      "rationale": "Start with booking, introduce the crowding as a contrast, then use that drawback to justify the advice."
    }
  ],
  "structure-plan": [
    {id:"pedagogy-extra-q-5", optionIds:["option-a","option-b","option-c"],
      "prompt": "A student review must evaluate a theatre's ticket value and suitability for viewers with hearing difficulties. Notes: discounted tickets, captions at evening shows, free programme, clear speakers. Which organisation best answers both requirements?",
      "answer": 0,
      "options": [
        "Discount and free programme; captions and speakers.",
        "Discount and captions; free programme and speakers.",
        "Discount and speakers; free programme and captions."
      ],
      "explanations": [
        "One group evaluates what the ticket buys; the other evaluates access to dialogue.",
        "Both groups mix cost and hearing information.",
        "Both groups again split the evidence for each requirement."
      ],
      "rationale": "One group evaluates what the ticket buys; the other evaluates access to dialogue."
    },
    {id:"pedagogy-extra-q-6", optionIds:["option-a","option-b","option-c"],
      "prompt": "Your review describes a photography course and evaluates its teaching. Which plan gives the evaluation a clear purpose?",
      "answer": 1,
      "options": [
        "Describe each room, then list the course times and prices.",
        "Briefly describe the sessions, then connect the demonstration and feedback to what you learned.",
        "Describe the tutor's feedback first, then repeat it after describing each session."
      ],
      "explanations": [
        "Rooms and times can help planning but do not address teaching.",
        "The description establishes context and the learning details support the evaluation.",
        "Repeating the same detail takes space without developing the judgement."
      ],
      "rationale": "The description establishes context and the learning details support the evaluation."
    },
    {id:"pedagogy-extra-q-7", optionIds:["option-a","option-b","option-c"],
      "prompt": "A paragraph evaluates a café's suitability for revision: quiet seating, sockets and dim lighting. The next paragraph evaluates food prices. Where should the observation that lamps can be borrowed go?",
      "answer": 0,
      "options": [
        "With the seating, sockets and lighting.",
        "With the price of sandwiches and drinks.",
        "In the opening, before naming the café."
      ],
      "explanations": [
        "It qualifies the lighting drawback and supports the study-space evaluation.",
        "Borrowing a lamp does not establish food value.",
        "The opening would introduce a detail before its purpose is clear."
      ],
      "rationale": "It qualifies the lighting drawback and supports the study-space evaluation."
    }
  ],
  "structure-diagnose": [
    {id:"pedagogy-extra-q-8", optionIds:["option-a","option-b","option-c"],
      "prompt": "“The tutor explained the controls clearly. The entrance costs ¥30. We then managed to operate the camera independently.” Which edit best restores the teaching paragraph's flow?",
      "answer": 2,
      "options": [
        "Move the price before the tutor's explanation.",
        "Repeat the price after the final sentence.",
        "Move the price to the value paragraph."
      ],
      "explanations": [
        "The teaching sequence is intact, but the price remains outside its focus.",
        "Repeating the price introduces a second distraction.",
        "The explanation and independent practice stay connected as evidence of teaching."
      ],
      "rationale": "The explanation and independent practice stay connected as evidence of teaching."
    },
    {id:"pedagogy-extra-q-9", optionIds:["option-a","option-b","option-c"],
      "prompt": "“I recommend the café to students in a hurry. Our takeaway order arrived in five minutes. The seats beside the window were comfortable.” Which ending best follows the stated reason?",
      "answer": 1,
      "options": [
        "Keep all three sentences because each is positive.",
        "Keep the recommendation and quick order together; move the seating detail to the atmosphere paragraph.",
        "Move the quick order to the introduction and end with the seating."
      ],
      "explanations": [
        "The seating detail does not support the recommendation about speed.",
        "The evidence directly supports the verdict and seating has a different focus.",
        "Moving the evidence makes the recommendation harder to justify."
      ],
      "rationale": "The evidence directly supports the verdict and seating has a different focus."
    },
    {id:"pedagogy-extra-q-10", optionIds:["option-a","option-b","option-c"],
      "prompt": "A paragraph explains that the museum's labels are clear but its map is confusing. The next paragraph starts “This makes it ideal for first-time visitors.” What should the editor do?",
      "answer": 0,
      "options": [
        "Name the clear labels as the strength and qualify the judgement about the map.",
        "Move the sentence to the beginning without changing it.",
        "Add “Overall” before the sentence."
      ],
      "explanations": [
        "The edit resolves the unclear reference and acknowledges the drawback.",
        "Moving the sentence leaves its basis unclear.",
        "A connector alone does not establish what supports the recommendation."
      ],
      "rationale": "The edit resolves the unclear reference and acknowledges the drawback."
    }
  ],
  "expression-precision": [
    {id:"pedagogy-extra-q-11", optionIds:["option-a","option-b","option-c"],
      "prompt": "The coach noticed my mistake and suggested a small change that immediately helped. Which adjective best describes that feedback?",
      "answer": 0,
      "options": [
        "Constructive",
        "Encouraging",
        "Detailed"
      ],
      "explanations": [
        "Constructive feedback helps someone improve.",
        "Encouraging describes emotional support, not necessarily an actionable correction.",
        "Detailed describes amount of information; the suggestion here was small."
      ],
      "rationale": "Constructive feedback helps someone improve."
    },
    {id:"pedagogy-extra-q-12", optionIds:["option-a","option-b","option-c"],
      "prompt": "The bread broke with a light crunch but was not hard to bite. Which description is most precise?",
      "answer": 1,
      "options": [
        "Firm",
        "Crisp",
        "Tough"
      ],
      "explanations": [
        "Firm describes resistance to pressure, not the light crunch.",
        "Crisp captures the light crunchy texture.",
        "Tough suggests difficulty biting or chewing."
      ],
      "rationale": "Crisp captures the light crunchy texture."
    }
  ],
  "expression-collocation": [
    {id:"pedagogy-extra-q-13", optionIds:["option-a","option-b","option-c"],
      "prompt": "Which expression naturally describes a film whose pace remains interesting throughout?",
      "answer": 2,
      "options": [
        "Keeps the attention tightly",
        "Holds the concentration strongly",
        "Holds your attention"
      ],
      "explanations": [
        "The wording is unnatural for sustaining interest.",
        "Concentration is usually something a person maintains.",
        "Hold someone's attention is a natural expression for maintaining interest."
      ],
      "rationale": "Hold someone's attention is a natural expression for maintaining interest."
    },
    {id:"pedagogy-extra-q-14", optionIds:["option-a","option-b","option-c"],
      "prompt": "Which phrase naturally describes a course that costs little compared with what participants receive?",
      "answer": 1,
      "options": [
        "Offers a valuable price",
        "Offers good value",
        "Offers a worthy cost"
      ],
      "explanations": [
        "A price can be reasonable, but valuable price is not the usual combination.",
        "Good value links cost to benefits.",
        "Worthy cost is not a natural evaluation of price."
      ],
      "rationale": "Good value links cost to benefits."
    }
  ],
  "expression-meaning": [
    {id:"pedagogy-extra-q-15", optionIds:["option-a","option-b","option-c"],
      "prompt": "“Two exhibits were out of order during my visit.” Which edit preserves the scope and time?",
      "answer": 1,
      "options": [
        "Several exhibits are unreliable.",
        "Two exhibits were not working when I visited.",
        "Some exhibits have never worked properly."
      ],
      "explanations": [
        "This generalises beyond the visit and changes the number.",
        "This preserves both the number and the time.",
        "This invents a history of problems."
      ],
      "rationale": "This preserves both the number and the time."
    },
    {id:"pedagogy-extra-q-16", optionIds:["option-a","option-b","option-c"],
      "prompt": "“The guide occasionally spoke too quickly for me.” Which revision keeps the criticism measured?",
      "answer": 0,
      "options": [
        "At times, I struggled to keep up with the guide.",
        "The guide rushed through every explanation.",
        "Most visitors found the guide impossible to follow."
      ],
      "explanations": [
        "It retains occasional difficulty from the writer's perspective.",
        "Every explanation broadens the scope.",
        "This speaks for other visitors and intensifies the problem."
      ],
      "rationale": "It retains occasional difficulty from the writer's perspective."
    },
    {id:"pedagogy-extra-q-17", optionIds:["option-a","option-b","option-c"],
      "prompt": "“Students can borrow a tablet for up to an hour.” Which rewrite retains the limit?",
      "answer": 2,
      "options": [
        "Students can borrow tablets for an hour or more.",
        "Students must return tablets after exactly an hour.",
        "Students can borrow tablets for as long as an hour."
      ],
      "explanations": [
        "This extends the maximum.",
        "This changes a maximum into a fixed duration.",
        "The maximum remains one hour."
      ],
      "rationale": "The maximum remains one hour."
    }
  ],
  "expression-register": [
    {id:"pedagogy-extra-q-18", optionIds:["option-a","option-b","option-c"],
      "prompt": "A school magazine wants friendly but fair advice. Which sentence criticises crowded seating without attacking staff?",
      "answer": 1,
      "options": [
        "The staff clearly have no idea how to organise a room.",
        "Allow extra time to find a seat during the lunch rush.",
        "Prospective patrons should anticipate congestion in the dining premises."
      ],
      "explanations": [
        "It blames staff without evidence.",
        "It gives readers direct, measured advice.",
        "It communicates the issue but sounds unnecessarily formal for this audience."
      ],
      "rationale": "It gives readers direct, measured advice."
    },
    {id:"pedagogy-extra-q-19", optionIds:["option-a","option-b","option-c"],
      "prompt": "Which recommendation sounds natural in a school newsletter while acknowledging that the course is demanding?",
      "answer": 2,
      "options": [
        "This challenging course is compulsory viewing for all ambitious pupils.",
        "Participation may be considered by individuals possessing the requisite aptitude.",
        "Give it a try if you enjoy a challenge and have time to practise."
      ],
      "explanations": [
        "It overstates the recommendation and uses viewing for a course.",
        "It is unnecessarily impersonal and formal.",
        "It targets the right audience and keeps the condition clear."
      ],
      "rationale": "It targets the right audience and keeps the condition clear."
    },
    {id:"pedagogy-extra-q-20", optionIds:["option-a","option-b","option-c"],
      "prompt": "Which sentence fits a friendly review without exaggerating the observation that drinks took fifteen minutes?",
      "answer": 0,
      "options": [
        "Our drinks took fifteen minutes, so allow a little extra time.",
        "The service was an absolute disaster from start to finish.",
        "The establishment demonstrated unacceptable operational inefficiency."
      ],
      "explanations": [
        "It makes the criticism specific and useful.",
        "It exaggerates a limited delay.",
        "It makes a broad judgement in an unnecessarily formal register."
      ],
      "rationale": "It makes the criticism specific and useful."
    }
  ],
  "development-support": [
    {id:"pedagogy-extra-q-21", optionIds:["option-a","option-b","option-c"],
      "prompt": "You argue that a film makes its friendship believable. Which observation best supports that judgement?",
      "answer": 1,
      "options": [
        "The characters attend different schools and wear distinctive uniforms.",
        "The friends argue, then apologise.",
        "The film includes several classroom scenes showing everyday school life."
      ],
      "explanations": [
        "Costumes may establish setting, not the friendship.",
        "Their disagreement and response show a believable relationship.",
        "The setting alone does not establish how the friendship works."
      ],
      "rationale": "Their disagreement and response show a believable relationship."
    },
    {id:"pedagogy-extra-q-22", optionIds:["option-a","option-b","option-c"],
      "prompt": "You think a café offers good value for students. Which detail best supports that judgement?",
      "answer": 2,
      "options": [
        "The lunch menu changes weekly to offer students more variety.",
        "The café is a short walk from school and opens throughout the day.",
        "A ¥25 lunch includes food and a drink."
      ],
      "explanations": [
        "Variety may matter, but price and benefits are not established.",
        "Convenience is distinct from value for money.",
        "The price and what is included support the value judgement."
      ],
      "rationale": "The price and what is included support the value judgement."
    },
    {id:"pedagogy-extra-q-23", optionIds:["option-a","option-b","option-c"],
      "prompt": "You argue that a game is accessible to beginners. Which observation best supports the claim?",
      "answer": 0,
      "options": [
        "The first level teaches one control at a time.",
        "Later levels have colourful backgrounds that become increasingly detailed.",
        "Players can compare their scores with friends after completing each level."
      ],
      "explanations": [
        "The staged introduction helps newcomers learn.",
        "Visual design does not directly support accessibility.",
        "Competition does not establish ease of learning."
      ],
      "rationale": "The staged introduction helps newcomers learn."
    }
  ],
  "development-specific": [
    {id:"pedagogy-extra-q-24", optionIds:["option-a","option-b","option-c"],
      "prompt": "You describe a concert's sound as clear. Which observation gives the most specific evidence?",
      "answer": 1,
      "options": [
        "The speakers were positioned on stands at either side of the stage.",
        "I heard every lyric from the back row.",
        "The audience applauded enthusiastically after each of the opening songs."
      ],
      "explanations": [
        "Speaker location does not establish clarity.",
        "The writer's location and what they could hear substantiate the judgement.",
        "Applause may show enjoyment but not sound clarity."
      ],
      "rationale": "The writer's location and what they could hear substantiate the judgement."
    },
    {id:"pedagogy-extra-q-25", optionIds:["option-a","option-b","option-c"],
      "prompt": "You claim that a workshop gives individual support. Which observation makes this claim concrete?",
      "answer": 0,
      "options": [
        "The tutor corrected the proportions of my sketch.",
        "The tutor greeted each participant individually as they arrived at the studio.",
        "The tutor introduced the day's activities and demonstrated the materials to everyone."
      ],
      "explanations": [
        "The tutor's correction of one learner's work shows individual support.",
        "A greeting is welcoming but not teaching support.",
        "A group introduction is not individual feedback."
      ],
      "rationale": "The tutor's correction of one learner's work shows individual support."
    },
    {id:"pedagogy-extra-q-26", optionIds:["option-a","option-b","option-c"],
      "prompt": "You claim that an exhibition is interactive. Which detail most clearly demonstrates that?",
      "answer": 2,
      "options": [
        "The displays include large photographs showing bridges from several angles.",
        "The guide describes how different bridge designs spread the weight of vehicles.",
        "Visitors test the strength of a model bridge."
      ],
      "explanations": [
        "Photos are visual evidence, not interaction.",
        "Listening to a guide is not necessarily hands-on.",
        "Visitors actively change and test the model."
      ],
      "rationale": "Visitors actively change and test the model."
    }
  ],
  "development-impact": [
    {id:"pedagogy-extra-q-27", optionIds:["option-a","option-b","option-c"],
      "prompt": "A café serves takeaway meals in five minutes. Your readers have a twenty-minute lunch break. Which explanation develops the most relevant impact?",
      "answer": 0,
      "options": [
        "Students have time to eat and get back to class.",
        "Students have more opportunity to compare the takeaway packaging with other cafés.",
        "Students can choose which café has the most comfortable indoor seating."
      ],
      "explanations": [
        "The quick service directly helps students manage the short break.",
        "Packaging may matter but the waiting time does not establish its quality.",
        "Takeaway speed does not establish table availability."
      ],
      "rationale": "The quick service directly helps students manage the short break."
    },
    {id:"pedagogy-extra-q-28", optionIds:["option-a","option-b","option-c"],
      "prompt": "A museum includes written instructions beside each experiment. Which explanation best develops the benefit for visitors exploring without a guide?",
      "answer": 2,
      "options": [
        "The instructions make the displays look more organised and help the rooms feel less cluttered.",
        "The museum can include a wider variety of experiments in the available display space.",
        "Visitors can try experiments without a guide."
      ],
      "explanations": [
        "Visual organisation is not the main benefit for independent visitors.",
        "Instructions do not establish how many exhibits fit.",
        "The instructions support independent participation."
      ],
      "rationale": "The instructions support independent participation."
    },
    {id:"pedagogy-extra-q-29", optionIds:["option-a","option-b","option-c"],
      "prompt": "A game saves progress after every short level. Your readers often play while travelling. Which development is most useful?",
      "answer": 1,
      "options": [
        "Players can compare how attractive the menus are with those of other games.",
        "Players can stop at their destination without losing a completed level.",
        "Players can compare their scores with friends more often during their journeys."
      ],
      "explanations": [
        "Saving progress does not establish menu quality.",
        "This explains the practical effect for people with limited playing time.",
        "Saving progress does not necessarily support score sharing."
      ],
      "rationale": "This explains the practical effect for people with limited playing time."
    }
  ],
  "development-balance": [
    {id:"pedagogy-extra-q-30", optionIds:["option-a","option-b","option-c"],
      "prompt": "A £12 workshop includes tools, but participants share benches. Which evaluation weighs both facts for beginners?",
      "answer": 2,
      "options": [
        "Including tools in the price makes the workshop excellent value for everyone who attends.",
        "Sharing a bench makes the experience less useful for beginners, even though tools are included.",
        "Beginners needn't buy tools, but sharing may cut practice time."
      ],
      "explanations": [
        "The verdict ignores the limitation and broadens the audience.",
        "The drawback is stated, but the benefit of included tools is not developed.",
        "It explains both the financial advantage and the practical limitation."
      ],
      "rationale": "It explains both the financial advantage and the practical limitation."
    },
    {id:"pedagogy-extra-q-31", optionIds:["option-a","option-b","option-c"],
      "prompt": "A film has believable characters but a slow middle section. Which recommendation develops the balance for student readers?",
      "answer": 0,
      "options": [
        "Try it for the characters if you don't mind a slower middle.",
        "It is suitable for all students because the believable characters make the film worth seeing.",
        "Avoid it if you prefer fast-paced films, despite the quality of the character development."
      ],
      "explanations": [
        "It connects both observations to a suitable audience.",
        "It ignores the pacing limitation.",
        "It recognises a drawback but offers no positive target audience."
      ],
      "rationale": "It connects both observations to a suitable audience."
    },
    {id:"pedagogy-extra-q-32", optionIds:["option-a","option-b","option-c"],
      "prompt": "A free festival offers beginner sessions that fill within fifteen minutes. Which recommendation uses both observations?",
      "answer": 1,
      "options": [
        "The festival is free, so students should be able to join their preferred activity whenever they arrive.",
        "Beginners can try a sport for free, but should arrive early.",
        "Arriving early is important because the sessions are likely to become more expensive as the day goes on."
      ],
      "explanations": [
        "It ignores the limited places.",
        "It links the free access and limited availability to practical advice.",
        "The observations do not establish a later charge."
      ],
      "rationale": "It links the free access and limited availability to practical advice."
    }
  ]
};
for (const course of Object.values(pathways)) for (const activity of course.practice) activity.items.push(...(extraPractice[activity.id] ?? []));

// Two independent Gold workshops per pathway, using the existing shared renderer.
const additionalGold = {
 structure: writing("pedagogy-task-016", 'Organise a school trip review', 'Notes from a planetarium visit: the show began at 10:30; collecting tickets took fifteen minutes; the hall opens at ten; the presenter answered questions about planets; the seats at the back offered a clear view of the dome. Your audience is next year’s science club.', 'Write two focused paragraphs, one explaining how to arrive on time and one evaluating the show. Keep all five observations and connect your advice to the evidence.', 'The hall opens at ten and collecting tickets took fifteen minutes. I would arrive when it opens so there is enough time before the show starts at 10:30.\\n\\nThe show suited our science club because the presenter answered questions about planets. Even from the back, we had a clear view of the dome.', ["criterion-a","criterion-b","criterion-c"], ['I grouped arrival details logically.','I connected the advice to the timing.','I developed the show evaluation without losing facts.'], 32),
 expression: writing("pedagogy-task-017", 'Refine an exhibition evaluation', 'Draft: The exhibition was really cool. The explanations were very good. The whole exhibition was impossible to see. Notes: visitors could turn a handle to move a model crane; labels used short steps; only the two displays near the entrance were crowded during the afternoon. Audience: school newsletter.', 'Rewrite in 45–65 words. Replace vague praise with precise observations and keep the criticism limited to the place and time described.', 'Moving a model crane by turning a handle made the exhibition engaging. The labels broke the instructions into short steps, making the displays easy to use. However, the two displays near the entrance were crowded during the afternoon. Students who want to explore independently might prefer a quieter time.', ["criterion-a","criterion-b","criterion-c"], ['I used concrete, natural vocabulary.','I preserved the scope and timing of the criticism.','I gave useful advice without exaggerating.'], 30),
 development: writing("pedagogy-task-018", 'Develop a book recommendation', 'Notes: a mystery novel has chapters lasting about ten pages; each chapter ends with a new clue; three minor characters have similar names; the reader sometimes had to check who was speaking. Audience: classmates who want to read more English fiction.', 'Write 45–65 words. Develop a judgement about accessibility and explain the effect of the drawback before giving a targeted recommendation.', 'The short chapters make this mystery manageable for students beginning to read more English fiction. Each ends with a new clue, giving readers a reason to continue. However, three minor characters have similar names, so I sometimes had to check who was speaking. I would recommend it to readers who enjoy puzzles and can tolerate occasional confusion.', ["criterion-a","criterion-b","criterion-c"], ['I explained why the chapters help the intended reader.','I developed the effect of the character names.','My recommendation weighs both strengths and limitations.'], 32)
};
for (const [key, task] of Object.entries(additionalGold)) {
 const course=pathways[key];
 course.gold=[course.gold,task];
}
