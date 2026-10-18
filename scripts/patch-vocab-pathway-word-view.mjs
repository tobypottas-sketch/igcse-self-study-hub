import fs from 'node:fs';

function replaceOnce(path, before, after) {
  const source = fs.readFileSync(path,'utf8');
  if (!source.includes(before)) throw new Error(`Expected patch target not found in ${path}`);
  const next = source.replace(before,after);
  if (next === source) throw new Error(`Patch made no change in ${path}`);
  fs.writeFileSync(path,next);
}

replaceOnce(
  'src/vocabulary/app.js',
  "import { buildUnitPathwayStates } from './pathway-view-model.js';",
  "import { buildUnitPathwayStates, buildWordPathwayStates } from './pathway-view-model.js';"
);
replaceOnce(
  'src/vocabulary/app.js',
  "return { term:target?.term ?? occ.vocabularyId, status:global.status ?? 'new', learningStage:deriveLearningStage(global), mastery:global, strands:{ meaning:strandLabel(global.strandEvidence?.meaning, global.status), recognition:strandLabel(global.strandEvidence?.recognition, global.status), context:strandLabel(global.strandEvidence?.context, global.status), paraphrasing:strandLabel(global.strandEvidence?.paraphrasing, global.status), production:strandLabel(global.strandEvidence?.production, global.status) } };",
  "return { term:target?.term ?? occ.vocabularyId, status:global.status ?? 'new', learningStage:deriveLearningStage(global), mastery:global, pathways:buildWordPathwayStates({ occurrence:occ, unitMastery:state.unitMastery, globalMastery:state.globalMastery }), strands:{ meaning:strandLabel(global.strandEvidence?.meaning, global.status), recognition:strandLabel(global.strandEvidence?.recognition, global.status), context:strandLabel(global.strandEvidence?.context, global.status), paraphrasing:strandLabel(global.strandEvidence?.paraphrasing, global.status), production:strandLabel(global.strandEvidence?.production, global.status) } };"
);

const viewsPath = 'src/vocabulary/views.js';
const views = fs.readFileSync(viewsPath,'utf8');
const start = views.indexOf('export function renderVocabularyWords(');
const end = views.indexOf('\n\nfunction supportMessage(', start);
if (start < 0 || end < 0) throw new Error('renderVocabularyWords block not found');
const replacement = `export function renderVocabularyWords(root, { unitNumber, unitTitle, words = [] } = {}) {
  const rows = words.map(word => {
    const strands = Object.entries(word.strands ?? {}).map(([strand,value]) => \`<span class="vocab-word-strand"><small>\${escapeHtml(titleCase(strand))}</small><strong>\${escapeHtml(value)}</strong></span>\`).join('');
    const stage = word.learningStage ?? deriveLearningStage(word.mastery ?? { status:word.status ?? 'new' });
    const pathways = VOCABULARY_PATHWAYS.map(pathway => {
      const state = word.pathways?.[pathway.id] ?? { currentStage:'recognise', needsPractice:false, mastered:false };
      const stageLabel = PATHWAY_STAGES.find(item => item.id === state.currentStage)?.label ?? 'Recognise';
      const visibleStage = state.mastered === true ? 'Mastery' : stageLabel;
      const support = state.needsPractice === true ? '<em>Needs practice</em>' : '';
      return \`<span class="vocab-word-pathway" data-word-pathway="\${escapeHtml(pathway.id)}" data-stage="\${escapeHtml(state.currentStage ?? 'recognise')}"><small>\${escapeHtml(pathway.label)}</small><strong>\${escapeHtml(visibleStage)}</strong>\${support}</span>\`;
    }).join('');
    return \`<article class="vocab-word-row"><div class="vocab-word-row__head"><div><strong>\${escapeHtml(word.term)}</strong><span class="vocab-state-pill" data-state="\${escapeHtml(stage)}">\${escapeHtml(learningStageLabel(stage))}</span></div></div><div class="vocab-word-pathways" aria-label="\${escapeHtml(word.term)} pathway progress">\${pathways}</div><details class="vocab-word-evidence"><summary>Overall evidence detail</summary><div class="vocab-word-strands">\${strands}</div></details></article>\`;
  }).join('') || '<p class="vocab-empty">No live words are available in this unit yet.</p>';
  root.innerHTML = \`<main class="vocab-shell"><header class="vocab-topbar"><button class="vocab-back" data-action="back-unit">← Unit \${escapeHtml(unitNumber)}</button><span>Vocabulary detail</span></header><section class="vocab-unit-hero"><p class="vocab-kicker">Unit \${escapeHtml(unitNumber)}</p><h1>All 50 words</h1><p>\${escapeHtml(unitTitle)}</p><p class="vocab-detail-note">Each word progresses independently through six pathways: Recognise → Match → Apply → Recall → Mastery.</p></section><section class="vocab-word-list">\${rows}</section></main>\`;
}`;
fs.writeFileSync(viewsPath,views.slice(0,start)+replacement+views.slice(end));

fs.rmSync('scripts/patch-vocab-pathway-word-view.mjs');
fs.rmSync('.github/workflows/pathway-word-view-patch.yml');
