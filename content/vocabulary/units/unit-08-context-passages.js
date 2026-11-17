// Unit 8 · Context · Mastery (type_in_passage) — authored short passages, WORDS 1–50 (complete). Same contract as unit-07-context-passages.js:
// two passages per word, each 2-3 natural sentences with exactly ONE gap (`____`); the passage never contains the target elsewhere, never starts
// with the gap, and makes the target the natural fit. `answer` is the exact surface form typed. `why` records what points to the word.
const p = (text, answer, why) => ({ text, answer, why });

export default Object.freeze({
  architecture: [
    p('Kemal spent his childhood drawing bridges, towers and houses. At university he chose to study ____, and now he designs schools for a living.', 'architecture', 'Drew buildings as a child; now designs schools; a subject "to study".'),
    p('Tourists travel from all over the world to see the city’s ____. Its old palaces, glass towers and curved bridges are photographed every day.', 'architecture', 'Palaces, towers and bridges admired for their style and design.')
  ],
  availability: [
    p('The restaurant wanted to serve fresh fish every day. However, the ____ of fish depends on the weather, because the boats cannot go out in storms.', 'availability', 'Whether fish can be obtained depends on the boats going out.'),
    p('Before you choose a material for your design, check its ____. There is no point designing a chair in a wood that nobody can buy.', 'availability', 'Check whether the material can be bought before designing with it.')
  ],
  concerned: [
    p('The doctor read the test results twice and frowned. She was ____ that the patient’s heart was beating too fast, so she asked for more tests.', 'concerned', 'Frowned at the results and asked for more tests: worried.'),
    p('Several neighbours wrote to the council. They were ____ about the noise and dust that the new factory would bring to the area.', 'concerned', 'Wrote to complain about noise and dust that might come.')
  ],
  complicated: [
    p('Most people need a lesson before they can use the new software. It has dozens of menus and settings, and the instructions are long and ____.', 'complicated', 'Dozens of menus and settings; people need a lesson first.'),
    p('Planning the wedding was more ____ than Sam expected. There were hundreds of guests, three different places to book and a menu that had to suit everyone.', 'complicated', 'Many guests, places and needs to organise at once.')
  ],
  curved: [
    p('The new chairs in the café are very comfortable. Their backs are ____, so they follow the shape of your spine when you lean back.', 'curved', 'Backs that follow the shape of the spine.'),
    p('From above, the bridge looks like a rainbow. Its ____ shape rises gently from one bank of the river and comes down on the other.', 'curved', 'Looks like a rainbow; rises gently and comes down.')
  ],
  detailed: [
    p('The insurance company needs more than a short note. Please send a ____ report that lists every item that was damaged and how much it cost.', 'detailed', 'More than a short note; lists every item and cost.'),
    p('Before the builders began, the architect gave them ____ drawings. They showed the exact size of every room, window and door.', 'detailed', 'Drawings showing the exact size of every part.')
  ],
  development: [
    p('The team spent two years testing and improving their electric bike. Now that its ____ is complete, it will go on sale in the spring.', 'development', 'Two years of testing and improving before it goes on sale.'),
    p('Creating a new medicine is slow and expensive. Its ____ often takes more than ten years of research and testing.', 'development', 'Ten years of research and testing to create the medicine.')
  ],
  elements: [
    p('A healthy meal usually has three ____: some protein, some vegetables and some grains. If one is missing, the meal is less balanced.', 'elements', 'Three parts listed that make up a meal.'),
    p('The designer explained her poster to the class. She pointed to each of its ____ in turn: the photograph, the title and the bold red border.', 'elements', 'Each part of the poster pointed to in turn.')
  ],
  established: [
    p('The shoe shop on the high street has been run by the same family since 1890. It is one of the most ____ businesses in the town, and everyone knows its name.', 'established', 'Run by one family since 1890; everyone knows its name.'),
    p('Young writers often find it hard to get their books published. Publishers prefer ____ authors, who already have thousands of loyal readers.', 'established', 'Contrast with young writers; authors who already have many readers.')
  ],
  facilities: [
    p('The new leisure centre is very popular. Its ____ include a swimming pool, a climbing wall and a café, and they are open until ten at night.', 'facilities', 'A pool, a climbing wall and a café that people can use.'),
    p('Before choosing a university, Amira visited the campus. She wanted to see the library, the laboratories and the other ____ that students could use.', 'facilities', 'Library, laboratories and other places students can use.')
  ],
  feature: [
    p('The new phone looks just like the old model. Its most useful new ____, however, is a camera that works well in the dark.', 'feature', 'A new part of the phone that stands out: the camera.'),
    p('Visitors always notice the huge glass staircase in the hotel lobby. It is the building’s most famous ____, and it appears on all the postcards.', 'feature', 'The part of the building everyone notices.')
  ],
  humanity: [
    p('Some inventions change life for everyone on the planet. The internet, for example, has changed the way that the whole of ____ communicates and learns.', 'humanity', 'Everyone on the planet; "the whole of ____".'),
    p('The space agency sent a golden record into space. It carried music and greetings from ____, in case anyone out there ever finds it.', 'humanity', 'Greetings from all the people on Earth.')
  ],
  impact: [
    p('When the new motorway opened, the small shops in the village lost most of their customers. The road had a serious ____ on local businesses.', 'impact', 'Shops lost customers because of the road: a strong effect.'),
    p('Our science teacher was so enthusiastic that half the class chose to study science at university. She had a huge ____ on our lives.', 'impact', 'Half the class changed their plans because of her.')
  ],
  ingredients: [
    p('The new energy bar contains only five ____: dates, oats, nuts, honey and a little salt. There are no artificial colours or flavours.', 'ingredients', 'Five foods listed that the bar is made from.'),
    p('Lucy is allergic to nuts, so she always reads the back of the packet. She checks the list of ____ before she buys any snack.', 'ingredients', 'Checks what the snack contains because of an allergy.')
  ],
  innovation: [
    p('Twenty years ago, nobody paid for coffee with a phone. Contactless payment was a clever ____ that is now part of everyday life.', 'innovation', 'Something new that did not exist twenty years ago.'),
    p('The company used to make the same toys every year. The new director wanted more ____, so she asked the designers to bring her fresh ideas every month.', 'innovation', 'Contrast with the same toys; wanted fresh ideas.')
  ],
  inspiration: [
    p('Before writing her first song, Ana spent weeks walking by the sea. The sound of the waves gave her the ____ she needed, and the song was finished in a day.', 'inspiration', 'The waves gave her the idea for the song.'),
    p('Many people admire the doctor who started the free clinic. She is an ____ to young people who want to help others.', 'inspiration', 'A person others admire and want to follow.')
  ],
  inspectors: [
    p('The owner of the café cleaned the kitchen all night. She knew that the ____ were coming the next morning to check whether it met the rules on hygiene.', 'inspectors', 'Officials coming to check the hygiene rules.'),
    p('Two officials arrived at the building site with clipboards. The ____ looked at every ladder and scaffold and wrote down anything that was unsafe.', 'inspectors', 'Officials checking for anything unsafe.')
  ],
  instructor: [
    p('Before Nadia could take her test, she needed twenty driving lessons. Her ____ sat beside her and told her when to brake and when to turn.', 'instructor', 'Driving lessons; the person beside her telling her what to do.'),
    p('The climbing centre will not let beginners on the wall alone. An ____ checks their ropes and teaches them how to hold on safely.', 'instructor', 'Teaches beginners a practical skill.')
  ],
  launched: [
    p('For two years, the designers worked on the new trainers in secret. Finally, the company ____ them at a huge event, and they sold out in a week.', 'launched', 'After secret work, the product was shown and sold.'),
    p('The town council was worried about litter on the beach. Last summer it ____ a campaign to get visitors to take their rubbish home.', 'launched', 'Started a new campaign.')
  ],
  landscape: [
    p('From the top of the hill, you can see fields, forests and a long silver river. The ____ is so beautiful that artists come here to paint it.', 'landscape', 'Fields, forests and a river seen from the hill.'),
    p('The architect did not want her new hotel to spoil the view. She used stone and wood so that the building would blend into the surrounding ____.', 'landscape', 'Blend into the land and scenery around the hotel.')
  ],
  manufacturing: [
    p('The old factories in the city now stand empty. Fifty years ago, ____ employed half the town, but most products are now made abroad.', 'manufacturing', 'Empty factories; products now made abroad.'),
    p('The phone was designed in California. Its ____ takes place in huge factories in Asia, where thousands of workers put the parts together.', 'manufacturing', 'Huge factories where workers put the parts together.')
  ],
  minority: [
    p('Most people in the survey were happy with their jobs. Only a small ____, about one in ten, said they wanted to change careers.', 'minority', 'About one in ten, contrasted with most people.'),
    p('In the 1960s, very few women worked as engineers. They were a tiny ____ of the workforce, and many faced unfair treatment.', 'minority', 'Very few women; a tiny part of the workforce.')
  ],
  packaging: [
    p('The new phone came in a large box, with plastic bags, foam and cardboard inside. All that ____ went straight into the bin.', 'packaging', 'Box, bags, foam and cardboard around the phone.'),
    p('Many shoppers now avoid products wrapped in plastic. As a result, the company redesigned its ____ and now uses only paper and card.', 'packaging', 'What products are wrapped in, now paper and card.')
  ],
  presented: [
    p('Before the meeting, Kim prepared twenty slides and practised her talk. Then she stood up and ____ her ideas to the managers, who asked many questions.', 'presented', 'Slides, a talk, standing up in front of managers.'),
    p('At the science fair, every student stood beside a poster. One by one, they ____ their experiments to the judges and answered their questions.', 'presented', 'Explained experiments to judges, one by one.')
  ],
  publicity: [
    p('Nobody had heard of the small café until a famous food blogger wrote about it. The ____ brought hundreds of new customers the following week.', 'publicity', 'A famous blogger wrote about it, so many people heard of it.'),
    p('Before the new film came out, the actors appeared on chat shows and posted videos online. The studio spent millions on ____ to make sure everyone knew about it.', 'publicity', 'Chat shows and videos so everyone knew about the film.')
  ],
  qualified: [
    p('Mehmet finished his nursing course and passed all his exams last month. He is now a ____ nurse and has started work at the city hospital.', 'qualified', 'Finished the course and passed the exams.'),
    p('Do not let just anyone touch the gas boiler. Only an engineer who is ____ and holds the right certificate can repair it safely.', 'qualified', 'Holds the right certificate; officially trained.')
  ],
  regulations: [
    p('The government is worried about accidents on building sites. Under the new ____, every worker must wear a helmet and have safety training.', 'regulations', 'The government makes workers wear helmets: official rules.'),
    p('The restaurant was closed for a week. Inspectors found that it had broken several hygiene ____, including keeping raw meat next to cooked food.', 'regulations', 'Inspectors found official hygiene rules had been broken.')
  ],
  relentless: [
    p('The storm lasted for three days. The wind and rain were ____, and the workers could not go back to the building site until it finally stopped.', 'relentless', 'Three days without stopping.'),
    p('Before the opening of the new hotel, the staff worked fourteen hours a day for a month. The pressure was ____, and several people became ill.', 'relentless', 'Fourteen hours a day for a month; no break.')
  ],
  response: [
    p('Tom emailed three companies about work experience. He received a ____ from only one of them, but it offered him a place for two weeks.', 'response', 'Emailed three companies; only one wrote back.'),
    p('The company asked customers what they thought of its new menu. The ____ was very positive, so the new dishes will stay.', 'response', 'What customers said after being asked.')
  ],
  responsible: [
    p('In the hotel, Ms Kahn deals with every complaint and organises the cleaning staff. She is ____ for making sure that guests are happy.', 'responsible', 'Deals with complaints and organises staff: her duty.'),
    p('If a machine breaks, the engineers must fix it quickly. They are ____ for keeping the production line running all night.', 'responsible', 'Must fix machines; their job.')
  ],
  rough: [
    p('The builder looked quickly at the kitchen and said the work would cost about two thousand pounds. He explained that it was only a ____ estimate and that the final price might be different.', 'rough', 'Looked quickly; "about"; the final price might differ.'),
    p('Before she wrote the report, Lina scribbled a ____ plan on a piece of paper. It had arrows and a few key words, but no full sentences.', 'rough', 'Scribbled with arrows and key words; not finished.')
  ],
  significant: [
    p('Before the new road was built, the café served about fifty customers a day. Now it serves over two hundred. The road has made a ____ difference to the business.', 'significant', 'From fifty to over two hundred customers: a big difference.'),
    p('Last year, the factory used forty per cent less water than the year before. This is a ____ achievement, and other factories want to copy its methods.', 'significant', 'Forty per cent less; others want to copy it.')
  ],
  source: [
    p('Most families in the valley grow coffee. Selling the beans is their main ____ of income, so a bad harvest is a disaster.', 'source', 'Where their money comes from.'),
    p('The river begins as a small stream high in the mountains. Engineers walked for two days to find its ____.', 'source', 'Where the river begins.')
  ],
  specialise: [
    p('Lina enjoyed every part of her law degree, but employment cases interested her most. After graduating, she decided to ____ in that area, and now she advises workers about their rights.', 'specialise', 'One area interested her most; now she works only in it.'),
    p('The small bakery used to make everything from pizzas to wedding cakes. Now it has chosen to ____ in bread, and its sourdough is famous across the city.', 'specialise', 'From everything to just bread.')
  ],
  structures: [
    p('The city is famous for its bridges and towers. Some of these ____ are over five hundred years old, and engineers check them every year.', 'structures', 'Bridges and towers: things that have been built.'),
    p('Before the festival, workers put up tents, stages and lighting towers in the park. All these temporary ____ were taken down after three days.', 'structures', 'Tents, stages and towers put up and taken down.')
  ],
  sustainable: [
    p('The new office has solar panels on the roof and collects rainwater for the toilets. The architect wanted it to be as ____ as possible, so it uses very little energy.', 'sustainable', 'Solar panels and rainwater; very little energy.'),
    p('For every tree the company cuts down, it plants three new ones. This makes its furniture ____, because the forests will never disappear.', 'sustainable', 'Replanting means the forests will never disappear.')
  ],
  transformed: [
    p('Five years ago, the riverside was full of empty factories and rubbish. A huge project has ____ it into a park with cafés, walking paths and an open-air theatre.', 'transformed', 'From empty factories and rubbish to a park.'),
    p('When Ms Patel took over the failing restaurant, it had almost no customers. She ____ the menu, the decoration and the service, and now people queue to get in.', 'transformed', 'From no customers to queues: a complete change.')
  ],
  operator: [
    p('The new printing machine is huge and dangerous. Only a trained ____ is allowed to switch it on and control its speed.', 'operator', 'The trained person who switches it on and controls it.'),
    p('The crane is taller than the office block next to it. High above the building site, the ____ sits in a small cabin at the top, moving the steel beams into place.', 'operator', 'The person controlling the crane from its cabin.')
  ],
  nutritionist: [
    p('Before the marathon, Leo wanted to eat the right food. His ____ told him to eat more pasta and drink more water in the days before the race.', 'nutritionist', 'Advice about what to eat before a race.'),
    p('The company wanted its new cereal to be as healthy as possible. It hired a ____ to check the amount of sugar, salt and fibre in every recipe.', 'nutritionist', 'Checking how healthy the recipes are.')
  ],
  director: [
    p('Ms Obi started at the company as a secretary thirty years ago. Today she runs the whole business as its managing ____.', 'director', 'She runs the whole business.'),
    p('Every department in the company has its own head. The marketing ____ meets the other heads every Monday to discuss the week’s plans.', 'director', 'The head of the marketing department.')
  ],
  expert: [
    p('Nobody in the office could work out why the computers kept crashing. In the end, the manager called an ____ who had fixed similar problems for twenty years.', 'expert', 'Twenty years of fixing similar problems: great skill.'),
    p('The old vase was found in a farmhouse. An ____ from the museum examined it carefully and said it was over two thousand years old.', 'expert', 'Someone from the museum with special knowledge of old objects.')
  ],
  engineer: [
    p('The new bridge has to carry thousands of cars a day and survive strong winds. An ____ spent two years calculating exactly how strong each part must be.', 'engineer', 'Calculating how strong each part of the bridge must be.'),
    p('When the factory’s main machine broke down, production stopped completely. The company called an ____, who found the fault and repaired it by lunchtime.', 'engineer', 'Found the fault and repaired the machine.')
  ],
  scientist: [
    p('In the laboratory, a young ____ mixed two chemicals and watched carefully. She wrote down every change in colour and temperature.', 'scientist', 'Laboratory, chemicals and careful notes: an experiment.'),
    p('For years, people did not know why the bees were dying. Then a ____ at the university carried out experiments and discovered that a chemical used on farms was to blame.', 'scientist', 'Carried out experiments and made a discovery.')
  ],
  assignment: [
    p('The teacher gave the class two weeks to write an essay about a job they would like. Ravi finished his ____ early and handed it in on Monday.', 'assignment', 'The essay the teacher set; handed in.'),
    p('The newspaper sent its best reporter to cover the election. It was her most difficult ____ so far, but she sent back an excellent story.', 'assignment', 'The task the newspaper gave her.')
  ],
  employment: [
    p('When the car factory closed, many workers spent months looking for new jobs. Some found ____ in the new supermarket, but others had to move to the city.', 'employment', 'Looking for new jobs; some found work.'),
    p('The town council wants young people to stay in the area. It is offering money to companies that create ____ for school leavers.', 'employment', 'Companies creating jobs for school leavers.')
  ],
  traditional: [
    p('In the small factory, every rug is still woven by hand, exactly as it was two hundred years ago. The owners say that these ____ methods give the rugs their special quality.', 'traditional', 'Woven by hand exactly as two hundred years ago.'),
    p('At the wedding, the guests danced the same dances and ate the same food as their grandparents had. Everything about the celebration was ____.', 'traditional', 'The same as their grandparents did.')
  ],
  trainer: [
    p('Every new employee at the hotel spends three days on a course. A ____ shows them how to welcome guests, answer the phone and deal with complaints.', 'trainer', 'Teaches new staff the skills of the job.'),
    p('Sam wanted to get fit before the summer, so he joined a gym. His ____ planned his exercises and pushed him to work harder each week.', 'trainer', 'Planned exercises and pushed him to improve.')
  ],
  technology: [
    p('Twenty years ago, the factory needed two hundred workers. Now robots and computers do most of the jobs, and new ____ is added every year.', 'technology', 'Robots and computers doing the jobs.'),
    p('In the past, students had to visit a library to find information. Today, thanks to ____, they can search millions of books on a phone in seconds.', 'technology', 'Phones that search millions of books in seconds.')
  ],
  creative: [
    p('Most people use plastic bottles once and throw them away. Ayo, however, turned hundreds of them into a colourful garden wall. She is one of the most ____ people I know.', 'creative', 'Turned old bottles into a garden wall: an original idea.'),
    p('The advertising company does not want staff who simply copy what others have done. It is looking for ____ designers who can think of ideas nobody has seen before.', 'creative', 'Ideas nobody has seen before; not copying.')
  ],
  wellbeing: [
    p('The company noticed that many workers were stressed and often ill. It introduced shorter hours, free fruit and a quiet room to improve their ____.', 'wellbeing', 'Workers stressed and ill; changes to make them feel better.'),
    p('Doctors say that sleep, exercise and time with friends all affect our ____. Without them, we feel tired, unhappy and unwell.', 'wellbeing', 'Without them we feel tired, unhappy and unwell.')
  ]
});
