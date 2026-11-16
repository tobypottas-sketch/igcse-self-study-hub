#!/usr/bin/env node
// Usage: node tools/diagnostic/build-editorial-revision-sql.mjs <package.json> [out.sql]
// Writes a PRIVATE SQL script (default under git-ignored diagnostic-private/).
// Prints only item IDs, forms, levels and the package hash; never item text.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildEditorialRevisionSql} from './editorial-package.js';

const [input,outArg]=process.argv.slice(2);
if(!input){process.stderr.write('usage: build-editorial-revision-sql.mjs <package.json> [out.sql]\n');process.exit(2);}
const doc=JSON.parse(readFileSync(input,'utf8'));
const migration=readFileSync(new URL('../../supabase/diagnostic/editorial_revisions_NOT_APPLIED.sql',import.meta.url),'utf8');
const {sql,sha256,summary}=buildEditorialRevisionSql(doc,migration);
const out=outArg??`diagnostic-private/editorial-revisions-${String(doc.package_version).replace(/[^A-Za-z0-9._-]/g,'_')}.sql`;
const repo=fileURLToPath(new URL('../../',import.meta.url));
const rel=relative(repo,resolve(out));
if(!rel.startsWith('..'+sep)&&rel!=='..'&&!rel.startsWith('diagnostic-private'+sep)){
  process.stderr.write('Refusing to write keyed SQL inside the repository outside diagnostic-private/.\n');process.exit(2);
}
mkdirSync(dirname(out),{recursive:true});
writeFileSync(out,sql,{mode:0o600});
for(const s of summary)process.stdout.write(`${s.form} ${s.item_id} ${s.level}\n`);
process.stdout.write(`${summary.length} replacements · sha256 ${sha256} · written to ${out}\n`);
