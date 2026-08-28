/* ============================================================
   NEUROPLAY — Views: Home, Discover, Detail, Mix, Progress, Profile, Search, Onboarding
   ============================================================ */
(function(){
  const $ = NP.$;
  NP.VIEWS = {};
  const V = NP.VIEWS;

  const cards = (games, opts) => games.map((g,i) => NP.gameCard(g, Object.assign({uid: 'r'+i}, opts))).join('');

  function heroGame(){
    // rotate featured game daily; prefer NEURAL 2048 first ever
    const s = NP.store.state;
    if (!s.stats.gamesPlayed) return NP.GAME_INDEX['neural-2048'];
    const featured = ['neural-2048','word-guess','mental-rotation','simon','schulte','sudoku','stroop'];
    const dayIdx = Math.floor(Date.now() / 864e5) % featured.length;
    return NP.GAME_INDEX[featured[dayIdx]];
  }

  /* ================= HOME ================= */
  V.home = function(){
    const s = NP.store.state;
    const hg = heroGame();
    const hcat = NP.CATEGORIES[hg.cat];
    const mix = NP.store.ensureDailyMix();
    const li = NP.store.levelInfo();

    const recentGames = s.recent.map(r => NP.GAME_INDEX[r.id]).filter(Boolean);
    const trending = NP.GAMES.filter(g => g.players > 60000).slice(0, 12);
    const quick = NP.GAMES.filter(g => g.mins <= 3).slice(0, 14);
    const strong = NP.store.strongestCats(2).filter(x => x.s > 0);
    const weak = NP.store.weakestCats(3);
    const relax = NP.GAMES.filter(g => g.cat === 'relax');
    const hard = NP.GAMES.filter(g => g.diff >= 4).slice(0, 12);
    const newGames = NP.GAMES.slice(-10).reverse();
    const mixGames = mix.games.map(id => NP.GAME_INDEX[id]);
    const mixDone = mix.done.length;

    const strongRail = strong.length
      ? NP.rail('Your Strongest Skills', cards(strong.flatMap(x => NP.GAMES.filter(g => g.cat === x.cat).slice(0,4))), { icon:'fa-medal', iconColor:'#FACC15', sub: strong.map(x => NP.CATEGORIES[x.cat].name).join(' · ') + ' — keep dominating' })
      : '';
    const weakRail = s.stats.gamesPlayed >= 3
      ? NP.rail('Improve These Skills', cards(weak.flatMap(x => NP.GAMES.filter(g => g.cat === x.cat && g.playable).slice(0,3))), { icon:'fa-arrow-trend-up', iconColor:'#34D399', sub:'Personalized picks for your growth areas' })
      : '';

    return `
    <div class="page">
      <section class="hero" id="hero-section">
        <div class="hero-bg"><div class="hero-bg-art">${NP.banner(hg, {uid:'hero'})}</div></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <span class="hero-eyebrow"><span class="cat-dot" style="background:${hcat.color}"></span> Featured · ${hcat.full}</span>
          <h1>${NP.esc(hg.name)}</h1>
          <p class="hero-desc">${NP.esc(hg.desc)}</p>
          <div class="hero-meta">
            <div class="hero-meta-item"><span class="k">Difficulty</span><span class="v">${NP.diffLabel(hg.diff)}</span></div>
            <div class="hero-meta-item"><span class="k">Avg Time</span><span class="v">${NP.fmtMins(hg.mins)}</span></div>
            <div class="hero-meta-item"><span class="k">XP Reward</span><span class="v" style="color:${hcat.color}">+${hg.xp} XP</span></div>
          </div>
          <div class="hero-actions">
            <button class="btn btn-primary btn-lg" data-play="${hg.id}"><i class="fa-solid fa-play"></i> PLAY NOW</button>
            <button class="btn btn-glass btn-lg" data-detail="${hg.id}">DETAILS</button>
          </div>
        </div>
      </section>

      <section class="page-pad mb-6" aria-label="Your status">
        <div class="panel glass flex aic gap-4 wrap" style="padding:18px 24px">
          <div class="flex aic gap-3" style="flex:1;min-width:220px">
            <div class="nav-avatar" style="width:46px;height:46px" aria-hidden="true">${NP.esc((s.profile.name||'P')[0].toUpperCase())}</div>
            <div style="flex:1;min-width:0">
              <div style="font-family:var(--font-display);font-weight:700;font-size:15px">Level ${li.level} · ${li.title}</div>
              <div class="xp-bar mt-2" style="max-width:280px"><i style="width:${Math.round(li.progress*100)}%"></i></div>
            </div>
          </div>
          <div class="flex gap-5 aic wrap">
            <div class="tc"><div style="font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--cat-speed)"><i class="fa-solid fa-fire" style="font-size:15px"></i> ${s.streak.current}</div><div class="dim" style="font-size:10px;letter-spacing:.1em;font-weight:700">STREAK</div></div>
            <div class="tc"><div style="font-family:var(--font-display);font-weight:800;font-size:20px">${s.xp.toLocaleString()}</div><div class="dim" style="font-size:10px;letter-spacing:.1em;font-weight:700">TOTAL XP</div></div>
            <div class="tc"><div style="font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--cat-relax)">${mixDone}/5</div><div class="dim" style="font-size:10px;letter-spacing:.1em;font-weight:700">DAILY MIX</div></div>
          </div>
        </div>
      </section>

      ${recentGames.length ? NP.rail('Continue Playing', recentGames.map((g,i) => NP.gameCard(g, {wide:true, uid:'cp'+i, progress: Math.min(95, 30 + (s.playCount[g.id]||1)*12), badge:'Recent'})).join(''), { icon:'fa-clock-rotate-left', sub:'Pick up where you left off' }) : ''}

      ${NP.rail('Daily Brain Mix', mixGames.map((g,i) => NP.gameCard(g, {uid:'dm'+i, badge: mix.done.includes(g.id) ? '✓ Done' : `${i+1} of 5`, badgeColor: mix.done.includes(g.id) ? '#34D399' : '#2DD4BF'})).join(''), { icon:'fa-flask', iconColor:'#2DD4BF', sub:`${mixDone}/5 complete · +50 bonus XP for finishing all five`, more:'/daily' })}

      ${NP.rail('Trending Now', cards(trending, {}), { icon:'fa-arrow-trend-up', iconColor:'#F43F5E', sub:'What players are loving this week', more:'/discover?f=trending' })}

      ${NP.rail('Quick Play — Under 3 Minutes', cards(quick), { icon:'fa-bolt', iconColor:'#FACC15', sub:'Perfect for a fast mental spark', more:'/discover?f=quick' })}

      ${strongRail}
      ${weakRail}

      ${NP.rail('Relax & Flow', cards(relax), { icon:'fa-spa', iconColor:'#2DD4BF', sub:'Calm games. No aggressive timers.', more:'/discover?cat=relax' })}

      ${NP.rail('New Games', cards(newGames, {badge:'New', badgeColor:'#34D399'}), { icon:'fa-sparkles', iconColor:'#34D399', sub:'Fresh additions to the library' })}

      ${NP.rail('Challenge Yourself', cards(hard), { icon:'fa-fire-flame-curved', iconColor:'#F97316', sub:'Advanced games for sharp minds', more:'/discover?f=hard' })}

      <footer class="page-pad tc dim" style="font-size:12px;padding-top:24px">NEUROPLAY — Train your mind. Play your way. · ${NP.GAMES.length} games · 10 cognitive categories</footer>
    </div>`;
  };

  /* ================= DISCOVER ================= */
  V.discover = function(params){
    const cat = params.get('cat') || 'all';
    const f = params.get('f') || '';
    const q = (params.get('q') || '').toLowerCase();

    let games = NP.GAMES.slice();
    if (cat !== 'all') games = games.filter(g => g.cat === cat);
    if (f === 'quick') games = games.filter(g => g.mins <= 3);
    if (f === 'trending') games = games.filter(g => g.players > 60000);
    if (f === 'new') games = NP.GAMES.slice(-14).reverse().filter(g => cat === 'all' || g.cat === cat);
    if (f === 'hard') games = games.filter(g => g.diff >= 4);
    if (f === 'easy') games = games.filter(g => g.diff <= 2);
    if (f === 'reco'){
      const weak = NP.store.weakestCats(3).map(x => x.cat);
      games = games.filter(g => weak.includes(g.cat));
    }
    if (f === 'playable') games = games.filter(g => g.playable);
    if (q) games = games.filter(g => (g.name + ' ' + g.sub + ' ' + NP.CATEGORIES[g.cat].full).toLowerCase().includes(q));

    const catChips = [['all','All']].concat(Object.values(NP.CATEGORIES).map(c => [c.id, c.name]));
    const filters = [['','Everything'],['playable','Playable Now'],['quick','Under 3 min'],['trending','Trending'],['new','New'],['reco','Recommended'],['easy','Casual'],['hard','Advanced']];

    return `
    <div class="page">
      <div class="page-pad mb-5">
        <div class="eyebrow mb-2">Library</div>
        <h1 style="font-size:clamp(30px,4.6vw,44px);letter-spacing:-.02em;margin-bottom:20px">Discover Games</h1>
        <div class="search-bar" role="search">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input id="disc-search" type="search" placeholder="Search ${NP.GAMES.length} games…" value="${NP.esc(params.get('q')||'')}" aria-label="Search games">
        </div>
      </div>
      <div class="chip-row" role="tablist" aria-label="Categories">
        ${catChips.map(([id,name]) => {
          const c = NP.CATEGORIES[id];
          return `<button class="chip ${cat===id?'active':''}" data-chip-cat="${id}" role="tab" aria-selected="${cat===id}" ${c?`style="--chip-fg:${c.color};--chip-bg:${c.color}20"`:''}>${c?`<span class="cat-dot" style="background:${c.color}"></span>`:''}${name}</button>`;
        }).join('')}
      </div>
      <div class="chip-row" role="tablist" aria-label="Filters">
        ${filters.map(([id,name]) => `<button class="chip ${f===id?'active':''}" data-chip-f="${id}" role="tab" aria-selected="${f===id}">${name}</button>`).join('')}
      </div>
      <div class="page-pad dim mb-3" style="font-size:13px">${games.length} game${games.length===1?'':'s'}</div>
      ${games.length ? `<div class="game-grid">${games.map((g,i) => NP.gameCard(g,{uid:'d'+i})).join('')}</div>`
        : `<div class="page-pad tc" style="padding-top:60px;padding-bottom:60px"><i class="fa-solid fa-ghost" style="font-size:40px;color:var(--text-low)"></i><p class="muted mt-4">No games match. Try different filters.</p></div>`}
    </div>`;
  };

  /* ================= GAME DETAIL ================= */
  V.detail = function(params, gameId){
    const g = NP.GAME_INDEX[gameId];
    if (!g) return V.notFound();
    const cat = NP.CATEGORIES[g.cat];
    const s = NP.store.state;
    const best = s.best[g.id] || 0;
    const plays = s.playCount[g.id] || 0;
    const saved = s.saved.includes(g.id);
    const similar = NP.GAMES.filter(x => x.cat === g.cat && x.id !== g.id).slice(0, 8);
    const rank = best ? Math.max(1, Math.round(4000 / Math.log2(best + 2))) : null;

    return `
    <div class="page" style="padding-top:calc(var(--nav-h))">
      <section class="detail-hero" style="--glow:${cat.color}55">
        <div class="detail-bg"><div class="hero-bg-art">${NP.banner(g, {uid:'dh'})}</div></div>
        <div class="detail-overlay"></div>
        <div class="detail-content">
          <div class="detail-cover">${NP.cover(g, {uid:'dc', title:false})}</div>
          <div class="detail-info" style="flex:1">
            <span class="hero-eyebrow"><span class="cat-dot" style="background:${cat.color}"></span> ${cat.full}</span>
            <h1>${NP.esc(g.name)}</h1>
            <p class="muted" style="max-width:560px">${NP.esc(g.desc)}</p>
            <div class="detail-stats-row">
              <div class="dstat glass"><div class="k">Difficulty</div><div class="v">${NP.diffLabel(g.diff)}</div></div>
              <div class="dstat glass"><div class="k">Session</div><div class="v">${NP.fmtMins(g.mins)}</div></div>
              <div class="dstat glass"><div class="k">XP</div><div class="v" style="color:${cat.color}">+${g.xp}</div></div>
              <div class="dstat glass"><div class="k">Rating</div><div class="v">★ ${g.rating}</div></div>
              <div class="dstat glass"><div class="k">Players</div><div class="v">${NP.fmtNum(g.players)}</div></div>
            </div>
            <div class="hero-actions">
              <button class="btn btn-primary btn-lg" data-play="${g.id}"><i class="fa-solid fa-play"></i> ${g.playable ? 'PLAY NOW' : 'PREVIEW'}</button>
              <button class="btn btn-glass" data-fav-btn="${g.id}"><i class="fa-${saved?'solid':'regular'} fa-heart" style="${saved?'color:var(--cat-creativity)':''}"></i> ${saved?'Saved':'Save'}</button>
              <button class="btn btn-glass" id="dt-share"><i class="fa-solid fa-share-nodes"></i> Share</button>
              <button class="btn btn-ghost" id="dt-how"><i class="fa-solid fa-circle-question"></i> How to Play</button>
            </div>
          </div>
        </div>
      </section>

      <div class="detail-body">
        <div>
          <section class="panel mb-4" id="about-section">
            <h3 class="mb-3" style="font-size:18px"><i class="fa-solid fa-circle-info" style="color:${cat.color};font-size:14px;margin-right:8px"></i>About This Game</h3>
            <p class="muted" style="font-size:14px;line-height:1.7">${NP.esc(g.desc)}</p>
            <div class="mt-4">
              <div class="eyebrow mb-2">Skills Trained</div>
              <div class="skill-tags">${g.skills.map(sk => `<span class="skill-tag" style="border:1px solid ${cat.color}33;color:${cat.color}">${NP.esc(sk)}</span>`).join('')}</div>
            </div>
          </section>
          <section class="panel" id="howto-section">
            <h3 class="mb-3" style="font-size:18px"><i class="fa-solid fa-graduation-cap" style="color:${cat.color};font-size:14px;margin-right:8px"></i>How to Play</h3>
            <p class="muted" style="font-size:14px;line-height:1.7">${NP.esc(g.how)}</p>
          </section>
        </div>
        <aside>
          <section class="panel mb-4" id="performance-section">
            <h3 class="mb-4" style="font-size:18px"><i class="fa-solid fa-chart-line" style="color:${cat.color};font-size:14px;margin-right:8px"></i>Your Performance</h3>
            ${best ? `
            <div class="stat-tiles" style="grid-template-columns:1fr 1fr">
              <div class="tc"><div class="num" style="font-size:26px">${best.toLocaleString()}</div><div class="lbl">High Score</div></div>
              <div class="tc"><div class="num" style="font-size:26px">${plays}</div><div class="lbl">Sessions</div></div>
              <div class="tc"><div class="num" style="font-size:26px">${s.streak.best}</div><div class="lbl">Best Streak</div></div>
              <div class="tc"><div class="num" style="font-size:26px">#${rank}</div><div class="lbl">Global Rank</div></div>
            </div>` : `
            <div class="tc" style="padding:18px 0">
              <i class="fa-solid fa-seedling" style="font-size:30px;color:${cat.color};opacity:.7"></i>
              <p class="muted mt-3" style="font-size:13px">You haven't played this yet.<br>Your stats will appear here.</p>
            </div>`}
          </section>
          <section class="panel">
            <h3 class="mb-3" style="font-size:16px">Skill Impact</h3>
            <div class="flex aic gap-3">
              <span class="cat-dot" style="background:${cat.color};width:10px;height:10px"></span>
              <span style="flex:1;font-weight:600;font-size:13px">${cat.name}</span>
              <span class="dim" style="font-size:12px">Primary</span>
            </div>
            <div class="xp-bar mt-2 mb-3"><i style="width:85%;background:${cat.color}"></i></div>
          </section>
        </aside>
      </div>

      ${NP.rail('Similar Games', similar.map((x,i) => NP.gameCard(x,{uid:'sim'+i})).join(''), { icon:'fa-layer-group', iconColor:cat.color })}
    </div>`;
  };

  /* ================= DAILY MIX ================= */
  V.daily = function(){
    const s = NP.store.state;
    const mix = NP.store.ensureDailyMix();
    const done = mix.done.length;
    const todayXp = s.weekly[new Date().toISOString().slice(0,10)] || 0;
    const dateStr = new Date().toLocaleDateString('en-US',{ weekday:'long', month:'long', day:'numeric' });

    return `
    <div class="page">
      <section class="mix-hero">
        <div class="eyebrow mb-3" style="color:var(--cat-relax)">${dateStr}</div>
        <h1 style="font-size:clamp(30px,5vw,46px);letter-spacing:-.02em;margin-bottom:10px">Today's Brain Mix</h1>
        <p class="muted mb-5" style="max-width:440px;margin-left:auto;margin-right:auto">Five games, five cognitive dimensions — curated for you. Complete all five for a +50 XP reward.</p>
        <div class="flex jcc gap-5 aic wrap">
          ${NP.ring({ size:120, stroke:10, value:done, max:5, color:'#2DD4BF', label:'complete', display:`${done}/5` })}
          <div class="flex gap-5 wrap jcc">
            <div class="tc"><div style="font-family:var(--font-display);font-weight:800;font-size:26px;color:var(--cat-speed)"><i class="fa-solid fa-fire" style="font-size:18px"></i> ${s.streak.current}</div><div class="dim" style="font-size:10px;letter-spacing:.12em;font-weight:700">DAY STREAK</div></div>
            <div class="tc"><div style="font-family:var(--font-display);font-weight:800;font-size:26px">${todayXp}</div><div class="dim" style="font-size:10px;letter-spacing:.12em;font-weight:700">XP TODAY</div></div>
            <div class="tc"><div style="font-family:var(--font-display);font-weight:800;font-size:26px;color:${done===5?'#34D399':'var(--text-low)'}">${done===5?'✓':'+50'}</div><div class="dim" style="font-size:10px;letter-spacing:.12em;font-weight:700">${done===5?'CLAIMED':'BONUS XP'}</div></div>
          </div>
        </div>
      </section>
      <div class="mix-cards mb-6">
        ${mix.games.map((id, i) => {
          const g = NP.GAME_INDEX[id];
          const cat = NP.CATEGORIES[g.cat];
          const isDone = mix.done.includes(id);
          return `
          <article class="mix-card ${isDone?'done':''}" data-game="${id}" tabindex="0" role="button" aria-label="${NP.esc(g.name)} — ${cat.name}${isDone?', completed':''}">
            <span class="mix-num">${i+1}</span>
            <div class="mc-art">${NP.cover(g,{uid:'mx'+i})}</div>
          </article>`;
        }).join('')}
      </div>
      <div class="page-pad tc">
        ${done < 5
          ? `<button class="btn btn-primary btn-lg" id="mix-play-next"><i class="fa-solid fa-play"></i> Play Next in Mix</button>`
          : `<div class="panel glass" style="display:inline-block;padding:22px 40px"><i class="fa-solid fa-trophy" style="color:#FACC15;font-size:22px"></i><div style="font-family:var(--font-display);font-weight:800;font-size:18px;margin-top:8px">Mix Complete — Legendary!</div><div class="dim" style="font-size:13px;margin-top:4px">Come back tomorrow for a fresh mix.</div></div>`}
      </div>
      ${NP.rail('More For Today', NP.GAMES.filter(g => g.playable && !mix.games.includes(g.id)).slice(0,10).map((g,i) => NP.gameCard(g,{uid:'mf'+i})).join(''), { icon:'fa-dice', sub:'Keep the momentum going' })}
    </div>`;
  };

  /* ================= PROGRESS ================= */
  V.progress = function(){
    const s = NP.store.state;
    const bs = NP.store.brainScore();
    const catIds = Object.keys(NP.CATEGORIES);
    const li = NP.store.levelInfo();

    // streak calendar: last 28 days
    const days = [];
    for (let i = 27; i >= 0; i--){
      const d = new Date(Date.now() - i*864e5);
      const iso = d.toISOString().slice(0,10);
      days.push({ iso, dow: d.getDate(), played: s.streak.days.includes(iso), today: i === 0 });
    }
    // weekly xp (7 days)
    const week = [];
    for (let i = 6; i >= 0; i--){
      const d = new Date(Date.now() - i*864e5);
      week.push({ label: d.toLocaleDateString('en-US',{weekday:'short'})[0], xp: s.weekly[d.toISOString().slice(0,10)] || 0 });
    }
    const maxWeek = Math.max(50, ...week.map(w => w.xp));
    const records = Object.entries(s.best).sort((a,b) => b[1]-a[1]).slice(0,5);
    const insights = buildInsights(s);

    return `
    <div class="page page-pad">
      <div class="mb-5">
        <div class="eyebrow mb-2">Analytics</div>
        <h1 style="font-size:clamp(30px,4.6vw,44px);letter-spacing:-.02em">Your Progress</h1>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:var(--sp-4)" class="mb-4">
        <section class="panel tc" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px" aria-label="Brain score">
          ${NP.ring({ size:170, stroke:13, value:bs, max:1000, color:'#2E7CF6', label:'Brain Score' })}
          <div>
            <div class="level-badge"><i class="fa-solid fa-brain"></i> Level ${li.level} · ${li.title}</div>
            <div class="dim mt-2" style="font-size:12px">${li.intoLevel}/${li.needed} XP to next level</div>
          </div>
        </section>
        <section class="panel" aria-label="Skill radar">
          <h3 class="mb-2" style="font-size:16px">Cognitive Radar</h3>
          <div style="position:relative;height:260px"><canvas id="radar-chart" aria-label="Radar chart of skill scores"></canvas></div>
        </section>
        <section class="panel" aria-label="Weekly XP">
          <h3 class="mb-4" style="font-size:16px">This Week</h3>
          <div style="display:flex;align-items:flex-end;gap:10px;height:170px;padding:0 4px">
            ${week.map((w,i) => `
              <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end">
                <div class="dim" style="font-size:11px;font-weight:700">${w.xp||''}</div>
                <div style="width:100%;max-width:34px;height:${Math.max(4, w.xp/maxWeek*120)}px;border-radius:8px;background:${i===6?'linear-gradient(180deg,#3B8BFF,#7C3AED)':'rgba(255,255,255,.08)'};${i===6&&w.xp?'box-shadow:0 0 16px var(--accent-glow);':''}transition:height 1s var(--ease)"></div>
                <div class="dim" style="font-size:11px;font-weight:600">${w.label}</div>
              </div>`).join('')}
          </div>
          <div class="flex jcb mt-4" style="border-top:1px solid rgba(255,255,255,.06);padding-top:14px">
            <div><div style="font-family:var(--font-display);font-weight:800;font-size:19px">${week.reduce((a,b)=>a+b.xp,0)}</div><div class="dim" style="font-size:10px;letter-spacing:.1em;font-weight:700">XP THIS WEEK</div></div>
            <div class="tc"><div style="font-family:var(--font-display);font-weight:800;font-size:19px">${s.stats.gamesPlayed}</div><div class="dim" style="font-size:10px;letter-spacing:.1em;font-weight:700">GAMES</div></div>
            <div style="text-align:right"><div style="font-family:var(--font-display);font-weight:800;font-size:19px">${NP.fmtTime(s.stats.totalTimeSec)}</div><div class="dim" style="font-size:10px;letter-spacing:.1em;font-weight:700">PLAY TIME</div></div>
          </div>
        </section>
      </div>

      ${insights.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--sp-4)" class="mb-4">
        ${insights.map(ins => `
          <div class="insight-card" style="--ic:${ins.color}">
            <div class="insight-icon"><i class="fa-solid ${ins.icon}"></i></div>
            <div>
              <div style="font-family:var(--font-display);font-weight:700;font-size:14px;margin-bottom:4px">${ins.title}</div>
              <div class="muted" style="font-size:13px">${ins.body}</div>
              ${ins.action ? `<button class="btn btn-sm btn-glass mt-3" data-nav-to="${ins.action[1]}">${ins.action[0]}</button>` : ''}
            </div>
          </div>`).join('')}
      </div>` : ''}

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:var(--sp-4)" class="mb-4">
        <section class="panel" aria-label="Skill breakdown">
          <h3 class="mb-4" style="font-size:16px">Skill Breakdown</h3>
          ${catIds.map(c => {
            const cat = NP.CATEGORIES[c];
            const sc = NP.store.skillScore(c);
            return `<div class="mb-3">
              <div class="flex jcb aic mb-1">
                <span class="cat-chip" style="color:${cat.color};font-size:13px"><span class="cat-dot" style="background:${cat.color}"></span>${cat.name}</span>
                <span style="font-family:var(--font-display);font-weight:700;font-size:13px">${sc}</span>
              </div>
              <div class="xp-bar" style="height:7px"><i style="width:${sc/10}%;background:${cat.color};box-shadow:0 0 10px ${cat.color}66"></i></div>
            </div>`;
          }).join('')}
        </section>
        <div>
          <section class="panel mb-4" aria-label="Streak calendar">
            <div class="flex jcb aic mb-4">
              <h3 style="font-size:16px">Streak Calendar</h3>
              <span style="color:var(--cat-speed);font-family:var(--font-display);font-weight:800"><i class="fa-solid fa-fire"></i> ${s.streak.current} day${s.streak.current===1?'':'s'}</span>
            </div>
            <div class="streak-cal">${days.map(d => `<div class="streak-day ${d.played?'done':''} ${d.today?'today':''}" title="${d.iso}">${d.dow}</div>`).join('')}</div>
            <div class="dim mt-3" style="font-size:12px">Best streak: ${s.streak.best} days</div>
          </section>
          <section class="panel" aria-label="Personal records">
            <h3 class="mb-3" style="font-size:16px">Personal Records</h3>
            ${records.length ? records.map(([id, score]) => {
              const g = NP.GAME_INDEX[id];
              if (!g) return '';
              const cat = NP.CATEGORIES[g.cat];
              return `<div class="flex aic gap-3 mb-3" style="cursor:pointer" data-detail="${id}">
                <span class="cat-dot" style="background:${cat.color};width:9px;height:9px"></span>
                <span style="flex:1;font-size:13px;font-weight:600">${NP.esc(g.name)}</span>
                <span style="font-family:var(--font-display);font-weight:800;font-size:14px;color:${cat.color}">${score.toLocaleString()}</span>
              </div>`;
            }).join('') : `<p class="dim" style="font-size:13px">Play games to set your first records.</p>`}
          </section>
        </div>
      </div>
    </div>`;
  };

  function buildInsights(s){
    const out = [];
    const weak = NP.store.weakestCats(1)[0];
    const strong = NP.store.strongestCats(1)[0];
    if (s.stats.gamesPlayed === 0){
      out.push({ icon:'fa-rocket', color:'#2E7CF6', title:'Start your journey', body:'Play your first game to unlock personalized insights and your Brain Score.', action:['Play Now','/daily'] });
      return out;
    }
    if (strong && strong.s > 0){
      out.push({ icon:'fa-arrow-trend-up', color: NP.CATEGORIES[strong.cat].color, title:`You're strongest in ${NP.CATEGORIES[strong.cat].name}`, body:`Your ${NP.CATEGORIES[strong.cat].full} score of ${strong.s} leads all your skills. Try a harder challenge to push further.`, action:['Harder Games','/discover?f=hard&cat='+strong.cat] });
    }
    if (weak){
      out.push({ icon:'fa-seedling', color: NP.CATEGORIES[weak.cat].color, title:`Growth area: ${NP.CATEGORIES[weak.cat].name}`, body:`Your ${NP.CATEGORIES[weak.cat].full} skills have the most room to grow. Short daily sessions compound fast.`, action:['Train '+NP.CATEGORIES[weak.cat].name,'/discover?cat='+weak.cat] });
    }
    if (s.streak.current >= 2){
      out.push({ icon:'fa-fire', color:'#F43F5E', title:`${s.streak.current}-day streak active`, body:'Consistency is the strongest predictor of cognitive improvement. One game keeps it alive.', action:['Daily Mix','/daily'] });
    } else {
      out.push({ icon:'fa-spa', color:'#2DD4BF', title:'Need to unwind?', body:'Here are calm games without timers — perfect for a mindful session.', action:['Relax & Flow','/discover?cat=relax'] });
    }
    return out.slice(0,3);
  }

  V.renderProgressCharts = function(){
    const ctx = document.getElementById('radar-chart');
    if (!ctx || typeof Chart === 'undefined') return;
    const catIds = Object.keys(NP.CATEGORIES);
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: catIds.map(c => NP.CATEGORIES[c].name),
        datasets: [{
          data: catIds.map(c => Math.max(30, NP.store.skillScore(c))),
          backgroundColor: 'rgba(46,124,246,.18)',
          borderColor: '#2E7CF6',
          borderWidth: 2,
          pointBackgroundColor: catIds.map(c => NP.CATEGORIES[c].color),
          pointRadius: 3.5,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { r: {
          min: 0, max: 1000,
          angleLines: { color: 'rgba(255,255,255,.06)' },
          grid: { color: 'rgba(255,255,255,.07)' },
          pointLabels: { color: '#A8B2C2', font: { family: 'Outfit', size: 10, weight: '600' } },
          ticks: { display: false },
        }},
        animation: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 1200 },
      }
    });
  };

  /* ================= PROFILE ================= */
  V.profile = function(){
    const s = NP.store.state;
    const li = NP.store.levelInfo();
    const strong = NP.store.strongestCats(1)[0];
    const weak = NP.store.weakestCats(1)[0];
    const saved = s.saved.map(id => NP.GAME_INDEX[id]).filter(Boolean);
    const favs = Object.entries(s.playCount).sort((a,b) => b[1]-a[1]).slice(0,6).map(([id]) => NP.GAME_INDEX[id]).filter(Boolean);
    const unlocked = NP.ACHIEVEMENTS.filter(a => s.unlocked.includes(a.id));
    const locked = NP.ACHIEVEMENTS.filter(a => !s.unlocked.includes(a.id));

    return `
    <div class="page page-pad">
      <section class="panel mb-5" style="background:radial-gradient(90% 140% at 10% 0%, rgba(124,58,237,.2), transparent 55%), linear-gradient(160deg, var(--surface-1), var(--bg-2));padding:var(--sp-6)">
        <div class="profile-head">
          <div class="profile-avatar">${NP.esc((s.profile.name||'P')[0].toUpperCase())}</div>
          <div style="flex:1;min-width:240px">
            <div class="flex aic gap-3 wrap mb-2">
              <h1 style="font-size:clamp(24px,4vw,34px);letter-spacing:-.01em">${NP.esc(s.profile.name || 'Player')}</h1>
              <span class="level-badge">LVL ${li.level} · ${li.title}</span>
            </div>
            <div class="flex jcb aic mb-1" style="max-width:420px">
              <span class="dim" style="font-size:12px">Level ${li.level}</span>
              <span class="dim" style="font-size:12px">${li.intoLevel}/${li.needed} XP</span>
            </div>
            <div class="xp-bar" style="max-width:420px"><i style="width:${Math.round(li.progress*100)}%"></i></div>
            <div class="flex gap-3 mt-4 wrap">
              ${strong && strong.s > 0 ? `<span class="skill-tag" style="color:${NP.CATEGORIES[strong.cat].color};border:1px solid ${NP.CATEGORIES[strong.cat].color}44"><i class="fa-solid fa-medal" style="margin-right:6px"></i>Strongest: ${NP.CATEGORIES[strong.cat].name}</span>` : ''}
              ${weak && s.stats.gamesPlayed > 2 ? `<span class="skill-tag"><i class="fa-solid fa-seedling" style="margin-right:6px;color:#34D399"></i>Improving: ${NP.CATEGORIES[weak.cat].name}</span>` : ''}
            </div>
          </div>
          <button class="btn btn-glass btn-sm" id="pf-edit"><i class="fa-solid fa-pen"></i> Edit</button>
        </div>
      </section>

      <div class="stat-tiles mb-6">
        <div class="panel stat-tile"><div class="num">${s.xp.toLocaleString()}</div><div class="lbl">Total XP</div></div>
        <div class="panel stat-tile"><div class="num" style="-webkit-text-fill-color:initial;background:none;color:var(--cat-speed)"><i class="fa-solid fa-fire" style="font-size:20px"></i> ${s.streak.current}</div><div class="lbl">Current Streak</div></div>
        <div class="panel stat-tile"><div class="num">${s.stats.gamesPlayed}</div><div class="lbl">Games Played</div></div>
        <div class="panel stat-tile"><div class="num">${NP.fmtTime(s.stats.totalTimeSec)}</div><div class="lbl">Play Time</div></div>
        <div class="panel stat-tile"><div class="num">${unlocked.length}/${NP.ACHIEVEMENTS.length}</div><div class="lbl">Achievements</div></div>
      </div>

      <section class="mb-6" aria-label="Achievements">
        <h2 class="rail-title mb-4"><i class="fa-solid fa-trophy rail-icon" style="color:#FACC15"></i>Achievements</h2>
        <div class="ach-grid">
          ${unlocked.map(a => `
            <div class="panel ach-card unlocked" style="--ac:${a.color}">
              <div class="ach-icon"><i class="fa-solid ${a.icon}"></i></div>
              <div class="ach-name">${a.name}</div>
              <div class="ach-desc">${a.desc}</div>
            </div>`).join('')}
          ${locked.map(a => `
            <div class="panel ach-card locked">
              <div class="ach-icon"><i class="fa-solid fa-lock"></i></div>
              <div class="ach-name">${a.name}</div>
              <div class="ach-desc">${a.desc}</div>
            </div>`).join('')}
        </div>
      </section>

      ${favs.length ? NP.rail('Your Favorite Games', favs.map((g,i) => NP.gameCard(g,{uid:'fv'+i})).join(''), { icon:'fa-heart', iconColor:'#EC4899', sub:'Most played by you' }) : ''}
      ${saved.length ? NP.rail('Saved For Later', saved.map((g,i) => NP.gameCard(g,{uid:'sv'+i})).join(''), { icon:'fa-bookmark' }) : ''}

      <div class="tc mt-6">
        <button class="btn btn-ghost btn-sm" id="pf-reset" style="color:var(--text-low)"><i class="fa-solid fa-rotate-left"></i> Reset all progress</button>
      </div>
    </div>`;
  };

  /* ================= SEARCH ================= */
  V.search = function(params){
    const s = NP.store.state;
    const trendingTerms = ['2048','memory','sudoku','reaction','word games','relaxing','logic puzzles','speed'];
    return `
    <div class="page page-pad">
      <div class="mb-5" style="max-width:680px;margin-left:auto;margin-right:auto">
        <h1 class="tc mb-5" style="font-size:clamp(26px,4.4vw,38px);letter-spacing:-.02em">Search</h1>
        <div class="search-bar" style="max-width:none" role="search">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input id="global-search" type="search" placeholder="Games, categories, skills, achievements…" autofocus aria-label="Search everything">
        </div>
        <div id="search-results" class="mt-5"></div>
        <div id="search-idle">
          ${s.searches.length ? `
          <div class="mt-5">
            <div class="eyebrow mb-3">Recent Searches</div>
            <div class="flex gap-2 wrap">${s.searches.map(q => `<button class="chip" data-search-term="${NP.esc(q)}"><i class="fa-solid fa-clock-rotate-left" style="font-size:11px"></i> ${NP.esc(q)}</button>`).join('')}</div>
          </div>` : ''}
          <div class="mt-5">
            <div class="eyebrow mb-3">Trending Searches</div>
            <div class="flex gap-2 wrap">${trendingTerms.map(q => `<button class="chip" data-search-term="${q}"><i class="fa-solid fa-arrow-trend-up" style="font-size:11px;color:var(--cat-speed)"></i> ${q}</button>`).join('')}</div>
          </div>
          <div class="mt-6">
            <div class="eyebrow mb-3">Browse Categories</div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px">
              ${Object.values(NP.CATEGORIES).map(c => `
                <button class="panel tc" data-nav-to="/discover?cat=${c.id}" style="padding:20px 10px;cursor:pointer;transition:transform .25s var(--ease)" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform=''">
                  <i class="fa-solid ${c.icon}" style="font-size:22px;color:${c.color};filter:drop-shadow(0 0 10px ${c.color}66)"></i>
                  <div style="font-family:var(--font-display);font-weight:700;font-size:13px;margin-top:10px">${c.name}</div>
                </button>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  };

  NP.runSearch = function(q){
    const results = $('#search-results'), idle = $('#search-idle');
    if (!results) return;
    q = q.trim().toLowerCase();
    if (!q){ results.innerHTML = ''; if (idle) idle.style.display = ''; return; }
    if (idle) idle.style.display = 'none';
    const games = NP.GAMES.filter(g => (g.name+' '+g.sub+' '+NP.CATEGORIES[g.cat].full+' '+g.skills.join(' ')).toLowerCase().includes(q)).slice(0, 12);
    const cats = Object.values(NP.CATEGORIES).filter(c => (c.name+' '+c.full).toLowerCase().includes(q));
    const achs = NP.ACHIEVEMENTS.filter(a => (a.name+' '+a.desc).toLowerCase().includes(q)).slice(0,4);
    results.innerHTML = `
      ${cats.length ? `<div class="eyebrow mb-3">Categories</div><div class="flex gap-2 wrap mb-5">${cats.map(c => `<button class="chip" data-nav-to="/discover?cat=${c.id}" style="--chip-fg:${c.color};--chip-bg:${c.color}20"><span class="cat-dot" style="background:${c.color}"></span>${c.full}</button>`).join('')}</div>` : ''}
      ${games.length ? `<div class="eyebrow mb-3">Games (${games.length})</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px" class="mb-5">${games.map((g,i) => NP.gameCard(g,{mini:true,uid:'se'+i})).join('')}</div>` : ''}
      ${achs.length ? `<div class="eyebrow mb-3">Achievements</div>${achs.map(a => `<div class="flex aic gap-3 panel mb-2" style="padding:12px 16px"><i class="fa-solid ${a.icon}" style="color:${a.color};width:22px;text-align:center"></i><div><div style="font-weight:700;font-size:13px;font-family:var(--font-display)">${a.name}</div><div class="dim" style="font-size:12px">${a.desc}</div></div></div>`).join('')}` : ''}
      ${!games.length && !cats.length && !achs.length ? `<div class="tc" style="padding:40px 0"><i class="fa-solid fa-ghost" style="font-size:34px;color:var(--text-low)"></i><p class="muted mt-3">Nothing found for “${NP.esc(q)}”</p></div>` : ''}
    `;
  };

  /* ================= ONBOARDING ================= */
  NP.showOnboarding = function(){
    let step = 0;
    const data = { name:'', goal:'', session:'', style:'' };
    const root = document.createElement('div');
    root.className = 'onboard';
    root.id = 'onboard';
    document.body.appendChild(root);
    document.body.style.overflow = 'hidden';

    const steps = [
      // 0: welcome
      () => `
        <div class="onboard-card">
          <div class="onboard-logo"><i class="fa-solid fa-brain"></i></div>
          <div class="eyebrow mb-3" style="color:var(--accent)">Welcome to Neuroplay</div>
          <h1>Let's discover how<br>your mind plays.</h1>
          <p class="onboard-sub">${NP.GAMES.length} cognitive games. 10 skill dimensions. One personalized journey — built around the way you think.</p>
          <input id="ob-name" placeholder="What should we call you?" maxlength="20" autocomplete="off" aria-label="Your name"
            style="width:min(100%,340px);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:100px;padding:15px 24px;color:#fff;font-size:15px;text-align:center;outline:none;margin-bottom:24px">
          <div><button class="btn btn-primary btn-lg" id="ob-next">Begin <i class="fa-solid fa-arrow-right"></i></button></div>
        </div>`,
      // 1: goal
      () => optStep('What do you want to improve?', 'Pick your main focus — we\u2019ll shape your daily mix around it.', [
        ['memory','fa-brain','Memory','#A855F7'], ['focus','fa-bullseye','Focus','#22D3EE'],
        ['creativity','fa-wand-magic-sparkles','Creativity','#EC4899'], ['logic','fa-chess-knight','Logic','#3B82F6'],
        ['relax','fa-spa','Relaxation','#2DD4BF'], ['everything','fa-infinity','Everything','#2E7CF6'],
      ], 'goal'),
      // 2: session
      () => optStep('How long are your sessions?', 'Be honest — short daily sessions beat long rare ones.', [
        ['2','fa-bolt','2–3 minutes','#FACC15'], ['5','fa-stopwatch','5 minutes','#22D3EE'],
        ['10','fa-clock','10 minutes','#3B82F6'], ['20','fa-hourglass-half','20+ minutes','#A855F7'],
      ], 'session'),
      // 3: style
      () => optStep('Choose your experience', 'This tunes difficulty curves and pacing.', [
        ['relaxed','fa-spa','Relaxed','No pressure, pure flow','#2DD4BF'],
        ['balanced','fa-scale-balanced','Balanced','Smart adaptive challenge','#2E7CF6'],
        ['competitive','fa-fire','Competitive','Leaderboards & pressure','#F43F5E'],
      ], 'style'),
      // 4: profile
      () => {
        const goalCat = data.goal === 'everything' ? null : data.goal;
        const cats = Object.values(NP.CATEGORIES);
        return `
        <div class="onboard-card">
          <div class="eyebrow mb-3" style="color:var(--accent)">Your Brain Profile</div>
          <h1 style="font-size:clamp(24px,4vw,36px)">Ready, ${NP.esc(data.name || 'Player')}.</h1>
          <p class="onboard-sub">Your personalized cognitive journey starts now. Here's your starting profile:</p>
          <div class="opt-grid" style="grid-template-columns:repeat(auto-fit,minmax(105px,1fr));gap:10px">
            ${cats.slice(0,10).map((c,i) => `
              <div class="opt-card ${goalCat === c.id ? 'sel' : ''}" style="padding:16px 6px;animation:modalIn .5s var(--ease) ${i*0.06}s backwards;cursor:default">
                <div class="oi" style="font-size:20px;margin-bottom:6px"><i class="fa-solid ${c.icon}" style="color:${c.color}"></i></div>
                <div class="on" style="font-size:11px">${c.name}</div>
                <div class="od" style="font-size:10px">${goalCat === c.id ? 'PRIORITY' : 'Lv 1'}</div>
              </div>`).join('')}
          </div>
          <button class="btn btn-primary btn-lg" id="ob-finish"><i class="fa-solid fa-play"></i> Enter Neuroplay</button>
        </div>`;
      },
    ];

    function optStep(title, sub, opts, key){
      return `
      <div class="onboard-card">
        <h1 style="font-size:clamp(24px,4vw,34px)">${title}</h1>
        <p class="onboard-sub">${sub}</p>
        <div class="opt-grid">
          ${opts.map(o => {
            const [id, icon, name, d1, d2] = o;
            const desc = o.length === 5 ? d1 : '';
            const color = o.length === 5 ? d2 : d1;
            return `<button class="opt-card ${data[key]===id?'sel':''}" data-opt="${id}">
              <div class="oi"><i class="fa-solid ${icon}" style="color:${color}"></i></div>
              <div class="on">${name}</div>
              ${desc?`<div class="od">${desc}</div>`:''}
            </button>`;
          }).join('')}
        </div>
        <div class="flex gap-3 jcc">
          <button class="btn btn-ghost" id="ob-back"><i class="fa-solid fa-arrow-left"></i> Back</button>
          <button class="btn btn-primary" id="ob-next" ${data[key]?'':'disabled style="opacity:.4;pointer-events:none"'}>Continue <i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>`;
    }

    function render(){
      root.innerHTML = steps[step]() + `<div class="onboard-dots" style="position:absolute;bottom:max(28px,env(safe-area-inset-bottom))">${steps.map((_,i) => `<i class="${i===step?'on':''}"></i>`).join('')}</div>`;
      const next = $('#ob-next');
      if (next) next.onclick = () => {
        if (step === 0){ data.name = ($('#ob-name').value || 'Player').trim() || 'Player'; }
        step++;
        render();
      };
      const back = $('#ob-back');
      if (back) back.onclick = () => { step--; render(); };
      root.querySelectorAll('[data-opt]').forEach(b => b.onclick = () => {
        const key = ['','goal','session','style'][step];
        data[key] = b.dataset.opt;
        render();
      });
      const fin = $('#ob-finish');
      if (fin) fin.onclick = () => {
        NP.store.completeOnboarding(data);
        root.remove();
        document.body.style.overflow = '';
        NP.go('/');
        NP.toast(`Welcome, ${data.name}! Your daily mix is ready.`, 'fa-wand-magic-sparkles');
      };
      const nameIn = $('#ob-name');
      if (nameIn) nameIn.onkeydown = e => { if (e.key === 'Enter') $('#ob-next').click(); };
    }
    render();
  };

  V.notFound = () => `
    <div class="page page-pad tc" style="padding-top:120px">
      <i class="fa-solid fa-ghost" style="font-size:52px;color:var(--text-low)"></i>
      <h1 class="mt-4 mb-3" style="font-size:28px">Lost in thought?</h1>
      <p class="muted mb-5">This page doesn't exist.</p>
      <button class="btn btn-primary" data-nav-to="/">Return Home</button>
    </div>`;
})();
