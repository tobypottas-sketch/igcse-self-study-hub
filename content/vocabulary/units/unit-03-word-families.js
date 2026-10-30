// Unit 3 · Word Families — authored families, WORDS 1–10 ONLY. Same contract as unit-02-word-families.js: every row is AUTHORED (stated part of
// speech, one natural example containing the form exactly once and not as the first word, and the reason the form is worth teaching). A family
// needs >= 3 pedagogically useful forms INCLUDING the headword and >= 2 parts of speech. Headwords with no genuine family are listed under
// unit3WordFamilyRejected rather than padded with unnatural forms.
const f = (form, partOfSpeech, example, why, note) => ({ form, partOfSpeech, example, why, ...(note ? { note } : {}) });

export const unit3WordFamilies = Object.freeze({
  participant: { forms: [
    f('participant', 'noun', 'Every participant in the quiz received a small prize.', 'Headword.'),
    f('participate', 'verb', 'Students are encouraged to participate in at least one school club.', 'The verb behind the noun; very common in school and sports texts.'),
    f('participation', 'noun', 'Active participation in class helps students remember new vocabulary.', 'The abstract noun for taking part; common in reports and surveys.')
  ], excludedForms: [{ form: 'participatory', reason: 'Rare adjective beyond the level of this unit.' }] },
  sprinkled: { forms: [
    f('sprinkled', 'verb', 'Mum sprinkled a little cinnamon on top of the porridge.', 'Headword (past form).'),
    f('sprinkle', 'verb', 'You can sprinkle grated cheese over the pasta just before serving.', 'Base verb used in recipes.'),
    f('sprinkling', 'noun', 'The soup was finished with a sprinkling of fresh parsley.', 'Noun for a light scattering; also used for a small number, as in “a sprinkling of customers”.')
  ], excludedForms: [{ form: 'sprinkler', reason: 'A different device sense (watering or fire safety), so it does not extend the meaning of “sprinkled”.' }] },
  underestimate: { forms: [
    f('underestimate', 'verb', 'Never underestimate how tiring it is to work in a busy kitchen.', 'Headword.'),
    f('estimate', 'noun', 'The chef gave a rough estimate of how many guests would arrive.', 'The base noun for a rough calculation; common in everyday and exam texts.'),
    f('overestimate', 'verb', 'Beginners often overestimate how much food they can eat at a buffet.', 'The direct opposite; the pair is worth learning together.')
  ], excludedForms: [{ form: 'estimated', reason: 'Already a Unit 1 target word.' }] },
  harmless: { forms: [
    f('harmless', 'adjective', 'The tiny insect on the lettuce was completely harmless.', 'Headword.'),
    f('harm', 'noun', 'A single sweet will do no harm to a healthy child.', 'The base noun; “do no harm” is a frequent phrase.'),
    f('harmful', 'adjective', 'Smoking is harmful to the lungs.', 'The opposite adjective; the pair is worth learning together.')
  ], excludedForms: [{ form: 'harmlessly', reason: 'Rare adverb; not useful at this level.' }] },
  inexpensive: { forms: [
    f('inexpensive', 'adjective', 'The cafe sells inexpensive sandwiches near the station.', 'Headword.'),
    f('expensive', 'adjective', 'Fresh seafood is often more expensive than chicken in this region.', 'The base adjective; “inexpensive” is built from it with the prefix in-.'),
    f('expense', 'noun', 'Food is the biggest expense for many students living away from home.', 'Noun for money spent; common in reports and budgets.')
  ], excludedForms: [{ form: 'inexpensively', reason: 'Rare adverb; not useful at this level.' }] },
  processed: { forms: [
    f('processed', 'adjective', 'Tinned beans and frozen pizza are common processed foods.', 'Headword.'),
    f('process', 'verb', 'The factory can process thousands of litres of milk every day.', 'The base verb used for treating food in a factory.'),
    f('processing', 'noun', 'Food processing often adds salt, sugar or preservatives to products.', 'Noun for the factory activity; common in food-industry texts.')
  ], excludedForms: [{ form: 'processor', reason: 'Mostly a machine or computer sense (food processor, computer processor).' }] },
  depression: { forms: [
    f('depression', 'noun', 'Many students find it helpful to talk about depression with someone they trust.', 'Headword.'),
    f('depressed', 'adjective', 'Several families felt depressed after hearing the bad news about the factory closing.', 'Adjective for feeling very sad; common in everyday and news texts.'),
    f('depressing', 'adjective', 'The grey weather and the empty cafe made the evening feel depressing.', 'Adjective for something that makes people feel sad; contrasts with “depressed”.')
  ], excludedForms: [{ form: 'depress', reason: 'The verb is formal and less common than the adjectives.' }] },
  overweight: { forms: [
    f('overweight', 'adjective', 'The chart shows which children are overweight for their height.', 'Headword.'),
    f('weight', 'noun', 'The nurse recorded each child’s weight and height in a notebook.', 'The base noun; “overweight” is built from it.'),
    f('underweight', 'adjective', 'The charity gave extra meals to children who were underweight.', 'The opposite adjective; the pair is worth learning together.')
  ], excludedForms: [{ form: 'weigh', reason: 'A verb with several separate senses; not needed for this word.' }] },
  nutritious: { forms: [
    f('nutritious', 'adjective', 'The school provides a nutritious lunch for every student.', 'Headword.'),
    f('nutrition', 'noun', 'The school offers a short course on nutrition for parents and students.', 'The noun for the study of food and the body; common in school texts.'),
    f('nutritional', 'adjective', 'Each packet carries a table of nutritional information.', 'Adjective used before nouns such as value and information.')
  ], excludedForms: [{ form: 'nutritionist', reason: 'A job noun beyond the level of this unit.' }] },
  moderation: { forms: [
    f('moderation', 'noun', 'Our teacher says that fast food is fine in moderation.', 'Headword.'),
    f('moderate', 'adjective', 'Add a moderate amount of salt, not too much and not too little.', 'The base adjective; “moderate” means neither too much nor too little.'),
    f('moderately', 'adverb', 'The restaurant is moderately priced, so most families can afford it.', 'Adverb used before adjectives.')
  ], excludedForms: [{ form: 'moderator', reason: 'A person who leads a discussion; a different sense.' }] }

});

export const unit3WordFamilyRejected = Object.freeze({
  outlet: 'No derived forms of this sense exist.',
  considerably: '“considerable” shares the sense, but “consider”, “consideration” and “considerate” drift to different meanings, so there is no clean family.',
  guaranteed: '“guarantee” is both noun and verb with one spelling, so there are fewer than three distinct forms; “guarantor” is legal and rare.',
  fooled: '“foolish” belongs to the unwise-person sense, not “tricked”, and “fool” is one spelling as noun and verb.',
  pressure: 'Noun and verb share one spelling; “press” is a different sense (push) and “pressurise” is technical.',
  majority: 'The only relative is “major”, which has a different sense.',
  sodium: 'A technical word with no derived forms in everyday use.',
  commercially: '“commercial” shares the sense, but “commerce” is formal and rare, and “commercialise” is beyond the level, so there is no third useful form.',
  unwell: 'The base “well” has several unrelated senses (adverb, noun, adjective) and “wellbeing” differs in meaning, so there is no clean family.',
  ingredients: '“ingredient” is only the singular of the same word, so there are no other forms.'

});
