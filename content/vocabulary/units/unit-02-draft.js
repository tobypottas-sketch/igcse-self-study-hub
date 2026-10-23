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
        { id:'2', text:'To win races at top speed, the team needs high-performance engines rather than basic engines built only for everyday driving.', target:'high-performance', grammarPattern:'' },
        { id:'3', text:'Elite sport needs high-performance training and the best coaches.', target:'high-performance', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'high-performance', wrong:['low-power', 'out-of-date', 'basic'] },
        { id:'2', answer:'high-performance', wrong:['low-power', 'basic', 'underpowered'] },
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
        { id:'3', text:'The government introduced stabilising measures specifically to keep prices steady during the crisis.', target:'stabilising', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'stabilising', wrong:['disturbing', 'damaging', 'confusing'] },
        { id:'2', answer:'stabilising', wrong:['accelerating', 'decorative', 'warning'] },
        { id:'3', answer:'stabilising', wrong:['destabilising', 'inflationary', 'disruptive'] }
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
  e('professional', 'adjective',
    'showing the skill and high standards expected of someone who is trained for a job',
    ['skilled', 'expert'],
    ['badly prepared and careless', 'done only for fun', 'free of charge'],
    'The team delivered a professional presentation with clear slides and no mistakes.',
    'skilled', 'The team delivered a skilled presentation with clear slides and no mistakes.',
    'expert', 'She gave expert advice on healthy eating.',
    {
      masteryContexts:[
        { text:'He gave a professional performance, even though he was nervous.', meaning:'showing the skill and high standards expected' },
        { text:'You should get professional advice before making a big decision.', meaning:'from a trained expert' }
      ],
      situationDistractors:[
        'The beginner nervously played his first song at the school concert.',
        'A volunteer painted the fence on Saturday morning just for fun.',
        'The mechanic forgot his tools and arrived two hours late.'
      ],
      retrievalContexts:[
        { id:'1', text:'You should ask a professional photographer rather than a friend with a phone to take wedding photos.', target:'professional', grammarPattern:'' },
        { id:'2', text:'The club hired a professional coach, a trained expert who had worked with national teams.', target:'professional', grammarPattern:'' },
        { id:'3', text:'Her professional manner, calm, polite and well prepared, impressed the interviewers.', target:'professional', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'professional', wrong:['amateur', 'casual', 'inexperienced'] },
        { id:'2', answer:'professional', wrong:['beginner', 'amateur', 'inexperienced'] },
        { id:'3', answer:'professional', wrong:['casual', 'careless', 'nervous'] }
      ]
    }),
  e('regional', 'adjective',
    'relating to a particular area of a country or of the world',
    ['local', 'of one area'],
    ['worldwide and international', 'very old and traditional', 'prepared at home'],
    'The restaurant specialises in regional dishes from the north of the country.',
    'local', 'The restaurant specialises in local dishes from the north of the country.',
    'local', 'Local newspapers cover news from small towns.',
    {
      masteryContexts:[
        { text:'Regional accents vary across the country.', meaning:'belonging to a particular part of a country' },
        { text:'The regional manager visits each shop in the south-west.', meaning:'responsible for one area' }
      ],
      situationDistractors:[
        'The international airline flew passengers between twenty countries.',
        'The national government announced a rule for the entire country.',
        'A world-famous chef opened restaurants on every continent.'
      ],
      retrievalContexts:[
        { id:'1', text:'People from different parts of the country often have different regional accents.', target:'regional', grammarPattern:'' },
        { id:'2', text:'The newspaper covers regional news, such as events in the north-west, rather than national stories.', target:'regional', grammarPattern:'' },
        { id:'3', text:'Each shop is run by a regional manager responsible only for the south-east of the country.', target:'regional', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'regional', wrong:['national', 'international', 'global'] },
        { id:'2', answer:'regional', wrong:['international', 'global', 'worldwide'] },
        { id:'3', answer:'regional', wrong:['national', 'global', 'international'] }
      ]
    }),
  e('commentary', 'noun',
    'a spoken description of an event as it happens',
    ['live description', 'spoken report'],
    ['a list of match results', 'an advertisement during a break', 'a written summary of the rules'],
    'The commentary on the final was so exciting that fans stayed glued to their radios.',
    'live description', 'The live description of the final was so exciting that fans stayed glued to their radios.',
    'live description', 'The live description of the concert was broadcast on local radio.',
    {
      masteryContexts:[
        { text:'The radio commentary of the race was full of excitement.', meaning:'a spoken description of an event as it happens' },
        { text:'The football commentary was so lively that listeners felt they were at the stadium.', meaning:'a live spoken description of a match' }
      ],
      situationDistractors:[
        'The printed programme listed all the players and their numbers.',
        'The scoreboard showed the final result of the match.',
        'The referee blew the whistle and stopped play.'
      ],
      retrievalContexts:[
        { id:'1', text:'Fans who could not attend followed the commentary, which described every pass and shot as it happened.', target:'commentary', grammarPattern:'' },
        { id:'2', text:'On the radio, the presenter provided a running commentary, describing the match move by move.', target:'commentary', grammarPattern:'' },
        { id:'3', text:'During the quiet moments of the race, the commentary filled the silence with facts about the riders.', target:'commentary', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'commentary', wrong:['scoreboard', 'schedule', 'advertisement'] },
        { id:'2', answer:'commentary', wrong:['timetable', 'receipt', 'menu'] },
        { id:'3', answer:'commentary', wrong:['scoreboard', 'weather', 'traffic'] }
      ]
    }),
  e('educational', 'adjective',
    'giving knowledge or teaching useful things',
    ['teaching', 'instructive'],
    ['only for entertainment', 'extremely expensive', 'related to money'],
    'The museum runs educational programmes for school groups.',
    'teaching', 'The museum runs teaching programmes for school groups.',
    'teaching', 'The charity sends teaching materials to rural schools.',
    {
      masteryContexts:[
        { text:'The documentary was both entertaining and educational.', meaning:'teaching useful things' },
        { text:'Educational apps help young children learn letters and numbers.', meaning:'designed to help people learn' }
      ],
      situationDistractors:[
        'The family played a board game purely for amusement on Sunday evening.',
        'The comedian told jokes for two hours at the theatre.',
        'The shop sold toys that had no instructions or learning purpose.'
      ],
      retrievalContexts:[
        { id:'1', text:'Parents prefer educational games that help children learn spelling and maths.', target:'educational', grammarPattern:'' },
        { id:'2', text:'A documentary that explains how ancient tools were used is educational because viewers learn something new.', target:'educational', grammarPattern:'' },
        { id:'3', text:'Good children’s television can be educational as well as entertaining, teaching viewers new facts.', target:'educational', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'educational', wrong:['pointless', 'harmful', 'useless'] },
        { id:'2', answer:'educational', wrong:['pointless', 'misleading', 'unrelated'] },
        { id:'3', answer:'educational', wrong:['pointless', 'misleading', 'boring'] }
      ]
    }),
  e('culture', 'noun',
    'the customs, beliefs and way of life of a particular group of people',
    ['way of life', 'customs and traditions'],
    ['the natural scenery of a place', 'the system of government of a country', 'the money used in a country'],
    'Visiting a new country is a good way to learn about its culture.',
    'way of life', 'Visiting a new country is a good way to learn about its way of life.',
    'customs and traditions', 'The festival celebrates the customs and traditions of the region.',
    {
      masteryContexts:[
        { text:'Food is an important part of Italian culture.', meaning:'customs, beliefs and way of life' },
        { text:'Music and food are important parts of local culture.', meaning:'the customs and way of life of a group' }
      ],
      situationDistractors:[
        'The tourist took photographs of the mountains and the lake.',
        'The government changed the tax rules for small businesses.',
        'The traveller exchanged his money at the airport.'
      ],
      retrievalContexts:[
        { id:'1', text:'Learning a language helps you understand another culture.', target:'culture', grammarPattern:'' },
        { id:'2', text:'Greetings, festivals and food are all part of a country’s culture.', target:'culture', grammarPattern:'' },
        { id:'3', text:'In Japanese culture, it is polite to bow when you meet someone.', target:'culture', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'culture', wrong:['climate', 'weather', 'landscape'] },
        { id:'2', answer:'culture', wrong:['climate', 'landscape', 'population'] },
        { id:'3', answer:'culture', wrong:['geography', 'weather', 'landscape'] }
      ]
    }),
  e('genuine', 'adjective',
    'real and not false, fake or pretended',
    ['real', 'authentic'],
    ['very expensive', 'old and damaged', 'copied from another source'],
    'Is this a genuine designer bag, or a cheap copy?',
    'real', 'Is this a real designer bag, or a cheap copy?',
    'authentic', 'The museum displays an authentic Roman coin.',
    {
      masteryContexts:[
        { text:'She showed genuine concern when I was ill.', meaning:'sincere, not pretended' },
        { text:'The ring is made of genuine gold.', meaning:'real, not imitation' }
      ],
      situationDistractors:[
        'The shop sold a cheap copy of a famous painting as a souvenir.',
        'He pretended to be interested while checking his phone.',
        'The label said the leather was imitation.'
      ],
      retrievalContexts:[
        { id:'1', text:'The seller proved that the painting was genuine by showing the artist’s signature and records.', target:'genuine', grammarPattern:'' },
        { id:'2', text:'Her smile was genuine, not polite or forced.', target:'genuine', grammarPattern:'' },
        { id:'3', text:'Check that the ticket is genuine, because there are many fakes online.', target:'genuine', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'genuine', wrong:['fake', 'forged', 'imitation'] },
        { id:'2', answer:'genuine', wrong:['pretended', 'false', 'artificial'] },
        { id:'3', answer:'genuine', wrong:['fake', 'counterfeit', 'forged'] }
      ]
    }),
  e('amusing', 'adjective',
    'funny and entertaining; making you smile or laugh',
    ['funny', 'humorous'],
    ['sad and serious', 'difficult to understand', 'very frightening'],
    'We found the cartoon so amusing that we watched it twice.',
    'funny', 'We found the cartoon so funny that we watched it twice.',
    'funny', 'She told a funny story about her first day at school.',
    {
      masteryContexts:[
        { text:'My grandfather told an amusing story about his school days.', meaning:'funny and entertaining' },
        { text:'I found the film mildly amusing, but not hilarious.', meaning:'making you smile a little' }
      ],
      situationDistractors:[
        'The audience sat in silence during the sad scene.',
        'The teacher explained a difficult maths problem on the board.',
        'The film showed a frightening storm at sea.'
      ],
      retrievalContexts:[
        { id:'1', text:'The comedian told several amusing stories that made the audience laugh.', target:'amusing', grammarPattern:'' },
        { id:'2', text:'It was an amusing sight: a puppy trying to climb the stairs and rolling back down.', target:'amusing', grammarPattern:'' },
        { id:'3', text:'The cartoon is amusing for children, who giggle at the silly characters.', target:'amusing', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'amusing', wrong:['tragic', 'serious', 'frightening'] },
        { id:'2', answer:'amusing', wrong:['tragic', 'serious', 'shocking'] },
        { id:'3', answer:'amusing', wrong:['tragic', 'boring', 'frightening'] }
      ]
    }),
  e('competitive', 'adjective',
    'wanting very much to win or to be more successful than others',
    ['eager to win', 'driven to beat others'],
    ['friendly and relaxed', 'unwilling to take part', 'not very good at sport'],
    'She is very competitive and hates losing even a friendly game.',
    'eager to win', 'She is very eager to win and hates losing even a friendly game.',
    'eager to win', 'Players eager to win train harder than anyone else.',
    {
      masteryContexts:[
        { text:'He is a highly competitive swimmer who trains every day.', meaning:'determined to win' },
        { text:'It is a competitive industry, with many companies fighting for customers.', meaning:'involving strong competition' }
      ],
      situationDistractors:[
        'The two friends played cards for fun and did not keep score.',
        'She shared her sandwiches with the other team after the match.',
        'He gave up the race because he did not care about winning.'
      ],
      retrievalContexts:[
        { id:'1', text:'My brother is so competitive that he cannot stand losing even a simple card game.', target:'competitive', grammarPattern:'' },
        { id:'2', text:'The job market is very competitive, with hundreds of applicants for every position.', target:'competitive', grammarPattern:'' },
        { id:'3', text:'Because the school is highly competitive, students work extremely hard to be top of the class.', target:'competitive', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'competitive', wrong:['relaxed', 'generous', 'careless'] },
        { id:'2', answer:'competitive', wrong:['quiet', 'relaxed', 'secure'] },
        { id:'3', answer:'competitive', wrong:['relaxed', 'casual', 'generous'] }
      ]
    }),
  e('critical', 'adjective',
    'expressing disapproval of someone or something, or pointing out their faults',
    ['disapproving', 'fault-finding'],
    ['full of praise', 'too tired to notice', 'unable to decide'],
    'Reviewers were critical of the film’s slow start.',
    'disapproving', 'Reviewers were disapproving of the film’s slow start.',
    'disapproving', 'Her father gave a disapproving look at the untidy room.',
    {
      masteryContexts:[
        { text:'Parents were critical of the new homework policy.', meaning:'expressing disapproval of' },
        { text:'She is too critical of her own work.', meaning:'quick to find faults' }
      ],
      situationDistractors:[
        'The judges praised every performance and gave full marks.',
        'The teacher congratulated the class on its excellent results.',
        'Reviewers called the film brilliant and moving.'
      ],
      retrievalContexts:[
        { id:'1', text:'Several newspapers were critical of the decision to cut school funding, arguing that it was a terrible mistake.', target:'critical', grammarPattern:'' },
        { id:'2', text:'Her critical comments, pointing out every small mistake in my essay, left me feeling discouraged.', target:'critical', grammarPattern:'' },
        { id:'3', text:'He is a very critical person who complains about everything and never says anything good.', target:'critical', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'critical', wrong:['supportive', 'proud', 'approving'] },
        { id:'2', answer:'critical', wrong:['supportive', 'encouraging', 'kind'] },
        { id:'3', answer:'critical', wrong:['cheerful', 'grateful', 'easy-going'] }
      ]
    }),
  e('impressive', 'adjective',
    'causing admiration because of great skill, size or quality',
    ['remarkable', 'admirable'],
    ['disappointing and weak', 'ordinary and average', 'slightly unusual'],
    'Her exam results were so impressive that the school put them on its website.',
    'remarkable', 'Her exam results were so remarkable that the school put them on its website.',
    'admirable', 'He showed admirable patience with the younger children.',
    {
      masteryContexts:[
        { text:'The view from the tower is truly impressive.', meaning:'causing admiration' },
        { text:'He gave an impressive speech without using any notes.', meaning:'showing great skill' }
      ],
      situationDistractors:[
        'The team lost every match and finished at the bottom of the league.',
        'The presentation was short and covered only basic facts.',
        'The painting looked similar to many others in the shop.'
      ],
      retrievalContexts:[
        { id:'1', text:'Her speech was so impressive that the whole audience stood up and applauded.', target:'impressive', grammarPattern:'' },
        { id:'2', text:'The new stadium is huge and impressive, with a roof that opens in minutes.', target:'impressive', grammarPattern:'' },
        { id:'3', text:'He gave an impressive performance, winning every round without making a single mistake.', target:'impressive', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'impressive', wrong:['disappointing', 'ordinary', 'boring'] },
        { id:'2', answer:'impressive', wrong:['ordinary', 'boring', 'disappointing'] },
        { id:'3', answer:'impressive', wrong:['average', 'weak', 'disappointing'] }
      ]
    }),
  e('determination', 'noun',
    'the strong will to keep trying to achieve something difficult without giving up',
    ['strong will', 'perseverance'],
    ['a feeling of nervousness', 'permission to continue', 'a talent for something'],
    'Her determination to finish the marathon inspired everyone.',
    'strong will', 'Her strong will to finish the marathon inspired everyone.',
    'perseverance', 'Perseverance helped him pass the difficult exam.',
    {
      masteryContexts:[
        { text:'With great determination, she trained every morning before school.', meaning:'a strong will not to give up' },
        { text:'His determination to succeed impressed the coach.', meaning:'firm decision to achieve something despite difficulty' }
      ],
      situationDistractors:[
        'He gave up the climb after twenty minutes because it was tiring.',
        'She stopped practising the piano as soon as the piece became difficult.',
        'The team left the pitch at half time and never returned.'
      ],
      retrievalContexts:[
        { id:'1', text:'Although she failed three times, her determination never weakened, and she tried again.', target:'determination', grammarPattern:'' },
        { id:'2', text:'Success in sport takes talent, but also hard work and determination to keep going when things get difficult.', target:'determination', grammarPattern:'' },
        { id:'3', text:'The climbers reached the summit through sheer determination, despite the freezing wind and exhaustion.', target:'determination', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'determination', wrong:['doubt', 'weakness', 'boredom'] },
        { id:'2', answer:'determination', wrong:['laziness', 'weakness', 'doubt'] },
        { id:'3', answer:'determination', wrong:['weakness', 'fear', 'laziness'] }
      ]
    }),
  e('overcome', 'verb',
    'to succeed in dealing with a problem or difficulty that is stopping you',
    ['conquer', 'get past'],
    ['create a problem', 'avoid thinking about', 'give in to'],
    'She worked hard to overcome her fear of public speaking.',
    'conquer', 'She worked hard to conquer her fear of public speaking.',
    'get past', 'He found a way to get past his shyness.',
    {
      masteryContexts:[
        { text:'Many athletes overcome serious injuries to return to competition.', meaning:'succeed in dealing with a difficulty' },
        { text:'It took years to overcome the language barrier.', meaning:'get past a problem that stops progress' }
      ],
      situationDistractors:[
        'He gave up learning the guitar when his fingers began to hurt.',
        'She avoided speaking in class because she was shy.',
        'The team withdrew from the competition after the first defeat.'
      ],
      retrievalContexts:[
        { id:'1', text:'After months of practice, he managed to overcome his fear of heights, so it no longer stopped him from climbing.', target:'overcome', grammarPattern:'' },
        { id:'2', text:'It took the whole team to overcome the difficulties caused by the delayed delivery and finish on time.', target:'overcome', grammarPattern:'' },
        { id:'3', text:'Learners must overcome many obstacles, such as lack of confidence, before they speak fluently.', target:'overcome', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'overcome', wrong:['increase', 'deepen', 'worsen'] },
        { id:'2', answer:'overcome', wrong:['cause', 'create', 'increase'] },
        { id:'3', answer:'overcome', wrong:['create', 'invent', 'admire'] }
      ]
    }),
  e('accessory', 'noun',
    'an extra item that is added to something or goes with it, such as a phone case or a scarf',
    ['add-on', 'extra item'],
    ['the main part of a machine', 'a spare part that has broken', 'a manual explaining how to use it'],
    'A protective case is a useful accessory for a new tablet.',
    'add-on', 'A protective case is a useful add-on for a new tablet.',
    'extra item', 'A spare charger is an extra item worth carrying.',
    {
      masteryContexts:[
        { text:'Headphones are a popular accessory for smartphone users.', meaning:'an extra item that goes with something' },
        { text:'She wore a red scarf as her only accessory.', meaning:'an extra item that goes with clothes' }
      ],
      situationDistractors:[
        'The factory built the main engine of the car by hand.',
        'The shop repaired the broken screen of the phone.',
        'The customer asked for a refund on the whole tablet.'
      ],
      retrievalContexts:[
        { id:'1', text:'The phone works perfectly without the matching case, which is only an accessory.', target:'accessory', grammarPattern:'' },
        { id:'2', text:'A scarf or belt can be an accessory that completes an outfit.', target:'accessory', grammarPattern:'' },
        { id:'3', text:'A tripod is an accessory for a camera, not part of the camera itself.', target:'accessory', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'accessory', wrong:['necessity', 'requirement', 'component'] },
        { id:'2', answer:'accessory', wrong:['necessity', 'requirement', 'disaster'] },
        { id:'3', answer:'accessory', wrong:['model', 'brand', 'version'] }
      ]
    }),
  e('equipment', 'noun',
    'the tools, machines or clothing needed for a particular job or activity',
    ['gear', 'apparatus'],
    ['rules for playing a game', 'a person who repairs machines', 'a room where tools are stored'],
    'The school bought new equipment for the science laboratory.',
    'apparatus', 'The school bought new apparatus for the science laboratory.',
    'gear', 'Climbers must carry all their gear up the mountain.',
    {
      masteryContexts:[
        { text:'Firefighters carry heavy equipment into burning buildings.', meaning:'tools and machines needed for a job' },
        { text:'The gym has a lot of modern equipment.', meaning:'machines and tools for an activity' }
      ],
      situationDistractors:[
        'The coach explained the rules before the match began.',
        'The cleaner locked the storage room at six o’clock.',
        'A technician repaired the broken lift in the hotel.'
      ],
      retrievalContexts:[
        { id:'1', text:'The science department needs new equipment, because the microscopes are all broken.', target:'equipment', grammarPattern:'' },
        { id:'2', text:'Climbers must carry all their equipment up the mountain, including ropes, tents and cooking stoves.', target:'equipment', grammarPattern:'' },
        { id:'3', text:'Divers check their equipment carefully before every dive, including masks, tanks and regulators.', target:'equipment', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'equipment', wrong:['advice', 'information', 'permission'] },
        { id:'2', answer:'equipment', wrong:['advice', 'information', 'permission'] },
        { id:'3', answer:'equipment', wrong:['homework', 'luck', 'courage'] }
      ]
    }),
  e('fixture', 'noun',
    'a fitting, such as a light or a sink, that is permanently fixed in a building',
    ['fitting', 'permanent attachment'],
    ['a piece of furniture that can be carried away', 'a short-term repair', 'a decoration for a party'],
    'The lights and sinks are fixtures, so tenants must leave them when they move out.',
    'fittings', 'The lights and sinks are fittings, so tenants must leave them when they move out.',
    'fittings', 'The hotel replaced all the bathroom fittings last year.',
    {
      masteryContexts:[
        { text:'The ceiling light is a fixture, so it stays when the family moves.', meaning:'something fixed permanently in a building' },
        { text:'Modern bathrooms have fixtures such as a sink and a shower.', meaning:'fitted equipment in a building' }
      ],
      situationDistractors:[
        'The tenants packed their sofa and took it to the new flat.',
        'The family hung a poster on the wall for the weekend.',
        'The removal van carried the dining table down the stairs.'
      ],
      retrievalContexts:[
        { id:'1', text:'The kitchen sink is a fixture, so the new owners will find it there when they move in.', target:'fixture', grammarPattern:'' },
        { id:'2', text:'A ceiling light is a fixture because it is permanently attached to the building.', target:'fixture', grammarPattern:'' },
        { id:'3', text:'Unlike a freestanding lamp, a wall light is a fixture, fastened permanently to the wall.', target:'fixture', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'fixture', wrong:['sofa', 'suitcase', 'painting'] },
        { id:'2', answer:'fixture', wrong:['sofa', 'suitcase', 'painting'] },
        { id:'3', answer:'fixture', wrong:['sofa', 'suitcase', 'painting'] }
      ]
    }),
  e('removable', 'adjective',
    'able to be taken off or taken out',
    ['detachable', 'able to be taken off'],
    ['impossible to clean', 'permanently fixed', 'very expensive'],
    'The sofa has a removable cover that can be washed.',
    'detachable', 'The sofa has a detachable cover that can be washed.',
    'detachable', 'The torch has a detachable handle.',
    {
      masteryContexts:[
        { text:'The keyboard has removable keys for easy cleaning.', meaning:'able to be taken off' },
        { text:'The phone has a removable battery, so you can replace it yourself.', meaning:'able to be taken out' }
      ],
      situationDistractors:[
        'The panel was glued tightly to the wall and would not move.',
        'The screws held the shelf firmly in place.',
        'The sticker was printed directly onto the plastic.'
      ],
      retrievalContexts:[
        { id:'1', text:'The bag has a removable strap, so you can carry it by hand or over your shoulder.', target:'removable', grammarPattern:'' },
        { id:'2', text:'The cover is removable, which means you can take it off and wash it in the machine.', target:'removable', grammarPattern:'' },
        { id:'3', text:'Because the memory card is removable, you can take it out and put it in another camera.', target:'removable', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'removable', wrong:['permanent', 'fixed', 'tight'] },
        { id:'2', answer:'removable', wrong:['permanent', 'fixed', 'sewn'] },
        { id:'3', answer:'removable', wrong:['permanent', 'fixed', 'built-in'] }
      ]
    }),
  e('adjustable', 'adjective',
    'able to be changed or moved to suit different needs',
    ['able to be altered', 'changeable to fit'],
    ['very expensive', 'easy to break', 'fixed in one position'],
    'The strap is adjustable so that it fits all sizes.',
    'able to be altered', 'The strap is able to be altered so that it fits all sizes.',
    'able to be altered', 'The plan is able to be altered if the weather changes.',
    {
      masteryContexts:[
        { text:'The bike has an adjustable seat for riders of different heights.', meaning:'able to be changed to fit' },
        { text:'Use the adjustable strap to make the bag shorter or longer.', meaning:'able to be moved or changed' }
      ],
      situationDistractors:[
        'The bolts held the seat in one fixed position.',
        'The shoes came in only one size and could not be changed.',
        'The shelf was fixed to the wall and could not be moved.'
      ],
      retrievalContexts:[
        { id:'1', text:'The desk is adjustable, so students of different heights can raise or lower it.', target:'adjustable', grammarPattern:'' },
        { id:'2', text:'Because the strap is adjustable, it can be shortened or lengthened to fit anyone.', target:'adjustable', grammarPattern:'' },
        { id:'3', text:'The seat on the bicycle is adjustable, so you can move it up or down.', target:'adjustable', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'adjustable', wrong:['fixed', 'permanent', 'immovable'] },
        { id:'2', answer:'adjustable', wrong:['fixed', 'permanent', 'durable'] },
        { id:'3', answer:'adjustable', wrong:['fixed', 'permanent', 'immovable'] }
      ]
    }),
  e('affordable', 'adjective',
    'not too expensive; cheap enough for most people to buy',
    ['reasonably priced', 'not too expensive'],
    ['extremely expensive', 'free of charge', 'impossible to buy'],
    'The company produces affordable laptops for students on a small budget.',
    'reasonably priced', 'The company produces reasonably priced laptops for students on a small budget.',
    'reasonably priced', 'The café serves reasonably priced meals to students.',
    {
      masteryContexts:[
        { text:'Affordable housing is a problem in many big cities.', meaning:'not too expensive for ordinary people' },
        { text:'Tablets are now cheap enough to be affordable for most schools.', meaning:'low enough in price to buy' }
      ],
      situationDistractors:[
        'The jeweller sold a diamond necklace for thousands of pounds.',
        'The shop gave away free samples to every customer.',
        'The sports car was too costly for most families.'
      ],
      retrievalContexts:[
        { id:'1', text:'Many families on low incomes cannot buy a laptop unless it is affordable.', target:'affordable', grammarPattern:'' },
        { id:'2', text:'The airline introduced affordable tickets so that students on small budgets could travel.', target:'affordable', grammarPattern:'' },
        { id:'3', text:'Free school meals and affordable bus fares help families who have little money.', target:'affordable', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'affordable', wrong:['luxurious', 'expensive', 'exclusive'] },
        { id:'2', answer:'affordable', wrong:['luxury', 'expensive', 'exclusive'] },
        { id:'3', answer:'affordable', wrong:['luxury', 'premium', 'exclusive'] }
      ]
    }),
  e('external', 'adjective',
    'outside something, or coming from outside it',
    ['outer', 'on the outside'],
    ['inside the building', 'very old', 'hidden underground'],
    'The external walls of the building are painted white.',
    'outer', 'The outer walls of the building are painted white.',
    'outer', 'The outer layer of the fruit is thick.',
    {
      masteryContexts:[
        { text:'The external examiner visited the school to mark the speaking tests.', meaning:'from outside the organisation' },
        { text:'Connect an external hard drive to save extra files.', meaning:'separate from and outside the main device' }
      ],
      situationDistractors:[
        'The pipes were hidden inside the walls of the building.',
        'The teacher marked the tests herself.',
        'The staff solved the problem without help from anyone else.'
      ],
      retrievalContexts:[
        { id:'1', text:'The external walls of the building are painted white, while the internal walls are cream.', target:'external', grammarPattern:'' },
        { id:'2', text:'The external examiner comes from outside the school to mark the final speaking test.', target:'external', grammarPattern:'' },
        { id:'3', text:'You can plug an external drive into the laptop, a separate device outside the machine, to save extra files.', target:'external', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'external', wrong:['inner', 'central', 'hidden'] },
        { id:'2', answer:'external', wrong:['internal', 'school-based', 'in-house'] },
        { id:'3', answer:'external', wrong:['internal', 'central', 'built-in'] }
      ]
    }),
  e('concentrate', 'verb',
    'to give all your attention to one thing',
    ['focus', 'pay full attention'],
    ['become very tired', 'speak very quietly', 'forget something quickly'],
    'It is hard to concentrate when people are talking nearby.',
    'focus', 'It is hard to focus when people are talking nearby.',
    'focus', 'Try to focus on the question before you write.',
    {
      masteryContexts:[
        { text:'I cannot concentrate with the television on.', meaning:'give full attention to one thing' },
        { text:'Concentrate on the task in front of you.', meaning:'focus your attention' }
      ],
      situationDistractors:[
        'He checked his phone every minute during the lesson.',
        'She chatted to her friend while the teacher spoke.',
        'The student looked out of the window and daydreamed.'
      ],
      retrievalContexts:[
        { id:'1', text:'To concentrate fully on the exam, she switched off her phone and ignored every distraction.', target:'concentrate', grammarPattern:'' },
        { id:'2', text:'Please concentrate on the road and keep your eyes off your phone.', target:'concentrate', grammarPattern:'' },
        { id:'3', text:'Many students find it easier to concentrate on one task at a time instead of switching between several.', target:'concentrate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'concentrate', wrong:['rely', 'insist', 'depend'] },
        { id:'2', answer:'concentrate', wrong:['rely', 'insist', 'comment'] },
        { id:'3', answer:'concentrate', wrong:['rely', 'insist', 'depend'] }
      ]
    }),
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
