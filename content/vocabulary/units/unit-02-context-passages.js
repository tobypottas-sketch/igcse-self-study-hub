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
  ]
});
