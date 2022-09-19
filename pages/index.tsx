import {
  Box,
  Flex,
  Select,
  Skeleton,
  SkeletonText,
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { CheckerReturnType, number, object, optional } from "@recoiljs/refine";
import "chart.js/auto";
import DefaultLayout from "components/DefaultLayout";
import { toURL } from "lib/misc";
import { DateTime } from "luxon";
import { ReactElement } from "react";
import { Chart } from "react-chartjs-2";
import { atom, useRecoilState } from "recoil";
import { syncEffect } from "recoil-sync";
import useSWR from "swr";

const viewChecker = object({
  start: optional(number()),
  end: optional(number()),
});

type ViewState = CheckerReturnType<typeof viewChecker>;

const viewState = atom<ViewState>({
  key: "view",
  default: {
    start: Math.floor(DateTime.now().minus({ days: 31 }).toSeconds()),
    end: Math.floor(DateTime.now().toSeconds()),
  },
  effects: [syncEffect({ refine: viewChecker })],
});

export default function Page() {
  const [view, setView] = useRecoilState(viewState);
  const { data } = useSWR(toURL("/api/stats/dashboard", view));

  return (
    <>
      <Stack spacing={4} borderRadius="lg" bg="gray.700" p={4}>
        <Flex justify="space-between">
          <Stat>
            <StatLabel>Total Page Views</StatLabel>
            {data ? (
              <StatNumber>
                {Number(
                  data.values.reduce((a: number, b: number) => a + b, 0)
                ).toLocaleString()}
              </StatNumber>
            ) : (
              <Skeleton mt={2} h={6} w={24} />
            )}
          </Stat>
          <Select
            maxW="xs"
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
        </Flex>

        {data ? (
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
        ) : (
          <Skeleton h="500px" />
        )}
      </Stack>
    </>
  );
}

Page.getLayout = (page: ReactElement) => {
  return <DefaultLayout title="Dashboard">{page}</DefaultLayout>;
};
