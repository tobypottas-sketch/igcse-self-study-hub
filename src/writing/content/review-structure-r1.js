import {pathways} from './review-pedagogy.js?v=6';

// Copy edits preserve scoring, option identities and the writing task contracts.
const revisions = {
 'structure-focus': {
   "title": "Match details to the main idea"
 },
 'pedagogy-q-001': {
   "prompt": "Groups can book seats together online. They can see the row letters from the entrance, and a member of staff helps them find their seats. Which heading fits all three details?"
 },
 'pedagogy-q-002': {
   "prompt": "Beginners can try kayaking without buying equipment. Which detail supports this point?"
 },
 'pedagogy-extra-q-1': {
   "prompt": "Which detail shows how visitors find their way around the library?",
   "explanations": [
     "Laptop loans support a point about resources.",
     "The signs help visitors find the right floor.",
     "Lighting supports a point about study conditions."
   ],
   "rationale": "The signs help visitors find the right floor."
 },
 'pedagogy-extra-q-2': {
   "prompt": "The coach shows beginners what to do, lets them practise and gives each person advice. Which first sentence fits all three details?",
   "explanations": [
     "Showing, practising and giving advice all help beginners feel more confident.",
     "Equipment is not the focus of these details.",
     "Individual advice does not establish that the sport is individual."
   ],
   "rationale": "Showing, practising and giving advice all help beginners feel more confident."
 },
 'structure-order': {
   "title": "Put the sentences in order"
 },
 'pedagogy-q-003': {
   "prompt": "Put the sentences in order. Start with what the group did first."
 },
 'pedagogy-q-004': {
   "prompt": "Put the sentences in order. Show how the group missed the start of the tour."
 },
 'pedagogy-extra-q-3': {
   "prompt": "Put the sentences in order. Start with what the guide handed out."
 },
 'pedagogy-extra-q-4': {
   "prompt": "Put the sentences in order. Give the reason before the advice."
 },
 'structure-plan': {
   "title": "Group related ideas"
 },
 'pedagogy-q-005': {
   "prompt": "Can students visit after school? What will they learn? The gallery is near a bus stop, closes at five, has student guides and lets visitors handle copies of old tools. Which plan groups the details best?"
 },
 'pedagogy-extra-q-5': {
   "prompt": "A theatre offers discounted tickets, captions at evening shows, a free programme and clear sound from the speakers. Which plan separates value for money from following the dialogue?",
   "explanations": [
     "The discount and programme show value for money. Captions and clear sound help people follow the dialogue.",
     "Both groups mix cost and hearing information.",
     "Clear sound helps people follow the actors. The free programme belongs with ticket value."
   ],
   "rationale": "The discount and programme show value for money. Captions and clear sound help people follow the dialogue."
 },
 'pedagogy-extra-q-6': {
   "prompt": "Which plan helps readers judge how well the photography course was taught?",
   "explanations": [
     "Rooms and times can help planning but do not address teaching.",
     "Readers learn what the sessions were like and how the teaching helped.",
     "Repeating the same detail takes space without developing the judgement."
   ],
   "rationale": "Readers learn what the sessions were like and how the teaching helped."
 },
 'pedagogy-extra-q-7': {
   "prompt": "One paragraph covers studying at a café: quiet seats, sockets and dim lighting. The next covers food prices. Where should you mention that visitors can borrow lamps?",
   "explanations": [
     "A lamp helps with dim lighting, so put those details together.",
     "Borrowing a lamp does not establish food value.",
     "The opening would introduce a detail before its purpose is clear."
   ],
   "rationale": "A lamp helps with dim lighting, so put those details together."
 },
 'structure-diagnose': {
   "title": "Find the sentence that doesn’t fit"
 },
 'pedagogy-q-006': {
   "prompt": "“You can borrow a racket at reception. The court lights are bright enough for evening practice. A deposit is returned when you bring the racket back.” Where should the sentence about the lights go?"
 },
 'pedagogy-extra-q-8': {
   "prompt": "“The tutor explained the controls clearly. The entrance costs ¥30. We then managed to operate the camera independently.” Where should the price go?",
   "explanations": [
     "The teaching sequence is intact, but the price remains outside its focus.",
     "Repeating the price introduces a second distraction.",
     "Keep the explanation next to what students could do afterwards. Put the price with other cost details."
   ],
   "rationale": "Keep the explanation next to what students could do afterwards. Put the price with other cost details."
 },
 'pedagogy-extra-q-9': {
   "prompt": "“I recommend the café to students in a hurry. Our takeaway order arrived in five minutes. The seats beside the window were comfortable.” Which edit makes the advice more useful for students in a hurry?",
   "options": [
     "Keep the advice, waiting time and seating together.",
     "Keep the advice and waiting time together. Move the seating detail.",
     "Move the quick order to the introduction and end with the seating."
   ],
   "explanations": [
     "The seating detail does not support the recommendation about speed.",
     "The five-minute wait supports advice about speed. The seats tell readers about comfort.",
     "Moving the evidence makes the recommendation harder to justify."
   ],
   "rationale": "The five-minute wait supports advice about speed. The seats tell readers about comfort."
 },
 'pedagogy-extra-q-10': {
   "prompt": "A paragraph explains that the museum's labels are clear but its map is confusing. The next paragraph starts “This makes it ideal for first-time visitors.” Which change gives first-time visitors the clearest advice?",
   "options": [
     "Explain that the labels help, but the map may be hard to follow.",
     "Move the sentence to the beginning without changing it.",
     "Add “Overall” before the sentence."
   ],
   "explanations": [
     "This says which feature helps visitors and which may cause problems.",
     "Moving the sentence leaves its basis unclear.",
     "A connector alone does not establish what supports the recommendation."
   ],
   "rationale": "This says which feature helps visitors and which may cause problems."
 },
 'pedagogy-task-001': {
   "title": "Group details in a hall review",
   "question": "Write two short paragraphs for a school club.\n1. Explain how to get to the hall and collect the booking. Put your advice next to the reason for it.\n2. Describe the rehearsal room and explain how the mirrors helped.",
   "checks": [
     "I kept the travel and booking details together.",
     "I explained how the mirrors helped in a separate paragraph.",
     "I linked my advice to the booking delay."
   ]
 },
 'pedagogy-task-016': {
   "question": "Write two short paragraphs for next year’s science club.\n1. Say when to arrive and why.\n2. Explain what worked well about the show.\n3. Use all five facts from the notes.",
   "example": "The hall opens at ten and collecting tickets took fifteen minutes. I would arrive when it opens so there is enough time before the show starts at 10:30.\n\nThe show suited our science club because the presenter answered questions about planets. Even from the back, we had a clear view of the dome.",
   "checks": [
     "I kept the opening time, ticket collection and start time together.",
     "I explained why students need to arrive early.",
     "I used both facts about the show to explain why it suited the club."
   ]
 },
 'pedagogy-task-002': {
   "question": "Use full sentences to plan two parts of a school newsletter review.\n1. Say when to arrive and why.\n2. Say what visitors can see and learn at the feeding talk.",
   "checks": [
     "I kept arrival advice and the feeding talk in separate parts.",
     "I placed the timing details together.",
     "I explained what visitors can get from the talk."
   ]
 },
 'pedagogy-task-003': {
   "title": "Choose details for a first-time player",
   "checks": [
     "Both facts help someone decide whether to try VR.",
     "I kept the two details about beginner play together.",
     "I explained why a feature matters."
   ]
 },
 'pedagogy-task-004': {
   "title": "End with useful advice",
   "checks": [
     "My advice follows from the notes.",
     "I named the readers who would benefit.",
     "I warned readers that beginners may have to wait."
   ]
 },
 'pedagogy-q-007': {
   "prompt": "The notes cover booking seats, seeing the stage, collecting tickets and hearing the actors. Which plan separates booking from watching the show?",
   "options": [
     "Reserving seats with hearing the actors; collecting tickets with seeing the stage.",
     "Reserving seats with collecting tickets; seeing the stage with hearing the actors.",
     "Reserving seats with seeing the stage; collecting tickets with hearing the actors."
   ]
 },
 'pedagogy-task-005': {
   "question": "Write for students preparing a podcast.\n1. Say which two kinds of detail the draft mixes.\n2. Rewrite it in two paragraphs. Group related details and keep all five facts.\n3. Check that your advice fits the recording experience.",
   "checks": [
     "I named the two kinds of detail the draft mixes.",
     "I kept related details together.",
     "My advice fits what happened during recording."
   ]
 }
};

const revise = item => ({...item,...revisions[item.id]});
const source = pathways.structure;
export const structureR1 = {
 ...source,
 practice:source.practice.map(activity=>({...revise(activity),items:activity.items.map(revise)})),
 gold:source.gold.map(revise),
 apply:source.apply.map(revise),
 analysis:revise(source.analysis),
 master:revise(source.master)
};
