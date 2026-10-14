export async function loadApps(client) {
  const { data, error } = await client
    .from('apps')
    .select('app_key, display_name, launch_url, enabled')
    .order('display_name');
  if (error) throw new Error('Unable to load study apps.');
  return data ?? [];
}

async function callActivityRpc(client, name, args, errorMessage, emptyValue) {
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error(errorMessage);
  return data ?? emptyValue;
}

export function loadActivityClasses(client) {
  return callActivityRpc(client, 'teacher_activity_classes', undefined, 'Unable to load activity classes.', []);
}

export function loadClassActivity(client, classId, since) {
  return callActivityRpc(client, 'teacher_activity_overview', { p_class_id: classId, p_since: since ?? null }, 'Unable to load class activity.', []);
}

export function loadStudentActivitySummary(client, studentId, since) {
  return callActivityRpc(client, 'teacher_activity_student_summary', { p_student_id: studentId, p_since: since ?? null }, 'Unable to load student activity.', null);
}

export function loadStudentRecentActivity(client, studentId, since, limit = 40) {
  return callActivityRpc(client, 'teacher_activity_student_recent', { p_student_id: studentId, p_since: since ?? null, p_limit: limit }, 'Unable to load recent activity.', []);
}
