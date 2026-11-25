import {guidedTask,independentTask,selfCheck,toolkit} from './review-guided-v1.js';
export const reviewStudioConfig={genre:'Review Writing',tasks:[{...guidedTask,title:'Restaurant · Willow Kitchen',shortMission:'Review a new restaurant for your school magazine.'},{...independentTask,title:'Community sports event',shortMission:'Review a sports event for your school website.'}],min:120,max:160,selfCheck,
 answerLabel:'Write your review in continuous prose',
 answerPlaceholder:'Start writing your review here…',
 languageSupport:{Bronze:toolkit,Silver:['Use a specific detail to explain each opinion.','Use contrast where it helps the reader weigh up the experience.','Explain who would benefit from your recommendation.'],Gold:['Check that your language suits the reader and publication.']},
 fields:[
 {key:'audience',title:'Your reader',question:'Who will read your review?',starter:'My readers are …',tone:'reader'},
 {key:'reason',title:'Introduce',question:'Why did you visit?',starter:'I went because …',tone:'intro'},
 {key:'feature1',title:'Describe',question:'What did you experience?',starter:'During my visit, I …',tone:'describe'},
 {key:'feature2',title:'Evaluate',question:'What impressed or disappointed you?',starter:'I was impressed by … because …',tone:'evaluate'},
 {key:'recommendation',title:'Recommend',question:'Who would enjoy it, and why?',starter:'I would recommend it to … because …',tone:'recommend'}
]};