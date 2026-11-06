import Link from "next/link";
import clsx from "clsx";

const styles = {
  primary: "bg-accent text-ink hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-8px_rgba(79,216,235,0.6)]",
  ghost: "border border-line-strong text-fg hover:border-fg-subtle hover:-translate-y-0.5",
};

export default function Button({ href, variant = "primary", className, children, external, ...props }) {
  const cls = clsx(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-60",
    styles[variant],
    className
  );

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...props}>
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={cls} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
