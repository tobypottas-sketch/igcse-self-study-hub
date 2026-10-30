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
  ], excludedForms: [{ form: 'harmlessly', reason: 'Rare adverb; not useful at this level.' }] }
});

export const unit3WordFamilyRejected = Object.freeze({
  outlet: 'No derived forms of this sense exist.',
  considerably: '“considerable” shares the sense, but “consider”, “consideration” and “considerate” drift to different meanings, so there is no clean family.',
  guaranteed: '“guarantee” is both noun and verb with one spelling, so there are fewer than three distinct forms; “guarantor” is legal and rare.',
  fooled: '“foolish” belongs to the unwise-person sense, not “tricked”, and “fool” is one spelling as noun and verb.',
  pressure: 'Noun and verb share one spelling; “press” is a different sense (push) and “pressurise” is technical.',
  majority: 'The only relative is “major”, which has a different sense.'
});
