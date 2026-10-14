import fs from 'node:fs';

function patch(path, fn){ const src=fs.readFileSync(path,'utf8'); const out=fn(src); if(out!==src) fs.writeFileSync(path,out); }

patch('src/tracking/paraphrasing-wrapper.js', s => s
  .replace("    const parsed = parseExercise3Feedback(feedback);\n    const record = latestRecord(win, 'ex3');\n    if (!parsed) return;", "    const parsed = parseExercise3Feedback(feedback);\n    if (!parsed) return;")
  .replace("    const parsed = parseExercise4Feedback(feedback);\n    const record = latestRecord(win, 'ex4');\n    if (!parsed) return;", "    const parsed = parseExercise4Feedback(feedback);\n    if (!parsed) return;"));

patch('src/tracking/essay-writing-wrapper.js', s => s
  .replace("      activeTab: win.document.querySelector('.tab-btn.active')?.dataset?.tab || '',\n      saveDraftName: win.document.getElementById('saveDraftName')?.value?.trim() || '',\n      studyMode:", "      activeTab: win.document.querySelector('.tab-btn.active')?.dataset?.tab || '',\n      studyMode:")
  .replace('      after(args, context);', '      after(args, context, result);')
  .replace("  wrapAfter(win, 'saveDraft', (_args, context) => {\n    if (context.studyMode === 'exam' || !context.saveDraftName) return;", "  wrapAfter(win, 'saveDraft', (_args, context, saveResult) => {\n    if (context.studyMode === 'exam' || saveResult !== true) return;"));
