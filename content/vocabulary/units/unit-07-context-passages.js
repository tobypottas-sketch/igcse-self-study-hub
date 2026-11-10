// Unit 7 · Context · Mastery (type_in_passage) — authored short passages, WORDS 1–50 (complete). Same contract as unit-06-context-passages.js:
// two passages per word, each 2-3 natural sentences with exactly ONE gap (`____`); the passage never contains the target elsewhere, never starts
// with the gap, and makes the target the natural fit. `answer` is the exact surface form typed. `why` records what points to the word.
const p = (text, answer, why) => ({ text, answer, why });

export default Object.freeze({
  applicant: [
    p('The supermarket advertised one evening job for students. By the closing date, more than fifty people had written in, and the manager had to read every letter carefully to find the best ____.', 'applicant', 'Many people wrote in for one job; "the best ____" among letters.'),
    p('Before the college could offer any places, it had to check every form. Each ____ had to give two references and list the exams they had taken.', 'applicant', 'Forms, references and exams from each person asking for a place; "Each ____ had to give".')
  ],
  qualifications: [
    p('The advertisement said that no experience was needed, but it listed a degree in design as essential. Zara had worked in the field for years, yet she was not invited because she lacked the right ____.', 'qualifications', 'Degree listed as essential; she lacked "the right ____" despite experience.'),
    p('When the interviewer read Karim’s CV, she noticed his exam results, his diplomas and his courses in first aid. His ____ were impressive for someone who had only just left school.', 'qualifications', 'Exam results, diplomas and courses; "His ____ were impressive".')
  ],
  demonstrate: [
    p('The interviewer did not want to hear that Lena was a team player. She wanted her to ____ it with a real example, so Lena described how she had organised a charity match with ten classmates.', 'demonstrate', 'Real example instead of claims; "to ____ it with a real example".'),
    p('Many applicants say that they are hard-working, but few can prove it. The best way to ____ this quality is to describe a time when you worked hard and achieved a result.', 'demonstrate', 'Claim versus proof; "best way to ____ this quality".')
  ],
  summary: [
    p('Nobody had time to read the forty-page report. The director asked Rania for a one-page ____, so she wrote down the three most important findings and the actions needed.', 'summary', 'Forty pages versus one page of main findings; "a one-page ____".'),
    p('The examiner told the class not to retell every event in the novel. A good ____, she said, uses only a few sentences and includes the main ideas.', 'summary', 'Not every event, only a few sentences; "A good ____".')
  ],
  combine: [
    p('Jamal loves both music and maths, and he did not want to give up either. In the end he found a course that lets him ____ them, studying sound engineering at university.', 'combine', 'Loves both and found a course for both; "lets him ____ them".'),
    p('Employers look for people who have technical knowledge and also work well with others. Candidates who ____ both qualities have a much better chance of being offered the job.', 'combine', 'Two qualities together; "who ____ both qualities".')
  ],
  voluntary: [
    p('The school did not make students join the clean-up day. Because it was ____, only the students who really cared about the park gave up their Saturday morning.', 'voluntary', 'Not compulsory, only those who cared took part; "Because it was ____".'),
    p('Employers often notice when a CV includes ____ activities, such as helping at a charity shop. These show that the person is willing to give time without being asked or paid.', 'voluntary', 'Charity shop, without being asked or paid; "includes ____ activities".')
  ],
  frequent: [
    p('Ravi went to every interview with a long list of notes, and he checked them again and again. His ____ practice helped him to remember the answers, but the panel wanted him to speak naturally.', 'frequent', 'Practised again and again; "His ____ practice".'),
    p('The manager complained about the ____ delays on the early train. Almost every morning that month, passengers had waited for more than twenty minutes.', 'frequent', 'Almost every morning; "the ____ delays".')
  ],
  overview: [
    p('The new staff were nervous about starting work in such a large company. The manager helped by giving an ____ of how the departments fit together before explaining any of the details.', 'overview', 'Departments fit together before the details; "giving an ____ of".'),
    p('Instead of reading every page of the guide, Nadia looked at the contents list and the introduction. This gave her a quick ____ of what the book covered.', 'overview', 'Contents list and introduction; "a quick ____ of what the book covered".')
  ],
  candidate: [
    p('The panel interviewed five people for the post of science technician. By the end of the day they all agreed that the second ____ had the best answers and the most relevant experience.', 'candidate', 'Five people interviewed, second one best; "the second ____".'),
    p('Before the exam began, the invigilator checked the name on every desk. Each ____ was reminded to switch off their phone and to read the instructions carefully.', 'candidate', 'Desk name, phone, instructions in an exam; "Each ____ was reminded".')
  ],
  interviewer: [
    p('Aisha was nervous when she walked into the room, but the ____ smiled and asked her an easy first question. This helped her to relax and give clear answers for the rest of the meeting.', 'interviewer', 'Smiled, easy first question; "the ____ smiled".'),
    p('A good ____ does not only listen to what a candidate says. She also watches how the person sits and speaks, because body language can show confidence or worry.', 'interviewer', 'Listens and watches the candidate; "A good ____".')
  ],
  interviewee: [
    p('The panel asked five questions in twenty minutes, and the young ____ answered each one calmly. She paused before she spoke and gave a short example every time.', 'interviewee', 'Panel asks, she answers calmly; "the young ____ answered".'),
    p('Many people believe that the interviewer must do all the talking, but that is not true. A strong ____ explains ideas clearly and also asks one or two sensible questions at the end.', 'interviewee', 'Contrast with the one who asks; "A strong ____ explains ideas".')
  ],
  referee: [
    p('The application form asked for the names of two people who knew Hamza well. He chose his old teacher as one ____ and his football coach as the other, because both had seen him work hard.', 'referee', 'Two people who knew him well; "one ____ and ... the other".'),
    p('Before she was offered the job, the manager telephoned Leila’s ____ to ask whether she was reliable and honest. The answer was very positive, and the offer came the next day.', 'referee', 'Telephoned to ask if she was reliable; "Leila’s ____".')
  ],
  reference: [
    p('Nobody at the company knew Kamal personally, so the manager asked him to provide a ____ from his last job. His old supervisor wrote that he was always on time and very good with customers.', 'reference', 'Nobody knew him; old supervisor wrote about him; "provide a ____".'),
    p('Teachers are often asked to write a ____ when a student applies for a university place. A strong one gives specific examples of the student’s work instead of using only general praise.', 'reference', 'Teachers write it for university applications; "write a ____".')
  ],
  proficiency: [
    p('The advertisement said that no experience was necessary, but it asked for strong ____ in English because the job involved talking to customers all day. Applicants had to take a short speaking test.', 'proficiency', 'Strong skill needed in English; speaking test; "strong ____ in English".'),
    p('Learning the basics of a language is only the first stage. To reach ____, you must practise speaking and writing until you can use it easily and accurately in different situations.', 'proficiency', 'Beyond the basics; use it easily and accurately; "To reach ____".')
  ],
  enthusiastic: [
    p('Employers know that skills can be taught, but a positive attitude is harder to change. They often prefer a(n) ____ person who is eager to learn over an experienced person who seems bored.', 'enthusiastic', 'Eager to learn versus bored; "a(n) ____ person".'),
    p('During the interview, Tomas leaned forward, spoke quickly and smiled whenever he mentioned the sports club. His ____ manner showed the panel that he genuinely wanted the job.', 'enthusiastic', 'Leaned forward, smiled, wanted the job; "His ____ manner".')
  ],
  availability: [
    p('The manager had six candidates to see and only two free days. She emailed each one and asked about their ____, then placed the interviews in the gaps in their timetables.', 'availability', 'Six candidates, two days, asked about free times; "asked about their ____".'),
    p('The job was in a café that opened early and closed late, so the owner wanted staff who could work flexible hours. Before offering anyone a contract, he asked each person about their ____ at weekends.', 'availability', 'Could work weekends; "asked ... about their ____ at weekends".')
  ],
  compromise: [
    p('The two managers wanted different people for the job, and neither would change their mind. At last, they agreed that the winner would be chosen after a second interview, which was a ____ that both could accept.', 'compromise', 'Neither would change; both accepted; "a ____ that both could accept".'),
    p('In a group discussion, you do not need to win every point. Sometimes the best answer is to suggest a ____ that takes a little from each person’s idea.', 'compromise', 'Take a little from each idea; "suggest a ____".')
  ],
  dominate: [
    p('In the group task, the assessors were not looking for the loudest person. They watched to see who could listen, who could include quiet students and who tried to ____ every discussion.', 'dominate', 'Not the loudest; negative behaviour of taking over; "tried to ____ every discussion".'),
    p('Only three companies sell most of the world’s trainers, and they ____ the market so strongly that small brands find it hard to compete. A new company needs a very different idea if it hopes to win customers.', 'dominate', 'Three companies, small brands cannot compete; "____ the market so strongly".')
  ],
  strategy: [
    p('Ravi was nervous about unexpected questions, so he developed a simple ____. He would pause for two seconds, repeat the question in his head and only then begin to speak.', 'strategy', 'Simple plan for unexpected questions; "developed a simple ____".'),
    p('The restaurant was losing customers, so the new owner changed the ____ completely. She lowered the prices, simplified the menu and advertised in the local school.', 'strategy', 'Changed approach to win customers; "changed the ____ completely".')
  ],
  flexible: [
    p('The manager explained that the work was unpredictable, and that she needed people who would not complain when the plan changed. She was looking for someone ____ enough to start early one day and finish late the next.', 'flexible', 'Plans change; start early, finish late; "____ enough".'),
    p('Many students look for a part-time job with ____ hours. This allows them to move their shifts around when exams or school trips make them busy.', 'flexible', 'Move shifts around for exams; "with ____ hours".')
  ],
  schedule: [
    p('The college interviewed fifteen applicants in a single day. Each person was given a ____ with a time, a room number and the name of the panel, so that the corridors never became crowded.', 'schedule', 'Time, room number, fifteen applicants; "given a ____".'),
    p('Zoe tried to join the football club, the school choir and the science society, but she soon realised that her ____ was too full. She had no time left for homework or sleep.', 'schedule', 'Too many activities, no time left; "her ____ was too full".')
  ],
  expectation: [
    p('Before the first day of work, the manager told Ayesha exactly what he hoped from her: to arrive early, to ask questions and to finish her tasks. Ayesha was glad to know the ____ so clearly.', 'expectation', 'Told exactly what he hoped from her; "know the ____ so clearly".'),
    p('When the exam results arrived, Marcus was delighted. His marks were much higher than his teacher’s ____, and she congratulated him in front of the class.', 'expectation', 'Higher than the teacher thought they would be; "his teacher’s ____".')
  ],
  impress: [
    p('Aisha was not the most experienced applicant. However, she had read about the company’s latest project, and her clear questions about it helped her to ____ the panel.', 'impress', 'Not the most experienced, but clear questions; "helped her to ____ the panel".'),
    p('Many young people try to ____ others by talking loudly or by using difficult words. Teachers and employers usually respect honesty and clear ideas more than a show of cleverness.', 'impress', 'Loud talk and difficult words; "try to ____ others".')
  ],
  respond: [
    p('The email from the company asked Jamal to confirm that he would attend the interview. He knew that it was polite to ____ quickly, so he replied before the end of the same day.', 'respond', 'Asked to confirm; replied the same day; "to ____ quickly".'),
    p('Interviewers sometimes ask unexpected questions to see how calmly a candidate can think. The best candidates do not panic. They take a breath and ____ in a clear, organised way.', 'respond', 'Unexpected questions, calm thinking; "and ____ in a clear, organised way".')
  ],
  relevant: [
    p('Laila had worked in a swimming pool, a bakery and a bookshop. For her application to become a teaching assistant, she chose to describe only her ____ experience, which was the afternoons she had spent helping at a nursery.', 'relevant', 'Many jobs, chose only the connected one; "only her ____ experience".'),
    p('The interviewer asked about teamwork, but Idris began to talk about his favourite football club. The panel listened politely, but his story was not ____ to the question.', 'relevant', 'Football club, not connected to teamwork; "not ____ to the question".')
  ],
  contribute: [
    p('In the group interview, the assessors were not only listening for good ideas. They were also checking whether each person could ____ without interrupting and could build on what others had said.', 'contribute', 'Checking each person, building on others; "could ____ without interrupting".'),
    p('The school asked parents to help pay for the new playground. Some parents were able to ____ money, while others gave a few hours of their time to paint the fence.', 'contribute', 'Some gave money, others gave time; "able to ____ money".')
  ],
  coherent: [
    p('The first candidate changed the subject three times in one answer and forgot the question. The second candidate gave a ____ reply that began with a reason and ended with an example, and the panel found it easy to follow.', 'coherent', 'Changed subject versus beginning-to-end reply; "a ____ reply".'),
    p('Teachers often advise students to plan before they write. A short plan helps you to produce a ____ essay in which every paragraph links to the one before it.', 'coherent', 'Short plan, every paragraph links; "a ____ essay".')
  ],
  implication: [
    p('The manager did not say that the work was poor. She only said that she had expected more, but the ____ was clear to everyone in the room: the team would have to do better.', 'implication', 'Did not say directly; message clear anyway; "the ____ was clear".'),
    p('Before the school decided to start lessons at eight o’clock, a committee studied the ____ for students who live far away. They found that many would have to leave home before sunrise.', 'implication', 'Committee studied possible effects; "the ____ for students".')
  ],
  register: [
    p('Zara used slang with her friends all the time, but in the interview she spoke more carefully, with full sentences and polite phrases. The panel noticed that she could change her ____ to suit the situation.', 'register', 'Slang with friends, careful in the interview; "change her ____".'),
    p('An email to a close friend can be short and relaxed. An email to a company needs a more formal ____, with a proper greeting and full sentences.', 'register', 'Friend versus company; "a more formal ____".')
  ],
  format: [
    p('Before the speaking test, the teacher explained how it would work: a short warm-up, a talk on one topic and a discussion with the examiner. Knowing the ____ made the students feel less nervous.', 'format', 'Teacher explained how the test would work; "Knowing the ____".'),
    p('The company asked all applicants to follow the same ____ for their CVs, with the same headings in the same order. This made it easy to compare the details quickly.', 'format', 'Same headings, same order; "follow the same ____".')
  ],
  membership: [
    p('The gym offered a special price to young people. Ahmed paid a small fee and received a card that proved his ____, so that he could use the swimming pool and the sports hall whenever he liked.', 'membership', 'Paid a fee, received a card; "proved his ____".'),
    p('Employers like to see activities on a CV that show teamwork. Your ____ of a school team or a youth club can be good evidence that you work well with others.', 'membership', 'Evidence of teamwork on a CV; "Your ____ of a school team".')
  ],
  certificate: [
    p('After six weeks of evening classes, the group sat a short practical test. Everyone who passed received a ____ signed by the instructor, which they could show to future employers.', 'certificate', 'Test passed, signed paper to show employers; "received a ____".'),
    p('The advertisement said that applicants must hold a valid driving licence and a first-aid ____. Without these documents, even the most experienced person could not be considered.', 'certificate', 'Valid documents required; "a first-aid ____".')
  ],
  qualification: [
    p('The advertisement for the hotel receptionist did not ask for any exam results. The manager said that the most important ____ was a friendly manner, because guests notice the first person they meet.', 'qualification', 'No exams needed; friendly manner most important; "the most important ____".'),
    p('To work as a lifeguard, you must be a strong swimmer. For the manager, this was the first ____ that he looked for, and no certificate could replace it.', 'qualification', 'Strong swimmer first; "the first ____ that he looked for".')
  ],
  experience: [
    p('Karim had no certificates in cooking, but he had spent three summers working in his uncle’s café. The chef decided that this practical ____ was more valuable than a course certificate.', 'experience', 'No certificates, three summers in a café; "practical ____".'),
    p('Many school leavers feel that employers ask for a lot of ____ from people who have never had a job. Voluntary work and holiday jobs can help young people to gain it.', 'experience', 'Never had a job; voluntary work helps to gain it; "a lot of ____".')
  ],
  confidence: [
    p('Nadia used to look at the floor when she spoke to adults. After practising interview questions every evening for two weeks, she walked into the room and looked the panel in the eye with new ____.', 'confidence', 'Looked at the floor before, practised, now looks in the eye; "with new ____".'),
    p('Some candidates have excellent skills but do not show them because they lack ____. Smiling, sitting up straight and taking a deep breath before speaking can help.', 'confidence', 'Excellent skills but do not show them; breath and posture; "lack ____".')
  ],
  anxious: [
    p('Priya had prepared for the interview for weeks, but as she walked into the building her hands began to shake and her mouth felt dry. She was so ____ that she could hardly remember her own name.', 'anxious', 'Hands shaking, mouth dry; "so ____ that".'),
    p('The teacher noticed that several students were ____ about the speaking exam. She reminded them that nobody expected a perfect performance and that the examiner would be friendly.', 'anxious', 'Teacher reassures students; "were ____ about the speaking exam".')
  ],
  expertise: [
    p('The school wanted to start a robotics club, but nobody on the staff knew how to build a robot. They invited an engineer with a lot of ____ to show the students what to do.', 'expertise', 'Nobody knew how, invited an engineer; "a lot of ____".'),
    p('Experience and ____ are not the same thing. A person can work in an office for ten years, but a real specialist has studied one subject deeply and can solve problems that others cannot.', 'expertise', 'Experience contrasted with deep knowledge; "Experience and ____".')
  ],
  technique: [
    p('Before going into the interview room, Tariq used a simple breathing ____ that his coach had taught him: he breathed in for four seconds and out for six. By the time he sat down, he felt much calmer.', 'technique', 'Breathing in and out for counted seconds; "a simple breathing ____".'),
    p('Good writers do not simply start writing. Many of them use a planning ____ such as writing the main idea of each paragraph on a small card before they begin the essay.', 'technique', 'Cards for each paragraph before the essay; "a planning ____".')
  ],
  evaluate: [
    p('At the end of the practice interview, Sara’s teacher asked her to ____ her own performance. Sara listed three things she had done well and two things that she wanted to improve.', 'evaluate', 'Listed what went well and what to improve; "to ____ her own performance".'),
    p('Each candidate was given a score for communication, teamwork and knowledge. The panel used the same sheet to ____ everyone, so that the final decision would be fair.', 'evaluate', 'Same score sheet for everyone; "to ____ everyone".')
  ],
  organise: [
    p('The students had plenty of good ideas for their group presentation, but their first practice was confusing. Before the next rehearsal, they decided to ____ their ideas into a beginning, a middle and an end.', 'organise', 'Good ideas but confusing; beginning, middle, end; "to ____ their ideas".'),
    p('The head teacher asked a group of Year 11 students to ____ a careers evening. They booked the hall, invited local employers and prepared a programme for the visitors.', 'organise', 'Booked, invited, prepared a programme; "to ____ a careers evening".')
  ],
  distribute: [
    p('The school was holding a careers evening, and hundreds of programmes had been printed. Two students stood at the door to ____ them to every visitor who arrived.', 'distribute', 'Programmes handed to every visitor; "to ____ them".'),
    p('The new manager was careful to be fair. She did not give all the difficult tasks to one person but decided to ____ them equally among the whole team.', 'distribute', 'Fair, equally among the team; "to ____ them equally".')
  ],
  allocate: [
    p('The charity had only a small budget for the event. The manager had to ____ the money carefully, so that enough was left for the food, the hall and the posters.', 'allocate', 'Small budget, enough left for each need; "had to ____ the money carefully".'),
    p('The head teacher knew that students needed practice with interviews. She agreed to ____ one lesson a week for mock interviews with local business people.', 'allocate', 'Agreed one lesson a week for mock interviews; "agreed to ____ one lesson".')
  ],
  responsible: [
    p('The summer camp needed a young person to take charge of the afternoon activities. The organiser did not choose the loudest applicant. She chose Amir, because he seemed calm, sensible and ____.', 'responsible', 'Calm, sensible, chosen to take charge; "calm, sensible and ____".'),
    p('In the interview, Mei explained that she had been ____ for training the new volunteers in her last job. The manager could see that she was used to taking duties seriously.', 'responsible', 'Duty to train others; "had been ____ for training".')
  ],
  editor: [
    p('Mei wrote an article about her visit to the local factory. The ____ of the school magazine read it, corrected two spelling mistakes and asked her to add a short introduction.', 'editor', 'Corrected spelling, asked for an introduction; "The ____ of the school magazine".'),
    p('Few people see the work that happens before an article is printed. A careful ____ checks the facts, removes repeated ideas and makes sure that the sentences are clear.', 'editor', 'Checks facts, removes repetition; "A careful ____ checks".')
  ],
  proofread: [
    p('Hasan wrote his cover letter in one evening and sent it the next morning without looking at it again. The employer noticed three spelling mistakes, and Hasan wished he had taken ten minutes to ____ the letter.', 'proofread', 'Spelling mistakes noticed, wished he had checked; "to ____ the letter".'),
    p('A professional writer never sends a final copy before checking it. She reads the text slowly, one line at a time, to ____ it for spelling, grammar and punctuation.', 'proofread', 'Reads slowly line by line for errors; "to ____ it".')
  ],
  layout: [
    p('The two CVs contained almost exactly the same information. The first, however, was crowded and confusing, while the second had a clear ____ with headings and white space, so the manager read it first.', 'layout', 'Same information, one tidy and one crowded; "a clear ____ with headings".'),
    p('Before printing the school poster, the students tried three different designs. They finally chose the one with a bold title at the top, a large picture in the middle and a simple ____ that made the date easy to find.', 'layout', 'Title at top, picture in middle; "a simple ____".')
  ],
  visual: [
    p('The first speaker read from a long page of notes and did not look up. The second speaker used a simple ____ aid: a large photograph that showed exactly what she was describing. The audience remembered her talk much better.', 'visual', 'Photograph used to show what she described; "a simple ____ aid".'),
    p('Some students learn better when they see information in pictures and charts. These ____ learners often use colours and diagrams to help them revise.', 'visual', 'Pictures, charts, colours, diagrams; "These ____ learners".')
  ],
  criteria: [
    p('Nobody on the panel wanted to make an unfair decision. They agreed on four clear ____ before they read any applications: relevant experience, communication skills, teamwork and punctuality.', 'criteria', 'Four listed standards agreed in advance; "four clear ____".'),
    p('The teacher gave the students a sheet showing the ____ for the speaking test. It listed clarity, accuracy, range of vocabulary and confidence, so that everyone knew what the examiner was looking for.', 'criteria', 'Sheet listing clarity, accuracy, range; "the ____ for the speaking test".')
  ],
  accurate: [
    p('The newspaper printed a correction the next day. The first report had said that two hundred people attended the fair, but the real number was only eighty. The editor reminded the writers that every article must be ____.', 'accurate', 'Wrong number; correction; "must be ____".'),
    p('The examiner told the class that a good description of a graph does not have to be long. It must be ____, with correct figures and no guesses.', 'accurate', 'Correct figures, no guesses; "It must be ____".')
  ],
  punctuation: [
    p('The sentence “Let’s eat, Grandma” and the sentence “Let’s eat Grandma” look almost the same, but the ____ changes the meaning completely. A small comma can make a very big difference.', 'punctuation', 'Comma changes meaning; "the ____ changes the meaning".'),
    p('Before she sent the application, Nour read it through and corrected the spelling. Then she checked the full stops and commas, because poor ____ can make a letter seem careless.', 'punctuation', 'Full stops and commas after spelling; "poor ____ can make a letter".')
  ]
});
