// Unit 6 · Word Families — authored families, WORDS 1–20 so far. Same contract as unit-05-word-families.js: every row is AUTHORED (stated part of
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
  ], excludedForms: [{ form: 'participatory', reason: 'Formal adjective that is rare at this level.' }] },
  active: { forms: [
    f('active', 'adjective', 'Students who are active in lessons tend to remember more of what they learn.', 'Headword.'),
    f('activity', 'noun', 'The teacher planned a short speaking activity to end the lesson.', 'The noun for something you do or a task; very common in school texts.'),
    f('actively', 'adverb', 'Students learn best when they actively take part in the lesson.', 'The adverb; common in descriptions of learning and work.')
  ], excludedForms: [{ form: 'activate', reason: 'A technical verb meaning to start a device or a process; a different sense from taking part.' }, { form: 'activist', reason: 'Names a person who campaigns for change; a different sense from being involved in learning.' }, { form: 'inactive', reason: 'The opposite in a general sense; passive is the study opposite taught in this unit.' }] },
  reflect: { forms: [
    f('reflect', 'verb', 'Teachers often ask students to reflect on their progress at the end of a project.', 'Headword.'),
    f('reflection', 'noun', 'Time for quiet reflection helps learners to understand what they have done well.', 'The noun for careful thought about an experience; used in the thinking sense only, not the mirror image.'),
    f('reflective', 'adjective', 'Teachers encourage students to become reflective learners by keeping a weekly diary.', 'The adjective for someone who thinks carefully about what they have done; common in education texts.')
  ], excludedForms: [{ form: 'reflector', reason: 'A physical object that reflects light, the sense that is not taught here.' }] },
  strategy: { forms: [
    f('strategy', 'noun', 'A good learning strategy combines practice, testing and regular rest.', 'Headword.'),
    f('strategic', 'adjective', 'The school made a strategic decision to spend more money on reading programmes.', 'The adjective for something planned to achieve a long-term goal; frequent in academic and business texts.'),
    f('strategically', 'adverb', 'The coach placed her best players strategically around the pitch.', 'The adverb; useful for describing planned choices.')
  ], excludedForms: [{ form: 'strategist', reason: 'Rare person noun that adds no new meaning at this level.' }] },
  forecast: { forms: [
    f('forecast', 'verb', 'Scientists can forecast the weather several days ahead with growing accuracy.', 'Headword.'),
    f('forecaster', 'noun', 'The weather forecaster warned that heavy snow would arrive by midnight.', 'The person who forecasts; the same pattern as reporter and presenter.'),
    f('forecasting', 'noun', 'Accurate forecasting depends on good data and careful analysis.', 'The abstract noun for the activity; common in science, business and news texts.')
  ], excludedForms: [{ form: 'forecasted', reason: 'A rare past form; forecast is the normal past tense and participle.' }] },
  distract: { forms: [
    f('distract', 'verb', 'Loud music can distract students who are trying to read.', 'Headword.'),
    f('distraction', 'noun', 'A mobile phone on the desk is a constant distraction during revision.', 'The noun for something that takes attention away; extremely frequent in study-skills texts.'),
    f('distracting', 'adjective', 'The noise from the building site was so distracting that nobody could think.', 'The adjective for something that takes attention away.'),
    f('distracted', 'adjective', 'Students who feel distracted often miss important instructions.', 'The adjective for a person whose attention has been pulled away; learners should contrast it with distracting.')
  ], excludedForms: [{ form: 'distractor', reason: 'In test writing this means a wrong answer option, which is a different sense from taking attention away.' }, { form: 'distractingly', reason: 'Rare adverb that adds no new meaning at this level.' }] }
});

export const unit6WordFamilyRejected = Object.freeze({
  absorb: 'Absorption is a rare noun at this level, and absorbing and absorbed drift towards the sense of being very interested rather than taking in information.',
  dilemma: 'There is no related form that a learner needs to know; dilemma stands alone.',
  dramatically: 'Dramatic is already a Unit 5 target and drama points to theatre, so this adverb has no further useful forms for this sense.',
  equivalent: 'Equivalence is a rare formal noun and there is no other form worth teaching at this level.',
  overload: 'Overloaded is only a participle and the noun has the same form as the verb, so there are not enough distinct forms.',
  passive: 'Passively and passivity are rare at this level, which leaves fewer than three useful forms.',
  evaluate: 'Only “evaluation” is a common relative; “evaluator” and “evaluative” are rare and academic, so there are fewer than three useful forms (the same decision as for the Unit 5 item).',
  process: 'Processing and processed drift into the factory and food sense (processed food), and the noun “a process” is a different sense, so the learning verb has no stable family.',
  approach: 'The noun and verb share one form, and approachable (friendly) and approaching (coming closer) point to different senses from a method of dealing with a task.',
  revise: 'Only “revision” is a stable relative; “revised” drifts into the editing sense (a revised edition), so there are fewer than three forms in the exam-study sense.',
  interfere: 'Only “interference” is a useful relative; “interfering” is rare and negative, so there are fewer than three forms.'
});
