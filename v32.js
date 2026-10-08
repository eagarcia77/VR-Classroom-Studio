(()=>{
const A32=id=>document.getElementById(id);
const esc32=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV32(){state.version=32;state.v32=state.v32||{reportObjectives:true,enforceObjectiveCoverage:true,lastNormalization:null}}
ensureV32();
const main=document.querySelector('main.workspace');if(!main)return;

const card=document.createElement('section');card.className='card';card.id='assessmentBlueprintCard';
card.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Assessment Blueprint & Objective Scoring <span class="v6-badge">V32</span></h3>
 <div class="muted">Unify station, question and performance-task scoring and report objective-level mastery through SCORM 2004.</div></div>
 <div class="toolbar"><button class="btn" id="v32Restore">Restore Previous Weights</button><button class="btn primary" id="v32Normalize">Normalize Scored Evidence to 100</button></div>
</div>
<div class="v32-grid" style="margin-top:14px">
 <div class="v32-panel">
  <div class="field"><label>SCORM objective reporting</label><select id="v32Report"><option value="true">Enabled · cmi.objectives</option><option value="false">Disabled</option></select></div>
  <div class="field"><label>Require scored evidence for every learning objective</label><select id="v32Coverage"><option value="true">Required</option><option value="false">Advisory only</option></select></div>
  <div class="field"><label>Passing score (%)</label><input id="v32Passing" type="number" min="0" max="100"></div>
  <div class="v32-note">Normalization is optional and preserves the relative weight of every currently scored item while making the project total exactly 100 points. Informational stations with 0 points remain 0.</div>
 </div>
 <div class="v32-panel">
  <h4 style="margin-top:0">Assessment Health</h4>
  <div id="v32Metrics" class="v32-metrics"></div>
  <div id="v32Health" style="margin-top:10px"></div>
 </div>
</div>
<div class="v32-panel" style="margin-top:14px"><h4 style="margin-top:0">Objective Weight Map</h4><div id="v32Objectives"></div></div>
<div class="v32-panel" style="margin-top:14px"><h4 style="margin-top:0">Scored Evidence Inventory</h4><div id="v32Items"></div></div>`;
const anchor=main.querySelector('#authenticPerformanceTasksCard');
if(anchor)anchor.insertAdjacentElement('afterend',card);else main.appendChild(card);

const nav=document.querySelector('aside .nav');
if(nav){const b=document.createElement('button');b.innerHTML='⚖ Assessment Blueprint <span class="badge">V32</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.insertBefore(b,nav.children[6]||null)}

A32('v32Report').value=String(state.v32.reportObjectives!==false);
A32('v32Coverage').value=String(state.v32.enforceObjectiveCoverage!==false);
A32('v32Passing').value=Number(state.passing||80);
A32('v32Report').onchange=()=>{state.v32.reportObjectives=A32('v32Report').value==='true';renderAll()};
A32('v32Coverage').onchange=()=>{state.v32.enforceObjectiveCoverage=A32('v32Coverage').value==='true';renderAll()};
A32('v32Passing').onchange=()=>{state.passing=Math.max(0,Math.min(100,Number(A32('v32Passing').value)||0));A32('v32Passing').value=state.passing;if(document.getElementById('passing'))document.getElementById('passing').value=state.passing;renderAll()};

function objectives(){return(state.objectives||[]).map((o,i)=>({index:i,text:typeof o==='string'?o:(o.text||o.title||('Objective '+(i+1)))}))}
function stationById(id){return(state.stations||[]).find(s=>String(s.id)===String(id))}
function objectiveForStation(s){
 if(s?.objectiveIndex!=null&&Number.isFinite(Number(s.objectiveIndex)))return Number(s.objectiveIndex);
 const c=(state.competencies||[]).find(x=>(x.stationIds||[]).some(id=>String(id)===String(s?.id))&&Array.isArray(x.objectiveIndexes)&&x.objectiveIndexes.length);
 return c?Number(c.objectiveIndexes[0]):null
}
function objectiveForQuestion(q){
 if(q?.objectiveIndex!=null&&Number.isFinite(Number(q.objectiveIndex)))return Number(q.objectiveIndex);
 const s=stationById(q?.stationId),fromStation=objectiveForStation(s);if(fromStation!=null)return fromStation;
 const c=(state.competencies||[]).find(x=>(x.questionIds||[]).some(id=>String(id)===String(q?.id))&&Array.isArray(x.objectiveIndexes)&&x.objectiveIndexes.length);
 return c?Number(c.objectiveIndexes[0]):null
}
function evidenceItems(){
 const rows=[];
 (state.stations||[]).forEach(s=>rows.push({kind:s.performanceTaskId?'performance':'station',id:s.id,label:s.name||'Station',points:Number(s.points||0),objectiveIndex:objectiveForStation(s),stationId:s.id,ref:s}));
 (state.questions||[]).forEach(q=>rows.push({kind:q.type==='reflection'?'reflection':'question',id:q.id,label:q.prompt||'Question',points:Number(q.points||0),objectiveIndex:objectiveForQuestion(q),stationId:q.stationId,ref:q}));
 return rows
}
function duplicateRisks(){
 const out=[];
 for(const s of state.stations||[]){
  if(Number(s.points||0)<=0)continue;
  const qs=(state.questions||[]).filter(q=>String(q.stationId)===String(s.id)&&Number(q.points||0)>0);
  if(qs.length)out.push({station:s,questions:qs})
 }
 return out
}
function summary(){
 const items=evidenceItems(),scored=items.filter(x=>x.points>0),total=scored.reduce((a,x)=>a+x.points,0),mapped=scored.filter(x=>x.objectiveIndex!=null),unmapped=scored.filter(x=>x.objectiveIndex==null),dups=duplicateRisks();
 const objs=objectives().map(o=>{const its=scored.filter(x=>Number(x.objectiveIndex)===o.index);return{...o,items:its,points:its.reduce((a,x)=>a+x.points,0)}});
 return{items,scored,total,mapped,unmapped,dups,objs,covered:objs.filter(o=>o.points>0).length}
}
function renderAll(){
 ensureV32();const s=summary();
 A32('v32Metrics').innerHTML='<div><b>'+s.total+'</b><small>Total points</small></div><div><b>'+s.scored.length+'</b><small>Scored items</small></div><div><b>'+s.covered+'/'+s.objs.length+'</b><small>Objectives covered</small></div><div><b>'+s.dups.length+'</b><small>Double-score risks</small></div>';
 const issues=[];if(!s.scored.length)issues.push('No scored evidence exists.');if(s.unmapped.length)issues.push(s.unmapped.length+' scored item(s) are not mapped to an objective.');if(s.dups.length)issues.push(s.dups.length+' station(s) and linked questions both award points.');if(state.v32.enforceObjectiveCoverage&&s.objs.some(o=>o.points<=0))issues.push(s.objs.filter(o=>o.points<=0).length+' objective(s) have no scored evidence.');if(s.total!==100)issues.push('Project total is '+s.total+' points; Blackboard will still receive a 0–100 scaled score, but the blueprint is not normalized.');
 A32('v32Health').innerHTML=issues.length?'<span class="v32-pill"><span class="v32-dot warn"></span>'+esc32(issues.join(' '))+'</span>':'<span class="v32-pill"><span class="v32-dot"></span>Assessment blueprint is coherent and normalized.</span>';
 const denom=Math.max(1,s.total);
 A32('v32Objectives').innerHTML=s.objs.length?s.objs.map((o,i)=>'<div class="v32-row"><span class="v32-num">'+(i+1)+'</span><div><b>'+esc32(o.text)+'</b><div class="muted">'+o.items.length+' scored evidence item(s)</div><div class="v32-bar"><span style="width:'+Math.min(100,o.points/denom*100)+'%"></span></div></div><div><span class="v32-pill"><span class="v32-dot '+(o.points>0?'':'warn')+'"></span>'+(o.points>0?'Covered':'No scored evidence')+'</span></div><div><b>'+o.points+' pts</b></div><div>'+Math.round(o.points/denom*100)+'% weight</div></div>').join(''):'<div class="muted">Add learning objectives to build the assessment blueprint.</div>';
 A32('v32Items').innerHTML=s.items.length?s.items.map((x,i)=>'<div class="v32-row"><span class="v32-num">'+(i+1)+'</span><div><b>'+esc32(x.label)+'</b><div class="muted">'+esc32(x.kind)+(x.stationId!=null?' · station '+esc32(String(x.stationId)):'')+'</div></div><div>'+esc32(x.objectiveIndex==null?'Unmapped':'Objective '+(Number(x.objectiveIndex)+1))+'</div><div><b>'+x.points+' pts</b></div><div><span class="v32-pill"><span class="v32-dot '+(x.points>0&&x.objectiveIndex==null?'warn':'')+'"></span>'+(x.points>0?'Scored':'Informational')+'</span></div></div>').join(''):'<div class="muted">No stations or questions exist yet.</div>'
}
function normalize(){
 const s=summary();if(!s.scored.length)return alert('There is no scored evidence to normalize.');
 if(!confirm('Normalize all currently scored stations/questions to a total of exactly 100 points while preserving their relative weights?'))return;
 const snapshot=s.scored.map(x=>({kind:x.kind,id:x.id,points:x.points}));
 const raw=s.scored.map((x,i)=>({x,i,exact:x.points*100/s.total,base:Math.floor(x.points*100/s.total)}));
 let used=raw.reduce((a,r)=>a+r.base,0),left=100-used;
 raw.sort((a,b)=>(b.exact-b.base)-(a.exact-a.base)||a.i-b.i);
 raw.forEach((r,i)=>r.final=r.base+(i<left?1:0));raw.sort((a,b)=>a.i-b.i);
 raw.forEach(r=>r.x.ref.points=r.final);
 state.v32.lastNormalization={at:new Date().toISOString(),weights:snapshot,totalBefore:s.total};
 if(typeof render==='function')render();renderAll()
}
function restore(){
 const n=state.v32.lastNormalization;if(!n?.weights?.length)return alert('No V32 normalization snapshot is available.');
 for(const w of n.weights){const all=[...(state.stations||[]),...(state.questions||[])],x=all.find(v=>String(v.id)===String(w.id));if(x)x.points=Number(w.points||0)}
 state.v32.lastNormalization=null;if(typeof render==='function')render();renderAll()
}
A32('v32Normalize').onclick=normalize;A32('v32Restore').onclick=restore;

/* Objective-level SCORM 2004 reporting */
const prevRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=prevRuntime(preview);if(!state.v32?.reportObjectives)return html;
 const s=summary(),payload=JSON.stringify({passing:Number(state.passing||0),objectives:s.objs.map(o=>({index:o.index,text:o.text,stationIds:Array.from(new Set(o.items.filter(x=>x.kind==='station'||x.kind==='performance').map(x=>x.id))),questionIds:Array.from(new Set(o.items.filter(x=>x.kind==='question'||x.kind==='reflection').map(x=>x.id))),maxPoints:o.points,threshold:(state.competencies||[]).find(c=>(c.objectiveIndexes||[]).some(i=>Number(i)===o.index))?.threshold??Number(state.passing||0)}))}).replace(/</g,'\\u003c');
 const script=`<script>
 (function(){
 const cfg=${payload};
 function hasCompleted(id){return completed.has(id)||completed.has(String(id))}
 function hasAnswered(id){return answered.has(id)||answered.has(String(id))}
 function records(){try{return window.V29Evidence?.records?.()||[]}catch(e){return[]}}
 function questionEarned(qid){
  const q=(project.questions||[]).find(x=>String(x.id)===String(qid));if(!q)return 0;
  const rec=records().find(r=>r.kind==='question'&&String(r.sourceId)===String(qid));
  if(rec)return(rec.result==='correct'||rec.result==='submitted')?Number(q.points||0):0;
  return 0
 }
 function report(){
  (cfg.objectives||[]).forEach((o,i)=>{
   const base='cmi.objectives.'+i,stationIds=o.stationIds||[],questionIds=o.questionIds||[];
   let max=0,earned=0,done=0,count=0;
   stationIds.forEach(id=>{const s=(project.stations||[]).find(x=>String(x.id)===String(id));if(!s)return;const pts=Number(s.points||0);max+=pts;count++;if(hasCompleted(id)){earned+=pts;done++}});
   questionIds.forEach(id=>{const q=(project.questions||[]).find(x=>String(x.id)===String(id));if(!q)return;max+=Number(q.points||0);count++;if(hasAnswered(id)){done++;earned+=questionEarned(id)}});
   const raw=max>0?Math.max(0,Math.min(100,Math.round(earned/max*100))):0,progress=count?Math.min(1,done/count):0,complete=count>0&&done===count,threshold=Math.max(0,Math.min(100,Number(o.threshold??cfg.passing||0)));
   SCORM.set(base+'.id','objective_'+(Number(o.index)+1));SCORM.set(base+'.score.min','0');SCORM.set(base+'.score.max','100');SCORM.set(base+'.score.raw',raw);SCORM.set(base+'.score.scaled',(raw/100).toFixed(4));SCORM.set(base+'.progress_measure',progress.toFixed(4));SCORM.set(base+'.completion_status',complete?'completed':'incomplete');SCORM.set(base+'.success_status',complete?(raw>=threshold?'passed':'failed'):'unknown')
  });SCORM.commit()
 }
 const oldUpdate=update;update=function(){const r=oldUpdate();report();return r};setTimeout(report,0);window.V32Objectives={report}
 })();
 <\/script>`;
 return html.replace('</body></html>',script+'</body></html>')
};

function checks(){
 const s=summary(),missing=s.objs.filter(o=>o.points<=0);
 return[
  {level:s.scored.length?'pass':'fail',name:'V32 scored evidence',detail:s.scored.length?s.scored.length+' scored evidence item(s) contribute to the course score.':'No scored evidence exists.'},
  {level:s.dups.length?'fail':'pass',name:'V32 duplicate scoring protection',detail:s.dups.length?s.dups.length+' station(s) and their questions both award points. Move the weight to one evidence layer.':'No station/question double-scoring pattern was detected.'},
  {level:s.unmapped.length?'fail':'pass',name:'V32 scored evidence objective mapping',detail:s.unmapped.length?s.unmapped.length+' scored item(s) are not mapped to a learning objective.':'Every scored item maps to a learning objective.'},
  {level:state.v32.enforceObjectiveCoverage&&missing.length?'fail':'pass',name:'V32 objective score coverage',detail:missing.length?missing.length+' objective(s) have no scored evidence.':'Every learning objective has scored evidence.'},
  {level:s.total===100?'pass':'warn',name:'V32 normalized blueprint',detail:'Current assessment total is '+s.total+' points.'},
  {level:state.v32.reportObjectives?'pass':'warn',name:'V32 SCORM objective reporting',detail:state.v32.reportObjectives?'Runtime reports objective score, progress, completion and success through cmi.objectives.':'Objective reporting is disabled.'},
  {level:Number(state.passing)>=0&&Number(state.passing)<=100?'pass':'fail',name:'V32 passing threshold',detail:'Passing score is '+Number(state.passing||0)+'%.'}
 ]
}
const oldValidate=validateProject;
validateProject=function(){const issues=oldValidate(),c=checks().filter(x=>x.level==='fail');c.forEach(x=>issues.push(x.name+': '+x.detail));return[...new Set(issues)]};
const oldChecks=window.VRClassroomAudit?.checks,oldRun=window.VRClassroomAudit?.run;
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=checks(),all=[...base,...extras],p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(A32('auditPass'))A32('auditPass').textContent=p;if(A32('auditWarn'))A32('auditWarn').textContent=w;if(A32('auditFail'))A32('auditFail').textContent=f;if(A32('auditResults'))A32('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc32(x.name)+'</b><div class="muted">'+esc32(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};
const oldRender=render;render=function(){oldRender();ensureV32();setTimeout(renderAll,0)};
renderAll();
})();