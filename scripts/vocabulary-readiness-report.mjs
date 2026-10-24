// Prints which pathways are live or locked for every release file, using the same evaluator the app uses.
//   node scripts/vocabulary-readiness-report.mjs
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { releaseReadinessReports } from '../content/vocabulary/readiness-report.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'content', 'vocabulary', 'releases');
const releases = [];
for (const file of fs.readdirSync(root).filter(name => name.endsWith('.js')).sort()) {
  releases.push((await import(pathToFileURL(path.join(root, file)).href)).default);
}
for (const report of releaseReadinessReports(releases)) {
  console.log(`Unit ${report.unitNumber}: ${report.publishedWords}/${report.expectedWords} words, ${report.live} of ${report.rows.length} pathways live`);
  for (const row of report.rows) console.log(`  ${row.live ? 'LIVE  ' : 'LOCKED'} ${row.label.padEnd(18)} ${row.reason}`);
}
