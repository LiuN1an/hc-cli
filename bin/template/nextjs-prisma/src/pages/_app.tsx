import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ChakraProvider>
          <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
}

export default App;
