// Unit 8: Work formal check. Same contract as Units 4, 6 and 7: three forms of ten (six passage gaps, two paraphrase, one word-form, one precision).
// Thirty different Unit 8 targets, ten per form. All passages and sentences are new: none comes from a pathway activity.
const mcq = (id, target, type, prompt, choices, answer, diagnostic, explanation) => ({ id, target, type, prompt, choices, answer, diagnostic, explanation });
const typed = (id, target, prompt, answer, diagnostic, explanation) => ({ id, target, type:'word_form', prompt, answer, diagnostic, explanation });

const formA = {
  id:'A',
  title:'Designing a new library',
  passage:`Last year the city council held a competition to design a new public library. The winning team is known for daring [[1]], and its plan has [[2]] walls that make the building look like a wave when it is seen across the river.\n\nThe building is also [[3]]: solar panels provide most of its energy, and rainwater is collected for the gardens. Inside, the [[4]] will include a café, study rooms and a small cinema.\n\nBefore building could start, engineers checked that the new [[5]] would be strong enough to hold the heavy roof. The plan also had to follow strict fire [[6]], so there are six emergency exits.`,
  questions:[
    mcq('A1','u8_01_architecture','passage_mcq','Which word best completes gap 1?',['architecture','employment','humanity','wellbeing'],'architecture','The team designs buildings, and the gap describes the style of their work.','Architecture is the art and work of designing buildings, and also the style of a building.'),
    mcq('A2','u8_05_curved','passage_mcq','Which word best completes gap 2?',['qualified','concerned','curved','relentless'],'curved','Think about the shape of walls that look like a wave.','Curved means having the shape of a smooth bend rather than a straight line.'),
    mcq('A3','u8_36_sustainable','passage_mcq','Which word best completes gap 3?',['traditional','sustainable','complicated','relentless'],'sustainable','The words after the colon explain how the building protects the environment.','Sustainable means able to continue for a long time without harming the environment or using up natural resources.'),
    mcq('A4','u8_10_facilities_8','passage_mcq','Which word best completes gap 4?',['regulations','ingredients','inspectors','facilities'],'facilities','A café, study rooms and a cinema are places that people can use.','Facilities are buildings, rooms, equipment or services provided for a particular purpose.'),
    mcq('A5','u8_35_structures','passage_mcq','Which word best completes gap 5?',['ingredients','regulations','structures','inspectors'],'structures','Engineers check that things that have been built are strong enough.','Structures are things that have been built, such as buildings, bridges and towers.'),
    mcq('A6','u8_27_regulations','passage_mcq','Which word best completes gap 6?',['regulations','facilities','structures','elements'],'regulations','The plan had to follow official fire rules.','Regulations are official rules made by a government or organisation that people must obey.'),
    mcq('A7','u8_37_transformed','paraphrase_mcq','The project has completely changed an unused car park into a lively public square. Which word best replaces completely changed?',['presented','launched','established','transformed'],'transformed','Look for a verb meaning changed something completely, usually for the better.','Transformed means completely changed the appearance, form or character of something, usually improving it.'),
    mcq('A8','u8_11_feature_8','paraphrase_mcq','The most striking part of the design is a garden on the glass roof. Which word best replaces part?',['source','feature','response','minority'],'feature','Think about a noun for a noticeable part or quality of a design.','A feature is a typical or noticeable part or quality of a design, product or place.'),
    typed('A9','u8_15_innovation','Complete the sentence using the correct form of innovation: “The judges praised the team’s ______ use of recycled glass.”','innovative','You need an adjective before “use”.','Innovation is the noun; innovative is the adjective for new and original ideas or methods.'),
    mcq('A10','u8_31_rough','precision_mcq','Which phrase is most natural?',['a rough mistake','a rough promise','a rough estimate','a rough reason'],'a rough estimate','Think about a figure that is not exact.','Rough means not exact or finished; a rough estimate gives a general idea of a number or cost.')
  ]
};

const formB = {
  id:'B',
  title:'Creating a new breakfast bar',
  passage:`A small food company wanted to create a healthy breakfast bar for teenagers. The [[1]] of the bar took eighteen months, because the recipe was tested and improved again and again.\n\nThe company used only natural [[2]], such as oats, dates and seeds. A [[3]] checked every recipe to make sure that it contained enough fibre and not too much sugar. The designers chose recyclable paper [[4]] so that the bar would not add to plastic waste.\n\nThe company finally [[5]] the bar at a food fair in March. A famous athlete ate one on live television, and the [[6]] helped the bar sell out in a week.`,
  questions:[
    mcq('B1','u8_07_development','passage_mcq','Which word best completes gap 1?',['publicity','packaging','employment','development'],'development','The recipe was tested and improved for eighteen months.','Development is the process of creating a new product or idea and improving it over time.'),
    mcq('B2','u8_14_ingredients_8','passage_mcq','Which word best completes gap 2?',['ingredients','regulations','facilities','structures'],'ingredients','Oats, dates and seeds are the foods the bar is made from.','Ingredients are the foods or substances that are combined to make a product, especially a food.'),
    mcq('B3','u8_39_nutritionist','passage_mcq','Which word best completes gap 3?',['operator','instructor','nutritionist','trainer'],'nutritionist','You need a person who checks how healthy food is.','A nutritionist is an expert who advises people about food and healthy eating.'),
    mcq('B4','u8_23_packaging','passage_mcq','Which word best completes gap 4?',['manufacturing','technology','packaging','architecture'],'packaging','The paper is what the bar is wrapped in for sale.','Packaging is the boxes, bottles, paper or plastic in which goods are wrapped for sale.'),
    mcq('B5','u8_19_launched','passage_mcq','Which word best completes gap 5?',['qualified','launched','concerned','transformed'],'launched','The bar was introduced to the public for the first time at the fair.','Launched means started selling a new product or started a new project or activity.'),
    mcq('B6','u8_25_publicity','passage_mcq','Which word best completes gap 6?',['humanity','minority','availability','publicity'],'publicity','The athlete on television brought public attention to the bar.','Publicity is attention from newspapers, television and the internet, or the work of getting this attention.'),
    mcq('B7','u8_03_concerned','paraphrase_mcq','Some parents were worried about the amount of sugar in children’s snacks. Which word best replaces worried?',['qualified','concerned','responsible','creative'],'concerned','Look for an adjective meaning worried about a possible problem.','Concerned means worried about something that might be a problem.'),
    mcq('B8','u8_22_minority','paraphrase_mcq','Just a few of the people in the taste test disliked the bar. Which words best replace just a few?',['a minority','a source','a response','a feature'],'a minority','Think about a noun for fewer than half of a group.','A minority is the smaller part of a group, less than half.'),
    typed('B9','u8_21_manufacturing','Complete the sentence using the correct form of manufacturing: “The bars are made by a ______ in a factory near the coast.”','manufacturer','You need a noun for a company after “a”.','Manufacturing is the business of making goods; a manufacturer is the company that makes them.'),
    mcq('B10','u8_29_response','precision_mcq','Which phrase is most natural?',['in response for','on response to','by response of','in response to'],'in response to','Think about the small words used before and after response when you react to something.','A response is an answer or reaction; in response to means as a reaction to something.')
  ]
};

const formC = {
  id:'C',
  title:'A school careers fair',
  passage:`At the school careers fair, students met people from many different kinds of [[1]]. A hospital nurse explained that she had studied for three years before she was [[2]] to work on a children’s ward.\n\nA lawyer said that she had chosen to [[3]] in family law, so she now helps parents and children in difficult situations. A computer [[4]] showed how she protects company websites from attack; she has twenty years of experience.\n\nThe manager of a hotel told students that she is [[5]] for forty staff and for the comfort of every guest. Finally, a designer from an advertising agency said that the best people in her job are [[6]] and never afraid to try something new.`,
  questions:[
    mcq('C1','u8_45_employment','passage_mcq','Which word best completes gap 1?',['packaging','employment','publicity','wellbeing'],'employment','At a careers fair, people talk about different kinds of paid work.','Employment is the state of having paid work, or the work that people do for money.'),
    mcq('C2','u8_26_qualified','passage_mcq','Which word best completes gap 2?',['qualified','concerned','curved','launched'],'qualified','Three years of study gave her the training she needed for the job.','Qualified means having passed the exams or training needed to do a particular job.'),
    mcq('C3','u8_34_specialise_8','passage_mcq','Which word best completes gap 3?',['resign','retire','complain','specialise'],'specialise','She focuses her work on one area of law.','Specialise means to concentrate your work or study on one particular area and become an expert in it.'),
    mcq('C4','u8_41_expert','passage_mcq','Which word best completes gap 4?',['nutritionist','landscape','expert','minority'],'expert','Twenty years of experience give her a high level of knowledge and skill.','An expert is a person with a high level of knowledge or skill in a particular subject.'),
    mcq('C5','u8_30_responsible_8','passage_mcq','Which word best completes gap 5?',['responsible','curved','rough','traditional'],'responsible','Looking after forty staff and every guest is her duty as manager.','Responsible means having the job or duty of dealing with something or someone at work.'),
    mcq('C6','u8_49_creative','passage_mcq','Which word best completes gap 6?',['traditional','complicated','creative','curved'],'creative','People who are never afraid to try something new are good at original ideas.','Creative means good at thinking of new and original ideas or at making new things.'),
    mcq('C7','u8_50_wellbeing','paraphrase_mcq','The company offers free yoga classes because staff happiness and health matter to the managers. Which word best replaces happiness and health?',['employment','humanity','publicity','wellbeing'],'wellbeing','Look for a noun for feeling healthy, comfortable and happy.','Wellbeing is the state of feeling healthy, comfortable and happy.'),
    mcq('C8','u8_44_assignment','paraphrase_mcq','On her first day, the young reporter was given a task: to interview the mayor. Which word best replaces task?',['impact','assignment','minority','source'],'assignment','Think about a noun for a piece of work given to someone as part of their job.','An assignment is a piece of work or a task that someone is given as part of their job or studies.'),
    typed('C9','u8_47_trainer','Complete the sentence using the correct form of trainer: “As a ______, Leo spends half his week learning at college and half at work.”','trainee','You need a noun for a person who is being trained.','A trainer teaches skills; a trainee is the person who is being trained.'),
    mcq('C10','u8_32_significant_8','precision_mcq','Which phrase is most natural?',['do a significant difference','make a significant difference','take a significant difference','give a significant difference'],'make a significant difference','Think about the verb that goes with difference.','Significant means large or important enough to have a noticeable effect; we make a significant difference.')
  ]
};

export const unit8VocabularyCheck = Object.freeze({
  unitNumber:8,
  title:'Unit Vocabulary Check',
  course:'Cambridge IGCSE ESL 0511',
  maxAttempts:3,
  forms:Object.freeze({ A:formA, B:formB, C:formC })
});

export default unit8VocabularyCheck;
