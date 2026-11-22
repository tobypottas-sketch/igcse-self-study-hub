// Unit 9 Word Families items (writing_set, taskType 'word_family'), WORDS 1–50 (complete): three items for each word that has a genuine family.
// Same record shape as unit-08-word-family-items.js. Each sentence has one gap that exactly one form of the family completes, and the gap never
// opens the sentence (see unit-09-word-families.js).
const unitNumber = 9;
const status = 'approved';
function family(id, vocabularyId, name, sourceText, acceptedAnswer) {
  return {
    activityContentId:`u9_writing_word_family_${id}`, unitNumber, contentType:'writing_set', status,
    activityData:{ taskType:'word_family', prompt:`Use the correct form from the ${name} word family.`, sourceText, acceptedAnswers:[acceptedAnswer], linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}

export default [
  family('communication_a', 'vocab_communication', 'communication', 'Mobile phones have made ____ between families much easier.', 'communication'),
  family('communication_b', 'vocab_communication', 'communication', 'Some animals ____ by changing the colour of their skin.', 'communicate'),
  family('communication_c', 'vocab_communication', 'communication', 'The lessons are very ____, with lots of pair work and discussion.', 'communicative'),
  family('represent_a', 'vocab_represent', 'represent', 'Three students were chosen to ____ the school at the science fair.', 'represent'),
  family('represent_b', 'vocab_represent', 'represent', 'The class ____ took the students’ complaints to the head teacher.', 'representative'),
  family('represent_c', 'vocab_represent', 'represent', 'The film gives a realistic ____ of life in a small village.', 'representation'),
  family('effective_a', 'vocab_effective_9', 'effective', 'Clear diagrams are an ____ way to explain complicated ideas.', 'effective'),
  family('effective_b', 'vocab_effective_9', 'effective', 'Leaders who listen can manage a team more ____.', 'effectively'),
  family('effective_c', 'vocab_effective_9', 'effective', 'The old campaign was ____, so the charity designed a new one.', 'ineffective'),
  family('demonstrate_a', 'vocab_demonstrate_9', 'demonstrate', 'The results ____ that regular practice improves memory.', 'demonstrate'),
  family('demonstrate_b', 'vocab_demonstrate_9', 'demonstrate', 'The engineer gave a short ____ of the new robot.', 'demonstration'),
  family('demonstrate_c', 'vocab_demonstrate_9', 'demonstrate', 'One ____ climbed onto a bus shelter to make a speech.', 'demonstrator'),
  family('passive_a', 'vocab_passive_9', 'passive', 'Scrolling through videos is a very ____ way to spend an evening.', 'passive'),
  family('passive_b', 'vocab_passive_9', 'passive', 'Most of the audience sat ____ through the long speech.', 'passively'),
  family('passive_c', 'vocab_passive_9', 'passive', 'Group projects can reduce ____ in quiet students.', 'passivity'),
  family('interactive_a', 'vocab_interactive_9', 'interactive', 'The new textbook comes with ____ online exercises.', 'interactive'),
  family('interactive_b', 'vocab_interactive_9', 'interactive', 'Good teachers ____ with every student during the lesson.', 'interact'),
  family('interactive_c', 'vocab_interactive_9', 'interactive', 'Online games often involve ____ with players in other countries.', 'interaction'),
  family('accuracy_a', 'vocab_accuracy', 'accuracy', 'Translation apps have improved, but their ____ is still limited.', 'accuracy'),
  family('accuracy_b', 'vocab_accuracy', 'accuracy', 'Please give an ____ description of what you saw.', 'accurate'),
  family('accuracy_c', 'vocab_accuracy', 'accuracy', 'The newspaper apologised for publishing ____ information.', 'inaccurate'),
  family('appropriate_a', 'vocab_appropriate', 'appropriate', 'Is it ____ to use emojis in an email to your teacher?', 'appropriate'),
  family('appropriate_b', 'vocab_appropriate', 'appropriate', 'Candidates should dress ____ for the interview.', 'appropriately'),
  family('appropriate_c', 'vocab_appropriate', 'appropriate', 'The school blocked several websites with ____ content.', 'inappropriate'),
  family('optional_a', 'vocab_optional', 'optional', 'Attending the weekend revision class is ____.', 'optional'),
  family('optional_b', 'vocab_optional', 'optional', 'There is an ____ to pay monthly or once a year.', 'option'),
  family('optional_c', 'vocab_optional', 'optional', 'Many students ____ for a gap year before university.', 'opt'),
  family('survive_a', 'vocab_survive', 'survive', 'Few local newspapers will ____ without online readers.', 'survive'),
  family('survive_b', 'vocab_survive', 'survive', 'The ____ of the old traditions depends on young people.', 'survival'),
  family('survive_c', 'vocab_survive', 'survive', 'Rescuers found one ____ under the fallen building.', 'survivor'),
  family('frustration_a', 'vocab_frustration', 'frustration', 'He threw his pen down in ____ after the third mistake.', 'frustration'),
  family('frustration_b', 'vocab_frustration', 'frustration', 'The players were ____ by the referee’s decision.', 'frustrated'),
  family('frustration_c', 'vocab_frustration', 'frustration', 'A slow internet connection is very ____ during an online exam.', 'frustrating'),
  family('informal_a', 'vocab_informal', 'informal', 'The party was ____, so nobody wore a suit.', 'informal'),
  family('informal_b', 'vocab_informal', 'informal', 'The staff talked ____ about the plans during the break.', 'informally'),
  family('informal_c', 'vocab_informal', 'informal', 'A letter of complaint should be polite and ____.', 'formal'),
  family('perception_a', 'vocab_perception', 'perception', 'The advert changed the public ____ of electric cars.', 'perception'),
  family('perception_b', 'vocab_perception', 'perception', 'Some adults ____ video games as a waste of time.', 'perceive'),
  family('perception_c', 'vocab_perception', 'perception', 'The ____ student noticed that her friend was upset.', 'perceptive'),
  family('differentiate_a', 'vocab_differentiate', 'differentiate', 'It is important to ____ between facts and opinions.', 'differentiate'),
  family('differentiate_b', 'vocab_differentiate', 'differentiate', 'People in ____ countries greet each other in different ways.', 'different'),
  family('differentiate_c', 'vocab_differentiate', 'differentiate', 'What is the ____ between a blog and a website?', 'difference'),
  family('suitable_a', 'vocab_suitable', 'suitable', 'We need a ____ room for forty people.', 'suitable'),
  family('suitable_b', 'vocab_suitable', 'suitable', 'High heels are ____ for a long walk in the mountains.', 'unsuitable'),
  family('suitable_c', 'vocab_suitable', 'suitable', 'Working from home does not ____ everyone.', 'suit'),
  family('recommend_a', 'vocab_recommend_9', 'recommend', 'Can you ____ a good app for learning vocabulary?', 'recommend'),
  family('recommend_b', 'vocab_recommend_9', 'recommend', 'The report ends with a clear ____ for the school.', 'recommendation'),
  family('recommend_c', 'vocab_recommend_9', 'recommend', 'Please read the ____ books before the course begins.', 'recommended'),
  family('solution_a', 'vocab_solution_9', 'solution', 'Online lessons were a quick ____ when the school closed.', 'solution'),
  family('solution_b', 'vocab_solution_9', 'solution', 'The new software should ____ the problem with the printer.', 'solve'),
  family('solution_c', 'vocab_solution_9', 'solution', 'Many questions about the universe remain ____.', 'unsolved'),
  family('introduction_a', 'vocab_introduction', 'introduction', 'Your ____ should explain the purpose of the report.', 'introduction'),
  family('introduction_b', 'vocab_introduction', 'introduction', 'The museum will ____ a new audio guide in May.', 'introduce'),
  family('introduction_c', 'vocab_introduction', 'introduction', 'New students attend an ____ meeting on their first day.', 'introductory'),
  family('conclusion_a', 'vocab_conclusion', 'conclusion', 'The writer’s ____ was that social media does more good than harm.', 'conclusion'),
  family('conclusion_b', 'vocab_conclusion', 'conclusion', 'The head teacher will ____ the ceremony with a short speech.', 'conclude'),
  family('conclusion_c', 'vocab_conclusion', 'conclusion', 'The video provided ____ proof that the player had not cheated.', 'conclusive'),
  family('relevant_a', 'vocab_relevant_9', 'relevant', 'Make sure every example is ____ to your main argument.', 'relevant'),
  family('relevant_b', 'vocab_relevant_9', 'relevant', 'The teacher could not see the ____ of the photo to the topic.', 'relevance'),
  family('relevant_c', 'vocab_relevant_9', 'relevant', 'Delete any ____ details before you submit the summary.', 'irrelevant')
];
