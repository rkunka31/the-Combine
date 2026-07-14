(()=>{
const clockHTML=`
<h2>The Clock Management Hall of Shame</h2>
<p>The draft consumed <strong>660 hours, 26 minutes and 56 seconds</strong> of combined clock time. That is more than 27 straight days spent deciding which football player to click. Civilization has completed infrastructure projects with less deliberation.</p>
<div class="panel" style="padding:18px;margin:18px 0;overflow-x:auto"><table class="standings-table"><thead><tr><th>#</th><th>Manager</th><th>Total time</th></tr></thead><tbody>
<tr><td>1</td><td>kevinlittle</td><td>152:27:57</td></tr>
<tr><td>2</td><td>AdamoQ</td><td>93:05:47</td></tr>
<tr><td>3</td><td>SwampSniper5</td><td>70:31:39</td></tr>
<tr><td>4</td><td>bobbyboucher</td><td>70:15:02</td></tr>
<tr><td>5</td><td>kstar93</td><td>63:37:57</td></tr>
<tr><td>6</td><td>SpiceyChorizo</td><td>53:23:06</td></tr>
<tr><td>7</td><td>SlappyMonkey</td><td>51:38:48</td></tr>
<tr><td>8</td><td>inquire22</td><td>38:47:50</td></tr>
<tr><td>9</td><td>ShaunWilkes</td><td>21:58:11</td></tr>
<tr><td>10</td><td>McSpencer</td><td>14:58:16</td></tr>
<tr><td>11</td><td>Vilhelmthebrave</td><td>7:45:36</td></tr>
<tr><td>12</td><td>HippieBroker</td><td>7:39:31</td></tr>
<tr><td>13</td><td>Kunks31</td><td>7:31:59</td></tr>
<tr><td>14</td><td>JimmyJames1867</td><td>6:45:10</td></tr>
</tbody></table></div>
<p><strong>kevinlittle</strong> used 152 hours and 28 minutes, nearly a full week, to produce Ja'Marr Chase, Nico Collins, Joe Burrow, Josh Jacobs and George Kittle. The roster is excellent. At that speed, it should have included legal review, architectural drawings and municipal approval.</p>
<p><strong>AdamoQ</strong> spent 93 hours assembling Taylor Made, the top-ranked franchise in the editorial index. That result excuses some of the delay, though 93 hours still suggests each selection involved a focus group and a second opinion from three unrelated cousins.</p>
<p><strong>SwampSniper5</strong> and <strong>bobbyboucher</strong> both crossed 70 hours, but for opposite reasons. SwampSniper built a balanced young contender. BobbyBoucher spent the same amount of time drafting players young enough to have homework. One was roster construction. The other was prenatal dynasty scouting.</p>
<p><strong>kstar93</strong> needed more than 63 hours to create 93 Problems, then left Quentin Johnston in the starting lineup. Somewhere around Hour 50, a second tab should have been opened.</p>
<p><strong>SpiceyChorizo</strong> and <strong>SlappyMonkey</strong> each cleared 50 hours. Spicey built an immediate contender with a visible expiry date. Slappy accumulated enough tight ends to launch a regional wholesaler. Both strategies were clear. Neither required two full days of contemplation.</p>
<p>At the other end, <strong>JimmyJames1867</strong> finished in 6:45:10 and built the league's most aggressive win-now roster. Lamar Jackson, Jahmyr Gibbs, Christian McCaffrey, Mike Evans, Terry McLaurin and Mark Andrews were selected with the urgency of someone drafting during airport boarding. The roster is old, violent and efficient. The clock usage matched the strategy.</p>
<p><strong>Kunks31</strong>, <strong>HippieBroker</strong> and <strong>Vilhelmthebrave</strong> all finished in under eight hours. Kunks31 built a youth-heavy future roster, HippieBroker built around Bijan and premium young pieces, and Vilhelmthebrave assembled one of the league's cleanest cores. Apparently decisive drafting and coherent roster construction are allowed to coexist.</p>
<p>The final lesson is simple. Time spent did not strongly correlate with draft quality. Several of the best rosters came from the fastest managers, while some of the longest deliberations produced the fantasy equivalent of reading the entire menu and ordering chicken fingers.</p>`;
const base=window.draftArticle;
window.draftArticle=function(d){
  const html=typeof base==='function'?base(d):'';
  return `${html}${clockHTML}`;
};
if(window.__COMBINE_EDITORIAL__){window.__COMBINE_EDITORIAL__.draftClockHTML=clockHTML;}
const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=`${src}?v=20260714d`;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
load('dh-values.js').then(()=>load('dh-integration.js')).then(()=>load('presentation-fix.js')).then(()=>{if(location.hash==='#autopsy'&&typeof window.renderAnalysis==='function')window.renderAnalysis();}).catch(()=>{});
})();
