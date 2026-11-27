// Conservative union across every device/module. Clip first; never sum raw duration.
// For module breakdown, overlapping spans need a deterministic attribution policy.
export function unionActiveMilliseconds(intervals,{start=-Infinity,end=Infinity}={}) {
  const spans=intervals.map(x=>[Math.max(start,x.startMs),Math.min(end,x.endMs)])
    .filter(([a,b])=>Number.isFinite(a)&&Number.isFinite(b)&&b>a).sort((a,b)=>a[0]-b[0]);
  let total=0,lo=null,hi=null;
  for(const [a,b] of spans){if(lo===null){lo=a;hi=b;}else if(a<=hi){hi=Math.max(hi,b);}else{total+=hi-lo;lo=a;hi=b;}}
  return total+(lo===null?0:hi-lo);
}
