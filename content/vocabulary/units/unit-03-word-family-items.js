// Unit 3 Word Families items (writing_set, taskType 'word_family'), WORDS 1–10 ONLY: three items for each word that has a genuine family.
// Same record shape as unit-02-word-family-items.js. Each sentence has one gap that exactly one form of the family completes, and the gap never
// opens the sentence. outlet, considerably, guaranteed, fooled, pressure and majority have no family, so no items (see unit-03-word-families.js).
const unitNumber = 3;
const status = 'approved';
function family(id, vocabularyId, name, sourceText, acceptedAnswer) {
  return {
    activityContentId:`u3_writing_word_family_${id}`, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'word_family', prompt:`Use the correct form from the ${name} word family.`, sourceText, acceptedAnswers:[acceptedAnswer], linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}

export default [
  family('participant_a', 'vocab_participant', 'participant', 'More than two hundred runners will ____ in the charity race this weekend.', 'participate'),
  family('participant_b', 'vocab_participant', 'participant', 'Regular ____ in school clubs helps students make new friends.', 'participation'),
  family('participant_c', 'vocab_participant', 'participant', 'The youngest ____ in the cooking contest was only nine years old.', 'participant'),
  family('sprinkled_a', 'vocab_sprinkled', 'sprinkled', 'Please ____ a little salt over the potatoes just before you serve them.', 'sprinkle'),
  family('sprinkled_b', 'vocab_sprinkled', 'sprinkled', 'The chips were ____ with vinegar and salt when they reached our table.', 'sprinkled'),
  family('sprinkled_c', 'vocab_sprinkled', 'sprinkled', 'Only a ____ of customers came to the cafe on the rainy afternoon.', 'sprinkling'),
  family('underestimate_a', 'vocab_underestimate', 'underestimate', 'Because they ____ the amount of sugar in juice, many people drink far too much of it.', 'underestimate'),
  family('underestimate_b', 'vocab_underestimate', 'underestimate', 'The builder gave us a rough ____ of how much the new kitchen would cost.', 'estimate'),
  family('underestimate_c', 'vocab_underestimate', 'underestimate', 'Many diners ____ how hungry they are, so they order far too much food.', 'overestimate'),
  family('harmless_a', 'vocab_harmless', 'harmless', 'Although the spider looks frightening, it is completely ____ and has never hurt anyone.', 'harmless'),
  family('harmless_b', 'vocab_harmless', 'harmless', 'Eating a small piece of cake will do you no ____.', 'harm'),
  family('harmless_c', 'vocab_harmless', 'harmless', 'Too much salt can be ____ to your heart over many years.', 'harmful'),
  family('inexpensive_a', 'vocab_inexpensive', 'inexpensive', 'The restaurant was far too ____ for a student, so we ate at the market.', 'expensive'),
  family('inexpensive_b', 'vocab_inexpensive', 'inexpensive', 'Because the meal was so ____, the whole family could eat out twice a month.', 'inexpensive'),
  family('inexpensive_c', 'vocab_inexpensive', 'inexpensive', 'Rent is the biggest ____ for a small restaurant.', 'expense'),
  family('processed_a', 'vocab_processed', 'processed', 'The factory can ____ ten tonnes of fruit in a single day.', 'process'),
  family('processed_b', 'vocab_processed', 'processed', 'The ____ of the milk takes place in a clean, modern building.', 'processing'),
  family('processed_c', 'vocab_processed', 'processed', 'Fresh vegetables are usually cheaper than ____ products such as frozen pizza.', 'processed'),
  family('depression_a', 'vocab_depression', 'depression', 'After weeks of bad news, many families felt ____ about their future.', 'depressed'),
  family('depression_b', 'vocab_depression', 'depression', 'The empty, grey cafe was a ____ place to eat lunch.', 'depressing'),
  family('depression_c', 'vocab_depression', 'depression', 'Talking openly about ____ can help students feel less alone.', 'depression'),
  family('overweight_a', 'vocab_overweight', 'overweight', 'A set of scales will tell you the ____ of the flour for the cake.', 'weight'),
  family('overweight_b', 'vocab_overweight', 'overweight', 'The chart showed which children were underweight, healthy or ____ for their height.', 'overweight'),
  family('overweight_c', 'vocab_overweight', 'overweight', 'The charity gave extra meals to children who were ____ because of a lack of food.', 'underweight'),
  family('nutritious_a', 'vocab_nutritious', 'nutritious', 'A teacher explained the basics of ____ to the class.', 'nutrition'),
  family('nutritious_b', 'vocab_nutritious', 'nutritious', 'A dietitian explained the ____ value of beans to the class.', 'nutritional'),
  family('nutritious_c', 'vocab_nutritious', 'nutritious', 'Beans, rice and vegetables make a cheap and ____ meal.', 'nutritious'),
  family('moderation_a', 'vocab_moderation', 'moderation', 'We should eat sweets in ____ rather than every day.', 'moderation'),
  family('moderation_b', 'vocab_moderation', 'moderation', 'Add a ____ amount of salt, not too much and not too little.', 'moderate'),
  family('moderation_c', 'vocab_moderation', 'moderation', 'The curry was only ____ spicy, so everyone in the class could eat it.', 'moderately')

];
