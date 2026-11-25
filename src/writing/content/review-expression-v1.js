// Original learning material. Reuses the eight existing review texts.
const q=(prompt,options,answer,rationale)=>({prompt,options,answer,rationale});
export const discovery=[
 {...q('Which description is most precise?',['The food was nice.','The chicken was juicy and the cucumber crunchy.','The food was exceptionally magnificent.'],1,'Specific sensory words tell the reader what to expect. Longer words are not automatically better.'),context:'A student is reviewing a restaurant for a school magazine.'},
 {...q('Which phrase sounds natural?',['Do a recommendation','Make a recommendation','Perform a recommendation'],1,'Make a recommendation is a natural collocation.'),context:'Choose words that naturally belong together.'},
 {...q('Which opinion is appropriately balanced?',['The place was absolutely perfect.','The service was slow, but the food was worth the wait.','The restaurant was a total disaster.'],1,'The writer uses measured language and recognises both strengths and weaknesses.'),context:'The food was excellent but the service was slow.'},
 {...q('Which expression suits a school magazine?',['This film is sick, mate.','The film is hereby deemed satisfactory.','The film is gripping from the opening scene.'],2,'Gripping is engaging and precise without being slang or unnecessarily formal.'),context:'Review a film for other students.'},
 {...q('Which revision avoids repetition without changing the meaning?',['The helpful staff explained the activities and answered our questions.','The helpful staff were helpful and gave helpful advice.','The assistance was advantageous in an advantageous way.'],0,'Vary expression by giving details, not by forcing synonyms.'),context:'The writer wants to praise the staff.'}
];
export const companions=[
 ['Choose words that work','Replace vague praise with a precise description.','Accuracy matters more than difficult vocabulary.'],
 ['Spot effective expression','Look for natural word combinations, measured opinions and vivid details.','Ask why a phrase works in this context.'],
 ['Build your word power','Read the whole sentence before choosing a word.','Consider meaning, collocation and audience.'],
 ['Make every word count','Keep the original meaning while improving the expression.','Compare your revision with the example.'],
 ['Choose independently','Think about the intended meaning and reader.','Use your skills in the Writing Studio next.']
];
const activity=(id,level,title,items)=>({id:'expression-'+id,level,title,type:'choice',items});
export const activities=[
 activity('precision','Bronze','Replace vague words',[
 q('The seats were soft and supported my back. Which adjective is most precise?',['Spectacular','Comfortable','Delicious'],1,'Comfortable describes the physical experience.'),
 q('The instructions were hard to understand. Which word fits?',['Confusing','Crowded','Affordable'],0,'Confusing describes something difficult to follow.'),
 q('The plot kept me wanting to know what happened next. Which adjective fits?',['Generous','Convenient','Gripping'],2,'Gripping describes a story that holds your attention.')]),
 activity('collocation','Bronze','Choose natural phrases',[
 q('The ticket was inexpensive for everything included. It offered excellent …',['price worth','value for money','money quality'],1,'Value for money is a natural expression.'),
 q('Which phrase describes a large serving of food?',['A generous portion','A generous flavour','A generous menu price'],0,'Generous portion is a natural collocation.'),
 q('Which phrase describes a film’s audio?',['A delicious soundtrack','A spacious soundtrack','An atmospheric soundtrack'],2,'Atmospheric describes sound that creates a mood.')]),
 activity('balance','Silver','Express balanced opinions',[
 q('The museum was educational but crowded. Which sentence is most balanced?',['The museum was perfect.','Although the displays were informative, the crowds made them difficult to explore.','The museum was completely useless because it was crowded.'],1,'Specific, measured praise and criticism reflect both facts.'),
 q('The game is challenging but fair. Which wording preserves that meaning?',['The puzzles are demanding but rewarding.','The puzzles are impossible and frustrating.','The puzzles are effortless.'],0,'Demanding but rewarding preserves the positive challenge.'),
 q('The café was noisy only at lunchtime. Which criticism is accurate?',['The café is always unbearable.','The café has no atmosphere.','The café can become rather noisy at lunchtime.'],2,'Can become and at lunchtime qualify the criticism.')]),
 activity('register','Silver','Match language to readers',[
 q('Which recommendation suits a school magazine?',['Yo, go there ASAP!','I would recommend it to students seeking an affordable lunch.','The aforementioned establishment merits patronage.'],1,'The language is accessible and appropriate.'),
 q('Which film review phrase is engaging without slang?',['The opening scene immediately caught my attention.','The opening scene was lit, bro.','The opening scene occasioned considerable attentional engagement.'],0,'Natural, engaging language suits the audience.'),
 q('Which criticism is polite and useful?',['The organisers are idiots.','The event was rubbish.','Clearer signs would make the venue easier to navigate.'],2,'Constructive criticism identifies a specific improvement.')]),
 activity('editing','Gold','Improve expression',[
 q('Improve “The film was good and the actors were good.” without inventing plot details.',['The film was good and very good actors were good.','The film was enjoyable, with convincing performances from the cast.','The film was a masterpiece that won many awards.'],1,'Precise language avoids repetition without adding unsupported facts.'),
 q('Choose the best revision: “The food was very nice, but it cost a lot.”',['The food was enjoyable, although the prices were rather high.','The food was inedible and the prices were criminal.','The gastronomic offerings were preposterously felicitous.'],0,'The revision is natural and preserves the original judgement.'),
 q('Improve “The park had lots of things to do.” when the activities include climbing and zip lines.',['The park possessed innumerable recreational entities.','The park was nice.','The park offered climbing courses and zip-line challenges.'],2,'Specific nouns are clearer than vague language.')]),
 activity('master','Mastery check','Check your understanding',[
 q('Which sentence gives precise, natural praise?',['The service was very very good.','The attentive staff answered our questions promptly.','The service was positively superlative in every respect.'],1,'Attentive and promptly describe the actual service.'),
 q('Which is the most appropriate criticism for a youth website?',['The instructions were unclear, especially for beginners.','The instructions were trash.','The instructional documentation was incontrovertibly deficient.'],0,'Clear and measured criticism suits the audience.'),
 q('Which recommendation best avoids repetition and vague language?',['It is good for people who like good things.','It is amazing for absolutely everyone.','Its short, challenging levels make it ideal for puzzle fans.'],2,'Specific features and audience make the recommendation useful.')])
];
export const applicationTasks=[
 {title:'Replace vague praise',prompt:'The café was nice and the food was good.',question:'Rewrite using two precise details. Keep the language natural.',example:'The café had a welcoming atmosphere, and the freshly made sandwiches were full of flavour.',checks:['I replaced vague words.','I included specific details.','My language sounds natural.']},
 {title:'Express balanced criticism',prompt:'The festival was bad because the queues were long, but the music was good.',question:'Rewrite with measured criticism and precise praise.',example:'Although the queues were frustratingly long, the energetic live performances made the festival worth attending.',checks:['I used measured criticism.','I expressed a clear strength.','I preserved the original meaning.']},
 {title:'Match your audience',prompt:'This game is sick and you guys gotta play it.',question:'Rewrite for your school website. Recommend it to a suitable audience with a reason.',example:'I would recommend this imaginative puzzle game to students who enjoy a challenge, as each level introduces a new problem to solve.',checks:['My register suits a school website.','I used precise vocabulary.','My recommendation sounds natural.']}
];
// Each entry supplies a phrase drawn verbatim from its model paragraph and a contrastive vocabulary question.
export const lenses={
 'Riverside Café':[
 ['cheerful atmosphere','Which phrase gives a specific positive impression?','cheerful atmosphere','ordinary place','very nice thing','Cheerful atmosphere describes the mood rather than giving vague praise.'],
 ['reasonably priced','Which phrase evaluates affordability?','reasonably priced','comfortable seating','freshly made','Reasonably priced suggests fair cost, not necessarily cheapness.'],
 ['made up for the delay','Which phrase shows a strength compensating for a weakness?','made up for the delay','remained polite','twenty minutes','Made up for means compensated for.'],
 ['outside peak hours','Which phrase gives precise practical advice?','outside peak hours','overall','even better','Peak hours are the busiest periods.']],
 'Willow Kitchen':[
 ['a short walk','Which phrase expresses proximity naturally?','a short walk','badminton match','lunch menu','A short walk is a natural way to describe convenient distance.'],
 ['crunchy cucumber','Which phrase describes texture?','crunchy cucumber','my favourite','on the side','Crunchy describes texture rather than taste.'],
 ['main drawback','Which phrase introduces measured criticism?','main drawback','getting a table','once we sat down','Main drawback identifies the principal disadvantage.'],
 ['filling, affordable lunch','Which phrase evaluates both quantity and price?','filling, affordable lunch','catch up with friends','lunchtime rush','Filling and affordable express two distinct benefits.']],
 'Beyond the Stars':[
 ['opening scene','Which phrase names the beginning of a film naturally?','opening scene','original destination','distant planet','Opening scene is a natural film-review collocation.'],
 ['spectacular effects','Which phrase describes visually impressive film techniques?','spectacular effects','quiet conversations','their fears','Spectacular effects is precise film vocabulary.'],
 ['moves rather slowly','Which expression gives measured criticism of pacing?','moves rather slowly','remarkable soundtrack','genuinely exciting','Rather softens the criticism and slowly identifies pacing.'],
 ['constant action','Which phrase describes a specific audience expectation?','constant action','imaginative stories','believable characters','Constant action describes the pace some viewers prefer.']],
 'The Lost City':[
 ['worth discovering','Which expression gives a natural recommendation?','worth discovering','old camera','summer holiday','Worth discovering invites the reader to try the book.'],
 ['so vividly','Which expression describes the effectiveness of the description?','so vividly','rather similar','minor characters','Vividly means in a way that creates a clear mental image.'],
 ['difficult to put down','Which expression means the book is absorbing?','difficult to put down','short chapters','historical novels','Difficult to put down is a natural idiom for a gripping book.']],
 'Summer Sound':[
 ['featuring young musicians','Which phrase identifies the performers naturally?','featuring young musicians','last weekend','local park','Featuring introduces the people included in an event.'],
 ['energetic rock performances','Which phrase describes both style and energy?','energetic rock performances','food stalls','short music workshops','Energetic describes the lively quality of the performances.'],
 ['outstanding performance','Which phrase gives precise praise for a musical act?','outstanding performance','drinking water','afternoon heat','Outstanding performance is a natural evaluative collocation.'],
 ['excellent value','Which phrase evaluates the benefit relative to cost?','excellent value','local talent','comfortable spot','Excellent value expresses worthwhile cost.']],
 'Skyline Adventure Park':[
 ['suitable for different levels','Which phrase explains who can take part?','suitable for different levels','recently opened','outside town','Suitable for identifies fitness for a particular audience.'],
 ['feel confident enough','Which phrase explains the effect of instruction?','feel confident enough','enormous zip line','low climbing course','Confident enough describes readiness to take part.'],
 ['limited menu','Which phrase identifies a restriction in food choice?','limited menu','unlimited attempts','all equipment','Limited menu means few choices.'],
 ['make the most of your visit','Which expression means get the greatest benefit?','make the most of your visit','adventurous friends','packed lunch','Make the most of is a natural expression for using an opportunity well.']],
 'Pixel Quest':[
 ['increasingly challenging','Which expression describes rising difficulty?','increasingly challenging','realistic graphics','tiny robot','Increasingly shows a gradual change.'],
 ['genuinely rewarding','Which phrase describes a satisfying achievement?','genuinely rewarding','moving platforms','previous levels','Rewarding describes satisfaction gained from effort.'],
 ['unnecessarily confusing','Which phrase criticises a problem that could be avoided?','unnecessarily confusing','advanced challenges','inexperienced players','Unnecessarily suggests the difficulty is not justified.'],
 ['ideal for occasional play','Which phrase gives a specific suitability judgement?','ideal for occasional play','high scores','solving problems','Ideal for identifies a particular use or audience.']],
 'The Science Discovery Centre':[
 ['far more memorable','Which expression makes a strong comparison?','far more memorable','practical experiments','same concepts','Far intensifies the comparative more memorable.'],
 ['clear enough for beginners','Which expression evaluates accessibility?','clear enough for beginners','miniature bridges','popular exhibits','Clear enough for beginners evaluates the level of explanation.'],
 ['abstract ideas','Which phrase describes concepts that are not concrete?','abstract ideas','fewer visitors','excellent choice','Abstract ideas is a natural academic collocation.']]
};
export function expressionModels(models){return models.map(m=>({...m,expression:lenses[m.title].map(([phrase,prompt,...rest],i)=>{const rationale=rest.pop();const correct=rest[0];const shift=i%3;const options=rest.slice(shift).concat(rest.slice(0,shift));return {phrase,prompt,options,answer:options.indexOf(correct),rationale};})}));}
