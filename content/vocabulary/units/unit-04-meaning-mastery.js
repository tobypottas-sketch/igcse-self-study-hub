// Unit 4 · Meaning · Apply and Mastery — authored wrong meanings, WORDS 1–20 ONLY. Same contract as unit-03-meaning-mastery.js:
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
  ]

});
