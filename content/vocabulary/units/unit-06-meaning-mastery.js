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
  ],
  active: [
    w(['full of physical energy and movement', 'busy with too many different jobs', 'quick to give an answer']),
    w(['always moving about the classroom', 'busy at every hour of the day', 'strong enough to lift heavy objects'])
  ],
  evaluate: [
    w(['to describe how something looks in detail', 'to make something larger after the work ends', 'to give a prize to the best project']),
    w(['to describe two methods without an opinion', 'to copy a method from another student', 'to choose a method at random'])
  ],
  reflect: [
    w(['to repeat the same task until it is perfect', 'to complain about the task to the teacher', 'to forget a mistake as quickly as possible']),
    w(['to watch a recording of the match again for fun', 'to show a mistake to the rest of the team', 'to copy the best player on the team'])
  ],
  process: [
    w(['to hide something from other people', 'to repeat something to a friend', 'to write something down quickly']),
    w(['to produce information in a factory', 'to copy information onto paper', 'to store information in a file'])
  ],
  strategy: [
    w(['a rule that players must obey', 'a trophy given to the winning team', 'a mistake made by the defence']),
    w(['a long list of difficult words', 'a game that helps students to relax', 'a test taken at the end of the week'])
  ],
  approach: [
    w(['a distance covered in one step', 'a rule about how to write a plan', 'a final answer to a difficult problem']),
    w(['a place where two paths meet', 'a test given at the end of the year', 'an argument between two scientists'])
  ],
  revise: [
    w(['to take an examination for the first time', 'to change a text to remove mistakes', 'to give a lesson to other students']),
    w(['to learn road signs for the first time', 'to correct mistakes in a printed sign', 'to teach road signs to a friend'])
  ],
  forecast: [
    w(['to guess the result without any information', 'to warn people about something that has happened', 'to explain why a result happened']),
    w(['to describe how the sea has changed', 'to guess a number without any records', 'to measure the sea level on a beach'])
  ],
  interfere: [
    w(['to help something to work more smoothly', 'to prevent something from being stolen', 'to replace something that has broken']),
    w(['to give a clear and useful instruction', 'to cheer loudly for a team', 'to take part in a game as a player'])
  ],
  distract: [
    w(['to give information about what to do', 'to make someone feel sleepy in lessons', 'to hide the lesson from young pupils']),
    w(['to help someone to finish their work', 'to copy someone’s answers carelessly', 'to give someone extra time to work'])
  ],
  evidence: [
    w(['proof that nobody can question', 'opinions that people share', 'rules that guide a decision']),
    w(['personal feelings about a text', 'a summary of the whole text', 'questions about the meaning of a text'])
  ],
  guidance: [
    w(['orders that students must obey', 'rules about uniform and behaviour', 'results of an entrance test']),
    w(['punishment from a strict teacher', 'payment for a training course', 'praise for a good performance'])
  ],
  academic: [
    w(['connected with sport and exercise', 'connected with art and music', 'connected with money and trade']),
    w(['connected with building and repair work', 'connected with farming and food', 'connected with travel and tourism'])
  ],
  concentration: [
    w(['a strong wish to finish a task', 'the amount of a substance in water', 'a feeling of tiredness after exercise']),
    w(['a fear of making a mistake', 'pride in a good result', 'a desire to be the best'])
  ],
  complex: [
    w(['hard to do but simple in structure', 'new and not yet tested', 'old and no longer useful']),
    w(['simple to use after one lesson', 'too expensive for most people', 'hard to see because it is small'])
  ],
  motivation: [
    w(['the ability to give full attention', 'the plan for reaching a goal', 'the feeling of pride in work']),
    w(['the rule that people must follow at work', 'the time when people finish work', 'the money that people receive for work'])
  ],
  curiosity: [
    w(['a fear of making mistakes', 'a wish to win a prize', 'a feeling of boredom']),
    w(['a worry about breaking something', 'a plan to earn some money', 'a habit of arriving late'])
  ],
  technique: [
    w(['a general plan for a whole season', 'a rule that all athletes follow', 'a prize for the best athlete']),
    w(['a long plan for selling paintings', 'a place where artists meet', 'a rule about painting in public'])
  ],
  effective: [
    w(['working quickly without wasting time', 'costing very little money', 'popular with a large number of people']),
    w(['seen by a large number of people', 'paid for by a famous company', 'finished before the planned date'])
  ],
  inefficient: [
    w(['not producing the intended result', 'very expensive to repair', 'too difficult for most people']),
    w(['not safe for the people who use it', 'not popular with the shops that sell it', 'not available in very cold weather'])
  ]
});
