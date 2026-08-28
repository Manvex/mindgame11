/* ============================================================
   NEUROPLAY — Store: persistent user state, XP, streaks, daily mix
   ============================================================ */
(function(){
  const KEY = 'neuroplay:v1';

  const defaults = () => ({
    onboarded: false,
    profile: { name: 'Player', goal: 'everything', session: '5', style: 'balanced' },
    xp: 0,
    skillXp: {},          // {cat: xp}
    saved: [],            // game ids
    recent: [],           // [{id, at, score}]
    best: {},             // {gameId: bestScore}
    playCount: {},        // {gameId: n}
    streak: { current: 0, best: 0, lastDay: null, days: [] }, // days: ISO dates played
    dailyMix: { date: null, games: [], done: [] },
    stats: { gamesPlayed: 0, totalTimeSec: 0, perfectRuns: 0, bestReaction: 0, mixCompleted: 0 },
    flags: {},
    unlocked: [],         // achievement ids
    weekly: {},           // {isoDate: xpEarnedThatDay}
    searches: [],
  });

  let S = load();

  function load(){
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      const d = defaults();
      const s = JSON.parse(raw);
      // deep-ish merge for forward compat
      return Object.assign(d, s, {
        profile: Object.assign(d.profile, s.profile),
        streak: Object.assign(d.streak, s.streak),
        dailyMix: Object.assign(d.dailyMix, s.dailyMix),
        stats: Object.assign(d.stats, s.stats),
        flags: Object.assign(d.flags, s.flags),
      });
    } catch(e){ return defaults(); }
  }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }

  function today(){ return new Date().toISOString().slice(0,10); }

  /* seeded PRNG for stable daily mix */
  function seededRand(seed){
    let h = 2166136261;
    for (let i=0;i<seed.length;i++){ h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function(){
      h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5;
      return ((h >>> 0) % 100000) / 100000;
    };
  }

  function ensureDailyMix(){
    const d = today();
    if (S.dailyMix.date === d && S.dailyMix.games.length === 5) return S.dailyMix;
    const rnd = seededRand('mix-' + d);
    const cats = ['memory','logic','focus','creativity','relax'];
    const games = cats.map(cat => {
      const pool = NP.GAMES.filter(g => g.cat === cat);
      const playable = pool.filter(g => g.playable);
      const pick = (playable.length && rnd() < 0.8) ? playable : pool;
      return pick[Math.floor(rnd() * pick.length)].id;
    });
    S.dailyMix = { date: d, games, done: [] };
    save();
    return S.dailyMix;
  }

  function touchStreak(){
    const d = today();
    if (S.streak.lastDay === d) return;
    const yest = new Date(Date.now() - 864e5).toISOString().slice(0,10);
    S.streak.current = (S.streak.lastDay === yest) ? S.streak.current + 1 : 1;
    S.streak.best = Math.max(S.streak.best, S.streak.current);
    S.streak.lastDay = d;
    if (!S.streak.days.includes(d)) S.streak.days.push(d);
    if (S.streak.days.length > 90) S.streak.days = S.streak.days.slice(-90);
    save();
  }

  function checkAchievements(){
    const newly = [];
    NP.ACHIEVEMENTS.forEach(a => {
      if (!S.unlocked.includes(a.id) && a.check(S)){
        S.unlocked.push(a.id);
        newly.push(a);
      }
    });
    if (newly.length) save();
    return newly;
  }

  /* Record a completed game session. Returns summary for results screen. */
  function recordResult({ gameId, score, timeSec, perfect, reactionMs, accuracy }){
    const game = NP.GAME_INDEX[gameId];
    const cat = game.cat;
    const prevBest = S.best[gameId] || 0;
    const isPB = score > prevBest;
    if (isPB) S.best[gameId] = score;

    // XP: base by difficulty, scaled a bit by performance
    const baseXp = game.xp;
    const perfBonus = perfect ? Math.round(baseXp * 0.4) : 0;
    const pbBonus = isPB && prevBest > 0 ? 15 : 0;
    const mainXp = baseXp + perfBonus + pbBonus;

    // skill xp distribution: primary cat + small spillover
    const spill = { logic:'pattern', memory:'focus', focus:'speed', creativity:'language',
      pattern:'logic', math:'logic', spatial:'pattern', language:'memory', relax:'focus', speed:'focus' };
    const rows = [
      { cat, xp: mainXp },
      { cat: spill[cat] || 'focus', xp: Math.round(mainXp * 0.35) },
    ];
    rows.forEach(r => { S.skillXp[r.cat] = (S.skillXp[r.cat] || 0) + r.xp; });

    const before = NP.levelForXp(S.xp);
    const totalXp = rows.reduce((a,b) => a + b.xp, 0);
    S.xp += totalXp;
    const after = NP.levelForXp(S.xp);

    // stats
    S.stats.gamesPlayed++;
    S.stats.totalTimeSec += Math.round(timeSec || 0);
    if (perfect) S.stats.perfectRuns++;
    if (reactionMs && (S.stats.bestReaction === 0 || reactionMs < S.stats.bestReaction)) S.stats.bestReaction = reactionMs;
    if (cat === 'speed' && score >= 500) S.flags.speed500 = true;
    const hr = new Date().getHours();
    if (hr >= 0 && hr < 5) S.flags.nightOwl = true;
    if (hr >= 4 && hr < 8) S.flags.earlyBird = true;

    // recents
    S.recent = S.recent.filter(r => r.id !== gameId);
    S.recent.unshift({ id: gameId, at: Date.now(), score });
    S.recent = S.recent.slice(0, 12);
    S.playCount[gameId] = (S.playCount[gameId] || 0) + 1;

    // weekly xp
    const d = today();
    S.weekly[d] = (S.weekly[d] || 0) + totalXp;
    const keys = Object.keys(S.weekly).sort();
    if (keys.length > 60) keys.slice(0, keys.length - 60).forEach(k => delete S.weekly[k]);

    // daily mix
    ensureDailyMix();
    let mixDone = false;
    if (S.dailyMix.games.includes(gameId) && !S.dailyMix.done.includes(gameId)){
      S.dailyMix.done.push(gameId);
      if (S.dailyMix.done.length === 5){ S.stats.mixCompleted++; S.xp += 50; S.weekly[d] += 50; mixDone = true; }
    }

    touchStreak();
    save();
    const newAch = checkAchievements();

    return { xpRows: rows, totalXp, isPB, levelUp: after.level > before.level, level: after, newAch, mixDone };
  }

  function skillScore(cat){
    // 0-1000 scale derived from skill xp with diminishing returns
    const xp = S.skillXp[cat] || 0;
    return Math.min(1000, Math.round(320 * Math.log2(1 + xp / 90)));
  }
  function brainScore(){
    const cats = Object.keys(NP.CATEGORIES);
    const scores = cats.map(skillScore);
    const avg = scores.reduce((a,b)=>a+b,0) / cats.length;
    const breadth = scores.filter(s => s > 0).length / cats.length;
    return Math.round(avg * (0.7 + 0.3 * breadth));
  }

  function strongestCats(n=3){
    return Object.keys(NP.CATEGORIES)
      .map(c => ({ cat: c, s: skillScore(c) }))
      .sort((a,b) => b.s - a.s).slice(0, n);
  }
  function weakestCats(n=3){
    return Object.keys(NP.CATEGORIES)
      .map(c => ({ cat: c, s: skillScore(c) }))
      .sort((a,b) => a.s - b.s).slice(0, n);
  }

  function toggleSave(id){
    const i = S.saved.indexOf(id);
    if (i >= 0) S.saved.splice(i, 1); else S.saved.push(id);
    save();
    checkAchievements();
    return S.saved.includes(id);
  }

  function addSearch(q){
    q = q.trim(); if (!q) return;
    S.searches = [q, ...S.searches.filter(x => x !== q)].slice(0, 6);
    save();
  }

  NP.store = {
    get state(){ return S; },
    save,
    ensureDailyMix, recordResult, toggleSave, addSearch, checkAchievements,
    skillScore, brainScore, strongestCats, weakestCats,
    levelInfo(){ return NP.levelForXp(S.xp); },
    completeOnboarding(profile){ S.onboarded = true; Object.assign(S.profile, profile); save(); },
    reset(){ S = defaults(); save(); },
  };
})();
