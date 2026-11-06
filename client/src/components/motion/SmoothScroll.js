import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { useReducedMotion } from "motion/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// Drive Lenis from GSAP's ticker so smooth scroll and ScrollTrigger
// share one frame loop (no jitter between scroll and scrubbed animation).
function GsapBridge() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const tick = (time) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
    };
  }, [lenis]);
  return null;
}

// Smooth scrolling for the whole page. Skipped when the visitor has asked
// their OS to reduce motion (and during SSR, where the preference is unknown).
export default function SmoothScroll({ children }) {
  const reduce = useReducedMotion();
  if (reduce !== false) return children;

  return (
    <ReactLenis root options={{ lerp: 0.09, autoRaf: false, anchors: true }}>
      <GsapBridge />
      {children}
    </ReactLenis>
  );
}
