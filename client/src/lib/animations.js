// Shared Motion variants and easing so the whole site moves the same way.
export const ease = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

export const wordUp = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.8, ease } },
};
