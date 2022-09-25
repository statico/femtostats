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
    countUsers,
    countUsersPrev,
    countLiveUsers,
    countBounces,
    countBouncesPrev,
  ] = await Promise.all([
    stats.pageviewsByDay(start, end, siteId),
    stats.topByColumn("referrer", start, end, siteId),
    stats.topByColumn("pathname", start, end, siteId),
    stats.topByColumn("country", start, end, siteId),
    stats.topByColumn("browser", start, end, siteId),
    stats.topByColumn("os", start, end, siteId),
    stats.topDeviceTypes(start, end, siteId),
    stats.countPageviews(start, end, siteId),
    stats.countSessions(start, end, siteId),
    stats.averageSessionDuration(start, end, siteId),
    stats.countPageviews(prevStart, prevEnd, siteId),
    stats.countSessions(prevStart, prevEnd, siteId),
    stats.averageSessionDuration(prevStart, prevEnd, siteId),
    stats.countUsers(start, end, siteId),
    stats.countUsers(prevStart, prevEnd, siteId),
    stats.countLiveUsers(start, end, siteId),
    stats.countBounces(start, end, siteId),
    stats.countBounces(prevStart, prevEnd, siteId),
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
      countUsers,
      countUsersPrev,
      countLiveUsers,
      countBounces,
      countBouncesPrev,
    })
  );
}
