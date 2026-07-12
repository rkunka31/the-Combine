const CFG = {
  id: '1315912688991227904',
  api: 'https://api.sleeper.app/v1',
  worker: 'https://the-combine.rkunka31.workers.dev'
};

const ST = {
  league: {}, nfl: {}, users: [], rosters: [], players: {},
  picks: [], drafts: [], draftPicks: [], tx: [], matchups: [], contacts: [],
  um: new Map(), rm: new Map()
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[c]));
const fmt = (v, d = 1) => Number(v || 0).toFixed(d);
const ini = s => (s || '?').split(/\s+/).map(x => x[0]).join('').slice(0,2).toUpperCase();

function status(type, label) {
  const el = $('#live-status');
  if (!el) return;
  el.className = `live-status ${type || ''}`.trim();
  const text = el.querySelector('span');
  if (text) text.textContent = label;
}
window.status = status;

function toast(msg) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}
window.toast = toast;

async function get(path) {
  const r = await fetch(CFG.api + path, { cache: 'no-store' });
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return r.json();
}

async function cloud(key) {
  try {
    const r = await fetch(`${CFG.worker}/get?key=${encodeURIComponent(key)}`, { cache: 'no-store' });
    if (!r.ok) return null;
    const d = await r.json();
    return d.value ?? null;
  } catch {
    return null;
  }
}

const name = r => {
  const u = ST.um.get(r?.owner_id);
  return u?.metadata?.team_name || u?.display_name || `Team ${r?.roster_id || ''}`;
};
const owner = r => ST.um.get(r?.owner_id)?.display_name || 'Vacant';
const record = r => `${r?.settings?.wins || 0}-${r?.settings?.losses || 0}`;
const pf = r => (r?.settings?.fpts || 0) + (r?.settings?.fpts_decimal || 0) / 100;
const maxpf = r => (r?.settings?.ppts || 0) + (r?.settings?.ppts_decimal || 0) / 100;
const sortRosters = () => [...ST.rosters].sort((a,b) =>
  (b.settings?.wins || 0) - (a.settings?.wins || 0) || pf(b) - pf(a)
);
const pname = id => ST.players[id]?.full_name || id;
const pos = id => ST.players[id]?.position || 'NA';

const NAV = [
  ['dashboard','Dashboard'],['standings','Standings'],['contacts','Contacts'],
  ['teams','Teams'],['activity','Activity'],['draft','Draft'],
  ['analytics','Analytics'],['report','League Report'],['charter','Charter'],['rules','League']
];

function show(view) {
  $$('.view').forEach(x => x.classList.toggle('active', x.id === `view-${view}`));
  $$('.nav-link').forEach(x => x.classList.toggle('active', x.dataset.view === view));
  $('#mobile-menu')?.classList.remove('open');
  history.replaceState(null, '', `#${view}`);
  window.scrollTo(0,0);
}
window.show = show;

function setupNav() {
  const html = NAV.map(([v,l],i) =>
    `<button class="nav-link${i ? '' : ' active'}" data-view="${v}">${l}</button>`
  ).join('');
  const desktop = $('#desktop-nav');
  const mobile = $('#mobile-menu');
  if (desktop) desktop.innerHTML = html;
  if (mobile) mobile.innerHTML = html;
  $$('.nav-link').forEach(b => b.onclick = () => show(b.dataset.view));
  $$('[data-jump]').forEach(b => b.onclick = () => show(b.dataset.jump));
}

function leagueTable(rows, limit) {
  rows = limit ? rows.slice(0, limit) : rows;
  return `<div class="table-wrap"><table class="league-table">
    <thead><tr><th>Team</th><th>Record</th><th>PF</th><th>Max PF</th></tr></thead>
    <tbody>${rows.map((r,i) => `<tr>
      <td><button class="team-link" data-team="${r.roster_id}">
        <span class="rank">${i+1}</span><span class="avatar">${ini(name(r))}</span>
        <span><strong>${esc(name(r))}</strong><small>${esc(owner(r))}</small></span>
      </button></td>
      <td>${record(r)}</td><td>${fmt(pf(r))}</td><td>${fmt(maxpf(r))}</td>
    </tr>`).join('')}</tbody></table></div>`;
}

function roster(r) {
  return (r?.players || []).map(id => ({ id, ...(ST.players[id] || {}) }))
    .sort((a,b) => (a.position || 'Z').localeCompare(b.position || 'Z') ||
      (a.full_name || '').localeCompare(b.full_name || ''));
}

function openTeam(id) {
  const r = ST.rm.get(id);
  if (!r) return;
  const p = roster(r);
  $('#team-room-title').textContent = name(r);
  $('#team-room-owner').textContent = owner(r);
  $('#team-room').innerHTML = `
    <div class="leader-cards">
      <div class="leader-card"><span>Record</span><strong>${record(r)}</strong><small>${fmt(pf(r))} PF</small></div>
      <div class="leader-card"><span>Roster size</span><strong>${p.length}</strong><small>${(r.taxi || []).length} taxi</small></div>
      <div class="leader-card"><span>Max PF</span><strong>${fmt(maxpf(r))}</strong><small>${fmt(maxpf(r)-pf(r))} lineup gap</small></div>
    </div>
    <div class="position-sections">
      ${['QB','RB','WR','TE','K','DEF','NA'].map(position => {
        const group = p.filter(x => (x.position || 'NA') === position);
        if (!group.length) return '';
        return `<section class="panel"><div class="panel-head"><h2>${position}</h2><span>${group.length} players</span></div>
          <div class="player-list">${group.map(x => `<div class="player-row"><strong>${esc(x.full_name || pname(x.id))}</strong><span>${esc(x.team || 'FA')} · ${esc(x.position || '')}</span></div>`).join('')}</div>
        </section>`;
      }).join('')}
    </div>`;
  show('team');
}

function renderTeams() {
  const rows = sortRosters();
  $('#team-grid').innerHTML = rows.map((r,i) => {
    const p = roster(r);
    return `<article class="panel team-card" data-open="${r.roster_id}">
      <div class="team-card-top"><span class="avatar">${ini(name(r))}</span><div>
        <p>#${i+1} IN THE TABLE</p><h3>${esc(name(r))}</h3><p>${esc(owner(r))}</p>
      </div></div>
      <div class="team-stats"><div><span>Record</span><strong>${record(r)}</strong></div>
      <div><span>Players</span><strong>${p.length}</strong></div>
      <div><span>Max PF</span><strong>${fmt(maxpf(r))}</strong></div></div>
      <p class="roster-mix">${['QB','RB','WR','TE'].map(x => `${x} ${p.filter(y => y.position === x).length}`).join(' · ')}</p>
    </article>`;
  }).join('');
  $$('[data-open]').forEach(x => x.onclick = () => openTeam(+x.dataset.open));
}

function playerSearch() {
  const q = ($('#player-search')?.value || '').toLowerCase();
  const position = $('#position-filter')?.value || 'ALL';
  if (!q) {
    $('#player-results').innerHTML = '';
    return;
  }
  const out = [];
  ST.rosters.forEach(r => roster(r).forEach(x => {
    if ((x.full_name || '').toLowerCase().includes(q) && (position === 'ALL' || x.position === position)) out.push({x,r});
  }));
  $('#player-results').innerHTML = `<div class="panel search-results">${
    out.length ? out.slice(0,30).map(({x,r}) => `<button data-open="${r.roster_id}">
      <strong>${esc(x.full_name)}</strong><span>${esc(x.position || '')} · ${esc(name(r))}</span>
    </button>`).join('') : 'No owned players match.'
  }</div>`;
  $$('#player-results [data-open]').forEach(x => x.onclick = () => openTeam(+x.dataset.open));
}

function renderTx(sel, limit) {
  const el = $(sel);
  if (!el) return;
  el.innerHTML = ST.tx.length ? ST.tx.slice(0,limit).map(t => {
    const adds = Object.keys(t.adds || {}).map(pname);
    const drops = Object.keys(t.drops || {}).map(pname);
    return `<div class="feed-item"><div class="feed-icon">${t.type === 'trade' ? '⇄' : t.type === 'waiver' ? '$' : '+'}</div>
      <div><strong>${t.type === 'trade' ? 'Trade' : t.type === 'waiver' ? 'Waiver claim' : 'Roster move'}</strong>
      <p>${esc(adds.length ? `Added ${adds.join(', ')}` : drops.length ? `Dropped ${drops.join(', ')}` : 'Draft assets moved')}</p></div>
    </div>`;
  }).join('') : '<div class="loading-block">No recent transactions.</div>';
}

async function renderContacts() {
  const saved = await cloud('roster');
  ST.contacts = Array.isArray(saved) ? saved : [];
  const q = ($('#contact-search')?.value || '').toLowerCase();
  const rows = sortRosters().map(r => {
    const u = ST.um.get(r.owner_id);
    const c = ST.contacts.find(x =>
      x.sleeper_user_id === r.owner_id ||
      String(x.team || '').toLowerCase() === name(r).toLowerCase()
    ) || {};
    return {
      team:name(r), owner:c.name || u?.display_name || 'Not entered',
      email:c.email || '', phone:c.phone || '', handle:u?.display_name || ''
    };
  }).filter(x => Object.values(x).join(' ').toLowerCase().includes(q));

  $('#contact-grid').innerHTML = rows.map(x => `<article class="panel contact-card">
    <span class="avatar">${ini(x.team)}</span><div><h3>${esc(x.team)}</h3><p>${esc(x.owner)}</p><small>@${esc(x.handle)}</small></div>
    <div class="contact-actions">${x.email ? `<a href="mailto:${esc(x.email)}">${esc(x.email)}</a>` : '<span>Email not entered</span>'}
    ${x.phone ? `<a href="tel:${esc(x.phone)}">${esc(x.phone)}</a>` : '<span>Phone not entered</span>'}</div>
  </article>`).join('');
}

async function renderDraft() {
  const d = ST.drafts.find(x => x.status === 'complete') || ST.drafts[0];
  if (!d) {
    $('#draft-board').innerHTML = '<div class="loading-block">No draft found.</div>';
    return;
  }
  try { ST.draftPicks = await get(`/draft/${d.draft_id}/picks`); } catch { ST.draftPicks = []; }
  $('#draft-board').innerHTML = `<div class="panel-head"><div><p class="kicker">${esc(d.season || '')} Draft</p><h2>${esc(d.status || '')}</h2></div></div>
    <div class="draft-board-grid">${ST.draftPicks.map(p => `<div class="draft-pick"><span>Pick ${p.pick_no}</span>
      <strong>${esc(p.metadata?.first_name || '')} ${esc(p.metadata?.last_name || '')}</strong>
      <small>${esc(p.metadata?.position || '')} · ${esc(name(ST.rm.get(p.roster_id)))}</small></div>`).join('') || '<div class="loading-block">No completed picks yet.</div>'}</div>`;
  renderCapital();
  renderRecap();
}

function renderCapital() {
  const years = [2027,2028,2029], rounds = [1,2,3], rows = sortRosters(), own = new Map();
  ST.picks.forEach(p => own.set(`${p.season}-${p.round}-${p.roster_id}`, p.owner_id));
  $('#draft-capital').innerHTML = years.map(y => `<div class="draft-grid"><div class="draft-head">${y}</div>
    ${rounds.map(r => `<div class="draft-head">Round ${r}</div>`).join('')}
    ${rows.map(t => `<div><strong>${esc(name(t))}</strong></div>${rounds.map(r => {
      const ownerId = own.get(`${y}-${r}-${t.roster_id}`) || t.roster_id;
      return `<div><span class="pick-chip">${esc(name(ST.rm.get(ownerId)))}</span></div>`;
    }).join('')}`).join('')}</div>`).join('');
}

function renderRecap() {
  const by = {};
  ST.draftPicks.forEach(p => (by[p.round] ??= []).push(p));
  $('#draft-recap-copy').innerHTML = ST.draftPicks.length
    ? `<h2>Draft recap</h2><p>${ST.draftPicks.length} selections are on the board.</p>${
      Object.entries(by).map(([r,a]) => `<h2>Round ${r}</h2><p>${
        a.map(p => `${p.metadata?.first_name || ''} ${p.metadata?.last_name || ''} to ${name(ST.rm.get(p.roster_id))}`).join('. ')
      }.</p>`).join('')
    }`
    : '<p>No completed selections are available.</p>';
}

function analytics() {
  const view = $('#analytics-view')?.value || 'teams';
  const team = $('#analytics-team')?.value || 'ALL';
  const position = $('#analytics-position')?.value || 'ALL';
  const week = $('#analytics-weeks')?.value || 'ALL';
  const sortBy = $('#analytics-sort')?.value || 'points';

  let rows = ST.matchups.flatMap(w => w.data.flatMap(m =>
    Object.entries(m.players_points || {}).map(([id,points]) => ({
      week:w.week,id,roster:m.roster_id,points:+points || 0,starts:(m.starters || []).includes(id) ? 1 : 0
    }))
  )).filter(x =>
    (team === 'ALL' || String(x.roster) === team) &&
    (position === 'ALL' || pos(x.id) === position) &&
    (week === 'ALL' || String(x.week) === week)
  );

  const total = rows.reduce((s,x) => s + x.points, 0);
  $('#analytics-summary').innerHTML = `<div class="leader-card"><span>Total points</span><strong>${fmt(total)}</strong></div>
    <div class="leader-card"><span>Records</span><strong>${rows.length}</strong></div>
    <div class="leader-card"><span>Average</span><strong>${fmt(rows.length ? total / rows.length : 0)}</strong></div>`;

  const map = new Map();
  rows.forEach(x => {
    const key = view === 'players' ? `${x.roster}-${x.id}` : view === 'positions' ? pos(x.id) : x.roster;
    const a = map.get(key) || {
      name:view === 'players' ? pname(x.id) : view === 'positions' ? pos(x.id) : name(ST.rm.get(x.roster)),
      position:pos(x.id), team:name(ST.rm.get(x.roster)), points:0, weeks:0, starts:0
    };
    a.points += x.points; a.weeks++; a.starts += x.starts; map.set(key,a);
  });

  const data = [...map.values()].map(x => ({...x,average:x.weeks ? x.points/x.weeks : 0}))
    .sort((a,b) => (b[sortBy] || 0) - (a[sortBy] || 0));

  $('#analytics-output').innerHTML = `<div class="table-wrap"><table class="league-table">
    <thead><tr><th>${view === 'players' ? 'Player' : 'Group'}</th>${view === 'players' ? '<th>Pos</th><th>Team</th>' : ''}<th>Points</th><th>Avg</th><th>Starts</th></tr></thead>
    <tbody>${data.map(x => `<tr><td>${esc(x.name)}</td>${view === 'players' ? `<td>${esc(x.position)}</td><td>${esc(x.team)}</td>` : ''}<td>${fmt(x.points)}</td><td>${fmt(x.average)}</td><td>${x.starts}</td></tr>`).join('')}</tbody>
  </table></div>`;
}

function rules() {
  const l = ST.league, s = l.settings || {}, r = l.roster_positions || [];
  const cards = [
    ['League',l.name || 'The Combine','Sleeper dynasty league'],
    ['Teams',l.total_rosters || ST.rosters.length,'Franchises'],
    ['Scoring',l.scoring_settings?.rec === 1.5 ? 'Full PPR + 0.5 TEP' : 'Custom scoring','Reception scoring'],
    ['Starting lineup',r.filter(x => !['BN','IR','TAXI'].includes(x)).length,'Weekly starters'],
    ['Trade deadline',s.trade_deadline ? `Week ${s.trade_deadline}` : 'See charter','League setting'],
    ['Waivers',s.waiver_type === 2 ? 'FAAB' : 'Custom',`${s.waiver_budget || 100} budget`],
    ['Playoffs',s.playoff_teams || 6,'Teams qualify'],
    ['Taxi squad',s.taxi_slots || 5,'Development spots'],
    ['Future picks','3 rounds','Rookie assets']
  ];
  $('#rules-grid').innerHTML = cards.map(x => `<article class="panel rule-card"><span>${esc(x[0])}</span><strong>${esc(x[1])}</strong><p>${esc(x[2])}</p></article>`).join('');
}

function report() {
  const rows = sortRosters();
  if (!rows.length) return;
  $('#report-copy').innerHTML = `<h2>State of the league</h2><p>${esc(name(rows[0]))} leads at ${record(rows[0])}. Team rooms show every owned player and roster composition.</p>
    <h2>Data lab</h2><p>Use Analytics to filter scoring by team, player, position and week.</p>
    <h2>League activity</h2><p>${ST.tx.length} recent transactions are loaded from Sleeper.</p>`;
  $('#briefing-copy').textContent = `${name(rows[0])} leads the table. Open Analytics for scoring splits.`;
}

function renderCore() {
  const rows = sortRosters();
  $('#dashboard-standings').innerHTML = leagueTable(rows,6);
  $('#standings-table').innerHTML = leagueTable(rows);
  $$('.team-link').forEach(x => x.onclick = () => openTeam(+x.dataset.team));
  renderTx('#dashboard-activity',5);
  renderTx('#activity-feed',40);

  if (rows.length) {
    const pointsLeader = [...rows].sort((a,b) => pf(b)-pf(a))[0];
    const maxLeader = [...rows].sort((a,b) => maxpf(b)-maxpf(a))[0];
    $('#leader-cards').innerHTML = [
      ['Best record',rows[0],record(rows[0])],
      ['Points leader',pointsLeader,fmt(pf(pointsLeader))],
      ['Max PF leader',maxLeader,fmt(maxpf(maxLeader))]
    ].map(([l,r,v]) => `<div class="leader-card"><span>${l}</span><strong>${esc(name(r))}</strong><small>${v}</small></div>`).join('');
  }

  renderTeams();
  renderContacts();
  rules();
  report();

  $('#team-count').textContent = ST.rosters.length;
  $('#season-label').textContent = ST.league.season || '2026';
  $('#week-label').textContent = `${ST.nfl.season_type || 'Season'}, Week ${ST.nfl.week || 1}`;
  $('#report-date').textContent = new Date().toLocaleDateString('en-CA',{year:'numeric',month:'long',day:'numeric'});
  $('#analytics-team').innerHTML = '<option value="ALL">All teams</option>' + rows.map(r => `<option value="${r.roster_id}">${esc(name(r))}</option>`).join('');
  $('#analytics-weeks').innerHTML = '<option value="ALL">All loaded weeks</option>' + ST.matchups.map(x => `<option value="${x.week}">Week ${x.week}</option>`).join('');
  analytics();
}

async function load() {
  status('', 'Connecting');

  const required = await Promise.allSettled([
    get(`/league/${CFG.id}`),
    get('/state/nfl'),
    get(`/league/${CFG.id}/users`),
    get(`/league/${CFG.id}/rosters`)
  ]);

  if (required.some(x => x.status === 'rejected')) {
    console.error(required);
    status('error','Sleeper unavailable');
    $$('.loading-block').forEach(x => x.innerHTML = '<div class="error-state">Sleeper data did not load. Please try again shortly.</div>');
    return;
  }

  [ST.league, ST.nfl, ST.users, ST.rosters] = required.map(x => x.value);
  ST.users.forEach(x => ST.um.set(x.user_id,x));
  ST.rosters.forEach(x => ST.rm.set(x.roster_id,x));

  const optional = await Promise.allSettled([
    get(`/league/${CFG.id}/traded_picks`),
    get(`/league/${CFG.id}/drafts`),
    get('/players/nfl')
  ]);
  ST.picks = optional[0].status === 'fulfilled' ? optional[0].value : [];
  ST.drafts = optional[1].status === 'fulfilled' ? optional[1].value : [];
  ST.players = optional[2].status === 'fulfilled' ? optional[2].value : {};

  const w = Math.max(1, ST.nfl.week || 1);
  const txResults = await Promise.allSettled([...new Set([w,Math.max(1,w-1),1])].map(x => get(`/league/${CFG.id}/transactions/${x}`)));
  ST.tx = txResults.flatMap(x => x.status === 'fulfilled' ? x.value : []);

  const matchupResults = await Promise.allSettled(
    Array.from({length:w},(_,i) => i+1).map(x => get(`/league/${CFG.id}/matchups/${x}`).then(data => ({week:x,data})))
  );
  ST.matchups = matchupResults.filter(x => x.status === 'fulfilled').map(x => x.value);

  renderCore();
  renderDraft();
  if (typeof window.charter === 'function') window.charter();
  status('live','Live Sleeper data');
}

function bind() {
  setupNav();
  $('#menu-button').onclick = () => $('#mobile-menu').classList.toggle('open');
  $('#sleeper-link').href = `https://sleeper.com/leagues/${CFG.id}`;
  $('#player-search').oninput = playerSearch;
  $('#position-filter').onchange = playerSearch;
  $('#contact-search').oninput = renderContacts;
  $('#refresh-contacts').onclick = renderContacts;
  $$('[data-drafttab]').forEach(b => b.onclick = () => {
    $$('[data-drafttab]').forEach(x => x.classList.toggle('active',x === b));
    ['board','capital','recap'].forEach(x => $(`#draft-${x}`).classList.toggle('hidden',x !== b.dataset.drafttab));
  });
  $('#generate-draft-roast').onclick = renderRecap;
  ['analytics-view','analytics-team','analytics-position','analytics-weeks','analytics-sort'].forEach(id => {
    const el = $(`#${id}`); if (el) el.onchange = analytics;
  });
  $('#refresh-report').onclick = report;
  const initial = location.hash.slice(1);
  if (initial && $(`#view-${initial}`)) show(initial);
}

bind();
load();
