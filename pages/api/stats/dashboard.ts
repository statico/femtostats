import { singleParam } from "lib/misc";
import {
  averageSessionDuration,
  countPageviews,
  countSessions,
  pageviewsByDay,
  uniquePathnames,
  uniqueReferrers,
} from "lib/stats";
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

  // Calculate the previous window of the same size
  const delta = end.toSeconds() - start.toSeconds();
  const prevStart = start.minus({ seconds: delta });
  const prevEnd = start;

  const [
    pageviews,
    referrers,
    pathnames,
    numSessions,
    numPageviews,
    avgSession,
    prevNumSessions,
    prevNumPageviews,
    prevAvgSession,
  ] = await Promise.all([
    pageviewsByDay(start, end, hostname),
    uniqueReferrers(start, end, hostname),
    uniquePathnames(start, end, hostname),
    countSessions(start, end, hostname),
    countPageviews(start, end, hostname),
    averageSessionDuration(start, end, hostname),
    countSessions(prevStart, prevEnd, hostname),
    countPageviews(prevStart, prevEnd, hostname),
    averageSessionDuration(prevStart, prevEnd, hostname),
  ]);

  res.send(
    JSON.stringify({
      pageviews,
      referrers,
      pathnames,
      numSessions,
      numPageviews,
      avgSession,
      prevNumSessions,
      prevNumPageviews,
      prevAvgSession,
    })
  );
}
