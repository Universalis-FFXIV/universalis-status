import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/favicon.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://status.universalis.app" />
        <meta property="og:image" content="/universalis.png" />
        <meta name="theme-color" content="#BD983A" />
        <link
          rel="alternate"
          type="application/json+oembed"
          href="/oembed.json"
        />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <link
          rel="apple-touch-icon"
          type="image/png"
          href="/universalis_ios.png"
        />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
