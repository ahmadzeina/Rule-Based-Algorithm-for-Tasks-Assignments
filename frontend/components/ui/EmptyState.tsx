"use client";

import React from "react";
import { COLORS, TYPOGRAPHY, SPACING } from "@/lib/theme";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: `${SPACING.xl} ${SPACING.md}`,
    }}
  >
    {icon && (
      <div style={{ color: COLORS.text.placeholder, marginBottom: SPACING.base }}>{icon}</div>
    )}
    <h3
      style={{
        color: COLORS.text.primary,
        marginBottom: SPACING.xs,
        fontSize: TYPOGRAPHY.body.fontSize,
        fontWeight: 500,
      }}
    >
      {title}
    </h3>
    {description && (
      <p
        style={{
          color: COLORS.text.secondary,
          marginBottom: SPACING.base,
          maxWidth: "400px",
          fontSize: TYPOGRAPHY.body.fontSize,
        }}
      >
        {description}
      </p>
    )}
    {action && (
      <Button onClick={action.onClick} variant="secondary" size="medium">
        {action.label}
      </Button>
    )}
  </div>
);

EmptyState.displayName = "EmptyState";
