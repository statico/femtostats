import Link from "next/link";

// Simple 404 page without Chakra UI to avoid SSR issues
export default function NotFound() {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>404 - Page Not Found</h1>
      <Link href="/">Go back home</Link>
    </div>
  );
}
