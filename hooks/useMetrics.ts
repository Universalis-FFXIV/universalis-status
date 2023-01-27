import { PrometheusDriver } from "prometheus-query";
import useSWR from "swr";

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

export const useMetrics = (
  query: string,
  start: Date,
  end: Date,
  step: string
) =>
  useSWR(query, (q) =>
    queryTimeSeries(q, start, end, step).then((data) => ({
      mean: mean(data),
      last: data.length > 0 ? data[data.length - 1].value : 0,
    }))
  );
