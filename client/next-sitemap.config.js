/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://abin-remanan-portfolio.web.app",
  generateRobotsTxt: true,
  // static export: write sitemap.xml / robots.txt straight into the deployed folder
  outDir: "out",
  exclude: ["/404"],
};
