// Unit 1 · Context · Mastery (type_in_passage) — authored short passages (Job 9). CANONICAL SOURCE.
//
// Two passages per word (Mastery completes only after two DISTINCT prompts). Each passage is 2-3 natural sentences with exactly ONE gap
// (`____`) for the target word or form. No answer bank, no letters, no options. The passage must:
//   * never contain the target (or another form of it) anywhere else,
//   * never contain a listed paraphrase or the word's definition wording,
//   * not start a sentence with the gap (a capital letter would give the answer away),
//   * make the target the natural fit from the surrounding discourse.
// `answer` is the exact surface form the learner must type (an explicit form of the word: the headword or an authored grammar form).
// `why` records, for the reviewer, what in the passage points to this word.
const p = (text, answer, why) => ({ text, answer, why });

export default Object.freeze({
  'leisure time': [
    p('After a long week of lessons and homework, Chen looks forward to Saturday. His ____ is the only part of the week when he can choose what to do, and he usually spends it cycling with friends.', 'leisure time', 'Contrast with lessons/homework; "the only part of the week when he can choose".'),
    p('Many workers now answer emails late at night. As a result, the boundary between work and ____ has almost disappeared, and people say they feel more tired.', 'leisure time', 'Set against "work" as its opposite; fixed phrase "work and leisure time".')
  ],
  preference: [
    p('The café offered tea, coffee or hot chocolate. When the waiter asked about my ____, I said I would rather have tea than anything else.', 'preference', '"asked about my ___ ... would rather have tea" shows choosing one option.'),
    p('Some students like to study alone, while others work better in groups. Teachers try to respect each student’s ____ whenever the timetable allows it.', 'preference', 'Alone versus groups: each student favours one way.')
  ],
  avoid: [
    p('The motorway was full of traffic, so we took a country road to ____ the delays near the city. The journey was a little longer, but much more relaxing.', 'avoid', 'Taking another road to stay clear of delays.'),
    p('Having slipped twice on the same corner, Anna now ____ that route and takes the longer path through the park. She says the extra five minutes are worth it.', 'avoids', 'Previous accidents explain why she steers clear; third-person present form.')
  ],
  afford: [
    p('Tickets for the final cost more than most students could ____. In the end, the school paid for a small group to go.', 'afford', 'Cost versus students’ means; the school paid instead.'),
    p('For years, the club had trained in a cold hall because it could not ____ a better venue. This year a local company paid for the move.', 'afford', 'Lack of money explained by "paid for the move".')
  ],
  deny: [
    p('The captain was asked whether he had broken the rule. He did not ____ it; instead, he apologised and promised it would not happen again.', 'deny', 'Apologising shows he did not claim it was untrue.'),
    p('Reporters kept asking whether the club would sign a new striker. The manager ____ every rumour, saying that nothing had been agreed.', 'denied', 'Answering rumours with "nothing had been agreed"; past form.')
  ],
  permit: [
    p('The sign at the gate says that dogs are not welcome. The park rules do not ____ pets on the sports field, even on a lead.', 'permit', 'Rules and signs: what the park does not let happen.'),
    p('Candidates must leave all bags outside the room. Phones are not ____ in the examination hall under any circumstances.', 'permitted', 'Exam rules; passive past-participle form.')
  ],
  arrange: [
    p('Our class wants to visit the science museum next month. Mr Okafor has offered to ____ a coach, and we must bring the money by Friday.', 'arrange', 'Organising transport for a trip.'),
    p('Everything was ready for the surprise party. Priya had ____ the food, the music and the decorations while her sister kept the guest of honour busy.', 'arranged', 'Preparing details in advance; past participle after "had".')
  ],
  urge: [
    p('The health minister appeared on television. She will ____ every adult to exercise for thirty minutes a day, because the figures on heart disease are so worrying.', 'urge', 'Strong encouragement driven by worrying figures.'),
    p('At half-time the captain gathered the team. "Don’t give up now," she ____ them, and the players ran back onto the pitch with fresh energy.', 'urged', 'Pressing the team to act; speech verb in past form.')
  ],
  recommend: [
    p('I have just read an excellent novel about a young runner. I would strongly ____ it to anyone who enjoys stories about sport.', 'recommend', 'Suggesting a book as worth reading.'),
    p('My ankle was still swollen after the match. My doctor ____ that I rest it for two weeks before I start training again.', 'recommended', 'Professional advice; "that I rest" pattern, past form.')
  ],
  demand: [
    p('Being a professional musician is not easy. The job can ____ years of practice, long journeys and very little sleep before a big concert.', 'demand', 'A list of heavy requirements.'),
    p('The workers were angry about their pay. They ____ a meeting with the manager and refused to return to work until they had spoken to her.', 'demanded', 'Forceful insistence shown by refusing to return to work.')
  ],
  threaten: [
    p('Scientists warn that sea levels are rising faster than expected. This could ____ many coastal towns within fifty years.', 'threaten', 'Warning of future danger to towns.'),
    p('The striker limped off after a late tackle. It ____ to end his season, but the scan showed no serious damage and he was back in training within days.', 'threatened', 'Risk of harm that did not happen.')
  ],
  resent: [
    p('Jack worked on the group project for three weeks. He began to ____ the others when they took the credit without doing any of the work.', 'resent', 'Bitter feeling caused by unfair credit.'),
    p('Her brother always got the best seat in the car. She ____ it, though she never said so aloud.', 'resented', 'Unspoken bitterness about unfairness.')
  ],
  regret: [
    p('He left the exam hall early without checking his answers. Later, he began to ____ that decision, because he lost marks on careless mistakes.', 'regret', 'Sorry about a past choice because of its result.'),
    p('Our team lost by six goals. Watching the final whistle, the coach was already ____ his decision to rest the best players.', 'regretting', 'Present participle after "was already".')
  ],
  unfamiliar: [
    p('On his first day at the new school, Ravi felt nervous. The corridors, the timetable and even the lunch menu were all completely ____ to him.', 'unfamiliar', 'Everything was new on a first day.'),
    p('A first visit to another country can feel strange. Travellers often find the food, language and customs ____, but this is part of the adventure.', 'unfamiliar', 'First-time experience of things not known.')
  ],
  racquet: [
    p('In the final set, Sara’s ____ slipped from her hand and flew across the court. She had to borrow her partner’s to finish the match.', 'racquet', 'Held in the hand on a court; can be borrowed.'),
    p('To play badminton you need a shuttlecock, a net and a light ____ with a tightly strung head. A heavier one would make it hard to move quickly.', 'racquet', 'Equipment for hitting the shuttlecock; "strung head".')
  ],
  opponent: [
    p('In chess, you must think about every move your ____ might make. A good player always plans two or three moves ahead.', 'opponent', 'The person across the board.'),
    p('The two boxers shook hands and then looked at each other seriously. Neither wanted to show weakness to the ____ before the first bell.', 'opponent', 'The other boxer in the ring.')
  ],
  intense: [
    p('The final minutes of the match were ____. Both teams attacked again and again, and no one in the stadium dared to sit down.', 'intense', 'Very strong excitement and effort.'),
    p('Summer in the desert is ____. The sun burns the skin within minutes, and walkers need shade and plenty of water.', 'intense', 'Very strong heat.')
  ],
  tournament: [
    p('Sixty-four teams entered the ____, which lasted a whole week. Each team played once a day until only two remained for the final.', 'tournament', 'Many teams, many matches, a final.'),
    p('Omar said this was only a friendly match. The real excitement comes next month, when we travel to the national ____ and play against the best schools.', 'tournament', 'A big event contrasted with a friendly match.')
  ],
  determined: [
    p('Mia had failed her driving test twice, but she was ____ to pass the third time. She practised every evening for a month.', 'determined', 'Past failure plus a month of practice.'),
    p('The climbers were exhausted and the storm was growing worse. Yet they remained ____ to reach the summit before dark.', 'determined', '"yet they remained ___ to reach the summit" despite danger.')
  ],
  discipline: [
    p('Getting up at five every day to swim needs a great deal of ____. Talent alone is not enough if you cannot make yourself train when you are tired.', 'discipline', 'Making yourself do it when tired.'),
    p('Dieting is easy to start but hard to continue. It takes real ____ to turn down cake every day for months.', 'discipline', 'Self-control over a long time.')
  ],
  'goal-oriented': [
    p('Our new manager is very ____. She sets clear targets at the start of every month and measures everything we do against them.', 'goal-oriented', 'Targets and measuring results.'),
    p('Some people drift through life. Others are ____ from a young age: they decide what they want to achieve and plan each step.', 'goal-oriented', 'Contrast with drifting; planning towards aims.')
  ],
  achievement: [
    p('Hana had been afraid of water all her life. Learning to swim at the age of forty was a remarkable ____ for her.', 'achievement', 'Overcoming a lifelong fear.'),
    p('At the end of the year, the school holds a celebration for every student. It recognises every kind of ____, from top exam results to improvement in sport.', 'achievement', 'Things worth celebrating, from results to improvement.')
  ],
  elite: [
    p('Only a few hundred athletes in the whole country reach the ____ level. At this level they train full-time and compete for national teams.', 'elite', 'Very few, highest level, full-time.'),
    p('Ordinary members of the club can use the pool at any time. The ____ swimmers, who train for the Olympics, have lanes reserved for them.', 'elite', 'Contrast with ordinary members; Olympic training.')
  ],
  overwhelming: [
    p('The school asked students to vote on a new uniform. When the results were announced, the support for it was ____: nearly every student voted in favour.', 'overwhelming', 'Nearly every vote.'),
    p('After moving to a huge city, Ali found the noise and the crowds ____ at first. It took him several weeks before he felt calm again.', 'overwhelming', 'Too much to cope with at first.')
  ],
  generation: [
    p('My grandparents’ ____ grew up without computers, while mine cannot imagine life without them. Each group has its own habits.', 'generation', 'Age groups compared.'),
    p('Football changes constantly. Every new ____ of players seems to be faster and fitter than the one before.', 'generation', '"new ___ ... than the one before".')
  ],
  challenge: [
    p('A desert crossing is not for beginners. It is a huge ____, even for experienced walkers, because of the heat and the lack of water.', 'challenge', 'Difficulties that test even experts.'),
    p('The science teacher wanted the class to think creatively. She gave them an interesting ____: to build a bridge from paper that could hold a bag of rice.', 'challenge', 'A difficult task set to test skill.')
  ],
  solution: [
    p('The playground flooded every winter, and children could not use it for weeks. Then the council found a ____: a new drain under the field.', 'solution', 'A problem that is fixed by a new drain.'),
    p('There was a mistake in the maths problem. No one in the class could find the ____, however hard they tried.', 'solution', 'Looking for the answer to a problem.')
  ],
  pastime: [
    p('My grandfather has never thought of gardening as work. Growing vegetables is a relaxing ____ that he enjoys every weekend.', 'pastime', 'Not work; enjoyed at weekends.'),
    p('Reading used to be a popular ____ among teenagers. Now many prefer to spend their spare hours online.', 'pastime', 'An activity chosen in spare hours.')
  ],
  feat: [
    p('The lake was cold and almost a kilometre wide. Swimming across it alone was an extraordinary ____ for a ten-year-old, and the crowd on the shore cheered.', 'feat', 'An impressive deed that earns cheers.'),
    p('The robotics club had no money and no experience. Building a working robot from old parts was quite a ____ under those conditions.', 'feat', 'Impressive given the difficulty.')
  ],
  regardless: [
    p('The forecast for Saturday is poor, but the organisers are not worried. The concert will go ahead ____ of the weather, so bring a coat.', 'regardless', '"___ of the weather, so bring a coat".'),
    p('Everyone in the choir is welcome, ____ of age or experience. Some of our best singers had never sung before.', 'regardless', 'Age and experience make no difference.')
  ],
  monetary: [
    p('Nobody wins a fortune in this competition. The prize has little ____ value, but the winner keeps a famous trophy that has been passed down for a hundred years.', 'monetary', 'Value in money contrasted with a trophy’s fame.'),
    p('The charity asked volunteers for their time. Any ____ gifts, however small, were also gratefully received.', 'monetary', 'Time versus gifts of cash.')
  ],
  estimated: [
    p('The bridge has been closed for a month. The ____ cost of repairing it is two million pounds, although the engineers will not know the exact figure until they open it up.', 'estimated', 'Not exact: "will not know the exact figure".'),
    p('Nobody counted the crowd at the parade. The ____ number of people who watched was around forty thousand.', 'estimated', 'Nobody counted, so the number is a judgement.')
  ],
  struggle: [
    p('Essay writing is difficult for many learners. Many students ____ with it at first, but it becomes easier with regular practice and clear feedback.', 'struggle', 'Difficulty that improves with practice.'),
    p('The old car reached the bottom of the steep hill and began to climb. It ____ up the slope, making a loud noise, and for a moment it seemed that it might roll backwards.', 'struggled', 'Great effort with difficulty; past form.')
  ],
  minimum: [
    p('To pass the course, students must attend a ____ of eighty per cent of the lessons. Anyone below that figure must repeat the year.', 'minimum', '"below that figure" shows the lowest allowed.'),
    p('Wages cannot legally fall below a certain level. In many countries this ____ wage is set by the government each year.', 'minimum', 'The lowest legal wage.')
  ],
  championship: [
    p('The team practised twice a day for months. They hoped to win the ____ and bring the cup back to the school.', 'championship', 'Winning the cup that decides the best team.'),
    p('Over three days, the best gymnasts in the country take part. The winner of the national ____ is invited to join the squad.', 'championship', 'National event that decides the winner.')
  ],
  competitor: [
    p('The marathon was about to begin. At the start of the race, each ____ received a number to pin on the front of their shirt.', 'competitor', 'Someone entered in a race.'),
    p('Sales at the bakery fell sharply last spring. A new ____ had opened across the road and began selling bread at a lower price.', 'competitor', 'A rival business selling the same goods.')
  ],
  relatively: [
    p('Most of the class finished the test early. It was ____ easy, although a few students still made careless mistakes.', 'relatively', 'Easy compared with what was expected; "although a few".'),
    p('The village shop is the only place to buy food within ten kilometres. Prices there are ____ high, but people accept it.', 'relatively', 'High compared with elsewhere.')
  ],
  patience: [
    p('Fishing is a quiet hobby. It needs a great deal of ____: you may sit by the river for hours before anything bites.', 'patience', 'Waiting calmly for hours.'),
    p('The customer shouted at the assistant, but she answered calmly and kindly. Her ____ impressed everyone who was waiting in the queue.', 'patience', 'Calm response to someone shouting.')
  ],
  atmosphere: [
    p('The concert hall was full of laughter and music. The warm ____ made even the shyest guests feel welcome.', 'atmosphere', 'The general feeling of a place.'),
    p('Before the exam, the room was silent and tense. You could feel the nervous ____ as soon as you opened the door.', 'atmosphere', 'The mood you notice when entering.')
  ],
  incredible: [
    p('The view from the top of the tower was ____. We could see the whole city, the river and the mountains beyond.', 'incredible', 'Extremely impressive view.'),
    p('The old man ran a marathon on his ninetieth birthday. It sounds ____, but he finished in under six hours.', 'incredible', 'Hard to believe, yet true.')
  ],
  criteria: [
    p('The judges met before the competition started. They agreed on the ____: originality, effort and presentation each counted for a third of the marks.', 'criteria', 'A list of standards used to judge.'),
    p('Not everyone can join the programme. Applicants must meet several ____, including a minimum age and a recommendation from a teacher.', 'criteria', 'Conditions applicants must satisfy.')
  ],
  historic: [
    p('The two countries had been enemies for decades. When they signed the peace agreement, it was a ____ day that children will study in school for generations.', 'historic', 'So important it will be taught for generations.'),
    p('The town is popular with visitors. Tourists come from all over the world to see its ____ centre, with a castle and narrow streets from the Middle Ages.', 'historic', 'Old and important place with a castle.')
  ],
  selection: [
    p('Whatever kind of book you like, you will find it here. The library has a huge ____ of titles, from detective stories to science fiction.', 'selection', 'A wide range to choose from.'),
    p('After the trials, the final ____ of the team will be announced on Friday. Only fifteen players will make the squad.', 'selection', 'The act of choosing players.')
  ],
  produce: [
    p('Winters are mild in this region. Farms here ____ enough vegetables to feed the whole city, even in the coldest months.', 'produce', 'Growing enough to supply a city.'),
    p('The factory is the biggest employer in the town. It ____ over a thousand bicycles every month and sells them all over Europe.', 'produces', 'Making bicycles to sell; third-person form.')
  ],
  craftspeople: [
    p('The summer fair was busy all weekend. Local ____ sold hand-made pottery, wooden toys and woven baskets, and visitors could watch them at work.', 'craftspeople', 'People who make pottery, toys and baskets.'),
    p('The old theatre had been damaged by fire. Its restoration required talented ____ who could carve stone and repair delicate wooden panels.', 'craftspeople', 'Skilled workers carving and repairing.')
  ],
  significant: [
    p('The school started a cycling campaign last year. There has been a ____ rise in the number of students using bicycles, from forty to over two hundred.', 'significant', 'A large, noticeable change.'),
    p('Few people noticed the small change at the time. It turned out to be ____: it later led to a completely new way of teaching.', 'significant', 'Small but important in its effect.')
  ],
  expansion: [
    p('The airport is building a second terminal. The ____ of the airport means that it will soon handle twice as many passengers as before.', 'expansion', 'Getting bigger: twice as many passengers.'),
    p('More families are moving to the city every year. Rapid ____ has pushed new housing further into the countryside.', 'expansion', 'The city growing outward.')
  ],
  reputation: [
    p('The restaurant is always full. It has an excellent ____ in the town: people travel for miles because everyone says the food is wonderful.', 'reputation', 'What everyone says about it.'),
    p('Trust is easy to lose. One careless lie can damage a person’s ____ for years, because it takes a long time for others to believe you again.', 'reputation', 'Others’ opinion and trust.')
  ],
  reasonable: [
    p('The hotel was clean and close to the beach. The price was ____, so we decided to stay for the whole week.', 'reasonable', 'Fair price that led to the decision.'),
    p('Everyone in the class had been working since morning. "It is perfectly ____ to ask for a break after three hours," the teacher said.', 'reasonable', 'Fair and sensible request.')
  ],
  antiques: [
    p('Grandfather loves visiting markets at weekends. His house is full of ____: clocks, lamps and furniture from the nineteenth century.', 'antiques', 'Collected old objects.'),
    p('The shop on the corner is full of old things. It buys and sells ____, so you can find old coins, silver spoons and even Victorian mirrors.', 'antiques', 'A shop dealing in old valuable objects.')
  ]
});
