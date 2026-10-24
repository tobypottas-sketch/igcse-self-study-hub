// Binds the contract's executable specs to production code that does not exist yet. A hook resolves to undefined until the
// named module exports the named function; the matching expected-failure test then flips green automatically.
import fs from 'node:fs';
const root = new URL('../../../', import.meta.url);
export const HOOKS = Object.freeze({
  computePathwaySets:   ['src/vocabulary/pathway-sets.js', 'computePathwaySets'],
  missionOutcome:       ['src/vocabulary/stage-progression.js', 'missionOutcome'],
  applyMissionResult:   ['src/vocabulary/stage-progression.js', 'applyMissionResult'],
  followUpFor:          ['src/vocabulary/stage-progression.js', 'followUpFor'],
  classifyTypedAnswer:  ['supabase/functions/_shared/vocabulary-typed-answer.js', 'classifyTypedAnswer'],
  scoreMultiPart:       ['supabase/functions/_shared/vocabulary-multipart-evidence.js', 'scoreMultiPart'],
  confidenceFrom:       ['supabase/functions/_shared/vocabulary-confidence.js', 'confidenceFrom'],
  assessQuestionQuality:['src/vocabulary/question-quality-gate.js', 'assessQuestionQuality'],
  questionFingerprint:  ['src/vocabulary/question-fingerprint.js', 'questionFingerprint']
});
export async function hook(name) {
  const [path, exportName] = HOOKS[name];
  const url = new URL(path, root);
  if (!fs.existsSync(url)) return undefined;
  try { return (await import(url.href))[exportName]; } catch { return undefined; }
}
export function hookLocation(name) { return HOOKS[name].join('#'); }
