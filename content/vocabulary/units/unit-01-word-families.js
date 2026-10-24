// Unit 1 · Word Families — authored families (Job 9). CANONICAL SOURCE for Word Families Mastery.
//
// Every row is AUTHORED, never derived: the word, its part of speech (stated, not inferred from a suffix), one natural example sentence
// that contains the form exactly once and not as the first word (so it can be blanked), and the reason the form is worth teaching.
// A family is accepted only when it has >= 3 pedagogically useful forms INCLUDING the headword, >= 2 different parts of speech, and an
// example for every form. build-unit.js turns each row into sense.wordFamilyForms { form, partOfSpeech, example, pedagogicallyUseful:true }
// and sets the word's plain family list (item.wordFamily) to the non-headword forms listed here, so Recognise/Match/Apply/Recall and
// Mastery all describe the SAME family.
//
//   forms[]          accepted, taught forms. `why` is the pedagogical reason (review aid, not shown to students).
//   excludedForms[]  related words deliberately NOT taught, with the reason (review aid).
//   rejected         headwords that were considered and NOT made families, with the reason.
const f = (form, partOfSpeech, example, why, note) => ({ form, partOfSpeech, example, why, ...(note ? { note } : {}) });

export const unit1WordFamilies = Object.freeze({
  preference: { forms: [
    f('preference', 'noun', 'Most customers showed a clear preference for the cheaper trainers.', 'Headword; frequent in survey and opinion writing.'),
    f('prefer', 'verb', 'Many teenagers prefer exercising with friends to training alone.', 'The base verb; essential for speaking and writing about choices.'),
    f('preferable', 'adjective', 'For a short journey, cycling is preferable to taking the bus.', 'Common comparative-evaluation adjective in discussion essays.')
  ] },
  avoid: { forms: [
    f('avoid', 'verb', 'Careful players avoid unnecessary risks late in the match.', 'Headword.'),
    f('avoidance', 'noun', 'Regular stretching is an important part of injury avoidance.', 'Noun form used in formal and report writing.'),
    f('unavoidable', 'adjective', 'Some delays on long journeys are unavoidable.', 'The common negative adjective; far more frequent than "avoidable".')
  ], excludedForms: [{ form: 'avoidable', reason: 'Much rarer than unavoidable; adds little for IGCSE.' }] },
  afford: { forms: [
    f('afford', 'verb', 'Many families cannot afford to buy new football boots every year.', 'Headword.'),
    f('affordable', 'adjective', 'The club keeps its membership fees affordable for students.', 'Very common adjective about prices and services.'),
    f('unaffordable', 'adjective', 'For some families, private coaching is simply unaffordable.', 'Frequent in news and discussion texts about cost.')
  ], excludedForms: [{ form: 'affordability', reason: 'Abstract noun beyond the level of this unit.' }] },
  deny: { forms: [
    f('deny', 'verb', 'The player continued to deny that he had broken the rules.', 'Headword.'),
    f('denial', 'noun', 'Despite his denial, the video showed him touching the ball.', 'Noun form common in news reports.'),
    f('undeniable', 'adjective', 'Her talent for running is undeniable.', 'Strong adjective for argument and opinion writing.')
  ] },
  arrange: { forms: [
    f('arrange', 'verb', 'Could you arrange a meeting with the coach for Friday?', 'Headword.'),
    f('arrangement', 'noun', 'The new arrangement allows students to train before school.', 'Very common noun; also "make arrangements".'),
    f('rearrange', 'verb', 'We had to rearrange the match because of the storm.', 'Useful everyday verb that shows the re- prefix.')
  ] },
  recommend: { forms: [
    f('recommend', 'verb', 'My coach would recommend this book to any young runner.', 'Headword.'),
    f('recommendation', 'noun', 'On my teacher’s recommendation, I joined the swimming club.', 'Noun used in reviews and formal letters.'),
    f('recommended', 'adjective', 'The recommended amount of exercise for teenagers is one hour a day.', 'Participial adjective common in advice texts.', 'Participial adjective.')
  ] },
  threaten: { forms: [
    f('threaten', 'verb', 'Rising costs may threaten the future of small clubs.', 'Headword.'),
    f('threat', 'noun', 'Heavy rain is a real threat to the outdoor final.', 'The noun; frequent in news and environment topics.'),
    f('threatening', 'adjective', 'The sky looked dark and threatening before the match.', 'Adjective for description and atmosphere.')
  ] },
  resent: { forms: [
    f('resent', 'verb', 'Some players resent being asked to train on Sundays.', 'Headword.'),
    f('resentment', 'noun', 'His resentment grew when he was dropped from the team again.', 'Noun for describing feelings in narrative writing.'),
    f('resentful', 'adjective', 'She felt resentful that her friends were allowed to leave early.', 'Adjective for character and feeling.')
  ] },
  regret: { forms: [
    f('regret', 'verb', 'You will regret skipping the warm-up if you pull a muscle.', 'Headword.'),
    f('regrettable', 'adjective', 'It is regrettable that so many fans missed the first goal.', 'Formal evaluative adjective for letters and reports.'),
    f('regrettably', 'adverb', 'The match, regrettably, has been cancelled.', 'Formal sentence adverb used in announcements.')
  ], excludedForms: [{ form: 'regretful', reason: 'Much less frequent than regrettable; easily confused with it.' }] },
  unfamiliar: { forms: [
    f('unfamiliar', 'adjective', 'The new exchange students found the local customs unfamiliar.', 'Headword.'),
    f('familiar', 'adjective', 'She soon felt at home because the routines were so familiar.', 'Base adjective; the contrast with unfamiliar is the point.'),
    f('familiarity', 'noun', 'Her familiarity with the course gave her a clear advantage.', 'Noun form for analytical writing.'),
    f('familiarise', 'verb', 'Take a few minutes to familiarise yourself with the safety rules.', 'Verb used in instructions and school notices (British spelling).')
  ] },
  opponent: { forms: [
    f('opponent', 'noun', 'Her opponent made very few mistakes in the final set.', 'Headword.'),
    f('oppose', 'verb', 'Several parents oppose the plan to close the sports hall.', 'Base verb; frequent in discussion and argument.'),
    f('opposition', 'noun', 'There was strong opposition to the new training schedule.', 'Abstract noun for debate and news writing.')
  ], excludedForms: [{ form: 'opposite', reason: 'Related in form but not in meaning for learners; would teach a false link.' }] },
  intense: { forms: [
    f('intense', 'adjective', 'The heat during the final lap was intense.', 'Headword.'),
    f('intensity', 'noun', 'The intensity of the training session surprised the beginners.', 'Noun form for description and analysis.'),
    f('intensely', 'adverb', 'She trained intensely for six weeks before the national trials.', 'Adverb form; shows how adjectives become adverbs.'),
    f('intensify', 'verb', 'Runners usually intensify their training as a race approaches.', 'Verb form with the -ify pattern.')
  ] },
  determined: { forms: [
    f('determined', 'adjective', 'Even after a heavy defeat, the team stayed determined to improve.', 'Headword.'),
    f('determine', 'verb', 'The final score will determine which team wins the league.', 'Base verb; common in formal and exam language.'),
    f('determination', 'noun', 'Her determination to succeed impressed every coach.', 'Noun for describing character in narrative and report writing.')
  ] },
  discipline: { forms: [
    f('discipline', 'noun', 'A strong sense of discipline helps athletes train even on cold mornings.', 'Headword.'),
    f('disciplined', 'adjective', 'The disciplined squad arrived early and warmed up quietly.', 'Adjective for character description.'),
    f('undisciplined', 'adjective', 'The coach criticised the team for its undisciplined play in the second half.', 'Opposite adjective; shows the un- prefix.')
  ] },
  achievement: { forms: [
    f('achievement', 'noun', 'Completing the course in under an hour was a great achievement.', 'Headword.'),
    f('achieve', 'verb', 'What do you hope to achieve by the end of the season?', 'Base verb; high-frequency in school and goal-setting language.'),
    f('achievable', 'adjective', 'Set small goals that are achievable within a week.', 'Adjective common in advice and planning texts.')
  ] },
  overwhelming: { forms: [
    f('overwhelming', 'adjective', 'The crowd gave the winners an overwhelming welcome.', 'Headword.'),
    f('overwhelm', 'verb', 'Too much homework can overwhelm even confident students.', 'Base verb.'),
    f('overwhelmed', 'adjective', 'The young goalkeeper felt overwhelmed by the noise.', 'Common feeling adjective; contrasts -ing and -ed adjectives.'),
    f('overwhelmingly', 'adverb', 'Students voted overwhelmingly for a longer lunch break.', 'Adverb used in surveys and results writing.')
  ] },
  challenge: { forms: [
    f('challenge', 'noun', 'Climbing the mountain in winter was a serious challenge.', 'Headword.'),
    f('challenging', 'adjective', 'The coach designed a challenging programme for the advanced group.', 'Very common adjective in school and work language.'),
    f('challenger', 'noun', 'The young challenger surprised the champion with an early lead.', 'Person noun in sport and competition.')
  ] },
  solution: { forms: [
    f('solution', 'noun', 'The school found a simple solution to the problem of crowded changing rooms.', 'Headword.'),
    f('solve', 'verb', 'It took the engineers months to solve the problem of the leaking roof.', 'Base verb; high-frequency.'),
    f('unsolved', 'adjective', 'The mystery of the missing trophy remained unsolved for years.', 'Participial adjective common in news and narrative.', 'Participial adjective.')
  ], excludedForms: [{ form: 'solvable', reason: 'Rare; "can be solved" is what learners need.' }] },
  estimated: { forms: [
    f('estimated', 'adjective', 'The estimated attendance was ten thousand people.', 'Headword.'),
    f('estimate', 'verb', 'Can you estimate how long the journey will take?', 'Base verb (the noun shares the spelling).'),
    f('estimation', 'noun', 'In my estimation, the team played better than last week.', 'Noun used in the phrase "in my estimation".'),
    f('underestimate', 'verb', 'Never underestimate the importance of a good warm-up.', 'Common verb that shows the under- prefix.')
  ] },
  minimum: { forms: [
    f('minimum', 'noun', 'You need a minimum of two hours of practice a week.', 'Headword.'),
    f('minimal', 'adjective', 'The injury caused only minimal damage, so she could play again soon.', 'Adjective for degree.'),
    f('minimise', 'verb', 'Wearing the right shoes helps to minimise the risk of injury.', 'Verb used in health and safety language (British spelling).')
  ] },
  competitor: { forms: [
    f('competitor', 'noun', 'Every competitor must wear a number during the race.', 'Headword.'),
    f('compete', 'verb', 'Over two hundred students compete in the school sports day.', 'Base verb.'),
    f('competition', 'noun', 'The competition begins at nine o’clock tomorrow.', 'High-frequency noun for events.'),
    f('competitive', 'adjective', 'Professional football is a highly competitive career.', 'Adjective for sport, work and business.')
  ] },
  patience: { forms: [
    f('patience', 'noun', 'Teaching beginners requires a great deal of patience.', 'Headword.'),
    f('patient', 'adjective', 'Be patient with yourself while you learn a new skill.', 'Base adjective; high-frequency.'),
    f('patiently', 'adverb', 'The fans waited patiently for the gates to open.', 'Adverb for narrative.'),
    f('impatient', 'adjective', 'He grew impatient when the match kept being delayed.', 'Opposite adjective; shows the im- prefix.')
  ] },
  incredible: { forms: [
    f('incredible', 'adjective', 'The view from the top of the mountain was incredible.', 'Headword.'),
    f('incredibly', 'adverb', 'The runner was incredibly fast over the final hundred metres.', 'Adverb of degree used constantly in speech.'),
    f('credible', 'adjective', 'Without evidence, the team’s excuse did not sound credible.', 'Base adjective in argument and news language.'),
    f('credibility', 'noun', 'Cheating would destroy the credibility of the whole competition.', 'Noun for formal and argumentative writing.')
  ] },
  historic: { forms: [
    f('historic', 'adjective', 'The opening of the new stadium was a historic occasion for the town.', 'Headword.'),
    f('history', 'noun', 'The club has a long and proud history.', 'Base noun.'),
    f('historical', 'adjective', 'The museum displays historical objects connected with the sport.', 'Teaches the historic / historical contrast.'),
    f('historian', 'noun', 'A local historian wrote a book about the early years of the club.', 'Person noun.')
  ] },
  selection: { forms: [
    f('selection', 'noun', 'The shop offers a wide selection of running shoes.', 'Headword.'),
    f('select', 'verb', 'Coaches will select the final team on Friday.', 'Base verb.'),
    f('selective', 'adjective', 'The academy is very selective about the players it accepts.', 'Adjective for describing schools and processes.')
  ] },
  produce: { forms: [
    f('produce', 'verb', 'The factory can produce thousands of footballs every week.', 'Headword.'),
    f('production', 'noun', 'The production of the new kit started in March.', 'Noun for industry and manufacturing contexts.'),
    f('producer', 'noun', 'The country is a leading producer of sports equipment.', 'Person or company noun.'),
    f('product', 'noun', 'Their latest product is a lightweight running shoe.', 'High-frequency noun linked to the verb.'),
    f('productive', 'adjective', 'A short rest can make your next training session more productive.', 'Adjective for study and work language.')
  ] },
  significant: { forms: [
    f('significant', 'adjective', 'There was a significant improvement in her times after three months.', 'Headword.'),
    f('significance', 'noun', 'The coach explained the significance of warming up properly.', 'Abstract noun for analysis.'),
    f('significantly', 'adverb', 'Her fitness has improved significantly since September.', 'Adverb used in reports and descriptions of change.')
  ] },
  expansion: { forms: [
    f('expansion', 'noun', 'The expansion of the sports centre created space for a new pool.', 'Headword.'),
    f('expand', 'verb', 'The club plans to expand its youth programme next year.', 'Base verb.'),
    f('expanding', 'adjective', 'The expanding league now includes twelve teams.', 'Participial adjective for growth.', 'Participial adjective.')
  ] },
  reputation: { forms: [
    f('reputation', 'noun', 'The academy has an excellent reputation for coaching young athletes.', 'Headword.'),
    f('reputable', 'adjective', 'Always buy sports equipment from a reputable shop.', 'Adjective for trust and quality.'),
    f('disreputable', 'adjective', 'Fans were angry that the club had worked with a disreputable agent.', 'Opposite adjective showing the dis- prefix.')
  ] },
  reasonable: { forms: [
    f('reasonable', 'adjective', 'The price of the tickets seemed reasonable for such an important match.', 'Headword.'),
    f('reasonably', 'adverb', 'The team played reasonably well in the first half.', 'Adverb of degree.'),
    f('unreasonable', 'adjective', 'Many students felt that the homework deadline was unreasonable.', 'Opposite adjective.'),
    f('reason', 'noun', 'The coach gave no reason for dropping the captain.', 'Base noun; high-frequency.')
  ] }
});

// Headwords considered and NOT made Mastery families. Each reason is final for Unit 1 and is reported in the Job 9 report.
export const unit1WordFamilyRejected = Object.freeze({
  'leisure time': 'A two-word phrase with no word family.',
  permit: 'Only the verb and the noun "permission" are common; "permissible" is formal and rare and "permitted" is a participle, so the family has too few teachable forms.',
  urge: 'The only related word, "urgent", has drifted in meaning ("needing action now"), so it would teach a false link.',
  demand: 'Only "demand" and "demanding" are common, and the noun shares the headword’s spelling; fewer than three distinct teachable forms.',
  racquet: 'No related forms.',
  tournament: 'No related forms.',
  'goal-oriented': 'A compound adjective; its only relatives are other compounds.',
  elite: 'Related forms ("elitism", "elitist") are specialised and negative.',
  generation: '"generate" and "generator" belong to a different meaning (producing), so the family would mix two senses.',
  pastime: 'A compound with no family.',
  feat: 'No related forms.',
  regardless: 'An adverb with no family.',
  monetary: '"money" is unrelated in form and "monetise" is technical.',
  struggle: 'The noun shares the spelling; "struggling" is a participle, so fewer than three distinct forms.',
  championship: 'Every related form ("champion", "championships") is a noun, so the family has only one part of speech.',
  relatively: '"relative" has several meanings, and "relatives" (family members) would teach a false link.',
  atmosphere: '"atmospheric" is rare and technical.',
  criteria: 'A plural form of "criterion"; the family is rare and technical.',
  craftspeople: 'Plural-only headword; "craft" and "craftsmanship" are weakly linked, so the family is thin.',
  antiques: '"antique" is just the singular; no other forms.'
});

export default unit1WordFamilies;
