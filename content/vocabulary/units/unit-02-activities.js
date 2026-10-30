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
  phrase('good_impression', 'a positive feeling about someone after meeting them', 'a good impression', ['vocab_impression'], { acceptedVariants:['a positive impression'], chunks:['a good', 'impression'], distortions:['a bad impression', 'a final decision', 'a written report'] })
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
  ], ['vocab_impression'])
];

export default [...phraseSets, ...ideaSets];
