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
  phrase('majority_customers', 'most of the customers', 'the majority of the customers', ['vocab_majority'], { acceptedVariants:['a majority of the customers'], chunks:['the majority', 'of the customers'], distortions:['a few of the customers', 'all of the customers', 'none of the customers'] })
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
  ], ['vocab_majority'])
];

export default [...phraseSets, ...ideaSets];
