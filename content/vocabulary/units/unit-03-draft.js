// UNIT 3 – FOOD: authoring draft (batch 1 = words 1–10). Source: 0511 key words UNIT 3 – FOOD (coursebook order). Words 11–50 are not locked yet.
// Same architecture as unit-02.js. Check: node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-03-draft.js
// A draft (status 'draft') is never in releases/, so the release tooling ignores it. Rename to unit-03.js only when all 50 words are final.
import { buildCuratedUnit } from '../build-unit.js';
import { LEXICAL_SPELLING_ERRORS } from '../lexical-spelling-errors.js';
import unit3Activities from './unit-03-activities.js';
import unit3PrecisionUse from './unit-03-precision-use.js';
import unit3WordFamilyItems from './unit-03-word-family-items.js';
import unit3Collocations from './unit-03-collocations.js';
import unit3SituationExtras from './unit-03-situation-extras.js';
import unit3MeaningMatch from './unit-03-meaning-match.js';
import unit3MeaningMastery from './unit-03-meaning-mastery.js';
import unit3ContextPassages from './unit-03-context-passages.js';
import { unit3WordFamilies, unit3WordFamilyRejected } from './unit-03-word-families.js';
import { unit3WordFamilyAlternates } from './unit-03-word-family-alternates.js';

const UNIT_NUMBER = 3;
const status = 'draft';

const e = (term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence, paraphraseSource, paraphraseSentence, productionSource, productionSentence, extras = {}) => ({
  term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence,
  paraphrase:{ source:paraphraseSource, sentence:paraphraseSentence },
  production:{ source:productionSource, sentence:productionSentence },
  ...extras
});

const entries = [
  e('participant', 'noun',
    'a person who takes part in an activity or event',
    ['person taking part', 'someone who joins in'],
    ['a person who watches an event', 'a person who organises an event', 'a person who pays for an event'],
    'Every participant in the cooking competition received a certificate.',
    'person taking part', 'Every person taking part in the cooking competition received a certificate.',
    'someone who joins in', 'The someone who joins in a food-tasting workshop must wear an apron.',
    {
      masteryContexts:[
        { text:'Each participant in the cooking class received a free recipe book.', meaning:'a person who takes part in an activity' },
        { text:'Researchers asked every participant in the food survey to keep a diary.', meaning:'someone who joins in a study or activity' }
      ],
      situationDistractors:[
        'The audience sat quietly and watched the chef cook on the stage.',
        'The organiser checked the tickets at the door and counted the chairs.',
        'The sponsor paid for the food but did not attend the event.'
      ],
      retrievalContexts:[
        { id:'1', text:'Each participant in the cooking competition had to prepare a three-course meal in two hours.', target:'participant', grammarPattern:'' },
        { id:'2', text:'The researchers gave every participant in the study a food diary and asked them to record everything they ate for a week.', target:'participant', grammarPattern:'' },
        { id:'3', text:'The youngest participant in the charity fun run crossed the finishing line holding her mother’s hand.', target:'participant', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'participant', wrong:['spectator', 'judge', 'sponsor'] },
        { id:'2', answer:'participant', wrong:['journalist', 'supplier', 'inspector'] },
        { id:'3', answer:'participant', wrong:['sponsor', 'referee', 'commentator'] }
      ]
    }),
  e('outlet', 'noun',
    'a place, such as a shop or restaurant, where a company sells its products',
    ['shop or restaurant', 'place that sells products'],
    ['a plug socket for electrical equipment', 'a pipe that carries water away', 'a way of expressing strong feelings'],
    'The company opened a new fast-food outlet in the town centre last month.',
    'shop or restaurant', 'The company opened a new fast-food shop or restaurant in the town centre last month.',
    'place that sells products', 'A place that sells products from local farms has opened near the station.',
    {
      masteryContexts:[
        { text:'There is a new coffee outlet opposite the school gates.', meaning:'a place where a company sells its products' },
        { text:'Each outlet in the chain serves the same menu at the same prices.', meaning:'one shop or restaurant belonging to a larger company' }
      ],
      situationDistractors:[
        'The factory produced thousands of sandwiches every morning and sent them away in vans.',
        'The company’s head office is in London and employs three hundred managers.',
        'A food blogger reviewed the new menu on her website.'
      ],
      retrievalContexts:[
        { id:'1', text:'There is a new fast-food outlet next to the cinema, so many teenagers eat there after films.', target:'outlet', grammarPattern:'' },
        { id:'2', text:'The restaurant chain plans to open another outlet in the shopping centre next year.', target:'outlet', grammarPattern:'' },
        { id:'3', text:'Each outlet of the bakery chain closes at six o’clock in the evening.', target:'outlet', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'outlet', wrong:['factory', 'office', 'farm'] },
        { id:'2', answer:'outlet', wrong:['recipe', 'menu', 'customer'] },
        { id:'3', answer:'outlet', wrong:['recipe', 'loaf', 'delivery'] }
      ]
    }),
  e('sprinkled', 'verb',
    'scattered small pieces or drops of something lightly over a surface',
    ['scattered', 'spread lightly'],
    ['poured a large amount of liquid into something', 'cut something into very small pieces', 'removed something from a surface'],
    'The chef sprinkled fresh herbs over the soup just before serving it.',
    'scattered', 'The chef scattered fresh herbs over the soup just before serving it.',
    'scattered', 'Dad scattered sugar over the pancakes while they were still warm.',
    {
      masteryContexts:[
        { text:'She sprinkled grated cheese over the pasta before putting it under the grill.', meaning:'scattered small pieces over something' },
        { text:'The waiter sprinkled a little salt on the chips and handed them over.', meaning:'shook small amounts onto something' }
      ],
      situationDistractors:[
        'The cook poured the whole bottle of oil into the pan at once.',
        'He wrapped the sandwiches tightly in paper and put them in his bag.',
        'She mixed the flour and eggs together in a large bowl.'
      ],
      retrievalContexts:[
        { id:'1', text:'Before serving, the chef sprinkled a few chopped nuts over the dessert.', target:'sprinkled', grammarPattern:'' },
        { id:'2', text:'She sprinkled some salt on the chips to give them more flavour.', target:'sprinkled', grammarPattern:'' },
        { id:'3', text:'The cake looked beautiful because it was sprinkled with tiny chocolate pieces.', target:'sprinkled', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'sprinkled', wrong:['boiled', 'peeled', 'sliced'] },
        { id:'2', answer:'sprinkled', wrong:['boiled', 'peeled', 'washed'] },
        { id:'3', answer:'sprinkled', wrong:['boiled', 'peeled', 'weighed'] }
      ]
    }),
  e('underestimate', 'verb',
    'to think that something is smaller, weaker or less important than it really is',
    ['think too little of', 'rate too low'],
    ['to guess the cost of something exactly', 'to make something larger than it was', 'to count something again carefully'],
    'Do not underestimate the power of a good breakfast on a school day.',
    'think too little of', 'Do not think too little of the power of a good breakfast on a school day.',
    'think too little of', 'Some parents think too little of the effect of sugary snacks on their children.',
    {
      grammarForms:{ base:'underestimate', thirdPerson:'underestimates', past:'underestimated', pastParticiple:'underestimated', ing:'underestimating' },
      masteryContexts:[
        { text:'Most people underestimate the amount of salt in processed food, so they are shocked when they read the label.', meaning:'think something is less than it really is' },
        { text:'It is easy to underestimate the time needed to cook a family meal from scratch, and many people finish dinner much later than planned.', meaning:'judge something to be smaller or easier than it is' }
      ],
      situationDistractors:[
        'He checked the recipe twice and set the timer for the exact cooking time.',
        'The teacher praised the students for working out the cost so accurately.',
        'The guide warned the group that the path would be long and difficult.'
      ],
      retrievalContexts:[
        { id:'1', text:'Many people underestimate the amount of sugar in a single can of fizzy drink.', target:'underestimate', grammarPattern:'' },
        { id:'2', text:'Cooking a proper meal from fresh ingredients takes longer than most beginners expect, so they often underestimate the time they need.', target:'underestimate', grammarPattern:'' },
        { id:'3', text:'Do not underestimate your opponent; he may look weak, but he is the national champion.', target:'underestimate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'underestimate', wrong:['photograph', 'borrow', 'celebrate'] },
        { id:'2', answer:'underestimate', wrong:['invite', 'repair', 'photograph'] },
        { id:'3', answer:'underestimate', wrong:['carry', 'copy', 'paint'] }
      ]
    }),
  e('considerably', 'adverb',
    'by a large amount',
    ['a great deal', 'much'],
    ['by a very small amount', 'in a careful and polite way', 'for a short time'],
    'Eating out has become considerably more expensive in the last five years.',
    'a great deal', 'Eating out has become a great deal more expensive in the last five years.',
    'much', 'Fresh bread is much cheaper at the market than in the supermarket.',
    {
      masteryContexts:[
        { text:'Prices at the school canteen have risen considerably since September.', meaning:'by a large amount' },
        { text:'The new menu is considerably healthier than the old one, with half the sugar and far more vegetables.', meaning:'to a much greater degree' }
      ],
      situationDistractors:[
        'The price of a school lunch went up by two pence last term.',
        'The cafe is slightly cheaper than the one next door.',
        'Prices stayed exactly the same for the whole year.'
      ],
      retrievalContexts:[
        { id:'1', text:'Since the new chef arrived, the quality of the food has improved considerably.', target:'considerably', grammarPattern:'' },
        { id:'2', text:'A bottle of water costs considerably more at the airport than in a supermarket.', target:'considerably', grammarPattern:'' },
        { id:'3', text:'Many teenagers now eat considerably less fruit than their grandparents did at the same age.', target:'considerably', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'considerably', wrong:['rarely', 'politely', 'silently'] },
        { id:'2', answer:'considerably', wrong:['carefully', 'quietly', 'politely'] },
        { id:'3', answer:'considerably', wrong:['carefully', 'quietly', 'happily'] }
      ]
    }),
  e('guaranteed', 'verb',
    'promised that something will definitely happen or be true',
    ['promised', 'assured'],
    ['warned that something might go wrong', 'asked whether something was true', 'refused to say whether something would happen'],
    'The restaurant guaranteed that every dish was free from nuts.',
    'promised', 'The restaurant promised that every dish was free from nuts.',
    'assured', 'The manager assured us that the fish was fresh.',
    {
      masteryContexts:[
        { text:'The company guaranteed a full refund if customers were not satisfied.', meaning:'promised for certain' },
        { text:'The shop guaranteed that all its eggs came from local farms, and showed the certificates to prove it.', meaning:'stated with complete certainty' }
      ],
      situationDistractors:[
        'The manager said she would try to find out whether the fish was fresh.',
        'The advert said the biscuits might be good for your health.',
        'The waiter asked whether the customer wanted any more water.'
      ],
      retrievalContexts:[
        { id:'1', text:'The delivery company guaranteed that the pizza would arrive within thirty minutes or be free.', target:'guaranteed', grammarPattern:'' },
        { id:'2', text:'Because the farm guaranteed that its milk was fresh, the supermarket agreed to buy all of it.', target:'guaranteed', grammarPattern:'' },
        { id:'3', text:'The label guaranteed that the juice contained no added sugar.', target:'guaranteed', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'guaranteed', wrong:['doubted', 'denied', 'regretted'] },
        { id:'2', answer:'guaranteed', wrong:['feared', 'denied', 'doubted'] },
        { id:'3', answer:'guaranteed', wrong:['regretted', 'denied', 'doubted'] }
      ]
    }),
  e('harmless', 'adjective',
    'not able to cause damage or injury',
    ['safe', 'not dangerous'],
    ['likely to cause serious illness', 'very expensive to produce', 'too small to be seen'],
    'Most food colourings used in sweets are harmless in small amounts.',
    'safe', 'Most food colourings used in sweets are safe in small amounts.',
    'not dangerous', 'Some mushrooms are not dangerous, but others can make you very ill.',
    {
      masteryContexts:[
        { text:'The doctor told her that the small insect in the salad was harmless.', meaning:'not able to hurt anyone' },
        { text:'Many people think that a little sugar is harmless, but too much can damage teeth.', meaning:'not causing any damage' }
      ],
      situationDistractors:[
        'The label warned that the product could make some people very ill.',
        'The chemicals in the cleaning spray burned his skin.',
        'The doctor advised her to avoid the food because it was full of bacteria.'
      ],
      retrievalContexts:[
        { id:'1', text:'The snake in the garden is completely harmless, so there is no need to be afraid of it.', target:'harmless', grammarPattern:'' },
        { id:'2', text:'Because the additive is harmless, the government allows companies to use it in sweets.', target:'harmless', grammarPattern:'' },
        { id:'3', text:'Do not worry: the mouse is harmless and will not bite you.', target:'harmless', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'harmless', wrong:['poisonous', 'aggressive', 'venomous'] },
        { id:'2', answer:'harmless', wrong:['dangerous', 'poisonous', 'illegal'] },
        { id:'3', answer:'harmless', wrong:['dangerous', 'aggressive', 'deadly'] }
      ]
    }),
  e('pressure', 'noun',
    'a strong feeling that you must do something because other people want or expect it',
    ['strong influence', 'forceful persuasion'],
    ['the weight of a heavy object pressing down', 'a bill for a service that has been used', 'the feeling of being very hungry'],
    'Teenagers often feel pressure from friends to eat the same fast food as everyone else.',
    'strong influence', 'Teenagers often feel strong influence from friends to eat the same fast food as everyone else.',
    'forceful persuasion', 'Parents sometimes use forceful persuasion on children to finish their vegetables.',
    {
      masteryContexts:[
        { text:'Students often feel pressure to buy the same snacks as their friends.', meaning:'a feeling that you must do something because others do' },
        { text:'The advert put pressure on parents to buy the toy that came with the cereal.', meaning:'an attempt to make someone do something' }
      ],
      situationDistractors:[
        'The doctor gave the boy a calm explanation and let him choose for himself.',
        'The shopper looked at the prices, then decided to buy nothing at all.',
        'Her friends said they did not mind what she ordered.'
      ],
      retrievalContexts:[
        { id:'1', text:'Some teenagers feel pressure to order the same meal as their friends in restaurants.', target:'pressure', grammarPattern:'' },
        { id:'2', text:'The company was under great pressure to remove the unhealthy ingredient from its recipe.', target:'pressure', grammarPattern:'' },
        { id:'3', text:'Peer pressure can make teenagers try foods that they would never choose alone.', target:'pressure', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'pressure', wrong:['permission', 'advice', 'pride'] },
        { id:'2', answer:'pressure', wrong:['control', 'permission', 'pleasure'] },
        { id:'3', answer:'pressure', wrong:['practice', 'pleasure', 'prize'] }
      ]
    }),
  e('fooled', 'verb',
    'tricked into believing something that is not true',
    ['tricked', 'deceived'],
    ['made to feel frightened', 'helped to understand the truth', 'asked to give an opinion'],
    'Shoppers were fooled by the packaging, which made the biscuits look healthy.',
    'tricked', 'Shoppers were tricked by the packaging, which made the biscuits look healthy.',
    'deceived', 'Customers were deceived by the advert, which showed a much larger burger.',
    {
      masteryContexts:[
        { text:'Do not be fooled by a label that says natural, because it does not always mean healthy.', meaning:'tricked into believing something false' },
        { text:'He was fooled by the photo on the menu and expected a much bigger meal.', meaning:'given a false idea about something' }
      ],
      situationDistractors:[
        'The customer read the label carefully and saw that the juice contained added sugar.',
        'The waiter told the guests the truth about the ingredients.',
        'The inspector found the hidden problem in the kitchen immediately.'
      ],
      retrievalContexts:[
        { id:'1', text:'Many customers were fooled by the advert, which made the burger look twice as big as the real one.', target:'fooled', grammarPattern:'' },
        { id:'2', text:'Do not be fooled by cheap prices; the quality of the food is often poor.', target:'fooled', grammarPattern:'' },
        { id:'3', text:'The children were completely fooled by the sweet that looked like a real strawberry but was made of plastic.', target:'fooled', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'fooled', wrong:['warned', 'invited', 'taught'] },
        { id:'2', answer:'fooled', wrong:['praised', 'paid', 'taught'] },
        { id:'3', answer:'fooled', wrong:['warned', 'taught', 'praised'] }
      ]
    }),
  e('majority', 'noun',
    'most of the people or things in a group',
    ['the larger part', 'the greater part'],
    ['a small number of people in a group', 'every member of a group', 'the leader of a group'],
    'The majority of students at our school bring a packed lunch from home.',
    'the larger part', 'The larger part of students at our school bring a packed lunch from home.',
    'the greater part', 'The greater part of the food we waste at home is fresh fruit and vegetables.',
    {
      masteryContexts:[
        { text:'The vast majority of customers chose the vegetarian option.', meaning:'most of a group' },
        { text:'In the vote, a majority of pupils wanted healthier food in the canteen, so the menu was changed.', meaning:'more than half of the people' }
      ],
      situationDistractors:[
        'Only two students out of thirty chose the fish.',
        'Every single guest asked for dessert.',
        'A small number of customers complained about the noise.'
      ],
      retrievalContexts:[
        { id:'1', text:'Because the majority of voters wanted a vegetarian menu, the school changed the canteen.', target:'majority', grammarPattern:'' },
        { id:'2', text:'The vote was twenty-one to nine, so the majority of the class chose pizza for the party.', target:'majority', grammarPattern:'' },
        { id:'3', text:'Only a few customers complained about the price, but the great majority of them were very happy with the food.', target:'majority', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'majority', wrong:['minority', 'average', 'total'] },
        { id:'2', answer:'majority', wrong:['minority', 'average', 'difference'] },
        { id:'3', answer:'majority', wrong:['minority', 'average', 'total'] }
      ]
    })
];

// Authored Word Families (unit-03-word-families.js): per-form facts feed Mastery; the plain family list is the non-headword forms of the SAME
// family. A rejected headword keeps NO family list, so Recognise/Match never offer unauthorised members.
function familyFields(entry) {
  const family = unit3WordFamilies[entry.term];
  if (!family) return unit3WordFamilyRejected[entry.term] ? { wordFamily:[] } : {};
  const lower = value => String(value).toLocaleLowerCase('en');
  return {
    wordFamilyForms:family.forms.map(row => ({ form:row.form, partOfSpeech:row.partOfSpeech, example:row.example, pedagogicallyUseful:true, ...(unit3WordFamilyAlternates[entry.term]?.[row.form] ? { altExample:unit3WordFamilyAlternates[entry.term][row.form] } : {}) })),
    wordFamily:family.forms.map(row => row.form).filter(form => lower(form) !== lower(entry.term))
  };
}

// Authored Meaning Mastery wrong meanings are applied by position to the word's two mastery contexts, as in Units 1 and 2.
const enrichedEntries = entries.map(entry => {
  const authoredMastery = unit3MeaningMastery[entry.term];
  const masteryContexts = authoredMastery
    ? (entry.masteryContexts ?? []).map((record, index) => {
        const authored = authoredMastery[index] ?? {};
        return { text:authored.text ?? record.text, meaning:authored.meaning ?? record.meaning, ...(Array.isArray(authored.wrongMeanings) ? { wrongMeanings:authored.wrongMeanings } : {}) };
      })
    : entry.masteryContexts;
  return {
    ...entry,
    ...(masteryContexts ? { masteryContexts } : {}),
    ...(unit3SituationExtras[entry.term] ? { situationDistractors:[...(entry.situationDistractors ?? []), ...unit3SituationExtras[entry.term]] } : {}),
    ...(unit3Collocations[entry.term] ? { collocations:unit3Collocations[entry.term] } : {}),
    ...(unit3MeaningMatch[entry.term] ? { wrongParaphrases:unit3MeaningMatch[entry.term] } : {}),
    ...(unit3ContextPassages[entry.term] ? { masteryPassages:unit3ContextPassages[entry.term] } : {}),
    ...familyFields(entry)
  };
});

export default buildCuratedUnit({
  unitNumber:UNIT_NUMBER,
  unitTitle:'Food',
  status,
  source:'0511 key words UNIT 3 – FOOD',
  entries:enrichedEntries,
  activities:[...unit3Activities, ...unit3PrecisionUse, ...unit3WordFamilyItems],
  lexicalSpelling:{ ...LEXICAL_SPELLING_ERRORS }
});
