(()=>{
const A35=id=>document.getElementById(id);
const esc35=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV35(){
 state.version=35;
 state.v35=state.v35||{enabled:true,lowThreshold:60,highThreshold:85,selectedBankId:null,routes:{}};
 if(state.v35.enabled===undefined)state.v35.enabled=true;
 if(!Number.isFinite(Number(state.v35.lowThreshold)))state.v35.lowThreshold=60;
 if(!Number.isFinite(Number(state.v35.highThreshold)))state.v35.highThreshold=85;
 state.v35.routes=state.v35.routes||{};
}
ensureV35();
const main=document.querySelector('main.workspace');if(!main)return;

const card=document.createElement('section');card.className='card v35-shell';card.id='adaptiveAssessmentStudioCard';
card.innerHTML=
 '<div class="v35-head"><div><h3>Adaptive Assessment & Remediation <span class="v6-badge">V35</span></h3><div class="muted">Use prior objective evidence to select Foundation, Core or Challenge questions, then guide learners toward remediation or advanced scenes without creating a second grade model.</div></div><span id="v35Status" class="v35-pill"></span></div>'+
 '<div class="v35-grid" style="margin-top:12px">'+
  '<div class="v35-card"><div class="field"><label>Adaptive question-bank delivery</label><select id="v35Enabled"><option value="true">Enabled</option><option value="false">Disabled</option></select></div>'+
  '<div class="row"><div class="field"><label>Foundation below (%)</label><input id="v35Low" type="number" min="0" max="99"></div><div class="field"><label>Challenge at / above (%)</label><input id="v35High" type="number" min="1" max="100"></div></div>'+
  '<div class="field"><label>Question bank</label><select id="v35Bank"></select></div>'+
  '<div id="v35BankSummary" class="v35-note"></div></div>'+
  '<div class="v35-card"><div class="field"><label>After low performance</label><select id="v35Remediation"></select></div>'+
  '<div class="field"><label>After high performance</label><select id="v35Mastery"></select></div>'+
  '<div class="field"><label>Routing behavior</label><select id="v35RouteMode"><option value="guide">Offer learner a route button</option><option value="auto">Automatically route after feedback</option><option value="none">Feedback only</option></select></div>'+
  '<div class="v35-note">Routing uses existing immersive scenes. V17 adaptive scene rules remain authoritative if they intercept the destination.</div></div>'+
 '</div>'+
 '<div class="v35-toolbar"><button class="btn" id="v35SetCore">Set untagged questions to Core</button><button class="btn primary" id="v35Refresh">Refresh adaptive map</button></div>'+
 '<div id="v35QuestionMap" class="v35-question-map"></div>'+
 '<div id="v35Metrics" class="v35-metrics"></div>'+
 '<div id="v35QA" class="v35-qa"></div>';

const anchor=A35('questionBankStudioCard')||A35('assessmentBlueprintCard');
if(anchor)anchor.insertAdjacentElement('afterend',card);else main.appendChild(card);
const nav=document.querySelector('aside .nav');if(nav){const b=document.createElement('button');b.innerHTML='↯ Adaptive Assessment <span class="badge">V35</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.appendChild(b)}

function banks(){return(state.v34?.banks||[]).filter(b=>b.enabled!==false)}
function selectedBank(){const list=banks();return list.find(b=>String(b.id)===String(state.v35.selectedBankId))||list[0]||null}
function questionsForBank(b){return b?(state.questions||[]).filter(q=>String(q.stationId)===String(b.stationId)):[]}
function stationName(id){return(state.stations||[]).find(s=>String(s.id)===String(id))?.name||'Missing station'}
function objectiveForQuestion(q){
 if(q?.objectiveIndex!==undefined&&q?.objectiveIndex!==null&&Number.isFinite(Number(q.objectiveIndex)))return Number(q.objectiveIndex);
 const c=(state.competencies||[]).find(x=>(x.questionIds||[]).some(id=>String(id)===String(q?.id))&&(x.objectiveIndexes||[]).length);if(c)return Number(c.objectiveIndexes[0]);
 const s=(state.stations||[]).find(x=>String(x.id)===String(q?.stationId));
 if(s?.objectiveIndex!==undefined&&s?.objectiveIndex!==null&&Number.isFinite(Number(s.objectiveIndex)))return Number(s.objectiveIndex);
 const cs=(state.competencies||[]).find(x=>(x.stationIds||[]).some(id=>String(id)===String(s?.id))&&(x.objectiveIndexes||[]).length);return cs?Number(cs.objectiveIndexes[0]):null
}
function objectiveLabel(i){const o=(state.objectives||[])[Number(i)];return typeof o==='string'?o:(o?.text||o?.title||('Objective '+(Number(i)+1)))}
function routeCfg(id){state.v35.routes[id]=state.v35.routes[id]||{remediationSceneId:'',masterySceneId:'',mode:'guide'};return state.v35.routes[id]}
function populate(){
 const list=banks(),sel=A35('v35Bank');
 sel.innerHTML=list.length?list.map(b=>'<option value="'+esc35(b.id)+'">'+esc35(b.name||stationName(b.stationId))+'</option>').join(''):'<option value="">No V34 question banks</option>';
 if(!state.v35.selectedBankId&&list[0])state.v35.selectedBankId=list[0].id;
 if(list.some(b=>String(b.id)===String(state.v35.selectedBankId)))sel.value=String(state.v35.selectedBankId);
 const sceneOptions='<option value="">No scene target</option>'+(state.scenes||[]).map(s=>'<option value="'+esc35(s.id)+'">'+esc35(s.name||String(s.id))+'</option>').join('');
 A35('v35Remediation').innerHTML=sceneOptions;A35('v35Mastery').innerHTML=sceneOptions;
 const b=selectedBank();if(b){const r=routeCfg(b.id);A35('v35Remediation').value=String(r.remediationSceneId||'');A35('v35Mastery').value=String(r.masterySceneId||'');A35('v35RouteMode').value=r.mode||'guide'}
 A35('v35Enabled').value=String(state.v35.enabled!==false);A35('v35Low').value=Number(state.v35.lowThreshold);A35('v35High').value=Number(state.v35.highThreshold)
}
function renderQuestions(){
 const b=selectedBank(),box=A35('v35QuestionMap');if(!b){box.innerHTML='<div class="v35-empty">Create a V34 question bank first.</div>';return}
 const qs=questionsForBank(b),counts={foundation:0,core:0,challenge:0,untagged:0};qs.forEach(q=>{const k=q.adaptiveLevel||'untagged';counts[k]=(counts[k]||0)+1});
 A35('v35BankSummary').innerHTML='<b>'+esc35(b.name||'Question bank')+'</b><span>'+esc35(stationName(b.stationId))+' · draw '+Number(b.draw||1)+' · '+qs.length+' candidates</span><span>Foundation '+counts.foundation+' · Core '+counts.core+' · Challenge '+counts.challenge+' · Untagged '+counts.untagged+'</span>';
 box.innerHTML=qs.length?qs.map((q,i)=>'<div class="v35-qrow"><span class="v35-index">'+(i+1)+'</span><div><b>'+esc35(q.prompt||('Question '+(i+1)))+'</b><small>'+Number(q.points||0)+' pts · '+esc35(objectiveForQuestion(q)==null?'No objective':objectiveLabel(objectiveForQuestion(q)))+'</small></div><select data-v35level="'+esc35(q.id)+'"><option value="">Untagged</option><option value="foundation">Foundation</option><option value="core">Core</option><option value="challenge">Challenge</option></select></div>').join(''):'<div class="v35-empty">This bank has no candidate questions.</div>';
 box.querySelectorAll('[data-v35level]').forEach(s=>{const q=qs.find(x=>String(x.id)===String(s.dataset.v35level));s.value=q?.adaptiveLevel||'';s.onchange=()=>{if(q){if(s.value)q.adaptiveLevel=s.value;else delete q.adaptiveLevel;renderAll()}}})
}
function checks(){
 ensureV35();const out=[],list=banks(),low=Number(state.v35.lowThreshold),high=Number(state.v35.highThreshold);
 if(state.v35.enabled===false)return[{level:'warn',name:'V35 adaptive assessment',detail:'Adaptive delivery is disabled; V34 randomized banks continue to work normally.'}];
 out.push({level:list.length?'pass':'warn',name:'V35 adaptive bank source',detail:list.length?list.length+' V34 bank(s) are available for adaptive delivery.':'No V34 question bank exists yet.'});
 out.push({level:low>=0&&high<=100&&low<high?'pass':'fail',name:'V35 mastery bands',detail:'Foundation < '+low+'% · Core '+low+'-'+(high-1)+'% · Challenge ≥ '+high+'%.'});
 if(state.v29?.enabled===false)out.push({level:'warn',name:'V35 evidence source',detail:'V29 evidence recording is disabled. New adaptive banks will default to Core because correctness history is unavailable.'});
 for(const b of list){
  const qs=questionsForBank(b),draw=Math.max(1,Number(b.draw||1)),tags={foundation:[],core:[],challenge:[],missing:[]};
  qs.forEach(q=>{if(tags[q.adaptiveLevel])tags[q.adaptiveLevel].push(q);else tags.missing.push(q)});
  if(tags.missing.length)out.push({level:'fail',name:'V35 difficulty tagging',detail:(b.name||stationName(b.stationId))+' has '+tags.missing.length+' untagged candidate question(s).'});
  if(qs.some(q=>q.type==='reflection'))out.push({level:'fail',name:'V35 auto-gradable evidence',detail:(b.name||stationName(b.stationId))+' contains reflection items. Adaptive correctness bands require automatically scorable candidate questions.'});
  if(!tags.core.length)out.push({level:'fail',name:'V35 Core baseline',detail:(b.name||stationName(b.stationId))+' needs at least one Core question.'});
  ['foundation','core','challenge'].forEach(level=>{if(tags[level].length&&tags[level].length<draw)out.push({level:'warn',name:'V35 '+level+' depth',detail:(b.name||stationName(b.stationId))+' has '+tags[level].length+' '+level+' candidate(s) for a draw of '+draw+'; runtime will blend adjacent levels.'})});
  const r=routeCfg(b.id);for(const [k,id] of [['remediation',r.remediationSceneId],['mastery',r.masterySceneId]])if(id&&!(state.scenes||[]).some(s=>String(s.id)===String(id)))out.push({level:'fail',name:'V35 '+k+' route integrity',detail:(b.name||stationName(b.stationId))+' references a missing '+k+' scene.'});
 }
 if(list.length&&!out.some(x=>x.level==='fail'))out.unshift({level:'pass',name:'V35 adaptive runtime readiness',detail:'Difficulty tiers, stable selection and optional remediation routes are structurally ready.'});
 return out
}
function renderMetrics(){
 const list=banks(),qs=list.flatMap(questionsForBank),tagged=qs.filter(q=>['foundation','core','challenge'].includes(q.adaptiveLevel)).length,routes=list.filter(b=>{const r=routeCfg(b.id);return r.remediationSceneId||r.masterySceneId}).length;
 A35('v35Metrics').innerHTML='<div><b>'+list.length+'</b><small>Adaptive banks</small></div><div><b>'+tagged+'/'+qs.length+'</b><small>Tier-tagged items</small></div><div><b>'+routes+'</b><small>Banks with routes</small></div><div><b>'+Number(state.v35.lowThreshold)+' / '+Number(state.v35.highThreshold)+'</b><small>Band thresholds</small></div>'
}
function renderQA(){
 const items=checks(),fails=items.filter(x=>x.level==='fail').length,warns=items.filter(x=>x.level==='warn').length;
 A35('v35QA').innerHTML=items.map(x=>'<div class="v35-check"><span class="v35-icon '+x.level+'">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc35(x.name)+'</b><small>'+esc35(x.detail)+'</small></div></div>').join('');
 A35('v35Status').innerHTML='<span class="v35-dot '+(fails?'fail':warns?'warn':'')+'"></span>'+(state.v35.enabled===false?'Disabled':fails?fails+' blocker(s)':warns?warns+' advisory':'Ready')
}
function renderAll(){ensureV35();populate();renderQuestions();renderMetrics();renderQA()}
A35('v35Bank').onchange=()=>{state.v35.selectedBankId=A35('v35Bank').value;renderAll()};
A35('v35Enabled').onchange=()=>{state.v35.enabled=A35('v35Enabled').value==='true';renderAll()};
A35('v35Low').onchange=()=>{state.v35.lowThreshold=Math.max(0,Math.min(99,Number(A35('v35Low').value)||0));renderAll()};
A35('v35High').onchange=()=>{state.v35.highThreshold=Math.max(1,Math.min(100,Number(A35('v35High').value)||100));renderAll()};
function saveRoute(){const b=selectedBank();if(!b)return;const r=routeCfg(b.id);r.remediationSceneId=A35('v35Remediation').value;r.masterySceneId=A35('v35Mastery').value;r.mode=A35('v35RouteMode').value;renderAll()}
A35('v35Remediation').onchange=saveRoute;A35('v35Mastery').onchange=saveRoute;A35('v35RouteMode').onchange=saveRoute;
A35('v35SetCore').onclick=()=>{const b=selectedBank();if(!b)return;questionsForBank(b).forEach(q=>{if(!q.adaptiveLevel)q.adaptiveLevel='core'});renderAll()};
A35('v35Refresh').onclick=renderAll;
renderAll();

/* Runtime adaptive layer: V34 remains the randomization engine. V35 replaces each bank's station question set at first access using stable mastery-aware tiers. */
const prevRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=prevRuntime(preview);if(state.v35?.enabled===false||!banks().length)return html;
 const qObj={};(state.questions||[]).forEach(q=>qObj[String(q.id)]=objectiveForQuestion(q));
 const cfg=JSON.stringify({
  low:Number(state.v35.lowThreshold),high:Number(state.v35.highThreshold),
  banks:banks().map(b=>({id:b.id,name:b.name,stationId:b.stationId,draw:Number(b.draw||1),shuffleChoices:b.shuffleChoices!==false,route:routeCfg(b.id)})),
  qObj
 }).replace(/</g,'\\u003c');
 const boot="(function(){try{window.__V35OriginalQuestions=JSON.parse(JSON.stringify(project.questions||[]));let raw=SCORM.get('cmi.suspend_data'),d=raw?JSON.parse(raw):{};let a=d.v35adaptive||{version:1,seed:null,banks:{}};if(!a.seed){try{const x=new Uint32Array(1);crypto.getRandomValues(x);a.seed=String(x[0])}catch(e){a.seed=String(Date.now())}}a.banks=a.banks||{};d.v35adaptive=a;const out=JSON.stringify(d);if(out.length<60000){SCORM.set('cmi.suspend_data',out);SCORM.commit()}window.__V35Bootstrap=a}catch(e){window.__V35OriginalQuestions=JSON.parse(JSON.stringify(project.questions||[]));window.__V35Bootstrap={version:1,seed:String(Date.now()),banks:{}}}})();";
 html=html.replace('SCORM.init();','SCORM.init();'+boot);
 const styles='<style>#v35Learner{position:fixed;right:16px;bottom:16px;z-index:90;width:min(390px,calc(100vw - 32px));display:none;background:#071225f5;color:#fff;border:1px solid #ffffff38;border-radius:14px;padding:13px;box-shadow:0 18px 55px #0008;font-family:system-ui}#v35Learner.show{display:block}#v35Learner b,#v35Learner small{display:block}#v35Learner small{opacity:.8;margin-top:4px;line-height:1.4}.v35r-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.v35r-actions button{border:1px solid #ffffff38;background:#142640;color:#fff;border-radius:8px;padding:8px 10px;cursor:pointer}@media(max-width:640px){#v35Learner{left:10px;right:10px;bottom:10px;width:auto}}</style>';
 const body='<aside id="v35Learner" role="status" aria-live="polite"><b id="v35LearnerTitle"></b><small id="v35LearnerText"></small><div id="v35LearnerActions" class="v35r-actions"></div></aside>';
 const script=`<script>
 (function(){
 const cfg=${cfg},adaptive=window.__V35Bootstrap||{version:1,seed:String(Date.now()),banks:{}},originals=window.__V35OriginalQuestions||JSON.parse(JSON.stringify(project.questions||[]));
 const panel=document.getElementById('v35Learner'),pt=document.getElementById('v35LearnerTitle'),px=document.getElementById('v35LearnerText'),pa=document.getElementById('v35LearnerActions');
 function h(s){let x=2166136261;for(let i=0;i<String(s).length;i++){x^=String(s).charCodeAt(i);x=Math.imul(x,16777619)}return x>>>0}
 function rng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
 function shuf(arr,seed){const out=arr.slice(),r=rng(h(seed));for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1)),t=out[i];out[i]=out[j];out[j]=t}return out}
 function persistAdaptive(){try{const raw=SCORM.get('cmi.suspend_data'),d=raw?JSON.parse(raw):{};d.v35adaptive=adaptive;const out=JSON.stringify(d);if(out.length<60000){SCORM.set('cmi.suspend_data',out);SCORM.commit()}}catch(e){}}
 function evidence(){try{const live=window.V29Evidence?.records?.();if(Array.isArray(live)&&live.length)return live}catch(e){}try{const raw=SCORM.get('cmi.suspend_data'),d=raw?JSON.parse(raw):{};return Array.isArray(d.v29evidence)?d.v29evidence:[]}catch(e){return[]}}
 function objectiveFor(q){const v=cfg.qObj[String(q?.id)];return v===null||v===undefined?null:Number(v)}
 function objectiveScore(bank){
  const source=originals.filter(q=>String(q.stationId)===String(bank.stationId)),ois=[...new Set(source.map(objectiveFor).filter(v=>v!==null))];if(ois.length!==1)return null;const oi=ois[0],recs=evidence().filter(r=>r.kind==='question'&&Number(r.objectiveIndex)===Number(oi)&&(r.result==='correct'||r.result==='incorrect'));if(!recs.length)return null;let max=0,earned=0;recs.forEach(r=>{const pts=Math.max(1,Number(r.points||1));max+=pts;if(r.result==='correct')earned+=pts});return max?Math.round(earned/max*100):null
 }
 function tierFor(bank){
  const saved=adaptive.banks[bank.id];if(saved?.tier)return saved.tier;
  const score=objectiveScore(bank),tier=score===null?'core':score<Number(cfg.low)?'foundation':score>=Number(cfg.high)?'challenge':'core';
  adaptive.banks[bank.id]={...(saved||{}),tier,entryScore:score,selectedIds:[]};persistAdaptive();return tier
 }
 function choose(bank,tier){
  const saved=adaptive.banks[bank.id]||(adaptive.banks[bank.id]={tier,entryScore:null,selectedIds:[]}),all=originals.filter(q=>String(q.stationId)===String(bank.stationId)),draw=Math.max(1,Math.min(all.length,Number(bank.draw||1)));
  const by=l=>all.filter(q=>(q.adaptiveLevel||'core')===l),order=tier==='foundation'?['foundation','core','challenge']:tier==='challenge'?['challenge','core','foundation']:['core','foundation','challenge'];
  const pool=[];for(const level of order)for(const q of shuf(by(level),adaptive.seed+'|'+bank.id+'|'+tier+'|'+level))if(!pool.some(x=>String(x.id)===String(q.id)))pool.push(q);
  const valid=(saved.selectedIds||[]).length===draw&&(saved.selectedIds||[]).every(id=>all.some(q=>String(q.id)===String(id)));
  const ids=valid?saved.selectedIds.map(String):pool.slice(0,draw).map(q=>String(q.id));if(!valid){saved.selectedIds=ids;saved.tier=tier;persistAdaptive()}
  return ids.map(id=>JSON.parse(JSON.stringify(all.find(q=>String(q.id)===String(id))))).filter(Boolean).map(q=>{if(bank.shuffleChoices&&Array.isArray(q.choices)&&q.choices.length>1)q.choices=shuf(q.choices,adaptive.seed+'|choice|'+bank.id+'|'+q.id);return q})
 }
 function applyBank(bank){
  const tier=tierFor(bank),selected=choose(bank,tier);if(!selected.length)return;
  project.questions=(project.questions||[]).filter(q=>String(q.stationId)!==String(bank.stationId)).concat(selected);return{tier,selected,state:adaptive.banks[bank.id]}
 }
 function bankForStation(s){return(cfg.banks||[]).find(b=>String(b.stationId)===String(s?.id))}
 function resultFor(bank){
  const st=adaptive.banks[bank.id],ids=(st?.selectedIds||[]).map(String),recs=evidence().filter(r=>r.kind==='question'&&ids.includes(String(r.sourceId))&&(r.result==='correct'||r.result==='incorrect'));if(!recs.length)return null;let max=0,earned=0;recs.forEach(r=>{const p=Math.max(1,Number(r.points||1));max+=p;if(r.result==='correct')earned+=p});return max?Math.round(earned/max*100):null
 }
 function showFeedback(bank,score){
  if(score===null||!panel)return;const low=Number(cfg.low),high=Number(cfg.high),outcome=score<low?'foundation':score>=high?'challenge':'core',route=bank.route||{},target=outcome==='foundation'?route.remediationSceneId:outcome==='challenge'?route.masterySceneId:'';
  pt.textContent=outcome==='foundation'?'Targeted reinforcement recommended':outcome==='challenge'?'Mastery demonstrated':'Core mastery developing';
  px.textContent='Assessment result: '+score+'%. '+(outcome==='foundation'?'Review the remediation experience before continuing.':outcome==='challenge'?'You are ready for an advanced application experience.':'Continue practicing at the current level.');
  pa.innerHTML='';const close=document.createElement('button');close.textContent='Continue here';close.onclick=()=>panel.classList.remove('show');pa.appendChild(close);
  if(target&&route.mode!=='none'){const go=document.createElement('button');go.textContent=outcome==='foundation'?'Open remediation':'Open advanced scene';go.onclick=()=>{panel.classList.remove('show');showScene(target)};pa.appendChild(go);if(route.mode==='auto')setTimeout(()=>{if(panel.classList.contains('show'))go.click()},1800)}
  panel.classList.add('show')
 }
 const previousOpen=openStation;openStation=function(s){const bank=bankForStation(s);if(bank)applyBank(bank);return previousOpen(s)};
 const previousFinish=finishStationIfReady;finishStationIfReady=function(s,qs){const was=completed.has(s.id)||completed.has(String(s.id)),r=previousFinish(s,qs),now=completed.has(s.id)||completed.has(String(s.id)),bank=bankForStation(s);if(bank&&!was&&now)setTimeout(()=>{const score=resultFor(bank);if(score!==null){adaptive.banks[bank.id].exitScore=score;adaptive.banks[bank.id].completedAt=new Date().toISOString();persistAdaptive();showFeedback(bank,score)}},30);return r};
 window.V35Adaptive={state:adaptive,applyBank,tierFor,resultFor,persist:persistAdaptive}
 })();
 <\/script>`;
 html=html.replace('</head>',styles+'</head>');html=html.replace('<a-scene id="scene"',body+'<a-scene id="scene"');return html.replace('</body></html>',script+'</body></html>')
};

const oldValidate=validateProject;
validateProject=function(){const issues=oldValidate(),fails=checks().filter(x=>x.level==='fail');fails.forEach(x=>issues.push(x.name+': '+x.detail));return[...new Set(issues)]};

const oldChecks=window.VRClassroomAudit?.checks,oldRun=window.VRClassroomAudit?.run;
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=checks(),all=[...base,...extras],p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(A35('auditPass'))A35('auditPass').textContent=p;if(A35('auditWarn'))A35('auditWarn').textContent=w;if(A35('auditFail'))A35('auditFail').textContent=f;if(A35('auditResults'))A35('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc35(x.name)+'</b><div class="muted">'+esc35(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

const oldRender=window.render;window.render=function(){oldRender();ensureV35();setTimeout(renderAll,0)};
window.VRAdaptiveV35={checks,render:renderAll};
})();