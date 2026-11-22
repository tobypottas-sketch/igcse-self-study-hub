// Unit 9 · Word Families — authored families, WORDS 1–50 (complete). Same contract as unit-08-word-families.js: every row is AUTHORED (stated part of
// speech, one natural example containing the form exactly once and not as the first word, and the reason the form is worth teaching). A family
// needs >= 3 pedagogically useful forms INCLUDING the headword and >= 2 parts of speech. Headwords with no genuine family are listed under
// unit9WordFamilyRejected rather than padded with unnatural forms.
const f = (form, partOfSpeech, example, why, note) => ({ form, partOfSpeech, example, why, ...(note ? { note } : {}) });

export const unit9WordFamilies = Object.freeze({
  communication: { forms: [
    f('communication', 'noun', 'Good communication between parents and teachers helps students succeed.', 'Headword.'),
    f('communicate', 'verb', 'Teenagers often communicate with friends through short voice messages.', 'The base verb; essential for writing about this topic.'),
    f('communicative', 'adjective', 'The new teacher uses a communicative approach, so students speak a lot in class.', 'The adjective describing someone or something that shares ideas readily.')
  ], excludedForms: [{ form: 'communicator', reason: 'Useful but less frequent; communicative covers the adjective slot learners need.' }] },
  represent: { forms: [
    f('represent', 'verb', 'On this map, blue lines represent rivers.', 'Headword.'),
    f('representative', 'noun', 'Each class elects a representative for the student council.', 'The person chosen to speak for a group; very common in school contexts.'),
    f('representation', 'noun', 'The painting is a representation of life in a busy port.', 'The noun for the way something is shown; frequent in text analysis.')
  ], excludedForms: [] },
  effective: { forms: [
    f('effective', 'adjective', 'Short, regular practice is an effective way to remember new words.', 'Headword.'),
    f('effectively', 'adverb', 'Good speakers use pauses to communicate effectively.', 'The adverb; common when describing skills.'),
    f('ineffective', 'adjective', 'The warning was ineffective because nobody read it.', 'The opposite adjective: not producing the wanted result.')
  ], excludedForms: [{ form: 'effectiveness', reason: 'Taught in Unit 6; the Unit 9 family focuses on the adverb and the opposite.' }] },
  demonstrate: { forms: [
    f('demonstrate', 'verb', 'The chef will demonstrate how to make fresh pasta.', 'Headword.'),
    f('demonstration', 'noun', 'The science teacher gave a demonstration of how sound travels.', 'The noun for a practical display; very common in school.'),
    f('demonstrator', 'noun', 'A demonstrator held a sign asking for cleaner air.', 'The person who protests or shows something; frequent in news reports.')
  ], excludedForms: [{ form: 'demonstrative', reason: 'Its usual meanings (showing feelings openly; a grammar term) are a different sense.' }] },
  passive: { forms: [
    f('passive', 'adjective', 'Watching television is a passive activity for most children.', 'Headword.'),
    f('passively', 'adverb', 'Too many students sit passively and wait for the answers.', 'The adverb; useful for describing behaviour in class.'),
    f('passivity', 'noun', 'The teacher was worried about the passivity of the group during discussions.', 'The abstract noun; useful in formal writing about learning.')
  ], excludedForms: [] },
  interactive: { forms: [
    f('interactive', 'adjective', 'The museum has an interactive screen where visitors can design robots.', 'Headword.'),
    f('interact', 'verb', 'Shy students often interact more confidently online.', 'The base verb.'),
    f('interaction', 'noun', 'Video calls cannot fully replace face-to-face interaction.', 'The noun; frequent in texts about communication.')
  ], excludedForms: [{ form: 'interactivity', reason: 'Technical abstract noun beyond the level of this unit.' }] },
  accuracy: { forms: [
    f('accuracy', 'noun', 'Journalists must check the accuracy of every fact.', 'Headword.'),
    f('accurate', 'adjective', 'The weather forecast was surprisingly accurate this week.', 'The base adjective; very common.'),
    f('inaccurate', 'adjective', 'Many online maps were inaccurate after the new road opened.', 'The opposite adjective; frequent when judging sources.')
  ], excludedForms: [{ form: 'accurately', reason: 'Useful, but kept out so the family stays at three clearly different forms.' }] },
  appropriate: { forms: [
    f('appropriate', 'adjective', 'Jeans are not appropriate for a formal interview.', 'Headword.'),
    f('appropriately', 'adverb', 'Students should dress appropriately for the school concert.', 'The adverb; common in rules and advice.'),
    f('inappropriate', 'adjective', 'Posting a classmate’s photo without permission is inappropriate.', 'The opposite adjective; very common in rules about online behaviour.')
  ], excludedForms: [{ form: 'appropriate (verb)', reason: 'The verb (to take something for yourself) is a different, formal meaning.' }] },
  optional: { forms: [
    f('optional', 'adjective', 'Music lessons are optional after Year 9.', 'Headword.'),
    f('option', 'noun', 'Students have the option of studying a third language.', 'The noun; high-frequency.'),
    f('opt', 'verb', 'Many families opt for online lessons in winter.', 'The verb (usually opt for / opt to); common in formal texts.')
  ], excludedForms: [] },
  survive: { forms: [
    f('survive', 'verb', 'Only a few old letters survive from that century.', 'Headword.'),
    f('survival', 'noun', 'The survival of small languages depends on young speakers.', 'The noun; frequent in texts about change.'),
    f('survivor', 'noun', 'The last survivor of the shipwreck told his story on the radio.', 'The person who survives; common in news.')
  ], excludedForms: [] },
  frustration: { forms: [
    f('frustration', 'noun', 'She shouted in frustration when her laptop crashed again.', 'Headword.'),
    f('frustrated', 'adjective', 'Users felt frustrated by the slow website.', 'The -ed adjective for how a person feels.'),
    f('frustrating', 'adjective', 'Waiting for a reply to an important message is frustrating.', 'The -ing adjective for the thing that causes the feeling.')
  ], excludedForms: [{ form: 'frustrate', reason: 'The verb is less common than the two adjectives, which learners often confuse.' }] },
  informal: { forms: [
    f('informal', 'adjective', 'Text messages are usually written in an informal style.', 'Headword.'),
    f('informally', 'adverb', 'The two managers chatted informally before the meeting.', 'The adverb.'),
    f('formal', 'adjective', 'A job application should be written in a formal style.', 'The opposite adjective; essential for discussing register.')
  ], excludedForms: [{ form: 'informality', reason: 'Rare abstract noun at this level.' }] },
  perception: { forms: [
    f('perception', 'noun', 'Social media can change our perception of what is normal.', 'Headword.'),
    f('perceive', 'verb', 'Older people sometimes perceive teenagers as rude.', 'The verb: to see or understand something in a particular way.'),
    f('perceptive', 'adjective', 'A perceptive reader notices what the writer does not say directly.', 'The adjective: good at noticing and understanding.')
  ], excludedForms: [] },
  differentiate: { forms: [
    f('differentiate', 'verb', 'Young children cannot always differentiate between adverts and videos.', 'Headword.'),
    f('different', 'adjective', 'Each region has a different way of greeting people.', 'The base adjective of the family.'),
    f('difference', 'noun', 'Can you see the difference between the two photos?', 'The noun; high-frequency.')
  ], excludedForms: [{ form: 'differentiation', reason: 'Formal noun that adds little at this level.' }] },
  suitable: { forms: [
    f('suitable', 'adjective', 'This film is not suitable for young children.', 'Headword.'),
    f('unsuitable', 'adjective', 'The hall was unsuitable for a large concert.', 'The opposite adjective.'),
    f('suit', 'verb', 'A quiet office would suit her better than a busy shop.', 'The verb: to be right for someone.')
  ], excludedForms: [{ form: 'suitability', reason: 'Formal abstract noun beyond what learners need here.' }] },
  recommend: { forms: [
    f('recommend', 'verb', 'Most reviewers recommend this app for learning languages.', 'Headword.'),
    f('recommendation', 'noun', 'I bought the book on my teacher’s recommendation.', 'The noun; common in reviews and reports.'),
    f('recommended', 'adjective', 'The recommended screen time for young children is under an hour.', 'Participial adjective common in advice texts.', 'Participial adjective.')
  ], excludedForms: [] },
  solution: { forms: [
    f('solution', 'noun', 'The class found a simple solution to the noise problem.', 'Headword.'),
    f('solve', 'verb', 'It took the technicians two days to solve the problem.', 'The base verb; high-frequency.'),
    f('unsolved', 'adjective', 'The mystery of the missing files remained unsolved.', 'Participial adjective common in news and narrative.', 'Participial adjective.')
  ], excludedForms: [{ form: 'solvable', reason: 'Rare; "can be solved" is what learners need.' }] },
  introduction: { forms: [
    f('introduction', 'noun', 'A good introduction tells the reader what the essay is about.', 'Headword.'),
    f('introduce', 'verb', 'Let me introduce our guest speaker for today.', 'The base verb.'),
    f('introductory', 'adjective', 'The course begins with an introductory lesson on research skills.', 'The adjective for something that begins or prepares.')
  ], excludedForms: [] },
  conclusion: { forms: [
    f('conclusion', 'noun', 'Summarise your main points in the conclusion.', 'Headword.'),
    f('conclude', 'verb', 'Most readers will conclude that the writer is right.', 'The verb: to end, or to decide after thinking.'),
    f('conclusive', 'adjective', 'There is no conclusive evidence that the new app improves grades.', 'The adjective: proving something without doubt.')
  ], excludedForms: [] },
  relevant: { forms: [
    f('relevant', 'adjective', 'Include only information that is relevant to the question.', 'Headword.'),
    f('relevance', 'noun', 'The examiner questioned the relevance of the final paragraph.', 'Noun form used in essays and feedback.'),
    f('irrelevant', 'adjective', 'Most of the comments were irrelevant to the discussion.', 'The common negative; very frequent in feedback on writing.')
  ], excludedForms: [] }
});

export const unit9WordFamilyRejected = Object.freeze({
  signalling: 'The noun and verb signal share one spelling, so the family has only two usable forms.',
  portable: 'Portability is rare and technical at this level, and no other form keeps the meaning, so no family is taught.',
  launched: 'The noun and base verb launch share one spelling, so the family has only two usable forms.',
  'tech-savvy': 'An informal compound adjective with no derived forms.',
  'digital native': 'A fixed noun phrase; digital and native belong to separate families that do not keep this meaning.',
  banned: 'The noun and base verb ban share one spelling, so the family has only two usable forms.',
  community: 'Communal is formal and has a narrower meaning (shared), so there is no useful three-form family.',
  unlike: 'A preposition; unlikely and dislike are different words, so no family is taught.',
  casual: 'Only casually is a common relative; casualness is rare and casualty is a different word, so there are fewer than three useful forms.',
  workforce: 'A compound noun with no derived forms.',
  generation: 'The verb generate (to produce energy or ideas) has a different meaning from this sense, so no family is taught.',
  'non-verbal': 'A compound adjective; verbal belongs to the speech sense and is not a family form of this word.',
  underlying: 'The verb underlie is rare and formal, so there is no useful family.',
  physical: 'Only physically is a common relative; physics and physician are different words, so there are fewer than three useful forms.',
  platform: 'A noun with no derived forms.',
  virtual: 'Virtually usually means almost, a different sense, so no useful family is taught.',
  'face-to-face': 'A fixed compound with no derived forms.',
  conference: 'The verb confer (to discuss formally) is rare at this level, so no family is taught.',
  'underlying meaning': 'A fixed noun phrase; its parts belong to separate families.',
  'informal language': 'A fixed noun phrase; informal is taught as its own family.',
  'formal style': 'A fixed noun phrase; formal is taught in the informal family.',
  'reporting verb': 'A grammar term made of two words; it has no derived forms.',
  'direct object': 'A grammar term made of two words; it has no derived forms.',
  clause: 'A grammar term with no derived forms.',
  suggest: 'Only suggestion is a common relative; suggestive has a different meaning, so there are fewer than three useful forms.',
  audience: 'A noun with no derived forms.',
  purpose: 'Purposeful and purposely are uncommon and shift the meaning, so no useful family is taught.',
  evaluate: 'Only “evaluation” is a common relative; “evaluative” and “evaluator” are rare and academic (the same decision as Units 3 and 5).',
  constructive: 'The verb construct means to build, a different sense, so there is no useful family for this meaning.',
  research: 'The noun and verb research share one spelling, so only researcher adds a form and there are fewer than three.'
});
