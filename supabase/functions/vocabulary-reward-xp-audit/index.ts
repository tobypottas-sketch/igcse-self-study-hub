// Read-only, authenticated XP parity audit for the Rewards Shop rollout.
// This function reads the same authoritative mission/mastery rows used by the
// Vocabulary Builder and calls its existing XP engine. It NEVER credits wallets,
// performs redemption, or trusts XP totals supplied by the caller.
// Deploy only after the new function passes integration tests.
import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { computeXp, progressSnapshot } from '../../../src/vocabulary/engagement-model.js';
import { buildUnitPathwayStates } from '../../../src/vocabulary/pathway-view-model.js';
import { clearPathwayCoverage, registerPathwayCoverage } from '../../../src/vocabulary/pathway-coverage-store.js';
import { coverageFromServerSetMembers } from '../_shared/vocabulary-pathway-sets.js';
import { fetchAllRows } from '../../../src/vocabulary/teacher-paging.js';

const CORS = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS'
};
const response = (body: unknown, status = 200) =>
  Response.json(body, {status, headers:{...CORS, 'Cache-Control':'no-store'}});
// These functions are authored as plain JS. Deno otherwise infers default [] as
// never[] and default null as the only accepted snapshot type; the runtime
// contract is broader, and the same canonical implementation is still called.
const calculateProgress = progressSnapshot as unknown as (args:{
  occurrences:any[];unitMastery:Record<string,unknown>;globalMastery:Record<string,unknown>
})=>any;
const calculateXp = computeXp as unknown as (args:{missions:any[];snapshot:unknown;timeZone?:string})=>any;
const calculatePathwayStates = buildUnitPathwayStates as unknown as (args:{
  occurrences:any[];unitMastery:Record<string,unknown>;globalMastery:Record<string,unknown>;
  coverageByPathway:Record<string,unknown>
})=>Record<string,{mastered?:boolean}>;

const indexBy = (rows: any[], field: string) =>
  Object.fromEntries(rows.map(row => [String(row[field]), row]));

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, {status:204, headers:CORS});
  if (request.method !== 'POST') return response({ok:false,error:'Method not allowed'},405);
  try {
    const token = request.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return response({ok:false,error:'Sign in required'},401);
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_ANON_KEY');
    if (!url || !key) throw new Error('Supabase environment unavailable');
    const client = createClient(url,key,{
      global:{headers:{Authorization:`Bearer ${token}`}},
      auth:{persistSession:false,autoRefreshToken:false}
    });
    const {data:userData,error:userError} = await client.auth.getUser(token);
    if (userError || !userData?.user?.id) return response({ok:false,error:'Invalid session'},401);
    const studentId = userData.user.id;
    // Timezone is presentation input for a READ-ONLY comparison, never a credit
    // instruction. Reject invalid zone names rather than silently defaulting.
    const body=await request.json().catch(()=>({}));
    const clientZone=typeof body?.timeZone==='string' && body.timeZone.length<=64 ? body.timeZone : null;
    if(clientZone) {
      try { new Intl.DateTimeFormat('en-US',{timeZone:clientZone}); }
      catch { return response({ok:false,error:'Invalid timezone'},400); }
    }

    const {data:profile,error:profileError} = await client.from('profiles')
      .select('role,active').eq('id',studentId).single();
    if (profileError || profile?.role !== 'student' || profile?.active !== true)
      return response({ok:false,error:'Student account required'},403);

    // Request exactly the same owned rows used by the existing client model.
    // Every query is filtered by authenticated RLS and paginated with a count
    // check: no XP can be silently undercounted by the 1000-row API limit.
    const [occurrences, globalRows, unitRows, missions, membership] = await Promise.all([
      fetchAllRows(() => client.from('vocabulary_unit_occurrences')
        .select('occurrence_id,vocabulary_id,unit_number,unit_title,set_number,position_in_unit,sense_id,status',{count:'exact'})
        .eq('status','live').eq('active',true).order('unit_number').order('position_in_unit').order('occurrence_id'),{label:'live vocabulary occurrences'}),
      fetchAllRows(() => client.from('vocabulary_global_mastery')
        .select('vocabulary_id,status,review_due_at,recent_error_pattern,strand_evidence',{count:'exact'})
        .eq('student_id',studentId).order('vocabulary_id'),{label:'global mastery'}),
      fetchAllRows(() => client.from('vocabulary_unit_mastery')
        .select('occurrence_id,status,recent_error_pattern,contextual_evidence',{count:'exact'})
        .eq('student_id',studentId).order('occurrence_id'),{label:'unit mastery'}),
      fetchAllRows(() => client.from('vocabulary_missions')
        .select('mission_id,unit_number,mission_kind,pathway_id,pathway_stage,practice_family,mission_size,score,stars,best_streak,completed_at',{count:'exact'})
        .eq('student_id',studentId).order('completed_at').order('mission_id'),{label:'missions'}),
      fetchAllRows(() => client.from('vocabulary_set_members')
        .select('unit_number,pathway_id,set_number,position,occurrence_id',{count:'exact'})
        .order('unit_number').order('pathway_id').order('set_number').order('position'),{label:'pathway memberships'})
    ]);

    // Supabase Edge isolates are reused: clear module-level registered coverage
    // on every invocation so one student's audit cannot see another request's
    // cached unit coverage. Coverage is public curriculum data, not student data.
    clearPathwayCoverage();
    const byUnit = new Map<number,any[]>();
    for (const occurrence of occurrences) {
      const unit = Number(occurrence.unit_number);
      if (!byUnit.has(unit)) byUnit.set(unit,[]);
      byUnit.get(unit)!.push(occurrence);
    }
    const unitMastery=indexBy(unitRows,'occurrence_id');
    const globalMastery=indexBy(globalRows,'vocabulary_id');
    // The existing student home screen evaluates readiness ONLY when every
    // pathway initially appears mastered. Otherwise it leaves the unit's
    // pathway coverage unregistered. Mirror that behaviour for parity; using
    // published sets for all units here can change XP/mastery totals.
    for (const [unit,rows] of byUnit) {
      const states=calculatePathwayStates({
        occurrences:rows,unitMastery,globalMastery,coverageByPathway:{}
      });
      if(!Object.values(states).every(state=>state.mastered===true))continue;
      const members=membership.filter(row=>Number(row.unit_number)===unit);
      registerPathwayCoverage(unit,coverageFromServerSetMembers(members,rows));
    }
    const snapshot=calculateProgress({
      occurrences,
      unitMastery,
      globalMastery
    });
    // Show both explicit calendar interpretations; do not choose a wallet credit
    // before the browser and server are known to agree for each student.
    const shanghai=calculateXp({missions,snapshot,timeZone:'Asia/Shanghai'});
    const utc=calculateXp({missions,snapshot,timeZone:'UTC'});
    const computed=calculateXp({missions,snapshot,timeZone:clientZone ?? 'Asia/Shanghai'});
    return response({
      ok:true,
      auditOnly:true,
      lifetimeXp:computed.total,
      parts:computed.parts,
      level:computed.level,
      deterministicComparisons:{
        shanghai:{total:shanghai.total,parts:shanghai.parts},
        utc:{total:utc.total,parts:utc.parts},
        timezoneSensitive:shanghai.total!==utc.total || Object.keys(shanghai.parts).some(key=>shanghai.parts[key]!==utc.parts[key])
      },
      calendarTimezone:clientZone ?? 'Asia/Shanghai',
      readyForWalletFunding:false,
      counts:{missions:missions.length,liveOccurrences:occurrences.length,masteryRows:unitRows.length,
        membershipRows:membership.length, masteredUnits:snapshot.unitsMastered},
      timezoneCaveat:'This diagnostic compares calendar rules in the requested timezone; it never authorizes wallet funding.'
    });
  } catch (error) {
    // Avoid exposing raw queries, token values or user records to callers.
    console.error('Vocabulary reward XP audit failed:',error instanceof Error ? error.message : 'unknown');
    return response({ok:false,error:'XP audit unavailable; no credits were changed'},503);
  }
});
