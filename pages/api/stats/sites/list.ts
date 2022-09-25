import db from "lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const sites = await db.select().from("sites").orderBy("name");
  res.send(JSON.stringify({ sites }));
}
