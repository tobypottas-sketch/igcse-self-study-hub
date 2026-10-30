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
  ]
});
