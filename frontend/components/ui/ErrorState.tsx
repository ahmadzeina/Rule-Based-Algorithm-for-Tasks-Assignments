"use client";

import React from "react";
import { COLORS, SPACING } from "@/lib/theme";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  details?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  action,
  details,
}) => (
  <div
    role="alert"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: `${SPACING.xl} ${SPACING.lg}`,
      textAlign: "center",
      backgroundColor: COLORS.tint.alert,
      border: `1px solid rgba(229, 115, 115, 0.35)`,
      borderRadius: 8,
    }}
  >
    <h3 style={{ color: COLORS.accent.alert, marginBottom: SPACING.xs, fontSize: "14px", fontWeight: 600 }}>
      {title}
    </h3>
    <p style={{ color: COLORS.text.secondary, margin: `0 0 ${SPACING.sm} 0`, maxWidth: 520 }}>
      {message}
    </p>
    {details && (
      <pre
        style={{
          backgroundColor: COLORS.background.main,
          color: COLORS.text.secondary,
          padding: SPACING.sm + 4,
          borderRadius: 6,
          fontSize: "11px",
          marginBottom: SPACING.base,
          maxWidth: "100%",
          overflowX: "auto",
          border: `1px solid ${COLORS.border}`,
          textAlign: "left",
        }}
      >
        {details}
      </pre>
    )}
    {action && (
      <Button onClick={action.onClick} variant="secondary" size="medium">
        {action.label}
      </Button>
    )}
  </div>
);

ErrorState.displayName = "ErrorState";
