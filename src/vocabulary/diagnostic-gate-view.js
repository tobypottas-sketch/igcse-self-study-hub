import { DIAGNOSTIC_ENTRY_STATES } from './diagnostic-entry-gate.js';

// Displays only a safe holding screen. The student assessment experience
// must be implemented and validated BEFORE the baseline gate is enabled.
export function renderVocabularyBaselineGate(root,decision){
 if(!root)return;
 const message={
  [DIAGNOSTIC_ENTRY_STATES.BASELINE_REQUIRED]:{
   heading:'Your first vocabulary diagnostic',
   text:'You need to complete a short diagnostic before beginning vocabulary practice. Your existing progress is safe.'
  },
  [DIAGNOSTIC_ENTRY_STATES.BASELINE_IN_PROGRESS]:{
   heading:'Continue your vocabulary diagnostic',
   text:'Your first diagnostic is not finished yet. Your vocabulary practice will unlock when it is complete.'
  },
  [DIAGNOSTIC_ENTRY_STATES.BASELINE_UNAVAILABLE]:{
   heading:'Diagnostic not available yet',
   text:'Your first diagnostic has not been assigned. Your teacher can help you get started.'
  },
  [DIAGNOSTIC_ENTRY_STATES.STATUS_ERROR]:{
   heading:'We could not check your diagnostic',
   text:'Vocabulary practice is temporarily unavailable because your assessment status could not be confirmed.'
  }
 }[decision]??{
  heading:'Vocabulary diagnostic',
  text:'Assessment status is unavailable.'
 };
 root.innerHTML='<main class="vocab-shell"><header class="vocab-topbar"><a class="vocab-back" href="./">← Hub</a><span>Vocabulary Builder</span></header><section class="vocab-startup" role="status" aria-live="polite"><div class="vocab-startup__content"><p class="vocab-kicker">YOUR VOCABULARY STARTING POINT</p><h1>'+message.heading+'</h1><p>'+message.text+'</p><p><a class="vocab-button" href="./">Back to Hub</a></p></div></section></main>';
}
