import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Text,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPercentage } from "../../utils/formatters";
const Tick = ({ x, y, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <text x={0} y={0} dy={14} textAnchor="middle" fill="#173159" fontSize="11">
      <tspan x="0">{String(payload.value).slice(0, 18)}</tspan>
      {String(payload.value).length > 18 && (
        <tspan x="0" dy="13">
          {String(payload.value).slice(18, 36)}
        </tspan>
      )}
    </text>
  </g>
);
const VerticalTick = ({ x, y, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <title>{String(payload.value)}</title>
    <Text
      x={0}
      y={8}
      angle={-90}
      width={140}
      maxLines={1}
      textAnchor="end"
      verticalAnchor="middle"
      fill="#173159"
      style={{ fontSize: "11px" }}
    >
      {String(payload.value)}
    </Text>
  </g>
);
export function PerformanceChart({
  title,
  data,
  color,
  verticalLabels = false,
}) {
  return (
    <article
      className={`panel chart${verticalLabels ? " chart--vertical-labels" : ""}`}
    >
      <h2>{title}</h2>
      <div className="chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 24, right: 12, left: 0, bottom: 48 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              interval={0}
              height={verticalLabels ? 150 : 58}
              tick={verticalLabels ? <VerticalTick /> : <Tick />}
            />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(v, _, item) => [
                formatPercentage(v),
                `OTD, jobs: ${item.payload.denominator ?? "—"}`,
              ]}
            />
            <Bar dataKey="percentage" fill={color} radius={[3, 3, 0, 0]}>
              <LabelList
                dataKey="percentage"
                position="top"
                formatter={formatPercentage}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        {data
          .map((d) => `${d.name}: ${formatPercentage(d.percentage)}`)
          .join("; ")}
      </p>
    </article>
  );
}
