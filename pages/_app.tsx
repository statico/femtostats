import { ChakraProvider } from "@chakra-ui/react";
import { NextPage } from "next";
import { AppProps } from "next/app";
import Head from "next/head";
import { ReactElement, ReactNode } from "react";
import { RecoilRoot } from "recoil";
import { SWRConfig } from "swr";
import fetch from "unfetch";

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
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="icon" sizes="256x256" href="/favicon.png" />
      </Head>
      <ChakraProvider resetCSS>
        <SWRConfig value={{ fetcher }}>
          <RecoilRoot>
            <Component {...pageProps} />
          </RecoilRoot>
        </SWRConfig>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
