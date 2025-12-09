import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  LinkBox,
  LinkOverlay,
  Stack,
} from "@chakra-ui/react";
import { useColorMode } from "hooks/useColorMode";
import Head from "next/head";
import { ReactNode } from "react";
import { MdModeNight, MdWbSunny } from "react-icons/md";

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
        <Stack gap={4}>
          <Flex as="header" justify="space-between">
            <LinkBox>
              <LinkOverlay href="/">
                <HStack>
                  <Image
                    src="/favicon.png"
                    boxSize={10}
                    alt="Femtostats logo"
                  />
                  <Heading>Femtostats</Heading>
                </HStack>
              </LinkOverlay>
            </LinkBox>
            <Box>
              <ColorModeToggle />
            </Box>
          </Flex>
          <Box as="main">{children}</Box>
        </Stack>
      </Container>
    </>
  );
}

const ColorModeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      variant="ghost"
      onClick={() => {
        toggleColorMode();

        // Not sure how to fix the Chart colors not updating. Maybe
        // https://stackoverflow.com/questions/63565630 ?
        location.reload();
      }}
      aria-label={"Toggle light/dark mode"}
    >
      {colorMode === "dark" ? <MdWbSunny /> : <MdModeNight />}
    </IconButton>
  );
};
