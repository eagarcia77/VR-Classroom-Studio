(()=>{
const Q34=id=>document.getElementById(id);
const esc34=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV34(){
 state.version=34;
 state.v34=state.v34||{enabled:true,banks:[],selectedBankId:null};
 if(!Array.isArray(state.v34.banks))state.v34.banks=[];
 if(state.v34.enabled===undefined)state.v34.enabled=true;
}
ensureV34();
const main=document.querySelector('main.workspace');if(!main)return;

const card=document.createElement('section');card.className='card v34-shell';card.id='questionBankStudioCard';
card.innerHTML=
 '<div class="v34-head"><div><h3>Question Bank & Randomized Assessment Studio <span class="v6-badge">V34</span></h3><div class="muted">Build station-level question pools that draw a stable random subset for each learner and preserve that selection across SCORM resume.</div></div><span id="v34Status" class="v34-pill"></span></div>'+
 '<div class="v34-grid" style="margin-top:12px">'+
  '<div class="v34-card"><div class="field"><label>Randomized assessment pools</label><select id="v34Enabled"><option value="true">Enabled</option><option value="false">Disabled</option></select></div>'+
  '<div class="field"><label>Immersive station</label><select id="v34Station"></select></div>'+
  '<div class="field"><label>Pool name</label><input id="v34Name" placeholder="e.g. Threat Detection Pool"></div>'+
  '<div class="row"><div class="field"><label>Questions to draw</label><input id="v34Draw" type="number" min="1" step="1" value="1"></div><div class="field"><label>Shuffle answer choices</label><select id="v34Shuffle"><option value="true">Yes</option><option value="false">No</option></select></div></div>'+
  '<div class="toolbar"><button class="btn primary" id="v34Save">Create / Update Pool</button><button class="btn" id="v34New">New</button><button class="btn danger" id="v34Remove">Remove</button></div><div id="v34EditorHint" class="muted" style="margin-top:9px"></div></div>'+
  '<div class="v34-card"><h4 style="margin-top:0">Runtime behavior</h4><div class="v34-runtime"><div><b>Resume-stable draw</b><small>The selected question IDs and random seed are stored in SCORM suspend_data.</small></div><div><b>No duplicate grade model</b><small>The existing V3/V29/V32 score, evidence and objective reporting consume only the questions selected for this learner.</small></div><div><b>Fairness guard</b><small>Random pools require equal point values and one objective mapping per pool.</small></div></div></div>'+
 '</div>'+
 '<div class="v34-metrics" id="v34Metrics" style="margin-top:12px"></div>'+
 '<div id="v34Banks" style="margin-top:12px"></div>'+
 '<div class="v34-qa" id="v34QA" style="margin-top:12px"></div>';

const anchor=Q34('assessmentBlueprintCard')||Q34('assessmentEngineCard');
if(anchor)anchor.insertAdjacentElement('afterend',card);else main.appendChild(card);
const nav=document.querySelector('aside .nav');if(nav){const b=document.createElement('button');b.innerHTML='🎲 Question Banks <span class="badge">V34</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.appendChild(b)}

function stationQuestions(stationId){return(state.questions||[]).filter(q=>String(q.stationId)===String(stationId))}
function stationName(id){return(state.stations||[]).find(s=>String(s.id)===String(id))?.name||'Missing station'}
function objectiveForQuestion(q){
 if(q?.objectiveIndex!==undefined&&q?.objectiveIndex!==null&&Number.isFinite(Number(q.objectiveIndex)))return Number(q.objectiveIndex);
 const c=(state.competencies||[]).find(x=>(x.questionIds||[]).some(id=>String(id)===String(q?.id))&&(x.objectiveIndexes||[]).length);
 if(c)return Number(c.objectiveIndexes[0]);
 const s=(state.stations||[]).find(x=>String(x.id)===String(q?.stationId));
 if(s?.objectiveIndex!==undefined&&s?.objectiveIndex!==null&&Number.isFinite(Number(s.objectiveIndex)))return Number(s.objectiveIndex);
 const cs=(state.competencies||[]).find(x=>(x.stationIds||[]).some(id=>String(id)===String(s?.id))&&(x.objectiveIndexes||[]).length);
 return cs?Number(cs.objectiveIndexes[0]):null
}
function objectiveLabel(i){const o=(state.objectives||[])[Number(i)];return typeof o==='string'?o:(o?.text||o?.title||('Objective '+(Number(i)+1)))}
function selectedBank(){return state.v34.banks.find(b=>String(b.id)===String(state.v34.selectedBankId))||null}
function bankStats(bank){
 const qs=stationQuestions(bank.stationId),draw=Math.max(1,Math.min(qs.length||1,Number(bank.draw||1)));
 const points=[...new Set(qs.map(q=>Number(q.points||0)).filter(x=>x>0))];
 const objectives=[...new Set(qs.map(objectiveForQuestion).filter(x=>x!==null&&x!==undefined).map(Number))];
 return{qs,draw,points,objectives,random:qs.length>draw,runtimeMax:draw*(points.length===1?points[0]:0)}
}
function populate(){
 const sel=Q34('v34Station'),current=sel.value;
 sel.innerHTML=(state.stations||[]).map(s=>'<option value="'+esc34(s.id)+'">'+esc34(s.name||String(s.id))+' · '+stationQuestions(s.id).length+' question(s)</option>').join('');
 if(current&&[...sel.options].some(o=>String(o.value)===String(current)))sel.value=current;
 const b=selectedBank();
 if(b&&[...sel.options].some(o=>String(o.value)===String(b.stationId)))sel.value=String(b.stationId);
 Q34('v34Enabled').value=String(state.v34.enabled!==false)
}
function loadEditor(bank){
 state.v34.selectedBankId=bank?.id||null;populate();
 if(bank){Q34('v34Name').value=bank.name||'';Q34('v34Draw').value=Number(bank.draw||1);Q34('v34Shuffle').value=String(bank.shuffleChoices!==false)}
 else{const sid=Q34('v34Station').value,s=stationName(sid);Q34('v34Name').value=s&&s!=='Missing station'?s+' Pool':'';Q34('v34Draw').value=Math.min(2,Math.max(1,stationQuestions(sid).length));Q34('v34Shuffle').value='true'}
 updateHint()
}
function updateHint(){
 const sid=Q34('v34Station').value,qs=stationQuestions(sid),pts=[...new Set(qs.map(q=>Number(q.points||0)).filter(x=>x>0))],objs=[...new Set(qs.map(objectiveForQuestion).filter(x=>x!==null&&x!==undefined))];
 Q34('v34EditorHint').textContent=qs.length+' candidate question(s) · '+(pts.length?pts.join('/')+' point value(s)':'0 scored points')+' · '+(objs.length?objs.map(i=>'Objective '+(Number(i)+1)).join(', '):'no objective mapping')
}
function saveBank(){
 ensureV34();const sid=Q34('v34Station').value;if(!sid)return alert('Add a station before creating a question pool.');
 const qs=stationQuestions(sid);if(qs.length<2)return alert('A randomized pool needs at least two questions attached to the selected station.');
 const draw=Math.max(1,Math.min(qs.length,Number(Q34('v34Draw').value)||1)),name=Q34('v34Name').value.trim()||stationName(sid)+' Pool';
 let b=selectedBank()||state.v34.banks.find(x=>String(x.stationId)===String(sid));
 if(!b){b={id:'bank-'+Date.now(),createdAt:new Date().toISOString()};state.v34.banks.push(b)}
 Object.assign(b,{name,stationId:sid,draw,shuffleChoices:Q34('v34Shuffle').value==='true',enabled:true,updatedAt:new Date().toISOString()});
 state.v34.selectedBankId=b.id;renderAll()
}
Q34('v34Save').onclick=saveBank;
Q34('v34New').onclick=()=>loadEditor(null);
Q34('v34Remove').onclick=()=>{const b=selectedBank();if(!b)return;state.v34.banks=state.v34.banks.filter(x=>String(x.id)!==String(b.id));state.v34.selectedBankId=null;renderAll()};
Q34('v34Enabled').onchange=()=>{state.v34.enabled=Q34('v34Enabled').value==='true';renderAll()};
Q34('v34Station').onchange=()=>{if(!selectedBank())loadEditor(null);else updateHint()};
Q34('v34Draw').oninput=updateHint;

function checks(){
 ensureV34();if(state.v34.enabled===false)return[{level:'warn',name:'V34 randomized assessment pools',detail:'Question-bank randomization is disabled; all authored questions will appear normally.'}];
 const out=[],seen=new Set();
 if(!state.v34.banks.length)out.push({level:'warn',name:'V34 question-bank configuration',detail:'No randomized question pools are configured yet.'});
 for(const b of state.v34.banks){
  const s=(state.stations||[]).find(x=>String(x.id)===String(b.stationId)),st=bankStats(b);
  if(!s)out.push({level:'fail',name:'V34 pool station integrity',detail:(b.name||b.id)+' references a missing station.'});
  if(seen.has(String(b.stationId)))out.push({level:'fail',name:'V34 one pool per station',detail:'More than one randomized pool targets '+stationName(b.stationId)+'.'});
  seen.add(String(b.stationId));
  if(st.qs.length<2)out.push({level:'fail',name:'V34 candidate depth',detail:(b.name||b.id)+' has fewer than two candidate questions.'});
  if(Number(b.draw)<1||Number(b.draw)>st.qs.length)out.push({level:'fail',name:'V34 draw size',detail:(b.name||b.id)+' draw count must be between 1 and '+st.qs.length+'.'});
  if(st.points.length>1)out.push({level:'fail',name:'V34 equal-weight fairness',detail:(b.name||b.id)+' mixes scored questions with different point values ('+st.points.join(', ')+').'});
  if(st.random&&st.objectives.length>1)out.push({level:'fail',name:'V34 objective fairness',detail:(b.name||b.id)+' randomizes across multiple learning objectives. Keep each pool within one objective.'});
  if(st.random&&st.qs.some(q=>objectiveForQuestion(q)==null))out.push({level:'fail',name:'V34 objective attribution',detail:(b.name||b.id)+' contains candidate questions without an objective mapping.'});
  if(st.qs.length&&Number(b.draw)>=st.qs.length)out.push({level:'warn',name:'V34 effective randomization',detail:(b.name||b.id)+' draws every candidate, so no question selection is randomized.'});
 }
 if(state.v34.banks.length&&!out.some(x=>x.level==='fail'))out.unshift({level:'pass',name:'V34 randomized assessment integrity',detail:state.v34.banks.length+' station-level pool(s) are structurally ready for resume-stable randomized delivery.'});
 return out
}
function renderBanks(){
 const box=Q34('v34Banks');
 if(!state.v34.banks.length){box.innerHTML='<div class="v34-empty">No pools yet. Attach at least two questions to a station, then create a pool.</div>';return}
 box.innerHTML=state.v34.banks.map(b=>{const st=bankStats(b),active=String(b.id)===String(state.v34.selectedBankId);return '<div class="v34-bank '+(active?'active':'')+'" data-bank="'+esc34(b.id)+'"><div><b>'+esc34(b.name||'Question Pool')+'</b><small>'+esc34(stationName(b.stationId))+' · draw '+st.draw+' of '+st.qs.length+' · '+(b.shuffleChoices!==false?'choices shuffled':'choice order preserved')+'</small></div><div><span class="v34-pill">'+(st.random?'RANDOM':'FULL SET')+'</span></div><button class="btn" data-edit="'+esc34(b.id)+'">Edit</button></div>'}).join('');
 box.querySelectorAll('[data-edit]').forEach(x=>x.onclick=()=>{const b=state.v34.banks.find(v=>String(v.id)===String(x.dataset.edit));if(b)loadEditor(b)})
}
function renderMetrics(){
 const banks=state.v34.banks||[],random=banks.filter(b=>bankStats(b).random).length,candidates=banks.reduce((a,b)=>a+bankStats(b).qs.length,0),draws=banks.reduce((a,b)=>a+Math.min(bankStats(b).draw,bankStats(b).qs.length),0);
 Q34('v34Metrics').innerHTML='<div><b>'+banks.length+'</b><small>Pools</small></div><div><b>'+random+'</b><small>Random draws</small></div><div><b>'+candidates+'</b><small>Candidate items</small></div><div><b>'+draws+'</b><small>Items delivered</small></div>'
}
function renderQA(){
 const items=checks();Q34('v34QA').innerHTML=items.map(x=>'<div class="v34-check"><span class="v34-icon '+x.level+'">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc34(x.name)+'</b><small>'+esc34(x.detail)+'</small></div></div>').join('');
 const fail=items.filter(x=>x.level==='fail').length,warn=items.filter(x=>x.level==='warn').length;
 Q34('v34Status').innerHTML='<span class="v34-dot '+(fail?'fail':warn?'warn':'')+'"></span>'+(state.v34.enabled===false?'Disabled':fail?fail+' blocker(s)':warn?warn+' advisory':'Ready')
}
function renderAll(){ensureV34();populate();renderBanks();renderMetrics();renderQA();updateHint()}
loadEditor(null);renderAll();

/* Runtime: select the learner's bank questions before the base runtime and later evidence/objective layers initialize. */
const prevRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=prevRuntime(preview);if(state.v34?.enabled===false||!(state.v34?.banks||[]).length)return html;
 const cfg=JSON.stringify({enabled:true,banks:(state.v34.banks||[]).filter(b=>b.enabled!==false).map(b=>({id:b.id,name:b.name,stationId:b.stationId,draw:Number(b.draw||1),shuffleChoices:b.shuffleChoices!==false}))}).replace(/</g,'\u003c');
 const boot="(function(){"+
  "const cfg="+cfg+";if(!cfg.enabled||!Array.isArray(project.questions))return;"+
  "function h(s){let x=2166136261;for(let i=0;i<String(s).length;i++){x^=String(s).charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0}"+
  "function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}"+
  "function shuf(arr,seed){const out=arr.slice(),r=rng(h(seed));for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1)),t=out[i];out[i]=out[j];out[j]=t}return out}"+
  "let saved={version:1,seed:null,selections:{}};try{const raw=SCORM.get('cmi.suspend_data'),d=raw?JSON.parse(raw):{};if(d.v34pools)saved=d.v34pools}catch(e){}"+
  "if(!saved.seed){try{const a=new Uint32Array(1);crypto.getRandomValues(a);saved.seed=String(a[0])}catch(e){saved.seed=String(Date.now())}}if(!saved.selections)saved.selections={};"+
  "const active=new Set(),bankedStations=new Set();"+
  "(cfg.banks||[]).forEach(b=>{const qs=project.questions.filter(q=>String(q.stationId)===String(b.stationId)),ids=qs.map(q=>String(q.id)),n=Math.max(1,Math.min(qs.length,Number(b.draw||1)));bankedStations.add(String(b.stationId));let pick=(saved.selections[b.id]||[]).map(String);if(pick.length!==n||pick.some(id=>!ids.includes(id))){pick=shuf(ids,String(saved.seed)+'|'+String(b.id)).slice(0,n);saved.selections[b.id]=pick}pick.forEach(id=>active.add(id));if(b.shuffleChoices){qs.filter(q=>pick.includes(String(q.id))).forEach(q=>{if(Array.isArray(q.choices)&&q.choices.length>1)q.choices=shuf(q.choices,String(saved.seed)+'|'+String(b.id)+'|'+String(q.id))})}});"+
  "project.questions=project.questions.filter(q=>!bankedStations.has(String(q.stationId))||active.has(String(q.id)));"+
  "try{const raw=SCORM.get('cmi.suspend_data'),d=raw?JSON.parse(raw):{};d.v34pools=saved;const out=JSON.stringify(d);if(out.length<60000){SCORM.set('cmi.suspend_data',out);SCORM.commit()}}catch(e){}"+
  "window.V34Runtime={seed:saved.seed,selections:saved.selections,activeQuestionIds:Array.from(active)}"+
 "})();";
 return html.replace('SCORM.init();','SCORM.init();'+boot)
};

const oldValidate=validateProject;
validateProject=function(){const issues=oldValidate(),fails=checks().filter(x=>x.level==='fail');fails.forEach(x=>issues.push(x.name+': '+x.detail));return[...new Set(issues)]};

const oldChecks=window.VRClassroomAudit?.checks,oldRun=window.VRClassroomAudit?.run;
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=checks(),all=[...base,...extras],p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(Q34('auditPass'))Q34('auditPass').textContent=p;if(Q34('auditWarn'))Q34('auditWarn').textContent=w;if(Q34('auditFail'))Q34('auditFail').textContent=f;if(Q34('auditResults'))Q34('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc34(x.name)+'</b><div class="muted">'+esc34(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

const oldRender=window.render;window.render=function(){oldRender();ensureV34();setTimeout(renderAll,0)};
window.VRQuestionBanksV34={checks,render:renderAll,banks:()=>state.v34.banks};
})();