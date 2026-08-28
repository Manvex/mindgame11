/* ============================================================
   NEUROPLAY — App shell: router, nav, global events
   ============================================================ */
(function(){
  const $ = NP.$;
  const app = document.getElementById('app');

  const NAV = [
    { path:'/',         name:'Home',     icon:'fa-house' },
    { path:'/discover', name:'Discover', icon:'fa-compass' },
    { path:'/daily',    name:'Play',     icon:'fa-flask', navName:'Daily Challenge' },
    { path:'/progress', name:'Progress', icon:'fa-chart-simple' },
    { path:'/profile',  name:'Profile',  icon:'fa-user' },
  ];

  function currentPath(){
    const h = location.hash.slice(1) || '/';
    return h;
  }

  NP.go = function(path){
    if (currentPath() === path){ render(); return; }
    location.hash = path;
  };

  function navHtml(active){
    return `
    <header class="topnav" id="topnav">
      <a class="brand" href="#/" aria-label="Neuroplay home">
        <span class="brand-mark"><i class="fa-solid fa-brain"></i></span>
        <span>NEUROPLAY</span>
      </a>
      <nav class="nav-links" aria-label="Primary">
        ${NAV.map(n => `<a class="nav-link ${active === n.path ? 'active' : ''}" href="#${n.path}">${n.navName || n.name}</a>`).join('')}
      </nav>
      <div class="nav-actions">
        <button class="icon-btn" data-nav-to="/search" aria-label="Search"><i class="fa-solid fa-magnifying-glass"></i></button>
        <button class="icon-btn" id="notif-btn" aria-label="Notifications"><i class="fa-regular fa-bell"></i><span class="dot" id="notif-dot"></span></button>
        <button class="nav-avatar" data-nav-to="/profile" aria-label="Your profile" id="nav-avatar-btn">P</button>
      </div>
    </header>
    <nav class="bottomnav" aria-label="Primary mobile">
      <div class="bottomnav-inner">
        ${NAV.map(n => `
          <a class="bnav-item ${active === n.path ? 'active' : ''}" href="#${n.path}" aria-label="${n.name}">
            <i class="fa-solid ${n.icon}"></i>
            <span>${n.name}</span>
          </a>`).join('')}
      </div>
    </nav>`;
  }

  NP.refreshNav = function(){
    const btn = $('#nav-avatar-btn');
    if (btn) btn.textContent = (NP.store.state.profile.name || 'P')[0].toUpperCase();
    const dot = $('#notif-dot');
    if (dot){
      const mix = NP.store.ensureDailyMix();
      dot.style.display = mix.done.length < 5 ? '' : 'none';
    }
  };

  function render(){
    const raw = currentPath();
    const [pathPart, queryPart] = raw.split('?');
    const params = new URLSearchParams(queryPart || '');
    let view, active = pathPart;

    if (pathPart === '/' || pathPart === '') view = NP.VIEWS.home();
    else if (pathPart === '/discover') view = NP.VIEWS.discover(params);
    else if (pathPart === '/daily') view = NP.VIEWS.daily();
    else if (pathPart === '/progress') view = NP.VIEWS.progress();
    else if (pathPart === '/profile') view = NP.VIEWS.profile();
    else if (pathPart === '/search') view = NP.VIEWS.search(params);
    else if (pathPart.startsWith('/game/')) { view = NP.VIEWS.detail(params, pathPart.slice(6)); active = '/discover'; }
    else view = NP.VIEWS.notFound();

    app.innerHTML = navHtml(active) + view;
    window.scrollTo(0, 0);
    NP.refreshNav();
    onScroll();

    if (pathPart === '/progress') requestAnimationFrame(() => NP.VIEWS.renderProgressCharts());

    // wire searches
    const ds = $('#disc-search');
    if (ds){
      let t;
      ds.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => {
          const p = new URLSearchParams(queryPart || '');
          if (ds.value) p.set('q', ds.value); else p.delete('q');
          history.replaceState(null, '', '#/discover' + (p.toString() ? '?' + p.toString() : ''));
          // re-render only grid area to keep focus: simplest robust approach = full render preserving value
          const val = ds.value, pos = ds.selectionStart;
          renderKeepingSearch(val, pos);
        }, 250);
      });
    }
    const gs = $('#global-search');
    if (gs){
      let t;
      gs.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => NP.runSearch(gs.value), 200);
      });
      gs.addEventListener('keydown', e => {
        if (e.key === 'Enter' && gs.value.trim()){ NP.store.addSearch(gs.value); NP.runSearch(gs.value); }
      });
      setTimeout(() => gs.focus(), 100);
    }

    // profile page buttons
    const pfReset = $('#pf-reset');
    if (pfReset) pfReset.onclick = () => {
      NP.modal(`<div class="tc">
        <h2 style="font-size:22px" class="mb-3">Reset everything?</h2>
        <p class="muted mb-5">All XP, streaks, achievements and records will be permanently erased.</p>
        <div class="flex gap-3 jcc">
          <button class="btn btn-glass" onclick="NP.closeModal()">Cancel</button>
          <button class="btn" style="background:var(--cat-speed);color:#fff" id="rs-confirm">Reset</button>
        </div></div>`);
      $('#rs-confirm').onclick = () => { NP.store.reset(); NP.closeModal(); location.reload(); };
    };
    const pfEdit = $('#pf-edit');
    if (pfEdit) pfEdit.onclick = () => {
      NP.modal(`<div class="tc">
        <h2 style="font-size:22px" class="mb-4">Edit Profile</h2>
        <input id="pf-name" value="${NP.esc(NP.store.state.profile.name||'')}" maxlength="20" aria-label="Name"
          style="width:100%;background:var(--surface-1);border:1px solid rgba(255,255,255,.14);border-radius:100px;padding:14px 22px;color:#fff;font-size:15px;text-align:center;outline:none;margin-bottom:20px">
        <div class="flex gap-3 jcc">
          <button class="btn btn-glass" onclick="NP.closeModal()">Cancel</button>
          <button class="btn btn-primary" id="pf-save">Save</button>
        </div></div>`);
      $('#pf-save').onclick = () => {
        NP.store.state.profile.name = ($('#pf-name').value || 'Player').trim() || 'Player';
        NP.store.save(); NP.closeModal(); render();
      };
    };
    const mixNext = $('#mix-play-next');
    if (mixNext) mixNext.onclick = () => {
      const mix = NP.store.ensureDailyMix();
      const next = mix.games.find(id => !mix.done.includes(id));
      if (next) NP.playGame(next);
    };
    const notif = $('#notif-btn');
    if (notif) notif.onclick = () => {
      const mix = NP.store.ensureDailyMix();
      const left = 5 - mix.done.length;
      const s = NP.store.state;
      NP.modal(`<div>
        <h2 style="font-size:20px" class="mb-4"><i class="fa-regular fa-bell" style="color:var(--accent);margin-right:8px"></i>Notifications</h2>
        ${left > 0 ? `<div class="insight-card mb-3" style="--ic:#2DD4BF"><div class="insight-icon"><i class="fa-solid fa-flask"></i></div><div><div style="font-family:var(--font-display);font-weight:700;font-size:14px">Daily Mix awaits</div><div class="muted" style="font-size:13px">${left} game${left===1?'':'s'} left in today's mix. +50 XP bonus for completion.</div><button class="btn btn-sm btn-glass mt-3" data-nav-to="/daily" onclick="NP.closeModal()">Open Mix</button></div></div>` : ''}
        ${s.streak.current > 0 ? `<div class="insight-card mb-3" style="--ic:#F43F5E"><div class="insight-icon"><i class="fa-solid fa-fire"></i></div><div><div style="font-family:var(--font-display);font-weight:700;font-size:14px">${s.streak.current}-day streak</div><div class="muted" style="font-size:13px">Keep it alive — one game a day.</div></div></div>` : `<div class="insight-card mb-3" style="--ic:#2E7CF6"><div class="insight-icon"><i class="fa-solid fa-rocket"></i></div><div><div style="font-family:var(--font-display);font-weight:700;font-size:14px">Start a streak today</div><div class="muted" style="font-size:13px">Consistency compounds. Play one game to begin.</div></div></div>`}
        <div class="tc mt-4"><button class="btn btn-ghost btn-sm" onclick="NP.closeModal()">Close</button></div>
      </div>`);
    };
  }

  function renderKeepingSearch(val, pos){
    render();
    const ds = $('#disc-search');
    if (ds){ ds.value = val; ds.focus(); try { ds.setSelectionRange(pos, pos); } catch(e){} }
  }

  /* ---------- scroll (topnav blur) ---------- */
  function onScroll(){
    const tn = $('#topnav');
    if (tn) tn.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- global click delegation ---------- */
  document.addEventListener('click', e => {
    const fav = e.target.closest('[data-fav], [data-fav-btn]');
    if (fav){
      e.stopPropagation(); e.preventDefault();
      const id = fav.dataset.fav || fav.dataset.favBtn;
      const on = NP.store.toggleSave(id);
      NP.toast(on ? 'Saved to your library' : 'Removed from library', on ? 'fa-heart' : 'fa-heart-crack');
      if (fav.dataset.fav != null){
        fav.classList.toggle('on', on);
        fav.innerHTML = `<i class="fa-${on?'solid':'regular'} fa-heart"></i>`;
      } else {
        fav.innerHTML = `<i class="fa-${on?'solid':'regular'} fa-heart" style="${on?'color:var(--cat-creativity)':''}"></i> ${on?'Saved':'Save'}`;
      }
      const newAch = NP.store.checkAchievements();
      newAch.forEach((a,i) => setTimeout(() => NP.achievementPop(a), i*300));
      return;
    }
    const play = e.target.closest('[data-play]');
    if (play){ e.stopPropagation(); e.preventDefault(); NP.playGame(play.dataset.play); return; }

    const det = e.target.closest('[data-detail]');
    if (det){ e.stopPropagation(); e.preventDefault(); NP.go('/game/' + det.dataset.detail); return; }

    const navTo = e.target.closest('[data-nav-to]');
    if (navTo){ e.preventDefault(); NP.go(navTo.dataset.navTo); return; }

    const term = e.target.closest('[data-search-term]');
    if (term){
      const gs = $('#global-search');
      if (gs){ gs.value = term.dataset.searchTerm; NP.store.addSearch(gs.value); NP.runSearch(gs.value); }
      return;
    }

    const chipCat = e.target.closest('[data-chip-cat]');
    if (chipCat){
      const p = new URLSearchParams((currentPath().split('?')[1]) || '');
      if (chipCat.dataset.chipCat === 'all') p.delete('cat'); else p.set('cat', chipCat.dataset.chipCat);
      NP.go('/discover' + (p.toString() ? '?' + p.toString() : ''));
      return;
    }
    const chipF = e.target.closest('[data-chip-f]');
    if (chipF){
      const p = new URLSearchParams((currentPath().split('?')[1]) || '');
      if (!chipF.dataset.chipF) p.delete('f'); else p.set('f', chipF.dataset.chipF);
      NP.go('/discover' + (p.toString() ? '?' + p.toString() : ''));
      return;
    }

    // card click → detail; mix card → play
    const mix = e.target.closest('.mix-card[data-game]');
    if (mix){ NP.playGame(mix.dataset.game); return; }
    const card = e.target.closest('.gcard[data-game]');
    if (card){ NP.go('/game/' + card.dataset.game); return; }

    const how = e.target.closest('#dt-how');
    if (how){
      const id = currentPath().split('?')[0].slice(6);
      const g = NP.GAME_INDEX[id];
      if (g) NP.modal(`<div><h2 style="font-size:22px" class="mb-3">How to Play</h2><p class="muted" style="line-height:1.7">${NP.esc(g.how)}</p><div class="tc mt-5"><button class="btn btn-primary" data-play="${g.id}" onclick="NP.closeModal()"><i class="fa-solid fa-play"></i> Play Now</button></div></div>`);
      return;
    }
    const share = e.target.closest('#dt-share');
    if (share){
      const id = currentPath().split('?')[0].slice(6);
      const g = NP.GAME_INDEX[id];
      const url = location.origin + '/#/game/' + id;
      if (navigator.share){ navigator.share({ title: `${g.name} — Neuroplay`, url }).catch(()=>{}); }
      else { navigator.clipboard && navigator.clipboard.writeText(url); NP.toast('Link copied to clipboard', 'fa-link'); }
      return;
    }
  });

  /* keyboard: Enter/Space activates cards */
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.gcard[data-game], .mix-card[data-game]')){
      e.preventDefault();
      if (e.target.classList.contains('mix-card')) NP.playGame(e.target.dataset.game);
      else NP.go('/game/' + e.target.dataset.game);
    }
  });

  window.addEventListener('hashchange', render);

  /* ---------- boot ---------- */
  render();
})();
