import { Button, Container, Heading } from "@chakra-ui/react";
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
      <Script defer src="/fs.js" />
    </Container>
  );
}
