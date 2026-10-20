import fs from 'node:fs';

const path = 'src/vocabulary/views.js';
let source = fs.readFileSync(path,'utf8');
if (source.includes('Complete short 10-question study sessions to build this skill.')) {
  console.log('Pathway reward copy already patched');
  process.exit(0);
}

const oldStatus = "  const statusLabel = unavailable ? 'Not yet available for this unit' : state.mastered ? 'Mastered' : state.needsPractice ? 'Needs practice' : `Current: ${PATHWAY_STAGES.find(stage => stage.id === state.currentStage)?.label ?? 'Recognise'}`;\n";
const newStatus = "  const currentStageLabel = PATHWAY_STAGES.find(stage => stage.id === state.currentStage)?.label ?? 'Recognise';\n  const completedCount = state.mastered ? PATHWAY_STAGES.length : state.completedStages.size;\n  const statusLabel = unavailable ? 'Not yet available for this unit' : state.mastered ? 'Mastered ✓' : state.needsPractice ? `Needs practice · Next up: ${currentStageLabel}` : `Next up: ${currentStageLabel}`;\n  const stageCount = unavailable ? '' : `<span class=\"vocab-pathway-card__stage-count\">${escapeHtml(completedCount)} of 5 stages complete</span>`;\n  const sessionGuide = unavailable || state.mastered ? '' : '<span class=\"vocab-pathway-card__session-guide\">Complete short 10-question study sessions to build this skill.</span>';\n";
if (!source.includes(oldStatus)) throw new Error('pathway status owner not found; refusing to patch');
source = source.replace(oldStatus,newStatus);

const oldCta = "  const cta = unavailable ? 'Not yet available for this unit' : `${state.mastered ? 'Review pathway' : 'Continue pathway'} →`;\n";
const newCta = "  const cta = unavailable ? 'Not yet available for this unit' : state.mastered ? 'Review pathway →' : 'Start 10-question session →';\n";
if (!source.includes(oldCta)) throw new Error('pathway CTA owner not found; refusing to patch');
source = source.replace(oldCta,newCta);

const oldReturn = '  return `<button type="button" class="vocab-pathway-card study-enter" data-action="open-pathway" data-pathway="${pathway.id}" data-pathway-status="${status}" data-study-accent="${escapeHtml(identity.accent)}"${disabled}><span class="vocab-pathway-card__identity"><span class="vocab-pathway-card__icon">${renderStudyIcon(identity.icon,{className:\'study-icon--lg\'})}</span><span class="vocab-pathway-card__head"><strong>${escapeHtml(identity.label)}</strong><small>${escapeHtml(identity.purpose)}</small></span></span><span class="vocab-pathway-card__status">${escapeHtml(statusLabel)}</span>${coverage}<span class="vocab-pathway-ladder" aria-label="${escapeHtml(pathway.label)} progression">${stages}</span><span class="vocab-pathway-card__cta">${escapeHtml(cta)}</span></button>`;\n';
const newReturn = '  return `<button type="button" class="vocab-pathway-card study-enter" data-action="open-pathway" data-pathway="${pathway.id}" data-pathway-status="${status}" data-study-accent="${escapeHtml(identity.accent)}"${disabled}><span class="vocab-pathway-card__identity"><span class="vocab-pathway-card__icon">${renderStudyIcon(identity.icon,{className:\'study-icon--lg\'})}</span><span class="vocab-pathway-card__head"><strong>${escapeHtml(identity.label)}</strong><small>${escapeHtml(identity.purpose)}</small></span></span><span class="vocab-pathway-card__status">${escapeHtml(statusLabel)}</span>${stageCount}${sessionGuide}${coverage}<span class="vocab-pathway-ladder" aria-label="${escapeHtml(pathway.label)} progression">${stages}</span><span class="vocab-pathway-card__cta">${escapeHtml(cta)}</span></button>`;\n';
if (!source.includes(oldReturn)) throw new Error('pathway card owner not found; refusing to patch');
source = source.replace(oldReturn,newReturn);

fs.writeFileSync(path,source);
console.log('Patched finite pathway copy');
