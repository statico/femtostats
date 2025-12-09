import Link from "next/link";

// Custom error page without Chakra UI to avoid SSR issues
function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : "An error occurred on client"}
      </h1>
      <Link href="/">Go back home</Link>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
