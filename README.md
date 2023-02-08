# femtostats

Femtostats is a lightweight, tiny, privacy-focused web statistics provider with no RDBMS requirement.

[![build status](https://img.shields.io/github/actions/workflow/status/statico/femtostats/Create%20and%20publish%20a%20Docker%20image.svg?branch=main&style=flat-square)](https://ghcr.io/statico/femtostats)

<img height="800" alt="CleanShot 2022-09-25 at 12 43 28@2x" src="https://user-images.githubusercontent.com/137158/192162253-11532bc6-9c5b-474b-95d3-f286e7aaa19b.png">

## Why?

- Easily self-hostable
- Easy setup with a single `<script>` tag
- Simple pageview and session tracking
- Arbitrary client-side event tracking
- Realtime visitor count
- No external database requirement
- Not blocked by common ad blockers and browsers
- No storage of personally-identifable data (PII)
- Collection of client-side performance stats and screen width
- Geographic tracking with a free Maxmind account signup
- Optional cookieless operation to abide by privacy laws

## Why not use ........?

| What                          | Why not?                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------ |
| Google Analytics              | Blocked by ad blockers and feeds your site's data into the Google data machine |
| CloudFlare Web Analytics      | Blocked by ad blockers                                                         |
| Plausible                     | Self-hosting requires both additional Postgres and Clickhouse databases        |
| Fathom Lite                   | The project is in maintenance-only mode and requires a Fathom account          |
| Server logs                   | Doesn't record client information or sessions                                  |
| CloudFront logs + S3 + Athena | Logs only get dumped once per day and querying requires writing raw SQL        |

## Getting Started

1. Host the image `ghcr.io/statico/femtostats` wherever you want.
   - Check out the `docker-compose.yml` file in this repo as an example.
   - See below instructions on creating a Maxmind account to resolve geographic location at the country level.
   - Specify a `PASSWORD` env var to protect your dashboard behind a password (the username is `admin`).
1. Include the tag `<script defer src="https://your-femtostats.com/data.js"></script>` on the pages you want to track.
1. For custom event tracking, call `window.femtostats('event name')`

### Enabling Country Resolution

To record which country the user has originated from, you need a geoip database. Femtostats will automatically download a free one from Maxmind and refresh it once a week if you do the following:

1. Go to https://www.maxmind.com/ and register for a free account
1. Under "Manage License Keys", get a license key
1. Under "Download Files", scroll to the "GeoLite2 Country" row and click "Get Permalinks". Get the database URL (it will look like `https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&license_key=YOUR_LICENSE_KEY&suffix=tar.gz`) and replace `YOUR_LICENSE_KEY` with your license key.
1. Set this URL as an environment variable `MAXMIND_GEOLITE2_COUNTRY_URL`

### Disabling Cookies

By default, Femtostats stores a simple cookie on the client to count unique users and user sessions. You can disable the use of cookies entirely by adding `data-cookies="false"` to the `<script>` tag you embed on your site. Sessions will still show in the dashboard, but without cookies, the definition of a session changes from "a user's browser session" to "a single page view."

### Other notes

The script tag instructions used to reference `script.js`, but uBlock appears to be [blocking that](https://github.com/uBlockOrigin/uAssets/blob/927dec7c9c60b6c1701d69ea9f8e5923644dd9dc/filters/privacy.txt#L376).

## Development

Requires Node.js 16+ and Yarn. Run `yarn` and `yarn dev`.

The default database location is `/tmp/stats.db`. Run `yarn exec knex seed:run` to populate the database with some sample data.

This project uses [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [SWR](https://swr.vercel.app/), [Recoil](https://recoiljs.org/), [Chakra UI](https://chakra-ui.com/), and [Chart.js](https://www.chartjs.org/).

## Future Ideas

- Use the [better-sqlite3](https://www.npmjs.com/package/better-sqlite3) driver
- Support other databases, maybe, I dunno
- Support UTM campaigns
