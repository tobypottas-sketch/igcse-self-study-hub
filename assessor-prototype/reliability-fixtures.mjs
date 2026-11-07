// Fictional calibration tasks/responses and CONTROLLED (simulated) model outputs for offline reliability tests. No live inference is used.
// `live` replays what the staging model actually returned (including its defects); `improved` is what a model that follows the revised prompt should return.
const TRUNC = 'Develop the plan for the weekend by adding more specific details, such as what time you will go to the park or what kind of pizza you will eat. For example, you could say On Saturday, we will go to the park at 10 am and play a few';

export const CASES = {
  R02: {
    taskType:'email',
    task:'Your English-speaking friend Sam is coming to stay with you for a weekend. Write an email to Sam. In your email: • tell Sam what you plan to do at the weekend • say what Sam should bring • ask Sam about the food he likes. Write 120–160 words.',
    response:'Hi Sam,\n\nI am very happy you come to my house in the weekend. On saturday we goes to the park and play football with my friends. After this we eat pizza in a restaurant it is near my home. On sunday we can go to the cinema if you like.\n\nYou must bring warm clothes because the weather is cold now. Also bring you\'re football shoes.\n\nWhat food you like? I have a sister she dont eat meat so I need to know.\n\nPlease write me back soon.\nYour friend,\nLi',
    stage1:{
      requirements:[{ taskQuote:'tell Sam what you plan to do at the weekend', quote:'On saturday we goes to the park and play football with my friends' }, { taskQuote:'say what Sam should bring', quote:'You must bring warm clothes' }, { taskQuote:'ask Sam about the food he likes', quote:'What food you like' }, { taskQuote:'Write an email to Sam', quote:'Hi Sam' }, { taskQuote:'120–160 words', quote:'' }],
      features:[{ label:'conditional', quote:'if you like' }, { label:'reason with because', quote:'because the weather is cold now' }, { label:'topic word', quote:'weekend' }, { label:'activity', quote:'play football with my friends' }],
      errors:[{ quote:"you're football shoes", correction:'your football shoes', explanation:'possessive adjective mistake, your is the correct word to show possession' }, { quote:'I am very happy you come to my house', correction:'I am very happy you are coming to my house', explanation:'verb tense mistake, the correct verb form to express a future plan is the present continuous tense' }, { quote:'we goes to the park', correction:'we go to the park', explanation:'agreement mistake, the subject we is a plural noun and the verb go must agree with it in number' }]
    },
    live:{
      contentMark:4, languageMark:4,
      contentReason:'The email generally fulfils the task, covering all the required points, but some ideas are only stated without further development. For example, the plan for the weekend is mentioned, but no specific details or explanations are given.',
      languageReason:'The language used is generally accurate, but there are some noticeable errors, such as possessive adjective mistakes and agreement mistakes. The vocabulary range is limited, but the text is reasonably well-organised.',
      strengths:[{ evidence:5, advice:"The conditional sentence if you like shows that you are considering Sam's preferences, making the tone more polite and considerate." }], improvements:[], missingRequirements:[], nextStep:TRUNC
    },
    improved:{
      contentMark:4, languageMark:4,
      contentReason:'All three bullet points are covered, but only the weekend plan and the warm clothes have a reason or detail; the question about food is a bare question with no follow-up.',
      languageReason:'Sentences are mostly understandable, but errors with the verb after we and with run-on sentences such as the pizza and restaurant sentence appear in a response of about 90 words, and few linking words are used.',
      strengths:[{ evidence:6, advice:'You give a reason with because, so Sam knows why to pack warm clothes.' }], improvements:[{ evidence:11, advice:'x' }], missingRequirements:[],
      nextStep:'Choose one plan, such as the cinema on Sunday, and add one detail about what you will see and why you chose it.'
    }
  },
  R03: {
    taskType:'review',
    task:'Write a review of a restaurant you have visited for your school magazine. Describe the food and service, give your opinion with reasons, and say whether you recommend it. Write 120–160 words.',
    response:"Last Saturday I ate at Bella's Kitchen with my family. The staff were friendly and welcomed us with a smile. I ordered the chicken pasta, which was creamy and tasty. However, the chips was cold when they arrived, so I did not enjoy them much. The restaurant is clean and the prices are fair. I think families would like it because there is a big menu for children. Overall, I would recommend Bella's Kitchen, but the kitchen should serve hot food.",
    stage1:{
      requirements:[{ taskQuote:'say whether you recommend it', quote:"I would recommend Bella's Kitchen" }, { taskQuote:'Describe the food', quote:'I ordered the chicken pasta' }, { taskQuote:'give your opinion', quote:'I think families would like it' }],
      features:[{ label:'contrast linking phrase', quote:'However' }, { label:'reason with because', quote:'because there is a big menu' }, { label:'topic word', quote:'restaurant' }, { label:'food detail', quote:'the chicken pasta' }],
      errors:[{ quote:'the chips was', correction:'the chips were', explanation:"agreement mistake: the subject 'chips' is a plural noun and needs a plural verb 'were'" }]
    },
    live:{
      contentMark:5, languageMark:6,
      contentReason:'The review consistently fulfils the task, describing the food and service, giving an opinion with reasons, and recommending the restaurant. Most points are developed with relevant, specific detail, such as the description of the chicken pasta and the reason why families would like the restaurant.',
      languageReason:"The writing has a wide range of vocabulary and structures, with high accuracy and effective organisation. The use of linking words and phrases, such as 'however' and 'because', helps to connect ideas and make the text cohesive. The occasional error, such as the agreement mistake in 'the chips was', does not impede communication.",
      strengths:[{ evidence:4, advice:"The contrast linking phrase 'however' works well to contrast the positive and negative aspects of the experience." }, { evidence:5, advice:"The reason with 'because' helps to explain why the writer thinks families would like the restaurant." }],
      improvements:[{ evidence:8, advice:'Chips is plural, so use were, not was.', example:'the chips were' }], missingRequirements:[],
      nextStep:'Develop the opinion about the restaurant with a specific detail, such as describing the atmosphere or explaining how the prices are fair.'
    },
    improved:{
      contentMark:5, languageMark:5,
      contentReason:'Food, service, opinion and recommendation are all covered; the chicken pasta and the children\'s menu are developed with detail, while the opinion that prices are fair is only stated.',
      languageReason:'Linking with however and because gives clear organisation and the sentences are varied, but the chips was slip and a limited range of descriptive words keep the language in the middle band.',
      strengths:[{ evidence:4, advice:'However sets the cold chips against the friendly welcome, so the reader sees a balanced opinion.' }, { evidence:5, advice:'Because gives a reason for your opinion about families, which makes the recommendation easy to trust.' }],
      improvements:[{ evidence:8, advice:'x' }], missingRequirements:[], nextStep:'Choose the opinion that the prices are fair and add one detail, such as a price you paid, to show why.'
    }
  },
  R04: {
    taskType:'article',
    task:"Write an article for your school magazine on 'The advantages and disadvantages of social media for teenagers'. Write 120–160 words.",
    response:"Scroll through any teenager's phone and you will find a world of constant connection. Social media has undoubtedly transformed how young people communicate, but is this transformation entirely positive?\n\nOn the one hand, these platforms allow us to keep in touch with friends who have moved abroad and to discover communities that share our interests, from photography to coding. Several of my classmates have even launched small businesses online.\n\nOn the other hand, the pressure to look perfect can seriously damage self-esteem. Teenagers compare their ordinary lives with carefully edited images, and many end up feeling inadequate. In addition, hours spent online often replace sleep, which affects concentration at school.\n\nIf I were a head teacher, I would not ban social media; I would teach students to use it wisely. After all, technology is only as healthy as the habits we build around it.",
    stage1:{
      requirements:[{ taskQuote:'Write an article', quote:"Scroll through any teenager's phone" }, { taskQuote:'The advantages and disadvantages', quote:'On the one hand' }, { taskQuote:'for teenagers', quote:"any teenager's phone" }, { taskQuote:'120–160 words', quote:'' }, { taskQuote:'school magazine', quote:'If I were a head teacher' }],
      features:[{ label:'contrast linking phrase', quote:'On the one hand' }, { label:'conditional sentence', quote:'If I were a head teacher' }, { label:'topic words', quote:'Social media' }, { label:'example', quote:'from photography to coding' }], errors:[]
    },
    live:{
      contentMark:5, languageMark:8,
      contentReason:'The response consistently fulfils the task, discussing both advantages and disadvantages of social media for teenagers, and provides relevant examples and explanations.',
      languageReason:'The writing demonstrates a wide range of vocabulary and structures, with high accuracy and effective organisation, making it easy to follow and understand.',
      strengths:[{ evidence:8, advice:'The example of photography and coding helps to illustrate the variety of communities that can be found on social media, adding depth to the discussion.' }],
      improvements:[{ evidence:6, advice:'Consider adding more specific details to the conditional sentence, such as what exactly you would teach students to do, to make the suggestion more concrete and actionable.', example:'If I were a head teacher, I would teach students to use social media wisely by setting boundaries and promoting online safety.' }], missingRequirements:[],
      nextStep:'Develop the idea of teaching students to use social media wisely by providing more specific examples or strategies, such as how to identify and avoid online harassment or how to maintain a healthy balance between screen time and其他'
    },
    improved:{
      contentMark:6, languageMark:8,
      contentReason:'Both advantages and disadvantages are covered with specific examples such as coding and small businesses online, and the pressure to look perfect is explained through its effect on self-esteem; the closing solution is the least developed idea.',
      languageReason:'Cohesion is strong because of On the one hand, On the other hand and In addition, and a conditional sentence is controlled; no language error was confirmed, though the ideas in the final paragraph are expressed in fairly general words.',
      strengths:[{ evidence:5, advice:'On the one hand sets up the advantages, so the reader expects the disadvantages that come next.' }],
      improvements:[], missingRequirements:[], nextStep:'Choose the closing idea about teaching students to use social media wisely and add one practical habit, such as a screen-free hour before sleep.'
    }
  },
  R11: {
    taskType:'report',
    task:'Your school wants to reduce waste. You investigated how much plastic is used in the canteen. Write a report for the Head Teacher. Include: • what you found • the causes • your recommendations. Write 120–160 words.',
    response:'Report on plastic use in the canteen\n\nIntroduction\nThe aim of this report is to find out how much plastic the school canteen uses and to suggest improvements.\n\nFindings\nDuring one week I counted the plastic items that students threw away at lunchtime. About 400 bottles and 250 plastic forks were used every day. Most students said they take a new bottle because they forget to bring their own.\n\nCauses\nThe canteen sells drinks only in plastic bottles and there are no water fountains near the dining hall. Also, plastic forks is cheaper than metal ones.\n\nRecommendations\nI recommend that the school install two water fountains and sell reusable bottles at a low price. Moreover, the canteen could use metal forks which students wash after the meal.\n\nIf these changes are made, the amount of plastic would fall a lot.',
    stage1:{
      requirements:[{ taskQuote:'what you found', quote:'About 400 bottles and 250 plastic forks were used every day' }, { taskQuote:'the causes', quote:'The canteen sells drinks only in plastic bottles' }, { taskQuote:'your recommendations', quote:'I recommend that the school install two water fountains' }, { taskQuote:'Write a report for the Head Teacher', quote:'Report on plastic use in the canteen' }, { taskQuote:'Include', quote:'Introduction' }],
      features:[{ label:'conditional result', quote:'If these changes are made' }, { label:'reason', quote:'they forget to bring their own' }, { label:'additive linking phrase', quote:'Moreover' }, { label:'topic word', quote:'plastic' }, { label:'figures', quote:'About 400 bottles and 250 plastic forks' }],
      errors:[{ quote:'plastic forks is', correction:'plastic forks are', explanation:"agreement mistake: the subject 'forks' is plural, so the verb are must also be plural" }]
    },
    live:{
      contentMark:5, languageMark:6,
      contentReason:'The report consistently fulfils the task, covering what was found, the causes, and recommendations, with relevant and specific details such as the number of plastic bottles and forks used daily, and reasons for their use.',
      languageReason:"The writing demonstrates a wide range of vocabulary and structures, with high accuracy and effective organisation, using linking words and phrases like 'moreover' and 'also' to connect ideas, and only occasional errors that do not impede communication.",
      strengths:[{ evidence:7, advice:'You give a reason for students taking new bottles, which helps the reader understand the problem.' }, { evidence:8, advice:'You use a contrast linking phrase to connect your recommendations, making your plan clear.' }], improvements:[], missingRequirements:[],
      nextStep:'Develop your recommendations with more specific details, such as how the school could encourage students to use reusable bottles and metal forks, and what benefits this could bring.'
    },
    improved:{
      contentMark:4, languageMark:7,
      contentReason:'Findings, causes and recommendations are all present and the figures are specific, but the recommendations and the final result are only stated, with no explanation of how they would work or what the savings would be.',
      languageReason:'A report layout with headings, linking with Moreover and Also, and a conditional result sentence show range and organisation; one agreement slip in about 140 words does not affect understanding.',
      strengths:[{ evidence:7, advice:'You give a reason for students taking new bottles, so the reader understands the cause of the problem.' }, { evidence:8, advice:'Moreover adds a second recommendation, which helps the Head Teacher see your plan as a list of actions.' }], improvements:[], missingRequirements:[],
      nextStep:'Choose the final sentence about the amount of plastic falling and replace a lot with an estimate and a reason, such as half, because fountains remove most bottle use.'
    }
  }
};
