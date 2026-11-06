import { useState } from "react";
import Thumb from "./Thumb";

// Shows a thumbnail + play button; the heavy YouTube/Vimeo iframe
// only loads after the visitor clicks.
export default function VideoEmbed({ provider = "youtube", id, thumb, title, priority, autoStart = false, className = "" }) {
  const [play, setPlay] = useState(autoStart);
  const src =
    provider === "vimeo"
      ? `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1`
      : `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;

  return (
    <div className={`relative aspect-video overflow-hidden rounded-xl border border-line bg-surface ${className}`}>
      {play ? (
        <iframe
          src={src}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} aria-label={`Play ${title}`} className="group absolute inset-0 cursor-pointer">
          <Thumb
            src={thumb}
            priority={priority}
            sizes="(min-width: 1152px) 1152px, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" aria-hidden />
          <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-ink shadow-[0_0_0_10px_rgba(79,216,235,0.2)] transition-transform duration-300 group-hover:scale-110 sm:h-22 sm:w-22">
            <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
