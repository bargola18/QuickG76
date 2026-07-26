const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, '..', 'public');

async function generateIcons() {
  const svg = fs.readFileSync(path.join(outDir, 'icon.svg'), 'utf-8');

  const sizes = [
    { name: 'icon-192.png', size: 192 },
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-maskable-192.png', size: 192 },
    { name: 'icon-maskable-512.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    const isMaskable = name.includes('maskable');
    const padding = isMaskable ? Math.round(size * 0.1) : 0;
    const innerSize = size - padding * 2;

    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="#0969DA" rx="${Math.round(size * 0.125)}"/>
        <g transform="translate(${padding}, ${padding})">
          <rect width="${innerSize}" height="${innerSize}" fill="#0969DA" rx="${Math.round(innerSize * 0.125)}"/>
          <text x="${innerSize / 2}" y="${Math.round(innerSize * 0.55)}" font-family="Arial,sans-serif" font-size="${Math.round(innerSize * 0.5)}" font-weight="900" fill="#fff" text-anchor="middle">G76</text>
          <text x="${innerSize / 2}" y="${Math.round(innerSize * 0.72)}" font-family="Arial,sans-serif" font-size="${Math.round(innerSize * 0.11)}" font-weight="700" fill="#fff" text-anchor="middle">QuickG76</text>
        </g>
      </svg>`;

    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, name));

    console.log(`Generated: ${name} (${size}x${size}${isMaskable ? ', maskable' : ''})`);
  }
}

generateIcons().catch(console.error);
