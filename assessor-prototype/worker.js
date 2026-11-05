// Cambridge 0511 evidence-verified teacher-only prototype. NOT student-facing.
// Source: https://www.cambridgeinternational.org/Images/637289-2024-specimen-paper-1-mark-scheme.pdf
// Deployment: Cloudflare ES module Worker, AI binding + ASSESSMENT_TEST_KEY secret.
const MODEL = "@cf/meta/llama-3.1-8b-instruct"; // Cloudflare JSON Mode supported model.
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
    type:"object",properties:{quote:{type:"string"}},required:["quote"]
   }])),required:REQUIREMENTS
  },
  features:{type:"array",items:{type:"object",properties:{
   label:{type:"string"},quote:{type:"string"}
  },required:["label","quote"]}},
  errors:{type:"array",items:{type:"object",properties:{
   quote:{type:"string"},correction:{type:"string"},explanation:{type:"string"}
  },required:["quote","correction","explanation"]}}
 },required:["requirements","features","errors"]
};
const assessmentSchema = {
 type:"object",properties:{
  contentMark:{type:"integer"},languageMark:{type:"integer"},
  contentReason:{type:"string"},languageReason:{type:"string"},
  strengths:{type:"array",items:{type:"object",properties:{
   quote:{type:"string"},advice:{type:"string"}
  },required:["quote","advice"]}},
  improvements:{type:"array",items:{type:"object",properties:{
   quote:{type:"string"},advice:{type:"string"}
  },required:["quote","advice"]}},
  missingRequirements:{type:"array",items:{type:"string"}},
  nextStep:{type:"string"}
 },required:["contentMark","languageMark","contentReason","languageReason",
 "strengths","improvements","missingRequirements","nextStep"]
};
async function ask(env,system,message,max_tokens,schema){
  const response=await env.AI.run(MODEL,{
    messages:[{role:"system",content:system},{role:"user",content:message}],
    temperature:0,max_tokens,
    response_format:{type:"json_schema",json_schema:schema}
  });
  return parseModel(response);
}
export default {
  async fetch(request,env){
    const path=new URL(request.url).pathname;
    if(request.method==="GET"&&path==="/")
      return json({service:"0511 teacher assessment prototype",aiConnected:Boolean(env.AI),studentsEnabled:false});
    if(request.method!=="POST"||path!=="/teacher-test")return json({error:"Not found"},404);
    if(!await validKey(request.headers.get("X-Assessment-Test-Key"),env.ASSESSMENT_TEST_KEY))
      return json({error:"Unauthorised"},401);
    if(!env.AI)return json({error:"AI binding unavailable"},503);
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
      else if(error?.message==="No AI text"||error?.message==="No JSON"||error?.message==="Bad JSON")
        reason="invalid_ai_response";
      else if(stage==="assessment_validation")reason="evidence_checks_rejected_mark";
      else if(stage==="evidence_validation")reason="evidence_checks_failed";
      return json({error:"Verification failed — no mark issued.",stage,reason},503);
    }
  }
};
