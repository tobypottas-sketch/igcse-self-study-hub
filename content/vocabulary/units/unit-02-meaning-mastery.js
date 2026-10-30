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
  ],
  apparently: [
    w(['according to the official announcement made today', 'because the other members asked him to go', 'as the band proudly announced last week']),
    w(['as the owner had promised earlier', 'as an expert had measured it exactly', 'as had been proved by the records'],
      { meaning: 'as it seemed at first sight', reason: 'The draft gloss was an adjective phrase for an adverb in the sentence; reworded to match the adverb use.' })
  ],
  supposedly: [
    w(['proved to be true by the evidence', 'agreed to be true by all the critics', 'confirmed as true by the director']),
    w(['according to what I have seen myself', 'according to the official restaurant guide', 'according to a test I carried out'])
  ],
  celebrity: [
    w(['a person who owns the hotel', 'a person who works at the hotel', 'a person who is staying alone']),
    w(['someone skilled at designing posters', 'someone employed by the local council', 'someone who has just left school'],
      { text: 'The charity asked a celebrity to support its campaign.', meaning: 'someone well known from entertainment or sport',
        reason: 'The draft sentence used the plural and began with the target, so the blank would not accept the headword or hide the capital letter; the sentence was reworded.' })
  ],
  informed: [
    w(['made quickly without any discussion', 'made by a group of friends', 'made to please her teachers']),
    w(['asked for permission about everything', 'warned about what to avoid', 'corrected about what is wrong'])
  ],
  admit: [
    w(['explain why something was done', 'promise that it will not happen again', 'believe that something is not important']),
    w(['refuse to speak about a problem', 'promise to solve a problem quickly', 'blame other people for a problem'],
      { text: 'Politicians rarely admit responsibility when something goes wrong.', meaning: 'accept that you are to blame',
        reason: 'The draft sentence used the past form "admitted", which is not an accepted answer for the headword blank; reworded to the base form.' })
  ],
  communicate: [
    w(['keep information or ideas secret from others', 'change information or ideas to suit others', 'copy information or ideas from others']),
    w(['copy their trainers using signals', 'learn new tricks using signals', 'follow orders using signals'])
  ],
  remotely: [
    w(['quickly using the right tools', 'carefully using a written plan', 'slowly using spare parts']),
    w(['without paying any fee at all', 'without taking notes of the lecture', 'without needing a teacher to speak'])
  ],
  transform: [
    w(['clean slightly and leave unchanged', 'protect from future damage', 'sell for more money']),
    w(['copy exactly in a new place', 'slow down in a major way', 'explain in a simple way'],
      { text: 'Technology can transform the way people learn.', meaning: 'change in a big and important way',
        reason: 'The draft sentence used "have transformed", a form that is not an accepted answer for the headword blank; reworded to the base form.' })
  ],
  percentage: [
    w(['what total number of pupils there are', 'what average age the pupils have', 'what speed they walk at']),
    w(['the length of time the profit is kept', 'the name of the charity that is chosen', 'the reason the profit was made'])
  ],
  impression: [
    w(['a strong argument for changing the law', 'a strong reaction against a bad idea', 'a strong promise to improve the town'],
      { meaning: 'a strong effect on what people think of someone', reason: 'The draft gloss was a clause ("caused people to think well of him"); reworded as a noun phrase so it reads as the meaning of a noun.' }),
    w(['a proof that something is true', 'a rule that everyone must follow', 'a memory of an earlier lesson'])
  ],
  'remote control': [
    w(['a switch fixed to the side of a machine', 'a cable that connects a machine to a socket', 'a screen that shows what a machine is doing']),
    w(['a camera that records what a drone sees', 'a battery that powers the drone in flight', 'a case that protects the drone when stored'])
  ],
  feature: [
    w(['a fault that makes a product unsafe', 'a price that makes a product attractive', 'a review that helps people choose a product']),
    w(['a rule that visitors must follow', 'a map that shows the way around', 'a danger that visitors must avoid'])
  ],
  function: [
    w(['what it looks like', 'how much it costs', 'where it was made']),
    w(['the name or title of a group', 'the size and age of a group', 'the history and origin of a group'])
  ],
  interactive: [
    w(['designed to be used by teachers only', 'able to show pictures in colour', 'fixed to the wall of a room']),
    w(['taking place outside the school', 'led entirely by one speaker', 'recorded for later viewing'],
      { text: 'Students stay more engaged when a lesson is interactive instead of a long lecture.', meaning: 'involving active participation',
        reason: 'The draft sentence began with the target, so the blank would have hidden the capital letter; the sentence was reworded.' })
  ],
  widespread: [
    w(['limited to one small area', 'caused by a sudden accident', 'expected by local people']),
    w(['kept secret by a few people', 'opposed by many people', 'explained by one person'])
  ],
  availability: [
    w(['how much something costs', 'what something looks like', 'who is selling something']),
    w(['how safe something is to use', 'how long something lasts for', 'how popular something is with people'])
  ],
  'high-performance': [
    w(['designed to be small and light', 'made to be cheap and simple', 'built to last for many years']),
    w(['cheap and easy to repair', 'quiet and kind to the environment', 'old but still in good condition'],
      { text: 'Racing teams spend huge sums on high-performance engines.', meaning: 'powerful and able to work at top speed',
        reason: 'The draft sentence began with the target, so the blank would have hidden the capital letter; the sentence was reworded.' })
  ],
  stabilising: [
    w(['making a situation busier and louder', 'causing students to compete harder', 'making lessons shorter and easier']),
    w(['making something faster and lighter', 'making something hotter and louder', 'making something larger and stronger'])
  ],
  'multi-task': [
    w(['finish one thing before starting another', 'repeat the same thing many times', 'share one thing between several people']),
    w(['work very slowly on one job', 'ask for help with every job', 'change jobs very often'])
  ],
  predictable: [
    w(['very different from what people wanted', 'too sudden for people to notice', 'kinder than people deserved']),
    w(['difficult to live in for long', 'harmful to people and animals', 'different every single day'])
  ],
  professional: [
    w(['showing great fear and a lack of practice', 'showing an unusual wish to be paid', 'showing the kindness and humour expected']),
    w(['from a company’s advertisements', 'from an anonymous stranger', 'from a recent newspaper'])
  ],
  regional: [
    w(['belonging to a country’s capital city', 'belonging to people of one age group', 'belonging to a different country'],
      { text: 'Many British accents are regional, so people can often guess where a speaker grew up.', meaning: 'belonging to a particular part of a country',
        reason: 'The draft sentence began with the target, so the blank would have hidden the capital letter; the sentence was reworded.' }),
    w(['responsible for one shop', 'responsible for one department', 'responsible for one project'])
  ],
  commentary: [
    w(['a written report of an event after it ends', 'a list of results printed after an event', 'a photograph of an event shown on screen']),
    w(['a recorded written summary of a season', 'a printed table of scores in a match', 'a loud song sung by fans at a match'])
  ],
  educational: [
    w(['showing very old photographs', 'making people laugh loudly', 'costing a great deal to make']),
    w(['designed to keep people busy', 'designed to make people spend money', 'designed to help people sleep'],
      { text: 'Good apps for young children are educational, helping them learn letters and numbers.', meaning: 'designed to help people learn',
        reason: 'The draft sentence began with the target, so the blank would have hidden the capital letter; the sentence was reworded.' })
  ],
  culture: [
    w(['buildings, roads and bridges', 'laws, taxes and punishments', 'jobs, wages and prices']),
    w(['the history and age of a town', 'the size and wealth of a city', 'the climate and land of a region'])
  ],
  genuine: [
    w(['sudden, not planned', 'mild, not strong', 'private, not shared']),
    w(['bright, not dull', 'old, not new', 'heavy, not light'])
  ],
  amusing: [
    w(['strange and worrying', 'long and tiring', 'sad and moving']),
    w(['making you feel a little sleepy', 'making you feel a little sad', 'making you feel a little afraid'])
  ],
  competitive: [
    w(['willing to teach others', 'eager to travel abroad', 'careful to avoid mistakes']),
    w(['involving strong cooperation', 'involving high prices', 'involving long training'],
      { text: 'It is a competitive industry, with many companies fighting for customers.', meaning: 'involving strong rivalry',
        reason: 'The draft gloss contained a derivative of the target, which would have exposed the answer in Meaning Mastery; the gloss was reworded.' })
  ],
  critical: [
    w(['showing great respect for', 'paying close attention to', 'giving full support to']),
    w(['quick to forgive mistakes', 'quick to ask for help', 'quick to praise others'])
  ],
  impressive: [
    w(['causing confusion', 'causing delay', 'causing worry']),
    w(['showing great nervousness', 'showing great luck', 'showing great length'])
  ],
  determination: [
    w(['a quick wish to finish early', 'a nervous fear of failing', 'a polite request for more time']),
    w(['a quiet hope of being chosen', 'a sudden stroke of luck in a match', 'a careful plan for winning a prize'])
  ],
  overcome: [
    w(['avoid facing a danger', 'cause a serious problem', 'wait for a problem to end']),
    w(['stay behind because of a problem', 'explain a problem to others', 'create a problem that stops progress'])
  ],
  accessory: [
    w(['a main part that holds something up', 'a spare part kept in case of damage', 'a cheap copy of the real thing']),
    w(['a piece of clothing worn underneath', 'a cheap material used for coats', 'a shop where clothes are sold'])
  ],
  equipment: [
    w(['workers who are trained for a job', 'money that is paid for a job', 'rules that are made for a job']),
    w(['rooms and spaces for an activity', 'people and teams for an activity', 'prices and fees for an activity'])
  ],
  fixture: [
    w(['something carried between rooms in a building', 'something borrowed for a short time in a building', 'something stored in a cupboard in a building'],
      { meaning: 'something fitted permanently in a building', reason: 'The draft gloss contained a derivative of the target and the second sentence used a plural; both were reworded to a base-form sentence with a gloss that does not expose the word.' }),
    w(['a decoration that is placed in a building', 'a person who works in a building', 'a machine that is moved around a building'],
      { text: 'The previous owners took their furniture but left every light and tap, because each one is a fixture.', meaning: 'a fitting that stays in a building', reason: 'The draft gloss contained a derivative of the target and the second sentence used a plural; both were reworded to a base-form sentence with a gloss that does not expose the word.' })
  ],
  removable: [
    w(['able to be repaired quickly', 'able to be seen from outside', 'able to be bought separately']),
    w(['able to be charged very fast', 'able to be used underwater', 'able to be copied by others'])
  ],
  adjustable: [
    w(['able to be washed in water', 'able to be folded flat', 'able to be seen from far away']),
    w(['able to be bought or sold', 'able to be lifted or carried', 'able to be wrapped or covered'])
  ],
  affordable: [
    w(['built only for wealthy people', 'owned only by the government', 'designed only for young people'],
      { text: 'In many big cities, affordable housing is hard to find.', meaning: 'not too expensive for ordinary people', reason: 'The draft sentence began with the target, so the blank would have hidden the capital letter; the sentence was reworded.' }),
    w(['high enough in quality to use', 'light enough in weight to carry', 'small enough in size to hold'])
  ],
  external: [
    w(['from inside the organisation', 'from a rival organisation', 'from a former member']),
    w(['built into and inside the main device', 'faster than the main device', 'older than the main device'])
  ],
  concentrate: [
    w(['stop thinking about anything', 'do several things at once', 'think about the past']),
    w(['write a plan for', 'ask for help with', 'hurry to finish'],
      { text: 'You will make fewer mistakes if you concentrate on the task in front of you.', meaning: 'give your full attention to', reason: 'The draft sentence began with the target, so the blank would have hidden the capital letter; the sentence was reworded.' })
  ]
});
