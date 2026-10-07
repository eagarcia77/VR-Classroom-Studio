(()=>{
const M=id=>document.getElementById(id);
const e28=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV28(){state.version=28;state.v28=state.v28||{missionNavigator:true,guidedNavigation:true,autoDebrief:true,showObjectiveText:true}}
ensureV28();
const main=document.querySelector('main.workspace');if(!main)return;

const card=document.createElement('section');card.className='card';card.id='learnerMissionRuntimeCard';
card.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Learner Mission Runtime <span class="v6-badge">V28</span></h3>
 <div class="muted">Give students a clear mission map, objective progress, next-step guidance and completion debrief inside the exported SCORM experience.</div></div>
 <button class="btn primary" id="v28Preview">Preview Learner Mission</button>
</div>
<div class="v28-grid" style="margin-top:14px">
 <div class="v28-panel">
  <div class="field"><label>Mission Navigator</label><select id="v28Navigator"><option value="true">Enabled</option><option value="false">Disabled</option></select></div>
  <div class="field"><label>Guided navigation to next evidence</label><select id="v28Guided"><option value="true">Enabled</option><option value="false">Status only</option></select></div>
  <div class="field"><label>Automatic completion debrief</label><select id="v28Debrief"><option value="true">Enabled</option><option value="false">Disabled</option></select></div>
  <div class="field"><label>Show learning objective text</label><select id="v28ObjectiveText"><option value="true">Show</option><option value="false">Use Objective 1, 2, 3…</option></select></div>
  <div class="v28-note">Mission status is derived from the same required stations and assessment completion already persisted to SCORM 2004 <code>cmi.suspend_data</code>. V28 does not create a second grade or parallel completion model.</div>
 </div>
 <div class="v28-panel">
  <h4 style="margin-top:0">Runtime Readiness</h4>
  <div id="v28Metrics" class="v28-metrics"></div>
  <div id="v28Readiness" style="margin-top:10px"></div>
 </div>
</div>
<div class="v28-panel" style="margin-top:14px"><h4 style="margin-top:0">Objective Mission Map</h4><div id="v28ObjectiveMap"></div></div>`;
const anchor=main.querySelector('#instructionalDigitalTwinCard');
if(anchor)anchor.insertAdjacentElement('afterend',card);else main.appendChild(card);
const nav=document.querySelector('aside .nav');
if(nav){const b=document.createElement('button');b.innerHTML='🧭 Learner Mission Runtime <span class="badge">V28</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.insertBefore(b,nav.children[3]||null)}

M('v28Navigator').value=String(state.v28.missionNavigator!==false);M('v28Guided').value=String(state.v28.guidedNavigation!==false);M('v28Debrief').value=String(state.v28.autoDebrief!==false);M('v28ObjectiveText').value=String(state.v28.showObjectiveText!==false);
function bindBool(id,key){M(id).onchange=()=>{state.v28[key]=M(id).value==='true';renderAuthoring()}}
bindBool('v28Navigator','missionNavigator');bindBool('v28Guided','guidedNavigation');bindBool('v28Debrief','autoDebrief');bindBool('v28ObjectiveText','showObjectiveText');

function objectives(){return (state.objectives||[]).map((o,i)=>({index:i,text:typeof o==='string'?o:(o.text||o.title||('Objective '+(i+1)))})).filter(x=>String(x.text).trim())}
function mappedStations(obj,i){
 const byIndex=(state.stations||[]).filter(s=>s.required&&Number(s.objectiveIndex)===Number(obj.index));if(byIndex.length)return byIndex;
 const comp=(state.competencies||[]).find(c=>(c.objectiveIndexes||[]).some(x=>Number(x)===Number(obj.index)));if(comp?.stationIds?.length)return (comp.stationIds||[]).map(id=>(state.stations||[]).find(s=>String(s.id)===String(id))).filter(Boolean);
 const required=(state.stations||[]).filter(s=>s.required);return required[i]?[required[i]]:[]
}
function authoringChecks(){
 const objs=objectives(),maps=objs.map((o,i)=>({o,stations:mappedStations(o,i)})),missing=maps.filter(x=>!x.stations.length),orphan=maps.flatMap(x=>x.stations).filter(s=>!(state.scenes||[]).some(sc=>String(sc.id)===String(s.sceneId)));
 const counts=maps.reduce((a,x)=>{for(const s of x.stations)a[String(s.id)]=(a[String(s.id)]||0)+1;return a},{}),shared=Object.values(counts).filter(n=>n>1).length;
 return{objs,maps,missing,orphan,shared}
}
function renderAuthoring(){
 const c=authoringChecks(),mapped=c.maps.filter(x=>x.stations.length).length;
 M('v28Metrics').innerHTML='<div><b>'+c.objs.length+'</b><small>Objectives</small></div><div><b>'+mapped+'</b><small>Mapped</small></div><div><b>'+c.missing.length+'</b><small>Missing</small></div><div><b>'+c.orphan.length+'</b><small>Scene errors</small></div>';
 const issues=[];if(!state.v28.missionNavigator)issues.push('Mission Navigator is disabled.');if(c.missing.length)issues.push(c.missing.length+' objective(s) do not resolve to evidence stations.');if(c.orphan.length)issues.push(c.orphan.length+' mapped station(s) point to missing scenes.');if(c.shared)issues.push(c.shared+' station mapping(s) are shared by multiple objectives.');
 M('v28Readiness').innerHTML=issues.length?'<div class="v28-pill"><span class="v28-dot warn"></span>'+e28(issues.join(' '))+'</div>':'<div class="v28-pill"><span class="v28-dot"></span>Mission runtime is ready for the learner experience.</div>';
 M('v28ObjectiveMap').innerHTML=c.maps.length?c.maps.map((x,i)=>'<div class="v28-row"><span class="v28-num">'+(i+1)+'</span><div><b>'+e28(state.v28.showObjectiveText?x.o.text:'Objective '+(i+1))+'</b><div class="muted">'+(x.stations.length?x.stations.map(s=>e28(s.name)).join(' · '):'No mapped evidence station')+'</div></div><div><span class="v28-pill"><span class="v28-dot '+(x.stations.length?'':'fail')+'"></span>'+(x.stations.length?x.stations.length+' evidence':'Needs mapping')+'</span></div></div>').join(''):'<div class="muted">Add learning objectives to build the learner mission map.</div>'
}
M('v28Preview').onclick=()=>M('previewBtn')?.click();

const prevRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=prevRuntime(preview);if(!state.v28?.missionNavigator)return html;
 const payload=JSON.stringify({settings:state.v28||{},objectives:objectives().map((o,i)=>({index:o.index,text:o.text,stationIds:mappedStations(o,i).map(s=>s.id),sceneIds:Array.from(new Set(mappedStations(o,i).map(s=>s.sceneId)))}))}).replace(/</g,'\\u003c');
 const css=`<style>
 #v28MissionBtn{position:fixed;right:16px;bottom:16px;z-index:75;border:1px solid #ffffff44;background:#0f1d31f2;color:#fff;border-radius:999px;padding:10px 14px;font:600 13px system-ui;cursor:pointer}
 #v28Mission{position:fixed;right:16px;top:84px;bottom:68px;z-index:76;width:min(390px,calc(100vw - 32px));display:none;overflow:auto;background:#071225f7;color:#fff;border:1px solid #ffffff35;border-radius:14px;box-shadow:0 20px 60px #0008;padding:14px;font-family:system-ui}
 #v28Mission.open{display:block}#v28Mission h2{font-size:18px;margin:0 36px 4px 0}#v28MissionClose{position:absolute;right:12px;top:10px;background:transparent;border:0;color:#fff;font-size:22px;cursor:pointer}
 .v28r-item{border:1px solid #ffffff24;border-radius:10px;padding:10px;margin:8px 0;background:#ffffff08}.v28r-item.done{border-color:#34d39966;background:#34d39912}.v28r-item b{display:block;font-size:13px}.v28r-item small{display:block;opacity:.76;margin-top:4px}.v28r-item button,.v28r-action{margin-top:8px;border:1px solid #ffffff35;background:#142640;color:#fff;border-radius:8px;padding:8px 10px;cursor:pointer}.v28r-progress{height:7px;border-radius:999px;background:#ffffff20;overflow:hidden;margin:12px 0}.v28r-progress span{display:block;height:100%;background:#34d399}.v28r-summary{font-size:12px;opacity:.82}.v28r-next{border-left:3px solid #7dd3fc;padding-left:9px;margin:10px 0}
 #v28Debrief{position:fixed;inset:0;z-index:90;background:#07101de8;display:none;align-items:center;justify-content:center;padding:18px;font-family:system-ui;color:#fff}#v28Debrief.open{display:flex}#v28Debrief>div{width:min(620px,100%);background:#0b1729;border:1px solid #ffffff35;border-radius:16px;padding:20px;box-shadow:0 24px 80px #0009}#v28Debrief h2{margin-top:0}
 @media(max-width:640px){#v28Mission{left:10px;right:10px;top:72px;bottom:62px;width:auto}}
 </style>`;
 const body=`<button id="v28MissionBtn" aria-haspopup="dialog" aria-controls="v28Mission">Mission</button><aside id="v28Mission" role="dialog" aria-modal="false" aria-label="Learning mission progress"><button id="v28MissionClose" aria-label="Close mission navigator">×</button><h2>Learning Mission</h2><div id="v28MissionBody"></div></aside><div id="v28Debrief" role="dialog" aria-modal="true" aria-labelledby="v28DebriefTitle"><div><h2 id="v28DebriefTitle">Mission Complete</h2><div id="v28DebriefBody"></div><button class="v28r-action" id="v28DebriefClose">Return to experience</button></div></div>`;
 const script=`<script>
 (function(){
 const cfg=${payload};const btn=document.getElementById('v28MissionBtn'),panel=document.getElementById('v28Mission'),body=document.getElementById('v28MissionBody'),close=document.getElementById('v28MissionClose'),debrief=document.getElementById('v28Debrief'),debriefBody=document.getElementById('v28DebriefBody'),debriefClose=document.getElementById('v28DebriefClose');let debriefShown=false;
 const has=id=>completed.has(id)||completed.has(String(id));
 function status(o){const ids=o.stationIds||[];return ids.length>0&&ids.every(has)}
 function stationFor(o){return(o.stationIds||[]).map(id=>(project.stations||[]).find(s=>String(s.id)===String(id))).find(Boolean)}
 function objectiveLabel(o,i){return cfg.settings.showObjectiveText!==false?o.text:'Objective '+(i+1)}
 function current(){return(cfg.objectives||[]).find(o=>!status(o))||null}
 function render(){const list=cfg.objectives||[],done=list.filter(status).length,pct=list.length?Math.round(done/list.length*100):0,next=current();body.innerHTML='<div class="v28r-summary">'+done+' of '+list.length+' objectives complete</div><div class="v28r-progress"><span style="width:'+pct+'%"></span></div>'+(next?'<div class="v28r-next"><b>Next evidence</b><div>'+safe(objectiveLabel(next,list.indexOf(next)))+'</div><small>'+safe(stationFor(next)?.name||'Mapped learning evidence')+'</small></div>':'<div class="v28r-next"><b>All mapped objectives are complete.</b></div>')+list.map((o,i)=>{const s=stationFor(o),done=status(o);return'<div class="v28r-item '+(done?'done':'')+'"><b>'+(done?'✓ ':'')+safe(objectiveLabel(o,i))+'</b><small>'+safe(s?.name||'No evidence mapped')+'</small>'+(!done&&cfg.settings.guidedNavigation!==false&&s?'<button data-v28-go="'+safe(String(s.id))+'">Go to next evidence</button>':'')+'</div>'}).join('');body.querySelectorAll('[data-v28-go]').forEach(b=>b.onclick=()=>{const s=(project.stations||[]).find(x=>String(x.id)===String(b.dataset.v28Go));if(!s)return;panel.classList.remove('open');showScene(s.sceneId);setTimeout(()=>{try{openStation(s)}catch(e){}},80)});btn.textContent='Mission '+pct+'%';if(cfg.settings.autoDebrief!==false&&list.length&&done===list.length&&!debriefShown){debriefShown=true;showDebrief(list)}}
 function showDebrief(list){const total=(project.stations||[]).reduce((a,s)=>a+Number(s.points||0),0)+(project.questions||[]).reduce((a,q)=>a+Number(q.points||0),0);debriefBody.innerHTML='<p>You completed all mapped learning objectives.</p><ul>'+list.map((o,i)=>'<li>'+safe(objectiveLabel(o,i))+'</li>').join('')+'</ul><p class="v28r-summary">Configured assessment weight: '+total+' points · Passing score: '+Number(project.passing||0)+'%</p>';debrief.classList.add('open');debriefClose.focus()}
 btn.onclick=()=>{panel.classList.toggle('open');if(panel.classList.contains('open'))close.focus()};close.onclick=()=>{panel.classList.remove('open');btn.focus()};debriefClose.onclick=()=>{debrief.classList.remove('open');btn.focus()};document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(debrief.classList.contains('open'))debriefClose.click();else if(panel.classList.contains('open'))close.click()}});
 const oldUpdate=update;update=function(){const r=oldUpdate();render();return r};const oldShow=showScene;showScene=function(id){const r=oldShow(id);setTimeout(render,0);return r};render();window.V28Runtime={render,current,status};
 })();
 <\/script>`;
 html=html.replace('</head>',css+'</head>');html=html.replace('<a-scene id="scene"',body+'<a-scene id="scene"');return html.replace('</body></html>',script+'</body></html>')
};

function checks(){
 const c=authoringChecks();
 return[
  {level:state.v28.missionNavigator?'pass':'warn',name:'V28 learner mission navigator',detail:state.v28.missionNavigator?'Mission Navigator is enabled in the learner runtime.':'Mission Navigator is disabled.'},
  {level:c.missing.length?'fail':'pass',name:'V28 objective evidence mapping',detail:c.missing.length?c.missing.length+' objective(s) lack mapped evidence.':'Every objective resolves to learner evidence.'},
  {level:c.orphan.length?'fail':'pass',name:'V28 mission scene integrity',detail:c.orphan.length?c.orphan.length+' mapped evidence station(s) reference missing scenes.':'Mapped evidence stations resolve to valid scenes.'},
  {level:c.shared?'warn':'pass',name:'V28 objective mapping specificity',detail:c.shared?c.shared+' evidence mapping(s) are shared across objectives.':'Objective evidence mappings are distinct.'},
  {level:state.v28.autoDebrief?'pass':'warn',name:'V28 completion debrief',detail:state.v28.autoDebrief?'Automatic learner debrief is enabled.':'Automatic learner debrief is disabled.'},
  {level:'pass',name:'V28 SCORM state model',detail:'Mission progress derives from existing completed/answered state persisted by the audited SCORM runtime; no duplicate grade model is introduced.'}
 ]
}
const oldChecks=window.VRClassroomAudit?.checks,oldRun=window.VRClassroomAudit?.run;
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=checks(),all=[...base,...extras],p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(M('auditPass'))M('auditPass').textContent=p;if(M('auditWarn'))M('auditWarn').textContent=w;if(M('auditFail'))M('auditFail').textContent=f;if(M('auditResults'))M('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+e28(x.name)+'</b><div class="muted">'+e28(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};
const oldRender=render;render=function(){oldRender();ensureV28();setTimeout(renderAuthoring,0)};renderAuthoring();
})();