// Unit 6 · Word Families — authored families, WORDS 1–10 so far. Same contract as unit-05-word-families.js: every row is AUTHORED (stated part of
// speech, one natural example containing the form exactly once and not as the first word, and the reason the form is worth teaching). A family
// needs >= 3 pedagogically useful forms INCLUDING the headword and >= 2 parts of speech. Headwords with no genuine family are listed under
// unit6WordFamilyRejected rather than padded with unnatural forms.
const f = (form, partOfSpeech, example, why, note) => ({ form, partOfSpeech, example, why, ...(note ? { note } : {}) });

export const unit6WordFamilies = Object.freeze({
  confidence: { forms: [
    f('confidence', 'noun', 'Regular practice gives learners the confidence to speak in front of the class.', 'Headword.'),
    f('confident', 'adjective', 'She felt confident about the exam because she had revised every topic.', 'The adjective for having belief in your own ability; far more frequent than the noun in speaking tasks.'),
    f('confidently', 'adverb', 'He answered the examiner’s questions confidently and without notes.', 'The adverb; common in descriptions of speaking and presenting.')
  ], excludedForms: [{ form: 'confide', reason: 'A different sense: to tell a secret to someone you trust.' }, { form: 'overconfident', reason: 'Compound adjective that adds a separate meaning and is rare at this level.' }] },
  stagnate: { forms: [
    f('stagnate', 'verb', 'Without new challenges, even a talented student may stagnate.', 'Headword.'),
    f('stagnation', 'noun', 'After a long period of economic stagnation, the government introduced new policies to create jobs.', 'The abstract noun; common in essays about economies and education.'),
    f('stagnant', 'adjective', 'Wages stayed stagnant for years, even though prices continued to rise.', 'The adjective for something that is not developing or growing; very common in news and academic texts.')
  ], excludedForms: [{ form: 'stagnating', reason: 'Only the present participle of the verb already taught.' }] },
  engage: { forms: [
    f('engage', 'verb', 'Good teachers find ways to engage every student in the lesson.', 'Headword.'),
    f('engagement', 'noun', 'Student engagement rises when lessons connect to real life.', 'The abstract noun for active involvement; very common in education texts.'),
    f('engaging', 'adjective', 'The speaker gave an engaging talk that held the attention of the whole hall.', 'The adjective for something that holds your interest; useful in evaluating lessons and texts.')
  ], excludedForms: [{ form: 'engaged', reason: 'Often means promised to marry or busy, which are different senses from the study sense.' }, { form: 'disengage', reason: 'Rare verb at this level.' }] },
  participate: { forms: [
    f('participate', 'verb', 'Every student is encouraged to participate in the class debate.', 'Headword.'),
    f('participation', 'noun', 'Active participation in lessons improves both understanding and memory.', 'The abstract noun; common in school reports and academic writing.'),
    f('participant', 'noun', 'Each participant received a certificate at the end of the workshop.', 'The person who takes part; the same pattern as assistant and applicant.')
  ], excludedForms: [{ form: 'participatory', reason: 'Formal adjective that is rare at this level.' }] }
});

export const unit6WordFamilyRejected = Object.freeze({
  absorb: 'Absorption is a rare noun at this level, and absorbing and absorbed drift towards the sense of being very interested rather than taking in information.',
  dilemma: 'There is no related form that a learner needs to know; dilemma stands alone.',
  dramatically: 'Dramatic is already a Unit 5 target and drama points to theatre, so this adverb has no further useful forms for this sense.',
  equivalent: 'Equivalence is a rare formal noun and there is no other form worth teaching at this level.',
  overload: 'Overloaded is only a participle and the noun has the same form as the verb, so there are not enough distinct forms.',
  passive: 'Passively and passivity are rare at this level, which leaves fewer than three useful forms.'
});
