import {withStaffInteractions} from '../content/review-interactions-r2-2.js';
import {renderSentenceSequence} from './sentence-sequence.js';
import {reviseDevelopmentForStaff,vocabularyDiscoverR21} from '../content/review-critical-r2-1.js';
import {structureR1} from '../content/review-structure-r1.js';
import {structureDiscover,structureExplore} from '../content/review-structure-recognition.js';
import {recognitionRun,recognitionResult} from '../engine/recognition.js?v=2';
import {renderRecognition} from './recognition-question.js?v=3';
import {capturePreview,restorePreview} from '../engine/preview-progress.js?v=4';
import {exam,examModels,examMocks,modelContext} from '../content/review-exam-20261125.js?v=2';
import {newExamAttempt} from '../engine/exam-attempt.js';
import {renderExamWorkshop} from './exam-workshop.js?v=3';
import {editing,editingModels} from '../content/review-editing.js?v=3';
import {cohesion,cohesionModels} from '../content/review-cohesion.js?v=3';
import * as development from '../content/review-development-v1.js';
import * as expression from '../content/review-expression-v1.js';
import {extraReviewModels} from '../content/review-explore-models.js?v=1';
import {mountLesson,el,action} from './lesson-shell.js?v=15';
import {reviewArtwork} from './editorial-art.js?v=16';
import {companions} from '../content/review-active-v2.js';
import {pathways} from '../content/review-pedagogy.js?v=6';
import {newWritingRun,renderResponseWorkshop} from './response-workshop.js?v=5';
import {guidedTask,independentTask,toolkit} from '../content/review-guided-v1.js';
import {blueprint,model} from '../content/review-structure-v1.js';
import {scoreItem,validateActivities,shuffledIndexes,hasWritingAttempt,writingComplete} from '../engine/activities.js?v=3';

// Explicit presentation-only splits of reviewed curriculum prompts; original text and IDs remain intact.
const questionPresentation = new Map([
 [
  "Groups can book seats together online. They can see the row letters from the entrance, and a member of staff helps them find their seats. Which heading fits all three details?",
  [
   "Groups can book seats together online. They can see the row letters from the entrance, and a member of staff helps them find their seats.",
   "Which heading fits all three details?"
  ]
 ],
 [
  "Beginners can try kayaking without buying equipment. Which detail supports this point?",
  [
   "Beginners can try kayaking without buying equipment.",
   "Which detail supports this point?"
  ]
 ],
 [
  "The coach shows beginners what to do, lets them practise and gives each person advice. Which first sentence fits all three details?",
  [
   "The coach shows beginners what to do, lets them practise and gives each person advice.",
   "Which first sentence fits all three details?"
  ]
 ],
 [
  "Can students visit after school? What will they learn? The gallery is near a bus stop, closes at five, has student guides and lets visitors handle copies of old tools. Which plan groups the details best?",
  [
   "Can students visit after school? What will they learn? The gallery is near a bus stop, closes at five, has student guides and lets visitors handle copies of old tools.",
   "Which plan groups the details best?"
  ]
 ],
 [
  "A theatre offers discounted tickets, captions at evening shows, a free programme and clear sound from the speakers. Which plan separates value for money from following the dialogue?",
  [
   "A theatre offers discounted tickets, captions at evening shows, a free programme and clear sound from the speakers.",
   "Which plan separates value for money from following the dialogue?"
  ]
 ],
 [
  "One paragraph covers studying at a café: quiet seats, sockets and dim lighting. The next covers food prices. Where should you mention that visitors can borrow lamps?",
  [
   "One paragraph covers studying at a café: quiet seats, sockets and dim lighting. The next covers food prices.",
   "Where should you mention that visitors can borrow lamps?"
  ]
 ],
 [
  "“You can borrow a racket at reception. The court lights are bright enough for evening practice. A deposit is returned when you bring the racket back.” Where should the sentence about the lights go?",
  [
   "“You can borrow a racket at reception. The court lights are bright enough for evening practice. A deposit is returned when you bring the racket back.”",
   "Where should the sentence about the lights go?"
  ]
 ],
 [
  "“The tutor explained the controls clearly. The entrance costs ¥30. We then managed to operate the camera independently.” Where should the price go?",
  [
   "“The tutor explained the controls clearly. The entrance costs ¥30. We then managed to operate the camera independently.”",
   "Where should the price go?"
  ]
 ],
 [
  "“I recommend the café to students in a hurry. Our takeaway order arrived in five minutes. The seats beside the window were comfortable.” Which edit makes the advice more useful for students in a hurry?",
  [
   "“I recommend the café to students in a hurry. Our takeaway order arrived in five minutes. The seats beside the window were comfortable.”",
   "Which edit makes the advice more useful for students in a hurry?"
  ]
 ],
 [
  "A paragraph explains that the museum's labels are clear but its map is confusing. The next paragraph starts “This makes it ideal for first-time visitors.” Which change gives first-time visitors the clearest advice?",
  [
   "A paragraph explains that the museum's labels are clear but its map is confusing. The next paragraph starts “This makes it ideal for first-time visitors.”",
   "Which change gives first-time visitors the clearest advice?"
  ]
 ],
 [
  "The notes cover booking seats, seeing the stage, collecting tickets and hearing the actors. Which plan separates booking from watching the show?",
  [
   "The notes cover booking seats, seeing the stage, collecting tickets and hearing the actors.",
   "Which plan separates booking from watching the show?"
  ]
 ],
 [
  "Seats can be booked together online. At the venue, row letters are visible from the entrance, and an usher directs groups to their seats. Which heading fits all three details?",
  [
   "Seats can be booked together online. At the venue, row letters are visible from the entrance, and an usher directs groups to their seats.",
   "Which heading fits all three details?"
  ]
 ],
 [
  "A paragraph argues that beginners can start kayaking without buying equipment. Which detail belongs with that argument?",
  [
   "A paragraph argues that beginners can start kayaking without buying equipment.",
   "Which detail belongs with that argument?"
  ]
 ],
 [
  "Your school review answers two questions: Can we get there after lessons? What will we learn? A gallery is near the bus stop, closes at five, uses student guides and has replica tools you can handle. What grouping answers both questions?",
  [
   "Your school review answers two questions: Can we get there after lessons? What will we learn? A gallery is near the bus stop, closes at five, uses student guides and has replica tools you can handle.",
   "What grouping answers both questions?"
  ]
 ],
 [
  "“You can borrow a racket at reception. The court lights are bright enough for evening practice. A deposit is returned when you bring the racket back.” Where should the middle sentence go if this paragraph explains how to borrow equipment?",
  [
   "“You can borrow a racket at reception. The court lights are bright enough for evening practice. A deposit is returned when you bring the racket back.”",
   "Where should the middle sentence go if this paragraph explains how to borrow equipment?"
  ]
 ],
 [
  "A review of a school theatre includes reserving seats, sightlines, collecting tickets and hearing dialogue. Which split helps readers plan a group visit and judge the experience?",
  [
   "A review of a school theatre includes reserving seats, sightlines, collecting tickets and hearing dialogue.",
   "Which split helps readers plan a group visit and judge the experience?"
  ]
 ],
 [
  "The seat was firm and kept my back upright. Which word most specifically describes that effect?",
  [
   "The seat was firm and kept my back upright.",
   "Which word most specifically describes that effect?"
  ]
 ],
 [
  "The lights dim slowly from bright white to almost nothing. Which word describes the change itself?",
  [
   "The lights dim slowly from bright white to almost nothing.",
   "Which word describes the change itself?"
  ]
 ],
 [
  "Complete the review sentence with the usual phrase for a performance that affected you emotionally. “It was a ___ moving performance.”",
  [
   "“It was a ___ moving performance.”",
   "Complete the review sentence with the usual phrase for a performance that affected you emotionally."
  ]
 ],
 [
  "The room became busier over twenty minutes. Which verb is the natural choice for the process? “The room gradually ___.”",
  [
   "The room became busier over twenty minutes. “The room gradually ___.”",
   "Which verb is the natural choice for the process?"
  ]
 ],
 [
  "“We could hear some dialogue from the back, but quieter lines were hard to catch.” Which edit keeps the extent of the problem?",
  [
   "“We could hear some dialogue from the back, but quieter lines were hard to catch.”",
   "Which edit keeps the extent of the problem?"
  ]
 ],
 [
  "Your school magazine addresses students directly in a friendly, measured voice. Which ending best fits that voice while keeping the advice conditional?",
  [
   "Your school magazine addresses students directly in a friendly, measured voice.",
   "Which ending best fits that voice while keeping the advice conditional?"
  ]
 ],
 [
  "“At peak times, the tour commentary was difficult to hear near the entrance.” Which edit changes how strongly the writer criticises the sound while keeping the same time and place?",
  [
   "“At peak times, the tour commentary was difficult to hear near the entrance.”",
   "Which edit changes how strongly the writer criticises the sound while keeping the same time and place?"
  ]
 ],
 [
  "You argue that the climbing session made beginners feel safe. Which observation best supports that judgement?",
  [
   "You argue that the climbing session made beginners feel safe.",
   "Which observation best supports that judgement?"
  ]
 ],
 [
  "You call the museum layout easy to follow. Which observation best lets the reader check your claim about finding the next room?",
  [
   "You call the museum layout easy to follow.",
   "Which observation best lets the reader check your claim about finding the next room?"
  ]
 ],
 [
  "A film club posts the running time and finishing time of each screening. Your readers catch the last bus at different times. Which explanation develops the most relevant impact?",
  [
   "A film club posts the running time and finishing time of each screening. Your readers catch the last bus at different times.",
   "Which explanation develops the most relevant impact?"
  ]
 ],
 [
  "At a festival, the bands kept the crowd dancing, but visitors queued half an hour for water in the midday heat. Which sentence explains a specific impact of both observations?",
  [
   "At a festival, the bands kept the crowd dancing, but visitors queued half an hour for water in the midday heat.",
   "Which sentence explains a specific impact of both observations?"
  ]
 ],
 [
  "A free robotics showcase lends kits. The demonstration starts at 4:30 and the practical session starts at 5:15. Your readers can leave school at four but need to catch a 5:30 bus. Which recommendation best fits the activities these students have time to do before their bus?",
  [
   "A free robotics showcase lends kits. The demonstration starts at 4:30 and the practical session starts at 5:15. Your readers can leave school at four but need to catch a 5:30 bus.",
   "Which recommendation best fits the activities these students have time to do before their bus?"
  ]
 ],
 [
  "The paragraph evaluates how easily visitors can find their way around a library. Which detail belongs with that focus?",
  [
   "The paragraph evaluates how easily visitors can find their way around a library.",
   "Which detail belongs with that focus?"
  ]
 ],
 [
  "A review paragraph explains how the sports club helps nervous beginners. Which topic sentence covers a demonstration, a short practice and individual advice?",
  [
   "A review paragraph explains how the sports club helps nervous beginners.",
   "Which topic sentence covers a demonstration, a short practice and individual advice?"
  ]
 ],
 [
  "A student review must evaluate a theatre's ticket value and suitability for viewers with hearing difficulties. Notes: discounted tickets, captions at evening shows, free programme, clear speakers. Which organisation best answers both requirements?",
  [
   "A student review must evaluate a theatre's ticket value and suitability for viewers with hearing difficulties. Notes: discounted tickets, captions at evening shows, free programme, clear speakers.",
   "Which organisation best answers both requirements?"
  ]
 ],
 [
  "Your review describes a photography course and evaluates its teaching. Which plan gives the evaluation a clear purpose?",
  [
   "Your review describes a photography course and evaluates its teaching.",
   "Which plan gives the evaluation a clear purpose?"
  ]
 ],
 [
  "A paragraph evaluates a café's suitability for revision: quiet seating, sockets and dim lighting. The next paragraph evaluates food prices. Where should the observation that lamps can be borrowed go?",
  [
   "A paragraph evaluates a café's suitability for revision: quiet seating, sockets and dim lighting. The next paragraph evaluates food prices.",
   "Where should the observation that lamps can be borrowed go?"
  ]
 ],
 [
  "“The tutor explained the controls clearly. The entrance costs ¥30. We then managed to operate the camera independently.” Which edit best restores the teaching paragraph's flow?",
  [
   "“The tutor explained the controls clearly. The entrance costs ¥30. We then managed to operate the camera independently.”",
   "Which edit best restores the teaching paragraph's flow?"
  ]
 ],
 [
  "“I recommend the café to students in a hurry. Our takeaway order arrived in five minutes. The seats beside the window were comfortable.” Which ending best follows the stated reason?",
  [
   "“I recommend the café to students in a hurry. Our takeaway order arrived in five minutes. The seats beside the window were comfortable.”",
   "Which ending best follows the stated reason?"
  ]
 ],
 [
  "A paragraph explains that the museum's labels are clear but its map is confusing. The next paragraph starts “This makes it ideal for first-time visitors.” What should the editor do?",
  [
   "A paragraph explains that the museum's labels are clear but its map is confusing. The next paragraph starts “This makes it ideal for first-time visitors.”",
   "What should the editor do?"
  ]
 ],
 [
  "The coach noticed my mistake and suggested a small change that immediately helped. Which adjective best describes that feedback?",
  [
   "The coach noticed my mistake and suggested a small change that immediately helped.",
   "Which adjective best describes that feedback?"
  ]
 ],
 [
  "The bread broke with a light crunch but was not hard to bite. Which description is most precise?",
  [
   "The bread broke with a light crunch but was not hard to bite.",
   "Which description is most precise?"
  ]
 ],
 [
  "“Two exhibits were out of order during my visit.” Which edit preserves the scope and time?",
  [
   "“Two exhibits were out of order during my visit.”",
   "Which edit preserves the scope and time?"
  ]
 ],
 [
  "“The guide occasionally spoke too quickly for me.” Which revision keeps the criticism measured?",
  [
   "“The guide occasionally spoke too quickly for me.”",
   "Which revision keeps the criticism measured?"
  ]
 ],
 [
  "“Students can borrow a tablet for up to an hour.” Which rewrite retains the limit?",
  [
   "“Students can borrow a tablet for up to an hour.”",
   "Which rewrite retains the limit?"
  ]
 ],
 [
  "A school magazine wants friendly but fair advice. Which sentence criticises crowded seating without attacking staff?",
  [
   "A school magazine wants friendly but fair advice.",
   "Which sentence criticises crowded seating without attacking staff?"
  ]
 ],
 [
  "You argue that a film makes its friendship believable. Which observation best supports that judgement?",
  [
   "You argue that a film makes its friendship believable.",
   "Which observation best supports that judgement?"
  ]
 ],
 [
  "You think a café offers good value for students. Which detail best supports that judgement?",
  [
   "You think a café offers good value for students.",
   "Which detail best supports that judgement?"
  ]
 ],
 [
  "You argue that a game is accessible to beginners. Which observation best supports the claim?",
  [
   "You argue that a game is accessible to beginners.",
   "Which observation best supports the claim?"
  ]
 ],
 [
  "You describe a concert's sound as clear. Which observation gives the most specific evidence?",
  [
   "You describe a concert's sound as clear.",
   "Which observation gives the most specific evidence?"
  ]
 ],
 [
  "You claim that a workshop gives individual support. Which observation makes this claim concrete?",
  [
   "You claim that a workshop gives individual support.",
   "Which observation makes this claim concrete?"
  ]
 ],
 [
  "You claim that an exhibition is interactive. Which detail most clearly demonstrates that?",
  [
   "You claim that an exhibition is interactive.",
   "Which detail most clearly demonstrates that?"
  ]
 ],
 [
  "A café serves takeaway meals in five minutes. Your readers have a twenty-minute lunch break. Which explanation develops the most relevant impact?",
  [
   "A café serves takeaway meals in five minutes. Your readers have a twenty-minute lunch break.",
   "Which explanation develops the most relevant impact?"
  ]
 ],
 [
  "A museum includes written instructions beside each experiment. Which explanation best develops the benefit for visitors exploring without a guide?",
  [
   "A museum includes written instructions beside each experiment.",
   "Which explanation best develops the benefit for visitors exploring without a guide?"
  ]
 ],
 [
  "A game saves progress after every short level. Your readers often play while travelling. Which development is most useful?",
  [
   "A game saves progress after every short level. Your readers often play while travelling.",
   "Which development is most useful?"
  ]
 ],
 [
  "A £12 workshop includes tools, but participants share benches. Which evaluation weighs both facts for beginners?",
  [
   "A £12 workshop includes tools, but participants share benches.",
   "Which evaluation weighs both facts for beginners?"
  ]
 ],
 [
  "A film has believable characters but a slow middle section. Which recommendation develops the balance for student readers?",
  [
   "A film has believable characters but a slow middle section.",
   "Which recommendation develops the balance for student readers?"
  ]
 ],
 [
  "A free festival offers beginner sessions that fill within fifteen minutes. Which recommendation uses both observations?",
  [
   "A free festival offers beginner sessions that fill within fifteen minutes.",
   "Which recommendation uses both observations?"
  ]
 ],
 [
  "The exhibition was informative, but some explanations were difficult. Which rewrite keeps that relationship?",
  [
   "The exhibition was informative, but some explanations were difficult.",
   "Which rewrite keeps that relationship?"
  ]
 ],
 [
  "The cinema seats were comfortable. You are adding a second strength. Which ending expresses that?",
  [
   "The cinema seats were comfortable. You are adding a second strength.",
   "Which ending expresses that?"
  ]
 ],
 [
  "The instructions included diagrams. Beginners used them to finish on their own. Which version gives the reason first and punctuates it accurately?",
  [
   "The instructions included diagrams. Beginners used them to finish on their own.",
   "Which version gives the reason first and punctuates it accurately?"
  ]
 ],
 [
  "You want to start the second sentence with “However”. Which version uses clear sentence boundaries?",
  [
   "You want to start the second sentence with “However”.",
   "Which version uses clear sentence boundaries?"
  ]
 ],
 [
  "You visited the sports centre last Saturday. Beginner classes are still available. Which version makes both facts clear?",
  [
   "You visited the sports centre last Saturday. Beginner classes are still available.",
   "Which version makes both facts clear?"
  ]
 ],
 [
  "A queue took a while to get through, but it kept moving. Which option expresses these observations in two correctly punctuated sentences?",
  [
   "A queue took a while to get through, but it kept moving.",
   "Which option expresses these observations in two correctly punctuated sentences?"
  ]
 ],
 [
  "The guide described two displays. Only the space display lets visitors touch replicas. Which line makes that detail clear?",
  [
   "The guide described two displays. Only the space display lets visitors touch replicas.",
   "Which line makes that detail clear?"
  ]
 ],
 [
  "In your review of the festival programme, you are describing what its range of activities does now. Which sentence agrees with its subject?",
  [
   "In your review of the festival programme, you are describing what its range of activities does now.",
   "Which sentence agrees with its subject?"
  ]
 ],
 [
  "The cinema offers discounted tickets before midday. Students with morning lessons usually cannot use them. Which rewrite preserves all three details?",
  [
   "The cinema offers discounted tickets before midday. Students with morning lessons usually cannot use them.",
   "Which rewrite preserves all three details?"
  ]
 ],
 [
  "Only the courses that include coaching cost extra. The other courses are included. Which sentence keeps the restriction?",
  [
   "Only the courses that include coaching cost extra. The other courses are included.",
   "Which sentence keeps the restriction?"
  ]
 ],
 [
  "The bus stopped outside the venue. This saved us a walk. We arrived before doors opened. Which combined version preserves the cause given in the notes?",
  [
   "The bus stopped outside the venue. This saved us a walk. We arrived before doors opened.",
   "Which combined version preserves the cause given in the notes?"
  ]
 ],
 [
  "The reviewer liked the clear sound even though the stage was hard to see. Which rewrite retains that evaluation and uses “despite” accurately?",
  [
   "The reviewer liked the clear sound even though the stage was hard to see.",
   "Which rewrite retains that evaluation and uses “despite” accurately?"
  ]
 ],
 [
  "The café has a lunch deal and a takeaway service. This is useful for students who eat on the way back to school. Which edit makes clear that only takeaway helps them eat on the move?",
  [
   "The café has a lunch deal and a takeaway service. This is useful for students who eat on the way back to school.",
   "Which edit makes clear that only takeaway helps them eat on the move?"
  ]
 ],
 [
  "The instructor showed us the controls. Moreover, we could try the first level independently. You want to say the demonstration enabled this. Which edit does that?",
  [
   "The instructor showed us the controls. Moreover, we could try the first level independently. You want to say the demonstration enabled this.",
   "Which edit does that?"
  ]
 ],
 [
  "On yesterday’s tour, the guide showed us the old engine, it was still warm. Which revision repairs the boundary while preserving what happened?",
  [
   "On yesterday’s tour, the guide showed us the old engine, it was still warm.",
   "Which revision repairs the boundary while preserving what happened?"
  ]
 ],
 [
  "The lift was slow. The lift stopped at every floor. The display upstairs was easy to follow. Which revision links the observations about the lift and clearly signals the move to the display?",
  [
   "The lift was slow. The lift stopped at every floor. The display upstairs was easy to follow.",
   "Which revision links the observations about the lift and clearly signals the move to the display?"
  ]
 ],
 [
  "An outdoor film screening includes blankets in the ticket price. They helped you stay comfortable in the cold, but the screen was difficult to see from some seats. Which edit preserves those relationships and the scope of the criticism?",
  [
   "An outdoor film screening includes blankets in the ticket price. They helped you stay comfortable in the cold, but the screen was difficult to see from some seats.",
   "Which edit preserves those relationships and the scope of the criticism?"
  ]
 ],
 [
  "“I enjoyed the sports centre. It was excellent.” What is the main weakness for readers deciding whether to go?",
  [
   "“I enjoyed the sports centre. It was excellent.”",
   "What is the main weakness for readers deciding whether to go?"
  ]
 ],
 [
  "“The café sells a lunch set and offers takeaway. It fits easily into a short break.” What should the writer clarify?",
  [
   "“The café sells a lunch set and offers takeaway. It fits easily into a short break.”",
   "What should the writer clarify?"
  ]
 ],
 [
  "“We waited ten minutes for a table. The wait for a table took ten minutes.” What is the most useful diagnosis?",
  [
   "“We waited ten minutes for a table. The wait for a table took ten minutes.”",
   "What is the most useful diagnosis?"
  ]
 ],
 [
  "A school newsletter uses a friendly, neutral voice. Which weakness is clearest in “Only a complete fool would skip this exhibition”?",
  [
   "A school newsletter uses a friendly, neutral voice.",
   "Which weakness is clearest in “Only a complete fool would skip this exhibition”?"
  ]
 ],
 [
  "“The exhibition was interesting.” You controlled a model spacecraft. Which edit supports the judgement using the supplied observation?",
  [
   "“The exhibition was interesting.” You controlled a model spacecraft.",
   "Which edit supports the judgement using the supplied observation?"
  ]
 ],
 [
  "Only the guide, rather than the driver, answered visitors’ questions. Which edit makes the reference in “They answered our questions clearly” precise?",
  [
   "Only the guide, rather than the driver, answered visitors’ questions.",
   "Which edit makes the reference in “They answered our questions clearly” precise?"
  ]
 ],
 [
  "The café was noisy only when the lunch queue was long. Which edit gives students useful advice without overstating the drawback?",
  [
   "The café was noisy only when the lunch queue was long.",
   "Which edit gives students useful advice without overstating the drawback?"
  ]
 ],
 [
  "“The guide was really nice.” The guide demonstrated each step twice for beginners. Which edit makes the praise more precise?",
  [
   "“The guide was really nice.” The guide demonstrated each step twice for beginners.",
   "Which edit makes the praise more precise?"
  ]
 ],
 [
  "The task asks about food, value and a recommendation. The draft covers food and recommends the café but omits value. Which action should come first?",
  [
   "The task asks about food, value and a recommendation. The draft covers food and recommends the café but omits value.",
   "Which action should come first?"
  ]
 ],
 [
  "Your school website asks who would enjoy a book. The review explains why the short chapters are easy to follow, but ends “Everyone should read it.” Which change should come first?",
  [
   "Your school website asks who would enjoy a book. The review explains why the short chapters are easy to follow, but ends “Everyone should read it.”",
   "Which change should come first?"
  ]
 ],
 [
  "A strong review covers the brief, uses evidence and offers a supported recommendation. Twice, the writer uses only a comma to join two complete sentences. This makes the main opinion hard to follow. What should the writer fix first?",
  [
   "A strong review covers the brief, uses evidence and offers a supported recommendation. Twice, the writer uses only a comma to join two complete sentences. This makes the main opinion hard to follow.",
   "What should the writer fix first?"
  ]
 ],
 [
  "The review has useful evidence, but one paragraph groups wheelchair access with ticket value and another splits the access details. Readers primarily need to decide whether the venue suits them. What should you do first?",
  [
   "The review has useful evidence, but one paragraph groups wheelchair access with ticket value and another splits the access details. Readers primarily need to decide whether the venue suits them.",
   "What should you do first?"
  ]
 ],
 [
  "Drinks took twenty minutes, but food arrived quickly. The café may not suit students on very short lunch breaks. Which edit keeps both timing facts and still gives practical advice to students with short breaks?",
  [
   "Drinks took twenty minutes, but food arrived quickly. The café may not suit students on very short lunch breaks.",
   "Which edit keeps both timing facts and still gives practical advice to students with short breaks?"
  ]
 ],
 [
  "At an outdoor play, the actors were audible from your seat, but the last scene was hard to see. Which revision keeps the criticism to what you could actually see from your seat in the last scene?",
  [
   "At an outdoor play, the actors were audible from your seat, but the last scene was hard to see.",
   "Which revision keeps the criticism to what you could actually see from your seat in the last scene?"
  ]
 ],
 [
  "The guide demonstrated a repair. You then repeated it using borrowed tools. Which edit develops the evaluation without changing the sequence or the cause?",
  [
   "The guide demonstrated a repair. You then repeated it using borrowed tools.",
   "Which edit develops the evaluation without changing the sequence or the cause?"
  ]
 ],
 [
  "Tickets are £12 and a second visit is free during the same week. One visit is enough for casual visitors, but enthusiasts may want to return. Which school-magazine edit makes the most accurate recommendation about value?",
  [
   "Tickets are £12 and a second visit is free during the same week. One visit is enough for casual visitors, but enthusiasts may want to return.",
   "Which school-magazine edit makes the most accurate recommendation about value?"
  ]
 ],
 [
  "Your school website asks you to review a bicycle repair workshop, evaluate what beginners learned and recommend it to a suitable student. The draft says: “The tutor showed us how to patch a tube. Then we worked in pairs. It was great. The room was quite bright; the tables were big. I would recommend it to most people.” Notes: students practised finding a leak before applying a patch. Which first edit best addresses the main gap?",
  [
   "Your school website asks you to review a bicycle repair workshop, evaluate what beginners learned and recommend it to a suitable student. The draft says: “The tutor showed us how to patch a tube. Then we worked in pairs. It was great. The room was quite bright; the tables were big. I would recommend it to most people.” Notes: students practised finding a leak before applying a patch.",
   "Which first edit best addresses the main gap?"
  ]
 ],
 [
  "School website: Review a holiday sports workshop. Describe the activities, evaluate coaching and explain who would benefit. Which plan covers the task?",
  [
   "School website: Review a holiday sports workshop. Describe the activities, evaluate coaching and explain who would benefit.",
   "Which plan covers the task?"
  ]
 ],
 [
  "School magazine: Review a film and explain whether it suits younger viewers. Which reader need should drive the judgement?",
  [
   "School magazine: Review a film and explain whether it suits younger viewers.",
   "Which reader need should drive the judgement?"
  ]
 ],
 [
  "School blog: Review a café for students meeting after lessons. Identify the purpose most closely.",
  [
   "School blog: Review a café for students meeting after lessons.",
   "Identify the purpose most closely."
  ]
 ],
 [
  "Review an adventure game. Describe its gameplay and evaluate how suitable it is for beginners. What must the response include?",
  [
   "Review an adventure game. Describe its gameplay and evaluate how suitable it is for beginners.",
   "What must the response include?"
  ]
 ],
 [
  "Review a film for the school website. Outline the premise, evaluate acting and pace, and identify suitable viewers. Which plan is most manageable?",
  [
   "Review a film for the school website. Outline the premise, evaluate acting and pace, and identify suitable viewers.",
   "Which plan is most manageable?"
  ]
 ],
 [
  "Review a market. Describe available food, evaluate cost and recommend it to suitable visitors. Which plan supports the verdict?",
  [
   "Review a market. Describe available food, evaluate cost and recommend it to suitable visitors.",
   "Which plan supports the verdict?"
  ]
 ],
 [
  "Review an outdoor event. Explain what you did, evaluate organisation and recommend it. Which plan gives an opinion about how the event was organised and uses that opinion to give practical advice?",
  [
   "Review an outdoor event. Explain what you did, evaluate organisation and recommend it.",
   "Which plan gives an opinion about how the event was organised and uses that opinion to give practical advice?"
  ]
 ],
 [
  "Review a book for classmates. Describe its subject, evaluate its accessibility and say who might enjoy it. Which plan uses the word range wisely?",
  [
   "Review a book for classmates. Describe its subject, evaluate its accessibility and say who might enjoy it.",
   "Which plan uses the word range wisely?"
  ]
 ],
 [
  "Your 135-word review covers activities and facilities, but the task also asks who would benefit. What should you do with little time left?",
  [
   "Your 135-word review covers activities and facilities, but the task also asks who would benefit.",
   "What should you do with little time left?"
  ]
 ],
 [
  "You are at 174 words. Your review repeats a description of the café and includes one unique detail that supports its value. What is the best cut?",
  [
   "You are at 174 words. Your review repeats a description of the café and includes one unique detail that supports its value.",
   "What is the best cut?"
  ]
 ],
 [
  "Your ending says the film suits teenagers, but you have time to make one edit. The review explains the short running time and simple mystery. Which edit is most useful?",
  [
   "Your ending says the film suits teenagers, but you have time to make one edit. The review explains the short running time and simple mystery.",
   "Which edit is most useful?"
  ]
 ],
 [
  "You have a complete draft, but two long sentences make its main evaluation difficult to follow. What should you prioritise?",
  [
   "You have a complete draft, but two long sentences make its main evaluation difficult to follow.",
   "What should you prioritise?"
  ]
 ],
 [
  "A student website asks you to review a holiday art course, evaluate teaching and recommend it. Which content must your plan include?",
  [
   "A student website asks you to review a holiday art course, evaluate teaching and recommend it.",
   "Which content must your plan include?"
  ]
 ],
 [
  "The draft already describes the art course, but ends “Everyone should try it.” What should the writer change first to answer what the task asks about the readers?",
  [
   "The draft already describes the art course, but ends “Everyone should try it.”",
   "What should the writer change first to answer what the task asks about the readers?"
  ]
 ]
]);
function renderQuestionPrompt(host,item,preview){
 const parts=preview?questionPresentation.get(item.prompt):null;
 if(preview && item.source) el(host,'p','wa-question-source',item.source);
 else if(parts) el(host,'p','wa-question-source',parts[0]);
 const heading=el(host,'h3','wa-question-prompt',parts?parts[1]:item.prompt);
 if(preview) heading.classList.add('wa-question-clear');
 return heading;
}

function add(p,tag,cls,t){const n=p.ownerDocument.createElement(tag);n.className=cls||'';if(t)n.textContent=t;p.append(n);return n;}
function button(p,t,fn){const n=add(p,'button','wa-action',t);n.type='button';n.addEventListener('click',fn);return n;}
export function renderExamReference(p,{includeToolkit=true}={}){
 const s=add(p,'aside','wa-exam-reference wa-exam-reference-v2');
 const bar=add(s,'div','wa-reference-bar');const identity=add(bar,'div','wa-reference-identity');add(identity,'span','wa-reference-label','CAMBRIDGE IGCSE ESL 0511');add(identity,'strong','','Paper 1 · Exercise 6');
 const facts=add(bar,'div','wa-reference-facts');for(const [value,label] of [['120–160','words'],['6','content marks'],['9','language marks']]){const fact=add(facts,'div','wa-reference-fact');add(fact,'b','',value);add(fact,'span','',label);}
 const d=add(s,'details','wa-reference-disclosure');const summary=add(d,'summary','');add(summary,'span','wa-reference-summary-icon','▤').setAttribute('aria-hidden','true');add(summary,'span','','Review blueprint & exam checklist');
 const layout=add(d,'div','wa-reference-layout');const moves=add(layout,'section','');add(moves,'h3','','Four writing moves');const grid=add(moves,'div','wa-reference-moves');
 const short=[['Introduce','Set the scene and give a first impression.'],['Describe','Select relevant, specific details.'],['Evaluate','Explain strengths and weaknesses.'],['Recommend','Say who would enjoy it, and why.']];
 short.forEach(([title,hint],i)=>{const card=add(grid,'div','wa-reference-move');card.dataset.move=String(i);add(card,'span','wa-reference-number',String(i+1).padStart(2,'0'));const copy=add(card,'div','');add(copy,'h4','',title);add(copy,'p','',hint);});
 add(moves,'p','wa-reference-reminder','Four writing moves, not four compulsory paragraphs. A title is optional.');
 const check=add(layout,'section','wa-reference-check');add(check,'h3','','Before you finish');const checks=['Cover all task requirements.','Write for the intended audience.','Support opinions with specific details.','Use clear paragraphs and natural, accurate language.','Give a useful recommendation.','Stay within 120–160 words.'];for(const item of checks){const row=add(check,'div','wa-reference-check-row');add(row,'span','','✓').setAttribute('aria-hidden','true');add(row,'span','',item);}
 if(includeToolkit){const k=add(d,'details','wa-reference-toolkit');add(k,'summary','','Useful language');const list=add(k,'div','wa-reference-phrases');for(const x of toolkit)add(list,'span','',x);}
 const more=add(d,'details','wa-reference-detail');add(more,'summary','','Detailed guidance');const ol=add(more,'ol','');for(const x of blueprint)add(ol,'li','',x.title+': '+x.guidance);add(more,'p','','Description and evaluation may share a paragraph. Choose a register that suits the audience. Paragraph count and balance of praise and criticism are flexible.');

 return s;
}
export function renderStructure(root,onBack,onStudio,progress,navigation){return renderPathway(root,onBack,onStudio,null,progress,navigation);}
export function renderExpression(root,onBack,onStudio,progress){return renderPathway(root,onBack,onStudio,expression,progress);}
export function renderDevelopment(root,onBack,onStudio,progress){return renderPathway(root,onBack,onStudio,development,progress);}
export function renderCohesion(root,onBack,onStudio,progress){return renderPathway(root,onBack,onStudio,cohesion,progress);}
export function renderEditing(root,onBack,onStudio,progress){return renderPathway(root,onBack,onStudio,editing,progress);}
export function renderExam(root,onBack,onStudio,progress){return renderPathway(root,onBack,onStudio,exam,progress);}
function renderPathway(root,onBack,onStudio,config,progress,navigation){
 const isExam=config===exam;
 const isExpression=config===expression, isDevelopment=config===development, hasLens=!!config;
 const editorialModels=isExam?examModels:config===editing?editingModels:config===cohesion?cohesionModels:null;
 const pathwayKey=isExam?'exam':config===editing?'editing':config===cohesion?'cohesion':isDevelopment?'development':isExpression?'expression':'structure';
 // Only the staff preview supplies local preview progress. The separate
 // enrolled student pilot retains its existing curriculum and stage contract.
 const isStructure=pathwayKey==='structure' && !!progress;
 const baseCourse=isStructure?structureR1:editorialModels?config:pathways[pathwayKey];
 const staffCourse=progress && isDevelopment?reviseDevelopmentForStaff(baseCourse):baseCourse;
 const course=progress?withStaffInteractions(staffCourse):staffCourse;
 const vocabularyCheck=progress && isExpression?vocabularyDiscoverR21:null;
 const goldTasks=[course.gold].flat();
 const practice=validateActivities(course.practice);
 const checkpoint=validateActivities([{id:pathwayKey+'-transfer',type:'choice',items:[course.analysis].flat()}])[0];
 const structureCompanions=[
  ['Start with the visit','Name the place or event and say why you went.','What does the reader need to know first?'],
  ['See how the review works','Look for details that describe something, explain an opinion or give advice.','One paragraph can do more than one job.'],
  ['Keep related details together','Put a reason or example next to the opinion it supports.','Would these details help the reader answer the same question?'],
  ['Write, compare and improve','Write your own answer first. Then compare it with the example.','Use the checklist to review your own writing.'],
  ['Write on your own','Read who you are writing for. Use the facts in the task.','Check that each paragraph keeps related details together.']
 ];
 const stageCompanions=isStructure?structureCompanions:editorialModels?course.companions:(config?.companions??companions).map((tip,index)=>index===4
  ? ['Work independently','Read the new situation carefully and apply what you learnt.','Use the criteria to reflect on your own writing.']
  : tip);
 const state={model:0,paragraph:0,identified:new Set(),discovered:new Set(),discoveryIndex:0,
  annotations:new Map(),exploreDrafts:new Map(),applyIndex:0,applications:course.apply.map(isExam?newExamAttempt:newWritingRun),
  attempts:new Map(),active:null,discoverNotes:new Map(),goldIndex:0,gold:goldTasks.map(newWritingRun),transfer:newWritingRun(),mockIndex:0,mocks:examMocks.map(newExamAttempt)};
 const gold={id:pathwayKey+'-writing',title:course.goldTitle??goldTasks[0].title,level:'Gold'};
 const challenges=[...practice,gold];
 const baseModels=[{...model,category:'Café',sentenceTips:[['Names the café, establishes the time and explains the reason for visiting.','Introduces an initial evaluation through the atmosphere and welcome.'],['Describes location, seating and menu.','Provides specific examples of food.','Evaluates affordability for students.'],['Balances crowding with praise for staff.','Balances a specific delay against food quality.','Explains the practical benefit of a quiet corner.'],['Identifies a suitable audience and reason.','Offers advice about timing.']],purposes:['Introduction','Description','Evaluation','Recommendation']},{...guidedTask,title:'Willow Kitchen',category:'Restaurant',purposes:['Introduction','Evaluation','Evaluation','Recommendation'],sentenceTips:[['Establishes the reason for visiting.','Adds useful location and price information.'],['States a clear preference.','Supports the judgement with sensory detail.','Explains why the portion was suitable.','Adds a specific example of flexibility.'],['Signals a shift to criticism.','Explains the wait and the effect of noise.'],['Identifies an audience and a reason.','Offers practical advice addressing the drawback.']]},...extraReviewModels];
 const models=isDevelopment?config.developmentModels(baseModels):isExpression?config.expressionModels(baseModels):baseModels;
 const workshopOptions={plainLanguage:isStructure,staffAssessment:!!progress};
 const practiceRecognition=progress?practice.flatMap(activity=>activity.items)
  .filter(item=>item.checkedPractice):[];
 const recognition=[
  ...(isStructure?[...structureDiscover,...Object.values(structureExplore).flat()]:[]),
  ...(vocabularyCheck?[vocabularyCheck]:[]),
  ...practiceRecognition.flatMap(item=>item.correction?[item,item.correction]:[item])
 ];
 if(recognition.length)state.recognition=new Map();
 const content={recognition,discover:course.discover,models,activities:[...practice,checkpoint],
  gold:goldTasks,apply:isExam?[]:course.apply,master:isExam?null:course.master,challenges:challenges.map(a=>a.id)};
 let saved=progress?.load(pathwayKey)??null;
 restorePreview(state,content,saved);
 const recognitionDone=item=>recognitionResult(item,state.recognition.get(item.id))!=='pending';
 const discoverComplete=()=>structureDiscover.every(recognitionDone);
 const exploreComplete=()=>Object.values(structureExplore).some(items=>items.every(recognitionDone));
 if(isStructure && saved){
  saved={...saved,completed:saved.completed.filter(stage=>stage!=='discover'&&stage!=='explore')};
  if(discoverComplete())saved.completed.push('discover');
  if(exploreComplete())saved.completed.push('explore');
 }
 if(saved && vocabularyCheck && !recognitionDone(vocabularyCheck)){
  state.discovered.delete(course.discover.findIndex(item=>item.id===vocabularyCheck.id));
  saved={...saved,completed:saved.completed.filter(stage=>stage!=='discover')};
 }
 if(saved && progress){
  saved={...saved,completed:saved.completed.filter(stage=>{
   if(stage==='practise')return practice.filter(a=>a.items.some(item=>item.version===2)).every(a=>state.attempts.get(a.id)?.done);
   if(stage==='master' && isDevelopment)return !!state.attempts.get(checkpoint.id)?.done;
   return true;
  })};
 }
 function recognise(host,item,onCheck){
  if(!state.recognition.has(item.id))state.recognition.set(item.id,recognitionRun(item));
  return renderRecognition(host,item,state.recognition.get(item.id),onCheck);
 }
 const save=position=>{
  if(isExam)position.completed=position.completed.filter(stage=>stage!=='apply'&&stage!=='master');
  const snapshot=capturePreview(state,content,position);
  return !!snapshot && progress.save(pathwayKey,snapshot);
 };
 const hasFinished = a => !!state.attempts.get(a.id)?.done;
 function quiz(host,a,onFinish){
  let run=state.attempts.get(a.id);
  if(!run){
   run={index:0,correct:0,selected:null,order:[],checked:false,done:false,answered:new Map(),
    displays:a.items.map(item=>shuffledIndexes(item.options.length))};
   state.attempts.set(a.id,run);
  }
  function draw(moveFocus=false){
   host.replaceChildren();
   el(host,'p','wa-kicker',a.level ? a.level+' / '+a.title : 'Analysis');
   if(run.done){
    const done=el(host,'h3','','Analysis complete');
    done.tabIndex=-1;
    el(host,'p','wa-score',run.correct+' / '+a.items.length+' objective decisions correct');
    const checked=a.items.filter(item=>item.checkedPractice).flatMap(item=>item.correction?[item,item.correction]:[item]);
    if(checked.length){
     const results=checked.map(item=>recognitionResult(item,state.recognition.get(item.id)));
     const counts=['first','retry','supported'].map(value=>results.filter(result=>result===value).length);
     el(host,'p','wa-muted','Checked steps: '+counts[0]+' correct independently, '+counts[1]+' correct after feedback, '+counts[2]+' completed with support.');
    }
    if(a!==checkpoint)action(host,'Try again',()=>{
     state.attempts.delete(a.id);
     for(const item of a.items){
      state.recognition?.delete(item.id);
      if(item.correction)state.recognition?.delete(item.correction.id);
     }
     onFinish();
     quiz(host,a,onFinish);
     host.querySelector('h3').focus();
    });
    if(moveFocus)done.focus();
    return;
   }
   const item=a.items[run.index];
   const ordered=a.type==='order';
   const display=run.displays[run.index];
   el(host,'p','wa-muted','Question '+(run.index+1)+' of '+a.items.length);
   function advance(response){
    run.answered.set(item.id,response);
    const next=a.items.findIndex(question=>!run.answered.has(question.id));
    run.index=next<0?a.items.length:next;
    run.checked=false;
    run.selected=null;
    run.order=[];
    if(run.index===a.items.length)run.done=true;
    draw(true);
    if(run.done)onFinish();
   }
   const nextLabel=run.answered.size+1===a.items.length?'Finish analysis':'Next question';
   if(practiceRecognition.includes(item)){
    const question=el(host,'div','wa-interaction-question');
    question.dataset.questionId=item.id;
    const prompt=recognise(question,item,sync);
    const follow=el(host,'div','wa-interaction-followup');
    function sync(){
     if(!recognitionDone(item))return;
     if(item.correction && !follow.childElementCount){
      el(follow,'h4','','Choose a correction');
      recognise(follow,item.correction,sync);
     }
     if(item.correction && !recognitionDone(item.correction))return;
     if(host.querySelector('[data-recognition-next]'))return;
     const next=action(host,nextLabel,()=>{
      const response=item.optionIds.indexOf(state.recognition.get(item.id).attempts.at(-1));
      if(scoreItem(item,response))run.correct++;
      advance(response);
     },'wa-action wa-next');
     next.dataset.recognitionNext='';
    }
    sync();
    if(moveFocus)prompt.focus();
    return;
   }
   const prompt=renderQuestionPrompt(host,item,!!progress);
   prompt.tabIndex=-1;
   const hasSequence=ordered && !!progress;
   if(hasSequence)renderSentenceSequence(host,item,display,run,draw);
   const options=hasSequence?null:el(host,'div','wa-options');
   const feedback=el(host,'div','wa-answer');
   feedback.setAttribute('role','status');
   if(options)display.forEach(i=>{
    const position=run.order.indexOf(i);
    const button=action(options,(ordered&&position>=0?(position+1)+'. ':'')+item.options[i],()=>{
     if(ordered)run.order.push(i);
     else run.selected=i;
     draw();
     const selected=optionButtonsAfterDraw(i);
     selected?.focus();
    },'wa-action wa-option');
    button.dataset.option=String(i);
    button.disabled=ordered&&position>=0;
    if(!ordered)button.setAttribute('aria-pressed',String(run.selected===i));
    button.disabled=button.disabled||run.checked;
   });
   function optionButtonsAfterDraw(index){
    return host.querySelector('[data-option="'+index+'"]:not(:disabled)')
     || host.querySelector('.wa-option:not(:disabled)') || host.querySelector('.wa-next:not(:disabled)');
   }
   const response=ordered?run.order:run.selected;
   if(run.checked){
    const ok=scoreItem(item,response);
    feedback.dataset.result=ok?'correct':'retry';
    if(hasSequence)feedback.dataset.evidence=ok?'correct-independently':'completed-with-support';
    el(feedback,'p','',ok?'That fits the criterion.':hasSequence?'Compare with the example order below.':'Review the reasoning below.');
    if(hasSequence && !ok){
     const solution=el(feedback,'ol','wa-sequence-list');
     for(const index of item.answer)el(solution,'li','',item.options[index]);
    }
    if(item.explanations){
     const reasons=el(feedback,'ul','');
     display.forEach(index=>{
      const reason=el(reasons,'li','');
      el(reason,'strong','',item.options[index]+' ');
      reason.append(item.explanations[index]);
     });
    }else el(feedback,'p','',item.rationale);
    action(host,nextLabel,()=>advance(response),'wa-action wa-next');
    if(moveFocus){feedback.tabIndex=-1;feedback.focus();}
   }else{
    const check=action(host,'Check answer',()=>{
     run.checked=true;
     if(scoreItem(item,response))run.correct++;
     draw(true);
    },'wa-action wa-next');
    check.disabled=ordered?run.order.length!==item.options.length:run.selected===null;
    if(ordered)action(host,'Undo last selection',()=>{
    const removed=run.order.pop();
    draw();
    (host.querySelector('[data-option="'+removed+'"]:not(:disabled)')??host.querySelector('.wa-option:not(:disabled)'))?.focus();
   }).disabled=!run.order.length;
    if(moveFocus)prompt.focus();
   }
  }
  draw();
 }
 mountLesson(root,{...navigation,title:course.title??(isDevelopment?'Idea Development':isExpression?'Vocabulary & Expression':'Structure & Organisation'),pathwayNumber:course.number??(isDevelopment?'03':isExpression?'02':'01'),artwork:reviewArtwork.pathways[pathwayKey]??reviewArtwork.pathways.structure,onBack,reference:renderExamReference,companions:stageCompanions,checkpoint:saved,onCheckpoint:progress?save:null,renderStage(body,i,ctx){
 const shell=body.closest('.wa-shell');
 shell.toggleAttribute('data-structure-r1',isStructure);
 shell.classList.toggle('wa-independent-stage',isExam&&i===4);
 if(progress && isExam && i>=3)el(body,'p','wa-muted','Exam workshop responses and timers last for this visit.');

 if(course.passes && (isExam?i===0:[0,3,4].includes(i))){
  const guide=el(body,'details','wa-explore-brief wa-editing-passes');
  el(guide,'summary','','Four-pass editing strategy');
  const steps=el(guide,'ol','');
  for(const [name,description] of course.passes){
   const step=el(steps,'li','');
   el(step,'strong','',name+'. ');
   step.append(description);
  }
  el(guide,'p','wa-muted','Use these passes to check your draft. Give the most time to the weakness that most affects the reader.');
 }
 if(i===0){
 const host=el(body,'div','wa-discovery');
 function draw(){
  host.replaceChildren();
  const n=state.discoveryIndex,item=course.discover[n];
  el(host,'p','wa-kicker',(isStructure?'Example ':'Contrast ')+(n+1)+' / '+course.discover.length);
  let prompt;
  const checkedVocabulary=item.id===vocabularyCheck?.id;
  if(!isStructure && !checkedVocabulary){
   prompt=el(host,'h3','',item.prompt);
   prompt.tabIndex=-1;
  }
  const contrast=el(host,'div','wa-options');
  el(contrast,'p','wa-apply-source',(isStructure?'First: ':'')+item.before);
  el(contrast,'p','wa-apply-source',(isStructure?'Second: ':'')+item.after);
  function recordReflection(){
   state.discovered.add(n);
   if(state.discovered.size===course.discover.length)ctx.complete();
  }
  if(isStructure){
   prompt=recognise(host,structureDiscover[n],()=>{if(discoverComplete())ctx.complete();});
  }else if(checkedVocabulary){
   prompt=recognise(host,vocabularyCheck,()=>{if(recognitionDone(vocabularyCheck))recordReflection();});
  }else{
   const label=el(host,'label','wa-apply-instruction','Answer the question above in a short phrase or sentence (at least three words).');
   const response=el(label,'textarea','wa-writing-input wa-apply-input');
   response.rows=2;
   response.value=state.discoverNotes.get(n)??'';
   response.readOnly=state.discovered.has(n);
   response.oninput=()=>state.discoverNotes.set(n,response.value);
   const feedback=el(host,'p','wa-answer');
   feedback.setAttribute('role','status');
   const reveal=action(host,'Check what changed',()=>{
    if(!hasWritingAttempt(response.value,3)){
     feedback.textContent='Use at least three words to answer the question above.';
     return;
    }
    recordReflection();
    response.readOnly=true;
    reveal.hidden=true;
    feedback.textContent=(progress?'Compared with an example · self-review. ':'')+item.principle;
    feedback.tabIndex=-1;
    feedback.focus();
   });
   reveal.hidden=response.readOnly;
   if(response.readOnly)feedback.textContent=(progress?'Compared with an example · self-review. ':'')+item.principle;
  }
  const controls=el(host,'div','wa-stage-foot');
  const prev=action(controls,'← Previous contrast',()=>{state.discoveryIndex--;draw().focus();});
  prev.disabled=n===0;
  const next=action(controls,'Next contrast →',()=>{state.discoveryIndex++;draw().focus();});
  next.disabled=n===course.discover.length-1;
  return prompt;
 }draw();
 }else if(i===1){
 const desk=el(body,'div','wa-explore-desk');
 el(desk,'p','wa-explore-intro',isStructure?'Read the paragraph and choose an answer. You can select any sentence for a note. Finish all questions in one review to complete Explore.':'Read the paragraph and answer the question below it. Then compare your answer with the editor’s note and select a sentence to see how it works.');
 if(isExam)el(desk,'p','wa-muted','Answer the questions for any three paragraphs. Read the full review alongside the writing task.');
 const toolbar=el(desk,'div','wa-explore-toolbar');
 const picker=el(toolbar,'details','wa-explore-picker');
 const trigger=el(picker,'summary','wa-explore-picker-trigger');
 const menu=el(picker,'div','wa-explore-picker-menu');
 const icons={'Café':'☕','Restaurant':'🍴','Film':'▣','Book':'▤','Music festival':'♫','Attraction':'◇','Video game':'✣','Museum':'⌂'};
 const host=el(desk,'div','wa-model-explorer');
 let briefOpen=true;
 function updatePicker(){const m=models[state.model];trigger.replaceChildren();const icon=el(trigger,'span','wa-explore-category-icon',icons[m.category]||'▤');icon.setAttribute('aria-hidden','true');const copy=el(trigger,'span','wa-explore-picker-copy');el(copy,'span','wa-explore-eyebrow',m.category+' review');el(copy,'strong','',m.title);el(trigger,'span','wa-explore-chevron','⌄').setAttribute('aria-hidden','true');menu.querySelectorAll('button').forEach((b,j)=>b.setAttribute('aria-pressed',String(j===state.model)));}
 models.forEach((m,j)=>{const b=action(menu,'',()=>{state.model=j;state.paragraph=0;picker.open=false;briefOpen=true;updatePicker();draw();trigger.focus();},'wa-action wa-explore-model-choice');el(b,'span','wa-explore-category-icon',icons[m.category]||'▤').setAttribute('aria-hidden','true');const copy=el(b,'span','');el(copy,'strong','',m.title);el(copy,'small','',m.category+' review');});
 // Dismiss on outside pointer interaction; detach when the stage is removed.
 const doc=picker.ownerDocument;
 const dismiss=e=>{if(picker.open&&!picker.contains(e.target))picker.open=false;};
 const observer=new doc.defaultView.MutationObserver(()=>{if(!picker.isConnected){doc.removeEventListener('pointerdown',dismiss,true);observer.disconnect();}});
 doc.addEventListener('pointerdown',dismiss,true);
 observer.observe(doc.documentElement,{childList:true,subtree:true});
 picker.addEventListener('keydown',e=>{if(e.key==='Escape'&&picker.open){picker.open=false;trigger.focus();}});
 function draw(){
  host.replaceChildren();const m=models[state.model],n=state.paragraph,key=state.model+':'+n;
  const brief=el(host,'details','wa-explore-brief');brief.open=briefOpen;el(brief,'summary','','Exam brief');el(brief,'p','',m.prompt);
  if(isExam){
   const [audience,publication]=modelContext[m.title];
   el(brief,'p','wa-muted','Audience: '+audience+' · Publication: '+publication);
   el(brief,'p','wa-muted','Content: relevance, task fulfilment, development, audience and purpose. Language: vocabulary, grammar, organisation, cohesion and register.');
  }
  brief.addEventListener('toggle',()=>{briefOpen=brief.open;});
  const paper=el(host,'article','wa-explore-paper');const meta=el(paper,'div','wa-explore-paper-meta');el(meta,'span','wa-explore-eyebrow','MODEL '+String(state.model+1).padStart(2,'0')+' / '+m.category.toUpperCase());el(meta,'span','wa-explore-position','Paragraph '+(n+1)+' of '+m.paragraphs.length);
  el(paper,'h3','wa-explore-headline',m.title);
  const progress=el(paper,'div','wa-explore-progress');progress.setAttribute('aria-hidden','true');m.paragraphs.forEach((_,j)=>{const segment=el(progress,'span','');segment.dataset.current=String(j===n);segment.dataset.done=String(isStructure?recognitionDone(structureExplore[m.id][j]):state.identified.has(state.model+':'+j));});
  const prose=el(paper,'p','wa-model-text wa-explore-prose');
  const pieces=m.paragraphs[n].match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)||[m.paragraphs[n]];
  const selected=state.annotations.get(key)||new Set();state.annotations.set(key,selected);
  const note=el(paper,'div','wa-explore-note');el(note,'span','wa-explore-eyebrow',isStructure?'SENTENCE NOTE':'EDITOR’S NOTE');const detail=el(note,'p','','Write your editorial note to open the sentence annotations.');detail.setAttribute('role','status');
  const lens=editorialModels?.[m.title][n]??m.expression?.[n];const sentenceTips=hasLens?pieces.map((sentence,j)=>sentence.toLowerCase().includes(lens.phrase.toLowerCase())?lens.rationale:(isDevelopment||editorialModels)?m.sentenceTips?.[n]?.[j]||'Consider what this detail adds to the judgement.':'Read this sentence in context. Look for precise, natural word combinations.'):m.sentenceTips?.[n];let unlocked=isStructure||state.identified.has(key);const sentenceButtons=[];
  pieces.forEach((sentence,j)=>{const b=el(prose,'span','wa-phrase wa-explore-sentence',sentence.trim());b.setAttribute('role','button');b.tabIndex=unlocked?0:-1;b.setAttribute('aria-disabled',String(!unlocked));const activate=()=>{if(!unlocked)return;selected.clear();selected.add(j);sentenceButtons.forEach((item,k)=>item.setAttribute('aria-pressed',String(k===j)));detail.textContent=sentenceTips?.[j]||m.notes[n];};b.onclick=activate;b.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate();}};b.setAttribute('aria-pressed',String(selected.has(j)));sentenceButtons.push(b);prose.append(' ');});
  if(unlocked)detail.textContent=selected.size?(sentenceTips?.[[...selected][0]]||m.notes[n]):'Select a sentence to see what it adds to the paragraph.';
  const question=el(host,'section','wa-explore-question');
  if(isStructure){
   const item=structureExplore[m.id][n];
   recognise(question,item,()=>{
    if(recognitionDone(item))progress.children[n].dataset.done='true';
    if(exploreComplete())ctx.complete();
   });
  }else{
  const editorialPrompt=editorialModels?lens.prompt:isExpression
   ? 'Find “'+lens.phrase+'” in context. Write a replacement phrase. Explain one difference in meaning, how strongly it expresses the opinion, or how formal it sounds.'
   : isDevelopment
    ? 'Find “'+lens.phrase+'” in context. Name an opinion in the paragraph that this detail helps explain, or say what decision it helps readers make.'
    : [
     'Imagine swapping the first and last sentences. Say what the reader would learn first and how that would change the way they understand the rest of the paragraph.',
     'Name two details that belong together. Explain what the reader can understand by reading them side by side.',
     'Choose one sentence and imagine putting it in a paragraph on its own. Name another sentence it connects to and explain what would be harder to understand if you separated them.'
    ][(n+state.model)%3];
  const label=el(question,'label','wa-question-prompt',editorialPrompt);
  const minimum=lens?.min??10;
  el(label,'span','wa-muted',' Use at least '+minimum+' words.');
  const response=el(label,'textarea','wa-writing-input wa-apply-input');
  response.rows=3;
  response.value=state.exploreDrafts.get(key)??'';
  response.readOnly=unlocked;
  response.oninput=()=>state.exploreDrafts.set(key,response.value);
  const feedback=el(question,'p','wa-answer');
  feedback.setAttribute('role','status');
  const reveal=action(question,'Compare with the editor’s note',()=>{
   if(!hasWritingAttempt(response.value,minimum)){
    feedback.textContent='Use at least '+minimum+' words to answer the question above.';
    return;
   }
   state.identified.add(key);
   unlocked=true;
   response.readOnly=true;
   reveal.hidden=true;
   sentenceButtons.forEach(button=>{button.tabIndex=0;button.setAttribute('aria-disabled','false');});
   progress.children[n].dataset.done='true';
   detail.textContent='Select a sentence to see what it adds to the paragraph.';
   feedback.textContent=(progress?'Compared with an example · self-review. ':'')+(lens?.rationale??m.notes[n]);
   if(isExam?state.identified.size>=3:m.paragraphs.every((_,j)=>state.identified.has(state.model+':'+j)))ctx.complete();
  });
  reveal.hidden=unlocked;
  if(unlocked)feedback.textContent=(progress?'Compared with an example · self-review. ':'')+(lens?.rationale??m.notes[n]);
  }
  const controls=el(host,'div','wa-stage-foot wa-explore-controls');const prev=action(controls,'← Previous paragraph',()=>{state.paragraph--;draw();host.querySelector('.wa-explore-headline').focus();});prev.disabled=n===0;const next=action(controls,'Next paragraph →',()=>{state.paragraph++;draw();host.querySelector('.wa-explore-headline').focus();});next.disabled=n===m.paragraphs.length-1;paper.querySelector('h3').tabIndex=-1;
  const full=el(host,'details','wa-explore-full');el(full,'summary','','Read complete model');for(const p of m.paragraphs)el(full,'p','wa-explore-full-prose',p);el(full,'p','wa-muted','Original teaching model, not examiner-marked. '+m.paragraphs.join(' ').trim().split(/\s+/).length+' words.');
 }
 updatePicker();draw();
 }else if(i===2){
 const desk=el(body,'div','wa-practise-desk');
 el(desk,'p','wa-practise-intro','Choose a challenge. Finish all five to complete this stage.');
 const header=el(desk,'div','wa-practise-library-header');el(header,'span','wa-practise-eyebrow','CHALLENGE LIBRARY');const count=el(header,'span','wa-practise-count');
 const cards=el(desk,'div','wa-practise-library');const host=el(desk,'div','wa-question wa-practise-question');
 const icons=['◎','↕','✎','▤','✦'];const buttons=[];
 const complete=a=>a===gold ? goldTasks.every((task,j)=>writingComplete(state.gold[j],task)) : hasFinished(a);
 function syncCards(){
  count.textContent=challenges.filter(complete).length+' / '+challenges.length+' complete';
  buttons.forEach((button,j)=>{
   const a=challenges[j];
   button.setAttribute('aria-pressed',String(state.active===a.id));
   button.dataset.done=String(complete(a));
   button.querySelector('.wa-practise-card-status').textContent=complete(a)?'✓ Complete':a===gold?(goldTasks.length>1?goldTasks.length+' writing tasks':'Writing task'):a.items.length+' decision'+(a.items.length===1?'':'s');
  });
  if(challenges.every(complete))ctx.complete();
  else ctx.incomplete();
 }
 function open(a,focus=false){
  state.active=a.id;
  if(a===gold){
   if(goldTasks.length===1)renderResponseWorkshop(host,goldTasks[0],state.gold[0],syncCards,workshopOptions);
   else renderGold();
  }
  else quiz(host,a,syncCards);
  syncCards();
  if(focus){const heading=host.querySelector('h3');heading.focus({preventScroll:true});}
 }
 function renderGold(focus=false){
  host.replaceChildren();
  const index=state.goldIndex;
  el(host,'p','wa-kicker','Gold · Task '+(index+1)+' of '+goldTasks.length);
  const workshop=el(host,'div','wa-apply-work');
  const title=renderResponseWorkshop(workshop,goldTasks[index],state.gold[index],syncCards,workshopOptions);
  const controls=el(host,'div','wa-stage-foot');
  action(controls,'← Previous Gold task',()=>{state.goldIndex--;renderGold(true);}).disabled=index===0;
  action(controls,'Next Gold task →',()=>{state.goldIndex++;renderGold(true);}).disabled=index===goldTasks.length-1;
  if(focus)title.focus({preventScroll:true});
 }
 challenges.forEach((a,j)=>{
  const button=action(cards,'',()=>open(a,true),'wa-action wa-practise-card');
  button.dataset.level=a.level.toLowerCase();
  const top=el(button,'span','wa-practise-card-top');
  el(top,'span','wa-practise-icon',icons[j]).setAttribute('aria-hidden','true');
  el(top,'span','wa-practise-level',a.level);
  el(button,'strong','wa-practise-card-title',a.title);
  el(button,'span','wa-practise-card-status');
  buttons.push(button);
 });
 if(state.active)open(challenges.find(a=>a.id===state.active));
 else{syncCards();el(host,'p','wa-practise-empty','Select a challenge above to begin.');}
 }else if(i===3){
 const host=el(body,'div','wa-apply-work wa-apply-desk');
 function draw(){
  host.replaceChildren();
  const n=state.applyIndex;
  const header=el(host,'div','wa-apply-header');
  el(header,'span','wa-apply-eyebrow','Writing workshop');
  el(header,'span','wa-apply-position','Task '+(n+1)+' of '+course.apply.length);
  const meter=el(host,'div','wa-apply-progress');
  meter.setAttribute('aria-hidden','true');
  course.apply.forEach((_,j)=>{el(meter,'span','').dataset.current=String(j===n);});
  const workshop=el(host,'div','');
  function progress(){
   const done=course.apply.map((task,j)=>isExam?state.applications[j].complete:writingComplete(state.applications[j],task));
   done.forEach((value,j)=>{meter.children[j].dataset.done=String(value);});
   if(done.every(Boolean))ctx.complete();
   else ctx.incomplete();
  }
  const attempt=state.applications[n];
  const title=isExam?renderExamWorkshop(workshop,course.apply[n],attempt,{
   passes:course.passes,onProgress:complete=>{attempt.complete=complete;progress();}
  }):renderResponseWorkshop(workshop,course.apply[n],attempt,progress,workshopOptions);
  progress();
  const controls=el(host,'div','wa-stage-foot wa-apply-controls');
  const prev=action(controls,'← Previous task',()=>{state.applyIndex--;draw().focus();});
  prev.disabled=n===0;
  const next=action(controls,'Next task →',()=>{state.applyIndex++;draw().focus();});
  next.disabled=n===course.apply.length-1;
  return title;
 }draw();
 }else if(isExam){
 const desk=el(body,'div','wa-master-desk');
 const decision=el(desk,'div','wa-question wa-master-question');
 const writing=el(desk,'div','wa-apply-work wa-exam-workshop');
 function showMock(){
  if(!hasFinished(checkpoint))return;
  writing.replaceChildren();
  const label=el(writing,'label','wa-apply-instruction','Mock review task');
  const picker=el(label,'select','wa-writing-input');
  examMocks.forEach((task,index)=>{
   const option=el(picker,'option','',task.title);
   option.value=String(index);
  });
  picker.value=String(state.mockIndex);
  picker.onchange=()=>{state.mockIndex=Number(picker.value);showMock();writing.querySelector('select').focus();};
  const mock=examMocks[state.mockIndex];
  const attempt=state.mocks[state.mockIndex];
  renderExamWorkshop(el(writing,'div',''),{...mock,timer:true},attempt,{
   master:true,passes:course.passes,
   onProgress:complete=>{
    attempt.complete=complete;
    if(state.mocks.some(item=>item.complete))ctx.complete();
    else ctx.incomplete();
    return ctx.allComplete();
   },
   onStudio:()=>onStudio({initialTask:independentTask.id,initialMode:'Gold'})
  });
 }
 quiz(decision,checkpoint,showMock);
 showMock();
 }else{
 const desk=el(body,'div','wa-master-desk');
 el(desk,'p','wa-master-intro','Answer the question first. Then use the same writing skill in a new review task.');
 const decision=el(desk,'div','wa-question wa-master-question');
 const writing=el(desk,'div','wa-apply-work');
 function showWriting(){
  if(!hasFinished(checkpoint))return;
  renderResponseWorkshop(writing,course.master,state.transfer,complete=>{
   if(complete)ctx.complete();
   else ctx.incomplete();
  },workshopOptions);
 }
 quiz(decision,checkpoint,()=>{
  showWriting();
 });
 showWriting();
 const end=el(desk,'details','wa-master-studio');
 const summary=el(end,'summary','');
 el(summary,'strong','','Write a full review in Writing Studio');
 const content=el(end,'div','wa-master-studio-content');
 el(content,'p','',independentTask.prompt);
 action(content,'Open Writing Studio →',()=>onStudio({initialTask:independentTask.id,initialMode:'Gold'}),'wa-action wa-master-launch');
 }
 }});
}
