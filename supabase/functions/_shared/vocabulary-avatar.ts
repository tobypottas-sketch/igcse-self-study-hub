import type {SupabaseClient} from 'npm:@supabase/supabase-js@2.117.3';

// Call only with student IDs already authorised by the leaderboard or battle.
export async function equippedAvatars(db: SupabaseClient, eligibleIds: string[]) {
  const avatars = new Map<string, string>();
  for (let start = 0; start < eligibleIds.length; start += 100) {
    const {data, error} = await db.from('vocabulary_reward_owned')
      .select('student_id,reward_id,vocabulary_reward_catalog!inner(enabled)')
      .in('student_id', eligibleIds.slice(start, start + 100))
      .eq('category', 'avatars').eq('equipped', true)
      .eq('vocabulary_reward_catalog.enabled', true);
    if (error) continue;
    for (const row of data ?? []) avatars.set(row.student_id, row.reward_id);
  }
  return avatars;
}
