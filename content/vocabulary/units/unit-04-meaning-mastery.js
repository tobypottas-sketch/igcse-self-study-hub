// Unit 4 · Meaning · Apply and Mastery — authored wrong meanings, WORDS 1–30 ONLY. Same contract as unit-03-meaning-mastery.js:
// two records per word in the order of the word's two Mastery contexts; exactly three authored WRONG glosses, same grammar and similar length
// as the correct gloss, plausible in general, wrong in this sentence.
const w = (wrongMeanings, extra = {}) => ({ wrongMeanings, ...extra });

export default Object.freeze({
  breathtaking: [
    w(['extremely cold and windy', 'extremely high and dangerous', 'extremely quiet and empty']),
    w(['so tiring or boring that it exhausts you', 'so slow or crowded that it annoys you', 'so loud or sudden that it frightens you'])
  ],
  comfort: [
    w(['a feeling of safety without danger or risk', 'a level of speed without delay or noise', 'an amount of money without debt or cost']),
    w(['physical strength and fitness', 'speed and efficiency', 'safety and security'])
  ],
  reality: [
    w(['the usual routine that people follow', 'the main reason that people give', 'the best result that people expect']),
    w(['what was publicly promised', 'what might happen later', 'what most people expected'])
  ],
  toughest: [
    w(['the most expensive to plan or finance', 'the most dangerous to enter or leave', 'the most famous to visit or photograph']),
    w(['the longest to wait for', 'the easiest to prepare for', 'the most boring to listen to'])
  ],
  storeys: [
    w(['the rooms or flats inside a building', 'the windows or doors of a building', 'the lifts or stairs in a building']),
    w(['sections of a building, counted from left to right', 'rooms of a building, counted from the entrance', 'walls of a building, counted from the outside'])
  ],
  accommodate: [
    w(['carry safely to another place', 'provide food and drink for', 'keep out of the building']),
    w(['have enough power to move', 'have enough money to buy', 'have enough time to wait for'])
  ],
  luxury: [
    w(['great speed provided by powerful engines', 'great safety provided by careful rules', 'great freedom provided by long holidays']),
    w(['something useful and cheap that is easy to find', 'something essential and costly that people must buy', 'something enjoyable and rare that is hard to find'])
  ],
  altitude: [
    w(['distance from the nearest city', 'speed relative to the ground', 'depth below the ground']),
    w(['the distance of a place from the coast', 'the temperature of a place in winter', 'the size of a place on the map'])
  ],
  landscape: [
    w(['all the roads and tracks that cross an area', 'all the buildings that have been built in an area', 'all the maps that have been drawn of an area']),
    w(['the history of an area of countryside', 'the size of an area of countryside', 'the owner of an area of countryside'])
  ],
  passenger: [
    w(['a person who drives a vehicle but does not own it', 'a person who repairs a vehicle but does not use it', 'a person who waits for a vehicle but does not board it']),
    w(['an inspector who works for the driver or crew', 'a visitor who waits to meet the driver or crew', 'a guard who travels with the driver or crew'])
  ],
  engineer: [
    w(['a person trained to drive and park vehicles', 'a person trained to sell and advertise buildings', 'a person trained to inspect and sell tickets']),
    w(['a person trained to fly aircraft and ships', 'a person trained to guide tourists and visitors', 'a person trained to sell parts and tools'])
  ],
  pilot: [
    w(['a person who builds an aircraft', 'a person who guides an aircraft from the ground', 'a person who inspects an aircraft']),
    w(['the person who serves meals on the aeroplane', 'the person who checks tickets on the aeroplane', 'the person who carries bags onto the aeroplane'])
  ],
  airship: [
    w(['a fast aircraft with wings and jet engines', 'a large ship that sails across the ocean', 'a small helicopter with rotating blades']),
    w(['a camera fixed to a tall tower', 'a helicopter with a long rope', 'a balloon that drifts with the wind'])
  ],
  launch: [
    w(['bring back to Earth', 'pay for in advance', 'test on the ground']),
    w(['close an old service for the public', 'advertise an old service to the public', 'increase the price of a service'])
  ],
  height: [
    w(['how heavy something is when loaded', 'how fast something can travel', 'how much something costs to own']),
    w(['the measurement from side to side', 'the measurement from front to back', 'the measurement of its total weight'])
  ],
  anxious: [
    w(['excited about what may happen', 'angry about what has happened', 'bored by what is happening']),
    w(['calm and relaxed', 'proud and pleased', 'tired and sleepy'])
  ],
  vehicle: [
    w(['a person who drives on public roads', 'a road used by cars and lorries', 'a building where cars are kept']),
    w(['a station where cars or buses stop', 'a licence that allows people to drive', 'a service that sells cars and buses'])
  ],
  pollution: [
    w(['a shortage of space caused by crowded streets', 'the noise caused by heavy lorries', 'the heat caused by sunny weather']),
    w(['a shortage of water or fuel', 'a rise in the cost of materials', 'a loss of workers or customers'])
  ],
  destination: [
    w(['a place that people leave from', 'a road that people drive along', 'a time that people choose to travel']),
    w(['the platform the train leaves from', 'the company that runs the train', 'the route the train follows'])
  ],
  spacious: [
    w(['having very little room for people', 'having a great many passengers', 'having a very low price']),
    w(['crowded and noisy with queues of people', 'small and dark with low ceilings', 'old and dirty with broken equipment'])
  ],
  efficiently: [
    w(['at a very high speed whatever the cost', 'in a cheerful and friendly manner', 'with a great deal of effort']),
    w(['in a way that costs more to run', 'in a way that moves much faster', 'in a way that needs more drivers'])
  ],
  demand: [
    w(['the number of seats that an airline has', 'the price that an airline charges', 'the time that an airline takes to fly']),
    w(['a strong complaint from the public about something', 'a strong rule made by the public about something', 'a strong threat from the public to stop something'])
  ],
  invention: [
    w(['an old tool that people no longer use', 'a popular story about travel', 'a natural feature of the landscape']),
    w(['the repair of something that was broken', 'the discovery of something that was hidden', 'the sale of something that was cheap'])
  ],
  machinery: [
    w(['workers who are hired to help with a job', 'buildings where goods are stored and sold', 'animals that are trained to pull heavy loads']),
    w(['storage areas used for keeping goods dry', 'offices used for managing the shipping staff', 'contracts used for sending goods overseas'])
  ],
  advertisement: [
    w(['a notice designed to warn people of danger', 'a notice designed to give people directions', 'a notice designed to tell people the time']),
    w(['a message designed to warn people of delays', 'a message designed to thank people for waiting', 'a message designed to teach people a skill'])
  ],
  enormous: [
    w(['extremely strong for its weight', 'extremely slow to operate', 'extremely new in design']),
    w(['surprisingly low and fair', 'paid slowly over many years', 'shared equally between cities'])
  ],
  equipment: [
    w(['the staff needed for a particular job', 'the rules needed for a particular purpose', 'the money needed for a particular task']),
    w(['the permission needed to start a job', 'the training needed to pass a test', 'the time needed to finish a project'])
  ],
  collision: [
    w(['a race between two moving vehicles', 'a signal between moving vehicles', 'a gap between moving vehicles']),
    w(['a meeting in which things come together peacefully', 'a decision to change the direction of travel', 'a delay caused by bad weather'])
  ],
  organisation: [
    w(['a building where people learn together', 'a plan for arranging a project carefully', 'a class of children who study together']),
    w(['an official event held to celebrate a success', 'an official law made to control a business', 'an official report written to describe a problem'])
  ],
  participant: [
    w(['a person who watches an event from the side', 'a person who plans an event beforehand', 'a person who pays for an event to be held']),
    w(['a person who judges a test or study', 'a person who writes about a test or study', 'a person who sells equipment for a study'])
  ],
  livelihood: [
    w(['the way a person spends money on holiday', 'the way a person travels between home and work', 'the way a person pays tax each year']),
    w(['the training that a person receives for a job', 'the union that a person joins at work', 'the home that a person rents near work'])
  ],
  fatality: [
    w(['an injury caused by an accident', 'a delay caused by an accident', 'a fine caused by an accident']),
    w(['a person who survives an accident or disaster', 'a warning given before an accident or disaster', 'a loss of money in an accident or disaster'])
  ],
  initiative: [
    w(['a new law to punish drivers', 'a new report about school children', 'a new building near a school']),
    w(['a new rule intended to limit a service', 'a new ticket intended to raise prices', 'a new complaint intended to stop a change'])
  ],
  campaign: [
    w(['a single announcement made to the press', 'a long journey made by a group of cyclists', 'a race held between rival cycling clubs']),
    w(['a formal complaint made to a court', 'a private meeting held with a council', 'a long delay caused by a council'])
  ],
  pothole: [
    w(['a pool of water that forms beside a road', 'a bump that is built to slow traffic down', 'a trench that is dug to repair a pipe']),
    w(['a small bridge over a road', 'a painted line along a road', 'a metal cover over a drain'])
  ],
  trauma: [
    w(['a short feeling of excitement', 'a minor injury to the body', 'a sense of boredom after a long wait']),
    w(['a serious delay caused by an unexpected event', 'a serious cost caused by an expensive event', 'a serious illness caused by an infection'])
  ],
  measures: [
    w(['calculations made to find the width of a road', 'plans made to build a longer road', 'payments made to the workers on a road']),
    w(['sizes that are given for barriers, lights and cameras', 'prices that are charged for barriers, lights and cameras', 'rules that forbid barriers, lights and cameras'])
  ],
  estimate: [
    w(['to pay in advance', 'to announce publicly', 'to check carefully against a plan']),
    w(['to list every car on a road exactly', 'to record the speed of cars on a road', 'to forbid cars from using a road'])
  ],
  regulation: [
    w(['a polite request made by a driver', 'an advert printed on a bus', 'a record kept by a bus company']),
    w(['a private agreement between two airlines', 'a fee charged to every passenger', 'a report written by an airline pilot'])
  ],
  operate: [
    w(['to repair and test a vehicle', 'to buy and sell a vehicle', 'to wash and clean a vehicle']),
    w(['to design a system correctly', 'to repair a system correctly', 'to sell a system correctly'])
  ]
});
