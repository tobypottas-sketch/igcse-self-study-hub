const collator = new Intl.Collator('en', { numeric:true, sensitivity:'base' });

export function classNameParts(value) {
  const name = String(value ?? '').trim();
  const match = name.match(/^G\s*(\d+)\b.*?\b(\d+)\s*$/i);
  if (!match) return { grade:Number.POSITIVE_INFINITY, number:Number.POSITIVE_INFINITY, name };
  return { grade:Number(match[1]), number:Number(match[2]), name };
}

export function compareClassNames(a, b) {
  const left = classNameParts(a);
  const right = classNameParts(b);
  return (left.grade - right.grade) || (left.number - right.number) || collator.compare(left.name, right.name);
}

export function sortClasses(rows = [], getName = row => row?.className ?? row?.name ?? '') {
  return [...rows].sort((a, b) => compareClassNames(getName(a), getName(b)));
}

export function isClassName(value) {
  return Number.isFinite(classNameParts(value).grade);
}
