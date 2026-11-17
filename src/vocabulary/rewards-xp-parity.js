// Compare the XP students actually see with the read-only server audit.
// Never credit XP from either value. This diagnostic only reports differences.
export const XP_COMPONENTS = Object.freeze([
  'missions','personalBests','weeklyGoals','achievements',
  'stageClears','pathwayMasteries','unitMasteries'
]);
const number = value => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : null;

export function compareRewardsXp(local = null, server = null) {
  if (server?.ok !== true || server?.auditOnly !== true)
    return {status:'unavailable',canFundWallet:false,differences:[]};
  const localTotal=number(local?.total),serverTotal=number(server?.lifetimeXp);
  if(localTotal===null||serverTotal===null)
    return {status:'invalid',canFundWallet:false,differences:[]};
  const differences=[];
  for(const key of XP_COMPONENTS) {
    const client=number(local?.parts?.[key]),serverValue=number(server?.parts?.[key]);
    if(client===null||serverValue===null)
      return {status:'invalid',canFundWallet:false,differences:[]};
    if(client!==serverValue) differences.push({part:key,student:client,server:serverValue});
  }
  if(localTotal!==serverTotal)differences.push({part:'total',student:localTotal,server:serverTotal});
  return {
    status:differences.length?'mismatch':'match',
    canFundWallet:false, // even a match is evidence, never an authorization
    studentTotal:localTotal,serverTotal,differences,
    timezoneSensitive:server?.deterministicComparisons?.timezoneSensitive===true
  };
}
