import { useEffect, useRef } from "react";

// Lightweight atmospheric dust. One canvas, ~60 particles, paused when the
// stage is off-screen or the tab is hidden; drawn once for reduced motion.
export default function Particles({ className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    const count = window.innerWidth < 768 ? 30 : 60;
    const ps = [];

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    for (let i = 0; i < count; i++) {
      ps.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.3,
        vy: -(Math.random() * 0.18 + 0.04),
        vx: (Math.random() - 0.5) * 0.08,
        a: Math.random() * 0.45 + 0.08,
        cyan: Math.random() > 0.55,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.cyan ? `rgba(79,216,235,${p.a})` : `rgba(237,241,244,${p.a * 0.7})`;
        ctx.fill();
      }
    };

    const step = () => {
      for (const p of ps) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
      }
      draw();
      raf = visible && !document.hidden ? requestAnimationFrame(step) : 0;
    };

    const start = () => {
      if (!raf && !reduce && visible && !document.hidden) raf = requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(canvas);
    const onVis = () => start();
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", resize);

    if (reduce) draw();
    else start();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}
