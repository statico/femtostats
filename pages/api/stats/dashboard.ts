import { singleParam } from "lib/misc";
import * as stats from "lib/stats";
import { DateTime } from "luxon";
import { NextApiRequest, NextApiResponse } from "next";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const siteId = singleParam(req.query.siteId);
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
    topOperatingSystems,
    topDeviceTypes,
    countPageviews,
    countSessions,
    averageSessionDuration,
    countPageviewsPrev,
    countSessionsPrev,
    averageSessionDurationPrev,
  ] = await Promise.all([
    stats.pageviewsByDay(start, end, siteId),
    stats.topReferrers(start, end, siteId),
    stats.topPathnames(start, end, siteId),
    stats.topCountries(start, end, siteId),
    stats.topBrowsers(start, end, siteId),
    stats.topOperatingSystems(start, end, siteId),
    stats.topDeviceTypes(start, end, siteId),
    stats.countPageviews(start, end, siteId),
    stats.countSessions(start, end, siteId),
    stats.averageSessionDuration(start, end, siteId),
    stats.countPageviews(prevStart, prevEnd, siteId),
    stats.countSessions(prevStart, prevEnd, siteId),
    stats.averageSessionDuration(prevStart, prevEnd, siteId),
  ]);

  res.send(
    JSON.stringify({
      pageviewsByDay,
      topReferrers,
      topPathnames,
      topCountries,
      topBrowsers,
      topOperatingSystems,
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
