import { escapeHtml } from '../views/html.js';
import { fetchAllRows } from './teacher-paging.js';
import { VOCABULARY_PATHWAYS } from './pathway-model.js';

// Read-only and student-scoped. Counting answered attempts includes retries, which are labelled as attempts.
// Exact HEAD counts avoid the PostgREST 1,000-row cap; active seconds are paged and summed.
export async function loadStudentVocabularyProgress(client, userId, { preview=false }={}) {
  if (preview) return { attempts:null, activeSeconds:null, attemptsAvailable:false, timeAvailable:false, preview:true };
  if (!userId) throw new Error('Student identity is required.');
  const countQuery=client.from('activity_events')
    .select('id',{count:'exact',head:true})
    .eq('user_id',userId).eq('app_key','vocabulary_paraphrase').eq('event_type','question_attempt');
  const attemptsRequest=Promise.resolve(countQuery).then(({count,error})=>{
    if(error || !Number.isInteger(count)) throw new Error('Question history unavailable.');
    return count;
  });
  const timeRequest=fetchAllRows(()=>client.from('activity_events')
    .select('id,active_seconds',{count:'exact'})
    .eq('user_id',userId).eq('app_key','vocabulary_paraphrase').eq('event_type','active_time')
    .order('id'),{label:'active practice time'}).then(rows=>
      rows.reduce((total,row)=>total+Math.max(0,Number(row.active_seconds)||0),0));
  const [attempts,time]=await Promise.allSettled([attemptsRequest,timeRequest]);
  return {
    attempts:attempts.status==='fulfilled'?attempts.value:null,
    attemptsAvailable:attempts.status==='fulfilled',
    activeSeconds:time.status==='fulfilled'?time.value:null,
    timeAvailable:time.status==='fulfilled',
    preview:false
  };
}
const FIVE_STAGES=['recognise','match','apply','recall','mastery'];
// Only persisted, consecutively cleared pathway stages count; legacy inferred placement is not a completion.
function persistedCompletions(row,pathwayId) {
  const detail=row?.contextual_evidence ?? row?.contextualEvidence ?? {};
  const progress=(detail.pathwayProgress ?? detail.pathway_progress ?? {})[pathwayId];
  if(!progress)return 0;
  const completed=Array.isArray(progress.completedStages) ? progress.completedStages
    : Array.isArray(progress.completed_stages) ? progress.completed_stages
    : FIVE_STAGES.filter(stage=>progress.stages?.[stage]?.completed===true);
  let cleared=0;
  for(const stage of FIVE_STAGES){
    if(!completed.includes(stage))break;
    cleared++;
  }
  return cleared;
}
export function summariseVocabularyProgress({dashboard={},missions=[],engagement=null,recorded={}}={}) {
  const rows=dashboard.global ?? [];
  const wordsMastered=rows.filter(row=>row.status==='mastered').length;
  const unitRows=Object.fromEntries((dashboard.unit??[]).map(row=>[row.occurrence_id,row]));
  const pathwayCount=Object.fromEntries(VOCABULARY_PATHWAYS.map(pathway=>[pathway.id,{label:pathway.label,cleared:0,total:0,wordsProgressing:0,wordCount:0}]));
  for(const occurrence of dashboard.occurrences??[]) {
    for(const pathway of VOCABULARY_PATHWAYS){
      const cleared=persistedCompletions(unitRows[occurrence.occurrence_id],pathway.id);
      pathwayCount[pathway.id].total+=5;
      pathwayCount[pathway.id].wordCount+=1;
      pathwayCount[pathway.id].cleared+=cleared;
      if(cleared>0) pathwayCount[pathway.id].wordsProgressing+=1;
    }
  }
  const completedMissions=missions.length;
  const available=Number.isFinite(recorded?.attempts)&&recorded.attemptsAvailable!==false;
  const timeAvailable=Number.isFinite(recorded?.activeSeconds)&&recorded.timeAvailable!==false;
  const achievementsTotal=engagement?.achievementsTotal??null;
  return {
    attempts:available?recorded.attempts:null,
    activeSeconds:timeAvailable?recorded.activeSeconds:null,
    wordsMastered,
    completedMissions,
    weekly:engagement?.weekly ?? null,
    achievementsUnlocked:engagement?.achievementsUnlocked??null,
    achievementsTotal,
    pathways:VOCABULARY_PATHWAYS.map(pathway=>({
      id:pathway.id,...pathwayCount[pathway.id],
      percent:pathwayCount[pathway.id].wordCount?Math.round(100*pathwayCount[pathway.id].wordsProgressing/pathwayCount[pathway.id].wordCount):0
    }))
  };
}

// Demo numbers live ONLY in the staff-preview branch of the controller. Never load,
// persist, or merge them into a real student's evidence, engagement, or mastery.
export function sampleVocabularyProgress() {
  const examples=[
    [23,40,56],[18,40,41],[15,40,30],[12,40,22],[9,40,17],[26,40,64]
  ];
  return {
    demo:true,attempts:1248,activeSeconds:12*3600+35*60,wordsMastered:84,
    completedMissions:19,weekly:{done:3,goal:4},
    achievementsUnlocked:6,achievementsTotal:14,
    pathways:VOCABULARY_PATHWAYS.map((pathway,index)=>{
      const [wordsProgressing,wordCount,cleared]=examples[index];
      return {id:pathway.id,label:pathway.label,wordsProgressing,wordCount,cleared,
        total:wordCount*5,percent:Math.round(100*wordsProgressing/wordCount)};
    })
  };
}

function niceDuration(seconds) {
  if (seconds==null) return 'Unavailable';
  const totalMinutes=Math.floor(seconds/60);
  if(totalMinutes<60) return totalMinutes+' min';
  const hours=Math.floor(totalMinutes/60), minutes=totalMinutes%60;
  return hours+' hr'+(minutes?' '+minutes+' min':'');
}
function count(value) { return value==null?'Unavailable':Number(value).toLocaleString('en-GB'); }
function stat(icon,label,value,foot,tone) {
  return '<article class="vocab-journey-stat" data-tone="'+tone+'"><span class="vocab-journey-stat__icon" aria-hidden="true">'+icon+'</span>'+
    '<strong>'+escapeHtml(value)+'</strong><span>'+escapeHtml(label)+'</span><small>'+escapeHtml(foot)+'</small></article>';
}
export function renderStudentVocabularyProgress(root, {summary,displayName='',preview=false}={}) {
  const s=summary??{};
  const week=s.weekly;
  const cards=[
    stat('✎','Question attempts',count(s.attempts),'Includes retries · recorded history','blue'),
    stat('✓','Words mastered',count(s.wordsMastered),'Current global mastery','mint'),
    stat('◷','Active practice',niceDuration(s.activeSeconds),'Recorded active time; may omit short intervals','violet'),
    stat('★','Achievements',s.achievementsUnlocked==null?'Unavailable':s.achievementsUnlocked+' / '+s.achievementsTotal,'Existing Hub achievements','amber')
  ].join('');
  const pathways=(s.pathways??[]).map(p=>'<div class="vocab-journey-pathway">'+
    '<div class="vocab-journey-pathway__head"><strong>'+escapeHtml(p.label)+'</strong><span>'+
    escapeHtml(count(p.wordsProgressing))+' words progressing <span aria-hidden="true">·</span> '+escapeHtml(count(p.cleared))+' stages completed</span></div>'+
    '<div class="vocab-journey-pathway__track" role="progressbar" aria-label="'+escapeHtml(p.label)+' words with at least one completed stage" aria-valuemin="0" aria-valuemax="'+p.wordCount+'" aria-valuenow="'+p.wordsProgressing+'"><span style="width:'+p.percent+'%"></span></div></div>').join('');
  root.innerHTML='<main class="vocab-shell vocab-shell--journey" data-vocabulary-progress>'+
    '<header class="vocab-topbar"><button type="button" class="vocab-back vocab-back--chip" data-action="progress-back-home">← All units</button>'+
    '<span class="vocab-topbar__course">Cambridge IGCSE ESL 0511</span></header>'+
    '<section class="vocab-journey-hero"><p class="vocab-kicker">MY VOCABULARY JOURNEY</p>'+
    '<h1>Your <em>Vocabulary Journey</em></h1><p>'+escapeHtml(preview?'Explore what a student progress dashboard could look like.':displayName?displayName+', here is what your recorded practice shows.':'Here is what your recorded practice shows.')+'</p></section>'+
    (preview?'<p class="vocab-journey-note"><strong>DEMONSTRATION DATA</strong> — All figures on this screen are fictional examples for staff review, not any student’s results.</p>':'')+
    '<section class="vocab-journey-stats" aria-label="Vocabulary progress statistics">'+cards+'</section>'+
    '<section class="vocab-journey-panels"><article class="vocab-journey-panel"><div class="vocab-journey-panel__head"><span>THIS WEEK</span><h2>Keep the momentum</h2></div>'+
    '<div class="vocab-journey-week"><strong>'+escapeHtml(week?week.done+' / '+week.goal:'Unavailable')+
    '</strong><span>Missions towards your weekly goal</span></div>'+
    '<div class="vocab-journey-week__dots" aria-label="Weekly goal progress">'+Array.from({length:week?.goal??0},(_,i)=>'<span'+(i<week.done?' class="is-done"':'')+'></span>').join('')+'</div>'+
    '<p class="vocab-journey-sub">Completed missions recorded: '+escapeHtml(count(s.completedMissions))+'</p></article>'+
    '<article class="vocab-journey-panel"><div class="vocab-journey-panel__head"><span>LEARNING PATHWAYS</span><h2>Building your vocabulary</h2></div>'+
    '<p class="vocab-journey-sub">Words progressing have completed at least one stage in that pathway. The bars show the share of available words with recorded progress; stage totals show how much practice has been completed.</p>'+
    '<div class="vocab-journey-pathways">'+pathways+'</div></article></section>'+
    '<p class="vocab-journey-footnote">'+(preview?'Demonstration figures only. Nothing here is taken from a student or recorded to the Hub.':'Question attempts and practice time reflect recorded Vocabulary activity since tracking began in October 2026. These are engagement measures, not exam grades. Missing history is shown as unavailable.')+'</p>'+
    '</main>';
}