# NEUROPLAY — Premium Brain-Training Gaming Platform

> "Netflix for your brain" × PlayStation cinematic interface × Apple-level polish

## Project Overview
- **Name**: NEUROPLAY (`webapp`)
- **Goal**: A premium cognitive gaming platform where users discover, play, collect, track, and return daily to brain-training mini-games — designed to feel like a next-gen entertainment product, not an educational dashboard.
- **Concept**: Netflix-style discovery + PlayStation cinematic UI + Duolingo-style progression, across 10 cognitive categories.

## URLs
- **Sandbox Preview**: https://3000-im0o6bcnktc4z6mgcd0yj-2e1b9533.sandbox.novita.ai
- **Production**: not deployed yet (ready for Cloudflare Pages)
- **API**: `GET /api/meta` — platform metadata

## Currently Completed Features

### Platform & Discovery
- **Cinematic Home page**: animated hero banner (daily-rotating featured game), personalized status bar (level, XP bar, streak, daily mix), and 9 Netflix-style horizontal rails: Continue Playing, Daily Brain Mix, Trending Now, Quick Play (<3 min), Your Strongest Skills, Improve These Skills, Relax & Flow, New Games, Challenge Yourself
- **Discover page**: live search, 11 category chips (color-coded), 8 filters (Playable, Quick, Trending, New, Recommended, Casual, Advanced), adaptive responsive grid (2 cols mobile → 6+ ultrawide)
- **Game Detail pages**: cinematic hero with background art, cover, stats row (difficulty/session/XP/rating/players), About / How to Play / Your Performance / Skill Impact panels, Similar Games rail, Save/Share/How-to actions
- **Search page**: global search across games, categories, skills, achievements + recent searches + trending searches + category browser
- **Procedural cover artwork**: every one of the **90 games** gets unique generative SVG cover art (grid, wave, constellation, and 25+ game-specific motifs), keyed to its category color

### Games — 90 in catalog, 24 fully playable engines
- **❤️ Universal lives system**: every playable game has hearts — wrong moves / mistakes cost a life; when hearts run out the run ends (some games convert lives into second chances: 2048 clears small tiles, Minesweeper defuses the mine)
- **🎯 3 difficulty levels in every game**: Easy / Medium / Hard picker before each run — scales grid sizes, timers, sequence speed, mine counts, digit spans, word pools and lives; Hard pays **+35% score/XP**, Easy −20%. Your last choice per game is remembered.
- **Logic**: Sudoku (6×6 generated), NEURAL 2048 (swipe/keys), Minesweeper (safe-first-click), Tower of Hanoi
- **Memory**: Memory Match, Sequence Recall, Simon, Number Memory (digit span), Visual Memory (lives)
- **Focus**: Schulte Table, Stroop Challenge, Reaction Time (5-round ms avg), Find the Target
- **Math**: Mental Math (adaptive difficulty, streak multipliers)
- **Spatial**: Mental Rotation (same/mirror), Maze (procedural, swipe/keys), Sliding Puzzle (solvable 15-puzzle)
- **Language**: Word Guess (Wordle-style w/ on-screen keyboard), Anagram
- **Creativity**: Alternate Uses (divergent thinking)
- **Relaxation**: Zen Match
- **Speed**: Tap Race, Color Rush
- Non-playable games show a premium "Coming Soon" modal with a "Play Something Similar" smart redirect
- **Gameplay screen**: immersive fullscreen mode, HUD pills (score/time/round), pause menu with rules, exit confirmation, lives display, particle bursts, tile flip/pop/shake/glow feedback
- **Results screen**: animated score count-up, performance rating (ELITE/EXCELLENT/SOLID), personal-best detection, accuracy/reaction/time stats, per-skill XP rows with spillover, level progress bar, Play Again / Next Game / Home

### Progression & Personalization
- **XP & Levels**: Curious Mind → Pattern Hunter → Puzzle Solver → Mental Athlete → Strategic Thinker → Neural Master (Lv 1–50, interpolated), level-up celebration modal
- **Daily Brain Mix**: 5 seeded-random games/day across Memory/Logic/Focus/Creativity/Relax, completion ring, +50 XP bonus, streak display
- **Streaks**: daily streak tracking, 28-day streak calendar, best streak
- **16 collectible achievements** (First Spark, 7 Day Streak, Memory Master, Speed Demon, Night Owl, Early Bird, Perfect Run, etc.) with animated unlock popups
- **Progress page**: Brain Score ring (0–1000), Chart.js cognitive radar (10 skills), weekly XP bar chart, skill breakdown bars, streak calendar, personal records, **AI-style insight cards** ("You're strongest in X", "Growth area: Y", streak nudges)
- **Profile page**: avatar, level badge, XP bar, strongest/improving skills, 5 stat tiles, full achievement gallery, favorite games (most played), saved library, profile editing, progress reset
- **No login / no account**: open the app and play instantly — progress is saved automatically in the browser (localStorage); profile is editable from the Profile page

### Design & UX
- Dark cinematic design system (#080A0F base, layered surfaces, category accent colors used sparingly)
- Glassmorphism topnav (blur on scroll) + floating glass bottom nav on mobile with active glow animations
- Ambient drifting gradient orbs + film grain texture
- Hover states: card lift/zoom/glow with quick actions (Play/Details/Save), rail arrows on desktop, swipe on mobile
- Fully responsive: mobile-first bottom nav, tablet hybrid, desktop rails, ultrawide centered containers
- Accessibility: `prefers-reduced-motion` support, visible focus rings, aria labels/roles, keyboard game controls (arrows/WASD/typing), semantic HTML, never color-only indicators

## Functional Entry URIs
| Path | Description |
|---|---|
| `/#/` | Home — hero, status, discovery rails |
| `/#/discover` | Game library — params: `?cat=<category>&f=<filter>&q=<query>` |
| `/#/game/<id>` | Game detail (e.g. `/#/game/neural-2048`) |
| `/#/daily` | Daily Brain Mix |
| `/#/progress` | Analytics — Brain Score, radar, streaks, records |
| `/#/profile` | Profile, achievements, saved games |
| `/#/search` | Global search |
| `GET /api/meta` | JSON platform metadata |

Categories: `logic, memory, focus, creativity, pattern, math, spatial, language, relax, speed` · Filters: `playable, quick, trending, new, reco, easy, hard`

## Data Architecture
- **Data Models**: Game (id, name, category, difficulty, minutes, skills, XP, art style, playable flag), UserState (xp, skillXp per category, streak, dailyMix, best scores, playCount, achievements, weekly XP, saved, recent, profile)
- **Storage**: `localStorage` (`neuroplay:v1`) — fully client-side persistence with forward-compatible merge. Seeded PRNG makes the Daily Mix identical across reloads per day.
- **Data Flow**: game engine → `store.recordResult()` → XP distribution (primary + spillover skill), streak touch, daily-mix check, achievement check → results screen → UI refresh
- **Backend**: Hono on Cloudflare Pages serves the SPA shell + static assets + `/api/meta`; ready for D1 migration if server-side accounts/leaderboards are added

## User Guide
1. **First visit**: complete the 5-step onboarding (name, goal, session length, style) to generate your Brain Profile
2. **Play**: hit **PLAY NOW** on the hero, tap any card's Play action, or open the **Daily Brain Mix** and clear all 5 games for +50 bonus XP
3. **Discover**: browse rails on Home or filter the full library in Discover; save favorites with the ♥ button
4. **Track**: Progress page shows your Brain Score, per-skill radar, weekly XP and streak calendar; Profile holds achievements and records
5. **Return daily**: streaks, a fresh daily mix, and a rotating featured game reward daily play

## Features Not Yet Implemented
- Remaining 69 games are concept entries (premium Coming Soon modal); engines can be added incrementally to `games.js`
- Real multiplayer leaderboards (rank is currently derived from local best score)
- Server-side accounts / cross-device sync (would use Cloudflare D1)
- Sound design / haptics
- Social sharing images

## Recommended Next Steps
1. Deploy to Cloudflare Pages (`npm run deploy` after project creation)
2. Add D1-backed accounts + global leaderboards per game
3. Implement the next tier of engines (Nonogram, SET, Dual N-Back, Word Ladder, Block Puzzle)
4. Add Web Audio feedback + optional haptics on mobile
5. PWA manifest + service worker for installable offline play

## Deployment
- **Platform**: Cloudflare Pages (Hono + Vite)
- **Status**: ✅ Active in sandbox (PM2 + wrangler pages dev)
- **Tech Stack**: Hono · TypeScript · Vite · Vanilla JS SPA · Chart.js · FontAwesome · Google Fonts (Outfit/Inter) · procedural SVG art
- **Dev**: `npm run build && pm2 start ecosystem.config.cjs` → http://localhost:3000
- **Last Updated**: 2026-08-28
