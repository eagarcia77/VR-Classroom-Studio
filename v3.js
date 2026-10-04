(()=>{
const $v=id=>document.getElementById(id);
function ensureV3State(){
  state.version=3;
  state.scenes=state.scenes&&state.scenes.length?state.scenes:[{id:'scene-main',name:state.environment||'Academic Mall',environment:state.environment||'Academic Mall'}];
  state.activeSceneId=state.activeSceneId||state.scenes[0].id;
  state.objects=(state.objects||[]).map((o,i)=>({...o,id:o.id||Date.now()+i,sceneId:o.sceneId||state.activeSceneId,x:Number.isFinite(+o.x)?+o.x:(-4+i*2),y:Number.isFinite(+o.y)?+o.y:1,z:Number.isFinite(+o.z)?+o.z:-5,rotationY:+o.rotationY||0,scale:+o.scale||1,label:o.label||o.type||'Object'}));
  state.stations=(state.stations||[]).map(s=>({...s,sceneId:s.sceneId||state.activeSceneId}));
  state.questions=state.questions||[];
}
ensureV3State();

const host=document.querySelector('main.workspace');
if(!host)return;
const v3=document.createElement('section');
v3.className='card';
v3.id='spatialDesignerCard';
v3.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Spatial Designer V3</h3><div class="muted">Multi-scene room layout · drag-and-drop · portals · transforms</div></div>
 <div class="toolbar"><button class="btn" id="v3AddScene">+ Scene</button><button class="btn" id="v3AddPortal">+ Portal</button><button class="btn primary" id="v3AddStationObject">+ Station marker</button></div>
</div>
<div class="v3-scenes" id="v3Scenes" style="margin:14px 0"></div>
<div class="v3-grid">
 <div class="v3-stage" id="v3Stage" aria-label="Spatial room designer"></div>
 <div class="v3-inspector">
   <h4 style="margin-top:0">Object Inspector</h4>
   <div id="v3NoSelection" class="muted">Select an object in the room.</div>
   <div id="v3Inspector" class="hidden">
     <div class="field"><label>Label</label><input id="v3Label"></div>
     <div class="row"><div class="field"><label>X</label><input id="v3X" type="number" step=".1"></div><div class="field"><label>Z</label><input id="v3Z" type="number" step=".1"></div></div>
     <div class="row"><div class="field"><label>Rotation Y</label><input id="v3Rot" type="number" step="5"></div><div class="field"><label>Scale</label><input id="v3Scale" type="number" min=".1" max="8" step=".1"></div></div>
     <div class="field" id="v3PortalTargetWrap"><label>Portal target scene</label><select id="v3PortalTarget"></select></div>
     <div class="toolbar"><button class="btn primary" id="v3SaveObject">Apply</button><button class="btn danger" id="v3DeleteObject">Delete</button></div>
   </div>
   <hr style="border:0;border-top:1px solid var(--line);margin:16px 0">
   <div class="v3-mini">Coordinates map to the exported WebXR scene. Dragging changes X/Z; precise transforms can be entered here.</div>
 </div>
</div>`;
const firstCard=host.querySelector('.topgrid')?.parentElement?host.querySelector('.topgrid').nextElementSibling:null;
host.insertBefore(v3, firstCard || host.firstChild);

const assess=document.createElement('section');
assess.className='card'; assess.id='assessmentEngineCard';
assess.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Advanced Assessment Engine</h3><div class="muted">Attach scored questions to immersive stations.</div></div><button class="btn primary" id="v3AddQuestion">+ Question</button></div>
<div id="v3QuestionList" style="margin-top:12px"></div>`;
host.appendChild(assess);

const nav=document.querySelector('aside .nav');
if(nav){
 const b=document.createElement('button');b.innerHTML='🧭 Spatial Designer <span class="badge">V3</span>';b.onclick=()=>v3.scrollIntoView({behavior:'smooth'});nav.insertBefore(b,nav.children[1]||null);
 const q=document.createElement('button');q.textContent='🧪 Assessment Engine';q.onclick=()=>assess.scrollIntoView({behavior:'smooth'});nav.appendChild(q);
}

let selectedObjectId=null;
const activeScene=()=>state.scenes.find(s=>s.id===state.activeSceneId)||state.scenes[0];
const objectIcon=o=>o.type==='portal'?'PORTAL':o.type==='station'?'STATION':o.type==='screen'?'SCREEN':o.type==='table'?'TABLE':o.type==='marker'?'AR':o.type==='podium'?'PODIUM':'3D';

function sceneRender(){
 const list=$v('v3Scenes'); if(!list)return;
 list.innerHTML=state.scenes.map(s=>`<button class="v3-scene ${s.id===state.activeSceneId?'active':''}" data-id="${s.id}">${esc(s.name)}</button>`).join('');
 list.querySelectorAll('button').forEach(b=>b.onclick=()=>{state.activeSceneId=b.dataset.id;selectedObjectId=null;sceneRender();designerRender()});
 designerRender();
}
function worldToPctX(x){return Math.max(4,Math.min(96,50+(+x||0)*6))}
function worldToPctZ(z){return Math.max(6,Math.min(94,52+(+z||0)*5))}
function pctToWorldX(p){return (p-50)/6}
function pctToWorldZ(p){return (p-52)/5}
function designerRender(){
 const stage=$v('v3Stage'); if(!stage)return;
 const objs=state.objects.filter(o=>o.sceneId===state.activeSceneId);
 stage.innerHTML=objs.map(o=>`<div class="v3-object ${o.type==='portal'?'portal':o.type==='station'?'station':o.type==='screen'?'screen':''} ${o.id===selectedObjectId?'selected':''}" data-id="${o.id}" style="left:${worldToPctX(o.x)}%;top:${worldToPctZ(o.z)}%;transform:rotate(${o.rotationY||0}deg) scale(${Math.max(.6,Math.min(1.5,o.scale||1))})"><span>${objectIcon(o)}<br>${esc(o.label||o.type)}</span></div>`).join('');
 stage.querySelectorAll('.v3-object').forEach(el=>wireDrag(el));
 renderInspector();
}
function wireDrag(el){
 el.onpointerdown=e=>{
   selectedObjectId=Number(el.dataset.id); designerRender();
   const target=[...$v('v3Stage').querySelectorAll('.v3-object')].find(x=>Number(x.dataset.id)===selectedObjectId); if(!target)return;
   target.setPointerCapture(e.pointerId);
   target.onpointermove=ev=>{
     if(!target.hasPointerCapture(ev.pointerId))return;
     const r=$v('v3Stage').getBoundingClientRect();
     const px=Math.max(0,Math.min(100,(ev.clientX-r.left)/r.width*100));
     const py=Math.max(0,Math.min(100,(ev.clientY-r.top)/r.height*100));
     const o=state.objects.find(x=>x.id===selectedObjectId); if(!o)return;
     o.x=+pctToWorldX(px).toFixed(2);o.z=+pctToWorldZ(py).toFixed(2);
     target.style.left=px+'%';target.style.top=py+'%';
     renderInspector();
   };
   target.onpointerup=ev=>{try{target.releasePointerCapture(ev.pointerId)}catch{}};
 };
 el.onclick=()=>{selectedObjectId=Number(el.dataset.id);designerRender()};
}
function renderInspector(){
 const o=state.objects.find(x=>x.id===selectedObjectId);
 $v('v3NoSelection').classList.toggle('hidden',!!o);$v('v3Inspector').classList.toggle('hidden',!o);
 if(!o)return;
 $v('v3Label').value=o.label||'';$v('v3X').value=o.x;$v('v3Z').value=o.z;$v('v3Rot').value=o.rotationY||0;$v('v3Scale').value=o.scale||1;
 $v('v3PortalTargetWrap').classList.toggle('hidden',o.type!=='portal');
 $v('v3PortalTarget').innerHTML=state.scenes.filter(s=>s.id!==state.activeSceneId).map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');
 if(o.targetSceneId)$v('v3PortalTarget').value=o.targetSceneId;
}
$v('v3SaveObject').onclick=()=>{const o=state.objects.find(x=>x.id===selectedObjectId);if(!o)return;o.label=$v('v3Label').value||o.type;o.x=+$v('v3X').value||0;o.z=+$v('v3Z').value||0;o.rotationY=+$v('v3Rot').value||0;o.scale=Math.max(.1,+$v('v3Scale').value||1);if(o.type==='portal')o.targetSceneId=$v('v3PortalTarget').value;designerRender()};
$v('v3DeleteObject').onclick=()=>{state.objects=state.objects.filter(o=>o.id!==selectedObjectId);selectedObjectId=null;designerRender();render()};
$v('v3AddScene').onclick=()=>{const n=prompt('Scene name','New Immersive Room');if(!n)return;const id='scene-'+Date.now();state.scenes.push({id,name:n,environment:'Virtual Classroom'});state.activeSceneId=id;selectedObjectId=null;sceneRender()};
$v('v3AddPortal').onclick=()=>{if(state.scenes.length<2)return alert('Create at least two scenes before adding a portal.');const target=state.scenes.find(s=>s.id!==state.activeSceneId);state.objects.push({id:Date.now(),sceneId:state.activeSceneId,type:'portal',label:'Portal to '+target.name,x:0,y:1,z:-5,rotationY:0,scale:1,targetSceneId:target.id});selectedObjectId=state.objects.at(-1).id;designerRender();render()};
$v('v3AddStationObject').onclick=()=>{state.objects.push({id:Date.now(),sceneId:state.activeSceneId,type:'station',label:'Learning Station',x:0,y:1,z:-5,rotationY:0,scale:1});selectedObjectId=state.objects.at(-1).id;designerRender();render()};

function questionRender(){
 const box=$v('v3QuestionList');if(!box)return;
 if(!state.questions.length){box.innerHTML='<div class="muted">No assessment questions yet.</div>';return}
 box.innerHTML=state.questions.map((q,i)=>`<div class="v3-question"><div class="v3-question-grid"><div><b>${i+1}. ${esc(q.prompt)}</b><div class="v3-mini"><span class="v3-pill">${esc(q.type)}</span> ${q.points} pts · ${esc((state.stations.find(s=>String(s.id)===String(q.stationId))||{}).name||'Unassigned')}</div></div><button class="btn" data-edit="${q.id}">Edit</button><button class="btn danger" data-del="${q.id}">×</button></div></div>`).join('');
 box.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editQuestion(Number(b.dataset.edit)));
 box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{state.questions=state.questions.filter(q=>q.id!==Number(b.dataset.del));questionRender()});
}
function editQuestion(id){
 const q=state.questions.find(x=>x.id===id);if(!q)return;
 const promptText=prompt('Question prompt',q.prompt);if(promptText===null)return;
 const choices=prompt('Choices separated by | (for multiple choice)',(q.choices||[]).join('|'));if(choices===null)return;
 const answer=prompt('Correct answer text',q.answer||'');if(answer===null)return;
 q.prompt=promptText;q.choices=choices.split('|').map(x=>x.trim()).filter(Boolean);q.answer=answer;questionRender();
}
$v('v3AddQuestion').onclick=()=>{
 if(!state.stations.length)return alert('Create at least one station first.');
 const promptText=prompt('Question prompt','Which option best demonstrates the concept?');if(!promptText)return;
 const type=prompt('Type: multiple-choice, true-false, reflection','multiple-choice')||'multiple-choice';
 const choices=type==='multiple-choice'?(prompt('Choices separated by |','Option A|Option B|Option C')||'').split('|').map(x=>x.trim()).filter(Boolean):type==='true-false'?['True','False']:[];
 const answer=type==='reflection'?'':prompt('Correct answer',choices[0]||'True')||'';
 const pts=Math.max(1,Number(prompt('Points','10'))||10);
 const s=state.stations.find(x=>x.sceneId===state.activeSceneId)||state.stations[0];
 state.questions.push({id:Date.now(),stationId:s.id,type,prompt:promptText,choices,answer,points:pts});
 questionRender();
};

const originalAddStation=$v('addStation').onclick;
$v('addStation').onclick=()=>{originalAddStation();const s=state.stations.at(-1);if(s)s.sceneId=state.activeSceneId;render()};

const originalAddObject=$v('addObject').onclick;
$v('addObject').onclick=()=>{const before=state.objects.length;originalAddObject();if(state.objects.length>before){const o=state.objects.at(-1);Object.assign(o,{sceneId:state.activeSceneId,x:0,y:1,z:-5,rotationY:0,scale:1,label:o.type});designerRender()}};

const oldSyncAdvanced=syncAdvanced;
syncAdvanced=function(){oldSyncAdvanced();ensureV3State();};

const oldLoadAdvanced=loadAdvanced;
loadAdvanced=function(){oldLoadAdvanced();ensureV3State();sceneRender();questionRender();};

const oldValidate=validateProject;
validateProject=function(){const issues=oldValidate();ensureV3State();if(!state.scenes.length)issues.push('Add at least one immersive scene.');for(const o of state.objects.filter(x=>x.type==='portal'))if(!o.targetSceneId||!state.scenes.some(s=>s.id===o.targetSceneId))issues.push('Every portal must target an existing scene.');for(const q of state.questions)if(q.type!=='reflection'&&!q.answer)issues.push('Scored objective questions need a correct answer.');return [...new Set(issues)]};

runtimeHTML=function(){
 ensureV3State();syncAdvanced();
 const data=JSON.stringify(state).replace(/</g,'\\u003c');
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(state.title)}</title><script src="https://aframe.io/releases/1.7.1/aframe.min.js"><\/script><script src="scorm_api.js"><\/script><style>
 body{margin:0;background:#06101f;color:white;font-family:system-ui}.hud{position:fixed;z-index:20;left:12px;right:12px;top:12px;display:flex;justify-content:space-between;gap:8px;pointer-events:none}.panel,.modal{background:#071225ee;border:1px solid #ffffff2a;border-radius:12px;padding:11px 13px}.modal{position:fixed;z-index:30;left:18px;right:18px;bottom:18px;max-width:680px;margin:auto;display:none}.modal button,.modal label{pointer-events:auto}.choices button{display:block;width:100%;margin:7px 0;padding:10px;border-radius:8px;border:1px solid #ffffff33;background:#152640;color:#fff;text-align:left}.small{font-size:12px;opacity:.82}.sceneTag{font-size:12px;color:#a7f3d0}
 </style></head><body><div class="hud"><div class="panel"><b id="ttl"></b><div class="small" id="ins"></div><div class="sceneTag" id="sceneName"></div></div><div class="panel"><b id="prog">0%</b><div class="small" id="score">0 pts</div></div></div><div class="modal" id="modal"><h3 id="mt"></h3><p id="mc"></p><div id="choices" class="choices"></div><button id="completeBtn" onclick="completeCurrent()">Complete station</button></div>
 <a-scene background="color:#19324d" vr-mode-ui="enabled:true"><a-sky color="#284e73"></a-sky><a-plane rotation="-90 0 0" width="50" height="50" color="#253650"></a-plane><a-entity id="world"></a-entity><a-entity camera look-controls wasd-controls position="0 1.6 4"><a-cursor color="#fff"></a-cursor></a-entity></a-scene>
 <script>const project=${data};let currentScene=project.activeSceneId||project.scenes[0].id,currentStation=null,earned=0;const completed=new Set(),answered=new Set();SCORM.init();SCORM.set('cmi.completion_status','incomplete');SCORM.set('cmi.success_status','unknown');SCORM.commit();ttl.textContent=project.title;ins.textContent=project.instructions;
 const world=document.getElementById('world');function E(tag,attrs={}){const e=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e}
 function showScene(id){currentScene=id;world.innerHTML='';const scene=project.scenes.find(s=>s.id===id)||project.scenes[0];sceneName.textContent=scene.name;const objs=project.objects.filter(o=>o.sceneId===id);objs.forEach(o=>{let e;if(o.type==='portal')e=E('a-torus',{radius:1,'radius-tubular':.1,color:'#c4b5fd'});else if(o.type==='screen')e=E('a-box',{width:2,height:1.2,depth:.15,color:'#fde68a'});else if(o.type==='table')e=E('a-box',{width:2,height:.25,depth:1,color:'#94a3b8'});else e=E('a-cylinder',{radius:.65,height:1.5,color:o.type==='station'?'#86efac':'#7dd3fc'});e.setAttribute('position',(o.x||0)+' '+(o.y||1)+' '+(o.z||-5));e.setAttribute('rotation','0 '+(o.rotationY||0)+' 0');e.setAttribute('scale',(o.scale||1)+' '+(o.scale||1)+' '+(o.scale||1));e.addEventListener('click',()=>{if(o.type==='portal'&&o.targetSceneId)showScene(o.targetSceneId)});world.appendChild(e);const t=E('a-text',{value:o.label||o.type,width:3,color:'#fff',position:(o.x-1)+' '+((o.y||1)+1.5)+' '+(o.z||-5)});world.appendChild(t)});
 const stations=project.stations.filter(s=>s.sceneId===id);stations.forEach((s,i)=>{const x=-4+(i%4)*2.6,z=-7-Math.floor(i/4)*3;const e=E('a-dodecahedron',{radius:.7,color:'#38bdf8',position:x+' 1 '+z});e.addEventListener('click',()=>openStation(s));world.appendChild(e);world.appendChild(E('a-text',{value:s.name,width:3,color:'#fff',position:(x-1)+' 2.1 '+z}))})}
 function openStation(s){currentStation=s;mt.textContent=s.name;mc.textContent=s.content;choices.innerHTML='';completeBtn.style.display='inline-block';const qs=project.questions.filter(q=>String(q.stationId)===String(s.id));if(qs.length){completeBtn.style.display='none';qs.forEach(q=>{const wrap=document.createElement('div');const p=document.createElement('p');p.innerHTML='<b>'+q.prompt+'</b> ('+q.points+' pts)';wrap.appendChild(p);if(q.type==='reflection'){const ta=document.createElement('textarea');ta.rows=3;ta.style.width='100%';ta.placeholder='Enter your reflection';ta.onchange=()=>{if(!answered.has(q.id)&&ta.value.trim()){answered.add(q.id);earned+=Number(q.points||0);update()}};wrap.appendChild(ta)}else(q.choices||[]).forEach(ch=>{const b=document.createElement('button');b.textContent=ch;b.onclick=()=>answer(q,ch,b);wrap.appendChild(b)});choices.appendChild(wrap)})}modal.style.display='block'}
 function answer(q,ch,b){if(answered.has(q.id))return;answered.add(q.id);if(String(ch).trim().toLowerCase()===String(q.answer).trim().toLowerCase()){earned+=Number(q.points||0);b.textContent+=' ✓'}else b.textContent+=' ✕';update();const qs=project.questions.filter(x=>String(x.stationId)===String(currentStation.id));if(qs.every(x=>answered.has(x.id))){completed.add(currentStation.id);update()}}
 function completeCurrent(){if(!currentStation)return;completed.add(currentStation.id);modal.style.display='none';update()}
 function update(){const stationPts=project.stations.reduce((a,s)=>a+Number(s.points||0),0),qPts=project.questions.reduce((a,q)=>a+Number(q.points||0),0),max=Math.max(1,stationPts+qPts);let stationEarned=0;project.stations.forEach(s=>{if(completed.has(s.id))stationEarned+=Number(s.points||0)});const totalEarned=stationEarned+earned,raw=Math.min(100,Math.round(totalEarned/max*100));prog.textContent=raw+'%';score.textContent=totalEarned+' / '+max+' pts';SCORM.set('cmi.score.min','0');SCORM.set('cmi.score.max','100');SCORM.set('cmi.score.raw',raw);SCORM.set('cmi.score.scaled',(raw/100).toFixed(2));SCORM.set('cmi.progress_measure',(completed.size/Math.max(1,project.stations.length)).toFixed(2));const req=project.stations.filter(s=>s.required).every(s=>completed.has(s.id));const done=project.completion==='score'?raw>=project.passing:req;if(done)SCORM.set('cmi.completion_status','completed');SCORM.set('cmi.success_status',raw>=project.passing?'passed':'failed');SCORM.commit()}
 showScene(currentScene);window.addEventListener('beforeunload',()=>SCORM.finish());<\/script></body></html>`;
};

const oldRender=render;
render=function(){oldRender();ensureV3State();sceneRender();questionRender()};
sceneRender();questionRender();
})();