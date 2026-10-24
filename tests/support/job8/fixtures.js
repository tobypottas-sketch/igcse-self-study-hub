// Job 8 TEST FIXTURES. These are NOT production content and are never shipped: they exist only to prove that the Word Families Mastery
// builder, marker and readiness gate work when a family IS authored (Unit 1 has none yet). Each fixture is a clearly synthetic
// authoring record layered over a deep copy of the Unit 1 test content.
import { content as unitContent } from '../vocabulary-contract/journey-sim.js';

export const FAMILY_FIXTURE_FORMS = Object.freeze({
  vocab_avoid: Object.freeze([
    { form: 'avoid', partOfSpeech: 'verb', example: 'Players try to avoid injury by warming up properly.', pedagogicallyUseful: true },
    { form: 'avoidance', partOfSpeech: 'noun', example: 'The avoidance of injury is the main aim of a good warm-up.', pedagogicallyUseful: true },
    { form: 'avoidable', partOfSpeech: 'adjective', example: 'Most sports injuries are avoidable with careful preparation.', pedagogicallyUseful: true },
    { form: 'unavoidable', partOfSpeech: 'adjective', example: 'Some contact injuries are unavoidable in rugby.', pedagogicallyUseful: true, note: 'fixture only' }
  ]),
  vocab_preference: Object.freeze([
    { form: 'prefer', partOfSpeech: 'verb', example: 'Many students prefer individual sports to team games.', pedagogicallyUseful: true },
    { form: 'preference', partOfSpeech: 'noun', example: 'Customers showed a clear preference for the cheaper trainers.', pedagogicallyUseful: true },
    { form: 'preferable', partOfSpeech: 'adjective', example: 'A morning session is preferable to an evening one for most players.', pedagogicallyUseful: true }
  ])
});

function clone(value) { return JSON.parse(JSON.stringify(value)); }

// A deep copy of the Unit 1 content with authored families attached to the named items' senses.
export function contentWithFamilies(families = FAMILY_FIXTURE_FORMS, { retermTo = {} } = {}) {
  const content = clone(unitContent);
  for (const [vocabularyId, forms] of Object.entries(families)) {
    const item = content.itemsById[vocabularyId] ?? content.items.find(row => row.vocabularyId === vocabularyId);
    if (!item) throw new Error(`Fixture target ${vocabularyId} is not in Unit 1.`);
    if (retermTo[vocabularyId]) item.term = retermTo[vocabularyId];
    item.senses[0].wordFamilyForms = clone(forms);
    const listed = content.items.find(row => row.vocabularyId === vocabularyId);
    if (listed && listed !== item) listed.senses[0].wordFamilyForms = clone(forms);
  }
  return content;
}
export { unitContent };
