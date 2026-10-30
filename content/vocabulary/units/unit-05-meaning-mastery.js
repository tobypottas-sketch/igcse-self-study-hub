// Unit 5 · Meaning · Apply and Mastery — authored wrong meanings, WORDS 1–20 ONLY. Same contract as unit-04-meaning-mastery.js:
// two records per word in the order of the word's two Mastery contexts; exactly three authored WRONG glosses, same grammar and similar length
// as the correct gloss, plausible in general, wrong in this sentence.
const w = (wrongMeanings, extra = {}) => ({ wrongMeanings, ...extra });

export default Object.freeze({
  'aerial tourism': [
    w(['holiday packages that include a stay at a luxury hotel', 'sightseeing trips that show places from the sea', 'holidays based on climbing and walking in the hills']),
    w(['journeys made by business travellers who fly every week', 'tours that take visitors underground to see caves', 'holidays in which people travel by train across the island'])
  ],
  'underwater photography': [
    w(['the activity of painting scenes beneath the surface of the water', 'the activity of studying marine animals beneath the surface of the water', 'the activity of searching for treasure beneath the surface of the water']),
    w(['pictures drawn of animals that live in the sea', 'models of sea creatures made from shells and plastic', 'maps showing the routes taken by divers and ships'])
  ],
  documentary: [
    w(['an invented story with famous actors', 'a live broadcast of a sports event', 'a music show with singers and dancers']),
    w(['a comedy that makes viewers laugh', 'a game show with questions and prizes', 'a news report read by a presenter'])
  ],
  snorkelling: [
    w(['sailing across the bay in a small boat', 'swimming to the bottom with heavy air tanks', 'fishing from the beach with a line and hook']),
    w(['riding on the waves to practise balance', 'sailing on the sea to watch the sunset', 'walking along the shore to find shells'])
  ],
  expedition: [
    w(['a short walk taken for exercise and fresh air', 'a holiday booked through a travel company', 'a competition held between two mountain clubs']),
    w(['a lesson taught outdoors in a school garden', 'a meeting of scientists in a university building', 'an exhibition of animals kept in a zoo'])
  ],
  yacht: [
    w(['a small boat used for catching fish', 'a large ship used for carrying goods', 'a long boat used for rescuing people']),
    w(['a ship used by the navy for defence', 'a boat used by workers to cross a river', 'a vessel used for carrying cars and lorries'])
  ],
  scenery: [
    w(['the old buildings of a large city', 'the people who live in a village', 'the animals kept on a farm']),
    w(['the quality of the hotels and restaurants', 'the cost of the equipment and guides', 'the safety of the paths and bridges'])
  ],
  attractions: [
    w(['places where visitors can stay overnight', 'places where visitors can buy food and gifts', 'places where visitors can catch buses and trains']),
    w(['places that people leave because they are noisy or expensive', 'places that people work in because they are busy or well paid', 'places that people study in because they are quiet or large'])
  ],
  accommodation: [
    w(['a meal prepared and served to guests', 'a vehicle that takes guests to the station', 'a ticket that allows guests to travel']),
    w(['restaurants or cafés where you can eat during a visit', 'shops or stalls where you can buy souvenirs during a visit', 'tours or trips on which you can see sights during a visit'])
  ],
  adventurous: [
    w(['unwilling to leave home or try new foods', 'interested in history and old buildings', 'careful to plan every detail of a trip']),
    w(['worried about danger and discomfort', 'proud of their wealth and success', 'good at making friends quickly'])
  ],
  breathtaking: [
    w(['so quiet and empty that nobody visits it', 'so old and fragile that nobody may touch it', 'so cold and wet that nobody enjoys it']),
    w(['so long and tiring that you never forget it', 'so dangerous and risky that you never forget it', 'so expensive and rare that you never forget it'])
  ],
  spectacular: [
    w(['very dangerous to visit, especially because of its depth and speed', 'very popular with visitors, especially because of its size and price', 'very old and famous, especially because of its history and name']),
    w(['frightening and risky to watch, with great danger', 'quiet and relaxing to watch, with soft music', 'cheap and simple to watch, with a small crowd'])
  ],
  dramatic: [
    w(['calm and gentle, with soft colours', 'crowded and noisy, with busy roads', 'neat and tidy, with straight lines']),
    w(['slow and very small', 'steady and very regular', 'rare and very expensive'])
  ],
  stunning: [
    w(['very large and expensive to hire', 'very quiet and private to stay in', 'very old and traditional to see']),
    w(['so shocking that they frighten people', 'so crowded that they stay in the memory', 'so remote that few people ever see them'])
  ],
  popular: [
    w(['known by very few people', 'needed by many people', 'paid for by many people']),
    w(['avoided by large numbers of people', 'owned by large numbers of people', 'visited by nobody except local people'])
  ],
  static: [
    w(['moving slowly from tree to tree', 'pointing in a different direction each hour', 'following animals through the forest']),
    w(['not paid for or counted', 'not ready or available', 'not seen or heard'])
  ],
  'ground-level': [
    w(['seen from a high tower, not from the street', 'seen from a moving boat, not from the pavement', 'seen from a distant hill, not from the market']),
    w(['taken from the top of a tall building', 'taken by a camera carried on an aircraft', 'taken at night with a very bright flash'])
  ],
  'angle of view': [
    w(['the position of the camera above the statue', 'the distance from the camera to the square', 'the speed at which a camera lens can focus']),
    w(['how far away from a scene a lens can focus', 'how quickly a lens can take a picture', 'how many pictures a lens can store'])
  ],
  'ecological habitats': [
    w(['areas of land that farmers use to grow crops', 'buildings where scientists study plants and animals', 'places where tourists can feed wild animals']),
    w(['the food eaten by plants and animals', 'the paths used by walkers and rangers', 'the colours of plants and animals'])
  ],
  'marine world': [
    w(['the ships and harbours that tourists visit by the sea', 'the beaches and cliffs that tourists photograph by the sea', 'the hotels and cafés that tourists use by the sea']),
    w(['the coastline and the towns built along it', 'the boats and equipment that divers use', 'the rules and laws that protect the shore'])
  ]
});
