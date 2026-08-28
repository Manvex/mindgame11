/* ============================================================
   NEUROPLAY — Data layer: categories, catalog, levels, achievements
   ============================================================ */
window.NP = window.NP || {};

NP.CATEGORIES = {
  logic:      { id:'logic',      name:'Logic',       full:'Logic & Problem Solving', color:'#3B82F6', icon:'fa-chess-knight' },
  memory:     { id:'memory',     name:'Memory',      full:'Memory',                  color:'#A855F7', icon:'fa-brain' },
  focus:      { id:'focus',      name:'Focus',       full:'Focus & Attention',       color:'#22D3EE', icon:'fa-bullseye' },
  creativity: { id:'creativity', name:'Creativity',  full:'Creativity',              color:'#EC4899', icon:'fa-wand-magic-sparkles' },
  pattern:    { id:'pattern',    name:'Patterns',    full:'Pattern Recognition',     color:'#818CF8', icon:'fa-shapes' },
  math:       { id:'math',       name:'Math',        full:'Mental Math',             color:'#F97316', icon:'fa-calculator' },
  spatial:    { id:'spatial',    name:'Spatial',     full:'Spatial Thinking',        color:'#34D399', icon:'fa-cube' },
  language:   { id:'language',   name:'Language',    full:'Language & Vocabulary',   color:'#FACC15', icon:'fa-font' },
  relax:      { id:'relax',      name:'Relaxation',  full:'Relaxation & Flow',       color:'#2DD4BF', icon:'fa-spa' },
  speed:      { id:'speed',      name:'Speed',       full:'Speed & Reaction',        color:'#F43F5E', icon:'fa-bolt' },
};

/* g(id, name, sub, cat, diff 1-5, minutes, artStyle, playable?, desc, skills, how) */
function g(id, name, sub, cat, diff, mins, art, playable, desc, skills, how){
  return { id, name, sub, cat, diff, mins, art, playable: !!playable,
    desc: desc || sub + '. A finely tuned cognitive challenge designed to sharpen your mind through play.',
    skills: skills || [NP.CATEGORIES[cat].name],
    how: how || 'Follow the on-screen prompts. Each round adapts to your skill level — accuracy and speed both count toward your score.',
    xp: 20 + diff * 12,
    rating: (4.1 + ((id.length * 7 + diff * 13) % 9) / 10).toFixed(1),
    players: 12000 + ((id.charCodeAt(0) * 977 + id.length * 3131) % 88000),
  };
}

NP.GAMES = [
  // LOGIC
  g('sudoku','Sudoku','Classic number placement logic', 'logic',3,10,'grid9',true,
    'The timeless logic puzzle. Fill the 9×9 grid so every row, column and box contains 1–9. Neuroplay Sudoku adapts difficulty to your current skill and highlights your logical deduction speed over time.',
    ['Deduction','Working memory','Planning'],
    'Fill every row, column and 3×3 box with the digits 1–9 without repeats. Tap a cell, then choose a number. Three mistakes ends the run.'),
  g('neural-2048','NEURAL 2048','Merge, plan, and think ahead','logic',3,8,'n2048',true,
    'Combine strategy, pattern recognition and long-term planning. Slide tiles to merge matching powers of two — every move reshapes the board. Reach 2048 for a massive XP bonus.',
    ['Planning','Pattern recognition','Strategy'],
    'Swipe (or use arrow keys) to slide all tiles. Equal tiles merge and double. Keep space open, build toward a corner, reach 2048.'),
  g('minesweeper','Minesweeper','Deduce the safe path','logic',3,6,'mines',true,
    'Pure deductive reasoning under pressure. Numbers reveal how many mines touch each square — chart the safe route through the field.',
    ['Deduction','Risk assessment','Focus'],
    'Tap to reveal a square. Numbers show adjacent mines. Long-press or toggle flag mode to mark mines. Clear all safe squares to win.'),
  g('hanoi','Tower of Hanoi','Recursive planning classic','logic',2,5,'hanoi',true,
    'Move the entire tower one disc at a time without placing a larger disc on a smaller one. A beautiful exercise in recursive thinking.',
    ['Planning','Sequencing'],
    'Tap a tower to pick up its top disc, tap another to drop it. Never place large on small. Fewest moves wins the best rating.'),
  g('nonogram','Nonogram','Paint by logic','logic',4,12,'nono',false,'Reveal hidden pixel art using row and column number clues. Deeply satisfying deduction.'),
  g('rush-hour','Rush Hour','Slide the traffic free','logic',3,7,'rush',false,'Slide blocking vehicles out of the way to free the red car. Escalating gridlock puzzles.'),
  g('flow-puzzle','Flow Puzzle','Connect without crossing','logic',2,5,'flow',false,'Link matching colored dots with pipes that fill the whole board without overlapping.'),
  g('logic-grid','Logic Grid Puzzle','Cross-reference the clues','logic',4,15,'lgrid',false,'Classic Einstein-style deduction: use elimination grids to pin down who owns what.'),
  g('connect-four','Connect Four Strategy','Outthink the AI','logic',2,5,'c4',false,'Drop discs to make four in a row against an adaptive AI that learns your habits.'),
  g('water-sort','Water Sort','Pour to purity','logic',2,6,'wsort',false,'Pour colored liquid between flasks until every flask holds a single color.'),

  // MEMORY
  g('memory-match','Memory Match','Find the hidden pairs','memory',2,4,'mmatch',true,
    'The definitive visual memory workout. Flip cards, memorize positions, and clear the board in as few moves as possible.',
    ['Visual memory','Spatial recall'],
    'Tap two cards to flip them. Matching pairs stay revealed. Clear the whole board — fewer flips means a higher rating.'),
  g('sequence-recall','Sequence Recall','Remember the order','memory',3,5,'seq',true,
    'Watch a growing sequence of tiles light up, then reproduce it perfectly. Every round adds one step. How deep can your sequence memory go?',
    ['Sequential memory','Attention'],
    'Watch the tiles light up in order, then tap them back in the same order. Each round adds one more step.'),
  g('simon','Simon','Follow the light and sound','memory',2,4,'simon',true,
    'The iconic memory game, remastered. Four glowing quadrants play an ever-longer pattern — echo it back without a single slip.',
    ['Sequential memory','Audio-visual recall'],
    'Watch the colored pads flash in sequence, then repeat the sequence by tapping the pads in the same order.'),
  g('number-memory','Number Memory','Hold the digits','memory',3,4,'digits',true,
    'A number flashes briefly — hold it in working memory and type it back. Each level adds a digit. The average human manages 7. Beat that.',
    ['Working memory','Digit span'],
    'Memorize the number shown, then enter it after it disappears. One more digit every level.'),
  g('visual-memory','Visual Memory','Remember the lit tiles','memory',3,4,'vmem',true,
    'A grid of tiles flashes — memorize which ones lit up, then recall them all. The grid grows as your visual buffer expands.',
    ['Visual memory','Spatial recall'],
    'Tiles briefly light up. When they reset, tap every tile that was lit. Three mistakes in a round ends the run.'),
  g('memory-grid','Memory Grid','Spatial pattern recall','memory',3,5,'mgrid',false,'Memorize increasingly complex spatial arrangements across a shifting grid.'),
  g('pattern-recall','Pattern Recall','Rebuild what you saw','memory',3,5,'precall',false,'Study a pattern of shapes and colors, then rebuild it from memory piece by piece.'),
  g('card-recall','Card Recall','Track the deck','memory',4,6,'cards',false,'Cards are revealed then hidden — answer rapid-fire questions about what you saw.'),
  g('object-recall','Object Recall','Everyday item memory','memory',2,4,'objects',false,'A scene of objects appears briefly. Recall what was there — and what changed.'),
  g('dual-nback','Dual N-Back','The scientist\u2019s favorite','memory',5,10,'nback',false,'Track positions and sounds N steps back simultaneously. The gold-standard working memory trainer.'),

  // FOCUS
  g('schulte','Schulte Table','Find numbers in order','focus',2,3,'schulte',true,
    'The classic attention-training grid used by speed readers. Locate 1 through 25 in order as fast as possible while keeping your eyes centered.',
    ['Peripheral vision','Visual search','Concentration'],
    'Tap the numbers in ascending order, 1 → 25, as fast as you can. Wrong taps cost time.'),
  g('stroop','Stroop Challenge','Ignore the word, name the color','focus',3,3,'stroop',true,
    'Your brain reads words automatically — override it. Identify the ink color, not the word. A legendary test of cognitive inhibition.',
    ['Inhibition','Processing speed'],
    'Tap the button matching the COLOR of the text, not what the word says. 45 seconds, as many as you can.'),
  g('reaction','Reaction Time','Pure reflex measurement','focus',1,2,'reaction',true,
    'Wait for green. Tap instantly. Five rounds measure your true average reaction time down to the millisecond. Elite is under 250ms.',
    ['Reaction speed','Impulse control'],
    'Wait for the screen to turn green, then tap as fast as possible. Tapping early restarts the round. 5 rounds, average wins.'),
  g('find-target','Find the Target','Spot it in the noise','focus',2,3,'target',true,
    'One tile is subtly different. Find it fast as the grid grows and the difference shrinks. A pure visual attention sprint.',
    ['Selective attention','Visual discrimination'],
    'Tap the tile with the slightly different shade. Grids grow larger and differences get subtler each round.'),
  g('odd-one-out','Odd One Out','Which doesn\u2019t belong?','focus',2,3,'odd',false,'Scan sets of symbols and spot the one that breaks the rule before time runs out.'),
  g('rapid-sorting','Rapid Sorting','Sort under pressure','focus',3,4,'sorting',false,'Flick items into the correct bins as the rules keep changing. Cognitive flexibility at speed.'),
  g('trail','Trail Challenge','Connect A-1-B-2...','focus',3,4,'trail',false,'Alternate between letters and numbers in sequence — the classic executive function test.'),
  g('symbol-search','Symbol Search','Match the glyphs','focus',2,3,'symsearch',false,'Determine whether target symbols appear in each search group. Speed and precision.'),
  g('attention-grid','Attention Grid','Sustained vigilance','focus',3,5,'attgrid',false,'Monitor a live grid and react only to specific targets among convincing distractors.'),
  g('speed-match','Speed Match','Same as the last?','focus',2,3,'smatch',false,'Does the current card match the previous one? Answer at maximum speed.'),

  // CREATIVITY
  g('matchstick','Matchstick Puzzle','Move one stick to fix it','creativity',3,5,'matchstick',false,'Reposition matchsticks to correct equations and transform shapes. Lateral thinking classic.'),
  g('tangram','Tangram','Seven pieces, infinite forms','creativity',3,8,'tangram',false,'Arrange the seven ancient pieces to recreate elegant silhouettes.'),
  g('one-stroke','One Stroke Drawing','Never lift, never repeat','creativity',2,4,'stroke',false,'Trace the entire figure in a single continuous line without retracing.'),
  g('alt-uses','Alternate Uses','How many uses for a brick?','creativity',2,5,'altuses',true,
    'The classic divergent-thinking exercise. Generate as many creative uses as you can for an everyday object. Quantity breeds originality.',
    ['Divergent thinking','Fluency','Originality'],
    'You get an object and 90 seconds. Type as many unusual uses as you can — each distinct idea scores.'),
  g('story-gen','Story Generator','Three words, one story','creativity',2,6,'story',false,'Weave three random words into a coherent micro-story against the clock.'),
  g('idea-combo','Idea Combination','Merge two concepts','creativity',3,5,'combo',false,'Fuse unrelated concepts into a new invention. Judged by an originality model.'),
  g('visual-assoc','Visual Association','What connects these?','creativity',3,4,'vassoc',false,'Find the hidden association linking sets of seemingly unrelated images.'),
  g('escape','Escape Puzzle','Think outside the room','creativity',4,12,'escape',false,'Solve chained lateral-thinking puzzles to escape atmospheric mini-rooms.'),
  g('pattern-create','Pattern Creation','Design under constraints','creativity',2,6,'pcreate',false,'Compose symmetric patterns from limited tiles that satisfy shifting constraints.'),
  g('draw-prompt','Draw From Prompt','Sketch the impossible','creativity',1,5,'draw',false,'Freehand sketch surreal prompts. Share and rate community interpretations.'),

  // PATTERN
  g('set','SET','Spot the valid triads','pattern',4,6,'set',false,'Find sets of three cards where each feature is all-same or all-different. Deceptively hard.'),
  g('seq-predict','Sequence Prediction','What comes next?','pattern',3,4,'seqp',true,
    'Numeric and visual sequences that hide arithmetic, geometric and alternating rules. Infer the rule, predict the next element.',
    ['Inductive reasoning','Abstraction'],
    'Study the sequence and choose the element that continues it. Rules get layered as you climb.'),
  g('complete-pattern','Complete the Pattern','Fill the missing cell','pattern',3,5,'cpattern',false,'A matrix with one missing piece — infer the transformation and complete it.'),
  g('raven','Raven Matrices','Abstract reasoning gold standard','pattern',5,10,'raven',false,'Non-verbal abstract reasoning puzzles in the style used by real IQ assessments.'),
  g('shape-seq','Shape Sequence','Geometric progression','pattern',2,4,'shapeseq',false,'Shapes rotate, scale and multiply by a hidden rule — extend the sequence.'),
  g('color-pattern','Color Pattern','Chromatic rules','pattern',2,3,'colorpat',false,'Decode color cycles and gradients to predict the next hue in line.'),
  g('find-rule','Find the Rule','Reverse-engineer the function','pattern',4,6,'rule',false,'Given inputs and outputs, deduce the hidden transformation rule.'),
  g('visual-matrix','Visual Matrix','Grid logic at speed','pattern',3,5,'vmatrix',false,'Rapid-fire matrix puzzles with rotation, mirroring and counting rules.'),
  g('symbol-match','Symbol Matching','Learn the code','pattern',2,4,'symmatch',false,'Learn symbol-to-digit codes and translate as fast as possible.'),
  g('what-next','What Comes Next','Everything sequences','pattern',3,4,'wnext',false,'Mixed-modality sequences: numbers, shapes, letters, sounds. Adapt or fall behind.'),

  // MATH
  g('mental-math','Mental Math','Rapid-fire arithmetic','math',2,4,'mmath',true,
    'A relentless stream of arithmetic tuned to your level. Addition to mixed operations — keep your streak alive to multiply your score.',
    ['Calculation speed','Number sense'],
    'Solve each problem and tap the correct answer. Streaks build a score multiplier. 60 seconds on the clock.'),
  g('make-24','Make 24','Four numbers, one target','math',4,6,'m24',false,'Combine four numbers with + − × ÷ to make exactly 24. Some are fiendish.'),
  g('kakuro','Kakuro','Crossword arithmetic','math',4,15,'kakuro',false,'Fill runs of cells so they sum to the clues without repeating digits.'),
  g('kenken','KenKen','Arithmetic Latin squares','math',4,12,'kenken',false,'Satisfy cage targets with the four operations while keeping rows and columns unique.'),
  g('math-2048','Math 2048','Merge by arithmetic','math',3,8,'math2048',false,'A 2048 variant where tiles merge through sums and products you choose.'),
  g('num-seq','Number Sequence','Numeric induction','math',3,5,'numseq',false,'Pure number sequences with layered arithmetic rules.'),
  g('balance-eq','Balance Equation','Make both sides equal','math',3,5,'balance',false,'Place numbers and operators to balance increasingly gnarly equations.'),
  g('quick-calc','Quick Calculation','Chain calculations','math',2,3,'qcalc',false,'A running total mutates step by step — track it mentally to the end.'),
  g('missing-num','Missing Number','Solve for the blank','math',2,4,'missing',false,'Find the missing value in equations and grids against the clock.'),
  g('fractions','Fraction Challenge','Visual fraction fluency','math',3,5,'fractions',false,'Compare, add and visualize fractions with satisfying visual proofs.'),

  // SPATIAL
  g('block-puzzle','Block Puzzle','Tetris-style placement','spatial',2,6,'blocks',false,'Place polyomino pieces to clear lines on a static board. Plan two pieces ahead.'),
  g('mental-rotation','Mental Rotation','Same shape, rotated?','spatial',4,5,'rotation',true,
    'The definitive spatial reasoning test. Decide whether two figures are rotations of each other — or mirror images. Used in real cognitive research.',
    ['Mental rotation','Spatial visualization'],
    'Two figures appear. Tap SAME if one is a rotation of the other, MIRROR if it\u2019s flipped. Speed and accuracy both count.'),
  g('cube-rotation','Cube Rotation','Track the faces','spatial',4,6,'cube',false,'A cube tumbles through rotations — track which face ends up where.'),
  g('maze','Maze','Find the way through','spatial',2,5,'maze',true,
    'Procedurally generated mazes that grow with your skill. Navigate to the exit with the fewest wrong turns.',
    ['Spatial navigation','Planning'],
    'Use swipes or arrow keys to move through the maze to the glowing exit. Fewer steps, better score.'),
  g('jigsaw','Jigsaw','Assemble the image','spatial',2,10,'jigsaw',false,'Beautiful generative art jigsaws with smart edge-snapping.'),
  g('sliding-puzzle','Sliding Puzzle','Restore the order','spatial',3,6,'sliding',true,
    'The classic 15-puzzle. Slide tiles into the empty space to restore numerical order in the fewest moves.',
    ['Spatial planning','Sequencing'],
    'Tap a tile adjacent to the gap to slide it. Arrange 1–15 in order with the gap last.'),
  g('pipe-connect','Pipe Connect','Rotate to flow','spatial',2,5,'pipes',false,'Rotate pipe segments so water flows from source to drain across the grid.'),
  g('paper-folding','Paper Folding','Punch and unfold','spatial',5,6,'folding',false,'A paper is folded and hole-punched — predict the unfolded pattern.'),
  g('shape-match-3d','3D Shape Match','Match the projection','spatial',4,5,'shape3d',false,'Match 3D objects to their 2D projections from different viewpoints.'),

  // LANGUAGE
  g('word-guess','Word Guess','Five letters, six tries','language',3,5,'wguess',true,
    'Deduce the hidden five-letter word in six guesses. Tiles reveal correct letters and placements — pure verbal deduction.',
    ['Vocabulary','Verbal deduction'],
    'Type a five-letter word and submit. Green = right letter, right spot. Gold = right letter, wrong spot. Six tries.'),
  g('anagram','Anagram','Unscramble the letters','language',2,4,'anagram',true,
    'Letters scrambled, clock running. Rearrange them into the hidden word. Longer words, bigger scores.',
    ['Vocabulary','Verbal fluency'],
    'Tap letters in order to spell the hidden word. Use shuffle if stuck. Clear as many as possible before time ends.'),
  g('word-ladder','Word Ladder','One letter at a time','language',3,6,'ladder',false,'Transform one word into another, changing a single letter per step.'),
  g('word-assoc','Word Association','Find the link','language',2,4,'wassoc',false,'Choose the word most strongly associated with the prompt set.'),
  g('crossword','Crossword','Daily mini crossword','language',3,8,'crossword',false,'A hand-tuned 5×5 mini crossword generated fresh every day.'),
  g('connections','Connections','Group the sixteen','language',4,7,'connections',false,'Sort 16 words into four hidden groups of four. Deceptive overlaps everywhere.'),
  g('categories','Categories','Name one for each letter','language',2,5,'categories',false,'Fill categories with words starting with the target letter before time expires.'),
  g('synonym','Synonym Challenge','Precision vocabulary','language',3,4,'synonym',false,'Pick the closest synonym under time pressure. Nuance matters.'),
  g('definition','Definition Guess','Reverse dictionary','language',3,4,'definition',false,'Read the definition, recall the word. Rare and beautiful words included.'),
  g('unscramble','Unscramble','Word chaos to order','language',2,4,'unscramble',false,'Longer scrambles with multiple valid answers — find the best-scoring word.'),

  // RELAXATION
  g('mahjong','Mahjong','Match tiles, clear the board','relax',2,10,'mahjong',false,'Classic tile-matching solitaire with ambient soundscapes and no timer.'),
  g('solitaire','Solitaire','The timeless card game','relax',2,8,'solitaire',false,'Klondike solitaire with buttery animations and zero pressure.'),
  g('zen-match','Zen Match','Slow, mindful matching','relax',1,6,'zen',true,
    'Memory matching without the clock. Soft visuals, gentle feedback, pure flow. Designed for winding down while keeping your mind lightly engaged.',
    ['Calm focus','Visual memory'],
    'Flip cards to find matching pairs. No timer, no mistakes counter — just flow.'),
  g('flow-free','Flow Puzzle','Meditative connection','relax',2,5,'flowr',false,'Connect the colors in flowing, unhurried puzzles with ambient audio.'),
  g('jigsaw-calm','Calm Jigsaw','Piece by piece','relax',1,12,'jigsawcalm',false,'Serene generative landscapes to assemble at your own pace.'),
  g('coloring','Coloring','Color by number','relax',1,10,'coloring',false,'Intricate mandalas and scenes with soothing palettes.'),
  g('calm-2048','Calm 2048','2048 without pressure','relax',2,8,'calm2048',false,'The merge classic with undo, no game-overs, and ambient visuals.'),
  g('word-search','Word Search','Hidden words, calm mind','relax',1,6,'wsearch',false,'Themed word grids with gentle highlighting and no clock.'),
  g('block-calm','Block Puzzle Zen','Fit and clear, calmly','relax',1,7,'blockcalm',false,'Relaxed block placement with forgiving mechanics.'),
  g('pattern-sort','Pattern Sorting','Order from chaos','relax',1,5,'psort',false,'Sort drifting shapes into harmonious arrangements. Deeply satisfying.'),

  // SPEED
  g('reaction-duel','Reaction Duel','Beat your ghost','speed',2,3,'duel',false,'Race your own best reaction times across five varied triggers.'),
  g('tap-race','Tap Race','How fast can you tap?','speed',1,2,'taprace',true,
    'A pure speed burst: hit as many targets as possible in 30 seconds. Targets shrink and move as you heat up.',
    ['Reaction speed','Hand-eye coordination'],
    'Tap the glowing target as fast as possible. It moves after every hit. Misses cost a little time.'),
  g('color-rush','Color Rush','Match or reject at speed','speed',2,3,'crush',true,
    'Cards fly at you — decide instantly whether the word and color agree. Blink and your streak is gone.',
    ['Processing speed','Inhibition'],
    'If the word matches its ink color tap YES, otherwise NO. 45 seconds. Streaks multiply your score.'),
  g('quick-decide','Quick Decide','Snap judgments','speed',2,3,'qdecide',false,'Binary decisions at escalating speed: bigger/smaller, more/fewer, left/right.'),
  g('number-rush','Number Rush','Ascending at speed','speed',2,3,'nrush',false,'Tap scattered numbers in order while they shuffle beneath your fingers.'),
];

NP.GAME_INDEX = Object.fromEntries(NP.GAMES.map(x => [x.id, x]));

/* ============ Levels ============ */
NP.LEVELS = [
  { lvl: 1,  xp: 0,     title: 'Curious Mind' },
  { lvl: 2,  xp: 120,   title: 'Curious Mind' },
  { lvl: 3,  xp: 300,   title: 'Quick Learner' },
  { lvl: 4,  xp: 560,   title: 'Quick Learner' },
  { lvl: 5,  xp: 900,   title: 'Pattern Hunter' },
  { lvl: 7,  xp: 1800,  title: 'Pattern Hunter' },
  { lvl: 10, xp: 3600,  title: 'Puzzle Solver' },
  { lvl: 13, xp: 6200,  title: 'Puzzle Solver' },
  { lvl: 16, xp: 9600,  title: 'Sharp Thinker' },
  { lvl: 20, xp: 15000, title: 'Mental Athlete' },
  { lvl: 25, xp: 23000, title: 'Mental Athlete' },
  { lvl: 30, xp: 33000, title: 'Strategic Thinker' },
  { lvl: 40, xp: 60000, title: 'Cognitive Elite' },
  { lvl: 50, xp: 99000, title: 'Neural Master' },
];

NP.levelForXp = function(xp){
  // interpolate between anchor levels
  let cur = { lvl: 1, xp: 0, title: 'Curious Mind' }, next = null;
  for (let i = 0; i < NP.LEVELS.length; i++){
    if (xp >= NP.LEVELS[i].xp) cur = NP.LEVELS[i];
    else { next = NP.LEVELS[i]; break; }
  }
  if (!next) return { level: cur.lvl, title: cur.title, progress: 1, curXp: xp, nextXp: cur.xp, intoLevel: 0, needed: 0 };
  // linear interpolation of level number between anchors
  const span = next.xp - cur.xp;
  const into = xp - cur.xp;
  const lvlSpan = next.lvl - cur.lvl;
  const sub = Math.floor(into / span * lvlSpan);
  const level = cur.lvl + sub;
  const perLvl = span / lvlSpan;
  const lvlStart = cur.xp + sub * perLvl;
  const progress = (xp - lvlStart) / perLvl;
  return { level, title: cur.title, progress, curXp: xp, nextXp: Math.round(lvlStart + perLvl), intoLevel: Math.round(xp - lvlStart), needed: Math.round(perLvl) };
};

/* ============ Achievements ============ */
NP.ACHIEVEMENTS = [
  { id:'first-spark',  name:'First Spark',    desc:'Complete your first game',            icon:'fa-fire',            color:'#F97316', check: s => s.stats.gamesPlayed >= 1 },
  { id:'streak-3',     name:'Warming Up',     desc:'Play 3 days in a row',                icon:'fa-fire-flame-curved',color:'#F43F5E', check: s => s.streak.best >= 3 },
  { id:'streak-7',     name:'7 Day Streak',   desc:'Play for 7 consecutive days',         icon:'fa-calendar-check',  color:'#EC4899', check: s => s.streak.best >= 7 },
  { id:'memory-10',    name:'Memory Master',  desc:'Reach 600 Memory XP',                 icon:'fa-brain',           color:'#A855F7', check: s => (s.skillXp.memory||0) >= 600 },
  { id:'speed-demon',  name:'Speed Demon',    desc:'React faster than 250ms',             icon:'fa-bolt',            color:'#F43F5E', check: s => s.stats.bestReaction > 0 && s.stats.bestReaction < 250 },
  { id:'puzzle-25',    name:'Puzzle Addict',  desc:'Complete 25 games',                   icon:'fa-puzzle-piece',    color:'#3B82F6', check: s => s.stats.gamesPlayed >= 25 },
  { id:'puzzle-100',   name:'Century Mind',   desc:'Complete 100 games',                  icon:'fa-gem',             color:'#818CF8', check: s => s.stats.gamesPlayed >= 100 },
  { id:'perfect-run',  name:'Perfect Run',    desc:'Finish a game with no mistakes',      icon:'fa-star',            color:'#FACC15', check: s => s.stats.perfectRuns >= 1 },
  { id:'night-owl',    name:'Night Owl',      desc:'Play after midnight',                 icon:'fa-moon',            color:'#22D3EE', check: s => !!s.flags.nightOwl },
  { id:'early-bird',   name:'Early Bird',     desc:'Play before 8 AM',                    icon:'fa-sun',             color:'#F97316', check: s => !!s.flags.earlyBird },
  { id:'mix-complete', name:'Daily Alchemist',desc:'Complete a full Daily Brain Mix',     icon:'fa-flask',           color:'#2DD4BF', check: s => s.stats.mixCompleted >= 1 },
  { id:'explorer',     name:'Explorer',       desc:'Play games from 5 categories',        icon:'fa-compass',         color:'#34D399', check: s => Object.keys(s.skillXp).length >= 5 },
  { id:'level-5',      name:'Pattern Hunter', desc:'Reach level 5',                       icon:'fa-shapes',          color:'#818CF8', check: s => NP.levelForXp(s.xp).level >= 5 },
  { id:'level-10',     name:'Puzzle Solver',  desc:'Reach level 10',                      icon:'fa-chess-knight',    color:'#3B82F6', check: s => NP.levelForXp(s.xp).level >= 10 },
  { id:'collector',    name:'Curator',        desc:'Save 5 games to your library',        icon:'fa-heart',           color:'#EC4899', check: s => (s.saved||[]).length >= 5 },
  { id:'sprinter',     name:'Sprinter',       desc:'Score 500+ in any speed game',        icon:'fa-gauge-high',      color:'#F43F5E', check: s => !!s.flags.speed500 },
];
