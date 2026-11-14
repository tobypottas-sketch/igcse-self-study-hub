// Public-exposure guard for the vocabulary diagnostic.
// Everything tracked in this repository is public: GitHub Pages serves the
// repository root. Operational diagnostic questions, options and answer keys
// must live only in private Supabase tables (see
// docs/vocabulary-diagnostic-secure-bank-boundary.md). These checks catch
// the common ways keyed content leaks into Git. They cannot prove absence of
// leaks; independent review still matters.

const KEY_FIELDS=new Set(['correct_option_id','correctoptionid','proposed_correct_option_id',
  'proposedcorrectoptionid','answerkey','answer_key','correctanswer','correct_answer','key']);
const STEM_FIELDS=new Set(['stem','question','prompt']);
const TEXT_EXTENSIONS=/\.(js|mjs|cjs|ts|json|html|htm|md|sql|css|txt|csv|ya?ml|tsv)$/i;
const BROWSER_EXTENSIONS=/\.(js|mjs|html|htm)$/i;

export const RULES=Object.freeze({
  PRIVATE_PATH:'File path is reserved for private diagnostic authoring and must never be committed',
  KEYED_JSON:'JSON object combines question text, options and an answer key',
  KEYED_LITERAL:'Answer-key field assigned a literal option letter',
  KEYED_SQL_INSERT:'SQL inserts content into the private diagnostic item bank',
  KEYED_MARKDOWN:'Markdown marks a keyed answer option',
  ITEM_MARKDOWN:'Markdown contains a full diagnostic item (stem followed by lettered options)',
  BROWSER_PRIVATE_FETCH:'Browser asset loads diagnostic bank or editorial files',
  UNSAFE_LOG:'Diagnostic code logs request, response or item data'
});

const PRIVATE_PATHS=[
  /(^|\/)diagnostic-private\//i,
  /\.diag-private\.json$/i,
  /(^|\/)private-bank[^/]*\.json$/i
];

const LITERAL_KEY=/\b(correct_option_id|correctOptionId|proposed_correct_option_id|proposedCorrectOptionId|answer_?key|answerKey|correct_?answer|correctAnswer)\b["']?\s*[:=]\s*["'][A-D]["']/;
// Literal seed rows only; the parameterised import inside the lifecycle RPC is the sanctioned path.
const SQL_INSERT=/insert\s+into\s+private\.vocabulary_diagnostic_items\b[^;]*?\b(values\s*\(\s*'|select\s+')/i;
const MARKDOWN_KEY=[
  /\b[A-D]\s*[.):]?\s[^\n|]{0,200}\(key\)/i,
  /\*\*[A-D]\s*\(key\)\*\*/i,
  /^\|\s*\**[A-D]\**\s*\|[^\n]*\|\s*✓\s*\|?\s*$/m,
  /\b(answer key|correct answer|key)\s*[:=]\s*\**\(?[A-D]\)?\**(?![A-Za-z0-9])/i
];
const MARKDOWN_ITEM=/\*\*(?:proposed\s+)?stem:?\*\*:?[^\n]*\n(?:[^\n]*\n){0,3}?(?:\s*[-*|]?\s*\**\s*[A-D]\s*[.):|][^\n]*\n){3,}/i;
const BROWSER_FETCH=/['"`][^'"`\n]*(supabase\/diagnostic\/|diagnostic\/editorial\/|diagnostic-private\/)[^'"`\n]*['"`]/;
const LOGGED_DATA=/\b(payload|result|data|raw|body|item|items|stem|options|request|req|response|answer|answers|question)\b/;

function lineOf(text,index){return text.slice(0,index).split('\n').length;}

function walkJson(value,path,findings,file){
  if(Array.isArray(value)){value.forEach((v,i)=>walkJson(v,`${path}[${i}]`,findings,file));return;}
  if(!value||typeof value!=='object')return;
  const keys=Object.keys(value);
  const lower=new Map(keys.map(k=>[k.toLowerCase(),k]));
  const hasStem=[...STEM_FIELDS].some(k=>typeof value[lower.get(k)]==='string');
  const hasOptions=Array.isArray(value[lower.get('options')])&&value[lower.get('options')].length>=2;
  const hasKey=[...KEY_FIELDS].some(k=>lower.has(k));
  if(hasStem&&hasOptions&&hasKey)findings.push({file,rule:'KEYED_JSON',line:null,detail:path||'$'});
  for(const k of keys)walkJson(value[k],path?`${path}.${k}`:k,findings,file);
}

function scanConsole(file,text,findings){
  const re=/console\.(log|info|warn|error|debug|trace)\s*\(/g;
  let m;
  while((m=re.exec(text))){
    let depth=1,i=re.lastIndex,quote=null;
    for(;i<text.length&&depth>0;i++){
      const ch=text[i];
      if(quote){if(ch==='\\'){i++;continue;}if(ch===quote)quote=null;continue;}
      if(ch==='"'||ch==="'"||ch==='`'){quote=ch;continue;}
      if(ch==='(')depth++;else if(ch===')')depth--;
    }
    const args=text.slice(re.lastIndex,i-1).replace(/(["'`])(?:\\.|(?!\1).)*\1/g,'""');
    if(LOGGED_DATA.test(args))findings.push({file,rule:'UNSAFE_LOG',line:lineOf(text,m.index),detail:args.trim().slice(0,80)});
  }
}

export function isDiagnosticRuntimeFile(file){
  return /^supabase\/functions\/vocabulary-diagnostic\//.test(file)
    ||/^src\/vocabulary\/diagnostic-[^/]+\.js$/.test(file);
}

export function scanFile(file,text){
  const findings=[];
  if(PRIVATE_PATHS.some(re=>re.test(file)))findings.push({file,rule:'PRIVATE_PATH',line:null,detail:file});
  if(text==null||!TEXT_EXTENSIONS.test(file))return findings;
  if(/\.json$/i.test(file)){
    try{walkJson(JSON.parse(text),'',findings,file);}catch{/* non-JSON content is handled by text rules */}
  }
  const literal=LITERAL_KEY.exec(text);
  if(literal)findings.push({file,rule:'KEYED_LITERAL',line:lineOf(text,literal.index),detail:literal[0]});
  if(/\.(sql|md|js|mjs|ts)$/i.test(file)){
    const insert=SQL_INSERT.exec(text);
    if(insert)findings.push({file,rule:'KEYED_SQL_INSERT',line:lineOf(text,insert.index),detail:insert[0]});
  }
  if(/\.md$/i.test(file)){
    for(const re of MARKDOWN_KEY){
      const hit=re.exec(text);
      if(hit){findings.push({file,rule:'KEYED_MARKDOWN',line:lineOf(text,hit.index),detail:hit[0].slice(0,80)});break;}
    }
    const item=MARKDOWN_ITEM.exec(text);
    if(item)findings.push({file,rule:'ITEM_MARKDOWN',line:lineOf(text,item.index),detail:item[0].slice(0,40)});
  }
  if(BROWSER_EXTENSIONS.test(file)&&!/^(tests|tools|scripts|supabase)\//.test(file)){
    const hit=BROWSER_FETCH.exec(text);
    if(hit)findings.push({file,rule:'BROWSER_PRIVATE_FETCH',line:lineOf(text,hit.index),detail:hit[0]});
  }
  if(isDiagnosticRuntimeFile(file))scanConsole(file,text,findings);
  return findings;
}

// allowlist: [{path, rules:[...], reason}] — exact paths only, every entry
// must still match at least one finding so stale exemptions are removed.
export function scanRepository(files,readText,allowlist=[]){
  const allowed=new Map(allowlist.map(e=>[e.path,new Set(e.rules)]));
  const used=new Set();
  const findings=[];
  for(const file of files){
    for(const f of scanFile(file,readText(file))){
      if(allowed.get(file)?.has(f.rule)){used.add(`${file}|${f.rule}`);continue;}
      findings.push(f);
    }
  }
  const stale=allowlist.flatMap(e=>e.rules.filter(r=>!used.has(`${e.path}|${r}`)).map(rule=>({path:e.path,rule})));
  return {ok:findings.length===0&&stale.length===0,findings,stale};
}
