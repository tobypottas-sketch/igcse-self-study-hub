import { loadUnitReadinessContent } from '../vocabulary/teacher-data.js';
import { evaluateUnitReadiness } from '../vocabulary/pathway-readiness.js';
import { coverageFromReadiness } from '../vocabulary/pathway-coverage.js';

const catalogueCache = new WeakMap();
const CACHE_MS = 120_000;

export async function loadReportingCoverage(client, occurrences) {
  const units = [...new Set(occurrences.map(row => row.unitNumber))].sort((a,b) => a-b);
  const signature = JSON.stringify(occurrences.map(row => [row.unitNumber, row.occurrenceId]).sort());
  const cached = catalogueCache.get(client);
  if (cached?.signature === signature && cached.expiresAt > Date.now()) return cached.result;
  const result = (async () => {
    const coverage = {};
    for (let offset = 0; offset < units.length; offset += 3) {
      await Promise.all(units.slice(offset, offset + 3).map(async unit => {
        const content = await loadUnitReadinessContent(client, unit);
        coverage[unit] = coverageFromReadiness(evaluateUnitReadiness({ content }).pathways);
      }));
    }
    return coverage;
  })();
  catalogueCache.set(client, { signature, result, expiresAt:Date.now() + CACHE_MS });
  try {
    return await result;
  } catch (error) {
    if (catalogueCache.get(client)?.result === result) catalogueCache.delete(client);
    throw error;
  }
}
