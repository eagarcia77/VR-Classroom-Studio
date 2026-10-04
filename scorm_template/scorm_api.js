(function(){
  let api=null, initialized=false;
  function findAPI(win){let tries=0; while(win && !win.API_1484_11 && win.parent && win.parent!==win && tries<10){tries++;win=win.parent;} return win&&win.API_1484_11?win.API_1484_11:null;}
  window.SCORM={
    init(){api=findAPI(window)||findAPI(window.opener); if(!api)return false; initialized=api.Initialize('')==='true'; return initialized;},
    set(k,v){if(initialized) api.SetValue(k,String(v));},
    commit(){if(initialized) api.Commit('');},
    finish(){if(initialized){api.Commit('');api.Terminate('');initialized=false;}}
  };
})();
