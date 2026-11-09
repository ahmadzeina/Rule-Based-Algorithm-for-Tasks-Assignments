"use client";

import React from "react";
import { COLORS } from "@/lib/theme";

export type TagTone = "neutral" | "scope" | "started" | "completed" | "alert";

interface TagProps {
  variant?: TagTone;
  size?: "sm" | "md";
  children: React.ReactNode;
  title?: string;
}

const TONES: Record<TagTone, { bg: string; text: string }> = {
  neutral: { bg: COLORS.tint.neutral, text: COLORS.text.secondary },
  scope: { bg: COLORS.tint.scope, text: COLORS.accent.scope },
  started: { bg: COLORS.tint.started, text: COLORS.accent.started },
  completed: { bg: COLORS.tint.completed, text: COLORS.accent.completed },
  alert: { bg: COLORS.tint.alert, text: COLORS.accent.alert },
};

/**
 * Status pill from design.md §5A: 4px radius, 24px height (20px for sm),
 * subtle background tint derived from the status color.
 */
export function Tag({ variant = "neutral", size = "md", children, title }: TagProps) {
  const tone = TONES[variant];
  return (
    <span
      title={title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: size === "sm" ? 18 : 24,
        padding: size === "sm" ? "0 6px" : "0 8px",
        borderRadius: 4,
        backgroundColor: tone.bg,
        color: tone.text,
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  );
}

Tag.displayName = "Tag";
