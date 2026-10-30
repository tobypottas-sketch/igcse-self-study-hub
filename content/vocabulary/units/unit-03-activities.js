// Unit 3 · Paraphrasing content (phrase_set and idea_set), WORDS 1–10 ONLY. Same record shapes and contract as unit-02-activities.js:
//   phrase_set : originalPhrase (plain wording) -> equivalentPhrase (contains the target), acceptedVariants, chunks, commonMeaningDistortions
//   idea_set   : originalIdea (contains the target) with accurate paraphrases that do NOT contain it, a meaning invariant, and three
//                meaning-changing distractors each tagged with the misconception it represents.
// Every record is linked to exactly one Unit 3 word. Words 11–50 are not authored yet.
const status = 'approved';
const unitNumber = 3;

function phrase(id, originalPhrase, equivalentPhrase, linkedVocabularyIds, { acceptedVariants = [], chunks = null, distortions = [] } = {}) {
  return {
    activityContentId:`u3_phrase_${id}`, unitNumber, contentType:'phrase_set', status,
    activityData:{
      originalPhrase, equivalentPhrase, acceptedVariants,
      chunks:chunks ?? equivalentPhrase.split(/\s+/),
      commonMeaningDistortions:distortions,
      linkedVocabularyIds,
      primaryEvidenceTargetId:linkedVocabularyIds.length === 1 ? linkedVocabularyIds[0] : undefined
    }
  };
}

function idea(id, originalIdea, accurateParaphrase, invariantType, invariantValue, distractors, linkedVocabularyIds = []) {
  return {
    activityContentId:`u3_idea_${id}`, unitNumber, contentType:'idea_set', status,
    activityData:{
      originalIdea,
      accurateParaphrases:Array.isArray(accurateParaphrase) ? accurateParaphrase : [accurateParaphrase],
      meaningInvariants:[{ type:invariantType, value:invariantValue }],
      distractors,
      linkedVocabularyIds
    }
  };
}

const phraseSets = [
  phrase('participant_race', 'a person who takes part in the race', 'a participant in the race', ['vocab_participant'], { acceptedVariants:['a race participant'], chunks:['a participant', 'in the race'], distortions:['a spectator at the race', 'the organiser of the race', 'the winner of the race'] }),
  phrase('fast_food_outlet', 'a restaurant that sells quick, cheap meals', 'a fast-food outlet', ['vocab_outlet'], { acceptedVariants:['a fast food outlet'], chunks:['a', 'fast-food', 'outlet'], distortions:['a fast-food factory', 'a fast-food delivery driver', 'a fast-food recipe'] }),
  phrase('sprinkled_sugar', 'scattered sugar over the cake', 'sprinkled sugar over the cake', ['vocab_sprinkled'], { acceptedVariants:['sprinkled sugar on the cake'], chunks:['sprinkled', 'sugar', 'over the cake'], distortions:['poured water over the cake', 'cut the cake into pieces', 'wrapped the cake in paper'] }),
  phrase('underestimate_cost', 'think the cost is smaller than it really is', 'underestimate the cost', ['vocab_underestimate'], { chunks:['underestimate', 'the cost'], distortions:['work out the cost exactly', 'pay the cost in advance', 'think the cost is bigger than it is'] }),
  phrase('considerably_cheaper', 'by a large amount cheaper', 'considerably cheaper', ['vocab_considerably'], { acceptedVariants:['much cheaper'], chunks:['considerably', 'cheaper'], distortions:['slightly cheaper', 'never cheaper', 'sometimes cheaper'] }),
  phrase('guaranteed_refund', 'promised a full refund', 'guaranteed a full refund', ['vocab_guaranteed'], { chunks:['guaranteed', 'a full refund'], distortions:['refused a full refund', 'requested a full refund', 'received a full refund'] }),
  phrase('harmless_children', 'not able to hurt children', 'harmless to children', ['vocab_harmless'], { acceptedVariants:['safe for children'], chunks:['harmless', 'to children'], distortions:['dangerous to children', 'popular with children', 'unknown to children'] }),
  phrase('peer_pressure', 'strong influence from friends of the same age', 'peer pressure', ['vocab_pressure'], { chunks:['peer', 'pressure'], distortions:['pride in your friends', 'advice from your parents', 'competition between friends'] }),
  phrase('fooled_advert', 'tricked by the advert', 'fooled by the advert', ['vocab_fooled'], { acceptedVariants:['deceived by the advert'], chunks:['fooled', 'by the advert'], distortions:['warned by the advert', 'amused by the advert', 'interested in the advert'] }),
  phrase('majority_customers', 'most of the customers', 'the majority of the customers', ['vocab_majority'], { acceptedVariants:['a majority of the customers'], chunks:['the majority', 'of the customers'], distortions:['a few of the customers', 'all of the customers', 'none of the customers'] }),
  phrase('inexpensive_meals', 'meals that do not cost much', 'inexpensive meals', ['vocab_inexpensive'], { acceptedVariants:['cheap meals'], chunks:['inexpensive', 'meals'], distortions:['expensive meals', 'free meals', 'tasteless meals'] }),
  phrase('sodium_salt', 'the mineral in table salt', 'the sodium in table salt', ['vocab_sodium'], { chunks:['the sodium', 'in table salt'], distortions:['the sugar in table salt', 'the water in table salt', 'the colour of table salt'] }),
  phrase('grown_commercially', 'grown in order to sell for profit', 'grown commercially', ['vocab_commercially'], { chunks:['grown', 'commercially'], distortions:['grown for fun', 'grown in secret', 'grown by accident'] }),
  phrase('processed_foods', 'foods made in a factory', 'processed foods', ['vocab_processed'], { acceptedVariants:['factory-made foods'], chunks:['processed', 'foods'], distortions:['fresh foods', 'home-grown foods', 'foods that are free'] }),
  phrase('suffer_depression', 'feel deep sadness for a long time', 'suffer from depression', ['vocab_depression'], { chunks:['suffer from', 'depression'], distortions:['feel angry for a short time', 'feel tired after exercise', 'feel nervous before a test'] }),
  phrase('overweight_children', 'children who weigh more than is healthy', 'overweight children', ['vocab_overweight'], { acceptedVariants:['children who are overweight'], chunks:['overweight', 'children'], distortions:['underweight children', 'very tall children', 'hungry children'] }),
  phrase('feel_unwell', 'feel ill', 'feel unwell', ['vocab_unwell'], { chunks:['feel', 'unwell'], distortions:['feel hungry', 'feel angry', 'feel excited'] }),
  phrase('ingredients_recipe', 'the foods that go into a recipe', 'the ingredients in a recipe', ['vocab_ingredients'], { chunks:['the ingredients', 'in a recipe'], distortions:['the tools used for a recipe', 'the steps of a recipe', 'the cooks who write a recipe'] }),
  phrase('nutritious_food', 'food that is good for the body', 'nutritious food', ['vocab_nutritious'], { acceptedVariants:['healthy food'], chunks:['nutritious', 'food'], distortions:['food that is expensive', 'food that is sweet', 'food that is fried'] }),
  phrase('in_moderation', 'in sensible amounts, not too much', 'in moderation', ['vocab_moderation'], { chunks:['in', 'moderation'], distortions:['in secret', 'in large amounts', 'in a hurry'] }),
  phrase('deceive_customers', 'make customers believe something false', 'deceive customers', ['vocab_deceive'], { acceptedVariants:['mislead customers'], chunks:['deceive', 'customers'], distortions:['inform customers', 'thank customers', 'warn customers'] }),
  phrase('advertisement_burger', 'a message that tries to sell a burger', 'an advertisement for a burger', ['vocab_advertisement'], { acceptedVariants:['an advert for a burger'], chunks:['an advertisement', 'for a burger'], distortions:['a review of a burger', 'a recipe for a burger', 'a bill for a burger'] }),
  phrase('variety_dishes', 'many different kinds of dishes', 'a variety of dishes', ['vocab_variety'], { acceptedVariants:['a range of dishes'], chunks:['a variety', 'of dishes'], distortions:['one kind of dish', 'a list of dishes', 'the cost of dishes'] }),
  phrase('portion_rice', 'the amount of rice for one person', 'a portion of rice', ['vocab_portion'], { acceptedVariants:['a serving of rice'], chunks:['a portion', 'of rice'], distortions:['a bag of rice', 'the price of rice', 'a field of rice'] }),
  phrase('online_purchase', 'something that you bought on the internet', 'an online purchase', ['vocab_purchase'], { acceptedVariants:['an internet purchase'], chunks:['an', 'online', 'purchase'], distortions:['an online refund', 'an online advert', 'an online review'] }),
  phrase('chinese_takeaway', 'a meal from a Chinese restaurant to eat at home', 'a Chinese takeaway', ['vocab_takeaway'], { chunks:['a', 'Chinese', 'takeaway'], distortions:['a Chinese cooking lesson', 'a Chinese restaurant with tables', 'a Chinese food market'] }),
  phrase('garden_barbecue', 'an outdoor meal in the garden cooked over a fire', 'a garden barbecue', ['vocab_barbecue'], { acceptedVariants:['a barbecue in the garden'], chunks:['a', 'garden', 'barbecue'], distortions:['a formal dinner in the garden', 'a cold picnic in the garden', 'a cooking lesson in the garden'] }),
  phrase('saturated_fat', 'the type of fat found in butter and fatty meat', 'saturated fat', ['vocab_saturated'], { chunks:['saturated', 'fat'], distortions:['fat that stays liquid at room temperature', 'fat that has been removed', 'fat that tastes sweet'] }),
  phrase('convenient_way', 'an easy way that saves time', 'a convenient way', ['vocab_convenient'], { acceptedVariants:['a handy way'], chunks:['a', 'convenient', 'way'], distortions:['a costly way', 'a slow way', 'a dangerous way'] }),
  phrase('extensive_gardens', 'very large gardens', 'extensive gardens', ['vocab_extensive'], { chunks:['extensive', 'gardens'], distortions:['tiny gardens', 'private gardens', 'dull gardens'] }),
  phrase('fashionable_cafe', 'a cafe that is popular and stylish right now', 'a fashionable cafe', ['vocab_fashionable'], { acceptedVariants:['a trendy cafe'], chunks:['a', 'fashionable', 'cafe'], distortions:['an old-fashioned cafe', 'a cheap cafe', 'an empty cafe'] }),
  phrase('satisfying_meal', 'a meal that gives you what you wanted', 'a satisfying meal', ['vocab_satisfying'], { chunks:['a', 'satisfying', 'meal'], distortions:['a disappointing meal', 'a very expensive meal', 'a meal eaten alone'] }),
  phrase('reasonable_price', 'a price that is fair', 'a reasonable price', ['vocab_reasonable_3'], { acceptedVariants:['a fair price'], chunks:['a', 'reasonable', 'price'], distortions:['a very low price', 'a price nobody can pay', 'a price that changes daily'] }),
  phrase('disappointed_food', 'let down by the food', 'disappointed with the food', ['vocab_disappointed'], { acceptedVariants:['disappointed by the food'], chunks:['disappointed', 'with the food'], distortions:['delighted with the food', 'curious about the food', 'worried about the food'] }),
  phrase('inconvenient_car', 'not suitable for people without a car', 'inconvenient for people without a car', ['vocab_inconvenient'], { chunks:['inconvenient', 'for people', 'without a car'], distortions:['comfortable for people without a car', 'popular with people without a car', 'free for people without a car'] }),
  phrase('excellent_service', 'service of a very high standard', 'excellent service', ['vocab_excellent'], { acceptedVariants:['outstanding service'], chunks:['excellent', 'service'], distortions:['slow service', 'average service', 'free service'] }),
  phrase('polite_guests', 'showing good manners to guests', 'polite to guests', ['vocab_polite'], { acceptedVariants:['courteous to guests'], chunks:['polite', 'to guests'], distortions:['rude to guests', 'afraid of guests', 'busy with guests'] }),
  phrase('helpful_staff', 'staff who are willing to give useful help', 'helpful staff', ['vocab_helpful'], { chunks:['helpful', 'staff'], distortions:['unfriendly staff', 'busy staff', 'new staff'] }),
  phrase('recommendation_friend', 'a suggestion from a friend', 'a recommendation from a friend', ['vocab_recommendation'], { chunks:['a recommendation', 'from a friend'], distortions:['a complaint from a friend', 'a gift from a friend', 'a question from a friend'] }),
  phrase('informative_leaflet', 'a leaflet that gives useful facts', 'an informative leaflet', ['vocab_informative'], { chunks:['an', 'informative', 'leaflet'], distortions:['a colourful leaflet', 'a misleading leaflet', 'a long leaflet'] }),
  phrase('reflection_lesson', 'careful thought about the lesson', 'reflection on the lesson', ['vocab_reflection'], { chunks:['reflection', 'on the lesson'], distortions:['a complaint about the lesson', 'a prize for the lesson', 'a quick answer in the lesson'] }),
  phrase('organiser_picnic', 'the person who plans the picnic', 'the organiser of the picnic', ['vocab_organiser'], { acceptedVariants:['the picnic organiser'], chunks:['the organiser', 'of the picnic'], distortions:['a guest at the picnic', 'the winner of the picnic', 'the cook at the picnic'] }),
  phrase('presenter_programme', 'the host of the programme', 'the presenter of the programme', ['vocab_presenter'], { acceptedVariants:['the programme presenter'], chunks:['the presenter', 'of the programme'], distortions:['a viewer of the programme', 'the cook on the programme', 'a guest on the programme'] }),
  phrase('evaluate_menu', 'judge how good the menu is', 'evaluate the menu', ['vocab_evaluate'], { acceptedVariants:['assess the menu'], chunks:['evaluate', 'the menu'], distortions:['copy the menu', 'print the menu', 'change the menu'] }),
  phrase('consume_rice', 'eat or use up a lot of rice', 'consume a lot of rice', ['vocab_consume'], { chunks:['consume', 'a lot of rice'], distortions:['grow a lot of rice', 'sell a lot of rice', 'waste a lot of rice'] }),
  phrase('balanced_diet', 'a diet with the right mix of foods', 'a balanced diet', ['vocab_balanced'], { chunks:['a', 'balanced', 'diet'], distortions:['a very strict diet', 'a diet of one food', 'a cheap diet'] }),
  phrase('calorie_count', 'the amount of food energy in the meal', 'the calorie count of the meal', ['vocab_calorie'], { chunks:['the calorie count', 'of the meal'], distortions:['the weight of the meal', 'the price of the meal', 'the cooking time of the meal'] }),
  phrase('hygienic_kitchen', 'a kitchen that is clean and free from germs', 'a hygienic kitchen', ['vocab_hygienic'], { chunks:['a', 'hygienic', 'kitchen'], distortions:['a tidy kitchen', 'a modern kitchen', 'a noisy kitchen'] }),
  phrase('appetising_smell', 'a smell that makes you want to eat', 'an appetising smell', ['vocab_appetising'], { acceptedVariants:['a tempting smell'], chunks:['an', 'appetising', 'smell'], distortions:['a strong smell', 'an unpleasant smell', 'a smell of smoke'] }),
  phrase('cuisine_region', 'the cooking style of the region', 'the cuisine of the region', ['vocab_cuisine'], { acceptedVariants:['the regional cuisine'], chunks:['the cuisine', 'of the region'], distortions:['the climate of the region', 'the shops of the region', 'the farmers of the region'] })

];

const ideaSets = [
  idea('participant', 'Every participant in the baking contest must bring their own ingredients.', ['Everyone who takes part in the baking contest has to bring their own ingredients.', 'All the people entering the baking contest must provide their own ingredients.', 'Each person competing in the baking contest is required to bring ingredients themselves.'], 'quantity', 'everyone brings their own ingredients', [
    { text:'Only the winner of the baking contest must bring their own ingredients.', misconceptionCategory:'quantity_change' },
    { text:'Every spectator at the baking contest must bring their own ingredients.', misconceptionCategory:'meaning_confusion' },
    { text:'Everyone who takes part in the baking contest receives free ingredients.', misconceptionCategory:'polarity_change' }
  ], ['vocab_participant']),
  idea('outlet', 'The company plans to open a new outlet in every major city.', ['The firm intends to open a new shop in each large city.', 'The company wants to set up another store in every big city.', 'A new branch will be opened by the company in every major city.'], 'quantity', 'a new one in every major city', [
    { text:'The company plans to open a new shop in only one major city.', misconceptionCategory:'quantity_change' },
    { text:'The company plans to close its shops in every major city.', misconceptionCategory:'polarity_change' },
    { text:'The company plans to build a new factory in every major city.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_outlet']),
  idea('sprinkled', 'The cook sprinkled a little cinnamon on the porridge.', ['The cook scattered a small amount of cinnamon over the porridge.', 'A small amount of cinnamon was shaken lightly onto the porridge by the cook.', 'The cook put just a pinch of cinnamon on top of the porridge.'], 'quantity', 'a small amount', [
    { text:'The cook poured a lot of cinnamon into the porridge.', misconceptionCategory:'degree_change' },
    { text:'The cook removed the cinnamon from the porridge.', misconceptionCategory:'omitted_information' },
    { text:'The cook mixed a little cinnamon into the porridge and left it overnight.', misconceptionCategory:'added_information' }
  ], ['vocab_sprinkled']),
  idea('underestimate', 'Many people underestimate how much sugar is in fruit juice.', ['Many people think there is less sugar in fruit juice than there really is.', 'Fruit juice contains more sugar than many people realise.', 'Many people do not realise how much sugar fruit juice contains.'], 'comparison', 'more sugar than people think', [
    { text:'Many people think there is more sugar in fruit juice than there really is.', misconceptionCategory:'comparison_change' },
    { text:'Many people know exactly how much sugar fruit juice contains.', misconceptionCategory:'polarity_change' },
    { text:'Many people dislike the taste of sugar in fruit juice.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_underestimate']),
  idea('considerably', 'Fast-food prices have risen considerably over the last decade.', ['The cost of fast food has gone up a great deal in the past ten years.', 'Over the past ten years, fast-food prices have increased by a large amount.', 'Fast food is much more expensive than it was ten years ago.'], 'degree', 'a large increase', [
    { text:'Fast-food prices have risen slightly over the last decade.', misconceptionCategory:'degree_change' },
    { text:'Fast-food prices have fallen a great deal over the last decade.', misconceptionCategory:'polarity_change' },
    { text:'Fast-food prices rose sharply last week.', misconceptionCategory:'time_change' }
  ], ['vocab_considerably']),
  idea('guaranteed', 'The shop guaranteed that the strawberries would be fresh.', ['The shop promised for certain that the strawberries would be fresh.', 'The shop gave a firm promise that the strawberries would be fresh.', 'The shop assured us that the strawberries were certain to be fresh.'], 'degree', 'complete certainty', [
    { text:'The shop hoped that the strawberries would be fresh.', misconceptionCategory:'degree_change' },
    { text:'The shop warned that the strawberries might not be fresh.', misconceptionCategory:'polarity_change' },
    { text:'The shop promised that the strawberries would be cheap.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_guaranteed']),
  idea('harmless', 'Doctors say that the new sweetener is harmless in small amounts.', ['Doctors say that small amounts of the new sweetener are safe.', 'Doctors believe the new sweetener does no damage when eaten in small quantities.', 'According to doctors, small quantities of the new sweetener are not dangerous.'], 'quantity', 'small amounts only', [
    { text:'Doctors say that the new sweetener is safe in any amount.', misconceptionCategory:'quantity_change' },
    { text:'Doctors say that the new sweetener is dangerous even in small amounts.', misconceptionCategory:'polarity_change' },
    { text:'Doctors say that the new sweetener tastes very sweet in small amounts.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_harmless']),
  idea('pressure', 'Teenagers often feel pressure to try the latest food trends.', ['Teenagers often feel strongly pushed to try the latest food trends.', 'Teenagers frequently feel that they have to try the newest food trends.', 'Young people are often made to feel they must follow the newest food trends.'], 'cause_effect', 'others push them to try food trends', [
    { text:'Teenagers rarely feel any need to try the latest food trends.', misconceptionCategory:'degree_change' },
    { text:'Teenagers often feel excited about the latest food trends.', misconceptionCategory:'meaning_confusion' },
    { text:'Teenagers often feel tired because they tried the latest food trends.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_pressure']),
  idea('fooled', 'The customers were fooled by the fake discount sign.', ['The fake discount sign tricked the customers.', 'The customers were deceived by the false sign advertising lower prices.', 'The sign made the customers believe in a discount that did not exist.'], 'cause_effect', 'the sign caused a false belief', [
    { text:'The customers noticed that the discount sign was fake.', misconceptionCategory:'polarity_change' },
    { text:'The customers were pleased by the real discount sign.', misconceptionCategory:'meaning_confusion' },
    { text:'The fake discount sign was put up by the customers.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_fooled']),
  idea('majority', 'The majority of pupils chose pasta for the school party.', ['Most of the pupils chose pasta for the school party.', 'More than half the pupils picked pasta for the school party.', 'Pasta was the choice of most pupils for the school party.'], 'quantity', 'most of the pupils', [
    { text:'A few pupils chose pasta for the school party.', misconceptionCategory:'quantity_change' },
    { text:'Every pupil chose pasta for the school party.', misconceptionCategory:'quantity_change' },
    { text:'Only the teachers chose pasta for the school party.', misconceptionCategory:'added_information' }
  ], ['vocab_majority']),
  idea('inexpensive', 'The cafe near school offers an inexpensive lunch for students.', ['The cafe near school sells a cheap lunch to students.', 'Students can buy lunch at the nearby cafe without spending much.', 'Lunch for students at the cafe near school does not cost much.'], 'degree', 'a low price', [
    { text:'The cafe near school offers a free lunch for students.', misconceptionCategory:'degree_change' },
    { text:'The cafe near school offers an expensive lunch for students.', misconceptionCategory:'polarity_change' },
    { text:'The cafe near school offers lunch only to teachers.', misconceptionCategory:'added_information' }
  ], ['vocab_inexpensive']),
  idea('sodium', 'Food labels show how much sodium a portion contains.', ['Food labels state the quantity of the mineral found in salt in each portion.', 'Packaging tells you how much of the mineral in salt is in a single serving.', 'Each label gives the amount of the mineral that salt contains for one portion.'], 'quantity', 'amount per portion', [
    { text:'Food labels state the amount of vitamins in each portion.', misconceptionCategory:'meaning_confusion' },
    { text:'Food labels state only the total weight of each portion.', misconceptionCategory:'omitted_information' },
    { text:'Food labels state the amount of the mineral found in salt in the whole box.', misconceptionCategory:'quantity_change' }
  ], ['vocab_sodium']),
  idea('commercially', 'The farm grows strawberries commercially and sells them to supermarkets.', ['The farm grows strawberries as a business and sells them to supermarkets.', 'The farm grows strawberries in order to sell them to supermarkets for profit.', 'Supermarkets buy the strawberries that the farm grows to sell.'], 'cause_effect', 'grown in order to sell', [
    { text:'The farm grows strawberries only for the family and never sells them.', misconceptionCategory:'polarity_change' },
    { text:'The farm grows strawberries and sells them only at the farm gate.', misconceptionCategory:'meaning_confusion' },
    { text:'The farm buys strawberries from supermarkets.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_commercially']),
  idea('processed', 'Many ready meals are made with processed meat, such as ham and sausages.', ['Many ready meals are made with meat prepared in factories, such as ham and sausages.', 'Ham and sausages, which are made in factories, are found in many ready meals.', 'Ready meals often contain factory-made meat such as ham and sausages.'], 'quantity', 'many ready meals', [
    { text:'Few ready meals are made with meat prepared in factories.', misconceptionCategory:'quantity_change' },
    { text:'Many ready meals are made with fresh meat from local farms.', misconceptionCategory:'meaning_confusion' },
    { text:'Many ready meals are made without any meat.', misconceptionCategory:'omitted_information' }
  ], ['vocab_processed']),
  idea('depression', 'Students who suffer from depression may find it hard to concentrate in lessons.', ['Students who feel deep, long-lasting sadness may find it hard to concentrate in lessons.', 'Concentrating in lessons can be hard for students who have felt deeply sad for a long time.', 'It may be difficult for students with long-lasting sadness to focus in lessons.'], 'degree', 'long-lasting deep sadness', [
    { text:'Students who feel nervous before a test may find it hard to concentrate in lessons.', misconceptionCategory:'meaning_confusion' },
    { text:'Students who feel deeply sad for a long time find it easy to concentrate in lessons.', misconceptionCategory:'polarity_change' },
    { text:'Students who feel long-lasting sadness always fail their lessons.', misconceptionCategory:'degree_change' }
  ], ['vocab_depression']),
  idea('overweight', 'About a third of the pupils in the survey were overweight.', ['About a third of the pupils in the survey weighed more than is healthy for their height.', 'Roughly a third of the pupils in the survey were heavier than is healthy for their height.', 'One in three pupils in the survey was above a healthy weight.'], 'quantity', 'about a third', [
    { text:'About two thirds of the pupils in the survey weighed more than is healthy for their height.', misconceptionCategory:'quantity_change' },
    { text:'About a third of the pupils in the survey weighed less than is healthy for their height.', misconceptionCategory:'comparison_change' },
    { text:'About a third of the pupils in the survey were taller than the others.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_overweight']),
  idea('unwell', 'The chef went home early because he felt unwell.', ['The chef left early because he was ill.', 'Feeling ill, the chef went home early.', 'The chef went home before the end of the day as he was not feeling well.'], 'cause_effect', 'left because ill', [
    { text:'The chef went home early because he was angry with the manager.', misconceptionCategory:'cause_effect_change' },
    { text:'The chef stayed late even though he felt ill.', misconceptionCategory:'time_change' },
    { text:'The chef felt ill because he went home early.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_unwell']),
  idea('ingredients', 'The cook checked the ingredients before starting the recipe.', ['The cook looked at the foods needed for the recipe before beginning it.', 'Before beginning the recipe, the cook made sure of the foods that go into it.', 'The cook examined what the recipe needed before starting to cook.'], 'time', 'before starting', [
    { text:'The cook checked the foods needed for the recipe after finishing it.', misconceptionCategory:'time_change' },
    { text:'The cook bought new pans before starting the recipe.', misconceptionCategory:'meaning_confusion' },
    { text:'The cook skipped checking and started the recipe at once.', misconceptionCategory:'polarity_change' }
  ], ['vocab_ingredients']),
  idea('nutritious', 'The canteen serves a nutritious meal every day.', ['The canteen serves a healthy meal every day.', 'Every day the canteen provides a meal that is good for the body.', 'Each day the canteen offers food that gives the body what it needs.'], 'time', 'every day', [
    { text:'The canteen serves a healthy meal only on Fridays.', misconceptionCategory:'time_change' },
    { text:'The canteen serves a sugary meal every day.', misconceptionCategory:'meaning_confusion' },
    { text:'The canteen sells a healthy meal every day at a high price.', misconceptionCategory:'added_information' }
  ], ['vocab_nutritious']),
  idea('moderation', 'The teacher suggested eating sweets in moderation.', ['The teacher suggested eating sweets in sensible amounts, not too much.', 'The teacher advised having only a reasonable amount of sweets.', 'Sweets, said the teacher, should be eaten but not in large quantities.'], 'degree', 'a limited amount', [
    { text:'The teacher suggested never eating sweets at all.', misconceptionCategory:'degree_change' },
    { text:'The teacher suggested eating as many sweets as possible.', misconceptionCategory:'degree_change' },
    { text:'The teacher suggested giving sweets to friends.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_moderation']),
  idea('deceive', 'Some adverts deceive children by making sweets look healthy.', ['Some adverts mislead children by making sweets seem healthy.', 'Certain adverts trick children into thinking that sweets are healthy.', 'By making sweets look healthy, some adverts give children a false idea.'], 'cause_effect', 'adverts cause a false belief', [
    { text:'Some adverts warn children that sweets are not healthy.', misconceptionCategory:'polarity_change' },
    { text:'Some adverts persuade children to buy healthy fruit.', misconceptionCategory:'meaning_confusion' },
    { text:'Some adverts show children how to make sweets.', misconceptionCategory:'added_information' }
  ], ['vocab_deceive']),
  idea('advertisement', 'The advertisement for the new pizza appears on television every evening.', ['The advert for the new pizza is shown on television every evening.', 'Every evening, television shows an advert for the new pizza.', 'An advert for the new pizza comes on the television each evening.'], 'time', 'every evening', [
    { text:'The advert for the new pizza appears on television only on Sundays.', misconceptionCategory:'time_change' },
    { text:'The review of the new pizza appears on television every evening.', misconceptionCategory:'meaning_confusion' },
    { text:'The advert for the new pizza appeared on television once last year.', misconceptionCategory:'time_change' }
  ], ['vocab_advertisement']),
  idea('variety', 'The market offers a wide variety of fresh fruit.', ['The market sells a large range of fresh fruit.', 'Shoppers at the market can choose from many different kinds of fresh fruit.', 'Many kinds of fresh fruit are available at the market.'], 'quantity', 'many kinds', [
    { text:'The market sells only one kind of fresh fruit.', misconceptionCategory:'quantity_change' },
    { text:'The market sells a large amount of the same fresh fruit.', misconceptionCategory:'meaning_confusion' },
    { text:'The market offers fresh fruit at a low price.', misconceptionCategory:'added_information' }
  ], ['vocab_variety']),
  idea('portion', 'The restaurant gives customers a large portion of rice with every curry.', ['The restaurant serves a big helping of rice with each curry.', 'With every curry, the restaurant gives customers a generous serving of rice.', 'Each curry comes with a big amount of rice for one person.'], 'degree', 'large', [
    { text:'The restaurant serves a tiny helping of rice with each curry.', misconceptionCategory:'degree_change' },
    { text:'The restaurant serves a big helping of rice with only some curries.', misconceptionCategory:'quantity_change' },
    { text:'The restaurant sells large bags of rice with every curry.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_portion']),
  idea('purchase', 'Please keep the receipt for every purchase you make in the shop.', ['Please keep the receipt for everything you buy in the shop.', 'Make sure you hold on to the receipt for each item you buy in the shop.', 'The receipt for each thing bought in the shop should be kept.'], 'quantity', 'every item', [
    { text:'Please keep the receipt only for the most expensive thing you buy in the shop.', misconceptionCategory:'quantity_change' },
    { text:'Please throw away the receipt for everything you buy in the shop.', misconceptionCategory:'polarity_change' },
    { text:'Please keep the receipt for every item you sell in the shop.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_purchase']),
  idea('takeaway', 'We usually order a takeaway on Friday evenings.', ['We usually order a meal to eat at home on Friday evenings.', 'On Friday evenings we normally buy hot food from a restaurant to eat at home.', 'Friday evening is when we typically get a restaurant meal to take home.'], 'time', 'Friday evenings', [
    { text:'We usually order a meal to eat at home on Sunday mornings.', misconceptionCategory:'time_change' },
    { text:'We usually cook a meal at home on Friday evenings.', misconceptionCategory:'polarity_change' },
    { text:'We usually eat at a restaurant table on Friday evenings.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_takeaway']),
  idea('barbecue', 'Our neighbours hold a barbecue in the garden every summer.', ['Every summer, our neighbours have an outdoor meal cooked over a fire in their garden.', 'Each summer our neighbours throw a garden party where food is grilled.', 'Our neighbours cook food outdoors at a party in their garden each summer.'], 'time', 'every summer', [
    { text:'Our neighbours hold an outdoor cooking party in their garden every winter.', misconceptionCategory:'time_change' },
    { text:'Our neighbours hold a formal dinner indoors every summer.', misconceptionCategory:'meaning_confusion' },
    { text:'Our neighbours hold an outdoor cooking party in their garden every summer and charge guests money.', misconceptionCategory:'added_information' }
  ], ['vocab_barbecue']),
  idea('saturated', 'Butter contains more saturated fat than olive oil.', ['Butter contains more of the type of fat found in fatty meat than olive oil does.', 'Compared with butter, olive oil contains less of the type of fat found in cheese and fatty meat.', 'Butter has a higher amount of the type of fat found in cheese and fatty meat than olive oil has.'], 'comparison', 'butter has more', [
    { text:'Olive oil contains more of the type of fat found in cheese and fatty meat than butter does.', misconceptionCategory:'comparison_change' },
    { text:'Butter contains less of the type of fat found in cheese and fatty meat than olive oil does.', misconceptionCategory:'comparison_change' },
    { text:'Butter costs more than olive oil.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_saturated']),
  idea('convenient', 'Ready meals are convenient for people who work long hours.', ['Ready meals are handy for people who work long hours.', 'People who work long hours find ready meals easy and time-saving.', 'For those with long working hours, ready meals save time and effort.'], 'cause_effect', 'saves time and effort', [
    { text:'Ready meals are cheap for people who work long hours.', misconceptionCategory:'meaning_confusion' },
    { text:'Ready meals are unpopular with people who work long hours.', misconceptionCategory:'polarity_change' },
    { text:'Ready meals are healthy for people who work long hours.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_convenient']),
  idea('extensive', 'The restaurant has an extensive menu with over a hundred dishes.', ['The restaurant has a wide-ranging menu with over a hundred dishes.', 'There are more than a hundred dishes on the restaurant’s very large menu.', 'The restaurant’s menu is very large and lists over a hundred dishes.'], 'quantity', 'over a hundred dishes', [
    { text:'The restaurant has a short menu with fewer than ten dishes.', misconceptionCategory:'quantity_change' },
    { text:'The restaurant has a menu with over a hundred dishes, all of them free.', misconceptionCategory:'added_information' },
    { text:'The restaurant has an expensive menu with only a few dishes.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_extensive']),
  idea('fashionable', 'Vegan burgers have become fashionable among teenagers in the city.', ['Vegan burgers have become trendy with teenagers in the city.', 'Teenagers in the city now think vegan burgers are in style.', 'Among teenagers in the city, vegan burgers have turned into a popular trend.'], 'time', 'has become popular recently', [
    { text:'Vegan burgers have become cheaper for teenagers in the city.', misconceptionCategory:'meaning_confusion' },
    { text:'Vegan burgers have always been popular among teenagers in the city.', misconceptionCategory:'time_change' },
    { text:'Vegan burgers have become unpopular among teenagers in the city.', misconceptionCategory:'polarity_change' }
  ], ['vocab_fashionable']),
  idea('satisfying', 'The hot soup was satisfying after the long walk in the cold.', ['The hot soup was very pleasing after the long, cold walk.', 'After the long walk in the cold, the hot soup was just what we wanted.', 'The hot soup gave us a pleasant feeling after the cold walk.'], 'time', 'after the long walk', [
    { text:'The hot soup was disappointing after the long walk in the cold.', misconceptionCategory:'polarity_change' },
    { text:'The hot soup was served before the long walk in the cold.', misconceptionCategory:'time_change' },
    { text:'The hot soup was too hot to eat after the long walk in the cold.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_satisfying']),
  idea('reasonable', 'Most customers think the prices at this cafe are reasonable.', ['Most customers believe the prices at this cafe are fair.', 'Most diners consider that this cafe charges fair prices.', 'Customers generally find the cafe’s prices fair.'], 'quantity', 'most customers', [
    { text:'A few customers think the prices at this cafe are fair.', misconceptionCategory:'quantity_change' },
    { text:'Most customers think the prices at this cafe are too high.', misconceptionCategory:'polarity_change' },
    { text:'Most customers think the portions at this cafe are large.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_reasonable_3']),
  idea('disappointed', 'Many diners were disappointed that the restaurant had no vegetarian dishes.', ['Many diners felt let down because the restaurant had no vegetarian dishes.', 'Many diners were unhappy that the restaurant offered no vegetarian dishes.', 'The lack of vegetarian dishes at the restaurant left many diners let down.'], 'cause_effect', 'no vegetarian dishes caused unhappiness', [
    { text:'Many diners were delighted that the restaurant had no vegetarian dishes.', misconceptionCategory:'polarity_change' },
    { text:'Many diners were unhappy that the restaurant had no meat dishes.', misconceptionCategory:'cause_effect_change' },
    { text:'A few diners felt let down that the restaurant had no vegetarian dishes.', misconceptionCategory:'quantity_change' }
  ], ['vocab_disappointed']),
  idea('inconvenient', 'The restaurant’s location is inconvenient for people without a car.', ['The restaurant’s location is not suitable for people without a car.', 'People without a car find the restaurant’s location troublesome.', 'Reaching the restaurant is difficult for people who do not have a car.'], 'polarity', 'difficult for people without a car', [
    { text:'The restaurant’s location is ideal for people without a car.', misconceptionCategory:'polarity_change' },
    { text:'The restaurant’s location is expensive for people without a car.', misconceptionCategory:'meaning_confusion' },
    { text:'The restaurant’s location is not suitable for people with a car.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_inconvenient']),
  idea('excellent', 'The reviews describe the service at the new restaurant as excellent.', ['The reviews describe the service at the new restaurant as outstanding.', 'According to the reviews, the new restaurant’s service is of a very high standard.', 'Reviewers say the service at the new restaurant is much better than most.'], 'degree', 'a very high standard', [
    { text:'The reviews describe the service at the new restaurant as average.', misconceptionCategory:'degree_change' },
    { text:'The reviews describe the service at the new restaurant as terrible.', misconceptionCategory:'polarity_change' },
    { text:'The reviews describe the prices at the new restaurant as outstanding.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_excellent']),
  idea('polite', 'The waiter was polite to every customer, even during the busy lunch hour.', ['The waiter showed good manners to every customer, even during the busy lunch hour.', 'Even at the busy lunch hour, the waiter was courteous to each customer.', 'Every customer was treated with respect by the waiter, even during the busy lunch hour.'], 'quantity', 'every customer', [
    { text:'The waiter showed good manners only to regular customers, even during the busy lunch hour.', misconceptionCategory:'quantity_change' },
    { text:'The waiter was rude to every customer, even during the busy lunch hour.', misconceptionCategory:'polarity_change' },
    { text:'The waiter was quick with every customer, even during the busy lunch hour.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_polite']),
  idea('helpful', 'The staff were helpful and answered all our questions about the menu.', ['The staff were willing to help and answered all our questions about the menu.', 'The staff gave useful answers to all our questions about the menu.', 'All our questions about the menu were answered by friendly, supportive staff.'], 'quantity', 'all questions', [
    { text:'The staff were willing to help but answered only some of our questions about the menu.', misconceptionCategory:'quantity_change' },
    { text:'The staff refused to answer our questions about the menu.', misconceptionCategory:'polarity_change' },
    { text:'The staff were friendly and gave us a free dessert.', misconceptionCategory:'added_information' }
  ], ['vocab_helpful']),
  idea('recommendation', 'We chose the cafe on the recommendation of our teacher.', ['We chose the cafe because our teacher suggested it.', 'Our teacher suggested the cafe, so we went there.', 'The cafe was our choice after advice from our teacher.'], 'cause_effect', 'the teacher suggested it', [
    { text:'We chose the cafe because our teacher complained about it.', misconceptionCategory:'cause_effect_change' },
    { text:'We chose the cafe, so our teacher suggested it.', misconceptionCategory:'cause_effect_change' },
    { text:'We chose the cafe because our teacher paid for it.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_recommendation']),
  idea('informative', 'The leaflet about healthy eating was informative and easy to read.', ['The leaflet about healthy eating gave useful facts and was easy to read.', 'The healthy eating leaflet was full of facts and easy to read.', 'Readers learned a lot from the clear leaflet about healthy eating.'], 'degree', 'full of useful facts', [
    { text:'The leaflet about healthy eating was funny and easy to read.', misconceptionCategory:'meaning_confusion' },
    { text:'The leaflet about healthy eating gave no facts and was easy to read.', misconceptionCategory:'polarity_change' },
    { text:'The leaflet about healthy eating gave useful facts but was hard to read.', misconceptionCategory:'degree_change' }
  ], ['vocab_informative']),
  idea('reflection', 'After some reflection, the owner decided to change the menu.', ['After thinking about it carefully, the owner decided to change the menu.', 'The owner thought carefully and then decided to change the menu.', 'Once she had thought it over, the owner decided to change the menu.'], 'time', 'after careful thought', [
    { text:'Before thinking about it, the owner decided to change the menu.', misconceptionCategory:'time_change' },
    { text:'After some thinking, the owner decided to keep the menu the same.', misconceptionCategory:'polarity_change' },
    { text:'After a short argument, the owner decided to change the menu.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_reflection']),
  idea('organiser', 'The organiser of the food fair booked forty stalls for the weekend.', ['The person who arranged the food fair booked forty stalls for the weekend.', 'The food fair’s planner booked forty stalls for the weekend.', 'The person in charge of planning the food fair booked forty stalls for the weekend.'], 'quantity', 'forty stalls', [
    { text:'A visitor to the food fair booked forty stalls for the weekend.', misconceptionCategory:'meaning_confusion' },
    { text:'The person who arranged the food fair booked only four stalls for the weekend.', misconceptionCategory:'quantity_change' },
    { text:'The person who arranged the food fair cancelled forty stalls for the weekend.', misconceptionCategory:'polarity_change' }
  ], ['vocab_organiser']),
  idea('presenter', 'The presenter of the programme introduced three guest chefs.', ['The host of the programme introduced three guest chefs.', 'The programme’s host introduced three guest chefs.', 'The person leading the programme introduced three guest chefs.'], 'quantity', 'three guest chefs', [
    { text:'A viewer of the programme introduced three guest chefs.', misconceptionCategory:'meaning_confusion' },
    { text:'The host of the programme introduced only one guest chef.', misconceptionCategory:'quantity_change' },
    { text:'The host of the programme introduced three guest chefs and then cooked a meal.', misconceptionCategory:'added_information' }
  ], ['vocab_presenter']),
  idea('evaluate', 'Judges evaluate each dish carefully before giving a score.', ['Judges assess each dish carefully before giving a score.', 'Before giving a score, judges carefully judge the quality of each dish.', 'Judges give each dish a careful assessment before scoring it.'], 'time', 'before giving a score', [
    { text:'Judges give a score to each dish before looking at it carefully.', misconceptionCategory:'time_change' },
    { text:'Judges ignore each dish and simply give a score.', misconceptionCategory:'polarity_change' },
    { text:'Judges cook each dish carefully before giving a score.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_evaluate']),
  idea('consume', 'Visitors to the festival consume thousands of snacks every day.', ['Visitors to the festival eat thousands of snacks every day.', 'Every day, thousands of snacks are eaten by visitors to the festival.', 'Festival visitors get through thousands of snacks every day.'], 'quantity', 'thousands of snacks', [
    { text:'Visitors to the festival eat a few snacks every day.', misconceptionCategory:'quantity_change' },
    { text:'Visitors to the festival sell thousands of snacks every day.', misconceptionCategory:'meaning_confusion' },
    { text:'Visitors to the festival eat thousands of snacks every week.', misconceptionCategory:'time_change' }
  ], ['vocab_consume']),
  idea('balanced', 'The school lunch is balanced, with vegetables, protein and rice.', ['The school lunch has the right mix of vegetables, protein and rice.', 'The school lunch contains vegetables, protein and rice in the right amounts.', 'In the school lunch, vegetables, protein and rice are well proportioned.'], 'degree', 'right proportions', [
    { text:'The school lunch contains too much rice and almost no vegetables or protein.', misconceptionCategory:'degree_change' },
    { text:'The school lunch is cheap, with vegetables, protein and rice.', misconceptionCategory:'meaning_confusion' },
    { text:'The school lunch has the right mix of vegetables and rice.', misconceptionCategory:'omitted_information' }
  ], ['vocab_balanced']),
  idea('calorie', 'The nutrition label gives the calorie value of one portion.', ['The nutrition label gives the energy value of one portion.', 'The label states how much food energy one portion contains.', 'The food energy in one portion is shown on the nutrition label.'], 'quantity', 'one portion', [
    { text:'The nutrition label gives the energy value of the whole packet.', misconceptionCategory:'quantity_change' },
    { text:'The nutrition label gives the price of one portion.', misconceptionCategory:'meaning_confusion' },
    { text:'The nutrition label gives the energy value of one portion and the cooking time.', misconceptionCategory:'added_information' }
  ], ['vocab_calorie']),
  idea('hygienic', 'The inspector said that the kitchen was hygienic.', ['The inspector said that the kitchen was clean and free from germs.', 'According to the inspector, the kitchen was clean and safe from germs.', 'The inspector found that the kitchen was free from dirt and germs.'], 'polarity', 'the kitchen was clean and safe', [
    { text:'The inspector said that the kitchen was dirty and unsafe.', misconceptionCategory:'polarity_change' },
    { text:'The inspector said that the kitchen was tidy and large.', misconceptionCategory:'meaning_confusion' },
    { text:'The inspector said that the kitchen was clean and that the staff were friendly.', misconceptionCategory:'added_information' }
  ], ['vocab_hygienic']),
  idea('appetising', 'The smell of the soup was appetising, so we ordered two bowls.', ['The smell of the soup was so tempting that we ordered two bowls.', 'We ordered two bowls because the smell of the soup was mouth-watering.', 'The mouth-watering smell of the soup made us order two bowls.'], 'cause_effect', 'the smell led to the order', [
    { text:'We ordered two bowls, so the smell of the soup was tempting.', misconceptionCategory:'cause_effect_change' },
    { text:'The smell of the soup was unpleasant, so we ordered two bowls.', misconceptionCategory:'polarity_change' },
    { text:'The smell of the soup was tempting, so we ordered one bowl.', misconceptionCategory:'quantity_change' }
  ], ['vocab_appetising']),
  idea('cuisine', 'Many tourists visit the region to enjoy its local cuisine.', ['Many tourists visit the region to enjoy its local style of cooking.', 'Many tourists travel to the region to enjoy its traditional cooking.', 'The region’s local cooking attracts many tourists.'], 'quantity', 'many tourists', [
    { text:'A few tourists visit the region to enjoy its local style of cooking.', misconceptionCategory:'quantity_change' },
    { text:'Many tourists avoid the region because of its local style of cooking.', misconceptionCategory:'polarity_change' },
    { text:'Many tourists visit the region to enjoy its local weather.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_cuisine'])

];

export default [...phraseSets, ...ideaSets];
