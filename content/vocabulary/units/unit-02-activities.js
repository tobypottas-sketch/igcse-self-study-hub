// Unit 2 · Paraphrasing content (phrase_set and idea_set), WORDS 1–10 ONLY. Same record shapes and contract as unit-01-activities.js:
//   phrase_set : originalPhrase (plain wording) -> equivalentPhrase (contains the target), acceptedVariants, chunks, commonMeaningDistortions
//   idea_set   : originalIdea (contains the target) with accurate paraphrases that do NOT contain it, a meaning invariant, and three
//                meaning-changing distractors each tagged with the misconception it represents.
// Every record is linked to exactly one Unit 2 word. Words 11–50 are not authored yet.
const status = 'draft';
const unitNumber = 2;

function phrase(id, originalPhrase, equivalentPhrase, linkedVocabularyIds, { acceptedVariants = [], chunks = null, distortions = [] } = {}) {
  return {
    activityContentId:`u2_phrase_${id}`, unitNumber, contentType:'phrase_set', status,
    activityData:{
      originalPhrase, equivalentPhrase, acceptedVariants,
      chunks:chunks ?? equivalentPhrase.split(/\s+/),
      commonMeaningDistortions:distortions,
      linkedVocabularyIds,
      primaryEvidenceTargetId:linkedVocabularyIds.length === 1 ? linkedVocabularyIds[0] : undefined
    }
  };
}

function idea(id, originalIdea, accurateParaphrase, invariantType, invariantValue, distractors, linkedVocabularyIds = []) {
  return {
    activityContentId:`u2_idea_${id}`, unitNumber, contentType:'idea_set', status,
    activityData:{
      originalIdea,
      accurateParaphrases:Array.isArray(accurateParaphrase) ? accurateParaphrase : [accurateParaphrase],
      meaningInvariants:[{ type:invariantType, value:invariantValue }],
      distractors,
      linkedVocabularyIds
    }
  };
}

const phraseSets = [
  phrase('entertainment', 'things people watch or play for fun', 'forms of entertainment', ['vocab_entertainment'], { acceptedVariants:['kinds of entertainment'], chunks:['forms of', 'entertainment'], distortions:['things people study for exams', 'things people buy for their homes', 'things people read for information'] }),
  phrase('access_internet', 'the ability to use the internet', 'access to the internet', ['vocab_access'], { acceptedVariants:['internet access'], chunks:['access', 'to', 'the internet'], distortions:['a ban on using the internet', 'a payment for using the internet', 'a warning about using the internet'] }),
  phrase('electronic_device', 'a small electronic tool', 'an electronic device', ['vocab_device'], { acceptedVariants:['a digital device'], chunks:['an', 'electronic', 'device'], distortions:['a damaged electronic part', 'a free electronic service', 'an expensive electronic repair'] }),
  phrase('digital_copy', 'a copy stored on a computer', 'a digital copy', ['vocab_digital'], { acceptedVariants:['an electronic copy'], chunks:['a', 'digital', 'copy'], distortions:['a copy printed on paper', 'a copy written by hand', 'a copy kept in a drawer'] }),
  phrase('streaming_films', 'watching films over the internet without downloading them', 'streaming films', ['vocab_streaming'], { acceptedVariants:['streaming movies'], chunks:['streaming', 'films'], distortions:['downloading films to keep', 'buying films on disc', 'recording films from television'] }),
  phrase('relevant_topic', 'connected to the topic', 'relevant to the topic', ['vocab_relevant'], { acceptedVariants:['related to the topic'], chunks:['relevant', 'to', 'the topic'], distortions:['unrelated to the topic', 'harmful to the topic', 'too difficult for the topic'] }),
  phrase('experienced_educator', 'a teacher with many years of experience', 'an experienced educator', ['vocab_educator'], { acceptedVariants:['a seasoned educator'], chunks:['an', 'experienced', 'educator'], distortions:['a pupil who is new to the school', 'an inspector who visits schools', 'a parent who helps at school'] }),
  phrase('cannot_afford_phone', 'do not have enough money for a new phone', 'cannot afford a new phone', ['vocab_afford_2'], { acceptedVariants:['are unable to afford a new phone'], chunks:['cannot', 'afford', 'a new phone'], distortions:['choose not to buy a new phone', 'borrow money for a new phone', 'refuse to pay for a new phone'] }),
  phrase('essential_learning', 'absolutely necessary for learning', 'essential for learning', ['vocab_essential'], { acceptedVariants:['vital for learning'], chunks:['essential', 'for', 'learning'], distortions:['unnecessary for learning', 'harmful to learning', 'pleasant but optional for learning'] }),
  phrase('current_affairs', 'the latest news about politics and world events', 'current affairs', ['vocab_current_affairs'], { chunks:['current', 'affairs'], distortions:['old stories about world history', 'private news about family events', 'weather news for local areas'] }),
  phrase('apparently_cancelled', 'it seems that the match has been cancelled', 'the match has apparently been cancelled', ['vocab_apparently'], { acceptedVariants:['the match has seemingly been cancelled'], chunks:['the match', 'has apparently', 'been cancelled'], distortions:['the match has officially been cancelled', 'the match has probably been rearranged', 'the match has certainly not been cancelled'] }),
  phrase('supposedly_haunted', 'people say, without proof, that the house is haunted', 'the house is supposedly haunted', ['vocab_supposedly'], { acceptedVariants:['the house is allegedly haunted'], chunks:['the house', 'is supposedly', 'haunted'], distortions:['the house is certainly haunted', 'the house is proved to be haunted', 'the house was closed because it is haunted'] }),
  phrase('sports_celebrity', 'a famous footballer or athlete', 'a sports celebrity', ['vocab_celebrity'], { acceptedVariants:['a sporting celebrity'], chunks:['a sports', 'celebrity'], distortions:['a local sports coach', 'a retired sports teacher', 'a sports fan in the crowd'] }),
  phrase('informed_decision', 'a decision based on the facts', 'an informed decision', ['vocab_informed'], { acceptedVariants:['a well-informed decision'], chunks:['an', 'informed', 'decision'], distortions:['a hasty decision', 'a decision made by someone else', 'a decision made without reading anything'] }),
  phrase('admit_wrong', 'agree that you were wrong', 'admit that you were wrong', ['vocab_admit'], { acceptedVariants:['accept that you were wrong'], chunks:['admit', 'that', 'you were wrong'], distortions:['deny that you were wrong', 'insist that you were right', 'forget that you were wrong'] }),
  phrase('communicate_ideas', 'share ideas with other people', 'communicate ideas to other people', ['vocab_communicate'], { acceptedVariants:['pass ideas on to other people'], chunks:['communicate', 'ideas', 'to other people'], distortions:['hide ideas from other people', 'argue about ideas with other people', 'forget the ideas other people shared'] }),
  phrase('work_remotely', 'work from a different place using a computer link', 'work remotely', ['vocab_remotely'], { acceptedVariants:['work from a distance'], chunks:['work', 'remotely'], distortions:['work in the main office', 'work without any technology', 'work only at weekends'] }),
  phrase('transform_station', 'change the old station completely', 'transform the old station', ['vocab_transform'], { acceptedVariants:['completely change the old station'], chunks:['transform', 'the old station'], distortions:['repair the old station slightly', 'close the old station', 'paint the old station'] }),
  phrase('high_percentage', 'a large part out of every hundred students', 'a high percentage of students', ['vocab_percentage'], { acceptedVariants:['a large percentage of students'], chunks:['a high', 'percentage', 'of students'], distortions:['a small percentage of students', 'the total number of students', 'the average age of students'] }),
  phrase('good_impression', 'a positive feeling about someone after meeting them', 'a good impression', ['vocab_impression'], { acceptedVariants:['a positive impression'], chunks:['a good', 'impression'], distortions:['a bad impression', 'a final decision', 'a written report'] }),
  phrase('remote_control_tv', 'a handheld device for changing the television channel from across the room', 'a remote control', ['vocab_remote_control'], { acceptedVariants:['a TV remote control'], chunks:['a', 'remote control'], distortions:['a switch on the television itself', 'a cable that joins the television to the wall', 'a screen that shows the television programme'] }),
  phrase('key_feature', 'an important part of how a product is designed', 'a key feature', ['vocab_feature'], { acceptedVariants:['a main feature'], chunks:['a key', 'feature'], distortions:['a serious fault', 'a low price', 'a customer review'] }),
  phrase('main_function', 'the job that a part of a machine is made to do', 'the main function', ['vocab_function'], { acceptedVariants:['the main purpose'], chunks:['the main', 'function'], distortions:['the main colour', 'the main cost', 'the main weakness'] }),
  phrase('interactive_lesson', 'a lesson in which students take part and respond', 'an interactive lesson', ['vocab_interactive'], { acceptedVariants:['a participatory lesson'], chunks:['an', 'interactive', 'lesson'], distortions:['a lesson given by a recording', 'a lesson with no students', 'a lesson that is too short'] }),
  phrase('widespread_use', 'use by people in many places', 'widespread use', ['vocab_widespread'], { acceptedVariants:['common use'], chunks:['widespread', 'use'], distortions:['use by a small group', 'use only on weekends', 'use that is not allowed'] }),
  phrase('limited_availability', 'only a few can be obtained', 'limited availability', ['vocab_availability'], { acceptedVariants:['restricted availability'], chunks:['limited', 'availability'], distortions:['unlimited availability', 'unusual quality', 'lower price'] }),
  phrase('high_performance_laptop', 'a computer that works at very high speed', 'a high-performance laptop', ['vocab_high_performance'], { acceptedVariants:['a high-performance computer'], chunks:['a', 'high-performance', 'laptop'], distortions:['a cheap laptop', 'a broken laptop', 'a very old laptop'] }),
  phrase('stabilising_effect', 'an influence that makes a situation steadier', 'a stabilising effect', ['vocab_stabilising'], { acceptedVariants:['a steadying effect'], chunks:['a', 'stabilising', 'effect'], distortions:['a worrying effect', 'a very small effect', 'a sudden effect'] }),
  phrase('multi_task_easily', 'do several jobs at the same time', 'multi-task', ['vocab_multi_task'], { acceptedVariants:['multitask'], chunks:['multi-task'], distortions:['do one job at a time', 'do jobs slowly', 'avoid doing any jobs'] }),
  phrase('predictable_result', 'a result that people can guess in advance', 'a predictable result', ['vocab_predictable'], { acceptedVariants:['an expected result'], chunks:['a', 'predictable', 'result'], distortions:['a surprising result', 'a disappointing result', 'a result nobody saw'] }),
  phrase('professional_advice', 'advice from a trained expert', 'professional advice', ['vocab_professional'], { acceptedVariants:['expert advice'], chunks:['professional', 'advice'], distortions:['advice from a close friend', 'advice from a stranger online', 'advice that costs nothing'] }),
  phrase('regional_newspaper', 'a newspaper for one part of the country', 'a regional newspaper', ['vocab_regional'], { acceptedVariants:['a regional paper'], chunks:['a', 'regional', 'newspaper'], distortions:['a newspaper for the whole world', 'a newspaper for one street', 'a newspaper printed in colour'] }),
  phrase('live_commentary', 'a spoken description of a match as it is played', 'a live commentary', ['vocab_commentary'], { acceptedVariants:['a running commentary'], chunks:['a live', 'commentary'], distortions:['a written report of a match', 'a list of the final scores', 'a photograph of the winning team'] }),
  phrase('educational_game', 'a game that helps people learn', 'an educational game', ['vocab_educational'], { acceptedVariants:['a learning game'], chunks:['an', 'educational', 'game'], distortions:['a game that is very difficult', 'a game played outside', 'a game that costs a lot'] }),
  phrase('local_culture', 'the customs and way of life of the area', 'the local culture', ['vocab_culture'], { acceptedVariants:['the culture of the area'], chunks:['the local', 'culture'], distortions:['the weather of the area', 'the map of the area', 'the history of one building'] }),
  phrase('genuine_leather', 'leather that is real, not fake', 'genuine leather', ['vocab_genuine'], { acceptedVariants:['real leather'], chunks:['genuine', 'leather'], distortions:['leather that is very old', 'leather that is cheap', 'leather that is brightly coloured'] }),
  phrase('amusing_story', 'a story that makes you smile', 'an amusing story', ['vocab_amusing'], { acceptedVariants:['a funny story'], chunks:['an', 'amusing', 'story'], distortions:['a story that makes you afraid', 'a story that is very long', 'a story that teaches a lesson'] }),
  phrase('competitive_market', 'a market where many companies try to win customers', 'a competitive market', ['vocab_competitive'], { acceptedVariants:['a highly competitive market'], chunks:['a', 'competitive', 'market'], distortions:['a market with only one seller', 'a market that is closed on Sundays', 'a market that sells old goods'] }),
  phrase('critical_of_plan', 'saying that the plan has faults', 'critical of the plan', ['vocab_critical'], { acceptedVariants:['critical about the plan'], chunks:['critical of', 'the plan'], distortions:['in favour of the plan', 'unaware of the plan', 'responsible for the plan'] }),
  phrase('impressive_performance', 'a performance that makes people admire it', 'an impressive performance', ['vocab_impressive'], { acceptedVariants:['a remarkable performance'], chunks:['an', 'impressive', 'performance'], distortions:['a boring performance', 'a short performance', 'a performance nobody saw'] })
];

const ideaSets = [
  idea('entertainment', 'The hotel provides live entertainment every evening.', ['The hotel offers live shows and music every evening.', 'Every evening the hotel puts on live performances for its guests.', 'Guests at the hotel can enjoy live performances each evening.'], 'time', 'every evening', [
    { text:'The hotel offers live shows only at weekends.', misconceptionCategory:'time_change' },
    { text:'The hotel used to offer live shows every evening but has stopped.', misconceptionCategory:'time_change' },
    { text:'The hotel provides meals and rooms every evening.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_entertainment']),
  idea('access', 'Pupils in rural areas often lack access to reliable internet.', ['Pupils in the countryside often cannot get a dependable internet connection.', 'Students who live in rural areas frequently have no way of getting reliable internet.', 'Reliable internet is often unavailable to pupils who live in the countryside.'], 'polarity', 'reliable internet is not available', [
    { text:'Pupils in the countryside always have a dependable internet connection.', misconceptionCategory:'meaning_confusion' },
    { text:'Pupils in cities often cannot get a dependable internet connection.', misconceptionCategory:'meaning_confusion' },
    { text:'Pupils in the countryside never want to use the internet.', misconceptionCategory:'added_information' }
  ], ['vocab_access']),
  idea('device', 'Teachers asked students to switch off every device during the exam.', ['The teachers told students to turn off all electronic gadgets during the exam.', 'During the exam, teachers asked for every electronic gadget to be turned off.', 'Students were told by their teachers to power down all their gadgets while they sat the exam.'], 'quantity', 'every gadget switched off', [
    { text:'Teachers asked students to switch off only their phones during the exam.', misconceptionCategory:'quantity_change' },
    { text:'Teachers asked students to bring an electronic gadget to the exam.', misconceptionCategory:'meaning_confusion' },
    { text:'Students switched off every gadget after the exam had finished.', misconceptionCategory:'time_change' }
  ], ['vocab_device']),
  idea('digital', 'The school has replaced printed textbooks with digital ones.', ['The school now uses electronic textbooks instead of printed ones.', 'Electronic textbooks have taken the place of printed books at the school.', 'Instead of printed textbooks, the school uses electronic versions.'], 'comparison', 'electronic books instead of printed books', [
    { text:'The school has replaced electronic textbooks with printed ones.', misconceptionCategory:'meaning_confusion' },
    { text:'The school uses both electronic and printed textbooks.', misconceptionCategory:'omitted_information' },
    { text:'The school plans to replace printed textbooks one day.', misconceptionCategory:'time_change' }
  ], ['vocab_digital']),
  idea('streaming', 'Streaming has made it easier to watch films without leaving home.', ['Watching films over the internet has made it easier to enjoy them without leaving the house.', 'Viewers can now watch films online from home, which is much easier than before.', 'It is now easier to watch films at home because they are played over the internet.'], 'cause_effect', 'online film viewing makes watching at home easier', [
    { text:'Watching films over the internet has made it harder to enjoy them without leaving the house.', misconceptionCategory:'cause_effect_change' },
    { text:'Watching films over the internet has made people leave the house to see them.', misconceptionCategory:'cause_effect_change' },
    { text:'Films can only be watched at home after they have been downloaded and saved.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_streaming']),
  idea('relevant', 'The teacher asked her to remove any details that were not relevant to the question.', ['The teacher told her to take out any details that had nothing to do with the question.', 'She was asked by the teacher to delete details unconnected to the question.', 'The teacher wanted her to leave out any details that did not relate to the question.'], 'polarity', 'unconnected details are removed', [
    { text:'The teacher asked her to add more details about the question.', misconceptionCategory:'meaning_confusion' },
    { text:'The teacher asked her to keep every detail, even those unconnected to the question.', misconceptionCategory:'meaning_confusion' },
    { text:'The teacher asked her to shorten the details that were too long.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_relevant']),
  idea('educator', 'Educators from twelve countries attended the conference.', ['Teachers from twelve countries went to the conference.', 'The conference welcomed teachers who had travelled from twelve countries.', 'People who work as teachers came to the conference from twelve countries.'], 'quantity', 'twelve countries', [
    { text:'Teachers from only two countries attended the conference.', misconceptionCategory:'quantity_change' },
    { text:'Students from twelve countries attended the conference.', misconceptionCategory:'meaning_confusion' },
    { text:'Teachers from twelve countries are planning to attend a conference next year.', misconceptionCategory:'time_change' }
  ], ['vocab_educator']),
  idea('afford', 'Few families can afford to replace their devices every year.', ['Not many families have enough money to replace their gadgets every year.', 'Only a small number of families are able to pay for new gadgets each year.', 'Few families have the money to buy new electronic gadgets every year.'], 'quantity', 'few families', [
    { text:'Many families can easily replace their gadgets every year.', misconceptionCategory:'quantity_change' },
    { text:'Few families want to replace their gadgets every year.', misconceptionCategory:'meaning_confusion' },
    { text:'Few families replace their gadgets, but they do so every two years.', misconceptionCategory:'time_change' }
  ], ['vocab_afford_2']),
  idea('essential', 'A reliable internet connection is essential for online lessons.', ['Online lessons cannot work without a dependable internet connection.', 'A dependable internet connection is absolutely necessary for online lessons.', 'You must have a reliable internet connection to take part in online lessons.'], 'degree', 'absolutely necessary', [
    { text:'A reliable internet connection is helpful but not necessary for online lessons.', misconceptionCategory:'degree_change' },
    { text:'A reliable internet connection is provided free for all online lessons.', misconceptionCategory:'meaning_confusion' },
    { text:'A reliable internet connection is only needed after online lessons have finished.', misconceptionCategory:'time_change' }
  ], ['vocab_essential']),
  idea('current_affairs', 'Students who follow current affairs find it easier to write about global issues.', ['Students who keep up with the news find it simpler to write about global issues.', 'It is easier for students who read about world events to write about global issues.', 'Students who pay attention to the latest world news can write about global issues more easily.'], 'cause_effect', 'following the news makes writing easier', [
    { text:'Students who keep up with the news find it harder to write about global issues.', misconceptionCategory:'cause_effect_change' },
    { text:'Students who write about global issues find it easier to follow the news.', misconceptionCategory:'cause_effect_change' },
    { text:'Students who read old history books find it easier to write about global issues.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_current_affairs']),
  idea('apparently', 'Apparently, the new teacher used to work as a pilot.', ['It seems that the new teacher used to be a pilot.', 'From what people say, the new teacher used to fly planes for a living.', 'The new teacher used to work as a pilot, according to what has been said.'], 'degree', 'reported, not confirmed', [
    { text:'The new teacher is definitely a former pilot, as the school has confirmed.', misconceptionCategory:'degree_change' },
    { text:'The new teacher wants to become a pilot.', misconceptionCategory:'meaning_confusion' },
    { text:'The new teacher used to teach pilots how to fly.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_apparently']),
  idea('supposedly', 'The restaurant is supposedly the best in town, but the food was disappointing.', ['People say the restaurant is the best in town, but the food was disappointing.', 'The restaurant is said to be the best in town, yet the food was disappointing.', 'The restaurant has a reputation as the best in town, but the food was disappointing.'], 'degree', 'said to be the best, but doubted', [
    { text:'The restaurant is the best in town, and the food was excellent.', misconceptionCategory:'meaning_confusion' },
    { text:'The food was disappointing because the restaurant is not the best in town.', misconceptionCategory:'cause_effect_change' },
    { text:'Nobody says the restaurant is the best in town, but the food was good.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_supposedly']),
  idea('celebrity', 'Many teenagers follow a celebrity online and copy the way he dresses.', ['Lots of teenagers follow a famous person online and copy his style of clothes.', 'A large number of teenagers watch a star on the internet and copy what he wears.', 'Many young people follow a well-known figure on the internet and dress as he does.'], 'quantity', 'many teenagers', [
    { text:'A few teenagers follow a star online and copy the way he dresses.', misconceptionCategory:'quantity_change' },
    { text:'Many teenagers follow a star online but ignore how he dresses.', misconceptionCategory:'omitted_information' },
    { text:'Many teenagers dislike a famous person online and refuse to copy him.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_celebrity']),
  idea('informed', 'Voters should make an informed choice before an election.', ['Voters should choose carefully after learning the facts before an election.', 'Before an election, voters ought to base their choice on knowledge of the facts.', 'Voters need to know the facts before they decide in an election.'], 'time', 'facts first, then the choice', [
    { text:'Voters should make a quick choice on the day of an election.', misconceptionCategory:'meaning_confusion' },
    { text:'Voters should let other people make the choice before an election.', misconceptionCategory:'meaning_confusion' },
    { text:'Voters should choose first and learn the facts afterwards.', misconceptionCategory:'time_change' }
  ], ['vocab_informed']),
  idea('admit', 'The company admitted that the product had a serious fault.', ['The company accepted that the product had a serious fault.', 'The company confessed that the product had a serious fault.', 'The company agreed that there was a serious fault in its product.'], 'polarity', 'the fault is accepted as true', [
    { text:'The company denied that the product had a serious fault.', misconceptionCategory:'meaning_confusion' },
    { text:'The company warned that the product might have a serious fault.', misconceptionCategory:'degree_change' },
    { text:'The company announced that it would improve the product.', misconceptionCategory:'added_information' }
  ], ['vocab_admit']),
  idea('communicate', 'Some doctors use video calls to communicate with patients in distant villages.', ['Some doctors speak to patients in faraway villages through video calls.', 'Video calls allow some doctors to share information with patients who live in distant villages.', 'Some doctors stay in touch with patients in far-away villages using video calls.'], 'quantity', 'some doctors', [
    { text:'All doctors use video calls to speak to patients in distant villages.', misconceptionCategory:'quantity_change' },
    { text:'Some doctors travel to distant villages instead of using video calls.', misconceptionCategory:'meaning_confusion' },
    { text:'Some doctors use video calls to speak to patients in the same town.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_communicate']),
  idea('remotely', 'Many employees now work remotely on Fridays.', ['Many employees now work away from the office on Fridays.', 'On Fridays, many employees now do their jobs from a distance rather than in the office.', 'Many staff now work from somewhere other than the office on Fridays.'], 'time', 'on Fridays', [
    { text:'Many employees now work in the office only on Fridays.', misconceptionCategory:'meaning_confusion' },
    { text:'Few employees now work away from the office on Fridays.', misconceptionCategory:'quantity_change' },
    { text:'Many employees now work away from the office every day except Fridays.', misconceptionCategory:'time_change' }
  ], ['vocab_remotely']),
  idea('transform', 'The new library has transformed the town centre.', ['The new library has completely changed the town centre.', 'Because of the new library, the town centre is now very different.', 'The town centre has become something quite different since the new library was built.'], 'degree', 'a complete change', [
    { text:'The new library has slightly improved the town centre.', misconceptionCategory:'degree_change' },
    { text:'The new library has damaged the town centre.', misconceptionCategory:'meaning_confusion' },
    { text:'The town centre has changed the new library.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_transform']),
  idea('percentage', 'A high percentage of students use their phones to revise.', ['A large proportion of students use their phones to revise.', 'A large share of the students use their phones when they revise.', 'A big part of the student group uses phones for revision.'], 'quantity', 'a large part', [
    { text:'A low proportion of students use their phones to revise.', misconceptionCategory:'quantity_change' },
    { text:'A high proportion of students own phones but never use them to revise.', misconceptionCategory:'meaning_confusion' },
    { text:'Every single student uses a phone to revise.', misconceptionCategory:'quantity_change' }
  ], ['vocab_percentage']),
  idea('impression', 'The new student made a very good impression on her teachers.', ['The new student made her teachers think very well of her.', 'Her teachers formed a very positive opinion of the new student.', 'The new student left her teachers with a very favourable view of her.'], 'degree', 'a very positive opinion', [
    { text:'The new student made her teachers think badly of her.', misconceptionCategory:'meaning_confusion' },
    { text:'The teachers made a very good impression on the new student.', misconceptionCategory:'cause_effect_change' },
    { text:'The new student hardly changed what her teachers thought.', misconceptionCategory:'degree_change' }
  ], ['vocab_impression']),
  idea('remote_control', 'The boy steered the toy car across the garden with a remote control.', ['The boy guided the toy car across the garden using a handheld device.', 'Using a handheld device, the boy made the toy car move across the garden.', 'The boy drove the toy car around the garden from a distance with a controller.'], 'cause_effect', 'the boy controls the car', [
    { text:'The toy car steered the boy across the garden.', misconceptionCategory:'cause_effect_change' },
    { text:'The boy carried the toy car across the garden.', misconceptionCategory:'meaning_confusion' },
    { text:'The boy steered the toy car across the garden by pushing it.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_remote_control']),
  idea('feature', 'The most useful feature of this phone is its long battery life.', ['The best thing about this phone is that its battery lasts a long time.', 'This phone’s most helpful quality is its long-lasting battery.', 'What makes this phone most useful is a battery that lasts for a long time.'], 'comparison', 'the most useful', [
    { text:'The least useful thing about this phone is its short battery life.', misconceptionCategory:'polarity_change' },
    { text:'The phone is useful because its battery is cheap to replace.', misconceptionCategory:'meaning_confusion' },
    { text:'One useful thing about this phone is its long battery life.', misconceptionCategory:'degree_change' }
  ], ['vocab_feature']),
  idea('function', 'The function of a thermostat is to control the temperature in a room.', ['A thermostat is made to control the temperature in a room.', 'The purpose of a thermostat is to keep the temperature of a room under control.', 'A thermostat does the job of controlling the temperature in a room.'], 'cause_effect', 'controls the temperature', [
    { text:'A thermostat is made to measure the time in a room.', misconceptionCategory:'meaning_confusion' },
    { text:'A thermostat is controlled by the temperature of a room.', misconceptionCategory:'cause_effect_change' },
    { text:'A thermostat sometimes controls the temperature in a room.', misconceptionCategory:'degree_change' }
  ], ['vocab_function']),
  idea('interactive', 'Students enjoy the interactive displays in the science museum.', ['Students enjoy the displays in the science museum that they can touch and respond to.', 'In the science museum, students like the displays that react to what they do.', 'The science museum has displays that students can take part in, and they enjoy them.'], 'polarity', 'students like the displays', [
    { text:'Students dislike the interactive displays in the science museum.', misconceptionCategory:'meaning_confusion' },
    { text:'Students enjoy the displays in the science museum but cannot touch them.', misconceptionCategory:'omitted_information' },
    { text:'Students enjoy the museum shop in the science museum.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_interactive']),
  idea('widespread', 'Flooding was widespread across the north of the country last winter.', ['Flooding affected many parts of the north of the country last winter.', 'Last winter, floods covered large areas across the north of the country.', 'Last winter, the north of the country was hit by floods in many places.'], 'quantity', 'many places', [
    { text:'Flooding affected only one village in the north last winter.', misconceptionCategory:'quantity_change' },
    { text:'Flooding was widespread across the south of the country last winter.', misconceptionCategory:'meaning_confusion' },
    { text:'Flooding was widespread in the north last summer.', misconceptionCategory:'time_change' }
  ], ['vocab_widespread']),
  idea('availability', 'The availability of fresh fruit improves in the summer months.', ['It is easier to get fresh fruit in the summer months.', 'In the summer months, fresh fruit becomes easier to find.', 'During summer, there is more fresh fruit to buy.'], 'time', 'in the summer months', [
    { text:'Fresh fruit becomes harder to find in the summer months.', misconceptionCategory:'degree_change' },
    { text:'The price of fresh fruit improves in the summer months.', misconceptionCategory:'meaning_confusion' },
    { text:'It is easier to get fresh fruit in the winter months.', misconceptionCategory:'time_change' }
  ], ['vocab_availability']),
  idea('high_performance', 'Professional cyclists ride high-performance bikes in major races.', ['Professional cyclists ride very fast, powerful bikes in major races.', 'In major races, professional cyclists use bikes built for top speed.', 'Top cyclists use specially built, powerful bikes in important races.'], 'degree', 'top level', [
    { text:'Professional cyclists ride cheap bikes in major races.', misconceptionCategory:'meaning_confusion' },
    { text:'Some cyclists ride high-quality bikes in small races.', misconceptionCategory:'quantity_change' },
    { text:'Professional cyclists ride slightly faster bikes in major races.', misconceptionCategory:'degree_change' }
  ], ['vocab_high_performance']),
  idea('stabilising', 'The new manager has had a stabilising effect on the team.', ['The new manager has made the team steadier.', 'Since the new manager arrived, the team has become more settled.', 'The team has become calmer and more settled because of the new manager.'], 'cause_effect', 'the manager causes the change', [
    { text:'The team has had a stabilising effect on the new manager.', misconceptionCategory:'cause_effect_change' },
    { text:'The new manager has made the team more nervous.', misconceptionCategory:'meaning_confusion' },
    { text:'The new manager has had a small effect on the team.', misconceptionCategory:'degree_change' }
  ], ['vocab_stabilising']),
  idea('multi_task', 'Few people can multi-task effectively while they study.', ['Few people can do several jobs well at the same time while they study.', 'Only a small number of people manage to do many things at once while studying.', 'It is difficult for most people to study well while doing other things at the same time.'], 'quantity', 'few people', [
    { text:'Many people can do several jobs well at the same time while they study.', misconceptionCategory:'quantity_change' },
    { text:'Few people can study for a long time.', misconceptionCategory:'meaning_confusion' },
    { text:'Few people can study well at night.', misconceptionCategory:'time_change' }
  ], ['vocab_multi_task']),
  idea('predictable', 'The ending of the story was entirely predictable.', ['Everyone could guess the ending of the story.', 'It was easy to guess how the story would end.', 'The story’s ending was exactly what readers expected.'], 'degree', 'completely', [
    { text:'The ending of the story was partly predictable.', misconceptionCategory:'degree_change' },
    { text:'The ending of the story was impossible to guess.', misconceptionCategory:'meaning_confusion' },
    { text:'The ending of the story was predictable, but the beginning was not.', misconceptionCategory:'added_information' }
  ], ['vocab_predictable']),
  idea('professional', 'Many professional athletes stop competing before they are forty.', ['Many people who earn their living from sport stop competing before the age of forty.', 'A large number of full-time sportspeople end their careers before they turn forty.', 'Lots of athletes who are paid to compete retire before they reach forty.'], 'quantity', 'many', [
    { text:'A few people who earn their living from sport stop competing before the age of forty.', misconceptionCategory:'quantity_change' },
    { text:'Many amateur athletes begin competing after they are forty.', misconceptionCategory:'meaning_confusion' },
    { text:'Many people who earn their living from sport start competing before the age of forty.', misconceptionCategory:'time_change' }
  ], ['vocab_professional']),
  idea('regional', 'Regional newspapers have lost many readers over the last ten years.', ['Newspapers that cover one part of the country have lost many readers over the last ten years.', 'Over the last decade, papers serving a single area have lost a large number of readers.', 'In the past ten years, many readers have stopped buying papers that report on one area of the country.'], 'time', 'over the last ten years', [
    { text:'Newspapers that cover the whole country have lost many readers over the last ten years.', misconceptionCategory:'meaning_confusion' },
    { text:'Newspapers that cover one part of the country have gained many readers over the last ten years.', misconceptionCategory:'polarity_change' },
    { text:'Newspapers that cover one part of the country lost a few readers last year.', misconceptionCategory:'quantity_change' }
  ], ['vocab_regional']),
  idea('commentary', 'The radio commentary made the match sound more exciting than it really was.', ['The spoken description on the radio made the match seem more exciting than it was.', 'Listeners on the radio heard a description that made the match sound better than it really was.', 'The match was not as exciting as the radio description made it sound.'], 'comparison', 'more exciting than in reality', [
    { text:'The radio commentary made the match sound less exciting than it really was.', misconceptionCategory:'polarity_change' },
    { text:'The match was even more exciting than the radio commentary made it sound.', misconceptionCategory:'comparison_change' },
    { text:'The radio made the match sound more exciting because it played music.', misconceptionCategory:'added_information' }
  ], ['vocab_commentary']),
  idea('educational', 'The museum runs educational workshops for school groups every Friday.', ['Every Friday, the museum holds workshops where school groups learn new things.', 'School groups can join workshops at the museum each Friday that are designed to teach them.', 'The museum offers learning workshops for school groups every week on a Friday.'], 'time', 'every Friday', [
    { text:'The museum runs workshops for school groups on one Friday each year.', misconceptionCategory:'time_change' },
    { text:'The museum runs workshops for adults every Friday to teach them to paint.', misconceptionCategory:'meaning_confusion' },
    { text:'The museum runs entertaining shows for school groups every Friday.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_educational']),
  idea('culture', 'Learning a language helps you understand the culture of the people who speak it.', ['Learning a language helps you understand the way of life of the people who speak it.', 'If you learn their language, you can better understand the customs and beliefs of its speakers.', 'Studying a language gives you a better understanding of how its speakers live and what they believe.'], 'cause_effect', 'learning a language leads to understanding', [
    { text:'Understanding the way of life of a people helps you learn their language.', misconceptionCategory:'cause_effect_change' },
    { text:'Learning a language makes it harder to understand the people who speak it.', misconceptionCategory:'meaning_confusion' },
    { text:'Learning a language guarantees that you will visit the country where it is spoken.', misconceptionCategory:'added_information' }
  ], ['vocab_culture']),
  idea('genuine', 'The inspector checked that the painting was genuine before the museum bought it.', ['The inspector made sure the painting was real before the museum bought it.', 'Before buying the painting, the museum had an inspector confirm that it was not a fake.', 'The museum bought the painting only after the inspector had checked that it was authentic.'], 'time', 'before it was bought', [
    { text:'The inspector checked that the painting was real after the museum bought it.', misconceptionCategory:'time_change' },
    { text:'The inspector checked that the painting was valuable before the museum bought it.', misconceptionCategory:'meaning_confusion' },
    { text:'The museum bought the painting without asking the inspector.', misconceptionCategory:'omitted_information' }
  ], ['vocab_genuine']),
  idea('amusing', 'Most students found the headteacher’s speech mildly amusing.', ['Most students thought the headteacher’s speech was slightly funny.', 'The majority of students smiled a little at the headteacher’s speech.', 'For most students, the headteacher’s speech was a little entertaining.'], 'degree', 'mildly', [
    { text:'Most students found the headteacher’s speech extremely amusing.', misconceptionCategory:'degree_change' },
    { text:'Few students found the headteacher’s speech mildly amusing.', misconceptionCategory:'quantity_change' },
    { text:'Most students found the headteacher’s speech slightly boring.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_amusing']),
  idea('competitive', 'The mobile phone industry has become far more competitive in recent years.', ['Far more companies now try hard to win customers in the mobile phone industry than in the past.', 'In recent years, mobile phone firms have started to compete much more strongly.', 'Competition between mobile phone companies has grown a great deal recently.'], 'time', 'in recent years', [
    { text:'The mobile phone industry has become slightly more competitive in recent years.', misconceptionCategory:'degree_change' },
    { text:'The mobile phone industry has become far less competitive in recent years.', misconceptionCategory:'polarity_change' },
    { text:'Mobile phone companies have become far more profitable in recent years.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_competitive']),
  idea('critical', 'The inspector was critical of the way the school kept its records.', ['The inspector said that the school’s record-keeping had faults.', 'The inspector disapproved of how the school kept its records.', 'The inspector found problems in the way the school looked after its records.'], 'polarity', 'disapproval', [
    { text:'The inspector praised the way the school kept its records.', misconceptionCategory:'meaning_confusion' },
    { text:'The inspector was surprised by how many records the school kept.', misconceptionCategory:'meaning_confusion' },
    { text:'The inspector thought the school’s records were very important.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_critical']),
  idea('impressive', 'Her exam results were impressive, especially in mathematics.', ['Her exam results were excellent, particularly in mathematics.', 'She got very good exam results, and the best were in mathematics.', 'Her results in the exams were remarkable, most of all in mathematics.'], 'degree', 'very good', [
    { text:'Her exam results were average, except in mathematics.', misconceptionCategory:'degree_change' },
    { text:'Her exam results were impressive, but not in mathematics.', misconceptionCategory:'omitted_information' },
    { text:'Her mathematics results were better than her other results.', misconceptionCategory:'added_information' }
  ], ['vocab_impressive'])
];

export default [...phraseSets, ...ideaSets];
