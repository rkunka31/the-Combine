import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
snapshot = json.loads((ROOT / 'data' / 'sleeper-core.json').read_text())
e = snapshot['endpoints']
league_id = snapshot['league_id']
users = e[f'/league/{league_id}/users']
rosters = e[f'/league/{league_id}/rosters']
drafts = e.get(f'/league/{league_id}/drafts', [])
traded = e.get(f'/league/{league_id}/traded_picks', [])
players = e.get('/players/nfl', {})
user_map = {u['user_id']: u for u in users}
roster_map = {r['roster_id']: r for r in rosters}

def team_name(r):
    u = user_map.get(r.get('owner_id'), {})
    return u.get('metadata', {}).get('team_name') or u.get('display_name') or f"Team {r['roster_id']}"

def owner_name(r):
    return user_map.get(r.get('owner_id'), {}).get('display_name', 'Vacant')

teams = []
for r in rosters:
    plist = []
    for pid in r.get('players') or []:
        p = players.get(str(pid), {})
        plist.append({
            'id': str(pid),
            'name': p.get('full_name') or p.get('search_full_name') or str(pid),
            'position': p.get('position'),
            'age': p.get('age'),
            'years_exp': p.get('years_exp'),
            'team': p.get('team'),
            'status': p.get('status'),
            'injury_status': p.get('injury_status'),
            'taxi': str(pid) in set(map(str, r.get('taxi') or [])),
            'reserve': str(pid) in set(map(str, r.get('reserve') or [])),
            'starter': str(pid) in set(map(str, r.get('starters') or [])),
        })
    teams.append({
        'roster_id': r['roster_id'],
        'team': team_name(r),
        'owner': owner_name(r),
        'players': plist,
        'starters': r.get('starters') or [],
        'taxi': r.get('taxi') or [],
        'reserve': r.get('reserve') or [],
    })

picks = []
for d in drafts:
    dp = e.get(f"/draft/{d['draft_id']}/picks", [])
    order = d.get('draft_order') or {}
    reverse_order = {int(slot): uid for uid, slot in order.items()}
    for p in dp:
        selecting = roster_map.get(int(p['roster_id']))
        original_uid = reverse_order.get(int(p.get('draft_slot') or 0))
        original = next((r for r in rosters if r.get('owner_id') == original_uid), None)
        picks.append({
            'draft_id': d['draft_id'],
            'pick_no': p.get('pick_no'),
            'round': p.get('round'),
            'draft_slot': p.get('draft_slot'),
            'player_id': str(p.get('player_id')),
            'player': f"{p.get('metadata', {}).get('first_name','')} {p.get('metadata', {}).get('last_name','')}".strip(),
            'position': p.get('metadata', {}).get('position'),
            'team': team_name(selecting) if selecting else None,
            'owner': owner_name(selecting) if selecting else None,
            'original_team': team_name(original) if original else None,
            'traded': bool(original and selecting and original['roster_id'] != selecting['roster_id']),
        })

out = {
    'generated_at': snapshot.get('generated_at'),
    'league': e.get(f'/league/{league_id}', {}),
    'teams': sorted(teams, key=lambda x: x['roster_id']),
    'drafts': drafts,
    'picks': sorted(picks, key=lambda x: (str(x['draft_id']), x.get('pick_no') or 0)),
    'traded_picks': traded,
}
(ROOT / 'data' / 'editorial-source.json').write_text(json.dumps(out, indent=2))
print(f"Wrote {len(teams)} teams and {len(picks)} picks")
