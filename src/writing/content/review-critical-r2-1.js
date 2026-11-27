import {recognitionQuestion} from '../engine/recognition.js';

const revisions = [
 ['pedagogy-q-019',
  'The robotics showcase is a five-minute walk from the bus stop. Your readers can arrive at 4:15 and must catch the 5:30 bus. The demonstration runs from 4:30 to 5:00. The hands-on session runs from 5:15 to 5:40, and visitors need to stay until the end to finish their robot.',
  'Which advice helps these students finish an activity and catch the bus?', 'demo-v2', [
   ['both-v2', 'Go to both and leave at 5:25 so you can finish your robot and catch the bus.', 'Leaving at 5:25 gives you time to walk to the stop, but the robot session does not finish until 5:40.'],
   ['build-v2', 'Choose the hands-on session. It starts fifteen minutes before your bus leaves.', 'The start time is early enough, but the session ends ten minutes after the bus leaves.'],
   ['demo-v2', 'Choose the demonstration. It ends at 5:00, leaving time to walk to the stop.', 'The demonstration ends at 5:00. A five-minute walk gets you to the stop at 5:05, before the 5:30 bus.']
  ]],
 ['pedagogy-extra-q-31',
  'Your school film club wants believable characters to discuss. Members are happy with a slower story if the characters are interesting. The film has believable characters but a slow middle.',
  'Which recommendation weighs both points for this club?', 'try-v2', [
   ['try-v2', 'Give it a try. The middle is slow, but the believable characters give your club something to discuss.', 'The slow middle is a drawback this club can accept. The characters give members what they want to discuss.'],
   ['wait-v2', 'Wait for a faster film with believable characters. That way the club can talk about the characters without sitting through a slow middle.', 'This values speed more than the club does. Members are willing to watch a slower film if the characters interest them.'],
   ['pace-v2', 'Try it for the believable characters, but only if you are happy to watch a film with slow pacing throughout.', 'This recognises the club’s interest in the characters, but the review only says the middle is slow. It does not say the whole film is slow.']
  ]],
 ['pedagogy-extra-q-27',
  'Students have a twenty-minute lunch break. The café is a four-minute walk each way. Today a takeaway meal took five minutes from ordering to collection.',
  'Which advice uses today’s service time to help students decide whether to go?', 'seven-v2', [
   ['seven-v2', 'Go if seven minutes is enough for you to eat and service is as quick as it was today.', 'The two walks take eight minutes and collection takes five. That leaves seven minutes.'],
   ['eleven-v2', 'Go if eleven minutes is enough for you to eat and service is as quick as it was today.', 'Eleven minutes remain before the walk back. Allow another four minutes for that walk.'],
   ['twelve-v2', 'Go if twelve minutes is enough for you to eat and service is as quick as it was today.', 'This allows time for both walks but leaves out the five minutes needed to collect the meal.']
  ]],
 ['pedagogy-extra-q-30',
  'A £12 workshop includes tools. Two beginners share a bench for a twenty-minute practice slot. Only one person can work at a time and each gets ten minutes. Your readers do not own tools and want as much hands-on time as possible.',
  'Which evaluation explains what these beginners gain and what they give up?', 'balance-v2', [
   ['cost-v2', 'The price includes tools, so beginners who want plenty of practice should book it.', 'Included tools mean beginners can take part without buying any. This advice overlooks how much time they actually get to practise.'],
   ['time-v2', 'Beginners get ten minutes to practise, so anyone who wants more time should look elsewhere.', 'This gives the practice time but leaves out an advantage for beginners who do not own tools.'],
   ['balance-v2', 'Beginners can try the activity without buying tools, but each gets only ten minutes to practise.', 'This addresses both priorities: tools are included, and taking turns leaves each beginner ten minutes at the bench.']
  ]]
];

const revisedQuestions = new Map(revisions.map(([id, source, prompt, correct, choices]) =>
 [id, {...recognitionQuestion(id, 2, prompt, correct, choices), source}]));

export const vocabularyDiscoverR21 = recognitionQuestion(
 'pedagogy-observation-006', 2,
 'Which detail do both versions give about the noise that “The café is noisy” leaves out?', 'time-v2', [
  ['sounds-v2', 'What caused the noise.', 'Neither version says what made the noise.'],
  ['time-v2', 'When the café is noisy.', '“At lunchtime” and “around midday” both tell readers when it is noisy. Keep that time detail when you rephrase the sentence.'],
  ['frequency-v2', 'How often the café is noisy.', 'The versions name a time of day, but neither says how many days this happens.']
 ]);

export function reviseDevelopmentForStaff(course) {
 const revise = item => revisedQuestions.get(item.id) ?? item;
 return {...course, analysis:revise(course.analysis),
  practice:course.practice.map(activity=>({...activity,items:activity.items.map(revise)}))};
}
