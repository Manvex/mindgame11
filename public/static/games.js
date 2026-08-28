/* ============================================================
   NEUROPLAY — Game engines + gameplay screen + results
   ============================================================ */
(function(){
  const $ = NP.$;
  NP.ENGINES = {};

  let session = null; // { gameId, startAt, timerInt, paused }

  /* ---------- Launch a game ---------- */
  NP.playGame = function(gameId){
    const game = NP.GAME_INDEX[gameId];
    if (!game) return;
    if (!game.playable){
      NP.comingSoon(game);
      return;
    }
    document.body.style.overflow = 'hidden';
    const root = document.createElement('div');
    root.className = 'play-screen';
    root.id = 'play-screen';
    root.innerHTML = `
      <div class="play-topbar">
        <button class="icon-btn" id="play-back" aria-label="Exit game"><i class="fa-solid fa-arrow-left"></i></button>
        <div class="play-title">${NP.esc(game.name)}</div>
        <div class="play-hud" id="play-hud"></div>
        <button class="icon-btn" id="play-pause" aria-label="Pause"><i class="fa-solid fa-pause"></i></button>
      </div>
      <div class="play-main" id="play-main"></div>
      <div class="play-bottom" id="play-bottom"></div>`;
    document.body.appendChild(root);

    session = { gameId, startAt: Date.now(), paused: false, cleanup: [] };

    $('#play-back').onclick = () => confirmExit(game);
    $('#play-pause').onclick = () => pauseMenu(game);

    const api = {
      main: $('#play-main'),
      bottom: $('#play-bottom'),
      hud: hudApi(),
      finish: (result) => finishGame(game, result),
      onCleanup: fn => session.cleanup.push(fn),
      isPaused: () => session.paused,
    };
    NP.ENGINES[gameId](api, game);
  };

  function hudApi(){
    const hud = $('#play-hud');
    const pills = {};
    return {
      set(key, icon, value){
        if (!pills[key]){
          const el = document.createElement('div');
          el.className = 'hud-pill';
          el.innerHTML = `<i class="fa-solid ${icon}"></i><span></span>`;
          hud.appendChild(el);
          pills[key] = el.querySelector('span');
        }
        pills[key].textContent = value;
      }
    };
  }

  function closePlayScreen(){
    if (session){ session.cleanup.forEach(fn => { try{fn();}catch(e){} }); session = null; }
    const el = $('#play-screen');
    if (el) el.remove();
    document.body.style.overflow = '';
  }
  NP.closePlayScreen = closePlayScreen;

  function confirmExit(game){
    session.paused = true;
    NP.modal(`
      <div class="tc">
        <h2 style="font-size:22px" class="mb-3">Leave game?</h2>
        <p class="muted mb-5">Your progress in this session will be lost.</p>
        <div class="flex gap-3 jcc wrap">
          <button class="btn btn-glass" id="mx-resume">Keep Playing</button>
          <button class="btn btn-primary" id="mx-exit">Exit</button>
        </div>
      </div>`);
    $('#mx-resume').onclick = () => { session.paused = false; NP.closeModal(); };
    $('#mx-exit').onclick = () => { NP.closeModal(); closePlayScreen(); };
  }

  function pauseMenu(game){
    session.paused = true;
    NP.modal(`
      <div class="tc">
        <div class="eyebrow mb-3">Paused</div>
        <h2 style="font-size:24px" class="mb-2">${NP.esc(game.name)}</h2>
        <p class="muted mb-5" style="font-size:13px">${NP.esc(game.how)}</p>
        <div class="flex gap-3 jcc wrap">
          <button class="btn btn-primary" id="mx-resume"><i class="fa-solid fa-play"></i> Resume</button>
          <button class="btn btn-ghost" id="mx-exit">Exit Game</button>
        </div>
      </div>`, {sticky:true});
    $('#mx-resume').onclick = () => { session.paused = false; NP.closeModal(); };
    $('#mx-exit').onclick = () => { NP.closeModal(); closePlayScreen(); };
  }

  NP.comingSoon = function(game){
    const cat = NP.CATEGORIES[game.cat];
    NP.modal(`
      <div class="tc">
        <div style="width:140px;margin:0 auto 20px;border-radius:16px;overflow:hidden;box-shadow:0 14px 40px -8px ${cat.color}66">${NP.cover(game,{uid:'cs'})}</div>
        <div class="eyebrow mb-2" style="color:${cat.color}">Coming Soon</div>
        <h2 style="font-size:24px" class="mb-2">${NP.esc(game.name)}</h2>
        <p class="muted mb-5" style="font-size:14px">${NP.esc(game.desc)}</p>
        <div class="flex gap-3 jcc wrap">
          <button class="btn btn-glass" onclick="NP.closeModal()">Got it</button>
          <button class="btn btn-primary" id="cs-similar">Play Something Similar</button>
        </div>
      </div>`);
    $('#cs-similar').onclick = () => {
      NP.closeModal();
      const alt = NP.GAMES.filter(g => g.cat === game.cat && g.playable);
      if (alt.length) NP.playGame(alt[Math.floor(Math.random()*alt.length)].id);
    };
  };

  /* ---------- Results screen ---------- */
  function finishGame(game, result){
    const timeSec = (Date.now() - session.startAt) / 1000;
    const summary = NP.store.recordResult({
      gameId: game.id,
      score: result.score,
      timeSec,
      perfect: !!result.perfect,
      reactionMs: result.reactionMs || 0,
      accuracy: result.accuracy,
    });
    const cat = NP.CATEGORIES[game.cat];
    const rating = result.score >= (result.eliteAt || 400) ? ['ELITE','#FACC15'] :
                   result.score >= (result.greatAt || 200) ? ['EXCELLENT', cat.color] :
                   result.score >= 60 ? ['SOLID','#34D399'] : ['KEEP TRAINING','#A8B2C2'];

    const main = $('#play-main');
    $('#play-hud').innerHTML = '';
    $('#play-bottom').innerHTML = '';
    session.cleanup.forEach(fn => { try{fn();}catch(e){} });
    session.cleanup = [];

    const statCells = [];
    statCells.push(['Time', NP.fmtTime(timeSec)]);
    if (result.accuracy != null) statCells.push(['Accuracy', Math.round(result.accuracy) + '%']);
    if (result.reactionMs) statCells.push(['Avg Reaction', result.reactionMs + 'ms']);
    if (result.extra) statCells.push(...result.extra);
    statCells.push(['Streak', NP.store.state.streak.current + ' day' + (NP.store.state.streak.current === 1 ? '' : 's')]);

    main.innerHTML = `
      <div class="results-wrap">
        <div class="results-rating" style="color:${rating[1]}">${rating[0]}</div>
        <div class="results-score" id="rs-score">0</div>
        <div class="dim mb-2" style="font-weight:600;letter-spacing:.1em;font-size:12px">SCORE</div>
        ${summary.isPB ? `<div class="results-pb"><i class="fa-solid fa-trophy"></i> New Personal Best</div>` : '<div style="height:14px"></div>'}
        <div class="results-stats">
          ${statCells.slice(0,3).map(([k,v]) => `
            <div class="panel" style="padding:14px 8px;text-align:center">
              <div style="font-family:var(--font-display);font-weight:800;font-size:19px">${v}</div>
              <div class="dim" style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;margin-top:2px">${k}</div>
            </div>`).join('')}
        </div>
        <div class="mb-5">
          ${summary.xpRows.map((r,i) => {
            const rc = NP.CATEGORIES[r.cat];
            return `<div class="xp-row" style="animation-delay:${0.15 + i*0.15}s">
              <span class="cat-dot" style="background:${rc.color};box-shadow:0 0 8px ${rc.color}"></span>
              <span class="xr-name">${rc.name}</span>
              <span class="xr-xp" style="color:${rc.color}">+${r.xp} XP</span>
            </div>`;
          }).join('')}
          ${summary.mixDone ? `<div class="xp-row" style="animation-delay:.5s"><span class="cat-dot" style="background:#2DD4BF"></span><span class="xr-name">Daily Mix Complete</span><span class="xr-xp" style="color:#2DD4BF">+50 XP</span></div>` : ''}
        </div>
        ${levelBlock(summary)}
        <div class="flex gap-3 jcc wrap mt-5">
          <button class="btn btn-primary" id="rs-again"><i class="fa-solid fa-rotate-right"></i> Play Again</button>
          <button class="btn btn-glass" id="rs-next"><i class="fa-solid fa-forward"></i> Next Game</button>
          <button class="btn btn-ghost" id="rs-home">Home</button>
        </div>
      </div>`;

    NP.countUp($('#rs-score'), result.score, 1100);
    if (rating[0] === 'ELITE' || summary.isPB) setTimeout(() => NP.burst($('#rs-score'), cat.color, 24), 400);

    $('#rs-again').onclick = () => { closePlayScreen(); NP.playGame(game.id); };
    $('#rs-next').onclick = () => {
      closePlayScreen();
      const mix = NP.store.ensureDailyMix();
      const pendingMix = mix.games.filter(id => !mix.done.includes(id) && NP.GAME_INDEX[id].playable);
      const pool = pendingMix.length ? pendingMix :
        NP.GAMES.filter(g => g.playable && g.id !== game.id).map(g => g.id);
      NP.playGame(pool[Math.floor(Math.random()*pool.length)]);
    };
    $('#rs-home').onclick = () => { closePlayScreen(); NP.go('/'); };

    if (summary.levelUp) setTimeout(() => levelUpPop(summary.level), 800);
    if (summary.newAch.length) setTimeout(() => summary.newAch.forEach((a,i) => setTimeout(() => NP.achievementPop(a), i*400)), summary.levelUp ? 2600 : 900);
    NP.refreshNav && NP.refreshNav();
  }

  function levelBlock(summary){
    const li = NP.store.levelInfo();
    return `
      <div class="panel" style="padding:16px 20px;text-align:left">
        <div class="flex jcb aic mb-2">
          <span style="font-family:var(--font-display);font-weight:700;font-size:14px">Level ${li.level} · ${li.title}</span>
          <span class="dim" style="font-size:12px">${li.intoLevel}/${li.needed} XP</span>
        </div>
        <div class="xp-bar"><i style="width:${Math.round(li.progress*100)}%"></i></div>
      </div>`;
  }

  function levelUpPop(level){
    NP.modal(`
      <div class="tc">
        <div class="eyebrow mb-3" style="color:var(--accent)">Level Up</div>
        <div style="font-family:var(--font-display);font-weight:900;font-size:66px;line-height:1;background:linear-gradient(135deg,#fff,#7FA8EE);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent">${level.level}</div>
        <h2 style="font-size:22px;margin:8px 0 4px">${level.title}</h2>
        <p class="muted mb-5">Your mind is getting sharper. Keep the streak alive.</p>
        <button class="btn btn-primary" onclick="NP.closeModal()">Continue</button>
      </div>`);
    NP.burst($('#modal-root .modal'), '#2E7CF6', 22);
  }

  /* ---------- helpers ---------- */
  function shuffle(a){ a = a.slice(); for (let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; }
  function el(html){ const d = document.createElement('div'); d.innerHTML = html; return d.firstElementChild; }
  NP._g = { shuffle, el };
})();

/* ============================================================
   ENGINES
   ============================================================ */
(function(){
  const $ = NP.$;
  const { shuffle } = NP._g;
  const E = NP.ENGINES;

  /* ---------- MEMORY MATCH / ZEN MATCH ---------- */
  function memoryMatchEngine(api, game, zen){
    const icons = ['fa-star','fa-heart','fa-bolt','fa-moon','fa-fire','fa-gem','fa-leaf','fa-snowflake'];
    const pairs = zen ? 6 : 8;
    const deck = shuffle(shuffle(icons).slice(0, pairs).flatMap(i => [i, i]));
    const cols = pairs === 6 ? 4 : 4;
    let flipped = [], moves = 0, matched = 0, lock = false;
    api.hud.set('moves','fa-hand-pointer', 0);

    api.main.innerHTML = `<div class="board" style="grid-template-columns:repeat(${cols},1fr);width:min(92vw,${pairs===6?'440px':'480px'},70vh)">
      ${deck.map((ic,i) => `<button class="tile" data-i="${i}" aria-label="Card ${i+1}" style="font-size:clamp(18px,4vw,30px)"><i class="fa-solid ${ic}" style="opacity:0"></i></button>`).join('')}
    </div>`;

    api.main.querySelectorAll('.tile').forEach(t => t.onclick = () => {
      if (api.isPaused() || lock) return;
      const i = +t.dataset.i;
      if (flipped.find(f => f.i === i) || t.classList.contains('match')) return;
      t.classList.add('flip');
      t.querySelector('i').style.opacity = '1';
      t.querySelector('i').style.color = 'var(--accent)';
      flipped.push({ i, t });
      if (flipped.length === 2){
        moves++; api.hud.set('moves','fa-hand-pointer', moves);
        const [a, b] = flipped;
        if (deck[a.i] === deck[b.i]){
          a.t.classList.add('match'); b.t.classList.add('match');
          matched++;
          NP.burst(b.t, '#2E7CF6', 8);
          flipped = [];
          if (matched === pairs){
            const perfect = moves === pairs;
            const score = Math.max(40, Math.round(1000 * pairs / moves));
            setTimeout(() => api.finish({ score, perfect, accuracy: pairs/moves*100, greatAt: zen?400:450, eliteAt: zen?600:700 }), 500);
          }
        } else {
          lock = true;
          setTimeout(() => {
            [a,b].forEach(f => { f.t.classList.remove('flip'); f.t.querySelector('i').style.opacity = '0'; });
            flipped = []; lock = false;
          }, 700);
        }
      }
    });
  }
  E['memory-match'] = (api, game) => memoryMatchEngine(api, game, false);
  E['zen-match'] = (api, game) => memoryMatchEngine(api, game, true);

  /* ---------- SEQUENCE RECALL ---------- */
  E['sequence-recall'] = function(api){
    const n = 9;
    let seq = [], input = [], round = 0, showing = false;
    api.hud.set('round','fa-layer-group','1');
    api.main.innerHTML = `<div>
      <div class="tc dim mb-4" id="sq-status" style="font-weight:600;letter-spacing:.08em;min-height:20px">WATCH THE SEQUENCE</div>
      <div class="board" style="grid-template-columns:repeat(3,1fr);width:min(88vw,380px)">
        ${[...Array(n)].map((_,i) => `<button class="tile" data-i="${i}" aria-label="Tile ${i+1}"></button>`).join('')}
      </div></div>`;
    const tiles = [...api.main.querySelectorAll('.tile')];
    const status = $('#sq-status');

    function playSeq(){
      showing = true; input = [];
      status.textContent = 'WATCH THE SEQUENCE'; status.style.color = '';
      seq.push(Math.floor(Math.random()*n));
      round = seq.length;
      api.hud.set('round','fa-layer-group', round);
      let i = 0;
      const int = setInterval(() => {
        if (api.isPaused()) return;
        if (i > 0) tiles[seq[i-1]].classList.remove('lit');
        if (i >= seq.length){ clearInterval(int); showing = false; status.textContent = 'YOUR TURN'; return; }
        setTimeout(() => tiles[seq[i]].classList.add('lit'), 60);
        i++;
      }, 620);
      api.onCleanup(() => clearInterval(int));
    }

    tiles.forEach(t => t.onclick = () => {
      if (showing || api.isPaused()) return;
      const i = +t.dataset.i;
      t.classList.add('lit'); setTimeout(() => t.classList.remove('lit'), 240);
      input.push(i);
      const idx = input.length - 1;
      if (seq[idx] !== i){
        t.classList.add('wrong'); setTimeout(() => t.classList.remove('wrong'), 400);
        status.textContent = 'SEQUENCE BROKEN'; status.style.color = 'var(--cat-speed)';
        const score = Math.max(10, (round - 1) * 55);
        setTimeout(() => api.finish({ score, perfect: false, greatAt: 275, eliteAt: 440, extra: [['Best Round', round-1]] }), 800);
        showing = true;
        return;
      }
      if (input.length === seq.length){
        status.textContent = 'PERFECT — NEXT ROUND';
        NP.burst(t, '#A855F7', 8);
        setTimeout(playSeq, 900);
        showing = true;
      }
    });
    setTimeout(playSeq, 700);
  };

  /* ---------- SIMON ---------- */
  E['simon'] = function(api){
    const colors = ['#34D399','#F43F5E','#FACC15','#3B82F6'];
    let seq = [], input = [], showing = true;
    api.hud.set('round','fa-layer-group','1');
    api.main.innerHTML = `<div>
      <div class="tc dim mb-4" id="si-status" style="font-weight:600;letter-spacing:.08em">WATCH</div>
      <div class="board" style="grid-template-columns:repeat(2,1fr);width:min(85vw,340px);gap:12px">
        ${colors.map((c,i) => `<button class="tile" data-i="${i}" aria-label="Pad ${i+1}" style="background:${c}26;border-color:${c}44;border-radius:${['30px 12px 12px 12px','12px 30px 12px 12px','12px 12px 12px 30px','12px 12px 30px 12px'][i]}"></button>`).join('')}
      </div></div>`;
    const tiles = [...api.main.querySelectorAll('.tile')];
    const status = $('#si-status');
    function glow(i, ms){
      tiles[i].style.background = colors[i];
      tiles[i].style.boxShadow = `0 0 34px ${colors[i]}`;
      setTimeout(() => { tiles[i].style.background = colors[i]+'26'; tiles[i].style.boxShadow = ''; }, ms || 340);
    }
    function playSeq(){
      showing = true; input = [];
      status.textContent = 'WATCH';
      seq.push(Math.floor(Math.random()*4));
      api.hud.set('round','fa-layer-group', seq.length);
      let i = 0;
      const int = setInterval(() => {
        if (api.isPaused()) return;
        if (i >= seq.length){ clearInterval(int); showing = false; status.textContent = 'REPEAT'; return; }
        glow(seq[i]); i++;
      }, 560);
      api.onCleanup(() => clearInterval(int));
    }
    tiles.forEach(t => t.onclick = () => {
      if (showing || api.isPaused()) return;
      const i = +t.dataset.i;
      glow(i, 200);
      input.push(i);
      const idx = input.length - 1;
      if (seq[idx] !== i){
        status.textContent = 'WRONG PAD';
        const score = Math.max(10, (seq.length - 1) * 60);
        showing = true;
        setTimeout(() => api.finish({ score, greatAt: 300, eliteAt: 480, extra: [['Best Round', seq.length - 1]] }), 700);
        return;
      }
      if (input.length === seq.length){ showing = true; setTimeout(playSeq, 800); }
    });
    setTimeout(playSeq, 700);
  };

  /* ---------- NUMBER MEMORY ---------- */
  E['number-memory'] = function(api){
    let digits = 3, best = 0;
    api.hud.set('digits','fa-hashtag', digits);
    function round(){
      const num = [...Array(digits)].map((_,i) => Math.floor(Math.random() * (i ? 10 : 9)) + (i ? 0 : 1)).join('');
      api.main.innerHTML = `<div class="tc">
        <div class="dim mb-4" style="font-weight:600;letter-spacing:.1em">MEMORIZE</div>
        <div style="font-family:var(--font-display);font-weight:900;font-size:clamp(38px,9vw,64px);letter-spacing:.14em" id="nm-num">${num}</div>
        <div class="xp-bar mt-5" style="width:min(70vw,280px);margin:24px auto 0"><i id="nm-bar" style="width:100%;transition:width ${1200 + digits*420}ms linear"></i></div>
      </div>`;
      requestAnimationFrame(() => requestAnimationFrame(() => { const b = $('#nm-bar'); if (b) b.style.width = '0%'; }));
      const t = setTimeout(() => {
        api.main.innerHTML = `<div class="tc" style="width:min(90vw,360px)">
          <div class="dim mb-4" style="font-weight:600;letter-spacing:.1em">WHAT WAS THE NUMBER?</div>
          <input id="nm-in" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="Enter the number"
            style="width:100%;background:var(--surface-1);border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:18px;color:#fff;font-family:var(--font-display);font-weight:800;font-size:28px;text-align:center;letter-spacing:.12em;outline:none">
          <button class="btn btn-primary btn-block mt-4" id="nm-go">Submit</button>
        </div>`;
        const inp = $('#nm-in'); inp.focus();
        function submit(){
          if (inp.value.trim() === num){
            best = digits; digits++;
            api.hud.set('digits','fa-hashtag', digits);
            NP.toast(`${best} digits — correct!`, 'fa-brain');
            round();
          } else {
            const score = Math.max(10, best * 70);
            api.finish({ score, greatAt: 420, eliteAt: 630, extra: [['Digit Span', best]] });
          }
        }
        $('#nm-go').onclick = submit;
        inp.onkeydown = e => { if (e.key === 'Enter') submit(); };
      }, 1400 + digits * 420);
      api.onCleanup(() => clearTimeout(t));
    }
    round();
  };

  /* ---------- VISUAL MEMORY ---------- */
  E['visual-memory'] = function(api){
    let level = 1, lives = 3;
    function renderLives(){
      api.bottom.innerHTML = `<div class="lives" aria-label="${lives} lives left">${[0,1,2].map(i => `<i class="fa-solid fa-heart ${i >= lives ? 'lost' : ''}"></i>`).join('')}</div>`;
    }
    api.hud.set('level','fa-layer-group', 1);
    renderLives();
    function round(){
      const size = Math.min(7, 3 + Math.floor(level / 2));
      const count = Math.min(size*size - 2, 2 + level);
      const lit = shuffle([...Array(size*size).keys()]).slice(0, count);
      api.hud.set('level','fa-layer-group', level);
      api.main.innerHTML = `<div>
        <div class="tc dim mb-4" id="vm-st" style="font-weight:600;letter-spacing:.08em">MEMORIZE THE TILES</div>
        <div class="board" style="grid-template-columns:repeat(${size},1fr);width:min(90vw,${300+size*30}px,64vh)">
          ${[...Array(size*size)].map((_,i) => `<button class="tile" data-i="${i}" aria-label="Tile"></button>`).join('')}
        </div></div>`;
      const tiles = [...api.main.querySelectorAll('.tile')];
      lit.forEach(i => tiles[i].classList.add('lit'));
      let found = 0, misses = 0, active = false;
      const t = setTimeout(() => {
        lit.forEach(i => tiles[i].classList.remove('lit'));
        $('#vm-st').textContent = 'TAP EVERY LIT TILE';
        active = true;
      }, 900 + count * 220);
      api.onCleanup(() => clearTimeout(t));
      tiles.forEach(tile => tile.onclick = () => {
        if (!active || api.isPaused()) return;
        const i = +tile.dataset.i;
        if (tile.dataset.done) return;
        tile.dataset.done = 1;
        if (lit.includes(i)){
          tile.classList.add('match','pop'); found++;
          if (found === count){
            active = false;
            NP.burst(tile, '#A855F7', 10);
            level++;
            setTimeout(round, 700);
          }
        } else {
          tile.classList.add('wrong'); misses++;
          if (misses >= 3){
            active = false;
            lives--;
            renderLives();
            if (lives <= 0){
              const score = Math.max(10, (level-1) * 65);
              setTimeout(() => api.finish({ score, greatAt: 320, eliteAt: 520, extra: [['Level', level-1]] }), 600);
            } else setTimeout(round, 700);
          }
        }
      });
    }
    round();
  };

  /* ---------- SCHULTE TABLE ---------- */
  E['schulte'] = function(api){
    const nums = shuffle([...Array(25)].map((_,i) => i+1));
    let next = 1, errs = 0;
    const t0 = Date.now();
    api.hud.set('find','fa-magnifying-glass','1');
    const int = setInterval(() => { if (!api.isPaused()) api.hud.set('time','fa-stopwatch', NP.fmtTime((Date.now()-t0)/1000)); }, 250);
    api.onCleanup(() => clearInterval(int));
    api.main.innerHTML = `<div class="board" style="grid-template-columns:repeat(5,1fr);width:min(90vw,440px,66vh)">
      ${nums.map(n => `<button class="tile" data-n="${n}" style="font-size:clamp(17px,4vw,24px)">${n}</button>`).join('')}
    </div>`;
    api.main.querySelectorAll('.tile').forEach(t => t.onclick = () => {
      if (api.isPaused()) return;
      const n = +t.dataset.n;
      if (n === next){
        t.classList.add('match','pop');
        next++;
        api.hud.set('find','fa-magnifying-glass', next <= 25 ? next : '✓');
        if (next > 25){
          clearInterval(int);
          const secs = (Date.now()-t0)/1000;
          const score = Math.max(20, Math.round(3400 / secs * 10));
          api.finish({ score, perfect: errs === 0, accuracy: 25/(25+errs)*100, greatAt: 700, eliteAt: 1050, extra: [['Errors', errs]] });
        }
      } else { t.classList.add('wrong'); setTimeout(() => t.classList.remove('wrong'), 380); errs++; }
    });
  };

  /* ---------- STROOP / COLOR RUSH ---------- */
  function stroopEngine(api, isRush){
    const COLORS = [['RED','#F43F5E'],['BLUE','#3B82F6'],['GREEN','#34D399'],['YELLOW','#FACC15']];
    let score = 0, streak = 0, correct = 0, total = 0, timeLeft = 45;
    api.hud.set('score','fa-star', 0);
    api.hud.set('time','fa-stopwatch', timeLeft);
    const int = setInterval(() => {
      if (api.isPaused()) return;
      timeLeft--;
      api.hud.set('time','fa-stopwatch', timeLeft);
      if (timeLeft <= 0){
        clearInterval(int);
        api.finish({ score, accuracy: total ? correct/total*100 : 0, perfect: total >= 10 && correct === total, greatAt: 260, eliteAt: 460 });
      }
    }, 1000);
    api.onCleanup(() => clearInterval(int));

    let cur;
    function nextCard(){
      const wi = Math.floor(Math.random()*4);
      const match = Math.random() < 0.5;
      const ci = match ? wi : (wi + 1 + Math.floor(Math.random()*3)) % 4;
      cur = { word: COLORS[wi][0], color: COLORS[ci][1], match: wi === ci };
      $('#st-word').textContent = cur.word;
      $('#st-word').style.color = cur.color;
      $('#st-card').classList.remove('pop'); void $('#st-card').offsetWidth; $('#st-card').classList.add('pop');
    }
    function answer(saysMatch){
      total++;
      const right = isRush ? (saysMatch === cur.match) : saysMatch(cur);
      if (right){
        correct++; streak++;
        const mult = 1 + Math.min(3, Math.floor(streak/5));
        score += 10 * mult;
        if (streak % 10 === 0) NP.burst($('#st-card'), '#22D3EE', 10);
      } else { streak = 0; score = Math.max(0, score - 5); $('#st-card').classList.add('wrong'); setTimeout(()=>$('#st-card').classList.remove('wrong'),300); }
      api.hud.set('score','fa-star', score);
      nextCard();
    }
    if (isRush){
      api.main.innerHTML = `<div class="tc" style="width:min(90vw,420px)">
        <div class="panel tile pop" id="st-card" style="aspect-ratio:auto;padding:52px 20px;margin-bottom:26px;cursor:default">
          <span id="st-word" style="font-family:var(--font-display);font-weight:900;font-size:clamp(34px,9vw,52px);letter-spacing:.04em"></span>
        </div>
        <div class="flex gap-4 jcc">
          <button class="btn btn-lg" style="background:rgba(244,63,94,.16);color:#F43F5E;border:1px solid rgba(244,63,94,.4);flex:1;max-width:170px" id="st-no"><i class="fa-solid fa-xmark"></i> NO</button>
          <button class="btn btn-lg" style="background:rgba(52,211,153,.14);color:#34D399;border:1px solid rgba(52,211,153,.4);flex:1;max-width:170px" id="st-yes"><i class="fa-solid fa-check"></i> YES</button>
        </div>
        <div class="dim mt-4" style="font-size:12px">Does the word match its ink color?</div>
      </div>`;
      $('#st-yes').onclick = () => !api.isPaused() && answer(true);
      $('#st-no').onclick = () => !api.isPaused() && answer(false);
    } else {
      api.main.innerHTML = `<div class="tc" style="width:min(90vw,440px)">
        <div class="panel tile pop" id="st-card" style="aspect-ratio:auto;padding:52px 20px;margin-bottom:26px;cursor:default">
          <span id="st-word" style="font-family:var(--font-display);font-weight:900;font-size:clamp(34px,9vw,52px);letter-spacing:.04em"></span>
        </div>
        <div class="flex gap-3 jcc wrap">
          ${COLORS.map(([n,c],i) => `<button class="btn" data-ci="${i}" style="background:${c}1e;color:${c};border:1px solid ${c}55;min-width:100px">${n}</button>`).join('')}
        </div>
        <div class="dim mt-4" style="font-size:12px">Tap the INK COLOR — not the word</div>
      </div>`;
      api.main.querySelectorAll('[data-ci]').forEach(b => b.onclick = () => {
        if (api.isPaused()) return;
        answer(c => COLORS[+b.dataset.ci][1] === c.color);
      });
    }
    nextCard();
  }
  E['stroop'] = api => stroopEngine(api, false);
  E['color-rush'] = api => stroopEngine(api, true);

  /* ---------- REACTION TIME ---------- */
  E['reaction'] = function(api){
    const times = [];
    let state = 'idle', t0 = 0, timeout = null;
    api.hud.set('round','fa-flag-checkered','1/5');
    api.main.innerHTML = `
      <button id="rx-pad" style="width:min(90vw,480px);height:min(60vh,420px);border-radius:28px;background:var(--surface-1);border:1px solid rgba(255,255,255,.08);display:grid;place-items:center;transition:background .15s" aria-label="Reaction pad">
        <div class="tc">
          <div id="rx-main" style="font-family:var(--font-display);font-weight:800;font-size:clamp(22px,5vw,34px)">TAP TO START</div>
          <div id="rx-sub" class="dim mt-4" style="font-size:13px">Wait for green, then tap as fast as you can</div>
        </div>
      </button>`;
    const pad = $('#rx-pad'), main = $('#rx-main'), sub = $('#rx-sub');
    function arm(){
      state = 'waiting';
      pad.style.background = '#3A1520';
      main.textContent = 'WAIT FOR GREEN…';
      sub.textContent = '';
      timeout = setTimeout(() => {
        state = 'go'; t0 = performance.now();
        pad.style.background = '#0F3D2E';
        pad.style.boxShadow = '0 0 60px rgba(52,211,153,.4)';
        main.textContent = 'TAP NOW!';
      }, 1200 + Math.random()*2600);
      api.onCleanup(() => clearTimeout(timeout));
    }
    pad.onclick = () => {
      if (api.isPaused()) return;
      if (state === 'idle'){ arm(); return; }
      if (state === 'waiting'){
        clearTimeout(timeout);
        pad.style.background = 'var(--surface-1)';
        main.textContent = 'TOO EARLY';
        sub.textContent = 'Tap to retry this round';
        state = 'idle';
        return;
      }
      if (state === 'go'){
        const ms = Math.round(performance.now() - t0);
        times.push(ms);
        pad.style.background = 'var(--surface-1)';
        pad.style.boxShadow = '';
        api.hud.set('round','fa-flag-checkered', `${Math.min(times.length+1,5)}/5`);
        if (times.length >= 5){
          const avg = Math.round(times.reduce((a,b)=>a+b,0) / times.length);
          const bestMs = Math.min(...times);
          const score = Math.max(20, Math.round(9000 / avg * 10));
          api.finish({ score, reactionMs: avg, greatAt: 300, eliteAt: 380, extra: [['Best', bestMs+'ms']] });
          return;
        }
        main.textContent = ms + 'ms';
        sub.textContent = ms < 250 ? 'Elite reflexes! Tap for next round' : 'Tap for next round';
        state = 'idle';
      }
    };
  };

  /* ---------- FIND THE TARGET ---------- */
  E['find-target'] = function(api){
    let round = 1, score = 0, timeLeft = 40;
    api.hud.set('score','fa-star',0);
    api.hud.set('time','fa-stopwatch', timeLeft);
    const int = setInterval(() => {
      if (api.isPaused()) return;
      timeLeft--;
      api.hud.set('time','fa-stopwatch', timeLeft);
      if (timeLeft <= 0){ clearInterval(int); api.finish({ score, greatAt: 240, eliteAt: 420, extra: [['Rounds', round-1]] }); }
    }, 1000);
    api.onCleanup(() => clearInterval(int));
    function draw(){
      const size = Math.min(8, 3 + Math.floor(round/3));
      const hue = Math.floor(Math.random()*360);
      const diff = Math.max(5, 26 - round*1.6);
      const target = Math.floor(Math.random()*size*size);
      api.main.innerHTML = `<div class="board" style="grid-template-columns:repeat(${size},1fr);width:min(90vw,480px,64vh);gap:6px">
        ${[...Array(size*size)].map((_,i) => `<button class="tile" data-t="${i===target?1:0}" style="background:hsl(${hue} 55% ${i===target ? 38+diff/2 : 38}%);border:none" aria-label="tile"></button>`).join('')}
      </div>`;
      api.main.querySelectorAll('.tile').forEach(t => t.onclick = () => {
        if (api.isPaused()) return;
        if (t.dataset.t === '1'){ score += 8 + round*2; round++; api.hud.set('score','fa-star',score); NP.burst(t,'#22D3EE',6); draw(); }
        else { t.classList.add('wrong'); score = Math.max(0, score-4); api.hud.set('score','fa-star',score); }
      });
    }
    draw();
  };

  /* ---------- MENTAL MATH ---------- */
  E['mental-math'] = function(api){
    let score = 0, streak = 0, correct = 0, total = 0, timeLeft = 60, level = 1;
    api.hud.set('score','fa-star',0);
    api.hud.set('time','fa-stopwatch',timeLeft);
    const int = setInterval(() => {
      if (api.isPaused()) return;
      timeLeft--;
      api.hud.set('time','fa-stopwatch',timeLeft);
      if (timeLeft <= 0){ clearInterval(int); api.finish({ score, accuracy: total?correct/total*100:0, greatAt: 300, eliteAt: 520, extra: [['Solved', correct]] }); }
    }, 1000);
    api.onCleanup(() => clearInterval(int));
    function gen(){
      const r = (n) => Math.floor(Math.random()*n);
      let a,b,op,ans;
      const t = Math.min(4, 1 + Math.floor(level/4));
      const kind = r(t === 1 ? 2 : 4);
      if (kind === 0){ a = r(20*t)+5; b = r(20*t)+5; op='+'; ans = a+b; }
      else if (kind === 1){ a = r(30*t)+15; b = r(Math.min(a,20*t))+3; op='−'; ans = a-b; }
      else if (kind === 2){ a = r(9+t*2)+2; b = r(9)+2; op='×'; ans = a*b; }
      else { b = r(9)+2; ans = r(10+t)+2; a = b*ans; op='÷'; }
      const opts = new Set([ans]);
      while (opts.size < 4) opts.add(Math.max(0, ans + (r(2)?1:-1) * (r(Math.max(3, Math.round(ans*0.25)))+1)));
      return { text: `${a} ${op} ${b}`, ans, opts: shuffle([...opts]) };
    }
    function draw(){
      const q = gen();
      const mult = 1 + Math.min(3, Math.floor(streak/5));
      api.main.innerHTML = `<div class="tc" style="width:min(90vw,440px)">
        ${streak >= 5 ? `<div class="mb-3" style="color:var(--cat-math);font-weight:800;font-family:var(--font-display);letter-spacing:.1em;font-size:13px"><i class="fa-solid fa-fire"></i> ${streak} STREAK · ${mult}x</div>` : '<div class="mb-3" style="height:20px"></div>'}
        <div style="font-family:var(--font-display);font-weight:900;font-size:clamp(38px,10vw,58px);margin-bottom:30px">${q.text}</div>
        <div class="board" style="grid-template-columns:repeat(2,1fr);width:100%;gap:12px">
          ${q.opts.map(o => `<button class="tile" data-a="${o}" style="aspect-ratio:auto;padding:20px;font-size:24px">${o}</button>`).join('')}
        </div></div>`;
      api.main.querySelectorAll('.tile').forEach(t => t.onclick = () => {
        if (api.isPaused()) return;
        total++;
        if (+t.dataset.a === q.ans){
          correct++; streak++; level++;
          score += 10 * (1 + Math.min(3, Math.floor(streak/5)));
          t.classList.add('match');
          api.hud.set('score','fa-star',score);
          setTimeout(draw, 160);
        } else { streak = 0; t.classList.add('wrong'); score = Math.max(0, score-5); api.hud.set('score','fa-star',score); }
      });
    }
    draw();
  };

  /* ---------- NEURAL 2048 ---------- */
  E['neural-2048'] = function(api){
    const N = 4;
    let grid = [...Array(N)].map(() => Array(N).fill(0));
    let score = 0, moved = false, over = false;
    api.hud.set('score','fa-star',0);
    function addTile(){
      const empty = [];
      grid.forEach((row,y) => row.forEach((v,x) => { if (!v) empty.push([x,y]); }));
      if (!empty.length) return;
      const [x,y] = empty[Math.floor(Math.random()*empty.length)];
      grid[y][x] = Math.random() < 0.9 ? 2 : 4;
    }
    addTile(); addTile();
    const COLORS = {2:'#2A3242',4:'#33405A',8:'#2E7CF6',16:'#4A6CF7',32:'#7C3AED',64:'#A855F7',128:'#EC4899',256:'#F43F5E',512:'#F97316',1024:'#FACC15',2048:'#34D399'};
    function render(newPos){
      api.main.innerHTML = `<div class="board" style="grid-template-columns:repeat(4,1fr);width:min(90vw,420px,58vh);background:rgba(255,255,255,.04);padding:10px;border-radius:18px;gap:10px" tabindex="0" id="g2048" aria-label="2048 board">
        ${grid.flatMap((row,y) => row.map((v,x) => {
          const isNew = newPos && newPos[0]===x && newPos[1]===y;
          return `<div class="tile ${isNew?'pop':''}" style="cursor:default;font-size:${v>=1024?'clamp(15px,4vw,22px)':v>=128?'clamp(17px,4.6vw,26px)':'clamp(20px,5.4vw,30px)'};background:${v?COLORS[v]||'#34D399':'rgba(255,255,255,.03)'};${v>=8?'color:#fff;box-shadow:0 0 18px '+(COLORS[v]||'#34D399')+'55;':'color:var(--text-mid);'}border:none">${v||''}</div>`;
        })).join('')}
      </div>`;
    }
    function slide(row){
      const arr = row.filter(v => v);
      for (let i=0;i<arr.length-1;i++){
        if (arr[i] === arr[i+1]){ arr[i] *= 2; score += arr[i]; if (arr[i] === 2048 && !over) NP.toast('2048! Legendary merge!','fa-crown'); arr.splice(i+1,1); }
      }
      while (arr.length < N) arr.push(0);
      return arr;
    }
    function move(dir){ // 0 left,1 right,2 up,3 down
      const before = JSON.stringify(grid);
      if (dir === 0) grid = grid.map(slide);
      if (dir === 1) grid = grid.map(r => slide(r.slice().reverse()).reverse());
      if (dir === 2 || dir === 3){
        for (let x=0;x<N;x++){
          let col = grid.map(r => r[x]);
          if (dir === 3) col = col.reverse();
          col = slide(col);
          if (dir === 3) col = col.reverse();
          col.forEach((v,y) => grid[y][x] = v);
        }
      }
      moved = JSON.stringify(grid) !== before;
      if (moved){
        addTile();
        api.hud.set('score','fa-star',score);
        render();
        if (isOver()){
          over = true;
          setTimeout(() => api.finish({ score, greatAt: 1200, eliteAt: 3000, extra: [['Top Tile', Math.max(...grid.flat())]] }), 500);
        }
      }
    }
    function isOver(){
      for (let y=0;y<N;y++) for (let x=0;x<N;x++){
        if (!grid[y][x]) return false;
        if (x < N-1 && grid[y][x] === grid[y][x+1]) return false;
        if (y < N-1 && grid[y][x] === grid[y+1][x]) return false;
      }
      return true;
    }
    const keyHandler = e => {
      if (api.isPaused() || over) return;
      const map = { ArrowLeft:0, ArrowRight:1, ArrowUp:2, ArrowDown:3, a:0, d:1, w:2, s:3 };
      if (map[e.key] != null){ e.preventDefault(); move(map[e.key]); }
    };
    document.addEventListener('keydown', keyHandler);
    api.onCleanup(() => document.removeEventListener('keydown', keyHandler));
    // touch swipe
    let ts = null;
    api.main.addEventListener('touchstart', e => { ts = [e.touches[0].clientX, e.touches[0].clientY]; }, {passive:true});
    api.main.addEventListener('touchend', e => {
      if (!ts || api.isPaused() || over) return;
      const dx = e.changedTouches[0].clientX - ts[0], dy = e.changedTouches[0].clientY - ts[1];
      if (Math.max(Math.abs(dx), Math.abs(dy)) > 28)
        move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 0) : (dy > 0 ? 3 : 2));
      ts = null;
    }, {passive:true});
    api.bottom.innerHTML = `<div class="dim" style="font-size:12px"><i class="fa-solid fa-hand-pointer"></i> Swipe or use arrow keys</div>`;
    render();
  };

  /* ---------- SUDOKU (6x6 fast variant for sessions) ---------- */
  E['sudoku'] = function(api){
    // generate a full 6x6 solution (2x3 boxes) via backtracking
    const N=6, BR=2, BC=3;
    function genFull(){
      const g = [...Array(N)].map(() => Array(N).fill(0));
      function ok(y,x,v){
        for (let i=0;i<N;i++){ if (g[y][i]===v || g[i][x]===v) return false; }
        const by = Math.floor(y/BR)*BR, bx = Math.floor(x/BC)*BC;
        for (let yy=by;yy<by+BR;yy++) for (let xx=bx;xx<bx+BC;xx++) if (g[yy][xx]===v) return false;
        return true;
      }
      function fill(pos){
        if (pos === N*N) return true;
        const y = Math.floor(pos/N), x = pos%N;
        for (const v of shuffle([1,2,3,4,5,6])){
          if (ok(y,x,v)){ g[y][x] = v; if (fill(pos+1)) return true; g[y][x] = 0; }
        }
        return false;
      }
      fill(0);
      return g;
    }
    const sol = genFull();
    const puzzle = sol.map(r => r.slice());
    shuffle([...Array(N*N).keys()]).slice(0, 18).forEach(p => { puzzle[Math.floor(p/N)][p%N] = 0; });
    let sel = null, mistakes = 0, filled = 0;
    const need = puzzle.flat().filter(v => !v).length;
    const t0 = Date.now();
    api.hud.set('left','fa-border-all', need);
    function render(){
      api.main.innerHTML = `<div style="width:min(92vw,430px)">
        <div class="board" style="grid-template-columns:repeat(6,1fr);width:100%;gap:4px;background:rgba(255,255,255,.05);padding:8px;border-radius:16px">
          ${puzzle.flatMap((row,y) => row.map((v,x) => {
            const given = sol[y][x] === v && v !== 0 && !(sel && sel.user && sel.user[y+','+x]);
            const isSel = sel && sel.y===y && sel.x===x;
            const bb = (x === 2) ? 'border-right:2px solid rgba(255,255,255,.2);' : '';
            const bbot = (y === 1 || y === 3) ? 'border-bottom:2px solid rgba(255,255,255,.2);' : '';
            return `<button class="tile" data-y="${y}" data-x="${x}" style="border-radius:8px;font-size:clamp(16px,4vw,22px);${bb}${bbot}${isSel?'background:var(--accent-soft);box-shadow:inset 0 0 0 2px var(--accent);':''}${v&&!given?'color:var(--accent);':''}" ${v?'':'aria-label="empty cell"'}>${v||''}</button>`;
          })).join('')}
        </div>
        <div class="flex gap-2 jcc mt-4 wrap">
          ${[1,2,3,4,5,6].map(n => `<button class="tile" data-n="${n}" style="width:48px;height:48px;aspect-ratio:auto;font-size:19px">${n}</button>`).join('')}
        </div>
      </div>`;
      api.bottom.innerHTML = `<div class="lives">${[0,1,2].map(i => `<i class="fa-solid fa-heart ${i >= 3-mistakes ? 'lost':''}"></i>`).join('')}</div>`;
      api.main.querySelectorAll('[data-y]').forEach(c => c.onclick = () => {
        if (api.isPaused()) return;
        const y = +c.dataset.y, x = +c.dataset.x;
        if (puzzle[y][x] === 0 || (sel && sel.user && sel.user[y+','+x])){
          sel = Object.assign(sel || {user:{}}, { y, x });
          render();
        }
      });
      api.main.querySelectorAll('[data-n]').forEach(b => b.onclick = () => {
        if (api.isPaused() || !sel || sel.y == null) return;
        const { y, x } = sel;
        if (puzzle[y][x] !== 0 && !sel.user[y+','+x]) return;
        const v = +b.dataset.n;
        if (sol[y][x] === v){
          const wasEmpty = puzzle[y][x] === 0;
          puzzle[y][x] = v;
          sel.user[y+','+x] = true;
          if (wasEmpty) filled++;
          api.hud.set('left','fa-border-all', need - filled);
          if (filled >= need){
            const secs = (Date.now()-t0)/1000;
            const score = Math.max(50, Math.round(2600 - secs*4 - mistakes*120));
            setTimeout(() => api.finish({ score, perfect: mistakes === 0, accuracy: need/(need+mistakes)*100, greatAt: 1400, eliteAt: 2100 }), 400);
            return;
          }
          render();
        } else {
          mistakes++;
          b.classList.add('wrong');
          api.bottom.innerHTML = `<div class="lives">${[0,1,2].map(i => `<i class="fa-solid fa-heart ${i >= 3-mistakes ? 'lost':''}"></i>`).join('')}</div>`;
          if (mistakes >= 3){
            const score = Math.max(20, filled * 30);
            setTimeout(() => api.finish({ score, greatAt: 1400, eliteAt: 2100 }), 500);
          }
        }
      });
    }
    render();
  };

  /* ---------- MINESWEEPER ---------- */
  E['minesweeper'] = function(api){
    const N = 8, MINES = 9;
    let mines = new Set(), revealed = new Set(), flags = new Set(), started = false, flagMode = false, done = false;
    const t0 = Date.now();
    api.hud.set('mines','fa-bomb', MINES);
    function neighbors(i){
      const y = Math.floor(i/N), x = i%N, out = [];
      for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++){
        if (!dy && !dx) continue;
        const ny = y+dy, nx = x+dx;
        if (ny>=0 && ny<N && nx>=0 && nx<N) out.push(ny*N+nx);
      }
      return out;
    }
    function plant(safe){
      const pool = shuffle([...Array(N*N).keys()].filter(i => i !== safe && !neighbors(safe).includes(i)));
      mines = new Set(pool.slice(0, MINES));
    }
    function count(i){ return neighbors(i).filter(n => mines.has(n)).length; }
    function reveal(i){
      if (revealed.has(i) || flags.has(i)) return;
      revealed.add(i);
      if (count(i) === 0 && !mines.has(i)) neighbors(i).forEach(reveal);
    }
    const NUMC = ['','#3B82F6','#34D399','#F97316','#EC4899','#F43F5E','#A855F7','#FACC15','#fff'];
    function render(){
      api.main.innerHTML = `<div class="board" style="grid-template-columns:repeat(${N},1fr);width:min(92vw,460px,62vh);gap:4px">
        ${[...Array(N*N)].map((_,i) => {
          const r = revealed.has(i);
          const c = r ? count(i) : 0;
          const isMine = r && mines.has(i);
          return `<button class="tile" data-i="${i}" style="border-radius:7px;font-size:clamp(13px,3.4vw,18px);${r ? `background:${isMine?'rgba(244,63,94,.3)':'rgba(255,255,255,.02)'};border-color:transparent;color:${NUMC[c]};cursor:default;` : ''}" aria-label="${r?(isMine?'mine':c||'empty'):flags.has(i)?'flagged':'hidden'}">${isMine ? '<i class="fa-solid fa-bomb"></i>' : r && c ? c : flags.has(i) ? '<i class="fa-solid fa-flag" style="color:#F43F5E;font-size:.85em"></i>' : ''}</button>`;
        }).join('')}
      </div>`;
      api.bottom.innerHTML = `
        <button class="btn btn-sm ${flagMode?'btn-primary':'btn-glass'}" id="ms-flag"><i class="fa-solid fa-flag"></i> Flag Mode ${flagMode?'ON':'OFF'}</button>`;
      $('#ms-flag').onclick = () => { flagMode = !flagMode; render(); };
      api.main.querySelectorAll('.tile').forEach(t => t.onclick = () => {
        if (api.isPaused() || done) return;
        const i = +t.dataset.i;
        if (revealed.has(i)) return;
        if (flagMode){
          flags.has(i) ? flags.delete(i) : flags.add(i);
          api.hud.set('mines','fa-bomb', MINES - flags.size);
          render(); return;
        }
        if (!started){ started = true; plant(i); }
        if (mines.has(i)){
          done = true;
          mines.forEach(m => revealed.add(m));
          render();
          const score = Math.max(10, Math.round((revealed.size - MINES) * 8));
          setTimeout(() => api.finish({ score, greatAt: 300, eliteAt: 440 }), 900);
          return;
        }
        reveal(i);
        if (revealed.size === N*N - MINES){
          done = true;
          render();
          const secs = (Date.now()-t0)/1000;
          const score = Math.max(60, Math.round(600 - secs*2.5));
          setTimeout(() => api.finish({ score, perfect: true, greatAt: 380, eliteAt: 500 }), 600);
          return;
        }
        render();
      });
    }
    render();
  };

  /* ---------- TOWER OF HANOI ---------- */
  E['hanoi'] = function(api){
    const DISCS = 5;
    let towers = [[5,4,3,2,1],[],[]], held = null, moves = 0;
    const minMoves = Math.pow(2, DISCS) - 1;
    api.hud.set('moves','fa-arrows-left-right', 0);
    const DC = ['#2E7CF6','#7C3AED','#EC4899','#F97316','#FACC15'];
    function render(){
      api.main.innerHTML = `<div style="width:min(94vw,560px)">
        <div class="tc dim mb-4" style="font-size:12px;letter-spacing:.06em">MOVE ALL DISCS TO THE RIGHT TOWER · MIN ${minMoves} MOVES</div>
        <div class="flex gap-3" style="height:min(46vh,300px)">
          ${towers.map((tw,ti) => `
            <button data-t="${ti}" aria-label="Tower ${ti+1}" style="flex:1;position:relative;background:${held !== null && held.from === ti ? 'rgba(46,124,246,.08)' : 'rgba(255,255,255,.03)'};border:1px solid rgba(255,255,255,${held!==null?'0.18':'0.06'});border-radius:16px;display:flex;flex-direction:column-reverse;align-items:center;padding:12px 6px;gap:5px;cursor:pointer;transition:all .2s">
              <div style="position:absolute;top:10%;bottom:14px;width:5px;background:rgba(255,255,255,.08);border-radius:3px"></div>
              ${tw.map((d,di) => {
                const isHeld = held && held.from === ti && di === tw.length-1;
                return `<div style="width:${28+d*13}%;height:20px;border-radius:8px;background:${DC[d-1]};box-shadow:0 3px 10px rgba(0,0,0,.4)${isHeld ? ',0 0 20px '+DC[d-1] : ''};z-index:1;transition:all .2s;${isHeld?'transform:translateY(-10px);':''}"></div>`;
              }).join('')}
            </button>`).join('')}
        </div></div>`;
      api.main.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
        if (api.isPaused()) return;
        const ti = +b.dataset.t;
        if (held === null){
          if (towers[ti].length){ held = { from: ti, disc: towers[ti][towers[ti].length-1] }; render(); }
          return;
        }
        if (held.from === ti){ held = null; render(); return; }
        const top = towers[ti][towers[ti].length-1];
        if (top === undefined || top > held.disc){
          towers[held.from].pop();
          towers[ti].push(held.disc);
          moves++;
          api.hud.set('moves','fa-arrows-left-right', moves);
          held = null;
          if (towers[2].length === DISCS){
            const score = Math.max(60, Math.round(1000 * minMoves / moves));
            setTimeout(() => api.finish({ score, perfect: moves === minMoves, greatAt: 700, eliteAt: 950, extra: [['Moves', moves]] }), 400);
            return;
          }
          render();
        } else {
          b.style.borderColor = 'rgba(244,63,94,.6)';
          setTimeout(render, 250);
        }
      });
    }
    render();
  };

  /* ---------- SLIDING PUZZLE ---------- */
  E['sliding-puzzle'] = function(api){
    const N = 4;
    let tiles;
    // generate solvable shuffle by random moves from solved
    tiles = [...Array(15).keys()].map(i => i+1).concat(0);
    let gap = 15;
    for (let k=0;k<300;k++){
      const y = Math.floor(gap/N), x = gap%N;
      const opts = [];
      if (y>0) opts.push(gap-N); if (y<N-1) opts.push(gap+N);
      if (x>0) opts.push(gap-1); if (x<N-1) opts.push(gap+1);
      const pick = opts[Math.floor(Math.random()*opts.length)];
      [tiles[gap], tiles[pick]] = [tiles[pick], tiles[gap]];
      gap = pick;
    }
    let moves = 0;
    const t0 = Date.now();
    api.hud.set('moves','fa-arrows-up-down-left-right', 0);
    function solved(){ return tiles.every((v,i) => (i === 15 ? v === 0 : v === i+1)); }
    function render(){
      api.main.innerHTML = `<div class="board" style="grid-template-columns:repeat(4,1fr);width:min(90vw,420px,58vh)">
        ${tiles.map((v,i) => v === 0
          ? `<div style="aspect-ratio:1"></div>`
          : `<button class="tile" data-i="${i}" style="font-size:clamp(18px,5vw,26px);${v === i+1 ? 'background:var(--accent-soft);border-color:rgba(46,124,246,.35);color:var(--accent);' : ''}">${v}</button>`
        ).join('')}
      </div>`;
      api.main.querySelectorAll('.tile').forEach(t => t.onclick = () => {
        if (api.isPaused()) return;
        const i = +t.dataset.i;
        const g = tiles.indexOf(0);
        const adj = (Math.abs(i-g) === 1 && Math.floor(i/N) === Math.floor(g/N)) || Math.abs(i-g) === N;
        if (adj){
          [tiles[i], tiles[g]] = [tiles[g], tiles[i]];
          moves++;
          api.hud.set('moves','fa-arrows-up-down-left-right', moves);
          if (solved()){
            const secs = (Date.now()-t0)/1000;
            const score = Math.max(60, Math.round(2200 - moves*6 - secs*2));
            render();
            setTimeout(() => api.finish({ score, greatAt: 1100, eliteAt: 1650, extra: [['Moves', moves]] }), 400);
            return;
          }
          render();
        }
      });
    }
    render();
  };

  /* ---------- MAZE ---------- */
  E['maze'] = function(api){
    const N = 11; // odd
    // recursive backtracker
    const walls = [...Array(N)].map(() => Array(N).fill(1));
    function carve(y, x){
      walls[y][x] = 0;
      shuffle([[0,-2],[0,2],[-2,0],[2,0]]).forEach(([dy,dx]) => {
        const ny = y+dy, nx = x+dx;
        if (ny>0 && ny<N-1 && nx>0 && nx<N-1 && walls[ny][nx]){
          walls[y+dy/2][x+dx/2] = 0;
          carve(ny, nx);
        }
      });
    }
    carve(1,1);
    let py = 1, px = 1, steps = 0;
    const goal = [N-2, N-2];
    walls[goal[0]][goal[1]] = 0;
    const t0 = Date.now();
    api.hud.set('steps','fa-shoe-prints', 0);
    function render(){
      api.main.innerHTML = `<div class="board" style="grid-template-columns:repeat(${N},1fr);width:min(92vw,480px,64vh);gap:2px">
        ${walls.flatMap((row,y) => row.map((w,x) => {
          const isP = y===py && x===px, isG = y===goal[0] && x===goal[1];
          return `<div style="aspect-ratio:1;border-radius:4px;background:${w ? 'var(--surface-2)' : isP ? 'var(--accent)' : isG ? 'rgba(52,211,153,.85)' : 'rgba(255,255,255,.025)'};${isP?'box-shadow:0 0 16px var(--accent-glow);':''}${isG&&!isP?'box-shadow:0 0 16px rgba(52,211,153,.5);':''}transition:background .12s"></div>`;
        })).join('')}
      </div>`;
    }
    function move(dy,dx){
      const ny = py+dy, nx = px+dx;
      if (ny<0||ny>=N||nx<0||nx>=N||walls[ny][nx]) return;
      py = ny; px = nx; steps++;
      api.hud.set('steps','fa-shoe-prints', steps);
      render();
      if (py===goal[0] && px===goal[1]){
        const secs = (Date.now()-t0)/1000;
        const score = Math.max(50, Math.round(1400 - steps*4 - secs*3));
        setTimeout(() => api.finish({ score, greatAt: 800, eliteAt: 1100, extra: [['Steps', steps]] }), 300);
      }
    }
    const keyHandler = e => {
      if (api.isPaused()) return;
      const map = { ArrowLeft:[0,-1], ArrowRight:[0,1], ArrowUp:[-1,0], ArrowDown:[1,0], a:[0,-1], d:[0,1], w:[-1,0], s:[1,0] };
      if (map[e.key]){ e.preventDefault(); move(...map[e.key]); }
    };
    document.addEventListener('keydown', keyHandler);
    api.onCleanup(() => document.removeEventListener('keydown', keyHandler));
    let ts = null;
    api.main.addEventListener('touchstart', e => { ts = [e.touches[0].clientX, e.touches[0].clientY]; }, {passive:true});
    api.main.addEventListener('touchend', e => {
      if (!ts || api.isPaused()) return;
      const dx = e.changedTouches[0].clientX - ts[0], dy = e.changedTouches[0].clientY - ts[1];
      if (Math.max(Math.abs(dx),Math.abs(dy)) > 24)
        Math.abs(dx) > Math.abs(dy) ? move(0, dx>0?1:-1) : move(dy>0?1:-1, 0);
      ts = null;
    }, {passive:true});
    api.bottom.innerHTML = `<div class="dim" style="font-size:12px"><i class="fa-solid fa-hand-pointer"></i> Swipe or arrow keys · reach the green exit</div>`;
    render();
  };

  /* ---------- MENTAL ROTATION ---------- */
  E['mental-rotation'] = function(api){
    let score = 0, correct = 0, total = 0, timeLeft = 45;
    api.hud.set('score','fa-star',0);
    api.hud.set('time','fa-stopwatch',timeLeft);
    const int = setInterval(() => {
      if (api.isPaused()) return;
      timeLeft--;
      api.hud.set('time','fa-stopwatch',timeLeft);
      if (timeLeft<=0){ clearInterval(int); api.finish({ score, accuracy: total?correct/total*100:0, greatAt: 200, eliteAt: 360 }); }
    }, 1000);
    api.onCleanup(() => clearInterval(int));
    const SHAPES = [
      'M0-32 L20 8 L8 8 L8 30 L-8 30 L-8 8 L-20 8 Z',
      'M-24-24 L24-24 L24 0 L0 0 L0 24 L-24 24 Z',
      'M-26 20 L0-30 L26 20 L10 20 L10 30 L-10 30 L-10 20 Z',
      'M-28-8 L8-8 L8-28 L28-28 L28 12 L-8 12 L-8 28 L-28 28 Z',
    ];
    function draw(){
      const shape = SHAPES[Math.floor(Math.random()*SHAPES.length)];
      const mirror = Math.random() < 0.5;
      const rot = 40 + Math.floor(Math.random()*280);
      api.main.innerHTML = `<div class="tc" style="width:min(92vw,460px)">
        <div class="flex gap-4 jcc mb-5">
          <div class="panel" style="width:46%;aspect-ratio:1;display:grid;place-items:center;padding:10px">
            <svg viewBox="-40 -40 80 80" style="width:85%"><path d="${shape}" fill="#2E7CF6" fill-opacity=".9"/></svg>
          </div>
          <div class="panel" style="width:46%;aspect-ratio:1;display:grid;place-items:center;padding:10px">
            <svg viewBox="-40 -40 80 80" style="width:85%"><g transform="rotate(${rot}) ${mirror?'scale(-1,1)':''}"><path d="${shape}" fill="#34D399" fill-opacity=".9"/></g></svg>
          </div>
        </div>
        <div class="flex gap-3 jcc">
          <button class="btn btn-glass" data-m="0" style="flex:1;max-width:180px"><i class="fa-solid fa-rotate"></i> SAME</button>
          <button class="btn btn-glass" data-m="1" style="flex:1;max-width:180px"><i class="fa-solid fa-left-right"></i> MIRROR</button>
        </div>
        <div class="dim mt-4" style="font-size:12px">Is the green shape a rotation of the blue — or a mirror image?</div>
      </div>`;
      api.main.querySelectorAll('[data-m]').forEach(b => b.onclick = () => {
        if (api.isPaused()) return;
        total++;
        if ((+b.dataset.m === 1) === mirror){ correct++; score += 15; NP.burst(b,'#34D399',6); }
        else { score = Math.max(0, score-6); b.classList.add('wrong'); }
        api.hud.set('score','fa-star',score);
        setTimeout(draw, 220);
      });
    }
    draw();
  };

  /* ---------- WORD GUESS ---------- */
  E['word-guess'] = function(api){
    const WORDS = ['BRAIN','LOGIC','FOCUS','SPARK','QUICK','THINK','SOLVE','LEARN','SMART','SIGHT','SOUND','TRAIN','POWER','FLAME','CHESS','PIXEL','NEURO','SHARP','SPEED','STORM','LIGHT','DREAM','SENSE','GRAPH','PRIME'];
    const answer = WORDS[Math.floor(Math.random()*WORDS.length)];
    let row = 0, cur = '';
    const grid = [...Array(6)].map(() => Array(5).fill(''));
    const states = [...Array(6)].map(() => Array(5).fill(''));
    const keyState = {};
    api.hud.set('try','fa-lightbulb','1/6');
    function evaluate(guess){
      const res = Array(5).fill('absent');
      const rem = {};
      for (let i=0;i<5;i++){ if (guess[i] === answer[i]) res[i] = 'hit'; else rem[answer[i]] = (rem[answer[i]]||0)+1; }
      for (let i=0;i<5;i++){ if (res[i] !== 'hit' && rem[guess[i]]){ res[i] = 'near'; rem[guess[i]]--; } }
      return res;
    }
    function render(){
      const KB = ['QWERTYUIOP','ASDFGHJKL','⏎ZXCVBNM⌫'];
      api.main.innerHTML = `<div style="width:min(92vw,400px)">
        <div class="board" style="grid-template-columns:repeat(5,1fr);width:min(78vw,310px);margin:0 auto 22px;gap:6px">
          ${grid.flatMap((r,ri) => r.map((ch,ci) => {
            const st = states[ri][ci];
            const bg = st === 'hit' ? 'background:#2E9E6B;border-color:#2E9E6B;color:#fff;' : st === 'near' ? 'background:#B8952E;border-color:#B8952E;color:#fff;' : st === 'absent' ? 'background:var(--surface-1);color:var(--text-low);' : ch ? 'border-color:rgba(255,255,255,.3);' : '';
            return `<div class="tile ${st?'flip':''}" style="cursor:default;font-size:clamp(17px,4.6vw,24px);border-radius:8px;${bg}">${ch}</div>`;
          })).join('')}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:center">
          ${KB.map(rw => `<div style="display:flex;gap:5px;justify-content:center;width:100%">
            ${[...rw].map(k => {
              const ks = keyState[k];
              const bg = ks === 'hit' ? '#2E9E6B' : ks === 'near' ? '#B8952E' : ks === 'absent' ? 'rgba(255,255,255,.03)' : 'var(--surface-2)';
              const col = ks === 'absent' ? 'var(--text-low)' : '#fff';
              return `<button data-k="${k}" style="flex:${k==='⏎'||k==='⌫'?1.5:1};min-width:0;padding:13px 0;border-radius:8px;background:${bg};color:${col};font-family:var(--font-display);font-weight:700;font-size:${k==='⏎'||k==='⌫'?'15px':'14px'};border:1px solid rgba(255,255,255,.05)">${k}</button>`;
            }).join('')}
          </div>`).join('')}
        </div>
      </div>`;
      api.main.querySelectorAll('[data-k]').forEach(b => b.onclick = () => press(b.dataset.k));
    }
    function press(k){
      if (api.isPaused() || row >= 6) return;
      if (k === '⌫'){ cur = cur.slice(0,-1); }
      else if (k === '⏎'){
        if (cur.length !== 5) return;
        const res = evaluate(cur);
        res.forEach((st,i) => {
          states[row][i] = st;
          const prev = keyState[cur[i]];
          if (st === 'hit' || (st === 'near' && prev !== 'hit') || (!prev && st === 'absent')) keyState[cur[i]] = st;
        });
        if (cur === answer){
          render();
          const score = Math.max(80, (7 - (row+1)) * 140);
          setTimeout(() => api.finish({ score, perfect: row === 0, greatAt: 420, eliteAt: 700, extra: [['Guesses', row+1]] }), 700);
          row = 6;
          return;
        }
        row++; cur = '';
        api.hud.set('try','fa-lightbulb', `${Math.min(row+1,6)}/6`);
        if (row >= 6){
          render();
          NP.toast(`The word was ${answer}`, 'fa-book');
          setTimeout(() => api.finish({ score: 30, greatAt: 420, eliteAt: 700, extra: [['Word', answer]] }), 1300);
          return;
        }
      }
      else if (cur.length < 5 && /^[A-Z]$/.test(k)) cur += k;
      grid[row] = [...cur.padEnd(5,' ')].map(c => c.trim());
      render();
    }
    const keyHandler = e => {
      if (e.key === 'Enter') press('⏎');
      else if (e.key === 'Backspace') press('⌫');
      else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toUpperCase());
    };
    document.addEventListener('keydown', keyHandler);
    api.onCleanup(() => document.removeEventListener('keydown', keyHandler));
    render();
  };

  /* ---------- ANAGRAM ---------- */
  E['anagram'] = function(api){
    const WORDS = ['PLANET','MEMORY','GARDEN','SILVER','ROCKET','PUZZLE','WISDOM','ORANGE','CASTLE','BREEZE','MARBLE','THRONE','KNIGHT','SPIRIT','FOREST','CIRCUS','VELVET','SHADOW','CRYSTAL','THUNDER'];
    let score = 0, solved = 0, timeLeft = 60, cur = null, picked = [];
    api.hud.set('score','fa-star',0);
    api.hud.set('time','fa-stopwatch',timeLeft);
    const int = setInterval(() => {
      if (api.isPaused()) return;
      timeLeft--;
      api.hud.set('time','fa-stopwatch',timeLeft);
      if (timeLeft<=0){ clearInterval(int); api.finish({ score, greatAt: 250, eliteAt: 450, extra: [['Words', solved]] }); }
    }, 1000);
    api.onCleanup(() => clearInterval(int));
    function newWord(){
      cur = WORDS[Math.floor(Math.random()*WORDS.length)];
      picked = [];
      let scr = shuffle([...cur]);
      if (scr.join('') === cur) scr = shuffle([...cur]);
      draw(scr);
    }
    function draw(letters){
      api.main.innerHTML = `<div class="tc" style="width:min(92vw,480px)">
        <div class="flex gap-2 jcc mb-5" style="min-height:56px" id="an-slots">
          ${[...cur].map((_,i) => `<div class="tile" style="width:46px;height:52px;aspect-ratio:auto;font-size:22px;cursor:default;${picked[i]?'background:var(--accent-soft);border-color:rgba(46,124,246,.4);color:var(--accent);':''}">${picked[i]||''}</div>`).join('')}
        </div>
        <div class="flex gap-2 jcc wrap mb-5" id="an-pool">
          ${letters.map((ch,i) => `<button class="tile" data-i="${i}" data-ch="${ch}" style="width:52px;height:58px;aspect-ratio:auto;font-size:24px;${picked.includes(ch+'#'+i)?'opacity:.2;pointer-events:none;':''}">${ch}</button>`).join('')}
        </div>
        <div class="flex gap-3 jcc">
          <button class="btn btn-sm btn-ghost" id="an-clear"><i class="fa-solid fa-eraser"></i> Clear</button>
          <button class="btn btn-sm btn-ghost" id="an-shuffle"><i class="fa-solid fa-shuffle"></i> Shuffle</button>
          <button class="btn btn-sm btn-ghost" id="an-skip"><i class="fa-solid fa-forward"></i> Skip</button>
        </div>
      </div>`;
      const pool = [...api.main.querySelectorAll('#an-pool .tile')];
      pool.forEach(b => b.onclick = () => {
        if (api.isPaused()) return;
        picked.push(b.dataset.ch + '#' + b.dataset.i);
        b.style.opacity = '.2'; b.style.pointerEvents = 'none';
        renderSlots();
        if (picked.length === cur.length){
          const word = picked.map(p => p[0]).join('');
          if (word === cur){
            solved++;
            score += cur.length * 12;
            api.hud.set('score','fa-star',score);
            NP.burst($('#an-slots'), '#FACC15', 10);
            setTimeout(newWord, 450);
          } else {
            $('#an-slots').querySelectorAll('.tile').forEach(t => t.classList.add('wrong'));
            setTimeout(() => { picked = []; draw(letters); }, 550);
          }
        }
      });
      function renderSlots(){
        const slots = $('#an-slots').querySelectorAll('.tile');
        slots.forEach((s,i) => {
          const p = picked[i];
          s.textContent = p ? p[0] : '';
          if (p){ s.style.background = 'var(--accent-soft)'; s.style.borderColor = 'rgba(46,124,246,.4)'; s.style.color = 'var(--accent)'; }
        });
      }
      $('#an-clear').onclick = () => { picked = []; draw(letters); };
      $('#an-shuffle').onclick = () => { picked = []; draw(shuffle(letters.slice())); };
      $('#an-skip').onclick = () => { score = Math.max(0, score - 5); api.hud.set('score','fa-star',score); newWord(); };
    }
    newWord();
  };

  /* ---------- TAP RACE ---------- */
  E['tap-race'] = function(api){
    let score = 0, hits = 0, timeLeft = 30;
    api.hud.set('score','fa-star',0);
    api.hud.set('time','fa-stopwatch',timeLeft);
    const int = setInterval(() => {
      if (api.isPaused()) return;
      timeLeft--;
      api.hud.set('time','fa-stopwatch',timeLeft);
      if (timeLeft<=0){ clearInterval(int); api.finish({ score, greatAt: 300, eliteAt: 500, extra: [['Hits', hits]] }); }
    }, 1000);
    api.onCleanup(() => clearInterval(int));
    api.main.innerHTML = `<div id="tr-arena" style="position:relative;width:min(94vw,560px);height:min(62vh,480px);background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:24px;overflow:hidden;cursor:crosshair"></div>`;
    const arena = $('#tr-arena');
    function spawn(){
      const old = arena.querySelector('.tr-t');
      if (old) old.remove();
      const size = Math.max(38, 76 - hits * 1.2);
      const x = Math.random() * (arena.clientWidth - size), y = Math.random() * (arena.clientHeight - size);
      const t = document.createElement('button');
      t.className = 'tr-t';
      t.setAttribute('aria-label','target');
      t.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:radial-gradient(circle at 35% 35%, #FF7A94, #F43F5E);box-shadow:0 0 26px rgba(244,63,94,.5);animation:tilePop .25s var(--ease)`;
      t.onclick = e => {
        e.stopPropagation();
        if (api.isPaused()) return;
        hits++;
        score += 10 + Math.max(0, Math.round((76-size)/4));
        api.hud.set('score','fa-star',score);
        NP.burst(t, '#F43F5E', 6);
        spawn();
      };
      arena.appendChild(t);
    }
    arena.onclick = () => {
      if (api.isPaused()) return;
      score = Math.max(0, score - 3);
      api.hud.set('score','fa-star',score);
    };
    spawn();
  };

  /* ---------- SEQUENCE PREDICTION ---------- */
  E['seq-predict'] = function(api){
    let score = 0, streak = 0, solved = 0, timeLeft = 60;
    api.hud.set('score','fa-star',0);
    api.hud.set('time','fa-stopwatch',timeLeft);
    const int = setInterval(() => {
      if (api.isPaused()) return;
      timeLeft--;
      api.hud.set('time','fa-stopwatch',timeLeft);
      if (timeLeft<=0){ clearInterval(int); api.finish({ score, greatAt: 220, eliteAt: 400, extra: [['Solved', solved]] }); }
    }, 1000);
    api.onCleanup(() => clearInterval(int));
    function gen(){
      const r = n => Math.floor(Math.random()*n);
      const kind = r(4);
      let seq = [], ans;
      if (kind === 0){ // arithmetic
        const a = r(12)+1, d = r(9)+2;
        seq = [a, a+d, a+2*d, a+3*d]; ans = a+4*d;
      } else if (kind === 1){ // geometric
        const a = r(4)+1, m = r(2)+2;
        seq = [a, a*m, a*m*m, a*m*m*m]; ans = a*Math.pow(m,4);
      } else if (kind === 2){ // squares/fib-like
        const a = r(5)+1, b = r(5)+2;
        seq = [a, b, a+b, a+2*b]; ans = 2*a+3*b;
      } else { // alternating
        const a = r(10)+2, d1 = r(6)+2, d2 = r(4)+1;
        seq = [a, a+d1, a+d1-d2, a+2*d1-d2]; ans = a+2*d1-2*d2;
      }
      const opts = new Set([ans]);
      while (opts.size < 4) opts.add(Math.max(0, ans + (r(2)?1:-1)*(r(Math.max(3,Math.round(ans*0.2)))+1)));
      return { seq, ans, opts: shuffle([...opts]) };
    }
    function draw(){
      const q = gen();
      api.main.innerHTML = `<div class="tc" style="width:min(92vw,480px)">
        <div class="flex gap-3 jcc aic mb-6 wrap">
          ${q.seq.map(v => `<div class="tile" style="min-width:62px;height:62px;aspect-ratio:auto;padding:0 12px;font-size:22px;cursor:default">${v}</div>`).join('')}
          <div class="tile" style="min-width:62px;height:62px;aspect-ratio:auto;font-size:24px;cursor:default;border:2px dashed rgba(129,140,248,.5);background:rgba(129,140,248,.08);color:#818CF8">?</div>
        </div>
        <div class="board" style="grid-template-columns:repeat(2,1fr);width:min(80vw,340px);margin:0 auto;gap:12px">
          ${q.opts.map(o => `<button class="tile" data-a="${o}" style="aspect-ratio:auto;padding:18px;font-size:22px">${o}</button>`).join('')}
        </div></div>`;
      api.main.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
        if (api.isPaused()) return;
        if (+b.dataset.a === q.ans){
          streak++; solved++;
          score += 14 * (1 + Math.min(2, Math.floor(streak/4)));
          b.classList.add('match');
          api.hud.set('score','fa-star',score);
          setTimeout(draw, 200);
        } else { streak = 0; score = Math.max(0, score-6); b.classList.add('wrong'); api.hud.set('score','fa-star',score); }
      });
    }
    draw();
  };

  /* ---------- ALTERNATE USES ---------- */
  E['alt-uses'] = function(api){
    const OBJECTS = ['a brick','a paperclip','a spoon','an old newspaper','a rubber band','a coffee mug','a shoelace','a cardboard box'];
    const obj = OBJECTS[Math.floor(Math.random()*OBJECTS.length)];
    const ideas = [];
    let timeLeft = 90;
    api.hud.set('ideas','fa-lightbulb',0);
    api.hud.set('time','fa-stopwatch',timeLeft);
    const int = setInterval(() => {
      if (api.isPaused()) return;
      timeLeft--;
      api.hud.set('time','fa-stopwatch',timeLeft);
      if (timeLeft<=0){
        clearInterval(int);
        const lengthBonus = ideas.reduce((a,b) => a + Math.min(20, b.length), 0);
        const score = ideas.length * 30 + Math.round(lengthBonus/2);
        api.finish({ score, greatAt: 180, eliteAt: 330, extra: [['Ideas', ideas.length]] });
      }
    }, 1000);
    api.onCleanup(() => clearInterval(int));
    api.main.innerHTML = `<div style="width:min(92vw,480px)">
      <div class="tc mb-5">
        <div class="eyebrow mb-2" style="color:var(--cat-creativity)">Divergent Thinking</div>
        <h2 style="font-size:clamp(20px,4.6vw,28px)">Unusual uses for<br><span style="color:var(--cat-creativity)">${obj}</span></h2>
      </div>
      <div class="flex gap-2 mb-4">
        <input id="au-in" autocomplete="off" placeholder="Type an idea…" aria-label="Your idea"
          style="flex:1;background:var(--surface-1);border:1px solid rgba(255,255,255,.12);border-radius:100px;padding:14px 20px;color:#fff;font-size:15px;outline:none;min-width:0">
        <button class="btn btn-primary btn-sm" id="au-add" style="min-height:48px">Add</button>
      </div>
      <div id="au-list" style="display:flex;flex-direction:column;gap:8px;max-height:34vh;overflow-y:auto"></div>
    </div>`;
    const inp = $('#au-in'); inp.focus();
    function add(){
      const v = inp.value.trim();
      if (v.length < 3) return;
      if (ideas.some(i => i.toLowerCase() === v.toLowerCase())){ NP.toast('Already listed!','fa-circle-exclamation'); return; }
      ideas.push(v);
      api.hud.set('ideas','fa-lightbulb',ideas.length);
      const d = document.createElement('div');
      d.className = 'xp-row';
      d.style.animationDelay = '0s';
      d.innerHTML = `<span class="cat-dot" style="background:var(--cat-creativity)"></span><span style="flex:1;font-size:14px">${NP.esc(v)}</span><span class="xr-xp" style="color:var(--cat-creativity);font-size:13px">+30</span>`;
      $('#au-list').prepend(d);
      inp.value = '';
      inp.focus();
    }
    $('#au-add').onclick = add;
    inp.onkeydown = e => { if (e.key === 'Enter') add(); };
  };
})();
