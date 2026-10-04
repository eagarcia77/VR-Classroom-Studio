(()=>{
const N=id=>document.getElementById(id);
const e9=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV9(){
 state.version=9;
 state.npcs=state.npcs||[];
 state.objectStates=state.objectStates||{};
 state.v9Settings=state.v9Settings||{npcCaptions:true,interactionDistance:2.5};
}
ensureV9();
const main=document.querySelector('main.workspace');if(!main)return;
const card=document.createElement('section');card.className='card';card.id='npcScenarioCard';
card.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">NPC & Scenario Studio <span class="v6-badge">V9</span></h3><div class="muted">Create virtual guides, branching dialogue and state-driven scenario behavior.</div></div>
 <div class="toolbar"><button class="btn primary" id="v9AddNPC">+ NPC / Guide</button><button class="btn" id="v9RefreshMap">Refresh Scenario Map</button></div>
</div>
<div class="v9-grid" style="margin-top:14px">
 <div class="v9-card"><h4 style="margin-top:0">Virtual Guides & NPCs</h4><div id="v9NPCList" class="v9-list"></div></div>
 <div class="v9-card"><h4 style="margin-top:0">Scenario State Map</h4><div id="v9ScenarioMap" class="v9-map"></div></div>
</div>`;
main.appendChild(card);

const stateCard=document.createElement('section');stateCard.className='card';stateCard.id='objectStateCard';
stateCard.innerHTML=`
<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div><h3 style="margin:0">Object State & Transform Pad <span class="v6-badge">V9</span></h3><div class="muted">Directly adjust the selected 3D object and assign simulation states.</div></div><button class="btn" id="v9SyncSelection">Sync selected V6 object</button></div>
<div class="v9-grid" style="margin-top:12px">
 <div class="v9-card"><h4 style="margin-top:0">Selected Object</h4><div id="v9Selected" class="muted">No V6 object selected.</div><div class="v9-pad" id="v9Pad">
  <button data-delta="x,-0.25">X−</button><button data-delta="y,0.25">Y+</button><button data-delta="x,0.25">X+</button>
  <button data-delta="ry,-5">R−</button><button data-delta="z,-0.25">Z−</button><button data-delta="ry,5">R+</button>
  <button data-delta="s,-0.1">S−</button><button data-delta="y,-0.25">Y−</button><button data-delta="s,0.1">S+</button>
 </div></div>
 <div class="v9-card"><h4 style="margin-top:0">Object State</h4><div class="field"><label>State name</label><input id="v9StateName" placeholder="e.g. locked, damaged, active"></div><div class="field"><label>State value</label><input id="v9StateValue" placeholder="e.g. true, 50, complete"></div><button class="btn primary" id="v9SetState">Set state</button><div id="v9States" class="v9-state"></div></div>
</div>`;
main.appendChild(stateCard);

const nav=document.querySelector('aside .nav');if(nav){const b=document.createElement('button');b.innerHTML='🧑‍🏫 NPC & Scenario <span class="badge">V9</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.appendChild(b);const s=document.createElement('button');s.textContent='🎛 Object State';s.onclick=()=>stateCard.scrollIntoView({behavior:'smooth'});nav.appendChild(s)}

function activeScene(){return (state.scenes||[]).find(s=>s.id===state.activeSceneId)||state.scenes?.[0]}
function mediaModels(){return (state.media||[]).filter(m=>/\.(glb|gltf)$/i.test(m.name||''))}
function renderNPCs(){
 const box=N('v9NPCList');if(!box)return;
 if(!state.npcs.length){box.innerHTML='<div class="muted">No NPCs or virtual guides yet.</div>';return}
 box.innerHTML=state.npcs.map(n=>`<div class="v9-row"><div><b>${e9(n.name)}</b><small>${e9(n.role||'Virtual guide')} · ${e9((state.scenes.find(s=>s.id===n.sceneId)||{}).name||'Missing scene')}</small><small>${e9(n.dialogue||'No dialogue')}</small></div><div class="toolbar"><button class="btn" data-editnpc="${n.id}">Edit</button><button class="btn danger" data-delnpc="${n.id}">×</button></div></div>`).join('');
 box.querySelectorAll('[data-editnpc]').forEach(b=>b.onclick=()=>editNPC(Number(b.dataset.editnpc)));
 box.querySelectorAll('[data-delnpc]').forEach(b=>b.onclick=()=>{state.npcs=state.npcs.filter(n=>n.id!==Number(b.dataset.delnpc));renderNPCs();renderMap()})
}
function renderMap(){
 const box=N('v9ScenarioMap');if(!box)return;const scenes=state.scenes||[],rules=state.rules||[],doors=(state.objects||[]).filter(o=>o.type==='smart-door'),portals=(state.objects||[]).filter(o=>o.type==='portal');
 box.innerHTML=scenes.length?scenes.map(s=>{const outgoing=[];rules.filter(r=>r.enabled&&r.action==='open-scene').forEach(r=>{let origin='';if(r.event==='scene-enter')origin=String(r.sourceId);else if(r.event==='object-click')origin=String((state.objects||[]).find(o=>String(o.id)===String(r.sourceId))?.sceneId||'');else if(r.event==='station-complete')origin=String((state.stations||[]).find(st=>String(st.id)===String(r.sourceId))?.sceneId||'');if(origin===String(s.id))outgoing.push('Rule → '+((scenes.find(x=>String(x.id)===String(r.targetSceneId))||{}).name||r.targetSceneId))});portals.filter(o=>o.sceneId===s.id&&o.targetSceneId).forEach(o=>outgoing.push('Portal → '+((scenes.find(x=>String(x.id)===String(o.targetSceneId))||{}).name||o.targetSceneId)));doors.filter(o=>o.sceneId===s.id&&o.targetSceneId).forEach(o=>outgoing.push('Door → '+((scenes.find(x=>String(x.id)===String(o.targetSceneId))||{}).name||o.targetSceneId)));return `<div class="v9-scene"><b>${e9(s.name)}</b><span>${(state.npcs||[]).filter(n=>n.sceneId===s.id).length} NPC · ${(state.stations||[]).filter(st=>st.sceneId===s.id).length} station(s)</span>${outgoing.map(x=>`<span class="v9-edge">${e9(x)}</span>`).join('')}</div>`}).join(''):'<div class="muted">No scenes available.</div>'
}
N('v9RefreshMap').onclick=renderMap;
N('v9AddNPC').onclick=()=>{const name=prompt('NPC / guide name','Virtual Learning Guide');if(!name)return;const dialogue=prompt('Opening dialogue','Welcome. Select me whenever you need guidance.')||'';state.npcs.push({id:Date.now(),sceneId:state.activeSceneId,name,role:'Virtual guide',dialogue,x:1,y:0,z:-4,rotationY:0,modelAssetId:'',requiredVariable:'',requiredValue:'true',setVariable:'',setValue:'true',points:0});renderNPCs();renderMap()};
function editNPC(id){const n=state.npcs.find(x=>x.id===id);if(!n)return;let v=prompt('NPC name',n.name);if(v!==null&&v.trim())n.name=v.trim();v=prompt('Role',n.role||'Virtual guide');if(v!==null)n.role=v;v=prompt('Dialogue / caption',n.dialogue||'');if(v!==null)n.dialogue=v;v=prompt('Required variable (optional)',n.requiredVariable||'');if(v!==null)n.requiredVariable=v;v=prompt('Required value',n.requiredValue||'true');if(v!==null)n.requiredValue=v;v=prompt('Variable to set after interaction (optional)',n.setVariable||'');if(v!==null)n.setVariable=v;v=prompt('Value to set',n.setValue||'true');if(v!==null)n.setValue=v;v=prompt('Bonus points',String(n.points||0));if(v!==null)n.points=Number(v)||0;const models=mediaModels();if(models.length){const current=models.findIndex(m=>m.id===n.modelAssetId);const choice=prompt('Optional model number (0 = simple avatar):\n0. Simple avatar\n'+models.map((m,i)=>(i+1)+'. '+m.name).join('\n'),String(current>=0?current+1:0));const idx=Number(choice)-1;n.modelAssetId=models[idx]?.id||''}renderNPCs();renderMap()}

let selectedId=null;
function syncSelected(){
 const el=document.querySelector('#v6Tree .v6-tree-item.active');selectedId=el?Number(el.dataset.id):selectedId;const o=(state.objects||[]).find(x=>x.id===selectedId);N('v9Selected').innerHTML=o?'<b>'+e9(o.label||o.type)+'</b><br><span class="muted">x '+Number(o.x||0).toFixed(2)+' · y '+Number(o.y||0).toFixed(2)+' · z '+Number(o.z||0).toFixed(2)+' · rot '+Number(o.rotationY||0)+' · scale '+Number(o.scale||1).toFixed(2)+'</span>':'No V6 object selected.';renderStates()
}
N('v9SyncSelection').onclick=syncSelected;
N('v9Pad').querySelectorAll('[data-delta]').forEach(b=>b.onclick=()=>{syncSelected();const o=(state.objects||[]).find(x=>x.id===selectedId);if(!o)return alert('Select an object in the V6 hierarchy first.');const [k,d]=b.dataset.delta.split(','),delta=Number(d);if(k==='ry')o.rotationY=Number(o.rotationY||0)+delta;else if(k==='s')o.scale=Math.max(.1,Number(o.scale||1)+delta);else o[k]=Number(o[k]||0)+delta;if(typeof render==='function')render();setTimeout(syncSelected,0)});
N('v9SetState').onclick=()=>{syncSelected();const o=(state.objects||[]).find(x=>x.id===selectedId);if(!o)return alert('Select a 3D object first.');const name=N('v9StateName').value.trim(),value=N('v9StateValue').value;if(!name)return alert('Enter a state name.');state.objectStates[String(o.id)]=state.objectStates[String(o.id)]||{};state.objectStates[String(o.id)][name]=value;N('v9StateName').value='';N('v9StateValue').value='';renderStates()};
function renderStates(){const box=N('v9States');if(!box)return;const states=state.objectStates[String(selectedId)]||{};box.innerHTML=Object.keys(states).length?Object.entries(states).map(([k,v])=>`<span><b>${e9(k)}</b>=${e9(v)}</span>`).join(''):'<span class="muted">No states for selected object.</span>'}

const previousRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=previousRuntime(preview);
 const mediaMap={};for(const m of state.media||[]){if(!/\.(glb|gltf)$/i.test(m.name||''))continue;let src=m.path;if(preview&&window.VRClassroomMediaFiles?.has(m.id))src=URL.createObjectURL(new Blob([window.VRClassroomMediaFiles.get(m.id)],{type:m.type||'model/gltf-binary'}));mediaMap[m.id]=src}
 const payload=JSON.stringify({npcs:state.npcs||[],objectStates:state.objectStates||{},mediaMap}).replace(/</g,'\\u003c');
 const code=`
 <script>
 (function(){
 const v9=${payload};window.V9ObjectStates=Object.assign({},v9.objectStates||{});
 function npcAllowed(n){return !n.requiredVariable||(window.V7Vars&&String(window.V7Vars[n.requiredVariable])===String(n.requiredValue||'true'))}
 function talk(n){if(!npcAllowed(n)){if(typeof ui!=='undefined'){ui.mt.textContent=n.name;ui.mc.textContent='This guide is not available yet.';ui.choices.innerHTML='';ui.completeBtn.style.display='none';ui.modal.style.display='block'}return}if(typeof ui!=='undefined'){ui.mt.textContent=n.name+(n.role?' — '+n.role:'');ui.mc.textContent=n.dialogue||'Hello.';ui.choices.innerHTML='';ui.completeBtn.style.display='none';ui.modal.style.display='block'}if(n.setVariable&&window.V7Vars)window.V7Vars[n.setVariable]=n.setValue;if(Number(n.points||0)>0&&!n._awarded){earnedQ+=Number(n.points);n._awarded=true;update()}persistV9()}
 function renderNPC(){if(typeof world==='undefined')return;world.querySelectorAll('[data-v9-npc]').forEach(e=>e.remove());(v9.npcs||[]).filter(n=>String(n.sceneId)===String(currentScene)).forEach(n=>{const root=document.createElement('a-entity');root.dataset.v9Npc=String(n.id);root.setAttribute('position',(n.x||0)+' '+(n.y||0)+' '+(n.z||-4));root.setAttribute('rotation','0 '+(n.rotationY||0)+' 0');let visual;if(n.modelAssetId&&v9.mediaMap[n.modelAssetId]){visual=document.createElement('a-gltf-model');visual.setAttribute('src',v9.mediaMap[n.modelAssetId]);visual.setAttribute('scale','.8 .8 .8')}else{visual=document.createElement('a-entity');const body=document.createElement('a-cylinder');body.setAttribute('radius','.35');body.setAttribute('height','1.2');body.setAttribute('color','#7dd3fc');body.setAttribute('position','0 .8 0');const head=document.createElement('a-sphere');head.setAttribute('radius','.28');head.setAttribute('color','#dff7ff');head.setAttribute('position','0 1.6 0');visual.appendChild(body);visual.appendChild(head)}root.appendChild(visual);const label=document.createElement('a-text');label.setAttribute('value',n.name);label.setAttribute('align','center');label.setAttribute('width','3');label.setAttribute('position','0 2.1 0');root.appendChild(label);root.addEventListener('click',()=>talk(n));world.appendChild(root)})}
 function applyStates(){if(typeof world==='undefined')return;world.querySelectorAll('[data-object-id]').forEach(el=>{const st=window.V9ObjectStates[String(el.dataset.objectId)]||{};if(String(st.visible).toLowerCase()==='false')el.setAttribute('visible','false');else if(String(st.visible).toLowerCase()==='true')el.setAttribute('visible','true');if(st.color)el.setAttribute('color',String(st.color));if(st.opacity!==undefined)el.setAttribute('material','opacity:'+Math.max(0,Math.min(1,Number(st.opacity))))})}
 function persistV9(){try{const raw=SCORM.get('cmi.suspend_data'),d=raw?JSON.parse(raw):{};d.v9states=window.V9ObjectStates;d.v9npcAwarded=(v9.npcs||[]).filter(n=>n._awarded).map(n=>n.id);SCORM.set('cmi.suspend_data',JSON.stringify(d).slice(0,60000));SCORM.commit()}catch(e){}}
 try{const raw=SCORM.get('cmi.suspend_data');if(raw){const d=JSON.parse(raw);if(d.v9states)window.V9ObjectStates=Object.assign({},window.V9ObjectStates,d.v9states);(d.v9npcAwarded||[]).forEach(id=>{const n=(v9.npcs||[]).find(x=>x.id===id);if(n)n._awarded=true})}}catch(e){}
 const old=showScene;showScene=function(id){old(id);setTimeout(()=>{renderNPC();applyStates()},80)};setTimeout(()=>{renderNPC();applyStates()},180);window.V9Runtime={talk,states:window.V9ObjectStates,applyStates};
 })();
 <\/script>`;
 return html.replace('</body></html>',code+'</body></html>')
};

const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v9Checks(){
 const r=[],npcs=state.npcs||[],scenes=state.scenes||[],media=state.media||[],vars=state.variables||{},objs=state.objects||[];
 const badScene=npcs.filter(n=>!scenes.some(s=>String(s.id)===String(n.sceneId)));r.push({level:badScene.length?'fail':'pass',name:'NPC scene mapping',detail:badScene.length?badScene.length+' NPC(s) reference missing scenes.':'All NPCs belong to valid scenes.'});
 const badModel=npcs.filter(n=>n.modelAssetId&&!media.some(m=>m.id===n.modelAssetId));r.push({level:badModel.length?'fail':'pass',name:'NPC model assets',detail:badModel.length?badModel.length+' NPC(s) reference missing model assets.':'NPC model references resolve.'});
 const noDialogue=npcs.filter(n=>!String(n.dialogue||'').trim());r.push({level:noDialogue.length?'warn':'pass',name:'NPC dialogue accessibility',detail:noDialogue.length?noDialogue.length+' NPC(s) have no text dialogue/caption.':'NPCs have text dialogue suitable for non-audio access.'});
 const badVars=npcs.filter(n=>(n.requiredVariable&&!Object.prototype.hasOwnProperty.call(vars,n.requiredVariable))||(n.setVariable&&!Object.prototype.hasOwnProperty.call(vars,n.setVariable)));r.push({level:badVars.length?'fail':'pass',name:'NPC variable references',detail:badVars.length?badVars.length+' NPC(s) reference undefined variables.':'NPC variables resolve.'});
 const badStates=Object.keys(state.objectStates||{}).filter(id=>!objs.some(o=>String(o.id)===String(id)));r.push({level:badStates.length?'warn':'pass',name:'Object state mapping',detail:badStates.length?badStates.length+' saved object-state record(s) reference deleted objects.':'Object state records map to existing objects.'});
 const navDead=scenes.filter(s=>s.id!==state.scenes?.[0]?.id&&!((state.objects||[]).some(o=>String(o.targetSceneId)===String(s.id))||(state.rules||[]).some(rule=>rule.enabled&&rule.action==='open-scene'&&String(rule.targetSceneId)===String(s.id))));r.push({level:navDead.length?'warn':'pass',name:'Scene reachability',detail:navDead.length?navDead.length+' scene(s) may be unreachable from portals, doors or branching rules.':'All non-entry scenes have at least one navigation reference.'});
 return r
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v9Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v9Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(N('auditPass'))N('auditPass').textContent=p;if(N('auditWarn'))N('auditWarn').textContent=w;if(N('auditFail'))N('auditFail').textContent=f;if(N('auditResults'))N('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>`<div class="station" style="${x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':''}"><span class="num">${x.level==='pass'?'✓':x.level==='warn'?'!':'×'}</span><div><b>${e9(x.name)}</b><div class="muted">${e9(x.detail)}</div></div><span class="v3-pill">${x.level.toUpperCase()}</span></div>`).join(''));return all};

const oldRender=render;
render=function(){oldRender();ensureV9();renderNPCs();renderMap();setTimeout(syncSelected,0)};
renderNPCs();renderMap();syncSelected();
})();