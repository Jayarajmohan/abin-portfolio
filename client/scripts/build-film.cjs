/**
 * Builds the homepage film from the Flow shots.
 *
 *   assets-src/film/shot-1.mp4 … shot-6.mp4  →  public/film/film.mp4
 *   assets-src/film/k0.jpg … k6.jpg          →  public/film/k0.webp … (stills)
 *                                            →  src/data/film.json
 *
 * The shots are joined into ONE video encoded for scroll-scrubbing: a keyframe
 * every few frames and no B-frames, so seeking backwards and forwards is fast.
 * A strip on the right is cropped off every frame to remove the generator's
 * ✦ watermark (that side of each shot is empty darkness anyway).
 *
 * Usage: npm run film
 */
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");
const ffmpeg = require("ffmpeg-static");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "assets-src", "film");
const OUT = path.join(ROOT, "public", "film");
const DATA = path.join(ROOT, "src", "data", "film.json");

const SHOTS = 6;
const CROP_W = 1690 / 1920; // keep the left 88% of each 1920×1080 frame (drops the watermark)
const OUT_W = 1280;
const FPS = 24;

// Where Abin is in each shot (fraction of the ORIGINAL frame width) at its start
// and end — used to keep him in view when phones crop the film to portrait.
const FOCUS = [
  [0.3, 0.28],
  [0.3, 0.24],
  [0.25, 0.3],
  [0.5, 0.32],
  [0.36, 0.35],
  [0.35, 0.33],
];

const run = (args) => execFileSync(ffmpeg, args, { stdio: ["ignore", "ignore", "pipe"] });

/** Duration in seconds, read from ffmpeg's stderr banner. */
function duration(file) {
  try {
    execFileSync(ffmpeg, ["-i", file], { stdio: ["ignore", "ignore", "pipe"] });
  } catch (e) {
    const m = String(e.stderr).match(/Duration: (\d+):(\d+):([\d.]+)/);
    if (m) return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
  }
  throw new Error(`Could not read duration of ${file}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const shots = Array.from({ length: SHOTS }, (_, i) => path.join(SRC, `shot-${i + 1}.mp4`));
  shots.forEach((f) => {
    if (!fs.existsSync(f)) throw new Error(`Missing ${path.relative(ROOT, f)}`);
  });

  // Per-shot length after re-timing to a constant FPS (frames are what we scrub).
  const lengths = shots.map((f) => Math.floor(duration(f) * FPS) / FPS);

  // 1. Join + crop + scale + encode for scrubbing
  const crop = `crop=iw*${CROP_W.toFixed(4)}:ih:0:0`;
  const filters = shots.map((_, i) => `[${i}:v]fps=${FPS},${crop},scale=${OUT_W}:-2:flags=lanczos,setsar=1,trim=duration=${lengths[i]},setpts=PTS-STARTPTS[v${i}]`);
  const film = path.join(OUT, "film.mp4");
  run([
    "-y",
    ...shots.flatMap((f) => ["-i", f]),
    "-filter_complex",
    `${filters.join(";")};${shots.map((_, i) => `[v${i}]`).join("")}concat=n=${SHOTS}:v=1:a=0[v]`,
    "-map", "[v]",
    "-an",
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "26",
    "-pix_fmt", "yuv420p",
    "-g", "6", // keyframe every 6 frames → quick seeks in both directions
    "-keyint_min", "6",
    "-sc_threshold", "0",
    "-bf", "0",
    "-tune", "animation",
    "-movflags", "+faststart",
    film,
  ]);

  // 2. Keyframe stills (same crop), used before the film loads and for reduced motion
  const stills = [];
  for (let k = 0; k <= SHOTS; k++) {
    const src = path.join(SRC, `k${k}.jpg`);
    if (!fs.existsSync(src)) continue;
    const meta = await sharp(src).metadata();
    await sharp(src)
      .extract({ left: 0, top: 0, width: Math.round(meta.width * CROP_W), height: meta.height })
      .resize(1600)
      .webp({ quality: 72 })
      .toFile(path.join(OUT, `k${k}.webp`));
    stills.push(`/film/k${k}.webp`);
  }

  const { width, height } = await new Promise((resolve) => {
    // first frame → size check (and handy poster)
    run(["-y", "-i", film, "-frames:v", "1", path.join(OUT, "poster.jpg")]);
    sharp(path.join(OUT, "poster.jpg")).metadata().then(resolve);
  });

  // shot start times in the joined film
  let t = 0;
  const shotTimes = lengths.map((len) => {
    const s = { start: Number(t.toFixed(4)), end: Number((t + len - 1 / FPS).toFixed(4)) };
    t += len;
    return s;
  });
  const focus = FOCUS.map(([a, b]) => [Math.min(1, a / CROP_W), Math.min(1, b / CROP_W)].map((v) => Number(v.toFixed(3))));

  const data = { src: "/film/film.mp4", poster: "/film/poster.jpg", width, height, fps: FPS, duration: Number(t.toFixed(4)), shots: shotTimes, focus, stills };
  fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + "\n");

  const mb = (f) => (fs.statSync(f).size / 1024 / 1024).toFixed(2);
  console.log(`film.mp4: ${width}×${height}, ${t.toFixed(2)}s, ${mb(film)} MB`);
  console.log(`stills: ${stills.length}`);
  console.log("data →", path.relative(ROOT, DATA));
})().catch((e) => {
  console.error(e.stderr ? String(e.stderr) : e);
  process.exit(1);
});
