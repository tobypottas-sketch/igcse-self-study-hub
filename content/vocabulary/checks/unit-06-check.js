// Unit 6: Learning and Study Skills formal check. Same contract as Unit 4: three forms of ten (six passage gaps, two paraphrase, one word-form, one precision).
const mcq = (id, target, type, prompt, choices, answer, diagnostic, explanation) => ({ id, target, type, prompt, choices, answer, diagnostic, explanation });
const typed = (id, target, prompt, answer, diagnostic, explanation) => ({ id, target, type:'word_form', prompt, answer, diagnostic, explanation });

const formA = {
  id:'A',
  title:'Preparing for an important exam',
  passage:`A successful revision plan should help students [[1]] new information instead of simply reading the same notes again. It can also build [[2]], because learners feel more prepared when they know what they can do. Students sometimes face a [[3]] when two subjects need attention at the same time, so they must make sensible choices.\n\nA short practice test can be [[4]] to a longer one if it checks the same skills carefully. Teachers should avoid trying to [[5]] learners with too many tasks at once. Instead, students should [[6]] each method by looking at clear evidence of what helps them remember more.`,
  questions:[
    mcq('A1','u6_01_absorb','passage_mcq','Which word best completes gap 1?',['absorb','forecast','prioritise','interfere'],'absorb','Look for a verb meaning take in and understand information.','Absorb means to take in and understand information or knowledge.'),
    mcq('A2','u6_02_confidence','passage_mcq','Which word best completes gap 2?',['capacity','confidence','guidance','insight'],'confidence','You need a noun meaning belief in your own ability or judgement.','Confidence is belief in your own ability or judgement.'),
    mcq('A3','u6_03_dilemma','passage_mcq','Which word best completes gap 3?',['feedback','outcome','dilemma','strategy'],'dilemma','Think about a difficult choice between competing options.','A dilemma is a situation in which you must make a difficult choice.'),
    mcq('A4','u6_05_equivalent','passage_mcq','Which word best completes gap 4?',['passive','equivalent','cognitive','independent'],'equivalent','Look for an adjective meaning equal in value, level or function.','Equivalent means equal in value, meaning, amount or function.'),
    mcq('A5','u6_06_overload','passage_mcq','Which word best completes gap 5?',['overload','respond','retain','summarise'],'overload','You need a verb meaning give someone more work or information than they can manage.','Overload means to give someone more work or information than they can deal with.'),
    mcq('A6','u6_12_evaluate_6','passage_mcq','Which word best completes gap 6?',['memorise','evaluate','engage','revise'],'evaluate','Look for a verb meaning judge quality or effectiveness using evidence or criteria.','Evaluate means to judge the quality, value or effectiveness of something using evidence or clear criteria.'),
    mcq('A7','u6_13_reflect','paraphrase_mcq','After the test, students should think carefully about what worked and what did not. Which word best replaces think carefully about?',['reflect on','focus on','respond to','engage with'],'reflect on','Look for the verb phrase used when you look back on an experience in order to learn from it.','Reflect means to think carefully about an experience, action or idea, especially in order to learn from it.'),
    mcq('A8','u6_17_revise','paraphrase_mcq','Leila plans to study the topic again before Friday’s exam. Which word best replaces study the topic again?',['forecast','revise','process','retain'],'revise','Think about the British English verb for studying material again before an examination.','Revise means to study material again in order to prepare for an examination or understand it better.'),
    typed('A9','u6_31_struggle_6','Complete the sentence using the correct form of struggle: “Some students are still ______ with the final topic, so the teacher will explain it again.”','struggling','You need the -ing form after “are still”.','Struggle means to have difficulty doing or understanding something; here the correct form is struggling.'),
    mcq('A10','u6_41_prioritise','precision_mcq','Which phrase is most natural?',['prioritise urgent tasks','prioritise loud tasks','prioritise narrow tasks','prioritise distant tasks'],'prioritise urgent tasks','Think about the kinds of jobs that should be dealt with first when time is limited.','Prioritise urgent tasks is the natural collocation when deciding what matters most and should be done first.')
  ]
};

const formB = {
  id:'B',
  title:'Becoming a stronger learner',
  passage:`Good learners look for [[1]] before they accept a claim, and they ask for [[2]] when they are unsure what to do next. Strong [[3]] habits matter too: reading widely, taking useful notes and planning study time all support progress.\n\nLong tasks require [[4]], especially when phones and conversations compete for attention. Clear goals can increase [[5]], while an [[6]] method may waste time even if it eventually produces the correct result.`,
  questions:[
    mcq('B1','u6_21_evidence','passage_mcq','Which word best completes gap 1?',['evidence','curiosity','hesitation','outcome'],'evidence','Look for an uncountable noun meaning facts or information that support a claim.','Evidence is facts, information or examples that support a conclusion, claim or judgement.'),
    mcq('B2','u6_22_guidance','passage_mcq','Which word best completes gap 2?',['pressure','guidance','achievement','assumption'],'guidance','You need a noun meaning helpful advice or direction.','Guidance is help, advice or direction that helps someone decide what to do.'),
    mcq('B3','u6_23_academic','passage_mcq','Which word best completes gap 3?',['dramatic','academic','passive','independent'],'academic','Look for an adjective connected with education and studying.','Academic means connected with education, studying or scholarly work.'),
    mcq('B4','u6_24_concentration','passage_mcq','Which word best completes gap 4?',['coordination','concentration','curiosity','motivation'],'concentration','You need the noun for keeping full attention on one thing over time.','Concentration is the ability to keep your full attention on one thing for a period of time.'),
    mcq('B5','u6_26_motivation','passage_mcq','Which word best completes gap 5?',['motivation','evidence','capacity','feedback'],'motivation','Think about the desire or reason that makes someone want to keep working.','Motivation is the reason or desire that makes someone want to do something.'),
    mcq('B6','u6_30_inefficient','passage_mcq','Which word best completes gap 6?',['effective','inefficient','complex','cognitive'],'inefficient','Look for an adjective meaning wasteful of time, effort or resources.','Inefficient means not working or being organised in a way that uses time, effort or resources well.'),
    mcq('B7','u6_29_effective','paraphrase_mcq','A method that produces the intended result is successful. Which word best replaces successful?',['effective','complex','academic','passive'],'effective','Choose the adjective used for something that achieves the result it was meant to achieve.','Effective means successful in producing the result that was intended.'),
    mcq('B8','u6_32_awareness','paraphrase_mcq','The campaign increased public understanding that the problem existed. Which word best replaces understanding that the problem existed?',['capacity','awareness','confidence','curiosity'],'awareness','Look for the noun for knowing or understanding that something exists or is important.','Awareness means knowledge or understanding that something exists or is important.'),
    typed('B9','u6_35_respond','Complete the sentence using the correct form of respond: “The company promised a full ______ to the complaint within twenty-four hours.”','response','You need a noun after “a full”.','Respond is the verb; response is the noun for an answer or reaction.'),
    mcq('B10','u6_40_pressure_6','precision_mcq','Which phrase is most natural?',['under pressure','below pressure','inside pressure','across pressure'],'under pressure','Think about the fixed phrase used for working while facing strong demands or stress.','Under pressure is the natural collocation for experiencing stress or demands that make you feel you must perform or act.')
  ]
};

const formC = {
  id:'C',
  title:'Learning independently',
  passage:`Students [[1]] more information when they test themselves regularly instead of only rereading notes. They should also [[2]] long texts so that the main ideas are easier to review. Good [[3]] between teachers and students helps everyone understand the plan, while [[4]] skills such as memory and problem-solving develop through repeated use.\n\nCompleting a difficult course can be a real [[5]], but the final [[6]] depends on steady work over time.`,
  questions:[
    mcq('C1','u6_42_retain','passage_mcq','Which word best completes gap 1?',['retain','forecast','interfere','respond'],'retain','Look for a verb meaning keep information in your memory.','Retain means to keep information in your memory or continue to have something.'),
    mcq('C2','u6_43_summarise','passage_mcq','Which word best completes gap 2?',['memorise','summarise','evaluate','prioritise'],'summarise','You need the British English verb for giving only the main points in a shorter form.','Summarise means to give the main points of something in a shorter form.'),
    mcq('C3','u6_44_coordination','passage_mcq','Which word best completes gap 3?',['coordination','hesitation','assumption','perspective'],'coordination','Think about the organisation of people or actions so that they work together effectively.','Coordination is the organisation of people, actions or parts so that they work together effectively.'),
    mcq('C4','u6_45_cognitive','passage_mcq','Which word best completes gap 4?',['academic','equivalent','cognitive','passive'],'cognitive','Look for the adjective connected with thinking, understanding, learning or memory.','Cognitive means connected with thinking, understanding, learning or memory.'),
    mcq('C5','u6_46_achievement_6','passage_mcq','Which word best completes gap 5?',['achievement','outcome','guidance','evidence'],'achievement','You need a noun for something successfully completed through effort or ability.','Achievement is something successfully completed through effort or ability.'),
    mcq('C6','u6_47_outcome','passage_mcq','Which word best completes gap 6?',['strategy','outcome','technique','capacity'],'outcome','Look for the noun meaning the final result of a process, action or situation.','Outcome is the final result of a process, action or situation.'),
    mcq('C7','u6_48_focus','paraphrase_mcq','Switch off your notifications and give full attention to one task. Which word best replaces give full attention?',['focus','reflect','engage','forecast'],'focus','Look for the verb used when you direct all your attention to something.','Focus means to give full attention to something.'),
    mcq('C8','u6_50_insight','paraphrase_mcq','The interviews gave researchers a deeper understanding of the problem. Which word best replaces deeper understanding?',['insight','feedback','guidance','awareness'],'insight','Think about a noun for a clear and often deeper understanding of a situation or problem.','Insight is a clear and often deeper understanding of a situation, problem or idea.'),
    typed('C9','u6_49_memorise','Complete the sentence using the correct form from the memorise word family: “Regular sleep improves your ______ and helps you recall facts.”','memory','You need a noun for the ability to remember information.','Memorise is the verb; memory is the noun for the ability to remember information.'),
    mcq('C10','u6_37_independent','precision_mcq','Which phrase is most natural in a learning context?',['independent learner','independent homework','independent answer','independent textbook'],'independent learner','Think about the phrase for a student who can study without constant help.','Independent learner is the natural phrase for someone able to work, think or make decisions without relying heavily on others.')
  ]
};

export const unit6VocabularyCheck = Object.freeze({
  unitNumber:6,
  title:'Unit Vocabulary Check',
  course:'Cambridge IGCSE ESL 0511',
  maxAttempts:3,
  forms:Object.freeze({ A:formA, B:formB, C:formC })
});

export default unit6VocabularyCheck;
