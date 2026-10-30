// Unit 2 Precision & Use content: two "weak wording -> precise word" items per word, WORDS 1–10 ONLY. Same contract as unit-01-precision-use.js:
// each item is a writing_set improve_vocabulary record; the weak wording quoted in the prompt appears exactly once in sourceText and not at its
// start; distractors fit the sentence grammatically but are wrong in meaning. "afford" is the separate Unit 2 item (vocab_afford_2).
const status = 'draft';
const unitNumber = 2;
function precision(id, vocabularyId, prompt, sourceText, acceptedAnswers, distractors) {
  return {
    activityContentId:id, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'improve_vocabulary', prompt, sourceText, acceptedAnswers, distractors, linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}

export default [
  precision('u2_writing_precision_entertainment_a', 'vocab_entertainment', 'Replace “things to watch and play for fun” with a more precise Unit 2 word or phrase.', 'The cruise ship provides plenty of things to watch and play for fun every night.', ['entertainment'], ['equipment', 'transport', 'accommodation']),
  precision('u2_writing_precision_entertainment_b', 'vocab_entertainment', 'Replace “fun” with a more precise Unit 2 word or phrase.', 'For many families, games and films are a source of fun on rainy weekends.', ['entertainment'], ['income', 'pollution', 'exercise']),
  precision('u2_writing_precision_access_a', 'vocab_access', 'Replace “the ability to get into” with a more precise Unit 2 word or phrase.', 'Disabled visitors need the ability to get into every part of the museum.', ['access to'], ['a map of', 'a guide to', 'a fee for']),
  precision('u2_writing_precision_access_b', 'vocab_access', 'Replace “the right to use” with a more precise Unit 2 word or phrase.', 'Library members have the right to use the online database for free.', ['access to'], ['a fee for', 'a ban on', 'a guide to']),
  precision('u2_writing_precision_device_a', 'vocab_device', 'Replace “small electronic machine” with a more precise Unit 2 word or phrase.', 'Most teenagers carry at least one small electronic machine in their pockets.', ['device'], ['charger', 'cable', 'battery']),
  precision('u2_writing_precision_device_b', 'vocab_device', 'Replace “electronic things” with a more precise Unit 2 word or phrase.', 'Please switch off all electronic things before the exam begins.', ['devices'], ['cables', 'chargers', 'batteries']),
  precision('u2_writing_precision_digital_a', 'vocab_digital', 'Replace “electronic” with a more precise Unit 2 word or phrase.', 'Many schools now provide electronic textbooks instead of printed ones.', ['digital'], ['historic', 'handwritten', 'secondhand']),
  precision('u2_writing_precision_digital_b', 'vocab_digital', 'Replace “computer-based” with a more precise Unit 2 word or phrase.', 'The exam board is introducing computer-based tests next year.', ['digital'], ['written', 'optional', 'national']),
  precision('u2_writing_precision_streaming_a', 'vocab_streaming', 'Replace “watching films online” with a more precise Unit 2 word or phrase.', 'Among teenagers, watching films online is now more common than going to the cinema.', ['streaming films', 'streaming'], ['downloading films', 'recording films', 'buying films']),
  precision('u2_writing_precision_streaming_b', 'vocab_streaming', 'Replace “playing music over the internet” with a more precise Unit 2 word or phrase.', 'A fast connection is needed for playing music over the internet without delays.', ['streaming music', 'streaming'], ['recording music', 'composing music', 'selling music']),
  precision('u2_writing_precision_relevant_a', 'vocab_relevant', 'Replace “connected” with a more precise Unit 2 word or phrase.', 'Only include examples that are connected to the question.', ['relevant'], ['similar', 'equal', 'familiar']),
  precision('u2_writing_precision_relevant_b', 'vocab_relevant', 'Replace “useful and on topic” with a more precise Unit 2 word or phrase.', 'Choose evidence that is useful and on topic for your argument.', ['relevant'], ['recent', 'famous', 'lengthy']),
  precision('u2_writing_precision_educator_a', 'vocab_educator', 'Replace “teacher” with a more precise Unit 2 word or phrase.', 'The school hired an experienced teacher to lead the new course.', ['educator'], ['inspector', 'librarian', 'caretaker']),
  precision('u2_writing_precision_educator_b', 'vocab_educator', 'Replace “teachers and trainers” with a more precise Unit 2 word or phrase.', 'Conferences let teachers and trainers share new ideas.', ['educators'], ['inspectors', 'parents', 'politicians']),
  precision('u2_writing_precision_afford_a', 'vocab_afford_2', 'Replace “do not have enough money to pay for” with a more precise Unit 2 word or phrase.', 'Many families do not have enough money to pay for a new tablet each year.', ['cannot afford'], ['cannot borrow', 'cannot repair', 'cannot choose']),
  precision('u2_writing_precision_afford_b', 'vocab_afford_2', 'Replace “has enough money for” with a more precise Unit 2 word or phrase.', 'The school has enough money for a new set of laptops this term.', ['can afford'], ['can borrow', 'can refuse', 'can repair']),
  precision('u2_writing_precision_essential_a', 'vocab_essential', 'Replace “absolutely necessary” with a more precise Unit 2 word or phrase.', 'A charger is absolutely necessary for anyone who travels with a phone.', ['essential', 'vital'], ['optional', 'affordable', 'popular']),
  precision('u2_writing_precision_essential_b', 'vocab_essential', 'Replace “very important” with a more precise Unit 2 word or phrase.', 'Sleep is very important for concentration during exams.', ['essential', 'vital'], ['unusual', 'expensive', 'temporary']),
  precision('u2_writing_precision_current_affairs_a', 'vocab_current_affairs', 'Replace “news about the world” with a more precise Unit 2 word or phrase.', 'Our teacher sets a weekly quiz on news about the world.', ['current affairs'], ['ancient history', 'local weather', 'popular music']),
  precision('u2_writing_precision_current_affairs_b', 'vocab_current_affairs', 'Replace “what is happening in politics and the world” with a more precise Unit 2 word or phrase.', 'She keeps up with what is happening in politics and the world through a daily podcast.', ['current affairs'], ['ancient history', 'sports results', 'fashion trends'])
];
