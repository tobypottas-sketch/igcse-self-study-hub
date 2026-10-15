import fs from 'node:fs';

function replaceExact(path, before, after) {
  let text = fs.readFileSync(path, 'utf8');
  if (text.includes(after)) return;
  if (!text.includes(before)) throw new Error(`Expected block not found in ${path}`);
  text = text.replace(before, after);
  fs.writeFileSync(path, text);
}

replaceExact(
  'src/tracking/listening-wrapper.js',
`export function createOncePerKeyGate() {
  const seen = new Set();
  return key => {
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };
}`,
`export function createOncePerKeyGate() {
  const seen = new Set();
  const gate = key => {
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  };
  gate.clearPrefix = prefix => {
    for (const key of [...seen]) {
      if (String(key).startsWith(prefix)) seen.delete(key);
    }
  };
  return gate;
}`
);

replaceExact(
  'src/tracking/listening-wrapper.js',
`function resetExamTracking() {
  attempts.clear();
  examAnswered.clear();
  reconciledQuestions.clear();
}`,
`function resetExamTracking() {
  attempts.clear();
  examAnswered.clear();
  reconciledQuestions.clear();
  sectionGate.clearPrefix('section:exam:');
}`
);

replaceExact(
  'src/tracking/essay-writing-wrapper.js',
`    if (!stage || activeTab !== stage || visitedStages.has(stage)) return;
    visitedStages.add(stage);`,
`    const visitKey = \`\${currentEssayMode(win)}:\${stage}\`;
    if (!stage || activeTab !== stage || visitedStages.has(visitKey)) return;
    visitedStages.add(visitKey);`
);
