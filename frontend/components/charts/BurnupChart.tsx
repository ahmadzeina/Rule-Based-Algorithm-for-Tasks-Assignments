"use client";

import React, { useId } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { COLORS } from "@/lib/theme";
import type { BurnupPoint } from "@/lib/burnup";
import { useMounted } from "@/lib/useMounted";
import { ChartTooltip } from "./ChartTooltip";

interface BurnupChartProps {
  points: BurnupPoint[];
  todayIndex?: number | null;
  height?: number;
}

/**
 * Burn-up chart per design.md §5C: smoothed multi-line curves (Scope,
 * Allocated, Unallocated) with subtle gradient fills, hidden Y axis,
 * sparse 11px X labels, and a solid red "today" marker line.
 */
export function BurnupChart({ points, todayIndex = null, height = 240 }: BurnupChartProps) {
  const mounted = useMounted();
  const uid = useId().replace(/:/g, "");
  const scopeId = `scope-${uid}`;
  const allocId = `alloc-${uid}`;
  const unasgId = `unasg-${uid}`;
  const axisTick = { fontSize: 11, fill: COLORS.text.placeholder };

  if (!mounted) {
    return <div className="chart-skeleton" style={{ height }} />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={scopeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.accent.scope} stopOpacity={0.22} />
            <stop offset="100%" stopColor={COLORS.accent.scope} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id={allocId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.accent.completed} stopOpacity={0.2} />
            <stop offset="100%" stopColor={COLORS.accent.completed} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id={unasgId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.accent.alert} stopOpacity={0.14} />
            <stop offset="100%" stopColor={COLORS.accent.alert} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={COLORS.chart.grid} strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="label"
          tick={axisTick}
          tickLine={false}
          axisLine={{ stroke: COLORS.border }}
          interval="preserveStartEnd"
          minTickGap={28}
        />
        <YAxis hide domain={[0, "auto"]} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: COLORS.border }} />
        {todayIndex != null && points[todayIndex] && (
          <ReferenceLine
            x={points[todayIndex].label}
            stroke={COLORS.accent.alert}
            strokeWidth={1.5}
          />
        )}
        <Area
          type="monotone"
          dataKey="demand"
          name="Scope"
          stroke={COLORS.accent.scope}
          strokeWidth={2}
          fill={`url(#${scopeId})`}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="allocated"
          name="Allocated"
          stroke={COLORS.accent.completed}
          strokeWidth={2}
          fill={`url(#${allocId})`}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="unassigned"
          name="Unallocated"
          stroke={COLORS.accent.alert}
          strokeWidth={1.5}
          strokeDasharray="4 3"
          fill={`url(#${unasgId})`}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface LegendItem {
  label: string;
  value?: React.ReactNode;
  color: string;
}

/** Legend per design.md §5C: colored square + metric title + total/delta. */
export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 12 }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: item.color,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, color: COLORS.text.secondary }}>{item.label}</span>
          {item.value != null && (
            <span
              style={{
                fontSize: 12,
                color: COLORS.text.primary,
                fontWeight: 500,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

BurnupChart.displayName = "BurnupChart";
ChartLegend.displayName = "ChartLegend";
