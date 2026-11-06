import { site } from "@/data/site";
import { story } from "@/data/story";
import { experience } from "@/data/experience";

/* Shared overlay positions: right column on desktop, lower band on mobile. */
const RIGHT_COL = "absolute inset-x-5 bottom-[5svh] lg:inset-x-auto lg:bottom-auto lg:left-[54vw] lg:right-[5vw] lg:top-0 lg:flex lg:h-full lg:items-center";

function Kicker({ children }) {
  return <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">{children}</p>;
}

/* ------------------------------------------------------------- */
/* Scene 01 — title sequence in the dark right side of the frame */
/* ------------------------------------------------------------- */
export function IntroOverlay() {
  return (
    <>
      <div className={RIGHT_COL}>
        <div>
          <p data-st="intro-kicker" className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-fg-subtle opacity-0">
            {story.intro.kicker}
          </p>
          <h1 data-st="name" className="font-display text-[15vw] font-bold uppercase leading-[0.86] tracking-[-0.04em] text-fg opacity-0 lg:text-[7.4vw]">
            {site.name.split(" ").map((w) => (
              <span key={w} className="block">
                {w}
              </span>
            ))}
            <span className="sr-only"> — {site.role}</span>
          </h1>
          <p data-st="intro-title" className="mt-5 font-mono text-xs uppercase tracking-[0.28em] text-accent opacity-0" aria-hidden>
            {site.role}
          </p>
          <p data-st="intro-line" className="mt-3 max-w-md font-display text-xl font-medium leading-snug tracking-tight text-fg-muted opacity-0 sm:text-2xl">
            {site.intro}
          </p>
        </div>
      </div>
      <div
        data-st="cue"
        className="absolute bottom-[4svh] left-5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.25em] text-fg-subtle sm:left-8 max-lg:hidden"
      >
        <span className="relative h-10 w-px overflow-hidden bg-line-strong">
          <span className="anim-cue absolute inset-x-0 top-0 h-1/2 bg-accent" />
        </span>
        {story.intro.scrollCue}
      </div>
    </>
  );
}


export function EditingOverlay() {
  return (
    <div className={RIGHT_COL}>
      <div data-st="editing" className="opacity-0">
        <Kicker>{story.editing.kicker}</Kicker>
        <p className="font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-[4.2vw]">
          {story.editing.line1}
          <span className="mt-2 block text-fg-subtle">{story.editing.line2}</span>
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------- */
/* Scene 03 — skills as clips on an edit timeline */
/* -------------------------------------------- */
export function SkillsOverlay() {
  const { skills } = story;
  const circ = 2 * Math.PI * 22;
  return (
    <div className={RIGHT_COL}>
      <div data-st="skills" className="w-full opacity-0">
        <Kicker>{skills.kicker}</Kicker>
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[3.2vw]">{skills.heading}</h2>

        {/* software */}
        <ul className="mt-6 grid grid-cols-2 gap-3 lg:mt-8">
          {skills.software.map((s) => (
            <li key={s.short} data-st="app" className="flex items-center gap-3 rounded-xl border border-line bg-panel/70 p-3 backdrop-blur">
              <span className="relative grid h-12 w-12 shrink-0 place-items-center">
                <svg viewBox="0 0 50 50" className="absolute inset-0 -rotate-90" aria-hidden>
                  <circle cx="25" cy="25" r="22" fill="none" stroke="var(--color-line-strong)" strokeWidth="2" />
                  <circle
                    data-st="arc"
                    data-level={s.level}
                    cx="25"
                    cy="25"
                    r="22"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={circ * (1 - s.level)}
                  />
                </svg>
                <span className="font-display text-base font-bold text-fg">{s.short}</span>
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-fg">{s.name}</span>
                <span className="block truncate font-mono text-[10px] text-fg-subtle">{s.note}</span>
              </span>
            </li>
          ))}
        </ul>

        {/* timeline panel */}
        <div className="mt-4 rounded-xl border border-line bg-panel/80 p-3 backdrop-blur lg:mt-5 lg:p-4">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-fg-subtle">
            <span>SEQ — Abin_Skills_v3</span>
            <span data-st="tc" className="tabular-nums text-accent">
              00:00:00:00
            </span>
          </div>
          <div className="relative space-y-1.5">
            {skills.tracks.map((t) => (
              <div key={t.id} className="grid grid-cols-[2rem_1fr] gap-2">
                <span className="flex items-center font-mono text-[10px] text-fg-subtle">{t.id}</span>
                <div className="relative h-7 rounded-[3px] bg-white/[0.03] lg:h-8">
                  {t.clips.map((c) => (
                    <span
                      key={c.label}
                      data-st="clip"
                      data-start={c.start}
                      data-end={c.end}
                      className={`absolute inset-y-0 overflow-hidden rounded-[3px] border px-2 ${
                        t.audio
                          ? "border-emerald-300/25 bg-[repeating-linear-gradient(90deg,rgba(110,231,183,0.25)_0_2px,transparent_2px_5px)]"
                          : "border-accent/25 bg-accent-deep/40"
                      }`}
                      style={{ left: `${c.start * 100}%`, width: `${(c.end - c.start) * 100}%` }}
                    >
                      <span data-st="clip-hl" className="absolute inset-0 bg-accent/25 opacity-0" aria-hidden />
                      <span className="relative flex h-full items-center truncate text-[11px] font-medium text-fg lg:text-xs">{c.label}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div data-st="lanes" className="pointer-events-none absolute inset-y-0 left-[2.5rem] right-0" aria-hidden>
              <span data-st="playhead" className="absolute -top-1 bottom-0 left-0 w-0.5 bg-accent shadow-[0_0_10px_rgba(79,216,235,0.9)]">
                <span className="absolute -left-1 -top-1 h-2.5 w-2.5 rotate-45 bg-accent" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- */
/* Scene 04 — experience     */
/* ------------------------- */
export function ExperienceOverlay() {
  const { experience: ex } = story;
  return (
    <div className="absolute inset-x-5 top-[14svh] bottom-[5svh] flex items-end lg:inset-x-auto lg:bottom-auto lg:left-[50vw] lg:right-[5vw] lg:top-0 lg:h-full lg:items-center">
      <div data-st="experience" className="w-full opacity-0">
        <Kicker>{ex.kicker}</Kicker>
        <div className="flex items-end gap-4">
          <p className="font-display text-[26vw] font-bold leading-[0.8] tracking-[-0.05em] text-fg lg:text-[11vw]">
            <span data-st="counter" data-target={ex.years}>
              {ex.years}
            </span>
            <span className="text-accent">{ex.suffix}</span>
          </p>
          <h2 className="mb-2 max-w-[14rem] font-display text-xl font-semibold uppercase leading-tight tracking-tight sm:text-2xl lg:text-[1.9vw]">
            {ex.heading}
          </h2>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 lg:mt-8">
          {ex.highlights.map((h) => (
            <li key={h.label} data-st="hl">
              <p className="font-display text-xl font-semibold text-fg lg:text-2xl">{h.value}</p>
              <p className="text-sm text-fg-subtle">{h.label}</p>
            </li>
          ))}
        </ul>

        <ol className="mt-6 space-y-3 border-t border-line pt-5">
          {experience.map((job) => (
            <li key={`${job.company}-${job.period}`} data-st="hl" className="grid grid-cols-[6.5rem_1fr] gap-3 text-sm">
              <span className="font-mono text-[11px] text-fg-subtle">{job.period}</span>
              <span>
                <span className="font-medium text-fg">{job.title}</span>
                <span className="text-fg-subtle"> · {job.company}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
