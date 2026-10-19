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
  }
});
