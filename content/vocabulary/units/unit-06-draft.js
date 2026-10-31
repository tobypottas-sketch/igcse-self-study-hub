// UNIT 6 – LEARNING AND STUDY SKILLS: authoring draft (batches 1–2 = words 1–20). Source: 0511 key words UNIT 6 – LEARNING AND STUDY SKILLS (locked 50-word list). Words 21–50 are not authored yet.
// Same architecture as unit-05.js. Check: node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-06-draft.js
// A draft (status 'draft') is never in releases/, so the release tooling ignores it. Rename to unit-06.js only when all 50 words are final.
import { buildCuratedUnit } from '../build-unit.js';
import { LEXICAL_SPELLING_ERRORS } from '../lexical-spelling-errors.js';
import unit6Activities from './unit-06-activities.js';
import unit6PrecisionUse from './unit-06-precision-use.js';
import unit6WordFamilyItems from './unit-06-word-family-items.js';
import unit6Collocations from './unit-06-collocations.js';
import unit6SituationExtras from './unit-06-situation-extras.js';
import unit6MeaningMatch from './unit-06-meaning-match.js';
import unit6MeaningMastery from './unit-06-meaning-mastery.js';
import unit6ContextPassages from './unit-06-context-passages.js';
import { unit6WordFamilies, unit6WordFamilyRejected } from './unit-06-word-families.js';
import { unit6WordFamilyAlternates } from './unit-06-word-family-alternates.js';

const UNIT_NUMBER = 6;
const status = 'draft';

const e = (term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence, paraphraseSource, paraphraseSentence, productionSource, productionSentence, extras = {}) => ({
  term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence,
  paraphrase:{ source:paraphraseSource, sentence:paraphraseSentence },
  production:{ source:productionSource, sentence:productionSentence },
  ...extras
});

const entries = [
  e('absorb', 'verb',
    'to take in and understand information or knowledge',
    ['take in and understand', 'learn and take in'],
    ['to copy information exactly from a book', 'to avoid learning new information', 'to forget information after a short time'],
    'Young children absorb new vocabulary quickly when they hear it used in everyday conversation.',
    'take in and understand', 'Young children take in and understand new vocabulary quickly when they hear it used in everyday conversation.',
    'learn and take in', 'It is difficult to learn and take in a long list of facts if you read it only once.',
    {
      teacherNote:'Taught in its learning sense: to take in and understand information or knowledge. The physical sense (a sponge absorbs water) is not taught here.',
      masteryContexts:[
        { text:'Students who read slowly and make notes absorb far more from a chapter than those who only turn the pages.', meaning:'to take in and understand information' },
        { text:'During her first months in a new country, children often absorb the rhythm of the language without ever opening a grammar book.', meaning:'to take in knowledge gradually and naturally' }
      ],
      situationDistractors:[
        'The teacher handed out the worksheets, and the class waited quietly for the bell to ring.',
        'He closed the textbook, switched on the television and decided to start revising the next day.',
        'A student copied a paragraph word for word and handed it in without reading it.'
      ],
      retrievalContexts:[
        { id:'1', text:'Good teachers give students short sections of text so that they can absorb the main ideas before moving on.', target:'absorb', grammarPattern:'' },
        { id:'2', text:'It is much easier to absorb new information when you are rested and not worried about other things.', target:'absorb', grammarPattern:'' },
        { id:'3', text:'The teacher played the recording twice so that the class could absorb every detail of the conversation.', target:'absorb', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'absorb', wrong:['skip', 'reject', 'postpone'] },
        { id:'2', answer:'absorb', wrong:['ignore', 'invent', 'refuse'] },
        { id:'3', answer:'absorb', wrong:['correct', 'erase', 'interrupt'] }
      ]
    }),
  e('confidence', 'noun',
    'belief in your own ability or judgement',
    ['belief in yourself', 'trust in your own ability'],
    ['complete certainty that a fact is true', 'worry about an important test', 'respect for a teacher or a school'],
    'Speaking in front of the class is hard at first, but regular practice builds confidence over time.',
    'belief in yourself', 'Speaking in front of the class is hard at first, but regular practice builds belief in yourself over time.',
    'trust in your own ability', 'If you practise every day, you will soon have more trust in your own ability.',
    {
      teacherNote:'Confidence is belief in your own ability or judgement. It is not the same as certainty that a fact is true (I am certain that Paris is the capital of France).',
      masteryContexts:[
        { text:'After three successful presentations, Omar spoke with far more confidence than he had at the start of the term.', meaning:'belief in your own ability' },
        { text:'Praise from the teacher gave the shy student the confidence to put her hand up and give her opinion.', meaning:'belief that you are able to do something well' }
      ],
      situationDistractors:[
        'The class waited outside the room while the invigilator checked the exam papers.',
        'A girl tore up her notes after the teacher announced that the test had been cancelled.',
        'The student whispered his answer so quietly that nobody could hear it, and he stared at the floor.'
      ],
      retrievalContexts:[
        { id:'1', text:'Learners who prepare carefully for speaking tests usually perform with more confidence on the day.', target:'confidence', grammarPattern:'' },
        { id:'2', text:'Her confidence grew as she realised that she could follow the whole lecture without any help.', target:'confidence', grammarPattern:'' },
        { id:'3', text:'A good teacher corrects mistakes kindly so that students do not lose confidence in their own ability.', target:'confidence', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'confidence', wrong:['information', 'homework', 'permission'] },
        { id:'2', answer:'confidence', wrong:['frustration', 'handwriting', 'height'] },
        { id:'3', answer:'confidence', wrong:['weight', 'sleep', 'temper'] }
      ]
    }),
  e('dilemma', 'noun',
    'a situation in which you must make a difficult choice between two or more options',
    ['difficult choice', 'hard decision'],
    ['a serious problem that has no solution', 'a disagreement between two friends', 'a mistake that is made by accident'],
    'Many students face a dilemma when they have to choose between a part-time job and extra study time.',
    'difficult choice', 'Many students face a difficult choice when they have to choose between a part-time job and extra study time.',
    'hard decision', 'Deciding which subjects to drop at the end of the year is a hard decision for many students.',
    {
      teacherNote:'A dilemma is a difficult choice between alternatives, where each choice has a disadvantage. It is not simply “a problem”.',
      masteryContexts:[
        { text:'Hana faced a dilemma: she could revise alone for the exam or help her friend, who had missed three lessons.', meaning:'a difficult choice between two options' },
        { text:'The headteacher was in a dilemma, because cancelling the trip would disappoint the pupils but going ahead would be unsafe in the storm.', meaning:'a situation in which every choice has a disadvantage' }
      ],
      situationDistractors:[
        'The students arrived early and found that the classroom door was already open.',
        'Layla checked her answers twice and handed in the paper before the bell.',
        'The teacher explained the instructions slowly and then asked the class to begin.'
      ],
      retrievalContexts:[
        { id:'1', text:'Teenagers often face the dilemma of choosing between more study time and an active social life.', target:'dilemma', grammarPattern:'' },
        { id:'2', text:'The manager described it as a real dilemma, since any choice would upset one of the two teams.', target:'dilemma', grammarPattern:'' },
        { id:'3', text:'Whether to tell the teacher about the mistake or to keep quiet was a dilemma that kept him awake all night.', target:'dilemma', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'dilemma', wrong:['argument', 'mistake', 'schedule'] },
        { id:'2', answer:'dilemma', wrong:['pleasure', 'success', 'reward'] },
        { id:'3', answer:'dilemma', wrong:['holiday', 'success', 'tradition'] }
      ]
    }),
  e('dramatically', 'adverb',
    'to a very great or noticeable degree',
    ['to a very great extent', 'in a very noticeable way'],
    ['in a calm and quiet way', 'in a slow and careful way', 'for a very short time'],
    'Exam results improved dramatically after the school introduced weekly revision lessons.',
    'to a very great extent', 'Exam results improved to a very great extent after the school introduced weekly revision lessons.',
    'in a very noticeable way', 'Attendance rose in a very noticeable way once the lessons started at a later time.',
    {
      teacherNote:'An adverb of degree and change: it says that something changed by a very large, noticeable amount (rose dramatically, changed dramatically). It is not the same as “like a play” or “suddenly”.',
      masteryContexts:[
        { text:'Reading habits have changed dramatically since the arrival of smartphones, and many teenagers now read short texts instead of books.', meaning:'to a very great and noticeable degree' },
        { text:'Her marks improved dramatically after she began to revise every evening, rising from forty to eighty-five per cent.', meaning:'by a very large and noticeable amount' }
      ],
      situationDistractors:[
        'The school timetable changed slightly, and the first lesson now starts five minutes later.',
        'Marks stayed almost exactly the same from one term to the next.',
        'The students walked quietly to the hall and sat in rows.'
      ],
      retrievalContexts:[
        { id:'1', text:'The number of students using online dictionaries has increased dramatically over the past ten years, from fewer than a hundred to several thousand.', target:'dramatically', grammarPattern:'' },
        { id:'2', text:'Her attitude to homework changed dramatically when she realised how much it improved her results, and she went from avoiding it to starting it on the day it was set.', target:'dramatically', grammarPattern:'' },
        { id:'3', text:'Test scores fell dramatically in the school where lessons were halved in length, dropping by almost a third.', target:'dramatically', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'dramatically', wrong:['slightly', 'rarely', 'secretly'] },
        { id:'2', answer:'dramatically', wrong:['barely', 'politely', 'occasionally'] },
        { id:'3', answer:'dramatically', wrong:['slightly', 'neatly', 'quietly'] }
      ]
    }),
  e('equivalent', 'adjective',
    'equal in value, meaning, amount or function',
    ['equal in value', 'equal in function'],
    ['similar in some ways but not equal in value', 'higher in value than something else', 'completely different in every way'],
    'A grade B in this examination is equivalent to a grade 6 in the national system.',
    'equal in value', 'A grade B in this examination is equal in value to a grade 6 in the national system.',
    'equal in function', 'For basic note-taking, a tablet is equal in function to a laptop.',
    {
      teacherNote:'Equivalent means equal in value, amount, meaning or function (usually followed by “to”). It is stronger than similar: two similar things resemble each other, two equivalent things count as equal.',
      masteryContexts:[
        { text:'Many universities accept a recognised foreign qualification that is equivalent to the national school certificate.', meaning:'equal in value or level' },
        { text:'Some teachers claim that one hour of focused study is equivalent to two hours of study with a phone nearby.', meaning:'equal in value or effect' }
      ],
      situationDistractors:[
        'Hamid chose the harder paper because he wanted to challenge himself in the final exam.',
        'One school has a hundred students and the other has a thousand, so their budgets are very different.',
        'The teacher gave the best essay a higher mark than all the others.'
      ],
      retrievalContexts:[
        { id:'1', text:'In many countries, a vocational diploma is considered equivalent to the first year of a degree course, so successful students can enter the second year directly.', target:'equivalent', grammarPattern:'' },
        { id:'2', text:'The exam board explained that the two papers were equivalent in difficulty, so no group of students had an unfair advantage.', target:'equivalent', grammarPattern:'' },
        { id:'3', text:'A score of 7.0 on this test is roughly equivalent to the level of an educated native speaker, according to the examiners.', target:'equivalent', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'equivalent', wrong:['superior', 'unrelated', 'opposite'] },
        { id:'2', answer:'equivalent', wrong:['unequal', 'different', 'separate'] },
        { id:'3', answer:'equivalent', wrong:['superior', 'inferior', 'unrelated'] }
      ]
    }),
  e('overload', 'verb',
    'to give someone or something more work or information than they can deal with',
    ['give too much work to', 'ask too much of'],
    ['to give someone a short break from study', 'to give someone the correct answers in advance', 'to give someone less work than they would like'],
    'Teachers try not to overload students in the weeks before examinations.',
    'give too much work to', 'Teachers try not to give too much work to students in the weeks before examinations.',
    'ask too much of', 'Parents should be careful not to ask too much of children who are already tired.',
    {
      teacherNote:'The verb overload means to give someone or something more work or information than can be handled effectively; the learning context is the main one (overload students with homework, overload your memory).',
      masteryContexts:[
        { text:'Teachers should not overload students with extra assignments during the week of the mock examinations.', meaning:'to give someone more work than they can manage' },
        { text:'If you overload your memory with too many facts the night before an exam, you will remember very little in the morning.', meaning:'to give your mind more information than it can deal with' }
      ],
      situationDistractors:[
        'The teacher reduced the homework for the week so that students could rest after the exams.',
        'A student wrote a neat summary of each chapter and kept the pages in a folder.',
        'The class finished the experiment ten minutes early and tidied the laboratory.'
      ],
      retrievalContexts:[
        { id:'1', text:'The school tries not to overload younger students with homework, because they need time to play and rest.', target:'overload', grammarPattern:'' },
        { id:'2', text:'Experienced teachers know that it is a mistake to overload a single lesson with too many new words.', target:'overload', grammarPattern:'' },
        { id:'3', text:'Some students overload their timetable with extra clubs and then have no energy left for their homework.', target:'overload', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'overload', wrong:['supply', 'reward', 'test'] },
        { id:'2', answer:'overload', wrong:['shorten', 'cancel', 'delay'] },
        { id:'3', answer:'overload', wrong:['empty', 'shorten', 'print'] }
      ]
    }),
  e('stagnate', 'verb',
    'to stop developing, improving or making progress',
    ['stop improving', 'fail to make progress'],
    ['to improve quickly', 'to become more difficult', 'to start again from the beginning'],
    'Students who only repeat the same exercises will stagnate, because they never meet new challenges.',
    'stop improving', 'Students who only repeat the same exercises will stop improving, because they never meet new challenges.',
    'fail to make progress', 'Learners who avoid difficult tasks usually fail to make progress, however many hours they spend studying.',
    {
      teacherNote:'Stagnate means to stop developing or improving, often for a long time. It is usually a negative word (stagnating results, a stagnating economy).',
      masteryContexts:[
        { text:'Her marks began to stagnate in the second year, even though she was studying just as hard as before.', meaning:'to stop making progress' },
        { text:'If a business stops introducing new ideas, its sales will stagnate while its competitors grow.', meaning:'to stop developing or growing' }
      ],
      situationDistractors:[
        'The student’s marks rose steadily in every test during the autumn term.',
        'The new teacher gave the class a different project every fortnight, and everyone wanted to take part.',
        'The headteacher announced the date of the next parents’ evening in the school newsletter.'
      ],
      retrievalContexts:[
        { id:'1', text:'Without new challenges, even a talented pianist can stagnate and lose the desire to practise.', target:'stagnate', grammarPattern:'' },
        { id:'2', text:'If students keep using the same revision method every time, their progress may stagnate after a few weeks.', target:'stagnate', grammarPattern:'' },
        { id:'3', text:'The town began to stagnate when its biggest factory closed and no new businesses arrived.', target:'stagnate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'stagnate', wrong:['advance', 'celebrate', 'compete'] },
        { id:'2', answer:'stagnate', wrong:['accelerate', 'expand', 'return'] },
        { id:'3', answer:'stagnate', wrong:['flourish', 'expand', 'celebrate'] }
      ]
    }),
  e('engage', 'verb',
    'to become involved and interested in an activity, especially in learning',
    ['become involved', 'take a real interest'],
    ['to leave a lesson before it finishes', 'to watch a lesson without joining in', 'to prepare a lesson for other people'],
    'Students are more likely to engage with a text if they discuss it with a partner before writing.',
    'become involved', 'Students are more likely to become involved with a text if they discuss it with a partner before writing.',
    'take a real interest', 'Teenagers are more likely to take a real interest in lessons that connect to the world outside school.',
    {
      teacherNote:'Taught in the learning sense: to become involved and interested in an activity (engage with a topic, engage in a discussion). The senses “to hire someone” and “to become engaged to marry” are not taught.',
      masteryContexts:[
        { text:'Interactive tasks help shy students to engage with the topic instead of just listening to the teacher.', meaning:'to become involved and interested' },
        { text:'It is hard to engage with a long article if you do not care about its subject.', meaning:'to take a real interest and get involved' }
      ],
      situationDistractors:[
        'The student sat at the back and looked out of the window until the bell rang.',
        'The librarian locked the door at six o’clock and switched off the lights.',
        'The teacher marked the books at the weekend and returned them on Monday.'
      ],
      retrievalContexts:[
        { id:'1', text:'Pupils who engage fully in group discussions usually remember the lesson much longer than those who sit silently.', target:'engage', grammarPattern:'' },
        { id:'2', text:'The best teachers find ways to help every student to engage with the material, not just the quickest learners.', target:'engage', grammarPattern:'' },
        { id:'3', text:'During the workshop, parents were invited to engage with their children’s projects instead of simply looking at them.', target:'engage', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'engage', wrong:['believe', 'result', 'succeed'] },
        { id:'2', answer:'engage', wrong:['quarrel', 'compete', 'celebrate'] },
        { id:'3', answer:'engage', wrong:['compare', 'bargain', 'trade'] }
      ]
    }),
  e('participate', 'verb',
    'to take part in an activity',
    ['take part', 'join in'],
    ['to watch an activity from a distance', 'to organise an activity for other people', 'to avoid an activity that is difficult'],
    'All students are expected to participate in at least one activity outside the classroom each week.',
    'take part', 'All students are expected to take part in at least one activity outside the classroom each week.',
    'join in', 'Shy students often find it easier to join in when the group is small.',
    {
      teacherNote:'Participate is the more formal verb for take part; it is followed by “in” (participate in a discussion). Participant (a person who takes part) is a separate target in Units 3 and 4.',
      masteryContexts:[
        { text:'Pupils who participate in class discussions usually understand the topic better than those who stay silent.', meaning:'to take part in an activity' },
        { text:'Over two hundred students from five schools will participate in the science competition next month.', meaning:'to take part in an event' }
      ],
      situationDistractors:[
        'The students sat in rows and listened to the speaker without asking questions.',
        'The coach sat in the stands and watched the match through binoculars.',
        'The headteacher cancelled the match because heavy snow covered the field.'
      ],
      retrievalContexts:[
        { id:'1', text:'Visitors are welcome to participate in the workshop, but they must register at the main desk first.', target:'participate', grammarPattern:'' },
        { id:'2', text:'Only students who have completed the safety training are allowed to participate in the laboratory experiment.', target:'participate', grammarPattern:'' },
        { id:'3', text:'In a good seminar, everyone is encouraged to participate rather than leaving the talking to one or two people.', target:'participate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'participate', wrong:['invest', 'succeed', 'result'] },
        { id:'2', answer:'participate', wrong:['result', 'invest', 'believe'] },
        { id:'3', answer:'participate', wrong:['succeed', 'consist', 'insist'] }
      ]
    }),
  e('passive', 'adjective',
    'not actively involved; receiving or accepting rather than contributing or taking action',
    ['not actively involved', 'taking no active part'],
    ['calm and relaxed in difficult situations', 'lazy and unwilling to attend lessons', 'shy and unable to speak in public'],
    'Students who are passive in lessons listen carefully but rarely ask questions or give opinions.',
    'not actively involved', 'Students who are not actively involved in lessons listen carefully but rarely ask questions or give opinions.',
    'taking no active part', 'Students who are taking no active part in a discussion usually learn very little from it.',
    {
      teacherNote:'Passive describes someone who receives or accepts without taking action or contributing. It is not the same as calm, quiet or lazy: a quiet student can be very actively involved.',
      masteryContexts:[
        { text:'Reading the same notes silently is a passive way of studying, because you never ask yourself any questions.', meaning:'receiving information without taking action to use it' },
        { text:'Lectures can be passive experiences unless students are given tasks to do and questions to answer.', meaning:'not actively involved' }
      ],
      situationDistractors:[
        'The students split into groups, planned a short play and performed it for the class.',
        'The teacher asked the class to design a poster, and every pupil added something.',
        'The pupil put up his hand twice to ask a question and then explained his idea to the group.'
      ],
      retrievalContexts:[
        { id:'1', text:'Watching videos without taking notes or answering questions is a very passive way to learn a language.', target:'passive', grammarPattern:'' },
        { id:'2', text:'Teachers who ask open questions turn passive listeners into active thinkers.', target:'passive', grammarPattern:'' },
        { id:'3', text:'A passive student waits for the teacher to give the answer, whereas an active one tries to find it first.', target:'passive', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'passive', wrong:['expensive', 'noisy', 'private'] },
        { id:'2', answer:'passive', wrong:['noisy', 'generous', 'impatient'] },
        { id:'3', answer:'passive', wrong:['generous', 'noisy', 'tidy'] }
      ]
    }),
  e('active', 'adjective',
    'taking a full part in something, rather than only watching or receiving information',
    ['fully involved', 'taking a real part'],
    ['full of physical energy and always moving', 'busy with several tasks at the same time', 'quick to give an answer in class'],
    'Research suggests that active learners remember more than students who only listen to the teacher.',
    'fully involved', 'Research suggests that fully involved learners remember more than students who only listen to the teacher.',
    'taking a real part', 'Children usually learn faster when they are taking a real part in the lesson.',
    {
      teacherNote:'Taught in its learning sense: taking a full part and doing things, instead of only receiving information. It is the opposite of passive. It does not mean physically energetic (an active child) or busy (an active week).',
      masteryContexts:[
        { text:'Students who play an active part in group discussions usually understand the topic better than those who stay silent.', meaning:'fully involved and taking part' },
        { text:'The museum gives children the chance to be active learners by building models instead of just reading labels.', meaning:'doing things rather than only receiving information' }
      ],
      situationDistractors:[
        'The pupil sat at the back with her arms folded and waited for the lesson to finish.',
        'After the long journey, the family slept in the hotel until late in the morning.',
        'The manager read the report from the first page to the last and filed it without comment.'
      ],
      retrievalContexts:[
        { id:'1', text:'Teachers can encourage students to be active in class by asking open questions instead of giving long explanations.', target:'active', grammarPattern:'' },
        { id:'2', text:'Employees who take an active role in training sessions usually learn new systems more quickly.', target:'active', grammarPattern:'' },
        { id:'3', text:'An active reader underlines key points, asks questions about the text and summarises each section.', target:'active', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'active', wrong:['absent', 'nervous', 'generous'] },
        { id:'2', answer:'active', wrong:['unusual', 'optional', 'official'] },
        { id:'3', answer:'active', wrong:['untidy', 'anxious', 'impatient'] }
      ]
    }),
  e('evaluate', 'verb',
    'to judge the quality, value or effectiveness of something by using evidence or clear criteria',
    ['judge the quality of', 'measure how well it works'],
    ['to describe something in detail without giving an opinion', 'to repeat something until it is remembered', 'to copy something so that it looks the same'],
    'Before buying a new laptop, it is wise to evaluate several models by comparing reviews, prices and battery life.',
    'judge the quality of', 'Before buying a new laptop, it is wise to judge the quality of several models by comparing reviews, prices and battery life.',
    'measure how well it works', 'Scientists use a pilot study to measure how well it works before the new treatment is offered to every patient.',
    {
      idKey:'evaluate_6',
      teacherNote:'Unit 6 item (evaluate_6), separate from the Unit 3 and Unit 5 evaluate items; shares only the lexical spelling list. Sense: to judge quality, value or effectiveness using evidence or criteria. It is not the same as describe, which only says what something is like.',
      masteryContexts:[
        { text:'Marine biologists evaluate each conservation project by comparing fish numbers before and after the work began.', meaning:'to judge how successful something is using evidence' },
        { text:'In the final task, candidates must describe two study methods and then evaluate which one suits them better.', meaning:'to judge the value of something by giving reasons' }
      ],
      situationDistractors:[
        'The reporter listed the names of the winners and the prizes they received.',
        'A student typed out the speech word for word and read it aloud to the class.',
        'Rain delayed the match, and the players waited in the changing room.'
      ],
      retrievalContexts:[
        { id:'1', text:'Doctors evaluate a new treatment by comparing the results of patients who received it with those who did not.', target:'evaluate', grammarPattern:'' },
        { id:'2', text:'Before you trust a website, evaluate who wrote it, when it was updated and what evidence it gives.', target:'evaluate', grammarPattern:'' },
        { id:'3', text:'The company asked an outside expert to evaluate the safety of the old bridge.', target:'evaluate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'evaluate', wrong:['announce', 'invent', 'advertise'] },
        { id:'2', answer:'evaluate', wrong:['ignore', 'forget', 'delete'] },
        { id:'3', answer:'evaluate', wrong:['ignore', 'neglect', 'hide'] }
      ]
    }),
  e('reflect', 'verb',
    'to think carefully about an experience, action or idea, especially in order to learn from it',
    ['think back carefully', 'look back and learn'],
    ['to repeat information until it is remembered', 'to copy another person’s ideas exactly', 'to hurry through a task to finish quickly'],
    'Good learners take time to reflect after each task, asking what worked and what did not.',
    'think back carefully', 'Good learners take time to think back carefully after each task, asking what worked and what did not.',
    'look back and learn', 'Mistakes are useful only if students stop to look back and learn from them.',
    {
      teacherNote:'Taught in its thinking sense: to think carefully about an experience, action or idea, especially in order to learn from it (reflect on a mistake). The mirror and light senses are not taught. It is usually followed by on.',
      masteryContexts:[
        { text:'After the group project, the teacher gave everyone ten minutes to reflect on what had gone well and what had not.', meaning:'to think carefully about an experience in order to learn from it' },
        { text:'Many successful athletes keep a diary so that they can reflect on each match and improve their next performance.', meaning:'to think carefully about past actions in order to improve' }
      ],
      situationDistractors:[
        'The pupils lined up at the door and followed the teacher to the canteen.',
        'A student crossed out his answer, wrote another one and handed in the paper at once.',
        'The coach shouted instructions from the side of the pitch while the players ran up and down.'
      ],
      retrievalContexts:[
        { id:'1', text:'Before writing your final report, reflect on the comments you received during the course.', target:'reflect', grammarPattern:'' },
        { id:'2', text:'Pilots reflect carefully on every flight, noting small mistakes before they become dangerous habits.', target:'reflect', grammarPattern:'' },
        { id:'3', text:'Journals give young learners a quiet place to reflect on their feelings and their progress.', target:'reflect', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'reflect', wrong:['depend', 'insist', 'comment'] },
        { id:'2', answer:'reflect', wrong:['rely', 'agree', 'insist'] },
        { id:'3', answer:'reflect', wrong:['depend', 'rely', 'agree'] }
      ]
    }),
  e('process', 'verb',
    'to take in, organise and understand information',
    ['make sense of', 'sort out and understand'],
    ['to collect information from many different places', 'to repeat information aloud to other people', 'to hide information so that nobody can find it'],
    'The brain needs time to process new information, so short breaks during study are useful.',
    'make sense of', 'The brain needs time to make sense of new information, so short breaks during study are useful.',
    'sort out and understand', 'It takes most people several days to sort out and understand a large amount of unfamiliar information.',
    {
      teacherNote:'Taught as a verb in its learning sense: to take in, organise and understand information (process new information). The factory sense (to process food) and the noun sense (a process) are not taught here.',
      masteryContexts:[
        { text:'Teenagers sometimes need a quiet room to process difficult news before they can talk about it.', meaning:'to take in and make sense of something' },
        { text:'Language learners process spoken words faster when they hear them in a clear and familiar context.', meaning:'to take in and understand information' }
      ],
      situationDistractors:[
        'The workers loaded boxes onto the lorry and drove them to the warehouse.',
        'The librarian stacked the returned books on the trolley and wheeled it to the shelves.',
        'Leo wrote his name at the top of the page and sharpened three pencils.'
      ],
      retrievalContexts:[
        { id:'1', text:'The human brain can process only a small amount of new information at one time.', target:'process', grammarPattern:'' },
        { id:'2', text:'Readers who stop to summarise each paragraph process the text more deeply than those who read quickly.', target:'process', grammarPattern:'' },
        { id:'3', text:'It takes young children longer to process long instructions, so teachers should give them one step at a time.', target:'process', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'process', wrong:['produce', 'invent', 'forget'] },
        { id:'2', answer:'process', wrong:['copy', 'skip', 'print'] },
        { id:'3', answer:'process', wrong:['ignore', 'cancel', 'shorten'] }
      ]
    }),
  e('strategy', 'noun',
    'a carefully planned method for achieving a goal',
    ['carefully planned method', 'plan for reaching a goal'],
    ['a single action that is done without thinking', 'a rule that everyone must obey', 'a result that is reached after hard work'],
    'Students who use a strategy for learning new vocabulary usually remember more words.',
    'carefully planned method', 'Students who use a carefully planned method for learning new vocabulary usually remember more words.',
    'plan for reaching a goal', 'A good coach gives each player a plan for reaching a goal before the season starts.',
    {
      teacherNote:'A strategy is a carefully planned method, made up of several steps or decisions, for reaching a goal (a learning strategy). It is not a single action or trick. It is often followed by for or to: a strategy for learning, a strategy to reduce stress.',
      masteryContexts:[
        { text:'The football manager changed his strategy at half-time and put an extra player in defence.', meaning:'a plan for reaching a goal' },
        { text:'Our class developed a strategy for learning irregular verbs: we grouped them by sound and tested each other every week.', meaning:'a planned method for achieving a goal' }
      ],
      situationDistractors:[
        'He grabbed the nearest book from the shelf and started reading it without a plan.',
        'The architect drew the window and the door on the same sheet of paper.',
        'A man waved at the bus driver and jumped on just before the doors closed.'
      ],
      retrievalContexts:[
        { id:'1', text:'A good time-management strategy helps people to balance study, work and rest.', target:'strategy', grammarPattern:'' },
        { id:'2', text:'The government has announced a new strategy to reduce traffic in the city centre.', target:'strategy', grammarPattern:'' },
        { id:'3', text:'Every successful business needs a clear strategy for attracting and keeping customers.', target:'strategy', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'strategy', wrong:['mistake', 'accident', 'rumour'] },
        { id:'2', answer:'strategy', wrong:['accident', 'celebration', 'complaint'] },
        { id:'3', answer:'strategy', wrong:['colour', 'distance', 'accident'] }
      ]
    }),
  e('approach', 'noun',
    'a way of dealing with a task or problem',
    ['way of working', 'way of dealing with a task'],
    ['a distance between two places', 'a rule that must always be followed', 'a final answer to a problem'],
    'Many schools now take a flexible approach, so that students can choose how they show what they have learned.',
    'way of working', 'Many schools now take a flexible way of working, so that students can choose how they show what they have learned.',
    'way of dealing with a task', 'Choosing the right way of dealing with a task can save a lot of time.',
    {
      teacherNote:'Taught in its method sense: a way of dealing with a task or problem (a new approach to learning). The physical sense of moving closer (the approach of a train) is not taught. It is often followed by to: an approach to problem-solving.',
      masteryContexts:[
        { text:'A step-by-step approach to planning a long piece of writing makes the task seem less frightening.', meaning:'a method of dealing with a task' },
        { text:'The two scientists each took a very different approach to the same problem, but both reached the same result.', meaning:'a way of dealing with a problem' }
      ],
      situationDistractors:[
        'The tourists took photographs of the old bridge and bought postcards.',
        'He finished the last question, checked his name on the paper and left the hall.',
        'Maya borrowed a pen from her neighbour and forgot to return it.'
      ],
      retrievalContexts:[
        { id:'1', text:'Teachers often try a new approach when the usual method does not help students to learn.', target:'approach', grammarPattern:'' },
        { id:'2', text:'A practical approach to learning a language is to speak a little every day.', target:'approach', grammarPattern:'' },
        { id:'3', text:'The doctor explained that a calm approach works best with anxious patients.', target:'approach', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'approach', wrong:['uniform', 'playground', 'journey'] },
        { id:'2', answer:'approach', wrong:['journey', 'distance', 'building'] },
        { id:'3', answer:'approach', wrong:['building', 'rumour', 'invention'] }
      ]
    }),
  e('revise', 'verb',
    'to study material again in order to prepare for an examination or to understand it better',
    ['go back over', 'prepare by studying'],
    ['to change a text so that it contains fewer mistakes', 'to learn a topic for the first time', 'to take an examination at the end of a course'],
    'Students should revise the key topics at least a week before the exam.',
    'go back over', 'Students should go back over the key topics at least a week before the exam.',
    'prepare by studying', 'Many students prepare by studying their notes aloud with a friend.',
    {
      teacherNote:'Taught in the British exam-study sense: to study material again to prepare for an examination or to understand it better (revise for a test). The sense of editing a document is not taught here.',
      masteryContexts:[
        { text:'Maria plans to revise one subject each evening, starting with the topics she finds hardest.', meaning:'to study again to prepare for an examination' },
        { text:'Before the driving theory test, Karim used a mobile app to revise road signs during his bus journey.', meaning:'to study material again so that you remember it' }
      ],
      situationDistractors:[
        'The editor crossed out a long paragraph and rewrote the opening sentence of the article.',
        'On the first day of term, the new pupils learned the names of their teachers.',
        'He took the test on Monday and received his result by email on Friday.'
      ],
      retrievalContexts:[
        { id:'1', text:'It is better to revise a little each day than to try to learn everything the night before the test.', target:'revise', grammarPattern:'' },
        { id:'2', text:'Teachers advise students to revise with past papers so that they become familiar with the style of the questions.', target:'revise', grammarPattern:'' },
        { id:'3', text:'Candidates who revise their weakest topics first usually feel more prepared on the day.', target:'revise', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'revise', wrong:['argue', 'invent', 'complain'] },
        { id:'2', answer:'revise', wrong:['argue', 'compete', 'travel'] },
        { id:'3', answer:'revise', wrong:['avoid', 'hide', 'delete'] }
      ]
    }),
  e('forecast', 'verb',
    'to say what is likely to happen in the future, using the information available',
    ['make an informed prediction about', 'say what is likely to happen'],
    ['to guess something without looking at any information', 'to warn people about a danger that has already happened', 'to explain why something happened in the past'],
    'Meteorologists can forecast the path of a storm several days before it reaches the coast.',
    'make an informed prediction about', 'Meteorologists can make an informed prediction about the path of a storm several days before it reaches the coast.',
    'say what is likely to happen', 'Nobody can say what is likely to happen in the housing market without studying the latest figures.',
    {
      teacherNote:'Taught as a verb: to say what is likely to happen in the future using the information available (forecast the weather, forecast sales). A forecast is based on evidence, so it is different from a guess.',
      masteryContexts:[
        { text:'Analysts forecast that online sales will double over the next five years because more people now shop on their phones.', meaning:'to say what will probably happen using information' },
        { text:'Using records from the past forty years, scientists can forecast how much the sea level will rise by the end of the century.', meaning:'to predict the future using evidence' }
      ],
      situationDistractors:[
        'Nobody remembered the name of the captain who won the cup twenty years ago.',
        'The farmer woke before dawn and fed the animals before breakfast.',
        'She guessed the colour of the card in his hand and laughed when she was wrong.'
      ],
      retrievalContexts:[
        { id:'1', text:'Experts forecast heavy rain for the weekend, so the match may have to be postponed.', target:'forecast', grammarPattern:'' },
        { id:'2', text:'It is difficult to forecast exam results accurately without knowing how much each student has prepared.', target:'forecast', grammarPattern:'' },
        { id:'3', text:'Banks use past figures to forecast the number of customers who will need loans next year.', target:'forecast', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'forecast', wrong:['cause', 'deny', 'remember'] },
        { id:'2', answer:'forecast', wrong:['celebrate', 'copy', 'hide'] },
        { id:'3', answer:'forecast', wrong:['spend', 'sell', 'remove'] }
      ]
    }),
  e('interfere', 'verb',
    'to get in the way of something so that it cannot work or progress properly',
    ['get in the way', 'disturb the work of others'],
    ['to help someone to finish a job more quickly', 'to ask a question to check understanding', 'to join a team after the work has started'],
    'Teachers should not interfere while students are working out the answer for themselves.',
    'get in the way', 'Teachers should not get in the way while students are working out the answer for themselves.',
    'disturb the work of others', 'Loud talking in the library can disturb the work of others who are trying to read.',
    {
      teacherNote:'Taught in the sense of getting involved in a way that prevents or disrupts something. It is often followed by with (interfere with sleep, interfere with learning) and sometimes by in (interfere in other people’s business). It is not the same as help.',
      masteryContexts:[
        { text:'Mobile phones can interfere with sleep if teenagers use them in bed late at night.', meaning:'to get in the way of something so that it does not work well' },
        { text:'The coach asked parents not to interfere during training, because the players needed to listen to one voice.', meaning:'to become involved in a way that disrupts something' }
      ],
      situationDistractors:[
        'The nurse took the patient’s temperature and wrote it on the chart.',
        'Hana offered to carry her grandmother’s shopping and walked her to the front door.',
        'The pupils sang a song together and then returned to their desks.'
      ],
      retrievalContexts:[
        { id:'1', text:'Worrying about money can interfere with a student’s ability to learn.', target:'interfere', grammarPattern:'' },
        { id:'2', text:'A noisy classroom may interfere with the way children follow spoken instructions.', target:'interfere', grammarPattern:'' },
        { id:'3', text:'Heavy part-time work should not interfere with your studies in the final year of school.', target:'interfere', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'interfere', wrong:['agree', 'cope', 'argue'] },
        { id:'2', answer:'interfere', wrong:['deal', 'agree', 'cooperate'] },
        { id:'3', answer:'interfere', wrong:['compete', 'agree', 'deal'] }
      ]
    }),
  e('distract', 'verb',
    'to take someone’s attention away from what they should be thinking about or doing',
    ['take attention away from', 'make it hard to pay attention'],
    ['to make someone feel angry about their work', 'to help someone to remember a fact', 'to stop someone from entering a room'],
    'Notifications on a phone can distract students while they are trying to complete a task.',
    'take attention away from', 'Notifications on a phone can take attention away from students while they are trying to complete a task.',
    'make it hard to pay attention', 'Open-plan offices can make it hard to pay attention to complicated work.',
    {
      teacherNote:'Taught as a verb: to take someone’s attention away from what they should be concentrating on (distract students, distract from the task). It differs from interfere: distract affects attention, while interfere affects how something works or progresses.',
      masteryContexts:[
        { text:'Bright posters on every wall can distract young children from the lesson.', meaning:'to take attention away from what you should be doing' },
        { text:'During the exam, a student was asked to leave because he kept trying to distract the candidate sitting next to him.', meaning:'to take someone’s attention away from their work' }
      ],
      situationDistractors:[
        'The class listened carefully while the guest speaker described her experience as a pilot.',
        'He wrote the date in the margin and underlined the title of the chapter.',
        'The examiner collected the papers and counted them twice.'
      ],
      retrievalContexts:[
        { id:'1', text:'Social media can easily distract teenagers who are trying to finish their homework.', target:'distract', grammarPattern:'' },
        { id:'2', text:'Try not to distract the driver while the car is moving.', target:'distract', grammarPattern:'' },
        { id:'3', text:'A tidy desk helps because there is less around to distract you from your work.', target:'distract', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'distract', wrong:['mislead', 'embarrass', 'photograph'] },
        { id:'2', answer:'distract', wrong:['follow', 'hire', 'insult'] },
        { id:'3', answer:'distract', wrong:['excuse', 'protect', 'prevent'] }
      ]
    })
];

// Authored Word Families (unit-06-word-families.js): per-form facts feed Mastery; the plain family list is the non-headword forms of the SAME
// family. A rejected headword keeps NO family list, so Recognise/Match never offer unauthorised members.
function familyFields(entry) {
  const family = unit6WordFamilies[entry.term];
  if (!family) return unit6WordFamilyRejected[entry.term] ? { wordFamily:[] } : {};
  const lower = value => String(value).toLocaleLowerCase('en');
  return {
    wordFamilyForms:family.forms.map(row => ({ form:row.form, partOfSpeech:row.partOfSpeech, example:row.example, pedagogicallyUseful:true, ...(unit6WordFamilyAlternates[entry.term]?.[row.form] ? { altExample:unit6WordFamilyAlternates[entry.term][row.form] } : {}) })),
    wordFamily:family.forms.map(row => row.form).filter(form => lower(form) !== lower(entry.term))
  };
}

// Authored Meaning Mastery wrong meanings are applied by position to the word's two mastery contexts, as in Units 1–5.
const enrichedEntries = entries.map(entry => {
  const authoredMastery = unit6MeaningMastery[entry.term];
  const masteryContexts = authoredMastery
    ? (entry.masteryContexts ?? []).map((record, index) => {
        const authored = authoredMastery[index] ?? {};
        return { text:authored.text ?? record.text, meaning:authored.meaning ?? record.meaning, ...(Array.isArray(authored.wrongMeanings) ? { wrongMeanings:authored.wrongMeanings } : {}) };
      })
    : entry.masteryContexts;
  return {
    ...entry,
    ...(masteryContexts ? { masteryContexts } : {}),
    ...(unit6SituationExtras[entry.term] ? { situationDistractors:[...(entry.situationDistractors ?? []), ...unit6SituationExtras[entry.term]] } : {}),
    ...(unit6Collocations[entry.term] ? { collocations:unit6Collocations[entry.term] } : {}),
    ...(unit6MeaningMatch[entry.term] ? { wrongParaphrases:unit6MeaningMatch[entry.term] } : {}),
    ...(unit6ContextPassages[entry.term] ? { masteryPassages:unit6ContextPassages[entry.term] } : {}),
    ...familyFields(entry)
  };
});

export default buildCuratedUnit({
  unitNumber:UNIT_NUMBER,
  unitTitle:'Learning and Study Skills',
  status,
  source:'0511 key words UNIT 6 – LEARNING AND STUDY SKILLS',
  entries:enrichedEntries,
  activities:[...unit6Activities, ...unit6PrecisionUse, ...unit6WordFamilyItems],
  // evaluate is also a Unit 3 and Unit 5 target; its Unit 6 item has its own id (idKey 'evaluate_6' -> vocab_evaluate_6) and aliases the earlier spelling list
  // (pressure, later in this unit, will need the same treatment).
  lexicalSpelling:{
    ...LEXICAL_SPELLING_ERRORS,
    vocab_evaluate_6:LEXICAL_SPELLING_ERRORS.vocab_evaluate
  }
});
