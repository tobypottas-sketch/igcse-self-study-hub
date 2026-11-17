// Unit 8 · Word Families — authored families, WORDS 1–50 (complete). Same contract as unit-07-word-families.js: every row is AUTHORED (stated part of
// speech, one natural example containing the form exactly once and not as the first word, and the reason the form is worth teaching). A family
// needs >= 3 pedagogically useful forms INCLUDING the headword and >= 2 parts of speech. Headwords with no genuine family are listed under
// unit8WordFamilyRejected rather than padded with unnatural forms.
const f = (form, partOfSpeech, example, why, note) => ({ form, partOfSpeech, example, why, ...(note ? { note } : {}) });

export const unit8WordFamilies = Object.freeze({
  architecture: { forms: [
    f('architecture', 'noun', 'She is interested in modern architecture and visits a new building every month.', 'Headword.'),
    f('architect', 'noun', 'The architect showed the clients a model of the new school.', 'The person who designs buildings; a key job title in this unit.'),
    f('architectural', 'adjective', 'The old station has great architectural value, so it cannot be knocked down.', 'The adjective used to describe buildings and their design.')
  ], excludedForms: [{ form: 'architecturally', reason: 'A rare adverb that learners do not need at this level.' }] },
  availability: { forms: [
    f('availability', 'noun', 'The shop checks the availability of each item every morning.', 'Headword.'),
    f('available', 'adjective', 'Spare parts for this machine are no longer available in Europe.', 'The adjective learners use most often; the base of the family.'),
    f('unavailable', 'adjective', 'The manager was unavailable all morning because of a long meeting.', 'The negative adjective; common in workplace messages.')
  ], excludedForms: [] },
  concerned: { forms: [
    f('concerned', 'adjective', 'The teacher was concerned about the student’s falling grades.', 'Headword.'),
    f('concern', 'noun', 'Safety is the main concern of everyone who works on the building site.', 'The noun for a worry; very common in formal writing.'),
    f('unconcerned', 'adjective', 'He seemed completely unconcerned about the deadline, which annoyed his team.', 'The negative adjective; useful for describing attitude.')
  ], excludedForms: [{ form: 'concerning', reason: 'Mostly used as a preposition meaning "about", which is a different job in the sentence.' }] },
  complicated: { forms: [
    f('complicated', 'adjective', 'The new booking system is too complicated for most customers.', 'Headword.'),
    f('complicate', 'verb', 'Bad weather may complicate the delivery of the new machines.', 'The verb: to make something more difficult to deal with.'),
    f('complication', 'noun', 'A small complication with the contract delayed the start of the project.', 'The noun for a problem that makes a situation harder.')
  ], excludedForms: [] },
  development: { forms: [
    f('development', 'noun', 'The development of the new app took eighteen months.', 'Headword.'),
    f('develop', 'verb', 'The company plans to develop a cheaper electric car.', 'The verb; the base of the family.'),
    f('developer', 'noun', 'Rosa works as a software developer for a games company.', 'The person or company that creates new products; a common job title.')
  ], excludedForms: [{ form: 'developmental', reason: 'A technical adjective used mainly about child growth.' }] },
  established: { forms: [
    f('established', 'adjective', 'The museum works with established artists from many countries.', 'Headword.'),
    f('establish', 'verb', 'The two brothers hope to establish their own building company.', 'The verb: to start or set up something that will last.'),
    f('establishment', 'noun', 'The hotel is a family establishment that has welcomed guests for decades.', 'The noun for an organisation or business; formal but common in writing.')
  ], excludedForms: [] },
  humanity: { forms: [
    f('humanity', 'noun', 'Scientists are working to protect the future of humanity.', 'Headword.'),
    f('human', 'adjective', 'Every machine in the factory is checked by a human inspector as well as a computer.', 'The adjective (also a noun) for people; the base of the family.'),
    f('humanitarian', 'adjective', 'The charity sends humanitarian aid to countries hit by floods.', 'The adjective for helping people who are suffering; common in news writing.')
  ], excludedForms: [{ form: 'humane', reason: 'Means kind to people or animals; a different sense that would confuse the family.' }] },
  innovation: { forms: [
    f('innovation', 'noun', 'The company has a reputation for innovation in design.', 'Headword.'),
    f('innovate', 'verb', 'Businesses must innovate if they want to stay ahead.', 'The verb: to introduce new ideas or methods.'),
    f('innovative', 'adjective', 'The architect is famous for her innovative use of glass.', 'The adjective; very useful for describing designs and people.')
  ], excludedForms: [{ form: 'innovator', reason: 'Useful but less frequent; it would add a rarer fourth form.' }] },
  inspiration: { forms: [
    f('inspiration', 'noun', 'Nature is a great source of inspiration for many artists.', 'Headword.'),
    f('inspire', 'verb', 'Good teachers inspire their students to work hard.', 'The verb: to give someone ideas or the wish to act.'),
    f('inspiring', 'adjective', 'The speaker told an inspiring story about starting her own business.', 'The adjective for something that makes you want to act.')
  ], excludedForms: [{ form: 'inspirational', reason: 'Close in meaning to inspiring and less frequent, so it would add little.' }] },
  inspectors: { forms: [
    f('inspectors', 'noun', 'The inspectors spent two days checking the new hospital.', 'Headword.'),
    f('inspect', 'verb', 'A mechanic will inspect the brakes before the bus leaves.', 'The verb: to look at something carefully to check it.'),
    f('inspection', 'noun', 'The factory passed its safety inspection with no problems.', 'The noun for the check itself; very common in workplace language.')
  ], excludedForms: [] },
  instructor: { forms: [
    f('instructor', 'noun', 'The instructor showed us how to use the climbing ropes.', 'Headword.'),
    f('instruct', 'verb', 'The manager will instruct new staff on how to use the till.', 'The verb: to teach or tell someone formally what to do.'),
    f('instructions', 'noun', 'Read the instructions carefully before you use the machine.', 'The noun for the information that tells you what to do; extremely common.')
  ], excludedForms: [{ form: 'instructive', reason: 'A formal adjective meaning useful for learning; rare at this level.' }] },
  manufacturing: { forms: [
    f('manufacturing', 'noun', 'Jobs in manufacturing often involve working with heavy machines.', 'Headword.'),
    f('manufacture', 'verb', 'The factory can manufacture ten thousand bottles a day.', 'The verb: to make goods in large numbers.'),
    f('manufacturer', 'noun', 'The manufacturer offered to replace the faulty washing machine.', 'The company that makes the goods; common on labels and in complaints.')
  ], excludedForms: [] },
  packaging: { forms: [
    f('packaging', 'noun', 'The supermarket wants to cut the amount of plastic packaging it uses.', 'Headword.'),
    f('pack', 'verb', 'Workers pack the biscuits into boxes at the end of the line.', 'The verb: to put goods into boxes or containers.'),
    f('package', 'noun', 'A package arrived at the office this morning.', 'The noun for a wrapped parcel; common at work and in online shopping.')
  ], excludedForms: [{ form: 'packet', reason: 'A small container for food; related in origin but taught as everyday vocabulary rather than a family form.' }] },
  presented: { forms: [
    f('presented', 'verb', 'The team presented their findings at the end of the course.', 'Headword.'),
    f('presentation', 'noun', 'Maria gave a short presentation about the new product.', 'The noun for a formal talk; essential at work and school.'),
    f('presenter', 'noun', 'The presenter thanked the audience and answered questions.', 'The person who gives the talk or hosts a programme.')
  ], excludedForms: [{ form: 'presentable', reason: 'Means tidy enough to be seen, which is a different sense.' }] },
  publicity: { forms: [
    f('publicity', 'noun', 'The new museum attracted a lot of publicity in its first week.', 'Headword.'),
    f('public', 'adjective', 'The council held a public meeting about the new factory.', 'The adjective for things open to everyone; the base of the family.'),
    f('publicise', 'verb', 'The school used posters to publicise the charity concert.', 'The verb: to make something known to many people (British spelling).')
  ], excludedForms: [{ form: 'publication', reason: 'Means a book or magazine, or the act of printing it, which is a different sense.' }] },
  qualified: { forms: [
    f('qualified', 'adjective', 'The company only employs qualified electricians.', 'Headword.'),
    f('qualify', 'verb', 'Doctors train for many years before they qualify.', 'The verb: to pass the exams or training needed for a job.'),
    f('unqualified', 'adjective', 'The report said that some unqualified workers had been doing dangerous jobs.', 'The negative adjective; useful when writing about safety and standards.')
  ], excludedForms: [{ form: 'qualification', reason: 'Already a target in Units 5 and 7, so it is not repeated as a family form here.' }] },
  regulations: { forms: [
    f('regulations', 'noun', 'All staff must follow the safety regulations.', 'Headword.'),
    f('regulate', 'verb', 'The government wants to regulate the use of drones.', 'The verb: to control something with rules.'),
    f('regulator', 'noun', 'The energy regulator fined the company for overcharging customers.', 'The official organisation that makes and checks rules for an industry.')
  ], excludedForms: [{ form: 'regular', reason: 'Means happening often or normal, which is a different sense.' }] },
  response: { forms: [
    f('response', 'noun', 'The manager gave a quick response to the customer’s email.', 'Headword.'),
    f('respond', 'verb', 'Please respond to the invitation by Friday.', 'The verb: to answer or react.'),
    f('responsive', 'adjective', 'The company is very responsive to customer complaints.', 'The adjective for reacting quickly and helpfully.')
  ], excludedForms: [] },
  responsible: { forms: [
    f('responsible', 'adjective', 'Pilots are responsible for the safety of their passengers.', 'Headword.'),
    f('responsibility', 'noun', 'Checking the stock is the responsibility of the night staff.', 'The noun for a duty; very common in job descriptions.'),
    f('responsibly', 'adverb', 'Employees are expected to use company phones responsibly.', 'The adverb for acting in a sensible, trustworthy way.')
  ], excludedForms: [{ form: 'irresponsible', reason: 'Useful, but it describes behaviour rather than job duties, so it is left with the Unit 7 sense.' }] },
  significant: { forms: [
    f('significant', 'adjective', 'The report found a significant fall in accidents at work.', 'Headword.'),
    f('significance', 'noun', 'The manager explained the significance of the new contract.', 'The noun for importance; useful in formal writing.'),
    f('significantly', 'adverb', 'Sales have improved significantly since the new website went live.', 'The adverb for describing large changes.')
  ], excludedForms: [{ form: 'insignificant', reason: 'The negative adjective is useful but would add a fourth form.' }] },
  specialise: { forms: [
    f('specialise', 'verb', 'She hopes to specialise in children’s medicine.', 'Headword.'),
    f('specialist', 'noun', 'The doctor sent him to a specialist at the city hospital.', 'The noun for an expert in one area; common in medicine and business.'),
    f('specialised', 'adjective', 'The job requires specialised training in electronics.', 'The adjective for designed for, or trained in, one particular area.')
  ], excludedForms: [{ form: 'specialisation', reason: 'A long, formal noun that adds little at this level.' }] },
  sustainable: { forms: [
    f('sustainable', 'adjective', 'The company only uses sustainable materials in its packaging.', 'Headword.'),
    f('sustainability', 'noun', 'Sustainability is now a key part of every product design.', 'The noun; very common in modern business and science writing.'),
    f('sustain', 'verb', 'The planet cannot sustain this level of pollution.', 'The verb: to keep something going over time.')
  ], excludedForms: [{ form: 'unsustainable', reason: 'The negative adjective is useful but would add a fourth form.' }] },
  transformed: { forms: [
    f('transformed', 'verb', 'The new owners transformed the empty shop into a busy café.', 'Headword.'),
    f('transform', 'verb', 'New technology could transform the way we travel.', 'The base verb; used for present and future changes.'),
    f('transformation', 'noun', 'The transformation of the old harbour took ten years.', 'The noun for a complete change.')
  ], excludedForms: [{ form: 'transformer', reason: 'A piece of electrical equipment; a different, technical meaning.' }] },
  operator: { forms: [
    f('operator', 'noun', 'The operator checked the machine before starting her shift.', 'Headword.'),
    f('operate', 'verb', 'Only trained staff may operate the cutting machine.', 'The verb: to make a machine work.'),
    f('operation', 'noun', 'The operation of the new machines requires special training.', 'The noun for the process of working a machine or system.')
  ], excludedForms: [{ form: 'operational', reason: 'A formal adjective meaning working or ready for use; less useful at this level.' }] },
  nutritionist: { forms: [
    f('nutritionist', 'noun', 'The nutritionist explained which foods give you the most energy.', 'Headword.'),
    f('nutrition', 'noun', 'Good nutrition is important for students during exams.', 'The noun for food and its effect on health.'),
    f('nutritious', 'adjective', 'The café serves cheap but nutritious meals.', 'The adjective for food that is good for your health.')
  ], excludedForms: [{ form: 'nutrient', reason: 'A scientific noun for a substance in food; useful later but outside this family’s focus.' }] },
  expert: { forms: [
    f('expert', 'noun', 'An expert examined the painting and said it was a copy.', 'Headword.'),
    f('expertise', 'noun', 'The company hired her because of her expertise in design.', 'The noun for special skill or knowledge; common in job adverts.'),
    f('expertly', 'adverb', 'The chef expertly cut the vegetables into thin strips.', 'The adverb for doing something with great skill.')
  ], excludedForms: [{ form: 'inexpert', reason: 'A rare negative adjective that learners do not need.' }] },
  scientist: { forms: [
    f('scientist', 'noun', 'The scientist explained her research to the students.', 'Headword.'),
    f('science', 'noun', 'He wants to study science at university.', 'The noun for the subject; the base of the family.'),
    f('scientific', 'adjective', 'The company carried out scientific tests on the new cream.', 'The adjective for things related to science; very common in reports.')
  ], excludedForms: [{ form: 'scientifically', reason: 'Useful in formal writing but would add a fourth form.' }] },
  employment: { forms: [
    f('employment', 'noun', 'The new hotel will bring employment to the village.', 'Headword.'),
    f('employ', 'verb', 'The company plans to employ fifty new staff next year.', 'The verb: to give someone paid work.'),
    f('unemployed', 'adjective', 'He has been unemployed since the shop closed in March.', 'The adjective for having no job; common in news and reports.')
  ], excludedForms: [{ form: 'employer', reason: 'Useful, but employer and employee are taught as everyday vocabulary rather than as family forms here.' }] },
  traditional: { forms: [
    f('traditional', 'adjective', 'The village is famous for its traditional pottery.', 'Headword.'),
    f('tradition', 'noun', 'It is a tradition in the company to have lunch together on Fridays.', 'The noun for a custom that has existed for a long time.'),
    f('traditionally', 'adverb', 'Fishing has traditionally been the main job on the island.', 'The adverb; useful in formal writing about the past.')
  ], excludedForms: [{ form: 'untraditional', reason: 'Rare; learners use modern or unusual instead.' }] },
  trainer: { forms: [
    f('trainer', 'noun', 'The trainer showed the new staff how to use the coffee machine.', 'Headword.'),
    f('train', 'verb', 'The company will train you to use all the equipment.', 'The verb: to teach someone the skills for a job or sport.'),
    f('trainee', 'noun', 'Each trainee works with an experienced chef for six months.', 'The noun for a person who is being trained.')
  ], excludedForms: [{ form: 'training', reason: 'Very useful, but most learners already know it; trainee is the new form taught here.' }] },
  technology: { forms: [
    f('technology', 'noun', 'Modern technology has changed the way we communicate.', 'Headword.'),
    f('technological', 'adjective', 'The company is famous for its technological innovations.', 'The adjective; common in writing about progress and business.'),
    f('technologically', 'adverb', 'It is a technologically advanced factory with very few workers.', 'The adverb, usually before "advanced".')
  ], excludedForms: [{ form: 'technician', reason: 'A related job title, but its meaning (a person who repairs equipment) is taught as everyday vocabulary.' }] },
  creative: { forms: [
    f('creative', 'adjective', 'The job needs a creative person who can design new logos.', 'Headword.'),
    f('create', 'verb', 'The new factory will create two hundred jobs.', 'The verb: to make something new; the base of the family.'),
    f('creativity', 'noun', 'The teacher praised the creativity of the students’ designs.', 'The noun for the ability to produce new ideas.')
  ], excludedForms: [{ form: 'creation', reason: 'Useful, but it names the thing created rather than the quality, so creativity is taught instead.' }] }
});

export const unit8WordFamilyRejected = Object.freeze({
  curved: 'Curve is the only related form, and the noun and the verb share the same spelling, so the family has just two usable forms.',
  detailed: 'Detail (noun) is the only other common form; the verb detail shares its spelling and is rare at this level, so a three-form family would repeat one word.',
  elements: 'The singular element is the same word, and elementary has moved away to mean basic, so there is no useful three-form family.',
  facilities: 'The singular facility often means a natural ability (a facility for languages), and facilitate is a formal verb with a different meaning, so no useful family is taught.',
  feature: 'The verb feature (to include as an important part) shares the spelling and has a different job, and featureless is rare, so no three-form family is taught.',
  impact: 'The verb impact shares the spelling, and impactful is informal and not suitable for exam writing, so no useful family is taught.',
  ingredients: 'The singular ingredient is the same word, and there are no other related forms, so no family is taught.',
  launched: 'The noun and base verb launch share one spelling, so the family has only two usable forms.',
  landscape: 'The only related forms are compounds such as landscape gardener and landscaping, which belong to specialist vocabulary, so no family is taught.',
  minority: 'The opposite, majority, is a different word rather than a family form, and minor has a different meaning (small or not important), so no family is taught.',
  relentless: 'The adverb relentlessly is the only other common form, and relent is a rare verb with a different focus, so there is no useful three-form family.',
  rough: 'Roughly (approximately) is useful, but the noun roughness belongs to the "not smooth" sense, so no three-form family fits this meaning.',
  source: 'The verb source (to obtain materials) shares the spelling and is specialist business English, and resource is a different word, so no family is taught.',
  structures: 'Structural (structural damage) is useful, but the other forms (structured, restructure) belong to the "organisation" sense, so there is no three-form family for the built sense.',
  director: 'The verb direct and the noun direction are mainly used for giving the way or aiming something, a different sense from running a company, so no family is taught.',
  engineer: 'Engineering (the subject) is the only other common form, and the verb engineer is rare at this level, so no three-form family is taught.',
  assignment: 'The verb assign is the only other useful form, so there is no three-form family.',
  wellbeing: 'Wellbeing is a compound of well and being; it has no derived forms that learners need, so no family is taught.'
});
