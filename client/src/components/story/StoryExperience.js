import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import Film from "./Film";
import Particles from "./Particles";
import { IntroOverlay, EditingOverlay, SkillsOverlay, ExperienceOverlay } from "./Scenes";
import WorksScene from "./WorksScene";
import ContactScene from "./ContactScene";
import { buildStory } from "./timeline";

/**
 * The homepage as one continuous short film, played by scrolling.
 *
 *  ┌ wrapper ─────────────────────────────────────────────┐
 *  │ sticky stage (100svh): the film (scrubbed video) +   │  ← driven by ONE
 *  │   shading + text overlays in the dark right side     │    scrubbed timeline
 *  │ flow column (scrolls over the stage):                │
 *  │   intro · editing · skills · experience  (spacers)   │  ← define the timing
 *  │   works (horizontal gallery) · contact               │  ← real content
 *  └──────────────────────────────────────────────────────┘
 */
export default function StoryExperience() {
  const root = useRef(null);
  const [layoutKey, setLayoutKey] = useState(0);

  // Rebuild the timeline when the width changes or web fonts finish loading.
  useEffect(() => {
    let width = window.innerWidth;
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (window.innerWidth !== width) {
          width = window.innerWidth;
          setLayoutKey((k) => k + 1);
        }
      }, 250);
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => setLayoutKey((k) => k + 1));
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // NB: gsap.matchMedia only runs this when at least one condition matches,
      // so phones need their own condition or the story never gets built.
      mm.add({ desktop: "(min-width: 1024px)", mobile: "(max-width: 1023.98px)", reduce: "(prefers-reduced-motion: reduce)" }, (ctx) => {
        buildStory(root.current, ctx.conditions);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [layoutKey], revertOnUpdate: true }
  );

  return (
    <div ref={root} className="relative">
      {/* ---------- persistent stage ---------- */}
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-ink">
        <Film />

        {/* readability: dark right side on desktop, dark lower band on phones */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62vw] bg-gradient-to-l from-ink/85 via-ink/45 to-transparent lg:block" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62svh] bg-gradient-to-t from-ink via-ink/75 to-transparent lg:hidden" aria-hidden />

        <Particles className="opacity-50" />

        {/* cinematic vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55))]" aria-hidden />

        <IntroOverlay />
        <EditingOverlay />
        <SkillsOverlay />
        <ExperienceOverlay />

        <div data-st="vignette" className="pointer-events-none absolute inset-0 bg-ink opacity-0" aria-hidden />
        <div data-st="fade" className="pointer-events-none absolute inset-0 bg-ink opacity-0" aria-hidden />
      </div>

      {/* ---------- flow column: scenes that drive the timeline ---------- */}
      <div data-flow className="relative z-10 -mt-[100svh]">
        <section data-scene="intro" className="pointer-events-none h-[230svh]" aria-hidden />
        <section id="story" data-scene="editing" className="pointer-events-none h-[240svh]" aria-hidden />
        <section id="skills" data-scene="skills" className="pointer-events-none h-[280svh]" aria-hidden />
        <section id="experience" data-scene="experience" className="pointer-events-none h-[240svh]" aria-hidden />
        <WorksScene />
        <ContactScene />
      </div>
    </div>
  );
}
