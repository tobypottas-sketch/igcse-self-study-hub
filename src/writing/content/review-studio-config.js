import {guidedTask,independentTask,selfCheck,toolkit} from './review-guided-v1.js';
export const reviewStudioConfig={genre:'Review Writing',tasks:[{...guidedTask,title:'Restaurant · Willow Kitchen',art:'structure'},{...independentTask,title:'Community sports event',art:'discover'}],min:120,max:160,toolkit,selfCheck,fields:[
 {key:'audience',title:'Your reader',question:'Who will read your review?',starter:'My readers are …',tone:'reader'},
 {key:'reason',title:'Introduce',question:'Why did you visit?',starter:'I went because …',tone:'intro'},
 {key:'feature1',title:'Describe',question:'Which feature stood out, and why?',starter:'What stood out was …',tone:'describe'},
 {key:'feature2',title:'Evaluate',question:'What other feature or drawback mattered?',starter:'The main drawback was …',tone:'evaluate'},
 {key:'recommendation',title:'Recommend',question:'Who would enjoy it, and why?',starter:'I would recommend it to … because …',tone:'recommend'}
]};