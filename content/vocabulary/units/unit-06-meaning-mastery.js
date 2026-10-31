// Unit 6 · Meaning · Apply and Mastery — authored wrong meanings, WORDS 1–10 so far. Same contract as unit-05-meaning-mastery.js:
// two records per word in the order of the word's two Mastery contexts; exactly three authored WRONG glosses, same grammar and similar length
// as the correct gloss, plausible in general, wrong in this sentence.
const w = (wrongMeanings, extra = {}) => ({ wrongMeanings, ...extra });

export default Object.freeze({
  absorb: [
    w(['to copy information from a source exactly', 'to remember information only for a test', 'to give information to other students']),
    w(['to practise knowledge in a formal lesson', 'to test knowledge by asking questions', 'to share knowledge with other learners'])
  ],
  confidence: [
    w(['fear of speaking in front of other people', 'respect for the opinions of other people', 'interest in the work of other people']),
    w(['worry that you may make a mistake', 'certainty that your answer is correct', 'permission to speak in front of the class'])
  ],
  dilemma: [
    w(['a serious mistake that cannot be corrected', 'an argument between two close friends', 'a disappointing result in an examination']),
    w(['a situation in which a plan has been cancelled', 'a situation in which two groups disagree', 'a situation in which a promise has been broken'])
  ],
  dramatically: [
    w(['in a way that is easy to predict', 'in a slow and steady way', 'in a way that only experts notice']),
    w(['by a very small and gradual amount', 'by an amount that nobody measures', 'by an amount that stays the same'])
  ],
  equivalent: [
    w(['higher in value or level', 'recognised in only one country', 'similar in appearance or style']),
    w(['greater in value or effect', 'smaller in value or effect', 'different in value or effect'])
  ],
  overload: [
    w(['to give someone extra help with their work', 'to give someone a reward for hard work', 'to give someone work that is much too easy']),
    w(['to give your mind a rest before it works again', 'to teach your mind to remember facts accurately', 'to keep your mind free from all information'])
  ],
  stagnate: [
    w(['to get worse very quickly', 'to make progress in some subjects only', 'to start making progress again']),
    w(['to develop in an unexpected direction', 'to grow much faster than a rival', 'to change into a different business'])
  ],
  engage: [
    w(['to listen politely without taking part', 'to leave a task as soon as it is difficult', 'to make notes for another person']),
    w(['to read quickly and move on', 'to copy the main points of the text', 'to avoid the subject if it is difficult'])
  ],
  participate: [
    w(['to lead an activity from the front', 'to watch an activity quietly', 'to plan an activity in advance']),
    w(['to organise an event for others', 'to report on an event afterwards', 'to win a prize at an event'])
  ],
  passive: [
    w(['calm and quiet while studying', 'lazy and unwilling to study', 'slow but careful when studying']),
    w(['too tired to listen carefully', 'too nervous to join in at all', 'too lazy to attend lectures'])
  ]
});
