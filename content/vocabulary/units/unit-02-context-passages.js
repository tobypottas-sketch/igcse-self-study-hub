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
  ]
});
