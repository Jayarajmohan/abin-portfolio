import Link from "next/link";
import Thumb from "./Thumb";

export default function ProjectCard({ project }) {
  return (
    <Link href={`/work/${project.slug}`} className="group block" aria-label={`${project.title} — ${project.client}`}>
      <div className="relative aspect-video overflow-hidden rounded-xl border border-line bg-surface">
        <Thumb src={project.thumb} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]" />
        <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/30" aria-hidden />
        <span
          className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 scale-75 place-items-center rounded-full bg-accent text-ink opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor">
            <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
          </svg>
        </span>
        <span className="absolute bottom-3 right-3 rounded bg-ink/80 px-2 py-1 font-mono text-[11px] text-fg-muted backdrop-blur">
          {project.duration}
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-medium tracking-tight transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-fg-subtle">
            {project.client} · {project.role}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-line px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-fg-subtle">
          {project.category}
        </span>
      </div>
    </Link>
  );
}
