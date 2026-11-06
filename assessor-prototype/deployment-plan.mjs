// Pure, offline preparation. This module has no network/deploy capability.
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const uuid = value => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value ?? '');
// legacyKey: 'inherit' (default) copies ASSESSMENT_TEST_KEY from the verified active production version; 'omit' stages with no secret binding at all
// (/assess never uses that key; the legacy /teacher-test and /diagnose routes then answer 401 and the production secret stays only on the previous version).
export function buildProductionPlan({accountId,workerName,activeDeployment,expectedActiveVersion,activeVersion,configuration,modules,legacyKey='inherit'}) {
  if (!['inherit','omit'].includes(legacyKey)) throw Error('legacyKey must be "inherit" or "omit"');
  if (!/^[0-9a-f]{32}$/i.test(accountId ?? '') || workerName !== 'igcse-writing-assessor') throw Error('Assessor target required');
  if (!uuid(expectedActiveVersion) || activeDeployment?.versions?.length !== 1 ||
      activeDeployment.versions[0].percentage !== 100 || activeDeployment.versions[0].version_id !== expectedActiveVersion ||
      activeVersion?.id !== expectedActiveVersion) throw Error('A freshly verified, single active production version is required');
  const bindingTypes = activeVersion.resources?.bindings?.map(b=>[b.name,b.type]).sort();
  if (JSON.stringify(bindingTypes) !== JSON.stringify([['AI','ai'],['ASSESSMENT_TEST_KEY','secret_text']])) throw Error('Unexpected production bindings: manual review required');
  const date = activeVersion.resources?.script_runtime?.compatibility_date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) throw Error('Production compatibility date required');
  const {hubOrigin,supabaseUrl,publishableKey} = configuration ?? {};
  if (new URL(hubOrigin).protocol !== 'https:' || new URL(hubOrigin).origin !== hubOrigin ||
      new URL(supabaseUrl).protocol !== 'https:' || new URL(supabaseUrl).origin !== supabaseUrl ||
      typeof publishableKey !== 'string' || !publishableKey || publishableKey.startsWith('sb_secret_')) throw Error('Public Hub/Supabase configuration required');
  if (modules?.length !== 2 || !['worker.js','staff-assessment.js'].every(name=>modules.some(m=>m.name===name&&typeof m.content==='string'&&m.content))) throw Error('Both reviewed Worker modules required');
  return {
    method:'POST', url:`https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/workers/${workerName}/versions?deploy=false`,
    body:{compatibility_date:date,main_module:'worker.js',modules:modules.map(m=>({name:m.name,content_type:'application/javascript+module',content_base64:Buffer.from(m.content).toString('base64')})),
      bindings:[{name:'AI',type:'ai'},...(legacyKey==='inherit'?[{name:'ASSESSMENT_TEST_KEY',type:'inherit',version_id:expectedActiveVersion}]:[]),
        {name:'HUB_ORIGIN',type:'plain_text',text:hubOrigin},{name:'SUPABASE_URL',type:'plain_text',text:supabaseUrl},
        {name:'SUPABASE_PUBLISHABLE_KEY',type:'plain_text',text:publishableKey}]},
    preflight:[
      'Explicit approval required for any upload, logging settings change, live request or production deployment.',
      'Re-read active production ID before upload and before promotion; stop on any change.',
      legacyKey==='inherit'
        ? 'Verify secret inheritance references the active production ID, never latest or a temporary staging version.'
        : 'No secret binding is sent: legacy /teacher-test and /diagnose answer 401 on this version; the production secret stays only on the previous version (rollback).',
      'Verify Workers logging, tracing, tails and AI Gateway content capture are disabled; retain no writing or results.',
      'Use the Workers API version endpoint: script-version upload does not support version-specific inheritance.',
      'Run authorised synthetic staff/CORS and denied-student checks before a separately approved traffic switch.'
    ]
  };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const snapshot = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const flag = process.argv.find(a => a.startsWith('--legacy-key='));
  if (flag) snapshot.legacyKey = flag.slice('--legacy-key='.length);
  snapshot.modules = ['worker.js','staff-assessment.js'].map(name=>({name,content:readFileSync(new URL(name,import.meta.url),'utf8')}));
  process.stdout.write(JSON.stringify(buildProductionPlan(snapshot),null,2)+'\n');
}
