async function invokeProvision(client, body) {
  const { data, error } = await client.functions.invoke('admin-provision-user', { body });
  if (error) throw error;
  return data;
}

export async function createStudentAccount(client, input) {
  return invokeProvision(client, {
    action: 'provision',
    role: 'student',
    email: input.email,
    displayName: input.displayName,
    classId: input.classId
  });
}

export async function createTeacherAccount(client, input) {
  return invokeProvision(client, {
    action: 'provision',
    role: 'teacher',
    email: input.email,
    displayName: input.displayName
  });
}

export async function resetAccountPassword(client, userId) {
  return invokeProvision(client, { action: 'reset_password', userId });
}

export async function setAccountActive(client, userId, active) {
  return invokeProvision(client, { action: 'set_active', userId, active });
}

export function normalizeAdminAccounts(profiles = [], memberships = [], classes = [], teacherClasses = []) {
  const classNames = new Map(classes.map(item => [item.id, item.class_name]));
  const activeMembership = new Map(
    memberships.filter(item => item.ended_at == null).map(item => [item.student_id, item.class_id])
  );
  const assignedByTeacher = new Map();
  for (const link of teacherClasses) {
    const list = assignedByTeacher.get(link.teacher_id) ?? [];
    list.push({ id: link.class_id, className: classNames.get(link.class_id) ?? '' });
    assignedByTeacher.set(link.teacher_id, list);
  }

  return profiles
    .filter(profile => profile.role === 'student' || profile.role === 'teacher')
    .map(profile => {
      const classId = activeMembership.get(profile.id) ?? null;
      return {
        id: profile.id,
        displayName: profile.display_name,
        email: profile.school_email,
        role: profile.role,
        active: profile.active !== false,
        currentClassId: classId,
        currentClass: classId ? (classNames.get(classId) ?? '') : '',
        assignedClasses: assignedByTeacher.get(profile.id) ?? []
      };
    });
}

export async function loadAdminAccounts(client) {
  const [profilesResult, membershipsResult, classesResult, teacherClassesResult] = await Promise.all([
    client.from('profiles').select('id, display_name, school_email, role, active'),
    client.from('student_class_memberships').select('student_id, class_id, ended_at'),
    client.from('classes').select('id, class_name, active'),
    client.from('teacher_classes').select('teacher_id, class_id')
  ]);
  const error = profilesResult.error ?? membershipsResult.error ?? classesResult.error ?? teacherClassesResult.error;
  if (error) throw error;
  return normalizeAdminAccounts(
    profilesResult.data ?? [],
    membershipsResult.data ?? [],
    classesResult.data ?? [],
    teacherClassesResult.data ?? []
  );
}
