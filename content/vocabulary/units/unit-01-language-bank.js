const diagnosed = (text, reason) => ({ text, reason });

export default Object.freeze({
  leisure:{
    definitionDistractors:[
      'time spent doing paid work or employment',
      'time reserved for lessons, homework, or study',
      'time spent travelling from one place to another',
      'a planned period of organised physical training',
      'time required to finish a particular task',
      'a break in activity caused by an unexpected delay'
    ],
    spellingErrors:['leisur','lesiure','leisuree','liesure','leasure','leisuer'],
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
        text:'The council built new ____ facilities so residents could exercise and relax after work.',
        answer:'leisure',
        distractors:[
          diagnosed('office','Can modify facilities, but offices are for work rather than recreation.'),
          diagnosed('factory','Can modify facilities, but factories are workplaces rather than places for recreation.'),
          diagnosed('school','Can modify facilities, but the sentence specifies facilities for residents to relax after work, not for lessons.')
        ]
      },
      {
        id:'leisure_ctx_3',
        text:'Reading and gardening are popular ____ activities among retired people.',
        answer:'leisure',
        distractors:[
          diagnosed('work','Fits before activities, but reading and gardening are described here as recreation.'),
          diagnosed('school','Fits before activities, but the sentence refers to retired people and free-time pursuits.'),
          diagnosed('medical','Fits before activities grammatically, but the examples are recreational rather than medical.')
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
        text:'The hotel has a ____ centre with a swimming pool and gym.',
        answer:'leisure',
        distractors:[
          diagnosed('business','Can modify centre, but a pool and gym identify a recreation facility rather than a business centre.'),
          diagnosed('conference','Can modify centre, but a conference centre is for meetings, not the facilities described.'),
          diagnosed('medical','Can modify centre, but the sentence describes recreation facilities rather than treatment services.')
        ]
      },
      {
        id:'leisure_ctx_6',
        text:'Cycling started as a ____ activity for her before becoming a full-time job.',
        answer:'leisure',
        distractors:[
          diagnosed('professional','Fits grammatically, but contradicts the contrast with becoming a full-time job later.'),
          diagnosed('paid','Fits grammatically, but contradicts the idea that it only later became a job.'),
          diagnosed('business','Fits grammatically, but the sentence contrasts recreation with later employment.')
        ]
      }
    ],
    misuseSentences:[
      diagnosed('She does leisure every weekend.','leisure is not normally used as a countable activity after do; name the activity or use a phrase such as leisure activity.'),
      diagnosed('He has many leisures after work.','leisure is normally uncountable in this sense.'),
      diagnosed('They leisure at the sports centre.','leisure is not normally used as a verb.'),
      diagnosed('The club gives students a leisure.','leisure is not normally used as a singular countable noun meaning a period of free time.')
    ],
    patterns:['leisure time','leisure activity','leisure centre','leisure facilities'],
    collocations:['spend leisure time','leisure activities','leisure facilities'],
    contrasts:[
      diagnosed('work','work is time or activity connected with duties or employment; leisure is time free from those duties.'),
      diagnosed('free time','free time is the closest everyday paraphrase of leisure in this unit sense.')
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
    spellingErrors:['aviod','avoyd','avoide','avoied','avode','avoidd'],
    contexts:[
      {
        id:'avoid_ctx_1',
        text:'Try to ____ eating a big meal just before you swim.',
        answer:'avoid',
        distractors:[
          diagnosed('continue','Grammatically fits before -ing, but gives the opposite advice.'),
          diagnosed('consider','Grammatically fits before -ing, but means think about doing it rather than keep away from it.'),
          diagnosed('enjoy','Grammatically fits before -ing, but expresses pleasure rather than keeping away from the action.')
        ]
      },
      {
        id:'avoid_ctx_2',
        text:'The new bypass helps commuters ____ the busiest roads.',
        answer:'avoid',
        distractors:[
          diagnosed('use','Grammatically fits the object, but means travel on those roads rather than keep away from them.'),
          diagnosed('follow','Grammatically fits the object, but means travel along those roads.'),
          diagnosed('enter','Grammatically fits the object, but means go onto those roads.')
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
          diagnosed('reach','Grammatically fits, but means arrive at the roadworks.'),
          diagnosed('cross','Grammatically fits, but means travel through the roadworks.'),
          diagnosed('follow','Grammatically fits, but means travel along the affected route.')
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
    spellingErrors:['preferance','prefrence','prefference','preferrence','prefernce','preferense'],
    contexts:[
      {
        id:'preference_ctx_1',
        text:'The survey showed that most people have a strong ____ for fresh food over tinned food.',
        answer:'preference',
        distractors:[
          diagnosed('need','Fits grammatically, but a need is something required, while over tinned food shows one option being favoured.'),
          diagnosed('demand','Fits grammatically, but demand means how much people want to buy a product, not one option being liked more than another.'),
          diagnosed('concern','Fits grammatically, but concern means worry; nothing in the sentence is a worry.')
        ]
      },
      {
        id:'preference_ctx_2',
        text:'When I booked the flight, the website asked whether I had a ____ for a window or an aisle seat.',
        answer:'preference',
        distractors:[
          diagnosed('priority','Fits grammatically, but a priority is what must come first, not which of two seats you like better.'),
          diagnosed('requirement','Fits grammatically, but a requirement is a must-have; the website is offering a free choice between two seats.'),
          diagnosed('reservation','Fits grammatically, but a reservation is a booking, and the flight is already booked; the question is about which seat you favour.')
        ]
      },
      {
        id:'preference_ctx_3',
        text:'List the three clubs in order of ____, starting with the one you would most like to join.',
        answer:'preference',
        distractors:[
          diagnosed('importance','Fits grammatically, but importance ranks what matters most, but the sentence asks which club you would most like to join.'),
          diagnosed('popularity','Fits grammatically, but popularity measures what many students like, but the sentence asks for your own ranking.'),
          diagnosed('distance','Fits grammatically, but distance ranks how far away each club is, not how much you want to join it.')
        ]
      },
      {
        id:'preference_ctx_4',
        text:'My brother has a ____ for science fiction, so I bought him a novel from that section.',
        answer:'preference',
        distractors:[
          diagnosed('talent','Fits grammatically, but a talent is an ability; the gift depends on what he likes to read, not what he can do.'),
          diagnosed('reputation','Fits grammatically, but a reputation is how other people see him; the gift depends on what he likes himself.'),
          diagnosed('respect','Fits grammatically, but respect is admiration; buying him a novel shows what he enjoys reading.')
        ]
      },
      {
        id:'preference_ctx_5',
        text:'Her ____ is for coursework rather than exams, because she says she works better without time pressure.',
        answer:'preference',
        distractors:[
          diagnosed('strength','Fits grammatically, but a strength is something she does well, but the reason given is what she likes working on.'),
          diagnosed('advantage','Fits grammatically, but an advantage is a benefit she has; the sentence gives her reason for liking one kind of assessment more.'),
          diagnosed('excuse','Fits grammatically, but an excuse defends a failure, but the sentence gives a positive reason for her liking.')
        ]
      },
      {
        id:'preference_ctx_6',
        text:'Which team you support is simply a matter of personal ____.',
        answer:'preference',
        distractors:[
          diagnosed('belief','Fits grammatically, but a belief is something you think is true, whereas supporting a team is a favourite you choose.'),
          diagnosed('judgement','Fits grammatically, but judgement is a decision about quality or truth, not a favourite you simply like.'),
          diagnosed('experience','Fits grammatically, but experience comes from things that happen to you, not from choosing a favourite team.')
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
    spellingErrors:['aford','affored','afforde','afferd','afoord','affoard'],
    contexts:[
      {
        id:'afford_ctx_1',
        text:'The club had to cancel the trip because it could no longer ____ the cost of the coach.',
        answer:'afford',
        distractors:[
          diagnosed('reduce','Fits grammatically, but reduce means make smaller; cancelling the trip shows the club lacked the money, not that it lowered a price.'),
          diagnosed('estimate','Fits grammatically, but estimate means guess a figure; it does not explain why the trip was cancelled.'),
          diagnosed('predict','Fits grammatically, but predict means say what will happen; the problem is not having the money for the coach.')
        ]
      },
      {
        id:'afford_ctx_2',
        text:'My parents would love a bigger house, but they simply cannot ____ one on a teacher’s salary.',
        answer:'afford',
        distractors:[
          diagnosed('find','Fits grammatically, but find means discover; the problem named is the salary, not the search.'),
          diagnosed('build','Fits grammatically, but build means construct; the problem named is the salary, not who makes the house.'),
          diagnosed('keep','Fits grammatically, but keep means hold on to; they do not yet have the bigger house.')
        ]
      },
      {
        id:'afford_ctx_3',
        text:'Students who work every evening to pay their rent cannot ____ to spend long hours on revision.',
        answer:'afford',
        distractors:[
          diagnosed('bother','Fits grammatically, but bother means make the effort, but the reason given is that they must work to pay rent, not a lack of effort.'),
          diagnosed('wait','Fits grammatically, but wait means stay until something happens, which does not explain a lack of spare time.'),
          diagnosed('pretend','Fits grammatically, but pretend means act as if something is true, which does not fit a real lack of time.')
        ]
      },
      {
        id:'afford_ctx_4',
        text:'The council lowered the entry fee so that more families could ____ the price of a day at the leisure centre.',
        answer:'afford',
        distractors:[
          diagnosed('calculate','Fits grammatically, but calculate means work out a figure, but lowering the fee helps families pay, not work out numbers.'),
          diagnosed('estimate','Fits grammatically, but estimate means guess a figure, but lowering the fee helps families pay, not guess.'),
          diagnosed('question','Fits grammatically, but question means doubt or ask about, but lowering the fee does not change what families can ask.')
        ]
      },
      {
        id:'afford_ctx_5',
        text:'She took a second job because her salary was too low and she could not ____ to fall behind with the rent.',
        answer:'afford',
        distractors:[
          diagnosed('choose','Fits grammatically, but choose means decide between options, but the sentence explains the second job by her low salary, which is about money, not a decision.'),
          diagnosed('bother','Fits grammatically, but bother means make the effort, but the reason for the second job is her low salary.'),
          diagnosed('intend','Fits grammatically, but intend means plan to, but she took a second job to avoid falling behind.')
        ]
      },
      {
        id:'afford_ctx_6',
        text:'A new phone is not something we can ____ right now, so we will wait until next year.',
        answer:'afford',
        distractors:[
          diagnosed('replace','Fits grammatically, but replace means swap one thing for another; the sentence says they must wait, which points to money.'),
          diagnosed('repair','Fits grammatically, but repair means fix an old phone, but the sentence is about getting a new one.'),
          diagnosed('borrow','Fits grammatically, but borrow would let them have a phone now, but the sentence says they must wait.')
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
    spellingErrors:['denie','deney','dany','denay','deni','denny'],
    contexts:[
      {
        id:'deny_ctx_1',
        text:'The company continues to ____ any responsibility for the accident, despite the evidence.',
        answer:'deny',
        distractors:[
          diagnosed('accept','Fits grammatically, but accept means agree that it is responsible, which contradicts continues and despite the evidence.'),
          diagnosed('ignore','Fits grammatically, but ignore means pay no attention; the company is making a statement about the accident, not ignoring it.'),
          diagnosed('take','Fits grammatically, but take responsibility means accept the blame, which contradicts continues and despite the evidence.')
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
          diagnosed('explain','Fits grammatically, but explain means give reasons, but the statement simply says the rumour is false.'),
          diagnosed('back','Fits grammatically, but back means support, but the statement says the rumour is completely false.')
        ]
      },
      {
        id:'deny_ctx_4',
        text:'Shown the photograph, she still continued to ____ that she had been at the party.',
        answer:'deny',
        distractors:[
          diagnosed('admit','Fits grammatically, but admit means agree it is true, but still continued shows she kept saying the opposite.'),
          diagnosed('claim','Fits grammatically, but claim means say it is true; the photograph proves she was there, so still signals she says it is false.'),
          diagnosed('hint','Fits grammatically, but hint means suggest indirectly, but still continued shows she kept saying the opposite of what the photograph shows.')
        ]
      },
      {
        id:'deny_ctx_5',
        text:'Nobody can ____ that regular exercise improves mood; the evidence is very strong.',
        answer:'deny',
        distractors:[
          diagnosed('prove','Fits grammatically, but prove means show it is true, but the second clause says the evidence already exists.'),
          diagnosed('show','Fits grammatically, but show means make something clear, but the second clause says the evidence already exists.'),
          diagnosed('predict','Fits grammatically, but predict means say what will happen, whereas the sentence is about evidence for something already known.')
        ]
      },
      {
        id:'deny_ctx_6',
        text:'The suspect did not ____ being at the scene, but he insisted that he had not taken anything.',
        answer:'deny',
        distractors:[
          diagnosed('regret','Fits grammatically, but regret means feel sorry; the but-clause is about what he says he did.'),
          diagnosed('forget','Fits grammatically, but forget means fail to remember, which does not fit a suspect who insisted on a version of events.'),
          diagnosed('mind','Fits grammatically, but mind means be bothered by it, but the but-clause is about what he says he did.')
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
    spellingErrors:['pemit','permet','permitt','premit','permmit','permiet'],
    contexts:[
      {
        id:'permit_ctx_1',
        text:'Our flexible timetable will ____ you to study at your own pace.',
        answer:'permit',
        distractors:[
          diagnosed('oblige','Fits grammatically, but oblige means force you, which contradicts flexible and at your own pace.'),
          diagnosed('advise','Fits grammatically, but advise means suggest what to do, but the sentence says what the timetable makes possible.'),
          diagnosed('expect','Fits grammatically, but expect means believe or require you to do it, which does not fit a flexible timetable.')
        ]
      },
      {
        id:'permit_ctx_2',
        text:'The council will not ____ anyone to build on the old playing field, because it is protected land.',
        answer:'permit',
        distractors:[
          diagnosed('encourage','Fits grammatically, but encourage means make building more likely, which contradicts protected land.'),
          diagnosed('ask','Fits grammatically, but ask means request, but the council is the one that decides whether building can happen.'),
          diagnosed('invite','Fits grammatically, but invite means welcome people to do it, which contradicts protected land.')
        ]
      },
      {
        id:'permit_ctx_3',
        text:'The exam rules do not ____ mobile phones, so students must leave them outside the hall.',
        answer:'permit',
        distractors:[
          diagnosed('recommend','Fits grammatically, but recommend means suggest as good, but the rules are about what is allowed in the hall.'),
          diagnosed('require','Fits grammatically, but require would mean students must bring phones, which contradicts leaving them outside.'),
          diagnosed('supply','Fits grammatically, but supply means provide phones, but the rules are about what students may bring.')
        ]
      },
      {
        id:'permit_ctx_4',
        text:'Would you ____ your children to stay out until midnight on a school night?',
        answer:'permit',
        distractors:[
          diagnosed('expect','Fits grammatically, but expect means think they will, whereas the question is whether parents would allow it.'),
          diagnosed('advise','Fits grammatically, but advise means suggest it is a good idea, which does not fit a question about allowing a late night.'),
          diagnosed('force','Fits grammatically, but force means make them do it, while the question is whether parents would let them.')
        ]
      },
      {
        id:'permit_ctx_5',
        text:'A teacher cannot ____ students to copy each other’s answers in an assessment.',
        answer:'permit',
        distractors:[
          diagnosed('help','Fits grammatically, but help means assist, but the sentence is about what the rules allow.'),
          diagnosed('teach','Fits grammatically, but teach means show how to do something, not allow it.'),
          diagnosed('invite','Fits grammatically, but invite means ask or welcome them to do it, which is stronger than allowing it.')
        ]
      },
      {
        id:'permit_ctx_6',
        text:'The new software will ____ teachers to share lessons with parents from any device.',
        answer:'permit',
        distractors:[
          diagnosed('require','Fits grammatically, but require would mean teachers must share lessons, whereas the software makes it possible.'),
          diagnosed('remind','Fits grammatically, but remind means help them remember to do it, not make it possible.'),
          diagnosed('advise','Fits grammatically, but advise means recommend, which does not describe what software makes possible.')
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
    spellingErrors:['arange','arrenge','arrnage','arrage','arrang','arrangge'],
    contexts:[
      {
        id:'arrange_ctx_1',
        text:'Please ____ a time that suits everyone so that we can all meet on Saturday.',
        answer:'arrange',
        distractors:[
          diagnosed('prepare','Fits grammatically, but prepare means get ready, but a time is fixed by agreement, not prepared.'),
          diagnosed('hold','Fits grammatically, but hold means keep or have; the sentence asks for a time to be agreed.'),
          diagnosed('allow','Fits grammatically, but allow means permit; the sentence asks someone to set a time.')
        ]
      },
      {
        id:'arrange_ctx_2',
        text:'My uncle has offered to ____ transport to the airport for the whole team.',
        answer:'arrange',
        distractors:[
          diagnosed('prepare','Fits grammatically, but prepare means get ready, but transport is organised, not prepared like a meal.'),
          diagnosed('repair','Fits grammatically, but repair means fix something broken, whereas the offer is to organise a ride.'),
          diagnosed('collect','Fits grammatically, but collect means pick up, but transport is the thing to be organised, not collected.')
        ]
      },
      {
        id:'arrange_ctx_3',
        text:'We need to ____ a babysitter before we can go out on Friday evening.',
        answer:'arrange',
        distractors:[
          diagnosed('order','Fits grammatically, but order means request goods or food, not organise for a person to come.'),
          diagnosed('prepare','Fits grammatically, but prepare means get ready; a babysitter has to be organised, not prepared.'),
          diagnosed('train','Fits grammatically, but train means teach a skill, which is not what is needed before going out.')
        ]
      },
      {
        id:'arrange_ctx_4',
        text:'The band’s manager plans to ____ a short tour of five cities in the spring.',
        answer:'arrange',
        distractors:[
          diagnosed('produce','Fits grammatically, but produce means make a product, whereas a manager plans and books the tour.'),
          diagnosed('follow','Fits grammatically, but follow means go after, which does not describe setting up a tour.'),
          diagnosed('repair','Fits grammatically, but repair means fix something broken, not plan a tour.')
        ]
      },
      {
        id:'arrange_ctx_5',
        text:'It takes a lot of time to ____ a school trip for two hundred students.',
        answer:'arrange',
        distractors:[
          diagnosed('accompany','Fits grammatically, but accompany means go along with, but the sentence is about the work of organising before the trip.'),
          diagnosed('attend','Fits grammatically, but attend means go to; the work described happens before the trip.'),
          diagnosed('enjoy','Fits grammatically, but enjoy means take pleasure in, which does not explain taking a lot of time for two hundred students.')
        ]
      },
      {
        id:'arrange_ctx_6',
        text:'She will ____ to meet us at the station at six, so please wait for her.',
        answer:'arrange',
        distractors:[
          diagnosed('hope','Fits grammatically, but hope means wish, which is weaker than the plan the sentence says to wait for.'),
          diagnosed('pretend','Fits grammatically, but pretend means act as if something is true, which does not make a plan to wait for.'),
          diagnosed('forget','Fits grammatically, but forget means fail to remember, which contradicts so please wait for her.')
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
    spellingErrors:['urdge','uerge','urege','urgue','urgge','ugre'],
    contexts:[
      {
        id:'urge_ctx_1',
        text:'Doctors strongly ____ patients to take up gentle exercise because the benefits are so large, though the choice is always theirs.',
        answer:'urge',
        distractors:[
          diagnosed('order','Fits grammatically, but order means command, but the choice is always theirs says the doctors do not command.'),
          diagnosed('warn','Fits grammatically, but warn means tell people about a danger, but the sentence is about the benefits of exercise.'),
          diagnosed('require','Fits grammatically, but require means make it necessary, but the choice is always theirs says it is not necessary.')
        ]
      },
      {
        id:'urge_ctx_2',
        text:'Friends who live here ____ new students to try the local food, which is cheap, delicious and unlike anything most newcomers have tasted.',
        answer:'urge',
        distractors:[
          diagnosed('warn','Fits grammatically, but warn means tell people about a danger, but cheap and delicious describes a benefit.'),
          diagnosed('remind','Fits grammatically, but remind means help people remember something they already know, but the food is new to most newcomers.'),
          diagnosed('order','Fits grammatically, but order means command, and friends have no authority to command new students.')
        ]
      },
      {
        id:'urge_ctx_3',
        text:'Experts ____ schools to teach financial skills earlier, but they cannot make any school do it, and so far none has agreed.',
        answer:'urge',
        distractors:[
          diagnosed('force','Fits grammatically, but force contradicts they cannot make any school do it.'),
          diagnosed('persuade','Fits grammatically, but persuade means succeed in convincing, but so far none has agreed shows they have not succeeded.'),
          diagnosed('pay','Fits grammatically, but pay means give money for it, but nothing in the sentence says the experts offer any payment.')
        ]
      },
      {
        id:'urge_ctx_4',
        text:'The charity, which has no authority over ministers, continues to ____ the government to increase funding for youth sport, so far without success.',
        answer:'urge',
        distractors:[
          diagnosed('force','Fits grammatically, but force contradicts has no authority over ministers.'),
          diagnosed('persuade','Fits grammatically, but persuade means succeed in convincing, but so far without success shows the government has not been convinced.'),
          diagnosed('oblige','Fits grammatically, but oblige means make someone legally or morally bound, which a charity with no authority cannot do.')
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
          diagnosed('force','Fits grammatically, but force contradicts they say the choice is hers.'),
          diagnosed('persuade','Fits grammatically, but persuade means succeed in convincing her, but she has not decided yet shows they have not succeeded.'),
          diagnosed('dare','Fits grammatically, but dare means challenge someone to do something risky, but applying for a scholarship is not a dare.')
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
    spellingErrors:['recomend','reccomend','recommed','recomand','recommand','reccommend'],
    contexts:[
      {
        id:'recommend_ctx_1',
        text:'My dentist has just retired, so I am asking my colleagues to ____ someone they have been happy with.',
        answer:'recommend',
        distractors:[
          diagnosed('visit','Fits grammatically, but visit means go and see someone, but the speaker is asking for a name to try.'),
          diagnosed('employ','Fits grammatically, but employ means give someone a job, but a patient looks for a dentist to treat them.'),
          diagnosed('interview','Fits grammatically, but interview means ask questions to judge someone, but the colleagues are asked to give a name from their own experience.')
        ]
      },
      {
        id:'recommend_ctx_2',
        text:'I would highly ____ the new science museum; my whole class thought it was brilliant.',
        answer:'recommend',
        distractors:[
          diagnosed('announce','Fits grammatically, but announce means tell people publicly that something is happening, not say it is worth visiting.'),
          diagnosed('advertise','Fits grammatically, but advertise means promote publicly, whereas the speaker is sharing a personal opinion.'),
          diagnosed('admire','Fits grammatically, but admire means feel respect for it, but the sentence is about advising others to go.')
        ]
      },
      {
        id:'recommend_ctx_3',
        text:'The doctor will ____ that you rest for at least three days.',
        answer:'recommend',
        distractors:[
          diagnosed('promise','Fits grammatically, but promise means give a personal guarantee, but a doctor gives advice about what you should do.'),
          diagnosed('predict','Fits grammatically, but predict means say what will happen, not what you should do.'),
          diagnosed('prescribe','Fits grammatically, but prescribe is used for medicine; here the doctor is giving advice about resting.')
        ]
      },
      {
        id:'recommend_ctx_4',
        text:'Teachers often ____ reading a little every day as a way to build vocabulary.',
        answer:'recommend',
        distractors:[
          diagnosed('appreciate','Fits grammatically, but appreciate means value it, but the sentence is about advice teachers give to students.'),
          diagnosed('practise','Fits grammatically, but practise means do it for improvement, whereas the teachers are advising others to do it.'),
          diagnosed('require','Fits grammatically, but require means make it necessary, which is stronger than often suggesting it.')
        ]
      },
      {
        id:'recommend_ctx_5',
        text:'Whenever tourists ask where to eat, I ____ my cousin’s bakery because the cheese bread there is wonderful.',
        answer:'recommend',
        distractors:[
          diagnosed('visit','Fits grammatically, but visit means go there yourself, but the tourists are the ones who need advice about where to go.'),
          diagnosed('review','Fits grammatically, but review means write or give a formal opinion, whereas the sentence is about what you tell people who ask.'),
          diagnosed('compliment','Fits grammatically, but compliment means praise a person or place to their face, which is not what you tell tourists who ask where to eat.')
        ]
      },
      {
        id:'recommend_ctx_6',
        text:'Both coaches ____ that new players wear shin pads in their first session, but it is not compulsory.',
        answer:'recommend',
        distractors:[
          diagnosed('require','Fits grammatically, but require contradicts it is not compulsory.'),
          diagnosed('insist','Fits grammatically, but insist means say strongly that it must happen, which contradicts it is not compulsory.'),
          diagnosed('guarantee','Fits grammatically, but guarantee means promise it will happen, which contradicts it is not compulsory.')
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
    spellingErrors:['demend','damand','demmand','deamnd','demant','demund'],
    contexts:[
      {
        id:'demand_ctx_1',
        text:'Marathon training can ____ patience, discipline and a great deal of time.',
        answer:'demand',
        distractors:[
          diagnosed('deserve','Fits grammatically, but deserve means be worthy of, but the sentence lists what training needs from the runner.'),
          diagnosed('reward','Fits grammatically, but reward means give something back, whereas the sentence lists what training asks of you.'),
          diagnosed('teach','Fits grammatically, but teach means give knowledge; the sentence lists what training takes from the runner.')
        ]
      },
      {
        id:'demand_ctx_2',
        text:'Learning two languages at once will ____ a lot of concentration.',
        answer:'demand',
        distractors:[
          diagnosed('improve','Fits grammatically, but improve would mean make concentration better, but the sentence describes what the task takes from you.'),
          diagnosed('strengthen','Fits grammatically, but strengthen means build up concentration, whereas the sentence describes what is needed.'),
          diagnosed('spare','Fits grammatically, but spare means have extra, which is the opposite of needing a lot.')
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
          diagnosed('reward','Fits grammatically, but reward means give a benefit back, but the sentence lists what the sport asks of athletes.'),
          diagnosed('welcome','Fits grammatically, but welcome means greet gladly, whereas the sentence is about what the sport asks for.'),
          diagnosed('prevent','Fits grammatically, but prevent means stop something happening, which contradicts long hours of training.')
        ]
      },
      {
        id:'demand_ctx_5',
        text:'Becoming a good violinist can ____ years of daily practice and a great deal of patience.',
        answer:'demand',
        distractors:[
          diagnosed('offer','Fits grammatically, but offer means give, but the sentence lists what the learner has to give.'),
          diagnosed('deserve','Fits grammatically, but deserve means be worthy of, but the sentence lists what is needed to become good.'),
          diagnosed('produce','Fits grammatically, but produce means make, whereas the sentence is about what becoming a violinist asks of you.')
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
    spellingErrors:['threten','thretan','threatan','thretten','threaton','theaten'],
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
          diagnosed('guarantee','Fits grammatically, but guarantee means make certain, which is the opposite of what poor funding does.'),
          diagnosed('plan','Fits grammatically, but plan means prepare, but poor funding is a risk to the club, not a plan for it.'),
          diagnosed('predict','Fits grammatically, but predict means say what will happen, but poor funding itself is the cause of the risk.')
        ]
      },
      {
        id:'threaten_ctx_3',
        text:'The coach will ____ to drop any player who arrives late again.',
        answer:'threaten',
        distractors:[
          diagnosed('refuse','Fits grammatically, but refuse to drop would mean he will not do it, which removes the warning.'),
          diagnosed('offer','Fits grammatically, but offer is a positive gesture, but dropping a player is a punishment.'),
          diagnosed('hesitate','Fits grammatically, but hesitate to drop would mean he is unwilling, which is not a warning to late players.')
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
          diagnosed('cover','Fits grammatically, but cover means spread over something, but officials talking about moving the match shows the clouds were a danger to it.'),
          diagnosed('surround','Fits grammatically, but surround means be on every side of it, but officials talking about moving the match shows the clouds were a danger to it.'),
          diagnosed('soak','Fits grammatically, but soak means make completely wet, but seemed to shows the clouds had not yet reached the match; they were a risk to it.')
        ]
      },
      {
        id:'threaten_ctx_6',
        text:'Union leaders say the new rules could ____ the jobs of thousands of factory workers, and they want the government to think again.',
        answer:'threaten',
        distractors:[
          diagnosed('reward','Fits grammatically, but reward means give something back for good work, but want the government to think again shows the unions see the rules as harmful.'),
          diagnosed('regulate','Fits grammatically, but regulate means control by rules, but the unions are worried about the jobs themselves, not how they are controlled.'),
          diagnosed('define','Fits grammatically, but define means state exactly what something is, which would not make unions ask the government to think again.')
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
    spellingErrors:['resant','resint','resnet','ressent','resentt','resentd'],
    contexts:[
      {
        id:'resent_ctx_1',
        text:'He began to ____ being left out of the team, even though he had trained hard all season.',
        answer:'resent',
        distractors:[
          diagnosed('regret','Fits grammatically, but regret means feel sorry about something he did, but the sentence is about unfair treatment.'),
          diagnosed('deserve','Fits grammatically, but deserve would mean he was worthy of being left out, which contradicts trained hard.'),
          diagnosed('expect','Fits grammatically, but expect means think it will happen, which does not show his anger about trained hard.')
        ]
      },
      {
        id:'resent_ctx_2',
        text:'Many workers ____ being told to stay late without extra pay.',
        answer:'resent',
        distractors:[
          diagnosed('fear','Fits grammatically, but fear means be afraid it will happen, but without extra pay explains an unfair order, not a risk.'),
          diagnosed('expect','Fits grammatically, but expect means think it will happen, which does not show the feeling about unfair treatment.'),
          diagnosed('avoid','Fits grammatically, but avoid means keep away from it, but they are told to stay, so it is not their choice.')
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
          diagnosed('regret','Fits grammatically, but regret means feel sorry about something you did yourself, but the staff did not make the change.'),
          diagnosed('dread','Fits grammatically, but dread means fear something that has not happened yet, but the change happened last year.'),
          diagnosed('mourn','Fits grammatically, but mourn means feel deep sadness over a loss, whereas the staff feel anger about an unfair change.')
        ]
      },
      {
        id:'resent_ctx_5',
        text:'They ____ the extra homework, because they thought it was unfair to set it on a Friday.',
        answer:'resent',
        distractors:[
          diagnosed('avoid','Fits grammatically, but avoid means keep away from it, but the sentence is about how they felt about it.'),
          diagnosed('ignore','Fits grammatically, but ignore means pay no attention, whereas the sentence gives their feeling that it was unfair.'),
          diagnosed('question','Fits grammatically, but question means ask about, but the sentence gives their angry feeling of unfairness.')
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
    spellingErrors:['regrett','regert','regrat','regreat','reggret','rigret'],
    contexts:[
      {
        id:'regret_ctx_1',
        text:'He told me that he will always ____ his own decision to leave school so early and often wishes he had stayed.',
        answer:'regret',
        distractors:[
          diagnosed('resent','Fits grammatically, but resent means feel angry about something unfair, but the sentence is about his own decision and his wish that he had stayed.'),
          diagnosed('defend','Fits grammatically, but defend means argue in support of it, but wishes he had stayed shows he does not support the decision.'),
          diagnosed('forget','Fits grammatically, but forget contradicts will always and often wishes he had stayed.')
        ]
      },
      {
        id:'regret_ctx_2',
        text:'We ____ to tell you that your application has not been successful this year.',
        answer:'regret',
        distractors:[
          diagnosed('decide','Fits grammatically, but decide to tell you does not fit the formal, sorry tone of a rejection letter.'),
          diagnosed('refuse','Fits grammatically, but refuse to tell you contradicts the fact that the sentence is telling the reader.'),
          diagnosed('promise','Fits grammatically, but promise to tell you does not fit bad news.')
        ]
      },
      {
        id:'regret_ctx_3',
        text:'She did not ____ her decision to change schools; she said she was much happier now.',
        answer:'regret',
        distractors:[
          diagnosed('explain','Fits grammatically, but explain means give reasons, but the sentence says she was happier, not that she gave reasons.'),
          diagnosed('announce','Fits grammatically, but announce means tell people publicly, but the second clause is about her feelings afterwards.'),
          diagnosed('defend','Fits grammatically, but defend means argue in support of it, but she says she is happier, which is about her feelings, not an argument she needs to make.')
        ]
      },
      {
        id:'regret_ctx_4',
        text:'Looking back, many retired athletes ____ not spending more time with their families.',
        answer:'regret',
        distractors:[
          diagnosed('mention','Fits grammatically, but mention means say briefly, but looking back suggests a feeling, not just a remark.'),
          diagnosed('notice','Fits grammatically, but notice means become aware of, but looking back suggests sadness about a past choice.'),
          diagnosed('expect','Fits grammatically, but expect means think that it will happen, which does not fit looking back.')
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
          diagnosed('repeat','Fits grammatically, but repeat contradicts apologised.'),
          diagnosed('defend','Fits grammatically, but defend contradicts apologised.'),
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
    spellingErrors:['unfamilar','unfamiliare','unfimiliar','unfamilliar','unfammiliar','unfamiler'],
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
          diagnosed('unhealthy','Fits grammatically, but unhealthy would describe something bad for you, but the cue is getting used to new things.'),
          diagnosed('unreliable','Fits grammatically, but unreliable means cannot be trusted, which does not fit getting used to new things.'),
          diagnosed('unpleasant','Fits grammatically, but unpleasant means not nice, but the cue is that the things are new to you.')
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
          diagnosed('unpleasant','Fits grammatically, but unpleasant means not nice, but the cue is checking the map because they did not know the way.'),
          diagnosed('unlikely','Fits grammatically, but unlikely means probably not true, which does not fit a route they were walking.'),
          diagnosed('unmarked','Fits grammatically, but unmarked means without signs, and could explain stopping, but to us shows the problem is that they did not know it.')
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
          diagnosed('unfair','Fits grammatically, but unfair means not just, but the cue is anyone who has grown up outside.'),
          diagnosed('unpopular','Fits grammatically, but unpopular means disliked, but the cue is lack of experience.'),
          diagnosed('unimportant','Fits grammatically, but unimportant means of little value, but the cue is lack of experience.')
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
    spellingErrors:['racquit','racqet','raquet','racqeut','racquett','rackquet'],
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
          diagnosed('bat','Fits grammatically, but a bat is used in sports such as cricket and table tennis, but badminton players use a frame with strings.'),
          diagnosed('hockey stick','Fits grammatically, but a hockey stick is used to hit a ball along the ground, not a shuttlecock over a net.'),
          diagnosed('paddle','Fits grammatically, but a paddle is used for rowing or table tennis, not badminton.')
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
    spellingErrors:['oponent','opponant','oppenent','opponet','opponnent','oppnent'],
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
          diagnosed('coach','Fits grammatically, but the captain is studying the player on the pitch, not the coach.'),
          diagnosed('referee','Fits grammatically, but the referee is not playing, so there are no weaknesses to exploit in a match.'),
          diagnosed('teammate','Fits grammatically, but a teammate is on the captain’s own side, but the video is of the other team’s goalkeeper.')
        ]
      },
      {
        id:'opponent_ctx_3',
        text:'In doubles, you must communicate clearly with your partner, but never give your ____ any hint about your plan.',
        answer:'opponent',
        distractors:[
          diagnosed('teammate','Fits grammatically, but a teammate is on your side, so you would share your plan, not hide it.'),
          diagnosed('coach','Fits grammatically, but a coach is on your side, so you would share the plan.'),
          diagnosed('supporter','Fits grammatically, but a supporter is on your side, so you would not need to hide the plan.')
        ]
      },
      {
        id:'opponent_ctx_4',
        text:'Chess players must think about the next move that their ____ is likely to make.',
        answer:'opponent',
        distractors:[
          diagnosed('coach','Fits grammatically, but a coach advises from outside the game and does not make moves.'),
          diagnosed('partner','Fits grammatically, but a partner would be working with them, but chess is played against another person.'),
          diagnosed('judge','Fits grammatically, but a judge scores or rules on a game and does not make moves in it.')
        ]
      },
      {
        id:'opponent_ctx_5',
        text:'A good boxer respects every ____, even one who has lost his last five fights.',
        answer:'opponent',
        distractors:[
          diagnosed('fan','Fits grammatically, but a fan supports a boxer and does not fight him.'),
          diagnosed('trainer','Fits grammatically, but a trainer helps a boxer prepare and does not fight him.'),
          diagnosed('referee','Fits grammatically, but a referee controls the fight and has not lost five fights.')
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
    spellingErrors:['intence','intens','intese','intesne','intsense','entense'],
    contexts:[
      {
        id:'intense_ctx_1',
        text:'Players faced ____ pressure in the final minutes, with the score level and the whole crowd roaring.',
        answer:'intense',
        distractors:[
          diagnosed('extensive','Fits grammatically, but extensive means covering a large area or amount, not strength of feeling.'),
          diagnosed('instant','Fits grammatically, but instant means happening immediately, not strong.'),
          diagnosed('tense','Fits grammatically, but tense describes a situation or a person, but pressure is not described as tense.')
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
          diagnosed('extensive','Fits grammatically, but extensive means covering a large area, not very strong focus.'),
          diagnosed('intentional','Fits grammatically, but intentional means done on purpose, not very strong focus.'),
          diagnosed('sudden','Fits grammatically, but sudden means happening quickly and unexpectedly, not very strong focus.')
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
    spellingErrors:['tornament','tournement','tourment','tournamnet','toornament','tournamant'],
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
          diagnosed('league','Fits grammatically, but a league does not normally have a semi-final.'),
          diagnosed('season','Fits grammatically, but a season is a period of time, and a semi-final belongs to one event.'),
          diagnosed('training camp','Fits grammatically, but a training camp is for preparing players, and the sentence describes a competition with a winner.')
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
          diagnosed('festival','Fits grammatically, but a festival is a celebration, whereas players from twelve countries took part suggests a competition between players.'),
          diagnosed('carnival','Fits grammatically, but a carnival is a street celebration, whereas players from twelve countries took part suggests a competition between players.'),
          diagnosed('league','Fits grammatically, but a league runs over a season in one country, not a single event in Singapore.')
        ]
      },
      {
        id:'tournament_ctx_6',
        text:'Our team lost its first match but still reached the final of the ____ by winning all its remaining games.',
        answer:'tournament',
        distractors:[
          diagnosed('qualifier','Fits grammatically, but a qualifier is an earlier stage used to decide who enters the main event, not the event with the final.'),
          diagnosed('series','Fits grammatically, but a series has matches, but it does not normally have a final.'),
          diagnosed('expedition','Fits grammatically, but an expedition is a journey, not a competition with a final.')
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
    spellingErrors:['determind','determaned','detirmined','determinned','determiend','detirmend'],
    contexts:[
      {
        id:'determined_ctx_1',
        text:'Even after three defeats, she was ____ to qualify for the national team and refused to give up.',
        answer:'determined',
        distractors:[
          diagnosed('reluctant','Fits grammatically, but reluctant means unwilling, which contradicts refused to give up.'),
          diagnosed('embarrassed','Fits grammatically, but embarrassed to qualify would mean she felt awkward about succeeding, which does not fit refused to give up.'),
          diagnosed('likely','Fits grammatically, but likely to qualify means probably will, but refused to give up shows her attitude, not a prediction.')
        ]
      },
      {
        id:'determined_ctx_2',
        text:'The team was ____ to win the match despite being two goals behind at half-time.',
        answer:'determined',
        distractors:[
          diagnosed('bound','Fits grammatically, but bound to win means certain to, but despite being two goals behind shows a decision, not a prediction.'),
          diagnosed('unwilling','Fits grammatically, but unwilling to win contradicts the idea of fighting back despite being two goals behind.'),
          diagnosed('ashamed','Fits grammatically, but ashamed to win would mean they felt bad about winning, which does not fit despite being two goals behind.')
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
          diagnosed('nervous','Fits grammatically, but nervous describes fear, but the sentence says they stayed firmly set on reaching the summit.'),
          diagnosed('enthusiastic','Fits grammatically, but enthusiastic means very keen, but the sentence stresses that they stayed firmly set on reaching the summit despite danger.'),
          diagnosed('confused','Fits grammatically, but confused describes not understanding, which does not fit staying set on the summit.')
        ]
      },
      {
        id:'determined_ctx_6',
        text:'Her ____ attitude impressed the coach, who said she never complained, even after the hardest sessions.',
        answer:'determined',
        distractors:[
          diagnosed('careless','Fits grammatically, but careless contradicts never complained and the coach’s praise.'),
          diagnosed('indifferent','Fits grammatically, but indifferent means not caring, which contradicts the coach being impressed.'),
          diagnosed('proud','Fits grammatically, but proud describes feeling pleased with yourself, but the coach praised her attitude to training.')
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
    spellingErrors:['disipline','discipine','dicipline','discapline','disciplin','discipleine'],
    contexts:[
      {
        id:'discipline_ctx_1',
        text:'Training at five every morning in winter takes real ____, because nobody forces you to keep to the routine.',
        answer:'discipline',
        distractors:[
          diagnosed('talent','Fits grammatically, but talent is natural ability, but nobody forces you to keep to the routine points to self-control.'),
          diagnosed('fitness','Fits grammatically, but fitness is physical condition, but nobody forces you to keep to the routine points to self-control.'),
          diagnosed('experience','Fits grammatically, but experience is knowledge from the past, but nobody forces you to keep to the routine points to self-control.')
        ]
      },
      {
        id:'discipline_ctx_2',
        text:'Success in a sport depends on talent, but it also depends on the ____ to follow a strict timetable even when you feel tired.',
        answer:'discipline',
        distractors:[
          diagnosed('flexibility','Fits grammatically, but flexibility is the ability to change, which is the opposite of following a strict timetable.'),
          diagnosed('creativity','Fits grammatically, but creativity is the ability to produce new ideas, not to follow a fixed timetable.'),
          diagnosed('intelligence','Fits grammatically, but intelligence is the ability to understand, not to follow a fixed timetable.')
        ]
      },
      {
        id:'discipline_ctx_3',
        text:'The coach praised the team’s ____ in following the training plan exactly, even when no one was watching.',
        answer:'discipline',
        distractors:[
          diagnosed('teamwork','Fits grammatically, but teamwork is working together, but even when no one was watching points to individual self-control.'),
          diagnosed('loyalty','Fits grammatically, but loyalty is staying faithful to people or a team, not following a plan exactly.'),
          diagnosed('fitness','Fits grammatically, but fitness is physical condition, not the self-control to follow a plan exactly.')
        ]
      },
      {
        id:'discipline_ctx_4',
        text:'With a little ____, you can put aside a small amount of money each week even when you are tempted to spend it.',
        answer:'discipline',
        distractors:[
          diagnosed('luck','Fits grammatically, but luck is chance, which does not control temptation each week.'),
          diagnosed('generosity','Fits grammatically, but generosity is giving to others, which does not help you put money aside.'),
          diagnosed('imagination','Fits grammatically, but imagination is picturing new things, which does not control temptation each week.')
        ]
      },
      {
        id:'discipline_ctx_5',
        text:'Learning a language requires ____: a short study session every day is better than one long session at the weekend.',
        answer:'discipline',
        distractors:[
          diagnosed('talent','Fits grammatically, but talent is natural ability, but the colon explains the habit of regular study.'),
          diagnosed('confidence','Fits grammatically, but confidence is feeling sure of yourself, but the colon explains the habit of regular study.'),
          diagnosed('memory','Fits grammatically, but memory is the ability to remember, but the colon explains the habit of regular study.')
        ]
      },
      {
        id:'discipline_ctx_6',
        text:'Soldiers and athletes need ____ to follow orders and keep to the rules when conditions are hard.',
        answer:'discipline',
        distractors:[
          diagnosed('fitness','Fits grammatically, but fitness is physical condition, not the self-control to follow rules when conditions are hard.'),
          diagnosed('imagination','Fits grammatically, but imagination is picturing new things, which does not help someone keep to the rules.'),
          diagnosed('experience','Fits grammatically, but experience is knowledge from the past, but the sentence is about self-control to keep to the rules.')
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
    spellingErrors:['goal-orriented','goal oriented','goaloriented','goal-orianted','goal-orientted','gole-oriented'],
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
    spellingErrors:['acheivement','achievment','achievemant','acheivment','achivement','achievemnet'],
    contexts:[
      {
        id:'achievement_ctx_1',
        text:'Finishing the marathon in under four hours was a major ____ for someone who had only started running a year ago.',
        answer:'achievement',
        distractors:[
          diagnosed('attempt','Fits grammatically, but an attempt is trying to do something, but finishing shows it was completed.'),
          diagnosed('routine','Fits grammatically, but a routine is something done regularly, but finishing in under four hours was special.'),
          diagnosed('celebration','Fits grammatically, but a celebration is a party, but the sentence describes what he did, not an event held afterwards.')
        ]
      },
      {
        id:'achievement_ctx_2',
        text:'The coach called her place on the national team the most difficult ____ of her career, because no one from the school had ever done it before.',
        answer:'achievement',
        distractors:[
          diagnosed('reward','Fits grammatically, but a reward is something given, but the coach is describing how hard it was to do.'),
          diagnosed('ambition','Fits grammatically, but an ambition is a hope for the future, but her place had already been won.'),
          diagnosed('decision','Fits grammatically, but a decision is a choice, but the coach is describing something no one from the school had ever done.')
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
          diagnosed('attempt','Fits grammatically, but an attempt is trying, but teaching herself to swim describes something she completed.'),
          diagnosed('hobby','Fits grammatically, but a hobby is an activity done for pleasure, but teaching herself to swim is described as something to be proud of.'),
          diagnosed('responsibility','Fits grammatically, but a responsibility is a duty, but the sentence describes something she did that she is proud of.')
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
          diagnosed('expectation','Fits grammatically, but an expectation is something you think will happen, but the family was proud of what he did.'),
          diagnosed('obligation','Fits grammatically, but an obligation is a duty, but the family was proud of what he did.'),
          diagnosed('opportunity','Fits grammatically, but an opportunity is a chance, but the family was proud of what he actually did.')
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
    spellingErrors:['elit','eilte','ellite','elete','elyte','elitte'],
    contexts:[
      {
        id:'elite_ctx_1',
        text:'Only a tiny group of ____ runners, chosen from thousands of competitors, are invited to the national training camp.',
        answer:'elite',
        distractors:[
          diagnosed('local','Fits grammatically, but local runners are from one area, and the sentence says these few were chosen from thousands nationally.'),
          diagnosed('junior','Fits grammatically, but junior means young, but the sentence is about the very highest level, not age.'),
          diagnosed('keen','Fits grammatically, but keen means enthusiastic, which does not explain being chosen from thousands.')
        ]
      },
      {
        id:'elite_ctx_2',
        text:'Joining an ____ club means training with the best players in the country and competing at the highest level.',
        answer:'elite',
        distractors:[
          diagnosed('amateur','Fits grammatically, but an amateur club is for people who play for fun, but the sentence describes the best players at the highest level.'),
          diagnosed('ordinary','Fits grammatically, but an ordinary club contradicts training with the best players in the country.'),
          diagnosed('open','Fits grammatically, but an open club accepts anyone, but the sentence describes the highest level of competition.')
        ]
      },
      {
        id:'elite_ctx_3',
        text:'At the Olympics, the world’s ____ athletes compete for the medals, and only the very best in each sport qualify.',
        answer:'elite',
        distractors:[
          diagnosed('fit','Fits grammatically, but fit means healthy, but the sentence is about being among the very best in each sport.'),
          diagnosed('local','Fits grammatically, but local means from one area, but the sentence says the world’s best qualify.'),
          diagnosed('regular','Fits grammatically, but regular means usual, which contradicts only the very best qualify.')
        ]
      },
      {
        id:'elite_ctx_4',
        text:'Her coach said she had the ability to reach ____ level, which means competing against the best in the world.',
        answer:'elite',
        distractors:[
          diagnosed('beginner','Fits grammatically, but beginner level is the lowest stage, which contradicts competing against the best in the world.'),
          diagnosed('average','Fits grammatically, but average level is the middle, which contradicts competing against the best in the world.'),
          diagnosed('local','Fits grammatically, but local level means competing in one area, but the sentence mentions the best in the world.')
        ]
      },
      {
        id:'elite_ctx_5',
        text:'Scholarships are offered to ____ sports people only, those who rank in the top one per cent nationally.',
        answer:'elite',
        distractors:[
          diagnosed('casual','Fits grammatically, but casual means not serious, which contradicts the top one per cent nationally.'),
          diagnosed('keen','Fits grammatically, but keen means enthusiastic, but the sentence is about ranking in the top one per cent.'),
          diagnosed('young','Fits grammatically, but young refers to age, but the sentence is about ranking in the top one per cent.')
        ]
      },
      {
        id:'elite_ctx_6',
        text:'Several ____ footballers were seen training together at the new academy, but most of the students there were still beginners.',
        answer:'elite',
        distractors:[
          diagnosed('basic','Fits grammatically, but basic describes a low level of skill, but the sentence contrasts the footballers with the beginners.'),
          diagnosed('local','Fits grammatically, but local refers to the area, but the sentence contrasts the footballers with the beginners by level.'),
          diagnosed('curious','Fits grammatically, but curious means interested, which does not contrast with beginners by level.')
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
    spellingErrors:['overwelming','overwhelmeng','overwhleming','overwhellming','overwhealming','overwhelning'],
    contexts:[
      {
        id:'overwhelming_ctx_1',
        text:'The support from the home crowd was so ____ that the young players could hardly think or hear their coach.',
        answer:'overwhelming',
        distractors:[
          diagnosed('overwhelmed','Fits grammatically, but overwhelmed describes how a person feels, but the sentence describes the support that caused the feeling.'),
          diagnosed('overwhelmingly','Fits grammatically, but overwhelmingly is an adverb, but the missing word describes the noun support.'),
          diagnosed('impressive','Fits grammatically, but impressive means admirable, which does not explain players being unable to think or hear.')
        ]
      },
      {
        id:'overwhelming_ctx_2',
        text:'Voters gave the new mayor an ____ majority, with more than ninety per cent supporting her.',
        answer:'overwhelming',
        distractors:[
          diagnosed('average','Fits grammatically, but an average majority is ordinary, which does not fit more than ninety per cent.'),
          diagnosed('overwhelmed','Fits grammatically, but overwhelmed describes how a person feels, not a majority.'),
          diagnosed('unconvincing','Fits grammatically, but unconvincing means not persuasive, which does not describe a result of more than ninety per cent.')
        ]
      },
      {
        id:'overwhelming_ctx_3',
        text:'After weeks of training, he felt an ____ sense of relief when the race was over, and he cried at the finish line.',
        answer:'overwhelming',
        distractors:[
          diagnosed('ordinary','Fits grammatically, but ordinary contradicts crying at the finish line.'),
          diagnosed('overwhelmed','Fits grammatically, but overwhelmed describes how a person feels, but the missing word describes the sense of relief itself.'),
          diagnosed('disappointing','Fits grammatically, but disappointing means worse than hoped, which does not fit relief that made him cry.')
        ]
      },
      {
        id:'overwhelming_ctx_4',
        text:'There was ____ evidence that the player had broken the rules: video, witnesses and his own messages.',
        answer:'overwhelming',
        distractors:[
          diagnosed('partial','Fits grammatically, but partial means incomplete, which contradicts video, witnesses and his own messages.'),
          diagnosed('disappointing','Fits grammatically, but disappointing means worse than hoped, which does not describe the strength of the evidence.'),
          diagnosed('overwhelmed','Fits grammatically, but overwhelmed describes how a person feels, not evidence.')
        ]
      },
      {
        id:'overwhelming_ctx_5',
        text:'The amount of homework this week has been ____; many students have stopped trying to finish it all.',
        answer:'overwhelming',
        distractors:[
          diagnosed('overwhelmed','Fits grammatically, but overwhelmed describes how people feel, but the homework itself is described.'),
          diagnosed('manageable','Fits grammatically, but manageable contradicts many students have stopped trying.'),
          diagnosed('unsatisfactory','Fits grammatically, but unsatisfactory means not good enough, but the sentence says the amount was too great to manage.')
        ]
      },
      {
        id:'overwhelming_ctx_6',
        text:'An ____ response from fans, with thousands of messages in a single day, surprised the club.',
        answer:'overwhelming',
        distractors:[
          diagnosed('exciting','Fits grammatically, but exciting is possible, but it does not show the response was too great to deal with.'),
          diagnosed('ordinary','Fits grammatically, but ordinary contradicts thousands of messages in a single day and the club being surprised.'),
          diagnosed('unsatisfactory','Fits grammatically, but unsatisfactory means not good enough, which contradicts a response that surprised the club.')
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
    spellingErrors:['genaration','generatoin','generasion','generetion','generaton','jeneration'],
    contexts:[
      {
        id:'generation_ctx_1',
        text:'People born in the nineties are often described as part of the same ____, because they grew up with similar technology.',
        answer:'generation',
        distractors:[
          diagnosed('neighbourhood','Fits grammatically, but a neighbourhood is a group of people living in the same area, but born in the nineties describes people born in the same period.'),
          diagnosed('population','Fits grammatically, but a population is all the people in a place, but born in the nineties describes people born in the same period.'),
          diagnosed('society','Fits grammatically, but a society is a large group of people living together, but born in the nineties describes people born in the same period.')
        ]
      },
      {
        id:'generation_ctx_2',
        text:'A new ____ of players, all born after the year 2005, is replacing the champions who dominated the sport for years.',
        answer:'generation',
        distractors:[
          diagnosed('organisation','Fits grammatically, but an organisation is a formal group with a purpose, but born after the year 2005 describes a group defined by birth years.'),
          diagnosed('committee','Fits grammatically, but a committee is a group that makes decisions, not a group defined by birth years.'),
          diagnosed('audience','Fits grammatically, but an audience watches an event, not a group defined by birth years.')
        ]
      },
      {
        id:'generation_ctx_3',
        text:'Each ____ of people, born within a few years of each other, grows up with different music, technology and ideas about work.',
        answer:'generation',
        distractors:[
          diagnosed('century','Fits grammatically, but a century is one hundred years, which is much longer than a few years of each other.'),
          diagnosed('decade','Fits grammatically, but a decade is ten years, but a few years of each other describes people born around the same time, not a block of ten years.'),
          diagnosed('population','Fits grammatically, but a population is all the people in a place, not a group born around the same time.')
        ]
      },
      {
        id:'generation_ctx_4',
        text:'Sports clubs hope that parents will pass their love of football to the next ____.',
        answer:'generation',
        distractors:[
          diagnosed('season','Fits grammatically, but a season is part of the year, and love of football is passed to people, not to a season.'),
          diagnosed('neighbourhood','Fits grammatically, but a neighbourhood is a place where people live, but the sentence talks about passing love of football from parents to people who come after them.'),
          diagnosed('century','Fits grammatically, but a century is a period of time, not a group of people.')
        ]
      },
      {
        id:'generation_ctx_5',
        text:'Anyone whose birth falls within the same fifteen years belongs to one ____ and often shares similar views about money and work.',
        answer:'generation',
        distractors:[
          diagnosed('family','Fits grammatically, but a family is made up of relatives, not people born in the same years.'),
          diagnosed('neighbourhood','Fits grammatically, but a neighbourhood is a place where people live, not a group defined by birth years.'),
          diagnosed('community','Fits grammatically, but a community is a group in one place, not people born in the same years.')
        ]
      },
      {
        id:'generation_ctx_6',
        text:'The gap between grandparents and their grandchildren shows up in how each ____ spends its free time.',
        answer:'generation',
        distractors:[
          diagnosed('family','Fits grammatically, but a family includes both grandparents and grandchildren, but the sentence contrasts the two age groups.'),
          diagnosed('organisation','Fits grammatically, but an organisation is a formal group with a purpose, not an age group.'),
          diagnosed('society','Fits grammatically, but a society is a whole population, but the sentence contrasts two age groups within it.')
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
    spellingErrors:['chalenge','challange','chalenje','chalange','challege','chalengge'],
    contexts:[
      {
        id:'challenge_ctx_1',
        text:'The coach set the squad a ____: to run ten kilometres without stopping, to test their fitness.',
        answer:'challenge',
        distractors:[
          diagnosed('rule','Fits grammatically, but a rule says what you must do, but to test their fitness describes a task that tests ability.'),
          diagnosed('reward','Fits grammatically, but a reward is a prize, but to test their fitness describes a task that tests ability.'),
          diagnosed('schedule','Fits grammatically, but a schedule is a plan of times, but to test their fitness describes a task that tests ability.')
        ]
      },
      {
        id:'challenge_ctx_2',
        text:'Playing the champions away from home will be a serious ____ for our young team, but we are ready to try.',
        answer:'challenge',
        distractors:[
          diagnosed('mistake','Fits grammatically, but a mistake is an error, which does not fit a team that is ready to try.'),
          diagnosed('tradition','Fits grammatically, but a tradition is a long-standing custom, not a difficult test for the team.'),
          diagnosed('victory','Fits grammatically, but a victory is a win, but the sentence says the team is only ready to try.')
        ]
      },
      {
        id:'challenge_ctx_3',
        text:'Learning an instrument as an adult is a ____ because it tests your patience and memory every day.',
        answer:'challenge',
        distractors:[
          diagnosed('habit','Fits grammatically, but a habit is something done automatically, but the sentence says it tests patience and memory.'),
          diagnosed('success','Fits grammatically, but a success is a good result, but the sentence is about how hard the learning is.'),
          diagnosed('punishment','Fits grammatically, but a punishment is a penalty, which does not describe learning an instrument that tests patience and memory.')
        ]
      },
      {
        id:'challenge_ctx_4',
        text:'Many people accept the ____ of running a marathon to raise money for charity, even though they have never run far.',
        answer:'challenge',
        distractors:[
          diagnosed('cost','Fits grammatically, but a cost is a price, but the sentence is about taking on something difficult.'),
          diagnosed('habit','Fits grammatically, but a habit is something done regularly, but they have never run far.'),
          diagnosed('punishment','Fits grammatically, but a punishment is a penalty, which does not fit raising money for charity.')
        ]
      },
      {
        id:'challenge_ctx_5',
        text:'Finding enough time for training while studying full-time is the biggest ____ for most athletes at university.',
        answer:'challenge',
        distractors:[
          diagnosed('advantage','Fits grammatically, but an advantage is a benefit, which does not fit finding enough time being difficult.'),
          diagnosed('excuse','Fits grammatically, but an excuse is a reason given for not doing something, but the sentence describes a real difficulty.'),
          diagnosed('habit','Fits grammatically, but a habit is something done automatically, not something that is hard to find time for.')
        ]
      },
      {
        id:'challenge_ctx_6',
        text:'The new course is a ____ even for experienced players: every exercise tests a different skill.',
        answer:'challenge',
        distractors:[
          diagnosed('tradition','Fits grammatically, but a tradition is a long-standing custom, but every exercise tests a different skill describes difficulty.'),
          diagnosed('relief','Fits grammatically, but a relief is the end of a worry, which contradicts every exercise tests a different skill.'),
          diagnosed('reward','Fits grammatically, but a reward is a prize, but every exercise tests a skill, which is about difficulty.')
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
    spellingErrors:['solusion','solutoin','soloution','soluton','sollution','solucion'],
    contexts:[
      {
        id:'solution_ctx_1',
        text:'The club finally found a ____ to the shortage of training space by sharing the school gym.',
        answer:'solution',
        distractors:[
          diagnosed('threat','Fits grammatically, but a threat is a danger, but by sharing the school gym describes dealing with the shortage.'),
          diagnosed('reaction','Fits grammatically, but a reaction is how someone responds, but by sharing the school gym describes a way of dealing with the shortage.'),
          diagnosed('introduction','Fits grammatically, but an introduction is a first presentation, not a way of dealing with a shortage.')
        ]
      },
      {
        id:'solution_ctx_2',
        text:'One practical ____ to the noise problem is to move the matches to the afternoon.',
        answer:'solution',
        distractors:[
          diagnosed('cause','Fits grammatically, but a cause is what creates the problem, but to move the matches describes a way of dealing with it.'),
          diagnosed('danger','Fits grammatically, but a danger is a risk, but to move the matches describes a way of dealing with it.'),
          diagnosed('reaction','Fits grammatically, but a reaction is how someone responds, but to move the matches describes a way of dealing with it.')
        ]
      },
      {
        id:'solution_ctx_3',
        text:'There is no simple ____ to the problem of injuries among young athletes, but good coaching helps.',
        answer:'solution',
        distractors:[
          diagnosed('reason','Fits grammatically, but a reason explains why something happens, but good coaching helps describes a way of dealing with it.'),
          diagnosed('guarantee','Fits grammatically, but a guarantee is a promise, but good coaching helps describes a way of reducing the problem.'),
          diagnosed('explanation','Fits grammatically, but an explanation says why something happens, but good coaching helps describes a way of dealing with it.')
        ]
      },
      {
        id:'solution_ctx_4',
        text:'The mechanic said that the engine fault had no easy ____, and that the whole part would have to be replaced.',
        answer:'solution',
        distractors:[
          diagnosed('cause','Fits grammatically, but a cause is what created the fault, but would have to be replaced describes a way of dealing with it.'),
          diagnosed('warning','Fits grammatically, but a warning tells people about danger, but would have to be replaced describes a way of dealing with it.'),
          diagnosed('price','Fits grammatically, but a price is a cost, but would have to be replaced describes a way of dealing with the fault.')
        ]
      },
      {
        id:'solution_ctx_5',
        text:'Instead of giving advice, the teacher asked the students to work out the ____ to the puzzle themselves.',
        answer:'solution',
        distractors:[
          diagnosed('question','Fits grammatically, but a question is what must be answered, but work out ... themselves describes finding the answer.'),
          diagnosed('clue','Fits grammatically, but a clue is a hint, but work out ... themselves describes finding the final answer.'),
          diagnosed('beginning','Fits grammatically, but a beginning is the start, but work out describes finding the answer.')
        ]
      },
      {
        id:'solution_ctx_6',
        text:'Sharing equipment turned out to be a cheap ____ when the club could not afford new balls.',
        answer:'solution',
        distractors:[
          diagnosed('trick','Fits grammatically, but a cheap trick is an unfair way of getting an advantage, which does not describe a way of dealing with the lack of money.'),
          diagnosed('habit','Fits grammatically, but a habit is something done regularly, not a way of dealing with the lack of money.'),
          diagnosed('rule','Fits grammatically, but a rule says what must be done, not a way of dealing with the lack of money.')
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
    spellingErrors:['pasttime','pastim','pastyme','passtime','pasetime','pastimme'],
    contexts:[
      {
        id:'pastime_ctx_1',
        text:'Collecting old coins is a popular ____ among retired people, who enjoy it in the afternoons.',
        answer:'pastime',
        distractors:[
          diagnosed('profession','Fits grammatically, but a profession is a job, but retired people enjoy it in the afternoons describes something done for pleasure.'),
          diagnosed('routine','Fits grammatically, but a routine is a regular set of tasks, but who enjoy it describes something done for pleasure.'),
          diagnosed('subject','Fits grammatically, but a subject is something studied at school, but who enjoy it describes something done for pleasure.')
        ]
      },
      {
        id:'pastime_ctx_2',
        text:'For many teenagers, playing video games is a favourite ____, not a way of earning money.',
        answer:'pastime',
        distractors:[
          diagnosed('profession','Fits grammatically, but a profession is a job, which the sentence rules out with not a way of earning money.'),
          diagnosed('subject','Fits grammatically, but a subject is something studied at school, not something done for enjoyment.'),
          diagnosed('duty','Fits grammatically, but a duty is something you must do, but favourite describes something enjoyed.')
        ]
      },
      {
        id:'pastime_ctx_3',
        text:'Cricket began as a village ____, played on summer evenings for fun, before it became a professional sport.',
        answer:'pastime',
        distractors:[
          diagnosed('business','Fits grammatically, but a business is run to earn money, but played on summer evenings for fun describes an activity enjoyed.'),
          diagnosed('profession','Fits grammatically, but a profession is a job, but played on summer evenings for fun describes an activity enjoyed.'),
          diagnosed('duty','Fits grammatically, but a duty is something you must do, but for fun describes an activity enjoyed.')
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
          diagnosed('event','Fits grammatically, but an event happens once at a particular time, but every week shows something done regularly.'),
          diagnosed('season','Fits grammatically, but a season is part of the year, not an activity people do every week.'),
          diagnosed('lesson','Fits grammatically, but a lesson is a period of teaching, but relaxing activity describes something enjoyed.')
        ]
      },
      {
        id:'pastime_ctx_6',
        text:'Many parents want their children to find a healthy ____ that is not connected to screens.',
        answer:'pastime',
        distractors:[
          diagnosed('diet','Fits grammatically, but a diet is what you eat, but not connected to screens describes an activity.'),
          diagnosed('subject','Fits grammatically, but a subject is studied at school, but a healthy activity to enjoy is described.'),
          diagnosed('career','Fits grammatically, but a career is a long-term job, but a healthy activity to enjoy is described.')
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
    spellingErrors:['feet','fete','feit','feate','fiet','feeat'],
    contexts:[
      {
        id:'feat_ctx_1',
        text:'Climbing Everest without extra oxygen was a remarkable ____ that few people have ever repeated.',
        answer:'feat',
        distractors:[
          diagnosed('fear','Fits grammatically, but fear is a feeling, not an achievement that few people repeat.'),
          diagnosed('fate','Fits grammatically, but fate is what happens to someone, not an achievement that few people repeat.'),
          diagnosed('fact','Fits grammatically, but a fact is something true, but remarkable and few people have ever repeated describes an achievement.')
        ]
      },
      {
        id:'feat_ctx_2',
        text:'Swimming the English Channel in under seven hours is an incredible ____ of strength and stamina.',
        answer:'feat',
        distractors:[
          diagnosed('fate','Fits grammatically, but fate is what happens to someone, but of strength and stamina describes an achievement.'),
          diagnosed('fear','Fits grammatically, but fear is a feeling, but of strength and stamina describes an achievement.'),
          diagnosed('feet','Fits grammatically, but feet are parts of the body, but of strength and stamina describes an achievement.')
        ]
      },
      {
        id:'feat_ctx_3',
        text:'Building a bridge across the river in just six weeks was an engineering ____ that impressed everyone.',
        answer:'feat',
        distractors:[
          diagnosed('fault','Fits grammatically, but a fault is a mistake, which contradicts impressed everyone.'),
          diagnosed('failure','Fits grammatically, but a failure is a mistake or collapse, which contradicts impressed everyone.'),
          diagnosed('fear','Fits grammatically, but fear is a feeling, not something done that impressed everyone.')
        ]
      },
      {
        id:'feat_ctx_4',
        text:'It was no small ____ for a school with only two hundred pupils to win the national championship.',
        answer:'feat',
        distractors:[
          diagnosed('fault','Fits grammatically, but a fault is a mistake, which does not fit winning a national championship.'),
          diagnosed('favour','Fits grammatically, but a favour is a kind act, but winning a national championship describes an achievement.'),
          diagnosed('fee','Fits grammatically, but a fee is a payment, which does not fit winning a national championship.')
        ]
      },
      {
        id:'feat_ctx_5',
        text:'Landing a triple somersault on her first attempt was a ____ that earned the gymnast a standing ovation.',
        answer:'feat',
        distractors:[
          diagnosed('fear','Fits grammatically, but fear is a feeling, but a standing ovation rewards something impressive that she did.'),
          diagnosed('fault','Fits grammatically, but a fault is a mistake, which does not earn a standing ovation.'),
          diagnosed('favour','Fits grammatically, but a favour is a kind act, but a standing ovation rewards something impressive that she did.')
        ]
      },
      {
        id:'feat_ctx_6',
        text:'Training for a marathon while working two jobs is quite a ____ of organisation.',
        answer:'feat',
        distractors:[
          diagnosed('fact','Fits grammatically, but a fact is something true, but quite a ... of organisation describes an impressive achievement.'),
          diagnosed('fee','Fits grammatically, but a fee is a payment, which does not fit quite a ... of organisation.'),
          diagnosed('fault','Fits grammatically, but a fault is a mistake, which does not fit quite a ... of organisation.')
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
    spellingErrors:['regardles','regardlss','regaurdless','regardlass','regaredless','rigardless'],
    contexts:[
      {
        id:'regardless_ctx_1',
        text:'The match will take place ____ of the weather, so bring waterproof clothes just in case.',
        answer:'regardless',
        distractors:[
          diagnosed('instead','Fits grammatically, but instead of the weather would mean the weather replaces the match, which does not fit bring waterproof clothes just in case.'),
          diagnosed('because','Fits grammatically, but because of the weather would mean the weather causes the match, which does not fit bring waterproof clothes just in case.'),
          diagnosed('irrelevant','Fits grammatically, but irrelevant of is not used in this pattern; the standard phrase is irrespective of or regardless of.')
        ]
      },
      {
        id:'regardless_ctx_2',
        text:'Every student must attend training, ____ of their ability or experience.',
        answer:'regardless',
        distractors:[
          diagnosed('because','Fits grammatically, but because of their ability would give a reason, whereas the sentence says ability does not matter.'),
          diagnosed('unaffected','Fits grammatically, but unaffected of is not used in this pattern; the standard phrase is regardless of.'),
          diagnosed('out','Fits grammatically, but out of their ability does not fit the idea that ability does not matter.')
        ]
      },
      {
        id:'regardless_ctx_3',
        text:'The coach decided to keep playing, ____ of the injury to his best striker.',
        answer:'regardless',
        distractors:[
          diagnosed('ahead','Fits grammatically, but ahead of the injury would mean before it happened, but the injury has already happened.'),
          diagnosed('because','Fits grammatically, but because of the injury would give a reason for playing on, but the sentence suggests playing on in spite of the injury.'),
          diagnosed('irrelevant','Fits grammatically, but irrelevant of is not used in this pattern; the standard phrase is regardless of.')
        ]
      },
      {
        id:'regardless_ctx_4',
        text:'The doctor told him to rest, but he trained for the final ____.',
        answer:'regardless',
        distractors:[
          diagnosed('afterwards','Fits grammatically, but afterwards means later, but but shows the contrast is with the doctor’s advice.'),
          diagnosed('consequently','Fits grammatically, but consequently means as a result, which does not fit the contrast shown by but.'),
          diagnosed('regularly','Fits grammatically, but regularly means often, which does not show that he ignored the doctor’s advice.')
        ]
      },
      {
        id:'regardless_ctx_5',
        text:'The prize money is the same for everyone, ____ of age, gender or nationality.',
        answer:'regardless',
        distractors:[
          diagnosed('because','Fits grammatically, but because of age would give a reason, whereas the sentence says those things do not matter.'),
          diagnosed('instead','Fits grammatically, but instead of age would mean age replaces something, whereas the sentence says those things do not matter.'),
          diagnosed('unaffected','Fits grammatically, but unaffected of is not used in this pattern; the standard phrase is regardless of.')
        ]
      },
      {
        id:'regardless_ctx_6',
        text:'He kept running, ____ of the pain in his knee and the cheers telling him to stop.',
        answer:'regardless',
        distractors:[
          diagnosed('ahead','Fits grammatically, but ahead of the pain would mean before it, but he kept running through the pain.'),
          diagnosed('in','Fits grammatically, but in of the pain is not a phrase.'),
          diagnosed('unaffected','Fits grammatically, but unaffected of is not used in this pattern; the standard phrase is regardless of.')
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
    spellingErrors:['monatary','monetery','monitary','monetory','monnetary','monitery'],
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
          diagnosed('material','Fits grammatically, but material would include a t-shirt, which the sentence says is the only thing they receive.')
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
        text:'Some prizes are ____, such as cash, while others, like medals and cups, have only sentimental value.',
        answer:'monetary',
        distractors:[
          diagnosed('mandatory','Fits grammatically, but mandatory means compulsory, which does not fit cash as an example.'),
          diagnosed('monthly','Fits grammatically, but monthly means happening every month, which does not fit cash as an example.'),
          diagnosed('material','Fits grammatically, but material would also describe medals and cups, which the sentence contrasts with cash.')
        ]
      },
      {
        id:'monetary_ctx_5',
        text:'The study found that happiness depends only partly on ____ gain: friends and health matter more.',
        answer:'monetary',
        distractors:[
          diagnosed('momentary','Fits grammatically, but momentary means lasting a very short time, but the sentence contrasts the gain with friends and health.'),
          diagnosed('moral','Fits grammatically, but moral gain would be about right and wrong, not the money contrasted with friends and health.'),
          diagnosed('mental','Fits grammatically, but mental gain would be about the mind, not the money contrasted with friends and health.')
        ]
      },
      {
        id:'monetary_ctx_6',
        text:'Because of the high ____ cost of the stadium, the council decided to share it with a neighbouring town.',
        answer:'monetary',
        distractors:[
          diagnosed('moral','Fits grammatically, but a moral cost is about right and wrong, but the council is dealing with a shortage of money.'),
          diagnosed('mental','Fits grammatically, but a mental cost is about the mind, but the council is dealing with a shortage of money.'),
          diagnosed('mandatory','Fits grammatically, but mandatory means compulsory, which does not describe a cost.')
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
    spellingErrors:['estamated','estimeted','estemated','estimatd','esstimated','estimmated'],
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
        text:'According to the ____ number of visitors, about three thousand people attended each day, though the true figure is unknown.',
        answer:'estimated',
        distractors:[
          diagnosed('exact','Fits grammatically, but exact contradicts the true figure is unknown.'),
          diagnosed('recorded','Fits grammatically, but recorded means written down one by one, but the true figure is unknown shows it is approximate.'),
          diagnosed('definitive','Fits grammatically, but definitive means final and certain, which contradicts the true figure is unknown.')
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
        text:'Scientists use an ____ age for the fossil, because the exact date cannot be known.',
        answer:'estimated',
        distractors:[
          diagnosed('exact','Fits grammatically, but exact contradicts the exact date cannot be known.'),
          diagnosed('undisputed','Fits grammatically, but undisputed means that nobody disagrees, which contradicts the exact date cannot be known.'),
          diagnosed('accurate','Fits grammatically, but accurate contradicts the exact date cannot be known.')
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
