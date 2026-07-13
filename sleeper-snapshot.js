(()=>{
  const nativeFetch=window.fetch.bind(window);
  const API_HOST='api.sleeper.app';
  let snapshotPromise;

  function loadSnapshot(){
    if(!snapshotPromise){
      snapshotPromise=nativeFetch(`data/sleeper-core.json?v=${Date.now()}`,{cache:'no-store'})
        .then(r=>r.ok?r.json():null)
        .catch(()=>null);
    }
    return snapshotPromise;
  }

  window.fetch=async function(input,init={}){
    const url=typeof input==='string'?input:input?.url||'';
    let parsed;
    try{parsed=new URL(url,location.href)}catch{return nativeFetch(input,init)}
    if(parsed.hostname!==API_HOST)return nativeFetch(input,init);

    const snapshot=await loadSnapshot();
    const path=parsed.pathname.replace(/^\/v1/,'');
    const data=snapshot?.endpoints?.[path];
    if(data!==undefined){
      window.__COMBINE_SNAPSHOT_USED__=true;
      return new Response(JSON.stringify(data),{
        status:200,
        headers:{'content-type':'application/json','x-combine-source':'snapshot'}
      });
    }
    return nativeFetch(input,init);
  };

  window.addEventListener('DOMContentLoaded',()=>{
    setTimeout(()=>{
      if(window.__COMBINE_SNAPSHOT_USED__){
        const el=document.querySelector('#live-status span');
        if(el)el.textContent='Synced Sleeper data';
      }
    },1500);
  });
})();
