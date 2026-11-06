import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLenis } from "lenis/react";
import VideoEmbed from "./VideoEmbed";
import { ease } from "@/lib/animations";

// Full-screen cinematic lightbox for a video. Esc or the backdrop closes it.
export default function VideoModal({ item, onClose }) {
  const lenis = useLenis();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!item) return;
    const prev = document.activeElement;
    lenis?.stop();
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      prev?.focus?.();
    };
  }, [item, lenis, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center bg-ink/90 p-4 backdrop-blur-md sm:p-10"
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          data-lenis-prevent
        >
          <motion.div
            className="w-full max-w-6xl"
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 10 }}
            transition={{ duration: 0.45, ease }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="truncate font-display text-lg font-medium">{item.title}</p>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line-strong text-fg hover:border-accent hover:text-accent"
                aria-label="Close video"
              >
                ✕
              </button>
            </div>
            <VideoEmbed provider={item.provider} id={item.videoId} thumb={item.thumb} title={item.title} autoStart />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
