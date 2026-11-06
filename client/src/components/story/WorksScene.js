import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Thumb from "@/components/ui/Thumb";
import VideoModal from "@/components/ui/VideoModal";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { story } from "@/data/story";

// Desktop track geometry, in vw, so the section height can be pure CSS.
const CARD = 44;
const GAP = 4;
const PAD_L = 50; // the left half of the frame is where Abin stands in the film
const PAD_R = 8;

const items = [
  {
    key: "showreel",
    title: site.showreel.title,
    category: "Showreel",
    year: site.showreel.year,
    summary: site.showreel.description,
    software: ["Premiere Pro", "After Effects"],
    provider: site.showreel.provider,
    videoId: site.showreel.id,
    thumb: site.showreel.thumb,
    duration: "00:02:00:00",
  },
  ...projects.map((p) => ({ key: p.slug, ...p })),
];

function Brackets() {
  const base = "absolute h-5 w-5 border-accent transition-all duration-500 group-hover:h-8 group-hover:w-8";
  return (
    <span aria-hidden>
      <span className={`${base} left-3 top-3 border-l-2 border-t-2`} />
      <span className={`${base} right-3 top-3 border-r-2 border-t-2`} />
      <span className={`${base} bottom-3 left-3 border-b-2 border-l-2`} />
      <span className={`${base} bottom-3 right-3 border-b-2 border-r-2`} />
    </span>
  );
}

function WorkCard({ item, index, onWatch }) {
  return (
    <article data-card className="group w-full shrink-0 lg:w-[44vw]">
      <div className="relative aspect-video overflow-hidden rounded-lg border border-line bg-surface shadow-[0_40px_100px_-40px_rgba(79,216,235,0.35)]">
        <div data-parallax className="absolute inset-y-0 -left-[8%] -right-[8%]">
          <Thumb
            src={item.thumb}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <span className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" aria-hidden />
        <Brackets />
        <span className="absolute left-5 top-5 font-mono text-[11px] text-fg-muted">
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
        <span className="absolute bottom-5 right-5 rounded bg-ink/70 px-2 py-1 font-mono text-[11px] text-fg-muted backdrop-blur">
          {item.duration}
        </span>
        <button
          type="button"
          onClick={() => onWatch(item)}
          className="absolute inset-0 grid place-items-center"
          aria-label={`Watch ${item.title}`}
        >
          <span className="grid h-16 w-16 scale-90 place-items-center rounded-full bg-accent text-ink opacity-90 shadow-[0_0_0_10px_rgba(79,216,235,0.15)] transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
            {item.category} · {item.year}
          </p>
          <h3 className="mt-1.5 font-display text-2xl font-semibold tracking-tight lg:text-[1.9vw]">{item.title}</h3>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-fg-muted line-clamp-2">{item.summary}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {item.software?.map((s) => (
              <li key={s} className="rounded-full border border-line-strong px-2.5 py-0.5 font-mono text-[10px] text-fg-subtle">
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onWatch(item)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
          >
            Watch <span aria-hidden>▶</span>
          </button>
          {item.slug && (
            <Link
              href={`/work/${item.slug}`}
              className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-4 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
            >
              View project
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default function WorksScene() {
  const section = useRef(null);
  const track = useRef(null);
  const [active, setActive] = useState(null);
  const close = useCallback(() => setActive(null), []);

  const n = items.length;
  const dist = PAD_L + n * CARD + (n - 1) * GAP + PAD_R - 100;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const scroll = gsap.to(track.current, {
          x: () => -(track.current.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true },
        });
        // inner parallax: each thumbnail drifts against the track
        track.current.querySelectorAll("[data-card]").forEach((card) => {
          gsap.fromTo(
            card.querySelector("[data-parallax]"),
            { xPercent: 6 },
            { xPercent: -6, ease: "none", scrollTrigger: { trigger: card, containerAnimation: scroll, start: "left right", end: "right left", scrub: true } }
          );
          gsap.fromTo(
            card,
            { opacity: 0.35, scale: 0.94 },
            { opacity: 1, scale: 1, ease: "power1.out", scrollTrigger: { trigger: card, containerAnimation: scroll, start: "left 95%", end: "left 55%", scrub: true } }
          );
        });
        ScrollTrigger.refresh();
      });
      // Reduced motion on desktop: native horizontal scroll instead of scroll-jacking.
      return () => mm.revert();
    },
    { scope: section }
  );

  return (
    <section
      ref={section}
      id="work"
      data-scene="work"
      className="relative lg:h-[var(--works-h)] motion-reduce:lg:h-auto"
      style={{ "--works-h": `calc(100svh + ${dist}vw)` }}
      aria-labelledby="works-heading"
    >
      <div className="lg:sticky lg:top-0 lg:h-[100svh] lg:overflow-hidden motion-reduce:lg:static motion-reduce:lg:h-auto">
        <header className="px-5 pt-28 sm:px-8 lg:absolute lg:left-[50vw] lg:top-[11svh] lg:p-0 motion-reduce:lg:static motion-reduce:lg:px-[5vw] motion-reduce:lg:pl-[50vw]">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">{story.works.kicker}</p>
          <h2 id="works-heading" className="font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[3.6vw]">
            {story.works.heading}
          </h2>
        </header>
        <div className="lg:absolute lg:inset-x-0 lg:top-[25svh] lg:[mask-image:linear-gradient(to_right,transparent_20vw,black_44vw)] motion-reduce:lg:static motion-reduce:lg:overflow-x-auto motion-reduce:lg:[mask-image:none]">
          <div
            ref={track}
            className="flex flex-col gap-16 px-5 pb-28 pt-10 sm:px-8 lg:w-max lg:flex-row lg:gap-[4vw] lg:p-0 lg:pl-[50vw] lg:pr-[8vw] motion-reduce:lg:pb-16"
          >
            {items.map((item, i) => (
              <WorkCard key={item.key} item={item} index={i} onWatch={setActive} />
            ))}
          </div>
        </div>
      </div>
      <VideoModal item={active} onClose={close} />
    </section>
  );
}
