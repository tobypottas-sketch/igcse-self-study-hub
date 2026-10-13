const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateProvisionInput(value) {
  const role = value?.role;
  if (role !== 'student' && role !== 'teacher') throw new Error('Role must be student or teacher.');

  const email = String(value?.email ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid email address is required.');

  const displayName = String(value?.displayName ?? '').trim();
  if (!displayName || displayName.length > 120) throw new Error('Display name is required.');

  const temporaryPassword = String(value?.temporaryPassword ?? '');
  if (temporaryPassword.length < 10) throw new Error('Temporary password must be at least 10 characters.');

  let classId = value?.classId ?? null;
  if (role === 'student') {
    if (!UUID_RE.test(String(classId ?? ''))) throw new Error('A valid class ID is required for student accounts.');
    classId = String(classId);
  } else {
    classId = null;
  }

  return { role, email, displayName, temporaryPassword, classId };
}
