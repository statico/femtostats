import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ChartJSDefaults } from "components/ChartJSDefaults";
import { ColorModeProvider } from "hooks/useColorMode";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import type { ReactElement, ReactNode } from "react";
import { SWRConfig } from "swr";
import fetch from "isomorphic-unfetch";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const fetcher = async (resource: string, init: any) => {
  const res = await fetch(resource, { ...init });
  if (!res.ok) {
    console.error(`Fetch to ${resource} failed: ${res.statusText}`);
    return { error: res.statusText };
  }
  return res.json();
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="icon" sizes="256x256" href="/favicon.png" />
      </Head>
      <ChakraProvider value={defaultSystem}>
        <ColorModeProvider>
          <NuqsAdapter>
            <SWRConfig value={{ fetcher }}>
              <ChartJSDefaults />
              {getLayout(<Component {...pageProps} />)}
            </SWRConfig>
          </NuqsAdapter>
        </ColorModeProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
