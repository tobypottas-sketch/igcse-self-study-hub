// Audits the multi-slot typed-answer Mastery tasks the REAL generators build from real Unit 1 content (no student data).
// Two views: the pool (every pair of authored sentences/forms a generator could ever combine) and what is actually served (the real
// planPathwayQuestion across many deterministic seeds).
import unit from '../../content/vocabulary/releases/unit-01.js';
import { plannerContent } from '../../src/vocabulary/data.js';
import { planPathwayQuestion } from '../../src/vocabulary/pathway-planner.js';
import { lexemeIndex, relateSlots, SLOT_RELATION } from '../../src/vocabulary/slot-distinctness.js';
import { improveRecordsFor } from '../../supabase/functions/_shared/vocabulary-typed-forms.js';
import { evaluateFamilyEligibility, familyMasks, familySlotsForMask, FAMILY_STATUS } from '../../supabase/functions/_shared/vocabulary-word-family.js';

export const UNIT = unit;
// The app receives DB-shaped rows and normalises them with plannerContent(); the audit does the same so it exercises the real content path.
export function plannerFor(content = unit) {
  return plannerContent({
    occurrences:content.occurrences.map(o => ({ occurrence_id:o.occurrenceId, vocabulary_id:o.vocabularyId, unit_number:o.unitNumber, unit_title:o.unitTitle, set_number:o.setNumber, position_in_unit:o.positionInUnit, sense_id:o.senseId })),
    items:content.items.map(i => ({ vocabulary_id:i.vocabularyId, term:i.term, part_of_speech:i.partOfSpeech, core_meaning:i.coreMeaning, senses:i.senses, word_family:i.wordFamily, collocations:i.collocations })),
    contexts:content.contexts.map(c => ({ context_id:c.contextId, vocabulary_id:c.vocabularyId, occurrence_id:c.occurrenceId, sense_id:c.senseId, context_type:c.type, prompt_text:c.text, target_rewrite:c.targetRewrite ?? null, accepted_answers:c.acceptedAnswers, misconception_category:c.misconceptionCategory ?? null })),
    activities:content.activities.map(a => ({ activity_content_id:a.activityContentId, unit_number:a.unitNumber, content_type:a.contentType, activity_data:a.activityData }))
  });
}
export const emptyCounts = () => ({ [SLOT_RELATION.EXACT]:0, [SLOT_RELATION.NORMALISED]:0, [SLOT_RELATION.INFLECTION]:0, [SLOT_RELATION.FAMILY]:0, [SLOT_RELATION.DISTINCT]:0 });
const accepted = data => (data.acceptedAnswers ?? []).map(String);

// Every ordered pair of a word's authored Precision sentences (what upgrade_passage can combine) and every asked set of Word Families forms.
export function poolAudit(content = unit) {
  const index = lexemeIndex(content.items);
  const precision = emptyCounts(), family = emptyCounts(), wordsWithoutDistinctPair = [], familyWordsWithoutCleanSet = [];
  for (const item of content.items) {
    const records = improveRecordsFor(content.activities, item.vocabularyId).filter(row => accepted(row.data).length && String(row.data.sourceText ?? '').trim());
    let distinct = 0;
    for (const a of records) for (const b of records) if (a.id !== b.id) { const relation = relateSlots(accepted(a.data), accepted(b.data), index); precision[relation] += 1; if (relation === SLOT_RELATION.DISTINCT) distinct += 1; }
    if (records.length >= 2 && !distinct) wordsWithoutDistinctPair.push(item.term);
    const sense = item.senses[0];
    if (evaluateFamilyEligibility(item, sense).status !== FAMILY_STATUS.ELIGIBLE) continue;
    let cleanMasks = 0;
    for (const mask of familyMasks(item, sense)) {
      const slots = familySlotsForMask(item, sense, mask).map(slot => [slot.form]);
      let clean = true;
      for (let i = 0; i < slots.length; i += 1) for (let j = i + 1; j < slots.length; j += 1) { const relation = relateSlots(slots[i], slots[j], index); family[relation] += 1; if (relation !== SLOT_RELATION.FAMILY && relation !== SLOT_RELATION.DISTINCT) clean = false; }
      if (clean) cleanMasks += 1;
    }
    if (!cleanMasks) familyWordsWithoutCleanSet.push(item.term);
  }
  return { precision, family, wordsWithoutDistinctPair, familyWordsWithoutCleanSet };
}

// What students are actually served: the real generator, every Unit 1 word, deterministic seeds.
export function servedAudit({ seeds = 12, content = unit } = {}) {
  const planner = plannerFor(content), index = lexemeIndex(content.items);
  const served = { precision_use:emptyCounts(), word_families:emptyCounts() }, built = { precision_use:0, word_families:0 }, refused = { precision_use:0, word_families:0 };
  const examples = [], inflectionTerms = { precision_use:new Set(), word_families:new Set() };
  for (const [pathwayId, bucket] of [['precision_use', 'precision_use'], ['word_families', 'word_families']]) {
    for (const target of planner.occurrences) for (let s = 0; s < seeds; s += 1) {
      let plan;
      try { plan = planPathwayQuestion({ pathwayId, stageId:'mastery', content:planner, target, mastery:{}, seed:`slot-audit:${s}:${target.occurrenceId}` }); } catch { refused[bucket] += 1; continue; }
      const lists = plan.question?.markingReference?.slotAnswers;
      if (!Array.isArray(lists) || lists.length < 2) continue;
      built[bucket] += 1;
      for (let i = 0; i < lists.length; i += 1) for (let j = i + 1; j < lists.length; j += 1) {
        const relation = relateSlots(lists[i], lists[j], index); served[bucket][relation] += 1; if (relation === SLOT_RELATION.INFLECTION) inflectionTerms[bucket].add(plan.item?.term);
        if (s === 0 && examples.length < 400) examples.push({ pathwayId, term:plan.item?.term, relation, slots:lists.map(list => list.join(' / ')) });
      }
    }
  }
  return { served, built, refused, examples, inflectionTerms:{ precision_use:[...inflectionTerms.precision_use], word_families:[...inflectionTerms.word_families] } };
}
