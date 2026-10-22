// Unit 1 word-family batch 2: 3 items for each of 12 further words with a genuine word family (36 total).
// status draft - NOT imported until the teacher approves.
const unitNumber = 1;
function family(id, term, family, sourceText, acceptedAnswer) {
  const vocabularyId = `vocab_${term}`;
  return {
    activityContentId:`u1_writing_word_family_${id}`, unitNumber, contentType:'writing_set', status:'draft',
    activityData:{ taskType:'word_family', prompt:`Use the correct form from the ${family} word family.`, sourceText, acceptedAnswers:[acceptedAnswer], linkedVocabularyIds:[vocabularyId], primaryEvidenceTargetId:vocabularyId }
  };
}

export default [
  family("urge_a","urge","urge","Fans were quick to _____ the team to keep fighting in the last minutes.","urge"),
  family("urge_b","urge","urge","The doctor said the injury needed _____ treatment.","urgent"),
  family("urge_c","urge","urge","There was a real sense of _____ in the dressing room before the final.","urgency"),
  family("demand_a","demand","demand","Training twice a day is very _____ for young players.","demanding"),
  family("demand_b","demand","demand","There is growing _____ for tickets to the final.","demand"),
  family("demand_c","demand","demand","The job places heavy _____ on the club's volunteers.","demands"),
  family("intense_a","intense","intense","The _____ of the final minutes left the players exhausted.","intensity"),
  family("intense_b","intense","intense","Both teams played _____ from the first whistle.","intensely"),
  family("intense_c","intense","intense","Coaches often _____ the training before a big tournament.","intensify"),
  family("unfamiliar_a","unfamiliar","unfamiliar","Most players were _____ with the rules after one week.","familiar"),
  family("unfamiliar_b","unfamiliar","unfamiliar","Her _____ with the pitch gave her an advantage over the visitors.","familiarity"),
  family("unfamiliar_c","unfamiliar","unfamiliar","A short session helps new members _____ themselves with the equipment.","familiarise"),
  family("estimated_a","estimated","estimate","Officials _____ that about five thousand fans attended the match.","estimate"),
  family("estimated_b","estimated","estimate","Do not _____ your opponent; she is a very strong player.","underestimate"),
  family("estimated_c","estimated","estimate","By my _____, the match will last about two hours.","estimation"),
  family("historic_a","historic","historic","The museum tells the _____ of the sport in our region.","history"),
  family("historic_b","historic","historic","The stadium has great _____ importance for the local community.","historical"),
  family("historic_c","historic","historic","A local _____ wrote a book about the club's early years.","historian"),
  family("minimum_a","minimum","minimum","Only _____ equipment is needed: a ball and a pair of shoes.","minimal"),
  family("minimum_b","minimum","minimum","Good coaching can _____ the risk of injury.","minimise"),
  family("minimum_c","minimum","minimum","The rule change affected the younger players only _____.","minimally"),
  family("generation_a","generation","generation","Young coaches hope to _____ more interest in the sport.","generate"),
  family("generation_b","generation","generation","There is a clear _____ difference in how fans watch matches.","generational"),
  family("generation_c","generation","generation","A back-up _____ kept the floodlights on during the storm.","generator"),
  family("relatively_a","relatively","relatively","Please tell your _____ the time of the match.","relatives"),
  family("relatively_b","relatively","relatively","The coach explained how this exercise _____ to the final game.","relates"),
  family("relatively_c","relatively","relatively","The _____ size of the two stadiums surprised the visitors.","relative"),
  family("opponent_a","opponent","opponent","Several players _____ the plan to move the match to Sunday.","oppose"),
  family("opponent_b","opponent","opponent","There was strong _____ to the plan to close the pool.","opposition"),
  family("opponent_c","opponent","opponent","The two goalposts stand at _____ ends of the pitch.","opposite"),
  family("championship_a","championship","championship","She became the national _____ at the age of sixteen.","champion"),
  family("championship_b","championship","championship","The school has won three regional _____ in a row.","championships"),
  family("championship_c","championship","championship","The _____ final starts at noon on Saturday.","championship"),
  family("craftspeople_a","craftspeople","craft","She has learned the _____ of woodworking over many years.","craft"),
  family("craftspeople_b","craftspeople","craft","The _____ of the handmade bats is excellent.","craftsmanship"),
  family("craftspeople_c","craftspeople","craft","Each bat is _____ by hand from a single piece of ash wood.","crafted"),
];
