const mcq = (id, type, prompt, choices, answer, diagnostic, explanation) => ({ id, type, prompt, choices, answer, diagnostic, explanation });
const typed = (id, prompt, answer, diagnostic, explanation) => ({ id, type:'word_form', prompt, answer, diagnostic, explanation });

const formA = {
  id:'A',
  title:'Trying a new sport',
  passage:`When Maya joined the school climbing club, almost everything felt [[1]]. She had never used a harness before and did not understand many of the safety instructions. During her first few sessions, she began to [[2]] with some of the more difficult movements. Her coach told her that learning a new physical skill required [[3]], because improvement would not happen immediately.\n\nMaya was still [[4]] to improve. She practised regularly and gradually became more confident. Her biggest [[5]] was completing a difficult indoor route without asking for help. When she finally reached the top, she felt an enormous sense of [[6]]. She realised that success was not only about natural ability, but also about continuing when something was difficult.`,
  questions:[
    mcq('A1','passage_mcq','Which word best completes gap 1?',['elite','unfamiliar','estimated','monetary'],'unfamiliar','Look for an adjective meaning not known because it is new to you.','Unfamiliar means not known or recognised because you have not experienced it before.'),
    mcq('A2','passage_mcq','Which word best completes gap 2?',['struggle','permit','arrange','recommend'],'struggle','You need a verb meaning have difficulty doing something.','Struggle means to have difficulty doing or achieving something.'),
    mcq('A3','passage_mcq','Which word best completes gap 3?',['preference','atmosphere','patience','solution'],'patience','Think about the quality needed when improvement takes time.','Patience is the ability to remain calm while waiting or dealing with difficulty.'),
    mcq('A4','passage_mcq','Which word best completes gap 4?',['relatively','determined','overwhelming','goal-oriented'],'determined','You need an adjective showing that Maya refused to give up.','Determined describes someone firmly decided to achieve something and unwilling to give up.'),
    mcq('A5','passage_mcq','Which word best completes gap 5?',['challenge','generation','pastime','opponent'],'challenge','Look for a noun meaning a difficult task that tests ability.','A challenge is a difficult task or situation that tests ability.'),
    mcq('A6','passage_mcq','Which word best completes gap 6?',['discipline','tournament','achievement','minimum'],'achievement','Think about the feeling of successfully completing something difficult.','An achievement is something important or difficult that has been successfully completed.'),
    mcq('A7','paraphrase_mcq','The coach strongly encouraged Maya to keep practising. Which sentence has the closest meaning?',['The coach urged Maya to keep practising.','The coach denied Maya extra practice.','The coach permitted Maya to stop practising.','The coach resented Maya’s practice.'],'The coach urged Maya to keep practising.','Look for a verb meaning strongly encourage someone.','Urge means to strongly encourage someone to do something.'),
    mcq('A8','paraphrase_mcq','Maya found it hard to complete the route. Which sentence has the closest meaning?',['Maya avoided completing the route.','Maya struggled to complete the route.','Maya regretted completing the route.','Maya arranged to complete the route.'],'Maya struggled to complete the route.','Focus on the phrase found it hard.','Struggled means had difficulty doing something, so it preserves the original meaning.'),
    typed('A9','Complete the sentence using the correct form of determine: “Maya showed great ______ when the climbing became difficult.”','determination','You need a noun, not an adjective or verb.','Determination is the noun form of determine and fits after “showed great”.'),
    mcq('A10','precision_mcq','Which phrase is most natural?',['heavy achievement','major achievement','strong achievement','deep achievement'],'major achievement','Think about the adjective that naturally goes before achievement.','Major achievement is the natural collocation for an important success.')
  ]
};

const formB = {
  id:'B',
  title:'Preparing for a tournament',
  passage:`A school badminton team is preparing for a regional [[1]] involving eight schools. The players know that the competition will be [[2]], especially during the final rounds. Their coach reminds them that success requires more than ability. Regular training also requires considerable [[3]].\n\nBefore each match, the players study their next [[4]] and discuss possible tactics. The coach also [[5]] that everyone warms up properly before playing. Tournament preparation can [[6]] a great deal of time, so students must balance training with their schoolwork.\n\nAlthough winning is important, the coach tells the team that performing well under pressure is also valuable experience.`,
  questions:[
    mcq('B1','passage_mcq','Which word best completes gap 1?',['championship','tournament','pastime','feat'],'tournament','You need the word for a competition involving several teams or players.','A tournament is a competition involving several players or teams over a series of matches.'),
    mcq('B2','passage_mcq','Which word best completes gap 2?',['intense','relatively','unfamiliar','monetary'],'intense','Look for an adjective meaning very demanding or strong.','Intense describes something very strong, serious or demanding.'),
    mcq('B3','passage_mcq','Which word best completes gap 3?',['discipline','atmosphere','preference','generation'],'discipline','Think about the self-control required for regular training.','Discipline is the self-control needed to work consistently towards a goal.'),
    mcq('B4','passage_mcq','Which word best completes gap 4?',['competitor','opponent','spectator','teammate'],'opponent','This is the person or team you are trying to beat.','An opponent is the person or team you compete against.'),
    mcq('B5','passage_mcq','Which word best completes gap 5?',['denies','recommends','threatens','resents'],'recommends','Look for a verb meaning suggests something as useful or suitable.','Recommends means suggests something as suitable or useful.'),
    mcq('B6','passage_mcq','Which word best completes gap 6?',['afford','permit','demand','avoid'],'demand','The sentence means training requires a lot of time.','Demand can mean require a lot of effort, attention, time or resources.'),
    mcq('B7','paraphrase_mcq','The final required a great deal of concentration. Which sentence has the closest meaning?',['The final demanded a great deal of concentration.','The final permitted a great deal of concentration.','The final avoided a great deal of concentration.','The final arranged a great deal of concentration.'],'The final demanded a great deal of concentration.','Focus on another way of saying required.','Demanded can mean required a great deal of something.'),
    mcq('B8','paraphrase_mcq','Only top-level players entered the competition. Which word could replace top-level?',['relatively','elite','unfamiliar','goal-oriented'],'elite','Look for an adjective meaning highest level.','Elite means belonging to the highest level of ability or performance.'),
    typed('B9','Complete the sentence using the correct form of compete: “The event attracted some very strong ______ from other schools.”','competitors','You need a plural noun referring to people taking part in a competition.','Competitors is the plural noun for people taking part in a competition.'),
    mcq('B10','precision_mcq','Which phrase is most natural?',['intense competition','powerful competition','deep competition','heavy competition'],'intense competition','Which adjective naturally describes very strong competition?','Intense competition is the natural collocation for very strong or demanding competition.')
  ]
};

const formC = {
  id:'C',
  title:'Leisure activities for teenagers',
  passage:`A local youth centre recently asked teenagers how they spend their [[1]]. Many said that sport was their favourite [[2]], although there were clear differences in personal [[3]]. Some preferred team games, while others enjoyed cycling, swimming or individual fitness activities.\n\nHowever, not every family can [[4]] expensive equipment or club fees. The youth centre therefore looked for a practical [[5]]. It began lending sports equipment free of charge and allowing teenagers to use its facilities after school.\n\nThe organisers want young people to stay active [[6]] of how much money their families have. They hope the scheme will make sport more accessible to everyone.`,
  questions:[
    mcq('C1','passage_mcq','Which word best completes gap 1?',['leisure time','minimum','achievement','generation'],'leisure time','Think about time when you are not working or studying.','Leisure time is time when you are not working or studying and can relax or enjoy activities.'),
    mcq('C2','passage_mcq','Which word best completes gap 2?',['competitor','pastime','championship','opponent'],'pastime','You need a noun meaning an activity done regularly for enjoyment.','A pastime is an activity done regularly for enjoyment in your free time.'),
    mcq('C3','passage_mcq','Which word best completes gap 3?',['discipline','preference','patience','atmosphere'],'preference','Look for a noun meaning a greater liking for one option.','A preference is a greater liking for one option than another.'),
    mcq('C4','passage_mcq','Which word best completes gap 4?',['deny','afford','urge','threaten'],'afford','The sentence is about having enough money to pay for something.','Afford means to have enough money or resources to pay for something.'),
    mcq('C5','passage_mcq','Which word best completes gap 5?',['solution','challenge','feat','generation'],'solution','You need a word meaning a way of dealing with a problem.','A solution is an answer to a problem or a way of dealing with a difficulty.'),
    mcq('C6','passage_mcq','Which word best completes gap 6?',['estimated','relatively','regardless','overwhelming'],'regardless','The phrase means the situation should not affect the result.','Regardless means without being affected by a particular fact or situation.'),
    mcq('C7','paraphrase_mcq','The centre allows teenagers to use the equipment. Which word could replace allows?',['permits','denies','demands','resents'],'permits','Look for a verb meaning allow.','Permits means allows something to happen.'),
    mcq('C8','paraphrase_mcq','The approximate cost of the scheme is ¥20,000. Which word could replace approximate?',['minimum','estimated','monetary','overwhelming'],'estimated','Look for a word meaning calculated approximately.','Estimated means calculated or judged approximately rather than known exactly.'),
    typed('C9','Complete the sentence using the correct form of prefer: “Students expressed a clear ______ for activities they could do with friends.”','preference','You need a noun meaning a greater liking for one option.','Preference is the noun form of prefer and fits after “a clear”.'),
    mcq('C10','precision_mcq','Which phrase is most natural?',['monetary reward','monetary success','monetary atmosphere','monetary opponent'],'monetary reward','Think about the adjective that means related to money.','Monetary reward is a natural collocation meaning a financial prize or payment.')
  ]
};

export const unit1VocabularyCheck = Object.freeze({
  unitNumber:1,
  title:'Unit Vocabulary Check',
  course:'Cambridge IGCSE ESL 0511',
  maxAttempts:3,
  forms:Object.freeze({ A:formA, B:formB, C:formC })
});

export default unit1VocabularyCheck;
