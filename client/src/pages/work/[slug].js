import Link from "next/link";
import Seo from "@/components/Seo";
import VideoEmbed from "@/components/ui/VideoEmbed";
import ProjectCard from "@/components/ui/ProjectCard";
import Button from "@/components/ui/Button";
import Reveal from "@/components/motion/Reveal";
import { projects } from "@/data/projects";

export default function ProjectPage({ project, more }) {
  const meta = [
    { label: "Client", value: project.client },
    { label: "Category", value: project.category },
    { label: "Role", value: project.role },
    { label: "Year", value: project.year },
    { label: "Runtime", value: project.duration },
    { label: "Software", value: project.software?.join(", ") || "—" },
  ];

  return (
    <>
      <Seo title={project.title} description={project.summary} path={`/work/${project.slug}`} />
      <article className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <Reveal>
          <Link href="/#work" className="inline-flex min-h-11 items-center gap-2 text-sm text-fg-subtle hover:text-fg">
            <span aria-hidden>←</span> All work
          </Link>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-accent">{project.category}</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1] tracking-tight sm:text-7xl">{project.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fg-muted">{project.summary}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <VideoEmbed provider={project.provider} id={project.videoId} thumb={project.thumb} title={project.title} priority />
        </Reveal>

        <Reveal>
          <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-line py-8 sm:grid-cols-3 lg:grid-cols-6">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg-subtle">{m.label}</dt>
                <dd className="mt-2 text-fg">{m.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {more.length > 0 && (
          <section className="mt-24" aria-labelledby="more-heading">
            <h2 id="more-heading" className="mb-10 font-display text-3xl font-semibold tracking-tight">
              More work
            </h2>
            <ul className="grid gap-x-7 gap-y-12 sm:grid-cols-2">
              {more.map((p) => (
                <li key={p.slug}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-24 flex flex-col items-start gap-6 rounded-2xl border border-line bg-panel p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
          <p className="font-display text-2xl font-medium tracking-tight sm:text-3xl">Like what you see?</p>
          <Button href="/#contact">Start a project</Button>
        </div>
      </article>
    </>
  );
}

export async function getStaticPaths() {
  return { paths: projects.map((p) => ({ params: { slug: p.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const index = projects.findIndex((p) => p.slug === params.slug);
  const project = projects[index];
  const more = [projects[(index + 1) % projects.length], projects[(index + 2) % projects.length]].filter(
    (p) => p.slug !== project.slug
  );
  return { props: { project, more } };
}
