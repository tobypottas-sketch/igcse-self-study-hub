// UNIT 7 – INTERVIEWS: authored source for the Unit 7 Vocabulary Builder release (releases/unit-07.js promotes it to live once approved). Source: 0511 key vocabulary unit 7: Interviews
// (coursebook order), 50/50 authored. Check: node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-07.js
// criteria, availability, relevant, evaluate, anxious, qualification, strategy, respond, confidence and technique are also earlier-unit targets; each has its own Unit 7 id
// (idKey 'X_7' -> vocab_X_7) and aliases the earlier spelling list where one exists. qualifications (plural) and qualification (singular) are both kept as separate targets.
import { buildCuratedUnit } from '../build-unit.js';
import { LEXICAL_SPELLING_ERRORS } from '../lexical-spelling-errors.js';
import unit7Activities from './unit-07-activities.js';
import unit7PrecisionUse from './unit-07-precision-use.js';
import unit7WordFamilyItems from './unit-07-word-family-items.js';
import unit7Collocations from './unit-07-collocations.js';
import unit7SituationExtras from './unit-07-situation-extras.js';
import unit7MeaningMatch from './unit-07-meaning-match.js';
import unit7MeaningMastery from './unit-07-meaning-mastery.js';
import unit7ContextPassages from './unit-07-context-passages.js';
import { unit7WordFamilies, unit7WordFamilyRejected } from './unit-07-word-families.js';
import { unit7WordFamilyAlternates } from './unit-07-word-family-alternates.js';

const UNIT_NUMBER = 7;
const status = 'approved';

const e = (term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence, paraphraseSource, paraphraseSentence, productionSource, productionSentence, extras = {}) => ({
  term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence,
  paraphrase:{ source:paraphraseSource, sentence:paraphraseSentence },
  production:{ source:productionSource, sentence:productionSentence },
  ...extras
});

const entries = [
  e('applicant', 'noun',
    'a person who makes a formal request for a job, a place on a course or a permit',
    ['person who asks formally for a job', 'someone who makes a formal request for a place'],
    ['a person who is offered a job after an interview', 'a person who checks forms before they are sent out', 'a person who trains new members of staff'],
    'The manager told the last applicant to wait outside until the panel was ready.',
    'person who asked formally for the job', 'The manager told the last person who asked formally for the job to wait outside until the panel was ready.',
    'someone who makes a formal request for a place', 'A fair college treats someone who makes a formal request for a place with the same respect, whatever their background.',
    {
      teacherNote:'Noun: a person who formally asks for a job, a course place or a permit, usually in writing. Boundary: an applicant has only asked; a candidate is a person who is being considered or has been shortlisted. The verb apply and the noun application are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Each applicant must complete the online form and upload a recent photograph before Friday.', meaning:'a person who formally asks for a place or job' },
        { text:'The college rejected the first applicant because the form had been completed in pencil.', meaning:'a person who has formally asked for a place' }
      ],
      situationDistractors:[
        'A girl sent in a letter and a CV asking for a summer job at the library.',
        'A boy filled in a form to ask for a place at a sailing club.',
        'A woman wrote to the council to ask for a parking permit.'
      ],
      retrievalContexts:[
        { id:'1', text:'A successful applicant will receive a letter within two weeks of the interview.', target:'applicant', grammarPattern:'' },
        { id:'2', text:'The company asked every applicant to explain in writing why they wanted the job.', target:'applicant', grammarPattern:'' },
        { id:'3', text:'Only one applicant had experience of working with young children, so the school invited her first.', target:'applicant', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'applicant', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'applicant', wrong:['passenger', 'neighbour', 'umbrella'] },
        { id:'3', answer:'applicant', wrong:['museum', 'engine', 'meadow'] }
      ]
    }),
  e('qualifications', 'noun',
    'the exam results, degrees and training that show a person is suitable for a job or course',
    ['exam results and training you have completed', 'official proof of what you have studied'],
    ['the personal qualities that make someone popular at work', 'the questions that an employer asks in an interview', 'the rules that workers must follow in a company'],
    'Her qualifications include a degree in biology and a diploma in teaching.',
    'exam results and training she has completed', 'Her exam results and training she has completed include a degree in biology and a diploma in teaching.',
    'official proof of what you have studied', 'Most employers ask for official proof of what you have studied, as well as a short letter about your interests.',
    {
      teacherNote:'Plural noun: the exam results, degrees, diplomas and training that show you are suitable for a job or a course (list your qualifications on a CV). It is always plural in this item. The singular qualification is a separate target in this unit: there it means a quality or skill that makes someone suitable, so do not use the two interchangeably.',
      masteryContexts:[
        { text:'Applicants with good qualifications in science are welcome to apply for the laboratory post.', meaning:'exam results and training that show suitability' },
        { text:'On his CV, Omar listed his qualifications first, because the job required a degree in engineering.', meaning:'degrees and training listed as proof of ability' }
      ],
      situationDistractors:[
        'A woman handed over her degree certificate and her diploma at the start of the interview.',
        'A man wrote a list of his exam results and courses at the top of his CV.',
        'A girl proudly showed the panel her first-aid and lifesaving awards.'
      ],
      retrievalContexts:[
        { id:'1', text:'Her qualifications are excellent, but the company wants someone with more experience of teamwork.', target:'qualifications', grammarPattern:'' },
        { id:'2', text:'Please bring the original documents that prove your qualifications to the interview.', target:'qualifications', grammarPattern:'' },
        { id:'3', text:'Nurses in this hospital need formal qualifications as well as a kind and patient personality.', target:'qualifications', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'qualifications', wrong:['neighbours', 'journeys', 'bicycles'] },
        { id:'2', answer:'qualifications', wrong:['holidays', 'invitations', 'sandwiches'] },
        { id:'3', answer:'qualifications', wrong:['furniture', 'weather', 'souvenirs'] }
      ]
    }),
  e('demonstrate', 'verb',
    'to show clearly that you have a skill, quality or piece of knowledge',
    ['show clearly that you can', 'prove by showing in practice'],
    ['to describe a skill without ever using it', 'to hide a weakness from other people', 'to ask someone else to prove a skill'],
    'In the interview, candidates were asked to demonstrate how they would deal with an angry customer.',
    'show clearly how', 'In the interview, candidates were asked to show clearly how they would deal with an angry customer.',
    'prove by showing in practice', 'Good applicants try to prove by showing in practice that they can work well in a team.',
    {
      teacherNote:'Verb: to show clearly, by what you say or do, that you have a skill, quality or piece of knowledge. In the interview context the usual pattern is demonstrate that / demonstrate how. Boundary: demonstrate involves showing, not only saying; the noun and the sense of protesting in a street are not taught here.',
      masteryContexts:[
        { text:'Good applicants demonstrate their interest in a job by asking questions about the company.', meaning:'to show clearly a quality or skill' },
        { text:'She used a short story about leading a school project to demonstrate that she could manage people.', meaning:'to prove something by giving clear evidence' }
      ],
      situationDistractors:[
        'A girl explained how she had raised money for charity and showed the photographs and the final total.',
        'A boy used a short role-play to show the panel exactly how he would welcome a customer.',
        'An applicant brought a folder of her own drawings to prove her skill as a designer.'
      ],
      retrievalContexts:[
        { id:'1', text:'Use specific examples from your life to demonstrate that you can solve problems under pressure.', target:'demonstrate', grammarPattern:'' },
        { id:'2', text:'The test is designed to demonstrate whether a candidate can think clearly in difficult situations.', target:'demonstrate', grammarPattern:'' },
        { id:'3', text:'She wanted to demonstrate her speaking skills, so she gave a short, confident talk about her experience.', target:'demonstrate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'demonstrate', wrong:['forget', 'borrow', 'ignore'] },
        { id:'2', answer:'demonstrate', wrong:['prevent', 'invent', 'cancel'] },
        { id:'3', answer:'demonstrate', wrong:['hide', 'refuse', 'delay'] }
      ]
    }),
  e('summary', 'noun',
    'a short account that gives only the main points of something longer',
    ['short account of the main points', 'brief version of something longer'],
    ['a long account that includes every small detail', 'a list of questions that nobody has answered', 'a personal opinion about a piece of writing'],
    'At the end of the meeting, the chairperson gave a brief summary of what had been agreed.',
    'short account of the main points', 'At the end of the meeting, the chairperson gave a brief short account of the main points of what had been agreed.',
    'brief version of something longer', 'Write a brief version of something longer by keeping only the key facts and leaving out the examples.',
    {
      teacherNote:'Noun: a short account that gives only the main points of something longer (write a summary of, a brief summary). The verb summarise is a Unit 6 target and is not repeated here. Boundary: a summary is shorter than the original and contains no new opinion; an overview (also in this unit) is a general first look rather than a shortened copy.',
      masteryContexts:[
        { text:'The teacher asked the class to write a summary of the story in no more than fifty words.', meaning:'a short account of the main points' },
        { text:'At the top of her CV, Mia included a three-line summary of her skills and experience.', meaning:'a short statement of the key points' }
      ],
      situationDistractors:[
        'A student read a long article and then wrote five sentences with only the key facts.',
        'A manager told the team the three main results of a long report in one minute.',
        'A girl gave a one-paragraph version of a chapter that was ten pages long.'
      ],
      retrievalContexts:[
        { id:'1', text:'Before the interview, I wrote a one-page summary of what I knew about the company.', target:'summary', grammarPattern:'' },
        { id:'2', text:'A good summary includes only the main points and leaves out unnecessary details.', target:'summary', grammarPattern:'' },
        { id:'3', text:'The report ended with a short summary of the findings and three clear recommendations.', target:'summary', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'summary', wrong:['recipe', 'invitation', 'souvenir'] },
        { id:'2', answer:'summary', wrong:['holiday', 'sandwich', 'neighbour'] },
        { id:'3', answer:'summary', wrong:['carpet', 'staircase', 'bicycle'] }
      ]
    }),
  e('combine', 'verb',
    'to join two or more things, skills or qualities together',
    ['join together', 'put two or more things together'],
    ['to separate two or more things from each other', 'to compare two or more things carefully', 'to choose one thing instead of another'],
    'The best candidates combine good communication skills with a calm and polite manner.',
    'join together', 'The best candidates join together good communication skills with a calm and polite manner.',
    'put two or more things together', 'Many students like to put two or more things together, such as a part-time job and weekend sport.',
    {
      teacherNote:'Verb: to join two or more things, skills or qualities together (combine A with B). It is usually followed by with. Boundary: combine means to join things into one; compare means to look at them side by side. The chemistry sense (substances combine) is not taught here.',
      masteryContexts:[
        { text:'Many students combine part-time work with their studies in the final year of school.', meaning:'to do or have two things together' },
        { text:'In her answer, Priya decided to combine examples from school with examples from her volunteering.', meaning:'to join different things into one answer' }
      ],
      situationDistractors:[
        'A student joined her love of art and her interest in computers by studying digital design.',
        'A chef mixed spicy and sweet flavours together in the same sauce.',
        'A girl took a part-time job in a bookshop while she studied for her exams.'
      ],
      retrievalContexts:[
        { id:'1', text:'The course allows students to combine languages with business, which helps them find international work.', target:'combine', grammarPattern:'' },
        { id:'2', text:'It is hard to combine a full-time job with studying for exams in the evening.', target:'combine', grammarPattern:'' },
        { id:'3', text:'A good answer should combine a clear opinion with a specific example.', target:'combine', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'combine', wrong:['separate', 'cancel', 'refuse'] },
        { id:'2', answer:'combine', wrong:['forbid', 'announce', 'delay'] },
        { id:'3', answer:'combine', wrong:['avoid', 'erase', 'interrupt'] }
      ]
    }),
  e('voluntary', 'adjective',
    'done, given or taken by choice, not because you are forced to',
    ['done by free choice', 'not forced or required'],
    ['done only because a teacher insists on it', 'done for a large amount of money', 'done quickly without any planning'],
    'Attendance at the careers workshop is voluntary, but most students decide to go.',
    'not forced or required', 'Attendance at the careers workshop is not forced or required, but most students decide to go.',
    'done by free choice', 'She does a job that is done by free choice, helping at the animal shelter every Saturday morning.',
    {
      teacherNote:'Adjective: done, given or taken by choice, not because it is compulsory (voluntary work, a voluntary group). Boundary: voluntary describes choice, and says nothing about payment, although voluntary work is usually unpaid. The related noun volunteer is taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Joining the school orchestra is voluntary, so nobody has to take part.', meaning:'done by choice and not required' },
        { text:'After leaving school, Tom did voluntary work at a hospital to gain experience.', meaning:'done by choice without being paid or forced' }
      ],
      situationDistractors:[
        'A boy gave up his Saturday morning to help clean the beach, although no one asked him to.',
        'A girl chose to join the debating club, although it was not part of her timetable.',
        'A woman worked at the food bank in the evenings without being paid.'
      ],
      retrievalContexts:[
        { id:'1', text:'Wearing a school tie on the trip is voluntary, so nobody will be punished if they forget.', target:'voluntary', grammarPattern:'' },
        { id:'2', text:'A voluntary organisation depends on people who give their time without payment.', target:'voluntary', grammarPattern:'' },
        { id:'3', text:'The interview panel was impressed by his voluntary work at the local youth centre.', target:'voluntary', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'voluntary', wrong:['expensive', 'dangerous', 'hungry'] },
        { id:'2', answer:'voluntary', wrong:['crowded', 'frozen', 'rectangular'] },
        { id:'3', answer:'voluntary', wrong:['wooden', 'furious', 'enormous'] }
      ]
    }),
  e('frequent', 'adjective',
    'happening or done often, many times',
    ['happening often', 'taking place many times'],
    ['happening only once in a long time', 'happening for the first time', 'happening at the same moment as another event'],
    'Frequent practice before an interview helps you to answer questions calmly.',
    'practice that happens often', 'Practice that happens often before an interview helps you to answer questions calmly.',
    'taking place many times', 'Problems taking place many times in a lesson should be discussed with the teacher.',
    {
      teacherNote:'Adjective: happening or done often (frequent visits, frequent changes). Boundary: frequent describes how often something happens; regular describes something that happens at fixed intervals, so a frequent visitor may not come at a fixed time. The verb to frequent a place is not taught here.',
      masteryContexts:[
        { text:'The frequent changes to the timetable made it difficult for students to plan their revision.', meaning:'happening often' },
        { text:'The company is looking for someone who can make frequent visits to clients in other cities.', meaning:'happening many times' }
      ],
      situationDistractors:[
        'The train to the city centre leaves every ten minutes all day.',
        'A boy telephoned his grandmother two or three times a week.',
        'The school sent a reminder email almost every day before the exam.'
      ],
      retrievalContexts:[
        { id:'1', text:'Students who make frequent mistakes with spelling should read their work aloud before handing it in.', target:'frequent', grammarPattern:'' },
        { id:'2', text:'A frequent cause of nervousness in interviews is a lack of preparation.', target:'frequent', grammarPattern:'' },
        { id:'3', text:'Because of her frequent absences, the manager asked her to explain why she had missed so many days.', target:'frequent', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'frequent', wrong:['careful', 'silent', 'distant'] },
        { id:'2', answer:'frequent', wrong:['sudden', 'unusual', 'invisible'] },
        { id:'3', answer:'frequent', wrong:['historic', 'tasty', 'narrow'] }
      ]
    }),
  e('overview', 'noun',
    'a short general description that shows the main features of something',
    ['general description of the main points', 'brief look at the whole subject'],
    ['a very detailed study of one small part', 'a hidden fault in a plan or system', 'a final opinion given at the end of a talk'],
    'The manager gave the new staff a brief overview of the company before the tour began.',
    'general description of the main points', 'The manager gave the new staff a brief general description of the main points of the company before the tour began.',
    'brief look at the whole subject', 'Before reading the chapters one by one, it helps to have a brief look at the whole subject.',
    {
      teacherNote:'Noun: a short general description that shows the main features of something (an overview of the course). Boundary: an overview is a first general look at the whole subject, while a summary shortens something already given; an overview does not go into detail. It is one word (not over view).',
      masteryContexts:[
        { text:'The first lesson gave students an overview of the whole course before the detailed units began.', meaning:'a general picture of the main features' },
        { text:'Before going into the details of each department, the director gave an overview of the company’s history.', meaning:'a short general description of the whole' }
      ],
      situationDistractors:[
        'A guide stood on a hill and pointed out the main parts of the city before the walking tour.',
        'A teacher drew a simple map of the whole unit on the board in the first lesson.',
        'The leaflet gave a quick general picture of the three main departments.'
      ],
      retrievalContexts:[
        { id:'1', text:'The first page of the leaflet gives a clear overview of the programme for the week.', target:'overview', grammarPattern:'' },
        { id:'2', text:'Before preparing for the interview, read the website to get a general overview of the company.', target:'overview', grammarPattern:'' },
        { id:'3', text:'The presenter began with a short overview and then explained each part in detail.', target:'overview', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'overview', wrong:['recipe', 'invitation', 'sandwich'] },
        { id:'2', answer:'overview', wrong:['umbrella', 'souvenir', 'bicycle'] },
        { id:'3', answer:'overview', wrong:['carpet', 'staircase', 'neighbour'] }
      ]
    }),
  e('candidate', 'noun',
    'a person who is being considered for a job, or who is taking an exam',
    ['person being considered for a job', 'person taking an exam'],
    ['a person who has left a job after many years', 'a person who prepares the questions for an exam', 'a person who advertises a job for a company'],
    'The panel told the second candidate that the interview would last about thirty minutes.',
    'person being considered for the job', 'The panel told the second person being considered for the job that the interview would last about thirty minutes.',
    'person taking an exam', 'Each person taking an exam must show a photo card to the invigilator at the door.',
    {
      teacherNote:'Noun: a person who is being considered for a job, or who is sitting an exam. Boundary: a candidate is already in the process (shortlisted, or entered for the exam); an applicant is a person who has only just asked. British exam use: the candidate number on a question paper.',
      masteryContexts:[
        { text:'The company offered the job to the strongest candidate after a second round of questions.', meaning:'a person being considered for a job' },
        { text:'Every candidate must arrive at the exam hall at least fifteen minutes before the start.', meaning:'a person who is taking an exam' }
      ],
      situationDistractors:[
        'A woman waited outside the room because she was one of three people shortlisted for the post.',
        'A student sat at a desk with a number card, waiting for the invigilator to start the paper.',
        'A man was called in for a second interview after the first round.'
      ],
      retrievalContexts:[
        { id:'1', text:'The most promising candidate had worked abroad for two years and spoke three languages.', target:'candidate', grammarPattern:'' },
        { id:'2', text:'Each candidate was given a number and told to wait in the corridor until their name was called.', target:'candidate', grammarPattern:'' },
        { id:'3', text:'The panel will ask the final candidate to give a short presentation before the interview.', target:'candidate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'candidate', wrong:['passenger', 'engine', 'meadow'] },
        { id:'2', answer:'candidate', wrong:['harbour', 'recipe', 'ticket'] },
        { id:'3', answer:'candidate', wrong:['museum', 'umbrella', 'souvenir'] }
      ]
    }),
  e('interviewer', 'noun',
    'a person who asks questions in an interview to find out about someone',
    ['person who asks the questions', 'person who questions a candidate'],
    ['a person who answers the questions', 'a person who writes the job advertisement', 'a person who checks the answers afterwards'],
    'The interviewer smiled, shook hands and asked the first candidate to take a seat.',
    'person who asks the questions', 'The person who asks the questions smiled, shook hands and asked the first candidate to take a seat.',
    'person who questions a candidate', 'A good person who questions a candidate listens carefully and does not interrupt the answers.',
    {
      teacherNote:'Noun: a person who asks questions in an interview, for example for a job, a place at college, or a television programme. Boundary: the interviewer asks; the interviewee answers (a separate target in this unit). Stress: in-ter-view-er.',
      masteryContexts:[
        { text:'The interviewer asked Ben to describe a time when he had worked as part of a team.', meaning:'the person who asks the questions at a job meeting' },
        { text:'A friendly interviewer can help nervous candidates to relax and speak more clearly.', meaning:'a person who asks questions to find out about someone' }
      ],
      situationDistractors:[
        'A woman at a desk asked a young man about his experience and made notes while he spoke.',
        'A reporter asked the footballer three questions after the match for a radio programme.',
        'A teacher asked a student why she had chosen to apply for the course.'
      ],
      retrievalContexts:[
        { id:'1', text:'The interviewer looked at Sara’s CV and asked her to explain the gap in her work history.', target:'interviewer', grammarPattern:'' },
        { id:'2', text:'A good interviewer listens carefully and asks follow-up questions to find out more.', target:'interviewer', grammarPattern:'' },
        { id:'3', text:'Before the interview, it helps to find out the name of the interviewer and the role she holds.', target:'interviewer', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'interviewer', wrong:['passenger', 'harbour', 'recipe'] },
        { id:'2', answer:'interviewer', wrong:['ticket', 'museum', 'umbrella'] },
        { id:'3', answer:'interviewer', wrong:['carpet', 'souvenir', 'bicycle'] }
      ]
    }),
  e('interviewee', 'noun',
    'a person who is asked questions in a formal meeting, for example when applying for a job',
    ['person who answers the questions', 'person being asked questions by a panel'],
    ['a person who asks the questions at a meeting', 'a person who writes the job advertisement', 'a person who checks the answers afterwards'],
    'The interviewee glanced at her notes, took a breath and began to answer the first question.',
    'person who answers the questions', 'The person who answers the questions glanced at her notes, took a breath and began to answer the first question.',
    'person being asked questions by a panel', 'A person being asked questions by a panel often feels more confident after the first easy answer.',
    {
      teacherNote:'Noun: the person who is asked questions in a formal meeting, such as a job or college interview. Boundary: the interviewee answers and the interviewer asks (a separate target in this unit). The ending -ee marks the person who receives the action.',
      masteryContexts:[
        { text:'A nervous interviewee can improve the whole meeting simply by sitting up straight and making eye contact.', meaning:'the person who answers the questions' },
        { text:'The interviewer thanked the interviewee for coming and said that a decision would be made by Friday.', meaning:'a person being questioned at a job meeting' }
      ],
      situationDistractors:[
        'A young man sat opposite three people and answered each of their questions in turn.',
        'A woman told a reporter about her life while the microphone recorded every word.',
        'A student explained to a university panel why she wanted to study medicine.'
      ],
      retrievalContexts:[
        { id:'1', text:'A good interviewee prepares examples in advance and listens to each question before answering.', target:'interviewee', grammarPattern:'' },
        { id:'2', text:'The panel noticed that the interviewee spoke clearly and did not repeat the same point.', target:'interviewee', grammarPattern:'' },
        { id:'3', text:'By the end of the meeting, the interviewee felt that she had been given a fair chance to speak.', target:'interviewee', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'interviewee', wrong:['passenger', 'harbour', 'recipe'] },
        { id:'2', answer:'interviewee', wrong:['museum', 'ticket', 'umbrella'] },
        { id:'3', answer:'interviewee', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('referee', 'noun',
    'a person who gives an employer or college an opinion of your character and ability',
    ['person who speaks well of you to an employer', 'someone who gives an opinion of your character'],
    ['a person who controls a sports match and applies the rules', 'a person who chooses the people who will be offered a job', 'a person who checks the answers in an exam'],
    'Please give the name of a referee who has known you for at least two years.',
    'person who speaks well of you to an employer', 'Please give the name of a person who speaks well of you to an employer who has known you for at least two years.',
    'someone who gives an opinion of your character', 'Choose someone who gives an opinion of your character and who will reply quickly to the employer’s email.',
    {
      teacherNote:'Taught in its job sense only: a person named on a job or college application who can say what you are like and how well you work. The sports sense (a person who controls a match) is a different meaning and is not taught here. Related target in this unit: reference (the letter or statement the referee writes). Spelling: referee, with three e’s and two r’s.',
      masteryContexts:[
        { text:'Her former headteacher agreed to be her referee for the university application.', meaning:'a person who gives an opinion of someone’s character' },
        { text:'The employer telephoned his referee and asked how he had behaved when he worked in the café.', meaning:'a person named to speak about your work' }
      ],
      situationDistractors:[
        'A teacher wrote a short letter saying that a student was hard-working and reliable.',
        'A manager agreed to answer an employer’s questions about a former worker.',
        'A young woman put the name of her old supervisor on her job form.'
      ],
      retrievalContexts:[
        { id:'1', text:'The company contacted Ali’s referee to ask whether he was honest and punctual.', target:'referee', grammarPattern:'' },
        { id:'2', text:'You should ask permission before you give someone’s name as a referee on your application.', target:'referee', grammarPattern:'' },
        { id:'3', text:'Her referee described her as patient, organised and very good with younger children.', target:'referee', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'referee', wrong:['neighbour', 'passenger', 'recipe'] },
        { id:'2', answer:'referee', wrong:['harbour', 'ticket', 'umbrella'] },
        { id:'3', answer:'referee', wrong:['museum', 'carpet', 'staircase'] }
      ]
    }),
  e('reference', 'noun',
    'a short written statement from someone who knows you, saying whether you are suitable for a job or a course',
    ['written opinion from someone who knows you', 'letter that recommends you for a job'],
    ['a short mention of something in a conversation', 'a list of books used to write an essay', 'a number used to identify an order'],
    'The college asked for a reference from her last teacher before it offered her a place.',
    'written opinion from someone who knows her', 'The college asked for a written opinion from someone who knows her from her last teacher before it offered her a place.',
    'letter that recommends you for a job', 'A strong letter that recommends you for a job can be more helpful than a long list of qualifications.',
    {
      teacherNote:'Taught in its job and college sense only: a short written statement from someone who knows you, saying whether you are suitable. The other senses (a mention of something; a list of sources; a code number) are not taught here. Related target in this unit: referee (the person who writes it). Note the common phrasing: write / provide / ask for a reference.',
      masteryContexts:[
        { text:'The manager promised to write a reference that mentioned Sana’s honesty and hard work.', meaning:'a written statement about someone’s suitability' },
        { text:'Without a reference from a previous employer, the company could not check how reliable the applicant had been.', meaning:'a statement that says if someone is suitable' }
      ],
      situationDistractors:[
        'A teacher wrote a letter saying that a student was polite, honest and keen to learn.',
        'A former boss described a worker’s strengths in a short signed statement.',
        'A coach wrote a page about a player’s character for her university application.'
      ],
      retrievalContexts:[
        { id:'1', text:'A good reference does not simply praise the writer’s opinion; it gives clear examples of the person’s skills.', target:'reference', grammarPattern:'' },
        { id:'2', text:'The job offer depended on a satisfactory reference from her previous employer.', target:'reference', grammarPattern:'' },
        { id:'3', text:'He asked his tutor to write a reference that mentioned his leadership of the school newspaper.', target:'reference', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'reference', wrong:['holiday', 'recipe', 'invitation'] },
        { id:'2', answer:'reference', wrong:['souvenir', 'umbrella', 'sandwich'] },
        { id:'3', answer:'reference', wrong:['carpet', 'staircase', 'bicycle'] }
      ]
    }),
  e('proficiency', 'noun',
    'a high level of skill or ability, especially in a language or a practical task',
    ['high level of skill', 'ability to do something very well'],
    ['a very low level of ability in something', 'a certificate that a course has started', 'a feeling of pride after finishing a task'],
    'The job advertisement asked for proof of proficiency in English and one other language.',
    'a high level of skill', 'The job advertisement asked for proof of a high level of skill in English and one other language.',
    'ability to do something very well', 'A university will usually test your ability to do something very well before it gives you a place on the course.',
    {
      teacherNote:'Noun: a high level of skill or ability, especially in a language, a test or a practical job (proficiency in English, language proficiency). Boundary: proficiency is more than basic knowledge; it describes someone who does the task well. Often followed by in.',
      masteryContexts:[
        { text:'Candidates must show proficiency in written English before they are offered a place on the course.', meaning:'a high level of skill or ability' },
        { text:'Her proficiency with spreadsheets saved the team hours of work every week.', meaning:'a high level of skill in doing something' }
      ],
      situationDistractors:[
        'A girl spoke fluent Spanish at the interview and corrected the interviewer’s small mistake.',
        'A boy completed a complicated spreadsheet in half the time allowed.',
        'A woman passed the advanced language test with the highest mark in the room.'
      ],
      retrievalContexts:[
        { id:'1', text:'The company expects a high level of proficiency in English from everyone in the customer team.', target:'proficiency', grammarPattern:'' },
        { id:'2', text:'Her proficiency in three languages made her the strongest applicant.', target:'proficiency', grammarPattern:'' },
        { id:'3', text:'Employers often test computer proficiency before they invite people to a final interview.', target:'proficiency', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'proficiency', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'proficiency', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'proficiency', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('enthusiastic', 'adjective',
    'showing great interest, energy and excitement about something',
    ['full of interest and energy', 'keen and excited'],
    ['showing no interest in something', 'afraid of making a mistake', 'angry about a decision'],
    'The interviewer was pleased to meet such an enthusiastic young applicant.',
    'keen and excited', 'The interviewer was pleased to meet such a keen and excited young applicant.',
    'full of interest and energy', 'Employers often choose people who seem full of interest and energy, even if they have less experience.',
    {
      teacherNote:'Adjective: showing great interest, energy and excitement about something (enthusiastic about, an enthusiastic team). It is used with about or for. Boundary: enthusiastic shows positive energy; it is stronger than interested and can be seen in the voice and body language.',
      masteryContexts:[
        { text:'The shop manager wanted an enthusiastic assistant who enjoyed talking to customers.', meaning:'full of interest and energy' },
        { text:'Nobody could miss how enthusiastic the whole team was about the new project.', meaning:'very keen and excited' }
      ],
      situationDistractors:[
        'A girl smiled, leaned forward and asked three questions about the new project.',
        'A boy talked eagerly about the club and could not wait to start.',
        'A woman told the panel that she had dreamed of this job since she was a child.'
      ],
      retrievalContexts:[
        { id:'1', text:'She was not the most experienced applicant, but she was the most enthusiastic about learning new skills.', target:'enthusiastic', grammarPattern:'' },
        { id:'2', text:'An enthusiastic speaker can make even a dull subject interesting for the audience.', target:'enthusiastic', grammarPattern:'' },
        { id:'3', text:'The manager was impressed by his enthusiastic answers and his willingness to start immediately.', target:'enthusiastic', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'enthusiastic', wrong:['careless', 'frozen', 'rectangular'] },
        { id:'2', answer:'enthusiastic', wrong:['wooden', 'furious', 'enormous'] },
        { id:'3', answer:'enthusiastic', wrong:['crowded', 'distant', 'bitter'] }
      ]
    }),
  e('availability', 'noun',
    'the time when a person is free to attend a meeting or start work',
    ['times when someone is free', 'whether a person can attend'],
    ['the number of years someone has worked', 'a promise to arrive earlier than planned', 'the amount of money someone expects to earn'],
    'Please email your availability for next week so that we can arrange the interviews.',
    'times when you are free', 'Please email the times when you are free for next week so that we can arrange the interviews.',
    'whether a person can attend', 'The organiser checked whether a person can attend each session before preparing the final timetable.',
    {
      idKey:'availability_7',
      teacherNote:'Unit 7 item (availability_7), separate from the Unit 2 and Unit 5 availability items; it shares only the lexical spelling list. Sense in this unit: the time when a person is free to attend a meeting, start work or take part. Boundary: this is about a person’s free time, not whether a room, seat or product can be obtained.',
      masteryContexts:[
        { text:'The company asked each candidate to confirm their availability for a second interview on Thursday or Friday.', meaning:'the times when someone is free to attend' },
        { text:'Because of her limited availability on weekdays, Sofia could only accept evening shifts.', meaning:'the times when a person is free to work' }
      ],
      situationDistractors:[
        'A student told the manager that she could work on Saturdays and Sundays but not on weekdays.',
        'A man replied that he could start the new job at the beginning of next month.',
        'A woman sent the panel a list of all the days she could come in for a meeting.'
      ],
      retrievalContexts:[
        { id:'1', text:'Before we fix a date for the interview, please let us know your availability during the next two weeks.', target:'availability', grammarPattern:'' },
        { id:'2', text:'The manager built the work timetable around each student’s availability after school.', target:'availability', grammarPattern:'' },
        { id:'3', text:'Her availability is limited to Tuesday and Thursday afternoons because she has classes on the other days.', target:'availability', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'availability', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'availability', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'availability', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('compromise', 'noun',
    'an agreement in which each side accepts less than it wanted in order to settle a disagreement',
    ['agreement where both sides give something up', 'middle solution that both sides accept'],
    ['a decision made by one person without asking anyone', 'a promise to do exactly what the other side wants', 'an argument that continues for a long time'],
    'After a long discussion, the two interviewers reached a compromise and offered the post to the second candidate.',
    'agreement where both sides gave something up', 'After a long discussion, the two interviewers reached an agreement where both sides gave something up and offered the post to the second candidate.',
    'middle solution that both sides accept', 'In a group discussion, suggesting a middle solution that both sides accept can show that you are a good team member.',
    {
      teacherNote:'Noun: an agreement in which each side accepts less than it wanted (reach a compromise, make a compromise). In discussions and interviews it shows the ability to work with others. The verb (to compromise on something) is a separate use of the same word and is not taught as its own item. The sense of putting something at risk is not taught.',
      masteryContexts:[
        { text:'The students could not agree on a date, so they reached a compromise and met on Saturday morning.', meaning:'an agreement where each side gives something up' },
        { text:'In the group task, Leila suggested a compromise by using ideas from both teams.', meaning:'a solution that both sides accept' }
      ],
      situationDistractors:[
        'Two friends could not agree on a restaurant, so each chose one dish for the table and they ate at a place in the middle.',
        'A manager and a worker agreed on shorter hours and a smaller salary after a long talk.',
        'Two sides in a debate each accepted a change to their proposal so that a plan could go ahead.'
      ],
      retrievalContexts:[
        { id:'1', text:'After weeks of argument, the company and the workers finally reached a compromise about working hours.', target:'compromise', grammarPattern:'' },
        { id:'2', text:'A good interviewee shows that she can find a compromise when team members disagree.', target:'compromise', grammarPattern:'' },
        { id:'3', text:'The only compromise that satisfied both families was to hold the party at a neutral venue.', target:'compromise', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'compromise', wrong:['holiday', 'recipe', 'invitation'] },
        { id:'2', answer:'compromise', wrong:['souvenir', 'umbrella', 'sandwich'] },
        { id:'3', answer:'compromise', wrong:['carpet', 'staircase', 'bicycle'] }
      ]
    }),
  e('dominate', 'verb',
    'to have the most control or influence in a situation, or to speak so much that others cannot',
    ['have the most control over', 'take over by being the loudest'],
    ['to listen carefully to the other speakers', 'to give way to someone more experienced', 'to share the work equally with everyone'],
    'In a group interview, you should avoid trying to dominate the conversation.',
    'take over by being the loudest in', 'In a group interview, you should avoid trying to take over by being the loudest in the conversation.',
    'have the most control over', 'Large companies from a few countries have the most control over the world market for computer chips.',
    {
      teacherNote:'Verb: to have the most control or influence over a situation, or to speak or act so much that others have no chance (dominate a discussion, dominate the market). In interviews it describes a negative behaviour in group tasks. Boundary: dominate suggests too much control; lead suggests guiding others in a positive way. Other forms (dominant, dominance) are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'One student tried to dominate the discussion, so the others had hardly any chance to speak.', meaning:'to take control by speaking too much' },
        { text:'A few large companies dominate the market for mobile phones in this region.', meaning:'to have the most control or influence over' }
      ],
      situationDistractors:[
        'One boy talked for most of the meeting and interrupted every person who tried to speak.',
        'Two large supermarkets control almost all of the food sales in the town.',
        'A tall player controlled the ball at every moment of the match and her team scored most of the goals.'
      ],
      retrievalContexts:[
        { id:'1', text:'A good team member listens and makes space for others instead of trying to dominate the group.', target:'dominate', grammarPattern:'' },
        { id:'2', text:'In many countries, a small number of banks dominate the market and set the prices.', target:'dominate', grammarPattern:'' },
        { id:'3', text:'The assessors noticed that Daniel tended to dominate every discussion, which made him a poor team player.', target:'dominate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'dominate', wrong:['borrow', 'repair', 'forget'] },
        { id:'2', answer:'dominate', wrong:['invent', 'decorate', 'translate'] },
        { id:'3', answer:'dominate', wrong:['postpone', 'photograph', 'celebrate'] }
      ]
    }),
  e('strategy', 'noun',
    'a plan for dealing with a difficult situation or achieving a goal such as doing well in an interview',
    ['plan for achieving a goal', 'planned way of dealing with a difficulty'],
    ['a short break taken during a long meeting', 'a rule that nobody is allowed to change', 'a mistake that is repeated several times'],
    'One useful interview strategy is to give a short example after each answer.',
    'plan for doing well', 'One useful interview plan for doing well is to give a short example after each answer.',
    'planned way of dealing with a difficulty', 'Having a planned way of dealing with a difficulty helps candidates to stay calm when a question surprises them.',
    {
      idKey:'strategy_7',
      teacherNote:'Unit 7 item (strategy_7), separate from the Unit 6 strategy item; it shares only the lexical spelling list with the Unit 6 item. Sense in this unit: a plan for dealing with a difficult situation or achieving a goal, here the plan for answering questions in an interview or test. Boundary: a strategy is the overall plan; a technique is one particular skilled method (technique is also a target in this unit).',
      masteryContexts:[
        { text:'Her strategy for difficult questions was to pause, take a breath and then answer slowly.', meaning:'a plan for dealing with a difficult situation' },
        { text:'The company changed its strategy and began to recruit more people from local schools.', meaning:'a plan for achieving an important aim' }
      ],
      situationDistractors:[
        'A girl decided to prepare three short stories about her school life before the interview so that she could use them in any answer.',
        'A manager made a plan to open two new shops in the north of the country over three years.',
        'A football coach planned how the team would defend in the first half and attack in the second.'
      ],
      retrievalContexts:[
        { id:'1', text:'A sensible strategy for the exam is to read all the questions first and then begin with the easiest.', target:'strategy', grammarPattern:'' },
        { id:'2', text:'The company’s new recruitment strategy focuses on finding young people with excellent communication skills.', target:'strategy', grammarPattern:'' },
        { id:'3', text:'Practising answers aloud with a friend is an effective strategy for reducing nerves before an interview.', target:'strategy', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'strategy', wrong:['recipe', 'invitation', 'souvenir'] },
        { id:'2', answer:'strategy', wrong:['umbrella', 'sandwich', 'carpet'] },
        { id:'3', answer:'strategy', wrong:['staircase', 'bicycle', 'neighbour'] }
      ]
    }),
  e('flexible', 'adjective',
    'able to change or adapt easily to new situations, times or plans',
    ['able to change easily', 'willing to adapt to new plans'],
    ['unwilling to change any plans', 'able to do only one task well', 'quick to become angry or upset'],
    'The manager is looking for staff who are flexible when the working hours change.',
    'willing to adapt', 'The manager is looking for staff who are willing to adapt when the working hours change.',
    'able to change easily', 'In a busy hospital, it is useful to be able to change easily when the day does not go as planned.',
    {
      teacherNote:'Adjective: able to change or adapt easily to new situations, times or plans (flexible hours, a flexible approach). In interviews it describes a positive quality in a worker. Boundary: flexible about plans is positive; it is not the same as weak, because a flexible person still has opinions. The physical sense (a flexible material) is not taught here.',
      masteryContexts:[
        { text:'The café offers flexible hours, so students can work around their lessons.', meaning:'able to be changed to suit different needs' },
        { text:'She was flexible when the plan changed and quickly found another room for the meeting.', meaning:'willing and able to adapt to a change' }
      ],
      situationDistractors:[
        'A student agreed to swap shifts with a colleague at the last minute and did not complain.',
        'A manager allowed workers to start and finish at different times to suit family life.',
        'A girl changed her plan quickly when the bus was cancelled and walked to the interview instead.'
      ],
      retrievalContexts:[
        { id:'1', text:'The company prefers flexible workers who can help in different departments when it is busy.', target:'flexible', grammarPattern:'' },
        { id:'2', text:'Because the project changed three times, the team had to be flexible and adjust their plans.', target:'flexible', grammarPattern:'' },
        { id:'3', text:'A flexible timetable allows parents to start work later and finish earlier.', target:'flexible', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'flexible', wrong:['frozen', 'rectangular', 'wooden'] },
        { id:'2', answer:'flexible', wrong:['enormous', 'furious', 'distant'] },
        { id:'3', answer:'flexible', wrong:['bitter', 'crowded', 'careless'] }
      ]
    }),
  e('schedule', 'noun',
    'a plan that shows the times and dates when things will happen',
    ['plan of times and dates', 'timetable of when things will happen'],
    ['a list of rules that must be obeyed', 'a short report about a past event', 'a record of money that has been spent'],
    'The company sent every candidate a schedule for the day, with the time of each interview.',
    'plan of times and dates', 'The company sent every candidate a plan of times and dates for the day, with the time of each interview.',
    'timetable of when things will happen', 'Before the visit, the school published a timetable of when things will happen on each day.',
    {
      teacherNote:'Noun: a plan that shows when things will happen (a busy schedule, a schedule for the day, on schedule). Boundary: a schedule lists times and dates; an agenda lists topics. The verb (to schedule a meeting) is a related use of the same word and is not taught as a separate item.',
      masteryContexts:[
        { text:'The interview schedule showed that Karim’s meeting would begin at half past ten.', meaning:'a plan showing the times of events' },
        { text:'The manager had a very busy schedule, so she could only see candidates for twenty minutes each.', meaning:'a plan that is full of planned activities' }
      ],
      situationDistractors:[
        'A girl wrote the start and end time of every lesson on a card and stuck it on her wall.',
        'A manager sent staff a list showing who would work on each day of the week.',
        'An organiser printed a sheet showing when each speaker would talk at the conference.'
      ],
      retrievalContexts:[
        { id:'1', text:'Please check the schedule carefully so that you arrive at the right time on the day.', target:'schedule', grammarPattern:'' },
        { id:'2', text:'The workshop is running behind schedule because the first speaker arrived late.', target:'schedule', grammarPattern:'' },
        { id:'3', text:'Her schedule is so full on weekdays that she can only attend an interview on Saturday.', target:'schedule', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'schedule', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'schedule', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'schedule', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('expectation', 'noun',
    'a belief that something will happen, or that someone should behave or achieve in a certain way',
    ['belief that something will happen', 'what someone thinks should be achieved'],
    ['a surprise that nobody had planned', 'a reward for finishing a task', 'a doubt about whether a plan is wise'],
    'The employer’s main expectation is that every new member of staff will arrive on time.',
    'belief about what will happen', 'The employer’s main belief about what will happen is that every new member of staff will arrive on time.',
    'what someone thinks should be achieved', 'Before starting the course, the teacher explained what someone thinks should be achieved by the end of each month.',
    {
      teacherNote:'Noun: a belief that something will happen, or that someone should reach a certain standard (high expectation, meet someone’s expectation, an expectation of). The singular is taught here; it is often plural in speech and writing (expectations). Boundary: an expectation is what you believe will happen or hope for, and it may or may not come true.',
      masteryContexts:[
        { text:'There is an expectation that candidates will dress smartly for an interview.', meaning:'a belief that people should behave in a certain way' },
        { text:'The new employee’s performance was far above the manager’s expectation after only three weeks.', meaning:'what a person believed would happen' }
      ],
      situationDistractors:[
        'A manager told a new worker that she was sure he would be on time every day.',
        'A teacher said that she believed her students would all pass the exam.',
        'A father told his daughter that he hoped she would try her best in the interview.'
      ],
      retrievalContexts:[
        { id:'1', text:'It is a reasonable expectation that a student who revises regularly will do well in the test.', target:'expectation', grammarPattern:'' },
        { id:'2', text:'The job description explained the employer’s expectation of high standards from every member of the team.', target:'expectation', grammarPattern:'' },
        { id:'3', text:'She did not live up to her teacher’s expectation, but she improved a lot in the second term.', target:'expectation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'expectation', wrong:['holiday', 'recipe', 'souvenir'] },
        { id:'2', answer:'expectation', wrong:['umbrella', 'sandwich', 'carpet'] },
        { id:'3', answer:'expectation', wrong:['staircase', 'bicycle', 'neighbour'] }
      ]
    }),
  e('impress', 'verb',
    'to make someone feel admiration or respect because of what you say or do',
    ['make someone admire you', 'win someone’s respect'],
    ['to make someone feel bored or tired', 'to give someone a gift or reward', 'to ask someone to repeat an answer'],
    'She prepared three short stories to impress the panel during the interview.',
    'win the respect of', 'She prepared three short stories to win the respect of the panel during the interview.',
    'make someone admire you', 'Some students try to make someone admire them by using long words, but clear speech is often more effective.',
    {
      teacherNote:'Verb: to make someone feel admiration or respect because of what you say or do (impress the interviewer, impress someone with). Boundary: impress is about a positive effect on another person; it is not the same as persuade, which is about changing a decision. Related forms (impression, impressive) are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'A neat CV and a polite email can impress an employer before the interview even begins.', meaning:'to make someone admire or respect you' },
        { text:'The young musician hoped to impress the judges with her skill and confidence.', meaning:'to win admiration by showing ability' }
      ],
      situationDistractors:[
        'A girl arrived ten minutes early and spoke clearly, so the panel remembered her well.',
        'A boy built a small robot and the teacher said it was one of the best projects she had ever seen.',
        'A young cook prepared a perfect meal and the head chef praised her warmly.'
      ],
      retrievalContexts:[
        { id:'1', text:'Candidates who research the company before the interview usually impress the panel.', target:'impress', grammarPattern:'' },
        { id:'2', text:'It is not always necessary to use long words to impress an examiner.', target:'impress', grammarPattern:'' },
        { id:'3', text:'He wanted to impress his new manager, so he stayed late to finish the report.', target:'impress', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'impress', wrong:['borrow', 'repair', 'forget'] },
        { id:'2', answer:'impress', wrong:['invent', 'decorate', 'translate'] },
        { id:'3', answer:'impress', wrong:['postpone', 'photograph', 'celebrate'] }
      ]
    }),
  e('respond', 'verb',
    'to give an answer or reaction, in speech or in writing, to a question or a message',
    ['give an answer to', 'answer in speech or writing'],
    ['to ask a question without waiting for an answer', 'to forget a message after reading it', 'to read a message aloud to a group'],
    'The company promised to respond to every application within two weeks.',
    'give an answer to', 'The company promised to give an answer to every application within two weeks.',
    'answer in speech or writing', 'It is polite to answer in speech or writing as soon as you receive an invitation.',
    {
      idKey:'respond_7',
      teacherNote:'Unit 7 item (respond_7), separate from the Unit 6 respond item; it shares only the lexical spelling list. Sense in this unit: to give an answer or a reaction to a question, an email or an application (respond to). It is followed by to. Boundary: respond is the general word for replying; answer is usually used for questions and tests.',
      masteryContexts:[
        { text:'In the interview, Hana took a moment before she began to respond to the difficult question.', meaning:'to give an answer to a question' },
        { text:'If an employer sends you an email, you should respond within a day or two.', meaning:'to give an answer to a message' }
      ],
      situationDistractors:[
        'A student wrote back to the company the same day to accept the invitation to the interview.',
        'A candidate listened to the whole question and then gave a clear answer.',
        'A manager replied to every email she received before the end of the afternoon.'
      ],
      retrievalContexts:[
        { id:'1', text:'Candidates are asked to respond to the invitation by Friday if they wish to attend.', target:'respond', grammarPattern:'' },
        { id:'2', text:'The interviewer paused so that the candidate could respond calmly to the difficult question.', target:'respond', grammarPattern:'' },
        { id:'3', text:'The school aims to respond to all parents’ emails within two working days.', target:'respond', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'respond', wrong:['borrow', 'repair', 'forget'] },
        { id:'2', answer:'respond', wrong:['invent', 'decorate', 'translate'] },
        { id:'3', answer:'respond', wrong:['postpone', 'photograph', 'celebrate'] }
      ]
    }),
  e('relevant', 'adjective',
    'connected with what is being discussed, so that it is useful or important for the purpose',
    ['connected to the subject', 'useful for what is being discussed'],
    ['showing great respect for someone', 'happening very often in a short time', 'difficult to understand because it is long'],
    'Candidates should give examples that are relevant to the job they are applying for.',
    'connected to the subject of', 'Candidates should give examples that are connected to the subject of the job they are applying for.',
    'useful for what is being discussed', 'A good speaker chooses only facts that are useful for what is being discussed and leaves out the rest.',
    {
      idKey:'relevant_7',
      teacherNote:'Unit 7 item (relevant_7), separate from the Unit 2 relevant item; it shares only the lexical spelling list. Sense in this unit: connected with what is being discussed, so useful for the purpose, such as an example that matches the job (relevant to). Boundary: relevant is about connection to a purpose; it is not the same as important, because a fact can be important but not relevant to the question.',
      masteryContexts:[
        { text:'Her work experience was relevant to the post because she had already managed a small team.', meaning:'closely connected with the purpose' },
        { text:'The interviewer asked her to keep her answers short and relevant.', meaning:'connected with the question and useful for it' }
      ],
      situationDistractors:[
        'A girl applying to be a nurse mentioned her first-aid course and her voluntary work at a hospital.',
        'A boy kept his answer to the question about teamwork and did not talk about his holidays.',
        'A man listed only the jobs that were related to the post when he wrote his CV.'
      ],
      retrievalContexts:[
        { id:'1', text:'Only relevant experience should appear on your CV, so leave out jobs that are unconnected to the post.', target:'relevant', grammarPattern:'' },
        { id:'2', text:'The examiner reminded the class to include only facts that were relevant to the question.', target:'relevant', grammarPattern:'' },
        { id:'3', text:'A relevant example from your own life can make your answer in an interview much stronger.', target:'relevant', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'relevant', wrong:['frozen', 'rectangular', 'wooden'] },
        { id:'2', answer:'relevant', wrong:['enormous', 'furious', 'distant'] },
        { id:'3', answer:'relevant', wrong:['bitter', 'crowded', 'careless'] }
      ]
    }),
  e('contribute', 'verb',
    'to give ideas, time, money or effort to help achieve something with other people',
    ['give ideas or effort to help', 'add to what a group is doing'],
    ['to take something from a group', 'to prevent others from taking part', 'to report a problem to a manager'],
    'In the group task, each candidate was expected to contribute at least one idea.',
    'give ideas or effort to help', 'In the group task, each candidate was expected to give ideas or effort to help with at least one idea.',
    'add to what a group is doing', 'Students who want to add to what a group is doing should listen carefully before they speak.',
    {
      teacherNote:'Verb: to give ideas, time, money or effort to help with something that other people are also doing (contribute to a discussion, contribute ideas). It is usually followed by to or by an object such as ideas. Boundary: contribute means to give; take part means only to be there. The noun and the person noun are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Quiet students sometimes find it difficult to contribute to a fast group discussion.', meaning:'to give ideas to help a group' },
        { text:'Several local companies contribute money to the school’s sports programme every year.', meaning:'to give money to help something' }
      ],
      situationDistractors:[
        'A boy listened for a while and then suggested a new way of dividing the work in the group.',
        'A woman gave part of her salary to help build a new library in the town.',
        'A student stayed after the lesson to help the teacher put the chairs away.'
      ],
      retrievalContexts:[
        { id:'1', text:'Everyone in the team should contribute ideas during the first meeting.', target:'contribute', grammarPattern:'' },
        { id:'2', text:'The assessors watched how often each candidate tried to contribute to the group task.', target:'contribute', grammarPattern:'' },
        { id:'3', text:'Volunteers can contribute their time and skills to the local community in many ways.', target:'contribute', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'contribute', wrong:['borrow', 'repair', 'forget'] },
        { id:'2', answer:'contribute', wrong:['invent', 'decorate', 'translate'] },
        { id:'3', answer:'contribute', wrong:['postpone', 'photograph', 'celebrate'] }
      ]
    }),
  e('coherent', 'adjective',
    'logical, clear and well organised, so that the parts fit together and are easy to follow',
    ['clear and logical', 'with parts that fit together well'],
    ['full of exciting and unusual ideas', 'written very quickly and without care', 'spoken only in a quiet voice'],
    'The best answer in the interview was short, polite and coherent.',
    'easy to follow', 'The best answer in the interview was short, polite and easy to follow.',
    'with parts that fit together well', 'An essay with parts that fit together well is far easier for the examiner to read.',
    {
      teacherNote:'Adjective: logical, clear and well organised, so that the ideas fit together and are easy to follow (a coherent answer, a coherent argument). Boundary: coherent is about organisation and clear connection; it is not about length or about correct grammar alone. It is used for speech, writing and plans.',
      masteryContexts:[
        { text:'The candidate gave a coherent answer that moved clearly from the problem to the solution.', meaning:'logical and well organised' },
        { text:'The speech was not coherent because the speaker jumped from one idea to another without any link.', meaning:'clear because the ideas are connected' }
      ],
      situationDistractors:[
        'A girl explained her plan in three clear steps, and each step led naturally to the next.',
        'A student wrote an essay in which every paragraph built on the one before it.',
        'A candidate answered the question by giving a reason, an example and a short conclusion.'
      ],
      retrievalContexts:[
        { id:'1', text:'A coherent paragraph begins with a main idea and then adds reasons and examples in a sensible order.', target:'coherent', grammarPattern:'' },
        { id:'2', text:'The panel could not follow her answer because it was not coherent and kept changing direction.', target:'coherent', grammarPattern:'' },
        { id:'3', text:'He gave a coherent explanation of why he had chosen the course and what he hoped to do after it.', target:'coherent', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'coherent', wrong:['frozen', 'rectangular', 'wooden'] },
        { id:'2', answer:'coherent', wrong:['enormous', 'furious', 'distant'] },
        { id:'3', answer:'coherent', wrong:['bitter', 'crowded', 'careless'] }
      ]
    }),
  e('implication', 'noun',
    'a possible effect or meaning that is suggested but not stated directly',
    ['possible result that is not stated', 'meaning that is suggested indirectly'],
    ['a clear instruction that must be followed', 'a mistake found in a long document', 'a reason for ending a conversation'],
    'Candidates should think carefully about the implication of their answers when they are asked about salary.',
    'meaning that is suggested indirectly by', 'Candidates should think carefully about the meaning that is suggested indirectly by their answers when they are asked about salary.',
    'possible result that is not stated', 'The report mentions only the figures and does not discuss any possible result that is not stated openly.',
    {
      teacherNote:'Noun: a possible effect or meaning that is suggested but not stated directly (the implication of, an implication for). It is often followed by of or for, and it is usually used about the effect of something on a person or plan. Boundary: an implication is not stated in the words, so it has to be worked out by the reader or listener.',
      masteryContexts:[
        { text:'The implication of her answer was that she did not enjoy working in a team.', meaning:'a meaning that is suggested but not stated' },
        { text:'The report discussed the main implication for students if the school day became an hour longer.', meaning:'the possible effects of a change' }
      ],
      situationDistractors:[
        'A manager said that she was surprised the report was still unfinished, and the staff understood that she was displeased.',
        'A teacher explained what would happen to the timetable if the new lesson was added.',
        'A student noticed that the speaker had not said it directly but clearly thought the plan was weak.'
      ],
      retrievalContexts:[
        { id:'1', text:'The implication of the company’s silence was that the job had already been given to someone else.', target:'implication', grammarPattern:'' },
        { id:'2', text:'Before changing the timetable, the school considered the implication for students who travel by bus.', target:'implication', grammarPattern:'' },
        { id:'3', text:'She did not say that she disliked the plan, but the implication of her smile was clear.', target:'implication', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'implication', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'implication', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'implication', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('register', 'noun',
    'the level of formality of the language that you use, such as formal or informal',
    ['level of politeness in your language', 'style of speaking or writing for a situation'],
    ['an official list of names', 'a loud and sudden change of voice', 'a record of attendance at a lesson'],
    'In a job interview, you should use a polite and professional register.',
    'level of politeness in your language', 'In a job interview, you should use a polite and professional level of politeness in your language.',
    'style of speaking or writing for a situation', 'Choosing the right style of speaking or writing for a situation is an important skill in English.',
    {
      teacherNote:'Taught in its language sense only: the level of formality of the language you use (a formal register, an informal register, change register). The other meanings (an official list of names; the verb to register for something) are separate and are not taught here. Boundary: register is about how formal or informal the words and grammar are, not about how loud a person speaks.',
      masteryContexts:[
        { text:'A student should change register when she moves from chatting with friends to writing an email to a head teacher.', meaning:'the level of formality in language' },
        { text:'The letter was written in a very formal register, with long sentences and polite phrases.', meaning:'a style of language suited to the situation' }
      ],
      situationDistractors:[
        'A girl wrote “Dear Mr Hassan” and used polite phrases in her email to a head teacher.',
        'A boy texted his cousin using short words and laughing emojis.',
        'A woman changed from friendly language to a more professional style as soon as the interview began.'
      ],
      retrievalContexts:[
        { id:'1', text:'An informal register is fine in a message to a friend, but not in a letter to an employer.', target:'register', grammarPattern:'' },
        { id:'2', text:'Mia used a polite register in the interview and avoided slang and short forms such as “gonna”.', target:'register', grammarPattern:'' },
        { id:'3', text:'Examiners notice whether you can choose the correct register for the task, whether formal or friendly.', target:'register', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'register', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'register', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'register', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('format', 'noun',
    'the way in which something is arranged, organised or presented',
    ['way something is arranged', 'plan for how something is organised'],
    ['a short break between two parts of an event', 'a list of rules about behaviour', 'a mistake made in the first part of a plan'],
    'The invitation explained the format of the day: a short test, a group task and a one-to-one interview.',
    'way the day is arranged', 'The invitation explained the way the day is arranged: a short test, a group task and a one-to-one interview.',
    'plan for how something is organised', 'Before you start writing, find out the plan for how something is organised, such as the number of sections.',
    {
      teacherNote:'Noun: the way in which something is arranged, organised or presented (the format of a test, a document, an interview). It is often followed by of. Boundary: format is about the pattern or arrangement, whereas content is what is inside it. The verb to format a document and the computer sense are not taught here.',
      masteryContexts:[
        { text:'The college changed the format of the entrance test, so it now has two short papers instead of one long paper.', meaning:'the way something is organised' },
        { text:'Candidates must send their CVs in the same format, so the panel can compare them easily.', meaning:'a set pattern for presenting information' }
      ],
      situationDistractors:[
        'The leaflet said that the exam would have two papers, with multiple choice in the first and an essay in the second.',
        'A teacher gave students a template with headings so that all the reports looked the same.',
        'The organiser explained that the day would begin with talks and end with workshops.'
      ],
      retrievalContexts:[
        { id:'1', text:'It helps to know the format of the speaking test, so that you can practise in the same way.', target:'format', grammarPattern:'' },
        { id:'2', text:'The company asked everyone to follow the same format when they sent in their CVs.', target:'format', grammarPattern:'' },
        { id:'3', text:'The new quiz has a different format, with short answers in place of multiple choice.', target:'format', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'format', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'format', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'format', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('membership', 'noun',
    'the state of belonging to a group, club or organisation',
    ['the state of belonging to a group', 'the fact of being part of a club'],
    ['a place where a club holds its meetings', 'a list of the rules for a club', 'a fee that is paid only once'],
    'Free membership of the school’s sports club is offered to all students who attend regularly.',
    'the state of belonging to a group', 'Free the state of belonging to a group of the school’s sports club is offered to all students who attend regularly.',
    'the fact of being part of a club', 'The fact of being part of a club can give young people new friends and a greater sense of purpose.',
    {
      teacherNote:'Noun: the state of belonging to a group, club or organisation (apply for membership, membership of a club). It is usually uncountable here. Boundary: membership is the state or the right of belonging; the members are the people who belong, so the two should not be confused.',
      masteryContexts:[
        { text:'After the interview, she was invited to apply for membership of the national youth orchestra.', meaning:'the state of belonging to a group' },
        { text:'Annual membership gives students free entry to the museum and discounts in the shop.', meaning:'the right to belong to an organisation' }
      ],
      situationDistractors:[
        'A girl filled in a form and paid a small fee so that she could join the local swimming club.',
        'A boy showed a card at the entrance that proved he belonged to the library.',
        'A man renewed his place in the film society for another year.'
      ],
      retrievalContexts:[
        { id:'1', text:'Without a card to prove your membership, you cannot borrow books from the university library.', target:'membership', grammarPattern:'' },
        { id:'2', text:'The club offers cheap membership to students under eighteen.', target:'membership', grammarPattern:'' },
        { id:'3', text:'His membership of the debating society showed that he was confident and enjoyed discussion.', target:'membership', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'membership', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'membership', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'membership', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('certificate', 'noun',
    'an official document that shows that a person has passed an exam or finished a course',
    ['official paper that proves you passed', 'document showing a course was completed'],
    ['a written promise to pay money later', 'a short letter that thanks a company', 'a list of the questions in an exam'],
    'At the end of the course, each student received a certificate signed by the head teacher.',
    'official paper that proves you passed', 'At the end of the course, each student received an official paper that proves you passed, signed by the head teacher.',
    'document showing a course was completed', 'Many employers ask to see a document showing a course was completed before they offer the job.',
    {
      teacherNote:'Noun: an official document that shows that someone has passed an exam, finished a course or reached a standard (a first-aid certificate, a certificate of attendance). Boundary: a certificate is the document; the qualification is the achievement it proves. The verb certify and the adjective certified are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'She showed the interviewer her first-aid certificate and her swimming award.', meaning:'an official document proving a skill' },
        { text:'Students who attend every lesson will be given a certificate at the end of the programme.', meaning:'an official paper showing a course is complete' }
      ],
      situationDistractors:[
        'A girl received a printed page with her name on it after passing the first-aid course.',
        'A boy proudly put the paper that confirmed his exam result in a folder for job interviews.',
        'A woman handed an official document to the college to prove that she had completed her training.'
      ],
      retrievalContexts:[
        { id:'1', text:'Please bring the original certificate to the interview so that we can check your results.', target:'certificate', grammarPattern:'' },
        { id:'2', text:'She framed the certificate that she had received for completing the lifeguard course.', target:'certificate', grammarPattern:'' },
        { id:'3', text:'The training centre issues a certificate to everyone who passes the final practical test.', target:'certificate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'certificate', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'certificate', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'certificate', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('qualification', 'noun',
    'a quality, skill or achievement that makes a person suitable for a particular job or role',
    ['skill that makes someone suitable for a job', 'quality needed to do a role well'],
    ['a mistake that makes someone unsuitable for a job', 'a reward given at the end of a year', 'a rule that every worker must obey'],
    'For this post, a driving licence is an essential qualification.',
    'skill needed to be suitable', 'For this post, a driving licence is an essential skill needed to be suitable.',
    'quality needed to do a role well', 'Patience is the quality needed to do a role well when working with very young children.',
    {
      idKey:'qualification_7',
      teacherNote:'Unit 7 item (qualification_7), separate from the Unit 5 qualification item; it shares only the lexical spelling list. Sense in this unit: a quality, skill or achievement that makes a person suitable for a particular job or role (the main qualification for the post). Boundary: the plural qualifications (also a target in this unit) means the collection of exam results and training on a CV; use the singular for one required quality or skill. The verb qualify and the adjective qualified are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Patience is probably the most important qualification for anyone who wants to teach young children.', meaning:'a skill that makes someone suitable for a role' },
        { text:'The advertisement said that fluency in two languages was a useful qualification for the post.', meaning:'a skill that makes a person suitable for a job' }
      ],
      situationDistractors:[
        'The advertisement stated that a person who could speak Arabic would be especially suitable for the job.',
        'A manager said that good communication was the first thing she looked for in a new receptionist.',
        'A teacher explained that the main thing a lifeguard needs is to be a strong swimmer.'
      ],
      retrievalContexts:[
        { id:'1', text:'A degree in engineering is the minimum qualification for this position.', target:'qualification', grammarPattern:'' },
        { id:'2', text:'Friendliness is an important qualification for anyone who works in a hotel reception.', target:'qualification', grammarPattern:'' },
        { id:'3', text:'The only qualification she lacked was a first-aid course, which the company offered to pay for.', target:'qualification', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'qualification', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'qualification', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'qualification', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('experience', 'noun',
    'knowledge and skill gained from doing something for a period of time',
    ['knowledge gained by doing something', 'skill learned from practice over time'],
    ['a sudden feeling of fear or surprise', 'a plan for doing something in the future', 'an exam that tests a particular skill'],
    'The advertisement asked for two years of experience working with young children.',
    'skill learned from practice', 'The advertisement asked for two years of skill learned from practice working with young children.',
    'knowledge gained by doing something', 'Knowledge gained by doing something is often more useful to an employer than a long list of exam results.',
    {
      teacherNote:'Noun: knowledge and skill gained from doing a job or activity over a period of time (work experience, previous experience). In this sense it is uncountable. The other sense of experience, an event that happens to you (a memorable experience), is not taught here. Related forms (experienced, inexperienced) are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Her experience as a volunteer at the hospital helped her to answer the interviewer’s questions with confidence.', meaning:'knowledge and skill gained from doing something' },
        { text:'The company prefers candidates with at least a year of work experience in sales.', meaning:'skill gained over time in a job' }
      ],
      situationDistractors:[
        'A girl explained that she had spent two summers helping at a nursery and had learned how to look after young children.',
        'A man told the panel that he had worked as a waiter for five years and could deal with most customer problems.',
        'A student described how a month in a local newspaper office had taught her to meet deadlines.'
      ],
      retrievalContexts:[
        { id:'1', text:'Although she had no formal qualifications, her experience of running a small shop impressed the panel.', target:'experience', grammarPattern:'' },
        { id:'2', text:'Many young people find it hard to get a first job because they lack experience.', target:'experience', grammarPattern:'' },
        { id:'3', text:'The job requires at least one year of experience in customer service.', target:'experience', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'experience', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'experience', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'experience', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('confidence', 'noun',
    'the feeling that you can do something well, or that you can trust your own ability',
    ['feeling that you can do it well', 'trust in your own ability'],
    ['a fear that something will go wrong', 'a secret that you tell only a friend', 'a habit that you have practised for years'],
    'Regular practice gave her the confidence to answer the panel’s questions without notes.',
    'trust in her own ability', 'Regular practice gave her the trust in her own ability to answer the panel’s questions without notes.',
    'feeling that you can do it well', 'A strong feeling that you can do it well makes it easier to speak calmly during an interview.',
    {
      idKey:'confidence_7',
      teacherNote:'Unit 7 item (confidence_7), separate from the Unit 6 confidence item; it shares only the lexical spelling list. Sense in this unit: the feeling that you can do something well, especially when speaking to an interview panel (have confidence, lack confidence, confidence in yourself). Boundary: confidence is a healthy belief in your ability; it is not the same as arrogance, which is showing too much belief in yourself.',
      masteryContexts:[
        { text:'Smiling and speaking clearly can give a nervous candidate more confidence in the first minute of an interview.', meaning:'the feeling that you can do something well' },
        { text:'Her confidence in her own skills was clear from the way she explained her ideas to the panel.', meaning:'trust in your own ability' }
      ],
      situationDistractors:[
        'A boy stood up straight, looked at the panel and answered each question without hesitating.',
        'A girl told herself calmly that she had prepared well and knew the answers.',
        'A man walked into the room with a smile and shook everybody’s hand firmly.'
      ],
      retrievalContexts:[
        { id:'1', text:'Practising your answers aloud will help you to build confidence before the interview.', target:'confidence', grammarPattern:'' },
        { id:'2', text:'The candidate spoke clearly and with confidence, even when the question was unexpected.', target:'confidence', grammarPattern:'' },
        { id:'3', text:'After the successful interview, she felt a new confidence about applying for other jobs.', target:'confidence', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'confidence', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'confidence', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'confidence', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('anxious', 'adjective',
    'feeling worried or nervous about something that is going to happen',
    ['worried about what may happen', 'nervous and uneasy'],
    ['excited and eager to begin', 'bored and ready to leave', 'angry and unwilling to speak'],
    'Many people feel anxious before an important interview, even when they have prepared well.',
    'worried about what may happen', 'Many people feel worried about what may happen before an important interview, even when they have prepared well.',
    'nervous and uneasy', 'Candidates who feel nervous and uneasy should take a few deep breaths before they speak.',
    {
      idKey:'anxious_7',
      teacherNote:'Unit 7 item (anxious_7), separate from the Unit 4 anxious item; it shares only the lexical spelling list. Sense in this unit: feeling worried or nervous about something that is going to happen, such as an interview or a test (anxious about). Boundary: anxious is stronger than a little nervous; it describes a worry that can affect how you behave. The related noun anxiety is taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Daniel felt anxious as he waited outside the room, repeating his answers in his head.', meaning:'worried about what may happen' },
        { text:'The teacher told the anxious students that the test would only check what they had already learned.', meaning:'nervous and worried about a future event' }
      ],
      situationDistractors:[
        'A girl kept checking her watch and twisting her fingers as the clock moved towards her interview time.',
        'A boy could not sleep the night before his exam because he kept imagining what might go wrong.',
        'A woman asked three times whether her documents were in the right order before she went in.'
      ],
      retrievalContexts:[
        { id:'1', text:'She felt too anxious to eat breakfast on the morning of the interview.', target:'anxious', grammarPattern:'' },
        { id:'2', text:'Taking a deep breath before you speak can help you to feel less anxious during an interview.', target:'anxious', grammarPattern:'' },
        { id:'3', text:'The anxious candidate asked three times whether she had brought the right documents.', target:'anxious', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'anxious', wrong:['frozen', 'rectangular', 'wooden'] },
        { id:'2', answer:'anxious', wrong:['enormous', 'furious', 'distant'] },
        { id:'3', answer:'anxious', wrong:['bitter', 'crowded', 'careless'] }
      ]
    }),
  e('expertise', 'noun',
    'a high level of special knowledge or skill in a particular subject or activity',
    ['special knowledge in a subject', 'high level of skill in a field'],
    ['a general interest in many subjects', 'a short course that teaches basic skills', 'a feeling of pride in your own work'],
    'The company hired her because of her expertise in computer security.',
    'special knowledge in a subject', 'The company hired her because of her special knowledge in a subject, computer security.',
    'high level of skill in a field', 'People with a high level of skill in a field are often invited to advise new workers.',
    {
      teacherNote:'Noun: a high level of special knowledge or skill in a particular subject or activity (expertise in, technical expertise). It is uncountable and is usually followed by in. Boundary: expertise is deeper than experience; a person can have experience of a job without having expertise. It is spelled with -ise, not -ize.',
      masteryContexts:[
        { text:'The college invited an engineer with great expertise in renewable energy to talk to the class.', meaning:'a high level of special knowledge' },
        { text:'Because of her expertise in teaching languages, the school asked her to train the new staff.', meaning:'a high level of skill in a field' }
      ],
      situationDistractors:[
        'A doctor who had studied heart problems for twenty years was asked to advise the hospital on a difficult case.',
        'A woman who had designed bridges for many years explained the new plan to the committee.',
        'A man who had taught chemistry for a long time helped the new teacher to prepare her lessons.'
      ],
      retrievalContexts:[
        { id:'1', text:'The panel included people with expertise in law, finance and teaching.', target:'expertise', grammarPattern:'' },
        { id:'2', text:'The new software needs technical expertise that nobody in the office currently has.', target:'expertise', grammarPattern:'' },
        { id:'3', text:'Her expertise in marine biology made her the ideal person to lead the study.', target:'expertise', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'expertise', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'expertise', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'expertise', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('technique', 'noun',
    'a particular way of doing something that needs practice, such as speaking, playing or writing',
    ['skilled way of doing something', 'particular method learned with practice'],
    ['a machine that makes work easier', 'a mistake made when learning', 'a plan for a whole year of work'],
    'A simple breathing technique can help candidates to stay calm before they speak.',
    'skilled way of staying calm', 'A simple breathing skilled way of staying calm can help candidates to stay calm before they speak.',
    'particular method learned with practice', 'Learning a particular method learned with practice will help you to remember new words more easily.',
    {
      idKey:'technique_7',
      teacherNote:'Unit 7 item (technique_7), separate from the Unit 6 technique item; it shares only the lexical spelling list. Sense in this unit: a particular skilled way of doing something that improves with practice (a breathing technique, a technique for answering questions). Boundary: a technique is one specific method; a strategy is the overall plan (strategy is also a target in this unit).',
      masteryContexts:[
        { text:'The coach taught the students a technique for answering difficult questions in a calm way.', meaning:'a particular skilled way of doing something' },
        { text:'Her technique for remembering names was to repeat each one aloud three times.', meaning:'a method that is practised and used' }
      ],
      situationDistractors:[
        'A teacher showed the class how to count to four while breathing in and out to calm their nerves.',
        'A coach explained exactly how to hold the racket for a better serve.',
        'A writer used a special method of planning her paragraphs on index cards.'
      ],
      retrievalContexts:[
        { id:'1', text:'One useful technique for interviews is to pause before you answer.', target:'technique', grammarPattern:'' },
        { id:'2', text:'The drama teacher showed the class a technique for controlling nerves before going on stage.', target:'technique', grammarPattern:'' },
        { id:'3', text:'She improved quickly because she practised the swimming technique every morning.', target:'technique', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'technique', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'technique', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'technique', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('evaluate', 'verb',
    'to judge how good, useful or successful something is, after thinking about it carefully',
    ['judge how good something is', 'think carefully about the value of'],
    ['to describe something without giving a view', 'to repeat something in order to remember it', 'to ask for something to be changed'],
    'After each interview, the panel will evaluate every candidate against the same list of questions.',
    'judge how well they did against', 'After each interview, the panel will judge how well they did against every candidate against the same list of questions.',
    'think carefully about the value of', 'Before choosing a course, students should think carefully about the value of each option.',
    {
      idKey:'evaluate_7',
      teacherNote:'Unit 7 item (evaluate_7), separate from the Unit 3, Unit 5 and Unit 6 evaluate items; it shares only the lexical spelling list. Sense in this unit: to judge how good, useful or successful someone or something is after careful thought, for example when a panel assesses candidates. Boundary: evaluate is about judging quality using clear points; it is not the same as describe, which gives information without a judgement.',
      masteryContexts:[
        { text:'The teacher asked the students to evaluate their own performance in the mock interview.', meaning:'to judge how good something is' },
        { text:'The panel will evaluate each candidate on communication, teamwork and knowledge of the company.', meaning:'to judge how well someone has done' }
      ],
      situationDistractors:[
        'A teacher read the speaking tests and gave each student marks for clarity, accuracy and confidence.',
        'A manager compared three candidates against the list of skills and decided who had done best.',
        'A student watched a recording of her practice interview and wrote down what had gone well and what had not.'
      ],
      retrievalContexts:[
        { id:'1', text:'After the practice session, the students had to evaluate how well they had answered the questions.', target:'evaluate', grammarPattern:'' },
        { id:'2', text:'The panel used a score sheet to evaluate every candidate fairly and in the same way.', target:'evaluate', grammarPattern:'' },
        { id:'3', text:'It is important to evaluate your own strengths and weaknesses before you apply for a course.', target:'evaluate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'evaluate', wrong:['announce', 'invent', 'advertise'] },
        { id:'2', answer:'evaluate', wrong:['decorate', 'translate', 'borrow'] },
        { id:'3', answer:'evaluate', wrong:['postpone', 'photograph', 'celebrate'] }
      ]
    }),
  e('organise', 'verb',
    'to arrange things in a sensible order, or to plan and prepare an event or activity',
    ['arrange in a sensible order', 'plan and prepare carefully'],
    ['to remove something that is no longer needed', 'to make something larger than before', 'to guess something without any evidence'],
    'Good candidates organise their ideas before they begin to speak.',
    'arrange in a sensible order', 'Good candidates arrange in a sensible order their ideas before they begin to speak.',
    'plan and prepare carefully', 'The students will plan and prepare carefully a mock interview day for the younger classes.',
    {
      teacherNote:'Verb: to arrange things in a sensible order, or to plan and prepare an event (organise your ideas, organise a meeting). British spelling: organise, with -ise. Boundary: organise is about putting things in order or planning them; it is not the same as order, which can mean to give a command. Related forms (organisation, organised, organiser) are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Before the interview, Hana tried to organise her answers into three clear points.', meaning:'to arrange things in a sensible order' },
        { text:'The students decided to organise a careers evening for parents and local employers.', meaning:'to plan and prepare an event' }
      ],
      situationDistractors:[
        'A girl wrote the three main points of her talk on a card and put them in order.',
        'A group of students booked a room, sent invitations and printed a programme for a school fair.',
        'A boy sorted his notes into folders, one for each subject.'
      ],
      retrievalContexts:[
        { id:'1', text:'It helps to organise your CV under clear headings, so that the reader can find the information quickly.', target:'organise', grammarPattern:'' },
        { id:'2', text:'The school agreed to organise a visit to the local factory for the Year 10 students.', target:'organise', grammarPattern:'' },
        { id:'3', text:'Candidates who organise their answers before speaking usually sound more confident.', target:'organise', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'organise', wrong:['borrow', 'repair', 'forget'] },
        { id:'2', answer:'organise', wrong:['invent', 'decorate', 'translate'] },
        { id:'3', answer:'organise', wrong:['postpone', 'photograph', 'celebrate'] }
      ]
    }),
  e('distribute', 'verb',
    'to give out something to a number of people or places, or to share it among them',
    ['give out to several people', 'share among a group'],
    ['to collect from a number of people', 'to keep for yourself', 'to destroy after use'],
    'The interviewer will distribute a short form to every candidate at the start of the meeting.',
    'give out', 'The interviewer will give out a short form to every candidate at the start of the meeting.',
    'share among a group', 'The manager decided to share among a group of five workers the extra jobs that had arrived that morning.',
    {
      teacherNote:'Verb: to give out something to a number of people or places, or to share it among them (distribute leaflets, distribute the work). It often takes among or to. Boundary: distribute means to give out to many; collect means to take in. The business sense (to supply goods to shops) is related but is not the focus here. Related forms (distribution, distributor) are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The teacher asked two students to distribute the worksheets before the lesson began.', meaning:'to give out to several people' },
        { text:'The charity aims to distribute food parcels to families in the nearby villages.', meaning:'to deliver to a number of places' }
      ],
      situationDistractors:[
        'A girl handed one leaflet to each person who entered the hall.',
        'A manager shared the extra tasks out equally among the five workers.',
        'A volunteer delivered food parcels to families in three villages.'
      ],
      retrievalContexts:[
        { id:'1', text:'The students will distribute the programmes to the guests as they arrive at the careers evening.', target:'distribute', grammarPattern:'' },
        { id:'2', text:'It is the manager’s job to distribute the work fairly so that nobody has too much to do.', target:'distribute', grammarPattern:'' },
        { id:'3', text:'A group of volunteers helped to distribute leaflets about the new youth club.', target:'distribute', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'distribute', wrong:['collect', 'borrow', 'repair'] },
        { id:'2', answer:'distribute', wrong:['forget', 'invent', 'decorate'] },
        { id:'3', answer:'distribute', wrong:['postpone', 'photograph', 'celebrate'] }
      ]
    }),
  e('allocate', 'verb',
    'to give a share of money, time or other resources to a person or purpose',
    ['give a share of something to', 'set aside for a particular purpose'],
    ['to take away a share from', 'to ask for repayment of', 'to count the total of'],
    'The manager will allocate each new member of staff a desk and a computer.',
    'give a share of the space to', 'The manager will give a share of the space to each new member of staff, a desk and a computer.',
    'set aside for a particular purpose', 'The school decided to set aside for a particular purpose a small amount of money each year for new books.',
    {
      teacherNote:'Verb: to give a share of money, time, space or other resources to a person or purpose (allocate money to, allocate time for). Boundary: allocate means an official decision to give a share for a purpose; give is the general word. It is spelled with double l, one c.',
      masteryContexts:[
        { text:'The head teacher decided to allocate two hours each week for students to practise interview skills.', meaning:'to set aside a share for a purpose' },
        { text:'The company will allocate each applicant a time for the interview, so nobody has to wait for long.', meaning:'to give a share to each person' }
      ],
      situationDistractors:[
        'A teacher gave each group a set number of minutes to present its project.',
        'A manager set aside part of the budget for training new staff.',
        'A school reserved one classroom every Friday for the debating club.'
      ],
      retrievalContexts:[
        { id:'1', text:'The council decided to allocate extra money to the youth centre this year.', target:'allocate', grammarPattern:'' },
        { id:'2', text:'It is hard to allocate enough time to revision when you also have a part-time job.', target:'allocate', grammarPattern:'' },
        { id:'3', text:'The organiser will allocate each speaker ten minutes, so the programme finishes on time.', target:'allocate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'allocate', wrong:['borrow', 'repair', 'forget'] },
        { id:'2', answer:'allocate', wrong:['invent', 'decorate', 'translate'] },
        { id:'3', answer:'allocate', wrong:['postpone', 'photograph', 'celebrate'] }
      ]
    }),
  e('responsible', 'adjective',
    'having a duty to do something or take care of it, and able to be trusted to do it well',
    ['having a duty to take care of something', 'sensible and able to be trusted'],
    ['wishing to avoid any kind of work', 'able to run faster than other people', 'easy to find in a large building'],
    'The interviewer asked which tasks she had been responsible for in her last job.',
    'in charge of', 'The interviewer asked which tasks she had been in charge of in her last job.',
    'sensible and able to be trusted', 'Employers like to hire someone sensible and able to be trusted, especially if the job involves looking after money.',
    {
      teacherNote:'Adjective: having a duty to do or look after something (responsible for), and also sensible and trustworthy (a responsible person). It is often followed by for. Boundary: responsible for means that something is your duty or you caused it; it is different from respond, which is a separate target in this unit. Related forms (responsibility, responsibly, irresponsible) are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'In her last job, Rania was responsible for training all the new staff.', meaning:'having the duty to look after something' },
        { text:'The manager looked for a responsible person who could be trusted to lock the building at night.', meaning:'sensible and able to be trusted' }
      ],
      situationDistractors:[
        'A girl was given the keys to the shop and told that she must lock it every evening.',
        'A boy always brought the equipment back and never forgot to switch off the lights.',
        'A woman said that she was in charge of the budget for the whole department.'
      ],
      retrievalContexts:[
        { id:'1', text:'Candidates should be ready to describe a time when they were responsible for a difficult task.', target:'responsible', grammarPattern:'' },
        { id:'2', text:'Parents want a responsible person to look after their children at the summer camp.', target:'responsible', grammarPattern:'' },
        { id:'3', text:'The team leader is responsible for checking that every member understands the plan.', target:'responsible', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'responsible', wrong:['frozen', 'rectangular', 'wooden'] },
        { id:'2', answer:'responsible', wrong:['enormous', 'furious', 'distant'] },
        { id:'3', answer:'responsible', wrong:['bitter', 'crowded', 'careless'] }
      ]
    }),
  e('editor', 'noun',
    'a person whose job is to check and correct written work before it is published or finished',
    ['person who corrects writing before it appears', 'person in charge of what a newspaper prints'],
    ['a person who writes the first draft of a book', 'a person who prints and sells newspapers', 'a person who reads aloud for an audience'],
    'The editor suggested cutting the first paragraph because it repeated the same idea.',
    'person who corrects writing before it appears', 'The person who corrects writing before it appears suggested cutting the first paragraph because it repeated the same idea.',
    'person in charge of what a newspaper prints', 'A person in charge of what a newspaper prints must decide which stories deserve the front page.',
    {
      teacherNote:'Noun: a person whose job is to check, correct and improve written work before it is published, or who is in charge of a newspaper or magazine (the editor of the school magazine). Boundary: the editor improves another person’s writing; the writer creates it. The computer sense (a text editor) is not taught here.',
      masteryContexts:[
        { text:'The editor of the school newspaper corrected the spelling and shortened the longest article.', meaning:'a person who checks and improves writing' },
        { text:'As editor of the student magazine, Liam decided which stories would appear on the front page.', meaning:'a person in charge of what is published' }
      ],
      situationDistractors:[
        'A woman read through a young writer’s article and changed several sentences to make them clearer.',
        'A student chose which stories would be printed in the school magazine and which would be left out.',
        'A man checked each article for mistakes before the newspaper was sent to the printer.'
      ],
      retrievalContexts:[
        { id:'1', text:'The editor asked the writer to shorten the article and to add a clearer ending.', target:'editor', grammarPattern:'' },
        { id:'2', text:'Applying for the post of editor on the school magazine was a good way to show leadership.', target:'editor', grammarPattern:'' },
        { id:'3', text:'A good editor reads every sentence carefully and corrects mistakes that the writer has missed.', target:'editor', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'editor', wrong:['passenger', 'harbour', 'ticket'] },
        { id:'2', answer:'editor', wrong:['recipe', 'museum', 'umbrella'] },
        { id:'3', answer:'editor', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('proofread', 'verb',
    'to read a piece of writing carefully in order to find and correct mistakes before it is finished',
    ['read carefully to find mistakes', 'check writing for errors'],
    ['to read aloud to a group of listeners', 'to write a long text without any planning', 'to translate a text into another language'],
    'Always proofread your CV and cover letter, because a single spelling mistake can make a bad impression.',
    'check for mistakes', 'Always check for mistakes in your CV and cover letter, because a single spelling mistake can make a bad impression.',
    'read carefully to find mistakes', 'It is wise to read carefully to find mistakes in your email before you send it to a possible employer.',
    {
      teacherNote:'Verb: to read a piece of writing carefully to find and correct mistakes in spelling, grammar and punctuation before it is finished or sent. It is one word. The past tense is spelled the same way (proofread). Boundary: proofreading corrects small errors; editing may change the content or structure.',
      masteryContexts:[
        { text:'Before you send the application, proofread it twice, because a careless mistake could cost you the interview.', meaning:'to read carefully and correct errors' },
        { text:'Amir asked his sister to proofread his personal statement and to circle every mistake in grammar.', meaning:'to check writing for small mistakes' }
      ],
      situationDistractors:[
        'A girl read her essay slowly from the end to the beginning and corrected two spelling mistakes.',
        'A boy asked a friend to look through his cover letter and mark any wrong punctuation.',
        'A teacher read through the questions before the test and found a missing word.'
      ],
      retrievalContexts:[
        { id:'1', text:'It is important to proofread every email before you send it to a potential employer.', target:'proofread', grammarPattern:'' },
        { id:'2', text:'The examiner reminded the class that there would be five minutes at the end to proofread their answers.', target:'proofread', grammarPattern:'' },
        { id:'3', text:'You should proofread your work slowly and, if possible, read it aloud to hear mistakes.', target:'proofread', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'proofread', wrong:['borrow', 'repair', 'forget'] },
        { id:'2', answer:'proofread', wrong:['invent', 'decorate', 'translate'] },
        { id:'3', answer:'proofread', wrong:['postpone', 'photograph', 'celebrate'] }
      ]
    }),
  e('layout', 'noun',
    'the way in which text, pictures and other items are arranged on a page or screen',
    ['arrangement of items on a page', 'way a page is organised visually'],
    ['the main idea of a piece of writing', 'the total number of pages in a book', 'a list of the people who have read a text'],
    'A clear layout with headings and short paragraphs makes a CV easier to read.',
    'arrangement of items on a page', 'A clear arrangement of items on a page with headings and short paragraphs makes a CV easier to read.',
    'way a page is organised visually', 'The way a page is organised visually can affect how long people continue to read it.',
    {
      teacherNote:'Noun: the way in which text, pictures and other items are arranged on a page or screen (the layout of a CV, a clear layout). It is written as one word. Boundary: layout is about where things are placed on the page; format (also a target in this unit) is the wider way something is organised or presented. It also describes the plan of a room or a building.',
      masteryContexts:[
        { text:'The designer changed the layout of the poster so that the date was easier to see.', meaning:'the way items are arranged on a page' },
        { text:'A simple layout with plenty of white space makes a CV look neat and professional.', meaning:'an arrangement of text and images on a page' }
      ],
      situationDistractors:[
        'A student moved the headings and the photograph on her poster so that the page looked tidier.',
        'A designer put the title at the top, the picture in the middle and the contact details at the bottom.',
        'A boy changed the margins and spacing on his CV so that it fitted on one page.'
      ],
      retrievalContexts:[
        { id:'1', text:'The employer admired the neat layout of her application, with clear headings and plenty of space.', target:'layout', grammarPattern:'' },
        { id:'2', text:'Before you print the poster, check that the layout is clear and that the text is not too small.', target:'layout', grammarPattern:'' },
        { id:'3', text:'The magazine changed its layout, so the articles are now shorter and the pictures much bigger.', target:'layout', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'layout', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'layout', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'layout', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    }),
  e('visual', 'adjective',
    'connected with seeing, or using pictures, images and other things that can be seen',
    ['connected with seeing', 'using pictures and images'],
    ['connected with hearing', 'connected with writing', 'connected with touching'],
    'A strong visual image, such as a clear diagram, can help the audience remember your main point.',
    'picture-based', 'A strong picture-based image, such as a clear diagram, can help the audience remember your main point.',
    'using pictures and images', 'Presentations using pictures and images are often easier to follow than long pages of text.',
    {
      teacherNote:'Adjective: connected with seeing, or using pictures, diagrams and other things that can be seen (a visual aid, visual information). Boundary: visual is about what can be seen; it is not the same as visible, which means able to be seen. Related forms (visually, visualise) are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The teacher used a visual timeline to help the students understand the order of events.', meaning:'using images that can be seen' },
        { text:'Many people are visual learners and remember information better when they see it in a picture.', meaning:'connected with seeing' }
      ],
      situationDistractors:[
        'A student used a colourful chart and two photographs to explain her project.',
        'A teacher drew a diagram on the board to show how the parts of the machine fitted together.',
        'A speaker showed a short film instead of reading a long text.'
      ],
      retrievalContexts:[
        { id:'1', text:'A clear visual aid, such as a chart, can make a presentation much easier to follow.', target:'visual', grammarPattern:'' },
        { id:'2', text:'The examiner reminded the students that visual information in the graph must be described accurately.', target:'visual', grammarPattern:'' },
        { id:'3', text:'Her notes were mainly visual, with diagrams and coloured arrows instead of long sentences.', target:'visual', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'visual', wrong:['frozen', 'rectangular', 'wooden'] },
        { id:'2', answer:'visual', wrong:['enormous', 'furious', 'distant'] },
        { id:'3', answer:'visual', wrong:['bitter', 'crowded', 'careless'] }
      ]
    }),
  e('criteria', 'noun',
    'the standards or points that are used to judge or decide something, such as which candidate to choose',
    ['standards used for judging', 'points used to decide'],
    ['the names of the people who take part', 'the prizes that are given to winners', 'the questions that are asked at the end'],
    'The interview panel explained that the criteria for the post included communication skills and teamwork.',
    'standards used for judging', 'The interview panel explained that the standards used for judging the post included communication skills and teamwork.',
    'points used to decide', 'Before reading the applications, the panel agreed on the points used to decide who would be invited back.',
    {
      idKey:'criteria_7',
      teacherNote:'Unit 7 item (criteria_7), separate from the Unit 1 criteria item; it shares only the lexical spelling list. Sense in this unit: the standards or points used to judge candidates or work. Criteria is plural and takes a plural verb (the criteria are); the singular criterion is not taught here. Boundary: criteria are what you measure against, so candidates are judged by them, not the other way round.',
      masteryContexts:[
        { text:'The panel used five criteria to decide which candidate should receive the scholarship.', meaning:'the standards used to judge something' },
        { text:'Before the task, the teacher gave the class the assessment criteria so they knew exactly how to earn high marks.', meaning:'the points used to decide marks' }
      ],
      situationDistractors:[
        'A teacher handed out a sheet that listed what the examiners would look for in a good speech.',
        'A panel agreed that each candidate would be judged on skills, experience and attitude.',
        'A judge told the contestants exactly how the winner would be chosen.'
      ],
      retrievalContexts:[
        { id:'1', text:'The criteria for the scholarship are published on the college website so that every applicant can read them.', target:'criteria', grammarPattern:'' },
        { id:'2', text:'To meet the criteria for the course, you need a good grade in English and a short personal statement.', target:'criteria', grammarPattern:'' },
        { id:'3', text:'The judges explained that all the entries would be marked against the same criteria.', target:'criteria', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'criteria', wrong:['recipes', 'harbours', 'tickets'] },
        { id:'2', answer:'criteria', wrong:['neighbours', 'umbrellas', 'museums'] },
        { id:'3', answer:'criteria', wrong:['souvenirs', 'carpets', 'staircases'] }
      ]
    }),
  e('accurate', 'adjective',
    'correct and exact, without any mistakes',
    ['correct and exact', 'free from mistakes'],
    ['written in a very neat style', 'quick to produce but not checked', 'long and full of extra detail'],
    'Employers prefer applicants who give accurate information on their application forms.',
    'correct and exact', 'Employers prefer applicants who give correct and exact information on their application forms.',
    'free from mistakes', 'Please make sure that your notes are free from mistakes before you give them to the new students.',
    {
      teacherNote:'Adjective: correct and exact, with no mistakes (accurate information, an accurate description). Boundary: accurate is about being correct and exact; it is not the same as honest, because a person can be honest but make a mistake. In writing it describes facts, numbers and spelling. Related forms (accuracy, accurately, inaccurate) are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The examiner praised her accurate description of the graph, which included every figure correctly.', meaning:'correct and exact' },
        { text:'It is important to give accurate dates and names when you fill in an application form.', meaning:'free from mistakes' }
      ],
      situationDistractors:[
        'A girl checked every date and name on her form twice and found them all correct.',
        'A boy measured the table carefully and wrote down the exact length.',
        'A reporter checked each fact with two different sources before the story was printed.'
      ],
      retrievalContexts:[
        { id:'1', text:'The report must be accurate, so please check every figure before you send it.', target:'accurate', grammarPattern:'' },
        { id:'2', text:'The examiner looked for accurate spelling and correct use of grammar in the writing task.', target:'accurate', grammarPattern:'' },
        { id:'3', text:'A good interviewee gives accurate answers and admits when she does not know something.', target:'accurate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'accurate', wrong:['frozen', 'rectangular', 'wooden'] },
        { id:'2', answer:'accurate', wrong:['enormous', 'furious', 'distant'] },
        { id:'3', answer:'accurate', wrong:['bitter', 'crowded', 'careless'] }
      ]
    }),
  e('punctuation', 'noun',
    'the marks, such as full stops, commas and question marks, that are used in writing to make the meaning clear',
    ['marks that make writing clear', 'full stops, commas and similar signs'],
    ['the correct spelling of difficult words', 'the neat shape of handwritten letters', 'the order in which paragraphs are arranged'],
    'The examiner deducted marks because the punctuation in the letter was often wrong.',
    'marks that make writing clear', 'The examiner deducted marks because the marks that make writing clear in the letter were often wrong.',
    'full stops, commas and similar signs', 'Many students lose marks in the writing test because they forget the full stops, commas and similar signs.',
    {
      teacherNote:'Noun: the marks, such as full stops, commas, question marks and apostrophes, used in writing to make the meaning clear. It is uncountable. Boundary: punctuation is about the marks between words and sentences; spelling is about the letters inside words. The verb punctuate is not taught here.',
      masteryContexts:[
        { text:'Careful punctuation can change the meaning of a sentence completely, so check it before you send an application.', meaning:'the marks used to make writing clear' },
        { text:'The teacher circled the mistakes in grammar and punctuation and asked the students to correct them.', meaning:'full stops, commas and similar marks' }
      ],
      situationDistractors:[
        'A student read his letter aloud and added commas wherever he paused for a breath.',
        'A girl added a question mark at the end of her last sentence and checked the apostrophes.',
        'A teacher circled the missing full stops in a student’s essay.'
      ],
      retrievalContexts:[
        { id:'1', text:'Good punctuation helps the reader to see where one idea ends and the next begins.', target:'punctuation', grammarPattern:'' },
        { id:'2', text:'The employer noticed the poor punctuation in her letter and wondered whether she had checked it.', target:'punctuation', grammarPattern:'' },
        { id:'3', text:'Remember to check your spelling and punctuation when you proofread the final copy.', target:'punctuation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'punctuation', wrong:['recipe', 'harbour', 'ticket'] },
        { id:'2', answer:'punctuation', wrong:['neighbour', 'umbrella', 'museum'] },
        { id:'3', answer:'punctuation', wrong:['souvenir', 'carpet', 'staircase'] }
      ]
    })
];

// Authored Word Families (unit-07-word-families.js): per-form facts feed Mastery; the plain family list is the non-headword forms of the SAME
// family. A rejected headword keeps NO family list, so Recognise/Match never offer unauthorised members.
function familyFields(entry) {
  const family = unit7WordFamilies[entry.term];
  if (!family) return unit7WordFamilyRejected[entry.term] ? { wordFamily:[] } : {};
  const lower = value => String(value).toLocaleLowerCase('en');
  return {
    wordFamilyForms:family.forms.map(row => ({ form:row.form, partOfSpeech:row.partOfSpeech, example:row.example, pedagogicallyUseful:true, ...(unit7WordFamilyAlternates[entry.term]?.[row.form] ? { altExample:unit7WordFamilyAlternates[entry.term][row.form] } : {}) })),
    wordFamily:family.forms.map(row => row.form).filter(form => lower(form) !== lower(entry.term))
  };
}

// Authored Meaning Mastery wrong meanings are applied by position to the word's two mastery contexts, as in Units 1–6.
const enrichedEntries = entries.map(entry => {
  const authoredMastery = unit7MeaningMastery[entry.term];
  const masteryContexts = authoredMastery
    ? (entry.masteryContexts ?? []).map((record, index) => {
        const authored = authoredMastery[index] ?? {};
        return { text:authored.text ?? record.text, meaning:authored.meaning ?? record.meaning, ...(Array.isArray(authored.wrongMeanings) ? { wrongMeanings:authored.wrongMeanings } : {}) };
      })
    : entry.masteryContexts;
  return {
    ...entry,
    ...(masteryContexts ? { masteryContexts } : {}),
    ...(unit7SituationExtras[entry.term] ? { situationDistractors:[...(entry.situationDistractors ?? []), ...unit7SituationExtras[entry.term]] } : {}),
    ...(unit7Collocations[entry.term] ? { collocations:unit7Collocations[entry.term] } : {}),
    ...(unit7MeaningMatch[entry.term] ? { wrongParaphrases:unit7MeaningMatch[entry.term] } : {}),
    ...(unit7ContextPassages[entry.term] ? { masteryPassages:unit7ContextPassages[entry.term] } : {}),
    ...familyFields(entry)
  };
});

export default buildCuratedUnit({
  unitNumber:UNIT_NUMBER,
  unitTitle:'Interviews',
  status,
  source:'0511 key vocabulary unit 7: Interviews',
  entries:enrichedEntries,
  activities:[...unit7Activities, ...unit7PrecisionUse, ...unit7WordFamilyItems],
  lexicalSpelling:{
    ...LEXICAL_SPELLING_ERRORS,
    vocab_criteria_7:LEXICAL_SPELLING_ERRORS.vocab_criteria,
    vocab_availability_7:LEXICAL_SPELLING_ERRORS.vocab_availability,
    vocab_relevant_7:LEXICAL_SPELLING_ERRORS.vocab_relevant,
    vocab_evaluate_7:LEXICAL_SPELLING_ERRORS.vocab_evaluate,
    vocab_anxious_7:LEXICAL_SPELLING_ERRORS.vocab_anxious,
    vocab_qualification_7:LEXICAL_SPELLING_ERRORS.vocab_qualification,
    vocab_strategy_7:LEXICAL_SPELLING_ERRORS.vocab_strategy,
    vocab_respond_7:LEXICAL_SPELLING_ERRORS.vocab_respond,
    vocab_confidence_7:LEXICAL_SPELLING_ERRORS.vocab_confidence,
    vocab_technique_7:LEXICAL_SPELLING_ERRORS.vocab_technique
  }
});
