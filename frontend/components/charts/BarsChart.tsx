"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { COLORS } from "@/lib/theme";
import { useMounted } from "@/lib/useMounted";
import { ChartTooltip } from "./ChartTooltip";

type Datum = Record<string, string | number>;

interface BarsChartProps {
  data: Datum[];
  xKey: string;
  yKey: string;
  name?: string;
  color?: string;
  /** Optional per-index bar colors (e.g. priority colors). */
  colors?: string[];
  height?: number;
}

/** Minimal bar chart: hidden Y axis, sparse 11px X labels, thin bars. */
export function BarsChart({
  data,
  xKey,
  yKey,
  name,
  color = COLORS.accent.scope,
  colors,
  height = 200,
}: BarsChartProps) {
  const mounted = useMounted();
  if (!mounted) {
    return <div className="chart-skeleton" style={{ height }} />;
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={COLORS.chart.grid} strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: COLORS.text.placeholder }}
          tickLine={false}
          axisLine={{ stroke: COLORS.border }}
          interval="preserveStartEnd"
          minTickGap={16}
        />
        <YAxis hide domain={[0, "auto"]} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.03)" }} />
        <Bar dataKey={yKey} name={name ?? yKey} fill={color} radius={[3, 3, 0, 0]} maxBarSize={20}>
          {colors && data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

BarsChart.displayName = "BarsChart";
