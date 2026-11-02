// eh-summary data loader: reads the minimum rows the summary needs and shapes them for the H3 handler. The Supabase client is
// injected (index.ts passes a service-role client), so the queries are testable. Never logs; errors carry no row contents.
//
// loadSummaryData({ ids, since }) -> { profiles, members, occurrences, byStudent }
//   profiles     [{ id, role, active }] for the requested ids that exist (nothing else about a profile is selected)
//   members      vocabulary_set_members rows of the units the active students have Set rows in
//   occurrences  live and active vocabulary_unit_occurrences rows of those units, using the exported LIVE_OCCURRENCE_FILTER
//   byStudent    { [lower-case student uuid]: { setRows, unitChecks, merits, events? } } for ACTIVE STUDENT profiles only
// `events` are flattened to exactly { event_type, occurred_at, pathway_id }. With no `since` the events are not loaded at all (unknown),
// so the summary reports no 8-week engagement counts; with `since` the caller owns covering the full 56-day window.
import { LIVE_OCCURRENCE_FILTER } from './pathway-state.js';

export const PAGE_SIZE = 1000;                                  // the API returns at most this many rows per request
export const MAX_PAGES = 200;
const VOCABULARY_APP_KEY = 'vocabulary_paraphrase';
const PATHWAY_RESULT_EVENT = 'exercise_result';

// Reads every page of a query. `build()` returns a fresh query each call; the query must carry a stable order.
async function readAll(build, { pageSize, maxPages }) {
  const rows = [];
  for (let page = 0; page < maxPages; page += 1) {
    const { data, error } = await build().range(page * pageSize, (page + 1) * pageSize - 1);
    if (error || !Array.isArray(data)) throw new Error('query failed');
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
  throw new Error('query returned too many rows');
}

function withoutOwner(row, ownerKey) {
  const { [ownerKey]: owner, ...rest } = row;
  return { owner: typeof owner === 'string' ? owner.toLowerCase() : null, rest };
}

export function createSummaryLoader(client, { pageSize = PAGE_SIZE, maxPages = MAX_PAGES } = {}) {
  const read = build => readAll(build, { pageSize, maxPages });

  return async function loadSummaryData({ ids, since } = {}) {
    const requested = Array.isArray(ids) ? ids : [];
    const profiles = (await read(() => client.from('profiles').select('id, role, active').in('id', requested).order('id')))
      .map(row => ({ id: String(row.id).toLowerCase(), role: row.role, active: row.active }));
    const activeIds = profiles.filter(p => p.role === 'student' && p.active === true).map(p => p.id);
    if (!activeIds.length) return { profiles, members: [], occurrences: [], byStudent: {} };

    const byStudent = Object.fromEntries(activeIds.map(id => [id, { setRows: [], unitChecks: [], merits: [], ...(since ? { events: [] } : {}) }]));
    const put = (rows, ownerKey, field, shape = row => row) => {
      for (const row of rows) {
        const { owner, rest } = withoutOwner(row, ownerKey);
        if (owner && byStudent[owner]) byStudent[owner][field].push(shape(rest));
      }
    };

    put(await read(() => client.from('vocabulary_pathway_sets')
      .select('student_id, unit_number, pathway_id, set_number, stage, phase, status, updated_at')
      .in('student_id', activeIds).order('student_id').order('unit_number').order('pathway_id').order('set_number')), 'student_id', 'setRows');
    put(await read(() => client.from('vocabulary_unit_check_attempts')
      .select('student_id, unit_number, attempt_number, score, max_score, completed_at')
      .in('student_id', activeIds).order('student_id').order('unit_number').order('attempt_number')), 'student_id', 'unitChecks');
    put(await read(() => client.from('vocabulary_merit_awards')
      .select('student_id, awarded_at')
      .in('student_id', activeIds).order('student_id').order('merit_number')), 'student_id', 'merits');

    if (since) {
      const events = await read(() => client.from('activity_events')
        .select('id, user_id, event_type, occurred_at, pathway_id:metadata->>pathway_id')
        .eq('app_key', VOCABULARY_APP_KEY).eq('event_type', PATHWAY_RESULT_EVENT)
        .not('metadata->>pathway_id', 'is', null)
        .in('user_id', activeIds).gte('occurred_at', `${since}T00:00:00+08:00`)
        .order('occurred_at').order('id'));
      put(events, 'user_id', 'events', row => ({ event_type: row.event_type, occurred_at: row.occurred_at, pathway_id: typeof row.pathway_id === 'string' ? row.pathway_id : null }));
    }

    const units = [...new Set(Object.values(byStudent).flatMap(s => s.setRows.map(r => r.unit_number)).filter(Number.isInteger))].sort((a, b) => a - b);
    if (!units.length) return { profiles, members: [], occurrences: [], byStudent };

    const members = await read(() => client.from('vocabulary_set_members')
      .select('unit_number, pathway_id, set_number, position, occurrence_id')
      .in('unit_number', units).order('unit_number').order('pathway_id').order('set_number').order('position'));
    const occurrences = await read(() => client.from('vocabulary_unit_occurrences')
      .select('occurrence_id, unit_number, position_in_unit, status, active')
      .eq('status', LIVE_OCCURRENCE_FILTER.status).eq('active', LIVE_OCCURRENCE_FILTER.active)
      .in('unit_number', units).order('occurrence_id'));
    return { profiles, members, occurrences, byStudent };
  };
}
