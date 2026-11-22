// Unit 9 Precision & Use content: two "weak wording -> precise word" items per word, WORDS 1–50 (complete). Same contract as unit-08-precision-use.js:
// each item is a writing_set improve_vocabulary record; the weak wording quoted in the prompt appears exactly once in sourceText and not at its
// start; distractors fit the sentence grammatically but are wrong in meaning.
const status = 'approved';
const unitNumber = 9;
function precision(id, vocabularyId, prompt, sourceText, acceptedAnswers, distractors) {
  return {
    activityContentId:id, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'improve_vocabulary', prompt, sourceText, acceptedAnswers, distractors, linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}
const P = weak => `Replace “${weak}” with a more precise Unit 9 word or phrase.`;
const x = (term, vocabularyId, rows) => rows.map(([suffix, weak, sourceText, distractors]) => precision(`u9_writing_precision_${term.replace(/[^a-z]+/g, '_')}_${suffix}`, vocabularyId, P(weak), sourceText, [term], distractors));

export default [
  ...x('communication', 'vocab_communication', [
    ['a', 'talking and sharing messages', 'Better talking and sharing messages between the two teams would have prevented many mistakes.', ['frustration', 'perception', 'accuracy']],
    ['b', 'contact', 'After the earthquake, all contact with the village was lost for three days.', ['research', 'generation', 'conference']]
  ]),
  ...x('signalling', 'vocab_signalling', [
    ['a', 'waving his arms', 'The referee was waving his arms to show that the game had ended.', ['launched', 'banned', 'surviving']],
    ['b', 'giving a warning', 'The flashing red light was giving a warning that the battery was low.', ['evaluating', 'representing', 'researching']]
  ]),
  ...x('represent', 'vocab_represent', [
    ['a', 'stand for', 'In this chart, the green bars stand for students who walk to school.', ['survive', 'evaluate', 'suggest']],
    ['b', 'speak for', 'Two students were elected to speak for Year 10 at the meeting.', ['research', 'evaluate', 'survive']]
  ]),
  ...x('effective', 'vocab_effective_9', [
    ['a', 'useful', 'Flashcards are a cheap and useful way to learn vocabulary quickly.', ['optional', 'casual', 'passive']],
    ['b', 'successful', 'The new reminder system has been very successful, and fewer students forget their homework.', ['optional', 'informal', 'virtual']]
  ]),
  ...x('portable', 'vocab_portable', [
    ['a', 'small', 'She keeps a small charger in her bag so that she can charge her phone anywhere.', ['optional', 'physical', 'appropriate']],
    ['b', 'movable', 'The school needs a movable stage that can be taken outside for concerts.', ['virtual', 'banned', 'relevant']]
  ]),
  ...x('demonstrate', 'vocab_demonstrate_9', [
    ['a', 'show us', 'The coach will show us how to use the new gym machines.', ['evaluate', 'survive', 'represent']],
    ['b', 'prove', 'These results prove that the medicine works.', ['survive', 'differentiate', 'represent']]
  ]),
  ...x('launched', 'vocab_launched_9', [
    ['a', 'brought out', 'The company brought out its new phone at a big event in Tokyo.', ['banned', 'evaluated', 'survived']],
    ['b', 'started', 'Last month the council started a campaign to reduce litter.', ['banned', 'evaluated', 'represented']]
  ]),
  ...x('passive', 'vocab_passive_9', [
    ['a', 'silent', 'In the old system, students were silent listeners for most of the lesson.', ['interactive', 'constructive', 'tech-savvy']],
    ['b', 'inactive', 'Doctors warn that too much inactive screen time is bad for young children.', ['constructive', 'interactive', 'relevant']]
  ]),
  ...x('interactive', 'vocab_interactive_9', [
    ['a', 'hands-on', 'The museum’s new displays are hands-on, so children can answer questions on a screen.', ['passive', 'optional', 'casual']],
    ['b', 'responsive', 'Students learn more from responsive online exercises than from printed worksheets.', ['passive', 'informal', 'banned']]
  ]),
  ...x('tech-savvy', 'vocab_tech_savvy', [
    ['a', 'good with computers', 'My grandmother is surprisingly good with computers and runs her own blog.', ['passive', 'casual', 'optional']],
    ['b', 'skilled', 'The company wants skilled young staff who can learn new software quickly.', ['passive', 'casual', 'optional']]
  ]),
  ...x('digital native', 'vocab_digital_native', [
    ['a', 'young internet user', 'As a young internet user who has been online since childhood, Leo finds online banking easy.', ['workforce', 'conference', 'audience']],
    ['b', 'child of the internet age', 'Every child of the internet age in our class learned to use a tablet before starting school.', ['audience', 'workforce', 'conference']]
  ]),
  ...x('accuracy', 'vocab_accuracy', [
    ['a', 'correctness', 'Editors check the correctness of every fact before an article is published.', ['frustration', 'perception', 'generation']],
    ['b', 'correct use of language', 'In the writing paper, correct use of language is just as important as good ideas.', ['frustration', 'generation', 'perception']]
  ]),
  ...x('appropriate', 'vocab_appropriate', [
    ['a', 'right', 'Slang is not right for a formal report.', ['portable', 'interactive', 'virtual']],
    ['b', 'okay', 'Is it okay to wear trainers to a job interview?', ['portable', 'virtual', 'tech-savvy']]
  ]),
  ...x('banned', 'vocab_banned', [
    ['a', 'not allowed', 'Mobile phones are not allowed in the exam hall.', ['launched', 'evaluated', 'demonstrated']],
    ['b', 'stopped', 'Plastic bags have been stopped in many supermarkets by a new law.', ['launched', 'demonstrated', 'evaluated']]
  ]),
  ...x('community', 'vocab_community', [
    ['a', 'people living nearby', 'The people living nearby all helped to clean the beach after the storm.', ['workforce', 'conference', 'platform']],
    ['b', 'group', 'She belongs to an online group of photography fans.', ['platform', 'conference', 'workforce']]
  ]),
  ...x('optional', 'vocab_optional', [
    ['a', 'not compulsory', 'Homework club is not compulsory, but most students go.', ['banned', 'passive', 'portable']],
    ['b', 'up to you', 'Wearing a tie is up to you on Fridays.', ['banned', 'portable', 'passive']]
  ]),
  ...x('survive', 'vocab_survive', [
    ['a', 'continue to exist', 'Will printed newspapers continue to exist in a digital world?', ['represent', 'demonstrate', 'differentiate']],
    ['b', 'stay alive', 'Very few plants can stay alive in the desert without water.', ['represent', 'evaluate', 'differentiate']]
  ]),
  ...x('unlike', 'vocab_unlike', [
    ['a', 'different from', 'Emails, different from letters, arrive within seconds.', ['including', 'despite', 'during']],
    ['b', 'in contrast to', 'My brother, in contrast to me, hates talking on the phone.', ['including', 'during', 'despite']]
  ]),
  ...x('frustration', 'vocab_frustration', [
    ['a', 'annoyance', 'He closed the app in annoyance after it crashed again.', ['accuracy', 'perception', 'research']],
    ['b', 'bad feelings', 'Not being understood in a new language can cause a lot of bad feelings.', ['accuracy', 'research', 'perception']]
  ]),
  ...x('informal', 'vocab_informal', [
    ['a', 'relaxed', 'The style of most text messages is relaxed and chatty.', ['portable', 'interactive', 'physical']],
    ['b', 'unofficial', 'The teachers had an unofficial meeting in the staff room.', ['physical', 'portable', 'interactive']]
  ]),
  ...x('casual', 'vocab_casual', [
    ['a', 'comfortable', 'On Fridays, staff may wear comfortable clothes such as jeans to work.', ['portable', 'interactive', 'relevant']],
    ['b', 'relaxed and friendly', 'His email to the manager had a relaxed and friendly tone that was not suitable for work.', ['portable', 'relevant', 'interactive']]
  ]),
  ...x('workforce', 'vocab_workforce', [
    ['a', 'staff', 'Half of the company’s staff now works from home.', ['audience', 'community', 'conference']],
    ['b', 'group of workers', 'The country needs a skilled group of workers to build its technology industry.', ['audience', 'conference', 'platform']]
  ]),
  ...x('generation', 'vocab_generation_9', [
    ['a', 'age group', 'My parents’ age group grew up without mobile phones.', ['community', 'workforce', 'audience']],
    ['b', 'group of people born at the same time', 'Every group of people born at the same time creates its own slang.', ['community', 'audience', 'workforce']]
  ]),
  ...x('perception', 'vocab_perception', [
    ['a', 'view', 'Social media can change our view of what a normal life looks like.', ['accuracy', 'frustration', 'workforce']],
    ['b', 'impression', 'There is a common impression that teenagers do not read books.', ['frustration', 'accuracy', 'conference']]
  ]),
  ...x('non-verbal', 'vocab_non_verbal', [
    ['a', 'body-language', 'Smiling is a powerful form of body-language communication.', ['informal', 'virtual', 'passive']],
    ['b', 'wordless', 'Her wordless signals showed that she was bored.', ['virtual', 'informal', 'passive']]
  ]),
  ...x('underlying', 'vocab_underlying', [
    ['a', 'hidden', 'The hidden cause of the argument was jealousy.', ['portable', 'optional', 'casual']],
    ['b', 'basic', 'The basic problem is that the website is too slow.', ['portable', 'casual', 'optional']]
  ]),
  ...x('differentiate', 'vocab_differentiate', [
    ['a', 'tell the difference', 'Young children cannot always tell the difference between adverts and real videos.', ['survive', 'represent', 'demonstrate']],
    ['b', 'separate', 'Students must learn to separate reliable websites from unreliable ones.', ['represent', 'survive', 'demonstrate']]
  ]),
  ...x('physical', 'vocab_physical', [
    ['a', 'real', 'The bookshop closed its real store and now sells only online.', ['virtual', 'casual', 'informal']],
    ['b', 'printed', 'Please bring a printed copy of your ticket.', ['virtual', 'informal', 'casual']]
  ]),
  ...x('platform', 'vocab_platform', [
    ['a', 'website', 'The singer shared her song on a popular streaming website.', ['conference', 'workforce', 'clause']],
    ['b', 'system', 'Teachers upload homework to an online system that students can check at home.', ['conference', 'clause', 'workforce']]
  ]),
  ...x('virtual', 'vocab_virtual', [
    ['a', 'online', 'Visitors can take online tours of all the museum’s rooms.', ['physical', 'casual', 'banned']],
    ['b', 'computer-made', 'Players explore a computer-made world full of strange animals.', ['physical', 'banned', 'casual']]
  ]),
  ...x('face-to-face', 'vocab_face_to_face', [
    ['a', 'in-person', 'Nothing can replace in-person conversations with good friends.', ['virtual', 'passive', 'optional']],
    ['b', 'in person', 'After months online, the two pen friends finally met in person.', ['virtually', 'passively', 'optionally']]
  ]),
  ...x('conference', 'vocab_conference', [
    ['a', 'large formal meeting', 'Scientists from forty countries attended a large formal meeting on climate change.', ['community', 'platform', 'workforce']],
    ['b', 'meeting', 'The minister announced the new law at a press meeting on Monday.', ['community', 'workforce', 'platform']]
  ]),
  ...x('suitable', 'vocab_suitable', [
    ['a', 'right', 'This film is not right for children under twelve.', ['portable', 'passive', 'virtual']],
    ['b', 'good enough', 'We need a good enough room for forty guests.', ['passive', 'portable', 'virtual']]
  ]),
  ...x('underlying meaning', 'vocab_underlying_meaning', [
    ['a', 'hidden message', 'The hidden message of the story is that money cannot buy happiness.', ['reporting verb', 'direct object', 'formal style']],
    ['b', 'real point', 'Can you explain the real point of the poem?', ['reporting verb', 'formal style', 'direct object']]
  ]),
  ...x('informal language', 'vocab_informal_language', [
    ['a', 'chatty words', 'Avoid chatty words such as “gonna” in your exam essay.', ['formal style', 'direct object', 'reporting verb']],
    ['b', 'everyday talk', 'Text messages are full of everyday talk and abbreviations.', ['formal style', 'reporting verb', 'direct object']]
  ]),
  ...x('formal style', 'vocab_formal_style', [
    ['a', 'serious way of writing', 'Write your job application in a serious way of writing, without contractions.', ['informal language', 'direct object', 'reporting verb']],
    ['b', 'polite and official tone', 'The letter to the council should be in a polite and official tone.', ['informal language', 'reporting verb', 'direct object']]
  ]),
  ...x('reporting verb', 'vocab_reporting_verb', [
    ['a', 'speech verb', 'Instead of “said”, choose a stronger speech verb such as “admitted”.', ['direct object', 'formal style', 'clause']],
    ['b', 'verb for reporting speech', 'In “He claimed he was innocent”, “claimed” is the verb for reporting speech.', ['direct object', 'clause', 'formal style']]
  ]),
  ...x('direct object', 'vocab_direct_object', [
    ['a', 'thing that receives the action', 'In “She sent a message”, “a message” is the thing that receives the action.', ['reporting verb', 'clause', 'formal style']],
    ['b', 'receiver of the action', 'In “We watched a film”, the receiver of the action is “a film”.', ['reporting verb', 'formal style', 'clause']]
  ]),
  ...x('clause', 'vocab_clause', [
    ['a', 'group of words with a subject and verb', 'In this sentence, “because it rained” is a group of words with a subject and verb.', ['conference', 'platform', 'conclusion']],
    ['b', 'part of the sentence', 'Underline the part of the sentence that begins with “although”.', ['conclusion', 'conference', 'platform']]
  ]),
  ...x('suggest', 'vocab_suggest', [
    ['a', 'put forward the idea', 'At the meeting, I put forward the idea that we meet online instead.', ['survive', 'differentiate', 'represent']],
    ['b', 'propose', 'Can I propose that we take a short break?', ['survive', 'represent', 'differentiate']]
  ]),
  ...x('recommend', 'vocab_recommend_9', [
    ['a', 'praise and suggest', 'I would praise and suggest this app to anyone learning English.', ['survive', 'represent', 'differentiate']],
    ['b', 'advise', 'Doctors advise that teenagers sleep at least eight hours a night.', ['survive', 'differentiate', 'represent']]
  ]),
  ...x('solution', 'vocab_solution_9', [
    ['a', 'answer', 'The only answer to the noise problem is a separate quiet room.', ['frustration', 'perception', 'generation']],
    ['b', 'fix', 'The printer keeps jamming, and nobody can find a fix for it.', ['perception', 'frustration', 'generation']]
  ]),
  ...x('introduction', 'vocab_introduction', [
    ['a', 'beginning', 'The beginning of your essay should tell the reader what to expect.', ['conclusion', 'audience', 'purpose']],
    ['b', 'opening section', 'The book has a short opening section written by the author’s daughter.', ['conclusion', 'purpose', 'audience']]
  ]),
  ...x('conclusion', 'vocab_conclusion', [
    ['a', 'ending', 'In the ending of the report, summarise your main recommendations.', ['introduction', 'audience', 'purpose']],
    ['b', 'final decision', 'After a long discussion, the committee reached the final decision that the trip was too expensive.', ['introduction', 'purpose', 'audience']]
  ]),
  ...x('audience', 'vocab_audience', [
    ['a', 'listeners', 'The speaker told a joke, and the listeners laughed loudly.', ['workforce', 'purpose', 'conclusion']],
    ['b', 'readers', 'The magazine’s main readers are teenagers who love science.', ['workforce', 'conclusion', 'purpose']]
  ]),
  ...x('purpose', 'vocab_purpose', [
    ['a', 'aim', 'The aim of this report is to suggest ways to reduce waste.', ['audience', 'conference', 'workforce']],
    ['b', 'reason for writing', 'Before you start, decide on your reason for writing: to inform or to persuade.', ['audience', 'workforce', 'conference']]
  ]),
  ...x('evaluate', 'vocab_evaluate_9', [
    ['a', 'judge', 'Students must judge each source to decide whether it is reliable.', ['represent', 'survive', 'suggest']],
    ['b', 'assess', 'The teacher asked us to assess the strengths and weaknesses of the plan.', ['represent', 'suggest', 'survive']]
  ]),
  ...x('relevant', 'vocab_relevant_9', [
    ['a', 'connected', 'Only include information that is connected to the question.', ['portable', 'casual', 'passive']],
    ['b', 'related', 'Find two related examples for your essay on online safety.', ['portable', 'passive', 'casual']]
  ]),
  ...x('constructive', 'vocab_constructive', [
    ['a', 'helpful', 'The teacher gave helpful feedback that showed me how to improve.', ['passive', 'portable', 'casual']],
    ['b', 'useful and positive', 'It was a useful and positive meeting, and we agreed on a clear plan.', ['passive', 'casual', 'portable']]
  ]),
  ...x('research', 'vocab_research', [
    ['a', 'scientific study', 'New scientific study shows that exercise improves concentration.', ['frustration', 'perception', 'conference']],
    ['b', 'investigations', 'Scientists are doing investigations into the effects of screens on sleep.', ['frustration', 'conference', 'perception']]
  ])
];
