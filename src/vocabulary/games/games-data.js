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
export const CONNECTIONS_PUZZLES = Object.freeze([
  { target: 'tournament', accept: ['tournaments'], why: 'The World Cup, quarter-finals and semi-finals are all stages of a competition made up of a series of matches between several teams: a tournament.',
    clues: [clue('the World Cup', 'association'), clue('quarter-finals and semi-finals', 'association'), clue('Sixteen teams entered the knockout ___, and it lasted three days.', 'context'), clue('a competition made up of a series of matches played by several teams', 'meaning')] },
  { target: 'opponent', accept: ['opponents'], why: 'Chess, the player across the net and a rival are all the person or team you are playing against: your opponent.',
    clues: [clue('a chess game', 'association'), clue('the player on the other side of the net', 'association'), clue('She shook hands with her ___ after the final.', 'context'), clue('the person or team you are competing against', 'meaning')] },
  { target: 'racquet', accept: ['racket', 'rackets', 'racquets'], why: 'Sports equipment with strings and a handle that you hit a ball or shuttlecock with is a racquet (also spelled racket).',
    clues: [clue('sports equipment', 'association'), clue('strings and a handle', 'association'), clue('Remember to bring your tennis ___ to training.', 'context'), clue('you use it to hit a ball or a shuttlecock', 'meaning')] },
  { target: 'pastime', accept: ['pastimes'], why: 'Chess club and stamp collecting are things you do regularly for enjoyment in your free time: pastimes, or hobbies.',
    clues: [clue('something you do for fun', 'association'), clue('stamp collecting or chess club', 'association'), clue('hobby', 'synonym'), clue('an activity you do regularly for enjoyment in your free time', 'meaning')] },
  { target: 'reputation', accept: [], why: 'Online reviews and a restaurant\'s good name both show the general opinion people have of someone or something: its reputation.',
    clues: [clue('online reviews', 'association'), clue('a restaurant with a good name', 'association'), clue('She worked for years to build a good ___ as a coach.', 'context'), clue('the general opinion people have about someone or something', 'meaning')] },
  { target: 'patience', accept: [], why: 'Waiting in a queue and staying calm when things are slow are what patience means; losing it is what happens when you run out.',
    clues: [clue('waiting in a queue', 'association'), clue('staying calm when things are slow', 'association'), clue('She lost her ___ after an hour in the queue.', 'context'), clue('the ability to stay calm while waiting or dealing with difficulty', 'meaning')] },
  { target: 'atmosphere', accept: ['atmospheres'], why: 'A packed stadium full of noise and energy creates a mood you can feel: the atmosphere.',
    clues: [clue('a packed stadium', 'association'), clue('the noise and energy of a crowd', 'association'), clue('The ___ in the hall was tense before the final point.', 'context'), clue('the feeling or mood created in a place', 'meaning')] },
  { target: 'antiques', accept: ['antique'], why: 'A flea market and a very old clock are full of objects that are valuable because of their age: antiques.',
    clues: [clue('a flea market', 'association'), clue('a very old clock or cabinet', 'association'), clue('She sold the ___ from her grandmother\'s house for a lot of money.', 'context'), clue('old objects that are valuable because of their age', 'meaning')] },
  { target: 'craftspeople', accept: ['craftsperson', 'craftsman', 'craftsmen', 'craftswoman', 'craftswomen'], why: 'A pottery workshop and people who weave, carve or make jewellery are the world of craftspeople: people skilled at making things by hand.',
    clues: [clue('a pottery workshop', 'association'), clue('people who weave, carve or make jewellery', 'association'), clue('Local ___ sell their handmade bowls at the market.', 'context'), clue('people who are skilled at making things by hand', 'meaning')] },
  { target: 'elite', accept: [], why: 'Top athletes, the best of the best and the national team all describe the highest level of ability: elite.',
    clues: [clue('top athletes', 'association'), clue('the best of the best', 'association'), clue('She joined the national team as an ___ runner.', 'context'), clue('belonging to the highest level of ability or performance', 'meaning')] },
  { target: 'monetary', accept: [], why: 'Banks, coins and a cash prize are all connected with money: monetary.',
    clues: [clue('banks and coins', 'association'), clue('prize money', 'association'), clue('The winners received a ___ prize of five hundred pounds.', 'context'), clue('related to money or its value', 'meaning')] },
  { target: 'criteria', accept: ['criterion'], why: 'A judge\'s scorecard and the list of things judges look for are the standards used to decide a winner: criteria.',
    clues: [clue('a judge\'s scorecard', 'association'), clue('the list of things judges look for', 'association'), clue('The judges used clear ___ to choose the winner.', 'context'), clue('standards used to judge, choose or decide something', 'meaning')] }
]);
