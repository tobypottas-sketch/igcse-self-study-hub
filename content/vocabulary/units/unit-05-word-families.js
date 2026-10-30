// Unit 5 · Word Families — authored families, WORDS 1–30 ONLY. Same contract as unit-04-word-families.js: every row is AUTHORED (stated part of
// speech, one natural example containing the form exactly once and not as the first word, and the reason the form is worth teaching). A family
// needs >= 3 pedagogically useful forms INCLUDING the headword and >= 2 parts of speech. Headwords with no genuine family are listed under
// unit5WordFamilyRejected rather than padded with unnatural forms.
const f = (form, partOfSpeech, example, why, note) => ({ form, partOfSpeech, example, why, ...(note ? { note } : {}) });

export const unit5WordFamilies = Object.freeze({
  snorkelling: { forms: [
    f('snorkelling', 'noun', 'The hotel runs snorkelling trips to the reef every morning.', 'Headword.'),
    f('snorkel', 'verb', 'Visitors can snorkel above the wreck at low tide.', 'The base verb: to swim near the surface with a mask and breathing tube.'),
    f('snorkeller', 'noun', 'A young snorkeller spotted a turtle near the rocks.', 'The person who snorkels; the same pattern as traveller and swimmer.')
  ], excludedForms: [{ form: 'snorkelled', reason: 'Only the past tense of the verb already taught.' }] },
  attractions: { forms: [
    f('attractions', 'noun', 'The city has many cultural attractions, including a museum and an opera house.', 'Headword.'),
    f('attract', 'verb', 'Warm weather and clean beaches attract millions of visitors to the coast every summer.', 'The verb behind the noun; very common in tourism texts.'),
    f('attractive', 'adjective', 'The harbour is an attractive place for a walk in the evening.', 'The adjective for something pleasant or interesting to look at; very frequent.')
  ], excludedForms: [{ form: 'attractively', reason: 'Rare adverb that adds no new meaning at this level.' }] },
  spectacular: { forms: [
    f('spectacular', 'adjective', 'The view from the cable car was spectacular, with glaciers on both sides.', 'Headword.'),
    f('spectacle', 'noun', 'The fireworks over the harbour were a magnificent spectacle.', 'The noun for an impressive public display or sight.'),
    f('spectacularly', 'adverb', 'The waterfall plunges spectacularly into the gorge after the spring rains.', 'The adverb; common in descriptions of scenery and events.')
  ], excludedForms: [{ form: 'spectator', reason: 'Names a person who watches an event; the sense of watching, not of being impressive.' }] },
  popular: { forms: [
    f('popular', 'adjective', 'The coastal railway is popular with tourists and commuters alike.', 'Headword.'),
    f('popularity', 'noun', 'The popularity of the island has grown since the film was released.', 'The abstract noun; common in essays about tourism.'),
    f('unpopular', 'adjective', 'The new tourist tax proved unpopular with hotel owners.', 'The opposite adjective; the pair is worth learning together.')
  ], excludedForms: [{ form: 'popularise', reason: 'Formal verb that is rare at this level.' }, { form: 'popularly', reason: 'Rare adverb that adds no new meaning at this level.' }] },
  preservation: { forms: [
    f('preservation', 'noun', 'Money from ticket sales pays for the preservation of the ancient city.', 'Headword.'),
    f('preserve', 'verb', 'Local volunteers work every weekend to preserve the old fishing huts on the beach.', 'The verb behind the noun: to protect something so that it stays in good condition.'),
    f('preserved', 'adjective', 'The town is famous for its beautifully preserved medieval walls.', 'The participle adjective for something kept in good condition; very common in descriptions of historic sites.')
  ], excludedForms: [{ form: 'preservative', reason: 'A chemical added to food; a different sense from protecting places and wildlife.' }, { form: 'preservationist', reason: 'Rare person noun that adds no new meaning at this level.' }] },
  adventurous: { forms: [
    f('adventurous', 'adjective', 'Lena is adventurous and always chooses the most exciting activity on the programme.', 'Headword.'),
    f('adventure', 'noun', 'Their journey across Africa was the greatest adventure of their lives.', 'The base noun: an exciting or unusual experience.'),
    f('adventurer', 'noun', 'The famous adventurer crossed three oceans in a small wooden boat.', 'The person who seeks adventure; the same pattern as traveller and explorer.')
  ], excludedForms: [{ form: 'adventurously', reason: 'Rare adverb that adds no new meaning at this level.' }] }
});

export const unit5WordFamilyRejected = Object.freeze({
  'aerial tourism': 'A fixed two-word noun phrase: “aerial” and “tourism” are separate words, so there is no single derived family.',
  'underwater photography': 'A fixed two-word noun phrase: “photographer” and “photograph” belong to the single word “photography”, not to this phrase.',
  documentary: '“document” (an official paper) and “documentation” drift to a different sense, and “documentary” as an adjective adds nothing new.',
  expedition: 'There are no everyday derived forms; “expeditions” is only the plural.',
  yacht: '“yachting” and “yachtsman” are the only relatives, so fewer than three useful forms.',
  scenery: '“scenic” is the only close relative; “scene” drifts to a different sense.',
  accommodation: '“accommodate” is a Unit 4 target, and “accommodating” (helpful) drifts to a different sense, so fewer than three forms keep the sense.',
  breathtaking: 'The only derived form is “breathtakingly”; “breath” and “breathe” belong to the literal sense, not “so impressive that it amazes you”.',
  dramatic: '“dramatically” is the only form that keeps the sense; “drama”, “dramatist” and “dramatise” move to the theatre, so fewer than three forms keep the sense.',
  stunning: '“stunningly” is the only derived form that keeps the sense; “stun” and “stunned” shift to shock or losing consciousness.',
  static: '“statically” is a rare adverb, “stationary” is a different word, and “statics” is technical, so there is no useful family.',
  'ground-level': 'A hyphenated compound adjective: “ground” and “level” belong to separate words, so there is no family for the target.',
  'angle of view': 'A fixed three-word noun phrase: “angle” and “view” belong to separate word families, so there is no family for the target.',
  'ecological habitats': 'A fixed noun phrase: “ecological/ecology/ecologist” and “habitat/inhabit/inhabitant” are two separate families, and neither family keeps the meaning of the whole phrase.',
  'marine world': 'A fixed noun phrase: “marine” (mariner, maritime) and “world” belong to separate families, so there is no family for the target.',
  coral: 'No derived forms are useful at this level; “coralline” is technical and “corals” is only the plural.',
  spellbound: 'A compound adjective: “spell” and “bound” belong to separate families and drift to magic and restriction, so no form keeps the sense of being completely fascinated.',
  wildlife: 'A compound noun with no derived forms; “wild” belongs to a separate family and drifts to other senses.',
  'environmental impact': 'A fixed noun phrase: “environment/environmental/environmentally” and “impact/impactful” are two separate families, and neither keeps the meaning of the whole phrase.',
  journey: 'Only the plural “journeys” and a rare verb use exist; “journeyman” drifts to a different sense, so fewer than three useful forms.',
  licence: 'A British noun/verb spelling split: the verb and participles (license, licensed) use a different spelling from the target, which would mix two spellings in one family and confuse the Spelling pathway.',
  offer: 'The verb and noun share one spelling, so there is no second form to teach; “offering” (a contribution) and “offered” are inflections or drift to a different sense.',
  'guided tour': 'A fixed noun phrase: “guide/guided” and “tour/tourist/tourism” belong to separate families, so there is no family for the target.',
  'travel assistant': 'A fixed noun phrase for a job title: “travel” and “assist/assistance” belong to separate families, so there is no family for the target.'
});
