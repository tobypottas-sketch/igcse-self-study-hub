import { escapeHtml } from '../views/html.js';

const e=value=>escapeHtml(String(value??''));
export function highlightedNGSLSentence(sentence,target){
  if(typeof sentence!=='string'||typeof target!=='string'||!target.trim())throw new Error('Invalid NGSL question.');
  const start=sentence.toLocaleLowerCase().indexOf(target.toLocaleLowerCase());
  if(start<0)throw new Error('NGSL target is missing from its sentence.');
  const before=sentence.slice(0,start),match=sentence.slice(start,start+target.length);
  const after=sentence.slice(start+target.length);
  return e(before)+'<strong class="ngsl-target">'+e(match)+'</strong>'+e(after);
}
export function ngslPromptMarkup(sentence,target){
  return '<h1 class="ngsl-question-title">What does <strong>'+e(target)+'</strong> mean?</h1>'
    +'<p class="ngsl-example">'+highlightedNGSLSentence(sentence,target)+'</p>';
}
