# femtostats

Femtostats is a super lightweight, tiny, privacy-focused web statistics provider.

[![build status](https://img.shields.io/github/workflow/status/statico/femtostats/Create%20and%20publish%20a%20Docker%20image.svg?style=flat-square)](https://ghcr.io/statico/femtostats)

https://user-images.githubusercontent.com/137158/190950407-550e8361-2ae0-42d8-96e2-6bd8b152e0d2.mp4

## Why?

I needed:

- A simple way to track visits on various web properties I manage
- A way to collect statistics without using the privacy-invasive Google Analytics, which half of my visitors probably block
- The ability to track custom events triggered from JavaScript, as well as other client-side stats like screen size
- Realtime visitor count when there are surges
- A container that I can add to `docker-compose.yml` or host on [Fly.io](https://fly.io/) trivially
- No database dependencies because my main host is low on RAM

**Why not use your web server's log files and something like [GoAccess](https://goaccess.io/)?** A good idea, but I want client-side information and custom events.

**Why not Plausible?** [Plausible](https://plausible.io/) is awesome but requires installing both Postgres and Clickhouse. I'm short on RAM.

**Why not an AWS CloudFront load balancer that hosts a single pixel and sends logs to an S3 bucket which you can query using Athena?** This is an awesome scaleable and cheap solution, but the CloudFront logs are only dumped once per day, which is too infrequent for me.

## Getting Started

1. Host the image `ghcr.io/statico/femtostats` wherever you want. Check out the `docker-compose.yml` file in this repo as an example. Specify a `PASSWORD` env var to protect your dashboard behind a password (the username is `admin`).
1. Include the tag `<script defer src="https://your-femtostats.com/fs.js"></script>` on the pages you want to track.
1. Page views (including history changes on SPAs) are tracked automatically. For custom events, call `window.femtostats('event name')`

## Development

Requires Node.js 16+ and Yarn. Run `yarn` and `yarn dev`.

The default database location is `/tmp/femtostats.db`. Run `yarn exec knex seed:run` to populate the database with some sample data.

This project uses [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [SWR](https://swr.vercel.app/), [Recoil](https://recoiljs.org/), [Chakra UI](https://chakra-ui.com/), and [Chart.js](https://www.chartjs.org/).

## Future Ideas

- Realtime visitor count
- Visitors vs. pageviews
- Track country codes with the MaxMind database
- Do some load testing
- Use the [better-sqlite3](https://www.npmjs.com/package/better-sqlite3) driver
- Support other databases, maybe, I dunno
