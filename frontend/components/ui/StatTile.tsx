"use client";

import React from "react";
import { COLORS, RADIUS } from "@/lib/theme";

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: string;
  icon?: React.ReactNode;
}

/** Compact metric tile: 11px label, large value, optional sub-line. */
export function StatTile({ label, value, sub, accent, icon }: StatTileProps) {
  return (
    <div
      style={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADIUS.lg,
        background: "rgba(255, 255, 255, 0.015)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            color: COLORS.text.secondary,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </p>
        <p
          style={{
            margin: "4px 0 0 0",
            fontSize: "22px",
            fontWeight: 600,
            lineHeight: 1.2,
            color: accent ?? COLORS.text.primary,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </p>
        {sub && (
          <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: COLORS.text.secondary }}>
            {sub}
          </p>
        )}
      </div>
      {icon && <div style={{ color: COLORS.text.secondary, flexShrink: 0, marginTop: 2 }}>{icon}</div>}
    </div>
  );
}

StatTile.displayName = "StatTile";
