(()=>{
  const nativeFetch=window.fetch.bind(window);
  const API_HOST='api.sleeper.app';
  const CACHE_PREFIX='combine:sleeper:';
  const CACHE_TTL=1000*60*60*24*7;
  const RETRIES=2;
  const TIMEOUT=7000;
  let snapshotPromise;
  let source='live';

  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const cacheKey=url=>CACHE_PREFIX+url;

  function loadSnapshot(){
    if(!snapshotPromise){
      snapshotPromise=nativeFetch(`data/sleeper-core.json?v=20260714-fast`,{cache:'force-cache'})
        .then(r=>r.ok?r.json():null)
        .catch(()=>null);
    }
    return snapshotPromise;
  }

  function save(url,text,status,headers){
    try{
      localStorage.setItem(cacheKey(url),JSON.stringify({
        savedAt:Date.now(),text,status,headers:[...headers.entries()]
      }));
    }catch{}
  }

  function cached(url){
    try{
      const raw=localStorage.getItem(cacheKey(url));
      if(!raw)return null;
      const item=JSON.parse(raw);
      if(!item?.text||Date.now()-item.savedAt>CACHE_TTL)return null;
      source='device cache';
      return new Response(item.text,{status:item.status||200,headers:item.headers||{'content-type':'application/json'}});
    }catch{return null}
  }

  async function timedFetch(input,init={}){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),TIMEOUT);
    try{return await nativeFetch(input,{...init,signal:controller.signal})}
    finally{clearTimeout(timer)}
  }

  window.fetch=async function(input,init={}){
    const url=typeof input==='string'?input:input?.url||'';
    let parsed;
    try{parsed=new URL(url,location.href)}catch{return nativeFetch(input,init)}
    if(parsed.hostname!==API_HOST)return nativeFetch(input,init);

    const path=parsed.pathname.replace(/^\/v1/,'');

    // Historical analytics must never delay standings, draft, contacts or commentary.
    // The analytics page will show preseason mode until a prebuilt stats snapshot is added.
    if(/^\/stats\/nfl\/regular\/2025\//.test(path)){
      return new Response('{}',{status:200,headers:{'content-type':'application/json','x-combine-source':'deferred-analytics'}});
    }

    const snapshot=await loadSnapshot();
    const snapshotData=snapshot?.endpoints?.[path];
    if(snapshotData!==undefined){
      source='synced snapshot';
      return new Response(JSON.stringify(snapshotData),{
        status:200,
        headers:{'content-type':'application/json','x-combine-source':'snapshot'}
      });
    }

    let lastError;
    for(let attempt=0;attempt<RETRIES;attempt++){
      try{
        const response=await timedFetch(input,{...init,cache:'no-store'});
        if(response.ok){
          const clone=response.clone();
          clone.text().then(text=>save(parsed.href,text,response.status,response.headers)).catch(()=>{});
          return response;
        }
        lastError=new Error(`Sleeper ${response.status}`);
        if(response.status<500&&response.status!==429)break;
      }catch(error){lastError=error}
      if(attempt<RETRIES-1)await sleep(600+Math.random()*300);
    }

    const fallback=cached(parsed.href);
    if(fallback)return fallback;
    throw lastError||new Error('Sleeper request failed');
  };

  window.addEventListener('DOMContentLoaded',()=>{
    setInterval(()=>{
      const el=document.querySelector('#live-status span');
      if(!el)return;
      if(source==='synced snapshot')el.textContent='Synced Sleeper data';
      if(source==='device cache')el.textContent='Cached Sleeper data';
    },1000);
  });
})();
