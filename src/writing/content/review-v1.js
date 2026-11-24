// Extracted verbatim from the legacy Review Writing Studio. Stable IDs preserve task identity.
// Original practice material, not Cambridge past-paper questions.
export const CATEGORY_NAMES = Object.freeze({restaurant:'Restaurant & Food',film:'Film & Entertainment',book:'Books & Reading',experience:'Experiences & Activities'});
// Twenty original practice tasks (not Cambridge past-paper questions). Each has a publication context, an audience and three content requirements.
// Optional plan/draft entries replace the category wording for that task: [question or placeholder, hint].
export const QUESTIONS = Object.freeze({
 restaurant:[
  {id:'restaurant-1',title:'A restaurant worth recommending',
   prompt:'Your school magazine is preparing a feature about places to eat. You recently visited a restaurant. Write a review for the magazine. Describe the food, service and atmosphere; explain what impressed or disappointed you; and say whether you would recommend it to other students.'},
  {id:'restaurant-2',title:'A disappointing dining experience',
   prompt:'The young readers’ page of your local newspaper has a series called “Honest Reviews”. Write a review of a meal that did not live up to your expectations. Describe what you ordered and what went wrong; explain how the restaurant could improve; and say whether you would give it a second chance.',
   plan:{planSubject:['Where was the meal, and what did you expect?','Name, place and what you had hoped for'],planDetails:['What did you order, and what went wrong?','Dishes, waiting time, temperature, service or mistakes'],planPositive:['Was anything done well, and why?','Be fair: a friendly waiter, a good dessert, a pleasant table'],planImprovement:['How could the restaurant improve?','Specific, realistic changes the owner could make'],planAudience:['Would you go back, and who should avoid or try it?','Give a clear judgement with a reason']},
   draft:{description:['Describe what you ordered and what went wrong, with specific details.','Choose the moments that show the problem most clearly.'],opinion:['Explain how the restaurant could improve, giving reasons.','Be fair and specific rather than only complaining.'],recommendation:['Say whether you would give it a second chance, and why.','Give a clear answer that readers can act on.']}},
  {id:'restaurant-3',title:'A new café in your neighbourhood',
   prompt:'A community website lists places where teenagers can meet friends after school. A new café has opened near your home or school. Write a review for the website. Describe the atmosphere and the menu; comment on whether the prices suit students; and say what kind of visitor you would recommend it to.',
   plan:{planSubject:['Which café is it, and where is it?','Name, location and how new it is'],planDetails:['What is the café like inside, and what does it serve?','Atmosphere, seating, drinks, snacks and the menu'],planPositive:['What makes it a good place to meet friends, and why?','Comfort, Wi-Fi, music, friendly staff or space'],planImprovement:['Are the prices fair for students?','Compare cost with portion size and quality'],planAudience:['What kind of visitor would enjoy it?','Study groups, friends, families, quiet readers...']}},
  {id:'restaurant-4',title:'A school canteen review',
   prompt:'Your student council is collecting honest reviews of the canteen for its termly newsletter. Write a review of the food and service in your school canteen (or one you know well). Describe the choice and quality of the food; comment on prices, queues or the eating space; and suggest one change that would make lunchtime better.',
   plan:{planSubject:['Which canteen are you reviewing?','Your school or one you know, and when students use it'],planOpening:['What is your overall impression of lunchtime?','Busy, healthy, rushed, welcoming?'],planDetails:['What food and choice does the canteen offer?','Hot meals, snacks, healthy options, special diets'],planPositive:['What does the canteen do well, and why?','Quality, variety, price, staff or atmosphere'],planImprovement:['What problems do students face?','Queues, noise, portion size, cost or seating'],planAudience:['What one change would you suggest, and why?','A realistic improvement the school could make']},
   draft:{recommendation:['Suggest one change that would improve lunchtime and say why it would help.','Make your suggestion realistic and explain the benefit.']}},
  {id:'restaurant-5',title:'A takeaway or food-delivery experience',
   prompt:'A consumer-advice blog for young people is publishing reviews of takeaways and food-delivery services. Write a review of a meal you ordered for delivery or collection. Describe how the ordering and delivery went and the quality of the food when it arrived; explain what was convenient or frustrating; and say whether you would use the service again.',
   plan:{planSubject:['Which takeaway or delivery service did you use?','Name, type of food and how you ordered'],planOpening:['What was your overall impression?','Quick and easy, disappointing, good value?'],planDetails:['How did ordering and delivery go?','App or phone, waiting time, packaging, accuracy'],planExample:['Which moment shows the quality most clearly?','The first bite, a missing item, a cold dish, a friendly driver'],planPositive:['What was convenient, and why?','Speed, choice, price or reliability'],planImprovement:['What was frustrating?','Delays, cost, packaging or mistakes'],planAudience:['Would you use it again, and who is it for?','Busy families, students, people who live nearby...']}}
 ],
 film:[
  {id:'film-1',title:'A film worth watching',
   prompt:'Your school magazine is publishing film recommendations for teenagers. Write a review of a film you have watched. Give a brief idea of the story without spoiling the ending, comment on the performances or other memorable features, and explain whether you recommend it.'},
  {id:'film-2',title:'A TV series or streaming show',
   prompt:'Your school media club is writing a blog about series worth following. Write a review of a TV series or streaming show you have watched over several episodes. Explain what the series is about without revealing major twists; comment on the characters and how the story develops; and say whether it is worth a student’s time.',
   plan:{planSubject:['Which series are you reviewing?','Title, genre, number of seasons or episodes watched'],planDetails:['What is the series about, and who are the main characters?','Premise and characters — no major twists'],planExample:['Which episode or moment stands out?','A memorable scene, cliffhanger or character'],planPositive:['What keeps viewers watching, and why?','Characters, writing, humour, suspense or world-building'],planImprovement:['Does it lose energy anywhere?','Slow episodes, repeated ideas or weaker seasons'],planAudience:['Is it worth a student’s time, and for whom?','Consider how much time it takes and what viewers like']},
   draft:{description:['Explain the series and its main characters without revealing major twists.','Choose one episode or moment instead of retelling the plot.'],opinion:['Evaluate how the characters and story develop over several episodes, with reasons.','Say whether it stays interesting, and why.']}},
  {id:'film-3',title:'A film based on a book or true story',
   prompt:'The English department newsletter has a “Page to Screen” feature. Write a review of a film based on a book, a game or real events. Describe how the film tells the story; comment on what it does well or less well compared with the original or the real events; and say whether you would recommend it to people who already know the original.',
   plan:{planSubject:['Which film are you reviewing, and what is it based on?','Film title and the book, game or event behind it'],planOpening:['What was your overall reaction?','Faithful, surprising, disappointing, impressive?'],planDetails:['How does the film tell the story?','Main characters, setting, tone — no spoilers'],planExample:['Which choice by the filmmakers stands out?','A scene that was kept, changed or added'],planPositive:['What did the film do better than, or as well as, the original?','Visuals, casting, pace or emotion'],planImprovement:['What was lost or changed for the worse?','Missing characters, rushed plot or different ending'],planAudience:['Who would enjoy it — fans of the original or newcomers?','Give a clear recommendation with a reason']}},
  {id:'film-4',title:'A live concert or performance',
   prompt:'A local arts website publishes reviews written by young people. Write a review of a live performance you attended, such as a concert, school play, dance show or comedy night. Describe the performers and the atmosphere; evaluate what was most and least successful; and say whether you would encourage others to attend the next performance.',
   plan:{planSubject:['What performance did you see, and where?','Name of the show or group, venue and date'],planOpening:['What was the mood of the evening?','Electric, relaxed, moving, disappointing?'],planDetails:['Who performed, and what did they do?','Performers, music or script, costumes, staging'],planExample:['Which moment was the highlight?','A song, scene, solo or reaction from the audience'],planPositive:['What was most successful, and why?','Energy, skill, atmosphere or originality'],planImprovement:['What was least successful?','Sound problems, a slow section, seating or length'],planAudience:['Who should go to the next performance?','Friends, families, fans of a particular style']}},
  {id:'film-5',title:'A video game for teenagers',
   prompt:'Your school’s technology and entertainment magazine is looking for game reviews. Write a review of a video game you have played. Explain what players have to do; evaluate how enjoyable, challenging and well designed it is; and say who you would recommend it to and whether it is good value.',
   plan:{planSubject:['Which game are you reviewing?','Title, type of game and the device you play it on'],planOpening:['What is your first impression?','Addictive, frustrating, creative, repetitive?'],planDetails:['What does the player have to do?','Aim of the game, controls, levels or characters'],planExample:['Which moment or level shows the game at its best?','A challenge, a surprise or a team moment'],planPositive:['What makes it enjoyable, and why?','Graphics, story, challenge, music or playing with friends'],planImprovement:['What could be better?','Difficulty, cost of extras, repeated tasks or bugs'],planAudience:['Who would enjoy it, and is it good value?','Beginners, experienced players, friends, solo players']},
   draft:{description:['Explain what players have to do, using one clear example.','Help a reader who has not played it understand the game.']}}
 ],
 book:[
  {id:'book-1',title:'A book worth reading',
   prompt:'Your school newsletter is collecting book reviews to help students choose what to read next. Write a review of a book you have read. Briefly introduce the story or subject, describe a memorable feature, evaluate its strengths or weaknesses, and recommend it to a suitable reader.'},
  {id:'book-2',title:'A non-fiction book that taught you something',
   prompt:'The school library’s “Read Smart” leaflet recommends non-fiction for students. Write a review of a non-fiction book you have read, such as a biography, a science book or a travel book. Explain what it is about and what you learned; evaluate how clearly and interestingly it presents information; and say who should read it.',
   plan:{planSubject:['Which non-fiction book are you reviewing?','Title, author and subject'],planDetails:['What is the book about, and what did you learn?','Main topic and one or two key ideas'],planExample:['Which fact, chapter or story stayed with you?','A surprising detail or a clear explanation'],planPositive:['What makes it clear and interesting, and why?','Explanations, examples, photos, structure or tone'],planImprovement:['What was hard to follow or less useful?','Too technical, too long, out of date or repetitive'],planAudience:['Who should read it, and why?','Students, hobbyists, people studying the topic']},
   draft:{description:['Explain what the book is about and what you learned from it.','Choose one idea or fact rather than listing everything.']}},
  {id:'book-3',title:'A graphic novel or comic',
   prompt:'The school library wants more students to try graphic novels and comics. Write a review of a graphic novel, comic or manga series you have read. Describe the story and the artwork; evaluate how well the pictures and words work together; and say what kind of reader you would recommend it to.',
   plan:{planSubject:['Which graphic novel or comic are you reviewing?','Title, creator, genre and series'],planDetails:['What happens in the story, and what does the artwork look like?','Characters, setting, art style, colour — no spoilers'],planExample:['Which page, panel or scene stands out?','A striking image or moment of humour or emotion'],planPositive:['How do the pictures and words work together?','Artwork that adds meaning, fast pace, expressions'],planImprovement:['What could be better?','Confusing panels, thin plot, too many characters'],planAudience:['Who would enjoy it?','Reluctant readers, art fans, followers of a genre']}},
  {id:'book-4',title:'A class reader or set text',
   prompt:'Your English department is choosing a novel for next year’s class and is collecting student reviews for its planning document. Write a review of a book you have read in class or studied at school. Describe its main ideas or themes; explain what makes it good or less good for classroom discussion; and say whether next year’s students should read it.',
   plan:{planSubject:['Which class reader or set text are you reviewing?','Title, author and when you read it'],planDetails:['What are its main ideas or themes?','Friendship, family, justice, growing up, change...'],planExample:['Which scene or character sparked discussion?','A moment your class debated or remembered'],planPositive:['Why does it work well in class?','Themes to discuss, characters to analyse, a gripping plot'],planImprovement:['What made it harder to study?','Difficult language, slow chapters or a confusing structure'],planAudience:['Should next year’s class read it, and why?','Give a clear recommendation with a reason']},
   draft:{recommendation:['Say whether next year’s students should read it and give your reasons.','Make a clear decision that your teacher could use.']}},
  {id:'book-5',title:'A local library or bookshop',
   prompt:'A town website for young people is publishing reviews of places to spend free time. Write a review of a library or bookshop you have visited. Describe the atmosphere and what you can find there; evaluate how welcoming and useful it is for teenagers; and say whether you would recommend it and to whom.',
   plan:{planSubject:['Which library or bookshop are you reviewing?','Name, location and what kind of place it is'],planOpening:['What is the place like when you walk in?','Calm, busy, cosy, bright, welcoming?'],planDetails:['What can you find or do there?','Book sections, study spaces, events, café, staff help'],planExample:['Which part of the visit stands out?','A reading corner, a helpful librarian or a special find'],planPositive:['What makes it useful for teenagers, and why?','Choice, quiet space, events, opening hours or prices'],planImprovement:['What could be better?','Limited choice, noise, lack of seating or opening times'],planAudience:['Who would enjoy it?','Students, book lovers, families, people looking for quiet']}}
 ],
 experience:[
  {id:'experience-1',title:'An event or activity worth trying',
   prompt:'A youth website wants reviews of activities and events for young people. Write a review of an event or activity you attended. Describe what the experience involved, discuss what worked well and what could have been better, and explain who you would recommend it to.'},
  {id:'experience-2',title:'A school trip or excursion',
   prompt:'Your school website has a section where students review trips to help teachers plan the next year. Write a review of a school trip or excursion you took part in. Describe where you went and what you did; evaluate how well it was organised and what you learned or enjoyed; and say whether the trip should be repeated and for which students.',
   plan:{planSubject:['Where did you go, and when?','Place, year group and purpose of the trip'],planDetails:['What did you do during the trip?','Activities, timetable, travel and free time'],planExample:['Which moment do you remember most?','A surprise, a challenge or something you learned'],planPositive:['What worked well, and why?','Organisation, learning, teamwork or enjoyment'],planImprovement:['What could have been better?','Timing, cost, food, travel or too little time'],planAudience:['Should the trip run again, and for whom?','Which year groups and what to change']},
   draft:{recommendation:['Say whether the trip should be repeated and which students would benefit.','Give your reasons and one improvement if needed.']}},
  {id:'experience-3',title:'A sport or fitness activity',
   prompt:'A youth sports club is producing a leaflet to help newcomers choose an activity. Write a review of a sport, class or fitness activity you have tried. Describe what a typical session involves; comment on the coaching, facilities or level of difficulty; and say who you would recommend it to.',
   plan:{planSubject:['Which sport or activity did you try?','Name, where it takes place and how long you have done it'],planOpening:['How did it feel to take part?','Energising, exhausting, relaxing, confusing at first?'],planDetails:['What does a typical session involve?','Warm-up, skills, games, equipment, group size'],planExample:['Which moment stands out?','A new skill, a challenge or a friendly match'],planPositive:['What is good about the coaching or facilities?','Clear instructions, encouragement, equipment or space'],planImprovement:['What could be better or more difficult?','Level of difficulty, cost, timing or crowded sessions'],planAudience:['Who would enjoy it?','Beginners, teams, people who like a challenge']}},
  {id:'experience-4',title:'A museum, gallery or exhibition',
   prompt:'A family tourism website wants honest views from young visitors. Write a review of a museum, gallery or exhibition you have visited. Describe the most interesting things to see; evaluate how well it keeps teenagers interested and how good the facilities are; and say whether it is worth the entrance fee and who should go.',
   plan:{planSubject:['Which museum, gallery or exhibition did you visit?','Name, location and what it is about'],planOpening:['What was your overall impression?','Fascinating, quiet, overwhelming, dull?'],planDetails:['What are the most interesting things to see?','Objects, displays, interactive areas, special exhibitions'],planExample:['Which exhibit or room was most memorable?','Something you could picture clearly and explain'],planPositive:['What keeps teenagers interested, and why?','Hands-on activities, technology, stories or atmosphere'],planImprovement:['What could be improved, and is it worth the price?','Crowds, cost, signs, food or seating'],planAudience:['Who should visit?','Families, school groups, history or art fans']}},
  {id:'experience-5',title:'A holiday workshop or course',
   prompt:'Your school’s student-voice magazine wants reviews of things to do in the holidays. Write a review of a workshop, camp or course you took part in during a holiday. Describe what you did and learned; evaluate the leaders, the level of challenge and the value for money; and say whether you would recommend it and to whom.',
   plan:{planSubject:['What workshop, camp or course did you do?','Name, subject, length and where it took place'],planOpening:['How did you feel about it overall?','Inspiring, tiring, useful, not what you expected?'],planDetails:['What did you do and learn?','Activities, projects, skills and new friends'],planExample:['Which activity or moment stands out?','A project you finished, a challenge or a funny moment'],planPositive:['What was best about the leaders and the challenge?','Clear teaching, encouragement, hands-on tasks'],planImprovement:['What could have been better, and was it good value?','Group size, cost, timing or too easy or hard'],planAudience:['Who would you recommend it to?','Beginners, creative students, people wanting a challenge']}}
 ]
});
export const PLAN_GUIDANCE = Object.freeze({
 restaurant:{
 planSubject:['Which restaurant did you visit? Where was it?','Name, location and type of food'],
 planOpening:['What was your overall impression?','Worth visiting? Welcoming, disappointing, memorable?'],
 planDetails:['Which details best describe it?','Food, atmosphere, service, price or value'],
 planExample:['Which dish or moment stands out?','A specific dish, service moment or detail'],
 planPositive:['What worked best, and why?','Taste, presentation, service, atmosphere or value'],
 planImprovement:['What could have been better?','Waiting time, cost, food, cleanliness or service'],
 planAudience:['Who should visit, and why?','Families, friends, students, food lovers...']
 },
 film:{
 planSubject:['Which film are you reviewing?','Title, genre and brief context'],
 planOpening:['What was your overall reaction?','Entertaining, moving, dull, surprising?'],
 planDetails:['What should readers know about it?','Story premise, setting or characters — no spoilers'],
 planExample:['Which scene or feature stands out?','A memorable scene, performance or visual effect'],
 planPositive:['What was effective, and why?','Acting, story, soundtrack or cinematography'],
 planImprovement:['What was less successful?','Pacing, predictability, characters or length'],
 planAudience:['Who would enjoy the film?','Fans of a genre or particular kind of story']
 },
 book:{
 planSubject:['Which book are you reviewing?','Title, author, genre or subject'],
 planOpening:['How did the book make you feel?','Engaging, thoughtful, disappointing, exciting?'],
 planDetails:['What makes this book distinctive?','Plot premise, characters, setting or writing style'],
 planExample:['Which moment or character stands out?','A memorable scene or character — avoid spoilers'],
 planPositive:['What was strongest, and why?','Characters, pace, themes or descriptions'],
 planImprovement:['What could have been better?','Slow sections, confusing plot, weak ending'],
 planAudience:['Which readers would enjoy it?','Age group, interests or favourite genre']
 },
 experience:{
 planSubject:['What event or activity was it?','Name, place and type of experience'],
 planOpening:['How was the overall experience?','Enjoyable, exciting, stressful or disappointing?'],
 planDetails:['What happened during it?','Activities, facilities, atmosphere or organisation'],
 planExample:['Which moment was memorable?','A particular activity, interaction or highlight'],
 planPositive:['What was the best part, and why?','Excitement, learning, staff, value or facilities'],
 planImprovement:['What could have been better?','Queues, timing, organisation or accessibility'],
 planAudience:['Who should try this experience?','Friends, families, beginners or enthusiasts']
 }
});

export const reviewConfig = {
 id:'review', appKey:'review_writing', version:1, title:'Review Writing',
 wordRange:{min:120,max:160},
 sections:['intro','description','opinion','recommendation'],
 categories:Object.entries(CATEGORY_NAMES).map(([id,title])=>({id,title})),
 tasks:Object.entries(QUESTIONS).flatMap(([category,questions])=>questions.map(q=>({...q,category,version:1}))),
 pathways:[
  {id:'structure',title:'Structure & Organisation'},
  {id:'expression',title:'Vocabulary & Expression'},
  {id:'development',title:'Idea Development'},
  {id:'cohesion',title:'Grammar & Cohesion'},
  {id:'editing',title:'Editing & Improvement'},
  {id:'exam',title:'Exam Mastery'}
 ]
};
