// Validates a private editorial replacement package and wraps it with the
// content-free migration into one private SQL script. Never logs item text.
import {randomBytes,createHash} from 'node:crypto';

const BANDS=new Set(['A1','A2','B1','B2','C1']);
const ID=/^diag-candidate-\d{3}$/;
const blank=v=>typeof v!=='string'||!v.trim();

export function validateEditorialPackage(doc){
  const errors=[];
  if(!doc||typeof doc!=='object'||Array.isArray(doc))return {errors:['package must be an object'],replacements:[]};
  if(blank(doc.package_version))errors.push('package_version missing');
  const list=Array.isArray(doc.proposed_replacements)?doc.proposed_replacements:null;
  if(!list||!list.length)return {errors:[...errors,'proposed_replacements missing or empty'],replacements:[]};
  const seen=new Set();
  list.forEach((r,i)=>{
    const at=`replacement ${i+1}${r&&typeof r.item_id==='string'?' ('+r.item_id+')':''}`;
    if(!r||typeof r!=='object'){errors.push(`${at}: not an object`);return;}
    if(!ID.test(r.item_id??''))errors.push(`${at}: item_id must match diag-candidate-NNN`);
    else if(seen.has(r.item_id))errors.push(`${at}: duplicate item_id`);
    seen.add(r.item_id);
    if(!['A','B'].includes(r.form))errors.push(`${at}: form must be A or B`);
    if(!BANDS.has(r.provisional_level))errors.push(`${at}: provisional_level must be A1–C1`);
    if(blank(r.target_lemma))errors.push(`${at}: target_lemma missing`);
    if(blank(r.stem))errors.push(`${at}: stem missing`);
    if(r.expected_current_version!==undefined&&!(Number.isInteger(r.expected_current_version)&&r.expected_current_version>0))
      errors.push(`${at}: expected_current_version must be a positive integer`);
    const opts=Array.isArray(r.options)?r.options:[];
    const ids=opts.map(o=>o?.id).sort().join('');
    if(opts.length!==4||ids!=='ABCD')errors.push(`${at}: options must be exactly A, B, C, D`);
    if(opts.some(o=>blank(o?.text)))errors.push(`${at}: blank option text`);
    if(new Set(opts.map(o=>String(o?.text??'').trim().toLowerCase())).size!==opts.length)errors.push(`${at}: duplicate option text`);
    if(!['A','B','C','D'].includes(r.correct_option_id))errors.push(`${at}: correct_option_id must be A–D`);
  });
  const replacements=errors.length?[]:list.map(r=>({form:r.form,item_id:r.item_id,provisional_level:r.provisional_level,
    target_lemma:r.target_lemma,stem:r.stem,options:r.options.map(o=>({id:o.id,text:o.text})),
    correct_option_id:r.correct_option_id,editorial_rationale:r.editorial_rationale??null,
    ...(r.expected_current_version!==undefined?{expected_current_version:r.expected_current_version}:{})}));
  return {errors,replacements};
}

export function buildEditorialRevisionSql(doc,migrationSql){
  const {errors,replacements}=validateEditorialPackage(doc);
  if(errors.length)throw new Error('Invalid editorial package:\n'+errors.join('\n'));
  const json=JSON.stringify({package_version:doc.package_version,proposed_replacements:replacements});
  let tag;
  do{tag='pkg_'+randomBytes(6).toString('hex');}while(json.includes('$'+tag+'$'));
  const sha256=createHash('sha256').update(json).digest('hex');
  const sql=[
    '-- PRIVATE: contains diagnostic question text and answer keys. Never commit or share publicly.',
    `-- Package ${doc.package_version}; ${replacements.length} replacements; sha256 ${sha256}.`,
    '-- Applies only to the two DRAFT baseline forms; any failed check rolls everything back.',
    'begin;',
    'create temp table diag_editorial_package(doc jsonb not null) on commit drop;',
    `insert into pg_temp.diag_editorial_package(doc) values ($${tag}$${json}$${tag}$::jsonb);`,
    migrationSql.trim(),
    'select * from pg_temp.diag_apply_editorial_revisions() order by form_code,form_position;',
    'commit;',''
  ].join('\n');
  return {sql,sha256,summary:replacements.map(r=>({form:r.form,item_id:r.item_id,level:r.provisional_level}))};
}
