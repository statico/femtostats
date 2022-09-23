import Flag from "react-world-flags";
import countries from "i18n-iso-countries";
import {
  Box,
  Center,
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
  Text,
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

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

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

export const useDashboardData = () => {
  const view = useRecoilValue(viewState);
  const { data: raw } = useSWR(toURL("/api/stats/dashboard", view));
  const data = useBufferedValue(raw);
  return data;
};

export default function Page() {
  const data = useDashboardData();

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
          <DashboardStats />
          <PageViewChart />
        </Card>
      </GridItem>

      <TopTable title="Referrers" column="referrer" dataKey="topReferrers" />
      <TopTable title="Pathnames" column="pathname" dataKey="topPathnames" />
      <TopTable title="Countries" column="country" dataKey="topCountries" />
      <TopTable title="Browsers" column="browser" dataKey="topBrowsers" />
      <TopTable title="Device Types" column="device" dataKey="topDeviceTypes" />
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
  <Stat flex="none">
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

const DashboardStats = () => {
  const data = useDashboardData();
  return (
    <HStack spacing={10}>
      <DashboardStat
        title="Total Page Views"
        loading={!data}
        old={data?.countPageviewsPrev}
        new={data?.countPageviews}
      />
      <DashboardStat
        title="Total Sessions"
        loading={!data}
        old={data?.countSessionsPrev}
        new={data?.countSessions}
      />
      <DashboardStat
        title="Avg. Session"
        loading={!data}
        old={data?.averageSessionDurationPrev}
        new={data?.averageSessionDuration}
        formatter={(x: any) =>
          x ? Duration.fromMillis(x * 1000).toFormat("m:s") : "--:--"
        }
      />
    </HStack>
  );
};

const PageViewChart = () => {
  const data = useDashboardData()?.pageviewsByDay;
  return data ? (
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
};

const TopTable = ({
  title,
  column,
  dataKey,
}: {
  title: string;
  column: string;
  dataKey: string;
}) => {
  const data = useDashboardData()?.[dataKey];
  return (
    <Card>
      {data ? (
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>{title}</Th>
              <Th isNumeric>Page Views</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row: any, index: number) => (
              <Tr key={index}>
                <Td>
                  {column === "country" ? (
                    <HStack>
                      <Flag
                        code={row[column]}
                        height="20px"
                        width="20px"
                        fallback={
                          <Center h="16px" w="20px" bg="black" color="white">
                            ?
                          </Center>
                        }
                      />
                      <Text>
                        {countries.getName(row[column], "en", {
                          select: "alias",
                        }) || "(unknown)"}
                      </Text>
                    </HStack>
                  ) : (
                    row[column] || "(none)"
                  )}
                </Td>
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
};
