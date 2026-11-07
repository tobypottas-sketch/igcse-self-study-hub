import { escapeHtml as e } from '../views/html.js';
export const PRACTICE_TASKS = {
  email:{label:'Informal email',task:'Write an email to a friend about a new school club. Explain why you joined, describe an activity you enjoyed, and invite your friend to try it. Write 120–160 words.'},
  article:{label:'Article',task:'Your school magazine wants an article about learning something outside the classroom. Describe an experience, explain what you learned and discuss its value. Write 120–160 words.'},
  report:{label:'Report',task:'Write a report for your headteacher about the school library. Describe its strengths, identify an area to improve and recommend a practical change with reasons. Write 120–160 words.'},
  essay:{label:'Essay',task:'Your class has discussed whether schools should organise more outdoor activities. Write an essay giving your view and supporting it with reasons and examples. Consider another viewpoint. Write 120–160 words.'},
  review:{label:'Review',task:'Write a review of a science museum for your school magazine. Describe the exhibits and atmosphere, explain your opinion with reasons, and recommend a visit or explain why not. Write 120–160 words.'}
};
export function isAssessmentStaff(profile) {
  return profile?.active === true && profile.must_change_password !== true && ['teacher','admin'].includes(profile.role);
}
export function renderAssessor(root, profile) {
  if (!isAssessmentStaff(profile)) {
    root.innerHTML = '<section class="shell"><h1>Staff access required</h1><p>An active teacher or admin account is required.</p><button class="button" data-action="admin-back">Back to Hub</button></section>';
    return false;
  }
  root.innerHTML = `<section class="shell assessor-shell"><header class="admin-header"><div><p class="eyebrow">Teacher tools · Cambridge IGCSE ESL 0511</p><h1>Writing assessor</h1><p class="muted">Experimental Content /6 and Language /9 estimates for teacher review.</p></div><button type="button" class="button button--ghost" data-assessor-back>Back to Hub</button></header>
  <div class="notice assessor-privacy"><strong>Use anonymised writing only.</strong> Remove names, email addresses, candidate numbers and other identifying details from both boxes. The Hub does not save drafts or results. Writing is processed by Cloudflare AI. Clear the screen before sharing your device.</div>
  <form class="admin-card form-stack assessor-form" data-assessor-form autocomplete="off">
    <div class="assessor-task-controls"><label for="assessor-practice">Original practice task (optional)<select id="assessor-practice" data-assessor-practice><option value="">Enter your own task</option>${Object.entries(PRACTICE_TASKS).map(([key,value])=>`<option value="${key}">${e(value.label)} practice task</option>`).join('')}</select></label>
    <label for="assessor-type">Writing type<select id="assessor-type" name="taskType">${Object.entries(PRACTICE_TASKS).map(([key,value])=>`<option value="${key}">${e(value.label)}</option>`).join('')}</select></label></div>
    <label for="assessor-task">Writing task<textarea id="assessor-task" name="task" rows="4" required minlength="10" maxlength="3000" spellcheck="false" autocomplete="off" placeholder="Include the task points, intended audience and purpose."></textarea></label>
    <label for="assessor-response">Anonymised response<textarea id="assessor-response" name="response" rows="9" required minlength="4" maxlength="6000" spellcheck="false" autocomplete="off" aria-describedby="assessor-length"></textarea></label>
    <p class="muted" id="assessor-length">Exam target: 120–160 words. Shorter or longer drafts can be reviewed; word count is not an automatic deduction. Limit: 6,000 characters per response.</p>
    <label class="assessor-consent"><input type="checkbox" name="privacyConfirmed" required> I have removed identifying details and am authorised to submit this anonymised writing for AI processing.</label>
    <div class="admin-actions"><button class="button button--primary" type="submit">Assess writing</button><button class="button" type="button" data-assessor-clear>Clear writing and feedback</button></div>
    <p class="muted">Two AI calls per assessment. The shared Cloudflare Free allowance is limited; there are no automatic retries.</p>
  </form><p data-assessor-status role="status" aria-live="polite"></p><section data-assessor-result aria-live="polite"></section>
  <p class="muted assessor-criteria">Uses the 0511 writing criteria: Content—task fulfilment and development; Language—range, accuracy and organisation. Estimates require teacher judgement, not automatic acceptance. <a href="https://www.cambridgeinternational.org/Images/637270-2024-specimen-paper-1-mark-scheme.pdf" target="_blank" rel="noopener noreferrer">Cambridge specimen criteria</a>.</p></section>`;
  return true;
}
const PARTIAL_NOTICE = 'Specific feedback could not be verified for this response. Please ask your teacher to review it.';
export function renderAssessmentResult(root, result) {
  const LABELS = { error:['Language error', 'Correction'], style:['Optional style suggestion', 'Example revision (one possible way)'] };
  const item = value => {
    const [tag, suggestionLabel] = (Object.hasOwn(LABELS, value.type) ? LABELS[value.type] : [null, 'Example']);
    return `<li>${tag ? `<p class="assessor-tag"><strong>${e(tag)}</strong></p>` : ''}<blockquote>${e(value.quote)}</blockquote><p>${e(value.advice)}</p>${typeof value.suggestion === 'string' && value.suggestion ? `<p class="assessor-suggestion"><strong>${e(suggestionLabel)}:</strong> ${e(value.suggestion)}</p>` : ''}</li>`;
  };
  const points = (title, values) => `<section class="admin-card"><h3>${title}</h3>${values.length ? `<ul>${values.map(item).join('')}</ul>` : '<p class="muted">None identified with verified evidence.</p>'}</section>`;
  const scores = `<div class="assessor-scores">${[['Content',result.contentMark,6],['Language',result.languageMark,9],['Total',result.totalMark,15]].map(([label,value,max])=>`<dl class="admin-card"><dt>${label}</dt><dd>${e(value)} <small>/ ${max}</small></dd></dl>`).join('')}</div>`;
  const reasons = `<section class="admin-card"><h3>Content</h3><p>${e(result.contentReason)}</p><h3>Language</h3><p>${e(result.languageReason)}</p></section>`;
  if (result.feedbackVerified === false) {
    // Partial result: marks and verified evidence only. The notice is fixed text and never implies the student made no mistakes.
    const evidence = (Array.isArray(result.verifiedEvidence) ? result.verifiedEvidence : []).filter(item => typeof item?.quote === 'string');
    root.innerHTML = `<div class="assessor-result"><h2>Assessment estimate (pending teacher review)</h2>${scores}<section class="admin-card assessor-unverified" role="alert"><h3>Feedback not verified</h3><p>${e(PARTIAL_NOTICE)}</p></section><div class="assessor-feedback">${reasons}${evidence.length ? `<section class="admin-card"><h3>Verified evidence from the response</h3><ul>${evidence.map(item => `<li><blockquote>${e(item.quote)}</blockquote></li>`).join('')}</ul></section>` : ''}</div><p class="notice">Experimental estimate, pending teacher review. Not a Cambridge examiner grade.</p></div>`;
    return;
  }
  root.innerHTML = `<div class="assessor-result"><h2>Assessment estimate</h2>${scores}<div class="assessor-feedback">${reasons}${points('Strengths',result.strengths)}${points('Improvements',result.improvements)}</div>${typeof result.nextStep === 'string' && result.nextStep.trim() ? `<section class="admin-card"><h3>Your writing target</h3><p>${e(result.nextStep)}</p></section>` : ''}<p class="notice">${e(result.warning ?? 'Experimental teacher-only estimate; review before using.')}</p></div>`;
}
