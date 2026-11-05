"use client";

import React from "react";
import { COLORS } from "@/lib/theme";

interface DonutProps {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
}

/** Minimal SVG donut progress indicator (16-20px inline per design.md §5D). */
export function Donut({
  pct,
  size = 16,
  stroke = 3,
  color = COLORS.accent.scope,
  trackColor = COLORS.border,
}: DonutProps) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = (clamped / 100) * c;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{ flexShrink: 0, transform: "rotate(-90deg)" }}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
      {clamped > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
        />
      )}
    </svg>
  );
}

Donut.displayName = "Donut";
