/* ============================================================
   NEUROPLAY — Procedural cinematic cover artwork (SVG)
   Every game gets unique generative art keyed to its identity.
   ============================================================ */
(function(){
  function rng(seed){
    let h = 1779033703;
    for (let i=0;i<seed.length;i++){ h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
    return function(){
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h = (h ^= h >>> 16) >>> 0;
      return h / 4294967296;
    };
  }

  function shade(hex, amt){
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 0xff) + amt, b = (n & 0xff) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  const W = 300, H = 400;

  /* motif painters: return svg inner fragments drawn on 300x400 canvas */
  const MOTIFS = {
    grid9(r, c){ // sudoku
      let s = '';
      for (let i=0;i<=6;i++){
        const w = i % 3 === 0 ? 2.5 : 1;
        s += `<line x1="${60+i*30}" y1="110" x2="${60+i*30}" y2="290" stroke="${c}" stroke-opacity="${i%3===0?0.9:0.35}" stroke-width="${w}"/>`;
        s += `<line x1="60" y1="${110+i*30}" x2="240" y2="${110+i*30}" stroke="${c}" stroke-opacity="${i%3===0?0.9:0.35}" stroke-width="${w}"/>`;
      }
      for (let i=0;i<8;i++){
        const x = 75 + Math.floor(r()*6)*30, y = 132 + Math.floor(r()*6)*30;
        s += `<text x="${x}" y="${y}" fill="#fff" fill-opacity="${0.5+r()*0.5}" font-size="17" font-family="Outfit" font-weight="700" text-anchor="middle">${1+Math.floor(r()*9)}</text>`;
      }
      return s;
    },
    n2048(r, c){
      const vals = [2,4,8,16,32,64,128,256,512,1024,2048];
      let s = '';
      for (let gy=0;gy<4;gy++) for (let gx=0;gx<4;gx++){
        if (r() < 0.3) continue;
        const v = vals[Math.floor(r()*7)+2];
        const x = 52+gx*50, y = 105+gy*50;
        s += `<rect x="${x}" y="${y}" width="44" height="44" rx="8" fill="${c}" fill-opacity="${0.14+r()*0.5}"/>`;
        s += `<text x="${x+22}" y="${y+28}" fill="#fff" fill-opacity=".85" font-size="${v>99?11:14}" font-family="Outfit" font-weight="800" text-anchor="middle">${v}</text>`;
      }
      s += `<rect x="102" y="155" width="94" height="94" rx="12" fill="${c}" fill-opacity=".9"/><text x="149" y="212" fill="#fff" font-size="28" font-family="Outfit" font-weight="900" text-anchor="middle">2048</text>`;
      return s;
    },
    mines(r, c){
      let s = '';
      for (let gy=0;gy<5;gy++) for (let gx=0;gx<5;gx++){
        const x = 62+gx*36, y = 112+gy*36;
        const t = r();
        s += `<rect x="${x}" y="${y}" width="32" height="32" rx="5" fill="${t<0.5?'#ffffff':c}" fill-opacity="${t<0.5?0.06:0.12+r()*0.25}"/>`;
        if (t > 0.75) s += `<text x="${x+16}" y="${y+22}" fill="${c}" font-size="15" font-family="Outfit" font-weight="800" text-anchor="middle">${1+Math.floor(r()*3)}</text>`;
      }
      s += `<circle cx="150" cy="200" r="22" fill="#0A0C12"/><circle cx="150" cy="200" r="16" fill="${c}"/><line x1="150" y1="176" x2="150" y2="224" stroke="${c}" stroke-width="3"/><line x1="126" y1="200" x2="174" y2="200" stroke="${c}" stroke-width="3"/>`;
      return s;
    },
    hanoi(r, c){
      let s = '';
      const px = [90, 150, 210];
      px.forEach(x => s += `<rect x="${x-3}" y="150" width="6" height="120" rx="3" fill="#fff" fill-opacity=".18"/>`);
      s += `<rect x="55" y="268" width="190" height="8" rx="4" fill="#fff" fill-opacity=".22"/>`;
      const widths = [70,58,46,34,22];
      widths.forEach((w,i) => {
        s += `<rect x="${90-w/2}" y="${252-i*17}" width="${w}" height="13" rx="6" fill="${c}" fill-opacity="${0.35+i*0.15}"/>`;
      });
      return s;
    },
    schulte(r, c){
      let s = '';
      const nums = [...Array(25)].map((_,i)=>i+1).sort(()=>r()-0.5);
      for (let gy=0;gy<5;gy++) for (let gx=0;gx<5;gx++){
        const x = 60+gx*36, y = 110+gy*36;
        const hot = nums[gy*5+gx] <= 3;
        s += `<rect x="${x}" y="${y}" width="32" height="32" rx="6" fill="${hot?c:'#ffffff'}" fill-opacity="${hot?0.85:0.05}"/>`;
        s += `<text x="${x+16}" y="${y+21}" fill="#fff" fill-opacity="${hot?1:0.55}" font-size="13" font-family="Outfit" font-weight="700" text-anchor="middle">${nums[gy*5+gx]}</text>`;
      }
      return s;
    },
    stroop(r, c){
      const words = [['BLUE','#F43F5E'],['RED','#3B82F6'],['GREEN','#FACC15'],['YELLOW','#34D399']];
      let s = '';
      words.forEach(([w,col],i) => {
        s += `<text x="150" y="${145+i*42}" fill="${col}" font-size="30" font-family="Outfit" font-weight="900" text-anchor="middle" opacity="${0.65+0.35*(i===1?1:r())}">${w}</text>`;
      });
      return s;
    },
    reaction(r, c){
      return `<circle cx="150" cy="195" r="70" fill="${c}" fill-opacity=".15"/>
        <circle cx="150" cy="195" r="52" fill="${c}" fill-opacity=".3"/>
        <circle cx="150" cy="195" r="34" fill="${c}"/>
        <path d="M143 172 L143 200 L158 195 L149 222" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    },
    simon(r, c){
      const cols = ['#34D399','#F43F5E','#FACC15','#3B82F6'];
      let s = '';
      [[85,135],[157,135],[85,207],[157,207]].forEach((p,i) => {
        s += `<rect x="${p[0]}" y="${p[1]}" width="62" height="62" rx="12" fill="${cols[i]}" fill-opacity="${i===1?0.95:0.35}"/>`;
      });
      s += `<circle cx="150" cy="200" r="20" fill="#0A0C12"/><circle cx="150" cy="200" r="14" fill="none" stroke="${c}" stroke-width="2.5"/>`;
      return s;
    },
    mmatch(r, c){
      let s = '';
      const icons = ['M-6-6h12v12h-12z','M0-8l7 14h-14z','M0-8a8 8 0 100 16 8 8 0 000-16z','M-8 0l8-8 8 8-8 8z'];
      for (let gy=0;gy<3;gy++) for (let gx=0;gx<3;gx++){
        const x = 78+gx*50, y = 130+gy*50;
        const flipped = r() < 0.4;
        s += `<rect x="${x-21}" y="${y-21}" width="42" height="42" rx="9" fill="${flipped?c:'#ffffff'}" fill-opacity="${flipped?0.28:0.07}" stroke="${c}" stroke-opacity="${flipped?0.7:0.15}" stroke-width="1.5"/>`;
        if (flipped) s += `<g transform="translate(${x},${y}) scale(1.1)"><path d="${icons[Math.floor(r()*4)]}" fill="${c}"/></g>`;
        else s += `<text x="${x}" y="${y+7}" fill="#fff" fill-opacity=".3" font-size="18" font-family="Outfit" font-weight="800" text-anchor="middle">?</text>`;
      }
      return s;
    },
    digits(r, c){
      let s = '';
      for (let i=0;i<10;i++){
        const x = 40+r()*220, y = 110+r()*190, sz = 14+r()*40, o = 0.08+r()*0.3;
        s += `<text x="${x}" y="${y}" fill="${r()<0.3?c:'#fff'}" fill-opacity="${o}" font-size="${sz}" font-family="Outfit" font-weight="800">${Math.floor(r()*10)}</text>`;
      }
      s += `<text x="150" y="215" fill="#fff" font-size="46" font-family="Outfit" font-weight="900" text-anchor="middle" opacity=".95">7 3 9 2</text>`;
      return s;
    },
    maze(r, c){
      let s = `<g stroke="${c}" stroke-width="4" stroke-linecap="round" fill="none" opacity=".8">`;
      const cell = 34;
      for (let gy=0;gy<5;gy++) for (let gx=0;gx<5;gx++){
        const x = 66+gx*cell, y = 116+gy*cell;
        if (r()<0.55) s += `<line x1="${x}" y1="${y}" x2="${x+cell-8}" y2="${y}"/>`;
        if (r()<0.55) s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y+cell-8}"/>`;
      }
      s += '</g>';
      s += `<circle cx="76" cy="128" r="8" fill="#fff"/><circle cx="228" cy="276" r="10" fill="${c}"><animate attributeName="opacity" values="1;.5;1" dur="2s" repeatCount="indefinite"/></circle>`;
      return s;
    },
    wguess(r, c){
      const rows = [['#2A3242','#2A3242',c,'#2A3242','#B8952E'],[c,c,'#2A3242',c,'#2A3242'],[c,c,c,c,c]];
      const words = ['CRANE','PLAYS','BRAIN'];
      let s = '';
      rows.forEach((row,ri) => row.forEach((col,ci) => {
        s += `<rect x="${62+ci*36}" y="${130+ri*44}" width="32" height="38" rx="6" fill="${col}" fill-opacity="${col==='#2A3242'?1:0.9}"/>`;
        s += `<text x="${78+ci*36}" y="${156+ri*44}" fill="#fff" font-size="18" font-family="Outfit" font-weight="800" text-anchor="middle">${words[ri][ci]}</text>`;
      }));
      return s;
    },
    rotation(r, c){
      const f = 'M0-30 L22 10 L8 10 L8 30 L-8 30 L-8 10 L-22 10 Z';
      return `<g transform="translate(100,190)"><path d="${f}" fill="${c}" fill-opacity=".85"/></g>
        <g transform="translate(205,205) rotate(130)"><path d="${f}" fill="#fff" fill-opacity=".22" stroke="${c}" stroke-width="2"/></g>
        <path d="M120 130 A70 70 0 0 1 195 140" stroke="${c}" stroke-opacity=".5" stroke-width="2.5" fill="none" stroke-dasharray="4 7" marker-end="none"/>
        <path d="M190 132 l8 6 l-10 4 z" fill="${c}" fill-opacity=".6"/>`;
    },
    mmath(r, c){
      let s = '';
      const ops = ['+','−','×','÷','='];
      for (let i=0;i<12;i++){
        const x = 40+r()*220, y = 110+r()*190;
        s += `<text x="${x}" y="${y}" fill="${r()<0.35?c:'#fff'}" fill-opacity="${0.07+r()*0.25}" font-size="${16+r()*30}" font-family="Outfit" font-weight="800">${ops[Math.floor(r()*5)]}</text>`;
      }
      s += `<text x="150" y="200" fill="#fff" font-size="38" font-family="Outfit" font-weight="900" text-anchor="middle">17 × 4</text>
        <text x="150" y="245" fill="${c}" font-size="26" font-family="Outfit" font-weight="800" text-anchor="middle">= ?</text>`;
      return s;
    },
    anagram(r, c){
      const L = 'LETRIS'.split('');
      let s = '';
      L.forEach((ch,i) => {
        const x = 62 + i*30 + (r()-0.5)*8, y = 190 + (r()-0.5)*36, rot = (r()-0.5)*40;
        s += `<g transform="translate(${x},${y}) rotate(${rot})"><rect x="-14" y="-16" width="28" height="32" rx="6" fill="${i%2?c:'#ffffff'}" fill-opacity="${i%2?0.75:0.1}"/><text x="0" y="7" fill="#fff" font-size="18" font-family="Outfit" font-weight="800" text-anchor="middle">${ch}</text></g>`;
      });
      return s;
    },
    zen(r, c){
      let s = '';
      for (let i=0;i<5;i++){
        s += `<circle cx="150" cy="200" r="${28+i*24}" fill="none" stroke="${c}" stroke-opacity="${0.4-i*0.07}" stroke-width="1.5"/>`;
      }
      s += `<circle cx="150" cy="200" r="16" fill="${c}" fill-opacity=".8"/>`;
      for (let i=0;i<6;i++){
        const a = i * Math.PI/3;
        s += `<circle cx="${150+Math.cos(a)*76}" cy="${200+Math.sin(a)*76}" r="5" fill="#fff" fill-opacity=".3"/>`;
      }
      return s;
    },
    sliding(r, c){
      let s = '';
      const order = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0];
      for (let gy=0;gy<4;gy++) for (let gx=0;gx<4;gx++){
        const v = order[gy*4+gx];
        if (!v) continue;
        const x = 58+gx*47, y = 108+gy*47;
        s += `<rect x="${x}" y="${y}" width="42" height="42" rx="8" fill="${v<4?c:'#ffffff'}" fill-opacity="${v<4?0.8:0.07}"/>`;
        s += `<text x="${x+21}" y="${y+27}" fill="#fff" font-size="16" font-family="Outfit" font-weight="800" text-anchor="middle">${v}</text>`;
      }
      return s;
    },
    seq(r, c){
      let s = '';
      for (let i=0;i<9;i++){
        const gx = i%3, gy = Math.floor(i/3);
        const lit = [1,4,5,8].includes(i);
        s += `<rect x="${78+gx*50}" y="${128+gy*50}" width="44" height="44" rx="10" fill="${lit?c:'#ffffff'}" fill-opacity="${lit?0.75:0.06}"/>`;
        if (lit){
          const n = [1,4,5,8].indexOf(i)+1;
          s += `<text x="${100+gx*50}" y="${156+gy*50}" fill="#fff" font-size="17" font-family="Outfit" font-weight="800" text-anchor="middle">${n}</text>`;
        }
      }
      return s;
    },
    target(r, c){
      let s = '';
      for (let gy=0;gy<5;gy++) for (let gx=0;gx<5;gx++){
        const hot = gx===3 && gy===2;
        s += `<circle cx="${70+gx*40}" cy="${120+gy*40}" r="14" fill="${c}" fill-opacity="${hot?0.95:0.22}"/>`;
      }
      return s;
    },
    taprace(r, c){
      let s = '';
      for (let i=0;i<7;i++){
        const x = 55+r()*190, y = 115+r()*180, rad = 8+r()*14;
        s += `<circle cx="${x}" cy="${y}" r="${rad}" fill="${c}" fill-opacity="${0.12+r()*0.22}"/>`;
      }
      s += `<circle cx="160" cy="195" r="34" fill="${c}"/><circle cx="160" cy="195" r="22" fill="#0A0C12"/><circle cx="160" cy="195" r="11" fill="${c}"/>`;
      return s;
    },
    vmem(r, c){
      let s = '';
      for (let gy=0;gy<4;gy++) for (let gx=0;gx<4;gx++){
        const lit = r() < 0.35;
        s += `<rect x="${66+gx*44}" y="${116+gy*44}" width="38" height="38" rx="9" fill="${lit?c:'#ffffff'}" fill-opacity="${lit?0.8:0.06}"/>`;
      }
      return s;
    },
    seqp(r, c){
      let s = '';
      [16,28,42,58].forEach((v,i) => {
        s += `<circle cx="${72+i*52}" cy="190" r="${12+i*4}" fill="${c}" fill-opacity="${0.3+i*0.18}"/>`;
        s += `<text x="${72+i*52}" y="${196}" fill="#fff" font-size="13" font-family="Outfit" font-weight="800" text-anchor="middle">${v}</text>`;
      });
      s += `<circle cx="150" cy="268" r="26" fill="none" stroke="${c}" stroke-width="2.5" stroke-dasharray="5 5"/><text x="150" y="276" fill="${c}" font-size="20" font-family="Outfit" font-weight="900" text-anchor="middle">?</text>`;
      return s;
    },
    duel(r,c){ return MOTIFS.reaction(r,c); },
    crush(r, c){
      return `<rect x="70" y="130" width="76" height="104" rx="12" transform="rotate(-8 108 182)" fill="#F43F5E" fill-opacity=".8"/>
        <text x="100" y="192" transform="rotate(-8 108 182)" fill="#fff" font-size="17" font-family="Outfit" font-weight="900" text-anchor="middle">RED</text>
        <rect x="158" y="128" width="76" height="104" rx="12" transform="rotate(7 196 180)" fill="#3B82F6" fill-opacity=".85"/>
        <text x="192" y="190" transform="rotate(7 196 180)" fill="#fff" font-size="15" font-family="Outfit" font-weight="900" text-anchor="middle">GREEN</text>`;
    },
    altuses(r, c){
      return `<rect x="112" y="150" width="76" height="44" rx="5" fill="${c}" fill-opacity=".8"/>
        <line x1="137" y1="150" x2="137" y2="194" stroke="#0A0C12" stroke-width="2" opacity=".4"/>
        <line x1="163" y1="150" x2="163" y2="194" stroke="#0A0C12" stroke-width="2" opacity=".4"/>
        ${[0,1,2,3,4].map(i => { const a = -Math.PI/2 + (i-2)*0.5; const x = 150+Math.cos(a)*82, y = 172+Math.sin(a)*76;
          return `<circle cx="${x}" cy="${y}" r="${6+((i*7)%3)*3}" fill="#fff" fill-opacity=".${2+i}"/>`; }).join('')}
        <text x="150" y="262" fill="#fff" fill-opacity=".7" font-size="15" font-family="Outfit" font-weight="700" text-anchor="middle">? ? ?</text>`;
    },
  };

  function genericMotif(r, c){
    // layered abstract generative art
    let s = '';
    const kind = Math.floor(r()*4);
    if (kind === 0){ // orbits
      for (let i=0;i<4;i++){
        const cx = 90+r()*120, cy = 140+r()*120, rad = 20+r()*60;
        s += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${c}" stroke-opacity="${0.15+r()*0.4}" stroke-width="${1+r()*3}"/>`;
      }
      s += `<circle cx="${110+r()*80}" cy="${160+r()*80}" r="${14+r()*18}" fill="${c}" fill-opacity=".8"/>`;
    } else if (kind === 1){ // shards
      for (let i=0;i<6;i++){
        const x = 60+r()*180, y = 120+r()*170, sz = 20+r()*50, rot = r()*360;
        s += `<rect x="${x}" y="${y}" width="${sz}" height="${sz}" rx="${sz/5}" transform="rotate(${rot} ${x+sz/2} ${y+sz/2})" fill="${r()<0.5?c:'#ffffff'}" fill-opacity="${0.06+r()*0.3}"/>`;
      }
    } else if (kind === 2){ // waves
      for (let i=0;i<5;i++){
        const y = 140+i*30;
        s += `<path d="M30 ${y} Q 100 ${y-30-r()*30} 150 ${y} T 270 ${y}" fill="none" stroke="${c}" stroke-opacity="${0.5-i*0.08}" stroke-width="${2.5-i*0.3}"/>`;
      }
      s += `<circle cx="${90+r()*120}" cy="${150+r()*80}" r="10" fill="#fff" fill-opacity=".7"/>`;
    } else { // constellation
      const pts = [...Array(7)].map(() => [55+r()*190, 115+r()*180]);
      for (let i=0;i<pts.length-1;i++)
        s += `<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${pts[i+1][0]}" y2="${pts[i+1][1]}" stroke="${c}" stroke-opacity=".35" stroke-width="1.5"/>`;
      pts.forEach(p => s += `<circle cx="${p[0]}" cy="${p[1]}" r="${3+r()*6}" fill="${r()<0.4?c:'#ffffff'}" fill-opacity="${0.5+r()*0.5}"/>`);
    }
    return s;
  }

  /* Build full cover SVG for a game */
  NP.cover = function(game, opts){
    opts = opts || {};
    const cat = NP.CATEGORIES[game.cat];
    const c = cat.color;
    const r = rng(game.id);
    const dark = shade(c, -150);
    const uid = 'g' + game.id.replace(/[^a-z0-9]/g,'') + (opts.uid||'');
    const motif = (MOTIFS[game.art] || ((rr) => genericMotif(rr, c)))(r, c);
    const showTitle = opts.title !== false;
    const angle = Math.floor(r()*360);
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${game.name} cover art">
      <defs>
        <linearGradient id="bg${uid}" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} .5 .5)">
          <stop offset="0" stop-color="${shade(dark, 26)}"/>
          <stop offset=".55" stop-color="#0B0E15"/>
          <stop offset="1" stop-color="#07090D"/>
        </linearGradient>
        <radialGradient id="gl${uid}" cx="${0.25+r()*0.5}" cy="${0.2+r()*0.3}" r="0.9">
          <stop offset="0" stop-color="${c}" stop-opacity=".34"/>
          <stop offset="1" stop-color="${c}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bg${uid})"/>
      <rect width="${W}" height="${H}" fill="url(#gl${uid})"/>
      ${motif}
      <rect width="${W}" height="${H}" fill="none" stroke="#ffffff" stroke-opacity=".07" stroke-width="1.5" rx="2"/>
      ${showTitle ? `
      <linearGradient id="tt${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#05070B" stop-opacity="0"/>
        <stop offset="1" stop-color="#05070B" stop-opacity=".95"/>
      </linearGradient>
      <rect x="0" y="${H-120}" width="${W}" height="120" fill="url(#tt${uid})"/>
      <text x="20" y="${H-46}" fill="#fff" font-size="${game.name.length > 14 ? 19 : 23}" font-family="Outfit, sans-serif" font-weight="800" letter-spacing=".5">${esc(game.name.toUpperCase())}</text>
      <text x="20" y="${H-24}" fill="${c}" font-size="11" font-family="Outfit, sans-serif" font-weight="700" letter-spacing="2.5">${cat.name.toUpperCase()}</text>` : ''}
    </svg>`;
  };

  /* Wide banner variant for hero / continue cards */
  NP.banner = function(game, opts){
    opts = opts || {};
    const cat = NP.CATEGORIES[game.cat];
    const c = cat.color;
    const r = rng(game.id + 'w');
    const dark = shade(c, -150);
    const uid = 'b' + game.id.replace(/[^a-z0-9]/g,'') + (opts.uid || '');
    const motifR = rng(game.id);
    const motif = (MOTIFS[game.art] || ((rr) => genericMotif(rr, c)))(motifR, c);
    return `<svg viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${game.name} artwork">
      <defs>
        <linearGradient id="wb${uid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${shade(dark, 30)}"/>
          <stop offset=".6" stop-color="#0B0E15"/>
          <stop offset="1" stop-color="#07090D"/>
        </linearGradient>
        <radialGradient id="wg${uid}" cx=".72" cy=".3" r="0.85">
          <stop offset="0" stop-color="${c}" stop-opacity=".38"/>
          <stop offset="1" stop-color="${c}" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="640" height="360" fill="url(#wb${uid})"/>
      <rect width="640" height="360" fill="url(#wg${uid})"/>
      <g transform="translate(330,-30) scale(1.05)">${motif}</g>
      <g transform="translate(10,-60) scale(.7)" opacity=".25">${motif}</g>
    </svg>`;
  };

  function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
})();
