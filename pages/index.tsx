import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Select,
  Skeleton,
  SkeletonText,
  Stack,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  CheckerReturnType,
  number,
  object,
  optional,
  string,
} from "@recoiljs/refine";
import "chart.js/auto";
import DefaultLayout from "components/DefaultLayout";
import { useBufferedValue } from "hooks/useBufferedValue";
import { formatNumber, statPercent, statType, toURL } from "lib/misc";
import { DateTime, Duration } from "luxon";
import { ReactElement, ReactNode } from "react";
import { Chart } from "react-chartjs-2";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { syncEffect } from "recoil-sync";
import useSWR from "swr";

const viewChecker = object({
  hostname: optional(string()),
  start: optional(number()),
  end: optional(number()),
});

type ViewState = CheckerReturnType<typeof viewChecker>;

const viewState = atom<ViewState>({
  key: "view",
  default: {
    hostname: undefined,
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
        <Card>
          <DashboardStats data={data} />
          <PageViewChart data={data?.pageviews} />
        </Card>
      </GridItem>

      <TopReferrers data={data?.referrers} />
      <TopPathnames data={data?.pathnames} />
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

const HostnameSelector = () => {
  const [view, setView] = useRecoilState(viewState);
  const { data } = useSWR("/api/stats/hostnames");
  return (
    <Select
      maxW="xs"
      defaultValue={view.hostname}
      onChange={(e) => {
        const hostname = e.target.value || undefined;
        setView({ ...view, hostname });
      }}
    >
      <option value="">All Hostnames</option>
      {data &&
        data.hostnames.map((hostname: string) => (
          <option key={hostname}>{hostname}</option>
        ))}
    </Select>
  );
};

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

const DashboardStat = (props: {
  title: string;
  old: number;
  new: number;
  loading: boolean;
  formatter?: (value: any) => string;
}) => (
  <Stat>
    <StatLabel>{props.title}</StatLabel>
    {props.loading ? (
      <Stack spacing={2}>
        <Skeleton mt={2} h={7} w={24} />
        <Skeleton mt={2} h={4} w={16} />
      </Stack>
    ) : (
      <>
        <StatNumber>{(props.formatter || formatNumber)(props.new)}</StatNumber>
        <StatHelpText>
          <StatArrow type={statType(props.old, props.new)} />
          {statPercent(props.old, props.new)}
        </StatHelpText>
      </>
    )}
  </Stat>
);

const DashboardStats = ({ data }: { data: any }) => (
  <HStack spacing={4}>
    <DashboardStat
      title="Total Page Views"
      loading={!data}
      old={data?.prevNumPageviews}
      new={data?.numPageviews}
    />
    <DashboardStat
      title="Total Sessions"
      loading={!data}
      old={data?.prevNumSessions}
      new={data?.numSessions}
    />
    <DashboardStat
      title="Avg. Session"
      loading={!data}
      old={data?.prevAvgSession}
      new={data?.avgSession}
      formatter={(x: any) =>
        x ? Duration.fromMillis(x * 1000).toFormat("m:s") : "--:--"
      }
    />
  </HStack>
);

const PageViewChart = ({ data }: { data: any }) =>
  data ? (
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
              <Td isNumeric>{formatNumber(row.count)}</Td>
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
              <Td isNumeric>{formatNumber(row.count)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    ) : (
      <SkeletonText spacing={4} noOfLines={10} />
    )}
  </Card>
);
