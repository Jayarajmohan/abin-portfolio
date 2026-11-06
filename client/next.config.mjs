/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export → `out/`, served by Firebase Hosting (see firebase.json).
  output: "export",
  // The default next/image optimizer needs a server; images are pre-sized instead.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  reactStrictMode: true,
};

export default nextConfig;
