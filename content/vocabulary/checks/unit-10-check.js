// Unit 10: Education formal check. Same contract as Units 4, 6, 7, 8 and 9: three forms of ten (six passage gaps, two paraphrase, one word-form, one precision).
// Thirty different Unit 10 targets, ten per form. All passages and sentences are new: none comes from a pathway activity.
const mcq = (id, target, type, prompt, choices, answer, diagnostic, explanation) => ({ id, target, type, prompt, choices, answer, diagnostic, explanation });
const typed = (id, target, prompt, answer, diagnostic, explanation) => ({ id, target, type:'word_form', prompt, answer, diagnostic, explanation });

const formA = {
  id:'A',
  title:'Life after school: a former student’s advice',
  passage:`Every year, our school invites former students to talk about life after their final exams. This year, Leila explained that she had decided to continue studying in [[1]] instead of starting work straight away. She is now in her second year at a [[2]] in Edinburgh, where she is training to be an architect.\n\nLeila admitted that a degree is not the only route. Her cousin left school at eighteen, completed a two-year [[3]] in plumbing and now runs his own business. “Think about the [[4]] you want in ten years,” she told us, “not just your next job.”\n\nShe pointed out that the local [[5]] rate for young people with practical skills is very high. She also urged us to consider [[6]] courses: she spent a term in Canada and says it changed the way she sees the world.`,
  questions:[
    mcq('A1','u10_02_higher_education','passage_mcq','Which word or phrase best completes gap 1?',['recreation','industry','higher education','literacy'],'higher education','Leila is still studying after school instead of starting a job.','Higher education is study at a university or college after leaving secondary school.'),
    mcq('A2','u10_03_university','passage_mcq','Which word best completes gap 2?',['university','career','subject','condition'],'university','She is in her second year of a degree course in Edinburgh.','A university is an institution where students study for degrees.'),
    mcq('A3','u10_48_qualification_10','passage_mcq','Which word best completes gap 3?',['preference','discussion','assignment','qualification'],'qualification','After two years of training, the cousin has an official certificate in plumbing.','A qualification is an official record, such as a certificate, showing that you have completed a course or passed exams.'),
    mcq('A4','u10_19_career','passage_mcq','Which word best completes gap 4?',['subject','assignment','presentation','career'],'career','Leila is talking about long-term working life, not one job.','A career is the series of jobs a person does in one type of work over a long time.'),
    mcq('A5','u10_18_employment_10','passage_mcq','Which word best completes gap 5?',['recreation','employment','examination','performance'],'employment','Young people with practical skills easily find paid work.','Employment is the situation of having a paid job.'),
    mcq('A6','u10_24_overseas','passage_mcq','Which word best completes gap 6?',['overseas','reluctant','lonely','accurate'],'overseas','She studied in another country for a term.','Overseas means in or connected with a foreign country, especially one across the sea.'),
    mcq('A7','u10_25_reluctant','paraphrase_mcq','At first, Sam was unwilling to join the debating society because he disliked speaking in public. Which word best replaces unwilling?',['academic','overseas','reluctant','cosmopolitan'],'reluctant','Look for an adjective that describes not wanting to do something.','Reluctant means not wanting to do something and therefore slow to do it.'),
    mcq('A8','u10_29_opportunity','paraphrase_mcq','The summer job at the museum is a great chance to learn how exhibitions are planned. Which word best replaces chance?',['condition','opportunity','challenge','preference'],'opportunity','Think about a noun for a situation that makes something possible.','An opportunity is a time or situation when it is possible to do something you want to do.'),
    typed('A9','u10_41_confidence_10','Complete the sentence using the correct form of confidence: “After weeks of practice, Maya felt ______ that she would pass her driving test.”','confident','You need an adjective after “felt”.','Confidence is the noun; confident is the adjective for someone who feels sure they can do something well.'),
    mcq('A10','u10_40_succeed','precision_mcq','Which sentence is most natural?',['She succeeded to pass the test.','She succeeded at pass the test.','She succeeded for passing the test.','She succeeded in passing the test.'],'She succeeded in passing the test.','Think about the preposition and verb form that follow this verb.','Succeed is followed by in + an -ing form, as in She succeeded in passing the test.')
  ]
};

const formB = {
  id:'B',
  title:'Getting ready for the speaking test',
  passage:`Next month, every Year 11 student will take the speaking part of the final [[1]]. Our teacher says that good [[2]] matters more than talent, so we have started practising three times a week after school.\n\nFirst, each of us must give a short [[3]] about a topic we care about, using notes but no slides. The examiner will check that our [[4]] is clear, so words like “comfortable” and “vegetable” need extra attention. We also practise [[5]], letting our voices rise for questions and fall at the end of statements.\n\nFinally, the examiner gives marks for range, so we are learning new [[6]] for describing opinions, causes and results. Last year’s students told us that the hard work really paid off, and most of them were delighted with their grades in the summer.`,
  questions:[
    mcq('B1','u10_30_examination','passage_mcq','Which word best completes gap 1?',['opinion','examination','industry','research'],'examination','Students take a formal test with a speaking part.','An examination is a formal test of a student’s knowledge or ability.'),
    mcq('B2','u10_17_preparation','passage_mcq','Which word best completes gap 2?',['literacy','industry','condition','preparation'],'preparation','The students practise several times a week to get ready.','Preparation is the work or planning done to get ready for something.'),
    mcq('B3','u10_31_presentation','passage_mcq','Which word best completes gap 3?',['presentation','qualification','opportunity','assignment'],'presentation','Each student speaks to the examiner about a topic, using notes.','A presentation is a talk in which someone explains a subject to an audience.'),
    mcq('B4','u10_32_pronunciation','passage_mcq','Which word best completes gap 4?',['literacy','performance','pronunciation','assessment'],'pronunciation','Words like comfortable are often said wrongly.','Pronunciation is the way in which a word or language is spoken.'),
    mcq('B5','u10_33_intonation','passage_mcq','Which word best completes gap 5?',['recreation','assessment','intonation','employment'],'intonation','The voice goes up for questions and down for statements.','Intonation is the rise and fall of the voice when speaking.'),
    mcq('B6','u10_34_vocabulary','passage_mcq','Which word best completes gap 6?',['vocabulary','literacy','research','industry'],'vocabulary','Range means using many different words.','Vocabulary is all the words that a person knows or uses.'),
    mcq('B7','u10_35_accurately','paraphrase_mcq','In the lab report, you must record each measurement without any mistakes. Which word best replaces without any mistakes?',['reluctantly','loudly','overseas','accurately'],'accurately','Look for an adverb meaning correctly and exactly.','Accurately means in a way that is correct and exact, without mistakes.'),
    mcq('B8','u10_11_encourage','paraphrase_mcq','Good coaches support players to try new skills, even when they might fail. Which word best replaces support?',['evaluate','encourage','reflect','succeed'],'encourage','Look for a verb that fits the pattern verb + person + to do something.','Encourage means to give someone support or confidence so that they do something.'),
    typed('B9','u10_07_assessment','Complete the sentence using the correct form of assessment: “Two examiners will ______ each student’s speaking test independently.”','assess','You need a verb after “will”.','Assessment is the noun; assess is the verb meaning to judge how good or successful something is.'),
    mcq('B10','u10_39_discussion','precision_mcq','Which phrase is most natural?',['have a discussion about the plan','make a discussion about the plan','do a discussion about the plan','take a discussion about the plan'],'have a discussion about the plan','Think about which verb normally goes with this noun.','We have a discussion about something; discussion does not usually go with make, do or take.')
  ]
};

const formC = {
  id:'C',
  title:'Schools around the world',
  passage:`Around the world, millions of children still cannot go to school. A recent report argues that access to [[1]] is the most powerful way to reduce poverty, because adults who stayed at school longer usually earn far more.\n\nIn some regions, adult [[2]] has doubled in twenty years, thanks to evening classes and cheap books. However, wars and natural disasters can quickly turn into a serious [[3]], forcing schools to close and families to flee their homes.\n\nTechnology may help. In one project, every pupil receives a solar-powered [[4]], such as a tablet, loaded with lessons and games. Teachers say the children are making rapid [[5]] in maths and reading. Local [[6]] is also supporting the scheme: two technology companies donated the equipment and trained the teachers.`,
  questions:[
    mcq('C1','u10_01_education','passage_mcq','Which word best completes gap 1?',['recreation','research','industry','education'],'education','Staying at school longer helps people earn more.','Education is the process of teaching and learning, especially at school, college or university.'),
    mcq('C2','u10_06_literacy','passage_mcq','Which word best completes gap 2?',['intonation','literacy','performance','recreation'],'literacy','Evening classes and cheap books help adults learn to read.','Literacy is the ability to read and write.'),
    mcq('C3','u10_08_international_crisis','passage_mcq','Which phrase best completes gap 3?',['digital device','international crisis','opportunity','achievement'],'international crisis','Wars and disasters create dangerous emergencies affecting many countries.','An international crisis is a serious and dangerous situation that affects many countries.'),
    mcq('C4','u10_09_digital_device','passage_mcq','Which phrase best completes gap 4?',['digital device','qualification','opportunity','assignment'],'digital device','A tablet is an example of this.','A digital device is a piece of electronic equipment such as a phone, tablet or laptop.'),
    mcq('C5','u10_10_progress','passage_mcq','Which word best completes gap 5?',['opinion','preference','progress','discussion'],'progress','The children are getting better quickly.','Progress is movement towards achieving something or improving.'),
    mcq('C6','u10_22_industry','passage_mcq','Which word best completes gap 6?',['literacy','research','recreation','industry'],'industry','Companies are giving money and equipment.','Industry means the businesses that produce goods or provide services, often in one area.'),
    mcq('C7','u10_26_cosmopolitan','paraphrase_mcq','The capital is a truly multicultural city, with restaurants, festivals and newspapers from dozens of countries. Which word best replaces multicultural?',['cosmopolitan','reluctant','academic','overseas'],'cosmopolitan','Look for an adjective describing a place full of people and ideas from many cultures.','Cosmopolitan means having people, ideas or influences from many different countries and cultures.'),
    mcq('C8','u10_44_evaluate_10','paraphrase_mcq','Before you quote a website in your project, judge how reliable it is. Which word best replaces judge?',['encourage','succeed','evaluate','contribute'],'evaluate','Look for a verb about deciding how good or trustworthy something is.','Evaluate means to judge how good, useful or successful something is after thinking about it carefully.'),
    typed('C9','u10_47_achievement_10','Complete the sentence using the correct form of achievement: “With careful planning, most students can ______ the grades they need.”','achieve','You need a verb after “can”.','Achievement is the noun; achieve is the verb meaning to succeed in getting something through effort.'),
    mcq('C10','u10_38_opinion','precision_mcq','Which sentence is most natural?',['On my opinion, the plan is fair.','In my opinion, the plan is fair.','At my opinion, the plan is fair.','By my opinion, the plan is fair.'],'In my opinion, the plan is fair.','Think about the preposition used in this fixed phrase.','The fixed phrase is in my opinion; opinion does not follow on, at or by in this phrase.')
  ]
};

export const unit10VocabularyCheck = Object.freeze({
  unitNumber:10,
  title:'Unit Vocabulary Check',
  course:'Cambridge IGCSE ESL 0511',
  maxAttempts:3,
  forms:Object.freeze({ A:formA, B:formB, C:formC })
});

export default unit10VocabularyCheck;
