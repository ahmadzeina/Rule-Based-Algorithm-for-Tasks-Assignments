"use client";

import React from "react";
import { COLORS, SIZES, RADIUS } from "@/lib/theme";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, hint, id, ...props }, ref) => {
    return (
      <div style={{ width: "100%", minWidth: 0 }}>
        {label && (
          <label
            htmlFor={id}
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "13px",
              fontWeight: 500,
              color: COLORS.text.secondary,
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          style={{
            width: "100%",
            backgroundColor: COLORS.background.panel,
            border: error ? `1px solid ${COLORS.accent.alert}` : `1px solid ${COLORS.border}`,
            borderRadius: RADIUS.md,
            padding: SIZES.inputPadding,
            fontSize: "13px",
            color: COLORS.text.primary,
          }}
          {...props}
        />
        {error && (
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: COLORS.accent.alert }}>
            {error}
          </p>
        )}
        {hint && !error && (
          <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: COLORS.text.secondary }}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
