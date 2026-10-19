const unit1GrammarSupplement = Object.freeze({
  avoid:{
    grammarForms:{ base:'avoid', thirdPerson:'avoids', past:'avoided', pastParticiple:'avoided', ing:'avoiding' },
    grammarPatterns:['avoid doing something','avoid something'],
    retrievalContexts:[
      { id:'base', text:'Athletes should avoid training when they are injured.', target:'avoid' },
      { id:'third_person', text:'She avoids heavy training the day before a race.', target:'avoids' },
      { id:'past', text:'The team avoided unnecessary risks in the final.', target:'avoided' },
      { id:'ing', text:'Avoiding injury requires careful preparation and recovery.', target:'Avoiding' }
    ]
  },
  afford:{
    grammarForms:{ base:'afford', thirdPerson:'affords', past:'afforded', pastParticiple:'afforded', ing:'affording' },
    grammarPatterns:['can afford something','cannot afford to do something'],
    retrievalContexts:[
      { id:'base', text:'Many families cannot afford expensive sports equipment.', target:'afford' },
      { id:'third_person', text:'The club affords young players access to specialist coaching.', target:'affords' },
      { id:'past', text:'The grant afforded the school a chance to replace old equipment.', target:'afforded' },
      { id:'ing', text:'Affording regular private coaching is difficult for some families.', target:'Affording' }
    ]
  },
  deny:{
    grammarForms:{ base:'deny', thirdPerson:'denies', past:'denied', pastParticiple:'denied', ing:'denying' },
    grammarPatterns:['deny doing something','deny that + clause'],
    retrievalContexts:[
      { id:'base', text:'Players sometimes deny responsibility for breaking a rule.', target:'deny' },
      { id:'third_person', text:'The athlete denies using any banned substance.', target:'denies' },
      { id:'past', text:'The athlete denied that he had used a banned substance.', target:'denied' },
      { id:'perfect', text:'Several athletes have denied the accusation.', target:'denied' }
    ]
  },
  permit:{
    grammarForms:{ base:'permit', thirdPerson:'permits', past:'permitted', pastParticiple:'permitted', ing:'permitting' },
    grammarPatterns:['permit someone to do something','permit doing something'],
    retrievalContexts:[
      { id:'base', text:'The rules permit students to use the gym after lessons.', target:'permit' },
      { id:'third_person', text:'The centre permits members to book courts online.', target:'permits' },
      { id:'past', text:'The referee permitted play to continue after the delay.', target:'permitted' },
      { id:'ing', text:'Permitting spectators onto the track would create a safety risk.', target:'Permitting' }
    ]
  },
  arrange:{
    grammarForms:{ base:'arrange', thirdPerson:'arranges', past:'arranged', pastParticiple:'arranged', ing:'arranging' },
    grammarPatterns:['arrange something','arrange for someone to do something','arrange to do something'],
    retrievalContexts:[
      { id:'base', text:'Parents often arrange transport to weekend tournaments.', target:'arrange' },
      { id:'third_person', text:'The coach arranges an extra practice before important matches.', target:'arranges' },
      { id:'past', text:'The coach arranged an extra practice session before the final.', target:'arranged' },
      { id:'ing', text:'Arranging a large tournament takes careful planning.', target:'Arranging' }
    ]
  },
  urge:{
    grammarForms:{ base:'urge', thirdPerson:'urges', past:'urged', pastParticiple:'urged', ing:'urging' },
    grammarPatterns:['urge someone to do something'],
    retrievalContexts:[
      { id:'base', text:'Doctors urge teenagers to stay active for their health.', target:'urge' },
      { id:'third_person', text:'The coach urges every player to drink enough water.', target:'urges' },
      { id:'past', text:'Officials urged spectators to leave the area calmly.', target:'urged' },
      { id:'perfect', text:'Health experts have urged schools to protect daily exercise time.', target:'urged' }
    ]
  },
  recommend:{
    grammarForms:{ base:'recommend', thirdPerson:'recommends', past:'recommended', pastParticiple:'recommended', ing:'recommending' },
    grammarPatterns:['recommend doing something','recommend something to someone','recommend that + clause'],
    retrievalContexts:[
      { id:'base', text:'I recommend this activity to anyone who enjoys outdoor sport.', target:'recommend' },
      { id:'third_person', text:'The trainer recommends stretching before intense exercise.', target:'recommends' },
      { id:'past', text:'The physiotherapist recommended a week of light training.', target:'recommended' },
      { id:'perfect', text:'Several coaches have recommended the new training programme.', target:'recommended' }
    ]
  },
  demand:{
    grammarForms:{ base:'demand', thirdPerson:'demands', past:'demanded', pastParticiple:'demanded', ing:'demanding' },
    grammarPatterns:['demand something','demand that + clause'],
    retrievalContexts:[
      { id:'base', text:'Competitive sport can demand a great deal of time and discipline.', target:'demand' },
      { id:'third_person', text:'Long-distance running demands careful preparation.', target:'demands' },
      { id:'past', text:'The final demanded complete concentration from every player.', target:'demanded' },
      { id:'ing', text:'Demanding too much too soon can lead to injury.', target:'Demanding' }
    ]
  },
  threaten:{
    grammarForms:{ base:'threaten', thirdPerson:'threatens', past:'threatened', pastParticiple:'threatened', ing:'threatening' },
    grammarPatterns:['threaten something','threaten to do something'],
    retrievalContexts:[
      { id:'base', text:'Serious injuries can threaten an athlete’s career.', target:'threaten' },
      { id:'third_person', text:'Poor funding threatens the future of the community club.', target:'threatens' },
      { id:'past', text:'A serious injury threatened her place in the championship.', target:'threatened' },
      { id:'perfect', text:'Bad weather has threatened several outdoor events this season.', target:'threatened' }
    ]
  },
  resent:{
    grammarForms:{ base:'resent', thirdPerson:'resents', past:'resented', pastParticiple:'resented', ing:'resenting' },
    grammarPatterns:['resent doing something','resent someone doing something','resent something'],
    retrievalContexts:[
      { id:'base', text:'Some players resent decisions they believe are unfair.', target:'resent' },
      { id:'third_person', text:'He resents being left out of the team.', target:'resents' },
      { id:'past', text:'He resented being left out despite training hard.', target:'resented' },
      { id:'ing', text:'Resenting every decision can damage team relationships.', target:'Resenting' }
    ]
  },
  regret:{
    grammarForms:{ base:'regret', thirdPerson:'regrets', past:'regretted', pastParticiple:'regretted', ing:'regretting' },
    grammarPatterns:['regret doing something','regret that + clause'],
    retrievalContexts:[
      { id:'base', text:'Some athletes regret leaving a team too early.', target:'regret' },
      { id:'third_person', text:'She regrets missing the chance to enter the tournament.', target:'regrets' },
      { id:'past', text:'She regretted missing the chance to enter the tournament.', target:'regretted' },
      { id:'perfect', text:'He has regretted that decision since the season ended.', target:'regretted' }
    ]
  },
  struggle:{
    grammarForms:{ base:'struggle', thirdPerson:'struggles', past:'struggled', pastParticiple:'struggled', ing:'struggling' },
    grammarPatterns:['struggle to do something','struggle with something'],
    retrievalContexts:[
      { id:'base', text:'Some beginners struggle to maintain their balance on the board.', target:'struggle' },
      { id:'third_person', text:'A new player often struggles to control the ball at first.', target:'struggles' },
      { id:'past', text:'The team struggled to create chances in the first half.', target:'struggled' },
      { id:'ing', text:'Struggling with a new skill is a normal part of learning.', target:'Struggling' }
    ]
  },
  produce:{
    grammarForms:{ base:'produce', thirdPerson:'produces', past:'produced', pastParticiple:'produced', ing:'producing' },
    grammarPatterns:['produce something','produce something by hand'],
    retrievalContexts:[
      { id:'base', text:'Local craftspeople produce equipment by hand for traditional sports.', target:'produce' },
      { id:'third_person', text:'The workshop produces specialist equipment for local teams.', target:'produces' },
      { id:'past', text:'The factory produced five hundred racquets last year.', target:'produced' },
      { id:'ing', text:'Producing handmade equipment requires patience and skill.', target:'Producing' }
    ]
  }
});

export default unit1GrammarSupplement;