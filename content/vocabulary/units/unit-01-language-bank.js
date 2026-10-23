const diagnosed = (text, reason) => ({ text, reason });

export default Object.freeze({
  'leisure time':{
    definitionDistractors:[
      'time spent doing paid work or employment',
      'time reserved for lessons, homework, or study',
      'time spent travelling from one place to another',
      'a planned period of organised physical training',
      'time required to finish a particular task',
      'a break in activity caused by an unexpected delay'
    ],
    contexts:[
      {
        id:'leisure_ctx_1',
        text:'Many students use their ____ to play sport or meet friends.',
        answer:'leisure time',
        distractors:[
          diagnosed('study time','Fits grammatically, but the sentence describes time used for recreation rather than study.'),
          diagnosed('working hours','Fits grammatically, but the sentence describes time away from work.'),
          diagnosed('lesson time','Fits grammatically, but the activities happen outside lessons.')
        ]
      },
      {
        id:'leisure_ctx_2',
        text:'Longer working hours leave families with less ____ than they had ten years ago.',
        answer:'leisure time',
        distractors:[
          diagnosed('office space','Fits grammatically, but longer working hours reduce time for relaxing, not space.'),
          diagnosed('travel costs','Fits grammatically, but the sentence is about time left after work.'),
          diagnosed('free money','Fits grammatically, but the sentence is about time, not money.')
        ]
      },
      {
        id:'leisure_ctx_3',
        text:'Reading and gardening are popular ways for retired people to spend their ____.',
        answer:'leisure time',
        distractors:[
          diagnosed('working hours','Fits grammatically, but retired people no longer have working hours.'),
          diagnosed('school days','Fits grammatically, but the sentence concerns retired people.'),
          diagnosed('waiting time','Fits grammatically, but reading and gardening are chosen enjoyable activities, not time spent waiting.')
        ]
      },
      {
        id:'leisure_ctx_4',
        text:'The report examines how families spend their ____ at weekends.',
        answer:'leisure time',
        distractors:[
          diagnosed('working hours','Fits grammatically, but weekends are being discussed as time away from work.'),
          diagnosed('lesson time','Fits grammatically, but the sentence concerns family recreation rather than lessons.'),
          diagnosed('office time','Fits grammatically, but the report is about time away from employment.')
        ]
      },
      {
        id:'leisure_ctx_5',
        text:'Guests at the hotel can spend their ____ at the pool, the gym or the tennis court.',
        answer:'leisure time',
        distractors:[
          diagnosed('working time','Fits grammatically, but a pool, gym and tennis court are for recreation, not work.'),
          diagnosed('meeting time','Fits grammatically, but the places named are for recreation rather than meetings.'),
          diagnosed('study time','Fits grammatically, but the places named are for recreation rather than study.')
        ]
      },
      {
        id:'leisure_ctx_6',
        text:'She cycled in her ____ for years before turning professional.',
        answer:'leisure time',
        distractors:[
          diagnosed('working hours','Fits grammatically, but she was not yet a professional, so cycling was not her job.'),
          diagnosed('training camp','Fits grammatically, but the sentence contrasts casual cycling with turning professional later.'),
          diagnosed('exam period','Fits grammatically, but nothing in the sentence connects cycling to exams.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('She does leisure time every weekend.','leisure time is the free time itself, not an activity you do; name the activity you do in your leisure time.'),
      diagnosed('He has many leisure times after work.','leisure time is normally uncountable, so it has no plural.'),
      diagnosed('They leisure time at the sports centre.','leisure time is a noun phrase, not a verb; say they spend their leisure time at the sports centre.'),
      diagnosed('The club gives students a leisure time.','leisure time is normally uncountable, so it is not used with a.')
    ],
    patterns:['spend leisure time','leisure time activity','in your leisure time'],
    collocations:['spend leisure time','leisure time activities','enjoy leisure time'],
    contrasts:[
      diagnosed('work','work is time or activity connected with duties or employment; leisure time is time free from those duties.'),
      diagnosed('free time','free time is the closest everyday paraphrase of leisure time in this unit sense.')
    ]
  },
  avoid:{
    definitionDistractors:[
      'to stop something from happening before it begins',
      'to say no to something that someone offers you',
      'to pay no attention to something on purpose',
      'to do something later than you had planned to',
      'to get away from a place where you are in danger',
      'to leave something out when you are doing a task'
    ],
    contexts:[
      {
        id:'avoid_ctx_1',
        text:'Try to ____ eating a big meal just before you swim.',
        answer:'avoid',
        distractors:[
          diagnosed('hope','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('plan','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('decide','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'avoid_ctx_2',
        text:'The new bypass helps commuters ____ the busiest roads.',
        answer:'avoid',
        distractors:[
          diagnosed('improve','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('widen','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('repair','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'avoid_ctx_3',
        text:'Wear protective pads to ____ unnecessary injuries during training.',
        answer:'avoid',
        distractors:[
          diagnosed('risk','Grammatically fits, but means expose yourself to the possibility of injury.'),
          diagnosed('cause','Grammatically fits, but means make the injuries happen.'),
          diagnosed('report','Grammatically fits, but means describe the injuries after they happen.')
        ]
      },
      {
        id:'avoid_ctx_4',
        text:'She changed her route to ____ the roadworks near the stadium.',
        answer:'avoid',
        distractors:[
          diagnosed('admire','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('describe','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('advertise','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'avoid_ctx_5',
        text:'Doctors advise people to ____ sugary drinks whenever possible.',
        answer:'avoid',
        distractors:[
          diagnosed('choose','Grammatically fits, but means select the drinks.'),
          diagnosed('serve','Grammatically fits, but means provide the drinks to other people.'),
          diagnosed('buy','Grammatically fits, but means purchase the drinks.')
        ]
      },
      {
        id:'avoid_ctx_6',
        text:'To reduce stress, he tries to ____ arguments before important matches.',
        answer:'avoid',
        distractors:[
          diagnosed('start','Grammatically fits, but means begin the arguments.'),
          diagnosed('continue','Grammatically fits, but means keep the arguments going.'),
          diagnosed('win','Grammatically fits, but focuses on succeeding in an argument rather than keeping away from one.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('He avoided to go to the dentist.','avoid takes an -ing form, not an infinitive with to.'),
      diagnosed('She avoided from eating sweets.','avoid is not followed by from before an -ing form.'),
      diagnosed('The umbrella avoided us from getting wet.','prevent, not avoid, is used in the pattern prevent someone from doing something.'),
      diagnosed('They tried to avoid that the match was cancelled.','avoid does not normally take a that-clause in this pattern; use avoid + noun or avoid + -ing.')
    ],
    patterns:['avoid + noun','avoid + -ing','narrowly avoid'],
    collocations:['avoid injury','avoid conflict','best avoided'],
    contrasts:[
      diagnosed('prevent','prevent focuses on stopping an event from happening; avoid focuses on keeping away from an action, situation, person or thing.'),
      diagnosed('face','face is a useful meaning contrast: deal with something rather than keep away from it.')
    ]
  },
  preference:{
    definitionDistractors:[
      'a strong reason for choosing one option instead',
      'the freedom to choose between several options',
      'an opinion about which option is best for others',
      'a promise to choose one option at a later time',
      'the order in which a group chooses its options',
      'a complaint about the options you were offered'
    ],
    contexts:[
      {
        id:'preference_ctx_1',
        text:'The survey showed that most people have a strong ____ for fresh food over tinned food.',
        answer:'preference',
        distractors:[
          diagnosed('dislike','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('suspicion','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('disagreement','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'preference_ctx_2',
        text:'When I booked the flight, the website asked whether I had a ____ for a window or an aisle seat.',
        answer:'preference',
        distractors:[
          diagnosed('complaint','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('punishment','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('refund','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'preference_ctx_3',
        text:'List the three clubs in order of ____, starting with the one you would most like to join.',
        answer:'preference',
        distractors:[
          diagnosed('size','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('cost','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('age','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'preference_ctx_4',
        text:'My brother has a ____ for science fiction, so I bought him a novel from that section.',
        answer:'preference',
        distractors:[
          diagnosed('dislike','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('contempt','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('disagreement','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'preference_ctx_5',
        text:'Her ____ is for coursework rather than exams, because she says she works better without time pressure.',
        answer:'preference',
        distractors:[
          diagnosed('dislike','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('complaint','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('disappointment','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'preference_ctx_6',
        text:'Which team you support is simply a matter of personal ____.',
        answer:'preference',
        distractors:[
          diagnosed('income','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('safety','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('fitness','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('She preferences quiet places.','preference is a noun; the verb is prefer.'),
      diagnosed('I have more preference for tea than for coffee.','the normal pattern is a stronger preference for tea, or simply I prefer tea to coffee.'),
      diagnosed('He prefers swimming than running.','prefer X to Y uses to, not than.'),
      diagnosed('My preference is more tea than coffee.','the normal pattern is a preference for X over Y, or my preference is for X rather than Y.')
    ],
    patterns:['a preference for + noun','a preference for X over Y','in order of preference'],
    collocations:['personal preference','express a preference','strong preference'],
    contrasts:[
      diagnosed('priority','priority is what matters most or must be done first; preference is what you like more.'),
      diagnosed('option','an option is a choice that is available; a preference is the option you favour.')
    ]
  },
  afford:{
    definitionDistractors:[
      'to be willing to pay a lot of money for something',
      'to want something very much but be unable to get it',
      'to borrow money so that you can buy something',
      'to ask another person to pay for something',
      'to pay less money than something normally costs',
      'to save money slowly for something you want'
    ],
    contexts:[
      {
        id:'afford_ctx_1',
        text:'The club had to cancel the trip because it could no longer ____ the cost of the coach.',
        answer:'afford',
        distractors:[
          diagnosed('state','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('advertise','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('announce','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'afford_ctx_2',
        text:'My parents would love a bigger house, but they simply cannot ____ one on a teacher’s salary.',
        answer:'afford',
        distractors:[
          diagnosed('design','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('inspect','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('describe','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'afford_ctx_3',
        text:'Students who work every evening to pay their rent cannot ____ to spend long hours on revision.',
        answer:'afford',
        distractors:[
          diagnosed('hope','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('threaten','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('deserve','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'afford_ctx_4',
        text:'The council lowered the entry fee so that more families could ____ the price of a day at the leisure centre.',
        answer:'afford',
        distractors:[
          diagnosed('state','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('calculate','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('question','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'afford_ctx_5',
        text:'She took a second job because her salary was too low and she could not ____ to fall behind with the rent.',
        answer:'afford',
        distractors:[
          diagnosed('hope','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('deserve','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('volunteer','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'afford_ctx_6',
        text:'A new phone is not something we can ____ right now, so we will wait until next year.',
        answer:'afford',
        distractors:[
          diagnosed('check','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('describe','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('photograph','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('I cannot afford buying a new bike.','afford is followed by to + infinitive or a noun, not an -ing form.'),
      diagnosed('They could not afford the money.','you afford a thing such as a house or a ticket, not the money itself.'),
      diagnosed('He afforded to pay the fees.','afford is normally used with can, could or be able to, so use he could afford to pay.'),
      diagnosed('We cannot afford that we buy tickets.','afford is not followed by a that-clause.')
    ],
    patterns:['can / cannot afford + noun','can / cannot afford to + infinitive','be able to afford'],
    collocations:['cannot afford to lose','afford the time','can easily afford'],
    contrasts:[
      diagnosed('buy','buy means pay for something; afford means have enough money or time to be able to.'),
      diagnosed('owe','owe means have to pay money back; afford is about having enough to pay in the first place.')
    ]
  },
  deny:{
    definitionDistractors:[
      'to say that something is true',
      'to refuse to give something to someone',
      'to admit that something was your fault',
      'to keep something secret from other people',
      'to say sorry for something you did',
      'to pretend not to see something'
    ],
    contexts:[
      {
        id:'deny_ctx_1',
        text:'The company continues to ____ any responsibility for the accident, despite the evidence.',
        answer:'deny',
        distractors:[
          diagnosed('take','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('assume','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('admit','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'deny_ctx_2',
        text:'Both players ____ breaking the rules, but the video clearly shows that they did.',
        answer:'deny',
        distractors:[
          diagnosed('admit','Fits grammatically, but admit means agree it is true, but the but-clause shows the players say the opposite.'),
          diagnosed('regret','Fits grammatically, but regret means feel sorry, which would mean they accept they broke the rules.'),
          diagnosed('risk','Fits grammatically, but risk means do something that might cause harm; the sentence is about what the players say they did.')
        ]
      },
      {
        id:'deny_ctx_3',
        text:'The singer’s agent issued a statement to ____ the rumour that she was leaving the band, saying it was completely false.',
        answer:'deny',
        distractors:[
          diagnosed('confirm','Fits grammatically, but confirm means say it is true, but the statement says the rumour is false.'),
          diagnosed('spread','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('post','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'deny_ctx_4',
        text:'Shown the photograph, she still continued to ____ that she had been at the party.',
        answer:'deny',
        distractors:[
          diagnosed('admit','Fits grammatically, but admit means agree it is true, but still continued shows she kept saying the opposite.'),
          diagnosed('confess','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('accept','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'deny_ctx_5',
        text:'Nobody can ____ that regular exercise improves mood; the evidence is very strong.',
        answer:'deny',
        distractors:[
          diagnosed('show','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('announce','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('suggest','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'deny_ctx_6',
        text:'The suspect did not ____ being at the scene, but he insisted that he had not taken anything.',
        answer:'deny',
        distractors:[
          diagnosed('risk','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('finish','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('imagine','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('He denied to take the money.','deny takes an -ing form, so he denied taking the money.'),
      diagnosed('They deny about the problem.','deny is not followed by about; use deny the problem.'),
      diagnosed('I deny with your opinion.','the verb for this meaning is disagree with, not deny with.'),
      diagnosed('She denied that she to go there.','a that-clause needs a full verb, so she denied that she had been there.')
    ],
    patterns:['deny + -ing','deny + that-clause','deny + noun (deny the claim)'],
    collocations:['strongly deny','deny any involvement','deny the allegations'],
    contrasts:[
      diagnosed('admit','admit is the opposite: to agree that something is true or that you did it.'),
      diagnosed('refuse','refuse means say you will not do or give something; deny means say something is not true.')
    ]
  },
  permit:{
    definitionDistractors:[
      'to stop something from happening',
      'to make something happen sooner',
      'to ask for something to happen',
      'to expect something to happen',
      'to wait for something to happen',
      'to warn that something will happen'
    ],
    contexts:[
      {
        id:'permit_ctx_1',
        text:'Our flexible timetable will ____ you to study at your own pace.',
        answer:'permit',
        distractors:[
          diagnosed('force','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('require','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('pressure','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'permit_ctx_2',
        text:'The council will not ____ anyone to build on the old playing field, because it is protected land.',
        answer:'permit',
        distractors:[
          diagnosed('force','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('require','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('oblige','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'permit_ctx_3',
        text:'The exam rules do not ____ mobile phones, so students must leave them outside the hall.',
        answer:'permit',
        distractors:[
          diagnosed('require','Fits grammatically, but require would mean students must bring phones, which contradicts leaving them outside.'),
          diagnosed('supply','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('charge','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'permit_ctx_4',
        text:'Would you ____ your children to stay out until midnight on a school night?',
        answer:'permit',
        distractors:[
          diagnosed('force','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('teach','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('remind','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'permit_ctx_5',
        text:'A teacher cannot ____ students to copy each other’s answers in an assessment.',
        answer:'permit',
        distractors:[
          diagnosed('suggest','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('explain','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('mention','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'permit_ctx_6',
        text:'The new software will ____ teachers to share lessons with parents from any device.',
        answer:'permit',
        distractors:[
          diagnosed('suggest','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('explain','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('announce','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('The teacher permitted that we go home early.','permit is normally followed by an object and to + infinitive, not a that-clause.'),
      diagnosed('They permit me for leave.','the pattern is permit someone to do something, so they permit me to leave.'),
      diagnosed('My parents permitted me going out.','after permit someone, use to + infinitive, so permitted me to go out.'),
      diagnosed('Smoking is not permit in here.','the passive needs the past participle permitted.')
    ],
    patterns:['permit + noun','permit someone to + infinitive','be (not) permitted to'],
    collocations:['not permitted','weather permitting','permit access'],
    contrasts:[
      diagnosed('allow','allow is the everyday word; permit is more formal and common in rules and notices.'),
      diagnosed('forbid','forbid is the opposite: to say officially that something must not happen.')
    ]
  },
  arrange:{
    definitionDistractors:[
      'to cancel or change plans for something',
      'to remind people about plans for something',
      'to take part in something that is organised',
      'to pay for something that is organised',
      'to wait for something to be organised',
      'to invite people to join something'
    ],
    contexts:[
      {
        id:'arrange_ctx_1',
        text:'Please ____ a time that suits everyone so that we can all meet on Saturday.',
        answer:'arrange',
        distractors:[
          diagnosed('forget','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('avoid','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('miss','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'arrange_ctx_2',
        text:'My uncle has offered to ____ transport to the airport for the whole team.',
        answer:'arrange',
        distractors:[
          diagnosed('advertise','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('describe','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('review','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'arrange_ctx_3',
        text:'We need to ____ a babysitter before we can go out on Friday evening.',
        answer:'arrange',
        distractors:[
          diagnosed('describe','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('photograph','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('forget','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'arrange_ctx_4',
        text:'The band’s manager plans to ____ a short tour of five cities in the spring.',
        answer:'arrange',
        distractors:[
          diagnosed('forget','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('photograph','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('inspect','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'arrange_ctx_5',
        text:'It takes a lot of time to ____ a school trip for two hundred students.',
        answer:'arrange',
        distractors:[
          diagnosed('forget','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('repair','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('dismiss','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'arrange_ctx_6',
        text:'She will ____ to meet us at the station at six, so please wait for her.',
        answer:'arrange',
        distractors:[
          diagnosed('forget','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('refuse','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('pretend','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('We arranged that to go together.','the pattern is arrange to go or arrange for us to go, not arrange that to go.'),
      diagnosed('He arranged me a meeting.','say he arranged a meeting for me.'),
      diagnosed('They arrange for to meet at six.','arrange for needs a person before to, so arrange for him to meet us.'),
      diagnosed('I arranged him to meet the manager.','the pattern is arrange for him to meet the manager.')
    ],
    patterns:['arrange + noun','arrange to + infinitive','arrange for someone to + infinitive'],
    collocations:['arrange a meeting','arrange transport','arrange an interview'],
    contrasts:[
      diagnosed('prepare','prepare means get something ready; arrange means plan and organise it in advance.'),
      diagnosed('organise','organise is very close and often interchangeable, but arrange is common with times, meetings and transport.')
    ]
  },
  urge:{
    definitionDistractors:[
      'to politely ask someone to do something later',
      'to force someone to do something they dislike',
      'to warn someone not to do something',
      'to teach someone how to do something',
      'to give someone permission to do something',
      'to remind someone that they have done something'
    ],
    contexts:[
      {
        id:'urge_ctx_1',
        text:'Doctors strongly ____ patients to take up gentle exercise because the benefits are so large, though the choice is always theirs.',
        answer:'urge',
        distractors:[
          diagnosed('order','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('force','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('require','Fits grammatically, but require means make it necessary, but the choice is always theirs says it is not necessary.')
        ]
      },
      {
        id:'urge_ctx_2',
        text:'Friends who live here ____ new students to try the local food, which is cheap, delicious and unlike anything most newcomers have tasted.',
        answer:'urge',
        distractors:[
          diagnosed('warn','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('force','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('command','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'urge_ctx_3',
        text:'Experts ____ schools to teach financial skills earlier, but they cannot make any school do it, and so far none has agreed.',
        answer:'urge',
        distractors:[
          diagnosed('make','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('force','Fits grammatically, but force contradicts they cannot make any school do it.'),
          diagnosed('oblige','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'urge_ctx_4',
        text:'The charity, which has no authority over ministers, continues to ____ the government to increase funding for youth sport, so far without success.',
        answer:'urge',
        distractors:[
          diagnosed('make','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('order','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('instruct','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'urge_ctx_5',
        text:'Environmental groups ____ governments to cut emissions faster, although they have no power to make them.',
        answer:'urge',
        distractors:[
          diagnosed('order','Fits grammatically, but order contradicts they have no power to make them.'),
          diagnosed('force','Fits grammatically, but force contradicts they have no power to make them.'),
          diagnosed('compel','Fits grammatically, but compel means make someone do something, which contradicts they have no power to make them.')
        ]
      },
      {
        id:'urge_ctx_6',
        text:'Her parents ____ her to apply for the scholarship, but she has not decided yet and they say the choice is hers.',
        answer:'urge',
        distractors:[
          diagnosed('make','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('command','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('require','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('She urged me that I should apply.','the usual pattern is urge someone to + infinitive, so she urged me to apply.'),
      diagnosed('The doctor urged to rest.','urge needs an object before to, so the doctor urged him to rest.'),
      diagnosed('They urge us for staying calm.','use urge us to stay calm, not for + -ing.'),
      diagnosed('He urges that we are to go.','the usual pattern is he urges us to go.')
    ],
    patterns:['urge someone to + infinitive','urge + noun (urge caution)','strongly urge'],
    collocations:['urge caution','urge people to','strongly urge'],
    contrasts:[
      diagnosed('force','force means make someone do something; urge means encourage strongly but leave the choice open.'),
      diagnosed('advise','advise is calmer; urge adds strength and urgency.')
    ]
  },
  recommend:{
    definitionDistractors:[
      'to order something so that it arrives soon',
      'to copy something that someone else made',
      'to warn people that something is unsuitable',
      'to sell something to someone who needs it',
      'to ask politely for something to be done',
      'to say that something is true without proof'
    ],
    contexts:[
      {
        id:'recommend_ctx_1',
        text:'My dentist has just retired, so I am asking my colleagues to ____ someone they have been happy with.',
        answer:'recommend',
        distractors:[
          diagnosed('dismiss','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('forget','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('discourage','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'recommend_ctx_2',
        text:'I would highly ____ the new science museum; my whole class thought it was brilliant.',
        answer:'recommend',
        distractors:[
          diagnosed('criticise','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('avoid','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('doubt','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'recommend_ctx_3',
        text:'The doctor will ____ that you rest for at least three days.',
        answer:'recommend',
        distractors:[
          diagnosed('doubt','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('deny','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('regret','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'recommend_ctx_4',
        text:'Teachers often ____ reading a little every day as a way to build vocabulary.',
        answer:'recommend',
        distractors:[
          diagnosed('discourage','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('avoid','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('forbid','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'recommend_ctx_5',
        text:'Whenever tourists ask where to eat, I ____ my cousin’s bakery because the cheese bread there is wonderful.',
        answer:'recommend',
        distractors:[
          diagnosed('avoid','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('criticise','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('ignore','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'recommend_ctx_6',
        text:'Both coaches ____ that new players wear shin pads in their first session, but it is not compulsory.',
        answer:'recommend',
        distractors:[
          diagnosed('require','Fits grammatically, but require contradicts it is not compulsory.'),
          diagnosed('insist','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('demand','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('They recommend about this film.','recommend is not followed by about; use recommend this film.'),
      diagnosed('He recommended that I to try it.','after that, use the base verb: he recommended that I try it.'),
      diagnosed('I recommend to visit the museum.','recommend takes an -ing form or a noun, so I recommend visiting the museum.'),
      diagnosed('She recommended that to go early.','a that-clause needs a subject and verb, so she recommended that we go early.')
    ],
    patterns:['recommend + noun','recommend + -ing','recommend that + subject + base verb'],
    collocations:['highly recommend','strongly recommend','recommend something to someone'],
    contrasts:[
      diagnosed('suggest','suggest is very close; recommend carries more approval and often comes from someone with knowledge.'),
      diagnosed('advise','advise is followed by a person (advise someone to); recommend is followed by the thing advised.')
    ]
  },
  demand:{
    definitionDistractors:[
      'to give a lot of effort, skill, attention, or time',
      'to save a lot of effort, skill, attention, or money',
      'to need very little effort, skill, or attention',
      'to lose effort, skill, or attention over time',
      'to offer extra effort, skill, or help to others',
      'to waste a lot of time, attention, or resources'
    ],
    contexts:[
      {
        id:'demand_ctx_1',
        text:'Marathon training can ____ patience, discipline and a great deal of time.',
        answer:'demand',
        distractors:[
          diagnosed('ignore','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('avoid','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('replace','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'demand_ctx_2',
        text:'Learning two languages at once will ____ a lot of concentration.',
        answer:'demand',
        distractors:[
          diagnosed('avoid','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('shorten','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('excuse','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'demand_ctx_3',
        text:'Looking after three young children can ____ all of your energy by the end of the day.',
        answer:'demand',
        distractors:[
          diagnosed('restore','Fits grammatically, but restore means give energy back, but by the end of the day shows it is used up.'),
          diagnosed('produce','Fits grammatically, but produce means make energy, which is the opposite of using it up.'),
          diagnosed('save','Fits grammatically, but save means keep for later, which does not fit using up energy.')
        ]
      },
      {
        id:'demand_ctx_4',
        text:'Elite sport tends to ____ early mornings and very long hours of training.',
        answer:'demand',
        distractors:[
          diagnosed('replace','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('cancel','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('excuse','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'demand_ctx_5',
        text:'Becoming a good violinist can ____ years of daily practice and a great deal of patience.',
        answer:'demand',
        distractors:[
          diagnosed('prevent','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('avoid','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('excuse','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'demand_ctx_6',
        text:'The new course will ____ a high level of English from every applicant.',
        answer:'demand',
        distractors:[
          diagnosed('provide','Fits grammatically, but provide means give, but from every applicant shows it is something asked of them.'),
          diagnosed('develop','Fits grammatically, but develop means build up, but from every applicant shows it is asked for at the start.'),
          diagnosed('impress','Fits grammatically, but impress means make someone admire; the sentence is about what the course asks of applicants.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('The course demands for a lot of time.','demand is not followed by for here, so the course demands a lot of time.'),
      diagnosed('It was a very demand job.','the adjective is demanding, so it was a very demanding job.'),
      diagnosed('Training demands to be patient.','demand needs a noun here, so training demands patience.'),
      diagnosed('The coach demanded me to run faster.','demand is not normally used with an object and to + infinitive; use demanded that I run faster.')
    ],
    patterns:['demand + noun','be physically demanding','demand that + subject + base verb'],
    collocations:['demand time','demand patience','demand attention'],
    contrasts:[
      diagnosed('require','require is more formal and neutral; demand suggests a strong or heavy need.'),
      diagnosed('request','request means ask politely; demand means ask firmly or need a lot.')
    ]
  },
  threaten:{
    definitionDistractors:[
      'to protect someone or something from harm or loss',
      'to make someone or something stronger and safer',
      'to warn someone about a danger that is already over',
      'to promise to give someone or something a reward',
      'to help someone or something recover from harm or loss',
      'to check whether someone or something is in danger'
    ],
    contexts:[
      {
        id:'threaten_ctx_1',
        text:'A serious knee injury could ____ her place in the national squad.',
        answer:'threaten',
        distractors:[
          diagnosed('strengthen','Fits grammatically, but strengthen means make her place more secure, which is the opposite of what a serious injury does.'),
          diagnosed('defend','Fits grammatically, but defend means protect, whereas an injury is the danger itself.'),
          diagnosed('justify','Fits grammatically, but justify means give a good reason for, but an injury is a risk, not a reason.')
        ]
      },
      {
        id:'threaten_ctx_2',
        text:'Poor funding may ____ the future of the community football club.',
        answer:'threaten',
        distractors:[
          diagnosed('secure','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('improve','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('support','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'threaten_ctx_3',
        text:'The coach will ____ to drop any player who arrives late again.',
        answer:'threaten',
        distractors:[
          diagnosed('suggest','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('mention','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('discuss','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'threaten_ctx_4',
        text:'Heavy pollution continues to ____ the survival of rare birds in the area.',
        answer:'threaten',
        distractors:[
          diagnosed('protect','Fits grammatically, but protect means keep safe, the opposite of what heavy pollution does.'),
          diagnosed('improve','Fits grammatically, but improve means make better, which does not fit heavy pollution.'),
          diagnosed('safeguard','Fits grammatically, but safeguard means keep safe, but heavy pollution is the danger itself.')
        ]
      },
      {
        id:'threaten_ctx_5',
        text:'Dark storm clouds seemed to ____ the outdoor final, and officials began to talk about moving the match indoors.',
        answer:'threaten',
        distractors:[
          diagnosed('welcome','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('decorate','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('support','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'threaten_ctx_6',
        text:'Union leaders say the new rules could ____ the jobs of thousands of factory workers, and they want the government to think again.',
        answer:'threaten',
        distractors:[
          diagnosed('protect','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('safeguard','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('reward','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('He threatened me that he would leave.','threaten is used with to + infinitive or with someone with something, not me that.'),
      diagnosed('The fire threatened for the town.','threaten takes a direct object, so the fire threatened the town.'),
      diagnosed('They threatened to be closing the club.','after threaten to, use the base verb: threatened to close the club.'),
      diagnosed('The injury threatened her to miss the final.','the injury is the cause, so say the injury threatened to keep her out of the final.')
    ],
    patterns:['threaten + noun','threaten to + infinitive','threaten someone with something'],
    collocations:['threaten the survival of','threaten to resign','seriously threaten'],
    contrasts:[
      diagnosed('warn','warn tells people about a danger; threaten can mean to be that danger or to say you will cause harm.'),
      diagnosed('protect','protect is the opposite: to keep something safe from harm or loss.')
    ]
  },
  resent:{
    definitionDistractors:[
      'to feel sad about something that you have lost',
      'to feel sorry about something you did wrong',
      'to feel proud of something that other people did',
      'to feel worried about something that might happen',
      'to feel tired of something you have done often',
      'to feel grateful for something that someone gave you'
    ],
    contexts:[
      {
        id:'resent_ctx_1',
        text:'He began to ____ being left out of the team, even though he had trained hard all season.',
        answer:'resent',
        distractors:[
          diagnosed('enjoy','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('welcome','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('appreciate','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'resent_ctx_2',
        text:'Many workers ____ being told to stay late without extra pay.',
        answer:'resent',
        distractors:[
          diagnosed('welcome','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('appreciate','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('prefer','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'resent_ctx_3',
        text:'Some players ____ the coach for choosing younger teammates, and they refuse to speak to him.',
        answer:'resent',
        distractors:[
          diagnosed('forgive','Fits grammatically, but forgive would mean they no longer blame him, which contradicts refuse to speak to him.'),
          diagnosed('thank','Fits grammatically, but thank means show gratitude, which contradicts refuse to speak to him.'),
          diagnosed('congratulate','Fits grammatically, but congratulate means praise, which contradicts refuse to speak to him.')
        ]
      },
      {
        id:'resent_ctx_4',
        text:'Last year the manager changed everyone’s shifts without warning, and many staff still ____ it.',
        answer:'resent',
        distractors:[
          diagnosed('appreciate','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('praise','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('welcome','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'resent_ctx_5',
        text:'They ____ the extra homework, because they thought it was unfair to set it on a Friday.',
        answer:'resent',
        distractors:[
          diagnosed('enjoy','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('praise','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('support','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'resent_ctx_6',
        text:'She felt hurt that the coach had picked someone else, and although she never said a word to anyone, she could not help but ____ the new girl’s place in the team.',
        answer:'resent',
        distractors:[
          diagnosed('welcome','Fits grammatically, but welcome means be glad about it, which contradicts felt hurt.'),
          diagnosed('discuss','Fits grammatically, but discuss means talk about it with others, which contradicts although she never said a word to anyone.'),
          diagnosed('mention','Fits grammatically, but mention means say something about it, which contradicts although she never said a word to anyone.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('She resented to be left out.','resent takes an -ing form, so she resented being left out.'),
      diagnosed('He resents with his brother.','resent takes a direct object and no with, so he resents his brother.'),
      diagnosed('I resent for the extra homework.','resent is not followed by for; use resent the extra homework.'),
      diagnosed('They resented that the new rule.','that is not followed by a noun alone; say they resented the new rule.')
    ],
    patterns:['resent + noun','resent + -ing','resent someone for + -ing'],
    collocations:['deeply resent','resent being asked','resent the fact that'],
    contrasts:[
      diagnosed('regret','regret is sorrow about something you did or lost; resent is anger about something that seems unfair.'),
      diagnosed('envy','envy is wanting what someone has; resent is feeling angry about how you or someone else was treated.')
    ]
  },
  regret:{
    definitionDistractors:[
      'to feel angry about something that someone else did',
      'to feel worried about something that might happen',
      'to say sorry to someone you have upset',
      'to wish that you could do something again',
      'to feel sad because you have lost something',
      'to feel embarrassed about something in public'
    ],
    contexts:[
      {
        id:'regret_ctx_1',
        text:'He told me that he will always ____ his own decision to leave school so early and often wishes he had stayed.',
        answer:'regret',
        distractors:[
          diagnosed('celebrate','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('defend','Fits grammatically, but defend means argue in support of it, but wishes he had stayed shows he does not support the decision.'),
          diagnosed('welcome','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'regret_ctx_2',
        text:'We ____ to tell you that your application has not been successful this year.',
        answer:'regret',
        distractors:[
          diagnosed('refuse','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('forget','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('pretend','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'regret_ctx_3',
        text:'She did not ____ her decision to change schools; she said she was much happier now.',
        answer:'regret',
        distractors:[
          diagnosed('announce','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('forget','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('cancel','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'regret_ctx_4',
        text:'Looking back, many retired athletes ____ not spending more time with their families.',
        answer:'regret',
        distractors:[
          diagnosed('celebrate','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('welcome','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('enjoy','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'regret_ctx_5',
        text:'If you leave your revision until the last minute, you will bitterly ____ it on the day of the exam.',
        answer:'regret',
        distractors:[
          diagnosed('forget','Fits grammatically, but forget does not combine with bitterly, which signals a strong feeling.'),
          diagnosed('repeat','Fits grammatically, but repeat does not combine with bitterly, which signals a strong feeling.'),
          diagnosed('mention','Fits grammatically, but mention does not combine with bitterly, which signals a strong feeling.')
        ]
      },
      {
        id:'regret_ctx_6',
        text:'He apologised for the mistake and said he would always ____ what he had said to his teammate.',
        answer:'regret',
        distractors:[
          diagnosed('defend','Fits grammatically, but defend contradicts apologised.'),
          diagnosed('repeat','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('deny','Fits grammatically, but deny contradicts apologised.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('I regret to be late yesterday.','to refer to a past action use regret + -ing: I regret being late yesterday.'),
      diagnosed('She regretted for leaving early.','regret takes a direct object or an -ing form with no for.'),
      diagnosed('We regret apologise to you.','after regret use -ing or a that-clause; say we apologise to you.'),
      diagnosed('He is very regret about it.','the adjective is regretful; or use the verb: he regrets it.')
    ],
    patterns:['regret + -ing','regret + noun','regret to inform / say'],
    collocations:['deeply regret','regret the decision','no regrets'],
    contrasts:[
      diagnosed('resent','resent is anger at something unfair; regret is sorrow about something you did or something that happened.'),
      diagnosed('apologise','apologise is saying sorry to someone; regret is the feeling of being sorry.')
    ]
  },
  unfamiliar:{
    definitionDistractors:[
      'not liked by most people who try it',
      'not allowed by the rules of a game',
      'not easy to understand when it is explained',
      'not important enough for anyone to remember',
      'not safe to use without some training',
      'not often found in the place where you live'
    ],
    contexts:[
      {
        id:'unfamiliar_ctx_1',
        text:'Many of the rules in baseball seemed ____ to the exchange students, because none of them had ever watched a game.',
        answer:'unfamiliar',
        distractors:[
          diagnosed('unfair','Fits grammatically, but unfair means not treated equally, but none of them had ever watched a game explains lack of experience, not unfairness.'),
          diagnosed('unnecessary','Fits grammatically, but unnecessary means not needed, but the cue is that they had never seen the game.'),
          diagnosed('unpopular','Fits grammatically, but unpopular means disliked by many people, but the cue is that none of them had watched a game.')
        ]
      },
      {
        id:'unfamiliar_ctx_2',
        text:'Moving to another country means getting used to ____ food, customs and routines.',
        answer:'unfamiliar',
        distractors:[
          diagnosed('familiar','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('ordinary','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('usual','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'unfamiliar_ctx_3',
        text:'She felt nervous walking into the ____ gym, because she had never been inside it before.',
        answer:'unfamiliar',
        distractors:[
          diagnosed('unfinished','Fits grammatically, but unfinished means not completed, but never been inside it before explains why she felt nervous.'),
          diagnosed('unsafe','Fits grammatically, but unsafe means dangerous, but the sentence does not say there is any danger.'),
          diagnosed('unpopular','Fits grammatically, but unpopular means disliked, but the cue is that she had never been inside.')
        ]
      },
      {
        id:'unfamiliar_ctx_4',
        text:'The route was ____ to us, so we kept stopping at every junction to check the map.',
        answer:'unfamiliar',
        distractors:[
          diagnosed('familiar','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('obvious','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('straightforward','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'unfamiliar_ctx_5',
        text:'Even experienced players can make mistakes when they use ____ equipment for the first time.',
        answer:'unfamiliar',
        distractors:[
          diagnosed('unattractive','Fits grammatically, but unattractive means not nice to look at, which does not explain mistakes.'),
          diagnosed('unnecessary','Fits grammatically, but unnecessary means not needed, which does not explain mistakes.'),
          diagnosed('unpopular','Fits grammatically, but unpopular means disliked, but for the first time is the cue that it is new to them.')
        ]
      },
      {
        id:'unfamiliar_ctx_6',
        text:'The rules of cricket are completely ____ to anyone who has grown up outside the countries where it is played.',
        answer:'unfamiliar',
        distractors:[
          diagnosed('obvious','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('clear','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('straightforward','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('The rules are unfamiliar for me.','unfamiliar is followed by to (unfamiliar to someone) or with (unfamiliar with something).'),
      diagnosed('She is unfamiliar of the rules.','use unfamiliar with the rules.'),
      diagnosed('The city was unfamiliar with me.','the city is unfamiliar to me, or I am unfamiliar with the city.'),
      diagnosed('They felt unfamiliar in the new school.','unfamiliar describes the thing that is new, so say the school was unfamiliar to them.')
    ],
    patterns:['unfamiliar to + person','unfamiliar with + noun','strange and unfamiliar'],
    collocations:['unfamiliar territory','unfamiliar surroundings','completely unfamiliar'],
    contrasts:[
      diagnosed('unusual','unusual means rare or not normal, whereas unfamiliar depends on whether you personally know it.'),
      diagnosed('familiar','familiar is the opposite: well known to you because you have experienced it before.')
    ]
  },
  racquet:{
    definitionDistractors:[
      'a flat piece of wood used to hit a ball',
      'a long stick used to move a ball along the ground',
      'a strong net used to catch a ball',
      'a heavy club used to hit a ball a long distance',
      'a frame with a handle used to catch and throw a ball',
      'a padded glove used to protect the hand when playing'
    ],
    contexts:[
      {
        id:'racquet_ctx_1',
        text:'She replaced the broken strings on her tennis ____ before the final.',
        answer:'racquet',
        distractors:[
          diagnosed('bat','Fits grammatically, but a bat is used in cricket and baseball and has no strings.'),
          diagnosed('club','Fits grammatically, but a club is used in golf and has no strings.'),
          diagnosed('paddle','Fits grammatically, but a paddle is used in table tennis and has no strings.')
        ]
      },
      {
        id:'racquet_ctx_2',
        text:'In badminton, players hit the shuttlecock over the net with a light ____.',
        answer:'racquet',
        distractors:[
          diagnosed('stick','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('club','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('hockey stick','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'racquet_ctx_3',
        text:'He threw his ____ onto the court after missing the final point, snapping two strings, and had to borrow another one.',
        answer:'racquet',
        distractors:[
          diagnosed('bat','Fits grammatically, but a bat has no strings to snap.'),
          diagnosed('mouthguard','Fits grammatically, but a mouthguard is worn in the mouth, and has no strings.'),
          diagnosed('stick','Fits grammatically, but a stick has no strings to snap.')
        ]
      },
      {
        id:'racquet_ctx_4',
        text:'Squash players usually carry a spare ____ in their bag in case a string snaps.',
        answer:'racquet',
        distractors:[
          diagnosed('stick','Fits grammatically, but a stick has no strings.'),
          diagnosed('glove','Fits grammatically, but a glove does not have strings to snap.'),
          diagnosed('wristband','Fits grammatically, but a wristband does not have strings to snap.')
        ]
      },
      {
        id:'racquet_ctx_5',
        text:'A beginner should choose a ____ with a larger strung head, because it makes the ball easier to hit.',
        answer:'racquet',
        distractors:[
          diagnosed('mallet','Fits grammatically, but a mallet is used in croquet and has a solid head, not a strung frame.'),
          diagnosed('club','Fits grammatically, but a club has a solid head and no strings.'),
          diagnosed('bat','Fits grammatically, but a bat has a solid surface, not a strung head.')
        ]
      },
      {
        id:'racquet_ctx_6',
        text:'The coach showed the children how to hold the ____ so that the strings faced the ball.',
        answer:'racquet',
        distractors:[
          diagnosed('bat','Fits grammatically, but a bat has no strings.'),
          diagnosed('mallet','Fits grammatically, but a mallet has no strings.'),
          diagnosed('whistle','Fits grammatically, but a whistle is blown, not held to face a ball.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('We need a racquet for the badminton ball.','the object hit in badminton is a shuttlecock, not a ball.'),
      diagnosed('He racquets the ball very hard.','racquet is a noun naming the equipment; it is not used as a verb for hitting.'),
      diagnosed('I need a new tennis racquets.','racquet is singular after a; use a new tennis racquet.'),
      diagnosed('She plays racquet every weekend.','racquet names the equipment, so say she plays tennis or uses a racquet.')
    ],
    patterns:['tennis racquet','badminton racquet','racquet sports'],
    collocations:['restring a racquet','swing a racquet','racquet and ball'],
    contrasts:[
      diagnosed('bat','a bat has a solid surface; a racquet has a frame with strings.'),
      diagnosed('club','a club has a solid head and is used in golf; a racquet is strung.')
    ]
  },
  opponent:{
    definitionDistractors:[
      'a person who plays on the same team as you',
      'a person who watches a match without taking part',
      'a person who decides whether a rule was broken',
      'a person who teaches a team how to play',
      'a person who provides money for a team',
      'a person who has played in many matches'
    ],
    contexts:[
      {
        id:'opponent_ctx_1',
        text:'The tennis player shook hands with her ____, who had just beaten her in three sets.',
        answer:'opponent',
        distractors:[
          diagnosed('referee','Fits grammatically, but a referee does not play, and the sentence says the person had just beaten her.'),
          diagnosed('spectator','Fits grammatically, but a spectator watches and does not play, and the sentence says the person had just beaten her.'),
          diagnosed('partner','Fits grammatically, but a partner plays on the same side, not against her.')
        ]
      },
      {
        id:'opponent_ctx_2',
        text:'Before the game, the captain studied video of the other team’s goalkeeper to find the ____’s weaknesses.',
        answer:'opponent',
        distractors:[
          diagnosed('teammate','Fits grammatically, but a teammate is on the captain’s own side, but the video is of the other team’s goalkeeper.'),
          diagnosed('referee','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('supporter','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'opponent_ctx_3',
        text:'In doubles, you must communicate clearly with your partner, but never give your ____ any hint about your plan.',
        answer:'opponent',
        distractors:[
          diagnosed('teammate','Fits grammatically, but a teammate is on your side, so you would share your plan, not hide it.'),
          diagnosed('partner','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('captain','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'opponent_ctx_4',
        text:'Chess players must think about the next move that their ____ is likely to make.',
        answer:'opponent',
        distractors:[
          diagnosed('coach','Fits grammatically, but a coach advises from outside the game and does not make moves.'),
          diagnosed('judge','Fits grammatically, but a judge scores or rules on a game and does not make moves in it.'),
          diagnosed('referee','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'opponent_ctx_5',
        text:'A good boxer respects every ____, even one who has lost his last five fights.',
        answer:'opponent',
        distractors:[
          diagnosed('fan','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('trainer','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('referee','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'opponent_ctx_6',
        text:'When two teams meet, each team is the other’s ____, but off the pitch the players are often friends.',
        answer:'opponent',
        distractors:[
          diagnosed('supporter','Fits grammatically, but a supporter would be on the team’s side, which contradicts two teams meeting to compete.'),
          diagnosed('partner','Fits grammatically, but a partner is on the same side, which contradicts two teams meeting to compete.'),
          diagnosed('manager','Fits grammatically, but a manager belongs to the team, not the other side.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('He opponented me in the final.','opponent is a noun; the verb is oppose or play against.'),
      diagnosed('She is my opponent in my team.','an opponent is on the other side; a teammate is in your team.'),
      diagnosed('The opponent of the match was strong.','an opponent is a person or team, not the match itself.'),
      diagnosed('I opponent this idea.','opponent is a noun; the verb is oppose.')
    ],
    patterns:['an opponent in + noun','play against an opponent','defeat an opponent'],
    collocations:['strong opponent','defeat an opponent','political opponent'],
    contrasts:[
      diagnosed('rival','a rival competes against you over a long time; an opponent is the person you face in a particular match or contest.'),
      diagnosed('teammate','a teammate is on your side; an opponent is on the other side.')
    ]
  },
  intense:{
    definitionDistractors:[
      'a long, slow and tiring period of effort',
      'so loud or bright that it hurts your senses',
      'so unusual that it is difficult to explain',
      'done only for a short time before a big event',
      'repeated many times until it feels like a habit',
      'happening in secret so that few people know'
    ],
    contexts:[
      {
        id:'intense_ctx_1',
        text:'Players faced ____ pressure in the final minutes, with the score level and the whole crowd roaring.',
        answer:'intense',
        distractors:[
          diagnosed('mild','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('light','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('slight','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'intense_ctx_2',
        text:'The sun was so ____ that the runners had to stop for water every few minutes.',
        answer:'intense',
        distractors:[
          diagnosed('extensive','Fits grammatically, but extensive means covering a large area, not very strong.'),
          diagnosed('intensive','Fits grammatically, but intensive means concentrated over a short time (an intensive course), not very strong heat.'),
          diagnosed('instant','Fits grammatically, but instant means immediate, not strong.')
        ]
      },
      {
        id:'intense_ctx_3',
        text:'She trained with ____ concentration, never once looking at the clock.',
        answer:'intense',
        distractors:[
          diagnosed('weak','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('casual','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('partial','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'intense_ctx_4',
        text:'The rivalry between the two schools is so ____ that even friendly matches feel like finals.',
        answer:'intense',
        distractors:[
          diagnosed('intensive','Fits grammatically, but intensive means concentrated over a short time (an intensive course), not very strong feeling.'),
          diagnosed('internal','Fits grammatically, but internal means inside the group, not very strong feeling.'),
          diagnosed('secret','Fits grammatically, but secret means hidden from others, but even friendly matches feel like finals shows the rivalry is open and strong.')
        ]
      },
      {
        id:'intense_ctx_5',
        text:'After weeks of ____ heat, the farmers began to worry about their crops.',
        answer:'intense',
        distractors:[
          diagnosed('instant','Fits grammatically, but instant means immediate, but weeks of describes something long-lasting.'),
          diagnosed('intensive','Fits grammatically, but intensive describes concentrated effort, not weather.'),
          diagnosed('immediate','Fits grammatically, but immediate means happening now, but weeks of describes something long-lasting.')
        ]
      },
      {
        id:'intense_ctx_6',
        text:'The coach’s ____ stare made the young players realise how serious the match was.',
        answer:'intense',
        distractors:[
          diagnosed('intensive','Fits grammatically, but intensive describes concentrated effort, not how a look feels.'),
          diagnosed('internal','Fits grammatically, but internal means inside a group or place, which does not describe how strong a look is.'),
          diagnosed('immediate','Fits grammatically, but immediate means happening straight away, which describes timing, not how strong the look is.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('It was an intense training for two weeks.','an intense training is awkward here; say intensive training for a concentrated programme or intense training for a very hard session.'),
      diagnosed('She felt intensely a pain.','adverbs go before the verb or participle; say she felt an intense pain.'),
      diagnosed('The match was very intensely.','intense is an adjective; the adverb is intensely and would modify a verb.'),
      diagnosed('He was an intense person to relax.','intense describes a person who feels or acts with great strength, not someone easy to relax.')
    ],
    patterns:['intense + noun','be intense','intensely competitive'],
    collocations:['intense pressure','intense heat','intense competition'],
    contrasts:[
      diagnosed('intensive','intensive means done in a concentrated, thorough way over a short time; intense means very strong.'),
      diagnosed('extreme','extreme means furthest or most severe; intense describes the strength of a feeling or effect.')
    ]
  },
  tournament:{
    definitionDistractors:[
      'a single match between two teams or players',
      'a series of games played within one country',
      'a place where teams practise before a match',
      'a set of rules for how a game should be played',
      'a prize given to the winner of a match',
      'a group of players who train together'
    ],
    contexts:[
      {
        id:'tournament_ctx_1',
        text:'Sixteen schools entered the knockout ____, and only the winners of each match went through to the next round.',
        answer:'tournament',
        distractors:[
          diagnosed('league','Fits grammatically, but a league has teams play each other repeatedly over a season, not in knockout rounds.'),
          diagnosed('season','Fits grammatically, but a season is a period of the year, not a single knockout event.'),
          diagnosed('exhibition','Fits grammatically, but an exhibition is a public display or friendly game, not a series of knockout matches.')
        ]
      },
      {
        id:'tournament_ctx_2',
        text:'He scored the winning goal in the semi-final of the ____, which his team went on to win.',
        answer:'tournament',
        distractors:[
          diagnosed('season','Fits grammatically, but a season is a period of time, and a semi-final belongs to one event.'),
          diagnosed('camp','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('exhibition','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'tournament_ctx_3',
        text:'The school is hosting a one-day ____ for six local teams, with the final at four o’clock.',
        answer:'tournament',
        distractors:[
          diagnosed('training camp','Fits grammatically, but a training camp is for preparing players and does not normally end with a final between teams.'),
          diagnosed('workshop','Fits grammatically, but a workshop is a session for learning, not a competition between teams.'),
          diagnosed('league','Fits grammatically, but a league lasts a whole season, not a single day.')
        ]
      },
      {
        id:'tournament_ctx_4',
        text:'Because of heavy rain, the organisers postponed the quarter-finals and semi-finals of the ____ until next weekend.',
        answer:'tournament',
        distractors:[
          diagnosed('season','Fits grammatically, but a season is a period of the year, and it is not divided into quarter-finals and semi-finals.'),
          diagnosed('series','Fits grammatically, but a series has matches, but it is not decided by quarter-finals and semi-finals.'),
          diagnosed('exhibition','Fits grammatically, but an exhibition is a public display or friendly game, not a competition with quarter-finals and semi-finals.')
        ]
      },
      {
        id:'tournament_ctx_5',
        text:'Players from twelve countries took part in the international ____ in Singapore.',
        answer:'tournament',
        distractors:[
          diagnosed('lesson','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('exam','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('auction','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'tournament_ctx_6',
        text:'Our team lost its first match but still reached the final of the ____ by winning all its remaining games.',
        answer:'tournament',
        distractors:[
          diagnosed('season','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('lesson','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('workshop','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('We played a tournament against them.','a tournament involves several teams; say we played a match against them.'),
      diagnosed('The tournament was finished in ten minutes.','a tournament takes a long time because it has several matches.'),
      diagnosed('I won the tournament of the match.','a tournament contains matches, so you cannot win a tournament of a match.'),
      diagnosed('Tournaments is held every year.','tournament is a countable noun, so say tournaments are held.')
    ],
    patterns:['enter a tournament','win a tournament','host a tournament'],
    collocations:['knockout tournament','regional tournament','tennis tournament'],
    contrasts:[
      diagnosed('match','a match is one game between two sides; a tournament is a whole competition with many matches.'),
      diagnosed('league','a league has teams play each other over a long season; a tournament is shorter and often knockout.')
    ]
  },
  determined:{
    definitionDistractors:[
      'feeling certain that you will win a competition',
      'willing to work hard only when someone is watching',
      'unwilling to listen to advice from other people',
      'happy and calm because you are well prepared',
      'angry because you have not got what you wanted',
      'quick to decide what to do without thinking much'
    ],
    contexts:[
      {
        id:'determined_ctx_1',
        text:'Even after three defeats, she was ____ to qualify for the national team and refused to give up.',
        answer:'determined',
        distractors:[
          diagnosed('reluctant','Fits grammatically, but reluctant means unwilling, which contradicts refused to give up.'),
          diagnosed('embarrassed','Fits grammatically, but embarrassed to qualify would mean she felt awkward about succeeding, which does not fit refused to give up.'),
          diagnosed('afraid','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'determined_ctx_2',
        text:'The team was ____ to win the match despite being two goals behind at half-time.',
        answer:'determined',
        distractors:[
          diagnosed('unwilling','Fits grammatically, but unwilling to win contradicts the idea of fighting back despite being two goals behind.'),
          diagnosed('ashamed','Fits grammatically, but ashamed to win would mean they felt bad about winning, which does not fit despite being two goals behind.'),
          diagnosed('uncomfortable','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'determined_ctx_3',
        text:'He showed a ____ effort in the last lap, refusing to slow down even though his legs were aching.',
        answer:'determined',
        distractors:[
          diagnosed('careless','Fits grammatically, but careless contradicts refusing to slow down.'),
          diagnosed('half-hearted','Fits grammatically, but half-hearted means without full effort, which contradicts refusing to slow down.'),
          diagnosed('gentle','Fits grammatically, but gentle contradicts refusing to slow down.')
        ]
      },
      {
        id:'determined_ctx_4',
        text:'The school record was no accident: although she had little natural talent, the ____ young swimmer had practised every morning for a year.',
        answer:'determined',
        distractors:[
          diagnosed('gifted','Fits grammatically, but gifted means naturally talented, which contradicts although she had little natural talent.'),
          diagnosed('lucky','Fits grammatically, but lucky means helped by chance, which contradicts the record was no accident.'),
          diagnosed('carefree','Fits grammatically, but carefree means without worries, which does not fit practising every morning for a year.')
        ]
      },
      {
        id:'determined_ctx_5',
        text:'Although the climb was dangerous, the team stayed ____ to reach the summit before dark.',
        answer:'determined',
        distractors:[
          diagnosed('afraid','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('reluctant','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('ashamed','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'determined_ctx_6',
        text:'Her ____ attitude impressed the coach, who said she never complained, even after the hardest sessions.',
        answer:'determined',
        distractors:[
          diagnosed('careless','Fits grammatically, but careless contradicts never complained and the coach’s praise.'),
          diagnosed('indifferent','Fits grammatically, but indifferent means not caring, which contradicts the coach being impressed.'),
          diagnosed('arrogant','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('She is determined for win.','determined is followed by to + infinitive, not for.'),
      diagnosed('He was determine to win.','the adjective is determined, with -ed.'),
      diagnosed('The determined of the team was impressive.','the noun is determination.'),
      diagnosed('They were determined that to win.','determined is followed by to + infinitive, or a that-clause with its own verb.')
    ],
    patterns:['be determined to + infinitive','a determined effort','determined not to'],
    collocations:['determined to succeed','a determined athlete','absolutely determined'],
    contrasts:[
      diagnosed('stubborn','stubborn is often negative and means refusing to change your mind; determined usually shows a positive firm purpose.'),
      diagnosed('confident','confident means feeling sure you will succeed; determined means refusing to give up.')
    ]
  },
  discipline:{
    definitionDistractors:[
      'the rule that punishes students who arrive late',
      'the speed and strength needed to win a race',
      'the knowledge that comes from reading about a sport',
      'the courage to take risks in a competition',
      'the habit of always saying thank you to others',
      'the ability to stay calm when you are losing'
    ],
    contexts:[
      {
        id:'discipline_ctx_1',
        text:'Training at five every morning in winter takes real ____, because nobody forces you to keep to the routine.',
        answer:'discipline',
        distractors:[
          diagnosed('equipment','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('sponsorship','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('transport','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'discipline_ctx_2',
        text:'Success in a sport depends on talent, but it also depends on the ____ to follow a strict timetable even when you feel tired.',
        answer:'discipline',
        distractors:[
          diagnosed('flexibility','Fits grammatically, but flexibility is the ability to change, which is the opposite of following a strict timetable.'),
          diagnosed('laziness','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('curiosity','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'discipline_ctx_3',
        text:'The coach praised the team’s ____ in following the training plan exactly, even when no one was watching.',
        answer:'discipline',
        distractors:[
          diagnosed('creativity','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('flexibility','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('humour','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'discipline_ctx_4',
        text:'With a little ____, you can put aside a small amount of money each week even when you are tempted to spend it.',
        answer:'discipline',
        distractors:[
          diagnosed('generosity','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('curiosity','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('laziness','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'discipline_ctx_5',
        text:'Learning a language requires ____: a short study session every day is better than one long session at the weekend.',
        answer:'discipline',
        distractors:[
          diagnosed('talent','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('intelligence','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('equipment','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'discipline_ctx_6',
        text:'Soldiers and athletes need ____ to follow orders and keep to the rules when conditions are hard.',
        answer:'discipline',
        distractors:[
          diagnosed('imagination','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('humour','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('curiosity','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('She needs discipline for to train every day.','after discipline use to + infinitive, with no for.'),
      diagnosed('He showed a lot of disciplines when training.','discipline is uncountable in this meaning and has no plural s.'),
      diagnosed('The discipline of the team won.','the noun here needs a describing word; say the team’s discipline helped it win.'),
      diagnosed('She is a very discipline athlete.','the adjective is disciplined.')
    ],
    patterns:['discipline + to + infinitive','have discipline','self-discipline'],
    collocations:['strict discipline','show discipline','lack of discipline'],
    contrasts:[
      diagnosed('motivation','motivation is the reason you want to do something; discipline is keeping going even when you do not feel like it.'),
      diagnosed('punishment','punishment is a penalty for breaking rules; discipline in this unit means self-control.')
    ]
  },
  'goal-oriented':{
    definitionDistractors:[
      'careful to follow every rule of a sport',
      'eager to be famous because of a sporting win',
      'willing to listen to advice from a coach',
      'able to learn quickly from other players',
      'skilled at keeping a team calm in a match',
      'happy to work with other people in a team'
    ],
    contexts:[
      {
        id:'goal-oriented_ctx_1',
        text:'The manager is ____: she cares less about how a task is done than about reaching the agreed result by Friday.',
        answer:'goal-oriented',
        distractors:[
          diagnosed('detail-oriented','Fits grammatically, but detail-oriented means paying attention to small points, which contradicts caring less about how a task is done.'),
          diagnosed('team-oriented','Fits grammatically, but team-oriented means focused on the group, but the sentence is about reaching an agreed result.'),
          diagnosed('process-oriented','Fits grammatically, but process-oriented means focused on how a task is done, which is the opposite of the sentence.')
        ]
      },
      {
        id:'goal-oriented_ctx_2',
        text:'A ____ runner writes a target time for each race and trains only in ways that will help reach it.',
        answer:'goal-oriented',
        distractors:[
          diagnosed('detail-oriented','Fits grammatically, but detail-oriented means paying attention to small points, but the sentence is about aiming for a target time.'),
          diagnosed('team-oriented','Fits grammatically, but team-oriented means focused on the group, but the sentence is about one runner’s target time.'),
          diagnosed('health-conscious','Fits grammatically, but health-conscious means caring about health, but the sentence is about reaching a target time.')
        ]
      },
      {
        id:'goal-oriented_ctx_3',
        text:'Because she is so ____, she checks every month whether she is closer to the grades she has set herself.',
        answer:'goal-oriented',
        distractors:[
          diagnosed('team-oriented','Fits grammatically, but team-oriented means focused on the group, but the sentence is about her own targets.'),
          diagnosed('people-oriented','Fits grammatically, but people-oriented means focused on other people, but the sentence is about her own targets.'),
          diagnosed('family-oriented','Fits grammatically, but family-oriented means focused on family life, but the sentence is about her own targets.')
        ]
      },
      {
        id:'goal-oriented_ctx_4',
        text:'The coach wanted ____ players, who would keep their eyes on the final aim of promotion rather than on how enjoyable each session was.',
        answer:'goal-oriented',
        distractors:[
          diagnosed('fun-loving','Fits grammatically, but fun-loving means enjoying having fun, which is the opposite of keeping eyes on the final aim.'),
          diagnosed('easy-going','Fits grammatically, but easy-going means relaxed, which does not fit keeping eyes on the final aim.'),
          diagnosed('sociable','Fits grammatically, but sociable means enjoying other people’s company, which does not describe focus on the final aim.')
        ]
      },
      {
        id:'goal-oriented_ctx_5',
        text:'Our school is increasingly ____: every department sets yearly targets and reports on whether it has reached them.',
        answer:'goal-oriented',
        distractors:[
          diagnosed('customer-oriented','Fits grammatically, but customer-oriented means focused on serving customers, but the sentence is about setting targets and reporting results.'),
          diagnosed('family-oriented','Fits grammatically, but family-oriented means focused on family life, but the sentence is about setting targets and reporting results.'),
          diagnosed('safety-oriented','Fits grammatically, but safety-oriented means focused on preventing harm, but the sentence is about setting targets and reporting results.')
        ]
      },
      {
        id:'goal-oriented_ctx_6',
        text:'He was never ____: he drifted from one hobby to another without ever deciding what he wanted to achieve.',
        answer:'goal-oriented',
        distractors:[
          diagnosed('team-oriented','Fits grammatically, but team-oriented means focused on the group, but the sentence is about not deciding what he wanted to achieve.'),
          diagnosed('detail-oriented','Fits grammatically, but detail-oriented means paying attention to small points, but the sentence is about not deciding what he wanted to achieve.'),
          diagnosed('safety-oriented','Fits grammatically, but safety-oriented means focused on preventing harm, but the sentence is about not deciding what he wanted to achieve.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('She is a goal-orient student.','the adjective is goal-oriented, with the -ed ending.'),
      diagnosed('She is a goal oriented student.','the hyphen is needed: goal-oriented.'),
      diagnosed('Their goal-oriented is clear.','goal-oriented is an adjective and needs a noun, such as a goal-oriented approach.'),
      diagnosed('I am goal-oriented to be a doctor.','goal-oriented is not followed by to + infinitive; say focused on becoming a doctor.')
    ],
    patterns:['highly goal-oriented','a goal-oriented approach','be goal-oriented'],
    collocations:['goal-oriented learner','goal-oriented team','remain goal-oriented'],
    contrasts:[
      diagnosed('ambitious','ambitious means wanting to succeed, while goal-oriented focuses on clear targets and plans.'),
      diagnosed('aimless','aimless is the opposite: without any clear purpose.')
    ]
  },
  achievement:{
    definitionDistractors:[
      'the act of trying hard to do something difficult',
      'the money given to someone who wins a competition',
      'the happy feeling after a match is over',
      'the skill that a person has since they were born',
      'the routine tasks that someone does every day',
      'the plan that is made before a big match'
    ],
    contexts:[
      {
        id:'achievement_ctx_1',
        text:'Finishing the marathon in under four hours was a major ____ for someone who had only started running a year ago.',
        answer:'achievement',
        distractors:[
          diagnosed('disappointment','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('embarrassment','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('mistake','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'achievement_ctx_2',
        text:'The coach called her place on the national team the most difficult ____ of her career, because no one from the school had ever done it before.',
        answer:'achievement',
        distractors:[
          diagnosed('defeat','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('injury','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('loss','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'achievement_ctx_3',
        text:'The school celebrated the ____ of its students, who had won three national prizes in a single year.',
        answer:'achievement',
        distractors:[
          diagnosed('mistake','Fits grammatically, but a mistake is an error, which does not fit celebrated and prizes.'),
          diagnosed('absence','Fits grammatically, but an absence is not being present, which does not fit celebrated and prizes.'),
          diagnosed('expectation','Fits grammatically, but an expectation is what people think will happen, but the school celebrated what the students had actually done.')
        ]
      },
      {
        id:'achievement_ctx_4',
        text:'Her proudest ____ was teaching herself to swim at the age of forty.',
        answer:'achievement',
        distractors:[
          diagnosed('mistake','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('regret','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('disappointment','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'achievement_ctx_5',
        text:'It was a great ____ for such a small club to reach the national final against much richer teams.',
        answer:'achievement',
        distractors:[
          diagnosed('mistake','Fits grammatically, but a mistake contradicts great and reach the final.'),
          diagnosed('accident','Fits grammatically, but an accident is something unplanned and harmful, but the club earned its place in the final.'),
          diagnosed('embarrassment','Fits grammatically, but an embarrassment would be shameful, but reaching the final against richer teams is something to be proud of.')
        ]
      },
      {
        id:'achievement_ctx_6',
        text:'Passing every exam with top grades was an ____ that his whole family was proud of.',
        answer:'achievement',
        distractors:[
          diagnosed('accident','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('error','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('obstacle','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('She achievement a lot last year.','achievement is a noun; the verb is achieve.'),
      diagnosed('She made a big achievement.','achievement collocates with accomplish or reach, not make; say it was a big achievement.'),
      diagnosed('Achievements is important.','achievements is plural, so use are.'),
      diagnosed('He is proud for his achievement.','use proud of, not proud for.')
    ],
    patterns:['a major achievement','an achievement in + noun','the achievement of + noun'],
    collocations:['great achievement','sense of achievement','celebrate an achievement'],
    contrasts:[
      diagnosed('success','success is the general result of doing well; an achievement is a specific thing you have done.'),
      diagnosed('attempt','an attempt is trying to do something; an achievement is something successfully done.')
    ]
  },
  elite:{
    definitionDistractors:[
      'belonging to the group with the most members',
      'chosen by the public rather than by experts',
      'famous mainly because of expensive equipment',
      'only just good enough to be allowed to compete',
      'very experienced but no longer competing',
      'trained for a long time but never yet tested'
    ],
    contexts:[
      {
        id:'elite_ctx_1',
        text:'The ____ squad is closed to all but the top one per cent of players in the country, chosen purely on results.',
        answer:'elite',
        distractors:[
          diagnosed('open','Fits grammatically, but an open squad lets anyone join, but closed to all but the top one per cent says entry is limited.'),
          diagnosed('social','Fits grammatically, but a social squad plays for fun, but closed to all but the top one per cent and chosen purely on results says it is for the best.'),
          diagnosed('beginner','Fits grammatically, but a beginner squad is for new players, who cannot be among the top one per cent in the country.')
        ]
      },
      {
        id:'elite_ctx_2',
        text:'Entry to the ____ competition is restricted to the top ten ranked players in the country, so most club players never qualify.',
        answer:'elite',
        distractors:[
          diagnosed('open','Fits grammatically, but an open competition lets anyone enter, but restricted to the top ten ranked players says entry is limited.'),
          diagnosed('social','Fits grammatically, but a social competition is for fun, but restricted to the top ten ranked players says it is for the best.'),
          diagnosed('recreational','Fits grammatically, but a recreational competition is for enjoyment, but restricted to the top ten ranked players says it is for the best.')
        ]
      },
      {
        id:'elite_ctx_3',
        text:'Her coach said she had the ability to reach ____ level, which means competing against the best in the world.',
        answer:'elite',
        distractors:[
          diagnosed('club','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('amateur','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('social','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'elite_ctx_4',
        text:'Scholarships are offered only to ____ sports people, meaning those who rank in the top one per cent nationally.',
        answer:'elite',
        distractors:[
          diagnosed('average','Fits grammatically, but average sports people are in the middle of the range, but meaning those who rank in the top one per cent says the opposite.'),
          diagnosed('casual','Fits grammatically, but casual sports people play for fun, but meaning those who rank in the top one per cent says the opposite.'),
          diagnosed('ordinary','Fits grammatically, but ordinary sports people are not exceptional, but meaning those who rank in the top one per cent says the opposite.')
        ]
      },
      {
        id:'elite_ctx_5',
        text:'Although he trains hard, he is still not good enough for the ____ squad, which only takes the very best players in the country.',
        answer:'elite',
        distractors:[
          diagnosed('open','Fits grammatically, but an open squad takes anyone, but which only takes the very best players says the opposite.'),
          diagnosed('social','Fits grammatically, but a social squad plays for fun, but which only takes the very best players says the opposite.'),
          diagnosed('community','Fits grammatically, but a community squad is based on a local group, but which only takes the very best players in the country says the opposite.')
        ]
      },
      {
        id:'elite_ctx_6',
        text:'Scouts say the ____ footballers they saw at the new academy are among the best fifty players of their age in the whole country.',
        answer:'elite',
        distractors:[
          diagnosed('average','Fits grammatically, but average footballers are in the middle of the range, but among the best fifty in the whole country says the opposite.'),
          diagnosed('ordinary','Fits grammatically, but ordinary footballers are not exceptional, but among the best fifty in the whole country says the opposite.'),
          diagnosed('typical','Fits grammatically, but typical footballers are like most others, but among the best fifty in the whole country says the opposite.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('She is an elite of the team.','elite is mainly an adjective before a noun; use she is one of the elite or an elite player.'),
      diagnosed('He is elite at running a long time.','elite describes a level, not how long he runs; say he is an elite runner.'),
      diagnosed('The elites athletes train every day.','elite as an adjective has no plural s; say the elite athletes.'),
      diagnosed('They are the most elite team.','elite already means the highest level, so most is unnecessary.')
    ],
    patterns:['elite + noun','an elite level of + noun','the elite (of + noun)'],
    collocations:['elite athlete','elite level','elite sport'],
    contrasts:[
      diagnosed('professional','professional means paid to do an activity; elite means among the very best, whether paid or not.'),
      diagnosed('average','average is the opposite end of the scale: ordinary or in the middle.')
    ]
  },
  overwhelming:{
    definitionDistractors:[
      'so small that it is almost impossible to notice',
      'so common that people no longer pay attention to it',
      'happening slowly over a very long period of time',
      'difficult to understand because it is so complicated',
      'more than is needed for a particular purpose',
      'coming as a surprise to everyone who sees it'
    ],
    contexts:[
      {
        id:'overwhelming_ctx_1',
        text:'The support from the home crowd was so ____ that the young players could hardly think or hear their coach.',
        answer:'overwhelming',
        distractors:[
          diagnosed('half-hearted','Fits grammatically, but half-hearted support lacks energy, which contradicts the players hardly being able to think or hear their coach.'),
          diagnosed('gentle','Fits grammatically, but gentle support is soft and quiet, which contradicts the players hardly being able to think or hear their coach.'),
          diagnosed('unobtrusive','Fits grammatically, but unobtrusive support is quiet and easy to ignore, which contradicts the players hardly being able to think or hear their coach.')
        ]
      },
      {
        id:'overwhelming_ctx_2',
        text:'Voters gave the new mayor an ____ majority, with more than ninety per cent supporting her.',
        answer:'overwhelming',
        distractors:[
          diagnosed('insignificant','Fits grammatically, but an insignificant majority is tiny, but more than ninety per cent supporting her shows a huge one.'),
          diagnosed('unconvincing','Fits grammatically, but an unconvincing majority is too small to persuade, but more than ninety per cent supporting her shows a huge one.'),
          diagnosed('inadequate','Fits grammatically, but an inadequate majority is too small, but more than ninety per cent supporting her shows a huge one.')
        ]
      },
      {
        id:'overwhelming_ctx_3',
        text:'After weeks of training, he felt an ____ sense of relief when the race was over, so strong that he cried at the finish line.',
        answer:'overwhelming',
        distractors:[
          diagnosed('ordinary','Fits grammatically, but an ordinary sense of relief is not unusually strong, which contradicts so strong that he cried.'),
          diagnosed('unnoticeable','Fits grammatically, but an unnoticeable sense of relief is too slight to be noticed, which contradicts so strong that he cried.'),
          diagnosed('understated','Fits grammatically, but an understated sense of relief is kept low-key, which contradicts so strong that he cried.')
        ]
      },
      {
        id:'overwhelming_ctx_4',
        text:'There was ____ evidence that the player had broken the rules: the video, the witnesses and his own messages all agreed, and the committee had no doubt.',
        answer:'overwhelming',
        distractors:[
          diagnosed('inconclusive','Fits grammatically, but inconclusive evidence leaves the matter in doubt, which contradicts the committee had no doubt.'),
          diagnosed('conflicting','Fits grammatically, but conflicting evidence disagrees with itself, which contradicts the video, witnesses and messages all agreed.'),
          diagnosed('insufficient','Fits grammatically, but insufficient evidence is not enough to decide, which contradicts the committee had no doubt.')
        ]
      },
      {
        id:'overwhelming_ctx_5',
        text:'The amount of homework this week has been ____: it was so much that many students stopped trying to finish it all.',
        answer:'overwhelming',
        distractors:[
          diagnosed('manageable','Fits grammatically, but manageable means possible to cope with, but so much that many students stopped trying says the opposite.'),
          diagnosed('reasonable','Fits grammatically, but reasonable means fair, but so much that many students stopped trying says the opposite.'),
          diagnosed('unremarkable','Fits grammatically, but unremarkable means nothing special, but so much that many students stopped trying shows it was extreme.')
        ]
      },
      {
        id:'overwhelming_ctx_6',
        text:'An ____ response from fans, with so many messages that the staff could not read or answer them all, surprised the club.',
        answer:'overwhelming',
        distractors:[
          diagnosed('underwhelming','Fits grammatically, but an underwhelming response is a disappointing one, which contradicts so many messages that the staff could not answer them all.'),
          diagnosed('insufficient','Fits grammatically, but an insufficient response is not enough, which contradicts so many messages that the staff could not answer them all.'),
          diagnosed('unenthusiastic','Fits grammatically, but an unenthusiastic response shows little interest, which contradicts so many messages that the staff could not answer them all.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('The crowd was overwhelming and I felt overwhelming.','overwhelming describes what causes the feeling; the person who feels it is overwhelmed.'),
      diagnosed('They won overwhelming the match.','overwhelming is an adjective; the adverb is overwhelmingly, and it would go before the verb.'),
      diagnosed('It was an overwhelm victory.','the adjective is overwhelming.'),
      diagnosed('She was overwhelming by the attention.','she was overwhelmed by the attention.')
    ],
    patterns:['overwhelming + noun','be overwhelming','overwhelmingly + adjective'],
    collocations:['overwhelming majority','overwhelming evidence','overwhelming support'],
    contrasts:[
      diagnosed('overwhelmed','overwhelmed describes the person affected; overwhelming describes the thing that causes the feeling.'),
      diagnosed('huge','huge only means very large; overwhelming adds that it is too great to manage or resist.')
    ]
  },
  generation:{
    definitionDistractors:[
      'a group of people who work for the same company',
      'a period of one hundred years in history',
      'a family that includes parents, children and grandparents',
      'the group of people who live in the same town',
      'a number of events that happen one after another',
      'a team of young players chosen for a competition'
    ],
    contexts:[
      {
        id:'generation_ctx_1',
        text:'People born in the nineties are often described as part of the same ____, because they grew up with similar technology.',
        answer:'generation',
        distractors:[
          diagnosed('family','Fits grammatically, but a family is made up of relatives, not people born in the same period.'),
          diagnosed('neighbourhood','Fits grammatically, but a neighbourhood is a place where people live, not a group defined by when they were born.'),
          diagnosed('school','Fits grammatically, but a school is a place of education, not a group defined by when they were born.')
        ]
      },
      {
        id:'generation_ctx_2',
        text:'A new ____ of players, all born after the year 2005, is replacing the champions who dominated the sport for years.',
        answer:'generation',
        distractors:[
          diagnosed('season','Fits grammatically, but a season is part of the year, not a group of players born after 2005.'),
          diagnosed('century','Fits grammatically, but a century is one hundred years, not a group of players born after 2005.'),
          diagnosed('month','Fits grammatically, but a month is a period of about thirty days, not a group of players born after 2005.')
        ]
      },
      {
        id:'generation_ctx_3',
        text:'Each ____ of people, born within a few years of each other, grows up with different music, technology and ideas about work.',
        answer:'generation',
        distractors:[
          diagnosed('family','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('community','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('neighbourhood','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'generation_ctx_4',
        text:'Sports clubs hope that parents will pass their love of football to the next ____.',
        answer:'generation',
        distractors:[
          diagnosed('season','Fits grammatically, but a season is part of the year, and love of football is passed to people, not to a season.'),
          diagnosed('family','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('neighbourhood','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'generation_ctx_5',
        text:'Anyone whose birth falls within the same fifteen years belongs to one ____ and often shares similar views about money and work.',
        answer:'generation',
        distractors:[
          diagnosed('decade','Fits grammatically, but a decade is ten years, not fifteen, and it is a period of time rather than a group of people.'),
          diagnosed('family','Fits grammatically, but a family is made up of relatives, not people born in the same years.'),
          diagnosed('neighbourhood','Fits grammatically, but a neighbourhood is a place where people live, not a group defined by birth years.')
        ]
      },
      {
        id:'generation_ctx_6',
        text:'The gap between grandparents and their grandchildren shows up in how each ____ spends its free time.',
        answer:'generation',
        distractors:[
          diagnosed('century','Fits grammatically, but a century is one hundred years, and it does not spend free time.'),
          diagnosed('decade','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('month','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('Each generations has its own music.','after each use the singular generation.'),
      diagnosed('Three generation of my family live here.','generation needs the plural s after three.'),
      diagnosed('She is the generation of my brother.','generation names a group of people born around the same time, not one person.'),
      diagnosed('A generation is a person who was born in 1990.','a generation is a whole group of people born around the same time, not one person.')
    ],
    patterns:['a generation of + noun','the older / younger generation','generation gap'],
    collocations:['older generation','younger generation','new generation'],
    contrasts:[
      diagnosed('age group','an age group can cover any range of ages; a generation is people born and living at roughly the same time.'),
      diagnosed('family','a family is related people; a generation can include people who are not related.')
    ]
  },
  challenge:{
    definitionDistractors:[
      'a prize given to the winner of a competition',
      'a mistake that cannot be corrected later',
      'a rule that must be followed by everyone',
      'a situation that makes life easier for people',
      'a group of people who are chosen to represent a country',
      'a skill that a person was born with'
    ],
    contexts:[
      {
        id:'challenge_ctx_1',
        text:'The coach set the squad a ____: to run ten kilometres without stopping, to see who could push their limits.',
        answer:'challenge',
        distractors:[
          diagnosed('reward','Fits grammatically, but a reward is a prize, but to see who could push their limits describes a difficult test.'),
          diagnosed('holiday','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('timetable','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'challenge_ctx_2',
        text:'Playing the champions away from home will be a serious ____ for our young team, but we are ready to try.',
        answer:'challenge',
        distractors:[
          diagnosed('advantage','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('relief','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('bonus','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'challenge_ctx_3',
        text:'Adults learning an instrument face a real ____ in staying patient when progress feels slow.',
        answer:'challenge',
        distractors:[
          diagnosed('hobby','Fits grammatically, but a hobby is an activity chosen for pleasure, not a difficulty that adults face.'),
          diagnosed('habit','Fits grammatically, but a habit is something done regularly, not a difficulty that adults face.'),
          diagnosed('privilege','Fits grammatically, but a privilege is a special advantage, not a difficulty that adults face.')
        ]
      },
      {
        id:'challenge_ctx_4',
        text:'Running a marathon for charity is a ____ for most people, because they have never run more than a few kilometres before.',
        answer:'challenge',
        distractors:[
          diagnosed('routine','Fits grammatically, but a routine is a regular set of actions, which does not fit people who have never run more than a few kilometres.'),
          diagnosed('custom','Fits grammatically, but a custom is a traditional way of behaving, which does not fit people who have never run more than a few kilometres.'),
          diagnosed('ritual','Fits grammatically, but a ritual is a fixed ceremony, which does not fit people who have never run more than a few kilometres.')
        ]
      },
      {
        id:'challenge_ctx_5',
        text:'Finding enough time for training while studying full-time is the biggest ____ for most athletes at university.',
        answer:'challenge',
        distractors:[
          diagnosed('advantage','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('benefit','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('reward','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'challenge_ctx_6',
        text:'The new course is a ____ even for experienced players: every exercise tests a different skill.',
        answer:'challenge',
        distractors:[
          diagnosed('formality','Fits grammatically, but a formality is a step that is easy and expected, but every exercise tests a different skill.'),
          diagnosed('breeze','Fits grammatically, but a breeze is something very easy, but every exercise tests a different skill.'),
          diagnosed('relief','Fits grammatically, but a relief is the end of a worry, but every exercise tests a different skill.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('It is a big challenge for I.','after for use the object pronoun me.'),
      diagnosed('She challenges very much.','challenge as a verb needs an object, such as she challenges her teammates.'),
      diagnosed('We accepted the challenge to win.','the pattern is accept the challenge of winning.'),
      diagnosed('That is a challenging for me.','challenging is an adjective; use a challenge for me or that is challenging for me.')
    ],
    patterns:['face a challenge','rise to a challenge','a challenge for + person'],
    collocations:['major challenge','face a challenge','meet the challenge'],
    contrasts:[
      diagnosed('problem','a problem is something wrong that needs fixing; a challenge is a difficult task that tests ability.'),
      diagnosed('opportunity','an opportunity is a chance; a challenge is a difficulty that tests you.')
    ]
  },
  solution:{
    definitionDistractors:[
      'the cause of a difficulty that someone is facing',
      'a question that a teacher asks the whole class',
      'the result of a competition after the last game',
      'an opinion about how well a team has played',
      'a rule that stops people from solving a problem',
      'a reason that people give for their mistakes'
    ],
    contexts:[
      {
        id:'solution_ctx_1',
        text:'The club finally found a ____ that ended the shortage of training space: it shared the school gym.',
        answer:'solution',
        distractors:[
          diagnosed('complaint','Fits grammatically, but a complaint is an expression of dissatisfaction, which does not end a shortage.'),
          diagnosed('delay','Fits grammatically, but a delay is a late arrival, which does not end a shortage.'),
          diagnosed('rumour','Fits grammatically, but a rumour is an unproved story, which does not end a shortage.')
        ]
      },
      {
        id:'solution_ctx_2',
        text:'One practical ____ to the noise problem is to move the matches to the afternoon.',
        answer:'solution',
        distractors:[
          diagnosed('obstacle','Fits grammatically, but an obstacle makes a problem harder, but to move the matches describes a way of ending the noise.'),
          diagnosed('threat','Fits grammatically, but a threat is a danger, but to move the matches describes a way of ending the noise.'),
          diagnosed('cause','Fits grammatically, but a cause is what creates a problem, but to move the matches describes a way of ending the noise.')
        ]
      },
      {
        id:'solution_ctx_3',
        text:'There is no simple ____ to the problem of injuries among young athletes, but good coaching helps.',
        answer:'solution',
        distractors:[
          diagnosed('definition','Fits grammatically, but a definition says what a word means, but good coaching helps describes a way of reducing the problem.'),
          diagnosed('prediction','Fits grammatically, but a prediction says what will happen, but good coaching helps describes a way of reducing the problem.'),
          diagnosed('excuse','Fits grammatically, but an excuse defends a failure, but good coaching helps describes a way of reducing the problem.')
        ]
      },
      {
        id:'solution_ctx_4',
        text:'The mechanic said there was no easy ____ to the engine fault: the whole part would have to be replaced.',
        answer:'solution',
        distractors:[
          diagnosed('objection','Fits grammatically, but an objection is a complaint, but the whole part would have to be replaced describes a way of dealing with the fault.'),
          diagnosed('warning','Fits grammatically, but a warning tells people about danger, but the whole part would have to be replaced describes a way of dealing with the fault.'),
          diagnosed('threat','Fits grammatically, but a threat is a danger, but the whole part would have to be replaced describes a way of dealing with the fault.')
        ]
      },
      {
        id:'solution_ctx_5',
        text:'The puzzle was finally finished when the students found the ____ that explained all of the clues.',
        answer:'solution',
        distractors:[
          diagnosed('hint','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('penalty','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('question','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'solution_ctx_6',
        text:'Sharing equipment turned out to be a cheap ____ to the club\'s money problem, since no new balls had to be bought.',
        answer:'solution',
        distractors:[
          diagnosed('penalty','Fits grammatically, but a penalty is a punishment, which does not describe a way of ending a money problem.'),
          diagnosed('symptom','Fits grammatically, but a symptom is a sign of a problem, not a way of ending it.'),
          diagnosed('nuisance','Fits grammatically, but a nuisance is an annoyance, which does not describe a way of ending a money problem.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('The solution of the problem is difficult.','the usual pattern is solution to the problem.'),
      diagnosed('I solution the puzzle.','solution is a noun; the verb is solve.'),
      diagnosed('We found a solve.','solve is a verb; the noun is solution.'),
      diagnosed('The problem has a many solution.','solution needs the plural solutions after many.')
    ],
    patterns:['a solution to + problem','find a solution','a solution for + noun'],
    collocations:['find a solution','practical solution','simple solution'],
    contrasts:[
      diagnosed('problem','a problem is a difficulty; a solution is a way of dealing with it.'),
      diagnosed('answer','answer is close in meaning, but a solution usually deals with a problem rather than a question.')
    ]
  },
  pastime:{
    definitionDistractors:[
      'a job that someone does for money in the evening',
      'an event that takes place once every year',
      'a rule of a game that is not written down',
      'a short break that people take during work',
      'a skill that is learned at school or college',
      'a regular chore that someone must do at home'
    ],
    contexts:[
      {
        id:'pastime_ctx_1',
        text:'Collecting old coins is a popular ____ among retired people, who enjoy it in the afternoons.',
        answer:'pastime',
        distractors:[
          diagnosed('profession','Fits grammatically, but a profession is a job, but who enjoy it in the afternoons describes something done for pleasure.'),
          diagnosed('duty','Fits grammatically, but a duty is something you must do, but who enjoy it describes something done for pleasure.'),
          diagnosed('sport','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'pastime_ctx_2',
        text:'For many teenagers, playing video games is a favourite ____, not a way of earning money.',
        answer:'pastime',
        distractors:[
          diagnosed('job','Fits grammatically, but a job is work done for money, which the sentence rules out with not a way of earning money.'),
          diagnosed('subject','Fits grammatically, but a subject is something studied at school, not something done for enjoyment.'),
          diagnosed('lesson','Fits grammatically, but a lesson is a period of teaching, not something done for enjoyment.')
        ]
      },
      {
        id:'pastime_ctx_3',
        text:'Cricket began as a village ____, played on summer evenings for fun, before it became a professional sport.',
        answer:'pastime',
        distractors:[
          diagnosed('business','Fits grammatically, but a business is run to earn money, but played on summer evenings for fun describes an activity enjoyed.'),
          diagnosed('duty','Fits grammatically, but a duty is something you must do, but for fun describes an activity enjoyed.'),
          diagnosed('profession','Fits grammatically, but a profession is a job, but for fun and before it became a professional sport rule it out.')
        ]
      },
      {
        id:'pastime_ctx_4',
        text:'Her favourite ____ is walking in the hills on Sunday mornings, when she has no homework.',
        answer:'pastime',
        distractors:[
          diagnosed('subject','Fits grammatically, but a subject is something studied at school, but she has no homework shows this is free-time enjoyment.'),
          diagnosed('lesson','Fits grammatically, but a lesson is a period of teaching, but she has no homework shows this is free-time enjoyment.'),
          diagnosed('task','Fits grammatically, but a task is a piece of work, but she has no homework shows this is free-time enjoyment.')
        ]
      },
      {
        id:'pastime_ctx_5',
        text:'Not everyone sees fishing as an exciting ____, but millions of people enjoy it as a relaxing activity every week.',
        answer:'pastime',
        distractors:[
          diagnosed('subject','Fits grammatically, but a subject is something studied at school, but millions of people enjoy it as a relaxing activity.'),
          diagnosed('lesson','Fits grammatically, but a lesson is a period of teaching, but millions of people enjoy it as a relaxing activity.'),
          diagnosed('season','Fits grammatically, but a season is part of the year, not an activity people do every week.')
        ]
      },
      {
        id:'pastime_ctx_6',
        text:'Many parents want their children to find a ____ for their free time that is not connected to screens, such as painting or gardening.',
        answer:'pastime',
        distractors:[
          diagnosed('career','Fits grammatically, but a career is a long-term job, but for their free time says the activity is for enjoyment.'),
          diagnosed('subject','Fits grammatically, but a subject is studied at school, but for their free time says the activity is for enjoyment.'),
          diagnosed('profession','Fits grammatically, but a profession is a job, but for their free time says the activity is for enjoyment.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('Football is my pastime job.','a pastime is done for enjoyment in free time, not as a job.'),
      diagnosed('I pastime on Sundays.','pastime is a noun, not a verb; say my pastime is... or I spend time on...'),
      diagnosed('Reading is a pastimes.','pastime needs a singular article with a singular noun, so say a pastime.'),
      diagnosed('His pastime is to work in the factory.','a pastime is done for enjoyment, not work.')
    ],
    patterns:['a favourite pastime','a popular pastime','enjoy a pastime'],
    collocations:['popular pastime','favourite pastime','national pastime'],
    contrasts:[
      diagnosed('hobby','hobby is very close in meaning; pastime is slightly more formal and often describes something many people do.'),
      diagnosed('chore','a chore is a task you have to do, whereas a pastime is something you do for enjoyment.')
    ]
  },
  feat:{
    definitionDistractors:[
      'a mistake that has serious results',
      'a strong feeling of worry about danger',
      'a meeting of two people for the first time',
      'the part of the body used for walking',
      'a result that nobody expected to happen',
      'a rule that changes how a game is played'
    ],
    contexts:[
      {
        id:'feat_ctx_1',
        text:'After two years of daily training, she completed the mountain run in under an hour, a ____ that she had earned through practice rather than chance.',
        answer:'feat',
        distractors:[
          diagnosed('fluke','Fits grammatically, but a fluke is an accident, which contradicts earned through practice rather than chance.'),
          diagnosed('coincidence','Fits grammatically, but a coincidence happens by chance, which contradicts earned through practice rather than chance.'),
          diagnosed('gift','Fits grammatically, but a gift is something given, which contradicts earned through practice.')
        ]
      },
      {
        id:'feat_ctx_2',
        text:'Finishing the race with a broken ankle was a ____ that earned the runner a standing ovation from the whole stadium.',
        answer:'feat',
        distractors:[
          diagnosed('flop','Fits grammatically, but a flop is a failure, which does not earn a standing ovation.'),
          diagnosed('blunder','Fits grammatically, but a blunder is a serious mistake, which does not earn a standing ovation.'),
          diagnosed('mistake','Fits grammatically, but a mistake is an error, which does not earn a standing ovation.')
        ]
      },
      {
        id:'feat_ctx_3',
        text:'Walking a tightrope between two skyscrapers was a ____ that left the whole crowd speechless with admiration.',
        answer:'feat',
        distractors:[
          diagnosed('fear','Fits grammatically, but fear is a feeling the walker has, not something that leaves a crowd speechless with admiration.'),
          diagnosed('threat','Fits grammatically, but a threat is a danger, which does not cause speechless admiration.'),
          diagnosed('scandal','Fits grammatically, but a scandal causes shock and blame, not admiration.')
        ]
      },
      {
        id:'feat_ctx_4',
        text:'Reaching the summit in under five hours after only two months of training was a ____ that surprised even her coach.',
        answer:'feat',
        distractors:[
          diagnosed('habit','Fits grammatically, but a habit is something done repeatedly, but reaching the summit once is a single achievement.'),
          diagnosed('custom','Fits grammatically, but a custom is a traditional way of behaving, but reaching the summit once is a single achievement.'),
          diagnosed('routine','Fits grammatically, but a routine is a regular set of actions, but reaching the summit once is a single achievement.')
        ]
      },
      {
        id:'feat_ctx_5',
        text:'Fixing the damaged roof in a single weekend was a remarkable ____, and the volunteers did it all for free.',
        answer:'feat',
        distractors:[
          diagnosed('fee','Fits grammatically, but a fee is a payment, which contradicts the volunteers did it all for free.'),
          diagnosed('price','Fits grammatically, but a price is an amount paid, which contradicts the volunteers did it all for free.'),
          diagnosed('charge','Fits grammatically, but a charge is an amount asked for payment, which contradicts the volunteers did it all for free.')
        ]
      },
      {
        id:'feat_ctx_6',
        text:'Arranging a trip for three hundred students in one afternoon was quite a ____, and the teachers still talk about how smoothly it went.',
        answer:'feat',
        distractors:[
          diagnosed('mess','Fits grammatically, but a mess is a badly handled situation, which contradicts how smoothly it went.'),
          diagnosed('muddle','Fits grammatically, but a muddle is a confused situation, which contradicts how smoothly it went.'),
          diagnosed('shambles','Fits grammatically, but a shambles is a disorganised failure, which contradicts how smoothly it went.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('He did a great feet in the final.','feet is the plural of foot; the word for a great achievement is feat.'),
      diagnosed('She feat the record.','feat is a noun; the verb meaning to defeat is beat.'),
      diagnosed('It was a feat of two hours.','a feat is an impressive achievement, not a length of time.'),
      diagnosed('That is a feat what I did yesterday.','a feat names the achievement itself, so say that was a feat.')
    ],
    patterns:['a feat of + noun','no small feat','a remarkable feat'],
    collocations:['remarkable feat','amazing feat','feat of strength'],
    contrasts:[
      diagnosed('achievement','achievement is the general word; feat suggests something particularly difficult or impressive.'),
      diagnosed('feet','feet is the plural of foot and sounds the same as the first part of feat in many accents, but means parts of the body.')
    ]
  },
  regardless:{
    definitionDistractors:[
      'after something else has already happened',
      'instead of what was first planned',
      'because of what has been said earlier',
      'in spite of the fact that nobody agrees',
      'according to the rules that were agreed',
      'without telling anyone what has happened'
    ],
    contexts:[
      {
        id:'regardless_ctx_1',
        text:'The match will take place ____ of the weather, so bring waterproof clothes just in case.',
        answer:'regardless',
        distractors:[
          diagnosed('instead','Fits grammatically, but instead of the weather would mean the weather replaces the match, which does not fit bring waterproof clothes just in case.'),
          diagnosed('apart','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('irrelevant','Fits grammatically, but irrelevant of is not used in this pattern; the standard phrase is irrespective of or regardless of.')
        ]
      },
      {
        id:'regardless_ctx_2',
        text:'Every student must attend training, ____ of their ability or experience, so beginners and the best players train together.',
        answer:'regardless',
        distractors:[
          diagnosed('because','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('instead','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('nevertheless','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'regardless_ctx_3',
        text:'Their best striker was injured, which was a good reason to stop, but the team carried on with the final ____ of the injury.',
        answer:'regardless',
        distractors:[
          diagnosed('because','Fits grammatically, but because of the injury would make it the reason for carrying on, but the sentence calls it a good reason to stop.'),
          diagnosed('ahead','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('afterwards','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.')
        ]
      },
      {
        id:'regardless_ctx_4',
        text:'The school offers a free place to every applicant, ____ of family income, so rich and poor families are treated the same.',
        answer:'regardless',
        distractors:[
          diagnosed('because','Fits grammatically, but because of family income would make income the reason, but rich and poor families are treated the same.'),
          diagnosed('instead','This word does not give the meaning the sentence needs, so it cannot complete the sentence correctly.'),
          diagnosed('out','Fits grammatically, but out of family income does not fit the idea that income does not matter.')
        ]
      },
      {
        id:'regardless_ctx_5',
        text:'You must submit the report by Friday, ____ of whether you have finished the final section.',
        answer:'regardless',
        distractors:[
          diagnosed('because','Fits grammatically, but because of whether you have finished would give a reason, whereas the sentence says it does not matter.'),
          diagnosed('instead','Fits grammatically, but instead of whether you have finished does not fit the idea that it does not matter.'),
          diagnosed('unaffected','Fits grammatically, but unaffected of is not used in this pattern; the standard phrase is regardless of.')
        ]
      },
      {
        id:'regardless_ctx_6',
        text:'He kept running, ____ of the pain in his knee and the cheers telling him to stop.',
        answer:'regardless',
        distractors:[
          diagnosed('because','Fits grammatically, but because of the pain would make it the reason to keep running, but the cheers telling him to stop show he ignored them.'),
          diagnosed('in','Fits grammatically, but in of the pain is not a phrase; the standard phrase is regardless of.'),
          diagnosed('instead','Fits grammatically, but instead of the pain does not fit the idea of ignoring pain and cheers.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('Regardless the weather, we will play.','the phrase is regardless of the weather.'),
      diagnosed('He is regardless of the rules.','regardless of describes ignoring something; say he acted regardless of the rules.'),
      diagnosed('Regardless to the cost, we will go.','the phrase is regardless of the cost, not regardless to.'),
      diagnosed('The regardless team won.','regardless is not used before a noun like an adjective.')
    ],
    patterns:['regardless of + noun','regardless of + wh- clause','... regardless (at the end)'],
    collocations:['regardless of age','regardless of the weather','carry on regardless'],
    contrasts:[
      diagnosed('despite','despite is followed directly by a noun or -ing form and does not use of; regardless is followed by of.'),
      diagnosed('nevertheless','nevertheless links two sentences or clauses; regardless of is followed by the thing that does not matter.')
    ]
  },
  monetary:{
    definitionDistractors:[
      'related to the strength of a person’s body',
      'related to the length of time that something takes',
      'related to the rules of a competition',
      'related to the feelings of a team',
      'related to the difficulty of a task',
      'related to the number of people who attend'
    ],
    contexts:[
      {
        id:'monetary_ctx_1',
        text:'The trophy has little ____ value, but it means a great deal to the winners.',
        answer:'monetary',
        distractors:[
          diagnosed('momentary','Fits grammatically, but momentary means lasting a very short time, but value in this sentence is contrasted with what it means to the winners.'),
          diagnosed('military','Fits grammatically, but military relates to armed forces, which does not fit value of a trophy.'),
          diagnosed('monthly','Fits grammatically, but monthly means happening every month, which does not fit value of a trophy.')
        ]
      },
      {
        id:'monetary_ctx_2',
        text:'Volunteers receive no ____ reward for helping at the tournament, only a free t-shirt.',
        answer:'monetary',
        distractors:[
          diagnosed('mandatory','Fits grammatically, but mandatory means compulsory, which does not describe a reward.'),
          diagnosed('momentary','Fits grammatically, but momentary means lasting a very short time, which does not describe the kind of reward.'),
          diagnosed('military','This word cannot complete the sentence: it does not give a correct, natural meaning here.')
        ]
      },
      {
        id:'monetary_ctx_3',
        text:'The club offered ____ support, giving each student a small payment toward travel costs.',
        answer:'monetary',
        distractors:[
          diagnosed('moral','Fits grammatically, but moral support is encouragement, but giving each student a small payment is financial.'),
          diagnosed('military','Fits grammatically, but military relates to armed forces, which does not fit a small payment toward travel costs.'),
          diagnosed('momentary','Fits grammatically, but momentary means lasting a very short time, which does not describe a payment.')
        ]
      },
      {
        id:'monetary_ctx_4',
        text:'Some prizes are ____: winners receive £10,000 in cash to spend as they choose, while medals and cups have no exchangeable financial value.',
        answer:'monetary',
        distractors:[
          diagnosed('mandatory','Fits grammatically, but mandatory means compulsory, which does not describe £10,000 in cash.'),
          diagnosed('ceremonial','Fits grammatically, but ceremonial prizes are given for show, but £10,000 to spend as winners choose has substantial financial value.'),
          diagnosed('symbolic','Fits grammatically, but symbolic prizes only stand for something, but £10,000 to spend as winners choose has substantial financial value.')
        ]
      },
      {
        id:'monetary_ctx_5',
        text:'The study found that happiness depends only partly on ____ gain, such as a higher salary or a lottery win; friends and health matter more.',
        answer:'monetary',
        distractors:[
          diagnosed('momentary','Fits grammatically, but momentary means lasting a very short time, which does not describe a higher salary or a lottery win.'),
          diagnosed('moral','Fits grammatically, but moral relates to right and wrong, which does not describe a higher salary or a lottery win.'),
          diagnosed('mental','Fits grammatically, but mental relates to the mind, which does not describe a higher salary or a lottery win.')
        ]
      },
      {
        id:'monetary_ctx_6',
        text:'The high ____ cost of the stadium, nearly two hundred million pounds, made the council decide to share it with a neighbouring town.',
        answer:'monetary',
        distractors:[
          diagnosed('moral','Fits grammatically, but moral relates to right and wrong, which does not describe a cost of nearly two hundred million pounds.'),
          diagnosed('mental','Fits grammatically, but mental relates to the mind, which does not describe a cost of nearly two hundred million pounds.'),
          diagnosed('mandatory','Fits grammatically, but mandatory means compulsory, which does not describe a cost of nearly two hundred million pounds.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('The monetary was too high.','monetary is an adjective and needs a noun, such as the monetary cost.'),
      diagnosed('She received a monetary of fifty pounds.','monetary is an adjective; the noun is money.'),
      diagnosed('He has a lot of monetary.','monetary is an adjective and needs a noun, such as monetary support.'),
      diagnosed('It has a monetary meaning for me.','monetary means related to money; for personal meaning say sentimental value.')
    ],
    patterns:['monetary + noun','monetary value','monetary reward'],
    collocations:['monetary value','monetary reward','monetary cost'],
    contrasts:[
      diagnosed('financial','financial is very close and slightly more common; monetary is often used with value, reward or policy.'),
      diagnosed('sentimental','sentimental value comes from feelings, whereas monetary value comes from money.')
    ]
  },
  estimated:{
    definitionDistractors:[
      'known exactly because it has been measured carefully',
      'officially announced after the final result was checked',
      'expected to happen at a time that is not yet decided',
      'guessed by someone who has no information at all',
      'measured by a machine instead of by a person',
      'recorded after the event had finished'
    ],
    contexts:[
      {
        id:'estimated_ctx_1',
        text:'The ____ crowd at the final was fifty thousand, though officials admitted that nobody had counted exactly.',
        answer:'estimated',
        distractors:[
          diagnosed('exact','Fits grammatically, but exact contradicts nobody had counted exactly.'),
          diagnosed('confirmed','Fits grammatically, but confirmed means checked and certain, which contradicts nobody had counted exactly.'),
          diagnosed('registered','Fits grammatically, but registered would mean recorded one by one, which contradicts nobody had counted exactly.')
        ]
      },
      {
        id:'estimated_ctx_2',
        text:'The ____ cost of the new stadium is two hundred million pounds, but the final bill may be higher.',
        answer:'estimated',
        distractors:[
          diagnosed('exact','Fits grammatically, but exact contradicts the final bill may be higher.'),
          diagnosed('actual','Fits grammatically, but actual means the real figure, but the final bill may be higher shows this figure is not final.'),
          diagnosed('guaranteed','Fits grammatically, but guaranteed means promised, which contradicts the final bill may be higher.')
        ]
      },
      {
        id:'estimated_ctx_3',
        text:'The ____ figure of about three thousand visitors a day was published by officials, though nobody knew the true number.',
        answer:'estimated',
        distractors:[
          diagnosed('exact','Fits grammatically, but exact contradicts nobody knew the true number.'),
          diagnosed('confirmed','Fits grammatically, but confirmed means proved to be true, which contradicts nobody knew the true number.'),
          diagnosed('counted','Fits grammatically, but a counted figure comes from counting every visitor, which contradicts nobody knew the true number.')
        ]
      },
      {
        id:'estimated_ctx_4',
        text:'The ____ distance of the race is ten kilometres, but the course has not yet been measured.',
        answer:'estimated',
        distractors:[
          diagnosed('exact','Fits grammatically, but exact contradicts the course has not yet been measured.'),
          diagnosed('measured','Fits grammatically, but measured contradicts the course has not yet been measured.'),
          diagnosed('certified','Fits grammatically, but certified means officially checked and confirmed, which contradicts the course has not yet been measured.')
        ]
      },
      {
        id:'estimated_ctx_5',
        text:'Because the exact date cannot be known, scientists can only give ____ ages for the fossil.',
        answer:'estimated',
        distractors:[
          diagnosed('exact','Fits grammatically, but exact contradicts the exact date cannot be known.'),
          diagnosed('precise','Fits grammatically, but precise means exact, which contradicts the exact date cannot be known.'),
          diagnosed('pinpoint','Fits grammatically, but pinpoint means exact to a particular point, which contradicts the exact date cannot be known.')
        ]
      },
      {
        id:'estimated_ctx_6',
        text:'Her ____ finishing time is two hours, but it depends on the weather on the day.',
        answer:'estimated',
        distractors:[
          diagnosed('final','Fits grammatically, but final means no longer able to change, but it depends on the weather shows it can change.'),
          diagnosed('confirmed','Fits grammatically, but confirmed means checked and certain, but it depends on the weather shows it is only a guess.'),
          diagnosed('recorded','Fits grammatically, but recorded means already measured, but it depends on the weather shows it has not happened yet.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('The estimated is fifty people.','estimated is an adjective and needs a noun, such as the estimated number.'),
      diagnosed('We estimated the exactly cost.','estimate means calculate approximately, so it does not go with exactly.'),
      diagnosed('The estimate number is high.','the adjective before a noun is estimated.'),
      diagnosed('There was an estimated of fifty people.','estimated is an adjective; the noun is estimate.')
    ],
    patterns:['an estimated + noun','estimated at + number','an estimated + number of + noun'],
    collocations:['estimated cost','estimated number','estimated time of arrival'],
    contrasts:[
      diagnosed('exact','exact is the opposite of estimated: known precisely.'),
      diagnosed('expected','expected means thought likely to happen; estimated means calculated roughly.')
    ]
  }
});
