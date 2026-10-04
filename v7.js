(()=>{
const R=id=>document.getElementById(id);
function esc7(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function ensureV7(){state.version=7;state.variables=state.variables||{visited:'false',scoreGate:'0'};state.rules=state.rules||[]}
ensureV7();
const main=document.querySelector('main.workspace');if(!main)return;
const card=document.createElement('section');card.className='card';card.id='simulationEngineCard';
card.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Interaction & Simulation Engine <span class="v6-badge">V7</span></h3><div class="muted">Create conditional XR behavior with WHEN / IF / THEN rules.</div></div>
 <div class="toolbar"><button class="btn" id="v7AddHotspot">+ Hotspot</button><button class="btn" id="v7AddVariable">+ Variable</button><button class="btn primary" id="v7AddRule">+ Rule</button></div>
</div>
<div class="notice" style="margin-top:12px">Rules are stored inside the project and exported into the SCORM runtime. Use them for branching, gated portals, feedback and timed events.</div>
<h4>Project Variables</h4><div id="v7Vars" class="v7-vars"></div>
<h4>Simulation Rules</h4><div id="v7Rules"></div>`;
main.appendChild(card);
const nav=document.querySelector('aside .nav');if(nav){const b=document.createElement('button');b.innerHTML='⚡ Simulation Engine <span class="badge">V7</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.appendChild(b)}

function objOptions(){return (state.objects||[]).map(o=>`<option value="${esc7(String(o.id))}">${esc7(o.label||o.type)} [${esc7(o.type)}]</option>`).join('')}
function sceneOptions(){return (state.scenes||[]).map(s=>`<option value="${esc7(String(s.id))}">${esc7(s.name)}</option>`).join('')}
function stationOptions(){return (state.stations||[]).map(s=>`<option value="${esc7(String(s.id))}">${esc7(s.name)}</option>`).join('')}
function sourceOptions(event,current){
 if(event==='object-click')return objOptions();
 if(event==='scene-enter')return sceneOptions();
 if(event==='station-complete')return stationOptions();
 return '<option value="timer">Timer</option>'
}
function variableOptions(selected=''){return Object.keys(state.variables||{}).map(k=>`<option value="${esc7(k)}" ${k===selected?'selected':''}>${esc7(k)}</option>`).join('')}
function renderVars(){const b=R('v7Vars');if(!b)return;const keys=Object.keys(state.variables||{});b.innerHTML=keys.length?keys.map(k=>`<span class="v7-var"><b>${esc7(k)}</b> = ${esc7(state.variables[k])} <button data-varrm="${esc7(k)}" style="border:0;background:none;color:#fca5a5;cursor:pointer">×</button></span>`).join(''):'<span class="muted">No variables.</span>';b.querySelectorAll('[data-varrm]').forEach(x=>x.onclick=()=>{delete state.variables[x.dataset.varrm];renderVars();renderRules()})}
function defaultRule(){const firstObj=state.objects?.[0],firstScene=state.scenes?.[0];return{id:'rule-'+Date.now(),name:'New interaction',enabled:true,event:'object-click',sourceId:String(firstObj?.id||''),conditionEnabled:false,conditionVar:Object.keys(state.variables)[0]||'',operator:'equals',conditionValue:'true',action:'show-message',targetSceneId:String(firstScene?.id||''),setVar:Object.keys(state.variables)[0]||'',setValue:'true',message:'Interaction completed.',points:10,seconds:5,once:true}}
function flowText(r){let ev=r.event==='timer'?('after '+r.seconds+'s'):r.event+' → '+r.sourceId;let cond=r.conditionEnabled?(' IF '+r.conditionVar+' '+r.operator+' '+r.conditionValue):'';let act=r.action==='open-scene'?('open scene '+r.targetSceneId):r.action==='set-variable'?('set '+r.setVar+' = '+r.setValue):r.action==='add-score'?('add '+r.points+' points'):r.action==='unlock-portal'?('unlock portal '+r.sourceId):('message "'+r.message+'"');return '<span class="v7-event">WHEN '+esc7(ev)+'</span><span class="v7-condition">'+esc7(cond)+'</span> <span class="v7-action">THEN '+esc7(act)+'</span>'}
function renderRules(){
 const box=R('v7Rules');if(!box)return;
 if(!state.rules.length){box.innerHTML='<div class="muted">No simulation rules yet.</div>';return}
 box.innerHTML=state.rules.map((r,i)=>`<div class="v7-rule" data-ri="${i}">
  <div class="v7-rule-head"><div><b>${esc7(r.name)}</b> <span class="v7-status">${r.enabled?'ENABLED':'DISABLED'}</span></div><div class="toolbar"><button class="btn" data-toggle="${i}">${r.enabled?'Disable':'Enable'}</button><button class="btn danger" data-del="${i}">Delete</button></div></div>
  <div class="v7-flow">${flowText(r)}</div>
  <div class="v7-rule-grid">
   <div class="field"><label>Rule name</label><input data-f="name" value="${esc7(r.name)}"></div>
   <div class="field"><label>Event</label><select data-f="event"><option value="object-click" ${r.event==='object-click'?'selected':''}>Object clicked</option><option value="scene-enter" ${r.event==='scene-enter'?'selected':''}>Scene entered</option><option value="station-complete" ${r.event==='station-complete'?'selected':''}>Station completed</option><option value="timer" ${r.event==='timer'?'selected':''}>Timer</option></select></div>
   <div class="field"><label>Source</label><select data-f="sourceId">${sourceOptions(r.event,r.sourceId)}</select></div>
   <div class="field"><label>Timer seconds</label><input data-f="seconds" type="number" min="1" value="${Number(r.seconds||5)}"></div>
   <div class="field"><label>Condition</label><select data-f="conditionEnabled"><option value="false" ${!r.conditionEnabled?'selected':''}>Always</option><option value="true" ${r.conditionEnabled?'selected':''}>If variable condition passes</option></select></div>
   <div class="field"><label>Variable</label><select data-f="conditionVar">${variableOptions(r.conditionVar)}</select></div>
   <div class="field"><label>Operator</label><select data-f="operator"><option value="equals" ${r.operator==='equals'?'selected':''}>Equals</option><option value="not-equals" ${r.operator==='not-equals'?'selected':''}>Not equals</option><option value="greater" ${r.operator==='greater'?'selected':''}>Greater than</option><option value="less" ${r.operator==='less'?'selected':''}>Less than</option></select></div>
   <div class="field"><label>Condition value</label><input data-f="conditionValue" value="${esc7(r.conditionValue)}"></div>
   <div class="field"><label>Action</label><select data-f="action"><option value="show-message" ${r.action==='show-message'?'selected':''}>Show message</option><option value="open-scene" ${r.action==='open-scene'?'selected':''}>Open scene</option><option value="set-variable" ${r.action==='set-variable'?'selected':''}>Set variable</option><option value="add-score" ${r.action==='add-score'?'selected':''}>Add bonus score</option></select></div>
   <div class="field"><label>Target scene</label><select data-f="targetSceneId">${sceneOptions()}</select></div>
   <div class="field"><label>Set variable</label><select data-f="setVar">${variableOptions(r.setVar)}</select></div>
   <div class="field"><label>Set value</label><input data-f="setValue" value="${esc7(r.setValue)}"></div>
   <div class="field"><label>Message</label><input data-f="message" value="${esc7(r.message)}"></div>
   <div class="field"><label>Bonus points</label><input data-f="points" type="number" value="${Number(r.points||0)}"></div>
  </div>
 </div>`).join('');
 box.querySelectorAll('.v7-rule').forEach(el=>{const i=Number(el.dataset.ri),r=state.rules[i];el.querySelectorAll('[data-f]').forEach(inp=>{const f=inp.dataset.f;if(f==='sourceId')inp.value=String(r.sourceId||'');else if(f==='targetSceneId')inp.value=String(r.targetSceneId||'');inp.onchange=()=>{let v=inp.value;if(['seconds','points'].includes(f))v=Number(v)||0;if(f==='conditionEnabled')v=v==='true';r[f]=v;if(f==='event'){r.sourceId=r.event==='timer'?'timer':''}renderRules()}})});
 box.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{state.rules.splice(Number(b.dataset.del),1);renderRules()});
 box.querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{const rr=state.rules[Number(b.dataset.toggle)];rr.enabled=!rr.enabled;renderRules()})
}
R('v7AddVariable').onclick=()=>{const n=prompt('Variable name','completedIntro');if(!n)return;if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(n))return alert('Use letters, numbers and underscore; do not start with a number.');if(Object.prototype.hasOwnProperty.call(state.variables,n))return alert('That variable already exists.');const v=prompt('Initial value','false');state.variables[n]=v??'';renderVars();renderRules()};
R('v7AddRule').onclick=()=>{state.rules.push(defaultRule());renderRules()};
R('v7AddHotspot').onclick=()=>{const label=prompt('Hotspot label','Interactive Hotspot');if(!label)return;const o={id:Date.now(),sceneId:state.activeSceneId,type:'hotspot',label,x:0,y:1.5,z:-4,rotationY:0,scale:.45};state.objects.push(o);if(typeof render==='function')render();renderRules()};

const prevRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=prevRuntime(preview);
 if(!(state.rules||[]).length)return html;
 html=html.replace("e.setAttribute('position',(o.x||0)+' '+(o.y||1)+' '+(o.z||-5));","e.dataset.objectId=String(o.id);e.setAttribute('position',(o.x||0)+' '+(o.y||1)+' '+(o.z||-5));");
 html=html.replace("e.addEventListener('click',()=>{if(o.type==='portal'&&o.targetSceneId)showScene(o.targetSceneId)});","e.addEventListener('click',()=>{if(o.type==='portal'&&o.targetSceneId)showScene(o.targetSceneId);if(window.V7Runtime)window.V7Runtime.fire('object-click',String(o.id))});");
 html=html.replace("function showScene(id){currentScene=id;","function showScene(id){currentScene=id;if(window.V7Runtime)setTimeout(()=>window.V7Runtime.fire('scene-enter',String(id)),0);");
 html=html.replaceAll("completed.add(s.id);","completed.add(s.id);if(window.V7Runtime)window.V7Runtime.fire('station-complete',String(s.id));");
 const engine=`
 window.V7Vars=Object.assign({},project.variables||{});window.V7Runtime=(function(){
  const fired=new Set();
  function val(x){if(x===undefined||x===null)return '';return String(x)}
  function condition(r){if(!r.conditionEnabled)return true;const a=val(window.V7Vars[r.conditionVar]),b=val(r.conditionValue);if(r.operator==='equals')return a===b;if(r.operator==='not-equals')return a!==b;if(r.operator==='greater')return Number(a)>Number(b);if(r.operator==='less')return Number(a)<Number(b);return false}
  function message(t){ui.mt.textContent='Simulation';ui.mc.textContent=t||'Interaction completed.';ui.choices.innerHTML='';ui.completeBtn.style.display='none';ui.modal.style.display='block';announce(t||'Interaction completed.')}
  function act(r){if(r.action==='show-message')message(r.message);else if(r.action==='open-scene'&&r.targetSceneId)showScene(r.targetSceneId);else if(r.action==='set-variable'){window.V7Vars[r.setVar]=r.setValue;announce(r.setVar+' updated')}else if(r.action==='add-score'){earnedQ+=Number(r.points||0);update();announce('Bonus '+Number(r.points||0)+' points')}persistRules()}
  function persistRules(){try{const raw=SCORM.get('cmi.suspend_data'),d=raw?JSON.parse(raw):{};d.v7vars=window.V7Vars;d.v7fired=[...fired];SCORM.set('cmi.suspend_data',JSON.stringify(d).slice(0,60000));SCORM.commit()}catch(e){}}
  function restore(){try{const raw=SCORM.get('cmi.suspend_data');if(!raw)return;const d=JSON.parse(raw);if(d.v7vars)window.V7Vars=Object.assign({},window.V7Vars,d.v7vars);(d.v7fired||[]).forEach(x=>fired.add(x))}catch(e){}}
  function fire(event,source){(project.rules||[]).filter(r=>r.enabled&&r.event===event&&(event==='timer'||String(r.sourceId)===String(source))).forEach(r=>{if(r.once&&fired.has(r.id))return;if(!condition(r))return;if(r.once)fired.add(r.id);act(r)})}
  restore();setTimeout(()=>{(project.rules||[]).filter(r=>r.enabled&&r.event==='timer').forEach(r=>setTimeout(()=>fire('timer','timer'),Math.max(1,Number(r.seconds||1))*1000))},0);
  return{fire,vars:window.V7Vars}
 })();
 `;
 html=html.replace("update();showScene(currentScene);",engine+"update();showScene(currentScene);");
 return html
};

const oldAuditRun=window.VRClassroomAudit?.run,oldAuditChecks=window.VRClassroomAudit?.checks;
function v7Checks(){const out=[],rules=state.rules||[],scenes=state.scenes||[],objects=state.objects||[],stations=state.stations||[],vars=state.variables||{};const badSources=rules.filter(r=>r.enabled&&r.event!=='timer'&&!((r.event==='object-click'&&objects.some(o=>String(o.id)===String(r.sourceId)))||(r.event==='scene-enter'&&scenes.some(s=>String(s.id)===String(r.sourceId)))||(r.event==='station-complete'&&stations.some(s=>String(s.id)===String(r.sourceId)))));out.push({level:badSources.length?'fail':'pass',name:'Rule event sources',detail:badSources.length?badSources.length+' rule(s) reference missing event sources.':'All enabled rule sources resolve.'});const badScenes=rules.filter(r=>r.enabled&&r.action==='open-scene'&&!scenes.some(s=>String(s.id)===String(r.targetSceneId)));out.push({level:badScenes.length?'fail':'pass',name:'Branching targets',detail:badScenes.length?badScenes.length+' open-scene action(s) reference missing scenes.':'All scene-branch actions resolve.'});const badVars=rules.filter(r=>r.enabled&&((r.conditionEnabled&&!Object.prototype.hasOwnProperty.call(vars,r.conditionVar))||(r.action==='set-variable'&&!Object.prototype.hasOwnProperty.call(vars,r.setVar))));out.push({level:badVars.length?'fail':'pass',name:'Rule variables',detail:badVars.length?badVars.length+' rule(s) reference undefined variables.':'All rule variables are defined.'});const timers=rules.filter(r=>r.enabled&&r.event==='timer'&&Number(r.seconds)<=0);out.push({level:timers.length?'fail':'pass',name:'Timer rules',detail:timers.length?timers.length+' timer(s) have invalid durations.':'Timer durations are valid.'});const noRules=rules.filter(r=>r.enabled).length===0;out.push({level:noRules?'warn':'pass',name:'Simulation behavior',detail:noRules?'No enabled interaction rules are configured.':'At least one simulation rule is enabled.'});return out}
if(oldAuditChecks)window.VRClassroomAudit.checks=()=>[...oldAuditChecks(),...v7Checks()];
if(oldAuditRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldAuditRun(scroll),extras=v7Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(R('auditPass'))R('auditPass').textContent=p;if(R('auditWarn'))R('auditWarn').textContent=w;if(R('auditFail'))R('auditFail').textContent=f;if(R('auditResults'))R('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>`<div class="station" style="${x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':''}"><span class="num">${x.level==='pass'?'✓':x.level==='warn'?'!':'×'}</span><div><b>${esc7(x.name)}</b><div class="muted">${esc7(x.detail)}</div></div><span class="v3-pill">${x.level.toUpperCase()}</span></div>`).join(''));return all};

const oldRender=render;
render=function(){oldRender();ensureV7();renderVars();renderRules()};
renderVars();renderRules();
})();