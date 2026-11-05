"use client";

import React from "react";
import { COLORS } from "@/lib/theme";

interface ProgressBarProps {
  pct: number;
  color?: string;
  height?: number;
  trackColor?: string;
}

export function ProgressBar({
  pct,
  color = COLORS.accent.scope,
  height = 4,
  trackColor = COLORS.border,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: height / 2,
        backgroundColor: trackColor,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${clamped}%`,
          borderRadius: height / 2,
          backgroundColor: color,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  );
}

ProgressBar.displayName = "ProgressBar";
