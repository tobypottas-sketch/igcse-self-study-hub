// The Rewards Shop must confirm that an unequip actually persisted before
// removing a theme from the student UI. Real and sandbox ownership stay separate.
export const REWARD_CATEGORIES=Object.freeze(['themes','frames','badges','titles','effects','avatars']);

export async function persistUnequippedReward({invoke,category,production=false}){
 if(typeof invoke!=='function'||!REWARD_CATEGORIES.includes(category))throw Error('Invalid reward category');
 const fn=production?'vocabulary-reward-production':'vocabulary-reward-sandbox';
 const expected=production?'production':'sandbox';
 const request=await invoke(fn,{body:{action:'unequip',category}});
 if(request?.error||request?.data?.ok!==true)throw Error(request?.data?.error||'Unable to remove equipped reward. Please try again.');
 const first=request.data;
 if(first.shopMode!==expected||(production&&first.purchasesEnabled!==true)||(!production&&first.sandboxEnabled!==true))
  throw Error('The shop returned the wrong reward inventory. No changes have been applied to the display.');
 const stillEquipped=shop=>shop.owned?.some(item=>item.category===category&&item.equipped===true);
 if(!Array.isArray(first.owned)||stillEquipped(first))
  throw Error('The reward is still marked as equipped. Please try again.');
 // A fresh status read verifies the change was saved, not merely displayed.
 const latest=await invoke(fn,{body:{action:'status'}});
 if(latest?.error||latest?.data?.ok!==true||!Array.isArray(latest?.data?.owned))
  throw Error('The reward may have changed, but its saved status could not be verified. Please refresh.');
 if(latest.data.shopMode!==expected||stillEquipped(latest.data))
  throw Error('The reward is still equipped on the server. Please try again.');
 return latest.data;
}
