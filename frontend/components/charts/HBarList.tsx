"use client";

import React from "react";
import { COLORS } from "@/lib/theme";

export interface HBarItem {
  label: React.ReactNode;
  value?: React.ReactNode;
  pct?: number;
  color?: string;
}

/** Compact horizontal bar list used in the right analytics panel. */
export function HBarList({ items }: { items: HBarItem[] }) {
  if (items.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: 12, color: COLORS.text.placeholder }}>No data yet</p>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => (
        <div key={i}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: COLORS.text.primary,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </span>
            {item.value != null && (
              <span
                style={{
                  fontSize: 12,
                  color: COLORS.text.secondary,
                  fontVariantNumeric: "tabular-nums",
                  flexShrink: 0,
                }}
              >
                {item.value}
              </span>
            )}
          </div>
          {item.pct != null && (
            <div style={{ height: 4, borderRadius: 2, background: COLORS.border, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${Math.max(0, Math.min(100, item.pct))}%`,
                  borderRadius: 2,
                  background: item.color ?? COLORS.accent.scope,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

HBarList.displayName = "HBarList";
