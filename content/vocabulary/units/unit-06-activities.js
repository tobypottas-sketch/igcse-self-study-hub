// Unit 6 · Paraphrasing content (phrase_set and idea_set), WORDS 1–10 so far. Same record shapes and contract as unit-05-activities.js:
//   phrase_set : originalPhrase (plain wording) -> equivalentPhrase (contains the target), acceptedVariants, chunks, commonMeaningDistortions
//   idea_set   : originalIdea (contains the target) with accurate paraphrases that do NOT contain it, a meaning invariant, and three
//                meaning-changing distractors each tagged with the misconception it represents.
// Every record is linked to exactly one Unit 6 word.
const status = 'draft';
const unitNumber = 6;

function phrase(id, originalPhrase, equivalentPhrase, linkedVocabularyIds, { acceptedVariants = [], chunks = null, distortions = [] } = {}) {
  return {
    activityContentId:`u6_phrase_${id}`, unitNumber, contentType:'phrase_set', status,
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
    activityContentId:`u6_idea_${id}`, unitNumber, contentType:'idea_set', status,
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
  phrase('absorb_main_ideas', 'to take in and understand the main ideas', 'to absorb the main ideas', ['vocab_absorb'], { chunks:['to absorb', 'the main ideas'], distortions:['to copy out the main ideas', 'to reject the main ideas', 'to forget the main ideas'] }),
  phrase('confidence_speaking', 'belief in your own ability to speak in public', 'confidence in speaking in public', ['vocab_confidence'], { chunks:['confidence', 'in speaking', 'in public'], distortions:['fear of speaking in public', 'respect for speaking in public', 'certainty about speaking in public'] }),
  phrase('dilemma_career_choice', 'a difficult choice between two careers', 'a dilemma about two careers', ['vocab_dilemma'], { chunks:['a dilemma', 'about', 'two careers'], distortions:['a problem with two careers', 'an argument about two careers', 'a plan for two careers'] }),
  phrase('dramatically_improve', 'to get better by a very large amount', 'to improve dramatically', ['vocab_dramatically'], { chunks:['to improve', 'dramatically'], distortions:['to improve slightly', 'to improve slowly', 'to improve temporarily'] }),
  phrase('equivalent_certificate', 'a certificate that has the same value', 'an equivalent certificate', ['vocab_equivalent'], { chunks:['an equivalent', 'certificate'], distortions:['a cheaper certificate', 'a similar-looking certificate', 'a higher-level certificate'] }),
  phrase('overload_students_work', 'to give students more work than they can manage', 'to overload students with work', ['vocab_overload'], { chunks:['to overload', 'students', 'with work'], distortions:['to reward students for work', 'to excuse students from work', 'to remind students about work'] }),
  phrase('stagnate_studies', 'to stop making progress in your studies', 'to stagnate in your studies', ['vocab_stagnate'], { chunks:['to stagnate', 'in your studies'], distortions:['to hurry through your studies', 'to change your studies', 'to pause your studies for a year'] }),
  phrase('engage_class_discussion', 'to become involved in a class discussion', 'to engage in a class discussion', ['vocab_engage'], { chunks:['to engage in', 'a class discussion'], distortions:['to interrupt a class discussion', 'to avoid a class discussion', 'to record a class discussion'] }),
  phrase('participate_lessons', 'to take part in lessons and activities', 'to participate in lessons and activities', ['vocab_participate'], { chunks:['to participate in', 'lessons and activities'], distortions:['to watch lessons and activities', 'to organise lessons and activities', 'to miss lessons and activities'] }),
  phrase('passive_learner', 'a learner who takes no active part', 'a passive learner', ['vocab_passive'], { chunks:['a passive', 'learner'], distortions:['a nervous learner', 'a lazy learner', 'a slow learner'] })
];

const ideaSets = [
  idea('absorb', 'Students absorb more information when lessons are divided into short sections.', ['Students take in and understand more when a lesson is split into short parts.', 'Dividing a lesson into short sections helps students to learn more of what is taught.', 'More of the information sinks in for students if lessons come in short sections.'], 'comparison', 'more information', [
    { text:'Students absorb less information when lessons are divided into short sections.', misconceptionCategory:'polarity_change' },
    { text:'Students absorb the same amount of information however a lesson is divided.', misconceptionCategory:'comparison_change' },
    { text:'Teachers absorb more information when lessons are divided into short sections.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_absorb']),
  idea('confidence', 'Regular speaking practice gives learners the confidence to answer questions in class.', ['Learners who practise speaking regularly come to believe in their ability to answer questions in class.', 'Practising speaking often makes learners trust their own ability to reply when the teacher asks a question.', 'Frequent speaking practice helps learners to feel sure of themselves when they have to answer in class.'], 'cause_effect', 'regular practice gives belief in yourself', [
    { text:'Regular speaking practice makes learners afraid to answer questions in class.', misconceptionCategory:'polarity_change' },
    { text:'Regular speaking practice gives learners the certainty that every answer in class is correct.', misconceptionCategory:'meaning_confusion' },
    { text:'Answering questions in class gives learners the opportunity to practise speaking regularly.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_confidence']),
  idea('dilemma', 'Many students face a dilemma when they must choose between a part-time job and extra study time.', ['Many students find it hard to decide between earning money from a part-time job and spending more time studying.', 'Choosing between working part-time and studying for longer is a difficult decision for many students.', 'A lot of students struggle to choose between a part-time job and additional time for their studies.'], 'quantity', 'many students', [
    { text:'Few students face a dilemma when they must choose between a part-time job and extra study time.', misconceptionCategory:'quantity_change' },
    { text:'Many students face no difficulty when they must choose between a part-time job and extra study time.', misconceptionCategory:'polarity_change' },
    { text:'Many students face a dilemma when they must choose between two part-time jobs.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_dilemma']),
  idea('dramatically', 'The number of students who study online has risen dramatically since 2015.', ['Since 2015 there has been a very large increase in the number of students who study online.', 'The number of students studying online has grown by a very large amount since 2015.', 'Far more students study online now than in 2015, and the rise has been very steep.'], 'degree', 'very large', [
    { text:'The number of students who study online has risen slightly since 2015.', misconceptionCategory:'degree_change' },
    { text:'The number of students who study online has fallen dramatically since 2015.', misconceptionCategory:'polarity_change' },
    { text:'The number of students who study online has risen dramatically since 2005.', misconceptionCategory:'time_change' }
  ], ['vocab_dramatically']),
  idea('equivalent', 'This foreign diploma is equivalent to the national school certificate.', ['This foreign diploma has the same value as the national school certificate.', 'The national school certificate and this foreign diploma are worth the same.', 'This foreign diploma counts as equal to the national school certificate.'], 'comparison', 'the same value', [
    { text:'This foreign diploma is better than the national school certificate.', misconceptionCategory:'comparison_change' },
    { text:'This foreign diploma is similar in appearance to the national school certificate.', misconceptionCategory:'meaning_confusion' },
    { text:'This foreign diploma cannot be accepted instead of the national school certificate.', misconceptionCategory:'polarity_change' }
  ], ['vocab_equivalent']),
  idea('overload', 'Teachers should not overload students with homework before examinations.', ['Teachers should avoid giving students more homework than they can manage before examinations.', 'Before examinations, students should not be given too much homework by their teachers.', 'Teachers should not burden students with excessive homework in the run-up to examinations.'], 'degree', 'more than they can manage', [
    { text:'Teachers should give students more homework before examinations.', misconceptionCategory:'polarity_change' },
    { text:'Teachers should not give students any homework at all after examinations.', misconceptionCategory:'time_change' },
    { text:'Students should not overload teachers with questions before examinations.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_overload']),
  idea('stagnate', 'The school’s results stagnated for five years before the new teaching methods were introduced.', ['For five years the school’s results made no progress until new teaching methods arrived.', 'Until the new teaching methods were introduced, the school’s results stayed at the same level for five years.', 'The school’s results stopped improving for five years until the new teaching methods were introduced.'], 'time', 'five years before', [
    { text:'The school’s results stagnated for five years after the new teaching methods were introduced.', misconceptionCategory:'time_change' },
    { text:'The school’s results improved quickly for five years before the new teaching methods were introduced.', misconceptionCategory:'polarity_change' },
    { text:'The school’s results stagnated for ten years before the new teaching methods were introduced.', misconceptionCategory:'quantity_change' }
  ], ['vocab_stagnate']),
  idea('engage', 'Students engage more with lessons that connect to their own lives.', ['Students become more involved in lessons that connect to their own lives.', 'Students take a greater interest in lessons that are linked to their own lives.', 'Lessons that relate to their own lives hold the interest of students more strongly.'], 'comparison', 'more', [
    { text:'Students engage less with lessons that connect to their own lives.', misconceptionCategory:'polarity_change' },
    { text:'Students engage more with lessons that connect to their teachers’ lives.', misconceptionCategory:'meaning_confusion' },
    { text:'Students engage more with lessons that are shorter than usual.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_engage']),
  idea('participate', 'Students who participate in sport tend to perform better in their studies.', ['Students who take part in sport usually do better in their schoolwork.', 'Those who join in sporting activities generally achieve better results in their studies.', 'Taking part in sport is linked with stronger performance in studies.'], 'comparison', 'perform better', [
    { text:'Students who participate in sport perform worse in their studies.', misconceptionCategory:'polarity_change' },
    { text:'Students who watch sport tend to perform better in their studies.', misconceptionCategory:'meaning_confusion' },
    { text:'All students who participate in sport perform better in their studies.', misconceptionCategory:'degree_change' }
  ], ['vocab_participate']),
  idea('passive', 'Passive learning rarely helps students to remember new vocabulary.', ['Learning in which students only receive information rarely helps them to remember new words.', 'Students seldom remember new vocabulary when they simply receive it without taking action.', 'It is unusual for students to remember new words if they are not actively involved in learning.'], 'degree', 'rarely', [
    { text:'Passive learning always helps students to remember new vocabulary.', misconceptionCategory:'polarity_change' },
    { text:'Passive learning rarely helps students to remember new grammar.', misconceptionCategory:'meaning_confusion' },
    { text:'Passive learning sometimes helps students to forget new vocabulary.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_passive'])
];

export default [...phraseSets, ...ideaSets];
