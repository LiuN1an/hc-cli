import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import Head from "next/head";

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0"
        />
        <title>xxx</title>
      </Head>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default App;
