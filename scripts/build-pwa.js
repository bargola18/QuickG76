const fs = require('fs');
const path = require('path');

const BASE_PATH = '/QuickG76';
const distDir = path.join(__dirname, '..', 'docs');
const publicDir = path.join(__dirname, '..', 'public');

// Copy PWA files to dist
const pwaFiles = [
  'manifest.json',
  'sw.js',
  'icon.svg',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-192.png',
  'icon-maskable-512.png',
];

pwaFiles.forEach((f) => {
  const src = path.join(publicDir, f);
  const dst = path.join(distDir, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`  PWA: copied ${f}`);
  }
});

// Collect all dist assets for SW precache
function walk(dir, base) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const rel = path.join(base, e.name).replace(/\\/g, '/');
    if (e.isDirectory()) {
      files.push(...walk(full, rel));
    } else {
      files.push('/' + rel);
    }
  }
  return files;
}

// Rewrite absolute paths in generated files to use BASE_PATH (GitHub Pages subfolder)
function rewriteFilePaths(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (['.png', '.ico', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) return;
  let content = fs.readFileSync(filePath, 'utf-8');
  const patterns = [
    ['"/_expo/', '"' + BASE_PATH + '/_expo/'],
    ['"/assets/', '"' + BASE_PATH + '/assets/'],
    ['"/favicon.ico', '"' + BASE_PATH + '/favicon.ico'],
    ['"/icon-', '"' + BASE_PATH + '/icon-'],
    ['"/index.html', '"' + BASE_PATH + '/index.html'],
    ['"/manifest.json', '"' + BASE_PATH + '/manifest.json'],
    ['"/metadata.json', '"' + BASE_PATH + '/metadata.json'],
    ['"/sw.js', '"' + BASE_PATH + '/sw.js'],
    ['"/icon.svg', '"' + BASE_PATH + '/icon.svg'],
  ];
  let changed = false;
  for (const [from, to] of patterns) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`  REWRITE: ${path.relative(distDir, filePath)}`);
  }
}

function walkAndRewrite(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walkAndRewrite(full);
    } else if (e.isFile()) {
      rewriteFilePaths(full);
    }
  }
}
walkAndRewrite(distDir);

const allFiles = walk(distDir, '')
  .filter((f) => !f.endsWith('/metadata.json'))
  .filter((f) => !f.endsWith('/sw.js'))
  .map((f) => BASE_PATH + f);

// Generate SW with precache list
const swPath = path.join(distDir, 'sw.js');
const swContent = `const BASE = '${BASE_PATH}';
const CACHE = 'quickg76-v1';
const ASSETS = ${JSON.stringify(allFiles)};

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(ASSETS);
      console.log('[SW] Cached', ASSETS.length, 'assets');
    })()
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    (async () => {
      try {
        const cached = await caches.match(e.request);
        if (cached) return cached;
        const res = await fetch(e.request);
        if (res && res.ok && e.request.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      } catch {
        const fallback = await caches.match(BASE + '/');
        if (fallback) return fallback;
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});
`;

fs.writeFileSync(swPath, swContent);
console.log(`  SW: generated with ${allFiles.length} assets`);

// Inject meta tags into index.html
const htmlPath = path.join(distDir, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');

const meta = `
<meta name="theme-color" content="#0969DA">
<meta name="description" content="Kalkulator G-Code G76 untuk CNC Threading">
<meta name="mobile-web-app-capable" content="yes">
<link rel="icon" href="${BASE_PATH}/favicon.ico"/>
    <link rel="manifest" href="${BASE_PATH}/manifest.json" />
    <meta name="theme-color" content="#0969DA" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="QuickG76" />
    <link rel="apple-touch-icon" href="${BASE_PATH}/icon-512.png" />
`;

const swScript = `
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => navigator.serviceWorker.register('${BASE_PATH}/sw.js'));
      }
    </script>`;

// Remove existing injected tags if any, then add new ones
html = html.replace(/\n\s*<meta name="theme-color".*?\n/g, '\n');
html = html.replace(/\n\s*<meta name="description".*?\n/g, '\n');
html = html.replace(/\n\s*<meta name="mobile-web-app-capable".*?\n/g, '\n');
html = html.replace(/\n\s*<link rel="icon".*?\n/g, '\n');
html = html.replace(/\n\s*<link rel="manifest".*?\n/g, '\n');
html = html.replace(/\n\s*<meta name="apple-mobile-web-app-capable".*?\n/g, '\n');
html = html.replace(/\n\s*<meta name="apple-mobile-web-app-title".*?\n/g, '\n');
html = html.replace(/\n\s*<link rel="apple-touch-icon".*?\n/g, '\n');
html = html.replace(/\n\s*<script>[\s\S]*?<\/script>\n/g, '\n');

const bodyStart = '<body>';
html = html.replace(bodyStart, `  ${meta}\n  </head>\n  ${bodyStart}`);

const bodyEnd = '</body>';
html = html.replace(bodyEnd, `${swScript}\n${bodyEnd}`);

fs.writeFileSync(htmlPath, html);
console.log('  HTML: meta tags and SW script injected');

// Ensure .nojekyll exists (for GitHub Pages compatibility)
const nojekyllPath = path.join(distDir, '.nojekyll');
if (!fs.existsSync(nojekyllPath)) {
  fs.writeFileSync(nojekyllPath, '');
  console.log('  PWA: created .nojekyll');
}

console.log('PWA build complete!');
