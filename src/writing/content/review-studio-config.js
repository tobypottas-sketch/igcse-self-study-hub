import {guidedTask,independentTask,selfCheck,toolkit} from './review-guided-v1.js';
export const reviewStudioConfig={genre:'Review Writing',tasks:[{...guidedTask,title:'Restaurant · Willow Kitchen',shortMission:'Review a new restaurant for your school magazine.'},{...independentTask,title:'Community sports event',shortMission:'Review a sports event for your school website.'}],min:120,max:160,selfCheck,
 answerLabel:'Write your review in continuous prose',
 answerPlaceholder:'Start writing your review here…',
 languageSupport:{Bronze:toolkit,Silver:['Use a specific detail to explain each opinion.','Use contrast where it helps the reader weigh up the experience.','Explain who would benefit from your recommendation.'],Gold:['Check that your language suits the reader and publication.']},
 phraseBank:[
 {label:'Introduce',phrases:{Bronze:['I recently visited','My first impression was','I decided to visit because'],Silver:['What attracted me was','From the moment I arrived,'],Gold:['What initially drew me to']}},
 {label:'Describe',phrases:{Bronze:['What stood out was','One impressive feature was','The atmosphere was'],Silver:['Particularly striking was','Another feature worth mentioning is'],Gold:['What distinguishes this experience is']}},
 {label:'Evaluate',phrases:{Bronze:['The main drawback was','This meant that','Although'],Silver:['Despite this drawback,','This was particularly effective because'],Gold:['What ultimately made the experience worthwhile was']}},
 {label:'Recommend',phrases:{Bronze:['I would recommend it to','It is ideal for','If you enjoy'],Silver:['It would particularly appeal to','To make the most of the experience,'],Gold:['For those seeking']}}
 ],
 blueprint:{title:'Review blueprint',moves:[
 {label:'Introduce',hint:'Set the scene.',tone:'intro',icon:'◎'},
 {label:'Describe',hint:'Give specific details.',tone:'describe',icon:'◇'},
 {label:'Evaluate',hint:'Give opinions and reasons.',tone:'evaluate',icon:'±'},
 {label:'Recommend',hint:'Say who, and why.',tone:'recommend',icon:'✓'}
 ],reminder:'Four writing moves, not four compulsory paragraphs.',exam:'Cambridge 0511 · Exercise 6'},
 quickChecks:['Answered the task','Used clear paragraphs','Developed my opinions','Included specific details','Gave a useful recommendation','Checked my language'],
 markBreakdown:[{label:'Content',marks:6},{label:'Language',marks:9}],
 fields:[
 {key:'audience',title:'Your reader',question:'Who will read your review?',starter:'My readers are …',tone:'reader'},
 {key:'reason',title:'Introduce',question:'Why did you visit?',starter:'I went because …',tone:'intro'},
 {key:'feature1',title:'Describe',question:'What did you experience?',starter:'During my visit, I …',tone:'describe'},
 {key:'feature2',title:'Evaluate',question:'What impressed or disappointed you?',starter:'I was impressed by … because …',tone:'evaluate'},
 {key:'recommendation',title:'Recommend',question:'Who would enjoy it, and why?',starter:'I would recommend it to … because …',tone:'recommend'}
]};