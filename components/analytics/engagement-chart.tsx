"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TimelinePoint } from "@/lib/analytics/metrics";

const formatAxisLabel = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
};

const formatTooltipLabel = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
};

export type EngagementChartProps = {
  data: TimelinePoint[];
};

export default function EngagementChart({ data }: EngagementChartProps) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="opened" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="clicked" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--rk-text-muted)", fontSize: 11 }}
            tickFormatter={formatAxisLabel}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fill: "var(--rk-text-muted)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ stroke: "var(--rk-border-md)", strokeDasharray: "4 4" }}
            contentStyle={{
              background: "var(--rk-surface)",
              border: "1px solid var(--rk-border)",
              borderRadius: 10,
              fontSize: 12,
              color: "var(--rk-text)",
            }}
            labelStyle={{ color: "var(--rk-text-muted)", marginBottom: 4 }}
            formatter={(value: number, name: string) => [value, name]}
            labelFormatter={formatTooltipLabel}
          />
          <Legend
            formatter={(value: string) => (
              <span style={{ color: "var(--rk-text-muted)", fontSize: 11 }}>{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="sent"
            name="Sent"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#sent)"
          />
          <Area
            type="monotone"
            dataKey="opened"
            name="Opened"
            stroke="var(--chart-2)"
            strokeWidth={2}
            fill="url(#opened)"
          />
          <Area
            type="monotone"
            dataKey="clicked"
            name="Clicked"
            stroke="var(--chart-3)"
            strokeWidth={2}
            fill="url(#clicked)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
