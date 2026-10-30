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
  ], excludedForms: [{ form: 'essence', reason: 'Related in origin but a different, abstract meaning ("the central nature of something").' }] }
});

// Headwords considered and NOT made families: a bare list would offer unauthorised members in Recognise/Match.
export const unit2WordFamilyRejected = Object.freeze({
  device: 'No normal derivative of "device" with the same meaning; "devise" is a different word (a verb meaning to invent) and would mislead.',
  'current affairs': 'A fixed two-word noun phrase: it has no derived forms.'
});
