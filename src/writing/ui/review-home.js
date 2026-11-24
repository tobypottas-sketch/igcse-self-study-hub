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
 structure:'<rect x="18" y="18" width="42" height="55" rx="4"/><path d="M27 31h24M27 41h24M27 51h16M27 61h24M68 31h10v30H68"/>',
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
export function renderReviewHome(root,catalogue){
 root.replaceChildren();const doc=root.ownerDocument;const config=catalogue.config;
 const shell=add(root,'div','wa-shell');
 const nav=add(shell,'nav','wa-nav');nav.setAttribute('aria-label','Academy navigation');link(nav,'wa-back','← Self-Study Hub','./');add(nav,'span','wa-brand','WRITING / ACADEMY');add(nav,'span','wa-preview','Staff preview');
 const hero=add(shell,'header','wa-hero');const intro=add(hero,'div','wa-intro');add(intro,'p','wa-kicker','CAMBRIDGE IGCSE ESL 0511 · EXERCISE 6');add(intro,'h1','','Write with confidence.');add(intro,'p','wa-lead','Review Writing — explore ideas, develop your voice and learn to make every word count.');link(intro,'wa-primary','Open Writing Studio →','./review-writing.html');
 const editorial=add(hero,'div','wa-editorial');editorial.setAttribute('aria-hidden','true');add(editorial,'span','wa-editorial-small','THE ART OF');add(editorial,'span','wa-editorial-big','REVIEW');add(editorial,'span','wa-editorial-small','DESCRIBE / EVALUATE / RECOMMEND');motif(editorial,'editing');
 const stats=add(shell,'div','wa-facts');for(const [n,l] of [[String(config.pathways.length),'skill pathways'],[String(catalogue.listTasks().length),'writing prompts'],[config.wordRange.min+'–'+config.wordRange.max,'target words']]){const stat=add(stats,'div','wa-fact');add(stat,'strong','',n);add(stat,'span','',l);}
 const section=add(shell,'section','wa-section');add(section,'p','wa-kicker','YOUR LEARNING JOURNEY');add(section,'h2','','Build your writing skills');add(section,'p','wa-muted','Six focused pathways. Activities are being developed; explore the existing Studio in the meantime.');
 const grid=add(section,'div','wa-pathways');
 for(const path of config.pathways){const [number,description,key]=pathwayDetails[path.id];const card=add(grid,'article','wa-path wa-'+key);const top=add(card,'div','wa-card-top');add(top,'span','wa-index',number);motif(top,key);add(card,'h3','',path.title);add(card,'p','',description);add(card,'span','wa-status','In development');}
 const tools=add(shell,'section','wa-section');add(tools,'h2','','Your writing workspace');const toolGrid=add(tools,'div','wa-tools');
 for(const [title,description,href] of [['Writing Studio','Plan, draft, revise and export a complete review.','./review-writing.html'],['Model Answer Library','Explore annotated examples of effective writing.',null],['My Portfolio','Keep drafts and track personal improvement.',null],['Exam Practice','Work independently on exam-style tasks.',null]]){const card=add(toolGrid,'article','wa-tool');add(card,'h3','',title);add(card,'p','',description);if(href)link(card,'wa-tool-link','Open Studio →',href);else add(card,'span','wa-status','In development');}
 const footer=add(shell,'footer','wa-footer');add(footer,'p','','Design preview · No student progress or XP is recorded here.');
}
