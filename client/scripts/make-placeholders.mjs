// Generates placeholder project thumbnails in /public/thumbs.
// Replace them with real images later (just update the paths in src/data).
// Run: npm run placeholders
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const out = path.join(process.cwd(), "public", "thumbs");
await mkdir(out, { recursive: true });

// Deep black / graphite with cool cinematic light
const palettes = [
  ["#0B1A20", "#4FD8EB", "MONSOON RUN"],
  ["#14151C", "#8FA6FF", "AFTER HOURS"],
  ["#0D1714", "#6EE7B7", "THE LONG WAY HOME"],
  ["#1A1512", "#F2B27A", "INSIDE THE STUDIO"],
  ["#0E1420", "#7FB6FF", "BRIGHTSIDE LAUNCH"],
  ["#121A1C", "#A5F3FC", "SALT"],
];

const frame = (bg, glow, label, w = 1280, h = 720) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs>
    <radialGradient id="g" cx="68%" cy="32%" r="80%">
      <stop offset="0" stop-color="${glow}" stop-opacity="0.45"/>
      <stop offset="0.5" stop-color="${bg}" stop-opacity="1"/>
      <stop offset="1" stop-color="#060708"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect y="0" width="${w}" height="${h * 0.1}" fill="#000"/>
  <rect y="${h * 0.9}" width="${w}" height="${h * 0.1}" fill="#000"/>
  <path d="M0 ${h * 0.9} L${w * 0.3} ${h * 0.62} L${w * 0.48} ${h * 0.72} L${w * 0.72} ${h * 0.5} L${w} ${h * 0.68} L${w} ${h * 0.9} Z" fill="#05070a" opacity="0.9"/>
  <text x="80" y="${h * 0.84}" fill="#EDF1F4" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${Math.round(h / 12)}" letter-spacing="3">${label}</text>
  <text x="80" y="${h * 0.16}" fill="${glow}" font-family="Courier New, monospace" font-size="${Math.round(h / 32)}">● REC  00:00:00:00</text>
</svg>`;

for (const [i, [bg, glow, label]] of palettes.entries()) {
  await writeFile(path.join(out, `project-${i + 1}.svg`), frame(bg, glow, label));
}
// showreel.jpg and og-image.jpg are real artwork now and are not touched here.
console.log("Placeholder project thumbnails written to public/thumbs");
