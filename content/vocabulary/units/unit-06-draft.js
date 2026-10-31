// UNIT 6 – LEARNING AND STUDY SKILLS: authoring draft (batch 1 = words 1–10). Source: 0511 key words UNIT 6 – LEARNING AND STUDY SKILLS (locked 50-word list). Words 11–50 are not authored yet.
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
  // None of words 1–10 is an exact earlier-unit target, so no _6 isolation is needed yet (evaluate and pressure, later in this unit, will need it).
  lexicalSpelling:LEXICAL_SPELLING_ERRORS
});
