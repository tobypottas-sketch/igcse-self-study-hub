// Unit 10 · Word Families — authored families, WORDS 1–48 (complete). Same contract as unit-09-word-families.js: every row is AUTHORED (stated part of
// speech, one natural example containing the form exactly once and not as the first word, and the reason the form is worth teaching). A family
// needs >= 3 pedagogically useful forms INCLUDING the headword and >= 2 parts of speech. Headwords with no genuine family are listed under
// unit10WordFamilyRejected rather than padded with unnatural forms.
const f = (form, partOfSpeech, example, why, note) => ({ form, partOfSpeech, example, why, ...(note ? { note } : {}) });

export const unit10WordFamilies = Object.freeze({
  education: { forms: [
    f('education', 'noun', 'Every child deserves a good education.', 'Headword.'),
    f('educate', 'verb', 'The campaign aims to educate young people about healthy eating.', 'The base verb; used for teaching people about an issue.'),
    f('educational', 'adjective', 'The museum offers educational tours for school groups.', 'The adjective for things that teach; very common in reviews and reports.')
  ], excludedForms: [{ form: 'educated', reason: 'Useful but close to educational for learners; one adjective slot is enough here.' }] },
  academic: { forms: [
    f('academic', 'adjective', 'Her academic results have improved this year.', 'Headword.'),
    f('academy', 'noun', 'He trained at a famous football academy in Madrid.', 'The noun for a school or training centre; common in school names.'),
    f('academically', 'adverb', 'The school is academically successful and sends many students to university.', 'The adverb used to describe success in study.')
  ], excludedForms: [] },
  literacy: { forms: [
    f('literacy', 'noun', 'The charity works to improve adult literacy.', 'Headword.'),
    f('literate', 'adjective', 'By the age of seven, most children are fully literate.', 'The adjective for someone who can read and write.'),
    f('illiterate', 'adjective', 'Many of the villagers were illiterate until the school opened.', 'The opposite adjective; common in texts about education and development.')
  ], excludedForms: [{ form: 'illiteracy', reason: 'Less frequent than the adjective for this level.' }] },
  assessment: { forms: [
    f('assessment', 'noun', 'The final assessment is a speaking test.', 'Headword.'),
    f('assess', 'verb', 'Teachers assess each project using the same criteria.', 'The base verb; frequent in school and exam language.'),
    f('assessor', 'noun', 'An external assessor will visit to check the marking.', 'The person who judges work; used in exams and training.')
  ], excludedForms: [] },
  progress: { forms: [
    f('progress', 'noun', 'The class has made good progress this term.', 'Headword.'),
    f('progressive', 'adjective', 'The school is known for its progressive teaching methods.', 'The adjective for modern ideas, or for gradual change.'),
    f('progression', 'noun', 'The course offers a clear progression from beginner to advanced level.', 'The noun for moving step by step from one stage to the next.')
  ], excludedForms: [{ form: 'progress (verb)', reason: 'Same spelling as the noun; the stress change is taught in the teacher note.' }] },
  encourage: { forms: [
    f('encourage', 'verb', 'Good coaches encourage players to learn from mistakes.', 'Headword.'),
    f('encouragement', 'noun', 'With a little encouragement, she joined the choir.', 'The noun; common in phrases like give encouragement.'),
    f('encouraging', 'adjective', 'The first test results are very encouraging.', 'The adjective for something that gives hope.')
  ], excludedForms: [{ form: 'discourage', reason: 'An opposite rather than a form; taught as a boundary word.' }] },
  reflect: { forms: [
    f('reflect', 'verb', 'Students should reflect on their mistakes after each test.', 'Headword.'),
    f('reflection', 'noun', 'The diary is a space for reflection on your learning.', 'The noun; also used for an image in a mirror.'),
    f('reflective', 'adjective', 'She wrote a reflective essay about her year abroad.', 'The adjective for thoughtful writing or people.')
  ], excludedForms: [] },
  performance: { forms: [
    f('performance', 'noun', 'His performance in the exam was excellent.', 'Headword.'),
    f('perform', 'verb', 'The students will perform a play at the end of term.', 'The base verb; used for shows and for doing tasks.'),
    f('performer', 'noun', 'The street performer juggled five balls at once.', 'The person who performs; common in reviews.')
  ], excludedForms: [] },
  confidence: { forms: [
    f('confidence', 'noun', 'Practice gave her more confidence in speaking.', 'Headword.'),
    f('confident', 'adjective', 'He felt confident before the interview.', 'The adjective; essential for describing people.'),
    f('confidently', 'adverb', 'She answered every question confidently.', 'The adverb describing how someone acts.')
  ], excludedForms: [{ form: 'confidential', reason: 'Different meaning (secret); likely to confuse.' }] },
  contribute: { forms: [
    f('contribute', 'verb', 'Everyone should contribute ideas to the discussion.', 'Headword.'),
    f('contribution', 'noun', 'Thank you for your contribution to the project.', 'The noun; very frequent in formal writing.'),
    f('contributor', 'noun', 'Each contributor to the magazine is a student.', 'The person who gives something.')
  ], excludedForms: [] },
  preparation: { forms: [
    f('preparation', 'noun', 'Good preparation leads to good results.', 'Headword.'),
    f('prepare', 'verb', 'We need to prepare for the science test.', 'The base verb; very common.'),
    f('prepared', 'adjective', 'She felt well prepared for her presentation.', 'The adjective meaning ready.')
  ], excludedForms: [{ form: 'preparatory', reason: 'Formal and infrequent at this level.' }] },
  employment: { forms: [
    f('employment', 'noun', 'Many graduates find employment quickly.', 'Headword.'),
    f('employ', 'verb', 'The hotel will employ ten students this summer.', 'The base verb.'),
    f('employer', 'noun', 'My employer pays for my training course.', 'The person or company that gives work; key for job texts.')
  ], excludedForms: [{ form: 'employee', reason: 'Useful but the employer/employee pair was taught in Unit 8; one person noun is enough here.' }] },
  industry: { forms: [
    f('industry', 'noun', 'The film industry employs many young people.', 'Headword.'),
    f('industrial', 'adjective', 'The town has a large industrial area near the river.', 'The adjective; common in geography and history texts.'),
    f('industrialise', 'verb', 'The country began to industrialise in the nineteenth century.', 'The verb for developing factories; British spelling.')
  ], excludedForms: [{ form: 'industrious', reason: 'Different meaning (hard-working); likely to confuse.' }] },
  challenge: { forms: [
    f('challenge', 'noun', 'Learning a new language is a real challenge.', 'Headword.'),
    f('challenging', 'adjective', 'The final question was very challenging.', 'The adjective; very common for describing tasks.'),
    f('challenger', 'noun', 'The young challenger beat the champion in three sets.', 'The person who competes against a winner.')
  ], excludedForms: [] },
  reluctant: { forms: [
    f('reluctant', 'adjective', 'He was reluctant to speak in front of the class.', 'Headword.'),
    f('reluctance', 'noun', 'Her reluctance to ask for help surprised her teacher.', 'The noun; useful in formal writing.'),
    f('reluctantly', 'adverb', 'He reluctantly agreed to sing at the concert.', 'The adverb describing how someone acts.')
  ], excludedForms: [] },
  examination: { forms: [
    f('examination', 'noun', 'The examination lasts two hours.', 'Headword.'),
    f('examine', 'verb', 'The doctor will examine your arm carefully.', 'The base verb; used for careful checking.'),
    f('examiner', 'noun', 'The examiner asked me to describe my hometown.', 'The person who sets or marks an exam.')
  ], excludedForms: [{ form: 'examinee', reason: 'Rare; candidate is more common.' }] },
  presentation: { forms: [
    f('presentation', 'noun', 'Her presentation on recycling was excellent.', 'Headword.'),
    f('present', 'verb', 'Each group will present its findings to the class.', 'The base verb (stress on the second syllable).'),
    f('presenter', 'noun', 'The television presenter introduced the next guest.', 'The person who presents a show or talk.')
  ], excludedForms: [] },
  pronunciation: { forms: [
    f('pronunciation', 'noun', 'Her pronunciation has improved a lot.', 'Headword.'),
    f('pronounce', 'verb', 'How do you pronounce this word?', 'The base verb; note the spelling change in the noun.'),
    f('mispronounce', 'verb', 'Visitors often mispronounce the name of our town.', 'The verb for saying a word wrongly.')
  ], excludedForms: [] },
  accurately: { forms: [
    f('accurately', 'adverb', 'Measure each line accurately with a ruler.', 'Headword.'),
    f('accurate', 'adjective', 'The report gives an accurate picture of school life.', 'The adjective; very common.'),
    f('accuracy', 'noun', 'Examiners reward accuracy as well as range.', 'The noun; key in marking criteria.')
  ], excludedForms: [{ form: 'inaccurate', reason: 'Taught with accuracy in Unit 9.' }] },
  effectively: { forms: [
    f('effectively', 'adverb', 'She uses examples effectively in her essays.', 'Headword.'),
    f('effective', 'adjective', 'Mind maps are an effective way to revise.', 'The adjective; very common.'),
    f('effectiveness', 'noun', 'The school measured the effectiveness of the new timetable.', 'The noun; frequent in reports and evaluations.')
  ], excludedForms: [] },
  develop: { forms: [
    f('develop', 'verb', 'The course helps students develop their writing.', 'Headword.'),
    f('development', 'noun', 'The early years are important for a child’s development.', 'The noun; very frequent in formal writing.'),
    f('developed', 'adjective', 'Children in developed countries usually stay at school until eighteen.', 'The adjective used for countries and skills.')
  ], excludedForms: [{ form: 'developer', reason: 'Specialised (software, property); less useful here.' }] },
  communicate: { forms: [
    f('communicate', 'verb', 'We communicate with our partner school by email.', 'Headword.'),
    f('communication', 'noun', 'Good communication is essential in a team.', 'The noun; very frequent.'),
    f('communicative', 'adjective', 'Our teacher uses a communicative approach with lots of speaking.', 'The adjective for activities and people that share ideas.')
  ], excludedForms: [] },
  preference: { forms: [
    f('preference', 'noun', 'Do you have a preference for morning or afternoon classes?', 'Headword.'),
    f('prefer', 'verb', 'Most students prefer group work to working alone.', 'The base verb; note prefer + to.'),
    f('preferable', 'adjective', 'A short walk is preferable to a long bus ride.', 'The adjective meaning better or more suitable.')
  ], excludedForms: [] },
  achievement: { forms: [
    f('achievement', 'noun', 'Passing the exam was a great achievement.', 'Headword.'),
    f('achieve', 'verb', 'She worked hard to achieve her goals.', 'The base verb.'),
    f('achievable', 'adjective', 'Set yourself small, achievable targets each week.', 'The adjective; useful for goal-setting.')
  ], excludedForms: [{ form: 'achiever', reason: 'Less frequent; mainly in high achiever.' }] },
  qualification: { forms: [
    f('qualification', 'noun', 'A degree is a useful qualification.', 'Headword.'),
    f('qualify', 'verb', 'She hopes to qualify as a nurse next year.', 'The base verb.'),
    f('qualified', 'adjective', 'Only qualified teachers can work at the school.', 'The adjective meaning having the right certificate.')
  ], excludedForms: [] },
  succeed: { forms: [
    f('succeed', 'verb', 'With hard work, you will succeed.', 'Headword.'),
    f('success', 'noun', 'The concert was a great success.', 'The noun; very frequent.'),
    f('successful', 'adjective', 'He runs a successful business in the city.', 'The adjective; essential for writing.')
  ], excludedForms: [{ form: 'successfully', reason: 'Useful but three forms already cover the family.' }] }
});

export const unit10WordFamilyRejected = Object.freeze({
  'higher education': 'A fixed noun phrase; its family belongs to education.',
  university: 'No useful related forms at this level.',
  recreation: 'Only recreational is useful; recreate has a different meaning.',
  'international crisis': 'A noun phrase; crisis/critical are not a usable family for this sense.',
  'digital device': 'A noun phrase with no family of its own.',
  condition: 'Its adjective conditional is a separate Unit 10 target, so the family would teach the same target twice.',
  conditional: 'A grammar term; its family belongs to condition.',
  career: 'No useful related forms.',
  subject: 'Related forms (subjective) have a different meaning.',
  aspect: 'No useful related forms.',
  interview: 'All useful forms (interviewer, interviewee) are nouns, so there are not two parts of speech.',
  overseas: 'One form serves as adjective and adverb.',
  cosmopolitan: 'No useful related forms at this level.',
  assignment: 'Only assign is useful; two forms are not enough.',
  loneliness: 'Only lonely is useful; lone is rare at this level.',
  opportunity: 'No useful related forms at this level.',
  research: 'The noun and verb share one spelling; researcher alone does not make a family.',
  intonation: 'No useful related forms.',
  vocabulary: 'No related forms.',
  evaluate: 'Only evaluation is useful at this level.',
  opinion: 'No useful related forms (opinionated is rare and negative).',
  discussion: 'Only discuss is useful; two forms are not enough.'
});
