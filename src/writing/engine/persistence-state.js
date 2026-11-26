const stableId = /^[a-z0-9][a-z0-9_-]{0,79}$/;
const id = value => typeof value === 'string' && stableId.test(value);
const text = value => typeof value === 'string' && value.length <= 30000;
const object = value => value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
const list = (value, valid) => Array.isArray(value) && value.length <= 200 && Array.from(value).every(valid);
const ids = value => list(value,id) && new Set(value).size === value.length;
const record = (value, valid) => object(value) && Object.keys(value).length <= 200
  && Object.entries(value).every(([key,item]) => id(key) && valid(item));
const fields = (value, rules) => object(value)
  && Object.entries(value).every(([key,item]) => Object.hasOwn(rules,key) && rules[key](item));
const run = value => fields(value,{draft:text, original:text, revision:text, revisionReason:text, checks:ids});
const objective = value => fields(value,{
  currentQuestion: id,
  questions: value => record(value, question => fields(question,{
    displayOrder: ids,
    selection: value => value === null || id(value) || ids(value),
    checked: value => typeof value === 'boolean'
  }) && question.displayOrder?.length > 1 && (
    question.selection == null || [question.selection].flat().every(option => question.displayOrder.includes(option))
  ))
}) && (!value.currentQuestion || Object.hasOwn(value.questions ?? {},value.currentQuestion));
const schema = {
  version: value => value === 1,
  observations: value => record(value,text),
  annotations: value => record(value,ids),
  objective: value => record(value,objective),
  gold: value => record(value,run),
  apply: value => record(value,run),
  master: value => record(value,run),
  planning: value => record(value,text),
  reflections: value => record(value,text),
  checklist: ids
};

export function restoreWritingState(value) {
  if (!object(value) || !Number.isInteger(value.version)) return {ok:false,error:{code:'invalid_payload'}};
  if (value.version !== 1) return {ok:false,error:{code:'version_incompatibility'}};
  if (!fields(value,schema) || new TextEncoder().encode(JSON.stringify(value)).length > 240000) {
    return {ok:false,error:{code:'invalid_payload'}};
  }
  return {ok:true,data:structuredClone(value)};
}

// Accept an explicit snapshot. UI adapters translate their Maps and Sets at the integration boundary.
export function serializeWritingState(snapshot) {
  return restoreWritingState({...snapshot,version:1});
}
