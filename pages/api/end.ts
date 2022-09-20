import assert from "assert";
import db from "lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "32kb",
    },
  },
};

export default function (req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(400).end();

  assert(typeof req.body === "string");
  const body = JSON.parse(req.body);

  setImmediate(async () => {
    await db("sessions")
      .update({ ended_at: Math.floor(Date.now() / 1000) })
      .where("id", body.s);
  });

  res.setHeader("Content-Type", "image/text").send("");
}
