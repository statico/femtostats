import { readFileSync } from "fs";
import { GetServerSideProps } from "next";
import UglifyJS from "uglify-js";

export default function Page() {}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  let source = readFileSync("public/fs.raw.js", "utf8");

  if (process.env.NO_COOKIES) {
    source = source.replace(/useCookies = true/, "useCookies = false");
  }

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
