import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

app.use('/static/*', serveStatic({ root: './public' }))

const shell = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#080A0F">
<meta name="description" content="NEUROPLAY — A premium cognitive gaming platform. Train your mind. Play your way.">
<title>NEUROPLAY — Train Your Mind. Play Your Way.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
<link href="/static/styles.css" rel="stylesheet">
<link rel="icon" type="image/svg+xml" href="/static/favicon.svg">
</head>
<body>
<div id="bg-ambient" aria-hidden="true">
  <div class="ambient-orb orb-1"></div>
  <div class="ambient-orb orb-2"></div>
  <div class="ambient-orb orb-3"></div>
  <div class="grain"></div>
</div>
<div id="app" aria-live="polite"></div>
<div id="modal-root"></div>
<div id="toast-root" aria-live="assertive"></div>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script src="/static/data.js"></script>
<script src="/static/store.js"></script>
<script src="/static/covers.js"></script>
<script src="/static/components.js"></script>
<script src="/static/games.js"></script>
<script src="/static/views.js"></script>
<script src="/static/app.js"></script>
</body>
</html>`

// API: catalog metadata (edge-served)
app.get('/api/meta', (c) => c.json({
  name: 'NEUROPLAY',
  version: '1.0.0',
  tagline: 'Train Your Mind. Play Your Way.',
  categories: 10
}))

// SPA fallback — serve shell for all app routes
app.get('*', (c) => c.html(shell))

export default app
