// Unit 1 · Meaning · Apply (meaning_in_context) and Mastery (gloss_in_context_type) — authored wrong meanings and context repairs (Job 9).
//
// CANONICAL SOURCE. build-unit.js copies this into each sense's masteryContexts, so the release data, the browser builders and the Edge
// Function all read the same authored values. Nothing here is generated; nothing is derived from another word's data.
//
// Each term has TWO records, in the same order as the word's two Mastery contexts (index 0 = the "meaning" context, index 1 = the
// "paraphrase" context; their stored context ids are unchanged).
//   wrongMeanings : exactly three authored WRONG glosses for THIS sentence. They are written beside the correct gloss so that they match
//                   its grammar (same word class and shape), are comparable in length and register, are plausible readings of the word
//                   in general, and are wrong in this sentence. They are the only wrong options Meaning Apply shows for this context.
//   text / meaning (optional) : replaces the sentence and/or the correct gloss when the original could not support the contract
//                   (see `reason`). A replaced gloss never contains the target or a derivative of it, because it is also the cue
//                   for Meaning Mastery.
//   reason        : why the record changed (review aid only).
// Review checklist for every wrong gloss: (1) same grammar as the correct gloss, (2) not absurd, (3) not also a fair reading of the
// sentence, (4) no clue in length, punctuation or capitalisation.
const w = (wrongMeanings, extra = {}) => ({ wrongMeanings, ...extra });

export default Object.freeze({
  'leisure time': [
    w(['time set aside for school lessons', 'hours spent travelling between places', 'a short pause between two tasks']),
    w(['extra time added to the working week', 'the period needed to finish a job', 'rest taken after an illness'])
  ],
  preference: [
    w(['a rule about which food to buy', 'a belief that tinned food is unsafe', 'a habit of eating the same meals'],
      { meaning: 'a liking for one option over another', reason: 'Gloss reworded as a noun phrase so it reads as the meaning of a noun.' }),
    w(['a complaint about the seat that was booked', 'a rule about where passengers must sit', 'a request for more space on the flight'],
      { meaning: 'a stronger wish for one choice than the rest', reason: 'Original gloss ("a stronger choice between alternatives") described a choice, not a liking.' })
  ],
  avoid: [
    w(['make sure something happens on time', 'stop other people from doing something', 'try something new for the first time']),
    w(['quickly drive along a particular route', 'officially close a road to the public', 'find the quickest way to a place'])
  ],
  afford: [
    w(['be willing to share a cost', 'agree to reduce the price of something', 'decide that a cost is unfair']),
    w(['be unwilling to spend money on something', 'feel sorry about the price of something', 'manage to borrow a large amount'])
  ],
  deny: [
    w(['agree to accept the cost of a problem', 'refuse to answer a direct question', 'promise to explain what went wrong']),
    w(['admit that a mistake was made', 'argue that a rule is unfair', 'caution others about a possible foul'])
  ],
  permit: [
    w(['force someone to follow a plan', 'help someone to understand a topic', 'expect something to be finished quickly'],
      { meaning: 'let something go ahead without stopping it', reason: 'Gloss lengthened to a phrase so the options are comparable in length.' }),
    w(['officially ask someone to leave a place', 'strongly advise against doing something', 'pay for work to be done'],
      { meaning: 'give official approval for something', reason: 'Gloss reworded to avoid repeating "allow" from the first record.' })
  ],
  arrange: [
    w(['reschedule an important meeting again', 'check that people are available', 'remind people about a deadline']),
    w(['pay the cost of a journey', 'give directions to a place', 'suggest a route for the trip'])
  ],
  urge: [
    w(['warn someone about a danger', 'politely ask someone to wait', 'enquire about how someone is feeling'],
      { meaning: 'press someone hard to do something', reason: 'Original gloss repeated "strongly" from the sentence.' }),
    w(['quietly tell someone what to avoid', 'show someone how a dish is made', 'allow someone to make a choice'])
  ],
  recommend: [
    w(['offer something as a reward to a friend', 'give someone a reason to be pleased', 'warn someone about a poor choice']),
    w(['advise avoiding a particular place', 'describe the cost of a visit', 'invite someone to a special event'])
  ],
  demand: [
    w(['offer a great deal of enjoyment', 'provide detailed advice to nervous beginners', 'allow plenty of time for rest']),
    w(['make a difficult task seem simpler', 'offer someone a reward for working hard', 'request that a task is delayed'])
  ],
  threaten: [
    w(['make a plan to protect something valuable', 'help something to improve slowly', 'remove something from a list early'],
      { meaning: 'put something precious in real danger', reason: 'Original gloss repeated "serious" from the sentence.' }),
    w(['make a decision more difficult to explain', 'bring new members to a group', 'lead to a change in plans'])
  ],
  resent: [
    w(['feel proud of a team achievement', 'feel nervous before an important event', 'feel sorry for someone who is hurt']),
    w(['agree happily to accept a request', 'feel exhausted after an extremely busy day', 'feel surprised by a sudden change'])
  ],
  regret: [
    w(['feel proud of a decision made recently', 'feel unsure about a choice to be made', 'feel angry at someone else’s mistake']),
    w(['feel excited about an opportunity next year', 'explain why an invitation was refused', 'feel grateful to a person who helped'],
      { text: 'Looking back, she began to regret turning down the invitation to join the squad.', meaning: 'wish an earlier choice had been different',
        reason: 'Original sentence used the formal "We regret to tell you…" (an apology), which is a different use from the gloss.' })
  ],
  unfamiliar: [
    w(['not allowed by the official tournament organisers', 'too complicated to explain to anyone', 'already known from earlier lessons']),
    w(['old-fashioned and rarely seen today', 'unpleasant and difficult to accept', 'special to one particular family'])
  ],
  racquet: [
    w(['padded protective clothing for sport', 'hard-wearing footwear for running quickly', 'light netting that stops a ball']),
    w(['a solid wooden bat with a very long handle', 'a heavy stick for striking a puck', 'a net used to catch a shuttlecock'],
      { meaning: 'a light frame with strings and a handle', reason: 'Original gloss ("handled sports frame with strings") was an awkward noun string.' })
  ],
  opponent: [
    w(['person who judges a match fairly', 'member of the same team as you', 'person who trains players for matches']),
    w(['the group who watch a contest', 'the people who organise a contest', 'the last team to enter a contest'],
      { meaning: 'the side you are trying to beat', reason: 'Original gloss repeated "other" and "contest" wording from the sentence.' })
  ],
  intense: [
    w(['mild and easy to manage', 'calm and slow to develop', 'limited to a short period each day']),
    w(['gentle and pleasant to feel', 'difficult to see clearly', 'changing quickly from hour to hour'],
      { meaning: 'very strong and hard to bear', reason: 'Original gloss ("requiring very great energy or focus") did not fit the sentence about the sun.' })
  ],
  tournament: [
    w(['single match between two famous teams', 'training programme for young players', 'ceremony for presenting prizes to the winners']),
    w(['final game played at season’s end', 'meeting held to choose the best young players', 'series of lessons given by a coach'])
  ],
  determined: [
    w(['secretly worried about failing to win', 'fully satisfied with an earlier result', 'unsure about joining a national team']),
    w(['certain that the match would end soon', 'unable to continue because of tiredness', 'prepared to accept a heavy defeat'])
  ],
  discipline: [
    w(['natural talent seen from a very early age', 'strong dislike of early morning exercise', 'pleasure gained from winning difficult races'],
      { meaning: 'self-control that supports steady daily effort', reason: 'Gloss lengthened to match the option lengths.' }),
    w(['punishment given for breaking a school rule', 'knowledge gained after many years abroad', 'energy needed for a very long race'])
  ],
  'goal-oriented': [
    w(['mainly interested in pleasing other people', 'careful to obey every rule', 'keen to share work equally with others']),
    w(['influenced by the opinions of friends', 'limited to a few exercises', 'decided by chance rather than planning'])
  ],
  achievement: [
    w(['serious problem caused by lack of training', 'public award given for taking part', 'short rest taken during a long race']),
    w(['difficult decision that has been delayed', 'lucky chance that happened purely by accident', 'unpleasant task that nobody will finish'])
  ],
  elite: [
    w(['open to every player who applies', 'chosen mainly by the age of players', 'organised by the local school club'],
      { meaning: 'among the very best in their field', reason: 'Original gloss was too short to sit beside the other options.' }),
    w(['suitable for players of any ability', 'designed to teach basic skills slowly', 'held only once every four years'])
  ],
  overwhelming: [
    w(['too quiet to notice during the game', 'kind and encouraging for the whole team', 'organised carefully by the club officials']),
    w(['small but still clearly noticeable', 'unclear until all votes are counted', 'changing as new results are announced'],
      { meaning: 'very large and clearly decisive', reason: 'Original gloss ("greater than can be comfortably handled") did not fit "an overwhelming majority".' })
  ],
  generation: [
    w(['members of one large family living together', 'workers who share the same employer', 'students studying in the same class'],
      { meaning: 'all who were born close together in time', reason: 'Original gloss repeated "people" and "same" from the sentence.' }),
    w(['team chosen to represent a country', 'group of experts who train players', 'series of games played in one season'])
  ],
  challenge: [
    w(['reward given for finishing a task', 'regulation explaining how a game is played', 'warning about a possible injury']),
    w(['friendly match played for enjoyment', 'chance to watch a famous team', 'lesson about how to control the ball'])
  ],
  solution: [
    w(['reason why a difficulty keeps growing', 'complaint made about a lack of space', 'warning that a problem may return']),
    w(['official rule that causes a problem', 'careful description of why something happened', 'angry reply to a repeated complaint'])
  ],
  pastime: [
    w(['paid job done after normal hours', 'school subject taught by a specialist', 'journey made for a special reason']),
    w(['serious career chosen after training', 'regular duty carried out at home', 'skill required for a certain job'])
  ],
  feat: [
    w(['lucky result that nobody expected', 'serious mistake that took time to fix', 'long journey that tested everyone’s patience']),
    w(['reckless decision that endangered other runners', 'slow recovery after an injury', 'simple task that anyone could complete'])
  ],
  regardless: [
    w(['only after the weather has improved', 'depending on how bad the weather becomes', 'because the weather has been so bad']),
    w(['depending on each person’s circumstances', 'unless a teacher gives special approval', 'provided that everyone has equal ability'])
  ],
  monetary: [
    w(['linked to the history of an object', 'related to how rare something is', 'connected with the size of a prize']),
    w(['involving public praise or thanks', 'relating to physical effort or strength', 'concerning the time given freely'],
      { meaning: 'involving money or other financial value', reason: 'Original gloss was too short to sit beside the other options.' })
  ],
  estimated: [
    w(['counted exactly at the stadium gates', 'announced in advance by the organisers', 'taken from the final match report']),
    w(['agreed in a signed contract', 'paid in full by the club', 'reduced after long talks with the builders'])
  ],
  struggle: [
    w(['enjoy trying something new for fun', 'refuse to follow the instructor’s advice', 'wait patiently for others to finish']),
    w(['lose interest in a game very quickly', 'refuse to share the ball with others', 'quarrel about the rules with a friendly teammate'])
  ],
  minimum: [
    w(['highest amount that is permitted', 'average amount for most players', 'usual amount offered to beginners']),
    w(['greatest age allowed for entry', 'most common age among competitors', 'age when players usually retire from sport'])
  ],
  championship: [
    w(['small match played to practise skills', 'series of lessons for gifted young players', 'trophy given for good behaviour']),
    w(['course designed to improve fitness', 'friendly game between two old school rivals', 'season ticket for loyal supporters'])
  ],
  competitor: [
    w(['person watching a match closely', 'person employed to help a team', 'person who rules on a decision']),
    w(['person who sells tickets for the race', 'person who times each runner', 'person who announces the race results'],
      { text: 'As the youngest competitor in the race, she was expected to finish last, but she came fourth.', meaning: 'person entered in a race to win',
        reason: 'Original gloss ("participant trying to win a competition") contained a derivative of the target, so Meaning Mastery refused it.' })
  ],
  relatively: [
    w(['to a very high degree', 'in a way that avoids all comparison', 'without any change over time']),
    w(['more than anyone could expect', 'to the highest possible degree every time', 'only for a short time'],
      { meaning: 'to a fair degree, judged against another', reason: 'Original gloss repeated "compared" from the sentence.' })
  ],
  patience: [
    w(['strong wish to succeed very quickly', 'natural talent for learning skills', 'careful choice of the right equipment']),
    w(['great physical strength and fitness', 'detailed knowledge of the rules', 'a loud voice and strong opinions'])
  ],
  atmosphere: [
    w(['noise level measured near the pitch', 'number of fans who watch a match', 'weather conditions at the start of play']),
    w(['warm air produced inside a large building', 'shape of the stadium seating area', 'space available for fans in the stadium'])
  ],
  incredible: [
    w(['quite slow but still acceptable', 'very hard to measure by hand', 'just good enough to be noticed'],
      { meaning: 'very impressive and quite surprising', reason: 'Gloss lengthened to match the option lengths.' }),
    w(['very careless and likely to cost goals', 'fairly ordinary for an experienced professional', 'too late to change the final result'])
  ],
  criteria: [
    w(['scores collected after a final match', 'rules explaining how to play a sport', 'names of players chosen for a squad'],
      { meaning: 'measures by which choices are judged', reason: 'Original gloss repeated "used" from the sentence.' }),
    w(['prizes offered to the competition winners', 'questions asked after each performance', 'opinions shared by members of the audience'])
  ],
  historic: [
    w(['old enough to be placed in a museum', 'celebrated only by supporters of one team', 'arranged long before the final took place'],
      { meaning: 'important enough to be remembered for years', reason: 'Original gloss ("important enough to matter in history") contained the stem of the target, so Meaning Mastery refused it.' }),
    w(['sad enough to be remembered by everyone', 'busy enough to fill the whole calendar', 'early enough to be listed in the printed programme'],
      { text: 'The opening of the first women’s league was a historic day for the sport.', meaning: 'important enough to change what happens later',
        reason: 'Original gloss ("likely to be remembered historically") contained a derivative of the target; the sentence is replaced with one that gives a second, different context.' })
  ],
  selection: [
    w(['place where goods are stored', 'list of prices for each item', 'person who helps customers to buy']),
    w(['timetable showing when classes begin', 'fee paid to join a club', 'group of staff who run the centre'])
  ],
  produce: [
    w(['repair something that has been broken', 'sell something to a customer', 'take something away from a place']),
    w(['store something safely for later use', 'deliver something to a new address', 'check something before delivery'])
  ],
  craftspeople: [
    w(['workers who sell goods in markets', 'people who design large buildings and public parks', 'managers who plan large sports events'],
      { meaning: 'skilled workers who create objects by hand', reason: 'Original gloss repeated "make" from the sentence.' }),
    w(['traders who buy goods from other countries', 'performers who entertain crowds at festivals', 'guides who show tourists around the whole village'],
      { text: 'Visitors watched craftspeople shape clay bowls on spinning wheels at the village market.', meaning: 'people trained to make objects with their hands',
        reason: 'Original second sentence did not contain the target word ("Skilled makers…"), so Meaning Mastery could not blank it.' })
  ],
  significant: [
    w(['unusual enough to need an explanation', 'recent enough to be included in reports', 'obvious enough to be seen from far away']),
    w(['pleasant enough to be enjoyed by everyone', 'simple enough to be understood quickly', 'rare enough to be hard to explain'],
      { text: 'Regular exercise can have a significant effect on mental wellbeing.', reason: 'Original sentence read "an significant effect" (an article error left by a word substitution).' })
  ],
  expansion: [
    w(['process of moving to a new location', 'decision to close an old facility', 'plan to reduce the cost of membership']),
    w(['change in the rules of the league', 'loss of money during the season', 'delay in the start of the matches'])
  ],
  reputation: [
    w(['private feeling someone keeps secret', 'official list of the academy’s rules', 'written record of every student’s grades']),
    w(['advertisement paid for by the club', 'financial balance kept by the club', 'group of volunteers working for the club'])
  ],
  reasonable: [
    w(['unusually high for a single day', 'completely free for every visitor', 'fixed by law for all clubs']),
    w(['too low for the club to survive', 'higher than at any other club', 'paid early by nearly all the students'])
  ],
  antiques: [
    w(['modern goods sold at low prices', 'copies of famous sports trophies', 'damaged items waiting to be thrown away']),
    w(['expensive tools used by professionals', 'rare plants grown for display', 'recent products made by talented local artists'])
  ]
});
