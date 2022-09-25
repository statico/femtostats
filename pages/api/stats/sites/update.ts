import db from "lib/db";
import * as yup from "yup";
import { NextApiRequest, NextApiResponse } from "next";

const schema = yup.object({
  id: yup.number().integer().required(),
  name: yup.string().min(1).required(),
  hostnames: yup.string().min(1).required(),
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

  const rows = await db("sites")
    .update({
      name: body.name,
      hostnames: body.hostnames,
    })
    .where("id", body.id)
    .returning("*");
  res.send(JSON.stringify(rows[0]));
}
