import {renderArtwork} from './editorial-art.js?v=9';
import {previewStages} from '../engine/preview-progress.js';

// Optional browser checkpoints for staff preview navigation.
export const stages=['Discover','Explore','Practise','Apply','Master'];
export function el(p,t,c,v){const n=p.ownerDocument.createElement(t);n.className=c||'';if(v)n.textContent=v;p.append(n);return n;}
export function action(p,t,fn,cls='wa-action'){const b=el(p,'button',cls,t);b.type='button';b.onclick=fn;return b;}
export function mountLesson(root,{title,pathwayNumber='01',artwork,onBack,reference,companions=[],renderStage,checkpoint,onCheckpoint}){
 root.replaceChildren();const shell=el(root,'div','wa-shell wa-learning wa-editorial-lesson');
 shell.dataset.pathway=pathwayNumber;
 const nav=el(shell,'nav','wa-nav');action(nav,'← All pathways',onBack);el(nav,'span','wa-preview','Staff preview');
 const header=el(shell,'header','wa-lesson-banner');const copy=el(header,'div','');el(copy,'p','wa-kicker','PATHWAY '+pathwayNumber+' / WRITING ACADEMY');el(copy,'h1','',title);
 if(artwork?.banner)renderArtwork(header,artwork.banner,'banner');
 const ref=reference(shell);ref.classList.add('wa-lesson-reference');
 const progress=el(shell,'p','wa-stage-progress');progress.setAttribute('aria-live','polite');
 const meter=el(shell,'div','wa-journey-meter');const fill=el(meter,'div','');meter.setAttribute('aria-hidden','true');
 const strip=el(shell,'nav','wa-stage-nav');strip.setAttribute('aria-label','Learning stages');
 const body=el(shell,'section','wa-stage-body');const foot=el(shell,'div','wa-stage-foot');
 let current=Math.max(0,previewStages.indexOf(checkpoint?.stage));
 const complete=new Set((checkpoint?.completed??[]).map(stage=>previewStages.indexOf(stage)));
 let saved=checkpoint!=null;
 const tabs=[];
 function save(){
  if (!onCheckpoint) return;
  saved=onCheckpoint({stage:previewStages[current],completed:[...complete].map(index=>previewStages[index])});
  sync();
 }
 for (const event of ['click','input','change']) {
  shell.addEventListener(event,save);
 }
 function sync(){fill.style.width=(complete.size/stages.length*100)+'%';progress.textContent=complete.size+' of '+stages.length+' stages completed · '+(saved?'saved on this device':'this visit');tabs.forEach((b,i)=>{b.setAttribute('aria-current',i===current?'step':'false');b.dataset.complete=String(complete.has(i));b.dataset.stage=stages[i].toLowerCase();b.textContent=(complete.has(i)?'✓ ':String(i+1).padStart(2,'0')+' · ')+stages[i];});}
 function show(i, focus = true) {
  const win=root.ownerDocument.defaultView;
  const anchor=strip.getBoundingClientRect().top;
  const wasVisible=anchor>=0&&anchor<win.innerHeight;
  current = i;
  body.replaceChildren();
  foot.replaceChildren();
  sync();

  const illustration = artwork?.stages?.[i];
  body.dataset.stage = stages[i].toLowerCase();
  const heading = el(body, 'h2', 'wa-stage-title', stages[i]);
  heading.tabIndex = -1;
  const side=el(body,'aside','wa-learning-companion');
  if (illustration) renderArtwork(side, illustration, 'stage');
  if(companions[i]){const [title,tip,think]=companions[i];const guide=el(side,'div','wa-companion-guide');el(guide,'p','wa-kicker','WRITING TOOLKIT');el(guide,'h3','',title);const hints=el(guide,'details','');el(hints,'summary','','Show a hint');el(hints,'p','',tip);el(guide,'p','wa-muted',think);}
  const activity = el(body, 'div', 'wa-stage-activity');
  renderStage(activity, i, {complete: () => { complete.add(i); sync(); }, go: show, allComplete:()=>complete.size===stages.length, incomplete:()=>{complete.delete(i);sync();}});

  if (i > 0) action(foot, '← Previous stage', () => show(i - 1));
  if (i < stages.length - 1) action(foot, 'Next stage →', () => show(i + 1), 'wa-action wa-next');
  if (focus) {
   heading.focus({preventScroll:true});
   if(wasVisible){win.scrollBy({top:strip.getBoundingClientRect().top-anchor,behavior:'instant'});}else{strip.scrollIntoView({block:'start',behavior:'instant'});}
  }
 }
 stages.forEach((s,i)=>tabs.push(action(strip,s,()=>show(i),'wa-stage-tab')));show(current,false);
}
