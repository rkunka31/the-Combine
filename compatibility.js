(()=>{
const ids=['player-search','position-filter','player-results','team-grid','team-room-title','team-room-owner','team-room','activity-feed','dashboard-activity','rules-grid'];
const host=document.createElement('div');host.id='legacy-compat';host.hidden=true;
ids.forEach(id=>{
  if(document.getElementById(id))return;
  let el;
  if(id==='player-search') el=document.createElement('input');
  else if(id==='position-filter') {el=document.createElement('select');el.innerHTML='<option value="ALL">All</option>';}
  else el=document.createElement('div');
  el.id=id;host.appendChild(el);
});
document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(host),{once:true});
})();