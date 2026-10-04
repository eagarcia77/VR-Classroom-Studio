(()=>{
const Q=id=>document.getElementById(id);
const esc16=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV16(){state.version=16;state.activityFeed=state.activityFeed||[];state.alignmentNotes=state.alignmentNotes||[]}
ensureV16();
const main=document.querySelector('main.workspace');if(!main)return;

/* 3D comments */
const pins=document.createElement('section');pins.className='card';pins.id='visualReviewPinsCard';
pins.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Visual 3D Review Pins <span class="v6-badge">V16</span></h3><div class="muted">Object-anchored review comments appear as clickable markers in the V6 authoring canvas.</div></div><button class="btn" id="v16RefreshPins">Refresh pins</button></div>
<div class="v16-grid" style="margin-top:12px"><div class="v16-card"><h4 style="margin-top:0">Pinned comments</h4><div id="v16PinList" class="v16-pin-list"></div></div><div class="v16-card"><h4 style="margin-top:0">Quick pin selected object</h4><div class="field"><label>Comment</label><textarea id="v16PinText" rows="4" placeholder="Describe the issue on the selected 3D object."></textarea></div><div class="field"><label>Severity</label><select id="v16PinSeverity"><option value="note">Note</option><option value="warning">Warning</option><option value="blocker">Publication blocker</option></select></div><button class="btn primary" id="v16AddPin">Add 3D review pin</button></div></div>`;
main.appendChild(pins);

/* activity feed */
const feed=document.createElement('section');feed.className='card';feed.id='activityFeedCard';
feed.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Collaborative Activity Feed <span class="v6-badge">V16</span></h3><div class="muted">Local activity now; cloud activity and Realtime subscription when V15 backend is provisioned.</div></div><div class="toolbar"><button class="btn" id="v16RefreshFeed">Refresh cloud feed</button><button class="btn" id="v16ClearLocalFeed">Clear local feed</button></div></div><div id="v16Feed" class="v16-feed" style="margin-top:12px"></div>`;
main.appendChild(feed);

/* alignment audit */
const align=document.createElement('section');align.className='card';align.id='alignmentAuditCard';
align.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Learning Alignment Audit <span class="v6-badge">V16</span></h3><div class="muted">Cross-check objectives → activities → assessment evidence → SCORM scoring.</div></div><button class="btn primary" id="v16RunAlignment">Run alignment audit</button></div>
<div id="v16AlignmentSummary" class="v11-metric" style="margin-top:12px"></div><div id="v16Alignment" style="margin-top:12px"></div>`;
main.appendChild(align);

/* conflict resolver */
const merge=document.createElement('section');merge.className='card';merge.id='fieldConflictCard';
merge.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Field-Level Conflict Resolver <span class="v6-badge">V16</span></h3><div class="muted">Compare important top-level project domains and selectively keep local or cloud values.</div></div><button class="btn primary" id="v16LoadConflict">Load cloud comparison</button></div><div id="v16Conflicts" style="margin-top:12px"><div class="muted">No cloud comparison loaded.</div></div>`;
main.appendChild(merge);

const nav=document.querySelector('aside .nav');if(nav){[['📍 3D Review Pins',pins],['📰 Activity Feed',feed],['🎯 Alignment Audit',align],['🧩 Conflict Resolver',merge]].forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)})}

function selectedObject(){
 const active=document.querySelector('#v6Tree .v6-tree-item.active');
 if(active){const id=String(active.dataset.id);return (state.objects||[]).find(o=>String(o.id)===id)}
 return null
}
function logLocal(type,data={}){
 const evt={id:'local-'+Date.now()+'-'+Math.random().toString(36).slice(2),event_type:type,event_data:data,actor:state.metadata?.author||'Local author',created_at:new Date().toISOString(),source:'local'};
 state.activityFeed.unshift(evt);state.activityFeed=state.activityFeed.slice(0,100);renderFeed();return evt
}
function openReviewComment(id){
 const x=(state.reviewComments||[]).find(r=>String(r.id)===String(id));if(!x)return;
 const target=document.getElementById('reviewGovernanceCard');target?.scrollIntoView({behavior:'smooth'});setTimeout(()=>alert((x.severity||'note').toUpperCase()+': '+x.text),250)
}
function renderPins(){
 const scene=document.querySelector('#v6Canvas a-scene');if(scene)scene.querySelectorAll('[data-v16-review-pin]').forEach(x=>x.remove());
 const items=(state.reviewComments||[]).filter(r=>r.status!=='resolved'&&r.anchorType==='object');
 if(scene){items.forEach((r,i)=>{const o=(state.objects||[]).find(x=>String(x.id)===String(r.anchorId));if(!o)return;const pin=document.createElement('a-entity');pin.dataset.v16ReviewPin=String(r.id);pin.setAttribute('position',(Number(o.x||0)+.45)+' '+(Number(o.y||0)+1.4)+' '+Number(o.z||0));const sphere=document.createElement('a-sphere');sphere.setAttribute('radius','.14');sphere.setAttribute('color',r.severity==='blocker'?'#ef4444':r.severity==='warning'?'#f59e0b':'#38bdf8');sphere.classList.add('clickable');sphere.addEventListener('click',ev=>{ev.stopPropagation();openReviewComment(r.id)});const label=document.createElement('a-text');label.setAttribute('value',String(i+1));label.setAttribute('align','center');label.setAttribute('width','2');label.setAttribute('position','0 .01 .16');pin.appendChild(sphere);pin.appendChild(label);scene.appendChild(pin)})}
 Q('v16PinList').innerHTML=items.length?items.map((r,i)=>'<div class="v16-pin"><span class="v16-badge">#'+(i+1)+' '+esc16(r.severity)+'</span><b style="display:block;margin-top:5px">'+esc16(r.anchorLabel||r.anchorId)+'</b><small>'+esc16(r.text)+'</small></div>').join(''):'<div class="muted">No open object-anchored review comments.</div>'
}
Q('v16RefreshPins').onclick=renderPins;
Q('v16AddPin').onclick=()=>{const o=selectedObject(),text=Q('v16PinText').value.trim();if(!o)return alert('Select an object in the V6 hierarchy first.');if(!text)return alert('Enter a review comment.');state.reviewComments=state.reviewComments||[];state.reviewComments.push({id:'review-'+Date.now(),severity:Q('v16PinSeverity').value,anchorType:'object',anchorId:String(o.id),anchorLabel:o.label||o.type,author:state.metadata?.author||'Reviewer',text,status:'open',createdAt:new Date().toISOString()});Q('v16PinText').value='';renderPins();if(typeof renderComments==='function')renderComments();logLocal('review_pin_created',{objectId:o.id,label:o.label||o.type,severity:Q('v16PinSeverity').value})};

/* activity feed */
let activityChannel=null;
function cloud(){return window.VRCloudV13}
function cl(){return cloud()?.getClient?.()||null}
function usr(){return cloud()?.getUser?.()||null}
function pid(){return state.metadata?.cloudProjectId||''}
function renderFeed(){
 const arr=state.activityFeed||[];Q('v16Feed').innerHTML=arr.length?arr.map(e=>'<div class="v16-event"><b>'+esc16(e.event_type||'activity')+'</b><small>'+esc16(e.actor||e.actor_id||'User')+' · '+esc16(new Date(e.created_at).toLocaleString())+'</small><small>'+esc16(JSON.stringify(e.event_data||{}))+'</small></div>').join(''):'<div class="muted">No activity events.</div>'
}
async function fetchFeed(){
 const c=cl(),p=pid();if(!c||!usr()||!p)return renderFeed();
 const {data,error}=await c.from('xr_activity_events').select('id,event_type,event_data,actor_id,created_at').eq('project_id',p).order('created_at',{ascending:false}).limit(50);if(error){console.warn(error);return renderFeed()}
 const cloudRows=(data||[]).map(x=>({...x,source:'cloud'}));const locals=(state.activityFeed||[]).filter(x=>x.source==='local');state.activityFeed=[...cloudRows,...locals].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,100);renderFeed()
}
async function logCloud(type,data={}){
 const evt=logLocal(type,data);const c=cl(),u=usr(),p=pid(),w=cloud()?.getWorkspaceId?.();if(!c||!u||!p||!w)return;
 const {data:row,error}=await c.from('xr_activity_events').insert({workspace_id:w,project_id:p,actor_id:u.id,event_type:type,event_data:data}).select('id,actor_id,created_at').single();if(error){console.warn('Cloud activity log skipped',error);return}
 evt.source='cloud-confirmed';evt.cloudId=row.id;evt.actor_id=row.actor_id;evt.created_at=row.created_at;renderFeed()
}
async function startActivityRealtime(){
 const c=cl(),p=pid();if(!c||!usr()||!p||activityChannel)return;
 activityChannel=c.channel('xr-activity:'+p).on('postgres_changes',{event:'INSERT',schema:'public',table:'xr_activity_events',filter:'project_id=eq.'+p},payload=>{const x=payload.new;state.activityFeed.unshift({...x,source:'cloud'});state.activityFeed=state.activityFeed.slice(0,100);renderFeed()}).subscribe()
}
Q('v16RefreshFeed').onclick=async()=>{await fetchFeed();await startActivityRealtime()};
Q('v16ClearLocalFeed').onclick=()=>{state.activityFeed=(state.activityFeed||[]).filter(x=>x.source==='cloud');renderFeed()};

/* alignment */
function words(s){return new Set(String(s||'').toLowerCase().replace(/[^a-z0-9áéíóúñü ]/gi,' ').split(/\s+/).filter(x=>x.length>3))}
function overlap(a,b){const A=words(a),B=words(b);if(!A.size||!B.size)return 0;let hit=0;A.forEach(x=>{if(B.has(x))hit++});return hit/Math.max(1,Math.min(A.size,B.size))}
function objectiveText(o){return typeof o==='string'?o:(o?.text||o?.title||JSON.stringify(o))}
function runAlignment(){
 const objectives=state.objectives||[],stations=state.stations||[],questions=state.questions||[],rules=state.rules||[];
 const rows=[];objectives.forEach((obj,i)=>{const text=objectiveText(obj);let bestStation=null,bestS=0;stations.forEach(s=>{const sc=overlap(text,(s.name||'')+' '+(s.content||''));if(sc>bestS){bestS=sc;bestStation=s}});let bestQ=null,bestQv=0;questions.forEach(q=>{const sc=overlap(text,(q.prompt||q.question||q.text||'')+' '+(q.feedback||''));if(sc>bestQv){bestQv=sc;bestQ=q}});const scoreEvidence=!!bestQ||stations.some(s=>s.required&&overlap(text,(s.name||'')+' '+(s.content||''))>.05);rows.push({i,text,bestStation,bestS,bestQ,bestQv,scoreEvidence})});
 const covered=rows.filter(r=>r.bestS>.05).length,assessed=rows.filter(r=>r.bestQv>.05||r.scoreEvidence).length,totalScore=(stations||[]).reduce((a,s)=>a+Number(s.points||0),0)+(questions||[]).reduce((a,q)=>a+Number(q.points||0),0);
 Q('v16AlignmentSummary').innerHTML='<div><b>'+objectives.length+'</b><small>Objectives</small></div><div><b>'+covered+'/'+objectives.length+'</b><small>Activity coverage</small></div><div><b>'+assessed+'/'+objectives.length+'</b><small>Assessment evidence</small></div><div><b>'+totalScore+'</b><small>Configured score weight</small></div>';
 Q('v16Alignment').innerHTML=objectives.length?'<div class="v16-align"><div><b>Objective</b></div><div><b>Activity</b></div><div><b>Assessment</b></div><div><b>SCORM evidence</b></div>'+rows.map(r=>'<div>'+esc16(r.text)+'</div><div class="'+(r.bestS>.05?'v16-ok':'v16-warn')+'">'+esc16(r.bestStation?.name||'No clear match')+'</div><div class="'+(r.bestQv>.05?'v16-ok':'v16-warn')+'">'+esc16(r.bestQ?.prompt||r.bestQ?.question||r.bestQ?.text||'No direct question match')+'</div><div class="'+(r.scoreEvidence?'v16-ok':'v16-bad')+'">'+(r.scoreEvidence?'Evidence present':'No scored evidence')+'</div>').join('')+'</div>':'<div class="muted">No learning objectives are defined.</div>';
 return {rows,totalScore,covered,assessed,ruleCount:rules.filter(r=>r.enabled).length}
}
Q('v16RunAlignment').onclick=()=>{const result=runAlignment();logCloud('alignment_audit_run',{objectives:result.rows.length,covered:result.covered,assessed:result.assessed,scoreWeight:result.totalScore})};

/* field-level conflict resolver */
const domains=['title','objectives','instructions','scenes','stations','questions','objects','variables','rules','npcs','mediaMeta','reviewComments','reviewTasks','reviewApprovals'];
let remoteState=null;
function short(v){const s=JSON.stringify(v??null,null,2);return s.length>700?s.slice(0,700)+'\n…':s}
async function loadConflict(){
 const c=cl(),p=pid();if(!c||!usr()||!p)return alert('Connect, sign in and open/sync a cloud project first.');const {data,error}=await c.from('xr_projects').select('revision,updated_at,project_data').eq('id',p).single();if(error)return alert(error.message);remoteState=data.project_data||{};
 const diffs=domains.filter(k=>JSON.stringify(state[k]??null)!==JSON.stringify(remoteState[k]??null));
 Q('v16Conflicts').innerHTML=diffs.length?'<div class="v16-conflict"><b>Domain</b><b>Local</b><b>Cloud</b><b>Resolution</b></div>'+diffs.map(k=>'<div class="v16-conflict"><div><b>'+esc16(k)+'</b></div><pre>'+esc16(short(state[k]))+'</pre><pre>'+esc16(short(remoteState[k]))+'</pre><div><button class="btn" data-keep-local="'+k+'">Keep local</button><button class="btn" data-use-cloud="'+k+'" style="margin-top:5px">Use cloud</button></div></div>').join(''):'<div class="notice">No differences detected across the audited top-level domains.</div>';
 Q('v16Conflicts').querySelectorAll('[data-use-cloud]').forEach(b=>b.onclick=()=>{const k=b.dataset.useCloud;state[k]=JSON.parse(JSON.stringify(remoteState[k]));if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render();logCloud('conflict_domain_resolved',{domain:k,resolution:'cloud'})});
 Q('v16Conflicts').querySelectorAll('[data-keep-local]').forEach(b=>b.onclick=()=>{logCloud('conflict_domain_resolved',{domain:b.dataset.keepLocal,resolution:'local'});b.textContent='Local selected';b.disabled=true});
}
Q('v16LoadConflict').onclick=loadConflict;

/* audit */
const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v16Checks(){
 const out=[],objectives=state.objectives||[],stations=state.stations||[],questions=state.questions||[];
 let missingActivity=0,missingAssessment=0;
 objectives.forEach(o=>{const t=objectiveText(o);if(!stations.some(s=>overlap(t,(s.name||'')+' '+(s.content||''))>.05))missingActivity++;if(!questions.some(q=>overlap(t,(q.prompt||q.question||q.text||''))>.05)&&!stations.some(s=>s.required&&overlap(t,(s.name||'')+' '+(s.content||''))>.05))missingAssessment++});
 out.push({level:!objectives.length?'warn':missingActivity?'warn':'pass',name:'Objective-to-activity alignment',detail:!objectives.length?'No learning objectives are defined.':missingActivity?missingActivity+' objective(s) have no clear matching learning activity.':'All objectives have at least one probable activity match.'});
 out.push({level:!objectives.length?'warn':missingAssessment?'warn':'pass',name:'Objective-to-assessment alignment',detail:!objectives.length?'No objectives are available for assessment alignment.':missingAssessment?missingAssessment+' objective(s) lack clear assessed/scored evidence.':'All objectives have probable assessment/scoring evidence.'});
 const score=(stations||[]).reduce((a,s)=>a+Number(s.points||0),0)+(questions||[]).reduce((a,q)=>a+Number(q.points||0),0);out.push({level:score===100?'pass':'warn',name:'SCORM score model alignment',detail:score===100?'Configured station + question score weight totals 100.':'Configured station + question score weight totals '+score+'; review score semantics.'});
 const pinsOpen=(state.reviewComments||[]).filter(r=>r.status!=='resolved'&&r.anchorType==='object'),orphan=pinsOpen.filter(r=>!(state.objects||[]).some(o=>String(o.id)===String(r.anchorId)));out.push({level:orphan.length?'fail':'pass',name:'3D review pin integrity',detail:orphan.length?orphan.length+' object review pin(s) reference deleted objects.':'Open 3D review pins resolve to existing objects.'});
 const cloudBacklog=(state.activityFeed||[]).filter(x=>x.source==='local').length;out.push({level:pid()&&cloudBacklog?'warn':'pass',name:'Activity feed synchronization',detail:pid()&&cloudBacklog?cloudBacklog+' local activity event(s) are not confirmed in cloud.':'No local activity-feed backlog detected.'});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v16Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v16Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(Q('auditPass'))Q('auditPass').textContent=p;if(Q('auditWarn'))Q('auditWarn').textContent=w;if(Q('auditFail'))Q('auditFail').textContent=f;if(Q('auditResults'))Q('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station" style="'+(x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc16(x.name)+'</b><div class="muted">'+esc16(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

const oldRender=render;
render=function(){oldRender();ensureV16();setTimeout(()=>{renderPins();renderFeed();runAlignment()},0)};
renderPins();renderFeed();runAlignment();
window.addEventListener('vrcloud-ready',()=>{fetchFeed();startActivityRealtime()});
})();