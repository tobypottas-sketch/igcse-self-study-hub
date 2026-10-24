const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HASH_RE = /^[0-9a-f]{64}$/i;
const MODES = new Set(['practice', 'exam']);

export function validateTaskId(value) {
  const id = String(value ?? '');
  if (!UUID_RE.test(id)) throw new Error('Task ID must be a valid UUID.');
  return id;
}

export function validateSettingsHash(value) {
  const hash = String(value ?? '').toLowerCase();
  if (!HASH_RE.test(hash)) throw new Error('Controlled task fingerprint is invalid.');
  return hash;
}

export function validateCreateTask(value) {
  const studyMode = MODES.has(value?.studyMode) ? value.studyMode : 'exam';
  return { action: 'create', studyMode, settingsHash: validateSettingsHash(value?.settingsHash) };
}

export function validateTaskAction(value) {
  if (value?.action === 'create') return validateCreateTask(value);
  if (value?.action === 'fetch') return { action: 'fetch', taskId: validateTaskId(value?.taskId) };
  throw new Error('Unsupported Essay task action.');
}
