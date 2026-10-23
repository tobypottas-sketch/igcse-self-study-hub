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
        { id:'2', text:'Teenagers spend hours playing online games for entertainment.', target:'entertainment', grammarPattern:'' },
        { id:'3', text:'The hotel provides live entertainment every Saturday evening.', target:'entertainment', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'entertainment', wrong:['furniture', 'luggage', 'traffic'] },
        { id:'2', answer:'entertainment', wrong:['luggage', 'furniture', 'insurance'] },
        { id:'3', answer:'entertainment', wrong:['transport', 'vocabulary', 'insurance'] }
      ]
    }),
  e('access', 'noun',
    'the right or ability to use something or to reach a place',
    ['a way of using', 'the ability to use'],
    ['permission to leave', 'a payment for using something', 'a report on something'],
    'Many students do not have reliable access to the internet at home.',
    'a way of using', 'Many students do not have a reliable way of using the internet at home.',
    'the ability to use', 'Library cards give pupils the ability to use thousands of books.',
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
        { id:'1', text:'Many families now have fast internet access at home.', target:'access', grammarPattern:'' },
        { id:'2', text:'Students need a password to gain access to the online library.', target:'access', grammarPattern:'' },
        { id:'3', text:'Disabled visitors have easy access to all floors of the museum.', target:'access', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'access', wrong:['luggage', 'weather', 'furniture'] },
        { id:'2', answer:'access', wrong:['weather', 'luggage', 'revenge'] },
        { id:'3', answer:'access', wrong:['furniture', 'sympathy', 'insurance'] }
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
        { id:'1', text:'Many people now read the news on digital devices.', target:'digital', grammarPattern:'' },
        { id:'2', text:'Teachers can share digital resources with the whole class in seconds.', target:'digital', grammarPattern:'' },
        { id:'3', text:'We live in a digital age where information travels instantly.', target:'digital', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'digital', wrong:['hungry', 'generous', 'cheerful'] },
        { id:'2', answer:'digital', wrong:['sleepy', 'polite', 'jealous'] },
        { id:'3', answer:'digital', wrong:['hungry', 'polite', 'generous'] }
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
        { id:'1', text:'Many families cancelled cable television and chose streaming instead.', target:'streaming', grammarPattern:'' },
        { id:'2', text:'Slow internet connections make streaming difficult in some villages.', target:'streaming', grammarPattern:'' },
        { id:'3', text:'Music streaming is now more popular than buying CDs.', target:'streaming', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'streaming', wrong:['weather', 'gravity', 'punctuation'] },
        { id:'2', answer:'streaming', wrong:['gravity', 'punctuation', 'umbrellas'] },
        { id:'3', answer:'streaming', wrong:['weather', 'punctuation', 'umbrellas'] }
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
        { id:'1', text:'Only choose examples that are relevant to the question.', target:'relevant', grammarPattern:'' },
        { id:'2', text:'The teacher highlighted the most relevant information in the article.', target:'relevant', grammarPattern:'' },
        { id:'3', text:'Is this advice relevant to my situation?', target:'relevant', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'relevant', wrong:['grateful', 'curious', 'jealous'] },
        { id:'2', answer:'relevant', wrong:['careless', 'sleepy', 'generous'] },
        { id:'3', answer:'relevant', wrong:['loyal', 'curious', 'nervous'] }
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
        { id:'1', text:'Teamwork is essential in a successful project.', target:'essential', grammarPattern:'' },
        { id:'2', text:'Passwords are essential for keeping accounts safe.', target:'essential', grammarPattern:'' },
        { id:'3', text:'It is essential to back up your files regularly.', target:'essential', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'essential', wrong:['jealous', 'sleepy', 'hungry'] },
        { id:'2', answer:'essential', wrong:['loyal', 'polite', 'sleepy'] },
        { id:'3', answer:'essential', wrong:['curious', 'jealous', 'sleepy'] }
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
        { id:'1', answer:'current affairs', wrong:['sports results', 'fashion trends', 'film reviews'] },
        { id:'2', answer:'current affairs', wrong:['sports results', 'recipe ideas', 'fashion trends'] },
        { id:'3', answer:'current affairs', wrong:['recipe ideas', 'fashion trends', 'local gardens'] }
      ]
    }),
  eb('apparently', 'adverb'),
  eb('supposedly', 'adverb'),
  eb('celebrity', 'noun'),
  eb('informed', 'adjective'),
  eb('admit', 'verb'),
  eb('communicate', 'verb'),
  eb('remotely', 'adverb'),
  eb('transform', 'verb'),
  eb('percentage', 'noun'),
  eb('impression', 'noun'),
  eb('remote control', 'noun'),
  eb('feature', 'noun'),
  eb('function', 'noun'),
  eb('interactive', 'adjective'),
  eb('widespread', 'adjective'),
  eb('availability', 'noun'),
  eb('high-performance', 'adjective'),
  eb('stabilising', 'adjective'),
  eb('multi-task', 'verb'),
  eb('predictable', 'adjective'),
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
