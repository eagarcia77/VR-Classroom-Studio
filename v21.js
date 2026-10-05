(()=>{
const R=id=>document.getElementById(id);
const esc21=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const STORE='vr-classroom-v21-releases';
function ensureV21(){
 state.version=21;
 state.v21=state.v21||{releases:[],events:[],policy:{requirePublishedFingerprint:true,semverMode:'institutional'},rollbackTarget:null};
}
ensureV21();
const main=document.querySelector('main.workspace');if(!main)return;

/* dashboard */
const dash=document.createElement('section');dash.className='card';dash.id='releaseManagementCard';
dash.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Release Management & Institutional QA <span class="v6-badge">V21</span></h3><div class="muted">Control Draft → QA → Approved → Published → Retired releases with traceable fingerprints and Blackboard evidence.</div></div><div class="toolbar"><button class="btn primary" id="v21CreateRelease">Create release from current RC</button><button class="btn" id="v21Refresh">Refresh dashboard</button></div></div>
<div id="v21Metrics" class="v21-metrics" style="margin-top:12px"></div>
<div class="v21-grid" style="margin-top:12px"><div class="v21-card"><h4 style="margin-top:0">Authorized Blackboard Production</h4><div id="v21Production"></div></div><div class="v21-card"><h4 style="margin-top:0">Release policy</h4><div class="field"><label>Semantic version for next release</label><input id="v21Version" placeholder="1.0.0"></div><div class="field"><label>Release name</label><input id="v21ReleaseName" placeholder="Fall 2026 Production"></div><div class="field"><label>Release notes</label><textarea id="v21Notes" rows="4" placeholder="Purpose, changes, known limitations"></textarea></div></div></div>`;
main.appendChild(dash);

/* release history */
const history=document.createElement('section');history.className='card';history.id='releaseHistoryCard';
history.innerHTML=`
<div><h3 style="margin:0">Release History <span class="v6-badge">V21</span></h3><div class="muted">Only one release can be Published for a project at a time. Publishing a newer release retires the previous production release.</div></div><div id="v21Releases" style="margin-top:12px"></div>`;
main.appendChild(history);

/* changelog */
const changes=document.createElement('section');changes.className='card';changes.id='releaseChangelogCard';
changes.innerHTML=`
<div><h3 style="margin:0">Automatic Changelog & Regression Delta <span class="v6-badge">V21</span></h3><div class="muted">Compare a release baseline against the current project or another release.</div></div><div class="v21-grid" style="margin-top:12px"><div class="v21-card"><div class="field"><label>Baseline release</label><select id="v21Baseline"></select></div><div class="toolbar"><button class="btn primary" id="v21CompareCurrent">Compare with current project</button><button class="btn" id="v21GenerateChangelog">Generate changelog</button></div></div><div class="v21-card"><div id="v21ChangeSummary" class="muted">Select a baseline.</div></div></div><div id="v21Changes" style="margin-top:12px"></div>`;
main.appendChild(changes);

/* rollback */
const rollback=document.createElement('section');rollback.className='card';rollback.id='rollbackPlanningCard';
rollback.innerHTML=`
<div><h3 style="margin:0">Rollback Planning <span class="v6-badge">V21</span></h3><div class="muted">Record a rollback target and rationale without silently replacing project content.</div></div><div class="v21-grid" style="margin-top:12px"><div class="v21-card"><div class="field"><label>Rollback target</label><select id="v21RollbackTarget"></select></div><div class="field"><label>Reason</label><textarea id="v21RollbackReason" rows="4"></textarea></div><button class="btn primary" id="v21PlanRollback">Create rollback plan</button></div><div class="v21-card"><div id="v21RollbackInfo"></div></div></div>`;
main.appendChild(rollback);

/* timeline */
const timeline=document.createElement('section');timeline.className='card';timeline.id='releaseTimelineCard';
timeline.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Release Governance Timeline <span class="v6-badge">V21</span></h3><div class="muted">Local immutable-style event trail for status transitions, publishing and rollback planning.</div></div><button class="btn" id="v21Download">Download release ledger</button></div><div id="v21Timeline" class="v21-timeline" style="margin-top:12px"></div>`;
main.appendChild(timeline);

const nav=document.querySelector('aside .nav');if(nav){[['🚀 Release Management',dash],['🗂 Release History',history],['📝 Changelog',changes],['↩ Rollback Planning',rollback],['🕘 Release Timeline',timeline]].forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)})}

function v20(){return window.VRReleaseV20}
function now(){return new Date().toISOString()}
function releases(){return state.v21.releases||[]}
function semverValid(v){return /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(String(v||''))}
function semverTuple(v){return String(v).split(/[+-]/)[0].split('.').map(Number)}
function semverCompare(a,b){const A=semverTuple(a),B=semverTuple(b);for(let i=0;i<3;i++){if(A[i]!==B[i])return A[i]-B[i]}return 0}
function logEvent(type,data={}){state.v21.events.unshift({id:'rel-event-'+Date.now()+'-'+Math.random().toString(36).slice(2),type,data,at:now(),actor:state.metadata?.author||'Author'});state.v21.events=state.v21.events.slice(0,200);renderTimeline()}
function persistLocal(){try{localStorage.setItem(STORE,JSON.stringify({releases:state.v21.releases,events:state.v21.events,rollbackTarget:state.v21.rollbackTarget}))}catch(e){}}
function hydrateLocal(){try{const x=JSON.parse(localStorage.getItem(STORE)||'null');if(x&&!(state.v21.releases||[]).length){state.v21.releases=x.releases||[];state.v21.events=x.events||[];state.v21.rollbackTarget=x.rollbackTarget||null}}catch(e){}}
hydrateLocal();

function currentProduction(){return releases().find(r=>r.status==='published')||null}
function currentSummary(){return v20()?.getSummary?.()||{scenes:(state.scenes||[]).length,stations:(state.stations||[]).length,questions:(state.questions||[]).length,objects:(state.objects||[]).length,rules:(state.rules||[]).length,npcs:(state.npcs||[]).length,media:(state.media||[]).length,competencies:(state.competencies||[]).length,reviewBlockers:(state.reviewComments||[]).filter(x=>x.status!=='resolved'&&x.severity==='blocker').length,score:0}}
async function releasePrereqs(){
 const rc=v20()?.getReleaseCandidate?.(),run=v20()?.getLatestTestRun?.(),bb=v20()?.getBlackboardValidation?.(),fp=await v20()?.getFingerprint?.(),v19=window.VRDeliveryV19?.getLastTest?.();
 const approvals=state.reviewApprovals||{},approvalKeys=['instructional','accessibility','technical','final'],allApprovals=approvalKeys.every(k=>approvals[k]?.approved);
 return {rc,run,bb,fp,v19,allApprovals,rcCurrent:!!rc&&rc.fingerprint===fp,v20Pass:!!run&&!run.tests.some(t=>t.level==='fail'),v19Pass:!!v19&&!v19.tests.some(t=>t.level==='fail'),bbPass:!!bb?.passed}
}
function statusRank(s){return {draft:0,qa:1,approved:2,published:3,retired:4}[s]??-1}
function nextStatus(s){return {draft:'qa',qa:'approved',approved:'published',published:'retired'}[s]||null}

async function createRelease(){
 const version=R('v21Version').value.trim(),name=R('v21ReleaseName').value.trim()||('Release '+version),notes=R('v21Notes').value.trim();
 if(!semverValid(version))return alert('Use semantic version format, e.g. 1.0.0 or 1.1.0-beta.1.');
 if(releases().some(r=>r.version===version))return alert('That release version already exists.');
 const latest=[...releases()].sort((a,b)=>semverCompare(b.version,a.version))[0];if(latest&&semverCompare(version,latest.version)<=0&&!confirm('This version is not greater than the latest recorded release. Create it anyway?'))return;
 const p=await releasePrereqs();if(!p.rc)return alert('Freeze a V20 Release Candidate first.');
 if(!p.rcCurrent)return alert('The current project no longer matches the frozen V20 Release Candidate.');
 const rel={id:'release-'+Date.now(),version,name,notes,status:'draft',createdAt:now(),updatedAt:now(),fingerprint:p.fp,releaseCandidateId:p.rc.id,summary:currentSummary(),deliveryProfile:p.rc.deliveryProfile||'',changelog:[],transitions:[{from:null,to:'draft',at:now(),by:state.metadata?.author||'Author'}]};
 state.v21.releases.unshift(rel);logEvent('release_created',{releaseId:rel.id,version,name});persistLocal();renderAll();R('v21Version').value='';R('v21ReleaseName').value='';R('v21Notes').value=''
}
R('v21CreateRelease').onclick=createRelease;R('v21Refresh').onclick=renderAll;

async function transition(rel){
 const to=nextStatus(rel.status);if(!to)return;
 const p=await releasePrereqs();
 if(to==='qa'&&(!p.rcCurrent||!p.v20Pass||!p.v19Pass))return alert('QA requires a current Release Candidate plus passing V19 and V20 tests.');
 if(to==='approved'&&(!p.allApprovals||!p.rcCurrent||!p.v20Pass||!p.v19Pass))return alert('Approval requires all governance approvals, current RC, and passing V19/V20 QA.');
 if(to==='published'&&(!p.allApprovals||!p.rcCurrent||!p.v20Pass||!p.v19Pass||!p.bbPass))return alert('Publishing requires all approvals, current RC, passing V19/V20 QA, and complete real Blackboard post-upload validation.');
 if(to==='published'){
   releases().filter(x=>x.status==='published'&&x.id!==rel.id).forEach(x=>{x.status='retired';x.updatedAt=now();x.transitions.push({from:'published',to:'retired',at:now(),by:state.metadata?.author||'Author',reason:'Superseded by '+rel.version});logEvent('release_retired',{releaseId:x.id,version:x.version,reason:'superseded'})});
 }
 const from=rel.status;
 if(rel.cloudId){
   const cloud=window.VRCloudV13,c=cloud?.getClient?.(),u=cloud?.getUser?.();
   if(!c||!u)return alert('This release is cloud-linked. Connect and authenticate the V13 Cloud Workspace before changing its status.');
   const {data,error}=await c.rpc('xr_transition_release',{target_release:rel.cloudId,target_status:to});
   if(error)return alert('Cloud release transition blocked: '+error.message);
 }
 rel.status=to;rel.updatedAt=now();rel.transitions.push({from,to,at:now(),by:state.metadata?.author||'Author'});logEvent('release_transition',{releaseId:rel.id,version:rel.version,from,to});persistLocal();renderAll()
}
function renderReleases(){
 const box=R('v21Releases'),items=[...releases()].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
 box.innerHTML=items.length?items.map(r=>{const next=nextStatus(r.status);return '<div class="v21-release '+(r.status==='published'?'production':'')+'"><span class="v21-pill '+r.status+'">'+r.status.toUpperCase()+'</span><span class="v21-pill">v'+esc21(r.version)+'</span><b style="display:block;margin-top:7px">'+esc21(r.name)+'</b><small class="muted">'+esc21(new Date(r.createdAt).toLocaleString())+' · '+esc21(r.deliveryProfile||'')+'</small><div style="margin-top:7px">'+esc21(r.notes||'No release notes.')+'</div><div class="v20-hash" style="margin-top:7px">'+esc21(r.fingerprint)+'</div><div class="toolbar" style="margin-top:8px">'+(next?'<button class="btn '+(next==='published'?'primary':'')+'" data-transition="'+esc21(r.id)+'">Move to '+next.toUpperCase()+'</button>':'')+'<button class="btn" data-baseline="'+esc21(r.id)+'">Compare</button><button class="btn" data-cloudrelease="'+esc21(r.id)+'">'+(r.cloudId?'Cloud linked':'Save to cloud')+'</button></div></div>'}).join(''):'<div class="muted">No releases recorded.</div>';
 box.querySelectorAll('[data-transition]').forEach(b=>b.onclick=()=>{const r=releases().find(x=>x.id===b.dataset.transition);if(r)transition(r)});
 box.querySelectorAll('[data-baseline]').forEach(b=>b.onclick=()=>{R('v21Baseline').value=b.dataset.baseline;compareCurrent()});
 box.querySelectorAll('[data-cloudrelease]').forEach(b=>b.onclick=async()=>{const r=releases().find(x=>x.id===b.dataset.cloudrelease);if(!r)return;const saved=await saveReleaseCloud(r);if(!saved.ok)return alert('Cloud release unavailable: '+saved.error);persistLocal();renderReleases();alert('Release linked to cloud.')})
}
async function renderProduction(){
 const p=currentProduction(),box=R('v21Production');if(!p){box.innerHTML='<div class="v21-none"><b>No version is currently authorized as Published.</b><div>Move an Approved release to Published after real Blackboard validation.</div></div>';return}
 const current=await v20()?.getFingerprint?.(),same=current===p.fingerprint;box.innerHTML='<div class="v21-prod"><span class="v21-pill published">PUBLISHED</span><b style="display:block;margin-top:7px">v'+esc21(p.version)+' · '+esc21(p.name)+'</b><div class="muted">Published '+esc21(new Date(p.updatedAt).toLocaleString())+'</div><div style="margin-top:8px">'+(same?'Current project still matches production fingerprint.':'Current authoring project differs from the published production fingerprint.')+'</div><div class="v20-hash" style="margin-top:7px">'+esc21(p.fingerprint)+'</div></div>'
}
function renderMetrics(){
 const rs=releases(),prod=rs.filter(r=>r.status==='published').length,approved=rs.filter(r=>r.status==='approved').length,qa=rs.filter(r=>r.status==='qa').length,retired=rs.filter(r=>r.status==='retired').length;
 R('v21Metrics').innerHTML='<div><b>'+rs.length+'</b><small>Total releases</small></div><div><b>'+qa+'</b><small>In QA</small></div><div><b>'+approved+'</b><small>Approved</small></div><div><b>'+prod+'</b><small>Published</small></div><div><b>'+retired+'</b><small>Retired</small></div>'
}
function fillSelectors(){
 const opts=releases().map(r=>'<option value="'+esc21(r.id)+'">v'+esc21(r.version)+' · '+esc21(r.status)+' · '+esc21(r.name)+'</option>').join('');
 R('v21Baseline').innerHTML='<option value="">Select release</option>'+opts;R('v21RollbackTarget').innerHTML='<option value="">Select release</option>'+opts
}
function diffSummary(base,current){const keys=['scenes','stations','questions','objects','rules','npcs','media','competencies','reviewBlockers','score'];return keys.map(k=>({domain:k,baseline:Number(base?.[k]||0),current:Number(current?.[k]||0),delta:Number(current?.[k]||0)-Number(base?.[k]||0)}))}
function renderDiff(diff){R('v21Changes').innerHTML=diff.length?'<div class="v21-change"><div><b>Domain</b></div><div><b>Baseline</b></div><div><b>Current</b></div><div><b>Δ</b></div>'+diff.map(d=>'<div>'+esc21(d.domain)+'</div><div>'+d.baseline+'</div><div>'+d.current+'</div><div class="'+(d.delta===0?'':d.delta>0?'v18-pass':'v18-warn')+'">'+(d.delta>0?'+':'')+d.delta+'</div>').join('')+'</div>':'<div class="muted">No comparison available.</div>'}
function compareCurrent(){
 const id=R('v21Baseline').value,base=releases().find(r=>r.id===id);if(!base)return;const diff=diffSummary(base.summary,currentSummary());renderDiff(diff);R('v21ChangeSummary').innerHTML='<b>v'+esc21(base.version)+' → current authoring project</b><div class="muted">'+diff.filter(d=>d.delta!==0).length+' structural domain(s) changed.</div>'
}
R('v21CompareCurrent').onclick=compareCurrent;
function generateChangelog(){
 const id=R('v21Baseline').value,base=releases().find(r=>r.id===id);if(!base)return alert('Select a baseline release.');const diff=diffSummary(base.summary,currentSummary()),lines=diff.filter(d=>d.delta!==0).map(d=>(d.delta>0?'Added/expanded ':'Reduced/changed ')+d.domain+' ('+(d.delta>0?'+':'')+d.delta+')');const text=lines.length?lines.join('\n'):'No structural count changes detected.';base.lastGeneratedChangelog={at:now(),against:'current',text};R('v21ChangeSummary').innerHTML='<b>Generated changelog</b><pre class="v20-log" style="margin-top:7px">'+esc21(text)+'</pre>';logEvent('changelog_generated',{releaseId:base.id,changes:lines.length});persistLocal()
}
R('v21GenerateChangelog').onclick=generateChangelog;

/* rollback planning */
R('v21PlanRollback').onclick=()=>{const id=R('v21RollbackTarget').value,target=releases().find(r=>r.id===id),reason=R('v21RollbackReason').value.trim();if(!target)return alert('Select a rollback target.');if(!['approved','published','retired'].includes(target.status))return alert('Rollback target should be an approved, published or retired release.');if(!reason)return alert('Enter a rollback rationale.');state.v21.rollbackTarget={releaseId:target.id,version:target.version,label:target.name,fingerprint:target.fingerprint,reason,plannedAt:now(),plannedBy:state.metadata?.author||'Author'};logEvent('rollback_planned',state.v21.rollbackTarget);persistLocal();renderRollback()};
function renderRollback(){const r=state.v21.rollbackTarget;R('v21RollbackInfo').innerHTML=r?'<div class="v21-release stale"><span class="v21-pill">ROLLBACK PLAN</span><b style="display:block;margin-top:7px">Target v'+esc21(r.version)+' · '+esc21(r.label)+'</b><div style="margin-top:6px">'+esc21(r.reason)+'</div><div class="v20-hash" style="margin-top:7px">'+esc21(r.fingerprint)+'</div><small class="muted">Planning metadata only — project content is not automatically replaced.</small></div>':'<div class="muted">No rollback plan recorded.</div>'}

/* timeline and ledger */
function renderTimeline(){const events=state.v21.events||[];R('v21Timeline').innerHTML=events.length?events.map(e=>'<div class="v21-event"><b>'+esc21(e.type)+'</b><small>'+esc21(e.actor)+' · '+esc21(new Date(e.at).toLocaleString())+'</small><small>'+esc21(JSON.stringify(e.data||{}))+'</small></div>').join(''):'<div class="muted">No release governance events.</div>'}
function downloadJSON(obj,name){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=String(name).replace(/[^a-z0-9_.-]+/gi,'_');a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)}
R('v21Download').onclick=()=>downloadJSON({generatedAt:now(),project:{title:state.title,courseCode:state.metadata?.courseCode||''},releases:releases(),events:state.v21.events,rollbackTarget:state.v21.rollbackTarget},(state.title||'VR-Classroom')+'_Release_Ledger.json');

/* cloud persistence */
async function saveReleaseCloud(rel){
 const cloud=window.VRCloudV13,c=cloud?.getClient?.(),u=cloud?.getUser?.(),p=state.metadata?.cloudProjectId||cloud?.getCloudProjectId?.();if(!c||!u||!p)return {ok:false,error:'Cloud workspace is not connected/authenticated.'};
 if(rel.cloudId)return {ok:true,id:rel.cloudId};
 let rcCloudId=null;
 const rc=v20()?.getReleaseCandidate?.();if(rc?.cloudId)rcCloudId=rc.cloudId;
 const {data,error}=await c.from('xr_releases').insert({project_id:p,created_by:u.id,version:rel.version,name:rel.name,status:'draft',project_fingerprint:rel.fingerprint,release_candidate_id:rcCloudId,summary:rel.summary||{},notes:rel.notes||null}).select('id').single();if(error)return {ok:false,error:error.message};rel.cloudId=data.id;return {ok:true,id:data.id}
}
async function recordTransitionCloud(rel,from,to){
 const cloud=window.VRCloudV13,c=cloud?.getClient?.(),u=cloud?.getUser?.();if(!c||!u||!rel.cloudId)return;const {error}=await c.from('xr_release_events').insert({release_id:rel.cloudId,actor_id:u.id,event_type:'status_transition',event_data:{from,to}});if(error)console.warn(error)
}

/* audit */
const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v21Checks(){
 const out=[],rs=releases(),versions=rs.map(r=>r.version),dups=versions.length-new Set(versions).size,published=rs.filter(r=>r.status==='published');
 out.push({level:dups?'fail':'pass',name:'Release version uniqueness',detail:dups?dups+' duplicate semantic version(s) detected.':'Release semantic versions are unique.'});
 out.push({level:rs.some(r=>!semverValid(r.version))?'fail':'pass',name:'Semantic version format',detail:rs.some(r=>!semverValid(r.version))?'One or more release versions are invalid.':'Recorded release versions use semantic version format.'});
 out.push({level:published.length>1?'fail':published.length===1?'pass':'warn',name:'Authorized production release',detail:published.length>1?'Multiple Published releases exist; only one is allowed.':published.length===1?'One Published release is authorized for Blackboard production.':'No Published production release is currently recorded.'});
 const invalidTransitions=rs.filter(r=>(r.transitions||[]).some(t=>t.from&&statusRank(t.to)!==statusRank(t.from)+1));out.push({level:invalidTransitions.length?'fail':'pass',name:'Release transition integrity',detail:invalidTransitions.length?invalidTransitions.length+' release(s) contain non-sequential status transitions.':'Release status transitions are sequential.'});
 const prod=published[0],bb=v20()?.getBlackboardValidation?.();out.push({level:prod&&!bb?.passed?'warn':'pass',name:'Published Blackboard validation evidence',detail:prod&&!bb?.passed?'A Published release exists but the current project context lacks a complete Blackboard validation record.':'No published-validation inconsistency detected.'});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v21Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v21Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(R('auditPass'))R('auditPass').textContent=p;if(R('auditWarn'))R('auditWarn').textContent=w;if(R('auditFail'))R('auditFail').textContent=f;if(R('auditResults'))R('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station" style="'+(x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc21(x.name)+'</b><div class="muted">'+esc21(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

async function renderAll(){renderMetrics();renderReleases();fillSelectors();renderRollback();renderTimeline();await renderProduction()}
const oldRender=render;
render=function(){oldRender();ensureV21();renderAll()};
renderAll();
})();