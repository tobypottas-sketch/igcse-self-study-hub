// Build a disposable static staging bundle from tracked frontend files.
import { execFileSync } from 'node:child_process';
import { closeSync, existsSync, mkdtempSync, openSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const productionRef = 'grjshlamooglytsajoun';
const productionHost = 'tobypottas-sketch.github.io';
const git = (args, options = {}) => execFileSync('git', args, { encoding:'utf8', ...options });
const read = path => readFileSync(path, 'utf8');

function inside(root, path) {
  const name = relative(root, path);
  return name === '' || (name !== '..' && !name.startsWith('..' + sep) && !isAbsolute(name));
}

function setConstant(source, name, value) {
  const expression = new RegExp(`^(export const ${name} = )[^;]+;`, 'm');
  if (!expression.test(source)) throw new Error(`Missing staging override for ${name}`);
  return source.replace(expression, (_, assignment) => assignment + JSON.stringify(value) + ';');
}

export function stagingSettings(env) {
  const ref = env.HUB_STAGING_SUPABASE_REF;
  const key = env.HUB_STAGING_PUBLISHABLE_KEY;
  if (!/^[a-z0-9]{20}$/.test(ref ?? '') || ref === productionRef) throw new Error('A non-production Supabase project reference is required');
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key ?? '')) throw new Error('A staging publishable key is required');

  const site = new URL(env.HUB_STAGING_SITE_URL ?? '');
  const local = ['localhost','127.0.0.1','[::1]'].includes(site.hostname);
  if ((site.protocol !== 'https:' && !(site.protocol === 'http:' && local)) ||
      site.hostname === productionHost || site.username || site.password || site.search || site.hash ||
      !/^(?:\/[A-Za-z0-9_.-]+)*\/$/.test(site.pathname)) {
    throw new Error('Use a separate HTTPS staging site or loopback URL with a trailing slash');
  }
  return { ref, key, site, microsoft:env.HUB_STAGING_MICROSOFT === 'true', timing:env.HUB_STAGING_ACTIVE_TIME === 'true' };
}

function main(output, commit = 'HEAD') {
  if (!output) throw new Error('Usage: node scripts/build-staging.mjs <new-output-directory> [commit]');
  const settings = stagingSettings(process.env);
  const root = git(['rev-parse','--show-toplevel']).trim();
  const target = join(realpathSync(dirname(resolve(output))), basename(resolve(output)));
  if (existsSync(target)) throw new Error('Choose a new output directory');
  if (inside(root, target)) throw new Error('Stage the build outside the source checkout');

  const sha = git(['rev-parse','--verify','--end-of-options',commit+'^{commit}']).trim();
  const records = git(['ls-tree','-rz',sha]).split('\0').filter(Boolean);
  const files = records.flatMap(record => {
    const tab = record.indexOf('\t');
    const name = record.slice(tab+1);
    const isFrontend = /^(assets|src|content\/vocabulary|supabase\/functions\/_shared)\//.test(name) ||
      /^(?:[a-z0-9-]+\.(?:html|css)|\.nojekyll)$/.test(name) ||
      name === 'supabase/functions/vocabulary-attempt-action/validation.js';
    if (!isFrontend) return [];
    if (!/^100(?:644|755) blob /.test(record) || name.startsWith('-') || /[\r\n]/.test(name)) {
      throw new Error('Staging requires regular tracked frontend files');
    }
    return [name];
  });

  const temp = mkdtempSync(join(dirname(target),'.hub-staging-'));
  const bundle = join(temp,'frontend.tar');
  try {
    const fd = openSync(bundle,'wx');
    try { git(['archive','--format=tar',sha,'--',...files],{stdio:['ignore',fd,'pipe']}); }
    finally { closeSync(fd); }
    execFileSync('tar',['-xf',bundle,'-C',temp],{stdio:'pipe'});
    rmSync(bundle);

    const productionConfig = read(join(temp,'src/config.js'));
    if (productionConfig.includes(settings.key)) throw new Error('The live publishable key cannot be used in staging');
    const project = `https://${settings.ref}.supabase.co`;
    writeFileSync(join(temp,'src/config.js'), `export function getSupabaseConfig() {
  return { url: ${JSON.stringify(project)}, publishableKey: ${JSON.stringify(settings.key)} };
}\n`);
    const callback = new URL('microsoft-sign-in.html',settings.site).href;
    const microsoftPath = join(temp,'src/microsoft-sign-in.js');
    let microsoft = setConstant(read(microsoftPath),'MICROSOFT_PILOT_CALLBACK',callback);
    microsoft = setConstant(microsoft,'MICROSOFT_STAFF_PILOT_ENABLED',settings.microsoft);
    microsoft = setConstant(microsoft,'MICROSOFT_STANDALONE_ADMIN_ENABLED',settings.microsoft);
    writeFileSync(microsoftPath,microsoft);

    // Some historical migrations register live launch URLs. Only known local
    // modules may be launched by a staging response, even with stale seed rows.
    const apps = {
      vocabulary_paraphrase:'vocabulary.html',
      review_writing:'review-writing.html', email_writing:'email-writing.html'
    };
    const launchRoutes = Object.fromEntries(Object.entries(apps).map(([name,path])=>[name,new URL(path,settings.site).href]));
    const apiPath = join(temp,'src/api.js');
    const api = read(apiPath);
    const returnStatement = '  return data ?? [];';
    if (!api.includes(returnStatement)) throw new Error('Expected the study app launcher contract');
    writeFileSync(apiPath,`const stagingLaunchRoutes = ${JSON.stringify(launchRoutes)};\n`+
      api.replace(returnStatement, `  return (data ?? []).filter(app => Object.hasOwn(stagingLaunchRoutes,app.app_key))
    .map(app => ({ ...app, launch_url:stagingLaunchRoutes[app.app_key] }));`));

    const timingPath = join(temp,'src/vocabulary/active-learning-browser.js');
    const timingSource = read(timingPath);
    const marker = 'export const VOCABULARY_ACTIVE_TIME_V2_ENABLED=false;';
    if (!timingSource.includes(marker)) throw new Error('Expected a disabled source timing gate');
    if (settings.timing) writeFileSync(timingPath,timingSource.replace(marker,'export const VOCABULARY_ACTIVE_TIME_V2_ENABLED=true;'));

    const hosts = `${project} wss://${settings.ref}.supabase.co`;
    const csp = `connect-src ${hosts}; form-action 'self'; base-uri 'none'; frame-src 'none'`;
    const banner = '<aside aria-label="Staging environment" style="position:fixed;z-index:2147483647;right:0;top:0;background:#7c2d12;color:white;padding:.4em .8em;font:bold 14px system-ui;pointer-events:none">STAGING · SYNTHETIC DATA ONLY</aside>';
    for (const file of files.filter(name=>!name.includes('/')&&name.endsWith('.html'))) {
      const path = join(temp,file);
      const html = read(path);
      if (!/<head\b[^>]*>/i.test(html) || !/<body\b[^>]*>/i.test(html)) throw new Error(`Cannot isolate ${file}`);
      writeFileSync(path,html.replace(/<head\b[^>]*>/i,tag=>tag+
        `\n<meta http-equiv="Content-Security-Policy" content="${csp}">\n<meta name="robots" content="noindex,nofollow">\n`)
        .replace(/<body\b[^>]*>/i,tag=>tag+'\n'+banner+'\n'));
    }
    for (const file of files.filter(name=>/\.(?:js|html|css|mjs)$/.test(name))) {
      if (read(join(temp,file)).includes(productionRef)) throw new Error(`Live Supabase reference in staging file: ${file}`);
    }
    writeFileSync(join(temp,'_headers'),`/*\n  Content-Security-Policy: ${csp}; frame-ancestors 'none'\n  X-Robots-Tag: noindex, nofollow\n`);
    writeFileSync(join(temp,'staging-build.json'),JSON.stringify({ commit:sha, project:settings.ref, site:settings.site.href,
      microsoft:settings.microsoft, activeTime:settings.timing },null,2)+'\n');

    // A separate new directory keeps staging assets out of a production checkout.
    renameSync(temp,target);
    console.log(`Built staging frontend for ${sha}.`);
  } finally { rmSync(temp,{recursive:true,force:true}); }
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(new URL(import.meta.url))) {
  try { main(process.argv[2],process.argv[3]); }
  catch (error) {
    // Avoid printing URLs, subprocess arguments or environment values from failed builds.
    const message = error instanceof TypeError ? 'Invalid staging configuration' :
      error.code ? 'Unable to create staging bundle' : error.message;
    console.error(message);
    process.exitCode = 1;
  }
}
