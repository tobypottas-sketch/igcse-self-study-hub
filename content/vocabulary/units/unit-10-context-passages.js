// Unit 10 · Context · Mastery (type_in_passage) — authored short passages, WORDS 1–48 (complete). Same contract as unit-09-context-passages.js:
// two passages per word, each 2-3 natural sentences with exactly ONE gap (`____`); the passage never contains the target elsewhere, never starts
// with the gap, and makes the target the natural fit. `answer` is the exact surface form typed. `why` records what points to the word.
const p = (text, answer, why) => ({ text, answer, why });

export default Object.freeze({
  education: [
    p('In the past, many girls in the village had to leave school at twelve. Today, every child receives a free ____ until the age of eighteen.', 'education', 'Schooling until eighteen: teaching and learning.'),
    p('Her grandparents never learned to read. They worked hard so that their children could have the ____ they never had.', 'education', 'Learning to read, which the grandparents missed: schooling.')
  ],
  'higher education': [
    p('After their final school exams, students have a choice. Some start work, while others go on to ____ at a university or college.', 'higher education', 'Study at university or college after school.'),
    p('University fees have risen sharply. Some families now worry that ____ is becoming too expensive for ordinary students.', 'higher education', 'University fees: degree-level study.')
  ],
  university: [
    p('My sister wants to become a doctor. Next year she will start a six-year medical degree at ____.', 'university', 'A degree course: where degrees are studied.'),
    p('The professor has worked at the same ____ for thirty years. She teaches students and leads a team of scientists.', 'university', 'Professor, teaching and research: an institution for degrees.')
  ],
  academic: [
    p('Tom is brilliant at sport and music. However, his ____ results in maths and science are disappointing.', 'academic', 'Results in school subjects, contrasted with sport and music.'),
    p('In Britain, the ____ year begins in September. It ends with exams in the early summer.', 'academic', 'The school year: connected with study.')
  ],
  recreation: [
    p('The old factory site has been turned into a park. It now provides space for walking, football and other kinds of ____.', 'recreation', 'Walking and football in free time: enjoyable activities.'),
    p('Students work hard all week. They also need time for ____, such as sport, music or meeting friends.', 'recreation', 'Sport, music and friends: free-time activities.')
  ],
  literacy: [
    p('Thirty years ago, only half the adults in the region could read a newspaper. Thanks to evening classes, ____ has improved dramatically.', 'literacy', 'Ability to read improving: reading and writing.'),
    p('Children who are read to every night usually learn to read sooner. Parents play a huge part in developing early ____.', 'literacy', 'Learning to read: reading and writing ability.')
  ],
  assessment: [
    p('There is no final exam on this course. Instead, your teachers will mark your projects throughout the year as part of continuous ____.', 'assessment', 'Marking work throughout the year: judging learning.'),
    p('The coach watched each player carefully during training. He then gave an honest ____ of their strengths and weaknesses.', 'assessment', 'Judging strengths and weaknesses.')
  ],
  'international crisis': [
    p('The disease spread from one country to another within weeks. Governments everywhere had to respond to the growing ____.', 'international crisis', 'A serious emergency spreading across countries.'),
    p('Millions of people left their homes after the war began. World leaders met urgently to discuss the ____.', 'international crisis', 'War and refugees needing many nations to act.')
  ],
  'digital device': [
    p('Phones, tablets and laptops must be switched off before the exam begins. Any student found using a ____ will be asked to leave.', 'digital device', 'Phones, tablets and laptops: electronic equipment.'),
    p('The library now lends out tablets. Students who do not own a ____ can borrow one for a week.', 'digital device', 'A tablet: an electronic gadget.')
  ],
  progress: [
    p('At the start of the year, Lina could not swim at all. Now she can swim fifty metres, so her teacher is delighted with her ____.', 'progress', 'Improvement from not swimming to fifty metres.'),
    p('The builders started work on the new library in March. Because of heavy rain, ____ has been slower than expected.', 'progress', 'Movement towards finishing the building.')
  ],
  encourage: [
    p('Leo wanted to give up the piano after a difficult lesson. His teacher told him he was improving and tried to ____ him to keep practising.', 'encourage', 'Giving support so he continues.'),
    p('The city has built hundreds of kilometres of cycle lanes. Officials hope this will ____ more people to leave their cars at home.', 'encourage', 'Making an action more likely.')
  ],
  reflect: [
    p('At the end of every project, the teacher asks us to stop and think. We ____ on what went well and what we could do better next time.', 'reflect', 'Thinking carefully about your own work.'),
    p('Maria studied every evening for months. Her excellent results ____ all the effort she put in.', 'reflect', 'Results show or are a sign of effort.')
  ],
  performance: [
    p('Sam slept for only four hours before the exam. Not surprisingly, his ____ was much worse than usual.', 'performance', 'How well he did in the exam.'),
    p('The orchestra practised for months. On the night of the concert, the audience gave their ____ a standing ovation.', 'performance', 'A show in front of an audience.')
  ],
  confidence: [
    p('At first, Ana was too shy to speak in class. After joining the drama club, she gained the ____ to give her opinion in front of everyone.', 'confidence', 'Shy at first, then able to speak: belief in herself.'),
    p('The team lost every match last season. The new coach is working hard to rebuild the players’ ____.', 'confidence', 'Losing every match: rebuilding their self-belief.')
  ],
  contribute: [
    p('In group work, nobody should sit back and let others do everything. Every member is expected to ____ ideas.', 'contribute', 'Giving ideas to help the group.'),
    p('Many things can affect how well you sleep. Late-night screen time can ____ to poor sleep.', 'contribute', 'Being one of the causes.')
  ],
  condition: [
    p('Dad said I could go to the concert. However, there was one ____: I had to be home by eleven.', 'condition', 'Something that must happen first.'),
    p('My grandfather’s old bicycle is fifty years old. He has looked after it so well that it is still in perfect ____.', 'condition', 'The state something is in.')
  ],
  conditional: [
    p('Look at this example: if I won the lottery, I would travel the world. This sentence is an example of the second ____.', 'conditional', 'An if-sentence about an imagined situation.'),
    p('Our grammar lesson today is about if-sentences. We will start with the first ____, which describes likely future situations.', 'conditional', 'Types of if-sentence: the first one.')
  ],
  preparation: [
    p('The exams start in six weeks. Students who begin their ____ now will feel much calmer on the day.', 'preparation', 'Getting ready for exams.'),
    p('The school festival takes months to organise. The students begin their ____ in January, when they start planning the stalls.', 'preparation', 'Planning and getting ready for the festival.')
  ],
  employment: [
    p('When the factory closed, hundreds of workers lost their jobs. Many had to move to the city to find new ____.', 'employment', 'Losing jobs and looking for paid work.'),
    p('Engineering graduates rarely struggle to find work. Most are in full-time ____ within six months of leaving university.', 'employment', 'Having a paid job.')
  ],
  career: [
    p('Ahmed has loved animals since he was a child. He hopes to have a long ____ as a vet.', 'career', 'A long-term path in one type of work.'),
    p('The famous actor retired last year. During his fifty-year ____, he appeared in more than a hundred films.', 'career', 'His working life as an actor.')
  ],
  subject: [
    p('I find chemistry very difficult. Art is my favourite ____ because I can be creative.', 'subject', 'An area of study at school.'),
    p('The conversation turned to exams, and Zara looked worried. Her friend noticed and quickly changed the ____.', 'subject', 'The topic of conversation.')
  ],
  aspect: [
    p('There are many good things about my new school. The most enjoyable ____ for me is the wide choice of clubs.', 'aspect', 'One feature of the school.'),
    p('The report covers the cost of the plan and its effect on the environment. It does not consider the social ____ at all.', 'aspect', 'One side of a situation.')
  ],
  industry: [
    p('Thousands of tourists visit the island every summer. Hotels, restaurants and tour guides depend on the tourism ____.', 'industry', 'All the businesses providing one service.'),
    p('The town grew rich because of its coal mines and steel works. When heavy ____ declined, many people left.', 'industry', 'Production of goods in mines and factories.')
  ],
  interview: [
    p('Kai applied for a part-time job at the sports centre. The manager invited him for an ____ next Tuesday.', 'interview', 'A formal meeting with questions for a job.'),
    p('The famous footballer rarely speaks to journalists. However, he gave a long ____ to a newspaper after the final.', 'interview', 'A conversation reported in the media.')
  ],
  overseas: [
    p('Students come to the university from more than sixty countries. The ____ students often organise a festival of food from home.', 'overseas', 'Students from other countries.'),
    p('Most of the company’s customers live abroad. In fact, ____ sales are now twice as high as local sales.', 'overseas', 'Sales in foreign countries.')
  ],
  challenge: [
    p('Learning a language with a completely different alphabet is not easy. For most students, it is a real ____.', 'challenge', 'Something difficult that tests ability.'),
    p('Moving to a new country can be difficult. The biggest ____ for many families is finding a school for their children.', 'challenge', 'The most difficult thing to deal with.')
  ],
  reluctant: [
    p('Omar did not want to join the debate because he hated speaking in public. His teacher understood why he was so ____.', 'reluctant', 'Not wanting to do something.'),
    p('Most of the class were happy to try the new app. Only a few students were ____ to change the way they studied.', 'reluctant', 'Unwilling to change.')
  ],
  cosmopolitan: [
    p('On one street you can eat Thai, Lebanese and Mexican food. People from all over the world live here, making it a truly ____ city.', 'cosmopolitan', 'People and food from many countries.'),
    p('Students at the international school speak more than forty languages. The atmosphere is relaxed and very ____.', 'cosmopolitan', 'A mix of many cultures.')
  ],
  assignment: [
    p('Our history teacher has asked us to write a report on the causes of the war. The ____ must be handed in before the holidays.', 'assignment', 'A piece of work set by a teacher.'),
    p('University students often have several deadlines in the same week. Planning time for each ____ is an important skill.', 'assignment', 'Pieces of coursework with deadlines.')
  ],
  loneliness: [
    p('Chen moved abroad to study and did not know anyone. In the first few weeks, he suffered from terrible ____.', 'loneliness', 'Knowing nobody: feeling alone.'),
    p('Many elderly people live alone and rarely see anyone. Volunteers visit them every week to help reduce their ____.', 'loneliness', 'Living alone: unhappy feeling of being alone.')
  ],
  opportunity: [
    p('The exchange programme lets students live with a family in Spain. It is a wonderful ____ to improve their Spanish.', 'opportunity', 'A chance to do something useful.'),
    p('Not every child in the world can go to school. Campaigners believe that every child deserves an equal ____ to learn.', 'opportunity', 'An equal chance to learn.')
  ],
  examination: [
    p('Students must arrive early and leave their phones in their bags. The ____ begins at nine o’clock and lasts two hours.', 'examination', 'A formal test with rules and time.'),
    p('After the fall, Tom’s arm was very painful. The doctor carried out a careful ____ before taking an X-ray.', 'examination', 'A careful medical check.')
  ],
  research: [
    p('Scientists have studied the sleep of thousands of teenagers. Their ____ shows that most teenagers do not get enough sleep.', 'research', 'Detailed study to find facts.'),
    p('Before you write your essay, find out as much as you can about the topic. Do your ____ using reliable books and websites.', 'research', 'Reading and studying to find information.')
  ],
  presentation: [
    p('Each student must speak to the class for five minutes about a hobby. You can use slides to support your ____.', 'presentation', 'A talk to an audience with slides.'),
    p('Dina stood at the front with her slides ready. She took a deep breath and began her ____ on renewable energy.', 'presentation', 'A talk explaining a topic.')
  ],
  pronunciation: [
    p('Paulo’s written English is excellent. However, people sometimes misunderstand him because his ____ is unclear.', 'pronunciation', 'How he says words.'),
    p('The online dictionary has a small speaker symbol next to each word. If you click it, you can hear the correct ____.', 'pronunciation', 'How a word is spoken.')
  ],
  intonation: [
    p('You can often tell how someone feels from the way their voice rises and falls. Her ____ showed that she was not really happy.', 'intonation', 'The rise and fall of the voice.'),
    p('In English, our voice usually goes up at the end of a yes/no question. This rising ____ shows the listener that we expect an answer.', 'intonation', 'The voice going up: rising pattern.')
  ],
  vocabulary: [
    p('Every week, Mei writes ten new words in a notebook and tests herself. As a result, her ____ has grown enormously.', 'vocabulary', 'The words she knows.'),
    p('Medicine has many difficult words. Medical students must learn a large amount of specialist ____.', 'vocabulary', 'Words used in one subject.')
  ],
  accurately: [
    p('In the science experiment, small mistakes can ruin the results. You must measure each liquid ____.', 'accurately', 'Measuring exactly, with no mistakes.'),
    p('A good summary does not change the writer’s ideas. It reports them ____ and in fewer words.', 'accurately', 'Correctly, true to the original.')
  ],
  effectively: [
    p('Some students revise for hours without remembering much. Others use short, focused sessions and learn far more ____.', 'effectively', 'In a way that works well.'),
    p('A good leader listens to the team and explains plans clearly. This helps everyone work together ____.', 'effectively', 'Working with good results.')
  ],
  evaluate: [
    p('Not everything on the internet is true. Before using a website in your essay, ____ how reliable it is.', 'evaluate', 'Judging how reliable something is.'),
    p('The new timetable started in September. In December, the school will ____ whether it has been a success.', 'evaluate', 'Judging how successful something has been.')
  ],
  develop: [
    p('Joining the debate club helped Raj in many ways. He began to ____ his speaking skills and his confidence.', 'develop', 'Making skills grow stronger.'),
    p('The company spent three years on a new learning app. Engineers worked hard to ____ it before it was launched.', 'develop', 'Creating and improving a product.')
  ],
  communicate: [
    p('Sara could not speak the local language when she arrived. At first, she used gestures and pictures to ____ with her neighbours.', 'communicate', 'Sharing ideas with others.'),
    p('A good poster has one clear message. It should ____ that message to anyone who walks past.', 'communicate', 'Making an idea clear to people.')
  ],
  opinion: [
    p('Some people think homework is useful, but others disagree. In my ____, a small amount of homework helps students remember what they learn.', 'opinion', 'What I personally think.'),
    p('The teacher asked each student what they thought of the novel. Most students gave a positive ____.', 'opinion', 'What someone thinks of something.')
  ],
  preference: [
    p('You can choose to sit the test on paper or on a computer. Please tell your teacher your ____ by Friday.', 'preference', 'Which option you like more.'),
    p('Many employers choose candidates who have already worked in the industry. They show a clear ____ for experience.', 'preference', 'Liking one thing more than another.')
  ],
  discussion: [
    p('Our class talked for an hour about whether phones should be banned at school. It was a lively ____, and everyone shared their views.', 'discussion', 'Talking and sharing views on a topic.'),
    p('The council has not decided whether to close the library. The plan is still under ____.', 'discussion', 'Being talked about before a decision.')
  ],
  achievement: [
    p('Nadia failed maths twice but never gave up. Passing it with a top grade was her greatest ____.', 'achievement', 'Something difficult done successfully.'),
    p('Every June, the school holds a ceremony. Students receive prizes for academic ____ and for helping others.', 'achievement', 'Success through effort.')
  ],
  qualification: [
    p('To work as a nurse, you must complete a three-year course. Without this ____, hospitals will not employ you.', 'qualification', 'An official record of a completed course.'),
    p('IGCSEs are recognised by universities all over the world. They are a valuable ____ for students who want to study abroad.', 'qualification', 'An exam certificate.')
  ],
  succeed: [
    p('Climbing the mountain took three attempts. On the third try, the team finally managed to ____.', 'succeed', 'Achieving what they were trying to do.'),
    p('The new mentoring scheme gives every student support. Its aim is to help everyone ____, whatever their background.', 'succeed', 'Doing well in study or life.')
  ]
});
