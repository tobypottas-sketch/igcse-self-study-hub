// UNIT 8 – WORK: authored source for the Unit 8 Vocabulary Builder release (releases/unit-08.js promotes it to live once approved). Source: 0511 key vocabulary unit 8: Work
// (coursebook order), 50/50 authored. Check: node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-08.js
// availability, facilities, feature, ingredients, landscape, responsible, significant, specialise and engineer are also earlier-unit targets; each has its own Unit 8 id
// (idKey 'X_8' -> vocab_X_8) and aliases the earlier spelling list. Plural and past-participle targets (elements, facilities, inspectors, launched...) keep the coursebook form.
import { buildCuratedUnit } from '../build-unit.js';
import { LEXICAL_SPELLING_ERRORS } from '../lexical-spelling-errors.js';
import unit8Activities from './unit-08-activities.js';
import unit8PrecisionUse from './unit-08-precision-use.js';
import unit8WordFamilyItems from './unit-08-word-family-items.js';
import unit8Collocations from './unit-08-collocations.js';
import unit8SituationExtras from './unit-08-situation-extras.js';
import unit8MeaningMatch from './unit-08-meaning-match.js';
import unit8MeaningMastery from './unit-08-meaning-mastery.js';
import unit8ContextPassages from './unit-08-context-passages.js';
import { unit8WordFamilies, unit8WordFamilyRejected } from './unit-08-word-families.js';
import { unit8WordFamilyAlternates } from './unit-08-word-family-alternates.js';

const UNIT_NUMBER = 8;
const status = 'approved';

const e = (term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence, paraphraseSource, paraphraseSentence, productionSource, productionSentence, extras = {}) => ({
  term, partOfSpeech, meaning, paraphrases, distractors, meaningSentence,
  paraphrase:{ source:paraphraseSource, sentence:paraphraseSentence },
  production:{ source:productionSource, sentence:productionSentence },
  ...extras
});

const entries = [
  e('architecture', 'noun',
    'the art and work of designing buildings and planning how they are built',
    ['the design of buildings', 'the work of planning buildings'],
    ['the work of repairing old furniture', 'the study of how cities are governed', 'the business of selling houses and flats'],
    'Maya chose to study architecture because she loved drawing houses and bridges.',
    'the design of buildings', 'Maya chose to study the design of buildings because she loved drawing houses and bridges.',
    'the profession of designing buildings', 'Omar left banking for the profession of designing buildings and has never regretted it.',
    {
      teacherNote:'Noun: the art, subject and profession of designing buildings; also the style of a building (modern architecture). Boundary: architecture is the work or the style; an architect is the person. The nouns architect and the adjective architectural are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The modern architecture of the new library, with its glass walls and open spaces, attracts many visitors.', meaning:'the style and design of a building' },
        { text:'Before she could design hospitals, Lin spent six years studying architecture at university.', meaning:'the subject of designing buildings' }
      ],
      situationDistractors:[
        'A nurse checked the temperature of every patient on the ward.',
        'A chef tasted a new sauce before the restaurant opened.',
        'A shop assistant folded jumpers and put them on the shelves.'
      ],
      retrievalContexts:[
        { id:'1', text:'The city is famous for its architecture, from old stone churches to tall glass towers.', target:'architecture', grammarPattern:'' },
        { id:'2', text:'Lin studied architecture for seven years before she was allowed to design a hospital on her own.', target:'architecture', grammarPattern:'' },
        { id:'3', text:'Visitors admire the architecture of the station, especially its curved roof and tall arched windows.', target:'architecture', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'architecture', wrong:['packaging', 'manufacturing', 'publicity'] },
        { id:'2', answer:'architecture', wrong:['packaging', 'publicity', 'wellbeing'] },
        { id:'3', answer:'architecture', wrong:['manufacturing', 'wellbeing', 'minority'] }
      ]
    }),
  e('availability', 'noun',
    'the fact that something such as a material, product or job can be found and obtained',
    ['how easy something is to get', 'whether something can be obtained'],
    ['the price that customers must pay for something', 'the quality of the materials in a product', 'the number of people who want to buy something'],
    'The availability of fresh fruit in winter has improved because of better transport.',
    'how easy it is to get', 'How easy it is to get fresh fruit in winter has improved because of better transport.',
    'whether we can obtain', 'Whether we can obtain enough wood will decide how many chairs we make this year.',
    {
      idKey:'availability_8',
      teacherNote:'Noun: whether materials, products, jobs or services can be found and obtained (the availability of steel, the availability of jobs). Unit 8 keeps this supply sense for the world of work; Unit 7 taught the interview sense (when a person is free). The adjectives available and unavailable are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The bakery changed its recipe because of the limited availability of good flour.', meaning:'whether a material can be obtained' },
        { text:'Young people often move to big cities because of the greater availability of jobs.', meaning:'how many jobs can be found' }
      ],
      situationDistractors:[
        'A manager wrote a thank-you card to a worker who was leaving.',
        'Two engineers argued about the colour of a new machine.',
        'A trainer showed new staff where to hang their coats.'
      ],
      retrievalContexts:[
        { id:'1', text:'Builders had to wait for weeks because of the poor availability of bricks.', target:'availability', grammarPattern:'' },
        { id:'2', text:'The website shows the availability of each product, so customers know whether it is in stock.', target:'availability', grammarPattern:'' },
        { id:'3', text:'Better transport has increased the availability of fresh vegetables in small towns.', target:'availability', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'availability', wrong:['response', 'publicity', 'impact'] },
        { id:'2', answer:'availability', wrong:['packaging', 'manufacturing', 'architecture'] },
        { id:'3', answer:'availability', wrong:['humanity', 'architecture', 'minority'] }
      ]
    }),
  e('concerned', 'adjective',
    'worried about something that might be a problem',
    ['worried', 'anxious about a problem'],
    ['pleased that something has gone well', 'surprised by sudden news', 'bored by something that is repeated'],
    'The manager was concerned that the new machines were too noisy for the workers.',
    'worried', 'The manager was worried that the new machines were too noisy for the workers.',
    'troubled', 'Many parents feel troubled about how much time their children spend online.',
    {
      teacherNote:'Adjective: worried, especially about a possible problem (concerned about, concerned that). Boundary: in "the people concerned" the word means involved, a different sense that is not taught here. The noun concern and the adjective unconcerned are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Doctors are concerned about the number of office workers who sit all day without moving.', meaning:'worried about a possible problem' },
        { text:'Ana looked concerned when her manager asked to see her after the meeting.', meaning:'showing worry about what might happen' }
      ],
      situationDistractors:[
        'A worker smiled when she heard she had won an award.',
        'A team laughed at a funny video during their lunch break.',
        'A manager relaxed in the garden after a long week.'
      ],
      retrievalContexts:[
        { id:'1', text:'The engineer was concerned that the bridge might not survive a strong storm.', target:'concerned', grammarPattern:'' },
        { id:'2', text:'Many parents are concerned about the long hours their teenagers spend working in cafés.', target:'concerned', grammarPattern:'' },
        { id:'3', text:'Workers felt concerned when they heard that the factory might close.', target:'concerned', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'concerned', wrong:['qualified', 'established', 'presented'] },
        { id:'2', answer:'concerned', wrong:['transformed', 'launched', 'detailed'] },
        { id:'3', answer:'concerned', wrong:['qualified', 'established', 'detailed'] }
      ]
    }),
  e('complicated', 'adjective',
    'having many connected parts or steps, so it is difficult to understand or do',
    ['difficult to understand', 'full of confusing parts'],
    ['very simple and quick to finish', 'old and no longer used', 'expensive to buy and to repair'],
    'The instructions for the new coffee machine were so complicated that nobody could use it.',
    'difficult to understand', 'The instructions for the new coffee machine were so difficult to understand that nobody could use it.',
    'full of confusing steps', 'Applying for a work visa can be a process full of confusing steps, so many people ask for help.',
    {
      teacherNote:'Adjective: with many parts or steps, so hard to understand or deal with. Boundary: complicated describes how many parts or steps something has; difficult can describe effort alone (a difficult climb is not complicated). The verb complicate and the noun complication are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Building a car engine is a complicated job that needs hundreds of different parts.', meaning:'having many connected parts' },
        { text:'The tax form was so complicated that Lucy asked an expert to help her fill it in.', meaning:'hard to understand because of many details' }
      ],
      situationDistractors:[
        'A child switched on the light by pressing one large button.',
        'A worker opened a box by pulling a single strip of tape.',
        'A customer paid for a coffee by tapping her phone once.'
      ],
      retrievalContexts:[
        { id:'1', text:'The machine has a complicated system of pipes, wires and switches that only the engineer understands.', target:'complicated', grammarPattern:'' },
        { id:'2', text:'Explaining the rules of cricket to a visitor can be complicated, because there are so many of them.', target:'complicated', grammarPattern:'' },
        { id:'3', text:'The manager found the new timetable too complicated, so she drew a simpler version.', target:'complicated', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'complicated', wrong:['qualified', 'concerned', 'launched'] },
        { id:'2', answer:'complicated', wrong:['established', 'presented', 'qualified'] },
        { id:'3', answer:'complicated', wrong:['curved', 'qualified', 'concerned'] }
      ]
    }),
  e('curved', 'adjective',
    'having the shape of a smooth bend rather than a straight line',
    ['bent in a smooth line', 'rounded rather than straight'],
    ['having sharp corners and straight sides', 'very tall and narrow', 'broken into small pieces'],
    'The architect designed a building with curved walls and no sharp corners.',
    'smoothly bent', 'The architect designed a building with smoothly bent walls and no sharp corners.',
    'rounded', 'The new bridge has a rounded shape, like a rainbow over the river.',
    {
      teacherNote:'Adjective: shaped like a smooth bend, not straight (a curved roof, a curved line). Boundary: curved suggests a smooth, intended shape; bent can mean damaged out of shape. The only related form is curve (noun and verb), so no three-form family is taught.',
      masteryContexts:[
        { text:'The road follows a curved path around the lake, so drivers must slow down.', meaning:'bending smoothly instead of going straight' },
        { text:'Zaha Hadid became famous for buildings with curved roofs that look like waves.', meaning:'shaped in smooth bends' }
      ],
      situationDistractors:[
        'A carpenter cut a piece of wood into a perfect square.',
        'A designer drew a straight line across the page with a ruler.',
        'A builder made a wall with sharp corners at each end.'
      ],
      retrievalContexts:[
        { id:'1', text:'The new stadium has a curved roof that looks like a wave from the air.', target:'curved', grammarPattern:'' },
        { id:'2', text:'The designer used curved lines to make the logo look soft and friendly.', target:'curved', grammarPattern:'' },
        { id:'3', text:'Drivers must slow down on the curved section of road near the bridge.', target:'curved', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'curved', wrong:['qualified', 'concerned', 'launched'] },
        { id:'2', answer:'curved', wrong:['qualified', 'established', 'concerned'] },
        { id:'3', answer:'curved', wrong:['presented', 'qualified', 'launched'] }
      ]
    }),
  e('detailed', 'adjective',
    'giving many small facts or parts, not only the main points',
    ['full of small facts', 'giving every part carefully'],
    ['short and covering only the main idea', 'written quickly and carelessly', 'based on guesses rather than facts'],
    'The engineer wrote a detailed report on every problem she found in the factory.',
    'very full', 'The engineer wrote a very full report on every problem she found in the factory.',
    'thorough and complete', 'The inspectors asked for a thorough and complete plan of the new building before they would approve it.',
    {
      teacherNote:'Adjective: containing many facts or small parts (a detailed report, detailed drawings). Boundary: detailed is about how much information is included; complicated is about how hard something is to understand. Detail (noun) is the only other common form, so no three-form family is taught.',
      masteryContexts:[
        { text:'The architect made detailed drawings showing every window, door and light switch.', meaning:'showing many small parts' },
        { text:'The manager asked for a detailed explanation of why the delivery was late.', meaning:'giving all the facts and reasons' }
      ],
      situationDistractors:[
        'A manager wrote "Meeting at 3" on a sticky note.',
        'A worker gave a one-word answer when asked how her day was.',
        'A customer left a review that said only "Good".'
      ],
      retrievalContexts:[
        { id:'1', text:'Before building started, the team studied a detailed plan of every floor.', target:'detailed', grammarPattern:'' },
        { id:'2', text:'Customers can read a detailed description of each product on the website.', target:'detailed', grammarPattern:'' },
        { id:'3', text:'The police asked the witness for a detailed account of what she had seen.', target:'detailed', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'detailed', wrong:['curved', 'concerned', 'qualified'] },
        { id:'2', answer:'detailed', wrong:['concerned', 'qualified', 'launched'] },
        { id:'3', answer:'detailed', wrong:['curved', 'concerned', 'qualified'] }
      ]
    }),
  e('development', 'noun',
    'the process of creating a new product or idea and improving it over time',
    ['the creating of something new', 'the process of making and improving a product'],
    ['the selling of a product to customers', 'the repairing of a broken product', 'the packing of products into boxes'],
    'The development of the new phone took three years and cost millions.',
    'the creating and testing', 'The creating and testing of the new phone took three years and cost millions.',
    'the process of designing and improving', 'The process of designing and improving a new medicine can take more than ten years.',
    {
      teacherNote:'Noun: the work of creating something new and improving it (product development, the development of a drug). Boundary: development can also mean growth (child development) or new buildings on land; Unit 8 teaches the product and project sense. The verb develop and the noun developer are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The company spends a lot of money on the development of new electric cars.', meaning:'creating and improving new products' },
        { text:'Lena works in software development, writing and testing new apps for schools.', meaning:'the work of creating and improving programs' }
      ],
      situationDistractors:[
        'A cashier gave a customer change at the end of the day.',
        'A delivery driver unloaded boxes at the supermarket.',
        'A cleaner emptied the bins in the office.'
      ],
      retrievalContexts:[
        { id:'1', text:'The development of the new vaccine took scientists more than five years.', target:'development', grammarPattern:'' },
        { id:'2', text:'Our company invests heavily in the development of greener engines.', target:'development', grammarPattern:'' },
        { id:'3', text:'After two years of development, the game was finally ready to sell.', target:'development', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'development', wrong:['publicity', 'packaging', 'minority'] },
        { id:'2', answer:'development', wrong:['humanity', 'minority', 'architecture'] },
        { id:'3', answer:'development', wrong:['wellbeing', 'packaging', 'employment'] }
      ]
    }),
  e('elements', 'noun',
    'the separate parts that together make up something',
    ['separate parts of a whole', 'different pieces that make something'],
    ['the rules that control how something is used', 'the materials that are left over after work', 'the people who are in charge of a project'],
    'Light, colour and space are the main elements of the architect’s design.',
    'parts', 'Light, colour and space are the main parts of the architect’s design.',
    'important parts', 'Good teamwork and clear planning are important parts of any successful project.',
    {
      teacherNote:'Plural noun: the separate parts that make up a whole (the elements of a design, key elements of a job). Boundary: in science, an element is a basic chemical substance such as oxygen; Unit 8 teaches the general "part" sense. No family is taught because elementary has moved away to mean basic.',
      masteryContexts:[
        { text:'A good advert has three elements: a clear picture, a short message and the company’s name.', meaning:'separate parts that together make a whole' },
        { text:'Customer service and teamwork are important elements of working in a hotel.', meaning:'parts that together make up a job' }
      ],
      situationDistractors:[
        'A worker arrived ten minutes late for her shift.',
        'A manager booked a taxi to the airport.',
        'A cook burnt the toast and opened the window.'
      ],
      retrievalContexts:[
        { id:'1', text:'The design combines elements of traditional and modern style.', target:'elements', grammarPattern:'' },
        { id:'2', text:'Teamwork and good communication are key elements of any successful project.', target:'elements', grammarPattern:'' },
        { id:'3', text:'The music, the colours and the costumes were the elements of the film that critics praised most.', target:'elements', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'elements', wrong:['regulations', 'inspectors', 'facilities'] },
        { id:'2', answer:'elements', wrong:['inspectors', 'regulations', 'ingredients'] },
        { id:'3', answer:'elements', wrong:['inspectors', 'facilities', 'regulations'] }
      ]
    }),
  e('established', 'adjective',
    'having existed for a long time and being accepted or respected',
    ['long-standing and respected', 'well known after many years'],
    ['recently started and still unknown', 'closed down after a short time', 'owned and run by the government'],
    'She left a small start-up to work for an established company with a hundred years of history.',
    'long-standing and respected', 'She left a small start-up to work for a long-standing and respected company with a hundred years of history.',
    'well-known and long-running', 'Tom prefers to buy from a well-known and long-running brand rather than a new one.',
    {
      teacherNote:'Adjective: having existed for a long time and being accepted (an established company, an established artist). Boundary: as a verb (established in 1920) it means started or set up; the adjective focuses on being long-standing. The verb establish and the noun establishment are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Customers trust established brands more than new ones they have never heard of.', meaning:'existing for many years and trusted' },
        { text:'After twenty years of work, she is now an established artist whose paintings sell around the world.', meaning:'recognised and respected after many years' }
      ],
      situationDistractors:[
        'Two friends opened a new café last week.',
        'A student set up an online shop from her bedroom yesterday.',
        'A small company closed after only six months.'
      ],
      retrievalContexts:[
        { id:'1', text:'Many graduates prefer to join established firms rather than new start-ups.', target:'established', grammarPattern:'' },
        { id:'2', text:'The bakery is now well established in the town after forty years of business.', target:'established', grammarPattern:'' },
        { id:'3', text:'Only established artists are invited to show their work at the national gallery.', target:'established', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'established', wrong:['curved', 'concerned', 'detailed'] },
        { id:'2', answer:'established', wrong:['curved', 'concerned', 'presented'] },
        { id:'3', answer:'established', wrong:['concerned', 'curved', 'launched'] }
      ]
    }),
  e('facilities', 'noun',
    'buildings, rooms, equipment or services provided for a particular purpose',
    ['buildings and equipment for a purpose', 'places and services provided for people'],
    ['the workers who run a business', 'the rules that visitors must follow', 'the money that a company earns'],
    'The school’s sports facilities include a pool, two gyms and a running track.',
    'places and equipment for sport', 'The school’s places and equipment for sport include a pool, two gyms and a running track.',
    'rooms and equipment', 'Staff can use the rooms and equipment on the top floor, such as the kitchen and the showers.',
    {
      idKey:'facilities_8',
      teacherNote:'Plural noun: buildings, rooms, equipment or services provided for a purpose (sports facilities, training facilities). Boundary: facilities are things people can use; they are not the workers or the rules of a place. No family is taught: facility in the singular often means a natural ability, and facilitate is a formal verb with a different meaning.',
      masteryContexts:[
        { text:'The hospital has modern facilities for treating patients with heart problems.', meaning:'equipment and rooms provided for a purpose' },
        { text:'Workers at the factory complained that the washing facilities were dirty and broken.', meaning:'rooms and equipment for washing' }
      ],
      situationDistractors:[
        'A manager told her team that the deadline had moved.',
        'A worker phoned in sick on Monday morning.',
        'An employee asked for a pay rise after two years.'
      ],
      retrievalContexts:[
        { id:'1', text:'The hotel’s facilities include a pool, a gym and a business centre.', target:'facilities', grammarPattern:'' },
        { id:'2', text:'The village has few facilities for young people, so many of them travel to the city at weekends.', target:'facilities', grammarPattern:'' },
        { id:'3', text:'Staff can use the training facilities on the top floor during their lunch break.', target:'facilities', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'facilities', wrong:['inspectors', 'regulations', 'ingredients'] },
        { id:'2', answer:'facilities', wrong:['regulations', 'inspectors', 'ingredients'] },
        { id:'3', answer:'facilities', wrong:['inspectors', 'elements', 'regulations'] }
      ]
    }),
  e('feature', 'noun',
    'a typical or noticeable part or quality of a design, product or place',
    ['noticeable part', 'typical quality'],
    ['the price of a product in the shops', 'a mistake found in a finished design', 'the person who designs a product'],
    'One feature of the new office is a rooftop garden where staff can relax.',
    'special part', 'One special part of the new office is a rooftop garden where staff can relax.',
    'noticeable quality', 'The large windows are the most noticeable quality of the architect’s design.',
    {
      idKey:'feature_8',
      teacherNote:'Noun: a typical or noticeable part or quality of a design, product or place (a safety feature, a key feature). Unit 8 uses it for designs and products at work; Unit 2 taught the same core sense in a travel context. As a verb (the film features...) it means to include as an important part, which is not taught here.',
      masteryContexts:[
        { text:'The phone’s best feature is a battery that lasts for three days.', meaning:'an important or noticeable part of a product' },
        { text:'Large windows are a typical feature of the architect’s buildings.', meaning:'a part or quality that is often seen' }
      ],
      situationDistractors:[
        'A worker took the lift to the fifth floor.',
        'A manager left the office early to catch a train.',
        'A cleaner swept the floor of the empty canteen.'
      ],
      retrievalContexts:[
        { id:'1', text:'A key feature of the new building is its rooftop garden.', target:'feature', grammarPattern:'' },
        { id:'2', text:'The car’s most popular safety feature is a camera that helps you park.', target:'feature', grammarPattern:'' },
        { id:'3', text:'Curved walls are a typical feature of her designs.', target:'feature', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'feature', wrong:['response', 'minority', 'source'] },
        { id:'2', answer:'feature', wrong:['response', 'assignment', 'instructor'] },
        { id:'3', answer:'feature', wrong:['response', 'minority', 'humanity'] }
      ]
    }),
  e('humanity', 'noun',
    'all the people in the world, thought of together',
    ['all people', 'the human race'],
    ['the people who live in one country', 'a group of experts who study people', 'the rules that people must obey'],
    'The scientist believes her research on clean water will benefit humanity.',
    'all people', 'The scientist believes her research on clean water will benefit all people.',
    'the whole human race', 'Climate change is a problem for the whole human race, not just for one country.',
    {
      teacherNote:'Noun: all people in the world, considered together (benefit humanity, the future of humanity). Boundary: humanity can also mean kindness towards others (he showed great humanity); Unit 8 teaches the "all people" sense. The adjectives human and humanitarian are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The invention of the vaccine was one of the greatest achievements in the history of humanity.', meaning:'all people in the world, over time' },
        { text:'The engineer said she wanted her designs to help humanity, not just to make money.', meaning:'people everywhere' }
      ],
      situationDistractors:[
        'A manager gave a gift to one worker who had helped her.',
        'A shop owner lowered prices for customers in her street.',
        'A coach helped one player improve his kicking.'
      ],
      retrievalContexts:[
        { id:'1', text:'Clean water is one of the most important needs of humanity.', target:'humanity', grammarPattern:'' },
        { id:'2', text:'Many scientists believe that climate change is the greatest threat facing humanity.', target:'humanity', grammarPattern:'' },
        { id:'3', text:'The inventor hoped her machine would be useful to all of humanity.', target:'humanity', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'humanity', wrong:['packaging', 'publicity', 'architecture'] },
        { id:'2', answer:'humanity', wrong:['packaging', 'architecture', 'publicity'] },
        { id:'3', answer:'humanity', wrong:['packaging', 'publicity', 'availability'] }
      ]
    }),
  e('impact', 'noun',
    'a strong effect that something has on a situation or a person',
    ['strong effect', 'powerful influence'],
    ['a short report about an event', 'a reason for making a decision', 'a rule that controls a situation'],
    'New technology has had a huge impact on the way people work.',
    'effect', 'New technology has had a huge effect on the way people work.',
    'strong effect', 'Losing her job had a strong effect on Maria’s confidence.',
    {
      teacherNote:'Noun: a strong effect (have an impact on, a big impact). Boundary: impact also means the force of one thing hitting another (on impact); Unit 8 teaches the effect sense. No family is taught: the verb impact shares the spelling and impactful is informal.',
      masteryContexts:[
        { text:'The factory closing had a serious impact on the small town, where many families lost their income.', meaning:'a strong effect on a place' },
        { text:'The trainer’s advice had a big impact on how confident the new staff felt.', meaning:'a strong influence on people' }
      ],
      situationDistractors:[
        'A worker forgot to bring her umbrella, but it did not rain.',
        'A new poster was put up in the corridor, but nobody noticed it.',
        'The manager changed the font on a form, and nothing else happened.'
      ],
      retrievalContexts:[
        { id:'1', text:'Social media has had a huge impact on the way companies advertise.', target:'impact', grammarPattern:'' },
        { id:'2', text:'The new road had a positive impact on local businesses.', target:'impact', grammarPattern:'' },
        { id:'3', text:'Scientists are studying the impact of plastic on ocean wildlife.', target:'impact', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'impact', wrong:['response', 'source', 'feature'] },
        { id:'2', answer:'impact', wrong:['source', 'minority', 'feature'] },
        { id:'3', answer:'impact', wrong:['packaging', 'assignment', 'response'] }
      ]
    }),
  e('ingredients', 'noun',
    'the foods or substances that are combined to make a product, especially a food',
    ['foods mixed to make a product', 'things combined in a recipe'],
    ['the machines used to cook food in a factory', 'the boxes and wrappers that food is sold in', 'the people who test new foods'],
    'The nutritionist checked the ingredients of every new snack before it went on sale.',
    'contents', 'The nutritionist checked the contents of every new snack before it went on sale.',
    'foods that go into', 'Shoppers want to know the foods that go into a packet of biscuits.',
    {
      idKey:'ingredients_8',
      teacherNote:'Plural noun: the foods or substances combined to make a product (natural ingredients, a list of ingredients). Unit 8 uses it in food manufacturing and product development; Unit 3 taught it for cooking a dish. No family is taught: the singular ingredient is the same word.',
      masteryContexts:[
        { text:'The company uses only natural ingredients, so its juices contain no added sugar or colours.', meaning:'the things that a product is made from' },
        { text:'By law, the packet must list all the ingredients, starting with the largest amount.', meaning:'the foods combined in a product' }
      ],
      situationDistractors:[
        'A driver loaded boxes of biscuits onto a lorry.',
        'A shop assistant put price labels on tins of soup.',
        'A cleaner washed the factory floor after the night shift.'
      ],
      retrievalContexts:[
        { id:'1', text:'The cereal is made from simple ingredients such as oats, honey and nuts.', target:'ingredients', grammarPattern:'' },
        { id:'2', text:'Food companies must list all the ingredients on the back of the packet.', target:'ingredients', grammarPattern:'' },
        { id:'3', text:'The chef buys fresh ingredients from local farms every morning.', target:'ingredients', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'ingredients', wrong:['facilities', 'regulations', 'structures'] },
        { id:'2', answer:'ingredients', wrong:['inspectors', 'facilities', 'structures'] },
        { id:'3', answer:'ingredients', wrong:['regulations', 'structures', 'inspectors'] }
      ]
    }),
  e('innovation', 'noun',
    'a new idea, method or product, or the process of creating new things',
    ['a new idea or method', 'the creating of new things'],
    ['an old method that is still used', 'a copy of another company’s product', 'a rule that stops change'],
    'The company won a prize for innovation after designing a phone made from recycled plastic.',
    'creating new ideas', 'The company won a prize for creating new ideas after designing a phone made from recycled plastic.',
    'new idea', 'Online banking was a new idea that changed the way people manage money.',
    {
      teacherNote:'Noun: a new idea, method or product, or the act of introducing new things (technological innovation, encourage innovation). Boundary: an invention is a completely new thing that someone has made; an innovation can also be a new way of improving something that already exists. The verb innovate and the adjective innovative are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The touch screen was an innovation that changed the way people use phones.', meaning:'a new idea or product' },
        { text:'The company encourages innovation by giving staff one day a week to work on their own ideas.', meaning:'the creating of new ideas and methods' }
      ],
      situationDistractors:[
        'A worker followed the same steps she had used for twenty years.',
        'A factory copied a design that another company had made years ago.',
        'A manager told staff to keep doing things the old way.'
      ],
      retrievalContexts:[
        { id:'1', text:'The electric car was a major innovation when it first appeared.', target:'innovation', grammarPattern:'' },
        { id:'2', text:'Governments should support innovation in clean energy.', target:'innovation', grammarPattern:'' },
        { id:'3', text:'Staff are given time every week to test their own ideas, which drives innovation across the company.', target:'innovation', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'innovation', wrong:['response', 'minority', 'assignment'] },
        { id:'2', answer:'innovation', wrong:['minority', 'humanity', 'wellbeing'] },
        { id:'3', answer:'innovation', wrong:['minority', 'humanity', 'architecture'] }
      ]
    }),
  e('inspiration', 'noun',
    'a person or thing that gives you new ideas or makes you want to do something',
    ['source of ideas', 'something that makes you want to create'],
    ['a rule that tells you what to do', 'a mistake that you learn from', 'a reward for finishing a task'],
    'The architect said that nature was the inspiration for her curved buildings.',
    'source of ideas', 'The architect said that nature was the source of ideas for her curved buildings.',
    'what gave her the idea', 'Her grandmother’s garden was what gave her the idea for her first collection of dresses.',
    {
      teacherNote:'Noun: a person or thing that gives you ideas or makes you want to do something (the inspiration for, a source of inspiration). Boundary: inspiration is what starts the idea; motivation is the reason you keep working. The verb inspire and the adjective inspiring are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The designer found inspiration for her new fabrics in the colours of the desert.', meaning:'ideas that come from something' },
        { text:'Her first coach was a real inspiration, and she still remembers his advice.', meaning:'a person who makes you want to do well' }
      ],
      situationDistractors:[
        'A designer copied an old pattern exactly from a book.',
        'A worker felt bored and stared at the empty page.',
        'A manager signed some forms without reading them.'
      ],
      retrievalContexts:[
        { id:'1', text:'The architect said that the shape of a shell was the inspiration for the new museum.', target:'inspiration', grammarPattern:'' },
        { id:'2', text:'Many young engineers see her as an inspiration because of what she has achieved.', target:'inspiration', grammarPattern:'' },
        { id:'3', text:'The designer looks for inspiration in old photographs and street art.', target:'inspiration', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'inspiration', wrong:['response', 'assignment', 'publicity'] },
        { id:'2', answer:'inspiration', wrong:['assignment', 'innovation', 'impact'] },
        { id:'3', answer:'inspiration', wrong:['response', 'employment', 'packaging'] }
      ]
    }),
  e('inspectors', 'noun',
    'officials whose job is to check that rules and standards are being followed',
    ['officials who check standards', 'people who examine places for problems'],
    ['workers who build new machines', 'people who sell products to shops', 'teachers who train new staff'],
    'Food inspectors visit restaurants without warning to check that the kitchens are clean.',
    'officials who check food safety', 'Officials who check food safety visit restaurants without warning to see that the kitchens are clean.',
    'official checkers', 'Official checkers from the council examined the new building before anyone could move in.',
    {
      teacherNote:'Plural noun: officials whose job is to check that places, products or work meet rules and standards (safety inspectors, food inspectors). Boundary: inspectors check and report; they do not usually fix the problems themselves. The verb inspect and the noun inspection are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The factory was closed after inspectors found that the fire exits were blocked.', meaning:'officials who check safety' },
        { text:'School inspectors watched several lessons and then wrote a report on the quality of teaching.', meaning:'officials who judge standards' }
      ],
      situationDistractors:[
        'A builder laid bricks for a new wall.',
        'A chef cooked dinner for a large group of guests.',
        'A shop assistant helped a customer choose a jacket.'
      ],
      retrievalContexts:[
        { id:'1', text:'The restaurant was closed after inspectors found mice in the kitchen.', target:'inspectors', grammarPattern:'' },
        { id:'2', text:'Safety inspectors check every new lift before it can carry passengers.', target:'inspectors', grammarPattern:'' },
        { id:'3', text:'Before the school opened, government inspectors examined every classroom and the playground.', target:'inspectors', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'inspectors', wrong:['facilities', 'regulations', 'structures'] },
        { id:'2', answer:'inspectors', wrong:['ingredients', 'structures', 'facilities'] },
        { id:'3', answer:'inspectors', wrong:['regulations', 'ingredients', 'elements'] }
      ]
    }),
  e('instructor', 'noun',
    'a person whose job is to teach a practical skill, such as driving or swimming',
    ['teacher of a practical skill', 'person who teaches a skill'],
    ['a person who checks that rules are followed', 'a person who manages a large company', 'a person who writes instructions for machines'],
    'My driving instructor told me to check the mirrors before turning.',
    'teacher', 'My driving teacher told me to check the mirrors before turning.',
    'person who teaches skiing', 'The person who teaches skiing showed the beginners how to stop safely.',
    {
      teacherNote:'Noun: a person who teaches a practical skill or activity (a driving instructor, a fitness instructor). Boundary: an instructor teaches a skill or activity; a trainer usually improves the skills of staff or athletes over time; a teacher works with school subjects. The verb instruct and the noun instructions are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The swimming instructor stood in the water and showed the children how to kick their legs.', meaning:'a person who teaches a practical activity' },
        { text:'After passing the course, Ben became a qualified diving instructor in Egypt.', meaning:'someone paid to teach a skill' }
      ],
      situationDistractors:[
        'A man read a book about cars on the train.',
        'A girl practised the piano alone in her room.',
        'A mechanic repaired a broken engine.'
      ],
      retrievalContexts:[
        { id:'1', text:'The ski instructor showed the beginners how to stop safely.', target:'instructor', grammarPattern:'' },
        { id:'2', text:'Every new driver should have lessons with a qualified instructor.', target:'instructor', grammarPattern:'' },
        { id:'3', text:'Our fitness instructor shouts encouragement throughout the class.', target:'instructor', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'instructor', wrong:['nutritionist', 'scientist', 'landscape'] },
        { id:'2', answer:'instructor', wrong:['nutritionist', 'scientist', 'director'] },
        { id:'3', answer:'instructor', wrong:['scientist', 'engineer', 'operator'] }
      ]
    }),
  e('launched', 'verb',
    'started selling a new product or started a new project or activity',
    ['introduced to the public', 'started selling'],
    ['stopped making and took off sale', 'repaired and returned to customers', 'tested secretly in a laboratory'],
    'The company launched its new electric bike at a trade fair in Berlin.',
    'introduced', 'The company introduced its new electric bike at a trade fair in Berlin.',
    'put on sale for the first time', 'The new game was put on sale for the first time at midnight, and hundreds of people queued.',
    {
      teacherNote:'Verb (past tense or past participle): started selling a new product or began a new project or campaign (launched a product, launched a campaign). Boundary: launch can also mean send a rocket or a boat into the air or water; Unit 8 teaches the business sense. The noun and base verb launch share one spelling, so no three-form family is taught.',
      masteryContexts:[
        { text:'The charity launched a campaign to collect old phones for recycling.', meaning:'started a new activity' },
        { text:'The café launched a new menu last month, and sales have doubled.', meaning:'introduced for the first time' }
      ],
      situationDistractors:[
        'A shop stopped selling a sweet that nobody bought.',
        'A factory closed down after fifty years.',
        'A company took an old phone off the market.'
      ],
      retrievalContexts:[
        { id:'1', text:'The company launched its new phone at a big event in London.', target:'launched', grammarPattern:'' },
        { id:'2', text:'The charity launched a campaign to plant a million trees.', target:'launched', grammarPattern:'' },
        { id:'3', text:'Since the café launched its breakfast menu, it has been busy every morning.', target:'launched', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'launched', wrong:['concerned', 'qualified', 'detailed'] },
        { id:'2', answer:'launched', wrong:['qualified', 'concerned', 'curved'] },
        { id:'3', answer:'launched', wrong:['concerned', 'qualified', 'curved'] }
      ]
    }),
  e('landscape', 'noun',
    'everything you can see across an area of land, such as hills, fields and trees',
    ['the scenery of an area', 'the view of the land'],
    ['the buildings in the centre of a city', 'a map that shows roads and towns', 'the weather in a particular region'],
    'The architect designed the hotel so that it fits into the landscape of hills and forests.',
    'the scenery', 'The architect designed the hotel so that it fits into the scenery of hills and forests.',
    'the countryside around it', 'The new wind farm has changed the countryside around it, and some people dislike the view.',
    {
      idKey:'landscape_8',
      teacherNote:'Noun: everything you can see across an area of land (a rural landscape, the landscape around a building). Unit 8 uses it for designers who plan buildings and gardens to fit their surroundings; Unit 4 taught the same core sense for travel. No family is taught.',
      masteryContexts:[
        { text:'The new factory was painted green so that it would not spoil the landscape.', meaning:'the scenery of the area' },
        { text:'Gardeners planted trees and built small hills to change the flat landscape around the office.', meaning:'the shape and look of the land' }
      ],
      situationDistractors:[
        'A worker typed a report in a small office with no windows.',
        'A cook chopped onions in a busy kitchen.',
        'A mechanic changed the oil in a car.'
      ],
      retrievalContexts:[
        { id:'1', text:'The new wind turbines have changed the landscape of the valley.', target:'landscape', grammarPattern:'' },
        { id:'2', text:'Photographers travel to the region to capture its wild landscape of mountains and lakes.', target:'landscape', grammarPattern:'' },
        { id:'3', text:'The architect designed low buildings that sit quietly in the landscape.', target:'landscape', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'landscape', wrong:['packaging', 'publicity', 'wellbeing'] },
        { id:'2', answer:'landscape', wrong:['packaging', 'manufacturing', 'employment'] },
        { id:'3', answer:'landscape', wrong:['packaging', 'publicity', 'employment'] }
      ]
    }),
  e('manufacturing', 'noun',
    'the business of making goods in large numbers, usually in factories using machines',
    ['factory production of goods', 'making goods in large quantities'],
    ['selling goods to customers in shops', 'designing a single item by hand', 'moving goods from one country to another'],
    'Many jobs in manufacturing have been lost because factories now use robots.',
    'factory production', 'Many jobs in factory production have been lost because factories now use robots.',
    'the making of goods in factories', 'The town grew rich from the making of goods in factories, especially cars and steel.',
    {
      teacherNote:'Noun: making goods in large numbers, usually in factories (the manufacturing industry, car manufacturing). Boundary: manufacturing is mass production; a craftsperson making one item by hand is not manufacturing. The verb manufacture and the noun manufacturer are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'In the north of the country, manufacturing is still important, and many people work in car factories.', meaning:'making goods in factories' },
        { text:'The company moved its manufacturing to a larger site so that it could produce more phones.', meaning:'the making of its products' }
      ],
      situationDistractors:[
        'A potter made one bowl by hand for a friend.',
        'A shop assistant arranged sweaters on a display table.',
        'A lorry driver delivered goods to a supermarket.'
      ],
      retrievalContexts:[
        { id:'1', text:'The town’s economy depends on manufacturing, especially of cars and steel.', target:'manufacturing', grammarPattern:'' },
        { id:'2', text:'Robots have replaced many workers in manufacturing.', target:'manufacturing', grammarPattern:'' },
        { id:'3', text:'The company moved its manufacturing to a factory near the port to cut transport costs.', target:'manufacturing', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'manufacturing', wrong:['packaging', 'wellbeing', 'humanity'] },
        { id:'2', answer:'manufacturing', wrong:['wellbeing', 'humanity', 'minority'] },
        { id:'3', answer:'manufacturing', wrong:['wellbeing', 'publicity', 'humanity'] }
      ]
    }),
  e('minority', 'noun',
    'the smaller part of a group, less than half',
    ['less than half', 'a smaller number of a group'],
    ['more than half of a group', 'every single member of a group', 'the leader of a group'],
    'Only a minority of the staff voted for the new working hours.',
    'a small number', 'Only a small number of the staff voted for the new working hours.',
    'fewer than half', 'In this factory, fewer than half of the workers are women.',
    {
      teacherNote:'Noun: the smaller part of a group, less than half (a minority of students, only a small minority). Boundary: minority can also mean a group of people who differ in race or religion from most of a population; Unit 8 teaches the "less than half" sense. Its opposite, majority, is a different word, so no family is taught.',
      masteryContexts:[
        { text:'A minority of customers complained about the new packaging, but most were happy with it.', meaning:'fewer than half of a group' },
        { text:'In this company, women are still a minority of the engineers, though the number is growing.', meaning:'a smaller part of a group' }
      ],
      situationDistractors:[
        'Ninety per cent of the workers voted for the new plan.',
        'Every employee attended the training day.',
        'Most of the customers chose the cheaper option.'
      ],
      retrievalContexts:[
        { id:'1', text:'Only a minority of students choose to study engineering at university.', target:'minority', grammarPattern:'' },
        { id:'2', text:'The new rule was supported by a small minority of the workers.', target:'minority', grammarPattern:'' },
        { id:'3', text:'Women were a minority in the factory until the 1940s.', target:'minority', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'minority', wrong:['humanity', 'publicity', 'availability'] },
        { id:'2', answer:'minority', wrong:['humanity', 'publicity', 'response'] },
        { id:'3', answer:'minority', wrong:['humanity', 'publicity', 'technology'] }
      ]
    }),
  e('packaging', 'noun',
    'the boxes, bottles, paper or plastic in which goods are wrapped for sale',
    ['materials used to wrap products', 'boxes and wrappers for goods'],
    ['the goods that are inside a box', 'the price label on a product', 'the advertising for a new product'],
    'The company switched to paper packaging to reduce the amount of plastic it used.',
    'wrapping', 'The company switched to paper wrapping to reduce the amount of plastic it used.',
    'boxes and wrappers', 'Supermarkets are trying to use fewer plastic boxes and wrappers for fruit.',
    {
      teacherNote:'Noun (uncountable): the boxes, bottles, paper or plastic that products are sold in (plastic packaging, recyclable packaging). Boundary: packaging is the material around a product; the product itself and its label are different. The verb pack and the noun package are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Customers complained that the toy came in too much plastic packaging.', meaning:'the material that a product is wrapped in' },
        { text:'The designer chose bright packaging so that the new juice would stand out on the shelf.', meaning:'the box or bottle a product is sold in' }
      ],
      situationDistractors:[
        'A chef tasted the soup before serving it.',
        'A salesman explained the price of a new car.',
        'A scientist tested a new medicine in a laboratory.'
      ],
      retrievalContexts:[
        { id:'1', text:'Too much plastic packaging ends up in the sea.', target:'packaging', grammarPattern:'' },
        { id:'2', text:'The designer was asked to create eye-catching packaging for a new chocolate bar.', target:'packaging', grammarPattern:'' },
        { id:'3', text:'Customers are choosing products with less packaging to reduce waste.', target:'packaging', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'packaging', wrong:['manufacturing', 'wellbeing', 'humanity'] },
        { id:'2', answer:'packaging', wrong:['wellbeing', 'humanity', 'minority'] },
        { id:'3', answer:'packaging', wrong:['wellbeing', 'publicity', 'humanity'] }
      ]
    }),
  e('presented', 'verb',
    'formally showed or explained something to a group of people',
    ['showed formally', 'explained to an audience'],
    ['kept secret from other people', 'threw away without using', 'copied from another person'],
    'The architect presented her design to the clients at Monday’s meeting.',
    'showed', 'The architect showed her design to the clients at Monday’s meeting.',
    'talked through', 'The team talked through their sales figures in front of the whole company.',
    {
      teacherNote:'Verb (past tense or past participle): formally showed or explained something to a group (presented a plan, presented the results to the board). Boundary: presented can also mean formally gave (presented an award to); Unit 8 focuses on showing and explaining at work. The nouns presentation and presenter are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The scientist presented her results at a conference in Tokyo.', meaning:'explained formally to an audience' },
        { text:'Each team presented its idea for a new product to a panel of judges.', meaning:'showed and explained to a group' }
      ],
      situationDistractors:[
        'A manager read an email silently at her desk.',
        'A designer kept her drawings locked in a drawer.',
        'A worker wrote notes in his private diary.'
      ],
      retrievalContexts:[
        { id:'1', text:'The students presented their project to the whole school in assembly.', target:'presented', grammarPattern:'' },
        { id:'2', text:'At the meeting, the director presented a plan to open three new shops.', target:'presented', grammarPattern:'' },
        { id:'3', text:'The engineer presented the results of the safety tests to the inspectors.', target:'presented', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'presented', wrong:['concerned', 'qualified', 'curved'] },
        { id:'2', answer:'presented', wrong:['qualified', 'concerned', 'curved'] },
        { id:'3', answer:'presented', wrong:['concerned', 'curved', 'established'] }
      ]
    }),
  e('publicity', 'noun',
    'attention from newspapers, television and the internet, or the work of getting this attention',
    ['public attention', 'media attention'],
    ['money that a company earns', 'a private meeting between managers', 'a written agreement between companies'],
    'The new restaurant got a lot of publicity when a famous chef visited it.',
    'media attention', 'The new restaurant got a lot of media attention when a famous chef visited it.',
    'public attention', 'The company’s silly advert attracted public attention on social media.',
    {
      teacherNote:'Noun: attention from newspapers, television and the internet, or work done to get that attention (good publicity, a publicity campaign). Boundary: publicity is attention from the public and the media; advertising is paid messages. The adjective public and the verb publicise are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The film star’s visit gave the small bookshop a lot of publicity.', meaning:'attention from newspapers and television' },
        { text:'The company hired a team to handle publicity for the launch of its new phone.', meaning:'activities to get noticed by many people' }
      ],
      situationDistractors:[
        'A shop owner quietly counted her stock after closing.',
        'A worker kept his promotion a secret from his friends.',
        'A company held a private meeting with no reporters.'
      ],
      retrievalContexts:[
        { id:'1', text:'The charity received a lot of publicity after a famous singer joined its campaign.', target:'publicity', grammarPattern:'' },
        { id:'2', text:'Bad publicity can damage a company’s reputation very quickly.', target:'publicity', grammarPattern:'' },
        { id:'3', text:'The band used social media for publicity before their first concert.', target:'publicity', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'publicity', wrong:['humanity', 'minority', 'availability'] },
        { id:'2', answer:'publicity', wrong:['humanity', 'minority', 'architecture'] },
        { id:'3', answer:'publicity', wrong:['humanity', 'minority', 'architecture'] }
      ]
    }),
  e('qualified', 'adjective',
    'having passed the exams or training needed to do a particular job',
    ['trained and certified', 'officially trained for a job'],
    ['interested in a job but not yet trained', 'very experienced but without exams', 'paid more than other workers'],
    'Only qualified electricians are allowed to repair the wiring in the building.',
    'trained and certified', 'Only trained and certified electricians are allowed to repair the wiring in the building.',
    'fully trained', 'The hospital needs more fully trained nurses for the night shift.',
    {
      teacherNote:'Adjective: having passed the exams or training needed for a job (a qualified teacher, qualified to do something). Boundary: qualified is about official training; experienced is about time spent doing the job. The verb qualify and the adjective unqualified are taught in the Word Family pathway; qualification is not repeated because it is a Unit 5 and Unit 7 target.',
      masteryContexts:[
        { text:'Ella is a qualified engineer, so she can sign the safety certificate for the bridge.', meaning:'having the official training for a job' },
        { text:'After three years of training, Sam is now qualified to teach swimming.', meaning:'officially able to do a job because of training' }
      ],
      situationDistractors:[
        'A boy who had never had a lesson tried to fix a car engine.',
        'A volunteer with no training helped carry boxes at a charity shop.',
        'A student read about first aid online for the first time.'
      ],
      retrievalContexts:[
        { id:'1', text:'The school is looking for a qualified maths teacher to start in September.', target:'qualified', grammarPattern:'' },
        { id:'2', text:'You must be qualified to give medical advice to patients.', target:'qualified', grammarPattern:'' },
        { id:'3', text:'She is highly qualified, with a degree and ten years of training in law.', target:'qualified', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'qualified', wrong:['curved', 'concerned', 'launched'] },
        { id:'2', answer:'qualified', wrong:['curved', 'launched', 'detailed'] },
        { id:'3', answer:'qualified', wrong:['curved', 'launched', 'presented'] }
      ]
    }),
  e('regulations', 'noun',
    'official rules made by a government or organisation that people must obey',
    ['official rules', 'rules set by authorities'],
    ['suggestions that people can ignore', 'reports written about a business', 'prizes given for good work'],
    'New regulations say that all workers on building sites must wear helmets.',
    'official rules', 'New official rules say that all workers on building sites must wear helmets.',
    'rules set by the government', 'In Europe, rules set by the government limit how many hours lorry drivers can work.',
    {
      teacherNote:'Plural noun: official rules made by a government or organisation (safety regulations, follow the regulations). Boundary: regulations are official and must be obeyed; guidelines are advice. The verb regulate and the noun regulator are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The factory was fined because it broke safety regulations.', meaning:'official rules that must be followed' },
        { text:'Under the new regulations, restaurants must show how many calories are in each dish.', meaning:'official rules made by the government' }
      ],
      situationDistractors:[
        'A friend suggested trying a new café for lunch.',
        'A manager thanked her team for their hard work.',
        'A worker chose to wear a blue shirt on Friday.'
      ],
      retrievalContexts:[
        { id:'1', text:'Food companies must follow strict regulations about cleanliness.', target:'regulations', grammarPattern:'' },
        { id:'2', text:'The factory was closed for breaking fire regulations.', target:'regulations', grammarPattern:'' },
        { id:'3', text:'New regulations limit the number of hours that pilots can fly each week.', target:'regulations', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'regulations', wrong:['ingredients', 'facilities', 'structures'] },
        { id:'2', answer:'regulations', wrong:['inspectors', 'elements', 'structures'] },
        { id:'3', answer:'regulations', wrong:['ingredients', 'facilities', 'elements'] }
      ]
    }),
  e('relentless', 'adjective',
    'continuing in a strong way without stopping or becoming weaker',
    ['never stopping', 'continuing without a break'],
    ['happening only once in a while', 'gentle and easy to manage', 'stopping as soon as it begins'],
    'The team worked under relentless pressure to finish the project on time.',
    'constant', 'The team worked under constant pressure to finish the project on time.',
    'non-stop', 'The non-stop rain flooded the building site for a week.',
    {
      teacherNote:'Adjective: continuing strongly without stopping or becoming weaker (relentless pressure, relentless rain, a relentless effort). Boundary: relentless can describe something unpleasant (relentless noise) or a person’s determination (a relentless worker). The adverb relentlessly is the only other common form, so no family is taught.',
      masteryContexts:[
        { text:'The relentless noise from the building site made it impossible to concentrate.', meaning:'going on without any pause' },
        { text:'Her relentless hard work over ten years made the small business a success.', meaning:'continuing strongly without giving up' }
      ],
      situationDistractors:[
        'It rained for five minutes and then the sun came out.',
        'A worker took a long break after every small task.',
        'The phone rang once in the afternoon and then stayed silent.'
      ],
      retrievalContexts:[
        { id:'1', text:'The workers complained about the relentless heat inside the factory.', target:'relentless', grammarPattern:'' },
        { id:'2', text:'After weeks of relentless rain, the building site turned into mud.', target:'relentless', grammarPattern:'' },
        { id:'3', text:'The new manager put the staff under relentless pressure to sell more.', target:'relentless', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'relentless', wrong:['creative', 'traditional', 'qualified'] },
        { id:'2', answer:'relentless', wrong:['creative', 'sustainable', 'detailed'] },
        { id:'3', answer:'relentless', wrong:['creative', 'traditional', 'sustainable'] }
      ]
    }),
  e('response', 'noun',
    'an answer or reaction to something that has been said or done',
    ['reaction', 'reply'],
    ['a question asked at the start', 'a reason for doing something', 'a rule that must be followed'],
    'The company received a huge response to its advert for new staff.',
    'reaction', 'The company received a huge reaction to its advert for new staff.',
    'reply', 'I sent my application last week, but I have not had a reply yet.',
    {
      teacherNote:'Noun: an answer or reaction (a response to an email, a positive response, in response to). Boundary: a response follows something that has already happened or been said; it is not the first question. The verb respond and the adjective responsive are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The manager’s response to the complaint was quick and polite.', meaning:'the reaction to something' },
        { text:'The new product got a very positive response from customers.', meaning:'reaction from people' }
      ],
      situationDistractors:[
        'A manager sent an email and is still waiting to hear back.',
        'A worker asked a question that nobody has answered yet.',
        'A shop put up a sign, but nobody has reacted to it.'
      ],
      retrievalContexts:[
        { id:'1', text:'The advert for the job got an amazing response, with over two hundred applications.', target:'response', grammarPattern:'' },
        { id:'2', text:'We are still waiting for a response from the manufacturer about the faulty machines.', target:'response', grammarPattern:'' },
        { id:'3', text:'In response to complaints, the factory has reduced the noise at night.', target:'response', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'response', wrong:['source', 'feature', 'minority'] },
        { id:'2', answer:'response', wrong:['source', 'feature', 'landscape'] },
        { id:'3', answer:'response', wrong:['source', 'feature', 'technology'] }
      ]
    }),
  e('responsible', 'adjective',
    'having the job or duty of dealing with something or someone at work',
    ['in charge', 'having the duty'],
    ['not allowed to take part in something', 'unhappy about a decision', 'unaware of what is happening'],
    'The site manager is responsible for the safety of everyone on the building site.',
    'in charge of', 'The site manager is in charge of the safety of everyone on the building site.',
    'given the task of', 'Ali was given the task of checking every delivery that arrives at the warehouse.',
    {
      idKey:'responsible_8',
      teacherNote:'Adjective: having the job or duty of dealing with something at work (responsible for staff, responsible for safety). Unit 8 focuses on job duties ("responsible for"); Unit 7 taught the wider sense of being trustworthy. The noun responsibility and the adverb responsibly are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'As head chef, Rosa is responsible for planning the menu and training the kitchen staff.', meaning:'having the duty of doing something as part of a job' },
        { text:'The marketing team is responsible for all publicity about the new product.', meaning:'in charge of a task' }
      ],
      situationDistractors:[
        'A visitor waited in the reception area to meet a friend.',
        'A customer looked at the menu in a café window.',
        'A passer-by watched builders working on a new wall.'
      ],
      retrievalContexts:[
        { id:'1', text:'The head teacher is responsible for the safety of every student in the school.', target:'responsible', grammarPattern:'' },
        { id:'2', text:'Who is responsible for checking the fire alarms each month?', target:'responsible', grammarPattern:'' },
        { id:'3', text:'The manager is responsible for training all new staff.', target:'responsible', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'responsible', wrong:['traditional', 'creative', 'sustainable'] },
        { id:'2', answer:'responsible', wrong:['traditional', 'creative', 'relentless'] },
        { id:'3', answer:'responsible', wrong:['sustainable', 'traditional', 'relentless'] }
      ]
    }),
  e('rough', 'adjective',
    'not exact or finished; done quickly to give a general idea',
    ['approximate', 'not detailed or final'],
    ['exact and carefully checked', 'finished and ready to sell', 'smooth and pleasant to touch'],
    'The designer made a rough sketch of the logo before drawing the final version.',
    'quick and simple', 'The designer made a quick and simple sketch of the logo before drawing the final version.',
    'general', 'Can you give me a general idea of the cost before we start?',
    {
      teacherNote:'Adjective: not exact or finished; giving a general idea (a rough sketch, a rough estimate, a rough idea). Boundary: rough also means not smooth (rough skin) or difficult and unpleasant (a rough day); Unit 8 teaches the "not exact" sense used at work. The adverb roughly (approximately) is useful, but no three-form family fits this sense.',
      masteryContexts:[
        { text:'I can only give you a rough estimate of the cost until I see the damage.', meaning:'approximate and not exact' },
        { text:'Before the meeting, Sami wrote a rough plan on the back of an envelope.', meaning:'quick and not finished' }
      ],
      situationDistractors:[
        'An accountant checked every number in the report twice.',
        'A designer printed the final version of a poster.',
        'An engineer measured a pipe to the nearest millimetre.'
      ],
      retrievalContexts:[
        { id:'1', text:'The architect drew a rough sketch of the house on a napkin.', target:'rough', grammarPattern:'' },
        { id:'2', text:'Can you give me a rough idea of how long the job will take?', target:'rough', grammarPattern:'' },
        { id:'3', text:'This is only a rough draft, so please ignore the spelling mistakes.', target:'rough', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'rough', wrong:['sustainable', 'relentless', 'responsible'] },
        { id:'2', answer:'rough', wrong:['sustainable', 'traditional', 'responsible'] },
        { id:'3', answer:'rough', wrong:['sustainable', 'relentless', 'significant'] }
      ]
    }),
  e('significant', 'adjective',
    'large or important enough to have a noticeable effect',
    ['important', 'large enough to notice'],
    ['too small to make any difference', 'completely unknown to most people', 'happening only by chance'],
    'The new machines led to a significant increase in production.',
    'large', 'The new machines led to a large increase in production.',
    'important', 'Winning the contract was an important moment for the young company.',
    {
      idKey:'significant_8',
      teacherNote:'Adjective: large or important enough to have a noticeable effect (a significant increase, a significant role). Unit 8 uses it for changes and results at work; Unit 1 taught the same core sense. The noun significance and the adverb significantly are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'There has been a significant rise in the number of people working from home.', meaning:'large enough to be noticed' },
        { text:'Her research played a significant part in the development of the vaccine.', meaning:'important and having an effect' }
      ],
      situationDistractors:[
        'Sales rose by one pound in a whole year.',
        'A worker moved her desk two centimetres to the left.',
        'A shop changed the colour of its receipt paper slightly.'
      ],
      retrievalContexts:[
        { id:'1', text:'There has been a significant increase in the number of women working in engineering.', target:'significant', grammarPattern:'' },
        { id:'2', text:'Technology has had a significant effect on the way we work.', target:'significant', grammarPattern:'' },
        { id:'3', text:'The new manager made significant changes to the way the shop is run.', target:'significant', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'significant', wrong:['curved', 'qualified', 'responsible'] },
        { id:'2', answer:'significant', wrong:['curved', 'responsible', 'rough'] },
        { id:'3', answer:'significant', wrong:['curved', 'responsible', 'qualified'] }
      ]
    }),
  e('source', 'noun',
    'the place, person or thing that something comes from',
    ['origin', 'where something comes from'],
    ['the place where something ends', 'the person who buys something', 'the price of something'],
    'Tourism is the main source of income for people in the village.',
    'main origin', 'Tourism is the main origin of income for people in the village.',
    'place it comes from', 'The river is the place the town’s drinking water comes from.',
    {
      teacherNote:'Noun: the place, person or thing that something comes from (a source of income, a source of energy, a source of information). Boundary: a source is where something starts or comes from; a resource is something useful that you have. No family is taught.',
      masteryContexts:[
        { text:'Solar panels provide a clean source of energy for the factory.', meaning:'a place or thing that something comes from' },
        { text:'The journalist would not name the source of her information.', meaning:'the person who gave something' }
      ],
      situationDistractors:[
        'A worker threw an empty bottle into the recycling bin.',
        'A shop sold the last loaf of bread of the day.',
        'A manager locked the door at the end of the day.'
      ],
      retrievalContexts:[
        { id:'1', text:'Fishing is the main source of income for families on the island.', target:'source', grammarPattern:'' },
        { id:'2', text:'Wind is a clean source of energy that will never run out.', target:'source', grammarPattern:'' },
        { id:'3', text:'The reporter checked every fact with a reliable source before publishing the story.', target:'source', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'source', wrong:['response', 'feature', 'minority'] },
        { id:'2', answer:'source', wrong:['response', 'assignment', 'minority'] },
        { id:'3', answer:'source', wrong:['response', 'landscape', 'feature'] }
      ]
    }),
  e('specialise', 'verb',
    'to concentrate your work or study on one particular area and become an expert in it',
    ['focus on one area', 'become an expert in one subject'],
    ['to work in many different areas at once', 'to give up a job in order to study', 'to move to a new company'],
    'After training as a lawyer, she chose to specialise in employment law.',
    'focus', 'After training as a lawyer, she chose to focus on employment law.',
    'concentrate on', 'Many young doctors decide to concentrate on one type of illness.',
    {
      idKey:'specialise_8',
      teacherNote:'Verb: to focus your work or study on one area and become an expert in it (specialise in something). British spelling specialise is the accepted answer. Unit 5 taught the same core sense; Unit 8 uses it for careers. The noun specialist and the adjective specialised are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Dr Chen decided to specialise in heart surgery after working in the emergency department.', meaning:'to focus on one area of work' },
        { text:'The company used to sell all kinds of furniture, but now it wants to specialise in office chairs.', meaning:'to concentrate on one type of product' }
      ],
      situationDistractors:[
        'A shop sells food, clothes, toys and garden tools.',
        'A worker does a different job in the company every week.',
        'A student studies ten subjects at school.'
      ],
      retrievalContexts:[
        { id:'1', text:'Many nurses choose to specialise in caring for children.', target:'specialise', grammarPattern:'' },
        { id:'2', text:'The restaurant has decided to specialise in seafood dishes.', target:'specialise', grammarPattern:'' },
        { id:'3', text:'Students can specialise in one area of engineering in their final year.', target:'specialise', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'specialise', wrong:['resign', 'retire', 'complain'] },
        { id:'2', answer:'specialise', wrong:['retire', 'resign', 'apologise'] },
        { id:'3', answer:'specialise', wrong:['retire', 'resign', 'argue'] }
      ]
    }),
  e('structures', 'noun',
    'things that have been built, such as buildings, bridges and towers',
    ['things that are built', 'constructions'],
    ['natural features such as hills and rivers', 'plans drawn before building starts', 'people who design buildings'],
    'Engineers check tall structures such as bridges and towers after every earthquake.',
    'constructions', 'Engineers check tall constructions such as bridges and towers after every earthquake.',
    'buildings and bridges', 'The storm damaged several buildings and bridges along the coast.',
    {
      teacherNote:'Plural noun: things that have been built, such as buildings, bridges, towers and walls (tall structures, steel structures). Boundary: structure can also mean the way parts are organised (the structure of an essay); Unit 8 teaches the built-object sense. No family is taught.',
      masteryContexts:[
        { text:'The Eiffel Tower is one of the most famous structures in the world.', meaning:'things that have been built' },
        { text:'After the earthquake, engineers checked all the structures in the city for cracks.', meaning:'buildings and bridges' }
      ],
      situationDistractors:[
        'A farmer ploughed a field ready for planting.',
        'A hiker walked through a forest with no buildings.',
        'A diver swam among the rocks in the sea.'
      ],
      retrievalContexts:[
        { id:'1', text:'The bridge is one of the tallest structures in Europe.', target:'structures', grammarPattern:'' },
        { id:'2', text:'Engineers inspect old steel structures for rust every year.', target:'structures', grammarPattern:'' },
        { id:'3', text:'The earthquake damaged many structures, including the hospital and two bridges.', target:'structures', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'structures', wrong:['ingredients', 'regulations', 'elements'] },
        { id:'2', answer:'structures', wrong:['ingredients', 'regulations', 'inspectors'] },
        { id:'3', answer:'structures', wrong:['ingredients', 'regulations', 'elements'] }
      ]
    }),
  e('sustainable', 'adjective',
    'able to continue for a long time without harming the environment or using up natural resources',
    ['environmentally friendly', 'able to last without harming nature'],
    ['very cheap to produce in large amounts', 'popular for a short time only', 'made using the latest technology'],
    'The company uses sustainable wood from forests where new trees are always planted.',
    'environmentally friendly', 'The company uses environmentally friendly wood from forests where new trees are always planted.',
    'green', 'The city is investing in green transport such as electric buses and bike lanes.',
    {
      teacherNote:'Adjective: able to continue without harming the environment or using up natural resources (sustainable energy, sustainable farming). Boundary: sustainable can also mean able to continue in general (sustainable growth), but Unit 8 focuses on the environmental sense. The noun sustainability and the verb sustain are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Solar and wind power are sustainable sources of energy.', meaning:'able to continue without harming the planet' },
        { text:'The café only buys sustainable fish that are caught without damaging the sea.', meaning:'obtained without harming the environment' }
      ],
      situationDistractors:[
        'A factory poured waste chemicals into the river.',
        'A company cut down an old forest and planted nothing.',
        'A farm used so much water that the lake dried up.'
      ],
      retrievalContexts:[
        { id:'1', text:'Architects are designing sustainable buildings that use less energy.', target:'sustainable', grammarPattern:'' },
        { id:'2', text:'The government wants farmers to use more sustainable methods.', target:'sustainable', grammarPattern:'' },
        { id:'3', text:'Wind power is a sustainable alternative to coal.', target:'sustainable', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'sustainable', wrong:['relentless', 'responsible', 'rough'] },
        { id:'2', answer:'sustainable', wrong:['relentless', 'rough', 'curved'] },
        { id:'3', answer:'sustainable', wrong:['relentless', 'rough', 'qualified'] }
      ]
    }),
  e('transformed', 'verb',
    'completely changed the appearance, form or character of something, usually improving it',
    ['completely changed', 'totally altered'],
    ['slightly repaired', 'kept exactly the same', 'sold to a new owner'],
    'The architect transformed the old factory into a bright modern library.',
    'completely changed', 'The architect completely changed the old factory into a bright modern library.',
    'totally changed', 'The internet has totally changed the way people find jobs.',
    {
      teacherNote:'Verb (past tense or past participle): completely changed the form, appearance or character of something, often for the better (transformed into, transformed the way). Boundary: transformed means a complete change; changed or altered can be small. The base verb transform and the noun transformation are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The new manager transformed the failing shop into one of the most successful in the city.', meaning:'changed completely for the better' },
        { text:'Mobile phones have transformed the way that people do business.', meaning:'changed in a very big way' }
      ],
      situationDistractors:[
        'A painter touched up a small scratch on a door.',
        'An office stayed exactly the same for thirty years.',
        'A manager moved one chair to the other side of the room.'
      ],
      retrievalContexts:[
        { id:'1', text:'The designers transformed the old warehouse into stylish flats.', target:'transformed', grammarPattern:'' },
        { id:'2', text:'The internet has transformed the way people shop.', target:'transformed', grammarPattern:'' },
        { id:'3', text:'In just one year, the new head teacher transformed the school.', target:'transformed', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'transformed', wrong:['concerned', 'qualified', 'curved'] },
        { id:'2', answer:'transformed', wrong:['concerned', 'qualified', 'curved'] },
        { id:'3', answer:'transformed', wrong:['concerned', 'curved', 'qualified'] }
      ]
    }),
  e('operator', 'noun',
    'a person whose job is to work a machine or a piece of equipment',
    ['machine worker', 'person who controls a machine'],
    ['a person who designs new machines', 'a person who sells machines', 'a person who inspects machines'],
    'The crane operator lifted the steel beams onto the roof.',
    'driver', 'The crane driver lifted the steel beams onto the roof.',
    'person who works the machine', 'Only the person who works the machine is allowed to switch it on.',
    {
      teacherNote:'Noun: a person who works a machine or equipment (a machine operator, a crane operator); it can also mean a company that runs a service (a tour operator), which is not tested here. Boundary: an operator uses the machine; an engineer designs or repairs it. The verb operate and the noun operation are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The machine operator stopped the production line when she saw smoke.', meaning:'a person who works a machine' },
        { text:'Each forklift operator must have a licence and two weeks of training.', meaning:'a person trained to drive equipment' }
      ],
      situationDistractors:[
        'A designer drew plans for a new machine.',
        'A salesman showed a customer a brochure of tractors.',
        'A manager signed an order for new equipment.'
      ],
      retrievalContexts:[
        { id:'1', text:'A forklift operator moved the heavy boxes to the back of the warehouse.', target:'operator', grammarPattern:'' },
        { id:'2', text:'The machine stopped suddenly, and the operator pressed the emergency button.', target:'operator', grammarPattern:'' },
        { id:'3', text:'Every operator must wear ear protection when the machines are running.', target:'operator', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'operator', wrong:['nutritionist', 'scientist', 'landscape'] },
        { id:'2', answer:'operator', wrong:['nutritionist', 'landscape', 'minority'] },
        { id:'3', answer:'operator', wrong:['nutritionist', 'landscape', 'technology'] }
      ]
    }),
  e('nutritionist', 'noun',
    'an expert who advises people about food and healthy eating',
    ['food and diet expert', 'expert on healthy eating'],
    ['a person who cooks meals in a restaurant', 'a doctor who performs operations', 'a person who grows vegetables to sell'],
    'The football club hired a nutritionist to plan healthy meals for the players.',
    'diet expert', 'The football club hired a diet expert to plan healthy meals for the players.',
    'expert on healthy eating', 'The school asked an expert on healthy eating to improve the lunch menu.',
    {
      teacherNote:'Noun: an expert who advises people about food and healthy eating (a sports nutritionist). Boundary: a nutritionist advises on what to eat; a chef cooks the food. The noun nutrition and the adjective nutritious are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The nutritionist told the athlete to eat more protein and less sugar.', meaning:'an expert in food and health' },
        { text:'Before launching the new snack, the company asked a nutritionist to check how healthy it was.', meaning:'an expert who judges how healthy food is' }
      ],
      situationDistractors:[
        'A chef cooked a large pot of pasta for the restaurant.',
        'A farmer sold eggs at the market.',
        'A waiter carried plates to a table.'
      ],
      retrievalContexts:[
        { id:'1', text:'The nutritionist advised the patient to eat more fruit and vegetables.', target:'nutritionist', grammarPattern:'' },
        { id:'2', text:'Many top athletes work with a nutritionist to plan their meals.', target:'nutritionist', grammarPattern:'' },
        { id:'3', text:'The school asked a nutritionist to make its lunch menu healthier.', target:'nutritionist', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'nutritionist', wrong:['operator', 'engineer', 'landscape'] },
        { id:'2', answer:'nutritionist', wrong:['director', 'landscape', 'technology'] },
        { id:'3', answer:'nutritionist', wrong:['landscape', 'technology', 'minority'] }
      ]
    }),
  e('director', 'noun',
    'a senior manager who is in charge of a company or one of its departments',
    ['senior manager', 'person in charge of a company'],
    ['a new worker who is still training', 'a person who checks safety rules', 'a person who answers the phone at reception'],
    'The director of the company announced that profits had doubled.',
    'head', 'The head of the company announced that profits had doubled.',
    'person in charge', 'The person in charge of marketing wants to launch a new advert.',
    {
      teacherNote:'Noun: a senior manager in charge of a company or department (the managing director, the director of finance). Boundary: director also means the person in charge of a film or play; Unit 8 teaches the business sense. No family is taught because direct and direction are mainly used for giving the way or aiming something.',
      masteryContexts:[
        { text:'The sales director wants every shop to increase its profits by ten per cent.', meaning:'a senior manager in charge of a department' },
        { text:'After twenty years with the company, she became its managing director.', meaning:'the person who runs a company' }
      ],
      situationDistractors:[
        'A trainee made coffee for the team on her first day.',
        'A receptionist greeted visitors at the front desk.',
        'A delivery driver unloaded boxes at the back door.'
      ],
      retrievalContexts:[
        { id:'1', text:'The director of the company gave a speech at the annual meeting.', target:'director', grammarPattern:'' },
        { id:'2', text:'She worked her way up from receptionist to managing director.', target:'director', grammarPattern:'' },
        { id:'3', text:'The finance director must approve every payment over a thousand pounds.', target:'director', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'director', wrong:['landscape', 'technology', 'minority'] },
        { id:'2', answer:'director', wrong:['landscape', 'technology', 'packaging'] },
        { id:'3', answer:'director', wrong:['nutritionist', 'landscape', 'technology'] }
      ]
    }),
  e('expert', 'noun',
    'a person with a high level of knowledge or skill in a particular subject',
    ['specialist', 'person with great knowledge'],
    ['a beginner who is still learning', 'a person who is paid to sell things', 'a person who checks tickets'],
    'The museum asked an expert to check whether the painting was real.',
    'specialist', 'The museum asked a specialist to check whether the painting was real.',
    'person who knows a lot', 'We need a person who knows a lot about computers to fix the network.',
    {
      teacherNote:'Noun: a person with a high level of knowledge or skill in a subject (an expert in, an expert on, a computer expert). Boundary: an expert has deep knowledge; a specialist is an expert who works in one narrow area. The noun expertise and the adverb expertly are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'She is an expert on ancient Egypt and has written six books about it.', meaning:'a person who knows a great deal about a subject' },
        { text:'The insurance company sent an expert to examine the damage to the roof.', meaning:'a person with special skills and knowledge' }
      ],
      situationDistractors:[
        'A boy tried to fix his bike for the first time.',
        'A new trainee asked how to use the photocopier.',
        'A tourist asked for directions to the museum.'
      ],
      retrievalContexts:[
        { id:'1', text:'The police asked a computer expert to examine the stolen laptop.', target:'expert', grammarPattern:'' },
        { id:'2', text:'According to one expert, the bridge needs urgent repairs.', target:'expert', grammarPattern:'' },
        { id:'3', text:'Dr Ali is a leading expert on climate change.', target:'expert', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'expert', wrong:['minority', 'landscape', 'packaging'] },
        { id:'2', answer:'expert', wrong:['minority', 'assignment', 'technology'] },
        { id:'3', answer:'expert', wrong:['minority', 'landscape', 'technology'] }
      ]
    }),
  e('engineer', 'noun',
    'a person trained to design, build or repair machines, structures or systems',
    ['person who designs and builds machines', 'technical designer'],
    ['a person who sells cars', 'a person who draws pictures for books', 'a person who cleans offices'],
    'The engineer found the fault in the machine and fixed it in an hour.',
    'technician', 'The technician found the fault in the machine and fixed it in an hour.',
    'person who designs bridges', 'Her sister is a person who designs bridges for a large building company.',
    {
      idKey:'engineer_8',
      teacherNote:'Noun: a person trained to design, build or repair machines, structures or systems (a civil engineer, a software engineer). Unit 8 uses it as a job title in the world of work; Unit 4 taught the same core sense. No family is taught: engineering (the subject) is the only other common form.',
      masteryContexts:[
        { text:'The engineer checked every part of the bridge before it opened to traffic.', meaning:'a person trained to design and check structures' },
        { text:'Rahul works as a software engineer, writing programs for hospitals.', meaning:'a person who designs and builds systems' }
      ],
      situationDistractors:[
        'A waiter took an order from a customer.',
        'A singer practised a new song.',
        'A florist arranged roses in a vase.'
      ],
      retrievalContexts:[
        { id:'1', text:'The engineer designed a bridge that can survive strong earthquakes.', target:'engineer', grammarPattern:'' },
        { id:'2', text:'An engineer came to repair the broken lift.', target:'engineer', grammarPattern:'' },
        { id:'3', text:'After her degree, she worked as a civil engineer on road projects.', target:'engineer', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'engineer', wrong:['nutritionist', 'minority', 'landscape'] },
        { id:'2', answer:'engineer', wrong:['instructor', 'assignment', 'innovation'] },
        { id:'3', answer:'engineer', wrong:['nutritionist', 'landscape', 'technology'] }
      ]
    }),
  e('scientist', 'noun',
    'a person who studies the natural world through experiments and observation',
    ['researcher', 'person who studies nature by experiment'],
    ['a person who writes stories', 'a person who manages a shop', 'a person who sells medicines'],
    'The scientist spent ten years studying how plants react to pollution.',
    'researcher', 'The researcher spent ten years studying how plants react to pollution.',
    'expert who does experiments', 'An expert who does experiments on bees discovered why they were dying.',
    {
      teacherNote:'Noun: a person who studies the natural world through experiments and observation (a research scientist, a team of scientists). Boundary: a scientist researches and discovers; an engineer uses scientific knowledge to design and build. The noun science and the adjective scientific are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The scientist tested the water every day to see how much plastic it contained.', meaning:'a person who studies things through experiments' },
        { text:'A scientist working in the rainforest has discovered a new type of frog.', meaning:'a researcher who studies nature' }
      ],
      situationDistractors:[
        'An actor learned his lines for a play.',
        'A shop assistant folded T-shirts.',
        'A bus driver stopped to let passengers on.'
      ],
      retrievalContexts:[
        { id:'1', text:'The scientist recorded the results of each experiment in a notebook.', target:'scientist', grammarPattern:'' },
        { id:'2', text:'She dreamed of becoming a scientist and finding a cure for cancer.', target:'scientist', grammarPattern:'' },
        { id:'3', text:'A marine scientist spent six months on the ship, collecting samples of seawater.', target:'scientist', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'scientist', wrong:['landscape', 'minority', 'packaging'] },
        { id:'2', answer:'scientist', wrong:['landscape', 'minority', 'director'] },
        { id:'3', answer:'scientist', wrong:['landscape', 'technology', 'director'] }
      ]
    }),
  e('assignment', 'noun',
    'a piece of work or a task that someone is given as part of their job or studies',
    ['task given to someone', 'piece of set work'],
    ['a meeting to discuss pay', 'a prize for excellent work', 'a holiday from work'],
    'The journalist’s latest assignment was to report on the floods.',
    'task', 'The journalist’s latest task was to report on the floods.',
    'piece of work', 'Each student must hand in a piece of work about a famous engineer.',
    {
      teacherNote:'Noun: a piece of work or a task given to someone as part of their job or studies (a written assignment, on assignment). Boundary: an assignment is given to you by someone else; a project can be your own idea. The verb assign is the only other useful form, so no family is taught.',
      masteryContexts:[
        { text:'The manager gave Leo his first assignment: to write a report on the competition.', meaning:'a task given at work' },
        { text:'Students must finish the history assignment before the end of term.', meaning:'a piece of work set by a teacher' }
      ],
      situationDistractors:[
        'A worker relaxed on a beach during her holiday.',
        'A student chose a novel to read for fun.',
        'A manager went home early because she felt ill.'
      ],
      retrievalContexts:[
        { id:'1', text:'Our teacher set us a written assignment on renewable energy.', target:'assignment', grammarPattern:'' },
        { id:'2', text:'The photographer’s next assignment is in Kenya, where she will cover a wildlife festival.', target:'assignment', grammarPattern:'' },
        { id:'3', text:'Each new trainee is given a small assignment in their first week.', target:'assignment', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'assignment', wrong:['minority', 'landscape', 'humanity'] },
        { id:'2', answer:'assignment', wrong:['minority', 'humanity', 'technology'] },
        { id:'3', answer:'assignment', wrong:['minority', 'landscape', 'humanity'] }
      ]
    }),
  e('employment', 'noun',
    'the state of having paid work, or the work that people do for money',
    ['paid work', 'having a job'],
    ['time spent on holiday', 'money given to a charity', 'training done for free'],
    'The new factory will provide employment for over five hundred people.',
    'jobs', 'The new factory will provide jobs for over five hundred people.',
    'paid work', 'Many students look for paid work during the summer holidays.',
    {
      teacherNote:'Noun: having paid work, or the work people do (find employment, full-time employment, employment law). Boundary: employment is a formal word for having a job; a job is one particular position. The verb employ and the adjective unemployed are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'After leaving university, Mira found employment with a large engineering company.', meaning:'paid work' },
        { text:'Since the mine closed, employment in the town has fallen sharply.', meaning:'the number of people with jobs' }
      ],
      situationDistractors:[
        'A retired teacher spent the day in her garden.',
        'A child played computer games after school.',
        'A tourist relaxed by the hotel pool.'
      ],
      retrievalContexts:[
        { id:'1', text:'The new airport will create employment for thousands of local people.', target:'employment', grammarPattern:'' },
        { id:'2', text:'After months of searching, Lena finally found employment as a designer.', target:'employment', grammarPattern:'' },
        { id:'3', text:'The government wants to increase employment among young people.', target:'employment', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'employment', wrong:['packaging', 'architecture', 'minority'] },
        { id:'2', answer:'employment', wrong:['packaging', 'architecture', 'humanity'] },
        { id:'3', answer:'employment', wrong:['packaging', 'architecture', 'landscape'] }
      ]
    }),
  e('traditional', 'adjective',
    'following customs, methods or beliefs that have existed for a long time',
    ['customary and long-established', 'done in the same way for many years'],
    ['completely new and modern', 'done only once by chance', 'copied recently from another country'],
    'The bakery still makes bread using traditional methods, without any machines.',
    'old', 'The bakery still makes bread using old methods, without any machines.',
    'long-established', 'The village is famous for its long-established crafts such as weaving.',
    {
      teacherNote:'Adjective: following customs or methods used for a long time (traditional methods, traditional food, traditional crafts). Boundary: traditional is neutral or positive; old-fashioned often suggests something is out of date. The noun tradition and the adverb traditionally are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'The furniture is made by hand using traditional tools that have not changed for centuries.', meaning:'used in the same way for a very long time' },
        { text:'Many young people are leaving traditional jobs such as farming and fishing.', meaning:'old and long-established' }
      ],
      situationDistractors:[
        'A start-up used artificial intelligence to design a new shoe.',
        'A designer tried a completely new way of building houses from plastic.',
        'A café created a dish that nobody had ever tasted before.'
      ],
      retrievalContexts:[
        { id:'1', text:'The restaurant serves traditional dishes from the north of the country.', target:'traditional', grammarPattern:'' },
        { id:'2', text:'Many traditional crafts are disappearing because young people prefer office jobs.', target:'traditional', grammarPattern:'' },
        { id:'3', text:'In some villages, people still wear traditional clothes for festivals.', target:'traditional', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'traditional', wrong:['relentless', 'responsible', 'rough'] },
        { id:'2', answer:'traditional', wrong:['relentless', 'rough', 'responsible'] },
        { id:'3', answer:'traditional', wrong:['relentless', 'responsible', 'significant'] }
      ]
    }),
  e('trainer', 'noun',
    'a person whose job is to teach skills to workers or athletes and help them improve',
    ['coach', 'person who trains others'],
    ['a person who builds machines', 'a person who checks safety rules', 'a person who manages a shop'],
    'The company hired a trainer to teach staff how to deal with angry customers.',
    'coach', 'The company hired a coach to teach staff how to deal with angry customers.',
    'person who teaches skills', 'The new person who teaches skills will run a course on teamwork next week.',
    {
      teacherNote:'Noun: a person who teaches skills to workers or athletes and helps them improve (a personal trainer, a staff trainer). Boundary: trainers can also mean sports shoes, and an instructor usually teaches a practical activity such as driving. The verb train and the noun trainee are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'A personal trainer helped Maria get fit for the marathon.', meaning:'a person who coaches someone to improve their fitness' },
        { text:'The IT trainer spent the morning showing staff how to use the new software.', meaning:'a person who teaches work skills' }
      ],
      situationDistractors:[
        'A shop assistant sold a pair of running shoes.',
        'A customer joined a gym and paid the fee.',
        'A runner trained alone in the park at dawn.'
      ],
      retrievalContexts:[
        { id:'1', text:'The new staff spent a week with a trainer learning how to use the till.', target:'trainer', grammarPattern:'' },
        { id:'2', text:'Her personal trainer makes her run five kilometres every morning.', target:'trainer', grammarPattern:'' },
        { id:'3', text:'The football club has hired a new fitness trainer for the first team.', target:'trainer', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'trainer', wrong:['landscape', 'minority', 'technology'] },
        { id:'2', answer:'trainer', wrong:['landscape', 'technology', 'packaging'] },
        { id:'3', answer:'trainer', wrong:['landscape', 'minority', 'technology'] }
      ]
    }),
  e('technology', 'noun',
    'scientific knowledge used to make machines, equipment and systems that solve practical problems',
    ['modern machines and equipment', 'science used in practical ways'],
    ['the study of plants and animals', 'the history of how people lived', 'the rules for running a business'],
    'New technology allows doctors to see inside the body without surgery.',
    'equipment', 'New equipment allows doctors to see inside the body without surgery.',
    'modern machines and computers', 'The factory has invested in modern machines and computers to speed up production.',
    {
      teacherNote:'Noun: scientific knowledge used to make machines, equipment and systems (new technology, information technology). Boundary: technology is the practical use of knowledge and the equipment it produces; science is the study that discovers how things work. The adjective technological and the adverb technologically are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Farmers now use technology such as drones to check their crops.', meaning:'machines and equipment based on science' },
        { text:'Information technology is the fastest-growing area of employment in the city.', meaning:'the use of computers and electronic systems' }
      ],
      situationDistractors:[
        'A farmer ploughed his field with two horses.',
        'A woman wrote a letter by hand with a pen.',
        'A carpenter cut wood with a hand saw.'
      ],
      retrievalContexts:[
        { id:'1', text:'New technology has made it possible for many people to work from home.', target:'technology', grammarPattern:'' },
        { id:'2', text:'The hospital has invested in the latest technology for treating cancer.', target:'technology', grammarPattern:'' },
        { id:'3', text:'Companies that ignore new technology often fall behind their rivals.', target:'technology', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'technology', wrong:['landscape', 'minority', 'packaging'] },
        { id:'2', answer:'technology', wrong:['landscape', 'minority', 'humanity'] },
        { id:'3', answer:'technology', wrong:['landscape', 'minority', 'humanity'] }
      ]
    }),
  e('creative', 'adjective',
    'good at thinking of new and original ideas or at making new things',
    ['imaginative', 'full of original ideas'],
    ['careful to follow every rule', 'good at remembering facts', 'able to work very quickly'],
    'The advertising agency is looking for creative people to design new campaigns.',
    'imaginative', 'The advertising agency is looking for imaginative people to design new campaigns.',
    'full of original ideas', 'Our new designer is full of original ideas and never copies anyone.',
    {
      teacherNote:'Adjective: good at thinking of new, original ideas or at making new things (creative thinking, the creative industries). Boundary: creative is about producing new ideas; clever is about understanding quickly. The verb create and the noun creativity are taught in the Word Family pathway.',
      masteryContexts:[
        { text:'Lena is very creative and has designed all the posters for the school play.', meaning:'good at producing original ideas' },
        { text:'Jobs in the creative industries, such as film and design, are popular with young people.', meaning:'producing art and new ideas' }
      ],
      situationDistractors:[
        'A clerk copied numbers from one form to another.',
        'A worker followed the same checklist every morning.',
        'A student copied an answer from the textbook.'
      ],
      retrievalContexts:[
        { id:'1', text:'The company encourages creative thinking by holding weekly idea meetings.', target:'creative', grammarPattern:'' },
        { id:'2', text:'She has a creative job designing packaging for chocolate bars.', target:'creative', grammarPattern:'' },
        { id:'3', text:'Children are often more creative than adults because they are not afraid of strange ideas.', target:'creative', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'creative', wrong:['relentless', 'responsible', 'curved'] },
        { id:'2', answer:'creative', wrong:['relentless', 'curved', 'qualified'] },
        { id:'3', answer:'creative', wrong:['relentless', 'responsible', 'sustainable'] }
      ]
    }),
  e('wellbeing', 'noun',
    'the state of feeling healthy, comfortable and happy',
    ['health and happiness', 'feeling well and content'],
    ['the amount of money a person earns', 'the number of hours a person works', 'the skills a person has learned'],
    'The company offers yoga classes to improve the wellbeing of its staff.',
    'health and happiness', 'The company offers yoga classes to improve the health and happiness of its staff.',
    'how healthy and happy people feel', 'Long working hours can damage how healthy and happy people feel.',
    {
      teacherNote:'Noun: the state of feeling healthy, comfortable and happy (staff wellbeing, mental wellbeing). The coursebook spelling wellbeing is the accepted answer. Boundary: wellbeing includes mind and body together; health can refer only to the body. No family is taught.',
      masteryContexts:[
        { text:'Doctors say that regular breaks are important for the wellbeing of office workers.', meaning:'feeling healthy and happy' },
        { text:'The school has a wellbeing room where students can go if they feel stressed.', meaning:'feeling calm and well' }
      ],
      situationDistractors:[
        'A manager checked the sales figures for the month.',
        'A worker counted boxes in the warehouse.',
        'A director signed a contract with a new supplier.'
      ],
      retrievalContexts:[
        { id:'1', text:'Employers are paying more attention to the wellbeing of their staff.', target:'wellbeing', grammarPattern:'' },
        { id:'2', text:'Spending time outdoors is good for your mental wellbeing.', target:'wellbeing', grammarPattern:'' },
        { id:'3', text:'The new office has plants, natural light and quiet rooms to support staff wellbeing.', target:'wellbeing', grammarPattern:'' }
      ],
      gapDistractors:[
        { id:'1', answer:'wellbeing', wrong:['packaging', 'minority', 'technology'] },
        { id:'2', answer:'wellbeing', wrong:['packaging', 'architecture', 'minority'] },
        { id:'3', answer:'wellbeing', wrong:['packaging', 'minority', 'publicity'] }
      ]
    })
];

function familyFields(entry) {
  const family = unit8WordFamilies[entry.term];
  if (!family) return unit8WordFamilyRejected[entry.term] ? { wordFamily:[] } : {};
  const lower = value => String(value).toLocaleLowerCase('en');
  return {
    wordFamilyForms:family.forms.map(row => ({ form:row.form, partOfSpeech:row.partOfSpeech, example:row.example, pedagogicallyUseful:true, ...(unit8WordFamilyAlternates[entry.term]?.[row.form] ? { altExample:unit8WordFamilyAlternates[entry.term][row.form] } : {}) })),
    wordFamily:family.forms.map(row => row.form).filter(form => lower(form) !== lower(entry.term))
  };
}

// Authored Meaning Mastery wrong meanings are applied by position to the word's two mastery contexts, as in Units 1–7.
const enrichedEntries = entries.map(entry => {
  const authoredMastery = unit8MeaningMastery[entry.term];
  const masteryContexts = authoredMastery
    ? (entry.masteryContexts ?? []).map((record, index) => {
        const authored = authoredMastery[index] ?? {};
        return { text:authored.text ?? record.text, meaning:authored.meaning ?? record.meaning, ...(Array.isArray(authored.wrongMeanings) ? { wrongMeanings:authored.wrongMeanings } : {}) };
      })
    : entry.masteryContexts;
  return {
    ...entry,
    ...(masteryContexts ? { masteryContexts } : {}),
    ...(unit8SituationExtras[entry.term] ? { situationDistractors:[...(entry.situationDistractors ?? []), ...unit8SituationExtras[entry.term]] } : {}),
    ...(unit8Collocations[entry.term] ? { collocations:unit8Collocations[entry.term] } : {}),
    ...(unit8MeaningMatch[entry.term] ? { wrongParaphrases:unit8MeaningMatch[entry.term] } : {}),
    ...(unit8ContextPassages[entry.term] ? { masteryPassages:unit8ContextPassages[entry.term] } : {}),
    ...familyFields(entry)
  };
});

export default buildCuratedUnit({
  unitNumber:UNIT_NUMBER,
  unitTitle:'Work',
  status,
  source:'0511 key vocabulary unit 8: Work',
  entries:enrichedEntries,
  activities:[...unit8Activities, ...unit8PrecisionUse, ...unit8WordFamilyItems],
  lexicalSpelling:{
    ...LEXICAL_SPELLING_ERRORS,
    vocab_availability_8:LEXICAL_SPELLING_ERRORS.vocab_availability,
    vocab_feature_8:LEXICAL_SPELLING_ERRORS.vocab_feature,
    vocab_ingredients_8:LEXICAL_SPELLING_ERRORS.vocab_ingredients,
    vocab_landscape_8:LEXICAL_SPELLING_ERRORS.vocab_landscape,
    vocab_responsible_8:LEXICAL_SPELLING_ERRORS.vocab_responsible,
    vocab_significant_8:LEXICAL_SPELLING_ERRORS.vocab_significant,
    vocab_specialise_8:LEXICAL_SPELLING_ERRORS.vocab_specialise,
    vocab_engineer_8:LEXICAL_SPELLING_ERRORS.vocab_engineer,
    vocab_facilities_8:LEXICAL_SPELLING_ERRORS.vocab_facilities
  }
});
