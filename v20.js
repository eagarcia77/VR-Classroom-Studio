(()=>{
const T=id=>document.getElementById(id);
const esc20=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const RCSTORE='vr-classroom-v20-release-candidates';
function ensureV20(){
 state.version=20;
 state.v20=state.v20||{testRuns:[],blackboardChecklist:{},releaseCandidate:null,requireReleaseCandidate:false};
}
ensureV20();
const main=document.querySelector('main.workspace');if(!main)return;

/* Test lab */
const lab=document.createElement('section');lab.className='card';lab.id='blackboardTestLabCard';
lab.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Blackboard Test Lab <span class="v6-badge">V20</span></h3><div class="muted">Run deterministic SCORM lifecycle, suspend/resume and edge-case tests before creating a Release Candidate.</div></div><div class="toolbar"><button class="btn primary" id="v20RunMatrix">Run full test matrix</button><button class="btn" id="v20ClearRuns">Clear local runs</button></div></div>
<div class="v20-grid" style="margin-top:12px"><div class="v20-card"><h4 style="margin-top:0">Test matrix</h4><div id="v20Cases"></div></div><div class="v20-card"><h4 style="margin-top:0">Latest run log</h4><div id="v20RunLog" class="v20-log">Not run.</div></div></div>`;
main.appendChild(lab);

/* RC */
const rc=document.createElement('section');rc.className='card';rc.id='releaseCandidateCard';
rc.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Release Candidate Workflow <span class="v6-badge">V20</span></h3><div class="muted">Freeze a QA fingerprint before institutional Blackboard production upload.</div></div><div class="toolbar"><button class="btn primary" id="v20FreezeRC">Freeze Release Candidate</button><button class="btn" id="v20SaveCloudRC">Save RC to cloud</button><button class="btn" id="v20ClearRC">Clear RC</button></div></div>
<div class="v20-grid" style="margin-top:12px"><div class="v20-card"><div class="field"><label>Release label</label><input id="v20RCLabel" placeholder="e.g. BADM 5060 · Fall 2026 · RC1"></div><div class="field"><label>Release Candidate policy</label><select id="v20RequireRC"><option value="false">Recommended</option><option value="true">Required before audited export</option></select></div><div id="v20RCInfo" style="margin-top:10px"></div></div><div class="v20-card"><h4 style="margin-top:0">Regression summary</h4><div id="v20Regression"></div></div></div>`;
main.appendChild(rc);

/* post-upload checklist */
const post=document.createElement('section');post.className='card';post.id='blackboardPostUploadCard';
post.innerHTML=`
<div><h3 style="margin:0">Blackboard Post-Upload Validation <span class="v6-badge">V20</span></h3><div class="muted">Record manual verification after importing the Release Candidate into the institution's real Blackboard course.</div></div>
<div class="v20-grid" style="margin-top:12px"><div class="v20-card"><div id="v20PostChecklist"></div></div><div class="v20-card"><div class="field"><label>Blackboard course / test shell</label><input id="v20CourseShell" placeholder="Course or test shell identifier"></div><div class="field"><label>Tester</label><input id="v20Tester"></div><div class="field"><label>Notes</label><textarea id="v20PostNotes" rows="6"></textarea></div><div class="toolbar"><button class="btn primary" id="v20SavePost">Save validation record</button><button class="btn" id="v20SaveCloudPost">Save validation to cloud</button><button class="btn" id="v20DownloadPost">Download validation report</button></div></div></div>`;
main.appendChild(post);

/* diagnostics */
const diag=document.createElement('section');diag.className='card';diag.id='releaseDiagnosticsCard';
diag.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Release Diagnostics <span class="v6-badge">V20</span></h3><div class="muted">Compare the current project against the frozen Release Candidate and export a diagnostic record.</div></div><button class="btn" id="v20DownloadDiagnostics">Download diagnostic JSON</button></div>
<div id="v20Metrics" class="v20-metrics" style="margin-top:12px"></div><div id="v20Diagnostics" style="margin-top:12px"></div>`;
main.appendChild(diag);

const nav=document.querySelector('aside .nav');if(nav){[['🧪 Blackboard Test Lab',lab],['🏷 Release Candidate',rc],['✅ Post-Upload Validation',post],['🩺 Release Diagnostics',diag]].forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)})}

function delivery(){return window.VRDeliveryV19}
function jsonClone(v){return JSON.parse(JSON.stringify(v))}
function stableState(){
 const copy=jsonClone(state);delete copy.v19LastTest;delete copy.experienceEvents;delete copy.activityFeed;
 if(copy.v20){delete copy.v20.testRuns;delete copy.v20.blackboardChecklist;delete copy.v20.releaseCandidate}
 return copy
}
async function hashText(text){const h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function projectFingerprint(){
 const media=(state.media||[]).map(m=>({id:m.id,name:m.name,path:m.path,size:m.size||0,sha256:state.mediaIntegrity?.[m.id]?.sha256||null})).sort((a,b)=>String(a.path).localeCompare(String(b.path)));
 return hashText(JSON.stringify({state:stableState(),media}))
}
function summary(s=state){return {scenes:(s.scenes||[]).length,stations:(s.stations||[]).length,questions:(s.questions||[]).length,objects:(s.objects||[]).length,rules:(s.rules||[]).length,npcs:(s.npcs||[]).length,media:(s.media||[]).length,competencies:(s.competencies||[]).length,reviewBlockers:(s.reviewComments||[]).filter(x=>x.status!=='resolved'&&x.severity==='blocker').length,score:(s.stations||[]).reduce((a,x)=>a+Number(x.points||0),0)+(s.questions||[]).reduce((a,x)=>a+Number(x.points||0),0)}}

/* advanced mock LMS that persists CMI across sessions */
function persistentMock(seed={}){
 const data={...seed},log=[];let initialized=false;
 const api={Initialize(){log.push('Initialize');if(initialized)return 'false';initialized=true;return 'true'},GetValue(k){log.push('GetValue '+k);return data[k]??''},SetValue(k,v){log.push('SetValue '+k+'='+v);if(!initialized)return 'false';data[k]=String(v);return 'true'},Commit(){log.push('Commit');return initialized?'true':'false'},Terminate(){log.push('Terminate');if(!initialized)return 'false';initialized=false;return 'true'}};
 const win={API_1484_11:api,parent:null,opener:null};win.parent=win;return {data,log,win}
}
function apiFrom(mock){return new Function('window',scormAPI()+';return window.SCORM;')(mock.win)}
function testLifecycle(){
 const d=delivery();if(!d?.simulateScorm)return {level:'fail',name:'Baseline lifecycle',detail:'V19 delivery adapter is unavailable.'};const r=d.simulateScorm({score:88,completion:'completed',success:'passed',progress:.88},false);return {level:r.ok?'pass':'fail',name:'Baseline lifecycle',detail:r.ok?'Initialize/SetValue/Commit/Terminate passed.':r.error||'Lifecycle failed.'}
}
function testSuspendResume(){
 try{const mock=persistentMock(),a=apiFrom(mock);if(!a.init())throw new Error('First Initialize failed');const payload=JSON.stringify({scene:'scene-test',completed:['station-1'],variables:{door:true}});a.set('cmi.suspend_data',payload);a.set('cmi.location','scene-test');a.finish(false);const b=apiFrom(mock);if(!b.init())throw new Error('Resume Initialize failed');const restored=b.get('cmi.suspend_data'),loc=b.get('cmi.location');b.finish(true);const ok=restored===payload&&loc==='scene-test'&&mock.data['cmi.exit']==='';return {level:ok?'pass':'fail',name:'Suspend / resume',detail:ok?'suspend_data and cmi.location survived a simulated session boundary.':'Resume values did not match the suspended session.',log:mock.log}}catch(e){return {level:'fail',name:'Suspend / resume',detail:e.message}}
}
function testSuspendCapacity(){
 try{const mock=persistentMock(),a=apiFrom(mock);a.init();const sample=JSON.stringify({payload:'x'.repeat(58000)});const set=a.set('cmi.suspend_data',sample),commit=a.commit();a.finish(false);return {level:set&&commit?'pass':'fail',name:'Large suspend_data smoke test',detail:set&&commit?'58 KB payload passed through the local SCORM wrapper mock. Blackboard/LMS limits must still be validated in the real environment.':'Large suspend_data write failed in the wrapper mock.'}}catch(e){return {level:'fail',name:'Large suspend_data smoke test',detail:e.message}}
}
function testScoreEdges(){
 const d=delivery();if(!d?.simulateScorm)return {level:'fail',name:'Score edge cases',detail:'V19 simulator unavailable.'};const passing=Math.max(0,Math.min(100,Number(state.passing||70))),cases=[0,Math.max(0,passing-1),passing,100],bad=[];for(const score of cases){const success=score>=passing?'passed':'failed',r=d.simulateScorm({score,completion:'completed',success,progress:1},false);if(!r.ok||r.data['cmi.score.raw']!==String(score)||r.data['cmi.success_status']!==success)bad.push(score)}return {level:bad.length?'fail':'pass',name:'Score / pass-fail edge cases',detail:bad.length?'Failed score cases: '+bad.join(', '):'0, threshold−1, threshold and 100 score cases persisted expected CMI values.'}
}
function testIncomplete(){
 const d=delivery(),r=d?.simulateScorm?.({score:35,completion:'incomplete',success:'unknown',progress:.35},false);return {level:r?.ok?'pass':'fail',name:'Incomplete session state',detail:r?.ok?'Incomplete/unknown state persisted through mock API.':'Incomplete session simulation failed.'}
}
async function testPackage(){
 try{const r=await delivery()?.runPackageTests?.();const fails=r?.tests?.filter(x=>x.level==='fail')||[];return {level:fails.length?'fail':'pass',name:'Package self-test integration',detail:fails.length?fails.length+' V19 package blocker(s) remain.':'V19 package self-test completed without blockers.'}}catch(e){return {level:'fail',name:'Package self-test integration',detail:e.message}}
}
async function runMatrix(){
 const tests=[testLifecycle(),testSuspendResume(),testSuspendCapacity(),testScoreEdges(),testIncomplete(),await testPackage()];
 const run={id:'run-'+Date.now(),at:new Date().toISOString(),tests,passing:Number(state.passing||70),fingerprint:await projectFingerprint()};state.v20.testRuns.unshift(run);state.v20.testRuns=state.v20.testRuns.slice(0,20);renderCases(tests);renderRunLog(run);renderDiagnostics();return run
}
T('v20RunMatrix').onclick=()=>runMatrix().catch(e=>alert(e.message));
T('v20ClearRuns').onclick=()=>{state.v20.testRuns=[];renderCases([]);T('v20RunLog').textContent='No local runs.';renderDiagnostics()};
function renderCases(tests=state.v20.testRuns?.[0]?.tests||[]){T('v20Cases').innerHTML=tests.length?tests.map(x=>'<div class="v20-case"><span class="'+(x.level==='pass'?'v18-pass':x.level==='warn'?'v18-warn':'v18-fail')+'">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc20(x.name)+'</b><small class="muted">'+esc20(x.detail)+'</small></div><span class="v16-badge">'+x.level.toUpperCase()+'</span></div>').join(''):'<div class="muted">Run the full test matrix.</div>'}
function renderRunLog(run=state.v20.testRuns?.[0]){if(!run)return;const lines=['TEST RUN '+run.id,'Time: '+run.at,'Fingerprint: '+run.fingerprint,'Passing score: '+run.passing,''];run.tests.forEach(x=>{lines.push('['+x.level.toUpperCase()+'] '+x.name+' — '+x.detail);if(x.log)lines.push(...x.log.map(v=>'  '+v))});T('v20RunLog').textContent=lines.join('\n')}

/* Release Candidate */
T('v20RequireRC').value=String(!!state.v20.requireReleaseCandidate);
T('v20RequireRC').onchange=()=>{state.v20.requireReleaseCandidate=T('v20RequireRC').value==='true';renderRC()};
async function freezeRC(){
 const latest=state.v20.testRuns?.[0];if(!latest)return alert('Run the V20 full test matrix first.');const failed=latest.tests.filter(x=>x.level==='fail');if(failed.length)return alert('Resolve V20 test blockers before freezing a Release Candidate.');const v19=delivery()?.getLastTest?.();const v19Fails=v19?.tests?.filter(x=>x.level==='fail')||[];if(!v19||v19Fails.length)return alert('Run a successful V19 package self-test first.');const fingerprint=await projectFingerprint(),label=T('v20RCLabel').value.trim()||('Release Candidate '+new Date().toLocaleString()),rc={id:'rc-'+Date.now(),label,createdAt:new Date().toISOString(),fingerprint,summary:summary(),deliveryProfile:delivery()?.getProfile?.()?.name||'',v19TestAt:v19.at||'',v20RunId:latest.id};state.v20.releaseCandidate=rc;try{const arr=JSON.parse(localStorage.getItem(RCSTORE)||'[]');arr.unshift(rc);localStorage.setItem(RCSTORE,JSON.stringify(arr.slice(0,15)))}catch(e){}renderRC();renderDiagnostics()
}
T('v20FreezeRC').onclick=freezeRC;
T('v20SaveCloudRC').onclick=async()=>{const rc=state.v20.releaseCandidate,run=state.v20.testRuns?.[0],cloud=window.VRCloudV13,c=cloud?.getClient?.(),u=cloud?.getUser?.(),p=state.metadata?.cloudProjectId||cloud?.getCloudProjectId?.();if(!rc)return alert('Freeze a Release Candidate first.');if(!c||!u||!p)return alert('Connect V13 Cloud Workspace, sign in and open/sync this project first.');let cloudRunId=null;if(run){const {data,error}=await c.from('xr_test_runs').insert({project_id:p,created_by:u.id,test_suite:'Blackboard Test Lab V20',project_fingerprint:run.fingerprint,passed:!run.tests.some(x=>x.level==='fail'),results:run.tests}).select('id').single();if(error)return alert('Cloud test run unavailable: '+error.message);cloudRunId=data.id}const {data,error}=await c.from('xr_release_candidates').insert({project_id:p,created_by:u.id,label:rc.label,project_fingerprint:rc.fingerprint,delivery_profile:rc.deliveryProfile||null,summary:rc.summary||{},test_run_id:cloudRunId}).select('id').single();if(error)return alert('Cloud Release Candidate unavailable: '+error.message);rc.cloudId=data.id;alert('Release Candidate saved to cloud.')};
T('v20ClearRC').onclick=()=>{state.v20.releaseCandidate=null;renderRC();renderDiagnostics()};
async function renderRC(){
 const box=T('v20RCInfo'),rc=state.v20.releaseCandidate;if(!rc){box.innerHTML='<div class="v20-rc"><b>No active Release Candidate</b><div class="muted">Run V19/V20 tests and freeze a candidate before production upload.</div></div>';return}
 const current=await projectFingerprint(),same=current===rc.fingerprint;box.innerHTML='<div class="v20-rc '+(same?'current':'stale')+'"><b>'+esc20(rc.label)+'</b><div class="muted">'+esc20(new Date(rc.createdAt).toLocaleString())+' · '+(same?'Current project matches frozen RC.':'Project changed after RC freeze.')+'</div><div class="v20-hash" style="margin-top:7px">RC '+esc20(rc.fingerprint)+'</div><div class="v20-hash">Current '+esc20(current)+'</div></div>'
}

/* Blackboard post-upload validation */
const checklist=[
 ['imported','SCORM ZIP imports without Blackboard package error.'],
 ['launches','Student Preview launches the SCO successfully.'],
 ['desktop','Desktop/non-VR mode is usable.'],
 ['resume','Exit/re-enter resumes expected scene/progress.'],
 ['score','Blackboard Gradebook receives expected score.'],
 ['completion','Completion/success status appears as expected.'],
 ['accessible','Accessible 2D Mode and keyboard workflow are usable.'],
 ['vr','VR launch tested on target device where required.'],
 ['ar','AR path tested on target device where AR is part of the activity.']
];
function renderPost(){const d=state.v20.blackboardChecklist||{};T('v20PostChecklist').innerHTML=checklist.map(([k,label])=>'<label class="v20-check"><input type="checkbox" data-v20post="'+k+'" '+(d[k]?'checked':'')+'><span>'+esc20(label)+'</span></label>').join('');T('v20PostChecklist').querySelectorAll('[data-v20post]').forEach(x=>x.onchange=()=>state.v20.blackboardChecklist[x.dataset.v20post]=x.checked)}
function postRecord(){const values={};checklist.forEach(([k])=>values[k]=!!state.v20.blackboardChecklist?.[k]);return {createdAt:new Date().toISOString(),releaseCandidate:state.v20.releaseCandidate,courseShell:T('v20CourseShell').value.trim(),tester:T('v20Tester').value.trim(),notes:T('v20PostNotes').value.trim(),checks:values,passed:Object.values(values).every(Boolean)}}
T('v20Tester').value=state.metadata?.author||'';
T('v20SavePost').onclick=()=>{const r=postRecord();state.v20.lastBlackboardValidation=r;alert(r.passed?'Blackboard validation record saved: all checks passed.':'Validation record saved with incomplete checks.');renderDiagnostics()};
T('v20SaveCloudPost').onclick=async()=>{const r=state.v20.lastBlackboardValidation||postRecord(),cloud=window.VRCloudV13,c=cloud?.getClient?.(),u=cloud?.getUser?.(),p=state.metadata?.cloudProjectId||cloud?.getCloudProjectId?.();if(!c||!u||!p)return alert('Connect V13 Cloud Workspace, sign in and open/sync this project first.');const {error}=await c.from('xr_blackboard_validations').insert({project_id:p,release_candidate_id:state.v20.releaseCandidate?.cloudId||null,created_by:u.id,course_shell:r.courseShell||null,tester:r.tester||null,passed:!!r.passed,checklist:r.checks||{},notes:r.notes||null});if(error)return alert('Cloud Blackboard validation unavailable: '+error.message);alert('Blackboard validation saved to cloud.')};
T('v20DownloadPost').onclick=()=>downloadJSON(postRecord(),(state.title||'VR-Classroom')+'_Blackboard_Validation.json');

/* diagnostics */
function downloadJSON(obj,name){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=String(name).replace(/[^a-z0-9_.-]+/gi,'_');a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)}
async function diagnostics(){
 const rc=state.v20.releaseCandidate,current=await projectFingerprint(),latest=state.v20.testRuns?.[0],post=state.v20.lastBlackboardValidation||null,v19=delivery()?.getLastTest?.()||null;return {generatedAt:new Date().toISOString(),project:{title:state.title,courseCode:state.metadata?.courseCode||'',version:state.version},currentFingerprint:current,releaseCandidate:rc,rcCurrent:!!rc&&rc.fingerprint===current,latestV20Run:latest,latestV19SelfTest:v19,blackboardValidation:post,currentSummary:summary()}
}
async function renderDiagnostics(){
 const d=await diagnostics(),rc=d.releaseCandidate,s=rc?.summary||{},cur=d.currentSummary,keys=['scenes','stations','questions','objects','rules','npcs','media','competencies','reviewBlockers','score'];
 const rcCurrent=d.rcCurrent,runPass=!!d.latestV20Run&&!d.latestV20Run.tests.some(x=>x.level==='fail'),postPass=!!d.blackboardValidation?.passed,v19Pass=!!d.latestV19SelfTest&&!d.latestV19SelfTest.tests.some(x=>x.level==='fail');
 T('v20Metrics').innerHTML='<div><b>'+(rcCurrent?'YES':'NO')+'</b><small>RC current</small></div><div><b>'+(runPass?'PASS':'—')+'</b><small>V20 matrix</small></div><div><b>'+(v19Pass?'PASS':'—')+'</b><small>V19 package</small></div><div><b>'+(postPass?'PASS':'—')+'</b><small>Blackboard validation</small></div>';
 T('v20Regression').innerHTML=rc?'<div class="v20-diff"><div><b>Domain</b></div><div><b>RC</b></div><div><b>Current</b></div>'+keys.map(k=>'<div>'+esc20(k)+'</div><div>'+esc20(s[k]??'—')+'</div><div>'+esc20(cur[k]??'—')+'</div>').join('')+'</div>':'<div class="muted">Freeze a Release Candidate to establish a regression baseline.</div>';
 T('v20Diagnostics').innerHTML='<div class="v20-case"><span class="'+(rcCurrent?'v18-pass':'v18-warn')+'">'+(rcCurrent?'✓':'!')+'</span><div><b>Release fingerprint</b><small class="muted">'+(rc?rcCurrent?'Current project matches the RC fingerprint.':'Current project differs from the frozen RC.':'No Release Candidate is active.')+'</small></div></div><div class="v20-case"><span class="'+(postPass?'v18-pass':'v18-warn')+'">'+(postPass?'✓':'!')+'</span><div><b>Real Blackboard validation</b><small class="muted">'+(postPass?'Latest manual validation is complete.':'A complete post-upload Blackboard validation has not been recorded.')+'</small></div></div>'
}
T('v20DownloadDiagnostics').onclick=async()=>downloadJSON(await diagnostics(),(state.title||'VR-Classroom')+'_Release_Diagnostics.json');

/* Export gate: optional RC requirement */
const exportBtn=T('exportBtn'),v19Export=exportBtn?.onclick;
if(exportBtn&&v19Export){exportBtn.onclick=async()=>{if(state.v20.requireReleaseCandidate){const rc=state.v20.releaseCandidate;if(!rc)return alert('V20 policy requires a frozen Release Candidate before export.');const current=await projectFingerprint();if(current!==rc.fingerprint)return alert('The project changed after the Release Candidate was frozen. Run QA again and freeze a new RC.')}return v19Export()}}

/* audit */
const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v20Checks(){
 const out=[],run=state.v20.testRuns?.[0],rc=state.v20.releaseCandidate,post=state.v20.lastBlackboardValidation;
 const failures=run?.tests?.filter(x=>x.level==='fail')||[];
 out.push({level:!run?'warn':failures.length?'fail':'pass',name:'Blackboard Test Lab matrix',detail:!run?'Run the V20 full test matrix.':failures.length?failures.length+' V20 test case(s) failed.':'Latest V20 test matrix has no blockers.'});
 out.push({level:state.v20.requireReleaseCandidate&&!rc?'fail':rc?'pass':'warn',name:'Release Candidate',detail:rc?'Release Candidate "'+rc.label+'" is frozen.':state.v20.requireReleaseCandidate?'Release Candidate is required but missing.':'No Release Candidate is frozen yet.'});
 out.push({level:post?.passed?'pass':'warn',name:'Blackboard post-upload validation',detail:post?.passed?'Latest real Blackboard validation record has all checks completed.':'No complete real Blackboard validation has been recorded; this cannot be automated from the authoring site.'});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v20Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v20Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(T('auditPass'))T('auditPass').textContent=p;if(T('auditWarn'))T('auditWarn').textContent=w;if(T('auditFail'))T('auditFail').textContent=f;if(T('auditResults'))T('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station" style="'+(x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc20(x.name)+'</b><div class="muted">'+esc20(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

const oldRender=render;
render=function(){oldRender();ensureV20();renderCases();renderPost();renderRC();renderDiagnostics()};
renderCases();renderPost();renderRC();renderDiagnostics();
})();