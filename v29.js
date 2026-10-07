(()=>{
const E29=id=>document.getElementById(id);
const esc29=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV29(){state.version=29;state.v29=state.v29||{enabled:true,reportInteractions:true,learnerViewer:true,allowDownload:true,maxRecords:40,responseLimit:500}}
ensureV29();
const main=document.querySelector('main.workspace');if(!main)return;

const card=document.createElement('section');card.className='card';card.id='learningEvidenceRecordCard';
card.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Learning Evidence Record <span class="v6-badge">V29</span></h3>
 <div class="muted">Preserve objective-level learner evidence and report question interactions to Blackboard SCORM when the LMS accepts them.</div></div>
 <button class="btn" id="v29Preview">Preview Evidence Runtime</button>
</div>
<div class="v29-grid" style="margin-top:14px">
 <div class="v29-panel">
  <div class="field"><label>Evidence recording</label><select id="v29Enabled"><option value="true">Enabled</option><option value="false">Disabled</option></select></div>
  <div class="field"><label>SCORM 2004 interaction reporting</label><select id="v29Interactions"><option value="true">Attempt cmi.interactions reporting</option><option value="false">Use suspend_data evidence only</option></select></div>
  <div class="field"><label>Learner Evidence viewer</label><select id="v29Viewer"><option value="true">Enabled</option><option value="false">Hidden</option></select></div>
  <div class="field"><label>Learner JSON download</label><select id="v29Download"><option value="true">Allowed</option><option value="false">Disabled</option></select></div>
  <div class="row"><div class="field"><label>Maximum evidence records</label><input id="v29Max" type="number" min="10" max="80"></div><div class="field"><label>Response characters per record</label><input id="v29Limit" type="number" min="100" max="1000"></div></div>
  <div class="v29-note">The app does not transmit evidence to an external service. Blackboard/LMS may associate SCORM data with the signed-in learner. Evidence stored in <code>suspend_data</code> is compacted to protect resume-state capacity.</div>
 </div>
 <div class="v29-panel">
  <h4 style="margin-top:0">Evidence Readiness</h4>
  <div id="v29Metrics" class="v29-metrics"></div>
  <div id="v29Readiness" style="margin-top:10px"></div>
 </div>
</div>
<div class="v29-panel" style="margin-top:14px"><h4 style="margin-top:0">Assessment → Objective Evidence Map</h4><div id="v29Map"></div></div>`;
const anchor=main.querySelector('#learnerMissionRuntimeCard');
if(anchor)anchor.insertAdjacentElement('afterend',card);else main.appendChild(card);

const nav=document.querySelector('aside .nav');
if(nav){const b=document.createElement('button');b.innerHTML='📑 Learning Evidence Record <span class="badge">V29</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.insertBefore(b,nav.children[4]||null)}

E29('v29Enabled').value=String(state.v29.enabled!==false);
E29('v29Interactions').value=String(state.v29.reportInteractions!==false);
E29('v29Viewer').value=String(state.v29.learnerViewer!==false);
E29('v29Download').value=String(state.v29.allowDownload!==false);
E29('v29Max').value=Number(state.v29.maxRecords||40);
E29('v29Limit').value=Number(state.v29.responseLimit||500);
function bindBool(id,key){E29(id).onchange=()=>{state.v29[key]=E29(id).value==='true';renderAuthoring()}}
bindBool('v29Enabled','enabled');bindBool('v29Interactions','reportInteractions');bindBool('v29Viewer','learnerViewer');bindBool('v29Download','allowDownload');
E29('v29Max').onchange=()=>{state.v29.maxRecords=Math.max(10,Math.min(80,Number(E29('v29Max').value)||40));E29('v29Max').value=state.v29.maxRecords;renderAuthoring()};
E29('v29Limit').onchange=()=>{state.v29.responseLimit=Math.max(100,Math.min(1000,Number(E29('v29Limit').value)||500));E29('v29Limit').value=state.v29.responseLimit;renderAuthoring()};
E29('v29Preview').onclick=()=>E29('previewBtn')?.click();

function objectiveForQuestion(q){
 if(q.objectiveIndex!=null)return Number(q.objectiveIndex);
 const s=(state.stations||[]).find(x=>String(x.id)===String(q.stationId));if(s?.objectiveIndex!=null)return Number(s.objectiveIndex);
 const comp=(state.competencies||[]).find(c=>(c.questionIds||[]).some(id=>String(id)===String(q.id))||(c.stationIds||[]).some(id=>String(id)===String(q.stationId)));
 return comp?.objectiveIndexes?.length?Number(comp.objectiveIndexes[0]):null
}
function objectiveText(index){const o=(state.objectives||[])[index];return typeof o==='string'?o:(o?.text||o?.title||('Objective '+(index+1)))}
function readiness(){
 const qs=state.questions||[],mapped=qs.filter(q=>objectiveForQuestion(q)!=null),orphan=qs.filter(q=>!(state.stations||[]).some(s=>String(s.id)===String(q.stationId))),unmapped=qs.filter(q=>objectiveForQuestion(q)==null);
 const estimate=Number(state.v29.maxRecords||40)*(Number(state.v29.responseLimit||500)+180);
 return{qs,mapped,orphan,unmapped,estimate}
}
function renderAuthoring(){
 const r=readiness();
 E29('v29Metrics').innerHTML='<div><b>'+r.qs.length+'</b><small>Questions</small></div><div><b>'+r.mapped.length+'</b><small>Objective mapped</small></div><div><b>'+r.unmapped.length+'</b><small>Unmapped</small></div><div><b>'+Math.round(r.estimate/1024)+' KB</b><small>Worst-case evidence</small></div>';
 const issues=[];if(!state.v29.enabled)issues.push('Evidence recording is disabled.');if(r.orphan.length)issues.push(r.orphan.length+' question(s) reference missing stations.');if(r.unmapped.length)issues.push(r.unmapped.length+' question(s) are not mapped to a learning objective.');if(r.estimate>30000)issues.push('Configured evidence budget is high; runtime compaction will be used.');
 E29('v29Readiness').innerHTML=issues.length?'<span class="v29-pill"><span class="v29-dot warn"></span>'+esc29(issues.join(' '))+'</span>':'<span class="v29-pill"><span class="v29-dot"></span>Evidence model is ready for the learner runtime.</span>';
 E29('v29Map').innerHTML=r.qs.length?r.qs.map((q,i)=>{const oi=objectiveForQuestion(q),s=(state.stations||[]).find(x=>String(x.id)===String(q.stationId));return'<div class="v29-row"><span class="v29-num">'+(i+1)+'</span><div><b>'+esc29(q.prompt||('Question '+(i+1)))+'</b><div class="muted">'+esc29(s?.name||'Missing station')+'</div></div><div>'+esc29(oi==null?'No objective mapping':objectiveText(oi))+'</div><div><span class="v29-pill"><span class="v29-dot '+(oi==null?'warn':'')+'"></span>'+esc29(q.type||'question')+'</span></div></div>'}).join(''):'<div class="muted">No assessment questions are configured yet.</div>'
}
renderAuthoring();

/* Runtime evidence layer */
const prevRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=prevRuntime(preview);if(!state.v29?.enabled)return html;
 const payload=JSON.stringify({settings:state.v29||{},objectives:(state.objectives||[]).map((o,i)=>({index:i,text:typeof o==='string'?o:(o.text||o.title||('Objective '+(i+1)))})),questionObjective:(state.questions||[]).reduce((a,q)=>(a[String(q.id)]=objectiveForQuestion(q),a),{})}).replace(/</g,'\\u003c');
 const styles=`<style>
 #v29EvidenceBtn{position:fixed;left:16px;bottom:16px;z-index:75;border:1px solid #ffffff44;background:#0f1d31f2;color:#fff;border-radius:999px;padding:10px 14px;font:600 13px system-ui;cursor:pointer}
 #v29Evidence{position:fixed;left:16px;top:84px;bottom:68px;z-index:77;width:min(420px,calc(100vw - 32px));display:none;overflow:auto;background:#071225f7;color:#fff;border:1px solid #ffffff35;border-radius:14px;box-shadow:0 20px 60px #0008;padding:14px;font-family:system-ui}
 #v29Evidence.open{display:block}#v29Evidence h2{font-size:18px;margin:0 40px 4px 0}#v29EvidenceClose{position:absolute;right:12px;top:10px;background:transparent;border:0;color:#fff;font-size:22px;cursor:pointer}
 .v29r-item{border:1px solid #ffffff24;border-radius:10px;padding:10px;margin:8px 0;background:#ffffff08}.v29r-item b{display:block;font-size:13px}.v29r-item small{display:block;opacity:.75;margin-top:4px}.v29r-result{display:inline-block;margin-top:6px;border:1px solid #ffffff28;border-radius:999px;padding:3px 7px;font-size:10px}.v29r-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.v29r-actions button{border:1px solid #ffffff35;background:#142640;color:#fff;border-radius:8px;padding:8px 10px;cursor:pointer}.v29r-empty{opacity:.75;padding:12px 0}
 @media(max-width:640px){#v29Evidence{left:10px;right:10px;top:72px;bottom:62px;width:auto}}
 </style>`;
 const body=state.v29.learnerViewer!==false?`<button id="v29EvidenceBtn" aria-haspopup="dialog" aria-controls="v29Evidence">Evidence</button><aside id="v29Evidence" role="dialog" aria-modal="false" aria-label="Learning evidence record"><button id="v29EvidenceClose" aria-label="Close evidence record">×</button><h2>Learning Evidence Record</h2><div id="v29EvidenceBody"></div></aside>`:'';
 const script=`<script>
 (function(){
 const cfg=${payload},records=[];const maxRecords=Math.max(10,Math.min(80,Number(cfg.settings.maxRecords||40))),responseLimit=Math.max(100,Math.min(1000,Number(cfg.settings.responseLimit||500)));
 const button=document.getElementById('v29EvidenceBtn'),panel=document.getElementById('v29Evidence'),body=document.getElementById('v29EvidenceBody'),close=document.getElementById('v29EvidenceClose');
 function compactText(v,limit=responseLimit){return String(v??'').replace(/\\s+/g,' ').trim().slice(0,limit)}
 function objectiveIndex(q,s){const a=cfg.questionObjective[String(q?.id)];if(a!==null&&a!==undefined&&a!=='')return Number(a);if(s?.objectiveIndex!==undefined&&s?.objectiveIndex!==null)return Number(s.objectiveIndex);return null}
 function objectiveLabel(i){const o=(cfg.objectives||[]).find(x=>Number(x.index)===Number(i));return o?.text||((i===null||i===undefined)?'Unmapped evidence':'Objective '+(Number(i)+1))}
 function uniqueKey(type,id){return type+':'+String(id)}
 function hasRecord(type,id){const k=uniqueKey(type,id);return records.some(r=>r.key===k)}
 function scormIndex(){const raw=SCORM.get('cmi.interactions._count'),n=Number(raw);return Number.isFinite(n)&&n>=0?n:records.filter(r=>r.kind==='question'&&r.lmsReported).length}
 function reportInteraction(rec,q){
  if(cfg.settings.reportInteractions===false||!SCORM.available?.())return false;
  try{
   const n=scormIndex(),base='cmi.interactions.'+n,oid=rec.objectiveIndex;
   const okId=SCORM.set(base+'.id','q_'+String(q.id).replace(/[^A-Za-z0-9_-]/g,'_'));
   const okType=SCORM.set(base+'.type',q.type==='reflection'?'long-fill-in':'choice');
   SCORM.set(base+'.timestamp',rec.at);
   SCORM.set(base+'.weighting',Number(q.points||0));
   SCORM.set(base+'.learner_response',rec.response);
   SCORM.set(base+'.result',rec.result==='correct'?'correct':rec.result==='incorrect'?'incorrect':'neutral');
   SCORM.set(base+'.description',compactText(q.prompt,240));
   if(oid!==null&&oid!==undefined)SCORM.set(base+'.objectives.0.id','objective_'+(Number(oid)+1));
   SCORM.commit();
   return !!(okId&&okType)
  }catch(e){return false}
 }
 function store(rec){
  if(hasRecord(rec.kind,rec.sourceId))return;
  records.push(rec);while(records.length>maxRecords)records.shift();persistEvidence();render()
 }
 function recordQuestion(q,response,correct,s){
  if(!q||hasRecord('question',q.id))return;
  const oi=objectiveIndex(q,s),rec={key:uniqueKey('question',q.id),kind:'question',sourceId:q.id,stationId:s?.id??q.stationId,sceneId:s?.sceneId??null,objectiveIndex:oi,objective:objectiveLabel(oi),prompt:compactText(q.prompt,260),response:compactText(response),result:q.type==='reflection'?'submitted':(correct?'correct':'incorrect'),points:Number(q.points||0),at:new Date().toISOString(),lmsReported:false};
  rec.lmsReported=reportInteraction(rec,q);store(rec)
 }
 function recordStation(s){
  if(!s||hasRecord('station',s.id))return;const oi=s.objectiveIndex!=null?Number(s.objectiveIndex):null;
  store({key:uniqueKey('station',s.id),kind:'station',sourceId:s.id,stationId:s.id,sceneId:s.sceneId,objectiveIndex:oi,objective:objectiveLabel(oi),prompt:compactText(s.name,180),response:'Completed',result:'completed',points:Number(s.points||0),at:new Date().toISOString(),lmsReported:false})
 }
 function evidencePayload(){return records.slice(-maxRecords).map(r=>({...r,response:compactText(r.response)}))}
 function persistEvidence(){
  try{
   const old=persist;
   const raw=SCORM.get('cmi.suspend_data'),d=raw?JSON.parse(raw):{};
   d.v29evidence=evidencePayload();d.v29version=1;
   let out=JSON.stringify(d);
   if(out.length>59000){d.v29evidence=d.v29evidence.slice(-Math.min(25,maxRecords)).map(r=>({...r,response:compactText(r.response,180),prompt:compactText(r.prompt,140)}));out=JSON.stringify(d)}
   if(out.length<=60000){SCORM.set('cmi.suspend_data',out);SCORM.commit()}
  }catch(e){}
 }
 function restore(){
  try{const raw=SCORM.get('cmi.suspend_data'),d=raw?JSON.parse(raw):{};(d.v29evidence||[]).slice(-maxRecords).forEach(r=>records.push(r))}catch(e){}
 }
 function render(){
  if(!body)return;
  const questionCount=records.filter(r=>r.kind==='question').length,reported=records.filter(r=>r.kind==='question'&&r.lmsReported).length;
  const actions='<div class="v29r-actions">'+(cfg.settings.allowDownload!==false?'<button id="v29Download">Download JSON</button>':'')+'</div>';
  body.innerHTML='<div style="font-size:12px;opacity:.8">'+questionCount+' response record(s) · '+reported+' confirmed SCORM interaction(s)</div>'+actions+(records.length?records.slice().reverse().map(r=>'<div class="v29r-item"><b>'+safe(r.objective||'Learning evidence')+'</b><small>'+safe(r.prompt||r.kind)+'</small><div style="margin-top:6px">'+safe(r.response||'')+'</div><span class="v29r-result">'+safe(r.result)+(r.lmsReported?' · SCORM interaction':' · suspend data')+'</span></div>').join(''):'<div class="v29r-empty">No evidence has been recorded yet.</div>');
  const dl=document.getElementById('v29Download');if(dl)dl.onclick=download
 }
 function download(){
  const data={schema:'VR Classroom Studio Learning Evidence Record v1',activity:project.title,exportedAt:new Date().toISOString(),records:evidencePayload()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(project.title||'learning-evidence').replace(/[^a-z0-9]+/gi,'_')+'_evidence.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000)
 }
 restore();
 const previousPersist=persist;persist=function(){const r=previousPersist();persistEvidence();return r};
 const previousAnswer=answer;answer=function(q,ch,b,s,qs){const was=answered.has(q.id),ok=String(ch).trim().toLowerCase()===String(q.answer).trim().toLowerCase();const r=previousAnswer(q,ch,b,s,qs);if(!was&&answered.has(q.id))recordQuestion(q,ch,ok,s);return r};
 const previousOpen=openStation;openStation=function(s){const r=previousOpen(s);setTimeout(()=>{const qs=(project.questions||[]).filter(q=>String(q.stationId)===String(s.id)),children=[...ui.choices.children];qs.forEach((q,i)=>{if(q.type!=='reflection'||hasRecord('question',q.id))return;const wrap=children[i],ta=wrap?.querySelector('textarea'),submit=[...wrap?.querySelectorAll('button')||[]].find(x=>x.textContent.includes('Submit reflection'));if(submit&&ta&&!submit.dataset.v29Bound){submit.dataset.v29Bound='1';submit.addEventListener('click',()=>setTimeout(()=>{if(ta.value.trim()&&answered.has(q.id))recordQuestion(q,ta.value,true,s)},0))}})},0);return r};
 const previousFinish=finishStationIfReady;finishStationIfReady=function(s,qs){const before=completed.has(s.id);const r=previousFinish(s,qs);if(!before&&completed.has(s.id))recordStation(s);return r};
 const oldComplete=ui.completeBtn.onclick;ui.completeBtn.onclick=()=>{const s=currentStation,was=s?completed.has(s.id):false;const r=oldComplete();if(s&&!was&&completed.has(s.id))recordStation(s);return r};
 if(button&&panel&&close){button.onclick=()=>{panel.classList.toggle('open');if(panel.classList.contains('open'))close.focus()};close.onclick=()=>{panel.classList.remove('open');button.focus()};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('open'))close.click()})}
 render();window.V29Evidence={records:()=>records.slice(),recordQuestion,recordStation,download,persist:persistEvidence}
 })();
 <\/script>`;
 html=html.replace('</head>',styles+'</head>');if(body)html=html.replace('<a-scene id="scene"',body+'<a-scene id="scene"');return html.replace('</body></html>',script+'</body></html>')
};

function checks(){
 const r=readiness(),reflection=(state.questions||[]).filter(q=>q.type==='reflection').length,estimated=r.estimate;
 return[
  {level:state.v29.enabled?'pass':'warn',name:'V29 learning evidence recording',detail:state.v29.enabled?'Learning Evidence Record is enabled.':'Evidence recording is disabled.'},
  {level:r.orphan.length?'fail':'pass',name:'V29 assessment station integrity',detail:r.orphan.length?r.orphan.length+' question(s) reference missing stations.':'Every question resolves to a station.'},
  {level:r.unmapped.length?'warn':'pass',name:'V29 objective evidence mapping',detail:r.unmapped.length?r.unmapped.length+' question(s) cannot be attributed to a learning objective.':'Every question is attributable to a learning objective.'},
  {level:estimated>30000?'warn':'pass',name:'V29 suspend-data evidence budget',detail:'Configured worst-case evidence payload is approximately '+Math.round(estimated/1024)+' KB before runtime compaction.'},
  {level:state.v29.reportInteractions?'pass':'warn',name:'V29 SCORM interaction reporting',detail:state.v29.reportInteractions?'Runtime will attempt cmi.interactions reporting and retain suspend-data fallback.':'Only suspend-data evidence recording is enabled.'},
  {level:reflection?'warn':'pass',name:'V29 reflection evidence semantics',detail:reflection?reflection+' reflection response(s) may be preserved as learner evidence, but response quality is not automatically graded.':'No reflection evidence requires qualitative review.'},
  {level:'pass',name:'V29 privacy boundary',detail:'No external evidence endpoint is configured; records remain in the SCORM/LMS session unless the learner downloads a JSON copy.'}
 ]
}
const oldChecks=window.VRClassroomAudit?.checks,oldRun=window.VRClassroomAudit?.run;
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=checks(),all=[...base,...extras],p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(E29('auditPass'))E29('auditPass').textContent=p;if(E29('auditWarn'))E29('auditWarn').textContent=w;if(E29('auditFail'))E29('auditFail').textContent=f;if(E29('auditResults'))E29('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc29(x.name)+'</b><div class="muted">'+esc29(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};
const oldRender=render;render=function(){oldRender();ensureV29();setTimeout(renderAuthoring,0)};
})();