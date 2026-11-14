#!/usr/bin/env node
// Run ONLY on a local, private bank file: node tools/diagnostic/audit-bank.mjs ./private-bank.json --pilot
// Never commit real answer keys to this repository or publish them through GitHub Pages.
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { auditDiagnosticBank } from './item-quality.js';

function isTrackedByGit(file){
  try{
    execFileSync('git',['ls-files','--error-unmatch',file],{cwd:dirname(file),stdio:'ignore'});
    return true;
  }catch{return false;}
}

const args=process.argv.slice(2);
const forPilot=args.includes('--pilot');
const path=args.find(arg=>!arg.startsWith('--'));
if(!path||args.some(arg=>arg.startsWith('--')&&arg!=='--pilot')){
  process.stderr.write('Usage: node tools/diagnostic/audit-bank.mjs <private-bank.json> [--pilot]\n');
  process.exitCode=2;
}else{
  try{
    if(isTrackedByGit(resolve(path)))throw new Error('Refusing to audit a file tracked by Git: tracked files are public. Keep private banks outside the repository or under diagnostic-private/.');
    const content=JSON.parse(readFileSync(resolve(path),'utf8'));
    if(!Array.isArray(content))throw new Error('Private bank must be a JSON array.');
    const report=auditDiagnosticBank(content,{forPilot});
    // Never print stems, option text, answer IDs or student-related data.
    process.stdout.write(JSON.stringify({
      status:report.ok?'pass':'fail',items:report.total,pilot:forPilot,
      byLevel:report.byBand,byConstruct:report.byConstruct,byDomain:report.byDomain,
      flaggedItemCount:new Set(report.failures.map(x=>x.itemId)).size,
      errors:report.failures.map(x=>({itemId:x.itemId,code:x.code})),
      warnings:report.warnings.map(x=>({itemId:x.itemId,code:x.code})),
      sharedContentFamilies:report.sharedFamilies.map(x=>({family:x.family,count:x.items.length}))
    },null,2)+'\n');
    if(!report.ok)process.exitCode=1;
  }catch(error){
    process.stderr.write('Could not audit private diagnostic bank: '+String(error.message??error)+'\n');
    process.exitCode=2;
  }
}
