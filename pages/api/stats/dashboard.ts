import db from "lib/db";
import { singleParam } from "lib/misc";
import { DateTime } from "luxon";
import { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const start =
    DateTime.fromSeconds(Number(singleParam(req.query.start))) ||
    DateTime.now().minus({ days: 30 });
  const end =
    DateTime.fromSeconds(Number(singleParam(req.query.end))) || DateTime.now();

  const rows = await db.raw(
    `
    select
      strftime('%Y-%m-%d', timestamp, 'unixepoch') as date,
      count(*) as count
    from events
    where timestamp >= ? and timestamp <= ?
    group by strftime('%Y-%m-%d', timestamp, 'unixepoch')
  `,
    [Math.floor(start.toSeconds()), Math.floor(end.toSeconds())]
  );

  const ret = {
    labels: rows.map((row: any) => row.date),
    values: rows.map((row: any) => row.count),
  };
  res.send(JSON.stringify(ret));
}
