import {renderArtwork, reviewArtwork} from './editorial-art.js?v=11';
import {renderStudio} from './studio.js?v=16';
import {renderExamReference,renderStructure,renderExpression,renderDevelopment,renderCohesion,renderEditing} from './structure.js?v=22';
// Preview has no student writes, XP transactions or invented progress.
const pathwayDetails={
 structure:['01','Arrange ideas into a review that flows.','structure'],
 expression:['02','Choose vivid, precise language that suits your audience.','expression'],
 development:['03','Turn opinions into convincing, specific explanations.','development'],
 cohesion:['04','Connect ideas naturally and vary your sentences.','cohesion'],
 editing:['05','Spot weaknesses and make purposeful improvements.','editing'],
 exam:['06','Bring your skills together in exam-style writing.','exam']
};
const motifs={
 expression:'<path d="M17 23h55v38H42L29 73V61H17zM27 36h35M27 47h23"/><path d="m72 14 4 7 8 2-6 6 1 8-7-4-7 4 1-8-6-6 8-2z"/>',
 development:'<circle cx="43" cy="38" r="19"/><path d="M35 56v9h16v-9M36 73h14M43 9v7M13 38h8M65 38h9M21 16l6 7M65 16l-6 7"/>',
 cohesion:'<path d="M38 33l9-9a13 13 0 0 1 19 19L54 55a13 13 0 0 1-18 0M47 47l-9 9a13 13 0 0 1-19-19l12-12a13 13 0 0 1 18 0"/>',
 editing:'<path d="M18 18h43v59H18zM27 33h23M27 44h15M27 56h15M49 63l5-15 21-21 10 10-21 21zM70 32l10 10"/>',
 exam:'<circle cx="43" cy="45" r="27"/><circle cx="43" cy="45" r="17"/><circle cx="43" cy="45" r="7"/><path d="m43 45 32-32M64 13h11v11"/>'
};
function node(doc,tag,cls,text){const n=doc.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;}
function add(parent,tag,cls,text){const n=node(parent.ownerDocument,tag,cls,text);parent.append(n);return n;}
function link(parent,cls,text,href){const a=add(parent,'a',cls,text);a.href=href;return a;}
function motif(parent,key){const svg=parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 96 96');svg.setAttribute('aria-hidden','true');svg.classList.add('wa-motif');svg.innerHTML=motifs[key];parent.append(svg);}
export function renderReviewHome(root,catalogue,accountId,feedbackContext={}){
 root.replaceChildren();const doc=root.ownerDocument;const config=catalogue.config;
 const back=()=>renderReviewHome(root,catalogue,accountId,feedbackContext);const studio=(options={})=>{renderStudio(root,{accountId,onBack:back,...feedbackContext,...options});root.ownerDocument.defaultView.scrollTo(0,0);};
 const shell=add(root,'div','wa-shell');
 const nav=add(shell,'nav','wa-nav');nav.setAttribute('aria-label','Academy navigation');link(nav,'wa-back','← Self-Study Hub','./');add(nav,'span','wa-brand','WRITING / ACADEMY');add(nav,'span','wa-preview','Staff preview');
 const hero=add(shell,'header','wa-hero');const intro=add(hero,'div','wa-intro');add(intro,'p','wa-kicker','CAMBRIDGE IGCSE ESL 0511 · EXERCISE 6');add(intro,'h1','','Write with confidence.');add(intro,'p','wa-lead','Review Writing — explore ideas, develop your voice and learn to make every word count.');const launch=add(intro,'button','wa-primary wa-action','Open Writing Studio →');launch.onclick=()=>studio();link(intro,'wa-legacy-link','Original Studio','./review-writing.html');
 renderArtwork(hero,reviewArtwork.hero,'hero');
 renderExamReference(shell);
 const section=add(shell,'section','wa-section');add(section,'p','wa-kicker','YOUR LEARNING JOURNEY');add(section,'h2','','Build your writing skills');add(section,'p','wa-muted','Start with Structure & Organisation, then put your skills into practice in the Writing Studio.');
 const grid=add(section,'div','wa-pathways');
 for(const path of config.pathways){const [number,description,key]=pathwayDetails[path.id];const card=add(grid,'article','wa-path wa-'+key);const top=add(card,'div','wa-card-top');add(top,'span','wa-index',number);const artwork=reviewArtwork.pathways[key];if(artwork)renderArtwork(top,artwork.card??artwork.banner,'card');else motif(top,key);add(card,'h3','',path.title);add(card,'p','',description);if(['structure','expression','development','cohesion','editing'].includes(path.id)){const b=add(card,'button','wa-action','Start pathway →');b.type='button';b.onclick=()=>{({structure:renderStructure,expression:renderExpression,development:renderDevelopment,cohesion:renderCohesion,editing:renderEditing}[path.id])(root,back,studio);root.ownerDocument.defaultView.scrollTo(0,0);};}else add(card,'span','wa-status','In development');}
 const tools=add(shell,'section','wa-section');add(tools,'h2','','Your writing workspace');const toolGrid=add(tools,'div','wa-tools');
 for(const [title,description,href] of [['Writing Studio','Plan, draft and revise a complete review.','./review-writing.html'],['Model Answer Library','Explore annotated examples of effective writing.',null],['My Portfolio','Keep drafts and track personal improvement.',null],['Exam Practice','Work independently on exam-style tasks.',null]]){const card=add(toolGrid,'article','wa-tool');add(card,'h3','',title);add(card,'p','',description);if(title==='Writing Studio'||title==='Exam Practice'){const b=add(card,'button','wa-action','Open →');b.onclick=()=>studio(title==='Exam Practice'?{initialTask:'review-community-sports',initialMode:'Gold'}:{});}else add(card,'span','wa-status','In development');}
 const footer=add(shell,'footer','wa-footer');add(footer,'p','','Design preview · No student progress or XP is recorded here.');
}
