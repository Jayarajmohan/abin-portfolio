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
const PORTRAIT_W = 576;
const PORTRAIT_H = 1024;
const FPS = 24;

// Where Abin is in each shot (fraction of the ORIGINAL frame width), used to
// keep him in view when phones crop the film to portrait. Either [start, end]
// or a list of [seconds, x] waypoints when he moves unevenly within the shot.
const FOCUS = [
  [0.3, 0.28],
  [0.3, 0.24],
  [0.25, 0.3],
  [[0, 0.58], [1.5, 0.6], [2.2, 0.47], [3, 0.33], [9.96, 0.31]], // stands up, then walks left quickly
  [0.36, 0.35],
  [0.35, 0.33],
];

/** FOCUS entry → [[seconds, x], …] waypoints. */
const waypoints = (i, len) => {
  const f = FOCUS[i];
  return Array.isArray(f[0]) ? f : [[0, f[0]], [len, f[1]]];
};

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

  /** Join the shots (each through `shape(i)`) and encode for scrubbing. */
  const encode = (shape, out, { crf, gop }) => {
    const filters = shots.map((_, i) => `[${i}:v]fps=${FPS},${shape(i)},setsar=1,trim=duration=${lengths[i]},setpts=PTS-STARTPTS[v${i}]`);
    run([
      "-y",
      ...shots.flatMap((f) => ["-i", f]),
      "-filter_complex",
      `${filters.join(";")};${shots.map((_, i) => `[v${i}]`).join("")}concat=n=${SHOTS}:v=1:a=0[v]`,
      "-map", "[v]",
      "-an",
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", String(crf),
      "-pix_fmt", "yuv420p",
      "-g", String(gop), // frequent keyframes → quick seeks in both directions
      "-keyint_min", String(gop),
      "-sc_threshold", "0",
      "-bf", "0",
      "-tune", "animation",
      "-movflags", "+faststart",
      out,
    ]);
  };

  // 1a. Landscape film (desktop / tablets in landscape): crop off the watermark strip
  const film = path.join(OUT, "film.mp4");
  encode(() => `crop=iw*${CROP_W.toFixed(4)}:ih:0:0,scale=${OUT_W}:-2:flags=lanczos`, film, { crf: 26, gop: 6 });

  // 1b. Portrait film (phones): a 9:16 window that follows Abin through each
  //     shot (FOCUS start → end), so phones get a sharp, pre-framed picture
  //     and decode far fewer pixels per seek. Shorter GOP = snappier on iOS.
  const portrait = path.join(OUT, "film-portrait.mp4");
  encode(
    (i) => {
      const pts = waypoints(i, lengths[i]);
      // piecewise-linear focus(t) as nested if(lt(t,…)) — commas escaped for the filtergraph
      let f = String(pts[pts.length - 1][1]);
      for (let k = pts.length - 2; k >= 0; k--) {
        const [t0, x0] = pts[k];
        const [t1, x1] = pts[k + 1];
        f = `if(lt(t\\,${t1})\\,${x0}+(${x1 - x0})*(t-${t0})/${t1 - t0}\\,${f})`;
      }
      const x = `clip((${f})*iw-ow/2\\,0\\,iw-ow)`;
      return `crop=w=ih*9/16:h=ih:x='${x}':y=0,scale=${PORTRAIT_W}:${PORTRAIT_H}:flags=lanczos`;
    },
    portrait,
    { crf: 28, gop: 4 }
  );

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
  // start/end focus per shot, in the landscape film's (cropped) width — used by the
  // keyframe stills on portrait screens
  const focus = FOCUS.map((_, i) => {
    const pts = waypoints(i, lengths[i]);
    return [pts[0][1], pts[pts.length - 1][1]].map((v) => Number(Math.min(1, v / CROP_W).toFixed(3)));
  });

  const data = {
    src: "/film/film.mp4",
    poster: "/film/poster.jpg",
    width,
    height,
    portrait: { src: "/film/film-portrait.mp4", width: PORTRAIT_W, height: PORTRAIT_H },
    fps: FPS,
    duration: Number(t.toFixed(4)),
    shots: shotTimes,
    focus,
    stills,
  };
  fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + "\n");

  const mb = (f) => (fs.statSync(f).size / 1024 / 1024).toFixed(2);
  console.log(`film.mp4: ${width}×${height}, ${t.toFixed(2)}s, ${mb(film)} MB`);
  console.log(`film-portrait.mp4: ${PORTRAIT_W}×${PORTRAIT_H}, ${mb(portrait)} MB`);
  console.log(`stills: ${stills.length}`);
  console.log("data →", path.relative(ROOT, DATA));
})().catch((e) => {
  console.error(e.stderr ? String(e.stderr) : e);
  process.exit(1);
});
