(()=>{
  window.hasLiveScoring=function(){
    return Array.isArray(window.S?.matchups) && window.S.matchups.some(w=>
      Array.isArray(w?.data) && w.data.some(m=>Number(m?.points||0)>0)
    );
  };

  if(typeof window.renderAnalysis==='function') window.analysis=window.renderAnalysis;
  if(typeof window.renderDesk==='function') window.desk=window.renderDesk;

  window.addEventListener('error',event=>{
    console.error('Combine render error:',event.error||event.message);
  });
})();