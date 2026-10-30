// Renders the REAL teacher/admin views with the REAL stylesheets against synthetic, anonymised classroom data (no student data) so the
// layout can be measured and screenshotted at desktop and phone widths.
import { findChromium, loadPlaywright, serve } from './pathway-geometry-harness.mjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const PATHWAY_IDS = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
const NAMES = ['Student A', 'Student B', 'Student C', 'Student D', 'Student E', 'Student F', 'Student G', 'Student H', 'Student I', 'Student J', 'Student K', 'Student L', 'Student M', 'Student N'];

export const DEMO_MODULE = `
import { renderTeacherOverview, renderStudentVocabularyProfile, renderProblemArea } from '/src/vocabulary/teacher-views.js';
import { renderReadinessReport, buildReadinessReport } from '/src/vocabulary/teacher-readiness.js';
import { buildPracticeHabits } from '/src/vocabulary/practice-habits.js';
const IDS = ${JSON.stringify(PATHWAY_IDS)}, STAGES = ${JSON.stringify(STAGES)};
const names = ${JSON.stringify(NAMES)};
const pathways = (i) => Object.fromEntries(IDS.map((id, j) => { const s = (i + j) % 6; return [id, id === 'paraphrasing' ? { available:false } : { currentStage:STAGES[Math.min(4, s)], mastered:s === 5, needsPractice:(i * 3 + j) % 7 === 0 }]; }));
const students = names.map((displayName, i) => ({ id:'s' + i, displayName }));
const now = new Date();
const days = n => new Date(now.getTime() - n * 86400000).toISOString();
const missions = students.flatMap((s, i) => i % 5 === 4 ? [] : Array.from({ length:(i % 4) + 1 }, (_, k) => ({ studentId:s.id, completedAt:days(k + (i % 3)) })));
const habits = { available:true, ...buildPracticeHabits({ students, missions, activity:[], now }) };
const insights = {
  studentsNeedingAttention:students.slice(0, 5).map((s, i) => ({ studentId:s.id, displayName:s.displayName, targetCount:6 - i })),
  mainWeakness:{ skillId:null, strand:'context', problemType:'skill', affectedCount:6, summary:'6 students need more context evidence.' },
  difficultWords:['tournament', 'opponent', 'determined', 'discipline', 'regret'].map((term, i) => ({ term, affectedCount:6 - i })),
  misconceptionPatterns:[{ code:'changes_meaning', label:'Changed the meaning', count:9 }, { code:'wrong_form', label:'Wrong word form', count:6 }],
  skillProfile:{ skills:{ a:{ label:'Choose the right word', status:'Secure', evidenceCount:12 }, b:{ label:'Use words in context', status:'Developing', evidenceCount:9 }, c:{ label:'Paraphrase accurately', status:'Needs attention', evidenceCount:7 } } },
  engagement:{ practisedRecently:10, notRecentlyPractised:4 }, trend:{ label:'Improving', improvedCount:7 },
  pathwayAnalytics:{ studentRows:students.map((s, i) => ({ studentId:s.id, displayName:s.displayName, pathways:pathways(i) })), wordRows:[] }
};
const merits = { available:true, skillsPerMerit:10, rows:[{ studentId:'s1', displayName:'Student B', skillsPassed:12, earned:1, pendingNumbers:[1] }, { studentId:'s3', displayName:'Student D', skillsPassed:21, earned:2, pendingNumbers:[1, 2] }] };
const units = { options:[{ unitNumber:1, unitTitle:'Sports and Free Time' }, { unitNumber:2, unitTitle:'Digital Life' }], selected:1, selectedTitle:'Sports and Free Time' };
const profile = { displayName:'Student C', lastPractice:'2 days ago', strongestSkill:null, strongestStrand:'meaning', developmentSkill:null, developmentArea:'context', strands:{ meaning:'secure', recognition:'building', context:'needs attention', paraphrasing:'building', production:'building' },
  persistentTargets:[{ term:'tournament', status:'needs_attention' }, { term:'opponent', status:'building' }, { term:'discipline', status:'building' }], skillProfile:insights.skillProfile, misconceptionPatterns:insights.misconceptionPatterns, pathways:pathways(2) };
const readinessRow = (live, counts) => ({ live, stageCounts:counts, stageMinimums:{ recognise:12, match:12, apply:12, recall:12, mastery:12 }, stageReview:{}, missing:live ? [] : [{ kind:'stage', stage:'mastery' }], reason:live ? null : 'stage_below_minimum', servedCount:live ? 48 : 0 });
const full = { recognise:50, match:48, apply:50, recall:50, mastery:50 };
const readiness = { expectedWords:50, pathways:{ meaning:readinessRow(true, full), context:readinessRow(true, full), word_families:readinessRow(true, { recognise:29, match:35, apply:37, recall:37, mastery:29 }), paraphrasing:readinessRow(false, { recognise:12, match:12, apply:24, recall:12, mastery:6 }), precision_use:readinessRow(true, full), spelling_recall:readinessRow(true, full) }, authoring:null };
window.__show = name => {
  const root = document.querySelector('#vocabularyApp');
  if (name === 'overview') renderTeacherOverview(root, { className:'Class A', insights, merits, habits, units });
  else if (name === 'profile') renderStudentVocabularyProfile(root, { className:'Class A', profile, habit:habits.rows[2] });
  else if (name === 'problem') renderProblemArea(root, { className:'Class A', drilldown:{ strand:'context', affectedStudents:students.slice(0, 6), words:insights.difficultWords.map(r => ({ term:r.term, affectedCount:r.affectedCount })), failureTypes:[{ label:'Changed the meaning', count:9 }] } });
  else if (name === 'readiness') renderReadinessReport(root, { options:[{ unitNumber:1 }], selected:1, title:'Sports and Free Time', report:buildReadinessReport({ readiness, publishedWords:50 }) });
  else if (name === 'readiness-broken') renderReadinessReport(root, { options:[{ unitNumber:1 }], selected:1, title:'Sports and Free Time', report:buildReadinessReport({ readiness, publishedWords:44 }) });
  window.__shown = name;
};
`;

export async function openTeacherDemo({ root, width = 1280, height = 900 }) {
  const playwright = loadPlaywright(); const executablePath = await findChromium();
  if (!playwright || !executablePath) return null;
  const { server: http, origin } = await serve(root);
  const browser = await playwright.chromium.launch({ executablePath });
  const page = await browser.newPage({ viewport:{ width, height } });
  page.on('pageerror', error => { (page.__errors ??= []).push(error.message); });
  const html = (await readFile(path.join(root, 'vocabulary.html'), 'utf8')).replace(/<script type="module"[^>]*><\/script>/g, '') .replace('</body>', '<script type="module" src="/__teacher-demo.js"></script></body>');
  await page.route('**/__teacher-demo.html', route => route.fulfill({ body:html, contentType:'text/html' }));
  await page.route('**/__teacher-demo.js', route => route.fulfill({ body:DEMO_MODULE, contentType:'text/javascript' }));
  await page.goto(`${origin}/__teacher-demo.html`, { waitUntil:'load' });
  await page.waitForFunction(() => typeof window.__show === 'function');
  return {
    page, errors:() => page.__errors ?? [],
    close:async () => { await browser.close(); http.close(); },
    show:async name => { await page.evaluate(n => window.__show(n), name); await page.waitForSelector('.vocab-shell'); }
  };
}
