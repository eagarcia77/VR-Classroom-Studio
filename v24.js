(()=>{
const V=id=>document.getElementById(id);
function ensureV24(){
  state.version=24;
  state.v24=state.v24||{theme:'minimal-white',mascot:'subtle-header',reviewedAt:new Date().toISOString()};
}
ensureV24();

document.documentElement.dataset.v24Theme='minimal-white';
const header=document.querySelector('header');
if(header&&!document.getElementById('v24Guide')){
  const guide=document.createElement('div');
  guide.id='v24Guide';guide.className='v24-guide';
  guide.innerHTML='<img src="brand/vrc-nova-mascot.svg" alt=""><span><strong>VRC-NOVA</strong> · XR guide</span>';
  guide.title='VRC-NOVA · Interface guide';
  const actions=header.querySelector('.actions');
  if(actions)header.insertBefore(guide,actions);
}
const logo=document.querySelector('header .logo');
if(logo&&!logo.querySelector('img')){
  logo.innerHTML='<img src="brand/vr-classroom-studio-mark.svg" alt="VR Classroom Studio logo">';
}

const main=document.querySelector('main.workspace');
if(main&&!document.getElementById('v24VisualAuditCard')){
  const sec=document.createElement('section');sec.className='card';sec.id='v24VisualAuditCard';
  sec.innerHTML='<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><h3 style="margin:0">Minimalist Interface QA <span class="v6-badge">V24</span></h3><div class="muted">Checks core authoring surfaces after the white minimalist redesign.</div></div><button class="btn" id="v24RunVisualAudit">Run visual QA</button></div><div id="v24VisualAudit" class="v24-audit"><span class="v24-dot"></span><span>Minimal white theme active.</span></div>';
  main.appendChild(sec);
  const nav=document.querySelector('aside .nav');
  if(nav){const b=document.createElement('button');b.textContent='◻ Minimalist UI QA';b.onclick=()=>sec.scrollIntoView({behavior:'smooth'});nav.appendChild(b)}
}

function cssRgb(el,prop){return getComputedStyle(el)[prop]||''}
function luminance(rgb){
  const m=String(rgb).match(/[\d.]+/g);if(!m||m.length<3)return null;
  const c=m.slice(0,3).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});
  return .2126*c[0]+.7152*c[1]+.0722*c[2]
}
function contrast(a,b){const A=luminance(a),B=luminance(b);if(A==null||B==null)return null;return (Math.max(A,B)+.05)/(Math.min(A,B)+.05)}
function visualChecks(){
  const body=document.body,card=document.querySelector('.card'),aside=document.querySelector('aside'),input=document.querySelector('.field input');
  const bodyBg=cssRgb(body,'backgroundColor'),cardBg=card?cssRgb(card,'backgroundColor'):'',asideBg=aside?cssRgb(aside,'backgroundColor'):'';
  const text=cssRgb(body,'color'),ratio=contrast(text,cardBg||bodyBg);
  const darkSurfaceLeak=[...document.querySelectorAll('.card')].filter(el=>{const l=luminance(cssRgb(el,'backgroundColor'));return l!=null&&l<.35&&!el.closest('#v22Graph')}).length;
  return [
    {level:luminance(bodyBg)>.85?'pass':'warn',name:'Application canvas',detail:'Body background '+bodyBg},
    {level:luminance(cardBg)>.88?'pass':'warn',name:'Primary cards',detail:'Card background '+cardBg},
    {level:luminance(asideBg)>.86?'pass':'warn',name:'Navigation surface',detail:'Sidebar background '+asideBg},
    {level:ratio&&ratio>=4.5?'pass':'warn',name:'Primary text contrast',detail:ratio?'Approx. '+ratio.toFixed(2)+':1':'Unable to calculate'},
    {level:input&&luminance(cssRgb(input,'backgroundColor'))>.88?'pass':'warn',name:'Form fields',detail:input?'White form surface with visible border.':'No form field found.'},
    {level:darkSurfaceLeak===0?'pass':'warn',name:'Legacy dark card leakage',detail:darkSurfaceLeak?darkSurfaceLeak+' primary card(s) still compute as dark.':'No dark primary card surfaces detected.'},
    {level:document.querySelector('header .logo img')?'pass':'warn',name:'Logo integration',detail:'Minimal logo asset in header.'},
    {level:document.getElementById('v24Guide')?'pass':'warn',name:'Mascot integration',detail:'VRC-NOVA appears as a subtle header guide.'}
  ]
}
function runVisual(){
  const checks=visualChecks(),box=V('v24VisualAudit');if(!box)return checks;
  const warn=checks.filter(x=>x.level!=='pass').length;
  box.innerHTML='<span class="v24-dot '+(warn?'warn':'')+'"></span><div><b>'+(warn?'Visual QA has '+warn+' warning(s).':'Minimalist visual QA passed.')+'</b><div class="muted">'+checks.map(x=>(x.level==='pass'?'✓ ':'! ')+x.name+' — '+x.detail).join('<br>')+'</div></div>';
  return checks
}
if(V('v24RunVisualAudit'))V('v24RunVisualAudit').onclick=runVisual;

const oldChecks=window.VRClassroomAudit?.checks,oldRun=window.VRClassroomAudit?.run;
function v24Checks(){return visualChecks().map(x=>({level:x.level,name:'V24 UI · '+x.name,detail:x.detail}))}
if(oldChecks)window.VRClassroomAudit.checks=()=>[...oldChecks(),...v24Checks()];
if(oldRun)window.VRClassroomAudit.run=(scroll=false)=>{
  const base=oldRun(scroll),extras=v24Checks(),all=[...base,...extras];
  const p=all.filter(x=>x.level==='pass').length,w=all.filter(x=>x.level==='warn').length,f=all.filter(x=>x.level==='fail').length;
  if(V('auditPass'))V('auditPass').textContent=p;if(V('auditWarn'))V('auditWarn').textContent=w;if(V('auditFail'))V('auditFail').textContent=f;
  if(V('auditResults'))V('auditResults').insertAdjacentHTML('beforeend',extras.map(x=>'<div class="station"><span class="num">'+(x.level==='pass'?'✓':'!')+'</span><div><b>'+x.name+'</b><div class="muted">'+x.detail+'</div></div><span class="v3-pill">'+x.level.toUpperCase()+'</span></div>').join(''));
  return all
};
const oldRender=render;
render=function(){oldRender();ensureV24();setTimeout(runVisual,0)};
setTimeout(runVisual,0);
})();