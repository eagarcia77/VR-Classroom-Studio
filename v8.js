(()=>{
const X=id=>document.getElementById(id);
const esc8=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV8(){
 state.version=8;
 state.inventoryCatalog=state.inventoryCatalog||[];
 state.v8Settings=state.v8Settings||{inventoryHUD:true,proximityMeters:2.2,comfortTeleport:true};
}
ensureV8();
const main=document.querySelector('main.workspace');if(!main)return;
const card=document.createElement('section');card.className='card';card.id='immersiveSimulationCard';
card.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Immersive Simulation Objects <span class="v6-badge">V8</span></h3><div class="muted">Build escape rooms, labs, technical training and scenario-based simulations.</div></div>
 <div class="toolbar"><button class="btn" id="v8AddCollectible">+ Collectible</button><button class="btn" id="v8AddDoor">+ Smart Door</button><button class="btn" id="v8AddZone">+ Trigger Zone</button><button class="btn" id="v8AddInspect">+ Inspectable</button><button class="btn" id="v8AddMedia">+ Media Screen</button><button class="btn" id="v8AddAudio">+ Audio Zone</button></div>
</div>
<div class="v8-grid">
 <div class="v8-card"><h4>Collectibles & Inventory</h4><p>Keys, tools, evidence, badges and virtual equipment that students can collect.</p></div>
 <div class="v8-card"><h4>Smart Doors & Locks</h4><p>Gate access using inventory items or simulation variables.</p></div>
 <div class="v8-card"><h4>Trigger Zones</h4><p>Run actions when the learner approaches an area in the virtual environment.</p></div>
 <div class="v8-card"><h4>360° Environments</h4><p>Use a packaged panoramic image as the scene background.</p></div>
 <div class="v8-card"><h4>Media Screens</h4><p>Place packaged images or videos inside immersive scenes.</p></div>
 <div class="v8-card"><h4>Object Inspection</h4><p>Present instructional information when a student examines an object.</p></div>
</div>
<h4>Inventory Catalog</h4><div class="toolbar"><button class="btn" id="v8NewItem">+ Inventory item</button><label class="btn">Scene 360° image<select id="v8SkySelect" style="margin-left:7px;background:#091224;color:white;border:1px solid #253252;border-radius:7px;padding:4px"></select></label></div>
<div id="v8Inventory" class="v8-inventory"></div>
<h4>Advanced Scene Objects</h4><div id="v8Objects"></div>`;
main.appendChild(card);
const nav=document.querySelector('aside .nav');if(nav){const b=document.createElement('button');b.innerHTML='🎮 Simulation Objects <span class="badge">V8</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.appendChild(b)}

function scene(){return (state.scenes||[]).find(s=>s.id===state.activeSceneId)||state.scenes?.[0]}
function newObject(type,label,extra={}){const o={id:Date.now()+Math.floor(Math.random()*999),sceneId:state.activeSceneId,type,label,x:0,y:type==='trigger-zone'?1:.8,z:-4,rotationY:0,scale:1,...extra};state.objects.push(o);if(typeof render==='function')render();renderV8();return o}
function mediaImageOptions(){const imgs=(state.media||[]).filter(m=>/^image\//.test(m.type||'')||/\.(png|jpe?g|webp)$/i.test(m.name||''));return '<option value="">No 360 background</option>'+imgs.map(m=>`<option value="${esc8(m.id)}">${esc8(m.name)}</option>`).join('')}
function renderInventory(){const box=X('v8Inventory');if(!box)return;box.innerHTML=(state.inventoryCatalog||[]).length?state.inventoryCatalog.map(i=>`<span class="v8-token"><b>${esc8(i.name)}</b> · ${esc8(i.id)} <button data-itemrm="${esc8(i.id)}" style="border:0;background:none;color:#fca5a5">×</button></span>`).join(''):'<span class="muted">No inventory items defined.</span>';box.querySelectorAll('[data-itemrm]').forEach(b=>b.onclick=()=>{const id=b.dataset.itemrm;state.inventoryCatalog=state.inventoryCatalog.filter(i=>i.id!==id);(state.objects||[]).filter(o=>o.inventoryItemId===id||o.requiredItemId===id).forEach(o=>{if(o.inventoryItemId===id)o.inventoryItemId='';if(o.requiredItemId===id)o.requiredItemId=''});renderV8()})}
function renderV8(){
 ensureV8();renderInventory();
 const sky=X('v8SkySelect');if(sky){sky.innerHTML=mediaImageOptions();sky.value=scene()?.skyAssetId||''}
 const advanced=(state.objects||[]).filter(o=>['collectible','smart-door','trigger-zone','inspection','media-screen','audio-zone'].includes(o.type));
 const box=X('v8Objects');if(!box)return;
 box.innerHTML=advanced.length?advanced.map(o=>`<div class="v8-object-row"><div><b>${esc8(o.label||o.type)}</b><br><small>${esc8(o.type)} · Scene: ${esc8((state.scenes.find(s=>s.id===o.sceneId)||{}).name||'Missing')}</small></div><div>${o.type==='collectible'?'Item: '+esc8(o.inventoryItemId||'unassigned'):o.type==='smart-door'?'Requires: '+esc8(o.requiredItemId||o.requiredVariable||'none'):o.type==='trigger-zone'?'Radius: '+Number(o.radius||2)+'m':o.type==='media-screen'?'Media: '+esc8(o.mediaAssetId||'unassigned'):o.type==='audio-zone'?'Audio: '+esc8(o.mediaAssetId||'unassigned'):'Inspection info'}</div><button class="btn" data-v8edit="${o.id}">Edit</button></div>`).join(''):'<div class="muted">No V8 simulation objects.</div>';
 box.querySelectorAll('[data-v8edit]').forEach(b=>b.onclick=()=>editObject(Number(b.dataset.v8edit)))
}
X('v8NewItem').onclick=()=>{const name=prompt('Inventory item name','Access Key');if(!name)return;let id=prompt('Inventory ID',name.toLowerCase().replace(/[^a-z0-9]+/g,'_'));if(!id)return;if(!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(id))return alert('Use letters, numbers and underscore; do not start with a number.');if(state.inventoryCatalog.some(x=>x.id===id))return alert('That inventory ID already exists.');state.inventoryCatalog.push({id,name});renderV8()};
X('v8AddCollectible').onclick=()=>{if(!state.inventoryCatalog.length)return alert('Create an inventory item first.');const item=state.inventoryCatalog[0];newObject('collectible',item.name,{inventoryItemId:item.id,once:true,inspectionText:'Collect '+item.name})};
X('v8AddDoor').onclick=()=>newObject('smart-door','Smart Door',{requiredItemId:state.inventoryCatalog[0]?.id||'',requiredVariable:'',targetSceneId:(state.scenes||[]).find(s=>s.id!==state.activeSceneId)?.id||''});
X('v8AddZone').onclick=()=>newObject('trigger-zone','Trigger Zone',{radius:2,message:'You entered an interactive zone.',setVariable:'',setValue:'true'});
X('v8AddInspect').onclick=()=>newObject('inspection','Inspectable Object',{inspectionText:'Review this object and connect it to the learning objective.'});
X('v8AddMedia').onclick=()=>{const media=(state.media||[]).filter(m=>/^(image|video)\//.test(m.type||'')||/\.(png|jpe?g|webp|mp4|webm|pdf)$/i.test(m.name||''));if(!media.length)return alert('Add an image, video, or PDF to Media Packaging first.');const list=media.map((m,i)=>(i+1)+'. '+m.name).join('\n'),pick=Number(prompt('Choose media number:\n'+list,'1'))-1;if(!media[pick])return;newObject('media-screen','Media Screen: '+media[pick].name,{mediaAssetId:media[pick].id,inspectionText:'Open immersive media.'})};
X('v8AddAudio').onclick=()=>{const media=(state.media||[]).filter(m=>/^audio\//.test(m.type||'')||/\.(mp3|wav|ogg)$/i.test(m.name||''));if(!media.length)return alert('Add an audio file to Media Packaging first.');const list=media.map((m,i)=>(i+1)+'. '+m.name).join('\n'),pick=Number(prompt('Choose audio number:\n'+list,'1'))-1;if(!media[pick])return;newObject('audio-zone','Audio Zone: '+media[pick].name,{mediaAssetId:media[pick].id,radius:3,loop:false})};
X('v8SkySelect').onchange=()=>{const s=scene();if(!s)return;s.skyAssetId=X('v8SkySelect').value;if(typeof render==='function')render()};
function editObject(id){const o=state.objects.find(x=>x.id===id);if(!o)return;
 if(o.type==='collectible'){const item=prompt('Inventory item ID',o.inventoryItemId||'');if(item!==null)o.inventoryItemId=item;const text=prompt('Collection/inspection message',o.inspectionText||'');if(text!==null)o.inspectionText=text}
 else if(o.type==='smart-door'){const item=prompt('Required inventory item ID (blank for none)',o.requiredItemId||'');if(item!==null)o.requiredItemId=item;const v=prompt('Required variable name (blank for none)',o.requiredVariable||'');if(v!==null)o.requiredVariable=v;const val=prompt('Required variable value',o.requiredValue||'true');if(val!==null)o.requiredValue=val;const target=prompt('Target scene ID',o.targetSceneId||'');if(target!==null)o.targetSceneId=target}
 else if(o.type==='trigger-zone'){const radius=prompt('Trigger radius in meters',o.radius||2);if(radius!==null)o.radius=Math.max(.25,Number(radius)||2);const msg=prompt('Message when entered',o.message||'');if(msg!==null)o.message=msg;const v=prompt('Variable to set (optional)',o.setVariable||'');if(v!==null)o.setVariable=v;const val=prompt('Value to set',o.setValue||'true');if(val!==null)o.setValue=val}
 else if(o.type==='media-screen'||o.type==='audio-zone'){const id=prompt('Media asset ID',o.mediaAssetId||'');if(id!==null)o.mediaAssetId=id;if(o.type==='audio-zone'){const radius=prompt('Audio radius in meters',o.radius||3);if(radius!==null)o.radius=Math.max(.5,Number(radius)||3)}}else {const txt=prompt('Inspection text',o.inspectionText||'');if(txt!==null)o.inspectionText=txt}
 renderV8()
}

const prevRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=prevRuntime(preview);
 html=html.replace("currentScene=r.currentScene||currentScene;earnedQ=Number(r.earnedQ||0);completed=new Set(r.completed||[]);answered=new Set(r.answered||[])","currentScene=r.currentScene||currentScene;earnedQ=Number(r.earnedQ||0);completed=new Set(r.completed||[]);answered=new Set(r.answered||[]);window.__v8savedInventory=r.v8inventory||[]");
 html=html.replace("v7fired:window.V7Runtime?window.V7Runtime.fired():[]})","v7fired:window.V7Runtime?window.V7Runtime.fired():[],v8inventory:window.V8Runtime?window.V8Runtime.inventory():window.__v8savedInventory||[]})");
 const sceneSkies={};for(const s of state.scenes||[]){if(s.skyAssetId){const m=(state.media||[]).find(x=>x.id===s.skyAssetId);if(m)sceneSkies[s.id]=preview&&window.VRClassroomMediaFiles?.has(m.id)?URL.createObjectURL(new Blob([window.VRClassroomMediaFiles.get(m.id)],{type:m.type||'image/jpeg'})):m.path}}
 const mediaMap={};for(const m of state.media||[]){let src=m.path;if(preview&&window.VRClassroomMediaFiles?.has(m.id))src=URL.createObjectURL(new Blob([window.VRClassroomMediaFiles.get(m.id)],{type:m.type||'application/octet-stream'}));mediaMap[m.id]={src,type:m.type||'',name:m.name||m.id}}
 const payload=JSON.stringify({inventoryCatalog:state.inventoryCatalog||[],sceneSkies,mediaMap}).replace(/</g,'\\u003c');
 const code=`
 <script>
 (function(){
 const cfg=${payload},inventory=new Set(),triggered=new Set(),by=id=>document.getElementById(id);
 let userActivated=false;document.addEventListener('pointerdown',()=>userActivated=true,{once:true});const activeAudio=new Map();
 const inventoryBox=document.createElement('div');inventoryBox.id='v8InventoryHUD';inventoryBox.style.cssText='position:fixed;z-index:25;right:12px;bottom:12px;max-width:260px;background:#071225ee;border:1px solid #ffffff2a;border-radius:12px;padding:9px 11px;color:#fff;font:12px system-ui';inventoryBox.innerHTML='<b>Inventory</b><div id="v8InventoryItems">Empty</div>';document.body.appendChild(inventoryBox);
 function hud(){const e=by('v8InventoryItems');if(e)e.textContent=inventory.size?[...inventory].join(', '):'Empty'}
 function msg(t){if(typeof ui!=='undefined'){ui.mt.textContent='Interaction';ui.mc.textContent=t||'Interaction completed.';ui.choices.innerHTML='';ui.completeBtn.style.display='none';ui.modal.style.display='block'}if(typeof announce==='function')announce(t||'Interaction completed.')}
 function showMedia(o){const m=cfg.mediaMap[o.mediaAssetId];if(!m)return msg('Media asset is unavailable.');if(typeof ui==='undefined')return;ui.mt.textContent=o.label||m.name;ui.mc.textContent='';ui.choices.innerHTML='';ui.completeBtn.style.display='none';let el;if(/^video\//.test(m.type)||/\.(mp4|webm)$/i.test(m.name)){el=document.createElement('video');el.controls=true;el.src=m.src;el.style.maxWidth='100%';el.style.width='100%'}else if(/^image\//.test(m.type)||/\.(png|jpe?g|webp)$/i.test(m.name)){el=document.createElement('img');el.src=m.src;el.alt=o.label||m.name;el.style.maxWidth='100%';el.style.maxHeight='45vh'}else{el=document.createElement('a');el.href=m.src;el.target='_blank';el.rel='noopener';el.textContent='Open '+m.name;el.style.color='#7dd3fc'}ui.choices.appendChild(el);ui.modal.style.display='block'}
 function audioFor(o){const m=cfg.mediaMap[o.mediaAssetId];if(!m)return null;if(activeAudio.has(o.id))return activeAudio.get(o.id);const a=new Audio(m.src);a.loop=!!o.loop;activeAudio.set(o.id,a);return a}
 function hasVar(n,val){if(!n)return true;return window.V7Vars&&String(window.V7Vars[n])===String(val)}
 function currentObjects(){return (project.objects||[]).filter(o=>o.sceneId===currentScene)}
 function wire(){
   document.querySelectorAll('[data-object-id]').forEach(el=>{if(el.dataset.v8wired)return;el.dataset.v8wired='1';const o=(project.objects||[]).find(x=>String(x.id)===String(el.dataset.objectId));if(!o)return;
    if(o.type==='collectible'){el.addEventListener('click',()=>{if(o.once&&inventory.has(o.inventoryItemId))return;inventory.add(o.inventoryItemId);el.setAttribute('visible','false');msg(o.inspectionText||('Collected '+o.label));hud();persist()})}
    if(o.type==='smart-door'){el.addEventListener('click',()=>{const okItem=!o.requiredItemId||inventory.has(o.requiredItemId),okVar=hasVar(o.requiredVariable,o.requiredValue||'true');if(okItem&&okVar&&o.targetSceneId){msg('Access granted.');setTimeout(()=>showScene(o.targetSceneId),250)}else msg('Access locked. Complete the required condition first.')})}
    if(o.type==='inspection'){el.addEventListener('click',()=>msg(o.inspectionText||o.label))}
    if(o.type==='media-screen'){el.addEventListener('click',()=>showMedia(o))}
    if(o.type==='audio-zone'){el.addEventListener('click',()=>{const a=audioFor(o);if(!a)return msg('Audio asset is unavailable.');if(a.paused)a.play().catch(()=>msg('Select the audio zone again to start playback.'));else a.pause()})}
   })
 }
 function sky(){const src=cfg.sceneSkies[currentScene];const s=document.querySelector('a-sky');if(s&&src)s.setAttribute('src',src);else if(s){s.removeAttribute('src');s.setAttribute('color','#284e73')}}
 function proximity(){const cam=document.querySelector('[camera]');if(!cam?.object3D)return;const p=cam.object3D.getWorldPosition(new THREE.Vector3());for(const o of currentObjects().filter(x=>x.type==='trigger-zone'||x.type==='audio-zone')){const dx=p.x-Number(o.x||0),dy=p.y-Number(o.y||0),dz=p.z-Number(o.z||0),d=Math.sqrt(dx*dx+dy*dy+dz*dz),key=String(o.id),radius=Number(o.radius||2);if(o.type==='trigger-zone'){if(d<=radius&&!triggered.has(key)){triggered.add(key);if(o.setVariable&&window.V7Vars)window.V7Vars[o.setVariable]=o.setValue;msg(o.message||'Interactive zone entered.');persist()}else if(d>radius+1)triggered.delete(key)}else{const a=audioFor(o);if(!a)continue;if(d<=radius&&userActivated&&a.paused)a.play().catch(()=>{});if(d>radius+1&&!a.paused)a.pause()}}}
 function persist(){try{const raw=SCORM.get('cmi.suspend_data'),d=raw?JSON.parse(raw):{};d.v8inventory=[...inventory];SCORM.set('cmi.suspend_data',JSON.stringify(d).slice(0,60000));SCORM.commit()}catch(e){}}
 try{(window.__v8savedInventory||[]).forEach(x=>inventory.add(x))}catch(e){}
 window.V8Runtime={inventory:()=>[...inventory]};hud();const oldShow=window.showScene;window.showScene=function(id){oldShow(id);setTimeout(()=>{wire();sky()},50)};setInterval(()=>{wire();proximity()},500);setTimeout(()=>{wire();sky()},150);
 })();
 <\/script>`;
 return html.replace('</body></html>',code+'</body></html>')
};

const oldAuditRun=window.VRClassroomAudit?.run,oldAuditChecks=window.VRClassroomAudit?.checks;
function v8Checks(){
 const out=[],objs=state.objects||[],items=state.inventoryCatalog||[],scenes=state.scenes||[],vars=state.variables||{};
 const coll=objs.filter(o=>o.type==='collectible'&&(!o.inventoryItemId||!items.some(i=>i.id===o.inventoryItemId)));
 out.push({level:coll.length?'fail':'pass',name:'Collectible inventory mapping',detail:coll.length?coll.length+' collectible(s) reference missing inventory items.':'All collectibles map to inventory items.'});
 const doors=objs.filter(o=>o.type==='smart-door'&&((o.requiredItemId&&!items.some(i=>i.id===o.requiredItemId))||(o.requiredVariable&&!Object.prototype.hasOwnProperty.call(vars,o.requiredVariable))||(o.targetSceneId&&!scenes.some(s=>String(s.id)===String(o.targetSceneId)))));
 out.push({level:doors.length?'fail':'pass',name:'Smart door requirements',detail:doors.length?doors.length+' smart door(s) have invalid requirements or targets.':'Smart door dependencies resolve.'});
 const zones=objs.filter(o=>o.type==='trigger-zone'&&(!Number.isFinite(Number(o.radius))||Number(o.radius)<=0));
 out.push({level:zones.length?'fail':'pass',name:'Trigger zone geometry',detail:zones.length?zones.length+' trigger zone(s) have invalid radius values.':'Trigger zone radii are valid.'});
 const skies=(state.scenes||[]).filter(s=>s.skyAssetId&&!(state.media||[]).some(m=>m.id===s.skyAssetId));
 out.push({level:skies.length?'fail':'pass',name:'360 environment assets',detail:skies.length?skies.length+' scene(s) reference missing 360 assets.':'360 environment references resolve.'});
 const noAltMedia=(state.media||[]).filter(m=>/^video\//.test(m.type||'')&&!m.captionPolicy);
 out.push({level:noAltMedia.length?'warn':'pass',name:'Video accessibility metadata',detail:noAltMedia.length?noAltMedia.length+' video asset(s) do not yet have asset-level caption metadata; project-level caption policy still applies.':'No video accessibility metadata warning detected.'});
 const mediaObjs=objs.filter(o=>['media-screen','audio-zone'].includes(o.type)&&(!o.mediaAssetId||!(state.media||[]).some(m=>m.id===o.mediaAssetId)));
 out.push({level:mediaObjs.length?'fail':'pass',name:'Immersive media object mapping',detail:mediaObjs.length?mediaObjs.length+' media object(s) reference missing packaged assets.':'Media screens and audio zones resolve to packaged assets.'});
 return out
}
if(oldAuditChecks)window.VRClassroomAudit.checks=()=>[...oldAuditChecks(),...v8Checks()];
if(oldAuditRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldAuditRun(scroll),extras=v8Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(X('auditPass'))X('auditPass').textContent=p;if(X('auditWarn'))X('auditWarn').textContent=w;if(X('auditFail'))X('auditFail').textContent=f;if(X('auditResults'))X('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>`<div class="station" style="${x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':''}"><span class="num">${x.level==='pass'?'✓':x.level==='warn'?'!':'×'}</span><div><b>${esc8(x.name)}</b><div class="muted">${esc8(x.detail)}</div></div><span class="v3-pill">${x.level.toUpperCase()}</span></div>`).join(''));return all};

const oldRender=render;
render=function(){oldRender();ensureV8();renderV8()};
renderV8();
})();