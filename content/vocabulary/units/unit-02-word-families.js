// Unit 2 · Word Families — authored families, WORDS 1–10 ONLY. Same contract as unit-01-word-families.js: every row is AUTHORED (stated part of
// speech, one natural example containing the form exactly once and not as the first word, and the reason the form is worth teaching). A family
// needs >= 3 pedagogically useful forms INCLUDING the headword and >= 2 parts of speech. Headwords with no normal derivative are listed under
// unit2WordFamilyRejected rather than padded with unnatural forms.
const f = (form, partOfSpeech, example, why, note) => ({ form, partOfSpeech, example, why, ...(note ? { note } : {}) });

export const unit2WordFamilies = Object.freeze({
  entertainment: { forms: [
    f('entertainment', 'noun', 'Live music was the main entertainment at the school festival.', 'Headword.'),
    f('entertain', 'verb', 'The magician managed to entertain hundreds of children for an hour.', 'The base verb; also used for hosting guests.'),
    f('entertaining', 'adjective', 'Her talks about travel are always entertaining and full of surprises.', 'Common evaluative adjective in reviews.'),
    f('entertainer', 'noun', 'The entertainer juggled flaming sticks at the end of the show.', 'Person noun; a distinct, regular derivative.')
  ] },
  access: { forms: [
    f('access', 'noun', 'Students need access to a quiet room when they revise.', 'Headword.'),
    f('accessible', 'adjective', 'The museum is accessible to visitors in wheelchairs.', 'Very common adjective in reports about facilities and websites.'),
    f('inaccessible', 'adjective', 'In winter, the mountain villages become inaccessible by road.', 'Common negative adjective in news and geography texts.')
  ], excludedForms: [{ form: 'accessibility', reason: 'Abstract noun beyond the level of this unit.' }] },
  digital: { forms: [
    f('digital', 'adjective', 'Most of the library’s records are now digital.', 'Headword.'),
    f('digitally', 'adverb', 'The photographs were digitally edited before they were printed.', 'Regular adverb used in describing how things are made or sent.'),
    f('digitise', 'verb', 'The museum plans to digitise its oldest maps so they can be viewed online.', 'Real, current verb in technology and heritage texts (British spelling).')
  ], excludedForms: [{ form: 'digit', reason: 'A different sense (a number 0-9), so it does not extend the meaning of "digital".' }] },
  streaming: { forms: [
    f('streaming', 'noun', 'The rise of streaming has changed how teenagers watch television.', 'Headword.'),
    f('stream', 'verb', 'You can stream the concert live from your living room.', 'The base verb in this sense.'),
    f('streamer', 'noun', 'The streamer plays games online for thousands of viewers each evening.', 'Current person noun for someone who broadcasts online.',
      'Thin family: only one derivative beyond stream/streaming, so it is flagged for teacher review.')
  ] },
  relevant: { forms: [
    f('relevant', 'adjective', 'Please include only information that is relevant to the question.', 'Headword.'),
    f('relevance', 'noun', 'The teacher asked her to explain the relevance of the example.', 'Noun form used in essays and feedback.'),
    f('irrelevant', 'adjective', 'Most of the comments online were irrelevant to the discussion.', 'The common negative; very frequent in feedback on writing.')
  ] },
  educator: { forms: [
    f('educator', 'noun', 'An experienced educator can explain a difficult idea in simple terms.', 'Headword.'),
    f('educate', 'verb', 'The campaign aims to educate teenagers about online safety.', 'The base verb.'),
    f('education', 'noun', 'Free education gives young people a chance to succeed.', 'The most frequent noun in the family; essential for discussion writing.')
  ], excludedForms: [{ form: 'educational', reason: 'It is a separate target later in Unit 2, so it is taught there.' }] },
  afford: { forms: [
    f('afford', 'verb', 'Few students can afford to buy every textbook they need.', 'Headword.'),
    f('affordable', 'adjective', 'The school offers affordable laptops to families on low incomes.', 'Very common adjective about prices and services.'),
    f('unaffordable', 'adjective', 'For many households, high-speed internet is still unaffordable.', 'Frequent in news and discussion texts about cost.')
  ], excludedForms: [{ form: 'affordability', reason: 'Abstract noun beyond the level of this unit.' }] },
  essential: { forms: [
    f('essential', 'adjective', 'A charger is essential for anyone who travels with a phone.', 'Headword.'),
    f('essentially', 'adverb', 'The two apps are essentially the same, but one is free.', 'Common adverb meaning "basically"; frequent in explanations.'),
    f('essentials', 'noun', 'Pack the essentials first, such as your passport and tickets.', 'Plural noun used naturally for the things you must have.')
  ], excludedForms: [{ form: 'essence', reason: 'Related in origin but a different, abstract meaning ("the central nature of something").' }] },
  supposedly: { forms: [
    f('supposedly', 'adverb', 'The old well is supposedly the oldest in the village, though nobody has checked.', 'Headword.'),
    f('suppose', 'verb', 'I suppose the shop will be closed by now.', 'The base verb; "suppose" and "supposedly" share the idea of what is assumed or said.'),
    f('supposed', 'adjective', 'The supposed expert had never actually studied the subject.', 'Adjective meaning "said to be", used before a noun; the "supposed to" (duty) sense is not taught here.')
  ], excludedForms: [{ form: 'supposition', reason: 'Formal noun beyond the level of this unit.' }] },
  informed: { forms: [
    f('informed', 'adjective', 'The article helps readers make an informed choice about their diet.', 'Headword.'),
    f('inform', 'verb', 'Please inform the office if you are going to be absent.', 'The base verb.'),
    f('information', 'noun', 'The website provides useful information about courses.', 'The most frequent noun in the family.'),
    f('informative', 'adjective', 'The museum guide was friendly and very informative.', 'Common evaluative adjective in reviews.'),
    f('uninformed', 'adjective', 'Many people hold uninformed opinions about the topic.', 'Common negative; contrasts directly with the headword.')
  ] },
  admit: { forms: [
    f('admit', 'verb', 'Few people find it easy to admit that they were wrong.', 'Headword.'),
    f('admission', 'noun', 'His admission that he had copied the answers surprised his teachers.', 'Noun for the act of accepting that something is true (taught in this sense only).', 'The "entrance fee" sense of admission is a separate meaning and is not taught here.'),
    f('admittedly', 'adverb', 'The plan is expensive and, admittedly, rather risky.', 'Discourse adverb that is very useful in discussion writing.')
  ], excludedForms: [{ form: 'admittance', reason: 'Formal and rare; it means "permission to enter", which is a different sense.' }] },
  communicate: { forms: [
    f('communicate', 'verb', 'Scientists need to communicate their findings clearly to the public.', 'Headword.'),
    f('communication', 'noun', 'Good communication between teachers and parents prevents many problems.', 'The most frequent noun in the family.'),
    f('communicator', 'noun', 'She is an excellent communicator who explains complex ideas simply.', 'Person noun used in character and skills descriptions.'),
    f('communicative', 'adjective', 'After a few months abroad, the shy boy became far more communicative.', 'Adjective for someone who talks and shares readily.')
  ] },
  transform: { forms: [
    f('transform', 'verb', 'A good teacher can transform a shy student into a confident speaker.', 'Headword.'),
    f('transformation', 'noun', 'The city has undergone a remarkable transformation in ten years.', 'The common noun; frequent in description and report writing.'),
    f('transformative', 'adjective', 'Many students describe the exchange year as a transformative experience.', 'Adjective used in education and technology texts.', 'Moderately formal; flagged for teacher review.')
  ], excludedForms: [{ form: 'transformer', reason: 'The electrical-equipment sense is unrelated to the meaning taught here.' }] },
  impression: { forms: [
    f('impression', 'noun', 'The photographs gave a false impression of the hotel.', 'Headword.'),
    f('impress', 'verb', 'She hoped to impress the judges with her speech.', 'The base verb.'),
    f('impressed', 'adjective', 'The examiners were impressed by the quality of her essay.', 'Very common participle adjective for reactions.')
  ], excludedForms: [{ form: 'impressive', reason: 'It is a separate target later in Unit 2, so it is taught there.' }] },
  availability: { forms: [
    f('availability', 'noun', 'The availability of fresh food is a problem in some regions.', 'Headword.'),
    f('available', 'adjective', 'Free wi-fi is available in every classroom.', 'The base adjective; far more frequent than the noun.'),
    f('unavailable', 'adjective', 'The tickets were unavailable online after midday.', 'Common negative adjective.')
  ] },
  function: { forms: [
    f('function', 'noun', 'The function of a hinge is to let a door swing open.', 'Headword.'),
    f('functional', 'adjective', 'The kitchen is small but perfectly functional.', 'Common adjective in descriptions of design and buildings.'),
    f('malfunction', 'noun', 'A malfunction in the software caused the system to crash.', 'Frequent in technology and news texts: a failure to work properly.')
  ], excludedForms: [{ form: 'functionality', reason: 'Technical near-synonym of "features"; it would blur the feature / function contrast taught in this unit.' }] },
  interactive: { forms: [
    f('interactive', 'adjective', 'The website has several interactive maps that respond to clicks.', 'Headword.'),
    f('interact', 'verb', 'Babies learn quickly when adults interact with them.', 'The base verb.'),
    f('interaction', 'noun', 'Face-to-face interaction is important for young children.', 'The common noun; frequent in education and technology texts.')
  ], excludedForms: [{ form: 'interactivity', reason: 'Technical abstract noun beyond the level of this unit.' }] },
  stabilising: { forms: [
    f('stabilising', 'adjective', 'The coach’s calm voice had a stabilising effect on the nervous team.', 'Headword.'),
    f('stabilise', 'verb', 'Doctors worked quickly to stabilise the patient before the journey.', 'The base verb (British spelling).'),
    f('stable', 'adjective', 'The ladder must be stable before anyone climbs it.', 'The root adjective; far more frequent than the headword.'),
    f('stability', 'noun', 'The country needs political stability to attract investors.', 'The common noun in news and discussion writing.'),
    f('unstable', 'adjective', 'The unstable bridge was closed to traffic.', 'Common negative adjective.')
  ], excludedForms: [{ form: 'stabiliser', reason: 'Technical noun for a device; adds little for iGCSE.' }] },
  predictable: { forms: [
    f('predictable', 'adjective', 'The ending of the film was entirely predictable.', 'Headword.'),
    f('predict', 'verb', 'No one can predict exactly how technology will change our lives.', 'The base verb.'),
    f('prediction', 'noun', 'Her prediction about the exam questions turned out to be correct.', 'The common noun.'),
    f('unpredictable', 'adjective', 'Mountain weather can be dangerously unpredictable.', 'The most useful negative; very frequent in description and discussion.')
  ], excludedForms: [{ form: 'predictably', reason: 'Regular adverb; adds little beyond the adjective at this level.' }] },
  professional: { forms: [
    f('professional', 'adjective', 'She gave a very professional presentation to the company directors.', 'Headword; also a noun for a person who does a job for pay.'),
    f('profession', 'noun', 'Teaching is a respected profession in many countries.', 'The base noun; very frequent in work and education texts.'),
    f('professionally', 'adverb', 'The photographs were taken professionally, so they look like magazine pictures.', 'Regular adverb used for how work is done.'),
    f('unprofessional', 'adjective', 'It was unprofessional of the guide to arrive an hour late.', 'Common negative adjective in complaints and reviews.')
  ] },
  commentary: { forms: [
    f('commentary', 'noun', 'The radio commentary made the race sound even more exciting.', 'Headword.'),
    f('comment', 'verb', 'The headteacher refused to comment on the rumours.', 'The base verb; the noun “comment” shares the spelling.'),
    f('commentator', 'noun', 'The commentator described every pass of the match.', 'Person noun; the speaker who gives the commentary.')
  ] },
  educational: { forms: [
    f('educational', 'adjective', 'The museum offers educational visits for primary schools.', 'Headword.'),
    f('educate', 'verb', 'Schools must educate children about online safety.', 'The base verb.'),
    f('education', 'noun', 'Free education gives every child the chance to succeed.', 'The common noun; frequent in news and discussion writing.')
  ], excludedForms: [{ form: 'educator', reason: 'Already taught as a separate Unit 2 target word (word 20), so it is not repeated here.' }] },
  culture: { forms: [
    f('culture', 'noun', 'Food is an important part of Italian culture.', 'Headword.'),
    f('cultural', 'adjective', 'The city holds a cultural festival every summer.', 'Very common adjective; used before nouns such as “event”, “difference” and “heritage”.'),
    f('culturally', 'adverb', 'The class is culturally mixed, with students from twelve countries.', 'Regular adverb used in descriptions of groups and places.')
  ] },
  amusing: { forms: [
    f('amusing', 'adjective', 'He told an amusing story about his first day at work.', 'Headword: describes the thing that is funny.'),
    f('amuse', 'verb', 'The clown tried to amuse the children while they waited.', 'The base verb.'),
    f('amused', 'adjective', 'The teacher looked amused when the class began to laugh.', 'Describes the person who feels entertained; the key contrast with “amusing”.'),
    f('amusement', 'noun', 'To her amusement, the cat chased its own tail.', 'The common noun; fixed in the phrase “to someone’s amusement”.')
  ] },
  competitive: { forms: [
    f('competitive', 'adjective', 'The mobile phone market is extremely competitive.', 'Headword.'),
    f('compete', 'verb', 'Over a hundred schools compete in the national quiz.', 'The base verb.'),
    f('competition', 'noun', 'There is fierce competition for places at the best universities.', 'The common noun, covering contests and business rivalry.'),
    f('competitor', 'noun', 'Our main competitor has just lowered its prices.', 'Person or company noun; frequent in business texts.')
  ] },
  critical: { forms: [
    f('critical', 'adjective', 'The report was highly critical of the way the school was run.', 'Headword (sense taught: expressing disapproval).'),
    f('criticise', 'verb', 'It is easy to criticise other people’s work.', 'The base verb (British spelling).'),
    f('criticism', 'noun', 'The headteacher accepted the criticism and promised to change the policy.', 'The common noun; frequent in news and opinion writing.'),
    f('critic', 'noun', 'The film critic gave the new comedy an excellent review.', 'Person noun who judges books, films or performances.')
  ], excludedForms: [{ form: 'critically', reason: 'Mostly used for the different sense “seriously” (critically ill), which would blur the sense taught here.' }] },
  impressive: { forms: [
    f('impressive', 'adjective', 'The view from the top of the tower is truly impressive.', 'Headword: describes the thing that causes admiration.'),
    f('impress', 'verb', 'She worked hard to impress the interview panel.', 'The base verb.'),
    f('impressed', 'adjective', 'The examiner was impressed by her fluent answers.', 'Describes the person who feels admiration; the key contrast with “impressive”.'),
    f('impressively', 'adverb', 'The young goalkeeper played impressively in her first match.', 'Regular adverb used in descriptions of performance.')
  ], excludedForms: [{ form: 'impression', reason: 'Already taught as a separate Unit 2 target word (word 20), so it is not repeated here.' }] }
});

// Headwords considered and NOT made families: a bare list would offer unauthorised members in Recognise/Match.
export const unit2WordFamilyRejected = Object.freeze({
  device: 'No normal derivative of "device" with the same meaning; "devise" is a different word (a verb meaning to invent) and would mislead.',
  'current affairs': 'A fixed two-word noun phrase: it has no derived forms.',
  apparently: 'Its only relative, "apparent", is common but means "clear or obvious" in many uses ("it is apparent that"), which is almost the opposite of "apparently"; the family would teach a false link and has only two forms.',
  celebrity: '"celebrate" and "celebration" mean marking a special occasion, a different meaning, and "celebrities" is only the plural; the family would teach a false link.',
  remotely: 'Only "remote" is common; "remoteness" is rare, so the family has two forms, not three. "Remote control" is its own Unit 2 target.',
  percentage: 'Its only relative, "percent" / "per cent", is the same kind of word, so the family has one part of speech and no useful derivative.',
  'remote control': 'A fixed two-word noun phrase: it has no derived forms ("remote" alone is a separate adjective).',
  feature: 'The verb shares the noun’s spelling, "featured" is a participle and "featureless" is rare, so there are fewer than three distinct teachable forms.',
  widespread: 'A compound of "wide" and "spread" with no derived forms; "spread" and "widely" are different words, so the family would be forced.',
  'high-performance': 'A compound adjective: its relatives (perform, performance, performer) belong to a different headword, so they would not describe this word.',
  'multi-task': 'Its only relatives are the -ing and -er forms of the same compound ("multi-tasking", "multi-tasker"), which are rare and written inconsistently ("multitask"); the family would give no reliable marking.',
  regional: 'Only “region” (noun) and “regional” are in everyday use; “regionally” is rare, so there are not three genuinely useful forms.',
  genuine: 'Only “genuinely” is in regular use; “genuineness” is rare, so there are two useful forms, not three.'
});
