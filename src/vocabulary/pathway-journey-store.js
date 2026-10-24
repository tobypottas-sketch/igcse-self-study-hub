import { freshPathwayJourney, applyPathwayJourneyAttempt } from './pathway-journey.js';

const byUnit = new Map();

function normalizeJourney(row = {}) {
  return freshPathwayJourney({
    currentStage:row.currentStage ?? row.current_stage ?? 'recognise',
    completedStages:row.completedStages ?? row.completed_stages ?? [],
    stageAttempts:row.stageAttempts ?? row.stage_attempts ?? 0,
    stageCleanSuccesses:row.stageCleanSuccesses ?? row.stage_clean_successes ?? 0
  });
}

export function registerPathwayJourney(unitNumber, rows = []) {
  const unit = Number(unitNumber);
  const next = {};
  for (const row of rows ?? []) {
    const pathwayId = String(row?.pathwayId ?? row?.pathway_id ?? '').trim();
    if (!pathwayId) continue;
    next[pathwayId] = normalizeJourney(row);
  }
  byUnit.set(unit,next);
  return next;
}

export function registeredPathwayJourney(unitNumber) {
  return byUnit.get(Number(unitNumber)) ?? {};
}

export function updateRegisteredPathwayJourney(unitNumber, pathwayId, row = {}) {
  const unit = Number(unitNumber);
  const current = { ...registeredPathwayJourney(unit) };
  current[String(pathwayId)] = normalizeJourney(row);
  byUnit.set(unit,current);
  return current[String(pathwayId)];
}

export function applyRegisteredPathwayJourneyAttempt(unitNumber, pathwayId, attempt = {}) {
  const unit = Number(unitNumber);
  const current = registeredPathwayJourney(unit);
  const previous = current?.[pathwayId] ?? freshPathwayJourney();
  const next = applyPathwayJourneyAttempt(previous,attempt);
  updateRegisteredPathwayJourney(unit,pathwayId,next);
  return next;
}

export function clearPathwayJourney(unitNumber = null) {
  if (unitNumber == null) byUnit.clear();
  else byUnit.delete(Number(unitNumber));
}
