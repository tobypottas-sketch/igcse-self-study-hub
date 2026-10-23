// The one place that says when a Vocabulary Builder pathway may go live for a unit.
//
// A pathway is live only when every one of its five stages has a large enough, genuinely buildable cohort of words, the words
// that can run every rung are numerous enough to carry the pathway, and any content-diversity rule holds. Nothing here is a
// switch someone remembers to flip: readiness is a pure function of the unit's live content rows. The unit registry can only
// HOLD a pathway back (an editorial hold); it can never make one live.
//
// The numbers are initial, tunable thresholds. Percentages apply to the unit's expected word count.
export const MISSION_FLOOR = 10; // one honest 10-question mission with no repeated word

export const READINESS_RULES = Object.freeze({
  meaning:Object.freeze({ share:0.9 }),
  spelling_recall:Object.freeze({ share:0.9 }),
  context:Object.freeze({ share:0.8 }),
  precision_use:Object.freeze({ share:0.8 }),
  word_families:Object.freeze({ share:0.4 }),
  // Match and Recall are phrase-only by the pathway contract (there is no idea-level rung), so they only need one mission of
  // words; Recognise, Apply and Mastery draw on both phrase and idea records, so they need both kinds to be present.
  paraphrasing:Object.freeze({
    stageMinimum:Object.freeze({ recognise:20, match:10, apply:20, recall:10, mastery:20 }),
    diversity:Object.freeze([
      Object.freeze({ id:'phrase_records', label:'words with phrase records', contentType:'phrase_set', minimum:10 }),
      Object.freeze({ id:'idea_records', label:'words with idea records', contentType:'idea_set', minimum:10 })
    ])
  })
});

// Words a stage must be buildable for. `expectedWords` is the unit's planned size, so a half-published unit cannot pass.
export function stageMinimum(pathwayId, stageId, expectedWords) {
  const rule = READINESS_RULES[pathwayId];
  if (!rule) return MISSION_FLOOR;
  if (rule.stageMinimum?.[stageId] != null) return rule.stageMinimum[stageId];
  return Math.max(MISSION_FLOOR, Math.ceil(rule.share * Number(expectedWords || 0)));
}

// Question types whose wrong options are a judgement call: a generated option can also be a defensible answer. For these, only
// teacher-reviewed (or authored) options make a word ready; generated ones are refused. Match / Recognise questions whose wrong
// options are same-part-of-speech words, and spelling (where a wrong spelling cannot be right), stay lenient; the teacher report
// shows how much of that content is reviewed.
export const STRICT_REVIEW_QUESTION_TYPES = Object.freeze([
  'which_situation_fits',  // Meaning Apply
  'meaning_in_context',    // Meaning Mastery
  'choose_word_sentence',  // Context Recognise
  'context_sentence_match',// Context Match
  'gap_fill_bank',         // Context Apply
  'drag_word_sentence'     // Context Apply
]);
