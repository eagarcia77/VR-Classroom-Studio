(()=>{
const Z=id=>document.getElementById(id);
const esc10=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV10(){
 state.version=10;
 state.smartScenario=state.smartScenario||{topic:'',audience:'University',complexity:'moderate'};
 state.mediaMeta=state.mediaMeta||{};
 (state.npcs||[]).forEach(n=>{n.dialogueNodes=n.dialogueNodes||[{id:'start',text:n.dialogue||'Hello.',choices:[]}];n.startNodeId=n.startNodeId||'start'});
}
ensureV10();
const main=document.querySelector('main.workspace');if(!main)return;

/* Visual Logic Builder */
const logic=document.createElement('section');logic.className='card';logic.id='visualLogicCard';
logic.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Visual Logic Builder <span class="v6-badge">V10</span></h3><div class="muted">Edit simulation behavior visually instead of relying on prompt dialogs.</div></div><button class="btn primary" id="v10NewRule">+ Visual Rule</button></div>
<div class="v10-grid" style="margin-top:12px"><div><div id="v10RuleList" class="v10-list"></div></div><div class="v10-card"><h4 style="margin-top:0">Rule Editor</h4><div id="v10RuleEditor" class="muted">Select or create a rule.</div></div></div>`;
main.appendChild(logic);

/* Dialogue */
const dialogue=document.createElement('section');dialogue.className='card';dialogue.id='branchDialogueCard';
dialogue.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Branching Dialogue Studio <span class="v6-badge">V10</span></h3><div class="muted">Create non-linear NPC conversations with choices and variable updates.</div></div></div>
<div class="v10-grid" style="margin-top:12px"><div class="v10-card"><div class="field"><label>NPC</label><select id="v10NPCSelect"></select></div><div id="v10DialogueNodes"></div><button class="btn primary" id="v10AddNode">+ Dialogue node</button></div><div class="v10-card"><h4 style="margin-top:0">Dialogue Preview</h4><div id="v10DialoguePreview" class="muted">Select an NPC.</div></div></div>`;
main.appendChild(dialogue);

/* Smart generator */
const smart=document.createElement('section');smart.className='card';smart.id='smartScenarioCard';
smart.innerHTML=`
<div><h3 style="margin:0">Smart Scenario Generator <span class="v6-badge">V10</span></h3><div class="muted">Generate a structured immersive learning blueprint locally from a pedagogical brief. No external API or student data is used.</div></div>
<div class="v10-editor" style="margin-top:12px">
 <div class="field"><label>Topic / course concept</label><input id="v10Topic" placeholder="e.g. Cybersecurity incident response"></div>
 <div class="field"><label>Audience</label><select id="v10Audience"><option>Undergraduate</option><option selected>Graduate</option><option>Professional training</option><option>K-12</option></select></div>
 <div class="field"><label>Learning objective</label><input id="v10Objective" placeholder="e.g. Apply an evidence-based response procedure"></div>
 <div class="field"><label>Scenario pattern</label><select id="v10Pattern"><option value="guided">Guided Exploration</option><option value="simulation">Decision Simulation</option><option value="escape">Educational Escape Room</option><option value="case">Immersive Case Study</option></select></div>
 <div class="field"><label>Number of scenes</label><input id="v10SceneCount" type="number" min="2" max="6" value="3"></div>
 <div class="field"><label>Complexity</label><select id="v10Complexity"><option value="simple">Simple</option><option value="moderate" selected>Moderate</option><option value="advanced">Advanced</option></select></div>
</div>
<div class="toolbar"><button class="btn primary" id="v10Generate">Generate blueprint</button><button class="btn" id="v10Apply">Apply generated blueprint</button></div>
<div id="v10Generated" class="notice" style="margin-top:12px">Enter a topic and objective, then generate a blueprint.</div>
<div id="v10GeneratedStats" class="v10-summary"></div>`;
main.appendChild(smart);

/* Media accessibility */
const media=document.createElement('section');media.className='card';media.id='mediaAccessibilityCard';
media.innerHTML=`
<div><h3 style="margin:0">Media Accessibility Metadata <span class="v6-badge">V10</span></h3><div class="muted">Add captions, transcripts and descriptions to packaged media assets.</div></div>
<div class="field"><label>Asset</label><select id="v10MediaSelect"></select></div>
<div class="v10-editor"><div class="field"><label>Accessible title</label><input id="v10MediaTitle"></div><div class="field"><label>Language</label><input id="v10MediaLang" value="en"></div><div class="field"><label>Caption / transcript status</label><select id="v10CaptionStatus"><option value="not-applicable">Not applicable</option><option value="planned">Planned</option><option value="available">Available</option></select></div><div class="field"><label>Transcript / description</label><textarea id="v10Transcript"></textarea></div></div>
<button class="btn primary" id="v10SaveMediaMeta">Save metadata</button>`;
main.appendChild(media);

const nav=document.querySelector('aside .nav');if(nav){[['🧠 Visual Logic',logic],['💬 Dialogue Studio',dialogue],['✨ Smart Generator',smart],['♿ Media Metadata',media]].forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)})}

/* Visual rules */
let selectedRuleId=null;
const ruleById=id=>(state.rules||[]).find(r=>String(r.id)===String(id));
function eventSourceOptions(event){
 if(event==='object-click')return (state.objects||[]).map(o=>'<option value="'+esc10(o.id)+'">'+esc10(o.label||o.type)+'</option>').join('');
 if(event==='scene-enter')return (state.scenes||[]).map(s=>'<option value="'+esc10(s.id)+'">'+esc10(s.name)+'</option>').join('');
 if(event==='station-complete')return (state.stations||[]).map(s=>'<option value="'+esc10(s.id)+'">'+esc10(s.name)+'</option>').join('');
 return '<option value="timer">Timer</option>';
}
function renderRuleList(){
 const box=Z('v10RuleList');if(!box)return;
 box.innerHTML=(state.rules||[]).length?(state.rules||[]).map(r=>`<div class="v10-item ${String(r.id)===String(selectedRuleId)?'active':''}" data-rid="${esc10(r.id)}"><b>${esc10(r.name||'Rule')}</b><div class="v10-logic"><div class="v10-node"><b>WHEN</b><small>${esc10(r.event)}</small><small>${esc10(r.sourceId||'')}</small></div><div class="v10-arrow">→</div><div class="v10-node"><b>IF</b><small>${r.conditionEnabled?esc10((r.conditionVar||'')+' '+(r.operator||'equals')+' '+(r.conditionValue||'')):'Always'}</small></div><div class="v10-arrow">→</div><div class="v10-node"><b>THEN</b><small>${esc10(r.action||'')}</small></div></div></div>`).join(''):'<div class="muted">No rules yet.</div>';
 box.querySelectorAll('[data-rid]').forEach(el=>el.onclick=()=>{selectedRuleId=el.dataset.rid;renderRuleList();renderRuleEditor()})
}
function renderRuleEditor(){
 const box=Z('v10RuleEditor'),r=ruleById(selectedRuleId);if(!r){box.innerHTML='Select or create a rule.';return}
 const vars=Object.keys(state.variables||{});box.innerHTML=`
 <div class="field"><label>Name</label><input id="v10RName" value="${esc10(r.name||'Rule')}"></div>
 <div class="field"><label>WHEN</label><select id="v10REvent"><option value="object-click">Object clicked</option><option value="scene-enter">Scene entered</option><option value="station-complete">Station completed</option><option value="timer">Timer</option></select></div>
 <div class="field"><label>Source</label><select id="v10RSource"></select></div>
 <div class="field"><label>IF</label><select id="v10RCond"><option value="false">Always</option><option value="true">Variable condition</option></select></div>
 <div class="field"><label>Condition variable</label><select id="v10RVar">${vars.map(v=>'<option>'+esc10(v)+'</option>').join('')}</select></div>
 <div class="field"><label>Operator</label><select id="v10ROp"><option value="equals">Equals</option><option value="not-equals">Not equals</option><option value="greater">Greater</option><option value="less">Less</option></select></div>
 <div class="field"><label>Condition value</label><input id="v10RValue" value="${esc10(r.conditionValue||'true')}"></div>
 <div class="field"><label>THEN</label><select id="v10RAction"><option value="show-message">Show message</option><option value="open-scene">Open scene</option><option value="set-variable">Set variable</option><option value="add-score">Add bonus score</option></select></div>
 <div id="v10ActionFields"></div>
 <div class="toolbar"><button class="btn primary" id="v10RSave">Save rule</button><button class="btn danger" id="v10RDelete">Delete</button></div>`;
 Z('v10REvent').value=r.event||'object-click';Z('v10RCond').value=String(!!r.conditionEnabled);Z('v10ROp').value=r.operator||'equals';Z('v10RAction').value=r.action||'show-message';if(Z('v10RVar'))Z('v10RVar').value=r.conditionVar||vars[0]||'';
 function sources(){Z('v10RSource').innerHTML=eventSourceOptions(Z('v10REvent').value);Z('v10RSource').value=String(r.sourceId||'')}
 function actionFields(){const a=Z('v10RAction').value,holder=Z('v10ActionFields');if(a==='open-scene')holder.innerHTML='<div class="field"><label>Target scene</label><select id="v10RTarget">'+(state.scenes||[]).map(s=>'<option value="'+esc10(s.id)+'">'+esc10(s.name)+'</option>').join('')+'</select></div>';else if(a==='set-variable')holder.innerHTML='<div class="field"><label>Variable</label><select id="v10RSetVar">'+vars.map(v=>'<option>'+esc10(v)+'</option>').join('')+'</select></div><div class="field"><label>Value</label><input id="v10RSetValue" value="'+esc10(r.setValue||'true')+'"></div>';else if(a==='add-score')holder.innerHTML='<div class="field"><label>Bonus points</label><input id="v10RPoints" type="number" value="'+Number(r.points||10)+'"></div>';else holder.innerHTML='<div class="field"><label>Message</label><textarea id="v10RMessage">'+esc10(r.message||'Interaction completed.')+'</textarea></div>';if(Z('v10RTarget'))Z('v10RTarget').value=String(r.targetSceneId||'');if(Z('v10RSetVar'))Z('v10RSetVar').value=r.setVar||vars[0]||''}
 sources();actionFields();Z('v10REvent').onchange=sources;Z('v10RAction').onchange=actionFields;
 Z('v10RSave').onclick=()=>{r.name=Z('v10RName').value.trim()||'Rule';r.event=Z('v10REvent').value;r.sourceId=Z('v10RSource').value;r.conditionEnabled=Z('v10RCond').value==='true';r.conditionVar=Z('v10RVar')?.value||'';r.operator=Z('v10ROp').value;r.conditionValue=Z('v10RValue').value;r.action=Z('v10RAction').value;if(r.action==='open-scene')r.targetSceneId=Z('v10RTarget').value;if(r.action==='set-variable'){r.setVar=Z('v10RSetVar').value;r.setValue=Z('v10RSetValue').value}if(r.action==='add-score')r.points=Number(Z('v10RPoints').value)||0;if(r.action==='show-message')r.message=Z('v10RMessage').value;renderRuleList();renderRuleEditor();if(typeof renderRules==='function')renderRules()};
 Z('v10RDelete').onclick=()=>{state.rules=state.rules.filter(x=>String(x.id)!==String(r.id));selectedRuleId=null;renderRuleList();renderRuleEditor();if(typeof renderRules==='function')renderRules()}
}
Z('v10NewRule').onclick=()=>{const r={id:'visual-'+Date.now(),name:'Visual Rule',enabled:true,event:'scene-enter',sourceId:String(state.activeSceneId||''),conditionEnabled:false,conditionVar:Object.keys(state.variables||{})[0]||'',operator:'equals',conditionValue:'true',action:'show-message',message:'Welcome to this scene.',once:true};state.rules.push(r);selectedRuleId=r.id;renderRuleList();renderRuleEditor();if(typeof renderRules==='function')renderRules()};

/* Branch dialogue */
function npcSelect(){const s=Z('v10NPCSelect');if(!s)return;s.innerHTML='<option value="">Select NPC</option>'+(state.npcs||[]).map(n=>'<option value="'+n.id+'">'+esc10(n.name)+'</option>').join('')}
function selectedNPC(){return (state.npcs||[]).find(n=>String(n.id)===String(Z('v10NPCSelect')?.value))}
function renderDialogue(){
 const n=selectedNPC(),box=Z('v10DialogueNodes'),prev=Z('v10DialoguePreview');if(!box||!prev)return;
 if(!n){box.innerHTML='<div class="muted">Select an NPC.</div>';prev.innerHTML='Select an NPC.';return}
 n.dialogueNodes=n.dialogueNodes||[{id:'start',text:n.dialogue||'Hello.',choices:[]}];n.startNodeId=n.startNodeId||n.dialogueNodes[0]?.id||'start';
 box.innerHTML=n.dialogueNodes.map(node=>`<div class="v10-dialogue" data-node="${esc10(node.id)}"><div class="field"><label>Node ID</label><input data-nid value="${esc10(node.id)}"></div><div class="field"><label>Dialogue text</label><textarea data-ntext>${esc10(node.text||'')}</textarea></div><div class="v10-choice"><input data-ctext placeholder="Choice text"><select data-ctarget>${n.dialogueNodes.map(x=>'<option value="'+esc10(x.id)+'">'+esc10(x.id)+'</option>').join('')}</select><button class="btn" data-addchoice>Add choice</button></div><div>${(node.choices||[]).map((c,i)=>'<span class="v10-tag">'+esc10(c.text)+' → '+esc10(c.targetNodeId)+' <button data-rmchoice="'+i+'" style="border:0;background:none;color:#fca5a5">×</button></span>').join('')}</div><div class="toolbar" style="margin-top:8px"><button class="btn" data-start>Set as start</button><button class="btn danger" data-rmnode>Delete node</button></div></div>`).join('');
 box.querySelectorAll('[data-node]').forEach(el=>{const node=n.dialogueNodes.find(x=>x.id===el.dataset.node);el.querySelector('[data-nid]').onchange=e=>{const old=node.id,newId=e.target.value.trim();if(!newId||n.dialogueNodes.some(x=>x!==node&&x.id===newId)){e.target.value=old;return}node.id=newId;n.dialogueNodes.forEach(x=>(x.choices||[]).forEach(c=>{if(c.targetNodeId===old)c.targetNodeId=newId}));if(n.startNodeId===old)n.startNodeId=newId;renderDialogue()};el.querySelector('[data-ntext]').onchange=e=>node.text=e.target.value;el.querySelector('[data-addchoice]').onclick=()=>{const text=el.querySelector('[data-ctext]').value.trim(),target=el.querySelector('[data-ctarget]').value;if(!text||!target)return;node.choices=node.choices||[];node.choices.push({text,targetNodeId:target});renderDialogue()};el.querySelectorAll('[data-rmchoice]').forEach(b=>b.onclick=()=>{node.choices.splice(Number(b.dataset.rmchoice),1);renderDialogue()});el.querySelector('[data-start]').onclick=()=>{n.startNodeId=node.id;renderDialogue()};el.querySelector('[data-rmnode]').onclick=()=>{if(n.dialogueNodes.length<=1)return alert('An NPC needs at least one dialogue node.');n.dialogueNodes=n.dialogueNodes.filter(x=>x!==node);n.dialogueNodes.forEach(x=>x.choices=(x.choices||[]).filter(c=>c.targetNodeId!==node.id));if(n.startNodeId===node.id)n.startNodeId=n.dialogueNodes[0].id;renderDialogue()}});
 const start=n.dialogueNodes.find(x=>x.id===n.startNodeId)||n.dialogueNodes[0];prev.innerHTML='<b>'+esc10(n.name)+'</b><p>'+esc10(start?.text||'')+'</p><div>'+(start?.choices||[]).map(c=>'<span class="v10-tag">'+esc10(c.text)+'</span>').join('')+'</div><small class="muted">Start node: '+esc10(n.startNodeId)+'</small>'
}
Z('v10NPCSelect').onchange=renderDialogue;
Z('v10AddNode').onclick=()=>{const n=selectedNPC();if(!n)return alert('Select an NPC first.');let i=1,id='node'+i;while(n.dialogueNodes.some(x=>x.id===id))id='node'+(++i);n.dialogueNodes.push({id,text:'New dialogue step.',choices:[]});renderDialogue()};

/* Smart scenario generator */
let generated=null;
function generateBlueprint(){
 const topic=Z('v10Topic').value.trim(),objective=Z('v10Objective').value.trim(),pattern=Z('v10Pattern').value,count=Math.max(2,Math.min(6,Number(Z('v10SceneCount').value)||3)),complexity=Z('v10Complexity').value;if(!topic||!objective)return alert('Enter both a topic and a learning objective.');
 const names=pattern==='escape'?['Orientation','Evidence Room','Challenge Room','Final Unlock','Debrief','Extension']:pattern==='simulation'?['Briefing','Operational Scene','Decision Point','Consequence Lab','Debrief','Extension']:pattern==='case'?['Case Brief','Evidence Gallery','Analysis Room','Decision Room','Debrief','Extension']:['Welcome Hub','Exploration Lab','Application Room','Assessment Center','Reflection Lounge','Extension'];
 const scenes=Array.from({length:count},(_,i)=>({id:'gen-scene-'+Date.now()+'-'+i,name:names[i]||('Scene '+(i+1)),environment:i===0?'Immersive Academic Hub':'Simulation Lab'}));
 const stations=scenes.map((s,i)=>({id:Date.now()+100+i,sceneId:s.id,name:i===0?'Orientation to '+topic:i===scenes.length-1?'Final Reflection':'Challenge '+i+' — '+topic,type:i===scenes.length-1?'reflection':i===0?'resource':'question',content:i===0?'Review the scenario, objective and success criteria.':i===scenes.length-1?'Reflect on how the decisions support the learning objective.':'Apply '+topic+' to an authentic decision point aligned with: '+objective,points:Math.round(100/count),required:true,alt:'Learning station: '+topic}));
 const variables={scenarioReady:'false',decisionComplete:'false'};
 const rules=[];for(let i=0;i<scenes.length-1;i++)rules.push({id:'gen-rule-'+i+'-'+Date.now(),name:'Advance from '+scenes[i].name,event:'station-complete',sourceId:String(stations[i].id),conditionEnabled:false,action:'open-scene',targetSceneId:scenes[i+1].id,enabled:true,once:true});
 const npcs=[{id:Date.now()+999,sceneId:scenes[0].id,name:'Virtual Learning Guide',role:'Scenario facilitator',dialogue:'Welcome to '+topic+'. Your objective is to '+objective+'.',dialogueNodes:[{id:'start',text:'Welcome to '+topic+'. Your objective is to '+objective+'.',choices:[]}],startNodeId:'start',x:1,y:0,z:-4,rotationY:0,modelAssetId:'',requiredVariable:'',requiredValue:'true',setVariable:'scenarioReady',setValue:'true',points:0}];
 generated={topic,objective,pattern,complexity,scenes,stations,variables,rules,npcs};Z('v10Generated').innerHTML='<b>Blueprint ready:</b> '+esc10(topic)+' · '+esc10(pattern)+' · '+count+' scenes · '+esc10(complexity)+' complexity.';Z('v10GeneratedStats').innerHTML='<div><b>'+scenes.length+'</b><small>Scenes</small></div><div><b>'+stations.length+'</b><small>Stations</small></div><div><b>'+rules.length+'</b><small>Rules</small></div><div><b>'+npcs.length+'</b><small>Guide NPC</small></div>'
}
Z('v10Generate').onclick=generateBlueprint;
Z('v10Apply').onclick=()=>{if(!generated)return alert('Generate a blueprint first.');if(!confirm('Apply this blueprint? It will replace current scenes, stations, rules and NPCs. Media assets will be preserved.'))return;state.scenes=generated.scenes;state.activeSceneId=state.scenes[0].id;state.stations=generated.stations;state.rules=generated.rules;state.variables=Object.assign({},state.variables||{},generated.variables);state.npcs=generated.npcs;state.objects=[];if(typeof loadAdvanced==='function')loadAdvanced();if(typeof render==='function')render();renderRuleList();npcSelect();renderDialogue();alert('Generated immersive blueprint applied.')};

/* Media metadata */
function mediaOptions(){const s=Z('v10MediaSelect');if(!s)return;s.innerHTML='<option value="">Select media</option>'+(state.media||[]).map(m=>'<option value="'+esc10(m.id)+'">'+esc10(m.name)+'</option>').join('')}
function loadMeta(){const id=Z('v10MediaSelect').value,m=state.mediaMeta[id]||{};Z('v10MediaTitle').value=m.title||'';Z('v10MediaLang').value=m.language||'en';Z('v10CaptionStatus').value=m.captionStatus||'not-applicable';Z('v10Transcript').value=m.transcript||''}
Z('v10MediaSelect').onchange=loadMeta;
Z('v10SaveMediaMeta').onclick=()=>{const id=Z('v10MediaSelect').value;if(!id)return alert('Select a media asset.');state.mediaMeta[id]={title:Z('v10MediaTitle').value.trim(),language:Z('v10MediaLang').value.trim()||'en',captionStatus:Z('v10CaptionStatus').value,transcript:Z('v10Transcript').value};alert('Accessibility metadata saved.')};

/* Runtime branching dialogue */
const prevRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=prevRuntime(preview);
 const payload=JSON.stringify({npcs:(state.npcs||[]).map(n=>({id:n.id,startNodeId:n.startNodeId,dialogueNodes:n.dialogueNodes||[]})),mediaMeta:state.mediaMeta||{}}).replace(/</g,'\\u003c');
 const script=`
 <script>
 (function(){
 const v10=${payload};
 function branchTalk(npcId,nodeId){const n=(v10.npcs||[]).find(x=>String(x.id)===String(npcId));if(!n||typeof ui==='undefined')return;const node=(n.dialogueNodes||[]).find(x=>x.id===(nodeId||n.startNodeId))||(n.dialogueNodes||[])[0];if(!node)return;ui.mt.textContent=(project.npcs||[]).find(x=>String(x.id)===String(npcId))?.name||'Virtual Guide';ui.mc.textContent=node.text||'';ui.choices.innerHTML='';ui.completeBtn.style.display='none';(node.choices||[]).forEach(c=>{const b=document.createElement('button');b.textContent=c.text;b.onclick=()=>branchTalk(npcId,c.targetNodeId);ui.choices.appendChild(b)});ui.modal.style.display='block'}
 if(window.V9Runtime){const oldTalk=window.V9Runtime.talk;window.V9Runtime.talk=function(n){if(n.dialogueNodes&&n.dialogueNodes.length)return branchTalk(n.id,n.startNodeId);return oldTalk(n)}}
 window.V10Runtime={branchTalk};
 })();
 <\/script>`;
 return html.replace('</body></html>',script+'</body></html>')
};

/* V10 audit */
const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v10Checks(){
 const out=[],npcs=state.npcs||[],media=state.media||[],meta=state.mediaMeta||{},rules=state.rules||[];
 let brokenChoices=0,duplicateNodes=0,unreachableNodes=0;
 for(const n of npcs){const nodes=n.dialogueNodes||[],ids=nodes.map(x=>x.id);duplicateNodes+=ids.length-new Set(ids).size;const reachable=new Set();function walk(id){if(reachable.has(id))return;reachable.add(id);const node=nodes.find(x=>x.id===id);if(!node)return;(node.choices||[]).forEach(c=>walk(c.targetNodeId))}walk(n.startNodeId||nodes[0]?.id);unreachableNodes+=nodes.filter(x=>!reachable.has(x.id)).length;(nodes||[]).forEach(node=>(node.choices||[]).forEach(c=>{if(!nodes.some(x=>x.id===c.targetNodeId))brokenChoices++}))}
 out.push({level:brokenChoices?'fail':'pass',name:'NPC dialogue targets',detail:brokenChoices?brokenChoices+' dialogue choice(s) target missing nodes.':'Branching dialogue choices resolve.'});
 out.push({level:duplicateNodes?'fail':'pass',name:'NPC dialogue node IDs',detail:duplicateNodes?duplicateNodes+' duplicate dialogue node ID(s) detected.':'Dialogue node IDs are unique per NPC.'});
 out.push({level:unreachableNodes?'warn':'pass',name:'Dialogue reachability',detail:unreachableNodes?unreachableNodes+' dialogue node(s) cannot be reached from their NPC start node.':'Dialogue nodes are reachable from their start nodes.'});
 const videos=media.filter(m=>/^video\//.test(m.type||'')||/\.(mp4|webm)$/i.test(m.name||''));const missingVideo=videos.filter(m=>{const x=meta[m.id]||{};return x.captionStatus!=='available'&&!String(x.transcript||'').trim()});out.push({level:missingVideo.length?'warn':'pass',name:'Video captions/transcripts',detail:missingVideo.length?missingVideo.length+' video asset(s) lack available captions or a transcript.':'Video accessibility metadata is complete.'});
 const audio=media.filter(m=>/^audio\//.test(m.type||'')||/\.(mp3|wav|ogg)$/i.test(m.name||''));const missingAudio=audio.filter(m=>!String((meta[m.id]||{}).transcript||'').trim());out.push({level:missingAudio.length?'warn':'pass',name:'Audio transcripts',detail:missingAudio.length?missingAudio.length+' audio asset(s) lack a transcript/description.':'Audio assets have transcript/description metadata.'});
 const duplicateRules=rules.length-new Set(rules.map(r=>String(r.id))).size;out.push({level:duplicateRules?'fail':'pass',name:'Rule identifiers',detail:duplicateRules?duplicateRules+' duplicate rule ID(s) detected.':'Rule identifiers are unique.'});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v10Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v10Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(Z('auditPass'))Z('auditPass').textContent=p;if(Z('auditWarn'))Z('auditWarn').textContent=w;if(Z('auditFail'))Z('auditFail').textContent=f;if(Z('auditResults'))Z('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>`<div class="station" style="${x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':''}"><span class="num">${x.level==='pass'?'✓':x.level==='warn'?'!':'×'}</span><div><b>${esc10(x.name)}</b><div class="muted">${esc10(x.detail)}</div></div><span class="v3-pill">${x.level.toUpperCase()}</span></div>`).join(''));return all};

const oldRender=render;
render=function(){oldRender();ensureV10();renderRuleList();npcSelect();renderDialogue();mediaOptions()};
renderRuleList();npcSelect();renderDialogue();mediaOptions();
})();