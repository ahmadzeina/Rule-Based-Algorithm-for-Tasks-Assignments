"use client";

import React from "react";
import { COLORS } from "@/lib/theme";

const PALETTE: Array<{ bg: string; text: string }> = [
  { bg: COLORS.tint.scope, text: COLORS.accent.scope },
  { bg: COLORS.tint.started, text: COLORS.accent.started },
  { bg: COLORS.tint.completed, text: COLORS.accent.completed },
  { bg: COLORS.tint.alert, text: COLORS.accent.alert },
  { bg: COLORS.tint.neutral, text: COLORS.text.secondary },
];

function initials(id: string, name?: string): string {
  const source = (name && name.trim()) || id || "?";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface AvatarProps {
  id: string;
  name?: string;
  size?: number;
}

/** Tiny circular avatar with initials (16-20px inline per design.md §6). */
export function Avatar({ id, name, size = 20 }: AvatarProps) {
  const tone = PALETTE[hash(id + (name ?? "")) % PALETTE.length];
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: tone.bg,
        color: tone.text,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.max(8, Math.round(size * 0.42)),
        fontWeight: 600,
        lineHeight: 1,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {initials(id, name)}
    </span>
  );
}

/** Overlapping avatar group (-4px margin per design.md §6). */
export function AvatarGroup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {React.Children.toArray(children).map((child, i) => (
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -4, display: "flex" }}>
          {child}
        </div>
      ))}
    </div>
  );
}

Avatar.displayName = "Avatar";
AvatarGroup.displayName = "AvatarGroup";
