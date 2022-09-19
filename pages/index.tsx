import {
  Box,
  Flex,
  Grid,
  GridItem,
  Select,
  Skeleton,
  SkeletonText,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { CheckerReturnType, number, object, optional } from "@recoiljs/refine";
import "chart.js/auto";
import DefaultLayout from "components/DefaultLayout";
import { useBufferedValue } from "hooks/useBufferedValue";
import { toURL } from "lib/misc";
import { DateTime } from "luxon";
import { ReactElement, ReactNode } from "react";
import { Chart } from "react-chartjs-2";
import { atom, useRecoilState, useRecoilValue } from "recoil";
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
  const view = useRecoilValue(viewState);
  const { data: raw } = useSWR(toURL("/api/stats/dashboard", view));
  const data = useBufferedValue(raw);

  return (
    <Grid gap={4} gridTemplate={{ base: "1fr", lg: "repeat(2, 1fr)" }}>
      <GridItem>
        <HostnameSelector />
      </GridItem>
      <GridItem display="flex" justifyContent="flex-end">
        <DateRangeSelector />
      </GridItem>

      <GridItem colSpan={2}>
        <PageViewChart data={data?.pageviews} />
      </GridItem>

      <GridItem>
        <TopReferrers data={data?.topReferrers} />
      </GridItem>
      <GridItem>
        <TopPathnames data={data?.topPathnames} />
      </GridItem>
    </Grid>
  );
}

Page.getLayout = (page: ReactElement) => {
  return <DefaultLayout title="Dashboard">{page}</DefaultLayout>;
};

const Card = ({ children }: { children: ReactNode }) => (
  <Stack spacing={4} borderRadius="lg" bg="gray.700" p={4}>
    {children}
  </Stack>
);

const HostnameSelector = () => (
  <Select maxW="xs">
    <option>TODO: hostname</option>
  </Select>
);

const DateRangeSelector = () => {
  const [view, setView] = useRecoilState(viewState);
  return (
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
  );
};

const PageViewChart = ({ data }: { data: any }) => (
  <Card>
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
    </Flex>
    {data ? (
      <Box h="300px">
        <Chart
          datasetIdKey="pageviews-by-day"
          type="line"
          data={{
            labels: data.labels,
            datasets: [
              {
                label: "Page Views",
                data: data.values,
                spanGaps: true,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: {
                  callback: function (val, index) {
                    return index % 2 === 0
                      ? DateTime.fromISO(
                          this.getLabelForValue(Number(val))
                        ).toFormat("ccc, d LLL")
                      : "";
                  },
                },
              },
            },
          }}
        />
      </Box>
    ) : (
      <Skeleton h="300px" />
    )}
  </Card>
);

const TopReferrers = ({ data }: { data: any }) => (
  <Card>
    {data ? (
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Referrer</Th>
            <Th isNumeric>Page Views</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row: any, index: number) => (
            <Tr key={index}>
              <Td>{row.referrer || "(none)"}</Td>
              <Td isNumeric>{Number(row.count).toLocaleString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    ) : (
      <SkeletonText spacing={4} noOfLines={10} />
    )}
  </Card>
);

const TopPathnames = ({ data }: { data: any }) => (
  <Card>
    {data ? (
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Pathname</Th>
            <Th isNumeric>Page Views</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row: any, index: number) => (
            <Tr key={index}>
              <Td>{row.pathname}</Td>
              <Td isNumeric>{Number(row.count).toLocaleString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    ) : (
      <SkeletonText spacing={4} noOfLines={10} />
    )}
  </Card>
);
