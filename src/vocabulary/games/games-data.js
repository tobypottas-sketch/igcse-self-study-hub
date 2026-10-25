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
const PICTURE_PUZZLES = [
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
];
// Text-only puzzles (no picture needed). Same four-step staircase as above: 1 broad association, 2 concrete situation, 3 plain-English clue, 4 near-definition.
const text = (target, accept, help, why, [a, b, c, d]) => ({ target, accept, help, why, clues: [clue(a, 'association'), clue(b, 'association'), clue(c, 'plain'), clue(d, 'meaning')] });
const TEXT_PUZZLES = [
  text('leisure time', ['leisure', 'leisure times', 'free time', 'spare time'], ['generation', 'criteria'], 'The hours after lessons, homework or work, when you choose what to do, are your leisure time (or free time).',
    ['the part of the day that belongs to you', 'the bell rings, the homework is finished and you can play football or watch a film', 'hours when you have nothing you must do', 'time when you are not working or studying and can relax or enjoy activities']),
  text('preference', ['preferences'], ['solution', 'generation'], 'If you would pick pizza before salad, that choice is your preference.',
    ['choosing one thing over another', 'given the choice, most of the class would pick pizza rather than salad', 'what you like better than the other options', 'a greater liking for one option than another']),
  text('avoid', ['avoids', 'avoided', 'avoiding'], ['arrange', 'afford'], 'Taking the back streets to miss the traffic, or skipping a big meal before a swim, is avoiding something.',
    ['the opposite of going towards something', 'she takes the back streets so she is not stuck in rush-hour traffic', 'to keep away from something', 'to stay away from something or stop it from happening']),
  text('afford', ['affords', 'afforded', 'affording'], ['permit', 'regret'], 'When the price is more than your pocket money, you cannot afford it.',
    ['checking your savings before you buy something', 'the trainers are brilliant, but they cost more than your pocket money', 'to have enough money to pay for something', 'to have enough money, time or resources for something']),
  text('deny', ['denies', 'denied', 'denying'], ['arrange', 'recommend'], 'Saying "it wasn\'t me" next to a broken window is denying it.',
    ['the answer you give when someone accuses you', '"It wasn\'t me!" says the boy, standing next to the broken window', 'to say "no, that is not true"', 'to say that something is not true, such as a claim or an accusation']),
  text('permit', ['permits', 'permitted', 'permitting'], ['threaten', 'resent'], 'When a teacher says yes to leaving early, she permits it: she lets it happen.',
    ['the rules say yes', 'the teacher says you may leave the room early after the test', 'to say that someone is allowed to do something', 'to allow something to happen, or to give someone official approval']),
  text('arrange', ['arranges', 'arranged', 'arranging'], ['demand', 'urge'], 'Booking the hall, choosing a date and inviting everyone is arranging a party.',
    ['work done behind the scenes before a party', 'booking the hall, choosing a date and inviting every guest to the class party', 'to plan and organise something so that it can happen', 'to organise or make plans for something, such as a meeting or a trip']),
  text('urge', ['urges', 'urged', 'urging'], ['threaten', 'deny'], 'A doctor who tells patients again and again to exercise is urging them to do it.',
    ['pushing someone to do the right thing', 'the doctor tells patients again and again that they really should exercise', 'to encourage someone very strongly to do something', 'to strongly encourage someone to do something, often because it is important']),
  text('recommend', ['recommends', 'recommended', 'recommending'], ['resent', 'avoid'], '"Try that café, the cakes are brilliant" is a recommendation: you suggest something as good or useful.',
    ['telling a friend what is worth trying', 'a friend says, "Try that café, the cakes are brilliant"', 'to suggest that something is good for someone', 'to suggest something as suitable or useful']),
  text('demand', ['demands', 'demanded', 'demanding'], ['arrange', 'avoid'], 'A marathon asks for months of effort, so we say that it demands a lot of you.',
    ['something that takes a lot out of you', 'a marathon takes months of training and a great deal of energy and time', 'to need a lot of effort, skill or time', 'to require a lot of effort, skill, attention or resources']),
  text('threaten', ['threatens', 'threatened', 'threatening'], ['recommend', 'arrange'], 'A serious injury that could end a sporting career threatens it: it puts it at risk.',
    ['danger on the way', 'a bad knee injury could end an athlete\'s career', 'to be a danger to someone or something', 'to put someone or something at risk of harm or loss']),
  text('resent', ['resents', 'resented', 'resenting'], ['afford', 'permit'], 'Training hard and still being left out of the team can make a player resent the decision.',
    ['a bitter feeling that stays with you', 'he did all the training, but a friend was picked for the team, and it still annoys him', 'to feel angry or bitter because something seems unfair', 'to feel angry or upset about something that you think is unfair']),
  text('regret', ['regrets', 'regretted', 'regretting'], ['demand', 'avoid'], 'Wishing you had stayed in school is regret: sorrow about a choice you made.',
    ['wishing you could go back in time', 'he left school early and now wishes he had stayed', 'to feel sorry about something you did', 'to feel sorry about something that happened or something you did']),
  text('unfamiliar', [], ['significant', 'reasonable'], 'The corridors and faces on your first day at a new school are unfamiliar: new to you.',
    ['a street where you have never walked before', 'on your first day at a new school, the corridors and faces all feel like this', 'new to you', 'not known or recognised because you have not experienced it before']),
  text('intense', [], ['reasonable', 'monetary'], 'The last minutes of a final with the score level are intense: extremely strong and demanding.',
    ['the volume turned all the way up', 'the last minutes of a cup final when the score is level', 'much stronger or more serious than normal', 'very strong, serious or demanding']),
  text('determined', [], ['unfamiliar', 'monetary'], 'Someone who loses three matches and still turns up to train is determined: they will not give up.',
    ['a mind that is made up', 'she loses three matches in a row and still turns up to training every day', 'having decided to do something and never giving up', 'firmly decided to achieve something and unwilling to give up']),
  text('discipline', ['self discipline', 'self-discipline', 'disciplines'], ['solution', 'atmosphere'], 'Getting up at five to train when nobody is checking takes discipline.',
    ['doing what needs doing even when you do not feel like it', 'getting up at five on a dark winter morning to train when nobody is checking', 'the self-control to keep working at something', 'the self-control needed to follow rules or work steadily towards a goal']),
  text('goal-oriented', ['goal oriented', 'goal-orientated', 'goal orientated'], ['elite', 'unfamiliar'], 'A manager who cares most about reaching the result by Friday is goal-oriented.',
    ['always looking towards the finish line', 'a manager who only cares that the report is finished by Friday, not how it gets done', 'someone who keeps their eyes on what they want to achieve', 'focused on achieving clear aims or results']),
  text('achievement', ['achievements'], ['preference', 'reputation'], 'Finishing a marathon after only a year of running is a real achievement.',
    ['a moment that makes you feel proud', 'a beginner finishes a marathon after only one year of running', 'something difficult that you have succeeded in doing', 'something important or difficult that has been successfully completed']),
  text('overwhelming', [], ['unfamiliar', 'reasonable'], 'A crowd so loud that players cannot hear their coach is overwhelming: too strong to cope with.',
    ['a wave you cannot hold back', 'the cheering crowd was so loud that the young players could hardly hear their coach', 'much too strong or too big for you to deal with', 'so strong or great that it is difficult to manage or resist']),
  text('generation', ['generations'], ['challenge', 'achievement'], 'Your grandparents, your parents and you each belong to a different generation.',
    ['grandparents, parents and children', 'you and your friends grew up with the same phones, games and music', 'your parents belong to one, and you belong to the next', 'a group of people born and living at roughly the same time']),
  text('challenge', ['challenges'], ['reputation', 'minimum'], 'Running ten kilometres without stopping is a challenge: a hard task that tests you.',
    ['something that makes you push yourself', 'the coach asks the squad to run ten kilometres without stopping', 'a hard task that tests how good you are', 'a difficult task or situation that tests ability']),
  text('solution', ['solutions'], ['minimum', 'atmosphere'], 'A club with no space solved the problem by sharing the school gym: that was its solution.',
    ['what you look for when something goes wrong', 'the club had no room to train, so it shared the school gym and the problem disappeared', 'the answer to a problem', 'an answer to a problem or a way of dealing with a difficulty']),
  text('feat', ['feats'], ['generation', 'criteria'], 'Crossing an ocean alone in a small boat is a feat: something remarkable that needs great courage or skill.',
    ['something amazing that few people could do', 'crossing the ocean alone in a small boat', 'a remarkable thing done with great skill or courage', 'an impressive achievement that requires skill, strength or courage']),
  text('estimated', ['estimate', 'estimates'], ['historic', 'unfamiliar'], 'When nobody counted every seat, "about fifty thousand" was an estimated crowd: roughly right, not exact.',
    ['a sensible guess about the numbers', 'officials say about fifty thousand fans came, but nobody counted every seat', 'worked out roughly, not exactly', 'calculated or judged approximately rather than known exactly']),
  text('struggle', ['struggles', 'struggled', 'struggling'], ['regret', 'permit'], 'Beginners who wobble and fall off a skateboard are struggling: it is hard for them.',
    ['when things do not come easily', 'beginners wobbling and falling when they first stand on a skateboard', 'to find something very hard to do', 'to have difficulty doing or achieving something']),
  text('minimum', ['minimums', 'minima'], ['challenge', 'solution'], 'At least three sessions a week, and no fewer, is the minimum.',
    ['the lowest you can go', 'you must do at least three training sessions every week, no fewer', 'the opposite of maximum', 'the smallest amount, number or level that is allowed or needed']),
  text('championship', ['championships'], ['reputation', 'atmosphere'], 'The team or player who wins the top title is crowned champion of the championship.',
    ['a title that only the very best can win', 'the team that finishes top of the league lifts the trophy at the end of the season', 'the contest that decides who is best of the year', 'a major competition that decides the best player or team']),
  text('competitor', ['competitors'], ['generation', 'solution'], 'Every runner in a race, and every shop selling the same things on the same street, is a competitor.',
    ['everyone who enters a race', 'the shop across the road sells the same things and wants your customers', 'a person, team or company trying to win against others', 'a person or team that takes part in a contest']),
  text('incredible', [], ['reasonable', 'monetary'], 'A lap so fast that it breaks the school record is incredible: hard to believe.',
    ['people stop and stare in amazement', 'her last lap broke the school record by two seconds', 'so amazing that it is hard to believe', 'extremely impressive, surprising or difficult to believe']),
  text('historic', [], ['estimated', 'unfamiliar'], 'A small club\'s first national cup win is historic: fans will remember it for years.',
    ['a day that nobody who was there ever forgets', 'a small club wins its first national cup, and fans still talk about it years later', 'important enough to be remembered for a long time', 'very important, and likely to be remembered for a long time']),
  text('selection', ['selections'], ['reputation', 'minimum'], 'A shop with racks of boots, balls and shirts has a wide selection: lots to choose from.',
    ['picking a team for the match, or an outfit for a party', 'the sports shop has racks of boots, balls and shirts in every size', 'a range of things you can choose from', 'a range of things available to choose from, or the act of choosing']),
  text('produce', ['produces', 'produced', 'producing'], ['permit', 'recommend'], 'A potter who turns clay into bowls produces them: she makes them exist.',
    ['turning materials into something new', 'a factory makes thousands of bikes a year, and a potter shapes a bowl from clay', 'to make or create something', 'to make, create or cause something to exist']),
  text('significant', [], ['reasonable', 'unfamiliar'], 'A training programme that raises results far more than expected has a significant effect.',
    ['enough to make people notice', 'a new training programme lifts the team\'s results by far more than anyone expected', 'big enough to matter', 'important or large enough to be noticed or to have an effect']),
  text('expansion', ['expansions', 'expand'], ['reputation', 'criteria'], 'A club that adds courts and members is getting bigger: that increase in size is its expansion.',
    ['a balloon being blown up', 'a club builds new courts and a second gym, and more members join', 'growing bigger in size, range or number', 'an increase in size, range or amount']),
  text('reasonable', [], ['historic', 'unfamiliar'], 'A coach who listens to your side and sets a fair deadline is being reasonable.',
    ['not too much and not too little', 'a coach who listens to your side of the story and sets a fair deadline', 'fair and sensible', 'fair, sensible, or not too expensive or extreme'])
];

export const CONNECTIONS_PUZZLES = Object.freeze([...PICTURE_PUZZLES, ...TEXT_PUZZLES]);
