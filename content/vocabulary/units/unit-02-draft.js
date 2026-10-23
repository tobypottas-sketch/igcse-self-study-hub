// UNIT 2 – DIGITAL LIFE: authoring skeleton. Source: 0511 key words UNIT 2 (50 targets, coursebook order).
// Every entry is a bare term + part of speech; meanings, sentences and wrong options are still to be authored and reviewed.
// Check: node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-02-draft.js
// Rename to unit-02.js only when ready to publish (the release tooling ignores this draft name).
//
// "afford" is also a Unit 1 target. It has its own id here (idKey 'afford_2' -> vocab_afford_2) so publishing Unit 2 can never overwrite
// Unit 1's vocab_afford row. Its spelling list is the shared lexical one for "afford", aliased below.
import { buildCuratedUnit } from '../build-unit.js';
import { LEXICAL_SPELLING_ERRORS } from '../lexical-spelling-errors.js';

const UNIT_NUMBER = 2;
const status = 'draft';

const e = (term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence, paraphraseSource, paraphraseSentence, productionSource, productionSentence, extras = {}) => ({
  term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence,
  paraphrase:{ source:paraphraseSource, sentence:paraphraseSentence },
  production:{ source:productionSource, sentence:productionSentence },
  ...extras
});
// Words not yet authored are bare: eb(term, partOfSpeech).
const eb = (term, partOfSpeech) => ({ term, partOfSpeech });

const entries = [
  e('entertainment', 'noun',
    'things such as films, music and games that people watch, play or listen to for enjoyment',
    ['amusement', 'things people watch for fun'],
    ['serious news reports', 'school lessons', 'private information'],
    'Online platforms offer a huge range of entertainment for teenagers.',
    'amusement', 'Online platforms offer a huge range of amusement for teenagers.',
    'amusement', 'The festival provides free amusement for families all weekend.',
    {
      masteryContexts:[
        { text:'The hotel offers live music and other entertainment every evening.', meaning:'shows, music or activities that people enjoy' },
        { text:'Her grandparents saw the cinema as the main entertainment in the town.', meaning:'something people do for enjoyment' }
      ],
      situationDistractors:[
        'The family spent the evening reading the news and checking the weather forecast.',
        'A reporter interviewed the mayor about the new road.',
        'Students stayed in the library to finish their history essays.'
      ],
      retrievalContexts:[
        { id:'1', text:'We went to the cinema for an evening of entertainment.', target:'entertainment', grammarPattern:'' },
        { id:'2', text:'Films, music and video games are all popular types of entertainment among teenagers.', target:'entertainment', grammarPattern:'' },
        { id:'3', text:'The hotel provides live entertainment, such as bands and magicians, every Saturday evening.', target:'entertainment', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'entertainment', wrong:['exercise', 'shopping', 'study'] },
        { id:'2', answer:'entertainment', wrong:['exercise', 'transport', 'shopping'] },
        { id:'3', answer:'entertainment', wrong:['catering', 'accommodation', 'transport'] }
      ]
    }),
  e('access', 'noun',
    'the right or ability to use something or to reach a place',
    ['the ability or right to use', 'permission to use'],
    ['permission to leave', 'a payment for using something', 'a report on something'],
    'Many students do not have access to a computer at home.',
    'the ability or right to use', 'Many students do not have the ability or right to use a computer at home.',
    'the ability or right to use', 'Library cards give pupils the ability or right to use thousands of books.',
    {
      masteryContexts:[
        { text:'Only staff members have access to the server room.', meaning:'permission or the right to enter or use something' },
        { text:'Wheelchair users need easy access to every classroom.', meaning:'a way of reaching or entering a place' }
      ],
      situationDistractors:[
        'The shop closed early because of the storm.',
        'A technician repaired the broken router yesterday.',
        'The library moved to a bigger building.'
      ],
      retrievalContexts:[
        { id:'1', text:'Many families still lack reliable access to the internet at home.', target:'access', grammarPattern:'' },
        { id:'2', text:'Students need a password to gain access to the online library.', target:'access', grammarPattern:'' },
        { id:'3', text:'Disabled visitors have easy access to all floors of the museum.', target:'access', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'access', wrong:['speed', 'equipment', 'training'] },
        { id:'2', answer:'access', wrong:['service', 'speed', 'equipment'] },
        { id:'3', answer:'access', wrong:['service', 'equipment', 'speed'] }
      ]
    }),
  e('device', 'noun',
    'a small machine or piece of equipment made for a particular purpose, such as a phone or tablet',
    ['gadget', 'electronic tool'],
    ['a rule that controls behaviour', 'a place where machines are made', 'a person who repairs machines'],
    'Most students bring at least one device to school.',
    'gadget', 'Most students bring at least one gadget to school.',
    'gadget', 'He saved up for a clever new gadget for the kitchen.',
    {
      masteryContexts:[
        { text:'You can charge this device in two hours.', meaning:'a small electronic machine' },
        { text:'A simple device on the door warns you when it is open.', meaning:'a tool made for a specific purpose' }
      ],
      situationDistractors:[
        'A mechanic spent the afternoon repairing the engine of the school bus.',
        'The teacher handed out printed worksheets to every student.',
        'A visitor asked how to find the science laboratory.'
      ],
      retrievalContexts:[
        { id:'1', text:'I forgot to charge my device before the long journey.', target:'device', grammarPattern:'' },
        { id:'2', text:'Teachers asked everyone to switch off their device during the exam.', target:'device', grammarPattern:'' },
        { id:'3', text:'This small device records the temperature of the room every hour.', target:'device', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'device', wrong:['passport', 'sandwich', 'umbrella'] },
        { id:'2', answer:'device', wrong:['uniform', 'dictionary', 'jacket'] },
        { id:'3', answer:'device', wrong:['season', 'window', 'neighbour'] }
      ]
    }),
  e('digital', 'adjective',
    'using electronic technology, especially computers and the internet, to store or send information',
    ['electronic', 'computer-based'],
    ['made by hand', 'printed on paper', 'very old-fashioned'],
    'Many schools now use digital textbooks instead of printed ones.',
    'electronic', 'Many schools now use electronic textbooks instead of printed ones.',
    'computer-based', 'The college runs computer-based tests in the autumn term.',
    {
      masteryContexts:[
        { text:'She keeps a digital copy of every important document.', meaning:'stored electronically on a computer or phone' },
        { text:'Digital cameras have almost replaced film cameras.', meaning:'using electronic technology' }
      ],
      situationDistractors:[
        'The teacher wrote the homework on the whiteboard with a marker.',
        'Students handed in handwritten essays on lined paper.',
        'The museum displayed paintings from the nineteenth century.'
      ],
      retrievalContexts:[
        { id:'1', text:'Many people now read the news on a digital screen rather than in a newspaper.', target:'digital', grammarPattern:'' },
        { id:'2', text:'Teachers can share digital resources with the whole class in seconds.', target:'digital', grammarPattern:'' },
        { id:'3', text:'We live in a digital age where information travels instantly.', target:'digital', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'digital', wrong:['printed', 'traditional', 'handwritten'] },
        { id:'2', answer:'digital', wrong:['printed', 'physical', 'handwritten'] },
        { id:'3', answer:'digital', wrong:['printed', 'physical', 'traditional'] }
      ]
    }),
  e('streaming', 'noun',
    'playing video or music over the internet as it arrives, without downloading it first',
    ['online viewing', 'playing over the internet'],
    ['copying files onto a memory stick', 'buying DVDs from a shop', 'sending messages to friends'],
    'Streaming has changed the way teenagers watch films and television.',
    'online viewing', 'Online viewing has changed the way teenagers watch films and television.',
    'online viewing', 'Online viewing is growing faster than cinema attendance.',
    {
      masteryContexts:[
        { text:'Music streaming means you never need to buy a CD.', meaning:'playing music over the internet without downloading it' },
        { text:'Slow internet makes streaming difficult in rural areas.', meaning:'watching or listening online as the data arrives' }
      ],
      situationDistractors:[
        'Fans queued outside the shop to buy the new album on a disc.',
        'She downloaded the film and saved it to her laptop before the flight.',
        'The family recorded the football match on a video recorder.'
      ],
      retrievalContexts:[
        { id:'1', text:'Instead of saving films to a device first, many people prefer streaming, which plays them as they arrive.', target:'streaming', grammarPattern:'' },
        { id:'2', text:'A constant connection is essential for streaming, because the video plays while it arrives.', target:'streaming', grammarPattern:'' },
        { id:'3', text:'With music streaming, listeners can play any song instantly without owning a copy.', target:'streaming', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'streaming', wrong:['recording', 'television', 'copying'] },
        { id:'2', answer:'streaming', wrong:['recording', 'television', 'printing'] },
        { id:'3', answer:'streaming', wrong:['downloading', 'recording', 'television'] }
      ]
    }),
  e('relevant', 'adjective',
    'connected to the subject being discussed, and so useful or important for it',
    ['connected', 'related'],
    ['difficult to understand', 'extremely popular', 'very recent'],
    'Only include facts that are relevant to the question.',
    'connected', 'Only include facts that are connected to the question.',
    'related', 'Choose a related example to support your point.',
    {
      masteryContexts:[
        { text:'Her experience is relevant to the job.', meaning:'connected to the matter and useful for it' },
        { text:'Please delete any information that is not relevant.', meaning:'connected to the topic being discussed' }
      ],
      situationDistractors:[
        'The writer added a funny story that had nothing to do with the topic.',
        'The student copied a paragraph without reading it.',
        'The article was too long for the class to finish.'
      ],
      retrievalContexts:[
        { id:'1', text:'Only choose relevant examples, meaning ones that connect directly to the question.', target:'relevant', grammarPattern:'' },
        { id:'2', text:'The teacher highlighted the most relevant details in the article, the ones that answered the essay question.', target:'relevant', grammarPattern:'' },
        { id:'3', text:'Is this relevant advice for my situation, or is it about a completely different problem?', target:'relevant', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'relevant', wrong:['general', 'additional', 'recent'] },
        { id:'2', answer:'relevant', wrong:['general', 'recent', 'additional'] },
        { id:'3', answer:'relevant', wrong:['recent', 'familiar', 'additional'] }
      ]
    }),
  e('educator', 'noun',
    'a person whose job is to teach or train others',
    ['teacher', 'person who teaches'],
    ['a student who studies at home', 'a person who owns a school', 'a person who inspects buildings'],
    'The school hired an experienced educator to lead the new course.',
    'teacher', 'The school hired an experienced teacher to lead the new course.',
    'teacher', 'The retired teacher still runs a weekend reading club.',
    {
      masteryContexts:[
        { text:'As an educator, she believes every child can succeed.', meaning:'a person who teaches' },
        { text:'Educators across the country are discussing the new exam.', meaning:'teachers and others who train students' }
      ],
      situationDistractors:[
        'A student asked the librarian where to find a dictionary.',
        'A parent collected her son from the school gates.',
        'A visitor from the council inspected the school kitchen.'
      ],
      retrievalContexts:[
        { id:'1', text:'The school is looking for an experienced educator to lead the course.', target:'educator', grammarPattern:'' },
        { id:'2', text:'Each educator marks hundreds of essays every term.', target:'educator', grammarPattern:'' },
        { id:'3', text:'My aunt has worked as an educator in a primary school for thirty years.', target:'educator', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'educator', wrong:['engineer', 'architect', 'accountant'] },
        { id:'2', answer:'educator', wrong:['engineer', 'dentist', 'farmer'] },
        { id:'3', answer:'educator', wrong:['engineer', 'architect', 'accountant'] }
      ]
    }),
  e('afford', 'verb',
    'to have enough money to buy or pay for something',
    ['have enough money for', 'be able to pay for'],
    ['borrow from a friend', 'refuse to pay for', 'choose to buy'],
    'Not every family can afford a new laptop for each child.',
    'pay for', 'Not every family can pay for a new laptop for each child.',
    'pay for', 'The club cannot pay for a new projector this year.',
    {
      idKey:'afford_2',
      teacherNote:'Unit 2 item (afford_2), separate from Unit 1 afford; shares only the lexical spelling list.',
      masteryContexts:[
        { text:'Many students cannot afford the latest smartphone.', meaning:'do not have enough money to buy' },
        { text:'We can afford a short holiday, but not a long one.', meaning:'have enough money for' }
      ],
      situationDistractors:[
        'The family borrowed a laptop from a neighbour for a week.',
        'The shop refused to give a refund on the broken tablet.',
        'The shop assistant recommended a cheaper tablet to the customer.'
      ],
      retrievalContexts:[
        { id:'1', text:'Her parents earn very little, so they cannot afford a new laptop.', target:'afford', grammarPattern:'' },
        { id:'2', text:'Prices have risen so much that many people can no longer afford to travel by train.', target:'afford', grammarPattern:'' },
        { id:'3', text:'If we save for a year, we might afford a small holiday abroad.', target:'afford', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'afford', wrong:['describe', 'translate', 'advertise'] },
        { id:'2', answer:'afford', wrong:['pretend', 'threaten', 'forget'] },
        { id:'3', answer:'afford', wrong:['sketch', 'photograph', 'advertise'] }
      ]
    }),
  e('essential', 'adjective',
    'absolutely necessary; extremely important',
    ['absolutely necessary', 'vital'],
    ['available to everyone', 'expensive and rare', 'recently invented'],
    'A reliable internet connection is essential for online learning.',
    'vital', 'A reliable internet connection is vital for online learning.',
    'vital', 'Clean water is vital for every living thing.',
    {
      masteryContexts:[
        { text:'Sleep is essential for healthy growth.', meaning:'absolutely necessary' },
        { text:'Take only the essential items when travelling light.', meaning:'the most important things you cannot do without' }
      ],
      situationDistractors:[
        'Students could choose between several optional clubs after school.',
        'A teacher said the extra homework was a nice idea but not required.',
        'The library offered a free newsletter to anyone who wanted one.'
      ],
      retrievalContexts:[
        { id:'1', text:'A passport is not merely useful for foreign travel; it is essential.', target:'essential', grammarPattern:'' },
        { id:'2', text:'Students who skip the safety briefing may not enter the laboratory, because the briefing is essential.', target:'essential', grammarPattern:'' },
        { id:'3', text:'Because losing the files would stop the project completely, backing them up is essential.', target:'essential', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'essential', wrong:['optional', 'convenient', 'popular'] },
        { id:'2', answer:'essential', wrong:['optional', 'convenient', 'popular'] },
        { id:'3', answer:'essential', wrong:['optional', 'unnecessary', 'decorative'] }
      ]
    }),
  e('current affairs', 'noun',
    'important news about politics, society and world events that are happening now',
    ['world news', 'recent events in the news'],
    ['past events from history', 'private matters at home', 'stories from fiction'],
    'The teacher asks students to read about current affairs every morning.',
    'world news', 'The teacher asks students to read about world news every morning.',
    'world news', 'She follows world news on the radio.',
    {
      masteryContexts:[
        { text:'He listens to a podcast on current affairs during his walk.', meaning:'news about politics and world events' },
        { text:'Our class discussion on current affairs became very lively.', meaning:'events in the news now' }
      ],
      situationDistractors:[
        'The history teacher described a battle from the sixteenth century.',
        'A novelist read a chapter from her latest story.',
        'The student wrote a diary entry about her weekend at home.'
      ],
      retrievalContexts:[
        { id:'1', text:'To understand politics and world events, you must keep up with current affairs.', target:'current affairs', grammarPattern:'' },
        { id:'2', text:'Newspapers cover current affairs such as elections and international conflicts.', target:'current affairs', grammarPattern:'' },
        { id:'3', text:'A weekly quiz on current affairs tests what students know about the week’s headlines.', target:'current affairs', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'current affairs', wrong:['historical events', 'fictional stories', 'personal diaries'] },
        { id:'2', answer:'current affairs', wrong:['travel advice', 'cooking tips', 'film plots'] },
        { id:'3', answer:'current affairs', wrong:['weather vocabulary', 'recipe ideas', 'book characters'] }
      ]
    }),
  e('apparently', 'adverb',
    'according to what seems to be true or what people say, although it has not been confirmed',
    ['seemingly', 'as it appears'],
    ['obviously, with no doubt at all', 'after a long time', 'in a very careful way'],
    'The concert has apparently been cancelled because of the weather.',
    'seemingly', 'The concert has seemingly been cancelled because of the weather.',
    'seemingly', 'The seemingly simple task took three hours.',
    {
      masteryContexts:[
        { text:'The singer has apparently left the band, but nobody has confirmed it.', meaning:'according to what people say, not confirmed' },
        { text:'The apparently empty room was full of sleeping cats.', meaning:'seeming to be true from the outside' }
      ],
      situationDistractors:[
        'The reporter checked three official records and confirmed the date.',
        'A scientist proved the idea with a clear experiment.',
        'A witness described exactly what she had seen with her own eyes.'
      ],
      retrievalContexts:[
        { id:'1', text:'The match has apparently been postponed, though the club has not confirmed this yet.', target:'apparently', grammarPattern:'' },
        { id:'2', text:'I have not seen the results myself, but apparently the whole class passed.', target:'apparently', grammarPattern:'' },
        { id:'3', text:'Nobody has checked the story, but apparently the old bridge collapsed overnight.', target:'apparently', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'apparently', wrong:['definitely', 'officially', 'certainly'] },
        { id:'2', answer:'apparently', wrong:['personally', 'proudly', 'secretly'] },
        { id:'3', answer:'apparently', wrong:['certainly', 'officially', 'definitely'] }
      ]
    }),
  e('supposedly', 'adverb',
    'according to what many people believe or say, although it may not be true',
    ['allegedly', 'reportedly'],
    ['definitely and proven', 'on purpose', 'as quickly as possible'],
    'The restaurant is supposedly the best in town, but I was disappointed.',
    'reportedly', 'The restaurant is reportedly the best in town, but I was disappointed.',
    'allegedly', 'The man allegedly broke the window, but he denies it.',
    {
      masteryContexts:[
        { text:'The film is supposedly based on a true story, but many details are invented.', meaning:'said to be true, but doubted' },
        { text:'He is supposedly a great cook, though I have never tasted his food.', meaning:'according to what people claim' }
      ],
      situationDistractors:[
        'The inspector tested the machine and proved that it worked perfectly.',
        'She saw the accident with her own eyes and described it to the police.',
        'The brochure listed the exact opening times of the museum.'
      ],
      retrievalContexts:[
        { id:'1', text:'The medicine is supposedly a cure for colds, although doctors say there is no evidence for this.', target:'supposedly', grammarPattern:'' },
        { id:'2', text:'The old house is supposedly haunted, although nobody has ever seen a ghost there.', target:'supposedly', grammarPattern:'' },
        { id:'3', text:'She was supposedly at home that night, but several neighbours say they did not see her.', target:'supposedly', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'supposedly', wrong:['clearly', 'certainly', 'definitely'] },
        { id:'2', answer:'supposedly', wrong:['obviously', 'undoubtedly', 'certainly'] },
        { id:'3', answer:'supposedly', wrong:['definitely', 'clearly', 'undoubtedly'] }
      ]
    }),
  e('celebrity', 'noun',
    'a famous person, especially in entertainment or sport',
    ['famous person', 'star'],
    ['a public party', 'a person who works behind the scenes', 'a prize for winning'],
    'Many young people dream of becoming a celebrity.',
    'star', 'Many young people dream of becoming a star.',
    'famous person', 'A famous person visited the school and signed autographs.',
    {
      masteryContexts:[
        { text:'The celebrity was surrounded by photographers outside the hotel.', meaning:'a famous person' },
        { text:'Several celebrities supported the charity campaign.', meaning:'well-known people from entertainment or sport' }
      ],
      situationDistractors:[
        'A baker who is well liked by everyone on her street opened a second shop.',
        'An engineer won a national award that few people ever heard about.',
        'The headteacher gave a speech to the parents in the school hall.'
      ],
      retrievalContexts:[
        { id:'1', text:'Fans waited for hours outside the theatre to see the celebrity arrive.', target:'celebrity', grammarPattern:'' },
        { id:'2', text:'Every magazine in the shop had a photograph of the same celebrity on the cover.', target:'celebrity', grammarPattern:'' },
        { id:'3', text:'The charity hopes a celebrity will promote the campaign to millions of followers.', target:'celebrity', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'celebrity', wrong:['neighbour', 'accountant', 'plumber'] },
        { id:'2', answer:'celebrity', wrong:['neighbour', 'plumber', 'librarian'] },
        { id:'3', answer:'celebrity', wrong:['librarian', 'neighbour', 'dentist'] }
      ]
    }),
  e('informed', 'adjective',
    'having or showing knowledge about a subject or situation',
    ['knowledgeable', 'aware'],
    ['told off for bad behaviour', 'given a prize', 'confused and worried'],
    'Voters need to be informed before they make their decision.',
    'knowledgeable', 'Voters need to be knowledgeable before they make their decision.',
    'knowledgeable', 'A knowledgeable guide explained the history of the castle.',
    {
      masteryContexts:[
        { text:'She made an informed decision after reading all the reports.', meaning:'based on knowledge and the facts' },
        { text:'Keep your parents informed about where you are.', meaning:'told about what is happening' }
      ],
      situationDistractors:[
        'The student guessed the answer without reading the question.',
        'He chose a phone because it was the cheapest one in the shop.',
        'The committee voted quickly without reading the report.'
      ],
      retrievalContexts:[
        { id:'1', text:'Before choosing a university, make an informed decision based on all the facts.', target:'informed', grammarPattern:'' },
        { id:'2', text:'Only an informed voter understands the real effects of each policy.', target:'informed', grammarPattern:'' },
        { id:'3', text:'The school sends weekly emails specifically to keep parents informed about every timetable change.', target:'informed', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'informed', wrong:['emotional', 'sudden', 'hasty'] },
        { id:'2', answer:'informed', wrong:['angry', 'anxious', 'eager'] },
        { id:'3', answer:'informed', wrong:['unaware', 'uncertain', 'confused'] }
      ]
    }),
  e('admit', 'verb',
    'to agree, often unwillingly, that something is true',
    ['confess', 'accept that it is true'],
    ['deny that it happened', 'forget completely', 'announce proudly'],
    'He finally admitted that he had copied the answers.',
    'confessed', 'He finally confessed that he had copied the answers.',
    'confessed', 'She confessed that she had broken the window.',
    {
      masteryContexts:[
        { text:'I admit that I made a mistake.', meaning:'agree that something is true, often unwillingly' },
        { text:'The company admitted responsibility for the delay.', meaning:'accepted that it was at fault' }
      ],
      situationDistractors:[
        'He insisted that he had never been near the shop.',
        'She refused to say who had taken the money.',
        'The boy explained that the dog had eaten his homework.'
      ],
      retrievalContexts:[
        { id:'1', text:'After hours of questioning, the suspect finally had to admit that he had stolen the car.', target:'admit', grammarPattern:'' },
        { id:'2', text:'I must admit that I did not read the whole book before the discussion.', target:'admit', grammarPattern:'' },
        { id:'3', text:'At the meeting, the manager had to admit that the team had made serious mistakes with the schedule.', target:'admit', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'admit', wrong:['imagine', 'predict', 'notice'] },
        { id:'2', answer:'admit', wrong:['pretend', 'deny', 'hope'] },
        { id:'3', answer:'admit', wrong:['predict', 'promise', 'request'] }
      ]
    }),
  e('communicate', 'verb',
    'to share information, ideas or feelings with other people',
    ['share information', 'exchange ideas'],
    ['hide information from others', 'travel to another country', 'argue loudly'],
    'Teenagers now communicate with their friends mostly through messaging apps.',
    'stay in touch', 'Teenagers now stay in touch with their friends mostly through messaging apps.',
    'stay in touch', 'We stay in touch with our cousins abroad by video call.',
    {
      masteryContexts:[
        { text:'Good leaders communicate their plans clearly.', meaning:'share information or ideas so others understand' },
        { text:'Dolphins communicate using clicks and whistles.', meaning:'exchange information using signals' }
      ],
      situationDistractors:[
        'She kept her plans secret from the rest of the team.',
        'The two friends sat in silence on the bus, each reading a book.',
        'He travelled to another city to start a new job.'
      ],
      retrievalContexts:[
        { id:'1', text:'Pilots use a special code to communicate clearly with air traffic control, so that every message is understood.', target:'communicate', grammarPattern:'' },
        { id:'2', text:'Dolphins use clicks and whistles to communicate information to one another.', target:'communicate', grammarPattern:'' },
        { id:'3', text:'Without a shared language, the two workers struggled to communicate clearly with each other about even simple instructions.', target:'communicate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'communicate', wrong:['behave', 'compete', 'bargain'] },
        { id:'2', answer:'communicate', wrong:['hide', 'translate', 'invent'] },
        { id:'3', answer:'communicate', wrong:['behave', 'smile', 'play'] }
      ]
    }),
  e('remotely', 'adverb',
    'from a distance, without being physically present, usually by using technology',
    ['from a distance', 'without being there'],
    ['very quickly and efficiently', 'in an unfriendly way', 'almost never'],
    'Many employees now work remotely three days a week.',
    'away from the office', 'Many employees now work away from the office three days a week.',
    'away from the office', 'The team can fix the problem away from the office using a secure link.',
    {
      masteryContexts:[
        { text:'The engineer fixed the fault remotely without visiting the factory.', meaning:'from a distance using technology' },
        { text:'Students can attend the lecture remotely by video link.', meaning:'without being physically present' }
      ],
      situationDistractors:[
        'The technician drove to the office and repaired the server by hand.',
        'All the staff met in the same room to discuss the plan.',
        'The doctor examined the patient in the clinic.'
      ],
      retrievalContexts:[
        { id:'1', text:'The doctor cannot visit the village, so she advises patients remotely by video call.', target:'remotely', grammarPattern:'' },
        { id:'2', text:'During the storm, most employees worked remotely instead of travelling to the office.', target:'remotely', grammarPattern:'' },
        { id:'3', text:'The drone can be controlled remotely from a base many kilometres away.', target:'remotely', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'remotely', wrong:['personally', 'locally', 'physically'] },
        { id:'2', answer:'remotely', wrong:['locally', 'physically', 'personally'] },
        { id:'3', answer:'remotely', wrong:['personally', 'physically', 'locally'] }
      ]
    }),
  e('transform', 'verb',
    'to change something completely, especially so that it becomes better or very different',
    ['change completely', 'turn into something new'],
    ['move slowly from one place to another', 'repair slightly', 'copy exactly'],
    'Technology has transformed the way people shop.',
    'completely changed', 'Technology has completely changed the way people shop.',
    'completely changed', 'The new library has completely changed the neighbourhood.',
    {
      masteryContexts:[
        { text:'The new park will transform the empty land into a green space.', meaning:'change completely into something different' },
        { text:'Smartphones have transformed communication.', meaning:'changed in a big and important way' }
      ],
      situationDistractors:[
        'The owner repainted one wall and left the rest of the shop the same.',
        'The company moved its offices to a building across the road.',
        'A small crack in the road was filled with tar.'
      ],
      retrievalContexts:[
        { id:'1', text:'Within ten years, the internet will completely transform the way people shop and work.', target:'transform', grammarPattern:'' },
        { id:'2', text:'A single great teacher can transform a student’s whole attitude to learning.', target:'transform', grammarPattern:'' },
        { id:'3', text:'Smartphones continue to transform the way young people communicate.', target:'transform', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'transform', wrong:['describe', 'delay', 'repeat'] },
        { id:'2', answer:'transform', wrong:['describe', 'measure', 'copy'] },
        { id:'3', answer:'transform', wrong:['ignore', 'delay', 'repeat'] }
      ]
    }),
  e('percentage', 'noun',
    'an amount expressed as a part of every hundred',
    ['proportion', 'part of a hundred'],
    ['the total cost of something', 'the speed of a change', 'the average of two numbers'],
    'A high percentage of students use their phones for homework.',
    'proportion', 'A high proportion of students use their phones for homework.',
    'proportion', 'A large proportion of the class passed the test.',
    {
      masteryContexts:[
        { text:'What percentage of the class walks to school?', meaning:'what part out of every hundred' },
        { text:'A small percentage of the profit goes to charity.', meaning:'a part of the whole, given as a number out of 100' }
      ],
      situationDistractors:[
        'The teacher counted the total number of books on the shelf.',
        'The class measured how fast each toy car rolled down the ramp.',
        'The shop owner added the cost of all the items together.'
      ],
      retrievalContexts:[
        { id:'1', text:'Only a small percentage of the audience left before the end.', target:'percentage', grammarPattern:'' },
        { id:'2', text:'A high percentage of teenagers now own a smartphone.', target:'percentage', grammarPattern:'' },
        { id:'3', text:'Shops usually add a percentage to the price to make a profit.', target:'percentage', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'percentage', wrong:['speed', 'weight', 'height'] },
        { id:'2', answer:'percentage', wrong:['speed', 'weight', 'distance'] },
        { id:'3', answer:'percentage', wrong:['speed', 'distance', 'weight'] }
      ]
    }),
  e('impression', 'noun',
    'the idea or feeling you have about someone or something after seeing or meeting them',
    ['first opinion', 'general feeling'],
    ['a final decision', 'a written report', 'a strong disagreement'],
    'My first impression of the school was very positive.',
    'opinion', 'My first opinion of the school was very positive.',
    'opinion', 'Her opinion of the city changed after a week.',
    {
      masteryContexts:[
        { text:'The politician made a strong impression on the audience.', meaning:'caused people to think well of him' },
        { text:'I had the impression that nobody was listening.', meaning:'a feeling or belief about what is true' }
      ],
      situationDistractors:[
        'He made a final decision after weighing all the evidence for several days.',
        'The reporter wrote a long report about the school budget.',
        'The two neighbours argued loudly about a fence.'
      ],
      retrievalContexts:[
        { id:'1', text:'Interviewers form an impression of a candidate within the first few minutes.', target:'impression', grammarPattern:'' },
        { id:'2', text:'She wanted to make a good impression on her new colleagues.', target:'impression', grammarPattern:'' },
        { id:'3', text:'My first impression of the town was that it was friendly and quiet.', target:'impression', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'impression', wrong:['report', 'plan', 'contract'] },
        { id:'2', answer:'impression', wrong:['excuse', 'plan', 'copy'] },
        { id:'3', answer:'impression', wrong:['photograph', 'visit', 'map'] }
      ]
    }),
  e('remote control', 'noun',
    'a small handheld device used to operate a television or other machine from a distance',
    ['controller', 'handheld device for controlling something'],
    ['a switch fixed to a wall', 'a long cable between two machines', 'a person who manages a television programme'],
    'Someone has lost the remote control again, so we cannot change the channel.',
    'controller', 'Someone has lost the controller again, so we cannot change the channel.',
    'controller', 'The child pressed a button on the controller and the toy car moved.',
    {
      masteryContexts:[
        { text:'Pass me the remote control so I can turn the volume down.', meaning:'a handheld device for operating a machine from a distance' },
        { text:'The drone has a remote control with two small joysticks.', meaning:'a device used to operate something from a distance' }
      ],
      situationDistractors:[
        'Dad walked across the room and pressed the button on the television itself.',
        'Mum searched the kitchen drawer for spare batteries.',
        'The engineer plugged a long cable into the back of the machine.'
      ],
      retrievalContexts:[
        { id:'1', text:'I cannot find the remote control, so I have to change the channel by hand.', target:'remote control', grammarPattern:'' },
        { id:'2', text:'Press the red button on the remote control to switch the television off.', target:'remote control', grammarPattern:'' },
        { id:'3', text:'The toy car is steered with a small remote control, so you can drive it from the other side of the room.', target:'remote control', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'remote control', wrong:['torch', 'newspaper', 'kettle'] },
        { id:'2', answer:'remote control', wrong:['kettle', 'window', 'radiator'] },
        { id:'3', answer:'remote control', wrong:['steering wheel', 'metal key', 'paintbrush'] }
      ]
    }),
  e('feature', 'noun',
    'an important or noticeable part or quality of something',
    ['characteristic', 'quality'],
    ['a mistake in a design', 'a person who tests products', 'the price of something'],
    'The best feature of this phone is its long battery life.',
    'quality', 'The best quality of this phone is its long battery life.',
    'characteristic', 'A noticeable characteristic of the building is its glass roof.',
    {
      masteryContexts:[
        { text:'Waterproofing is a useful feature of the new jacket.', meaning:'a useful part or quality of a product' },
        { text:'The lake is the main feature of the park.', meaning:'a noticeable part of a place' }
      ],
      situationDistractors:[
        'The shop sold the phone at half price during the sale.',
        'A technician repaired the screen of the broken tablet.',
        'The customer complained that the delivery arrived two days late.'
      ],
      retrievalContexts:[
        { id:'1', text:'The best feature of this laptop is its light weight and long battery life.', target:'feature', grammarPattern:'' },
        { id:'2', text:'Touchscreens are now a standard feature of almost every new car.', target:'feature', grammarPattern:'' },
        { id:'3', text:'One striking feature of the old town is the wall that still surrounds it.', target:'feature', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'feature', wrong:['owner', 'warranty', 'receipt'] },
        { id:'2', answer:'feature', wrong:['price', 'owner', 'mistake'] },
        { id:'3', answer:'feature', wrong:['owner', 'visitor', 'mistake'] }
      ]
    }),
  e('function', 'noun',
    'the purpose or job that something has; what it is designed to do',
    ['purpose', 'job'],
    ['the way something looks', 'the cost of making something', 'a danger to users'],
    'The main function of the heart is to pump blood around the body.',
    'purpose', 'The main purpose of the heart is to pump blood around the body.',
    'job', 'The main job of a fuse is to protect the circuit.',
    {
      masteryContexts:[
        { text:'What is the function of this switch?', meaning:'what it is for' },
        { text:'The function of the committee is to advise the principal.', meaning:'the purpose or job of a group' }
      ],
      situationDistractors:[
        'The designer chose bright colours to make the poster look attractive.',
        'The company paid a lot to manufacture the new machine.',
        'The user guide warned that the device could overheat.'
      ],
      retrievalContexts:[
        { id:'1', text:'The main function of a thermostat is to control the temperature of a room.', target:'function', grammarPattern:'' },
        { id:'2', text:'Ask what each part is for, and you are asking about its function.', target:'function', grammarPattern:'' },
        { id:'3', text:'The function of a fuse is to protect an electrical circuit from too much current.', target:'function', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'function', wrong:['colour', 'price', 'weight'] },
        { id:'2', answer:'function', wrong:['colour', 'price', 'weight'] },
        { id:'3', answer:'function', wrong:['colour', 'price', 'shape'] }
      ]
    }),
  e('interactive', 'adjective',
    'allowing users to take part and respond, rather than just watch or read',
    ['hands-on', 'two-way'],
    ['too complicated to use', 'available only to teachers', 'working without electricity'],
    'The museum has interactive exhibits that children can touch and control.',
    'hands-on', 'The museum has hands-on exhibits that children can touch and control.',
    'two-way', 'The two-way lessons let students ask questions at any time.',
    {
      masteryContexts:[
        { text:'The interactive whiteboard responds when students touch the screen.', meaning:'reacting to what the user does' },
        { text:'Interactive lessons keep students more engaged than lectures.', meaning:'involving active participation' }
      ],
      situationDistractors:[
        'The visitors walked past glass cases and read the label on each object.',
        'The teacher talked for an hour while the students listened in silence.',
        'The film played in the museum without anyone being able to change it.'
      ],
      retrievalContexts:[
        { id:'1', text:'Children learn quickly from interactive games that respond to every answer they give.', target:'interactive', grammarPattern:'' },
        { id:'2', text:'Students enjoy interactive lessons that let them ask questions and join in, rather than just listen.', target:'interactive', grammarPattern:'' },
        { id:'3', text:'The website is interactive, so users can vote, comment and see results change as they click.', target:'interactive', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'interactive', wrong:['passive', 'silent', 'printed'] },
        { id:'2', answer:'interactive', wrong:['recorded', 'silent', 'printed'] },
        { id:'3', answer:'interactive', wrong:['static', 'silent', 'printed'] }
      ]
    }),
  e('widespread', 'adjective',
    'found or happening in many places or among many people',
    ['common', 'found everywhere'],
    ['spread out over a large wall', 'very rare', 'dangerous and harmful'],
    'Smartphone use is now widespread among teenagers.',
    'common', 'Smartphone use is now common among teenagers.',
    'common', 'Colds are common in winter.',
    {
      masteryContexts:[
        { text:'There was widespread flooding after three days of rain.', meaning:'happening in many places' },
        { text:'The idea has widespread support among parents.', meaning:'shared by many people' }
      ],
      situationDistractors:[
        'Only one small village reported the unusual disease.',
        'A rare bird was seen once in the north of the country.',
        'The new rule applies to a single classroom.'
      ],
      retrievalContexts:[
        { id:'1', text:'Internet access is now widespread, even in small villages.', target:'widespread', grammarPattern:'' },
        { id:'2', text:'The news caused widespread panic across the whole country.', target:'widespread', grammarPattern:'' },
        { id:'3', text:'Support for the new law is widespread, with most people in every region in favour.', target:'widespread', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'widespread', wrong:['limited', 'occasional', 'private'] },
        { id:'2', answer:'widespread', wrong:['limited', 'local', 'private'] },
        { id:'3', answer:'widespread', wrong:['limited', 'rare', 'weak'] }
      ]
    }),
  e('availability', 'noun',
    'the fact that something can be obtained, used or reached',
    ['supply', 'ease of obtaining'],
    ['the quality of something', 'the price of something', 'the danger of something'],
    'The availability of fast internet varies greatly between cities and villages.',
    'supply', 'The supply of fast internet varies greatly between cities and villages.',
    'supply', 'The supply of fresh water is limited on the island.',
    {
      masteryContexts:[
        { text:'Check the availability of tickets before you travel.', meaning:'whether something can be obtained' },
        { text:'The availability of cheap flights has increased tourism.', meaning:'how easy it is to get or use something' }
      ],
      situationDistractors:[
        'The quality of the chocolate was praised by every customer.',
        'The shop doubled the price of its umbrellas when it started to rain.',
        'The manual explained how to use the device safely.'
      ],
      retrievalContexts:[
        { id:'1', text:'Doctors worry about the availability of medicine in poor areas, where there often is none to buy.', target:'availability', grammarPattern:'' },
        { id:'2', text:'Online booking has improved the availability of tickets, since anyone can now buy them easily.', target:'availability', grammarPattern:'' },
        { id:'3', text:'Please check the availability of the room, because it may already be taken for that date.', target:'availability', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'availability', wrong:['taste', 'colour', 'packaging'] },
        { id:'2', answer:'availability', wrong:['design', 'colour', 'packaging'] },
        { id:'3', answer:'availability', wrong:['colour', 'design', 'decoration'] }
      ]
    }),
  e('high-performance', 'adjective',
    'able to work at a very high standard or speed',
    ['very powerful', 'top-quality'],
    ['cheap and basic', 'very old', 'small and light'],
    'Gamers often buy high-performance computers that can run complex programs smoothly.',
    'very powerful', 'Gamers often buy very powerful computers that can run complex programs smoothly.',
    'very powerful', 'The company builds very powerful engines for racing cars.',
    {
      masteryContexts:[
        { text:'The team uses high-performance cameras to film the race.', meaning:'able to work at a very high standard' },
        { text:'High-performance athletes train twice a day.', meaning:'achieving results at the highest level' }
      ],
      situationDistractors:[
        'The old laptop froze whenever more than one program was open.',
        'The shop sold simple calculators at a very low price.',
        'The basic phone could only make calls and send texts.'
      ],
      retrievalContexts:[
        { id:'1', text:'Video editors need high-performance computers that can handle large files without slowing down.', target:'high-performance', grammarPattern:'' },
        { id:'2', text:'The racing team designs high-performance engines to win at top speed.', target:'high-performance', grammarPattern:'' },
        { id:'3', text:'Elite sport needs high-performance training and the best coaches.', target:'high-performance', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'high-performance', wrong:['low-power', 'out-of-date', 'basic'] },
        { id:'2', answer:'high-performance', wrong:['low-power', 'fuel-saving', 'quiet'] },
        { id:'3', answer:'high-performance', wrong:['low-cost', 'relaxed', 'occasional'] }
      ]
    }),
  e('stabilising', 'adjective',
    'making something steady and less likely to change suddenly or fall',
    ['steadying', 'balancing'],
    ['causing sudden changes', 'making something larger', 'making something cheaper'],
    'The central bank introduced stabilising measures to stop prices rising sharply.',
    'steadying', 'The central bank introduced steadying measures to stop prices rising sharply.',
    'balancing', 'The pilot made small balancing adjustments to keep the plane level.',
    {
      masteryContexts:[
        { text:'The calm teacher was a stabilising presence in the busy classroom.', meaning:'helping to keep things steady and calm' },
        { text:'The stabilising fins keep the rocket flying straight.', meaning:'keeping something steady and balanced' }
      ],
      situationDistractors:[
        'The sudden storm made the small boat rock violently from side to side.',
        'The rumours caused panic and prices shot up.',
        'The wobbly table collapsed when someone leaned on it.'
      ],
      retrievalContexts:[
        { id:'1', text:'The new captain had a stabilising effect, calming the team and ending the arguments.', target:'stabilising', grammarPattern:'' },
        { id:'2', text:'Fins have a stabilising function: they keep the rocket flying in a straight line.', target:'stabilising', grammarPattern:'' },
        { id:'3', text:'The government introduced stabilising measures to keep prices steady during the crisis.', target:'stabilising', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'stabilising', wrong:['disturbing', 'damaging', 'confusing'] },
        { id:'2', answer:'stabilising', wrong:['accelerating', 'decorative', 'warning'] },
        { id:'3', answer:'stabilising', wrong:['inflating', 'unsettling', 'expensive'] }
      ]
    }),
  e('multi-task', 'verb',
    'to do several jobs or activities at the same time',
    ['do several things at once', 'do several jobs at once'],
    ['focus on one job only', 'finish a job early', 'share a job with a colleague'],
    'It is hard to multi-task when each job needs your full attention.',
    'do several jobs at once', 'It is hard to do several jobs at once when each job needs your full attention.',
    'do several jobs at once', 'She can do several jobs at once without losing focus.',
    {
      masteryContexts:[
        { text:'Computers can multi-task by running many programs at once.', meaning:'do several things at the same time' },
        { text:'I cannot multi-task, so I finish one job before starting the next.', meaning:'do several jobs at the same time' }
      ],
      situationDistractors:[
        'She finished the report completely before she opened her email.',
        'He gave his whole attention to the lesson and ignored his phone.',
        'Two colleagues shared one big job, each doing half.'
      ],
      retrievalContexts:[
        { id:'1', text:'Many parents have to multi-task, cooking dinner while helping with homework and answering calls.', target:'multi-task', grammarPattern:'' },
        { id:'2', text:'Students who multi-task while studying, such as checking messages every minute, often learn less.', target:'multi-task', grammarPattern:'' },
        { id:'3', text:'Modern phones can multi-task, running music, maps and messages at the same time.', target:'multi-task', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'multi-task', wrong:['relax', 'rest', 'retire'] },
        { id:'2', answer:'multi-task', wrong:['relax', 'rest', 'focus'] },
        { id:'3', answer:'multi-task', wrong:['relax', 'shut down', 'upgrade'] }
      ]
    }),
  e('predictable', 'adjective',
    'happening or behaving in the way you expect; easy to know in advance',
    ['easy to guess', 'expected'],
    ['happening by accident', 'full of surprises', 'impossible to understand'],
    'The plot of the film was predictable, so many viewers stopped watching.',
    'easy to guess', 'The plot of the film was easy to guess, so many viewers stopped watching.',
    'easy to guess', 'The winner of the quiz was easy to guess from the first round.',
    {
      masteryContexts:[
        { text:'Her reaction was entirely predictable.', meaning:'exactly what people expected' },
        { text:'The weather in the desert is predictable: hot and dry.', meaning:'easy to know in advance' }
      ],
      situationDistractors:[
        'The result of the match surprised everyone in the stadium.',
        'Nobody could guess which card the magician would choose.',
        'The sudden announcement took the whole class by surprise.'
      ],
      retrievalContexts:[
        { id:'1', text:'His reaction was entirely predictable; everyone knew exactly what he would say.', target:'predictable', grammarPattern:'' },
        { id:'2', text:'Because the timetable is predictable, students always know what lesson comes next.', target:'predictable', grammarPattern:'' },
        { id:'3', text:'The film was so predictable that I guessed the ending in the first ten minutes.', target:'predictable', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'predictable', wrong:['surprising', 'unexpected', 'sudden'] },
        { id:'2', answer:'predictable', wrong:['confusing', 'changeable', 'random'] },
        { id:'3', answer:'predictable', wrong:['original', 'surprising', 'unusual'] }
      ]
    }),
  eb('professional', 'adjective'),
  eb('regional', 'adjective'),
  eb('commentary', 'noun'),
  eb('educational', 'adjective'),
  eb('culture', 'noun'),
  eb('genuine', 'adjective'),
  eb('amusing', 'adjective'),
  eb('competitive', 'adjective'),
  eb('critical', 'adjective'),
  eb('impressive', 'adjective'),
  eb('determination', 'noun'),
  eb('overcome', 'verb'),
  eb('accessory', 'noun'),
  eb('equipment', 'noun'),
  eb('fixture', 'noun'),
  eb('removable', 'adjective'),
  eb('adjustable', 'adjective'),
  eb('affordable', 'adjective'),
  eb('external', 'adjective'),
  eb('concentrate', 'verb'),
];

export default buildCuratedUnit({
  unitNumber:UNIT_NUMBER,
  unitTitle:'Digital Life',
  status,
  source:'0511 key words UNIT 2 – DIGITAL LIFE',
  entries,
  activities:[],
  // One shared list per word: Unit 2's "afford" reuses Unit 1's reviewed misspellings.
  lexicalSpelling:{ ...LEXICAL_SPELLING_ERRORS, vocab_afford_2:LEXICAL_SPELLING_ERRORS.vocab_afford }
});
