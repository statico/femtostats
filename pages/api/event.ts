import assert from "assert";
import globToRegExp from "glob-to-regexp";
import db from "lib/db";
import { getCountryForIP } from "lib/geoip";
import { singleParam } from "lib/misc";
import { NextApiRequest, NextApiResponse } from "next";
import { UAParser } from "ua-parser-js";

export const config = {
  api: {
    bodyParser: {
      // There's no need for event data to be bigger than this.
      sizeLimit: "32kb",
    },
  },
};

export default function (req: NextApiRequest, res: NextApiResponse) {
  // Allow requests from anywhere
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  // POST requests only, please
  if (req.method !== "POST") return res.status(400).end();

  // Defer all computation outside of this execution cycle. Respond to the user
  // as fast as possible.
  setImmediate(() => {
    track(req)
      .then(() => {})
      .catch((err: any) => console.error(`Error: ${err}`));
  });

  res.setHeader("Content-Type", "text/plain").send("");
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
  // Make sure Next.js parsed the body as we expected
  assert(typeof req.body === "string");

  const {
    t: token,
    n: name,
    i: userId,
    s: sessionId,
    u: url,
    r: referrer,
    w: screenWidth,
    d: data, // TODO
  } = JSON.parse(req.body);

  // Get the site using the token
  const site = await db.first().from("sites").where("token", token);
  if (!site) {
    console.error(`Unknown site token: ${JSON.stringify(token)}`);
    return;
  }

  // Make sure the host recording the event is allowed
  const hostname = getHostname(url);
  let isHostnameAllowed = false;
  for (const pattern of site.hostnames.split(",")) {
    const re = globToRegExp(pattern.trim());
    if (re.test(hostname ?? "")) {
      isHostnameAllowed = true;
      break;
    }
  }
  if (!isHostnameAllowed) {
    console.error(
      `Hostname ${JSON.stringify(hostname)} does not match site ${
        site.id
      }'s hostnames ${JSON.stringify(site.hostname)}`,
    );
    return;
  }

  const pathname = getPathname(url);
  const referrerHostname = getHostname(referrer);
  const ua = UAParser(singleParam(req.headers["user-agent"]));
  const ip =
    singleParam(req.headers["x-forwarded-for"]).split(",").pop()?.trim() ||
    req.socket.remoteAddress;
  const country = ip ? await getCountryForIP(ip) : null;
  const now = Math.floor(Date.now() / 1000);

  if (sessionId) {
    await db
      .insert({
        id: sessionId,
        site_id: site.id,
        user_id: userId,
        started_at: now,
        last_activity_at: now,
      })
      .into("sessions")
      .onConflict(["id"])
      .merge(["last_activity_at"]);
  }

  await db
    .insert({
      timestamp: now,
      site_id: site.id,
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
    })
    .into("events");
};
