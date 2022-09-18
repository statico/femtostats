import { readFileSync } from "fs";
import { GetServerSideProps } from "next";
import UglifyJS from "uglify-js";

export default function Page() {}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // TODO: Minification
  const content = readFileSync("public/fs.debug.js", "utf8");

  res.setHeader("Content-Type", "text/javascript");
  res.write(content);
  res.end();

  return {
    props: {},
  };
};
