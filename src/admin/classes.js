async function invokeClassAction(client, body) {
  const { data, error } = await client.functions.invoke('admin-class-action', { body });
  if (error) throw error;
  return data;
}

export async function createClass(client, className) {
  return invokeClassAction(client, { action: 'create_class', className });
}

export async function assignTeacherToClass(client, teacherId, classId) {
  return invokeClassAction(client, { action: 'assign_teacher', teacherId, classId });
}

export async function transferStudent(client, studentId, newClassId) {
  return invokeClassAction(client, { action: 'transfer_student', studentId, newClassId });
}
