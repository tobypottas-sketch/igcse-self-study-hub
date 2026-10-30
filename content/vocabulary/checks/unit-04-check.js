// Unit 4: Transport formal check. Same shape and contract as unit-01-check.js (three forms of ten: six passage gaps, two paraphrase, one word-form, one precision).
// Every question carries `target`: the Unit 4 occurrence id of the word it tests. Four words also exist in earlier units; their targets are the Unit 4 occurrences (…_4).
const mcq = (id, target, type, prompt, choices, answer, diagnostic, explanation) => ({ id, target, type, prompt, choices, answer, diagnostic, explanation });
const typed = (id, target, prompt, answer, diagnostic, explanation) => ({ id, target, type:'word_form', prompt, answer, diagnostic, explanation });

const formA = {
  id:'A',
  title:'Crossing the sky by airship',
  passage:`Long before modern aeroplanes, a few wealthy travellers crossed the sky in huge airships. The journey offered [[1]] views of mountains and oceans as the airship drifted slowly across the world. It flew at a low [[2]], so passengers could still see towns and rivers beneath them.\n\nInside, the experience was one of real [[3]]. The airship could [[4]] more than fifty guests, and each one enjoyed a [[5]] cabin with plenty of room to move. Meals were served on silver plates, and the crew made sure everyone arrived rested at their [[6]].`,
  questions:[
    mcq('A1','u4_01_breathtaking','passage_mcq','Which word best completes gap 1?',['toughest','breathtaking','provisional','anxious'],'breathtaking','You need an adjective meaning extremely beautiful or impressive to look at.','Breathtaking describes something so beautiful or impressive that it takes your breath away.'),
    mcq('A2','u4_08_altitude','passage_mcq','Which word best completes gap 2?',['altitude','destination','pollution','campaign'],'altitude','Look for a noun meaning how far above sea level something is.','Altitude is the height of something above sea level.'),
    mcq('A3','u4_07_luxury','passage_mcq','Which word best completes gap 3?',['luxury','reality','livelihood','trauma'],'luxury','Think about a noun for great comfort and expensive surroundings.','Luxury is great comfort and expensive enjoyment.'),
    mcq('A4','u4_06_accommodate','passage_mcq','Which word best completes gap 4?',['accommodate','detain','launch','operate'],'accommodate','You need a verb meaning have enough space for people.','Accommodate means to have enough room for a number of people.'),
    mcq('A5','u4_20_spacious','passage_mcq','Which word best completes gap 5?',['spacious','anxious','provisional','toughest'],'spacious','Look for an adjective describing a cabin with plenty of room.','Spacious describes a place with plenty of room inside it.'),
    mcq('A6','u4_19_destination','passage_mcq','Which word best completes gap 6?',['destination','altitude','invention','enforcement'],'destination','Look for the noun for the place a journey is heading to.','A destination is the place to which someone or something is travelling.'),
    mcq('A7','u4_16_anxious','paraphrase_mcq','Many passengers felt nervous before the first flight. Which word could replace nervous?',['anxious','enormous','spacious','breathtaking'],'anxious','Look for an adjective meaning worried about what might happen.','Anxious means worried or nervous about something that may happen.'),
    mcq('A8','u4_26_enormous','paraphrase_mcq','The hangar where the airship was kept was extremely large. Which word could replace extremely large?',['provisional','anxious','enormous','toughest'],'enormous','Look for an adjective meaning extremely big.','Enormous means extremely large.'),
    typed('A9','u4_18_pollution','Complete the sentence using the correct form of pollute: “Modern aeroplanes burn fuel, and this adds to air ______.”','pollution','You need an uncountable noun, not a verb.','Pollution is the noun for harmful substances that damage the air, water or land.'),
    mcq('A10','u4_17_vehicle','precision_mcq','Which phrase is most natural?',['power vehicle','engine vehicle','motor vehicle','machine vehicle'],'motor vehicle','Think about the word that usually describes a road vehicle with an engine.','Motor vehicle is the natural collocation for a vehicle powered by an engine.')
  ]
};

const formB = {
  id:'B',
  title:'Designing a new aircraft',
  passage:`Every new aircraft is first designed by a skilled [[1]], who draws and calculates every detail. Years ago, the first flying machine was a remarkable [[2]] that surprised the whole world. Today's factories use powerful [[3]] to build aircraft quickly, and workers need specialist [[4]] to test every part safely.\n\nAs air travel became popular, the [[5]] for new aeroplanes grew rapidly. Companies now plan carefully before they [[6]] a new model, because mistakes cost a great deal of money. Test pilots then fly it to check that it works.`,
  questions:[
    mcq('B1','u4_11_engineer','passage_mcq','Which word best completes gap 1?',['pilot','passenger','engineer','participant'],'engineer','Look for the person whose job is to design and build machines.','An engineer is a person trained to design, build or repair machines and structures.'),
    mcq('B2','u4_23_invention','passage_mcq','Which word best completes gap 2?',['collision','invention','pothole','livelihood'],'invention','You need a noun for something new that someone has created for the first time.','An invention is a new device or machine that someone has created.'),
    mcq('B3','u4_24_machinery','passage_mcq','Which word best completes gap 3?',['pollution','legislation','machinery','altitude'],'machinery','You need an uncountable noun for large, powered machines.','Machinery is a group of large machines, or the parts that make them work.'),
    mcq('B4','u4_27_equipment_4','passage_mcq','Which word best completes gap 4?',['trauma','equipment','landscape','statistics'],'equipment','Think about the tools and gear needed to do a job.','Equipment is the set of tools and items needed for a particular job or activity.'),
    mcq('B5','u4_22_demand_4','passage_mcq','Which word best completes gap 5?',['height','safety','reality','demand'],'demand','You need a noun meaning how much people want to buy or use something.','Demand is the amount of something that people want to buy or use.'),
    mcq('B6','u4_14_launch','passage_mcq','Which word best completes gap 6?',['detain','accommodate','launch','estimate'],'launch','Look for a verb meaning put a new product on sale for the first time.','Launch means to introduce a new product to the public for the first time.'),
    mcq('B7','u4_40_operate','paraphrase_mcq','The pilot knows how to use the controls. Which sentence has the closest meaning?',['The pilot knows how to detain the controls.','The pilot knows how to operate the controls.','The pilot knows how to estimate the controls.','The pilot knows how to accommodate the controls.'],'The pilot knows how to operate the controls.','Look for a verb meaning use or control a machine.','Operate means to use or control a machine, so it keeps the original meaning.'),
    mcq('B8','u4_04_toughest','paraphrase_mcq','The engineers faced the hardest test of their careers. Which word could replace hardest?',['spacious','anxious','provisional','toughest'],'toughest','Look for an adjective meaning most difficult.','Toughest means the most difficult or demanding.'),
    typed('B9','u4_28_collision','Complete the sentence using the correct form of collide: “The two vehicles were badly damaged in the ______.”','collision','You need a noun that follows “in the”.','Collision is the noun for an accident in which two vehicles hit each other.'),
    mcq('B10','u4_35_pothole','precision_mcq','Which phrase is most natural?',['tall pothole','high pothole','deep pothole','thin pothole'],'deep pothole','Think about how people describe a hole in a road surface.','Deep pothole is the natural collocation for a hole in the road that goes far down.')
  ]
};

const formC = {
  id:'C',
  title:'A road safety campaign',
  passage:`A city council recently launched a road safety [[1]] to reduce accidents involving young drivers. As part of the plan, it produced a short television [[2]] showing the dangers of speeding. More than two hundred young [[3]] also joined practical workshops where they learned about safe driving.\n\nThe council acted because the number of road [[4]] had risen sharply the previous year. Officials introduced several practical [[5]], including lower speed limits near schools. They also asked the government to pass stricter [[6]] about mobile phone use while driving.`,
  questions:[
    mcq('C1','u4_34_campaign','passage_mcq','Which word best completes gap 1?',['campaign','pothole','altitude','livelihood'],'campaign','Look for a noun meaning a planned series of actions to achieve a goal.','A campaign is a planned series of activities intended to achieve a particular aim.'),
    mcq('C2','u4_25_advertisement_4','passage_mcq','Which word best completes gap 2?',['landscape','destination','advertisement','livelihood'],'advertisement','You need a noun for a short public message shown on television.','An advertisement is a public message that promotes a product, service or idea.'),
    mcq('C3','u4_30_participant_4','passage_mcq','Which word best completes gap 3?',['pilots','airships','participants','potholes'],'participants','You need a plural noun for people who take part in an activity.','Participants are the people who take part in an activity or event.'),
    mcq('C4','u4_32_fatality','passage_mcq','Which word best completes gap 4?',['landscapes','altitudes','destinations','fatalities'],'fatalities','Think about a plural noun for deaths caused by accidents.','A fatality is a death caused by an accident or violence.'),
    mcq('C5','u4_37_measures','passage_mcq','Which word best completes gap 5?',['landscapes','altitudes','measures','participants'],'measures','You need a plural noun for actions taken to deal with a problem.','Measures are actions taken to achieve a particular result or deal with a problem.'),
    mcq('C6','u4_48_legislation','passage_mcq','Which word best completes gap 6?',['pollution','trauma','legislation','livelihood'],'legislation','Look for an uncountable noun for laws made by a government.','Legislation is the set of laws made by a government.'),
    mcq('C7','u4_41_detain','paraphrase_mcq','The police held the driver for questioning. Which sentence has the closest meaning?',['The police accommodated the driver for questioning.','The police detained the driver for questioning.','The police estimated the driver for questioning.','The police launched the driver for questioning.'],'The police detained the driver for questioning.','Look for a verb meaning officially keep someone in a place.','Detain means to officially keep someone in a place, so it preserves the original meaning.'),
    mcq('C8','u4_43_provisional','paraphrase_mcq','New drivers first receive a temporary licence. Which word could replace temporary?',['innovative','spacious','breathtaking','provisional'],'provisional','Look for an adjective meaning arranged for now and likely to change.','Provisional describes something that is temporary until a permanent arrangement is made.'),
    typed('C9','u4_46_safety','Complete the sentence using the correct form of safe: “Wearing a seat belt greatly improves road ______.”','safety','You need a noun, not an adjective.','Safety is the noun for being protected from danger or harm.'),
    mcq('C10','u4_45_statistics','precision_mcq','Which phrase is most natural?',['strong statistics','deep statistics','heavy statistics','official statistics'],'official statistics','Think about the adjective used for figures published by a government body.','Official statistics is the natural collocation for numbers published by a government or authority.')
  ]
};

export const unit4VocabularyCheck = Object.freeze({
  unitNumber:4,
  title:'Unit Vocabulary Check',
  course:'Cambridge IGCSE ESL 0511',
  maxAttempts:3,
  forms:Object.freeze({ A:formA, B:formB, C:formC })
});

export default unit4VocabularyCheck;
