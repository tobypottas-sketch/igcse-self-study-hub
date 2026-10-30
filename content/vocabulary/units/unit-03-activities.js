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
  phrase('extensive_gardens', 'very large gardens', 'extensive gardens', ['vocab_extensive'], { chunks:['extensive', 'gardens'], distortions:['tiny gardens', 'private gardens', 'dull gardens'] })

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
  ], ['vocab_extensive'])

];

export default [...phraseSets, ...ideaSets];
