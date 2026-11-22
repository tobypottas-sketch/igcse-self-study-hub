// Unit 9 · Context · Mastery (type_in_passage) — authored short passages, WORDS 1–50 (complete). Same contract as unit-08-context-passages.js:
// two passages per word, each 2-3 natural sentences with exactly ONE gap (`____`); the passage never contains the target elsewhere, never starts
// with the gap, and makes the target the natural fit. `answer` is the exact surface form typed. `why` records what points to the word.
const p = (text, answer, why) => ({ text, answer, why });

export default Object.freeze({
  communication: [
    p('The project failed because nobody knew who was doing what. Better ____ between the team members would have solved the problem.', 'communication', 'Team members not knowing what others were doing: sharing information.'),
    p('Emojis have become an important part of online ____. They show feelings that are hard to express in a few typed words.', 'communication', 'Emojis show feelings in messages: sharing ideas and feelings.')
  ],
  signalling: [
    p('The lorry driver could not see behind him. A worker stood at the back, ____ with both arms to show him when to stop.', 'signalling', 'Using arm movements to give a message to the driver.'),
    p('The red light on the router kept flashing. It was ____ that the internet connection had been lost.', 'signalling', 'A flashing light gives a warning message.')
  ],
  represent: [
    p('Look at the graph carefully. The orange lines ____ boys and the purple lines show girls.', 'represent', 'Coloured lines stand for groups on a graph.'),
    p('Every year, each class votes for two students. These students ____ their classmates at the school council.', 'represent', 'Elected students speak for their class.')
  ],
  effective: [
    p('Shouting at the class did not make them quieter. The teacher found that waiting silently was far more ____.', 'effective', 'Waiting silently worked better: produced the wanted result.'),
    p('The anti-litter posters were so ____ that the playground was clean within a week. The head teacher plans to use them again.', 'effective', 'Posters produced the wanted result quickly.')
  ],
  portable: [
    p('Our grandparents had one huge telephone fixed to the wall in the hall. Today, phones are so ____ that we carry them everywhere.', 'portable', 'Contrast with a phone fixed to a wall: easy to carry.'),
    p('The band needed a speaker they could carry to the beach. They bought a small ____ one that runs on batteries.', 'portable', 'Small, battery-powered and carried to the beach.')
  ],
  demonstrate: [
    p('The new students did not know how to use the library computers. A librarian offered to ____ how to search for books.', 'demonstrate', 'Showing new users how something works.'),
    p('Many people think that reading on screens is just as good as reading on paper. However, some studies ____ that we remember less from screens.', 'demonstrate', 'Studies showing clearly that something is true.')
  ],
  launched: [
    p('After two years of testing, the company finally ____ its new translation app last week. Within days, a million people had downloaded it.', 'launched', 'A product introduced to the public after testing.'),
    p('Worried about cyberbullying, the school ____ a campaign called "Think before you post". Posters appeared in every corridor.', 'launched', 'A campaign started officially.')
  ],
  passive: [
    p('In traditional lessons, students sat and listened for an hour. Teachers now want them to stop being ____ listeners and to discuss ideas.', 'passive', 'Sitting and only listening, contrasted with discussing.'),
    p('Scrolling through videos for hours is a very ____ activity. You simply watch and never create anything yourself.', 'passive', 'Only watching, never creating.')
  ],
  interactive: [
    p('The old museum only had glass cases and labels. The new science centre is fully ____, so children can press buttons and run experiments.', 'interactive', 'Visitors can press buttons and take part.'),
    p('The online lesson was very ____. Students voted in polls, answered quizzes and sent questions to the teacher.', 'interactive', 'Two-way activity: polls, quizzes and questions.')
  ],
  'tech-savvy': [
    p('My grandfather used to be afraid of computers. Now he is so ____ that he edits videos and helps his friends set up their phones.', 'tech-savvy', 'Confident and skilled with technology.'),
    p('The company wants staff who are ____ and comfortable learning new software quickly. Experience with social media is an advantage.', 'tech-savvy', 'Comfortable with new software and social media.')
  ],
  'digital native': [
    p('Sara was born in 2010 and has used a tablet since she was two. As a ____, she cannot imagine life without the internet.', 'digital native', 'Grown up using digital technology from early childhood.'),
    p('My father learned to use computers at work when he was thirty. My little brother, who is a ____, learned before he could read.', 'digital native', 'Contrast with someone who learned as an adult.')
  ],
  accuracy: [
    p('Before publishing the article, the editor checked every date and name. She was worried about the ____ of the information.', 'accuracy', 'Checking dates and names for correctness.'),
    p('Spelling and grammar mistakes lose marks in the writing paper. The examiners look for ____ as well as interesting ideas.', 'accuracy', 'Freedom from mistakes in spelling and grammar.')
  ],
  appropriate: [
    p('Shorts and flip-flops are fine for the beach. They are not ____ for a job interview at a bank.', 'appropriate', 'Clothes suitable for some situations but not others.'),
    p('When you write to your head teacher, avoid slang and emojis. Choose language that is polite and ____.', 'appropriate', 'Language suitable for writing to a head teacher.')
  ],
  banned: [
    p('Several students were caught using their phones during the exam. Since then, phones have been ____ from the exam hall completely.', 'banned', 'Phones no longer allowed after misuse.'),
    p('The government decided the chemical was too dangerous. It is now ____ in all toys sold in the country.', 'banned', 'Officially not allowed because it is dangerous.')
  ],
  community: [
    p('When the old library was going to close, local people raised money to save it. The whole ____ came together to help.', 'community', 'Local people acting together.'),
    p('Kai loves building model trains. He has joined an online ____ of people from all over the world who share the same hobby.', 'community', 'People with the same hobby.')
  ],
  optional: [
    p('All students must take English and maths. Art and music, however, are ____ after Year 9.', 'optional', 'Contrast with subjects that must be taken.'),
    p('The basic app is free. Extra features cost money, but buying them is completely ____.', 'optional', 'Choosing to pay or not: not required.')
  ],
  survive: [
    p('Many local languages are disappearing. Experts fear that only half of them will ____ until the end of the century.', 'survive', 'Languages continuing to exist.'),
    p('Most small bookshops closed when online shopping became popular. The few that managed to ____ now hold events to attract customers.', 'survive', 'Continuing to exist when others closed.')
  ],
  unlike: [
    p('Leo loves talking on the phone for hours. His sister, ____ him, prefers to send short messages.', 'unlike', 'Contrast between Leo and his sister.'),
    p('A letter takes days to arrive. An email, ____ a letter, reaches the reader in seconds.', 'unlike', 'Contrast between letters and emails.')
  ],
  frustration: [
    p('Mia tried to join the online lesson five times, but the connection kept failing. In ____, she closed her laptop and phoned her teacher.', 'frustration', 'Annoyed because she could not do what she wanted.'),
    p('Not understanding what people say in a new country can cause great ____. Many students feel annoyed and helpless at first.', 'frustration', 'Annoyed and helpless because unable to communicate.')
  ],
  informal: [
    p('In a message to your best friend, you can use contractions and short sentences. This kind of ____ writing would be wrong in a report.', 'informal', 'Relaxed style contrasted with a report.'),
    p('There was no agenda and no official notes. It was just an ____ meeting over coffee to share ideas.', 'informal', 'No agenda or official notes: relaxed meeting.')
  ],
  casual: [
    p('The invitation said "no need to dress up". Most guests arrived in jeans, T-shirts and other ____ clothes.', 'casual', 'Jeans and T-shirts; no need to dress up.'),
    p('His email began "Hey there!" and ended with three emojis. The manager thought the tone was too ____ for a job application.', 'casual', 'Relaxed tone unsuitable for a job application.')
  ],
  workforce: [
    p('The company has offices in six countries. Its ____ of over ten thousand people speaks more than twenty languages.', 'workforce', 'All the people who work for the company.'),
    p('More young people than ever now finish university. When they join the ____, they bring strong digital skills with them.', 'workforce', 'Starting work: joining all the working people.')
  ],
  generation: [
    p('My grandparents wrote letters and my parents sent emails. My ____ mostly sends voice messages.', 'generation', 'Age groups compared: grandparents, parents, my age group.'),
    p('Each new ____ of teenagers seems to invent its own slang. Words that were cool ten years ago now sound old-fashioned.', 'generation', 'Teenagers of a particular time as a group.')
  ],
  perception: [
    p('Many people used to think video games were a waste of time. That ____ has changed, and some universities now offer courses in game design.', 'perception', 'The way people think about video games.'),
    p('Lin believed that her classmates did not like her. Her ____ was wrong: they simply thought she was shy.', 'perception', 'Her belief about the situation, which was wrong.')
  ],
  'non-verbal': [
    p('He said he was happy, but his crossed arms and tired face told a different story. His ____ signals showed how he really felt.', 'non-verbal', 'Arms and face communicating without words.'),
    p('In some countries, nodding means "no" rather than "yes". Travellers should learn about ____ communication before they visit.', 'non-verbal', 'Gestures as communication without words.')
  ],
  underlying: [
    p('The students said they were late because of traffic. However, the ____ reason was that they did not want to miss breakfast.', 'underlying', 'The real reason, hidden behind the excuse.'),
    p('Changing the colour of the app did not stop users leaving. The ____ problem was that it was too slow.', 'underlying', 'The real problem beneath the surface change.')
  ],
  differentiate: [
    p('Fake news websites often look very professional. It can be hard to ____ between real news and invented stories.', 'differentiate', 'Telling real and invented stories apart.'),
    p('The twins look exactly the same. Only their mother can ____ one from the other at first glance.', 'differentiate', 'Telling identical twins apart.')
  ],
  physical: [
    p('The bookshop closed its ____ store in the high street. It now sells books only through its website.', 'physical', 'A real shop contrasted with the website.'),
    p('A photo of your ticket on your phone is not enough. You must bring a ____ copy printed on paper.', 'physical', 'Paper copy contrasted with a phone photo.')
  ],
  platform: [
    p('Teachers post homework and students upload their work on the same online ____. It also sends reminders before deadlines.', 'platform', 'An online system used to share work.'),
    p('The singer released her new song on a streaming ____. Within hours, it had been played a million times.', 'platform', 'A digital service for sharing music.')
  ],
  virtual: [
    p('The museum is closed for repairs, but you can still visit it online. Its ____ tour shows every room in 3D.', 'virtual', 'An online tour instead of a real visit.'),
    p('The manager was in Dubai and the team was in London. They held a ____ meeting using video cameras and headsets.', 'virtual', 'An online meeting across countries.')
  ],
  'face-to-face': [
    p('After months of chatting online, the two pen friends finally met ____ at the airport. They hugged and laughed for minutes.', 'face-to-face', 'Meeting in person after online chats.'),
    p('Some problems are too serious to discuss by message. A ____ conversation lets you see how the other person is feeling.', 'face-to-face', 'In-person conversation contrasted with messages.')
  ],
  conference: [
    p('Over three days, two thousand doctors met in Singapore to share new research. The ____ ended with a talk by a famous surgeon.', 'conference', 'Large formal meeting over three days.'),
    p('Journalists had many questions about the new law. The minister answered them at a press ____ on Monday morning.', 'conference', 'A formal meeting with journalists.')
  ],
  suitable: [
    p('The hall only holds thirty people. It is not ____ for a concert with three hundred guests.', 'suitable', 'Not right for the purpose because of its size.'),
    p('The film contains a lot of violence. It is not ____ for young children.', 'suitable', 'Not right for a particular audience.')
  ],
  'underlying meaning': [
    p('On the surface, the poem describes a tree in winter. Its ____ is about growing old and losing friends.', 'underlying meaning', 'The real message beneath the surface description.'),
    p('My friend said that I could do what I wanted. From her tone, I understood that the ____ was that she was upset.', 'underlying meaning', 'The real message behind the words.')
  ],
  'informal language': [
    p('Words like "gonna" and "stuff" are common in chats with friends. Examiners expect you to avoid such ____ in a formal report.', 'informal language', 'Chatty words unsuitable for a formal report.'),
    p('A letter to a close cousin can include jokes, contractions and slang. This kind of ____ makes it sound friendly.', 'informal language', 'Jokes, contractions and slang in a personal letter.')
  ],
  'formal style': [
    p('When you apply for a job, avoid contractions and slang. Use a polite ____ with full sentences.', 'formal style', 'Polite, official way of writing for a job application.'),
    p('The article was written for a serious national newspaper. It used a ____, with careful vocabulary and no jokes.', 'formal style', 'Serious and careful way of writing.')
  ],
  'reporting verb': [
    p('Your summary uses the word said eight times. Try a more precise ____ such as admitted, claimed or explained.', 'reporting verb', 'Words like admitted and claimed report speech.'),
    p('Read the sentence: She warned us not to touch the wires. Here, warned is the ____ because it tells us what she said.', 'reporting verb', 'The verb that reports what someone said.')
  ],
  'direct object': [
    p('Look at the sentence: Amir sent a message. The subject is Amir, and the ____ is a message.', 'direct object', 'The noun receiving the action of "sent".'),
    p('Look at the sentence: I gave my sister a book. My sister is the person who receives it, and a book is the ____ of the verb gave.', 'direct object', 'The thing that is given.')
  ],
  clause: [
    p('Look at this sentence: I stayed at home because it was raining. The words because it was raining form a ____ with its own subject and verb.', 'clause', 'A group of words with a subject and verb.'),
    p('Our neighbour, who lives next door, is a doctor. The words who lives next door form a relative ____ that gives extra information.', 'clause', 'A relative structure with its own verb.')
  ],
  suggest: [
    p('We could not decide where to eat. Tom had an idea, so he said that he would ____ trying the new noodle bar near the station.', 'suggest', 'Putting forward an idea to the group.'),
    p('You want to improve your vocabulary quickly. In that case, I ____ that you read a short article every day.', 'suggest', 'Putting forward advice for someone to consider.')
  ],
  recommend: [
    p('The film got excellent reviews. Every critic I read would ____ it to anyone who enjoys science fiction.', 'recommend', 'Saying something is good and worth seeing.'),
    p('Staring at a screen for hours can hurt your eyes. Eye doctors ____ that you take a short break every twenty minutes.', 'recommend', 'Advising people to do something.')
  ],
  solution: [
    p('The library was always too noisy for studying. The ____ was to create a separate silent room upstairs.', 'solution', 'A way of dealing with the noise problem.'),
    p('Fake news is a serious problem, and there is no simple ____. Teaching students to check sources is one way to help.', 'solution', 'A way of dealing with a difficult problem.')
  ],
  introduction: [
    p('Readers decide very quickly whether to continue reading. That is why your ____ should be short, clear and interesting.', 'introduction', 'The opening part that makes readers continue.'),
    p('The book’s ____ explains why the author decided to write it. The main chapters then tell the story of her life.', 'introduction', 'The first part, before the main chapters.')
  ],
  conclusion: [
    p('The writer presents both sides of the argument in the main paragraphs. She gives her own opinion in the ____ at the end.', 'conclusion', 'The final part after both sides are presented.'),
    p('The scientists studied the data for months. They finally came to the ____ that the new medicine was safe.', 'conclusion', 'A decision reached after studying evidence.')
  ],
  audience: [
    p('The magazine is read mainly by teenagers. Its writers use simple language and examples that suit this ____.', 'audience', 'The people who read the magazine.'),
    p('The speaker made eye contact, told jokes and asked questions. By the end, the whole ____ was clapping.', 'audience', 'The people listening to the speaker.')
  ],
  purpose: [
    p('Before you begin writing, decide whether you want to inform, persuade or entertain. Knowing your ____ will help you choose the right style.', 'purpose', 'Inform, persuade or entertain: the aim of writing.'),
    p('The ____ of the meeting was to plan the school trip. By the end, everyone knew what to do.', 'purpose', 'The aim of the meeting.')
  ],
  evaluate: [
    p('Not every website is reliable. You should ____ each source carefully by checking who wrote it and when.', 'evaluate', 'Judging how reliable sources are.'),
    p('The course has now finished. Students were asked to ____ the lessons, saying what worked well and what could be better.', 'evaluate', 'Judging quality: strengths and areas to improve.')
  ],
  relevant: [
    p('Your essay is about online safety. The paragraph about your holiday in Spain is not ____, so you should remove it.', 'relevant', 'A paragraph not connected with the topic.'),
    p('The interviewer was not interested in my hobbies. She wanted to hear about experience that was ____ to the job.', 'relevant', 'Experience connected with the job.')
  ],
  constructive: [
    p('Instead of just saying "This is bad", give ____ feedback. Explain what could be improved and how.', 'constructive', 'Feedback that helps improve, contrasted with just criticising.'),
    p('The meeting was very ____. Everyone listened, and the team agreed on three clear next steps.', 'constructive', 'A meeting that produced useful results.')
  ],
  research: [
    p('Before writing her article, Lina spent a week reading reports and interviewing experts. Her careful ____ made the article very convincing.', 'research', 'Careful study to find facts before writing.'),
    p('Scientists are carrying out ____ into how screen time affects sleep. Their early results are worrying.', 'research', 'Scientific study to discover new facts.')
  ]
});
