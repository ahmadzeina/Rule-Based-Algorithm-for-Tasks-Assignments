"use client";

import React from "react";
import { COLORS, SPACING, RADIUS } from "@/lib/theme";

interface PanelProps {
  title?: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
  contentStyle?: React.CSSProperties;
}

/**
 * Structural container from design.md: no heavy backgrounds or shadows —
 * a transparent surface separated by a single 1px #2D3139 border.
 * Section headers are 13px medium secondary text.
 */
export function Panel({
  title,
  subtitle,
  actions,
  children,
  id,
  style,
  contentStyle,
}: PanelProps) {
  const hasHeader = Boolean(title || actions);
  return (
    <section
      id={id}
      style={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADIUS.lg,
        background: "rgba(255, 255, 255, 0.015)",
        padding: SPACING.md,
        ...style,
      }}
    >
      {hasHeader && (
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: SPACING.md,
            marginBottom: children || subtitle ? SPACING.base + 4 : 0,
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: "13px",
                  fontWeight: 500,
                  color: COLORS.text.secondary,
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  margin: 0,
                  marginTop: 2,
                  fontSize: "12px",
                  color: COLORS.text.placeholder,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div style={{ display: "flex", alignItems: "center", gap: SPACING.sm, flexShrink: 0 }}>
              {actions}
            </div>
          )}
        </header>
      )}
      {children && <div style={contentStyle}>{children}</div>}
    </section>
  );
}

Panel.displayName = "Panel";
