import { Html, Head, Main, NextScript } from "next/document";
import { Analytics } from "@/lib/GA";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0"
        />
        {process.env.NEXT_PUBLIC_GA_TRACKING_ID && (
          <Script
            strategy="beforeInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
          />
        )}
        {process.env.NEXT_PUBLIC_GA_TRACKING_ID && (
          <Script
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}');
        `,
            }}
          />
        )}
        <title>Your Title</title>
      </Head>
      <body>
        <Main />
        <NextScript />
        <Analytics />
      </body>
    </Html>
  );
}
