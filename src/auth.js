export async function signIn(client, email, password) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Incorrect email or password.');
  return data;
}

export async function getCurrentProfile(client) {
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData?.user) throw new Error('You are not signed in.');

  const { data, error } = await client
    .from('profiles')
    .select('id, role, display_name, school_email, active, must_change_password')
    .eq('id', userData.user.id)
    .single();

  if (error || !data || data.active !== true) {
    throw new Error('This account is not authorised for the Self-Study Hub.');
  }
  return data;
}

export async function changePassword(client, newPassword) {
  const { error: passwordError } = await client.auth.updateUser({ password: newPassword });
  if (passwordError) throw passwordError;

  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData?.user) throw new Error('Password changed, but the account could not be refreshed. Please sign in again.');

  const { error: profileError } = await client
    .from('profiles')
    .update({ must_change_password: false })
    .eq('id', userData.user.id);
  if (profileError) throw new Error('Password changed, but setup is not complete. Please sign in again.');
}
