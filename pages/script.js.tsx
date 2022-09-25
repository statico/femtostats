import { readFileSync } from "fs";
import { GetServerSideProps } from "next";
import UglifyJS from "uglify-js";

export default function Page() {}

// This generates script.js as build time so that it's served as a static asset
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let source = readFileSync("public/script.raw.js", "utf8");

  // Make the bundle as small as possible
  const minified = UglifyJS.minify(source, {
    ie8: true,
    webkit: true,
  }).code;

  res.setHeader("Content-Type", "text/javascript");
  res.write(minified);
  res.end();

  return {
    props: {},
  };
};
