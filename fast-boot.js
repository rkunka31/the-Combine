(()=>{
const nativeFetch=window.fetch.bind(window);
window.fetch=(input,init)=>{
  const url=typeof input==='string'?input:(input?.url||'');
  if(/\/stats\/nfl\/regular\/2025\//.test(url)){
    return Promise.resolve(new Response('{}',{status:200,headers:{'Content-Type':'application/json'}}));
  }
  return nativeFetch(input,init);
};
})();
