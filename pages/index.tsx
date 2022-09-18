import { Box, Select, Stack } from "@chakra-ui/react";
import "chart.js/auto";
import DefaultLayout from "components/DefaultLayout";
import { toURL } from "lib/misc";
import { DateTime } from "luxon";
import { ReactElement, useState } from "react";
import { Chart } from "react-chartjs-2";
import useSWR from "swr";

export default function Page() {
  const [days, setDays] = useState(31);
  const start = Math.floor(DateTime.now().minus({ days }).toSeconds());
  const end = Math.floor(DateTime.now().toSeconds());

  const { data } = useSWR(toURL("/api/stats/pageviews-by-day", { start, end }));

  return (
    <>
      <Stack borderRadius="lg" bg="gray.700" p={4}>
        <Box maxW="xs">
          <Select
            onChange={(e) => {
              setDays(Number(e.target.value));
            }}
          >
            <option value="7">Last Week</option>
            <option value="31">Last Month</option>
            <option value="90">Last 90 Days</option>
          </Select>
        </Box>

        {data && (
          <Chart
            datasetIdKey="pageviews-by-day"
            type="line"
            data={{
              labels: data.labels,
              datasets: [
                {
                  label: "Page Views",
                  data: data.values,
                },
              ],
            }}
          />
        )}
      </Stack>
    </>
  );
}

Page.getLayout = (page: ReactElement) => {
  return <DefaultLayout title="Dashboard">{page}</DefaultLayout>;
};
