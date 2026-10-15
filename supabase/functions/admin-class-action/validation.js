const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const requireUuid = (value, label) => {
  const v = String(value ?? '');
  if (!UUID_RE.test(v)) throw new Error(`${label} must be a valid UUID.`);
  return v;
};

export function validateClassAction(value) {
  const action = value?.action;
  if (action === 'create_class') {
    const className = String(value?.className ?? '').trim();
    if (!className || className.length > 120) throw new Error('Class name is required.');
    return { action, className };
  }
  if (action === 'assign_teacher' || action === 'unassign_teacher') {
    return { action, teacherId: requireUuid(value?.teacherId, 'Teacher ID'), classId: requireUuid(value?.classId, 'Class ID') };
  }
  if (action === 'transfer_student') {
    return { action, studentId: requireUuid(value?.studentId, 'Student ID'), newClassId: requireUuid(value?.newClassId, 'Class ID') };
  }
  if (action === 'retire_class') {
    return { action, classId: requireUuid(value?.classId, 'Class ID') };
  }
  throw new Error('Unsupported class action.');
}
