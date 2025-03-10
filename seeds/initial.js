const { randomBytes } = require("crypto");
const UAParser = require("ua-parser-js");

//
// Populate the database with two sites and some random growing data for the
// last 90 days.
//

exports.seed = async function (knex) {
  await knex("events").del();
  await knex("sessions").del();
  await knex("sites").del();

  const SITES = [
    {
      id: 1,
      name: "Site A",
      hostnames: "*",
      token: "aaa",
    },
    {
      id: 2,
      name: "Site B",
      hostnames: "*",
      token: "bbb",
    },
  ];

  const PATHNAMES = [
    "/",
    "/apple",
    "/banana",
    "/cherry",
    "/donut",
    "/eclair",
    "/fluffernutter",
    "/gulab-jamun",
    "/honey",
    "/ice-cream",
    "/about-us",
    "/contact",
  ];

  const AGENTS = [
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
      375,
    ],
    [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
      414,
    ],
    [
      "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36",
      393,
    ],
    [
      "Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36",
      412,
    ],
    [
      "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.188 Safari/537.36 CrKey/1.54.250320",
      1280,
    ],
    [
      "Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1",
      1024,
    ],
    ...require("top-user-agents"),
  ];

  const DESKTOP_WIDTHS = [
    1366, 1920, 1440, 768, 1600, 1280, 1536, 1024, 1280, 1280, 1680,
  ];

  // No preference — I'm simply picking countries where I currently have coworkers
  const COUNTRIES = ["US", "CA", "IN", "UA", "BR", "UY", "GB", "PL"];

  const REFERRERS = [null, "www.facebook.com", "www.reddit.com", "twitter.com"];

  const NOW = Date.now() / 1000;

  const rand = () => Math.pow(Math.random(), 2);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  const events = [];
  const sessions = [];
  for (let i = 0; i < 1e4; i++) {
    const site = Math.random() > 0.75 ? SITES[0] : SITES[1];
    const hostname = site.hostnames.split(",")[0];
    const userId = randomBytes(8).toString("hex");
    const sessionId = randomBytes(8).toString("hex");

    const info = pick(AGENTS);
    let userAgent, width;
    if (Array.isArray(info)) {
      [userAgent, width] = info;
    } else {
      userAgent = info;
      width = pick(DESKTOP_WIDTHS);
    }
    const ua = UAParser(userAgent);

    const start = Math.floor(NOW - rand() * 7776000);
    let timestamp = start;
    let pathname = null;
    const eventCount = rand() * 4;
    for (let j = 0; j < eventCount; j++) {
      pathname = pick(PATHNAMES);

      const row = {
        timestamp,
        site_id: site.id,
        session_id: sessionId,
        name: null,
        hostname,
        pathname,
        referrer: pick(REFERRERS),
        country: pick(COUNTRIES),
        os: ua.os.name,
        os_version: ua.os.version,
        browser: ua.browser.name,
        browser_version: ua.browser.version,
        screen_width: width,
      };
      events.push(row);

      if (rand() < 0.001) {
        events.push({
          ...row,
          name: "buy-now-click",
        });
      }

      timestamp += Math.floor(Math.random() * 90 + 5);
    }

    sessions.push({
      id: sessionId,
      site_id: site.id,
      user_id: userId,
      started_at: start,
      last_activity_at: timestamp,
    });
  }

  await knex.batchInsert("sites", SITES, 100);
  await knex.batchInsert("sessions", sessions, 100);
  await knex.batchInsert("events", events, 100);
};
