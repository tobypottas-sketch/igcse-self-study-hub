// Extra gap-fill sentences for the Unit 1 words that have no hand-written grammar supplement.
// Rule: every sentence contains the target word in exactly the form shown in `target`, so the blank and its answer always match.
// DRAFT FOR TEACHER REVIEW: check each sentence has only one sensible answer among the unit's same-type words.
const s = (id, text, target) => ({ id, text, target, grammarPattern:'' });

export default Object.freeze({
  leisure:[s('x1','Many people spend their leisure at the swimming pool or in the park.','leisure'), s('x2','Longer working hours leave families with less leisure than they had ten years ago.','leisure')],
  preference:[s('x1','The coach asked each player to state a preference for playing in defence or attack.','preference'), s('x2','Most customers showed a clear preference for the cheaper trainers.','preference')],
  unfamiliar:[s('x1','The new player felt nervous in an unfamiliar stadium.','unfamiliar'), s('x2','Climbers should not try unfamiliar routes without a guide.','unfamiliar')],
  racquet:[s('x1','He bought a lighter racquet to improve his serve.','racquet'), s('x2','The player was warned for throwing her racquet onto the court.','racquet')],
  opponent:[s('x1','The boxer studied video of his opponent before the fight.','opponent'), s('x2','Each opponent shook hands before the match began.','opponent')],
  intense:[s('x1','The heat was so intense that the marathon started an hour earlier.','intense'), s('x2','Intense training in the weeks before the tournament left her exhausted.','Intense'), s('x3','Players need intense concentration in the final minutes of a close match.','intense')],
  tournament:[s('x1','The school is hosting a tennis tournament next weekend.','tournament'), s('x2','She was knocked out of the tournament in the second round.','tournament')],
  determined:[s('x1','He was determined to win a place on the national team.','determined'), s('x2','A determined young swimmer trained every morning before school.','determined')],
  discipline:[s('x1','Strict discipline is important for athletes who train every day.','discipline'), s('x2','The coach praised the team for showing discipline under pressure.','discipline')],
  'goal-oriented':[s('x1','Goal-oriented students set clear targets for each week of revision.','Goal-oriented'), s('x2','Being goal-oriented helps athletes stay focused during a long season.','goal-oriented'), s('x3','A goal-oriented swimmer plans every training session carefully.','goal-oriented')],
  achievement:[s('x1','Reaching the national finals was a great achievement for such a small club.','achievement'), s('x2','Her achievement was celebrated at the school assembly.','achievement')],
  elite:[s('x1','Only a few elite swimmers qualify for the Olympic team.','elite'), s('x2','The academy offers elite coaching to the most talented players.','elite'), s('x3','Some elite clubs sign players while they are still at school.','elite')],
  overwhelming:[s('x1','She felt overwhelming pressure to win after the first round.','overwhelming'), s('x2','The overwhelming majority of students voted for a longer lunch break.','overwhelming')],
  generation:[s('x1','Older players share their skills with the next generation.','generation'), s('x2','Each generation of fans has its own favourite team.','generation')],
  challenge:[s('x1','Climbing the mountain in one day was a real challenge.','challenge'), s('x2','The new coach set the team a challenge to run five kilometres without stopping.','challenge')],
  solution:[s('x1','The students found a simple solution to the problem of crowded changing rooms.','solution'), s('x2','There is no easy solution to the problem of rising costs.','solution')],
  pastime:[s('x1','Chess is a popular pastime among older residents.','pastime'), s('x2','For many teenagers, gaming is their favourite pastime.','pastime')],
  feat:[s('x1','Swimming across the lake in cold water was a remarkable feat.','feat'), s('x2','The team’s feat of winning every match was celebrated by the whole town.','feat')],
  regardless:[s('x1','The match will go ahead regardless of the weather.','regardless'), s('x2','Fans queued outside the stadium regardless of the rain.','regardless')],
  monetary:[s('x1','The club received a monetary donation from a local business.','monetary'), s('x2','Winning the race brought a monetary reward as well as a medal.','monetary')],
  estimated:[s('x1','The estimated attendance for the final is forty thousand people.','estimated'), s('x2','An estimated two million people watched the opening ceremony.','estimated')],
  minimum:[s('x1','The minimum height for the ride is one metre.','minimum'), s('x2','You need a minimum of two hours’ practice each week to improve.','minimum')],
  championship:[s('x1','The school team won the regional championship last year.','championship'), s('x2','Thousands of fans travelled to watch the world championship.','championship')],
  competitor:[s('x1','The fastest competitor in the heat qualified for the final.','competitor'), s('x2','Every competitor must wear a helmet during the cycling event.','competitor')],
  relatively:[s('x1','The ticket prices were relatively low for such a big event.','relatively'), s('x2','Rugby is relatively new in some countries.','relatively')],
  patience:[s('x1','The coach showed great patience with the youngest players.','patience'), s('x2','Fishing is a sport that rewards patience.','patience')],
  atmosphere:[s('x1','The stadium had a friendly atmosphere despite the rivalry.','atmosphere'), s('x2','Loud music created a lively atmosphere at the fan zone.','atmosphere')],
  incredible:[s('x1','The goalkeeper made an incredible save in the last minute.','incredible'), s('x2','It was incredible that she won after injuring her ankle.','incredible')],
  criteria:[s('x1','The judges marked each performance against the same criteria.','criteria'), s('x2','Teams must meet several criteria to enter the league.','criteria')],
  historic:[s('x1','The stadium hosted a historic match that people still talk about.','historic'), s('x2','Walking tours visit the historic centre of the city.','historic')],
  selection:[s('x1','The coach announced her selection for the starting team.','selection'), s('x2','The shop offers a good selection of running shoes.','selection')],
  craftspeople:[s('x1','Skilled craftspeople carve each bat by hand.','craftspeople'), s('x2','The festival invites craftspeople to sell their work.','craftspeople')],
  significant:[s('x1','There was a significant drop in attendance after prices rose.','significant'), s('x2','Regular exercise has a significant effect on mood.','significant')],
  expansion:[s('x1','The expansion of the sports hall means more classes can run at once.','expansion'), s('x2','Rapid expansion of the league brought in new teams.','expansion')],
  reputation:[s('x1','The club’s reputation for fair play attracts young players.','reputation'), s('x2','A poor reputation can make it hard to find sponsors.','reputation')],
  reasonable:[s('x1','The gym membership is a reasonable price for students.','reasonable'), s('x2','It is reasonable to expect athletes to rest after a long race.','reasonable')],
  antiques:[s('x1','Her grandfather collects antiques from different countries.','antiques'), s('x2','Visitors can buy antiques at the weekend fair.','antiques')]
});
