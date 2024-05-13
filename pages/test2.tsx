import { Container, Heading } from "@chakra-ui/react";
import Link from "next/link";
import Script from "next/script";

export default function Page() {
  return (
    <Container>
      <Heading>Other Page</Heading>
      <Link href="/test">Go Back</Link>
      <Script defer src="/data.js" data-token="aaa" />
    </Container>
  );
}
