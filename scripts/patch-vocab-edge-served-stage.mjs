import fs from 'node:fs';

const edgePath = 'supabase/functions/vocabulary-attempt-action/index.ts';
let source = fs.readFileSync(edgePath,'utf8');
const before = "stageId:input.pathwayStage,\n            correct:marked.correct,";
const after = "stageId:input.pathwayStage,\n            servedStageId:input.servedPathwayStage,\n            correct:marked.correct,";
if (!source.includes(before)) throw new Error('Expected Edge pathway attempt block not found.');
source = source.replace(before,after);
fs.writeFileSync(edgePath,source);

fs.rmSync('scripts/patch-vocab-edge-served-stage.mjs');
fs.rmSync('.github/workflows/patch-vocab-edge-served-stage.yml');
