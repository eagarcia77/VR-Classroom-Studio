(()=>{
const L=id=>document.getElementById(id);
const esc15=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensureV15(){state.version=15;state.v15=state.v15||{lastReviewSync:'',lastMediaSync:'',live:false}}
ensureV15();
const main=document.querySelector('main.workspace');if(!main)return;

const live=document.createElement('section');live.className='card';live.id='liveCollaborationCard';
live.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
 <div><h3 style="margin:0">Live Collaboration <span class="v6-badge">V15</span></h3><div class="muted">Supabase Realtime presence for an authenticated cloud project. Falls back safely to local mode.</div></div>
 <div id="v15LiveStatus" class="v15-status"><span class="v15-dot"></span><b>Offline</b></div>
</div>
<div class="v15-grid" style="margin-top:12px">
 <div class="v15-card"><h4 style="margin-top:0">Realtime session</h4><div class="toolbar"><button class="btn primary" id="v15StartLive">Start live session</button><button class="btn" id="v15StopLive">Stop</button></div><div id="v15Presence" class="v15-presence"><span class="muted">No realtime session.</span></div></div>
 <div class="v15-card"><h4 style="margin-top:0">Editor awareness</h4><div class="field"><label>Current activity</label><select id="v15Activity"><option value="editing">Editing</option><option value="reviewing">Reviewing</option><option value="testing">Testing XR</option><option value="publishing">Preparing publication</option></select></div><div class="field"><label>Status message</label><input id="v15PresenceNote" placeholder="e.g. Reviewing accessibility"></div><button class="btn" id="v15UpdatePresence">Update presence</button></div>
</div>`;
main.appendChild(live);

const reviews=document.createElement('section');reviews.className='card';reviews.id='cloudReviewSyncCard';
reviews.innerHTML=`
<div><h3 style="margin:0">Cloud Review Sync <span class="v6-badge">V15</span></h3><div class="muted">Synchronize V14 review comments, tasks and approvals with the dedicated cloud schema when provisioned.</div></div>
<div class="toolbar" style="margin-top:12px"><button class="btn primary" id="v15PushReviews">Push local review data</button><button class="btn" id="v15PullReviews">Pull cloud review data</button></div>
<div id="v15ReviewSyncInfo" class="v15-status" style="margin-top:10px"><span class="v15-dot"></span><span>Not synchronized.</span></div>`;
main.appendChild(reviews);

const media=document.createElement('section');media.className='card';media.id='cloudMediaCard';
media.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Private Cloud Media Adapter <span class="v6-badge">V15</span></h3><div class="muted">Upload loaded local media to the private project-scoped Storage bucket after the V14 schema is provisioned.</div></div><button class="btn primary" id="v15UploadMedia">Upload missing media</button></div>
<div id="v15MediaList" style="margin-top:12px"></div>`;
main.appendChild(media);

const invite=document.createElement('section');invite.className='card';invite.id='workspaceInvitesCard';
invite.innerHTML=`
<div><h3 style="margin:0">Workspace Invitations <span class="v6-badge">V15</span></h3><div class="muted">Create invitation records by email and claim invitations after sign-in. Email delivery itself requires an institutional mail workflow or backend action.</div></div>
<div class="v15-grid" style="margin-top:12px"><div class="v15-card"><div class="field"><label>Email</label><input id="v15InviteEmail" type="email"></div><div class="field"><label>Role</label><select id="v15InviteRole"><option value="instructor">Instructor</option><option value="reviewer">Reviewer</option><option value="admin">Admin</option></select></div><button class="btn primary" id="v15CreateInvite">Create invite record</button></div><div class="v15-card"><div class="toolbar"><button class="btn" id="v15RefreshInvites">Refresh my pending invites</button></div><div id="v15Invites" class="v15-list" style="margin-top:8px"><div class="muted">No invite data loaded.</div></div></div></div>`;
main.appendChild(invite);

const merge=document.createElement('section');merge.className='card';merge.id='mergePreflightCard';
merge.innerHTML=`
<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Cloud Merge Preflight <span class="v6-badge">V15</span></h3><div class="muted">Compare structural counts before a cloud sync or overwrite.</div></div><button class="btn primary" id="v15Compare">Compare with cloud</button></div>
<div id="v15Diff" style="margin-top:12px"><div class="muted">No comparison performed.</div></div>`;
main.appendChild(merge);

const nav=document.querySelector('aside .nav');if(nav){[['🟢 Live Collaboration',live],['☁ Review Sync',reviews],['🗄 Cloud Media',media],['✉ Workspace Invites',invite],['⇄ Merge Preflight',merge]].forEach(([label,target])=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>target.scrollIntoView({behavior:'smooth'});nav.appendChild(b)})}

function cloud(){return window.VRCloudV13}
function client(){return cloud()?.getClient?.()||null}
function user(){return cloud()?.getUser?.()||null}
function workspaceId(){return cloud()?.getWorkspaceId?.()||''}
function projectId(){return state.metadata?.cloudProjectId||cloud()?.getCloudProjectId?.()||''}
function requireCloud(){const c=client(),u=user(),p=projectId();if(!c)throw new Error('Connect V13 Cloud Workspace first.');if(!u)throw new Error('Sign in first.');if(!p)throw new Error('Sync/open this project in cloud first.');return {c,u,p}}

let rtChannel=null;
function liveStatus(text,kind=''){L('v15LiveStatus').innerHTML='<span class="v15-dot '+kind+'"></span><b>'+esc15(text)+'</b>'}
function renderPresenceState(){
 if(!rtChannel){L('v15Presence').innerHTML='<span class="muted">No realtime session.</span>';return}
 const stateMap=rtChannel.presenceState(),people=[];Object.values(stateMap||{}).flat().forEach(p=>people.push(p));
 L('v15Presence').innerHTML=people.length?people.map(p=>'<span class="v15-person"><b>'+esc15(p.email||p.userId||'User')+'</b> · '+esc15(p.activity||'editing')+(p.note?' · '+esc15(p.note):'')+'</span>').join(''):'<span class="muted">Waiting for presence peers…</span>'
}
async function trackPresence(){
 if(!rtChannel||!user())return;await rtChannel.track({userId:user().id,email:user().email||'',activity:L('v15Activity').value,note:L('v15PresenceNote').value.trim(),at:new Date().toISOString()})
}
async function startLive(){
 try{const {c,u,p}=requireCloud();if(rtChannel)await stopLive();rtChannel=c.channel('xr-project:'+p,{config:{presence:{key:u.id},broadcast:{self:false}}});rtChannel.on('presence',{event:'sync'},renderPresenceState).on('presence',{event:'join'},renderPresenceState).on('presence',{event:'leave'},renderPresenceState);rtChannel.subscribe(async status=>{if(status==='SUBSCRIBED'){state.v15.live=true;liveStatus('Realtime connected','ok');await trackPresence();renderPresenceState()}else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')liveStatus('Realtime unavailable','bad')})}catch(e){liveStatus('Realtime unavailable','warn');alert(e.message)}
}
async function stopLive(){if(rtChannel){try{await rtChannel.untrack();await client()?.removeChannel(rtChannel)}catch{}rtChannel=null}state.v15.live=false;liveStatus('Offline');renderPresenceState()}
L('v15StartLive').onclick=startLive;L('v15StopLive').onclick=stopLive;L('v15UpdatePresence').onclick=trackPresence;
window.addEventListener('pagehide',()=>{if(rtChannel)rtChannel.untrack().catch(()=>{})});

/* Review sync */
function syncInfo(text,kind=''){L('v15ReviewSyncInfo').innerHTML='<span class="v15-dot '+kind+'"></span><span>'+esc15(text)+'</span>'}
async function pushReviews(){
 try{const {c,u,p}=requireCloud();let comments=0,tasks=0,approvals=0;
 for(const x of state.reviewComments||[]){const payload={project_id:p,created_by:u.id,severity:x.severity||'note',anchor_type:x.anchorType||'project',anchor_id:String(x.anchorId||''),body:x.text||'',status:x.status||'open',resolved_at:x.resolvedAt||null};if(x.cloudId){const {error}=await c.from('xr_review_comments').update(payload).eq('id',x.cloudId);if(error)throw error}else{const {data,error}=await c.from('xr_review_comments').insert(payload).select('id').single();if(error)throw error;x.cloudId=data.id}comments++}
 for(const t of state.reviewTasks||[]){const payload={project_id:p,created_by:u.id,title:t.title||'Review task',priority:t.priority||'normal',status:t.status||'open',due_date:t.due||null,completed_at:t.status==='done'?(t.completedAt||new Date().toISOString()):null};if(t.cloudId){const {error}=await c.from('xr_review_tasks').update(payload).eq('id',t.cloudId);if(error)throw error}else{const {data,error}=await c.from('xr_review_tasks').insert(payload).select('id').single();if(error)throw error;t.cloudId=data.id}tasks++}
 for(const [gate,a] of Object.entries(state.reviewApprovals||{})){if(a?.approved){const {error}=await c.from('xr_project_approvals').upsert({project_id:p,gate,approved_by:u.id,approved_at:a.at||new Date().toISOString(),note:a.by?'Local approval by '+a.by:null},{onConflict:'project_id,gate'});if(error)throw error;approvals++}else{const {error}=await c.from('xr_project_approvals').delete().eq('project_id',p).eq('gate',gate);if(error)throw error}}
 state.v15.lastReviewSync=new Date().toISOString();syncInfo('Pushed '+comments+' comments, '+tasks+' tasks, '+approvals+' approvals.','ok')
 }catch(e){syncInfo('Review sync unavailable: '+e.message,'warn')}
}
async function pullReviews(){
 try{const {c,p}=requireCloud();const [{data:comments,error:e1},{data:tasks,error:e2},{data:approvals,error:e3}]=await Promise.all([
   c.from('xr_review_comments').select('*').eq('project_id',p).order('created_at'),
   c.from('xr_review_tasks').select('*').eq('project_id',p).order('created_at'),
   c.from('xr_project_approvals').select('*').eq('project_id',p)
 ]);if(e1)throw e1;if(e2)throw e2;if(e3)throw e3;
 state.reviewComments=(comments||[]).map(x=>({id:'cloud-'+x.id,cloudId:x.id,severity:x.severity,anchorType:x.anchor_type,anchorId:x.anchor_id||'project',anchorLabel:x.anchor_id||'Cloud target',author:x.created_by,text:x.body,status:x.status,createdAt:x.created_at,resolvedAt:x.resolved_at||''}));
 state.reviewTasks=(tasks||[]).map(t=>({id:'cloud-'+t.id,cloudId:t.id,title:t.title,assignee:t.assignee_id||'',priority:t.priority,due:t.due_date||'',status:t.status,createdAt:t.created_at}));
 const next={instructional:{approved:false,by:'',at:''},accessibility:{approved:false,by:'',at:''},technical:{approved:false,by:'',at:''},final:{approved:false,by:'',at:''}};(approvals||[]).forEach(a=>next[a.gate]={approved:true,by:a.approved_by,at:a.approved_at});state.reviewApprovals=next;state.v15.lastReviewSync=new Date().toISOString();if(typeof render==='function')render();syncInfo('Cloud review data loaded.','ok')
 }catch(e){syncInfo('Review pull unavailable: '+e.message,'warn')}
}
L('v15PushReviews').onclick=pushReviews;L('v15PullReviews').onclick=pullReviews;

/* Cloud media */
function safeFileName(n){return String(n||'asset').replace(/[^a-zA-Z0-9._-]+/g,'_').slice(0,140)||'asset'}
function renderMedia(){
 const box=L('v15MediaList');if(!box)return;const items=state.media||[];box.innerHTML=items.length?items.map(m=>'<div class="v15-cloudmedia"><div><b>'+esc15(m.name)+'</b><small class="muted">'+Math.round(Number(m.size||0)/1024)+' KB · '+(m.cloudPath?'Cloud synced':'Local only')+'</small>'+(m.cloudPath?'<div class="v15-code">'+esc15(m.cloudPath)+'</div>':'')+'</div><span class="v14-pill">'+(m.cloudPath?'CLOUD':'LOCAL')+'</span></div>').join(''):'<div class="muted">No media assets.</div>'
}
async function uploadMedia(){
 try{const {c,u,p}=requireCloud(),map=window.VRClassroomMediaFiles;if(!map)throw new Error('Local media byte registry is unavailable.');let uploaded=0,skipped=0;
 for(const m of state.media||[]){if(m.cloudPath){skipped++;continue}if(!map.has(m.id)){skipped++;continue}const path=p+'/'+Date.now()+'_'+safeFileName(m.name),blob=new Blob([map.get(m.id)],{type:m.type||'application/octet-stream'});const {error:up}=await c.storage.from('xr-media').upload(path,blob,{contentType:m.type||undefined,upsert:false});if(up)throw up;const hash=state.mediaIntegrity?.[m.id]?.sha256||null;const meta=state.mediaMeta?.[m.id]||{};const {data,error}=await c.from('xr_media_assets').insert({project_id:p,uploaded_by:u.id,storage_path:path,file_name:m.name,mime_type:m.type||null,byte_size:Number(m.size||blob.size),sha256:hash,accessibility:meta}).select('id').single();if(error){await c.storage.from('xr-media').remove([path]);throw error}m.cloudPath=path;m.cloudAssetId=data.id;uploaded++}
 state.v15.lastMediaSync=new Date().toISOString();renderMedia();alert(uploaded+' media asset(s) uploaded. '+skipped+' skipped.')
 }catch(e){alert('Cloud media upload unavailable: '+e.message)}
}
L('v15UploadMedia').onclick=uploadMedia;

/* invitations */
async function createInvite(){
 try{const c=client(),u=user(),w=workspaceId();if(!c||!u||!w)throw new Error('Connect, sign in and select a workspace first.');const email=L('v15InviteEmail').value.trim().toLowerCase(),role=L('v15InviteRole').value;if(!email||!email.includes('@'))throw new Error('Enter a valid email address.');const {data,error}=await c.from('xr_workspace_invites').insert({workspace_id:w,invited_email:email,role,invited_by:u.id,expires_at:new Date(Date.now()+7*86400000).toISOString()}).select('id').single();if(error)throw error;alert('Invite record created. ID: '+data.id+'\nEmail delivery is not automated by this browser client.');L('v15InviteEmail').value=''
 }catch(e){alert('Invitation feature unavailable: '+e.message)}
}
async function refreshInvites(){
 try{const c=client(),u=user();if(!c||!u)throw new Error('Connect and sign in first.');const {data,error}=await c.rpc('xr_my_pending_invites');if(error)throw error;const box=L('v15Invites');box.innerHTML=(data||[]).length?(data||[]).map(i=>'<div class="v15-item"><b>'+esc15(i.workspace_name||'Workspace')+'</b><small>'+esc15(i.role)+' · expires '+esc15(new Date(i.expires_at).toLocaleString())+'</small><button class="btn" data-claim="'+esc15(i.invite_id)+'" style="margin-top:7px">Accept</button></div>').join(''):'<div class="muted">No pending invitations.</div>';box.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>claimInvite(b.dataset.claim))
 }catch(e){L('v15Invites').innerHTML='<div class="muted">'+esc15(e.message)+'</div>'}
}
async function claimInvite(id){try{const c=client();const {error}=await c.rpc('xr_claim_workspace_invite',{target_invite:id});if(error)throw error;await refreshInvites();await cloud()?.refresh?.()}catch(e){alert(e.message)}}
L('v15CreateInvite').onclick=createInvite;L('v15RefreshInvites').onclick=refreshInvites;

/* merge preflight */
function counts(x){return {scenes:(x.scenes||[]).length,stations:(x.stations||[]).length,rules:(x.rules||[]).length,npcs:(x.npcs||[]).length,objects:(x.objects||[]).length,media:(x.media||[]).length,reviews:(x.reviewComments||[]).filter(r=>r.status!=='resolved').length}}
async function compareCloud(){
 try{const {c,p}=requireCloud();const {data,error}=await c.from('xr_projects').select('revision,updated_at,project_data').eq('id',p).single();if(error)throw error;const local=counts(state),remote=counts(data.project_data||{}),labels={scenes:'Scenes',stations:'Stations',rules:'Rules',npcs:'NPCs',objects:'3D objects',media:'Media refs',reviews:'Open reviews'};L('v15Diff').innerHTML='<div class="v15-diff"><div><b>Structure</b></div><div><b>Local</b></div><div><b>Cloud</b></div>'+Object.keys(labels).map(k=>'<div>'+labels[k]+'</div><div>'+local[k]+'</div><div>'+remote[k]+'</div>').join('')+'</div><div class="notice" style="margin-top:9px">Cloud revision '+esc15(data.revision)+' · updated '+esc15(new Date(data.updated_at).toLocaleString())+'. This preflight compares counts, not semantic field-level merges.</div>'
 }catch(e){L('v15Diff').innerHTML='<div class="muted">'+esc15(e.message)+'</div>'}
}
L('v15Compare').onclick=compareCloud;

/* Audit */
const oldRun=window.VRClassroomAudit?.run,oldChecks=window.VRClassroomAudit?.checks;
function v15Checks(){
 const out=[],cp=projectId(),cloudOn=!!client(),auth=!!user(),media=state.media||[],unsyncedMedia=media.filter(m=>!m.cloudPath),reviewBacklog=(state.reviewComments||[]).filter(x=>x.status!=='resolved'&&!x.cloudId);
 out.push({level:cloudOn&&!auth?'warn':'pass',name:'Realtime collaboration session',detail:cloudOn&&!auth?'Cloud is connected but no authenticated user is available for Realtime.':state.v15.live?'Realtime collaboration is active.':'Realtime is optional or currently inactive.'});
 out.push({level:cp&&reviewBacklog.length?'warn':'pass',name:'Cloud review backlog',detail:cp&&reviewBacklog.length?reviewBacklog.length+' local review item(s) have not been cloud-synchronized.':'No unsynchronized local review backlog detected.'});
 out.push({level:cp&&unsyncedMedia.length?'warn':'pass',name:'Cloud media sync',detail:cp&&unsyncedMedia.length?unsyncedMedia.length+' media asset(s) are not marked as uploaded to private cloud Storage.':'No cloud media backlog detected.'});
 const hashes=media.filter(m=>state.mediaIntegrity?.[m.id]?.mismatch);out.push({level:hashes.length?'fail':'pass',name:'Cloud media integrity',detail:hashes.length?hashes.length+' media integrity mismatch(es) must be resolved before cloud upload/publication.':'No media integrity mismatch blocks cloud collaboration.'});
 out.push({level:cloudOn&&!window.VRCloudV13?'fail':'pass',name:'Cloud adapter integration',detail:window.VRCloudV13?'V13 cloud adapter is available to V15.':'V13 cloud adapter is unavailable.'});
 return out
}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v15Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{const base=oldRun(scroll),extras=v15Checks(),all=[...base,...extras];const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;if(L('auditPass'))L('auditPass').textContent=p;if(L('auditWarn'))L('auditWarn').textContent=w;if(L('auditFail'))L('auditFail').textContent=f;if(L('auditResults'))L('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station" style="'+(x.level==='fail'?'border-color:#7f1d1d':x.level==='warn'?'border-color:#854d0e':'')+'"><span class="num">'+(x.level==='pass'?'✓':x.level==='warn'?'!':'×')+'</span><div><b>'+esc15(x.name)+'</b><div class="muted">'+esc15(x.detail)+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));return all};

const oldRender=render;
render=function(){oldRender();ensureV15();renderMedia()};
renderMedia();
window.addEventListener('vrcloud-ready',()=>renderMedia());
})();