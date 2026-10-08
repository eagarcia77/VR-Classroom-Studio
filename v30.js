(()=>{
const B=id=>document.getElementById(id);
const esc30=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV30(){state.version=30;state.v30=state.v30||{autoSyncStations:true,lastStarterBuild:null}}
ensureV30();
const studio=B('live3DEditorCard');if(!studio)return;
const layout=studio.querySelector('.v6-layout');if(!layout)return;

const controls=document.createElement('div');controls.id='v30SceneBuilderControls';
controls.innerHTML=`
<div class="v30-toolbar">
 <div class="field"><label>Active 3D scene</label><select id="v30SceneSelect"></select></div>
 <button class="btn" id="v30NewScene">+ Scene</button>
 <button class="btn" id="v30Starter">Build Starter Scene</button>
 <div class="field"><label>Add to scene</label><select id="v30AddType">
  <option value="inspection">Evidence object</option>
  <option value="station">Learning station</option>
  <option value="hotspot">Interactive hotspot</option>
  <option value="table">Table / work surface</option>
  <option value="screen">Presentation screen</option>
  <option value="trigger-zone">Trigger zone</option>
  <option value="portal">Portal</option>
 </select></div>
 <button class="btn primary" id="v30Add">Add</button>
</div>
<div class="v30-status" id="v30Status"></div>
<div class="v30-help">Objects created here are stored in the same project model used by Preview, VR/AR runtime and SCORM export. Learning stations created here are real instructional stations, not visual placeholders.</div>`;
layout.parentNode.insertBefore(controls,layout);

const summary=document.createElement('div');summary.id='v30SceneSummary';summary.className='v30-scene-summary';
const left=layout.querySelector('.v6-panel');if(left)left.appendChild(summary);

function uid(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6)}
function activeScene(){return (state.scenes||[]).find(s=>String(s.id)===String(state.activeSceneId))||(state.scenes||[])[0]}
function sceneObjects(){const sc=activeScene();return sc?(state.objects||[]).filter(o=>String(o.sceneId)===String(sc.id)):[]}
function sceneStations(){const sc=activeScene();return sc?(state.stations||[]).filter(s=>String(s.sceneId)===String(sc.id)):[]}
function placement(index=0){const cols=[-3,0,3],x=cols[index%3],z=-4-Math.floor(index/3)*2.7;return{x,y:1,z}}
function nextPlacement(){return placement(sceneObjects().length)}
function commit(){if(typeof render==='function')render();setTimeout(renderControls,0)}
function saveUndo(){
 state.undoStack=state.undoStack||[];
 state.undoStack.push(JSON.stringify({objects:state.objects||[],stations:state.stations||[],activeSceneId:state.activeSceneId}));
 if(state.undoStack.length>30)state.undoStack.shift();state.redoStack=[]
}
function sceneOptions(){
 const sel=B('v30SceneSelect');if(!sel)return;
 sel.innerHTML=(state.scenes||[]).map(s=>'<option value="'+esc30(String(s.id))+'">'+esc30(s.name||String(s.id))+'</option>').join('');
 const sc=activeScene();if(sc)sel.value=String(sc.id)
}
function markerFor(st,i){
 const p=placement(i);
 return{id:uid('v30-station-marker'),sceneId:st.sceneId,type:'station',label:st.name||'Learning Station',stationId:st.id,x:p.x,y:p.y,z:p.z,rotationY:0,scale:1,v30Generated:true}
}
function syncStations(){
 const sts=sceneStations();if(!sts.length)return 0;
 saveUndo();let made=0;
 sts.forEach((st,i)=>{
  const exists=(state.objects||[]).some(o=>o.type==='station'&&String(o.stationId)===String(st.id));
  if(!exists){state.objects.push(markerFor(st,i));made++}
 });
 if(!made)state.undoStack.pop();
 commit();return made
}
function starter(){
 const sc=activeScene();if(!sc)return alert('Create a scene first.');
 const has=sceneObjects().length||sceneStations().length;
 if(has&&!confirm('This scene already contains content. Add the starter instructional set without deleting existing items?'))return;
 saveUndo();
 const created={objects:[],stations:[]};
 let station=sceneStations()[0];
 if(!station){
  station={id:uid('v30-station'),sceneId:sc.id,name:'Welcome & Mission Briefing',type:'resource',content:'Review the learning mission, success criteria and required evidence before exploring the scene.',points:0,required:false,alt:'Mission briefing learning station',v30Generated:true};
  state.stations.push(station);created.stations.push(station.id)
 }
 if(!(state.objects||[]).some(o=>o.type==='station'&&String(o.stationId)===String(station.id))){
  const m={...markerFor(station,0),x:0,z:-4};state.objects.push(m);created.objects.push(m.id)
 }
 const defaults=[
  {type:'inspection',label:'Evidence Artifact',x:-3,y:1,z:-6,inspectionText:'Inspect this artifact and connect the evidence to the learning objective.'},
  {type:'table',label:'Learning Work Surface',x:0,y:.8,z:-6},
  {type:'hotspot',label:'Interactive Evidence Point',x:3,y:1.3,z:-6}
 ];
 defaults.forEach((o,i)=>{const n={id:uid('v30-object'),sceneId:sc.id,rotationY:0,scale:1,v30Generated:true,...o};state.objects.push(n);created.objects.push(n.id)});
 const target=(state.scenes||[]).find(s=>String(s.id)!==String(sc.id));
 if(target){const p={id:uid('v30-portal'),sceneId:sc.id,type:'portal',label:'Portal to '+target.name,targetSceneId:target.id,x:4,y:1,z:-3,rotationY:0,scale:1,v30Generated:true};state.objects.push(p);created.objects.push(p.id)}
 state.v30.lastStarterBuild={sceneId:sc.id,createdAt:new Date().toISOString(),...created};
 commit()
}
function createScene(){
 const name=prompt('Scene name','Learning Scene '+((state.scenes||[]).length+1));if(!name)return;
 const id=uid('v30-scene');state.scenes.push({id,name:name.trim(),environment:'Virtual Classroom',sky:'#dfe8f2',v30Generated:true});state.activeSceneId=id;commit()
}
function addStation(){
 const sc=activeScene();if(!sc)return;
 const n=sceneStations().length+1,name=prompt('Learning station name','Learning Station '+n);if(!name)return;
 const st={id:uid('v30-station'),sceneId:sc.id,name:name.trim(),type:'resource',content:'Add instructional content and evidence requirements for this station.',points:0,required:false,alt:'Learning station: '+name.trim(),v30Generated:true};
 state.stations.push(st);const p=nextPlacement(),m={id:uid('v30-marker'),sceneId:sc.id,type:'station',label:st.name,stationId:st.id,...p,rotationY:0,scale:1,v30Generated:true};state.objects.push(m)
}
function addPortal(){
 const sc=activeScene();if(!sc)return;
 let targets=(state.scenes||[]).filter(s=>String(s.id)!==String(sc.id));
 if(!targets.length){
  const id=uid('v30-scene'),s={id,name:'Connected Learning Scene',environment:'Virtual Classroom',sky:'#dfe8f2',v30Generated:true};state.scenes.push(s);targets=[s]
 }
 const list=targets.map((s,i)=>(i+1)+'. '+s.name).join('\n'),pick=Math.max(0,(Number(prompt('Portal destination:\n'+list,'1'))||1)-1),target=targets[pick]||targets[0];
 const p=nextPlacement();state.objects.push({id:uid('v30-portal'),sceneId:sc.id,type:'portal',label:'Portal to '+target.name,targetSceneId:target.id,...p,rotationY:0,scale:1,v30Generated:true})
}
function addObject(type){
 const sc=activeScene();if(!sc)return alert('Create a scene first.');
 saveUndo();
 if(type==='station')addStation();
 else if(type==='portal')addPortal();
 else{
  const labels={inspection:'Evidence Object',hotspot:'Interactive Hotspot',table:'Learning Work Surface',screen:'Presentation Screen','trigger-zone':'Trigger Zone'};
  const p=nextPlacement(),o={id:uid('v30-object'),sceneId:sc.id,type,label:labels[type]||'3D Object',...p,rotationY:0,scale:1,v30Generated:true};
  if(type==='inspection')o.inspectionText='Inspect this object and connect the evidence to the learning objective.';
  if(type==='trigger-zone'){o.radius=2;o.message='You entered an instructional trigger zone.';o.setVariable='';o.setValue='true'}
  state.objects.push(o)
 }
 commit()
}
function emptyOverlay(){
 const canvas=B('v6Canvas');if(!canvas)return;
 canvas.querySelector('#v30Empty')?.remove();
 const objs=sceneObjects(),sts=sceneStations();if(objs.length)return;
 const box=document.createElement('div');box.id='v30Empty';box.className='v30-empty';
 box.innerHTML='<h4>'+esc30(sts.length?'Learning content exists, but nothing is positioned in 3D yet.':'This 3D scene is empty.')+'</h4><p>'+esc30(sts.length?'Synchronize the existing learning stations into spatial markers, or build a starter environment.':'Build a functional starter scene with a mission briefing, evidence artifact, work surface and interactive point.')+'</p><div class="toolbar">'+(sts.length?'<button class="btn" id="v30SyncEmpty">Place stations in 3D</button>':'')+'<button class="btn primary" id="v30StarterEmpty">Build Starter Scene</button></div>';
 canvas.appendChild(box);
 B('v30StarterEmpty').onclick=starter;if(B('v30SyncEmpty'))B('v30SyncEmpty').onclick=()=>{const n=syncStations();if(!n)alert('All stations are already represented in 3D.')}
}
function renderControls(){
 ensureV30();sceneOptions();const sc=activeScene(),objs=sceneObjects(),sts=sceneStations(),missing=sts.filter(st=>!objs.some(o=>o.type==='station'&&String(o.stationId)===String(st.id)));
 const portals=objs.filter(o=>o.type==='portal').length;
 B('v30Status').innerHTML='<span class="v30-chip"><span class="v30-dot '+(sc?'':'warn')+'"></span>'+esc30(sc?'Scene ready':'No active scene')+'</span><span class="v30-chip">'+objs.length+' 3D objects</span><span class="v30-chip">'+sts.length+' stations</span>'+(missing.length?'<button class="btn" id="v30Sync" style="padding:4px 8px">Place '+missing.length+' station'+(missing.length===1?'':'s')+' in 3D</button>':'');
 if(B('v30Sync'))B('v30Sync').onclick=()=>syncStations();
 B('v30SceneSummary').innerHTML='<div><b>'+objs.length+'</b><small>Objects</small></div><div><b>'+sts.length+'</b><small>Stations</small></div><div><b>'+portals+'</b><small>Portals</small></div><div><b>'+missing.length+'</b><small>Unplaced stations</small></div>';
 setTimeout(emptyOverlay,80)
}
B('v30SceneSelect').onchange=()=>{state.activeSceneId=B('v30SceneSelect').value;commit()};
B('v30NewScene').onclick=createScene;B('v30Starter').onclick=starter;B('v30Add').onclick=()=>addObject(B('v30AddType').value);

function checks(){
 const scenes=state.scenes||[],objects=state.objects||[],stations=state.stations||[];
 const dup=objects.length-new Set(objects.map(o=>String(o.id))).size;
 const badPortals=objects.filter(o=>o.type==='portal'&&!scenes.some(s=>String(s.id)===String(o.targetSceneId)));
 const missingMarkers=stations.filter(st=>!st.performanceTaskId&&!objects.some(o=>o.type==='station'&&String(o.stationId)===String(st.id)));
 const empty=scenes.filter(s=>!objects.some(o=>String(o.sceneId)===String(s.id))&&!stations.some(st=>String(st.sceneId)===String(s.id)));
 const unsupported=objects.filter(o=>o.type==='custom'&&!o.url&&!o.assetId);
 return[
  {level:dup?'fail':'pass',name:'V30 unique 3D object IDs',detail:dup?dup+' duplicate object identifier(s) detected.':'3D object identifiers are unique and string-safe.'},
  {level:badPortals.length?'fail':'pass',name:'V30 portal destinations',detail:badPortals.length?badPortals.length+' portal(s) target missing scenes.':'All portals resolve to existing scenes.'},
  {level:missingMarkers.length?'warn':'pass',name:'V30 spatial station representation',detail:missingMarkers.length?missingMarkers.length+' learning station(s) are not yet represented by a 3D marker.':'Every learning station has a 3D spatial marker.'},
  {level:empty.length?'warn':'pass',name:'V30 authored scene content',detail:empty.length?empty.length+' scene(s) are completely empty. Use Build Starter Scene or add instructional objects.':'Every scene contains instructional content.'},
  {level:unsupported.length?'warn':'pass',name:'V30 custom model source',detail:unsupported.length?unsupported.length+' custom object(s) have no model URL/asset.':'Custom model objects have a source when used.'}
 ]
}
const oldChecks=window.VRClassroomAudit?.checks,oldRun=window.VRClassroomAudit?.run;
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=checks(),all=[...base,...extras],p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(B('auditPass'))B('auditPass').textContent=p;if(B('auditWarn'))B('auditWarn').textContent=w;if(B('auditFail'))B('auditFail').textContent=f;if(B('auditResults'))B('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc30(x.name)+'</b><div class="muted">'+esc30(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};
const oldRender=render;render=function(){oldRender();ensureV30();setTimeout(renderControls,0)};
renderControls();
})();