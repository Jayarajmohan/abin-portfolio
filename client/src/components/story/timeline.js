import { gsap } from "@/lib/gsap";
import film from "@/data/film.json";
import { getFilm } from "./filmPlayer";

const FPS = 25;
const timecode = (frames) => {
  const pad = (n) => String(Math.floor(n)).padStart(2, "0");
  const s = frames / FPS;
  return `${pad(s / 3600)}:${pad((s / 60) % 60)}:${pad(s % 60)}:${pad(frames % FPS)}`;
};

/**
 * Which shot of the film plays in which scene, and over which part of the
 * scene (0–1). After its range a shot holds on its last frame, so the text
 * that follows can be read over a still image.
 */
const CUTS = [
  { scene: "intro", shot: 0, from: 0, to: 0.85 },
  { scene: "editing", shot: 1, from: 0, to: 0.8 },
  { scene: "skills", shot: 2, from: 0, to: 0.9 },
  { scene: "experience", shot: 3, from: 0, to: 0.8 },
  { scene: "work", shot: 4, from: 0, to: 0.22 },
  { scene: "contact", shot: 5, from: 0, to: 0.6 },
];

/**
 * Builds the single scrubbed master timeline for the story.
 *
 * Time on the timeline == pixels scrolled through the story wrapper, so a
 * tween placed at `at("skills", 0.5)` fires exactly when the visitor is halfway
 * through the Skills scene, whatever the screen size. Scene positions are
 * measured from the real [data-scene] sections in the flow column.
 */
export function buildStory(root, { reduce }) {
  const q = (s) => root.querySelector(`[data-st="${s}"]`);
  const qa = (s) => gsap.utils.toArray(root.querySelectorAll(`[data-st="${s}"]`));

  const total = Math.max(1, root.offsetHeight - window.innerHeight);
  const S = {};
  root.querySelectorAll("[data-flow] [data-scene]").forEach((node) => {
    const start = node.offsetTop;
    S[node.dataset.scene] = { start, len: Math.max(1, Math.min(node.offsetHeight, total - start)) };
  });
  const at = (id, f) => S[id].start + S[id].len * f;
  const dur = (id, f) => S[id].len * f;

  const el = {
    video: q("film"),
    stills: qa("still"),
    kicker: q("intro-kicker"),
    name: q("name"),
    title: q("intro-title"),
    line: q("intro-line"),
    cue: q("cue"),
    editing: q("editing"),
    skills: q("skills"),
    apps: qa("app"),
    arcs: qa("arc"),
    clips: qa("clip"),
    lanes: q("lanes"),
    playhead: q("playhead"),
    tc: q("tc"),
    exp: q("experience"),
    counter: q("counter"),
    hls: qa("hl"),
    vignette: q("vignette"),
    fade: q("fade"),
  };

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: reduce ? 0.4 : 0.8 },
  });
  tl.set({}, {}, total); // timeline length == scroll distance

  /* ---------------- the film ---------------- */

  // Portrait screens crop the film: keep Abin in view by moving the crop.
  // The portrait film (phones) is already framed around him, so only the
  // stills — and the landscape film on other portrait screens — need moving.
  const portraitFilm = el.video?.dataset.variant === "portrait";
  if (portraitFilm) gsap.set(el.video, { objectPosition: "50% 50%" });
  const media = portraitFilm ? el.stills : [el.video, ...el.stills];
  const visible = Math.min(1, window.innerWidth / window.innerHeight / (film.width / film.height));
  const frame = (x) => {
    if (visible >= 0.999) return "50% 45%";
    const p = gsap.utils.clamp(0, 1, (x - visible / 2) / (1 - visible));
    return `${(p * 100).toFixed(2)}% 45%`;
  };
  gsap.set(media, { objectPosition: frame(film.focus[0][0]) });

  // Keyframe stills: shown while the film loads, and on their own for reduced
  // motion. Shot N runs from still N to still N+1, so they cross-fade at each cut.
  gsap.set(el.stills, { opacity: (i) => (i === 0 ? 1 : 0) });
  CUTS.forEach(({ scene, shot, to }) => {
    const next = el.stills[shot + 1];
    if (!next) return;
    tl.to(next, { opacity: 1, duration: dur(scene, 0.08) }, at(scene, to - 0.08));
    tl.to(el.stills[shot], { opacity: 0, duration: dur(scene, 0.08) }, at(scene, to - 0.04));
  });

  const player = reduce ? null : getFilm();
  if (player) {
    const clock = { t: 0 };
    CUTS.forEach(({ scene, shot, from, to }) => {
      const s = film.shots[shot];
      tl.fromTo(clock, { t: s.start }, { t: s.end, duration: dur(scene, to - from), immediateRender: false }, at(scene, from));
    });
    tl.eventCallback("onUpdate", () => player.seek(clock.t));
  }
  if (!reduce) {
    CUTS.forEach(({ scene, shot, from, to }) => {
      const [a, b] = film.focus[shot];
      tl.fromTo(media, { objectPosition: frame(a) }, { objectPosition: frame(b), duration: dur(scene, to - from), immediateRender: false }, at(scene, from));
    });
  }

  /* ---------------- Reduced motion: still frames, opacity only ---------------- */
  if (reduce) {
    gsap.set([el.kicker, el.name, el.title, el.line], { opacity: 1 });
    const show = (target, id) => {
      gsap.set(target, { opacity: 0 });
      tl.to(target, { opacity: 1, duration: dur(id, 0.08) }, at(id, 0.04));
      tl.to(target, { opacity: 0, duration: dur(id, 0.08) }, at(id, 0.88));
    };
    tl.to([el.kicker, el.name, el.title, el.line, el.cue], { opacity: 0, duration: dur("intro", 0.1) }, at("intro", 0.85));
    show(el.editing, "editing");
    show(el.skills, "skills");
    show(el.exp, "experience");
    tl.to(el.vignette, { opacity: 0.35, duration: dur("work", 0.05) }, at("work", 0.2));
    tl.to(el.vignette, { opacity: 0, duration: dur("contact", 0.1) }, at("contact", 0));
    tl.to(el.fade, { opacity: 1, duration: dur("contact", 0.3) }, at("contact", 0.7));
    return tl;
  }

  /* ---------------- overlays ---------------- */
  gsap.set([el.kicker, el.title, el.line], { opacity: 0, y: 20 });
  gsap.set(el.name, { opacity: 0, y: 40 });
  gsap.set(el.editing, { opacity: 0, y: 40 });
  gsap.set(el.skills, { opacity: 0, y: 40 });
  gsap.set(el.apps, { opacity: 0, y: 16 });
  el.arcs.forEach((a) => {
    const len = a.getTotalLength();
    gsap.set(a, { strokeDashoffset: len, strokeDasharray: len });
  });
  gsap.set(el.clips, { opacity: 0, y: -10 });
  gsap.set(el.exp, { opacity: 0, y: 40 });
  gsap.set(el.hls, { opacity: 0, y: 14 });

  /* SCENE 01 — the camera pushes in; title sequence */
  tl.to(el.cue, { opacity: 0, duration: dur("intro", 0.05) }, at("intro", 0));
  tl.to(el.kicker, { opacity: 1, y: 0, duration: dur("intro", 0.12) }, at("intro", 0.04));
  tl.to(el.name, { opacity: 1, y: 0, duration: dur("intro", 0.2), ease: "power2.out" }, at("intro", 0.1));
  tl.to(el.title, { opacity: 1, y: 0, duration: dur("intro", 0.12) }, at("intro", 0.26));
  tl.to(el.line, { opacity: 1, y: 0, duration: dur("intro", 0.12) }, at("intro", 0.34));
  tl.to([el.kicker, el.name, el.title, el.line], { opacity: 0, y: -30, duration: dur("intro", 0.12), stagger: dur("intro", 0.01) }, at("intro", 0.82));

  /* SCENE 02 — he walks to his desk and sits down */
  tl.to(el.editing, { opacity: 1, y: 0, duration: dur("editing", 0.14), ease: "power2.out" }, at("editing", 0.55));
  tl.to(el.editing, { opacity: 0, y: -30, duration: dur("skills", 0.08) }, at("skills", 0));

  /* SCENE 03 — over his shoulder; skills drop onto the timeline */
  tl.to(el.skills, { opacity: 1, y: 0, duration: dur("skills", 0.1), ease: "power2.out" }, at("skills", 0.06));
  tl.to(el.apps, { opacity: 1, y: 0, duration: dur("skills", 0.08), stagger: dur("skills", 0.03) }, at("skills", 0.1));
  el.arcs.forEach((a) => {
    const len = a.getTotalLength();
    tl.to(a, { strokeDashoffset: len * (1 - Number(a.dataset.level)), duration: dur("skills", 0.18), ease: "power2.out" }, at("skills", 0.12));
  });
  const ph0 = 0.16;
  const ph1 = 0.9;
  tl.fromTo(el.playhead, { x: 0 }, { x: el.lanes.offsetWidth, duration: dur("skills", ph1 - ph0) }, at("skills", ph0));
  const tc = { f: 0 };
  tl.to(tc, { f: 25 * 60 + 12, duration: dur("skills", ph1 - ph0), onUpdate: () => (el.tc.textContent = timecode(Math.round(tc.f))) }, at("skills", ph0));
  el.clips.forEach((clip) => {
    const s = Number(clip.dataset.start);
    const e = Number(clip.dataset.end);
    const hit = at("skills", ph0 + s * (ph1 - ph0));
    const hl = clip.querySelector('[data-st="clip-hl"]');
    tl.to(clip, { opacity: 1, y: 0, duration: dur("skills", 0.05), ease: "back.out(2)" }, Math.max(at("skills", 0.12), hit - dur("skills", 0.05)));
    tl.to(hl, { opacity: 1, duration: dur("skills", 0.02) }, hit);
    tl.to(hl, { opacity: 0, duration: dur("skills", 0.03) }, at("skills", ph0 + e * (ph1 - ph0)));
  });
  tl.to(el.skills, { opacity: 0, y: -30, duration: dur("skills", 0.06) }, at("skills", 0.93));

  /* SCENE 04 — he walks to the window; experience */
  tl.to(el.exp, { opacity: 1, y: 0, duration: dur("experience", 0.14), ease: "power2.out" }, at("experience", 0.3));
  const years = Number(el.counter.dataset.target) || 0;
  const counter = { v: 0 };
  tl.to(counter, { v: years, duration: dur("experience", 0.2), onUpdate: () => (el.counter.textContent = Math.round(counter.v)) }, at("experience", 0.32));
  tl.to(el.hls, { opacity: 1, y: 0, duration: dur("experience", 0.08), stagger: dur("experience", 0.03) }, at("experience", 0.4));
  tl.to(el.exp, { opacity: 0, y: -30, duration: dur("experience", 0.08) }, at("experience", 0.9));

  /* SCENE 05 — the wall of screens; the gallery slides over the dark side */
  tl.to(el.vignette, { opacity: 0.35, duration: dur("work", 0.05) }, at("work", 0.2));

  /* SCENE 06 — he turns to the viewer; fade to black */
  tl.to(el.vignette, { opacity: 0, duration: dur("contact", 0.1) }, at("contact", 0));
  tl.to(el.fade, { opacity: 1, duration: dur("contact", 0.3) }, at("contact", 0.7));

  return tl;
}
