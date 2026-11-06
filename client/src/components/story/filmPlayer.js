/**
 * Playback of the homepage film.
 *
 * The <video> plays the file from its normal URL; the browser buffers it
 * (preload="auto") and fetches any part it still needs with HTTP range
 * requests, which Firebase Hosting supports. (An in-memory blob URL was tried
 * first and is NOT used: Safari/WebKit refuses to play MP4 from blob URLs.)
 *
 * Two ways to drive it:
 *  • seek(t)          — desktop: scrubbed frame-by-frame by scroll. Only the
 *                       latest requested time is applied, and never while the
 *                       previous seek is still decoding, so fast scrolling
 *                       stays smooth in both directions.
 *  • play(a, b)/hold  — phones: play a shot in real time, then hold its last
 *                       frame (phones play video well but seek poorly).
 *
 * The video is only revealed once it has really decoded a frame; if it fails
 * to load, the still keyframes underneath simply stay visible.
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

export function createFilm(video, src, { onReady, onProgress } = {}) {
  let target = 0;
  let ready = false;
  let raf = 0;
  let destroyed = false;
  let segment = null; // { end } while a shot is playing (phones)
  let pending = null; // play request made before the film was ready
  let watch = 0;

  // Attributes Safari checks for inline, muted, script-driven playback.
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.preload = "auto";

  /* ---------- scrub mode ---------- */
  const apply = () => {
    raf = 0;
    if (destroyed || !ready || segment || video.seeking) return;
    if (Math.abs(video.currentTime - target) > 0.5 / 24) video.currentTime = target;
  };
  const request = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };

  /* ---------- loading ---------- */
  /** play() then pause() — makes iOS load and paint frames. Returns success. */
  const prime = async () => {
    try {
      await video.play();
      if (!segment) video.pause();
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
  const onProgressEvent = () => {
    if (!video.duration || !video.buffered.length) return;
    onProgress?.(Math.min(1, video.buffered.end(video.buffered.length - 1) / video.duration));
  };
  const onLoaded = () => {
    if (ready || destroyed || video.readyState < 2) return;
    ready = true;
    if (pending) film.play(pending.start, pending.end);
    else video.currentTime = target;
    onReady?.();
  };
  const onError = () => {
    // keep the stills; nothing else to do
    console.warn("Film failed to load:", video.error?.code, video.error?.message);
  };

  video.addEventListener("seeked", request);
  video.addEventListener("progress", onProgressEvent);
  video.addEventListener("loadeddata", onLoaded);
  video.addEventListener("canplay", onLoaded);
  video.addEventListener("error", onError);

  video.src = src;
  video.load();
  prime().then((ok) => {
    if (!ok && !destroyed) {
      window.addEventListener("touchstart", unlock, { passive: true });
      window.addEventListener("pointerdown", unlock, { passive: true });
    }
  });

  /* ---------- play mode (phones) ---------- */
  const stopAt = (t) => {
    segment = null;
    cancelAnimationFrame(watch);
    video.pause();
    target = t;
    if (ready) video.currentTime = t;
  };
  const watchEnd = () => {
    if (!segment) return;
    if (video.currentTime >= segment.end - 0.5 / 24) stopAt(segment.end);
    else watch = requestAnimationFrame(watchEnd);
  };

  const film = {
    /** Scrub mode: show the frame at time t (driven by scroll). */
    seek(t) {
      if (segment) return;
      target = t;
      request();
    },
    /** Play mode: play [start, end] in real time, then hold the last frame. */
    play(start, end) {
      cancelAnimationFrame(watch);
      target = end; // what to show if playback can't start
      if (!ready) {
        pending = { start, end }; // e.g. the first scene, requested before the film loaded
        return;
      }
      pending = null;
      segment = { end };
      video.currentTime = start;
      video
        .play()
        .then(() => {
          watch = requestAnimationFrame(watchEnd);
        })
        .catch(() => stopAt(end));
    },
    /** Play mode: jump straight to a frame and hold it. */
    hold(t) {
      pending = null;
      stopAt(t);
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(watch);
      video.removeEventListener("seeked", request);
      video.removeEventListener("progress", onProgressEvent);
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("canplay", onLoaded);
      video.removeEventListener("error", onError);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("pointerdown", unlock);
      video.pause();
      video.removeAttribute("src");
      video.load();
      if (current === film) current = null;
    },
  };
  current = film;
  return film;
}
