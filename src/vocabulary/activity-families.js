// Student-facing "activity families" for the practice-type picker. ONE canonical mapping:
//   pathway → family (what the student sees) → underlying question types + the ladder stage(s) that use them.
// The question types come straight from PATHWAY_ACTIVITY_MAP (the same contract the Edge Function validates against), so this file
// only adds the classroom wording. Stages that use exactly the same question types are merged into one family (for example
// Context "Recall" and "Mastery" are both Type the Missing Word).
import { PATHWAY_ACTIVITY_MAP, PATHWAY_STAGE_IDS } from '../../supabase/functions/_shared/vocabulary-pathway-contract.js';

// Wording keyed by `${pathway}:${first stage of the family}`.
const COPY = Object.freeze({
  'meaning:recognise': ['Choose the Meaning', 'Pick the right word or definition'],
  'meaning:match': ['Match Words & Meanings', 'Drag each word onto its definition'],
  'meaning:apply': ['Real Situations', 'Decide which word fits a situation'],
  'meaning:recall': ['Recall the Word', 'Type the word from its meaning'],
  'meaning:mastery': ['Type the Word', 'Type the word that fits the meaning'],
  'context:recognise': ['Choose the Word', 'Pick the best word for the sentence'],
  'context:match': ['Match the Sentence', 'Pair sentences with the right word'],
  'context:apply': ['Fill the Gap', 'Complete sentences with the right word'],
  'context:recall': ['Type the Missing Word', 'Type the word that completes the sentence'],
  'context:mastery': ['Complete Both Sentences', 'Type the same word into two different sentences'],
  'word_families:recognise': ['Choose the Form', 'Pick the correct form of the word'],
  'word_families:match': ['Match the Family', 'Pair related word forms'],
  'word_families:apply': ['Choose the Form in a Sentence', 'Pick the form the sentence needs'],
  'word_families:recall': ['Change the Form', 'Type the form the sentence needs'],
  'word_families:mastery': ['Use the Whole Family', 'Type the right form of one word in several sentences'],
  'paraphrasing:recognise': ['Spot the Paraphrase', 'Find the phrase or idea that means the same'],
  'paraphrasing:match': ['Match Phrases', 'Pair phrases that mean the same'],
  'paraphrasing:apply': ['Build the Paraphrase', 'Put the pieces together to keep the meaning'],
  'paraphrasing:recall': ['Complete the Paraphrase', 'Fill in the missing words'],
  'paraphrasing:mastery': ['Rewrite It', 'Say it another way in your own words'],
  'precision_use:recognise': ['Choose the Precise Word', 'Pick the most exact word'],
  'precision_use:match': ['Precision Match', 'Pair words with the situations they suit'],
  'precision_use:apply': ['Improve the Vocabulary', 'Use the word bank to upgrade a sentence'],
  'precision_use:recall': ['Type the Precise Word', 'Type the exact word, with a first-letter clue'],
  'precision_use:mastery': ['Upgrade the Passage', 'Type better words into two sentences'],
  'spelling_recall:recognise': ['Choose the Spelling', 'Spot the correctly spelled word'],
  'spelling_recall:match': ['Spot the Spelling Error', 'Find the one misspelled word'],
  'spelling_recall:apply': ['Rebuild the Spelling', 'Put the letters back in order'],
  'spelling_recall:recall': ['Spell the Word', 'Type the word from memory'],
  'spelling_recall:mastery': ['Spell in Context', 'Spell the word inside a sentence']
});

const typesKey = types => [...types].sort().join('|');

function buildFamilies() {
  const result = {};
  for (const [pathwayId, stages] of Object.entries(PATHWAY_ACTIVITY_MAP)) {
    const byKey = new Map();
    for (const stageId of PATHWAY_STAGE_IDS) {
      const types = stages[stageId] ?? [];
      if (!types.length) continue;
      const key = typesKey(types);
      if (!byKey.has(key)) byKey.set(key, { stageIds: [], types: [...types] });
      byKey.get(key).stageIds.push(stageId);
    }
    result[pathwayId] = Object.freeze([...byKey.values()].map(group => {
      const first = group.stageIds[0];
      const [label, description] = COPY[`${pathwayId}:${first}`] ?? [null, null];
      return Object.freeze({
        id: `${pathwayId}:${first}`, pathwayId, label, description,
        stageIds: Object.freeze(group.stageIds), types: Object.freeze(group.types)
      });
    }));
  }
  return Object.freeze(result);
}

export const ACTIVITY_FAMILIES_BY_PATHWAY = buildFamilies();

export function activityFamilies(pathwayId) { return ACTIVITY_FAMILIES_BY_PATHWAY[String(pathwayId ?? '')] ?? []; }
export function activityFamily(pathwayId, familyId) { return activityFamilies(pathwayId).find(family => family.id === familyId) ?? null; }
