const UNIT_PATHWAY_OVERRIDES = Object.freeze({
  1:Object.freeze({
    paraphrasing:Object.freeze({ available:false, reason:'content_bank_incomplete' }),
    precision_use:Object.freeze({ available:false, reason:'content_bank_incomplete' })
  })
});

export function pathwayLivePolicy(unitNumber, pathwayId) {
  const unit = UNIT_PATHWAY_OVERRIDES[Number(unitNumber)] ?? null;
  return unit?.[pathwayId] ?? null;
}
