const status = 'approved';
const unitNumber = 1;

function phrase(id, originalPhrase, equivalentPhrase, linkedVocabularyIds, { acceptedVariants = [], chunks = null, distortions = [] } = {}) {
  return {
    activityContentId:`u1_phrase_${id}`, unitNumber, contentType:'phrase_set', status,
    activityData:{
      originalPhrase, equivalentPhrase, acceptedVariants,
      chunks:chunks ?? equivalentPhrase.split(/\s+/),
      commonMeaningDistortions:distortions,
      linkedVocabularyIds,
      primaryEvidenceTargetId:linkedVocabularyIds.length === 1 ? linkedVocabularyIds[0] : undefined
    }
  };
}

function idea(id, originalIdea, accurateParaphrase, invariantType, invariantValue, distractors, linkedVocabularyIds = []) {
  return {
    activityContentId:`u1_idea_${id}`, unitNumber, contentType:'idea_set', status,
    activityData:{
      originalIdea,
      accurateParaphrases:Array.isArray(accurateParaphrase) ? accurateParaphrase : [accurateParaphrase],
      meaningInvariants:[{ type:invariantType, value:invariantValue }],
      distractors,
      linkedVocabularyIds
    }
  };
}

function questionText(id, sourceText, questions, linkedVocabularyIds = []) {
  return {
    activityContentId:`u1_qt_${id}`, unitNumber, contentType:'question_text', status,
    activityData:{ sourceText, questions, linkedVocabularyIds }
  };
}

function writing(id, taskType, prompt, sourceText, acceptedAnswers, linkedVocabularyIds, primaryEvidenceTargetId = null) {
  return {
    activityContentId:`u1_writing_${id}`, unitNumber, contentType:'writing_set', status,
    activityData:{
      taskType, prompt, sourceText, acceptedAnswers, linkedVocabularyIds,
      ...(primaryEvidenceTargetId ? { primaryEvidenceTargetId } : {})
    }
  };
}

const phraseSets = [
  phrase('leisure_time','time when you are not working or studying','leisure time',['vocab_leisure'],{ acceptedVariants:['free time','spare time'], distortions:['scheduled working time','compulsory study time','organised training time'] }),
  phrase('cannot_afford','do not have enough money to pay for','cannot afford',['vocab_afford'],{ acceptedVariants:['are unable to afford'], chunks:['cannot','afford'], distortions:['choose not to pay for','borrow money to buy','have enough money for'] }),
  phrase('urge_students','strongly encourage students to','urge students to',['vocab_urge'],{ acceptedVariants:['press students to'], chunks:['urge','students','to'], distortions:['allow students to','force students to','prevent students from'] }),
  phrase('demand_time','require a great deal of time','demand a great deal of time',['vocab_demand'],{ acceptedVariants:['need a great deal of time'], chunks:['demand','a great deal of','time'], distortions:['save a great deal of time','use almost no time','reduce the amount of time'] }),
  phrase('threaten_place','put her place in the team at risk','threaten her place in the team',['vocab_threaten'],{ chunks:['threaten','her place','in the team'], distortions:['guarantee her place in the team','secure her place in the team','leave her place in the team unchanged'] }),
  phrase('determined_finish','strongly motivated to finish','determined to finish',['vocab_determined'],{ acceptedVariants:['resolved to finish'], chunks:['determined','to finish'], distortions:['uncertain about finishing','forced to finish','unwilling to finish'] }),
  phrase('goal_oriented','focused on achieving clear aims','focused on clear goals',['vocab_goal_oriented'],{ acceptedVariants:['goal-oriented','focused on goals'], chunks:['focused','on','clear goals'], distortions:['easily distracted from goals','working without clear aims','focused only on distractions'] }),
  phrase('major_achievement','an important accomplishment','a major achievement',['vocab_achievement'],{ acceptedVariants:['a significant achievement'], chunks:['a','major','achievement'], distortions:['an unsuccessful attempt','an ordinary routine','a minor setback'] }),
  phrase('elite_athletes','top-level athletes','elite athletes',['vocab_elite'],{ acceptedVariants:['highest-level athletes'], chunks:['elite','athletes'], distortions:['beginner athletes','recreational athletes','average spectators'] }),
  phrase('serious_challenge','a difficult task that tests ability','a serious challenge',['vocab_challenge'],{ acceptedVariants:['a major challenge'], chunks:['a','serious','challenge'], distortions:['a simple routine','an easy task','a guaranteed reward'] }),
  phrase('regardless_rain','despite the light rain','regardless of the light rain',['vocab_regardless'],{ acceptedVariants:['in spite of the light rain'], chunks:['regardless','of','the light rain'], distortions:['because of the light rain','only if it rains','as a result of the light rain'] }),
  phrase('minimum_three','at least three sessions','a minimum of three sessions',['vocab_minimum'],{ acceptedVariants:['no fewer than three sessions'], chunks:['a minimum','of three','sessions'], distortions:['no more than three sessions','exactly three sessions only','fewer than three sessions'] })
];

const ideaSets = [
  idea('preference','Mina has a preference for individual sports rather than team games.',['Mina likes individual sports more than team games.','Mina would rather play individual sports than team games.','Mina favours taking part in individual sports over team games.'],'comparison','individual sports preferred to team games',[
    { text:'Mina likes team games more than individual sports.', misconceptionCategory:'meaning_confusion' },
    { text:'Mina likes individual sports and team games equally.', misconceptionCategory:'degree_change' },
    { text:'Mina only takes part in team games and avoids individual sports.', misconceptionCategory:'added_information' }
  ],['vocab_preference']),
  idea('deny','The athlete denied using any banned substance.',['The athlete said it was not true that he had used a banned substance.','The athlete rejected the claim that he had used a banned substance.','The athlete stated that he had not used any banned substance.'],'polarity','claim is rejected',[
    { text:'The athlete admitted that he had used a banned substance.', misconceptionCategory:'meaning_confusion' },
    { text:'The athlete refused to comment on whether he had used a banned substance.', misconceptionCategory:'omitted_information' },
    { text:'The athlete confirmed the claim that he had used a banned substance.', misconceptionCategory:'meaning_confusion' }
  ],['vocab_deny']),
  idea('permit','The club does not permit spectators to enter the training area.',['Spectators are not allowed to go into the training area.','The club does not let spectators into the training area.','Entry to the training area is not allowed for spectators.'],'polarity','permission is refused',[
    { text:'Spectators are allowed to enter the training area whenever they want.', misconceptionCategory:'meaning_confusion' },
    { text:'Only the coaches are forbidden from entering the training area.', misconceptionCategory:'meaning_confusion' },
    { text:'Spectators are required to enter the training area before practice.', misconceptionCategory:'meaning_confusion' }
  ],['vocab_permit']),
  idea('intense','The final ten minutes of the match were intense.',['The last ten minutes of the match were extremely demanding.','The match was extremely demanding in its final ten minutes.','The final ten minutes of the game were extremely demanding.'],'degree','very strong or demanding',[
    { text:'The final ten minutes of the match were calm and relaxed.', misconceptionCategory:'degree_change' },
    { text:'Only the first ten minutes of the match were extremely demanding.', misconceptionCategory:'time_change' },
    { text:'The final ten minutes of the match were only slightly demanding.', misconceptionCategory:'degree_change' }
  ],['vocab_intense']),
  idea('tournament','Teams from eight schools entered the regional tournament.',['Eight schools sent teams to take part in the regional competition.','Eight schools put their teams into the regional competition.','The regional competition included teams from eight schools.'],'quantity','eight schools',[
    { text:'Teams from every school in the region entered the tournament.', misconceptionCategory:'quantity_change' },
    { text:'Eight individual students entered one regional match.', misconceptionCategory:'meaning_confusion' },
    { text:'Eight schools watched the regional competition but did not enter teams.', misconceptionCategory:'meaning_confusion' }
  ],['vocab_tournament']),
  idea('discipline','Daily training requires discipline as well as ability.',['Training every day needs self-control in addition to ability.','Both self-control and ability are needed for daily training.','Daily training depends on self-control as well as ability.'],'addition','self-control and ability are both required',[
    { text:'Ability alone is enough for someone who trains every day.', misconceptionCategory:'omitted_information' },
    { text:'Self-control is needed for daily training, but ability is unnecessary.', misconceptionCategory:'omitted_information' },
    { text:'Occasional training requires ability but no consistent self-control.', misconceptionCategory:'time_change' }
  ],['vocab_discipline']),
  idea('overwhelming','The support from the crowd was overwhelming during the final.',['During the final, the crowd gave support that was extremely powerful.','During the final, the support from the crowd was extremely strong.','The support the crowd gave during the final was extremely strong.'],'degree','support is extremely strong',[
    { text:'The crowd gave only a small amount of support during the final.', misconceptionCategory:'degree_change' },
    { text:'The crowd support during the final was noticeable but easy to manage.', misconceptionCategory:'degree_change' },
    { text:'The crowd gave extremely powerful support before the final but not during it.', misconceptionCategory:'time_change' }
  ],['vocab_overwhelming']),
  idea('generation','A new generation of players is entering the professional game.',['A younger age group of players is beginning to compete professionally.','A younger group of players is starting to play professionally.','Players from a younger age group are now joining the professional game.'],'time_group','younger age group',[
    { text:'Only one new player is entering the professional game.', misconceptionCategory:'quantity_change' },
    { text:'An older age group of players is beginning to compete professionally.', misconceptionCategory:'meaning_confusion' },
    { text:'A younger age group of players is leaving professional competition.', misconceptionCategory:'meaning_confusion' }
  ],['vocab_generation']),
  idea('solution','The club found a solution to the shortage of training space.',['The club found a way to deal with not having enough training space.','The club worked out how to solve its shortage of training space.','The club found an answer to its lack of training space.'],'cause_effect','solution addresses shortage',[
    { text:'The shortage of training space was caused by the club’s solution.', misconceptionCategory:'cause_effect_change' },
    { text:'The club decided to ignore the shortage of training space.', misconceptionCategory:'omitted_information' },
    { text:'The club made the shortage of training space more difficult to solve.', misconceptionCategory:'cause_effect_change' }
  ],['vocab_solution']),
  idea('pastime','Cycling began as a pastime before it became her profession.',['She first cycled as a hobby and later made it her career.','Cycling started as a hobby for her and later became her job.','Before cycling became her career, it was something she did for fun.'],'time','hobby came before profession',[
    { text:'Cycling became her profession before she tried it as a hobby.', misconceptionCategory:'time_change' },
    { text:'Cycling was always her profession and was never a hobby.', misconceptionCategory:'omitted_information' },
    { text:'Cycling remained only a hobby and never became her career.', misconceptionCategory:'omitted_information' }
  ],['vocab_pastime']),
  idea('estimated','The estimated cost of the new sports centre is five million dollars.',['The sports centre is expected to cost about five million dollars.','The cost of the new sports centre is approximately five million dollars.','The expected cost of the new sports centre is roughly five million dollars.'],'certainty','figure is approximate',[
    { text:'The sports centre definitely costs exactly five million dollars.', misconceptionCategory:'degree_change' },
    { text:'The sports centre has already cost exactly five million dollars.', misconceptionCategory:'time_change' },
    { text:'No one has made any approximate calculation of the sports centre’s cost.', misconceptionCategory:'meaning_confusion' }
  ],['vocab_estimated']),
  idea('relatively','The new sports centre is relatively small compared with the old stadium.',['Compared with the old stadium, the new sports centre is fairly small.','The new sports centre is comparatively small when set against the old stadium.','The new sports centre is fairly small in comparison with the old stadium.'],'comparison','size is judged relative to old stadium',[
    { text:'The new sports centre is extremely small in every possible comparison.', misconceptionCategory:'degree_change' },
    { text:'The new sports centre and the old stadium are exactly the same size.', misconceptionCategory:'meaning_confusion' },
    { text:'Compared with the new sports centre, the old stadium is fairly small.', misconceptionCategory:'meaning_confusion' }
  ],['vocab_relatively'])
];

const questionTextSets = [
  questionText('training_costs','A local club wanted to replace its training equipment, but the original plan was too expensive. Instead, members repaired several machines and bought only the items that could not be fixed.',[
    { question:'Why did the club change its original plan?', evidenceSpans:['the original plan was too expensive'], paraphraseLinks:[{ questionText:'Why did the club change its original plan?', sourceText:'the original plan was too expensive' }] },
    { question:'What did members do instead of replacing everything?', evidenceSpans:['members repaired several machines and bought only the items that could not be fixed'], paraphraseLinks:[{ questionText:'instead of replacing everything', sourceText:'repaired several machines and bought only the items that could not be fixed' }] }
  ],['vocab_afford','vocab_solution']),
  questionText('tournament_entry','The regional tournament attracted teams from eight schools. Competitors had to register before Friday, and anyone who missed the deadline was not permitted to take part.',[
    { question:'How many schools were represented?', evidenceSpans:['teams from eight schools'], paraphraseLinks:[{ questionText:'How many schools were represented?', sourceText:'teams from eight schools' }] },
    { question:'Who could not participate?', evidenceSpans:['anyone who missed the deadline was not permitted to take part'], paraphraseLinks:[{ questionText:'could not participate', sourceText:'was not permitted to take part' }] }
  ],['vocab_tournament','vocab_competitor','vocab_permit']),
  questionText('determined_runner','Lina fell behind early in the race, but she remained determined to finish. She ignored the urge to stop, kept a steady pace and crossed the line several minutes after the leading runners.',[
    { question:'What shows that Lina did not give up?', evidenceSpans:['she remained determined to finish'], paraphraseLinks:[{ questionText:'did not give up', sourceText:'remained determined to finish' }] },
    { question:'When did she finish compared with the leaders?', evidenceSpans:['several minutes after the leading runners'], paraphraseLinks:[{ questionText:'compared with the leaders', sourceText:'after the leading runners' }] }
  ],['vocab_determined','vocab_urge']),
  questionText('community_club','A community club has built a strong reputation for welcoming beginners. The atmosphere is friendly, fees are reasonable, and coaches recommend activities according to each member’s experience.',[
    { question:'Why might a beginner feel comfortable there?', evidenceSpans:['The atmosphere is friendly'], paraphraseLinks:[{ questionText:'feel comfortable', sourceText:'atmosphere is friendly' }] },
    { question:'How do coaches choose activities for members?', evidenceSpans:['according to each member’s experience'], paraphraseLinks:[{ questionText:'choose activities for members', sourceText:'according to each member’s experience' }] }
  ],['vocab_reputation','vocab_atmosphere','vocab_reasonable','vocab_recommend']),
  questionText('sports_centre','The estimated cost of the sports centre was high, so planners reduced the first phase of the project. Even after the change, the centre still included the minimum number of courts required for regional events.',[
    { question:'Why was the first phase made smaller?', evidenceSpans:['The estimated cost of the sports centre was high'], paraphraseLinks:[{ questionText:'Why was the first phase made smaller?', sourceText:'estimated cost ... was high' }] },
    { question:'What requirement did the revised plan still satisfy?', evidenceSpans:['the minimum number of courts required for regional events'], paraphraseLinks:[{ questionText:'requirement did the revised plan still satisfy', sourceText:'minimum number of courts required' }] }
  ],['vocab_estimated','vocab_minimum']),
  questionText('craft_market','At the weekend market, local craftspeople produce traditional wooden games by hand. Their work has gained a significant reputation, and some pieces are now collected as antiques rather than used for play.',[
    { question:'How are the traditional games made?', evidenceSpans:['by hand'], paraphraseLinks:[{ questionText:'How are the traditional games made?', sourceText:'by hand' }] },
    { question:'Why are some pieces no longer used for play?', evidenceSpans:['some pieces are now collected as antiques rather than used for play'], paraphraseLinks:[{ questionText:'no longer used for play', sourceText:'collected as antiques rather than used for play' }] }
  ],['vocab_craftspeople','vocab_produce','vocab_significant','vocab_antiques']),
  questionText('young_players','A younger generation of players has joined the league, creating rapid expansion in junior teams. Organisers say the growth is positive, although finding enough qualified coaches remains a challenge.',[
    { question:'What has caused junior teams to grow quickly?', evidenceSpans:['A younger generation of players has joined the league'], paraphraseLinks:[{ questionText:'caused junior teams to grow quickly', sourceText:'younger generation of players has joined' }] },
    { question:'What problem has not yet been solved?', evidenceSpans:['finding enough qualified coaches remains a challenge'], paraphraseLinks:[{ questionText:'problem has not yet been solved', sourceText:'remains a challenge' }] }
  ],['vocab_generation','vocab_expansion','vocab_challenge']),
  questionText('championship_pressure','Before the national championship, the team faced an intense training schedule. The captain said success depended on discipline and patience, especially when progress seemed relatively slow.',[
    { question:'What qualities did the captain say were necessary?', evidenceSpans:['discipline and patience'], paraphraseLinks:[{ questionText:'qualities ... necessary', sourceText:'depended on discipline and patience' }] },
    { question:'When were those qualities particularly important?', evidenceSpans:['when progress seemed relatively slow'], paraphraseLinks:[{ questionText:'particularly important', sourceText:'especially when progress seemed relatively slow' }] }
  ],['vocab_championship','vocab_intense','vocab_discipline','vocab_patience','vocab_relatively']),
  questionText('historic_win','The small club achieved a historic victory after defeating an elite opponent. Supporters described the result as an incredible feat because the team had struggled financially for several seasons.',[
    { question:'Why was the result especially impressive?', evidenceSpans:['the team had struggled financially for several seasons'], paraphraseLinks:[{ questionText:'Why was the result especially impressive?', sourceText:'struggled financially for several seasons' }] },
    { question:'How important was the victory to the club’s history?', evidenceSpans:['a historic victory'], paraphraseLinks:[{ questionText:'important ... to the club’s history', sourceText:'historic victory' }] }
  ],['vocab_historic','vocab_elite','vocab_incredible','vocab_feat','vocab_struggle']),
  questionText('activity_selection','The centre offers a wide selection of free-time activities, from racquet sports to crafts. Staff arrange short introductory sessions so that visitors can try unfamiliar activities before deciding which ones they prefer.',[
    { question:'Why are introductory sessions provided?', evidenceSpans:['visitors can try unfamiliar activities before deciding which ones they prefer'], paraphraseLinks:[{ questionText:'Why are introductory sessions provided?', sourceText:'try unfamiliar activities before deciding which ones they prefer' }] },
    { question:'What variety does the centre provide?', evidenceSpans:['a wide selection of free-time activities, from racquet sports to crafts'], paraphraseLinks:[{ questionText:'What variety does the centre provide?', sourceText:'wide selection ... from racquet sports to crafts' }] }
  ],['vocab_selection','vocab_leisure','vocab_racquet','vocab_arrange','vocab_unfamiliar','vocab_preference'])
];

const writingSets = [
  writing('avoid_repeat','improve_vocabulary','Replace the repeated general adjective with a more precise Unit 1 word.','The final was very strong and the pressure during the final was very strong.',['intense'],['vocab_intense'],'vocab_intense'),
  writing('achievement_collocation','collocation','Complete the phrase with the natural Unit 1 noun.','Winning the regional title was a major ____.',['achievement'],['vocab_achievement'],'vocab_achievement'),
  writing('selection_range','improve_vocabulary','Replace “many different choices” with a concise Unit 1 expression.','The sports centre offers many different choices of after-school activities.',['a wide selection','wide selection'],['vocab_selection'],'vocab_selection'),
  writing('reasonable_fee','collocation','Choose the natural adjective to describe a fair, not excessive price.','Students said the membership fee was ____.',['reasonable'],['vocab_reasonable'],'vocab_reasonable'),
  writing('word_family_compete','word_family','Use the correct form from the compete word family.','Each ____ must register before the race begins.',['competitor'],['vocab_competitor'],'vocab_competitor'),
  writing('word_family_determine','word_family','Use the correct form from the determine word family.','Her ____ helped her continue training after the injury.',['determination'],['vocab_determined'],'vocab_determined'),
  writing('significant_precision','improve_vocabulary','Replace the vague word “big” with a more precise Unit 1 adjective.','The programme produced a big improvement in attendance.',['significant'],['vocab_significant'],'vocab_significant'),
  writing('reputation_collocation','collocation','Complete the natural phrase using the Unit 1 noun.','The academy has built a strong ____ for developing young athletes.',['reputation'],['vocab_reputation'],'vocab_reputation')
];

export default [...phraseSets, ...ideaSets, ...questionTextSets, ...writingSets];