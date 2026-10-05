(()=>{
const A=id=>document.getElementById(id);
const escA=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureAuditUI(){
 const main=document.querySelector('main.workspace'); if(!main||A('auditCenterCard'))return;
 const card=document.createElement('section');card.className='card';card.id='auditCenterCard';
 card.innerHTML=`<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Production Readiness Audit</h3><div class="muted">Blackboard · SCORM 2004 · XR · Accessibility · Portability</div></div><button class="btn primary" id="runAuditBtn">Run full audit</button></div><div class="kpi" style="margin-top:14px"><div><b id="auditPass">0</b><small>Pass</small></div><div><b id="auditWarn">0</b><small>Warnings</small></div><div><b id="auditFail">0</b><small>Blockers</small></div></div><div id="auditResults" style="margin-top:12px"></div><div class="notice" style="margin-top:12px">AR-ready currently means the project carries AR delivery metadata and AR markers. Full WebXR immersive-AR placement is not yet treated as production-complete and is flagged transparently below.</div>`;
 main.appendChild(card);
 const nav=document.querySelector('aside .nav');if(nav){const b=document.createElement('button');b.textContent='🛡 Production Audit';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.appendChild(b)}
 A('runAuditBtn').onclick=()=>runAudit(true);
}
function audit(){
 if(typeof syncFromForm==='function')syncFromForm();if(typeof syncAdvanced==='function')syncAdvanced();
 const out=[],push=(level,name,detail)=>out.push({level,name,detail});
 push(state.title&&state.title.trim()?'pass':'fail','Project identity',state.title?'Activity title is defined.':'Activity title is required.');
 push((state.objectives||[]).length?'pass':'fail','Learning objectives',(state.objectives||[]).length+' objective(s) defined.');
 push((state.scenes||[]).length?'pass':'fail','Immersive scenes',(state.scenes||[]).length+' scene(s) available.');
 push((state.stations||[]).length?'pass':'fail','Learning stations',(state.stations||[]).length+' station(s) available.');
 const unlabeled=(state.stations||[]).filter(s=>!String(s.alt||'').trim()).length;
 push(unlabeled?'fail':'pass','Accessible station labels',unlabeled?unlabeled+' station(s) need an accessibility label.':'All stations have accessibility labels.');
 const badPortals=(state.objects||[]).filter(o=>o.type==='portal'&&(!(state.scenes||[]).some(s=>s.id===o.targetSceneId)));
 push(badPortals.length?'fail':'pass','Portal integrity',badPortals.length?badPortals.length+' portal(s) have an invalid target.':'All portals target existing scenes.');
 const badQuestions=(state.questions||[]).filter(q=>q.type!=='reflection'&&!String(q.answer||'').trim());
 push(badQuestions.length?'fail':'pass','Assessment answer keys',badQuestions.length?badQuestions.length+' scored question(s) are missing an answer key.':'Scored objective questions have answer keys.');
 const orphanQ=(state.questions||[]).filter(q=>!(state.stations||[]).some(s=>String(s.id)===String(q.stationId)));
 push(orphanQ.length?'fail':'pass','Assessment mapping',orphanQ.length?orphanQ.length+' question(s) are not attached to an existing station.':'Assessment questions are mapped to stations.');
 const ext=(state.objects||[]).filter(o=>o.type==='custom'&&o.url);
 push(ext.length?'warn':'pass','External 3D dependencies',ext.length?ext.length+' custom model(s) use external URLs; CORS/network access can affect Blackboard playback.':'No external 3D model dependency detected.');
 push('pass','A-Frame runtime','A-Frame 1.8.0 is vendored and bundled into new SCORM exports.');
 push('pass','SCORM reporting','Score, scaled score, progress, completion, success, suspend data, exit state and session time are handled by the audited runtime.');
 const a=state.accessibility||{};
 push(a.desktopFallback==='required'?'pass':'warn','Non-VR alternative',a.desktopFallback==='required'?'Desktop 3D fallback is required.':'Consider requiring Desktop 3D fallback.');
 push(a.captions==='required'?'pass':'warn','Media accessibility',a.captions==='required'?'Captions/transcripts are required by project policy.':'Captions/transcripts are only recommended.');
 push(a.reducedMotion==='on'?'pass':'warn','Motion comfort',a.reducedMotion==='on'?'Reduced-motion mode is enabled.':'Reduced-motion mode exists but is not enabled by default.');
 if((state.xr||{}).deliveryMode==='ar')push('warn','Immersive AR production status','AR-ready metadata is configured, but true immersive-AR placement remains a V5 engineering item.');
 else push('pass','XR delivery mode','Desktop/VR delivery is supported by the current runtime.');
 const pts=(state.stations||[]).reduce((n,s)=>n+Number(s.points||0),0)+(state.questions||[]).reduce((n,q)=>n+Number(q.points||0),0);
 push(pts>0?'pass':'fail','Scoring model',pts>0?'Maximum configured score weight: '+pts+' points.':'The project has no score weight.');
 return out;
}
function runAudit(scroll=false){
 const r=audit();const p=r.filter(x=>x.level==='pass').length,w=r.filter(x=>x.level==='warn').length,f=r.filter(x=>x.level==='fail').length;
 A('auditPass').textContent=p;A('auditWarn').textContent=w;A('auditFail').textContent=f;
 A('auditResults').innerHTML=r.map(x=>`<div class="station" style="${x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':''}"><span class="num">${x.level==='pass'?'✓':x.level==='warn'?'!':'×'}</span><div><b>${escA(x.name)}</b><div class="muted">${escA(x.detail)}</div></div><span class="v3-pill">${x.level.toUpperCase()}</span></div>`).join('');
 if(scroll)A('auditCenterCard').scrollIntoView({behavior:'smooth',block:'start'});
 return r;
}

scormAPI=function(){return `(function(){
let api=null,initialized=false,start=Date.now();
function findAPI(win){let tries=0;try{while(win&&tries<12){if(win.API_1484_11)return win.API_1484_11;if(!win.parent||win.parent===win)break;win=win.parent;tries++;}}catch(e){}return null}
function call(name,arg1,arg2){try{if(!api||typeof api[name]!=='function')return null;return api[name](arg1??'',arg2??'')}catch(e){return null}}
function duration(ms){let s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600);s-=h*3600;let m=Math.floor(s/60);s-=m*60;return 'PT'+h+'H'+m+'M'+s+'S'}
window.SCORM={init(){api=findAPI(window);if(!api&&window.opener)api=findAPI(window.opener);if(!api)return false;initialized=call('Initialize','')==='true';start=Date.now();return initialized},get(k){return initialized?(call('GetValue',k)||''):''},set(k,v){if(initialized)return call('SetValue',k,String(v))==='true';return false},commit(){if(initialized)return call('Commit','')==='true';return false},finish(completed){if(initialized){this.set('cmi.session_time',duration(Date.now()-start));this.set('cmi.exit',completed?'':'suspend');this.commit();call('Terminate','');initialized=false}},available(){return initialized}}})();`};

manifest=function(){
 const files=['index.html','scorm_api.js','aframe.min.js','AFRAME-LICENSE.txt','project.json','README.txt',...(state.media||[]).map(m=>m.path)].filter(Boolean);
 const fileXML=[...new Set(files)].map(h=>'<file href="'+escXML(h)+'"/>').join('');
 return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="VR_CLASSROOM_${Date.now()}" version="1.0"
 xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
 xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd">
 <metadata><schema>ADL SCORM</schema><schemaversion>2004 4th Edition</schemaversion></metadata>
 <organizations default="ORG1"><organization identifier="ORG1"><title>${escXML(state.title)}</title><item identifier="ITEM1" identifierref="RES1"><title>${escXML(state.title)}</title></item></organization></organizations>
 <resources><resource identifier="RES1" type="webcontent" adlcp:scormType="sco" href="index.html">${fileXML}</resource></resources>
</manifest>`};

runtimeHTML=function(preview=false){
 if(typeof syncAdvanced==='function')syncAdvanced();
 const data=JSON.stringify(state).replace(/</g,'\\u003c');
 const aframeSrc=preview?new URL('vendor/aframe-v1.8.0.min.js',location.href).href:'aframe.min.js';
 const scormLoader=preview?'<script>'+scormAPI().replace(/<\\/script/gi,'<\\\\/script')+'<\\/script>':'<script src="scorm_api.js"><\\/script>';
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(state.title)}</title><script src="${aframeSrc}"><\/script>${scormLoader}<style>
 body{margin:0;background:#06101f;color:#fff;font-family:system-ui}.hud{position:fixed;z-index:20;left:12px;right:12px;top:12px;display:flex;justify-content:space-between;gap:8px;pointer-events:none}.panel,.modal{background:#071225f2;border:1px solid #ffffff35;border-radius:12px;padding:11px 13px}.modal{position:fixed;z-index:30;left:18px;right:18px;bottom:18px;max-width:720px;margin:auto;display:none;max-height:60vh;overflow:auto}.modal button,.modal textarea{pointer-events:auto}.choices button{display:block;width:100%;margin:7px 0;padding:10px;border-radius:8px;border:1px solid #ffffff44;background:#152640;color:#fff;text-align:left}.small{font-size:12px;opacity:.85}.sceneTag{font-size:12px;color:#a7f3d0}.close{float:right;border:1px solid #ffffff44;background:#13233c;color:#fff;border-radius:8px;padding:7px 10px}.sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
 </style></head><body><div id="live" class="sr" aria-live="polite"></div><div class="hud"><div class="panel"><b id="ttl"></b><div class="small" id="ins"></div><div class="sceneTag" id="sceneName"></div></div><div class="panel"><b id="prog">0%</b><div class="small" id="score">0 pts</div></div></div>
 <div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="mt"><button class="close" id="closeModal" aria-label="Close station">Close</button><h3 id="mt"></h3><p id="mc"></p><div id="choices" class="choices"></div><button id="completeBtn">Complete station</button></div>
 <a-scene id="scene" background="color:#19324d" vr-mode-ui="enabled:true"><a-sky color="#284e73"></a-sky><a-plane rotation="-90 0 0" width="50" height="50" color="#253650"></a-plane><a-entity id="world"></a-entity><a-entity camera look-controls wasd-controls position="0 1.6 4"><a-cursor color="#fff"></a-cursor></a-entity></a-scene>
 <script>
 const project=${data};const by=id=>document.getElementById(id);const ui={ttl:by('ttl'),ins:by('ins'),sceneName:by('sceneName'),prog:by('prog'),score:by('score'),modal:by('modal'),mt:by('mt'),mc:by('mc'),choices:by('choices'),completeBtn:by('completeBtn'),closeModal:by('closeModal'),live:by('live'),world:by('world')};
 let currentScene=project.activeSceneId||(project.scenes[0]&&project.scenes[0].id),currentStation=null,earnedQ=0,completed=new Set(),answered=new Set(),isComplete=false;
 SCORM.init();ui.ttl.textContent=project.title;ui.ins.textContent=project.instructions;
 try{const saved=SCORM.get('cmi.suspend_data');if(saved){const r=JSON.parse(saved);currentScene=r.currentScene||currentScene;earnedQ=Number(r.earnedQ||0);completed=new Set(r.completed||[]);answered=new Set(r.answered||[])}}catch(e){}
 if(!SCORM.get('cmi.completion_status'))SCORM.set('cmi.completion_status','incomplete');if(!SCORM.get('cmi.success_status'))SCORM.set('cmi.success_status','unknown');SCORM.commit();
 const E=(tag,attrs={})=>{const e=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e};
 function announce(s){ui.live.textContent=s}
 function closeModal(){ui.modal.style.display='none';currentStation=null}
 ui.closeModal.onclick=closeModal;document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
 function showScene(id){currentScene=id;ui.world.innerHTML='';const sc=project.scenes.find(s=>s.id===id)||project.scenes[0];if(!sc)return;ui.sceneName.textContent=sc.name;announce('Entered '+sc.name);
 (project.objects||[]).filter(o=>o.sceneId===id).forEach(o=>{let e;if(o.type==='portal')e=E('a-torus',{radius:1,'radius-tubular':.1,color:'#c4b5fd'});else if(o.type==='screen')e=E('a-box',{width:2,height:1.2,depth:.15,color:'#fde68a'});else if(o.type==='table')e=E('a-box',{width:2,height:.25,depth:1,color:'#94a3b8'});else if(o.type==='custom'&&o.url)e=E('a-gltf-model',{src:o.url});else e=E('a-cylinder',{radius:.65,height:1.5,color:o.type==='station'?'#86efac':'#7dd3fc'});
 e.setAttribute('position',(o.x||0)+' '+(o.y||1)+' '+(o.z||-5));e.setAttribute('rotation','0 '+(o.rotationY||0)+' 0');e.setAttribute('scale',(o.scale||1)+' '+(o.scale||1)+' '+(o.scale||1));e.setAttribute('tabindex','0');e.setAttribute('aria-label',o.label||o.type);e.addEventListener('click',()=>{if(o.type==='portal'&&o.targetSceneId)showScene(o.targetSceneId)});ui.world.appendChild(e);ui.world.appendChild(E('a-text',{value:o.label||o.type,width:3,color:'#fff',position:((o.x||0)-1)+' '+((o.y||1)+1.5)+' '+(o.z||-5)}))});
 const sts=(project.stations||[]).filter(s=>s.sceneId===id);sts.forEach((s,i)=>{const x=-4+(i%4)*2.6,z=-7-Math.floor(i/4)*3;const e=E('a-dodecahedron',{radius:.7,color:completed.has(s.id)?'#22c55e':'#38bdf8',position:x+' 1 '+z});e.setAttribute('aria-label',s.alt||s.name);e.addEventListener('click',()=>openStation(s));ui.world.appendChild(e);ui.world.appendChild(E('a-text',{value:s.name,width:3,color:'#fff',position:(x-1)+' 2.1 '+z}))});persist()}
 function openStation(s){currentStation=s;ui.mt.textContent=s.name;ui.mc.textContent=s.content;ui.choices.innerHTML='';ui.completeBtn.style.display='inline-block';const qs=(project.questions||[]).filter(q=>String(q.stationId)===String(s.id));
 if(qs.length){ui.completeBtn.style.display='none';qs.forEach(q=>{const wrap=document.createElement('div'),p=document.createElement('p');p.innerHTML='<b>'+safe(q.prompt)+'</b> ('+Number(q.points||0)+' pts)';wrap.appendChild(p);
 if(q.type==='reflection'){const ta=document.createElement('textarea');ta.rows=3;ta.style.width='100%';ta.placeholder='Enter your reflection';const submit=document.createElement('button');submit.textContent='Submit reflection';submit.onclick=()=>{if(!ta.value.trim())return;if(!answered.has(q.id)){answered.add(q.id);earnedQ+=Number(q.points||0)};submit.disabled=true;finishStationIfReady(s,qs)};wrap.appendChild(ta);wrap.appendChild(submit)}
 else (q.choices||[]).forEach(ch=>{const b=document.createElement('button');b.textContent=ch;b.disabled=answered.has(q.id);b.onclick=()=>answer(q,ch,b,s,qs);wrap.appendChild(b)});ui.choices.appendChild(wrap)})}
 ui.modal.style.display='block';ui.modal.focus?.();announce('Opened '+s.name)}
 function safe(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
 function answer(q,ch,b,s,qs){if(answered.has(q.id))return;answered.add(q.id);const ok=String(ch).trim().toLowerCase()===String(q.answer).trim().toLowerCase();if(ok){earnedQ+=Number(q.points||0);b.textContent+=' ✓'}else b.textContent+=' ✕';finishStationIfReady(s,qs)}
 function finishStationIfReady(s,qs){if(qs.every(x=>answered.has(x.id)))completed.add(s.id);update();showScene(currentScene)}
 ui.completeBtn.onclick=()=>{if(!currentStation)return;completed.add(currentStation.id);closeModal();update();showScene(currentScene)};
 function persist(){try{SCORM.set('cmi.suspend_data',JSON.stringify({currentScene,earnedQ,completed:[...completed],answered:[...answered]}).slice(0,60000));SCORM.commit()}catch(e){}}
 function update(){const stationPts=(project.stations||[]).reduce((a,s)=>a+Number(s.points||0),0),qPts=(project.questions||[]).reduce((a,q)=>a+Number(q.points||0),0),max=Math.max(1,stationPts+qPts);let stationEarned=0;(project.stations||[]).forEach(s=>{if(completed.has(s.id))stationEarned+=Number(s.points||0)});const totalEarned=stationEarned+earnedQ,raw=Math.min(100,Math.round(totalEarned/max*100));ui.prog.textContent=raw+'%';ui.score.textContent=totalEarned+' / '+max+' pts';SCORM.set('cmi.score.min','0');SCORM.set('cmi.score.max','100');SCORM.set('cmi.score.raw',raw);SCORM.set('cmi.score.scaled',(raw/100).toFixed(4));const required=(project.stations||[]).filter(s=>s.required);const doneRequired=required.length?required.every(s=>completed.has(s.id)):completed.size===(project.stations||[]).length;const progress=(project.stations||[]).length?completed.size/(project.stations||[]).length:0;SCORM.set('cmi.progress_measure',Math.min(1,progress).toFixed(4));isComplete=project.completion==='score'?raw>=project.passing:doneRequired;SCORM.set('cmi.completion_status',isComplete?'completed':'incomplete');SCORM.set('cmi.success_status',isComplete?(raw>=project.passing?'passed':'failed'):'unknown');persist();announce('Progress '+raw+' percent')}
 update();showScene(currentScene);window.addEventListener('pagehide',()=>SCORM.finish(isComplete));window.addEventListener('beforeunload',()=>SCORM.finish(isComplete));
 <\/script></body></html>`};

async function exportAudited(){
 const a=runAudit(false),blocks=a.filter(x=>x.level==='fail');if(blocks.length)return alert('Production audit found blockers:\n- '+blocks.map(x=>x.name+': '+x.detail).join('\n- '));
 const zip=new JSZip();zip.file('imsmanifest.xml',manifest());zip.file('scorm_api.js',scormAPI());zip.file('index.html',runtimeHTML(false));
 try{const [af,lic]=await Promise.all([fetch('vendor/aframe-v1.8.0.min.js'),fetch('vendor/AFRAME-LICENSE.txt')]);if(!af.ok)throw new Error('A-Frame runtime unavailable');zip.file('aframe.min.js',await af.arrayBuffer());zip.file('AFRAME-LICENSE.txt',await lic.text())}catch(e){return alert('Could not package the local A-Frame runtime. Export cancelled to avoid an incomplete SCORM package.')}
 zip.file('README.txt','VR Classroom Studio audited SCORM 2004 package. Includes A-Frame locally. Upload this ZIP directly to Blackboard as a SCORM package.');
 const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=(state.title||'vr-classroom').replace(/[^a-z0-9]+/gi,'_')+'_SCORM2004_AUDITED.zip';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),5000)
}
function patchHandlers(){
 if(A('previewBtn'))A('previewBtn').onclick=()=>{if(typeof syncFromForm==='function')syncFromForm();if(typeof syncAdvanced==='function')syncAdvanced();const u=URL.createObjectURL(new Blob([runtimeHTML(true)],{type:'text/html'}));window.open(u,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(u),60000)};
 if(A('validateBtn'))A('validateBtn').onclick=()=>{const base=typeof validateProject==='function'?validateProject():[];const prod=runAudit(true).filter(x=>x.level==='fail');const all=[...new Set([...(base||[]),...prod.map(x=>x.name+': '+x.detail)])];if(!all.length)alert('Project passed validation and the production readiness audit.');};
 if(A('exportBtn')){A('exportBtn').textContent='Export Audited SCORM';A('exportBtn').onclick=exportAudited}
}
ensureAuditUI();patchHandlers();runAudit(false);
window.VRClassroomAudit={run:runAudit,checks:audit};
})();