import { singleParam } from "lib/misc";
import * as stats from "lib/stats";
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
    pageviewsByDay,
    topReferrers,
    topPathnames,
    topCountries,
    topBrowsers,
    topDeviceTypes,
    countPageviews,
    countSessions,
    averageSessionDuration,
    countPageviewsPrev,
    countSessionsPrev,
    averageSessionDurationPrev,
  ] = await Promise.all([
    stats.pageviewsByDay(start, end, hostname),
    stats.topReferrers(start, end, hostname),
    stats.topPathnames(start, end, hostname),
    stats.topCountries(start, end, hostname),
    stats.topBrowsers(start, end, hostname),
    stats.topDeviceTypes(start, end, hostname),
    stats.countPageviews(start, end, hostname),
    stats.countSessions(start, end, hostname),
    stats.averageSessionDuration(start, end, hostname),
    stats.countPageviews(prevStart, prevEnd, hostname),
    stats.countSessions(prevStart, prevEnd, hostname),
    stats.averageSessionDuration(prevStart, prevEnd, hostname),
  ]);

  res.send(
    JSON.stringify({
      pageviewsByDay,
      topReferrers,
      topPathnames,
      topCountries,
      topBrowsers,
      topDeviceTypes,
      countPageviews,
      countSessions,
      averageSessionDuration,
      countPageviewsPrev,
      countSessionsPrev,
      averageSessionDurationPrev,
    })
  );
}
