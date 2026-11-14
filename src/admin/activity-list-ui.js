// Scoped, bounded presentation of the staff Activity roster.
// Does not alter database queries, merit decisions or attention criteria.
export const ACTIVITY_PAGE_SIZE = 10;
export const newActivityListState = () => ({ search:'', classId:'all', state:'attention', limit:ACTIVITY_PAGE_SIZE });

export function applyActivityListFilters(root, filters = newActivityListState()) {
  const table = root?.querySelector?.('.activity-table');
  if (!table) return { matching:0, showing:0 };
  const search=String(filters.search??'').trim().toLowerCase();
  const classId=filters.classId??'all';
  const state=filters.state??'attention';
  const limit=Math.max(ACTIVITY_PAGE_SIZE,Math.floor(Number(filters.limit)||ACTIVITY_PAGE_SIZE));
  let matching=0,showing=0;
  const visibleClasses=new Set();
  for(const row of table.querySelectorAll('[data-activity-row]')) {
    const classOk=classId==='all'||row.dataset.classId===classId;
    const stateOk=state==='all'
      ||(state==='attention'&&row.dataset.needsAttention==='true')
      ||(state==='merits'&&row.dataset.newMerits==='true')
      ||(state==='started'&&row.dataset.started==='true')
      ||(state==='notstarted'&&row.dataset.started==='false');
    const searchOk=!search||String(row.dataset.studentName??'').includes(search);
    const matches=classOk&&stateOk&&searchOk;
    if(matches) matching++;
    const show=matches&&showing<limit;
    row.hidden=!show;
    if(show){showing++;visibleClasses.add(row.dataset.classId??'');}
  }
  table.dataset.singleClass=visibleClasses.size<=1?'true':'false';
  const count=root.querySelector('[data-activity-list-count]');
  if(count)count.textContent=matching?'Showing '+showing+' of '+matching+' students':'No matching students';
  const more=root.querySelector('[data-action="activity-show-more"]');
  if(more){
    more.hidden=showing>=matching;
    more.textContent='Show next '+Math.min(ACTIVITY_PAGE_SIZE,matching-showing)+' students';
  }
  const empty=root.querySelector('[data-activity-list-empty]');
  if(empty){
    empty.hidden=matching!==0;
    empty.textContent=state==='attention'&&!search?'No students currently need attention in this selection.':'No students match these filters.';
  }
  return {matching,showing};
}
