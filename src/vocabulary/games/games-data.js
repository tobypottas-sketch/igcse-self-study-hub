// Games data for Unit 1: (1) Word Blitz near-neighbour groups, (2) the curated Connections puzzles.
//
// Word Blitz: words in one group never appear as options in the same question, because a distractor could be argued as also correct.
export const BLITZ_CONFUSABLE = Object.freeze([
  ['intense', 'overwhelming', 'incredible', 'significant', 'historic', 'elite'],
  ['achievement', 'feat', 'challenge', 'struggle', 'solution'],
  ['tournament', 'championship', 'competitor', 'opponent'],
  ['determined', 'goal-oriented', 'discipline', 'patience', 'struggle'],
  ['pastime', 'leisure time', 'preference'],
  ['urge', 'recommend', 'demand', 'permit'],
  ['resent', 'regret', 'threaten', 'deny'],
  ['reasonable', 'minimum', 'estimated', 'monetary', 'afford', 'relatively', 'expansion'],
  ['selection', 'criteria'],
  ['produce', 'craftspeople', 'antiques'],
  ['avoid', 'deny', 'resent']
].map(group => Object.freeze(group)));

// Connections: every puzzle has exactly four clues on one curve.
//   1  broad but meaningful association (a student should be able to place the area)
//   2  clearly more concrete (a decent student now has a realistic chance)
//   3  strong synonym / context / usage clue (most students can solve here)
//   4  near-definition (almost a giveaway)
// `accept` lists extra spellings/forms that count as the target. `kind` labels each clue for the post-solve recap.
const clue = (text, kind) => ({ text, kind });
// Clue staircase (clue 2 is shown as the puzzle's local picture when `image` is set; its text is the fallback if the file cannot load): 1 broad association; 2 concrete situation; 3 plain-English meaning or strong synonym (no blank sentence); 4 near-definition.
// `help` = two curated Unit 1 distractors for the 3-choice "Need help?" step: same part of speech, clearly not defensible as the answer, never a near-synonym.
export const CONNECTIONS_PUZZLES = Object.freeze([
  { target: 'tournament', image: { src: 'assets/vocabulary/games/connections/unit-01/tournament.png', alt: 'eight team badges with matches leading round by round to one final' }, accept: ['tournaments'], help: ['discipline', 'selection'], why: 'The World Cup, a knockout event and a series of matches between several teams all describe a tournament.',
    clues: [clue('a big sports event for many teams', 'association'), clue('sixteen teams play knockout matches over a few days', 'association'), clue('a big sports event with lots of matches and one winner at the end', 'plain'), clue('a competition made up of a series of matches played by several teams', 'meaning')] },
  { target: 'opponent', image: { src: 'assets/vocabulary/games/connections/unit-01/opponent.png', alt: 'two people facing each other across a chessboard, concentrating hard' }, accept: ['opponents'], help: ['challenge', 'discipline'], why: 'In chess, tennis or any contest, the person on the other side is your opponent.',
    clues: [clue('the person you are trying to beat', 'association'), clue('the player on the other side of the net', 'association'), clue('the other side in a match or contest', 'plain'), clue('the person or team you compete against', 'meaning')] },
  { target: 'racquet', image: { src: 'assets/vocabulary/games/connections/unit-01/racquet.png', alt: 'sports equipment with strings beside a ball and shuttlecock' }, accept: ['racket', 'rackets', 'racquets'], help: ['antiques', 'solution'], why: 'Sports equipment with strings and a handle that you hit a ball or shuttlecock with is a racquet (also spelled racket).',
    clues: [clue('sports equipment with strings', 'association'), clue('tennis and badminton players hold one in their hand', 'association'), clue('the thing with strings that you swing to hit the ball', 'plain'), clue('equipment with a handle and a strung frame, used to hit a ball or shuttlecock', 'meaning')] },
  { target: 'pastime', image: { src: 'assets/vocabulary/games/connections/unit-01/pastime.png', alt: 'people enjoying hobbies such as painting, collecting stamps, building models, chess and gardening' }, accept: ['pastimes'], help: ['discipline', 'achievement'], why: 'Stamp collecting, chess club or painting at the weekend are things you do for enjoyment in your free time: pastimes, or hobbies.',
    clues: [clue('an activity you do for enjoyment', 'association'), clue('stamp collecting, chess club or painting at the weekend', 'association'), clue('a hobby', 'plain'), clue('an activity you do regularly for enjoyment in your free time', 'meaning')] },
  { target: 'reputation', image: { src: 'assets/vocabulary/games/connections/unit-01/reputation.png', alt: 'happy people giving five-star ratings to a restaurant' }, accept: [], help: ['achievement', 'generation'], why: 'Online reviews and a restaurant\'s good name both show the general opinion people have of someone or something: its reputation.',
    clues: [clue('what people think about someone or something', 'association'), clue('everyone says a restaurant is excellent, so people trust it', 'association'), clue('how well or badly people think of you', 'plain'), clue('the general opinion that people have about someone or something', 'meaning')] },
  { target: 'patience', image: { src: 'assets/vocabulary/games/connections/unit-01/patience.png', alt: 'a calm person standing in a line beside an hourglass' }, accept: [], help: ['challenge', 'solution'], why: 'Waiting in a queue without getting annoyed is patience; losing it is what happens when you run out.',
    clues: [clue('staying calm while you wait', 'association'), clue('waiting in a long queue', 'association'), clue('being able to stay calm even when things are slow or difficult', 'plain'), clue('the ability to wait calmly without becoming annoyed', 'meaning')] },
  { target: 'atmosphere', image: { src: 'assets/vocabulary/games/connections/unit-01/atmosphere.png', alt: 'a cheering crowd in a floodlit stadium' }, accept: ['atmospheres'], help: ['reputation', 'expansion'], why: 'A packed stadium full of noise and energy creates a mood you can feel: the atmosphere.',
    clues: [clue('the feeling or mood of a place', 'association'), clue('the noise and excitement when a crowd cheers together', 'association'), clue('the special feeling around you at a concert or a match', 'plain'), clue('the mood that you notice in a place or event, such as excited, tense or relaxed', 'meaning')] },
  { target: 'antiques', image: { src: 'assets/vocabulary/games/connections/unit-01/antiques.png', alt: 'old decorative furniture, clock and vase' }, accept: ['antique'], help: ['racquet', 'selection'], why: 'A flea market and a very old clock are full of objects that are valuable because of their age: antiques.',
    clues: [clue('very old things that people collect and sell', 'association'), clue('a very old clock or cabinet that people pay a lot of money for', 'association'), clue('old furniture, clocks or vases that are worth a lot', 'plain'), clue('old objects that are valuable because of their age', 'meaning')] },
  { target: 'craftspeople', image: { src: 'assets/vocabulary/games/connections/unit-01/craftspeople.png', alt: 'people shaping a clay pot, carving wood and making jewellery by hand' }, accept: ['craftsperson', 'craftsman', 'craftsmen', 'craftswoman', 'craftswomen'], help: ['opponent', 'generation'], why: 'A pottery workshop and people who weave, carve or make jewellery are the world of craftspeople: people skilled at making things by hand.',
    clues: [clue('people who make things by hand', 'association'), clue('people who weave baskets, carve wood or make jewellery', 'association'), clue('potters, weavers and carvers', 'plain'), clue('people who are skilled at making things by hand', 'meaning')] },
  { target: 'elite', image: { src: 'assets/vocabulary/games/connections/unit-01/elite.png', alt: 'a small group of top athletes standing in front of a much larger crowd of athletes' }, accept: [], help: ['unfamiliar', 'reasonable'], why: 'Top athletes, the best of the best and the national team all describe the highest level of ability: elite.',
    clues: [clue('the very best people in a sport', 'association'), clue('the best of the best, like a national team', 'association'), clue('a small group at the very top level', 'plain'), clue('belonging to the highest level of ability or performance', 'meaning')] },
  { target: 'monetary', image: { src: 'assets/vocabulary/games/connections/unit-01/monetary.png', alt: 'banknotes, coins and a piggy bank beside a rising bar chart' }, accept: [], help: ['historic', 'unfamiliar'], why: 'Banks, coins and a cash prize are all connected with money: monetary.',
    clues: [clue('something to do with money', 'association'), clue('prize money, savings and payments', 'association'), clue('describes things connected with cash, banks and payments', 'plain'), clue('relating to money or its value', 'meaning')] },
  { target: 'criteria', image: { src: 'assets/vocabulary/games/connections/unit-01/criteria.png', alt: 'judge assessing a gymnast using several standards' }, accept: ['criterion'], help: ['solution', 'achievement'], why: 'A judge\'s scorecard and the list of things judges look for are the standards used to decide a winner: criteria.',
    clues: [clue('the rules judges use to give marks', 'association'), clue('the list of things judges check before choosing a winner', 'association'), clue('the rules or standards that decide what is good enough', 'plain'), clue('the standards or tests used to judge or choose something', 'meaning')] }
]);
