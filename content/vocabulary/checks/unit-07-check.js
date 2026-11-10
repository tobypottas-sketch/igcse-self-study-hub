// Unit 7: Interviews formal check. Same contract as Units 4 and 6: three forms of ten (six passage gaps, two paraphrase, one word-form, one precision).
// Thirty different Unit 7 targets, ten per form. All passages and sentences are new: none comes from a pathway activity.
const mcq = (id, target, type, prompt, choices, answer, diagnostic, explanation) => ({ id, target, type, prompt, choices, answer, diagnostic, explanation });
const typed = (id, target, prompt, answer, diagnostic, explanation) => ({ id, target, type:'word_form', prompt, answer, diagnostic, explanation });

const formA = {
  id:'A',
  title:'Applying for a weekend job',
  passage:`Nadia is an [[1]] for a weekend job at the town library. Her list of [[2]] is short, because she is still at school, but she has helped her teacher run a reading club. On the form she gave her [[3]]: she can work on Saturdays and on Sunday mornings, but not on school evenings.\n\nShe also asked her tutor to write a [[4]], which describes her honesty and reliability. The library wants someone who is [[5]] about times, because the busiest hours often change. At the interview, Nadia hopes to [[6]] that she can talk to members of the public politely and calmly.`,
  questions:[
    mcq('A1','u7_01_applicant','passage_mcq','Which word best completes gap 1?',['applicant','editor','expectation','implication'],'applicant','You need a noun for a person who formally asks for a job.','Applicant means a person who makes a formal request for a job, a place on a course or a permit.'),
    mcq('A2','u7_02_qualifications','passage_mcq','Which word best completes gap 2?',['qualifications','schedules','formats','strategies'],'qualifications','Think about exam results and training that show someone is suitable for a job.','Qualifications are the exam results, degrees and training that show a person is suitable for a job or course.'),
    mcq('A3','u7_16_availability_7','passage_mcq','Which word best completes gap 3?',['availability','proficiency','punctuation','register'],'availability','The next part lists the days and times when Nadia is free to work.','Availability is the time when a person is free to attend a meeting or start work.'),
    mcq('A4','u7_13_reference','passage_mcq','Which word best completes gap 4?',['reference','layout','format','certificate'],'reference','Look for a short statement from someone who knows her and can say whether she is suitable.','A reference is a short written statement from someone who knows you, saying whether you are suitable for a job or a course.'),
    mcq('A5','u7_20_flexible','passage_mcq','Which word best completes gap 5?',['flexible','frequent','voluntary','visual'],'flexible','The busiest hours change, so the library needs someone who can adapt.','Flexible means able to change or adapt easily to new situations, times or plans.'),
    mcq('A6','u7_03_demonstrate','passage_mcq','Which word best completes gap 6?',['demonstrate','dominate','distribute','combine'],'demonstrate','You need a verb that can be followed by “that” and means show clearly.','Demonstrate means to show clearly that you have a skill, quality or piece of knowledge.'),
    mcq('A7','u7_23_impress','paraphrase_mcq','Nadia practised her answers because she wanted to leave a strong, positive mark on the panel. Which word best replaces leave a strong, positive mark on?',['impress','combine','distribute','organise'],'impress','Look for a verb meaning make someone feel admiration or respect.','Impress means to make someone feel admiration or respect because of what you say or do.'),
    mcq('A8','u7_04_summary','paraphrase_mcq','The form asked for a short account of her main skills, and she wrote it in three lines. Which word best replaces a short account of?',['summary','schedule','expectation','criteria'],'summary','Think about a noun for a short account that gives only the main points.','A summary is a short account that gives only the main points of something longer.'),
    typed('A9','u7_15_enthusiastic','Complete the sentence using the correct form of enthusiastic: “The interviewer liked her ______ for helping younger students.”','enthusiasm','You need a noun after “her”.','Enthusiastic is the adjective; enthusiasm is the noun for great interest, energy and excitement.'),
    mcq('A10','u7_34_experience','precision_mcq','Which phrase is most natural?',['gain experience','make experience','win experience','pass experience'],'gain experience','Think about the verb that goes with knowledge and skill that you get over time.','Experience is knowledge and skill gained from doing something over a period of time, so we say gain experience.')
  ]
};

const formB = {
  id:'B',
  title:'Interview day and communication',
  passage:`Before his interview for the school council, Omar felt [[1]] because he had never faced a group of adults before. His teacher gave him a useful [[2]]: read the question twice, pause for three seconds and then answer. He had practised with his sister at home.\n\nOn the day, the [[3]] put the same first question to every candidate. Omar waited, then chose to [[4]] by describing a project he had led. He kept every example [[5]] to the role, and his answer was [[6]], with a clear beginning, middle and end.`,
  questions:[
    mcq('B1','u7_36_anxious_7','passage_mcq','Which word best completes gap 1?',['anxious','flexible','accurate','enthusiastic'],'anxious','Think about how someone feels before doing something new and frightening.','Anxious means feeling worried or nervous about something that is going to happen.'),
    mcq('B2','u7_19_strategy_7','passage_mcq','Which word best completes gap 2?',['strategy','layout','certificate','membership'],'strategy','The teacher gives a plan of steps for doing well in the interview.','A strategy is a plan for dealing with a difficult situation or achieving a goal such as doing well in an interview.'),
    mcq('B3','u7_10_interviewer','passage_mcq','Which word best completes gap 3?',['interviewer','editor','referee','applicant'],'interviewer','You need the person who asks the questions on the day.','An interviewer is a person who asks questions in an interview to find out about someone.'),
    mcq('B4','u7_24_respond_7','passage_mcq','Which word best completes gap 4?',['respond','allocate','proofread','distribute'],'respond','Look for a verb meaning give an answer to a question.','Respond means to give an answer or reaction, in speech or in writing, to a question or a message.'),
    mcq('B5','u7_25_relevant_7','passage_mcq','Which word best completes gap 5?',['relevant','voluntary','visual','frequent'],'relevant','Each example had to be connected with the role and useful for the purpose.','Relevant means connected with what is being discussed, so that it is useful or important for the purpose.'),
    mcq('B6','u7_27_coherent','passage_mcq','Which word best completes gap 6?',['coherent','flexible','frequent','voluntary'],'coherent','The end of the sentence describes an answer that is clear and well organised.','Coherent means logical, clear and well organised, so that the parts fit together and are easy to follow.'),
    mcq('B7','u7_18_dominate','paraphrase_mcq','In group discussions, Omar tries never to take over the conversation. Which word best replaces take over?',['dominate','contribute to','impress','combine'],'dominate','Look for a verb meaning speak or act so that one person controls a situation.','Dominate means to have the most control or influence in a situation, or to speak so much that others cannot.'),
    mcq('B8','u7_17_compromise','paraphrase_mcq','The two teams settled their argument with a deal in which both sides gave up part of what they wanted. Which word best replaces a deal in which both sides gave up part of what they wanted?',['compromise','expectation','implication','criteria'],'compromise','Think about a noun for an agreement where nobody gets everything they wanted.','A compromise is an agreement in which each side accepts less than it wanted in order to settle a disagreement.'),
    typed('B9','u7_26_contribute','Complete the sentence using the correct form of contribute: “Each student in the group made a valuable ______ to the project.”','contribution','You need a noun after “a valuable”.','Contribute is the verb; contribution is the noun for what you give to help achieve something with other people.'),
    mcq('B10','u7_35_confidence_7','precision_mcq','Which phrase is most natural?',['speak with confidence','speak by confidence','speak beside confidence','speak across confidence'],'speak with confidence','Think about the small word that shows the way in which someone speaks.','Confidence is the feeling that you can trust your own ability, and we say speak with confidence.')
  ]
};

const formC = {
  id:'C',
  title:'A school magazine competition',
  passage:`The school magazine is running a writing competition. Every entry is read by the [[1]], who then decides which stories go forward. Writers should [[2]] their work carefully before they hand it in, because spelling mistakes lose marks. Entries must be no longer than five hundred words.\n\nThe judges follow clear [[3]], such as originality, structure and language, so students know how marks are awarded. Facts in non-fiction pieces must be [[4]], and the [[5]] of each page should look neat, with pictures placed beside the text. Winners will receive a [[6]] at the school assembly.`,
  questions:[
    mcq('C1','u7_44_editor','passage_mcq','Which word best completes gap 1?',['editor','applicant','interviewee','referee'],'editor','You need the person whose job is to check written work before it is published.','An editor is a person whose job is to check and correct written work before it is published or finished.'),
    mcq('C2','u7_45_proofread','passage_mcq','Which word best completes gap 2?',['proofread','distribute','allocate','demonstrate'],'proofread','Spelling mistakes lose marks, so writers must read their work for errors.','Proofread means to read a piece of writing carefully in order to find and correct mistakes before it is finished.'),
    mcq('C3','u7_48_criteria_7','passage_mcq','Which word best completes gap 3?',['criteria','certificates','schedules','editors'],'criteria','Look for the plural noun for the standards that judges use to give marks.','Criteria are the standards or points that are used to judge or decide something.'),
    mcq('C4','u7_49_accurate','passage_mcq','Which word best completes gap 4?',['accurate','voluntary','flexible','anxious'],'accurate','Facts in non-fiction must be correct and exact.','Accurate means correct and exact, without any mistakes.'),
    mcq('C5','u7_46_layout','passage_mcq','Which word best completes gap 5?',['layout','summary','reference','strategy'],'layout','Think about how pictures and text are arranged on a page.','Layout is the way in which text, pictures and other items are arranged on a page or screen.'),
    mcq('C6','u7_32_certificate','passage_mcq','Which word best completes gap 6?',['certificate','overview','compromise','criteria'],'certificate','Look for an official document that a winner can receive.','A certificate is an official document that shows that a person has passed an exam or finished a course.'),
    mcq('C7','u7_41_distribute','paraphrase_mcq','Volunteers will give out free copies of the magazine at the school gate. Which word best replaces give out?',['distribute','impress','combine','respond'],'distribute','Think about the verb for handing something out to a number of people.','Distribute means to give out something to a number of people or places, or to share it among them.'),
    mcq('C8','u7_39_evaluate_7','paraphrase_mcq','Before the final round, the judges will carefully judge the quality of every story. Which word best replaces carefully judge the quality of?',['evaluate','combine','distribute','contribute to'],'evaluate','Look for a verb meaning think carefully about how good something is.','Evaluate means to judge how good, useful or successful something is, after thinking about it carefully.'),
    typed('C9','u7_07_frequent','Complete the sentence using the correct form of frequent: “The editor ______ meets the writers to talk about their drafts.”','frequently','You need an adverb before the verb “meets”.','Frequent is the adjective meaning happening often; frequently is the adverb.'),
    mcq('C10','u7_21_schedule','precision_mcq','Which phrase is most natural?',['ahead of schedule','before of schedule','up to schedule','front of schedule'],'ahead of schedule','Think about the fixed phrase used when work is finished earlier than planned.','A schedule is a plan that shows the times and dates when things will happen, so work finished early is ahead of schedule.')
  ]
};

export const unit7VocabularyCheck = Object.freeze({
  unitNumber:7,
  title:'Unit Vocabulary Check',
  course:'Cambridge IGCSE ESL 0511',
  maxAttempts:3,
  forms:Object.freeze({ A:formA, B:formB, C:formC })
});

export default unit7VocabularyCheck;
