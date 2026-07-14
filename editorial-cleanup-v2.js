(()=>{
const funnyIntro=`<p class="kicker">2026 FRANCHISE INDEX</p><h2>Fourteen teams enter. Several have a plan.</h2><p>Every roster gets two grades: how dangerous it looks in 2026, and how much value survives once the veterans begin checking retirement calculators. Overall splits the difference. The rankings are subjective, the criticism is personal, and appeals will be reviewed with the seriousness they deserve.</p>`;
function cleanAutopsy(){
 const view=document.querySelector('#view-autopsy'); if(!view)return;
 const head=view.querySelector('.page-head');
 if(head){const p=head.querySelector('p:last-child');if(p)p.textContent='Contenders, rebuilders and the teams bravely attempting both at once.'}
 [...view.querySelectorAll('.panel')].forEach(panel=>{
   const t=(panel.textContent||'').trim();
   if(/^Methodology\b/i.test(t)||/Dynasty market anchor|KeepTradeCut 1QB snapshot/i.test(t))panel.remove();
 });
 const root=view.querySelector('#autopsy-output'); if(!root)return;
 const grid=root.querySelector('.team-grid');
 let intro=grid?.previousElementSibling;
 if(intro&&intro.classList.contains('panel'))intro.innerHTML=funnyIntro;
 root.querySelectorAll('.dh-method,.dh-note').forEach(x=>x.remove());
 if(grid){
   const cards=[...grid.querySelectorAll(':scope > .team-card')];
   cards.sort((a,b)=>{
     const score=c=>Number(c.querySelector('.team-stats>div:first-child strong')?.textContent)||0;
     return score(b)-score(a);
   });
   cards.forEach((card,i)=>{
     const label=card.querySelector(':scope > p')||card.querySelector('.team-card-top p');
     if(label)label.textContent=`#${i+1} OVERALL`;
     grid.appendChild(card);
   });
 }
}
function cleanDraft(){
 const root=document.querySelector('#draft-recap-copy');if(!root)return;
 const headings=[...root.querySelectorAll('h2,h3')];
 headings.forEach(h=>{
   if(/DH Value|external dynasty|provider board|KeepTradeCut|KTC/i.test(h.textContent||'')){
     let n=h.nextElementSibling;h.remove();
     while(n&&!/^H2$/i.test(n.tagName)){const next=n.nextElementSibling;n.remove();n=next;}
   }
 });
 [...root.querySelectorAll('p,li')].forEach(el=>{if(/DH Value|external dynasty benchmark|provider board|KeepTradeCut|\bKTC\b/i.test(el.textContent||''))el.remove()});
}
function run(){cleanAutopsy();cleanDraft()}
new MutationObserver(run).observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('DOMContentLoaded',()=>{run();setTimeout(run,250);setTimeout(run,1200)});
window.addEventListener('hashchange',()=>setTimeout(run,0));
})();
