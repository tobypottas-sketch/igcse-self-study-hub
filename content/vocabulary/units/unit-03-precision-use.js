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
  precision('u3_writing_precision_majority_b', 'vocab_majority', P('more than half'), 'The survey showed that more than half the customers prefer takeaway pizza.', ['a majority of', 'the majority of'], ['a minority of', 'an average of', 'a total of']),
  precision('u3_writing_precision_inexpensive_a', 'vocab_inexpensive', P('cheap'), 'Street food in this city is cheap and delicious.', ['inexpensive'], ['luxurious', 'rare', 'seasonal']),
  precision('u3_writing_precision_inexpensive_b', 'vocab_inexpensive', P('low-priced'), 'The shop sells low-priced snacks near the school gate.', ['inexpensive'], ['seasonal', 'imported', 'organic']),
  precision('u3_writing_precision_sodium_a', 'vocab_sodium', P('the mineral in salt'), 'Check the label for the mineral in salt before you buy the soup.', ['sodium'], ['sugar', 'protein', 'vitamins']),
  precision('u3_writing_precision_sodium_b', 'vocab_sodium', P('the mineral found in table salt'), 'Crisps and instant noodles usually contain a lot of the mineral found in table salt.', ['sodium'], ['sugar', 'fibre', 'protein']),
  precision('u3_writing_precision_commercially_a', 'vocab_commercially', P('as a business'), 'Some families grow vegetables as a business rather than just for themselves.', ['commercially'], ['carefully', 'secretly', 'slowly']),
  precision('u3_writing_precision_commercially_b', 'vocab_commercially', P('in order to sell them'), 'The mushrooms are grown in order to sell them and are available all year.', ['commercially'], ['quietly', 'politely', 'slowly']),
  precision('u3_writing_precision_processed_a', 'vocab_processed', P('factory-made'), 'Tinned beans and frozen pizza are factory-made foods that last a long time.', ['processed'], ['fresh', 'raw', 'organic']),
  precision('u3_writing_precision_processed_b', 'vocab_processed', P('ready-made'), 'The shop sells ready-made food such as sausages and tinned soup.', ['processed'], ['seasonal', 'home-grown', 'organic']),
  precision('u3_writing_precision_depression_a', 'vocab_depression', P('long-lasting sadness'), 'The charity offers advice to people who live with long-lasting sadness.', ['depression'], ['hunger', 'poverty', 'danger']),
  precision('u3_writing_precision_depression_b', 'vocab_depression', P('deep sadness'), 'Several students talked to the counsellor about deep sadness they had felt for months.', ['depression'], ['excitement', 'nervousness', 'boredom']),
  precision('u3_writing_precision_overweight_a', 'vocab_overweight', P('too heavy'), 'The chart shows which pupils are too heavy for their height.', ['overweight'], ['underweight', 'stronger', 'faster']),
  precision('u3_writing_precision_overweight_b', 'vocab_overweight', P('carrying extra weight'), 'The nurse recorded which children were carrying extra weight at the start of the year.', ['overweight'], ['underweight', 'absent', 'tired']),
  precision('u3_writing_precision_unwell_a', 'vocab_unwell', P('ill'), 'Pupils who feel ill should tell a teacher straight away.', ['unwell'], ['hungry', 'bored', 'nervous']),
  precision('u3_writing_precision_unwell_b', 'vocab_unwell', P('not feeling well'), 'The manager sent the cook home because he was not feeling well.', ['unwell'], ['unhappy', 'impatient', 'dishonest']),
  precision('u3_writing_precision_ingredients_a', 'vocab_ingredients', P('foods in the recipe'), 'The cook bought all the foods in the recipe at the market.', ['ingredients'], ['tools', 'dishes', 'plates']),
  precision('u3_writing_precision_ingredients_b', 'vocab_ingredients', P('food items'), 'The label on the packet lists all the food items in order of quantity.', ['ingredients'], ['prices', 'colours', 'shops']),
  precision('u3_writing_precision_nutritious_a', 'vocab_nutritious', P('good for the body'), 'Beans and rice are cheap and good for the body.', ['nutritious'], ['tasteless', 'greasy', 'sugary']),
  precision('u3_writing_precision_nutritious_b', 'vocab_nutritious', P('healthy'), 'The canteen now serves a healthy breakfast of fruit, eggs and porridge.', ['nutritious'], ['sugary', 'greasy', 'spicy']),
  precision('u3_writing_precision_moderation_a', 'vocab_moderation', P('sensible amounts'), 'Chocolate is fine in sensible amounts, but it should not be eaten all day.', ['moderation'], ['secret', 'advance', 'public']),
  precision('u3_writing_precision_moderation_b', 'vocab_moderation', P('small, sensible amounts'), 'Dessert is acceptable at weekends, in small, sensible amounts.', ['moderation'], ['secret', 'advance', 'silence']),
  precision('u3_writing_precision_deceive_a', 'vocab_deceive', P('trick'), 'Some websites use fake photographs to trick customers into buying poor food.', ['deceive'], ['teach', 'reward', 'thank']),
  precision('u3_writing_precision_deceive_b', 'vocab_deceive', P('give a false idea to'), 'Labels that say “natural” may give a false idea to shoppers who do not read the ingredients.', ['deceive'], ['inform', 'teach', 'guide']),
  precision('u3_writing_precision_advertisement_a', 'vocab_advertisement', P('advert'), 'A colourful advert for fizzy drinks was shown during the football match.', ['advertisement'], ['review', 'recipe', 'report']),
  precision('u3_writing_precision_advertisement_b', 'vocab_advertisement', P('poster that sells'), 'The cafe put a poster that sells its new cakes in the window.', ['advertisement'], ['menu', 'receipt', 'recipe']),
  precision('u3_writing_precision_variety_a', 'vocab_variety', P('many different kinds'), 'The market offers many different kinds of fresh fruit and vegetables.', ['a wide variety of', 'a variety of'], ['only one kind of', 'a tiny amount of', 'a poor price for']),
  precision('u3_writing_precision_variety_b', 'vocab_variety', P('range'), 'The cafe has a range of cakes, from carrot cake to chocolate cake.', ['variety'], ['shortage', 'habit', 'price']),
  precision('u3_writing_precision_portion_a', 'vocab_portion', P('serving'), 'At the school canteen, a serving of chips costs two pounds.', ['portion'], ['recipe', 'menu', 'receipt']),
  precision('u3_writing_precision_portion_b', 'vocab_portion', P('helping'), 'Mum gave my brother a second helping of rice because he was still hungry.', ['portion'], ['recipe', 'receipt', 'lecture']),
  precision('u3_writing_precision_purchase_a', 'vocab_purchase', P('item you bought'), 'Please keep the receipt for any item you bought online.', ['purchase'], ['recipe', 'refund', 'advert']),
  precision('u3_writing_precision_purchase_b', 'vocab_purchase', P('thing you buy'), 'The biggest thing you buy in a year is often a car or a sofa.', ['purchase'], ['refund', 'recipe', 'discount']),
  precision('u3_writing_precision_takeaway_a', 'vocab_takeaway', P('meal to eat at home'), 'On Saturdays my family often orders a meal to eat at home from the Indian restaurant.', ['takeaway'], ['starter', 'dessert', 'breakfast']),
  precision('u3_writing_precision_takeaway_b', 'vocab_takeaway', P('shop selling meals to go'), 'There is a shop selling meals to go on the corner of our street.', ['takeaway'], ['bakery', 'library', 'pharmacy']),
  precision('u3_writing_precision_barbecue_a', 'vocab_barbecue', P('cooking party outside'), 'We invited all our friends to a cooking party outside on the last day of term.', ['barbecue'], ['lecture', 'concert', 'interview']),
  precision('u3_writing_precision_barbecue_b', 'vocab_barbecue', P('grill party'), 'The neighbours have a grill party in their garden every summer.', ['barbecue'], ['meeting', 'lesson', 'exam']),
  precision('u3_writing_precision_saturated_a', 'vocab_saturated', P('hard'), 'Butter and cream are high in hard fat, so many people eat them less often.', ['saturated'], ['liquid', 'sweet', 'salty']),
  precision('u3_writing_precision_saturated_b', 'vocab_saturated', P('solid-type'), 'The label shows how much solid-type fat is in one portion of the pizza.', ['saturated'], ['spicy', 'sweet', 'fresh']),
  precision('u3_writing_precision_convenient_a', 'vocab_convenient', P('handy'), 'A microwave is handy for heating food quickly after a long day.', ['convenient'], ['unnecessary', 'noisy', 'famous']),
  precision('u3_writing_precision_convenient_b', 'vocab_convenient', P('easy and quick'), 'For people who work late, ready meals are easy and quick.', ['convenient'], ['cheap', 'healthy', 'traditional']),
  precision('u3_writing_precision_extensive_a', 'vocab_extensive', P('very large'), 'The hotel has very large gardens where guests can walk before dinner.', ['extensive'], ['tiny', 'private', 'noisy']),
  precision('u3_writing_precision_extensive_b', 'vocab_extensive', P('wide-ranging'), 'The wine list at this restaurant is wide-ranging, with bottles from twenty countries.', ['extensive'], ['short', 'narrow', 'plain'])

];
