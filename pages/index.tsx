import { Box, Select, Stack } from "@chakra-ui/react";
import "chart.js/auto";
import DefaultLayout from "components/DefaultLayout";
import { toURL } from "lib/misc";
import { DateTime } from "luxon";
import { ReactElement, useState } from "react";
import { Chart } from "react-chartjs-2";
import { atom, useRecoilState } from "recoil";
import useSWR from "swr";

type ViewState = {
  start: number;
  end: number;
};

const viewState = atom<ViewState>({
  key: "view",
  default: {
    start: Math.floor(DateTime.now().minus({ days: 31 }).toSeconds()),
    end: Math.floor(DateTime.now().toSeconds()),
  },
});

export default function Page() {
  const [view, setView] = useRecoilState(viewState);
  const { data } = useSWR(toURL("/api/stats/dashboard", view));

  return (
    <>
      <Stack borderRadius="lg" bg="gray.700" p={4}>
        <Box maxW="xs">
          <Select
            defaultValue="31"
            onChange={(e) => {
              const days = Number(e.target.value);
              setView({
                ...view,
                start: Math.floor(DateTime.now().minus({ days }).toSeconds()),
              });
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
