import { escapeHtml } from '../views/html.js';

const esc = value => escapeHtml(String(value ?? ''));
const LEDGER = './supabase/diagnostic/editorial/reconstruction-batch-01-review-ledger.json';

export function createDiagnosticPreview(root, onExit) {
  let items = [];
  let index = 0;
  let selected = null;
  let revealed = false;
  let level = 'all';
  let feedback = new Map();

  function currentItems() { return level === 'all' ? items : items.filter(item => item.level_hypothesis === level); }
  function render() {
    const list = currentItems();
    const item = list[index];
    if (!item) {
      root.innerHTML = '<main class="dr-shell"><button type="button" data-preview="exit">← Review queue</button><p>No items in this level.</p></main>';
      return;
    }
    const key = item.proposed_correct_option_id;
    const chosen = selected;
    const entry = feedback.get(item.item_id) || '';
    root.innerHTML = `<main class="dr-shell dr-preview">
      <header class="dr-topbar"><button type="button" data-preview="exit">← Review queue</button><span>Teacher-only · Unapproved candidates</span></header>
      <section class="dr-hero dr-hero--small"><p class="dr-kicker">STUDENT VIEW PREVIEW · NO RESULTS SAVED</p><h1>Try the diagnostic</h1><p>Answer as a student, then reveal the key and review notes. These are editorial proposals, not the live bank.</p></section>
      <section class="dr-panel">
        <div class="dr-toolbar"><label for="preview-level">Level <select id="preview-level" data-preview="level"><option value="all">All levels</option>${['A1','A2','B1','B2','C1'].map(x=>`<option value="${x}" ${level===x?'selected':''}>${x}</option>`).join('')}</select></label><span>Question ${index+1} of ${list.length} · ${esc(item.level_hypothesis)}</span></div>
        <p class="dr-question">${esc(item.stem)}</p>
        <fieldset class="dr-preview-options"><legend>Choose one answer</legend>${item.options.map(option=>`<label class="dr-preview-option"><input type="radio" name="preview-answer" value="${esc(option.id)}" ${chosen===option.id?'checked':''}><span><strong>${esc(option.id)}.</strong> ${esc(option.text)}</span></label>`).join('')}</fieldset>
        <div class="dr-preview-actions"><button type="button" class="dr-primary" data-preview="reveal" ${chosen===null?'disabled':''}>${revealed?'Answer revealed':'Check answer'}</button><button type="button" data-preview="previous" ${index===0?'disabled':''}>Previous</button><button type="button" data-preview="next" ${index===list.length-1?'disabled':''}>Next</button></div>
        ${revealed?`<section class="dr-preview-feedback" aria-live="polite"><h2>${chosen===key?'Correct selection':'Different from proposed key'}</h2><p><strong>Proposed answer:</strong> ${esc(key)} — ${esc(item.options.find(x=>x.id===key)?.text)}</p><ul>${item.options.map(o=>`<li><strong>${esc(o.id)}:</strong> ${esc(o.rationale)}</li>`).join('')}</ul><p><strong>Known concerns:</strong> ${esc(item.blocking_risks?.join(' · ')||'Independent review still required.')}</p><p class="dr-muted">No answer is submitted to Supabase. This does not approve the item.</p></section>`:''}
        <label for="preview-feedback"><strong>Your review notes (this browser session only)</strong></label><textarea id="preview-feedback" rows="3" placeholder="Ambiguous answer? Obvious distractor? Too easy?" maxlength="1500">${esc(entry)}</textarea>
        <button type="button" data-preview="copy">Copy review note</button>
        <p class="dr-muted">Notes are held only while this preview is open. Copy them before leaving; they are not review decisions.</p>
      </section></main>`;
  }
  function navigate(next) { const list=currentItems();index=Math.max(0,Math.min(list.length-1,next));selected=null;revealed=false;render(); }
  function onClick(event) {
    const button=event.target.closest('[data-preview]');
    if(!button||!root.contains(button))return;
    const action=button.dataset.preview;
    if(action==='exit'){destroy();onExit();return;}
    if(action==='previous')navigate(index-1);
    if(action==='next')navigate(index+1);
    if(action==='reveal'&&selected!==null){revealed=true;render();}
    if(action==='copy'){
      const item=currentItems()[index];
      const note=feedback.get(item.item_id)||'';
      const text=[item.item_id,item.lemma,item.revision,'Review note: '+note].join(' | ');
      if(navigator.clipboard?.writeText)void navigator.clipboard.writeText(text).then(()=>{button.textContent='Copied';}).catch(()=>{button.textContent='Copy unavailable';});
      else button.textContent='Copy unavailable';
    }
  }
  function onChange(event){
    if(event.target.id==='preview-level'){level=event.target.value;index=0;selected=null;revealed=false;render();}
    if(event.target.name==='preview-answer'){selected=event.target.value;revealed=false;render();}
  }
  function onInput(event){if(event.target.id==='preview-feedback'){const item=currentItems()[index];if(item)feedback.set(item.item_id,event.target.value);}}
  function destroy(){root.removeEventListener('click',onClick);root.removeEventListener('change',onChange);root.removeEventListener('input',onInput);}
  async function start(){
    root.innerHTML='<main class="dr-shell"><p role="status">Loading proposed questions…</p></main>';
    const response=await fetch(LEDGER,{cache:'no-store'});
    if(!response.ok)throw new Error('Could not load editorial preview items.');
    const data=await response.json();
    if(!Array.isArray(data.items)||data.items.length===0)throw new Error('No editorial preview items are available.');
    items=data.items;
    root.addEventListener('click',onClick);root.addEventListener('change',onChange);root.addEventListener('input',onInput);
    render();
  }
  return {start,destroy};
}
