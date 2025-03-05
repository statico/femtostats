import { Knex } from "knex";
import { DateTime } from "luxon";
import db from "./db";

const filterEvents =
  (start: DateTime, end: DateTime, siteId?: string) =>
  (q: Knex.QueryBuilder) => {
    q.where("timestamp", ">=", Math.floor(start.toSeconds()));
    q.where("timestamp", "<=", Math.floor(end.toSeconds()));
    if (siteId) q.where("site_id", siteId);
  };

const filterSessions =
  (start: DateTime, end: DateTime, siteId?: string) =>
  (q: Knex.QueryBuilder) => {
    q.where("started_at", ">=", Math.floor(start.toSeconds()));
    q.where("started_at", "<=", Math.floor(end.toSeconds()));
    if (siteId) q.where("site_id", siteId);
  };

export const pageviewsByDay = (
  start: DateTime,
  end: DateTime,
  siteId?: string,
) =>
  db
    .select(
      db.raw("strftime('%Y-%m-%d', timestamp, 'unixepoch') as date"),
      db.raw("count(*) as count"),
    )
    .from("events")
    .where(filterEvents(start, end, siteId))
    .whereNull("name")
    .groupByRaw("strftime('%Y-%m-%d', timestamp, 'unixepoch')")
    .then((rows) => ({
      labels: rows.map((row: any) => row.date),
      values: rows.map((row: any) => row.count),
    }));

export const countPageviews = (
  start: DateTime,
  end: DateTime,
  siteId?: string,
) =>
  db
    .count<any>()
    .from("events")
    .where(filterEvents(start, end, siteId))
    .whereNull("name")
    .then((rows) => rows[0]["count(*)"]);

export const countSessions = (
  start: DateTime,
  end: DateTime,
  siteId?: string,
) =>
  db
    .count<any>()
    .from("sessions")
    .where(filterSessions(start, end, siteId))
    .then((rows) => rows[0]["count(*)"]);

export const countBounces = (start: DateTime, end: DateTime, siteId?: string) =>
  db
    .with(
      "events_per_session",
      db
        .select("session_id", db.raw("count(*) as count"))
        .from("events")
        .where(filterEvents(start, end, siteId))
        .groupBy("session_id"),
    )
    .count<any>()
    .from("events_per_session")
    .where("count", 1)
    .then((rows) => rows[0]["count(*)"]);

export const countUsers = (start: DateTime, end: DateTime, siteId?: string) =>
  db
    .count<any>()
    .distinct("user_id")
    .from("sessions")
    .where(filterSessions(start, end, siteId))
    .then((rows) => rows[0]["count(*)"]);

export const countLiveUsers = (
  start: DateTime,
  end: DateTime,
  siteId?: string,
) =>
  db
    .count<any>()
    .from("sessions")
    .where("site_id", siteId)
    .andWhere(
      "last_activity_at",
      ">=",
      Math.floor(DateTime.now().minus({ minutes: 5 }).toSeconds()),
    )
    .then((rows) => rows[0]["count(*)"]);

export const averageSessionDuration = (
  start: DateTime,
  end: DateTime,
  siteId?: string,
) =>
  db
    .select(db.raw("avg(last_activity_at - started_at) as avg"))
    .from("sessions")
    .where(filterSessions(start, end, siteId))
    .whereNotNull("last_activity_at")
    .then((rows) => Math.round(rows[0].avg));

export const topByColumn = (
  column: string,
  start: DateTime,
  end: DateTime,
  siteId?: string,
  limit = 10,
) =>
  db
    .with(
      "top",
      db
        .select(column, db.raw("count(*) as count"))
        .from("events")
        .where(filterEvents(start, end, siteId))
        .whereNull("name")
        .groupBy(column),
    )
    .select()
    .from("top")
    .orderBy("count", "desc")
    .limit(limit);

export const topDeviceTypes = (
  start: DateTime,
  end: DateTime,
  siteId?: string,
  limit = 10,
) =>
  db
    .with(
      "devices",
      db
        // Close enough maybe? https://stackoverflow.com/a/7354648
        .select(
          db.raw(`
            case
              when screen_width < 600 then 'Mobile'
              when screen_width < 1025 then 'Tablet'
              else 'Desktop'
            end as device
          `),
        )
        .from("events")
        .where(filterEvents(start, end, siteId))
        .whereNull("name"),
    )
    .select("device", db.raw("count(*) as count"))
    .from("devices")
    .groupBy("device")
    .orderBy("count", "desc")
    .limit(limit);
