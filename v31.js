(()=>{
const T31=id=>document.getElementById(id);
const esc31=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV31(){state.version=31;state.performanceTasks=state.performanceTasks||[];state.v31=state.v31||{enabled:true}}
ensureV31();
const main=document.querySelector('main.workspace');if(!main)return;

const card=document.createElement('section');card.className='card';card.id='authenticPerformanceTasksCard';
card.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Authentic Performance Tasks <span class="v6-badge">V31</span></h3>
 <div class="muted">Assess what learners do inside the 3D environment: sequence, classify, decide and inspect—not only what they answer on a quiz.</div></div>
 <button class="btn" id="v31Preview">Preview Student Performance</button>
</div>
<div class="v31-grid" style="margin-top:14px">
 <div class="v31-panel v31-editor">
  <div class="row">
   <div class="field"><label>Scene</label><select id="v31Scene"></select></div>
   <div class="field"><label>Learning objective</label><select id="v31Objective"></select></div>
  </div>
  <div class="row">
   <div class="field"><label>Performance type</label><select id="v31Type">
    <option value="sequence">Procedure / sequence</option>
    <option value="classify">Classification</option>
    <option value="decision">Spatial decision</option>
    <option value="inspect">Inspection checklist</option>
   </select></div>
   <div class="field"><label>Points</label><input id="v31Points" type="number" min="0" max="100"></div>
  </div>
  <div class="field"><label>Task title</label><input id="v31Title" placeholder="Authentic performance task"></div>
  <div class="field"><label>Instructions</label><textarea id="v31Instructions" placeholder="Explain what the learner must do and what counts as successful performance."></textarea></div>
  <div class="field"><label id="v31ItemsLabel">Steps — one per line, in the correct order</label><textarea id="v31Items" placeholder="Inspect the evidence&#10;Verify the condition&#10;Select the correct action"></textarea></div>
  <div class="v31-note" id="v31SyntaxHelp"></div>
  <button class="btn primary" id="v31Create" style="width:100%;margin-top:10px">Create Performance Task in 3D</button>
 </div>
 <div class="v31-panel">
  <h4 style="margin-top:0">Performance Readiness</h4>
  <div id="v31Metrics" class="v31-metrics"></div>
  <div id="v31QA" style="margin-top:10px"></div>
 </div>
</div>
<div class="v31-panel" style="margin-top:14px"><h4 style="margin-top:0">Authored Performance Tasks</h4><div id="v31Tasks"></div></div>`;
const anchor=main.querySelector('#learningEvidenceRecordCard');
if(anchor)anchor.insertAdjacentElement('afterend',card);else main.appendChild(card);

const nav=document.querySelector('aside .nav');
if(nav){const b=document.createElement('button');b.innerHTML='🎯 Authentic Performance <span class="badge">V31</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.insertBefore(b,nav.children[5]||null)}

function uid(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6)}
function objectives(){return (state.objectives||[]).map((o,i)=>({index:i,text:typeof o==='string'?o:(o.text||o.title||('Objective '+(i+1)))}))}
function scoreWeight(){return (state.stations||[]).reduce((a,s)=>a+Number(s.points||0),0)+(state.questions||[]).reduce((a,q)=>a+Number(q.points||0),0)}
function populate(){
 T31('v31Scene').innerHTML=(state.scenes||[]).map(s=>'<option value="'+esc31(String(s.id))+'">'+esc31(s.name||String(s.id))+'</option>').join('');
 if(state.activeSceneId!=null)T31('v31Scene').value=String(state.activeSceneId);
 T31('v31Objective').innerHTML=objectives().map(o=>'<option value="'+o.index+'">'+esc31('Objective '+(o.index+1)+' · '+o.text)+'</option>').join('');
 const remain=Math.max(0,100-scoreWeight());if(!T31('v31Points').dataset.touched)T31('v31Points').value=Math.min(25,remain);
 renderHelp()
}
T31('v31Points').oninput=()=>T31('v31Points').dataset.touched='1';
function renderHelp(){
 const type=T31('v31Type').value,label=T31('v31ItemsLabel'),help=T31('v31SyntaxHelp');
 if(type==='sequence'){label.textContent='Steps — one per line, in the correct order';help.textContent='Learner must select the spatial step objects in the authored order. Incorrect selections do not complete the task.'}
 if(type==='classify'){label.textContent='Items — use “Item | Category” on each line';help.textContent='Example: Phishing email | Threat. Learner opens each spatial item and assigns it to the correct category.'}
 if(type==='decision'){label.textContent='Options — use “Option | correct” for the correct choice';help.textContent='Exactly one option should end with | correct. Learner selects the best spatial decision; incorrect choices give feedback and allow retry.'}
 if(type==='inspect'){label.textContent='Evidence items — one per line';help.textContent='Learner must inspect every required spatial evidence object. Order does not matter.'}
}
T31('v31Type').onchange=renderHelp;

function parseItems(type,raw){
 const lines=raw.split('\n').map(x=>x.trim()).filter(Boolean);
 if(type==='classify')return lines.map((line,i)=>{const p=line.split('|').map(x=>x.trim());return{id:uid('v31-item'),label:p[0]||('Item '+(i+1)),category:p[1]||''}});
 if(type==='decision')return lines.map((line,i)=>{const p=line.split('|').map(x=>x.trim());return{id:uid('v31-item'),label:p[0]||('Option '+(i+1)),correct:/^(correct|yes|true|1|correcta?)$/i.test(p[1]||'')}});
 return lines.map((line,i)=>({id:uid('v31-item'),label:line,order:i}))
}
function validateInput(type,items){
 if(items.length<2)return 'Add at least two task items.';
 if(type==='classify'&&items.some(x=>!x.category))return 'Every classification item needs a category using Item | Category.';
 if(type==='decision'&&items.filter(x=>x.correct).length!==1)return 'A decision task requires exactly one option marked | correct.';
 return''
}
function place(i,n){const radius=Math.max(3,Math.min(6,2+n*.5)),a=-Math.PI/2+(i/Math.max(1,n))*Math.PI*2;return{x:+(Math.cos(a)*radius).toFixed(2),y:1.1,z:+(-5+Math.sin(a)*radius*.55).toFixed(2)}}
function createTask(){
 const sceneId=T31('v31Scene').value,scene=(state.scenes||[]).find(s=>String(s.id)===String(sceneId));if(!scene)return alert('Choose a valid scene.');
 const type=T31('v31Type').value,items=parseItems(type,T31('v31Items').value),err=validateInput(type,items);if(err)return alert(err);
 const title=T31('v31Title').value.trim()||({sequence:'Procedure Sequence',classify:'Classification Task',decision:'Spatial Decision',inspect:'Inspection Checklist'}[type]);
 const instructions=T31('v31Instructions').value.trim()||'Complete the authentic performance task using the spatial evidence in this scene.';
 const objectiveIndex=Number(T31('v31Objective').value||0),points=Math.max(0,Math.min(100,Number(T31('v31Points').value)||0));
 const taskId=uid('v31-task'),stationId=uid('v31-station');
 const station={id:stationId,sceneId:scene.id,name:title,type:'performance',content:instructions,points,required:true,objectiveIndex,performanceTaskId:taskId,alt:'Authentic performance task: '+title,v31Generated:true};
 state.stations.push(station);
 const task={id:taskId,sceneId:scene.id,stationId,title,instructions,type,items,objectiveIndex,points,required:true,createdAt:new Date().toISOString(),reviewedAt:null,v31Generated:true};
 if(type==='classify')task.categories=Array.from(new Set(items.map(x=>x.category)));
 state.performanceTasks.push(task);
 items.forEach((item,i)=>{const p=place(i,items.length);state.objects.push({id:uid('v31-object'),sceneId:scene.id,type:'hotspot',label:item.label,...p,rotationY:0,scale:1,performanceTaskId:taskId,performanceItemId:item.id,performanceType:type,v31Generated:true})});
 state.activeSceneId=scene.id;
 if(typeof render==='function')render();renderAll();
 alert('Performance task created in the 3D scene. Preview the learner runtime and review the task before publication.')
}
T31('v31Create').onclick=createTask;T31('v31Preview').onclick=()=>T31('previewBtn')?.click();

function removeTask(id){
 const t=(state.performanceTasks||[]).find(x=>String(x.id)===String(id));if(!t)return;
 if(!confirm('Delete this performance task, its linked station and its generated spatial objects?'))return;
 state.performanceTasks=state.performanceTasks.filter(x=>String(x.id)!==String(id));
 state.stations=state.stations.filter(s=>String(s.performanceTaskId)!==String(id));
 state.objects=state.objects.filter(o=>String(o.performanceTaskId)!==String(id));
 if(typeof render==='function')render();renderAll()
}
function reviewTask(id){
 const t=(state.performanceTasks||[]).find(x=>String(x.id)===String(id));if(!t)return;t.reviewedAt=new Date().toISOString();t.reviewedBy=state.ownership?.owner||'Instructor';renderAll()
}
function renderTasks(){
 const box=T31('v31Tasks');const tasks=state.performanceTasks||[];
 box.innerHTML=tasks.length?tasks.map((t,i)=>{const sc=(state.scenes||[]).find(s=>String(s.id)===String(t.sceneId));return'<div class="v31-task"><span class="v31-icon">'+(i+1)+'</span><div><b>'+esc31(t.title)+'</b><div class="muted">'+esc31(t.type)+' · '+esc31(sc?.name||'Missing scene')+' · '+t.items.length+' item(s) · '+Number(t.points||0)+' pts</div><span class="v31-pill"><span class="v31-dot '+(t.reviewedAt?'':'warn')+'"></span>'+(t.reviewedAt?'Instructor-reviewed':'Needs review')+'</span></div><div class="toolbar"><button class="btn" data-v31review="'+esc31(String(t.id))+'">Review</button><button class="btn danger" data-v31delete="'+esc31(String(t.id))+'">Delete</button></div></div>'}).join(''):'<div class="muted">No authentic performance tasks have been authored yet.</div>';
 box.querySelectorAll('[data-v31review]').forEach(b=>b.onclick=()=>reviewTask(b.dataset.v31review));box.querySelectorAll('[data-v31delete]').forEach(b=>b.onclick=()=>removeTask(b.dataset.v31delete))
}
function checks(){
 const tasks=state.performanceTasks||[],scenes=state.scenes||[],stations=state.stations||[],objects=state.objects||[];
 const missingScene=tasks.filter(t=>!scenes.some(s=>String(s.id)===String(t.sceneId)));
 const missingStation=tasks.filter(t=>!stations.some(s=>String(s.id)===String(t.stationId)&&String(s.performanceTaskId)===String(t.id)));
 const missingItems=tasks.filter(t=>(t.items||[]).some(it=>!objects.some(o=>String(o.performanceTaskId)===String(t.id)&&String(o.performanceItemId)===String(it.id))));
 const badDecision=tasks.filter(t=>t.type==='decision'&&(t.items||[]).filter(x=>x.correct).length!==1);
 const badClass=tasks.filter(t=>t.type==='classify'&&(t.items||[]).some(x=>!x.category));
 const unreviewed=tasks.filter(t=>!t.reviewedAt);
 return[
  {level:tasks.length?'pass':'warn',name:'V31 authentic performance coverage',detail:tasks.length?tasks.length+' performance task(s) authored.':'No authentic performance task has been authored.'},
  {level:missingScene.length?'fail':'pass',name:'V31 task scene integrity',detail:missingScene.length?missingScene.length+' task(s) reference missing scenes.':'All performance tasks resolve to valid scenes.'},
  {level:missingStation.length?'fail':'pass',name:'V31 SCORM station linkage',detail:missingStation.length?missingStation.length+' task(s) lack their linked SCORM station.':'Every task is linked to a SCORM-scored station.'},
  {level:missingItems.length?'fail':'pass',name:'V31 spatial item integrity',detail:missingItems.length?missingItems.length+' task(s) are missing one or more spatial items.':'Every task item has a spatial object.'},
  {level:badDecision.length?'fail':'pass',name:'V31 decision key',detail:badDecision.length?badDecision.length+' decision task(s) do not have exactly one correct option.':'Decision tasks have a single correct option.'},
  {level:badClass.length?'fail':'pass',name:'V31 classification keys',detail:badClass.length?badClass.length+' classification task(s) have uncategorized items.':'Classification task keys are complete.'},
  {level:unreviewed.length?'warn':'pass',name:'V31 instructor review',detail:unreviewed.length?unreviewed.length+' performance task(s) require instructor review.':'All performance tasks are instructor-reviewed.'}
 ]
}
function renderQA(){const box=T31('v31QA');if(!box)return;box.innerHTML=checks().map(x=>'<div class="v31-task"><span class="v31-icon">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc31(x.name)+'</b><div class="muted">'+esc31(x.detail)+'</div></div><span class="v31-pill"><span class="v31-dot '+(x.level==='pass'?'':x.level)+'"></span>'+x.level.toUpperCase()+'</span></div>').join('')}
function renderMetrics(){const tasks=state.performanceTasks||[],pts=tasks.reduce((a,t)=>a+Number(t.points||0),0),reviewed=tasks.filter(t=>t.reviewedAt).length;T31('v31Metrics').innerHTML='<div><b>'+tasks.length+'</b><small>Tasks</small></div><div><b>'+tasks.reduce((a,t)=>a+(t.items||[]).length,0)+'</b><small>Spatial items</small></div><div><b>'+pts+'</b><small>Task points</small></div><div><b>'+reviewed+'</b><small>Reviewed</small></div>'}
function renderAll(){ensureV31();populate();renderTasks();renderMetrics();renderQA()}
renderAll();

/* Prevent manual station bypass in learner runtime and wire spatial task interactions. */
const prevRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=prevRuntime(preview);if(!(state.performanceTasks||[]).length)return html;
 const payload=JSON.stringify({tasks:state.performanceTasks||[]}).replace(/</g,'\\u003c');
 const styles=`<style>
 .v31r-status{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:78;background:#0f1d31f2;color:#fff;border:1px solid #ffffff3d;border-radius:999px;padding:9px 13px;font:600 12px system-ui;display:none;max-width:min(720px,calc(100vw - 32px));text-align:center}.v31r-status.show{display:block}
 .v31r-choice{display:block;width:100%;margin:7px 0;padding:10px;border-radius:8px;border:1px solid #ffffff44;background:#152640;color:#fff;text-align:left;cursor:pointer}
 </style>`;
 const body=`<div id="v31RuntimeStatus" class="v31r-status" role="status" aria-live="polite"></div>`;
 const script=`<script>
 (function(){
 const cfg=${payload},progress={};const statusBox=document.getElementById('v31RuntimeStatus');
 function taskById(id){return(cfg.tasks||[]).find(t=>String(t.id)===String(id))}
 function stationFor(t){return(project.stations||[]).find(s=>String(s.id)===String(t.stationId))}
 function stateFor(t){return progress[t.id]||(progress[t.id]={selected:[],assignments:{},attempts:0,complete:false})}
 function say(msg){if(statusBox){statusBox.textContent=msg;statusBox.classList.add('show');clearTimeout(statusBox._timer);statusBox._timer=setTimeout(()=>statusBox.classList.remove('show'),4200)}if(typeof announce==='function')announce(msg)}
 function save(){try{const raw=SCORM.get('cmi.suspend_data'),d=raw?JSON.parse(raw):{};d.v31tasks=progress;SCORM.set('cmi.suspend_data',JSON.stringify(d).slice(0,60000));SCORM.commit()}catch(e){}}
 function restore(){try{const raw=SCORM.get('cmi.suspend_data'),d=raw?JSON.parse(raw):{};Object.assign(progress,d.v31tasks||{})}catch(e){}}
 function responseText(t,p){if(t.type==='classify')return Object.entries(p.assignments||{}).map(([id,cat])=>{const it=t.items.find(x=>String(x.id)===String(id));return (it?.label||id)+' → '+cat}).join('; ');return(p.selected||[]).map(id=>t.items.find(x=>String(x.id)===String(id))?.label||id).join(' → ')}
 function completeTask(t){
  const p=stateFor(t);if(p.complete)return;p.complete=true;
  const s=stationFor(t);if(s&&!completed.has(s.id)){completed.add(s.id);if(window.V29Evidence?.recordPerformance)window.V29Evidence.recordPerformance(t,responseText(t,p),'completed',s);else if(window.V29Evidence?.recordStation)window.V29Evidence.recordStation(s);update();showScene(currentScene)}
  save();say('Performance task complete: '+t.title)
 }
 function classify(t,item){
  const p=stateFor(t),cats=t.categories||[];if(p.assignments[item.id])return say(item.label+' is already classified.');
  ui.mt.textContent=t.title;ui.mc.textContent='Classify: '+item.label;ui.choices.innerHTML='';ui.completeBtn.style.display='none';
  cats.forEach(cat=>{const b=document.createElement('button');b.className='v31r-choice';b.textContent=cat;b.onclick=()=>{p.attempts++;if(String(cat)===String(item.category)){p.assignments[item.id]=cat;say('Correct classification: '+item.label+' → '+cat);if(Object.keys(p.assignments).length===(t.items||[]).length)completeTask(t);save();ui.modal.style.display='none'}else say('That category does not match the authored key. Try again.')};ui.choices.appendChild(b)});
  ui.modal.style.display='block';ui.modal.focus?.()
 }
 function activate(t,item){
  const p=stateFor(t);if(p.complete)return say('This performance task is already complete.');
  p.attempts++;
  if(t.type==='sequence'){const expected=(t.items||[])[p.selected.length];if(String(expected?.id)===String(item.id)){p.selected.push(item.id);say('Correct step '+p.selected.length+' of '+t.items.length+': '+item.label);if(p.selected.length===t.items.length)completeTask(t)}else say('That is not the next authored step. Review the procedure and try again.')}
  else if(t.type==='inspect'){if(!p.selected.some(id=>String(id)===String(item.id)))p.selected.push(item.id);say('Evidence inspected: '+item.label+' ('+p.selected.length+'/'+t.items.length+')');if(p.selected.length===t.items.length)completeTask(t)}
  else if(t.type==='decision'){if(item.correct){p.selected=[item.id];say('Decision accepted: '+item.label);completeTask(t)}else{if(!p.selected.some(id=>String(id)===String(item.id)))p.selected.push(item.id);say('That decision does not meet the authored success criterion. Review the evidence and try again.')}}
  else if(t.type==='classify')return classify(t,item);
  save()
 }
 function wire(){
  document.querySelectorAll('[data-object-id]').forEach(el=>{if(el.dataset.v31wired)return;const o=(project.objects||[]).find(x=>String(x.id)===String(el.dataset.objectId));if(!o?.performanceTaskId)return;const t=taskById(o.performanceTaskId),item=t?.items?.find(x=>String(x.id)===String(o.performanceItemId));if(!t||!item)return;el.dataset.v31wired='1';el.addEventListener('click',()=>activate(t,item))})
 }
 restore();
 const previousOpen=openStation;openStation=function(s){if(s?.performanceTaskId){const t=taskById(s.performanceTaskId);if(t){currentStation=s;ui.mt.textContent=t.title;ui.mc.textContent=t.instructions+'\n\nInteract with the spatial task objects in this scene to complete the performance task.';ui.choices.innerHTML='';ui.completeBtn.style.display='none';ui.modal.style.display='block';ui.modal.focus?.();return}}return previousOpen(s)};
 const previousPersist=persist;persist=function(){const r=previousPersist();save();return r};
 const oldShow=showScene;showScene=function(id){const r=oldShow(id);setTimeout(wire,80);return r};
 setInterval(wire,600);setTimeout(wire,180);window.V31Runtime={progress,taskById,completeTask,wire}
 })();
 <\/script>`;
 html=html.replace('</head>',styles+'</head>');html=html.replace('<a-scene id="scene"',body+'<a-scene id="scene"');return html.replace('</body></html>',script+'</body></html>')
};

const oldValidate=validateProject;
validateProject=function(){const issues=oldValidate(),unreviewed=(state.performanceTasks||[]).filter(t=>!t.reviewedAt);if(unreviewed.length)issues.push('Review all V31 authentic performance tasks before final SCORM export.');return [...new Set(issues)]};

const oldChecks=window.VRClassroomAudit?.checks,oldRun=window.VRClassroomAudit?.run;
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=checks(),all=[...base,...extras],p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(T31('auditPass'))T31('auditPass').textContent=p;if(T31('auditWarn'))T31('auditWarn').textContent=w;if(T31('auditFail'))T31('auditFail').textContent=f;if(T31('auditResults'))T31('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc31(x.name)+'</b><div class="muted">'+esc31(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};
const oldRender=render;render=function(){oldRender();ensureV31();setTimeout(renderAll,0)};
})();