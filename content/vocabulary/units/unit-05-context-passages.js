// Unit 5 · Context · Mastery (type_in_passage) — authored short passages, WORDS 1–50. Same contract as unit-04-context-passages.js:
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
  ],
  coral: [
    p('The reef is only twenty metres from the beach, and the water is so clear that you can see every detail. Brightly coloured fish swim between branches of pink and orange ____, which grows very slowly and breaks easily.', 'coral', 'Reef, colourful fish and branches that grow slowly and break easily; "pink and orange ____".'),
    p('The marine park asks every visitor to wear a life jacket and to stay away from the sea floor. Even a gentle kick can destroy ____ that has taken hundreds of years to grow.', 'coral', 'Life jackets and the sea floor; "destroy ____ that has taken hundreds of years to grow".')
  ],
  spellbound: [
    p('The old fisherman lowered his voice and began to describe the night a giant wave hit the harbour. The children stopped playing and listened, completely ____, until the story was over.', 'spellbound', 'Children stop playing and listen until the end; "completely ____".'),
    p('When the curtain rose, the audience gasped at the dancers in their golden costumes. For ninety minutes nobody coughed or looked at a phone, because everyone was ____.', 'spellbound', 'Nobody coughed or looked at a phone for ninety minutes; "because everyone was ____".')
  ],
  wildlife: [
    p('Every morning at dawn, the lodge’s guests drive out to the waterhole with their cameras. They hope to see elephants, zebras and other ____ coming down to drink before the sun gets hot.', 'wildlife', 'Safari drive, elephants and zebras at a waterhole; "elephants, zebras and other ____".'),
    p('The reserve has strict rules about noise, litter and speed. Rangers say these rules are necessary because careless visitors can disturb the ____ and damage fragile nesting areas.', 'wildlife', 'Rangers, nesting areas and rules about noise; "disturb the ____".')
  ],
  preservation: [
    p('The ancient city attracts a million visitors a year, and their footsteps are wearing away the stone. Part of every ticket price now pays for the ____ of the oldest streets.', 'preservation', 'Footsteps wearing away stone; ticket money pays for the "____ of the oldest streets".'),
    p('The villagers refused to let a developer build a car park next to the medieval church. They argued that the ____ of the building was more important than easy parking for tourists.', 'preservation', 'Refusing a car park beside a medieval church; "the ____ of the building was more important".')
  ],
  'environmental impact': [
    p('Before the new cable car could be built, the council asked experts to measure how it would change the mountain. Their report on the ____ concluded that the construction would harm rare plants.', 'environmental impact', 'Experts measure the change a cable car would cause; "Their report on the ____".'),
    p('The hotel has stopped using plastic bottles and now collects rainwater for its gardens. The manager says these changes have greatly reduced the resort’s ____.', 'environmental impact', 'Fewer plastic bottles and collected rainwater; "greatly reduced the resort’s ____".')
  ],
  journey: [
    p('We left the hotel at five in the morning and changed buses twice. It was a tiring ____, but we reached the mountain village before lunch.', 'journey', 'Leaving at five and changing buses; "a tiring ____" before reaching the village.'),
    p('The ferry leaves the mainland at nine and docks on the island after lunch. Passengers say that the ____ is worth the wait because dolphins often swim beside the boat.', 'journey', 'Leaves at nine, docks after lunch; "the ____ is worth the wait".')
  ],
  licence: [
    p('Visitors who want to fish in the lake must first go to the village office. After paying a small fee, they are given a ____ that they must carry with them at all times.', 'licence', 'Paying a fee at the office and carrying a document at all times; "given a ____".'),
    p('The inspector asked the boat captain to show his papers before the tourists boarded. Without a valid ____ from the harbour authority, he was not allowed to take passengers out to sea.', 'licence', 'An inspector checking papers; "a valid ____ from the harbour authority".')
  ],
  offer: [
    p('The travel agency has put a poster in its window announcing a new ____ on summer holidays. Anyone who books before the end of March saves a quarter of the price.', 'offer', 'Poster in the window and a quarter off the price; "a new ____ on summer holidays".'),
    p('Late in the season, hotels often try to fill empty rooms. A cheap ____, such as three nights for the price of two, can persuade travellers to book at the last minute.', 'offer', 'Empty rooms and "three nights for the price of two"; "A cheap ____".')
  ],
  'guided tour': [
    p('We did not want to get lost in the huge palace, so we bought tickets for a ____ at ten o’clock. Our leader knew the history of every room and told us stories that were not in the travel books.', 'guided tour', 'Not getting lost, tickets, a leader who knew every room; "tickets for a ____ at ten o’clock".'),
    p('Visitors cannot enter the ancient tombs on their own because the floors are fragile. They must join a ____, during which an expert explains each painting and tells the group where it is safe to walk.', 'guided tour', 'Cannot enter alone; an expert explains each painting; "They must join a ____".')
  ],
  'travel assistant': [
    p('After university, Ana started work at a busy high-street agency. As a ____, she answered customers’ questions, compared flight prices and printed their tickets.', 'travel assistant', 'Agency job answering questions and comparing flight prices; "As a ____".'),
    p('The family could not decide between a beach holiday and a city break. The ____ listened carefully, checked the dates and suggested a hotel that was close to both the sea and the museums.', 'travel assistant', 'Helping a family choose a holiday; "The ____ listened carefully ... suggested a hotel".')
  ],
  'tourism industry': [
    p('The country has warm weather, ancient ruins and miles of empty coastline. As more visitors arrive, the ____ is growing fast and creating jobs for guides, drivers, cooks and hotel staff.', 'tourism industry', 'Visitors arriving and jobs for guides, drivers and cooks; "the ____ is growing fast".'),
    p('Many people in the mountain valley used to depend on farming. Today most of the families earn their living in the ____, working in ski shops, cafés and guesthouses.', 'tourism industry', 'From farming to ski shops, cafés and guesthouses; "earn their living in the ____".')
  ],
  exploring: [
    p('The cave system has more than forty tunnels, and no two are the same. Visitors with torches and helmets can spend a whole day ____ them, finding underground lakes and strange rock shapes.', 'exploring', 'A whole day in forty tunnels, finding lakes and rock shapes; "spend a whole day ____ them".'),
    p('There is no timetable on the trekking holiday. Guests are free to wander through the villages, talk to the local people and enjoy ____ the countryside at their own pace.', 'exploring', 'No timetable, wandering and talking to local people; "enjoy ____ the countryside at their own pace".')
  ],
  observation: [
    p('Biologists camped beside the lake for a month and wrote down everything the birds did. Their conclusions came from patient ____, not from any experiment or machine.', 'observation', 'A month of writing down what birds did, with no experiment; "patient ____".'),
    p('On the first evening, the guide taught the group how to sit quietly and keep their eyes on the forest edge. She told them that good ____ is a skill, and that the best way to learn it is to practise.', 'observation', 'Sitting quietly and watching the forest edge; "good ____ is a skill".')
  ],
  relaxation: [
    p('The island has no nightclubs, no shopping centres and almost no cars. Most visitors come for ____: they swim, read and sleep late until their worries seem far away.', 'relaxation', 'No nightclubs or cars; swimming, reading and sleeping late; "come for ____".'),
    p('After months of long hours at the office, Daniel wanted a holiday that was the opposite of his working life. He chose a quiet mountain retreat devoted to ____, with no phones and no meetings.', 'relaxation', 'The opposite of working life, no phones, no meetings; "devoted to ____".')
  ],
  'adventurous activities': [
    p('The valley has fast rivers, steep cliffs and tall pine forests. Visitors can try rafting, canyoning and climbing, and many say the ____ are the highlight of their holiday.', 'adventurous activities', 'Fast rivers, cliffs, rafting, canyoning and climbing; "the ____ are the highlight".'),
    p('Our school trip to the national park was not about museums or souvenirs. Every day we faced a new challenge, from crossing a rope bridge to paddling through rapids, and the instructors said that these ____ would build our confidence.', 'adventurous activities', 'Rope bridges and rapids as daily challenges; "these ____ would build our confidence".')
  ],
  memorable: [
    p('The ancient city is full of famous monuments, but visitors often say that the best moments were small ones. A conversation with a street musician or a meal in a family kitchen can make a trip truly ____, because years later you can still describe every detail.', 'memorable', 'Small moments you can still describe years later; "make a trip truly ____".'),
    p('Travel writers advise visitors to look for experiences that cannot be repeated. Watching a sunrise from a mountain top is ____ because you will keep the picture in your mind long after the photograph is lost.', 'memorable', 'Keeping the picture in your mind long after; "is ____ because you will keep the picture".')
  ],
  recommendation: [
    p('We did not know which restaurant to try in the old town, so we asked the woman at the bakery. She sent us to a tiny family kitchen, and her ____ turned out to be perfect.', 'recommendation', 'Asking a local person where to eat; "her ____ turned out to be perfect".'),
    p('The tourist office keeps a notebook of comments from earlier visitors. Staff read from it when families ask for a ____ about walks that are suitable for young children.', 'recommendation', 'A notebook of earlier visitors’ comments; "ask for a ____ about walks".')
  ],
  reservation: [
    p('The ski season begins in December, and the best chalets are full by October. Families who want a room near the slopes are advised to make a ____ as early as possible.', 'reservation', 'Chalets full by October; "make a ____ as early as possible".'),
    p('We turned up at the restaurant without telling anyone and asked for a table for eight. The waiter smiled politely and explained that every table had a ____ for the evening.', 'reservation', 'Turning up without telling anyone; "every table had a ____ for the evening".')
  ],
  destination: [
    p('Many airlines now show passengers the weather and a short film about the city they are about to visit. The pilot announced that we would land in ten minutes, and everyone looked out of the window to catch the first glimpse of our ____.', 'destination', 'About to land; "the first glimpse of our ____".'),
    p('The island has no motorways, no factories and only one small village. The brochure describes it as an ideal ____ for walkers, bird-watchers and anyone who wants to escape city life.', 'destination', 'A brochure praising an island for walkers and bird-watchers; "an ideal ____".')
  ],
  availability: [
    p('We wanted to visit Rome in the middle of August, but every site we tried showed a red message saying that there was no ____ for our dates. In the end we moved the trip to September, when plenty of rooms were free.', 'availability', 'A red message and a move to September when rooms were free; "no ____ for our dates".'),
    p('Before booking, the agent opened her computer and checked ____ for the week of the music festival. Only two rooms remained, and she suggested that we decide quickly.', 'availability', 'Only two rooms remained; "checked ____ for the week of the music festival".')
  ],
  facilities: [
    p('The new youth hostel stands beside a lake and is surrounded by pine forests. Although the dormitories are simple, the ____ are excellent, with a large kitchen, a laundry and a games room.', 'facilities', 'A large kitchen, a laundry and a games room; "the ____ are excellent".'),
    p('Disabled visitors need to know in advance whether a park can offer ramps, wide paths and accessible toilets. The website lists all of the ____ and shows them on a simple map.', 'facilities', 'Ramps, wide paths and accessible toilets; "lists all of the ____".')
  ],
  equipment: [
    p('The expedition leader spread everything out on the floor of the hut and counted it twice. Ropes, tents, stoves and radios were all there, so the team felt confident that their ____ was complete.', 'equipment', 'Ropes, tents, stoves and radios; "their ____ was complete".'),
    p('Beginners at the sailing school do not need to buy anything before the first lesson. The school provides life jackets, wetsuits and all the other ____ that students need on the water.', 'equipment', 'Life jackets and wetsuits; "all the other ____ that students need".')
  ],
  location: [
    p('Before buying the old farmhouse, the family walked around the village, talked to the neighbours and checked the bus times. They were delighted with the ____, because the beach, the shops and the school were all within walking distance.', 'location', 'The beach, shops and school within walking distance; "delighted with the ____".'),
    p('The writer of the guidebook visited every restaurant in town. He praised the food at the harbour café, but he thought that its ____ next to a noisy car park spoilt the evening.', 'location', 'Next to a noisy car park; "its ____ next to a noisy car park".')
  ],
  obtain: [
    p('Last summer my sister planned a month of volunteer work in Peru. Before she could leave, she had to ____ a visa, a medical certificate and a letter from the charity, and that took nearly three weeks.', 'obtain', 'A visa, a medical certificate and a letter; "she had to ____ a visa".'),
    p('Every journalist at the festival needed a special pass to enter the main hall. The press office asked reporters to ____ their passes in person on the first morning and to bring a photograph.', 'obtain', 'Passes collected on the first morning; "asked reporters to ____ their passes".')
  ],
  specialise: [
    p('Maya loves mountains, so after finishing school she took a course in outdoor leadership. In her second year she chose to ____ in winter sports, and now she trains ski instructors.', 'specialise', 'Winter sports and training ski instructors; "chose to ____ in winter sports".'),
    p('A large travel company can sell hundreds of different holidays. A small firm cannot compete in this way, so many small firms decide to ____ and become known for one particular kind of trip.', 'specialise', 'Becoming known for one kind of trip; "decide to ____".')
  ],
  qualification: [
    p('Tom wanted to work as a scuba diving instructor on a Greek island. The dive school liked his enthusiasm, but it could only employ him once he had completed the exams and received a professional ____.', 'qualification', 'Completing exams and receiving a professional certificate; "a professional ____".'),
    p('Applicants for the museum guide post are asked to list their education and experience. A degree in history is helpful, but an additional ____ in a foreign language is even more attractive to the employer.', 'qualification', 'A degree and a language certificate; "an additional ____ in a foreign language".')
  ],
  evaluate: [
    p('After the first summer season, the new heritage trail had attracted ten thousand walkers. The council asked a team of researchers to ____ the project by counting visitors, interviewing local shop owners and checking the damage to the path.', 'evaluate', 'Counting visitors and checking damage; "asked researchers to ____ the project".'),
    p('Teachers often ask students to compare two travel websites. The task is not simply to describe them; students have to ____ each one, deciding how clear, accurate and useful it is, and then explain their judgement.', 'evaluate', 'Deciding how clear, accurate and useful; "have to ____ each one".')
  ],
  itinerary: [
    p('Our class trip to London lasted four days. On the first evening, the teacher gave out a printed ____ which listed every museum, meal and train that we would use, so nobody was surprised.', 'itinerary', 'Every museum, meal and train listed; "a printed ____".'),
    p('The travel agent spread a large map across her desk and began to plan a ten-day holiday for a family of four. She marked the route in red pen and then wrote out a day-by-day ____, leaving the final two days empty for rest.', 'itinerary', 'Marking the route and writing it out day by day; "a day-by-day ____".')
  ],
  'safety regulations': [
    p('Before the first white-water rafting trip of the season, the guides met to go through the new rules. Every raft needed enough life jackets, every client had to wear a helmet and all guides had to be trained in rescue, because the national ____ now said so.', 'safety regulations', 'Life jackets, helmets and rescue training; "the national ____ now said so".'),
    p('Many travellers think that a hot-air balloon flight is simply a matter of floating gently over the countryside. In fact, pilots must obey strict ____, including checks on wind speed and regular inspection of the basket.', 'safety regulations', 'Checks on wind speed and inspection of the basket; "must obey strict ____".')
  ],
  excursion: [
    p('During our week in Seville, there were many free afternoons for exploring the old streets. The only organised activity was a full-day ____ to a sherry cellar in the countryside, which included lunch, a tasting and the coach ride home.', 'excursion', 'Lunch, a tasting and the coach ride home; "a full-day ____".'),
    p('The geography teacher wanted her pupils to see a glacier with their own eyes, but a week in the mountains was too expensive. Instead she arranged a one-day ____ to a nearby ice cave, and the pupils were back in school by evening.', 'excursion', 'Back in school by evening; "a one-day ____ to a nearby ice cave".')
  ]
});
