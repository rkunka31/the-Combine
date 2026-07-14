(()=>{
function cleanAnalysis(){
  const view=document.querySelector('#view-autopsy');
  const output=document.querySelector('#autopsy-output');
  if(!view||!output)return;

  const shell=output.parentElement;
  [...shell.children].forEach(el=>{
    if(el!==output&&el.classList?.contains('panel'))el.remove();
  });

  const intro=output.querySelector(':scope > .panel');
  if(intro){
    intro.innerHTML=`<p class="kicker">2026 FRANCHISE INDEX</p><h2>Fourteen rosters entered. Excuses were removed at the door.</h2><p>Every team gets credit for what it is trying to become and blamed for what it has already become. Contenders are judged on whether they can win now. Rebuilders are judged on whether the future is worth all the losing. Teams stuck between both timelines receive the traditional dynasty prize: unsolicited trade offers and emotional damage.</p>`;
  }

  output.querySelectorAll('.dh-method,.dh-note').forEach(el=>el.remove());

  const grid=output.querySelector('.team-grid');
  if(grid){
    const cards=[...grid.querySelectorAll(':scope > .team-card')];
    cards.sort((a,b)=>{
      const score=card=>Number(card.querySelector('.team-stats > div:first-child strong')?.textContent)||0;
      return score(b)-score(a);
    });
    cards.forEach((card,i)=>{
      const label=card.querySelector(':scope > p, .team-card-top p');
      if(label)label.textContent=`#${i+1} OVERALL`;
      grid.appendChild(card);
    });
  }
}

const analysisBase=window.renderAnalysis;
window.renderAnalysis=function(){
  analysisBase?.();
  setTimeout(cleanAnalysis,20);
};
window.analysis=window.renderAnalysis;

const draftBase=window.draftArticle;
window.draftArticle=function(d){
  let html=typeof draftBase==='function'?draftBase(d):'';
  html=html
    .replace(/<h2>DH Value audit<\/h2>/g,'<h2>The price-check audit</h2>')
    .replace(/<p>The uploaded provider board[^<]*<\/p>/g,'<p>A second pass compared every selection against the league-adjusted startup board. The bargains below showed restraint. The expensive convictions showed the kind of confidence usually seen immediately before someone says, “trust me.”</p>')
    .replace(/DH rank\s*(\d+)/g,'expected startup range $1')
    .replace(/than the provider board/g,'than the expected range')
    .replace(/<p>Future-pick values are also included[^<]*<\/p>/g,'<p>Future picks were also counted when judging each franchise. Apparently some managers understood this was dynasty. Others drafted as though the league dissolves after the championship.</p>')
    .replace(/KeepTradeCut|KTC|DH Value|external dynasty benchmark|provider/gi,'league board');
  return html;
};

setTimeout(()=>{
  if(location.hash==='#autopsy'&&typeof window.renderAnalysis==='function')window.renderAnalysis();
},50);
})();
