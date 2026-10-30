// Unit 5 · Context · Mastery (type_in_passage) — authored short passages, WORDS 1–20 ONLY. Same contract as unit-04-context-passages.js:
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
  ],
  breathtaking: [
    p('The coach stopped at a high viewpoint above the fjord. Everyone stepped out in silence, because the scene below was so ____ that nobody could find the words to describe it.', 'breathtaking', 'Silence at a viewpoint; "so ____ that nobody could find the words".'),
    p('Skydiving over the coast was frightening and thrilling at the same time. Later, the passengers agreed that the ____ views of the shoreline were worth every moment of fear.', 'breathtaking', 'Thrill and fear; "the ____ views ... were worth every moment of fear".')
  ],
  spectacular: [
    p('The festival organisers wanted something unforgettable for the final night. They launched thousands of lanterns into the sky, and the ____ display could be seen from every hotel along the beach.', 'spectacular', 'Thousands of lanterns visible from every hotel; "the ____ display".'),
    p('The volcano erupts every few weeks, and boat trips take visitors close enough to watch. From the deck, passengers see ____ fountains of red lava shooting hundreds of metres into the air.', 'spectacular', 'Lava shooting hundreds of metres; "see ____ fountains of red lava".')
  ],
  dramatic: [
    p('In the morning, the valley was calm and green. By afternoon the weather had turned: black clouds rolled in, the wind roared and lightning lit the peaks, creating a ____ scene that the photographers rushed to capture.', 'dramatic', 'Calm turning to storm; "creating a ____ scene".'),
    p('Tourism on the island used to be very small. Since the airport opened, however, the figures have shown a ____ rise, and the number of hotels has tripled in five years.', 'dramatic', 'Hotels tripled in five years; "a ____ rise".')
  ],
  stunning: [
    p('We checked into a tiny guesthouse on the cliff, and the room itself was simple. The real surprise was the balcony, which offered a ____ view of the bay, pink in the evening light.', 'stunning', 'Simple room but a beautiful bay; "a ____ view of the bay, pink in the evening light".'),
    p('The tourism poster showed a family on a golden beach under a pink sky. Everyone who saw it agreed that the picture was ____, and bookings doubled within a week.', 'stunning', 'Advertising poster; "the picture was ____, and bookings doubled".')
  ],
  popular: [
    p('The old market was almost empty when the tour company first added it to its programme. Now it is extremely ____, and visitors often wait twenty minutes to get in.', 'popular', 'Empty before, queues now; "extremely ____".'),
    p('The ferry company has added extra boats this year. Travel guides say that the harbour restaurants are the most ____ places to eat in town, because tourists and local people fill every table every evening.', 'popular', 'Every table full; "the most ____ places to eat".')
  ],
  static: [
    p('Most travel programmes follow the presenter as she walks through the market. In one episode, however, the director used a ____ shot of the busy square from a window, and viewers watched the crowds move around the same still frame.', 'static', 'Same still frame; "used a ____ shot ... from a window".'),
    p('Local officials hoped that the new airport would increase tourism. Five years later, however, the figures were ____: roughly the same number of visitors arrived every summer, and neither hotels nor shops had grown.', 'static', 'Same numbers every summer; "the figures were ____".')
  ],
  'ground-level': [
    p('The tourist board wanted photographs that showed the old harbour as a visitor would experience it. The photographer therefore left the drone at the hotel and took only ____ pictures, crouching on the stones and looking up at the boats.', 'ground-level', 'Left the drone; crouching on the stones; "took only ____ pictures".'),
    p('Aerial pictures of the temple show its shape, but they cannot show the carvings on its walls. For those details, the guidebook uses ____ photographs taken by people standing at the foot of each wall.', 'ground-level', 'Contrast with aerial pictures; "standing at the foot of each wall".')
  ],
  'angle of view': [
    p('From the viewing platform, a phone camera cannot capture both cliffs and the waterfall between them. A lens with a wider ____ would solve the problem, because it fits more of the scene into the frame.', 'angle of view', '"fits more of the scene into the frame"; "a wider ____".'),
    p('Two photographers stood side by side at the same viewpoint. The first used a long lens and photographed only the tower; the second used a short lens, and her ____ was so wide that the tower, the bridge and the river all appeared in one picture.', 'angle of view', 'Short lens, wider scene; "her ____ was so wide".')
  ],
  'ecological habitats': [
    p('The island is small, but it contains a coral reef, a mangrove forest and a quiet lagoon. Scientists call these different ____ because each one provides a home for its own community of plants and animals.', 'ecological habitats', 'Reef, forest, lagoon each with its own community; "call these different ____".'),
    p('Tour operators are now asked to keep boats away from nesting areas and to keep visitors on marked paths. The new rules aim to protect the ____ of the birds and animals that live in the national park.', 'ecological habitats', 'Nesting areas and marked paths; "protect the ____ of the birds and animals".')
  ],
  'marine world': [
    p('A glass-bottomed boat leaves the harbour every morning. Passengers lean over the side to see coral, shoals of fish and even a turtle, and for many of them it is their first glimpse of the ____.', 'marine world', 'Glass-bottomed boat, coral and turtle; "first glimpse of the ____".'),
    p('The museum’s newest hall is filled with blue light and the sound of waves. Models of whales, sharks and jellyfish hang from the ceiling, giving visitors a feel for the ____ without getting wet.', 'marine world', 'Whales, sharks and waves; "a feel for the ____ without getting wet".')
  ]
});
