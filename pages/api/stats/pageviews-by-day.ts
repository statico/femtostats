import db from "lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const rows = await db.raw(`
    select
      strftime('%Y-%m-%d', timestamp, 'unixepoch') as date,
      count(*) as count
    from events
    group by strftime('%Y-%m-%d', timestamp, 'unixepoch')
  `);

  const ret = {
    labels: rows.map((row: any) => row.date),
    values: rows.map((row: any) => row.count),
  };
  res.send(JSON.stringify(ret));
}
