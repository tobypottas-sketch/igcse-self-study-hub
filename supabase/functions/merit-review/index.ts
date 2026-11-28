import { createClient } from 'npm:@supabase/supabase-js@2.117.3';
import { createMeritReview } from './review.js';

const headers = {
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
  'Cache-Control':'no-store'
};
const json = (body: unknown, status = 200) => Response.json(body, {status, headers});
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const review = createMeritReview();

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, {status:204, headers});
  if (request.method !== 'POST') return json({error:'Method not allowed'},405);
  const token = request.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return json({error:'Sign in again to review merits.'},401);
  try {
    const url = Deno.env.get('SUPABASE_URL') ?? '';
    const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global:{headers:{Authorization:`Bearer ${token}`}}, auth:{persistSession:false,autoRefreshToken:false}
    });
    const {data:{user},error:authError} = await caller.auth.getUser(token);
    if (authError && ![400,401,403].includes(authError.status ?? 0)) {
      return json({error:'Merit authentication is temporarily unavailable. Try again.'},503);
    }
    if (authError || !user) return json({error:'Sign in again to review merits.'},401);
    const body = await request.json().catch(() => null);
    if (!body || !['list','award'].includes(body.action) || !['mine','all'].includes(body.scope)) {
      return json({error:'Invalid merit request.'},400);
    }
    const award = body.action === 'award';
    if (award && (!uuid.test(body.studentId) || !Number.isInteger(body.number) || body.number < 1 || body.number > 1000)) {
      return json({error:'Invalid merit number or student.'},400);
    }
    const load = (all: boolean, student: string | null, fresh = false) => review({
      fresh,
      inputs: async (includeCatalogue: boolean) => {
        const {data,error} = await caller.rpc('merit_review_inputs',{
          p_all:all, p_student:student, p_catalogue:includeCatalogue
        });
        if (error) throw error;
        return data;
      }
    });
    const all = body.scope === 'all';
    if (!award) return json((await load(all,null)).snapshot);

    const changed = async () => {
      const {snapshot} = await load(all,null,true);
      const personalSnapshot = all ? (await load(false,null,true)).snapshot : snapshot;
      return json({error:'Merit eligibility changed. The pending list has been refreshed.',
        snapshot,personalSnapshot},409);
    };
    const server = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {auth:{persistSession:false,autoRefreshToken:false}});
    for (let attempt=0;attempt<2;attempt++) {
      const result = await load(all,body.studentId,true);
      const state = result.students.get(body.studentId);
      if (!state) return json({error:'Student is outside the current merit scope.'},403);
      if (body.number > state.highestAwarded && !state.pending.includes(body.number)) {
        return await changed();
      }
      if (!result.proof) throw new Error('Current eligibility proof unavailable');
      const {data:confirmation,error} = await server.rpc('confirm_reviewed_merit',{
        p_actor:user.id,p_student:body.studentId,p_number:body.number,p_all:all,p_proof:result.proof
      });
      if (error) {
        if (error.code==='55P03' && attempt===0) continue;
        throw error;
      }
      if (!confirmation?.changed) return json(confirmation);
    }
    return await changed();
  } catch (error) {
    if ((error as {code?:string})?.code==='42501') return json({error:'Merit access is no longer available.'},403);
    return json({error:'Merits could not be updated. Try again.'},503);
  }
});
