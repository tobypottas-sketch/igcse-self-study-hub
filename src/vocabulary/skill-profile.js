const SKILLS = Object.freeze({
  meaning_context:{ label:'Meaning in context' },
  question_text:{ label:'Question ↔ Text' },
  phrase_paraphrasing:{ label:'Phrase paraphrasing' },
  idea_paraphrasing:{ label:'Idea paraphrasing' },
  writing_vocabulary:{ label:'Writing vocabulary' },
  lexical_production:{ label:'Lexical production' }
});

const TYPE_SKILLS = Object.freeze({
  meaning_match:['meaning_context'],
  which_situation_fits:['meaning_context'],
  meaning_in_context:['meaning_context'],
  correct_usage:['meaning_context','writing_vocabulary'],
  question_text_bridge:['question_text'],
  find_evidence:['question_text'],
  phrase_match:['phrase_paraphrasing'],
  build_paraphrase:['phrase_paraphrasing','lexical_production'],
  complete_paraphrase:['phrase_paraphrasing','lexical_production'],
  rewrite_phrase:['phrase_paraphrasing','lexical_production'],
  same_idea:['idea_paraphrasing'],
  spot_meaning_change:['idea_paraphrasing'],
  build_same_idea:['idea_paraphrasing','lexical_production'],
  rewrite_idea:['idea_paraphrasing','lexical_production'],
  collocation_builder:['writing_vocabulary','lexical_production'],
  word_family_switch:['writing_vocabulary','lexical_production'],
  improve_vocabulary:['writing_vocabulary','lexical_production'],
  explain_another_way:['idea_paraphrasing','lexical_production']
});

const STRENGTH_WEIGHT = Object.freeze({ light:1, medium:2, strong:3, very_strong:4 });
const SUPPORT_WEIGHT = Object.freeze({ none:1, light:.6, major:.25 });
const MISCONCEPTIONS = Object.freeze({
  quantity_change:'Changes quantity while paraphrasing',
  degree_change:'Changes degree or certainty',
  time_change:'Changes the time relationship',
  cause_effect_change:'Changes the cause/effect relationship',
  contrast_change:'Changes the contrast relationship',
  added_information:'Adds information that was not in the source',
  omitted_information:'Drops important meaning',
  unnatural_collocation:'Uses unnatural collocations or word combinations',
  wrong_form:'Chooses the wrong word form',
  too_vague:'Uses wording that is too vague',
  register_mismatch:'Uses register that does not fit the context',
  related_but_inaccurate:'Chooses related but imprecise language',
  meaning_confusion:'Confuses the intended meaning',
  retrieval_failure:'Cannot yet retrieve the language independently',
  context_mismatch:'Chooses language that does not fit the context'
});

function metadata(event) {
  return event?.metadata && typeof event.metadata === 'object' ? event.metadata : {};
}
function safeStrength(value) { return STRENGTH_WEIGHT[value] ? value : 'light'; }
function safeSupport(value) { return SUPPORT_WEIGHT[value] != null ? value : 'none'; }
function statusFor(row) {
  if (!row.evidenceCount) return 'Insufficient evidence';
  if (row.errorWeight >= 5 && row.successWeight < row.errorWeight) return 'Needs attention';
  if (row.independentStrongCount >= 2 && row.successWeight >= 7 && row.successWeight >= row.errorWeight * 1.5) return 'Strong';
  if (row.successWeight >= 4 && row.successWeight >= row.errorWeight) return 'Secure';
  if (row.successWeight > 0) return 'Developing';
  return 'Needs attention';
}

export function skillFamiliesForQuestionType(questionType) {
  return [...(TYPE_SKILLS[String(questionType ?? '')] ?? [])];
}

export function buildVocabularySkillProfile(events = []) {
  const accumulators = Object.fromEntries(Object.keys(SKILLS).map(key => [key, { evidenceCount:0, successWeight:0, errorWeight:0, evidenceScore:0, independentStrongCount:0 }]));
  for (const event of Array.isArray(events) ? events : []) {
    const meta = metadata(event);
    const families = skillFamiliesForQuestionType(meta.question_type);
    if (!families.length) continue;
    const strength = safeStrength(meta.evidence_strength);
    const support = safeSupport(meta.support_level);
    const weight = STRENGTH_WEIGHT[strength] * SUPPORT_WEIGHT[support];
    const correct = meta.outcome === 'correct';
    for (const family of families) {
      const row = accumulators[family];
      row.evidenceCount += 1;
      if (correct) {
        row.successWeight += weight;
        row.evidenceScore += weight;
        if (support === 'none' && ['strong','very_strong'].includes(strength)) row.independentStrongCount += 1;
      } else {
        row.errorWeight += STRENGTH_WEIGHT[strength];
        row.evidenceScore -= Math.max(.5, STRENGTH_WEIGHT[strength] * .5);
      }
    }
  }
  const skills = {};
  for (const [key, definition] of Object.entries(SKILLS)) {
    const row = accumulators[key];
    skills[key] = {
      label:definition.label,
      status:statusFor(row),
      evidenceCount:row.evidenceCount,
      evidenceScore:Number(row.evidenceScore.toFixed(2)),
      independentStrongCount:row.independentStrongCount
    };
  }
  const evidenced = Object.entries(skills).filter(([,row]) => row.evidenceCount > 0);
  const statusRank = { 'Needs attention':0, Developing:1, Secure:2, Strong:3, 'Insufficient evidence':-1 };
  const strongest = evidenced.slice().sort((a,b) => statusRank[b[1].status] - statusRank[a[1].status] || b[1].evidenceScore - a[1].evidenceScore)[0]?.[0] ?? null;
  const development = evidenced.slice().sort((a,b) => statusRank[a[1].status] - statusRank[b[1].status] || a[1].evidenceScore - b[1].evidenceScore)[0]?.[0] ?? null;
  return { skills, strongestSkill:strongest, developmentSkill:development, misconceptions:summarizeMisconceptions(events) };
}

export function summarizeMisconceptions(events = []) {
  const counts = new Map();
  let index = 0;
  for (const event of Array.isArray(events) ? events : []) {
    const meta = metadata(event);
    if (meta.outcome === 'correct') continue;
    const code = meta.misconception;
    if (!MISCONCEPTIONS[code]) continue;
    const current = counts.get(code);
    if (current) current.count += 1;
    else counts.set(code, { count:1, firstIndex:index });
    index += 1;
  }
  return [...counts.entries()]
    .map(([code,row]) => ({ code, label:MISCONCEPTIONS[code], count:row.count, firstIndex:row.firstIndex }))
    .sort((a,b) => b.count - a.count || a.firstIndex - b.firstIndex)
    .map(({ firstIndex, ...row }) => row);
}

export function skillLabel(skillId) {
  return SKILLS[skillId]?.label ?? String(skillId ?? '').replaceAll('_',' ');
}
