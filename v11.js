(()=>{
const P=id=>document.getElementById(id);
const e11=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV11(){
 state.version=11;
 state.groups=state.groups||[];
 state.animations=state.animations||[];
 state.v11Settings=state.v11Settings||{snap:.25,multiSelect:true,arPlacementExperimental:false};
}
ensureV11();
const main=document.querySelector('main.workspace');if(!main)return;

/* Professional transform tools */
const pro=document.createElement('section');pro.className='card';pro.id='professional3DCard';
pro.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Professional 3D Tools <span class="v6-badge">V11</span></h3><div class="muted">Direct canvas gizmo controls, snapping, multi-select and object grouping.</div></div><div class="v11-toolbar"><button class="btn" id="v11SelectAll">Select scene objects</button><button class="btn" id="v11ClearSel">Clear selection</button></div></div>
<div class="v11-grid" style="margin-top:12px">
 <div class="v11-card"><h4 style="margin-top:0">Selection</h4><div id="v11Selected" class="v11-selected"></div><div class="field"><label>Grid snap (meters)</label><select id="v11Snap"><option value=".1">0.10</option><option value=".25" selected>0.25</option><option value=".5">0.50</option><option value="1">1.00</option></select></div><div class="v11-toolbar"><button class="btn primary" id="v11Group">Group selected</button><button class="btn" id="v11Ungroup">Ungroup</button><button class="btn" id="v11Duplicate">Duplicate selected</button></div></div>
 <div class="v11-card"><h4 style="margin-top:0">Direct Gizmo Pad</h4><div class="v11-gizmo"><button data-gizmo="x,-1">X −</button><button data-gizmo="y,1">Y +</button><button data-gizmo="x,1">X +</button><button data-gizmo="ry,-15">↺ 15°</button><button data-gizmo="z,-1">Z −</button><button data-gizmo="ry,15">↻ 15°</button><button data-gizmo="s,-.1">Scale −</button><button data-gizmo="y,-1">Y −</button><button data-gizmo="s,.1">Scale +</button></div><div class="muted">Applies to every selected object using the configured grid snap.</div></div>
</div>`;
main.appendChild(pro);

/* Timeline */
const timeline=document.createElement('section');timeline.className='card';timeline.id='animationTimelineCard';
timeline.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Animation Timeline <span class="v6-badge">V11</span></h3><div class="muted">Create simple position, rotation, scale and visibility animations for immersive objects.</div></div><button class="btn primary" id="v11AddAnim">+ Animation</button></div>
<div class="v11-timeline" style="margin-top:12px"><div class="v11-track"><div><b>Object / Track</b></div><div>0s</div><div>1s</div><div>2s</div><div>3s</div><div>4s</div><div>5s</div></div><div id="v11Tracks"></div></div>`;
main.appendChild(timeline);

/* AR lab */
const ar=document.createElement('section');ar.className='card';ar.id='arPlacementLabCard';
ar.innerHTML=`
<div><h3 style="margin:0">Experimental AR Placement Lab <span class="v6-badge">V11</span></h3><div class="muted">Capability-gated WebXR immersive-AR authoring metadata and hit-test preflight.</div></div>
<div class="v11-grid" style="margin-top:12px"><div class="v11-card"><div class="field"><label>AR placement in exported activity</label><select id="v11AREnable"><option value="false">Disabled</option><option value="true">Experimental / capability gated</option></select></div><div class="field"><label>Placement asset</label><select id="v11ARAsset"></select></div><button class="btn primary" id="v11CheckAR">Run AR preflight</button></div><div class="v11-card"><h4 style="margin-top:0">Preflight</h4><div id="v11ARStatus" class="v11-arstatus">Not checked.</div></div></div>`;
main.appendChild(ar);

/* analytics */
const analytics=document.createElement('section');analytics.className='card';analytics.id='learningAnalyticsCard';
analytics.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Preflight Learning Analytics <span class="v6-badge">V11</span></h3><div class="muted">Authoring-side estimates for complexity, assessment balance, accessibility and completion design.</div></div><button class="btn primary" id="v11Analyze">Refresh analytics</button></div>
<div id="v11Metrics" class="v11-metric" style="margin-top:12px"></div><div id="v11Analysis" style="margin-top:12px"></div>`;
main.appendChild(analytics);

const nav=document.querySelector('aside .nav');if(nav){[['🧭 Pro 3D Tools',pro],['🎬 Animation Timeline',timeline],['📱 AR Placement Lab',ar],['📊 Learning Analytics',analytics]].forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)})}

let selectedIds=new Set();
function sceneObjects(){return (state.objects||[]).filter(o=>String(o.sceneId)===String(state.activeSceneId))}
function selectedObjects(){return (state.objects||[]).filter(o=>selectedIds.has(String(o.id)))}
function renderSelection(){
 const box=P('v11Selected');if(!box)return;
 const arr=selectedObjects();box.innerHTML=arr.length?arr.map(o=>'<span>'+e11(o.label||o.type)+' <button data-unsel="'+e11(o.id)+'" style="border:0;background:none;color:#fca5a5">×</button></span>').join(''):'<span class="muted">No objects selected.</span>';
 box.querySelectorAll('[data-unsel]').forEach(b=>b.onclick=()=>{selectedIds.delete(String(b.dataset.unsel));renderSelection();syncCanvasHighlights()})
}
function syncCanvasHighlights(){document.querySelectorAll('#v6Canvas [data-object-id]').forEach(el=>{const on=selectedIds.has(String(el.dataset.objectId));if(on)el.setAttribute('animation__v11','property: scale; dir: alternate; dur: 260; loop: 2; to: 1.06 1.06 1.06')});renderCanvasGizmo()}
function renderCanvasGizmo(){
 const scene=document.querySelector('#v6Canvas a-scene');if(!scene)return;scene.querySelector('#v11CanvasGizmo')?.remove();const arr=selectedObjects();if(!arr.length)return;
 const center=arr.reduce((a,o)=>({x:a.x+Number(o.x||0),y:a.y+Number(o.y||0),z:a.z+Number(o.z||0)}),{x:0,y:0,z:0});center.x/=arr.length;center.y/=arr.length;center.z/=arr.length;
 const g=document.createElement('a-entity');g.id='v11CanvasGizmo';g.setAttribute('position',center.x+' '+(center.y+1.2)+' '+center.z);
 const axes=[['x','#ef4444','1 0 0','0 0 -90'],['y','#22c55e','0 1 0','0 0 0'],['z','#3b82f6','0 0 -1','90 0 0']];
 axes.forEach(([axis,color,pos,rot])=>{const h=document.createElement('a-cylinder');h.setAttribute('radius','.055');h.setAttribute('height','1.1');h.setAttribute('color',color);h.setAttribute('position',pos);h.setAttribute('rotation',rot);h.dataset.v11Axis=axis;h.classList.add('clickable');h.addEventListener('click',ev=>{ev.stopPropagation();const snap=Number(state.v11Settings.snap||.25);selectedObjects().forEach(o=>o[axis]=Number(o[axis]||0)+snap);if(typeof render==='function')render();setTimeout(()=>{renderSelection();syncCanvasHighlights()},0)});g.appendChild(h)});
 const ring=document.createElement('a-torus');ring.setAttribute('radius','.8');ring.setAttribute('radius-tubular','.035');ring.setAttribute('color','#f59e0b');ring.setAttribute('rotation','90 0 0');ring.classList.add('clickable');ring.addEventListener('click',ev=>{ev.stopPropagation();selectedObjects().forEach(o=>o.rotationY=Number(o.rotationY||0)+15);if(typeof render==='function')render();setTimeout(()=>{renderSelection();syncCanvasHighlights()},0)});g.appendChild(ring);
 scene.appendChild(g)
}
P('v11SelectAll').onclick=()=>{sceneObjects().forEach(o=>selectedIds.add(String(o.id)));renderSelection();syncCanvasHighlights()};
P('v11ClearSel').onclick=()=>{selectedIds.clear();renderSelection()};
P('v11Snap').onchange=()=>state.v11Settings.snap=Number(P('v11Snap').value)||.25;
P('v11Group').onclick=()=>{const ids=[...selectedIds];if(ids.length<2)return alert('Select at least two objects.');const name='Group '+((state.groups||[]).length+1);state.groups.push({id:'group-'+Date.now(),name,objectIds:ids});alert(name+' created.')};
P('v11Ungroup').onclick=()=>{const ids=new Set(selectedIds);const before=state.groups.length;state.groups=state.groups.filter(g=>!g.objectIds.some(id=>ids.has(String(id))));alert((before-state.groups.length)+' group(s) removed.')};
P('v11Duplicate').onclick=()=>{const arr=selectedObjects();if(!arr.length)return alert('Select at least one object.');const newIds=[];arr.forEach((o,i)=>{const n={...o,id:Date.now()+i,label:(o.label||o.type)+' Copy',x:Number(o.x||0)+.5,z:Number(o.z||0)+.5};state.objects.push(n);newIds.push(String(n.id))});selectedIds=new Set(newIds);if(typeof render==='function')render();setTimeout(()=>{renderSelection();syncCanvasHighlights()},0)};
P('v11Gizmo')?.querySelectorAll?.('[data-gizmo]');
pro.querySelectorAll('[data-gizmo]').forEach(b=>b.onclick=()=>{const arr=selectedObjects();if(!arr.length)return alert('Select objects first.');const [k,raw]=b.dataset.gizmo.split(','),base=Number(raw),snap=Number(state.v11Settings.snap||.25);arr.forEach(o=>{if(k==='ry')o.rotationY=Number(o.rotationY||0)+base;else if(k==='s')o.scale=Math.max(.1,Number(o.scale||1)+base);else o[k]=Number(o[k]||0)+base*snap});if(typeof render==='function')render();setTimeout(()=>{renderSelection();syncCanvasHighlights()},0)});

/* hook v6 canvas clicks for multi-select */
document.addEventListener('click',e=>{const el=e.target?.closest?.('#v6Canvas [data-object-id]');if(!el)return;const id=String(el.dataset.objectId);if(e.shiftKey||state.v11Settings.multiSelect){if(selectedIds.has(id)&&e.shiftKey)selectedIds.delete(id);else selectedIds.add(id)}else selectedIds=new Set([id]);renderSelection();syncCanvasHighlights()},true);

/* Animations */
function renderTracks(){
 const box=P('v11Tracks');if(!box)return;
 if(!state.animations.length){box.innerHTML='<div class="muted">No animations configured.</div>';return}
 box.innerHTML=state.animations.map(a=>{const o=(state.objects||[]).find(x=>String(x.id)===String(a.objectId));const cells=Array.from({length:6},(_,i)=>'<div class="'+(Math.round(Number(a.time||1))===i?'v11-key':'')+'">'+(Math.round(Number(a.time||1))===i?e11(a.property):'')+'</div>').join('');return '<div class="v11-track" data-aid="'+e11(a.id)+'"><div><b>'+e11(o?.label||'Missing object')+'</b><br><small>'+e11(a.property)+' → '+e11(a.to)+'</small><button class="btn danger" data-rmanim="'+e11(a.id)+'" style="margin-top:5px">Remove</button></div>'+cells+'</div>'}).join('');
 box.querySelectorAll('[data-rmanim]').forEach(b=>b.onclick=()=>{state.animations=state.animations.filter(a=>String(a.id)!==String(b.dataset.rmanim));renderTracks()})
}
P('v11AddAnim').onclick=()=>{const objs=sceneObjects();if(!objs.length)return alert('Add an object to the active scene first.');const list=objs.map((o,i)=>(i+1)+'. '+(o.label||o.type)).join('\n'),idx=Number(prompt('Object number:\n'+list,'1'))-1,o=objs[idx];if(!o)return;const property=prompt('Property: position, rotation, scale, visible','rotation')||'rotation';const to=prompt('Target value (A-Frame format)','0 360 0');if(to===null)return;const time=Math.max(0,Math.min(5,Number(prompt('Start/end time in seconds (0-5)','2'))||2));const dur=Math.max(100,Number(prompt('Duration in milliseconds','1500'))||1500);state.animations.push({id:'anim-'+Date.now(),objectId:o.id,property,to,time,dur,easing:'easeInOutQuad',loop:false});renderTracks()};

/* AR */
function modelOptions(){const s=P('v11ARAsset');if(!s)return;s.innerHTML='<option value="">Use selected scene object</option>'+(state.media||[]).filter(m=>/\.(glb|gltf)$/i.test(m.name||'')).map(m=>'<option value="'+e11(m.id)+'">'+e11(m.name)+'</option>').join('')}
P('v11AREnable').onchange=()=>state.v11Settings.arPlacementExperimental=P('v11AREnable').value==='true';
P('v11CheckAR').onclick=async()=>{const rows=[];rows.push(['HTTPS / secure context',window.isSecureContext]);rows.push(['WebXR API',!!navigator.xr]);if(navigator.xr){for(const mode of ['immersive-ar','immersive-vr']){let ok=false;try{ok=await navigator.xr.isSessionSupported(mode)}catch{}rows.push([mode,ok])}}const model=P('v11ARAsset').value;rows.push(['Placement asset',!!model||sceneObjects().length>0]);P('v11ARStatus').innerHTML=rows.map(([n,ok])=>'<div class="v5-cap"><div><b>'+e11(n)+'</b></div><b class="'+(ok?'v5-ok':'v5-warn')+'">'+(ok?'YES':'NO')+'</b></div>').join('')};

/* analytics */
function analyze(){
 const scenes=state.scenes||[],stations=state.stations||[],questions=state.questions||[],rules=state.rules||[],npcs=state.npcs||[],media=state.media||[];
 const stationPts=stations.reduce((a,s)=>a+Number(s.points||0),0),qPts=questions.reduce((a,q)=>a+Number(q.points||0),0),total=stationPts+qPts;
 const req=stations.filter(s=>s.required).length,interactions=rules.filter(r=>r.enabled).length+(state.objects||[]).filter(o=>['hotspot','trigger-zone','smart-door','collectible','media-screen','inspection'].includes(o.type)).length;
 const accessVideo=media.filter(m=>/^video\//.test(m.type||'')||/\.(mp4|webm)$/i.test(m.name||''));const meta=state.mediaMeta||{};const covered=accessVideo.filter(m=>(meta[m.id]||{}).captionStatus==='available'||String((meta[m.id]||{}).transcript||'').trim()).length;
 const complexity=Math.min(100,Math.round(scenes.length*8+stations.length*5+interactions*3+npcs.length*4+(state.animations||[]).length*2));
 const accessScore=accessVideo.length?Math.round(covered/accessVideo.length*100):100;
 P('v11Metrics').innerHTML='<div><b>'+scenes.length+'</b><small>Scenes</small></div><div><b>'+interactions+'</b><small>Interactions</small></div><div><b>'+total+'</b><small>Score weight</small></div><div><b>'+complexity+'%</b><small>Complexity index</small></div>';
 const notes=[];if(total!==100)notes.push({l:'warn',t:'Assessment weight',d:'Configured station + question weight is '+total+', not 100.'});else notes.push({l:'pass',t:'Assessment weight',d:'Configured learning score weight totals 100.'});if(req===0)notes.push({l:'warn',t:'Required completion',d:'No stations are marked required.'});else notes.push({l:'pass',t:'Required completion',d:req+' station(s) are required.'});notes.push({l:accessScore<100?'warn':'pass',t:'Video accessibility',d:accessScore+'% of packaged video assets have captions or transcripts.'});notes.push({l:interactions<scenes.length?'warn':'pass',t:'Interaction density',d:interactions+' interactive behaviors across '+scenes.length+' scene(s).'});P('v11Analysis').innerHTML=notes.map(n=>'<div class="station" style="'+(n.l==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(n.l==='pass'?'✓':'!')+'</span><div><b>'+e11(n.t)+'</b><div class="muted">'+e11(n.d)+'</div></div></div>').join('')
}
P('v11Analyze').onclick=analyze;

/* runtime animation + experimental AR metadata */
const prevRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=prevRuntime(preview);
 const arId=P('v11ARAsset')?.value||'';let arAssetSrc='';if(arId){const m=(state.media||[]).find(x=>x.id===arId);if(m){arAssetSrc=preview&&window.VRClassroomMediaFiles?.has(m.id)?URL.createObjectURL(new Blob([window.VRClassroomMediaFiles.get(m.id)],{type:m.type||'model/gltf-binary'})):m.path}}
 const payload=JSON.stringify({animations:state.animations||[],ar:state.v11Settings||{},arAssetId:arId,arAssetSrc}).replace(/</g,'\\u003c');
 const code=`
 <script>
 (function(){
 const v11=${payload};
 function applyAnimations(){if(typeof world==='undefined')return;(v11.animations||[]).forEach(a=>{const el=world.querySelector('[data-object-id="'+a.objectId+'"]');if(!el)return;const prop=a.property==='rotation'?'rotation':a.property==='scale'?'scale':a.property==='position'?'position':a.property==='visible'?'visible':a.property;el.setAttribute('animation__v11_'+String(a.id).replace(/[^a-z0-9]/gi,''),'property:'+prop+'; to:'+a.to+'; dur:'+Number(a.dur||1000)+'; easing:'+(a.easing||'linear')+'; loop:'+!!a.loop)})}
 function initAR(){
  if(!v11.ar.arPlacementExperimental||!navigator.xr)return;
  const scene=document.querySelector('a-scene');if(!scene)return;
  const btn=document.createElement('button');btn.textContent='Enter AR Placement';btn.style.cssText='position:fixed;z-index:40;left:12px;bottom:12px;padding:10px 14px;border-radius:10px;border:1px solid #ffffff44;background:#071225ee;color:#fff;font-weight:700';document.body.appendChild(btn);
  const ret=document.createElement('a-ring');ret.id='v11ARReticle';ret.setAttribute('radius-inner','.08');ret.setAttribute('radius-outer','.12');ret.setAttribute('rotation','-90 0 0');ret.setAttribute('color','#7dd3fc');ret.setAttribute('visible','false');scene.appendChild(ret);
  let hitSource=null,localSpace=null,viewerSpace=null,session=null,lastPose=null,rafActive=false;
  btn.onclick=async()=>{try{const supported=await navigator.xr.isSessionSupported('immersive-ar');if(!supported)return alert('Immersive AR is not supported on this device/browser.');if(typeof scene.enterAR==='function')await scene.enterAR();else alert('This A-Frame runtime cannot enter AR on this device.')}catch(e){alert('AR session could not start: '+e.message)}};
  scene.addEventListener('enter-vr',async()=>{session=scene.renderer?.xr?.getSession?.();if(!session||session.environmentBlendMode==='opaque')return;try{viewerSpace=await session.requestReferenceSpace('viewer');localSpace=await session.requestReferenceSpace('local');hitSource=await session.requestHitTestSource({space:viewerSpace});session.addEventListener('select',()=>{if(!lastPose)return;let placed;if(v11.arAssetSrc){placed=document.createElement('a-gltf-model');placed.setAttribute('src',v11.arAssetSrc);placed.setAttribute('scale','.5 .5 .5')}else{placed=document.createElement('a-box');placed.setAttribute('color','#7dd3fc');placed.setAttribute('scale','.25 .25 .25')}placed.object3D.position.copy(lastPose.transform.position);placed.object3D.quaternion.copy(lastPose.transform.orientation);scene.appendChild(placed)});if(!rafActive){rafActive=true;const loop=(t,frame)=>{if(!frame||!hitSource||!localSpace){session?.requestAnimationFrame(loop);return}const hits=frame.getHitTestResults(hitSource);if(hits.length){lastPose=hits[0].getPose(localSpace);if(lastPose){ret.object3D.position.copy(lastPose.transform.position);ret.object3D.quaternion.copy(lastPose.transform.orientation);ret.setAttribute('visible','true')}}else ret.setAttribute('visible','false');session?.requestAnimationFrame(loop)};session.requestAnimationFrame(loop)}}catch(e){console.warn('AR hit-test unavailable',e)}});
  scene.addEventListener('exit-vr',()=>{hitSource?.cancel?.();hitSource=null;session=null;lastPose=null;rafActive=false;ret.setAttribute('visible','false')})
 }
 const oldShow=showScene;showScene=function(id){oldShow(id);setTimeout(applyAnimations,120)};setTimeout(()=>{applyAnimations();initAR()},220);
 window.V11Runtime={applyAnimations,initAR,arExperimental:!!v11.ar.arPlacementExperimental};
 })();
 <\/script>`;
 return html.replace('</body></html>',code+'</body></html>')
};

/* audit */
const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v11Checks(){
 const out=[],objs=state.objects||[],groups=state.groups||[],anims=state.animations||[],media=state.media||[];
 const badGroups=groups.filter(g=>(g.objectIds||[]).some(id=>!objs.some(o=>String(o.id)===String(id))));out.push({level:badGroups.length?'warn':'pass',name:'Object groups',detail:badGroups.length?badGroups.length+' group(s) reference deleted objects.':'Object groups resolve to existing objects.'});
 const badAnim=anims.filter(a=>!objs.some(o=>String(o.id)===String(a.objectId)));out.push({level:badAnim.length?'fail':'pass',name:'Animation targets',detail:badAnim.length?badAnim.length+' animation(s) reference missing objects.':'Animation targets resolve.'});
 const badDur=anims.filter(a=>!Number.isFinite(Number(a.dur))||Number(a.dur)<100);out.push({level:badDur.length?'fail':'pass',name:'Animation durations',detail:badDur.length?badDur.length+' animation(s) have invalid durations.':'Animation durations are valid.'});
 const arEnabled=!!state.v11Settings?.arPlacementExperimental,models=media.filter(m=>/\.(glb|gltf)$/i.test(m.name||''));out.push({level:arEnabled&&models.length===0&&objs.length===0?'fail':arEnabled?'warn':'pass',name:'Experimental AR placement',detail:arEnabled?'AR placement is enabled and remains capability-gated/experimental; test on the target device before deployment.':'Experimental AR placement is disabled.'});
 const groupDup=groups.flatMap(g=>g.objectIds||[]).filter((id,i,a)=>a.indexOf(id)!==i);out.push({level:groupDup.length?'warn':'pass',name:'Group membership',detail:groupDup.length?'Some objects belong to multiple groups; verify intended transforms.':'No duplicate group membership detected.'});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v11Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v11Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(P('auditPass'))P('auditPass').textContent=p;if(P('auditWarn'))P('auditWarn').textContent=w;if(P('auditFail'))P('auditFail').textContent=f;if(P('auditResults'))P('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station" style="'+(x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+e11(x.name)+'</b><div class="muted">'+e11(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

const oldRender=render;
render=function(){oldRender();ensureV11();renderSelection();renderTracks();modelOptions();analyze()};
renderSelection();renderTracks();modelOptions();analyze();
})();