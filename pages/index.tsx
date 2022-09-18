import { Select, Stack } from "@chakra-ui/react";
import "chart.js/auto";
import { toURL } from "lib/misc";
import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { Chart } from "react-chartjs-2";
import useSWR from "swr";

export default function Page() {
  const [days, setDays] = useState(31);
  const start = Math.floor(DateTime.now().minus({ days }).toSeconds());
  const end = Math.floor(DateTime.now().toSeconds());

  const { data: pageviews } = useSWR(
    toURL("/api/stats/pageviews-by-day", { start, end })
  );

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

  return (
    <Stack>
      <Select
        onChange={(e) => {
          setDays(Number(e.target.value));
        }}
      >
        <option value="7">Last Week</option>
        <option value="31">Last Month</option>
        <option value="90">Last 90 Days</option>
      </Select>
      {data && <Chart type="line" data={data} />}
    </Stack>
  );
}
