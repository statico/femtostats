import { readFileSync } from "fs";
import { GetServerSideProps } from "next";
import UglifyJS from "uglify-js";

export default function Page() {}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const source = readFileSync("public/fs.debug.js", "utf8");

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
