import type { NextPage } from "next";
import Head from "next/head";
import { PrometheusDriver } from "prometheus-query";
import { subHours } from "date-fns";
import useSWR from "swr";
import { Container, Skeleton, styled, Typography } from "@mui/material";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import universalis from "./universalis.png";
import Grid from "@mui/material/Grid";
import Image from "next/image";

const prom = new PrometheusDriver({
  endpoint: "https://victoria.universalis.app",
});

interface DataPoint {
  time: Date;
  value: number;
}

const queryTimeSeries = async (
  q: string,
  start: Date,
  end: Date,
  step: string
): Promise<DataPoint[]> => {
  const queryResult = await prom.rangeQuery(q, start, end, step);
  if (queryResult.result.length !== 1) {
    throw new Error(
      `Expected single time series, got ${queryResult.result.length}`
    );
  }

  const series: Iterable<DataPoint> = queryResult.result[0].values;
  return [...series];
};

const mean = (data: DataPoint[]): number => {
  let total = 0.0;
  let count = 0;
  for (const point of data) {
    total += point.value;
    count++;
  }

  return total / count;
};

const useMeanMetric = (query: string, start: Date, end: Date, step: string) =>
  useSWR(query, (q) => queryTimeSeries(q, start, end, step).then(mean));

const ThresholdLinearProgress = styled(LinearProgress)(({ theme, value }) => ({
  height: 30,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor:
      theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: (value ?? 0) >= 80 ? "#ff0000" : "#1a90ff",
  },
}));

const rescale = (value: number, minValue: number, maxValue: number) => {
  return (value - minValue) / (maxValue - minValue);
};

interface MetricGaugeProps {
  label: string;
  value: number;
  loading?: boolean;
  error?: boolean;
  minValue?: number;
  maxValue?: number;
  format?: (value: number) => JSX.Element | JSX.Element[] | string;
}

const MetricGauge = ({
  label,
  value,
  loading = false,
  error = false,
  minValue = 0,
  maxValue = 100,
  format = () => <>{value}</>,
}: MetricGaugeProps) => {
  if (loading) {
    return (
      <div>
        <Typography variant="body1">{label}:&nbsp;Loading</Typography>
        <Skeleton variant="rounded" height={30} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Typography variant="body1">
          {label}:&nbsp;<span style={{ color: "red" }}>Unable to retrieve</span>
        </Typography>
        <Skeleton variant="rounded" height={30} sx={{ bgcolor: "red" }} />
      </div>
    );
  }

  const valueText = format(value);
  const valueScaled = rescale(value, minValue, maxValue) * 100;
  return (
    <div>
      <Typography variant="body1">
        {label}:&nbsp;{valueText}
      </Typography>
      <ThresholdLinearProgress
        color="primary"
        variant="determinate"
        value={valueScaled}
      />
    </div>
  );
};

const Gap = () => {
  return <div style={{ marginBottom: 10 }} />;
};

const Home: NextPage = () => {
  const end = new Date();
  const start = subHours(end, 6);
  const step = "5s";

  const {
    data: avgWebsiteErrorRate,
    error: avgWebsiteErrorRateErr,
    isLoading: avgWebsiteErrorRateLoading,
  } = useMeanMetric(
    '1.0 - ((sum (rate(traefik_service_requests_total{service="mogboard@docker", code="200"}[1m]))) / (sum (rate(traefik_service_requests_total{service="mogboard@docker"}[1m]))))',
    start,
    end,
    step
  );
  if (avgWebsiteErrorRateErr != null) {
    console.error(avgWebsiteErrorRateErr);
  }

  const {
    data: avgWebsiteResponseTime,
    error: avgWebsiteResponseTimeErr,
    isLoading: avgWebsiteResponseTimeLoading,
  } = useMeanMetric(
    'histogram_quantile(0.95, sum by(le) (rate(traefik_service_request_duration_seconds_bucket{service="mogboard@docker"}[1m])))',
    start,
    end,
    step
  );
  if (avgWebsiteResponseTimeErr != null) {
    console.error(avgWebsiteResponseTimeErr);
  }

  const {
    data: avgApiErrorRate,
    error: avgApiErrorRateErr,
    isLoading: avgApiErrorRateLoading,
  } = useMeanMetric(
    '1.0 - ((sum (rate(traefik_service_requests_total{service="universalis@docker", code="200"}[1m]))) / (sum (rate(traefik_service_requests_total{service="universalis@docker"}[1m]))))',
    start,
    end,
    step
  );
  if (avgApiErrorRateErr != null) {
    console.error(avgApiErrorRateErr);
  }

  const {
    data: avgApiResponseTime,
    error: avgApiResponseTimeErr,
    isLoading: avgApiResponseTimeLoading,
  } = useMeanMetric(
    'histogram_quantile(0.95, sum by(le) (rate(traefik_service_request_duration_seconds_bucket{service="universalis@docker"}[1m])))',
    start,
    end,
    step
  );
  if (avgApiResponseTimeErr != null) {
    console.error(avgApiResponseTimeErr);
  }

  return (
    <>
      <Head>
        <title>Universalis - Service Status</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container maxWidth="md">
        <Grid
          container
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item xs={11}>
            <Typography variant="h2" component="h1">
              Service Status
            </Typography>
          </Grid>
          <Grid item xs={1}>
            <a href="https://universalis.app">
              <Image src={universalis} />
            </a>
          </Grid>
        </Grid>

        <MetricGauge
          label="Website error rate"
          loading={avgWebsiteErrorRateLoading}
          error={avgWebsiteErrorRateErr}
          value={avgWebsiteErrorRate ?? 0}
          format={(n) => `${(n * 100).toFixed(2)}%`}
        />
        <Gap />
        <MetricGauge
          label="Website response time (P95)"
          loading={avgWebsiteResponseTimeLoading}
          error={avgWebsiteResponseTimeErr}
          value={avgWebsiteResponseTime ?? 0}
          maxValue={8}
          format={(n) => `${n.toFixed(2)}s`}
        />
        <Gap />
        <MetricGauge
          label="API error rate"
          loading={avgApiErrorRateLoading}
          error={avgApiErrorRateErr}
          value={avgApiErrorRate ?? 0}
          format={(n) => `${(n * 100).toFixed(2)}%`}
        />
        <Gap />
        <MetricGauge
          label="API response time (P95)"
          loading={avgApiResponseTimeLoading}
          error={avgApiResponseTimeErr}
          value={avgApiResponseTime ?? 0}
          maxValue={8}
          format={(n) => `${n.toFixed(2)}s`}
        />
      </Container>
    </>
  );
};

export default Home;
