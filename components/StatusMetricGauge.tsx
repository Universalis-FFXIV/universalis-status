import {
  Box,
  BoxProps,
  Grid,
  Skeleton,
  styled,
  Typography,
} from "@mui/material";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import useMediaQuery from "@mui/material/useMediaQuery";

const ThresholdLinearProgress = styled(LinearProgress)(({ value }) => ({
  height: 15,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: "#252830",
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: (value ?? 0) >= 80 ? "#ff0000" : "#1a90ff",
  },
}));

interface StatusLinearProgressProps {
  value: number;
  loading: boolean;
  error: boolean;
}

const StatusLinearProgress = ({
  value,
  loading,
  error,
}: StatusLinearProgressProps) => {
  if (loading) {
    return <Skeleton variant="rounded" height={15} />;
  }

  if (error) {
    return <Skeleton variant="rounded" height={15} sx={{ bgcolor: "red" }} />;
  }

  return (
    <ThresholdLinearProgress
      color="primary"
      variant="determinate"
      value={value}
    />
  );
};

const rescale = (value: number, minValue: number, maxValue: number) => {
  return (value - minValue) / (maxValue - minValue);
};

export interface StatusMetricGaugeProps extends BoxProps {
  last: number;
  mean: number;
  loading?: boolean;
  error?: boolean;
  minValue?: number;
  maxValue?: number;
  format?: (value: number) => JSX.Element | JSX.Element[] | string;
}

export const StatusMetricGauge = ({
  last,
  mean,
  loading = false,
  error = false,
  minValue = 0,
  maxValue = 100,
  format = () => <>{last}</>,
  ...boxProps
}: StatusMetricGaugeProps) => {
  const matchesMobile = useMediaQuery("(max-width:600px)");
  const matchesMobileNarrow = useMediaQuery("(max-width:300px)");

  const statusFormat = (value: number) =>
    loading ? "Loading" : error ? "Error" : format(value);

  const lastText = statusFormat(last);
  const lastScaled = rescale(last, minValue, maxValue) * 100;
  const meanText = statusFormat(mean);
  const meanScaled = rescale(mean, minValue, maxValue) * 100;

  const labelColor = error ? "red" : "#fffca6";

  const labelWidth = matchesMobileNarrow ? 5 : matchesMobile ? 4 : 2;
  const gaugeWidth = 12 - labelWidth;

  return (
    <Box {...boxProps}>
      <Grid
        container
        spacing={1}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item xs={labelWidth}>
          <Typography variant="body1">
            Last:&nbsp;<span style={{ color: labelColor }}>{lastText}</span>
          </Typography>
        </Grid>
        <Grid item xs={gaugeWidth}>
          <StatusLinearProgress
            loading={loading}
            error={error}
            value={lastScaled}
          />
        </Grid>
        <Grid item xs={labelWidth}>
          <Typography variant="body1">
            Mean:&nbsp;<span style={{ color: labelColor }}>{meanText}</span>
          </Typography>
        </Grid>
        <Grid item xs={gaugeWidth}>
          <StatusLinearProgress
            loading={loading}
            error={error}
            value={meanScaled}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
