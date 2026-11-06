import ContactForm from "@/components/ui/ContactForm";
import { site } from "@/data/site";
import { story } from "@/data/story";

// Final scene. On desktop the content holds (sticky) on the right while the
// character comes back into focus on the left and the world fades to black.
export default function ContactScene() {
  const { contact } = story;
  return (
    <section id="contact" data-scene="contact" className="relative lg:h-[185svh]" aria-labelledby="contact-heading">
      <div className="px-5 pb-28 pt-16 sm:px-8 lg:sticky lg:top-0 lg:flex lg:h-[100svh] lg:items-center lg:py-0 lg:pl-[50vw] lg:pr-[6vw]">
        <div className="w-full rounded-2xl border border-line bg-ink/70 p-6 backdrop-blur-sm sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-accent">{contact.kicker}</p>
          <h2 id="contact-heading" className="font-display text-4xl font-bold uppercase leading-[0.92] tracking-[-0.03em] sm:text-5xl lg:text-[4.2vw]">
            {contact.heading}
          </h2>
          <p className="mt-4 max-w-md text-lg text-fg-muted">{contact.text}</p>

          <div className="mt-7">
            <ContactForm />
          </div>

          <div className="mt-7 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
            <a href={`mailto:${site.email}`} className="font-display text-lg text-fg underline decoration-line-strong underline-offset-8 hover:text-accent hover:decoration-accent">
              {site.email}
            </a>
            <ul className="flex gap-5">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm text-fg-muted hover:text-accent">
                    {s.label} <span aria-hidden className="ml-1">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
