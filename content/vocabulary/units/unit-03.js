// UNIT 3 – FOOD: approved source for the Unit 3 release (releases/unit-03.js promotes it to live). Source: 0511 key words UNIT 3 – FOOD
// (coursebook order), all 50 authored and audited. Check: node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-03.js
// "reasonable" is also a Unit 1 target; it has its own id here (idKey 'reasonable_3' -> vocab_reasonable_3) and aliases Unit 1's spelling list.
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
const status = 'approved';

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
    }),
  e('inexpensive', 'adjective',
    'not costing a lot of money',
    ['cheap', 'low in price'],
    ['costing too much for most people', 'made from poor materials', 'sold only for a short time'],
    'The cafe offers inexpensive meals for students.',
    'cheap', 'The cafe offers cheap meals for students.',
    'low in price', 'Street food in the city is low in price and very tasty.',
    {
      masteryContexts:[
        { text:'The school canteen serves a healthy and inexpensive lunch every day.', meaning:'not costing much money' },
        { text:'Rice and beans are an inexpensive way to feed a large family.', meaning:'low in cost' }
      ],
      situationDistractors:[
        'The restaurant charges fifty pounds for a plain bowl of soup.',
        'The shop sells only luxury chocolates imported from Switzerland.',
        'The meal was free because the chef made a mistake with the order.'
      ],
      retrievalContexts:[
        { id:'1', text:'Students on a small budget often choose inexpensive snacks such as bread and fruit.', target:'inexpensive', grammarPattern:'' },
        { id:'2', text:'The restaurant is popular with families because its menu is inexpensive and the portions are large.', target:'inexpensive', grammarPattern:'' },
        { id:'3', text:'Rice is very inexpensive, so millions of people can afford it every day.', target:'inexpensive', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'inexpensive', wrong:['luxurious', 'expensive', 'extravagant'] },
        { id:'2', answer:'inexpensive', wrong:['expensive', 'luxurious', 'exclusive'] },
        { id:'3', answer:'inexpensive', wrong:['rare', 'luxurious', 'forbidden'] }
      ]
    }),
  e('sodium', 'noun',
    'a substance found in salt and in many foods',
    ['a mineral in salt', 'the element in salt'],
    ['a vitamin found in fruit and vegetables', 'a type of fat used for frying', 'a sweet substance added to drinks'],
    'The label shows how much sodium is in one portion of the soup.',
    'a mineral in salt', 'The label shows how much of a mineral in salt is in one portion of the soup.',
    'the element in salt', 'Packaged snacks often contain a lot of the element in salt.',
    {
      masteryContexts:[
        { text:'Crisps and instant noodles often contain a lot of sodium.', meaning:'a substance found in salt' },
        { text:'The nutrition label lists sodium, sugar and fat for each portion.', meaning:'a substance listed on food labels' }
      ],
      situationDistractors:[
        'The label listed the vitamins found in fresh oranges.',
        'The chef fried the fish in a little sunflower oil.',
        'A bag of sugar was poured into the cake mixture.'
      ],
      retrievalContexts:[
        { id:'1', text:'Table salt is made of chlorine and sodium.', target:'sodium', grammarPattern:'' },
        { id:'2', text:'Instant noodles taste very salty because the seasoning packet is high in sodium.', target:'sodium', grammarPattern:'' },
        { id:'3', text:'The label says that the soup has a low level of sodium, so it tastes less salty than the ordinary version.', target:'sodium', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'sodium', wrong:['carbon', 'sugar', 'oil'] },
        { id:'2', answer:'sodium', wrong:['sugar', 'fibre', 'protein'] },
        { id:'3', answer:'sodium', wrong:['sugar', 'fat', 'vinegar'] }
      ]
    }),
  e('commercially', 'adverb',
    'in order to sell something and make a profit',
    ['as a business', 'for profit'],
    ['in order to teach and inform people', 'in order to save and reuse materials', 'in order to test and improve ideas'],
    'The farm now sells its cheese commercially instead of only to neighbours.',
    'for profit', 'The farm now sells its cheese for profit instead of only to neighbours.',
    'as a business', 'Many families now bake bread as a business and sell it in the market.',
    {
      masteryContexts:[
        { text:'Bread has been made commercially in large factories for over a century.', meaning:'in order to sell it and make a profit' },
        { text:'The mushrooms are grown commercially, so they appear in supermarkets all year.', meaning:'on a large scale to sell them' }
      ],
      situationDistractors:[
        'She baked a cake for her grandmother’s birthday and gave it away.',
        'The students grew tomatoes on the school roof just for fun.',
        'He shared his recipe online without asking for any payment.'
      ],
      retrievalContexts:[
        { id:'1', text:'Salmon is farmed commercially in large sea cages, and the fish are sold to supermarkets all over the world.', target:'commercially', grammarPattern:'' },
        { id:'2', text:'The recipe is for home cooks only, and it has never been produced commercially.', target:'commercially', grammarPattern:'' },
        { id:'3', text:'Some old varieties of apple are no longer grown commercially, but a few gardeners still keep the trees.', target:'commercially', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'commercially', wrong:['politely', 'secretly', 'accidentally'] },
        { id:'2', answer:'commercially', wrong:['quietly', 'politely', 'happily'] },
        { id:'3', answer:'commercially', wrong:['politely', 'noisily', 'sadly'] }
      ]
    }),
  e('processed', 'adjective',
    'changed from its natural form in a factory, often to make it last longer',
    ['factory-made', 'prepared in a factory'],
    ['grown without chemicals on a small farm', 'cooked fresh at home from raw ingredients', 'sold only in specialist shops'],
    'Fresh fruit is healthier than processed snacks such as crisps.',
    'factory-made', 'Fresh fruit is healthier than factory-made snacks such as crisps.',
    'prepared in a factory', 'Many snacks that are prepared in a factory contain added salt and sugar.',
    {
      masteryContexts:[
        { text:'Supermarkets sell fresh fruit as well as processed foods such as sausages and tinned soup.', meaning:'changed from the natural form in a factory' },
        { text:'The shop sells only fresh vegetables, with no processed products such as tinned or frozen food.', meaning:'made or changed in a factory' }
      ],
      situationDistractors:[
        'The farmer picked the apples by hand and sold them from a stall.',
        'She bought fresh fish straight from the boat at the harbour.',
        'The family grew their own tomatoes in the garden.'
      ],
      retrievalContexts:[
        { id:'1', text:'Tinned soup and sausages are processed foods that can be kept for months.', target:'processed', grammarPattern:'' },
        { id:'2', text:'The factory makes processed cheese in thin, individually wrapped slices.', target:'processed', grammarPattern:'' },
        { id:'3', text:'Instead of eating processed snacks every day, she brings an apple and some nuts to school.', target:'processed', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'processed', wrong:['fresh', 'raw', 'natural'] },
        { id:'2', answer:'processed', wrong:['raw', 'organic', 'home-grown'] },
        { id:'3', answer:'processed', wrong:['fresh', 'natural', 'raw'] }
      ]
    }),
  e('depression', 'noun',
    'a state of feeling very sad and without hope for a long time',
    ['long-lasting sadness', 'low mood that lasts'],
    ['a feeling of being very angry for a short time', 'a worry about speaking in front of others', 'a tiredness after a long walk'],
    'Teachers should take depression seriously and encourage students to talk to someone.',
    'long-lasting sadness', 'Teachers should take long-lasting sadness seriously and encourage students to talk to someone.',
    'low mood that lasts', 'The school counsellor can give information about low mood that lasts.',
    {
      masteryContexts:[
        { text:'Her depression made even simple daily tasks, such as cooking a meal, feel very hard.', meaning:'a long period of feeling very sad and hopeless' },
        { text:'Many students find it helpful to talk to a counsellor about depression.', meaning:'a long period of feeling very sad' }
      ],
      situationDistractors:[
        'He felt a little nervous before the cooking test but enjoyed it afterwards.',
        'The students were excited about the school trip to the market.',
        'She was tired after the long walk and went to bed early.'
      ],
      retrievalContexts:[
        { id:'1', text:'The school counsellor supports students who suffer from depression and offers a quiet place to talk.', target:'depression', grammarPattern:'' },
        { id:'2', text:'After months of depression, he slowly began to enjoy cooking and seeing his friends again.', target:'depression', grammarPattern:'' },
        { id:'3', text:'Many people describe depression as a heavy feeling of sadness that does not go away quickly.', target:'depression', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'depression', wrong:['pride', 'excitement', 'curiosity'] },
        { id:'2', answer:'depression', wrong:['laughter', 'excitement', 'celebration'] },
        { id:'3', answer:'depression', wrong:['happiness', 'excitement', 'curiosity'] }
      ]
    }),
  e('overweight', 'adjective',
    'heavier than is considered healthy for a person’s height',
    ['above a healthy weight', 'carrying extra weight'],
    ['carrying too much luggage on a journey', 'weighing less than most people of the same age', 'very strong and good at sport'],
    'The report says that many children in the city are overweight.',
    'above a healthy weight', 'The report says that many children in the city are above a healthy weight.',
    'carrying extra weight', 'The nurse measured each child to see who was carrying extra weight.',
    {
      masteryContexts:[
        { text:'The survey asked how many children in the region are overweight.', meaning:'heavier than is healthy for their height' },
        { text:'Teachers do not comment on whether a student is overweight, because it can hurt their feelings.', meaning:'heavier than a person’s body needs' }
      ],
      situationDistractors:[
        'The runner was thin and light and finished the race first.',
        'The boy was shorter than his classmates but ate the same meals.',
        'The nurse measured the height of each child.'
      ],
      retrievalContexts:[
        { id:'1', text:'The nurse measured each pupil’s height and weight to see whether any were overweight.', target:'overweight', grammarPattern:'' },
        { id:'2', text:'A person is called overweight when they weigh more than is healthy for their height.', target:'overweight', grammarPattern:'' },
        { id:'3', text:'The boxer had to lose a few kilos before the match because he was slightly overweight for his class.', target:'overweight', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'overweight', wrong:['late', 'absent', 'dishonest'] },
        { id:'2', answer:'overweight', wrong:['dishonest', 'nervous', 'ambitious'] },
        { id:'3', answer:'overweight', wrong:['tall', 'late', 'quiet'] }
      ]
    }),
  e('unwell', 'adjective',
    'feeling ill, or not in good health',
    ['ill', 'not feeling well'],
    ['feeling very hungry before a meal', 'feeling happy and full of energy', 'feeling nervous about an exam'],
    'She stayed at home because she felt unwell.',
    'ill', 'She stayed at home because she felt ill.',
    'not feeling well', 'He did not eat lunch because he was not feeling well.',
    {
      masteryContexts:[
        { text:'Several guests felt unwell after eating at the street stall, so the owner closed it for the day.', meaning:'ill or not in good health' },
        { text:'If you are unwell, please stay at home so that you do not pass the illness to others.', meaning:'not healthy' }
      ],
      situationDistractors:[
        'He felt full of energy and ran all the way to school.',
        'The students were hungry and queued early for lunch.',
        'She was nervous about the speaking exam.'
      ],
      retrievalContexts:[
        { id:'1', text:'Mia did not come to school because she felt unwell and had a high temperature.', target:'unwell', grammarPattern:'' },
        { id:'2', text:'If you feel unwell during the exam, tell the teacher so that someone can help you.', target:'unwell', grammarPattern:'' },
        { id:'3', text:'The visitor looked pale and unwell, so we offered him a chair and a glass of water.', target:'unwell', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'unwell', wrong:['proud', 'generous', 'curious'] },
        { id:'2', answer:'unwell', wrong:['proud', 'generous', 'curious'] },
        { id:'3', answer:'unwell', wrong:['cheerful', 'wealthy', 'famous'] }
      ]
    }),
  e('ingredients', 'noun',
    'the different foods that are mixed together to make a dish',
    ['food items', 'things in a recipe'],
    ['the tools that are used to cook a dish', 'the steps that are followed to cook a dish', 'the people who help to cook a dish'],
    'Always read the list of ingredients on the packet before you buy it.',
    'food items', 'Always read the list of food items on the packet before you buy it.',
    'things in a recipe', 'The chef carefully chose the things in a recipe for the new pizza.',
    {
      masteryContexts:[
        { text:'The chef bought all the ingredients for the soup at the local market.', meaning:'the foods used to make a dish' },
        { text:'The label lists the ingredients in order, from the largest amount to the smallest.', meaning:'the foods that a product is made from' }
      ],
      situationDistractors:[
        'The cook washed the pans and put the knives in the drawer.',
        'The waiter wrote the order on a small notepad.',
        'The customers waited outside until the cafe opened.'
      ],
      retrievalContexts:[
        { id:'1', text:'To make a simple pancake, you need only three ingredients: flour, eggs and milk.', target:'ingredients', grammarPattern:'' },
        { id:'2', text:'The soup contained only natural ingredients, such as carrots, onions and herbs.', target:'ingredients', grammarPattern:'' },
        { id:'3', text:'The cake was delicious because the baker used high-quality ingredients such as real butter and fresh eggs.', target:'ingredients', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'ingredients', wrong:['plates', 'tools', 'guests'] },
        { id:'2', answer:'ingredients', wrong:['plates', 'tools', 'guests'] },
        { id:'3', answer:'ingredients', wrong:['tools', 'pans', 'plates'] }
      ]
    }),
  e('nutritious', 'adjective',
    'containing the substances that the body needs to stay healthy and grow',
    ['healthy', 'good for the body'],
    ['containing a lot of sugar and fat', 'tasting sweet and rich', 'cooked very quickly in hot oil'],
    'The school provides a nutritious lunch for every student.',
    'healthy', 'The school provides a healthy lunch for every student.',
    'good for the body', 'Fruit and vegetables are good for the body, so the canteen offers them every day.',
    {
      masteryContexts:[
        { text:'The canteen offers a nutritious meal that includes vegetables, rice and fish.', meaning:'containing what the body needs to stay healthy' },
        { text:'Beans are cheap, filling and nutritious, which is why they are eaten all over the world.', meaning:'good for the body because of what they contain' }
      ],
      situationDistractors:[
        'The cake was covered in thick cream and sweet icing.',
        'The vending machine sold only fizzy drinks and sweets.',
        'He ate a burger and chips every evening at a fast-food stall.'
      ],
      retrievalContexts:[
        { id:'1', text:'Fruit, vegetables and beans are nutritious foods that give the body what it needs to grow.', target:'nutritious', grammarPattern:'' },
        { id:'2', text:'The cook chose a nutritious recipe with vegetables and lentils rather than one with cream and sugar.', target:'nutritious', grammarPattern:'' },
        { id:'3', text:'Parents want school canteens to serve nutritious meals so that pupils can concentrate in the afternoon.', target:'nutritious', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'nutritious', wrong:['greasy', 'sugary', 'salty'] },
        { id:'2', answer:'nutritious', wrong:['greasy', 'sugary', 'fried'] },
        { id:'3', answer:'nutritious', wrong:['greasy', 'sugary', 'salty'] }
      ]
    }),
  e('moderation', 'noun',
    'the act of not doing or having too much of something',
    ['small amounts', 'sensible amounts'],
    ['the act of leading a discussion fairly', 'a strong wish for as much as possible', 'the habit of refusing something completely'],
    'Sweets are fine in moderation, but not every day.',
    'small amounts', 'Sweets are fine in small amounts, but not every day.',
    'sensible amounts', 'Our teacher says we can enjoy chocolate in sensible amounts.',
    {
      masteryContexts:[
        { text:'Our teacher says that fast food is fine in moderation, but not as a daily meal.', meaning:'limited, sensible amounts' },
        { text:'He believes in moderation, so he never eats too much or goes without his favourite food entirely.', meaning:'the habit of not going to extremes' }
      ],
      situationDistractors:[
        'She ate five slices of cake and then asked for more.',
        'He refused to taste any dessert at the party.',
        'They drank fizzy drinks all day during the holiday.'
      ],
      retrievalContexts:[
        { id:'1', text:'Cake and biscuits can be part of a balanced diet if they are eaten in moderation.', target:'moderation', grammarPattern:'' },
        { id:'2', text:'The teacher told the class that everything is fine in moderation, even chocolate.', target:'moderation', grammarPattern:'' },
        { id:'3', text:'The key to enjoying favourite foods without eating too much is moderation.', target:'moderation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'moderation', wrong:['advance', 'public', 'silence'] },
        { id:'2', answer:'moderation', wrong:['silence', 'advance', 'public'] },
        { id:'3', answer:'moderation', wrong:['silence', 'speed', 'luck'] }
      ]
    }),
  e('deceive', 'verb',
    'to make someone believe something that is not true',
    ['mislead', 'trick'],
    ['to warn someone about a danger', 'to ask someone for their opinion', 'to teach someone a new skill'],
    'Some adverts deceive shoppers by showing food that looks much bigger than it really is.',
    'mislead', 'Some adverts mislead shoppers by showing food that looks much bigger than it really is.',
    'trick', 'Companies should not trick customers with false claims on food labels.',
    {
      grammarForms:{ base:'deceive', thirdPerson:'deceives', past:'deceived', pastParticiple:'deceived', ing:'deceiving' },
      masteryContexts:[
        { text:'Some websites use fake reviews to deceive customers into buying poor products.', meaning:'make people believe something false' },
        { text:'It is wrong to deceive customers about what is in a product, so the law requires honest labels.', meaning:'give people a false idea' }
      ],
      situationDistractors:[
        'The waiter described each dish honestly and answered every question about the food.',
        'The chef showed the customers exactly how the burger was cooked.',
        'The label listed every ingredient clearly, from the largest amount to the smallest.'
      ],
      retrievalContexts:[
        { id:'1', text:'Some fast-food adverts use clever photographs to deceive customers about the size of the burger.', target:'deceive', grammarPattern:'' },
        { id:'2', text:'It is illegal for a company to deceive shoppers by selling cheap rice as expensive rice.', target:'deceive', grammarPattern:'' },
        { id:'3', text:'He used a fake website to deceive people into paying for food that never arrived.', target:'deceive', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'deceive', wrong:['thank', 'reward', 'invite'] },
        { id:'2', answer:'deceive', wrong:['advise', 'thank', 'invite'] },
        { id:'3', answer:'deceive', wrong:['remind', 'excuse', 'greet'] }
      ]
    }),
  e('advertisement', 'noun',
    'a notice, picture or film that tries to persuade people to buy something',
    ['advert', 'message to sell a product'],
    ['a short report about a news event', 'a list of the prices of goods', 'a letter that thanks a customer'],
    'The advertisement for the new burger appeared on television every evening.',
    'advert', 'The advert for the new burger appeared on television every evening.',
    'message to sell a product', 'A message to sell a product must not give false information about food.',
    {
      masteryContexts:[
        { text:'The advertisement showed a happy family sharing a pizza at the dinner table.', meaning:'a picture or film that tries to sell something' },
        { text:'Chocolate companies spend millions of pounds on every advertisement they put on television.', meaning:'a message that tries to make people buy a product' }
      ],
      situationDistractors:[
        'The newspaper printed a long report about a school sports day.',
        'The waiter handed the family the bill at the end of the meal.',
        'The chef posted the recipe on a cooking website for free.'
      ],
      retrievalContexts:[
        { id:'1', text:'The new advertisement for the energy drink appears at every bus stop in the city.', target:'advertisement', grammarPattern:'' },
        { id:'2', text:'The television advertisement lasted thirty seconds and ended with the price of the burger.', target:'advertisement', grammarPattern:'' },
        { id:'3', text:'Every good advertisement must be honest, so the company cannot claim that its juice is healthier than it really is.', target:'advertisement', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'advertisement', wrong:['recipe', 'receipt', 'invoice'] },
        { id:'2', answer:'advertisement', wrong:['recipe', 'receipt', 'invoice'] },
        { id:'3', answer:'advertisement', wrong:['recipe', 'menu', 'receipt'] }
      ]
    }),
  e('variety', 'noun',
    'a number of different kinds of the same thing',
    ['range', 'selection'],
    ['a single kind of something that is sold', 'a plan for how something will be made', 'a feeling that something is boring'],
    'The market sells a wide variety of fresh fruit.',
    'range', 'The market sells a wide range of fresh fruit.',
    'selection', 'The cafe offers a large selection of cakes and pastries.',
    {
      masteryContexts:[
        { text:'The buffet offers a wide variety of dishes from different countries.', meaning:'many different kinds of something' },
        { text:'Customers love the variety at the market, where every stall sells something different.', meaning:'a lot of different things to choose from' }
      ],
      situationDistractors:[
        'The cafe sells only one kind of sandwich and nothing else.',
        'Every stall at the market sold exactly the same cheese.',
        'The menu had a single dish, which never changed.'
      ],
      retrievalContexts:[
        { id:'1', text:'The supermarket offers a wide variety of cheeses from different countries.', target:'variety', grammarPattern:'' },
        { id:'2', text:'Children need a variety of fruit and vegetables in their meals, not just apples and carrots.', target:'variety', grammarPattern:'' },
        { id:'3', text:'There is a great variety of street food in this city, from noodles to grilled fish.', target:'variety', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'variety', wrong:['price', 'speed', 'level'] },
        { id:'2', answer:'variety', wrong:['price', 'speed', 'level'] },
        { id:'3', answer:'variety', wrong:['shortage', 'habit', 'absence'] }
      ]
    }),
  e('portion', 'noun',
    'the amount of food served to one person',
    ['serving', 'helping'],
    ['the whole amount of food in a large dish', 'a small part of a restaurant where people wait', 'the money paid for a meal'],
    'A large portion of chips costs two pounds at the school canteen.',
    'serving', 'A large serving of chips costs two pounds at the school canteen.',
    'helping', 'The waiter gave me a generous helping of rice.',
    {
      masteryContexts:[
        { text:'A child’s portion at the restaurant is smaller and cheaper than an adult’s.', meaning:'the amount of food served to one person' },
        { text:'The dish comes with a free portion of rice, so you do not have to order any extra.', meaning:'an amount of food for one person' }
      ],
      situationDistractors:[
        'The chef cooked enough soup to feed two hundred guests at the wedding.',
        'The waiter wrote down the number of each table.',
        'The bill showed the total price for the whole meal.'
      ],
      retrievalContexts:[
        { id:'1', text:'The restaurant gave me such a large portion of pasta that I could not finish it.', target:'portion', grammarPattern:'' },
        { id:'2', text:'You should check the size of one portion on the label before you decide how much to eat.', target:'portion', grammarPattern:'' },
        { id:'3', text:'A small portion of chips came with the burger, but we ordered an extra one.', target:'portion', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'portion', wrong:['recipe', 'receipt', 'menu'] },
        { id:'2', answer:'portion', wrong:['recipe', 'receipt', 'price'] },
        { id:'3', answer:'portion', wrong:['recipe', 'receipt', 'dessert'] }
      ]
    }),
  e('purchase', 'noun',
    'something that you have bought',
    ['thing bought', 'an item you bought'],
    ['a list of goods that a shop has for sale', 'the money that you save each month', 'a small gift that a shop gives away'],
    'The receipt shows the date and price of each purchase.',
    'thing bought', 'The receipt shows the date and price of each thing bought.',
    'an item you bought', 'Keep the receipt in case you need to return an item you bought.',
    {
      masteryContexts:[
        { text:'Her biggest purchase this month was a new oven for the family kitchen.', meaning:'a thing that was bought' },
        { text:'Every purchase over ten pounds at the cafe earns you a stamp towards a free coffee.', meaning:'an act of buying something' }
      ],
      situationDistractors:[
        'The customer returned the faulty kettle and asked for her money back.',
        'A friend gave him a box of chocolates for his birthday.',
        'The shop was having a sale, but the doors were locked.'
      ],
      retrievalContexts:[
        { id:'1', text:'The shopper checked the receipt and saw that her biggest purchase of the day was a coffee machine.', target:'purchase', grammarPattern:'' },
        { id:'2', text:'You can return any online purchase within thirty days if you keep the receipt.', target:'purchase', grammarPattern:'' },
        { id:'3', text:'When you make a purchase in a shop, you should check that the price on the receipt matches the price on the shelf.', target:'purchase', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'purchase', wrong:['dish', 'recipe', 'guest'] },
        { id:'2', answer:'purchase', wrong:['recipe', 'dish', 'guest'] },
        { id:'3', answer:'purchase', wrong:['recipe', 'dish', 'speech'] }
      ]
    }),
  e('takeaway', 'noun',
    'a meal that you buy at a restaurant and eat somewhere else',
    ['meal to take home', 'food to go'],
    ['a meal that is served at a table by a waiter', 'a main point that you remember from a talk', 'a shop that sells only fruit and vegetables'],
    'We were too tired to cook, so we ordered a takeaway from the Chinese restaurant.',
    'meal to take home', 'We were too tired to cook, so we ordered a meal to take home from the Chinese restaurant.',
    'food to go', 'On Fridays my family orders food to go from the Indian restaurant.',
    {
      masteryContexts:[
        { text:'There is a Chinese takeaway on the corner of our street that stays open until midnight.', meaning:'a shop that sells hot meals to eat elsewhere' },
        { text:'On Fridays we usually order a takeaway instead of cooking.', meaning:'a meal bought to eat at home' }
      ],
      situationDistractors:[
        'We sat at a table in the restaurant while the waiter brought each course.',
        'She cooked a pot of soup at home for the whole family.',
        'The guests ate the wedding meal in the hotel dining room.'
      ],
      retrievalContexts:[
        { id:'1', text:'After the match we were so hungry that we stopped at a fish-and-chip takeaway on the way home.', target:'takeaway', grammarPattern:'' },
        { id:'2', text:'It was Friday evening and nobody wanted to cook, so we ordered a takeaway.', target:'takeaway', grammarPattern:'' },
        { id:'3', text:'The curry from the takeaway was still hot when we carried it home in a plastic bag.', target:'takeaway', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'takeaway', wrong:['library', 'cinema', 'stadium'] },
        { id:'2', answer:'takeaway', wrong:['recipe', 'lesson', 'jacket'] },
        { id:'3', answer:'takeaway', wrong:['library', 'cinema', 'museum'] }
      ]
    }),
  e('barbecue', 'noun',
    'an outdoor meal where food is cooked over a fire or on a grill',
    ['grill party', 'outdoor cooking party'],
    ['a formal dinner served in a restaurant', 'a picnic of cold food in a park', 'a cooking class held in a school kitchen'],
    'We had a barbecue in the garden to celebrate the end of term.',
    'grill party', 'We had a grill party in the garden to celebrate the end of term.',
    'outdoor cooking party', 'The neighbours invited us to an outdoor cooking party on Sunday.',
    {
      masteryContexts:[
        { text:'We had a barbecue on the beach and cooked sausages over a small fire.', meaning:'an outdoor meal cooked over a fire' },
        { text:'Dad cleaned the barbecue before our guests arrived and checked that it had enough charcoal.', meaning:'a metal frame used for cooking food outside' }
      ],
      situationDistractors:[
        'The guests ate cold sandwiches at a small table in a hotel restaurant.',
        'The chef baked the cake in a large oven in the school kitchen.',
        'The family had dinner indoors at the dining table while it rained.'
      ],
      retrievalContexts:[
        { id:'1', text:'We held a barbecue in the park, and everyone brought meat, vegetables or salad to share.', target:'barbecue', grammarPattern:'' },
        { id:'2', text:'The smell of grilled sausages from the neighbours’ barbecue made us hungry.', target:'barbecue', grammarPattern:'' },
        { id:'3', text:'Because the weather was dry and warm, they decided to have a barbecue instead of cooking indoors.', target:'barbecue', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'barbecue', wrong:['lesson', 'meeting', 'concert'] },
        { id:'2', answer:'barbecue', wrong:['classroom', 'library', 'bedroom'] },
        { id:'3', answer:'barbecue', wrong:['lesson', 'test', 'concert'] }
      ]
    }),
  e('saturated', 'adjective',
    'describing the type of fat found mainly in butter, cheese and fatty meat',
    ['the type of fat found in butter', 'the kind of fat in fatty meat and dairy foods'],
    ['describing oil that stays liquid in the fridge', 'describing food that has been fried for a long time', 'describing fat that has been removed from meat'],
    'Cheese, cream and fatty meat are high in saturated fat.',
    'the type of fat found in butter', 'Cheese, cream and fatty meat are high in the type of fat found in butter.',
    'the kind of fat in fatty meat and dairy foods', 'The label shows how much of the kind of fat in fatty meat and dairy foods is in each portion.',
    {
      masteryContexts:[
        { text:'Butter, cheese and fatty meat are high in saturated fat.', meaning:'describing the type of fat found in butter and meat' },
        { text:'The label says that one portion of the pizza contains a lot of saturated fat.', meaning:'of the type of fat found in butter and meat' }
      ],
      situationDistractors:[
        'The cook poured olive oil, which stays liquid in the fridge, over the salad.',
        'The nutritionist recommended eating more fruit and fish.',
        'The cook trimmed all the fat off the meat before grilling it.'
      ],
      retrievalContexts:[
        { id:'1', text:'Butter, cream and fatty meat contain a lot of saturated fat.', target:'saturated', grammarPattern:'' },
        { id:'2', text:'The label on the cheese shows how much saturated fat is in one portion.', target:'saturated', grammarPattern:'' },
        { id:'3', text:'Coconut oil comes from plants, but it is still rich in saturated fat.', target:'saturated', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'saturated', wrong:['liquid', 'spicy', 'sugary'] },
        { id:'2', answer:'saturated', wrong:['spicy', 'sugary', 'liquid'] },
        { id:'3', answer:'saturated', wrong:['spicy', 'sugary', 'sweet'] }
      ]
    }),
  e('convenient', 'adjective',
    'easy to use or suitable because it saves time or effort',
    ['handy', 'easy to use'],
    ['cheap enough for everyone to buy', 'healthy enough for every meal', 'large enough for a big family'],
    'Ready meals are convenient for people who work long hours.',
    'handy', 'Ready meals are handy for people who work long hours.',
    'easy to use', 'A microwave oven is easy to use when you are in a hurry.',
    {
      masteryContexts:[
        { text:'The supermarket is open until midnight, which is convenient for people who work late.', meaning:'suitable because it saves time or effort' },
        { text:'A restaurant near the station is convenient because you can eat before you catch the train.', meaning:'easy to reach and useful' }
      ],
      situationDistractors:[
        'The only shop was twenty kilometres away, and there was no bus.',
        'The restaurant was so far from the station that diners missed their trains.',
        'The recipe took four hours and needed twelve different pans.'
      ],
      retrievalContexts:[
        { id:'1', text:'Frozen vegetables are convenient because you can keep them for months and cook them in minutes.', target:'convenient', grammarPattern:'' },
        { id:'2', text:'A cafe next to the bus stop is very convenient for commuters who want a quick breakfast.', target:'convenient', grammarPattern:'' },
        { id:'3', text:'It is more convenient to shop online than to carry heavy bags home from the market.', target:'convenient', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'convenient', wrong:['curious', 'confident', 'cautious'] },
        { id:'2', answer:'convenient', wrong:['jealous', 'generous', 'anxious'] },
        { id:'3', answer:'convenient', wrong:['famous', 'honest', 'polite'] }
      ]
    }),
  e('extensive', 'adjective',
    'covering a large area or including many things',
    ['wide-ranging', 'very large'],
    ['costing a lot of money to produce', 'lasting only a short time', 'difficult for most people to understand'],
    'The restaurant has an extensive menu with over a hundred dishes.',
    'wide-ranging', 'The restaurant has a wide-ranging menu with over a hundred dishes.',
    'very large', 'The hotel has a very large garden with fruit trees and a lake.',
    {
      masteryContexts:[
        { text:'The farm has extensive fields where vegetables are grown for the local market.', meaning:'covering a large area' },
        { text:'After extensive research, the company changed its recipe to use less sugar.', meaning:'thorough and including many details' }
      ],
      situationDistractors:[
        'The tiny cafe had room for only four tables.',
        'The menu offered just three dishes, and they changed very rarely.',
        'The shop sold a few kinds of bread and nothing else.'
      ],
      retrievalContexts:[
        { id:'1', text:'The restaurant’s extensive wine list includes bottles from twenty countries.', target:'extensive', grammarPattern:'' },
        { id:'2', text:'Farmers in the region own extensive fields, and some farms are bigger than a small town.', target:'extensive', grammarPattern:'' },
        { id:'3', text:'Before opening the restaurant, the owner did extensive research for two years into local tastes and prices.', target:'extensive', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'extensive', wrong:['limited', 'tiny', 'narrow'] },
        { id:'2', answer:'extensive', wrong:['tiny', 'narrow', 'limited'] },
        { id:'3', answer:'extensive', wrong:['quick', 'casual', 'lucky'] }
      ]
    }),
  e('fashionable', 'adjective',
    'popular and stylish at a particular time',
    ['trendy', 'in style'],
    ['cheap and easy to find', 'old and traditional', 'plain and practical'],
    'Bubble tea is a fashionable drink among teenagers in the city.',
    'trendy', 'Bubble tea is a trendy drink among teenagers in the city.',
    'in style', 'Healthy juice bars are in style among young people at the moment.',
    {
      masteryContexts:[
        { text:'It is fashionable to eat plant-based food, and many new cafes now offer vegan menus.', meaning:'popular at the present time' },
        { text:'The fashionable restaurant on the harbour is always full of young people who want to be seen there.', meaning:'popular and stylish' }
      ],
      situationDistractors:[
        'Nobody visits the old cafe, and its menu has not changed since 1980.',
        'The restaurant is empty, and young people say it looks dull and out of date.',
        'The shop sells plain, practical lunch boxes that people have used for years.'
      ],
      retrievalContexts:[
        { id:'1', text:'Bubble tea became fashionable among teenagers after it appeared on social media.', target:'fashionable', grammarPattern:'' },
        { id:'2', text:'The cafe is in a fashionable part of town, so the prices are high and it is always busy.', target:'fashionable', grammarPattern:'' },
        { id:'3', text:'Ten years ago, kale was not fashionable, but now it is on the menu of many restaurants.', target:'fashionable', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'fashionable', wrong:['punctual', 'generous', 'nervous'] },
        { id:'2', answer:'fashionable', wrong:['remote', 'dull', 'peaceful'] },
        { id:'3', answer:'fashionable', wrong:['punctual', 'tired', 'shy'] }
      ]
    }),
  e('satisfying', 'adjective',
    'pleasing because it gives you what you wanted or needed',
    ['pleasing', 'rewarding'],
    ['causing worry because it is not enough', 'needing a lot of time and effort', 'costing more than expected'],
    'A bowl of hot soup is a satisfying meal after a long, cold walk.',
    'pleasing', 'A bowl of hot soup is a pleasing meal after a long, cold walk.',
    'rewarding', 'Cooking a meal for your family can be a rewarding experience.',
    {
      masteryContexts:[
        { text:'After the long hike, the hot noodle soup was warm, filling and very satisfying.', meaning:'pleasing because it gave what was needed' },
        { text:'It is satisfying to see customers enjoy a meal that you have cooked yourself.', meaning:'giving a pleasant feeling of success' }
      ],
      situationDistractors:[
        'The soup was cold and tasted of nothing, and we left most of it.',
        'The portion was so small that we were still hungry after dessert.',
        'The waiter forgot our order twice, and the bill was wrong.'
      ],
      retrievalContexts:[
        { id:'1', text:'A warm bowl of soup on a cold evening is simple but very satisfying.', target:'satisfying', grammarPattern:'' },
        { id:'2', text:'The restaurant’s chocolate dessert was rich, sweet and deeply satisfying.', target:'satisfying', grammarPattern:'' },
        { id:'3', text:'There is nothing more satisfying than finishing a difficult recipe and tasting the result.', target:'satisfying', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'satisfying', wrong:['confusing', 'tiring', 'worrying'] },
        { id:'2', answer:'satisfying', wrong:['disappointing', 'annoying', 'worrying'] },
        { id:'3', answer:'satisfying', wrong:['unfair', 'confusing', 'noisy'] }
      ]
    }),
  e('reasonable', 'adjective',
    'fair and sensible, not too extreme',
    ['fair', 'sensible'],
    ['very cheap and of poor quality', 'strange and difficult to believe', 'extreme and unfair to others'],
    'The meal was good, and the price was reasonable.',
    'fair', 'The meal was good, and the price was fair.',
    'sensible', 'It is sensible to ask about the price before you order.',
    {
      idKey:'reasonable_3',
      teacherNote:'Unit 3 item (reasonable_3), separate from Unit 1 reasonable; shares only the lexical spelling list.',
      masteryContexts:[
        { text:'The cafe serves large portions at a reasonable price, so it is popular with students.', meaning:'fair and not too high' },
        { text:'It is reasonable to expect hot food to arrive hot, so her complaint was fair.', meaning:'sensible and fair to expect' }
      ],
      situationDistractors:[
        'The bill came to three times the price on the menu, and nobody could explain why.',
        'The waiter shouted at the customer for asking a simple question.',
        'The restaurant demanded a deposit of two hundred pounds for a cup of tea.'
      ],
      retrievalContexts:[
        { id:'1', text:'You can eat a three-course lunch at a reasonable price in this small restaurant.', target:'reasonable', grammarPattern:'' },
        { id:'2', text:'It is reasonable to ask the waiter what a dish contains if you are not sure.', target:'reasonable', grammarPattern:'' },
        { id:'3', text:'After a long, tiring day, it is reasonable to expect a hot meal and a quick reply from the staff.', target:'reasonable', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'reasonable', wrong:['sudden', 'secret', 'loud'] },
        { id:'2', answer:'reasonable', wrong:['impossible', 'unlucky', 'careless'] },
        { id:'3', answer:'reasonable', wrong:['selfish', 'dishonest', 'dangerous'] }
      ]
    }),
  e('disappointed', 'adjective',
    'unhappy because something was not as good as you hoped',
    ['let down', 'unhappy with the result'],
    ['angry because someone was rude', 'tired because of too much work', 'worried because something is dangerous'],
    'We were disappointed by the soup, which was cold and tasted of nothing.',
    'let down', 'We were let down by the soup, which was cold and tasted of nothing.',
    'unhappy with the result', 'Many customers were unhappy with the result of the new recipe.',
    {
      masteryContexts:[
        { text:'Customers were disappointed when the restaurant ran out of their favourite dish.', meaning:'unhappy because things were not as hoped' },
        { text:'She felt disappointed with the service, because the waiter forgot her order twice.', meaning:'let down because expectations were not met' }
      ],
      situationDistractors:[
        'The meal arrived quickly, and every dish tasted wonderful.',
        'The family left the restaurant delighted by the friendly service.',
        'He was thrilled when the chef brought a free dessert.'
      ],
      retrievalContexts:[
        { id:'1', text:'We were disappointed with the burger, because it was cold and much smaller than the picture on the menu.', target:'disappointed', grammarPattern:'' },
        { id:'2', text:'The customers felt disappointed when they found out that the restaurant had no vegetarian dishes.', target:'disappointed', grammarPattern:'' },
        { id:'3', text:'I was disappointed that the dessert I had waited all evening for was sold out.', target:'disappointed', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'disappointed', wrong:['delighted', 'grateful', 'excited'] },
        { id:'2', answer:'disappointed', wrong:['grateful', 'pleased', 'proud'] },
        { id:'3', answer:'disappointed', wrong:['grateful', 'pleased', 'proud'] }
      ]
    }),
  e('inconvenient', 'adjective',
    'causing difficulty or extra trouble because it does not suit your needs',
    ['not suitable', 'troublesome'],
    ['not physically comfortable to sit in', 'not clean enough to use', 'not friendly to customers'],
    'The restaurant is inconvenient for people without a car, because the nearest bus stop is two kilometres away.',
    'not suitable', 'The restaurant is not suitable for people without a car, because the nearest bus stop is two kilometres away.',
    'troublesome', 'The late opening time is troublesome for families with small children.',
    {
      masteryContexts:[
        { text:'The cafe is open only from ten to two, which is inconvenient for people who finish work at five.', meaning:'causing difficulty because of the time' },
        { text:'Having no parking near the market is inconvenient for shoppers with heavy bags.', meaning:'not suitable and causing extra trouble' }
      ],
      situationDistractors:[
        'The chairs were soft, the room was warm, and the music was gentle.',
        'The restaurant was right next to the station and open until midnight.',
        'Buses stopped outside the cafe every five minutes all day.'
      ],
      retrievalContexts:[
        { id:'1', text:'The new supermarket is inconvenient for people without a car, because the nearest bus stop is two kilometres away.', target:'inconvenient', grammarPattern:'' },
        { id:'2', text:'Closing at four o’clock is inconvenient for workers who only finish at five.', target:'inconvenient', grammarPattern:'' },
        { id:'3', text:'It is inconvenient to carry heavy shopping bags home when there is no lift.', target:'inconvenient', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'inconvenient', wrong:['uncomfortable', 'generous', 'punctual'] },
        { id:'2', answer:'inconvenient', wrong:['uncomfortable', 'dishonest', 'delicious'] },
        { id:'3', answer:'inconvenient', wrong:['dishonest', 'delicious', 'generous'] }
      ]
    }),
  e('excellent', 'adjective',
    'of a very high standard, much better than most others',
    ['outstanding', 'first-class'],
    ['good enough to be acceptable', 'different from most others', 'expensive for what you get'],
    'The restaurant has an excellent reputation for its fresh seafood and friendly service.',
    'outstanding', 'The restaurant has an outstanding reputation for its fresh seafood and friendly service.',
    'first-class', 'The hotel restaurant serves first-class food at weekends.',
    {
      masteryContexts:[
        { text:'The reviews describe the service as excellent and the food as fresh and well cooked.', meaning:'of a very high standard' },
        { text:'The chef received an award for his excellent cooking.', meaning:'much better than most' }
      ],
      situationDistractors:[
        'The soup was lukewarm, and the service was slow but acceptable.',
        'The meal was average: neither good nor bad.',
        'Nothing on the menu stood out, and most diners forgot the evening quickly.'
      ],
      retrievalContexts:[
        { id:'1', text:'The reviews describe the service as excellent and the food as fresh and perfectly cooked.', target:'excellent', grammarPattern:'' },
        { id:'2', text:'Everyone at the table agreed that the seafood soup was excellent, and several guests ordered a second bowl.', target:'excellent', grammarPattern:'' },
        { id:'3', text:'The seafood at that restaurant is excellent, so it is fully booked every weekend.', target:'excellent', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'excellent', wrong:['terrible', 'careless', 'rude'] },
        { id:'2', answer:'excellent', wrong:['terrible', 'tasteless', 'disgusting'] },
        { id:'3', answer:'excellent', wrong:['terrible', 'plain', 'cold'] }
      ]
    }),
  e('polite', 'adjective',
    'behaving in a respectful way that shows good manners',
    ['courteous', 'well-mannered'],
    ['quick and efficient in serving food', 'friendly and talkative with friends', 'formal and strict about rules'],
    'The waiter was polite to every guest, even when the restaurant was very busy.',
    'courteous', 'The waiter was courteous to every guest, even when the restaurant was very busy.',
    'well-mannered', 'The well-mannered staff greeted every customer with a smile.',
    {
      masteryContexts:[
        { text:'The polite waiter thanked us for coming and held the door open.', meaning:'showing good manners and respect' },
        { text:'It is polite to say thank you to the person who brings your food.', meaning:'showing respect and good manners' }
      ],
      situationDistractors:[
        'The waiter shouted at the customer and threw the menu on the table.',
        'The guests talked loudly and rudely about the food while the cook was listening.',
        'He interrupted the manager three times and walked away without a word.'
      ],
      retrievalContexts:[
        { id:'1', text:'The waiter was polite even when a customer complained loudly about the soup.', target:'polite', grammarPattern:'' },
        { id:'2', text:'It is polite to wait until everyone at the table has been served before you start eating.', target:'polite', grammarPattern:'' },
        { id:'3', text:'Customers like staff who are polite and who answer questions with a smile.', target:'polite', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'polite', wrong:['curious', 'hungry', 'proud'] },
        { id:'2', answer:'polite', wrong:['expensive', 'tired', 'hungry'] },
        { id:'3', answer:'polite', wrong:['famous', 'jealous', 'curious'] }
      ]
    }),
  e('helpful', 'adjective',
    'willing to help, or useful for solving a problem',
    ['willing to help', 'useful'],
    ['pleased to see customers again', 'good at making food quickly', 'careful with money'],
    'The staff in the cafe were friendly and helpful when we asked about the menu.',
    'willing to help', 'The staff in the cafe were friendly and willing to help when we asked about the menu.',
    'useful', 'The waiter gave us useful advice about which dishes to order.',
    {
      masteryContexts:[
        { text:'The shop assistant was very helpful and explained which cheese goes best with each biscuit.', meaning:'willing to give useful help' },
        { text:'The website has a helpful map that shows where each food stall is located.', meaning:'useful for finding what you need' }
      ],
      situationDistractors:[
        'The waiter ignored our questions and walked away.',
        'Nobody at the information desk could explain the menu, and they would not try.',
        'The assistant said it was not her job to answer and went back to her phone.'
      ],
      retrievalContexts:[
        { id:'1', text:'The waiter was very helpful and suggested a dish that did not contain nuts.', target:'helpful', grammarPattern:'' },
        { id:'2', text:'The instructions were so helpful that even a beginner could make the sauce.', target:'helpful', grammarPattern:'' },
        { id:'3', text:'Staff who are helpful always answer questions patiently, and they never make customers feel silly.', target:'helpful', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'helpful', wrong:['punctual', 'famous', 'nervous'] },
        { id:'2', answer:'helpful', wrong:['careless', 'boring', 'famous'] },
        { id:'3', answer:'helpful', wrong:['careless', 'famous', 'nervous'] }
      ]
    }),
  e('recommendation', 'noun',
    'a suggestion about what is good or what to do',
    ['suggestion', 'advice'],
    ['a complaint about poor service', 'a bill for a meal', 'a rule that everyone must follow'],
    'We chose this restaurant on the recommendation of a friend.',
    'suggestion', 'We chose this restaurant on the suggestion of a friend.',
    'advice', 'On the advice of our teacher, we tried the local fish curry.',
    {
      masteryContexts:[
        { text:'We booked the table on the recommendation of a friend who had eaten there twice.', meaning:'a suggestion that something is good' },
        { text:'The waiter gave us a recommendation for dessert, and the chocolate cake was delicious.', meaning:'advice about what to choose' }
      ],
      situationDistractors:[
        'The customer wrote a long complaint about the cold soup.',
        'The manager ordered the staff to wear uniforms.',
        'The guests paid the bill and left a tip.'
      ],
      retrievalContexts:[
        { id:'1', text:'We chose this restaurant on the recommendation of a friend who had eaten here many times.', target:'recommendation', grammarPattern:'' },
        { id:'2', text:'The waiter gave us a recommendation for a main course, and we ordered the grilled fish.', target:'recommendation', grammarPattern:'' },
        { id:'3', text:'The guidebook includes a recommendation for every town, with a short note on the best local dish.', target:'recommendation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'recommendation', wrong:['complaint', 'argument', 'invoice'] },
        { id:'2', answer:'recommendation', wrong:['complaint', 'joke', 'photo'] },
        { id:'3', answer:'recommendation', wrong:['warning', 'receipt', 'bill'] }
      ]
    }),
  e('informative', 'adjective',
    'giving a lot of useful facts',
    ['full of facts', 'instructive'],
    ['exciting and enjoyable to watch', 'long and difficult to follow', 'short and without any detail'],
    'The guide to local food was informative, with clear facts about every dish.',
    'full of facts', 'The guide to local food was full of facts, with clear details about every dish.',
    'instructive', 'The cooking programme was instructive, and viewers learned how to make bread.',
    {
      masteryContexts:[
        { text:'The museum’s food exhibition was very informative, with clear facts about how rice is grown.', meaning:'giving a lot of useful facts' },
        { text:'The label is informative because it lists every ingredient and the amount of sugar in each portion.', meaning:'giving clear and useful facts' }
      ],
      situationDistractors:[
        'The leaflet had a lovely picture of a cake but no facts at all.',
        'The poster was colourful, but nobody could say what it was about.',
        'The speaker told funny stories for an hour and gave no facts about the food.'
      ],
      retrievalContexts:[
        { id:'1', text:'The documentary about street food was informative, and viewers learned how each dish is made.', target:'informative', grammarPattern:'' },
        { id:'2', text:'Nutrition labels are informative because they show how much sugar, salt and fat each product contains.', target:'informative', grammarPattern:'' },
        { id:'3', text:'The guide to local dishes was short, clear and informative, so tourists used it every day.', target:'informative', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'informative', wrong:['careless', 'crowded', 'tasteless'] },
        { id:'2', answer:'informative', wrong:['noisy', 'sticky', 'crowded'] },
        { id:'3', answer:'informative', wrong:['careless', 'tasteless', 'dishonest'] }
      ]
    }),
  e('reflection', 'noun',
    'careful thought about something, especially to understand or judge it',
    ['careful thought', 'serious consideration'],
    ['a quick guess made without thinking', 'a sudden feeling of hunger', 'a formal rule about behaviour'],
    'The chef spent a quiet hour in reflection before she decided on the new menu.',
    'careful thought', 'The chef spent a quiet hour in careful thought before she decided on the new menu.',
    'serious consideration', 'After serious consideration, the owner decided to change the menu.',
    {
      masteryContexts:[
        { text:'After the cooking project, each student wrote a short reflection on what had gone well and what could improve.', meaning:'careful thought about past events or work' },
        { text:'The owner read the customer comments and, after some reflection, decided to simplify the menu.', meaning:'time spent thinking carefully' }
      ],
      situationDistractors:[
        'The student ordered a sandwich without reading the menu and ate it in a hurry.',
        'The chef answered at once, started cooking and never stopped to think.',
        'The class tasted five dishes and shouted their votes at the same moment.'
      ],
      retrievalContexts:[
        { id:'1', text:'After a period of quiet reflection, the owner decided to change the menu.', target:'reflection', grammarPattern:'' },
        { id:'2', text:'Students wrote a short reflection on their cooking lesson at the end of the term.', target:'reflection', grammarPattern:'' },
        { id:'3', text:'The teacher asked the class for a written reflection on what they had learned about nutrition.', target:'reflection', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'reflection', wrong:['travel', 'laughter', 'payment'] },
        { id:'2', answer:'reflection', wrong:['complaint', 'recipe', 'picture'] },
        { id:'3', answer:'reflection', wrong:['complaint', 'receipt', 'schedule'] }
      ]
    }),
  e('organiser', 'noun',
    'a person who plans and arranges an event or activity',
    ['event planner', 'person who arranges events'],
    ['a person who takes part in an activity', 'a person who pays for an event', 'a person who cleans after an event'],
    'The organiser of the food festival booked the stalls and sent the invitations.',
    'event planner', 'The event planner of the food festival booked the stalls and sent the invitations.',
    'person who arranges events', 'A person who arranges events must check the food and the guest list carefully.',
    {
      masteryContexts:[
        { text:'The organiser of the school food festival booked forty stalls and invited every family in the town.', meaning:'the person who plans and arranges an event' },
        { text:'The organiser asked every cook to arrive by eight o’clock so that the market could open on time.', meaning:'the person in charge of planning an activity' }
      ],
      situationDistractors:[
        'A visitor tasted the soup at one stall and left without buying anything.',
        'A cook washed the pans when the event had finished.',
        'The audience clapped when the singer finished the last song.'
      ],
      retrievalContexts:[
        { id:'1', text:'The organiser of the food fair checked that every stall had a table and enough electricity.', target:'organiser', grammarPattern:'' },
        { id:'2', text:'Thank you to the organiser, who worked for months to arrange the school cooking competition.', target:'organiser', grammarPattern:'' },
        { id:'3', text:'As the organiser of the class picnic, Sara made a list of who would bring each dish.', target:'organiser', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'organiser', wrong:['visitor', 'winner', 'neighbour'] },
        { id:'2', answer:'organiser', wrong:['winner', 'visitor', 'customer'] },
        { id:'3', answer:'organiser', wrong:['winner', 'customer', 'neighbour'] }
      ]
    }),
  e('presenter', 'noun',
    'a person who introduces a programme or gives a talk to an audience',
    ['host', 'person who introduces a programme'],
    ['a person who cooks the food for a programme', 'a person who watches a programme at home', 'a person who pays for a programme'],
    'The presenter of the cooking programme showed viewers how to make fresh pasta.',
    'host', 'The host of the cooking programme showed viewers how to make fresh pasta.',
    'person who introduces a programme', 'The person who introduces a programme welcomed the viewers and the guest chef.',
    {
      masteryContexts:[
        { text:'The presenter of the radio programme introduced the guest chef and asked her about her favourite recipes.', meaning:'a person who introduces and leads a programme' },
        { text:'At the school conference, each presenter had ten minutes to explain a project on healthy eating.', meaning:'a person who gives a talk to an audience' }
      ],
      situationDistractors:[
        'The audience sat quietly and ate their sandwiches before the show began.',
        'The camera operator set up the lights and checked the sound.',
        'The viewers switched off the television and went to bed.'
      ],
      retrievalContexts:[
        { id:'1', text:'The presenter of the cooking programme smiled at the camera and welcomed the viewers.', target:'presenter', grammarPattern:'' },
        { id:'2', text:'Each presenter at the food science conference had ten minutes to explain a project.', target:'presenter', grammarPattern:'' },
        { id:'3', text:'The radio presenter asked the chef about the history of the dish.', target:'presenter', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'presenter', wrong:['driver', 'farmer', 'neighbour'] },
        { id:'2', answer:'presenter', wrong:['waiter', 'driver', 'farmer'] },
        { id:'3', answer:'presenter', wrong:['farmer', 'neighbour', 'tourist'] }
      ]
    }),
  e('evaluate', 'verb',
    'to judge how good, useful or successful something is by thinking about it carefully',
    ['assess', 'judge the quality of'],
    ['to prepare food for a large group', 'to repeat a recipe from memory', 'to choose a table in a restaurant'],
    'Food critics evaluate a restaurant by looking at its dishes, its service and its atmosphere.',
    'assess', 'Food critics assess a restaurant by looking at its dishes, its service and its atmosphere.',
    'judge the quality of', 'Inspectors judge the quality of the food before they give a restaurant its award.',
    {
      grammarForms:{ base:'evaluate', thirdPerson:'evaluates', past:'evaluated', pastParticiple:'evaluated', ing:'evaluating' },
      masteryContexts:[
        { text:'Before choosing a restaurant, we read reviews to evaluate the quality of its food and service.', meaning:'judge how good something is' },
        { text:'Students were asked to evaluate three school lunch menus and decide which one offered the best value.', meaning:'judge the quality or value of something carefully' }
      ],
      situationDistractors:[
        'The cook added salt to the soup and stirred it without tasting it.',
        'The waiter wrote down the order and walked to the kitchen.',
        'The class ate their lunch and put the plates in the sink.'
      ],
      retrievalContexts:[
        { id:'1', text:'Judges evaluate each dish for taste, appearance and the skill of the cook.', target:'evaluate', grammarPattern:'' },
        { id:'2', text:'It is important to evaluate the information on a food label before you decide to buy the product.', target:'evaluate', grammarPattern:'' },
        { id:'3', text:'We asked customers to evaluate the service by filling in a short form.', target:'evaluate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'evaluate', wrong:['peel', 'pour', 'wrap'] },
        { id:'2', answer:'evaluate', wrong:['copy', 'fold', 'sell'] },
        { id:'3', answer:'evaluate', wrong:['carry', 'fold', 'repair'] }
      ]
    }),
  e('consume', 'verb',
    'to eat or drink something, or to use up an amount of something',
    ['eat or drink', 'use up'],
    ['to prepare and cook something carefully', 'to buy something from a shop', 'to throw something away after use'],
    'Hungry visitors at the food festival consume a huge amount of snacks and juice.',
    'eat or drink', 'Hungry visitors at the food festival eat or drink a huge amount of snacks and juice.',
    'use up', 'A large restaurant can use up hundreds of litres of cooking oil every week.',
    {
      grammarForms:{ base:'consume', thirdPerson:'consumes', past:'consumed', pastParticiple:'consumed', ing:'consuming' },
      masteryContexts:[
        { text:'A family of four can consume a large bag of rice in less than two weeks.', meaning:'eat or use up an amount of food' },
        { text:'Most adults consume at least one cup of tea or coffee every day.', meaning:'drink or eat something regularly' }
      ],
      situationDistractors:[
        'The farmer grew rice in a flooded field and sold it at the market.',
        'The shop assistant put the rice on the shelf and counted the bags.',
        'The chef bought vegetables and carried them to the kitchen.'
      ],
      retrievalContexts:[
        { id:'1', text:'Hungry visitors at the festival consume thousands of snacks in a single weekend.', target:'consume', grammarPattern:'' },
        { id:'2', text:'The average family in this town will consume about two kilograms of rice each week.', target:'consume', grammarPattern:'' },
        { id:'3', text:'Restaurants consume large amounts of cooking oil, so many of them buy it in bulk.', target:'consume', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'consume', wrong:['grow', 'repair', 'carry'] },
        { id:'2', answer:'consume', wrong:['repair', 'forget', 'answer'] },
        { id:'3', answer:'consume', wrong:['paint', 'repair', 'forget'] }
      ]
    }),
  e('balanced', 'adjective',
    'having the right amounts of different things, so that no one part is too big',
    ['well-proportioned', 'in the right proportions'],
    ['containing only one kind of food', 'served in very small amounts', 'prepared with a lot of oil'],
    'The school offers a balanced lunch with vegetables, protein and rice.',
    'well-proportioned', 'The school offers a well-proportioned lunch with vegetables, protein and rice.',
    'in the right proportions', 'A good meal contains vegetables, protein and rice in the right proportions.',
    {
      masteryContexts:[
        { text:'The school lunch is balanced, with vegetables, protein, rice and a piece of fruit.', meaning:'including the right amounts of different foods' },
        { text:'The chef planned a balanced menu, with light dishes placed between the rich ones.', meaning:'arranged so that no part is too heavy or too large' }
      ],
      situationDistractors:[
        'The lunch box held ten chocolate bars and nothing else.',
        'The cook served a huge bowl of plain rice with no other food.',
        'The plate was almost empty, with only one small pea in the middle.'
      ],
      retrievalContexts:[
        { id:'1', text:'A balanced diet includes foods from several groups, such as grains, vegetables and protein.', target:'balanced', grammarPattern:'' },
        { id:'2', text:'The school wants every lunch to be balanced, with some vegetables, some protein and some fruit.', target:'balanced', grammarPattern:'' },
        { id:'3', text:'The chef planned a balanced menu in which each rich dish was followed by something light.', target:'balanced', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'balanced', wrong:['crowded', 'famous', 'cheap'] },
        { id:'2', answer:'balanced', wrong:['crowded', 'famous', 'noisy'] },
        { id:'3', answer:'balanced', wrong:['crowded', 'famous', 'noisy'] }
      ]
    }),
  e('calorie', 'noun',
    'a unit used to measure the energy that food provides',
    ['unit of food energy', 'measure of food energy'],
    ['a unit used to measure the weight of food', 'a unit used to measure the heat of an oven', 'a unit used to measure the time needed to cook'],
    'Scientists measure the energy in a snack by counting each calorie that it contains.',
    'unit of food energy', 'Scientists measure the energy in a snack by counting each unit of food energy that it contains.',
    'measure of food energy', 'The label gives the measure of food energy in one portion of soup.',
    {
      masteryContexts:[
        { text:'A calorie is a unit that shows how much energy a food provides.', meaning:'a unit for measuring the energy in food' },
        { text:'The menu shows the calorie value of every dish next to its price.', meaning:'a measure of the energy in food' }
      ],
      situationDistractors:[
        'The cook weighed the flour and added two spoons of sugar.',
        'The oven was heated to two hundred degrees before the bread went in.',
        'The label listed the country where the rice was grown.'
      ],
      retrievalContexts:[
        { id:'1', text:'In science lessons, a calorie is described as a unit of energy in food.', target:'calorie', grammarPattern:'' },
        { id:'2', text:'The nutrition label lists the calorie count for one portion of the soup.', target:'calorie', grammarPattern:'' },
        { id:'3', text:'Each portion on the menu has a calorie value printed beside its price.', target:'calorie', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'calorie', wrong:['gram', 'litre', 'degree'] },
        { id:'2', answer:'calorie', wrong:['page', 'word', 'seat'] },
        { id:'3', answer:'calorie', wrong:['colour', 'shape', 'size'] }
      ]
    }),
  e('hygienic', 'adjective',
    'clean in a way that stops dirt and germs from spreading',
    ['clean and germ-free', 'free from dirt and germs'],
    ['tidy and well organised', 'cold and kept fresh', 'old and rarely used'],
    'The kitchen was hygienic, with shining surfaces and staff who washed their hands often.',
    'clean and germ-free', 'The kitchen was clean and germ-free, with shining surfaces and staff who washed their hands often.',
    'free from dirt and germs', 'Food must be kept in containers that are free from dirt and germs.',
    {
      masteryContexts:[
        { text:'The inspector praised the hygienic kitchen, where staff washed their hands and cleaned every surface.', meaning:'clean in a way that stops germs spreading' },
        { text:'It is not hygienic to prepare raw chicken and salad on the same board.', meaning:'safe because it avoids spreading dirt and germs' }
      ],
      situationDistractors:[
        'The cook left the raw meat on the table next to the bread for an hour.',
        'The waiter dropped a spoon, wiped it on his shirt and put it back on the table.',
        'The kitchen floor was covered in old food and the bins were overflowing.'
      ],
      retrievalContexts:[
        { id:'1', text:'The health inspector checked that the kitchen was hygienic before the restaurant opened.', target:'hygienic', grammarPattern:'' },
        { id:'2', text:'It is not hygienic to touch food with dirty hands, so cooks wash their hands often.', target:'hygienic', grammarPattern:'' },
        { id:'3', text:'Street food stalls must keep their equipment hygienic by cleaning it after every customer.', target:'hygienic', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'hygienic', wrong:['crowded', 'famous', 'noisy'] },
        { id:'2', answer:'hygienic', wrong:['useful', 'cheap', 'famous'] },
        { id:'3', answer:'hygienic', wrong:['noisy', 'famous', 'heavy'] }
      ]
    }),
  e('appetising', 'adjective',
    'looking or smelling so good that you want to eat it',
    ['mouth-watering', 'tempting'],
    ['tasting too strongly of salt', 'served hot and ready to eat', 'cheap enough for everyone to buy'],
    'The smell of fresh bread from the bakery was very appetising.',
    'mouth-watering', 'The smell of fresh bread from the bakery was very mouth-watering.',
    'tempting', 'The cake looked tempting, with its thick chocolate sauce.',
    {
      masteryContexts:[
        { text:'The pizza arrived hot from the oven, with melted cheese and a delicious smell, and it looked very appetising.', meaning:'looking so good that you want to eat it' },
        { text:'Chefs arrange food carefully on the plate to make it look more appetising.', meaning:'attractive and making people want to eat' }
      ],
      situationDistractors:[
        'The soup was cold, grey and full of lumps, so nobody wanted to try it.',
        'The meal was served on time, but the portions were small.',
        'The cook carried the heavy pot from the stove to the table.'
      ],
      retrievalContexts:[
        { id:'1', text:'The smell of fresh bread from the bakery was so appetising that we stopped to buy a loaf.', target:'appetising', grammarPattern:'' },
        { id:'2', text:'The restaurant uses bright colours on the plate to make the food look more appetising.', target:'appetising', grammarPattern:'' },
        { id:'3', text:'A grey, cold bowl of soup is not very appetising, even if it tastes fine.', target:'appetising', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'appetising', wrong:['crowded', 'noisy', 'heavy'] },
        { id:'2', answer:'appetising', wrong:['crowded', 'noisy', 'heavy'] },
        { id:'3', answer:'appetising', wrong:['crowded', 'noisy', 'famous'] }
      ]
    }),
  e('cuisine', 'noun',
    'a style of cooking that is typical of a particular place or culture',
    ['style of cooking', 'cooking tradition'],
    ['a place where food is sold', 'a list of dishes in a restaurant', 'a method used to keep food fresh'],
    'Many tourists travel to Italy to enjoy the local cuisine.',
    'style of cooking', 'Many tourists travel to Italy to enjoy the local style of cooking.',
    'cooking tradition', 'Each region has its own cooking tradition, with different spices and ingredients.',
    {
      masteryContexts:[
        { text:'Many tourists travel to Italy to enjoy the local cuisine, especially fresh pasta and pizza.', meaning:'the style of cooking of a particular place' },
        { text:'The restaurant serves Korean cuisine, so the menu includes rice dishes, soups and spicy vegetables.', meaning:'cooking that is typical of a country or culture' }
      ],
      situationDistractors:[
        'The farmer sold fresh tomatoes at the market on Saturday morning.',
        'The waiter brought the bill and a mint to every table.',
        'The chef tasted the soup, added salt and stirred it again.'
      ],
      retrievalContexts:[
        { id:'1', text:'Thai cuisine is famous for its balance of sweet, sour, salty and spicy flavours.', target:'cuisine', grammarPattern:'' },
        { id:'2', text:'We tried the local cuisine and loved the fresh seafood and spicy sauces.', target:'cuisine', grammarPattern:'' },
        { id:'3', text:'The festival gives visitors the chance to taste cuisine from twenty different countries.', target:'cuisine', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'cuisine', wrong:['weather', 'music', 'language'] },
        { id:'2', answer:'cuisine', wrong:['weather', 'music', 'transport'] },
        { id:'3', answer:'cuisine', wrong:['clothing', 'music', 'transport'] }
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
  // One shared list per word: Unit 3's "reasonable" reuses Unit 1's reviewed misspellings.
  lexicalSpelling:{ ...LEXICAL_SPELLING_ERRORS, vocab_reasonable_3:LEXICAL_SPELLING_ERRORS.vocab_reasonable }
});
