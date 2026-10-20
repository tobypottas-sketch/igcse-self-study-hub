import fs from 'node:fs';

const path = 'src/vocabulary/views.js';
const source = fs.readFileSync(path,'utf8');
const pattern = /export function renderSessionSummary\(root,[\s\S]*?\n}\n/;
if (!pattern.test(source)) throw new Error('renderSessionSummary owner not found; refusing to patch');

const replacement = `function renderCompletionLadder(completion = {}) {
  const completed = new Set();
  if (completion.kind === 'pathway_mastered') for (const stage of PATHWAY_STAGES) completed.add(stage.id);
  else {
    const clearedIndex = PATHWAY_STAGES.findIndex(stage => stage.id === completion.clearedStageId);
    if (clearedIndex >= 0) for (const stage of PATHWAY_STAGES.slice(0,clearedIndex + 1)) completed.add(stage.id);
  }
  return PATHWAY_STAGES.map(stage => {
    const unlocked = completion.kind === 'stage_complete' && stage.id === completion.nextStageId;
    const state = completed.has(stage.id) ? 'complete' : unlocked ? 'unlocked' : 'future';
    const marker = state === 'complete' ? '✓' : state === 'unlocked' ? '🔓' : '○';
    return \`<span class="vocab-completion-stage" data-state="\${state}"><i aria-hidden="true">\${marker}</i><small>\${escapeHtml(stage.label)}</small></span>\`;
  }).join('');
}

export function renderSessionSummary(root, { durationMinutes = null, summary = {}, practiceMode = 'adaptive', nextPractice = null, pathwayId = null, pathwayStage = null, reward = null, completion = null } = {}) {
  const selected = focusDefinition(practiceMode);
  const identity = pathwayIdentity(pathwayId);
  const practised = Number(summary.practised ?? 0);

  if (!reward || !completion || !pathwayId) {
    const title = durationMinutes ? \`\${durationMinutes}-minute session complete\` : \`\${selected.label} session complete\`;
    const next = nextPractice ? \`<p class="vocab-next-practice"><strong>Next useful practice:</strong> \${escapeHtml(focusDefinition(nextPractice).label)}</p>\` : '';
    const advanced = Number(summary.advanced ?? 0);
    const mastered = Number(summary.mastered ?? 0);
    const optionalCards = \`\${advanced > 0 ? \`<div><strong>\${escapeHtml(advanced)}</strong><span>moved forward</span></div>\` : ''}\${mastered > 0 ? \`<div><strong>\${escapeHtml(mastered)}</strong><span>mastered</span></div>\` : ''}\`;
    const celebration = !durationMinutes && practised >= 10 ? \`<div class="vocab-celebration study-milestone" aria-hidden="true">\${renderStudyIcon('trophy',{className:'study-icon--xl'})}<span>✦</span><span>●</span><span>✦</span></div>\` : '';
    root.innerHTML = \`<main class="vocab-shell" data-study-accent="\${escapeHtml(identity.accent)}"><section class="vocab-summary-card study-milestone-card" data-study-completion>\${celebration}<div class="vocab-summary-identity">\${renderStudyIcon(identity.icon,{className:'study-icon--xl'})}<p class="vocab-kicker">Progress made</p></div><h1>\${practised >= 10 ? 'Great work!' : escapeHtml(title)}</h1><p class="vocab-summary-subtitle">\${escapeHtml(title)}</p><div class="vocab-summary-grid"><div><strong>\${escapeHtml(practised)}</strong><span>activities completed</span></div><div><strong>\${escapeHtml(summary.strengthened ?? 0)}</strong><span>successful activities</span></div>\${optionalCards}<div><strong>\${escapeHtml(summary.secure ?? 0)}</strong><span>moved to Secure</span></div></div><p>\${escapeHtml(summary.needsAnotherLook ?? 0)} still need another look. They will return in a different form.</p>\${next}<div class="vocab-summary-actions"><button class="vocab-button vocab-button--primary" data-action="continue-practice">Continue practising \${renderStudyIcon('arrow')}</button><button class="vocab-button" data-action="back-unit">Back to unit</button></div></section></main>\`;
    return;
  }

  const stageId = pathwayStage ?? reward.pathwayStage ?? completion.clearedStageId ?? completion.nextStageId;
  const stage = PATHWAY_STAGES.find(item => item.id === stageId);
  const stageLabel = stage?.label ?? titleCase(stageId);
  const clearedStage = PATHWAY_STAGES.find(item => item.id === completion.clearedStageId);
  const nextStage = PATHWAY_STAGES.find(item => item.id === completion.nextStageId);
  const starCount = Math.max(0,Math.min(3,Number(reward.stars) || 0));
  const starHtml = starCount ? \`<div class="vocab-session-stars study-milestone" aria-label="\${starCount} \${starCount === 1 ? 'star' : 'stars'}"><span aria-hidden="true">\${'★'.repeat(starCount)}</span></div>\` : '';
  const corrected = Number(reward.correctedMistakes ?? 0);
  const strengthened = Number(reward.strengthened ?? summary.strengthened ?? 0);
  const firstAttemptCorrect = Number(reward.firstAttemptCorrect ?? 0);
  const totalQuestions = Math.max(1,Number(reward.totalQuestions ?? 10) || 10);
  const scoreCards = \`<div class="vocab-session-evidence"><div aria-label="\${firstAttemptCorrect} / \${totalQuestions} first-attempt correct"><strong>\${firstAttemptCorrect} / \${totalQuestions}</strong><span>first-attempt correct</span></div><div aria-label="\${strengthened} words strengthened"><strong>\${strengthened}</strong><span>words strengthened</span></div>\${corrected ? \`<div aria-label="\${corrected} \${corrected === 1 ? 'mistake' : 'mistakes'} corrected"><strong>\${corrected}</strong><span>\${corrected === 1 ? 'mistake corrected' : 'mistakes corrected'}</span></div>\` : ''}</div>\`;
  const supportive = starCount === 0 ? '<p class="vocab-completion-support">Good practice — a few words need another go.</p>' : '';
  const contextLine = \`<p class="vocab-completion-context">You’re building confidence in <strong>\${escapeHtml(identity.label)} · \${escapeHtml(stageLabel)}</strong></p>\`;

  if (completion.kind === 'pathway_mastered') {
    root.innerHTML = \`<main class="vocab-shell vocab-shell--completion" data-study-accent="\${escapeHtml(identity.accent)}"><section class="vocab-summary-card vocab-summary-card--mastered study-milestone-card" data-study-completion="pathway_mastered"><div class="vocab-completion-emblem">\${renderStudyIcon('trophy',{className:'study-icon--xl'})}</div><p class="vocab-kicker">Major milestone</p><h1>PATHWAY MASTERED</h1><p class="vocab-summary-subtitle">\${escapeHtml(identity.label)} complete</p>\${starHtml}\${scoreCards}<p class="vocab-pathway-cleared-count"><strong>5 / 5 stages cleared</strong></p><div class="vocab-completion-ladder" aria-label="All five pathway stages complete">\${renderCompletionLadder(completion)}</div><p class="vocab-completion-support">You’ve completed the \${escapeHtml(identity.label)} pathway.</p><div class="vocab-summary-actions"><button class="vocab-button" data-action="back-units">Back to Vocabulary Builder</button><button class="vocab-button vocab-button--primary" data-action="back-unit">Choose another pathway</button></div></section></main>\`;
    return;
  }

  if (completion.kind === 'stage_complete') {
    const clearedIndex = Math.max(0,PATHWAY_STAGES.findIndex(item => item.id === completion.clearedStageId));
    root.innerHTML = \`<main class="vocab-shell vocab-shell--completion" data-study-accent="\${escapeHtml(identity.accent)}"><section class="vocab-summary-card vocab-summary-card--stage study-milestone-card" data-study-completion="stage_complete"><div class="vocab-completion-emblem">\${renderStudyIcon(identity.icon,{className:'study-icon--xl'})}</div><p class="vocab-kicker">Stage cleared</p><h1>\${escapeHtml((clearedStage?.label ?? stageLabel).toUpperCase())} COMPLETE</h1><p class="vocab-summary-subtitle">Stage \${clearedIndex + 1} of 5 cleared</p>\${starHtml}\${scoreCards}<p class="vocab-next-stage">Next stage unlocked: <strong>\${escapeHtml((nextStage?.label ?? titleCase(completion.nextStageId)).toUpperCase())}</strong></p><div class="vocab-completion-ladder" aria-label="Pathway stage progress">\${renderCompletionLadder(completion)}</div><p class="vocab-completion-support">You’ve secured the \${escapeHtml(clearedStage?.label ?? stageLabel)} stage. Come back later to keep building.</p><div class="vocab-summary-actions"><button class="vocab-button" data-action="back-unit">Finish for now</button><button class="vocab-button vocab-button--primary" data-action="continue-practice">Start \${escapeHtml(nextStage?.label ?? titleCase(completion.nextStageId))} \${renderStudyIcon('arrow')}</button></div></section></main>\`;
    return;
  }

  root.innerHTML = \`<main class="vocab-shell vocab-shell--completion" data-study-accent="\${escapeHtml(identity.accent)}"><section class="vocab-summary-card vocab-summary-card--session study-milestone-card" data-study-completion="session_complete"><div class="vocab-completion-emblem">\${renderStudyIcon(identity.icon,{className:'study-icon--xl'})}</div><p class="vocab-kicker">10-question study session</p><h1>Session complete</h1>\${starHtml}\${scoreCards}\${supportive}\${contextLine}<div class="vocab-summary-actions"><button class="vocab-button" data-action="back-unit">Finish for now</button><button class="vocab-button vocab-button--primary" data-action="continue-practice">Continue</button></div></section></main>\`;
}
`;

const patched = source.replace(pattern,replacement);
if (patched === source) throw new Error('renderSessionSummary patch made no change');
fs.writeFileSync(path,patched);
console.log('Patched renderSessionSummary');
