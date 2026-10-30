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
  phrase('current_affairs', 'the latest news about politics and world events', 'current affairs', ['vocab_current_affairs'], { chunks:['current', 'affairs'], distortions:['old stories about world history', 'private news about family events', 'weather news for local areas'] })
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
  ], ['vocab_current_affairs'])
];

export default [...phraseSets, ...ideaSets];
