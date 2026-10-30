// Unit 3 · Meaning · Apply and Mastery — authored wrong meanings, WORDS 1–10 ONLY. Same contract as unit-02-meaning-mastery.js:
// two records per word in the order of the word's two Mastery contexts; exactly three authored WRONG glosses, same grammar and similar length
// as the correct gloss, plausible in general, wrong in this sentence.
const w = (wrongMeanings, extra = {}) => ({ wrongMeanings, ...extra });

export default Object.freeze({
  participant: [
    w(['a person who watches an activity', 'a person who judges an activity', 'a person who pays for an activity']),
    w(['someone who writes about a study or activity', 'someone who judges a study or activity', 'someone who funds a study or activity'])
  ],
  outlet: [
    w(['a place where a company makes its products', 'a place where a company stores its products', 'a place where a company advertises its products']),
    w(['one office belonging to a larger company', 'one factory belonging to a larger company', 'one farm belonging to a larger company'])
  ],
  sprinkled: [
    w(['poured a thick liquid over something', 'wrapped a thin layer around something', 'removed small pieces from something']),
    w(['spilled a large amount onto something', 'rubbed oil firmly into something', 'wiped dust carefully off something'])
  ],
  underestimate: [
    w(['think something is more than it really is', 'know exactly what something is', 'forget what something is']),
    w(['judge something to be larger or harder than it is', 'measure something with great care', 'plan something well in advance'])
  ],
  considerably: [
    w(['by a small amount', 'at a very fast speed', 'for a long time']),
    w(['to a slightly greater degree', 'in a more careful way', 'at a much earlier time'])
  ],
  guaranteed: [
    w(['hoped for in secret', 'warned of in advance', 'guessed without any proof']),
    w(['asked with great politeness', 'suggested with some doubt', 'denied with great anger'])
  ],
  harmless: [
    w(['likely to hurt someone', 'too small to notice', 'too old to eat']),
    w(['causing serious damage', 'costing a lot of money', 'needing a lot of care'])
  ],
  pressure: [
    w(['a feeling of being hungry before a meal', 'a feeling that you want to be alone', 'a feeling that something is very good']),
    w(['an offer to give someone a gift', 'a warning that someone may be hurt', 'a request for someone to wait'])
  ],
  fooled: [
    w(['encouraged to try something new', 'warned about something dangerous', 'shown how something works']),
    w(['given a clear explanation of something', 'given a small present for something', 'given a polite warning about something'])
  ],
  majority: [
    w(['a few of a group', 'all of a group', 'none of a group']),
    w(['fewer than half of the people', 'exactly half of the people', 'all of the people'])
  ],
  inexpensive: [
    w(['costing far too much for most people', 'made from weak and poor materials', 'sold for only a short time']),
    w(['hard to find in the shops', 'high in quality and price', 'quick to cook and serve'])
  ],
  sodium: [
    w(['a vitamin found in fruit', 'a fat used for frying', 'a sweet substance added to drinks']),
    w(['a type of cooking oil', 'a kind of fresh herb', 'a colour added to sweets'])
  ],
  commercially: [
    w(['in order to teach and inform people', 'in order to save and reuse materials', 'in order to test and improve ideas']),
    w(['in small pots for pleasure', 'in secret without permission', 'by hand without any machines'])
  ],
  processed: [
    w(['kept in its natural form on a farm', 'grown from seeds in a garden', 'bought fresh from a local market']),
    w(['grown or picked by hand on a farm', 'cooked or served in a restaurant', 'washed or sorted in a market'])
  ],
  depression: [
    w(['a short period of feeling very tired and bored', 'a sudden feeling of anger and fear', 'a long period of feeling very proud']),
    w(['a fear of being left alone in a place', 'a habit of eating too much food', 'a feeling of being very excited about change'])
  ],
  overweight: [
    w(['taller than is usual for their age', 'stronger than is needed for sport', 'older than is allowed for the class']),
    w(['carrying more bags than is needed', 'thinner than is healthy for their height', 'paid more than is fair for their work'])
  ],
  unwell: [
    w(['upset about a bad result', 'worried about a test', 'annoyed by the noise']),
    w(['unhappy about the school rules', 'unable to find a seat', 'unlikely to arrive on time'])
  ],
  ingredients: [
    w(['the pans and knives used to cook food', 'the recipes that cooks write down', 'the customers who eat the food']),
    w(['the prices of all the goods in a shop', 'the dates when food will go bad', 'the instructions for heating a meal'])
  ],
  nutritious: [
    w(['containing a lot of sugar and cream', 'made quickly in a hot pan', 'sold at a very low price']),
    w(['popular because of their sweet taste', 'easy to carry in a bag', 'able to be kept for years'])
  ],
  moderation: [
    w(['very large amounts at one time', 'a rush without thinking', 'secret amounts that nobody sees']),
    w(['the habit of eating alone at home', 'the habit of paying too much attention to prices', 'the habit of copying friends'])
  ],
  deceive: [
    w(['persuade people to give money to charity', 'warn people about unsafe products', 'help people to find cheaper goods']),
    w(['teach customers about healthy eating', 'ask customers about their opinions', 'refuse to serve customers at all'])
  ],
  advertisement: [
    w(['a report that explains how a pizza is made', 'a menu that lists the dishes in a restaurant', 'a bill that shows how much a family must pay']),
    w(['a letter that thanks customers for their custom', 'a list of the goods that a shop has in stock', 'a notice that warns people about a danger'])
  ],
  variety: [
    w(['a small amount of food that is served first', 'a single type of dish that is always the same', 'a long list of rules for a kitchen']),
    w(['a lack of choice in a shop', 'a high price for goods', 'a feeling of being tired and bored'])
  ],
  portion: [
    w(['the whole amount of food made in a kitchen', 'the price that a customer pays for a meal', 'the list of dishes on offer']),
    w(['a part of a restaurant for large groups', 'a rule about how to eat politely', 'the person who brings the food'])
  ],
  purchase: [
    w(['a machine that cooks food quickly', 'a gift that a customer received', 'a list of things that a shop sells']),
    w(['a refund for goods that were returned', 'an order that a cook receives', 'an offer that a shop makes'])
  ],
  takeaway: [
    w(['a restaurant with tables and waiters', 'a market that sells fruit', 'a school for cooks']),
    w(['a meal that the family cooks together', 'a main idea from a conversation', 'a dish that has been left over'])
  ],
  barbecue: [
    w(['a quiet dinner in a formal restaurant', 'a cold picnic eaten in a park', 'a cooking lesson held at school']),
    w(['a metal bowl used for mixing food', 'a machine that freezes food quickly', 'a cupboard used for storing plates'])
  ],
  saturated: [
    w(['describing a fat that stays liquid in the fridge', 'describing food that is completely wet', 'describing a fat that has no taste']),
    w(['full of water after heavy rain', 'sweet and sticky after cooking', 'very hot after frying'])
  ],
  convenient: [
    w(['popular because it sells cheap food', 'large enough for many customers', 'pleasant because it has a garden']),
    w(['expensive because it is in the city', 'crowded because it is lunchtime', 'open only at weekends'])
  ],
  extensive: [
    w(['divided into small private gardens', 'covered by thick forest', 'close to the busy town centre']),
    w(['quick and without much care', 'secret and unfinished', 'expensive and inaccurate'])
  ]

});
