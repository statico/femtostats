import { Button, Container, Heading } from "@chakra-ui/react";
import Link from "next/link";
import Script from "next/script";

export default function Page() {
  return (
    <Container>
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
      <Script defer src="/fs.js" />
    </Container>
  );
}
