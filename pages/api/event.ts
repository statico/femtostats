import assert from "assert";
import db from "lib/db";
import { singleParam } from "lib/misc";
import { NextApiRequest, NextApiResponse } from "next";
import { UAParser } from "ua-parser-js";

export default function (req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(400).end();

  setImmediate(() => {
    track(req)
      .then(() => {})
      .catch((err: any) => console.error(`Error: ${err}`));
  });

  res.setHeader("Content-Type", "image/text").send("");
}

const getHostname = (raw: any) => {
  try {
    return new URL(raw).hostname;
  } catch (err) {
    return null;
  }
};
const getPathname = (raw: any) => {
  try {
    return new URL(raw).pathname;
  } catch (err) {
    return null;
  }
};

const track = async (req: NextApiRequest) => {
  assert(typeof req.body === "string");

  const body = JSON.parse(req.body);
  const ua = UAParser(singleParam(req.headers["user-agent"]));

  await db("events").insert({
    timestamp: Math.floor(Date.now() / 1000),
    name: body.n,
    hostname: getHostname(body.u),
    pathname: getPathname(body.u),
    referrer: getHostname(body.r),
    os: ua.os.name,
    browser: ua.browser.name,
    screen_width: Number(body.sw),
  });
};
