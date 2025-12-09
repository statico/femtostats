import {
  Box,
  Grid,
  GridItem,
  HStack,
  IconButton,
  NativeSelect,
  Skeleton,
  SkeletonText,
  Stack,
  Stat,
  StatDownIndicator,
  StatHelpText,
  StatLabel,
  StatUpIndicator,
  StatValueText,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Text,
} from "@chakra-ui/react";
import { useColorModeValue } from "hooks/useColorModeValue";
import { CheckerReturnType, number, object, optional } from "@recoiljs/refine";
import "chart.js/auto";
import DefaultLayout from "components/DefaultLayout";
import { useSiteEditor } from "components/SiteEditor";
import { useBufferedValue } from "hooks/useBufferedValue";
import { formatNumber, statPercent, statType, toURL } from "lib/misc";
import { DateTime, Duration } from "luxon";
import { ReactElement, ReactNode } from "react";
import { Chart } from "react-chartjs-2";
import { MdPerson, MdSettings } from "react-icons/md";
import { atom, useRecoilState, useRecoilValue } from "recoil";
import { syncEffect } from "recoil-sync";
import useSWR from "swr";
import { Country } from "../components/Country";

const viewChecker = object({
  siteId: optional(number()),
  start: optional(number()),
  end: optional(number()),
});

type ViewState = CheckerReturnType<typeof viewChecker>;

const viewState = atom<ViewState>({
  key: "view",
  default: {
    siteId: undefined,
    start: Math.floor(DateTime.now().minus({ days: 31 }).toSeconds()),
    end: Math.floor(DateTime.now().toSeconds()),
  },
  effects: [syncEffect({ refine: viewChecker })],
});

const useDashboardData = () => {
  const view = useRecoilValue(viewState);
  const { data: raw } = useSWR(toURL("/api/stats/dashboard", view), {
    refreshInterval: 60000,
  });
  const data = useBufferedValue(raw);
  return data;
};

export default function Page() {
  const SiteEditor = useSiteEditor();

  return (
    <>
      <SiteEditor.Component />
      <Grid gap={4} gridTemplate={{ base: "1fr", lg: "repeat(2, 1fr)" }}>
        <GridItem>
          <HStack>
            <SiteSelector />
            <IconButton
              variant="ghost"
              onClick={SiteEditor.show}
              aria-label={"Show site editor"}
            >
              <MdSettings />
            </IconButton>
          </HStack>
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
        <TopTable
          title="Operating Systems"
          column="os"
          dataKey="topOperatingSystems"
        />
        <TopTable
          title="Device Types"
          column="device"
          dataKey="topDeviceTypes"
        />
      </Grid>
    </>
  );
}

Page.getLayout = (page: ReactElement) => {
  return <DefaultLayout title="Dashboard">{page}</DefaultLayout>;
};

// Make page dynamic to avoid SSR issues with Chakra UI v3
export const getServerSideProps = () => {
  return { props: {} };
};

const Card = ({ children }: { children: ReactNode }) => {
  const bg = useColorModeValue("gray.100", "gray.700");
  return (
    <Stack gap={4} borderRadius="lg" bg={bg} p={4}>
      {children}
    </Stack>
  );
};

const SiteSelector = () => {
  const [view, setView] = useRecoilState(viewState);
  const { data } = useSWR("/api/stats/sites/list");
  return (
    <NativeSelect.Root maxW="xs">
      <NativeSelect.Field
        value={String(view.siteId || "")}
        onChange={(e) => {
          const siteId = Number(e.target.value) || undefined;
          setView({ ...view, siteId });
        }}
      >
        <option value="">All Sites</option>
        {data &&
          data.sites.map((site: any) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
      </NativeSelect.Field>
    </NativeSelect.Root>
  );
};

const DateRangeSelector = () => {
  const [view, setView] = useRecoilState(viewState);
  return (
    <NativeSelect.Root maxW="xs">
      <NativeSelect.Field
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
      </NativeSelect.Field>
    </NativeSelect.Root>
  );
};

const DashboardStat = (props: {
  title: string;
  old?: number;
  new: number;
  loading: boolean;
  formatter?: (value: any) => string;
  icon?: ReactNode;
}) => (
  <Stat.Root flex="none">
    <StatLabel>{props.title}</StatLabel>
    {props.loading ? (
      <Stack gap={2}>
        <Skeleton mt={2} h={7} w={24} />
        <Skeleton mt={2} h={4} w={16} />
      </Stack>
    ) : (
      <>
        <StatValueText>
          {(props.formatter || formatNumber)(props.new)}
        </StatValueText>
        <StatHelpText>
          {props.old ? (
            <>
              {statType(props.old, props.new) === "increase" ? (
                <StatUpIndicator />
              ) : (
                <StatDownIndicator />
              )}
              {statPercent(props.old, props.new)}
            </>
          ) : props.icon ? (
            <Text color="green.300">{props.icon}</Text>
          ) : (
            <>&nbsp;</>
          )}
        </StatHelpText>
      </>
    )}
  </Stat.Root>
);

const DashboardStats = () => {
  const data = useDashboardData();
  return (
    <HStack gap={10}>
      <DashboardStat
        title="Current Visitors"
        loading={!data}
        new={data?.countLiveUsers}
        icon={<MdPerson />}
      />
      <DashboardStat
        title="Total Page Views"
        loading={!data}
        old={data?.countPageviewsPrev}
        new={data?.countPageviews}
      />
      <DashboardStat
        title="Unique Visitors"
        loading={!data}
        old={data?.countUsersPrev}
        new={data?.countUsers}
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
      <DashboardStat
        title="Bounce Rate"
        loading={!data}
        old={data?.countBounces / data?.countSessions}
        new={data?.countBouncesPrev / data?.countSessionsPrev}
        formatter={(x: any) =>
          isNaN(x) ? "n/a" : Number(x * 100).toFixed(1) + "%"
        }
      />
    </HStack>
  );
};

const PageViewChart = () => {
  const data = useDashboardData()?.pageviewsByDay;
  const dashed = [6, 6];
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
              segment: {
                borderDash: (ctx) =>
                  ctx.p1DataIndex === data.values.length - 1
                    ? dashed
                    : undefined,
              },
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
                        this.getLabelForValue(Number(val)),
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
  const data = useDashboardData();
  const rows = data?.[dataKey];
  const total = data?.countPageviews;
  const bg = useColorModeValue("gray.300", "gray.800");
  return (
    <Card>
      {rows ? (
        <Table.Root size="sm">
          <TableHeader>
            <TableRow>
              <TableHeader>{title}</TableHeader>
              <TableHeader textAlign="end">Page Views</TableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row: any, index: number) => (
              <TableRow key={index}>
                <TableCell position="relative" width="66%">
                  <Box
                    position="relative"
                    zIndex={1}
                    _after={{
                      content: '""',
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: `calc(${(row.count / total) * 100}% + 0.1rem)`,
                      bg,
                      opacity: 0.5,
                      zIndex: 0,
                    }}
                  >
                    {column === "country" ? (
                      <Country code={row.country} />
                    ) : (
                      row[column] || "(none)"
                    )}
                  </Box>
                </TableCell>
                <TableCell textAlign="end">{formatNumber(row.count)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table.Root>
      ) : (
        <SkeletonText gap={4} noOfLines={10} />
      )}
    </Card>
  );
};
