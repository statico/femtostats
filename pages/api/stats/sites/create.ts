import { randomBytes } from "crypto";
import db from "lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import * as yup from "yup";

const schema = yup.object({
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

  const rows = await db
    .into("sites")
    .insert({
      name: body.name,
      hostnames: body.hostnames,
      token: randomBytes(4).toString("hex"),
    })
    .returning("*");
  res.send(JSON.stringify(rows[0]));
}
