import { getSupabaseClient } from '../supabase.js';
import { countMasteredPathways, meritProgress } from './merits.js';

let copyPromise = null;

async function loadCopy() {
  if (copyPromise) return copyPromise;
  copyPromise = (async () => {
    const client = await getSupabaseClient();
    const { data:userData, error:userError } = await client.auth.getUser();
    if (userError || !userData?.user?.id) return null;
    const userId = userData.user.id;
    const { data:profile, error:profileError } = await client.from('profiles').select('role').eq('id',userId).single();
    if (profileError || profile?.role !== 'student') return null;

    const thresholdResult = await client.rpc('current_merit_pathways_required');
    if (thresholdResult.error) return null;

    const [occurrenceResult, unitResult, globalResult, awardsResult] = await Promise.all([
      client.from('vocabulary_unit_occurrences').select('occurrence_id,vocabulary_id,unit_number').eq('status','live').eq('active',true),
      client.from('vocabulary_unit_mastery').select('occurrence_id,contextual_evidence'),
      client.from('vocabulary_global_mastery').select('vocabulary_id,strand_evidence'),
      client.from('vocabulary_merit_awards').select('merit_number')
    ]);
    if (occurrenceResult.error || unitResult.error || globalResult.error) return null;

    const occurrences = (occurrenceResult.data ?? []).map(row => ({
      occurrenceId:row.occurrence_id,
      vocabularyId:row.vocabulary_id,
      unitNumber:Number(row.unit_number)
    }));
    const unitMastery = Object.fromEntries((unitResult.data ?? []).map(row => [row.occurrence_id, {
      occurrenceId:row.occurrence_id,
      contextualEvidence:row.contextual_evidence ?? {}
    }]));
    const globalMastery = Object.fromEntries((globalResult.data ?? []).map(row => [row.vocabulary_id, {
      vocabularyId:row.vocabulary_id,
      strandEvidence:row.strand_evidence ?? {}
    }]));
    const completed = countMasteredPathways({ occurrences, unitMastery, globalMastery });
    const highestAwarded = Math.max(0, ...(awardsResult.data ?? []).map(row => Number(row.merit_number) || 0));
    return meritProgress(completed, thresholdResult.data, highestAwarded).copy;
  })().catch(error => {
    console.error('Unable to load student merit progress', error);
    return null;
  });
  return copyPromise;
}

async function refresh() {
  const nodes = [...document.querySelectorAll('[data-merit-progress]')];
  if (!nodes.length) return;
  const copy = await loadCopy();
  if (!copy) return;
  for (const node of nodes) node.textContent = copy;
}

const observer = new MutationObserver(() => { void refresh(); });
observer.observe(document.documentElement, { childList:true, subtree:true });
void refresh();
