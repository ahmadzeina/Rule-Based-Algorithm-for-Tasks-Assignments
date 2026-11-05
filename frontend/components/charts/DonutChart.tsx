"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { COLORS } from "@/lib/theme";
import { useMounted } from "@/lib/useMounted";
import { ChartTooltip } from "./ChartTooltip";

export interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutDatum[];
  height?: number;
  centerValue?: string;
  centerLabel?: string;
}

/** Donut chart with optional center metric (dark theme, no borders). */
export function DonutChart({
  data,
  height = 170,
  centerValue,
  centerLabel,
}: DonutChartProps) {
  const mounted = useMounted();
  if (!mounted) {
    return <div className="chart-skeleton" style={{ height }} />;
  }
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total <= 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          color: COLORS.text.placeholder,
        }}
      >
        No data yet
      </div>
    );
  }
  return (
    <div style={{ position: "relative", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<ChartTooltip />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="74%"
            outerRadius="98%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {(centerValue || centerLabel) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          {centerValue && (
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                color: COLORS.text.primary,
                lineHeight: 1.1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span style={{ fontSize: 11, color: COLORS.text.secondary }}>{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

DonutChart.displayName = "DonutChart";
