"use client";

import React from "react";
import { COLORS, SIZES, RADIUS } from "@/lib/theme";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  hint?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, label, hint, options = [], children, id, ...props }, ref) => {
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
        <select
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
            cursor: "pointer",
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
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

Select.displayName = "Select";
