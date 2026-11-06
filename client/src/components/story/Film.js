/* eslint-disable @next/next/no-img-element */
import { useLayoutEffect, useRef } from "react";
import film from "@/data/film.json";
import { createFilm } from "./filmPlayer";

/** Portrait screens (phones) get the pre-framed 9:16 film. */
export const isPortraitScreen = () => typeof window !== "undefined" && window.innerWidth / window.innerHeight < 0.9 && !!film.portrait;

/**
 * Full-screen film layer of the stage.
 *  • <video> — the scroll-scrubbed film (hidden until fully loaded)
 *  • keyframe stills — shown underneath while the film loads, and on their own
 *    (cross-fading per scene) for visitors who prefer reduced motion
 *  • a thin loading bar while the film downloads
 */
export default function Film() {
  const videoRef = useRef(null);
  const barRef = useRef(null);

  // Layout effect: the player must exist before the parent builds the timeline.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const video = videoRef.current;
    const bar = barRef.current;
    const portrait = isPortraitScreen();
    video.dataset.variant = portrait ? "portrait" : "landscape";
    bar.style.opacity = "1";
    const player = createFilm(video, portrait ? film.portrait.src : film.src, {
      onProgress: (p) => {
        bar.firstChild.style.transform = `scaleX(${p})`;
      },
      onReady: () => {
        video.style.opacity = "1";
        bar.style.opacity = "0";
      },
    });
    return () => {
      player.destroy();
      video.style.opacity = "0";
      bar.style.opacity = "0";
    };
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden>
      {film.stills.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          data-st="still"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: i === 0 ? 1 : 0 }}
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "low"}
          decoding="async"
          draggable="false"
        />
      ))}
      <video
        ref={videoRef}
        data-st="film"
        muted
        playsInline
        preload="none"
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700"
      />
      <div ref={barRef} className="absolute inset-x-0 bottom-0 z-10 h-0.5 bg-white/5 opacity-0 transition-opacity duration-500">
        <div className="h-full origin-left bg-accent shadow-[0_0_8px_rgba(79,216,235,0.8)] transition-transform duration-200" style={{ transform: "scaleX(0)" }} />
      </div>
    </div>
  );
}
