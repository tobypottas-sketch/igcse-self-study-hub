// Unit 2 · Meaning · Apply (meaning_in_context) and Mastery (gloss_in_context_type) — authored wrong meanings and context repairs.
// WORDS 1–10 ONLY (entertainment … current affairs). Same contract as unit-01-meaning-mastery.js:
//   * two records per word, in the order of the word's two Mastery contexts (0 = meaning context, 1 = paraphrase context);
//   * wrongMeanings: exactly three authored WRONG glosses, same grammar and similar length as the correct gloss, plausible in general,
//     wrong in this sentence, never also a fair reading of it;
//   * text / meaning (optional) replace the draft sentence/gloss when it could not support the contract (see `reason`). A replaced gloss
//     never contains the target or a derivative of it, because it is also the cue for Meaning Mastery.
const w = (wrongMeanings, extra = {}) => ({ wrongMeanings, ...extra });

export default Object.freeze({
  entertainment: [
    w(['meals and drinks that guests order', 'rooms and services that guests book', 'rules and notices that guests read']),
    w(['something people do to earn money', 'something people do to stay healthy', 'something people do to learn a skill'])
  ],
  access: [
    w(['a duty to guard or protect something', 'a plan to repair or replace something', 'a warning not to touch something']),
    w(['a rule about who may teach in a place', 'a cost for building or cleaning a place', 'a view of the inside of a place'])
  ],
  device: [
    w(['a long wire that carries electricity', 'a socket fixed to a wall', 'a shop that repairs machines']),
    w(['a plan for making a door safer', 'a rule about when a door must be shut', 'a person who guards the door'])
  ],
  digital: [
    w(['printed clearly on good paper', 'written carefully by hand', 'copied from an older book']),
    w(['working with film and chemicals', 'made by hand in small workshops', 'sold only in specialist shops'],
      { text: 'Most photographers now use digital cameras instead of film.', meaning: 'using electronic technology',
        reason: 'The draft sentence began with the target, so the blank would have hidden the capital letter; the sentence was reworded.' })
  ],
  streaming: [
    w(['copying songs from a disc onto a computer', 'recording songs from the radio', 'buying songs one at a time from a shop']),
    w(['saving files to a device for later use', 'sending large files to other people', 'checking online messages every few minutes'])
  ],
  relevant: [
    w(['too limited to be of any use', 'far greater than anyone else’s', 'valued highly by her friends']),
    w(['available to anyone who asks', 'recently added to the page', 'difficult for readers to understand'])
  ],
  educator: [
    w(['a person who inspects schools', 'a person who writes textbooks', 'a person who studies at home']),
    w(['someone whose job is to inspect school buildings', 'someone whose job is to write the exam papers', 'someone whose job is to manage the school budget'],
      { text: 'Any good educator tries to make lessons interesting for every student.', meaning: 'someone whose job is to teach or train others',
        reason: 'The draft sentence began with the target, so the blank would have hidden the capital letter; the sentence was reworded.' })
  ],
  afford: [
    w(['be patient enough to wait for', 'be confident enough to try', 'be interested enough to read about'],
      { meaning: 'have enough money to pay for', reason: 'The draft gloss described "cannot afford"; the type-in answer is the verb, so the gloss is now the verb meaning.' }),
    w(['be allowed to take', 'be forced to cancel', 'be eager to avoid'])
  ],
  essential: [
    w(['pleasant but unimportant', 'common but unexplained', 'popular among teenagers']),
    w(['so valuable that it must be insured', 'so large that it is hard to carry', 'so new that it has not been tested'],
      { meaning: 'so important that you cannot leave it out', reason: 'The draft gloss was a noun phrase for an adjective in the sentence; reworded to an adjective phrase.' })
  ],
  'current affairs': [
    w(['stories about sport and music', 'advice about money and health', 'lessons about history and languages']),
    w(['events planned for next year', 'events from a long time ago', 'events that happen at school'])
  ]
});
