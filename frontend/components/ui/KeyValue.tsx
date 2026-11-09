"use client";

import React from "react";
import { COLORS } from "@/lib/theme";

export interface KeyValueRow {
  label: string;
  value: React.ReactNode;
}

/**
 * Properties table from design.md §5A: clean, borderless key-value layout
 * with a ~120px label column on the left.
 */
export function KeyValue({ rows }: { rows: KeyValueRow[] }) {
  return (
    <div>
      {rows.map((row, i) => (
        <div
          key={`${row.label}-${i}`}
          style={{
            display: "grid",
            gridTemplateColumns: "120px minmax(0, 1fr)",
            gap: 12,
            padding: "6px 0",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color: COLORS.text.secondary }}>{row.label}</span>
          <span
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: COLORS.text.primary,
              minWidth: 0,
            }}
          >
            {row.value ?? "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

KeyValue.displayName = "KeyValue";
