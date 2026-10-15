const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function requireUuid(value, label) {
  const text = String(value ?? '');
  if (!UUID_RE.test(text)) throw new Error(`A valid ${label} is required.`);
  return text;
}

function validateIdentity(value) {
  const email = String(value?.email ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw new Error('A valid email address is required.');
  const displayName = String(value?.displayName ?? '').trim();
  if (!displayName || displayName.length > 120) throw new Error('Display name is required.');
  return { email, displayName };
}

export function validateProvisionInput(value) {
  const role = value?.role;
  if (role !== 'student' && role !== 'teacher') throw new Error('Role must be student or teacher.');
  const { email, displayName } = validateIdentity(value);
  let classId = value?.classId ?? null;
  if (role === 'student') classId = requireUuid(classId, 'class ID for student accounts');
  else classId = null;
  return { role, email, displayName, classId };
}

export function validateAdminProvisionRequest(value) {
  const action = value?.action ?? 'provision';
  if (action === 'provision') return { action, ...validateProvisionInput(value) };
  if (action === 'reset_password') return { action, userId: requireUuid(value?.userId, 'user ID') };
  if (action === 'set_active') {
    const userId = requireUuid(value?.userId, 'user ID');
    if (typeof value?.active !== 'boolean') throw new Error('Active state must be a boolean.');
    return { action, userId, active:value.active };
  }
  if (action === 'bulk_provision_students') {
    const classId = requireUuid(value?.classId, 'class ID');
    if (!Array.isArray(value?.rows) || value.rows.length < 1) throw new Error('At least one student row is required.');
    if (value.rows.length > 100) throw new Error('Bulk provisioning is limited to 100 rows per batch.');
    const rows = value.rows.map(row => validateIdentity(row));
    return { action, classId, rows };
  }
  throw new Error('Unsupported admin account action.');
}
