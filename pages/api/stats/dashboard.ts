import { Knex } from "knex";
import db from "lib/db";
import { singleParam } from "lib/misc";
import { DateTime } from "luxon";
import { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const hostname = singleParam(req.query.hostname);
  const start = DateTime.fromSeconds(
    Number(singleParam(req.query.start)) ||
      DateTime.now().minus({ days: 30 }).toSeconds()
  );
  const end = DateTime.fromSeconds(
    Number(singleParam(req.query.end)) || DateTime.now().toSeconds()
  );

  const filter = (q: Knex.QueryBuilder) => {
    q.where("timestamp", ">=", Math.floor(start.toSeconds()));
    q.where("timestamp", "<=", Math.floor(end.toSeconds()));
    if (hostname) q.where("hostname", hostname);
  };

  const [pageviews, topSources, topPathnames] = await Promise.all([
    // pageviews
    db
      .select(
        db.raw("strftime('%Y-%m-%d', timestamp, 'unixepoch') as date"),
        db.raw("count(*) as count")
      )
      .from("events")
      .where(filter)
      .groupByRaw("strftime('%Y-%m-%d', timestamp, 'unixepoch')")
      .then((rows) => ({
        labels: rows.map((row: any) => row.date),
        values: rows.map((row: any) => row.count),
      })),

    // topSources
    db
      .with(
        "top",
        db
          .select("referrer", db.raw("count(*) as count"))
          .from("events")
          .where(filter)
          .groupBy("referrer")
      )
      .select()
      .from("top")
      .orderBy("count", "desc"),

    // topPathnames
    db
      .with(
        "top",
        db
          .select("pathname", db.raw("count(*) as count"))
          .from("events")
          .where(filter)
          .groupBy("pathname")
      )
      .select()
      .from("top")
      .orderBy("count", "desc"),
  ]);

  res.send(
    JSON.stringify({
      pageviews,
      topSources,
      topPathnames,
    })
  );
}
