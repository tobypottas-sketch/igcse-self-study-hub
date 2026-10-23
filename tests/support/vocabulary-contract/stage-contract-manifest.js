// Machine-readable form of STAGE_CONTRACT.md v2 (the approved design, NOT today's activity map).
// Test infrastructure only: nothing in production imports this file.
export const STAGE_ORDER = Object.freeze(['recognise', 'match', 'apply', 'recall', 'mastery']);
export const PATHWAY_ORDER = Object.freeze(['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall']);

// Response-mode categories, ordered by cognitive rank.
export const MODE_RANK = Object.freeze({ select: 1, set_discrimination: 2, supported_context: 3, typed_cued: 4, typed_transfer: 5 });
// receptive = recognition/discrimination; supported = answer built or chosen with visible help; productive = typed, unsupported.
export const EVIDENCE_CLASS = Object.freeze({ receptive: 'receptive', supported: 'supported', productive: 'productive' });
export const SCAFFOLD_CEILING = Object.freeze({
  recognise: 'options', match: 'visible_set', apply: 'bank_or_options', recall: 'first_letter_and_length', mastery: 'none'
});

const T = (mode, extra = {}) => Object.freeze({ mode, status: 'existing', multiPart: false, provisional: false, ...extra });
const NEW = (mode, extra = {}) => T(mode, { status: 'new', ...extra });

// Every activity type named by the locked contract (existing, redesigned, new). `status` records what exists today.
export const ACTIVITY_REGISTRY = Object.freeze({
  // Meaning
  definition_to_word: T('select'), meaning_match: T('select', { status: 'redesign' }),
  match_set: NEW('set_discrimination'), drag_word_definition: T('set_discrimination', { status: 'moved' }), drag_definition_word: T('set_discrimination', { status: 'moved' }),
  which_situation_fits: T('supported_context', { status: 'redesign' }), meaning_in_context: T('supported_context', { status: 'moved' }),
  type_word_from_definition: T('typed_cued'), gloss_in_context_type: NEW('typed_transfer'),
  // Context
  choose_word_sentence: T('select'), context_match_set: NEW('set_discrimination'),
  gap_fill_bank: T('supported_context'), drag_word_sentence: T('supported_context'),
  type_missing_word: T('typed_cued'), type_in_passage: NEW('typed_transfer', { multiPart: true }),
  // Word Families
  word_family_identify: NEW('select'), family_sort: NEW('set_discrimination'), word_family_choice: T('supported_context', { status: 'moved' }),
  word_family_switch: T('typed_cued'), family_multi_form: NEW('typed_transfer', { multiPart: true }),
  // Paraphrasing
  same_idea: T('select'), phrase_match: T('set_discrimination', { status: 'redesign' }),
  build_paraphrase: T('supported_context'), build_same_idea: T('supported_context'), complete_paraphrase: T('typed_cued'),
  rewrite_phrase: T('typed_transfer', { status: 'redesign', provisional: true }), rewrite_idea: T('typed_transfer', { status: 'redesign', provisional: true }),
  // Precision & Use
  precision_choice: T('select'), precision_match: T('set_discrimination', { status: 'redesign' }), improve_vocabulary: T('supported_context', { status: 'redesign' }),  // today it is typed free text at Apply, Recall and Mastery (measured)
  precision_type_cued: NEW('typed_cued'), upgrade_passage: NEW('typed_transfer', { multiPart: true }),
  // Spelling & Recall
  spelling_choice: T('select'), spot_the_error: NEW('set_discrimination'), spelling_rebuild: T('supported_context', { status: 'redesign' }),
  spell_word: T('typed_cued'), spell_in_context: T('typed_transfer')
});

// Production names that already implement a contract type. Meaning Match (word_definition_match) is an existing 4-pair
// set-matching activity (src/vocabulary/match-set.js), so it satisfies the contract's `match_set`.
export const LEGACY_ALIASES = Object.freeze({ word_definition_match: 'match_set' });
export const contractName = type => LEGACY_ALIASES[type] ?? type;

// The locked ladder (STAGE_CONTRACT.md, "LOCKED STAGE CONTRACT").
const LADDER = Object.freeze({
  meaning: { recognise: ['definition_to_word', 'meaning_match'], match: ['match_set', 'drag_word_definition', 'drag_definition_word'], apply: ['which_situation_fits', 'meaning_in_context'], recall: ['type_word_from_definition'], mastery: ['gloss_in_context_type'] },
  context: { recognise: ['choose_word_sentence'], match: ['context_match_set'], apply: ['gap_fill_bank', 'drag_word_sentence'], recall: ['type_missing_word'], mastery: ['type_in_passage'] },
  word_families: { recognise: ['word_family_identify'], match: ['family_sort'], apply: ['word_family_choice'], recall: ['word_family_switch'], mastery: ['family_multi_form'] },
  paraphrasing: { recognise: ['same_idea'], match: ['phrase_match'], apply: ['build_paraphrase', 'build_same_idea'], recall: ['complete_paraphrase'], mastery: ['rewrite_phrase', 'rewrite_idea'] },
  precision_use: { recognise: ['precision_choice'], match: ['precision_match'], apply: ['improve_vocabulary'], recall: ['precision_type_cued'], mastery: ['upgrade_passage'] },
  spelling_recall: { recognise: ['spelling_choice'], match: ['spot_the_error'], apply: ['spelling_rebuild'], recall: ['spell_word'], mastery: ['spell_in_context'] }
});

function stageEntry(pathwayId, stageId) {
  const rank = STAGE_ORDER.indexOf(stageId) + 1;
  const types = LADDER[pathwayId][stageId];
  const productive = stageId === 'recall' || stageId === 'mastery';
  const provisional = types.some(type => ACTIVITY_REGISTRY[type].provisional);
  return Object.freeze({
    pathwayId, stageId, cognitiveRank: rank,
    activityTypes: Object.freeze([...types]),
    responseModeRank: rank,
    evidenceClass: productive ? EVIDENCE_CLASS.productive : stageId === 'apply' ? EVIDENCE_CLASS.supported : EVIDENCE_CLASS.receptive,
    productive,
    scaffoldCeiling: SCAFFOLD_CEILING[stageId],
    optionsAllowed: ['recognise', 'match', 'apply'].includes(stageId),
    bankAllowed: stageId === 'apply',
    typingRequired: productive,
    multiPartAllowed: types.some(type => ACTIVITY_REGISTRY[type].multiPart),
    provisionalEvidenceAllowed: provisional,
    // Only Recall/Mastery evidence can contribute to "secure"; provisional evidence cannot do so alone (Locked Decision 5).
    canSatisfySecureAlone: productive && !provisional
  });
}

export const STAGE_CONTRACT = Object.freeze(Object.fromEntries(PATHWAY_ORDER.map(pathwayId => [pathwayId, Object.freeze(Object.fromEntries(STAGE_ORDER.map(stageId => [stageId, stageEntry(pathwayId, stageId)])))])));
export function contractTypes(pathwayId, stageId) { return STAGE_CONTRACT[pathwayId]?.[stageId]?.activityTypes ?? []; }
