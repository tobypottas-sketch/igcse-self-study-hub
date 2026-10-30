// Unit 4 · Meaning · Apply and Mastery — authored wrong meanings, WORDS 1–10 ONLY. Same contract as unit-03-meaning-mastery.js:
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
  ]
});
