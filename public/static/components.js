/* ============================================================
   NEUROPLAY — Reusable UI components
   ============================================================ */
(function(){
  const $ = sel => document.querySelector(sel);
  NP.$ = $;
  NP.esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');

  NP.fmtMins = m => m < 1 ? '<1 min' : `${m} min`;
  NP.fmtTime = sec => {
    sec = Math.round(sec);
    const m = Math.floor(sec/60), s = sec % 60;
    return m ? `${m}:${String(s).padStart(2,'0')}` : `${s}s`;
  };
  NP.fmtNum = n => n >= 1000 ? (n/1000).toFixed(1).replace('.0','') + 'K' : String(n);

  NP.diffPips = d => `<span class="diff-pips" aria-label="Difficulty ${d} of 5">${[1,2,3,4,5].map(i=>`<i class="${i<=d?'on':''}"></i>`).join('')}</span>`;
  NP.diffLabel = d => ['','Casual','Easy','Medium','Hard','Expert'][d];

  NP.catChip = cat => {
    const c = NP.CATEGORIES[cat];
    return `<span class="cat-chip" style="color:${c.color}"><span class="cat-dot" style="background:${c.color}"></span>${c.name}</span>`;
  };

  /* ---------- Game card ---------- */
  NP.gameCard = function(game, opts){
    opts = opts || {};
    const cat = NP.CATEGORIES[game.cat];
    const saved = NP.store.state.saved.includes(game.id);
    const wide = opts.wide;
    const cls = ['gcard', wide ? 'wide' : '', opts.mini ? 'mini' : ''].join(' ');
    const art = wide ? NP.banner(game, {uid: opts.uid || ''}) : NP.cover(game, {uid: opts.uid || ''});
    const progress = opts.progress != null ? `<div class="gcard-progressbar" aria-hidden="true"><i style="width:${opts.progress}%"></i></div>` : '';
    const badge = opts.badge ? `<span class="gcard-badge" style="color:${opts.badgeColor||'#fff'}">${opts.badge}</span>` : '';
    return `
    <article class="${cls}" style="--glow:${cat.color}55" data-game="${game.id}" tabindex="0" role="button" aria-label="${NP.esc(game.name)} — ${cat.name}, ${NP.diffLabel(game.diff)}, ${game.mins} minutes">
      <div class="gcard-art">
        ${art}
        ${badge}
        <button class="gcard-fav ${saved?'on':''}" data-fav="${game.id}" aria-label="${saved?'Remove from':'Add to'} saved games" title="Save"><i class="fa-${saved?'solid':'regular'} fa-heart"></i></button>
        <div class="gcard-overlay">
          <button class="qa qa-play" data-play="${game.id}"><i class="fa-solid fa-play"></i> Play</button>
          <button class="qa qa-info" data-detail="${game.id}"><i class="fa-solid fa-circle-info"></i></button>
        </div>
        ${progress}
      </div>
      <div class="gcard-meta">
        <div class="gcard-title">${NP.esc(game.name)}</div>
        <div class="gcard-sub">${NP.catChip(game.cat)} ${NP.diffPips(game.diff)} <span><i class="fa-regular fa-clock" style="font-size:10px"></i> ${NP.fmtMins(game.mins)}</span></div>
      </div>
    </article>`;
  };

  /* ---------- Rail ---------- */
  let railUid = 0;
  NP.rail = function(title, cardsHtml, opts){
    opts = opts || {};
    if (!cardsHtml.trim()) return '';
    const id = 'rail-' + (++railUid);
    return `
    <section class="rail-section" aria-label="${NP.esc(title)}">
      <div class="rail-head">
        <div>
          <h2 class="rail-title">${opts.icon?`<i class="fa-solid ${opts.icon} rail-icon" style="color:${opts.iconColor||'var(--accent)'}"></i>`:''}${NP.esc(title)}</h2>
          ${opts.sub?`<div class="rail-sub">${NP.esc(opts.sub)}</div>`:''}
        </div>
        ${opts.more?`<a class="rail-more" href="${opts.more}" data-nav>See all <i class="fa-solid fa-chevron-right" style="font-size:10px"></i></a>`:''}
      </div>
      <div class="rail-wrap">
        <button class="rail-arrow prev" data-rail-prev="${id}" aria-label="Scroll left"><i class="fa-solid fa-chevron-left"></i></button>
        <div class="rail" id="${id}">${cardsHtml}</div>
        <button class="rail-arrow next" data-rail-next="${id}" aria-label="Scroll right"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
    </section>`;
  };

  /* ---------- Progress ring ---------- */
  NP.ring = function({ size=120, stroke=9, value=0, max=1000, color='#2E7CF6', label='', display=null }){
    const rr = (size - stroke) / 2;
    const circ = 2 * Math.PI * rr;
    const pct = Math.min(1, value / max);
    return `
    <div class="ring-wrap" style="width:${size}px;height:${size}px" role="img" aria-label="${NP.esc(label)}: ${value} of ${max}">
      <svg width="${size}" height="${size}">
        <circle class="ring-track" cx="${size/2}" cy="${size/2}" r="${rr}" stroke-width="${stroke}"/>
        <circle class="ring-fill" cx="${size/2}" cy="${size/2}" r="${rr}" stroke-width="${stroke}"
          stroke="${color}" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1-pct)}"
          style="filter:drop-shadow(0 0 6px ${color}88)"/>
      </svg>
      <div class="ring-center">
        <div class="rv" style="font-size:${size/4.6}px">${display != null ? display : value}</div>
        ${label?`<div class="rl">${NP.esc(label)}</div>`:''}
      </div>
    </div>`;
  };

  /* ---------- Toast ---------- */
  NP.toast = function(msg, icon){
    const root = $('#toast-root');
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<i class="fa-solid ${icon||'fa-circle-check'}"></i> <span>${msg}</span>`;
    root.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 2600);
  };

  /* ---------- Modal ---------- */
  NP.modal = function(html, opts){
    opts = opts || {};
    const root = $('#modal-root');
    root.innerHTML = `<div class="modal-backdrop" role="dialog" aria-modal="true"><div class="modal">${html}</div></div>`;
    const bd = root.firstElementChild;
    bd.addEventListener('click', e => { if (e.target === bd && !opts.sticky) NP.closeModal(); });
    document.addEventListener('keydown', escClose);
    function escClose(e){ if (e.key === 'Escape'){ NP.closeModal(); document.removeEventListener('keydown', escClose); } }
    return bd;
  };
  NP.closeModal = function(){ $('#modal-root').innerHTML = ''; };

  /* ---------- Achievement popup ---------- */
  NP.achievementPop = function(ach){
    const bd = NP.modal(`
      <div class="tc">
        <div class="eyebrow mb-4" style="color:${ach.color}">Achievement Unlocked</div>
        <div class="ach-icon" style="margin:0 auto 18px;width:88px;height:88px;font-size:34px;border-radius:26px;background:linear-gradient(140deg,${ach.color},${ach.color}33);box-shadow:0 10px 40px -6px ${ach.color}">
          <i class="fa-solid ${ach.icon}"></i>
        </div>
        <h2 style="font-size:26px;margin-bottom:6px">${ach.name}</h2>
        <p class="muted mb-5">${ach.desc}</p>
        <button class="btn btn-primary" onclick="NP.closeModal()">Collect</button>
      </div>`);
    NP.burst(bd.querySelector('.ach-icon'), ach.color, 18);
  };

  /* ---------- Particle burst ---------- */
  NP.burst = function(el, color, n){
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    for (let i=0;i<(n||14);i++){
      const p = document.createElement('i');
      p.className = 'burst';
      const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 110;
      p.style.cssText = `left:${cx}px;top:${cy}px;background:${color||'#2E7CF6'};position:fixed;--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d - 40}px;z-index:500;width:${5+Math.random()*6}px;height:${5+Math.random()*6}px;`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 950);
    }
  };

  /* ---------- Count-up animation ---------- */
  NP.countUp = function(el, to, dur){
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches){ el.textContent = to; return; }
    const start = performance.now();
    dur = dur || 900;
    function step(t){
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  /* ---------- rail arrow behavior (delegated) ---------- */
  document.addEventListener('click', e => {
    const prev = e.target.closest('[data-rail-prev]');
    const next = e.target.closest('[data-rail-next]');
    if (prev || next){
      const rail = document.getElementById((prev||next).dataset.railPrev || (prev||next).dataset.railNext);
      if (rail) rail.scrollBy({ left: (prev ? -1 : 1) * rail.clientWidth * 0.82, behavior: 'smooth' });
    }
  });
})();
