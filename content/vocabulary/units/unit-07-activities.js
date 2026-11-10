// Unit 7 · Paraphrasing content (phrase_set and idea_set), WORDS 1–50 (complete). Same record shapes and contract as unit-06-activities.js:
//   phrase_set : originalPhrase (plain wording) -> equivalentPhrase (contains the target), acceptedVariants, chunks, commonMeaningDistortions
//   idea_set   : originalIdea (contains the target) with accurate paraphrases that do NOT contain it, a meaning invariant, and three
//                meaning-changing distractors each tagged with the misconception it represents.
// Every record is linked to exactly one Unit 7 word.
const status = 'approved';
const unitNumber = 7;

function phrase(id, originalPhrase, equivalentPhrase, linkedVocabularyIds, { acceptedVariants = [], chunks = null, distortions = [] } = {}) {
  return {
    activityContentId:`u7_phrase_${id}`, unitNumber, contentType:'phrase_set', status,
    activityData:{
      originalPhrase, equivalentPhrase, acceptedVariants,
      chunks:chunks ?? equivalentPhrase.split(/\s+/),
      commonMeaningDistortions:distortions,
      linkedVocabularyIds,
      primaryEvidenceTargetId:linkedVocabularyIds.length === 1 ? linkedVocabularyIds[0] : undefined
    }
  };
}

function idea(id, originalIdea, accurateParaphrase, invariantType, invariantValue, distractors, linkedVocabularyIds = []) {
  return {
    activityContentId:`u7_idea_${id}`, unitNumber, contentType:'idea_set', status,
    activityData:{
      originalIdea,
      accurateParaphrases:Array.isArray(accurateParaphrase) ? accurateParaphrase : [accurateParaphrase],
      meaningInvariants:[{ type:invariantType, value:invariantValue }],
      distractors,
      linkedVocabularyIds
    }
  };
}

const phraseSets = [
  phrase('applicant_main', 'a person who has asked formally for a job', 'an applicant for a job', ['vocab_applicant'], { chunks:['an applicant', 'for a job'], distortions:['a person who has been offered a job', 'a person who has left a job', 'a person who advertises a job'] }),
  phrase('qualifications_main', 'the exam results needed for a job', 'the qualifications needed for a job', ['vocab_qualifications'], { chunks:['the qualifications', 'needed for a job'], distortions:['the experience needed for a job', 'the money needed for a job', 'the clothes needed for a job'] }),
  phrase('demonstrate_main', 'to show clearly that you have a skill', 'to demonstrate a skill', ['vocab_demonstrate'], { chunks:['to demonstrate', 'a skill'], distortions:['to hide a skill', 'to teach a skill', 'to lose a skill'] }),
  phrase('summary_main', 'a short account of the main points of a talk', 'a summary of a talk', ['vocab_summary'], { chunks:['a summary', 'of a talk'], distortions:['a long copy of a talk', 'a criticism of a talk', 'a question about a talk'] }),
  phrase('combine_main', 'to join work and study together', 'to combine work and study', ['vocab_combine'], { chunks:['to combine', 'work and study'], distortions:['to compare work and study', 'to choose work or study', 'to stop work and study'] }),
  phrase('voluntary_main', 'work that people do by choice and without payment', 'voluntary work', ['vocab_voluntary'], { chunks:['voluntary', 'work'], distortions:['work that people do under orders', 'work that people do for large payment', 'work that people do in secret'] }),
  phrase('frequent_main', 'mistakes that happen very often', 'frequent mistakes', ['vocab_frequent'], { chunks:['frequent', 'mistakes'], distortions:['mistakes that happen only once', 'mistakes that nobody makes', 'mistakes that happen in secret'] }),
  phrase('overview_main', 'a general description of the whole course', 'an overview of the whole course', ['vocab_overview'], { chunks:['an overview', 'of the whole course'], distortions:['a test of the whole course', 'a price for the whole course', 'a complaint about the whole course'] }),
  phrase('candidate_main', 'a person who is being considered for a job', 'a candidate for a job', ['vocab_candidate'], { chunks:['a candidate', 'for a job'], distortions:['a person who has resigned from a job', 'a person who has refused a job', 'a person who is paid to advertise a job'] }),
  phrase('interviewer_main', 'the person who asks questions in a job meeting', 'the interviewer in a job meeting', ['vocab_interviewer'], { chunks:['the interviewer', 'in a job meeting'], distortions:['the person who answers questions in a job meeting', 'the person who cleans a job meeting room', 'the person who pays for a job meeting'] }),
  phrase('interviewee_main', 'the person who answers the questions in a job meeting', 'the interviewee in a job meeting', ['vocab_interviewee'], { chunks:['the interviewee', 'in a job meeting'], distortions:['the person who asks the questions in a job meeting', 'the person who pays for a job meeting', 'the person who cleans a job meeting room'] }),
  phrase('referee_main', 'a person who speaks about your character to an employer', 'a referee for an employer', ['vocab_referee'], { chunks:['a referee', 'for an employer'], distortions:['a person who controls a match for an employer', 'a person who pays an employer', 'a person who interviews an employer'] }),
  phrase('reference_main', 'a letter that says a person is suitable for a job', 'a reference for a job', ['vocab_reference'], { chunks:['a reference', 'for a job'], distortions:['a letter that refuses a job', 'a letter that advertises a job', 'a letter that complains about a job'] }),
  phrase('proficiency_main', 'a high level of skill in English', 'proficiency in English', ['vocab_proficiency'], { chunks:['proficiency', 'in English'], distortions:['a low level of skill in English', 'a fear of English', 'a dislike of English'] }),
  phrase('enthusiastic_main', 'very interested and full of energy about the job', 'enthusiastic about the job', ['vocab_enthusiastic'], { chunks:['enthusiastic', 'about the job'], distortions:['bored with the job', 'worried about the job', 'angry about the job'] }),
  phrase('availability_main', 'the times when a person is free to work', 'availability for work', ['vocab_availability_7'], { chunks:['availability', 'for work'], distortions:['the times when a person is tired of work', 'the money a person earns from work', 'the skills a person needs for work'] }),
  phrase('compromise_main', 'an agreement in which both sides give something up', 'a compromise between the two sides', ['vocab_compromise'], { chunks:['a compromise', 'between the two sides'], distortions:['an argument between the two sides', 'a victory for one of the two sides', 'a punishment for the two sides'] }),
  phrase('dominate_main', 'to have the most control over a discussion', 'to dominate a discussion', ['vocab_dominate'], { chunks:['to dominate', 'a discussion'], distortions:['to avoid a discussion', 'to record a discussion', 'to end a discussion'] }),
  phrase('strategy_main', 'a plan for doing well in an interview', 'a strategy for an interview', ['vocab_strategy_7'], { chunks:['a strategy', 'for an interview'], distortions:['a fear of an interview', 'a cost of an interview', 'a reward after an interview'] }),
  phrase('flexible_main', 'able to change hours to suit different people', 'flexible hours', ['vocab_flexible'], { chunks:['flexible', 'hours'], distortions:['fixed hours', 'long hours', 'unpaid hours'] }),
  phrase('schedule_main', 'a plan showing when interviews will take place', 'a schedule for the interviews', ['vocab_schedule'], { chunks:['a schedule', 'for the interviews'], distortions:['a list of questions for the interviews', 'a price for the interviews', 'a complaint about the interviews'] }),
  phrase('expectation_main', 'a belief that a student will do well', 'an expectation of success', ['vocab_expectation'], { chunks:['an expectation', 'of success'], distortions:['a fear of failure', 'a reward for success', 'a doubt about success'] }),
  phrase('impress_main', 'to make the panel admire you', 'to impress the panel', ['vocab_impress'], { chunks:['to impress', 'the panel'], distortions:['to bore the panel', 'to avoid the panel', 'to thank the panel'] }),
  phrase('respond_main', 'to give an answer to an email', 'to respond to an email', ['vocab_respond_7'], { chunks:['to respond', 'to an email'], distortions:['to delete an email', 'to forward an email', 'to print an email'] }),
  phrase('relevant_main', 'experience that is connected to the job', 'relevant experience', ['vocab_relevant_7'], { chunks:['relevant', 'experience'], distortions:['experience that is unconnected to the job', 'experience that is expensive for the job', 'experience that is hidden from the job'] }),
  phrase('contribute_main', 'to give ideas to a group discussion', 'to contribute to a group discussion', ['vocab_contribute'], { chunks:['to contribute', 'to a group discussion'], distortions:['to end a group discussion', 'to avoid a group discussion', 'to record a group discussion'] }),
  phrase('coherent_main', 'an answer with clear and logical ideas', 'a coherent answer', ['vocab_coherent'], { chunks:['a coherent', 'answer'], distortions:['an answer with confused ideas', 'an answer with very short ideas', 'an answer with copied ideas'] }),
  phrase('implication_main', 'a meaning that is not said openly in a reply', 'the implication of a reply', ['vocab_implication'], { chunks:['the implication', 'of a reply'], distortions:['the length of a reply', 'the date of a reply', 'the writer of a reply'] }),
  phrase('register_main', 'the level of formality in a letter', 'the register of a letter', ['vocab_register'], { chunks:['the register', 'of a letter'], distortions:['the length of a letter', 'the cost of a letter', 'the owner of a letter'] }),
  phrase('format_main', 'the way a test is arranged', 'the format of a test', ['vocab_format'], { chunks:['the format', 'of a test'], distortions:['the price of a test', 'the result of a test', 'the length of a test break'] }),
  phrase('membership_main', 'the right to belong to a club', 'membership of a club', ['vocab_membership'], { chunks:['membership', 'of a club'], distortions:['the cost of building a club', 'the leader of a club', 'the rules of a club'] }),
  phrase('certificate_main', 'an official document showing that you passed a course', 'a certificate for passing a course', ['vocab_certificate'], { chunks:['a certificate', 'for passing a course'], distortions:['a ticket for entering a course', 'a bill for paying for a course', 'a letter about missing a course'] }),
  phrase('qualification_main', 'a skill that makes someone suitable for a job', 'a qualification for a job', ['vocab_qualification_7'], { chunks:['a qualification', 'for a job'], distortions:['a mistake that loses a job', 'a reward after a job', 'a rule about a job'] }),
  phrase('experience_main', 'knowledge gained from working in a job', 'experience of working', ['vocab_experience'], { chunks:['experience', 'of working'], distortions:['fear of working', 'payment for working', 'plans for working'] }),
  phrase('confidence_main', 'a strong belief in your own ability to speak', 'confidence in speaking', ['vocab_confidence_7'], { chunks:['confidence', 'in speaking'], distortions:['fear of speaking', 'dislike of speaking', 'practice in speaking'] }),
  phrase('anxious_main', 'worried and nervous before an interview', 'anxious before an interview', ['vocab_anxious_7'], { chunks:['anxious', 'before an interview'], distortions:['excited after an interview', 'bored during an interview', 'angry about an interview'] }),
  phrase('expertise_main', 'special knowledge in a subject', 'expertise in a subject', ['vocab_expertise'], { chunks:['expertise', 'in a subject'], distortions:['dislike of a subject', 'fear of a subject', 'ignorance of a subject'] }),
  phrase('technique_main', 'a method for answering difficult questions', 'a technique for answering difficult questions', ['vocab_technique_7'], { chunks:['a technique', 'for answering difficult questions'], distortions:['a fear of answering difficult questions', 'a machine for answering difficult questions', 'a reward for answering difficult questions'] }),
  phrase('evaluate_main', 'to judge how well a candidate performed', 'to evaluate a candidate’s performance', ['vocab_evaluate_7'], { chunks:['to evaluate', 'a candidate’s performance'], distortions:['to ignore a candidate’s performance', 'to copy a candidate’s performance', 'to advertise a candidate’s performance'] }),
  phrase('organise_main', 'to arrange your ideas in a sensible order', 'to organise your ideas', ['vocab_organise'], { chunks:['to organise', 'your ideas'], distortions:['to forget your ideas', 'to copy your ideas', 'to hide your ideas'] }),
  phrase('distribute_main', 'to give out leaflets to people', 'to distribute leaflets', ['vocab_distribute'], { chunks:['to distribute', 'leaflets'], distortions:['to collect leaflets', 'to read leaflets', 'to destroy leaflets'] }),
  phrase('allocate_main', 'to set aside money for a purpose', 'to allocate money for a purpose', ['vocab_allocate'], { chunks:['to allocate', 'money for a purpose'], distortions:['to lose money for a purpose', 'to borrow money for a purpose', 'to count money for a purpose'] }),
  phrase('responsible_main', 'having the duty to look after the equipment', 'responsible for the equipment', ['vocab_responsible'], { chunks:['responsible', 'for the equipment'], distortions:['afraid of the equipment', 'bored with the equipment', 'angry about the equipment'] }),
  phrase('editor_main', 'the person who corrects articles in a magazine', 'the editor of a magazine', ['vocab_editor'], { chunks:['the editor', 'of a magazine'], distortions:['the reader of a magazine', 'the seller of a magazine', 'the owner of a magazine'] }),
  phrase('proofread_main', 'to read a letter and correct the mistakes', 'to proofread a letter', ['vocab_proofread'], { chunks:['to proofread', 'a letter'], distortions:['to write a letter', 'to post a letter', 'to burn a letter'] }),
  phrase('layout_main', 'the way text is arranged on a page', 'the layout of a page', ['vocab_layout'], { chunks:['the layout', 'of a page'], distortions:['the length of a page', 'the colour of a page', 'the price of a page'] }),
  phrase('visual_main', 'a picture that helps the audience to understand', 'a visual aid for the audience', ['vocab_visual'], { chunks:['a visual aid', 'for the audience'], distortions:['a noise for the audience', 'a gift for the audience', 'a question for the audience'] }),
  phrase('criteria_main', 'the standards used to choose a winner', 'the criteria for choosing a winner', ['vocab_criteria_7'], { chunks:['the criteria', 'for choosing a winner'], distortions:['the prizes for choosing a winner', 'the names for choosing a winner', 'the times for choosing a winner'] }),
  phrase('accurate_main', 'information that is correct and exact', 'accurate information', ['vocab_accurate'], { chunks:['accurate', 'information'], distortions:['information that is old and unused', 'information that is secret and private', 'information that is long and boring'] }),
  phrase('punctuation_main', 'the marks that show where sentences end', 'the punctuation in a sentence', ['vocab_punctuation'], { chunks:['the punctuation', 'in a sentence'], distortions:['the length of a sentence', 'the author of a sentence', 'the spelling of a sentence'] })
];

const ideaSets = [
  idea('applicant', 'Every applicant must send a letter and a CV before the closing date.', ['Everybody who asks formally for the job has to submit a letter and a CV by the final day for entries.', 'Each person who wants the post must send a covering letter and a CV before the entries close.', 'A letter and a CV have to be sent in by every person asking for the position before the deadline.'], 'quantity', 'every', [
    { text:'Some applicants must send a letter and a CV before the closing date.', misconceptionCategory:'quantity_change' },
    { text:'Every applicant may send a letter and a CV after the closing date.', misconceptionCategory:'time_change' },
    { text:'Every interviewer must send a letter and a CV before the closing date.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_applicant']),
  idea('qualifications', 'Employers often ask for qualifications as well as practical experience.', ['Companies frequently want exam results and training in addition to practical experience.', 'Employers usually expect proof of study as well as skills gained from doing the job.', 'Many firms look for official certificates and also for practical experience.'], 'quantity', 'often', [
    { text:'Employers never ask for qualifications as well as practical experience.', misconceptionCategory:'polarity_change' },
    { text:'Employers ask for practical experience instead of any qualifications.', misconceptionCategory:'omitted_information' },
    { text:'Employers often ask for hobbies as well as practical experience.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_qualifications']),
  idea('demonstrate', 'Candidates should demonstrate their skills by giving clear examples.', ['Applicants ought to show what they can do by describing definite examples.', 'People attending an interview should prove their abilities with specific examples.', 'Giving clear examples is how candidates ought to show their skills.'], 'cause_effect', 'by giving clear examples', [
    { text:'Candidates should hide their skills by giving clear examples.', misconceptionCategory:'polarity_change' },
    { text:'Candidates should demonstrate their skills without giving any examples.', misconceptionCategory:'omitted_information' },
    { text:'Candidates should compare their skills by giving clear examples.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_demonstrate']),
  idea('summary', 'The final page of the report gives a summary of the main findings.', ['The last page of the report briefly states the most important findings.', 'On the closing page of the report, the key findings are listed in short form.', 'A short account of the main results appears on the final page of the report.'], 'quantity', 'main findings', [
    { text:'The final page of the report gives every single finding in full detail.', misconceptionCategory:'degree_change' },
    { text:'The first page of the report gives a summary of the main findings.', misconceptionCategory:'meaning_confusion' },
    { text:'The final page of the report gives a summary of the minor findings.', misconceptionCategory:'quantity_change' }
  ], ['vocab_summary']),
  idea('combine', 'Many students combine part-time work with their studies.', ['Lots of students do a part-time job at the same time as studying.', 'It is common for students to join a part-time job and their studies together.', 'A good number of students manage a part-time job alongside their studies.'], 'quantity', 'many', [
    { text:'Few students combine part-time work with their studies.', misconceptionCategory:'quantity_change' },
    { text:'Many students replace their studies with part-time work.', misconceptionCategory:'meaning_confusion' },
    { text:'Many students combine part-time work with their holidays.', misconceptionCategory:'added_information' }
  ], ['vocab_combine']),
  idea('voluntary', 'Taking part in the school trip is voluntary, but most students have signed up.', ['Nobody has to go on the school trip, yet most students have put their names down.', 'The trip is not compulsory, although the majority of students have registered.', 'Students can choose whether or not to join the school trip, and most have decided to.'], 'degree', 'not compulsory', [
    { text:'Taking part in the school trip is compulsory, and most students have signed up.', misconceptionCategory:'polarity_change' },
    { text:'Taking part in the school trip is voluntary, and few students have signed up.', misconceptionCategory:'quantity_change' },
    { text:'Taking part in the school trip is voluntary, so no student has signed up.', misconceptionCategory:'degree_change' }
  ], ['vocab_voluntary']),
  idea('frequent', 'There are frequent delays on the line between the village and the city.', ['The trains between the village and the city are often late.', 'Delays happen many times on the route linking the village with the city.', 'Passengers travelling between the village and the city regularly face late services.'], 'quantity', 'often', [
    { text:'There are rare delays on the line between the village and the city.', misconceptionCategory:'quantity_change' },
    { text:'There are frequent delays on the line between the city and the airport.', misconceptionCategory:'meaning_confusion' },
    { text:'There are frequent improvements on the line between the village and the city.', misconceptionCategory:'polarity_change' }
  ], ['vocab_frequent']),
  idea('overview', 'The introduction gives a general overview of the topic without going into detail.', ['The opening section briefly describes the main features of the subject and leaves out the fine detail.', 'In the first part of the text, the topic is introduced broadly, with no close detail.', 'The beginning of the piece offers a wide, general picture of the subject and does not explore small points.'], 'degree', 'without going into detail', [
    { text:'The introduction gives a detailed analysis of the topic and explains every small point.', misconceptionCategory:'degree_change' },
    { text:'The conclusion gives a general overview of the topic without going into detail.', misconceptionCategory:'meaning_confusion' },
    { text:'The introduction gives a general overview of the topic and then goes into great detail.', misconceptionCategory:'added_information' }
  ], ['vocab_overview']),
  idea('candidate', 'The strongest candidate had experience of working abroad and spoke three languages.', ['The best person being considered had worked overseas and could speak three languages.', 'Having lived and worked abroad and speaking three languages made one person the most promising choice.', 'The most impressive person on the list had overseas work history and three languages.'], 'degree', 'strongest', [
    { text:'The weakest candidate had experience of working abroad and spoke three languages.', misconceptionCategory:'polarity_change' },
    { text:'The strongest candidate had experience of working abroad but spoke only one language.', misconceptionCategory:'quantity_change' },
    { text:'The strongest interviewer had experience of working abroad and spoke three languages.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_candidate']),
  idea('interviewer', 'The interviewer asked each candidate the same five questions.', ['Every person being considered was given the same five questions by the person running the meeting.', 'The person in charge of the meeting put identical questions to all the candidates.', 'All of the candidates were asked five identical questions by the one who led the session.'], 'quantity', 'same five questions', [
    { text:'The interviewer asked each candidate a different set of questions.', misconceptionCategory:'comparison_change' },
    { text:'The interviewer asked only one candidate the same five questions.', misconceptionCategory:'quantity_change' },
    { text:'The candidates asked the interviewer the same five questions.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_interviewer']),
  idea('interviewee', 'The interviewee answered every question clearly and politely.', ['The person being questioned replied to each question in a clear and courteous way.', 'Each question was answered by the person at the meeting in a polite and clear manner.', 'Every one of the questions received a clear, polite reply from the person being asked.'], 'quantity', 'every question', [
    { text:'The interviewee answered some questions clearly and politely.', misconceptionCategory:'quantity_change' },
    { text:'The interviewer answered every question clearly and politely.', misconceptionCategory:'meaning_confusion' },
    { text:'The interviewee answered every question clearly but rudely.', misconceptionCategory:'polarity_change' }
  ], ['vocab_interviewee']),
  idea('referee', 'Most employers will contact a referee before they offer a job.', ['The majority of employers get in touch with a person named on the form before making an offer.', 'Before offering the post, most companies phone or email someone who can speak about the applicant.', 'It is normal for employers to talk to a person who knows the applicant well before they give the job.'], 'time', 'before they offer a job', [
    { text:'Most employers will contact a referee after they offer a job.', misconceptionCategory:'time_change' },
    { text:'Few employers will contact a referee before they offer a job.', misconceptionCategory:'quantity_change' },
    { text:'Most employers will contact a candidate before they offer a job.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_referee']),
  idea('reference', 'The employer asked for a reference from her last manager before making an offer.', ['Before offering her the post, the company wanted a statement about her from her previous boss.', 'Her last manager was asked by the employer to write a recommendation before the offer was made.', 'The company required a written opinion of her from the person who had managed her most recently.'], 'time', 'before making an offer', [
    { text:'The employer asked for a reference from her last manager after making an offer.', misconceptionCategory:'time_change' },
    { text:'The employer asked for a reference from her last teacher before making an offer.', misconceptionCategory:'meaning_confusion' },
    { text:'The employer refused a reference from her last manager before making an offer.', misconceptionCategory:'polarity_change' }
  ], ['vocab_reference']),
  idea('proficiency', 'Proficiency in English is essential for most jobs in the tourist industry.', ['A high level of skill in English is necessary for the majority of posts in tourism.', 'Most positions in the tourist industry cannot be done without being very good at English.', 'To work in tourism, you generally have to be highly skilled in English.'], 'degree', 'essential', [
    { text:'Proficiency in English is helpful but not essential for most jobs in the tourist industry.', misconceptionCategory:'degree_change' },
    { text:'Proficiency in English is essential for a few jobs in the tourist industry.', misconceptionCategory:'quantity_change' },
    { text:'Proficiency in English is essential for most jobs in the banking industry.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_proficiency']),
  idea('enthusiastic', 'The interviewer was impressed by how enthusiastic the candidate was about the job.', ['The person running the meeting liked how keen and excited the applicant seemed about the post.', 'How eager the candidate appeared for the job made a strong impression on the interviewer.', 'The one asking the questions admired the energy and interest the candidate showed for the position.'], 'cause_effect', 'impressed by how enthusiastic', [
    { text:'The interviewer was worried by how enthusiastic the candidate was about the job.', misconceptionCategory:'polarity_change' },
    { text:'The interviewer was impressed by how nervous the candidate was about the job.', misconceptionCategory:'meaning_confusion' },
    { text:'The interviewer was impressed by how enthusiastic the candidate was about the salary.', misconceptionCategory:'added_information' }
  ], ['vocab_enthusiastic']),
  idea('availability', 'Because of her limited availability, she can only work on Saturday mornings.', ['She is free to work only on Saturday mornings, so her time is restricted.', 'Her free time is very limited, so Saturday mornings are the only time she can work.', 'The only time she can come in is Saturday morning, because she is not free at other times.'], 'cause_effect', 'because of her limited availability', [
    { text:'Because of her excellent availability, she can work on any day of the week.', misconceptionCategory:'polarity_change' },
    { text:'Because of her limited availability, she can only work on Sunday afternoons.', misconceptionCategory:'meaning_confusion' },
    { text:'Although she is limited in availability, she works on every day of the week.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_availability_7']),
  idea('compromise', 'The two managers reached a compromise after a long discussion.', ['After talking for a long time, the two managers agreed on a solution that each of them could accept.', 'Following lengthy talks, the two managers settled their disagreement with each giving something up.', 'A solution acceptable to both managers was finally found after a lengthy conversation.'], 'time', 'after a long discussion', [
    { text:'The two managers reached a compromise before any discussion took place.', misconceptionCategory:'time_change' },
    { text:'The two managers refused to reach a compromise after a long discussion.', misconceptionCategory:'polarity_change' },
    { text:'The two managers reached a victory after a long discussion.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_compromise']),
  idea('dominate', 'One loud candidate tended to dominate the group discussion.', ['One candidate with a loud voice often took over the group conversation.', 'The group conversation was frequently controlled by a single noisy applicant.', 'A noisy member of the group usually spoke so much that he led the whole discussion.'], 'quantity', 'one loud candidate', [
    { text:'Every loud candidate tended to dominate the group discussion.', misconceptionCategory:'quantity_change' },
    { text:'One loud candidate tended to avoid the group discussion.', misconceptionCategory:'polarity_change' },
    { text:'One loud candidate tended to organise the group discussion.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_dominate']),
  idea('strategy', 'The company has a clear strategy for recruiting young people.', ['The firm has a definite plan for employing young people.', 'There is a well-defined plan at the business for taking on young workers.', 'The business knows exactly how it intends to bring in younger staff.'], 'degree', 'clear', [
    { text:'The company has no strategy for recruiting young people.', misconceptionCategory:'polarity_change' },
    { text:'The company has a confusing strategy for recruiting young people.', misconceptionCategory:'degree_change' },
    { text:'The company has a clear strategy for training young people.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_strategy_7']),
  idea('flexible', 'The company offers flexible working hours to all its staff.', ['The firm lets every employee adjust their working times.', 'All of the business’s workers can change when they start and finish work.', 'Every member of staff at the company is allowed to vary their hours.'], 'quantity', 'all its staff', [
    { text:'The company offers flexible working hours to some of its staff.', misconceptionCategory:'quantity_change' },
    { text:'The company offers fixed working hours to all its staff.', misconceptionCategory:'polarity_change' },
    { text:'The company offers flexible working holidays to all its staff.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_flexible']),
  idea('schedule', 'The interview schedule was changed because two candidates were ill.', ['The plan of times for the interviews had to be altered as two applicants were unwell.', 'Because two candidates could not attend through illness, the timetable of interviews was rearranged.', 'The timings for the interviews were revised after two of the candidates fell ill.'], 'cause_effect', 'because two candidates were ill', [
    { text:'The interview schedule was cancelled because two candidates were ill.', misconceptionCategory:'meaning_confusion' },
    { text:'The interview schedule was changed although two candidates were ill.', misconceptionCategory:'cause_effect_change' },
    { text:'The interview schedule was changed because two candidates were late.', misconceptionCategory:'added_information' }
  ], ['vocab_schedule']),
  idea('expectation', 'The manager’s expectation is that all staff will arrive before nine o’clock.', ['The manager believes that every member of staff should be there before nine.', 'All workers are expected by the manager to arrive earlier than nine o’clock.', 'The manager thinks that nobody on the team will turn up after nine.'], 'quantity', 'all staff', [
    { text:'The manager’s expectation is that some staff will arrive before nine o’clock.', misconceptionCategory:'quantity_change' },
    { text:'The manager’s expectation is that all staff will arrive after nine o’clock.', misconceptionCategory:'time_change' },
    { text:'The manager’s promise is that all staff will arrive before nine o’clock.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_expectation']),
  idea('impress', 'Candidates can impress interviewers by researching the company carefully.', ['Applicants can win the respect of the panel by finding out a lot about the firm beforehand.', 'Studying the company with care makes it possible for candidates to earn admiration from the people asking the questions.', 'By learning plenty about the business first, people attending the meeting can make a strong positive effect.'], 'cause_effect', 'by researching the company', [
    { text:'Candidates can impress interviewers by ignoring the company completely.', misconceptionCategory:'polarity_change' },
    { text:'Candidates can impress interviewers by arriving late and speaking quickly.', misconceptionCategory:'meaning_confusion' },
    { text:'Candidates can only impress interviewers by researching the company.', misconceptionCategory:'degree_change' }
  ], ['vocab_impress']),
  idea('respond', 'The company responded to all the applications within a week.', ['The firm gave an answer to every application in seven days or less.', 'Within a week, every application had received a reply from the company.', 'All of the forms that were sent in were answered by the business in under seven days.'], 'quantity', 'all the applications', [
    { text:'The company responded to some of the applications within a week.', misconceptionCategory:'quantity_change' },
    { text:'The company responded to all the applications after a month.', misconceptionCategory:'time_change' },
    { text:'The company rejected all the applications within a week.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_respond_7']),
  idea('relevant', 'The interviewer asked the candidate to give only relevant examples.', ['The person asking the questions wanted the applicant to use only examples connected to the subject.', 'The candidate was told by the interviewer to include nothing that did not relate to the question.', 'Only examples that were useful for the topic were wanted by the one conducting the meeting.'], 'quantity', 'only', [
    { text:'The interviewer asked the candidate to give many examples, relevant or not.', misconceptionCategory:'omitted_information' },
    { text:'The candidate asked the interviewer to give only relevant examples.', misconceptionCategory:'meaning_confusion' },
    { text:'The interviewer asked the candidate to give only recent examples.', misconceptionCategory:'time_change' }
  ], ['vocab_relevant_7']),
  idea('contribute', 'Every candidate was asked to contribute at least one idea to the group task.', ['All of the candidates had to offer a minimum of one idea during the group exercise.', 'Each person at the assessment was required to add at least a single suggestion to the team activity.', 'The group task required one or more ideas from every single candidate.'], 'quantity', 'at least one', [
    { text:'Every candidate was asked to contribute no more than one idea to the group task.', misconceptionCategory:'quantity_change' },
    { text:'Some candidates were asked to contribute at least one idea to the group task.', misconceptionCategory:'quantity_change' },
    { text:'Every candidate was asked to contribute at least one question to the group task.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_contribute']),
  idea('coherent', 'The candidate gave a coherent answer to every question.', ['The applicant replied to each question in a clear and logical way.', 'Every question received an answer from the candidate that was well organised and easy to follow.', 'For all of the questions, the candidate’s replies had ideas that fitted together sensibly.'], 'quantity', 'every question', [
    { text:'The candidate gave a coherent answer to only one question.', misconceptionCategory:'quantity_change' },
    { text:'The candidate gave a confusing answer to every question.', misconceptionCategory:'polarity_change' },
    { text:'The candidate gave a coherent answer to none of the questions.', misconceptionCategory:'quantity_change' }
  ], ['vocab_coherent']),
  idea('implication', 'The implication of her silence was that she disagreed with the decision.', ['Her silence suggested, without saying so, that she did not agree with the decision.', 'Although she said nothing, it seemed from her silence that she was against the decision.', 'By staying quiet, she showed indirectly that she disagreed with what had been decided.'], 'degree', 'suggested, not stated', [
    { text:'She said clearly that she disagreed with the decision.', misconceptionCategory:'degree_change' },
    { text:'The implication of her silence was that she agreed with the decision.', misconceptionCategory:'polarity_change' },
    { text:'The implication of her speech was that she disagreed with the decision.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_implication']),
  idea('register', 'Candidates should use a formal register in an interview but a friendly one when chatting to the receptionist.', ['In the interview itself, applicants ought to speak in a formal style, though a more relaxed style suits a chat with the receptionist.', 'A formal level of language is right for the meeting, while friendly language is fine with the person at the front desk.', 'People attending the interview should be formal in the room and more relaxed when talking to the receptionist.'], 'comparison', 'formal versus friendly', [
    { text:'Candidates should use a friendly register in an interview but a formal one when chatting to the receptionist.', misconceptionCategory:'polarity_change' },
    { text:'Candidates should use a formal register everywhere, even with the receptionist.', misconceptionCategory:'omitted_information' },
    { text:'Candidates should use a loud voice in an interview but a quiet one when chatting to the receptionist.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_register']),
  idea('format', 'The format of the interview was a short talk followed by questions.', ['The interview was arranged as a brief talk and then some questions.', 'A short presentation came first in the interview, and questions came afterwards.', 'The pattern of the interview was a brief talk, with questions after it.'], 'time', 'followed by', [
    { text:'The format of the interview was questions followed by a short talk.', misconceptionCategory:'time_change' },
    { text:'The format of the interview was a short talk without any questions.', misconceptionCategory:'omitted_information' },
    { text:'The length of the interview was a short talk followed by questions.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_format']),
  idea('membership', 'Annual membership of the club costs less for students than for adults.', ['It is cheaper for students than for adults to belong to the club for a year.', 'Students pay a lower price than adults for a year of belonging to the club.', 'The yearly fee for being part of the club is smaller for students than adults.'], 'comparison', 'less for students than for adults', [
    { text:'Annual membership of the club costs more for students than for adults.', misconceptionCategory:'comparison_change' },
    { text:'Monthly membership of the club costs less for students than for adults.', misconceptionCategory:'time_change' },
    { text:'Annual membership of the club costs the same for students and for adults.', misconceptionCategory:'comparison_change' }
  ], ['vocab_membership']),
  idea('certificate', 'Every student who passes the final test will receive a certificate.', ['All the students who succeed in the last test will be given an official document.', 'An official paper will be handed to each student who gets through the final exam.', 'Anyone who passes the concluding test will get official proof that they succeeded.'], 'quantity', 'every student who passes', [
    { text:'Some students who pass the final test will receive a certificate.', misconceptionCategory:'quantity_change' },
    { text:'Every student who takes the final test will receive a certificate.', misconceptionCategory:'omitted_information' },
    { text:'Every student who passes the final test will receive a prize.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_certificate']),
  idea('qualification', 'Good communication is the most important qualification for the post of receptionist.', ['Being able to communicate well matters more than anything else for the receptionist’s job.', 'The skill that counts most for working as a receptionist is communicating well.', 'For the receptionist position, the quality needed above all others is good communication.'], 'degree', 'most important', [
    { text:'Good communication is the least important qualification for the post of receptionist.', misconceptionCategory:'polarity_change' },
    { text:'Good communication is one useful qualification for the post of receptionist.', misconceptionCategory:'degree_change' },
    { text:'Good communication is the most important qualification for the post of manager.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_qualification_7']),
  idea('experience', 'Employers often prefer candidates with practical experience to those with only qualifications.', ['Companies frequently choose people who have done the work in practice rather than those who only have exam results.', 'Applicants who have learned by doing tend to be favoured by firms over those who have only studied.', 'It is common for businesses to favour hands-on skill over a list of certificates.'], 'comparison', 'prefer experience to qualifications', [
    { text:'Employers often prefer candidates with only qualifications to those with practical experience.', misconceptionCategory:'comparison_change' },
    { text:'Employers never prefer candidates with practical experience to those with only qualifications.', misconceptionCategory:'quantity_change' },
    { text:'Employers often prefer candidates with practical hobbies to those with only qualifications.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_experience']),
  idea('confidence', 'Regular practice gives candidates the confidence to speak clearly in an interview.', ['Practising often helps applicants to believe they can speak clearly at an interview.', 'Applicants who practise regularly feel sure of themselves when they have to speak clearly in front of a panel.', 'By rehearsing frequently, people attending the meeting come to trust their own ability to speak clearly.'], 'cause_effect', 'regular practice gives belief in yourself', [
    { text:'Regular practice gives candidates the fear of speaking clearly in an interview.', misconceptionCategory:'polarity_change' },
    { text:'Occasional practice gives candidates the confidence to speak clearly in an interview.', misconceptionCategory:'quantity_change' },
    { text:'Regular practice gives candidates the confidence to write clearly in an interview.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_confidence_7']),
  idea('anxious', 'Many candidates feel anxious before an interview, but most relax once they begin to speak.', ['A lot of applicants are nervous in advance of a job meeting, yet the majority calm down as soon as they start talking.', 'Before the meeting, plenty of candidates are worried, though most feel easier after they begin to speak.', 'Nerves affect many candidates beforehand, but the greater part settle down when they start to talk.'], 'time', 'before ... once they begin', [
    { text:'Many candidates feel anxious after an interview, but most relax once they begin to speak.', misconceptionCategory:'time_change' },
    { text:'Few candidates feel anxious before an interview, but most relax once they begin to speak.', misconceptionCategory:'quantity_change' },
    { text:'Many candidates feel anxious before an interview, and most become more worried once they begin to speak.', misconceptionCategory:'polarity_change' }
  ], ['vocab_anxious_7']),
  idea('expertise', 'The panel looked for candidates with expertise in teaching and in management.', ['The people choosing wanted applicants with a high level of knowledge about both teaching and managing.', 'Candidates who were skilled in teaching and also in managing were what the panel wanted.', 'Specialist knowledge of teaching and of management was what the interviewers were hoping to find.'], 'quantity', 'both teaching and management', [
    { text:'The panel looked for candidates with expertise in teaching only.', misconceptionCategory:'omitted_information' },
    { text:'The panel avoided candidates with expertise in teaching and in management.', misconceptionCategory:'polarity_change' },
    { text:'The panel looked for candidates with a liking for teaching and for management.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_expertise']),
  idea('technique', 'The coach taught the candidates a technique for staying calm during interviews.', ['The candidates were shown a method by their coach for keeping calm in an interview.', 'A way of staying relaxed in interviews was taught to the candidates by the coach.', 'The coach showed those attending a skilful method for remaining calm when being interviewed.'], 'cause_effect', 'a technique for staying calm', [
    { text:'The coach taught the candidates a technique for becoming nervous during interviews.', misconceptionCategory:'polarity_change' },
    { text:'The coach taught the candidates a technique for staying calm during exams.', misconceptionCategory:'meaning_confusion' },
    { text:'The candidates taught the coach a technique for staying calm during interviews.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_technique_7']),
  idea('evaluate', 'The panel will evaluate each candidate against the same criteria.', ['Every candidate will be judged by the panel using identical standards.', 'The panel is going to assess all applicants by applying the very same measures.', 'Each of the people attending will be assessed by the panel according to one shared set of standards.'], 'comparison', 'the same criteria', [
    { text:'The panel will evaluate each candidate against different criteria.', misconceptionCategory:'comparison_change' },
    { text:'The panel will evaluate only some candidates against the same criteria.', misconceptionCategory:'quantity_change' },
    { text:'The panel will announce each candidate against the same criteria.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_evaluate_7']),
  idea('organise', 'Students should organise their notes before they begin to revise.', ['Learners ought to put their notes in a sensible order prior to starting revision.', 'Before beginning revision, students are advised to arrange their notes carefully.', 'It is wise for those studying to sort out their notes before they start going over them.'], 'time', 'before they begin to revise', [
    { text:'Students should organise their notes after they have finished revising.', misconceptionCategory:'time_change' },
    { text:'Students should destroy their notes before they begin to revise.', misconceptionCategory:'polarity_change' },
    { text:'Students should organise their friends before they begin to revise.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_organise']),
  idea('distribute', 'The manager will distribute the new rota to all staff on Monday.', ['The new rota will be given to every member of staff by the manager on Monday.', 'On Monday, the manager plans to hand the new rota out to all the workers.', 'All staff will receive the new rota from the manager at the start of the week.'], 'quantity', 'all staff', [
    { text:'The manager will distribute the new rota to some staff on Monday.', misconceptionCategory:'quantity_change' },
    { text:'The manager will distribute the new rota to all staff on Friday.', misconceptionCategory:'time_change' },
    { text:'The manager will collect the new rota from all staff on Monday.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_distribute']),
  idea('allocate', 'The school will allocate more time to speaking practice next year.', ['Next year, the school will set aside additional time for practice in speaking.', 'More lesson time will be given to speaking practice by the school in the coming year.', 'In the following year, the school will reserve a longer period for students to practise speaking.'], 'comparison', 'more time', [
    { text:'The school will allocate less time to speaking practice next year.', misconceptionCategory:'comparison_change' },
    { text:'The school allocated more time to speaking practice last year.', misconceptionCategory:'time_change' },
    { text:'The school will allocate more time to writing practice next year.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_allocate']),
  idea('responsible', 'Each team member is responsible for completing one part of the project.', ['Every person on the team has the duty to finish one section of the project.', 'The team is divided so that each member must complete a section of the project on their own.', 'One part of the project belongs to each member of the team, who must finish it.'], 'quantity', 'each team member, one part', [
    { text:'Some team members are responsible for completing one part of the project.', misconceptionCategory:'quantity_change' },
    { text:'Each team member is responsible for completing every part of the project.', misconceptionCategory:'quantity_change' },
    { text:'Each team member is interested in completing one part of the project.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_responsible']),
  idea('editor', 'The editor checked every article before the magazine was printed.', ['Before the magazine was printed, each article was read and checked by the person responsible for corrections.', 'All the articles were examined by the person in charge of the writing before printing.', 'Every piece in the magazine was looked over for mistakes before it went to print.'], 'quantity', 'every article', [
    { text:'The editor checked some articles before the magazine was printed.', misconceptionCategory:'quantity_change' },
    { text:'The editor checked every article after the magazine was printed.', misconceptionCategory:'time_change' },
    { text:'The writer checked every article before the magazine was printed.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_editor']),
  idea('proofread', 'Candidates should proofread their application before they send it.', ['Applicants ought to check their application for mistakes prior to sending it.', 'Before an application is sent off, the person applying should read it through and correct errors.', 'It is advisable for those applying to look for errors in their forms before posting them.'], 'time', 'before they send it', [
    { text:'Candidates should proofread their application after they send it.', misconceptionCategory:'time_change' },
    { text:'Candidates should rewrite their application before they send it.', misconceptionCategory:'meaning_confusion' },
    { text:'Candidates need not proofread their application before they send it.', misconceptionCategory:'polarity_change' }
  ], ['vocab_proofread']),
  idea('layout', 'A clear layout makes a CV easier to read.', ['A CV is simpler to read when the items on the page are arranged clearly.', 'If the items are placed in an organised way, a CV becomes easier to read.', 'Readers find a CV easier to understand when the page is arranged in a tidy way.'], 'cause_effect', 'a clear layout makes it easier', [
    { text:'A clear layout makes a CV harder to read.', misconceptionCategory:'polarity_change' },
    { text:'A clear layout makes a CV longer to read.', misconceptionCategory:'degree_change' },
    { text:'A clear layout makes a CV easier to write.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_layout']),
  idea('visual', 'Visual aids can help the audience to follow a presentation.', ['Pictures and diagrams can make it simpler for those listening to understand a talk.', 'Charts and images may help the listeners to keep up with the presentation.', 'A talk is easier for an audience to follow when things they can see are used.'], 'cause_effect', 'help the audience follow', [
    { text:'Visual aids can prevent the audience from following a presentation.', misconceptionCategory:'polarity_change' },
    { text:'Visual aids can help the speaker to follow a presentation.', misconceptionCategory:'meaning_confusion' },
    { text:'Visual aids always help the audience to follow a presentation.', misconceptionCategory:'degree_change' }
  ], ['vocab_visual']),
  idea('criteria', 'The panel judged every candidate according to the same criteria.', ['Each candidate was assessed by the panel using identical standards.', 'All of the people being interviewed were judged by the panel against one shared set of standards.', 'The panel applied exactly the same measures when assessing every applicant.'], 'comparison', 'the same criteria', [
    { text:'The panel judged every candidate according to different criteria.', misconceptionCategory:'comparison_change' },
    { text:'The panel judged only some candidates according to the same criteria.', misconceptionCategory:'quantity_change' },
    { text:'The panel rewarded every candidate according to the same criteria.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_criteria_7']),
  idea('accurate', 'Employers expect candidates to give accurate information on application forms.', ['Companies want applicants to put correct details on the forms they send in.', 'It is expected by employers that people applying will write exact and truthful details on forms.', 'Firms require that candidates fill in their application forms without errors.'], 'cause_effect', 'expect', [
    { text:'Employers expect candidates to give brief information on application forms.', misconceptionCategory:'degree_change' },
    { text:'Employers expect candidates to give accurate information in interviews.', misconceptionCategory:'meaning_confusion' },
    { text:'Employers do not expect candidates to give accurate information on application forms.', misconceptionCategory:'polarity_change' }
  ], ['vocab_accurate']),
  idea('punctuation', 'Poor punctuation can make a letter difficult to understand.', ['A letter can be hard to follow when the full stops and commas are used badly.', 'Using marks such as commas incorrectly may leave a letter confusing to read.', 'When commas and full stops are wrong, the reader can find a letter difficult to understand.'], 'cause_effect', 'poor punctuation can make a letter difficult', [
    { text:'Good punctuation can make a letter difficult to understand.', misconceptionCategory:'polarity_change' },
    { text:'Poor spelling can make a letter difficult to understand.', misconceptionCategory:'meaning_confusion' },
    { text:'Poor punctuation always makes a letter impossible to understand.', misconceptionCategory:'degree_change' }
  ], ['vocab_punctuation'])
];

export default [...phraseSets, ...ideaSets];
