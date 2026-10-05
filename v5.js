(()=>{
const V=id=>document.getElementById(id), mediaFiles=new Map();
window.VRClassroomMediaFiles=mediaFiles;
function ensureV5(){
 state.version=5;state.media=state.media||[];state.history=state.history||[];
}
ensureV5();
const main=document.querySelector('main.workspace');if(!main)return;
const card=document.createElement('section');card.className='card';card.id='mediaManagerCard';
card.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Media & Asset Packaging V5</h3><div class="muted">Bundle local XR assets inside the exported SCORM package.</div></div><label class="btn primary">+ Add local media<input id="v5MediaInput" type="file" multiple accept=".glb,.gltf,.png,.jpg,.jpeg,.webp,.mp4,.webm,.mp3,.wav,.pdf" style="display:none"></label></div>
<div class="notice" style="margin-top:12px">Local files selected in this browser session are packaged into the SCORM ZIP. Save a Project Bundle to preserve them outside the current session.</div>
<div id="v5MediaList" class="v5-media-grid"></div>
<div class="v5-toolbar" style="margin-top:12px"><button class="btn" id="v5ProjectBundle">Export Project Bundle</button><label class="btn">Import Project Bundle<input id="v5BundleImport" type="file" accept=".zip,application/zip" style="display:none"></label></div>`;
main.appendChild(card);

const sceneTools=document.createElement('section');sceneTools.className='card';sceneTools.id='sceneManagementCard';
sceneTools.innerHTML=`<h3 style="margin-top:0">Scene Management & Recovery</h3><div class="v5-toolbar"><button class="btn" id="v5DuplicateScene">Duplicate active scene</button><button class="btn danger" id="v5DeleteScene">Delete active scene</button><button class="btn" id="v5Snapshot">Create snapshot</button><button class="btn" id="v5Restore">Restore last snapshot</button></div><div class="muted" id="v5SnapshotStatus" style="margin-top:10px">No V5 snapshot created in this session.</div>`;
main.appendChild(sceneTools);

const cap=document.createElement('section');cap.className='card';cap.id='xrCapabilityCard';
cap.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div><h3 style="margin:0">XR Capability Check</h3><div class="muted">Detect capabilities of the current browser/device.</div></div><button class="btn primary" id="v5CheckXR">Check XR</button></div><div id="v5XRResults" style="margin-top:12px"></div>`;
main.appendChild(cap);

const nav=document.querySelector('aside .nav');if(nav){for(const [t,target] of [['🗂 Media Packaging',card],['🧬 Scene Recovery',sceneTools],['📡 XR Capability',cap]]){const b=document.createElement('button');b.textContent=t;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)}}

function safeName(name){return String(name||'asset').replace(/[^a-zA-Z0-9._-]+/g,'_').replace(/^_+/,'').slice(0,120)||'asset'}
function uniquePath(name,id){const n=safeName(name),dot=n.lastIndexOf('.');return dot>0?n.slice(0,dot)+'_'+id+n.slice(dot):n+'_'+id}
function mediaRender(){
 const box=V('v5MediaList');if(!box)return;
 if(!state.media.length){box.innerHTML='<div class="muted">No local assets added.</div>';return}
 box.innerHTML=state.media.map(m=>`<div class="v5-media"><b title="${m.name}">${m.name}</b><small>${m.type||'file'} · ${Math.round((m.size||0)/1024)} KB</small><small>${mediaFiles.has(m.id)?'<span class="v5-ok">Available for packaging</span>':'<span class="v5-warn">File bytes not loaded</span>'}</small><div class="toolbar" style="margin-top:8px"><button class="btn" data-link="${m.id}">Add as 3D object</button><button class="btn danger" data-rm="${m.id}">Remove</button></div></div>`).join('');
 box.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{const id=b.dataset.rm;state.media=state.media.filter(m=>m.id!==id);mediaFiles.delete(id);mediaRender()});
 box.querySelectorAll('[data-link]').forEach(b=>b.onclick=()=>{const m=state.media.find(x=>x.id===b.dataset.link);if(!m)return;if(!/\.(glb|gltf)$/i.test(m.name))return alert('Only GLB/GLTF files can be placed as 3D objects.');const o={id:Date.now(),sceneId:state.activeSceneId,type:'custom',label:m.name.replace(/\.[^.]+$/,''),assetId:m.id,url:'',x:0,y:1,z:-5,rotationY:0,scale:1};state.objects.push(o);if(typeof render==='function')render();alert('3D object added to the active scene.')});
}
V('v5MediaInput').onchange=async e=>{for(const file of [...e.target.files]){const id='asset-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),path=uniquePath(file.name,id.slice(-6));state.media.push({id,name:file.name,path:'assets/'+path,type:file.type,size:file.size});mediaFiles.set(id,await file.arrayBuffer())}e.target.value='';mediaRender();if(typeof render==='function')render()};

function currentScene(){return (state.scenes||[]).find(s=>s.id===state.activeSceneId)}
V('v5DuplicateScene').onclick=()=>{const s=currentScene();if(!s)return;const old=s.id,id='scene-'+Date.now();state.scenes.push({...s,id,name:s.name+' Copy'});const clones=(state.objects||[]).filter(o=>o.sceneId===old).map((o,i)=>({...o,id:Date.now()+i+1,sceneId:id,targetSceneId:o.targetSceneId===old?id:o.targetSceneId}));state.objects.push(...clones);state.activeSceneId=id;if(typeof render==='function')render()};
V('v5DeleteScene').onclick=()=>{if((state.scenes||[]).length<=1)return alert('A project must contain at least one scene.');const s=currentScene();if(!s||!confirm('Delete scene "'+s.name+'" and its scene objects?'))return;state.scenes=state.scenes.filter(x=>x.id!==s.id);state.objects=state.objects.filter(o=>o.sceneId!==s.id);state.stations=state.stations.filter(st=>st.sceneId!==s.id);state.objects.filter(o=>o.type==='portal'&&o.targetSceneId===s.id).forEach(o=>o.targetSceneId='');state.activeSceneId=state.scenes[0].id;if(typeof render==='function')render()};
let snapshot=null;
V('v5Snapshot').onclick=()=>{snapshot=JSON.stringify(state);V('v5SnapshotStatus').textContent='Snapshot created at '+new Date().toLocaleTimeString()};
V('v5Restore').onclick=()=>{if(!snapshot)return alert('No snapshot exists in this browser session.');Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,JSON.parse(snapshot));if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render();V('v5SnapshotStatus').textContent='Last snapshot restored.'};

async function xrCheck(){
 const rows=[];const add=(n,ok,d)=>rows.push({n,ok,d});
 add('Secure context',window.isSecureContext,'WebXR immersive sessions require HTTPS/secure context.');
 add('WebXR API',!!navigator.xr,'navigator.xr '+(navigator.xr?'is available.':'is not available.'));
 if(navigator.xr){for(const mode of ['immersive-vr','immersive-ar']){try{const ok=await navigator.xr.isSessionSupported(mode);add(mode,ok,ok?'Supported by this device/browser.':'Not supported by this device/browser.')}catch(e){add(mode,false,'Capability query failed: '+e.name)}}}
 add('SCORM authoring mode',true,'Authoring site does not require a Blackboard session; exported package does.');
 V('v5XRResults').innerHTML=rows.map(r=>`<div class="v5-cap"><div><b>${r.n}</b><div class="muted">${r.d}</div></div><b class="${r.ok?'v5-ok':'v5-warn'}">${r.ok?'YES':'NO'}</b></div>`).join('');
}
V('v5CheckXR').onclick=xrCheck;

const originalRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 const backups=[];
 for(const o of state.objects||[]){if(o.assetId){backups.push([o,o.url]);const m=state.media.find(x=>x.id===o.assetId);if(m){if(preview&&mediaFiles.has(m.id)){const blob=new Blob([mediaFiles.get(m.id)],{type:m.type||'application/octet-stream'});o.url=URL.createObjectURL(blob)}else o.url=m.path}}}
 const html=originalRuntime(preview);
 for(const [o,u] of backups)o.url=u;
 return html;
};

async function exportV5(){
 const audit=window.VRClassroomAudit?.run(false)||[],blocks=audit.filter(x=>x.level==='fail');if(blocks.length)return alert('Production audit found blockers:\n- '+blocks.map(x=>x.name+': '+x.detail).join('\n- '));
 const missing=state.media.filter(m=>!mediaFiles.has(m.id));if(missing.length)return alert('Some local media bytes are missing. Import the Project Bundle or re-add these files:\n- '+missing.map(x=>x.name).join('\n- '));
 const zip=new JSZip();zip.file('imsmanifest.xml',manifest());zip.file('scorm_api.js',scormAPI());zip.file('index.html',runtimeHTML(false));
 const [af,lic]=await Promise.all([fetch('vendor/aframe-v1.8.0.min.js'),fetch('vendor/AFRAME-LICENSE.txt')]);if(!af.ok||!lic.ok)return alert('Local XR runtime could not be loaded for packaging.');
 zip.file('aframe.min.js',await af.arrayBuffer());zip.file('AFRAME-LICENSE.txt',await lic.text());
 for(const m of state.media)zip.file(m.path,mediaFiles.get(m.id));
 zip.file('project.json',JSON.stringify(state,null,2));zip.file('README.txt','VR Classroom Studio audited SCORM 2004 package. Local media and A-Frame runtime are bundled.');
 const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(state.title||'vr-classroom').replace(/[^a-z0-9]+/gi,'_')+'_SCORM2004.zip';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)
}
if(V('exportBtn')){V('exportBtn').textContent='Export Audited SCORM';V('exportBtn').onclick=exportV5}

V('v5ProjectBundle').onclick=async()=>{const zip=new JSZip();zip.file('project.json',JSON.stringify(state,null,2));for(const m of state.media)if(mediaFiles.has(m.id))zip.file(m.path,mediaFiles.get(m.id));const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='VR-Classroom-Project-Bundle.zip';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)};
V('v5BundleImport').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const zip=await JSZip.loadAsync(file),pj=zip.file('project.json');if(!pj)throw new Error('project.json missing');const incoming=JSON.parse(await pj.async('text'));Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,incoming);mediaFiles.clear();for(const m of state.media||[]){const z=zip.file(m.path);if(z)mediaFiles.set(m.id,await z.async('arraybuffer'))}ensureV5();if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render();mediaRender();alert('Project Bundle imported.')}catch(err){alert('Invalid Project Bundle: '+err.message)}e.target.value=''};

const oldAudit=window.VRClassroomAudit?.checks, oldRun=window.VRClassroomAudit?.run;
function v5AuditExtras(){const r=[];const missing=(state.media||[]).filter(m=>!mediaFiles.has(m.id));r.push({level:missing.length?'warn':'pass',name:'Bundled local media',detail:missing.length?missing.length+' media file(s) are referenced but their bytes are not loaded in this browser session.':'All referenced local media bytes are available for packaging.'});const orphanAssets=(state.objects||[]).filter(o=>o.assetId&&!(state.media||[]).some(m=>m.id===o.assetId));r.push({level:orphanAssets.length?'fail':'pass',name:'3D asset references',detail:orphanAssets.length?orphanAssets.length+' object(s) reference missing media assets.':'All local 3D asset references resolve.'});const external=(state.objects||[]).filter(o=>o.type==='custom'&&!o.assetId&&o.url);r.push({level:external.length?'warn':'pass',name:'External model portability',detail:external.length?external.length+' custom model(s) still depend on external URLs.':'No unbundled external 3D models detected.'});return r}
if(oldAudit){window.VRClassroomAudit.checks=()=>[...oldAudit(),...v5AuditExtras()]}
if(oldRun){window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),all=[...base,...v5AuditExtras()];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,fl=all.filter(x=>x.level==='fail').length;if(V('auditPass'))V('auditPass').textContent=p;if(V('auditWarn'))V('auditWarn').textContent=w;if(V('auditFail'))V('auditFail').textContent=fl;if(V('auditResults')){const extras=v5AuditExtras().map(x=>`<div class="station" style="${x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':''}"><span class="num">${x.level==='pass'?'✓':x.level==='warn'?'!':'×'}</span><div><b>${x.name}</b><div class="muted">${x.detail}</div></div><span class="v3-pill">${x.level.toUpperCase()}</span></div>`).join('');V('auditResults').insertAdjacentHTML('beforeend',extras)}return all}}
mediaRender();xrCheck();
})();