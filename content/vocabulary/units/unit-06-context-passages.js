// Unit 6 · Context · Mastery (type_in_passage) — authored short passages, WORDS 1–10 so far. Same contract as unit-05-context-passages.js:
// two passages per word, each 2-3 natural sentences with exactly ONE gap (`____`); the passage never contains the target elsewhere, never starts
// with the gap, and makes the target the natural fit. `answer` is the exact surface form typed. `why` records what points to the word.
const p = (text, answer, why) => ({ text, answer, why });

export default Object.freeze({
  absorb: [
    p('Before an exam, some students read their notes again and again without stopping to think. Others pause after every page, because they find it easier to ____ the main ideas when they study in short sections.', 'absorb', 'Studying in short sections; "easier to ____ the main ideas".'),
    p('The new pupils arrived with very little English. After a term of listening to their classmates and watching lessons, they began to ____ the language without even trying.', 'absorb', 'Learning gradually from listening; "began to ____ the language without even trying".')
  ],
  confidence: [
    p('Karim used to be afraid of speaking in class, and he avoided every presentation. After a term of small speaking tasks with a friendly partner, he spoke with far more ____ and even volunteered to lead a debate.', 'confidence', 'Afraid -> small tasks -> volunteered; "spoke with far more ____".'),
    p('A teacher’s praise can change the way a student feels about a subject. When Elena heard that her essay was one of the best, she gained the ____ to try harder tasks and to share her opinion in class.', 'confidence', 'Praise -> "the ____ to try harder tasks and to share her opinion".')
  ],
  dilemma: [
    p('Zara has been offered a place on a summer science course, but it starts in the same week as her cousin’s wedding abroad. She cannot attend both, so she is in a real ____ and has asked her teacher for advice.', 'dilemma', 'Two events she cannot attend together; "in a real ____ and has asked for advice".'),
    p('Should he report a classmate who had cheated, or stay loyal to a friend? Nobody could tell Daniel what to do, and he spent the whole weekend thinking about this ____ without finding an answer that felt right.', 'dilemma', 'Report or stay loyal; "thinking about this ____ without finding an answer".')
  ],
  dramatically: [
    p('Twenty years ago, most students wrote their essays by hand. Today almost all of them use laptops, so the way young people write has changed ____ in a single generation.', 'dramatically', 'Handwriting -> laptops in one generation; "changed ____ in a single generation".'),
    p('The new head teacher moved the start of lessons from eight o’clock to nine. Absences fell ____, and within a month the number of late students dropped from forty a week to just three.', 'dramatically', 'Forty -> three in a month; "fell ____".')
  ],
  equivalent: [
    p('Maria moved from Spain to England in the middle of her school career. The English school asked for proof that her Spanish certificate was ____ to the one they usually accepted, and only then did they allow her to join the sixth form.', 'equivalent', 'Proof that a certificate counts as equal; "was ____ to the one they usually accepted".'),
    p('Both holiday courses cost four hundred pounds and last two weeks, and they cover the same topics. The brochure says that the two courses are completely ____, so students may choose whichever is closer to home.', 'equivalent', 'Same price, length and topics; "the two courses are completely ____".')
  ],
  overload: [
    p('In the final term, some teachers set an essay, a project and three tests in a single week. Students became exhausted and anxious, so the head of year asked staff not to ____ them with work.', 'overload', 'Too much work in one week; "not to ____ them with work".'),
    p('Making a good revision timetable means being realistic. If you try to ____ every day with six subjects and no breaks, you will feel exhausted by Wednesday and give up by Friday.', 'overload', 'Six subjects, no breaks; "try to ____ every day".')
  ],
  stagnate: [
    p('Many learners reach an intermediate level and then feel that they are not moving forward. If they keep repeating the same exercises, they are likely to ____, while those who try harder tasks carry on improving.', 'stagnate', 'Same exercises -> no progress; "likely to ____, while those who try harder tasks carry on improving".'),
    p('The village once had a busy market, a school and a railway station. After the railway closed, no new families arrived, and for twenty years the whole community seemed to ____.', 'stagnate', 'Closure, no new families, twenty years; "the whole community seemed to ____".')
  ],
  engage: [
    p('Some students sit quietly through every lesson and only listen. A good teacher tries to make learning active, so that pupils ____ with the topic instead of just taking notes.', 'engage', 'Active learning, not just listening; "pupils ____ with the topic".'),
    p('Online courses often lose their students after the first week. Learners are far more likely to carry on if the lessons give them real tasks to ____ in, such as writing a short report or recording a talk.', 'engage', 'Real tasks keep learners going; "tasks to ____ in".')
  ],
  participate: [
    p('In the old lessons, the teacher spoke for forty minutes and the students listened. Now every pupil is expected to ____ by asking questions, sharing ideas or helping to solve a problem on the board.', 'participate', 'Asking, sharing, solving; "expected to ____ by asking questions".'),
    p('The school choir is open to everyone, whether they have a strong voice or not. Anyone who wants to ____ only has to come to the music room on Tuesday after lessons.', 'participate', 'Open to everyone; "Anyone who wants to ____ only has to come".')
  ],
  passive: [
    p('Some students believe that studying means reading the same pages again and again. This is a ____ method, because the brain only receives information and never has to use it, whereas writing questions or testing yourself works much better.', 'passive', 'Only receiving information; "a ____ method" contrasted with testing yourself.'),
    p('During the group project, two members stayed ____ and left all the research and writing to the others, even though everybody had agreed to share the work. The teacher later asked them to describe what they had contributed, and neither could give an answer.', 'passive', 'Left everything to the others; "stayed ____".')
  ]
});
