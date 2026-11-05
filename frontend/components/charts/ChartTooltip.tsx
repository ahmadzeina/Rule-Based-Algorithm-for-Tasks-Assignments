"use client";

import React from "react";
import { COLORS } from "@/lib/theme";

export interface TooltipEntry {
  name?: string | number;
  value?: string | number | Array<string | number>;
  color?: string;
  dataKey?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
  suffix?: string;
}

/** Theme-styled recharts tooltip (dark surface, 1px border, 12px text). */
export function ChartTooltip({ active, payload, label, suffix = "" }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      style={{
        background: COLORS.chart.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 12,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
        minWidth: 120,
      }}
    >
      {label != null && label !== "" && (
        <div style={{ color: COLORS.text.secondary, fontSize: 11, marginBottom: 4 }}>
          {label}
        </div>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: entry.color ?? COLORS.accent.scope,
              flexShrink: 0,
            }}
          />
          <span style={{ color: COLORS.text.primary }}>{entry.name ?? entry.dataKey}</span>
          <span
            style={{
              color: COLORS.text.secondary,
              marginLeft: "auto",
              paddingLeft: 12,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {Array.isArray(entry.value) ? entry.value.join(", ") : entry.value}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

ChartTooltip.displayName = "ChartTooltip";
