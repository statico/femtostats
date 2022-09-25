import db from "lib/db";
import * as yup from "yup";
import { NextApiRequest, NextApiResponse } from "next";

const schema = yup.object({
  id: yup.number().integer().required(),
});

export default async function (req: NextApiRequest, res: NextApiResponse) {
  let body;
  try {
    body = schema.validateSync(req.body);
  } catch (err) {
    return res.status(400).send(String(err));
  }

  const site = await db.first().from("sites").where("id", body.id);
  if (!site) return res.status(404).send("No such site");

  await db.delete().from("sites").where("id", site.id);

  res.send(JSON.stringify({ success: true }));
}
