// Unit 4 · Context · Mastery (type_in_passage) — authored short passages, WORDS 1–30 ONLY. Same contract as unit-03-context-passages.js:
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
  ],
  efficiently: [
    p('The new airport terminal was planned with great care. Staff can now process thousands of passengers ____ even during the busiest summer weekends.', 'efficiently', 'Careful planning; processing thousands "____" even at busy times.'),
    p('Some companies waste a lot of fuel because their lorries travel half empty. Others plan their routes carefully so that their vehicles are always full and run ____.', 'efficiently', 'Full vehicles and careful routes; "run ____" without waste.')
  ],
  demand: [
    p('More and more commuters want to cycle to work. As a result, there is growing ____ for safe cycle lanes in the city centre.', 'demand', '"growing ____ for" safe cycle lanes.'),
    p('The railway company sold out of tickets for Friday evening trains within minutes. Because ____ was so high, the company added three extra services.', 'demand', 'Sold out; "Because ____ was so high".')
  ],
  invention: [
    p('People have travelled by boat for thousands of years. The ____ of the steam engine in the eighteenth century, however, changed ships and trains for ever.', 'invention', 'Something new created; "The ____ of the steam engine".'),
    p('Karl Benz built one of the first petrol-powered cars in 1885. His ____ was so successful that other engineers soon began to copy it.', 'invention', 'Built something new that others copied; "His ____".')
  ],
  machinery: [
    p('The building site was noisy from early morning. Cranes, diggers and other heavy ____ moved tons of earth every hour.', 'machinery', 'Cranes and diggers; "heavy ____" as an uncountable group.'),
    p('Modern ports are very busy. Without powerful ____ to lift the containers, ships would wait for days to be unloaded.', 'machinery', 'Lifting containers; "powerful ____".')
  ],
  advertisement: [
    p('Posters line the walls of the underground station. One bright ____ shows a smiling family and invites travellers to book cheap holidays by train.', 'advertisement', 'Poster inviting travellers to book; "One bright ____".'),
    p('The airline spent millions on a new television ____. In thirty seconds, it tried to convince viewers that flying with them was cheaper and friendlier than any rival.', 'advertisement', 'Thirty-second television message trying to convince viewers.')
  ],
  enormous: [
    p('The new container ship is longer than four football pitches. Its ____ size means that only a few ports in the world can receive it.', 'enormous', 'Longer than four football pitches; "Its ____ size".'),
    p('The storm left an ____ hole in the middle of the motorway. Drivers had to turn back, and repairs took several weeks.', 'enormous', 'Road closed and weeks of repairs; "an ____ hole".')
  ],
  equipment: [
    p('Every aircraft carries life jackets, oxygen masks and a first-aid kit. Engineers inspect all this ____ regularly to make sure it works.', 'equipment', 'List of items; "all this ____" is uncountable.'),
    p('The mountain rescue team arrived with ropes, stretchers and radios. Without the right ____, they could not have reached the injured climbers.', 'equipment', 'Ropes, stretchers, radios; "the right ____".')
  ],
  collision: [
    p('Dense fog covered the motorway on Monday morning. Visibility was so poor that a ____ between three cars delayed traffic for two hours.', 'collision', 'Fog; cars; "a ____ between three cars".'),
    p('Air traffic controllers monitor every aircraft on a radar screen. Their main duty is to keep planes at safe distances from one another so that a ____ never happens.', 'collision', 'Safe distances between planes; "a ____ never happens".')
  ],
  organisation: [
    p('Every year, a road safety ____ visits hundreds of schools. Its volunteers teach children how to cross busy streets safely.', 'organisation', 'Volunteers working together for one purpose.'),
    p('Airlines must follow strict rules. These rules are set by an international ____ whose members come from almost every country.', 'organisation', 'Members from many countries; "an international ____".')
  ],
  participant: [
    p('The city held a car-free day to encourage cleaner travel. Every ____ agreed to leave their car at home and go to work by bus, tram or bicycle.', 'participant', 'Event; "Every ____ agreed".'),
    p('Researchers tested a new road safety app with fifty drivers. Each ____ used the app for a month and then answered questions about their driving.', 'participant', 'Trial with fifty drivers; "Each ____ used the app".')
  ],
  livelihood: [
    p('The new bypass will take traffic away from the village. Local shopkeepers fear that fewer customers will damage their ____.', 'livelihood', 'Shopkeepers and customers; "damage their ____".'),
    p('In many coastal towns, tourism is the only way to earn a living. When storms stopped the ferries for a month, boat owners and guides lost their ____.', 'livelihood', 'Way to earn a living; "lost their ____".')
  ],
  fatality: [
    p('The charity reported that road accidents are a major cause of death among young people in the region. Each ____ on the roads is a tragedy for a family and a community.', 'fatality', 'Road accidents and death; "Each ____ on the roads".'),
    p('The new safety system has transformed the railway. In the last decade there has not been a single ____, although millions of passengers use the trains every day.', 'fatality', 'Safety record; "not been a single ____".')
  ],
  initiative: [
    p('Too many pupils were being driven to school, which caused heavy traffic at the gates. So the head teacher started a walking ____ in which parents and children meet and walk together.', 'initiative', 'A new scheme to solve traffic at the gates.'),
    p('The city had a serious problem with air pollution. In response, the mayor announced a bold new ____ to encourage cycling and public transport.', 'initiative', 'Response to a problem; "a bold new ____".')
  ],
  campaign: [
    p('Too many drivers were using their mobile phones at the wheel. So the government started a television ____ showing how quickly an accident can happen.', 'campaign', 'Government effort to change behaviour; "a television ____".'),
    p('Local cyclists wanted a protected lane on the busy main road. They collected signatures, wrote to the council and held a public meeting as part of their ____.', 'campaign', 'Signatures, letters, meeting; "part of their ____".')
  ],
  pothole: [
    p('After a hard winter, the main road was in terrible condition. Cars bumped from side to side as drivers tried to avoid every ____ in the surface.', 'pothole', 'Damaged surface; drivers avoiding "every ____".'),
    p('A small crack in the tarmac let rainwater seep underneath. When the water froze and thawed, the crack grew until it became a deep ____ that damaged several tyres.', 'pothole', 'Crack grows into a deep hole damaging tyres.')
  ],
  trauma: [
    p('Emergency workers often arrive first at the scene of a serious accident. Afterwards, many of them talk to a counsellor to help them deal with the ____ of what they have seen.', 'trauma', 'Counsellor; "deal with the ____".'),
    p('The school bus accident was frightening, although nobody was seriously hurt. For several weeks, some of the children found it difficult to travel by road because of the ____ they had experienced.', 'trauma', 'Frightening event with lasting emotional effect.')
  ],
  measures: [
    p('Air pollution in the capital reached dangerous levels last winter. As a result, the authorities took urgent ____, including a ban on older diesel cars in the city centre.', 'measures', 'Authorities took urgent ____, with a ban as an example.'),
    p('Too many cyclists were being injured at the roundabout. The council therefore introduced several safety ____: separate cycle lanes, clearer signs and lower speed limits.', 'measures', 'A list of actions; "several safety ____".')
  ],
  estimate: [
    p('Nobody has counted every traveller who passes through the station. However, officials ____ that about ten thousand people use it on a normal weekday.', 'estimate', 'Nobody has counted exactly; "officials ____ that about".'),
    p('Before they start building, engineers must ____ the cost of the project. They compare similar projects and add a safety margin because the final bill is never exactly known.', 'estimate', 'Final bill is not exactly known; compare and add a margin.')
  ],
  regulation: [
    p('Airlines may only carry a limited weight of cargo on each flight. This ____ exists to protect passengers, and companies that ignore it can be fined.', 'regulation', 'Official limit with fines; "This ____ exists".'),
    p('Cyclists in some countries must have a working light on their bike after dark. A police officer can stop anyone who breaks this ____.', 'regulation', 'Officers enforce it; "breaks this ____".')
  ],
  operate: [
    p('Learner pilots begin by practising on a simulator. Only after many hours are they allowed to ____ a real aeroplane with passengers on board.', 'operate', 'Allowed to control a real aeroplane after simulator practice.'),
    p('Tram drivers must complete a training course before they are allowed to ____ the vehicles. They learn how the brakes, doors and signals work.', 'operate', 'Training on brakes, doors, signals; "allowed to ____ the vehicles".')
  ],
  detain: [
    p('Customs officers found forged documents in a lorry at the border. They have the legal power to ____ the driver until the papers have been checked.', 'detain', 'Customs, forged documents; "power to ____ the driver".'),
    p('A passenger acted suspiciously at the airport, so security staff stopped him. Officers may ____ a person for a short time, but they must explain the reason.', 'detain', 'Security staff; "may ____ a person for a short time".')
  ],
  offences: [
    p('Last year, the traffic police gave fines to thousands of drivers. Speeding and using a phone at the wheel were the most common ____.', 'offences', 'Police fines; "the most common ____".'),
    p('The new law raises the penalty for drivers who break the rules. Drink-driving and driving without insurance are now treated as serious ____ in the city.', 'offences', 'Law and penalty; "treated as serious ____".')
  ],
  provisional: [
    p('Teenagers who want to learn to drive must first apply for a ____ licence. They can exchange it for a full licence after they pass the driving test.', 'provisional', 'Learner drivers; "exchange it for a full licence".'),
    p('The railway company has announced an opening date for the new line. The date is only ____, because bad weather has delayed the building work.', 'provisional', 'Opening date may change; "only ____".')
  ],
  enforcement: [
    p('Many drivers ignored the speed limit on the coast road. After the police began stricter ____, the number of accidents fell sharply.', 'enforcement', 'Police, speed limit; "stricter ____".'),
    p('The city has plenty of parking rules, but few drivers obey them. Without proper ____, the rules make little difference.', 'enforcement', 'Rules not obeyed; "Without proper ____".')
  ],
  statistics: [
    p('The transport ministry has published its yearly report. The ____ show that rail passenger numbers rose by eight per cent last year.', 'statistics', 'Report with numbers; "The ____ show".'),
    p('Planners wanted to know where most accidents happen. They studied ____ from the past five years and found three dangerous junctions.', 'statistics', 'Numbers from five years; "studied ____".')
  ],
  safety: [
    p('Every year, thousands of children learn how to cross roads carefully. Teachers say that road ____ lessons are one of the most important parts of the school year.', 'safety', 'Children crossing roads; "road ____ lessons".'),
    p('Before each flight, the crew explain the exits and show how to use the life jackets. The airline says that the ____ of its passengers is always more important than the timetable.', 'safety', 'Exits and life jackets; "the ____ of its passengers".')
  ],
  sustainability: [
    p('Many cities want to reduce traffic and pollution. By building cycle lanes and electric bus routes, they hope to improve the ____ of their transport systems in the long term.', 'sustainability', 'Cycle lanes and electric buses; "improve the ____ of".'),
    p('The shipping company is replacing old diesel engines with cleaner ones. The managers say that ____ is now as important to them as speed and cost.', 'sustainability', 'Cleaner engines; "____ is now as important as speed and cost".')
  ],
  legislation: [
    p('Electric scooters have become popular, but there are few clear rules about where they can be used. Parliament is now discussing new ____ to control them.', 'legislation', 'Parliament; "new ____ to control them".'),
    p('The government wants to cut pollution from lorries. It has promised tougher ____ on exhaust fumes before the end of the year.', 'legislation', 'Government promise; "tougher ____ on exhaust fumes".')
  ],
  introduce: [
    p('Traffic in the city centre has become much worse. The council has decided to ____ a charge for cars that enter the centre during the day.', 'introduce', 'Council decision; "decided to ____ a charge".'),
    p('Passengers often wait a long time to buy paper tickets. From next month, the airline will ____ electronic boarding passes at every airport it serves.', 'introduce', 'From next month; "will ____ electronic boarding passes".')
  ],
  innovative: [
    p('Engineers in the city have designed a bridge that produces its own electricity from passing traffic. The design is so ____ that experts from many countries have visited to study it.', 'innovative', 'Bridge that makes electricity; "so ____ that".'),
    p('The company wanted to solve the problem of crowded trains. Its ____ idea was to use the space under the seats for luggage, which made room for more passengers.', 'innovative', 'New idea under the seats; "Its ____ idea".')
  ]
});
