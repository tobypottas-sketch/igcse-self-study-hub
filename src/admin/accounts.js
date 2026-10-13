async function invokeProvision(client, body) {
  const { data, error } = await client.functions.invoke('admin-provision-user', { body });
  if (error) throw error;
  return data;
}

export async function createStudentAccount(client, input) {
  return invokeProvision(client, { role: 'student', ...input });
}

export async function createTeacherAccount(client, input) {
  return invokeProvision(client, { role: 'teacher', ...input });
}
