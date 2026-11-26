// Run at the R2 baseline revision (or with its curriculum files unchanged).
// Mirrors the staff-preview selection in structure-20261125.js.
// This inventory captures the live inputs, not a pedagogical verdict.
import {readFileSync, writeFileSync} from 'node:fs';
import {structureR1} from '../../src/writing/content/review-structure-r1.js';
import {structureDiscover, structureExplore} from '../../src/writing/content/review-structure-recognition.js';
import {pathways} from '../../src/writing/content/review-pedagogy.js';
import {expressionModels} from '../../src/writing/content/review-expression-v1.js';
import {developmentModels} from '../../src/writing/content/review-development-v1.js';
import {cohesion, cohesionModels} from '../../src/writing/content/review-cohesion.js';
import {editing, editingModels} from '../../src/writing/content/review-editing.js';
import {exam, examModels, examMocks, modelContext} from '../../src/writing/content/review-exam-20261125.js';
import {model} from '../../src/writing/content/review-structure-v1.js';
import {guidedTask} from '../../src/writing/content/review-guided-v1.js';
import {extraReviewModels} from '../../src/writing/content/review-explore-models.js';

const courses = {structure: structureR1, expression: pathways.expression, development: pathways.development, cohesion, editing, exam};
const models = [model, {...guidedTask, title: 'Willow Kitchen'}, ...extraReviewModels];
const editorial = {cohesion: cohesionModels, editing: editingModels, exam: examModels};
const completion = {
  recognition: 'Correct at first check, correct after retry, or supported after two unsuccessful choices.',
  quiz: 'One check per question per run. Advancing through all items completes the run regardless of score.',
  writing: 'Lock a minimum-length draft. Meet the revision minimum and tick all checks. Keeping a draft requires task permission and a reason or a punctuation-only revision.',
  exam: 'A non-empty submission can be outside the target range after confirmation. All review checks and three minimum-length reflections complete self-review.',
};
const findings = JSON.parse(readFileSync(new URL('findings.json', import.meta.url)));
const rows = [];
const modelRegister = Object.fromEntries(models.map(({id, title, prompt, paragraphs, notes, sentenceTips}) =>
  [id, {title, prompt, paragraphs, notes, sentenceTips, exam: modelContext[title]}]));
function add(pathway, stage, activityId, item, details) {
  const questionId = item.id ?? details.questionId;
  const answerIndexes = item.answer === undefined ? null : [item.answer].flat();
  const findingsForRow = [
    ...(findings.items[questionId] ? [findings.items[questionId]] : []),
    ...findings.shared.filter(entry => entry.pathways.includes(pathway) && entry.stages.includes(stage)),
  ];
  const primary = findingsForRow[0];
  rows.push({
    pathway, stage, activityId, questionId, contentVersion: item.version ?? null,
    difficulty: details.difficulty ?? stage,
    intendedLearningObjective: details.objective ?? null,
    currentQuestion: details.question ?? item.question ?? item.prompt,
    currentAnswerChoices: item.options?.map((text, i) => ({id: item.optionIds?.[i] ?? i, text})) ?? null,
    currentCorrectAnswer: answerIndexes?.map(i => item.optionIds?.[i] ?? i) ?? null,
    currentFeedback: item.explanations ?? item.rationale ?? item.principle ?? null,
    source: details.source ?? null,
    modelResponse: item.example ?? null,
    wordGuidance: details.wordGuidance ?? null,
    checklist: details.checklist ?? item.checks ?? null,
    completionRule: details.rule,
    identifiedProblem: primary?.problem ?? null, severity: primary?.severity ?? null,
    proposedCorrection: primary?.correction ?? null, findings: findingsForRow,
    learningObjectiveChanges: primary?.learningObjectiveChanges ?? null,
    scoringContractChanges: primary?.scoringContractChanges ?? null,
    savedProgressAffected: primary?.savedProgressAffected ?? null,
    implementationStatus: 'inventoried', verificationStatus: 'pedagogical review pending',
  });
}
function workshop(pathway, stage, item, examWorkshop = false) {
  add(pathway, stage, item.id, item, {
    source: item.question ? item.prompt : null,
    wordGuidance: examWorkshop ? {target: [120, 160], outsideRange: 'confirm to submit'} : {minimum: item.min, range: item.range},
    checklist: examWorkshop ? exam.passes : item.checks,
    rule: completion[examWorkshop ? 'exam' : 'writing'],
  });
}
for (const [key, course] of Object.entries(courses)) {
  course.discover.forEach((contrast, index) => {
    const item = key === 'structure' ? structureDiscover[index] : contrast;
    add(key, 'Discover', contrast.id ?? item.id ?? key + '-discover-' + (index + 1), item, {
      questionId: key + '-discover-' + (index + 1),
      source: [contrast.before, contrast.after], objective: contrast.principle,
      wordGuidance: key === 'structure' ? null : {minimum: 3},
      rule: key === 'structure' ? completion.recognition : 'Checks for a three-word attempt and reveals the principle. Complete every contrast.',
    });
  });
  const pathwayModels = key === 'expression' ? expressionModels(models) : key === 'development' ? developmentModels(models) : models;
  for (const m of pathwayModels) {
    m.paragraphs.forEach((paragraph, index) => {
      const lens = editorial[key]?.[m.title][index] ?? m.expression?.[index];
      const prompt = key === 'expression'
        ? 'Find “'+lens.phrase+'” in context. Write a replacement phrase. Explain one difference in meaning, how strongly it expresses the opinion, or how formal it sounds.'
        : key === 'development'
          ? 'Find “'+lens.phrase+'” in context. Name an opinion in the paragraph that this detail helps explain, or say what decision it helps readers make.'
          : lens?.prompt;
      const item = key === 'structure' ? structureExplore[m.id][index] : {prompt, rationale: lens.rationale};
      add(key, 'Explore', m.id, item, {
        questionId: m.id + ':paragraph-' + (index + 1), source: {modelId: m.id, paragraph: index + 1},
        wordGuidance: key === 'structure' ? null : {minimum: lens.min ?? 10},
        rule: key === 'structure' ? completion.recognition + ' Finish every paragraph in one model.'
          : 'A minimum-length response reveals feedback. ' + (key === 'exam' ? 'Finish any three paragraphs.' : 'Finish every paragraph in one model.'),
      });
    });
  }
  for (const activity of course.practice) {
    for (const item of activity.items) add(key, activity.level, activity.id, item, {objective: activity.title, rule: completion.quiz});
  }
  for (const item of [course.gold].flat()) workshop(key, 'Gold', item);
  for (const item of course.apply) workshop(key, key === 'exam' ? 'Exam practice' : 'Apply', item, key === 'exam');
  for (const item of [course.analysis].flat()) add(key, 'Master checkpoint', key + '-transfer', item, {rule: completion.quiz});
  if (key === 'exam') {
    for (const item of examMocks) workshop(key, 'Mock examination', item, true);
  } else workshop(key, 'Master writing', course.master);
}
const counts = {};
const keys = new Set();
for (const row of rows) {
  const key = [row.pathway, row.stage, row.activityId, row.questionId].join('/');
  if (keys.has(key) || !row.currentQuestion) throw new Error('Invalid audit identity or missing question: ' + key);
  keys.add(key);
  const stages = counts[row.pathway] ??= {};
  stages[row.stage] = (stages[row.stage] ?? 0) + 1;
}
writeFileSync(new URL('baseline.json', import.meta.url), JSON.stringify({counts, models: modelRegister, rows}) + '\n');
console.log(counts, rows.length);
