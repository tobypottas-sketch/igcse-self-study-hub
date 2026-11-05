// Cambridge 0511 evidence-verified teacher-only prototype. NOT student-facing.
// Source: https://www.cambridgeinternational.org/Images/637289-2024-specimen-paper-1-mark-scheme.pdf
// Deployment: Cloudflare ES module Worker, AI binding + ASSESSMENT_TEST_KEY secret.
// Verified against the model catalog AND JSON Mode guide (2026-11-05).
// The older non-fp8 llama-3.1-8b-instruct is no longer in the catalog.
const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const TASK = "Your school magazine is publishing restaurant reviews. Review a restaurant you visited. Describe food and atmosphere, give opinions with reasons and recommend it or not. Write 120–160 words.";
const ESSAY = `Last weekend, I visited Green Garden Restaurant with my family. It is a small Italian restaurant near the city centre.

The restaurant was beautifully decorated and had a relaxing atmosphere. I ordered a pizza, which was fresh and delicious. However, the service was rather slow, and we waited a long time for our food.

In my opinion, the restaurant is worth visiting because the food is excellent and the prices are reasonable. The staff were also friendly and helpful.

Overall, I would recommend Green Garden to families and students who enjoy Italian food.`;
const REQUIREMENTS=["subject","food","atmosphere","opinion","recommendation"];
const countWords=s=>(String(s).trim().match(/\S+/g)||[]).length;
const grounded=(text,quote)=>typeof quote==="string"&&quote.trim().length>=4&&text.toLowerCase().includes(quote.trim().toLowerCase());
const short=(v,max=240)=>typeof v==="string"?v.trim().slice(0,max):"";
const json=(body,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
function parseModel(result){
  // JSON Mode returns an object directly, whereas ordinary text generation
  // usually returns {response:"{...}"}. Support both without guessing marks.
  const raw=result?.response ?? result;
  if(raw&&typeof raw==="object"&&!Array.isArray(raw))return raw;
  if(typeof raw!=="string")throw Error("No AI text");
  let data;
  try{data=JSON.parse(raw.trim());}
  catch(_){
    // Tolerate only a well-formed fenced object; never repair truncated JSON.
    const fenced=raw.trim().match(/^\x60\x60\x60(?:json)?\s*([\s\S]*?)\s*\x60\x60\x60$/i);
    if(!fenced)throw Error("Invalid AI JSON");
    data=JSON.parse(fenced[1]);
  }
  if(!data||typeof data!=="object"||Array.isArray(data))throw Error("Bad JSON");
  return data;
}
async function validKey(provided,expected){
  if(!provided||!expected||typeof provided!=="string"||typeof expected!=="string")return false;
  const encode=new TextEncoder();
  const [a,b]=await Promise.all([crypto.subtle.digest("SHA-256",encode.encode(provided)),crypto.subtle.digest("SHA-256",encode.encode(expected))]);
  let different=0;const x=new Uint8Array(a),y=new Uint8Array(b);
  for(let i=0;i<x.length;i++)different|=x[i]^y[i];
  return different===0;
}
function verifyEvidence(raw,essay){
  const requirements={};
  for(const name of REQUIREMENTS){
    const q=short(raw?.requirements?.[name]?.quote,180);
    requirements[name]={present:grounded(essay,q),quote:grounded(essay,q)?q:""};
  }
  const features=(Array.isArray(raw?.features)?raw.features:[]).slice(0,8)
    .map(x=>({label:short(x?.label,70),quote:short(x?.quote,170)}))
    .filter(x=>x.label&&grounded(essay,x.quote));
  const errors=(Array.isArray(raw?.errors)?raw.errors:[]).slice(0,5)
    .map(x=>({quote:short(x?.quote,150),correction:short(x?.correction,150),explanation:short(x?.explanation,200)}))
    .filter(x=>grounded(essay,x.quote)&&x.correction&&x.explanation);
  return {requirements,features,errors};
}
function verifyAssessment(raw,essay,evidence){
  const c=raw?.contentMark,l=raw?.languageMark;
  if(!Number.isInteger(c)||c<0||c>6||!Number.isInteger(l)||l<0||l>9)throw Error("Invalid marks");
  const points=(arr,max)=>(Array.isArray(arr)?arr:[]).slice(0,max)
    .map(x=>({quote:short(x?.quote,180),advice:short(x?.advice,300)}))
    .filter(x=>grounded(essay,x.quote)&&x.advice);
  const strengths=points(raw?.strengths,2),improvements=points(raw?.improvements,3);
  const contentReason=short(raw?.contentReason,350),languageReason=short(raw?.languageReason,350);
  const nextStep=short(raw?.nextStep,230);
  // Block obvious contradictions even in free-text reasons (not just quote fields).
  // This is a narrow guard, not a complete semantic truth verifier.
  const prose=[contentReason,languageReason,nextStep,...improvements.map(x=>x.advice)].join(" ").toLowerCase();
  if(evidence.requirements.food.present &&
    /(?:no|never|not|failed to|fails to|didn't|doesn't|without|lack(?:s|ing)?)\s+(?:\w+\s+){0,5}(?:mention|identify|name|include|describe)\s+(?:a\s+|any\s+|the\s+)?(?:specific\s+)?(?:food|dish|pizza)/i.test(prose))
    throw Error("Contradicts verified food evidence");
  if(evidence.requirements.recommendation.present &&
    /(?:no|not|never|without|lack(?:s|ing)?)\s+(?:\w+\s+){0,4}recommendation/i.test(prose))
    throw Error("Contradicts verified recommendation");
  // The teacher never sees an unsupported score as a valid result.
  if(!strengths.length||!contentReason||!languageReason||!nextStep)throw Error("Insufficient grounded feedback");
  // Failure to find an exact quote is NOT proof that the requirement is absent.
  // Withhold unverified "missing" claims until calibrated against teacher evidence.
  const missing=[];
  return {
    experimental:true,wordCount:countWords(essay),contentMark:c,languageMark:l,totalMark:c+l,
    contentBand:c>=5?"5–6":c>=3?"3–4":c>=1?"1–2":"0",
    languageBand:l>=7?"7–9":l>=4?"4–6":l>=1?"1–3":"0",
    contentReason,languageReason,strengths,improvements,missingRequirements:missing,
    observedEvidence:evidence.requirements,quotedErrorCandidatesRequireTeacherReview:evidence.errors,nextStep,
    warning:"Experimental teacher-only estimate, not a Cambridge examiner grade."
  };
}
const EVIDENCE_PROMPT = `You are an evidence extractor, NOT an examiner. Return only JSON:
{"requirements":{"subject":{"quote":""},"food":{"quote":""},"atmosphere":{"quote":""},"opinion":{"quote":""},"recommendation":{"quote":""}},"features":[{"label":"","quote":""}],"errors":[{"quote":"","correction":"","explanation":""}]}
Quotes must be EXACT uninterrupted substrings of the student response. Leave empty if absent.
A named food such as "pizza" proves a specific dish is mentioned. Do not deny it.
Relative clauses introduced by "which" are evidence of grammatical complexity, not simple sentences.
Do NOT invent grammar mistakes; do not report stylistic preferences as errors.
At most five potential genuine errors, each with precise explanation.`;
const ASSESS_PROMPT = `You are an experimental IGCSE ESL 0511 writing assessor. Use best-fit marking:
CONTENT 5–6: task met, relevant, appropriate audience/style, very well developed.
CONTENT 3–4: generally met, generally relevant, appropriate style, generally developed.
CONTENT 1–2: partially met and weak development. 0: no creditable content.
LANGUAGE 7–9: wide appropriate vocabulary and grammatical range, high accuracy, effective organisation/cohesion.
LANGUAGE 4–6: clear, some language variety and complex structures, generally accurate and organised.
LANGUAGE 1–3: narrow range, poor accuracy/clarity or limited organisation. 0: no creditable response.
These are paraphrases of Cambridge 0511's published 2024 specimen bands, NOT official automated scoring.
Mark Content (integer 0–6) and Language (integer 0–9) separately.
Consider 120–160 words as a task target, not an automatic marks deduction.
The VERIFIED evidence object restricts what you may claim is missing.
NEVER say a requirement is absent if evidence.requirements[name].present=true.
A specific dish "pizza" IS mentioned. A sentence with "which was" is NOT simple.
Do not demand new introduction or conclusion when they are already present.
Do not reward unnatural complex synonyms. Simple, accurate language can be effective.
Do not invent errors. Do not recommend writing an entirely new answer; revise this draft.
Use exact student quotes to justify every strength and improvement.
Return ONLY JSON with this schema (no markdown):
{"contentMark":4,"languageMark":6,"contentReason":"...","languageReason":"...",
"strengths":[{"quote":"exact quote","advice":"why it works"}],
"improvements":[{"quote":"exact quote","advice":"specific improvement to this passage"}],
"missingRequirements":[],"nextStep":"One action to revise THIS response"}
The numbers 4 and 6 above are placeholders, not required marks. Assess independently.`;
// Explicit JSON schemas keep the output compact and reduce truncated/malformed text.
const evidenceSchema = {
 type:"object",
 properties:{
  requirements:{
   type:"object",properties:Object.fromEntries(REQUIREMENTS.map(name=>[name,{
    type:"object",properties:{quote:{type:"string",maxLength:180}},required:["quote"]
   }])),required:REQUIREMENTS
  },
  features:{type:"array",maxItems:8,items:{type:"object",properties:{
   label:{type:"string",maxLength:70},quote:{type:"string",maxLength:170}
  },required:["label","quote"]}},
  errors:{type:"array",maxItems:5,items:{type:"object",properties:{
   quote:{type:"string",maxLength:150},correction:{type:"string",maxLength:150},explanation:{type:"string",maxLength:200}
  },required:["quote","correction","explanation"]}}
 },required:["requirements","features","errors"]
};
const assessmentSchema = {
 type:"object",properties:{
  contentMark:{type:"integer",minimum:0,maximum:6},languageMark:{type:"integer",minimum:0,maximum:9},
  contentReason:{type:"string",maxLength:350},languageReason:{type:"string",maxLength:350},
  strengths:{type:"array",maxItems:2,items:{type:"object",properties:{
   quote:{type:"string",maxLength:180},advice:{type:"string",maxLength:300}
  },required:["quote","advice"]}},
  improvements:{type:"array",maxItems:3,items:{type:"object",properties:{
   quote:{type:"string",maxLength:180},advice:{type:"string",maxLength:300}
  },required:["quote","advice"]}},
  missingRequirements:{type:"array",maxItems:5,items:{type:"string",maxLength:40}},
  nextStep:{type:"string",maxLength:230}
 },required:["contentMark","languageMark","contentReason","languageReason",
 "strengths","improvements","missingRequirements","nextStep"]
};
// Validate the small schema subset used above locally too: JSON Mode is not
// guaranteed. Never let an error envelope or incomplete evidence reach grading.
function matchesSchema(value,schema) {
  switch(schema.type) {
    case "object":
      return value!==null && typeof value==="object" && !Array.isArray(value) &&
        (schema.required||[]).every(key=>Object.hasOwn(value,key)) &&
        Object.entries(schema.properties||{}).every(([key,child])=>
          !Object.hasOwn(value,key)||matchesSchema(value[key],child));
    case "array":
      return Array.isArray(value) && value.length<=(schema.maxItems??Infinity) &&
        value.every(item=>matchesSchema(item,schema.items));
    case "string":return typeof value==="string" && [...value].length<=(schema.maxLength??Infinity);
    case "integer":return Number.isInteger(value) && value>=(schema.minimum??-Infinity) && value<=(schema.maximum??Infinity);
    case "boolean":return typeof value==="boolean";
    default:return false;
  }
}
// Diagnostic probes never contain student work or the fictional essay.
function classifyAIError(error) {
  // Prefer documented codes: permission/quota messages can also say "model".
  const code=Number(error?.code);
  if([5018,5016,3023,3041].includes(code))return "model_permission";
  if(code===5035)return "paid_model_not_allowed";
  if([3036,3040].includes(code))return "quota_or_rate_limit";
  if([3007,3008].includes(code))return "model_timeout";
  if([5007,3042].includes(code))return "model_unavailable";
  const msg=String(error?.message||"").toLowerCase();
  if(/json mode|json.schema|grammar|couldn.t be met|could not be met|schema validation/.test(msg))return "json_mode_or_schema";
  if(/paid plan|paid billing/.test(msg))return "paid_model_not_allowed";
  if(/permission|auth|forbidden|unauthori|not allowed/.test(msg))return "model_permission";
  if(/quota|limit|rate|capacity|neurons|exceeded|billing|credits|free allocation/.test(msg))return "quota_or_rate_limit";
  if(/timeout|timed out|deadline/.test(msg))return "model_timeout";
  if(/no such model|not found|unknown model|not supported|invalid model/.test(msg))return "model_unavailable";
  return "upstream_ai_error";
}
function safeAIErrorCode(error) {
  const raw=error?.code ?? error?.status ?? error?.statusCode;
  // Cloudflare codes/statuses are numeric. Never echo arbitrary error strings.
  return /^(?:[1-5][0-9]{2}|[0-9]{4,5})$/.test(String(raw)) ? Number(raw) : null;
}
async function diagnoseAI(env,structured=false) {
  // One minimal call per diagnostic. Never include the essay or request body.
  try {
    if(structured) {
      const reply=await ask(env,"Return JSON with ready set to true.","Check structured output.",32,{
        type:"object",properties:{ready:{type:"boolean"}},required:["ready"]
      });
      return {ok:reply.ready===true,model:MODEL,structuredOutputTested:true};
    }
    const reply=await env.AI.run(MODEL,{
      messages:[{role:"user",content:"Reply with exactly the word READY."}],
      max_tokens:20,temperature:0
    });
    const output=reply?.response;
    if(typeof output!=="string")return {ok:false,category:"unexpected_model_response_type"};
    return {ok:true,model:MODEL,responded:Boolean(output.trim()),structuredOutputTested:false};
  } catch(error) {
    return {ok:false,model:MODEL,category:classifyAIError(error),code:safeAIErrorCode(error)};
  }
}
async function ask(env,system,message,max_tokens,schema){
  const response=await env.AI.run(MODEL,{
    messages:[{role:"system",content:system},{role:"user",content:message}],
    temperature:0,max_tokens,stream:false,
    response_format:{type:"json_schema",json_schema:schema}
  });
  const data=parseModel(response);
  if(!matchesSchema(data,schema))throw Error("Invalid AI response schema");
  return data;
}
export default {
  async fetch(request,env){
    const path=new URL(request.url).pathname;
    if(request.method==="GET"&&path==="/")
      return json({service:"0511 teacher assessment prototype",aiConnected:Boolean(env.AI),studentsEnabled:false});
    if(request.method!=="POST"||(path!=="/teacher-test"&&path!=="/diagnose"))return json({error:"Not found"},404);
    if(!await validKey(request.headers.get("X-Assessment-Test-Key"),env.ASSESSMENT_TEST_KEY))
      return json({error:"Unauthorised"},401);
    if(!env.AI)return json({error:"AI binding unavailable"},503);
    if(path==="/diagnose") {
      const structured=new URL(request.url).searchParams.get("mode")==="json";
      const report=await diagnoseAI(env,structured);
      return json({diagnostic:structured?"structured_model_access":"basic_model_access",...report},report.ok?200:503);
    }
    let stage="evidence_model";
    try{
      // Body intentionally ignored. Fixed fictional answer only; no student texts sent.
      const extracted=await ask(env,EVIDENCE_PROMPT,"TASK:\n"+TASK+"\nANSWER:\n"+ESSAY,900,evidenceSchema);
      stage="evidence_validation";
      const evidence=verifyEvidence(extracted,ESSAY);
      stage="assessment_model";
      const draft=await ask(env,ASSESS_PROMPT,JSON.stringify({task:TASK,essay:ESSAY,wordCount:countWords(ESSAY),evidence}),1100,assessmentSchema);
      stage="assessment_validation";
      const result=verifyAssessment(draft,ESSAY,evidence);
      return json({test:"fictional-restaurant",model:MODEL,stages:2,result});
    }catch(error){
      // Fail closed. Report ONLY a coarse diagnostic category, never essay content,
      // raw model responses, secrets, or stack traces.
      let reason="model_or_runtime_error";
      if(error instanceof SyntaxError || error?.message==="Invalid AI JSON")reason="invalid_ai_json";
      else if(error?.message==="Invalid AI response schema"||error?.message==="No AI text"||error?.message==="No JSON"||error?.message==="Bad JSON")
        reason="invalid_ai_response";
      else if(stage==="assessment_validation")reason="evidence_checks_rejected_mark";
      else if(stage==="evidence_validation")reason="evidence_checks_failed";
      const category=stage.endsWith("_model")?classifyAIError(error):null;
      return json({error:"Verification failed — no mark issued.",stage,reason,category,
        code:stage.endsWith("_model")?safeAIErrorCode(error):null},503);
    }
  }
};
