import {
  Box,
  Container,
  Heading,
  HStack,
  Image,
  LinkBox,
  LinkOverlay,
  Stack,
} from "@chakra-ui/react";
import Head from "next/head";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title: string;
};

export default function DefaultLayout({ title, children }: Props) {
  return (
    <>
      <Head>
        <title>{`${title} | Femtostats`}</title>
      </Head>
      <Container maxW="container.xl" py={4}>
        <Stack spacing={4}>
          <HStack as="header" w="auto">
            <LinkBox>
              <LinkOverlay href="/">
                <Image src="/favicon.png" boxSize={10} alt="Femtostats logo" />
              </LinkOverlay>
            </LinkBox>
            <LinkBox>
              <LinkOverlay href="/">
                <Heading>Femtostats</Heading>
              </LinkOverlay>
            </LinkBox>
          </HStack>
          <Box as="main">{children}</Box>
        </Stack>
      </Container>
    </>
  );
}
