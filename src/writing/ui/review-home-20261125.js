import {createPreviewProgress} from '../engine/preview-progress.js';
import {renderArtwork, reviewArtwork} from './editorial-art.js?v=16';
import {renderStudio} from './studio-20261125.js';
import {renderExamReference,renderStructure,renderExpression,renderDevelopment,renderCohesion,renderEditing,renderExam} from './structure-20261125.js?v=12';
// Preview has no student writes, XP transactions or invented progress.
const pathwayDetails={
 structure:['01','Arrange ideas into a review that flows.','structure'],
 expression:['02','Choose vivid, precise language that suits your audience.','expression'],
 development:['03','Turn opinions into convincing, specific explanations.','development'],
 cohesion:['04','Connect ideas naturally and vary your sentences.','cohesion'],
 editing:['05','Spot weaknesses and make purposeful improvements.','editing'],
 exam:['06','Bring your skills together in exam-style writing.','exam']
};
function node(doc,tag,cls,text){const n=doc.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;}
function add(parent,tag,cls,text){const n=node(parent.ownerDocument,tag,cls,text);parent.append(n);return n;}
function link(parent,cls,text,href){const a=add(parent,'a',cls,text);a.href=href;return a;}
export function renderReviewHome(root,catalogue,accountId,feedbackContext={}){
 root.replaceChildren();const doc=root.ownerDocument;const config=catalogue.config;
 let storage;
 try { storage=doc.defaultView.localStorage; } catch { /* The preview also works without storage. */ }
 const progress=createPreviewProgress(storage,accountId,{appKey:config.appKey,id:config.id,curriculumVersion:config.version});
 const back=()=>renderReviewHome(root,catalogue,accountId,feedbackContext);const studio=(options={})=>{renderStudio(root,{accountId,onBack:back,...feedbackContext,...options});root.ownerDocument.defaultView.scrollTo(0,0);};
 const shell=add(root,'div','wa-shell');
 const nav=add(shell,'nav','wa-nav');nav.setAttribute('aria-label','Academy navigation');link(nav,'wa-back','← Self-Study Hub','./');add(nav,'span','wa-brand','WRITING / ACADEMY');add(nav,'span','wa-preview','Staff preview');
 const hero=add(shell,'header','wa-hero');const intro=add(hero,'div','wa-intro');add(intro,'p','wa-kicker','CAMBRIDGE IGCSE ESL 0511 · EXERCISE 6');add(intro,'h1','','Write with confidence.');add(intro,'p','wa-lead','Review Writing — explore ideas, develop your voice and learn to make every word count.');const launch=add(intro,'button','wa-primary wa-action','Open Writing Studio →');launch.onclick=()=>studio();link(intro,'wa-legacy-link','Original Studio','./review-writing.html');
 renderArtwork(hero,reviewArtwork.hero,'hero');
 renderExamReference(shell);
 const section=add(shell,'section','wa-section');add(section,'p','wa-kicker','YOUR LEARNING JOURNEY');add(section,'h2','','Build your writing skills');add(section,'p','wa-muted','Start with Structure & Organisation, then put your skills into practice in the Writing Studio.');
 const grid=add(section,'div','wa-pathways');
 for(const path of config.pathways){const [number,description,key]=pathwayDetails[path.id];const card=add(grid,'article','wa-path wa-'+key);const top=add(card,'div','wa-card-top');add(top,'span','wa-index',number);const artwork=reviewArtwork.pathways[key];renderArtwork(top,reviewArtwork.homeCards[key]??artwork.card??artwork.banner,'card');add(card,'h3','',path.title);add(card,'p','',description);if(['structure','expression','development','cohesion','editing','exam'].includes(path.id)){const b=add(card,'button','wa-action',progress.load(path.id)?'Resume pathway →':'Start pathway →');b.type='button';b.onclick=()=>{({structure:renderStructure,expression:renderExpression,development:renderDevelopment,cohesion:renderCohesion,editing:renderEditing,exam:renderExam}[path.id])(root,back,studio,progress);root.ownerDocument.defaultView.scrollTo(0,0);};}else add(card,'span','wa-status','In development');}
 const tools=add(shell,'section','wa-section');add(tools,'h2','','Your writing workspace');const toolGrid=add(tools,'div','wa-tools');
 for(const [title,description,href] of [['Writing Studio','Plan, draft and revise a complete review.','./review-writing.html'],['Model Answer Library','Explore annotated examples of effective writing.',null],['My Portfolio','Keep drafts and track personal improvement.',null],['Exam Practice','Work independently on exam-style tasks.',null]]){const card=add(toolGrid,'article','wa-tool');add(card,'h3','',title);add(card,'p','',description);if(title==='Writing Studio'||title==='Exam Practice'){const b=add(card,'button','wa-action','Open →');b.onclick=()=>studio(title==='Exam Practice'?{initialTask:'review-community-sports',initialMode:'Gold'}:{});}else add(card,'span','wa-status','In development');}
 const footer=add(shell,'footer','wa-footer');add(footer,'p','','Staff preview · Pathway checkpoints are saved on this device.');
}
