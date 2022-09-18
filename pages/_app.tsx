import { ChakraProvider } from "@chakra-ui/react";
import { NextPage } from "next";
import { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";
import { RecoilRoot } from "recoil";
import { SWRConfig } from "swr";

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  return (
    <>
      <ChakraProvider resetCSS>
        <SWRConfig>
          <RecoilRoot>
            <Component {...pageProps} />
          </RecoilRoot>
        </SWRConfig>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
