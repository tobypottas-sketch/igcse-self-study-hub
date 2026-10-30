// Unit 5 · Context · Mastery (type_in_passage) — authored short passages, WORDS 1–10 ONLY. Same contract as unit-04-context-passages.js:
// two passages per word, each 2-3 natural sentences with exactly ONE gap (`____`); the passage never contains the target elsewhere, never starts
// with the gap, and makes the target the natural fit. `answer` is the exact surface form typed. `why` records what points to the word.
const p = (text, answer, why) => ({ text, answer, why });

export default Object.freeze({
  'aerial tourism': [
    p('Visitors to the glacier can take a short flight in a small helicopter. Many of them say that ____ is the best way to understand how huge the ice field really is.', 'aerial tourism', 'Helicopter flights over a glacier; "____ is the best way to understand how huge the ice field is".'),
    p('The island has few roads and many steep hills, so the tourist board has started to promote ____. For a small fee, visitors can fly over the beaches, forests and villages in a light aircraft.', 'aerial tourism', '"promote ____" explained by flying over beaches and villages.')
  ],
  'underwater photography': [
    p('The young diver always carried a waterproof camera in a special case. She loved ____ because it let her share the colours of the reef with people who would never see them.', 'underwater photography', 'Waterproof camera and reef; "loved ____ because it let her share the colours of the reef".'),
    p('The magazine wanted pictures of sharks, turtles and coral for its summer issue, so it asked a diver with a professional camera to take them. His skill in ____ meant that even the deepest dives produced sharp, colourful images.', 'underwater photography', 'Diver with a professional camera; "skill in ____ ... deepest dives produced sharp images".')
  ],
  documentary: [
    p('On the flight home, Marcus watched a ____ about the people who live on the shores of Lake Baikal. He enjoyed it so much that he decided to read more about the region.', 'documentary', 'Real people and places; "watched a ____ about the people who live ...".'),
    p('The local television station is planning a new ____ for the summer. The film crew will interview fishermen, hotel owners and guides to show what tourism has really done to the coast.', 'documentary', 'Film crew interviewing real people; "planning a new ____".')
  ],
  snorkelling: [
    p('We rented fins, masks and breathing tubes from the beach hut. For the next hour we went ____ along the edge of the reef and watched turtles, rays and shoals of tiny silver fish.', 'snorkelling', 'Fins, masks and tubes; "went ____ along the edge of the reef".'),
    p('Scuba divers need years of training and heavy air tanks, but my little brother has no such equipment. For him, ____ is perfect: he floats on the surface in shallow water and simply looks down at the colourful world below.', 'snorkelling', 'Contrast with divers; "floats on the surface ... looks down".')
  ],
  expedition: [
    p('The team spent a year raising money, buying equipment and training in the snow. At last they left on the ____ to reach the South Pole on foot.', 'expedition', 'A year of preparation; "left on the ____ to reach the South Pole".'),
    p('Scientists from three countries travelled deep into the rainforest to search for new species of frogs. The ____ lasted eight weeks, and every member of the team kept a daily record of what they found.', 'expedition', 'Scientists searching the rainforest; "The ____ lasted eight weeks".')
  ],
  yacht: [
    p('The harbour was full of expensive white boats with tall masts. The owner invited us aboard his ____, a sleek vessel built for racing and for luxury holidays at sea.', 'yacht', 'Masts and sails; "his ____, a sleek vessel built for racing".'),
    p('My uncle loves sailing, and he saved money for ten years. Last summer he finally bought a second-hand ____ and spent every weekend sailing along the coast.', 'yacht', 'Sailing and saving money; "bought a second-hand ____ and spent every weekend sailing".')
  ],
  scenery: [
    p('The bus climbs slowly along the edge of the cliff, and nobody minds the delay. The ____ outside, with its green hills and silver waterfalls, is the main reason people book this tour.', 'scenery', 'Green hills and waterfalls; "The ____ outside ... main reason people book this tour".'),
    p('Our guide promised that the hike would be difficult, but she also said that the ____ would make every step worthwhile. At the summit, we could see forests, rivers and distant mountains in every direction.', 'scenery', 'Forests, rivers and mountains; "the ____ would make every step worthwhile".')
  ],
  attractions: [
    p('The old town is small, but it is packed with things to see. Within a ten-minute walk of the main square, visitors can reach the cathedral, the castle and the art museum, which are the region’s best-known tourist ____.', 'attractions', 'Cathedral, castle and museum; "best-known tourist ____".'),
    p('We had only one day in the capital, so we asked the hotel receptionist which ____ were worth visiting. She suggested the royal palace, the river cruise and the science museum.', 'attractions', 'Palace, cruise and museum; "which ____ were worth visiting".')
  ],
  accommodation: [
    p('Our flight arrived after midnight, and the airport was almost empty. Fortunately, the travel agent had arranged our ____ in advance, together with breakfast and an airport pick-up.', 'accommodation', 'Arranged in advance with breakfast; "arranged our ____".'),
    p('Prices in the city centre are high, so students on a small budget often look for cheap ____ on the edge of town. A bed in a shared hostel costs less than a quarter of the price of a hotel room.', 'accommodation', 'Hostel bed versus hotel room; "look for cheap ____".')
  ],
  adventurous: [
    p('Most people in the tour group wanted to relax by the hotel pool. Anya, however, was far more ____: she hired a bicycle, cycled up the mountain road and jumped into a waterfall.', 'adventurous', 'Contrast with relaxing; "far more ____: she cycled ... and jumped into a waterfall".'),
    p('The tour company’s advertisement says that its holidays are designed for ____ people who enjoy new challenges. Guests can try rock climbing, canoeing and camping in remote places.', 'adventurous', 'Rock climbing and canoeing; "designed for ____ people who enjoy new challenges".')
  ]
});
