#!/usr/bin/env node
// Fails if tracked (and therefore publicly served) files contain keyed
// diagnostic content. Usage: node tools/diagnostic/check-public-exposure.mjs
// Output names files and rules only; it never prints matched content beyond
// a short locator.
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { scanRepository, RULES } from './public-exposure.js';

const root=execFileSync('git',['rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
const files=execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
const allowlist=JSON.parse(readFileSync(new URL('./public-exposure-allowlist.json',import.meta.url),'utf8')).entries;
const read=file=>{
  const path=`${root}/${file}`;
  if(!existsSync(path))return null;
  const buf=readFileSync(path);
  return buf.includes(0)?null:buf.toString('utf8');
};
const report=scanRepository(files,read,allowlist);
for(const f of report.findings)
  process.stderr.write(`${f.file}${f.line?':'+f.line:''} ${f.rule} — ${RULES[f.rule]}\n`);
for(const s of report.stale)
  process.stderr.write(`allowlist entry no longer needed: ${s.path} ${s.rule}\n`);
process.stdout.write(`Diagnostic public-exposure check: ${report.ok?'pass':'FAIL'} (${files.length} tracked files, ${report.findings.length} findings, ${report.stale.length} stale exemptions)\n`);
if(!report.ok)process.exitCode=1;
