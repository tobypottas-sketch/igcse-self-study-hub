const unit1GrammarSupplement = Object.freeze({
  avoid:{
    grammarForms:{ base:'avoid', thirdPerson:'avoids', past:'avoided', pastParticiple:'avoided', ing:'avoiding' },
    grammarPatterns:['avoid + noun','avoid + -ing'],
    retrievalContexts:[
      { id:'base_noun', text:'Athletes should avoid unnecessary risks when returning from injury.', target:'avoid', grammarPattern:'avoid + noun' },
      { id:'third_ing', text:'She avoids training outdoors when the air quality is poor.', target:'avoids', grammarPattern:'avoid + -ing' },
      { id:'past_noun', text:'The team avoided unnecessary risks in the final.', target:'avoided', grammarPattern:'avoid + noun' },
      { id:'perfect_ing', text:'He has avoided competing since the injury became painful.', target:'avoided', grammarPattern:'avoid + -ing' },
      { id:'ing_noun', text:'Avoiding injury requires careful preparation and recovery.', target:'Avoiding', grammarPattern:'avoid + noun' },
      { id:'plural_ing', text:'Experienced runners avoid increasing their distance too quickly.', target:'avoid', grammarPattern:'avoid + -ing' }
    ]
  },
  afford:{
    grammarForms:{ base:'afford', thirdPerson:'affords', past:'afforded', pastParticiple:'afforded', ing:'affording' },
    grammarPatterns:['can/could afford + noun','can/could afford + to-infinitive'],
    retrievalContexts:[
      { id:'present_noun', text:'Many families cannot afford expensive sports equipment.', target:'afford', grammarPattern:'can/could afford + noun' },
      { id:'present_inf', text:'The club can afford to replace the damaged goalposts this year.', target:'afford', grammarPattern:'can/could afford + to-infinitive' },
      { id:'past_noun', text:'Last season, the school could not afford a new athletics track.', target:'afford', grammarPattern:'can/could afford + noun' },
      { id:'past_inf', text:'Without the grant, the team could not afford to travel to the final.', target:'afford', grammarPattern:'can/could afford + to-infinitive' },
      { id:'question_noun', text:'Can the centre afford the higher cost of maintaining the pool?', target:'afford', grammarPattern:'can/could afford + noun' },
      { id:'future_inf', text:'With more sponsorship, the club may be able to afford to hire another coach.', target:'afford', grammarPattern:'can/could afford + to-infinitive' }
    ]
  },
  deny:{
    grammarForms:{ base:'deny', thirdPerson:'denies', past:'denied', pastParticiple:'denied', ing:'denying' },
    grammarPatterns:['deny + -ing','deny + that-clause'],
    retrievalContexts:[
      { id:'base_ing', text:'Players sometimes deny breaking a rule even when video evidence is clear.', target:'deny', grammarPattern:'deny + -ing' },
      { id:'third_ing', text:'The athlete denies using any banned substance.', target:'denies', grammarPattern:'deny + -ing' },
      { id:'past_that', text:'The athlete denied that he had used a banned substance.', target:'denied', grammarPattern:'deny + that-clause' },
      { id:'perfect_that', text:'Several officials have denied that the event was unsafe.', target:'denied', grammarPattern:'deny + that-clause' },
      { id:'past_perfect_ing', text:'The player had denied touching the ball before the replay was shown.', target:'denied', grammarPattern:'deny + -ing' },
      { id:'ing_that', text:'Denying that a problem exists will not make it disappear.', target:'Denying', grammarPattern:'deny + that-clause' }
    ]
  },
  permit:{
    grammarForms:{ base:'permit', thirdPerson:'permits', past:'permitted', pastParticiple:'permitted', ing:'permitting' },
    grammarPatterns:['permit + object + to-infinitive','permit + -ing','be permitted + to-infinitive'],
    retrievalContexts:[
      { id:'base_object', text:'The rules permit students to use the gym after lessons.', target:'permit', grammarPattern:'permit + object + to-infinitive' },
      { id:'third_ing', text:'The centre permits using personal equipment in the training area.', target:'permits', grammarPattern:'permit + -ing' },
      { id:'past_object', text:'The referee permitted play to continue after the delay.', target:'permitted', grammarPattern:'permit + object + to-infinitive' },
      { id:'passive_present', text:'Students are permitted to enter the sports hall from 7 a.m.', target:'permitted', grammarPattern:'be permitted + to-infinitive' },
      { id:'passive_past', text:'Spectators were not permitted to stand beside the track.', target:'permitted', grammarPattern:'be permitted + to-infinitive' },
      { id:'ing', text:'Permitting spectators to enter the warm-up area would create a safety risk.', target:'Permitting', grammarPattern:'permit + object + to-infinitive' }
    ]
  },
  arrange:{
    grammarForms:{ base:'arrange', thirdPerson:'arranges', past:'arranged', pastParticiple:'arranged', ing:'arranging' },
    grammarPatterns:['arrange + noun','arrange + to-infinitive','arrange for + object + to-infinitive'],
    retrievalContexts:[
      { id:'base_noun', text:'Parents often arrange transport to weekend tournaments.', target:'arrange', grammarPattern:'arrange + noun' },
      { id:'third_for', text:'The coach arranges for a physiotherapist to attend major matches.', target:'arranges', grammarPattern:'arrange for + object + to-infinitive' },
      { id:'past_noun', text:'The school arranged an extra practice session before the final.', target:'arranged', grammarPattern:'arrange + noun' },
      { id:'perfect_to', text:'The players have arranged to meet at the stadium entrance.', target:'arranged', grammarPattern:'arrange + to-infinitive' },
      { id:'past_for', text:'The organiser arranged for volunteers to guide spectators to their seats.', target:'arranged', grammarPattern:'arrange for + object + to-infinitive' },
      { id:'ing_noun', text:'Arranging a large tournament takes careful planning.', target:'Arranging', grammarPattern:'arrange + noun' }
    ]
  },
  urge:{
    grammarForms:{ base:'urge', thirdPerson:'urges', past:'urged', pastParticiple:'urged', ing:'urging' },
    grammarPatterns:['urge + object + to-infinitive','be urged + to-infinitive'],
    retrievalContexts:[
      { id:'base_active', text:'Doctors urge teenagers to stay active for their health.', target:'urge', grammarPattern:'urge + object + to-infinitive' },
      { id:'third_active', text:'The coach urges every player to drink enough water.', target:'urges', grammarPattern:'urge + object + to-infinitive' },
      { id:'past_active', text:'Officials urged spectators to leave the area calmly.', target:'urged', grammarPattern:'urge + object + to-infinitive' },
      { id:'perfect_active', text:'Health experts have urged schools to protect daily exercise time.', target:'urged', grammarPattern:'urge + object + to-infinitive' },
      { id:'passive_present', text:'Young athletes are urged to report pain rather than train through it.', target:'urged', grammarPattern:'be urged + to-infinitive' },
      { id:'passive_past', text:'The injured runner was urged to rest for several days.', target:'urged', grammarPattern:'be urged + to-infinitive' }
    ]
  },
  recommend:{
    grammarForms:{ base:'recommend', thirdPerson:'recommends', past:'recommended', pastParticiple:'recommended', ing:'recommending' },
    grammarPatterns:['recommend + -ing','recommend + noun + to + person','recommend + that-clause'],
    retrievalContexts:[
      { id:'base_noun', text:'I recommend this activity to anyone who enjoys outdoor sport.', target:'recommend', grammarPattern:'recommend + noun + to + person' },
      { id:'third_ing', text:'The trainer recommends stretching before intense exercise.', target:'recommends', grammarPattern:'recommend + -ing' },
      { id:'past_noun', text:'The physiotherapist recommended a week of light training to the athlete.', target:'recommended', grammarPattern:'recommend + noun + to + person' },
      { id:'perfect_ing', text:'Several coaches have recommended reducing the number of hard sessions.', target:'recommended', grammarPattern:'recommend + -ing' },
      { id:'third_that', text:'The doctor recommends that the player rests until the swelling has gone.', target:'recommends', grammarPattern:'recommend + that-clause' },
      { id:'past_that', text:'The committee recommended that the school improve the changing facilities.', target:'recommended', grammarPattern:'recommend + that-clause' }
    ]
  },
  demand:{
    grammarForms:{ base:'demand', thirdPerson:'demands', past:'demanded', pastParticiple:'demanded', ing:'demanding' },
    grammarPatterns:['demand + noun','demand + that-clause'],
    retrievalContexts:[
      { id:'base_noun', text:'Competitive sport can demand a great deal of time and discipline.', target:'demand', grammarPattern:'demand + noun' },
      { id:'third_noun', text:'Long-distance running demands careful preparation.', target:'demands', grammarPattern:'demand + noun' },
      { id:'past_noun', text:'The final demanded complete concentration from every player.', target:'demanded', grammarPattern:'demand + noun' },
      { id:'perfect_noun', text:'The tournament has demanded more organisation than expected.', target:'demanded', grammarPattern:'demand + noun' },
      { id:'past_that', text:'The captain demanded that the team arrive on time for training.', target:'demanded', grammarPattern:'demand + that-clause' },
      { id:'third_that', text:'The coach demands that every player follows the safety rules.', target:'demands', grammarPattern:'demand + that-clause' }
    ]
  },
  threaten:{
    grammarForms:{ base:'threaten', thirdPerson:'threatens', past:'threatened', pastParticiple:'threatened', ing:'threatening' },
    grammarPatterns:['threaten + noun','threaten + to-infinitive'],
    retrievalContexts:[
      { id:'base_noun', text:'Serious injuries can threaten an athlete’s career.', target:'threaten', grammarPattern:'threaten + noun' },
      { id:'third_noun', text:'Poor funding threatens the future of the community club.', target:'threatens', grammarPattern:'threaten + noun' },
      { id:'past_noun', text:'A serious injury threatened her place in the championship.', target:'threatened', grammarPattern:'threaten + noun' },
      { id:'perfect_noun', text:'Bad weather has threatened several outdoor events this season.', target:'threatened', grammarPattern:'threaten + noun' },
      { id:'past_inf', text:'The organisers threatened to cancel the match if the pitch remained unsafe.', target:'threatened', grammarPattern:'threaten + to-infinitive' },
      { id:'third_inf', text:'The storm threatens to delay the start of the race.', target:'threatens', grammarPattern:'threaten + to-infinitive' }
    ]
  },
  resent:{
    grammarForms:{ base:'resent', thirdPerson:'resents', past:'resented', pastParticiple:'resented', ing:'resenting' },
    grammarPatterns:['resent + noun','resent + -ing','resent + object + -ing'],
    retrievalContexts:[
      { id:'base_noun', text:'Some players resent decisions they believe are unfair.', target:'resent', grammarPattern:'resent + noun' },
      { id:'third_ing', text:'He resents being left out of the team.', target:'resents', grammarPattern:'resent + -ing' },
      { id:'past_ing', text:'He resented being left out despite training hard.', target:'resented', grammarPattern:'resent + -ing' },
      { id:'past_object_ing', text:'She resented the coach changing the training schedule without warning.', target:'resented', grammarPattern:'resent + object + -ing' },
      { id:'perfect_noun', text:'Some supporters have resented the higher ticket prices this season.', target:'resented', grammarPattern:'resent + noun' },
      { id:'ing_object', text:'Resenting teammates receiving praise can damage team relationships.', target:'Resenting', grammarPattern:'resent + object + -ing' }
    ]
  },
  regret:{
    grammarForms:{ base:'regret', thirdPerson:'regrets', past:'regretted', pastParticiple:'regretted', ing:'regretting' },
    grammarPatterns:['regret + -ing','regret + that-clause'],
    retrievalContexts:[
      { id:'base_ing', text:'Some athletes regret leaving a team too early.', target:'regret', grammarPattern:'regret + -ing' },
      { id:'third_ing', text:'She regrets missing the chance to enter the tournament.', target:'regrets', grammarPattern:'regret + -ing' },
      { id:'past_ing', text:'She regretted missing the chance to enter the tournament.', target:'regretted', grammarPattern:'regret + -ing' },
      { id:'perfect_that', text:'He has regretted that decision since the season ended.', target:'regretted', grammarPattern:'regret + that-clause' },
      { id:'past_that', text:'The captain regretted that the argument had distracted the team.', target:'regretted', grammarPattern:'regret + that-clause' },
      { id:'ing_ing', text:'Regretting leaving the club will not change the decision now.', target:'Regretting', grammarPattern:'regret + -ing' }
    ]
  },
  struggle:{
    grammarForms:{ base:'struggle', thirdPerson:'struggles', past:'struggled', pastParticiple:'struggled', ing:'struggling' },
    grammarPatterns:['struggle + to-infinitive','struggle with + noun'],
    retrievalContexts:[
      { id:'base_inf', text:'Some beginners struggle to maintain their balance on the board.', target:'struggle', grammarPattern:'struggle + to-infinitive' },
      { id:'third_inf', text:'A new player often struggles to control the ball at first.', target:'struggles', grammarPattern:'struggle + to-infinitive' },
      { id:'past_inf', text:'The team struggled to create chances in the first half.', target:'struggled', grammarPattern:'struggle + to-infinitive' },
      { id:'perfect_with', text:'The goalkeeper has struggled with a shoulder injury all season.', target:'struggled', grammarPattern:'struggle with + noun' },
      { id:'third_with', text:'She sometimes struggles with the pressure of important matches.', target:'struggles', grammarPattern:'struggle with + noun' },
      { id:'ing_with', text:'Struggling with a new skill is a normal part of learning.', target:'Struggling', grammarPattern:'struggle with + noun' }
    ]
  },
  produce:{
    grammarForms:{ base:'produce', thirdPerson:'produces', past:'produced', pastParticiple:'produced', ing:'producing' },
    grammarPatterns:['produce + noun','be produced + passive'],
    retrievalContexts:[
      { id:'base_noun', text:'Local craftspeople produce equipment by hand for traditional sports.', target:'produce', grammarPattern:'produce + noun' },
      { id:'third_noun', text:'The workshop produces specialist equipment for local teams.', target:'produces', grammarPattern:'produce + noun' },
      { id:'past_noun', text:'The factory produced five hundred racquets last year.', target:'produced', grammarPattern:'produce + noun' },
      { id:'perfect_noun', text:'The company has produced protective equipment for more than twenty years.', target:'produced', grammarPattern:'produce + noun' },
      { id:'passive_present', text:'These racquets are produced by local craftspeople using traditional methods.', target:'produced', grammarPattern:'be produced + passive' },
      { id:'passive_past', text:'The medals were produced in a small workshop near the stadium.', target:'produced', grammarPattern:'be produced + passive' }
    ]
  }
});

export default unit1GrammarSupplement;
