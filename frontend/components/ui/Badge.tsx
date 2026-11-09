"use client";

import React from "react";
import { COLORS } from "@/lib/theme";
import type { TagTone } from "./Tag";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: TagTone;
  children: React.ReactNode;
}

const variantStyles: Record<TagTone, { bg: string; text: string }> = {
  neutral: { bg: COLORS.tint.neutral, text: COLORS.text.secondary },
  scope: { bg: COLORS.tint.scope, text: COLORS.accent.scope },
  started: { bg: COLORS.tint.started, text: COLORS.accent.started },
  completed: { bg: COLORS.tint.completed, text: COLORS.accent.completed },
  alert: { bg: COLORS.tint.alert, text: COLORS.accent.alert },
};

/** Status pill (design.md §5A) — 24px height, 4px radius, tinted bg. */
export const Badge: React.FC<BadgeProps> = ({ variant = "neutral", children, ...props }) => {
  const style = variantStyles[variant];
  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
        padding: "0 8px",
        height: "24px",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        borderRadius: "4px",
        fontSize: "12px",
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
      {...props}
    >
      {children}
    </span>
  );
};

Badge.displayName = "Badge";
