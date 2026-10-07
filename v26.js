(()=>{
const F=id=>document.getElementById(id);
const e26=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV26(){
 state.version=26;
 state.v26=state.v26||{lastForge:null,defaultTopology:'hub',defaultMode:'exploration'};
}
ensureV26();
const main=document.querySelector('main.workspace');if(!main)return;
let lastSnapshot=null;

const forge=document.createElement('section');forge.className='card';forge.id='immersiveLessonForgeCard';
forge.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Immersive Lesson Forge <span class="v6-badge">V26</span></h3>
 <div class="muted">Turn learning objectives into a real multi-scene VR/AR-ready instructional world for Blackboard SCORM — without programming.</div></div>
 <div class="v26-toolbar"><button class="btn" id="v26Preview">Preview Student</button><button class="btn primary" id="v26Forge">Forge Immersive Activity</button></div>
</div>
<div class="v26-grid" style="margin-top:14px">
 <div class="v26-panel">
  <div class="field"><label>Activity title</label><input id="v26Title" placeholder="Immersive learning activity"></div>
  <div class="row">
   <div class="field"><label>World topology</label><select id="v26Topology"><option value="hub">Central Hub</option><option value="sequence">Mission Sequence</option><option value="constellation">Knowledge Constellation</option></select></div>
   <div class="field"><label>Delivery target</label><select id="v26Delivery"><option value="hybrid">Hybrid · Desktop + VR</option><option value="vr">VR-first + desktop fallback</option><option value="ar">AR-oriented + desktop fallback</option><option value="desktop">Desktop 3D</option></select></div>
  </div>
  <div class="field"><label>Learning experience</label>
   <div class="v26-mode">
    <label><input type="radio" name="v26Mode" value="exploration" checked><b>Explore</b><small>Discover evidence in space.</small></label>
    <label><input type="radio" name="v26Mode" value="scenario"><b>Scenario</b><small>Make contextual decisions.</small></label>
    <label><input type="radio" name="v26Mode" value="lab"><b>Lab</b><small>Perform a simulated procedure.</small></label>
    <label><input type="radio" name="v26Mode" value="roleplay"><b>Role-play</b><small>Respond from an assigned role.</small></label>
   </div>
  </div>
  <div class="row">
   <div class="field"><label>Build mode</label><select id="v26BuildMode"><option value="replace">New activity · replace instructional world</option><option value="append">Add world to current project</option></select></div>
   <div class="field"><label>Passing score</label><input id="v26Passing" type="number" min="0" max="100" value="80"></div>
  </div>
  <div class="v26-note">V26 creates scenes, required learning stations, spatial station markers, portal topology, competency/evidence mappings and a 100-point scoring blueprint. Generated instructional content still requires instructor review before publication.</div>
 </div>
 <div class="v26-panel">
  <h4 style="margin-top:0">Forge Preview</h4>
  <div id="v26Summary" class="v26-summary"></div>
  <div id="v26Plan" style="margin-top:10px"></div>
 </div>
</div>
<div class="v26-grid" style="margin-top:14px">
 <div class="v26-panel"><h4 style="margin-top:0">Spatial Topology</h4><div id="v26Map" class="v26-map" role="img" aria-label="Generated immersive learning topology preview"></div></div>
 <div class="v26-panel"><h4 style="margin-top:0">Learning Evidence Blueprint</h4><div id="v26Evidence"></div></div>
</div>
<div class="v26-toolbar" style="margin-top:12px">
 <button class="btn" id="v26Review">Mark latest forge as instructor-reviewed</button>
 <button class="btn danger" id="v26Undo">Undo latest forge (this session)</button>
 <span id="v26ForgeStatus" class="v26-status"><span class="v26-dot"></span>No V26 world generated yet</span>
</div>`;
main.insertBefore(forge,main.querySelector('#spatialDesignerCard')||main.firstChild);

const nav=document.querySelector('aside .nav');
if(nav){const b=document.createElement('button');b.innerHTML='🌐 Immersive Lesson Forge <span class="badge">V26</span>';b.onclick=()=>forge.scrollIntoView({behavior:'smooth'});nav.insertBefore(b,nav.children[1]||null)}

F('v26Title').value=state.title||'Immersive Learning Mission';
F('v26Passing').value=Number(state.passing||80);
F('v26Topology').value=state.v26.defaultTopology||'hub';
F('v26Delivery').value=state.xr?.deliveryMode||'hybrid';
const savedMode=state.v26.defaultMode||'exploration';
const radio=[...document.querySelectorAll('input[name="v26Mode"]')].find(x=>x.value===savedMode);if(radio)radio.checked=true;

function objectives(){
 return (state.objectives||[]).map((o,i)=>({index:i,text:typeof o==='string'?o:(o.text||o.title||('Objective '+(i+1)))})).filter(x=>x.text.trim())
}
function mode(){return document.querySelector('input[name="v26Mode"]:checked')?.value||'exploration'}
function short(text,n=31){const s=String(text||'');return s.length>n?s.slice(0,n-1)+'…':s}
function pointPlan(n){if(!n)return[];const base=Math.floor(100/n),rem=100-base*n;return Array.from({length:n},(_,i)=>base+(i<rem?1:0))}
function modeContent(kind,obj){
 const map={
  exploration:'Explore the immersive environment and identify evidence that demonstrates this objective: ',
  scenario:'Analyze the simulated situation, make a justified decision, and demonstrate this objective: ',
  lab:'Perform the simulated procedure, document the result, and demonstrate this objective: ',
  roleplay:'Respond from the assigned role, justify your action, and demonstrate this objective: '
 };return (map[kind]||map.exploration)+obj
}
function topologyPlan(){
 const objs=objectives(),top=F('v26Topology').value,title=F('v26Title').value.trim()||state.title||'Immersive Learning Mission';
 const nodes=[{id:'entry',label:top==='hub'?'Mission Hub':top==='sequence'?'Mission Briefing':'Knowledge Nexus',kind:'entry'}];
 objs.forEach((o,i)=>nodes.push({id:'objective-'+i,label:'Objective '+(i+1),sub:short(o.text,36),kind:'objective'}));
 if(top==='sequence')nodes.push({id:'complete',label:'Completion Deck',kind:'complete'});
 const edges=[];
 if(top==='hub'){objs.forEach((o,i)=>{edges.push({from:'entry',to:'objective-'+i});edges.push({from:'objective-'+i,to:'entry',return:true})})}
 if(top==='sequence'){if(objs.length)edges.push({from:'entry',to:'objective-0'});objs.forEach((o,i)=>edges.push({from:'objective-'+i,to:i<objs.length-1?'objective-'+(i+1):'complete'}))}
 if(top==='constellation'){objs.forEach((o,i)=>{edges.push({from:'entry',to:'objective-'+i});edges.push({from:'objective-'+i,to:'entry',return:true});if(objs.length>1)edges.push({from:'objective-'+i,to:'objective-'+((i+1)%objs.length)})})}
 return {title,top,nodes,edges,objs}
}
function renderPlan(){
 const p=topologyPlan(),pts=pointPlan(p.objs.length),portalCount=p.edges.length;
 F('v26Summary').innerHTML='<div><b>'+p.nodes.length+'</b><small>Scenes</small></div><div><b>'+p.objs.length+'</b><small>Required stations</small></div><div><b>'+portalCount+'</b><small>Portals</small></div><div><b>100</b><small>SCORM points</small></div>';
 F('v26Plan').innerHTML='<div class="v26-review"><b>'+e26(p.title)+'</b><div class="muted">'+e26(p.top==='hub'?'Hub-and-spoke navigation gives learners freedom to choose objective rooms.':p.top==='sequence'?'Sequential navigation guides learners through objectives in a controlled mission path.':'Constellation navigation combines a central nexus with cross-linked objective rooms for nonlinear exploration.')+'</div></div>';
 F('v26Evidence').innerHTML=p.objs.length?p.objs.map((o,i)=>'<div class="v26-evidence"><span class="v26-num">'+(i+1)+'</span><div><b>'+e26(short(o.text,64))+'</b><div class="muted">'+e26(modeContent(mode(),o.text))+'</div></div><div><span class="v26-status"><span class="v26-dot"></span>Required evidence</span></div><div><b>'+pts[i]+' pts</b></div></div>').join(''):'<div class="muted">Add learning objectives before forging the immersive activity.</div>';
 renderMap(p)
}
function positions(p,w=760,h=350){
 const pos={};const objs=p.nodes.filter(n=>n.kind==='objective');
 if(p.top==='sequence'){
  const all=p.nodes,step=w/(all.length+1);all.forEach((n,i)=>pos[n.id]={x:step*(i+1),y:h/2});
 }else{
  pos.entry={x:w/2,y:h/2};
  const r=Math.min(w,h)*.36;objs.forEach((n,i)=>{const a=-Math.PI/2+2*Math.PI*i/Math.max(1,objs.length);pos[n.id]={x:w/2+Math.cos(a)*r,y:h/2+Math.sin(a)*r}});
 }
 return pos
}
function renderMap(p){
 const w=760,h=350,pos=positions(p,w,h);
 const defs='<defs><marker id="v26arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#9aa7b5"/></marker></defs>';
 const lines=p.edges.map(e=>{const a=pos[e.from],b=pos[e.to];if(!a||!b)return'';return '<line class="v26-edge '+(e.return?'return':'')+'" x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" marker-end="url(#v26arrow)"/>'}).join('');
 const nodes=p.nodes.map(n=>{const q=pos[n.id];if(!q)return'';return '<g class="v26-node '+(n.kind==='entry'?'entry':'')+'"><circle cx="'+q.x+'" cy="'+q.y+'" r="'+(n.kind==='entry'?28:23)+'"/><text text-anchor="middle" x="'+q.x+'" y="'+(q.y+4)+'">'+e26(short(n.label,18))+'</text>'+(n.sub?'<text class="sub" text-anchor="middle" x="'+q.x+'" y="'+(q.y+42)+'">'+e26(short(n.sub,28))+'</text>':'')+'</g>'}).join('');
 F('v26Map').innerHTML='<svg viewBox="0 0 '+w+' '+h+'" aria-hidden="true">'+defs+lines+nodes+'</svg>'
}
['v26Title','v26Topology','v26Delivery','v26Passing','v26BuildMode'].forEach(id=>F(id).addEventListener('input',renderPlan));
document.querySelectorAll('input[name="v26Mode"]').forEach(x=>x.addEventListener('change',renderPlan));

function snapshot(){
 return JSON.parse(JSON.stringify({
  title:state.title,environment:state.environment,instructions:state.instructions,passing:state.passing,completion:state.completion,
  scenes:state.scenes||[],stations:state.stations||[],objects:state.objects||[],questions:state.questions||[],
  competencies:state.competencies||[],masteryRules:state.masteryRules||[],adaptivePaths:state.adaptivePaths||[],
  rules:state.rules||[],npcs:state.npcs||[],animations:state.animations||[],activeSceneId:state.activeSceneId,xr:state.xr||{}
 }))
}
function restore(s){
 if(!s)return;Object.keys(s).forEach(k=>state[k]=JSON.parse(JSON.stringify(s[k])));
 if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render()
}
function uid(prefix,i=0){return prefix+'-'+Date.now().toString(36)+'-'+i+'-'+Math.random().toString(36).slice(2,6)}
function scene(id,name,kind){return{id,name,environment:name,sky:'#dfe8f2',v26Generated:true,v26Kind:kind}}
function portal(sceneId,targetSceneId,label,x,z){
 return{id:uid('v26-portal'),sceneId,type:'portal',label,x,y:1,z,rotationY:0,scale:1,targetSceneId,v26Generated:true}
}
function marker(sceneId,stationId,label){
 return{id:uid('v26-marker'),sceneId,type:'station',label,x:0,y:1,z:-5,rotationY:0,scale:1,stationId,v26Generated:true}
}
function forgeWorld(){
 const p=topologyPlan();if(!p.objs.length)return alert('Add at least one learning objective before forging an immersive activity.');
 const buildMode=F('v26BuildMode').value;
 if(buildMode==='replace'&&!confirm('Create a new immersive activity and replace the current instructional world? The previous world can be restored with Undo during this browser session.'))return;
 lastSnapshot=snapshot();
 if(buildMode==='replace'){
   state.scenes=[];state.stations=[];state.objects=[];state.questions=[];state.competencies=[];state.masteryRules=[];state.adaptivePaths=[];state.rules=[];state.npcs=[];state.animations=[];state.v22Generated=[];
 }
 const kind=mode(),pts=pointPlan(p.objs.length),created={sceneIds:[],stationIds:[],objectIds:[],competencyIds:[]};
 const sceneMap={};
 p.nodes.forEach((n,i)=>{const id=uid('v26-scene',i);sceneMap[n.id]=id;const s=scene(id,n.kind==='objective'?('Objective '+(i)+': '+short(n.sub||n.label,52)):n.label,n.kind);state.scenes.push(s);created.sceneIds.push(id)});
 p.objs.forEach((o,i)=>{
   const sceneId=sceneMap['objective-'+i],sid=uid('v26-station',i),station={
     id:sid,sceneId,name:'Evidence Station '+(i+1),type:kind==='exploration'?'resource':'reflection',
     content:modeContent(kind,o.text),points:pts[i],required:true,
     alt:'Learning evidence station for objective '+(i+1),v26Generated:true,objectiveIndex:o.index
   };
   state.stations.push(station);created.stationIds.push(sid);
   const m=marker(sceneId,sid,'Evidence '+(i+1));state.objects.push(m);created.objectIds.push(m.id);
   const cid=uid('v26-comp',i);state.competencies.push({id:cid,name:'Objective '+(i+1)+' Mastery',description:o.text,threshold:Number(F('v26Passing').value)||80,objectiveIndexes:[o.index],stationIds:[sid],questionIds:[],v26Generated:true});created.competencyIds.push(cid)
 });
 p.edges.forEach((e,i)=>{
   const a=sceneMap[e.from],b=sceneMap[e.to];if(!a||!b)return;
   const fromNode=p.nodes.find(n=>n.id===e.from),toNode=p.nodes.find(n=>n.id===e.to);
   const angle=i*Math.PI/3,x=Math.round(Math.cos(angle)*4*10)/10,z=Math.round((-4+Math.sin(angle)*2.5)*10)/10;
   const po=portal(a,b,'Portal to '+(toNode?.label||'next scene'),x,z);state.objects.push(po);created.objectIds.push(po.id)
 });
 const entryId=sceneMap.entry||created.sceneIds[0];
 const introId=uid('v26-intro'),intro={id:introId,sceneId:entryId,name:'Mission Briefing',type:'resource',content:'Review the mission, visit every required evidence station, and demonstrate mastery of each learning objective.',points:0,required:false,alt:'Immersive activity mission briefing',v26Generated:true};
 state.stations.push(intro);created.stationIds.push(introId);
 const introMarker=marker(entryId,introId,'Mission Briefing');introMarker.x=0;introMarker.z=-3;state.objects.push(introMarker);created.objectIds.push(introMarker.id);
 state.title=F('v26Title').value.trim()||p.title;state.environment=kind==='lab'?'Simulation Lab':kind==='exploration'?'Museum / Gallery':'Virtual Classroom';
 state.instructions='Navigate the immersive world, complete each required evidence station, and demonstrate the stated learning objectives.';
 state.passing=Math.max(0,Math.min(100,Number(F('v26Passing').value)||80));state.completion='all';state.activeSceneId=entryId;
 if(F('title'))F('title').value=state.title;if(F('environment'))F('environment').value=state.environment;if(F('instructions'))F('instructions').value=state.instructions;if(F('passing'))F('passing').value=state.passing;if(F('completion'))F('completion').value=state.completion;
 state.xr=state.xr||{};state.xr.deliveryMode=F('v26Delivery').value;
 state.accessibility=state.accessibility||{};if(!state.accessibility.desktopFallback)state.accessibility.desktopFallback='required';
 state.v26.defaultTopology=p.top;state.v26.defaultMode=kind;
 state.v26.lastForge={...created,topology:p.top,mode:kind,buildMode,createdAt:new Date().toISOString(),reviewedAt:null,title:state.title};
 if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render();
 renderForgeStatus();renderPlan();
 alert('Immersive activity forged. Review the generated world, preview the learner experience, run QA, and mark it instructor-reviewed before publication.')
}
F('v26Forge').onclick=forgeWorld;
F('v26Preview').onclick=()=>F('previewBtn')?.click();
F('v26Review').onclick=()=>{const x=state.v26.lastForge;if(!x)return alert('Forge an immersive activity first.');x.reviewedAt=new Date().toISOString();x.reviewedBy=state.ownership?.owner||'Instructor';renderForgeStatus();alert('Latest V26 forge marked as instructor-reviewed.')};
F('v26Undo').onclick=()=>{
 if(!lastSnapshot)return alert('No in-session V26 forge snapshot is available to restore.');
 if(!confirm('Restore the instructional world from immediately before the latest V26 forge?'))return;
 restore(lastSnapshot);lastSnapshot=null;state.v26.lastForge=null;renderForgeStatus();renderPlan()
};
function renderForgeStatus(){
 const x=state.v26.lastForge,el=F('v26ForgeStatus');if(!el)return;
 if(!x){el.innerHTML='<span class="v26-dot"></span>No V26 world generated yet';return}
 el.innerHTML='<span class="v26-dot '+(x.reviewedAt?'':'warn')+'"></span>'+e26(x.reviewedAt?'Instructor-reviewed':'Awaiting instructor review')+' · '+e26(x.topology)+' · '+x.sceneIds.length+' scenes'
}

function v26Checks(){
 const x=state.v26.lastForge;if(!x)return[{level:'warn',name:'Immersive Lesson Forge',detail:'No V26 immersive world has been forged yet.'}];
 const scenes=state.scenes||[],stations=state.stations||[],objects=state.objects||[],comps=state.competencies||[];
 const sceneIds=new Set(scenes.map(s=>String(s.id))),generatedStations=stations.filter(s=>(x.stationIds||[]).some(id=>String(id)===String(s.id))&&s.required&&s.objectiveIndex!=null);
 const broken=objects.filter(o=>(x.objectIds||[]).some(id=>String(id)===String(o.id))&&o.type==='portal'&&(!o.targetSceneId||!sceneIds.has(String(o.targetSceneId))));
 const stationPoints=generatedStations.reduce((a,s)=>a+Number(s.points||0),0);
 const questionPoints=(state.questions||[]).filter(q=>generatedStations.some(s=>String(s.id)===String(q.stationId))).reduce((a,q)=>a+Number(q.points||0),0);
 const points=stationPoints+questionPoints,required=generatedStations.length;
 const missingMarker=generatedStations.filter(s=>!objects.some(o=>o.type==='station'&&String(o.stationId)===String(s.id)));
 const missingComp=generatedStations.filter(s=>!comps.some(c=>(c.stationIds||[]).some(id=>String(id)===String(s.id))));
 return[
  {level:broken.length?'fail':'pass',name:'V26 portal integrity',detail:broken.length?broken.length+' generated portal(s) target missing scenes.':'All generated portals resolve to existing scenes.'},
  {level:points===100?'pass':'warn',name:'V26 scoring blueprint',detail:'Generated required evidence totals '+points+' of 100 points.'},
  {level:required===objectives().length?'pass':'warn',name:'V26 objective coverage',detail:required+' required evidence station(s) cover '+objectives().length+' objective(s).'},
  {level:missingMarker.length?'warn':'pass',name:'V26 spatial evidence markers',detail:missingMarker.length?missingMarker.length+' evidence station(s) lack a spatial marker.':'Every scored evidence station has a spatial marker.'},
  {level:missingComp.length?'warn':'pass',name:'V26 competency alignment',detail:missingComp.length?missingComp.length+' evidence station(s) lack competency mapping.':'Every scored evidence station maps to a competency.'},
  {level:x.reviewedAt?'pass':'warn',name:'V26 instructor review gate',detail:x.reviewedAt?'Latest forged world was instructor-reviewed.':'Generated instructional content must be reviewed before publication.'},
  {level:state.accessibility?.desktopFallback==='required'?'pass':'warn',name:'V26 device resilience',detail:'Desktop fallback is '+(state.accessibility?.desktopFallback||'not configured')+' for immersive delivery.'}
 ]
}
const oldValidateV26=validateProject;
validateProject=function(){
 const issues=oldValidateV26();
 const x=state.v26?.lastForge;
 if(x&&!x.reviewedAt)issues.push('Review and mark the latest V26 forged instructional world before final SCORM export.');
 return [...new Set(issues)]
};

const oldChecks=window.VRClassroomAudit?.checks,oldRun=window.VRClassroomAudit?.run;
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v26Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{
 const base=oldRun(scroll),extras=v26Checks(),all=[...base,...extras],p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;
 if(F('auditPass'))F('auditPass').textContent=p;if(F('auditWarn'))F('auditWarn').textContent=w;if(F('auditFail'))F('auditFail').textContent=f;
 if(F('auditResults'))F('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+e26(x.name)+'</b><div class="muted">'+e26(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));
 return all
};

const oldRender=render;
render=function(){oldRender();ensureV26();setTimeout(()=>{renderForgeStatus();renderPlan()},0)};
renderPlan();renderForgeStatus();
})();