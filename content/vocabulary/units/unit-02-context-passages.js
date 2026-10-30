// Unit 2 · Context · Mastery (type_in_passage) — authored short passages, WORDS 1–10 ONLY. Same contract as unit-01-context-passages.js:
// two passages per word, each 2-3 natural sentences with exactly ONE gap (`____`); the passage never contains the target (or another form)
// elsewhere, never a listed paraphrase or definition wording, never starts a sentence with the gap, and makes the target the natural fit.
// `answer` is the exact surface form the learner types. `why` records, for the reviewer, what in the passage points to this word.
const p = (text, answer, why) => ({ text, answer, why });

export default Object.freeze({
  entertainment: [
    p('After a tiring week of exams, Lena wanted something relaxing. She and her friends chose a film and a bag of popcorn, and the whole evening of ____ cost almost nothing.', 'entertainment', 'Film and popcorn after exams; "evening of ____".'),
    p('The new resort has a swimming pool, a cinema and live bands at night. Parents say the children never complain about boredom, because there is so much ____ on offer.', 'entertainment', 'Pool, cinema, bands; boredom contrasted; "so much ____ on offer".')
  ],
  access: [
    p('Amira’s village has no broadband cable, so she cannot do her research at home. Every weekday she walks to the library, where she has free ____ to the computers and the wi-fi.', 'access', '"free ____ to" the computers; contrast with no broadband at home.'),
    p('The school gave each pupil a password for the online library. Without it, nobody could get ____ to the e-books or the study guides.', 'access', 'Password needed; "get ____ to" the e-books.')
  ],
  device: [
    p('Phones, tablets and smartwatches all belong to the same group. Each one is a small electronic ____ that you can carry, charge and connect to the internet.', 'device', 'Category sentence naming phones, tablets, smartwatches; "small electronic ____".'),
    p('The factory makes tiny sensors for hospitals. Each ____ is smaller than a coin, but it can measure a patient’s heartbeat all day.', 'device', 'Tiny sensor that measures heartbeat; "each ____ is smaller than a coin".')
  ],
  digital: [
    p('Grandfather still keeps his photographs in heavy paper albums. His granddaughter has scanned every picture and stored a ____ version on her laptop, so the family can share them online.', 'digital', 'Paper albums contrasted with a scanned version on a laptop.'),
    p('In many offices, paper letters have been replaced by emails and online forms. This shift to a ____ way of working saves space, but it also means everyone depends on reliable internet.', 'digital', 'Paper replaced by emails and online forms; "a ____ way of working".')
  ],
  streaming: [
    p('Instead of buying discs or waiting for a whole film to download, Ravi simply opens an app and presses play. This kind of ____ only works well when his internet connection is fast.', 'streaming', 'Press play instead of buying or downloading; needs a fast connection.'),
    p('Cinema ticket sales have fallen for several years. Many viewers now prefer ____ services, which let them watch new series at home on any day they choose.', 'streaming', '"____ services" for watching series at home; contrast with cinema.')
  ],
  relevant: [
    p('Mr Okafor read the student’s essay carefully. Although the paragraph about her holiday was well written, it was not ____ to the question, so he advised her to remove it.', 'relevant', '"not ____ to the question"; well written but removed.'),
    p('A strong report does not include every fact the writer found. It keeps only the ____ evidence and leaves out anything that does not bear on the question.', 'relevant', 'Selective report; "only the ____ evidence"; leaves out the rest.')
  ],
  educator: [
    p('Mrs Zhang has spent thirty years in the classroom, planning lessons and guiding young people through their exams. Her pupils describe her as a patient and inspiring ____.', 'educator', 'Thirty years in the classroom; "a patient and inspiring ____".'),
    p('The conference brought together head teachers, trainers and university lecturers. Each ____ in the audience shared ideas about how to help students learn more effectively.', 'educator', 'Audience of teachers, trainers, lecturers; "each ____ in the audience".')
  ],
  afford: [
    p('Sam would love a new laptop for his studies. Unfortunately, the price is far higher than his savings, so he cannot ____ one this year.', 'afford', 'Price higher than savings; "cannot ____ one".'),
    p('The family wants to replace their old computer, but bills have risen recently. They will wait until they can ____ a better one without taking out a loan.', 'afford', 'Bills, loan; "until they can ____ a better one".')
  ],
  essential: [
    p('Before the long hike, the guide checked each rucksack. Water and warm clothing were ____, but the games console had to stay behind.', 'essential', 'Contrast with the console that stays behind; "were ____".'),
    p('Online banking relies on strong security. For this reason, a secure password is ____, and customers are told never to share it.', 'essential', 'Security reasoning; "is ____" with the never-share warning.')
  ],
  'current affairs': [
    p('Every morning, Mr Park’s class reads two articles from the newspaper and discusses elections, wars and new laws. He wants students to understand the world beyond school, so ____ is part of his timetable.', 'current affairs', 'Newspaper articles on elections, wars and laws; "so ____ is part of his timetable".'),
    p('Keira wanted to join the debating club, but she knew little about politics. She started listening to a daily podcast on ____ so that she could discuss international issues with confidence.', 'current affairs', 'Debating club, politics, daily podcast; "podcast on ____".')
  ],
  apparently: [
    p('Mia did not see the game herself, so she cannot be sure of anything. She heard from a classmate that, ____, the home team lost by two goals.', 'apparently', 'Hearsay from a classmate; "she cannot be sure".'),
    p('From the street, the shop looked busy and bright. Inside, however, the ____ popular café was nearly empty, and the owner was reading a newspaper.', 'apparently', 'Looks one way from outside, is different inside; "the ____ popular café".')
  ],
  supposedly: [
    p('The leaflet says the herbal tea cures every illness. Our science teacher laughed and asked for proof, because a drink that is ____ so powerful ought to be tested properly.', 'supposedly', 'A claim without proof; the teacher asks for proof.'),
    p('The café is ____ the cheapest in the city, and it has a huge sign outside to say so. Yet my friends and I paid more there than anywhere else.', 'supposedly', 'A boast contradicted by experience ("Yet ... paid more").')
  ],
  celebrity: [
    p('Hundreds of fans gathered outside the theatre, holding posters and phones. When the ____ finally stepped out of the car, the crowd screamed and photographers began taking pictures.', 'celebrity', 'Fans, posters, photographers, screaming crowd.'),
    p('Brands often pay a singer or footballer to appear in their adverts. They hope that customers will trust a product more if a ____ is seen using it.', 'celebrity', 'Paid singer or footballer used to sell products.')
  ],
  informed: [
    p('Before voting in the school election, Tariq read each candidate’s plan and asked them questions. As a result, he felt he was making a properly ____ choice.', 'informed', 'Read plans and asked questions first; "properly ____ choice".'),
    p('The head teacher believes that parents should hear about every change to the timetable. She writes a weekly email so that families stay ____.', 'informed', 'Weekly email; "stay ____".')
  ],
  admit: [
    p('The manager stared at the broken window, and the boy looked at his shoes. After a long silence, he decided to ____ that the ball had been his.', 'admit', 'Guilty silence, then owning up; "decided to ____ that".'),
    p('Nobody likes being wrong in front of others. Still, a good scientist is willing to ____ when the results do not support her idea.', 'admit', 'Being wrong in front of others; "willing to ____".')
  ],
  communicate: [
    p('Pilots and air traffic controllers use short, standard phrases on the radio. This helps them to ____ quickly and without misunderstandings, even when the weather is terrible.', 'communicate', 'Standard radio phrases; avoiding misunderstanding.'),
    p('My cousin lives in Canada, and we are eight hours apart. We usually ____ by sending voice messages, because it is hard to find a time when we are both awake.', 'communicate', 'Time difference; voice messages as the method.')
  ],
  remotely: [
    p('The engineer did not have to travel to the wind farm in the north. She repaired the fault ____, using a secure computer link from her office in the city.', 'remotely', 'No travel; computer link from the city.'),
    p('During the heavy snow, the school was closed, but lessons did not stop. Students joined their classes ____ and could still ask the teacher questions on screen.', 'remotely', 'School closed, lessons on screen.')
  ],
  transform: [
    p('The old factory has stood empty for twenty years. The council plans to ____ it into a library, a café and a small theatre by next year.', 'transform', 'Empty factory becomes three new uses.'),
    p('Some teachers believe that one inspiring lesson can ____ how a student feels about a whole subject. A pupil who once hated science may start to love it.', 'transform', 'Hate becomes love: a deep change.')
  ],
  percentage: [
    p('The teacher told the class that only 15 of the 60 pupils had chosen chemistry. She asked them to work out what ____ that is of the whole group and to write it with a % sign.', 'percentage', 'Calculation task ending in a % sign.'),
    p('The company promised to give some of its profits to charity. Critics asked what ____ of the money would be donated, since the announcement did not say whether it was 1% or 10%.', 'percentage', '"1% or 10%": the unknown is a figure out of 100.')
  ],
  impression: [
    p('Tom wore a clean shirt, shook the interviewer’s hand and smiled. He knew that the first few minutes would decide what the panel thought of him, so he wanted to make a good ____.', 'impression', 'Interview first minutes; "make a good ____".'),
    p('The streets were quiet and the shops were closing early. I got the ____ that most people in the town had gone away for the holidays.', 'impression', '"got the ____ that" a belief from what was seen.')
  ],
  'remote control': [
    p('The family sat down to watch a film, but the television stayed on the wrong channel. After ten minutes of searching under the sofa cushions, Dad finally found the ____ and pressed the button.', 'remote control', 'Searching the sofa; pressing the button to change the channel.'),
    p('The toy helicopter hovered above the garden while the boy stood on the grass. He steered it left and right using the ____ in his hands.', 'remote control', 'Steering a toy from the ground using something in his hands.')
  ],
  feature: [
    p('Customers compared three laptops before buying one. The deciding ____ was the battery, which could last for fifteen hours on a single charge.', 'feature', 'Comparing products; "the deciding ____" is one quality.'),
    p('The hotel is not especially large or cheap. Its best ____, according to most guests, is the garden terrace overlooking the sea.', 'feature', '"Its best ____" among the hotel’s qualities.')
  ],
  function: [
    p('Every part of the human body does something important. The ____ of the lungs is to take oxygen from the air and pass it into the blood.', 'function', 'Each body part does something; "The ____ of the lungs is to".'),
    p('Ella pressed every button on the new camera, but she could not work out what each one did. She asked her brother to explain the ____ of the small red one.', 'function', 'Not knowing what a button does; "explain the ____ of".')
  ],
  interactive: [
    p('At the science museum, visitors do not just look at the displays. They can touch the screens, answer questions and change the experiment, which makes the exhibits much more ____.', 'interactive', 'Touch, answer, change: visitors take part.'),
    p('A recorded lecture keeps students silent for an hour. By contrast, a really ____ lesson lets them vote, ask questions and work in small groups.', 'interactive', 'Contrast with silent lecture: voting, questions, groups.')
  ],
  widespread: [
    p('Heavy rain fell across the whole country for a week. The ____ flooding damaged roads, farms and homes in dozens of towns.', 'widespread', 'Whole country, dozens of towns.'),
    p('Ten years ago, only a few families owned a tablet. Today the use of tablets is ____, and almost every classroom has several.', 'widespread', 'Few then, almost everywhere now.')
  ],
  availability: [
    p('A farmer in a remote valley wanted to sell vegetables online, but there was no phone signal for kilometres. The poor ____ of the internet made the plan impossible.', 'availability', 'No signal, so the internet could not be obtained.'),
    p('Before booking a hotel, check the ____ of rooms for your dates. In summer, the most popular hotels are often full months ahead.', 'availability', 'Check whether rooms can be booked; hotels full.')
  ],
  'high-performance': [
    p('Most office computers are cheap and simple, because they only run email and documents. Video editors, however, need a ____ machine that can handle enormous files without slowing down.', 'high-performance', 'Contrast with cheap simple machines; handles enormous files.'),
    p('Formula One teams spend millions on their cars. Every ____ engine is tested for months so that it works at maximum speed in every race.', 'high-performance', 'Millions spent; maximum speed.')
  ],
  stabilising: [
    p('After weeks of arguments, the school council needed someone calm. The new head of year had a ____ effect on the whole group, and the meetings became peaceful again.', 'stabilising', 'Arguments, then peace after a calm person arrived.'),
    p('The tall tower sways in strong winds. Engineers added a ____ system of heavy weights at the top, which stops the building moving too far from side to side.', 'stabilising', 'Sway reduced by weights.')
  ],
  'multi-task': [
    p('Some students write an essay, listen to music and message friends all together. Research suggests that nobody can truly ____, because the brain really switches quickly between the jobs.', 'multi-task', 'Several jobs together; the brain switches between them.'),
    p('A modern phone can run a map, a music player and a video call together. The reason is that the processor is designed to ____ without crashing.', 'multi-task', 'Several programs run together.')
  ],
  predictable: [
    p('The film began with a hero, a villain and a chase. By the middle, everyone in the cinema knew how it would end, and the story felt completely ____.', 'predictable', 'Everyone knew the ending.'),
    p('Our bus arrives at exactly the same time every morning and takes the same route. Because the journey is so ____, I can plan my day to the minute.', 'predictable', 'Same time, same route: can be planned.')
  ],
  professional: [
    p('Amateur players train after work and are not paid. In contrast, a ____ footballer plays full time and earns a salary from a club.', 'professional', 'Contrast with unpaid amateurs; full time, salary.'),
    p('The wiring in the old house was dangerous, so we did not try to repair it ourselves. We hired a ____ electrician who had years of training.', 'professional', 'Hired a trained expert instead of doing it themselves.')
  ],
  regional: [
    p('The national news covers the whole country, but our ____ newspaper reports mainly on events in Yorkshire. It tells readers about local sports teams and council decisions.', 'regional', 'One part of the country, between national and local.'),
    p('The company divided Britain into five areas. Each ____ manager is responsible for the shops in one of them, such as Scotland or the south-west.', 'regional', 'Five areas, each with its own manager.')
  ],
  commentary: [
    p('Many fans cannot get tickets, so they listen to the match on the radio. The ____ describes every pass and shot as it happens.', 'commentary', 'Radio; describes the match as it happens.'),
    p('The final of the tournament was close, but the television ____ made it even more exciting. The speakers’ voices rose with every goal.', 'commentary', 'Speakers describing the game on television.')
  ],
  educational: [
    p('The school did not want children to waste their time online. It chose games and websites that were ____, because they taught maths and science.', 'educational', 'Chosen because they teach useful things.'),
    p('The museum trip was fun, but it was also ____. By the end of the day, the students had learnt a great deal about the history of the town.', 'educational', 'Fun, but students also learnt a lot.')
  ],
  culture: [
    p('When you travel abroad, you should learn about the local ____. Customs such as greetings, food and festivals can be very different from your own.', 'culture', 'Customs, greetings, food, festivals.'),
    p('Language and history are important, but they are only part of a ____. Music, clothing and daily habits also show how a group of people lives.', 'culture', 'A group’s way of life: music, clothing, habits.')
  ],
  genuine: [
    p('The teacher could tell that the apology was not just polite words. Her ____ regret showed in her voice and in the way she looked at him.', 'genuine', 'Not pretended: real regret.'),
    p('The shop sold bags at a very low price. Customers soon discovered that the leather was not ____, because it was a cheap imitation.', 'genuine', 'Not real leather: an imitation.')
  ],
  amusing: [
    p('My uncle tells stories about his school days. They are never cruel, and they are so ____ that the whole family laughs until they cry.', 'amusing', 'Stories that make the family laugh.'),
    p('The film was not a comedy, but it had a few ____ moments. Several times, the audience smiled at a character’s clumsy mistakes.', 'amusing', 'Moments that made the audience smile.')
  ],
  competitive: [
    p('Mia hates losing at anything, even a quick game of cards. Her friends say she is far too ____, because every game becomes a battle.', 'competitive', 'Hates losing; every game a battle.'),
    p('Dozens of companies sell mobile phones in this country. The market is so ____ that firms keep lowering their prices to attract customers.', 'competitive', 'Many companies; lowering prices for customers.')
  ],
  critical: [
    p('Some parents liked the new timetable, but many were ____ of it. They complained that the lessons started too early and finished too late.', 'critical', 'Complained about faults.'),
    p('Good friends can be honest, but nobody enjoys being told that everything they do is wrong. Her father was always ____ of her work and rarely praised it.', 'critical', 'Always found faults; rarely praised.')
  ],
  impressive: [
    p('The young pianist played for two hours without a single mistake. The audience stood up and clapped, because the performance was truly ____.', 'impressive', 'Two hours without a mistake; audience applauds.'),
    p('The new stadium holds eighty thousand people and has a roof that opens in minutes. Visitors often say it is the most ____ building in the city.', 'impressive', 'Size and design that make visitors admire it.')
  ],
  determination: [
    p('Jo failed her driving test three times, but she never gave up. Her ____ to pass finally paid off when she collected her licence on the fourth try.', 'determination', 'Failed three times, never gave up, passed on the fourth.'),
    p('The mountain was steep, the weather was freezing and the climbers were exhausted. Only their ____ kept them walking towards the summit.', 'determination', 'Exhausted but kept going: strong will.')
  ],
  overcome: [
    p('When Sam moved to England, he could barely speak English. Within two years, he managed to ____ the language barrier and passed his exams.', 'overcome', 'A problem that blocked him; he got past it.'),
    p('Many successful people had a difficult start in life. They show that it is possible to ____ almost any obstacle with hard work and support.', 'overcome', 'Difficult start; dealing with an obstacle.')
  ],
  accessory: [
    p('The basic phone costs very little, but customers often spend more on extras. A case or a charger is the most popular ____ in the shop.', 'accessory', 'An extra item that goes with the phone.'),
    p('Her outfit was plain and dark. A bright yellow scarf was the only ____ she wore, but it made everyone look twice.', 'accessory', 'An extra item added to clothes.')
  ],
  equipment: [
    p('Before the match, the coach checked that the team had everything it needed. The goals, nets and balls were all ready, but some of the training ____ was still in the van.', 'equipment', 'Goals, nets, balls: things needed for an activity (uncountable).'),
    p('The laboratory buys new tools and machines every year. Without up-to-date ____, the students could not carry out the experiments.', 'equipment', 'Tools and machines needed for experiments.')
  ],
  fixture: [
    p('When the family sold the flat, the buyers asked which items would stay. The kitchen sink was a ____, so it could not be taken away, but the table could.', 'fixture', 'Sink stays; table can go: permanently fitted.'),
    p('The estate agent listed every light, radiator and tap in the house. Each ____ is attached to the building and is included in the sale price.', 'fixture', 'Attached to the building; included in the sale.')
  ],
  removable: [
    p('The new tablet has a thin cover that you can pull off with your fingers. Because the cover is ____, it is easy to clean and replace.', 'removable', 'Can be pulled off.'),
    p('Some old phones have a battery you can take out yourself. A ____ battery means that you do not have to buy a new phone when it stops working.', 'removable', 'Can be taken out and replaced.')
  ],
  adjustable: [
    p('The desk chair suits tall and short students because the height can be changed. The ____ seat moves up and down with a small lever.', 'adjustable', 'Can be changed to fit different people.'),
    p('Most backpacks have a strap that you can lengthen or shorten. An ____ strap makes the bag comfortable for people of different sizes.', 'adjustable', 'Strap can be made longer or shorter.')
  ],
  affordable: [
    p('Many families cannot buy a house in the city centre because prices are so high. Governments are therefore building ____ homes in the suburbs.', 'affordable', 'Prices too high; homes ordinary families can pay for.'),
    p('Ten years ago, a tablet cost as much as a laptop. Today there are cheaper models, and they are ____ enough for most schools to buy in large numbers.', 'affordable', 'Cheaper now; schools can pay for them.')
  ],
  external: [
    p('The school’s own teachers marked the written papers. A visitor from another school, an ____ examiner, then checked a sample of the results.', 'external', 'A person from outside the school.'),
    p('My laptop is almost full, so I saved my photographs on a small ____ drive. I can now plug it in whenever I need more space.', 'external', 'A drive separate from, and outside, the laptop.')
  ],
  concentrate: [
    p('Marta cannot revise at home because her brother plays loud music. In the library, it is quiet, and she is able to ____ for hours.', 'concentrate', 'Quiet library; focus for hours.'),
    p('The teacher asked the students to switch off their phones. “You will learn more if you ____ on the lesson and ignore everything else,” she said.', 'concentrate', 'Focus on the lesson; ignore everything else.')
  ]
});
