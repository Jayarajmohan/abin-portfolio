import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="bg-ink">
      <Head>
        <meta name="theme-color" content="#0C0910" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-ink text-fg antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
