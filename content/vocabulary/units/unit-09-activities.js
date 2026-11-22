// Unit 9 · Paraphrasing content (phrase_set and idea_set), WORDS 1–50 (complete). Same record shapes and contract as unit-08-activities.js:
//   phrase_set : originalPhrase (plain wording) -> equivalentPhrase (contains the target), acceptedVariants, chunks, commonMeaningDistortions
//   idea_set   : originalIdea (contains the target) with accurate paraphrases that do NOT contain it, a meaning invariant, and three
//                meaning-changing distractors each tagged with the misconception it represents.
// Every record is linked to exactly one Unit 9 word.
const status = 'approved';
const unitNumber = 9;

function phrase(id, originalPhrase, equivalentPhrase, linkedVocabularyIds, { acceptedVariants = [], chunks = null, distortions = [] } = {}) {
  return {
    activityContentId:`u9_phrase_${id}`, unitNumber, contentType:'phrase_set', status,
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
    activityContentId:`u9_idea_${id}`, unitNumber, contentType:'idea_set', status,
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
  phrase('communication_main', 'the sharing of information between staff', 'communication between staff', ['vocab_communication'], { chunks:['communication', 'between staff'], distortions:['competition between staff', 'arguments between staff', 'payment between staff'] }),
  phrase('signalling_main', 'waving to show the driver to stop', 'signalling to the driver to stop', ['vocab_signalling'], { chunks:['signalling to the driver', 'to stop'], distortions:['shouting at the driver to stop', 'paying the driver to stop', 'hiding from the driver to stop'] }),
  phrase('represent_main', 'speak and act for the whole class', 'represent the whole class', ['vocab_represent'], { chunks:['represent', 'the whole class'], distortions:['teach the whole class', 'punish the whole class', 'leave the whole class'] }),
  phrase('effective_main', 'a way of learning that works well', 'an effective way of learning', ['vocab_effective_9'], { chunks:['an effective way', 'of learning'], distortions:['an expensive way of learning', 'a slow way of learning', 'an old way of learning'] }),
  phrase('portable_main', 'a speaker that is easy to carry', 'a portable speaker', ['vocab_portable'], { chunks:['a portable', 'speaker'], distortions:['a powerful speaker', 'a broken speaker', 'a heavy speaker'] }),
  phrase('demonstrate_main', 'show people how to use the app', 'demonstrate how to use the app', ['vocab_demonstrate_9'], { chunks:['demonstrate', 'how to use the app'], distortions:['forget how to use the app', 'ask how to use the app', 'guess how to use the app'] }),
  phrase('launched_main', 'introduced a new app to the public', 'launched a new app', ['vocab_launched_9'], { chunks:['launched', 'a new app'], distortions:['deleted a new app', 'tested a new app', 'criticised a new app'] }),
  phrase('passive_main', 'viewers who just watch and do nothing', 'passive viewers', ['vocab_passive_9'], { chunks:['passive', 'viewers'], distortions:['angry viewers', 'young viewers', 'regular viewers'] }),
  phrase('interactive_main', 'a whiteboard that responds when you touch it', 'an interactive whiteboard', ['vocab_interactive_9'], { chunks:['an interactive', 'whiteboard'], distortions:['an expensive whiteboard', 'a dirty whiteboard', 'an old whiteboard'] }),
  phrase('tech_savvy_main', 'young people who are good with technology', 'tech-savvy young people', ['vocab_tech_savvy'], { chunks:['tech-savvy', 'young people'], distortions:['lazy young people', 'unemployed young people', 'shy young people'] }),
  phrase('digital_native_main', 'someone who grew up using the internet', 'a digital native', ['vocab_digital_native'], { chunks:['a digital', 'native'], distortions:['a computer repairer', 'a foreign visitor', 'a website designer'] }),
  phrase('accuracy_main', 'how correct the information is', 'the accuracy of the information', ['vocab_accuracy'], { chunks:['the accuracy', 'of the information'], distortions:['the amount of the information', 'the source of the information', 'the age of the information'] }),
  phrase('appropriate_main', 'suitable for a job interview', 'appropriate for a job interview', ['vocab_appropriate'], { chunks:['appropriate', 'for a job interview'], distortions:['late for a job interview', 'nervous before a job interview', 'famous for a job interview'] }),
  phrase('banned_main', 'not allowed in the classroom', 'banned in the classroom', ['vocab_banned'], { chunks:['banned', 'in the classroom'], distortions:['popular in the classroom', 'required in the classroom', 'lost in the classroom'] }),
  phrase('community_main', 'the people who live in the area', 'the local community', ['vocab_community'], { chunks:['the local', 'community'], distortions:['the local council', 'the local shops', 'the local tourists'] }),
  phrase('optional_main', 'a subject that you can choose not to take', 'an optional subject', ['vocab_optional'], { chunks:['an optional', 'subject'], distortions:['a compulsory subject', 'a difficult subject', 'a popular subject'] }),
  phrase('survive_main', 'continue to exist in the future', 'survive in the future', ['vocab_survive'], { chunks:['survive', 'in the future'], distortions:['disappear in the future', 'change in the future', 'grow in the future'] }),
  phrase('unlike_main', 'different from most teenagers', 'unlike most teenagers', ['vocab_unlike'], { chunks:['unlike', 'most teenagers'], distortions:['like most teenagers', 'with most teenagers', 'for most teenagers'] }),
  phrase('frustration_main', 'feeling annoyed because nothing worked', 'frustration because nothing worked', ['vocab_frustration'], { chunks:['frustration', 'because nothing worked'], distortions:['relief because nothing worked', 'pride because nothing worked', 'excitement because nothing worked'] }),
  phrase('informal_main', 'a relaxed chat with no official rules', 'an informal chat', ['vocab_informal'], { chunks:['an informal', 'chat'], distortions:['an official chat', 'an angry chat', 'a secret chat'] }),
  phrase('casual_main', 'relaxed, everyday clothes', 'casual clothes', ['vocab_casual'], { chunks:['casual', 'clothes'], distortions:['smart clothes', 'expensive clothes', 'warm clothes'] }),
  phrase('workforce_main', 'all the people who work for the company', 'the company’s workforce', ['vocab_workforce'], { chunks:['the company’s', 'workforce'], distortions:['the company’s customers', 'the company’s owners', 'the company’s products'] }),
  phrase('generation_main', 'people of my grandparents’ age', 'my grandparents’ generation', ['vocab_generation_9'], { chunks:['my grandparents’', 'generation'], distortions:['my grandparents’ house', 'my grandparents’ neighbours', 'my grandparents’ country'] }),
  phrase('perception_main', 'the way the public sees social media', 'the public perception of social media', ['vocab_perception'], { chunks:['the public perception', 'of social media'], distortions:['the public cost of social media', 'the public history of social media', 'the public rules of social media'] }),
  phrase('non_verbal_main', 'communication without words', 'non-verbal communication', ['vocab_non_verbal'], { chunks:['non-verbal', 'communication'], distortions:['written communication', 'spoken communication', 'online communication'] })
];
phraseSets.push(
  phrase('underlying_main', 'the real, hidden cause of the problem', 'the underlying cause of the problem', ['vocab_underlying'], { chunks:['the underlying cause', 'of the problem'], distortions:['the obvious cause of the problem', 'the latest cause of the problem', 'the smallest cause of the problem'] }),
  phrase('differentiate_main', 'tell the difference between fact and opinion', 'differentiate between fact and opinion', ['vocab_differentiate'], { chunks:['differentiate', 'between fact and opinion'], distortions:['confuse fact and opinion', 'combine fact and opinion', 'ignore fact and opinion'] }),
  phrase('physical_main', 'a real shop that you can walk into', 'a physical shop', ['vocab_physical'], { chunks:['a physical', 'shop'], distortions:['an online shop', 'an empty shop', 'a closed shop'] }),
  phrase('platform_main', 'an online service for sharing videos', 'a video-sharing platform', ['vocab_platform'], { chunks:['a video-sharing', 'platform'], distortions:['a video-sharing camera', 'a video-sharing company owner', 'a video-sharing cable'] }),
  phrase('virtual_main', 'a meeting held online', 'a virtual meeting', ['vocab_virtual'], { chunks:['a virtual', 'meeting'], distortions:['a long meeting', 'a secret meeting', 'a cancelled meeting'] }),
  phrase('face_to_face_main', 'a meeting in person', 'a face-to-face meeting', ['vocab_face_to_face'], { chunks:['a face-to-face', 'meeting'], distortions:['an online meeting', 'a telephone meeting', 'a written meeting'] }),
  phrase('conference_main', 'a large formal meeting about education', 'a conference on education', ['vocab_conference'], { chunks:['a conference', 'on education'], distortions:['a book on education', 'a tax on education', 'a website on education'] }),
  phrase('suitable_main', 'right for young children', 'suitable for young children', ['vocab_suitable'], { chunks:['suitable', 'for young children'], distortions:['dangerous for young children', 'expensive for young children', 'boring for young children'] }),
  phrase('underlying_meaning_main', 'the hidden message of the poem', 'the underlying meaning of the poem', ['vocab_underlying_meaning'], { chunks:['the underlying meaning', 'of the poem'], distortions:['the title of the poem', 'the length of the poem', 'the author of the poem'] }),
  phrase('informal_language_main', 'chatty words such as “gonna” and “stuff”', 'informal language such as “gonna” and “stuff”', ['vocab_informal_language'], { chunks:['informal language', 'such as “gonna” and “stuff”'], distortions:['technical terms such as “gonna” and “stuff”', 'formal words such as “gonna” and “stuff”', 'foreign words such as “gonna” and “stuff”'] }),
  phrase('formal_style_main', 'a serious, polite way of writing', 'a formal style', ['vocab_formal_style'], { chunks:['a formal', 'style'], distortions:['a chatty style', 'a funny style', 'a careless style'] }),
  phrase('reporting_verb_main', 'a verb such as “claimed” that tells us what someone said', 'a reporting verb such as “claimed”', ['vocab_reporting_verb'], { chunks:['a reporting verb', 'such as “claimed”'], distortions:['an adverb such as “claimed”', 'a noun such as “claimed”', 'a question word such as “claimed”'] }),
  phrase('direct_object_main', 'the thing that receives the action of the verb', 'the direct object of the verb', ['vocab_direct_object'], { chunks:['the direct object', 'of the verb'], distortions:['the subject of the verb', 'the tense of the verb', 'the spelling of the verb'] }),
  phrase('clause_main', 'a group of words with its own subject and verb', 'a clause', ['vocab_clause'], { chunks:['a', 'clause'], distortions:['an adjective', 'a full stop', 'a paragraph'] }),
  phrase('suggest_main', 'put forward the idea of meeting online', 'suggest meeting online', ['vocab_suggest'], { chunks:['suggest', 'meeting online'], distortions:['refuse meeting online', 'forbid meeting online', 'regret meeting online'] }),
  phrase('recommend_main', 'advise people to visit the museum', 'recommend visiting the museum', ['vocab_recommend_9'], { chunks:['recommend', 'visiting the museum'], distortions:['avoid visiting the museum', 'regret visiting the museum', 'stop visiting the museum'] }),
  phrase('solution_main', 'a way of dealing with the problem', 'a solution to the problem', ['vocab_solution_9'], { chunks:['a solution', 'to the problem'], distortions:['a cause of the problem', 'a report on the problem', 'a witness to the problem'] }),
  phrase('introduction_main', 'the opening part of the essay', 'the introduction to the essay', ['vocab_introduction'], { chunks:['the introduction', 'to the essay'], distortions:['the ending of the essay', 'the title of the essay', 'the mark for the essay'] }),
  phrase('conclusion_main', 'the final part of the report', 'the conclusion of the report', ['vocab_conclusion'], { chunks:['the conclusion', 'of the report'], distortions:['the opening of the report', 'the author of the report', 'the cover of the report'] }),
  phrase('audience_main', 'the people who read the magazine', 'the magazine’s audience', ['vocab_audience'], { chunks:['the magazine’s', 'audience'], distortions:['the magazine’s editors', 'the magazine’s printers', 'the magazine’s owners'] }),
  phrase('purpose_main', 'the main aim of the report', 'the main purpose of the report', ['vocab_purpose'], { chunks:['the main purpose', 'of the report'], distortions:['the main author of the report', 'the main length of the report', 'the main reader of the report'] }),
  phrase('evaluate_main', 'judge how reliable the sources are', 'evaluate the sources', ['vocab_evaluate_9'], { chunks:['evaluate', 'the sources'], distortions:['copy the sources', 'list the sources', 'ignore the sources'] }),
  phrase('relevant_main', 'connected with the question', 'relevant to the question', ['vocab_relevant_9'], { chunks:['relevant', 'to the question'], distortions:['opposed to the question', 'harmful to the question', 'new to the question'] }),
  phrase('constructive_main', 'helpful comments that show how to improve', 'constructive comments', ['vocab_constructive'], { chunks:['constructive', 'comments'], distortions:['rude comments', 'short comments', 'anonymous comments'] }),
  phrase('research_main', 'a careful study of how phones affect sleep', 'research into how phones affect sleep', ['vocab_research'], { chunks:['research', 'into how phones affect sleep'], distortions:['rumours about how phones affect sleep', 'guesses about how phones affect sleep', 'adverts about how phones affect sleep'] })
);
const ideaSets = [
  idea('communication', 'Good communication between the coach and the players helped the team win.', ['The team won partly because the coach and the players shared information clearly.', 'Because the coach and players understood each other well, the team was successful.', 'Clear contact and exchange of ideas between the coach and the players helped them win.'], 'cause_effect', 'sharing information clearly helped', [
    { text:'Strong competition between the coach and the players helped the team win.', misconceptionCategory:'meaning_confusion' },
    { text:'Poor contact between the coach and the players helped the team win.', misconceptionCategory:'polarity_change' },
    { text:'Good contact between the coach and the players will help the team win.', misconceptionCategory:'time_change' }
  ], ['vocab_communication']),
  idea('signalling', 'The police officer was signalling to the drivers to slow down.', ['The police officer was using hand movements to tell the drivers to slow down.', 'With gestures, the police officer was showing the drivers that they should go more slowly.', 'The officer was giving the drivers a sign to reduce their speed.'], 'meaning', 'using movements to give a message', [
    { text:'The police officer was shouting at the drivers to slow down.', misconceptionCategory:'meaning_confusion' },
    { text:'The police officer was signalling to the drivers to speed up.', misconceptionCategory:'polarity_change' },
    { text:'The drivers were signalling to the police officer to slow down.', misconceptionCategory:'role_reversal' }
  ], ['vocab_signalling']),
  idea('represent', 'Two students were chosen to represent the school at the national debate.', ['Two students were selected to speak for the school at the national debate.', 'The school picked two students to take part in the national debate on its behalf.', 'At the national debate, two chosen students acted for the school.'], 'meaning', 'act or speak for', [
    { text:'Two students were chosen to judge the school at the national debate.', misconceptionCategory:'meaning_confusion' },
    { text:'Twenty students were chosen to speak for the school at the national debate.', misconceptionCategory:'quantity_change' },
    { text:'Two students will be chosen to speak for the school at the national debate.', misconceptionCategory:'time_change' }
  ], ['vocab_represent']),
  idea('effective', 'Short daily practice is more effective than one long session each week.', ['Practising a little every day works better than one long session a week.', 'A short session every day gives better results than a single long one weekly.', 'You get better results from brief practice each day than from one long weekly session.'], 'comparison', 'daily practice works better', [
    { text:'Short daily practice is less successful than one long session each week.', misconceptionCategory:'comparison_reversal' },
    { text:'Short daily practice is more enjoyable than one long session each week.', misconceptionCategory:'meaning_confusion' },
    { text:'Short daily practice is as successful as one long session each week.', misconceptionCategory:'degree_change' }
  ], ['vocab_effective_9']),
  idea('portable', 'The new speaker is small and portable, so you can take it anywhere.', ['The new speaker is little and easy to carry, so it can go everywhere with you.', 'Because the new speaker is small and light to carry, you can bring it wherever you go.', 'You can take the new speaker anywhere because it is compact and easy to move.'], 'meaning', 'easy to carry', [
    { text:'The new speaker is small and powerful, so you can take it anywhere.', misconceptionCategory:'meaning_confusion' },
    { text:'The new speaker is large and fixed, so you cannot take it anywhere.', misconceptionCategory:'polarity_change' },
    { text:'The old speaker was small and easy to carry, so you could take it anywhere.', misconceptionCategory:'time_change' }
  ], ['vocab_portable']),
  idea('demonstrate', 'The study demonstrates that students remember more when they take handwritten notes.', ['The study shows clearly that students who write notes by hand remember more.', 'According to the study, taking notes by hand helps students remember more.', 'The study proves that handwritten notes help students to remember more.'], 'meaning', 'shows clearly', [
    { text:'The study suggests that students might remember more when they take handwritten notes.', misconceptionCategory:'certainty_change' },
    { text:'The study shows that students remember less when they take handwritten notes.', misconceptionCategory:'polarity_change' },
    { text:'The study shows that teachers remember more when they take handwritten notes.', misconceptionCategory:'role_change' }
  ], ['vocab_demonstrate_9']),
  idea('launched', 'The charity launched an online campaign to help children learn to read.', ['The charity started an online campaign to help children learn to read.', 'An internet campaign to help children read was begun by the charity.', 'The charity began a campaign on the internet so that more children could learn to read.'], 'meaning', 'started', [
    { text:'The charity ended an online campaign to help children learn to read.', misconceptionCategory:'polarity_change' },
    { text:'The charity criticised an online campaign to help children learn to read.', misconceptionCategory:'meaning_confusion' },
    { text:'The charity is planning an online campaign to help children learn to read.', misconceptionCategory:'time_change' }
  ], ['vocab_launched_9']),
  idea('passive', 'Watching videos is a passive activity, while making them is creative.', ['Watching videos does not involve taking part, but making them involves creativity.', 'People who watch videos only receive them, while people who make them create something.', 'Viewing videos requires no active involvement, unlike making them, which is creative.'], 'contrast', 'watching involves no active part', [
    { text:'Watching videos is a creative activity, while making them is easy.', misconceptionCategory:'meaning_confusion' },
    { text:'Watching videos is an active activity, while making them is creative.', misconceptionCategory:'polarity_change' },
    { text:'Making videos involves no active part, while watching them is creative.', misconceptionCategory:'role_reversal' }
  ], ['vocab_passive_9']),
  idea('interactive', 'The new website is interactive, so visitors can ask questions and get answers immediately.', ['Visitors to the new website can take part by asking questions and receiving instant answers.', 'The new website responds to its users, who can ask questions and get answers at once.', 'Because the new website reacts to users, people can ask questions and receive replies straight away.'], 'meaning', 'responds to users', [
    { text:'The new website is popular, so visitors can ask questions and get answers immediately.', misconceptionCategory:'meaning_confusion' },
    { text:'The new website is one-way, so visitors cannot ask questions or get answers.', misconceptionCategory:'polarity_change' },
    { text:'The new website will soon respond to users, so visitors will be able to ask questions.', misconceptionCategory:'time_change' }
  ], ['vocab_interactive_9']),
  idea('tech_savvy', 'My grandfather is surprisingly tech-savvy and edits his own videos.', ['My grandfather is unexpectedly good with technology and edits his own videos.', 'Surprisingly, my grandfather knows a lot about modern technology and edits his own videos.', 'My grandfather understands technology well, which is surprising, and he edits his own videos.'], 'meaning', 'good with technology', [
    { text:'My grandfather is surprisingly afraid of technology but edits his own videos.', misconceptionCategory:'polarity_change' },
    { text:'My grandfather is surprisingly famous and edits his own videos.', misconceptionCategory:'meaning_confusion' },
    { text:'My grandfather is a little good with technology and sometimes watches videos.', misconceptionCategory:'degree_change' }
  ], ['vocab_tech_savvy']),
  idea('digital_native', 'As a digital native, Mia learned to use a tablet before she could read.', ['Mia grew up with technology, so she could use a tablet before she was able to read.', 'Having been surrounded by digital devices from birth, Mia used a tablet before she learned to read.', 'Mia has used technology all her life and could work a tablet before reading.'], 'meaning', 'grew up with digital technology', [
    { text:'As a computer engineer, Mia learned to use a tablet before she could read.', misconceptionCategory:'meaning_confusion' },
    { text:'As someone who came to technology late, Mia learned to use a tablet after she could read.', misconceptionCategory:'polarity_change' },
    { text:'As someone who grew up with technology, Mia learned to read before she could use a tablet.', misconceptionCategory:'time_change' }
  ], ['vocab_digital_native']),
  idea('accuracy', 'Journalists must check the accuracy of every fact before publishing a story.', ['Before a story is published, journalists have to make sure every fact is correct.', 'Every fact must be checked for correctness by journalists before a story appears.', 'Journalists need to confirm that each fact is right before they publish a story.'], 'meaning', 'correctness', [
    { text:'Journalists must check the popularity of every fact before publishing a story.', misconceptionCategory:'meaning_confusion' },
    { text:'Journalists must check the correctness of some facts after publishing a story.', misconceptionCategory:'time_change' },
    { text:'Readers must check the correctness of every fact before journalists publish a story.', misconceptionCategory:'role_reversal' }
  ], ['vocab_accuracy']),
  idea('appropriate', 'Shorts and flip-flops are not appropriate for a job interview.', ['Shorts and flip-flops are not suitable clothes for a job interview.', 'You should not wear shorts and flip-flops to a job interview because they are not right for it.', 'A job interview is the wrong situation for shorts and flip-flops.'], 'meaning', 'suitable', [
    { text:'Shorts and flip-flops are not comfortable for a job interview.', misconceptionCategory:'meaning_confusion' },
    { text:'Shorts and flip-flops are perfectly suitable for a job interview.', misconceptionCategory:'polarity_change' },
    { text:'Shorts and flip-flops are not suitable for a day at the beach.', misconceptionCategory:'scope_change' }
  ], ['vocab_appropriate']),
  idea('banned', 'Mobile phones are banned during exams at our school.', ['At our school, mobile phones are not allowed during exams.', 'Our school does not permit students to use mobile phones in exams.', 'During exams at our school, phones are forbidden.'], 'meaning', 'not allowed', [
    { text:'Mobile phones are required during exams at our school.', misconceptionCategory:'polarity_change' },
    { text:'Mobile phones are sold during exams at our school.', misconceptionCategory:'meaning_confusion' },
    { text:'Mobile phones will be forbidden during exams at our school next year.', misconceptionCategory:'time_change' }
  ], ['vocab_banned']),
  idea('community', 'The whole community helped to rebuild the library after the flood.', ['Everyone in the area helped to rebuild the library after the flood.', 'After the flood, all the local people worked together to rebuild the library.', 'The people living in the area all joined in to rebuild the library when the flood was over.'], 'meaning', 'the people of the area', [
    { text:'The whole council helped to rebuild the library after the flood.', misconceptionCategory:'meaning_confusion' },
    { text:'A few local people helped to rebuild the library after the flood.', misconceptionCategory:'quantity_change' },
    { text:'All the local people damaged the library during the flood.', misconceptionCategory:'action_change' }
  ], ['vocab_community']),
  idea('optional', 'The extra Saturday class is optional, so nobody has to attend.', ['Students can choose whether to go to the extra Saturday class; it is not required.', 'Nobody is forced to attend the extra Saturday class because it is a matter of choice.', 'Going to the extra Saturday class is up to each student.'], 'meaning', 'a matter of choice', [
    { text:'The extra Saturday class is compulsory, so everybody has to attend.', misconceptionCategory:'polarity_change' },
    { text:'The extra Saturday class is cancelled, so nobody can attend.', misconceptionCategory:'meaning_confusion' },
    { text:'The extra Saturday class was a matter of choice last year.', misconceptionCategory:'time_change' }
  ], ['vocab_optional']),
  idea('survive', 'Some experts think that printed newspapers will not survive for another twenty years.', ['Some experts believe printed newspapers will have disappeared within twenty years.', 'According to some experts, printed newspapers will stop existing in the next twenty years.', 'Some experts expect that printed newspapers will not continue to exist for twenty more years.'], 'meaning', 'continue to exist', [
    { text:'Some experts think that printed newspapers will become more popular in the next twenty years.', misconceptionCategory:'meaning_confusion' },
    { text:'All experts are sure that printed newspapers will disappear in twenty years.', misconceptionCategory:'certainty_change' },
    { text:'Some experts think that printed newspapers will continue to exist for another twenty years.', misconceptionCategory:'polarity_change' }
  ], ['vocab_survive']),
  idea('unlike', 'Unlike her sister, Amy prefers to phone people rather than send messages.', ['Amy, who is different from her sister, would rather phone people than message them.', 'Amy likes phone calls more than messages, but her sister does not.', 'In contrast to her sister, Amy chooses calling over sending messages.'], 'contrast', 'different from her sister', [
    { text:'Like her sister, Amy prefers to phone people rather than send messages.', misconceptionCategory:'polarity_change' },
    { text:'Unlike Amy, her sister prefers to phone people rather than send messages.', misconceptionCategory:'role_reversal' },
    { text:'Because of her sister, Amy prefers to phone people rather than send messages.', misconceptionCategory:'cause_change' }
  ], ['vocab_unlike']),
  idea('frustration', 'He felt great frustration when the website crashed for the third time.', ['He felt very annoyed when the website stopped working for the third time.', 'When the website broke down again for the third time, he was extremely irritated.', 'The third crash of the website made him feel really annoyed and helpless.'], 'meaning', 'annoyed because unable to do something', [
    { text:'He felt great relief when the website crashed for the third time.', misconceptionCategory:'polarity_change' },
    { text:'He felt slight annoyance when the website crashed for the third time.', misconceptionCategory:'degree_change' },
    { text:'He felt great fear when the website crashed for the third time.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_frustration']),
  idea('informal', 'You can use an informal style in a message to a close friend.', ['A relaxed, chatty style is fine when you write to a close friend.', 'When messaging a good friend, you do not need to write formally.', 'Writing to a close friend allows a casual, friendly way of writing.'], 'meaning', 'relaxed and friendly', [
    { text:'You must use a formal style in a message to a close friend.', misconceptionCategory:'polarity_change' },
    { text:'You can use a relaxed style in a letter to a head teacher.', misconceptionCategory:'scope_change' },
    { text:'You can use a funny style in a message to a close friend.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_informal']),
  idea('casual', 'Most people wear casual clothes to the office on Fridays.', ['On Fridays, most people go to the office in relaxed, everyday clothes.', 'Most office workers dress comfortably rather than smartly on Fridays.', 'Fridays are a day when most people wear informal clothes to work.'], 'meaning', 'relaxed and everyday', [
    { text:'Most people wear smart clothes to the office on Fridays.', misconceptionCategory:'polarity_change' },
    { text:'A few people wear relaxed clothes to the office on Fridays.', misconceptionCategory:'quantity_change' },
    { text:'Most people wear expensive clothes to the office on Fridays.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_casual']),
  idea('workforce', 'Over half of the company’s workforce now works from home.', ['More than half of the people employed by the company now work from home.', 'Most of the company’s staff now do their jobs at home.', 'Over fifty per cent of the company’s employees currently work from home.'], 'quantity', 'more than half of the workers', [
    { text:'Over half of the company’s customers now shop from home.', misconceptionCategory:'meaning_confusion' },
    { text:'A small number of the company’s employees now work from home.', misconceptionCategory:'quantity_change' },
    { text:'Over half of the company’s employees used to work from home.', misconceptionCategory:'time_change' }
  ], ['vocab_workforce']),
  idea('generation', 'The older generation often prefers phone calls to text messages.', ['Older people as a group often like phone calls more than text messages.', 'People of an older age group tend to choose calls rather than messages.', 'Many older people would rather talk on the phone than send a text.'], 'meaning', 'people of a similar age', [
    { text:'The younger generation often prefers phone calls to text messages.', misconceptionCategory:'role_change' },
    { text:'The older generation always prefers phone calls to text messages.', misconceptionCategory:'degree_change' },
    { text:'The older generation often prefers text messages to phone calls.', misconceptionCategory:'comparison_reversal' }
  ], ['vocab_generation_9']),
  idea('perception', 'The advert changed the public perception of electric cars.', ['The advert changed the way people think about electric cars.', 'After the advert, people saw electric cars differently.', 'Public opinion about electric cars was changed by the advert.'], 'meaning', 'the way people see something', [
    { text:'The advert changed the price of electric cars.', misconceptionCategory:'meaning_confusion' },
    { text:'The advert did not change the way people think about electric cars.', misconceptionCategory:'polarity_change' },
    { text:'The advert will change the way people think about electric cars.', misconceptionCategory:'time_change' }
  ], ['vocab_perception']),
  idea('non_verbal', 'Non-verbal signals, such as smiling, can show how someone really feels.', ['Signs without words, such as smiling, can reveal a person’s true feelings.', 'Smiling and other wordless signals can show someone’s real feelings.', 'Body language like a smile can show how a person truly feels.'], 'meaning', 'without words', [
    { text:'Spoken signals, such as shouting, can show how someone really feels.', misconceptionCategory:'meaning_confusion' },
    { text:'Signals without words, such as smiling, can hide how someone really feels.', misconceptionCategory:'polarity_change' },
    { text:'Signals without words, such as smiling, always show how someone really feels.', misconceptionCategory:'certainty_change' }
  ], ['vocab_non_verbal']),
  idea('underlying', 'The underlying reason for the argument was jealousy, not money.', ['The real, hidden cause of the argument was jealousy rather than money.', 'Although money seemed to be the cause, the true reason for the argument was jealousy.', 'Jealousy, not money, was the deeper reason behind the argument.'], 'meaning', 'real but hidden', [
    { text:'The obvious reason for the argument was jealousy, not money.', misconceptionCategory:'meaning_confusion' },
    { text:'The real reason for the argument was money, not jealousy.', misconceptionCategory:'role_reversal' },
    { text:'One small reason for the argument was jealousy, not money.', misconceptionCategory:'degree_change' }
  ], ['vocab_underlying']),
  idea('differentiate', 'Young children often cannot differentiate between adverts and real videos.', ['Young children are often unable to tell adverts and real videos apart.', 'Many young children cannot see the difference between adverts and genuine videos.', 'It is often hard for young children to recognise which videos are adverts and which are real.'], 'meaning', 'tell apart', [
    { text:'Young children often cannot choose between adverts and real videos.', misconceptionCategory:'meaning_confusion' },
    { text:'Young children can easily tell adverts and real videos apart.', misconceptionCategory:'polarity_change' },
    { text:'Older adults often cannot tell adverts and real videos apart.', misconceptionCategory:'role_change' }
  ], ['vocab_differentiate']),
  idea('physical', 'The bookshop closed its physical store and now sells only online.', ['The bookshop shut its real shop and now does business only on the internet.', 'Now that its real store has closed, the bookshop sells only through its website.', 'The bookshop no longer has a shop you can visit and sells only online.'], 'meaning', 'real, not online', [
    { text:'The bookshop closed its online store and now sells only in its real shop.', misconceptionCategory:'role_reversal' },
    { text:'The bookshop closed its largest store and now sells only online.', misconceptionCategory:'meaning_confusion' },
    { text:'The bookshop will close its real store and sell only online.', misconceptionCategory:'time_change' }
  ], ['vocab_physical']),
  idea('platform', 'The teacher uses an online platform to share homework with the class.', ['The teacher shares homework with the class through an online system.', 'Homework is given to the class through a website that the teacher uses.', 'The class receives homework from the teacher via an internet service.'], 'meaning', 'online system', [
    { text:'The teacher uses a printed book to share homework with the class.', misconceptionCategory:'meaning_confusion' },
    { text:'The students use an online system to share homework with the teacher.', misconceptionCategory:'role_reversal' },
    { text:'The teacher used to use an online system to share homework with the class.', misconceptionCategory:'time_change' }
  ], ['vocab_platform']),
  idea('virtual', 'Students who could not travel joined the virtual tour of the museum.', ['Students who were unable to travel took part in the online tour of the museum.', 'The museum tour was also available online for students who could not go there.', 'Those who could not travel visited the museum on the internet instead.'], 'meaning', 'online, not in person', [
    { text:'Students who could not travel joined the guided tour of the museum in person.', misconceptionCategory:'polarity_change' },
    { text:'Students who could travel joined the online tour of the museum.', misconceptionCategory:'role_change' },
    { text:'Students who could not travel joined the free tour of the museum.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_virtual']),
  idea('face_to_face', 'Some problems are better discussed face-to-face than by text message.', ['Some problems are easier to talk about in person than by message.', 'It is better to meet and talk about certain problems than to send texts.', 'For some problems, meeting the other person works better than messaging.'], 'comparison', 'in person is better', [
    { text:'Some problems are better discussed by text message than in person.', misconceptionCategory:'comparison_reversal' },
    { text:'All problems are better discussed in person than by text message.', misconceptionCategory:'quantity_change' },
    { text:'Some problems are better discussed by phone than by text message.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_face_to_face']),
  idea('conference', 'Over two thousand teachers attended the conference on online learning.', ['More than two thousand teachers went to the large formal meeting about online learning.', 'A big meeting about online learning was attended by over two thousand teachers.', 'Over two thousand teachers took part in the event where experts discussed online learning.'], 'meaning', 'large formal meeting', [
    { text:'Over two thousand teachers took the course on online learning.', misconceptionCategory:'meaning_confusion' },
    { text:'About two hundred teachers attended the large meeting on online learning.', misconceptionCategory:'quantity_change' },
    { text:'Over two thousand teachers will attend the large meeting on online learning.', misconceptionCategory:'time_change' }
  ], ['vocab_conference']),
  idea('suitable', 'This hall is not suitable for a concert with five hundred people.', ['This hall is not right for a concert with five hundred people.', 'A concert for five hundred people could not be held properly in this hall.', 'The hall does not meet the needs of a concert for five hundred people.'], 'meaning', 'right for the purpose', [
    { text:'This hall is perfect for a concert with five hundred people.', misconceptionCategory:'polarity_change' },
    { text:'This hall is not available for a concert with five hundred people.', misconceptionCategory:'meaning_confusion' },
    { text:'This hall is not right for a concert with fifty people.', misconceptionCategory:'quantity_change' }
  ], ['vocab_suitable']),
  idea('underlying_meaning', 'The underlying meaning of the story is that friendship matters more than money.', ['The deeper message of the story is that friends are more important than money.', 'Beneath the surface, the story tells us that friendship is worth more than money.', 'What the story is really saying is that money is less important than friendship.'], 'meaning', 'deeper message', [
    { text:'The title of the story is that friendship matters more than money.', misconceptionCategory:'meaning_confusion' },
    { text:'The deeper message of the story is that money matters more than friendship.', misconceptionCategory:'comparison_reversal' },
    { text:'The deeper message of the story is that friendship and money do not matter.', misconceptionCategory:'polarity_change' }
  ], ['vocab_underlying_meaning']),
  idea('informal_language', 'Examiners expect students to avoid informal language in a formal report.', ['Examiners want students not to use chatty, everyday words in a formal report.', 'In a formal report, students should not use slang or casual expressions.', 'A formal report should not contain the relaxed words people use with friends.'], 'meaning', 'chatty, everyday words', [
    { text:'Examiners expect students to use chatty, everyday words in a formal report.', misconceptionCategory:'polarity_change' },
    { text:'Examiners expect students to avoid technical words in a formal report.', misconceptionCategory:'meaning_confusion' },
    { text:'Examiners expect students to avoid chatty words in a message to a friend.', misconceptionCategory:'scope_change' }
  ], ['vocab_informal_language']),
  idea('formal_style', 'A job application should be written in a formal style.', ['A job application should be written in a serious, polite way.', 'When you apply for a job, you should write politely and without slang.', 'Writing for a job application should be official and careful in tone.'], 'meaning', 'serious and polite', [
    { text:'A job application should be written in a chatty style.', misconceptionCategory:'polarity_change' },
    { text:'A job application should be written in a short style.', misconceptionCategory:'meaning_confusion' },
    { text:'A job application can sometimes be written in a serious style.', misconceptionCategory:'modality_change' }
  ], ['vocab_formal_style']),
  idea('reporting_verb', 'Using a precise reporting verb such as “admitted” makes your summary clearer.', ['Choosing an exact word like “admitted” to tell the reader what someone said makes your summary clearer.', 'Your summary becomes clearer if you introduce what people said with exact verbs such as “admitted”.', 'A summary is clearer when you use specific verbs like “admitted” instead of always using “said”.'], 'meaning', 'verb that tells us what someone said', [
    { text:'Using a precise adjective such as “admitted” makes your summary clearer.', misconceptionCategory:'meaning_confusion' },
    { text:'Using a vague verb such as “said” makes your summary clearer.', misconceptionCategory:'polarity_change' },
    { text:'Using an exact verb such as “admitted” makes your summary longer.', misconceptionCategory:'detail_change' }
  ], ['vocab_reporting_verb']),
  idea('direct_object', 'In “Leo sent a message”, “a message” is the direct object.', ['In “Leo sent a message”, “a message” is the thing that receives the action of the verb.', 'In “Leo sent a message”, the thing Leo sent, “a message”, is what the verb acts on.', 'The words “a message” in “Leo sent a message” tell us what was sent.'], 'meaning', 'receives the action of the verb', [
    { text:'In “Leo sent a message”, “a message” is the subject.', misconceptionCategory:'meaning_confusion' },
    { text:'In “Leo sent a message”, “Leo” receives the action of the verb.', misconceptionCategory:'role_reversal' },
    { text:'In “Leo sent a message”, “sent” is the word that receives the action.', misconceptionCategory:'detail_change' }
  ], ['vocab_direct_object']),
  idea('clause', 'A sentence such as “I stayed home because it rained” contains two clauses.', ['The sentence “I stayed home because it rained” has two groups of words, each with its own subject and verb.', 'In “I stayed home because it rained”, there are two parts, and each has a subject and a verb.', '“I stayed home” and “because it rained” each contain a subject and a verb.'], 'quantity', 'two subject-verb groups', [
    { text:'A sentence such as “I stayed home because it rained” contains two paragraphs.', misconceptionCategory:'meaning_confusion' },
    { text:'A sentence such as “I stayed home because it rained” contains one subject-verb group.', misconceptionCategory:'quantity_change' },
    { text:'A sentence such as “I stayed home because it rained” contains no verbs.', misconceptionCategory:'omitted_information' }
  ], ['vocab_clause']),
  idea('suggest', 'My teacher suggested that I read an English article every day.', ['My teacher put forward the idea that I should read an English article daily.', 'My teacher advised me, as an idea to consider, to read one English article each day.', 'My teacher proposed that I read an article in English every day.'], 'meaning', 'put forward an idea', [
    { text:'My teacher ordered me to read an English article every day.', misconceptionCategory:'degree_change' },
    { text:'I proposed that my teacher read an English article every day.', misconceptionCategory:'role_reversal' },
    { text:'My teacher refused to let me read an English article every day.', misconceptionCategory:'polarity_change' }
  ], ['vocab_suggest']),
  idea('recommend', 'Most reviewers recommend the app to people who are learning languages.', ['Most reviewers say the app is good and advise language learners to use it.', 'The majority of reviewers think language learners should try the app.', 'Most reviewers advise people studying languages to use the app.'], 'meaning', 'say something is good and advise using it', [
    { text:'Most reviewers warn language learners not to use the app.', misconceptionCategory:'polarity_change' },
    { text:'A few reviewers advise language learners to use the app.', misconceptionCategory:'quantity_change' },
    { text:'Most reviewers designed the app for people who are learning languages.', misconceptionCategory:'meaning_confusion' }
  ], ['vocab_recommend_9']),
  idea('solution', 'Creating a silent study room was a simple solution to the noise problem.', ['A silent study room was an easy way to deal with the noise problem.', 'The noise problem was solved easily by creating a silent study room.', 'Making a quiet room for studying simply fixed the problem of noise.'], 'meaning', 'way of dealing with a problem', [
    { text:'Creating a silent study room was a simple cause of the noise problem.', misconceptionCategory:'meaning_confusion' },
    { text:'Creating a silent study room was an expensive and difficult way to deal with the noise problem.', misconceptionCategory:'detail_change' },
    { text:'Creating a silent study room made the noise problem worse.', misconceptionCategory:'polarity_change' }
  ], ['vocab_solution_9']),
  idea('introduction', 'A good introduction tells the reader what the essay will be about.', ['A good opening paragraph explains to the reader what the essay will discuss.', 'The first part of a good essay shows the reader what the topic is.', 'An effective beginning lets the reader know the subject of the essay.'], 'meaning', 'opening part', [
    { text:'A good conclusion tells the reader what the essay was about.', misconceptionCategory:'meaning_confusion' },
    { text:'A good opening hides from the reader what the essay will be about.', misconceptionCategory:'polarity_change' },
    { text:'A good title tells the reader what the essay will be about.', misconceptionCategory:'detail_change' }
  ], ['vocab_introduction']),
  idea('conclusion', 'The scientists came to the conclusion that the medicine was safe.', ['The scientists decided, after studying the evidence, that the medicine was safe.', 'After considering the results, the scientists judged the medicine to be safe.', 'The scientists’ final judgement was that the medicine was safe.'], 'meaning', 'decision after studying evidence', [
    { text:'The scientists came to the conclusion that the medicine was dangerous.', misconceptionCategory:'polarity_change' },
    { text:'The scientists hoped that the medicine was safe.', misconceptionCategory:'certainty_change' },
    { text:'The scientists will decide whether the medicine is safe.', misconceptionCategory:'time_change' }
  ], ['vocab_conclusion']),
  idea('audience', 'The speaker kept her audience interested by telling stories.', ['The speaker held the attention of the people listening by telling stories.', 'By telling stories, the speaker made sure her listeners stayed interested.', 'The people listening to the speaker stayed interested because she told stories.'], 'meaning', 'people listening', [
    { text:'The speaker kept her assistants interested by telling stories.', misconceptionCategory:'meaning_confusion' },
    { text:'The speaker bored her listeners by telling stories.', misconceptionCategory:'polarity_change' },
    { text:'The listeners kept the speaker interested by telling stories.', misconceptionCategory:'role_reversal' }
  ], ['vocab_audience']),
  idea('purpose', 'The main purpose of the report is to suggest ways to reduce waste.', ['The report mainly aims to propose ways of cutting waste.', 'The chief aim of the report is to put forward ideas for reducing waste.', 'Above all, the report was written to recommend how waste can be reduced.'], 'meaning', 'aim', [
    { text:'The main result of the report is that waste has been reduced.', misconceptionCategory:'meaning_confusion' },
    { text:'One small aim of the report is to suggest ways to reduce waste.', misconceptionCategory:'degree_change' },
    { text:'The main aim of the report is to suggest ways to increase waste.', misconceptionCategory:'polarity_change' }
  ], ['vocab_purpose']),
  idea('evaluate', 'Students should evaluate each website before using it as a source.', ['Students should judge how reliable each website is before using it as a source.', 'Before using a website as a source, students need to assess its quality.', 'Each website should be checked and judged by students before they use it.'], 'meaning', 'judge the quality', [
    { text:'Students should copy each website before using it as a source.', misconceptionCategory:'meaning_confusion' },
    { text:'Students should judge each website after using it as a source.', misconceptionCategory:'time_change' },
    { text:'Students should trust each website without judging it.', misconceptionCategory:'polarity_change' }
  ], ['vocab_evaluate_9']),
  idea('relevant', 'Only include information that is relevant to the question.', ['Only include information that is connected with the question.', 'Leave out anything that does not relate to the question.', 'Use only details that are directly linked to the question.'], 'meaning', 'connected with the subject', [
    { text:'Only include information that is interesting to the reader.', misconceptionCategory:'meaning_confusion' },
    { text:'Include all information, even if it is not connected with the question.', misconceptionCategory:'polarity_change' },
    { text:'Only include information that is connected with the answer key.', misconceptionCategory:'detail_change' }
  ], ['vocab_relevant_9']),
  idea('constructive', 'The teacher gave constructive feedback that helped me improve my essay.', ['The teacher gave helpful comments that showed me how to make my essay better.', 'My essay improved thanks to the teacher’s useful, positive comments.', 'The teacher’s feedback was helpful and showed me how to improve my essay.'], 'meaning', 'helpful and aimed at improvement', [
    { text:'The teacher gave unkind feedback that helped me improve my essay.', misconceptionCategory:'polarity_change' },
    { text:'The teacher gave brief feedback that did not help me.', misconceptionCategory:'meaning_confusion' },
    { text:'I gave the teacher helpful feedback on her essay.', misconceptionCategory:'role_reversal' }
  ], ['vocab_constructive']),
  idea('research', 'Recent research shows that teenagers need about nine hours of sleep.', ['Recent scientific studies show that teenagers need around nine hours of sleep.', 'According to recent studies, about nine hours of sleep is what teenagers need.', 'New investigations have found that teenagers should sleep for roughly nine hours.'], 'meaning', 'careful study', [
    { text:'A recent rumour says that teenagers need about nine hours of sleep.', misconceptionCategory:'meaning_confusion' },
    { text:'Recent studies show that teenagers need about five hours of sleep.', misconceptionCategory:'quantity_change' },
    { text:'Old studies showed that teenagers needed about nine hours of sleep.', misconceptionCategory:'time_change' }
  ], ['vocab_research'])
];

export default [...phraseSets, ...ideaSets];
