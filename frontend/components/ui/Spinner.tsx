"use client";

import React from "react";
import { COLORS } from "@/lib/theme";

export const Spinner: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = COLORS.accent.scope,
}) => (
  <div
    role="status"
    aria-label="Loading"
    style={{
      display: "inline-block",
      width: `${size}px`,
      height: `${size}px`,
      border: `3px solid ${COLORS.border}`,
      borderTop: `3px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
    }}
  />
);

Spinner.displayName = "Spinner";
