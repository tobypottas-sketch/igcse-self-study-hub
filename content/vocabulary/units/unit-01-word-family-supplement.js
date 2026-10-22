import unit1LanguageBank from './unit-01-language-bank.js';

const unitNumber = 1;
const status = 'approved';

function family(id, vocabularyId, prompt, sourceText, acceptedAnswer) {
  return {
    activityContentId:`u1_writing_word_family_${id}`,
    unitNumber,
    contentType:'writing_set',
    status,
    activityData:{
      taskType:'word_family',
      prompt,
      sourceText,
      acceptedAnswers:[acceptedAnswer],
      linkedVocabularyIds:[vocabularyId],
      primaryEvidenceTargetId:vocabularyId
    }
  };
}

const ID_KEY_BY_TERM = { 'leisure time':'leisure' }; // display term reworded; the stable id keeps the original key
function vocabularyIdFor(term) {
  const keyed = ID_KEY_BY_TERM[String(term ?? '').trim().toLocaleLowerCase('en')] ?? term;
  return `vocab_${String(keyed ?? '').trim().toLocaleLowerCase('en').replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')}`;
}

function languageBankContext(term, record) {
  const vocabularyId = vocabularyIdFor(term);
  return {
    activityContentId:`language-bank:${record.id}`,
    unitNumber,
    contentType:'writing_set',
    status,
    activityData:{
      taskType:'language_bank_context',
      prompt:'Complete the sentence with the best word or phrase.',
      sourceText:record.text,
      acceptedAnswers:[record.answer],
      distractors:Array.isArray(record.distractors) ? record.distractors : [],
      linkedVocabularyIds:[vocabularyId],
      primaryEvidenceTargetId:vocabularyId,
      languageBankContextId:record.id
    }
  };
}

const languageBankContextActivities = Object.entries(unit1LanguageBank).flatMap(([term, bank]) =>
  (Array.isArray(bank?.contexts) ? bank.contexts : []).map(record => languageBankContext(term, record))
);

export default [
  // Second prompts for targets already represented in the core Unit 1 activity bank.
  family('competitor_b','vocab_competitor','Use the correct form from the competitor word family.','The final was highly _____ from start to finish.','competitive'),
  family('determined_b','vocab_determined','Use the correct form from the determined word family.','The trial results will _____ who joins the final team.','determine'),
  family('preference_b','vocab_preference','Use the correct form from the preference word family.','Her _____ is for individual sports rather than team games.','preference'),
  family('afford_b','vocab_afford','Use the correct form from the afford word family.','For some families, the full membership fee is still _____.','unaffordable'),
  family('permit_b','vocab_permit','Use the correct form from the permit word family.','The rules do not _____ spectators to enter the training area.','permit'),
  family('arrange_b','vocab_arrange','Use the correct form from the arrange word family.','The coach will _____ transport for the away match.','arrange'),
  family('recommend_b','vocab_recommend','Use the correct form from the recommend word family.','Coaches _____ a short warm-up before intense exercise.','recommend'),
  family('threaten_b','vocab_threaten','Use the correct form from the threaten word family.','Poor weather could _____ the outdoor tournament.','threaten'),
  family('achievement_b','vocab_achievement','Use the correct form from the achievement word family.','Completing the marathon was an impressive _____.','achievement'),
  family('challenge_b','vocab_challenge','Use the correct form from the challenge word family.','The steep route was especially _____ for inexperienced runners.','challenging'),

  // Two prompts for each additional Unit 1 target with a genuine word-family relationship.
  family('avoid_a','vocab_avoid','Use the correct form from the avoid word family.','Good warm-ups can help athletes _____ unnecessary injuries.','avoid'),
  family('avoid_b','vocab_avoid','Use the correct form from the avoid word family.','The coach stressed the _____ of unnecessary risk before the event.','avoidance'),

  family('deny_a','vocab_deny','Use the correct form from the deny word family.','The player issued a firm _____ of the accusation.','denial'),
  family('deny_b','vocab_deny','Use the correct form from the deny word family.','The player continued to _____ breaking the rules.','deny'),

  family('resent_a','vocab_resent','Use the correct form from the resent word family.','She began to _____ the extra training sessions.','resent'),
  family('resent_b','vocab_resent','Use the correct form from the resent word family.','His _____ grew when he was repeatedly left out of the team.','resentment'),

  family('regret_a','vocab_regret','Use the correct form from the regret word family.','Missing the final because of poor preparation was _____.','regrettable'),
  family('regret_b','vocab_regret','Use the correct form from the regret word family.','She may _____ leaving the club so early.','regret'),

  family('discipline_a','vocab_discipline','Use the correct form from the discipline word family.','A _____ training routine helped him improve steadily.','disciplined'),
  family('discipline_b','vocab_discipline','Use the correct form from the discipline word family.','Success in competitive sport requires patience and _____.','discipline'),

  family('overwhelming_a','vocab_overwhelming','Use the correct form from the overwhelming word family.','The noise from the crowd began to _____ the younger players.','overwhelm'),
  family('overwhelming_b','vocab_overwhelming','Use the correct form from the overwhelming word family.','The support from the crowd was _____ during the final.','overwhelming'),

  family('solution_a','vocab_solution','Use the correct form from the solution word family.','The team needs to _____ the scheduling problem before Friday.','solve'),
  family('solution_b','vocab_solution','Use the correct form from the solution word family.','Sharing the facilities provided a practical _____.','solution'),

  family('patience_a','vocab_patience','Use the correct form from the patience word family.','Please wait _____ while the scores are checked.','patiently'),
  family('patience_b','vocab_patience','Use the correct form from the patience word family.','Young players need _____ when learning a difficult skill.','patience'),

  family('incredible_a','vocab_incredible','Use the correct form from the incredible word family.','She performed _____ well in the final.','incredibly'),
  family('incredible_b','vocab_incredible','Use the correct form from the incredible word family.','The team made an _____ comeback in the second half.','incredible'),

  family('selection_a','vocab_selection','Use the correct form from the selection word family.','The coach will _____ the final squad tomorrow.','select'),
  family('selection_b','vocab_selection','Use the correct form from the selection word family.','The _____ process includes fitness tests and an interview.','selection'),

  family('produce_a','vocab_produce','Use the correct form from the produce word family.','The club increased _____ of its training videos this year.','production'),
  family('produce_b','vocab_produce','Use the correct form from the produce word family.','The workshop is the main _____ of handmade sports equipment in the area.','producer'),

  family('significant_a','vocab_significant','Use the correct form from the significant word family.','Participation increased _____ after the new programme began.','significantly'),
  family('significant_b','vocab_significant','Use the correct form from the significant word family.','The result has great _____ for the team’s future.','significance'),

  family('expansion_a','vocab_expansion','Use the correct form from the expansion word family.','The organisers plan to _____ the after-school programme next term.','expand'),
  family('expansion_b','vocab_expansion','Use the correct form from the expansion word family.','The rapid _____ of the club created a need for more coaches.','expansion'),

  family('reputation_a','vocab_reputation','Use the correct form from the reputation word family.','The club is _____ for supporting young athletes.','reputable'),
  family('reputation_b','vocab_reputation','Use the correct form from the reputation word family.','The academy has a strong _____ for excellent coaching.','reputation'),

  family('reasonable_a','vocab_reasonable','Use the correct form from the reasonable word family.','The membership fee is _____ priced for students.','reasonably'),
  family('reasonable_b','vocab_reasonable','Use the correct form from the reasonable word family.','The referee rejected the _____ complaint immediately.','unreasonable'),

  // Reviewed language-bank contexts publish through the existing unit-activity channel so
  // browser and server share one authoritative record without adding database columns.
  ...languageBankContextActivities
];
