import { ChakraProvider } from "@chakra-ui/react";
import { ChartJSDefaults } from "components/ChartJSDefaults";
import { theme } from "lib/theme";
import { NextPage } from "next";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactElement, ReactNode } from "react";
import { RecoilRoot } from "recoil";
import { RecoilURLSyncJSON } from "recoil-sync";
import { SWRConfig } from "swr";
import fetch from "isomorphic-unfetch";

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
  const router = useRouter();
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="icon" sizes="256x256" href="/favicon.png" />
      </Head>
      <ChakraProvider resetCSS theme={theme}>
        <SWRConfig value={{ fetcher }}>
          <RecoilRoot>
            <RecoilURLSyncJSON
              location={{ part: "queryParams" }}
              // SSR: https://github.com/facebookexperimental/Recoil/issues/1777
              browserInterface={{
                getURL: () => {
                  return typeof window === "undefined"
                    ? `http://localhost:3001${router.route}`
                    : window.location.href;
                },
              }}
            >
              <ChartJSDefaults />
              {getLayout(<Component {...pageProps} />)}
            </RecoilURLSyncJSON>
          </RecoilRoot>
        </SWRConfig>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
