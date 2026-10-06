(()=>{
const H=id=>document.getElementById(id);
const e23=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV23(){state.version=23;state.v23=state.v23||{lastSimulation:null,cohortSize:24,seed:2301,mascotEnabled:true}}
ensureV23();
const main=document.querySelector('main.workspace');if(!main)return;

const logo=document.querySelector('header .logo');
if(logo)logo.innerHTML='<img src="brand/vr-classroom-studio-mark.svg" alt="VR Classroom Studio orbital knowledge mark">';

const deck=document.createElement('section');deck.className='card';deck.id='holographicWorldEngine';
deck.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Holographic World Engine <span class="v6-badge">V23</span></h3><div class="muted">Course Digital Twin simulation for QA. Synthetic agents test likely route complexity; results are not predictions of real students.</div></div><button class="btn primary" id="v23RunTwin">Run digital twin simulation</button></div>
<div class="v23-grid" style="margin-top:12px"><div class="v23-card"><div class="field"><label>Synthetic cohort size</label><input id="v23Cohort" type="number" min="4" max="200" value="24"></div><div class="field"><label>Deterministic seed</label><input id="v23Seed" type="number" value="2301"></div><div class="field"><label>Simulation mode</label><select id="v23Mode"><option value="balanced">Balanced cohort</option><option value="novice-heavy">Novice-heavy</option><option value="mastery-heavy">Mastery-heavy</option></select></div><div class="v23-holo v23-nova"><img src="brand/vrc-nova-mascot.svg" alt="VRC-NOVA learning guardian"><div><b>VRC-NOVA</b><div class="muted">Interface guardian for mission guidance, accessibility reminders and simulation status. It does not grade students.</div></div></div></div><div class="v23-card"><h4 style="margin-top:0">Digital Twin Snapshot</h4><div id="v23Metrics" class="v23-metrics"></div><div id="v23TwinSummary" style="margin-top:10px"></div></div></div>`;
main.appendChild(deck);

const agents=document.createElement('section');agents.className='card';agents.id='syntheticCohortCard';
agents.innerHTML=`<div><h3 style="margin:0">Synthetic Learner Cohort <span class="v6-badge">V23</span></h3><div class="muted">Deterministic local agents with varied mastery, persistence and exploration tendencies.</div></div><div id="v23Agents" style="margin-top:12px"></div>`;
main.appendChild(agents);

const routes=document.createElement('section');routes.className='card';routes.id='routePressureCard';
routes.innerHTML=`<div><h3 style="margin:0">Route Pressure & Friction Map <span class="v6-badge">V23</span></h3><div class="muted">Highlights scenes receiving disproportionate remediation, branching or dead-end pressure in the synthetic cohort.</div></div><div id="v23Routes" style="margin-top:12px"></div>`;
main.appendChild(routes);

const nav=document.querySelector('aside .nav');if(nav){[['🧿 Holographic World Engine',deck],['👥 Synthetic Cohort',agents],['🌀 Route Pressure',routes]].forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)})}

H('v23Cohort').value=state.v23.cohortSize||24;H('v23Seed').value=state.v23.seed||2301;

function rng(seed){let x=(Number(seed)||1)>>>0;return()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296}}
function sceneById(id){return (state.scenes||[]).find(s=>String(s.id)===String(id))}
function simulate(){
 const size=Math.max(4,Math.min(200,Number(H('v23Cohort').value)||24)),seed=Number(H('v23Seed').value)||2301,mode=H('v23Mode').value,r=rng(seed),paths=state.adaptivePaths||[],scenes=state.scenes||[],start=scenes[0]?.id;
 const cohort=[],pressure={};scenes.forEach(s=>pressure[String(s.id)]={visits:0,remediation:0,mastery:0});
 for(let i=0;i<size;i++){
   let mastery=mode==='novice-heavy'?(20+r()*55):mode==='mastery-heavy'?(55+r()*45):(30+r()*65),persistence=.45+r()*.5,exploration=.2+r()*.75,current=start,steps=0,rem=0;
   const trace=[];while(current!=null&&steps<Math.max(6,scenes.length*3)){steps++;trace.push(String(current));if(pressure[String(current)])pressure[String(current)].visits++;const ap=paths.find(p=>String(p.fromSceneId)===String(current));if(ap){const threshold=Number(ap.threshold||80),noise=(r()-.5)*18,score=Math.max(0,Math.min(100,mastery+noise));if(score>=threshold){current=ap.masterySceneId;if(pressure[String(current)])pressure[String(current)].mastery++}else{current=ap.remediationSceneId;rem++;if(pressure[String(current)])pressure[String(current)].remediation++;mastery=Math.min(100,mastery+8+12*persistence)}continue}const outgoing=(state.objects||[]).filter(o=>o.type==='portal'&&String(o.sceneId)===String(current)&&o.targetSceneId).map(o=>o.targetSceneId);if(!outgoing.length)break;current=outgoing[Math.floor(r()*outgoing.length)];if(r()>exploration&&steps>2)break}
   cohort.push({id:i+1,mastery:Math.round(mastery),persistence:Number(persistence.toFixed(2)),exploration:Number(exploration.toFixed(2)),steps,remediations:rem,trace});
 }
 const avg=key=>cohort.reduce((a,x)=>a+Number(x[key]||0),0)/cohort.length,blocked=cohort.filter(x=>x.steps===1&&scenes.length>1).length,highRem=cohort.filter(x=>x.remediations>=2).length;
 state.v23.lastSimulation={at:new Date().toISOString(),size,seed,mode,cohort,pressure,summary:{avgMastery:avg('mastery'),avgSteps:avg('steps'),avgRemediations:avg('remediations'),blocked,highRem}};
 state.v23.cohortSize=size;state.v23.seed=seed;renderSimulation()
}
H('v23RunTwin').onclick=simulate;
function renderSimulation(){
 const s=state.v23.lastSimulation;if(!s){H('v23Metrics').innerHTML='<div><b>—</b><small>No run</small></div>';H('v23TwinSummary').innerHTML='<div class="muted">Run the Course Digital Twin simulation.</div>';H('v23Agents').innerHTML='';H('v23Routes').innerHTML='';return}
 H('v23Metrics').innerHTML='<div><b>'+s.size+'</b><small>Agents</small></div><div><b>'+s.summary.avgMastery.toFixed(0)+'</b><small>Avg mastery</small></div><div><b>'+s.summary.avgSteps.toFixed(1)+'</b><small>Avg steps</small></div><div><b>'+s.summary.avgRemediations.toFixed(1)+'</b><small>Avg remediation</small></div><div><b>'+s.summary.highRem+'</b><small>High remediation</small></div>';
 const warn=[];if(s.summary.highRem/s.size>.35)warn.push('A large share of synthetic agents require repeated remediation.');if(s.summary.blocked)warn.push(s.summary.blocked+' synthetic agent(s) terminate immediately from the entry scene.');H('v23TwinSummary').innerHTML=warn.length?'<div class="notice">'+warn.map(e23).join('<br>')+'</div>':'<div class="notice">No major synthetic cohort friction signal detected.</div>';
 H('v23Agents').innerHTML=s.cohort.slice(0,30).map(a=>'<div class="v23-agent"><b>Agent '+a.id+'</b><small>Mastery '+a.mastery+' · persistence '+a.persistence+' · exploration '+a.exploration+' · '+a.steps+' steps · '+a.remediations+' remediation(s)</small><small>'+a.trace.map(id=>e23(sceneById(id)?.name||id)).join(' → ')+'</small></div>').join('');
 const rows=Object.entries(s.pressure).map(([id,x])=>({id,name:sceneById(id)?.name||id,...x})).sort((a,b)=>b.visits-a.visits);H('v23Routes').innerHTML=rows.map(x=>'<div class="v23-route"><div><b>'+e23(x.name)+'</b></div><div>'+x.visits+' visits</div><div>'+x.remediation+' remediation · '+x.mastery+' mastery arrivals</div></div>').join('')
}

const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v23Checks(){
 const out=[],s=state.v23.lastSimulation;
 out.push({level:s?'pass':'warn',name:'Course Digital Twin QA',detail:s?'Latest synthetic cohort simulation contains '+s.size+' agents.':'No V23 digital twin simulation has been run.'});
 if(s){out.push({level:s.summary.highRem/s.size>.35?'warn':'pass',name:'Synthetic remediation pressure',detail:s.summary.highRem+' of '+s.size+' agents required two or more remediation passes.'});out.push({level:s.summary.blocked?'warn':'pass',name:'Synthetic entry-path continuity',detail:s.summary.blocked?s.summary.blocked+' agents terminated at the entry scene.':'No immediate entry-path termination signal detected.'})}
 out.push({level:'pass',name:'Simulation disclosure',detail:'V23 synthetic agents are deterministic QA models and are not presented as predictions of real learner behavior.'});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v23Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v23Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(H('auditPass'))H('auditPass').textContent=p;if(H('auditWarn'))H('auditWarn').textContent=w;if(H('auditFail'))H('auditFail').textContent=f;if(H('auditResults'))H('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station" style="'+(x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+e23(x.name)+'</b><div class="muted">'+e23(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

const oldRender=render;render=function(){oldRender();ensureV23();renderSimulation()};renderSimulation();
})();