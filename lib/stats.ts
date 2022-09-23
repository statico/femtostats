import { Knex } from "knex";
import { DateTime } from "luxon";
import db from "./db";

const filterEvents =
  (start: DateTime, end: DateTime, hostname?: string) =>
  (q: Knex.QueryBuilder) => {
    q.where("timestamp", ">=", Math.floor(start.toSeconds()));
    q.where("timestamp", "<=", Math.floor(end.toSeconds()));
    if (hostname) q.where("hostname", hostname);
  };

const filterSessions =
  (start: DateTime, end: DateTime, hostname?: string) =>
  (q: Knex.QueryBuilder) => {
    q.where("started_at", ">=", Math.floor(start.toSeconds()));
    q.where("started_at", "<=", Math.floor(end.toSeconds()));
    if (hostname) q.where("hostname", hostname);
  };

export const pageviewsByDay = (
  start: DateTime,
  end: DateTime,
  hostname?: string
) =>
  db
    .select(
      db.raw("strftime('%Y-%m-%d', timestamp, 'unixepoch') as date"),
      db.raw("count(*) as count")
    )
    .from("events")
    .where(filterEvents(start, end, hostname))
    .groupByRaw("strftime('%Y-%m-%d', timestamp, 'unixepoch')")
    .then((rows) => ({
      labels: rows.map((row: any) => row.date),
      values: rows.map((row: any) => row.count),
    }));

export const countPageviews = (
  start: DateTime,
  end: DateTime,
  hostname?: string
) =>
  db
    .count<any>()
    .from("events")
    .where(filterEvents(start, end, hostname))
    .then((rows) => rows[0]["count(*)"]);

export const countSessions = (
  start: DateTime,
  end: DateTime,
  hostname?: string
) =>
  db
    .count<any>()
    .from("sessions")
    .where(filterSessions(start, end, hostname))
    .then((rows) => rows[0]["count(*)"]);

export const averageSessionDuration = (
  start: DateTime,
  end: DateTime,
  hostname?: string
) =>
  db
    .select(db.raw("avg(ended_at - started_at) as avg"))
    .from("sessions")
    .where(filterSessions(start, end, hostname))
    .whereNotNull("ended_at")
    .then((rows) => Math.round(rows[0].avg));

export const topReferrers = (
  start: DateTime,
  end: DateTime,
  hostname?: string,
  limit = 10
) =>
  db
    .with(
      "top",
      db
        .select("referrer", db.raw("count(*) as count"))
        .from("events")
        .where(filterEvents(start, end, hostname))
        .andWhere("name", "pageview")
        .groupBy("referrer")
    )
    .select()
    .from("top")
    .orderBy("count", "desc")
    .limit(limit);

export const topPathnames = (
  start: DateTime,
  end: DateTime,
  hostname?: string,
  limit = 10
) =>
  db
    .with(
      "top",
      db
        .select("pathname", db.raw("count(*) as count"))
        .from("events")
        .where(filterEvents(start, end, hostname))
        .andWhere("name", "pageview")
        .groupBy("pathname")
    )
    .select()
    .from("top")
    .orderBy("count", "desc")
    .limit(limit);

export const topCountries = (
  start: DateTime,
  end: DateTime,
  hostname?: string,
  limit = 10
) =>
  db
    .with(
      "top",
      db
        .select("country", db.raw("count(*) as count"))
        .from("events")
        .where(filterEvents(start, end, hostname))
        .andWhere("name", "pageview")
        .groupBy("country")
    )
    .select()
    .from("top")
    .orderBy("count", "desc")
    .limit(limit);

export const topBrowsers = (
  start: DateTime,
  end: DateTime,
  hostname?: string,
  limit = 10
) =>
  db
    .with(
      "top",
      db
        .select("browser", db.raw("count(*) as count"))
        .from("events")
        .where(filterEvents(start, end, hostname))
        .andWhere("name", "pageview")
        .groupBy("browser")
    )
    .select()
    .from("top")
    .orderBy("count", "desc")
    .limit(limit);

export const topDeviceTypes = (
  start: DateTime,
  end: DateTime,
  hostname?: string,
  limit = 10
) =>
  db
    .with(
      "devices",
      db
        // Close enough maybe? https://stackoverflow.com/a/7354648
        .select(
          db.raw(`
            case
              when screen_width < 600 then "Mobile"
              when screen_width < 1025 then "Tablet"
              else "Desktop"
            end as device
          `)
        )
        .from("events")
        .where(filterEvents(start, end, hostname))
        .andWhere("name", "pageview")
    )
    .select("device", db.raw("count(*) as count"))
    .from("devices")
    .groupBy("device")
    .orderBy("count", "desc")
    .limit(limit);
