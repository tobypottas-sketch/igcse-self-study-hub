// Unit 5 Precision & Use content: two "weak wording -> precise word" items per word, WORDS 1–10 ONLY. Same contract as unit-04-precision-use.js:
// each item is a writing_set improve_vocabulary record; the weak wording quoted in the prompt appears exactly once in sourceText and not at its
// start; distractors fit the sentence grammatically but are wrong in meaning.
const status = 'approved';
const unitNumber = 5;
function precision(id, vocabularyId, prompt, sourceText, acceptedAnswers, distractors) {
  return {
    activityContentId:id, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'improve_vocabulary', prompt, sourceText, acceptedAnswers, distractors, linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}
const P = weak => `Replace “${weak}” with a more precise Unit 5 word or phrase.`;

export default [
  precision('u5_writing_precision_aerial_tourism_a', 'vocab_aerial_tourism', P('sightseeing from the air'), 'Visitors to the canyon increasingly choose sightseeing from the air because it saves time.', ['aerial tourism'], ['coach tourism', 'camping holidays', 'river cruising']),
  precision('u5_writing_precision_aerial_tourism_b', 'vocab_aerial_tourism', P('flights that show visitors the land from above'), 'The company specialises in flights that show visitors the land from above and employs twelve pilots.', ['aerial tourism'], ['business travel', 'pilot training', 'cargo transport']),
  precision('u5_writing_precision_underwater_photography_a', 'vocab_underwater_photography', P('taking pictures beneath the surface'), 'She earns her living from taking pictures beneath the surface and sells her work to travel magazines.', ['underwater photography'], ['street photography', 'wedding photography', 'portrait painting']),
  precision('u5_writing_precision_underwater_photography_b', 'vocab_underwater_photography', P('camera work under the sea'), 'The course teaches camera work under the sea, including how to protect equipment from salt water.', ['underwater photography'], ['mountain climbing', 'boat building', 'wildlife painting']),
  precision('u5_writing_precision_documentary_a', 'vocab_documentary', P('factual film'), 'Our geography teacher showed us a factual film about the effects of tourism on small islands.', ['documentary'], ['comedy', 'cartoon', 'musical']),
  precision('u5_writing_precision_documentary_b', 'vocab_documentary', P('film about real people and places'), 'The festival will show a film about real people and places on Friday evening.', ['documentary'], ['thriller', 'cartoon', 'sitcom']),
  precision('u5_writing_precision_snorkelling_a', 'vocab_snorkelling', P('swimming with a mask and tube'), 'The hotel offers free lessons in swimming with a mask and tube for guests under sixteen.', ['snorkelling'], ['windsurfing', 'sailing', 'fishing']),
  precision('u5_writing_precision_snorkelling_b', 'vocab_snorkelling', P('swimming near the surface to watch fish'), 'Visitors enjoy swimming near the surface to watch fish in the clear, warm shallows.', ['snorkelling'], ['sunbathing', 'shopping', 'camping']),
  precision('u5_writing_precision_expedition_a', 'vocab_expedition', P('long journeys'), 'The museum displays the diaries of explorers who went on long journeys across the polar ice.', ['expeditions'], ['holidays', 'errands', 'shopping trips']),
  precision('u5_writing_precision_expedition_b', 'vocab_expedition', P('organised journey'), 'Scientists spent a month on an organised journey to study the glaciers of Greenland.', ['expedition'], ['inspection', 'examination', 'exhibition']),
  precision('u5_writing_precision_yacht_a', 'vocab_yacht', P('pleasure boat'), 'The millionaire spends every August on his pleasure boat near the south coast of France.', ['yacht'], ['lorry', 'tractor', 'coach']),
  precision('u5_writing_precision_yacht_b', 'vocab_yacht', P('large boat with sails for racing'), 'The crew trained for months on a large boat with sails for racing before the regatta.', ['yacht'], ['bus', 'train', 'lorry']),
  precision('u5_writing_precision_scenery_a', 'vocab_scenery', P('natural views'), 'Many tourists choose the Lake District for its natural views and peaceful villages.', ['scenery'], ['shopping', 'nightlife', 'transport']),
  precision('u5_writing_precision_scenery_b', 'vocab_scenery', P('beautiful views of hills, rivers and forests'), 'Walkers praised the beautiful views of hills, rivers and forests around the village.', ['scenery'], ['shops', 'prices', 'buses']),
  precision('u5_writing_precision_attractions_a', 'vocab_attractions', P('places that tourists like to visit'), 'The new guidebook lists the best places that tourists like to visit in the northern region.', ['attractions'], ['hotels', 'buses', 'airports']),
  precision('u5_writing_precision_attractions_b', 'vocab_attractions', P('things to see and do'), 'There are plenty of things to see and do for families, including a zoo and an aquarium.', ['attractions'], ['hotels', 'campsites', 'restaurants']),
  precision('u5_writing_precision_accommodation_a', 'vocab_accommodation', P('a place to stay'), 'The tourist office can help you find a place to stay for the weekend.', ['accommodation'], ['transport', 'tickets', 'insurance']),
  precision('u5_writing_precision_accommodation_b', 'vocab_accommodation', P('rooms and beds'), 'The festival organisers have arranged rooms and beds for guests in the local schools.', ['accommodation'], ['transport', 'meals', 'tickets']),
  precision('u5_writing_precision_adventurous_a', 'vocab_adventurous', P('willing to try new things'), 'Hikers who are willing to try new things can follow the unmarked path along the cliffs.', ['adventurous'], ['cautious', 'nervous', 'careful']),
  precision('u5_writing_precision_adventurous_b', 'vocab_adventurous', P('brave and keen to try new things'), 'My cousin is brave and keen to try new things, so he has visited forty countries alone.', ['adventurous'], ['cautious', 'nervous', 'lazy'])
];
