// Teacher-reviewed distractors for Unit 1, authored with the unit and published inside the unit's own data (nothing here is read by the
// engine directly). build-unit.js attaches them to the word's sense:
//   situation  -> sense.situationDistractors   ("Which situation fits?" wrong options; target-free near-misses)
//   gap        -> sense.gapDistractors         (wrong options for a blanked gap-fill sentence, keyed by the sentence's context id suffix)
// Spelling errors are lexical, not unit-specific, and live in content/vocabulary/lexical-spelling-errors.js.
// Gap rows: id = the id of the unit's gap-fill sentence for that word; answer = the exact blanked form; wrong = three options that
// can NOT also complete the sentence.
export const unit1SituationDistractors = Object.freeze({
  "leisure time":["Our coach set a strict timetable for every hour of the training camp.","Students must finish their homework before they are allowed to use the gym.","The athletes spent the whole afternoon in a compulsory team meeting.","Her part-time job at the sports shop takes up most of her weekends."],
  "preference":["Our school rule says every student must take part in a team sport.","He chose swimming because there was no space left in the other classes.","The coach decided who would play in defence without asking the players.","She dislikes team games and avoids joining any of them."],
  "avoid":["He ran straight into the crowded training area without checking.","His team looked for every chance to take risks in the final.","She tried a new sport every month to see which one she liked.","The coach warned him that the injury could get worse if he kept playing."],
  "afford":["Their family borrowed money to buy the expensive tennis equipment.","The club saved for three years before it could build a new pool.","The shop offered a discount on running shoes for students.","Our school decided not to buy new goalposts because the old ones were still safe."],
  "deny":["The athlete admitted that he had missed the test.","The player told the referee he was sorry for the foul.","The coach refused to answer any questions after the match.","Her club announced that the match would be played at the weekend."],
  "permit":["The rules forbid spectators from entering the training area.","The coach asked spectators politely to move away from the track.","The centre was closed for repairs during the holiday.","The referee warned the player about his behaviour."],
  "arrange":["Their coach cancelled the extra practice session at the last minute.","The players forgot where the bus was meeting them.","Our school hoped that the weather would stay dry for the final.","A volunteer cleaned the changing rooms before the tournament."],
  "urge":["The coach allowed the players to choose whether to drink water.","Doctors forbid teenagers from taking part in any sport.","Her teacher quietly told the students the match times.","The captain ignored the doctor's advice and played anyway."],
  "recommend":["His coach ordered every player to wear a helmet.","The trainer warned players never to stretch before exercise.","She read a book about the history of cycling.","The shop refused to sell the shoes to children."],
  "demand":["The sport needs only one hour of practice a month.","Their coach offered the players a day off.","The team celebrated after the match with a long meal.","Playing in the park costs nothing and takes very little time."],
  "threaten":["Our new coach helped to protect her place in the team.","A long holiday gave her injury time to heal.","Her place in the team was announced early in the week.","A generous sponsor promised to support the club for another year."],
  "resent":["He felt proud when he was chosen to captain the team.","She was delighted that her friend won the prize.","He felt nervous before his first race.","The player was sorry that he had shouted at the referee."],
  "regret":["He felt angry that the coach picked another player.","She was happy about the choice she made.","He felt nervous about the choice he had to make.","She told everyone proudly that she had chosen to retire."],
  "unfamiliar":["Every student in the class knew the rules by heart.","The students played the game they had played for years.","The old pitch was dangerous and nobody wanted to use it.","The new equipment was expensive and heavy."],
  "racquet":["She tightened the laces on her running shoes before the race.","Her goalkeeper wore thick gloves to protect his hands.","He carried a wooden bat onto the cricket field.","The player hit the ball into the net with her foot."],
  "opponent":["The two players trained together every morning as teammates.","A friend watched the whole match from the stands.","The coach shouted instructions from the side of the pitch.","One referee stopped the match to check the score."],
  "intense":["The training session was short and very relaxed.","The match was cancelled because of heavy rain.","The crowd was small and quiet throughout the final.","The race lasted a long time but was easy for the runners."],
  "tournament":["Two friends played a single game of tennis in the park.","The team practised passing for an hour after lessons.","A coach gave a talk to parents about healthy eating.","Fans travelled by train to watch a friendly match."],
  "determined":["He gave up after the first kilometre because he felt tired.","She was not sure whether she wanted to run at all.","The runner was forced to stop by an injury.","He did not care whether he finished the race or not."],
  "discipline":["Their team was lucky to win the final goal in extra time.","She has a natural talent for running fast.","The players were punished for being late to the bus.","He trains hard only when someone is watching him."],
  "goal-oriented":["Our team plays only for fun and never keeps score.","She tries a different sport each week without any plan.","He often loses focus and thinks about other things.","The captain scored the winning goal in the final minute."],
  "achievement":["He tried to finish the marathon but gave up at ten kilometres.","She trained every morning for months.","Her team lost the final after a poor performance.","The coach praised the players for being on time."],
  "elite":["Beginners learn the basic rules in their first lesson.","Most students play sport once or twice a week for fun.","His club welcomes players of every age and level.","Young players practise in the park after school."],
  "overwhelming":["The noise from the crowd was quiet and easy to ignore.","A few people clapped politely after the final.","The crowd was slightly larger than last year.","The match was short and the weather was pleasant."],
  "generation":["A single player joined the team after the transfer window.","The old stadium was replaced by a modern one.","Several coaches left the club after a disagreement.","The league introduced a new set of rules this season."],
  "challenge":["The final was easy and the team won without any effort.","The prize for the winner was a free membership.","Their coach explained the rules clearly to everyone.","The match was a routine game against a weak team."],
  "solution":["The shortage of balls caused the practice to be cancelled.","Nobody knew why the training sessions were so crowded.","The club argued about how to spend its money.","The shortage of space got worse every month."],
  "pastime":["Football was her full-time job and she was paid to play.","He trained six hours a day to become a professional.","The sport was compulsory for every student at school.","Cycling was the main way he travelled to work."],
  "feat":["Walking to the shop was something he did every day.","He made a small mistake at the start of the race.","The attempt to climb the mountain failed in bad weather.","Our team played an ordinary match on a weekday afternoon."],
  "regardless":["The match was cancelled because of the heavy rain.","The game would only go ahead if the weather was fine.","The race started late as a result of the rain.","Because the pitch was wet, the players stayed indoors."],
  "monetary":["The winner received a medal and a certificate.","The team was given a new kit by the school.","The best player was invited to train with the national squad.","The runners enjoyed a free meal after the race."],
  "estimated":["Her club published the exact score of the match.","The referee confirmed the final result after the video check.","Officials counted every spectator at the gate.","The shop announced the fixed price of the new boots."],
  "struggle":["The beginners learned to ride the bikes easily on the first day.","She refused to try the difficult climb.","The new player scored two goals in his first match.","His coach gave the team an easy exercise to finish."],
  "minimum":["The ride has a maximum height limit of two metres.","The average age of the players is sixteen.","The club expects around thirty players to come.","The highest score in the league is ninety points."],
  "championship":["Their class played a friendly game on a weekday afternoon.","The coach held a short practice for new players.","Two schools played one match to test a new pitch.","Our team travelled abroad for a training holiday."],
  "competitor":["A fan cheered loudly from the stands.","The official checked the stopwatch at the finish line.","The coach made a speech to the team before the game.","A volunteer handed out water at the finish line."],
  "relatively":["The new sports centre is exactly the same size as the old one.","The new sports centre is enormous and has a huge pool.","The new sports centre will open next month.","The new sports centre was built in only six weeks."],
  "patience":["Her coach shouted at the players for making mistakes.","He gave up after the first failed attempt.","She hurried through the lesson to finish early.","The players were bored and kept checking the clock."],
  "atmosphere":["The temperature of the hall was too high for training.","The match started at four o'clock in the afternoon.","The stadium was empty and the seats were new.","The tickets for the final sold out in an hour."],
  "incredible":["His goalkeeper made a routine save in the first minute.","Her time was close to the average for the race.","The match ended in a boring nil-nil draw.","The result was exactly what everyone had expected."],
  "criteria":["The judges chose the winner by guessing.","Their judges awarded gold, silver and bronze medals.","The winner's name was written on the trophy.","The panel met at nine o'clock to start the contest."],
  "historic":["The ground was old and the seats were uncomfortable.","The match was an ordinary league game that nobody remembers.","The stadium is quite new and has modern lights.","The museum next to the stadium sells cheap souvenirs."],
  "selection":["The coach refused to choose anyone for the team.","The shop sells only one kind of football boot.","Our club had to reject every player who applied.","Every item in the shop was sold out by noon."],
  "produce":["The factory closed and stopped making anything.","The workshop repaired old racquets for local players.","The club sold its old equipment to another school.","The shop imported all its bats from abroad."],
  "craftspeople":["Large crowds of fans filled the stands.","The coaches trained the team for the final.","Machines in a factory stamped out thousands of identical bats.","Customers queued outside the sports shop at the weekend."],
  "significant":["The change in the rules made only a tiny difference.","The new boots were famous but ordinary in design.","The improvement was so small that nobody in the team noticed it.","The result of the match did not matter to anyone."],
  "expansion":["Her club closed two of its three sports halls.","The number of players stayed exactly the same for years.","The league moved all its matches to a new day.","His new coach changed the team's training routine."],
  "reputation":["The academy moved to a new address last year.","Their club's yearly fee is paid in two instalments.","The academy has twenty coaches and four pitches.","Our academy was founded by a former champion."],
  "reasonable":["The entry fee was far too high for most families.","The gym membership cost more than most students could ever pay.","Nobody in the club could understand the strange new rule about fees.","The tickets for the final were free for every student."],
  "antiques":["The shop sold brand-new trainers in every colour.","The museum showed photographs of last year's final.","Collectors paid a high price for a famous player's signed shirt.","The market sold fresh fruit and vegetables every morning."],
});

export const unit1GapDistractors = Object.freeze({
  "leisure time":[
    { id:"meaning_sentence", answer:"leisure time", wrong:["homework","working hours","uniform"] },
    { id:"x1", answer:"leisure time", wrong:["homework","school hours","rent"] },
    { id:"x2", answer:"leisure time", wrong:["income","noise","crime"] }
  ],
  "preference":[
    { id:"meaning_sentence", answer:"preference", wrong:["dislike","complaint","disagreement"] },
    { id:"x1", answer:"preference", wrong:["complaint","penalty","refund"] },
    { id:"x2", answer:"preference", wrong:["complaint","refund","discount"] }
  ],
  "avoid":[
    { id:"base_noun", answer:"avoid", wrong:["take","seek","welcome"] },
    { id:"third_ing", answer:"avoids", wrong:["hopes","wants","expects"] },
    { id:"past_noun", answer:"avoided", wrong:["calculated","reported","measured"] },
    { id:"perfect_ing", answer:"avoided", wrong:["enjoyed","practised","resumed"] },
    { id:"plural_ing", answer:"avoid", wrong:["enjoy","prefer","practise"] }
  ],
  "afford":[
    { id:"present_noun", answer:"afford", wrong:["advertise","describe","photograph"] },
    { id:"present_inf", answer:"afford", wrong:["pretend","threaten","deserve"] },
    { id:"past_noun", answer:"afford", wrong:["inspect","describe","photograph"] },
    { id:"past_inf", answer:"afford", wrong:["pretend","deserve","threaten"] },
    { id:"question_noun", answer:"afford", wrong:["advertise","describe","inspect"] },
    { id:"future_inf", answer:"afford", wrong:["pretend","forget","deserve"] }
  ],
  "deny":[
    { id:"base_ing", answer:"deny", wrong:["admit","regret","confess"] },
    { id:"third_ing", answer:"denies", wrong:["admits","confesses","regrets"] },
    { id:"past_that", answer:"denied", wrong:["photographed","inspected","borrowed"] },
    { id:"perfect_that", answer:"denied", wrong:["repaired","measured","borrowed"] },
    { id:"past_perfect_ing", answer:"denied", wrong:["hoped","planned","wanted"] }
  ],
  "permit":[
    { id:"base_object", answer:"permit", wrong:["suggest","explain","announce"] },
    { id:"third_ing", answer:"permits", wrong:["hopes","plans","discourages"] },
    { id:"past_object", answer:"permitted", wrong:["suggested","explained","mentioned"] },
    { id:"passive_present", answer:"permitted", wrong:["explained","announced","described"] },
    { id:"passive_past", answer:"permitted", wrong:["suggested","mentioned","discussed"] }
  ],
  "arrange":[
    { id:"base_noun", answer:"arrange", wrong:["inspect","photograph","describe"] },
    { id:"third_for", answer:"arranges", wrong:["inspects","photographs","describes"] },
    { id:"past_noun", answer:"arranged", wrong:["inspected","photographed","repaired"] },
    { id:"perfect_to", answer:"arranged", wrong:["inspected","photographed","described"] },
    { id:"past_for", answer:"arranged", wrong:["inspects","photographs","describes"] }
  ],
  "urge":[
    { id:"base_active", answer:"urge", wrong:["suggest","explain","announce"] },
    { id:"third_active", answer:"urges", wrong:["suggests","explains","announces"] },
    { id:"past_active", answer:"urged", wrong:["suggested","explained","announced"] },
    { id:"perfect_active", answer:"urged", wrong:["suggested","explained","announced"] },
    { id:"passive_present", answer:"urged", wrong:["described","mentioned","discussed"] },
    { id:"passive_past", answer:"urged", wrong:["described","mentioned","discussed"] }
  ],
  "recommend":[
    { id:"base_noun", answer:"recommend", wrong:["belong","depend","wait"] },
    { id:"third_ing", answer:"recommends", wrong:["hopes","plans","wants"] },
    { id:"past_noun", answer:"recommended", wrong:["belonged","depended","waited"] },
    { id:"perfect_ing", answer:"recommended", wrong:["hoped","planned","wanted"] },
    { id:"third_that", answer:"recommends", wrong:["photographs","inspects","repairs"] },
    { id:"past_that", answer:"recommended", wrong:["photographed","inspected","repaired"] }
  ],
  "demand":[
    { id:"base_noun", answer:"demand", wrong:["excuse","replace","shorten"] },
    { id:"third_noun", answer:"demands", wrong:["prevents","replaces","excuses"] },
    { id:"past_noun", answer:"demanded", wrong:["prevented","replaced","excused"] },
    { id:"perfect_noun", answer:"demanded", wrong:["prevented","replaced","excused"] },
    { id:"past_that", answer:"demanded", wrong:["photographed","inspected","repaired"] },
    { id:"third_that", answer:"demands", wrong:["photographs","inspects","repairs"] }
  ],
  "threaten":[
    { id:"base_noun", answer:"threaten", wrong:["protect","strengthen","advance"] },
    { id:"third_noun", answer:"threatens", wrong:["strengthens","protects","improves"] },
    { id:"past_noun", answer:"threatened", wrong:["strengthened","protected","improved"] },
    { id:"perfect_noun", answer:"threatened", wrong:["protected","secured","strengthened"] },
    { id:"past_inf", answer:"threatened", wrong:["suggested","explained","volunteered"] },
    { id:"third_inf", answer:"threatens", wrong:["suggests","explains","announces"] }
  ],
  "resent":[
    { id:"base_noun", answer:"resent", wrong:["appreciate","praise","welcome"] },
    { id:"third_ing", answer:"resents", wrong:["hopes","plans","appreciates"] },
    { id:"past_ing", answer:"resented", wrong:["hoped","planned","appreciated"] },
    { id:"past_object_ing", answer:"resented", wrong:["hoped","planned","appreciated"] },
    { id:"perfect_noun", answer:"resented", wrong:["inspected","photographed","repaired"] }
  ],
  "regret":[
    { id:"base_ing", answer:"regret", wrong:["hope","plan","want"] },
    { id:"third_ing", answer:"regrets", wrong:["hopes","plans","wants"] },
    { id:"past_ing", answer:"regretted", wrong:["hoped","planned","wanted"] },
    { id:"perfect_that", answer:"regretted", wrong:["photographed","inspected","repaired"] },
    { id:"past_that", answer:"regretted", wrong:["photographed","inspected","repaired"] }
  ],
  "unfamiliar":[
    { id:"meaning_sentence", answer:"unfamiliar", wrong:["familiar","known","recognisable"] },
    { id:"x1", answer:"unfamiliar", wrong:["affordable","enjoyable","optimistic"] },
    { id:"x2", answer:"unfamiliar", wrong:["familiar","easy","predictable"] }
  ],
  "racquet":[
    { id:"meaning_sentence", answer:"racquet", wrong:["bat","club","paddle"] },
    { id:"x1", answer:"racquet", wrong:["club","stick","mallet"] },
    { id:"x2", answer:"racquet", wrong:["club","mallet","stick"] }
  ],
  "opponent":[
    { id:"meaning_sentence", answer:"opponent", wrong:["coach","referee","spectator"] },
    { id:"x1", answer:"opponent", wrong:["trainer","manager","instructor"] },
    { id:"x2", answer:"opponent", wrong:["spectator","supporter","sponsor"] }
  ],
  "intense":[
    { id:"meaning_sentence", answer:"intense", wrong:["financial","medical","annual"] },
    { id:"x1", answer:"intense", wrong:["mild","gentle","pleasant"] },
    { id:"x3", answer:"intense", wrong:["weak","casual","occasional"] }
  ],
  "tournament":[
    { id:"meaning_sentence", answer:"tournament", wrong:["lesson","library","celebration"] },
    { id:"x1", answer:"tournament", wrong:["racquet","court","celebration"] },
    { id:"x2", answer:"tournament", wrong:["lesson","library","celebration"] }
  ],
  "determined":[
    { id:"meaning_sentence", answer:"determined", wrong:["reluctant","afraid","embarrassed"] },
    { id:"x1", answer:"determined", wrong:["reluctant","afraid","embarrassed"] },
    { id:"x2", answer:"determined", wrong:["lazy","careless","discouraged"] }
  ],
  "discipline":[
    { id:"meaning_sentence", answer:"discipline", wrong:["laziness","forgiveness","nervousness"] },
    { id:"x1", answer:"discipline", wrong:["flexibility","laziness","generosity"] },
    { id:"x2", answer:"discipline", wrong:["panic","laziness","nervousness"] }
  ],
  "goal-oriented":[
    { id:"meaning_sentence", answer:"goal-oriented", wrong:["careless","forgetful","unenthusiastic"] },
    { id:"x2", answer:"goal-oriented", wrong:["distracted","careless","unenthusiastic"] },
    { id:"x3", answer:"goal-oriented", wrong:["careless","forgetful","unenthusiastic"] }
  ],
  "achievement":[
    { id:"meaning_sentence", answer:"achievement", wrong:["injury","accident","disappointment"] },
    { id:"x1", answer:"achievement", wrong:["disappointment","embarrassment","mistake"] },
    { id:"x2", answer:"achievement", wrong:["injury","mistake","disappointment"] }
  ],
  "elite":[
    { id:"x1", answer:"elite", wrong:["beginner","casual","recreational"] },
    { id:"x2", answer:"elite", wrong:["beginner","basic","casual"] },
    { id:"x3", answer:"elite", wrong:["casual","social","beginner"] }
  ],
  "overwhelming":[
    { id:"meaning_sentence", answer:"overwhelming", wrong:["weak","half-hearted","minimal"] },
    { id:"x1", answer:"overwhelming", wrong:["optional","accidental","annual"] },
    { id:"x2", answer:"overwhelming", wrong:["possible","optional","annual"] }
  ],
  "generation":[
    { id:"meaning_sentence", answer:"generation", wrong:["season","century","decade"] },
    { id:"x1", answer:"generation", wrong:["season","century","month"] },
    { id:"x2", answer:"generation", wrong:["season","century","month"] }
  ],
  "challenge":[
    { id:"meaning_sentence", answer:"challenge", wrong:["advantage","pleasure","benefit"] },
    { id:"x1", answer:"challenge", wrong:["advantage","relief","bargain"] },
    { id:"x2", answer:"challenge", wrong:["reward","holiday","timetable"] }
  ],
  "solution":[
    { id:"meaning_sentence", answer:"solution", wrong:["cause","complaint","penalty"] },
    { id:"x1", answer:"solution", wrong:["cause","complaint","penalty"] },
    { id:"x2", answer:"solution", wrong:["cause","excuse","complaint"] }
  ],
  "pastime":[
    { id:"meaning_sentence", answer:"pastime", wrong:["career","duty","subject"] },
    { id:"x1", answer:"pastime", wrong:["profession","duty","uniform"] },
    { id:"x2", answer:"pastime", wrong:["meal","season","festival"] }
  ],
  "feat":[
    { id:"meaning_sentence", answer:"feat", wrong:["mistake","injury","accident"] },
    { id:"x1", answer:"feat", wrong:["injury","expense","delay"] },
    { id:"x2", answer:"feat", wrong:["failure","mistake","injury"] }
  ],
  "regardless":[
    { id:"meaning_sentence", answer:"regardless", wrong:["instead","apart","inside"] },
    { id:"x1", answer:"regardless", wrong:["instead","apart","inside"] },
    { id:"x2", answer:"regardless", wrong:["instead","apart","inside"] }
  ],
  "monetary":[
    { id:"meaning_sentence", answer:"monetary", wrong:["military","mandatory","medical"] },
    { id:"x1", answer:"monetary", wrong:["mandatory","momentary","mental"] },
    { id:"x2", answer:"monetary", wrong:["mandatory","military","medical"] }
  ],
  "estimated":[
    { id:"meaning_sentence", answer:"estimated", wrong:["rejected","forgotten","cancelled"] },
    { id:"x1", answer:"estimated", wrong:["rejected","forgotten","cancelled"] },
    { id:"x2", answer:"estimated", wrong:["unnecessary","overdue","ancient"] }
  ],
  "struggle":[
    { id:"base_inf", answer:"struggle", wrong:["avoid","finish","practise"] },
    { id:"third_inf", answer:"struggles", wrong:["avoids","finishes","practises"] },
    { id:"past_inf", answer:"struggled", wrong:["avoided","finished","practised"] },
    { id:"perfect_with", answer:"struggled", wrong:["argued","chatted","negotiated"] },
    { id:"third_with", answer:"struggles", wrong:["argues","chats","negotiates"] }
  ],
  "minimum":[
    { id:"meaning_sentence", answer:"minimum", wrong:["handful","mixture","section"] },
    { id:"x1", answer:"minimum", wrong:["maximum","average","tallest"] },
    { id:"x2", answer:"minimum", wrong:["maximum","couple","handful"] }
  ],
  "championship":[
    { id:"meaning_sentence", answer:"championship", wrong:["coach","whistle","stadium"] },
    { id:"x1", answer:"championship", wrong:["referee","trainer","whistle"] },
    { id:"x2", answer:"championship", wrong:["whistle","injury","trainer"] }
  ],
  "competitor":[
    { id:"meaning_sentence", answer:"competitor", wrong:["trophy","stopwatch","commentator"] },
    { id:"x1", answer:"competitor", wrong:["spectator","referee","commentator"] },
    { id:"x2", answer:"competitor", wrong:["trophy","stopwatch","commentator"] }
  ],
  "relatively":[
    { id:"meaning_sentence", answer:"relatively", wrong:["exactly","hardly","surprisingly"] },
    { id:"x1", answer:"relatively", wrong:["exactly","hardly","recently"] },
    { id:"x2", answer:"relatively", wrong:["annually","instantly","permanently"] }
  ],
  "patience":[
    { id:"meaning_sentence", answer:"patience", wrong:["laziness","anger","boredom"] },
    { id:"x1", answer:"patience", wrong:["luggage","height","distance"] },
    { id:"x2", answer:"patience", wrong:["noise","violence","hurry"] }
  ],
  "atmosphere":[
    { id:"meaning_sentence", answer:"atmosphere", wrong:["temperature","scoreboard","timetable"] },
    { id:"x1", answer:"atmosphere", wrong:["scoreboard","timetable","trophy"] },
    { id:"x2", answer:"atmosphere", wrong:["scoreboard","timetable","uniform"] }
  ],
  "incredible":[
    { id:"meaning_sentence", answer:"incredible", wrong:["slow","ordinary","disappointing"] },
    { id:"x1", answer:"incredible", wrong:["annual","empty","unremarkable"] },
    { id:"x2", answer:"incredible", wrong:["slow","expensive","predictable"] }
  ],
  "criteria":[
    { id:"meaning_sentence", answer:"criteria", wrong:["rewards","tickets","staff"] },
    { id:"x1", answer:"criteria", wrong:["trophies","whistles","staff"] },
    { id:"x2", answer:"criteria", wrong:["trophies","staff","holidays"] }
  ],
  "historic":[
    { id:"meaning_sentence", answer:"historic", wrong:["routine","forgettable","trivial"] },
    { id:"x1", answer:"historic", wrong:["forgettable","routine","trivial"] },
    { id:"x2", answer:"historic", wrong:["reasonable","honest","optional"] }
  ],
  "selection":[
    { id:"meaning_sentence", answer:"selection", wrong:["amount","number","quantity"] },
    { id:"x1", answer:"selection", wrong:["refusal","demand","result"] },
    { id:"x2", answer:"selection", wrong:["speed","weight","height"] }
  ],
  "produce":[
    { id:"base_noun", answer:"produce", wrong:["borrow","describe","advertise"] },
    { id:"third_noun", answer:"produces", wrong:["destroys","avoids","forgets"] },
    { id:"past_noun", answer:"produced", wrong:["avoided","forgot","purchased"] },
    { id:"perfect_noun", answer:"produced", wrong:["travelled","arrived","complained"] },
    { id:"passive_present", answer:"produced", wrong:["complained","escaped","arrived"] },
    { id:"passive_past", answer:"produced", wrong:["escaped","travelled","complained"] }
  ],
  "craftspeople":[
    { id:"meaning_sentence", answer:"craftspeople", wrong:["spectators","customers","staff"] },
    { id:"x1", answer:"craftspeople", wrong:["spectators","customers","staff"] },
    { id:"x2", answer:"craftspeople", wrong:["spectators","customers","staff"] }
  ],
  "significant":[
    { id:"meaning_sentence", answer:"significant", wrong:["slight","minor","tiny"] },
    { id:"x1", answer:"significant", wrong:["slight","tiny","small"] },
    { id:"x2", answer:"significant", wrong:["disappointing","negative","dangerous"] }
  ],
  "expansion":[
    { id:"meaning_sentence", answer:"expansion", wrong:["reduction","closure","decline"] },
    { id:"x1", answer:"expansion", wrong:["closure","reduction","decline"] },
    { id:"x2", answer:"expansion", wrong:["reduction","closure","decline"] }
  ],
  "reputation":[
    { id:"meaning_sentence", answer:"reputation", wrong:["permission","salary","timetable"] },
    { id:"x1", answer:"reputation", wrong:["permission","uniform","timetable"] },
    { id:"x2", answer:"reputation", wrong:["permission","timetable","uniform"] }
  ],
  "reasonable":[
    { id:"meaning_sentence", answer:"reasonable", wrong:["excessive","enormous","unaffordable"] },
    { id:"x1", answer:"reasonable", wrong:["ridiculous","terrible","huge"] },
    { id:"x2", answer:"reasonable", wrong:["silly","foolish","absurd"] }
  ],
  "antiques":[
    { id:"meaning_sentence", answer:"antiques", wrong:["rumours","injuries","deadlines"] },
    { id:"x1", answer:"antiques", wrong:["rumours","bruises","deadlines"] },
    { id:"x2", answer:"antiques", wrong:["rumours","injuries","storms"] }
  ],
});
