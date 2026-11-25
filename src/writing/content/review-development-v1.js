// Original teaching material: develop a judgement with relevant evidence and impact.
const q=(prompt,options,answer,rationale)=>({prompt,options,answer,rationale});
export const discovery=[
 {...q('Which opinion is best developed?',['The café was excellent.','The café was excellent because it was excellent.','The café offered meals under forty yuan, making lunch affordable for students.'],2,'A specific detail supports a judgement and explains why it matters.'),context:'You are reviewing a restaurant for your school magazine.'},
 {...q('Which detail supports the judgement that the staff were helpful?',['A waiter explained the menu when we could not understand it.','The walls were painted blue.','The restaurant opened last year.'],0,'The waiter’s action is evidence of helpfulness.'),context:'The staff made visitors feel welcome.'},
 {...q('What is the effect of clear instructions?',['The instructions were printed on paper.','Beginners could start without repeatedly asking for help.','There were instructions.'],1,'Explain what the feature changes for the visitor.'),context:'A game has a clear tutorial.'},
 {...q('Which evaluation reflects both facts?',['The park is unsuitable for everyone.','The park is perfect.','The equipment is included in the price, although the café is expensive.'],2,'Balanced evaluation weighs relevant strengths and limitations.'),context:'A park includes equipment hire but charges high café prices.'},
 {...q('Which recommendation is most convincing?',['It is ideal for puzzle fans because the levels require creative problem-solving.','Everyone should play it.','I recommend it because I recommend it.'],0,'A recommendation is stronger when it connects an audience to a specific benefit.'),context:'You are reviewing a puzzle game.'}
];
export const companions=[
 ['Build a convincing opinion','Give a reason, a detail or an example that supports your judgement.','Ask: Why? What exactly? Why does it matter?'],
 ['Find the evidence','Look for details that explain or support the writer’s judgement.','A fact is useful when it helps the reader understand an opinion.'],
 ['Connect ideas to impact','Choose evidence that is relevant to the judgement.','Avoid repeating an opinion as its own reason.'],
 ['Develop your own ideas','Use a specific example and explain its effect.','Do not invent evidence when revising a supplied text.'],
 ['Make your case','Choose the most relevant and convincing development.','A useful recommendation connects an audience to a benefit.']
];
const activity=(id,level,title,items)=>({id:'development-'+id,level,title,type:'choice',items});
export const activities=[
 activity('reason','Bronze','Give a reason',[
 q('The cinema was comfortable because …',['it had a name.','the seats offered plenty of legroom.','it showed films.'],1,'Legroom directly supports comfort.'),
 q('The workshop was useful because …',['we learned to edit our own videos.','it took place on Tuesday.','the building was tall.'],0,'A skill learned supports usefulness.'),
 q('The café was inconvenient for students because …',['it served sandwiches.','it had a blue sign.','it was a forty-minute walk from school.'],2,'Distance explains the inconvenience.')]),
 activity('evidence','Bronze','Choose specific evidence',[
 q('Which detail supports “The museum was interactive”?',['It was in town.','Visitors could build and test miniature bridges.','It opened at nine.'],1,'Building and testing are concrete examples of interaction.'),
 q('Which detail supports “The service was slow”?',['We waited twenty minutes for our drinks.','The staff wore uniforms.','The menu was colourful.'],0,'A specific waiting time supports the judgement.'),
 q('Which detail supports “The book is easy to follow”?',['The cover is green.','The author lives abroad.','Each chapter follows one character in chronological order.'],2,'The structure explains why it is easy to follow.')]),
 activity('impact','Silver','Explain the impact',[
 q('The climbing instructor demonstrated each move. Which effect best develops this detail?',['The instructor was wearing a helmet.','Nervous beginners knew what to do and felt safer attempting the course.','There were several instructors.'],1,'The effect connects instruction to the visitor’s experience.'),
 q('The restaurant serves lunch within ten minutes. Why might this matter to students?',['They can eat before their short lunch break ends.','The restaurant has a kitchen.','The food is on plates.'],0,'The reason relates directly to the audience.'),
 q('The game has short levels. Which benefit follows?',['It has a title.','The graphics must be realistic.','Players can complete a level during a short break.'],2,'The benefit follows logically from level length.')]),
 activity('balance','Silver','Develop balanced evaluations',[
 q('A festival has excellent music but long water queues. Which evaluation best uses both facts?',['The festival was perfect.','The lively performances were memorable, but the water queues made the afternoon heat uncomfortable.','The festival was terrible in every way.'],1,'Both the strength and the impact of the weakness are explained.'),
 q('The museum has clear explanations but crowded exhibits. What is a useful judgement?',['The explanations help beginners, although crowds limit opportunities to try popular activities.','The museum is crowded and has explanations.','The museum is unsuitable for all visitors.'],0,'The judgement explains the significance of both observations.'),
 q('The park is expensive but includes equipment. Which evaluation is most relevant?',['It is expensive because it is expensive.','Equipment exists at the park.','Although admission is high, included equipment may make the cost worthwhile for visitors planning several activities.'],2,'The evaluation weighs cost against benefit.')]),
 activity('recommend','Gold','Justify your recommendation',[
 q('A café is affordable but noisy. Which recommendation follows the evidence?',['It is ideal for quiet revision.','It suits friends seeking a cheap lunch, but not students needing a quiet study space.','Everyone will enjoy it equally.'],1,'The verdict connects benefits and limitations to different readers.'),
 q('A film has believable characters but a slow pace. Who is most likely to enjoy it?',['Viewers who enjoy character-driven stories and do not mind a gradual pace.','Anyone who wants nonstop action.','All viewers, regardless of taste.'],0,'The audience matches the evidence.'),
 q('A workshop offers clear guidance and challenging projects. Which ending is most useful?',['It was good, so go.','It is suitable because it is suitable.','I would recommend it to beginners who want to develop practical skills with support.'],2,'The recommendation links audience, purpose and benefit.')]),
 activity('master','Mastery check','Check your understanding',[
 q('Which sentence best develops a judgement about value?',['The ticket was good value because it included equipment and unlimited attempts.','The ticket was good value because it was good value.','The ticket was printed in colour.'],0,'The included benefits justify the value judgement.'),
 q('The museum’s signs were unclear. Which development explains the impact?',['The signs were on walls.','We spent ten minutes looking for the robotics exhibit instead of exploring it.','The museum had a shop.'],1,'A specific consequence shows why unclear signs mattered.'),
 q('A book has short chapters and a simple plot. Which recommendation is best supported?',['Readers seeking complex historical detail will love it.','Everyone should buy it.','It suits students starting to read in English because the chapters are manageable.'],2,'The audience and reason follow the given features.')])
];
export const applicationTasks=[
 {title:'Support your opinion',prompt:'The service was excellent. Our meals arrived within ten minutes.',question:'Connect the detail to the opinion and explain why it mattered to students.',example:'The efficient service was particularly impressive. Our meals arrived within ten minutes, leaving us enough time to return to school before lessons.',checks:['I gave a clear judgement.','I used the supplied specific detail.','I explained its effect on the reader or visitor.']},
 {title:'Explain a drawback',prompt:'The game has unclear instructions for advanced challenges. Players often repeat unsuccessful actions.',question:'Develop a criticism using the supplied evidence and explain a possible improvement.',example:'The unclear instructions for advanced challenges were frustrating, as players often repeated unsuccessful actions. A clearer tutorial would help them progress without wasting time.',checks:['I explained why the drawback matters.','I used the supplied evidence.','My improvement addresses the problem.']},
 {title:'Build a balanced verdict',prompt:'The sports event offers helpful coaching and equipment to borrow, but sessions fill quickly.',question:'Write a recommendation for a suitable audience, supported by the evidence and one practical limitation.',example:'I would recommend the event to beginners who want to try a new sport, since the coaches offer guidance and equipment is available to borrow. Arrive early, however, as popular sessions fill quickly.',checks:['I identified a suitable audience.','I justified my recommendation with evidence.','I acknowledged a relevant limitation.']}
];
// Each lens identifies a real excerpt and asks how an idea is developed.
const lenses={
 'Riverside Café':[
 ['celebrate my friend’s birthday','What explains the reason for the visit?','A birthday celebration','A school assignment','A search for a quiet library','The birthday gives context for the experience.'],
 ['reasonably priced','Why does the price detail matter to the writer?','The food was affordable for the group','The café had no seating','The menu was unavailable','Price supports a judgement about affordability.'],
 ['quiet corner','What practical benefit did the quiet corner offer?','The group could talk comfortably','The drinks arrived immediately','The café was empty','The writer explains how a feature improved the visit.'],
 ['outside peak hours','How does the final advice address a drawback?','It suggests avoiding the busiest times','It suggests ordering more food','It suggests bringing more friends','The advice follows the earlier criticism of crowding.']],
 'Willow Kitchen':[
 ['under forty yuan','What does the price detail help readers judge?','Whether lunch is affordable','Whether the music is loud','Whether the staff are friendly','A concrete price helps students judge value.'],
 ['after two hours on court','Why does the writer mention the badminton session?','It explains why a filling portion mattered','It shows the restaurant has sports facilities','It explains the long queue','The context connects food quantity to the writer’s needs.'],
 ['hard to talk','How does the writer develop the criticism of music?','By explaining its effect on conversation','By naming the song','By describing the menu','The effect makes the criticism useful to readers.'],
 ['lunchtime rush','What makes the recommendation balanced?','It gives advice for readers who prefer quiet','It claims the restaurant is always quiet','It ignores the earlier drawback','The advice addresses the limitation rather than hiding it.']],
 'Beyond the Stars':[
 ['distant planet','What does the plot detail add?','Enough context to understand the film’s premise','A complete explanation of the ending','Evidence of ticket prices','The premise helps readers understand what kind of story it is.'],
 ['quiet conversations','How does the writer support praise of the characters?','By explaining how conversations reveal fears and ambitions','By describing ticket prices','By listing every character','The technique is evidence for the judgement about realism.'],
 ['creates enough tension','Why is the soundtrack mentioned?','It explains why the ending remains exciting','It proves the film is short','It identifies the cinema location','The writer explains the soundtrack’s effect.'],
 ['believable characters','What supports the recommended audience?','The film’s strength in character development','The cost of admission','The length of the queue','The recommendation follows the earlier evaluation.']],
 'The Lost City':[
 ['map hidden inside an old camera','What does this detail contribute?','A specific example of the mystery premise','A judgement about the ending','A description of the bookshop','The detail makes the premise concrete without revealing the ending.'],
 ['difficult to follow','How is the criticism developed?','The similarity of characters makes conversations confusing','The book has no characters','The setting is always dull','The writer explains the effect of a specific weakness.'],
 ['unexpected discoveries','What supports the final positive judgement?','Short chapters and discoveries keep the reader interested','The author’s age','The cover design','The verdict is supported by features of the reading experience.']],
 'Summer Sound':[
 ['hoping to discover some new bands','Why does the writer include this detail?','It establishes a personal reason for attending','It proves all bands were famous','It explains the water queues','The motivation provides context for the evaluation.'],
 ['short music workshops','What does this example show?','Visitors had activities beyond watching concerts','There was only one performance','The festival had no food','The example develops the description of available activities.'],
 ['making the afternoon heat rather uncomfortable','How is the weakness developed?','The writer explains the consequence of long water queues','The writer merely repeats that queues were long','The writer gives the ticket price','A consequence shows why the queues mattered.'],
 ['refillable water bottle','How does this advice relate to earlier evidence?','It addresses the problem of access to drinking water','It addresses the quality of the songs','It addresses the number of stages','Practical advice follows an identified weakness.']],
 'Skyline Adventure Park':[
 ['different levels of experience','What does this detail tell the reader?','The park caters for a range of abilities','Only experts may take part','All activities are indoors','The detail develops the description in terms of suitability.'],
 ['helped nervous visitors','How does the writer evaluate the instructors?','By explaining their positive effect on confidence','By naming their uniforms','By stating that they existed','The impact supports praise of instruction.'],
 ['all equipment and unlimited attempts','Why is this detail relevant to the price?','It helps readers weigh benefits against admission cost','It shows the café is cheap','It explains the weather','Included benefits support a balanced value judgement.'],
 ['bring a packed lunch','Why does the writer give this advice?','It addresses the limited affordable café options','It makes climbing compulsory','It changes the ticket price','The recommendation responds to a specific drawback.']],
 'Pixel Quest':[
 ['collecting tools','What does the example help readers understand?','How the puzzle adventure works','How much the game costs','Whether it has multiplayer','The detail develops the description of gameplay.'],
 ['combining magnets and moving platforms','How does the writer support praise of the puzzles?','With a specific example of problem-solving','With the game’s price','With a claim about all games','A concrete example supports the judgement.'],
 ['repeating the same unsuccessful actions','What consequence supports the criticism?','Players waste effort because guidance is unclear','Players finish too quickly','Players cannot see the graphics','The consequence explains why the instructions need improvement.'],
 ['short levels','Why does the writer recommend occasional play?','Short levels fit brief playing sessions','The game has realistic graphics','The game requires long sessions','A specific feature supports the recommendation.']],
 'The Science Discovery Centre':[
 ['practical experiments','What contrast supports the initial opinion?','Hands-on experiments may be more memorable than textbook reading','The museum is closer than school','Textbooks contain no science','The contrast explains the basis of the writer’s judgement.'],
 ['built miniature bridges','How is the centre’s approach supported?','With examples of hands-on activities','With ticket prices','With a list of opening hours','Specific activities demonstrate the interactive approach.'],
 ['fewer visitors','Why is a weekday visit recommended?','It offers more chances to experiment independently','It guarantees free entry','It changes the exhibits','The advice follows the earlier problem of crowded displays.']]
};
export function developmentModels(models){return models.map(m=>({...m,expression:lenses[m.title].map(([phrase,prompt,correct,b,c,rationale],i)=>{const opts=[correct,b,c],shift=(i+models.indexOf(m))%3,options=opts.slice(shift).concat(opts.slice(0,shift));return {phrase,prompt,options,answer:options.indexOf(correct),rationale};})}));}
