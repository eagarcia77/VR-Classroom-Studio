(()=>{
const C=id=>document.getElementById(id);
const esc13=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const CFG='vr-classroom-v13-cloud-config';
let client=null,currentUser=null,currentWorkspaceId='',cloudRevision=0,libPromise=null;
function ensureV13(){state.version=13;state.metadata=state.metadata||{};state.metadata.cloudProjectId=state.metadata.cloudProjectId||''}
ensureV13();
const main=document.querySelector('main.workspace');if(!main)return;
const card=document.createElement('section');card.className='card';card.id='cloudWorkspaceCard';
card.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Cloud Workspace <span class="v6-badge">V13</span></h3><div class="muted">Optional authenticated sync for a dedicated Supabase project. Local authoring remains available without cloud.</div></div>
 <div id="v13Status" class="v13-cloud-status"><span class="v13-dot"></span><b>Local mode</b></div>
</div>
<div class="v13-grid" style="margin-top:12px">
 <div class="v13-card"><h4 style="margin-top:0">Cloud Connection</h4>
  <div class="field"><label>Supabase project URL</label><input id="v13Url" placeholder="https://your-project.supabase.co"></div>
  <div class="field"><label>Publishable key</label><input id="v13Key" type="password" autocomplete="off" placeholder="sb_publishable_... or legacy anon key"></div>
  <div class="toolbar"><button class="btn primary" id="v13Connect">Connect</button><button class="btn" id="v13Disconnect">Disconnect</button></div>
  <div class="v13-security">Use only a publishable/anon key in the browser. Service-role or secret keys are rejected. V13 does not use either of your existing application databases automatically.</div>
 </div>
 <div class="v13-card"><h4 style="margin-top:0">Authentication</h4>
  <div class="field"><label>Email</label><input id="v13Email" type="email" placeholder="instructor@example.edu"></div>
  <div class="toolbar"><button class="btn primary" id="v13Magic">Send magic link</button><button class="btn" id="v13SignOut">Sign out</button></div>
  <div id="v13AuthInfo" class="muted" style="margin-top:9px">Not connected.</div>
 </div>
</div>
<div class="v13-grid" style="margin-top:12px">
 <div class="v13-card"><h4 style="margin-top:0">Cloud Workspaces</h4><div class="toolbar"><button class="btn" id="v13RefreshWorkspaces">Refresh</button><button class="btn primary" id="v13CreateWorkspace">+ Workspace</button></div><div class="field"><label>Active workspace</label><select id="v13Workspace"></select></div><div id="v13WorkspaceInfo" class="muted"></div></div>
 <div class="v13-card"><h4 style="margin-top:0">Cloud Project Sync</h4><div class="toolbar"><button class="btn primary" id="v13Sync">Sync current project</button><button class="btn" id="v13CloudVersion">Create cloud version</button><button class="btn" id="v13RefreshProjects">Refresh projects</button></div><div id="v13Conflict" class="muted" style="margin-top:8px"></div></div>
</div>
<div class="v13-grid" style="margin-top:12px">
 <div class="v13-card"><h4 style="margin-top:0">Cloud Projects</h4><div id="v13CloudProjects" class="v13-cloud-list muted">Connect and sign in to view projects.</div></div>
 <div class="v13-card"><h4 style="margin-top:0">Cloud Versions</h4><div id="v13CloudVersions" class="v13-cloud-list muted">No cloud project selected.</div></div>
</div>`;
main.appendChild(card);
const nav=document.querySelector('aside .nav');if(nav){const b=document.createElement('button');b.innerHTML='☁ Cloud Workspace <span class="badge">V13</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.appendChild(b)}

function loadLib(){
 if(window.supabase?.createClient)return Promise.resolve(window.supabase);
 if(libPromise)return libPromise;
 libPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';s.crossOrigin='anonymous';s.onload=()=>window.supabase?.createClient?resolve(window.supabase):reject(new Error('Supabase client library did not initialize'));s.onerror=()=>reject(new Error('Could not load Supabase client library'));document.head.appendChild(s)});
 return libPromise
}
function readCfg(){try{return JSON.parse(localStorage.getItem(CFG)||'{}')}catch{return {}}}
function keyKind(k){
 if(!k)return 'missing';if(k.startsWith('sb_secret_'))return 'secret';
 if(k.split('.').length===3){try{const p=JSON.parse(atob(k.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));if(p.role==='service_role')return 'service';if(p.role==='anon')return 'publishable'}catch{}}
 if(k.startsWith('sb_publishable_'))return 'publishable';return 'unknown'
}
function status(label,kind=''){C('v13Status').innerHTML='<span class="v13-dot '+kind+'"></span><b>'+esc13(label)+'</b>'}
function stripForCloud(){const copy=JSON.parse(JSON.stringify(state));delete copy.undoStack;delete copy.redoStack;delete copy.history;return copy}
function saveCfg(url,key){localStorage.setItem(CFG,JSON.stringify({url,key}));C('v13Url').value=url;C('v13Key').value=key}
async function connect(){
 const url=C('v13Url').value.trim().replace(/\/$/,''),key=C('v13Key').value.trim(),kind=keyKind(key);
 if(!/^https:\/\/[^/]+\.supabase\.co$/i.test(url))return alert('Enter a valid Supabase project URL.');
 if(kind==='secret'||kind==='service')return alert('Secret/service-role keys are not allowed in the browser.');
 if(kind==='missing')return alert('Enter a publishable key.');
 try{const lib=await loadLib();client=lib.createClient(url,key,{auth:{persistSession:true,detectSessionInUrl:true,flowType:'pkce'}});saveCfg(url,key);const {data,error}=await client.auth.getSession();if(error)throw error;currentUser=data.session?.user||null;status(currentUser?'Cloud connected · signed in':'Cloud connected','ok');renderAuth();client.auth.onAuthStateChange((_event,session)=>{currentUser=session?.user||null;renderAuth();status(currentUser?'Cloud connected · signed in':'Cloud connected','ok');if(currentUser)refreshAll()});if(currentUser)await refreshAll()}catch(e){client=null;status('Cloud connection failed','bad');alert(e.message)}
}
function disconnect(){client=null;currentUser=null;currentWorkspaceId='';cloudRevision=0;localStorage.removeItem(CFG);C('v13Url').value='';C('v13Key').value='';status('Local mode');renderAuth();C('v13CloudProjects').textContent='Connect and sign in to view projects.';C('v13CloudVersions').textContent='No cloud project selected.'}
function renderAuth(){C('v13AuthInfo').innerHTML=currentUser?'<b>'+esc13(currentUser.email||currentUser.id)+'</b><br>Authenticated user ID: '+esc13(currentUser.id):client?'Connected, not signed in.':'Not connected.'}
C('v13Connect').onclick=connect;C('v13Disconnect').onclick=disconnect;
C('v13Magic').onclick=async()=>{if(!client)return alert('Connect to Supabase first.');const email=C('v13Email').value.trim();if(!email)return alert('Enter an email address.');const redirectTo=location.origin+location.pathname;const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:redirectTo}});if(error)return alert(error.message);alert('Magic link sent. Your Supabase Auth redirect settings must allow this Render URL.')};
C('v13SignOut').onclick=async()=>{if(client)await client.auth.signOut();currentUser=null;renderAuth();status(client?'Cloud connected':'Local mode',client?'ok':'')};

async function requireAuth(){if(!client)throw new Error('Connect to Supabase first.');const {data,error}=await client.auth.getSession();if(error)throw error;currentUser=data.session?.user||null;if(!currentUser)throw new Error('Sign in first.');return currentUser}
async function loadWorkspaces(){
 await requireAuth();const {data,error}=await client.from('xr_workspaces').select('id,name,owner_id,updated_at').order('name');if(error)throw error;
 const s=C('v13Workspace');s.innerHTML=(data||[]).map(w=>'<option value="'+esc13(w.id)+'">'+esc13(w.name)+'</option>').join('');if(data?.length){if(!data.some(w=>w.id===currentWorkspaceId))currentWorkspaceId=data[0].id;s.value=currentWorkspaceId;C('v13WorkspaceInfo').textContent=data.length+' workspace(s) available.'}else{currentWorkspaceId='';C('v13WorkspaceInfo').textContent='No cloud workspace yet.'}
}
C('v13Workspace').onchange=async()=>{currentWorkspaceId=C('v13Workspace').value;await loadCloudProjects()};
C('v13RefreshWorkspaces').onclick=()=>loadWorkspaces().then(loadCloudProjects).catch(e=>alert(e.message));
C('v13CreateWorkspace').onclick=async()=>{try{const u=await requireAuth(),name=prompt('Workspace name',state.metadata?.institution||'XR Learning Workspace');if(!name)return;const {data,error}=await client.from('xr_workspaces').insert({name,owner_id:u.id}).select('id,name').single();if(error)throw error;const {error:memberError}=await client.from('xr_workspace_members').insert({workspace_id:data.id,user_id:u.id,role:'admin'});if(memberError)throw memberError;currentWorkspaceId=data.id;await loadWorkspaces();C('v13Workspace').value=data.id;await loadCloudProjects()}catch(e){alert(e.message)}};

async function loadCloudProjects(){
 if(!currentWorkspaceId){C('v13CloudProjects').textContent='Select or create a workspace.';return}
 const {data,error}=await client.from('xr_projects').select('id,name,course_code,owner_id,revision,updated_at').eq('workspace_id',currentWorkspaceId).order('updated_at',{ascending:false});if(error)throw error;
 C('v13CloudProjects').innerHTML=(data||[]).length?(data||[]).map(p=>'<div class="v13-project '+(String(p.id)===String(state.metadata?.cloudProjectId)?'active':'')+'"><b>'+esc13(p.name)+'</b><small>'+esc13(p.course_code||'No course code')+' · revision '+p.revision+'</small><small>Updated '+esc13(new Date(p.updated_at).toLocaleString())+'</small><div class="toolbar" style="margin-top:7px"><button class="btn" data-cloudopen="'+esc13(p.id)+'">Open</button><button class="btn" data-cloudversions="'+esc13(p.id)+'">Versions</button></div></div>').join(''):'<div class="muted">No projects in this workspace.</div>';
 C('v13CloudProjects').querySelectorAll('[data-cloudopen]').forEach(b=>b.onclick=()=>openCloudProject(b.dataset.cloudopen));
 C('v13CloudProjects').querySelectorAll('[data-cloudversions]').forEach(b=>b.onclick=()=>loadCloudVersions(b.dataset.cloudversions))
}
async function openCloudProject(id){
 try{await requireAuth();const {data,error}=await client.from('xr_projects').select('id,name,revision,project_data').eq('id',id).single();if(error)throw error;if(!confirm('Open this cloud project? Local media bytes currently loaded in this browser will be retained when IDs match.'))return;const incoming=JSON.parse(JSON.stringify(data.project_data||{}));const localMedia=state.media||[];Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,incoming);state.metadata=state.metadata||{};state.metadata.cloudProjectId=data.id;state.metadata.projectName=data.name;cloudRevision=data.revision;ensureV13();if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render();C('v13Conflict').textContent='Loaded cloud revision '+cloudRevision+'. Local media binaries are not downloaded by V13.';await loadCloudVersions(data.id);await loadCloudProjects()}catch(e){alert(e.message)}
}
async function syncCurrent(){
 try{const u=await requireAuth();if(!currentWorkspaceId)return alert('Select or create a cloud workspace.');state.metadata=state.metadata||{};const payload=stripForCloud(),name=state.metadata.projectName||state.title||'XR Project',course=state.metadata.courseCode||'';
 if(!state.metadata.cloudProjectId){const {data,error}=await client.from('xr_projects').insert({workspace_id:currentWorkspaceId,owner_id:u.id,name,course_code:course,project_data:payload,revision:1}).select('id,revision').single();if(error)throw error;state.metadata.cloudProjectId=data.id;cloudRevision=data.revision;C('v13Conflict').textContent='Cloud project created at revision '+cloudRevision+'.'}
 else{const expected=cloudRevision||1;const {data,error}=await client.from('xr_projects').update({name,course_code:course,project_data:payload,revision:expected+1,updated_at:new Date().toISOString()}).eq('id',state.metadata.cloudProjectId).eq('revision',expected).select('id,revision');if(error)throw error;if(!data?.length){C('v13Conflict').innerHTML='<b>Conflict detected:</b> the cloud revision changed since this project was loaded. Re-open the cloud project before overwriting.';return}cloudRevision=data[0].revision;C('v13Conflict').textContent='Cloud sync complete · revision '+cloudRevision+'.'}
 await loadCloudProjects()}catch(e){alert(e.message)}
}
C('v13Sync').onclick=syncCurrent;C('v13RefreshProjects').onclick=()=>loadCloudProjects().catch(e=>alert(e.message));
async function createCloudVersion(){
 try{const u=await requireAuth(),id=state.metadata?.cloudProjectId;if(!id)return alert('Sync the current project to cloud first.');const label=prompt('Version label','Cloud version '+new Date().toLocaleString())||'Cloud version';const {error}=await client.from('xr_project_versions').insert({project_id:id,created_by:u.id,label,project_data:stripForCloud()});if(error)throw error;await loadCloudVersions(id)}catch(e){alert(e.message)}
}
C('v13CloudVersion').onclick=createCloudVersion;
async function loadCloudVersions(id=state.metadata?.cloudProjectId){
 if(!id){C('v13CloudVersions').textContent='No cloud project selected.';return}const {data,error}=await client.from('xr_project_versions').select('id,label,created_at,created_by').eq('project_id',id).order('created_at',{ascending:false}).limit(30);if(error)throw error;C('v13CloudVersions').innerHTML=(data||[]).length?(data||[]).map(v=>'<div class="v13-version"><div><b>'+esc13(v.label)+'</b><small class="muted">'+esc13(new Date(v.created_at).toLocaleString())+'</small></div><button class="btn" data-v13restore="'+esc13(v.id)+'">Restore copy</button></div>').join(''):'<div class="muted">No cloud versions yet.</div>';C('v13CloudVersions').querySelectorAll('[data-v13restore]').forEach(b=>b.onclick=()=>restoreCloudVersion(b.dataset.v13restore,id))
}
async function restoreCloudVersion(versionId,projectId){
 try{const {data,error}=await client.from('xr_project_versions').select('project_data,label').eq('id',versionId).single();if(error)throw error;if(!confirm('Load this cloud version into the editor as an unsynced working copy?'))return;const cloudId=state.metadata?.cloudProjectId||projectId;Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,JSON.parse(JSON.stringify(data.project_data||{})));state.metadata=state.metadata||{};state.metadata.cloudProjectId=cloudId;ensureV13();cloudRevision=0;if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render();C('v13Conflict').textContent='Historical version loaded as a working copy. Re-open the latest cloud project before attempting an overwrite, or create a new cloud project.'}catch(e){alert(e.message)}
}
async function refreshAll(){await loadWorkspaces();await loadCloudProjects();if(state.metadata?.cloudProjectId)await loadCloudVersions(state.metadata.cloudProjectId)}
async function autoConnect(){const cfg=readCfg();if(cfg.url&&cfg.key){C('v13Url').value=cfg.url;C('v13Key').value=cfg.key;await connect()}}

const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v13Checks(){
 const out=[],cfg=readCfg(),kind=keyKind(cfg.key||C('v13Key')?.value||'');
 out.push({level:kind==='secret'||kind==='service'?'fail':kind==='publishable'?'pass':'warn',name:'Cloud browser key',detail:kind==='publishable'?'Cloud configuration uses a browser-safe publishable/anon key.':kind==='secret'||kind==='service'?'A secret/service-role key must never be exposed in the browser.':'Cloud is unconfigured or the key type could not be identified.'});
 out.push({level:cfg.url&&/^https:\/\//.test(cfg.url)?'pass':'warn',name:'Cloud endpoint',detail:cfg.url?'Configured endpoint uses HTTPS.':'Cloud sync is optional and currently unconfigured.'});
 out.push({level:client&&currentUser?'pass':client?'warn':'pass',name:'Cloud authentication',detail:client&&currentUser?'Authenticated cloud session is active.':client?'Cloud is connected but no authenticated user is active.':'Local-only mode is active; SCORM export remains independent.'});
 const cp=state.metadata?.cloudProjectId;out.push({level:cp&&cloudRevision===0?'warn':'pass',name:'Cloud revision state',detail:cp&&cloudRevision===0?'A historical/unknown revision is loaded; re-open the latest cloud project before overwrite sync.':cp?'Cloud revision tracking is active.':'No cloud project binding is required.'});
 const media=(state.media||[]).filter(m=>m.size);out.push({level:cp&&media.length?'warn':'pass',name:'Cloud media portability',detail:cp&&media.length?'Cloud V13 sync stores project JSON, not local media binaries. Use Project Bundle/SCORM for media durability.':'No cloud media-binary mismatch detected.'});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v13Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v13Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(C('auditPass'))C('auditPass').textContent=p;if(C('auditWarn'))C('auditWarn').textContent=w;if(C('auditFail'))C('auditFail').textContent=f;if(C('auditResults'))C('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station" style="'+(x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc13(x.name)+'</b><div class="muted">'+esc13(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

autoConnect().catch(e=>{status('Cloud auto-connect unavailable','warn');C('v13AuthInfo').textContent=e.message});
})();