const diagnosed = (text, reason) => ({ text, reason });

export default Object.freeze({
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
