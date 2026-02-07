const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

// SVG template: black "SC" on white background
function makeSvg(size) {
  const fontSize = Math.round(size * 0.42);
  const y = Math.round(size * 0.58);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#FFFFFF"/>
  <text x="50%" y="${y}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="${fontSize}" fill="#000000">SC</text>
</svg>`);
}

// Round icon SVG (clipped to circle)
function makeRoundSvg(size) {
  const fontSize = Math.round(size * 0.42);
  const y = Math.round(size * 0.58);
  const r = size / 2;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <clipPath id="circle">
      <circle cx="${r}" cy="${r}" r="${r}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#circle)">
    <rect width="${size}" height="${size}" fill="#FFFFFF"/>
    <text x="50%" y="${y}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="${fontSize}" fill="#000000">SC</text>
  </g>
</svg>`);
}

async function generateIcons() {
  // --- iOS Icons ---
  const iosDir = path.join(ROOT, 'ios/SafeCheck/Images.xcassets/AppIcon.appiconset');
  const iosIcons = [
    { size: 40, name: 'icon-20@2x.png' },
    { size: 60, name: 'icon-20@3x.png' },
    { size: 58, name: 'icon-29@2x.png' },
    { size: 87, name: 'icon-29@3x.png' },
    { size: 80, name: 'icon-40@2x.png' },
    { size: 120, name: 'icon-40@3x.png' },
    { size: 120, name: 'icon-60@2x.png' },
    { size: 180, name: 'icon-60@3x.png' },
    { size: 1024, name: 'icon-1024.png' },
  ];

  console.log('Generating iOS icons...');
  for (const { size, name } of iosIcons) {
    const svg = makeSvg(size);
    await sharp(svg).resize(size, size).png().toFile(path.join(iosDir, name));
    console.log(`  ${name} (${size}x${size})`);
  }

  // --- Android Icons ---
  const androidRes = path.join(ROOT, 'android/app/src/main/res');
  const androidIcons = [
    { size: 48, dir: 'mipmap-mdpi' },
    { size: 72, dir: 'mipmap-hdpi' },
    { size: 96, dir: 'mipmap-xhdpi' },
    { size: 144, dir: 'mipmap-xxhdpi' },
    { size: 192, dir: 'mipmap-xxxhdpi' },
  ];

  console.log('Generating Android icons...');
  for (const { size, dir } of androidIcons) {
    const outDir = path.join(androidRes, dir);
    fs.mkdirSync(outDir, { recursive: true });

    // Square icon
    const svg = makeSvg(size);
    await sharp(svg).resize(size, size).png().toFile(path.join(outDir, 'ic_launcher.png'));
    console.log(`  ${dir}/ic_launcher.png (${size}x${size})`);

    // Round icon
    const roundSvg = makeRoundSvg(size);
    await sharp(roundSvg).resize(size, size).png().toFile(path.join(outDir, 'ic_launcher_round.png'));
    console.log(`  ${dir}/ic_launcher_round.png (${size}x${size})`);
  }

  console.log('Done!');
}

generateIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
