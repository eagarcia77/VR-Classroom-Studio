(()=>{
const X=id=>document.getElementById(id);
const esc18=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV18(){
 state.version=18;
 state.v18Settings=state.v18Settings||{alternativeMode:true,keyboardActivation:true,motionProfile:'system',requireCaptions:true,requireTranscriptForAudio:true,minimumContrast:4.5,publicationChecklistRequired:true};
}
ensureV18();
const main=document.querySelector('main.workspace');if(!main)return;

/* Quality center */
const quality=document.createElement('section');quality.className='card';quality.id='accessibilityQualityCard';
quality.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Accessibility & Quality Intelligence <span class="v6-badge">V18</span></h3><div class="muted">WCAG-oriented authoring checks for keyboard access, media alternatives, motion safety and equivalent non-VR access.</div></div><button class="btn primary" id="v18Audit">Run accessibility preflight</button></div>
<div class="v18-grid" style="margin-top:12px"><div class="v18-card"><h4 style="margin-top:0">Runtime Accessibility Policy</h4>
 <div class="field"><label>Accessible 2D alternative mode</label><select id="v18AltMode"><option value="true">Enabled</option><option value="false">Disabled</option></select></div>
 <div class="field"><label>Keyboard activation for 3D interactive items</label><select id="v18Keyboard"><option value="true">Required</option><option value="false">Not required</option></select></div>
 <div class="field"><label>Motion profile</label><select id="v18Motion"><option value="system">Respect system reduced-motion preference</option><option value="reduced">Force reduced motion</option><option value="standard">Standard motion</option></select></div>
 <div class="field"><label>Minimum text contrast target</label><select id="v18ContrastTarget"><option value="4.5">4.5:1 normal text</option><option value="7">7:1 enhanced</option><option value="3">3:1 large text / UI target</option></select></div>
</div><div class="v18-card"><h4 style="margin-top:0">Quality Snapshot</h4><div id="v18Metrics" class="v18-metrics"></div><div id="v18QualityResults" style="margin-top:10px"></div></div></div>`;
main.appendChild(quality);

/* keyboard map */
const keyboard=document.createElement('section');keyboard.className='card';keyboard.id='keyboardFocusCard';
keyboard.innerHTML=`
<div><h3 style="margin:0">Keyboard & Focus Map <span class="v6-badge">V18</span></h3><div class="muted">Preview the logical keyboard sequence for scenes, stations, portals and virtual guides.</div></div>
<div id="v18FocusMap" style="margin-top:12px"></div>`;
main.appendChild(keyboard);

/* Contrast lab */
const contrast=document.createElement('section');contrast.className='card';contrast.id='contrastLabCard';
contrast.innerHTML=`
<div><h3 style="margin:0">Contrast Lab <span class="v6-badge">V18</span></h3><div class="muted">Quick WCAG contrast-ratio calculator for authoring colors.</div></div>
<div class="v18-grid" style="margin-top:12px"><div class="v18-card"><div class="field"><label>Foreground</label><input id="v18Fg" type="color" value="#ffffff"></div><div class="field"><label>Background</label><input id="v18Bg" type="color" value="#19324d"></div><button class="btn primary" id="v18CheckContrast">Check contrast</button></div><div class="v18-card"><div id="v18Swatch" class="v18-swatch">Sample learning content</div><div id="v18ContrastResult" style="margin-top:10px"></div></div></div>`;
main.appendChild(contrast);

/* Blackboard checklist */
const publish=document.createElement('section');publish.className='card';publish.id='blackboardPublicationCard';
publish.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Blackboard Publication Checklist <span class="v6-badge">V18</span></h3><div class="muted">Final preflight before generating the audited SCORM ZIP.</div></div><button class="btn primary" id="v18RunPublish">Run publication checklist</button></div>
<div id="v18PublishSummary" class="v18-publish" style="margin-top:12px"></div><div id="v18PublishChecks" style="margin-top:10px"></div>`;
main.appendChild(publish);

const nav=document.querySelector('aside .nav');if(nav){[['♿ Accessibility Intelligence',quality],['⌨ Keyboard & Focus',keyboard],['◐ Contrast Lab',contrast],['📦 Blackboard Checklist',publish]].forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)})}

X('v18AltMode').value=String(!!state.v18Settings.alternativeMode);
X('v18Keyboard').value=String(!!state.v18Settings.keyboardActivation);
X('v18Motion').value=state.v18Settings.motionProfile||'system';
X('v18ContrastTarget').value=String(state.v18Settings.minimumContrast||4.5);
X('v18AltMode').onchange=()=>state.v18Settings.alternativeMode=X('v18AltMode').value==='true';
X('v18Keyboard').onchange=()=>state.v18Settings.keyboardActivation=X('v18Keyboard').value==='true';
X('v18Motion').onchange=()=>state.v18Settings.motionProfile=X('v18Motion').value;
X('v18ContrastTarget').onchange=()=>state.v18Settings.minimumContrast=Number(X('v18ContrastTarget').value)||4.5;

function mediaKind(m){const n=(m.name||'').toLowerCase(),t=m.type||'';if(t.startsWith('video/')||/\.(mp4|webm)$/.test(n))return 'video';if(t.startsWith('audio/')||/\.(mp3|wav|ogg)$/.test(n))return 'audio';return 'other'}
function qualityChecks(){
 const out=[],media=state.media||[],meta=state.mediaMeta||{},stations=state.stations||[],objects=state.objects||[],npcs=state.npcs||[];
 const videos=media.filter(m=>mediaKind(m)==='video'),audio=media.filter(m=>mediaKind(m)==='audio');
 const videoMissing=videos.filter(m=>{const x=meta[m.id]||{};return x.captionStatus!=='available'&&!String(x.transcript||'').trim()});
 const audioMissing=audio.filter(m=>!String((meta[m.id]||{}).transcript||'').trim());
 const missingAlt=stations.filter(s=>!String(s.alt||'').trim());
 const interactive=objects.filter(o=>['portal','hotspot','smart-door','collectible','inspection','media-screen','trigger-zone'].includes(o.type));
 out.push({level:state.v18Settings.alternativeMode?'pass':'warn',name:'Equivalent non-VR mode',detail:state.v18Settings.alternativeMode?'Accessible 2D alternative mode is enabled.':'No equivalent non-VR runtime mode is enabled.'});
 out.push({level:state.v18Settings.keyboardActivation?'pass':'fail',name:'Keyboard activation policy',detail:state.v18Settings.keyboardActivation?'Enter/Space activation is required for interactive runtime items.':'Keyboard activation is disabled.'});
 out.push({level:missingAlt.length?'warn':'pass',name:'Station accessible labels',detail:missingAlt.length?missingAlt.length+' station(s) lack explicit accessible labels.':'Stations have accessible labels.'});
 out.push({level:videoMissing.length?'warn':'pass',name:'Video alternatives',detail:videoMissing.length?videoMissing.length+' video asset(s) lack available captions or transcript metadata.':'Video accessibility metadata is covered.'});
 out.push({level:audioMissing.length?'warn':'pass',name:'Audio alternatives',detail:audioMissing.length?audioMissing.length+' audio asset(s) lack transcript/description metadata.':'Audio accessibility metadata is covered.'});
 out.push({level:state.v18Settings.motionProfile==='standard'?'warn':'pass',name:'Motion safety',detail:state.v18Settings.motionProfile==='standard'?'Standard motion is forced; consider respecting reduced-motion preferences.':'Motion policy supports reduced-motion needs.'});
 out.push({level:interactive.length||stations.length||npcs.length?'pass':'warn',name:'Keyboard focus inventory',detail:(interactive.length+stations.length+npcs.length)+' potentially interactive item(s) identified for logical focus mapping.'});
 return out
}
function renderQuality(){
 const checks=qualityChecks(),p=checks.filter(x=>x.level==='pass').length,w=checks.filter(x=>x.level==='warn').length,f=checks.filter(x=>x.level==='fail').length;
 X('v18Metrics').innerHTML='<div><b>'+p+'</b><small>Pass</small></div><div><b>'+w+'</b><small>Warnings</small></div><div><b>'+f+'</b><small>Blockers</small></div><div><b>'+Number(state.v18Settings.minimumContrast||4.5)+':1</b><small>Contrast target</small></div>';
 X('v18QualityResults').innerHTML=checks.map(x=>'<div class="v18-check"><span class="mark v18-'+x.level+'">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc18(x.name)+'</b><small class="muted">'+esc18(x.detail)+'</small></div><span class="v16-badge">'+x.level.toUpperCase()+'</span></div>').join('');
 return checks
}
X('v18Audit').onclick=renderQuality;

function focusItems(){
 const arr=[],scenes=state.scenes||[];
 scenes.forEach(sc=>{arr.push({kind:'Scene',label:sc.name,scope:sc.name});(state.stations||[]).filter(s=>String(s.sceneId)===String(sc.id)).forEach(s=>arr.push({kind:'Station',label:s.name,scope:sc.name}));(state.objects||[]).filter(o=>String(o.sceneId)===String(sc.id)&&['portal','hotspot','smart-door','collectible','inspection','media-screen'].includes(o.type)).forEach(o=>arr.push({kind:o.type,label:o.label||o.type,scope:sc.name}));(state.npcs||[]).filter(n=>String(n.sceneId)===String(sc.id)).forEach(n=>arr.push({kind:'NPC',label:n.name,scope:sc.name}))});return arr
}
function renderFocus(){
 const arr=focusItems();X('v18FocusMap').innerHTML=arr.length?arr.map((x,i)=>'<div class="v18-focus"><div><b>#'+(i+1)+'</b></div><div><b>'+esc18(x.label)+'</b><small class="muted">'+esc18(x.scope)+'</small></div><div>'+esc18(x.kind)+'</div></div>').join(''):'<div class="muted">No interactive focus targets are defined.</div>'
}

function hexRGB(hex){const h=String(hex).replace('#','');const n=parseInt(h.length===3?h.split('').map(x=>x+x).join(''):h,16);return [(n>>16)&255,(n>>8)&255,n&255]}
function luminance(hex){return hexRGB(hex).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0)}
function contrastRatio(a,b){const l1=luminance(a),l2=luminance(b),hi=Math.max(l1,l2),lo=Math.min(l1,l2);return (hi+.05)/(lo+.05)}
function checkContrast(){
 const fg=X('v18Fg').value,bg=X('v18Bg').value,r=contrastRatio(fg,bg),target=Number(state.v18Settings.minimumContrast||4.5);X('v18Swatch').style.color=fg;X('v18Swatch').style.background=bg;X('v18ContrastResult').innerHTML='<b>Contrast ratio: '+r.toFixed(2)+':1</b><br><span class="'+(r>=target?'v18-pass':'v18-fail')+'">'+(r>=target?'Meets':'Does not meet')+' configured '+target+':1 target.</span>';return r
}
X('v18CheckContrast').onclick=checkContrast;

function manifestCoverage(){
 let text='';try{text=manifest()}catch(e){return {ok:false,missing:['manifest unavailable']}}
 const expected=['index.html','scorm_api.js','aframe.min.js','AFRAME-LICENSE.txt','project.json','README.txt',...(state.media||[]).map(m=>m.path)].filter(Boolean);
 const missing=expected.filter(p=>!text.includes('href="'+String(p).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"'));return {ok:missing.length===0,missing}
}
function publicationChecks(){
 const audit=window.VRClassroomAudit?.checks?.()||[],auditFails=audit.filter(x=>x.level==='fail'),man=manifestCoverage(),media=state.media||[],map=window.VRClassroomMediaFiles,missingBytes=media.filter(m=>!map?.has(m.id)),score=(state.stations||[]).reduce((a,s)=>a+Number(s.points||0),0)+(state.questions||[]).reduce((a,q)=>a+Number(q.points||0),0);
 const q=qualityChecks(),qFails=q.filter(x=>x.level==='fail');
 return [
  {level:String(state.title||'').trim()?'pass':'fail',name:'Activity title',detail:state.title||'Missing title.'},
  {level:(state.objectives||[]).length?'pass':'warn',name:'Learning objectives',detail:(state.objectives||[]).length+' objective(s) defined.'},
  {level:(state.scenes||[]).length?'pass':'fail',name:'Scene structure',detail:(state.scenes||[]).length+' scene(s) available.'},
  {level:man.ok?'pass':'fail',name:'SCORM manifest coverage',detail:man.ok?'All expected package files are declared.':'Missing manifest declarations: '+man.missing.join(', ')},
  {level:missingBytes.length?'fail':'pass',name:'Local media bytes',detail:missingBytes.length?missingBytes.length+' referenced media file(s) are not loaded for export.':'Required local media bytes are loaded.'},
  {level:qFails.length?'fail':'pass',name:'Accessibility blockers',detail:qFails.length?qFails.length+' accessibility blocker(s) remain.':'No V18 accessibility blockers remain.'},
  {level:state.accessibility?.desktopFallback==='required'||state.v18Settings.alternativeMode?'pass':'warn',name:'Non-VR access path',detail:state.v18Settings.alternativeMode?'Accessible 2D mode enabled.':'Review desktop/non-VR fallback.'},
  {level:score===100?'pass':'warn',name:'Score model',detail:'Configured station + question weight: '+score+'.'},
  {level:auditFails.length?'fail':'pass',name:'Production audit blockers',detail:auditFails.length?auditFails.length+' blocker(s) reported by the full audit.':'Full production audit reports no blockers.'}
 ]
}
function renderPublication(){
 const checks=publicationChecks(),fails=checks.filter(x=>x.level==='fail').length,warns=checks.filter(x=>x.level==='warn').length;
 X('v18PublishSummary').innerHTML='<b>'+(fails?'NOT READY':'READY FOR FINAL REVIEW')+'</b><br>'+fails+' blocker(s) · '+warns+' warning(s).'+(fails?' Resolve blockers before audited export.':' Package can proceed to final human review and Blackboard upload.');
 X('v18PublishChecks').innerHTML=checks.map(x=>'<div class="v18-check"><span class="mark v18-'+x.level+'">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc18(x.name)+'</b><small class="muted">'+esc18(x.detail)+'</small></div><span class="v16-badge">'+x.level.toUpperCase()+'</span></div>').join('');
 return checks
}
X('v18RunPublish').onclick=renderPublication;

/* Runtime accessibility layer */
const prevRuntime=runtimeHTML;
runtimeHTML=function(preview=false){
 let html=prevRuntime(preview);
 const cfg=JSON.stringify(state.v18Settings||{}).replace(/</g,'\\u003c');
 const style=`<style id="v18-runtime-style">
 #v18AccessBar{position:fixed;right:12px;bottom:12px;z-index:60;display:flex;gap:7px;flex-wrap:wrap}
 #v18AccessBar button{padding:9px 12px;border-radius:9px;border:1px solid #ffffff44;background:#071225ee;color:#fff;font-weight:700}
 #v18AltPanel{position:fixed;inset:0;z-index:55;background:#06101ff7;color:#fff;overflow:auto;padding:24px;display:none}
 #v18AltPanel .v18alt{max-width:900px;margin:auto}.v18alt button{display:block;width:100%;text-align:left;margin:7px 0;padding:11px;border-radius:8px;border:1px solid #ffffff44;background:#13243f;color:#fff}
 #v18AltPanel h2,#v18AltPanel h3{margin-top:1.2em}
 .v18-focus-visible:focus{outline:3px solid #fde68a!important;outline-offset:3px}
 @media(prefers-reduced-motion:reduce){a-scene *,*{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important}}
 </style>`;
 const code=`
 <script>
 (function(){
 const cfg=${cfg};
 const bar=document.createElement('div');bar.id='v18AccessBar';bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','Accessibility options');
 const altBtn=document.createElement('button');altBtn.textContent='Accessible 2D Mode';altBtn.className='v18-focus-visible';bar.appendChild(altBtn);
 const motionBtn=document.createElement('button');motionBtn.textContent='Reduce Motion';motionBtn.className='v18-focus-visible';bar.appendChild(motionBtn);document.body.appendChild(bar);
 const panel=document.createElement('div');panel.id='v18AltPanel';panel.setAttribute('role','region');panel.setAttribute('aria-label','Accessible alternative activity');panel.innerHTML='<div class="v18alt"><button id="v18AltClose">Close Accessible Mode</button><h2></h2><p id="v18AltInstructions"></p><div id="v18AltContent"></div></div>';document.body.appendChild(panel);
 function activateKeyboard(root=document){root.querySelectorAll('[tabindex="0"]').forEach(el=>{if(el.dataset.v18Keyboard)return;el.dataset.v18Keyboard='1';el.classList.add('v18-focus-visible');el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.dispatchEvent(new MouseEvent('click',{bubbles:true}))}})})}
 const obs=new MutationObserver(()=>activateKeyboard());obs.observe(document.body,{subtree:true,childList:true});if(cfg.keyboardActivation)activateKeyboard();
 function renderAlt(){const host=panel.querySelector('#v18AltContent'),scene=(project.scenes||[]).find(s=>String(s.id)===String(currentScene))||project.scenes?.[0];panel.querySelector('h2').textContent=project.title||'Learning Activity';panel.querySelector('#v18AltInstructions').textContent=project.instructions||'';host.innerHTML='';if(!scene)return;const h=document.createElement('h3');h.textContent='Scene: '+scene.name;host.appendChild(h);(project.stations||[]).filter(s=>String(s.sceneId)===String(scene.id)).forEach(s=>{const b=document.createElement('button');b.textContent=(completed.has(s.id)?'✓ ':'')+s.name;b.onclick=()=>openStation(s);host.appendChild(b)});const nav=document.createElement('h3');nav.textContent='Scenes';host.appendChild(nav);(project.scenes||[]).forEach(s=>{const b=document.createElement('button');b.textContent=s.name;b.onclick=()=>{showScene(s.id);renderAlt()};host.appendChild(b)})}
 altBtn.onclick=()=>{if(!cfg.alternativeMode)return alert('Accessible 2D mode is disabled for this activity.');renderAlt();panel.style.display='block';panel.querySelector('#v18AltClose').focus()};
 panel.querySelector('#v18AltClose').onclick=()=>{panel.style.display='none';altBtn.focus()};
 motionBtn.onclick=()=>{document.documentElement.dataset.v18ReducedMotion='true';document.querySelectorAll('[animation],[animation__v11]').forEach(el=>{[...el.attributes].filter(a=>a.name.startsWith('animation')).forEach(a=>el.removeAttribute(a.name))});motionBtn.textContent='Motion Reduced'};
 if(cfg.motionProfile==='reduced')motionBtn.click();
 if(!cfg.alternativeMode)altBtn.style.display='none';
 window.V18Accessibility={renderAlt,activateKeyboard};
 })();
 <\/script>`;
 html=html.replace('</head>',style+'</head>');
 return html.replace('</body></html>',code+'</body></html>')
};

/* Production audit extension */
const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v18Checks(){
 const q=qualityChecks(),out=q.map(x=>({...x,name:'Accessibility · '+x.name})),pub=publicationChecks();
 const man=pub.find(x=>x.name==='SCORM manifest coverage');if(man)out.push({level:man.level,name:'Blackboard package manifest',detail:man.detail});
 const nonVr=pub.find(x=>x.name==='Non-VR access path');if(nonVr)out.push({level:nonVr.level,name:'Equivalent access path',detail:nonVr.detail});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v18Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v18Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(X('auditPass'))X('auditPass').textContent=p;if(X('auditWarn'))X('auditWarn').textContent=w;if(X('auditFail'))X('auditFail').textContent=f;if(X('auditResults'))X('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station" style="'+(x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc18(x.name)+'</b><div class="muted">'+esc18(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

const oldRender=render;
render=function(){oldRender();ensureV18();setTimeout(()=>{renderQuality();renderFocus();checkContrast();renderPublication()},0)};
renderQuality();renderFocus();checkContrast();renderPublication();
})();