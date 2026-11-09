"use client";

import React from "react";
import { COLORS, TYPOGRAPHY, SPACING } from "@/lib/theme";

interface TableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  striped?: boolean;
  /** Minimum table width in px before horizontal scrolling kicks in */
  minWidth?: number;
}

/**
 * Clean, borderless data table per design.md §7: 11px secondary uppercase
 * header, single hairline row dividers, no zebra backgrounds.
 */
export const Table: React.FC<TableProps> = ({
  headers,
  rows,
  striped = false,
  minWidth = 640,
}) => (
  <div
    style={{
      overflowX: "auto",
      borderRadius: 8,
      border: `1px solid ${COLORS.border}`,
    }}
  >
    <table
      style={{
        width: "100%",
        minWidth: `${minWidth}px`,
        borderCollapse: "collapse",
        fontSize: TYPOGRAPHY.body.fontSize,
      }}
    >
      <thead>
        <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
          {headers.map((header, i) => (
            <th
              key={i}
              style={{
                padding: `8px ${SPACING.md}`,
                textAlign: "left",
                fontWeight: 500,
                fontSize: TYPOGRAPHY.small.fontSize,
                color: COLORS.text.secondary,
                whiteSpace: "nowrap",
              }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIdx) => (
          <tr
            key={rowIdx}
            style={{
              borderBottom: `1px solid ${COLORS.border}`,
              background:
                striped && rowIdx % 2 === 1 ? "rgba(255, 255, 255, 0.015)" : "transparent",
            }}
          >
            {row.map((cell, cellIdx) => (
              <td
                key={cellIdx}
                style={{
                  padding: `10px ${SPACING.md}`,
                  color: COLORS.text.primary,
                  whiteSpace: "nowrap",
                }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

Table.displayName = "Table";
