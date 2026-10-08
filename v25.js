(()=>{
const P=id=>document.getElementById(id);
const e25=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV25(){
  state.version=25;
  state.v25=state.v25||{focusMode:false,lastCommand:null,commandUsage:{},guideDismissed:[]};
}
ensureV25();

const header=document.querySelector('header'),main=document.querySelector('main.workspace');
if(!header||!main)return;

/* Header command trigger */
if(!P('v25CommandTrigger')){
  const trigger=document.createElement('button');trigger.id='v25CommandTrigger';trigger.className='v25-command-trigger';
  trigger.innerHTML='<span>⌕</span><span class="label">Search & commands</span><span class="v25-kbd">⌘/Ctrl K</span>';
  const actions=header.querySelector('.actions');if(actions)header.insertBefore(trigger,actions);
}

/* Palette */
if(!P('v25Overlay')){
  const overlay=document.createElement('div');overlay.id='v25Overlay';overlay.className='v25-overlay';
  overlay.innerHTML='<div class="v25-palette" role="dialog" aria-modal="true" aria-label="Search and commands"><div class="v25-searchrow"><span>⌕</span><input id="v25Search" autocomplete="off" placeholder="Search scenes, stations, NPCs, competencies, releases or commands…"><span class="v25-kbd">ESC</span></div><div id="v25Results" class="v25-results"></div><div class="v25-footer"><span>↑↓ Navigate</span><span>↵ Open</span><span>Esc Close</span></div></div>';
  document.body.appendChild(overlay);
}
const overlay=P('v25Overlay'),search=P('v25Search'),results=P('v25Results');
let resultItems=[],activeIndex=0,lastFocus=null;

const icons={command:'⚡',scene:'◇',station:'●',npc:'◌',competency:'◎',media:'▧',release:'⬡',object:'□'};
function commandList(){
  return [
    {id:'cmd:forge',type:'command',label:'Open Immersive Lesson Forge',meta:'Authoring',action:()=>P('immersiveLessonForgeCard')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:digitaltwincompiler',type:'command',label:'Open Instructional Digital Twin Compiler',meta:'Authoring',action:()=>P('instructionalDigitalTwinCard')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:missionruntime',type:'command',label:'Open Learner Mission Runtime',meta:'Learner Experience',action:()=>P('learnerMissionRuntimeCard')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:evidencerecord',type:'command',label:'Open Learning Evidence Record',meta:'Assessment Evidence',action:()=>P('learningEvidenceRecordCard')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:sceneBuilder',type:'command',label:'Open Functional 3D Scene Builder',meta:'Authoring',action:()=>P('live3DEditorCard')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:performanceTasks',type:'command',label:'Open Authentic Performance Tasks',meta:'Assessment',action:()=>P('authenticPerformanceTasksCard')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:assessmentBlueprint',type:'command',label:'Open Assessment Blueprint & Objective Scoring',meta:'Assessment',action:()=>P('assessmentBlueprintCard')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:guidedBuilder',type:'command',label:'Open Guided Immersive Course Builder',meta:'Authoring Workflow',action:()=>P('guidedImmersiveBuilderCard')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:questionbanks',type:'command',label:'Open Question Bank & Randomized Assessment Studio',meta:'Assessment',action:()=>P('questionBankStudioCard')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:audit',type:'command',label:'Run Production Audit',meta:'QA',action:()=>window.VRClassroomAudit?.run?.(true)},
    {id:'cmd:preview',type:'command',label:'Preview Student Experience',meta:'Runtime',action:()=>P('previewBtn')?.click()},
    {id:'cmd:export',type:'command',label:'Export Audited SCORM',meta:'Blackboard',action:()=>P('exportBtn')?.click()},
    {id:'cmd:focus',type:'command',label:state.v25.focusMode?'Exit Focus Mode':'Enter Focus Mode',meta:'Workspace',action:toggleFocus},
    {id:'cmd:objectives',type:'command',label:'Go to Learning Objectives',meta:'Navigate',action:()=>P('objectivesCard')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:alignment',type:'command',label:'Go to Learning Alignment Audit',meta:'Navigate',action:()=>P('alignmentAuditCard')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:accessibility',type:'command',label:'Go to Accessibility Intelligence',meta:'Navigate',action:()=>P('accessibilityQualityCard')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:delivery',type:'command',label:'Go to Blackboard Delivery QA',meta:'Navigate',action:()=>P('blackboardDeliveryCenter')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:release',type:'command',label:'Go to Release Management',meta:'Navigate',action:()=>P('releaseManagementCard')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:digitaltwin',type:'command',label:'Run Course Digital Twin',meta:'Simulation',action:()=>P('v23RunTwin')?.click()},
    {id:'cmd:cosmic',type:'command',label:'Go to Cosmic Mission Control',meta:'Deep-XR',action:()=>P('cosmicMissionControl')?.scrollIntoView({behavior:'smooth'})},
    {id:'cmd:shortcuts',type:'command',label:'Show Keyboard Shortcuts',meta:'Help',action:()=>P('v25CommandCenterCard')?.scrollIntoView({behavior:'smooth'})}
  ]
}
function entityList(){
  const out=[];
  (state.scenes||[]).forEach(x=>out.push({id:'scene:'+x.id,type:'scene',label:x.name||String(x.id),meta:'Scene',ref:x}));
  (state.stations||[]).forEach(x=>out.push({id:'station:'+x.id,type:'station',label:x.name||String(x.id),meta:'Learning station',ref:x}));
  (state.npcs||[]).forEach(x=>out.push({id:'npc:'+x.id,type:'npc',label:x.name||'NPC',meta:x.role||'Virtual guide',ref:x}));
  (state.competencies||[]).forEach(x=>out.push({id:'competency:'+x.id,type:'competency',label:x.name||String(x.id),meta:'Competency',ref:x}));
  (state.media||[]).forEach(x=>out.push({id:'media:'+x.id,type:'media',label:x.name||String(x.id),meta:'Media asset',ref:x}));
  (state.objects||[]).slice(0,300).forEach(x=>out.push({id:'object:'+x.id,type:'object',label:x.label||x.type||String(x.id),meta:'3D object',ref:x}));
  (state.v21?.releases||[]).forEach(x=>out.push({id:'release:'+x.id,type:'release',label:'v'+x.version+' · '+x.name,meta:String(x.status||'release').toUpperCase(),ref:x}));
  return out
}
function normalized(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function score(item,q){
  const l=normalized(item.label),m=normalized(item.meta),query=normalized(q);
  if(!query)return item.type==='command'?100:20;
  if(l===query)return 200;
  if(l.startsWith(query))return 150;
  if(l.includes(query))return 100;
  if(m.includes(query))return 50;
  return 0
}
function currentResults(){
  const q=search.value.trim(),all=[...commandList(),...entityList()];
  return all.map(x=>({...x,_score:score(x,q)})).filter(x=>x._score>0).sort((a,b)=>b._score-a._score||a.label.localeCompare(b.label)).slice(0,60)
}
function renderResults(){
  resultItems=currentResults();activeIndex=Math.min(activeIndex,Math.max(0,resultItems.length-1));
  results.innerHTML=resultItems.length?resultItems.map((x,i)=>'<div class="v25-result '+(i===activeIndex?'active':'')+'" data-v25-index="'+i+'"><div class="v25-icon">'+(icons[x.type]||'•')+'</div><div><b>'+e25(x.label)+'</b><small>'+e25(x.meta||x.type)+'</small></div><span class="v25-chip">'+e25(x.type)+'</span></div>').join(''):'<div class="v25-empty">No matching project items or commands.</div>';
  results.querySelectorAll('[data-v25-index]').forEach(el=>{el.onmouseenter=()=>{activeIndex=Number(el.dataset.v25Index);highlight()};el.onclick=()=>execute(resultItems[Number(el.dataset.v25Index)])});
}
function highlight(){
  results.querySelectorAll('.v25-result').forEach((el,i)=>el.classList.toggle('active',i===activeIndex));
  results.querySelector('.v25-result.active')?.scrollIntoView({block:'nearest'});
}
function openPalette(query=''){
  lastFocus=document.activeElement;overlay.classList.add('open');search.value=query;activeIndex=0;renderResults();setTimeout(()=>search.focus(),0)
}
function closePalette(){overlay.classList.remove('open');if(lastFocus?.focus)lastFocus.focus()}
function execute(item){
  if(!item)return;state.v25.lastCommand=item.id;state.v25.commandUsage[item.id]=(state.v25.commandUsage[item.id]||0)+1;
  closePalette();
  if(item.action)return item.action();
  const x=item.ref;
  if(item.type==='scene'){state.activeSceneId=x.id;if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render()}
  else if(item.type==='station'){state.activeSceneId=x.sceneId;if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render();P('stationsCard')?.scrollIntoView({behavior:'smooth'})}
  else if(item.type==='npc'){state.activeSceneId=x.sceneId;if(typeof render==='function')render();P('npcScenarioCard')?.scrollIntoView({behavior:'smooth'})}
  else if(item.type==='competency')P('competencyMapCard')?.scrollIntoView({behavior:'smooth'});
  else if(item.type==='release')P('releaseHistoryCard')?.scrollIntoView({behavior:'smooth'});
  else if(item.type==='media')P('mediaLibraryCard')?.scrollIntoView({behavior:'smooth'});
  else if(item.type==='object'){state.activeSceneId=x.sceneId;if(typeof render==='function')render();P('v6StudioCard')?.scrollIntoView({behavior:'smooth'})}
}
P('v25CommandTrigger').onclick=()=>openPalette();
overlay.addEventListener('click',e=>{if(e.target===overlay)closePalette()});
search.addEventListener('input',()=>{activeIndex=0;renderResults()});
search.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();activeIndex=Math.min(resultItems.length-1,activeIndex+1);highlight()}else if(e.key==='ArrowUp'){e.preventDefault();activeIndex=Math.max(0,activeIndex-1);highlight()}else if(e.key==='Enter'){e.preventDefault();execute(resultItems[activeIndex])}else if(e.key==='Escape'){e.preventDefault();closePalette()}else if(e.key==='Tab'){e.preventDefault();search.focus()}});

function toggleFocus(){
  state.v25.focusMode=!state.v25.focusMode;document.documentElement.dataset.v25Focus=String(state.v25.focusMode);renderGuide();renderStatus()
}
document.documentElement.dataset.v25Focus=String(!!state.v25.focusMode);

document.addEventListener('keydown',e=>{
  const tag=(document.activeElement?.tagName||'').toLowerCase(),editing=['input','textarea','select'].includes(tag)||document.activeElement?.isContentEditable;
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();overlay.classList.contains('open')?closePalette():openPalette();return}
  if(e.key==='Escape'&&overlay.classList.contains('open')){closePalette();return}
  if(!editing&&e.key==='/'&&!overlay.classList.contains('open')){e.preventDefault();openPalette()}
  if(!editing&&e.key==='f'&&e.shiftKey){e.preventDefault();toggleFocus()}
});

/* Focus banner */
if(!P('v25FocusBanner')){const b=document.createElement('div');b.id='v25FocusBanner';b.className='v25-focus-banner';b.textContent='Focus Mode · Shift+F to exit';document.body.appendChild(b)}

/* Command center card */
const center=document.createElement('section');center.className='card';center.id='v25CommandCenterCard';
center.innerHTML='<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Intelligent Minimal Command Center <span class="v6-badge">V25</span></h3><div class="muted">Search, navigate and act across the entire project without adding visual clutter.</div></div><button class="btn" id="v25OpenPalette">Open Command Palette</button></div><div class="v25-grid" style="margin-top:12px"><div class="v25-card"><h4 style="margin-top:0">Project Status</h4><div id="v25StatusMetrics" class="v25-statusbar"></div><div id="v25StatusDetails" style="margin-top:10px"></div></div><div class="v25-card"><h4 style="margin-top:0">VRC-NOVA Contextual Guide</h4><div id="v25Guide"></div></div></div><div class="v25-grid" style="margin-top:12px"><div class="v25-card"><h4 style="margin-top:0">Keyboard</h4><div class="v25-shortcuts"><span>Search / Commands</span><span class="v25-kbd">⌘/Ctrl K</span></div><div class="v25-shortcuts"><span>Quick Search</span><span class="v25-kbd">/</span></div><div class="v25-shortcuts"><span>Focus Mode</span><span class="v25-kbd">Shift F</span></div><div class="v25-shortcuts"><span>Close palette</span><span class="v25-kbd">Esc</span></div></div><div class="v25-card"><h4 style="margin-top:0">Project Search Index</h4><div id="v25IndexStats"></div></div></div>';
main.appendChild(center);
P('v25OpenPalette').onclick=()=>openPalette();
const nav=document.querySelector('aside .nav');if(nav){const b=document.createElement('button');b.textContent='⌕ Command Center';b.onclick=()=>center.scrollIntoView({behavior:'smooth'});nav.appendChild(b)}

const oldChecks=window.VRClassroomAudit?.checks;
function statusSnapshot(){
  let checks=[];try{checks=typeof oldChecks==='function'?oldChecks():[]}catch(e){}
  const fails=checks.filter(x=>x.level==='fail').length,warns=checks.filter(x=>x.level==='warn').length;
  const rc=state.v20?.releaseCandidate,published=(state.v21?.releases||[]).find(x=>x.status==='published'),bb=state.v20?.lastBlackboardValidation;
  return {checks,fails,warns,rc,published,bb,objectives:(state.objectives||[]).length,scenes:(state.scenes||[]).length,stations:(state.stations||[]).length,questions:(state.questions||[]).length}
}
function renderStatus(){
  const s=statusSnapshot(),entities=entityList();
  P('v25StatusMetrics').innerHTML='<div><b>'+s.scenes+'</b><small>Scenes</small></div><div><b>'+s.stations+'</b><small>Stations</small></div><div><b>'+s.fails+'</b><small>Blockers</small></div><div><b>'+s.warns+'</b><small>Warnings</small></div>';
  const rows=[
    {level:s.fails?'fail':s.warns?'warn':'pass',name:'Production readiness',detail:s.fails?s.fails+' blocker(s) remain.':s.warns?s.warns+' warning(s) remain for review.':'No blockers or warnings in inherited audit checks.'},
    {level:s.rc?'pass':'warn',name:'Release Candidate',detail:s.rc?s.rc.label||s.rc.id:'No frozen Release Candidate.'},
    {level:s.published?'pass':'warn',name:'Published release',detail:s.published?'v'+s.published.version+' · '+s.published.name:'No Published release recorded.'},
    {level:s.bb?.passed?'pass':'warn',name:'Blackboard validation',detail:s.bb?.passed?'Latest validation passed.':'No complete real Blackboard validation recorded.'}
  ];
  P('v25StatusDetails').innerHTML=rows.map(x=>'<div class="v25-statusline"><span class="v25-statusdot '+(x.level==='pass'?'':x.level)+'"></span><div><b>'+e25(x.name)+'</b><div class="muted">'+e25(x.detail)+'</div></div></div>').join('');
  const counts=entities.reduce((a,x)=>(a[x.type]=(a[x.type]||0)+1,a),{});
  P('v25IndexStats').innerHTML=Object.entries(counts).map(([k,v])=>'<span class="v25-chip" style="margin:3px">'+e25(k)+' · '+v+'</span>').join('');
}
function guideSuggestions(){
  const s=statusSnapshot(),arr=[];
  if(!s.objectives)arr.push({label:'Add learning objectives',detail:'The course has no learning objectives yet.',action:()=>P('objectivesCard')?.scrollIntoView({behavior:'smooth'})});
  if(s.fails)arr.push({label:'Resolve audit blockers',detail:s.fails+' production blocker(s) need attention.',action:()=>window.VRClassroomAudit?.run?.(true)});
  if(!s.rc)arr.push({label:'Prepare a Release Candidate',detail:'Run V19/V20 QA and freeze a release candidate before production.',action:()=>P('releaseCandidateCard')?.scrollIntoView({behavior:'smooth'})});
  else if(!s.published)arr.push({label:'Advance release governance',detail:'A Release Candidate exists but no production release is Published.',action:()=>P('releaseManagementCard')?.scrollIntoView({behavior:'smooth'})});
  if(!state.v23?.lastSimulation)arr.push({label:'Run Course Digital Twin',detail:'Stress-test route friction with the deterministic synthetic cohort.',action:()=>P('v23RunTwin')?.click()});
  if(!state.v18Settings?.alternativeMode)arr.push({label:'Enable Accessible 2D Mode',detail:'Equivalent non-VR access is currently disabled.',action:()=>P('accessibilityQualityCard')?.scrollIntoView({behavior:'smooth'})});
  if(!arr.length)arr.push({label:'Review publication readiness',detail:'The project has no obvious contextual action from the current state.',action:()=>P('blackboardPublicationCard')?.scrollIntoView({behavior:'smooth'})});
  return arr.slice(0,4)
}
function renderGuide(){
  const arr=guideSuggestions();P('v25Guide').innerHTML=arr.map((x,i)=>'<div class="v25-suggestion"><img src="brand/vrc-nova-mascot.svg" alt=""><div><b>'+e25(x.label)+'</b><div class="muted">'+e25(x.detail)+'</div></div><button class="btn" data-v25-guide="'+i+'">Open</button></div>').join('');
  P('v25Guide').querySelectorAll('[data-v25-guide]').forEach(b=>b.onclick=()=>arr[Number(b.dataset.v25Guide)]?.action?.());
}

/* V25 audit */
const oldRun=window.VRClassroomAudit?.run;
function v25Checks(){
  const idx=entityList(),cmds=commandList(),dupIds=idx.length-new Set(idx.map(x=>x.id)).size;
  return [
    {level:P('v25Overlay')&&P('v25Search')?'pass':'fail',name:'Command palette accessibility structure',detail:P('v25Overlay')?'Dialog/search controls are present.':'Command palette structure is missing.'},
    {level:dupIds?'warn':'pass',name:'Global search index identifiers',detail:dupIds?dupIds+' duplicate search identifier(s) detected.':'Search index identifiers are unique.'},
    {level:cmds.length>=8?'pass':'warn',name:'Command coverage',detail:cmds.length+' global commands available.'},
    {level:P('v25Guide')?'pass':'warn',name:'Contextual VRC-NOVA guide',detail:'Guide is driven by current project state and performs no autonomous grading.'},
    {level:document.documentElement.dataset.v24Theme==='minimal-white'?'pass':'warn',name:'Minimalist theme continuity',detail:'V25 preserves the V24 minimalist white visual system.'}
  ]
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v25Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{
  const base=oldRun(scroll),extras=v25Checks(),all=[...base,...extras];
  const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;
  if(P('auditPass'))P('auditPass').textContent=p;if(P('auditWarn'))P('auditWarn').textContent=w;if(P('auditFail'))P('auditFail').textContent=f;
  if(P('auditResults'))P('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+e25(x.name)+'</b><div class="muted">'+e25(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));
  return all
};

const oldRender=render;
render=function(){oldRender();ensureV25();setTimeout(()=>{renderStatus();renderGuide()},0)};
renderStatus();renderGuide();renderResults();
})();