async function invokeClassAction(client, body) {
  const { data, error } = await client.functions.invoke('admin-class-action', { body });
  if (error) throw error;
  return data;
}

export async function createClass(client, className) {
  return invokeClassAction(client, { action: 'create_class', className });
}

export async function renameClass(client, classId, className) {
  return invokeClassAction(client, { action: 'rename_class', classId, className:String(className ?? '').trim() });
}

export async function assignTeacherToClass(client, teacherId, classId) {
  return invokeClassAction(client, { action: 'assign_teacher', teacherId, classId });
}

export async function unassignTeacherFromClass(client, teacherId, classId) {
  return invokeClassAction(client, { action: 'unassign_teacher', teacherId, classId });
}

export async function transferStudent(client, studentId, newClassId) {
  return invokeClassAction(client, { action: 'transfer_student', studentId, newClassId });
}

export async function retireClass(client, classId) {
  return invokeClassAction(client, { action: 'retire_class', classId });
}

export function normalizeAdminClasses(classes = [], profiles = [], memberships = [], teacherClasses = []) {
  const profilesById = new Map(profiles.map(profile => [profile.id, profile]));
  const activeMemberships = memberships.filter(item => item.ended_at == null);

  return classes.map(item => ({
    id: item.id,
    className: item.class_name,
    active: item.active !== false,
    students: activeMemberships
      .filter(link => link.class_id === item.id)
      .map(link => profilesById.get(link.student_id))
      .filter(Boolean)
      .map(profile => ({ id: profile.id, displayName: profile.display_name, email: profile.school_email })),
    teachers: teacherClasses
      .filter(link => link.class_id === item.id)
      .map(link => profilesById.get(link.teacher_id))
      .filter(Boolean)
      .map(profile => ({ id: profile.id, displayName: profile.display_name, email: profile.school_email }))
  }));
}

export async function loadAdminClasses(client) {
  const [classesResult, profilesResult, membershipsResult, teacherClassesResult] = await Promise.all([
    client.from('classes').select('id, class_name, active'),
    client.from('profiles').select('id, display_name, school_email, role, active'),
    client.from('student_class_memberships').select('student_id, class_id, ended_at'),
    client.from('teacher_classes').select('teacher_id, class_id')
  ]);
  const error = classesResult.error ?? profilesResult.error ?? membershipsResult.error ?? teacherClassesResult.error;
  if (error) throw error;
  return normalizeAdminClasses(
    classesResult.data ?? [],
    profilesResult.data ?? [],
    membershipsResult.data ?? [],
    teacherClassesResult.data ?? []
  );
}
