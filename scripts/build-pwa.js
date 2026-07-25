const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const PUBLIC = path.join(__dirname, '..', 'public');
const INDEX = path.join(DIST, 'index.html');

// Copy manifest.json
fs.copyFileSync(path.join(PUBLIC, 'manifest.json'), path.join(DIST, 'manifest.json'));

// Copy sw.js
fs.copyFileSync(path.join(PUBLIC, 'sw.js'), path.join(DIST, 'sw.js'));

// Copy icon.svg
fs.copyFileSync(path.join(PUBLIC, 'icon.svg'), path.join(DIST, 'icon.svg'));

// Inject PWA tags into index.html
let html = fs.readFileSync(INDEX, 'utf-8');

const headTags = `
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#0969DA" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="QuickG76" />
    <link rel="apple-touch-icon" href="/icon.svg" />`;

html = html.replace('</head>', headTags + '\n  </head>');

const bodyTags = `
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
      }
    </script>`;

html = html.replace('</body>', bodyTags + '\n</body>');

fs.writeFileSync(INDEX, html, 'utf-8');

console.log('PWA: manifest.json, sw.js, icon.svg copied and index.html updated.');
