// Games data for Unit 2 (Digital Life): (1) Word Blitz near-neighbour groups, (2) the curated Connections puzzles.
// Same shapes as the Unit 1 data in games-data.js; registered in GAMES_BY_UNIT there. No student data lives here.
//
// Word Blitz: words in one group never appear as options in the same question, because a distractor could be argued as also correct.
// Unit 2 has only 7 verbs and 3 adverbs, so those classes keep only the groups that are really needed (the engine pads small classes from
// the nearest word class); the noun and adjective groups carry the real near-neighbour pairs.
export const BLITZ_CONFUSABLE_U2 = Object.freeze([
  ['device', 'remote control', 'accessory', 'equipment', 'fixture', 'feature'],
  ['feature', 'function', 'accessory', 'determination'],
  ['availability', 'access'],
  ['entertainment', 'streaming', 'commentary', 'current affairs'],
  ['essential', 'critical', 'relevant'],
  ['impressive', 'high-performance', 'professional'],
  ['professional', 'informed', 'educational'],
  ['digital', 'interactive', 'high-performance'],
  ['interactive', 'educational'],
  ['adjustable', 'removable', 'external'],
  ['affordable', 'competitive'],
  ['communicate', 'admit'],
  ['concentrate', 'multi-task'],
  ['apparently', 'supposedly']
].map(group => Object.freeze(group)));

// Question ids withheld from Unit 2 Word Blitz. The canonical content stays the source of truth for meaning and still drives the six pathways;
// these items are simply not safe as standalone Games questions. Every id was read against the live pool (see the PR audit):
//   para  "Another way to say…" needs target and prompt to be genuinely interchangeable. Removed: loose associations, broader/narrower meanings,
//         collocations and category/example links (e.g. "two-way" is not another way to say "interactive").
//   gap   removed where grammar alone (a/an) or a second plausible word makes the answer unfair.
export const BLITZ_EXCLUDED_U2 = Object.freeze([
  // para: loose association / broader or narrower / not interchangeable
  'para:vocab_interactive:two-way', 'para:vocab_interactive:hands-on',
  'para:vocab_relevant:related', 'para:vocab_relevant:connected',
  'para:vocab_digital:electronic', 'para:vocab_digital:computer-based',
  'para:vocab_professional:skilled', 'para:vocab_professional:expert',
  'para:vocab_informed:aware', 'para:vocab_impressive:admirable',
  'para:vocab_high_performance:top-quality', 'para:vocab_high_performance:very-powerful',
  'para:vocab_widespread:found-everywhere', 'para:vocab_widespread:common',
  'para:vocab_regional:local', 'para:vocab_percentage:proportion',
  'para:vocab_culture:customs-and-traditions', 'para:vocab_current_affairs:world-news',
  'para:vocab_availability:supply', 'para:vocab_commentary:spoken-report',
  'para:vocab_communicate:exchange-ideas', 'para:vocab_device:electronic-tool',
  'para:vocab_educational:teaching', 'para:vocab_entertainment:things-people-watch-for-fun',
  'para:vocab_equipment:apparatus', 'para:vocab_fixture:permanent-attachment',
  'para:vocab_impression:general-feeling', 'para:vocab_impression:first-opinion',
  'para:vocab_remote_control:controller', 'para:vocab_stabilising:balancing',
  'para:vocab_streaming:online-viewing', 'para:vocab_supposedly:reportedly',
  'para:vocab_admit:confess', 'para:vocab_admit:accept-that-it-is-true',
  'para:vocab_accessory:extra-item', 'para:vocab_adjustable:able-to-be-altered',
  // def / para: apparently and supposedly are two of only three adverbs, and each other's near-neighbour, so these prompts could only be answered by
  // word class (-ly) plus one weak elimination. Both words stay in Blitz through reviewed gap and meaning-in-context questions.
  'def:vocab_apparently', 'def:vocab_supposedly', 'para:vocab_apparently:seemingly', 'para:vocab_apparently:as-it-appears', 'para:vocab_supposedly:allegedly',
  // gap: the article (an) gives the answer away, or a second option also fits
  'gap:u2_43_accessory_gap_1', 'gap:u2_43_accessory_gap_2', 'gap:u2_37_amusing_gap_2', 'gap:u2_20_impression_gap_1',
  'gap:u2_07_educator_gap_1', 'gap:u2_15_admit_gap_2', 'gap:u2_17_remotely_gap_2'
]);

// Reviewed wrong meanings in the Unit 2 content are already plain student English, so no overrides are needed.
export const BLITZ_MEANING_OPTIONS_U2 = Object.freeze({});

// Connections v2 (text-only, four clues on one curve): 1 situation, 2 context, 3 plain-English meaning, 4 near-definition.
// `help` = two Unit 2 distractors for the 3-choice "Need help?" step (same part of speech where the unit has enough words; never a near-synonym).
const clue = (text, kind) => ({ text, kind });
const text = (target, accept, help, why, [a, b, c, d]) => ({ target, accept, help, why, clues: [clue(a, 'situation'), clue(b, 'context'), clue(c, 'plain'), clue(d, 'meaning')] });
const PUZZLES_U2 = [
  text('entertainment', [], ['culture', 'percentage'], 'Films, music, games and live shows all exist to please an audience in their free time: that is entertainment.',
    ['On a long train journey you load up films, music and games to pass the time.', 'Cinemas, concert halls and game studios all belong to this industry, which people pay for in their free time.', 'shows, music and games that you enjoy in your free time', 'the general word for films, music, games and shows made to please an audience']),
  text('access', [], ['percentage', 'impression'], 'A password, a key card and a ramp for wheelchairs all decide whether you can get to or use something: that is access.',
    ['At home the school\'s online library will not open for you, though your classmates can log in.', 'A password, a key card or a good connection decides whether you can get in or reach something.', 'being allowed to get to something or use it', 'the right or ability to reach a place or use something, such as a building or the internet']),
  text('device', ['devices'], ['culture', 'celebrity'], 'Phones, tablets and smart watches are all small machines made for a particular job: devices.',
    ['The teacher collects everything with a screen or a battery before the test begins.', 'Phones, tablets and smart watches are all examples of this kind of small electronic object.', 'a gadget made to do a particular job', 'a small machine or piece of equipment made for a particular purpose, such as a phone or tablet']),
  text('digital', [], ['regional', 'amusing'], 'A ticket on your phone, a camera without film and an online library all use computers instead of paper: they are digital.',
    ['Instead of carrying a paper ticket, you show the one stored on your phone at the cinema door.', 'Cameras, clocks and libraries can all have this version, using computers instead of film, hands or paper.', 'stored or shown using computers and screens rather than on paper', 'using electronic technology, especially computers and the internet, to store or send information']),
  text('streaming', [], ['culture', 'percentage'], 'Video and music that play as they arrive, without a saved file, are streaming; that is why it needs a steady connection.',
    ['On the bus home, your series starts playing at once without waiting for a file to save to your phone.', 'Music and video apps use this, which needs a steady internet connection or it keeps pausing.', 'watching films online without waiting for them to be saved on your device', 'playing video or music over the internet as it arrives, without downloading it first']),
  text('relevant', [], ['amusing', 'affordable'], 'A paragraph about your holiday does not belong in an essay on climate change, because it is not connected to the question: it is not relevant.',
    ['While you write about climate change, your teacher crosses out a paragraph about your holiday.', 'Evidence, examples and facts must be this to the question you are answering.', 'closely connected to what is being discussed', 'connected to the subject being discussed, and so useful or important for it']),
  text('educator', ['educators'], ['celebrity', 'accessory'], 'Teachers, lecturers and trainers all have the job of helping others learn: they are educators.',
    ['At parents\' evening you meet the people who spend the day helping children learn.', 'The job title covers teachers, lecturers and training staff.', 'someone who teaches or trains other people as a job', 'a person whose job is to teach or train others']),
  text('afford', ['affords', 'afforded', 'affording'], ['concentrate', 'communicate'], 'When money is tight, families look at a price and say whether they can pay it: that is whether they can afford something.',
    ['You want the latest phone, but you check your bank balance and decide it is out of reach.', 'Families with a tight budget often say they cannot do this when they look at holiday prices.', 'to be able to pay for something without a money problem', 'to have enough money to buy or pay for something']),
  text('essential', [], ['regional', 'amusing'], 'On a packing list, water, boots and a map are the items you must bring, while sweets and games are only optional extras: the must-haves are essential.',
    ['The trip leader hands out a packing list and underlines the items every student has to bring.', 'Water, boots and a map must go in the bag, while sweets and games are only optional extras.', 'something you must have, not just a nice extra', 'absolutely necessary; extremely important']),
  text('current affairs', [], ['celebrity', 'equipment'], 'Election results, conflicts and new laws are the news about what is happening in the world right now: current affairs.',
    ['Your teacher asks you to read the headlines each morning so you can discuss what is happening in the world.', 'Election results, international conflicts and new laws are covered in this kind of programme or newspaper section.', 'what is going on in the world today, such as in politics', 'important news about politics, society and world events that are happening now']),
  text('celebrity', ['celebrities'], ['educator', 'percentage'], 'Crowds outside hotels, red carpets and magazine covers all follow one kind of person: a famous one, or celebrity.',
    ['Crowds with phones gather outside a hotel, hoping to see one particular person step out of a car.', 'Magazines, red carpets and social media followers all follow the life of this kind of person.', 'someone everyone has heard of, usually from television, music or sport', 'a famous person, especially from entertainment or sport']),
  text('informed', [], ['external', 'removable'], 'A voter who has read every plan and followed the news makes decisions from facts, not guesses: an informed choice.',
    ['Before voting in the school election, she reads every candidate\'s plan so that she is not guessing.', 'An opinion backed by research, a choice made after checking the facts and a voter who follows the news can all be described this way.', 'knowing the facts about a subject', 'having or showing knowledge about a subject or situation']),
  text('admit', ['admits', 'admitted', 'admitting'], ['overcome', 'transform'], 'A suspect or a politician who finally says "yes, it is true" when they would rather not is making an admission: they admit it.',
    ['After a long silence, the footballer says it was his mistake after all.', 'A suspect, a politician or a child caught with sweets might finally say "yes, it is true" even though they would rather not.', 'to say, usually reluctantly, that something is true', 'to agree, often unwillingly, that something is true or that you did something wrong']),
  text('communicate', ['communicates', 'communicated', 'communicating'], ['afford', 'overcome'], 'Phones, emails, body language and sign language are all ways of getting your ideas across to other people: they let you communicate.',
    ['Two exchange students who share no common language still manage to plan a project using gestures and an app.', 'Phones, emails, body language and sign language are all ways of doing this.', 'to pass your ideas, news or feelings to other people', 'to share information, ideas or feelings with other people']),
  text('remotely', [], ['apparently', 'supposedly'], 'A technician fixing your laptop from another building, or an employee working from home, is acting from a distance: remotely.',
    ['The IT technician fixes your laptop while you are at home and she is at the office.', 'Employees working from their own kitchens, or a drone steered from miles away, are doing things this way.', 'from far away instead of being in the same place', 'from a distance, without being physically present, usually by using technology']),
  text('transform', ['transforms', 'transformed', 'transforming'], ['concentrate', 'afford'], 'A run-down building rebuilt into a community centre, or smartphones changing how we shop, show something changed completely: they transform it.',
    ['A run-down empty building is rebuilt into a bright community centre that nobody would recognise.', 'Smartphones did this to how we shop, travel and talk to each other.', 'to change something completely', 'to change something completely, especially so that it becomes better or very different']),
  text('percentage', ['percentages'], ['impression', 'culture'], 'Survey results, battery levels and discounts are all given as a part of every hundred: a percentage.',
    ['In a survey, 30 out of every 100 students say they prefer reading on a screen.', 'Exam results, battery levels and discounts are often given using this and the % sign.', 'a number out of 100 that shows part of a whole', 'an amount expressed as a part of every hundred']),
  text('impression', ['impressions'], ['percentage', 'function'], 'Meeting someone for the first time, at an interview or open day, leaves you with a quick picture of them: an impression.',
    ['You meet your friend\'s parents for the first time and quickly decide what they are like.', 'Interviews, dates and school open days all give you this within the first few minutes.', 'the picture of someone or something that forms in your mind after a short meeting', 'the idea or feeling you have about someone or something after seeing or meeting them']),
  text('remote control', ['remote controls'], ['culture', 'educator'], 'A small handheld gadget that changes the channel from the sofa operates a machine from a distance: a remote control.',
    ['You cannot find it, so you have to walk up to the television to change the channel.', 'A small gadget with buttons for volume and channels, which you point at the screen from the sofa.', 'a handheld gadget you use to change things from across the room', 'a small handheld device used to operate a television or other machine from a distance']),
  text('feature', ['features'], ['impression', 'percentage'], 'A waterproof body on a phone or a lake in a park are the points that stand out about a product or place: their features.',
    ['A phone advert shows a waterproof body, a fast camera and a long battery to persuade you to buy.', 'Reviewers list the notable points of a product or a place, such as a lake in a park.', 'a point that stands out about a product, place or person', 'an important or noticeable part or quality of something']),
  text('function', ['functions'], ['culture', 'celebrity'], 'A heart, a hammer and a calculator each have a job they were made to do: that is their function.',
    ['A student asks what the strange button on the remote is actually for.', 'A heart, a hammer and a calculator each have a main job that they were made to do.', 'what something is for; the job it does', 'the purpose or job that something has; what it is designed to do']),
  text('interactive', [], ['predictable', 'removable'], 'A whiteboard you tap, a museum screen and a quiz app all respond to what you do instead of just showing something: they are interactive.',
    ['Instead of just watching the lesson, you tap, drag and answer questions on the whiteboard.', 'Museum screens, quiz apps and video games respond to what you do rather than showing a fixed film.', 'reacting to what you do, so that you take part', 'allowing users to take part and respond, rather than just watch or read']),
  text('widespread', [], ['external', 'predictable'], 'Power cuts across a whole country or support among most parents are found in many places or among many people: they are widespread.',
    ['After the storm, power cuts hit town after town across the whole country.', 'Support, damage or belief can be described this way when you find it in many places or among many people.', 'not limited to one place: it is found nearly everywhere', 'found or happening in many places or among many people']),
  text('availability', [], ['percentage', 'impression'], 'Whether a console is in stock or a hotel room is free to book is a matter of availability.',
    ['You want a new games console, but every shop shows "out of stock".', 'Hotels, flights and medicines are checked for this: is there any left to book or buy?', 'how easily you can find something to buy or use, such as stock in a shop', 'the fact that something is there to be obtained, used or booked']),
  text('high-performance', [], ['regional', 'educational'], 'Racing engines, gaming computers and sports cars are built to work extremely well and fast: they are high-performance.',
    ['A racing team ignores the family-car parts and looks for the fastest engine money can buy.', 'Sports cars, gaming computers and racing bikes advertise their power and speed with this word.', 'built to work extremely well and very fast', 'able to work at a very high standard or speed']),
  text('stabilising', [], ['interactive', 'regional'], 'A fin on a rocket, a calm new captain and a measure that stops prices jumping all keep things steady: they have a stabilising effect.',
    ['After weeks of arguments, a calm new captain joins and the team finally settles down.', 'A fin on a rocket, a calm leader or a government measure that stops prices jumping can all have this effect.', 'keeping things steady so they do not wobble or change suddenly', 'making something steady and less likely to change suddenly or fall']),
  text('multi-task', ['multitask', 'multitasks', 'multitasked', 'multitasking', 'multi-tasks', 'multi-tasked', 'multi-tasking'], ['transform', 'overcome'], 'Cooking, answering messages and helping with homework in the same ten minutes is doing several jobs at once: to multi-task.',
    ['You cook dinner, answer a message and help your brother with his maths homework in the same ten minutes.', 'A student switching between an essay, music and chat windows is trying to do this, often with mixed results.', 'to do more than one thing at once', 'to do several jobs or activities at the same time']),
  text('predictable', [], ['regional', 'amusing'], 'A film whose ending you guess in the first scene, or a routine that never changes, is easy to know in advance: it is predictable.',
    ['From the first scene you know exactly who the villain is and how the film will end.', 'A routine, a plot or a friend\'s reaction that never surprises you can be described this way.', 'easy to guess before it happens', 'happening or behaving in the way you expect; easy to know in advance']),
  text('professional', [], ['regional', 'amusing'], 'A wedding photographer, an electrician and an accountant all work to the standard of someone trained for it: they are professional.',
    ['The wedding photos look polished because the person taking them does this for a living.', 'A footballer, an electrician and an accountant all earn their living from skills they trained for.', 'done to a high standard by someone trained for it', 'showing the skill and high standards expected of someone who is trained for a job']),
  text('regional', [], ['predictable', 'genuine'], 'A newspaper for the north-west, a manager for one part of the country and a local accent all belong to one area: they are regional.',
    ['Listening to two newsreaders, you can tell one grew up in the north from the way he says some words.', 'A newspaper that covers only the north-west, or a manager in charge of one part of the country, has this label.', 'belonging to one area of a country rather than the whole country', 'relating to a particular area of a country or of the world']),
  text('commentary', ['commentaries'], ['culture', 'impression'], 'A voice that names every pass and goal while the match is on gives a running description: commentary.',
    ['You follow a match on the radio because you cannot be at the stadium, and a voice tells you everything.', 'A presenter in a booth above the pitch names every pass and goal the moment it happens.', 'someone talking you through an event while it is going on', 'a spoken description of an event, such as a match, as it happens']),
  text('educational', [], ['predictable', 'competitive'], 'A museum trip, a documentary and a quiz app that teach you something useful are educational.',
    ['A parent chooses a museum trip rather than a theme park because the children will learn something.', 'Documentaries, quiz apps and school visits are often described with this word.', 'good for teaching you something useful', 'giving knowledge or teaching useful things']),
  text('culture', ['cultures'], ['percentage', 'accessory'], 'Greetings, food, festivals and beliefs together make up a group\'s way of life: its culture.',
    ['When you visit a new country, you notice how people greet each other, what they eat and which festivals they celebrate.', 'Traditions, food, music, clothing and beliefs together make up this for a community or a country.', 'what a community does and believes together: its food, festivals and ways of living', 'the customs, beliefs and way of life of a particular group of people']),
  text('genuine', [], ['predictable', 'widespread'], 'A designer bag that is not a copy, or a smile that is not pretended, is the real thing: it is genuine.',
    ['You wonder whether the designer bag you found online is real or a cheap copy.', 'Leather, a smile or a compliment can be called this when it is not fake or pretended.', 'not a copy and not pretending to be something else', 'real and not false, fake or pretended']),
  text('amusing', [], ['predictable', 'external'], 'A clumsy pirate in the school play, a joke or a cartoon makes you smile or laugh: it is amusing.',
    ['At the end of the school play, the audience is giggling at the clumsy pirate who trips over his own sword.', 'A joke, a cartoon or a story can earn this word without being hilarious; it makes you smile.', 'slightly funny in an enjoyable way', 'funny and entertaining; making you smile or laugh']),
  text('competitive', [], ['stabilising', 'removable'], 'Even a friendly board game, a sales team or a sports final can bring out the wish to beat everyone else: being competitive.',
    ['Even in a friendly board game, she checks the scores and hates letting anyone overtake her.', 'Athletes, sales teams and some shops all show this when they fight hard to beat rivals.', 'always trying hard to win or to do better than others', 'wanting very much to win or to be more successful than others']),
  text('critical', [], ['amusing', 'predictable'], 'An editor\'s long list of faults and a reviewer who points out weaknesses are both expressing disapproval: they are critical.',
    ['After reading the first draft, the editor sends back a long list of everything that is wrong with it.', 'A reviewer who mostly points out faults rather than strengths is described with this word.', 'always pointing out what is wrong with something or someone', 'expressing disapproval of someone or something, or pointing out their faults']),
  text('impressive', [], ['regional', 'stabilising'], 'A goal from the halfway line, a huge skyscraper and top exam results all earn admiration: they are impressive.',
    ['A teenager scores the winning goal from the halfway line and the whole stadium gasps.', 'A huge skyscraper, a superb piano performance or excellent exam results can all earn this word.', 'so skilful, big or good that people admire it', 'causing admiration because of great skill, size or quality']),
  text('determination', [], ['impression', 'percentage'], 'Failing a driving test twice and still booking a third attempt, or running a marathon when quitting is easier, shows a strong will not to give up: determination.',
    ['She fails her driving test twice, but she books a third one and keeps practising.', 'Marathon runners and students retaking exams often show this quality when quitting would be easier.', 'a strong will that makes you keep trying', 'the strong will to keep trying to achieve something difficult without giving up']),
  text('overcome', ['overcomes', 'overcame', 'overcoming'], ['admit', 'afford'], 'A swimmer beating her fear of deep water, or an athlete returning from injury, gets past a problem that was stopping them: they overcome it.',
    ['A swimmer afraid of deep water finally dives in from the high board.', 'Learners of a new language, injured athletes and nervous speakers all talk about doing this to a problem standing in their way.', 'to beat a problem and get past it', 'to succeed in dealing with a problem or difficulty that is stopping you']),
  text('accessory', ['accessories'], ['percentage', 'celebrity'], 'A phone case, a scarf and a laptop mouse are all extras that go with a main item: accessories.',
    ['You buy a new phone, then add a case, a charger and a screen protector to go with it.', 'A scarf or a belt can be this for an outfit; a mouse or headphones can be this for a laptop.', 'something you add to a main item to make it more useful or more attractive', 'a small extra item, such as a case or a scarf, that is added to a main item to go with it']),
  text('equipment', [], ['culture', 'percentage'], 'Ropes and boots for a climb, cameras for a film crew and machines for a hospital are everything needed for a job: equipment.',
    ['Before a mountain hike, you pack ropes, boots, a tent and a stove.', 'A football club, a hospital and a film crew all need a lot of this to do their work.', 'all the things you need to do a particular job or activity', 'the tools, machines or clothing needed for a particular job or activity']),
  text('fixture', ['fixtures'], ['celebrity', 'percentage'], 'The sink, the ceiling lights and the bath stay behind when the sellers move out because they are permanently attached to the building: fixtures.',
    ['When you buy a house, the sellers leave the sink, the ceiling lights and the bath behind.', 'Estate agents list the light fittings and bathroom units that stay with the building when you move in.', 'something that is part of a building and stays when the owners move out', 'a fitting, such as a light or a sink, that is permanently attached to a building']),
  text('removable', [], ['predictable', 'regional'], 'Sofa covers, phone batteries and lids can be taken off or out: they are removable.',
    ['Before washing the sofa, you pull the covers off the cushions.', 'Phone batteries, lids and covers are called this when you can take them off or out.', 'not stuck on: you can take it off when you want to', 'able to be taken off or taken out']),
  text('adjustable', [], ['interactive', 'widespread'], 'A bike seat, a watch strap and a monitor stand can be moved or changed to fit different people: they are adjustable.',
    ['A tall student and a short one both use the same desk chair and each makes it comfortable for themselves.', 'Bike seats, watch straps and monitor stands often have levers or screws so you can move them to fit you.', 'something you can change or move to fit you', 'able to be changed or moved to suit different needs']),
  text('affordable', [], ['external', 'predictable'], 'Housing, train tickets and trainers that ordinary families can pay for are affordable.',
    ['You compare two pairs of trainers and pick the one that does not empty your savings.', 'Councils want housing and train tickets to be this, so that ordinary families can buy them.', 'cheap enough for most people to buy', 'with a price that most people can pay without difficulty']),
  text('external', [], ['digital', 'genuine'], 'A hard drive beside the laptop, an examiner from another school and walls facing the street are all outside something: external.',
    ['You back up your photos on a spare hard drive that sits beside your laptop rather than inside it.', 'Examiners who come from another school and walls that face the street both use this word.', 'on the outside, or coming from somewhere outside', 'outside something, or coming from outside it']),
  text('concentrate', ['concentrates', 'concentrated', 'concentrating'], ['transform', 'admit'], 'A silent exam hall with one question left: you keep your mind on one thing and concentrate.',
    ['In the exam hall your phone is in your bag and only one question is left, so you block out the noise outside.', 'Teachers tell you to do this on your work and to stop looking out of the window.', 'to keep your mind on one thing', 'to give all your attention to one thing'])
];
export const CONNECTIONS_PUZZLES_U2 = Object.freeze(PUZZLES_U2);
