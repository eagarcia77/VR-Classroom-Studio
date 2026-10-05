(()=>{
const B=id=>document.getElementById(id);
const esc19=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV19(){
 state.version=19;
 state.v19Settings=state.v19Settings||{profile:'blackboard-standard',requireSelfTest:true,requirePublicationChecklist:true};
 state.v19LastTest=state.v19LastTest||null;
}
ensureV19();
const main=document.querySelector('main.workspace');if(!main)return;

/* Delivery center */
const delivery=document.createElement('section');delivery.className='card';delivery.id='blackboardDeliveryCenter';
delivery.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Blackboard Delivery & QA Automation <span class="v6-badge">V19</span></h3><div class="muted">Build and inspect the SCORM package in memory before final download.</div></div><div class="toolbar"><button class="btn primary" id="v19SelfTest">Run SCORM package self-test</button><button class="btn" id="v19Report">Download QA report</button><button class="btn" id="v19CloudReport">Save cloud delivery report</button></div></div>
<div class="v19-grid" style="margin-top:12px"><div class="v19-card"><h4 style="margin-top:0">Delivery Profile</h4><div class="field"><label>Profile</label><select id="v19Profile"><option value="blackboard-standard">Blackboard · Standard SCORM 2004</option><option value="blackboard-accessible">Blackboard · Accessibility Strict</option><option value="portable-offline">Portable · Offline XR Strict</option></select></div><div id="v19ProfileInfo" class="muted"></div></div><div class="v19-card"><h4 style="margin-top:0">Package Readiness</h4><div id="v19Metrics" class="v19-metrics"></div><div id="v19Readiness" style="margin-top:10px"></div></div></div>
<div id="v19Tests" style="margin-top:12px"></div>`;
main.appendChild(delivery);

/* Simulator */
const sim=document.createElement('section');sim.className='card';sim.id='scormSimulatorCard';
sim.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">SCORM 2004 Lifecycle Simulator <span class="v6-badge">V19</span></h3><div class="muted">Exercise the generated SCORM API wrapper against an in-browser mock LMS API.</div></div><button class="btn primary" id="v19RunSim">Run lifecycle simulation</button></div>
<div class="v19-grid" style="margin-top:12px"><div class="v19-card"><div class="v19-state"><label>Score raw</label><input id="v19Score" type="number" min="0" max="100" value="85"></div><div class="v19-state"><label>Completion</label><select id="v19Completion"><option>completed</option><option selected>incomplete</option><option>not attempted</option><option>unknown</option></select></div><div class="v19-state"><label>Success</label><select id="v19Success"><option>passed</option><option selected>unknown</option><option>failed</option></select></div><div class="v19-state"><label>Progress measure</label><input id="v19Progress" type="number" min="0" max="1" step=".01" value=".75"></div></div><div class="v19-card"><h4 style="margin-top:0">Simulator log</h4><div id="v19SimLog" class="v19-log">Not run.</div></div></div>`;
main.appendChild(sim);

/* Package inspector */
const inspect=document.createElement('section');inspect.className='card';inspect.id='packageInspectorCard';
inspect.innerHTML=`
<div><h3 style="margin:0">SCORM ZIP Inspector <span class="v6-badge">V19</span></h3><div class="muted">Validates expected files, local runtime dependencies, manifest declarations, project JSON and runtime references.</div></div>
<div id="v19Inspector" class="v19-log" style="margin-top:12px">Run the package self-test.</div>`;
main.appendChild(inspect);

const nav=document.querySelector('aside .nav');if(nav){[['📦 Delivery QA',delivery],['🧪 SCORM Simulator',sim],['🔎 ZIP Inspector',inspect]].forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)})}

const profiles={
 'blackboard-standard':{name:'Blackboard · Standard SCORM 2004',accessStrict:false,offlineStrict:true,scoreStrict:false,description:'Requires audited SCORM packaging, local XR runtime, complete manifest declarations and a working SCORM lifecycle.'},
 'blackboard-accessible':{name:'Blackboard · Accessibility Strict',accessStrict:true,offlineStrict:true,scoreStrict:true,description:'Adds V18 accessibility blockers, equivalent access mode and 100-point score-weight expectations to the standard package checks.'},
 'portable-offline':{name:'Portable · Offline XR Strict',accessStrict:false,offlineStrict:true,scoreStrict:false,description:'Prioritizes a fully local package with no required external XR/model dependencies.'}
};
B('v19Profile').value=state.v19Settings.profile||'blackboard-standard';
function profile(){return profiles[state.v19Settings.profile]||profiles['blackboard-standard']}
function renderProfile(){const p=profile();B('v19ProfileInfo').innerHTML='<div class="v19-profile"><b>'+esc19(p.name)+'</b><div style="margin-top:5px">'+esc19(p.description)+'</div></div>'}
B('v19Profile').onchange=()=>{state.v19Settings.profile=B('v19Profile').value;renderProfile();renderLast()};

function expectedFiles(){return ['imsmanifest.xml','index.html','scorm_api.js','aframe.min.js','AFRAME-LICENSE.txt','project.json','README.txt',...(state.media||[]).map(m=>m.path)].filter(Boolean)}
async function buildPackage(){
 if(typeof JSZip==='undefined')throw new Error('JSZip is unavailable.');
 const mediaFiles=window.VRClassroomMediaFiles;
 const missing=(state.media||[]).filter(m=>!mediaFiles?.has(m.id));if(missing.length)throw new Error('Missing local media bytes: '+missing.map(m=>m.name).join(', '));
 const zip=new JSZip();zip.file('imsmanifest.xml',manifest());zip.file('scorm_api.js',scormAPI());zip.file('index.html',runtimeHTML(false));
 const [af,lic]=await Promise.all([fetch('vendor/aframe-v1.8.0.min.js'),fetch('vendor/AFRAME-LICENSE.txt')]);if(!af.ok||!lic.ok)throw new Error('Bundled A-Frame runtime/license could not be loaded.');
 zip.file('aframe.min.js',await af.arrayBuffer());zip.file('AFRAME-LICENSE.txt',await lic.text());
 for(const m of state.media||[])zip.file(m.path,mediaFiles.get(m.id));
 zip.file('project.json',JSON.stringify(state,null,2));zip.file('README.txt','VR Classroom Studio audited SCORM 2004 package. Local media and A-Frame runtime are bundled.');
 return zip
}
function result(level,name,detail){return {level,name,detail}}
function scoreWeight(){return (state.stations||[]).reduce((a,s)=>a+Number(s.points||0),0)+(state.questions||[]).reduce((a,q)=>a+Number(q.points||0),0)}
async function runPackageTests(){
 const tests=[],p=profile();let zip;
 try{zip=await buildPackage();tests.push(result('pass','Package build','In-memory SCORM ZIP assembled successfully.'))}catch(e){tests.push(result('fail','Package build',e.message));return finalize(tests,null)}
 const names=Object.keys(zip.files).filter(n=>!zip.files[n].dir),expected=expectedFiles(),missing=expected.filter(x=>!names.includes(x)),extras=names.filter(x=>!expected.includes(x));
 tests.push(result(missing.length?'fail':'pass','Required package files',missing.length?'Missing: '+missing.join(', '):expected.length+' expected file(s) are present.'));
 tests.push(result('pass','Package extras',extras.length?'Additional file(s): '+extras.join(', '):'No unexpected package files.'));
 const man=await zip.file('imsmanifest.xml')?.async('text')||'',runtime=await zip.file('index.html')?.async('text')||'',project=await zip.file('project.json')?.async('text')||'';
 const undeclared=expected.filter(x=>x!=='imsmanifest.xml'&&!man.includes('href="'+String(x).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"'));
 tests.push(result(undeclared.length?'fail':'pass','Manifest declarations',undeclared.length?'Not declared: '+undeclared.join(', '):'Manifest declares all resource files.'));
 tests.push(result(/schemaversion>2004 4th Edition</.test(man)?'pass':'fail','SCORM edition metadata',/schemaversion>2004 4th Edition</.test(man)?'SCORM 2004 4th Edition metadata found.':'Expected SCORM 2004 4th Edition metadata not found.'));
 tests.push(result(runtime.includes('aframe.min.js')?'pass':'fail','Local XR runtime reference',runtime.includes('aframe.min.js')?'Runtime uses packaged aframe.min.js.':'Runtime does not reference packaged A-Frame.'));
 tests.push(result(runtime.includes('scorm_api.js')?'pass':'fail','SCORM API runtime reference',runtime.includes('scorm_api.js')?'Runtime references packaged scorm_api.js.':'Runtime SCORM API reference missing.'));
 let jsonOK=true;try{JSON.parse(project)}catch{jsonOK=false}tests.push(result(jsonOK?'pass':'fail','Project JSON',jsonOK?'project.json parses successfully.':'project.json is invalid JSON.'));
 const externalModels=(state.objects||[]).filter(o=>o.url&&!o.assetId&&/^https?:/i.test(o.url));tests.push(result(p.offlineStrict&&externalModels.length?'fail':externalModels.length?'warn':'pass','External model dependencies',externalModels.length?externalModels.length+' external model URL(s) remain.':'No external model dependency detected.'));
 const qs=scoreWeight();tests.push(result(p.scoreStrict&&qs!==100?'fail':qs===100?'pass':'warn','Score weight',qs===100?'Configured assessment weight totals 100.':'Configured assessment weight totals '+qs+'.'));
 if(p.accessStrict&&typeof state.v18Settings==='object'){tests.push(result(state.v18Settings.alternativeMode?'pass':'fail','Equivalent access mode',state.v18Settings.alternativeMode?'V18 Accessible 2D Mode is enabled.':'Accessible 2D Mode is disabled.'));tests.push(result(state.v18Settings.keyboardActivation?'pass':'fail','Keyboard policy',state.v18Settings.keyboardActivation?'Keyboard activation is required.':'Keyboard activation is disabled.'))}
 try{const apiTest=simulateScorm({score:85,completion:'completed',success:'passed',progress:.85},false);tests.push(result(apiTest.ok?'pass':'fail','SCORM lifecycle smoke test',apiTest.ok?'Initialize/SetValue/Commit/Terminate succeeded against mock LMS.':apiTest.error||'Lifecycle simulation failed.'))}catch(e){tests.push(result('fail','SCORM lifecycle smoke test',e.message))}
 return finalize(tests,zip)
}
function finalize(tests,zip){state.v19LastTest={at:new Date().toISOString(),profile:state.v19Settings.profile,tests};renderTests(tests);renderInspector(tests,zip);renderReadiness(tests);return {tests,zip}}
function renderTests(tests){B('v19Tests').innerHTML=tests.map(x=>'<div class="v19-test"><span class="'+(x.level==='pass'?'v18-pass':x.level==='warn'?'v18-warn':'v18-fail')+'">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc19(x.name)+'</b><small class="muted">'+esc19(x.detail)+'</small></div><span class="v16-badge">'+x.level.toUpperCase()+'</span></div>').join('')}
function renderInspector(tests,zip){const lines=[];lines.push('PROFILE: '+profile().name);lines.push('TIME: '+new Date().toISOString());if(zip){const names=Object.keys(zip.files).filter(n=>!zip.files[n].dir);lines.push('FILES ('+names.length+'):');names.sort().forEach(n=>lines.push('  '+n))}lines.push('');lines.push('TESTS:');tests.forEach(t=>lines.push('['+t.level.toUpperCase()+'] '+t.name+' — '+t.detail));B('v19Inspector').textContent=lines.join('\n')}
function renderReadiness(tests=state.v19LastTest?.tests||[]){const p=tests.filter(x=>x.level==='pass').length,w=tests.filter(x=>x.level==='warn').length,f=tests.filter(x=>x.level==='fail').length;B('v19Metrics').innerHTML='<div><b>'+p+'</b><small>Pass</small></div><div><b>'+w+'</b><small>Warnings</small></div><div><b>'+f+'</b><small>Blockers</small></div><div><b>'+scoreWeight()+'</b><small>Score weight</small></div>';B('v19Readiness').innerHTML='<div class="v19-profile '+(f?'v19-blocked':'v19-ready')+'"><b>'+(f?'DELIVERY BLOCKED':'PACKAGE SELF-TEST READY')+'</b><div style="margin-top:5px">'+(f?'Resolve self-test blockers before audited export.':'No self-test blockers detected; continue with the full publication checklist and final human review.')+'</div></div>'}
function renderLast(){renderProfile();if(state.v19LastTest?.tests)renderTests(state.v19LastTest.tests);renderReadiness()}

function mockLMS(){
 const data={},log=[];let initialized=false,terminated=false;
 const api={
 Initialize(){log.push('Initialize("")');if(initialized||terminated)return 'false';initialized=true;return 'true'},
 GetValue(k){log.push('GetValue('+k+')');return data[k]??''},
 SetValue(k,v){log.push('SetValue('+k+', '+v+')');if(!initialized||terminated)return 'false';data[k]=String(v);return 'true'},
 Commit(){log.push('Commit("")');return initialized&&!terminated?'true':'false'},
 Terminate(){log.push('Terminate("")');if(!initialized||terminated)return 'false';terminated=true;initialized=false;return 'true'}
 };
 const win={API_1484_11:api,parent:null,opener:null};win.parent=win;return {win,data,log,get initialized(){return initialized},get terminated(){return terminated}}
}
function simulateScorm(values,writeLog=true){
 const mock=mockLMS();try{const factory=new Function('window',scormAPI()+';return window.SCORM;'),api=factory(mock.win);const init=api.init();api.set('cmi.score.raw',values.score);api.set('cmi.score.min',0);api.set('cmi.score.max',100);api.set('cmi.progress_measure',values.progress);api.set('cmi.completion_status',values.completion);api.set('cmi.success_status',values.success);const commit=api.commit();api.finish(values.completion==='completed');const ok=init&&commit&&mock.terminated&&mock.data['cmi.score.raw']===String(values.score)&&mock.data['cmi.completion_status']===values.completion&&mock.data['cmi.success_status']===values.success;if(writeLog)B('v19SimLog').textContent=mock.log.join('\n')+'\n\nCMI DATA\n'+JSON.stringify(mock.data,null,2)+'\n\nRESULT: '+(ok?'PASS':'FAIL');return {ok,data:mock.data,log:mock.log}}catch(e){if(writeLog)B('v19SimLog').textContent='ERROR: '+e.message;return {ok:false,error:e.message,data:mock.data,log:mock.log}}
}
B('v19RunSim').onclick=()=>simulateScorm({score:Number(B('v19Score').value)||0,completion:B('v19Completion').value,success:B('v19Success').value,progress:Number(B('v19Progress').value)||0},true);
B('v19SelfTest').onclick=()=>runPackageTests().catch(e=>alert(e.message));

function reportObject(){const audit=window.VRClassroomAudit?.checks?.()||[],self=state.v19LastTest?.tests||[];return {generatedAt:new Date().toISOString(),project:{title:state.title||'',projectName:state.metadata?.projectName||'',courseCode:state.metadata?.courseCode||'',version:state.version,ownership:state.ownership||{owner:'Eduardo Augusto García Rodríguez',creator:'Eduardo Augusto García Rodríguez',copyright:'© 2026 Eduardo Augusto García Rodríguez'}},deliveryProfile:profile().name,scorm:{standard:'SCORM 2004 4th Edition',scoreWeight:scoreWeight()},selfTest:self,productionAudit:audit,accessibility:state.v18Settings||{},media:(state.media||[]).map(m=>({name:m.name,path:m.path,size:m.size,type:m.type,sha256:state.mediaIntegrity?.[m.id]?.sha256||null})),governance:state.reviewApprovals||{}}}
B('v19Report').onclick=()=>{const report=reportObject(),blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(state.title||'VR-Classroom').replace(/[^a-z0-9]+/gi,'_')+'_QA_Report.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)};
B('v19CloudReport').onclick=async()=>{const cloud=window.VRCloudV13,c=cloud?.getClient?.(),u=cloud?.getUser?.(),p=state.metadata?.cloudProjectId||cloud?.getCloudProjectId?.();if(!c||!u||!p)return alert('Connect V13 Cloud Workspace, sign in and open/sync this project first.');if(!state.v19LastTest?.tests?.length)return alert('Run the V19 package self-test first.');const report=reportObject(),blockers=report.selfTest.filter(x=>x.level==='fail').length+report.productionAudit.filter(x=>x.level==='fail').length,warnings=report.selfTest.filter(x=>x.level==='warn').length+report.productionAudit.filter(x=>x.level==='warn').length;const metadataSource=JSON.stringify({title:report.project.title,profile:report.deliveryProfile,standard:report.scorm.standard,media:report.media.map(m=>({name:m.name,path:m.path,size:m.size,sha256:m.sha256}))});let metadataSha256='';try{const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(metadataSource));metadataSha256=[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('')}catch(e){}const payload={project_id:p,created_by:u.id,delivery_profile:report.deliveryProfile,package_standard:report.scorm.standard,ready:blockers===0,blockers,warnings,self_test:report.selfTest,production_audit:report.productionAudit,package_metadata:{scoreWeight:report.scorm.scoreWeight,fileCount:expectedFiles().length,metadataSha256}};const {error}=await c.from('xr_delivery_reports').insert(payload);if(error)return alert('Cloud delivery report unavailable: '+error.message);alert('Cloud delivery report saved.')};

/* Gate stable exporter */
const exportBtn=B('exportBtn'),stableExport=exportBtn?.onclick;
if(exportBtn&&stableExport){exportBtn.onclick=async()=>{if(state.v19Settings.requireSelfTest){const {tests}=await runPackageTests(),fails=tests.filter(x=>x.level==='fail');if(fails.length)return alert('V19 package self-test blocked export:\n- '+fails.map(x=>x.name+': '+x.detail).join('\n- '))}return stableExport()}}

const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v19Checks(){
 const out=[],last=state.v19LastTest,tests=last?.tests||[],fails=tests.filter(x=>x.level==='fail'),warns=tests.filter(x=>x.level==='warn');
 out.push({level:state.v19Settings.requireSelfTest&&!last?'warn':fails.length?'fail':'pass',name:'SCORM package self-test',detail:!last?'Run the V19 package self-test before final publication.':fails.length?fails.length+' package self-test blocker(s) remain.':'Latest package self-test reports no blockers.'});
 out.push({level:warns.length?'warn':'pass',name:'SCORM package QA warnings',detail:warns.length?warns.length+' package warning(s) remain for review.':'No package QA warnings remain.'});
 const p=profile();out.push({level:p.accessStrict&&state.v18Settings&&!state.v18Settings.alternativeMode?'fail':'pass',name:'Delivery profile policy',detail:p.accessStrict?'Accessibility Strict profile policy evaluated.':'Selected delivery profile does not add accessibility-blocking requirements.'});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v19Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v19Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(B('auditPass'))B('auditPass').textContent=p;if(B('auditWarn'))B('auditWarn').textContent=w;if(B('auditFail'))B('auditFail').textContent=f;if(B('auditResults'))B('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station" style="'+(x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc19(x.name)+'</b><div class="muted">'+esc19(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

window.VRDeliveryV19={
 buildPackage,
 runPackageTests,
 simulateScorm,
 expectedFiles,
 reportObject,
 scoreWeight,
 getLastTest:()=>state.v19LastTest,
 getProfile:()=>profile()
};
window.dispatchEvent(new CustomEvent('vrdelivery-ready'));
const oldRender=render;
render=function(){oldRender();ensureV19();renderLast()};
renderLast();
})();