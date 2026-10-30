// Unit 4 · Word Families — authored families, WORDS 1–30 ONLY. Same contract as unit-03-word-families.js: every row is AUTHORED (stated part of
// speech, one natural example containing the form exactly once and not as the first word, and the reason the form is worth teaching). A family
// needs >= 3 pedagogically useful forms INCLUDING the headword and >= 2 parts of speech. Headwords with no genuine family are listed under
// unit4WordFamilyRejected rather than padded with unnatural forms.
const f = (form, partOfSpeech, example, why, note) => ({ form, partOfSpeech, example, why, ...(note ? { note } : {}) });

export const unit4WordFamilies = Object.freeze({
  comfort: { forms: [
    f('comfort', 'noun', 'The seats were designed for the comfort of long-distance passengers.', 'Headword.'),
    f('comfortable', 'adjective', 'The new coach seats are wide, soft and very comfortable.', 'The everyday adjective; far more common than the noun in speech.'),
    f('uncomfortable', 'adjective', 'The narrow seat was so uncomfortable that I could not sleep.', 'The opposite adjective; the pair is worth learning together.'),
    f('comfortably', 'adverb', 'We sat comfortably in the carriage and watched the fields go by.', 'The adverb; common in descriptions of travel and living.')
  ], excludedForms: [{ form: 'comforting', reason: 'Drifts to the emotional sense (consoling), which this unit does not teach.' }] },
  reality: { forms: [
    f('reality', 'noun', 'The reality of the job is long hours and heavy traffic.', 'Headword.'),
    f('real', 'adjective', 'The engineers needed to know whether the crack was a real danger or just a mark in the paint.', 'The base adjective; very frequent.'),
    f('realistic', 'adjective', 'It is not realistic to expect every train to arrive on time in heavy snow.', 'Adjective for sensible, achievable ideas; common in essays and discussion.'),
    f('realise', 'verb', 'Many drivers do not realise how tired they are until they stop.', 'The verb behind the noun; common in everyday and exam texts.')
  ], excludedForms: [{ form: 'unrealistic', reason: 'The negative of “realistic”; adds no new meaning at this level.' }, { form: 'realisation', reason: 'Abstract noun that is rare at this level.' }] },
  luxury: { forms: [
    f('luxury', 'noun', 'The cruise offers every luxury, from heated pools to private balconies.', 'Headword.'),
    f('luxurious', 'adjective', 'The hotel suites were large, quiet and extremely luxurious.', 'The adjective; far more common than the noun in descriptions.'),
    f('luxuriously', 'adverb', 'The first-class cabin was luxuriously decorated with leather seats and soft lights.', 'The adverb; used with decorated, furnished and equipped.')
  ], excludedForms: [{ form: 'luxuriant', reason: 'Describes plants growing thickly, a different sense.' }] },
  anxious: { forms: [
    f('anxious', 'adjective', 'Many first-time flyers feel anxious during take-off.', 'Headword.'),
    f('anxiety', 'noun', 'The announcement about the delay caused anxiety among the waiting passengers.', 'The noun for the feeling; common in news and exam texts.'),
    f('anxiously', 'adverb', 'The parents waited anxiously at the arrivals gate for their daughter’s flight.', 'The adverb; common in narrative and description.')
  ], excludedForms: [{ form: 'anxiousness', reason: 'Rare; “anxiety” is the normal noun.' }] },
  pollution: { forms: [
    f('pollution', 'noun', 'Air pollution is a serious problem in many large cities.', 'Headword.'),
    f('pollute', 'verb', 'Factories that pollute rivers should be fined heavily.', 'The verb behind the noun; very common in environmental texts.'),
    f('polluted', 'adjective', 'The polluted river smelled terrible and no fish could live in it.', 'Adjective for places and substances that are harmed; common in descriptions.')
  ], excludedForms: [{ form: 'pollutant', reason: 'Technical term for a harmful substance; beyond the level of this unit.' }] },
  efficiently: { forms: [
    f('efficiently', 'adverb', 'The new baggage system allows the airport to work more efficiently.', 'Headword.'),
    f('efficient', 'adjective', 'Electric trains are efficient because they waste very little energy.', 'The base adjective; far more common than the adverb.'),
    f('efficiency', 'noun', 'Better planning has improved the efficiency of the city’s bus service.', 'The noun for how well resources are used; common in reports and news.')
  ], excludedForms: [{ form: 'inefficient', reason: 'The negative of “efficient”; adds no new meaning at this level.' }] },
  invention: { forms: [
    f('invention', 'noun', 'The invention of the compass helped sailors find their way across the open sea.', 'Headword.'),
    f('invent', 'verb', 'Who was the first person to invent the bicycle?', 'The verb behind the noun; very common.'),
    f('inventor', 'noun', 'The inventor of the telephone, Alexander Graham Bell, was born in Scotland.', 'The person noun; common in history and biography texts.'),
    f('inventive', 'adjective', 'The students came up with an inventive way to reduce traffic outside the school.', 'Adjective meaning full of new ideas; useful in descriptions.')
  ], excludedForms: [{ form: 'reinvent', reason: 'Rare prefixed verb; not useful at this level.' }] },
  advertisement: { forms: [
    f('advertisement', 'noun', 'The advertisement on the side of the bus promised free travel for children.', 'Headword.'),
    f('advertise', 'verb', 'Airlines advertise their cheapest tickets on social media.', 'The verb behind the noun; very common.'),
    f('advertising', 'noun', 'Most of the company’s income comes from advertising on buses and trams.', 'The uncountable noun for the whole activity; different from the single “advertisement”.')
  ], excludedForms: [{ form: 'advert', reason: 'Informal shortening of the headword, not a separate family member.' }] },
  equipment: { forms: [
    f('equipment', 'noun', 'Engineers use special equipment to test the strength of each bridge.', 'Headword.'),
    f('equip', 'verb', 'Airlines must equip every aircraft with life jackets and oxygen masks.', 'The verb behind the noun; common in safety and engineering texts.'),
    f('equipped', 'adjective', 'The new coaches are fully equipped with air conditioning and charging points.', 'Adjective used with “well” or “fully”; common in descriptions of vehicles and buildings.')
  ], excludedForms: [{ form: 'equipping', reason: 'Only an inflection of “equip”.' }] },
  organisation: { forms: [
    f('organisation', 'noun', 'Every large organisation needs clear rules about safety.', 'Headword.'),
    f('organise', 'verb', 'Students can organise a road safety campaign with the help of their teachers.', 'The verb behind the noun; very common.'),
    f('organised', 'adjective', 'The airport is very well organised, so passengers never get lost.', 'Adjective for people and systems that are well arranged; common in descriptions.')
  ], excludedForms: [{ form: 'organiser', reason: 'Already a Unit 3 target word.' }, { form: 'organisational', reason: 'Formal adjective that is rare at this level.' }] },
  participant: { forms: [
    f('participant', 'noun', 'Each participant in the trial recorded how they travelled to school.', 'Headword.'),
    f('participate', 'verb', 'Students from five schools will participate in the road safety week.', 'The verb behind the noun; very common.'),
    f('participation', 'noun', 'Parents’ participation in the car-free day was higher than expected.', 'The abstract noun for taking part; common in reports.')
  ], excludedForms: [{ form: 'participatory', reason: 'Rare adjective beyond the level of this unit.' }] },
  operate: { forms: [
    f('operate', 'verb', 'Pilots must learn how to operate every system in the cockpit.', 'Headword.'),
    f('operator', 'noun', 'The bus operator announced a new timetable for the summer.', 'The person or company that runs a vehicle or service; common in transport news.'),
    f('operation', 'noun', 'The safe operation of heavy machinery requires years of training.', 'The noun for controlling a machine or system; this unit teaches the machine sense, not the medical one.'),
    f('operational', 'adjective', 'The new airport terminal will become operational in March.', 'Adjective meaning working and in use; common in news about transport projects.')
  ], excludedForms: [{ form: 'operating', reason: 'Only an inflection of “operate”.' }] }
});

export const unit4WordFamilyRejected = Object.freeze({
  breathtaking: 'The only derived form is “breathtakingly”; “breath” and “breathe” belong to the literal sense, not “extremely impressive”.',
  toughest: '“tough” and “tougher” are other forms of the same adjective, and “toughness” and “toughen” drift towards physical strength.',
  storeys: '“storey” is only the singular form of the same noun, so there is no genuine family.',
  accommodate: '“accommodation” (a place to stay) and “accommodating” (helpful) drift to different senses.',
  altitude: 'There are no everyday derived forms.',
  landscape: '“landscaping” and the verb “landscape” mean garden design, a different sense.',
  passenger: '“pass” and “passage” belong to different senses.',
  engineer: 'Only “engineering” is closely related; “engine” is a different sense and the verb “engineer” (to arrange cleverly) shifts meaning, so there are fewer than three useful forms.',
  pilot: 'No derived forms of this sense; “piloting” is only an inflection, and “pilot” as a verb or a trial scheme is a different use.',
  airship: 'A compound noun with no derived forms; “air” and “ship” are separate words with different senses.',
  launch: '“launching” and “launched” are inflections of the same verb, and “launcher” is a technical noun with a shifted sense.',
  height: 'Only “high” stays close in sense; “heighten” means to increase (a feeling or effect) and “highly” means very, so fewer than three forms keep the meaning.',
  vehicle: 'No derived forms; “vehicular” is a rare, formal adjective.',
  destination: '“destine”, “destined” and “destiny” drift to the idea of fate, so there is no clean family.',
  spacious: 'Only “space” (room) is a genuinely useful relative, and it also means outer space; “spaciously” is rare and “spaciousness” is uncommon at this level, so fewer than three forms are worth teaching.',
  demand: 'The verb “demand” (to insist) and the adjective “demanding” (difficult) shift away from the noun sense of a strong public need, and the verb sense already belongs to Unit 1.',
  machinery: '“machine” is the countable base word, while “mechanical” and “mechanic” come from a different root and shift towards automatic behaviour and repair work, so no clean family keeps the collective sense.',
  enormous: 'Only “enormously” (very much) is a straightforward relative, and “enormity” means great wickedness, so fewer than three forms are worth teaching.',
  collision: 'Only “collide” is a genuine relative; “colliding” is an inflection and “collider” is a technical physics term, so fewer than three useful forms exist.',
  livelihood: 'A compound noun with no derived forms; “live” and “lively” belong to different senses.',
  fatality: '“fatal” is closely related, but “fatally” is used mostly in “fatally injured”, which this unit avoids, or in “fatally flawed”, which shifts the sense, so only two reliable forms remain.',
  initiative: '“initiate” (to start) is related, but “initiation” is rare or ritual and “initial” and “initially” mean “first”, so fewer than three forms keep the sense.',
  campaign: '“campaign” is both noun and verb with one spelling, “campaigner” is the only distinct form, and “campaigning” is an inflection or gerund, so fewer than three forms exist.',
  pothole: 'A compound noun with no derived forms.',
  trauma: 'Only “traumatic” is a useful relative; “traumatically” is rare and “traumatise” is not needed at this level, so fewer than three forms are worth teaching.',
  measures: 'The target sense is “actions”; “measure” (to find a size), “measurement” and “measurable” all shift to size, so no family keeps the sense.',
  estimate: 'Only “estimation” is a distinct relative: “estimated” is a Unit 1 target, “underestimate” is a Unit 3 target and the noun “estimate” has the same spelling, so fewer than three forms remain.',
  regulation: '“regulate” is useful, but “regulatory” and “regulator” are formal and rare at this level and “regulated” is an inflection, so fewer than three forms are worth teaching.'
});
