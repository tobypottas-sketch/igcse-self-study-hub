import { BLITZ_CONFUSABLE_U2, BLITZ_MEANING_OPTIONS_U2, BLITZ_EXCLUDED_U2, CONNECTIONS_PUZZLES_U2 } from './games-data-unit-02.js';
import { BLITZ_CONFUSABLE_U3, BLITZ_MEANING_OPTIONS_U3, BLITZ_EXCLUDED_U3, CONNECTIONS_PUZZLES_U3 } from './games-data-unit-03.js';
import { BLITZ_CONFUSABLE_U4, BLITZ_MEANING_OPTIONS_U4, BLITZ_EXCLUDED_U4, CONNECTIONS_PUZZLES_U4 } from './games-data-unit-04.js';
// Games data for Unit 1 (Unit 2 lives in games-data-unit-02.js and is registered below): (1) Word Blitz near-neighbour groups, (2) the curated Connections puzzles.
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

// Connections v2: every puzzle has exactly four clues on one curve.
//   1  useful situation (a realistic chance together with word class, length and first letter)
//   2  stronger context
//   3  plain-English meaning
//   4  near-definition (almost a giveaway)
// `accept` lists extra spellings/forms that count as the target. `kind` labels each clue for the post-solve recap.
const clue = (text, kind) => ({ text, kind });
// Clue staircase (Connections v2, text-only): 1 useful situation; 2 stronger context; 3 plain-English meaning (no blank sentence); 4 near-definition.
// Spelling help (word class, length, first letter, then prefix/pattern) is added by the engine from the stage and the target, never from what the student types.
// `help` = two curated Unit 1 distractors for the 3-choice "Need help?" step: same part of speech, clearly not defensible as the answer, never a near-synonym.
const text = (target, accept, help, why, [a, b, c, d]) => ({ target, accept, help, why, clues: [clue(a, 'situation'), clue(b, 'context'), clue(c, 'plain'), clue(d, 'meaning')] });
const PUZZLES = [
  text('tournament', ['tournaments'], ['discipline', 'selection'], 'The World Cup, a knockout event and a series of matches between several teams all describe a tournament.',
    ['Teams from different schools enter an event and play many matches to find one winner.', 'Sixteen teams play knockout rounds over a weekend, and the last two meet in the final.', 'a big sports event with lots of matches and one winner at the end', 'a competition made up of a series of matches played by several teams']),
  text('opponent', ['opponents'], ['challenge', 'discipline'], 'In chess, tennis or any contest, the person on the other side is your opponent.',
    ['In a chess match, you sit across the board from this person and try to win.', 'Before the final, the tennis player studies the person she will face on the other side of the net.', 'the other side in a match or contest', 'the person or team you compete against']),
  text('racquet', ['racket', 'rackets', 'racquets'], ['antiques', 'solution'], 'Sports equipment with strings and a handle that you hit a ball or shuttlecock with is a racquet (also spelled racket).',
    ['You bring this to the court for badminton or tennis and hold it by the handle.', 'After a hard smash, the strings snapped, so you need a new one before the next game.', 'the thing with strings that you swing to hit the ball', 'equipment with a handle and a strung frame, used to hit a ball or shuttlecock']),
  text('pastime', ['pastimes'], ['discipline', 'achievement'], 'Stamp collecting, chess club or painting at the weekend are things you do for enjoyment in your free time: pastimes, or hobbies.',
    ['After school, Mia paints and builds model planes just because she enjoys it.', 'Stamp collecting, chess club and gardening are all popular examples.', 'a hobby', 'an activity you do regularly for enjoyment in your free time']),
  text('reputation', [], ['achievement', 'generation'], 'Online reviews and a restaurant\'s good name both show the general opinion people have of someone or something: its reputation.',
    ['Before choosing a restaurant, you read the online reviews to see what others say.', 'Everyone says the restaurant is excellent, so people trust it before they even try the food.', 'how well or badly people think of you', 'the general opinion that people have about someone or something']),
  text('patience', [], ['challenge', 'solution'], 'Waiting in a queue without getting annoyed is patience; losing it is what happens when you run out.',
    ['You are stuck in a long queue and the line barely moves, but you stay calm.', 'A good teacher shows it when a student asks the same question for the third time.', 'being able to stay calm even when things are slow or difficult', 'the ability to wait calmly without becoming annoyed']),
  text('atmosphere', ['atmospheres'], ['reputation', 'expansion'], 'A packed stadium full of noise and energy creates a mood you can feel: the atmosphere.',
    ['Walking into a packed stadium, you can feel the excitement before the match even starts.', 'A quiet library has a calm one; a cup final has a loud, tense one.', 'the special feeling around you at a concert or a match', 'the mood that you notice in a place or event, such as excited, tense or relaxed']),
  text('antiques', ['antique'], ['racquet', 'selection'], 'A flea market and a very old clock are full of objects that are valuable because of their age: antiques.',
    ['At the flea market, a seller says her grandfather\'s table is two hundred years old.', 'Collectors visit the shop looking for a rare clock or vase that costs a lot because it is so old.', 'old furniture, clocks or vases that are worth a lot', 'old objects that are valuable because of their age']),
  text('craftspeople', ['craftsperson', 'craftsman', 'craftsmen', 'craftswoman', 'craftswomen'], ['opponent', 'generation'], 'A pottery workshop and people who weave, carve or make jewellery are the world of craftspeople: people skilled at making things by hand.',
    ['At the village fair, the stalls are run by the people who made every item themselves.', 'A tourist watches them weave baskets and carve wood in a traditional workshop.', 'potters, weavers and carvers', 'people who are skilled at making things by hand']),
  text('elite', [], ['unfamiliar', 'reasonable'], 'Top athletes, the best of the best and the national team all describe the highest level of ability: elite.',
    ['Only a few athletes are chosen for the national squad because they are better than almost everyone.', 'These are the very best players, far above the level of an ordinary club team.', 'a small group at the very top level', 'belonging to the highest level of ability or performance']),
  text('monetary', [], ['historic', 'unfamiliar'], 'Banks, coins and a cash prize are all connected with money: monetary.',
    ['The club\'s problems this year are about cash: it needs sponsors, savings and payments.', 'A bank manager talks about coins, notes and the value of a pound.', 'describes things connected with cash, banks and payments', 'relating to money or its value']),
  text('criteria', ['criterion'], ['solution', 'achievement'], 'A judge\'s scorecard and the list of things judges look for are the standards used to decide a winner: criteria.',
    ['Before the gymnastics final, the judges explain how they will decide who gets the highest marks.', 'The list says what a performance must include to reach the top mark.', 'the rules or standards that decide what is good enough', 'the standards or tests used to judge or choose something']),
  text('leisure time', ['leisure', 'leisure times', 'free time', 'spare time'], ['generation', 'criteria'], 'The hours after lessons, homework or work, when you choose what to do, are your leisure time (or free time).',
    ['The bell rings, homework is done and you can choose to play football or watch a film.', 'After lessons and chores, these are the hours that belong to you.', 'hours when you have nothing you must do', 'time when you are not working or studying and can relax or enjoy activities']),
  text('preference', ['preferences'], ['solution', 'generation'], 'If you would pick pizza before salad, that choice is your preference.',
    ['Given a choice between pizza and salad, most of the class pick pizza.', 'If a waiter asks which you like better, your answer shows it.', 'what you like better than the other options', 'a greater liking for one option than another']),
  text('avoid', ['avoids', 'avoided', 'avoiding'], ['arrange', 'afford'], 'Taking the back streets to miss the traffic, or skipping a big meal before a swim, is avoiding something.',
    ['She takes the back streets so she is not stuck in rush-hour traffic.', 'You walk round a puddle, take the quiet road, or skip the big meal before a swim.', 'to keep away from something', 'to stay away from something or stop it from happening']),
  text('afford', ['affords', 'afforded', 'affording'], ['permit', 'regret'], 'When the price is more than your pocket money, you cannot afford it.',
    ['The trainers are brilliant, but they cost more than your pocket money.', 'You check your savings before you buy something, to see if you have enough.', 'to have enough money to pay for something', 'to have enough money, time or resources for something']),
  text('deny', ['denies', 'denied', 'denying'], ['arrange', 'recommend'], 'Saying "it wasn\'t me" next to a broken window is denying it.',
    ['A teacher asks if you copied the homework, and you answer, "No, I didn\'t."', '"It wasn\'t me!" says the boy, standing next to the broken window.', 'to say "no, that is not true"', 'to say that something is not true, such as a claim or an accusation']),
  text('permit', ['permits', 'permitted', 'permitting'], ['threaten', 'resent'], 'When a teacher says yes to leaving early, she permits it: she lets it happen.',
    ['The teacher says you may leave the room early after the test.', 'A school rule says yes: students can use their phones at break.', 'to say that someone is allowed to do something', 'to allow something to happen, or to give someone official approval']),
  text('arrange', ['arranges', 'arranged', 'arranging'], ['demand', 'urge'], 'Booking the hall, choosing a date and inviting everyone is arranging a party.',
    ['Before the class party, you book the hall, choose a date and invite every guest.', 'A good organiser does it for a meeting or a trip so that everything is ready.', 'to plan and organise something so that it can happen', 'to organise or make plans for something, such as a meeting or a trip']),
  text('urge', ['urges', 'urged', 'urging'], ['threaten', 'deny'], 'A doctor who tells patients again and again to exercise is urging them to do it.',
    ['The doctor tells patients again and again that they really should exercise.', 'Parents push their child to revise before exams, saying it is very important.', 'to encourage someone very strongly to do something', 'to strongly encourage someone to do something, often because it is important']),
  text('recommend', ['recommends', 'recommended', 'recommending'], ['resent', 'avoid'], '"Try that café, the cakes are brilliant" is a recommendation: you suggest something as good or useful.',
    ['A friend says, "Try that café, the cakes are brilliant."', 'A teacher tells you a book is worth reading and says you should borrow it.', 'to suggest that something is good for someone', 'to suggest something as suitable or useful']),
  text('demand', ['demands', 'demanded', 'demanding'], ['arrange', 'avoid'], 'A marathon asks for months of effort, so we say that it demands a lot of you.',
    ['A marathon takes months of training and a great deal of energy and time.', 'Tough exams ask a lot from students: effort, skill and many hours of study.', 'to need a lot of effort, skill or time', 'to require a lot of effort, skill, attention or resources']),
  text('threaten', ['threatens', 'threatened', 'threatening'], ['recommend', 'arrange'], 'A serious injury that could end a sporting career threatens it: it puts it at risk.',
    ['A bad knee injury could end an athlete\'s career.', 'Storm clouds put the outdoor match at risk of being cancelled.', 'to be a danger to someone or something', 'to put someone or something at risk of harm or loss']),
  text('resent', ['resents', 'resented', 'resenting'], ['afford', 'permit'], 'Training hard and still being left out of the team can make a player resent the decision.',
    ['He did all the training, but a friend was picked for the team, and it still annoys him.', 'He feels bitter about that unfair choice and cannot forget it.', 'to feel angry or bitter because something seems unfair', 'to feel angry or upset about something that you think is unfair']),
  text('regret', ['regrets', 'regretted', 'regretting'], ['demand', 'avoid'], 'Wishing you had stayed in school is regret: sorrow about a choice you made.',
    ['He left school early and now wishes he had stayed.', 'Looking back at a mistake, she feels sorry and wishes she could change it.', 'to feel sorry about something you did', 'to feel sorry about something that happened or something you did']),
  text('unfamiliar', [], ['significant', 'reasonable'], 'The corridors and faces on your first day at a new school are unfamiliar: new to you.',
    ['On your first day at a new school, the corridors and faces all feel like this.', 'You see a street, a word or a face for the very first time.', 'new to you', 'not known or recognised because you have not experienced it before']),
  text('intense', [], ['reasonable', 'monetary'], 'The last minutes of a final with the score level are intense: extremely strong and demanding.',
    ['In the last minutes of a cup final, with the score level, the pressure is like this.', 'A fierce argument, a heavy training session or a very bright light can be described this way.', 'much stronger or more serious than normal', 'very strong, serious or demanding']),
  text('determined', [], ['unfamiliar', 'monetary'], 'Someone who loses three matches and still turns up to train is determined: they will not give up.',
    ['She loses three matches in a row and still turns up to training every day.', 'Even after failing her driving test twice, she books a third attempt straight away.', 'having decided to do something and never giving up', 'firmly decided to achieve something and unwilling to give up']),
  text('discipline', ['self discipline', 'self-discipline', 'disciplines'], ['solution', 'atmosphere'], 'Getting up at five to train when nobody is checking takes discipline.',
    ['You get up at five on a dark winter morning to train, though nobody is checking.', 'Finishing homework before gaming, even when you would rather not, takes this.', 'the self-control to keep working at something', 'the self-control needed to follow rules or work steadily towards a goal']),
  text('goal-oriented', ['goal oriented', 'goal-orientated', 'goal orientated'], ['elite', 'unfamiliar'], 'A manager who cares most about reaching the result by Friday is goal-oriented.',
    ['A manager only cares that the report is finished by Friday, not how it gets done.', 'She writes down what she wants to achieve this term and plans every step towards it.', 'someone who keeps their eyes on what they want to achieve', 'focused on achieving clear aims or results']),
  text('achievement', ['achievements'], ['preference', 'reputation'], 'Finishing a marathon after only a year of running is a real achievement.',
    ['A beginner finishes a marathon after only one year of running.', 'Winning a medal or passing a hard exam makes you feel proud of what you have done.', 'something difficult that you have succeeded in doing', 'something important or difficult that has been successfully completed']),
  text('overwhelming', [], ['unfamiliar', 'reasonable'], 'A crowd so loud that players cannot hear their coach is overwhelming: too strong to cope with.',
    ['The crowd is so loud that the young players can hardly hear their coach.', 'Too much homework, noise or emotion can feel like this when you cannot cope.', 'much too strong or too big for you to deal with', 'so strong or great that it is difficult to manage or resist']),
  text('generation', ['generations'], ['challenge', 'achievement'], 'Your grandparents, your parents and you each belong to a different generation.',
    ['You and your friends grew up with the same phones, games and music.', 'Grandparents, parents and children each belong to a different one.', 'your parents belong to one, and you belong to the next', 'a group of people born and living at roughly the same time']),
  text('challenge', ['challenges'], ['reputation', 'minimum'], 'Running ten kilometres without stopping is a challenge: a hard task that tests you.',
    ['The coach asks the squad to run ten kilometres without stopping.', 'Learning a new language or climbing a high mountain can be this for you.', 'a hard task that tests how good you are', 'a difficult task or situation that tests ability']),
  text('solution', ['solutions'], ['minimum', 'atmosphere'], 'A club with no space solved the problem by sharing the school gym: that was its solution.',
    ['The club had no room to train, so it shared the school gym and the problem disappeared.', 'When the wifi stops working, you search for a way to fix it.', 'the answer to a problem', 'an answer to a problem or a way of dealing with a difficulty']),
  text('feat', ['feats'], ['generation', 'criteria'], 'Crossing an ocean alone in a small boat is a feat: something remarkable that needs great courage or skill.',
    ['A sailor crosses the ocean alone in a small boat.', 'Few people could ever do it, so everyone is amazed by the skill and courage.', 'a remarkable thing done with great skill or courage', 'an impressive achievement that requires skill, strength or courage']),
  text('estimated', ['estimate', 'estimates'], ['historic', 'unfamiliar'], 'When nobody counted every seat, "about fifty thousand" was an estimated crowd: roughly right, not exact.',
    ['Officials say about fifty thousand fans came, but nobody counted every seat.', 'A builder gives a rough price before checking the exact costs.', 'worked out roughly, not exactly', 'calculated or judged approximately rather than known exactly']),
  text('struggle', ['struggles', 'struggled', 'struggling'], ['regret', 'permit'], 'Beginners who wobble and fall off a skateboard are struggling: it is hard for them.',
    ['Beginners wobble and fall when they first stand on a skateboard.', 'A student tries and tries to understand the lesson, but it will not click.', 'to find something very hard to do', 'to have difficulty doing or achieving something']),
  text('minimum', ['minimums', 'minima'], ['challenge', 'solution'], 'At least three sessions a week, and no fewer, is the minimum.',
    ['You must do at least three training sessions every week, no fewer.', 'The lowest score you can get and still pass the test is called this.', 'the opposite of maximum', 'the smallest amount, number or level that is allowed or needed']),
  text('championship', ['championships'], ['reputation', 'atmosphere'], 'The team or player who wins the top title is crowned champion of the championship.',
    ['The team that finishes top of the league lifts the trophy at the end of the season.', 'Only the best player in the country wins the title.', 'the contest that decides who is best of the year', 'a major competition that decides the best player or team']),
  text('competitor', ['competitors'], ['generation', 'solution'], 'Every runner in a race, and every shop selling the same things on the same street, is a competitor.',
    ['The shop across the road sells the same things and wants your customers.', 'Before a race, every runner on the start line is one.', 'a person, team or company trying to win against others', 'a person or team that takes part in a contest']),
  text('incredible', [], ['reasonable', 'monetary'], 'A lap so fast that it breaks the school record is incredible: hard to believe.',
    ['Her last lap broke the school record by two seconds.', 'You tell your friends about a match so amazing that they say, "I can\'t believe it!"', 'so amazing that it is hard to believe', 'extremely impressive, surprising or difficult to believe']),
  text('historic', [], ['estimated', 'unfamiliar'], 'A small club\'s first national cup win is historic: fans will remember it for years.',
    ['A small club wins its first national cup, and fans still talk about it years later.', 'A day that people will remember for many years, such as the first landing on the moon.', 'important enough to be remembered for a long time', 'very important, and likely to be remembered for a long time']),
  text('selection', ['selections'], ['reputation', 'minimum'], 'A shop with racks of boots, balls and shirts has a wide selection: lots to choose from.',
    ['The sports shop has racks of boots, balls and shirts in every size.', 'A café menu offers pizza, pasta, salads and burgers, so you can choose.', 'a range of things you can choose from', 'a range of things available to choose from, or the act of choosing']),
  text('produce', ['produces', 'produced', 'producing'], ['permit', 'recommend'], 'A potter who turns clay into bowls produces them: she makes them exist.',
    ['A factory makes thousands of bikes a year, and a potter shapes a bowl from clay.', 'A bakery does this with bread every morning, and a band does it with a new album.', 'to make or create something', 'to make, create or cause something to exist']),
  text('significant', [], ['reasonable', 'unfamiliar'], 'A training programme that raises results far more than expected has a significant effect.',
    ['A new training programme lifts the team\'s results by far more than anyone expected.', 'Small changes are ignored, but a change this big deserves attention.', 'big enough to matter', 'important or large enough to be noticed or to have an effect']),
  text('expansion', ['expansions', 'expand'], ['reputation', 'criteria'], 'A club that adds courts and members is getting bigger: that increase in size is its expansion.',
    ['A club builds new courts and a second gym, and more members join.', 'A small shop opening three more branches in other towns is an example.', 'growing bigger in size, range or number', 'an increase in size, range or amount']),
  text('reasonable', [], ['historic', 'unfamiliar'], 'A coach who listens to your side and sets a fair deadline is being reasonable.',
    ['A coach listens to your side of the story and sets a fair deadline.', 'A shop charges a price that most families can pay, not too high.', 'fair and sensible', 'fair, sensible, or not too expensive or extreme'])
];

export const CONNECTIONS_PUZZLES = Object.freeze(PUZZLES);
// Word Blitz meaning-in-context options in plain student English (B1-B2). Keyed by the reviewed mastery-context id; position 0 is the correct meaning and 1-3 are the
// reviewed wrong meanings, reworded in the same order so the meaning distinction is unchanged. The reviewed content is not edited: other activities still use it as authored.
export const BLITZ_MEANING_OPTIONS = Object.freeze({
  u1_01_leisure_meaning: Object.freeze(["free time to do things you enjoy", "time for school lessons", "time spent travelling between places", "a short break between two tasks"]),
  u1_01_leisure_paraphrase: Object.freeze(["free time when you are not working", "extra time added to the working week", "the time needed to finish a job", "rest after being ill"]),
  u1_02_preference_meaning: Object.freeze(["liking one thing more than another", "a rule about which food to buy", "a belief that tinned food is not safe", "a habit of eating the same meals"]),
  u1_02_preference_paraphrase: Object.freeze(["a wish for one choice more than the others", "a complaint about the seat", "a rule about where passengers must sit", "a request for more space on the plane"]),
  u1_03_avoid_meaning: Object.freeze(["stay away from something you do not want", "make sure something happens on time", "stop other people doing something", "try something for the first time"]),
  u1_03_avoid_paraphrase: Object.freeze(["stay away from something on purpose", "drive quickly along one road", "close a road to the public", "find the fastest way to a place"]),
  u1_04_afford_meaning: Object.freeze(["have enough money to pay for something", "be happy to share a cost", "agree to lower the price", "decide that a cost is unfair"]),
  u1_04_afford_paraphrase: Object.freeze(["be able to pay for something", "not want to spend money on something", "feel sorry about the price", "borrow a lot of money"]),
  u1_05_deny_meaning: Object.freeze(["say that something is not true", "agree to pay for a problem", "refuse to answer a direct question", "promise to explain what went wrong"]),
  u1_05_deny_paraphrase: Object.freeze(["say that an accusation is not true", "admit that a mistake was made", "say that a rule is unfair", "warn others about a foul"]),
  u1_06_permit_meaning: Object.freeze(["let something happen", "make someone follow a plan", "help someone understand a topic", "expect something to be finished quickly"]),
  u1_06_permit_paraphrase: Object.freeze(["officially say yes to something", "officially ask someone to leave a place", "strongly advise against doing something", "pay for work to be done"]),
  u1_07_arrange_meaning: Object.freeze(["plan something before it happens", "move an important meeting to a new time", "check that people are free", "remind people about a deadline"]),
  u1_07_arrange_paraphrase: Object.freeze(["organise something so it can happen", "pay for a journey", "give directions to a place", "suggest a route for the trip"]),
  u1_08_urge_meaning: Object.freeze(["strongly encourage someone to do something", "warn someone about a danger", "politely ask someone to wait", "ask someone how they are feeling"]),
  u1_08_urge_paraphrase: Object.freeze(["try hard to persuade someone to act", "quietly tell someone what to avoid", "show someone how a dish is made", "let someone make their own choice"]),
  u1_09_recommend_meaning: Object.freeze(["say that something is a good choice", "give a friend a reward", "give someone a reason to be happy", "warn someone about a bad choice"]),
  u1_09_recommend_paraphrase: Object.freeze(["advise someone to choose something", "advise someone to avoid a place", "say how much a visit costs", "invite someone to a special event"]),
  u1_10_demand_meaning: Object.freeze(["need a lot of effort or attention", "give you a lot of enjoyment", "give detailed advice to nervous beginners", "leave plenty of time to rest"]),
  u1_10_demand_paraphrase: Object.freeze(["ask a lot from someone", "make a hard job seem easier", "give someone a prize for hard work", "ask for a job to be put off"]),
  u1_11_threaten_meaning: Object.freeze(["put something important in danger", "make a plan to protect something", "help something get better slowly", "take something off a list early"]),
  u1_11_threaten_paraphrase: Object.freeze(["make something bad more likely", "make a decision harder to explain", "bring new members to a group", "lead to a change in plans"]),
  u1_12_resent_meaning: Object.freeze(["feel angry about something unfair", "feel proud of a team success", "feel nervous before an important event", "feel sorry for someone who is hurt"]),
  u1_12_resent_paraphrase: Object.freeze(["stay angry about something unfair", "happily agree to a request", "feel very tired after a busy day", "feel surprised by a sudden change"]),
  u1_13_regret_meaning: Object.freeze(["feel sorry about something you did", "feel proud of a decision you made recently", "feel unsure about a choice you still have to make", "feel angry about someone else's mistake"]),
  u1_13_regret_paraphrase: Object.freeze(["wish you had chosen differently", "feel excited about a chance next year", "explain why an invitation was refused", "feel thankful to someone who helped"]),
  u1_14_unfamiliar_meaning: Object.freeze(["new to you, not known before", "not allowed by the tournament organisers", "too difficult to explain to anyone", "already known from earlier lessons"]),
  u1_14_unfamiliar_paraphrase: Object.freeze(["new or not known to you", "old-fashioned and rarely seen today", "unpleasant and hard to accept", "special to one family"]),
  u1_15_racquet_meaning: Object.freeze(["equipment with strings for hitting a ball", "soft clothing that protects you in sport", "strong shoes for running fast", "a light net that stops a ball"]),
  u1_15_racquet_paraphrase: Object.freeze(["a light frame with strings and a handle", "a heavy wooden bat with a long handle", "a heavy stick for hitting a puck", "a net for catching a shuttlecock"]),
  u1_16_opponent_meaning: Object.freeze(["the person or team you play against", "the person who judges a match", "a member of your own team", "the person who trains players"]),
  u1_16_opponent_paraphrase: Object.freeze(["the team you are trying to beat", "the people watching a contest", "the people who organise a contest", "the last team to enter a contest"]),
  u1_17_intense_meaning: Object.freeze(["very strong or very hard", "gentle and easy to deal with", "calm and slow to develop", "lasting only a short time each day"]),
  u1_17_intense_paraphrase: Object.freeze(["so strong that it is hard to stand", "gentle and pleasant", "hard to see clearly", "changing quickly every hour"]),
  u1_18_tournament_meaning: Object.freeze(["a competition with many matches", "one match between two famous teams", "a training course for young players", "a prize-giving ceremony"]),
  u1_18_tournament_paraphrase: Object.freeze(["an event with many matches to find a winner", "the last game of the season", "a meeting to choose the best young players", "a series of lessons from a coach"]),
  u1_19_determined_meaning: Object.freeze(["firmly decided to reach your aim", "secretly worried about failing", "fully happy with an earlier result", "unsure about joining a national team"]),
  u1_19_determined_paraphrase: Object.freeze(["not willing to give up on a goal", "sure the match would end soon", "too tired to continue", "ready to accept a heavy defeat"]),
  u1_20_discipline_meaning: Object.freeze(["the self-control to keep going every day", "natural talent from a young age", "a strong dislike of early exercise", "enjoyment of winning hard races"]),
  u1_20_discipline_paraphrase: Object.freeze(["controlling yourself to follow a plan", "a punishment for breaking a school rule", "knowledge gained from years abroad", "the energy needed for a long race"]),
  u1_21_goal_oriented_meaning: Object.freeze(["focused on getting clear results", "mainly wanting to please others", "careful to follow every rule", "happy to share work equally"]),
  u1_21_goal_oriented_paraphrase: Object.freeze(["working towards clear aims", "influenced by what friends think", "limited to a few exercises", "decided by chance, not planning"]),
  u1_22_achievement_meaning: Object.freeze(["something good you did through hard work", "a serious problem caused by too little training", "a public award for taking part", "a short rest during a long race"]),
  u1_22_achievement_paraphrase: Object.freeze(["a hard thing that you have successfully done", "a hard decision that was put off", "a lucky chance that happened by accident", "an unpleasant job that nobody will finish"]),
  u1_23_elite_meaning: Object.freeze(["among the very best", "open to every player who applies", "chosen mainly by the players' age", "run by the local school club"]),
  u1_23_elite_paraphrase: Object.freeze(["at the very top level", "suitable for players of any level", "made to teach basic skills slowly", "held only once every four years"]),
  u1_24_overwhelming_meaning: Object.freeze(["so strong that it is hard to cope with", "too quiet to notice during the game", "kind and encouraging for the whole team", "carefully organised by club officials"]),
  u1_24_overwhelming_paraphrase: Object.freeze(["very big and clearly the winner", "small but still easy to notice", "not clear until all votes are counted", "changing as new results come in"]),
  u1_25_generation_meaning: Object.freeze(["people born around the same time", "one large family living together", "workers with the same employer", "students in the same class"]),
  u1_25_generation_paraphrase: Object.freeze(["a group of people born in a similar period", "a team chosen to represent a country", "a group of experts who train players", "a series of games in one season"]),
  u1_26_challenge_meaning: Object.freeze(["something hard that tests you", "a reward for finishing a task", "a rule about how a game is played", "a warning about a possible injury"]),
  u1_26_challenge_paraphrase: Object.freeze(["a hard problem that needs skill or effort", "a friendly match for fun", "a chance to watch a famous team", "a lesson on how to control the ball"]),
  u1_27_solution_meaning: Object.freeze(["a way to solve a problem", "a reason a problem keeps growing", "a complaint about a lack of space", "a warning that a problem may come back"]),
  u1_27_solution_paraphrase: Object.freeze(["a way that works to fix a problem", "an official rule that causes a problem", "a description of why something happened", "an angry reply to a repeated complaint"]),
  u1_28_pastime_meaning: Object.freeze(["something fun you do in your free time", "a paid job after normal hours", "a school subject taught by a specialist", "a journey for a special reason"]),
  u1_28_pastime_paraphrase: Object.freeze(["a hobby for your spare time", "a serious career chosen after training", "a regular duty done at home", "a skill needed for a certain job"]),
  u1_29_feat_meaning: Object.freeze(["something impressive that needs great skill", "a lucky result nobody expected", "a serious mistake that took time to fix", "a long journey that tested everyone's patience"]),
  u1_29_feat_paraphrase: Object.freeze(["an impressive thing that is hard to do", "a careless choice that put other runners in danger", "a slow recovery after an injury", "an easy task anyone could do"]),
  u1_30_regardless_meaning: Object.freeze(["whatever the weather is like", "only after the weather gets better", "depending on how bad the weather is", "because the weather has been so bad"]),
  u1_30_regardless_paraphrase: Object.freeze(["no matter what their level is", "depending on each person's situation", "unless a teacher says it is fine", "as long as everyone is equally good"]),
  u1_31_monetary_meaning: Object.freeze(["to do with money", "to do with an object's history", "to do with how rare something is", "to do with the size of a prize"]),
  u1_31_monetary_paraphrase: Object.freeze(["about money or what something is worth", "about public praise or thanks", "about physical effort or strength", "about time given freely"]),
  u1_32_estimated_meaning: Object.freeze(["worked out roughly, not exactly", "counted exactly at the gates", "announced early by the organisers", "taken from the match report"]),
  u1_32_estimated_paraphrase: Object.freeze(["based on a rough calculation, not a sure number", "agreed in a signed contract", "paid in full by the club", "lowered after long talks with the builders"]),
  u1_33_struggle_meaning: Object.freeze(["find something very hard to do", "enjoy trying something new", "refuse to follow the teacher's advice", "wait patiently for others to finish"]),
  u1_33_struggle_paraphrase: Object.freeze(["need a lot of effort because it is hard", "quickly lose interest in a game", "refuse to share the ball", "argue about the rules with a friend"]),
  u1_34_minimum_meaning: Object.freeze(["the lowest amount allowed", "the highest amount allowed", "the average amount for most players", "the usual amount for beginners"]),
  u1_34_minimum_paraphrase: Object.freeze(["the smallest number you need", "the greatest age allowed", "the most common age", "the age when players usually stop"]),
  u1_35_championship_meaning: Object.freeze(["a big competition to find the winner of a title", "a small match to practise skills", "a set of lessons for talented young players", "a prize for good behaviour"]),
  u1_35_championship_paraphrase: Object.freeze(["a competition to find the best player", "a course to improve fitness", "a friendly game between old school rivals", "a season ticket for loyal fans"]),
  u1_36_competitor_meaning: Object.freeze(["a person who takes part in a contest", "a person who watches a match closely", "a person paid to help a team", "a person who decides who wins"]),
  u1_36_competitor_paraphrase: Object.freeze(["a person who enters a race to win", "a person who sells tickets for the race", "a person who times each runner", "a person who announces the results"]),
  u1_37_relatively_meaning: Object.freeze(["fairly, when you compare it with others", "to a very high degree", "without comparing at all", "without changing over time"]),
  u1_37_relatively_paraphrase: Object.freeze(["fairly, compared with something else", "more than anyone could expect", "to the highest degree every time", "only for a short time"]),
  u1_38_patience_meaning: Object.freeze(["staying calm while you wait", "a strong wish to succeed quickly", "a natural talent for learning", "a careful choice of the right equipment"]),
  u1_38_patience_paraphrase: Object.freeze(["staying calm when things are difficult", "great physical strength and fitness", "good knowledge of the rules", "a loud voice and strong opinions"]),
  u1_39_atmosphere_meaning: Object.freeze(["the mood you feel in a place", "the noise level near the pitch", "the number of fans at a match", "the weather at the start of play"]),
  u1_39_atmosphere_paraphrase: Object.freeze(["the feeling a place gives you", "warm air inside a big building", "the shape of the stadium seats", "the space for fans in the stadium"]),
  u1_40_incredible_meaning: Object.freeze(["very impressive and surprising", "quite slow but fine", "very hard to measure by hand", "just good enough to be noticed"]),
  u1_40_incredible_paraphrase: Object.freeze(["amazing and hard to believe", "careless and likely to cost goals", "quite ordinary for an experienced professional", "too late to change the final result"]),
  u1_41_criteria_meaning: Object.freeze(["the standards used to judge or choose", "scores collected after a final match", "rules explaining how to play a sport", "names of players chosen for a squad"]),
  u1_41_criteria_paraphrase: Object.freeze(["the things you check when you choose", "prizes for the competition winners", "questions asked after each performance", "opinions from the audience"]),
  u1_42_historic_meaning: Object.freeze(["important enough to be remembered for years", "old enough to be in a museum", "celebrated only by fans of one team", "planned long before the final"]),
  u1_42_historic_paraphrase: Object.freeze(["important enough to change what happens next", "sad enough for everyone to remember", "busy enough to fill the whole calendar", "early enough to be in the printed programme"]),
  u1_43_selection_meaning: Object.freeze(["a range of things to choose from", "a place where goods are stored", "a list of prices for each item", "a person who helps customers buy things"]),
  u1_43_selection_paraphrase: Object.freeze(["a group of things you can choose from", "a timetable showing when classes start", "a fee paid to join a club", "a group of staff who run the centre"]),
  u1_44_produce_meaning: Object.freeze(["make something", "repair something broken", "sell something to a customer", "take something away from a place"]),
  u1_44_produce_paraphrase: Object.freeze(["make or create something", "store something safely for later", "deliver something to a new address", "check something before delivery"]),
  u1_45_craftspeople_meaning: Object.freeze(["skilled workers who make things by hand", "workers who sell goods in markets", "people who design large buildings and parks", "managers who plan big sports events"]),
  u1_45_craftspeople_paraphrase: Object.freeze(["people trained to make things by hand", "traders who buy goods from other countries", "performers who entertain crowds at festivals", "guides who show tourists around the village"]),
  u1_46_significant_meaning: Object.freeze(["important enough to have an effect", "unusual enough to need an explanation", "recent enough to be in reports", "obvious enough to see from far away"]),
  u1_46_significant_paraphrase: Object.freeze(["big enough to make a difference", "pleasant enough for everyone to enjoy", "simple enough to understand quickly", "rare enough to be hard to explain"]),
  u1_47_expansion_meaning: Object.freeze(["becoming bigger in size or range", "moving to a new place", "a decision to close an old building", "a plan to lower the cost of membership"]),
  u1_47_expansion_paraphrase: Object.freeze(["growth in size, range or amount", "a change in the rules of the league", "a loss of money during the season", "a delay in the start of matches"]),
  u1_48_reputation_meaning: Object.freeze(["what people generally think of you", "a private feeling someone keeps secret", "the official rules of the academy", "a written record of every student's grades"]),
  u1_48_reputation_paraphrase: Object.freeze(["the opinion people have of someone over time", "an advertisement paid for by the club", "the money the club has in the bank", "a group of volunteers working for the club"]),
  u1_49_reasonable_meaning: Object.freeze(["fair and sensible, not too much", "unusually high for one day", "completely free for every visitor", "set by law for all clubs"]),
  u1_49_reasonable_paraphrase: Object.freeze(["fair and not too high or too low", "too low for the club to survive", "higher than at any other club", "paid early by nearly all the students"]),
  u1_50_antiques_meaning: Object.freeze(["valuable old things people collect", "modern goods sold cheaply", "copies of famous sports trophies", "damaged things waiting to be thrown away"]),
  u1_50_antiques_paraphrase: Object.freeze(["collectable objects from long ago", "expensive tools used by professionals", "rare plants grown for display", "recent products made by local artists"]),
});

// Games content by unit. A unit appears here ONLY when its Blitz data and/or Connections puzzles have been authored and reviewed.
// A unit with no entry (or an entry without a game) simply has no Games section: it never falls back to another unit's content.
//   blitz:       { confusable, meaningOptions }   Word Blitz still builds its questions from the unit's own loaded words
//   connections: { puzzles }
export const GAMES_BY_UNIT = Object.freeze({
  1:Object.freeze({
    blitz:Object.freeze({ confusable:BLITZ_CONFUSABLE, meaningOptions:BLITZ_MEANING_OPTIONS }),
    connections:Object.freeze({ puzzles:CONNECTIONS_PUZZLES })
  }),
  2:Object.freeze({
    blitz:Object.freeze({ confusable:BLITZ_CONFUSABLE_U2, meaningOptions:BLITZ_MEANING_OPTIONS_U2, excluded:BLITZ_EXCLUDED_U2 }),
    connections:Object.freeze({ puzzles:CONNECTIONS_PUZZLES_U2 })
  }),
  3:Object.freeze({
    blitz:Object.freeze({ confusable:BLITZ_CONFUSABLE_U3, meaningOptions:BLITZ_MEANING_OPTIONS_U3, excluded:BLITZ_EXCLUDED_U3 }),
    connections:Object.freeze({ puzzles:CONNECTIONS_PUZZLES_U3 })
  }),
  4:Object.freeze({
    blitz:Object.freeze({ confusable:BLITZ_CONFUSABLE_U4, meaningOptions:BLITZ_MEANING_OPTIONS_U4, excluded:BLITZ_EXCLUDED_U4 }),
    connections:Object.freeze({ puzzles:CONNECTIONS_PUZZLES_U4 })
  })
});
export function gamesFor(unitNumber, registry = GAMES_BY_UNIT) { return registry[String(Math.trunc(Number(unitNumber)))] ?? null; }
// The game ids a unit can actually play, in lobby order.
export function availableGames(unitNumber, registry = GAMES_BY_UNIT) {
  const data = gamesFor(unitNumber, registry);
  return [data?.blitz ? 'blitz' : null, data?.connections?.puzzles?.length ? 'connections' : null].filter(Boolean);
}
