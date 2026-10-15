const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requireUuid(value, label) {
  const text = String(value ?? '');
  if (!UUID_RE.test(text)) throw new Error(`A valid ${label} is required.`);
  return text;
}

export function validateProvisionInput(value) {
  const role = value?.role;
  if (role !== 'student' && role !== 'teacher') throw new Error('Role must be student or teacher.');

  const email = String(value?.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid email address is required.');

  const displayName = String(value?.displayName ?? '').trim();
  if (!displayName || displayName.length > 120) throw new Error('Display name is required.');

  let classId = value?.classId ?? null;
  if (role === 'student') {
    classId = requireUuid(classId, 'class ID for student accounts');
  } else {
    classId = null;
  }

  return { role, email, displayName, classId };
}

export function validateAdminProvisionRequest(value) {
  const action = value?.action ?? 'provision';

  if (action === 'provision') {
    return { action, ...validateProvisionInput(value) };
  }

  if (action === 'reset_password') {
    return { action, userId: requireUuid(value?.userId, 'user ID') };
  }

  if (action === 'set_active') {
    const userId = requireUuid(value?.userId, 'user ID');
    if (typeof value?.active !== 'boolean') throw new Error('Active state must be a boolean.');
    return { action, userId, active: value.active };
  }

  throw new Error('Unsupported admin account action.');
}
