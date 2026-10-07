(()=>{
const D=id=>document.getElementById(id);
const e27=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV27(){
 state.version=27;
 state.v27=state.v27||{brief:'',audience:'University',assessment:'mixed',guidance:'full',interactionDensity:'standard',lastCompile:null};
}
ensureV27();
const main=document.querySelector('main.workspace');if(!main)return;
let undoSnapshot=null;

const card=document.createElement('section');card.className='card';card.id='instructionalDigitalTwinCard';
card.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Instructional Digital Twin Compiler <span class="v6-badge">V27</span></h3>
 <div class="muted">Compile the immersive world into a working instructional simulation with guides, assessments, rules and evidence logic.</div></div>
 <div class="toolbar"><button class="btn" id="v27PreviewPlan">Refresh plan</button><button class="btn primary" id="v27Compile">Compile Instructional Twin</button></div>
</div>
<div class="v27-grid" style="margin-top:14px">
 <div class="v27-panel">
  <div class="field"><label>Instructional brief</label><textarea class="v27-brief" id="v27Brief" placeholder="Describe the authentic situation, learner role, expected decisions, evidence and successful performance."></textarea></div>
  <div class="row">
   <div class="field"><label>Learner audience</label><select id="v27Audience"><option>University</option><option>Graduate</option><option>Professional training</option><option>K-12</option></select></div>
   <div class="field"><label>Assessment strategy</label><select id="v27Assessment"><option value="mixed">Mixed · decision checks + reflection</option><option value="decision">Decision checks · scored MCQ</option><option value="reflection">Reflection evidence · completion scored</option></select></div>
  </div>
  <div class="row">
   <div class="field"><label>Virtual guidance</label><select id="v27Guidance"><option value="full">Mission guide + objective coaches</option><option value="entry">Mission guide only</option><option value="objective">Objective coaches only</option><option value="none">No generated guides</option></select></div>
   <div class="field"><label>Interaction density</label><select id="v27Density"><option value="light">Light</option><option value="standard">Standard</option><option value="advanced">Advanced simulation</option></select></div>
  </div>
  <div class="v27-note">Compilation is deterministic and local. It does not call an external AI model and does not claim to understand course content semantically. Generated prompts and distractors are scaffolds that must be reviewed by the instructor.</div>
 </div>
 <div class="v27-panel">
  <h4 style="margin-top:0">Compilation Plan</h4>
  <div id="v27Metrics" class="v27-metrics"></div>
  <div id="v27PlanStatus" style="margin-top:10px"></div>
 </div>
</div>
<div class="v27-panel" style="margin-top:14px">
 <h4 style="margin-top:0">Objective → Simulation Logic</h4>
 <div id="v27Flow"></div>
</div>
<div class="v27-grid" style="margin-top:14px">
 <div class="v27-panel"><h4 style="margin-top:0">Generated Architecture</h4><div id="v27Architecture" class="v27-architecture"></div></div>
 <div class="v27-panel"><h4 style="margin-top:0">Compilation QA</h4><div id="v27QA"></div></div>
</div>
<div class="toolbar" style="margin-top:12px">
 <button class="btn" id="v27Review">Mark compiled twin as instructor-reviewed</button>
 <button class="btn danger" id="v27Undo">Undo latest compile (this session)</button>
 <span id="v27Status" class="v26-status"><span class="v26-dot"></span>No V27 instructional twin compiled yet</span>
</div>`;
const anchor=main.querySelector('#immersiveLessonForgeCard');
if(anchor)anchor.insertAdjacentElement('afterend',card);else main.insertBefore(card,main.firstChild);

const nav=document.querySelector('aside .nav');
if(nav){const b=document.createElement('button');b.innerHTML='🧬 Instructional Digital Twin <span class="badge">V27</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.insertBefore(b,nav.children[2]||null)}

D('v27Audience').value=state.v27.audience||'University';
D('v27Assessment').value=state.v27.assessment||'mixed';
D('v27Guidance').value=state.v27.guidance||'full';
D('v27Density').value=state.v27.interactionDensity||'standard';
D('v27Brief').value=state.v27.brief||('Learners enter '+(state.title||'the immersive activity')+' and must use evidence from the environment to demonstrate each learning objective, make justified decisions, and complete the required assessment.');

function objectives(){
 return (state.objectives||[]).map((o,i)=>({index:i,text:typeof o==='string'?o:(o.text||o.title||('Objective '+(i+1)))})).filter(x=>String(x.text).trim())
}
function evidenceForObjective(o,i){
 const exact=(state.stations||[]).find(s=>Number(s.objectiveIndex)===Number(o.index)&&s.required);
 if(exact)return exact;
 const req=(state.stations||[]).filter(s=>s.required);return req[i]||null
}
function sceneForEvidence(s){return s?(state.scenes||[]).find(x=>String(x.id)===String(s.sceneId)):null}
function assessmentType(i){
 const a=D('v27Assessment').value;
 if(a==='decision')return'multiple-choice';if(a==='reflection')return'reflection';return i%2===0?'multiple-choice':'reflection'
}
function plan(){
 const objs=objectives(),rows=objs.map((o,i)=>{const station=evidenceForObjective(o,i),scene=sceneForEvidence(station);return{...o,station,scene,qType:assessmentType(i)}});
 const guidance=D('v27Guidance').value,density=D('v27Density').value;
 const npcCount=(guidance==='full'?1+rows.length:guidance==='entry'?1:guidance==='objective'?rows.length:0);
 const objectCount=rows.length*(density==='light'?0:density==='standard'?1:2);
 const ruleCount=rows.length*(density==='advanced'?2:1);
 return{rows,npcCount,objectCount,ruleCount,questionCount:rows.length,missing:rows.filter(x=>!x.station||!x.scene).length}
}
function renderPlan(){
 const p=plan();
 D('v27Metrics').innerHTML='<div><b>'+p.questionCount+'</b><small>Assessments</small></div><div><b>'+p.npcCount+'</b><small>Guides</small></div><div><b>'+p.objectCount+'</b><small>Interactions</small></div><div><b>'+p.ruleCount+'</b><small>Rules</small></div><div><b>'+p.missing+'</b><small>Missing links</small></div>';
 D('v27PlanStatus').innerHTML=p.missing?'<div class="v27-status"><span class="v27-dot fail"></span><div><b>World is not ready to compile</b><div class="muted">'+p.missing+' objective(s) lack a required evidence station or scene. Use V26 Immersive Lesson Forge first, or map the current stations to objectives.</div></div></div>':'<div class="v27-status"><span class="v27-dot"></span><div><b>Instructional world can be compiled</b><div class="muted">Every objective resolves to a required evidence station and immersive scene.</div></div></div>';
 D('v27Flow').innerHTML=p.rows.length?p.rows.map((r,i)=>'<div class="v27-flow"><span class="v27-num">'+(i+1)+'</span><div><b>'+e27(r.text)+'</b><div class="muted">'+e27(r.scene?.name||'Missing scene')+'</div></div><div><span class="v27-tag">'+e27(r.station?.name||'Missing evidence')+'</span></div><div><span class="v27-tag">'+e27(r.qType==='reflection'?'Reflection evidence':'Decision check')+'</span><span class="v27-tag">'+e27(D('v27Guidance').value==='none'?'No guide':'Guided')+'</span></div><div>'+Number(r.station?.points||0)+' pts</div></div>').join(''):'<div class="muted">Add learning objectives to build the compilation plan.</div>';
 D('v27Architecture').innerHTML='<div><b>Evidence Layer</b><small>Required stations become measurable assessment anchors rather than decorative stops.</small></div><div><b>Interaction Layer</b><small>Inspectable evidence and optional trigger zones connect physical exploration to the learning objective.</small></div><div><b>Guidance Layer</b><small>Rule-based virtual guides use editable branching dialogue. No autonomous grading or model API is implied.</small></div>';
 renderQA()
}
['v27Audience','v27Assessment','v27Guidance','v27Density'].forEach(id=>D(id).addEventListener('change',renderPlan));
D('v27Brief').addEventListener('input',()=>state.v27.brief=D('v27Brief').value);
D('v27PreviewPlan').onclick=renderPlan;

function snap(){
 return JSON.parse(JSON.stringify({stations:state.stations||[],questions:state.questions||[],npcs:state.npcs||[],rules:state.rules||[],variables:state.variables||{},objects:state.objects||[],competencies:state.competencies||[],v27:state.v27||{}}))
}
function restore(s){
 if(!s)return;state.stations=s.stations;state.questions=s.questions;state.npcs=s.npcs;state.rules=s.rules;state.variables=s.variables;state.objects=s.objects;state.competencies=s.competencies;state.v27=s.v27;
 if(typeof render==='function')render()
}
function restorePreviousWeights(){
 const old=state.v27.lastCompile;
 if(!old?.stationWeights)return;
 for(const w of old.stationWeights){const s=(state.stations||[]).find(x=>String(x.id)===String(w.stationId));if(s)s.points=Number(w.originalPoints||0)}
}
function removePreviousGenerated(){
 const old=state.v27.lastCompile;if(!old)return;
 const rm=(arr,ids)=>arr.filter(x=>!(ids||[]).some(id=>String(id)===String(x.id)));
 for(const comp of state.competencies||[])comp.questionIds=(comp.questionIds||[]).filter(id=>!(old.questionIds||[]).some(qid=>String(qid)===String(id)));
 state.questions=rm(state.questions||[],old.questionIds);
 state.npcs=rm(state.npcs||[],old.npcIds);
 state.rules=rm(state.rules||[],old.ruleIds);
 state.objects=rm(state.objects||[],old.objectIds);
 for(const v of old.variableNames||[])delete state.variables[v];
}
let numericSeed=0;
function numId(offset=0){numericSeed=Math.max(numericSeed,Date.now()+offset);return ++numericSeed}
function strId(prefix,i){return prefix+'-'+Date.now().toString(36)+'-'+i+'-'+Math.random().toString(36).slice(2,5)}
function briefText(){return D('v27Brief').value.trim()||'Use evidence from the immersive environment to demonstrate mastery of the learning objectives.'}
function guideNPC(sceneId,name,role,text,index){
 const start='start',mission='mission',evidence='evidence';
 return{id:numId(1000+index),sceneId,name,role,dialogue:text,startNodeId:start,dialogueNodes:[
  {id:start,text,choices:[{text:'Review the mission',targetNodeId:mission},{text:'What counts as evidence?',targetNodeId:evidence}]},
  {id:mission,text:'Your task is to use the immersive environment to demonstrate the assigned learning objective and justify your decisions.',choices:[{text:'Back',targetNodeId:start}]},
  {id:evidence,text:'Complete the required evidence station. Inspect relevant objects, respond to the assessment, and verify that your response is supported by the objective.',choices:[{text:'Back',targetNodeId:start}]}
 ],x:1.4,y:0,z:-3.5,rotationY:0,modelAssetId:'',requiredVariable:'',requiredValue:'true',setVariable:'',setValue:'true',points:0,v27Generated:true}
}
function questionFor(row,i,points){
 const type=row.qType;
 if(type==='reflection')return{id:numId(2000+i),stationId:row.station.id,type:'reflection',prompt:'Provide a concise evidence-based reflection showing how you met this objective: '+row.text,choices:[],answer:'',points,v27Generated:true,objectiveIndex:row.index};
 const correct='Use relevant evidence to demonstrate the objective and justify the decision.';
 return{id:numId(2000+i),stationId:row.station.id,type:'multiple-choice',prompt:'Which response best demonstrates this objective in the immersive activity? '+row.text,choices:[
  correct,
  'Choose an action without consulting the available evidence.',
  'Complete the activity by focusing only on navigation rather than the objective.',
  'Select the first available option without explaining the decision.'
 ],answer:correct,points,v27Generated:true,objectiveIndex:row.index}
}
function inspectionFor(row,i){
 return{id:numId(3000+i),sceneId:row.scene.id,type:'inspection',label:'Evidence Artifact '+(i+1),x:-2+(i%3)*2,y:1,z:-6-(i%2),rotationY:0,scale:1,inspectionText:'Inspect this artifact and connect the available evidence to the objective: '+row.text,v27Generated:true,objectiveIndex:row.index}
}
function zoneFor(row,i,varName){
 return{id:numId(4000+i),sceneId:row.scene.id,type:'trigger-zone',label:'Evidence Zone '+(i+1),x:2,y:1,z:-5,rotationY:0,scale:1,radius:2,message:'You entered the evidence-analysis zone for Objective '+(i+1)+'.',setVariable:varName,setValue:'entered',v27Generated:true,objectiveIndex:row.index}
}
function ruleSetVariable(stationId,varName,i){
 return{id:strId('v27-rule',i),name:'Record evidence completion '+(i+1),enabled:true,event:'station-complete',sourceId:String(stationId),conditionEnabled:false,conditionVar:'',operator:'equals',conditionValue:'true',action:'set-variable',targetSceneId:'',setVar:varName,setValue:'true',message:'',points:0,seconds:5,once:true,v27Generated:true}
}
function ruleFeedback(stationId,i){
 return{id:strId('v27-feedback',i),name:'Evidence feedback '+(i+1),enabled:true,event:'station-complete',sourceId:String(stationId),conditionEnabled:false,conditionVar:'',operator:'equals',conditionValue:'true',action:'show-message',targetSceneId:'',setVar:'',setValue:'',message:'Evidence '+(i+1)+' recorded. Continue through the immersive activity and connect your response to the learning objective.',points:0,seconds:5,once:true,v27Generated:true}
}
function compile(){
 const p=plan();if(!p.rows.length)return alert('Add learning objectives first.');if(p.missing)return alert('Some objectives do not have a required evidence station and immersive scene. Use V26 Immersive Lesson Forge first or complete the mappings before compiling.');
 if(!confirm('Compile the current immersive world into an instructional digital twin? Generated V27 questions, guides, rules and interaction objects can be undone during this session.'))return;
 undoSnapshot=snap();restorePreviousWeights();removePreviousGenerated();
 state.v27.brief=briefText();state.v27.audience=D('v27Audience').value;state.v27.assessment=D('v27Assessment').value;state.v27.guidance=D('v27Guidance').value;state.v27.interactionDensity=D('v27Density').value;
 state.variables=state.variables||{};
 const questionIds=[],npcIds=[],ruleIds=[],objectIds=[],variableNames=[],stationWeights=[];
 const guidance=D('v27Guidance').value,density=D('v27Density').value;
 if(guidance==='full'||guidance==='entry'){
  const entry=(state.scenes||[]).find(s=>String(s.id)===String(state.activeSceneId))||(state.scenes||[])[0];
  if(entry){const n=guideNPC(entry.id,'Mission Learning Guide','Instructional facilitator',briefText(),0);state.npcs.push(n);npcIds.push(n.id)}
 }
 p.rows.forEach((row,i)=>{
  const originalPoints=Number(row.station.points||0);stationWeights.push({stationId:row.station.id,originalPoints});
  row.station.points=0;
  const q=questionFor(row,i,originalPoints);state.questions.push(q);questionIds.push(q.id);
  const varName='v27_evidence_'+(i+1)+'_complete';state.variables[varName]='false';variableNames.push(varName);
  const r=ruleSetVariable(row.station.id,varName,i);state.rules.push(r);ruleIds.push(r.id);
  if(density==='advanced'){const rf=ruleFeedback(row.station.id,i);state.rules.push(rf);ruleIds.push(rf.id)}
  if(density!=='light'){const obj=inspectionFor(row,i);state.objects.push(obj);objectIds.push(obj.id)}
  if(density==='advanced'){const z=zoneFor(row,i,varName);state.objects.push(z);objectIds.push(z.id)}
  if(guidance==='full'||guidance==='objective'){const n=guideNPC(row.scene.id,'Objective '+(i+1)+' Coach','Objective coach','Focus on this objective: '+row.text,i+1);state.npcs.push(n);npcIds.push(n.id)}
  const comp=(state.competencies||[]).find(c=>(c.stationIds||[]).some(id=>String(id)===String(row.station.id)));if(comp){comp.questionIds=Array.from(new Set([...(comp.questionIds||[]),q.id]))}
 });
 const scoredQuestions=(state.questions||[]).filter(q=>questionIds.some(id=>String(id)===String(q.id))).reduce((a,q)=>a+Number(q.points||0),0);
 state.v27.lastCompile={compiledAt:new Date().toISOString(),reviewedAt:null,brief:state.v27.brief,audience:state.v27.audience,assessment:state.v27.assessment,guidance,interactionDensity:density,questionIds,npcIds,ruleIds,objectIds,variableNames,stationWeights,totalAssessmentPoints:scoredQuestions};
 if(typeof render==='function')render();renderPlan();renderStatus();
 alert('Instructional Digital Twin compiled. Review generated questions, distractors, guide dialogue and interaction logic before final SCORM export.')
}
D('v27Compile').onclick=compile;
D('v27Review').onclick=()=>{const x=state.v27.lastCompile;if(!x)return alert('Compile an instructional twin first.');x.reviewedAt=new Date().toISOString();x.reviewedBy=state.ownership?.owner||'Instructor';renderStatus();renderQA();alert('Latest V27 instructional twin marked as instructor-reviewed.')};
D('v27Undo').onclick=()=>{if(!undoSnapshot)return alert('No in-session V27 compile snapshot is available.');if(!confirm('Restore the project state from immediately before the latest V27 compilation?'))return;restore(undoSnapshot);undoSnapshot=null;renderPlan();renderStatus()};
function renderStatus(){
 const x=state.v27.lastCompile,el=D('v27Status');if(!el)return;
 if(!x){el.innerHTML='<span class="v26-dot"></span>No V27 instructional twin compiled yet';return}
 el.innerHTML='<span class="v26-dot '+(x.reviewedAt?'':'warn')+'"></span>'+e27(x.reviewedAt?'Instructor-reviewed':'Awaiting instructor review')+' · '+x.questionIds.length+' assessments · '+x.npcIds.length+' guides · '+x.ruleIds.length+' rules'
}

function checks(){
 const x=state.v27.lastCompile;if(!x)return[{level:'warn',name:'Instructional Digital Twin',detail:'No V27 instructional twin has been compiled.'}];
 const qs=state.questions||[],npcs=state.npcs||[],rules=state.rules||[],objs=state.objects||[],stations=state.stations||[],scenes=state.scenes||[];
 const genQ=qs.filter(q=>x.questionIds.some(id=>String(id)===String(q.id))),genN=npcs.filter(n=>x.npcIds.some(id=>String(id)===String(n.id))),genR=rules.filter(r=>x.ruleIds.some(id=>String(id)===String(r.id)));
 const qPoints=genQ.reduce((a,q)=>a+Number(q.points||0),0);
 const doubleScore=x.stationWeights.filter(w=>{const s=stations.find(st=>String(st.id)===String(w.stationId));return s&&Number(s.points||0)>0&&genQ.some(q=>String(q.stationId)===String(s.id)&&Number(q.points||0)>0)}).length;
 const missingQuestion=x.stationWeights.filter(w=>!genQ.some(q=>String(q.stationId)===String(w.stationId))).length;
 const brokenRule=genR.filter(r=>r.event==='station-complete'&&!stations.some(s=>String(s.id)===String(r.sourceId))).length;
 let brokenDialogue=0;for(const n of genN){const nodes=n.dialogueNodes||[];for(const node of nodes)for(const ch of node.choices||[])if(!nodes.some(x=>x.id===ch.targetNodeId))brokenDialogue++}
 const missingScenes=genN.filter(n=>!scenes.some(s=>String(s.id)===String(n.sceneId))).length;
 const missingObjs=(x.objectIds||[]).filter(id=>!objs.some(o=>String(o.id)===String(id))).length;
 const reflections=genQ.filter(q=>q.type==='reflection').length;
 return[
  {level:missingQuestion?'fail':'pass',name:'V27 assessed evidence coverage',detail:missingQuestion?missingQuestion+' compiled evidence station(s) lack assessment.':'Every compiled evidence station has an assessment.'},
  {level:qPoints===100?'pass':'warn',name:'V27 assessment weight',detail:'Compiled assessment total is '+qPoints+' / 100 points.'},
  {level:doubleScore?'fail':'pass',name:'V27 duplicate scoring protection',detail:doubleScore?doubleScore+' evidence station(s) award both station and assessment points.':'Generated scored evidence is not double-counted.'},
  {level:brokenRule?'fail':'pass',name:'V27 rule source integrity',detail:brokenRule?brokenRule+' rule(s) reference missing stations.':'Generated completion rules reference valid stations.'},
  {level:brokenDialogue?'fail':'pass',name:'V27 guide dialogue integrity',detail:brokenDialogue?brokenDialogue+' dialogue choice(s) target missing nodes.':'Generated guide dialogue targets resolve.'},
  {level:missingScenes?'fail':'pass',name:'V27 guide placement',detail:missingScenes?missingScenes+' guide(s) reference missing scenes.':'Generated guides are placed in existing scenes.'},
  {level:missingObjs?'warn':'pass',name:'V27 interaction objects',detail:missingObjs?missingObjs+' generated interaction object(s) are missing.':'Generated interaction objects remain present.'},
  {level:reflections?'warn':'pass',name:'V27 reflection scoring semantics',detail:reflections?reflections+' reflection assessment(s) award completion points for a non-empty response; instructor review of rubric/quality expectations is required.':'No completion-scored reflection assessments were generated.'},
  {level:x.reviewedAt?'pass':'warn',name:'V27 instructor review gate',detail:x.reviewedAt?'Latest compiled twin was instructor-reviewed.':'Generated questions, distractors and dialogue require instructor review before final export.'}
 ]
}
function renderQA(){const box=D('v27QA');if(!box)return;box.innerHTML=checks().map(x=>'<div class="v27-status"><span class="v27-dot '+(x.level==='pass'?'':x.level)+'"></span><div><b>'+e27(x.name)+'</b><div class="muted">'+e27(x.detail)+'</div></div></div>').join('')}
const oldValidateV27=validateProject;
validateProject=function(){
 const issues=oldValidateV27(),x=state.v27?.lastCompile;
 if(x&&!x.reviewedAt)issues.push('Review and mark the latest V27 compiled instructional twin before final SCORM export.');
 return [...new Set(issues)]
};
const oldChecks=window.VRClassroomAudit?.checks,oldRun=window.VRClassroomAudit?.run;
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{
 const base=oldRun(scroll),extras=checks(),all=[...base,...extras],p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;
 if(D('auditPass'))D('auditPass').textContent=p;if(D('auditWarn'))D('auditWarn').textContent=w;if(D('auditFail'))D('auditFail').textContent=f;
 if(D('auditResults'))D('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+e27(x.name)+'</b><div class="muted">'+e27(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));
 return all
};
const oldRender=render;
render=function(){oldRender();ensureV27();setTimeout(()=>{renderPlan();renderStatus()},0)};
renderPlan();renderStatus();
})();