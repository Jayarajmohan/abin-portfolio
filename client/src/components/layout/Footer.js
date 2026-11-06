import { site } from "@/data/site";

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-xs text-fg-subtle">
          © {new Date().getFullYear()} {site.name} · {site.role} · {site.location}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {site.socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-fg-muted transition-colors hover:text-accent"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
