// Job 9: additional authored WRONG situations for "Which situation fits?". The original four per word were mostly shorter than the correct
// situation, so the longest option was usually right. Each word gets two more plausible, clearly wrong situations: a mid-length one
// and a long one, so wrong options sit on both sides of the correct situation in length and the correct one is
// not systematically the longest. Target-free; none of them could also illustrate the word.
const base = {
  deny:['The referee admitted his mistake and apologised to both teams afterwards.','At the end of the season, their head coach thanked everybody in the squad for their effort.'],
  urge:['The coach was far too busy that week to discuss anyone’s training.','After the final whistle, the captain warmly thanked the supporters who had travelled so far.'],
  demand:['The new gym offers inexpensive membership to students who want to stay healthy.','Once the training session had finished, several parents carried the heavy equipment to the minibus.'],
  resent:['Her teammates were thrilled that she had been chosen for the national finals.','Delighted that his younger brother had joined the team, he told everybody proudly.'],
  regret:['She felt delighted about her decision to join a much bigger club.','He was proud of the brave choice he made, and he never looked back at his old team.'],
  unfamiliar:['Everyone in the village knew the old footpath, and they walked along it every morning.','Our students had played that game many times before, so they understood every one of its rules.'],
  racquet:['She lifted the heavy ball with both hands and rolled it down the lane.','Before starting the long mountain climb, the cyclist checked his tyres and fastened his helmet.'],
  tournament:['Every morning, the whole school gathers in the main hall for assembly.','Both teams practised their passing drills for an hour before stopping for a long lunch.'],
  determined:['After losing the first set, he gave up and walked silently off the court.','Feeling unsure about the race, she nearly stayed at home that morning.'],
  discipline:['The squad spent the whole evening watching videos of old matches together.','He was lucky to be selected, because the other player had badly injured his knee in training.'],
  'goal-oriented':['His team wandered across the pitch without a plan and quickly lost the ball.','He enjoys playing sport purely for fun, and he never keeps score or thinks about winning.'],
  achievement:['The club’s old changing rooms were damaged by heavy rain and closed for weeks.','Despite months of training, the player failed to finish the course and felt deeply disappointed.'],
  overwhelming:['Their supporters left the stadium early because the slow, quiet game bored them.','Only a handful of spectators came to the match, so the stands looked almost completely empty.'],
  generation:['Every player in the club wears the same red shirt for all home matches.','Shortly before the summer term began, the school bought brand new nets for the tennis courts.'],
  challenge:['The cheap trainers wore out after only two weeks of regular use.','Nobody found the first level hard, so the whole class moved on to the next topic early.'],
  solution:['Our coach was annoyed because several players had arrived late for training again.','The school pitch stayed closed all week, because nobody had cut the long grass for several months.'],
  pastime:['The professional footballer trained six hours a day and treated football as his career.','Her team practised every single morning before school, because the national final was getting closer.'],
  feat:['The goalkeeper made several small mistakes and conceded three very easy goals.','The swimmer stayed in bed all morning, and she decided to skip the important race altogether.'],
  estimated:['After checking the timings, the judges confirmed the final result of the race.','Officials counted every spectator at the gate, and they published the exact total the next morning.'],
  struggle:['The class finished the long run so easily that the teacher added extra laps.','Experienced climbers found the short route very simple, and they reached the summit within minutes.'],
  minimum:['The stadium holds sixty thousand people when every single seat has been sold.','The prize for the race winner is far higher than the prizes for the other finalists.'],
  championship:['Every week, the club holds a relaxed practice session for members of every age and ability.','The two schools played a friendly match to raise money for the new library.'],
  competitor:['Hundreds of supporters waited outside the stadium to watch the team arrive.','At the end of the event, the head teacher presented certificates to all of the volunteers.'],
  relatively:['Nobody could believe how enormous the new stadium looked inside.','The match started at exactly three o’clock on the school field on the last day of term.'],
  patience:[],
  atmosphere:['The stadium sold out within minutes, so the club doubled the seating.','Tickets for the final cost twice as much as for the earlier rounds, which surprised many fans.'],
  incredible:['The match finished as a boring nil-nil draw that nobody will remember.','Her time in the race was rather slow, so she felt a little disappointed afterwards.'],
  criteria:['Last year’s winners received medals, a shiny trophy and a free trip to the capital.','The competition results will be displayed on the school notice board this evening, after lessons.'],
  historic:['The old football ground was knocked down and replaced with a large car park.','Last weekend’s match was a quiet event that very few people will talk about later.'],
  selection:['Our coach asked every player to hand in their kit at the end of the season.','Heavy snow forced the organisers to cancel all of the outdoor events this weekend.'],
  produce:['The factory closed after the fire, and most of the local workers lost their jobs.','Very few people attend the home matches, because the tickets have become far too expensive for families.'],
  craftspeople:['Last weekend, thousands of fans filled the stadium to cheer for their favourite local team.','Professional athletes were paid very large fees, and they appeared in the new television advert.'],
  significant:['The tiny scratch on the bat did not affect its performance in any way.','Nobody noticed the minor change to the timetable, because it affected so few students.'],
  expansion:['The club closed two of its youth teams because there was not enough money.','The population of the village fell steadily, as young people moved away to study in the city.'],
  reputation:['Her coach changed the team’s training time without telling any of the players.','She won three gold medals in a single afternoon, at her very first national competition.'],
  reasonable:['The cost of entering the competition was far too high for most families.','The referee’s rude and unfair decision annoyed both teams as well as the whole noisy crowd.'],
  antiques:['Every year the town holds a fashion show to promote clothes from young designers.','The shop sells modern gadgets, brand new phones and the latest computer games for teenagers.'],
  avoid:['He walked straight towards the heavy traffic without looking, and he nearly caused an accident.','Their captain asked everyone to run towards the loudest, most crowded part of the stadium.'],
  afford:['The family spent a fortune on a new bicycle and then bought a second.','The shop closed early last weekend, because the manager wanted to watch the big football match.'],
  arrange:['Their team arrived very late and the match started without them.','The coach forgot the match kit, so the players had to borrow shirts from the other team.'],
  regardless:['The race was stopped halfway because of the heavy rain.','The match was cancelled because the pitch was too wet for anyone to play on it safely.']
};

// Further mid-length wrong situations for each word whose correct situations are longer than most of the originals.
const more = {
  "urge": [
    "The headmaster refused every request to discuss the controversial timetable changes.",
    "The stadium manager delayed opening the gates until security checks finished."
  ],
  "tournament": [
    "Two neighbouring schools arranged a friendly basketball match for the following afternoon.",
    "Tourists photographed the cathedral, then bought postcards from the market stalls.",
    "The librarian recommended interesting biographies to curious teenagers."
  ],
  "determined": [
    "Frustrated by the heavy defeat, she considered giving up the sport completely.",
    "Nobody expected the substitute to score, but everybody applauded him politely.",
    "The referee checked the equipment bags before the visiting team arrived."
  ],
  "discipline": [
    "Her goalkeeper’s natural talent was obvious from his very first training session.",
    "Coaches rescheduled the gala because transport was cancelled suddenly."
  ],
  "goal-oriented": [
    "Our relaxed squad trains whenever it likes and never sets any real targets.",
    "Younger pupils watched older students rehearsing the school musical after lessons.",
    "Several students stayed after school to help clean the equipment room."
  ],
  "achievement": [
    "The visiting team played very badly and went home without winning anything.",
    "The visiting supporters waited patiently outside the stadium all morning.",
    "A broken window delayed the opening of the new school gymnasium."
  ],
  "generation": [
    "The head coach divided the squad into equal teams for practice matches.",
    "The council finally repaired the leaking roof above the indoor swimming pool."
  ],
  "challenge": [
    "The new sports hall opened this week with a free swimming session.",
    "His school canteen introduced cheaper meals for younger pupils."
  ],
  "solution": [
    "Several members complained that the changing rooms were cold, damp and unusually dirty.",
    "Spectators queued patiently outside the stadium gates from early morning.",
    "Parents received a letter about the changes to the school timetable."
  ],
  "pastime": [
    "Her father worked as a full-time coach for the national swimming team.",
    "Neighbours gathered along the main street to watch the colourful parade.",
    "The older players prepared sandwiches for the long journey home."
  ],
  "feat": [
    "The inexperienced swimmers finished last in every heat and left disappointed.",
    "Spectators complained loudly about the unexpectedly expensive refreshments inside the stadium."
  ],
  "minimum": [
    "The cup final tickets sold out surprisingly quickly, within a few minutes.",
    "Volunteers painted the changing rooms during the long summer holidays.",
    "The captain led the team onto the pitch before the opening whistle."
  ],
  "championship": [
    "Neighbouring villages organise a friendly cricket match every summer to raise money.",
    "Local residents complained about the noise from the open-air concert last summer."
  ],
  "competitor": [
    "The marathon route passes through the old town and along the river.",
    "The local newspaper published photographs of the celebrations the next morning.",
    "Their school choir performed two songs before the match began."
  ],
  "relatively": [
    "Heavy snow is forecast across the entire region for the whole weekend.",
    "Before the match began yesterday, journalists interviewed several famous footballers outside the stadium."
  ],
  "patience": [
    "Our coach rushed every drill to save time."
  ],
  "atmosphere": [
    "The ticket office closes at five, so latecomers must buy tickets online.",
    "The stadium announcer read out the team lists very carefully."
  ],
  "incredible": [
    "The final score was exactly what every supporter had expected beforehand."
  ],
  "criteria": [
    "The winners will be announced on the school website early next week.",
    "The local newspaper printed the fixtures for the whole month on page three."
  ],
  "historic": [
    "Heavy rain delayed the start of the match, so spectators waited under umbrellas.",
    "The club cancelled its annual dinner after the venue flooded last winter.",
    "A heavy thunderstorm flooded the stadium car park during yesterday’s match."
  ],
  "selection": [
    "The match was postponed because the referee fell ill that morning."
  ],
  "craftspeople": [
    "Famous footballers signed autographs for fans outside the stadium after the match.",
    "Parents queued outside the school hall to collect their children’s certificates."
  ],
  "significant": [
    "Several fans left early because the match finished in a boring draw.",
    "Her head teacher announced that the school would build a new gymnasium before the summer.",
    "The head teacher announced that parents had raised enough money to build a brand new gymnasium before summer."
  ],
  "expansion": [
    "The head coach resigned after the team lost six matches in a row.",
    "Heavy traffic delayed the visiting team’s coach on the motorway yesterday."
  ],
  "reputation": [
    "Tickets for the school concert are available from the main office until the end of the week.",
    "Most spectators brought umbrellas because rain was forecast for the afternoon.",
    "Several students collected their certificates from the main office."
  ],
  "antiques": [
    "Visitors to the market bought fresh vegetables, cheese and bread from local farmers.",
    "The stadium café offers hot drinks, sandwiches and cakes throughout the afternoon."
  ],
  "resent": [
    "Her teammates encouraged her warmly and invited her to every social event."
  ],
  "regret": [
    "She smiled happily when the long journey to the tournament was finally over.",
    "Visitors to the museum admired the old trophies in the glass cabinets."
  ],
  "produce": [
    "The mayor opened the new sports centre with a short speech and ribbon.",
    "One referee checked the pitch before allowing both teams onto the grass."
  ],
  "struggle": [
    "The local athletes trained happily together every weekend and rarely missed a session.",
    "The sports shop on the high street sells running shoes at reduced prices."
  ],
  "elite": [
    "Anybody can join the Saturday club, whatever their age or experience.",
    "The new sports centre has a café, a gym and a swimming pool."
  ],
  "monetary": [
    "The charity match raised awareness of the sport among younger children.",
    "Local artists painted a colourful mural on the leisure centre wall."
  ],
  "estimated": [
    "The referee blew his whistle exactly at four to start the second half.",
    "Several parents volunteered to drive the younger players to the distant stadium.",
    "Their coach travelled to the neighbouring town early in the morning."
  ],
  "threaten": [
    "The doctor reassured the coach that the injury would heal within a week.",
    "A sudden thunderstorm interrupted the cricket match yesterday afternoon."
  ],
  "recommend": [
    "Our captain organised a small party for the whole squad after the semifinal.",
    "The substitute apologised sincerely for arriving unexpectedly late."
  ],
  "opponent": [
    "Her closest friend on the team always shared her snacks after training."
  ],
  "intense": [
    "The afternoon session was gentle and friendly, with plenty of time for chatting.",
    "Everybody enjoyed the gentle walk through the village after lunch."
  ],
  "permit": [
    "The caretaker locked the main gate at six o’clock every single evening.",
    "The coach wrote the team names on the whiteboard before the match."
  ],
  "unfamiliar": [
    "Her students recognised every player’s name because they watched matches every weekend.",
    "The goalkeeper trained every evening after school with his older brother for the entire summer."
  ],
  "racquet": [
    "She tied her hair back and stretched carefully before the first lap began.",
    "One referee checked the nets before the match started this weekend."
  ],
  "overwhelming": [
    "Hardly anyone noticed the result, because the game finished late in the evening."
  ],
  "demand": [
    "After the long weekend, the club chairman thanked every volunteer for painting the changing rooms.",
    "Their captain shook hands with each player before leaving.",
    "Supervisors inspected the equipment cupboards immediately afterwards.",
    "Volunteers repainted the changing rooms during the holidays.",
    "The head teacher congratulated everybody warmly after the summer sports ceremony ended."
  ],
  "regardless": [
    "Nobody attended the final practice session.",
    "The referee ended the match very early.",
    "The pitch stayed closed for repairs.",
    "Only two teams entered the cup this year.",
    "Our goalkeeper changed his gloves before the second half."
  ],
  "afford": [
    "The teacher cancelled swimming lessons because the pool flooded overnight.",
    "Her coach praised the whole squad for its excellent teamwork."
  ],
  "reasonable": [
    "The sports hall closes for cleaning every weekend afternoon.",
    "The school fundraiser raised enough money for new equipment, and the headteacher thanked every parent."
  ],
  "deny": [
    "One referee explained the new offside rule to the captains before the match started today."
  ]
};

export default Object.freeze(Object.fromEntries(Object.entries(base).map(([term, rows]) => [term, [...rows, ...(more[term] ?? [])]])));
