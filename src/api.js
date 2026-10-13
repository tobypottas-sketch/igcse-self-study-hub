export async function loadApps(client) {
  const { data, error } = await client
    .from('apps')
    .select('app_key, display_name, launch_url, enabled')
    .order('display_name');
  if (error) throw new Error('Unable to load study apps.');
  return data ?? [];
}
