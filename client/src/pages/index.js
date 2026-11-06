import Seo from "@/components/Seo";
import StoryExperience from "@/components/story/StoryExperience";
import { site } from "@/data/site";

export default function Home() {
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: site.role,
    url: site.url,
    email: `mailto:${site.email}`,
    address: site.location,
    knowsAbout: site.software,
    sameAs: site.socials.map((s) => s.href),
  };

  return (
    <>
      <Seo jsonLd={personLd} />
      <StoryExperience />
    </>
  );
}

// Pre-render the homepage as static HTML at build time.
export async function getStaticProps() {
  return { props: {} };
}
