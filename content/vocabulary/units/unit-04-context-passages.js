// Unit 4 · Context · Mastery (type_in_passage) — authored short passages, WORDS 1–20 ONLY. Same contract as unit-03-context-passages.js:
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
  ],
  engineer: [
    p('The new tunnel was designed with great care. The ____ who planned it spent six years studying how the rock would behave under the river.', 'engineer', 'Designing and planning a tunnel; "The ____ who planned it".'),
    p('Before every flight, a team checks the aircraft carefully. One ____ inspects the wings, while another tests the electrical system.', 'engineer', 'Technical checks on an aircraft; "One ____ inspects the wings".')
  ],
  pilot: [
    p('The aeroplane began its descent through thick cloud. The ____ calmly spoke to the control tower and prepared to land.', 'pilot', 'Descent and landing; speaks to the control tower.'),
    p('Learning to fly takes years of training and hundreds of hours in the air. Only then can a trainee become a qualified ____ and take passengers on commercial flights.', 'pilot', 'Learning to fly; "qualified ____" on commercial flights.')
  ],
  airship: [
    p('Early in the twentieth century, passengers could cross the Atlantic in a huge ____ filled with gas. It moved slowly, but it was quiet and offered a smooth ride.', 'airship', 'Gas-filled craft crossing the Atlantic slowly.'),
    p('A hot-air balloon goes wherever the wind carries it. A powered ____, however, has engines and propellers, so the crew can steer it where they want.', 'airship', 'Contrast with a balloon; engines and propellers; steered.')
  ],
  launch: [
    p('The space agency has prepared the rocket for months. If the weather stays calm, it will ____ the satellite from the coast on Friday morning.', 'launch', 'Rocket and satellite; "will ____ the satellite".'),
    p('Sales of electric cars have grown quickly in recent years. Several manufacturers plan to ____ new models next year.', 'launch', 'Manufacturers plan to bring out new models.')
  ],
  height: [
    p('The lorry driver stopped suddenly before the tunnel. A sign warned that the maximum ____ of vehicles was four metres, and his lorry was taller.', 'height', 'Sign; lorry "was taller"; "maximum ____".'),
    p('The new bridge is extremely impressive. Its ____ is more than two hundred metres, so even the tallest ships can pass underneath.', 'height', 'Tall ships pass underneath; "Its ____ is more than two hundred metres".')
  ],
  anxious: [
    p('Tom had never travelled by air before. As the aeroplane began to shake in the strong wind, he gripped his seat and felt extremely ____.', 'anxious', 'First flight; shaking aeroplane; gripping the seat.'),
    p('The train was already forty minutes late. Everyone on the platform became ____ about missing their connections, and a queue formed at the information desk.', 'anxious', 'Delay; worry about missing connections.')
  ],
  vehicle: [
    p('The city has banned traffic from the old town. Only an electric ____ with a special permit may enter, and it must travel slowly.', 'vehicle', 'Traffic ban; "electric ____ with a special permit".'),
    p('The police officer waved the driver to the side of the road. The ____ had no lights, and its tyres were worn smooth.', 'vehicle', 'Driver, lights and tyres all point to a road vehicle.')
  ],
  pollution: [
    p('Thousands of cars drive into the city every morning. As a result, the ____ from exhaust fumes makes the air dirty and unpleasant to breathe.', 'pollution', 'Cars, exhaust fumes, dirty air; "the ____ from exhaust fumes".'),
    p('The factory dumped its waste into the river for years. Fish disappeared, and local people complained about the ____ that had turned the water brown.', 'pollution', 'Dumped waste, brown water; "the ____ that had turned the water brown".')
  ],
  destination: [
    p('We left London at dawn and drove north for most of the day. When we finally reached our ____, a quiet village beside a lake, the sun was already setting.', 'destination', 'Long drive; "reached our ____".'),
    p('The station was busy and several trains were waiting at the platforms. Every train shows its final ____ on the front, so passengers can check they are boarding the right one.', 'destination', 'Shown on the front of a train; checking the right one.')
  ],
  spacious: [
    p('The old bus was cramped and uncomfortable. By contrast, the new coach is wonderfully ____, with wide seats and plenty of room for luggage.', 'spacious', 'Contrast with cramped; wide seats and room.'),
    p('The family needed a bigger car for their holiday. They chose a ____ estate car because it could hold four people, two dogs and all their suitcases.', 'spacious', 'Holds four people, two dogs and suitcases.')
  ]

});
