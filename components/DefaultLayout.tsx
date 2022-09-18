import {
  Box,
  Container,
  Heading,
  HStack,
  Image,
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
        <title>{title} | Femtostats</title>
      </Head>
      <Container maxW="container.xl" py={4}>
        <Stack spacing={4}>
          <HStack as="header">
            <Image src="/favicon.png" boxSize={10} alt="Femtostats logo" />
            <Heading>Femtostats</Heading>
          </HStack>
          <Box as="main">{children}</Box>
        </Stack>
      </Container>
    </>
  );
}
