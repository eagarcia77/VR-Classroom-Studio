(()=>{
const W=id=>document.getElementById(id);
const esc12=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const STORE='vr-classroom-v12-projects',TEMPLATES='vr-classroom-v12-templates',ACTIVE='vr-classroom-v12-active',ROLE='vr-classroom-v12-role';
function clonePlain(v){return JSON.parse(JSON.stringify(v))}
function ensureV12(){
 state.version=12;
 state.metadata=state.metadata||{institution:'',department:'',courseCode:'',term:'',author:'',projectId:'project-'+Date.now(),projectName:state.title||'Untitled XR Project'};
 state.metadata.projectId=state.metadata.projectId||'project-'+Date.now();
 state.metadata.projectName=state.metadata.projectName||state.title||'Untitled XR Project';
}
ensureV12();
const main=document.querySelector('main.workspace');if(!main)return;

const dash=document.createElement('section');dash.className='card';dash.id='institutionalWorkspaceCard';
dash.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Institutional XR Workspace <span class="v6-badge">V12</span></h3><div class="muted">Manage multiple immersive course projects, reusable templates and persistent versions.</div></div>
 <div class="toolbar"><span class="v12-status" id="v12SaveStatus"><span class="v12-save-dot"></span>Autosave ready</span><button class="btn primary" id="v12SaveProject">Save now</button></div>
</div>
<div class="v12-grid" style="margin-top:12px">
 <div class="v12-card"><h4 style="margin-top:0">Project Dashboard</h4><div class="toolbar"><button class="btn" id="v12NewProject">+ New project</button><button class="btn" id="v12CloneProject">Clone current</button><button class="btn" id="v12Snapshot">Create version</button></div><div id="v12Projects" class="v12-projects"></div></div>
 <div class="v12-card"><h4 style="margin-top:0">Institutional Metadata</h4><div class="v12-meta">
  <div class="field"><label>Project name</label><input id="v12ProjectName"></div>
  <div class="field"><label>Institution</label><input id="v12Institution" placeholder="Institution / organization"></div>
  <div class="field"><label>Department / unit</label><input id="v12Department"></div>
  <div class="field"><label>Course code</label><input id="v12CourseCode"></div>
  <div class="field"><label>Term / cohort</label><input id="v12Term"></div>
  <div class="field"><label>Author / owner</label><input id="v12Author"></div>
 </div>
 <div class="field"><label>Workspace role</label><select id="v12Role"><option value="instructor">Instructor</option><option value="reviewer">Reviewer</option><option value="admin">Admin</option></select></div>
 <div class="v12-role-note">Workspace roles only change authoring workflow/UI. They are not security roles and do not replace real authentication or server-side RBAC.</div>
 </div>
</div>`;
main.appendChild(dash);

const hist=document.createElement('section');hist.className='card';hist.id='versionHistoryCard';
hist.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Persistent Version History <span class="v6-badge">V12</span></h3><div class="muted">Structural snapshots are saved locally without embedding large media binaries.</div></div><button class="btn" id="v12ClearVersions">Clear current history</button></div>
<div class="v12-grid" style="margin-top:12px"><div class="v12-card"><h4 style="margin-top:0">Versions</h4><div id="v12Versions" class="v12-history"></div></div><div class="v12-card"><h4 style="margin-top:0">Recovery & storage</h4><div id="v12StorageInfo" class="muted"></div><div class="notice" style="margin-top:10px">Autosave stores project structure and metadata only. Use Project Bundle when local media files must be preserved between browser sessions.</div></div></div>`;
main.appendChild(hist);

const templates=document.createElement('section');templates.className='card';templates.id='institutionalTemplateCard';
templates.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Reusable Institutional Templates <span class="v6-badge">V12</span></h3><div class="muted">Save the current instructional structure as a reusable template without student data.</div></div><button class="btn primary" id="v12SaveTemplate">Save current as template</button></div>
<div id="v12Templates" style="margin-top:12px"></div>`;
main.appendChild(templates);

const nav=document.querySelector('aside .nav');if(nav){[['🏛 Institutional Workspace',dash],['🕘 Version History',hist],['📚 Template Library',templates]].forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)})}

function readStore(key,fallback){try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}}
function writeStore(key,val){try{localStorage.setItem(key,JSON.stringify(val));return true}catch(e){W('v12SaveStatus').textContent='Storage unavailable';return false}}
function projects(){return readStore(STORE,[])}
function templatesData(){return readStore(TEMPLATES,[])}
function stripTransient(){
 const copy=clonePlain(state);
 delete copy.undoStack;delete copy.redoStack;delete copy.history;
 return copy
}
function metadataToForm(){ensureV12();W('v12ProjectName').value=state.metadata.projectName||'';W('v12Institution').value=state.metadata.institution||'';W('v12Department').value=state.metadata.department||'';W('v12CourseCode').value=state.metadata.courseCode||'';W('v12Term').value=state.metadata.term||'';W('v12Author').value=state.metadata.author||'';W('v12Role').value=localStorage.getItem(ROLE)||'instructor'}
function formToMetadata(){ensureV12();state.metadata.projectName=W('v12ProjectName').value.trim()||state.title||'Untitled XR Project';state.metadata.institution=W('v12Institution').value.trim();state.metadata.department=W('v12Department').value.trim();state.metadata.courseCode=W('v12CourseCode').value.trim();state.metadata.term=W('v12Term').value.trim();state.metadata.author=W('v12Author').value.trim()}
function saveProject(createVersion=false){
 formToMetadata();const arr=projects(),id=state.metadata.projectId;const now=new Date().toISOString();let p=arr.find(x=>x.id===id);
 if(!p){p={id,name:state.metadata.projectName,createdAt:now,updatedAt:now,current:null,versions:[]};arr.push(p)}
 p.name=state.metadata.projectName;p.updatedAt=now;p.current=stripTransient();
 if(createVersion){p.versions=p.versions||[];p.versions.unshift({id:'ver-'+Date.now(),createdAt:now,label:'Manual version '+new Date().toLocaleString(),state:stripTransient()});p.versions=p.versions.slice(0,15)}
 if(writeStore(STORE,arr)){localStorage.setItem(ACTIVE,id);W('v12SaveStatus').innerHTML='<span class="v12-save-dot"></span>Saved '+new Date().toLocaleTimeString();renderProjects();renderVersions();storageInfo()}
}
function loadProject(id,versionState=null){
 const p=projects().find(x=>x.id===id);const src=versionState||p?.current;if(!src)return;Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,clonePlain(src));ensureV12();localStorage.setItem(ACTIVE,state.metadata.projectId);if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render();metadataToForm();renderProjects();renderVersions();storageInfo()
}
function renderProjects(){const arr=projects(),box=W('v12Projects');if(!box)return;const active=state.metadata?.projectId;box.innerHTML=arr.length?arr.map(p=>`<div class="v12-project ${p.id===active?'active':''}"><b>${esc12(p.name)}</b><small>Updated ${esc12(new Date(p.updatedAt).toLocaleString())}</small><small>${(p.versions||[]).length} saved version(s)</small><div class="toolbar" style="margin-top:8px"><button class="btn" data-load="${esc12(p.id)}">Open</button><button class="btn" data-clone="${esc12(p.id)}">Clone</button><button class="btn danger" data-del="${esc12(p.id)}">Delete</button></div></div>`).join(''):'<div class="muted">No locally saved projects yet.</div>';box.querySelectorAll('[data-load]').forEach(b=>b.onclick=()=>loadProject(b.dataset.load));box.querySelectorAll('[data-clone]').forEach(b=>b.onclick=()=>cloneStored(b.dataset.clone));box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{if(!confirm('Delete this locally saved project and its local version history?'))return;writeStore(STORE,arr.filter(p=>p.id!==b.dataset.del));renderProjects()})}
function cloneStored(id){const p=projects().find(x=>x.id===id);if(!p?.current)return;const copy=clonePlain(p.current);copy.metadata=copy.metadata||{};copy.metadata.projectId='project-'+Date.now();copy.metadata.projectName=(copy.metadata.projectName||p.name)+' Copy';Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,copy);metadataToForm();saveProject(true);if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render()}
function renderVersions(){const p=projects().find(x=>x.id===state.metadata?.projectId),box=W('v12Versions');if(!box)return;const list=p?.versions||[];box.innerHTML=list.length?list.map(v=>`<div class="v12-version"><div><b>${esc12(v.label)}</b><small class="muted">${esc12(new Date(v.createdAt).toLocaleString())}</small></div><button class="btn" data-restore="${esc12(v.id)}">Restore</button></div>`).join(''):'<div class="muted">No saved versions for this project.</div>';box.querySelectorAll('[data-restore]').forEach(b=>b.onclick=()=>{const v=list.find(x=>x.id===b.dataset.restore);if(v&&confirm('Restore this structural version?'))loadProject(p.id,v.state)})}
function storageInfo(){const media=(state.media||[]).length,bytes=(state.media||[]).reduce((a,m)=>a+Number(m.size||0),0),struct=JSON.stringify(stripTransient()).length;W('v12StorageInfo').innerHTML='<b>Structural autosave:</b> '+Math.round(struct/1024)+' KB<br><b>Referenced local media:</b> '+media+' file(s), '+Math.round(bytes/1024/1024*10)/10+' MB<br><b>Persistent media bytes:</b> '+(media?'Use Project Bundle':'Not required')}

W('v12SaveProject').onclick=()=>saveProject(false);
W('v12Snapshot').onclick=()=>saveProject(true);
W('v12CloneProject').onclick=()=>{saveProject(false);cloneStored(state.metadata.projectId)};
W('v12NewProject').onclick=()=>{if(!confirm('Start a new structural project? Save the current project first if needed.'))return;const keepMedia=state.media||[];const base={title:'New Immersive Learning Experience',environment:'Immersive Academic Hub',objectives:['Define the learning objective.'],instructions:'Complete the immersive learning experience.',passing:70,completion:'required',stations:[],questions:[],objects:[],scenes:[{id:'scene-'+Date.now(),name:'Immersive Academic Hub',environment:'Immersive Academic Hub'}],variables:{},rules:[],npcs:[],media:keepMedia,mediaMeta:{},inventoryCatalog:[],objectStates:{},groups:[],animations:[],xr:{deliveryMode:'hybrid',locomotion:'both',theme:'academic',spatialAudio:'on'},accessibility:{reducedMotion:'off',highContrast:'off',captions:'required',desktopFallback:'required'},metadata:{institution:state.metadata?.institution||'',department:state.metadata?.department||'',courseCode:'',term:'',author:state.metadata?.author||'',projectId:'project-'+Date.now(),projectName:'New XR Project'}};base.activeSceneId=base.scenes[0].id;Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,base);ensureV12();metadataToForm();if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render();saveProject(true)};
W('v12ClearVersions').onclick=()=>{const arr=projects(),p=arr.find(x=>x.id===state.metadata?.projectId);if(!p)return;if(!confirm('Clear local version history for this project?'))return;p.versions=[];writeStore(STORE,arr);renderVersions()};
W('v12Role').onchange=()=>{localStorage.setItem(ROLE,W('v12Role').value);applyRole()};
function applyRole(){const role=localStorage.getItem(ROLE)||'instructor';const reviewOnly=role==='reviewer';document.querySelectorAll('#institutionalWorkspaceCard input,#institutionalWorkspaceCard select').forEach(el=>{if(el.id!=='v12Role')el.disabled=reviewOnly});W('v12SaveProject').disabled=reviewOnly;W('v12Snapshot').disabled=reviewOnly}
['v12ProjectName','v12Institution','v12Department','v12CourseCode','v12Term','v12Author'].forEach(id=>W(id).addEventListener('change',()=>{formToMetadata();scheduleAutosave()}));

function structuralTemplate(){const s=stripTransient();delete s.metadata;delete s.media;delete s.mediaMeta;return s}
function renderTemplates(){const arr=templatesData(),box=W('v12Templates');if(!box)return;box.innerHTML=arr.length?arr.map(t=>`<div class="v12-template"><b>${esc12(t.name)}</b><div class="muted">${esc12(t.description||'Reusable immersive structure')}</div><div class="toolbar"><button class="btn" data-applytpl="${esc12(t.id)}">Apply</button><button class="btn danger" data-deltpl="${esc12(t.id)}">Delete</button></div></div>`).join(''):'<div class="muted">No institutional templates saved in this browser.</div>';box.querySelectorAll('[data-applytpl]').forEach(b=>b.onclick=()=>{const t=arr.find(x=>x.id===b.dataset.applytpl);if(!t||!confirm('Apply this template to the current project? Existing packaged media and institutional metadata will be preserved.'))return;const media=state.media||[],meta=state.mediaMeta||{},institutional=clonePlain(state.metadata||{});Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,clonePlain(t.structure));state.media=media;state.mediaMeta=meta;state.metadata=institutional;ensureV12();if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render();scheduleAutosave()});box.querySelectorAll('[data-deltpl]').forEach(b=>b.onclick=()=>{writeStore(TEMPLATES,arr.filter(t=>t.id!==b.dataset.deltpl));renderTemplates()})}
W('v12SaveTemplate').onclick=()=>{const name=prompt('Template name',state.metadata?.projectName||state.title||'Immersive Template');if(!name)return;const desc=prompt('Template description','Reusable immersive instructional structure')||'';const arr=templatesData();arr.push({id:'tpl-'+Date.now(),name,description:desc,createdAt:new Date().toISOString(),structure:structuralTemplate()});writeStore(TEMPLATES,arr.slice(-20));renderTemplates()};

let autoTimer=null,lastAuto=0;
function scheduleAutosave(){clearTimeout(autoTimer);autoTimer=setTimeout(()=>{const now=Date.now();if(now-lastAuto<4000)return;lastAuto=now;saveProject(false)},1200)}
const prevRender=render;
render=function(){prevRender();ensureV12();scheduleAutosave();setTimeout(()=>{renderProjects();renderVersions();renderTemplates();storageInfo()},0)};

const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v12Checks(){
 const out=[],m=state.metadata||{},ps=projects();
 out.push({level:String(m.projectName||'').trim()?'pass':'fail',name:'Project identity metadata',detail:m.projectName?'Project name is defined.':'Project name is required.'});
 out.push({level:String(m.courseCode||'').trim()?'pass':'warn',name:'Course metadata',detail:m.courseCode?'Course code is defined: '+m.courseCode+'.':'Course code is blank; consider defining it for institutional traceability.'});
 out.push({level:String(m.author||'').trim()?'pass':'warn',name:'Author metadata',detail:m.author?'Author/owner metadata is defined.':'Author/owner metadata is blank.'});
 const ids=ps.map(p=>p.id),dups=ids.length-new Set(ids).size;out.push({level:dups?'fail':'pass',name:'Local project identifiers',detail:dups?dups+' duplicate project identifier(s) detected.':'Locally saved project IDs are unique.'});
 const media=(state.media||[]).length;out.push({level:media?'warn':'pass',name:'Autosave media persistence',detail:media?'Autosave preserves media references but not file bytes; export a Project Bundle for durable media recovery.':'No local media bytes require Project Bundle recovery.'});
 const role=localStorage.getItem(ROLE)||'instructor';out.push({level:role==='admin'?'warn':'pass',name:'Workspace role security',detail:'Current role "'+role+'" is a local workflow setting, not authenticated server-side RBAC.'});
 const structural=JSON.stringify(stripTransient()).length;out.push({level:structural>3500000?'warn':'pass',name:'Local autosave size',detail:Math.round(structural/1024)+' KB structural project size.'});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v12Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v12Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(W('auditPass'))W('auditPass').textContent=p;if(W('auditWarn'))W('auditWarn').textContent=w;if(W('auditFail'))W('auditFail').textContent=f;if(W('auditResults'))W('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station" style="'+(x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc12(x.name)+'</b><div class="muted">'+esc12(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

metadataToForm();applyRole();renderProjects();renderVersions();renderTemplates();storageInfo();
const active=localStorage.getItem(ACTIVE);if(active&&!projects().some(p=>p.id===state.metadata.projectId)){const p=projects().find(x=>x.id===active);if(p?.current)loadProject(active)}
scheduleAutosave();
})();