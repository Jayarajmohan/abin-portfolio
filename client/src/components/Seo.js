import Head from "next/head";
import { site } from "@/data/site";

export default function Seo({ title, description = site.intro, image = "/og-image.jpg", path = "", jsonLd }) {
  const fullTitle = title ? `${title} — ${site.name}` : `${site.name} — ${site.role}`;
  const url = `${site.url}${path}`;
  const img = image.startsWith("http") ? image : `${site.url}${image}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
    </Head>
  );
}
