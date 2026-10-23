// Pre-publish authoring check for a unit file:
//   node scripts/check-unit-authoring.mjs content/vocabulary/units/unit-02.js [--require-live meaning,context,...] [--json]
// Prints which pathways would go live and, for each that would not, the exact number of words that still need content and what
// each is missing. Exits non-zero if the unit is structurally invalid or a pathway named in --require-live would not be live.
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { checkUnitAuthoring, renderAuthoringReport } from '../content/vocabulary/authoring-check.js';

const args = process.argv.slice(2);
const file = args.find(arg => !arg.startsWith('--') && args[args.indexOf(arg) - 1] !== '--require-live');
if (!file) { console.error('Usage: node scripts/check-unit-authoring.mjs <unit-file.js> [--require-live id,id] [--json]'); process.exit(2); }
const requireIndex = args.indexOf('--require-live');
const required = requireIndex >= 0 ? String(args[requireIndex + 1] ?? '').split(',').map(value => value.trim()).filter(Boolean) : [];

const module = await import(pathToFileURL(path.resolve(file)).href);
const report = checkUnitAuthoring(module.default);
console.log(args.includes('--json') ? JSON.stringify(report, null, 2) : renderAuthoringReport(report));
const notLive = required.filter(id => !report.pathways.find(pathway => pathway.pathwayId === id)?.live);
if (notLive.length) console.error(`\nNot live but required: ${notLive.join(', ')}`);
process.exit(report.publishable && !notLive.length ? 0 : 1);
