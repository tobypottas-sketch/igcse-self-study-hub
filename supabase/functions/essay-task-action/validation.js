const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ARG_TYPES = new Set(['either', 'balanced', 'one-sided']);
const MODES = new Set(['practice', 'exam']);

function cleanString(value, maxLength, fallback = '') {
  const text = String(value ?? fallback).trim();
  return text.slice(0, maxLength);
}

function cleanInteger(value, min, max, fallback) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) throw new Error('Invalid word target.');
  return parsed;
}

export function validateTaskId(value) {
  const id = String(value ?? '');
  if (!UUID_RE.test(id)) throw new Error('Task ID must be a valid UUID.');
  return id;
}

export function normalizeTaskSettings(value) {
  const source = value && typeof value === 'object' ? value : {};
  const essayQuestion = cleanString(source.essayQuestion, 2000);
  if (!essayQuestion) throw new Error('Essay question is required.');
  const wordMin = cleanInteger(source.wordMin, 50, 1000, 120);
  const wordMax = cleanInteger(source.wordMax, 50, 1000, 160);
  if (wordMax < wordMin) throw new Error('Maximum word target must be at least the minimum.');
  const argType = ARG_TYPES.has(source.argType) ? source.argType : 'either';

  return {
    essayQuestion,
    audience: cleanString(source.audience, 200, 'teacher'),
    wordMin,
    wordMax,
    argType,
    promptIdeas: cleanString(source.promptIdeas, 5000),
    showScaffolds: source.showScaffolds === true,
    showLabels: source.showLabels === true,
    successCriteria: cleanString(source.successCriteria, 5000),
    opinionPhrases: cleanString(source.opinionPhrases, 5000),
    linkingPhrases: cleanString(source.linkingPhrases, 5000)
  };
}

export function validateCreateTask(value) {
  const studyMode = MODES.has(value?.studyMode) ? value.studyMode : 'exam';
  return { action: 'create', studyMode, settings: normalizeTaskSettings(value?.settings) };
}

export function validateTaskAction(value) {
  if (value?.action === 'create') return validateCreateTask(value);
  if (value?.action === 'fetch') return { action: 'fetch', taskId: validateTaskId(value?.taskId) };
  throw new Error('Unsupported Essay task action.');
}
