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
  ],
  active: [
    p('Some museums no longer ask visitors to walk quietly past glass cases. Instead, they invite children to build, test and ask questions, because learners who are ____ remember far more than those who simply look and listen.', 'active', 'Contrast with those who "simply look and listen"; "learners who are ____".'),
    p('The teacher noticed that the same few students answered every question. She changed the lesson so that each pupil had a task, and soon even the quietest members of the class became ____ participants.', 'active', 'Quiet students given tasks; "became ____ participants".')
  ],
  evaluate: [
    p('Describing a new app is easy: you say what it looks like and what it can do. The harder skill is to ____ it, by deciding how useful it is and giving evidence to support your judgement.', 'evaluate', 'Contrast with describing; "decide how useful ... with evidence".'),
    p('A small company tested two training programmes with its new staff. After six months, managers looked at test scores and customer comments in order to ____ which programme had worked better.', 'evaluate', 'Comparing results to judge which worked better; "in order to ____ which".')
  ],
  reflect: [
    p('At the end of each week, the swimming coach gives her team ten minutes without talking. During that time, the swimmers ____ on their training, thinking about what they did well and what they could change.', 'reflect', 'Quiet thinking time; "____ on their training".'),
    p('Students often hurry from one task to the next and learn little from their mistakes. A short learning journal gives them a regular chance to ____ on what went wrong and how to avoid the same problem again.', 'reflect', 'Journal for looking back; "____ on what went wrong".')
  ],
  process: [
    p('After listening to a long lecture, many students feel tired, because the brain has to ____ a great deal of new information at the same time. Short breaks allow it to sort ideas into a clear order.', 'process', 'Brain taking in and sorting information; "has to ____ new information".'),
    p('Young children need time to ____ what they hear. A teacher who asks a question and waits patiently for a few seconds usually gets a better answer than one who moves on immediately.', 'process', 'Waiting time for understanding; "time to ____ what they hear".')
  ],
  strategy: [
    p('Instead of reading a new vocabulary list again and again, Elena tested herself with cards, grouped the words by topic and used each one in a sentence. This ____ took longer at first, but she remembered far more words by the end of the month.', 'strategy', 'A planned set of steps; "This ____ took longer at first".'),
    p('The football club had lost six matches in a row. The new manager studied the results carefully and introduced a different ____: the team would defend deeply and attack quickly.', 'strategy', 'A planned method introduced to win; "a different ____: the team would...".')
  ],
  approach: [
    p('Some students try to write a long report in one session and feel exhausted by the end. A better ____ is to plan first, write one section at a time and leave time for checking.', 'approach', 'A better way of dealing with the task; "A better ____ is to plan first".'),
    p('Two nurses cared for the same anxious patient. One spoke quickly and loudly, while the other used a slow and gentle ____, and only the second succeeded in calming the patient.', 'approach', 'Two ways of dealing with the patient; "a slow and gentle ____".')
  ],
  revise: [
    p('The exam is in three weeks, so Jun has made a timetable. Every evening, he will ____ one subject, working through his notes and then answering questions from past papers.', 'revise', 'Studying again for an exam; "will ____ one subject ... past papers".'),
    p('Memory research shows that students remember more when they ____ a topic several times over a few weeks than when they study it once for many hours. Each return visit makes the material easier to recall.', 'revise', 'Studying a topic again, spaced out; "____ a topic several times".')
  ],
  forecast: [
    p('Using satellite images and records from the past century, meteorologists can ____ the weather for the next seven days with a high degree of accuracy. Their statements are not guesses; they are based on measurable evidence.', 'forecast', 'Predicting from evidence, not guessing; "can ____ the weather".'),
    p('The tourist board wants to ____ how many visitors will arrive next summer. To do this, it is studying booking figures from previous years and the latest information on flight prices.', 'forecast', 'Predicting from booking figures; "wants to ____ how many visitors will arrive".')
  ],
  interfere: [
    p('Many teenagers say that they can study and watch a series at the same time. However, research suggests that the programme can ____ with their memory, so they learn less than they expect.', 'interfere', 'Getting in the way of memory; "can ____ with their memory".'),
    p('A good tutor gives hints rather than answers. If the tutor were to ____ every time a student made a mistake, the student would never learn how to solve a problem independently.', 'interfere', 'Stepping in and spoiling the learning; "to ____ every time".')
  ],
  distract: [
    p('The library has a rule that phones must be switched off. Even a quiet vibration can ____ people who are reading, and it may take several minutes for them to find their place again.', 'distract', 'Taking attention from reading; "can ____ people who are reading".'),
    p('Chen likes to work with music playing, but he chooses songs without words. Lyrics, he says, ____ him from the task because he starts to listen to the story.', 'distract', 'Words pull his attention away; "Lyrics ____ him from the task".')
  ],
  evidence: [
    p('A student wrote that homework is useless but did not mention a single study. Her teacher explained that a strong argument needs ____, such as statistics, examples or results from experiments, rather than personal opinion alone.', 'evidence', 'Statistics, examples and results; "a strong argument needs ____".'),
    p('The detective listened carefully to every witness, yet he refused to name the thief. Without enough ____ to support his theory, he knew that an accusation could be wrong.', 'evidence', 'Supporting a theory; "enough ____ to support his theory".')
  ],
  guidance: [
    p('First-year students are often unsure which courses to choose. The university therefore provides ____ through a team of advisers, who explain the options but leave the final decision to each student.', 'guidance', 'Advisers explain but students decide; "provides ____ through advisers".'),
    p('Young athletes can develop poor habits if they train alone. With ____ from an experienced coach, they learn to improve safely and to understand why each exercise matters.', 'guidance', 'Help from an experienced coach; "With ____ from an experienced coach".')
  ],
  academic: [
    p('Nadia was an excellent footballer, but her parents also wanted her to succeed in her ____ work. She therefore agreed to finish her homework before every training session.', 'academic', 'Homework versus football; "her ____ work".'),
    p('A university looks for more than exam grades. Applicants are asked to describe their ____ interests, such as the subjects they enjoy reading about in their own time.', 'academic', 'Subjects they enjoy reading about; "their ____ interests".')
  ],
  concentration: [
    p('After two hours of continuous reading, many students notice that their minds begin to wander. A short walk or a glass of water can restore their ____ so that they can continue working.', 'concentration', 'Minds wander, then attention returns; "restore their ____".'),
    p('The surgeon asked everyone to leave the room during the delicate operation. Complete ____ was essential, because even a small mistake could harm the patient.', 'concentration', 'Full attention on one task; "Complete ____ was essential".')
  ],
  complex: [
    p('A national economy cannot be explained by a single cause. Prices, jobs, trade and government decisions all affect one another, which makes the system far too ____ for a simple answer.', 'complex', 'Many connected parts; "far too ____ for a simple answer".'),
    p('At first the board game seemed easy. After a few rounds, however, the players realised that its rules were ____: each move changed the value of several other pieces.', 'complex', 'One move changes several pieces; "its rules were ____".')
  ],
  motivation: [
    p('Rania started the course with great energy, but after a month of slow progress she began to skip lessons. Her teacher suggested small weekly goals, which gave her new ____ to continue.', 'motivation', 'Energy fades, goals restore it; "new ____ to continue".'),
    p('Managers often assume that salary is the only reason people work hard. However, surveys show that recognition, interesting tasks and a sense of purpose provide strong ____ for many employees.', 'motivation', 'Reasons people work hard; "provide strong ____".')
  ],
  curiosity: [
    p('The boy took apart a broken radio just to see how it worked. His ____ annoyed his father at first, but it eventually led him to a career in electronics.', 'curiosity', 'Taking things apart to learn; "His ____ annoyed his father".'),
    p('Good science teachers do not simply give answers. They encourage ____ by asking questions such as “Why do you think that happened?” and by welcoming unexpected ideas.', 'curiosity', 'Asking why; "encourage ____ by asking questions".')
  ],
  technique: [
    p('The guitarist could already play every note of the song. He practised the same short piece for weeks, not to learn the notes, but to improve his ____ for changing chords quickly without any pause.', 'technique', 'A skilled method for changing chords; "his ____ for changing chords".'),
    p('Two runners had the same strength, yet one always finished ahead. The coach explained that her ____ was better: she landed lightly, kept her arms relaxed and wasted no energy.', 'technique', 'Skilled way of running; "her ____ was better".')
  ],
  effective: [
    p('The school tried posters, assemblies and letters to reduce lateness, but nothing changed. When it introduced a short breakfast club, the number of late arrivals fell sharply, so the club proved to be far more ____.', 'effective', 'It produced the intended result; "far more ____".'),
    p('A good medicine must do more than exist; it must be ____ when patients use it. Doctors therefore compare patients who take the medicine with similar patients who do not.', 'effective', 'It must work when used; "must be ____ when patients use it".')
  ],
  inefficient: [
    p('In the old office, every form had to be signed by five different managers in five different buildings. The system was not impossible, but it was deeply ____, because it wasted days of staff time.', 'inefficient', 'Wasted days of time; "deeply ____, because it wasted".'),
    p('Energy experts often give a simple example. A kettle that is filled to the top for a single cup is ____: most of the electricity heats water that nobody will use.', 'inefficient', 'Energy wasted on unused water; "is ____: most of the electricity".')
  ]
});
