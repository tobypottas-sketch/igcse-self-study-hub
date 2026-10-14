import fs from 'node:fs';
const file='src/tracking/listening-wrapper.js';
let source=fs.readFileSync(file,'utf8');
source=source
  .replace("  safeWrapAfter(win, 'setMode', () => resetExamTracking());","  safeWrapAfter(win, 'setMode', (_args, result) => { if (result !== false) resetExamTracking(); });")
  .replace("  safeWrapAfter(win, 'resetAllAnswers', () => resetExamTracking());","  safeWrapAfter(win, 'resetAllAnswers', (_args, result) => { if (result !== false) resetExamTracking(); });");
fs.writeFileSync(file,source);
