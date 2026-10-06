(()=>{
const C=id=>document.getElementById(id);
const esc22=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV22(){
 state.version=22;
 state.v22Settings=state.v22Settings||{cosmicMode:false,knowledgeGraph:true,constellationRuntime:true,proceduralScene:true,performanceBudget:true,webgpuAcceleration:'auto'};
 state.v22Generated=state.v22Generated||[];
}
ensureV22();
const main=document.querySelector('main.workspace');if(!main)return;

/* Mission Control */
const mission=document.createElement('section');mission.className='card';mission.id='cosmicMissionControl';
mission.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Cosmic Mission Control <span class="v6-badge">V22</span></h3><div class="muted">Frontier device-capability telemetry using real browser technologies. “Alien-inspired” is a visual/interaction concept, not verified extraterrestrial technology.</div></div><button class="btn primary" id="v22Scan">Scan device capabilities</button></div>
<div id="v22Metrics" class="v22-metrics" style="margin-top:12px"></div>
<div class="v22-grid" style="margin-top:12px"><div class="v22-card"><h4 style="margin-top:0">Deep-XR capability matrix</h4><div id="v22Capabilities"></div></div><div class="v22-card"><h4 style="margin-top:0">Experimental controls</h4><div class="field"><label>Alien-inspired visual mode</label><select id="v22CosmicMode"><option value="false">Off</option><option value="true">On — aesthetic only</option></select></div><div class="field"><label>Runtime Constellation Navigator</label><select id="v22Constellation"><option value="true">Enabled</option><option value="false">Disabled</option></select></div><div class="field"><label>WebGPU acceleration policy</label><select id="v22WebGPU"><option value="auto">Auto-detect</option><option value="off">Off</option></select></div><div class="v22-warning">No claim is made that any feature uses extraterrestrial technology. V22 uses standard browser/XR APIs and science-fiction-inspired interaction design.</div></div></div>`;
main.appendChild(mission);

/* Knowledge graph */
const graph=document.createElement('section');graph.className='card';graph.id='cosmicKnowledgeGraph';
graph.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Spatial Knowledge Constellation <span class="v6-badge">V22</span></h3><div class="muted">Visualize scenes, stations, competencies, NPCs and adaptive/rule relationships as a spatial knowledge graph.</div></div><div class="toolbar"><button class="btn primary" id="v22RenderGraph">Rebuild constellation</button><button class="btn" id="v22ExportGraph">Export graph JSON</button></div></div>
<div id="v22Graph" class="v22-graph v22-stars" style="margin-top:12px"></div>
<div id="v22GraphLegend" class="muted" style="margin-top:8px">Scene · Station · Competency · NPC · Rule / adaptive edge</div>`;
main.appendChild(graph);

/* Procedural synthesizer */
const synth=document.createElement('section');synth.className='card';synth.id='proceduralScenarioSynthesizer';
synth.innerHTML=`
<div><h3 style="margin:0">Procedural Scenario Synthesizer <span class="v6-badge">V22</span></h3><div class="muted">Generate a new immersive “Orbital Knowledge Nexus” from the project objectives using deterministic authoring logic — no external AI service required.</div></div>
<div class="v22-grid" style="margin-top:12px"><div class="v22-card"><div class="field"><label>Scenario name</label><input id="v22ScenarioName" value="Orbital Knowledge Nexus"></div><div class="field"><label>Architecture</label><select id="v22Architecture"><option value="hub">Central hub + objective stations</option><option value="sequence">Sequential mission path</option><option value="constellation">Constellation clusters</option></select></div><div class="field"><label>Generation scope</label><select id="v22Scope"><option value="scene">Add one new scene</option><option value="scene+stations">Add scene + objective stations</option></select></div><div class="toolbar"><button class="btn primary" id="v22Generate">Generate scenario</button><button class="btn" id="v22MarkReviewed">Mark latest as reviewed</button><button class="btn danger" id="v22UndoGenerated">Remove last generated scenario</button></div></div><div class="v22-card"><h4 style="margin-top:0">Synthesis preview</h4><div id="v22SynthesisPreview" class="v22-list"></div></div></div>`;
main.appendChild(synth);

/* Performance + topology */
const topology=document.createElement('section');topology.className='card';topology.id='deepXRTopologyAudit';
topology.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Deep-XR Topology & Performance Audit <span class="v6-badge">V22</span></h3><div class="muted">Detect unreachable scenes, high-density geometry, media pressure, rule complexity and XR comfort risks.</div></div><button class="btn primary" id="v22TopologyAudit">Run Deep-XR audit</button></div><div id="v22TopologyResults" style="margin-top:12px"></div>`;
main.appendChild(topology);

const nav=document.querySelector('aside .nav');if(nav){[['🛸 Cosmic Mission Control',mission],['✨ Knowledge Constellation',graph],['🧬 Scenario Synthesizer',synth],['🛰 Deep-XR Audit',topology]].forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)})}

C('v22CosmicMode').value=String(!!state.v22Settings.cosmicMode);
C('v22Constellation').value=String(!!state.v22Settings.constellationRuntime);
C('v22WebGPU').value=state.v22Settings.webgpuAcceleration||'auto';
C('v22CosmicMode').onchange=()=>{state.v22Settings.cosmicMode=C('v22CosmicMode').value==='true';document.documentElement.dataset.v22Cosmic=String(state.v22Settings.cosmicMode)};
C('v22Constellation').onchange=()=>state.v22Settings.constellationRuntime=C('v22Constellation').value==='true';
C('v22WebGPU').onchange=()=>state.v22Settings.webgpuAcceleration=C('v22WebGPU').value;

async function capabilityScan(){
 const secure=window.isSecureContext,xr=!!navigator.xr,gpu=!!navigator.gpu,offscreen='OffscreenCanvas'in window,sab='SharedArrayBuffer'in window,wasm=typeof WebAssembly!=='undefined',orientation='DeviceOrientationEvent'in window,gamepad=!!navigator.getGamepads;
 let vr=false,ar=false;if(xr){try{vr=await navigator.xr.isSessionSupported('immersive-vr')}catch{}try{ar=await navigator.xr.isSessionSupported('immersive-ar')}catch{}}
 const caps=[
  ['Secure Context',secure,'Required by many immersive APIs.'],
  ['WebXR API',xr,'Browser exposes navigator.xr.'],
  ['Immersive VR',vr,'immersive-vr session support reported.'],
  ['Immersive AR',ar,'immersive-ar session support reported; this does not guarantee the project implements full AR placement.'],
  ['WebGPU',gpu,'Modern GPU compute/render API available for future acceleration.'],
  ['OffscreenCanvas',offscreen,'Background rendering/workers can be supported.'],
  ['SharedArrayBuffer',sab,'High-performance shared memory available when isolation requirements are met.'],
  ['WebAssembly',wasm,'Binary compute modules supported.'],
  ['Device Orientation',orientation,'Orientation sensors API exists on this device/browser.'],
  ['Gamepad API',gamepad,'Controller/gamepad enumeration available.']
 ];
 C('v22Capabilities').innerHTML=caps.map(([n,v,d])=>'<div class="v22-cap"><span class="v22-orb '+(v?'ok':'warn')+'"></span><div><b>'+n+'</b><small class="muted">'+esc22(d)+'</small></div><span class="v16-badge">'+(v?'YES':'NO')+'</span></div>').join('');
 C('v22Metrics').innerHTML='<div><b>'+caps.filter(x=>x[1]).length+'/'+caps.length+'</b><small>Capabilities</small></div><div><b>'+(vr?'YES':'NO')+'</b><small>VR</small></div><div><b>'+(ar?'YES':'NO')+'</b><small>AR API</small></div><div><b>'+(gpu?'YES':'NO')+'</b><small>WebGPU</small></div><div><b>'+(sab?'YES':'NO')+'</b><small>Shared memory</small></div>';
 return {secure,xr,vr,ar,gpu,offscreen,sab,wasm,orientation,gamepad}
}
C('v22Scan').onclick=()=>capabilityScan();

function graphData(){
 const nodes=[],edges=[];
 const add=(id,label,type,ref)=>{if(!nodes.some(n=>n.id===String(id)))nodes.push({id:String(id),label:String(label||id),type,ref})};
 (state.scenes||[]).forEach(s=>add('scene:'+s.id,s.name,'scene',s.id));
 (state.stations||[]).forEach(s=>{add('station:'+s.id,s.name,'station',s.id);if(s.sceneId!=null)edges.push({from:'scene:'+s.sceneId,to:'station:'+s.id,type:'contains'})});
 (state.competencies||[]).forEach(c=>{add('comp:'+c.id,c.name,'competency',c.id);(c.stationIds||[]).forEach(id=>edges.push({from:'comp:'+c.id,to:'station:'+id,type:'evidence'}))});
 (state.npcs||[]).forEach(n=>{add('npc:'+n.id,n.name||'NPC','npc',n.id);if(n.sceneId!=null)edges.push({from:'scene:'+n.sceneId,to:'npc:'+n.id,type:'contains'})});
 (state.objects||[]).filter(o=>o.type==='portal'&&o.targetSceneId).forEach(o=>edges.push({from:'scene:'+o.sceneId,to:'scene:'+o.targetSceneId,type:'portal'}));
 (state.adaptivePaths||[]).forEach(p=>{edges.push({from:'scene:'+p.fromSceneId,to:'scene:'+p.remediationSceneId,type:'adaptive'});edges.push({from:'scene:'+p.fromSceneId,to:'scene:'+p.masterySceneId,type:'adaptive'})});
 (state.rules||[]).filter(r=>r.enabled&&r.action==='open-scene'&&r.targetSceneId).forEach(r=>{let from='';if(r.event==='scene-enter')from='scene:'+r.sourceId;else if(r.event==='object-click'){const o=(state.objects||[]).find(x=>String(x.id)===String(r.sourceId));if(o)from='scene:'+o.sceneId}else if(r.event==='station-complete'){const s=(state.stations||[]).find(x=>String(x.id)===String(r.sourceId));if(s)from='scene:'+s.sceneId}if(from)edges.push({from,to:'scene:'+r.targetSceneId,type:'rule'})});
 return {nodes,edges}
}
function colorFor(type){return {scene:'#7dd3fc',station:'#a7f3d0',competency:'#fde68a',npc:'#f0abfc'}[type]||'#cbd5e1'}
function renderGraph(){
 const {nodes,edges}=graphData(),host=C('v22Graph'),w=1000,h=500,cx=w/2,cy=h/2,r=Math.min(w,h)*.37;
 const pos=new Map();nodes.forEach((n,i)=>{const a=-Math.PI/2+(Math.PI*2*i/Math.max(1,nodes.length)),rr=n.type==='scene'?r*.72:n.type==='competency'?r:r*.88;pos.set(n.id,{x:cx+Math.cos(a)*rr,y:cy+Math.sin(a)*rr})});
 const lines=edges.map(e=>{const a=pos.get(e.from),b=pos.get(e.to);if(!a||!b)return '';return '<line class="v22-edge '+esc22(e.type)+'" x1="'+a.x.toFixed(1)+'" y1="'+a.y.toFixed(1)+'" x2="'+b.x.toFixed(1)+'" y2="'+b.y.toFixed(1)+'"/>'}).join('');
 const ns=nodes.map(n=>{const p=pos.get(n.id),label=n.label.length>20?n.label.slice(0,18)+'…':n.label;return '<g class="v22-node" data-node="'+esc22(n.id)+'"><circle cx="'+p.x.toFixed(1)+'" cy="'+p.y.toFixed(1)+'" r="'+(n.type==='scene'?11:8)+'" fill="'+colorFor(n.type)+'"/><text x="'+(p.x+14).toFixed(1)+'" y="'+(p.y+4).toFixed(1)+'">'+esc22(label)+'</text></g>'}).join('');
 host.innerHTML='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Spatial knowledge constellation"><g>'+lines+ns+'</g></svg>';
 host.querySelectorAll('[data-node]').forEach(g=>g.onclick=()=>{const n=nodes.find(x=>x.id===g.dataset.node);if(!n)return;alert(n.type.toUpperCase()+': '+n.label)});
 C('v22GraphLegend').textContent=nodes.length+' nodes · '+edges.length+' relationships · scene/portal/adaptive/rule/evidence topology';
 return {nodes,edges}
}
C('v22RenderGraph').onclick=renderGraph;
C('v22ExportGraph').onclick=()=>{const data=graphData(),blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(state.title||'VR-Classroom').replace(/[^a-z0-9]+/gi,'_')+'_KnowledgeGraph.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)};

function synthesisPreview(){
 const objs=state.objectives||[],arch=C('v22Architecture').value,name=C('v22ScenarioName').value.trim()||'Orbital Knowledge Nexus';
 C('v22SynthesisPreview').innerHTML='<div class="v22-item"><b>'+esc22(name)+'</b><small>'+esc22(arch)+' architecture</small></div>'+objs.map((o,i)=>'<div class="v22-item"><b>Objective '+(i+1)+'</b><small>'+esc22(typeof o==='string'?o:(o.text||o.title||JSON.stringify(o)))+'</small></div>').join('')
}
['v22ScenarioName','v22Architecture','v22Scope'].forEach(id=>C(id).addEventListener('input',synthesisPreview));
function nextId(arr,prefix){let i=1;while(arr.some(x=>String(x.id)===prefix+i))i++;return prefix+i}
function generateScenario(){
 const name=C('v22ScenarioName').value.trim()||'Orbital Knowledge Nexus',scope=C('v22Scope').value,arch=C('v22Architecture').value;
 state.scenes=state.scenes||[];state.stations=state.stations||[];
 const sceneId=nextId(state.scenes,'cosmic-'),scene={id:sceneId,name,sky:'#03111f',v22Generated:true,architecture:arch};state.scenes.push(scene);
 const stationIds=[];
 if(scope==='scene+stations'){
   (state.objectives||[]).forEach((o,i)=>{const text=typeof o==='string'?o:(o.text||o.title||JSON.stringify(o)),id=nextId(state.stations,'cosmic-station-');state.stations.push({id,sceneId,name:'Mission Node '+(i+1),type:'reflection',content:'Explore this objective in the '+name+': '+text,points:0,required:false,alt:'Mission Node '+(i+1)+' for '+text,v22Generated:true});stationIds.push(id)})
 }
 state.v22Generated.push({sceneId,stationIds,createdAt:new Date().toISOString(),name});state.activeSceneId=sceneId;
 if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render();renderGraph();runTopology();alert('Generated '+name+'. Review and edit the generated content before publication.')
}
C('v22Generate').onclick=generateScenario;
C('v22MarkReviewed').onclick=()=>{const x=state.v22Generated?.[state.v22Generated.length-1];if(!x)return alert('No generated scenario is available.');x.reviewedAt=new Date().toISOString();x.reviewedBy=state.metadata?.author||state.ownership?.owner||'Author';runTopology();alert('Latest generated scenario marked as reviewed.')};
C('v22UndoGenerated').onclick=()=>{const x=state.v22Generated.pop();if(!x)return alert('No generated scenario to remove.');state.scenes=(state.scenes||[]).filter(s=>String(s.id)!==String(x.sceneId));state.stations=(state.stations||[]).filter(s=>!(x.stationIds||[]).some(id=>String(id)===String(s.id)));if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render();renderGraph();runTopology()};
synthesisPreview();

function topologyChecks(){
 const out=[],scenes=state.scenes||[],objects=state.objects||[],media=state.media||[],rules=state.rules||[],animations=state.animations||[];
 const graph=graphData(),sceneIds=new Set(scenes.map(s=>'scene:'+s.id)),incoming=new Map([...sceneIds].map(id=>[id,0]));graph.edges.forEach(e=>{if(incoming.has(e.to))incoming.set(e.to,incoming.get(e.to)+1)});const active='scene:'+(state.scenes?.[0]?.id??''),unreachable=[...incoming.entries()].filter(([id,c])=>c===0&&id!==active).map(([id])=>id);
 out.push({level:unreachable.length?'warn':'pass',name:'Scene reachability topology',detail:unreachable.length?unreachable.length+' scene(s) have no incoming portal/adaptive/rule route.':'All non-entry scenes have at least one incoming route.'});
 const perScene=scenes.map(s=>({scene:s,count:objects.filter(o=>String(o.sceneId)===String(s.id)).length})),dense=perScene.filter(x=>x.count>120);out.push({level:dense.length?'warn':'pass',name:'3D object density',detail:dense.length?dense.map(x=>x.scene.name+' ('+x.count+')').join(', ')+' exceed the 120-object authoring budget.':'No scene exceeds the 120-object authoring budget.'});
 const mediaBytes=media.reduce((a,m)=>a+Number(m.size||0),0),mb=mediaBytes/1024/1024;out.push({level:mb>100?'warn':'pass',name:'Packaged media pressure',detail:'Approximate packaged media payload: '+mb.toFixed(1)+' MB'+(mb>100?' — consider optimization for LMS upload and mobile XR.':'.')});
 out.push({level:rules.filter(r=>r.enabled).length>80?'warn':'pass',name:'Rule complexity',detail:rules.filter(r=>r.enabled).length+' enabled interaction rule(s).'});
 out.push({level:animations.length>60?'warn':'pass',name:'Animation complexity',detail:animations.length+' authored animation track(s).'});
 const external=objects.filter(o=>o.url&&!o.assetId&&/^https?:/i.test(o.url));out.push({level:external.length?'warn':'pass',name:'Offline XR portability',detail:external.length?external.length+' object(s) depend on external model URLs.':'No external 3D model dependency detected.'});
 const brokenEdges=graph.edges.filter(e=>!graph.nodes.some(n=>n.id===e.from)||!graph.nodes.some(n=>n.id===e.to));out.push({level:brokenEdges.length?'fail':'pass',name:'Knowledge graph integrity',detail:brokenEdges.length?brokenEdges.length+' relationship(s) point to missing graph nodes.':'Knowledge graph relationships resolve.'});
 return out
}
function runTopology(){
 const checks=topologyChecks();C('v22TopologyResults').innerHTML=checks.map(x=>'<div class="v22-cap"><span class="v22-orb '+(x.level==='pass'?'ok':x.level==='warn'?'warn':'bad')+'"></span><div><b>'+esc22(x.name)+'</b><small class="muted">'+esc22(x.detail)+'</small></div><span class="v16-badge">'+x.level.toUpperCase()+'</span></div>').join('');return checks
}
C('v22TopologyAudit').onclick=runTopology;

/* Runtime constellation navigator */
const prevRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=prevRuntime(preview);
 const cfg=JSON.stringify(state.v22Settings||{}).replace(/</g,'\\u003c');
 const style=`<style id="v22-runtime-style">#v22Constellation{position:fixed;left:12px;bottom:12px;z-index:62;display:none;max-width:360px;background:#071225ee;border:1px solid #7dd3fc66;color:#fff;border-radius:14px;padding:12px;box-shadow:0 0 30px #38bdf844}#v22Constellation button{display:block;width:100%;margin:5px 0;padding:8px;border-radius:8px;border:1px solid #ffffff33;background:#10233e;color:#fff;text-align:left}#v22ConstellationToggle{position:fixed;left:12px;bottom:12px;z-index:63;padding:9px 12px;border-radius:999px;border:1px solid #7dd3fc66;background:#071225ee;color:#fff}html[data-v22-cosmic="true"] body{background:radial-gradient(circle at 50% 20%,#102c55,#02050c 55%)}@media(prefers-reduced-motion:reduce){#v22Constellation{transition:none!important}}</style>`;
 const code=`
 <script>
 (function(){
 const cfg=${cfg};document.documentElement.dataset.v22Cosmic=String(!!cfg.cosmicMode);if(!cfg.constellationRuntime)return;
 const btn=document.createElement('button');btn.id='v22ConstellationToggle';btn.textContent='✦ Constellation';btn.setAttribute('aria-expanded','false');const panel=document.createElement('div');panel.id='v22Constellation';panel.setAttribute('role','navigation');panel.setAttribute('aria-label','Scene constellation navigator');
 function draw(){panel.innerHTML='<b>Scene Constellation</b>';(project.scenes||[]).forEach(s=>{const b=document.createElement('button');b.textContent=s.name;b.onclick=()=>{showScene(s.id);panel.style.display='none';btn.setAttribute('aria-expanded','false')};panel.appendChild(b)})}
 btn.onclick=()=>{const open=panel.style.display==='block';if(!open)draw();panel.style.display=open?'none':'block';btn.setAttribute('aria-expanded',String(!open))};document.body.appendChild(btn);document.body.appendChild(panel);
 window.V22Runtime={open:()=>btn.click(),redraw:draw};
 })();
 <\/script>`;
 html=html.replace('</head>',style+'</head>');return html.replace('</body></html>',code+'</body></html>')
};

/* audit */
const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v22Checks(){
 const out=topologyChecks(),graph=graphData();
 out.push({level:state.v22Settings.cosmicMode?'pass':'pass',name:'Alien-inspired mode disclosure',detail:'Cosmic/alien-inspired presentation is explicitly aesthetic and does not claim verified extraterrestrial technology.'});
 out.push({level:graph.nodes.length?'pass':'warn',name:'Spatial knowledge constellation',detail:graph.nodes.length?graph.nodes.length+' knowledge nodes and '+graph.edges.length+' relationships are available.':'No graphable learning topology is available.'});
 const generated=(state.v22Generated||[]).filter(g=>(state.scenes||[]).some(s=>String(s.id)===String(g.sceneId))&&!g.reviewedAt);out.push({level:generated.length?'warn':'pass',name:'Procedural content review',detail:generated.length?generated.length+' generated scenario(s) remain unreviewed and require human instructional review before publication.':'All generated scenarios are reviewed or none remain.'});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v22Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v22Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(C('auditPass'))C('auditPass').textContent=p;if(C('auditWarn'))C('auditWarn').textContent=w;if(C('auditFail'))C('auditFail').textContent=f;if(C('auditResults'))C('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station" style="'+(x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc22(x.name)+'</b><div class="muted">'+esc22(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

const oldRender=render;
render=function(){oldRender();ensureV22();setTimeout(()=>{renderGraph();runTopology();synthesisPreview()},0)};
capabilityScan();renderGraph();runTopology();synthesisPreview();
})();