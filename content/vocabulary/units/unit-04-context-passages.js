// Unit 4 · Context · Mastery (type_in_passage) — authored short passages, WORDS 1–10 ONLY. Same contract as unit-03-context-passages.js:
// two passages per word, each 2-3 natural sentences with exactly ONE gap (`____`); the passage never contains the target elsewhere, never starts
// with the gap, and makes the target the natural fit. `answer` is the exact surface form typed. `why` records what points to the word.
const p = (text, answer, why) => ({ text, answer, why });

export default Object.freeze({
  breathtaking: [
    p('The mountain railway climbs slowly above the clouds. From the carriage window, travellers see a ____ view of snowy peaks and deep green valleys.', 'breathtaking', 'Mountain railway; "a ____ view of snowy peaks".'),
    p('We reached the top of the pass just as the sun was rising. The scene was so ____ that nobody in the car spoke for several minutes.', 'breathtaking', '"so ____ that nobody spoke"; sunrise scenery.')
  ],
  comfort: [
    p('The airline has fitted its long-haul planes with wider seats and more legroom. As a result, people can now travel in ____ even on a twelve-hour flight.', 'comfort', '"travel in ____" with wider seats and legroom.'),
    p('Choosing a new family car was not easy. My mother wanted soft seats and plenty of space for her legs, because she spends hours on the road every day. For her, ____ was more important than speed.', 'comfort', 'Soft seats and space for legs; "____ was more important than speed".')
  ],
  reality: [
    p('The holiday brochure showed an empty beach and a quiet hotel. The ____ was very different: the beach was packed and the hotel stood beside a busy motorway.', 'reality', 'Brochure versus what is found; "The ____ was very different".'),
    p('Many children dream of becoming airline pilots and travelling the world. In ____, the job involves long hours, strict rules and time away from family.', 'reality', 'Dream contrasted with "In ____".')
  ],
  toughest: [
    p('The race crosses three countries in five days. For most riders, the ____ stage is the last one, which climbs steeply for sixty kilometres.', 'toughest', 'Steep sixty-kilometre climb; "the ____ stage".'),
    p('Building the railway through the mountains was extremely difficult. Engineers agree that the ____ challenge was digging a tunnel through solid rock.', 'toughest', 'Extremely difficult; "the ____ challenge".')
  ],
  storeys: [
    p('The new airport hotel is very tall. With forty ____, it can be seen from the runway several kilometres away.', 'storeys', 'Tall building; "With forty ____".'),
    p('The old railway station is only two ____ high. Next to it, the new office tower rises above the whole city.', 'storeys', '"two ____ high" contrasted with a tower.')
  ],
  accommodate: [
    p('The new ferry is enormous. It can ____ two hundred cars, five coaches and about one thousand passengers.', 'accommodate', 'Capacity figures; "can ____ two hundred cars".'),
    p('The old bus station was far too small for the growing city. Last year the council rebuilt it with extra platforms to ____ the additional buses.', 'accommodate', 'Too small, so extra platforms "to ____ the additional buses".')
  ],
  luxury: [
    p('The cruise ship has five restaurants, a theatre and private balconies. Guests who pay for the top cabins live in ____ for the whole voyage.', 'luxury', 'Restaurants, theatre, balconies; "live in ____".'),
    p('Most of the families in our village cannot afford foreign holidays. For them, a week at the seaside is a ____ that they enjoy once a year.', 'luxury', 'Cannot afford; "a ____ that they enjoy once a year".')
  ],
  altitude: [
    p('The aeroplane left the runway and climbed steadily. After twenty minutes, the pilot announced that we had reached a cruising ____ of eleven thousand metres.', 'altitude', 'Plane climbing; "cruising ____ of eleven thousand metres".'),
    p('Many climbers feel dizzy and tired high in the mountains. This happens because the air is thinner at great ____, so there is less oxygen to breathe.', 'altitude', 'Thinner air high in the mountains; "at great ____".')
  ],
  landscape: [
    p('The road runs for two hundred kilometres through the north of the country. Drivers pass lakes, hills and farms, and the ____ changes every few minutes.', 'landscape', 'Lakes, hills and farms; "the ____ changes".'),
    p('Wind turbines now stand on many of the hills near the coast. Some residents think they spoil the ____, while others believe they are a good source of clean energy.', 'landscape', 'Turbines on hills; "spoil the ____".')
  ],
  passenger: [
    p('The bus driver stopped beside the school gate. A young ____ climbed on, showed her pass and found a seat near the window.', 'passenger', 'Climbed on, showed a pass, found a seat.'),
    p('The flight attendant checked that every ____ had fastened a seat belt. Then the aeroplane began to move slowly towards the runway.', 'passenger', 'Flight attendant; "every ____ had fastened a seat belt".')
  ]
});
