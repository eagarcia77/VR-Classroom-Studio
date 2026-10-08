(()=>{
const I36=id=>document.getElementById(id);
const esc36=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function slug(v){return String(v||'immersive-course').normalize('NFKD').replace(/[^\w\s-]/g,'').trim().replace(/[\s_]+/g,'-').replace(/-+/g,'-').toLowerCase()||'immersive-course'}
function xml36(v){return String(v??'').replace(/[<>&'"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]))}
function ensureV36(){
 state.version=36;
 const defaultCourse='https://vr-classroom-studio.onrender.com/cmi5/course/'+slug(state.title);
 state.v36=state.v36||{enabled:false,courseIri:defaultCourse,auIri:defaultCourse+'/au/main',language:'en-US',launchMethod:'AnyWindow',moveOn:'CompletedAndPassed',strictPackageQA:true,lastTest:null};
 if(state.v36.enabled===undefined)state.v36.enabled=false;
 if(!state.v36.courseIri)state.v36.courseIri=defaultCourse;
 if(!state.v36.auIri)state.v36.auIri=state.v36.courseIri.replace(/\/$/,'')+'/au/main';
 if(!state.v36.language)state.v36.language='en-US';
 if(!['AnyWindow','OwnWindow'].includes(state.v36.launchMethod))state.v36.launchMethod='AnyWindow';
 if(!['Passed','Completed','CompletedAndPassed','CompletedOrPassed','NotApplicable'].includes(state.v36.moveOn))state.v36.moveOn='CompletedAndPassed';
}
ensureV36();
const main=document.querySelector('main.workspace');if(!main)return;

const card=document.createElement('section');card.className='card v36-shell';card.id='cmi5InteropBridgeCard';
card.innerHTML=
 '<div class="v36-head"><div><h3>cmi5 / xAPI Interoperability Bridge <span class="v6-badge">V36</span></h3><div class="muted">Keep Blackboard SCORM 2004 as the primary delivery format while generating an optional cmi5 Quartz / xAPI 1.0.3 package for compatible LMS/LRS platforms.</div></div><span id="v36Status" class="v36-pill"></span></div>'+ 
 '<div class="v36-primary"><b>Primary delivery remains SCORM 2004.</b><span>V36 is an alternate export path only. Enabling it does not change the standard Blackboard package or learner grade model.</span></div>'+ 
 '<div class="v36-grid" style="margin-top:12px">'+ 
  '<div class="v36-card"><div class="field"><label>Alternate cmi5 export</label><select id="v36Enabled"><option value="false">Disabled · SCORM only</option><option value="true">Enabled · SCORM + cmi5</option></select></div>'+ 
   '<div class="field"><label>Course IRI</label><input id="v36CourseIri"></div>'+ 
   '<div class="field"><label>Assignable Unit (AU) publisher IRI</label><input id="v36AuIri"></div>'+ 
   '<div class="row"><div class="field"><label>Language</label><input id="v36Language" placeholder="en-US"></div><div class="field"><label>Launch method</label><select id="v36LaunchMethod"><option value="AnyWindow">AnyWindow</option><option value="OwnWindow">OwnWindow</option></select></div></div>'+ 
   '<div class="field"><label>moveOn</label><select id="v36MoveOn"><option value="CompletedAndPassed">CompletedAndPassed</option><option value="Passed">Passed</option><option value="Completed">Completed</option><option value="CompletedOrPassed">CompletedOrPassed</option><option value="NotApplicable">NotApplicable</option></select></div>'+ 
  '</div>'+ 
  '<div class="v36-card"><h4 style="margin-top:0">Standards bridge</h4><div class="v36-runtime">'+ 
   '<div><b>cmi5 Course Package</b><small><code>cmi5.xml</code> is written at ZIP root and launches a relative <code>launch.html</code> AU.</small></div>'+ 
   '<div><b>Launch Contract</b><small>Reads endpoint, fetch, actor, registration and activityId; the one-time fetch URL is POSTed before AU startup.</small></div>'+ 
   '<div><b>xAPI Runtime</b><small>Retrieves LMS.LaunchData and cmi5LearnerPreferences, sends initialized/completed/passed-or-failed/terminated, and persists learner state through the xAPI State API.</small></div>'+ 
   '<div><b>Compatibility Facade</b><small>The existing immersive runtime continues using its SCORM-shaped internal API while V36 translates lifecycle/state semantics to cmi5/xAPI.</small></div>'+ 
  '</div></div>'+ 
 '</div>'+ 
 '<div id="v36Metrics" class="v36-metrics"></div>'+ 
 '<div class="v36-actions"><button class="btn" id="v36RunQA">Run cmi5 Package QA</button><button class="btn" id="v36DownloadReport">Download Interop Report</button><button class="btn primary" id="v36Export">Export cmi5 ZIP</button></div>'+ 
 '<div id="v36QA" class="v36-qa"></div>'+ 
 '<div class="v36-disclaimer">Standards-aligned engineering support is not a formal cmi5 conformance certification. Final import/launch validation must be performed in the target cmi5-capable LMS/LRS.</div>';

const anchor=I36('adaptiveAssessmentStudioCard')||I36('questionBankStudioCard')||I36('blackboardDeliveryCenter');
if(anchor)anchor.insertAdjacentElement('afterend',card);else main.appendChild(card);
const nav=document.querySelector('aside .nav');if(nav){const b=document.createElement('button');b.innerHTML='⇄ cmi5 / xAPI Bridge <span class="badge">V36</span>';b.onclick=()=>card.scrollIntoView({behavior:'smooth'});nav.appendChild(b)}

function scoreWeight(){return window.VRDeliveryV19?.scoreWeight?.()??((state.stations||[]).reduce((a,s)=>a+Number(s.points||0),0)+(state.questions||[]).reduce((a,q)=>a+Number(q.points||0),0))}
function absoluteIri(v){try{const u=new URL(String(v));return !!u.protocol&&u.protocol!==':' }catch(e){return false}}
function scoreConfigured(){return scoreWeight()>0}
function syncSettings(){
 state.v36.enabled=I36('v36Enabled').value==='true';
 state.v36.courseIri=I36('v36CourseIri').value.trim();
 state.v36.auIri=I36('v36AuIri').value.trim();
 state.v36.language=I36('v36Language').value.trim()||'en-US';
 state.v36.launchMethod=I36('v36LaunchMethod').value;
 state.v36.moveOn=I36('v36MoveOn').value;
}
function populate(){
 ensureV36();
 I36('v36Enabled').value=String(state.v36.enabled===true);
 I36('v36CourseIri').value=state.v36.courseIri;
 I36('v36AuIri').value=state.v36.auIri;
 I36('v36Language').value=state.v36.language;
 I36('v36LaunchMethod').value=state.v36.launchMethod;
 I36('v36MoveOn').value=state.v36.moveOn;
}
['v36Enabled','v36CourseIri','v36AuIri','v36Language','v36LaunchMethod','v36MoveOn'].forEach(id=>I36(id).addEventListener('change',()=>{syncSettings();renderAll()}));

function cmi5XML(){
 syncSettings();
 const title=state.title||'VR Classroom Activity',description=(state.instructions||'Immersive learning activity created with VR Classroom Studio.').trim()||'Immersive learning activity created with VR Classroom Studio.';
 const lang=state.v36.language||'en-US',scoreAttr=scoreConfigured()?' masteryScore="'+(Math.max(0,Math.min(100,Number(state.passing||0)))/100).toFixed(4)+'"':'';
 return '<?xml version="1.0" encoding="UTF-8"?>\n'+
 '<courseStructure xmlns="https://w3id.org/xapi/profiles/cmi5/v1/CourseStructure.xsd">\n'+
 '  <course id="'+xml36(state.v36.courseIri)+'">\n'+
 '    <title><langstring lang="'+xml36(lang)+'">'+xml36(title)+'</langstring></title>\n'+
 '    <description><langstring lang="'+xml36(lang)+'">'+xml36(description)+'</langstring></description>\n'+
 '  </course>\n'+
 '  <au id="'+xml36(state.v36.auIri)+'" launchMethod="'+xml36(state.v36.launchMethod)+'" moveOn="'+xml36(state.v36.moveOn)+'"'+scoreAttr+'>\n'+
 '    <title><langstring lang="'+xml36(lang)+'">'+xml36(title)+'</langstring></title>\n'+
 '    <description><langstring lang="'+xml36(lang)+'">'+xml36(description)+'</langstring></description>\n'+
 '    <url>launch.html</url>\n'+
 '  </au>\n'+
 '</courseStructure>\n'
}

function launchHTML(){
 const publisher=JSON.stringify(state.v36.auIri),runtimeStateId=JSON.stringify(state.v36.auIri.replace(/\/$/,'')+'/state/vr-classroom-v1');
 return '<!doctype html><html lang="'+esc36(state.v36.language)+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Launching '+esc36(state.title||'VR Classroom')+'</title><style>body{margin:0;font-family:system-ui;background:#f8fafc;color:#1f2937;display:grid;place-items:center;min-height:100vh}.box{width:min(620px,calc(100vw - 32px));border:1px solid #dfe5ea;border-radius:16px;background:#fff;padding:22px;box-shadow:0 16px 50px #0f172a12}.bar{height:6px;background:#e8edf2;border-radius:999px;overflow:hidden;margin-top:16px}.bar span{display:block;height:100%;width:40%;background:#64748b;animation:p 1.1s infinite alternate}@keyframes p{to{transform:translateX(150%)}}.err{color:#b42318;white-space:pre-wrap}</style></head><body><div class="box"><b>Preparing cmi5 learning session</b><p id="status">Validating LMS launch parameters and learner state…</p><div class="bar"><span></span></div></div><script>'+ 
 '(async function(){const status=document.getElementById("status"),publisherId='+publisher+',runtimeStateId='+runtimeStateId+',KEY="vrc-cmi5-v36";'+ 
 'function fail(m){status.className="err";status.textContent="cmi5 launch blocked: "+m;throw new Error(m)}'+ 
 'function root(ep){return ep.endsWith("/")?ep:ep+"/"}'+ 
 'function api(ep,path){return new URL(path,root(ep)).toString()}'+ 
 'function query(url,obj){const u=new URL(url);Object.entries(obj).forEach(([k,v])=>u.searchParams.set(k,String(v)));return u.toString()}'+ 
 'async function getJSON(url,headers,allow404){const r=await fetch(url,{headers,cache:"no-store"});if(allow404&&r.status===404)return null;if(!r.ok)fail("LRS request failed ("+r.status+") for "+url);return r.status===204?null:await r.json()}'+ 
 'const p=new URLSearchParams(location.search),needed=["endpoint","fetch","actor","registration","activityId"],missing=needed.filter(k=>!p.get(k));if(missing.length)fail("Missing launch parameter(s): "+missing.join(", "));'+ 
 'let actor;try{actor=JSON.parse(p.get("actor"))}catch(e){fail("actor is not valid JSON.")}if(!actor||actor.objectType!=="Agent"||!actor.account)fail("actor must be an xAPI Agent with an account.");'+ 
 'const endpoint=p.get("endpoint"),fetchUrl=p.get("fetch"),registration=p.get("registration"),activityId=p.get("activityId");'+ 
 'try{const prior=JSON.parse(sessionStorage.getItem(KEY)||"null");if(prior&&prior.registration===registration&&prior.activityId===activityId&&prior.endpoint===endpoint&&prior.auth){location.replace("index.html");return}}catch(e){}'+ 
 'status.textContent="Requesting one-time cmi5 authorization token…";const tokenRes=await fetch(fetchUrl,{method:"POST",cache:"no-store",credentials:"include"});if(!tokenRes.ok)fail("Authorization fetch failed with HTTP "+tokenRes.status+".");const tokenData=await tokenRes.json();if(!tokenData["auth-token"])fail(tokenData["error-text"]||"Authorization response did not include auth-token.");const token=String(tokenData["auth-token"]),auth=/^[A-Za-z]+\\s/.test(token)?token:"Basic "+token;const headers={"Authorization":auth,"X-Experience-API-Version":"1.0.3","Accept":"application/json"};const agent=JSON.stringify(actor);'+ 
 'status.textContent="Retrieving LMS.LaunchData…";const common={activityId,agent,registration};const launchData=await getJSON(query(api(endpoint,"activities/state"),{...common,stateId:"LMS.LaunchData"}),headers,false);if(!launchData||!launchData.contextTemplate)fail("LMS.LaunchData is missing contextTemplate.");if(!["Normal","Browse","Review"].includes(launchData.launchMode))fail("LMS.LaunchData launchMode is invalid.");const sid=launchData.contextTemplate?.extensions?.["https://w3id.org/xapi/cmi5/context/extensions/sessionid"];if(!sid)fail("contextTemplate is missing the cmi5 session ID.");const grouping=launchData.contextTemplate?.contextActivities?.grouping||[];if(!grouping.some(x=>String(x.id)===String(publisherId)))fail("contextTemplate grouping does not contain this AU publisher ID.");'+ 
 'status.textContent="Restoring learner state and preferences…";const runtimeState=await getJSON(query(api(endpoint,"activities/state"),{...common,stateId:runtimeStateId}),headers,true)||{};const prefs=await getJSON(query(api(endpoint,"agents/profile"),{profileId:"cmi5LearnerPreferences",agent}),headers,true)||{};'+ 
 'const ctx={version:36,endpoint,auth,actor,registration,activityId,publisherId,runtimeStateId,launchData,prefs,loadedAt:new Date().toISOString()};sessionStorage.setItem(KEY,JSON.stringify(ctx));status.textContent="cmi5 session ready. Opening immersive activity…";location.replace("index.html")'+ 
 '})().catch(e=>console.error(e));<\/script></body></html>'
}

function cmi5Bridge(){
 return `(function(){
const KEY='vrc-cmi5-v36',XVER='1.0.3',CMI5='https://w3id.org/xapi/cmi5/context/categories/cmi5',MOVEON='https://w3id.org/xapi/cmi5/context/categories/moveon';
let ctx=null,initialized=false,terminated=false,start=Date.now(),sessionOutcomeSent=false,queue=Promise.resolve(),errors=[];
try{ctx=JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){}
const runtime=ctx?.runtimeState&&typeof ctx.runtimeState==='object'?ctx.runtimeState:{},store=runtime.cmi&&typeof runtime.cmi==='object'?runtime.cmi:{},meta=runtime.meta&&typeof runtime.meta==='object'?runtime.meta:{};
meta.completedSent=!!meta.completedSent;meta.passedSent=!!meta.passedSent;meta.sentInteractions=meta.sentInteractions||{};
function root(ep){return ep.endsWith('/')?ep:ep+'/'}
function api(path){return new URL(path,root(ctx.endpoint)).toString()}
function headers(json=true){const h={'Authorization':ctx.auth,'X-Experience-API-Version':XVER};if(json)h['Content-Type']='application/json';return h}
function q(url,obj){const u=new URL(url);Object.entries(obj).forEach(([k,v])=>u.searchParams.set(k,String(v)));return u.toString()}
function uuid(){if(crypto.randomUUID)return crypto.randomUUID();return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0,v=c==='x'?r:(r&3|8);return v.toString(16)})}
function dur(ms){let s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600);s-=h*3600;let m=Math.floor(s/60);s-=m*60;return 'PT'+h+'H'+m+'M'+s+'S'}
function clone(v){return JSON.parse(JSON.stringify(v||{}))}
function addActivity(arr,id){arr=Array.isArray(arr)?arr:[];if(!arr.some(x=>String(x.id)===id))arr.push({id});return arr}
function context(defined,result){
 const c=clone(ctx.launchData?.contextTemplate||{});c.registration=ctx.registration;c.contextActivities=c.contextActivities||{};c.contextActivities.category=Array.isArray(c.contextActivities.category)?c.contextActivities.category:[];
 if(defined)c.contextActivities.category=addActivity(c.contextActivities.category,CMI5);
 if(defined&&result&&(Object.prototype.hasOwnProperty.call(result,'success')||Object.prototype.hasOwnProperty.call(result,'completion')))c.contextActivities.category=addActivity(c.contextActivities.category,MOVEON);
 return c
}
function statement(verb,display,result,defined=true,objId){
 const s={id:uuid(),actor:ctx.actor,verb:{id:verb,display:{'en-US':display}},object:{id:objId||ctx.activityId,objectType:'Activity'},context:context(defined,result),timestamp:new Date().toISOString()};
 if(result&&Object.keys(result).length)s.result=result;return s
}
function postStatement(s,keepalive=false){return fetch(api('statements'),{method:'POST',headers:headers(),body:JSON.stringify(s),keepalive}).then(r=>{if(!r.ok)throw new Error('xAPI statement HTTP '+r.status);return r}).catch(e=>{errors.push(String(e.message||e));throw e})}
function enqueue(task){queue=queue.then(task).catch(e=>{errors.push(String(e.message||e));console.error('V36 cmi5 bridge:',e)});return queue}
function scoreResult(){
 const raw=Number(store['cmi.score.raw']),min=Number(store['cmi.score.min']),max=Number(store['cmi.score.max']),scaled=Number(store['cmi.score.scaled']);const r={};
 if(Number.isFinite(scaled))r.scaled=Math.max(-1,Math.min(1,scaled));
 if(Number.isFinite(raw))r.raw=raw;if(Number.isFinite(min))r.min=min;if(Number.isFinite(max))r.max=max;return r
}
function progress(){const p=Number(store['cmi.progress_measure']);return Number.isFinite(p)?Math.max(0,Math.min(1,p)):null}
function statePayload(){return {version:36,cmi:store,meta,updatedAt:new Date().toISOString()}}
function saveState(){
 if(!ctx)return Promise.resolve(false);const url=q(api('activities/state'),{activityId:ctx.activityId,agent:JSON.stringify(ctx.actor),registration:ctx.registration,stateId:ctx.runtimeStateId});
 return fetch(url,{method:'PUT',headers:headers(),body:JSON.stringify(statePayload())}).then(r=>{if(!r.ok)throw new Error('xAPI state HTTP '+r.status);return true})
}
function masteryOutcome(){
 const ld=ctx?.launchData||{},scaled=Number(store['cmi.score.scaled']);if(Number.isFinite(Number(ld.masteryScore))&&Number.isFinite(scaled))return scaled>=Number(ld.masteryScore)?'passed':'failed';
 const s=String(store['cmi.success_status']||'').toLowerCase();return s==='passed'||s==='failed'?s:null
}
function definedResult(kind){
 const r={},elapsed=dur(Date.now()-start);
 if(kind==='completed'||kind==='passed'||kind==='failed'){const score=scoreResult();if(Object.keys(score).length)r.score=score}
 if(kind==='completed'){r.completion=true;r.duration=elapsed;const p=progress();r.extensions={'https://w3id.org/xapi/cmi5/result/extensions/progress':p===null?100:Math.round(p*100)}}
 if(kind==='passed'){r.success=true;r.duration=elapsed}
 if(kind==='failed'){r.success=false;r.duration=elapsed}
 if(kind==='terminated'){r.duration=elapsed}
 return r
}
function sendDefined(kind,keepalive=false){
 const verbs={initialized:['http://adlnet.gov/expapi/verbs/initialized','initialized'],completed:['http://adlnet.gov/expapi/verbs/completed','completed'],passed:['http://adlnet.gov/expapi/verbs/passed','passed'],failed:['http://adlnet.gov/expapi/verbs/failed','failed'],terminated:['http://adlnet.gov/expapi/verbs/terminated','terminated']};
 const v=verbs[kind];return postStatement(statement(v[0],v[1],definedResult(kind),true),keepalive)
}
function interactionStatements(){
 if(ctx?.launchData?.launchMode!=='Normal')return [];
 const count=Math.max(0,Number(store['cmi.interactions._count']||0)),arr=[];
 for(let i=0;i<count;i++){const b='cmi.interactions.'+i,id=store[b+'.id'],resp=store[b+'.learner_response'],result=store[b+'.result'];if(!id||resp===undefined||!result||meta.sentInteractions[id])continue;
  const success=result==='correct'?true:result==='incorrect'?false:undefined,rr={response:String(resp)};if(success!==undefined)rr.success=success;
  const obj=ctx.activityId.replace(/\/$/,'')+'/interaction/'+encodeURIComponent(String(id)),s=statement('http://adlnet.gov/expapi/verbs/answered','answered',rr,false,obj);
  s.object.definition={type:'http://adlnet.gov/expapi/activities/cmi.interaction',name:{'en-US':String(store[b+'.description']||id)}};const typ=store[b+'.type'];if(typ)s.object.definition.interactionType=typ;
  const pattern=store[b+'.correct_responses.0.pattern'];if(pattern)s.object.definition.correctResponsesPattern=[String(pattern)];
  arr.push({id:String(id),statement:s})
 }return arr
}
function evaluate(){
 if(!ctx||ctx.launchData?.launchMode!=='Normal'||terminated)return;
 if(String(store['cmi.completion_status']).toLowerCase()==='completed'&&!meta.completedSent){meta.completedSent=true;enqueue(()=>sendDefined('completed'))}
 const outcome=masteryOutcome();if(!sessionOutcomeSent&&outcome==='passed'&&!meta.passedSent){sessionOutcomeSent=true;meta.passedSent=true;enqueue(()=>sendDefined('passed'))}
 else if(!sessionOutcomeSent&&outcome==='failed'&&!meta.passedSent){sessionOutcomeSent=true;enqueue(()=>sendDefined('failed'))}
 for(const x of interactionStatements()){meta.sentInteractions[x.id]=true;enqueue(()=>postStatement(x.statement))}
}
function applyPrefs(){
 const p=ctx?.prefs||{},lang=String(p.languagePreference||'').split(',').map(x=>x.trim()).filter(Boolean)[0];if(lang)document.documentElement.lang=lang;
 if(String(p.audioPreference||'').toLowerCase()==='off'){const mute=()=>document.querySelectorAll('audio,video').forEach(x=>x.muted=true);mute();new MutationObserver(mute).observe(document.documentElement,{childList:true,subtree:true})}
 if(ctx?.launchData?.returnURL){const b=document.createElement('button');b.textContent='Exit Course';b.setAttribute('aria-label','Exit course and return to LMS');b.style.cssText='position:fixed;right:16px;top:16px;z-index:120;border:1px solid #ffffff44;background:#0f1d31ee;color:#fff;border-radius:999px;padding:8px 12px;font:600 12px system-ui;cursor:pointer';b.onclick=async()=>{await window.SCORM.exit();location.href=ctx.launchData.returnURL};document.body.appendChild(b)}
}
window.SCORM={
 init(){if(initialized)return true;if(!ctx||!ctx.endpoint||!ctx.auth||!ctx.actor||!ctx.registration||!ctx.activityId||!ctx.launchData)return false;initialized=true;start=Date.now();enqueue(()=>sendDefined('initialized'));if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyPrefs,{once:true});else setTimeout(applyPrefs,0);return true},
 get(k){return store[k]===undefined?'':String(store[k])},
 set(k,v){store[k]=String(v);let m=String(k).match(/^cmi\.interactions\.(\d+)\.id$/);if(m)store['cmi.interactions._count']=String(Math.max(Number(store['cmi.interactions._count']||0),Number(m[1])+1));m=String(k).match(/^cmi\.objectives\.(\d+)\.id$/);if(m)store['cmi.objectives._count']=String(Math.max(Number(store['cmi.objectives._count']||0),Number(m[1])+1));return true},
 commit(){if(!initialized)return false;evaluate();enqueue(saveState);return true},
 finish(){if(!initialized||terminated)return true;evaluate();terminated=true;enqueue(saveState);enqueue(()=>sendDefined('terminated',true));initialized=false;return true},
 exit(){if(terminated)return queue;this.finish();return queue},
 available(){return initialized&&!terminated},
 diagnostics(){return {initialized,terminated,errors:errors.slice(),launchMode:ctx?.launchData?.launchMode||null,registration:ctx?.registration||null}}
};
window.CMI5BridgeV36={context:()=>ctx,state:()=>statePayload(),errors:()=>errors.slice(),queue:()=>queue}
})();`
}

function runtimeForCmi5(){
 let html=runtimeHTML(false);
 html=html.replace(/scorm_api\.js/g,'cmi5_bridge.js');
 return html
}
async function buildPackage(){
 if(typeof JSZip==='undefined')throw new Error('JSZip is unavailable.');
 syncSettings();
 const issues=strictChecks().filter(x=>x.level==='fail');if(issues.length)throw new Error(issues.map(x=>x.name+': '+x.detail).join('\n'));
 const mediaFiles=window.VRClassroomMediaFiles,missing=(state.media||[]).filter(m=>!mediaFiles?.has(m.id));if(missing.length)throw new Error('Missing local media bytes: '+missing.map(m=>m.name).join(', '));
 const zip=new JSZip();zip.file('cmi5.xml',cmi5XML());zip.file('launch.html',launchHTML());zip.file('index.html',runtimeForCmi5());zip.file('cmi5_bridge.js',cmi5Bridge());
 const [af,lic]=await Promise.all([fetch('vendor/aframe-v1.8.0.min.js'),fetch('vendor/AFRAME-LICENSE.txt')]);if(!af.ok||!lic.ok)throw new Error('Bundled A-Frame runtime/license could not be loaded.');
 zip.file('aframe.min.js',await af.arrayBuffer());zip.file('AFRAME-LICENSE.txt',await lic.text());
 for(const m of state.media||[])zip.file(m.path,mediaFiles.get(m.id));
 zip.file('project.json',JSON.stringify(state,null,2));
 zip.file('README.txt','VR Classroom Studio V36 cmi5/xAPI interoperability package. cmi5 Quartz (1st Edition) references xAPI 1.0.3. Import this ZIP only into a cmi5-capable LMS/LRS. SCORM 2004 remains the primary Blackboard delivery format. Final target-platform validation is required. Owner & Creator: Eduardo Augusto García Rodríguez. © 2026.');
 return zip
}
function strictChecks(){
 syncSettings();const out=[],scored=scoreConfigured(),move=state.v36.moveOn,mediaFiles=window.VRClassroomMediaFiles;
 out.push({level:absoluteIri(state.v36.courseIri)?'pass':'fail',name:'V36 course IRI',detail:absoluteIri(state.v36.courseIri)?state.v36.courseIri:'Course IRI must be an absolute IRI/URL.'});
 out.push({level:absoluteIri(state.v36.auIri)?'pass':'fail',name:'V36 AU publisher IRI',detail:absoluteIri(state.v36.auIri)?state.v36.auIri:'AU publisher IRI must be an absolute IRI/URL.'});
 out.push({level:state.v36.courseIri!==state.v36.auIri?'pass':'fail',name:'V36 identifier separation',detail:state.v36.courseIri!==state.v36.auIri?'Course and AU identifiers are distinct.':'Course and AU identifiers must be distinct.'});
 out.push({level:/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(state.v36.language)?'pass':'warn',name:'V36 language tag',detail:'Configured language: '+state.v36.language+'.'});
 out.push({level:['AnyWindow','OwnWindow'].includes(state.v36.launchMethod)?'pass':'fail',name:'V36 launch method',detail:'Launch method: '+state.v36.launchMethod+'.'});
 out.push({level:['Passed','Completed','CompletedAndPassed','CompletedOrPassed','NotApplicable'].includes(move)?'pass':'fail',name:'V36 moveOn vocabulary',detail:'moveOn: '+move+'.'});
 out.push({level:scored||!['Passed','CompletedAndPassed'].includes(move)?'pass':'fail',name:'V36 mastery semantics',detail:scored?'Mastery score derives from the project passing score ('+Number(state.passing||0)+'%).':'Passed-based moveOn requires scored evidence.'});
 const missing=(state.media||[]).filter(m=>!mediaFiles?.has(m.id));out.push({level:missing.length?'fail':'pass',name:'V36 packaged local media',detail:missing.length?missing.length+' local media file(s) are unavailable in this browser session.':'All local media bytes are available for alternate packaging.'});
 try{new Function(cmi5Bridge());out.push({level:'pass',name:'V36 cmi5 bridge syntax',detail:'Generated cmi5/xAPI compatibility bridge parses as JavaScript.'})}catch(e){out.push({level:'fail',name:'V36 cmi5 bridge syntax',detail:e.message})}
 const xml=cmi5XML();out.push({level:/<courseStructure xmlns="https:\/\/w3id\.org\/xapi\/profiles\/cmi5\/v1\/CourseStructure\.xsd">/.test(xml)&&/<url>launch\.html<\/url>/.test(xml)?'pass':'fail',name:'V36 course structure',detail:'cmi5.xml uses the cmi5 v1 CourseStructure namespace and a packaged relative AU launch URL.'});
 const launch=launchHTML();out.push({level:['endpoint','fetch','actor','registration','activityId'].every(k=>launch.includes('"'+k+'"'))?'pass':'fail',name:'V36 launch contract',detail:'Launch bootstrap expects all five required cmi5 URL parameters.'});
 out.push({level:launch.includes('method:"POST"')&&launch.includes('LMS.LaunchData')&&launch.includes('cmi5LearnerPreferences')?'pass':'fail',name:'V36 launch bootstrap',detail:'Bootstrap POSTs the one-time fetch URL and retrieves LMS launch data plus learner preferences.'});
 out.push({level:'warn',name:'V36 target-platform conformance',detail:'Package-level checks do not replace import/launch testing in the target cmi5 LMS/LRS.'});
 return out
}
async function runPackageQA(){
 const checks=strictChecks();let zip=null;try{zip=await buildPackage()}catch(e){checks.push({level:'fail',name:'V36 in-memory package build',detail:e.message});return finalizeQA(checks)}
 const names=Object.keys(zip.files).filter(n=>!zip.files[n].dir),req=['cmi5.xml','launch.html','index.html','cmi5_bridge.js','aframe.min.js','AFRAME-LICENSE.txt','project.json','README.txt',...(state.media||[]).map(m=>m.path)].filter(Boolean),missing=req.filter(x=>!names.includes(x));
 checks.push({level:missing.length?'fail':'pass',name:'V36 package contents',detail:missing.length?'Missing: '+missing.join(', '):req.length+' required packaged file(s) are present.'});
 const xml=await zip.file('cmi5.xml').async('text'),launch=await zip.file('launch.html').async('text'),runtime=await zip.file('index.html').async('text'),bridge=await zip.file('cmi5_bridge.js').async('text');
 checks.push({level:xml.includes('<url>launch.html</url>')?'pass':'fail',name:'V36 relative AU launch',detail:'cmi5.xml points to packaged launch.html.'});
 checks.push({level:runtime.includes('cmi5_bridge.js')&&!runtime.includes('src="scorm_api.js"')?'pass':'fail',name:'V36 runtime bridge binding',detail:'Learner runtime loads the cmi5 bridge instead of the SCORM API adapter.'});
 checks.push({level:bridge.includes("'X-Experience-API-Version':XVER")&&bridge.includes("XVER='1.0.3'")?'pass':'fail',name:'V36 xAPI protocol version',detail:'cmi5 runtime requests xAPI 1.0.3 as referenced by cmi5 Quartz.'});
 checks.push({level:bridge.includes("sendDefined('initialized')")&&bridge.includes("sendDefined('terminated',true)")?'pass':'fail',name:'V36 lifecycle statements',detail:'Bridge defines initialized as session start and terminated as final session lifecycle statement.'});
 checks.push({level:launch.includes('activities/state')&&bridge.includes("activities/state")?'pass':'fail',name:'V36 State API continuity',detail:'Launch bootstrap restores state and runtime commits persist state through xAPI.'});
 return finalizeQA(checks)
}
function finalizeQA(checks){
 const result={at:new Date().toISOString(),standard:'cmi5 Quartz · xAPI 1.0.3',courseIri:state.v36.courseIri,auIri:state.v36.auIri,checks};state.v36.lastTest=result;renderQA(checks);renderMetrics();return result
}
function renderQA(checks=state.v36.lastTest?.checks||strictChecks()){
 const box=I36('v36QA');box.innerHTML=checks.map(x=>'<div class="v36-check"><span class="v36-icon '+x.level+'">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc36(x.name)+'</b><small>'+esc36(x.detail)+'</small></div><span class="v36-level">'+x.level.toUpperCase()+'</span></div>').join('');
 const f=checks.filter(x=>x.level==='fail').length,w=checks.filter(x=>x.level==='warn').length;I36('v36Status').innerHTML='<span class="v36-dot '+(f?'fail':w?'warn':'')+'"></span>'+(state.v36.enabled!==true?'Optional · Off':f?f+' blocker(s)':w?w+' advisory':'Ready')
}
function renderMetrics(){
 const last=state.v36.lastTest,checks=last?.checks||[],p=checks.filter(x=>x.level==='pass').length,f=checks.filter(x=>x.level==='fail').length;
 I36('v36Metrics').innerHTML='<div><b>SCORM 2004</b><small>Primary Blackboard delivery</small></div><div><b>cmi5 Quartz</b><small>Optional alternate package</small></div><div><b>xAPI 1.0.3</b><small>cmi5 referenced runtime protocol</small></div><div><b>'+(last?(f?f+' fail':p+' pass'):'Not tested')+'</b><small>Latest interoperability QA</small></div>'
}
function renderAll(){ensureV36();populate();renderQA();renderMetrics()}
I36('v36RunQA').onclick=()=>runPackageQA().catch(e=>alert('cmi5 QA failed: '+e.message));
I36('v36Export').onclick=async()=>{
 syncSettings();if(state.v36.enabled!==true)return alert('Enable Alternate cmi5 export first. SCORM 2004 remains available independently.');
 const baseIssues=typeof validateProject==='function'?validateProject():[];if(baseIssues.length)return alert('Resolve project validation issues before cmi5 export:\n- '+baseIssues.join('\n- '));
 const qa=await runPackageQA(),fails=qa.checks.filter(x=>x.level==='fail');if(fails.length)return alert('V36 cmi5 package QA blocked export:\n- '+fails.map(x=>x.name+': '+x.detail).join('\n- '));
 const zip=await buildPackage(),blob=await zip.generateAsync({type:'blob',compression:'DEFLATE'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(state.title||'vr-classroom').replace(/[^a-z0-9]+/gi,'_')+'_cmi5.zip';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000)
};
I36('v36DownloadReport').onclick=()=>{syncSettings();const report=state.v36.lastTest||{at:new Date().toISOString(),standard:'cmi5 Quartz · xAPI 1.0.3',courseIri:state.v36.courseIri,auIri:state.v36.auIri,checks:strictChecks()};const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(state.title||'VR-Classroom').replace(/[^a-z0-9]+/gi,'_')+'_cmi5_interop_report.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),3000)};

function auditChecks(){
 const c=strictChecks();if(state.v36.enabled!==true)return[{level:'pass',name:'V36 alternate interoperability',detail:'Optional cmi5/xAPI export is disabled; Blackboard SCORM 2004 remains unaffected.'}];
 const fails=c.filter(x=>x.level==='fail'),warns=c.filter(x=>x.level==='warn');
 return[{level:fails.length||warns.length?'warn':'pass',name:'V36 cmi5/xAPI alternate export',detail:fails.length?fails.length+' cmi5-specific blocker(s) exist; SCORM export remains independent.':warns.length?warns.length+' cmi5 interoperability advisory item(s) remain.':'Alternate cmi5 package settings are structurally ready.'}]
}
const oldChecks=window.VRClassroomAudit?.checks,oldRun=window.VRClassroomAudit?.run;
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...auditChecks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=auditChecks(),all=[...base,...extras],p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(I36('auditPass'))I36('auditPass').textContent=p;if(I36('auditWarn'))I36('auditWarn').textContent=w;if(I36('auditFail'))I36('auditFail').textContent=f;if(I36('auditResults'))I36('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station"><span class="num">'+(x.level==='pass'?'✓':'!')+'</span><div><b>'+esc36(x.name)+'</b><div class="muted">'+esc36(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

const oldRender=window.render;window.render=function(){oldRender();ensureV36();setTimeout(renderAll,0)};
renderAll();
window.VRCMI5V36={cmi5XML,launchHTML,cmi5Bridge,buildPackage,runPackageQA,strictChecks};
})();
