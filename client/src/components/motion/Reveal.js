import { motion } from "motion/react";
import { ease } from "@/lib/animations";

export default function Reveal({ children, delay = 0, y = 24, className, as = "div" }) {
  const Tag = motion[as] ?? motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease }}
    >
      {children}
    </Tag>
  );
}
