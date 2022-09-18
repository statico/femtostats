import "chart.js/auto";
import { useMemo } from "react";
import { Chart } from "react-chartjs-2";
import useSWR from "swr";

export default function Page() {
  const { data: pageviews } = useSWR("/api/stats/pageviews-by-day");
  const data = useMemo(
    () =>
      pageviews
        ? {
            labels: pageviews.labels,
            datasets: [
              {
                label: "Page Views",
                data: pageviews.values,
                fill: false,
              },
            ],
          }
        : null,
    [pageviews]
  );
  console.log("XXX", data);

  return <>{data && <Chart type="line" data={data} />}</>;
}
