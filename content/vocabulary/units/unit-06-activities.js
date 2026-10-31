// Unit 6 · Paraphrasing content (phrase_set and idea_set), WORDS 1–50 (complete). Same record shapes and contract as unit-05-activities.js:
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
  phrase('passive_learner', 'a learner who takes no active part', 'a passive learner', ['vocab_passive'], { chunks:['a passive', 'learner'], distortions:['a nervous learner', 'a lazy learner', 'a slow learner'] }),
  phrase('active_learner', 'a learner who takes a full part in lessons', 'an active learner', ['vocab_active'], { chunks:['an active', 'learner'], distortions:['a learner who is always busy', 'a learner who plays a lot of sport', 'a learner who works alone'] }),
  phrase('evaluate_results', 'to judge the results by using evidence', 'to evaluate the results using evidence', ['vocab_evaluate_6'], { chunks:['to evaluate', 'the results', 'using evidence'], distortions:['to describe the results without evidence', 'to repeat the results using evidence', 'to hide the results from the public'] }),
  phrase('reflect_experience', 'to think carefully about what happened and learn from it', 'to reflect on what happened', ['vocab_reflect'], { chunks:['to reflect on', 'what happened'], distortions:['to forget what happened', 'to complain about what happened', 'to repeat what happened'] }),
  phrase('process_information', 'to take in and make sense of new information', 'to process new information', ['vocab_process'], { chunks:['to process', 'new information'], distortions:['to ignore new information', 'to collect new information', 'to hide new information'] }),
  phrase('strategy_learning', 'a planned way of learning new words', 'a strategy for learning new words', ['vocab_strategy'], { chunks:['a strategy', 'for learning', 'new words'], distortions:['a game for learning new words', 'a list of new words', 'a rule for spelling new words'] }),
  phrase('approach_problem', 'a way of dealing with a difficult problem', 'an approach to a difficult problem', ['vocab_approach'], { chunks:['an approach', 'to', 'a difficult problem'], distortions:['a solution to a difficult problem', 'a warning about a difficult problem', 'a cause of a difficult problem'] }),
  phrase('revise_topics', 'to study the topics again before the test', 'to revise the topics before the test', ['vocab_revise'], { chunks:['to revise', 'the topics', 'before the test'], distortions:['to skip the topics before the test', 'to teach the topics before the test', 'to forget the topics before the test'] }),
  phrase('forecast_weather', 'to say what the weather will probably be like', 'to forecast the weather', ['vocab_forecast'], { chunks:['to forecast', 'the weather'], distortions:['to change the weather', 'to describe last week’s weather', 'to guess the weather without any information'] }),
  phrase('interfere_studies', 'to get in the way of your studies', 'to interfere with your studies', ['vocab_interfere'], { chunks:['to interfere', 'with your studies'], distortions:['to improve your studies', 'to finish your studies', 'to plan your studies'] }),
  phrase('distract_lesson', 'to take your attention away from the lesson', 'to distract you from the lesson', ['vocab_distract'], { chunks:['to distract', 'you', 'from the lesson'], distortions:['to bore you in the lesson', 'to help you in the lesson', 'to excuse you from the lesson'] }),
  phrase('evidence_claim', 'facts that support a claim', 'evidence to support a claim', ['vocab_evidence'], { chunks:['evidence', 'to support', 'a claim'], distortions:['proof that ends all doubt about a claim', 'opinions about a claim', 'questions about a claim'] }),
  phrase('guidance_teacher', 'help and advice from a teacher', 'guidance from a teacher', ['vocab_guidance'], { chunks:['guidance', 'from a teacher'], distortions:['orders from a teacher', 'punishment from a teacher', 'homework from a teacher'] }),
  phrase('academic_results', 'results in school and university study', 'academic results', ['vocab_academic'], { chunks:['academic', 'results'], distortions:['sporting results', 'election results', 'financial results'] }),
  phrase('concentration_task', 'the ability to give full attention to a task', 'concentration on a task', ['vocab_concentration'], { chunks:['concentration', 'on a task'], distortions:['motivation to start a task', 'permission to do a task', 'fear of a task'] }),
  phrase('complex_system', 'a system with many connected parts', 'a complex system', ['vocab_complex'], { chunks:['a complex', 'system'], distortions:['a cheap system', 'a broken system', 'a new system'] }),
  phrase('motivation_keep_working', 'the desire to keep working', 'motivation to keep working', ['vocab_motivation'], { chunks:['motivation', 'to keep working'], distortions:['permission to keep working', 'payment for working', 'ability to keep working'] }),
  phrase('curiosity_space', 'a strong wish to learn about space', 'curiosity about space', ['vocab_curiosity'], { chunks:['curiosity', 'about space'], distortions:['fear of space', 'knowledge of space', 'opinion about space'] }),
  phrase('technique_painting', 'a skilled method of painting', 'a technique for painting', ['vocab_technique'], { chunks:['a technique', 'for painting'], distortions:['a plan for painting', 'a reason for painting', 'a place for painting'] }),
  phrase('effective_method', 'a method that produces the intended result', 'an effective method', ['vocab_effective'], { chunks:['an effective', 'method'], distortions:['a quick method', 'a cheap method', 'a modern method'] }),
  phrase('inefficient_way_of_working', 'a way of working that wastes time and effort', 'an inefficient way of working', ['vocab_inefficient'], { chunks:['an inefficient', 'way of working'], distortions:['an ineffective way of working', 'a dangerous way of working', 'a slow way of working'] }),
  phrase('struggle_with_grammar', 'to find it hard to understand grammar', 'to struggle with grammar', ['vocab_struggle_6'], { chunks:['to struggle', 'with grammar'], distortions:['to improve quickly at grammar', 'to fight against grammar', 'to refuse to study grammar'] }),
  phrase('awareness_of_danger', 'understanding that the danger exists', 'awareness of the danger', ['vocab_awareness'], { chunks:['awareness', 'of the danger'], distortions:['fear of the danger', 'attention to the danger', 'a plan for the danger'] }),
  phrase('capacity_to_learn_quickly', 'the natural ability to learn quickly', 'a capacity to learn quickly', ['vocab_capacity'], { chunks:['a capacity', 'to learn quickly'], distortions:['a wish to learn quickly', 'a need to learn quickly', 'a plan to learn quickly'] }),
  phrase('feedback_on_an_essay', 'helpful comments on an essay', 'feedback on an essay', ['vocab_feedback'], { chunks:['feedback', 'on an essay'], distortions:['a mark for an essay', 'a reward for an essay', 'a title for an essay'] }),
  phrase('respond_to_a_question', 'to give an answer to a question', 'to respond to a question', ['vocab_respond'], { chunks:['to respond', 'to a question'], distortions:['to ask a question', 'to ignore a question', 'to repeat a question'] }),
  phrase('hesitation_before_answering', 'a short pause caused by doubt before you answer', 'hesitation before answering', ['vocab_hesitation'], { chunks:['hesitation', 'before answering'], distortions:['refusal to answer', 'a quick answer', 'anger before answering'] }),
  phrase('independent_learner', 'a learner who can study without constant help', 'an independent learner', ['vocab_independent'], { chunks:['an independent', 'learner'], distortions:['a lonely learner', 'a famous learner', 'a slow learner'] }),
  phrase('make_an_assumption', 'to accept an idea as true without checking it', 'to make an assumption', ['vocab_assumption'], { chunks:['to make', 'an assumption'], distortions:['to prove a claim', 'to ask a question', 'to make a plan'] }),
  phrase('different_perspective_problem', 'a different way of looking at the problem', 'a different perspective on the problem', ['vocab_perspective'], { chunks:['a different perspective', 'on the problem'], distortions:['a different solution to the problem', 'a different cause of the problem', 'a different mistake in the problem'] }),
  phrase('pressure_to_get_good_grades', 'strong demands to get good grades', 'pressure to get good grades', ['vocab_pressure_6'], { chunks:['pressure', 'to get good grades'], distortions:['a reward for good grades', 'a reason for good grades', 'help with good grades'] }),
  phrase('prioritise_urgent_jobs', 'to deal first with the most urgent jobs', 'to prioritise urgent jobs', ['vocab_prioritise'], { chunks:['to prioritise', 'urgent jobs'], distortions:['to avoid urgent jobs', 'to list urgent jobs', 'to share urgent jobs'] }),
  phrase('retain_new_facts', 'to keep new facts in your mind', 'to retain new facts', ['vocab_retain'], { chunks:['to retain', 'new facts'], distortions:['to forget new facts', 'to copy new facts', 'to teach new facts'] }),
  phrase('summarise_long_text', 'to give only the main points of a long text in a few lines', 'to summarise a long text in a few lines', ['vocab_summarise'], { chunks:['to summarise', 'a long text', 'in a few lines'], distortions:['to copy a long text in a few lines', 'to translate a long text in a few lines', 'to criticise a long text in a few lines'] }),
  phrase('coordination_between_departments', 'organised teamwork between departments', 'coordination between departments', ['vocab_coordination'], { chunks:['coordination', 'between departments'], distortions:['competition between departments', 'argument between departments', 'distance between departments'] }),
  phrase('cognitive_skills', 'skills that involve thinking and memory', 'cognitive skills', ['vocab_cognitive'], { chunks:['cognitive', 'skills'], distortions:['physical skills', 'social skills', 'financial skills'] }),
  phrase('achievement_hard_work', 'a great success earned through hard work', 'a great achievement', ['vocab_achievement_6'], { chunks:['a great', 'achievement'], distortions:['a great surprise', 'a great reward', 'a great mistake'] }),
  phrase('outcome_of_the_talks', 'the final result of the talks', 'the outcome of the talks', ['vocab_outcome'], { chunks:['the outcome', 'of the talks'], distortions:['the aim of the talks', 'the length of the talks', 'the cost of the talks'] }),
  phrase('focus_on_the_lesson', 'to give full attention to the lesson', 'to focus on the lesson', ['vocab_focus'], { chunks:['to focus', 'on the lesson'], distortions:['to look at the lesson', 'to arrive late for the lesson', 'to complain about the lesson'] }),
  phrase('memorise_the_vocabulary', 'to learn the vocabulary by heart', 'to memorise the vocabulary', ['vocab_memorise'], { chunks:['to memorise', 'the vocabulary'], distortions:['to translate the vocabulary', 'to explain the vocabulary', 'to forget the vocabulary'] }),
  phrase('insight_into_the_problem', 'a deeper understanding of the problem', 'insight into the problem', ['vocab_insight'], { chunks:['insight', 'into the problem'], distortions:['a quick solution to the problem', 'a warning about the problem', 'a complaint about the problem'] })
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
  ], ['vocab_passive']),
  idea('active', 'Students who are active in lessons usually remember more than students who only listen.', ['Students who take a full part in lessons generally remember more than those who simply listen.', 'Learners who are fully involved in class tend to recall more than learners who just listen.', 'Taking a real part in lessons helps students to remember more than listening alone does.'], 'comparison', 'remember more', [
    { text:'Students who are active in lessons usually remember less than students who only listen.', misconceptionCategory:'polarity_change' },
    { text:'Students who are physically energetic in lessons usually remember more than students who only listen.', misconceptionCategory:'meaning_confusion' },
    { text:'Students who are active in lessons always remember more than students who only listen.', misconceptionCategory:'degree_change' }
  ], ['vocab_active']),
  idea('evaluate', 'Teachers should evaluate each new method by comparing students’ results before and after it is introduced.', ['Teachers should judge how well each new method works by comparing students’ results from before and after its introduction.', 'Each new method should be judged by comparing the results that students achieved before it began with those they achieved afterwards.', 'Teachers ought to measure the success of every new method by looking at results from before and after it starts.'], 'comparison', 'before and after', [
    { text:'Teachers should evaluate each new method.', misconceptionCategory:'omitted_information' },
    { text:'Teachers should describe each new method by comparing students’ results before and after it is introduced.', misconceptionCategory:'meaning_confusion' },
    { text:'Teachers should evaluate each new method by comparing students’ results only after it is introduced.', misconceptionCategory:'time_change' }
  ], ['vocab_evaluate_6']),
  idea('reflect', 'Athletes who reflect on their mistakes after a match usually improve faster than those who ignore them.', ['Athletes who think carefully about their mistakes once a match is over generally improve more quickly than those who pay them no attention.', 'After a match, athletes who look back on what went wrong tend to get better faster than those who disregard it.', 'Improvement comes sooner for athletes who consider their errors after a game than for those who take no notice of them.'], 'comparison', 'improve faster', [
    { text:'Athletes who reflect on their mistakes after a match usually improve more slowly than those who ignore them.', misconceptionCategory:'polarity_change' },
    { text:'Athletes who reflect on their mistakes before a match usually improve faster than those who ignore them.', misconceptionCategory:'time_change' },
    { text:'Athletes who reflect on their mistakes after a match always improve faster than those who ignore them.', misconceptionCategory:'degree_change' }
  ], ['vocab_reflect']),
  idea('process', 'The brain can process only a limited amount of new information at one time, so very long lectures are rarely helpful.', ['Because the brain can take in and understand only a small amount of new information at once, very long lectures are rarely helpful.', 'Very long lectures seldom help, since the brain can make sense of only a limited amount of new information at a time.', 'The amount of new information that the brain can understand at one moment is limited, so lengthy lectures are seldom useful.'], 'cause_effect', 'limited capacity, so long lectures rarely help', [
    { text:'The brain can process only a limited amount of new information at one time because very long lectures are rarely helpful.', misconceptionCategory:'cause_effect_change' },
    { text:'The brain can process a very large amount of new information at one time, so very long lectures are often helpful.', misconceptionCategory:'quantity_change' },
    { text:'Very long lectures are rarely helpful.', misconceptionCategory:'omitted_information' }
  ], ['vocab_process']),
  idea('strategy', 'Successful learners usually have a strategy that combines short study sessions with regular self-testing.', ['Learners who do well generally follow a planned method that mixes short periods of study with frequent self-testing.', 'Most successful learners have a clear plan for reaching their goals that includes brief study sessions and regular self-testing.', 'A carefully planned method of short study sessions and regular self-testing is typical of successful learners.'], 'quantity', 'short sessions and regular self-testing', [
    { text:'Successful learners usually have a strategy that combines long study sessions with regular self-testing.', misconceptionCategory:'degree_change' },
    { text:'Successful learners rarely have a strategy that combines short study sessions with regular self-testing.', misconceptionCategory:'polarity_change' },
    { text:'Successful learners usually have a strategy that combines short study sessions.', misconceptionCategory:'omitted_information' }
  ], ['vocab_strategy']),
  idea('approach', 'The school has adopted a new approach to behaviour, which rewards good conduct instead of punishing poor conduct.', ['The school has introduced a different way of dealing with behaviour, in which good conduct is rewarded rather than poor conduct punished.', 'Instead of punishing bad conduct, the school now has a different method for behaviour that gives rewards for good conduct.', 'The school has switched to a new way of handling behaviour: it praises and rewards good conduct and no longer relies on punishment.'], 'polarity', 'rewards good conduct instead of punishing poor conduct', [
    { text:'The school has adopted a new approach to behaviour, which punishes poor conduct instead of rewarding good conduct.', misconceptionCategory:'polarity_change' },
    { text:'The school has adopted a new approach to behaviour.', misconceptionCategory:'omitted_information' },
    { text:'The school has adopted a new rule about behaviour, which rewards good conduct instead of punishing poor conduct.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_approach']),
  idea('revise', 'Students who revise a little every day usually feel calmer before a test than students who leave everything until the last night.', ['Students who go back over their work a little each day generally feel calmer before a test than those who put it all off until the final night.', 'Studying material again in small amounts every day tends to leave students calmer before a test than waiting until the last night does.', 'Those who prepare by studying for a short time each day usually feel less worried about a test than those who wait until the night before.'], 'comparison', 'calmer', [
    { text:'Students who revise a little every day usually feel more nervous before a test than students who leave everything until the last night.', misconceptionCategory:'polarity_change' },
    { text:'Students who revise a little every day feel exactly as calm before a test as students who leave everything until the last night.', misconceptionCategory:'comparison_change' },
    { text:'Students who revise for many hours every day usually feel calmer before a test than students who leave everything until the last night.', misconceptionCategory:'quantity_change' }
  ], ['vocab_revise']),
  idea('forecast', 'Economists forecast that house prices will fall slightly next year because interest rates are rising.', ['Economists expect, on the basis of current figures, a slight drop in house prices next year because interest rates are rising.', 'Because interest rates are rising, economists say that house prices are likely to fall a little next year.', 'Next year house prices will probably fall slightly, economists say, as a result of rising interest rates.'], 'degree', 'slightly', [
    { text:'Economists forecast that house prices will rise slightly next year because interest rates are rising.', misconceptionCategory:'polarity_change' },
    { text:'Economists forecast that house prices will fall sharply next year because interest rates are rising.', misconceptionCategory:'degree_change' },
    { text:'Economists forecast that house prices will fall slightly next year and that, as a result, interest rates are rising.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_forecast']),
  idea('interfere', 'Working late every night can interfere with a teenager’s sleep and concentration.', ['Working until late every night can get in the way of a teenager’s sleep and ability to pay attention.', 'If teenagers work late every night, their sleep and their ability to concentrate may suffer.', 'Late work every night can harm both the sleep and the attention span of a teenager.'], 'cause_effect', 'late work harms sleep and attention', [
    { text:'A lack of sleep and concentration can make a teenager work late every night.', misconceptionCategory:'cause_effect_change' },
    { text:'Working late every night can improve a teenager’s sleep and concentration.', misconceptionCategory:'polarity_change' },
    { text:'Working late once a month can interfere with a teenager’s sleep and concentration.', misconceptionCategory:'quantity_change' }
  ], ['vocab_interfere']),
  idea('distract', 'Notifications from a mobile phone can distract students from their work for several minutes at a time.', ['Messages that appear on a mobile phone can pull students’ attention away from their work for several minutes at a time.', 'A phone alert can draw students’ attention away from their work, sometimes for several minutes.', 'For several minutes at a time, alerts from a mobile phone can take students’ attention off what they are supposed to be doing.'], 'time', 'several minutes', [
    { text:'Notifications from a mobile phone can distract students from their work for a few seconds at a time.', misconceptionCategory:'time_change' },
    { text:'Notifications from a mobile phone can help students to concentrate on their work for several minutes at a time.', misconceptionCategory:'polarity_change' },
    { text:'Notifications from a mobile phone can distract students.', misconceptionCategory:'omitted_information' }
  ], ['vocab_distract']),
  idea('evidence', 'Researchers have found strong evidence that students who sleep eight hours remember more than students who sleep five.', ['Research gives solid support for the idea that students who sleep eight hours remember more than those who sleep five.', 'Studies strongly suggest that eight hours of sleep helps students to remember more than five hours does.', 'There is firm support in research for the view that students sleeping eight hours recall more than students sleeping five.'], 'comparison', 'remember more', [
    { text:'Researchers have found strong evidence that students who sleep eight hours remember less than students who sleep five.', misconceptionCategory:'polarity_change' },
    { text:'Researchers have proved beyond doubt that students who sleep eight hours remember more than students who sleep five.', misconceptionCategory:'degree_change' },
    { text:'Researchers have found strong evidence that students who sleep eight hours remember more than students who sleep seven.', misconceptionCategory:'quantity_change' }
  ], ['vocab_evidence']),
  idea('guidance', 'Teachers should offer guidance rather than orders, so that students still make their own decisions.', ['Teachers ought to give helpful advice instead of commands, leaving the decisions to the students.', 'Instead of telling students what to do, teachers should advise them and let them decide.', 'Students should be helped by their teachers to choose for themselves, not instructed what to choose.'], 'polarity', 'advice rather than orders', [
    { text:'Teachers should give orders rather than guidance, so that students do not make their own decisions.', misconceptionCategory:'polarity_change' },
    { text:'Teachers should offer guidance.', misconceptionCategory:'omitted_information' },
    { text:'Teachers should offer rewards rather than orders, so that students still make their own decisions.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_guidance']),
  idea('academic', 'Schools in the region are judged mainly on academic achievement, while sport and music receive less attention.', ['The region’s schools are assessed chiefly on how well students do in their studies, and sport and music matter less.', 'Success in study is the main measure of the region’s schools, with less weight given to sport and music.', 'Sport and music are given less attention than study results when schools in the region are assessed.'], 'comparison', 'mainly study results, less sport and music', [
    { text:'Schools in the region are judged mainly on sport and music, while academic achievement receives less attention.', misconceptionCategory:'comparison_change' },
    { text:'Schools in the region are judged partly on academic achievement, and sport and music receive equal attention.', misconceptionCategory:'degree_change' },
    { text:'Schools in the region are judged on academic achievement.', misconceptionCategory:'omitted_information' }
  ], ['vocab_academic']),
  idea('concentration', 'Short breaks every forty minutes can restore a student’s concentration, which usually falls during long lessons.', ['Taking a rest every forty minutes can bring back a student’s ability to pay full attention, which normally drops in long lessons.', 'In long lessons, a student’s attention normally declines, but a short pause every forty minutes can renew it.', 'A brief rest after each forty minutes of work helps students to give full attention again once it has weakened.'], 'time', 'every forty minutes', [
    { text:'Short breaks every ten minutes can restore a student’s concentration, which usually falls during long lessons.', misconceptionCategory:'time_change' },
    { text:'Short breaks every forty minutes can damage a student’s concentration, which usually rises during long lessons.', misconceptionCategory:'polarity_change' },
    { text:'A drop in concentration during long lessons can cause students to take short breaks every forty minutes.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_concentration']),
  idea('complex', 'Many scientists believe that the causes of the disease are complex, so no single treatment will cure it.', ['Many scientists think the disease has many connected causes that are hard to untangle, so no one treatment will cure it.', 'Because the causes of the disease are many and linked, many scientists expect that no single treatment will cure it.', 'A number of scientists say the disease has interlinked causes that are difficult to understand, so a cure will not come from one treatment.'], 'cause_effect', 'many connected causes, so no single cure', [
    { text:'Many scientists believe that no single treatment will cure the disease, so its causes are complex.', misconceptionCategory:'cause_effect_change' },
    { text:'A few scientists believe that the causes of the disease are complex, so no single treatment will cure it.', misconceptionCategory:'quantity_change' },
    { text:'Many scientists believe that the causes of the disease are simple, so a single treatment will cure it.', misconceptionCategory:'polarity_change' }
  ], ['vocab_complex']),
  idea('motivation', 'Students who set their own goals usually have more motivation than students who are simply told what to do.', ['Students who choose their own targets generally feel a stronger desire to work than those who are just given instructions.', 'Having their own goals gives students more reason to keep working than being told what to do does.', 'Learners are more driven when they decide their own aims than when others simply tell them what to do.'], 'comparison', 'more motivation', [
    { text:'Students who set their own goals usually have less motivation than students who are simply told what to do.', misconceptionCategory:'polarity_change' },
    { text:'Students who set their own goals usually have more concentration than students who are simply told what to do.', misconceptionCategory:'meaning_confusion' },
    { text:'Students who have more motivation usually set their own goals instead of being told what to do.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_motivation']),
  idea('curiosity', 'A young scientist’s curiosity about volcanoes led her to spend three summers studying them.', ['A young scientist’s strong wish to understand volcanoes led her to study them for three summers.', 'Because she was so eager to learn about volcanoes, a young scientist spent three summers studying them.', 'Three summers of study into volcanoes resulted from a young scientist’s eager interest in them.'], 'time', 'three summers', [
    { text:'A young scientist’s curiosity about volcanoes led her to spend one summer studying them.', misconceptionCategory:'quantity_change' },
    { text:'Three summers of studying volcanoes led a young scientist to feel curiosity about them.', misconceptionCategory:'cause_effect_change' },
    { text:'A young scientist’s fear of volcanoes led her to spend three summers studying them.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_curiosity']),
  idea('technique', 'A swimmer who improves her technique can swim faster without training for longer.', ['A swimmer who gets better at her skilled way of swimming can go faster without spending more time training.', 'By refining her method of swimming, a swimmer can increase her speed without longer training.', 'Faster swimming is possible through a better way of performing the strokes, with no need for extra hours of training.'], 'comparison', 'faster without longer training', [
    { text:'A swimmer who improves her technique swims more slowly even though she trains for longer.', misconceptionCategory:'polarity_change' },
    { text:'A swimmer who trains for longer can improve her technique without swimming faster.', misconceptionCategory:'cause_effect_change' },
    { text:'A swimmer who improves her technique can swim much faster without training for longer.', misconceptionCategory:'degree_change' }
  ], ['vocab_technique']),
  idea('effective', 'Experts say that regular, short lessons are more effective than a single long lesson once a week.', ['According to experts, frequent brief lessons get better results than one long weekly lesson.', 'Experts believe a single long weekly lesson works less well than regular short ones.', 'Short lessons that take place regularly achieve more, experts say, than one long lesson a week.'], 'comparison', 'more effective', [
    { text:'Experts say that regular, short lessons are less effective than a single long lesson once a week.', misconceptionCategory:'polarity_change' },
    { text:'Experts say that regular, short lessons are as effective as a single long lesson once a week.', misconceptionCategory:'comparison_change' },
    { text:'Experts say that regular, short lessons are cheaper than a single long lesson once a week.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_effective']),
  idea('inefficient', 'The city’s old bus network is inefficient: many buses run almost empty while others are overcrowded.', ['The city’s old bus network wastes resources, since many buses are almost empty and others are packed.', 'Poor use is made of the old bus network in the city, with some buses nearly empty and others overcrowded.', 'Resources on the city’s old bus network are not well used: a number of buses carry hardly anyone while others are overfull.'], 'polarity', 'not well used', [
    { text:'The city’s old bus network is well organised: buses are neither empty nor overcrowded.', misconceptionCategory:'polarity_change' },
    { text:'The city’s old bus network is inefficient.', misconceptionCategory:'omitted_information' },
    { text:'The city’s old bus network is unsafe: many buses run almost empty while others are overcrowded.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_inefficient']),
  idea('struggle', 'Many adults struggle to learn a new language because they have little time to practise.', ['Many adults find it hard to pick up a new language, since they rarely have time to practise.', 'Little time for practice makes learning a new language difficult for many adults.', 'A lack of practice time means numerous grown-ups have difficulty learning another language.'], 'cause_effect', 'little practice time causes difficulty', [
    { text:'Many adults learn a new language easily because they have a lot of time to practise.', misconceptionCategory:'polarity_change' },
    { text:'Many adults struggle to learn a new language.', misconceptionCategory:'omitted_information' },
    { text:'Many adults struggle to learn a new language because they are afraid of making mistakes.', misconceptionCategory:'cause_effect_change' }
  ], ['vocab_struggle_6']),
  idea('awareness', 'Awareness of road safety has increased sharply since the campaign began, especially among young drivers.', ['Since the campaign started, young drivers in particular have become much more conscious of road safety.', 'Knowledge of road safety has risen greatly since the campaign began, most of all among young drivers.', 'The campaign has led to a big rise in understanding of road safety, particularly for young drivers.'], 'degree', 'sharp increase', [
    { text:'Awareness of road safety has fallen sharply since the campaign began, especially among young drivers.', misconceptionCategory:'polarity_change' },
    { text:'Awareness of road safety has increased slightly since the campaign began, especially among young drivers.', misconceptionCategory:'degree_change' },
    { text:'Awareness of road safety has increased.', misconceptionCategory:'omitted_information' }
  ], ['vocab_awareness']),
  idea('capacity', 'Children have a greater capacity than adults to learn new sounds, although adults are better at studying grammar.', ['Children are naturally better able than adults to learn new sounds, but adults are stronger at studying grammar.', 'Adults do better at studying grammar, while children have more potential to pick up new sounds.', 'Although grammar study suits adults more, children have the greater natural ability to learn new sounds.'], 'comparison', 'children better with sounds, adults better with grammar', [
    { text:'Adults have a greater capacity than children to learn new sounds, although children are better at studying grammar.', misconceptionCategory:'comparison_change' },
    { text:'Children have a greater capacity than adults to learn new sounds.', misconceptionCategory:'omitted_information' },
    { text:'Children are more interested than adults in new sounds, although adults are better at studying grammar.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_capacity']),
  idea('feedback', 'Students improve faster when they receive feedback soon after finishing a task than when they wait a week.', ['Learners progress more quickly if comments on their work come straight after the task rather than a week later.', 'Getting helpful comments promptly after a task helps students to improve faster than waiting seven days does.', 'A week’s wait for comments slows improvement compared with receiving them soon after the task.'], 'time', 'soon after the task, not a week later', [
    { text:'Students improve faster when they receive feedback a week after finishing a task than when they receive it immediately.', misconceptionCategory:'time_change' },
    { text:'Students improve more slowly when they receive feedback soon after finishing a task than when they wait a week.', misconceptionCategory:'polarity_change' },
    { text:'Students improve faster when they receive feedback.', misconceptionCategory:'omitted_information' }
  ], ['vocab_feedback']),
  idea('respond', 'Patients respond better to treatment when they understand why the doctor has chosen it.', ['Patients react more positively to treatment if they understand the doctor’s reasons for choosing it.', 'Understanding the doctor’s reasons for a treatment makes patients react to it more positively.', 'Patients who are told why a treatment was chosen show a better reaction to it.'], 'cause_effect', 'understanding the reason leads to a better reaction', [
    { text:'Patients respond worse to treatment when they understand why the doctor has chosen it.', misconceptionCategory:'polarity_change' },
    { text:'Patients understand why the doctor has chosen a treatment when they respond better to it.', misconceptionCategory:'cause_effect_change' },
    { text:'Patients respond to treatment.', misconceptionCategory:'omitted_information' }
  ], ['vocab_respond']),
  idea('hesitation', 'After a long hesitation, the player took the penalty and scored.', ['The player was unsure for a long moment, then took the penalty and scored.', 'Only after a lengthy pause caused by uncertainty did the player take the penalty, and he scored.', 'The player paused for a long time, full of doubt, before taking the penalty and scoring.'], 'time', 'long pause before the penalty', [
    { text:'After a brief hesitation, the player took the penalty and scored.', misconceptionCategory:'degree_change' },
    { text:'Without any hesitation, the player took the penalty and scored.', misconceptionCategory:'polarity_change' },
    { text:'After a long argument, the player took the penalty and scored.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_hesitation']),
  idea('independent', 'Parents can help children to become independent by giving them small responsibilities from an early age.', ['Parents can help children learn to manage without constant help by giving them small responsibilities from an early age.', 'Giving children small duties when they are young helps them to learn to look after themselves.', 'From an early age, small responsibilities help children to cope without relying heavily on their parents.'], 'cause_effect', 'small responsibilities lead to self-reliance', [
    { text:'Parents can help children to become independent by doing everything for them from an early age.', misconceptionCategory:'cause_effect_change' },
    { text:'Parents can help children to become independent by giving them small responsibilities only when they are adults.', misconceptionCategory:'time_change' },
    { text:'Parents can help children to become independent.', misconceptionCategory:'omitted_information' }
  ], ['vocab_independent']),
  idea('assumption', 'The scientist realised that her whole experiment depended on an assumption that nobody had tested.', ['The scientist realised that her entire experiment relied on an idea, taken as true, that no one had checked.', 'Her whole experiment rested on a belief that had never been tested, the scientist realised.', 'The scientist saw that everything in her experiment depended on one untested idea that was simply taken to be true.'], 'quantity', 'whole experiment depended on one untested belief', [
    { text:'The scientist realised that part of her experiment depended on an assumption that nobody had tested.', misconceptionCategory:'quantity_change' },
    { text:'The scientist realised that her whole experiment depended on evidence that nobody had tested.', misconceptionCategory:'meaning_confusion' },
    { text:'The scientist realised that her whole experiment depended on an assumption that everybody had tested.', misconceptionCategory:'polarity_change' }
  ], ['vocab_assumption']),
  idea('perspective', 'Travelling abroad gave Ravi a new perspective on his own country, which he now sees as more diverse than he once thought.', ['Going overseas gave Ravi a fresh way of looking at his homeland, which he now finds more varied than he used to believe.', 'After travelling abroad, Ravi sees his own country differently and now finds it more diverse than before.', 'Spending time in other countries changed how Ravi thinks about his homeland; he now believes it is more varied than he once did.'], 'comparison', 'more diverse than before', [
    { text:'Travelling abroad gave Ravi a new perspective on his own country, which he now sees as less diverse than he once thought.', misconceptionCategory:'comparison_change' },
    { text:'Travelling abroad made Ravi miss his own country, which he now sees as more diverse than he once thought.', misconceptionCategory:'meaning_confusion' },
    { text:'Travelling abroad gave Ravi a new perspective on his own country.', misconceptionCategory:'omitted_information' }
  ], ['vocab_perspective']),
  idea('pressure', 'Some students perform worse under pressure, while others perform better.', ['Heavy expectations lower some students’ results and raise those of others.', 'When demands are high, certain students achieve less, while others achieve more.', 'Stress makes some students do less well, but it helps others to do better.'], 'comparison', 'worse for some, better for others', [
    { text:'All students perform worse under pressure.', misconceptionCategory:'quantity_change' },
    { text:'Some students perform worse under pressure.', misconceptionCategory:'omitted_information' },
    { text:'Some students perform worse under pressure, while others perform the same.', misconceptionCategory:'comparison_change' }
  ], ['vocab_pressure_6']),
  idea('prioritise', 'Hospitals prioritise patients with life-threatening injuries, so minor cases often wait for several hours.', ['Patients whose lives are in danger are treated first in hospitals, which is why minor cases are often left waiting for hours.', 'Because hospitals treat the most serious injuries before others, people with minor problems frequently wait for hours.', 'Minor cases often have a long wait in hospital, since life-threatening injuries are dealt with first.'], 'cause_effect', 'treating serious cases first causes long waits for minor cases', [
    { text:'Hospitals prioritise patients with minor injuries, so life-threatening cases often wait for several hours.', misconceptionCategory:'polarity_change' },
    { text:'Hospitals prioritise patients with life-threatening injuries because minor cases often wait for several hours.', misconceptionCategory:'cause_effect_change' },
    { text:'Hospitals prioritise patients with life-threatening injuries.', misconceptionCategory:'omitted_information' }
  ], ['vocab_prioritise']),
  idea('retain', 'People retain more of a lesson when they teach it to someone else than when they only read it.', ['Teaching a lesson to another person helps people to remember more than reading it alone does.', 'More of a lesson stays in the mind if people explain it to someone than if they simply read it.', 'Explaining a lesson to someone else is better for remembering it than reading it on your own.'], 'comparison', 'teaching gives better memory than reading', [
    { text:'People retain less of a lesson when they teach it to someone else than when they only read it.', misconceptionCategory:'polarity_change' },
    { text:'People retain the same amount from a lesson whether they teach it to someone else or only read it.', misconceptionCategory:'comparison_change' },
    { text:'People retain more of a lesson.', misconceptionCategory:'omitted_information' }
  ], ['vocab_retain']),
  idea('summarise', 'Candidates are asked to summarise the passage in fewer than one hundred words, leaving out the examples.', ['Candidates must give only the main points of the passage in under a hundred words and omit the examples.', 'In the exam, the passage has to be reduced to its key ideas, in less than a hundred words, without the examples.', 'The task is to state the key points of the passage briefly, using fewer than one hundred words and no examples.'], 'quantity', 'fewer than one hundred words', [
    { text:'Candidates are asked to summarise the passage in more than one hundred words, leaving out the examples.', misconceptionCategory:'quantity_change' },
    { text:'Candidates are asked to criticise the passage in fewer than one hundred words, leaving out the examples.', misconceptionCategory:'meaning_confusion' },
    { text:'Candidates are asked to summarise the passage.', misconceptionCategory:'omitted_information' }
  ], ['vocab_summarise']),
  idea('coordination', 'Poor coordination between the airline and the airport caused long delays for hundreds of passengers.', ['Because the airline and the airport did not work together well, hundreds of passengers faced long delays.', 'Hundreds of passengers waited a long time because the airline and the airport failed to organise their work together.', 'A lack of teamwork between the airline and the airport led to long delays for hundreds of passengers.'], 'cause_effect', 'poor teamwork caused long delays', [
    { text:'Long delays for hundreds of passengers caused poor coordination between the airline and the airport.', misconceptionCategory:'cause_effect_change' },
    { text:'Good coordination between the airline and the airport caused long delays for hundreds of passengers.', misconceptionCategory:'polarity_change' },
    { text:'Poor coordination between the airline and the airport caused long delays for a few passengers.', misconceptionCategory:'quantity_change' }
  ], ['vocab_coordination']),
  idea('cognitive', 'Regular exercise can improve cognitive abilities such as memory, especially in older adults.', ['Memory and other thinking abilities can get better through regular exercise, particularly for older adults.', 'Older adults in particular may find that regular exercise strengthens abilities like memory and thinking.', 'Taking exercise regularly may help thinking skills, for example memory, and the effect is strongest in older adults.'], 'degree', 'especially older adults', [
    { text:'Regular exercise can damage cognitive abilities such as memory, especially in older adults.', misconceptionCategory:'polarity_change' },
    { text:'Regular exercise can improve cognitive abilities such as memory, especially in young children.', misconceptionCategory:'meaning_confusion' },
    { text:'Regular exercise can improve cognitive abilities.', misconceptionCategory:'omitted_information' }
  ], ['vocab_cognitive']),
  idea('achievement', 'Finishing the course while caring for two children was a remarkable achievement for her.', ['It was an outstanding success for her to complete the course while looking after two children.', 'Completing the course while raising two children showed what she could do through great effort and ability.', 'She did something truly impressive by finishing the course while caring for two young children.'], 'degree', 'remarkable', [
    { text:'Finishing the course while caring for two children was a small achievement for her.', misconceptionCategory:'degree_change' },
    { text:'Finishing the course while caring for two children was not an achievement for her.', misconceptionCategory:'polarity_change' },
    { text:'Finishing the course was an achievement for her.', misconceptionCategory:'omitted_information' }
  ], ['vocab_achievement_6']),
  idea('outcome', 'The outcome of the match was decided by a single goal in the last minute.', ['One goal in the final minute decided who won the match.', 'The result of the game came down to one goal scored right at the end.', 'A last-minute goal settled how the match finished.'], 'time', 'one goal in the last minute', [
    { text:'The outcome of the match was decided by a single goal in the first minute.', misconceptionCategory:'time_change' },
    { text:'The outcome of the match was decided by three goals in the last minute.', misconceptionCategory:'quantity_change' },
    { text:'The outcome of the match was decided by a single goal.', misconceptionCategory:'omitted_information' }
  ], ['vocab_outcome']),
  idea('focus', 'Students who focus on one task at a time usually make fewer mistakes than those who switch between tasks.', ['Working on a single task at a time usually leads to fewer mistakes than moving between tasks.', 'Fewer mistakes are usually made by students who give full attention to one task at a time than by those who keep changing tasks.', 'Those who keep their attention on one job at once tend to make fewer errors than students who jump between jobs.'], 'comparison', 'one task at a time gives fewer mistakes', [
    { text:'Students who focus on one task at a time usually make more mistakes than those who switch between tasks.', misconceptionCategory:'polarity_change' },
    { text:'Students who focus on one task at a time make the same number of mistakes as those who switch between tasks.', misconceptionCategory:'comparison_change' },
    { text:'Students who focus on one task at a time usually make fewer mistakes.', misconceptionCategory:'omitted_information' }
  ], ['vocab_focus']),
  idea('memorise', 'It is easier to memorise a long number if you divide it into short groups.', ['Splitting a long number into short groups makes it easier to learn by heart.', 'A long number is easier to learn exactly if it is divided into small groups.', 'Dividing a long number into short groups helps you to learn it so that you can repeat it exactly.'], 'cause_effect', 'dividing into groups makes learning easier', [
    { text:'It is harder to memorise a long number if you divide it into short groups.', misconceptionCategory:'polarity_change' },
    { text:'It is easier to divide a long number into short groups if you memorise it.', misconceptionCategory:'cause_effect_change' },
    { text:'It is easier to memorise a long number.', misconceptionCategory:'omitted_information' }
  ], ['vocab_memorise']),
  idea('insight', 'Reading the manager’s emails gave the investigator real insight into why the project had failed.', ['The investigator came to understand much better why the project had failed after reading the manager’s emails.', 'By reading the manager’s emails, the investigator gained a clear understanding of the reasons for the project’s failure.', 'The manager’s emails helped the investigator to see more deeply why the project failed.'], 'cause_effect', 'reading the emails led to deeper understanding', [
    { text:'The investigator read the manager’s emails because he already had insight into why the project had failed.', misconceptionCategory:'cause_effect_change' },
    { text:'Reading the manager’s emails gave the investigator no insight into why the project had failed.', misconceptionCategory:'polarity_change' },
    { text:'Reading the manager’s emails gave the investigator real information about the cost of the project.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_insight'])
];

export default [...phraseSets, ...ideaSets];
