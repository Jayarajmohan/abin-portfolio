import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" />
      <section className="mx-auto flex min-h-[80svh] max-w-6xl flex-col items-start justify-center px-5 pt-24 sm:px-8">
        <p className="font-mono text-sm text-accent">00:00:04:04 · MEDIA OFFLINE</p>
        <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight sm:text-7xl">This clip is missing.</h1>
        <p className="mt-5 max-w-lg text-lg text-fg-muted">The page you&apos;re looking for was moved or never made the final cut.</p>
        <Button href="/" className="mt-10">
          Back to the homepage
        </Button>
      </section>
    </>
  );
}
