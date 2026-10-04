(()=>{
const G=id=>document.getElementById(id);
const esc14=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const LOCKKEY='vr-classroom-v14-locks';
function ensureV14(){
 state.version=14;
 state.reviewComments=state.reviewComments||[];
 state.reviewTasks=state.reviewTasks||[];
 state.reviewApprovals=state.reviewApprovals||{
   instructional:{approved:false,by:'',at:''},
   accessibility:{approved:false,by:'',at:''},
   technical:{approved:false,by:'',at:''},
   final:{approved:false,by:'',at:''}
 };
 state.mediaIntegrity=state.mediaIntegrity||{};
 state.governance=state.governance||{requireApprovals:false};
}
ensureV14();
const main=document.querySelector('main.workspace');if(!main)return;

/* Review center */
const review=document.createElement('section');review.className='card';review.id='reviewGovernanceCard';
review.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Collaborative Review & Governance <span class="v6-badge">V14</span></h3><div class="muted">Anchor review comments and publication blockers to the project, scenes, objects or stations.</div></div>
 <div class="toolbar"><button class="btn" id="v14ResolveAllNotes">Resolve non-blocking notes</button></div>
</div>
<div class="v14-grid" style="margin-top:12px">
 <div class="v14-card"><h4 style="margin-top:0">New review item</h4>
  <div class="field"><label>Type</label><select id="v14Severity"><option value="note">Note</option><option value="warning">Warning</option><option value="blocker">Publication blocker</option></select></div>
  <div class="field"><label>Anchor</label><select id="v14AnchorType"><option value="project">Whole project</option><option value="scene">Scene</option><option value="object">3D object</option><option value="station">Learning station</option></select></div>
  <div class="field"><label>Target</label><select id="v14AnchorId"></select></div>
  <div class="field"><label>Reviewer / author</label><input id="v14Reviewer"></div>
  <div class="field"><label>Comment</label><textarea id="v14Comment" rows="4" placeholder="Describe the issue, recommendation or required change."></textarea></div>
  <button class="btn primary" id="v14AddComment">Add review item</button>
 </div>
 <div class="v14-card"><h4 style="margin-top:0">Open review items</h4><div id="v14Comments"></div></div>
</div>`;
main.appendChild(review);

/* Tasks */
const tasks=document.createElement('section');tasks.className='card';tasks.id='reviewTasksCard';
tasks.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Review Tasks <span class="v6-badge">V14</span></h3><div class="muted">Track remediation work before Blackboard publication.</div></div></div>
<div class="v14-grid" style="margin-top:12px"><div class="v14-card">
 <div class="field"><label>Task</label><input id="v14TaskTitle" placeholder="e.g. Add captions to orientation video"></div>
 <div class="field"><label>Assignee</label><input id="v14TaskAssignee" placeholder="Name or role"></div>
 <div class="field"><label>Priority</label><select id="v14TaskPriority"><option value="normal">Normal</option><option value="high">High</option><option value="blocker">Blocker</option></select></div>
 <div class="field"><label>Due date</label><input id="v14TaskDue" type="date"></div>
 <button class="btn primary" id="v14AddTask">Add task</button>
</div><div class="v14-card"><h4 style="margin-top:0">Task board</h4><div id="v14Tasks"></div></div></div>`;
main.appendChild(tasks);

/* Approvals */
const approvals=document.createElement('section');approvals.className='card';approvals.id='approvalGateCard';
approvals.innerHTML=`
<div><h3 style="margin:0">Publish Governance Gate <span class="v6-badge">V14</span></h3><div class="muted">Require institutional sign-off before an audited publication.</div></div>
<div class="field" style="margin-top:12px"><label>Approval enforcement</label><select id="v14Enforce"><option value="advisory">Advisory — warn only</option><option value="required">Required — pending approvals block audited export</option></select></div>
<div id="v14Approvals" class="v14-approvals" style="margin-top:12px"></div>
<div class="notice" style="margin-top:10px">Approval records are project metadata. They are not cryptographic signatures. In cloud mode, server-side approval identity can be added after the dedicated backend is provisioned.</div>`;
main.appendChild(approvals);

/* Presence + locks */
const collab=document.createElement('section');collab.className='card';collab.id='presenceLockCard';
collab.innerHTML=`
<div><h3 style="margin:0">Local Collaboration Presence & Locking <span class="v6-badge">V14</span></h3><div class="muted">Coordinates multiple tabs/windows now and provides the UI pattern for future realtime cloud presence.</div></div>
<div class="v14-grid" style="margin-top:12px"><div class="v14-card"><h4 style="margin-top:0">Presence</h4><div id="v14Presence" class="v14-presence"></div></div><div class="v14-card"><h4 style="margin-top:0">Project Lock</h4><div id="v14LockInfo" class="muted"></div><div class="toolbar" style="margin-top:8px"><button class="btn primary" id="v14AcquireLock">Acquire edit lock</button><button class="btn" id="v14ReleaseLock">Release lock</button></div></div></div>`;
main.appendChild(collab);

/* media integrity */
const integrity=document.createElement('section');integrity.className='card';integrity.id='mediaIntegrityCard';
integrity.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Media Integrity Manifest <span class="v6-badge">V14</span></h3><div class="muted">Compute SHA-256 fingerprints for local media loaded in this browser session.</div></div><button class="btn primary" id="v14HashMedia">Verify media integrity</button></div>
<div id="v14MediaIntegrity" style="margin-top:12px"></div>`;
main.appendChild(integrity);

const nav=document.querySelector('aside .nav');if(nav){[['📝 Review Governance',review],['✅ Review Tasks',tasks],['🚦 Approval Gate',approvals],['👥 Presence & Lock',collab],['🔐 Media Integrity',integrity]].forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)})}

function anchorOptions(){
 const type=G('v14AnchorType').value,s=G('v14AnchorId');if(!s)return;
 if(type==='project'){s.innerHTML='<option value="project">Current project</option>';return}
 const arr=type==='scene'?(state.scenes||[]):type==='object'?(state.objects||[]):(state.stations||[]);
 s.innerHTML=arr.map(x=>'<option value="'+esc14(x.id)+'">'+esc14(x.name||x.label||x.type||x.id)+'</option>').join('')
}
G('v14AnchorType').onchange=anchorOptions;
function reviewerName(){return state.metadata?.author||'Reviewer'}
G('v14Reviewer').value=reviewerName();

function renderComments(){
 const box=G('v14Comments');if(!box)return;const items=(state.reviewComments||[]).filter(x=>x.status!=='resolved');
 box.innerHTML=items.length?items.map(x=>'<div class="v14-review '+esc14(x.severity)+'"><span class="v14-pill '+esc14(x.severity)+'">'+esc14(x.severity.toUpperCase())+'</span><span class="v14-pill">'+esc14(x.anchorType)+' · '+esc14(x.anchorLabel||x.anchorId)+'</span><b style="display:block;margin-top:6px">'+esc14(x.text)+'</b><small>'+esc14(x.author||'Reviewer')+' · '+esc14(new Date(x.createdAt).toLocaleString())+'</small><div class="toolbar" style="margin-top:7px"><button class="btn" data-resolve="'+esc14(x.id)+'">Resolve</button><button class="btn danger" data-delreview="'+esc14(x.id)+'">Delete</button></div></div>').join(''):'<div class="muted">No open review items.</div>';
 box.querySelectorAll('[data-resolve]').forEach(b=>b.onclick=()=>{const x=state.reviewComments.find(i=>String(i.id)===String(b.dataset.resolve));if(x){x.status='resolved';x.resolvedAt=new Date().toISOString();renderComments()}});
 box.querySelectorAll('[data-delreview]').forEach(b=>b.onclick=()=>{state.reviewComments=state.reviewComments.filter(i=>String(i.id)!==String(b.dataset.delreview));renderComments()})
}
G('v14AddComment').onclick=()=>{const text=G('v14Comment').value.trim();if(!text)return alert('Enter a review comment.');const type=G('v14AnchorType').value,id=G('v14AnchorId').value;let label='Current project';if(type==='scene')label=(state.scenes||[]).find(x=>String(x.id)===String(id))?.name||id;if(type==='object')label=(state.objects||[]).find(x=>String(x.id)===String(id))?.label||id;if(type==='station')label=(state.stations||[]).find(x=>String(x.id)===String(id))?.name||id;state.reviewComments.push({id:'review-'+Date.now(),severity:G('v14Severity').value,anchorType:type,anchorId:id,anchorLabel:label,author:G('v14Reviewer').value.trim()||reviewerName(),text,status:'open',createdAt:new Date().toISOString()});G('v14Comment').value='';renderComments()};
G('v14ResolveAllNotes').onclick=()=>{(state.reviewComments||[]).filter(x=>x.severity==='note'&&x.status!=='resolved').forEach(x=>{x.status='resolved';x.resolvedAt=new Date().toISOString()});renderComments()};

function renderTasks(){const box=G('v14Tasks');if(!box)return;const items=state.reviewTasks||[];box.innerHTML=items.length?items.map(t=>'<div class="v14-task"><div><b>'+esc14(t.title)+'</b><small>'+esc14(t.assignee||'Unassigned')+' · '+esc14(t.priority)+' · '+esc14(t.due||'No due date')+'</small><small>Status: '+esc14(t.status)+'</small></div><div class="toolbar"><button class="btn" data-toggletask="'+esc14(t.id)+'">'+(t.status==='done'?'Reopen':'Done')+'</button><button class="btn danger" data-deltask="'+esc14(t.id)+'">×</button></div></div>').join(''):'<div class="muted">No review tasks.</div>';box.querySelectorAll('[data-toggletask]').forEach(b=>b.onclick=()=>{const t=state.reviewTasks.find(x=>String(x.id)===String(b.dataset.toggletask));if(t){t.status=t.status==='done'?'open':'done';renderTasks()}});box.querySelectorAll('[data-deltask]').forEach(b=>b.onclick=()=>{state.reviewTasks=state.reviewTasks.filter(x=>String(x.id)!==String(b.dataset.deltask));renderTasks()})}
G('v14AddTask').onclick=()=>{const title=G('v14TaskTitle').value.trim();if(!title)return alert('Enter a task.');state.reviewTasks.push({id:'task-'+Date.now(),title,assignee:G('v14TaskAssignee').value.trim(),priority:G('v14TaskPriority').value,due:G('v14TaskDue').value,status:'open',createdAt:new Date().toISOString()});G('v14TaskTitle').value='';renderTasks()};

function renderApprovals(){const box=G('v14Approvals');if(!box)return;G('v14Enforce').value=state.governance?.requireApprovals?'required':'advisory';const labels={instructional:'Instructional Design',accessibility:'Accessibility',technical:'Technical / XR',final:'Final Publication'};box.innerHTML=Object.entries(labels).map(([k,label])=>{const a=state.reviewApprovals[k]||{};return '<div class="v14-approval '+(a.approved?'approved':'')+'"><b>'+label+'</b><small style="display:block;color:var(--muted);margin:5px 0">'+(a.approved?'Approved by '+esc14(a.by||'Reviewer'):'Pending approval')+'</small><button class="btn" data-approval="'+k+'">'+(a.approved?'Revoke':'Approve')+'</button></div>'}).join('');box.querySelectorAll('[data-approval]').forEach(b=>b.onclick=()=>{const k=b.dataset.approval,a=state.reviewApprovals[k]||{};if(a.approved)state.reviewApprovals[k]={approved:false,by:'',at:''};else state.reviewApprovals[k]={approved:true,by:state.metadata?.author||G('v14Reviewer').value||'Reviewer',at:new Date().toISOString()};renderApprovals()})}

/* local presence and lock */
const tabId='tab-'+Math.random().toString(36).slice(2),channel=('BroadcastChannel'in window)?new BroadcastChannel('vr-classroom-v14'):null,peers=new Map();
function projectKey(){return state.metadata?.projectId||state.metadata?.cloudProjectId||'default'}
function announce(){channel?.postMessage({type:'presence',tabId,project:projectKey(),name:state.metadata?.author||'Author',at:Date.now()})}
function renderPresence(){const now=Date.now();for(const [id,p] of peers)if(now-p.at>12000)peers.delete(id);const list=[{tabId,name:(state.metadata?.author||'This tab')+' (this tab)',at:now},...peers.values()].filter(p=>!p.project||p.project===projectKey());G('v14Presence').innerHTML=list.map(p=>'<span>'+esc14(p.name||p.tabId)+'</span>').join('')}
if(channel){channel.onmessage=e=>{const m=e.data||{};if(m.type==='presence'&&m.tabId!==tabId){peers.set(m.tabId,m);renderPresence()}if(m.type==='lock')renderLock()};setInterval(()=>{announce();renderPresence()},5000);announce()}
function locks(){try{return JSON.parse(localStorage.getItem(LOCKKEY)||'{}')}catch{return {}}}
function writeLocks(v){localStorage.setItem(LOCKKEY,JSON.stringify(v));channel?.postMessage({type:'lock'})}
function renderLock(){const l=locks()[projectKey()],expired=l&&Number(l.expiresAt)<Date.now();if(expired){const x=locks();delete x[projectKey()];writeLocks(x);return}G('v14LockInfo').innerHTML=l?'<b>Locked by '+esc14(l.owner)+'</b><br>Expires '+esc14(new Date(l.expiresAt).toLocaleTimeString()):'No active local edit lock.'}
G('v14AcquireLock').onclick=()=>{const x=locks(),k=projectKey(),l=x[k];if(l&&Number(l.expiresAt)>Date.now()&&l.tabId!==tabId)return alert('This project is already locked in another local tab.');x[k]={tabId,owner:state.metadata?.author||'Author',expiresAt:Date.now()+15*60*1000};writeLocks(x);renderLock()};
G('v14ReleaseLock').onclick=()=>{const x=locks(),l=x[projectKey()];if(l&&l.tabId!==tabId)return alert('Only the local lock owner can release this lock.');delete x[projectKey()];writeLocks(x);renderLock()};
window.addEventListener('beforeunload',()=>{const x=locks(),l=x[projectKey()];if(l?.tabId===tabId){delete x[projectKey()];writeLocks(x)}});

/* integrity */
async function sha256(buffer){const hash=await crypto.subtle.digest('SHA-256',buffer);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function verifyMedia(){const map=window.VRClassroomMediaFiles;if(!map)return alert('Media registry is unavailable.');let count=0,mismatch=0;for(const m of state.media||[]){if(map.has(m.id)){const next=await sha256(map.get(m.id)),prev=state.mediaIntegrity[m.id]?.sha256||'';state.mediaIntegrity[m.id]={sha256:next,size:m.size||map.get(m.id).byteLength,verifiedAt:new Date().toISOString(),name:m.name,mismatch:!!prev&&prev!==next,previousSha256:prev&&prev!==next?prev:''};if(prev&&prev!==next)mismatch++;count++}}renderIntegrity();alert(count+' media asset(s) fingerprinted.'+(mismatch?' '+mismatch+' integrity mismatch(es) detected.':''))}
G('v14Enforce').onchange=()=>{state.governance.requireApprovals=G('v14Enforce').value==='required';renderApprovals()};
G('v14HashMedia').onclick=verifyMedia;
function renderIntegrity(){const box=G('v14MediaIntegrity');if(!box)return;const media=state.media||[];box.innerHTML=media.length?media.map(m=>{const h=state.mediaIntegrity[m.id];return '<div class="v14-review '+(h?.mismatch?'blocker':'')+'"><b>'+esc14(m.name)+'</b><small>'+Math.round(Number(m.size||0)/1024)+' KB · '+(h?(h.mismatch?'Integrity mismatch':'Verified'):'Not fingerprinted')+'</small>'+(h?'<div class="v14-hash">SHA-256 '+esc14(h.sha256)+'</div>':'')+'</div>'}).join(''):'<div class="muted">No packaged media assets.</div>'}

/* audit */
const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v14Checks(){
 const out=[],open=(state.reviewComments||[]).filter(x=>x.status!=='resolved'),blockers=open.filter(x=>x.severity==='blocker'),warning=open.filter(x=>x.severity==='warning'),tasks=(state.reviewTasks||[]).filter(x=>x.status!=='done'),blockingTasks=tasks.filter(x=>x.priority==='blocker'),approvals=state.reviewApprovals||{};
 out.push({level:blockers.length?'fail':'pass',name:'Publication review blockers',detail:blockers.length?blockers.length+' unresolved blocker review item(s) must be resolved.':'No unresolved publication blockers.'});
 out.push({level:blockingTasks.length?'fail':tasks.length?'warn':'pass',name:'Review task completion',detail:blockingTasks.length?blockingTasks.length+' blocker task(s) remain open.':tasks.length?tasks.length+' non-blocking review task(s) remain open.':'Review tasks are complete.'});
 out.push({level:warning.length?'warn':'pass',name:'Review warnings',detail:warning.length?warning.length+' unresolved warning(s) remain.':'No unresolved review warnings.'});
 const required=['instructional','accessibility','technical','final'],pending=required.filter(k=>!approvals[k]?.approved),enforced=!!state.governance?.requireApprovals;out.push({level:pending.length?(enforced?'fail':'warn'):'pass',name:'Publish approvals',detail:pending.length?(enforced?'Required approvals pending: ':'Pending approvals (advisory mode): ')+pending.join(', ')+'.':'All governance approvals are recorded.'});
 const media=state.media||[],unverified=media.filter(m=>!state.mediaIntegrity?.[m.id]),mismatched=media.filter(m=>state.mediaIntegrity?.[m.id]?.mismatch);out.push({level:mismatched.length?'fail':unverified.length?'warn':'pass',name:'Media integrity manifest',detail:mismatched.length?mismatched.length+' media asset(s) changed since the previous SHA-256 verification.':unverified.length?unverified.length+' media asset(s) have no SHA-256 fingerprint in this project.':'All current media assets have matching integrity fingerprints.'});
 const l=locks()[projectKey()];out.push({level:l&&l.tabId!==tabId&&Number(l.expiresAt)>Date.now()?'warn':'pass',name:'Local edit lock',detail:l&&l.tabId!==tabId?'Another local tab holds the edit lock.':'No conflicting local edit lock detected.'});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v14Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v14Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(G('auditPass'))G('auditPass').textContent=p;if(G('auditWarn'))G('auditWarn').textContent=w;if(G('auditFail'))G('auditFail').textContent=f;if(G('auditResults'))G('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station" style="'+(x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc14(x.name)+'</b><div class="muted">'+esc14(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

const oldRender=render;
render=function(){oldRender();ensureV14();anchorOptions();renderComments();renderTasks();renderApprovals();renderPresence();renderLock();renderIntegrity()};
anchorOptions();renderComments();renderTasks();renderApprovals();renderPresence();renderLock();renderIntegrity();
})();