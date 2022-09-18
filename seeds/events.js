const UAParser = require("ua-parser-js");

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

exports.seed = async function (knex) {
  await knex("events").del();

  const PATHS = [
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
    "/",
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

  const REFERRERS = [null, "www.facebook.com", "www.reddit.com", "twitter.com"];

  const NOW = Math.floor(Date.now() / 1000);

  const rows = [];
  for (let i = 0; i < 1e6; i++) {
    const info = pick(AGENTS);
    let userAgent, width;
    if (Array.isArray(info)) {
      [userAgent, width] = info;
    } else {
      userAgent = info;
      width = pick(DESKTOP_WIDTHS);
    }
    const ua = UAParser(userAgent);

    const row = {
      timestamp: NOW - Math.floor(Math.random() * 7776000),
      name: "pageview",
      hostname: "www.example.com",
      pathname: pick(PATHS),
      referrer: pick(REFERRERS),
      os: ua.os.name,
      browser: ua.browser.name,
      screen_width: width,
    };
    rows.push(row);

    if (Math.random() < 0.001) {
      rows.push({
        ...row,
        name: "buy-now-click",
      });
    }
  }

  await knex.batchInsert("events", rows, 100);
};
