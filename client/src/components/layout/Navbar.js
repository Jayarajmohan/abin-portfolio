import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { site } from "@/data/site";
import { ease } from "@/lib/animations";

const links = [
  { href: "/#story", label: "Story" },
  { href: "/#skills", label: "Skills" },
  { href: "/#experience", label: "Experience" },
  { href: "/#work", label: "Work" },
];

export default function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (open) return;
    setHidden(y > prev && y > 160);
  });

  return (
    <motion.header
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease }}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open ? "border-line/60 bg-ink/60 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 sm:px-8" aria-label="Main">
        <Link href="/" className="flex items-center gap-3 font-display text-lg font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md border border-accent/60 font-mono text-xs font-bold text-accent">
            {site.name
              .split(" ")
              .map((w) => w[0])
              .join("")}
          </span>
          <span className="uppercase tracking-[0.12em]">{site.shortName}</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm text-fg-muted transition-colors hover:text-fg">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/#contact"
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5"
            >
              Start a project
            </Link>
          </li>
        </ul>

        <button
          type="button"
          className="relative grid h-11 w-11 place-items-center rounded-full border border-line-strong md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span
            className={`absolute h-px w-5 bg-fg transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-1"}`}
          />
          <span
            className={`absolute h-px w-5 bg-fg transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-1"}`}
          />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden border-t border-line md:hidden"
          >
            <ul className="flex flex-col px-5 py-4">
              {[...links, { href: "/#contact", label: "Contact" }].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center font-display text-2xl text-fg"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
