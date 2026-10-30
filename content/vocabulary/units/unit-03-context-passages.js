// Unit 3 · Context · Mastery (type_in_passage) — authored short passages, WORDS 1–10 ONLY. Same contract as unit-02-context-passages.js:
// two passages per word, each 2-3 natural sentences with exactly ONE gap (`____`); the passage never contains the target elsewhere, never starts
// with the gap, and makes the target the natural fit. `answer` is the exact surface form typed. `why` records what points to the word.
const p = (text, answer, why) => ({ text, answer, why });

export default Object.freeze({
  participant: [
    p('The cooking competition attracted forty people from different schools. Every ____ had to prepare a three-course meal in just two hours.', 'participant', 'Competition; "Every ____ had to prepare".'),
    p('Researchers wanted to learn about teenage eating habits. Each ____ in the survey was asked to write down everything eaten for seven days.', 'participant', 'Survey; "Each ____ in the survey".')
  ],
  outlet: [
    p('The company began with one small cafe in Leeds. Today it has more than two hundred branches, and a new ____ opens in a different town almost every month.', 'outlet', 'Chain of branches; "a new ____ opens".'),
    p('Most of the bakery’s bread goes to supermarkets. However, the company also owns a small retail ____ on the high street.', 'outlet', '"retail ____" for a shop belonging to a company.')
  ],
  sprinkled: [
    p('The chef finished the dessert with a flourish. She ____ a handful of chopped nuts over the cream and then handed the plate to the waiter.', 'sprinkled', 'Finishing a dessert; nuts over cream.'),
    p('Salt is cheap and easy to use. The cook ____ a pinch of it onto the chips just before they were served.', 'sprinkled', '"a pinch of it onto the chips".')
  ],
  underestimate: [
    p('Many people believe a salad is always healthy. They ____ how much oil and cream can be hidden in the dressing.', 'underestimate', 'Wrong belief about hidden fat; "____ how much".'),
    p('Beginners should not ____ how long it takes to prepare a meal from fresh ingredients. Many of them are still cooking after two hours.', 'underestimate', 'Takes longer than expected; "should not ____ how long".')
  ],
  considerably: [
    p('Ten years ago, a school lunch cost two pounds. Today the same meal costs ____ more, and many families find it hard to pay.', 'considerably', 'Big price rise; "costs ____ more".'),
    p('The new recipe has less than half the sugar of the old one. As a result, the cake tastes ____ less sweet.', 'considerably', 'Half the sugar; "____ less sweet".')
  ],
  guaranteed: [
    p('The restaurant had a strict policy on quality. It ____ a full refund to any customer who was unhappy with a dish.', 'guaranteed', 'Strict policy; a refund promised for certain.'),
    p('The label on the carton was clear. The farm ____ that the milk was fresh, and the date on every bottle proved it.', 'guaranteed', 'Label and date prove a firm statement.')
  ],
  harmless: [
    p('Some people are afraid of spiders in the kitchen. However, the common house spider is completely ____ and may even catch other insects.', 'harmless', 'Fear contrasted with "However"; "completely ____".'),
    p('Eating a single biscuit now and then is fine. In small amounts, many sweet snacks are ____, but eating them all day is a different matter.', 'harmless', 'Contrast: small amounts versus all day.')
  ],
  pressure: [
    p('Hana did not really like spicy food, but all her friends ordered the hottest curry. She felt ____ to do the same, so she ordered it too.', 'pressure', 'Friends order; she felt ____ to do the same.'),
    p('Advertisers aim their adverts at children. Parents often say they are under great ____ to buy the advertised snacks.', 'pressure', '"under great ____ to buy".')
  ],
  fooled: [
    p('The photo made the burger look enormous. Customers who believed it were ____, because the real burger was half the size.', 'fooled', 'Photo versus real size; believed something false.'),
    p('The label said “natural” in big green letters. Do not be ____ by this word, because many natural foods contain a lot of sugar.', 'fooled', '"Do not be ____ by this word".')
  ],
  majority: [
    p('Thirty students voted on the new canteen menu. Twenty-two of them chose the vegetarian option, so the ____ got what they wanted.', 'majority', '22 of 30; "the ____ got what they wanted".'),
    p('A few customers complained about the price. However, the great ____ left the restaurant happy.', 'majority', 'Few complained; "the great ____".')
  ],
  inexpensive: [
    p('Hana only had five pounds for lunch. Luckily, the market stall sold a hot, ____ meal of rice and vegetables.', 'inexpensive', 'Only five pounds; a meal she could afford.'),
    p('Many students live far from home and have little spending money. They look for ____ restaurants where a full meal costs only a few pounds.', 'inexpensive', 'Little spending money; "full meal costs only a few pounds".')
  ],
  sodium: [
    p('Table salt is made of two elements, chlorine and ____. Nutrition labels often show how much of it a food contains.', 'sodium', 'Salt = chlorine + ____; labels show amounts.'),
    p('Pupils compared the labels on three kinds of soup. The tinned soup listed the highest amount of ____, so it tasted the saltiest.', 'sodium', 'Label amount linked to salty taste.')
  ],
  commercially: [
    p('A small family bakery began by baking for neighbours. Now it produces bread ____ and delivers to shops in three cities.', 'commercially', 'Neighbours versus shops in three cities.'),
    p('Some wild berries are tasty but difficult to harvest. They are rarely grown ____, because the cost is higher than the price shoppers will pay.', 'commercially', 'Cost versus price shoppers pay.')
  ],
  processed: [
    p('Ali compared a fresh tomato with ketchup. He learned that ketchup is a ____ food, made by machines from tomatoes, sugar and vinegar.', 'processed', 'Fresh versus ketchup made by machines.'),
    p('The supermarket has two sections. One has fresh fruit and vegetables, and the other has ____ products such as sausages, tinned beans and frozen pizza.', 'processed', 'Contrast with fresh; examples of tinned and frozen food.')
  ],
  depression: [
    p('Months of bad news left Karim feeling empty and hopeless. His teacher noticed the signs of ____ and suggested a talk with the school counsellor.', 'depression', 'Empty and hopeless for months; counsellor.'),
    p('Everyone feels sad sometimes, but ____ is different because the sadness and hopelessness last for weeks or months. Charities help by giving people a place to talk.', 'depression', 'Contrast with ordinary sadness; lasts for weeks.')
  ],
  overweight: [
    p('The nurse weighed and measured every pupil in Year 9. She then compared the results with a chart to see who was ____ for their height.', 'overweight', 'Chart comparing weight and height.'),
    p('The jockey is very small and light. If he were even a little ____, his horse would have to carry extra load and might lose the race.', 'overweight', 'Small and light versus extra load.')
  ],
  unwell: [
    p('Sara looked pale and kept holding her stomach during class. The teacher asked if she was ____ and sent her to the nurse.', 'unwell', 'Pale; holding stomach; nurse.'),
    p('The restaurant owner has a strict rule for the kitchen. If any member of staff feels ____, they must stay at home, which protects customers as well as workers.', 'unwell', 'Stay at home to protect customers.')
  ],
  ingredients: [
    p('To make the sauce, you need tomatoes, garlic and olive oil. Write a list of all the ____ before you go shopping.', 'ingredients', 'List of foods before shopping.'),
    p('The label on the biscuit packet was very long. It listed all the ____ in order, from the largest amount to the smallest.', 'ingredients', 'Label order of amounts.')
  ],
  nutritious: [
    p('Sam usually ate chips and sweets for lunch. His mother wanted him to try something more ____, so she packed rice, eggs and fruit.', 'nutritious', 'Contrast with chips and sweets.'),
    p('Spinach is not the tastiest vegetable, but it is full of vitamins and minerals. Dietitians call it a very ____ food.', 'nutritious', 'Vitamins and minerals; "very ____ food".')
  ],
  moderation: [
    p('Mr Lee never gives up his favourite desserts. He simply eats them in ____, one small piece on Sundays.', 'moderation', '"in ____, one small piece on Sundays".'),
    p('The old saying “too much of anything is bad” teaches the value of ____. Even good things can cause problems if you have huge amounts of them.', 'moderation', 'Saying about too much.')
  ],
  deceive: [
    p('Some adverts use clever photographs. Their aim is to ____ customers, because the real meal looks much smaller than the picture.', 'deceive', 'Picture bigger than the real meal.'),
    p('Honest shopkeepers never try to ____ their customers. They tell the truth about where the food comes from and what it contains.', 'deceive', 'Contrast with telling the truth.')
  ],
  advertisement: [
    p('Last night, a colourful ____ for a new burger appeared between two television programmes. It showed smiling people, a low price and the shop’s address.', 'advertisement', 'Between programmes; low price and address.'),
    p('The restaurant wanted more customers. It put an ____ in the local newspaper, with a photograph of its most popular dish and a special offer.', 'advertisement', 'Newspaper; photograph and special offer.')
  ],
  variety: [
    p('There is a huge ____ of food at the festival. Stalls sell noodles, tacos, pancakes, sushi and ice cream from many countries.', 'variety', 'List of very different foods.'),
    p('Eating the same lunch every day can become boring. A good meal plan includes a ____ of vegetables, so that each day brings new colours and flavours.', 'variety', 'Boring versus new colours and flavours.')
  ],
  portion: [
    p('The restaurant gives each guest a very generous ____ of rice. Many people take some home in a box.', 'portion', 'Generous amount of rice; leftovers.'),
    p('Nutrition labels show the size of one ____. Shoppers can then compare how much sugar is in the amount a person usually eats.', 'portion', 'Label size for one person.')
  ],
  purchase: [
    p('Tom saved his pocket money for weeks. His first big ____ was a set of kitchen knives, and he was proud to carry them home.', 'purchase', 'Saved money; carried it home.'),
    p('Before you pay, check the price on the shelf. After every ____ in a supermarket, keep the receipt, because it proves what you paid.', 'purchase', 'Receipt proves payment.')
  ],
  takeaway: [
    p('Neither of my parents had time to cook last night. Dad phoned the Indian restaurant and collected a ____ on his way home.', 'takeaway', 'Collected on the way home.'),
    p('I do not like waiting for a table. When I am in a hurry, I order a ____ so that I can eat at home or in the park.', 'takeaway', 'Avoids waiting for a table.')
  ],
  barbecue: [
    p('The weather forecast promised a hot Saturday. Our neighbours invited everyone to a ____ in their garden, where they cooked burgers and corn over hot coals.', 'barbecue', 'Garden; cooked over hot coals.'),
    p('My uncle lit the charcoal and put the chicken on the metal frame. At our family ____, everyone eats outside and shares food from the same table.', 'barbecue', 'Charcoal and eating outside.')
  ],
  saturated: [
    p('Pupils in the food technology class compared two foods. Butter contains much more ____ fat than olive oil, and it stays hard in the fridge.', 'saturated', 'Butter versus olive oil; stays hard.'),
    p('The nutrition label has a line for fat and another line for ____ fat. The second line is smaller, because it shows only the kind found in butter and fatty meat.', 'saturated', 'Second line for the kind in butter and meat.')
  ],
  convenient: [
    p('Kim has a very busy week with little time to shop. She likes the small supermarket near her flat, because it is open late and she can buy dinner on her way home. It is a very ____ shop.', 'convenient', 'Open late; on her way home.'),
    p('Ready-to-heat meals are popular with busy families. They are not always the cheapest choice, but they are ____ because they save time in the kitchen.', 'convenient', 'Saves time.')
  ],
  extensive: [
    p('Wei wanted to be a chef, so he read widely about cooking. His ____ knowledge of world cuisines impressed the judges at the competition.', 'extensive', 'Read widely; impressed the judges.'),
    p('The hotel has a huge garden with fruit trees, vegetable beds and a lake. Guests enjoy walking in the ____ grounds before dinner.', 'extensive', 'Huge garden with a lake.')
  ]

});
