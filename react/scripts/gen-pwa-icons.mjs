// Rasterise public/favicon.svg into the PNG icon sizes the PWA manifest needs.
// Run via `npm run gen:icons` after editing the SVG. Uses sharp.
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const pub = fileURLToPath(new URL("../public/", import.meta.url));
const src = `${pub}favicon.svg`;

const targets = [
  ["pwa-192x192.png", 192],
  ["pwa-512x512.png", 512],
  ["pwa-maskable-512x512.png", 512], // full-bleed bg; content sits in the safe zone
  ["apple-touch-icon.png", 180],
];

for (const [name, size] of targets) {
  await sharp(src).resize(size, size).png().toFile(`${pub}${name}`);
  console.log(`wrote public/${name} (${size}x${size})`);
}
