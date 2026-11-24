// UNIT 10 – EDUCATION: authored source for the Unit 10 Vocabulary Builder release (releases/unit-10.js promotes it to live once approved). Source: 0511 key vocabulary unit 10: Education
// (coursebook order), 48/48 authored (the supplied list has 48 words). Check: node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-10.js
// academic, reflect, confidence, contribute, employment, challenge, assignment, research, evaluate, communicate, preference, achievement and qualification are also
// earlier-unit targets; each has its own Unit 10 id (idKey 'X_10' -> vocab_X_10) and reuses the earlier reviewed spelling list where one exists.
import { buildCuratedUnit } from '../build-unit.js';
import { LEXICAL_SPELLING_ERRORS } from '../lexical-spelling-errors.js';
import unit10Activities from './unit-10-activities.js';
import unit10PrecisionUse from './unit-10-precision-use.js';
import unit10WordFamilyItems from './unit-10-word-family-items.js';
import unit10Collocations from './unit-10-collocations.js';
import unit10SituationExtras from './unit-10-situation-extras.js';
import unit10MeaningMatch from './unit-10-meaning-match.js';
import unit10MeaningMastery from './unit-10-meaning-mastery.js';
import unit10ContextPassages from './unit-10-context-passages.js';
import { unit10WordFamilies, unit10WordFamilyRejected } from './unit-10-word-families.js';
import { unit10WordFamilyAlternates } from './unit-10-word-family-alternates.js';

const UNIT_NUMBER = 10;
const status = 'approved';

const e = (term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence, paraphraseSource, paraphraseSentence, productionSource, productionSentence, extras = {}) => ({
  term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence,
  paraphrase:{ source:paraphraseSource, sentence:paraphraseSentence },
  production:{ source:productionSource, sentence:productionSentence },
  ...extras
});
// Two Mastery contexts (sentence + the meaning it shows).
const mc = (...pairs) => pairs.map(([text, meaning]) => ({ text, meaning }));
// Three reviewed gap-fill sentences (each contains the exact target form once) and, for each, the three wrong options that cannot fit.
const gaps = (target, texts, wrongs) => ({
  retrievalContexts:texts.map((text, index) => ({ id:String(index + 1), text, target, grammarPattern:'' })),
  gapDistractors:wrongs.map((wrong, index) => ({ id:String(index + 1), answer:target, wrong }))
});

const entries = [
  e('education', 'noun',
    'the process of teaching and learning, especially at school, college or university',
    ['schooling', 'teaching and learning'],
    ['the process of finding a job after leaving school', 'the money a government spends on hospitals', 'the free time people spend relaxing at weekends'],
    'In many countries, education is free for all children until the age of sixteen.',
    'schooling', 'In many countries, schooling is free for all children until the age of sixteen.',
    'learning at school', 'The charity believes that learning at school can change a child’s whole future.',
    {
      teacherNote:'Noun: the process of teaching and learning (a good education, free education, primary/secondary education). Usually uncountable; "a good education" is the common countable use. The verb educate, the adjective educational and the adjective educated are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Her parents worked two jobs so that she could get a good education.', 'teaching and learning that prepares a person for life'],
        ['The government has promised to spend more money on education next year.', 'the system of schools, colleges and teaching']
      ),
      situationDistractors:[
        'A family spent the whole weekend watching films on the sofa.',
        'A man repaired the roof of his house after a storm.',
        'A woman bought fresh vegetables at the market on Saturday.'
      ],
      ...gaps('education', [
        'Every child has the right to a free education, whatever their background.',
        'She believes that education is the best way out of poverty.',
        'The new minister wants to improve the quality of education in rural areas.'
      ], [['employment', 'recreation', 'industry'], ['recreation', 'loneliness', 'pronunciation'], ['loneliness', 'intonation', 'recreation']])
    }),
  e('higher education', 'noun',
    'study at a university or college after leaving secondary school',
    ['university study', 'study after school at a college or university'],
    ['the first years of school for young children', 'training that happens only at work', 'lessons for adults who cannot read'],
    'More young people than ever now go on to higher education after their final exams.',
    'university study', 'More young people than ever now go on to university study after their final exams.',
    'university or college study', 'The cost of university or college study has risen sharply in the last ten years.',
    {
      teacherNote:'Noun phrase: education at university or college level, after secondary school (go into higher education, a place in higher education, the cost of higher education). Uncountable. Boundary: "further education" in the UK is usually college study that is not at degree level; only higher education is taught here.',
      masteryContexts:mc(
        ['Many students take a gap year before they start higher education.', 'study at university or college after school'],
        ['The government gives loans to help students pay for higher education.', 'degree-level courses at universities and colleges']
      ),
      situationDistractors:[
        'A six-year-old learned to count to a hundred at primary school.',
        'A teenager left school at sixteen and started working in a shop.',
        'A grandmother joined a weekend class to learn to swim.'
      ],
      ...gaps('higher education', [
        'Fewer than half of the students in our town go on to higher education.',
        'A degree from a good university is the main goal of higher education for many students.',
        'The report shows that women now outnumber men in higher education.'
      ], [['primary school', 'loneliness', 'recreation'], ['recreation', 'pronunciation', 'loneliness'], ['intonation', 'recreation', 'pronunciation']])
    }),
  e('university', 'noun',
    'an institution where students study for degrees and where academic research is done',
    ['a place where students study for a degree', 'an institution for higher study'],
    ['a school for children aged five to eleven', 'a company that trains people to drive', 'a building where old books are sold'],
    'My brother is studying engineering at a university in Scotland.',
    'a place where students study for a degree', 'My brother is studying engineering at a place where students study for a degree in Scotland.',
    'college where you get a degree', 'She hopes to get into a good college where you get a degree in medicine.',
    {
      teacherNote:'Noun: an institution for degree-level study and research (go to university, at university, a university degree). Note "a university" (the first sound is /j/, so not *an university) and the British phrase "go to university" with no article. The adjective academic is the related word learners need.',
      masteryContexts:mc(
        ['After three years at university, he graduated with a degree in history.', 'a place where people study for a degree'],
        ['The university has one of the best medical research centres in the world.', 'an institution where academic research is carried out']
      ),
      situationDistractors:[
        'A boy started his first day at nursery and cried when his mother left.',
        'A woman took six driving lessons before she passed her test.',
        'A man worked as a cashier in a supermarket for ten years.'
      ],
      ...gaps('university', [
        'She was the first person in her family to go to university.',
        'The university offers more than two hundred different degree courses.',
        'He moved to London to study law at a famous university.'
      ], [['interview', 'opinion', 'industry'], ['interview', 'opinion', 'loneliness'], ['opinion', 'intonation', 'preference']])
    }),
  e('academic', 'adjective',
    'connected with education, studying and schoolwork, especially at a high level',
    ['connected with studying', 'related to schoolwork'],
    ['connected with sport and exercise', 'related to earning money', 'connected with friends and free time'],
    'Her academic results were so good that she won a scholarship.',
    'connected with studying', 'Her results connected with studying were so good that she won a scholarship.',
    'school-based', 'The school offers school-based support for students who find maths difficult.',
    {
      idKey:'academic_10',
      teacherNote:'Adjective: connected with education and study (academic results, academic subjects, the academic year, academic writing). Unit 10 uses it for school and university study; Unit 6 taught it for study skills. Boundary: academic is about study, not practical skills (vocational). The noun academy and the adverb academically are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['The academic year in our school starts in September and ends in June.', 'connected with the period when teaching takes place'],
        ['Some students are good at academic subjects like maths, while others prefer art or sport.', 'connected with study and theory rather than practical skills']
      ),
      situationDistractors:[
        'A boy spent his Saturday playing football with his cousins.',
        'A woman opened a café and spent the day serving customers.',
        'A group of friends went to the cinema after school.'
      ],
      ...gaps('academic', [
        'The school is proud of its strong academic results this year.',
        'Students must use a formal, academic style in their essays.',
        'He is a talented musician, but his academic work has suffered this term.'
      ], [['reluctant', 'cosmopolitan', 'overseas'], ['reluctant', 'cosmopolitan', 'lonely'], ['reluctant', 'cosmopolitan', 'overseas']])
    }),
  e('recreation', 'noun',
    'activities that people do for enjoyment when they are not working or studying',
    ['leisure activities', 'free-time activities'],
    ['work that people do to earn money', 'lessons that students must attend', 'jobs that people do at home, like cleaning'],
    'The town has built a new park with areas for sport and recreation.',
    'leisure activities', 'The town has built a new park with areas for sport and leisure activities.',
    'free-time activities', 'The school gives every student an hour a day for free-time activities.',
    {
      teacherNote:'Noun: activities done for enjoyment in free time (sport and recreation, a recreation centre, recreation ground). Uncountable. Boundary: recreation is enjoyable free-time activity; relaxation is resting and becoming calm. The adjective recreational is taught in the Word Family pathway.',
      masteryContexts:mc(
        ['The lake is used for recreation, such as swimming, fishing and sailing.', 'activities done for enjoyment'],
        ['Students need time for recreation as well as for study.', 'free time spent doing enjoyable things']
      ),
      situationDistractors:[
        'A student sat an exam in the school hall for three hours.',
        'A man worked overtime at the factory to earn extra money.',
        'A girl cleaned the kitchen floor because her mother asked her to.'
      ],
      ...gaps('recreation', [
        'The new centre offers a range of sport and recreation activities for teenagers.',
        'Playing chess is his favourite form of recreation.',
        'The city needs more green spaces for recreation.'
      ], [['assessment', 'employment', 'examination'], ['assessment', 'qualification', 'examination'], ['assessment', 'employment', 'qualification']])
    }),
  e('literacy', 'noun',
    'the ability to read and write',
    ['the ability to read and write', 'reading and writing skills'],
    ['the ability to speak several languages', 'the ability to do difficult sums', 'the habit of reading only for fun'],
    'The charity runs evening classes to improve adult literacy in the region.',
    'reading and writing skills', 'The charity runs evening classes to improve adults’ reading and writing skills in the region.',
    'the ability to read and write', 'Children who have not developed the ability to read and write by seven often fall behind.',
    {
      teacherNote:'Noun: the ability to read and write (literacy rates, adult literacy, literacy skills). By extension, knowledge of a particular area (digital literacy, media literacy). Uncountable. The adjectives literate and illiterate are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['In the region, literacy rates have risen quickly since every village got its own school.', 'the ability to read and write'],
        ['The course teaches digital literacy, such as how to check if a website is reliable.', 'knowledge and skills in a particular area']
      ),
      situationDistractors:[
        'A girl practised the violin every evening for her concert.',
        'A boy ran around the track five times to improve his fitness.',
        'A family planted tomatoes and beans in their garden.'
      ],
      ...gaps('literacy', [
        'The government launched a campaign to improve literacy among adults.',
        'Reading stories at bedtime helps young children develop literacy.',
        'The country now has a literacy rate of almost one hundred per cent.'
      ], [['recreation', 'industry', 'loneliness'], ['loneliness', 'employment', 'industry'], ['recreation', 'loneliness', 'industry']])
    }),
  e('assessment', 'noun',
    'the process of judging how well someone has learned or done something, or a test used to do this',
    ['an evaluation', 'a judgement of how well someone has done'],
    ['a list of rules for students to follow', 'a lesson in which a teacher explains new grammar', 'a prize given to the best student'],
    'Teachers use regular assessment to check how much students have understood.',
    'evaluation', 'Teachers use regular evaluation to check how much students have understood.',
    'judging of progress', 'The careful judging of progress every month helps teachers plan their lessons.',
    {
      teacherNote:'Noun: the process of judging someone’s learning or ability, or a test used for this (continuous assessment, a written assessment, an assessment of). Countable and uncountable. Boundary: an assessment can be any task that measures learning; an examination is a formal test, usually at the end of a course. The verb assess is taught in the Word Family pathway.',
      masteryContexts:mc(
        ['The course has no final exam; instead there is continuous assessment of your coursework.', 'judging how well students are doing'],
        ['The doctor made a quick assessment of the injured player before he went back on the pitch.', 'a judgement of how good or bad something is']
      ),
      situationDistractors:[
        'A teacher read a funny story to her class at the end of the day.',
        'A student chose a new pencil case in the school shop.',
        'A class went on a trip to the zoo without any worksheets.'
      ],
      ...gaps('assessment', [
        'The first assessment of the year is a short reading test.',
        'Our speaking assessment will take place next Tuesday.',
        'The teacher’s assessment of my essay was fair and very detailed.'
      ], [['loneliness', 'recreation', 'literacy'], ['loneliness', 'recreation', 'industry'], ['loneliness', 'recreation', 'literacy']])
    }),
  e('international crisis', 'noun',
    'a serious and dangerous situation that affects many countries at the same time',
    ['a global emergency', 'a serious problem affecting many countries'],
    ['a small disagreement between two neighbours', 'a festival celebrated in many countries', 'a meeting where countries sign a trade deal'],
    'The pandemic quickly became an international crisis that closed schools around the world.',
    'a global emergency', 'The pandemic quickly became a global emergency that closed schools around the world.',
    'serious problem affecting many countries', 'Climate change is a serious problem affecting many countries, and no nation can solve it alone.',
    {
      teacherNote:'Noun phrase: a serious, dangerous situation affecting many countries (cause / face / respond to an international crisis). Countable: crisis, plural crises. Boundary: a crisis is serious and needs urgent action; a problem can be small. The adjective critical and the word international are not separately taught here.',
      masteryContexts:mc(
        ['World leaders met in Geneva to discuss how to end the international crisis.', 'a dangerous situation affecting many countries'],
        ['When the war began, millions of people had to leave their homes, and it soon became an international crisis.', 'a serious emergency that needs action from many nations']
      ),
      situationDistractors:[
        'Two neighbours argued about where to park their cars.',
        'A village held a summer fair with music and games.',
        'A football team lost an important match in the final minute.'
      ],
      ...gaps('international crisis', [
        'Rising food prices in many countries have led to an international crisis.',
        'The United Nations called an emergency meeting to deal with the international crisis.',
        'Experts warn that a shortage of clean water could cause an international crisis.'
      ], [['interview', 'opinion', 'achievement'], ['interview', 'achievement', 'opportunity'], ['interview', 'achievement', 'opinion']])
    }),
  e('digital device', 'noun',
    'a piece of electronic equipment such as a phone, tablet or laptop',
    ['an electronic gadget', 'a phone, tablet or computer'],
    ['a printed book or magazine', 'a tool used in the kitchen', 'a machine used on a farm'],
    'Students may not use any digital device during the examination.',
    'electronic gadget', 'Students may not use any electronic gadget during the examination.',
    'phone, tablet or laptop', 'Every student will be given a phone, tablet or laptop to use for homework.',
    {
      teacherNote:'Noun phrase: an electronic machine such as a smartphone, tablet, laptop or e-reader (use / switch off a digital device). Countable. Common in school rules and articles about screen time. Boundary: a device is a piece of equipment made for a purpose; a digital device processes information electronically.',
      masteryContexts:mc(
        ['Children who spend too long on a digital device before bed often sleep badly.', 'an electronic machine such as a phone or tablet'],
        ['The library lends a digital device to any student who does not have a computer at home.', 'a piece of electronic equipment like a laptop']
      ),
      situationDistractors:[
        'A girl read a paperback novel on the train.',
        'A man chopped onions with a sharp knife.',
        'A farmer used a tractor to plough his field.'
      ],
      ...gaps('digital device', [
        'Please switch off every digital device before the film starts.',
        'A tablet is a useful digital device for reading e-books.',
        'Each digital device in the classroom is checked for viruses every week.'
      ], [['qualification', 'opinion', 'achievement'], ['qualification', 'opinion', 'achievement'], ['opinion', 'achievement', 'preference']])
    }),
  e('progress', 'noun',
    'movement towards achieving something or improving',
    ['improvement', 'development towards a goal'],
    ['a sudden loss of interest in something', 'the result of a single exam', 'a period of rest after hard work'],
    'The teacher was pleased with the progress the class had made in writing.',
    'improvement', 'The teacher was pleased with the improvement the class had made in writing.',
    'improvement', 'There has been steady improvement in her maths since she joined the new class.',
    {
      teacherNote:'Noun: improvement or movement towards a goal (make progress, good progress, a progress report). Uncountable: not *a progress or *progresses. The verb progress (stress on the second syllable) and the adjective progressive are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['After a month of daily practice, Ali made rapid progress with his pronunciation.', 'improvement in a skill'],
        ['Work on the new school building is making slow progress because of the rain.', 'forward movement towards finishing something']
      ),
      situationDistractors:[
        'A student forgot everything she had learned after the holiday.',
        'A boy got the same low score on every test all year.',
        'A builder stopped work on a house and left it unfinished for years.'
      ],
      ...gaps('progress', [
        'Your English has made excellent progress this term.',
        'The report shows the progress each student has made since September.',
        'Scientists are making progress in the search for a cure.'
      ], [['loneliness', 'recreation', 'industry'], ['loneliness', 'recreation', 'literacy'], ['loneliness', 'recreation', 'intonation']])
    }),
  e('encourage', 'verb',
    'to give someone support, confidence or hope so that they do something',
    ['support', 'give someone confidence to do something'],
    ['to stop someone from doing something', 'to criticise someone in front of others', 'to ignore what someone is trying to do'],
    'My parents always encourage me to try new activities.',
    'support', 'My parents always support me in trying new activities.',
    'give me the confidence', 'My coach gave me the confidence to enter the race.',
    {
      teacherNote:'Verb: to give support or confidence, or to make something more likely (encourage someone to do something, encourage reading). Pattern: encourage + object + to-infinitive. Opposite: discourage. The noun encouragement and the adjective encouraging are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Good teachers encourage shy students to share their ideas.', 'to give someone the confidence to do something'],
        ['The new bike lanes are meant to encourage more people to cycle to work.', 'to make an action more likely to happen']
      ),
      situationDistractors:[
        'A coach told a player she would never be good enough for the team.',
        'A mother told her son to stop playing the drums.',
        'A teacher ignored a student who raised her hand.'
      ],
      ...gaps('encourage', [
        'Teachers should encourage students to read for pleasure.',
        'The school wants to encourage healthy eating by selling more fruit.',
        'My friends encourage me whenever I feel like giving up.'
      ], [['succeed', 'reflect', 'communicate'], ['succeed', 'contribute', 'reflect'], ['succeed', 'contribute', 'develop']])
    }),
  e('reflect', 'verb',
    'to think carefully and seriously about something, especially something you have done',
    ['think carefully about', 'consider seriously'],
    ['to forget about something quickly', 'to complain loudly about something', 'to copy what someone else has done'],
    'At the end of each term, students reflect on what they have learned.',
    'think carefully', 'At the end of each term, students think carefully about what they have learned.',
    'look back on', 'After the match, the players looked back on their mistakes.',
    {
      idKey:'reflect_10',
      teacherNote:'Verb: to think carefully about something, especially your own experience or learning (reflect on / upon something). Unit 10 uses it for learning and progress; Unit 6 taught it for study habits. A second sense, to show or be a sign of (the results reflect your hard work), is also common. The noun reflection and the adjective reflective are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Take a few minutes to reflect on how well your group worked together.', 'to think carefully about an experience'],
        ['Your excellent exam results reflect the hard work you have done all year.', 'to show or be a sign of something']
      ),
      situationDistractors:[
        'A boy threw his test paper in the bin without looking at it.',
        'A girl rushed out of the classroom as soon as the bell rang.',
        'A student copied a friend’s answers without reading them.'
      ],
      ...gaps('reflect', [
        'Use this diary to reflect on what went well each day.',
        'It is important to reflect on your mistakes so that you can improve.',
        'Before choosing a career, reflect on what you really enjoy doing.'
      ], [['succeed', 'contribute', 'encourage'], ['succeed', 'encourage', 'communicate'], ['succeed', 'encourage', 'develop']])
    }),
  e('performance', 'noun',
    'how well a person or thing does a piece of work or an activity',
    ['achievement level', 'how well someone does something'],
    ['the reason why someone chose a subject', 'the amount of free time a student has', 'the rules a school expects students to follow'],
    'Her performance in the final exam was much better than in the mock.',
    'how well she did', 'How well she did in the final exam was much better than in the mock.',
    'how well they did', 'The coach was proud of how well they did in the second half.',
    {
      teacherNote:'Noun: how well someone does a task or activity (academic performance, performance in an exam, improve your performance). Second common sense: a show in front of an audience (a performance of a play). The verb perform and the noun performer are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Getting enough sleep can improve your performance at school.', 'how well someone does their work'],
        ['The school choir gave a wonderful performance at the end-of-year concert.', 'an act of singing, dancing or acting for an audience']
      ),
      situationDistractors:[
        'A girl chose which subjects to study next year.',
        'A boy spent his free afternoon tidying his room.',
        'A teacher read the school rules to the new students.'
      ],
      ...gaps('performance', [
        'The team’s performance improved after the new coach arrived.',
        'Teachers discussed each student’s performance at the parents’ evening.',
        'His performance in the speaking test showed how much he had practised.'
      ], [['loneliness', 'literacy', 'recreation'], ['loneliness', 'recreation', 'intonation'], ['loneliness', 'recreation', 'literacy']])
    }),
  e('confidence', 'noun',
    'the feeling that you can do something well or that you can trust someone or something',
    ['self-belief', 'a feeling that you can succeed'],
    ['a feeling of worry before a test', 'a strong wish to be alone', 'the habit of copying other people'],
    'Speaking in class every day gave her more confidence in English.',
    'self-belief', 'Speaking in class every day gave her more self-belief in English.',
    'belief in herself', 'Winning the competition gave Mia a strong belief in herself.',
    {
      idKey:'confidence_10',
      teacherNote:'Noun: the feeling that you can do things well, or trust in someone (gain / lose / build confidence, confidence in someone). Unit 10 uses it for learning and speaking; Units 6 and 7 taught it for study and interviews. The adjective confident and the adverb confidently are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['After failing his driving test twice, Sam lost all his confidence.', 'the belief that you can do something well'],
        ['Parents have great confidence in the new head teacher.', 'trust in someone’s ability']
      ),
      situationDistractors:[
        'A girl’s hands shook as she waited for her exam to start.',
        'A boy hid at the back of the class so the teacher would not ask him a question.',
        'A student refused to answer because she was sure she would be wrong.'
      ],
      ...gaps('confidence', [
        'Practising in front of a mirror helped me build confidence before my presentation.',
        'The good mark gave him the confidence to try the harder course.',
        'She spoke with great confidence about her ideas.'
      ], [['loneliness', 'recreation', 'literacy'], ['loneliness', 'recreation', 'literacy'], ['loneliness', 'recreation', 'industry']])
    }),
  e('contribute', 'verb',
    'to give something, such as ideas, money or effort, to help achieve something',
    ['give', 'add your part to'],
    ['to take something away from a group', 'to refuse to take part in something', 'to watch others without helping'],
    'Everyone in the group should contribute ideas to the project.',
    'give', 'Everyone in the group should give ideas to the project.',
    'help to cause', 'Lack of sleep can help to cause poor results at school.',
    {
      idKey:'contribute_10',
      teacherNote:'Verb: to give ideas, money or effort to help (contribute to something, contribute ideas); also to be one of the causes (contribute to a problem). Stress on the second syllable. Unit 10 uses it for group work and learning; Unit 7 taught it for teamwork at work. The nouns contribution and contributor are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['All students are expected to contribute to class discussions.', 'to give ideas or effort to help'],
        ['Too much screen time can contribute to poor concentration.', 'to be one of the causes of something']
      ),
      situationDistractors:[
        'A boy sat silently and let the others do all the work.',
        'A girl took the last biscuit and gave nothing back.',
        'A student left the group meeting before it started.'
      ],
      ...gaps('contribute', [
        'Each family was asked to contribute some money for the school trip.',
        'I want to contribute something useful to the discussion.',
        'Regular exercise can contribute to better sleep.'
      ], [['succeed', 'reflect', 'evaluate'], ['succeed', 'reflect', 'develop'], ['succeed', 'evaluate', 'communicate']])
    }),
  e('condition', 'noun',
    'something that must happen or be true before something else can happen; also the state that something or someone is in',
    ['requirement', 'state'],
    ['a reward given after an exam', 'a reason for being late', 'a short break between lessons'],
    'One condition of the scholarship is that you keep good grades.',
    'requirement', 'One requirement of the scholarship is that you keep good grades.',
    'state', 'The old textbooks were in a terrible state, so the school bought new ones.',
    {
      teacherNote:'Noun: (1) something that must be true before something else happens (on condition that, a condition of entry); (2) the state of something (in good / bad condition); (3) plural, the situation people live or work in (working conditions). The adjective conditional is a separate Unit 10 target.',
      masteryContexts:mc(
        ['You can borrow the laptop on condition that you return it by Friday.', 'something that must happen first'],
        ['Although the car is twenty years old, it is still in excellent condition.', 'the state that something is in']
      ),
      situationDistractors:[
        'A student received a prize for being the best in her class.',
        'A boy explained that his bus had been late.',
        'The class had a ten-minute break between maths and science.'
      ],
      ...gaps('condition', [
        'The only condition for joining the club is that you attend every week.',
        'The bike was cheap because it was in poor condition.',
        'I will help you on one condition: you must do the washing up.'
      ], [['loneliness', 'literacy', 'recreation'], ['loneliness', 'recreation', 'literacy'], ['loneliness', 'recreation', 'industry']])
    }),
  e('conditional', 'noun',
    'a sentence or clause, often beginning with if, that describes a possible situation and its result',
    ['an if-sentence', 'a sentence about a possible situation and its result'],
    ['a sentence that reports what someone else said', 'a question that needs only a yes or no answer', 'a sentence that gives an order'],
    'We use the first conditional to talk about likely situations in the future.',
    'if-sentence', 'We use the first type of if-sentence to talk about likely situations in the future.',
    'if-sentence', 'An if-sentence such as “If it rains, we will stay inside” has two clauses.',
    {
      teacherNote:'Noun (grammar): a sentence or clause about a possible or imagined situation and its result, usually with if (the zero, first, second and third conditional). Also an adjective (a conditional clause, conditional on). Linked to the noun condition. Students should be able to name and form the main conditionals.',
      masteryContexts:mc(
        ['“If I had more time, I would learn Japanese” is an example of the second conditional.', 'a type of if-sentence about an imagined situation'],
        ['In your essay, try to use a conditional to explain what might happen if the plan fails.', 'a sentence that describes a possible situation and its result']
      ),
      situationDistractors:[
        'A student wrote: “She said that she was tired.”',
        'A teacher asked: “Have you finished your homework?”',
        'A sign said: “Close the door.”'
      ],
      ...gaps('conditional', [
        'The sentence “If you heat ice, it melts” is a zero conditional.',
        'We practised the third conditional by talking about past regrets.',
        'Try to include at least one conditional in your persuasive speech.'
      ], [['intonation', 'pronunciation', 'loneliness'], ['intonation', 'pronunciation', 'recreation'], ['loneliness', 'recreation', 'industry']])
    }),
  e('preparation', 'noun',
    'the work or planning done to get ready for something',
    ['getting ready', 'planning in advance'],
    ['the results announced after an event', 'a feeling of surprise when something happens', 'the act of cancelling an event'],
    'Good preparation is the key to doing well in exams.',
    'getting ready', 'Getting ready properly is the key to doing well in exams.',
    'planning in advance', 'Careful planning in advance meant the school trip went smoothly.',
    {
      teacherNote:'Noun: the work of getting ready for something (preparation for an exam, in preparation for, preparations for a festival). Uncountable for the process; plural preparations for the practical tasks. The verb prepare and the adjective prepared are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['The students spent two weeks in preparation for the science fair.', 'work done to get ready'],
        ['The family spent almost a year on preparation for the wedding.', 'the planning and arrangements made before an event']
      ),
      situationDistractors:[
        'The head teacher announced the winners of the competition.',
        'A boy was shocked when the fire alarm suddenly rang.',
        'A concert was cancelled because the singer was ill.'
      ],
      ...gaps('preparation', [
        'Interview preparation includes researching the company and practising answers.',
        'The athletes trained every day in preparation for the race.',
        'Without proper preparation, the presentation was confusing.'
      ], [['loneliness', 'literacy', 'recreation'], ['loneliness', 'recreation', 'literacy'], ['loneliness', 'recreation', 'intonation']])
    }),
  e('employment', 'noun',
    'the situation of having a paid job, or the work that people are paid to do',
    ['paid work', 'having a job'],
    ['time spent studying at university', 'money given to people who are ill', 'a hobby that people enjoy at weekends'],
    'A good qualification makes it easier to find employment.',
    'paid work', 'A good qualification makes it easier to find paid work.',
    'jobs', 'The new factory will create jobs for about five hundred people in the town.',
    {
      idKey:'employment_10',
      teacherNote:'Noun: having a paid job, or paid work in general (find employment, full-time / part-time employment, employment opportunities). Uncountable. Unit 10 uses it to link education with future work; Unit 8 taught it in the world of work. The verb employ and the nouns employer, employee and unemployment are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Graduates in engineering usually find employment within six months.', 'a paid job'],
        ['The government wants to increase employment in poorer regions.', 'the number of people who have paid work']
      ),
      situationDistractors:[
        'A student spent the summer reading novels at home.',
        'A man stayed in hospital for a week after an accident.',
        'A girl played the guitar with friends on Saturday mornings.'
      ],
      ...gaps('employment', [
        'Many young people move to cities in search of employment.',
        'The course improves your chances of employment in the tourism industry.',
        'He has been in full-time employment since he left school.'
      ], [['loneliness', 'pronunciation', 'intonation'], ['loneliness', 'pronunciation', 'intonation'], ['loneliness', 'literacy', 'recreation']])
    }),
  e('career', 'noun',
    'the series of jobs that a person does in a particular type of work, usually over a long time',
    ['professional life', 'working life'],
    ['a short holiday between two jobs', 'the first day at a new school', 'a hobby done only at weekends'],
    'She wants a career in medicine, so she is studying biology and chemistry.',
    'working life', 'She wants a working life in medicine, so she is studying biology and chemistry.',
    'professional life', 'He spent his whole professional life working as a journalist.',
    {
      teacherNote:'Noun: the jobs a person does over a long period in one type of work (a career in law, a career change, career advice). Countable. Stress on the second syllable. Boundary: a job is a particular position; a career is a long-term path. Common error: confusing career with course (a course of study).',
      masteryContexts:mc(
        ['The school offers career advice to help students choose the right path.', 'the type of work someone plans to do for a long time'],
        ['During his long career as a footballer, he played for five different clubs.', 'the period of time someone spends working in a profession']
      ),
      situationDistractors:[
        'A family spent a week on holiday in the mountains.',
        'A boy felt nervous on his first day at a new school.',
        'A woman went fishing every Sunday morning.'
      ],
      ...gaps('career', [
        'Choosing a career is one of the most important decisions you will make.',
        'She had a successful career as a lawyer before she became a judge.',
        'A degree in computer science can lead to a well-paid career.'
      ], [['loneliness', 'literacy', 'recreation'], ['literacy', 'loneliness', 'pronunciation'], ['loneliness', 'literacy', 'intonation']])
    }),
  e('subject', 'noun',
    'an area of knowledge that is studied at school, college or university',
    ['area of study', 'school course'],
    ['a teacher who works at a school', 'a room where students take exams', 'a holiday at the end of a school term'],
    'Maths is my favourite subject because I like solving problems.',
    'area of study', 'Maths is my favourite area of study because I like solving problems.',
    'course', 'You can choose one creative course, such as art or music, next year.',
    {
      teacherNote:'Noun: an area of knowledge studied at school or university (school subjects, my favourite subject, a compulsory subject); also the topic of a conversation or text (change the subject). Countable. Boundary: in this unit, subject is not taught as the grammatical subject of a sentence.',
      masteryContexts:mc(
        ['In Year 10, every student must choose one optional subject from art, music or drama.', 'an area of study at school'],
        ['Climate change is the subject of our next class debate.', 'the topic that is discussed or written about']
      ),
      situationDistractors:[
        'A new teacher joined the staff of the school in January.',
        'Students waited outside the exam hall for the doors to open.',
        'The children enjoyed a two-week holiday in the spring.'
      ],
      ...gaps('subject', [
        'History is a popular subject at our school.',
        'You must pass every compulsory subject to go into the sixth form.',
        'He felt uncomfortable and quickly changed the subject.'
      ], [['loneliness', 'literacy', 'recreation'], ['loneliness', 'recreation', 'literacy'], ['loneliness', 'literacy', 'recreation']])
    }),
  e('aspect', 'noun',
    'one part or feature of a situation, problem or subject',
    ['feature', 'part'],
    ['the final result of a long process', 'a person who gives advice', 'the date when something must be finished'],
    'The most difficult aspect of learning a language is remembering vocabulary.',
    'part', 'The most difficult part of learning a language is remembering vocabulary.',
    'feature', 'One important feature of the new course is the weekly speaking practice.',
    {
      teacherNote:'Noun: one part or feature of something (an important aspect of, every aspect of, the social aspect). Countable. Common in Paper 2 writing: "One positive aspect of ... is ...". Boundary: an aspect is one feature among several; a factor is something that causes a result.',
      masteryContexts:mc(
        ['The article looks at every aspect of school life, from lessons to lunches.', 'one part or feature of something'],
        ['For many students, the social aspect of university is as important as the studying.', 'a particular side of a situation']
      ),
      situationDistractors:[
        'A student found out her final grade at the end of the course.',
        'A careers adviser helped a boy choose a college.',
        'The teacher said the essay must be handed in by Friday.'
      ],
      ...gaps('aspect', [
        'Teamwork is an important aspect of working in a hospital.',
        'Which aspect of the job do you enjoy most?',
        'The report considers each aspect of the problem in detail.'
      ], [['opportunity', 'achievement', 'interview'], ['loneliness', 'literacy', 'recreation'], ['loneliness', 'literacy', 'recreation']])
    }),
  e('industry', 'noun',
    'the businesses that produce a particular type of goods or provide a particular service',
    ['business sector', 'type of business'],
    ['a single shop owned by a family', 'a law passed by the government', 'a place where students live at university'],
    'The tourism industry employs thousands of people in our country.',
    'business sector', 'The tourism business sector employs thousands of people in our country.',
    'businesses that make cars', 'The businesses that make cars have moved many factories abroad.',
    {
      teacherNote:'Noun: (1) the businesses in one area of trade (the film industry, the tourism industry); (2) the production of goods in factories in general (heavy industry). Countable in sense 1. The adjective industrial and the verb industrialise are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['She wants to work in the fashion industry as a designer.', 'the businesses involved in one type of work'],
        ['The town grew quickly in the nineteenth century because of its steel industry.', 'the production of goods in factories']
      ),
      situationDistractors:[
        'A couple opened one small bakery in their village.',
        'Parliament passed a new law about school uniforms.',
        'A student moved into a shared flat near the university.'
      ],
      ...gaps('industry', [
        'The music industry has changed completely since streaming became popular.',
        'Many graduates find jobs in the technology industry.',
        'Farming is still the main industry in this region.'
      ], [['loneliness', 'literacy', 'intonation'], ['loneliness', 'literacy', 'pronunciation'], ['loneliness', 'literacy', 'intonation']])
    }),
  e('interview', 'noun',
    'a formal meeting in which someone is asked questions, for example to decide whether they are suitable for a job or course',
    ['formal meeting with questions', 'question-and-answer session'],
    ['a written test taken at the end of a course', 'a party to celebrate a new job', 'a lesson in which students work alone'],
    'He wore a suit to his interview for the job at the bank.',
    'formal meeting with questions', 'He wore a suit to his formal meeting with questions for the job at the bank.',
    'question-and-answer meeting', 'All applicants for the course will have a short question-and-answer meeting with a tutor.',
    {
      teacherNote:'Noun: a formal meeting where someone is asked questions (a job interview, an interview for a place at university, give / have an interview); also a conversation with a famous person reported in the media. Also a verb (interview someone). The nouns interviewer and interviewee are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Universities sometimes hold an interview before offering a student a place.', 'a meeting to decide if someone is suitable'],
        ['The magazine published an interview with the famous singer.', 'a conversation in which a journalist asks a person questions']
      ),
      situationDistractors:[
        'Students sat a two-hour written exam in silence.',
        'Friends held a party to celebrate Tom’s new job.',
        'A student worked alone on a crossword in the library.'
      ],
      ...gaps('interview', [
        'Practise answering common questions before your interview.',
        'The radio station broadcast an interview with the head teacher.',
        'She was nervous, but the interview went very well.'
      ], [['literacy', 'loneliness', 'recreation'], ['literacy', 'loneliness', 'recreation'], ['literacy', 'loneliness', 'recreation']])
    }),
  e('overseas', 'adjective',
    'from, in or connected with a foreign country, especially one across the sea',
    ['foreign', 'from abroad'],
    ['living in the same town', 'connected with the countryside', 'belonging to the local area'],
    'The university welcomes overseas students from more than eighty countries.',
    'foreign', 'The university welcomes foreign students from more than eighty countries.',
    'international', 'The company is hoping to win more international customers next year.',
    {
      teacherNote:'Adjective: from or in a foreign country (overseas students, an overseas trip, overseas aid). Also an adverb (study overseas, work overseas). Same form in both uses; there is no "overseasly". Boundary: overseas usually suggests a distant country, often across the sea; abroad is the more general adverb.',
      masteryContexts:mc(
        ['Many overseas students need help finding accommodation when they first arrive.', 'from another country'],
        ['The school organises an overseas trip every summer, usually to France or Spain.', 'to or in a foreign country']
      ),
      situationDistractors:[
        'A boy walked to the corner shop in his own street.',
        'A girl visited her grandparents in the next village.',
        'A student joined the local football club in his town.'
      ],
      ...gaps('overseas', [
        'The number of overseas visitors to the city has doubled.',
        'She is saving money for an overseas holiday next year.',
        'Many overseas students choose to study business or engineering.'
      ], [['reluctant', 'academic', 'lonely'], ['reluctant', 'academic', 'lonely'], ['reluctant', 'lonely', 'accurate']])
    }),
  e('challenge', 'noun',
    'something new and difficult that tests your ability and skill',
    ['difficult task', 'test of ability'],
    ['an easy task that needs no effort', 'a reward for finishing work early', 'a reason to stop trying'],
    'Learning to play the piano at sixty was a real challenge for my grandfather.',
    'difficult task', 'Learning to play the piano at sixty was a really difficult task for my grandfather.',
    'test of her ability', 'Running the marathon was the biggest test of her ability so far.',
    {
      idKey:'challenge_10',
      teacherNote:'Noun: something difficult that tests ability (a big challenge, face a challenge, rise to the challenge). Countable. Also a verb (challenge someone to do something; challenge an idea). Unit 10 uses it for learning and studying abroad; Unit 1 taught it for sport. The adjective challenging is taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Moving to a new school in another country was a big challenge for Aisha.', 'something difficult that tests you'],
        ['The teacher set the class a challenge: learn twenty new words in a week.', 'a difficult task that someone is invited to try']
      ),
      situationDistractors:[
        'A boy finished an easy puzzle in two minutes.',
        'A girl was given a sticker for finishing her work early.',
        'A student gave up the course after the first lesson.'
      ],
      ...gaps('challenge', [
        'Writing an essay in a foreign language is a real challenge.',
        'The biggest challenge for new students is making friends.',
        'She loves a challenge, so she chose the hardest project.'
      ], [['loneliness', 'literacy', 'recreation'], ['literacy', 'pronunciation', 'recreation'], ['literacy', 'loneliness', 'recreation']])
    }),
  e('reluctant', 'adjective',
    'not wanting to do something and therefore slow to do it',
    ['unwilling', 'not keen'],
    ['excited and eager to start', 'too tired to continue', 'proud of what you have done'],
    'Many students are reluctant to speak English in front of the whole class.',
    'unwilling', 'Many students are unwilling to speak English in front of the whole class.',
    'did not want', 'He did not want to admit that he had not done his homework.',
    {
      teacherNote:'Adjective: not wanting to do something (reluctant to do something, a reluctant student). Pattern: be reluctant + to-infinitive. The noun reluctance and the adverb reluctantly are taught in the Word Family pathway. Boundary: reluctant means unwilling but may still do it; refuse means will not do it at all.',
      masteryContexts:mc(
        ['She was reluctant to leave her friends and move to a new city.', 'not wanting to do something'],
        ['The reluctant students finally agreed to join the drama club.', 'unwilling at first']
      ),
      situationDistractors:[
        'A boy jumped up immediately to volunteer for the school play.',
        'A girl ran to the front of the queue to get her ticket.',
        'A student proudly showed everyone his trophy.'
      ],
      ...gaps('reluctant', [
        'Teenagers are often reluctant to ask for help with their work.',
        'He was reluctant to try the spicy food, but he loved it.',
        'The shy boy was reluctant to give his opinion in the discussion.'
      ], [['academic', 'overseas', 'cosmopolitan'], ['academic', 'overseas', 'cosmopolitan'], ['academic', 'overseas', 'cosmopolitan']])
    }),
  e('cosmopolitan', 'adjective',
    'having people, ideas or influences from many different countries and cultures',
    ['multicultural', 'international'],
    ['quiet and far from other towns', 'old-fashioned and traditional', 'small and very expensive'],
    'London is a cosmopolitan city where you can hear hundreds of languages.',
    'multicultural', 'London is a multicultural city where you can hear hundreds of languages.',
    'international', 'The school has an international atmosphere because students come from thirty countries.',
    {
      teacherNote:'Adjective: containing people and influences from many countries (a cosmopolitan city, a cosmopolitan atmosphere); of a person, having experience of many countries. Usually positive. Boundary: cosmopolitan describes a mix of cultures; international describes something involving more than one country.',
      masteryContexts:mc(
        ['Dubai has become a cosmopolitan city, with workers from all over the world.', 'full of people from many countries'],
        ['After living in six countries, she has a very cosmopolitan outlook.', 'showing experience of many cultures']
      ),
      situationDistractors:[
        'A tiny farming village had only one road and one shop.',
        'A family followed the same traditions for two hundred years.',
        'A small mountain town had no visitors in winter.'
      ],
      ...gaps('cosmopolitan', [
        'The university has a cosmopolitan atmosphere, with students from every continent.',
        'Singapore is famous for its cosmopolitan food, from Indian curries to Chinese noodles.',
        'Living in such a cosmopolitan city helped him learn about many cultures.'
      ], [['reluctant', 'academic', 'lonely'], ['reluctant', 'lonely', 'accurate'], ['reluctant', 'lonely', 'accurate']])
    }),
  e('assignment', 'noun',
    'a piece of work that a student is given to do as part of a course',
    ['a piece of coursework', 'a task set by a teacher'],
    ['a test that students take without warning', 'a holiday at the end of term', 'a meeting between parents and teachers'],
    'The history assignment must be handed in by Friday.',
    'piece of coursework', 'This piece of coursework for history must be handed in by Friday.',
    'task set by the teacher', 'I spent the whole weekend on a task set by the teacher about rainforests.',
    {
      idKey:'assignment_10',
      teacherNote:'Noun: a piece of work given to a student (a written assignment, hand in an assignment, set an assignment). Countable. Unit 10 uses it for school and university work; Unit 8 taught it for tasks at work. The verb assign is taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Our English assignment is to write a review of a book we have read.', 'a piece of work set as part of a course'],
        ['At university, each long written assignment counts towards your final grade.', 'a written task that counts towards a course']
      ),
      situationDistractors:[
        'The class was surprised by a quiz at the start of the lesson.',
        'Students went home for a two-week holiday.',
        'Parents met teachers in the hall to talk about progress.'
      ],
      ...gaps('assignment', [
        'I forgot to save my assignment and had to write it again.',
        'The teacher set an assignment on the causes of climate change.',
        'Late work will lose marks, so hand in your assignment on time.'
      ], [['loneliness', 'literacy', 'recreation'], ['loneliness', 'literacy', 'intonation'], ['loneliness', 'literacy', 'recreation']])
    }),
  e('loneliness', 'noun',
    'the unhappy feeling of being alone or having no friends to talk to',
    ['isolation', 'the feeling of being alone'],
    ['the feeling of being very busy', 'the pleasure of being with friends', 'the worry of failing an exam'],
    'Many overseas students experience loneliness in their first weeks away from home.',
    'isolation', 'Many overseas students experience isolation in their first weeks away from home.',
    'feeling of being alone', 'Joining a club helped him overcome the feeling of being alone.',
    {
      teacherNote:'Noun: the unhappy feeling of being alone (feelings of loneliness, suffer from loneliness). Uncountable. Boundary: loneliness is unhappy; solitude is being alone by choice and can be positive. The adjective lonely is taught in the Word Family pathway; note "lonely" is an adjective, not an adverb.',
      masteryContexts:mc(
        ['After his wife died, the old man struggled with loneliness.', 'unhappiness from being alone'],
        ['Video calls with her family helped reduce her loneliness while she studied abroad.', 'the feeling of missing people and being alone']
      ),
      situationDistractors:[
        'A busy student had five tests and two clubs in one week.',
        'A girl laughed with her friends at a birthday party.',
        'A boy worried that he might fail his maths exam.'
      ],
      ...gaps('loneliness', [
        'Moving to a new country can lead to feelings of loneliness.',
        'The charity visits elderly people to reduce their loneliness.',
        'Social media does not always protect young people from loneliness.'
      ], [['qualification', 'industry', 'pronunciation'], ['qualification', 'pronunciation', 'industry'], ['qualification', 'industry', 'intonation']])
    }),
  e('opportunity', 'noun',
    'a time or situation when it is possible to do something you want to do',
    ['chance', 'good moment'],
    ['a problem that stops you from acting', 'a rule that everyone must obey', 'a mistake that cannot be corrected'],
    'Studying abroad gave her the opportunity to learn a new language.',
    'chance', 'Studying abroad gave her the chance to learn a new language.',
    'chance', 'The trip was a great chance to see how people live in other countries.',
    {
      teacherNote:'Noun: a situation that makes it possible to do something (an opportunity to do something, take / miss an opportunity, job opportunities, equal opportunities). Countable. Boundary: opportunity is a good, often planned chance; chance can also mean luck or possibility.',
      masteryContexts:mc(
        ['The summer job is an excellent opportunity to gain experience.', 'a chance to do something useful'],
        ['Every child should have an equal opportunity to go to school, whatever their background.', 'a fair chance that is open to everyone']
      ),
      situationDistractors:[
        'A broken leg stopped a boy from playing in the final.',
        'Students had to wear school uniform every day.',
        'A girl sent an email to the wrong person and could not get it back.'
      ],
      ...gaps('opportunity', [
        'Do not miss this opportunity to meet students from other countries.',
        'The exchange programme is a great opportunity for language learners.',
        'I would like to take this opportunity to thank my teachers.'
      ], [['loneliness', 'literacy', 'recreation'], ['loneliness', 'literacy', 'recreation'], ['loneliness', 'literacy', 'intonation']])
    }),
  e('examination', 'noun',
    'a formal test of a student’s knowledge or ability in a subject',
    ['formal test', 'exam'],
    ['an informal chat with a teacher', 'a book used for revision', 'a class trip to a museum'],
    'All students must take a written examination at the end of the course.',
    'formal test', 'All students must take a formal test at the end of the course.',
    'formal test', 'You will need a calculator for the formal test in maths next week.',
    {
      teacherNote:'Noun: a formal test of knowledge or ability (sit / take / pass / fail an examination); also a careful check (a medical examination). Countable. "Exam" is the common short form. The verb examine and the noun examiner are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Mobile phones are not allowed in the room during the examination.', 'a formal test of knowledge'],
        ['After the accident, the doctor carried out a full examination of the boy’s arm.', 'a careful check of someone’s body']
      ),
      situationDistractors:[
        'A student had a relaxed chat with her teacher after class.',
        'A boy bought a new revision guide in the bookshop.',
        'The class went on a trip to the science museum.'
      ],
      ...gaps('examination', [
        'She passed the final examination with excellent marks.',
        'The examination lasts two hours and has three sections.',
        'Students must arrive fifteen minutes before the examination starts.'
      ], [['loneliness', 'recreation', 'literacy'], ['loneliness', 'recreation', 'literacy'], ['loneliness', 'recreation', 'literacy']])
    }),
  e('research', 'noun',
    'detailed study of a subject in order to discover new facts or information',
    ['investigation', 'careful study to find facts'],
    ['a guess made without any evidence', 'a story invented for entertainment', 'a summary written from memory'],
    'Research shows that students who sleep well remember more.',
    'investigation', 'Careful investigation shows that students who sleep well remember more.',
    'studies', 'New studies suggest that learning music can improve memory.',
    {
      idKey:'research_10',
      teacherNote:'Noun: detailed study to discover new facts (do / carry out research, research into / on something, research shows that). Uncountable: not *a research or *researches. Also a verb (research a topic). Unit 10 uses it for academic study; Unit 9 taught it for reports and presentations. The noun researcher is taught in the Word Family pathway.',
      masteryContexts:mc(
        ['The university is famous for its research into renewable energy.', 'detailed scientific study'],
        ['Before writing your essay, do some research on the topic in the library.', 'reading and studying to find information']
      ),
      situationDistractors:[
        'A boy guessed the answer without reading the question.',
        'A writer invented a funny story about a talking cat.',
        'A student wrote a summary from memory without checking any facts.'
      ],
      ...gaps('research', [
        'Recent research suggests that teenagers need more sleep than adults.',
        'Her research on plastic pollution won a national prize.',
        'Students should use reliable websites when they do research.'
      ], [['loneliness', 'recreation', 'intonation'], ['loneliness', 'recreation', 'intonation'], ['loneliness', 'recreation', 'intonation']])
    }),
  e('presentation', 'noun',
    'a talk in which someone explains a subject to an audience, often using slides or pictures',
    ['talk', 'formal talk to an audience'],
    ['a private conversation between two friends', 'a written test with no speaking', 'a list of homework tasks'],
    'Each student will give a five-minute presentation about a famous scientist.',
    'talk', 'Each student will give a five-minute talk about a famous scientist.',
    'talk', 'The manager gave a talk to explain the new sales plan.',
    {
      teacherNote:'Noun: a talk explaining a subject to an audience (give / make / do a presentation, a presentation on / about). Countable. A key speaking skill in this unit, linked with pronunciation and intonation. The verb present and the noun presenter are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Her presentation on recycling included clear slides and a short video.', 'a talk to an audience with information'],
        ['The prize-giving ceremony ended with the presentation of the awards.', 'the act of formally giving something to someone']
      ),
      situationDistractors:[
        'Two friends whispered to each other at the back of the bus.',
        'Students wrote answers to a reading test in silence.',
        'A teacher wrote the homework on the board.'
      ],
      ...gaps('presentation', [
        'Practise your presentation several times before you give it to the class.',
        'The best presentation had clear slides and a strong conclusion.',
        'He felt nervous at the start of his presentation, but he soon relaxed.'
      ], [['loneliness', 'literacy', 'recreation'], ['loneliness', 'literacy', 'recreation'], ['loneliness', 'literacy', 'recreation']])
    }),
  e('pronunciation', 'noun',
    'the way in which a word or language is spoken',
    ['way of saying words', 'how words are spoken'],
    ['the way words are spelled', 'the meaning of a word', 'the speed at which someone reads'],
    'Her grammar is excellent, but she needs to work on her pronunciation.',
    'way of saying words', 'Her grammar is excellent, but she needs to work on her way of saying words.',
    'way he says', 'The way he says the word “comfortable” is not quite right.',
    {
      teacherNote:'Noun: the way words or a language are spoken (good / clear pronunciation, the pronunciation of a word). Uncountable. Common spelling error: *pronounciation (the verb is pronounce, but the noun drops the o). The verb pronounce is taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Listening to podcasts helped Carlos improve his English pronunciation.', 'the way someone speaks a language'],
        ['The dictionary shows the pronunciation of each word using special symbols.', 'how a particular word is said']
      ),
      situationDistractors:[
        'A student checked how many letters were in a long word.',
        'A boy looked up what a new word meant in the dictionary.',
        'A girl timed how fast she could read a page.'
      ],
      ...gaps('pronunciation', [
        'The teacher corrected my pronunciation of the word “island”.',
        'Clear pronunciation is important when you give a presentation.',
        'Singing songs is a fun way to practise pronunciation.'
      ], [['loneliness', 'industry', 'literacy'], ['loneliness', 'industry', 'literacy'], ['loneliness', 'industry', 'employment']])
    }),
  e('intonation', 'noun',
    'the rise and fall of the voice when speaking, which can change the meaning or show feelings',
    ['rise and fall of the voice', 'tone of voice'],
    ['the number of words in a sentence', 'the order of words in a sentence', 'the loudness of background noise'],
    'Rising intonation at the end of a sentence often shows that it is a question.',
    'rise and fall of the voice', 'The rise and fall of the voice at the end of a sentence often shows that it is a question.',
    'the rise and fall of your voice', 'Listeners can tell if you are bored from the rise and fall of your voice.',
    {
      teacherNote:'Noun: the rise and fall of the voice in speech (rising / falling intonation). Uncountable. Intonation shows questions, surprise, politeness or boredom. Boundary: pronunciation is how individual sounds and words are said; intonation is the pattern of the voice across a whole phrase.',
      masteryContexts:mc(
        ['A flat intonation can make a speaker sound bored or unfriendly.', 'the way the voice goes up and down'],
        ['In English, falling intonation usually shows that a statement is finished.', 'the pattern of the voice at the end of a sentence']
      ),
      situationDistractors:[
        'A student counted the words in her essay.',
        'A teacher changed the order of words on a slide.',
        'A boy turned down the music in the next room.'
      ],
      ...gaps('intonation', [
        'Her intonation made it clear that she was surprised.',
        'Good speakers vary their intonation to keep the audience interested.',
        'The listening test checks whether students can hear rising and falling intonation.'
      ], [['employment', 'industry', 'literacy'], ['employment', 'industry', 'literacy'], ['employment', 'industry', 'loneliness']])
    }),
  e('vocabulary', 'noun',
    'all the words that a person knows or uses, or all the words in a language',
    ['range of words', 'words a person knows'],
    ['the rules for putting words in order', 'the way words sound when spoken', 'the number of mistakes in a text'],
    'Reading widely is the best way to increase your vocabulary.',
    'range of words', 'Reading widely is the best way to increase your range of words.',
    'range of words', 'The examiner will give marks for a wide range of words in your essay.',
    {
      teacherNote:'Noun: the words a person knows or uses, or the words of a language or subject (a wide / limited vocabulary, increase your vocabulary, technical vocabulary). Usually uncountable in learning contexts. Boundary: vocabulary is words; grammar is how words are combined. Plural vocabularies is rare.',
      masteryContexts:mc(
        ['Using a wide vocabulary in your essay will earn you higher marks.', 'the range of words someone uses'],
        ['Every science subject has its own special vocabulary that students must learn.', 'the words used in a particular subject']
      ),
      situationDistractors:[
        'A student checked that the verbs in her sentences were in the right order.',
        'A boy practised saying difficult sounds in front of a mirror.',
        'A teacher counted the spelling mistakes in an essay.'
      ],
      ...gaps('vocabulary', [
        'Keeping a notebook of new words helps you build your vocabulary.',
        'The article uses a lot of technical vocabulary about computers.',
        'Her vocabulary grew quickly when she started reading novels in English.'
      ], [['loneliness', 'recreation', 'employment'], ['loneliness', 'recreation', 'employment'], ['loneliness', 'recreation', 'employment']])
    }),
  e('accurately', 'adverb',
    'in a way that is correct and exact, without mistakes',
    ['correctly', 'without mistakes'],
    ['very quickly but carelessly', 'in a loud and confident way', 'in a way that is hard to understand'],
    'Try to copy the numbers accurately from the board.',
    'correctly', 'Try to copy the numbers correctly from the board.',
    'without any mistakes', 'She translated the letter without any mistakes.',
    {
      teacherNote:'Adverb: correctly and exactly (measure / describe / spell accurately). Linked to accurate (adjective) and accuracy (noun). Marking schemes reward using language accurately as well as widely. The adjective accurate and the noun accuracy are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['The scientists measured the temperature accurately every hour.', 'exactly, with no mistakes'],
        ['A good summary reports the writer’s ideas accurately and briefly.', 'in a way that is true to the facts']
      ),
      situationDistractors:[
        'A boy rushed his homework and made lots of careless mistakes.',
        'A girl shouted her answer before the teacher finished the question.',
        'A student wrote such messy notes that nobody could read them.'
      ],
      ...gaps('accurately', [
        'It is important to spell the names of places accurately.',
        'The weather forecast predicted the storm accurately.',
        'Please answer the questions as accurately as you can.'
      ], [['reluctantly', 'lonely', 'overseas'], ['reluctantly', 'lonely', 'nervously'], ['reluctantly', 'lonely', 'rarely']])
    }),
  e('effectively', 'adverb',
    'in a way that works well and produces the result that you want',
    ['successfully', 'in a way that works well'],
    ['in a slow and careful way', 'in an expensive way', 'in a way that nobody notices'],
    'Good students learn to manage their time effectively.',
    'successfully', 'Good students learn to manage their time successfully.',
    'in a way that works', 'The new teacher deals with noisy classes in a way that works.',
    {
      teacherNote:'Adverb: in a way that produces the result wanted (communicate / work / use something effectively). Linked to effective (adjective) and effectiveness (noun). Boundary: effectively is about results; efficiently is about not wasting time or energy.',
      masteryContexts:mc(
        ['To communicate effectively, you need to listen as well as speak.', 'in a way that achieves the aim'],
        ['The poster campaign effectively reduced the amount of litter in the playground.', 'with a successful result']
      ),
      situationDistractors:[
        'A boy spent three hours on homework but did the wrong exercise.',
        'A shop paid for a huge advert that nobody saw.',
        'A girl explained her idea so badly that nobody understood.'
      ],
      ...gaps('effectively', [
        'Mind maps help some students revise more effectively.',
        'She used examples effectively to support her argument.',
        'The team worked effectively together and finished early.'
      ], [['reluctantly', 'lonely', 'overseas'], ['reluctantly', 'lonely', 'overseas'], ['lonely', 'overseas', 'academic']])
    }),
  e('evaluate', 'verb',
    'to judge how good, useful or successful something is after thinking about it carefully',
    ['assess', 'judge the value of'],
    ['to copy something without checking it', 'to describe something without giving an opinion', 'to forget about something quickly'],
    'At the end of the course, students evaluate how useful each lesson was.',
    'judge', 'At the end of the course, students judge how useful each lesson was.',
    'assess', 'Teachers assess each project using the same set of criteria.',
    {
      idKey:'evaluate_10',
      teacherNote:'Verb: to judge the quality, value or success of something (evaluate a source, evaluate your own work, evaluate the evidence). A key command word in essays: evaluate means give strengths, weaknesses and a judgement. Unit 10 uses it for learning and courses; earlier units taught it for information and plans. The noun evaluation is taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Use the checklist to evaluate your own essay before you hand it in.', 'to judge how good something is'],
        ['The school will evaluate the new timetable after one term.', 'to decide how successful something has been']
      ),
      situationDistractors:[
        'A student copied a paragraph from a website without reading it.',
        'A boy described the film’s story but gave no opinion about it.',
        'A girl threw away her test without looking at the feedback.'
      ],
      ...gaps('evaluate', [
        'You must evaluate each source before you use it in your essay.',
        'The judges will evaluate the projects on creativity and accuracy.',
        'It is hard to evaluate your own work fairly.'
      ], [['succeed', 'reflect', 'communicate'], ['succeed', 'contribute', 'communicate'], ['succeed', 'contribute', 'communicate']])
    }),
  e('develop', 'verb',
    'to grow or change into something bigger, stronger or more advanced, or to make something do this',
    ['build up', 'improve over time'],
    ['to make something smaller and weaker', 'to stop something from changing', 'to lose a skill through not using it'],
    'The course helps students develop their speaking skills.',
    'build up', 'The course helps students build up their speaking skills.',
    'improve', 'Regular reading will improve your writing style.',
    {
      teacherNote:'Verb: to grow or improve, or to make something grow or improve (develop a skill, develop into, develop an idea); also to create something new (develop a product). Common spelling error: *developpe / *develope. The noun development and the adjective developed are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Team sports help children develop confidence and social skills.', 'to make a skill grow stronger'],
        ['The company plans to develop an app that helps students learn new words.', 'to create something new over time']
      ),
      situationDistractors:[
        'A boy stopped practising the guitar and forgot how to play.',
        'A town closed its library and shrank to half its size.',
        'A girl kept writing her essays in exactly the same way for years.'
      ],
      ...gaps('develop', [
        'Children develop language skills very quickly in their first five years.',
        'Scientists are working to develop a new vaccine.',
        'You need to develop your ideas in more detail in the second paragraph.'
      ], [['succeed', 'reflect', 'contribute'], ['succeed', 'reflect', 'contribute'], ['succeed', 'encourage', 'reflect']])
    }),
  e('communicate', 'verb',
    'to share information, ideas or feelings with someone by speaking, writing or other ways',
    ['share ideas', 'exchange information'],
    ['to keep information secret from others', 'to repeat the same words again and again', 'to argue loudly with someone'],
    'Being able to communicate clearly is important in any job.',
    'share ideas', 'Being able to share ideas clearly is important in any job.',
    'exchange messages', 'The two schools exchange messages with each other by email every week.',
    {
      idKey:'communicate_10',
      teacherNote:'Verb: to share information, ideas or feelings (communicate with someone, communicate in English, communicate an idea). Unit 10 uses it for speaking and presentation skills; Unit 2 taught it for digital life. The noun communication and the adjective communicative are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Overseas students quickly learn to communicate in English with their classmates.', 'to share ideas by speaking a language'],
        ['A good presentation should communicate one main message to the audience.', 'to make an idea clear to other people']
      ),
      situationDistractors:[
        'A boy kept his test result secret from his family.',
        'A parrot repeated the same word over and over.',
        'Two neighbours shouted angrily about a fence.'
      ],
      ...gaps('communicate', [
        'Deaf students communicate using sign language.',
        'The head teacher uses a weekly newsletter to communicate with parents.',
        'Babies communicate by crying long before they can speak.'
      ], [['succeed', 'reflect', 'evaluate'], ['succeed', 'reflect', 'evaluate'], ['succeed', 'evaluate', 'reflect']])
    }),
  e('opinion', 'noun',
    'what a person thinks or believes about something',
    ['view', 'personal belief'],
    ['a fact that everyone agrees is true', 'a rule written by the government', 'a question with only one correct answer'],
    'In my opinion, school uniforms help students feel equal.',
    'view', 'In my view, school uniforms help students feel equal.',
    'view', 'Everyone in the group has a different view about the new timetable.',
    {
      teacherNote:'Noun: what someone thinks about something (in my opinion, give / express your opinion, a strong opinion, public opinion). Countable. Boundary: an opinion is a personal belief; a fact can be checked. Useful phrases for Paper 2 opinion writing: In my opinion, ...; Some people are of the opinion that ...',
      masteryContexts:mc(
        ['The teacher asked each student to give their opinion about the book.', 'what someone thinks about something'],
        ['Public opinion has turned against the plan to close the library.', 'what most people in a society think']
      ),
      situationDistractors:[
        'A student wrote that water boils at one hundred degrees.',
        'The government published a new law about driving.',
        'A maths question asked what seven times eight is.'
      ],
      ...gaps('opinion', [
        'What is your opinion of the new science teacher?',
        'She has a very strong opinion about animal testing.',
        'It is only my opinion, but I think the film was too long.'
      ], [['loneliness', 'literacy', 'recreation'], ['loneliness', 'literacy', 'recreation'], ['loneliness', 'literacy', 'recreation']])
    }),
  e('preference', 'noun',
    'a feeling of liking one thing more than another, or the thing you like more',
    ['choice', 'the thing you like better'],
    ['a thing you are forced to do', 'a thing you have never tried', 'a thing you have forgotten'],
    'My preference is to study in the morning when it is quiet.',
    'choice', 'My choice is to study in the morning when it is quiet.',
    'what she likes better', 'When it comes to reading, paper books are what she likes better.',
    {
      idKey:'preference_10',
      teacherNote:'Noun: liking one thing more than another (a preference for, have no preference, personal preference). Countable. Unit 10 uses it for learning styles and courses; Unit 1 taught it for free-time choices. The verb prefer and the adjective preferable are taught in the Word Family pathway; note the double r in preferred but not in preference.',
      masteryContexts:mc(
        ['Students can choose online or classroom lessons, depending on their preference.', 'what someone likes or wants more'],
        ['Many employers show a preference for applicants with work experience.', 'a tendency to choose one thing rather than another']
      ),
      situationDistractors:[
        'A student had to attend a lesson she did not want to go to.',
        'A boy had never tried sushi before.',
        'A girl forgot which film she had watched last week.'
      ],
      ...gaps('preference', [
        'Do you have a preference for working alone or in a group?',
        'The menu changes according to the students’ preference.',
        'I have no preference, so you can choose the restaurant.'
      ], [['loneliness', 'literacy', 'recreation'], ['loneliness', 'literacy', 'intonation'], ['loneliness', 'literacy', 'intonation']])
    }),
  e('discussion', 'noun',
    'a conversation in which people talk about a subject and share their ideas and opinions',
    ['talk', 'exchange of views'],
    ['a speech given by one person with no questions', 'a written test in silence', 'an argument that ends in a fight'],
    'We had a lively discussion about whether homework should be banned.',
    'exchange of views', 'We had a lively exchange of views about whether homework should be banned.',
    'talk', 'After the film, the class had a long talk about the main character.',
    {
      teacherNote:'Noun: a conversation in which people share ideas about a subject (have a discussion about, a class discussion, under discussion). Countable. Boundary: a discussion is an exchange of views; an argument suggests disagreement and strong feelings. The verb discuss (discuss something, not *discuss about) is taught in the Word Family pathway.',
      masteryContexts:mc(
        ['The teacher divided us into groups for a discussion about climate change.', 'a talk in which people share ideas'],
        ['The new uniform policy is still under discussion, so nothing has been decided.', 'the process of being talked about before a decision']
      ),
      situationDistractors:[
        'A famous author gave a speech and left without answering questions.',
        'Students sat a reading test in silence.',
        'Two boys started pushing each other in the corridor.'
      ],
      ...gaps('discussion', [
        'The class had a discussion about the advantages of studying abroad.',
        'Everyone took part in the discussion and shared their views.',
        'After a long discussion, the committee agreed on a plan.'
      ], [['loneliness', 'literacy', 'recreation'], ['loneliness', 'literacy', 'recreation'], ['loneliness', 'literacy', 'recreation']])
    }),
  e('achievement', 'noun',
    'something good and difficult that you have done successfully through effort or skill',
    ['accomplishment', 'success'],
    ['a mistake made because of carelessness', 'a task that has not been started', 'a gift received without effort'],
    'Passing all her exams was a great achievement after such a difficult year.',
    'accomplishment', 'Passing all her exams was a great accomplishment after such a difficult year.',
    'success', 'Winning the national debating final was the school’s greatest success.',
    {
      idKey:'achievement_10',
      teacherNote:'Noun: something good done successfully through effort (a great / major achievement, a sense of achievement, academic achievement). Countable and uncountable. Unit 10 uses it for academic success; Units 1 and 6 taught it for sport and study. Spelling: i before e (achieve). The verb achieve is taught in the Word Family pathway.',
      masteryContexts:mc(
        ['Learning to read at the age of seventy was an amazing achievement.', 'something difficult done successfully'],
        ['The school celebrates academic achievement with a prize-giving every June.', 'success in study gained through effort']
      ),
      situationDistractors:[
        'A boy failed a test because he forgot to turn the page.',
        'A girl had not yet started the project that was due tomorrow.',
        'A student found some money in the street.'
      ],
      ...gaps('achievement', [
        'Getting a place at that university is a real achievement.',
        'Finishing the marathon gave him a great sense of achievement.',
        'The award recognises outstanding achievement in science.'
      ], [['loneliness', 'literacy', 'recreation'], ['loneliness', 'literacy', 'intonation'], ['loneliness', 'pronunciation', 'recreation']])
    }),
  e('qualification', 'noun',
    'an official record, such as a certificate or degree, showing that you have passed exams or completed a course',
    ['certificate', 'official record of a completed course'],
    ['a list of jobs that are available', 'a reference written by a friend', 'a timetable for the school year'],
    'You need a teaching qualification to work in a state school.',
    'certificate', 'You need a teaching certificate to work in a state school.',
    'official certificate', 'She received an official certificate in first aid after the course.',
    {
      idKey:'qualification_10',
      teacherNote:'Noun: an exam pass, certificate or degree that shows your level (a qualification in, academic / professional qualifications, gain a qualification). Countable. Unit 10 uses it for school leaving and higher education; Units 5 and 7 taught it for jobs and interviews. The verb qualify and the adjective qualified are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['IGCSEs are an international qualification recognised by universities around the world.', 'an official record of passing exams'],
        ['Without the right qualification, he could not apply for the nursing course.', 'a certificate needed to do something']
      ),
      situationDistractors:[
        'A student read a list of part-time jobs in the newspaper.',
        'A friend wrote a kind note about a boy’s character.',
        'A teacher printed the school calendar for next year.'
      ],
      ...gaps('qualification', [
        'A university degree is a useful qualification for many careers.',
        'She left school without a single qualification, but later went to college.',
        'This qualification allows you to work as a tour guide.'
      ], [['loneliness', 'recreation', 'intonation'], ['loneliness', 'recreation', 'intonation'], ['loneliness', 'recreation', 'intonation']])
    }),
  e('succeed', 'verb',
    'to achieve something that you have been trying to do',
    ['do well', 'achieve your aim'],
    ['to give up before the end', 'to try something for the first time', 'to make a serious mistake'],
    'If you work hard and ask for help, you will succeed.',
    'do well', 'If you work hard and ask for help, you will do well.',
    'achieve their goals', 'The programme helps young people from poor families achieve their goals.',
    {
      teacherNote:'Verb: to achieve what you have been trying to do (succeed in doing something, succeed at school, succeed in life). Pattern: succeed in + -ing (not *succeed to do). Common spelling error: *succed / *suceed. The noun success, the adjective successful and the adverb successfully are taught in the Word Family pathway.',
      masteryContexts:mc(
        ['After three attempts, she hopes to succeed in her driving test this time.', 'to manage to do something difficult'],
        ['The school helps every student succeed, whatever their background.', 'to do well in study or life']
      ),
      situationDistractors:[
        'A boy stopped running halfway through the race.',
        'A girl tried ice skating for the very first time.',
        'A student sent the wrong file to her teacher.'
      ],
      ...gaps('succeed', [
        'Only a few people succeed in climbing the mountain every year.',
        'You need to work hard to succeed in your final exams.',
        'Their plan to raise money for the library did not succeed.'
      ], [['encourage', 'evaluate', 'communicate'], ['encourage', 'evaluate', 'develop'], ['encourage', 'evaluate', 'reflect']])
    })
];

function familyFields(entry) {
  const family = unit10WordFamilies[entry.term];
  if (!family) return unit10WordFamilyRejected[entry.term] ? { wordFamily:[] } : {};
  const lower = value => String(value).toLocaleLowerCase('en');
  return {
    wordFamilyForms:family.forms.map(row => ({ form:row.form, partOfSpeech:row.partOfSpeech, example:row.example, pedagogicallyUseful:true, ...(unit10WordFamilyAlternates[entry.term]?.[row.form] ? { altExample:unit10WordFamilyAlternates[entry.term][row.form] } : {}) })),
    wordFamily:family.forms.map(row => row.form).filter(form => lower(form) !== lower(entry.term))
  };
}

const enrichedEntries = entries.map(entry => {
  const authoredMastery = unit10MeaningMastery[entry.term];
  const masteryContexts = authoredMastery
    ? (entry.masteryContexts ?? []).map((record, index) => {
        const authored = authoredMastery[index] ?? {};
        return { text:authored.text ?? record.text, meaning:authored.meaning ?? record.meaning, ...(Array.isArray(authored.wrongMeanings) ? { wrongMeanings:authored.wrongMeanings } : {}) };
      })
    : entry.masteryContexts;
  return {
    ...entry,
    ...(masteryContexts ? { masteryContexts } : {}),
    ...(unit10SituationExtras[entry.term] ? { situationDistractors:[...(entry.situationDistractors ?? []), ...unit10SituationExtras[entry.term]] } : {}),
    ...(unit10Collocations[entry.term] ? { collocations:unit10Collocations[entry.term] } : {}),
    ...(unit10MeaningMatch[entry.term] ? { wrongParaphrases:unit10MeaningMatch[entry.term] } : {}),
    ...(unit10ContextPassages[entry.term] ? { masteryPassages:unit10ContextPassages[entry.term] } : {}),
    ...familyFields(entry)
  };
});

// Repeated targets reuse the reviewed spelling list of their earlier-unit id (spelling belongs to the lexical item).
const REPEATED = ['academic', 'reflect', 'confidence', 'contribute', 'employment', 'challenge', 'assignment', 'research', 'evaluate', 'communicate', 'preference', 'achievement', 'qualification'];
const repeatedSpelling = Object.fromEntries(REPEATED
  .filter(key => LEXICAL_SPELLING_ERRORS[`vocab_${key}`])
  .map(key => [`vocab_${key}_10`, LEXICAL_SPELLING_ERRORS[`vocab_${key}`]]));

export default buildCuratedUnit({
  unitNumber:UNIT_NUMBER,
  unitTitle:'Education',
  status,
  source:'0511 key vocabulary unit 10: Education',
  entries:enrichedEntries,
  activities:[...unit10Activities, ...unit10PrecisionUse, ...unit10WordFamilyItems],
  lexicalSpelling:{ ...LEXICAL_SPELLING_ERRORS, ...repeatedSpelling }
});
