import { normalizeAdminAccounts } from './accounts.js';
import { normalizeAdminClasses } from './classes.js';

export async function loadAdminData(client) {
  const [profilesResult, membershipsResult, classesResult, teacherClassesResult] = await Promise.all([
    client.from('profiles').select('id, display_name, school_email, role, active'),
    client.from('student_class_memberships').select('student_id, class_id, ended_at'),
    client.from('classes').select('id, class_name, active'),
    client.from('teacher_classes').select('teacher_id, class_id')
  ]);
  const error = profilesResult.error ?? membershipsResult.error ?? classesResult.error ?? teacherClassesResult.error;
  if (error) throw error;

  const profiles = profilesResult.data ?? [];
  const memberships = membershipsResult.data ?? [];
  const classesRaw = classesResult.data ?? [];
  const teacherClasses = teacherClassesResult.data ?? [];

  return {
    accounts: normalizeAdminAccounts(profiles, memberships, classesRaw, teacherClasses),
    teachingAdmins: profiles
      .filter(profile => profile.active === true && profile.role === 'admin')
      .map(profile => ({ id:profile.id, displayName:profile.display_name, email:profile.school_email, role:profile.role, active:true })),
    classes: normalizeAdminClasses(classesRaw, profiles, memberships, teacherClasses)
  };
}
