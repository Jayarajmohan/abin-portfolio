/* eslint-disable @next/next/no-img-element */
import { useLayoutEffect, useRef } from "react";
import film from "@/data/film.json";
import { createFilm } from "./filmPlayer";

/**
 * Full-screen film layer of the stage.
 *  • <video> — the scroll-scrubbed film (hidden until fully loaded)
 *  • keyframe stills — shown underneath while the film loads, and on their own
 *    (cross-fading per scene) for visitors who prefer reduced motion
 */
export default function Film() {
  const videoRef = useRef(null);

  // Layout effect: the player must exist before the parent builds the timeline.
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const video = videoRef.current;
    const player = createFilm(video, film.src, {
      onReady: () => {
        video.style.opacity = "1";
      },
    });
    return () => {
      player.destroy();
      video.style.opacity = "0";
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
    </div>
  );
}
