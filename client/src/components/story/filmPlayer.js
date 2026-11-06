/**
 * Scroll-scrubbed playback of the homepage film.
 *
 * The whole file is downloaded once and played from memory (blob URL), so
 * seeking never waits on the network. `seek(t)` only records the wanted time;
 * the next animation frame applies it, skipping intermediate requests while
 * the browser is still decoding the previous seek — that's what keeps fast
 * scrolling smooth in both directions.
 *
 * Mobile notes:
 *  • iOS Safari doesn't load video data until play() is called, and only
 *    paints seeked frames after the video has played once — so we play()
 *    immediately (muted + inline is allowed) and pause as soon as it starts.
 *  • Low Power Mode / data saver can refuse play(); then we retry on the
 *    visitor's first touch, which always counts as a user gesture.
 */
let current = null;
export const getFilm = () => current;

const once = (el, events, ms) =>
  new Promise((resolve) => {
    const done = () => {
      events.forEach((e) => el.removeEventListener(e, done));
      clearTimeout(timer);
      resolve();
    };
    events.forEach((e) => el.addEventListener(e, done, { once: true }));
    const timer = setTimeout(done, ms);
  });

async function download(src, signal, onProgress) {
  const res = await fetch(src, { signal });
  if (!res.ok) throw new Error(`Film request failed: ${res.status}`);
  const total = Number(res.headers.get("content-length")) || 0;
  if (!res.body || !total) return res.blob();
  const reader = res.body.getReader();
  const chunks = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress?.(loaded / total);
  }
  return new Blob(chunks, { type: res.headers.get("content-type") || "video/mp4" });
}

export function createFilm(video, src, { onReady, onProgress } = {}) {
  let target = 0;
  let ready = false;
  let raf = 0;
  let url = null;
  let destroyed = false;
  const abort = new AbortController();

  // Attributes Safari checks for inline, muted, script-driven playback.
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.preload = "auto";

  const apply = () => {
    raf = 0;
    if (destroyed || !ready || video.seeking) return;
    if (Math.abs(video.currentTime - target) > 0.5 / 24) video.currentTime = target;
  };
  const request = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };
  video.addEventListener("seeked", request);

  /** play() then pause() — makes iOS load and paint frames. Returns success. */
  const prime = async () => {
    try {
      await video.play();
      video.pause();
      return true;
    } catch {
      return false;
    }
  };
  const unlock = async () => {
    if (await prime()) {
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
      request();
    }
  };

  download(src, abort.signal, onProgress)
    .then(async (blob) => {
      if (destroyed) return;
      url = URL.createObjectURL(blob);
      video.src = url;
      video.load();
      const primed = prime(); // starts loading on iOS
      await once(video, ["loadeddata", "canplay"], 4000);
      if (!(await primed)) {
        window.addEventListener("touchstart", unlock, { passive: true });
        window.addEventListener("pointerdown", unlock, { passive: true });
      }
      if (destroyed) return;
      ready = true;
      video.currentTime = target;
      onReady?.();
    })
    .catch(() => {
      /* offline / aborted: the still frames stay visible */
    });

  const film = {
    seek(t) {
      target = t;
      request();
    },
    destroy() {
      destroyed = true;
      abort.abort();
      cancelAnimationFrame(raf);
      video.removeEventListener("seeked", request);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
      video.removeAttribute("src");
      video.load();
      if (url) URL.revokeObjectURL(url);
      if (current === film) current = null;
    },
  };
  current = film;
  return film;
}
