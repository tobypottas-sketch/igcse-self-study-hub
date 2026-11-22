// UNIT 9 – COMMUNICATION: authored source for the Unit 9 Vocabulary Builder release (releases/unit-09.js promotes it to live once approved). Source: 0511 key vocabulary unit 9: Communication
// (coursebook order), 50/50 authored. Check: node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-09.js
// effective, demonstrate, launched, passive, interactive, generation, recommend, solution, evaluate and relevant are also earlier-unit targets; each has its own Unit 9 id
// (idKey 'X_9' -> vocab_X_9) and aliases the earlier spelling list. Multi-word targets (digital native, underlying meaning, reporting verb...) keep the coursebook form.
import { buildCuratedUnit } from '../build-unit.js';
import { LEXICAL_SPELLING_ERRORS } from '../lexical-spelling-errors.js';
import unit9Activities from './unit-09-activities.js';
import unit9PrecisionUse from './unit-09-precision-use.js';
import unit9WordFamilyItems from './unit-09-word-family-items.js';
import unit9Collocations from './unit-09-collocations.js';
import unit9SituationExtras from './unit-09-situation-extras.js';
import unit9MeaningMatch from './unit-09-meaning-match.js';
import unit9MeaningMastery from './unit-09-meaning-mastery.js';
import unit9ContextPassages from './unit-09-context-passages.js';
import { unit9WordFamilies, unit9WordFamilyRejected } from './unit-09-word-families.js';
import { unit9WordFamilyAlternates } from './unit-09-word-family-alternates.js';

const UNIT_NUMBER = 9;
const status = 'approved';

const e = (term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence, paraphraseSource, paraphraseSentence, productionSource, productionSentence, extras = {}) => ({
  term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence,
  paraphrase:{ source:paraphraseSource, sentence:paraphraseSentence },
  production:{ source:productionSource, sentence:productionSentence },
  ...extras
});

const entries = [
  e('communication', 'noun',
    'the process of sharing information, ideas or feelings with other people',
    ['sharing information', 'exchanging ideas and messages'],
    ['the process of storing information safely', 'the habit of working alone without help', 'the skill of repairing electronic devices'],
    'Good communication between team members helped the class finish the project on time.',
    'sharing information', 'Sharing information clearly between team members helped the class finish the project on time.',
    'exchanging messages', 'After the storm, exchanging messages with the village was impossible for two days.',
    {
      teacherNote:'Noun: the sharing of information, ideas or feelings (good communication, communication skills, lines of communication). Uncountable in this sense. The verb communicate, the adjective communicative and the noun communicator are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Employers often say that communication is the most important skill a new worker can have.', meaning:'the ability to share ideas clearly with others' },
        { text:'During the flood, all communication with the town was cut off because the phone lines were damaged.', meaning:'contact and the exchange of messages' }
      ],
      situationDistractors:[
        'A student sat alone in the library and read silently for an hour.',
        'A boy fixed the chain on his bicycle without asking anyone for help.',
        'A girl stored her old photos on a memory stick and put it in a drawer.'
      ],
      retrievalContexts:[
        { id:'1', text:'Clear communication between the coach and the players is essential during a match.', target:'communication', grammarPattern:'' },
        { id:'2', text:'The course helps shy students improve their communication skills.', target:'communication', grammarPattern:'' },
        { id:'3', text:'Text messages are now the most common form of communication among teenagers.', target:'communication', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'communication', wrong:['frustration', 'conclusion', 'generation'] },
        { id:'2', answer:'communication', wrong:['perception', 'introduction', 'workforce'] },
        { id:'3', answer:'communication', wrong:['accuracy', 'frustration', 'conference'] }
      ]
    }),
  e('signalling', 'verb',
    'giving a message or warning by making a movement, sound or light',
    ['giving a sign', 'showing a message with a movement or light'],
    ['hiding a message so nobody can see it', 'writing a long and detailed report', 'refusing to answer a question'],
    'The cyclist was signalling with her left arm before she turned into the side street.',
    'giving a sign', 'The cyclist was giving a sign with her left arm before she turned into the side street.',
    'showing with a gesture', 'The referee was showing with a gesture that the goal did not count.',
    {
      teacherNote:'Verb (-ing form, British spelling with double l): giving a message or warning with a movement, sound or light (signalling to someone, signalling that ..., signalling for help). American English spells it signaling. The noun signal and the past form signalled are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The lifeguard was signalling to the swimmers to come back towards the beach.', meaning:'making a movement to give a message' },
        { text:'A flashing red light on the dashboard was signalling that the car needed petrol.', meaning:'showing a warning with a light' }
      ],
      situationDistractors:[
        'A driver sat quietly in a traffic jam, listening to the radio.',
        'A girl wrote a long letter to her grandmother in Canada.',
        'A student kept his answer secret and said nothing to the class.'
      ],
      retrievalContexts:[
        { id:'1', text:'The waiter saw a customer signalling for the bill and hurried over to her table.', target:'signalling', grammarPattern:'' },
        { id:'2', text:'Sailors used flags for signalling to other ships before radios were invented.', target:'signalling', grammarPattern:'' },
        { id:'3', text:'The guard was signalling with a torch to show the lorry where to park.', target:'signalling', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'signalling', wrong:['surviving', 'banning', 'evaluating'] },
        { id:'2', answer:'signalling', wrong:['research', 'surviving', 'differentiating'] },
        { id:'3', answer:'signalling', wrong:['surviving', 'researching', 'banning'] }
      ]
    }),
  e('represent', 'verb',
    'to be a sign or symbol of something, or to speak or act for another person or group',
    ['stand for', 'be a symbol of'],
    ['to make something look more attractive', 'to keep something secret from others', 'to change something so it is easier to use'],
    'On the map, the small blue triangles represent campsites.',
    'stand for', 'On the map, the small blue triangles stand for campsites.',
    'speak for', 'Two students were chosen to speak for their class at the school council.',
    {
      teacherNote:'Verb: (1) to be a sign or symbol of something (the colours represent ...); (2) to speak or act officially for a person or group (represent the school). Both senses are common in Paper 1 texts. The nouns representation and representative and the adjective representative are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'In many emoji sets, a red heart is used to represent love or strong support.', meaning:'to be a sign or symbol of something' },
        { text:'Mei was proud to represent her school at the national debating competition.', meaning:'to speak or act for a group' }
      ],
      situationDistractors:[
        'A boy painted his bedroom wall a brighter colour.',
        'A girl hid her diary under her bed so her brother could not read it.',
        'A teacher made the font on her slides larger so everyone could read it.'
      ],
      retrievalContexts:[
        { id:'1', text:'In the chart, the green bars represent the number of students who walk to school.', target:'represent', grammarPattern:'' },
        { id:'2', text:'The lawyer will represent the family when the case goes to court.', target:'represent', grammarPattern:'' },
        { id:'3', text:'Each star on the flag is meant to represent one of the country’s regions.', target:'represent', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'represent', wrong:['survive', 'evaluate', 'differentiate'] },
        { id:'2', answer:'represent', wrong:['survive', 'suggest', 'research'] },
        { id:'3', answer:'represent', wrong:['survive', 'research', 'suggest'] }
      ]
    }),
  e('effective', 'adjective',
    'working well and producing the result that was wanted',
    ['successful', 'producing the intended result'],
    ['costing a lot of money to use', 'taking a very long time to finish', 'looking modern and attractive'],
    'A short, clear message is often more effective than a long email.',
    'successful', 'A short, clear message is often more successful than a long email.',
    'gets the result you want', 'Eye contact is a way of speaking to an audience that gets the result you want.',
    {
      idKey:'effective_9',
      teacherNote:'Adjective: working well and producing the result that is wanted (an effective way to ..., effective communication). Unit 9 uses it for messages, presentations and ways of communicating; Unit 6 taught it for study methods. Boundary: effective is about results; efficient is about not wasting time or energy. The adverb effectively and the noun effectiveness are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Using simple pictures was an effective way to explain the rules to the younger children.', meaning:'working well to get the result wanted' },
        { text:'The campaign was so effective that the number of students cycling to school doubled.', meaning:'producing the result that was intended' }
      ],
      situationDistractors:[
        'A speaker talked for an hour, but nobody understood his main point.',
        'A poster used tiny writing, so people walked past without reading it.',
        'A boy sent his friend ten messages, but none of them answered her question.'
      ],
      retrievalContexts:[
        { id:'1', text:'Asking questions is an effective way to keep your audience interested.', target:'effective', grammarPattern:'' },
        { id:'2', text:'The new rule about phones in class has been very effective, and lessons are much calmer.', target:'effective', grammarPattern:'' },
        { id:'3', text:'Teachers agree that regular feedback is more effective than one long report at the end of the year.', target:'effective', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'effective', wrong:['banned', 'portable', 'passive'] },
        { id:'2', answer:'effective', wrong:['portable', 'optional', 'virtual'] },
        { id:'3', answer:'effective', wrong:['portable', 'tech-savvy', 'physical'] }
      ]
    }),
  e('portable', 'adjective',
    'light and small enough to be carried or moved easily',
    ['easy to carry', 'light enough to move around'],
    ['too heavy to be lifted by one person', 'fixed firmly to a wall or floor', 'expensive and difficult to repair'],
    'Jun takes a portable speaker to the park so his friends can listen to music.',
    'easy to carry', 'Jun takes a speaker that is easy to carry to the park so his friends can listen to music.',
    'small enough to take anywhere', 'Laptops have become small enough to take anywhere, so many students study on the bus.',
    {
      teacherNote:'Adjective: light and small enough to be carried or moved easily (a portable charger, a portable speaker). Boundary: portable describes size and weight; mobile describes something that moves or works while moving. The noun portability is taught in the Word Family pathway; "portably" is not taught.',
      masteryContexts:[
        { text:'The first portable phones were as heavy as a brick, but today they fit in a pocket.', meaning:'able to be carried around easily' },
        { text:'The school bought a portable whiteboard so teachers can use it in any classroom.', meaning:'light enough to be moved from place to place' }
      ],
      situationDistractors:[
        'Workers fixed a huge television to the wall with strong metal screws.',
        'A family bought a piano so heavy that four people were needed to move it.',
        'The library installed a large printer that stays in one corner of the room.'
      ],
      retrievalContexts:[
        { id:'1', text:'Always carry a portable charger on long trips, in case your phone battery runs out.', target:'portable', grammarPattern:'' },
        { id:'2', text:'The doctor used a portable scanner to examine patients in their homes.', target:'portable', grammarPattern:'' },
        { id:'3', text:'Our grandparents listened to the news on a small portable radio.', target:'portable', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'portable', wrong:['constructive', 'banned', 'non-verbal'] },
        { id:'2', answer:'portable', wrong:['casual', 'tech-savvy', 'informal'] },
        { id:'3', answer:'portable', wrong:['tech-savvy', 'constructive', 'relevant'] }
      ]
    }),
  e('demonstrate', 'verb',
    'to show clearly how something works or how to do something, or to show that something is true',
    ['show how to do', 'prove clearly'],
    ['to explain something only in writing', 'to hide how something works', 'to ask someone to repeat something'],
    'The science teacher will demonstrate how to use the new microscopes.',
    'show how to use', 'The science teacher will show how to use the new microscopes.',
    'prove', 'The survey results prove that most students prefer messaging to calling.',
    {
      idKey:'demonstrate_9',
      teacherNote:'Verb: (1) to show how something works or is done, usually by doing it (demonstrate how to ...); (2) to show clearly that something is true (the study demonstrates that ...). Unit 9 uses it for showing skills and presenting evidence; Unit 7 taught showing qualities in an interview. Boundary: "demonstrate" in the sense of protesting is not taught here. The nouns demonstration and demonstrator are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'At the start of the workshop, the trainer will demonstrate how to set up a video call.', meaning:'to show how to do something by doing it' },
        { text:'These experiments demonstrate that people remember pictures better than words.', meaning:'to show clearly that something is true' }
      ],
      situationDistractors:[
        'A boy read the instructions alone and said nothing to anyone.',
        'A girl refused to tell her friends how she had solved the puzzle.',
        'A student asked the teacher to repeat the homework question.'
      ],
      retrievalContexts:[
        { id:'1', text:'Before the exam, the teacher demonstrated how to plan an essay in five minutes.', target:'demonstrated', grammarPattern:'' },
        { id:'2', text:'The video clearly demonstrates how sign language can be used in everyday situations.', target:'demonstrates', grammarPattern:'' },
        { id:'3', text:'Each candidate was asked to demonstrate one skill in front of the panel.', target:'demonstrate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'demonstrated', wrong:['banned', 'survived', 'launched'] },
        { id:'2', answer:'demonstrates', wrong:['survives', 'bans', 'differentiates'] },
        { id:'3', answer:'demonstrate', wrong:['survive', 'ban', 'differentiate'] }
      ]
    }),
  e('launched', 'verb',
    'started or introduced something new, such as a product, service or campaign, to the public',
    ['introduced to the public', 'started officially'],
    ['stopped selling something because it was unpopular', 'kept something secret from customers', 'repaired something that was broken'],
    'The company launched a new messaging app that translates conversations instantly.',
    'introduced', 'The company introduced a new messaging app that translates conversations instantly.',
    'started officially', 'Last month the school officially started a campaign to reduce screen time.',
    {
      idKey:'launched_9',
      teacherNote:'Verb (past form, as in the coursebook): started or introduced something new to the public (launched an app, launched a campaign, launched a website). Unit 9 uses it for communication products and campaigns; Unit 8 taught it for business products. Boundary: launching a rocket or a ship is a related literal sense, not taught here. The noun launch and the base form launch are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'When the first smartphone was launched, few people imagined how much it would change daily life.', meaning:'introduced to the public for the first time' },
        { text:'The charity launched an online campaign to help elderly people learn to use video calls.', meaning:'started an organised activity officially' }
      ],
      situationDistractors:[
        'A shop stopped selling an old phone model because nobody wanted it.',
        'A company kept its new product hidden until the designers had finished it.',
        'A technician repaired the school’s broken projector.'
      ],
      retrievalContexts:[
        { id:'1', text:'The museum launched a virtual tour so that people could visit from home.', target:'launched', grammarPattern:'' },
        { id:'2', text:'Since the website was launched in May, it has had over a million visitors.', target:'launched', grammarPattern:'' },
        { id:'3', text:'Our school launched a podcast where students interview local business owners.', target:'launched', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'launched', wrong:['survived', 'differentiated', 'signalled'] },
        { id:'2', answer:'launched', wrong:['survived', 'evaluated', 'differentiated'] },
        { id:'3', answer:'launched', wrong:['survived', 'differentiated', 'represented'] }
      ]
    }),
  e('passive', 'adjective',
    'accepting or receiving things without taking an active part or responding',
    ['not actively involved', 'just watching or receiving'],
    ['taking control and making decisions', 'speaking loudly and with confidence', 'working quickly and carefully'],
    'Watching videos all evening is a passive activity, because you do not have to respond.',
    'not active', 'Watching videos all evening is an activity that is not active, because you do not have to respond.',
    'only receiving', 'In old-style lectures, students were only receiving information and rarely asked questions.',
    {
      idKey:'passive_9',
      teacherNote:'Adjective: accepting or receiving without taking an active part (passive viewers, a passive audience, passive learning). Unit 9 contrasts passive with interactive communication; Unit 6 taught it for study habits. Boundary: the grammar term "passive voice" is related but not the target here. The adverb passively and the noun passivity are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Television made audiences passive, but social media lets them comment and share.', meaning:'only receiving, without taking part' },
        { text:'Instead of being passive listeners, the students were asked to discuss the talk in groups.', meaning:'not actively involved' }
      ],
      situationDistractors:[
        'A student put up her hand and asked the speaker three questions.',
        'A boy organised the whole class trip and phoned the museum himself.',
        'A girl argued strongly in the debate and changed the audience’s minds.'
      ],
      retrievalContexts:[
        { id:'1', text:'Experts warn that too much passive screen time can affect children’s concentration.', target:'passive', grammarPattern:'' },
        { id:'2', text:'The museum wanted visitors to touch and try things rather than be passive observers.', target:'passive', grammarPattern:'' },
        { id:'3', text:'In a passive role, you simply accept what you are told without asking questions.', target:'passive', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'passive', wrong:['portable', 'face-to-face', 'banned'] },
        { id:'2', answer:'passive', wrong:['portable', 'relevant', 'optional'] },
        { id:'3', answer:'passive', wrong:['portable', 'tech-savvy', 'banned'] }
      ]
    }),
  e('interactive', 'adjective',
    'allowing information to pass in both directions, so that the user or audience can respond and take part',
    ['two-way', 'involving the user'],
    ['designed only to be watched or listened to', 'too difficult for beginners to use', 'working without electricity'],
    'The interactive map lets visitors click on a city to see photos and facts.',
    'responds to the user', 'The map responds to the user, so visitors can click on a city to see photos and facts.',
    'two-way', 'Video calls are a two-way form of communication, unlike a radio broadcast.',
    {
      idKey:'interactive_9',
      teacherNote:'Adjective: allowing two-way exchange, so users or an audience can respond and take part (an interactive whiteboard, an interactive lesson, interactive websites). Unit 9 contrasts interactive with passive communication; Unit 2 taught it for digital media. The verb interact and the noun interaction are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The teacher used an interactive quiz, so every student answered on their phone and saw the results at once.', meaning:'allowing users to respond and take part' },
        { text:'Unlike a printed newspaper, the website is interactive: readers can leave comments and vote in polls.', meaning:'allowing information to pass in both directions' }
      ],
      situationDistractors:[
        'An audience sat in silence and watched a film from start to finish.',
        'A girl read a printed leaflet that gave her no way to ask questions.',
        'A radio station played music all night without any phone-ins.'
      ],
      retrievalContexts:[
        { id:'1', text:'Children learn more from interactive games than from simply watching cartoons.', target:'interactive', grammarPattern:'' },
        { id:'2', text:'The science museum has an interactive display where you can control a model robot.', target:'interactive', grammarPattern:'' },
        { id:'3', text:'The talk was very interactive, with the audience answering questions throughout.', target:'interactive', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'interactive', wrong:['banned', 'passive', 'underlying'] },
        { id:'2', answer:'interactive', wrong:['banned', 'casual', 'underlying'] },
        { id:'3', answer:'interactive', wrong:['portable', 'underlying', 'banned'] }
      ]
    }),
  e('tech-savvy', 'adjective',
    'knowing a lot about modern technology and able to use it confidently',
    ['good with technology', 'confident using computers and devices'],
    ['afraid of using new machines', 'working in a factory that makes computers', 'interested only in old-fashioned things'],
    'My tech-savvy younger brother set up the new router in five minutes.',
    'good with technology', 'My younger brother, who is good with technology, set up the new router in five minutes.',
    'confident with devices', 'Most teenagers are confident with devices and learn new apps very quickly.',
    {
      teacherNote:'Adjective (hyphenated, informal): knowing a lot about modern technology and using it confidently (a tech-savvy generation, tech-savvy users). Often used before a noun or after be/become. It has no useful word family (savvy alone is informal and rare at this level), so Word Families is not counted for it.',
      masteryContexts:[
        { text:'The bank designed its app for tech-savvy customers who never want to visit a branch.', meaning:'confident and skilled with modern technology' },
        { text:'Grandma has become quite tech-savvy since she started video-calling her grandchildren.', meaning:'able to use modern devices well' }
      ],
      situationDistractors:[
        'An old man refused to use a mobile phone because he found it confusing.',
        'A girl asked her friend for help every time her laptop showed an error.',
        'A man still writes all his letters by hand and has never sent an email.'
      ],
      retrievalContexts:[
        { id:'1', text:'Even tech-savvy users can be tricked by fake messages that look real.', target:'tech-savvy', grammarPattern:'' },
        { id:'2', text:'The company hires tech-savvy graduates to manage its social media accounts.', target:'tech-savvy', grammarPattern:'' },
        { id:'3', text:'You do not need to be tech-savvy to use this app, because the instructions are very simple.', target:'tech-savvy', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'tech-savvy', wrong:['banned', 'optional', 'underlying'] },
        { id:'2', answer:'tech-savvy', wrong:['banned', 'underlying', 'optional'] },
        { id:'3', answer:'tech-savvy', wrong:['banned', 'portable', 'underlying'] }
      ]
    }),
  e('digital native', 'noun',
    'a person who has grown up using computers, the internet and mobile phones',
    ['someone raised with technology', 'a person who grew up online'],
    ['a person who builds computers for a living', 'someone who refuses to use the internet', 'a person who was born in a different country'],
    'As a digital native, Ana has never known a world without smartphones.',
    'someone who grew up with technology', 'As someone who grew up with technology, Ana has never known a world without smartphones.',
    'grew up with the internet', 'Children born after 2010 grew up with the internet and use touchscreens before they can read.',
    {
      teacherNote:'Noun phrase (countable): a person who has grown up surrounded by digital technology (digital natives, a generation of digital natives). Contrast with older people who learned technology as adults. It is a fixed phrase, so Word Families is not counted for it.',
      masteryContexts:[
        { text:'Teachers sometimes assume that a digital native knows how to search online safely, but this is not always true.', meaning:'young people who have grown up with digital technology' },
        { text:'My parents learned to use computers at work, but my sister is a true digital native.', meaning:'a person who has used technology since childhood' }
      ],
      situationDistractors:[
        'A man used his first computer when he was forty and still finds it difficult.',
        'A woman moved to a new country and learned to speak the local language.',
        'An engineer spends every day designing parts for laptops.'
      ],
      retrievalContexts:[
        { id:'1', text:'Being a digital native does not automatically make you good at judging online information.', target:'digital native', grammarPattern:'' },
        { id:'2', text:'Most of my students are digital natives who have had a phone since primary school.', target:'digital natives', grammarPattern:'' },
        { id:'3', text:'The game was designed for digital natives, so it has no written instructions at all.', target:'digital natives', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'digital native', wrong:['conclusion', 'reporting verb', 'clause'] },
        { id:'2', answer:'digital natives', wrong:['conferences', 'clauses', 'conclusions'] },
        { id:'3', answer:'digital natives', wrong:['conclusions', 'clauses', 'direct objects'] }
      ]
    }),
  e('accuracy', 'noun',
    'the quality of being correct and exact, without mistakes',
    ['correctness', 'being exact'],
    ['the speed at which something is done', 'the amount of money something costs', 'the feeling of being confident'],
    'Journalists must check the accuracy of their facts before a story is published.',
    'correctness', 'Journalists must check the correctness of their facts before a story is published.',
    'how exact', 'The examiners judge how exact your grammar and spelling are, as well as your ideas.',
    {
      teacherNote:'Noun (uncountable): the quality of being correct and exact (accuracy of information, with great accuracy, check the accuracy). Boundary: accuracy is about being correct; fluency is about speaking smoothly; the two are often contrasted in language learning. The adjective accurate, the adverb accurately and the opposites inaccurate/inaccuracy are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Translation apps have improved, but their accuracy is still a problem with informal language.', meaning:'how correct and exact something is' },
        { text:'In the writing paper, marks are given for both content and language accuracy.', meaning:'correctness without mistakes' }
      ],
      situationDistractors:[
        'A boy finished his test very quickly without checking any answers.',
        'A girl felt nervous before her speech, even though she was well prepared.',
        'A family compared the prices of three phones before choosing one.'
      ],
      retrievalContexts:[
        { id:'1', text:'Before you share a news story online, think about the accuracy of the information.', target:'accuracy', grammarPattern:'' },
        { id:'2', text:'The weather forecast predicted the storm with surprising accuracy.', target:'accuracy', grammarPattern:'' },
        { id:'3', text:'When learning a language, accuracy and fluency are both important.', target:'accuracy', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'accuracy', wrong:['workforce', 'frustration', 'audience'] },
        { id:'2', answer:'accuracy', wrong:['frustration', 'generation', 'community'] },
        { id:'3', answer:'accuracy', wrong:['workforce', 'community', 'conference'] }
      ]
    }),
  e('appropriate', 'adjective',
    'suitable or right for a particular situation, person or purpose',
    ['suitable', 'right for the situation'],
    ['very expensive and fashionable', 'strange and difficult to understand', 'old and no longer used'],
    'Jeans are not appropriate for a formal job interview.',
    'suitable', 'Jeans are not suitable for a formal job interview.',
    'right for the occasion', 'Choose words that are right for the occasion when you write to your head teacher.',
    {
      teacherNote:'Adjective: suitable or right for a particular situation (appropriate for/to, appropriate language, appropriate behaviour). Very common in exam rubrics about register. Boundary: appropriate and suitable are close synonyms; Precision items show where each sounds natural. The opposite inappropriate and the adverb appropriately are taught in the Word Family pathway. Note: the verb "appropriate" (take for yourself) is a different word and is not taught.',
      masteryContexts:[
        { text:'Slang is fine in a text to a friend, but it is not appropriate in an email to your teacher.', meaning:'suitable for the situation' },
        { text:'The film is not appropriate for young children because it contains violence.', meaning:'right or acceptable for a particular person' }
      ],
      situationDistractors:[
        'A girl wore a beautiful new dress that cost a lot of money.',
        'A student used a very old textbook that the school no longer uses.',
        'A boy told a joke that nobody in the class understood.'
      ],
      retrievalContexts:[
        { id:'1', text:'It is important to use an appropriate tone when you write a letter of complaint.', target:'appropriate', grammarPattern:'' },
        { id:'2', text:'Please wear appropriate clothing for the science lab, including closed shoes.', target:'appropriate', grammarPattern:'' },
        { id:'3', text:'The teacher said that laughing during the ceremony was not appropriate.', target:'appropriate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'appropriate', wrong:['tech-savvy', 'portable', 'banned'] },
        { id:'2', answer:'appropriate', wrong:['tech-savvy', 'interactive', 'underlying'] },
        { id:'3', answer:'appropriate', wrong:['portable', 'tech-savvy', 'virtual'] }
      ]
    }),
  e('banned', 'adjective',
    'officially not allowed by a rule or law',
    ['not allowed', 'officially forbidden'],
    ['strongly recommended by teachers', 'available only to adults', 'newly invented and popular'],
    'Mobile phones are banned during exams, and anyone caught with one will fail.',
    'not allowed', 'Mobile phones are not allowed during exams, and anyone caught with one will fail.',
    'forbidden', 'Several countries have forbidden the use of some social media apps.',
    {
      teacherNote:'Adjective / past participle: officially not allowed (banned from ..., banned in ..., a banned substance). Usually used after be (are banned) or before a noun (a banned app). Boundary: banned is an official rule; discouraged only means advised against. The base verb ban and the noun ban are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'In some schools, smartphones are banned from the classroom to help students concentrate.', meaning:'officially not allowed' },
        { text:'The player was banned from the next three matches for arguing with the referee.', meaning:'officially stopped from doing something' }
      ],
      situationDistractors:[
        'The teacher strongly recommended that everyone read the novel.',
        'A new game became so popular that all the shops sold out.',
        'The library let students borrow laptops for the weekend.'
      ],
      retrievalContexts:[
        { id:'1', text:'Smoking has been banned in all restaurants and cafés in the city.', target:'banned', grammarPattern:'' },
        { id:'2', text:'The app was banned in several countries because of privacy concerns.', target:'banned', grammarPattern:'' },
        { id:'3', text:'Students who cheat may be banned from taking part in future competitions.', target:'banned', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'banned', wrong:['launched', 'evaluated', 'represented'] },
        { id:'2', answer:'banned', wrong:['interactive', 'portable', 'tech-savvy'] },
        { id:'3', answer:'banned', wrong:['launched', 'evaluated', 'suggested'] }
      ]
    }),
  e('community', 'noun',
    'a group of people who live in the same area or share the same interests',
    ['local group of people', 'people with shared interests'],
    ['a large company that makes and sells products', 'a single person who lives alone', 'a building where meetings are held'],
    'The online gaming community helped Leo feel less lonely after he moved city.',
    'group of people with shared interests', 'The online group of people with the same interest in gaming helped Leo feel less lonely after he moved city.',
    'local people', 'The local people raised money to repair the old library.',
    {
      teacherNote:'Noun (countable, also used collectively): a group of people living in one area or sharing interests (the local community, an online community, community centre). Boundary: a community is people; a building where it meets is a community centre. The adjective communal is related but not taught; Word Families is not counted for community.',
      masteryContexts:[
        { text:'Social media allows people with rare hobbies to find a community of others who share their interest.', meaning:'a group of people with the same interests' },
        { text:'After the earthquake, the whole community worked together to rebuild homes.', meaning:'the people who live in one area' }
      ],
      situationDistractors:[
        'An old woman lives alone on a farm far from any village.',
        'A large company opened a new factory and hired engineers.',
        'A boy spent the weekend playing a computer game by himself.'
      ],
      retrievalContexts:[
        { id:'1', text:'The festival brings the whole community together every summer.', target:'community', grammarPattern:'' },
        { id:'2', text:'Members of the online community answer each other’s questions about coding.', target:'community', grammarPattern:'' },
        { id:'3', text:'Volunteers at the community centre teach older people to use smartphones.', target:'community', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'community', wrong:['accuracy', 'perception', 'frustration'] },
        { id:'2', answer:'community', wrong:['accuracy', 'frustration', 'conclusion'] },
        { id:'3', answer:'community', wrong:['accuracy', 'perception', 'frustration'] }
      ]
    }),
  e('optional', 'adjective',
    'available to choose, but not required or compulsory',
    ['not compulsory', 'a matter of choice'],
    ['required by law for everyone', 'cancelled because of bad weather', 'extremely difficult to complete'],
    'The extra reading is optional, but it will help you understand the topic better.',
    'not compulsory', 'The extra reading is not compulsory, but it will help you understand the topic better.',
    'you can choose', 'You can choose whether to go on the weekend trip.',
    {
      teacherNote:'Adjective: available to choose but not required (an optional subject, optional extras, it is optional to ...). Opposite: compulsory / required. The noun option and the adverb optionally are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'In our school, music is optional after Year 9, so students can drop it if they prefer.', meaning:'not compulsory; you can choose' },
        { text:'Wearing a tie is optional on Fridays, but most teachers still wear one.', meaning:'a choice, not a rule' }
      ],
      situationDistractors:[
        'Every driver must wear a seat belt, or they will be fined.',
        'All students had to sit the final exam on the same morning.',
        'The match was cancelled because of heavy rain.'
      ],
      retrievalContexts:[
        { id:'1', text:'Attendance at the after-school club is optional, but places are limited.', target:'optional', grammarPattern:'' },
        { id:'2', text:'The app is free, and paying for extra features is optional.', target:'optional', grammarPattern:'' },
        { id:'3', text:'Question 5 is optional, so only answer it if you have time.', target:'optional', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'optional', wrong:['tech-savvy', 'portable', 'non-verbal'] },
        { id:'2', answer:'optional', wrong:['tech-savvy', 'non-verbal', 'face-to-face'] },
        { id:'3', answer:'optional', wrong:['tech-savvy', 'portable', 'non-verbal'] }
      ]
    }),
  e('survive', 'verb',
    'to continue to exist or be used, especially when there is a danger that something will disappear',
    ['continue to exist', 'last'],
    ['to become suddenly very popular', 'to be invented for the first time', 'to be copied without permission'],
    'Some experts think that printed newspapers will not survive for another twenty years.',
    'continue to exist', 'Some experts think that printed newspapers will not continue to exist for another twenty years.',
    'still exist', 'Very few letters from that period still exist today.',
    {
      teacherNote:'Verb: to continue to exist or live, especially despite danger or difficulty (survive the crisis, survive for years, will a tradition survive?). Unit 9 uses it for languages, traditions and old forms of communication. The noun survival and the noun survivor are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Many small languages may not survive if young people stop speaking them.', meaning:'to continue to exist' },
        { text:'Experts were amazed that any of the ancient paintings could survive the fire in the museum.', meaning:'to remain after something dangerous has happened' }
      ],
      situationDistractors:[
        'A new app became popular with millions of users in a single week.',
        'An inventor created the first telephone in a small workshop.',
        'A student copied a photo from a website without asking permission.'
      ],
      retrievalContexts:[
        { id:'1', text:'Handwritten letters have survived as a way to show that you really care about someone.', target:'survived', grammarPattern:'' },
        { id:'2', text:'Small shops are finding it hard to survive since online shopping became popular.', target:'survive', grammarPattern:'' },
        { id:'3', text:'Only three copies of the original recording are known to survive.', target:'survive', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'survived', wrong:['banned', 'recommended', 'evaluated'] },
        { id:'2', answer:'survive', wrong:['ban', 'evaluate', 'recommend'] },
        { id:'3', answer:'survive', wrong:['ban', 'recommend', 'evaluate'] }
      ]
    }),
  e('unlike', 'preposition',
    'different from someone or something, or in contrast to them',
    ['in contrast to', 'different from'],
    ['in the same way as', 'because of', 'at the same time as'],
    'Unlike his sister, Tom prefers phoning people to sending messages.',
    'in contrast to', 'In contrast to his sister, Tom prefers phoning people to sending messages.',
    'different from', 'Emails are different from text messages because they are usually longer and more formal.',
    {
      teacherNote:'Preposition: different from, or in contrast to (Unlike X, Y ...; X, unlike Y, ...). Very useful for comparing in writing. Boundary: unlike is a preposition, so it is followed by a noun or pronoun, not a clause (*unlike he does). It is a function word with no useful family here, so Word Families is not counted; the adjective unlikely is a different word.',
      masteryContexts:[
        { text:'An email, unlike a phone call, gives you time to think carefully about what you want to say.', meaning:'in contrast to' },
        { text:'Our new teacher, unlike the previous one, lets us use dictionaries in tests.', meaning:'different from' }
      ],
      situationDistractors:[
        'Both twins love football and support the same team.',
        'The two phones have exactly the same features and price.',
        'Like her mother, Sara wants to become a doctor.'
      ],
      retrievalContexts:[
        { id:'1', text:'Many teenagers, unlike older people, rarely use their phones to make calls.', target:'unlike', grammarPattern:'' },
        { id:'2', text:'Body language, unlike spoken words, is often used without thinking.', target:'unlike', grammarPattern:'' },
        { id:'3', text:'E-books, unlike printed books, can be updated after they are published.', target:'unlike', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'unlike', wrong:['optional', 'casual', 'banned'] },
        { id:'2', answer:'unlike', wrong:['optional', 'banned', 'portable'] },
        { id:'3', answer:'unlike', wrong:['optional', 'portable', 'banned'] }
      ]
    }),
  e('frustration', 'noun',
    'the feeling of being annoyed or upset because you cannot do or achieve what you want',
    ['annoyance', 'feeling of being blocked'],
    ['a feeling of great happiness', 'the feeling of being frightened', 'a feeling of being very tired'],
    'Slow internet is a common cause of frustration for students working from home.',
    'annoyance', 'Slow internet is a common cause of annoyance for students working from home.',
    'feeling annoyed', 'Kai shouted out of feeling annoyed when his computer crashed again.',
    {
      teacherNote:'Noun: the feeling of being annoyed or upset because you cannot achieve something (in frustration, a source of frustration, frustration with/at). Boundary: frustration comes from being blocked or unable; anger is wider; disappointment comes from results being worse than expected. The verb frustrate and the adjectives frustrated/frustrating are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'After trying to explain the problem three times, the customer sighed with frustration.', meaning:'annoyance because something is not working' },
        { text:'Not being able to express yourself in a new language can cause great frustration.', meaning:'the feeling of being unable to do what you want' }
      ],
      situationDistractors:[
        'A girl smiled widely when she heard she had won the competition.',
        'A boy felt sleepy after staying up late to finish a film.',
        'A child hid under the bed during a loud thunderstorm.'
      ],
      retrievalContexts:[
        { id:'1', text:'She threw her pen down in frustration when she could not solve the maths problem.', target:'frustration', grammarPattern:'' },
        { id:'2', text:'Long waiting times on the helpline are a major source of frustration for customers.', target:'frustration', grammarPattern:'' },
        { id:'3', text:'The players showed their frustration after the referee refused to give a penalty.', target:'frustration', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'frustration', wrong:['accuracy', 'research', 'introduction'] },
        { id:'2', answer:'frustration', wrong:['accuracy', 'introduction', 'research'] },
        { id:'3', answer:'frustration', wrong:['accuracy', 'research', 'introduction'] }
      ]
    }),
  e('informal', 'adjective',
    'relaxed and friendly, not following strict or official rules',
    ['relaxed', 'not official'],
    ['very serious and polite', 'following strict official rules', 'written for a scientific journal'],
    'The meeting was informal, so we sat on sofas and chatted over coffee.',
    'relaxed', 'The meeting was relaxed, so we sat on sofas and chatted over coffee.',
    'not official', 'We had a friendly, not official talk with the head teacher about the trip.',
    {
      teacherNote:'Adjective: relaxed, friendly and not following strict rules (an informal meeting, informal clothes, informal email). Boundary: informal describes the situation or style; casual is especially used for clothes and attitudes. The opposite formal, the adverb informally and the noun informality are taught in the Word Family pathway. The fixed phrase "informal language" is taught as a separate target.',
      masteryContexts:[
        { text:'An email to a close friend can be informal, with short sentences and contractions.', meaning:'relaxed in style' },
        { text:'Before the official interview, there was an informal chat to help candidates relax.', meaning:'not official or following strict rules' }
      ],
      situationDistractors:[
        'The president gave a serious speech at a state ceremony.',
        'A lawyer wrote an official letter using legal language.',
        'A scientist published a detailed report in a university journal.'
      ],
      retrievalContexts:[
        { id:'1', text:'Text messages are usually informal, so it is fine to use short forms like "thx".', target:'informal', grammarPattern:'' },
        { id:'2', text:'The club holds informal meetings in a café every Friday.', target:'informal', grammarPattern:'' },
        { id:'3', text:'Avoid an informal tone when you write a formal letter of complaint.', target:'informal', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'informal', wrong:['banned', 'portable', 'tech-savvy'] },
        { id:'2', answer:'informal', wrong:['portable', 'tech-savvy', 'banned'] },
        { id:'3', answer:'informal', wrong:['portable', 'banned', 'tech-savvy'] }
      ]
    }),
  e('casual', 'adjective',
    'relaxed and not formal, especially in style, clothes or behaviour',
    ['relaxed', 'not formal'],
    ['carefully planned in great detail', 'smart and suitable for a ceremony', 'very serious and strict'],
    'Many technology companies let staff wear casual clothes such as jeans and trainers.',
    'relaxed', 'Many technology companies let staff wear relaxed clothes such as jeans and trainers.',
    'not formal', 'His tone in the email was too relaxed and not formal enough for a job application.',
    {
      teacherNote:'Adjective: relaxed and not formal (casual clothes, a casual conversation, casual style). Boundary: casual often describes clothes and manner; informal often describes language and situations; both are opposites of formal. A second meaning, "not regular" (casual work), is not taught here. The adverb casually is taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The party is casual, so there is no need to wear a suit.', meaning:'relaxed and not formal' },
        { text:'Her casual greeting, "Hey, how’s it going?", surprised the new manager.', meaning:'relaxed in manner' }
      ],
      situationDistractors:[
        'A man wore a suit and tie to a wedding ceremony.',
        'A student planned every minute of her presentation carefully.',
        'A judge spoke seriously to the court.'
      ],
      retrievalContexts:[
        { id:'1', text:'On Fridays, staff are allowed to come to work in casual clothes.', target:'casual', grammarPattern:'' },
        { id:'2', text:'We had a casual conversation about films while we waited for the bus.', target:'casual', grammarPattern:'' },
        { id:'3', text:'Some people think a casual style of writing is not suitable for business emails.', target:'casual', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'casual', wrong:['banned', 'underlying', 'tech-savvy'] },
        { id:'2', answer:'casual', wrong:['banned', 'portable', 'underlying'] },
        { id:'3', answer:'casual', wrong:['banned', 'portable', 'tech-savvy'] }
      ]
    }),
  e('workforce', 'noun',
    'all the people who work in a company, industry or country',
    ['all the workers', 'the employees'],
    ['the machines used in a factory', 'the money a company earns', 'the people who buy a product'],
    'Half of the company’s workforce now works from home at least two days a week.',
    'all the workers', 'Half of all the company’s workers now work from home at least two days a week.',
    'employees', 'Almost all of the factory’s employees are under thirty.',
    {
      teacherNote:'Noun (usually singular): all the people who work for a company, in an industry or in a country (the workforce, a skilled workforce, join the workforce). Can take a singular or plural verb in British English. It is a compound with no useful taught family, so Word Families is not counted.',
      masteryContexts:[
        { text:'As digital natives join the workforce, offices are using more messaging apps and fewer phones.', meaning:'all the people who work' },
        { text:'The factory plans to train its entire workforce to use the new machines.', meaning:'all the employees of a company' }
      ],
      situationDistractors:[
        'A company bought three new robots for its packing line.',
        'A shop counted how much money it had made in a month.',
        'Hundreds of customers queued to buy a new phone.'
      ],
      retrievalContexts:[
        { id:'1', text:'The country needs a well-educated workforce to compete in the technology industry.', target:'workforce', grammarPattern:'' },
        { id:'2', text:'Women now make up nearly half of the workforce in many countries.', target:'workforce', grammarPattern:'' },
        { id:'3', text:'The company asked its workforce for ideas about improving communication.', target:'workforce', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'workforce', wrong:['accuracy', 'frustration', 'perception'] },
        { id:'2', answer:'workforce', wrong:['accuracy', 'perception', 'frustration'] },
        { id:'3', answer:'workforce', wrong:['accuracy', 'frustration', 'perception'] }
      ]
    }),
  e('generation', 'noun',
    'all the people born and living at about the same time, considered as a group',
    ['age group', 'people born around the same time'],
    ['a family that lives in the same house', 'a group of people who work together', 'a period of ten years'],
    'My grandparents’ generation wrote letters, while my generation sends voice messages.',
    'age group', 'My grandparents’ age group wrote letters, while people my age send voice messages.',
    'people born around the same time', 'People born around the same time often share the same taste in music.',
    {
      idKey:'generation_9',
      teacherNote:'Noun (countable): all the people born at about the same time (the younger generation, my parents’ generation, a generation gap). Unit 9 uses it for differences in communication between age groups; Unit 1 taught it for sports and free time. The verb generate is a different sense and is not taught here; Word Families is not counted for this sense.',
      masteryContexts:[
        { text:'Each new generation seems to invent its own slang words.', meaning:'people born and growing up at the same time' },
        { text:'My grandparents’ generation prefers phone calls, while we prefer messages.', meaning:'the people of one age group considered together' }
      ],
      situationDistractors:[
        'A group of colleagues from different ages worked on a project together.',
        'A family of four lives in a small flat in the city.',
        'A decade passed between the first and second versions of the game.'
      ],
      retrievalContexts:[
        { id:'1', text:'The younger generation is more comfortable with video calls than with phone calls.', target:'generation', grammarPattern:'' },
        { id:'2', text:'Three generations of the family live together: grandparents, parents and children.', target:'generations', grammarPattern:'' },
        { id:'3', text:'Each generation faces different challenges when it enters the workforce.', target:'generation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'generation', wrong:['accuracy', 'frustration', 'purpose'] },
        { id:'2', answer:'generations', wrong:['accuracies', 'frustrations', 'purposes'] },
        { id:'3', answer:'generation', wrong:['accuracy', 'frustration', 'perception'] }
      ]
    }),
  e('perception', 'noun',
    'the way that someone thinks about or understands something or someone',
    ['view', 'impression'],
    ['a fact that has been proved by research', 'the ability to work quickly', 'a feeling of physical pain'],
    'Social media can change our perception of what a normal life looks like.',
    'view', 'Social media can change our view of what a normal life looks like.',
    'impression', 'Your first impression of a person is often based on their body language.',
    {
      teacherNote:'Noun: the way someone thinks about or understands something (public perception, perception of/that, change people’s perceptions). Boundary: a perception is an opinion or impression, not necessarily a fact. A second meaning, noticing with the senses, is related but not the focus. The verb perceive and the adjective perceptive are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The public perception of video games has changed: many people now see them as a form of art.', meaning:'the way people think about something' },
        { text:'Her perception that nobody liked her turned out to be completely wrong.', meaning:'a belief or impression about a situation' }
      ],
      situationDistractors:[
        'Scientists proved that the new medicine worked in a large study.',
        'A boy typed so quickly that he finished first in the class.',
        'A girl hurt her ankle while running and had to stop.'
      ],
      retrievalContexts:[
        { id:'1', text:'Advertising can strongly influence our perception of a brand.', target:'perception', grammarPattern:'' },
        { id:'2', text:'There is a common perception that teenagers spend too much time on their phones.', target:'perception', grammarPattern:'' },
        { id:'3', text:'Meeting the team face-to-face completely changed my perception of them.', target:'perception', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'perception', wrong:['workforce', 'accuracy', 'conference'] },
        { id:'2', answer:'perception', wrong:['workforce', 'conference', 'introduction'] },
        { id:'3', answer:'perception', wrong:['workforce', 'conference', 'accuracy'] }
      ]
    }),
  e('non-verbal', 'adjective',
    'not using words or speech, for example using gestures, facial expressions or body language',
    ['without words', 'using body language'],
    ['written down on paper', 'spoken very loudly', 'using difficult vocabulary'],
    'A smile is a powerful form of non-verbal communication.',
    'without words', 'A smile is a powerful way of communicating without words.',
    'body language', 'Her body language showed that she was nervous before the interview.',
    {
      teacherNote:'Adjective (hyphenated): not using words (non-verbal communication, non-verbal signals, non-verbal cues). Includes gestures, facial expressions, eye contact and posture. Opposite: verbal. It is a compound with no taught family, so Word Families is not counted.',
      masteryContexts:[
        { text:'Crossing your arms is a non-verbal signal that some people read as unfriendly.', meaning:'communicated without words' },
        { text:'Video calls make it harder to notice non-verbal cues such as small changes in someone’s face.', meaning:'using body language rather than speech' }
      ],
      situationDistractors:[
        'A student wrote a detailed letter of complaint to the council.',
        'A boy shouted the answer across the classroom.',
        'A lecturer used many long technical words in his talk.'
      ],
      retrievalContexts:[
        { id:'1', text:'Eye contact and nodding are important non-verbal ways of showing that you are listening.', target:'non-verbal', grammarPattern:'' },
        { id:'2', text:'In some cultures, certain non-verbal gestures can be considered rude.', target:'non-verbal', grammarPattern:'' },
        { id:'3', text:'Babies use non-verbal communication, such as crying and smiling, long before they can speak.', target:'non-verbal', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'non-verbal', wrong:['portable', 'banned', 'tech-savvy'] },
        { id:'2', answer:'non-verbal', wrong:['portable', 'tech-savvy', 'optional'] },
        { id:'3', answer:'non-verbal', wrong:['portable', 'banned', 'optional'] }
      ]
    }),
  e('underlying', 'adjective',
    'real and important, but not immediately obvious or easy to see',
    ['hidden but real', 'basic and not obvious'],
    ['clearly written on the surface', 'unimportant and easy to ignore', 'added at the last minute'],
    'The underlying reason for the argument was that both friends felt ignored.',
    'real but hidden', 'The real but hidden reason for the argument was that both friends felt ignored.',
    'basic', 'The basic cause of the problem was poor communication between departments.',
    {
      teacherNote:'Adjective (always before a noun): real and important but not obvious (the underlying cause/reason/problem/message). Boundary: underlying is about what lies beneath the surface; obvious is the opposite. The fixed phrase "underlying meaning" is taught as a separate target. The verb underlie is formal and rare at this level, so Word Families is not counted.',
      masteryContexts:[
        { text:'Doctors try to treat the underlying cause of an illness, not just the symptoms.', meaning:'the real cause that is not immediately obvious' },
        { text:'The advert looks funny, but its underlying message is about road safety.', meaning:'hidden beneath the surface but important' }
      ],
      situationDistractors:[
        'The instructions were printed in large letters on the front of the box.',
        'A teacher ignored a small spelling mistake because it did not matter.',
        'A student added one extra sentence just before handing in her essay.'
      ],
      retrievalContexts:[
        { id:'1', text:'The teacher wanted to understand the underlying reasons for the student’s poor attendance.', target:'underlying', grammarPattern:'' },
        { id:'2', text:'Many arguments online have an underlying problem: people do not read the whole message.', target:'underlying', grammarPattern:'' },
        { id:'3', text:'Fixing the app’s design did not solve the underlying problem of slow servers.', target:'underlying', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'underlying', wrong:['portable', 'tech-savvy', 'banned'] },
        { id:'2', answer:'underlying', wrong:['portable', 'tech-savvy', 'optional'] },
        { id:'3', answer:'underlying', wrong:['portable', 'tech-savvy', 'casual'] }
      ]
    }),
  e('differentiate', 'verb',
    'to see or show the difference between two or more things or people',
    ['tell the difference', 'distinguish'],
    ['to make two things exactly the same', 'to join two groups together', 'to forget which thing is which'],
    'Young children sometimes cannot differentiate between adverts and normal videos.',
    'tell the difference', 'Young children sometimes cannot tell the difference between adverts and normal videos.',
    'distinguish', 'It can be hard to distinguish real news from fake stories online.',
    {
      teacherNote:'Verb: to see or show the difference between things (differentiate between A and B, differentiate A from B). Boundary: differentiate and distinguish are close synonyms; both are more formal than "tell the difference". The noun differentiation is taught in the Word Family pathway; the related noun difference and adjective different are also used there.',
      masteryContexts:[
        { text:'A good reader can differentiate between facts and the writer’s opinions.', meaning:'to recognise how two things are not the same' },
        { text:'The new phone tries to differentiate itself from competitors with a much better camera.', meaning:'to show how something is not the same as others' }
      ],
      situationDistractors:[
        'A factory made thousands of identical bottles every day.',
        'Two schools joined together to form one large school.',
        'A boy mixed up his twin cousins’ names all evening.'
      ],
      retrievalContexts:[
        { id:'1', text:'It is important to differentiate between formal and informal language when writing emails.', target:'differentiate', grammarPattern:'' },
        { id:'2', text:'Some colour-blind people cannot differentiate red from green.', target:'differentiate', grammarPattern:'' },
        { id:'3', text:'The examiner must differentiate between strong and weak answers fairly.', target:'differentiate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'differentiate', wrong:['survive', 'launch', 'ban'] },
        { id:'2', answer:'differentiate', wrong:['survive', 'launch', 'recommend'] },
        { id:'3', answer:'differentiate', wrong:['survive', 'launch', 'ban'] }
      ]
    }),
  e('physical', 'adjective',
    'existing in a form that you can touch or see, not digital or imagined',
    ['real and solid', 'not digital'],
    ['existing only on a computer', 'imagined and not real', 'related to feelings and thoughts'],
    'Some people still prefer physical books to e-books because they like turning the pages.',
    'real, printed', 'Some people still prefer real, printed books to e-books because they like turning the pages.',
    'actual', 'The company has no actual shop; everything is sold online.',
    {
      teacherNote:'Adjective: existing in a real, touchable form rather than digitally or in the mind (a physical shop, physical copy, physical contact). Unit 9 uses it to contrast with virtual and digital. A second meaning, relating to the body (physical exercise), is common but not the focus here. The adverb physically is taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Many banks have closed their physical branches because customers now bank online.', meaning:'existing as a real building, not online' },
        { text:'Teenagers send thousands of messages, but they still need physical contact with friends.', meaning:'real and in person rather than digital' }
      ],
      situationDistractors:[
        'A student kept all her notes in a cloud folder on her laptop.',
        'A child invented an imaginary friend to talk to.',
        'A girl felt happy when she remembered her holiday.'
      ],
      retrievalContexts:[
        { id:'1', text:'The museum has a physical collection and a virtual tour on its website.', target:'physical', grammarPattern:'' },
        { id:'2', text:'Please bring a physical copy of your passport, not a photo on your phone.', target:'physical', grammarPattern:'' },
        { id:'3', text:'Online stores have reduced the number of people visiting physical shops.', target:'physical', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'physical', wrong:['banned', 'tech-savvy', 'underlying'] },
        { id:'2', answer:'physical', wrong:['banned', 'tech-savvy', 'underlying'] },
        { id:'3', answer:'physical', wrong:['banned', 'tech-savvy', 'underlying'] }
      ]
    }),
  e('platform', 'noun',
    'a website, app or system that people use to communicate, share content or offer services',
    ['online service', 'website or app for sharing'],
    ['a large piece of computer equipment', 'a person who writes software', 'a password used to protect an account'],
    'The school uses an online platform where teachers post homework and students submit it.',
    'online service', 'The school uses an online service where teachers post homework and students submit it.',
    'app', 'Which app do you use most to share photos with friends?',
    {
      teacherNote:'Noun (countable): a website, app or digital system that people use to communicate or share content (a social media platform, an online platform, a learning platform). Boundary: a railway platform or a stage platform are other meanings, not taught here. It has no useful taught family, so Word Families is not counted.',
      masteryContexts:[
        { text:'Each social media platform attracts a slightly different age group.', meaning:'a website or app used for sharing content' },
        { text:'The conference took place on a video platform, so speakers joined from six countries.', meaning:'a digital system used for communicating' }
      ],
      situationDistractors:[
        'A technician carried a heavy server into the office.',
        'A programmer wrote the code for a new game.',
        'A boy chose a strong password for his email account.'
      ],
      retrievalContexts:[
        { id:'1', text:'The video was shared on several platforms and was soon watched by millions.', target:'platforms', grammarPattern:'' },
        { id:'2', text:'The online platform allows students to ask their teachers questions at any time.', target:'platform', grammarPattern:'' },
        { id:'3', text:'Musicians now release songs directly on streaming platforms.', target:'platforms', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'platforms', wrong:['frustrations', 'accuracies', 'perceptions'] },
        { id:'2', answer:'platform', wrong:['frustration', 'accuracy', 'perception'] },
        { id:'3', answer:'platforms', wrong:['frustrations', 'perceptions', 'clauses'] }
      ]
    }),
  e('virtual', 'adjective',
    'created by computers or happening online, rather than existing in the physical world',
    ['online', 'computer-generated'],
    ['made by hand from natural materials', 'happening in a real room with people present', 'very old and traditional'],
    'We had a virtual meeting because the manager was working in another country.',
    'online', 'We had an online meeting because the manager was working in another country.',
    'computer-generated', 'The game takes place in a computer-generated city that looks almost real.',
    {
      teacherNote:'Adjective: created by computer technology or happening online rather than in the physical world (a virtual meeting, virtual reality, a virtual tour). Opposite here: physical / face-to-face / in person. The noun virtual reality is a common collocation. The adverb virtually means "almost" and is a different sense, so Word Families is not counted.',
      masteryContexts:[
        { text:'During the lockdown, students attended virtual classes from their bedrooms.', meaning:'happening online rather than in person' },
        { text:'With a headset, you can walk around a virtual version of ancient Rome.', meaning:'created by a computer to look real' }
      ],
      situationDistractors:[
        'A potter made a bowl by hand from clay.',
        'Ten people sat around a table in a real meeting room.',
        'The village still celebrates the festival in the traditional way.'
      ],
      retrievalContexts:[
        { id:'1', text:'The art gallery offers a virtual tour for people who cannot visit in person.', target:'virtual', grammarPattern:'' },
        { id:'2', text:'Some companies now hold all their interviews in a virtual format.', target:'virtual', grammarPattern:'' },
        { id:'3', text:'With a virtual reality headset, users can explore places they could never visit.', target:'virtual', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'virtual', wrong:['banned', 'tech-savvy', 'underlying'] },
        { id:'2', answer:'virtual', wrong:['banned', 'tech-savvy', 'underlying'] },
        { id:'3', answer:'virtual', wrong:['banned', 'optional', 'underlying'] }
      ]
    }),
  e('face-to-face', 'adjective',
    'in the same place as the other person, so you can see each other directly',
    ['in person', 'meeting directly'],
    ['by phone or online', 'by sending a letter', 'without being seen'],
    'Some problems are easier to solve in a face-to-face conversation than by email.',
    'in-person', 'Some problems are easier to solve in an in-person conversation than by email.',
    'in person', 'I would rather tell her the news in person than send her a message.',
    {
      teacherNote:'Adjective or adverb (hyphenated before a noun): in the same place as the other person (face-to-face meetings, talk face to face). Opposite here: virtual / online / remote. It is a fixed expression, so Word Families is not counted.',
      masteryContexts:[
        { text:'After months of video calls, the team finally had a face-to-face meeting in London.', meaning:'in the same place, seeing each other directly' },
        { text:'In face-to-face lessons, teachers can notice when a student looks confused.', meaning:'happening in person, not online' }
      ],
      situationDistractors:[
        'Two friends chatted on a video call from different countries.',
        'A girl wrote a letter to her pen friend in Australia.',
        'A boy left an anonymous comment on a website.'
      ],
      retrievalContexts:[
        { id:'1', text:'Many people still prefer face-to-face contact when they need advice from a doctor.', target:'face-to-face', grammarPattern:'' },
        { id:'2', text:'The course combines online study with face-to-face classes once a month.', target:'face-to-face', grammarPattern:'' },
        { id:'3', text:'Job interviews are usually face-to-face, but some take place online.', target:'face-to-face', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'face-to-face', wrong:['tech-savvy', 'banned', 'underlying'] },
        { id:'2', answer:'face-to-face', wrong:['tech-savvy', 'banned', 'underlying'] },
        { id:'3', answer:'face-to-face', wrong:['tech-savvy', 'underlying', 'constructive'] }
      ]
    }),
  e('conference', 'noun',
    'a large formal meeting where people discuss a subject, often over several days',
    ['large formal meeting', 'organised event for discussion'],
    ['a short private chat between two friends', 'a written report about a meeting', 'a room where students study quietly'],
    'Over two thousand teachers attended the education conference in Singapore.',
    'large formal meeting', 'Over two thousand teachers attended the large formal meeting about education in Singapore.',
    'organised meeting', 'The scientists presented their research at an organised meeting with experts from many countries.',
    {
      teacherNote:'Noun (countable): a large formal meeting, often lasting several days, where people discuss a subject (attend a conference, a conference on ..., a video conference, a press conference). Boundary: a conference is bigger and more formal than a meeting. Word Families is not counted (confer is formal and rare at this level).',
      masteryContexts:[
        { text:'The doctor flew to Tokyo to give a talk at an international medical conference.', meaning:'a large formal meeting on a subject' },
        { text:'The company holds a video conference every Monday with offices in five countries.', meaning:'an organised meeting held online' }
      ],
      situationDistractors:[
        'Two friends had a quick chat at the bus stop.',
        'A secretary typed up the notes from yesterday’s meeting.',
        'Students worked silently in the school library.'
      ],
      retrievalContexts:[
        { id:'1', text:'The president answered journalists’ questions at a press conference.', target:'conference', grammarPattern:'' },
        { id:'2', text:'The three-day conference on climate change attracted speakers from all over the world.', target:'conference', grammarPattern:'' },
        { id:'3', text:'Our school sent two students to a youth conference on online safety.', target:'conference', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'conference', wrong:['frustration', 'accuracy', 'perception'] },
        { id:'2', answer:'conference', wrong:['frustration', 'accuracy', 'perception'] },
        { id:'3', answer:'conference', wrong:['frustration', 'accuracy', 'perception'] }
      ]
    }),
  e('suitable', 'adjective',
    'right or acceptable for a particular person, purpose or situation',
    ['right for', 'appropriate'],
    ['very difficult to understand', 'too expensive to buy', 'old and broken'],
    'This app is suitable for beginners because the instructions are very clear.',
    'right for', 'This app is right for beginners because the instructions are very clear.',
    'appropriate', 'Is this photo appropriate to use on a school website?',
    {
      teacherNote:'Adjective: right or acceptable for a person, purpose or situation (suitable for, a suitable time/place/word). Boundary: suitable and appropriate are close synonyms; "suitable for children" is very common, while "appropriate" is often used about behaviour and language. The opposite unsuitable and the noun suitability are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The hall is not suitable for a large conference because it only has fifty seats.', meaning:'right for a particular purpose' },
        { text:'Can you suggest a suitable time for the video call next week?', meaning:'convenient and acceptable' }
      ],
      situationDistractors:[
        'A girl could not understand the long instructions for her new camera.',
        'A family decided the laptop was too expensive for them.',
        'A boy threw away his old phone because the screen was broken.'
      ],
      retrievalContexts:[
        { id:'1', text:'The film is not suitable for children under twelve.', target:'suitable', grammarPattern:'' },
        { id:'2', text:'We need to find a suitable place for the meeting, with a projector and good Wi-Fi.', target:'suitable', grammarPattern:'' },
        { id:'3', text:'A short, polite email is the most suitable way to contact a teacher about homework.', target:'suitable', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'suitable', wrong:['tech-savvy', 'underlying', 'non-verbal'] },
        { id:'2', answer:'suitable', wrong:['tech-savvy', 'underlying', 'non-verbal'] },
        { id:'3', answer:'suitable', wrong:['tech-savvy', 'underlying', 'banned'] }
      ]
    }),
  e('underlying meaning', 'noun',
    'the real message of something, which is not stated directly but is suggested',
    ['hidden message', 'real meaning below the surface'],
    ['the dictionary definition of a single word', 'the title printed at the top of a text', 'a translation into another language'],
    'Readers have to think carefully to find the underlying meaning of the poem.',
    'hidden message', 'Readers have to think carefully to find the hidden message of the poem.',
    'real message', 'Behind the joke, his real message was that he felt left out.',
    {
      teacherNote:'Noun phrase: the real message that is suggested rather than stated (the underlying meaning of a text/comment/remark). Important for Paper 1 inference questions about what a writer implies. Boundary: the literal meaning is what the words say; the underlying meaning is what the writer suggests. Fixed phrase, so Word Families is not counted.',
      masteryContexts:[
        { text:'On the surface the advert is about a car, but its underlying meaning is that success makes you happy.', meaning:'the message suggested but not said directly' },
        { text:'When a friend says "I’m fine" in a flat voice, the underlying meaning may be the opposite.', meaning:'the real message behind the words' }
      ],
      situationDistractors:[
        'A student looked up the definition of "obscure" in a dictionary.',
        'A girl read only the headline of a newspaper article.',
        'A tourist used an app to translate a menu into English.'
      ],
      retrievalContexts:[
        { id:'1', text:'In the exam, you may be asked to explain the underlying meaning of a writer’s comment.', target:'underlying meaning', grammarPattern:'' },
        { id:'2', text:'The song sounds happy, but its underlying meaning is about loneliness.', target:'underlying meaning', grammarPattern:'' },
        { id:'3', text:'Non-verbal signals often reveal the underlying meaning of what someone says.', target:'underlying meaning', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'underlying meaning', wrong:['direct object', 'reporting verb', 'digital native'] },
        { id:'2', answer:'underlying meaning', wrong:['direct object', 'digital native', 'reporting verb'] },
        { id:'3', answer:'underlying meaning', wrong:['direct object', 'digital native', 'reporting verb'] }
      ]
    }),
  e('informal language', 'noun',
    'relaxed everyday words and expressions used with friends and family rather than in official situations',
    ['everyday language', 'casual words and expressions'],
    ['words used only in legal documents', 'the language of scientific reports', 'a language that is no longer spoken'],
    'Using informal language such as "gonna" is fine in a chat, but not in an essay.',
    'everyday language', 'Using everyday language such as "gonna" is fine in a chat, but not in an essay.',
    'casual expressions', 'Casual expressions like "no worries" are common in messages between friends.',
    {
      teacherNote:'Noun phrase: relaxed, everyday words and structures (contractions, phrasal verbs, slang) used in personal communication. Key for Paper 2 register: informal language suits a letter to a friend, not a report. Contrast with "formal style", also a Unit 9 target. Fixed phrase, so Word Families is not counted.',
      masteryContexts:[
        { text:'Contractions like "don’t" and phrasal verbs like "get on with" are features of informal language.', meaning:'everyday expressions used in relaxed situations' },
        { text:'The examiner marked her report down because it was full of informal language.', meaning:'casual words not suitable for official writing' }
      ],
      situationDistractors:[
        'A lawyer used complex legal terms in a contract.',
        'A scientist wrote a report full of technical vocabulary.',
        'A historian studied an ancient language that nobody speaks today.'
      ],
      retrievalContexts:[
        { id:'1', text:'When you write to a friend, informal language makes your letter sound natural.', target:'informal language', grammarPattern:'' },
        { id:'2', text:'Avoid informal language such as slang in a formal email to a company.', target:'informal language', grammarPattern:'' },
        { id:'3', text:'Text messages are full of informal language and abbreviations.', target:'informal language', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'informal language', wrong:['direct object', 'digital native', 'reporting verb'] },
        { id:'2', answer:'informal language', wrong:['direct object', 'digital native', 'reporting verb'] },
        { id:'3', answer:'informal language', wrong:['direct object', 'digital native', 'reporting verb'] }
      ]
    }),
  e('formal style', 'noun',
    'a serious and polite way of writing or speaking, used in official or professional situations',
    ['official tone', 'serious, polite way of writing'],
    ['a relaxed way of chatting with friends', 'a type of fashionable clothing', 'a method of drawing pictures'],
    'A letter to a company should be written in a formal style, without slang or contractions.',
    'serious and polite tone', 'A letter to a company should be written in a serious and polite tone, without slang or contractions.',
    'official way of writing', 'Reports for the head teacher need an official way of writing with clear headings.',
    {
      teacherNote:'Noun phrase: a serious, polite and impersonal way of writing or speaking (write in a formal style). Features include full forms, precise vocabulary, no slang and polite openings. Key for Paper 2 register. Contrast with "informal language", also a Unit 9 target. Fixed phrase, so Word Families is not counted.',
      masteryContexts:[
        { text:'In a formal style, you would write "I would be grateful if ..." instead of "Can you ...?".', meaning:'a polite, official way of writing' },
        { text:'The speech was in a formal style because the audience included government ministers.', meaning:'a serious way of speaking for official occasions' }
      ],
      situationDistractors:[
        'Two friends sent each other jokes and emojis late at night.',
        'A designer chose a new style of jacket for the winter collection.',
        'An artist sketched a portrait with a pencil.'
      ],
      retrievalContexts:[
        { id:'1', text:'A job application should be written in a formal style.', target:'formal style', grammarPattern:'' },
        { id:'2', text:'The article uses a formal style, with long sentences and no contractions.', target:'formal style', grammarPattern:'' },
        { id:'3', text:'Students often find it hard to switch from chatting online to a formal style for essays.', target:'formal style', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'formal style', wrong:['direct object', 'digital native', 'reporting verb'] },
        { id:'2', answer:'formal style', wrong:['direct object', 'digital native', 'reporting verb'] },
        { id:'3', answer:'formal style', wrong:['direct object', 'digital native', 'reporting verb'] }
      ]
    }),
  e('reporting verb', 'noun',
    'a verb such as say, tell, suggest or explain that is used to report what someone said or thought',
    ['verb for reporting speech', 'verb like say or claim'],
    ['a verb that describes physical movement', 'a word used to describe a noun', 'the main verb in a question'],
    '"Claim" is a reporting verb that shows the writer is not sure the statement is true.',
    'verb used to report speech', '"Claim" is a verb used to report speech that shows the writer is not sure the statement is true.',
    'verb like say or explain', 'Instead of always using "said", choose a more precise verb like "explained" or "admitted".',
    {
      teacherNote:'Noun phrase (grammar term): a verb used to report speech or thought (say, tell, explain, suggest, recommend, admit, claim, argue). Different reporting verbs follow different patterns: suggest + -ing / that; recommend + -ing / that; tell + object + to-infinitive. Fixed phrase, so Word Families is not counted.',
      masteryContexts:[
        { text:'Choosing a precise reporting verb, such as "argued" or "admitted", makes a summary more interesting.', meaning:'a word like said or claimed that tells us what someone stated' },
        { text:'After the reporting verb "warn", we usually use an object and "not to": She warned us not to go.', meaning:'a word such as said, warned or claimed that introduces what someone stated' }
      ],
      situationDistractors:[
        'The teacher asked the class to find all the verbs of movement, like "run" and "jump".',
        'A student underlined every adjective in the story.',
        'A boy wrote a question beginning with "Do you ...?".'
      ],
      retrievalContexts:[
        { id:'1', text:'In the sentence "She suggested going to the cinema", "suggested" is the reporting verb.', target:'reporting verb', grammarPattern:'' },
        { id:'2', text:'Each reporting verb has its own grammar pattern, so learn them in example sentences.', target:'reporting verb', grammarPattern:'' },
        { id:'3', text:'A good summary uses an accurate reporting verb, such as "explained" or "argued".', target:'reporting verb', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'reporting verb', wrong:['digital native', 'underlying meaning', 'conference'] },
        { id:'2', answer:'reporting verb', wrong:['digital native', 'conference', 'platform'] },
        { id:'3', answer:'reporting verb', wrong:['digital native', 'conference', 'platform'] }
      ]
    }),
  e('direct object', 'noun',
    'the noun or pronoun that receives the action of a verb, for example "the ball" in "She kicked the ball"',
    ['person or thing affected by the verb', 'object that receives the action'],
    ['the person who does the action', 'the word that describes how an action happens', 'the time when an action took place'],
    'In "Jamal sent an email", "an email" is the direct object.',
    'thing affected by the verb', 'In "Jamal sent an email", "an email" is the thing affected by the verb.',
    'object of the verb', 'In "I recommend this book", the object of the verb is "this book".',
    {
      teacherNote:'Noun phrase (grammar term): the noun or pronoun that receives the action of a transitive verb. Important for Unit 9 reporting verbs: "tell" needs a person as direct object (tell someone), while "say" does not (say something to someone); "recommend" and "suggest" do not take a person as direct object before a to-infinitive (*suggest him to go). Fixed phrase, so Word Families is not counted.',
      masteryContexts:[
        { text:'The verb "tell" usually needs a direct object: "She told me the news".', meaning:'the noun or pronoun receiving the action' },
        { text:'In "The teacher praised the students", the direct object is "the students".', meaning:'the person or thing affected by the verb' }
      ],
      situationDistractors:[
        'A student identified "the dog" as the one doing the action in "The dog barked".',
        'A teacher pointed out the word "quickly" in "She ran quickly".',
        'A boy underlined "yesterday" in "We met yesterday".'
      ],
      retrievalContexts:[
        { id:'1', text:'"Say" cannot take a person as its direct object, so we say "She said to me", not "She said me".', target:'direct object', grammarPattern:'' },
        { id:'2', text:'In "He launched the website", "the website" is the direct object.', target:'direct object', grammarPattern:'' },
        { id:'3', text:'A transitive verb, such as "demonstrate", needs a direct object.', target:'direct object', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'direct object', wrong:['digital native', 'conference', 'platform'] },
        { id:'2', answer:'direct object', wrong:['digital native', 'conference', 'generation'] },
        { id:'3', answer:'direct object', wrong:['digital native', 'conference', 'community'] }
      ]
    }),
  e('clause', 'noun',
    'a group of words that contains a subject and a verb and forms a sentence or part of a sentence',
    ['part of a sentence with a verb', 'subject-and-verb unit'],
    ['a single word that describes a noun', 'a mark such as a comma or full stop', 'a paragraph at the end of an essay'],
    'In "I left early because I was tired", "because I was tired" is a clause.',
    'part of a sentence with its own verb', 'In "I left early because I was tired", "because I was tired" is a part of a sentence with its own verb.',
    'group of words with a subject and verb', 'Every complete sentence needs at least one group of words with a subject and verb.',
    {
      teacherNote:'Noun (grammar term, countable): a group of words with a subject and a verb (a main clause, a relative clause, a that-clause). Unit 9 links it to reporting verbs: suggest that + clause, recommend that + clause. Boundary: a phrase has no subject-verb pair; a clause does. A legal "clause" in a contract is a different sense, not taught. Word Families is not counted.',
      masteryContexts:[
        { text:'After "suggest", you can use a clause beginning with "that": "I suggest that you leave early".', meaning:'a group of words with its own subject and verb' },
        { text:'Starting a clause with "although" helps you show contrast in your writing.', meaning:'a part of a sentence containing a verb' }
      ],
      situationDistractors:[
        'A student circled every adjective that described the main character.',
        'A teacher added a missing comma to a student’s sentence.',
        'A girl wrote the final paragraph of her essay.'
      ],
      retrievalContexts:[
        { id:'1', text:'A relative clause, such as "who lives next door", gives extra information about a noun.', target:'clause', grammarPattern:'' },
        { id:'2', text:'The sentence has two clauses joined by "but".', target:'clauses', grammarPattern:'' },
        { id:'3', text:'"Recommend" can be followed by a that-clause: "I recommend that you read the instructions".', target:'that-clause', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'clause', wrong:['platform', 'conference', 'audience'] },
        { id:'2', answer:'clauses', wrong:['platforms', 'conferences', 'audiences'] },
        { id:'3', answer:'that-clause', wrong:['that-platform', 'that-conference', 'that-audience'] }
      ]
    }),
  e('suggest', 'verb',
    'to put forward an idea or plan for other people to think about',
    ['propose', 'put forward an idea'],
    ['to order someone to do something', 'to refuse to discuss a plan', 'to agree with everything someone says'],
    'Mia suggested meeting on a video call because two group members were ill.',
    'proposed', 'Mia proposed meeting on a video call because two group members were ill.',
    'put forward the idea', 'Ben put forward the idea of starting a school podcast.',
    {
      teacherNote:'Reporting verb: to put forward an idea or plan (suggest + -ing; suggest that + clause; suggest something to someone). Common error: *suggest someone to do. A second meaning, "to show that something is probably true" (the evidence suggests ...), is also useful. The noun suggestion is taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Our teacher likes to suggest that we practise our presentations in front of a mirror.', meaning:'to put forward an idea for someone to consider' },
        { text:'When the shop was full, Leo said, "I suggest we try the café across the road."', meaning:'to propose a plan' }
      ],
      situationDistractors:[
        'The manager ordered the staff to finish the report by five o’clock.',
        'A boy refused to talk about the plan at all.',
        'A girl agreed with every point her friend made.'
      ],
      retrievalContexts:[
        { id:'1', text:'My friend suggested using a mind map to plan the essay.', target:'suggested', grammarPattern:'' },
        { id:'2', text:'Can you suggest a good app for learning vocabulary?', target:'suggest', grammarPattern:'' },
        { id:'3', text:'I suggest that we ask the teacher before we change the topic.', target:'suggest', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'suggested', wrong:['survived', 'banned', 'launched'] },
        { id:'2', answer:'suggest', wrong:['survive', 'ban', 'differentiate'] },
        { id:'3', answer:'suggest', wrong:['survive', 'ban', 'launch'] }
      ]
    }),
  e('recommend', 'verb',
    'to advise someone to do something, or to say that someone or something is good and suitable',
    ['advise', 'say something is good'],
    ['to warn people to avoid something', 'to complain about poor quality', 'to keep information to yourself'],
    'The doctor recommended drinking more water and spending less time on screens.',
    'advised', 'The doctor advised drinking more water and spending less time on screens.',
    'say is good', 'Many reviewers say this phone is good for students on a budget.',
    {
      idKey:'recommend_9',
      teacherNote:'Reporting verb: to advise or to say something is good (recommend + -ing; recommend that + clause; recommend something to someone). Common error: *recommend someone to do (not standard in this pattern for learners). Unit 9 treats it as a reporting verb; Unit 1 taught it for free-time choices. The noun recommendation is taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The experts recommend that schools teach students how to check online information.', meaning:'to advise that something should be done' },
        { text:'Can you recommend a good book about communication skills?', meaning:'to say that something is good and suitable' }
      ],
      situationDistractors:[
        'A sign warned visitors to stay away from the cliff edge.',
        'A customer complained that the headphones broke after a day.',
        'A boy kept the name of the restaurant secret from his friends.'
      ],
      retrievalContexts:[
        { id:'1', text:'The teacher recommended reading the instructions twice before starting.', target:'recommended', grammarPattern:'' },
        { id:'2', text:'I would recommend this website to anyone who wants to improve their writing.', target:'recommend', grammarPattern:'' },
        { id:'3', text:'Experts recommend that children have no screens in their bedrooms at night.', target:'recommend', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'recommended', wrong:['survived', 'banned', 'launched'] },
        { id:'2', answer:'recommend', wrong:['survive', 'ban', 'differentiate'] },
        { id:'3', answer:'recommend', wrong:['survive', 'launch', 'differentiate'] }
      ]
    }),
  e('solution', 'noun',
    'a way of dealing with a problem or difficult situation successfully',
    ['answer to a problem', 'way to fix a problem'],
    ['the cause of a problem', 'a question that has no answer', 'a description of how bad a problem is'],
    'One solution to cyberbullying is to teach students how to report harmful messages.',
    'way of dealing with', 'One way of dealing with cyberbullying is to teach students how to report harmful messages.',
    'answer to the problem', 'Shorter meetings could be an answer to the problem of staff feeling tired.',
    {
      idKey:'solution_9',
      teacherNote:'Noun: a way of solving or dealing with a problem (a solution to/for a problem, find a solution, a practical solution). Note the preposition "to". Unit 9 uses it in problem-solution writing and reports; Unit 1 taught it in a different topic. The verb solve and the adjective solvable are related; the Word Family pathway teaches solve.',
      masteryContexts:[
        { text:'The report ends by suggesting one practical solution to the problem of noise in the library.', meaning:'a way of dealing with a difficulty' },
        { text:'The engineers finally found a solution, and the app stopped crashing.', meaning:'something that solves a difficulty' }
      ],
      situationDistractors:[
        'A scientist explained why the river had become polluted.',
        'A philosopher asked a question that nobody could answer.',
        'A journalist described how serious the traffic problem was.'
      ],
      retrievalContexts:[
        { id:'1', text:'There is no simple solution to the problem of fake news.', target:'solution', grammarPattern:'' },
        { id:'2', text:'The class discussed possible solutions and voted for the best one.', target:'solutions', grammarPattern:'' },
        { id:'3', text:'Working from home has been a good solution for parents with young children.', target:'solution', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'solution', wrong:['frustration', 'perception', 'workforce'] },
        { id:'2', answer:'solutions', wrong:['frustrations', 'perceptions', 'workforces'] },
        { id:'3', answer:'solution', wrong:['frustration', 'workforce', 'perception'] }
      ]
    }),
  e('introduction', 'noun',
    'the first part of a piece of writing or a talk, which explains what it is about',
    ['opening section', 'beginning that explains the topic'],
    ['the final part that sums up the main points', 'a list of books used for research', 'the title written on the cover'],
    'A good introduction tells the reader what the essay is going to discuss.',
    'opening section', 'A good opening section tells the reader what the essay is going to discuss.',
    'opening paragraph', 'Your opening paragraph should make the reader want to continue.',
    {
      teacherNote:'Noun: the first part of a text or talk that explains its topic and purpose (in the introduction, write an introduction). Key for Paper 2 report and article structure. Opposite in structure: conclusion. Other senses (introducing people; bringing something in for the first time) exist but are not the focus. The verb introduce is taught in the Word Family pathway.',
      masteryContexts:[
        { text:'In the introduction to your report, state its purpose and who it is for.', meaning:'the opening part of a piece of writing' },
        { text:'The speaker’s introduction was so funny that the audience was immediately interested.', meaning:'the beginning of a talk' }
      ],
      situationDistractors:[
        'A student summed up her main points in the final paragraph.',
        'A writer listed all the books he had used at the end of the report.',
        'A designer printed the title in large letters on the cover.'
      ],
      retrievalContexts:[
        { id:'1', text:'Keep your introduction short and explain clearly what your article is about.', target:'introduction', grammarPattern:'' },
        { id:'2', text:'The introduction of the book explains why the author wrote it.', target:'introduction', grammarPattern:'' },
        { id:'3', text:'Start your presentation with an introduction that tells the audience what to expect.', target:'introduction', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'introduction', wrong:['frustration', 'workforce', 'perception'] },
        { id:'2', answer:'introduction', wrong:['frustration', 'workforce', 'accuracy'] },
        { id:'3', answer:'introduction', wrong:['frustration', 'workforce', 'accuracy'] }
      ]
    }),
  e('conclusion', 'noun',
    'the final part of a piece of writing or a talk, which sums up the main points',
    ['ending', 'final summary'],
    ['the first paragraph of an essay', 'a question asked by the audience', 'the title of a report'],
    'In the conclusion, the writer gives her own opinion about social media.',
    'final section', 'In the final section, the writer gives her own opinion about social media.',
    'final paragraph', 'Your final paragraph should sum up your main arguments.',
    {
      teacherNote:'Noun: (1) the final part of a text or talk that sums up the main points (in conclusion, write a conclusion); (2) a decision reached after thinking (come to/reach a conclusion). Both are useful in Paper 2. Opposite in structure: introduction. The verb conclude is taught in the Word Family pathway.',
      masteryContexts:[
        { text:'A strong conclusion reminds the reader of your main points without repeating them word for word.', meaning:'the final part of a piece of writing' },
        { text:'After reading all the evidence, the team came to the conclusion that the app was not safe.', meaning:'a decision reached after thinking' }
      ],
      situationDistractors:[
        'A student wrote the opening sentence of her story.',
        'A member of the audience asked the speaker a question.',
        'A journalist chose the headline for an article.'
      ],
      retrievalContexts:[
        { id:'1', text:'In your conclusion, give a final recommendation to the head teacher.', target:'conclusion', grammarPattern:'' },
        { id:'2', text:'The scientists reached the conclusion that regular breaks improve concentration.', target:'conclusion', grammarPattern:'' },
        { id:'3', text:'The talk ended with a short conclusion that summed up the three main ideas.', target:'conclusion', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'conclusion', wrong:['frustration', 'workforce', 'perception'] },
        { id:'2', answer:'conclusion', wrong:['frustration', 'workforce', 'community'] },
        { id:'3', answer:'conclusion', wrong:['frustration', 'workforce', 'community'] }
      ]
    }),
  e('audience', 'noun',
    'the people who watch, listen to or read something',
    ['viewers or listeners', 'readers'],
    ['the person who writes a speech', 'the room where a talk takes place', 'the topic that a talk is about'],
    'Before you write, think about your audience: is it your friends or your head teacher?',
    'readers', 'Before you write, think about your readers: are they your friends or your head teacher?',
    'listeners', 'The listeners clapped loudly at the end of the speech.',
    {
      teacherNote:'Noun (countable, collective): the people who watch, listen to or read something (a large audience, the target audience, write for an audience). Key for Paper 2: audience and purpose decide the right register. Boundary: the audience is people, not the place. Word Families is not counted (audible/audition are not useful family members here).',
      masteryContexts:[
        { text:'The article was written for a teenage audience, so it uses simple language and examples from school life.', meaning:'the people who read something' },
        { text:'The audience laughed at the speaker’s jokes and asked many questions afterwards.', meaning:'the people listening to a talk' }
      ],
      situationDistractors:[
        'A writer spent the morning finishing her speech.',
        'A caretaker set up chairs in the school hall.',
        'A teacher chose climate change as the topic of the talk.'
      ],
      retrievalContexts:[
        { id:'1', text:'The YouTube channel has a huge audience of young people who want to learn languages.', target:'audience', grammarPattern:'' },
        { id:'2', text:'When giving a presentation, make eye contact with your audience.', target:'audience', grammarPattern:'' },
        { id:'3', text:'The advert was designed for an audience of parents with young children.', target:'audience', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'audience', wrong:['accuracy', 'frustration', 'perception'] },
        { id:'2', answer:'audience', wrong:['accuracy', 'frustration', 'perception'] },
        { id:'3', answer:'audience', wrong:['accuracy', 'frustration', 'perception'] }
      ]
    }),
  e('purpose', 'noun',
    'the reason why something is done or made, or what it is intended to achieve',
    ['aim', 'reason for doing something'],
    ['the result that happens by accident', 'the place where something happens', 'the person who reads a text'],
    'The purpose of this report is to suggest ways to improve communication in our school.',
    'aim', 'The aim of this report is to suggest ways to improve communication in our school.',
    'reason', 'What was the reason for sending that message so late at night?',
    {
      teacherNote:'Noun: the reason for doing or making something, or what it is meant to achieve (the purpose of ..., for the purpose of ..., on purpose). Key for Paper 2: identify the purpose (inform, persuade, complain, describe) before writing. Boundary: "on purpose" means deliberately. The adjective purposeful is taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The main purpose of the campaign is to encourage students to talk face-to-face more often.', meaning:'the aim of an activity' },
        { text:'The writer’s purpose is to persuade readers to stop buying fast fashion.', meaning:'what a text is intended to achieve' }
      ],
      situationDistractors:[
        'By accident, the chemist discovered a new colour of paint.',
        'The conference took place in a large hotel near the airport.',
        'The article was read by thousands of people online.'
      ],
      retrievalContexts:[
        { id:'1', text:'Before you start writing, decide on the purpose of your article.', target:'purpose', grammarPattern:'' },
        { id:'2', text:'The purpose of the meeting was to plan the school’s anniversary celebrations.', target:'purpose', grammarPattern:'' },
        { id:'3', text:'He broke the vase by accident, not on purpose.', target:'purpose', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'purpose', wrong:['workforce', 'frustration', 'accuracy'] },
        { id:'2', answer:'purpose', wrong:['workforce', 'frustration', 'accuracy'] },
        { id:'3', answer:'purpose', wrong:['workforce', 'frustration', 'accuracy'] }
      ]
    }),
  e('evaluate', 'verb',
    'to think carefully about something in order to judge its quality, value or importance',
    ['judge', 'assess'],
    ['to copy something without changing it', 'to describe something without giving an opinion', 'to ignore the strengths and weaknesses of something'],
    'Students should evaluate online sources carefully before using them in an essay.',
    'judge', 'Students should judge online sources carefully before using them in an essay.',
    'assess', 'The teacher will assess each presentation using the same criteria.',
    {
      idKey:'evaluate_9',
      teacherNote:'Verb: to judge the quality, value or importance of something after thinking carefully (evaluate the evidence, evaluate a source, evaluate whether ...). Unit 9 uses it for judging sources and arguments; earlier units used it in other topics. Boundary: describe only reports; evaluate judges. The noun evaluation is taught in the Word Family pathway.',
      masteryContexts:[
        { text:'In the final paragraph, evaluate the advantages and disadvantages before giving your opinion.', meaning:'to judge strengths and weaknesses' },
        { text:'The school asked parents to evaluate the new online learning platform.', meaning:'to judge the quality of something' }
      ],
      situationDistractors:[
        'A student copied the paragraph word for word into his notebook.',
        'A reporter described the event without giving any opinion.',
        'A girl accepted the first website she found without checking it.'
      ],
      retrievalContexts:[
        { id:'1', text:'It is important to evaluate whether a website is reliable before you share its information.', target:'evaluate', grammarPattern:'' },
        { id:'2', text:'The panel evaluated each project and chose three winners.', target:'evaluated', grammarPattern:'' },
        { id:'3', text:'Teachers regularly evaluate how effective their lessons are.', target:'evaluate', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'evaluate', wrong:['survive', 'ban', 'launch'] },
        { id:'2', answer:'evaluated', wrong:['survived', 'signalled', 'differentiated'] },
        { id:'3', answer:'evaluate', wrong:['survive', 'ban', 'launch'] }
      ]
    }),
  e('relevant', 'adjective',
    'closely connected with the subject or situation being discussed',
    ['connected to the topic', 'related and useful'],
    ['not connected to the topic at all', 'very old and out of date', 'too long to read'],
    'Only include information that is relevant to the question you are answering.',
    'connected to', 'Only include information that is connected to the question you are answering.',
    'related to the topic', 'Her examples were all related to the topic, so the essay was easy to follow.',
    {
      idKey:'relevant_9',
      teacherNote:'Adjective: closely connected with the subject or situation (relevant to, relevant information, highly relevant). Key for summary and note-making tasks: select only relevant points. Opposite: irrelevant. The noun relevance and the opposite irrelevant are taught in the Word Family pathway. Unit 9 uses it for selecting content; Units 2 and 7 taught it in other topics.',
      masteryContexts:[
        { text:'In the summary task, choose the points that are relevant and leave out the examples.', meaning:'connected with the subject' },
        { text:'The interviewer asked about my work experience that was relevant to the job.', meaning:'related to the situation being discussed' }
      ],
      situationDistractors:[
        'A student included a story about his holiday in an essay about pollution.',
        'A website still showed train times from ten years ago.',
        'A report was so long that nobody finished reading it.'
      ],
      retrievalContexts:[
        { id:'1', text:'Make sure every paragraph is relevant to the title of your article.', target:'relevant', grammarPattern:'' },
        { id:'2', text:'The search engine shows the most relevant results at the top of the page.', target:'relevant', grammarPattern:'' },
        { id:'3', text:'Is your previous experience relevant to this job?', target:'relevant', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'relevant', wrong:['portable', 'tech-savvy', 'banned'] },
        { id:'2', answer:'relevant', wrong:['portable', 'tech-savvy', 'banned'] },
        { id:'3', answer:'relevant', wrong:['portable', 'tech-savvy', 'banned'] }
      ]
    }),
  e('constructive', 'adjective',
    'helpful and intended to improve something, rather than just criticising it',
    ['helpful', 'useful for improving'],
    ['unkind and intended to hurt someone', 'not related to the topic', 'very short and unclear'],
    'The teacher gave constructive feedback, explaining exactly how I could improve my essay.',
    'helpful', 'The teacher gave helpful feedback, explaining exactly how I could improve my essay.',
    'useful for improving', 'Her comments were useful for improving the design of our poster.',
    {
      teacherNote:'Adjective: helpful and intended to improve something (constructive feedback, constructive criticism, a constructive discussion). Boundary: constructive criticism points out problems and suggests improvements; negative criticism only finds fault. The verb construct is a different sense here; the adverb constructively is taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Good teachers give constructive criticism that helps people improve, rather than rude comments.', meaning:'helpful and intended to improve something' },
        { text:'The meeting was constructive, and we agreed on three clear next steps.', meaning:'useful and producing good results' }
      ],
      situationDistractors:[
        'A boy left a rude comment under a classmate’s video.',
        'A student wrote about football in an essay on communication.',
        'A teacher wrote "Bad" on an essay without any explanation.'
      ],
      retrievalContexts:[
        { id:'1', text:'When you review a classmate’s work, try to make your comments constructive.', target:'constructive', grammarPattern:'' },
        { id:'2', text:'The manager welcomed constructive suggestions from the workforce.', target:'constructive', grammarPattern:'' },
        { id:'3', text:'After a constructive discussion, both sides agreed to a compromise.', target:'constructive', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'constructive', wrong:['portable', 'tech-savvy', 'banned'] },
        { id:'2', answer:'constructive', wrong:['portable', 'tech-savvy', 'banned'] },
        { id:'3', answer:'constructive', wrong:['portable', 'tech-savvy', 'banned'] }
      ]
    }),
  e('research', 'noun',
    'careful study of a subject to discover new facts or information',
    ['careful study', 'investigation'],
    ['a guess made without any evidence', 'a quick look at the headlines', 'an opinion shared on social media'],
    'Research shows that people remember information better when they explain it to someone else.',
    'careful study', 'Careful study shows that people remember information better when they explain it to someone else.',
    'investigation', 'A recent investigation found that teenagers check their phones over 100 times a day.',
    {
      teacherNote:'Noun (uncountable): careful study to discover new facts (do/carry out research, research into/on, research shows that ...). Common error: *a research / *researches; say "a piece of research" or "studies". It can also be a verb (research a topic). The noun researcher is taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Before writing her article, Lina did some research into how teenagers use social media.', meaning:'careful study to find information' },
        { text:'New research suggests that video calls are more tiring than face-to-face meetings.', meaning:'scientific study that discovers new facts' }
      ],
      situationDistractors:[
        'A boy guessed the answer without reading the question.',
        'A girl glanced at the news headlines on her phone.',
        'A man posted his opinion about the film on social media.'
      ],
      retrievalContexts:[
        { id:'1', text:'Scientists are carrying out research into the effects of screen time on sleep.', target:'research', grammarPattern:'' },
        { id:'2', text:'Recent research shows that non-verbal signals are noticed within seconds.', target:'research', grammarPattern:'' },
        { id:'3', text:'Do some research online before you choose which university to apply to.', target:'research', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'research', wrong:['frustration', 'workforce', 'perception'] },
        { id:'2', answer:'research', wrong:['frustration', 'workforce', 'generation'] },
        { id:'3', answer:'research', wrong:['frustration', 'workforce', 'perception'] }
      ]
    }),
];

function familyFields(entry) {
  const family = unit9WordFamilies[entry.term];
  if (!family) return unit9WordFamilyRejected[entry.term] ? { wordFamily:[] } : {};
  const lower = value => String(value).toLocaleLowerCase('en');
  return {
    wordFamilyForms:family.forms.map(row => ({ form:row.form, partOfSpeech:row.partOfSpeech, example:row.example, pedagogicallyUseful:true, ...(unit9WordFamilyAlternates[entry.term]?.[row.form] ? { altExample:unit9WordFamilyAlternates[entry.term][row.form] } : {}) })),
    wordFamily:family.forms.map(row => row.form).filter(form => lower(form) !== lower(entry.term))
  };
}

// Authored Meaning Mastery wrong meanings are applied by position to the word's two mastery contexts, as in Units 1–8.
const enrichedEntries = entries.map(entry => {
  const authoredMastery = unit9MeaningMastery[entry.term];
  const masteryContexts = authoredMastery
    ? (entry.masteryContexts ?? []).map((record, index) => {
        const authored = authoredMastery[index] ?? {};
        return { text:authored.text ?? record.text, meaning:authored.meaning ?? record.meaning, ...(Array.isArray(authored.wrongMeanings) ? { wrongMeanings:authored.wrongMeanings } : {}) };
      })
    : entry.masteryContexts;
  return {
    ...entry,
    ...(masteryContexts ? { masteryContexts } : {}),
    ...(unit9SituationExtras[entry.term] ? { situationDistractors:[...(entry.situationDistractors ?? []), ...unit9SituationExtras[entry.term]] } : {}),
    ...(unit9Collocations[entry.term] ? { collocations:unit9Collocations[entry.term] } : {}),
    ...(unit9MeaningMatch[entry.term] ? { wrongParaphrases:unit9MeaningMatch[entry.term] } : {}),
    ...(unit9ContextPassages[entry.term] ? { masteryPassages:unit9ContextPassages[entry.term] } : {}),
    ...familyFields(entry)
  };
});

export default buildCuratedUnit({
  unitNumber:UNIT_NUMBER,
  unitTitle:'Communication',
  status,
  source:'0511 key vocabulary unit 9: Communication',
  entries:enrichedEntries,
  activities:[...unit9Activities, ...unit9PrecisionUse, ...unit9WordFamilyItems],
  lexicalSpelling:{
    ...LEXICAL_SPELLING_ERRORS,
    vocab_effective_9:LEXICAL_SPELLING_ERRORS.vocab_effective,
    vocab_demonstrate_9:LEXICAL_SPELLING_ERRORS.vocab_demonstrate,
    vocab_launched_9:LEXICAL_SPELLING_ERRORS.vocab_launched,
    vocab_passive_9:LEXICAL_SPELLING_ERRORS.vocab_passive,
    vocab_interactive_9:LEXICAL_SPELLING_ERRORS.vocab_interactive,
    vocab_generation_9:LEXICAL_SPELLING_ERRORS.vocab_generation,
    vocab_recommend_9:LEXICAL_SPELLING_ERRORS.vocab_recommend,
    vocab_solution_9:LEXICAL_SPELLING_ERRORS.vocab_solution,
    vocab_evaluate_9:LEXICAL_SPELLING_ERRORS.vocab_evaluate,
    vocab_relevant_9:LEXICAL_SPELLING_ERRORS.vocab_relevant
  }
});
