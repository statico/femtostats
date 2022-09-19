import db from "lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const hostnames = await db
    .pluck("hostname")
    .distinct()
    .from("events")
    .orderBy("hostname");

  res.send(
    JSON.stringify({
      hostnames,
    })
  );
}
