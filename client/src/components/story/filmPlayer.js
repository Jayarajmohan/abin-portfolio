/**
 * Scroll-scrubbed playback of the homepage film (public/film/film.mp4).
 *
 * The whole file is downloaded once and played from memory (blob URL), so
 * seeking never waits on the network. `seek(t)` only records the wanted time;
 * the next animation frame applies it, skipping intermediate requests while
 * the browser is still decoding the previous seek — that's what keeps fast
 * scrolling smooth in both directions.
 */
let current = null;
export const getFilm = () => current;

export function createFilm(video, src, { onReady } = {}) {
  let target = 0;
  let ready = false;
  let raf = 0;
  let url = null;
  let destroyed = false;
  const abort = new AbortController();

  const apply = () => {
    raf = 0;
    if (destroyed || !ready || video.seeking) return;
    if (Math.abs(video.currentTime - target) > 0.5 / 24) video.currentTime = target;
  };
  const request = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };
  video.addEventListener("seeked", request);

  fetch(src, { signal: abort.signal })
    .then((r) => {
      if (!r.ok) throw new Error(`Film request failed: ${r.status}`);
      return r.blob();
    })
    .then((blob) => {
      url = URL.createObjectURL(blob);
      video.src = url;
      return new Promise((resolve) => video.addEventListener("loadeddata", resolve, { once: true }));
    })
    .then(async () => {
      // iOS only paints seeked frames after the video has played once
      try {
        await video.play();
      } catch {
        /* autoplay refused — seeking still works on desktop browsers */
      }
      video.pause();
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
      video.removeAttribute("src");
      video.load();
      if (url) URL.revokeObjectURL(url);
      if (current === film) current = null;
    },
  };
  current = film;
  return film;
}
