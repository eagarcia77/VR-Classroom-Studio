(()=>{
const G=id=>document.getElementById(id);
const esc33=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV33(){state.version=33;state.v33=state.v33||{guidedMode:true,previewedAt:null,previewSignature:null,lastScanAt:null}}
ensureV33();
const main=document.querySelector('main.workspace');if(!main)return;

const card=document.createElement('section');card.className='v33-shell';card.id='guidedImmersiveBuilderCard';
card.innerHTML=`
<div class="v33-head">
 <div><h2>Guided Immersive Course Builder <span class="v6-badge">V33</span></h2><p>One guided path from learning objectives to a Blackboard-ready immersive SCORM package.</p></div>
 <div class="v33-actions"><button class="btn" id="v33Toggle">Guided mode</button><button class="btn" id="v33Scan">Refresh readiness</button><button class="btn primary" id="v33NextTop">Continue</button></div>
</div>
<div class="v33-progress"><span id="v33ProgressBar"></span></div><div class="v33-progress-meta"><span id="v33ProgressLabel"></span><span id="v33ReadyLabel"></span></div>
<div id="v33Steps" class="v33-grid"></div>
<div id="v33Next" class="v33-next"></div>`;
const topgrid=main.querySelector('.topgrid');if(topgrid)topgrid.insertAdjacentElement('beforebegin',card);else main.insertBefore(card,main.firstChild);

const mini=document.createElement('div');mini.id='v33Mini';mini.className='v33-mini';document.body.appendChild(mini);
const nav=document.querySelector('aside .nav');if(nav){const b=document.createElement('button');b.innerHTML='✓ Guided Course Builder <span class="badge">V33</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.insertBefore(b,nav.firstElementChild?.nextSibling||null)}

function objectiveText(o,i){return typeof o==='string'?o:(o?.text||o?.title||('Objective '+(i+1)))}
function objectives(){return(state.objectives||[]).map((o,i)=>({index:i,text:objectiveText(o,i)})).filter(o=>String(o.text).trim())}
function requiredStations(){return(state.stations||[]).filter(s=>s.required)}
function stationObjective(s){
 if(s?.objectiveIndex!=null&&Number.isFinite(Number(s.objectiveIndex)))return Number(s.objectiveIndex);
 const c=(state.competencies||[]).find(x=>(x.stationIds||[]).some(id=>String(id)===String(s?.id))&&(x.objectiveIndexes||[]).length);return c?Number(c.objectiveIndexes[0]):null
}
function questionObjective(q){
 if(q?.objectiveIndex!=null&&Number.isFinite(Number(q.objectiveIndex)))return Number(q.objectiveIndex);
 const s=(state.stations||[]).find(x=>String(x.id)===String(q?.stationId)),so=stationObjective(s);if(so!=null)return so;
 const c=(state.competencies||[]).find(x=>(x.questionIds||[]).some(id=>String(id)===String(q?.id))&&(x.objectiveIndexes||[]).length);return c?Number(c.objectiveIndexes[0]):null
}
function assessmentSnapshot(){
 const items=[];
 (state.stations||[]).forEach(s=>{const pts=Number(s.points||0);if(pts>0)items.push({kind:'station',id:s.id,points:pts,objectiveIndex:stationObjective(s),stationId:s.id})});
 (state.questions||[]).forEach(q=>{const pts=Number(q.points||0);if(pts>0)items.push({kind:'question',id:q.id,points:pts,objectiveIndex:questionObjective(q),stationId:q.stationId})});
 const dups=(state.stations||[]).filter(s=>Number(s.points||0)>0&&(state.questions||[]).some(q=>String(q.stationId)===String(s.id)&&Number(q.points||0)>0));
 const total=items.reduce((a,x)=>a+x.points,0),unmapped=items.filter(x=>x.objectiveIndex==null),objs=objectives(),missing=objs.filter(o=>!items.some(x=>Number(x.objectiveIndex)===o.index));
 return{items,total,dups,unmapped,missing}
}
function spatialSnapshot(){
 const objs=state.objects||[],sts=requiredStations();
 const missing=sts.filter(st=>{if(st.performanceTaskId)return !objs.some(o=>String(o.performanceTaskId)===String(st.performanceTaskId));return !objs.some(o=>o.type==='station'&&String(o.stationId)===String(st.id))});
 const empty=(state.scenes||[]).filter(sc=>!objs.some(o=>String(o.sceneId)===String(sc.id))&&!state.stations?.some(st=>String(st.sceneId)===String(sc.id)));
 return{missing,empty}
}
function reviewSnapshot(){
 const issues=[];
 if(state.v26?.lastForge&&!state.v26.lastForge.reviewedAt)issues.push('Immersive world');
 if(state.v27?.lastCompile&&!state.v27.lastCompile.reviewedAt)issues.push('Instructional twin');
 const pt=(state.performanceTasks||[]).filter(t=>!t.reviewedAt);if(pt.length)issues.push(pt.length+' performance task'+(pt.length===1?'':'s'));
 return issues
}
function signature(){
 const slim={
  title:state.title,passing:state.passing,
  objectives:objectives().map(x=>x.text),
  scenes:(state.scenes||[]).map(x=>[x.id,x.name]),
  stations:(state.stations||[]).map(x=>[x.id,x.sceneId,x.points,x.required,x.objectiveIndex,x.performanceTaskId]),
  questions:(state.questions||[]).map(x=>[x.id,x.stationId,x.points,x.type,x.objectiveIndex]),
  objects:(state.objects||[]).map(x=>[x.id,x.sceneId,x.type,x.stationId,x.targetSceneId,x.performanceTaskId]),
  tasks:(state.performanceTasks||[]).map(x=>[x.id,x.type,x.sceneId,x.stationId,x.points,x.reviewedAt])
 };
 const str=JSON.stringify(slim);let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(16)
}
function latestV19Pass(){
 const t=state.v19LastTest;if(!t)return false;const tests=t.tests||[];return tests.length>0&&!tests.some(x=>x.level==='fail')
}
function latestV20Pass(){
 const r=state.v20?.testRuns?.[0];if(!r)return false;return(r.tests||[]).length>0&&!r.tests.some(x=>x.level==='fail')
}
function actionScroll(id){return()=>G(id)?.scrollIntoView({behavior:'smooth',block:'start'})}
function stepData(){
 const objs=objectives(),req=requiredStations(),sp=spatialSnapshot(),ass=assessmentSnapshot(),reviews=reviewSnapshot();
 const mappedObjectives=objs.filter(o=>req.some(s=>Number(stationObjective(s))===o.index));
 const worldReady=(state.scenes||[]).length>0&&objs.length>0&&mappedObjectives.length===objs.length;
 const logicReady=(state.questions||[]).length>0||(state.performanceTasks||[]).length>0;
 const assessmentReady=ass.items.length>0&&!ass.dups.length&&!ass.unmapped.length&&!ass.missing.length;
 const accessReady=state.v18Settings?.alternativeMode===true&&state.v18Settings?.keyboardActivation===true;
 const previewCurrent=!!state.v33.previewedAt&&state.v33.previewSignature===signature();
 const v19=latestV19Pass(),v20=latestV20Pass(),rcOk=!state.v20?.requireReleaseCandidate||!!state.v20?.releaseCandidate;
 const steps=[
  {id:'foundation',title:'1. Learning foundation',ready:objs.length>0,detail:objs.length?objs.length+' learning objective(s) defined.':'Add at least one measurable learning objective.',action:actionScroll('objectivesCard'),label:'Objectives'},
  {id:'world',title:'2. Immersive world',ready:worldReady,detail:worldReady?(state.scenes||[]).length+' scene(s) with objective-linked evidence.':'Forge or map required evidence for every objective.',action:actionScroll('immersiveLessonForgeCard'),label:'Build world'},
  {id:'spatial',title:'3. Spatial authoring',ready:worldReady&&!sp.missing.length&&!sp.empty.length,detail:sp.missing.length?sp.missing.length+' required station(s) are not represented spatially.':sp.empty.length?sp.empty.length+' scene(s) are empty.':'Required evidence is represented in the 3D world.',action:actionScroll('live3DEditorCard'),label:'3D Builder'},
  {id:'logic',title:'4. Instructional logic',ready:logicReady,detail:logicReady?((state.questions||[]).length+' question(s) · '+(state.performanceTasks||[]).length+' performance task(s).'):'Compile assessments/guidance or create an authentic performance task.',action:actionScroll('instructionalDigitalTwinCard'),label:'Compile'},
  {id:'assessment',title:'5. Assessment blueprint',ready:assessmentReady,detail:!ass.items.length?'No scored evidence.':ass.dups.length?ass.dups.length+' duplicate-score risk(s).':ass.unmapped.length?ass.unmapped.length+' unmapped scored item(s).':ass.missing.length?ass.missing.length+' objective(s) lack scored evidence.':'All scored evidence maps cleanly to objectives · '+ass.total+' total points.',action:actionScroll('assessmentBlueprintCard'),label:'Scoring'},
  {id:'access',title:'6. Accessible learner experience',ready:accessReady,detail:accessReady?'Accessible 2D alternative and keyboard activation are enabled.':'Enable equivalent non-VR access and keyboard activation.',action:actionScroll('accessibilityQualityCard'),label:'Accessibility'},
  {id:'review',title:'7. Instructor review',ready:reviews.length===0,detail:reviews.length?'Needs review: '+reviews.join(', ')+'.':'Generated instructional content is instructor-reviewed.',action:()=>{if(state.v26?.lastForge&&!state.v26.lastForge.reviewedAt)return actionScroll('immersiveLessonForgeCard')();if(state.v27?.lastCompile&&!state.v27.lastCompile.reviewedAt)return actionScroll('instructionalDigitalTwinCard')();return actionScroll('authenticPerformanceTasksCard')()},label:'Review'},
  {id:'preview',title:'8. Student preview',ready:previewCurrent,detail:previewCurrent?'Current authoring state was previewed as a student.':state.v33.previewedAt?'Project changed after the last preview; preview again.':'Preview the current learner experience at least once.',action:()=>G('previewBtn')?.click(),label:'Preview'},
  {id:'qa1',title:'9. SCORM package QA',ready:v19,detail:v19?'Latest V19 package self-test has no blockers.':'Run the in-memory SCORM package self-test.',action:()=>{actionScroll('blackboardDeliveryCenter')();setTimeout(()=>G('v19SelfTest')?.focus(),350)},label:'Package QA'},
  {id:'qa2',title:'10. Blackboard test matrix',ready:v20&&rcOk,detail:!v20?'Run the full SCORM lifecycle/test matrix.':!rcOk?'A Release Candidate is required but has not been frozen.':'Latest V20 test matrix has no blockers'+(state.v20?.requireReleaseCandidate?' and a Release Candidate exists.':'.'),action:()=>{if(!v20){actionScroll('blackboardTestLabCard')();setTimeout(()=>G('v20RunMatrix')?.focus(),350)}else actionScroll('releaseCandidateCard')()},label:v20?'Release':'Test Lab'}
 ];
 return{steps,assessment:ass,previewCurrent,v19,v20,rcOk}
}
function requiredSteps(){return stepData().steps}
function firstPending(){return requiredSteps().find(x=>!x.ready)||null}
function render(){
 ensureV33();document.documentElement.dataset.v33Guided=String(state.v33.guidedMode!==false);
 const steps=requiredSteps(),passed=steps.filter(x=>x.ready).length,pct=Math.round(passed/steps.length*100),next=steps.find(x=>!x.ready);
 G('v33ProgressBar').style.width=pct+'%';G('v33ProgressLabel').textContent=passed+' of '+steps.length+' production steps ready';G('v33ReadyLabel').textContent=pct+'% Blackboard-ready path';
 G('v33Steps').innerHTML=steps.map((x,i)=>'<div class="v33-step '+(x.ready?'pass':'warn')+' '+(next?.id===x.id?'current':'')+'"><span class="v33-icon">'+(x.ready?'✓':i+1)+'</span><div><b>'+esc33(x.title)+'</b><small>'+esc33(x.detail)+'</small></div><button class="btn" data-v33step="'+esc33(x.id)+'">'+esc33(x.ready?'Review':x.label)+'</button></div>').join('');
 G('v33Steps').querySelectorAll('[data-v33step]').forEach(b=>b.onclick=()=>steps.find(x=>x.id===b.dataset.v33step)?.action?.());
 const ready=!next;
 G('v33Next').innerHTML=ready?'<div><b>Blackboard production path is ready.</b><small>Run Validate once more, then export the audited SCORM package.</small></div><div class="v33-actions"><span class="v33-ready"><span class="v33-dot"></span>Ready for final validation</span><button class="btn" id="v33ValidateNow">Validate</button><button class="btn primary" id="v33ExportNow">Export Audited SCORM</button></div>':'<div><b>Next required step: '+esc33(next.title)+'</b><small>'+esc33(next.detail)+'</small></div><button class="btn primary" id="v33Continue">'+esc33(next.label)+'</button>';
 if(G('v33Continue'))G('v33Continue').onclick=next.action;if(G('v33ValidateNow'))G('v33ValidateNow').onclick=()=>G('validateBtn')?.click();if(G('v33ExportNow'))G('v33ExportNow').onclick=()=>G('exportBtn')?.click();
 G('v33NextTop').textContent=ready?'Validate & Export':'Continue · '+next.label;G('v33NextTop').onclick=ready?()=>G('validateBtn')?.click():next.action;
 G('v33Toggle').textContent=state.v33.guidedMode!==false?'Guided mode · On':'Guided mode · Off';
 G('v33Mini').textContent=ready?'Guided Build · Ready for final validation':'Guided Build · '+pct+'% · Next: '+next.title.replace(/^\d+\.\s*/,'');
 state.v33.lastScanAt=new Date().toISOString()
}
G('v33Scan').onclick=render;
G('v33Toggle').onclick=()=>{state.v33.guidedMode=state.v33.guidedMode===false;render()};

/* Track whether the currently authored state has actually been previewed. */
const preview=G('previewBtn');
if(preview&&!preview.dataset.v33Tracked){preview.dataset.v33Tracked='1';preview.addEventListener('click',()=>{state.v33.previewedAt=new Date().toISOString();state.v33.previewSignature=signature();setTimeout(render,100)})}

/* Audit */
function checks(){
 const d=stepData(),pending=d.steps.filter(x=>!x.ready);
 return[
  {level:pending.length?'warn':'pass',name:'V33 guided production path',detail:pending.length?pending.length+' guided production step(s) remain.':'All guided production steps are ready.'},
  {level:d.steps[0].ready?'pass':'fail',name:'V33 learning foundation',detail:d.steps[0].detail},
  {level:d.steps[1].ready?'pass':'fail',name:'V33 objective-linked immersive world',detail:d.steps[1].detail},
  {level:d.steps[4].ready?'pass':'fail',name:'V33 assessment readiness',detail:d.steps[4].detail},
  {level:d.previewCurrent?'pass':'warn',name:'V33 current-state learner preview',detail:d.steps[7].detail},
  {level:d.v19?'pass':'warn',name:'V33 package self-test evidence',detail:d.steps[8].detail},
  {level:d.v20&&d.rcOk?'pass':'warn',name:'V33 Blackboard test path',detail:d.steps[9].detail}
 ]
}
const oldChecks=window.VRClassroomAudit?.checks,oldRun=window.VRClassroomAudit?.run;
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=checks(),all=[...base,...extras],p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(G('auditPass'))G('auditPass').textContent=p;if(G('auditWarn'))G('auditWarn').textContent=w;if(G('auditFail'))G('auditFail').textContent=f;if(G('auditResults'))G('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc33(x.name)+'</b><div class="muted">'+esc33(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};
const oldRender=window.render;window.render=function(){oldRender();ensureV33();setTimeout(render,0)};
render();
window.VRGuidedV33={steps:requiredSteps,next:firstPending,signature,render};
})();