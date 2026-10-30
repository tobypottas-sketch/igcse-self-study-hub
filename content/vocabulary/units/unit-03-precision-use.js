// Unit 3 Precision & Use content: two "weak wording -> precise word" items per word, WORDS 1–10 ONLY. Same contract as unit-02-precision-use.js:
// each item is a writing_set improve_vocabulary record; the weak wording quoted in the prompt appears exactly once in sourceText and not at its
// start; distractors fit the sentence grammatically but are wrong in meaning.
const status = 'approved';
const unitNumber = 3;
function precision(id, vocabularyId, prompt, sourceText, acceptedAnswers, distractors) {
  return {
    activityContentId:id, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'improve_vocabulary', prompt, sourceText, acceptedAnswers, distractors, linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}
const P = weak => `Replace “${weak}” with a more precise Unit 3 word or phrase.`;

export default [
  precision('u3_writing_precision_participant_a', 'vocab_participant', P('person who takes part'), 'Each person who takes part in the quiz receives a small prize.', ['participant'], ['spectator', 'organiser', 'sponsor']),
  precision('u3_writing_precision_participant_b', 'vocab_participant', P('people taking part'), 'The charity thanked all the people taking part in the sponsored walk.', ['participants'], ['spectators', 'judges', 'reporters']),
  precision('u3_writing_precision_outlet_a', 'vocab_outlet', P('place that sells food'), 'The town has a new place that sells food right next to the bus station.', ['food outlet', 'outlet'], ['food factory', 'food warehouse', 'food farm']),
  precision('u3_writing_precision_outlet_b', 'vocab_outlet', P('one of its shops'), 'The bakery chain closed one of its shops on the high street last year.', ['one of its outlets'], ['one of its recipes', 'one of its suppliers', 'one of its customers']),
  precision('u3_writing_precision_sprinkled_a', 'vocab_sprinkled', P('scattered'), 'The waiter scattered salt over the chips before bringing them to our table.', ['sprinkled'], ['boiled', 'sliced', 'weighed']),
  precision('u3_writing_precision_sprinkled_b', 'vocab_sprinkled', P('spread a little'), 'Dad spread a little icing sugar over the pancakes just before breakfast.', ['sprinkled'], ['baked', 'peeled', 'weighed']),
  precision('u3_writing_precision_underestimate_a', 'vocab_underestimate', P('think too little of'), 'Never think too little of the effect that sugary drinks have on your teeth.', ['underestimate'], ['borrow', 'repair', 'celebrate']),
  precision('u3_writing_precision_underestimate_b', 'vocab_underestimate', P('do not realise the size of'), 'Many people do not realise the size of the problem of food waste.', ['underestimate'], ['solve', 'cause', 'report']),
  precision('u3_writing_precision_considerably_a', 'vocab_considerably', P('a lot'), 'Restaurant meals cost a lot more than home cooking.', ['considerably'], ['slightly', 'rarely', 'suddenly']),
  precision('u3_writing_precision_considerably_b', 'vocab_considerably', P('by a large amount'), 'The school has reduced its sugar use by a large amount since the new rules began.', ['considerably'], ['slightly', 'hardly', 'quietly']),
  precision('u3_writing_precision_guaranteed_a', 'vocab_guaranteed', P('definitely promised'), 'The shop definitely promised that the fish would be fresh on delivery.', ['guaranteed'], ['hoped', 'doubted', 'wondered']),
  precision('u3_writing_precision_guaranteed_b', 'vocab_guaranteed', P('made a firm promise'), 'The supermarket made a firm promise that the eggs came from free-range hens.', ['guaranteed'], ['wondered', 'hoped', 'forgot']),
  precision('u3_writing_precision_harmless_a', 'vocab_harmless', P('not dangerous'), 'The doctor said the tiny insect in the salad was not dangerous.', ['harmless'], ['poisonous', 'harmful', 'deadly']),
  precision('u3_writing_precision_harmless_b', 'vocab_harmless', P('safe'), 'Most people think one sweet a day is completely safe, though dentists disagree.', ['harmless'], ['poisonous', 'harmful', 'dangerous']),
  precision('u3_writing_precision_pressure_a', 'vocab_pressure', P('strong influence'), 'Teenagers often choose snacks because of strong influence from their friends.', ['pressure'], ['permission', 'payment', 'punishment']),
  precision('u3_writing_precision_pressure_b', 'vocab_pressure', P('forceful persuasion'), 'Parents sometimes give in to forceful persuasion from children who want sweets.', ['pressure'], ['permission', 'kindness', 'punishment']),
  precision('u3_writing_precision_fooled_a', 'vocab_fooled', P('tricked'), 'Some shoppers are tricked by labels that say “natural” or “fresh”.', ['fooled'], ['paid', 'taught', 'praised']),
  precision('u3_writing_precision_fooled_b', 'vocab_fooled', P('deceived'), 'Customers were deceived by the advert showing a burger twice the real size.', ['fooled'], ['bored', 'invited', 'thanked']),
  precision('u3_writing_precision_majority_a', 'vocab_majority', P('most'), 'In our school, most of the pupils have lunch in the canteen.', ['the majority', 'a majority'], ['the minority', 'the average', 'the total']),
  precision('u3_writing_precision_majority_b', 'vocab_majority', P('more than half'), 'The survey showed that more than half the customers prefer takeaway pizza.', ['a majority of', 'the majority of'], ['a minority of', 'an average of', 'a total of'])
];
