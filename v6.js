(()=>{
const Q=id=>document.getElementById(id);
function loadAFrame(cb){if(window.AFRAME)return cb();const s=document.createElement('script');s.src='vendor/aframe-v1.8.0.min.js';s.onload=cb;s.onerror=()=>console.error('A-Frame failed to load');document.head.appendChild(s)}
function ensure(){state.version=6;state.undoStack=state.undoStack||[];state.redoStack=state.redoStack||[]}
ensure();
const main=document.querySelector('main.workspace');if(!main)return;
const card=document.createElement('section');card.className='card';card.id='live3DEditorCard';
card.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Live 3D Authoring Studio <span class="v6-badge">V6</span></h3><div class="muted">Select, move, rotate and scale immersive objects in a real WebGL scene.</div></div>
 <div class="toolbar"><button class="btn" id="v6Undo">Undo</button><button class="btn" id="v6Redo">Redo</button><button class="btn" id="v6Refresh">Refresh 3D</button></div>
</div>
<div class="v6-layout" style="margin-top:14px">
 <div class="v6-panel"><h4 style="margin-top:0">Scene Hierarchy</h4><div id="v6SceneName" class="muted"></div><div id="v6Tree" class="v6-tree"></div></div>
 <div class="v6-canvas" id="v6Canvas"><div class="muted" style="padding:20px">Loading 3D editor…</div></div>
 <div class="v6-panel"><h4 style="margin-top:0">Transform Inspector</h4><div id="v6None" class="muted">Select an object.</div><div id="v6Inspector" class="hidden">
  <div class="field"><label>Label</label><input id="v6Label"></div>
  <div class="row"><div class="field"><label>X</label><input id="v6X" type="number" step=".1"></div><div class="field"><label>Y</label><input id="v6Y" type="number" step=".1"></div></div>
  <div class="field"><label>Z</label><input id="v6Z" type="number" step=".1"></div>
  <div class="row"><div class="field"><label>Rotate Y</label><input id="v6RY" type="number" step="5"></div><div class="field"><label>Scale</label><input id="v6S" type="number" step=".1" min=".1" max="10"></div></div>
  <button class="btn primary" id="v6Apply" style="width:100%">Apply transform</button>
  <div class="v6-section"><b>Nudge</b><div class="v6-controls" style="margin-top:8px"><button data-nudge="x,-0.25">← X</button><button data-nudge="z,-0.25">↑ Z</button><button data-nudge="x,0.25">X →</button><button data-nudge="y,-0.25">↓ Y</button><button data-nudge="z,0.25">Z ↓</button><button data-nudge="y,0.25">Y ↑</button></div></div>
  <div class="v6-section"><button class="btn" id="v6Duplicate" style="width:100%">Duplicate object</button></div>
 </div>
 <div class="v6-section"><b>Camera</b><div class="toolbar" style="margin-top:8px"><button class="btn" data-cam="front">Front</button><button class="btn" data-cam="top">Top</button><button class="btn" data-cam="origin">Origin</button></div></div>
 <div class="v6-section v6-shortcuts"><b>Shortcuts</b><br>Arrow keys: move X/Z<br>PageUp/PageDown: move Y<br>Q/E: rotate<br>+/-: scale<br>Delete: remove selected object</div>
 </div>
</div>`;
main.appendChild(card);
const nav=document.querySelector('aside .nav');if(nav){const b=document.createElement('button');b.innerHTML='🧊 Live 3D Editor <span class="badge">V6</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.appendChild(b)}

let selected=null,sceneEl=null,camRig=null;
function activeScene(){return (state.scenes||[]).find(s=>s.id===state.activeSceneId)||state.scenes?.[0]}
function saveUndo(){state.undoStack.push(JSON.stringify({objects:state.objects,stations:state.stations,activeSceneId:state.activeSceneId}));if(state.undoStack.length>30)state.undoStack.shift();state.redoStack=[]}
function restoreSnap(raw){if(!raw)return;const d=JSON.parse(raw);state.objects=d.objects||[];state.stations=d.stations||[];state.activeSceneId=d.activeSceneId||state.activeSceneId;selected=null;if(typeof render==='function')render();render3D()}
Q('v6Undo').onclick=()=>{if(!state.undoStack.length)return;state.redoStack.push(JSON.stringify({objects:state.objects,stations:state.stations,activeSceneId:state.activeSceneId}));restoreSnap(state.undoStack.pop())};
Q('v6Redo').onclick=()=>{if(!state.redoStack.length)return;state.undoStack.push(JSON.stringify({objects:state.objects,stations:state.stations,activeSceneId:state.activeSceneId}));restoreSnap(state.redoStack.pop())};

function iconType(o){return o.type==='portal'?'PORTAL':o.type==='screen'?'SCREEN':o.type==='table'?'TABLE':o.type==='custom'?'MODEL':o.type==='station'?'STATION':'OBJECT'}
function tree(){const box=Q('v6Tree'),sc=activeScene();Q('v6SceneName').textContent=sc?'Scene: '+sc.name:'No scene';if(!box)return;const objs=(state.objects||[]).filter(o=>o.sceneId===state.activeSceneId);box.innerHTML=objs.length?objs.map(o=>`<div class="v6-tree-item ${selected===o.id?'active':''}" data-id="${o.id}"><span>${iconType(o)}</span><span>${String(o.label||o.type).replace(/[<>&]/g,'')}</span><small>${o.x||0}, ${o.y||0}, ${o.z||0}</small></div>`).join(''):'<div class="muted">No objects in this scene.</div>';box.querySelectorAll('[data-id]').forEach(el=>el.onclick=()=>{selected=Number(el.dataset.id);tree();inspector();highlight()})}
function inspector(){const o=(state.objects||[]).find(x=>x.id===selected);Q('v6None').classList.toggle('hidden',!!o);Q('v6Inspector').classList.toggle('hidden',!o);if(!o)return;Q('v6Label').value=o.label||'';Q('v6X').value=o.x||0;Q('v6Y').value=o.y||0;Q('v6Z').value=o.z||0;Q('v6RY').value=o.rotationY||0;Q('v6S').value=o.scale||1}
function highlight(){if(!sceneEl)return;sceneEl.querySelectorAll('[data-object-id]').forEach(e=>{const on=Number(e.dataset.objectId)===selected;e.setAttribute('material','opacity',on?1:.88);if(on)e.setAttribute('animation__pulse','property: scale; dir: alternate; dur: 350; loop: 2; to: 1.08 1.08 1.08')})}
function primitive(o){let tag='a-cylinder',attrs={radius:.6,height:1.2,color:'#7dd3fc'};if(o.type==='portal'){tag='a-torus';attrs={radius:1,'radius-tubular':.1,color:'#c4b5fd'}}else if(o.type==='screen'){tag='a-box';attrs={width:2,height:1.2,depth:.12,color:'#fde68a'}}else if(o.type==='table'){tag='a-box';attrs={width:2,height:.25,depth:1,color:'#94a3b8'}}else if(o.type==='custom'&&o.url){tag='a-gltf-model';attrs={src:o.url}}else if(o.type==='station'){tag='a-dodecahedron';attrs={radius:.7,color:'#86efac'}}const e=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e}
function build3D(){const host=Q('v6Canvas');host.innerHTML='';sceneEl=document.createElement('a-scene');sceneEl.setAttribute('embedded','');sceneEl.setAttribute('renderer','antialias: true; colorManagement: true');sceneEl.setAttribute('background','color: #172a42');sceneEl.style.width='100%';sceneEl.style.height='620px';sceneEl.appendChild(Object.assign(document.createElement('a-sky'),{}));const floor=document.createElement('a-plane');floor.setAttribute('rotation','-90 0 0');floor.setAttribute('width','40');floor.setAttribute('height','40');floor.setAttribute('color','#263a54');sceneEl.appendChild(floor);const grid=document.createElement('a-entity');grid.setAttribute('geometry','primitive: plane; width: 40; height: 40');grid.setAttribute('rotation','-90 0 0');grid.setAttribute('material','color:#38516d; wireframe:true; opacity:.35');grid.setAttribute('position','0 .01 0');sceneEl.appendChild(grid);camRig=document.createElement('a-entity');camRig.setAttribute('position','0 5 10');const cam=document.createElement('a-camera');cam.setAttribute('look-controls','');cam.setAttribute('wasd-controls','acceleration:30');const cursor=document.createElement('a-cursor');cursor.setAttribute('color','#fff');cam.appendChild(cursor);camRig.appendChild(cam);sceneEl.appendChild(camRig);host.appendChild(sceneEl);render3DObjects()}
function render3DObjects(){if(!sceneEl)return;sceneEl.querySelectorAll('[data-object-id]').forEach(e=>e.remove());for(const o of (state.objects||[]).filter(x=>x.sceneId===state.activeSceneId)){const e=primitive(o);e.dataset.objectId=o.id;e.setAttribute('position',`${o.x||0} ${o.y??1} ${o.z??-5}`);e.setAttribute('rotation',`0 ${o.rotationY||0} 0`);const s=o.scale||1;e.setAttribute('scale',`${s} ${s} ${s}`);e.classList.add('clickable');e.addEventListener('click',()=>{selected=o.id;tree();inspector();highlight()});sceneEl.appendChild(e);const t=document.createElement('a-text');t.dataset.objectId=o.id;t.setAttribute('value',o.label||o.type);t.setAttribute('width','3');t.setAttribute('color','#fff');t.setAttribute('position',`${(o.x||0)-1} ${(o.y??1)+1.4} ${o.z??-5}`);sceneEl.appendChild(t)}highlight()}
function render3D(){tree();inspector();if(!sceneEl)build3D();else render3DObjects()}
Q('v6Refresh').onclick=render3D;
Q('v6Apply').onclick=()=>{const o=(state.objects||[]).find(x=>x.id===selected);if(!o)return;saveUndo();o.label=Q('v6Label').value||o.type;o.x=+Q('v6X').value||0;o.y=+Q('v6Y').value||0;o.z=+Q('v6Z').value||0;o.rotationY=+Q('v6RY').value||0;o.scale=Math.max(.1,+Q('v6S').value||1);if(typeof render==='function')render();render3D()};
Q('v6Inspector').querySelectorAll('[data-nudge]').forEach(b=>b.onclick=()=>{const o=(state.objects||[]).find(x=>x.id===selected);if(!o)return;saveUndo();const [k,d]=b.dataset.nudge.split(',');o[k]=+(Number(o[k]||0)+Number(d)).toFixed(2);if(typeof render==='function')render();render3D()});
Q('v6Duplicate').onclick=()=>{const o=(state.objects||[]).find(x=>x.id===selected);if(!o)return;saveUndo();const n={...o,id:Date.now(),label:(o.label||o.type)+' Copy',x:Number(o.x||0)+.5,z:Number(o.z||0)+.5};state.objects.push(n);selected=n.id;if(typeof render==='function')render();render3D()};
Q('v6Inspector').querySelectorAll('[data-cam]').forEach(b=>b.onclick=()=>{if(!camRig)return;const p=b.dataset.cam==='top'?'0 14 0':b.dataset.cam==='front'?'0 3 12':'0 5 10';camRig.setAttribute('position',p)});
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;const o=(state.objects||[]).find(x=>x.id===selected);if(!o)return;let changed=true,step=e.shiftKey?1:.25;saveUndo();if(e.key==='ArrowLeft')o.x-=step;else if(e.key==='ArrowRight')o.x+=step;else if(e.key==='ArrowUp')o.z-=step;else if(e.key==='ArrowDown')o.z+=step;else if(e.key==='PageUp')o.y=(o.y||0)+step;else if(e.key==='PageDown')o.y=(o.y||0)-step;else if(e.key.toLowerCase()==='q')o.rotationY=(o.rotationY||0)-5;else if(e.key.toLowerCase()==='e')o.rotationY=(o.rotationY||0)+5;else if(e.key==='+')o.scale=(o.scale||1)+.1;else if(e.key==='-')o.scale=Math.max(.1,(o.scale||1)-.1);else if(e.key==='Delete'){state.objects=state.objects.filter(x=>x.id!==selected);selected=null}else{changed=false;state.undoStack.pop()}if(changed){e.preventDefault();if(typeof render==='function')render();render3D()}});

const oldRender=render;
render=function(){oldRender();ensure();setTimeout(render3D,0)};
const oldAuditRun=window.VRClassroomAudit?.run, oldAuditChecks=window.VRClassroomAudit?.checks;
function v6Checks(){
 const r=[];const objs=state.objects||[],scenes=state.scenes||[],stations=state.stations||[];
 const badScale=objs.filter(o=>!Number.isFinite(Number(o.scale))||Number(o.scale)<=0);
 r.push({level:badScale.length?'fail':'pass',name:'3D object scale',detail:badScale.length?badScale.length+' object(s) have invalid scale values.':'All object scales are valid.'});
 const extreme=objs.filter(o=>Math.abs(Number(o.x||0))>25||Math.abs(Number(o.y||0))>25||Math.abs(Number(o.z||0))>25);
 r.push({level:extreme.length?'warn':'pass',name:'Spatial bounds',detail:extreme.length?extreme.length+' object(s) are more than 25m from the scene origin. Verify they are reachable.':'Objects are within the recommended authoring bounds.'});
 const emptyScenes=scenes.filter(s=>!objs.some(o=>o.sceneId===s.id)&&!stations.some(st=>st.sceneId===s.id));
 r.push({level:emptyScenes.length?'warn':'pass',name:'Scene content',detail:emptyScenes.length?emptyScenes.length+' scene(s) contain no objects or learning stations.':'All scenes contain authored content.'});
 const orphanObjects=objs.filter(o=>!scenes.some(s=>s.id===o.sceneId));
 r.push({level:orphanObjects.length?'fail':'pass',name:'Object scene mapping',detail:orphanObjects.length?orphanObjects.length+' object(s) reference missing scenes.':'All 3D objects belong to existing scenes.'});
 const orphanStations=stations.filter(st=>!scenes.some(s=>s.id===st.sceneId));
 r.push({level:orphanStations.length?'fail':'pass',name:'Station scene mapping',detail:orphanStations.length?orphanStations.length+' station(s) reference missing scenes.':'All learning stations belong to existing scenes.'});
 return r
}
if(oldAuditChecks)window.VRClassroomAudit.checks=()=>[...oldAuditChecks(),...v6Checks()];
if(oldAuditRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldAuditRun(scroll),extras=v6Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,fl=all.filter(x=>x.level==='fail').length;if(document.getElementById('auditPass'))document.getElementById('auditPass').textContent=p;if(document.getElementById('auditWarn'))document.getElementById('auditWarn').textContent=w;if(document.getElementById('auditFail'))document.getElementById('auditFail').textContent=fl;if(document.getElementById('auditResults')){const html=extras.map(x=>`<div class="station" style="${x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':''}"><span class="num">${x.level==='pass'?'✓':x.level==='warn'?'!':'×'}</span><div><b>${x.name}</b><div class="muted">${x.detail}</div></div><span class="v3-pill">${x.level.toUpperCase()}</span></div>`).join('');document.getElementById('auditResults').insertAdjacentHTML('beforeend',html)}return all};
loadAFrame(()=>build3D());
})();