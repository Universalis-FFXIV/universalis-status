import type { NextPage } from "next";
import Head from "next/head";
import { subHours } from "date-fns";
import { Container, Link, Typography, useMediaQuery } from "@mui/material";
import universalis from "./universalis.png";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import { useMetrics } from "../hooks/useMetrics";
import { StatusMetricGauge } from "../components/StatusMetricGauge";
import { UniversalisFooter } from "../components/UniversalisFooter";

const Home: NextPage = () => {
  const matchesMobile = useMediaQuery("(max-width:600px)");
  const matchesMobileNarrow = useMediaQuery("(max-width:300px)");

  const end = new Date();
  const start = subHours(end, 6);
  const step = "5s";

  const {
    data: avgWebsiteErrorRate,
    error: avgWebsiteErrorRateErr,
    isLoading: avgWebsiteErrorRateLoading,
  } = useMetrics(
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
  } = useMetrics(
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
  } = useMetrics(
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
  } = useMetrics(
    'histogram_quantile(0.95, sum by(le) (rate(traefik_service_request_duration_seconds_bucket{service="universalis@docker"}[1m])))',
    start,
    end,
    step
  );
  if (avgApiResponseTimeErr != null) {
    console.error(avgApiResponseTimeErr);
  }

  const titleFontSize = matchesMobileNarrow
    ? 32
    : matchesMobile
    ? 36
    : undefined;
  const fontSize = matchesMobileNarrow ? 18 : undefined;
  const logoWidth = matchesMobile ? 2 : 1;
  const titleWidth = 12 - logoWidth;

  const title = "Service Status - Universalis";
  const description =
    "Final Fantasy XIV Online: Market Board aggregator. Find Prices, track Item History and create Price Alerts. Anywhere, anytime.";
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta name="description" content={description} />
      </Head>

      <Container maxWidth="md">
        <header>
          <Grid
            container
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={titleWidth}>
              <Typography variant="h2" component="h1" fontSize={titleFontSize}>
                Service Status
              </Typography>
            </Grid>
            <Grid item xs={logoWidth}>
              <Link href="https://universalis.app">
                <Image src={universalis} />
              </Link>
            </Grid>
          </Grid>
        </header>
        <main>
          <Typography variant="h5" component="h2" fontSize={fontSize} mb={2}>
            Website error rate
          </Typography>
          <StatusMetricGauge
            loading={avgWebsiteErrorRateLoading}
            error={avgWebsiteErrorRateErr}
            last={avgWebsiteErrorRate?.last ?? 0}
            mean={avgWebsiteErrorRate?.mean ?? 0}
            format={(n) => `${(n * 100).toFixed(2)}%`}
            mb={3}
          />
          <Typography variant="h5" component="h2" fontSize={fontSize} mb={2}>
            Website response time (P95)
          </Typography>
          <StatusMetricGauge
            loading={avgWebsiteResponseTimeLoading}
            error={avgWebsiteResponseTimeErr}
            last={avgWebsiteResponseTime?.last ?? 0}
            mean={avgWebsiteResponseTime?.mean ?? 0}
            maxValue={8}
            format={(n) => `${n.toFixed(2)}s`}
            mb={3}
          />
          <Typography variant="h5" component="h2" fontSize={fontSize} mb={2}>
            API error rate
          </Typography>
          <StatusMetricGauge
            loading={avgApiErrorRateLoading}
            error={avgApiErrorRateErr}
            last={avgApiErrorRate?.last ?? 0}
            mean={avgApiErrorRate?.mean ?? 0}
            format={(n) => `${(n * 100).toFixed(2)}%`}
            mb={3}
          />
          <Typography variant="h5" component="h2" fontSize={fontSize} mb={2}>
            API response time (P95)
          </Typography>
          <StatusMetricGauge
            loading={avgApiResponseTimeLoading}
            error={avgApiResponseTimeErr}
            last={avgApiResponseTime?.last ?? 0}
            mean={avgApiResponseTime?.mean ?? 0}
            maxValue={8}
            format={(n) => `${n.toFixed(2)}s`}
          />
        </main>
        <UniversalisFooter mt={10} />
      </Container>
    </>
  );
};

export default Home;
