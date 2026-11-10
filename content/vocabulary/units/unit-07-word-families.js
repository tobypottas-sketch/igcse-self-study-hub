// Unit 7 · Word Families — authored families, WORDS 1–50 (complete). Same contract as unit-06-word-families.js: every row is AUTHORED (stated part of
// speech, one natural example containing the form exactly once and not as the first word, and the reason the form is worth teaching). A family
// needs >= 3 pedagogically useful forms INCLUDING the headword and >= 2 parts of speech. Headwords with no genuine family are listed under
// unit7WordFamilyRejected rather than padded with unnatural forms.
const f = (form, partOfSpeech, example, why, note) => ({ form, partOfSpeech, example, why, ...(note ? { note } : {}) });

export const unit7WordFamilies = Object.freeze({
  applicant: { forms: [
    f('applicant', 'noun', 'The company will contact every applicant before the end of the month.', 'Headword.'),
    f('application', 'noun', 'Her application included a letter, a CV and the names of two referees.', 'The thing the applicant sends; used constantly in the vocabulary of jobs and courses.'),
    f('apply', 'verb', 'Students who want to study abroad must apply before the end of January.', 'The verb for making the formal request; it is the base of the family.')
  ], excludedForms: [{ form: 'applicable', reason: 'A different sense: relevant or suitable for a particular case.' }] },
  combine: { forms: [
    f('combine', 'verb', 'Many students combine a part-time job with their studies.', 'Headword.'),
    f('combination', 'noun', 'A combination of good grades and practical experience impressed the panel.', 'The noun for the mixture; very frequent in writing about skills and qualities.'),
    f('combined', 'adjective', 'The combined efforts of the whole team won the contract.', 'The adjective for joined together; common in formal writing.')
  ], excludedForms: [{ form: 'combo', reason: 'Informal word that is not suitable for exam writing.' }] },
  voluntary: { forms: [
    f('voluntary', 'adjective', 'Many charities rely on voluntary help from local people.', 'Headword.'),
    f('voluntarily', 'adverb', 'He left the room voluntarily, so nobody had to ask him twice.', 'The adverb for doing something by choice; less frequent but useful in formal writing.'),
    f('volunteer', 'noun', 'A volunteer at the hospital reads to patients every Tuesday.', 'The person who works by choice; far more frequent than the adjective in everyday speech.')
  ], excludedForms: [{ form: 'volunteer (verb)', reason: 'Taught as a use of the same form; the noun is the most useful meaning here.' }] },
  frequent: { forms: [
    f('frequent', 'adjective', 'Taking frequent breaks makes it easier to concentrate on a long task.', 'Headword.'),
    f('frequently', 'adverb', 'Interviewers frequently ask candidates to describe a time when they solved a problem.', 'The adverb; very common in academic and exam writing.'),
    f('frequency', 'noun', 'The frequency of trains increases during the morning rush hour.', 'The noun for how often something happens; useful in describing data and charts.')
  ], excludedForms: [{ form: 'infrequent', reason: 'Negative form that is much less common at this level.' }] },
  enthusiastic: { forms: [
    f('enthusiastic', 'adjective', 'The audience gave an enthusiastic round of applause at the end of the talk.', 'Headword.'),
    f('enthusiasm', 'noun', 'Her enthusiasm for science made every lesson more interesting for her classmates.', 'The noun for the feeling; very frequent in references and personal statements.'),
    f('enthusiastically', 'adverb', 'He answered every question enthusiastically and never looked at the clock.', 'The adverb for describing how someone speaks or acts.')
  ], excludedForms: [{ form: 'enthusiast', reason: 'A different word: a person who is very keen on a particular activity (a football enthusiast).' }] },
  availability: { forms: [
    f('availability', 'noun', 'Please send your availability for the week after the holiday.', 'Headword.'),
    f('available', 'adjective', 'The manager will be available to meet candidates after two o’clock.', 'The adjective; the most frequent form in emails and messages about arranging meetings.'),
    f('unavailable', 'adjective', 'The head of department is unavailable on Monday because she is visiting another school.', 'The negative adjective; common when explaining that someone cannot attend.')
  ], excludedForms: [{ form: 'availably', reason: 'Not a real word; the adverb form is not used in English.' }] },
  dominate: { forms: [
    f('dominate', 'verb', 'A few large firms dominate the online shopping market.', 'Headword.'),
    f('dominant', 'adjective', 'The dominant member of the group did most of the talking in the task.', 'The adjective for the strongest or most powerful; very frequent in academic writing.'),
    f('dominance', 'noun', 'The company’s dominance of the market made it difficult for new businesses to start.', 'The noun for strong control; useful in formal descriptions of power and influence.')
  ], excludedForms: [{ form: 'domination', reason: 'A less frequent noun that suggests control by force; dominance is more useful.' }] },
  strategy: { forms: [
    f('strategy', 'noun', 'A clear strategy can help you to stay calm during an interview.', 'Headword.'),
    f('strategic', 'adjective', 'The manager made a strategic decision to open an office in a larger city.', 'The adjective for something planned to achieve a long-term goal; common in business English.'),
    f('strategically', 'adverb', 'The team positioned the tables strategically so that every customer could see the stage.', 'The adverb; common in business and sport.')
  ], excludedForms: [{ form: 'strategist', reason: 'A person who plans strategy; rare at this level.' }] },
  flexible: { forms: [
    f('flexible', 'adjective', 'Employers value people who are flexible and ready to learn new skills.', 'Headword.'),
    f('flexibility', 'noun', 'The job offers flexibility, so employees can choose when they start and finish.', 'The noun for the quality; very frequent in job advertisements.'),
    f('flexibly', 'adverb', 'The team worked flexibly, so some members stayed late and others came in early.', 'The adverb for working or planning in an adaptable way.')
  ], excludedForms: [{ form: 'inflexible', reason: 'Negative form; less frequent and not needed at this stage.' }] },
  expectation: { forms: [
    f('expectation', 'noun', 'The headteacher explained the school’s expectation about behaviour on the first day.', 'Headword.'),
    f('expect', 'verb', 'You can expect three or four questions about your experience in the interview.', 'The verb for believing something will happen; the base of the family.'),
    f('expected', 'adjective', 'The expected result was a pass, but she received a distinction.', 'The adjective for something that was thought likely to happen; common in reports.')
  ], excludedForms: [{ form: 'unexpected', reason: 'Negative form that is useful but belongs to a later unit and is not needed here.' }] },
  impress: { forms: [
    f('impress', 'verb', 'A polite email can impress a busy manager.', 'Headword.'),
    f('impression', 'noun', 'A good first impression can make a long interview much easier.', 'The noun for the effect on another person; frequent in advice about interviews.'),
    f('impressive', 'adjective', 'Her CV was impressive, with three languages and two years of voluntary work.', 'The adjective for something that earns admiration; very common in references.')
  ], excludedForms: [{ form: 'impressed', reason: 'A participle adjective that can be taught later; the adjective impressive is more useful here.' }] },
  respond: { forms: [
    f('respond', 'verb', 'Please respond to the invitation by the end of the week.', 'Headword.'),
    f('response', 'noun', 'The company was delighted with the response to its job advertisement.', 'The noun for the answer or reaction; very frequent in emails and reports.'),
    f('responsive', 'adjective', 'A responsive manager answers questions quickly and listens to what staff say.', 'The adjective for quick to answer or react; useful in references and reviews.')
  ], excludedForms: [{ form: 'responsible', reason: 'A different word and a separate target in this unit.' }] },
  relevant: { forms: [
    f('relevant', 'adjective', 'Choose examples that are relevant to the job you want.', 'Headword.'),
    f('relevance', 'noun', 'The relevance of her work experience was obvious to the panel.', 'The noun for how closely something is connected; frequent in academic writing.'),
    f('irrelevant', 'adjective', 'The detail about his holiday was irrelevant to the question about teamwork.', 'The negative adjective; very frequent when giving feedback on answers.')
  ], excludedForms: [{ form: 'relevantly', reason: 'Rare adverb that is not needed at this level.' }] },
  contribute: { forms: [
    f('contribute', 'verb', 'Every member of the team can contribute something useful.', 'Headword.'),
    f('contribution', 'noun', 'Her contribution to the discussion helped the group to reach a decision.', 'The noun for what is given; very frequent in academic and workplace English.'),
    f('contributor', 'noun', 'The main contributor to the school magazine is a student in Year 10.', 'The noun for the person who contributes; common in descriptions of teams and publications.')
  ], excludedForms: [{ form: 'contributory', reason: 'A rare adjective used mainly in law and medicine.' }] },
  coherent: { forms: [
    f('coherent', 'adjective', 'A coherent plan makes it easier for everyone in the team to know what to do.', 'Headword.'),
    f('coherence', 'noun', 'The examiner praised the coherence of the whole essay.', 'The noun for logical connection; frequent in feedback on writing and speaking.'),
    f('coherently', 'adverb', 'She spoke coherently, even though the question was unexpected.', 'The adverb for speaking or writing in a clear and logical way.')
  ], excludedForms: [{ form: 'incoherent', reason: 'Negative form; useful but less frequent at this level.' }] },
  certificate: { forms: [
    f('certificate', 'noun', 'The college sends a certificate to every student who completes the course.', 'Headword.'),
    f('certify', 'verb', 'The doctor will certify that the applicant is fit to work.', 'The verb for officially stating that something is true; used in formal documents.'),
    f('certified', 'adjective', 'Only certified instructors are allowed to teach the diving class.', 'The adjective for officially approved; common in job advertisements.')
  ], excludedForms: [{ form: 'certainty', reason: 'A different word that belongs to the family of certain, not to this one.' }] },
  qualification: { forms: [
    f('qualification', 'noun', 'A friendly manner is a useful qualification for working with customers.', 'Headword.'),
    f('qualify', 'verb', 'You must pass the exam before you qualify as a teacher.', 'The verb for becoming suitable or allowed to do something; the base of the family.'),
    f('qualified', 'adjective', 'The school is looking for a qualified science teacher.', 'The adjective for having the right training; very frequent in job advertisements.')
  ], excludedForms: [{ form: 'unqualified', reason: 'Negative form; less frequent and not needed at this stage.' }] },
  experience: { forms: [
    f('experience', 'noun', 'Previous experience in a similar job will help you to settle in quickly.', 'Headword.'),
    f('experienced', 'adjective', 'The company is looking for an experienced manager to lead the new department.', 'The adjective for having a lot of practical knowledge; very frequent in job advertisements.'),
    f('inexperienced', 'adjective', 'Employers must train inexperienced workers carefully before they deal with customers.', 'The negative adjective; common when describing new workers.')
  ], excludedForms: [{ form: 'experiential', reason: 'A rare adjective used mainly in educational theory.' }] },
  confidence: { forms: [
    f('confidence', 'noun', 'Good preparation gives you confidence on the day of the interview.', 'Headword.'),
    f('confident', 'adjective', 'He felt confident that he could answer any question about teamwork.', 'The adjective for believing in your own ability; the most frequent form in interview advice.'),
    f('confidently', 'adverb', 'She walked confidently into the room and shook hands with the panel.', 'The adverb for speaking or acting with belief in yourself.')
  ], excludedForms: [{ form: 'confide', reason: 'A different sense: to tell a secret to someone you trust.' }] },
  anxious: { forms: [
    f('anxious', 'adjective', 'Many applicants feel anxious when they wait outside the interview room.', 'Headword.'),
    f('anxiety', 'noun', 'Slow breathing can help to reduce anxiety before a speaking test.', 'The noun for the feeling; frequent in advice and in health writing.'),
    f('anxiously', 'adverb', 'She waited anxiously by the telephone for the result of the interview.', 'The adverb for waiting or watching with worry.')
  ], excludedForms: [{ form: 'anxiousness', reason: 'A rare noun; anxiety is the usual word.' }] },
  organise: { forms: [
    f('organise', 'verb', 'A teacher can help students to organise their revision into small topics.', 'Headword.'),
    f('organisation', 'noun', 'The organisation of the interview day was excellent, and nobody had to wait long.', 'The noun for the planning of something or for a group such as a company.'),
    f('organised', 'adjective', 'She is a very organised person who always keeps her notes in order.', 'The adjective for being tidy and well planned; very frequent in references and job advertisements.')
  ], excludedForms: [{ form: 'organism', reason: 'A different word from biology that has nothing to do with planning.' }] },
  distribute: { forms: [
    f('distribute', 'verb', 'Volunteers will distribute the leaflets in the town centre on Saturday.', 'Headword.'),
    f('distribution', 'noun', 'The distribution of the exam papers began exactly at nine o’clock.', 'The noun for giving out or sharing; frequent in reports and notices.'),
    f('distributor', 'noun', 'The distributor delivers fresh fruit to more than two hundred shops.', 'The noun for the person or company that supplies goods to shops.')
  ], excludedForms: [{ form: 'redistribute', reason: 'A less frequent verb that is not needed at this level.' }] },
  responsible: { forms: [
    f('responsible', 'adjective', 'The manager is responsible for the safety of everyone in the building.', 'Headword.'),
    f('responsibility', 'noun', 'Looking after the money was a big responsibility for such a young worker.', 'The noun for a duty; very frequent in job descriptions and references.'),
    f('irresponsible', 'adjective', 'It would be irresponsible to leave young children alone in the room.', 'The negative adjective; useful in discussion and opinion writing.')
  ], excludedForms: [{ form: 'responsibly', reason: 'A less frequent adverb that is not needed at this stage.' }] },
  visual: { forms: [
    f('visual', 'adjective', 'A visual summary of the data helped the committee to understand the problem quickly.', 'Headword.'),
    f('visually', 'adverb', 'The poster was visually attractive, with a bold title and a clear picture.', 'The adverb; common in design and presentation language.'),
    f('visualise', 'verb', 'It helps to visualise yourself giving a calm answer before the interview.', 'The verb for forming a picture in your mind; useful in advice for interviews.')
  ], excludedForms: [{ form: 'visualisation', reason: 'A less frequent noun that is not needed at this level.' }] },
  accurate: { forms: [
    f('accurate', 'adjective', 'The report gave an accurate account of what had happened at the meeting.', 'Headword.'),
    f('accuracy', 'noun', 'The accuracy of the figures is more important than the speed of the report.', 'The noun for being correct; very frequent in exam and academic writing.'),
    f('accurately', 'adverb', 'She described the diagram accurately and did not miss a single detail.', 'The adverb for doing something without mistakes.')
  ], excludedForms: [{ form: 'inaccurate', reason: 'The negative adjective is useful but belongs to a later stage.' }] }
});

export const unit7WordFamilyRejected = Object.freeze({
  qualifications: 'The only related forms are the singular qualification, which is a separate target in this unit, and qualify and qualified, which are taught with the singular; adding them here would repeat the same family.',
  demonstrate: 'Demonstration and demonstrator are available, but the noun often means a public protest or a classroom display, and demonstrator drifts away from the interview sense; two usable forms are not enough for a family.',
  summary: 'Summarise is a Unit 6 target and summarily is rare and has a different meaning, so the family would add only one new form and repeat an earlier target.',
  overview: 'No related form is needed by learners; the verb overview is rare, and the pieces over and view are separate words, so overview stands alone.',
  candidate: 'Candidacy is rare and used mainly in politics, and candid is a different word with a different meaning, so candidate stands alone.',
  interviewer: 'Interview and interviewee are closely related, but interviewee is its own target in this unit and interview is the base word, so the family would repeat other entries in the same unit.',
  interviewee: 'The only related words are interview and interviewer, which are the base word and a separate target in the same unit, so a family here would repeat other entries.',
  referee: 'Refer and reference are related, but they carry different senses (to mention; the written statement) and reference is a separate target in this unit, so a family would mix meanings.',
  reference: 'Refer is a verb with a different sense (to mention or to send someone to), and referee is a separate target in this unit, so reference has no family that fits this meaning.',
  proficiency: 'Proficient is the only other useful form, and proficiently is rare at this level, so two forms are not enough for a family.',
  compromise: 'The verb and the noun have the same spelling, and compromising is a rare adjective with another sense, so there are no separate family forms worth teaching at this level.',
  schedule: 'Scheduled is a plain participle and scheduling is a gerund, so neither adds a new word with its own meaning; schedule stands alone at this level.',
  implication: 'Imply and implicit are related, but the nearest forms drift towards different grammar patterns and are less frequent at this level, so implication stands alone.',
  register: 'Registration and registered belong to the other meaning of the word (an official list), so they would mix senses; no family form belongs to the language meaning taught here.',
  format: 'Formal, formula and formation start with the same letters but are different words, and the verb format is a technical use, so no family form fits this meaning.',
  membership: 'Member is the only related word and it names a person rather than a state, so the family has only two forms, and the suffix -ship does not make a pattern that learners need at this level.',
  expertise: 'Expert is the only related word, and it can be a noun or an adjective, but with expertise there are only two forms and no clear third, so a three-form family is not available.',
  technique: 'Technical and technician are related to other senses (machines and skilled workers) and do not describe a method of doing something, so no family form fits this meaning.',
  evaluate: 'Evaluation is the only other useful form, and evaluative and evaluator are rare at this level, so there are not enough forms for a family.',
  allocate: 'Allocation is the only other form, and the family has only two members, so it cannot meet the three-form rule.',
  editor: 'Edit and editorial are related, but they involve slightly different senses (to correct; relating to the opinion page of a newspaper), so there is no clear family that supports this meaning.',
  proofread: 'Proofreader is the only related form, and the word is a compound verb with no useful adjective or adverb, so there is no family to teach.',
  layout: 'Layout is a compound noun with no related forms; lay out is a phrasal verb with a different grammar pattern, so a family is not available.',
  criteria: 'Criterion is only the singular form of the same word, so the word has no further family forms to teach.',
  punctuation: 'Punctuate and punctual are related by spelling, but punctual means arriving on time and punctuate is rare, so a family would mix meanings.'
});
