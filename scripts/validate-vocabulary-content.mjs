import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateUnit } from '../content/vocabulary/schema.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const unitsDir = path.join(root, 'content', 'vocabulary', 'units');

async function loadUnit(filePath) {
  if (/\.json$/i.test(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const module = await import(pathToFileURL(filePath).href);
  return module.default;
}

export async function validateFiles(paths) {
  const reports = [];
  for (const filePath of paths) {
    const unit = await loadUnit(filePath);
    const result = validateUnit(unit);
    reports.push({ filePath, unitNumber:unit.unitNumber, status:unit.status, ...result });
  }
  return reports;
}

function discoverUnitFiles() {
  if (!fs.existsSync(unitsDir)) return [];
  return fs.readdirSync(unitsDir)
    .filter(name => /^unit-\d{2}\.(json|js)$/i.test(name))
    .sort()
    .map(name => path.join(unitsDir, name));
}

async function main() {
  const supplied = process.argv.slice(2).map(file => path.resolve(file));
  const paths = supplied.length ? supplied : discoverUnitFiles();
  if (!paths.length) {
    console.error('No vocabulary unit files found.');
    process.exitCode = 1;
    return;
  }

  let blockingErrors = 0;
  for (const report of await validateFiles(paths)) {
    if (report.ok) {
      console.log(`Unit ${report.unitNumber}: ${report.status} — valid for its current lifecycle stage.`);
      continue;
    }
    const prefix = `Unit ${report.unitNumber}: ${report.status}`;
    if (report.status === 'live' || report.status === 'approved') blockingErrors += report.errors.length;
    console.log(`${prefix} — ${report.status === 'live' || report.status === 'approved' ? 'BLOCKED' : 'incomplete draft'}`);
    for (const error of report.errors) console.log(`  - ${error}`);
  }

  if (blockingErrors > 0) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
