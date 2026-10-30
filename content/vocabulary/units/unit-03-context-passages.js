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
  ]
});
