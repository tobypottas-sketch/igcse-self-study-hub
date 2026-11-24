// Pure catalogue functions: no DOM, authentication, network or persistence dependencies.
export function validateCatalogue(config){
 const fail=message=>{throw new Error('Writing catalogue: '+message)};
 if(!config||typeof config.id!=='string'||!Number.isInteger(config.version)||config.version<1)fail('invalid identity');
 if(!Number.isInteger(config.wordRange?.min)||!Number.isInteger(config.wordRange?.max)||config.wordRange.min<1||config.wordRange.max<config.wordRange.min)fail('invalid word range');
 for(const key of ['categories','tasks','pathways','sections']){
  const entries=config[key];
  if(!Array.isArray(entries)||!entries.length)fail('missing '+key);
  const ids=entries.map(e=>key==='sections'?e:e?.id);
  if(ids.some(id=>typeof id!=='string'||!id.trim())||new Set(ids).size!==ids.length)fail('invalid or duplicate '+key+' IDs');
 }
 const categories=new Set(config.categories.map(c=>c.id));
 for(const t of config.tasks){
  if(!categories.has(t.category)||typeof t.title!=='string'||!t.title.trim()||typeof t.prompt!=='string'||!t.prompt.trim()||!Number.isInteger(t.version)||t.version<1)fail('invalid task '+t.id);
 }
 return config;
}
export function createCatalogue(config){
 validateCatalogue(config);
 const snapshot=JSON.parse(JSON.stringify(config));
 const copy=value=>JSON.parse(JSON.stringify(value));
 return Object.freeze({
  get config(){return copy(snapshot)},
  getTask(id){const task=snapshot.tasks.find(t=>t.id===id);return task?copy(task):null},
  listTasks(category){return copy(snapshot.tasks.filter(t=>category==null||t.category===category))},
  getPathway(id){const pathway=snapshot.pathways.find(p=>p.id===id);return pathway?copy(pathway):null}
 });
}
