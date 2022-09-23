import assert from "assert";
import db from "lib/db";
import { getCountryForIP } from "lib/geoip";
import { singleParam } from "lib/misc";
import { NextApiRequest, NextApiResponse } from "next";
import { UAParser } from "ua-parser-js";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "32kb",
    },
  },
};

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

  const {
    n: name,
    i: userId,
    s: sessionId,
    u: url,
    r: referrer,
    w: screenWidth,
    d: data,
  } = JSON.parse(req.body);

  const hostname = getHostname(url);
  const pathname = getPathname(url);
  const referrerHostname = getHostname(referrer);
  const ua = UAParser(singleParam(req.headers["user-agent"]));
  const ip =
    singleParam(req.headers["x-forwarded-for"]).split(",").pop()?.trim() ||
    req.socket.remoteAddress;
  const country = ip ? await getCountryForIP(ip) : null;
  const now = Math.floor(Date.now() / 1000);

  await db("events").insert({
    timestamp: now,
    session_id: sessionId,
    name,
    hostname,
    pathname,
    referrer: referrerHostname,
    os: ua.os.name,
    os_version: ua.os.version,
    browser: ua.browser.name,
    browser_version: ua.browser.version,
    screen_width: Number(screenWidth),
    country,
  });

  if (sessionId) {
    await db("sessions")
      .insert({
        id: sessionId,
        user_id: userId,
        hostname,
        started_at: now,
      })
      .onConflict(["id"])
      .merge();
  }
};
