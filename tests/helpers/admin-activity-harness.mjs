// Renders the REAL admin Student Activity views with the REAL stylesheets against synthetic, anonymised data (no student data).
import { findChromium, loadPlaywright, serve } from './pathway-geometry-harness.mjs';

const IDS = ['meaning', 'context', 'word_families', 'paraphrasing', 'precision_use', 'spelling_recall'];
const STAGES = ['recognise', 'match', 'apply', 'recall', 'mastery'];
const DEMO = `
import { renderAdmin } from '/src/views/admin.js';
const IDS = ${JSON.stringify(IDS)}, STAGES = ${JSON.stringify(STAGES)};
const now = Date.now();
const students = Array.from({ length: 14 }, (_, i) => ({
  studentId: 's' + i, displayName: 'Synthetic Student ' + String.fromCharCode(65 + i), classId: 'c1', className: '9 ESL 1',
  hasStarted: i !== 13, lastActive: new Date(now - i * 86400000).toISOString(), activityThisWeek: i % 6,
  pathways: Object.fromEntries(IDS.map((id, j) => [id, { currentStage: STAGES[(i + j) % 5 === 4 && i % 3 ? 0 : (i * j) % 5] }])),
  unitCheck: i % 3 === 0 ? { attemptsUsed: 2, latestScore: 8, bestScore: 9, rows: [{ attemptNumber: 1, score: 7, maxScore: 10, completedAt: new Date(now - 5 * 86400000).toISOString() }, { attemptNumber: 2, score: 8, maxScore: 10, completedAt: new Date(now - 2 * 86400000).toISOString() }] } : { attemptsUsed: 0, rows: [] },
  pendingMerits: i % 4 === 1 ? 1 : 0, pendingMeritNumbers: i % 4 === 1 ? [1] : [],
  needsAttention: i % 5 === 2, attention: i % 5 === 2 ? [{ label: 'Active but no recent progression' }] : [],
  recentApp: 'Vocabulary', recentPathway: 'Context',
  recentActivity: [{ occurredAt: new Date(now - 86400000).toISOString(), label: 'Completed a mission', appKey: 'vocabulary' }, { occurredAt: new Date(now - 3 * 86400000).toISOString(), label: 'Started Unit Check', appKey: 'vocabulary' }]
}));
const base = { profile: { role: 'teacher', display_name: 'Synthetic Teacher' }, section: 'activity', classes: [{ id: 'c1', className: '9 ESL 1' }], activityDashboard: { students, pendingMerits: 3, needsAttention: 3 } };
window.__show = name => renderAdmin(document.querySelector('#app'), name === 'detail' ? { ...base, selectedStudentId: 's2' } : base);
`;

export async function openActivityDemo({ root, width = 1280, height = 900 }) {
  const playwright = loadPlaywright(); const executablePath = await findChromium();
  if (!playwright || !executablePath) return null;
  const { server: http, origin } = await serve(root);
  const browser = await playwright.chromium.launch({ executablePath });
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/theme.css"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/admin.css"></head><body><main id="app"></main><script type="module" src="/__activity-demo.js"></script></body></html>';
  await page.route('**/__activity-demo.html', route => route.fulfill({ body: html, contentType: 'text/html' }));
  await page.route('**/__activity-demo.js', route => route.fulfill({ body: DEMO, contentType: 'text/javascript' }));
  await page.goto(`${origin}/__activity-demo.html`, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof window.__show === 'function');
  return { page, errors: () => errors, close: async () => { await browser.close(); http.close(); }, show: async name => { await page.evaluate(n => window.__show(n), name); await page.waitForSelector('.admin-panel, .activity-detail-head, .activity-table'); } };
}
