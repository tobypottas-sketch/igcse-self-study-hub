// Unit 4 · Word Families — authored families, WORDS 1–10 ONLY. Same contract as unit-03-word-families.js: every row is AUTHORED (stated part of
// speech, one natural example containing the form exactly once and not as the first word, and the reason the form is worth teaching). A family
// needs >= 3 pedagogically useful forms INCLUDING the headword and >= 2 parts of speech. Headwords with no genuine family are listed under
// unit4WordFamilyRejected rather than padded with unnatural forms.
const f = (form, partOfSpeech, example, why, note) => ({ form, partOfSpeech, example, why, ...(note ? { note } : {}) });

export const unit4WordFamilies = Object.freeze({
  comfort: { forms: [
    f('comfort', 'noun', 'The seats were designed for the comfort of long-distance passengers.', 'Headword.'),
    f('comfortable', 'adjective', 'The new coach seats are wide, soft and very comfortable.', 'The everyday adjective; far more common than the noun in speech.'),
    f('uncomfortable', 'adjective', 'The narrow seat was so uncomfortable that I could not sleep.', 'The opposite adjective; the pair is worth learning together.'),
    f('comfortably', 'adverb', 'We sat comfortably in the carriage and watched the fields go by.', 'The adverb; common in descriptions of travel and living.')
  ], excludedForms: [{ form: 'comforting', reason: 'Drifts to the emotional sense (consoling), which this unit does not teach.' }] },
  reality: { forms: [
    f('reality', 'noun', 'The reality of the job is long hours and heavy traffic.', 'Headword.'),
    f('real', 'adjective', 'The engineers needed to know whether the crack was a real danger or just a mark in the paint.', 'The base adjective; very frequent.'),
    f('realistic', 'adjective', 'It is not realistic to expect every train to arrive on time in heavy snow.', 'Adjective for sensible, achievable ideas; common in essays and discussion.'),
    f('realise', 'verb', 'Many drivers do not realise how tired they are until they stop.', 'The verb behind the noun; common in everyday and exam texts.')
  ], excludedForms: [{ form: 'unrealistic', reason: 'The negative of “realistic”; adds no new meaning at this level.' }, { form: 'realisation', reason: 'Abstract noun that is rare at this level.' }] },
  luxury: { forms: [
    f('luxury', 'noun', 'The cruise offers every luxury, from heated pools to private balconies.', 'Headword.'),
    f('luxurious', 'adjective', 'The hotel suites were large, quiet and extremely luxurious.', 'The adjective; far more common than the noun in descriptions.'),
    f('luxuriously', 'adverb', 'The first-class cabin was luxuriously decorated with leather seats and soft lights.', 'The adverb; used with decorated, furnished and equipped.')
  ], excludedForms: [{ form: 'luxuriant', reason: 'Describes plants growing thickly, a different sense.' }] }
});

export const unit4WordFamilyRejected = Object.freeze({
  breathtaking: 'The only derived form is “breathtakingly”; “breath” and “breathe” belong to the literal sense, not “extremely impressive”.',
  toughest: '“tough” and “tougher” are other forms of the same adjective, and “toughness” and “toughen” drift towards physical strength.',
  storeys: '“storey” is only the singular form of the same noun, so there is no genuine family.',
  accommodate: '“accommodation” (a place to stay) and “accommodating” (helpful) drift to different senses.',
  altitude: 'There are no everyday derived forms.',
  landscape: '“landscaping” and the verb “landscape” mean garden design, a different sense.',
  passenger: '“pass” and “passage” belong to different senses.'
});
