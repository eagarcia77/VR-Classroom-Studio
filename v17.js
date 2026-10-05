(()=>{
const A=id=>document.getElementById(id);
const esc17=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV17(){
 state.version=17;
 state.competencies=state.competencies||[];
 state.masteryRules=state.masteryRules||[];
 state.adaptivePaths=state.adaptivePaths||[];
 state.experienceEvents=state.experienceEvents||[];
 state.v17Settings=state.v17Settings||{adaptiveEnabled:false,masteryThreshold:80,eventStreamEnabled:true};
}
ensureV17();
const main=document.querySelector('main.workspace');if(!main)return;

/* Competencies */
const comp=document.createElement('section');comp.className='card';comp.id='competencyMapCard';
comp.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Competency & Mastery Map <span class="v6-badge">V17</span></h3><div class="muted">Map objectives, stations and assessments to competencies and mastery thresholds.</div></div><button class="btn primary" id="v17AddCompetency">+ Competency</button></div>
<div class="v17-grid" style="margin-top:12px"><div class="v17-card"><h4 style="margin-top:0">Competencies</h4><div id="v17Competencies" class="v17-list"></div></div><div class="v17-card"><h4 style="margin-top:0">Mastery settings</h4><div class="field"><label>Default mastery threshold</label><input id="v17Threshold" type="number" min="0" max="100"></div><div class="field"><label>Adaptive mode</label><select id="v17AdaptiveEnabled"><option value="false">Disabled</option><option value="true">Enabled</option></select></div><div class="muted">Adaptive mode affects runtime scene routing only when configured paths are valid.</div></div></div>`;
main.appendChild(comp);

/* Adaptive paths */
const paths=document.createElement('section');paths.className='card';paths.id='adaptivePathsCard';
paths.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Adaptive Paths & Remediation <span class="v6-badge">V17</span></h3><div class="muted">Route learners to remediation, reinforcement or advanced scenes based on mastery.</div></div><button class="btn primary" id="v17AddPath">+ Adaptive path</button></div>
<div id="v17Paths" class="v17-list" style="margin-top:12px"></div>`;
main.appendChild(paths);

/* Intelligence */
const intel=document.createElement('section');intel.className='card';intel.id='experienceIntelligenceCard';
intel.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Experience Intelligence Dashboard <span class="v6-badge">V17</span></h3><div class="muted">Inspect learning complexity, mastery coverage, adaptive branching and experience events before publication.</div></div><button class="btn primary" id="v17Analyze">Refresh intelligence</button></div>
<div id="v17Metrics" class="v17-metrics" style="margin-top:12px"></div><div id="v17Insights" style="margin-top:12px"></div>`;
main.appendChild(intel);

/* Event stream */
const stream=document.createElement('section');stream.className='card';stream.id='experienceEventCard';
stream.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Experience Event Stream <span class="v6-badge">V17</span></h3><div class="muted">Generates structured xAPI-ready event objects without requiring an LRS.</div></div><div class="toolbar"><button class="btn" id="v17SampleEvent">Generate sample event</button><button class="btn" id="v17ClearEvents">Clear local events</button></div></div>
<div id="v17Events" class="v17-list" style="margin-top:12px"></div>`;
main.appendChild(stream);

const nav=document.querySelector('aside .nav');if(nav){[['🧩 Competencies',comp],['🛤 Adaptive Paths',paths],['🧠 Experience Intelligence',intel],['📡 Experience Events',stream]].forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)})}

function compById(id){return (state.competencies||[]).find(c=>String(c.id)===String(id))}
function addEvent(verb,objectType,objectId,result={},context={}){
 if(!state.v17Settings.eventStreamEnabled)return;
 const verbMap={experienced:'https://w3id.org/xapi/adl/verbs/experienced',completed:'https://w3id.org/xapi/adl/verbs/completed',answered:'https://w3id.org/xapi/adl/verbs/answered',mastered:'https://w3id.org/xapi/adl/verbs/mastered',remediated:'https://w3id.org/xapi/adl/verbs/remediated'};
 const evt={id:'evt-'+Date.now()+'-'+Math.random().toString(36).slice(2),timestamp:new Date().toISOString(),actor:{objectType:'Agent',name:state.metadata?.author||'Learner'},verb:{id:verbMap[verb]||verb,display:{'en-US':verb}},object:{id:'urn:vr-classroom:'+encodeURIComponent(String(objectId||'')),definition:{type:'urn:vr-classroom:type:'+String(objectType||'activity')}},result,context};
 state.experienceEvents.unshift(evt);state.experienceEvents=state.experienceEvents.slice(0,100);renderEvents()
}
function renderCompetencies(){
 const box=A('v17Competencies');if(!box)return;
 box.innerHTML=(state.competencies||[]).length?state.competencies.map(c=>'<div class="v17-item"><b>'+esc17(c.name)+'</b><small>'+esc17(c.description||'')+'</small><small>Threshold: '+Number(c.threshold||state.v17Settings.masteryThreshold)+'%</small><small>Objectives: '+(c.objectiveIndexes||[]).join(', ')+'</small><div class="toolbar" style="margin-top:7px"><button class="btn" data-editcomp="'+esc17(c.id)+'">Edit</button><button class="btn danger" data-delcomp="'+esc17(c.id)+'">Delete</button></div></div>').join(''):'<div class="muted">No competencies defined.</div>';
 box.querySelectorAll('[data-editcomp]').forEach(b=>b.onclick=()=>editCompetency(b.dataset.editcomp));
 box.querySelectorAll('[data-delcomp]').forEach(b=>b.onclick=()=>{const id=b.dataset.delcomp;state.competencies=state.competencies.filter(c=>String(c.id)!==String(id));state.masteryRules=state.masteryRules.filter(r=>String(r.competencyId)!==String(id));state.adaptivePaths=state.adaptivePaths.filter(p=>String(p.competencyId)!==String(id));renderCompetencies();renderPaths()})
}
A('v17AddCompetency').onclick=()=>{const name=prompt('Competency name','Applied Decision Making');if(!name)return;const description=prompt('Description','Demonstrates evidence-based decisions in the immersive scenario.')||'';const objectiveIndexes=(state.objectives||[]).map((_,i)=>i);state.competencies.push({id:'comp-'+Date.now(),name,description,threshold:Number(state.v17Settings.masteryThreshold||80),objectiveIndexes,stationIds:[],questionIds:[]});renderCompetencies()};
function editCompetency(id){const c=compById(id);if(!c)return;let v=prompt('Competency name',c.name);if(v!==null&&v.trim())c.name=v.trim();v=prompt('Description',c.description||'');if(v!==null)c.description=v;v=prompt('Mastery threshold (0-100)',String(c.threshold||80));if(v!==null)c.threshold=Math.max(0,Math.min(100,Number(v)||80));const stationList=(state.stations||[]).map((s,i)=>(i+1)+'. '+s.name).join('\n');v=prompt('Station numbers for evidence, comma separated\n'+stationList,(c.stationIds||[]).map(id=>(state.stations||[]).findIndex(s=>String(s.id)===String(id))+1).filter(x=>x>0).join(','));if(v!==null)c.stationIds=v.split(',').map(x=>(state.stations||[])[Number(x.trim())-1]?.id).filter(Boolean);const questionList=(state.questions||[]).map((q,i)=>(i+1)+'. '+(q.prompt||q.question||q.text||('Question '+(i+1)))).join('\n');v=prompt('Question numbers for evidence, comma separated\n'+questionList,(c.questionIds||[]).map(id=>(state.questions||[]).findIndex(q=>String(q.id)===String(id))+1).filter(x=>x>0).join(','));if(v!==null)c.questionIds=v.split(',').map(x=>(state.questions||[])[Number(x.trim())-1]?.id).filter(Boolean);renderCompetencies();renderPaths()}
A('v17Threshold').value=state.v17Settings.masteryThreshold;
A('v17AdaptiveEnabled').value=String(!!state.v17Settings.adaptiveEnabled);
A('v17Threshold').onchange=()=>state.v17Settings.masteryThreshold=Math.max(0,Math.min(100,Number(A('v17Threshold').value)||80));
A('v17AdaptiveEnabled').onchange=()=>state.v17Settings.adaptiveEnabled=A('v17AdaptiveEnabled').value==='true';

function renderPaths(){
 const box=A('v17Paths');if(!box)return;const scenes=state.scenes||[];
 box.innerHTML=(state.adaptivePaths||[]).length?state.adaptivePaths.map(p=>{const c=compById(p.competencyId),from=scenes.find(s=>String(s.id)===String(p.fromSceneId)),low=scenes.find(s=>String(s.id)===String(p.remediationSceneId)),high=scenes.find(s=>String(s.id)===String(p.masterySceneId));return '<div class="v17-item"><div class="v17-path"><div><b>'+esc17(c?.name||'Missing competency')+'</b><small>From: '+esc17(from?.name||'Missing scene')+'</small></div><div>Threshold '+Number(p.threshold||c?.threshold||80)+'%</div><div><small>Below → '+esc17(low?.name||'Missing')+'</small><small>Mastered → '+esc17(high?.name||'Missing')+'</small></div></div><div class="toolbar" style="margin-top:7px"><button class="btn" data-editpath="'+esc17(p.id)+'">Edit</button><button class="btn danger" data-delpath="'+esc17(p.id)+'">Delete</button></div></div>'}).join(''):'<div class="muted">No adaptive paths configured.</div>';
 box.querySelectorAll('[data-editpath]').forEach(b=>b.onclick=()=>editPath(b.dataset.editpath));
 box.querySelectorAll('[data-delpath]').forEach(b=>b.onclick=()=>{state.adaptivePaths=state.adaptivePaths.filter(p=>String(p.id)!==String(b.dataset.delpath));renderPaths()})
}
A('v17AddPath').onclick=()=>{if(!(state.competencies||[]).length)return alert('Create a competency first.');if((state.scenes||[]).length<2)return alert('Create at least two scenes.');const c=state.competencies[0],sc=state.scenes;state.adaptivePaths.push({id:'path-'+Date.now(),competencyId:c.id,fromSceneId:sc[0].id,threshold:c.threshold||80,remediationSceneId:sc[0].id,masterySceneId:sc[1].id});renderPaths()};
function editPath(id){const p=state.adaptivePaths.find(x=>String(x.id)===String(id));if(!p)return;const comps=state.competencies||[],scenes=state.scenes||[];let v=prompt('Competency number\n'+comps.map((c,i)=>(i+1)+'. '+c.name).join('\n'),String(Math.max(1,comps.findIndex(c=>c.id===p.competencyId)+1)));if(v!==null&&comps[Number(v)-1])p.competencyId=comps[Number(v)-1].id;v=prompt('Threshold',String(p.threshold||80));if(v!==null)p.threshold=Math.max(0,Math.min(100,Number(v)||80));const list=scenes.map((s,i)=>(i+1)+'. '+s.name).join('\n');v=prompt('From scene number\n'+list,String(Math.max(1,scenes.findIndex(s=>s.id===p.fromSceneId)+1)));if(v!==null&&scenes[Number(v)-1])p.fromSceneId=scenes[Number(v)-1].id;v=prompt('Remediation scene number\n'+list,String(Math.max(1,scenes.findIndex(s=>s.id===p.remediationSceneId)+1)));if(v!==null&&scenes[Number(v)-1])p.remediationSceneId=scenes[Number(v)-1].id;v=prompt('Mastery scene number\n'+list,String(Math.max(1,scenes.findIndex(s=>s.id===p.masterySceneId)+1)));if(v!==null&&scenes[Number(v)-1])p.masterySceneId=scenes[Number(v)-1].id;renderPaths()}

function evidencePoints(c){const stations=(state.stations||[]).filter(s=>(c.stationIds||[]).some(id=>String(id)===String(s.id))),questions=(state.questions||[]).filter(q=>(c.questionIds||[]).some(id=>String(id)===String(q.id)));return stations.reduce((a,s)=>a+Number(s.points||0),0)+questions.reduce((a,q)=>a+Number(q.points||0),0)}
function analyze(){
 const comps=state.competencies||[],paths=state.adaptivePaths||[],totalEvidence=comps.reduce((a,c)=>a+evidencePoints(c),0),adaptiveCoverage=comps.filter(c=>paths.some(p=>String(p.competencyId)===String(c.id))).length;
 A('v17Metrics').innerHTML='<div><b>'+comps.length+'</b><small>Competencies</small></div><div><b>'+adaptiveCoverage+'/'+comps.length+'</b><small>Adaptive coverage</small></div><div><b>'+totalEvidence+'</b><small>Mapped evidence points</small></div><div><b>'+(state.experienceEvents||[]).length+'</b><small>Local experience events</small></div>';
 const notes=[];if(!comps.length)notes.push(['warn','Competency model','No competencies are defined.']);else notes.push(['pass','Competency model',comps.length+' competency record(s) defined.']);const orphanPaths=paths.filter(p=>!compById(p.competencyId)||!(state.scenes||[]).some(s=>String(s.id)===String(p.fromSceneId))||!(state.scenes||[]).some(s=>String(s.id)===String(p.remediationSceneId))||!(state.scenes||[]).some(s=>String(s.id)===String(p.masterySceneId)));notes.push([orphanPaths.length?'fail':'pass','Adaptive path integrity',orphanPaths.length?orphanPaths.length+' path(s) have missing competency/scene references.':'Adaptive path references resolve.']);const noEvidence=comps.filter(c=>!(c.stationIds||[]).length&&!(c.questionIds||[]).length);notes.push([noEvidence.length?'warn':'pass','Mastery evidence mapping',noEvidence.length?noEvidence.length+' competency record(s) have no mapped evidence.':'Competencies have mapped evidence.']);A('v17Insights').innerHTML=notes.map(([l,t,d])=>'<div class="station" style="'+(l==='fail'?'border-color:#7f1d1d':l==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(l==='pass'?'✓':l==='warn'?'!':'×')+'</span><div><b>'+esc17(t)+'</b><div class="muted">'+esc17(d)+'</div></div></div>').join('')
}
A('v17Analyze').onclick=analyze;

function renderEvents(){const box=A('v17Events');if(!box)return;const items=state.experienceEvents||[];box.innerHTML=items.length?items.slice(0,30).map(e=>'<div class="v17-event">'+esc17(JSON.stringify(e))+'</div>').join(''):'<div class="muted">No experience events generated.</div>'}
A('v17SampleEvent').onclick=()=>addEvent('experienced','immersive-scene',state.activeSceneId,{completion:false},{projectId:state.metadata?.projectId||''});
A('v17ClearEvents').onclick=()=>{state.experienceEvents=[];renderEvents()};

/* runtime adaptive layer */
const prevRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=prevRuntime(preview);
 const payload=JSON.stringify({settings:state.v17Settings||{},competencies:state.competencies||[],paths:state.adaptivePaths||[]}).replace(/</g,'\\u003c');
 const code=`
 <script>
 (function(){
 const v17=${payload};const mastery={};
 function compute(comp){const stations=(comp.stationIds||[]),questions=(comp.questionIds||[]);let earned=0,total=0;stations.forEach(id=>{const s=(project.stations||[]).find(x=>String(x.id)===String(id));if(s){total+=Number(s.points||0);if(completed.has(s.id)||completed.has(String(s.id)))earned+=Number(s.points||0)}});questions.forEach(id=>{const q=(project.questions||[]).find(x=>String(x.id)===String(id));if(q){total+=Number(q.points||0);if(answered.has(q.id)||answered.has(String(q.id)))earned+=Number(q.points||0)}});return total?Math.round(earned/total*100):0}
 function refresh(){(v17.competencies||[]).forEach(c=>mastery[c.id]=compute(c))}
 function route(sceneId){if(!v17.settings.adaptiveEnabled)return sceneId;refresh();const p=(v17.paths||[]).find(x=>String(x.fromSceneId)===String(sceneId));if(!p)return sceneId;const score=Number(mastery[p.competencyId]||0),threshold=Number(p.threshold||80);return score>=threshold?p.masterySceneId:p.remediationSceneId}
 const runtimeEvents=[];
 function emit(verb,objectType,objectId,result={},context={}){const verbMap={experienced:'https://w3id.org/xapi/adl/verbs/experienced',completed:'https://w3id.org/xapi/adl/verbs/completed',mastered:'https://w3id.org/xapi/adl/verbs/mastered',remediated:'https://w3id.org/xapi/adl/verbs/remediated'};runtimeEvents.unshift({timestamp:new Date().toISOString(),actor:{objectType:'Agent',name:'SCORM Learner'},verb:{id:verbMap[verb]||verb,display:{'en-US':verb}},object:{id:'urn:vr-classroom:'+encodeURIComponent(String(objectId||'')),definition:{type:'urn:vr-classroom:type:'+objectType}},result,context});if(runtimeEvents.length>50)runtimeEvents.length=50}
 const oldShow=showScene;showScene=function(id){const next=route(id);if(String(next)!==String(id)){refresh();const p=(v17.paths||[]).find(x=>String(x.fromSceneId)===String(id));const score=p?Number(mastery[p.competencyId]||0):0;emit(score>=Number(p?.threshold||80)?'mastered':'remediated','adaptive-route',p?.competencyId||id,{score:{scaled:Math.max(0,Math.min(1,score/100))}},{fromSceneId:id,toSceneId:next})}else emit('experienced','immersive-scene',id);oldShow(next)};
 const oldUpdate=update;update=function(){const r=oldUpdate();refresh();return r};
 const oldPersist=typeof persist==='function'?persist:null;if(oldPersist)window.persist=function(){const r=oldPersist();try{const raw=SCORM.get('cmi.suspend_data'),d=raw?JSON.parse(raw):{};d.v17mastery=mastery;d.v17events=runtimeEvents;SCORM.set('cmi.suspend_data',JSON.stringify(d).slice(0,60000));SCORM.commit()}catch(e){}return r};
 try{const raw=SCORM.get('cmi.suspend_data');if(raw){const d=JSON.parse(raw);Object.assign(mastery,d.v17mastery||{});(d.v17events||[]).forEach(e=>runtimeEvents.push(e))}}catch(e){}
 window.V17Runtime={mastery,refresh,route,events:()=>runtimeEvents.slice()};
 })();
 <\/script>`;
 return html.replace('</body></html>',code+'</body></html>')
};

const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v17Checks(){
 const out=[],comps=state.competencies||[],paths=state.adaptivePaths||[],scenes=state.scenes||[];
 const dup=comps.length-new Set(comps.map(c=>String(c.id))).size;out.push({level:dup?'fail':'pass',name:'Competency identifiers',detail:dup?dup+' duplicate competency ID(s) detected.':'Competency identifiers are unique.'});
 const badThreshold=comps.filter(c=>!Number.isFinite(Number(c.threshold))||Number(c.threshold)<0||Number(c.threshold)>100);out.push({level:badThreshold.length?'fail':'pass',name:'Mastery thresholds',detail:badThreshold.length?badThreshold.length+' competency threshold(s) fall outside 0-100.':'Mastery thresholds are valid.'});
 const brokenPaths=paths.filter(p=>!compById(p.competencyId)||![p.fromSceneId,p.remediationSceneId,p.masterySceneId].every(id=>scenes.some(s=>String(s.id)===String(id))));out.push({level:brokenPaths.length?'fail':'pass',name:'Adaptive route integrity',detail:brokenPaths.length?brokenPaths.length+' adaptive path(s) contain missing references.':'Adaptive routes resolve.'});
 const noEvidence=comps.filter(c=>!(c.stationIds||[]).length&&!(c.questionIds||[]).length);out.push({level:noEvidence.length?'warn':'pass',name:'Mastery evidence',detail:noEvidence.length?noEvidence.length+' competency record(s) lack station/question evidence mappings.':'Competencies have evidence mappings.'});
 const selfLoop=paths.filter(p=>String(p.fromSceneId)===String(p.remediationSceneId)&&String(p.fromSceneId)===String(p.masterySceneId));out.push({level:selfLoop.length?'warn':'pass',name:'Adaptive route effectiveness',detail:selfLoop.length?selfLoop.length+' adaptive path(s) route both outcomes to the same scene.':'Adaptive paths distinguish outcomes.'});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v17Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v17Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(A('auditPass'))A('auditPass').textContent=p;if(A('auditWarn'))A('auditWarn').textContent=w;if(A('auditFail'))A('auditFail').textContent=f;if(A('auditResults'))A('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station" style="'+(x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc17(x.name)+'</b><div class="muted">'+esc17(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

const oldRender=render;
render=function(){oldRender();ensureV17();renderCompetencies();renderPaths();renderEvents();analyze()};
renderCompetencies();renderPaths();renderEvents();analyze();
})();