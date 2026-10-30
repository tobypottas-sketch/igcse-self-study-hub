// Unit 3 · Word Families — authored families, WORDS 1–10 ONLY. Same contract as unit-02-word-families.js: every row is AUTHORED (stated part of
// speech, one natural example containing the form exactly once and not as the first word, and the reason the form is worth teaching). A family
// needs >= 3 pedagogically useful forms INCLUDING the headword and >= 2 parts of speech. Headwords with no genuine family are listed under
// unit3WordFamilyRejected rather than padded with unnatural forms.
const f = (form, partOfSpeech, example, why, note) => ({ form, partOfSpeech, example, why, ...(note ? { note } : {}) });

export const unit3WordFamilies = Object.freeze({
  participant: { forms: [
    f('participant', 'noun', 'Every participant in the quiz received a small prize.', 'Headword.'),
    f('participate', 'verb', 'Students are encouraged to participate in at least one school club.', 'The verb behind the noun; very common in school and sports texts.'),
    f('participation', 'noun', 'Active participation in class helps students remember new vocabulary.', 'The abstract noun for taking part; common in reports and surveys.')
  ], excludedForms: [{ form: 'participatory', reason: 'Rare adjective beyond the level of this unit.' }] },
  sprinkled: { forms: [
    f('sprinkled', 'verb', 'Mum sprinkled a little cinnamon on top of the porridge.', 'Headword (past form).'),
    f('sprinkle', 'verb', 'You can sprinkle grated cheese over the pasta just before serving.', 'Base verb used in recipes.'),
    f('sprinkling', 'noun', 'The soup was finished with a sprinkling of fresh parsley.', 'Noun for a light scattering; also used for a small number, as in “a sprinkling of customers”.')
  ], excludedForms: [{ form: 'sprinkler', reason: 'A different device sense (watering or fire safety), so it does not extend the meaning of “sprinkled”.' }] },
  underestimate: { forms: [
    f('underestimate', 'verb', 'Never underestimate how tiring it is to work in a busy kitchen.', 'Headword.'),
    f('estimate', 'noun', 'The chef gave a rough estimate of how many guests would arrive.', 'The base noun for a rough calculation; common in everyday and exam texts.'),
    f('overestimate', 'verb', 'Beginners often overestimate how much food they can eat at a buffet.', 'The direct opposite; the pair is worth learning together.')
  ], excludedForms: [{ form: 'estimated', reason: 'Already a Unit 1 target word.' }] },
  harmless: { forms: [
    f('harmless', 'adjective', 'The tiny insect on the lettuce was completely harmless.', 'Headword.'),
    f('harm', 'noun', 'A single sweet will do no harm to a healthy child.', 'The base noun; “do no harm” is a frequent phrase.'),
    f('harmful', 'adjective', 'Smoking is harmful to the lungs.', 'The opposite adjective; the pair is worth learning together.')
  ], excludedForms: [{ form: 'harmlessly', reason: 'Rare adverb; not useful at this level.' }] },
  inexpensive: { forms: [
    f('inexpensive', 'adjective', 'The cafe sells inexpensive sandwiches near the station.', 'Headword.'),
    f('expensive', 'adjective', 'Fresh seafood is often more expensive than chicken in this region.', 'The base adjective; “inexpensive” is built from it with the prefix in-.'),
    f('expense', 'noun', 'Food is the biggest expense for many students living away from home.', 'Noun for money spent; common in reports and budgets.')
  ], excludedForms: [{ form: 'inexpensively', reason: 'Rare adverb; not useful at this level.' }] },
  processed: { forms: [
    f('processed', 'adjective', 'Tinned beans and frozen pizza are common processed foods.', 'Headword.'),
    f('process', 'verb', 'The factory can process thousands of litres of milk every day.', 'The base verb used for treating food in a factory.'),
    f('processing', 'noun', 'Food processing often adds salt, sugar or preservatives to products.', 'Noun for the factory activity; common in food-industry texts.')
  ], excludedForms: [{ form: 'processor', reason: 'Mostly a machine or computer sense (food processor, computer processor).' }] },
  depression: { forms: [
    f('depression', 'noun', 'Many students find it helpful to talk about depression with someone they trust.', 'Headword.'),
    f('depressed', 'adjective', 'Several families felt depressed after hearing the bad news about the factory closing.', 'Adjective for feeling very sad; common in everyday and news texts.'),
    f('depressing', 'adjective', 'The grey weather and the empty cafe made the evening feel depressing.', 'Adjective for something that makes people feel sad; contrasts with “depressed”.')
  ], excludedForms: [{ form: 'depress', reason: 'The verb is formal and less common than the adjectives.' }] },
  overweight: { forms: [
    f('overweight', 'adjective', 'The chart shows which children are overweight for their height.', 'Headword.'),
    f('weight', 'noun', 'The nurse recorded each child’s weight and height in a notebook.', 'The base noun; “overweight” is built from it.'),
    f('underweight', 'adjective', 'The charity gave extra meals to children who were underweight.', 'The opposite adjective; the pair is worth learning together.')
  ], excludedForms: [{ form: 'weigh', reason: 'A verb with several separate senses; not needed for this word.' }] },
  nutritious: { forms: [
    f('nutritious', 'adjective', 'The school provides a nutritious lunch for every student.', 'Headword.'),
    f('nutrition', 'noun', 'The school offers a short course on nutrition for parents and students.', 'The noun for the study of food and the body; common in school texts.'),
    f('nutritional', 'adjective', 'Each packet carries a table of nutritional information.', 'Adjective used before nouns such as value and information.')
  ], excludedForms: [{ form: 'nutritionist', reason: 'A job noun beyond the level of this unit.' }] },
  moderation: { forms: [
    f('moderation', 'noun', 'Our teacher says that fast food is fine in moderation.', 'Headword.'),
    f('moderate', 'adjective', 'Add a moderate amount of salt, not too much and not too little.', 'The base adjective; “moderate” means neither too much nor too little.'),
    f('moderately', 'adverb', 'The restaurant is moderately priced, so most families can afford it.', 'Adverb used before adjectives.')
  ], excludedForms: [{ form: 'moderator', reason: 'A person who leads a discussion; a different sense.' }] },
  deceive: { forms: [
    f('deceive', 'verb', 'Some websites deceive customers with fake reviews.', 'Headword.'),
    f('deception', 'noun', 'The cheating was a clear case of deception, and customers lost trust in the brand.', 'The noun for the act of misleading; common in news and law texts.'),
    f('deceptive', 'adjective', 'The photograph on the menu was deceptive, because the real dish was much smaller.', 'Adjective for something that gives a false impression; common about adverts and labels.')
  ], excludedForms: [{ form: 'deceit', reason: 'Formal noun beyond the level of this unit.' }, { form: 'deceptively', reason: 'Rare adverb; not useful at this level.' }] },
  advertisement: { forms: [
    f('advertisement', 'noun', 'The advertisement showed the burger far larger than it really is.', 'Headword.'),
    f('advertise', 'verb', 'Fast-food companies advertise their products during children’s programmes.', 'The base verb; very common in consumer texts.'),
    f('advertising', 'noun', 'Food advertising aimed at children is controlled by law in many countries.', 'The noun for the whole activity; a frequent topic in essays.')
  ], excludedForms: [{ form: 'advertiser', reason: 'A job-title noun that does not extend the meaning of the word.' }] },
  variety: { forms: [
    f('variety', 'noun', 'The market has a great variety of fresh fish.', 'Headword.'),
    f('vary', 'verb', 'Prices of vegetables vary from season to season.', 'The base verb meaning to be different or to change.'),
    f('various', 'adjective', 'The cafe serves various kinds of soup.', 'Common adjective meaning several different kinds.')
  ], excludedForms: [{ form: 'variation', reason: 'Abstract noun beyond the level of this unit.' }] },
  convenient: { forms: [
    f('convenient', 'adjective', 'Frozen peas are convenient because they keep for months.', 'Headword.'),
    f('convenience', 'noun', 'Online shopping offers great convenience to people with busy lives.', 'The abstract noun; people choose some foods for convenience.'),
    f('conveniently', 'adverb', 'The cafe is conveniently located next to the bus station.', 'Common adverb in descriptions of places.')
  ], excludedForms: [{ form: 'inconvenient', reason: 'Useful, but not needed for this word’s family at this level.' }] },
  extensive: { forms: [
    f('extensive', 'adjective', 'The restaurant has an extensive menu with over a hundred dishes.', 'Headword.'),
    f('extent', 'noun', 'The report studied the extent of food waste in the school canteen.', 'The noun for how far or how large something is.'),
    f('extensively', 'adverb', 'The chef has travelled extensively to learn about street food.', 'Adverb meaning to a wide degree.')
  ], excludedForms: [{ form: 'extend', reason: 'The main sense (make longer) differs from “large or wide-ranging”.' }] },
  fashionable: { forms: [
    f('fashionable', 'adjective', 'Bubble tea is a fashionable drink among teenagers in the city.', 'Headword.'),
    f('fashion', 'noun', 'Restaurant menus often follow fashion, so dishes that were popular last year may disappear.', 'The base noun for what is popular at a time; not only clothes.'),
    f('unfashionable', 'adjective', 'Five years ago, kale was unfashionable, but now it appears on many menus.', 'The opposite adjective; the pair is worth learning together.')
  ], excludedForms: [{ form: 'fashionably', reason: 'Rare adverb; not useful at this level.' }] },
  satisfying: { forms: [
    f('satisfying', 'adjective', 'A bowl of hot soup is satisfying after a long walk in the cold.', 'Headword.'),
    f('satisfy', 'verb', 'One small sandwich will not satisfy a hungry teenager after sport.', 'The base verb: to give someone what they need or want.'),
    f('satisfied', 'adjective', 'The customers were satisfied with the service and left a generous tip.', 'Adjective for the person who feels pleased; contrasts with “satisfying”.'),
    f('satisfaction', 'noun', 'Many cooks say that the greatest satisfaction comes from seeing guests enjoy their food.', 'The noun for the pleased feeling; common in customer-service texts.')
  ], excludedForms: [{ form: 'satisfactory', reason: 'Means only “good enough”, so the sense is weaker than the rest of the family.' }] },
  reasonable: { forms: [
    f('reasonable', 'adjective', 'Her complaint was reasonable, because the soup really was cold.', 'Headword.'),
    f('reasonably', 'adverb', 'The soup was reasonably hot, so we ate it before it cooled.', 'Adverb meaning fairly or to a sensible degree.'),
    f('unreasonable', 'adjective', 'It is unreasonable to expect a fast meal in a crowded restaurant.', 'The opposite adjective; the pair is worth learning together.')
  ], excludedForms: [{ form: 'reason', reason: 'The noun mostly means “cause”, a looser sense than “fair and sensible”.' }] },
  disappointed: { forms: [
    f('disappointed', 'adjective', 'We were disappointed by the soup, which was cold and tasted of nothing.', 'Headword.'),
    f('disappoint', 'verb', 'I do not want to disappoint my guests, so I will check the recipe again.', 'The base verb: to let someone down.'),
    f('disappointing', 'adjective', 'The service was slow and the food was disappointing.', 'Adjective for the thing that causes the feeling; contrasts with “disappointed”.'),
    f('disappointment', 'noun', 'To her disappointment, the cafe was closed on Mondays.', 'The noun for the feeling; common in the phrase “to my disappointment”.')
  ], excludedForms: [] },
  inconvenient: { forms: [
    f('inconvenient', 'adjective', 'The cafe is open only from ten to two, which is inconvenient for office workers.', 'Headword.'),
    f('inconvenience', 'noun', 'We apologise for any inconvenience caused by the closure of the kitchen.', 'The noun used in notices and apologies.'),
    f('inconveniently', 'adverb', 'The bus stop is inconveniently far from the restaurant.', 'Adverb used for badly placed or badly timed things.')
  ], excludedForms: [{ form: 'convenient', reason: 'Already a Unit 3 target word.' }] },
  excellent: { forms: [
    f('excellent', 'adjective', 'The reviews describe the food as excellent and the staff as friendly.', 'Headword.'),
    f('excel', 'verb', 'Some students excel at science but find cooking difficult.', 'The verb: to be much better than others at something.'),
    f('excellence', 'noun', 'The hotel is famous for the excellence of its breakfast buffet.', 'The abstract noun for a very high standard.')
  ], excludedForms: [{ form: 'excellently', reason: 'Rare adverb; not useful at this level.' }] },
  polite: { forms: [
    f('polite', 'adjective', 'It is polite to say thank you to the person who brings your food.', 'Headword.'),
    f('politely', 'adverb', 'The waiter politely asked us to move to a larger table.', 'Adverb used for how people speak or ask.'),
    f('politeness', 'noun', 'Staff are trained in politeness, so they always greet customers warmly.', 'The noun for good manners; common in customer-service texts.')
  ], excludedForms: [{ form: 'impolite', reason: 'Useful, but the family is already complete without it.' }] },
  helpful: { forms: [
    f('helpful', 'adjective', 'The staff in the cafe were friendly and helpful.', 'Headword.'),
    f('help', 'verb', 'Can you help me choose a dish from this long menu?', 'The base verb; also a noun.'),
    f('unhelpful', 'adjective', 'The unhelpful waiter did not explain a single dish on the menu.', 'The opposite adjective; the pair is worth learning together.')
  ], excludedForms: [{ form: 'helpless', reason: 'Means unable to act, a different sense from “willing to help”.' }] },
  recommendation: { forms: [
    f('recommendation', 'noun', 'We chose this restaurant on the recommendation of a friend.', 'Headword.'),
    f('recommend', 'verb', 'Could you recommend a quiet restaurant near the station?', 'The base verb; very common in reviews and spoken English.'),
    f('recommended', 'adjective', 'The label gives the recommended amount for one person.', 'Adjective for something that is advised or suggested.')
  ], excludedForms: [] },
  informative: { forms: [
    f('informative', 'adjective', 'The guide to local food was informative, with clear facts about every dish.', 'Headword.'),
    f('inform', 'verb', 'Please inform the waiter if you have any special dietary needs.', 'The base verb: to give someone facts.'),
    f('information', 'noun', 'The menu gives clear information about every dish.', 'The uncountable noun for facts; very frequent.')
  ], excludedForms: [{ form: 'informed', reason: 'Already a Unit 2 target word.' }] }

});

export const unit3WordFamilyRejected = Object.freeze({
  outlet: 'No derived forms of this sense exist.',
  considerably: '“considerable” shares the sense, but “consider”, “consideration” and “considerate” drift to different meanings, so there is no clean family.',
  guaranteed: '“guarantee” is both noun and verb with one spelling, so there are fewer than three distinct forms; “guarantor” is legal and rare.',
  fooled: '“foolish” belongs to the unwise-person sense, not “tricked”, and “fool” is one spelling as noun and verb.',
  pressure: 'Noun and verb share one spelling; “press” is a different sense (push) and “pressurise” is technical.',
  majority: 'The only relative is “major”, which has a different sense.',
  sodium: 'A technical word with no derived forms in everyday use.',
  commercially: '“commercial” shares the sense, but “commerce” is formal and rare, and “commercialise” is beyond the level, so there is no third useful form.',
  unwell: 'The base “well” has several unrelated senses (adverb, noun, adjective) and “wellbeing” differs in meaning, so there is no clean family.',
  ingredients: '“ingredient” is only the singular of the same word, so there are no other forms.',
  portion: '“portion” as a verb is only the phrasal “portion out”, and “proportion” has a different sense, so there is no useful family.',
  purchase: 'Noun and verb share one spelling, and “purchaser” is rare, so there are fewer than three useful distinct forms.',
  takeaway: 'A compound noun with no derived forms; the verb phrase “take away” is a different structure and sense.',
  barbecue: 'The other forms (barbecued, barbecuing) are only verb inflections, not a derivational family.',
  saturated: 'The related forms (saturate, saturation, unsaturated) mostly belong to the “soaked” sense or a technical sense, so the nutrition sense has no second useful part of speech.'

});
