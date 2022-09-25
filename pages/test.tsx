import { Button, Container, Heading, Stack } from "@chakra-ui/react";
import Link from "next/link";
import Script from "next/script";

export default function Page() {
  return (
    <Container>
      <Stack spacing={10}>
        <Heading>Test Events</Heading>
        <Button
          onClick={() => {
            // @ts-ignore
            femtostats("button-click");
          }}
        >
          Track Click Event
        </Button>
        <Link href="/test2">
          <a>Go to Test 2</a>
        </Link>
        <Link href="https://www.example.com/">
          <a>Leave Site</a>
        </Link>
      </Stack>
      <Script defer src="/fs.js" data-token="aaa" />
    </Container>
  );
}
