import { Container, Heading } from "@chakra-ui/react";
import Link from "next/link";
import Script from "next/script";

export default function Page() {
  return (
    <Container>
      <Heading>Other Page</Heading>
      <Link href="/test">
        <a>Go Back</a>
      </Link>
      <Script defer src="/script.js" data-token="aaa" />
    </Container>
  );
}
